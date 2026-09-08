import { createWheelSpec, type WheelSpec } from '../../domain/vehicle';
import type { VehicleClearanceProfile } from '../../domain/clearance';
import type { ValidationIssue, ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import { evaluateWheelGeometry, type GeometryEvaluation } from './clearance';

export interface NumericRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

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

function valuesForRange(range: NumericRange, field: string): ValidationResult<readonly number[]> {
  const issue = (message: string): ValidationResult<readonly number[]> => invalid({ code: 'out-of-range', field, message, received: range });
  if (![range.min, range.max, range.step].every(Number.isFinite)) return issue(`${field} values must be finite numbers.`);
  if (range.step <= 0) return issue(`${field} step must be greater than zero.`);
  if (range.max < range.min) return issue(`${field} maximum must be greater than or equal to its minimum.`);
  const count = Math.floor((range.max - range.min) / range.step + 1e-9) + 1;
  if (count > 100) return issue(`${field} may contain at most 100 values.`);
  const decimals = Math.min(8, Math.max(0, String(range.step).split('.')[1]?.length ?? 0));
  return valid(Object.freeze(Array.from({ length: count }, (_, index) => Number((range.min + index * range.step).toFixed(decimals)))));
}

export function createFitmentMap(request: FitmentMapRequest): ValidationResult<FitmentMapResult> {
  const widths = valuesForRange(request.widthRangeInches, 'widthRangeInches');
  const offsets = valuesForRange(request.offsetRangeMm, 'offsetRangeMm');
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
