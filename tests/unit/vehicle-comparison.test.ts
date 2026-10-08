import { describe, expect, it } from 'vitest';
import { vehicleFitmentData, type VehicleFitment } from '../../src/data/vehicle-fitment';
import { sitemapEntries } from '../../src/seo/sitemap';
import { compareVehicleIds, comparisonPath, vehicleComparisonHref, vehicleTripHref } from '../../src/ui/vehicle-comparison';
import { tripVehicleForId } from '../../src/ui/vehicle-trip-context';
import fuelFieldsSource from '../../src/components/FuelFields.astro?raw';

describe('vehicle comparison model', () => {
  it('compares only supported fitment fields and derived tire geometry', () => {
    const result = compareVehicleIds('toyota-corolla', 'ford-f150', 'en');
    expect(result.status).toBe('ready');
    expect(result.rows.map(({ id }) => id)).toEqual([
      'market', 'generation', 'tire', 'width', 'sidewall', 'diameter', 'circumference', 'wheel', 'pcd', 'lugs', 'bore', 'fastener', 'torque',
    ]);
    expect(result.summaries.join(' ')).toMatch(/wider reference tire/i);
    expect(result.summaries.join(' ')).toMatch(/different PCDs/i);
    expect(result.diameterDifferencePercent).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toMatch(/horsepower|acceleration|reliability|cargo/i);
  });

  it('rejects the same vehicle and invalid IDs', () => {
    expect(compareVehicleIds('toyota-corolla', 'toyota-corolla', 'en').status).toBe('same');
    expect(compareVehicleIds('not-a-vehicle', 'toyota-corolla', 'en').status).toBe('invalid');
    expect(compareVehicleIds(null, 'toyota-corolla', 'en').status).toBe('incomplete');
  });

  it('normalizes reversed pairs to one deterministic order and URL', () => {
    const forward = compareVehicleIds('ford-f150', 'toyota-corolla', 'en');
    const reverse = compareVehicleIds('toyota-corolla', 'ford-f150', 'en');
    expect(forward.canonicalIds).toEqual(reverse.canonicalIds);
    expect(vehicleComparisonHref('en', 'ford-f150', 'toyota-corolla')).toBe(vehicleComparisonHref('en', 'toyota-corolla', 'ford-f150'));
  });

  it('handles missing optional data without inventing a value', () => {
    const base = vehicleFitmentData.find(({ id }) => id === 'honda-crv')!;
    const { centerBoreMm: _centerBore, torqueNm: _torqueNm, torqueLbFt: _torqueLbFt, torqueTrust: _torqueTrust, ...required } = base;
    const noOptional: VehicleFitment = { ...required, id: 'missing-optionals' };
    const other = vehicleFitmentData.find(({ id }) => id === 'toyota-corolla')!;
    const result = compareVehicleIds(noOptional.id, other.id, 'en', [noOptional, other]);
    expect(result.rows.find(({ id }) => id === 'bore')).toMatchObject({ a: 'Not documented' });
    expect(result.rows.find(({ id }) => id === 'torque')).toMatchObject({ a: '—' });
  });

  it('keeps low-confidence torque visibly qualified', () => {
    const audi = vehicleFitmentData.find(({ id }) => id === 'audi-a3')!;
    const low: VehicleFitment = { ...audi, id: 'extrapolated-row', torqueTrust: { confidence: 'low', evidence: 'extrapolated' } };
    const other = vehicleFitmentData.find(({ id }) => id === 'vw-tiguan')!;
    const result = compareVehicleIds(low.id, other.id, 'de', [low, other]);
    const row = result.rows.find(({ id }) => id === 'torque')!;
    const lowSide = result.vehicleA?.id === low.id ? row.aNote : row.bNote;
    expect(lowSide).toMatch(/Übertragener Referenzwert/);
  });

  it('provides localized routes and copy from one shared implementation', () => {
    expect(comparisonPath('en')).toBe('/vehicles/compare/');
    expect(comparisonPath('de')).toBe('/de/fahrzeuge/vergleichen/');
    expect(comparisonPath('es')).toBe('/es/vehiculos/comparar/');
    expect(compareVehicleIds('vw-golf', 'audi-a3', 'de').summaries.join(' ')).toMatch(/Lochkreis|Referenzreifen/);
    expect(compareVehicleIds('vw-golf', 'audi-a3', 'es').summaries.join(' ')).toMatch(/PCD|neumático/);
  });
});

describe('vehicle-aware trip hand-off and SEO scope', () => {
  it('carries identity without consumption and rejects cross-market or invalid IDs', () => {
    expect(vehicleTripHref('en', 'toyota-corolla')).toBe('/tools/road-trip-cost-calculator/?vehicle=toyota-corolla');
    expect(tripVehicleForId('toyota-corolla', 'en')?.id).toBe('toyota-corolla');
    expect(tripVehicleForId('vw-golf', 'en')).toBeUndefined();
    expect(tripVehicleForId('missing', 'de')).toBeUndefined();
  });

  it('keeps an explicitly pending market price blank instead of using the generic example', () => {
    expect(fuelFieldsSource).toContain("hasOwnProperty.call(Astro.props, 'price')");
  });

  it('indexes only three comparison hubs, not pair or vehicle-specific trip pages', () => {
    const entries = sitemapEntries();
    expect(entries.filter((url) => /\/(compare|vergleichen|comparar)\/$/.test(url))).toHaveLength(3);
    expect(entries.some((url) => /[?&](a|b|vehicle)=/.test(url))).toBe(false);
  });
});
