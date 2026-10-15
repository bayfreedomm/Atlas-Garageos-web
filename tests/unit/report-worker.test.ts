import { describe, expect, it } from 'vitest';
import worker from '../../src/worker/index';

/** Minimal D1 stand-in that records every statement it is asked to run. */
function fakeDb() {
  const runs: { sql: string; args: unknown[] }[] = [];
  const db = {
    runs,
    exec: async () => ({}),
    prepare(sql: string) {
      let args: unknown[] = [];
      const statement = {
        bind(...values: unknown[]) { args = values; return statement; },
        async run() { runs.push({ sql, args }); return {}; },
        async first() { runs.push({ sql, args }); return /COUNT/.test(sql) ? { n: 0 } : null; },
        async all() { return { results: [] }; },
      };
      return statement;
    },
  };
  return db;
}

const assets = { fetch: async () => new Response('asset') };
const body = JSON.stringify({ email: 'a@example.com', path: '/tools/psi-bar-converter/', inputs: [], results: [], query: '', subscribe: false });

describe('report worker', () => {
  it('rejects report posts without a same-site Origin header', async () => {
    const env = { ASSETS: assets, DB: fakeDb(), RESEND_API_KEY: 'test' } as never;
    for (const headers of [{ 'content-type': 'application/json' }, { 'content-type': 'application/json', origin: 'https://evil.example' }]) {
      const response = await worker.fetch(new Request('https://atlasgarageos.com/api/report', { method: 'POST', headers, body }), env);
      expect(response.status).toBe(403);
    }
  });

  it('daily cron deletes 30-day-old send hashes and unconfirmed sign-ups without any request', async () => {
    const db = fakeDb();
    const pending: Promise<unknown>[] = [];
    await worker.scheduled({}, { ASSETS: assets, DB: db } as never, { waitUntil: (promise) => { pending.push(promise); } });
    await Promise.all(pending);
    const deletes = db.runs.filter((run) => run.sql.startsWith('DELETE'));
    expect(deletes.map((run) => run.sql)).toEqual([
      'DELETE FROM report_sends WHERE created_at < ?',
      "DELETE FROM subscribers WHERE status = 'pending' AND confirmed_at IS NULL AND consent_at < ?",
    ]);
    const cutoff = Date.parse(String(deletes[0]!.args[0]));
    expect(Math.abs(Date.now() - cutoff - 30 * 86_400_000)).toBeLessThan(60_000);
  });

  it('declares the daily cleanup trigger', async () => {
    const { readFileSync } = await import('node:fs');
    const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8')) as { triggers?: { crons?: string[] } };
    expect(config.triggers?.crons).toHaveLength(1);
  });
});
