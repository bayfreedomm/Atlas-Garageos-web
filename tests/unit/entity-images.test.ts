import { describe, expect, it } from 'vitest';
import { boltPatternCatalog } from '../../src/data/bolt-pattern-catalog';
import { tireComparisonPairs } from '../../src/data/tire-comparisons';
import { tireSizeCatalog } from '../../src/data/tire-size-catalog';
import { ENTITY_IMAGE_HEIGHT, ENTITY_IMAGE_WIDTH, boltPatternImage, boltPatternImageSvg, tireComparisonImage, tireComparisonImageSvg, tireSizeImage, tireSizeImageSvg } from '../../src/seo/entity-images';
import siteLayout from '../../src/components/SiteLayout.astro?raw';

describe('entity images', () => {
  it('gives every entity one shared file for all locales, sized for social cards', () => {
    const tire = tireSizeCatalog.find((entry) => entry.slug === '205-55-r16')!;
    expect(tireSizeImage(tire, 'en').src).toBe('/img/tire/205-55-r16.png');
    expect(tireSizeImage(tire, 'tr').src).toBe(tireSizeImage(tire, 'de').src);
    expect(tireSizeImage(tire, 'tr').alt).toContain('205/55 R16');
    expect([ENTITY_IMAGE_WIDTH, ENTITY_IMAGE_HEIGHT]).toEqual([1200, 630]);
    const pcd = boltPatternCatalog.find((entry) => entry.notation === '4x108')!;
    expect(boltPatternImage(pcd, 'fr').src).toBe(`/img/pcd/${pcd.slug}.png`);
    expect(tireComparisonImage(tireComparisonPairs[0]!, 'pl').src).toBe(`/img/compare/${tireComparisonPairs[0]!.slug}.png`);
  });

  it('draws every catalog entry without invalid numbers', () => {
    const svgs = [...tireSizeCatalog.map(tireSizeImageSvg), ...tireComparisonPairs.map(tireComparisonImageSvg), ...boltPatternCatalog.map(boltPatternImageSvg)];
    for (const svg of svgs) {
      expect(svg).toMatch(/^<svg xmlns/);
      expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it('allows large image previews and wires the page image into social and structured data', () => {
    expect(siteLayout).toContain('max-image-preview:large');
    expect(siteLayout).toContain('primaryImageOfPage');
    expect(siteLayout).toContain('twitter:image');
  });
});
