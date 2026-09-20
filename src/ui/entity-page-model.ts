/**
 * Presentation model for the tire-size and bolt-pattern entity pages.
 *
 * Everything numeric these pages render is produced here, by calling the same shared, tested
 * calculator functions the tools use (calculateTireSizeTool / compareTireSizesTool) — the
 * .astro files never do arithmetic of their own. Keeping it in a .ts module also means it is
 * covered by tsc and by unit tests, which .astro frontmatter is not.
 */
import { calculateTireSizeTool, compareTireSizesTool } from '../features/tools/calculator-tools';
import { inchesToMillimeters } from '../core/units/conversion';
import { tireSizeCatalog, vehiclesForTireSize, type TireSizeEntry } from '../data/tire-size-catalog';
import { adjacentHoleSpacingMm, boltPatternCatalog, vehiclesForBoltPattern, type BoltPatternEntry } from '../data/bolt-pattern-catalog';
import { localizedToolPath } from '../localization/locales';
import type { EntityLocale } from '../seo/entity-routes';
import type { VehicleFitment } from '../data/vehicle-fitment';

const fixed = (value: number, digits: number): string => value.toFixed(digits);

export interface TireSizeMetrics {
  readonly sectionWidthMm: number;
  readonly aspectRatio: number;
  readonly sidewallHeightMm: number;
  readonly rimDiameterInches: number;
  readonly rimDiameterMm: number;
  readonly overallDiameterMm: number;
  readonly circumferenceMm: number;
  readonly revolutionsPerKilometer: number;
  readonly revolutionsPerMile: number;
}

/**
 * Geometry for one catalog entry. Throws rather than rendering a page with missing numbers:
 * every catalog entry has already passed geometry validation, so a failure here means the
 * validator and the calculator disagree, which is a bug worth failing the build over.
 */
export function tireSizeMetrics(entry: TireSizeEntry): TireSizeMetrics {
  const result = calculateTireSizeTool({ widthMm: entry.widthMm, aspectRatio: entry.aspectRatio, rimDiameterInches: entry.rimDiameterInches });
  if (!result.ok) throw new Error(`Tire geometry rejected catalog entry ${entry.notation}: ${result.issues.map((issue) => issue.message).join('; ')}`);
  return Object.freeze({
    sectionWidthMm: entry.widthMm,
    aspectRatio: entry.aspectRatio,
    sidewallHeightMm: result.value.sidewallHeightMm,
    rimDiameterInches: entry.rimDiameterInches,
    rimDiameterMm: inchesToMillimeters(entry.rimDiameterInches),
    overallDiameterMm: result.value.overallDiameterMm,
    circumferenceMm: result.value.circumferenceMm,
    revolutionsPerKilometer: result.value.revolutionsPerKilometer,
    revolutionsPerMile: result.value.revolutionsPerMile,
  });
}

export interface FormattedTireMetrics {
  readonly sectionWidth: string;
  readonly aspectRatio: string;
  readonly sidewallHeight: string;
  readonly rimDiameterIn: string;
  readonly rimDiameterMm: string;
  readonly overallDiameter: string;
  readonly circumference: string;
  readonly revsPerKm: string;
  readonly revsPerMile: string;
}

/** Locale-independent number formatting — the figures are identical on EN, DE and ES pages. */
export function formatTireMetrics(metrics: TireSizeMetrics): FormattedTireMetrics {
  return Object.freeze({
    sectionWidth: `${metrics.sectionWidthMm} mm`,
    aspectRatio: `${metrics.aspectRatio}%`,
    sidewallHeight: `${fixed(metrics.sidewallHeightMm, 1)} mm`,
    rimDiameterIn: `${metrics.rimDiameterInches}″`,
    rimDiameterMm: `${fixed(metrics.rimDiameterMm, 1)} mm`,
    overallDiameter: `${fixed(metrics.overallDiameterMm, 1)} mm`,
    circumference: `${fixed(metrics.circumferenceMm, 1)} mm`,
    revsPerKm: fixed(metrics.revolutionsPerKilometer, 1),
    revsPerMile: fixed(metrics.revolutionsPerMile, 1),
  });
}

export interface SimilarTireSize {
  readonly entry: TireSizeEntry;
  readonly overallDiameterMm: number;
  readonly differenceMm: number;
  readonly differencePercent: number;
}

/** Overall-diameter tolerance that counts as "geometrically similar" — the same 3% window
 *  the shared near-equivalent-size search in calculator-tools.ts uses. */
export const SIMILAR_DIAMETER_TOLERANCE_PERCENT = 3;

/**
 * Other entries in the SAME catalog whose calculated overall diameter is within tolerance.
 * Real sizes only — nothing invented, and never the entry itself.
 */
