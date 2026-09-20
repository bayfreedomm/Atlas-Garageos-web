/**
 * Tire-size catalog, derived at module load from vehicleFitmentData.
 *
 * Nothing in this file is hand-copied: every entry comes from parsing the `tireSize` string
 * of a real, sourced vehicle row. That is the whole point — adding a vehicle with a new tire
 * size to vehicle-fitment.ts produces a new tire-size page on the next build with no new
 * files and no edit here.
 *
 * Two different failure modes are handled differently, on purpose:
 *   - A `tireSize` string that cannot be parsed at all is a broken dataset, so
 *     buildTireSizeCatalog() THROWS at import time. A malformed row must never quietly
 *     become a published URL.
 *   - A row that parses but whose geometry is outside sane physical bounds, or that somehow
 *     ends up with no matching vehicle, is EXCLUDED from the catalog and recorded in
 *     `excludedTireSizes` with a reason, so it never reaches getStaticPaths() or the sitemap.
 */
import { vehicleFitmentData, type VehicleFitment } from './vehicle-fitment';

export interface TireSizeEntry {
  /** e.g. "205/55R16" — exactly as written in vehicleFitmentData */
  readonly notation: string;
  /** e.g. "205-55-r16" */
  readonly slug: string;
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
}

export interface ExcludedEntry {
  readonly notation: string;
  readonly reason: string;
}

/** Metric tire notation: {width}/{aspect}R{rim}. Half-inch rims (R17.5) are accepted. */
const TIRE_NOTATION = /^(\d{2,3})\/(\d{2})R(\d{2}(?:\.5)?)$/;

/** Sane physical bounds for a passenger-vehicle tire. Outside these, we do not publish. */
export const TIRE_GEOMETRY_BOUNDS = Object.freeze({
  widthMm: Object.freeze({ min: 100, max: 400 }),
  aspectRatio: Object.freeze({ min: 20, max: 90 }),
  rimDiameterInches: Object.freeze({ min: 10, max: 24 }),
});

export interface ParsedTireNotation {
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
}

/** Parse "205/55R16" into its three numbers. Returns null for anything that is not that shape. */
export function parseTireNotation(notation: string): ParsedTireNotation | null {
  const match = TIRE_NOTATION.exec(notation.trim());
  if (!match) return null;
  const widthMm = Number(match[1]);
  const aspectRatio = Number(match[2]);
  const rimDiameterInches = Number(match[3]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(aspectRatio) || !Number.isFinite(rimDiameterInches)) return null;
  return { widthMm, aspectRatio, rimDiameterInches };
}

/**
 * URL slug for a tire size: lowercase, the slash and the literal "R" both folded into
 * hyphens, and a half-inch rim's decimal point folded into a hyphen too.
 *   "205/55R16"  -> "205-55-r16"
 *   "225/45R18"  -> "225-45-r18"
 *   "215/75R17.5" -> "215-75-r17-5"
 * The mapping is deterministic and unambiguous in both directions.
 */
export function tireSizeSlug(notation: string): string {
  const parsed = parseTireNotation(notation);
  if (!parsed) throw new Error(`Cannot build a tire-size slug from malformed notation: ${JSON.stringify(notation)}`);
  const rim = String(parsed.rimDiameterInches).replace('.', '-');
  return `${parsed.widthMm}-${parsed.aspectRatio}-r${rim}`;
}

/** Returns a human-readable reason the geometry is unpublishable, or null when it is fine. */
export function tireGeometryProblem(parsed: ParsedTireNotation): string | null {
  const { widthMm, aspectRatio, rimDiameterInches } = parsed;
  const b = TIRE_GEOMETRY_BOUNDS;
  if (!Number.isFinite(widthMm) || widthMm < b.widthMm.min || widthMm > b.widthMm.max) return `section width ${widthMm} mm is outside ${b.widthMm.min}–${b.widthMm.max} mm`;
  if (!Number.isFinite(aspectRatio) || aspectRatio < b.aspectRatio.min || aspectRatio > b.aspectRatio.max) return `aspect ratio ${aspectRatio} is outside ${b.aspectRatio.min}–${b.aspectRatio.max}`;
  if (!Number.isFinite(rimDiameterInches) || rimDiameterInches < b.rimDiameterInches.min || rimDiameterInches > b.rimDiameterInches.max) return `rim diameter ${rimDiameterInches} in is outside ${b.rimDiameterInches.min}–${b.rimDiameterInches.max} in`;
  return null;
}

