import { canonicalForPath, indexableRoutes, toolRegistry } from './tool-registry';
import { localizedToolPath } from '../localization/locales';
import { vehicleFitmentData } from '../data/vehicle-fitment';
import { tireSizeCatalog } from '../data/tire-size-catalog';
import { boltPatternCatalog } from '../data/bolt-pattern-catalog';
import { entityDetailPath, entityHubPath, entityLocales } from './entity-routes';
import { dtcRecords } from '../data/dtc-records';
import { tireDiameterGroupPath, tireDiameterGroups, vehicleHubPath, vehiclePagePath } from '../ui/entity-page-model';
import { REFERENCE_LOCALES } from '../localization/reference-locales';
import { boltMakePath, boltMakes } from '../ui/bolt-make';
import { carMakePath, carMakes, carModelPath, carYearPath, publishedCarModels, yearPageYears } from '../data/cars';

const LOCALIZED_PLATFORM_PATHS = ['/', '/tools/', '/methodology/', '/privacy-policy/', '/contact/'] as const;

function localizedRoutes(): readonly string[] {
  const locales = ['de', 'es'] as const;
  const routes: string[] = [];
  for (const locale of locales) {
    for (const path of LOCALIZED_PLATFORM_PATHS) {
      routes.push(path === '/' ? `/${locale}/` : `/${locale}${path}`);
    }
    for (const tool of toolRegistry) {
      if (!(tool.indexable && tool.status === 'implemented')) continue;
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

/** English /cars/ family: directory, one page per make, per model, and per EPA model year from 2000. */
function carRoutes(): readonly string[] {
  return [
    '/cars/',
    ...carMakes.map((make) => carMakePath(make.makeSlug)),
    ...publishedCarModels.map((model) => carModelPath(model)),
    ...publishedCarModels.flatMap((model) => yearPageYears(model).map((year) => carYearPath(model, year))),
  ];
}

export function sitemapEntries(): readonly string[] {
  const diagnosticRoutes = ['/obd-codes/', ...dtcRecords.map((record) => `/obd-codes/${record.slug}/`)];
  // Reference-only locales publish the reference families; each has a localized home.
  const referenceHomes = REFERENCE_LOCALES.map((locale) => `/${locale}/`);
  return Object.freeze([...indexableRoutes, ...localizedRoutes(), ...vehiclePageRoutes(), ...entityPageRoutes(), ...diagnosticRoutes, ...referenceHomes, ...carRoutes()].map(canonicalForPath));
}

export function renderSitemapXml(): string {
  const urls = sitemapEntries().map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
