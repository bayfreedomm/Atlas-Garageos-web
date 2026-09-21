import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8');
const config = JSON.parse(read('wrangler.jsonc')) as {
  name?: string;
  main?: string;
  compatibility_date?: string;
  assets?: { directory?: string; not_found_handling?: string; html_handling?: string };
};
const packageJson = JSON.parse(read('package.json')) as { devDependencies?: Record<string, string> };

describe('Cloudflare Workers static deployment contract', () => {
  it('defines one deterministic assets-only Worker config', () => {
    expect(config).toMatchObject({
      name: 'atlas-garageos-web',
      compatibility_date: '2026-09-21',
      assets: { directory: './dist', not_found_handling: '404-page', html_handling: 'auto-trailing-slash' },
    });
    expect(config.main).toBeUndefined();
  });

  it('pins Wrangler 4 exactly instead of relying on npx latest', () => {
    expect(packageJson.devDependencies?.wrangler).toBe('4.136.1');
  });

  it('keeps the existing fuel workflow split and rolling branch', () => {
    const scheduled = read('.github/workflows/update-fuel-prices.yml');
    const germany = read('.github/workflows/update-fuel-prices-germany.yml');
    expect(scheduled).toContain('automation/fuel-data');
    expect(scheduled).toContain('--providers=es,us');
    expect(scheduled).not.toContain('TANKERKOENIG_API_KEY');
    expect(germany).toContain('workflow_dispatch: {}');
    expect(germany).not.toMatch(/^\s{2}schedule:/m);
    expect(germany).toContain('--providers=de');
    expect(germany).toContain('secrets.TANKERKOENIG_API_KEY');
  });
});
