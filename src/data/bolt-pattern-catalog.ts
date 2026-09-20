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

export interface BoltPatternEntry {
  /** e.g. "5x114.3" — exactly as written in vehicleFitmentData */
  readonly notation: string;
  /** e.g. "5x114-3" */
  readonly slug: string;
  readonly lugCount: number;
  readonly pcdMm: number;
}

/** Bolt pattern notation: {lug count}x{PCD in mm}, with an optional one-decimal PCD. */
const BOLT_NOTATION = /^(\d{1,2})x(\d{2,3}(?:\.\d)?)$/;

export const BOLT_PATTERN_BOUNDS = Object.freeze({
  lugCount: Object.freeze({ min: 3, max: 10 }),
  pcdMm: Object.freeze({ min: 90, max: 180 }),
});

export interface ParsedBoltPattern { readonly lugCount: number; readonly pcdMm: number; }

export function parseBoltPattern(notation: string): ParsedBoltPattern | null {
  const match = BOLT_NOTATION.exec(notation.trim());
  if (!match) return null;
  const lugCount = Number(match[1]);
  const pcdMm = Number(match[2]);
  if (!Number.isFinite(lugCount) || !Number.isFinite(pcdMm)) return null;
  return { lugCount, pcdMm };
}

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
    if (parseBoltPattern(vehicle.boltPattern) === null) {
      throw new Error(`Malformed bolt pattern ${JSON.stringify(vehicle.boltPattern)} on vehicle "${vehicle.id}". Expected {lugs}x{PCD mm}, e.g. "5x114.3". Fix src/data/vehicle-fitment.ts — a malformed pattern must not become a published URL.`);
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
    if (matched.length === 0) { excluded.push({ notation, reason: 'no verified vehicle uses this bolt pattern' }); continue; }
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

/**
 * Hole-to-hole (adjacent lug) chord for a PCD circle: c = PCD × sin(π / lugs).
 * This is the number a person actually measures with a ruler between two neighbouring lug
 * holes, and it is what the Bolt Pattern Calculator inverts — so showing it here keeps the
 * page and the tool describing the same quantity.
 */
export function adjacentHoleSpacingMm(entry: BoltPatternEntry): number {
  return entry.pcdMm * Math.sin(Math.PI / entry.lugCount);
}

/** Lug hole positions on a unit circle, first hole at 12 o'clock — used by the PCD diagram. */
export function lugPositions(lugCount: number): readonly (readonly [number, number])[] {
  return Object.freeze(Array.from({ length: lugCount }, (_, index) => {
    const angle = -Math.PI / 2 + (index / lugCount) * Math.PI * 2;
    return Object.freeze([Math.cos(angle), Math.sin(angle)] as const);
  }));
}
