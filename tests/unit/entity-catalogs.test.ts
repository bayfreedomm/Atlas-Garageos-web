import { describe, expect, it } from 'vitest';
import {
  buildTireSizeCatalog, excludedTireSizes, parseTireNotation, tireGeometryProblem,
  tireSizeCatalog, tireSizeSlug, vehiclesForTireSize,
} from '../../src/data/tire-size-catalog';
import {
  BOLT_PATTERN_BOUNDS, boltPatternCatalog, boltPatternSlug, buildBoltPatternCatalog,
  excludedBoltPatterns, vehiclesForBoltPattern,
} from '../../src/data/bolt-pattern-catalog';
import { adjacentHoleSpacingMm, boltPatternSpacingMm, parseBoltPattern } from '../../src/data/bolt-pattern-geometry';
import { entitySearchText, normalizeEntitySearchText } from '../../src/ui/entity-search';
import { boltPatternPageText, tireSizePageText } from '../../src/content/entity-page-text';
import { vehiclePageText } from '../../src/content/vehicle-page-text';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { entityAlternates, entityDetailPath, entityHubPath, entityLocales } from '../../src/seo/entity-routes';
import {
  boltPatternCalculatorHref, distinctCenterBores, formatCenterBores, similarTireSizes,
  splitHeadingAroundKey, tireSizeMetrics, torqueIsUnconfirmed,
} from '../../src/ui/entity-page-model';
import { vehicleFitmentData, type VehicleFitment } from '../../src/data/vehicle-fitment';
import { productionTireSizeNotations } from '../../src/data/production-tire-sizes';
import { torqueIsTrusted, torqueJsonLdProperty, torquePresentation } from '../../src/ui/vehicle-torque';
import { sitemapEntries } from '../../src/seo/sitemap';

/** A syntactically complete vehicle row, so a test can vary exactly one field. */
const fakeVehicle = (overrides: Partial<VehicleFitment>): VehicleFitment => ({
  id: 'test-vehicle', make: 'Test', model: 'Car', generation: '2024', market: 'eu',
  tireSize: '205/55R16', boltPattern: '5x112', lugCount: 5,
  wheelSize: '7Jx16', fastenerType: 'wheel-bolt', confidence: 'low', sources: ['test'],
  ...overrides,
});

