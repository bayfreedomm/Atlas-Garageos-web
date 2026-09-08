import { describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs?raw';
import favicon from '../../public/favicon.svg?raw';
import atlasMark from '../../public/atlas-mark.svg?raw';
import headers from '../../public/_headers?raw';
import manifestSource from '../../public/site.webmanifest?raw';
import redirects from '../../public/_redirects?raw';
import notFoundPage from '../../src/pages/404.astro?raw';

describe('production launch configuration', () => {
  it('uses the production apex origin and static output', () => {
    expect(config).toContain("site: 'https://atlasgarageos.com'");
    expect(config).toContain("output: 'static'");
    expect(config).not.toContain('localhost');
  });

  it('publishes a single root locale redirect', () => {
    expect(redirects.trim()).toBe('/ /en/ 302');
  });

  it('sets defensive static-site security headers without unsafe eval', () => {
    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    expect(headers).toContain('Permissions-Policy:');
    expect(headers).not.toContain('unsafe-eval');
  });

  it('gives content-addressed assets immutable caching', () => {
    expect(headers).toMatch(/\/_astro\/\*[\s\S]*max-age=31536000, immutable/);
  });

  it('keeps the 404 page non-indexable and provides recovery paths', () => {
    expect(notFoundPage).toContain('noindex,follow');
    expect(notFoundPage).toContain('/en/fitment-studio/');
    expect(notFoundPage).toContain('/en/tools/');
  });

  it('ships the final geometric brand mark without external assets', () => {
    const manifest = JSON.parse(manifestSource) as { start_url: string; icons: Array<{ src: string }> };
    expect(manifest.start_url).toBe('/en/');
    expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ src: '/atlas-mark.svg' })]));
    expect(atlasMark).toContain('M13 51 29.2 13.8');
    expect(favicon).toContain('M13 51 29.2 13.8');
    expect(atlasMark).not.toContain('<text');
  });
});
