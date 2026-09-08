import { calculateActualSpeed } from '../../core/fitment/compare';
import { calculateCircumferenceMm, calculateOverallDiameterMm, calculateRevolutionsPerKilometer, calculateRevolutionsPerMile, calculateSidewallHeightMm } from '../../core/tire/geometry';
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