export interface TireSizeCatalogBuild {
  readonly entries: readonly TireSizeEntry[];
  readonly excluded: readonly ExcludedEntry[];
  readonly vehiclesByNotation: ReadonlyMap<string, readonly VehicleFitment[]>;
}

/**
 * Build the catalog from an arbitrary vehicle list. Exported (rather than inlined) so tests
 * can feed it deliberately malformed rows and prove the throw and the exclusion paths both
 * actually fire, instead of trusting a validator that never runs against bad input.
 */
export function buildTireSizeCatalog(vehicles: readonly VehicleFitment[]): TireSizeCatalogBuild {
  const byNotation = new Map<string, VehicleFitment[]>();
  for (const vehicle of vehicles) {
    if (parseTireNotation(vehicle.tireSize) === null) {
      throw new Error(`Malformed tire size ${JSON.stringify(vehicle.tireSize)} on vehicle "${vehicle.id}". Expected {width}/{aspect}R{rim}, e.g. "205/55R16". Fix src/data/vehicle-fitment.ts — a malformed size must not become a published URL.`);
    }
    const bucket = byNotation.get(vehicle.tireSize);
    if (bucket) bucket.push(vehicle);
    else byNotation.set(vehicle.tireSize, [vehicle]);
  }

  const entries: TireSizeEntry[] = [];
  const excluded: ExcludedEntry[] = [];
  const vehiclesByNotation = new Map<string, readonly VehicleFitment[]>();

  for (const [notation, matched] of byNotation) {
    const parsed = parseTireNotation(notation)!;
    const problem = tireGeometryProblem(parsed);
    if (problem !== null) { excluded.push({ notation, reason: problem }); continue; }
    // Defensive: the catalog is derived FROM the vehicles, so this cannot be empty today.
    // It is still checked, because a future refactor that sources notations from anywhere
    // else must not be able to publish a page with no verified vehicle behind it.
    if (matched.length === 0) { excluded.push({ notation, reason: 'no verified vehicle uses this size' }); continue; }
    entries.push(Object.freeze({ notation, slug: tireSizeSlug(notation), ...parsed }));
    vehiclesByNotation.set(notation, Object.freeze([...matched]));
  }

  entries.sort((a, b) => a.rimDiameterInches - b.rimDiameterInches || a.widthMm - b.widthMm || a.aspectRatio - b.aspectRatio);
  return Object.freeze({ entries: Object.freeze(entries), excluded: Object.freeze(excluded), vehiclesByNotation });
}

const build = buildTireSizeCatalog(vehicleFitmentData);

/** Every publishable tire size, sorted by rim diameter then width then aspect ratio. */
export const tireSizeCatalog: readonly TireSizeEntry[] = build.entries;

/** Sizes found in the dataset but deliberately not published, with the reason why. */
export const excludedTireSizes: readonly ExcludedEntry[] = build.excluded;

export function vehiclesForTireSize(notation: string): readonly VehicleFitment[] {
  return build.vehiclesByNotation.get(notation) ?? [];
}

export function tireSizeBySlug(slug: string): TireSizeEntry | undefined {
  return tireSizeCatalog.find((entry) => entry.slug === slug);
}

/** Rim-diameter groupings for the hub page, largest group of sizes first by rim size order. */
export function tireSizesByRimDiameter(): readonly (readonly [number, readonly TireSizeEntry[]])[] {
  const groups = new Map<number, TireSizeEntry[]>();
  for (const entry of tireSizeCatalog) {
    const bucket = groups.get(entry.rimDiameterInches);
    if (bucket) bucket.push(entry);
    else groups.set(entry.rimDiameterInches, [entry]);
  }
  return Object.freeze([...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rim, list]) => Object.freeze([rim, Object.freeze(list)] as const)));
}
