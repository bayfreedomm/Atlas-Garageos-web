/**
 * Cloudflare Worker in front of the static site. Everything except /api/* is served straight
 * from the built assets (wrangler.jsonc: run_worker_first = ["/api/*"]).
 *
 *   POST /api/report        send the calculator report the visitor asked for; optionally add
 *                           them to the list as `pending` (double opt-in)
 *   GET|POST /api/confirm      GET shows a confirm button, POST confirms a pending subscription
 *   GET|POST /api/unsubscribe  GET shows a button, POST unsubscribes (also RFC 8058 one-click)
 *
 * Needs a D1 binding `DB` and the secret `RESEND_API_KEY`. Without them the endpoints answer
 * 503 and the page tells the visitor to use the PDF instead.
 *
 * Only `default` may be exported as a value: workerd treats every named export as an entrypoint
 * and refuses to start otherwise (caught by the local integration run).
 */
import { parseReportRequest, reportUrl } from '../features/lead-capture/report-request';
import { renderReportEmail, renderResultPage, type ResultPage } from '../features/lead-capture/report-email';
import { LOCALE_CODES, type AtlasLocale } from '../localization/locales';

interface D1Result<T> { readonly results: readonly T[] }
interface D1PreparedStatement {
  bind(...values: readonly unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
interface D1Database { prepare(query: string): D1PreparedStatement; exec(query: string): Promise<unknown> }
interface AssetFetcher { fetch(request: Request): Promise<Response> }
export interface Env {
  readonly ASSETS: AssetFetcher;
  readonly DB?: D1Database;
  readonly RESEND_API_KEY?: string;
  readonly REPORT_FROM?: string;
  /** Test-only override of the Resend endpoint (local integration test). */
  readonly RESEND_ENDPOINT?: string;
}

const ORIGIN = 'https://atlasgarageos.com';
const ALLOWED_ORIGINS = new Set([ORIGIN, 'https://www.atlasgarageos.com']);
const DEFAULT_FROM = 'Atlas GarageOS <rapor@atlasgarageos.com>';
const IP_LIMIT_PER_HOUR = 6;
const EMAIL_LIMIT_PER_DAY = 3;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  locale TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  token TEXT NOT NULL UNIQUE,
  source_tool TEXT,
  consent_at TEXT NOT NULL,
  confirmed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS report_sends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  tool TEXT NOT NULL,
  locale TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS report_sends_ip ON report_sends (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS report_sends_email ON report_sends (email_hash, created_at);
`.replace(/\n\s*/g, ' ').trim();

let schemaReady: Promise<unknown> | undefined;
const ensureSchema = (db: D1Database): Promise<unknown> => (schemaReady ??= db.exec(SCHEMA).catch((error: unknown) => { schemaReady = undefined; throw error; }));

const json = (status: number, body: Record<string, unknown>): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const html = (status: number, body: string): Response =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`atlas-report:${value}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const isLocale = (value: string | null | undefined): value is AtlasLocale => typeof value === "string" && (LOCALE_CODES as readonly string[]).includes(value);
const homeFor = (locale: AtlasLocale): string => (locale === 'en' ? `${ORIGIN}/` : `${ORIGIN}/${locale}/`);

/**
 * Retention: abuse-protection hashes and never-confirmed sign-ups are kept 30 days at most.
 * Runs on every report request and from the daily cron trigger (wrangler.jsonc), so the
 * 30-day promise in the privacy policy holds even when nobody sends a report for weeks.
 */
async function purgeExpired(db: D1Database, now: Date): Promise<void> {
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  await db.prepare('DELETE FROM report_sends WHERE created_at < ?').bind(monthAgo).run();
  await db.prepare("DELETE FROM subscribers WHERE status = 'pending' AND confirmed_at IS NULL AND consent_at < ?").bind(monthAgo).run();
}

interface SubscriberRow { readonly status: string; readonly token: string; readonly locale: string }

async function handleReport(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('origin');
  // Same-origin browser posts only (production domain, or the deployment's own preview host).
  // Browsers always send Origin on a POST fetch, so a request without it is a script, not a visitor.
  if (!origin || (!ALLOWED_ORIGINS.has(origin) && origin !== new URL(request.url).origin)) return json(403, { error: 'origin' });
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json(415, { error: 'content-type' });
  const raw = await request.text();
  if (raw.length > 12_000) return json(413, { error: 'too-large' });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json(400, { error: 'invalid-body' }); }
  const parsed = parseReportRequest(body);
  // Bots that fill the honeypot get a normal-looking answer and nothing is sent.
  if (!parsed.ok) return parsed.error === 'spam' ? json(200, { ok: true, confirmation: false }) : json(400, { error: parsed.error });
  const db = env.DB;
  if (!db || !env.RESEND_API_KEY) return json(503, { error: 'unavailable' });
  await ensureSchema(db);

  const report = parsed.value;
  const now = new Date();
  const iso = now.toISOString();
  const ipHash = await sha256(request.headers.get('cf-connecting-ip') ?? 'unknown');
  const emailHash = await sha256(report.email.toLowerCase());
  const hourAgo = new Date(now.getTime() - 3_600_000).toISOString();
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
  const byIp = await db.prepare('SELECT COUNT(*) AS n FROM report_sends WHERE ip_hash = ? AND created_at > ?').bind(ipHash, hourAgo).first<{ n: number }>();
  const byEmail = await db.prepare('SELECT COUNT(*) AS n FROM report_sends WHERE email_hash = ? AND created_at > ?').bind(emailHash, dayAgo).first<{ n: number }>();
  await purgeExpired(db, now);
  if ((byIp?.n ?? 0) >= IP_LIMIT_PER_HOUR || (byEmail?.n ?? 0) >= EMAIL_LIMIT_PER_DAY) return json(429, { error: 'rate' });

  let confirm: string | undefined;
  let unsubscribe: string | undefined;
  // One row per address regardless of letter case; the report still goes to the address as typed.
  const key = report.email.toLowerCase();
  const existing = await db.prepare('SELECT status, token, locale FROM subscribers WHERE email = ?').bind(key).first<SubscriberRow>();
  if (report.subscribe) {
    if (!existing) {
      const token = newToken();
      await db.prepare('INSERT INTO subscribers (email, locale, status, token, source_tool, consent_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(key, report.tool.locale, 'pending', token, report.tool.id, iso, iso, iso).run();
      confirm = `${ORIGIN}/api/confirm?token=${token}`;
      unsubscribe = `${ORIGIN}/api/unsubscribe?token=${token}`;
    } else if (existing.status === 'confirmed') {
      unsubscribe = `${ORIGIN}/api/unsubscribe?token=${existing.token}`;
    } else {
      const token = newToken();
      await db.prepare("UPDATE subscribers SET status = 'pending', token = ?, consent_at = ?, updated_at = ? WHERE email = ?").bind(token, iso, iso, key).run();
      confirm = `${ORIGIN}/api/confirm?token=${token}`;
      unsubscribe = `${ORIGIN}/api/unsubscribe?token=${token}`;
    }
  } else if (existing?.status === 'confirmed') {
    unsubscribe = `${ORIGIN}/api/unsubscribe?token=${existing.token}`;
  }

  const email = renderReportEmail(report, { report: reportUrl(ORIGIN, report), confirm, unsubscribe });
  const headers: Record<string, string> = {};
  if (unsubscribe) { headers['List-Unsubscribe'] = `<${unsubscribe}>`; headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'; }
  const sent = await fetch(env.RESEND_ENDPOINT ?? 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.REPORT_FROM ?? DEFAULT_FROM, to: [report.email], subject: email.subject, html: email.html, text: email.text, headers }),
  });
  if (!sent.ok) return json(502, { error: 'send' });
  await db.prepare('INSERT INTO report_sends (email_hash, ip_hash, tool, locale, created_at) VALUES (?, ?, ?, ?, ?)').bind(emailHash, ipHash, report.tool.id, report.tool.locale, iso).run();
  return json(200, { ok: true, confirmation: confirm !== undefined });
}

async function handleToken(request: Request, env: Env, action: 'confirm' | 'unsubscribe'): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const isPost = request.method === 'POST';
  const page = (locale: AtlasLocale, kind: ResultPage, status = 200): Response =>
    html(status, renderResultPage(locale, kind, homeFor(locale), `${ORIGIN}${url.pathname}?token=${encodeURIComponent(token)}`));
  if (!env.DB || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) return page('en', 'invalid', 404);
  await ensureSchema(env.DB);
  const row = await env.DB.prepare('SELECT status, token, locale FROM subscribers WHERE token = ?').bind(token).first<SubscriberRow>();
  if (!row) return page('en', 'invalid', 404);
  const locale = isLocale(row.locale) ? row.locale : 'en';
  // GET only shows a button; the change happens on POST (button or RFC 8058 one-click).
  if (!isPost) {
    if (action === 'confirm' && row.status === 'confirmed') return page(locale, 'confirmed');
    if (action === 'confirm' && row.status === 'unsubscribed') return page(locale, 'invalid', 404);
    if (action === 'unsubscribe' && row.status === 'unsubscribed') return page(locale, 'unsubscribed');
    return page(locale, action === 'confirm' ? 'ask-confirm' : 'ask-unsubscribe');
  }
  const iso = new Date().toISOString();
  if (action === 'confirm') {
    if (row.status === 'unsubscribed') return page(locale, 'invalid', 404);
    await env.DB.prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = COALESCE(confirmed_at, ?), updated_at = ? WHERE token = ?").bind(iso, iso, token).run();
    return page(locale, 'confirmed');
  }
  await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', updated_at = ? WHERE token = ?").bind(iso, token).run();
  return page(locale, 'unsubscribed');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/report') return request.method === 'POST' ? await handleReport(request, env) : json(405, { error: 'method' });
      if (pathname === '/api/confirm') return request.method === 'GET' || request.method === 'POST' ? await handleToken(request, env, 'confirm') : json(405, { error: 'method' });
      if (pathname === '/api/unsubscribe') return request.method === 'GET' || request.method === 'POST' ? await handleToken(request, env, 'unsubscribe') : json(405, { error: 'method' });
      if (pathname.startsWith('/api/')) return json(404, { error: 'not-found' });
    } catch {
      return json(500, { error: 'server' });
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_controller: unknown, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<void> {
    if (!env.DB) return;
    const db = env.DB;
    ctx.waitUntil(ensureSchema(db).then(() => purgeExpired(db, new Date())));
  },
};
