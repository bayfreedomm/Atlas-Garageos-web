import { describe, expect, it } from 'vitest';
import { calculateCircumferenceMm, calculateOverallDiameterMm, calculateRevolutionsPerKilometer, calculateRevolutionsPerMile, calculateSidewallHeightMm } from '../../src/core/tire/geometry';
import { createTireSize } from '../../src/domain/vehicle';

const tireResult = createTireSize({ widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 });
if (!tireResult.ok) throw new Error('Reference tire must be valid');
const tire = tireResult.value;

describe('tire geometry', () => {
  it('calculates sidewall and overall diameter from the standard formula', () => {
    expect(calculateSidewallHeightMm(tire)).toBe(101.25);
    expect(calculateOverallDiameterMm(tire)).toBe(659.7);
  });

  it('calculates circumference and revolutions', () => {
    expect(calculateCircumferenceMm(tire)).toBeCloseTo(2072.5087, 3);
    expect(calculateRevolutionsPerKilometer(tire)).toBeCloseTo(482.507, 3);
    expect(calculateRevolutionsPerMile(tire)).toBeCloseTo(776.52, 3);
  });
});
