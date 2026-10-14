import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITEMAP_GROUP_IDS, renderSitemapGroupXml, renderSitemapIndexXml, sitemapEntries, sitemapGroups } from '../../src/seo/sitemap';
import { INDEXNOW_KEY } from '../../src/seo/indexnow';

describe('typed sitemap index', () => {
  it('splits every indexable URL into exactly one non-empty group under the 50,000 limit', () => {
    const groups = sitemapGroups();
    expect(groups.map((group) => group.id)).toEqual([...SITEMAP_GROUP_IDS]);
    const all = groups.flatMap((group) => group.urls);
    expect(new Set(all).size).toBe(all.length);
    expect(all).toEqual([...sitemapEntries()]);
    for (const group of groups) {
      expect(group.urls.length).toBeGreaterThan(0);
      expect(group.urls.length).toBeLessThanOrEqual(50_000);
    }
  });

  it('puts each page type in its own sitemap', () => {
    const byId = Object.fromEntries(sitemapGroups().map((group) => [group.id, new Set(group.urls)]));
    expect(byId['tire-sizes']!.has('https://atlasgarageos.com/tire-sizes/225-45-r17/')).toBe(true);
    expect(byId['tire-sizes']!.has('https://atlasgarageos.com/de/reifengroessen/')).toBe(true);
    expect(byId['tire-comparisons']!.has('https://atlasgarageos.com/tr/lastik-ebatlari/205-55-r16-vs-225-45-r17/')).toBe(true);
    expect([...byId['tire-sizes']!].some((url) => url.includes('-vs-'))).toBe(false);
    expect([...byId['tire-sizes']!].every((url) => !/bolt|lochkreis|bijon|birlos|entraxe|foratura|furacao|rozstaw|steekmat/.test(url))).toBe(true);
    expect(byId['bolt-patterns']!.has('https://atlasgarageos.com/bolt-patterns/')).toBe(true);
    expect(byId['cars-localized']!.has('https://atlasgarageos.com/tr/otomobil/')).toBe(true);
    expect(byId['car-years']!.has('https://atlasgarageos.com/cars/toyota/corolla/2005/')).toBe(true);
    expect(byId.cars!.has('https://atlasgarageos.com/cars/')).toBe(true);
    expect(byId.pages!.has('https://atlasgarageos.com/')).toBe(true);
    expect(byId['obd-codes']!.has('https://atlasgarageos.com/obd-codes/')).toBe(true);
  });

  it('renders a sitemap index pointing at every child sitemap', () => {
    const xml = renderSitemapIndexXml();
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const id of SITEMAP_GROUP_IDS) expect(xml).toContain(`<loc>https://atlasgarageos.com/sitemap-${id}.xml</loc>`);
    expect(renderSitemapGroupXml('obd-codes')).toContain('<loc>https://atlasgarageos.com/obd-codes/</loc>');
  });
});

describe('IndexNow', () => {
  it('serves the key as a public text file whose body is the key', () => {
    expect(INDEXNOW_KEY).toMatch(/^[0-9a-f]{32}$/);
    const file = new URL(`../../public/${INDEXNOW_KEY}.txt`, import.meta.url);
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, 'utf8').trim()).toBe(INDEXNOW_KEY);
  });
});
