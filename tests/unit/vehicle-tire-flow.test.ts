import { describe, expect, it } from 'vitest';
import { carModelByKey } from '../../src/data/cars';
import { publishedComparison, tireComparisonPairs } from '../../src/data/tire-comparisons';
import { tireSizeByNotation } from '../../src/data/tire-size-catalog';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { vehicleFlowText } from '../../src/content/vehicle-flow-text';
import { entityLocales } from '../../src/seo/entity-routes';
import { fitCheckHref, speedometerHref } from '../../src/ui/entity-page-model';
import { modelFlowSizes } from '../../src/ui/model-tire-flow';
import { GET as robots } from '../../src/pages/robots.txt';

const size = (notation: string) => tireSizeByNotation(notation)!;

describe('Vehicle → Tire → Compare → Calculator flow', () => {
  it('links every curated standard/option pair to its published comparison page', () => {
    for (const vehicle of vehicleFitmentData) {
      for (const option of vehicle.optionalTireSizes ?? []) {
        if (!tireSizeByNotation(vehicle.tireSize) || !tireSizeByNotation(option) || vehicle.tireSize === option) continue;
        expect(publishedComparison(size(vehicle.tireSize), size(option)), `${vehicle.id}`).toBeDefined();
      }
    }
  });

  it('never invents a comparison URL that is not published', () => {
    const published = new Set(tireComparisonPairs.map((pair) => pair.slug));
    const pair = publishedComparison(size('155/80R13'), size('325/30R21'));
    expect(pair).toBeUndefined();
    expect(published.size).toBe(tireComparisonPairs.length);
    expect(publishedComparison(size('205/55R16'), size('205/55R16'))).toBeUndefined();
  });

  it('hands both sizes to the speedometer and fit-check calculators in their own locale', () => {
    expect(speedometerHref('tr', size('195/65R15'), size('205/55R16'))).toBe('/tr/tools/kilometre-saati-sapma-hesaplama/?current=195-65-15&new=205-55-16');
    expect(speedometerHref('en', size('205/55R16'), size('225/45R17'))).toBe('/tools/speedometer-error-calculator/?current=205-55-16&new=225-45-17');
    expect(fitCheckHref('de', size('205/55R16'), size('225/45R17'))).toMatch(/^\/de\/tools\/[^?]+\/\?current=205-55-16&new=225-45-17$/);
  });

  it('lists curated sizes first with their role, then ANKUSI sizes as recorded', () => {
    const tiggo = modelFlowSizes(carModelByKey('chery', 'tiggo-7')!);
    expect(tiggo.length).toBeGreaterThan(1);
    expect(tiggo.every((entry) => entry.role === 'recorded')).toBe(true);
    const polo = modelFlowSizes(carModelByKey('volkswagen', 'polo')!);
    expect(polo[0]?.role).toBe('standard');
    expect(new Set(polo.map((entry) => entry.notation)).size).toBe(polo.length);
  });

  it('has complete flow copy in every entity locale', () => {
    for (const locale of entityLocales()) {
      const t = vehicleFlowText[locale];
      expect(t.recorded.length).toBeGreaterThan(2);
      expect(t.note).not.toMatch(/undefined/);
      expect(t.heading('X').length).toBeGreaterThan(3);
    }
  });
});

describe('crawl budget', () => {
  it('lets crawlers read the canonical of shared query URLs while advertising the sitemap', async () => {
    const text = await (robots as unknown as () => Response)().text();
    expect(text).not.toMatch(/Disallow: \/\*\?/);
    expect(text).toContain('Sitemap: https://atlasgarageos.com/sitemap.xml');
    expect(text).toMatch(/^Allow: \/$/m);
  });
});
