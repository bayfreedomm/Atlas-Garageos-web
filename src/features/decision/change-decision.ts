/**
 * "If you switch, what changes?" — the meaning of a tire (and optionally wheel) change, plus the
 * checks that are still open before buying. Built only on runFitCheck (tire geometry, speedometer,
 * ride height, wheel position); no new formulas and no fit/no-fit verdict.
 */
import type { TireToolInput, WheelOffsetToolInput } from '../tools/calculator-tools';
import { runFitCheck, RULE_OF_THUMB_PERCENT, SPEEDOMETER_REVIEW_PERCENT } from '../tools/fit-check';

export type ChangeDirection = 'up' | 'down' | 'same';

export interface ChangeSummary {
  readonly widthMm: number;
  readonly widthDirection: ChangeDirection;
  readonly diameterMm: number;
  readonly diameterPercent: number;
  readonly diameterDirection: ChangeDirection;
  readonly rideHeightMm: number;
  /** True speed when the unchanged speedometer shows 100. */
  readonly actualAt100: number;
  readonly sidewallMm: number;
  readonly sidewallDirection: ChangeDirection;
  readonly rimChanges: boolean;
  readonly diameterWithinRule: boolean;
  readonly speedometerNeedsReview: boolean;
  readonly wheelPosition: { readonly innerMm: number; readonly outerMm: number } | null;
  /** Fitment points that stay open, in display order. */
  readonly openPoints: readonly OpenPoint[];
}

export type OpenPoint = 'rim-width' | 'clearance' | 'pcd' | 'load-speed' | 'approval';

/** The before-you-buy list. Fixed order; the visitor ticks them off. */
export const CHECKLIST_ITEMS = ['diameter', 'speedometer', 'rim-width', 'offset', 'pcd', 'registration'] as const;
export type ChecklistItem = typeof CHECKLIST_ITEMS[number];

const direction = (value: number, tolerance: number): ChangeDirection => (value > tolerance ? 'up' : value < -tolerance ? 'down' : 'same');

export function summarizeChange(current: TireToolInput, proposed: TireToolInput, wheels?: WheelOffsetToolInput): ChangeSummary | null {
  const result = runFitCheck({ current, proposed, wheels });
  if (!result.ok) return null;
  const r = result.value;
  const widthMm = proposed.widthMm - current.widthMm;
  const openPoints: OpenPoint[] = [];
  if (widthMm !== 0 || r.rimChanges) openPoints.push('rim-width');
  if (widthMm > 0 || r.diameterDifferenceMm > 0 || (r.wheelPosition && (r.wheelPosition.outerPokeChangeMm > 0 || r.wheelPosition.innerPositionChangeMm > 0))) openPoints.push('clearance');
  if (r.rimChanges) openPoints.push('pcd');
  openPoints.push('load-speed', 'approval');
  return Object.freeze({
    widthMm,
    widthDirection: direction(widthMm, 0),
    diameterMm: r.diameterDifferenceMm,
    diameterPercent: r.diameterDifferencePercent,
    diameterDirection: direction(r.diameterDifferenceMm, 0.5),
    rideHeightMm: r.rideHeightDifferenceMm,
    actualAt100: r.actualAtIndicated100,
    sidewallMm: r.sidewallDifferenceMm,
    sidewallDirection: direction(r.sidewallDifferenceMm, 0.5),
    rimChanges: r.rimChanges,
    diameterWithinRule: Math.abs(r.diameterDifferencePercent) <= RULE_OF_THUMB_PERCENT,
    speedometerNeedsReview: r.diameterDifferencePercent > SPEEDOMETER_REVIEW_PERCENT,
    wheelPosition: r.wheelPosition ? { innerMm: r.wheelPosition.innerPositionChangeMm, outerMm: r.wheelPosition.outerPokeChangeMm } : null,
    openPoints: Object.freeze(openPoints),
  });
}

/** Storage key for the ticked checklist of one change (current → proposed). */
export const checklistKey = (current: TireToolInput, proposed: TireToolInput): string =>
  `atlas-checks:${current.widthMm}-${current.aspectRatio}-${current.rimDiameterInches}>${proposed.widthMm}-${proposed.aspectRatio}-${proposed.rimDiameterInches}`;

/** Parses a curated wheel size such as "16x6.5 ET40" or "6.5Jx16 ET41". */
export function parseWheelSize(text: string | undefined): { readonly widthInches: number; readonly offsetMm?: number } | null {
  if (!text) return null;
  const a = /(\d{2})\s*x\s*(\d+(?:\.\d+)?)/i.exec(text);
  const b = /(\d+(?:\.\d+)?)\s*J\s*x\s*(\d{2})/i.exec(text);
  const width = a ? Number(a[2]) : b ? Number(b[1]) : NaN;
  if (!Number.isFinite(width) || width < 3 || width > 15) return null;
  const et = /ET\s*(-?\d+(?:\.\d+)?)/i.exec(text);
  return et ? { widthInches: width, offsetMm: Number(et[1]) } : { widthInches: width };
}

/** Parses a metric notation such as "205/55R16", "P225/65R17" or "215/65R16C". */
export function parseMetricTire(text: string | undefined): TireToolInput | null {
  if (!text) return null;
  const match = /(\d{3})\s*\/\s*(\d{2})\s*Z?R\s*(\d{2}(?:\.5)?)/i.exec(text);
  if (!match) return null;
  return { widthMm: Number(match[1]), aspectRatio: Number(match[2]), rimDiameterInches: Number(match[3]) };
}

/** What a remembered car contributes as the starting point of a change. */
export interface VehicleBaseline {
  readonly label: string;
  readonly tire: TireToolInput | null;
  /** First factory option size, used as the default "new" size; null when the car lists none. */
  readonly alternative: TireToolInput | null;
  readonly wheel: { readonly widthInches: number; readonly offsetMm?: number } | null;
  readonly wheelText: string;
  readonly boltPattern: string;
}

export const vehicleBaseline = (vehicle: { readonly make: string; readonly model: string; readonly tireSize: string; readonly optionalTireSizes?: readonly string[]; readonly wheelSize: string; readonly boltPattern: string }): VehicleBaseline => Object.freeze({
  label: `${vehicle.make} ${vehicle.model}`,
  tire: parseMetricTire(vehicle.tireSize),
  alternative: parseMetricTire(vehicle.optionalTireSizes?.[0]),
  wheel: parseWheelSize(vehicle.wheelSize),
  wheelText: vehicle.wheelSize,
  boltPattern: vehicle.boltPattern,
});
