import type { TireSize } from '../../domain/vehicle';
import { createTireSize } from '../../domain/vehicle';
import type { ValidationIssue, ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import { createNumericRangeValues, type NumericRange } from '../units/numeric-range';
import { calculateCircumferenceMm, calculateOverallDiameterMm, calculateSidewallHeightMm } from './geometry';

export interface TireCandidateSearchRequest {
  readonly baselineTire: TireSize;
  readonly targetRimDiameterInches: number;
  readonly widthRangeMm: NumericRange;
  readonly aspectRatioRange: NumericRange;
  readonly maximumAbsoluteDiameterDifferencePercent: number | null;
  readonly maxResults: number;
}

export interface TireCandidateResult {
  readonly tire: TireSize;
  readonly overallDiameterMm: number;
  readonly diameterDifferenceMm: number;
  readonly diameterDifferencePercent: number;
  readonly sidewallDifferenceMm: number;
  readonly circumferenceDifferenceMm: number;
  readonly speedometerDifferencePercent: number;
}

export interface TireCandidateSearchResult {
  readonly evaluatedCandidateCount: number;
  readonly candidates: readonly TireCandidateResult[];
}

export function searchTireCandidates(request: TireCandidateSearchRequest): ValidationResult<TireCandidateSearchResult> {
  if (!Number.isInteger(request.maxResults) || request.maxResults < 1 || request.maxResults > 500) {
    return invalid({ code: 'out-of-range', field: 'maxResults', message: 'maxResults must be an integer between 1 and 500.', received: request.maxResults });
  }
  if (request.maximumAbsoluteDiameterDifferencePercent !== null && (!Number.isFinite(request.maximumAbsoluteDiameterDifferencePercent) || request.maximumAbsoluteDiameterDifferencePercent < 0)) {
    return invalid({ code: 'out-of-range', field: 'maximumAbsoluteDiameterDifferencePercent', message: 'Maximum diameter difference must be zero or greater.', received: request.maximumAbsoluteDiameterDifferencePercent });
  }
  const widths = createNumericRangeValues(request.widthRangeMm, 'widthRangeMm');
  const aspects = createNumericRangeValues(request.aspectRatioRange, 'aspectRatioRange');
  const issues: ValidationIssue[] = [];
  if (!widths.ok) issues.push(...widths.issues);
  if (!aspects.ok) issues.push(...aspects.issues);
  if (!widths.ok || !aspects.ok) return invalid(...issues);

  const baselineDiameter = calculateOverallDiameterMm(request.baselineTire);
  const baselineSidewall = calculateSidewallHeightMm(request.baselineTire);
  const baselineCircumference = calculateCircumferenceMm(request.baselineTire);
  const candidates: TireCandidateResult[] = [];
  for (const width of widths.value) {
    for (const aspect of aspects.value) {
      const tire = createTireSize({ widthMm: width, aspectRatio: aspect, rimDiameterInches: request.targetRimDiameterInches });
      if (!tire.ok) return invalid(...tire.issues);
      const diameter = calculateOverallDiameterMm(tire.value);
      const diameterDifferenceMm = diameter - baselineDiameter;
      const diameterDifferencePercent = (diameterDifferenceMm / baselineDiameter) * 100;
      if (request.maximumAbsoluteDiameterDifferencePercent !== null && Math.abs(diameterDifferencePercent) > request.maximumAbsoluteDiameterDifferencePercent) continue;
      candidates.push(Object.freeze({
        tire: tire.value,
        overallDiameterMm: diameter,
        diameterDifferenceMm,
        diameterDifferencePercent,
        sidewallDifferenceMm: calculateSidewallHeightMm(tire.value) - baselineSidewall,
        circumferenceDifferenceMm: calculateCircumferenceMm(tire.value) - baselineCircumference,
        speedometerDifferencePercent: diameterDifferencePercent,
      }));
    }
  }

  candidates.sort((a, b) =>
    Math.abs(a.diameterDifferencePercent) - Math.abs(b.diameterDifferencePercent)
    || Math.abs(a.tire.widthMm - request.baselineTire.widthMm) - Math.abs(b.tire.widthMm - request.baselineTire.widthMm)
    || Math.abs(a.tire.aspectRatio - request.baselineTire.aspectRatio) - Math.abs(b.tire.aspectRatio - request.baselineTire.aspectRatio)
    || a.tire.widthMm - b.tire.widthMm
    || a.tire.aspectRatio - b.tire.aspectRatio);

  return valid(Object.freeze({
    evaluatedCandidateCount: widths.value.length * aspects.value.length,
    candidates: Object.freeze(candidates.slice(0, request.maxResults)),
  }));
}
