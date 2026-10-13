import { describe, expect, it } from 'vitest';
import { tireSizeBySlug, tireSizeCatalog } from '../../src/data/tire-size-catalog';
import { entityLocales } from '../../src/seo/entity-routes';
import { isTireSizeIndexable, tireSizeIndexing } from '../../src/seo/index-policy';
import { sitemapEntries } from '../../src/seo/sitemap';

const size = (slug: string) => {
  const entry = tireSizeBySlug(slug);
  if (!entry) throw new Error(`missing ${slug}`);
  return entry;
};

describe('programmatic index policy', () => {
  it('keeps every English tire-size page indexable', () => {
    expect(tireSizeCatalog.every((entry) => isTireSizeIndexable(entry, 'en'))).toBe(true);
  });

  it('indexes documented and core passenger sizes in every language', () => {
    for (const locale of entityLocales()) {
      expect(isTireSizeIndexable(size('205-55-r16'), locale)).toBe(true); // documented OEM size
      expect(isTireSizeIndexable(size('185-60-r15'), locale)).toBe(true); // core band, no vehicle row
      expect(isTireSizeIndexable(size('195-65-r15'), locale)).toBe(true);
    }
  });

  it('serves localized reference-only sizes noindex with no hreflang', () => {
    const spare = size('125-70-r17');
    expect(isTireSizeIndexable(spare, 'en')).toBe(true);
    for (const locale of entityLocales().filter((code) => code !== 'en')) {
      const decision = tireSizeIndexing(spare, locale);
      expect(decision.indexable).toBe(false);
      expect(decision.hreflang).toHaveLength(0);
    }
    // The English page only names itself (and x-default) in its cluster.
    expect(tireSizeIndexing(spare, 'en').hreflang.map((alt) => alt.hreflang)).toEqual(['en', 'x-default']);
  });

  it('names only indexable siblings in an hreflang cluster', () => {
    const entries = new Set(sitemapEntries());
    for (const entry of tireSizeCatalog) {
      for (const alt of tireSizeIndexing(entry, 'en').hreflang) expect(entries.has(alt.href)).toBe(true);
    }
  });

  it('keeps noindex localized sizes out of the sitemap', () => {
    const entries = sitemapEntries();
    expect(entries).toContain('https://atlasgarageos.com/tire-sizes/125-70-r17/');
    expect(entries).not.toContain('https://atlasgarageos.com/tr/lastik-ebatlari/125-70-r17/');
    expect(entries).toContain('https://atlasgarageos.com/tr/lastik-ebatlari/205-55-r16/');
  });
});
