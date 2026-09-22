/**
 * Bolt-pattern (PCD) catalog, derived at module load from vehicleFitmentData.
 *
 * Same contract as tire-size-catalog.ts: every entry is parsed from the `boltPattern` string
 * of a real, sourced vehicle row; an unparseable string throws at import time; an entry with
 * out-of-range geometry or no matching vehicle is excluded and recorded with a reason rather
 * than silently published.
 */
import { vehicleFitmentData, type VehicleFitment } from './vehicle-fitment';
import type { ExcludedEntry } from './tire-size-catalog';
import { parseBoltPattern, type ParsedBoltPattern } from './bolt-pattern-geometry';

// Re-exported so existing importers of this catalog keep working, but there is exactly ONE
// implementation of each — in bolt-pattern-geometry.ts.
export { adjacentHoleSpacingMm, boltPatternSpacingMm, lugPositions, parseBoltPattern } from './bolt-pattern-geometry';
export type { ParsedBoltPattern } from './bolt-pattern-geometry';

export interface BoltPatternEntry {
  /** e.g. "5x114.3" — exactly as written in vehicleFitmentData */
  readonly notation: string;
  /** e.g. "5x114-3" */
  readonly slug: string;
  readonly lugCount: number;
  readonly pcdMm: number;
}

/**
 * Sane-range bounds for a publishable bolt pattern.
 *
 * SUPPORTED SCOPE: passenger cars, SUVs and light trucks (Atlas's own dataset already
 * includes an F-150 on 6x135 and a Silverado 1500 on 6x139.7). The ranges below are set to
 * clear that scope with headroom rather than to fence in today's 30 rows:
 *   - lugCount 3–10: 3-lug city cars (Smart) at the bottom, 10-lug heavy-duty hubs at the
 *     top. Intentionally capped there — beyond 10 lugs is commercial/trailer territory,
 *     which Atlas does not publish torque or fitment guidance for.
 *   - pcdMm 80–230: 80 mm clears small 3/4-lug kei and city cars (e.g. 4x100 and below,
 *     down to 3x98); 230 mm clears the widest light-truck/HD patterns in common use
 *     (8x170 Ford Super Duty, 8x180 GM 2500, 8x200 Ram, 10x225). Previously 90–180, which
 *     would have silently excluded a legitimate 8x200 fitment.
 * Malformed notation (anything that is not {lugs}x{PCD}) still hard-fails in parsing above
 * these bounds; widening the sane range does not widen what counts as parseable.
 */
export const BOLT_PATTERN_BOUNDS = Object.freeze({
  lugCount: Object.freeze({ min: 3, max: 10 }),
  pcdMm: Object.freeze({ min: 80, max: 230 }),
});

/**
 * URL slug for a bolt pattern: the decimal point in the PCD becomes a hyphen, everything
 * else is kept verbatim and lowercased.
 *   "5x112"   -> "5x112"
 *   "5x114.3" -> "5x114-3"
 *   "6x139.7" -> "6x139-7"
 * A PCD without a decimal never gains one, and a PCD with one never loses the digit, so the
 * mapping stays unambiguous: "5x1143" (which would collide with a hypothetical 1143 mm PCD)
 * is never produced.
 */
export function boltPatternSlug(notation: string): string {
  const parsed = parseBoltPattern(notation);
  if (!parsed) throw new Error(`Cannot build a bolt-pattern slug from malformed notation: ${JSON.stringify(notation)}`);
  return `${parsed.lugCount}x${String(parsed.pcdMm).replace('.', '-')}`;
}

export function boltPatternProblem(parsed: ParsedBoltPattern): string | null {
  const { lugCount, pcdMm } = parsed;
  const b = BOLT_PATTERN_BOUNDS;
  if (!Number.isInteger(lugCount) || lugCount < b.lugCount.min || lugCount > b.lugCount.max) return `lug count ${lugCount} is outside ${b.lugCount.min}–${b.lugCount.max}`;
  if (!Number.isFinite(pcdMm) || pcdMm < b.pcdMm.min || pcdMm > b.pcdMm.max) return `PCD ${pcdMm} mm is outside ${b.pcdMm.min}–${b.pcdMm.max} mm`;
  return null;
}