it('loads Node built-ins in the checked test environment', () => {
  expect(fs.existsSync(fileURLToPath(new URL('../../src/data/vehicle-fitment.ts', import.meta.url)))).toBe(true);
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

  it('derives exactly the production reference plus vehicle-only OEM sizes', () => {
    const unique = new Set([...productionTireSizeNotations(), ...vehicleFitmentData.map((vehicle) => vehicle.tireSize)]);
    expect(tireSizeCatalog).toHaveLength(unique.size);
    expect(new Set(tireSizeCatalog.map((entry) => entry.notation))).toEqual(unique);
    expect(new Set(tireSizeCatalog.map((entry) => entry.slug)).size).toBe(tireSizeCatalog.length);
  });

  it('publishes only sourced production or OEM sizes and preserves vehicle relationships where known', () => {
    expect(excludedTireSizes).toEqual([]);
    const known = new Set([...productionTireSizeNotations(), ...vehicleFitmentData.map((vehicle) => vehicle.tireSize)]);
    for (const entry of tireSizeCatalog) expect(known.has(entry.notation)).toBe(true);
    for (const vehicle of vehicleFitmentData) expect(vehiclesForTireSize(vehicle.tireSize).length).toBeGreaterThan(0);
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
    const build = buildTireSizeCatalog([fakeVehicle({ tireSize: '205/99R16' }), fakeVehicle({ id: 'ok', tireSize: '205/55R16' })]);
    expect(build.entries.map((entry) => entry.notation)).toEqual(['205/55R16']);
    expect(build.excluded).toEqual([{ notation: '205/99R16', reason: 'aspect ratio 99 is outside 20–95' }]);
    expect(tireGeometryProblem({ widthMm: 205, aspectRatio: 99, rimDiameterInches: 16 })).toMatch(/aspect ratio/);
    expect(tireGeometryProblem({ widthMm: 205, aspectRatio: 55, rimDiameterInches: 34 })).toMatch(/rim diameter/);
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
    // 5x114.3: chord = 114.3 × sin(36°) ≈ 67.18 mm — the classic 5-lug measurement.
    const entry = boltPatternCatalog.find((candidate) => candidate.notation === '5x114.3')!;
    expect(adjacentHoleSpacingMm(entry.pcdMm, entry.lugCount)).toBeCloseTo(114.3 * Math.sin(Math.PI / 5), 10);
    expect(adjacentHoleSpacingMm(entry.pcdMm, entry.lugCount)).toBeCloseTo(67.184, 3);
  });

  it('throws on a malformed bolt pattern and excludes an out-of-range one', () => {
    expect(() => buildBoltPatternCatalog([fakeVehicle({ boltPattern: '5-112' })]))
      .toThrow(/Malformed bolt pattern .* on vehicle "test-vehicle"/);
    const build = buildBoltPatternCatalog([fakeVehicle({ boltPattern: '5x300' }), fakeVehicle({ id: 'ok', boltPattern: '5x112' })]);
    expect(build.entries.map((entry) => entry.notation)).toEqual(['5x112']);
    expect(build.excluded).toEqual([{ notation: '5x300', reason: 'PCD 300 mm is outside 80–230 mm' }]);
  });

  it('refuses a lugCount that disagrees with the bolt pattern notation', () => {
    expect(() => buildBoltPatternCatalog([fakeVehicle({ boltPattern: '5x112', lugCount: 4 })]))
      .toThrow(/declares lugCount 4 but its bolt pattern .* says 5/);
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

/* ==========================================================================================
 * Regression cover for the correctness pass:
 *   - hole-to-hole spacing is DERIVED, never a stored duplicate of the PCD
 *   - center bores are discrete real values, not a fabricated min–max range
 *   - the localized detailH1 phrase is actually used
 *   - hub search normalization folds every separator spelling onto one string
 *   - widened validation bounds accept real light-truck data but still reject garbage
 * ======================================================================================= */

const readSrc = (relative: string): string =>
  fs.readFileSync(fileURLToPath(new URL(`../../src/${relative}`, import.meta.url)), 'utf8');

describe('adjacent hole spacing is derived from the bolt pattern, not stored', () => {
  // Chord between neighbouring lug holes: PCD × sin(π / lugs). These are the ten patterns the
  // dataset can produce today plus the two exact 6-lug cases (sin(π/6) = 0.5 exactly).
  const cases: readonly (readonly [string, number])[] = [
    ['5x114.3', 67.18], ['5x112', 65.83], ['4x100', 70.71], ['4x108', 76.37], ['5x100', 58.78],
    ['5x108', 63.48], ['5x115', 67.60], ['5x127', 74.65], ['6x135', 67.5], ['6x139.7', 69.85],
  ];

  it.each(cases)('%s spacing is the chord, not the PCD', (notation, expected) => {
    const parsed = parseBoltPattern(notation)!;
    const spacing = adjacentHoleSpacingMm(parsed.pcdMm, parsed.lugCount);
    expect(spacing).toBeCloseTo(parsed.pcdMm * Math.sin(Math.PI / parsed.lugCount), 10);
    expect(spacing).toBeCloseTo(expected, 2);
    // The whole point: it must NOT be the PCD number itself.
    expect(spacing).not.toBeCloseTo(parsed.pcdMm, 1);
    expect(boltPatternSpacingMm(notation)).toBeCloseTo(spacing, 10);
  });

  it('is exactly PCD / 2 for a six-lug pattern', () => {
    expect(boltPatternSpacingMm('6x139.7')).toBeCloseTo(69.85, 10);
    expect(boltPatternSpacingMm('6x135')).toBeCloseTo(67.5, 10);
  });

  it('declines to pre-fill rather than emitting NaN for an unparseable pattern', () => {
    expect(boltPatternSpacingMm('5-112')).toBeNull();
    expect(boltPatternSpacingMm('')).toBeNull();
    expect(() => adjacentHoleSpacingMm(114.3, Number.NaN)).toThrow();
  });

  it('pre-fills the bolt-pattern calculator with the chord for a 5-lug and a 6-lug pattern', () => {
    const five = boltPatternCatalog.find((entry) => entry.notation === '5x114.3')!;
    const six = boltPatternCatalog.find((entry) => entry.notation === '6x139.7')!;
    expect(boltPatternCalculatorHref('en', five)).toContain('spacing=67.18');
    expect(boltPatternCalculatorHref('en', five)).not.toContain('spacing=114.3');
    expect(boltPatternCalculatorHref('en', six)).toContain('spacing=69.85');
    expect(boltPatternCalculatorHref('en', six)).not.toContain('spacing=139.7');
  });

  it('leaves no stale spacingMm field anywhere in src/', () => {
    // The picker and the finder used to read vehicle.spacingMm (which was the PCD). Both now
    // go through the shared geometry function; a DOM test is not practical here, so this
    // asserts the field is gone from the data model and from every consumer.
    for (const file of ['data/vehicle-fitment.ts', 'ui/vehicle-fitment-picker.ts', 'ui/vehicle-fitment-finder.ts']) {
      expect(readSrc(file)).not.toMatch(/\.spacingMm|spacingMm:/);
    }
    for (const file of ['ui/vehicle-fitment-picker.ts', 'ui/vehicle-fitment-finder.ts']) {
      expect(readSrc(file)).toContain('boltPatternSpacingMm');
    }
    expect(vehicleFitmentData.every((vehicle) => !('spacingMm' in vehicle))).toBe(true);
  });
});

describe('center bores are discrete values, not a range', () => {
  it('returns exactly the distinct bores present, sorted and deduped', () => {
    const vehicles = [
      fakeVehicle({ id: 'a', centerBoreMm: 66.6 }),
      fakeVehicle({ id: 'b', centerBoreMm: 57.1 }),
      fakeVehicle({ id: 'c', centerBoreMm: 66.5 }),
      fakeVehicle({ id: 'd', centerBoreMm: 66.6 }),
      fakeVehicle({ id: 'e' }),
    ];
    expect(distinctCenterBores(vehicles)).toEqual([57.1, 66.5, 66.6]);
    expect(distinctCenterBores(vehicles)).toHaveLength(3);
    expect(formatCenterBores(distinctCenterBores(vehicles))).toBe('57.1 / 66.5 / 66.6 mm');
    expect(formatCenterBores([])).toBe('—');
    expect(formatCenterBores([64.1])).toBe('64.1 mm');
  });

  it('no longer labels the metric as a range in any locale', () => {
    for (const locale of ['en', 'de', 'es'] as const) {
      expect(boltPatternPageText[locale].metrics.centerBore).toMatch(/Atlas/);
      expect(boltPatternPageText[locale].metrics.centerBore).not.toMatch(/range|bereich|Rango/i);
    }
  });
});

describe('entity detail H1 uses the localized semantic phrase', () => {
  it('produces the expected heading per locale', () => {
    expect(tireSizePageText.en.detailH1('235/45R18')).toBe('235/45R18 tire size');
    expect(tireSizePageText.de.detailH1('235/45R18')).toBe('Reifengröße 235/45R18');
    expect(tireSizePageText.es.detailH1('235/45R18')).toBe('Medida de neumático 235/45R18');
    expect(boltPatternPageText.en.detailH1('5x114.3')).toBe('5x114.3 bolt pattern');
    expect(boltPatternPageText.de.detailH1('5x114.3')).toBe('Lochkreis 5x114.3');
    expect(boltPatternPageText.es.detailH1('5x114.3')).toBe('Patrón de birlos 5x114.3');
  });

  it('splits the heading around the notation in either word order', () => {
    expect(splitHeadingAroundKey('235/45R18 tire size', '235/45R18'))
      .toEqual({ before: '', key: '235/45R18', after: ' tire size' });
    expect(splitHeadingAroundKey('Reifengröße 235/45R18', '235/45R18'))
      .toEqual({ before: 'Reifengröße ', key: '235/45R18', after: '' });
    // Rejoining always reproduces the full semantic heading — the <h1> is never truncated.
    for (const locale of ['en', 'de', 'es'] as const) {
      const full = boltPatternPageText[locale].detailH1('5x114.3');
      const parts = splitHeadingAroundKey(full, '5x114.3');
      expect(parts.before + parts.key + parts.after).toBe(full);
      expect(parts.key).toBe('5x114.3');
    }
  });

  it('is actually rendered by both entity components', () => {
    for (const file of ['components/TireSizeEntity.astro', 'components/BoltPatternEntity.astro']) {
      const source = readSrc(file);
      expect(source).toContain('t.detailH1(');
      expect(source).toMatch(/<h1[^>]*>\{heading\.before\}/);
    }
  });
});

describe('hub search normalization', () => {
  it('folds every spelling of a tire size onto one string', () => {
    const forms = ['205/55R16', '205-55-r16', '205 55 r16', '20555r16', '205/55r16'];
    for (const form of forms) expect(normalizeEntitySearchText(form)).toBe('20555r16');
  });

  it('folds every spelling of a bolt pattern onto one string', () => {
    for (const form of ['5x114.3', '5x114-3', '5 114.3', '5-114-3', '5X114.3']) {
      expect(normalizeEntitySearchText(form)).toBe('51143');
    }
    for (const form of ['5x112', '5-112', '5 112']) expect(normalizeEntitySearchText(form)).toBe('5112');
  });

  it('matches a card built at build time against a differently-spelled query', () => {
    const haystack = entitySearchText(['205/55R16', '205-55-r16', 'Volkswagen', 'Skoda']);
    for (const typed of ['205/55R16', '205 55 r16', '20555R16', 'volkswagen']) {
      expect(haystack.includes(normalizeEntitySearchText(typed))).toBe(true);
    }
    expect(haystack.includes(normalizeEntitySearchText('225/45R18'))).toBe(false);
    // Tokens stay separated, so one card's makes cannot bleed into the next token.
    expect(haystack.split('|')).toHaveLength(4);
  });

  it('is the same function on both sides of the comparison', () => {
    expect(readSrc('ui/entity-filter.ts')).toContain('normalizeEntitySearchText(input.value)');
    for (const file of ['components/TireSizeHubBody.astro', 'components/BoltPatternHubBody.astro']) {
      expect(readSrc(file)).toContain('entitySearchText([entry.notation');
    }
  });
});

describe('validation bounds cover the stated scope without letting garbage through', () => {
  it('accepts a legitimately broader but real light-truck fitment', () => {
    // 305/45R26 (a real light-truck/SUV size) was rejected by the old 24″ rim cap;
    // 8x200 (Ram HD) was rejected by the old 180 mm PCD cap. Both are now publishable.
    expect(tireGeometryProblem({ widthMm: 305, aspectRatio: 45, rimDiameterInches: 26 })).toBeNull();
    expect(tireGeometryProblem({ widthMm: 275, aspectRatio: 65, rimDiameterInches: 18 })).toBeNull();
    const build = buildTireSizeCatalog([fakeVehicle({ tireSize: '305/45R26' })]);
    expect(build.excluded).toEqual([]);
    expect(build.entries.map((entry) => entry.notation)).toEqual(['305/45R26']);

    const bolt = buildBoltPatternCatalog([fakeVehicle({ boltPattern: '8x200', lugCount: 8 })]);
    expect(bolt.excluded).toEqual([]);
    expect(bolt.entries.map((entry) => entry.notation)).toEqual(['8x200']);
    expect(BOLT_PATTERN_BOUNDS.pcdMm).toEqual({ min: 80, max: 230 });
  });

  it('still hard-fails structurally malformed data exactly as before', () => {
    expect(() => buildTireSizeCatalog([fakeVehicle({ tireSize: 'not-a-size' })])).toThrow(/Malformed tire size/);
    expect(() => buildTireSizeCatalog([fakeVehicle({ tireSize: '205/55/16' })])).toThrow(/Malformed tire size/);
    expect(() => buildBoltPatternCatalog([fakeVehicle({ boltPattern: '5-112' })])).toThrow(/Malformed bolt pattern/);
    expect(() => buildBoltPatternCatalog([fakeVehicle({ boltPattern: 'five x 112' })])).toThrow(/Malformed bolt pattern/);
    expect(parseTireNotation('NaN/NaNRNaN')).toBeNull();
    expect(parseBoltPattern('Infinityx114.3')).toBeNull();
    // Parses but is physically absurd: excluded with a reason, never published.
    const build = buildTireSizeCatalog([fakeVehicle({ tireSize: '999/99R99' }), fakeVehicle({ id: 'ok' })]);
    expect(build.entries.map((entry) => entry.notation)).toEqual(['205/55R16']);
    expect(build.excluded).toHaveLength(1);
  });
});

describe('per-row confidence is surfaced instead of a uniform claim', () => {
  it('mutes a torque figure that is low-confidence or noted as extrapolated', () => {
    const audiA3 = vehicleFitmentData.find((vehicle) => vehicle.id === 'audi-a3')!;
    const teslaModel3 = vehicleFitmentData.find((vehicle) => vehicle.id === 'tesla-model-3')!;
    const skoda = vehicleFitmentData.find((vehicle) => vehicle.id === 'skoda-octavia')!;
    const mercedes = vehicleFitmentData.find((vehicle) => vehicle.id === 'mercedes-c-class')!;
    expect(torqueIsUnconfirmed(audiA3)).toBe(true);      // confidence: 'low'
    expect(torqueIsUnconfirmed(mercedes)).toBe(true);    // 'not independently confirmed' in notes
    expect(torqueIsUnconfirmed(teslaModel3)).toBe(false); // high confidence, service manual
    expect(torqueIsUnconfirmed(skoda)).toBe(false);       // no torque at all — shows an em dash
  });

  it('gives every locale a localized confidence label and renders it in both tables', () => {
    for (const locale of ['en', 'de', 'es'] as const) {
      for (const text of [tireSizePageText[locale], boltPatternPageText[locale]]) {
        expect(text.colConfidence.length).toBeGreaterThan(0);
        expect(new Set([text.confidence.high, text.confidence.medium, text.confidence.low]).size).toBe(3);
      }
    }
    for (const file of ['components/TireSizeEntity.astro', 'components/BoltPatternEntity.astro']) {
      expect(readSrc(file)).toContain('t.confidence[vehicle.confidence]');
    }
    expect(readSrc('components/BoltPatternEntity.astro')).toContain('torquePresentation(vehicle, locale)');
  });

  it('makes no blanket "verified vehicle" claim in any locale of the entity copy', () => {
    const copy = readSrc('content/entity-page-text.ts');
    expect(copy).not.toMatch(/verified vehicle|vehículos? verificad|verified vehicles/i);
  });
});

describe('field-level wheel torque trust', () => {
  it('requires explicit trust metadata for every published torque value', () => {
    for (const vehicle of vehicleFitmentData) {
      if (vehicle.torqueNm !== undefined) expect(vehicle.torqueTrust).toBeDefined();
    }
  });

  it('distinguishes documented high-confidence torque from extrapolated torque', () => {
    const tesla = vehicleFitmentData.find((vehicle) => vehicle.id === 'tesla-model-3')!;
    const audi = vehicleFitmentData.find((vehicle) => vehicle.id === 'audi-a3')!;
    expect(torqueIsTrusted(tesla)).toBe(true);
    expect(torquePresentation(tesla, 'en').qualified).toBe(false);
    expect(torqueIsTrusted(audi)).toBe(false);
    expect(torquePresentation(audi, 'en')).toMatchObject({ qualified: true });
    expect(torquePresentation(audi, 'en').qualifier).toMatch(/Extrapolated reference/);
  });

  it('excludes insufficient torque evidence from structured data', () => {
    const trusted = vehicleFitmentData.find((vehicle) => vehicle.id === 'tesla-model-3')!;
    const extrapolated = vehicleFitmentData.find((vehicle) => vehicle.id === 'audi-a3')!;
    const medium = vehicleFitmentData.find((vehicle) => vehicle.id === 'toyota-rav4')!;
    expect(torqueJsonLdProperty(trusted, 'Wheel torque (Nm)')).toHaveLength(1);
    expect(torqueJsonLdProperty(extrapolated, 'Wheel torque (Nm)')).toEqual([]);
    expect(torqueJsonLdProperty(medium, 'Wheel torque (Nm)')).toEqual([]);
  });

  it('qualifies uncertain torque in every localized FAQ answer', () => {
    const vehicle = vehicleFitmentData.find((candidate) => candidate.id === 'audi-a3')!;
    expect(vehiclePageText.en.faqTorqueA(vehicle)).toMatch(/Extrapolated reference/);
    expect(vehiclePageText.de.faqTorqueA(vehicle)).toMatch(/Übertragener Referenzwert/);
    expect(vehiclePageText.es.faqTorqueA(vehicle)).toMatch(/Referencia extrapolada/);
  });

  it('routes all vehicle JSON-LD torque properties through the trust gate', () => {
    for (const file of ['pages/vehicles/[id].astro', 'pages/de/fahrzeuge/[id].astro', 'pages/es/vehiculos/[id].astro']) {
      const source = readSrc(file);
      expect(source).toContain('torqueJsonLdProperty(vehicle');
      expect(source).not.toMatch(/vehicle\.torqueNm !== undefined \? \[\{ '@type': 'PropertyValue'/);
    }
  });
});
