import { canonicalForPath, indexableRoutes, toolRegistry } from './tool-registry';
import { localizedToolPath } from '../localization/locales';
import { vehicleFitmentData } from '../data/vehicle-fitment';
import { tireSizeCatalog } from '../data/tire-size-catalog';
import { boltPatternCatalog } from '../data/bolt-pattern-catalog';
import { entityDetailPath, entityHubPath, entityLocales } from './entity-routes';
import { dtcRecords } from '../data/dtc-records';
import { tireDiameterGroupPath, tireDiameterGroups, vehicleHubPath, vehiclePagePath } from '../ui/entity-page-model';
import { CONTENT_LOCALES } from '../localization/site-catalog';
import { boltMakePath, boltMakes } from '../ui/bolt-make';
import { localizedCarRoutes } from '../ui/car-locale';
import { tireComparisonPairs } from '../data/tire-comparisons';
import { carMakePath, carMakes, carModelPath, carYearPath, publishedCarModels, yearPageYears } from '../data/cars';

const LOCALIZED_PLATFORM_PATHS = ['/', '/tools/', '/methodology/', '/privacy-policy/', '/contact/'] as const;

function localizedRoutes(): readonly string[] {
  const locales = CONTENT_LOCALES;
  const routes: string[] = [];
  for (const locale of locales) {
    for (const path of LOCALIZED_PLATFORM_PATHS) {
      routes.push(path === '/' ? `/${locale}/` : `/${locale}${path}`);
    }
    for (const tool of toolRegistry) {
      if (!(tool.indexable && tool.status === 'implemented')) continue;
      // Fuel market dashboards exist only for markets with official price data (US, DE, ES).
      if (tool.id === 'gas-prices-today' && locale !== 'de' && locale !== 'es') continue;
      // The fitment-studio flagship page now has a published DE/ES route too, but — unlike
      // every calculator, which gets a fully localized slug from localizedToolPath — it keeps
      // the same unprefixed 'fitment-studio' slug in every locale (see the DE/ES pages under
      // src/pages/de/fitment-studio/ and src/pages/es/fitment-studio/), so it needs its own
      // locale-prefix-only path here instead of localizedToolPath's localized slug.
      routes.push(tool.id === 'fitment-studio' ? `/${locale}/fitment-studio/` : localizedToolPath(locale, tool.id, tool.kind));
    }
  }
  return routes;
}

// The fuel market dashboard used to be listed here by hand. It is now a real registry entry
// (kind: 'data-product'), so indexableRoutes covers /gas-prices-today/ and localizedRoutes()
// covers /de/kraftstoffpreise/ and /es/precio-gasolina-hoy/ through the same code path as
// every other page — listing it again here would only duplicate it.

function vehiclePageRoutes(): readonly string[] {
  // Every vehicle has a page in every entity locale; comparison hubs exist for EN/DE/ES.
  const routes: string[] = ['/vehicles/compare/', '/de/fahrzeuge/vergleichen/', '/es/vehiculos/comparar/'];
  for (const locale of entityLocales()) {
    routes.push(vehicleHubPath(locale));
    for (const vehicle of vehicleFitmentData) routes.push(vehiclePagePath(locale, vehicle.id));
  }
  return routes;
}

/**
 * Tire-size and bolt-pattern entity pages, iterated out of their catalogs exactly the way
 * vehiclePageRoutes() iterates vehicleFitmentData. The tire catalog combines the maintained
 * production-size reference with vehicle-only OEM sizes; both catalogs have already excluded
 * malformed data. A sourced catalog addition reaches the sitemap automatically.
 */
function entityPageRoutes(): readonly string[] {
  const routes: string[] = [];
  for (const locale of entityLocales()) {
    routes.push(entityHubPath('tire-size', locale));
    for (const entry of tireSizeCatalog) routes.push(entityDetailPath('tire-size', locale, entry.slug));
    for (const group of tireDiameterGroups()) routes.push(tireDiameterGroupPath(group.inches, locale));
    routes.push(entityHubPath('bolt-pattern', locale));
    for (const entry of boltPatternCatalog) routes.push(entityDetailPath('bolt-pattern', locale, entry.slug));
    for (const make of boltMakes) routes.push(boltMakePath(locale, make.makeSlug));
  }
  return routes;
}

