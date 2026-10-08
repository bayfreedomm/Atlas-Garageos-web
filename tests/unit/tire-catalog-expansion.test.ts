import { describe, expect, it } from 'vitest';
import { parseTireNotation, tireSizeBySlug, tireSizeCatalog, tireSizeSlug } from '../../src/data/tire-size-catalog';
import { PRODUCTION_FLOTATION_TIRE_SIZES, productionTireSizeNotations } from '../../src/data/production-tire-sizes';
import {
  metricEquivalents, sameRimNeighbours, tireDiameterGroupFor, tireDiameterGroupHighlights, tireDiameterGroupMeta,
  tireDiameterGroupPath, tireDiameterGroupSlug, tireDiameterGroups, tireSizeDetailMeta, tireSizeMetrics,
  TIRE_DIAMETER_GROUP_MIN_SIZES,
} from '../../src/ui/entity-page-model';
import { sitemapEntries } from '../../src/seo/sitemap';
import { tireSizeShortcuts } from '../../src/ui/reference-links';

const entry = (notation: string) => {
  const found = tireSizeCatalog.find((candidate) => candidate.notation === notation);
  if (!found) throw new Error(`missing ${notation}`);
  return found;
};

describe('expanded tire-size catalog', () => {
  it('publishes the full reference, including small, half-inch and truck rims', () => {
    expect(tireSizeCatalog.length).toBeGreaterThanOrEqual(950);
    for (const notation of ['145/70R13', '165/70R10', '125/80R13', '215/85R16.5', '245/70R19.5', '315/80R22.5', '355/25R22', '265/80R16']) {
      expect(tireSizeCatalog.some((candidate) => candidate.notation === notation), notation).toBe(true);
    }
    expect(tireSizeSlug('315/80R22.5')).toBe('315-80-r22-5');
  });

  it('keeps every reference notation unique and parseable', () => {
    const notations = productionTireSizeNotations();
    expect(new Set(notations).size).toBe(notations.length);
    for (const notation of notations) expect(parseTireNotation(notation), notation).not.toBeNull();
    const slugs = tireSizeCatalog.map((candidate) => candidate.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('high-flotation sizes', () => {
  it('parses flotation notation from the stated inches', () => {
    expect(parseTireNotation('33x12.50R15')).toMatchObject({ rimDiameterInches: 15, flotation: { overallDiameterIn: 33, sectionWidthIn: 12.5 } });
    expect(parseTireNotation('15x33.00R33')).toBeNull();
    expect(tireSizeSlug('33x12.50R15')).toBe('33x12-50-r15');
    expect(tireSizeBySlug('35x12-50-r20')?.notation).toBe('35x12.50R20');
  });

  it('publishes every listed flotation size', () => {
    for (const notation of PRODUCTION_FLOTATION_TIRE_SIZES) expect(tireSizeCatalog.some((candidate) => candidate.notation === notation), notation).toBe(true);
  });

  it('takes height and width directly from the notation', () => {
    const metrics = tireSizeMetrics(entry('33x12.50R15'));
    expect(metrics.overallDiameterMm).toBeCloseTo(838.2, 1);
    expect(metrics.sectionWidthMm).toBeCloseTo(317.5, 1);
    expect(metrics.sidewallHeightMm).toBeCloseTo(228.6, 1);
  });

  it('lists close metric equivalents on the same rim and flotation-only neighbours', () => {
    const equivalents = metricEquivalents(entry('33x12.50R20'));
    expect(equivalents.length).toBeGreaterThan(0);
    for (const candidate of equivalents) {
      expect(candidate.flotation).toBeUndefined();
      expect(candidate.rimDiameterInches).toBe(20);
    }
    for (const neighbour of sameRimNeighbours(entry('35x12.50R20'))) expect(neighbour.flotation).toBeDefined();
  });

  it('titles a flotation page around its metric meaning', () => {
    expect(tireSizeDetailMeta(entry('31x10.50R15'), 'en').title).toContain('Metric Equivalent');
    expect(tireSizeDetailMeta(entry('31x10.50R15'), 'es').title).toContain('31x10.50 R15');
  });
});

describe('tire-height group pages', () => {
  it('groups by rounded overall diameter with a minimum size count', () => {
    const groups = tireDiameterGroups();
    expect(groups.length).toBeGreaterThanOrEqual(12);
    for (const group of groups) {
      expect(group.members.length).toBeGreaterThanOrEqual(TIRE_DIAMETER_GROUP_MIN_SIZES);
      for (const member of group.members) expect(Math.round(member.diameterIn)).toBe(group.inches);
    }
  });

  it('puts 285/75R16 and 33x12.50R15 on the 33-inch page', () => {
    const group = tireDiameterGroups().find((candidate) => candidate.inches === 33)!;
    const notations = group.members.map((member) => member.entry.notation);
    expect(notations).toContain('285/75R16');
    expect(notations).toContain('33x12.50R15');
    expect(tireDiameterGroupFor(entry('285/75R16'))?.inches).toBe(33);
    expect(tireDiameterGroupHighlights(group).length).toBeGreaterThan(3);
  });

  it('localizes group URLs and keeps hreflang reciprocal', () => {
    expect(tireDiameterGroupSlug(33, 'en')).toBe('33-inch');
    expect(tireDiameterGroupPath(33, 'de')).toBe('/de/reifengroessen/33-zoll/');
    expect(tireDiameterGroupPath(33, 'es')).toBe('/es/medidas-neumaticos/33-pulgadas/');
    const group = tireDiameterGroups().find((candidate) => candidate.inches === 33)!;
    for (const locale of ['en', 'de', 'es', 'fr'] as const) {
      const meta = tireDiameterGroupMeta(group, locale);
      expect(meta.alternates.map((alt) => alt.href)).toContain(`https://atlasgarageos.com${meta.pathname}`);
      expect(`${meta.title} — Atlas GarageOS`.length).toBeLessThanOrEqual(75);
    }
  });

  it('lists every group page in the sitemap and in the shortcuts', () => {
    const urls = new Set(sitemapEntries());
    for (const group of tireDiameterGroups()) {
      for (const locale of ['en', 'de', 'es', 'fr'] as const) expect(urls.has(`https://atlasgarageos.com${tireDiameterGroupPath(group.inches, locale)}`)).toBe(true);
    }
    expect(tireSizeShortcuts('en').some((shortcut) => shortcut.href === '/tire-sizes/33-inch/')).toBe(true);
  });
});

describe('search-intent titles', () => {
  it('answers "in inches" in English and "pulgadas" in Spanish within the length budget', () => {
    expect(tireSizeDetailMeta(entry('265/80R16'), 'en').title).toMatch(/^265\/80R16 Tire Size in Inches: \d+\.\d″ × \d+\.\d″$/);
    expect(tireSizeDetailMeta(entry('265/80R16'), 'es').title).toContain('en pulgadas');
    for (const candidate of tireSizeCatalog) {
      for (const locale of ['en', 'de', 'es', 'fr'] as const) {
        const meta = tireSizeDetailMeta(candidate, locale);
        // The audit measures the raw HTML title, where '&' is written as '&amp;'.
        expect(`${meta.title} — Atlas GarageOS`.replace(/&/g, '&amp;').length, `${candidate.notation} ${locale}`).toBeLessThanOrEqual(75);
        expect(meta.description.length, `${candidate.notation} ${locale}`).toBeLessThanOrEqual(180);
      }
    }
  });
});

describe('French reference families', () => {
  it('publishes French tire and bolt URLs with French copy and reciprocal hreflang', () => {
    const entry = tireSizeCatalog.find((candidate) => candidate.notation === '205/55R16')!;
    const fr = tireSizeDetailMeta(entry, 'fr');
    expect(fr.pathname).toBe('/fr/dimensions-pneus/205-55-r16/');
    expect(fr.title).toContain('Pneu 205/55 R16');
    expect(fr.title).toContain('631,9 mm');
    const en = tireSizeDetailMeta(entry, 'en');
    expect(en.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'de', 'es', 'fr', 'x-default']);
    expect(tireDiameterGroupPath(25, 'fr')).toBe('/fr/dimensions-pneus/25-pouces/');
    const urls = new Set(sitemapEntries());
    expect(urls.has('https://atlasgarageos.com/fr/')).toBe(true);
    expect(urls.has('https://atlasgarageos.com/fr/entraxes/5x112/')).toBe(true);
  });
});
