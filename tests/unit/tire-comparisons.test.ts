import { describe, expect, it } from 'vitest';
import { carModelsForTireSize, comparisonsForTireSize, tireComparisonBySlug, tireComparisonPairs } from '../../src/data/tire-comparisons';
import { tireSizeCatalog } from '../../src/data/tire-size-catalog';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { tireComparisonText } from '../../src/content/tire-comparison-text';
import { entityLocales } from '../../src/seo/entity-routes';
import { comparisonModel, tireComparisonMeta } from '../../src/ui/tire-comparison';

describe('tire-size comparison pairs', () => {
  it('publishes a bounded, unique, factory-backed set without colliding with size slugs', () => {
    expect(tireComparisonPairs.length).toBeGreaterThan(300);
    expect(tireComparisonPairs.length).toBeLessThan(1500);
    const slugs = tireComparisonPairs.map((pair) => pair.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const sizeSlugs = new Set(tireSizeCatalog.map((entry) => entry.slug));
    for (const pair of tireComparisonPairs) {
      expect(sizeSlugs.has(pair.slug)).toBe(false);
      expect(pair.slug).toBe(`${pair.a.slug}-vs-${pair.b.slug}`);
      expect(pair.a.notation).not.toBe(pair.b.notation);
      expect(pair.a.flotation ?? pair.b.flotation).toBeUndefined();
      expect(pair.a.rimDiameterInches).toBeLessThanOrEqual(pair.b.rimDiameterInches);
    }
  });

  it('pairs every curated vehicle’s standard size with each factory option', () => {
    for (const vehicle of vehicleFitmentData) {
      for (const option of vehicle.optionalTireSizes ?? []) {
        const found = comparisonsForTireSize(vehicle.tireSize).some((pair) => [pair.a.notation, pair.b.notation].includes(option));
        expect(found, `${vehicle.id}: ${vehicle.tireSize} vs ${option}`).toBe(true);
      }
    }
  });

  it('computes the classic 205/55R16 vs 225/45R17 plus-one comparison', () => {
    const pair = tireComparisonBySlug('205-55-r16-vs-225-45-r17');
    expect(pair).toBeDefined();
    const model = comparisonModel(pair!, 'en');
    expect(model.metricsA.overallDiameterMm).toBeCloseTo(631.9, 1);
    expect(model.metricsB.overallDiameterMm).toBeCloseTo(634.3, 1);
    expect(model.figures.larger).toBe('b');
    expect(model.figures.within3).toBe(true);
    expect(model.figures.speedShown).toBe('60');
    expect(model.figures.speedUnit).toBe('mph');
    expect(model.figures.speedTrue).toBe('60.2');
    const de = comparisonModel(pair!, 'de');
    expect(de.figures.a).toBe('205/55 R16');
    expect(de.figures.speedTrue).toBe('100,4');
    expect(tireComparisonMeta(pair!, 'tr').pathname).toBe('/tr/lastik-ebatlari/205-55-r16-vs-225-45-r17/');
  });

  it('has complete copy with short titles in every locale and never promises a safe fit', () => {
    const pair = tireComparisonBySlug('205-55-r16-vs-225-45-r17')!;
    for (const locale of entityLocales()) {
      const model = comparisonModel(pair, locale);
      const meta = tireComparisonMeta(pair, locale, model);
      expect(meta.title.length).toBeLessThanOrEqual(58);
      expect(meta.description.length).toBeLessThanOrEqual(180);
      const faqs = tireComparisonText[locale].faqs(model.figures);
      expect(faqs).toHaveLength(3);
      for (const faq of faqs) { expect(faq.q.length).toBeGreaterThan(10); expect(faq.a).not.toMatch(/undefined|NaN/); }
    }
  });

  it('keeps every comparison title within the 75-character audit limit including the site suffix', () => {
    for (const locale of entityLocales()) {
      for (const pair of tireComparisonPairs) {
        const title = `${tireComparisonMeta(pair, locale).title} — Atlas GarageOS`;
        expect(title.length, title).toBeLessThanOrEqual(75);
      }
    }
  });

  it('indexes ANKUSI models by the tire sizes their wheel records list', () => {
    const models = carModelsForTireSize('225/60R18');
    expect(models.some((model) => model.make === 'Chery' && model.model === 'Tiggo 7')).toBe(true);
  });
});
