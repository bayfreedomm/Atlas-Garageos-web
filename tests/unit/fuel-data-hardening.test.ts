import { describe, expect, it } from 'vitest';
import scheduledWorkflow from '../../.github/workflows/update-fuel-prices.yml?raw';
import germanyWorkflow from '../../.github/workflows/update-fuel-prices-germany.yml?raw';
import usMarketPage from '../../src/pages/gas-prices-today/index.astro?raw';
import deMarketPage from '../../src/pages/de/kraftstoffpreise/index.astro?raw';
import esMarketPage from '../../src/pages/es/precio-gasolina-hoy/index.astro?raw';
import { entityAlternates } from '../../src/seo/entity-routes';
// The production updater stays directly executable by Node in Actions; its exported pure
// seams are intentionally imported here so status/history behavior is tested without I/O.
import { mergeWithStatus, parseEiaPublicWeeklyTable, PROVIDERS, updateHistoryData } from '../../scripts/update-fuel-prices.mjs';
import updaterSource from '../../scripts/update-fuel-prices.mjs?raw';

const source = 'Test source';
const sourceUrl = 'https://example.com/fuel';
const attempt = '2026-09-21T12:00:00.000Z';
const products = [{ id: 'regular', label: 'Regular', valuePerLitre: 0.91, valuePerGallon: 3.44 }];

describe('fuel snapshot trust states', () => {
  it('keeps pending, fresh, and stale behavior distinct', () => {
    const pending = mergeWithStatus({ ok: false, products: [], source, sourceUrl, lastAttemptAt: attempt, note: 'offline' }, null);
    expect(pending).toMatchObject({ status: 'pending', products: [], lastSuccessAt: null });

    const fresh = mergeWithStatus({ ok: true, products, source, sourceUrl, lastAttemptAt: attempt, weekOf: '2026-09-14' }, null);
    expect(fresh).toMatchObject({ status: 'fresh', products, lastSuccessAt: attempt, weekOf: '2026-09-14' });

    const stale = mergeWithStatus(
      { ok: false, products: [], source, sourceUrl, lastAttemptAt: '2026-09-22T12:00:00.000Z', note: 'timeout', weekOf: null },
      fresh,
    );
    expect(stale).toMatchObject({ status: 'stale', products, lastSuccessAt: attempt, weekOf: '2026-09-14' });
  });

  it('does not create fake history after a failed fetch', () => {
    const history = { es: [], de: [], us: [{ weekOf: '2026-09-14', products: { regular: { perLitre: 0.91, perGallon: 3.44 } } }] };
    const output = {
      generatedAt: '2026-09-22T12:00:00.000Z',
      es: { status: 'pending', products: [] },
      de: { status: 'pending', products: [] },
      us: { status: 'stale', products, weekOf: '2026-09-14' },
    };
    expect(updateHistoryData(history, output, new Set(['us']))).toEqual(history);
  });

  it('deduplicates EIA history by published week', () => {
    const history = { es: [], de: [], us: [{ weekOf: '2026-09-14', products: { regular: { perLitre: 0.9, perGallon: 3.4 } } }] };
    const output = {
      generatedAt: '2026-09-22T12:00:00.000Z',
      es: { status: 'pending', products: [] },
      de: { status: 'pending', products: [] },
      us: { status: 'fresh', products, weekOf: '2026-09-14' },
    };
    expect(updateHistoryData(history, output, new Set(['us'])).us).toHaveLength(1);
    output.us.weekOf = '2026-09-21';
    expect(updateHistoryData(history, output, new Set(['us'])).us.map((row: { weekOf: string }) => row.weekOf)).toEqual(['2026-09-14', '2026-09-21']);
  });

  it('never overwrites an existing daily observation and never trims old history', () => {
    const es = Array.from({ length: 120 }, (_, index) => ({
      date: `2025-${String(Math.floor(index / 28) + 1).padStart(2, '0')}-${String(index % 28 + 1).padStart(2, '0')}`,
      products: { gasoline95: { perLitre: 1 + index / 100 } },
    }));
    const original = { date: '2026-09-22', products: { gasoline95: { perLitre: 1.49 } } };
    const history = { es: [...es, original], de: [], us: [] };
    const output = {
      generatedAt: '2026-09-22T20:00:00.000Z',
      es: { status: 'fresh', products: [{ id: 'gasoline95', valuePerLitre: 9.99 }] },
      de: { status: 'pending', products: [] },
      us: { status: 'pending', products: [] },
    };
    const updated = updateHistoryData(history, output, new Set(['es']));
    expect(updated.es).toHaveLength(121);
    expect(updated.es.find((row: { date: string }) => row.date === original.date)).toEqual(original);
  });

  it('keeps Germany explicitly described as a monitored sample', () => {
    expect(PROVIDERS.de.source).toContain('monitored sample');
    expect(PROVIDERS.de.source).toContain('not a national average');
    expect(deMarketPage).toContain('kein Bundesdurchschnitt');
  });
});

