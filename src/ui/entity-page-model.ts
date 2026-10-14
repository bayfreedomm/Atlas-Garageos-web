/**
 * Presentation model for the tire-size and bolt-pattern entity pages.
 *
 * Everything numeric these pages render is produced here, by calling the same shared, tested
 * calculator functions the tools use (calculateTireSizeTool / compareTireSizesTool) — the
 * .astro files never do arithmetic of their own. Keeping it in a .ts module also means it is
 * covered by tsc and by unit tests, which .astro frontmatter is not.
 */
import type { ToolEntityLocale } from '../seo/entity-routes';
import { calculateTireSizeTool } from '../features/tools/calculator-tools';
import { inchesToMillimeters } from '../core/units/conversion';
import { tireSizeCatalog, vehiclesForTireSize, type TireSizeEntry } from '../data/tire-size-catalog';
import { boltPatternCatalog, vehiclesForBoltPattern, type BoltPatternEntry } from '../data/bolt-pattern-catalog';
import { adjacentHoleSpacingMm } from '../data/bolt-pattern-geometry';
import { localizedToolPath } from '../localization/locales';
import type { EntityLocale } from '../seo/entity-routes';
import type { VehicleFitment } from '../data/vehicle-fitment';
import { formatDecimal, formatMm, formatPercent, formatPlain, formatSigned, type NumberLocale } from './locale-format';
export { torqueIsUnconfirmed } from './vehicle-torque';


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
const metricsCache = new WeakMap<TireSizeEntry, TireSizeMetrics>();

export function tireSizeMetrics(entry: TireSizeEntry): TireSizeMetrics {
  const cached = metricsCache.get(entry);
  if (cached) return cached;
  const metrics = computeTireSizeMetrics(entry);
  metricsCache.set(entry, metrics);
  return metrics;
}

