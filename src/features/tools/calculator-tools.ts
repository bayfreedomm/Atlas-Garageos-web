import { calculateActualSpeed } from '../../core/fitment/compare';
import { calculateCircumferenceMm, calculateOverallDiameterMm, calculateRevolutionsPerKilometer, calculateRevolutionsPerMile, calculateSidewallHeightMm } from '../../core/tire/geometry';
import { searchTireCandidates } from '../../core/tire/search';
import { compareWheelPosition } from '../../core/wheel/position';
import { createTireSize, createWheelSpec, type TireSize } from '../../domain/vehicle';
import { invalid, valid, type ValidationIssue, type ValidationResult } from '../../domain/validation';

export interface TireToolInput { readonly widthMm: number; readonly aspectRatio: number; readonly rimDiameterInches: number; }
export interface WheelOffsetToolInput { readonly originalWidthInches: number; readonly originalOffsetMm: number; readonly newWidthInches: number; readonly newOffsetMm: number; }

const tireMetrics = (tire: TireSize) => Object.freeze({
  sidewallHeightMm: calculateSidewallHeightMm(tire), overallDiameterMm: calculateOverallDiameterMm(tire), circumferenceMm: calculateCircumferenceMm(tire),
  revolutionsPerKilometer: calculateRevolutionsPerKilometer(tire), revolutionsPerMile: calculateRevolutionsPerMile(tire),
});

function validatedTire(input: TireToolInput, prefix: string) {
  const result = createTireSize(input);
  return result.ok ? result : invalid(...result.issues.map((issue) => ({ ...issue, field: `${prefix}.${issue.field}` })));
}

export function calculateTireSizeTool(input: TireToolInput) {
  const tire = validatedTire(input, 'tire');
  return tire.ok ? valid(tireMetrics(tire.value)) : tire;
}

export function compareTireSizesTool(originalInput: TireToolInput, newInput: TireToolInput) {
  const original = validatedTire(originalInput, 'original');
  const proposed = validatedTire(newInput, 'new');
  const issues: ValidationIssue[] = [];
  if (!original.ok) issues.push(...original.issues);
  if (!proposed.ok) issues.push(...proposed.issues);
  if (!original.ok || !proposed.ok) return invalid(...issues);
  const current = tireMetrics(original.value);
  const next = tireMetrics(proposed.value);
  const diameterDifferenceMm = next.overallDiameterMm - current.overallDiameterMm;
  const diameterDifferencePercent = diameterDifferenceMm / current.overallDiameterMm * 100;
  return valid(Object.freeze({ current, proposed: next, diameterDifferenceMm, diameterDifferencePercent, sidewallDifferenceMm: next.sidewallHeightMm - current.sidewallHeightMm, circumferenceDifferenceMm: next.circumferenceMm - current.circumferenceMm, rideHeightDifferenceMm: diameterDifferenceMm / 2, speedometerDifferencePercent: diameterDifferencePercent }));
}

export interface NearEquivalentSize {
  readonly tire: TireSize;
  readonly overallDiameterMm: number;
  readonly diameterDifferencePercent: number;
}

// Rim sizes to try relative to the calculated tire's own rim (skips 0 — that would
// just restate the input). Kept close to the original so every suggestion stays a
// realistic plus/minus-sizing candidate rather than a wildly different tire.
const NEAR_SIZE_RIM_DELTAS = [-1, 1, 2] as const;
const NEAR_SIZE_MIN_RIM_INCHES = 13;
const NEAR_SIZE_MAX_RIM_INCHES = 24;
const NEAR_SIZE_WIDTH_SPAN_MM = 30;
const NEAR_SIZE_WIDTH_STEP_MM = 10;
const NEAR_SIZE_ASPECT_SPAN = 15;
const NEAR_SIZE_ASPECT_STEP = 5;
const NEAR_SIZE_MAX_DIAMETER_DIFFERENCE_PERCENT = 3;

/**
 * Calculated (not catalog-confirmed) tire sizes at nearby rim diameters that keep
 * overall diameter within a small tolerance of the input tire — the same
 * "plus sizing" search that powers Fitment Studio's What Fits search, reused here
 * to surface a couple of realistic alternates directly under a single tire-size
 * calculation. These are mathematically valid combinations, not a guarantee that a
 * manufacturer actually produces that exact size.
 */
