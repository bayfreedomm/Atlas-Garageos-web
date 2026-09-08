import { createVehicleClearanceProfile, type VehicleClearanceProfile } from '../../domain/clearance';
import type { FitmentGoal } from '../../domain/fitment-goal';
import type { ValidationIssue, ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import { createVehicleSetup, createWheelSpec } from '../../domain/vehicle';
import { searchTireCandidates } from '../tire/search';
import { countNumericRangeValues, type NumericRange } from '../units/numeric-range';
import type { CombinedFitmentCandidate, EvaluatedConstraint, RankedCriterion } from './combined-candidate';
import { searchWhatFits, type WhatFitsRanking } from './search';

// These are browser-work limits, not safety or fitment rules. They keep the
// synchronous development flow bounded until measurements justify a worker.
export const COMBINED_SEARCH_LIMITS = Object.freeze({
  maxWheelCandidates: 100,
  maxTireCandidates: 500,
  maxCombinations: 25_000,
  maxResults: 100,
});

export interface CombinedSearchRequest {
  readonly clearanceProfile: VehicleClearanceProfile;
  readonly goal: FitmentGoal;
  readonly wheelWidthRangeInches: NumericRange;
  readonly wheelOffsetRangeMm: NumericRange;
  readonly targetRimDiameterInches: number;
  readonly tireWidthRangeMm: NumericRange;
  readonly tireAspectRatioRange: NumericRange;
  readonly maximumAbsoluteDiameterDifferencePercent: number | null;
  readonly desiredInnerClearanceMm: number | null;
  readonly desiredOuterClearanceMm: number | null;
  readonly maxResults: number;
}

export interface CombinedSearchPreflight {
  readonly wheelCandidateCount: number;
  readonly tireCandidateCount: number;
  readonly combinationCount: number;
  readonly maximumCombinationCount: number;
}

export interface CombinedSearchResult {
  readonly preflight: CombinedSearchPreflight;
  readonly eligibleWheelCandidateCount: number;
  readonly eligibleTireCandidateCount: number;
  readonly rejectedOverlapWheelCount: number;
  readonly candidates: readonly CombinedFitmentCandidate[];
}

function collectCount(result: ValidationResult<number>, issues: ValidationIssue[]): number {
  if (!result.ok) {
    issues.push(...result.issues);
    return 0;
  }
  return result.value;
}

export function preflightCombinedSearch(request: CombinedSearchRequest): ValidationResult<CombinedSearchPreflight> {
  const issues: ValidationIssue[] = [];
  const widthCount = collectCount(countNumericRangeValues(request.wheelWidthRangeInches, 'wheelWidthRangeInches'), issues);
  const offsetCount = collectCount(countNumericRangeValues(request.wheelOffsetRangeMm, 'wheelOffsetRangeMm'), issues);
  const tireWidthCount = collectCount(countNumericRangeValues(request.tireWidthRangeMm, 'tireWidthRangeMm'), issues);
  const aspectCount = collectCount(countNumericRangeValues(request.tireAspectRatioRange, 'tireAspectRatioRange'), issues);
  if (!Number.isInteger(request.maxResults) || request.maxResults < 1 || request.maxResults > COMBINED_SEARCH_LIMITS.maxResults) {
    issues.push({ code: 'out-of-range', field: 'maxResults', message: `maxResults must be an integer between 1 and ${COMBINED_SEARCH_LIMITS.maxResults}.`, received: request.maxResults });
  }
  const targetWheel = createWheelSpec({ ...request.clearanceProfile.baselineSetup.wheel, diameterInches: request.targetRimDiameterInches });
  if (!targetWheel.ok) issues.push(...targetWheel.issues.map((issue) => ({ ...issue, field: `targetRim.${issue.field}` })));
  if (issues.length > 0) return invalid(...issues);

  const wheelCandidateCount = widthCount * offsetCount;
  const tireCandidateCount = tireWidthCount * aspectCount;
  const combinationCount = wheelCandidateCount * tireCandidateCount;
  if (wheelCandidateCount > COMBINED_SEARCH_LIMITS.maxWheelCandidates) {
    return invalid({ code: 'out-of-range', field: 'wheelCandidateCount', message: `Wheel range creates ${wheelCandidateCount} candidates; narrow it to ${COMBINED_SEARCH_LIMITS.maxWheelCandidates} or fewer. This is a browser performance guard, not a fitment rule.`, received: wheelCandidateCount });
  }
  if (tireCandidateCount > COMBINED_SEARCH_LIMITS.maxTireCandidates) {
    return invalid({ code: 'out-of-range', field: 'tireCandidateCount', message: `Tire range creates ${tireCandidateCount} candidates; narrow it to ${COMBINED_SEARCH_LIMITS.maxTireCandidates} or fewer. This is a browser performance guard, not a fitment rule.`, received: tireCandidateCount });
  }
  if (combinationCount > COMBINED_SEARCH_LIMITS.maxCombinations) {
    return invalid({ code: 'out-of-range', field: 'combinationCount', message: `Search would evaluate ${combinationCount} combinations; narrow the ranges below the ${COMBINED_SEARCH_LIMITS.maxCombinations} browser-performance ceiling.`, received: combinationCount });
  }
  return valid(Object.freeze({ wheelCandidateCount, tireCandidateCount, combinationCount, maximumCombinationCount: COMBINED_SEARCH_LIMITS.maxCombinations }));
}

function goalRanking(request: CombinedSearchRequest): ValidationResult<WhatFitsRanking> {
  switch (request.goal) {
    case 'closestToCurrent': return valid({ mode: 'minimizeGeometryChange' });
    case 'moreOuterPresence': return valid({ mode: 'maximizeOuterPresence' });
    case 'moreInnerClearance': return valid({ mode: 'maximizeInnerClearance' });
    case 'balancedClearance': return valid({ mode: 'maximizeClearance' });
    case 'targetOuterClearance':
      return request.desiredOuterClearanceMm === null
        ? invalid({ code: 'required', field: 'desiredOuterClearanceMm', message: 'targetOuterClearance requires an explicit outer-clearance target.' })
        : valid({ mode: 'targetOuterClearance', targetOuterClearanceMm: request.desiredOuterClearanceMm });
  }
}

function criteriaFor(goal: FitmentGoal, wheel: CombinedFitmentCandidate['wheelGeometry'], tire: CombinedFitmentCandidate['tireGeometry'], outerTarget: number | null): readonly RankedCriterion[] {
  const geometryChange = Math.abs(wheel.innerPositionChangeMm) + Math.abs(wheel.outerPokeChangeMm);
  const tireDifference = Math.abs(tire.diameterDifferencePercent);
  const secondary = (): RankedCriterion[] => [
    { key: 'tireDiameterDifference', value: tireDifference, unit: 'percent', preferred: 'lower' },
    { key: 'geometryChange', value: geometryChange, unit: 'mm', preferred: 'lower' },
  ];
  switch (goal) {
    case 'closestToCurrent': return Object.freeze([{ key: 'geometryChange', value: geometryChange, unit: 'mm', preferred: 'lower' }, { key: 'tireDiameterDifference', value: tireDifference, unit: 'percent', preferred: 'lower' }]);
    case 'moreOuterPresence': return Object.freeze([{ key: 'outerPresence', value: wheel.outerPokeChangeMm, unit: 'mm', preferred: 'higher' }, ...secondary()]);
    case 'moreInnerClearance': return Object.freeze([{ key: 'innerClearance', value: wheel.projectedInnerClearanceMm, unit: 'mm', preferred: 'higher' }, ...secondary()]);
    case 'balancedClearance': return Object.freeze([{ key: 'minimumClearance', value: Math.min(wheel.projectedInnerClearanceMm, wheel.projectedOuterClearanceMm), unit: 'mm', preferred: 'higher' }, ...secondary()]);
    case 'targetOuterClearance': return Object.freeze([{ key: 'outerTargetDistance', value: Math.abs(wheel.projectedOuterClearanceMm - outerTarget!), unit: 'mm', preferred: 'lower' }, ...secondary()]);
  }
}

function constraintsFor(request: CombinedSearchRequest, wheel: CombinedFitmentCandidate['wheelGeometry'], tire: CombinedFitmentCandidate['tireGeometry']): readonly EvaluatedConstraint[] {
  const constraints: EvaluatedConstraint[] = [];
  if (request.desiredInnerClearanceMm !== null) constraints.push({ key: 'minimumInnerClearance', requested: request.desiredInnerClearanceMm, actual: wheel.projectedInnerClearanceMm, difference: wheel.projectedInnerClearanceMm - request.desiredInnerClearanceMm, satisfied: wheel.projectedInnerClearanceMm >= request.desiredInnerClearanceMm, source: 'userTarget' });
  if (request.desiredOuterClearanceMm !== null) constraints.push({ key: 'minimumOuterClearance', requested: request.desiredOuterClearanceMm, actual: wheel.projectedOuterClearanceMm, difference: wheel.projectedOuterClearanceMm - request.desiredOuterClearanceMm, satisfied: wheel.projectedOuterClearanceMm >= request.desiredOuterClearanceMm, source: 'userTarget' });
  if (request.maximumAbsoluteDiameterDifferencePercent !== null) constraints.push({ key: 'maximumAbsoluteDiameterDifference', requested: request.maximumAbsoluteDiameterDifferencePercent, actual: Math.abs(tire.diameterDifferencePercent), difference: request.maximumAbsoluteDiameterDifferencePercent - Math.abs(tire.diameterDifferencePercent), satisfied: Math.abs(tire.diameterDifferencePercent) <= request.maximumAbsoluteDiameterDifferencePercent, source: 'userTarget' });
  return Object.freeze(constraints);
}

function compareCriteria(a: readonly RankedCriterion[], b: readonly RankedCriterion[]): number {
  for (let index = 0; index < a.length; index += 1) {
    const direction = a[index]!.preferred === 'higher' ? -1 : 1;
    const comparison = (a[index]!.value - b[index]!.value) * direction;
    if (comparison !== 0) return comparison;
  }
  return 0;
}

export function searchCombinedFitment(request: CombinedSearchRequest): ValidationResult<CombinedSearchResult> {
  const preflight = preflightCombinedSearch(request);
  if (!preflight.ok) return preflight;
  const ranking = goalRanking(request);
  if (!ranking.ok) return ranking;
  const effectiveProfile = createVehicleClearanceProfile({
    vehicleId: request.clearanceProfile.vehicleId,
    baselineSetupId: request.clearanceProfile.baselineSetupId,
    baselineSetup: request.clearanceProfile.baselineSetup,
    measuredInnerClearanceMm: request.clearanceProfile.measuredInnerClearance.valueMm,
    measuredOuterClearanceMm: request.clearanceProfile.measuredOuterClearance.valueMm,
    minimumDesiredInnerClearanceMm: request.desiredInnerClearanceMm,
    minimumDesiredOuterClearanceMm: request.desiredOuterClearanceMm,
    updatedAt: request.clearanceProfile.updatedAt,
  });
  if (!effectiveProfile.ok) return effectiveProfile;
  const wheelSearch = searchWhatFits({ clearanceProfile: effectiveProfile.value, widthRangeInches: request.wheelWidthRangeInches, offsetRangeMm: request.wheelOffsetRangeMm, ranking: ranking.value, maxResults: preflight.value.wheelCandidateCount });
  if (!wheelSearch.ok) return wheelSearch;
  const tireSearch = searchTireCandidates({ baselineTire: request.clearanceProfile.baselineSetup.tire, targetRimDiameterInches: request.targetRimDiameterInches, widthRangeMm: request.tireWidthRangeMm, aspectRatioRange: request.tireAspectRatioRange, maximumAbsoluteDiameterDifferencePercent: request.maximumAbsoluteDiameterDifferencePercent, maxResults: preflight.value.tireCandidateCount });
  if (!tireSearch.ok) return tireSearch;

  const candidates: CombinedFitmentCandidate[] = [];
  for (const wheel of wheelSearch.value.candidates) {
    const wheelSpec = createWheelSpec({ diameterInches: request.targetRimDiameterInches, widthInches: wheel.cell.wheelWidthInches, offsetMm: wheel.cell.offsetMm });
    if (!wheelSpec.ok) return wheelSpec;
    for (const tire of tireSearch.value.candidates) {
      const setup = createVehicleSetup(tire.tire, wheelSpec.value);
      if (!setup.ok) return setup;
      const orderedCriteria = criteriaFor(request.goal, wheel.cell, tire, request.desiredOuterClearanceMm);
      candidates.push(Object.freeze({
        rank: 0,
        setup: setup.value,
        wheelGeometry: wheel.cell,
        tireGeometry: tire,
        explanation: Object.freeze({ goal: request.goal, orderedCriteria, constraints: constraintsFor(request, wheel.cell, tire), verdict: 'geometry-only' as const }),
        provenance: Object.freeze({ measuredClearance: 'userMeasured' as const, desiredClearance: request.desiredInnerClearanceMm === null && request.desiredOuterClearanceMm === null ? null : 'userTarget' as const, wheelGeometry: 'calculated' as const, tireGeometry: 'calculated' as const }),
      }));
    }
  }
  const baseline = request.clearanceProfile.baselineSetup;
  candidates.sort((a, b) =>
    compareCriteria(a.explanation.orderedCriteria, b.explanation.orderedCriteria)
    || Math.abs(a.setup.wheel.widthInches - baseline.wheel.widthInches) - Math.abs(b.setup.wheel.widthInches - baseline.wheel.widthInches)
    || Math.abs(a.setup.wheel.offsetMm - baseline.wheel.offsetMm) - Math.abs(b.setup.wheel.offsetMm - baseline.wheel.offsetMm)
    || a.setup.wheel.widthInches - b.setup.wheel.widthInches
    || a.setup.wheel.offsetMm - b.setup.wheel.offsetMm
    || Math.abs(a.setup.tire.widthMm - baseline.tire.widthMm) - Math.abs(b.setup.tire.widthMm - baseline.tire.widthMm)
    || Math.abs(a.setup.tire.aspectRatio - baseline.tire.aspectRatio) - Math.abs(b.setup.tire.aspectRatio - baseline.tire.aspectRatio)
    || a.setup.tire.widthMm - b.setup.tire.widthMm
    || a.setup.tire.aspectRatio - b.setup.tire.aspectRatio);
  const ranked = candidates.slice(0, request.maxResults).map((candidate, index) => Object.freeze({ ...candidate, rank: index + 1 }));
  return valid(Object.freeze({ preflight: preflight.value, eligibleWheelCandidateCount: wheelSearch.value.candidates.length, eligibleTireCandidateCount: tireSearch.value.candidates.length, rejectedOverlapWheelCount: wheelSearch.value.rejectedOverlapCount, candidates: Object.freeze(ranked) }));
}
