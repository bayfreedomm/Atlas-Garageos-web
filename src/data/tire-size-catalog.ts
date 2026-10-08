/**
 * Tire-size catalog, derived at module load from the maintained production-size reference and
 * the sourced vehicle fitment rows.
 *
 * Nothing in this file is hand-copied: every entry comes from either the compact reference in
 * production-tire-sizes.ts or the `tireSize` string of a sourced vehicle row. Adding a real
 * reference size or a vehicle-only OEM size produces a page on the next build with no route edit.
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
import { productionCommercialTireSizeNotations, productionTireSizeNotations } from './production-tire-sizes';

export interface TireSizeEntry {
  /** e.g. "205/55R16" — exactly as written in vehicleFitmentData */
  readonly notation: string;
  /** e.g. "205-55-r16" */
  readonly slug: string;
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
  /**
   * True for a reinforced light-commercial ("C") van tire such as 215/65R16C. The nominal
   * geometry is identical to the passenger size; the construction and load rating are not,
   * so a C size is its own catalog entry and its own page.
   */
  readonly commercial?: true;
}

export interface ExcludedEntry {
  readonly notation: string;
  readonly reason: string;
}

/**
 * Metric tire notation: {width}/{aspect}R{rim}, optionally followed by "C" for a reinforced
 * light-commercial (van) tire. Half-inch rims (R17.5) are accepted.
 */
const TIRE_NOTATION = /^(\d{2,3})\/(\d{2})R(\d{2}(?:\.5)?)(C)?$/;

/**
 * Sane physical bounds for a publishable tire size. Outside these, we do not publish.
 *
 * SUPPORTED SCOPE: passenger cars, SUVs and light trucks — Atlas's dataset already carries an
 * F-150 on 275/65R18 and a Silverado 1500 on 265/65R18, and the architecture is meant to grow
 * well past today's 30 rows. The ranges are therefore set to clear that scope with headroom,
 * not to fence in the current data:
 *   - widthMm 80–420: 80 mm covers narrow city-car and space-saver spare fitments; 420 mm
 *     covers the widest light-truck/performance sizes in common metric notation.
 *   - aspectRatio 20–95: 20 covers modern low-profile performance tires; 95 covers tall
 *     light-truck sidewalls (previously capped at 90, which would have rejected a real 95).
 *   - rimDiameterInches 10–30: 10″ covers small city cars and spares; 30″ leaves room for the
 *     26″/28″ wheels that already exist on light trucks (previously capped at 24″).
 * Widening the sane range does NOT widen what parses: a string that is not {width}/{aspect}R{rim}
 * still hard-fails in parseTireNotation() and throws at catalog build time.
 */
export const TIRE_GEOMETRY_BOUNDS = Object.freeze({
  widthMm: Object.freeze({ min: 80, max: 420 }),
  aspectRatio: Object.freeze({ min: 20, max: 95 }),
  rimDiameterInches: Object.freeze({ min: 10, max: 30 }),
});

export interface ParsedTireNotation {
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
  /** Present (and true) only for a light-commercial "C" size. */
  readonly commercial?: true;
}

/** Parse "205/55R16" into its three numbers. Returns null for anything that is not that shape. */
export function parseTireNotation(notation: string): ParsedTireNotation | null {
  const match = TIRE_NOTATION.exec(notation.trim());
  if (!match) return null;
  const widthMm = Number(match[1]);
  const aspectRatio = Number(match[2]);
  const rimDiameterInches = Number(match[3]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(aspectRatio) || !Number.isFinite(rimDiameterInches)) return null;
  return match[4] === 'C' ? { widthMm, aspectRatio, rimDiameterInches, commercial: true } : { widthMm, aspectRatio, rimDiameterInches };
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
  return `${parsed.widthMm}-${parsed.aspectRatio}-r${rim}${parsed.commercial ? 'c' : ''}`;
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
export function buildTireSizeCatalog(
  vehicles: readonly VehicleFitment[],
  referenceNotations: readonly string[] = [],
): TireSizeCatalogBuild {
  const byNotation = new Map<string, VehicleFitment[]>();
  for (const vehicle of vehicles) {
    // The standard size and every factory-option size are all real OEM fitments, so each one
    // links the vehicle to its tire-size page. A vehicle is listed once per size.
    for (const size of new Set([vehicle.tireSize, ...(vehicle.optionalTireSizes ?? [])])) {
      if (parseTireNotation(size) === null) {
        throw new Error(`Malformed tire size ${JSON.stringify(size)} on vehicle "${vehicle.id}". Expected {width}/{aspect}R{rim}, e.g. "205/55R16". Fix src/data/vehicle-fitment.ts — a malformed size must not become a published URL.`);
      }
      const bucket = byNotation.get(size);
      if (bucket) bucket.push(vehicle);
      else byNotation.set(size, [vehicle]);
    }
  }

  const catalogNotations = new Set(byNotation.keys());
  for (const notation of referenceNotations) {
    if (parseTireNotation(notation) === null) {
      throw new Error(`Malformed tire size ${JSON.stringify(notation)} in the production-size reference. Expected {width}/{aspect}R{rim}.`);
    }
    catalogNotations.add(notation);
  }

  const entries: TireSizeEntry[] = [];
  const excluded: ExcludedEntry[] = [];
  const vehiclesByNotation = new Map<string, readonly VehicleFitment[]>();

  for (const notation of catalogNotations) {
    const matched = byNotation.get(notation) ?? [];
    const parsed = parseTireNotation(notation)!;
    const problem = tireGeometryProblem(parsed);
    if (problem !== null) { excluded.push({ notation, reason: problem }); continue; }
    entries.push(Object.freeze({ notation, slug: tireSizeSlug(notation), ...parsed }));
    vehiclesByNotation.set(notation, Object.freeze([...matched]));
  }

  entries.sort((a, b) => a.rimDiameterInches - b.rimDiameterInches || a.widthMm - b.widthMm || a.aspectRatio - b.aspectRatio || Number(Boolean(a.commercial)) - Number(Boolean(b.commercial)));
  return Object.freeze({ entries: Object.freeze(entries), excluded: Object.freeze(excluded), vehiclesByNotation });
}

const build = buildTireSizeCatalog(vehicleFitmentData, [...productionTireSizeNotations(), ...productionCommercialTireSizeNotations()]);

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

export function tireSizeByNotation(notation: string): TireSizeEntry | undefined {
  return tireSizeCatalog.find((entry) => entry.notation === notation);
}

/**
 * Whether a vehicle lists this size as its standard fitment or as a factory option. Used to
 * label vehicle rows honestly ("standard" vs "option") on the tire-size page.
 */
export function vehicleFitsAsStandard(vehicle: VehicleFitment, notation: string): boolean {
  return vehicle.tireSize === notation;
}

/** The passenger ↔ light-commercial twin of a size (205/65R16 ↔ 205/65R16C), when published. */
export function commercialTwin(entry: TireSizeEntry): TireSizeEntry | undefined {
  return tireSizeCatalog.find((candidate) => candidate.widthMm === entry.widthMm
    && candidate.aspectRatio === entry.aspectRatio
    && candidate.rimDiameterInches === entry.rimDiameterInches
    && Boolean(candidate.commercial) !== Boolean(entry.commercial));
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
