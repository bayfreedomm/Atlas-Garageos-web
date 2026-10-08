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

/**
 * The figures are identical on EN, DE and ES pages; only the decimal separator and percent
 * spacing follow the reader's locale ("631,9 mm" / "55 %" in German and Spanish).
 */
export function formatTireMetrics(metrics: TireSizeMetrics, locale: NumberLocale = 'en'): FormattedTireMetrics {
  return Object.freeze({
    sectionWidth: `${metrics.sectionWidthMm} mm`,
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
  const view = tireInchView(metrics);
  return `${formatDecimal(view.overallDiameterIn, 1, locale)} × ${formatDecimal(view.sectionWidthIn, 1, locale)} R${formatPlain(entry.rimDiameterInches, locale)}`;
}

/** German/Spanish write "205/55 R16"; English keeps the compact "205/55R16". */
export function displayTireNotation(notation: string, locale: NumberLocale): string {
  return locale === 'en' ? notation : notation.replace(/R(\d)/, ' R$1');
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
    && candidate.notation !== entry.notation);
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
  const spacing = adjacentHoleSpacingMm(entry.pcdMm, entry.lugCount).toFixed(2);
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
  const shown = displayTireNotation(entry.notation, locale);
  const figures = {
    diameterMm: formatDecimal(metrics.overallDiameterMm, 1, locale),
    circumferenceMm: formatDecimal(metrics.circumferenceMm, 0, locale),
    diameterIn: formatDecimal(metrics.overallDiameterMm / 25.4, 1, locale),
    sidewallMm: formatDecimal(metrics.sidewallHeightMm, 1, locale),
    commercial: Boolean(entry.commercial),
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