/** English /cars/ directory, make pages and model pages. */
function carModelRoutes(): readonly string[] {
  return ['/cars/', ...carMakes.map((make) => carMakePath(make.makeSlug)), ...publishedCarModels.map((model) => carModelPath(model))];
}

/** English EPA model-year pages from 2000 (/cars/{make}/{model}/{year}/). */
function carYearRoutes(): readonly string[] {
  return publishedCarModels.flatMap((model) => yearPageYears(model).map((year) => carYearPath(model, year)));
}

/** Factory-backed "X vs Y" tire-size comparisons in every entity locale. */
function tireComparisonRoutes(): readonly string[] {
  return entityLocales().flatMap((locale) => tireComparisonPairs.map((pair) => entityDetailPath('tire-size', locale, pair.slug)));
}

function diagnosticRoutes(): readonly string[] {
  return ['/obd-codes/', ...dtcRecords.map((record) => `/obd-codes/${record.slug}/`)];
}

function split(routes: readonly string[], test: (path: string) => boolean): [string[], string[]] {
  const hit: string[] = [];
  const miss: string[] = [];
  for (const route of routes) (test(route) ? hit : miss).push(route);
  return [hit, miss];
}

/**
 * The sitemap is published as a sitemap index (/sitemap.xml) plus one child sitemap per page
 * type, so Search Console and Bing Webmaster report discovery and indexing per type. Every
 * indexable URL belongs to exactly one group; the groups are listed in a fixed order.
 */
export const SITEMAP_GROUP_IDS = ['pages', 'tire-sizes', 'tire-comparisons', 'bolt-patterns', 'vehicles', 'cars', 'car-years', 'cars-localized', 'obd-codes'] as const;
export type SitemapGroupId = (typeof SITEMAP_GROUP_IDS)[number];
export interface SitemapGroup { readonly id: SitemapGroupId; readonly path: string; readonly urls: readonly string[]; }

let cachedGroups: readonly SitemapGroup[] | undefined;

export function sitemapGroups(): readonly SitemapGroup[] {
  if (cachedGroups) return cachedGroups;
  const tireAndBolt = entityPageRoutes();
  const tirePrefixes = new Set(entityLocales().map((locale) => entityHubPath('tire-size', locale)));
  const [tires, bolts] = split(tireAndBolt, (path) => [...tirePrefixes].some((prefix) => path.startsWith(prefix)));
  const raw: Record<SitemapGroupId, readonly string[]> = {
    pages: [...indexableRoutes, ...localizedRoutes()],
    'tire-sizes': tires,
    'tire-comparisons': tireComparisonRoutes(),
    'bolt-patterns': bolts,
    vehicles: vehiclePageRoutes(),
    cars: carModelRoutes(),
    'car-years': carYearRoutes(),
    // Localized wheel-fitment view of every model with ANKUSI wheel data (src/ui/car-locale.ts).
    'cars-localized': localizedCarRoutes(),
    'obd-codes': diagnosticRoutes(),
  };
  cachedGroups = Object.freeze(SITEMAP_GROUP_IDS.map((id) => Object.freeze({ id, path: `/sitemap-${id}.xml`, urls: Object.freeze(raw[id].map(canonicalForPath)) })));
  return cachedGroups;
}

export function sitemapEntries(): readonly string[] {
  return Object.freeze(sitemapGroups().flatMap((group) => group.urls));
}

const urlset = (urls: readonly string[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;

/** One flat urlset with every indexable URL (kept for tests and tooling; not published). */
export function renderSitemapXml(): string {
  return urlset(sitemapEntries());
}

/** /sitemap.xml — the sitemap index advertised in robots.txt and submitted to Search Console. */
export function renderSitemapIndexXml(): string {
  const items = sitemapGroups().map((group) => `  <sitemap><loc>${canonicalForPath(group.path)}</loc></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export function renderSitemapGroupXml(id: SitemapGroupId): string {
  const group = sitemapGroups().find((entry) => entry.id === id);
  if (!group) throw new Error(`Unknown sitemap group: ${id}`);
  return urlset(group.urls);
}
