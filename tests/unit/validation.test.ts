import { describe, expect, it } from 'vitest';
import { createTireSize, createVehicleSetup, createWheelSpec } from '../../src/domain/vehicle';

describe('domain validation', () => {
  it('rejects implausible and non-finite values with readable issues', () => {
    const result = createTireSize({ widthMm: 20, aspectRatio: Number.NaN, rimDiameterInches: 90 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.code)).toEqual(['out-of-range', 'not-a-number', 'out-of-range']);
      expect(result.issues.every((issue) => issue.message.length > 0)).toBe(true);
    }
  });

  it('rejects mismatched tire and wheel diameters', () => {
    const tire = createTireSize({ widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 });
    const wheel = createWheelSpec({ diameterInches: 19, widthInches: 8, offsetMm: 40 });
    if (!tire.ok || !wheel.ok) throw new Error('Fixtures must be valid');
    expect(createVehicleSetup(tire.value, wheel.value)).toMatchObject({ ok: false });
  });
});
