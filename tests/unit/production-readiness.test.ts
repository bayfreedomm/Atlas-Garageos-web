import { describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs?raw';
import favicon from '../../public/favicon.svg?raw';
import atlasMark from '../../public/atlas-mark.svg?raw';
import headers from '../../public/_headers?raw';
import manifestSource from '../../public/site.webmanifest?raw';
import redirects from '../../public/_redirects?raw';
import notFoundPage from '../../src/pages/404.astro?raw';
import { indexableRoutes } from '../../src/seo/tool-registry';

describe('production launch configuration', () => {
  it('uses the production apex origin and static output', () => {
    expect(config).toContain("site: 'https://atlasgarageos.com'");
    expect(config).toContain("output: 'static'");
    expect(config).not.toContain('localhost');
  });

  it('redirects every former English page directly to its root URL', () => {
    const rules = redirects.trim().split(/\r?\n/).map((line) => line.split(/\s+/));
    expect(rules).toContainEqual(['/en/', '/', '301']);
    expect(rules).toContainEqual(['/en/tools/', '/tools/', '301']);
    expect(rules).not.toContainEqual(['/', '/en/', '302']);
    expect(rules).toHaveLength(indexableRoutes.length);
    for (const destination of indexableRoutes) expect(rules).toContainEqual([`/en${destination}`, destination, '301']);
    expect(rules.every(([source, destination, code]) => source === `/en${destination}` && code === '301')).toBe(true);
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
    expect(notFoundPage).toContain('/fitment-studio/');
    expect(notFoundPage).toContain('/tools/');
  });

  it('ships the restrained Atlas monogram without external assets', () => {
    const manifest = JSON.parse(manifestSource) as { start_url: string; icons: Array<{ src: string }> };
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ src: '/atlas-mark.svg' })]));
    expect(atlasMark).toContain('aria-label="Atlas A monogram"');
    expect(atlasMark).toContain('M17 48 29 15h7l12 33');
    expect(favicon).toContain('M17 48 29 15h7l12 33');
    expect(atlasMark).toContain('#E1A15E');
    expect(atlasMark).not.toContain('<text');
  });
});
