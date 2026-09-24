import { PRODUCTION_TIRE_SIZES_BY_RIM } from '../../data/production-tire-sizes';
import { vehicleFitmentData } from '../../data/vehicle-fitment';
import { inchesToMillimeters } from '../../core/units/conversion';
import type { TireToolInput } from './calculator-tools';

/**
 * "Is this size actually made?" and "which real sizes keep my diameter on another rim?".
 *
 * Built on a reference list that is deliberately described as NOT exhaustive (see
 * data/production-tire-sizes.ts). So the three outcomes are worded carefully:
 * - listed       — appears in the reference list: a manufactured size.
 * - unlisted     — standard notation but not in our list: possibly rare/specialist; never
 *                  presented as "does not exist".
 * - nonstandard  — breaks modern metric notation (width not ending in 5, profile not a step of
 *                  5, rim not a whole or half inch): almost certainly a typo or a made-up size.
 */

export type TireAvailabilityStatus = 'listed' | 'unlisted' | 'nonstandard';

export interface ReferenceTireSize {
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
  readonly overallDiameterMm: number;
}

export interface TireSizeSuggestion {
  readonly size: ReferenceTireSize;
  readonly diameterDifferencePercent: number;
}

export interface TireAvailability {
  readonly status: TireAvailabilityStatus;
  /** Closest listed sizes on the same rim (empty for a listed size, or a rim we have no data for). */
  readonly nearest: readonly TireSizeSuggestion[];
}

export interface PlusSizeRow {
  readonly rimDiameterInches: number;
  readonly options: readonly TireSizeSuggestion[];
}

const diameterMm = (widthMm: number, aspectRatio: number, rimDiameterInches: number): number =>
  inchesToMillimeters(rimDiameterInches) + 2 * widthMm * (aspectRatio / 100);

const key = (widthMm: number, aspectRatio: number, rim: number): string => `${widthMm}/${aspectRatio}R${rim}`;

function buildReference(): { readonly byRim: ReadonlyMap<number, readonly ReferenceTireSize[]>; readonly keys: ReadonlySet<string> } {
  const byRim = new Map<number, ReferenceTireSize[]>();
  const keys = new Set<string>();
  const add = (widthMm: number, aspectRatio: number, rim: number): void => {
    const id = key(widthMm, aspectRatio, rim);
    if (keys.has(id)) return;
    keys.add(id);
    const list = byRim.get(rim) ?? [];
    list.push(Object.freeze({ widthMm, aspectRatio, rimDiameterInches: rim, overallDiameterMm: diameterMm(widthMm, aspectRatio, rim) }));
    byRim.set(rim, list);
  };
  for (const [rimText, pairs] of Object.entries(PRODUCTION_TIRE_SIZES_BY_RIM)) {
    const rim = Number(rimText);
    for (const pair of pairs.split(' ')) {
      const [w, a] = pair.split('/').map(Number);
      if (w !== undefined && a !== undefined && Number.isFinite(w) && Number.isFinite(a)) add(w, a, rim);
    }
  }
  // Every OEM size Atlas documents is, by definition, a manufactured size.
  for (const vehicle of vehicleFitmentData) {
    const match = /^(\d{2,3})\/(\d{2})R(\d{2}(?:\.5)?)$/.exec(vehicle.tireSize);
    if (match) add(Number(match[1]), Number(match[2]), Number(match[3]));
  }
  return { byRim, keys };
}

let reference: ReturnType<typeof buildReference> | undefined;
const getReference = (): ReturnType<typeof buildReference> => (reference ??= buildReference());

/** Modern metric passenger notation: width ends in 5, profile steps of 5, whole or half-inch rim. */
export function isStandardMetricNotation(input: TireToolInput): boolean {
  return Number.isInteger(input.widthMm) && input.widthMm % 10 === 5
    && Number.isInteger(input.aspectRatio) && input.aspectRatio % 5 === 0
    && Number.isInteger(input.rimDiameterInches * 2);
}

/**
 * Diameter alone is not a useful match: a 125/80R17 space-saver matches a 205/55R16 to 0.02%.
 * Real alternatives keep the width in a sensible window, and the ranking trades diameter error
 * against width change (10 mm of width ≈ 0.5 percentage points of diameter error).
 */
const WIDTH_PENALTY_PER_MM = 0.05;

function rank(baseline: TireToolInput, baselineDiameter: number, candidates: readonly ReferenceTireSize[], widthWindow: readonly [number, number]): TireSizeSuggestion[] {
  const [below, above] = widthWindow;
  const score = (s: TireSizeSuggestion): number => Math.abs(s.diameterDifferencePercent) + WIDTH_PENALTY_PER_MM * Math.abs(s.size.widthMm - baseline.widthMm);
  return candidates
    .filter((size) => size.widthMm >= baseline.widthMm - below && size.widthMm <= baseline.widthMm + above)
    .map((size) => ({ size, diameterDifferencePercent: ((size.overallDiameterMm - baselineDiameter) / baselineDiameter) * 100 }))
    .sort((a, b) => score(a) - score(b) || a.size.widthMm - b.size.widthMm);
}

export function tireSizeAvailability(input: TireToolInput, maxSuggestions = 3): TireAvailability {
  const { byRim, keys } = getReference();
  if (keys.has(key(input.widthMm, input.aspectRatio, input.rimDiameterInches))) {
    return Object.freeze({ status: 'listed', nearest: Object.freeze([]) });
  }
  const baselineDiameter = diameterMm(input.widthMm, input.aspectRatio, input.rimDiameterInches);
  const sameRim = byRim.get(input.rimDiameterInches) ?? [];
  // Same rim, ±30 mm: what the visitor most likely meant, or the real size closest to it.
  const nearest = rank(input, baselineDiameter, sameRim, [30, 30]).slice(0, maxSuggestions);
  return Object.freeze({ status: isStandardMetricNotation(input) ? 'unlisted' : 'nonstandard', nearest: Object.freeze(nearest) });
}

const PLUS_SIZE_RIM_DELTAS = [-1, 0, 1, 2] as const;

/**
 * Listed sizes that keep the overall diameter within `tolerancePercent` on the same rim and on
 * neighbouring rims — the real-world version of "near-equivalent sizes". The baseline size itself
 * is excluded. Rows with no listed option inside the tolerance are omitted.
 */
export function plusSizeOptions(input: TireToolInput, tolerancePercent = 3, perRim = 3): readonly PlusSizeRow[] {
  const { byRim } = getReference();
  const baselineDiameter = diameterMm(input.widthMm, input.aspectRatio, input.rimDiameterInches);
  const rows: PlusSizeRow[] = [];
  for (const delta of PLUS_SIZE_RIM_DELTAS) {
    const rim = input.rimDiameterInches + delta;
    const candidates = (byRim.get(rim) ?? []).filter((size) => !(size.widthMm === input.widthMm && size.aspectRatio === input.aspectRatio && rim === input.rimDiameterInches));
    // Plus-sizing widens as the rim grows; minus-sizing narrows a little. Never a spare-wheel width.
    const window: readonly [number, number] = delta < 0 ? [30, 10] : delta === 0 ? [20, 20] : [10, 20 + 20 * delta];
    const options = rank(input, baselineDiameter, candidates, window)
      .filter((option) => Math.abs(option.diameterDifferencePercent) <= tolerancePercent)
      .slice(0, perRim);
    if (options.length > 0) rows.push(Object.freeze({ rimDiameterInches: rim, options: Object.freeze(options) }));
  }
  return Object.freeze(rows);
}

export const referenceTireSizeCount = (): number => getReference().keys.size;
