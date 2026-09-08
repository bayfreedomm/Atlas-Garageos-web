import { createWheelSpec, type WheelSpec } from '../../domain/vehicle';
import type { VehicleClearanceProfile } from '../../domain/clearance';
import type { ValidationIssue, ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import { evaluateWheelGeometry, type GeometryEvaluation } from './clearance';
import { createNumericRangeValues, type NumericRange } from '../units/numeric-range';

export type { NumericRange } from '../units/numeric-range';

export interface FitmentMapRequest {
  readonly clearanceProfile: VehicleClearanceProfile;
  readonly widthRangeInches: NumericRange;
  readonly offsetRangeMm: NumericRange;
}

export interface FitmentMapCell extends GeometryEvaluation {
  readonly wheelWidthInches: number;
  readonly offsetMm: number;
}

export interface FitmentMapResult {
  readonly rimDiameterInches: number;
  readonly widthValuesInches: readonly number[];
  readonly offsetValuesMm: readonly number[];
  readonly widthStepInches: number;
  readonly offsetStepMm: number;
  readonly cells: readonly FitmentMapCell[];
}

export function createFitmentMap(request: FitmentMapRequest): ValidationResult<FitmentMapResult> {
  const widths = createNumericRangeValues(request.widthRangeInches, 'widthRangeInches');
  const offsets = createNumericRangeValues(request.offsetRangeMm, 'offsetRangeMm');
  const issues: ValidationIssue[] = [];
  if (!widths.ok) issues.push(...widths.issues);
  if (!offsets.ok) issues.push(...offsets.issues);
  if (!widths.ok || !offsets.ok) return invalid(...issues);

  const cells: FitmentMapCell[] = [];
  const baselineWheel = request.clearanceProfile.baselineSetup.wheel;
  for (const width of widths.value) {
    for (const offset of offsets.value) {
      const candidate = createWheelSpec({ diameterInches: baselineWheel.diameterInches, widthInches: width, offsetMm: offset });
      if (!candidate.ok) return invalid(...candidate.issues);
      cells.push(Object.freeze({
        wheelWidthInches: width,
        offsetMm: offset,
        ...evaluateWheelGeometry(baselineWheel, candidate.value, request.clearanceProfile),
      }));
    }
  }

  return valid(Object.freeze({
    rimDiameterInches: baselineWheel.diameterInches,
    widthValuesInches: widths.value,
    offsetValuesMm: offsets.value,
    widthStepInches: request.widthRangeInches.step,
    offsetStepMm: request.offsetRangeMm.step,
    cells: Object.freeze(cells),
  }));
}

export interface RankedGreenAlternative {
  readonly cell: FitmentMapCell;
  readonly distanceInGridSteps: number;
}

export function findNearestGreenAlternatives(
  candidate: Pick<WheelSpec, 'widthInches' | 'offsetMm'>,
  map: FitmentMapResult,
  limit: number,
): readonly RankedGreenAlternative[] {
  if (!Number.isInteger(limit) || limit <= 0) return Object.freeze([]);
  return Object.freeze(map.cells
    .filter((cell) => cell.state === 'green' && (cell.wheelWidthInches !== candidate.widthInches || cell.offsetMm !== candidate.offsetMm))
    .map((cell) => ({
      cell,
      // One width grid step and one offset grid step each cost one point.
      distanceInGridSteps:
        Math.abs(cell.wheelWidthInches - candidate.widthInches) / map.widthStepInches
        + Math.abs(cell.offsetMm - candidate.offsetMm) / map.offsetStepMm,
    }))
    .sort((a, b) =>
      a.distanceInGridSteps - b.distanceInGridSteps
      || Math.abs(a.cell.wheelWidthInches - candidate.widthInches) - Math.abs(b.cell.wheelWidthInches - candidate.widthInches)
      || Math.abs(a.cell.offsetMm - candidate.offsetMm) - Math.abs(b.cell.offsetMm - candidate.offsetMm)
      || a.cell.wheelWidthInches - b.cell.wheelWidthInches
      || a.cell.offsetMm - b.cell.offsetMm)
    .slice(0, limit));
}
