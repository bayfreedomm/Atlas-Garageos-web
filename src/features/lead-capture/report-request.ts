/**
 * Validation for "email me this report" requests. Pure TypeScript: the Cloudflare worker
 * (src/worker/index.ts) and the browser form share it, so both reject the same input.
 *
 * The request can only point at one of our own calculator routes and carries short input
 * values, never free text, so the endpoint cannot be used to send arbitrary content to anyone.
 */
import { LOCALE_CODES, localizedToolPath, type AtlasLocale } from '../../localization/locales';
import { localizedTool } from '../../localization/site-catalog';
import { toolRegistry, type ToolId } from '../../seo/tool-registry';
import { isReportLine, MAX_LINES } from './report-lines';

export interface ReportTool { readonly id: ToolId; readonly locale: AtlasLocale; readonly title: string; readonly path: string }

import type { ReportLine } from './report-lines';

export type { ReportLine };

export interface ReportRequest {
  readonly email: string;
  readonly tool: ReportTool;
  readonly inputs: readonly ReportLine[];
  readonly results: readonly ReportLine[];
  /** Query string that reopens the calculator in this state (shareable-state format). */
  readonly query: string;
  readonly subscribe: boolean;
}

export type ReportRequestError = 'invalid-email' | 'invalid-tool' | 'invalid-values' | 'spam' | 'invalid-body';
export type ParsedReportRequest = { readonly ok: true; readonly value: ReportRequest } | { readonly ok: false; readonly error: ReportRequestError };

const TOOL_KINDS = new Set(['tool', 'flagship']);
let toolsByPath: ReadonlyMap<string, ReportTool> | undefined;

/** Every published calculator route in every locale, keyed by its path. */
export function reportTools(): ReadonlyMap<string, ReportTool> {
  if (toolsByPath) return toolsByPath;
  const map = new Map<string, ReportTool>();
  for (const definition of toolRegistry) {
    if (!('kind' in definition) || !TOOL_KINDS.has(definition.kind)) continue;
    const id = definition.id as ToolId;
    for (const locale of LOCALE_CODES) {
      const path = localizedToolPath(locale, id, definition.kind as 'tool' | 'flagship');
      const title = locale === 'en' ? definition.title : localizedTool(id, locale).title;
      map.set(path, Object.freeze({ id, locale, title, path }));
    }
  }
  toolsByPath = map;
  return map;
}

const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const VALUE_KEY = /^[A-Za-z][A-Za-z0-9_-]{0,40}$/;
const VALUE = /^[\p{L}\p{N} .,/+_%-]{0,32}$/u;
const MAX_VALUES = 40;
function parseLines(raw: unknown): readonly ReportLine[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > MAX_LINES) return null;
  const lines: ReportLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const { label, value } = item as Record<string, unknown>;
    if (typeof label !== 'string' || typeof value !== 'string') return null;
    if (!isReportLine(label, value)) return null;
    lines.push(Object.freeze({ label: label.replace(/\s+/g, ' ').trim(), value: value.replace(/\s+/g, ' ').trim() }));
  }
  return Object.freeze(lines);
}

/** Lower-cases the domain, keeps the local part, rejects anything that is not a plain address. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim();
  if (email.length > 254 || !EMAIL.test(email)) return null;
  const at = email.lastIndexOf('@');
  return `${email.slice(0, at)}@${email.slice(at + 1).toLowerCase()}`;
}

export function parseReportRequest(body: unknown): ParsedReportRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'invalid-body' };
  const input = body as Record<string, unknown>;
  // Honeypot: a field people never see. Bots that fill every input are dropped silently.
  if (typeof input.company === 'string' && input.company.trim() !== '') return { ok: false, error: 'spam' };
  const email = normalizeEmail(input.email);
  if (!email) return { ok: false, error: 'invalid-email' };
  const path = typeof input.path === 'string' ? input.path : '';
  const tool = reportTools().get(path);
  if (!tool) return { ok: false, error: 'invalid-tool' };
  const inputs = parseLines(input.inputs);
  const results = parseLines(input.results);
  if (!inputs || !results) return { ok: false, error: 'invalid-values' };
  const query = parseReopenQuery(input.query);
  if (query === null) return { ok: false, error: 'invalid-values' };
  return { ok: true, value: Object.freeze({ email, tool, inputs, results, query, subscribe: input.subscribe === true }) };
}

const QUERY_KEYS = new Set(['tool', 'state', 'current', 'new', 'size', 'ow', 'oe', 'nw', 'ne', 'lugs', 'spacing', 'vehicle', 'a', 'b']);

/** Accepts only the calculator state parameters our pages read; returns a normalized query or null. */
export function parseReopenQuery(raw: unknown): string | null {
  if (raw === undefined || raw === '') return '';
  if (typeof raw !== 'string' || raw.length > 2500) return null;
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  const out = new URLSearchParams();
  for (const [key, value] of params) {
    if (!QUERY_KEYS.has(key)) return null;
    if (key === 'state') {
      try {
        const state: unknown = JSON.parse(value);
        if (!state || typeof state !== 'object' || Array.isArray(state)) return null;
        const entries = Object.entries(state as Record<string, unknown>);
        if (entries.length > MAX_VALUES || entries.some(([k, v]) => !VALUE_KEY.test(k) || typeof v !== 'string' || !VALUE.test(v))) return null;
      } catch { return null; }
    } else if (!/^[A-Za-z0-9._-]{0,80}$/.test(value)) return null;
    out.append(key, value);
  }
  return out.toString();
}

/** The calculator URL that reopens this exact state. */
export function reportUrl(origin: string, request: ReportRequest): string {
  return `${origin}${request.tool.path}${request.query ? `?${request.query}` : ''}`;
}