describe('fuel SEO and update delivery', () => {
  it('uses only published regular and diesel figures from the official public weekly tables', () => {
    const table = (name: string, value: string) => `<table><caption>${name}*(dollars per gallon)</caption><thead><tr><th>09/14/26</th><th>09/21/26</th></tr></thead><tbody><tr><td><a>U.S.</a></td><td>4.319</td><td>${value}</td></tr></tbody></table>`;
    const html = table('U.S. Regular Gasoline Prices', '4.478') + table('U.S. On-Highway Diesel Fuel Prices', '6.529');
    expect(parseEiaPublicWeeklyTable(html)).toEqual({ regular: 4.478, diesel: 6.529, weekOf: '2026-09-21' });
    expect(() => parseEiaPublicWeeklyTable(html.replace('09/21/26</th></tr></thead><tbody><tr><td><a>U.S.</a></td><td>4.319</td><td>6.529', '09/28/26</th></tr></thead><tbody><tr><td><a>U.S.</a></td><td>4.319</td><td>6.529'))).toThrow('different weeks');
  });
  it('allows the large official Spain response time and reports partial refresh failures', () => {
    expect(updaterSource).toContain('ES_FETCH_TIMEOUT_MS = 75_000');
    expect(updaterSource).toContain("output[id].status !== 'fresh'");
    expect(scheduledWorkflow).toContain('continue-on-error: true');
    expect(scheduledWorkflow).toContain('Verify both scheduled providers refreshed');
  });
  it('keeps each market canonical to itself without cross-market hreflang', () => {
    for (const [page, pathname] of [
      [usMarketPage, '/gas-prices-today/'],
      [deMarketPage, '/de/kraftstoffpreise/'],
      [esMarketPage, '/es/precio-gasolina-hoy/'],
    ]) {
      expect(page).toContain(`const pathname = '${pathname}'`);
      expect(page).toContain('const alternates: readonly [] = [];');
      expect(page).toContain('alternates={alternates}');
    }
    expect(entityAlternates('tire-size', '205-55-r16').map(({ hreflang }) => hreflang)).toEqual(['en', 'de', 'es', 'fr', 'it', 'pt-BR', 'pl', 'nl', 'tr', 'x-default']);
  });

  it('publishes fuel data automatically to the default branch with a backup branch', () => {
    for (const workflow of [scheduledWorkflow, germanyWorkflow]) {
      expect(workflow).not.toContain('gh pr create');
      expect(workflow).toContain('git push origin "HEAD:refs/heads/$BASE_BRANCH"');
      expect(workflow).toContain('git -C "$tmp" push origin "HEAD:refs/heads/fuel-data"');
      expect(workflow).toContain('--merge-history=/tmp/history-backup.json');
      expect(workflow).not.toMatch(/\bgit rebase\b/);
      expect(workflow).not.toMatch(/git push\s+--force(?:\s|$)/);
    }
  });
});