export interface BoltPatternCatalogBuild {
  readonly entries: readonly BoltPatternEntry[];
  readonly excluded: readonly ExcludedEntry[];
  readonly vehiclesByNotation: ReadonlyMap<string, readonly VehicleFitment[]>;
}

export function buildBoltPatternCatalog(vehicles: readonly VehicleFitment[]): BoltPatternCatalogBuild {
  const byNotation = new Map<string, VehicleFitment[]>();
  for (const vehicle of vehicles) {
    const parsedVehicle = parseBoltPattern(vehicle.boltPattern);
    if (parsedVehicle === null) {
      throw new Error(`Malformed bolt pattern ${JSON.stringify(vehicle.boltPattern)} on vehicle "${vehicle.id}". Expected {lugs}x{PCD mm}, e.g. "5x114.3". Fix src/data/vehicle-fitment.ts — a malformed pattern must not become a published URL.`);
    }
    // `lugCount` is the one remaining field that restates part of `boltPattern`, so it is
    // checked against the notation here rather than trusted. Adjacent-hole spacing is no
    // longer stored at all — it is derived from `boltPattern` wherever it is needed.
    if (parsedVehicle.lugCount !== vehicle.lugCount) {
      throw new Error(`Vehicle "${vehicle.id}" declares lugCount ${vehicle.lugCount} but its bolt pattern ${JSON.stringify(vehicle.boltPattern)} says ${parsedVehicle.lugCount}. Fix src/data/vehicle-fitment.ts — these must never disagree.`);
    }
    const bucket = byNotation.get(vehicle.boltPattern);
    if (bucket) bucket.push(vehicle);
    else byNotation.set(vehicle.boltPattern, [vehicle]);
  }

  const entries: BoltPatternEntry[] = [];
  const excluded: ExcludedEntry[] = [];
  const vehiclesByNotation = new Map<string, readonly VehicleFitment[]>();

  for (const [notation, matched] of byNotation) {
    const parsed = parseBoltPattern(notation)!;
    const problem = boltPatternProblem(parsed);
    if (problem !== null) { excluded.push({ notation, reason: problem }); continue; }
    if (matched.length === 0) { excluded.push({ notation, reason: 'no sourced Atlas vehicle entry uses this bolt pattern' }); continue; }
    entries.push(Object.freeze({ notation, slug: boltPatternSlug(notation), ...parsed }));
    vehiclesByNotation.set(notation, Object.freeze([...matched]));
  }

  entries.sort((a, b) => a.lugCount - b.lugCount || a.pcdMm - b.pcdMm);
  return Object.freeze({ entries: Object.freeze(entries), excluded: Object.freeze(excluded), vehiclesByNotation });
}

const build = buildBoltPatternCatalog(vehicleFitmentData);

export const boltPatternCatalog: readonly BoltPatternEntry[] = build.entries;
export const excludedBoltPatterns: readonly ExcludedEntry[] = build.excluded;

export function vehiclesForBoltPattern(notation: string): readonly VehicleFitment[] {
  return build.vehiclesByNotation.get(notation) ?? [];
}

export function boltPatternBySlug(slug: string): BoltPatternEntry | undefined {
  return boltPatternCatalog.find((entry) => entry.slug === slug);
}

export function boltPatternsByLugCount(): readonly (readonly [number, readonly BoltPatternEntry[]])[] {
  const groups = new Map<number, BoltPatternEntry[]>();
  for (const entry of boltPatternCatalog) {
    const bucket = groups.get(entry.lugCount);
    if (bucket) bucket.push(entry);
    else groups.set(entry.lugCount, [entry]);
  }
  return Object.freeze([...groups.entries()].sort((a, b) => a[0] - b[0]).map(([lugs, list]) => Object.freeze([lugs, Object.freeze(list)] as const)));
}
