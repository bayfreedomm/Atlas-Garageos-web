import { describe, expect, it } from 'vitest';
import { isStandardMetricNotation, plusSizeOptions, referenceTireSizeCount, tireSizeAvailability } from '../../src/features/tools/tire-availability';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';

const tire = (widthMm: number, aspectRatio: number, rimDiameterInches: number) => ({ widthMm, aspectRatio, rimDiameterInches });
const notation = (s: { readonly widthMm: number; readonly aspectRatio: number; readonly rimDiameterInches: number }) => `${s.widthMm}/${s.aspectRatio}R${s.rimDiameterInches}`;

describe('tire size availability', () => {
  it('has a non-trivial reference list', () => {
    expect(referenceTireSizeCount()).toBeGreaterThan(500);
  });

  it('treats every documented OEM vehicle size as manufactured', () => {
    for (const vehicle of vehicleFitmentData) {
      const match = /^(\d{3})\/(\d{2})R(\d{2})$/.exec(vehicle.tireSize);
      if (!match) continue;
      expect(tireSizeAvailability(tire(Number(match[1]), Number(match[2]), Number(match[3]))).status, vehicle.tireSize).toBe('listed');
    }
  });

  it('flags a made-up notation and points to the closest real sizes on the same rim', () => {
    const result = tireSizeAvailability(tire(237, 43, 19));
    expect(result.status).toBe('nonstandard');
    expect(result.nearest.length).toBeGreaterThan(0);
    expect(result.nearest.every((s) => s.size.rimDiameterInches === 19 && Math.abs(s.size.widthMm - 237) <= 30)).toBe(true);
  });

  it('never calls a standard-notation size nonexistent — only "not in the list"', () => {
    expect(tireSizeAvailability(tire(225, 45, 23)).status).toBe('unlisted');
  });

  it('knows modern metric notation rules', () => {
    expect(isStandardMetricNotation(tire(205, 55, 16))).toBe(true);
    expect(isStandardMetricNotation(tire(205, 55, 16.5))).toBe(true);
    expect(isStandardMetricNotation(tire(200, 55, 16))).toBe(false);
    expect(isStandardMetricNotation(tire(205, 52, 16))).toBe(false);
  });
});

describe('plus/minus-size options', () => {
  it('reproduces the classic 205/55R16 plus-size chart with real sizes', () => {
    const rows = plusSizeOptions(tire(205, 55, 16));
    const byRim = Object.fromEntries(rows.map((row) => [row.rimDiameterInches, row.options.map((o) => notation(o.size))]));
    expect(byRim[17]).toContain('225/45R17');
    expect(byRim[18]).toContain('215/40R18');
    expect(byRim[15]).toContain('195/65R15');
  });

  it('stays within 3% diameter, never suggests the baseline itself, and never a spare-wheel width', () => {
    const baseline = tire(205, 55, 16);
    for (const row of plusSizeOptions(baseline)) {
      for (const option of row.options) {
        expect(Math.abs(option.diameterDifferencePercent)).toBeLessThanOrEqual(3);
        expect(notation(option.size)).not.toBe('205/55R16');
        expect(option.size.widthMm).toBeGreaterThanOrEqual(175);
      }
    }
  });
});
