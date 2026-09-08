import { describe, expect, it } from 'vitest';
import { COMBINED_SEARCH_LIMITS, preflightCombinedSearch, searchCombinedFitment, type CombinedSearchRequest } from '../../src/core/fitment/combined-search';
import { compareFitment } from '../../src/core/fitment/compare';
import { createVehicleClearanceProfile } from '../../src/domain/clearance';
import { createTireSize, createVehicleSetup, createWheelSpec } from '../../src/domain/vehicle';
import { createCombinedSearchRequest } from '../../src/features/fitment-explorer/fitment-explorer';

function profile(inner = 30, outer = 30) {
  const tire = createTireSize({ widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 });
  const wheel = createWheelSpec({ diameterInches: 18, widthInches: 8, offsetMm: 40 });
  if (!tire.ok || !wheel.ok) throw new Error('Fixture values must be valid');
  const setup = createVehicleSetup(tire.value, wheel.value);
  if (!setup.ok) throw new Error('Fixture setup must be valid');
  const result = createVehicleClearanceProfile({ vehicleId: 'car-1', baselineSetupId: null, baselineSetup: setup.value, measuredInnerClearanceMm: inner, measuredOuterClearanceMm: outer, minimumDesiredInnerClearanceMm: null, minimumDesiredOuterClearanceMm: null, updatedAt: '2026-09-08T12:00:00.000Z' });
  if (!result.ok) throw new Error('Fixture profile must be valid');
  return result.value;
}

function request(overrides: Partial<CombinedSearchRequest> = {}): CombinedSearchRequest {
  return {
    clearanceProfile: profile(), goal: 'closestToCurrent',
    wheelWidthRangeInches: { min: 8, max: 8.5, step: 0.5 },
    wheelOffsetRangeMm: { min: 35, max: 45, step: 5 },
    targetRimDiameterInches: 18,
    tireWidthRangeMm: { min: 215, max: 235, step: 10 },
    tireAspectRatioRange: { min: 40, max: 50, step: 5 },
    maximumAbsoluteDiameterDifferencePercent: null,
    desiredInnerClearanceMm: null, desiredOuterClearanceMm: null, maxResults: 20,
    ...overrides,
  };
}

