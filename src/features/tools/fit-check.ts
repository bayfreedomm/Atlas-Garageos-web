import type { ValidationResult } from '../../domain/validation';
import { valid } from '../../domain/validation';
import type { EvidenceLevel } from '../../domain/evidence';
import { calculateWheelOffsetTool, compareTireSizesTool, type TireToolInput, type WheelOffsetToolInput } from './calculator-tools';
import { tireSizeAvailability, type TireAvailability } from './tire-availability';

/**
 * "Can I fit this tire size?" — one question, every relevant Atlas engine, one decision page.
 *
 * Runs the tire geometry, size-availability, speedometer, ride-height and (optionally) wheel
 * position engines, and turns them into a list of checks. Each check carries:
 *   - a status  (pass / review / conflict / info / unknown)
 *   - the evidence level behind it (domain/evidence.ts)
 * so the UI can show NUMBER → SHAPE → MEANING → DECISION without ever upgrading a calculated
 * geometry result into a fitment approval.
 *
 * Thresholds (all documented in the page's methodology copy):
 * - Overall diameter: within ±3 % is a widely used industry rule of thumb (retailer plus-sizing
 *   guides) — NOT a legal or manufacturer limit. 3–5 % → review, > 5 % → large change.
 * - Speedometer: UN Regulation 39 requires 0 ≤ (indicated − true) ≤ 0.1·true + 4 km/h at type
 *   approval, i.e. a speedometer may never read below true speed. A larger tire moves the reading
 *   in exactly that direction, so an increase above 2 % is flagged for review.
 * Everything Atlas cannot see (load index, rim-width approval, real clearance, local approval
 * rules) is returned as an explicit `unknown` check instead of being silently skipped.
 */

export type FitCheckStatus = 'pass' | 'review' | 'conflict' | 'info' | 'unknown';
export type FitVerdict = 'close' | 'within-rule' | 'review' | 'large';

export type FitCheckId =
  | 'diameter' | 'speedometer' | 'ride-height'
  | 'availability-current' | 'availability-proposed'
  | 'wheels' | 'wheel-position'
  | 'rim-width' | 'load-speed' | 'clearance' | 'approval';

export interface FitCheck {
  readonly id: FitCheckId;
  readonly status: FitCheckStatus;
  readonly evidence: EvidenceLevel;
}

export interface FitCheckInput {
  readonly current: TireToolInput;
  readonly proposed: TireToolInput;
  /** Optional: all four values must be present to run the wheel-position engine. */
  readonly wheels?: WheelOffsetToolInput | undefined;
}

export interface FitCheckResult {
  readonly verdict: FitVerdict;
  readonly checks: readonly FitCheck[];
  readonly currentDiameterMm: number;
  readonly proposedDiameterMm: number;
  readonly diameterDifferenceMm: number;
  readonly diameterDifferencePercent: number;
  readonly rideHeightDifferenceMm: number;
  readonly sidewallDifferenceMm: number;
  /** Actual speed when the (unchanged) speedometer shows 100. */
  readonly actualAtIndicated100: number;
  readonly rimChanges: boolean;
  readonly availability: { readonly current: TireAvailability; readonly proposed: TireAvailability };
  readonly wheelPosition: { readonly innerPositionChangeMm: number; readonly outerPokeChangeMm: number } | null;
}

export const RULE_OF_THUMB_PERCENT = 3;
export const LARGE_CHANGE_PERCENT = 5;
export const SPEEDOMETER_REVIEW_PERCENT = 2;
const CLOSE_MATCH_PERCENT = 1;

const availabilityStatus = (a: TireAvailability): FitCheckStatus =>
  a.status === 'listed' ? 'pass' : a.status === 'unlisted' ? 'review' : 'conflict';

export function runFitCheck(input: FitCheckInput): ValidationResult<FitCheckResult> {
  const comparison = compareTireSizesTool(input.current, input.proposed);
  if (!comparison.ok) return comparison;
  const r = comparison.value;
  const pct = r.diameterDifferencePercent;
  const absPct = Math.abs(pct);

  const availability = { current: tireSizeAvailability(input.current), proposed: tireSizeAvailability(input.proposed) };
  const rimChanges = input.current.rimDiameterInches !== input.proposed.rimDiameterInches;

  let wheelPosition: FitCheckResult['wheelPosition'] = null;
  if (input.wheels) {
    const wheel = calculateWheelOffsetTool(input.wheels);
    if (wheel.ok) wheelPosition = { innerPositionChangeMm: wheel.value.innerPositionChangeMm, outerPokeChangeMm: wheel.value.outerPokeChangeMm };
  }

  const checks: FitCheck[] = [
    { id: 'diameter', status: absPct <= RULE_OF_THUMB_PERCENT ? 'pass' : absPct <= LARGE_CHANGE_PERCENT ? 'review' : 'conflict', evidence: 'calculated' },
    // Smaller tire → speedometer reads higher than before (the permitted direction). Larger → lower.
    { id: 'speedometer', status: pct > SPEEDOMETER_REVIEW_PERCENT ? 'review' : 'pass', evidence: 'calculated' },
    { id: 'ride-height', status: 'info', evidence: 'calculated' },
    { id: 'availability-current', status: availabilityStatus(availability.current), evidence: 'reference' },
    { id: 'availability-proposed', status: availabilityStatus(availability.proposed), evidence: 'reference' },
    { id: 'wheels', status: 'info', evidence: 'calculated' },
    ...(wheelPosition ? [{ id: 'wheel-position', status: 'info', evidence: 'calculated' } as const] : []),
    { id: 'rim-width', status: 'unknown', evidence: 'unknown' },
    { id: 'load-speed', status: 'unknown', evidence: 'unknown' },
    { id: 'clearance', status: 'unknown', evidence: 'unknown' },
    { id: 'approval', status: 'unknown', evidence: 'unknown' },
  ];

  // The headline is a GEOMETRY verdict. It gets worse (never better) when the size itself is
  // doubtful; unknown checks are listed separately and never turned into a pass.
  let verdict: FitVerdict = absPct <= CLOSE_MATCH_PERCENT ? 'close' : absPct <= RULE_OF_THUMB_PERCENT ? 'within-rule' : absPct <= LARGE_CHANGE_PERCENT ? 'review' : 'large';
  const doubtfulSize = availability.proposed.status !== 'listed';
  if (doubtfulSize && (verdict === 'close' || verdict === 'within-rule')) verdict = 'review';

  return valid(Object.freeze({
    verdict,
    checks: Object.freeze(checks),
    currentDiameterMm: r.current.overallDiameterMm,
    proposedDiameterMm: r.proposed.overallDiameterMm,
    diameterDifferenceMm: r.diameterDifferenceMm,
    diameterDifferencePercent: pct,
    rideHeightDifferenceMm: r.rideHeightDifferenceMm,
    sidewallDifferenceMm: r.sidewallDifferenceMm,
    actualAtIndicated100: 100 * (1 + pct / 100),
    rimChanges,
    availability,
    wheelPosition,
  }));
}

export function countByStatus(checks: readonly FitCheck[]): Readonly<Record<FitCheckStatus, number>> {
  const counts: Record<FitCheckStatus, number> = { pass: 0, review: 0, conflict: 0, info: 0, unknown: 0 };
  for (const check of checks) counts[check.status] += 1;
  return counts;
}
