import type { TireCandidateResult } from '../tire/search';
import type { FitmentMapCell } from './map';

export interface CombinedFitmentCandidate {
  readonly wheelGeometry: FitmentMapCell;
  readonly tireGeometry: TireCandidateResult;
}

// Composition boundary for future bounded wheel+tire searches. It performs no
// cross-product search and introduces no new geometry formulas.
export function combineWheelAndTireCandidate(
  wheelGeometry: FitmentMapCell,
  tireGeometry: TireCandidateResult,
): CombinedFitmentCandidate {
  return Object.freeze({ wheelGeometry, tireGeometry });
}
