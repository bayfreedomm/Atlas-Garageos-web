import type { VehicleClearanceProfile } from '../../domain/clearance';
import type { WheelSpec } from '../../domain/vehicle';
import { compareWheelPosition } from '../wheel/position';

export type GeometryState = 'green' | 'yellow' | 'red';
export type GeometryReason =
  | 'inner-overlap'
  | 'outer-overlap'
  | 'inner-below-target'
  | 'outer-below-target'
  | 'meets-targets'
  | 'no-targets';

export interface ProjectedClearance {
  readonly innerPositionChangeMm: number;
  readonly outerPokeChangeMm: number;
  readonly projectedInnerClearanceMm: number;
  readonly projectedOuterClearanceMm: number;
}

export interface GeometryEvaluation extends ProjectedClearance {
  readonly state: GeometryState;
  readonly reasons: readonly GeometryReason[];
}

export function projectWheelClearance(
  baseline: WheelSpec,
  candidate: WheelSpec,
  measuredInnerClearanceMm: number,
  measuredOuterClearanceMm: number,
): ProjectedClearance {
  const position = compareWheelPosition(baseline, candidate);
  return {
    ...position,
    projectedInnerClearanceMm: measuredInnerClearanceMm - position.innerPositionChangeMm,
    projectedOuterClearanceMm: measuredOuterClearanceMm - position.outerPokeChangeMm,
  };
}

export function evaluateWheelGeometry(
  baseline: WheelSpec,
  candidate: WheelSpec,
  profile: VehicleClearanceProfile,
): GeometryEvaluation {
  const projected = projectWheelClearance(
    baseline,
    candidate,
    profile.measuredInnerClearance.valueMm,
    profile.measuredOuterClearance.valueMm,
  );
  const reasons: GeometryReason[] = [];
  if (projected.projectedInnerClearanceMm < 0) reasons.push('inner-overlap');
  if (projected.projectedOuterClearanceMm < 0) reasons.push('outer-overlap');
  if (reasons.length > 0) return { ...projected, state: 'red', reasons };

  const innerTarget = profile.minimumDesiredInnerClearanceMm;
  const outerTarget = profile.minimumDesiredOuterClearanceMm;
  if (innerTarget !== null && projected.projectedInnerClearanceMm < innerTarget) reasons.push('inner-below-target');
  if (outerTarget !== null && projected.projectedOuterClearanceMm < outerTarget) reasons.push('outer-below-target');
  if (reasons.length > 0) return { ...projected, state: 'yellow', reasons };

  reasons.push(innerTarget === null && outerTarget === null ? 'no-targets' : 'meets-targets');
  return { ...projected, state: 'green', reasons };
}