describe('combined fitment search', () => {
  it('preflights the full Cartesian candidate count before searching', () => {
    const result = preflightCombinedSearch(request());
    expect(result).toEqual({ ok: true, value: { wheelCandidateCount: 6, tireCandidateCount: 9, combinationCount: 54, maximumCombinationCount: COMBINED_SEARCH_LIMITS.maxCombinations } });
  });

  it('stops above the documented performance ceiling', () => {
    const oversized = request({
      wheelWidthRangeInches: { min: 7, max: 11.5, step: 0.5 }, wheelOffsetRangeMm: { min: 0, max: 9, step: 1 },
      tireWidthRangeMm: { min: 80, max: 380, step: 10 }, tireAspectRatioRange: { min: 20, max: 60, step: 5 },
    });
    const preflight = preflightCombinedSearch(oversized);
    const search = searchCombinedFitment(oversized);
    expect(preflight).toMatchObject({ ok: false, issues: [{ field: 'combinationCount', received: 27_900 }] });
    expect(search).toEqual(preflight);
  });

  it('creates correct wheel+tire calculations with matching rim diameters', () => {
    const result = searchCombinedFitment(request({ wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, wheelOffsetRangeMm: { min: 40, max: 40, step: 5 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 }, maxResults: 1 }));
    if (!result.ok) throw new Error('Search must be valid');
    const candidate = result.value.candidates[0]!;
    expect(candidate.setup.wheel.diameterInches).toBe(candidate.setup.tire.rimDiameterInches);
    expect(candidate.wheelGeometry).toMatchObject({ innerPositionChangeMm: 0, outerPokeChangeMm: 0, projectedInnerClearanceMm: 30, projectedOuterClearanceMm: 30, state: 'green' });
    expect(candidate.tireGeometry).toMatchObject({ diameterDifferenceMm: 0, diameterDifferencePercent: 0, sidewallDifferenceMm: 0, circumferenceDifferenceMm: 0, speedometerDifferencePercent: 0 });
  });

  it('stays inside every requested wheel and tire range and is deterministic', () => {
    const first = searchCombinedFitment(request());
    const second = searchCombinedFitment(request());
    expect(first).toEqual(second);
    if (!first.ok) throw new Error('Search must be valid');
    expect(first.value.candidates.every(({ setup }) => setup.wheel.widthInches >= 8 && setup.wheel.widthInches <= 8.5 && setup.wheel.offsetMm >= 35 && setup.wheel.offsetMm <= 45 && setup.tire.widthMm >= 215 && setup.tire.widthMm <= 235 && setup.tire.aspectRatio >= 40 && setup.tire.aspectRatio <= 50)).toBe(true);
  });

  it('applies an explicit diameter constraint and invents none when omitted', () => {
    const unrestricted = searchCombinedFitment(request());
    const restricted = searchCombinedFitment(request({ maximumAbsoluteDiameterDifferencePercent: 0.1 }));
    if (!unrestricted.ok || !restricted.ok) throw new Error('Searches must be valid');
    expect(unrestricted.value.eligibleTireCandidateCount).toBe(9);
    expect(restricted.value.eligibleTireCandidateCount).toBe(1);
    expect(restricted.value.candidates.every(({ tireGeometry }) => Math.abs(tireGeometry.diameterDifferencePercent) <= 0.1)).toBe(true);
  });

  it('rejects red wheel geometry while retaining its count', () => {
    const result = searchCombinedFitment(request({ clearanceProfile: profile(1, 1), wheelWidthRangeInches: { min: 8, max: 9, step: 1 }, wheelOffsetRangeMm: { min: 40, max: 40, step: 5 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 } }));
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.rejectedOverlapWheelCount).toBe(1);
    expect(result.value.candidates.every(({ wheelGeometry }) => wheelGeometry.state !== 'red')).toBe(true);
    expect(result.value.candidates[0]?.explanation.verdict).toBe('geometry-only');
    expect(JSON.stringify(result.value.candidates)).not.toContain('road-safe');
  });

  it('ranks closestToCurrent lexicographically', () => {
    const result = searchCombinedFitment(request());
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.candidates[0]?.setup.wheel).toMatchObject({ widthInches: 8, offsetMm: 40 });
    expect(result.value.candidates[0]?.setup.tire).toMatchObject({ widthMm: 225, aspectRatio: 45 });
    expect(result.value.candidates[0]?.explanation.orderedCriteria.map(({ key }) => key)).toEqual(['geometryChange', 'tireDiameterDifference']);
  });

  it('uses deterministic wheel tie-breaks and supports the two directional goals', () => {
    const tied = searchCombinedFitment(request({ wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, wheelOffsetRangeMm: { min: 35, max: 45, step: 10 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 } }));
    const outer = searchCombinedFitment(request({ goal: 'moreOuterPresence', wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 } }));
    const inner = searchCombinedFitment(request({ goal: 'moreInnerClearance', wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 } }));
    if (!tied.ok || !outer.ok || !inner.ok) throw new Error('Searches must be valid');
    expect(tied.value.candidates.map(({ setup }) => setup.wheel.offsetMm)).toEqual([35, 45]);
    expect(outer.value.candidates[0]?.setup.wheel.offsetMm).toBe(35);
    expect(inner.value.candidates[0]?.setup.wheel.offsetMm).toBe(35);
  });

  it('ranks balanced clearance before tire and geometry tie-breaks', () => {
    const result = searchCombinedFitment(request({ clearanceProfile: profile(30, 10), goal: 'balancedClearance', wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 } }));
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.candidates[0]?.setup.wheel.offsetMm).toBe(45);
    expect(result.value.candidates[0]?.explanation.orderedCriteria.map(({ key }) => key)).toEqual(['minimumClearance', 'tireDiameterDifference', 'geometryChange']);
  });

  it('ranks closest to an explicit outer-clearance target', () => {
    const result = searchCombinedFitment(request({ clearanceProfile: profile(30, 10), goal: 'targetOuterClearance', desiredOuterClearanceMm: 5, wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 } }));
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.candidates[0]?.setup.wheel.offsetMm).toBe(35);
    expect(result.value.candidates[0]?.explanation.orderedCriteria[0]).toMatchObject({ key: 'outerTargetDistance', value: 0 });
  });

  it('preserves provenance and reports explicit constraint distance', () => {
    const result = searchCombinedFitment(request({ desiredInnerClearanceMm: 10, desiredOuterClearanceMm: 10, maximumAbsoluteDiameterDifferencePercent: 2 }));
    if (!result.ok) throw new Error('Search must be valid');
    const candidate = result.value.candidates[0]!;
    expect(candidate.provenance).toEqual({ measuredClearance: 'userMeasured', desiredClearance: 'userTarget', wheelGeometry: 'calculated', tireGeometry: 'calculated' });
    expect(candidate.explanation.constraints).toHaveLength(3);
    expect(candidate.explanation.constraints.every(({ source }) => source === 'userTarget')).toBe(true);
  });

  it('feeds the existing comparison engine without rewriting calculations', () => {
    const result = searchCombinedFitment(request({ maxResults: 1 }));
    if (!result.ok) throw new Error('Search must be valid');
    const comparison = compareFitment(result.value.candidates[0]!.setup, result.value.candidates[0]!.setup);
    expect(comparison).toMatchObject({ diameterDifferenceMm: 0, wheelInnerPositionChangeMm: 0, wheelOuterPokeChangeMm: 0 });
  });

  it('reports missing and invalid guided measurements in a controlled form', () => {
    const base = {
      vehicleId: 'car-1', baselineSetupId: null,
      baselineSetup: { tireWidthMm: 225, tireAspectRatio: 45, rimDiameterInches: 18, wheelWidthInches: 8, wheelOffsetMm: 40 },
      measuredInnerClearanceMm: null, measuredOuterClearanceMm: -1, desiredInnerClearanceMm: null, desiredOuterClearanceMm: null,
      goal: 'closestToCurrent', wheelWidthRangeInches: { min: 8, max: 8, step: 0.5 }, wheelOffsetRangeMm: { min: 40, max: 40, step: 5 },
      targetRimDiameterInches: 18, tireWidthRangeMm: { min: 225, max: 225, step: 10 }, tireAspectRatioRange: { min: 45, max: 45, step: 5 },
      maximumAbsoluteDiameterDifferencePercent: null, maxResults: 1, nowIso: '2026-09-08T12:00:00.000Z',
    } as const;
    expect(createCombinedSearchRequest(base)).toMatchObject({ ok: false, issues: [{ code: 'required', field: 'measuredInnerClearanceMm' }] });
    expect(createCombinedSearchRequest({ ...base, measuredInnerClearanceMm: 10 })).toMatchObject({ ok: false, issues: [{ code: 'out-of-range', field: 'measuredOuterClearanceMm' }] });
  });
});
