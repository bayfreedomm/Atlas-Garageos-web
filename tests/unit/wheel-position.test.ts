import { describe, expect, it } from 'vitest';
import { compareWheelPosition } from '../../src/core/wheel/position';
import { createWheelSpec } from '../../src/domain/vehicle';

function wheel(widthInches: number, offsetMm: number) {
  const result = createWheelSpec({ diameterInches: 18, widthInches, offsetMm });
  if (!result.ok) throw new Error('Test wheel must be valid');
  return result.value;
}

describe('wheel position', () => {
  it('moves outward by 10 mm when ET40 becomes ET30 at equal width', () => {
    const result = compareWheelPosition(wheel(8, 40), wheel(8, 30));
    expect(result.innerPositionChangeMm).toBe(-10);
    expect(result.outerPokeChangeMm).toBe(10);
  });

  it('splits added width equally inward and outward at equal offset', () => {
    const result = compareWheelPosition(wheel(8, 40), wheel(9, 40));
    expect(result.innerPositionChangeMm).toBeCloseTo(12.7, 10);
    expect(result.outerPokeChangeMm).toBeCloseTo(12.7, 10);
  });
});
