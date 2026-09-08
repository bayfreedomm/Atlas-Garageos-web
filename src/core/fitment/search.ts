import type { VehicleClearanceProfile } from '../../domain/clearance';
import type { ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import { createFitmentMap, type FitmentMapCell, type NumericRange } from './map';

export type WhatFitsRanking =
  | { readonly mode: 'nearestToCandidate'; readonly targetWidthInches: number; readonly targetOffsetMm: number }
  | { readonly mode: 'maximizeClearance' }
  | { readonly mode: 'minimizeGeometryChange' }
  | { readonly mode: 'targetOuterClearance'; readonly targetOuterClearanceMm: number };

export type RankingExplanation =
  | { readonly mode: 'nearestToCandidate'; readonly distanceInGridSteps: number; readonly widthSteps: number; readonly offsetSteps: number }
  | { readonly mode: 'maximizeClearance'; readonly minimumProjectedClearanceMm: number }
  | { readonly mode: 'minimizeGeometryChange'; readonly totalAbsolutePositionChangeMm: number }
  | { readonly mode: 'targetOuterClearance'; readonly distanceFromOuterTargetMm: number; readonly targetOuterClearanceMm: number };

export interface WhatFitsRequest {
  readonly clearanceProfile: VehicleClearanceProfile;
  readonly widthRangeInches: NumericRange;
  readonly offsetRangeMm: NumericRange;
  readonly ranking: WhatFitsRanking;
  readonly maxResults: number;
}

export interface RankedWheelCandidate {
  readonly rank: number;
  readonly cell: FitmentMapCell;
  readonly explanation: RankingExplanation;
}

export interface WhatFitsResult {
  readonly evaluatedCandidateCount: number;
  readonly rejectedOverlapCount: number;
  readonly yellowCount: number;
  readonly greenCount: number;
  readonly candidates: readonly RankedWheelCandidate[];
}

function explanationFor(cell: FitmentMapCell, request: WhatFitsRequest): RankingExplanation {
  switch (request.ranking.mode) {
    case 'nearestToCandidate': {
      const widthSteps = Math.abs(cell.wheelWidthInches - request.ranking.targetWidthInches) / request.widthRangeInches.step;
      const offsetSteps = Math.abs(cell.offsetMm - request.ranking.targetOffsetMm) / request.offsetRangeMm.step;
      return { mode: request.ranking.mode, distanceInGridSteps: widthSteps + offsetSteps, widthSteps, offsetSteps };
    }
    case 'maximizeClearance':
      return { mode: request.ranking.mode, minimumProjectedClearanceMm: Math.min(cell.projectedInnerClearanceMm, cell.projectedOuterClearanceMm) };
    case 'minimizeGeometryChange':
      return { mode: request.ranking.mode, totalAbsolutePositionChangeMm: Math.abs(cell.innerPositionChangeMm) + Math.abs(cell.outerPokeChangeMm) };
    case 'targetOuterClearance':
      return {
        mode: request.ranking.mode,
        distanceFromOuterTargetMm: Math.abs(cell.projectedOuterClearanceMm - request.ranking.targetOuterClearanceMm),
        targetOuterClearanceMm: request.ranking.targetOuterClearanceMm,
      };
  }
}

const metric = (explanation: RankingExplanation): number => {
  switch (explanation.mode) {
    case 'nearestToCandidate': return explanation.distanceInGridSteps;
    case 'maximizeClearance': return -explanation.minimumProjectedClearanceMm;
    case 'minimizeGeometryChange': return explanation.totalAbsolutePositionChangeMm;
    case 'targetOuterClearance': return explanation.distanceFromOuterTargetMm;
  }
};

export function searchWhatFits(request: WhatFitsRequest): ValidationResult<WhatFitsResult> {
  if (!Number.isInteger(request.maxResults) || request.maxResults < 1 || request.maxResults > 100) {
    return invalid({ code: 'out-of-range', field: 'maxResults', message: 'maxResults must be an integer between 1 and 100.', received: request.maxResults });
  }
  if (request.ranking.mode === 'nearestToCandidate' && ![request.ranking.targetWidthInches, request.ranking.targetOffsetMm].every(Number.isFinite)) {
    return invalid({ code: 'not-a-number', field: 'ranking', message: 'Nearest-candidate targets must be finite numbers.' });
  }
  if (request.ranking.mode === 'targetOuterClearance' && !Number.isFinite(request.ranking.targetOuterClearanceMm)) {
    return invalid({ code: 'not-a-number', field: 'ranking.targetOuterClearanceMm', message: 'Outer-clearance target must be a finite number.' });
  }

  const map = createFitmentMap({
    clearanceProfile: request.clearanceProfile,
    widthRangeInches: request.widthRangeInches,
    offsetRangeMm: request.offsetRangeMm,
  });
  if (!map.ok) return map;

  const greenCount = map.value.cells.reduce((count, cell) => count + Number(cell.state === 'green'), 0);
  const yellowCount = map.value.cells.reduce((count, cell) => count + Number(cell.state === 'yellow'), 0);
  const rejectedOverlapCount = map.value.cells.length - greenCount - yellowCount;
  const baseline = request.clearanceProfile.baselineSetup.wheel;
  const ranked = map.value.cells
    .filter((cell) => cell.state !== 'red')
    .map((cell) => ({ cell, explanation: explanationFor(cell, request) }))
    .sort((a, b) =>
      metric(a.explanation) - metric(b.explanation)
      || Math.abs(a.cell.wheelWidthInches - baseline.widthInches) - Math.abs(b.cell.wheelWidthInches - baseline.widthInches)
      || Math.abs(a.cell.offsetMm - baseline.offsetMm) - Math.abs(b.cell.offsetMm - baseline.offsetMm)
      || a.cell.wheelWidthInches - b.cell.wheelWidthInches
      || a.cell.offsetMm - b.cell.offsetMm)
    .slice(0, request.maxResults)
    .map((candidate, index) => Object.freeze({ rank: index + 1, ...candidate }));

  return valid(Object.freeze({
    evaluatedCandidateCount: map.value.cells.length,
    rejectedOverlapCount,
    yellowCount,
    greenCount,
    candidates: Object.freeze(ranked),
  }));
}
