import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mergeHistories } from '../../scripts/update-fuel-prices.mjs';

const workflowPaths = [
  '.github/workflows/update-fuel-prices.yml',
  '.github/workflows/update-fuel-prices-germany.yml',
] as const;

describe('automatic fuel-data publication', () => {
  for (const path of workflowPaths) {
    const source = readFileSync(path, 'utf8');

    it(`${path} restores the history backup before fetching`, () => {
      expect(source).toContain('git show origin/fuel-data:fuel-price-history.json > /tmp/history-backup.json');
      expect(source.indexOf('Restore history backup')).toBeLessThan(source.indexOf('scripts/update-fuel-prices.mjs'));
    });

    it(`${path} retries a rejected push by re-applying only the data files`, () => {
      expect(source).toContain('for attempt in 1 2 3; do');
      expect(source).toContain('git reset --hard "origin/$BASE_BRANCH"');
      expect(source).toContain('node scripts/merge-fuel-history.mjs src/data/fuel-price-history.json /tmp/fuel-price-history.json');
      expect(source).not.toMatch(/\bgit rebase\b/);
    });

    it(`${path} serializes writers`, () => {
      expect(source).toContain('group: ${{ github.repository }}-fuel-data-rolling-pr');
      expect(source).toContain('cancel-in-progress: false');
    });

    it(`${path} does not create empty fuel commits`, () => {
      expect(source).toContain('git diff --quiet -- src/data/fuel-prices.json src/data/fuel-price-history.json');
      expect(source).toContain('No price change — nothing to commit.');
    });
  }
});

describe('fuel history merge', () => {
  it('unions observations and keeps existing entries', () => {
    const base = { es: [{ date: '2026-09-22', products: { e5: 1.9 } }], de: [], us: [{ weekOf: '2026-09-21', products: {} }] };
    const extra = { es: [{ date: '2026-09-22', products: { e5: 9.9 } }, { date: '2026-09-15', products: { e5: 1.8 } }], de: [{ date: '2026-09-01', products: {} }], us: [{ weekOf: '2026-09-14', products: {} }] };
    const merged = mergeHistories(base, extra);
    expect(merged.es.map((entry: { date: string }) => entry.date)).toEqual(['2026-09-15', '2026-09-22']);
    expect(merged.es[1].products.e5).toBe(1.9);
    expect(merged.de).toHaveLength(1);
    expect(merged.us.map((entry: { weekOf: string }) => entry.weekOf)).toEqual(['2026-09-14', '2026-09-21']);
  });
});
