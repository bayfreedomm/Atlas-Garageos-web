import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8');
const config = JSON.parse(read('wrangler.jsonc')) as {
  name?: string;
  main?: string;
  compatibility_date?: string;
  assets?: { directory?: string; binding?: string; not_found_handling?: string; html_handling?: string; run_worker_first?: readonly string[] };
};
const packageJson = JSON.parse(read('package.json')) as { devDependencies?: Record<string, string> };

describe('Cloudflare Workers static deployment contract', () => {
  it('serves the Astro dist output and runs the Worker only for /api/*', () => {
    expect(config).toMatchObject({
      name: 'atlas-garageos-web',
      compatibility_date: '2026-09-21',
      main: './src/worker/index.ts',
      assets: { directory: './dist', binding: 'ASSETS', not_found_handling: '404-page', html_handling: 'auto-trailing-slash', run_worker_first: ['/api/*'] },
    });
    // Named value exports become Worker entrypoints and stop workerd from starting.
    const worker = read('src/worker/index.ts');
    expect(worker.match(/^export (?!default|interface|type)/gm)).toBeNull();
  });

  it('does not pin a just-published Wrangler into the project lockfile', () => {
    expect(packageJson.devDependencies?.wrangler).toBeUndefined();
    expect(read('pnpm-lock.yaml')).not.toContain('wrangler@4.136.1');
    expect(read('pnpm-lock.yaml')).not.toContain('workerd@1.20260921.1');
  });

  it('keeps the fuel workflow split and the fuel-data backup branch', () => {
    const scheduled = read('.github/workflows/update-fuel-prices.yml');
    const germany = read('.github/workflows/update-fuel-prices-germany.yml');
    expect(scheduled).toContain('refs/heads/fuel-data');
    expect(scheduled).toContain('--providers=es,us');
    expect(scheduled).not.toContain('TANKERKOENIG_API_KEY');
    expect(germany).toContain('workflow_dispatch: {}');
    expect(germany).not.toMatch(/^\s{2}schedule:/m);
    expect(germany).toContain('--providers=de');
    expect(germany).toContain('secrets.TANKERKOENIG_API_KEY');
  });
});