export function similarTireSizes(entry: TireSizeEntry, catalog: readonly TireSizeEntry[] = tireSizeCatalog, limit = 6): readonly SimilarTireSize[] {
  const base = { widthMm: entry.widthMm, aspectRatio: entry.aspectRatio, rimDiameterInches: entry.rimDiameterInches };
  const matches: SimilarTireSize[] = [];
  for (const candidate of catalog) {
    if (candidate.notation === entry.notation) continue;
    const comparison = compareTireSizesTool(base, { widthMm: candidate.widthMm, aspectRatio: candidate.aspectRatio, rimDiameterInches: candidate.rimDiameterInches });
    if (!comparison.ok) continue;
    if (Math.abs(comparison.value.diameterDifferencePercent) > SIMILAR_DIAMETER_TOLERANCE_PERCENT) continue;
    matches.push(Object.freeze({
      entry: candidate,
      overallDiameterMm: comparison.value.proposed.overallDiameterMm,
      differenceMm: comparison.value.diameterDifferenceMm,
      differencePercent: comparison.value.diameterDifferencePercent,
    }));
  }
  matches.sort((a, b) => Math.abs(a.differencePercent) - Math.abs(b.differencePercent));
  return Object.freeze(matches.slice(0, limit));
}

export const signed = (value: number, digits: number, unit: string): string =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)} ${unit}`;

/* ---------------------------------------------------------------------------------------
 * Tool hand-off links
 *
 * The calculators already read these query parameters on load (see ui/shareable-tool-state.ts:
 * `size` for the tire calculator, `current`/`new` for the comparison, `lugs`/`spacing` for the
 * bolt-pattern calculator). Reusing that existing mechanism is why these CTAs can genuinely
 * pre-fill instead of just saying "type it in".
 * ------------------------------------------------------------------------------------ */

export function tireCalculatorHref(locale: EntityLocale, entry: TireSizeEntry): string {
  const size = `${entry.widthMm}-${entry.aspectRatio}-${entry.rimDiameterInches}`;
  return `${localizedToolPath(locale, 'tire-size-calculator', 'tool')}?size=${size}`;
}

export function tireComparisonHref(locale: EntityLocale, current: TireSizeEntry, next?: TireSizeEntry): string {
  const token = (entry: TireSizeEntry): string => `${entry.widthMm}-${entry.aspectRatio}-${entry.rimDiameterInches}`;
  const base = localizedToolPath(locale, 'tire-size-comparison', 'tool');
  return next === undefined ? `${base}?current=${token(current)}` : `${base}?current=${token(current)}&new=${token(next)}`;
}

export function boltPatternCalculatorHref(locale: EntityLocale, entry: BoltPatternEntry): string {
  const spacing = adjacentHoleSpacingMm(entry).toFixed(2);
  return `${localizedToolPath(locale, 'bolt-pattern-calculator', 'tool')}?lugs=${entry.lugCount}&spacing=${spacing}`;
}

/* ---------------------------------------------------------------------------------------
 * Vehicle page links
 *
 * Vehicle detail pages are market-split: US vehicles have an English page only
 * (/vehicles/{id}/), EU vehicles have German and Spanish pages only. There is no
 * English page for a EU vehicle and no German page for a US one. Rather than dropping the
 * link (which would leave EU-only tire sizes with no vehicle links at all on the English
 * page), this resolves to the page that genuinely exists, preferring the reader's locale,
 * and reports the locale of the page it points at so the markup can mark a cross-language
 * link with hreflang.
 * ------------------------------------------------------------------------------------ */

export interface VehicleLink { readonly href: string; readonly locale: EntityLocale; readonly crossLocale: boolean; }

export function vehicleLink(vehicle: VehicleFitment, locale: EntityLocale): VehicleLink {
  if (vehicle.market === 'us') return Object.freeze({ href: `/vehicles/${vehicle.id}/`, locale: 'en', crossLocale: locale !== 'en' });
  const target: EntityLocale = locale === 'es' ? 'es' : 'de';
  const href = target === 'es' ? `/es/vehiculos/${vehicle.id}/` : `/de/fahrzeuge/${vehicle.id}/`;
  return Object.freeze({ href, locale: target, crossLocale: locale !== target });
}

/** The vehicle-directory index that exists for this locale. */
export function vehicleHubPath(locale: EntityLocale): string {
  return locale === 'de' ? '/de/fahrzeuge/' : locale === 'es' ? '/es/vehiculos/' : '/vehicles/';
}

export function homePath(locale: EntityLocale): string {
  return locale === 'en' ? '/' : `/${locale}/`;
}

/** Distinct "Make Model" labels for the vehicles behind an entity, for FAQ copy. */
export function vehicleNames(vehicles: readonly VehicleFitment[]): string {
  return [...new Set(vehicles.map((vehicle) => `${vehicle.make} ${vehicle.model}`))].join(', ');
}

/** Distinct center bore values present on a set of vehicles, ascending. */
export function centerBoreRange(vehicles: readonly VehicleFitment[]): readonly number[] {
  return Object.freeze([...new Set(vehicles.flatMap((vehicle) => (vehicle.centerBoreMm === undefined ? [] : [vehicle.centerBoreMm])))].sort((a, b) => a - b));
}

/* ---------------------------------------------------------------------------------------
 * Page metadata
 *
 * Built here rather than in each .astro file so the six route files stay thin wrappers and
 * the title/description/canonical/hreflang rules are written once and typechecked.
 * ------------------------------------------------------------------------------------ */
import { entityAlternates, entityDetailPath, entityHubPath, type HreflangAlternate } from '../seo/entity-routes';
import { boltPatternPageText, tireSizePageText } from '../content/entity-page-text';

export interface EntityBreadcrumb { readonly name: string; readonly href: string; }
export interface EntityPageMeta {
  readonly title: string;
  readonly description: string;
  readonly pathname: string;
  readonly alternates: readonly HreflangAlternate[];
  readonly breadcrumbs: readonly EntityBreadcrumb[];
}

export function tireSizeHubMeta(locale: EntityLocale): EntityPageMeta {
  const t = tireSizePageText[locale];
  const pathname = entityHubPath('tire-size', locale);
  return Object.freeze({
    title: t.hubTitle, description: t.hubDescription, pathname,
    alternates: entityAlternates('tire-size'),
    breadcrumbs: Object.freeze([{ name: t.breadcrumbHome, href: homePath(locale) }, { name: t.breadcrumbHub, href: pathname }]),
  });
}

export function tireSizeDetailMeta(entry: TireSizeEntry, locale: EntityLocale): EntityPageMeta {
  const t = tireSizePageText[locale];
  const pathname = entityDetailPath('tire-size', locale, entry.slug);
  const metrics = tireSizeMetrics(entry);
  const vehicles = vehiclesForTireSize(entry.notation).length;
  return Object.freeze({
    title: t.detailTitle(entry.notation),
    description: t.detailDescription(entry.notation, metrics.overallDiameterMm.toFixed(1), vehicles),
    pathname,
    alternates: entityAlternates('tire-size', entry.slug),
    breadcrumbs: Object.freeze([
      { name: t.breadcrumbHome, href: homePath(locale) },
      { name: t.breadcrumbHub, href: entityHubPath('tire-size', locale) },
      { name: entry.notation, href: pathname },
    ]),
  });
}

export function boltPatternHubMeta(locale: EntityLocale): EntityPageMeta {
  const t = boltPatternPageText[locale];
  const pathname = entityHubPath('bolt-pattern', locale);
  return Object.freeze({
    title: t.hubTitle, description: t.hubDescription, pathname,
    alternates: entityAlternates('bolt-pattern'),
    breadcrumbs: Object.freeze([{ name: t.breadcrumbHome, href: homePath(locale) }, { name: t.breadcrumbHub, href: pathname }]),
  });
}

export function boltPatternDetailMeta(entry: BoltPatternEntry, locale: EntityLocale): EntityPageMeta {
  const t = boltPatternPageText[locale];
  const pathname = entityDetailPath('bolt-pattern', locale, entry.slug);
  const vehicles = vehiclesForBoltPattern(entry.notation).length;
  return Object.freeze({
    title: t.detailTitle(entry.notation),
    description: t.detailDescription(entry.notation, entry.lugCount, entry.pcdMm, vehicles),
    pathname,
    alternates: entityAlternates('bolt-pattern', entry.slug),
    breadcrumbs: Object.freeze([
      { name: t.breadcrumbHome, href: homePath(locale) },
      { name: t.breadcrumbHub, href: entityHubPath('bolt-pattern', locale) },
      { name: entry.notation, href: pathname },
    ]),
  });
}

/** Bolt patterns used by the vehicles that run a given tire size — the tire→PCD edge. */
export function boltPatternsForTireSize(notation: string): readonly BoltPatternEntry[] {
  const used = new Set(vehiclesForTireSize(notation).map((vehicle) => vehicle.boltPattern));
  return Object.freeze(boltPatternCatalog.filter((entry) => used.has(entry.notation)));
}

/** Tire sizes used by the vehicles that run a given bolt pattern — the PCD→tire edge. */
export function tireSizesForBoltPattern(notation: string): readonly TireSizeEntry[] {
  const used = new Set(vehiclesForBoltPattern(notation).map((vehicle) => vehicle.tireSize));
  return Object.freeze(tireSizeCatalog.filter((entry) => used.has(entry.notation)));
}
