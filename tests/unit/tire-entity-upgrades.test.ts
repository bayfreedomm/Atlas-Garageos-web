import { describe, expect, it } from 'vitest';
import { commercialTwin, parseTireNotation, tireSizeBySlug, tireSizeCatalog, tireSizeSlug } from '../../src/data/tire-size-catalog';
import { productionCommercialTireSizeNotations } from '../../src/data/production-tire-sizes';
import {
  displayTireNotation, formatTireMetrics, inchShorthand, sameRimNeighbours, tireAlternatives,
  tireSizeDetailMeta, tireSizeMetrics,
} from '../../src/ui/entity-page-model';
import { formatDecimal, formatPercent, formatSigned } from '../../src/ui/locale-format';
import { tireSizeShortcuts } from '../../src/ui/reference-links';
import { vehicleFitmentData, vehicleNote } from '../../src/data/vehicle-fitment';

const entry = (notation: string) => {
  const found = tireSizeCatalog.find((candidate) => candidate.notation === notation);
  if (!found) throw new Error(`missing ${notation}`);
  return found;
};

describe('locale number formatting', () => {
  it('uses a decimal comma and spaced percent for German and Spanish only', () => {
    expect(formatDecimal(631.9, 1, 'en')).toBe('631.9');
    expect(formatDecimal(631.9, 1, 'de')).toBe('631,9');
    expect(formatDecimal(631.9, 1, 'es')).toBe('631,9');
    expect(formatPercent(55, 0, 'en')).toBe('55%');
    expect(formatPercent(55, 0, 'de')).toBe('55 %');
    expect(formatSigned(-0.724, 2, '%', 'de')).toBe('−0,72 %');
    expect(formatSigned(1.3, 1, 'mm', 'en')).toBe('+1.3 mm');
    expect(formatSigned(0.001, 1, 'mm', 'en')).toBe('0.0 mm');
  });

  it('formats tire metrics per locale without changing the numbers', () => {
    const metrics = tireSizeMetrics(entry('205/55R16'));
    expect(formatTireMetrics(metrics, 'en').overallDiameter).toBe('631.9 mm');
    expect(formatTireMetrics(metrics, 'de').overallDiameter).toBe('631,9 mm');
    expect(formatTireMetrics(metrics, 'de').aspectRatio).toBe('55 %');
  });
});

describe('light-commercial (C) sizes', () => {
  it('parses, slugs and publishes C sizes as their own entities', () => {
    expect(parseTireNotation('215/65R16C')).toEqual({ widthMm: 215, aspectRatio: 65, rimDiameterInches: 16, commercial: true });
    expect(tireSizeSlug('215/65R16C')).toBe('215-65-r16c');
    for (const notation of productionCommercialTireSizeNotations()) {
      const found = tireSizeBySlug(tireSizeSlug(notation));
      expect(found?.notation).toBe(notation);
      expect(found?.commercial).toBe(true);
    }
  });

  it('links a passenger size and its C twin both ways', () => {
    expect(commercialTwin(entry('215/65R16'))?.notation).toBe('215/65R16C');
    expect(commercialTwin(entry('215/65R16C'))?.notation).toBe('215/65R16');
  });

  it('never offers a passenger size as an alternative to a C size, or the reverse', () => {
    for (const notation of ['215/65R16C', '215/65R16']) {
      const base = entry(notation);
      for (const row of tireAlternatives(base)) for (const option of row.options) expect(Boolean(option.entry.commercial)).toBe(Boolean(base.commercial));
    }
  });
});

describe('real-world alternatives', () => {
  it('stays within 3% and a sensible width window, never suggesting a space-saver', () => {
    const base = entry('215/65R16');
    const rows = tireAlternatives(base);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect([-1, 0, 1, 2]).toContain(row.rimDelta);
      for (const option of row.options) {
        expect(Math.abs(option.differencePercent)).toBeLessThanOrEqual(3);
        expect(option.entry.widthMm).toBeGreaterThanOrEqual(base.widthMm - 30);
        expect(option.entry.notation).not.toBe('155/90R16');
        expect(option.entry.notation).not.toBe('305/25R21');
      }
    }
  });

  it('computes the true speed at an indicated 100 from the diameter ratio', () => {
    const base = entry('205/55R16');
    const option = tireAlternatives(base).flatMap((row) => row.options)[0]!;
    const ratio = tireSizeMetrics(option.entry).overallDiameterMm / tireSizeMetrics(base).overallDiameterMm;
    expect(option.trueSpeedAtIndicated100).toBeCloseTo(100 * ratio, 10);
  });

  it('lists only same-rim, same-class neighbours', () => {
    const base = entry('205/55R16');
    const neighbours = sameRimNeighbours(base);
    expect(neighbours.length).toBeGreaterThan(0);
    for (const neighbour of neighbours) {
      expect(neighbour.rimDiameterInches).toBe(16);
      expect(neighbour.notation).not.toBe(base.notation);
      expect(Boolean(neighbour.commercial)).toBe(false);
    }
  });
});

describe('localized presentation', () => {
  it('writes "205/55 R16" in German and Spanish only', () => {
    expect(displayTireNotation('205/55R16', 'en')).toBe('205/55R16');
    expect(displayTireNotation('205/55R16', 'de')).toBe('205/55 R16');
    expect(displayTireNotation('215/65R16C', 'es')).toBe('215/65 R16C');
  });

  it('builds an inch shorthand from the computed geometry', () => {
    const base = entry('265/70R17');
    expect(inchShorthand(base, tireSizeMetrics(base), 'en')).toBe('31.6 × 10.4 R17');
  });

  it('puts locale-correct figures in titles and descriptions', () => {
    const de = tireSizeDetailMeta(entry('205/55R16'), 'de');
    expect(de.title).toContain('205/55 R16');
    expect(de.title).toContain('1985 mm');
    expect(de.description).toContain('631,9 mm');
    const en = tireSizeDetailMeta(entry('205/55R16'), 'en');
    expect(en.title).toContain('24.9″');
  });

  it('emits shortcut links only for sizes that exist', () => {
    for (const locale of ['en', 'de', 'es'] as const) {
      const shortcuts = tireSizeShortcuts(locale);
      expect(shortcuts.length).toBeGreaterThanOrEqual(8);
      for (const shortcut of shortcuts) expect(shortcut.href).toMatch(/\/(tire-sizes|reifengroessen|medidas-neumaticos)\/[\da-z-]+\/$/);
    }
  });

  it('never shows an English vehicle note on a German or Spanish page', () => {
    for (const vehicle of vehicleFitmentData) {
      expect(vehicleNote(vehicle, 'de')).toBe(vehicle.notesDe);
      expect(vehicleNote(vehicle, 'es')).toBe(vehicle.notesEs);
    }
  });
});
