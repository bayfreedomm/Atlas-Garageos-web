import type { DataSource } from '../../domain/clearance';
import type { FitmentGoal } from '../../domain/fitment-goal';
import type { VehicleSetup } from '../../domain/vehicle';
import type { TireCandidateResult } from '../tire/search';
import type { FitmentMapCell } from './map';

export interface RankedCriterion {
  readonly key: 'outerPresence' | 'innerClearance' | 'minimumClearance' | 'outerTargetDistance' | 'geometryChange' | 'tireDiameterDifference';
  readonly value: number;
  readonly unit: 'mm' | 'percent';
  readonly preferred: 'higher' | 'lower';
}

export interface EvaluatedConstraint {
  readonly key: 'minimumInnerClearance' | 'minimumOuterClearance' | 'maximumAbsoluteDiameterDifference';
  readonly requested: number;
  readonly actual: number;
  readonly difference: number;
  readonly satisfied: boolean;
  readonly source: 'userTarget';
}

export interface CombinedCandidateExplanation {
  readonly goal: FitmentGoal;
  readonly orderedCriteria: readonly RankedCriterion[];
  readonly constraints: readonly EvaluatedConstraint[];
  readonly verdict: 'geometry-only';
}

export interface CombinedFitmentCandidate {
  readonly rank: number;
  readonly setup: VehicleSetup;
  readonly wheelGeometry: FitmentMapCell;
  readonly tireGeometry: TireCandidateResult;
  readonly explanation: CombinedCandidateExplanation;
  readonly provenance: {
    readonly measuredClearance: 'userMeasured';
    readonly desiredClearance: 'userTarget' | null;
    readonly wheelGeometry: Extract<DataSource, 'calculated'>;
    readonly tireGeometry: Extract<DataSource, 'calculated'>;
  };
}
