import { describe, expect, it } from 'vitest';
import { BAR_PER_PSI, IMPERIAL_MPG_L100KM_CONSTANT, KILOGRAMS_PER_POUND, NEWTON_METERS_PER_POUND_FOOT, US_MPG_L100KM_CONSTANT, WATTS_PER_MECHANICAL_HP } from '../../src/core/units/automotive';
import { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertFuelInputSystemTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../../src/features/tools/utility-tools';
import { fuelCostPresentation, roadTripPresentation } from '../../src/ui/utility-presentation';

describe('traffic-first utility calculations', () => {
  it('calculates metric fuel cost without core rounding', () => {
    const result = calculateFuelCostTool({ system: 'metric', distance: 450, economy: 7.2, price: 1.8 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fuelRequired).toBeCloseTo(32.4, 12);
    expect(result.value.fuelCost).toBeCloseTo(58.32, 12);
    expect(result.value.costPerDistance).toBeCloseTo(0.1296, 12);
    expect(fuelCostPresentation(result.value, 'EUR').summary).toContain('EUR 58.32');
  });

  it('calculates US fuel cost in miles, US MPG, and US gallons', () => {
    const result = calculateFuelCostTool({ system: 'imperial', distance: 300, economy: 30, price: 3.5 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fuelRequired).toBe(10);
    expect(result.value.fuelCost).toBe(35);
    expect(result.value.costPerDistance).toBeCloseTo(35 / 300, 12);
  });

  it('changes unit systems without changing the represented journey or fuel cost', () => {
    const converted = convertFuelInputSystemTool({ system: 'metric', distance: 450, economy: 7.2, price: 1.8 }, 'imperial');
    expect(converted.ok).toBe(true);
    if (!converted.ok) return;
    const metric = calculateFuelCostTool({ system: 'metric', distance: 450, economy: 7.2, price: 1.8 });
    const us = calculateFuelCostTool(converted.value);
    expect(metric.ok && us.ok).toBe(true);
    if (!metric.ok || !us.ok) return;
    expect(us.value.fuelCost).toBeCloseTo(metric.value.fuelCost, 10);
  });

  it('doubles distance for a round trip and splits the complete cost', () => {
    const result = calculateRoadTripCostTool({ system: 'metric', distance: 420, economy: 6.5, price: 1.8, roundTrip: true, extraCost: 22, people: 4 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.distance).toBe(840);
    expect(result.value.fuelRequired).toBeCloseTo(54.6, 12);
    expect(result.value.totalTripCost).toBeCloseTo(120.28, 12);
    expect(result.value.costPerPerson).toBeCloseTo(30.07, 12);
    expect(roadTripPresentation(result.value, 'EUR').summary).toContain('Round trip: 840 km');
  });

  it('adds extras once on a return journey and keeps the one-way comparison explicit', () => {
    const base = { system: 'imperial' as const, distance: 100, economy: 25, price: 4, extraCost: 10, people: 2 };
    const oneWay = calculateRoadTripCostTool({ ...base, roundTrip: false });
    const returnTrip = calculateRoadTripCostTool({ ...base, roundTrip: true });
    expect(oneWay.ok && returnTrip.ok).toBe(true);
    if (!oneWay.ok || !returnTrip.ok) return;
    expect(oneWay.value.totalTripCost).toBe(26);
    expect(returnTrip.value.totalTripCost).toBe(42);
    expect(returnTrip.value.fuelRequired).toBe(8);
    expect(returnTrip.value.costPerPerson).toBe(21);
    expect(roadTripPresentation(returnTrip.value, 'USD').summary).toContain('Round trip: 200 mi');
  });

  it('keeps US and Imperial MPG distinct', () => {
    const us = convertFuelEconomyTool(30, 'us-mpg');
    const imperial = convertFuelEconomyTool(30, 'imperial-mpg');
    expect(us.ok && imperial.ok).toBe(true);
    if (!us.ok || !imperial.ok) return;
    expect(us.value.litersPer100Km).toBeCloseTo(US_MPG_L100KM_CONSTANT / 30, 12);
    expect(imperial.value.litersPer100Km).toBeCloseTo(IMPERIAL_MPG_L100KM_CONSTANT / 30, 12);
    expect(imperial.value.litersPer100Km).not.toBeCloseTo(us.value.litersPer100Km, 3);
  });

  it('converts pressure through the exact PSI-to-bar constant', () => {
    const result = convertPressureTool(32, 'psi');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.bar).toBeCloseTo(32 * BAR_PER_PSI, 12);
    expect(result.value.kpa).toBeCloseTo(32 * BAR_PER_PSI * 100, 10);
  });

  it('converts mechanical horsepower without conflating PS', () => {
    const result = convertPowerTool(1, 'hp');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.watts).toBe(WATTS_PER_MECHANICAL_HP);
    expect(result.value.kilowatts).toBeCloseTo(0.7456998715822702, 14);
  });

  it('converts torque through the exact pound-foot relationship', () => {
    const result = convertTorqueTool(1, 'lb-ft');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.newtonMeters).toBe(NEWTON_METERS_PER_POUND_FOOT);
  });

  it('normalizes mixed power and weight units', () => {
    const metric = calculatePowerToWeightTool({ power: 180, powerUnit: 'hp', weight: 1350, weightUnit: 'kg' });
    const imperial = calculatePowerToWeightTool({ power: 180, powerUnit: 'hp', weight: 1350 / KILOGRAMS_PER_POUND, weightUnit: 'lb' });
    expect(metric.ok && imperial.ok).toBe(true);
    if (!metric.ok || !imperial.ok) return;
    expect(metric.value.mechanicalHorsepowerPerTonne).toBeCloseTo(133.3333333333, 9);
    expect(imperial.value.mechanicalHorsepowerPerTonne).toBeCloseTo(metric.value.mechanicalHorsepowerPerTonne, 9);
    expect(metric.value.wattsPerKilogram).toBeCloseTo(180 * WATTS_PER_MECHANICAL_HP / 1350, 10);
  });

  it('rejects zero, negative, non-finite, and fractional people inputs', () => {
    expect(calculateFuelCostTool({ system: 'metric', distance: 0, economy: 7, price: 2 })).toMatchObject({ ok: false, issues: [{ field: 'distance' }] });
    expect(convertPressureTool(Number.NaN, 'psi')).toMatchObject({ ok: false, issues: [{ code: 'not-a-number' }] });
    expect(calculatePowerToWeightTool({ power: 100, powerUnit: 'kw', weight: -1, weightUnit: 'kg' })).toMatchObject({ ok: false, issues: [{ field: 'weight' }] });
    expect(calculateRoadTripCostTool({ system: 'metric', distance: 100, economy: 5, price: 2, roundTrip: false, people: 1.5 })).toMatchObject({ ok: false, issues: [{ code: 'not-an-integer', field: 'people' }] });
  });
});