export function nearEquivalentSizesTool(input: TireToolInput): ValidationResult<readonly NearEquivalentSize[]> {
  const baseline = validatedTire(input, 'tire');
  if (!baseline.ok) return baseline;
  const tire = baseline.value;
  const widthRangeMm = { min: Math.max(80, tire.widthMm - NEAR_SIZE_WIDTH_SPAN_MM), max: Math.min(500, tire.widthMm + NEAR_SIZE_WIDTH_SPAN_MM), step: NEAR_SIZE_WIDTH_STEP_MM };
  const aspectRatioRange = { min: Math.max(20, tire.aspectRatio - NEAR_SIZE_ASPECT_SPAN), max: Math.min(100, tire.aspectRatio + NEAR_SIZE_ASPECT_SPAN), step: NEAR_SIZE_ASPECT_STEP };
  const results: NearEquivalentSize[] = [];
  for (const delta of NEAR_SIZE_RIM_DELTAS) {
    const targetRimDiameterInches = tire.rimDiameterInches + delta;
    if (targetRimDiameterInches < NEAR_SIZE_MIN_RIM_INCHES || targetRimDiameterInches > NEAR_SIZE_MAX_RIM_INCHES) continue;
    const search = searchTireCandidates({
      baselineTire: tire,
      targetRimDiameterInches,
      widthRangeMm,
      aspectRatioRange,
      maximumAbsoluteDiameterDifferencePercent: NEAR_SIZE_MAX_DIAMETER_DIFFERENCE_PERCENT,
      maxResults: 1,
    });
    if (search.ok && search.value.candidates.length > 0) {
      const best = search.value.candidates[0]!;
      results.push(Object.freeze({ tire: best.tire, overallDiameterMm: best.overallDiameterMm, diameterDifferencePercent: best.diameterDifferencePercent }));
    }
  }
  results.sort((a, b) => a.tire.rimDiameterInches - b.tire.rimDiameterInches);
  return valid(Object.freeze(results));
}

export interface SpeedometerTableRow { readonly indicatedSpeed: number; readonly actualSpeed: number; }

// Representative indicated-speed checkpoints per unit — city/suburban/highway spread —
// so the table reads as a realistic driving range rather than an arbitrary grid.
const SPEED_TABLE_STEPS_KMH = [30, 50, 70, 90, 110, 130] as const;
const SPEED_TABLE_STEPS_MPH = [20, 30, 40, 50, 65, 80] as const;

/**
 * The same tire-diameter speedometer offset applied across a spread of indicated
 * speeds, instead of just the one the user typed — so a driver can see the actual
 * gap at city, suburban, and highway speeds in one glance.
 */
export function speedometerTableTool(original: TireToolInput, proposed: TireToolInput, unit: 'km/h' | 'mph'): ValidationResult<readonly SpeedometerTableRow[]> {
  const comparison = compareTireSizesTool(original, proposed);
  if (!comparison.ok) return comparison;
  const factor = 1 + comparison.value.speedometerDifferencePercent / 100;
  const steps = unit === 'mph' ? SPEED_TABLE_STEPS_MPH : SPEED_TABLE_STEPS_KMH;
  return valid(Object.freeze(steps.map((indicatedSpeed) => Object.freeze({ indicatedSpeed, actualSpeed: indicatedSpeed * factor }))));
}

export function calculateWheelOffsetTool(input: WheelOffsetToolInput) {
  const original = createWheelSpec({ diameterInches: 18, widthInches: input.originalWidthInches, offsetMm: input.originalOffsetMm });
  const proposed = createWheelSpec({ diameterInches: 18, widthInches: input.newWidthInches, offsetMm: input.newOffsetMm });
  const issues: ValidationIssue[] = [];
  if (!original.ok) issues.push(...original.issues.map((issue) => ({ ...issue, field: `original.${issue.field}` })));
  if (!proposed.ok) issues.push(...proposed.issues.map((issue) => ({ ...issue, field: `new.${issue.field}` })));
  if (!original.ok || !proposed.ok) return invalid(...issues);
  return valid(Object.freeze(compareWheelPosition(original.value, proposed.value)));
}

export function calculateSpeedometerTool(original: TireToolInput, proposed: TireToolInput, indicatedSpeed: number, unit: 'km/h' | 'mph'): ValidationResult<{ readonly indicatedSpeed: number; readonly actualSpeed: number; readonly unit: 'km/h' | 'mph'; readonly diameterDifferenceMm: number; readonly diameterDifferencePercent: number }> {
  const comparison = compareTireSizesTool(original, proposed);
  if (!comparison.ok) return comparison;
  if (!Number.isFinite(indicatedSpeed)) return invalid({ code: 'not-a-number', field: 'indicatedSpeed', message: 'indicatedSpeed must be a finite number.', received: indicatedSpeed });
  if (indicatedSpeed <= 0 || indicatedSpeed > 1000) return invalid({ code: 'out-of-range', field: 'indicatedSpeed', message: 'indicatedSpeed must be greater than 0 and no more than 1000.', received: indicatedSpeed });
  const compatibleResult = { speedometerDifferencePercent: comparison.value.speedometerDifferencePercent } as Parameters<typeof calculateActualSpeed>[1];
  return valid(Object.freeze({ indicatedSpeed, actualSpeed: calculateActualSpeed(indicatedSpeed, compatibleResult), unit, diameterDifferenceMm: comparison.value.diameterDifferenceMm, diameterDifferencePercent: comparison.value.diameterDifferencePercent }));
}
