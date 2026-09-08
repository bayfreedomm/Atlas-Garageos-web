import { describe, expect, it } from 'vitest';
import { inchesToMillimeters, kilometersToMiles, milesToKilometers, millimetersToInches } from '../../src/core/units/conversion';

describe('unit conversion', () => {
  it('converts inches and millimeters exactly', () => {
    expect(inchesToMillimeters(1)).toBe(25.4);
    expect(millimetersToInches(25.4)).toBe(1);
    expect(inchesToMillimeters(18)).toBe(457.2);
  });

  it('converts the international mile exactly', () => {
    expect(milesToKilometers(1)).toBe(1.609344);
    expect(kilometersToMiles(1.609344)).toBe(1);
  });
});
