import { describe, expect, it } from 'vitest';
import { evaluateWheelGeometry, projectWheelClearance } from '../../src/core/fitment/clearance';
import { createFitmentMap, findNearestGreenAlternatives } from '../../src/core/fitment/map';
import { createVehicleClearanceProfile } from '../../src/domain/clearance';
import { createTireSize, createVehicleSetup, createWheelSpec } from '../../src/domain/vehicle';

function wheel(widthInches: number, offsetMm: number) {
  const result = createWheelSpec({ diameterInches: 19, widthInches, offsetMm });
  if (!result.ok) throw new Error('Wheel fixture must be valid');
  return result.value;
}

function profile(inner = 12, outer = 15, targetInner: number | null = 7, targetOuter: number | null = 7) {
  const tire = createTireSize({ widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 });
  const baselineWheel = wheel(8, 40);
  if (!tire.ok) throw new Error('Tire fixture must be valid');
  const setup = createVehicleSetup(tire.value, baselineWheel);
  if (!setup.ok) throw new Error('Setup fixture must be valid');
  const result = createVehicleClearanceProfile({
    vehicleId: 'vehicle-1',
    baselineSetupId: null,
    baselineSetup: setup.value,
    measuredInnerClearanceMm: inner,
    measuredOuterClearanceMm: outer,
    minimumDesiredInnerClearanceMm: targetInner,
    minimumDesiredOuterClearanceMm: targetOuter,
    updatedAt: '2026-09-08T11:00:00.000Z',
  });
  if (!result.ok) throw new Error('Clearance fixture must be valid');
  return result.value;
}

describe('wheel clearance geometry', () => {
  it('returns zero position change for baseline versus itself', () => {
    const baseline = wheel(8, 40);
    expect(projectWheelClearance(baseline, baseline, 12, 15)).toEqual({
      innerPositionChangeMm: 0,
      outerPokeChangeMm: 0,
      projectedInnerClearanceMm: 12,
      projectedOuterClearanceMm: 15,
    });
  });

  it('moves a wider same-offset wheel equally inward and outward', () => {
    const result = projectWheelClearance(wheel(8, 40), wheel(9, 40), 50, 50);
    expect(result.innerPositionChangeMm).toBeCloseTo(12.7, 10);
    expect(result.outerPokeChangeMm).toBeCloseTo(12.7, 10);
  });

  it('uses the documented offset directions and projected-clearance formula', () => {
    const lowerEt = projectWheelClearance(wheel(8, 40), wheel(8, 30), 12, 15);
    expect(lowerEt.innerPositionChangeMm).toBe(-10);
    expect(lowerEt.outerPokeChangeMm).toBe(10);
    expect(lowerEt.projectedInnerClearanceMm).toBe(22);
    expect(lowerEt.projectedOuterClearanceMm).toBe(5);

    const higherEt = projectWheelClearance(wheel(8, 40), wheel(8, 50), 12, 15);
    expect(higherEt.innerPositionChangeMm).toBe(10);
    expect(higherEt.outerPokeChangeMm).toBe(-10);
  });

  it('classifies overlap red, below-target clearance yellow, and satisfied targets green', () => {
    expect(evaluateWheelGeometry(wheel(8, 40), wheel(9, 20), profile()).state).toBe('red');
    expect(evaluateWheelGeometry(wheel(8, 40), wheel(8, 30), profile()).state).toBe('yellow');
    expect(evaluateWheelGeometry(wheel(8, 40), wheel(8, 40), profile()).state).toBe('green');
  });

  it('does not invent a positive safety threshold when targets are absent', () => {
    const result = evaluateWheelGeometry(wheel(8, 40), wheel(8, 40), profile(0.1, 0.1, null, null));
    expect(result.state).toBe('green');
    expect(result.reasons).toEqual(['no-targets']);
  });
});

describe('fitment map', () => {
  const request = () => ({
    clearanceProfile: profile(30, 30, 5, 5),
    widthRangeInches: { min: 8, max: 9, step: 0.5 },
    offsetRangeMm: { min: 35, max: 45, step: 5 },
  });

  it('creates the expected grid dimensions deterministically', () => {
    const first = createFitmentMap(request());
    const second = createFitmentMap(request());
    expect(first.ok).toBe(true);
    expect(first).toEqual(second);
    if (first.ok) {
      expect(first.value.widthValuesInches).toEqual([8, 8.5, 9]);
      expect(first.value.offsetValuesMm).toEqual([35, 40, 45]);
      expect(first.value.cells).toHaveLength(9);
    }
  });

  it('ranks nearest green alternatives by transparent Manhattan grid distance', () => {
    const map = createFitmentMap(request());
    if (!map.ok) throw new Error('Map fixture must be valid');
    const nearest = findNearestGreenAlternatives(wheel(8.5, 40), map.value, 4);
    expect(nearest.map(({ cell }) => [cell.wheelWidthInches, cell.offsetMm])).toEqual([
      [8.5, 35],
      [8.5, 45],
      [8, 40],
      [9, 40],
    ]);
    expect(nearest.every((item) => item.distanceInGridSteps === 1)).toBe(true);
  });
});
