import { describe, expect, it } from 'vitest';
import {
  buildTireSizeCatalog, excludedTireSizes, parseTireNotation, tireGeometryProblem,
  tireSizeCatalog, tireSizeSlug, vehiclesForTireSize,
} from '../../src/data/tire-size-catalog';
import {
  adjacentHoleSpacingMm, boltPatternCatalog, boltPatternSlug, buildBoltPatternCatalog,
  excludedBoltPatterns, parseBoltPattern, vehiclesForBoltPattern,
} from '../../src/data/bolt-pattern-catalog';
import { entityAlternates, entityDetailPath, entityHubPath, entityLocales } from '../../src/seo/entity-routes';
import { similarTireSizes, tireSizeMetrics } from '../../src/ui/entity-page-model';
import { vehicleFitmentData, type VehicleFitment } from '../../src/data/vehicle-fitment';
import { sitemapEntries } from '../../src/seo/sitemap';

/** A syntactically complete vehicle row, so a test can vary exactly one field. */
const fakeVehicle = (overrides: Partial<VehicleFitment>): VehicleFitment => ({
  id: 'test-vehicle', make: 'Test', model: 'Car', generation: '2024', market: 'eu',
  tireSize: '205/55R16', boltPattern: '5x112', lugCount: 5, spacingMm: 112,
  wheelSize: '7Jx16', fastenerType: 'wheel-bolt', confidence: 'low', sources: ['test'],
  ...overrides,
});

describe('tire-size catalog', () => {
  it('pins the slug convention for a whole-inch rim', () => {
    expect(tireSizeSlug('205/55R16')).toBe('205-55-r16');
    expect(tireSizeSlug('225/45R18')).toBe('225-45-r18');
    expect(tireSizeSlug('275/65R18')).toBe('275-65-r18');
  });

  it('keeps a half-inch rim unambiguous in the slug', () => {
    expect(tireSizeSlug('215/75R17.5')).toBe('215-75-r17-5');
    expect(parseTireNotation('215/75R17.5')).toEqual({ widthMm: 215, aspectRatio: 75, rimDiameterInches: 17.5 });
  });

  it('rejects anything that is not {width}/{aspect}R{rim}', () => {
    for (const bad of ['205-55-16', '205/55/16', 'P205/55R16', '205/55 R16', '', '205/55R']) {
      expect(parseTireNotation(bad)).toBeNull();
    }
  });

  it('derives exactly the unique tire sizes present in the vehicle dataset', () => {
    const unique = new Set(vehicleFitmentData.map((vehicle) => vehicle.tireSize));
    expect(tireSizeCatalog).toHaveLength(unique.size);
    expect(new Set(tireSizeCatalog.map((entry) => entry.notation))).toEqual(unique);
    expect(new Set(tireSizeCatalog.map((entry) => entry.slug)).size).toBe(tireSizeCatalog.length);
  });

  it('publishes no size without at least one verified vehicle, and excludes nothing today', () => {
    expect(excludedTireSizes).toEqual([]);
    for (const entry of tireSizeCatalog) expect(vehiclesForTireSize(entry.notation).length).toBeGreaterThan(0);
  });

  it('computes geometry from the shared tire functions, not per-page constants', () => {
    // 205/55R16 by hand: sidewall = 205 × 0.55 = 112.75 mm;
    // overall = 16 × 25.4 + 2 × 112.75 = 406.4 + 225.5 = 631.9 mm; circumference = π × 631.9.
    const entry = tireSizeCatalog.find((candidate) => candidate.notation === '205/55R16')!;
    const metrics = tireSizeMetrics(entry);
    expect(metrics.sidewallHeightMm).toBeCloseTo(112.75, 6);
    expect(metrics.overallDiameterMm).toBeCloseTo(631.9, 6);
    expect(metrics.rimDiameterMm).toBeCloseTo(406.4, 6);
    expect(metrics.circumferenceMm).toBeCloseTo(Math.PI * 631.9, 6);
    expect(metrics.revolutionsPerKilometer).toBeCloseTo(1_000_000 / (Math.PI * 631.9), 6);
    expect(metrics.revolutionsPerMile).toBeCloseTo(1_609_344 / (Math.PI * 631.9), 6);
  });

  it('only ever suggests geometrically similar sizes that exist in the same catalog', () => {
    const entry = tireSizeCatalog.find((candidate) => candidate.notation === '205/55R16')!;
    const known = new Set(tireSizeCatalog.map((candidate) => candidate.notation));
    for (const match of similarTireSizes(entry)) {
      expect(known.has(match.entry.notation)).toBe(true);
      expect(match.entry.notation).not.toBe(entry.notation);
      expect(Math.abs(match.differencePercent)).toBeLessThanOrEqual(3);
    }
  });

  it('throws at build time on a malformed tire size rather than publishing a broken URL', () => {
    expect(() => buildTireSizeCatalog([fakeVehicle({ tireSize: '205/55/16' })]))
      .toThrow(/Malformed tire size .* on vehicle "test-vehicle"/);
  });

  it('excludes — not publishes — a size whose geometry is outside sane bounds', () => {
    // Parses fine (matches the notation shape) but an aspect ratio of 95 is out of range.
    const build = buildTireSizeCatalog([fakeVehicle({ tireSize: '205/95R16' }), fakeVehicle({ id: 'ok', tireSize: '205/55R16' })]);
    expect(build.entries.map((entry) => entry.notation)).toEqual(['205/55R16']);
    expect(build.excluded).toEqual([{ notation: '205/95R16', reason: 'aspect ratio 95 is outside 20–90' }]);
    expect(tireGeometryProblem({ widthMm: 205, aspectRatio: 95, rimDiameterInches: 16 })).toMatch(/aspect ratio/);
    expect(tireGeometryProblem({ widthMm: 205, aspectRatio: 55, rimDiameterInches: 30 })).toMatch(/rim diameter/);
    expect(tireGeometryProblem({ widthMm: 20, aspectRatio: 55, rimDiameterInches: 16 })).toMatch(/section width/);
    expect(tireGeometryProblem({ widthMm: 205, aspectRatio: 55, rimDiameterInches: 16 })).toBeNull();
  });
});

