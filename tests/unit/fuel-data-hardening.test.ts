import { describe, expect, it } from 'vitest';
import scheduledWorkflow from '../../.github/workflows/update-fuel-prices.yml?raw';
import germanyWorkflow from '../../.github/workflows/update-fuel-prices-germany.yml?raw';
import usMarketPage from '../../src/pages/gas-prices-today/index.astro?raw';
import deMarketPage from '../../src/pages/de/kraftstoffpreise/index.astro?raw';
import esMarketPage from '../../src/pages/es/precio-gasolina-hoy/index.astro?raw';
import { entityAlternates } from '../../src/seo/entity-routes';
// The production updater stays directly executable by Node in Actions; its exported pure
// seams are intentionally imported here so status/history behavior is tested without I/O.
import { mergeWithStatus, PROVIDERS, updateHistoryData } from '../../scripts/update-fuel-prices.mjs';

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

  it('keeps Germany explicitly described as a monitored sample', () => {
    expect(PROVIDERS.de.source).toContain('monitored sample');
    expect(PROVIDERS.de.source).toContain('not a national average');
    expect(deMarketPage).toContain('kein Bundesdurchschnitt');
  });
});

describe('fuel SEO and update delivery', () => {
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
    expect(entityAlternates('tire-size', '205-55-r16').map(({ hreflang }) => hreflang)).toEqual(['en', 'de', 'es', 'x-default']);
  });

  it('publishes data through one rolling PR instead of pushing the development branch', () => {
    for (const workflow of [scheduledWorkflow, germanyWorkflow]) {
      expect(workflow).toContain('pull-requests: write');
      expect(workflow).toContain('FUEL_BRANCH: automation/fuel-data');
      expect(workflow).toContain('gh pr create');
      expect(workflow).toContain('git push --force-with-lease="refs/heads/$FUEL_BRANCH:$EXPECTED_REMOTE_SHA"');
      expect(workflow).toContain('--set-upstream origin "HEAD:refs/heads/$FUEL_BRANCH"');
      expect(workflow).not.toMatch(/\bgit rebase\b/);
      expect(workflow).not.toMatch(/git push\s*$/m);
    }
  });
});
