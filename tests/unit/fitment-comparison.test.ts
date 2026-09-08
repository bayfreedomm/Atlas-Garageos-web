import { describe, expect, it } from 'vitest';
import { calculateActualSpeed, compareFitment } from '../../src/core/fitment/compare';
import { createTireSize, createVehicleSetup, createWheelSpec } from '../../src/domain/vehicle';

function setup(widthMm: number, aspect: number, rim: number, wheelWidth: number, offset: number) {
  const tire = createTireSize({ widthMm, aspectRatio: aspect, rimDiameterInches: rim });
  const wheel = createWheelSpec({ diameterInches: rim, widthInches: wheelWidth, offsetMm: offset });
  if (!tire.ok || !wheel.ok) throw new Error('Test input must be valid');
  const result = createVehicleSetup(tire.value, wheel.value);
  if (!result.ok) throw new Error('Test setup must be valid');
  return result.value;
}

describe('fitment comparison', () => {
  it('returns zero differences for the same setup', () => {
    const current = setup(225, 45, 18, 8, 40);
    const result = compareFitment(current, current);
    expect(result.diameterDifferenceMm).toBe(0);
    expect(result.diameterDifferencePercent).toBe(0);
    expect(result.rideHeightDifferenceMm).toBe(0);
    expect(result.speedometerDifferencePercent).toBe(0);
    expect(result.wheelInnerPositionChangeMm).toBe(0);
    expect(result.wheelOuterPokeChangeMm).toBe(0);
  });

  it('reports higher actual speed for a larger proposed diameter', () => {
    const result = compareFitment(setup(225, 45, 18, 8, 40), setup(235, 40, 19, 8.5, 35));
    expect(result.diameterDifferenceMm).toBeCloseTo(10.9, 10);
    expect(result.speedometerDifferencePercent).toBeGreaterThan(0);
    expect(calculateActualSpeed(100, result)).toBeGreaterThan(100);
  });
});