describe('bolt-pattern catalog', () => {
  it('pins the slug convention for patterns with and without a decimal PCD', () => {
    expect(boltPatternSlug('5x112')).toBe('5x112');
    expect(boltPatternSlug('5x114.3')).toBe('5x114-3');
    expect(boltPatternSlug('6x139.7')).toBe('6x139-7');
    expect(boltPatternSlug('4x100')).toBe('4x100');
  });

  it('keeps the slug stable and reversible — a decimal never collapses into the integer form', () => {
    expect(boltPatternSlug('5x114.3')).not.toBe(boltPatternSlug('5x114'));
    expect(boltPatternSlug('5x114.3')).not.toContain('1143');
    // Stable across repeated application of parse → slug.
    for (const notation of boltPatternCatalog.map((entry) => entry.notation)) {
      expect(boltPatternSlug(notation)).toBe(boltPatternSlug(notation));
      expect(parseBoltPattern(notation)).not.toBeNull();
    }
  });

  it('derives exactly the unique bolt patterns present in the vehicle dataset', () => {
    const unique = new Set(vehicleFitmentData.map((vehicle) => vehicle.boltPattern));
    expect(boltPatternCatalog).toHaveLength(unique.size);
    expect(new Set(boltPatternCatalog.map((entry) => entry.notation))).toEqual(unique);
    expect(new Set(boltPatternCatalog.map((entry) => entry.slug)).size).toBe(boltPatternCatalog.length);
    expect(excludedBoltPatterns).toEqual([]);
    for (const entry of boltPatternCatalog) expect(vehiclesForBoltPattern(entry.notation).length).toBeGreaterThan(0);
  });

  it('computes adjacent hole spacing as the PCD chord', () => {
    // 5x114.3: chord = 114.3 × sin(36°) ≈ 67.19 mm — the classic 5-lug measurement.
    const entry = boltPatternCatalog.find((candidate) => candidate.notation === '5x114.3')!;
    expect(adjacentHoleSpacingMm(entry)).toBeCloseTo(114.3 * Math.sin(Math.PI / 5), 10);
    expect(adjacentHoleSpacingMm(entry)).toBeCloseTo(67.184, 3);
  });

  it('throws on a malformed bolt pattern and excludes an out-of-range one', () => {
    expect(() => buildBoltPatternCatalog([fakeVehicle({ boltPattern: '5-112' })]))
      .toThrow(/Malformed bolt pattern .* on vehicle "test-vehicle"/);
    const build = buildBoltPatternCatalog([fakeVehicle({ boltPattern: '5x300' }), fakeVehicle({ id: 'ok', boltPattern: '5x112' })]);
    expect(build.entries.map((entry) => entry.notation)).toEqual(['5x112']);
    expect(build.excluded).toEqual([{ notation: '5x300', reason: 'PCD 300 mm is outside 90–180 mm' }]);
  });
});

describe('entity routing and sitemap', () => {
  it('publishes only en/de/es, with the locale-prefix convention from locales.ts', () => {
    expect(entityLocales()).toEqual(['en', 'de', 'es']);
    expect(entityHubPath('tire-size', 'en')).toBe('/tire-sizes/');
    expect(entityHubPath('tire-size', 'de')).toBe('/de/reifengroessen/');
    expect(entityHubPath('tire-size', 'es')).toBe('/es/medidas-neumaticos/');
    expect(entityHubPath('bolt-pattern', 'en')).toBe('/bolt-patterns/');
    expect(entityHubPath('bolt-pattern', 'de')).toBe('/de/lochkreise/');
    expect(entityHubPath('bolt-pattern', 'es')).toBe('/es/patrones-birlos/');
    expect(entityDetailPath('tire-size', 'en', '205-55-r16')).toBe('/tire-sizes/205-55-r16/');
    expect(entityDetailPath('bolt-pattern', 'de', '5x114-3')).toBe('/de/lochkreise/5x114-3/');
  });

  it('cross-links every locale with hreflang plus an x-default', () => {
    const alternates = entityAlternates('tire-size', '205-55-r16');
    expect(alternates.map((alternate) => alternate.hreflang)).toEqual(['en', 'de', 'es', 'x-default']);
    expect(alternates.find((alternate) => alternate.hreflang === 'x-default')?.href).toBe('https://atlasgarageos.com/tire-sizes/205-55-r16/');
    expect(alternates.find((alternate) => alternate.hreflang === 'es')?.href).toBe('https://atlasgarageos.com/es/medidas-neumaticos/205-55-r16/');
  });

  it('lists every generated entity page in the sitemap exactly once', () => {
    const entries = sitemapEntries();
    const expected = entityLocales().length * (2 + tireSizeCatalog.length + boltPatternCatalog.length);
    const entityUrls = entries.filter((url) => /\/(tire-sizes|bolt-patterns|reifengroessen|lochkreise|medidas-neumaticos|patrones-birlos)\//.test(url));
    expect(entityUrls).toHaveLength(expected);
    expect(new Set(entityUrls).size).toBe(expected);
    expect(entries).toContain('https://atlasgarageos.com/tire-sizes/205-55-r16/');
    expect(entries).toContain('https://atlasgarageos.com/de/lochkreise/5x114-3/');
    expect(entries).toContain('https://atlasgarageos.com/es/medidas-neumaticos/');
  });
});