function computeTireSizeMetrics(entry: TireSizeEntry): TireSizeMetrics {
  if (entry.flotation) {
    // A flotation size states its overall diameter and section width directly, in inches, so
    // its geometry is read from the notation rather than derived from a metric aspect ratio.
    const overallDiameterMm = entry.flotation.overallDiameterIn * 25.4;
    const sectionWidthMm = entry.flotation.sectionWidthIn * 25.4;
    const rimDiameterMm = inchesToMillimeters(entry.rimDiameterInches);
    const sidewallHeightMm = (overallDiameterMm - rimDiameterMm) / 2;
    const circumferenceMm = overallDiameterMm * Math.PI;
    return Object.freeze({
      sectionWidthMm,
      aspectRatio: (sidewallHeightMm / sectionWidthMm) * 100,
      sidewallHeightMm,
      rimDiameterInches: entry.rimDiameterInches,
      rimDiameterMm,
      overallDiameterMm,
      circumferenceMm,
      revolutionsPerKilometer: 1_000_000 / circumferenceMm,
      revolutionsPerMile: 1_609_344 / circumferenceMm,
    });
  }
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

/**
 * The figures are identical on EN, DE and ES pages; only the decimal separator and percent
 * spacing follow the reader's locale ("631,9 mm" / "55 %" in German and Spanish).
 */
export function formatTireMetrics(metrics: TireSizeMetrics, locale: NumberLocale = 'en'): FormattedTireMetrics {
  return Object.freeze({
    sectionWidth: formatMm(metrics.sectionWidthMm, Number.isInteger(metrics.sectionWidthMm) ? 0 : 1, locale),
    aspectRatio: formatPercent(metrics.aspectRatio, 0, locale),
    sidewallHeight: formatMm(metrics.sidewallHeightMm, 1, locale),
    rimDiameterIn: `${formatPlain(metrics.rimDiameterInches, locale)}″`,
    rimDiameterMm: formatMm(metrics.rimDiameterMm, 1, locale),
    overallDiameter: formatMm(metrics.overallDiameterMm, 1, locale),
    circumference: formatMm(metrics.circumferenceMm, 1, locale),
    revsPerKm: formatDecimal(metrics.revolutionsPerKilometer, 1, locale),
    revsPerMile: formatDecimal(metrics.revolutionsPerMile, 1, locale),
  });
}

/** Imperial view of the same geometry — "how big is 265/70R17 in inches". */
export interface TireInchView {
  readonly overallDiameterIn: number;
  readonly sectionWidthIn: number;
  readonly sidewallIn: number;
  readonly circumferenceIn: number;
}

export function tireInchView(metrics: TireSizeMetrics): TireInchView {
  return Object.freeze({
    overallDiameterIn: metrics.overallDiameterMm / 25.4,
    sectionWidthIn: metrics.sectionWidthMm / 25.4,
    sidewallIn: metrics.sidewallHeightMm / 25.4,
    circumferenceIn: metrics.circumferenceMm / 25.4,
  });
}

/** Flotation-style shorthand, e.g. "24.9 × 8.1 R16" (diameter × width, rim). */
export function inchShorthand(entry: TireSizeEntry, metrics: TireSizeMetrics, locale: NumberLocale = 'en'): string {
  if (entry.flotation) return `${formatPlain(entry.flotation.overallDiameterIn, locale)} × ${formatDecimal(entry.flotation.sectionWidthIn, 2, locale)} R${formatPlain(entry.rimDiameterInches, locale)}`;
  const view = tireInchView(metrics);
  return `${formatDecimal(view.overallDiameterIn, 1, locale)} × ${formatDecimal(view.sectionWidthIn, 1, locale)} R${formatPlain(entry.rimDiameterInches, locale)}`;
}

/** German/Spanish write "205/55 R16"; English keeps the compact "205/55R16". */
export function displayTireNotation(notation: string, locale: NumberLocale): string {
  // German and Spanish also write a half-inch rim with a decimal comma: "315/80 R22,5".
  return locale === 'en' ? notation : notation.replace(/R(\d)/, ' R$1').replace(/R(\d{2})\.5/, 'R$1,5');
}

/* ---------------------------------------------------------------------------------------
 * Real-world alternatives
 *
 * The naive "anything within 3% of the diameter" list happily pairs 215/65R16 with
 * 305/25R21 or a 155/90R16 space-saver. The alternative table below instead follows the same
 * plus/minus-sizing rule as the calculator (features/tools/tire-availability.ts): one inch
 * down to two inches up, a sensible width window per rim step, and a ranking that trades
 * diameter error against width change. A light-commercial "C" size is only ever compared with
 * other C sizes, because a passenger tire is not a load-rated substitute for one.
 * ------------------------------------------------------------------------------------ */

export interface TireAlternative {
  readonly entry: TireSizeEntry;
  readonly overallDiameterMm: number;
  readonly differenceMm: number;
  readonly differencePercent: number;
  /** True speed when the speedometer (calibrated for the original size) shows 100. */
  readonly trueSpeedAtIndicated100: number;
}

export interface TireAlternativeRow {
  readonly rimDiameterInches: number;
  readonly rimDelta: number;
  readonly options: readonly TireAlternative[];
}

const ALTERNATIVE_RIM_DELTAS = [-1, 0, 1, 2] as const;
const ALTERNATIVE_WIDTH_PENALTY_PER_MM = 0.05;

export function tireAlternatives(
  entry: TireSizeEntry,
  catalog: readonly TireSizeEntry[] = tireSizeCatalog,
  tolerancePercent = SIMILAR_DIAMETER_TOLERANCE_PERCENT,
  perRim = 3,
): readonly TireAlternativeRow[] {
  const base = tireSizeMetrics(entry);
  const pool = catalog.filter((candidate) => Boolean(candidate.commercial) === Boolean(entry.commercial) && candidate.notation !== entry.notation);
  const rows: TireAlternativeRow[] = [];
  for (const delta of ALTERNATIVE_RIM_DELTAS) {
    const rim = entry.rimDiameterInches + delta;
    const [below, above] = delta < 0 ? [30, 10] : delta === 0 ? [20, 20] : [10, 20 + 20 * delta];
    const options = pool
      .filter((candidate) => candidate.rimDiameterInches === rim && candidate.widthMm >= entry.widthMm - below && candidate.widthMm <= entry.widthMm + above)
      .map((candidate) => {
        const metrics = tireSizeMetrics(candidate);
        const differenceMm = metrics.overallDiameterMm - base.overallDiameterMm;
        return Object.freeze({
          entry: candidate,
          overallDiameterMm: metrics.overallDiameterMm,
          differenceMm,
          differencePercent: (differenceMm / base.overallDiameterMm) * 100,
          trueSpeedAtIndicated100: 100 * (metrics.overallDiameterMm / base.overallDiameterMm),
        });
      })
      .filter((option) => Math.abs(option.differencePercent) <= tolerancePercent)
      .sort((a, b) => (Math.abs(a.differencePercent) + ALTERNATIVE_WIDTH_PENALTY_PER_MM * Math.abs(a.entry.widthMm - entry.widthMm))
        - (Math.abs(b.differencePercent) + ALTERNATIVE_WIDTH_PENALTY_PER_MM * Math.abs(b.entry.widthMm - entry.widthMm))
        || a.entry.widthMm - b.entry.widthMm)
      .slice(0, perRim);
    if (options.length > 0) rows.push(Object.freeze({ rimDiameterInches: rim, rimDelta: delta, options: Object.freeze(options) }));
  }
  return Object.freeze(rows);
}

/**
 * Neighbouring sizes on the same rim: one width step either side at the same profile, and one
 * or two profile steps either side at the same width. These are the sizes a reader typing
 * "205/55 R16" most often also means, so they double as the page's sibling navigation.
 */
export function sameRimNeighbours(entry: TireSizeEntry, catalog: readonly TireSizeEntry[] = tireSizeCatalog, limit = 8): readonly TireSizeEntry[] {
  const pool = catalog.filter((candidate) => candidate.rimDiameterInches === entry.rimDiameterInches
    && Boolean(candidate.commercial) === Boolean(entry.commercial)
    && Boolean(candidate.flotation) === Boolean(entry.flotation)
    && candidate.notation !== entry.notation);
  if (entry.flotation) {
    // Flotation neighbours: the same rim, nearest overall diameter first, then width.
    const self = entry.flotation;
    return Object.freeze(pool
      .map((candidate) => ({ candidate, d: Math.abs(candidate.flotation!.overallDiameterIn - self.overallDiameterIn), w: Math.abs(candidate.flotation!.sectionWidthIn - self.sectionWidthIn) }))
      .filter((item) => item.d <= 4)
      .sort((a, b) => a.d - b.d || a.w - b.w)
      .slice(0, limit)
      .map((item) => item.candidate));
  }
  const scored = pool
    .map((candidate) => {
      const dw = Math.abs(candidate.widthMm - entry.widthMm);
      const da = Math.abs(candidate.aspectRatio - entry.aspectRatio);
      const sameProfile = da === 0 && dw <= 20;
      const sameWidth = dw === 0 && da <= 10;
      const diagonal = dw === 10 && da === 5;
      if (!sameProfile && !sameWidth && !diagonal) return null;
      return { candidate, score: dw / 10 + da / 5 + (diagonal ? 0.5 : 0) };
    })
    .filter((item): item is { candidate: TireSizeEntry; score: number } => item !== null)
    .sort((a, b) => a.score - b.score || a.candidate.widthMm - b.candidate.widthMm || a.candidate.aspectRatio - b.candidate.aspectRatio);
  return Object.freeze(scored.slice(0, limit).map((item) => item.candidate));
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
  const baseDiameter = tireSizeMetrics(entry).overallDiameterMm;
  const matches: SimilarTireSize[] = [];
  for (const candidate of catalog) {
    if (candidate.notation === entry.notation) continue;
    const overallDiameterMm = tireSizeMetrics(candidate).overallDiameterMm;
    const differenceMm = overallDiameterMm - baseDiameter;
    const differencePercent = (differenceMm / baseDiameter) * 100;
    if (Math.abs(differencePercent) > SIMILAR_DIAMETER_TOLERANCE_PERCENT) continue;
    matches.push(Object.freeze({ entry: candidate, overallDiameterMm, differenceMm, differencePercent }));
  }
  matches.sort((a, b) => Math.abs(a.differencePercent) - Math.abs(b.differencePercent));
  return Object.freeze(matches.slice(0, limit));
}

export const signed = (value: number, digits: number, unit: string, locale: NumberLocale = 'en'): string =>
  formatSigned(value, digits, unit, locale);

/* ---------------------------------------------------------------------------------------
 * Tool hand-off links
 *
 * The calculators already read these query parameters on load (see ui/shareable-tool-state.ts:
 * `size` for the tire calculator, `current`/`new` for the comparison, `lugs`/`spacing` for the
 * bolt-pattern calculator). Reusing that existing mechanism is why these CTAs can genuinely
 * pre-fill instead of just saying "type it in".
 * ------------------------------------------------------------------------------------ */

/** Calculators exist in every entity locale, so entity pages link to tools in their own language. */
export function toolLocale(locale: EntityLocale): ToolEntityLocale {
  return toolLocaleFor(locale);
}

export function tireCalculatorHref(locale: EntityLocale, entry: TireSizeEntry): string {
  locale = toolLocale(locale);
  if (entry.flotation) return localizedToolPath(locale, 'tire-size-calculator', 'tool');
  const size = `${entry.widthMm}-${entry.aspectRatio}-${entry.rimDiameterInches}`;
  return `${localizedToolPath(locale, 'tire-size-calculator', 'tool')}?size=${size}`;
}

export function tireComparisonHref(locale: EntityLocale, current: TireSizeEntry, next?: TireSizeEntry): string {
  locale = toolLocale(locale);
  const token = (entry: TireSizeEntry): string => `${entry.widthMm}-${entry.aspectRatio}-${entry.rimDiameterInches}`;
  const base = localizedToolPath(locale, 'tire-size-comparison', 'tool');
  if (current.flotation) return base;
  if (next?.flotation) return `${base}?current=${token(current)}`;
  return next === undefined ? `${base}?current=${token(current)}` : `${base}?current=${token(current)}&new=${token(next)}`;
}

/** Speedometer-error calculator pre-filled with both sizes (`current`/`new`, read on load). */
export function speedometerHref(locale: EntityLocale, current: TireSizeEntry, next: TireSizeEntry): string {
  locale = toolLocale(locale);
  const base = localizedToolPath(locale, 'speedometer-error-calculator', 'tool');
  if (current.flotation || next.flotation) return base;
  const token = (entry: TireSizeEntry): string => `${entry.widthMm}-${entry.aspectRatio}-${entry.rimDiameterInches}`;
  return `${base}?current=${token(current)}&new=${token(next)}`;
}

/** "Can I fit this tire size?" check pre-filled with both sizes (`current`/`new`). */
export function fitCheckHref(locale: EntityLocale, current: TireSizeEntry, next: TireSizeEntry): string {
  locale = toolLocale(locale);
  const base = localizedToolPath(locale, 'tire-fit-check', 'tool');
  if (current.flotation || next.flotation) return base;
  const token = (entry: TireSizeEntry): string => `${entry.widthMm}-${entry.aspectRatio}-${entry.rimDiameterInches}`;
  return `${base}?current=${token(current)}&new=${token(next)}`;
}

export function boltPatternCalculatorHref(locale: EntityLocale, entry: BoltPatternEntry): string {
  locale = toolLocale(locale);
  const spacing = adjacentHoleSpacingMm(entry.pcdMm, entry.lugCount).toFixed(2);
  return `${localizedToolPath(locale, 'bolt-pattern-calculator', 'tool')}?lugs=${entry.lugCount}&spacing=${spacing}`;
}

/* ---------------------------------------------------------------------------------------
 * Vehicle page links
 *
 * Every vehicle has a page in every entity locale (EN, DE, ES, FR) regardless of the market
 * its data describes; the market is shown on the page. A vehicle link therefore always stays
 * in the reader's language.
 * ------------------------------------------------------------------------------------ */

export interface VehicleLink { readonly href: string; readonly locale: EntityLocale; readonly crossLocale: boolean; }

const VEHICLE_SEGMENT: Readonly<Record<EntityLocale, string>> = { en: '/vehicles/', de: '/de/fahrzeuge/', es: '/es/vehiculos/', fr: '/fr/vehicules/', it: '/it/veicoli/', 'pt-br': '/pt-br/veiculos/', pl: '/pl/pojazdy/', nl: '/nl/voertuigen/', tr: '/tr/araclar/' };

/** The vehicle-directory index for this locale. */
export function vehicleHubPath(locale: EntityLocale): string {
  return VEHICLE_SEGMENT[locale];
}

export function vehiclePagePath(locale: EntityLocale, id: string): string {
  return `${VEHICLE_SEGMENT[locale]}${id}/`;
}

export function vehicleLink(vehicle: VehicleFitment, locale: EntityLocale): VehicleLink {
  return Object.freeze({ href: vehiclePagePath(locale, vehicle.id), locale, crossLocale: false });
}

/** Reciprocal hreflang set for one vehicle (or for the directory when id is omitted). */
export function vehicleAlternates(id?: string): readonly { readonly hreflang: string; readonly href: string }[] {
  const path = (locale: EntityLocale): string => id === undefined ? vehicleHubPath(locale) : vehiclePagePath(locale, id);
  return Object.freeze([
    ...entityLocales().map((locale) => ({ hreflang: entityHreflang(locale), href: `https://atlasgarageos.com${path(locale)}` })),
    { hreflang: 'x-default', href: `https://atlasgarageos.com${path('en')}` },
  ]);
}

export function homePath(locale: EntityLocale): string {
  return locale === 'en' ? '/' : `/${locale}/`;
}

/** Distinct "Make Model" labels for the vehicles behind an entity, for FAQ copy. */
export function vehicleNames(vehicles: readonly VehicleFitment[]): string {
  return [...new Set(vehicles.map((vehicle) => `${vehicle.make} ${vehicle.model}`))].join(', ');
}

/**
 * The distinct center-bore values actually present on a set of vehicles, deduped and sorted
 * ascending.
 *
 * Deliberately NOT a min–max range. Rendering "57.1–66.6 mm" would imply every value in
 * between is a real fitment, when in fact only 57.1, 66.5 and 66.6 occur — and center bore is
 * one of the reasons a shared bolt pattern is not interchangeability, so a fake continuum
 * here would undercut the safety section on the same page.
 */
export function distinctCenterBores(vehicles: readonly VehicleFitment[]): readonly number[] {
  return Object.freeze([...new Set(vehicles.flatMap((vehicle) => (vehicle.centerBoreMm === undefined ? [] : [vehicle.centerBoreMm])))].sort((a, b) => a - b));
}

/** "57.1 / 66.5 / 66.6 mm", or an em dash when no vehicle in the set reports a bore. */
export function formatCenterBores(bores: readonly number[], locale: NumberLocale = 'en'): string {
  return bores.length === 0 ? '—' : `${bores.map((bore) => formatPlain(bore, locale)).join(' / ')} mm`;
}

/**
 * Split a localized H1 such as "235/45R18 tire size" or "Reifengröße 235/45R18" around the
 * notation, so the notation can stay visually dominant inside a semantically complete <h1>
 * without hardcoding word order per locale.
 */
export interface HeadingParts { readonly before: string; readonly key: string; readonly after: string; }

export function splitHeadingAroundKey(heading: string, key: string): HeadingParts {
  const index = heading.indexOf(key);
  if (index < 0) return Object.freeze({ before: heading, key: '', after: '' });
  return Object.freeze({ before: heading.slice(0, index), key, after: heading.slice(index + key.length) });
}

/* ---------------------------------------------------------------------------------------
 * Page metadata
 *
 * Built here rather than in each .astro file so the six route files stay thin wrappers and
 * the title/description/canonical/hreflang rules are written once and typechecked.
 * ------------------------------------------------------------------------------------ */
import { entityAlternates, entityDetailPath, entityHreflang, entityHubPath, entityLocales, toolLocaleFor, type HreflangAlternate } from '../seo/entity-routes';
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
  const shown = displayTireNotation(entry.notation, locale);
  const figures = {
    diameterMm: formatDecimal(metrics.overallDiameterMm, 1, locale),
    circumferenceMm: formatDecimal(metrics.circumferenceMm, 0, locale),
    diameterIn: formatDecimal(metrics.overallDiameterMm / 25.4, 1, locale),
    widthIn: formatDecimal(metrics.sectionWidthMm / 25.4, 1, locale),
    sidewallIn: formatDecimal(metrics.sidewallHeightMm / 25.4, 1, locale),
    sidewallMm: formatDecimal(metrics.sidewallHeightMm, 1, locale),
    rim: formatPlain(entry.rimDiameterInches, locale),
    commercial: Boolean(entry.commercial),
    flotation: Boolean(entry.flotation),
  };
  return Object.freeze({
    title: t.detailTitle(shown, figures),
    description: t.detailDescription(shown, figures, vehicles),
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

/* ---------------------------------------------------------------------------------------
 * Tire-height groups ("33-inch tires")
 *
 * Off-road and truck buyers describe tires by overall height. Every catalog size is grouped
 * by its calculated overall diameter rounded to the nearest inch, and each group with enough
 * sizes gets its own page in every locale. The group is computed, never hand-listed.
 * ------------------------------------------------------------------------------------ */

export const TIRE_DIAMETER_GROUP_MIN_SIZES = 4;
export const TIRE_DIAMETER_GROUP_RANGE = Object.freeze({ min: 22, max: 42 });

export interface TireDiameterGroupMember { readonly entry: TireSizeEntry; readonly diameterIn: number; }
export interface TireDiameterGroup { readonly inches: number; readonly members: readonly TireDiameterGroupMember[]; }

const DIAMETER_SLUG_SUFFIX: Readonly<Record<EntityLocale, string>> = Object.freeze({ en: 'inch', de: 'zoll', es: 'pulgadas', fr: 'pouces', it: 'pollici', 'pt-br': 'polegadas', pl: 'cali', nl: 'inch', tr: 'inc' });

export function tireDiameterGroupSlug(inches: number, locale: EntityLocale): string {
  return `${inches}-${DIAMETER_SLUG_SUFFIX[locale]}`;
}

export function tireDiameterGroupPath(inches: number, locale: EntityLocale): string {
  return entityDetailPath('tire-size', locale, tireDiameterGroupSlug(inches, locale));
}

let diameterGroupCache: readonly TireDiameterGroup[] | undefined;

export function tireDiameterGroups(catalog: readonly TireSizeEntry[] = tireSizeCatalog): readonly TireDiameterGroup[] {
  if (catalog === tireSizeCatalog && diameterGroupCache) return diameterGroupCache;
  const buckets = new Map<number, TireDiameterGroupMember[]>();
  for (const entry of catalog) {
    const diameterIn = tireSizeMetrics(entry).overallDiameterMm / 25.4;
    const inches = Math.round(diameterIn);
    if (inches < TIRE_DIAMETER_GROUP_RANGE.min || inches > TIRE_DIAMETER_GROUP_RANGE.max) continue;
    const bucket = buckets.get(inches);
    if (bucket) bucket.push({ entry, diameterIn });
    else buckets.set(inches, [{ entry, diameterIn }]);
  }
  const groups = [...buckets.entries()]
    .filter(([, members]) => members.length >= TIRE_DIAMETER_GROUP_MIN_SIZES)
    .sort((a, b) => a[0] - b[0])
    .map(([inches, members]) => Object.freeze({
      inches,
      members: Object.freeze(members.sort((a, b) => a.entry.rimDiameterInches - b.entry.rimDiameterInches || a.diameterIn - b.diameterIn)),
    }));
  const frozen = Object.freeze(groups);
  if (catalog === tireSizeCatalog) diameterGroupCache = frozen;
  return frozen;
}

export function tireDiameterGroupFor(entry: TireSizeEntry): TireDiameterGroup | undefined {
  const inches = Math.round(tireSizeMetrics(entry).overallDiameterMm / 25.4);
  return tireDiameterGroups().find((group) => group.inches === inches);
}

/** Per rim, the member whose diameter is closest to the whole number — the "classic" size. */
export function tireDiameterGroupHighlights(group: TireDiameterGroup): readonly TireDiameterGroupMember[] {
  const byRim = new Map<number, TireDiameterGroupMember>();
  for (const member of group.members) {
    // Highlights answer "what is N inches in metric", so only metric passenger sizes qualify.
    if (member.entry.commercial || member.entry.flotation) continue;
    const best = byRim.get(member.entry.rimDiameterInches);
    if (!best || Math.abs(member.diameterIn - group.inches) < Math.abs(best.diameterIn - group.inches)) byRim.set(member.entry.rimDiameterInches, member);
  }
  return Object.freeze([...byRim.values()].sort((a, b) => a.entry.rimDiameterInches - b.entry.rimDiameterInches));
}

export function tireDiameterGroupAlternates(inches: number): readonly HreflangAlternate[] {
  const href = (locale: EntityLocale): string => `https://atlasgarageos.com${tireDiameterGroupPath(inches, locale)}`;
  return Object.freeze([
    ...entityLocales().map((locale) => ({ hreflang: entityHreflang(locale), href: href(locale) })),
    { hreflang: 'x-default', href: href('en') },
  ]);
}

export function tireDiameterGroupMeta(group: TireDiameterGroup, locale: EntityLocale): EntityPageMeta {
  const t = tireSizePageText[locale];
  const pathname = tireDiameterGroupPath(group.inches, locale);
  const examples = tireDiameterGroupHighlights(group).filter((member) => !member.entry.flotation).slice(0, 3)
    .map((member) => displayTireNotation(member.entry.notation, locale)).join(', ');
  return Object.freeze({
    title: t.diameter.title(group.inches),
    description: t.diameter.description(group.inches, group.members.length, examples),
    pathname,
    alternates: tireDiameterGroupAlternates(group.inches),
    breadcrumbs: Object.freeze([
      { name: t.breadcrumbHome, href: homePath(locale) },
      { name: t.breadcrumbHub, href: entityHubPath('tire-size', locale) },
      { name: t.diameter.breadcrumb(group.inches), href: pathname },
    ]),
  });
}

/** Closest non-flotation, non-C metric sizes on the same rim, for a flotation size's FAQ. */
export function metricEquivalents(entry: TireSizeEntry, limit = 3): readonly TireSizeEntry[] {
  const base = tireSizeMetrics(entry).overallDiameterMm;
  return Object.freeze(tireSizeCatalog
    .filter((candidate) => !candidate.flotation && !candidate.commercial && candidate.rimDiameterInches === entry.rimDiameterInches)
    .map((candidate) => ({ candidate, diff: Math.abs(tireSizeMetrics(candidate).overallDiameterMm - base) / base, width: Math.abs(candidate.widthMm - tireSizeMetrics(entry).sectionWidthMm) }))
    .filter((item) => item.diff <= 0.02)
    .sort((a, b) => (a.diff + a.width / 2000) - (b.diff + b.width / 2000))
    .slice(0, limit)
    .map((item) => item.candidate));
}
