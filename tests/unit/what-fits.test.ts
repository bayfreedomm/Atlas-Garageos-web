import { describe, expect, it } from 'vitest';
import { searchWhatFits, type WhatFitsRanking } from '../../src/core/fitment/search';
import { createVehicleClearanceProfile } from '../../src/domain/clearance';
import { createTireSize, createVehicleSetup, createWheelSpec } from '../../src/domain/vehicle';
import { compareSetupInputs } from '../../src/features/compare/compare-setups';

function profile(inner = 30, outer = 30, desiredInner: number | null = 5, desiredOuter: number | null = 5) {
  const tire = createTireSize({ widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 });
  const wheel = createWheelSpec({ diameterInches: 18, widthInches: 8, offsetMm: 40 });
  if (!tire.ok || !wheel.ok) throw new Error('Fixtures must be valid');
  const setup = createVehicleSetup(tire.value, wheel.value);
  if (!setup.ok) throw new Error('Fixture setup must be valid');
  const result = createVehicleClearanceProfile({
    vehicleId: 'vehicle-1', baselineSetupId: null, baselineSetup: setup.value,
    measuredInnerClearanceMm: inner, measuredOuterClearanceMm: outer,
    minimumDesiredInnerClearanceMm: desiredInner, minimumDesiredOuterClearanceMm: desiredOuter,
    updatedAt: '2026-09-08T12:00:00.000Z',
  });
  if (!result.ok) throw new Error('Profile fixture must be valid');
  return result.value;
}

const search = (ranking: WhatFitsRanking) => searchWhatFits({
  clearanceProfile: profile(),
  widthRangeInches: { min: 8, max: 9, step: 0.5 },
  offsetRangeMm: { min: 35, max: 45, step: 5 },
  ranking,
  maxResults: 9,
});

describe('What Fits search', () => {
  it('returns only requested-range candidates and deterministic output', () => {
    const first = search({ mode: 'nearestToCandidate', targetWidthInches: 8.5, targetOffsetMm: 35 });
    const second = search({ mode: 'nearestToCandidate', targetWidthInches: 8.5, targetOffsetMm: 35 });
    expect(first).toEqual(second);
    if (!first.ok) throw new Error('Search must be valid');
    expect(first.value.candidates.every(({ cell }) => cell.wheelWidthInches >= 8 && cell.wheelWidthInches <= 9 && cell.offsetMm >= 35 && cell.offsetMm <= 45)).toBe(true);
    expect(first.value.candidates[0]?.cell).toMatchObject({ wheelWidthInches: 8.5, offsetMm: 35 });
  });

  it('implements every explicit ranking formula', () => {
    const maximum = search({ mode: 'maximizeClearance' });
    const minimal = search({ mode: 'minimizeGeometryChange' });
    const target = search({ mode: 'targetOuterClearance', targetOuterClearanceMm: 18.65 });
    if (!maximum.ok || !minimal.ok || !target.ok) throw new Error('Searches must be valid');
    expect(maximum.value.candidates[0]?.cell).toMatchObject({ wheelWidthInches: 8, offsetMm: 40 });
    expect(maximum.value.candidates[0]?.explanation).toMatchObject({ minimumProjectedClearanceMm: 30 });
    expect(minimal.value.candidates[0]?.cell).toMatchObject({ wheelWidthInches: 8, offsetMm: 40 });
    expect(minimal.value.candidates[0]?.explanation).toMatchObject({ totalAbsolutePositionChangeMm: 0 });
    expect(target.value.candidates[0]?.cell).toMatchObject({ wheelWidthInches: 8.5, offsetMm: 35 });
  });

  it('uses deterministic tie-breakers', () => {
    const result = search({ mode: 'maximizeClearance' });
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.candidates.slice(1, 3).map(({ cell }) => cell.offsetMm)).toEqual([35, 45]);
  });

  it('counts all states and excludes red overlap from ranked matches', () => {
    const result = searchWhatFits({
      clearanceProfile: profile(12, 15, 7, 7),
      widthRangeInches: { min: 8, max: 8, step: 0.5 },
      offsetRangeMm: { min: 20, max: 60, step: 10 },
      ranking: { mode: 'minimizeGeometryChange' },
      maxResults: 10,
    });
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value).toMatchObject({ evaluatedCandidateCount: 5, rejectedOverlapCount: 2, yellowCount: 2, greenCount: 1 });
    expect(result.value.candidates).toHaveLength(3);
    expect(result.value.candidates.every(({ cell }) => cell.state !== 'red')).toBe(true);
  });

  it('does not introduce a clearance threshold and can feed the comparison engine', () => {
    const result = searchWhatFits({
      clearanceProfile: profile(0.1, 0.1, null, null),
      widthRangeInches: { min: 8, max: 8, step: 0.5 },
      offsetRangeMm: { min: 40, max: 40, step: 5 },
      ranking: { mode: 'minimizeGeometryChange' },
      maxResults: 1,
    });
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.candidates[0]?.cell.state).toBe('green');
    const candidate = result.value.candidates[0]!.cell;
    const comparison = compareSetupInputs(
      { tireWidthMm: 225, tireAspectRatio: 45, rimDiameterInches: 18, wheelWidthInches: 8, wheelOffsetMm: 40 },
      { tireWidthMm: 225, tireAspectRatio: 45, rimDiameterInches: 18, wheelWidthInches: candidate.wheelWidthInches, wheelOffsetMm: candidate.offsetMm },
    );
    expect(comparison.ok).toBe(true);
    if (comparison.ok) expect(comparison.value.wheelOuterPokeChangeMm).toBe(0);
  });

  it('handles a browser-friendly grid with bounded ranked output', () => {
    const result = searchWhatFits({
      clearanceProfile: profile(1_000, 1_000, null, null),
      widthRangeInches: { min: 7, max: 12.5, step: 0.5 },
      offsetRangeMm: { min: -10, max: 60, step: 1 },
      ranking: { mode: 'minimizeGeometryChange' },
      maxResults: 20,
    });
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.evaluatedCandidateCount).toBe(852);
    expect(result.value.candidates).toHaveLength(20);
  });
});
