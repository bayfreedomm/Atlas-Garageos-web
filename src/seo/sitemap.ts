import { canonicalForPath, indexableRoutes, toolRegistry } from './tool-registry';
import { localizedToolPath } from '../localization/locales';
import { vehicleFitmentData } from '../data/vehicle-fitment';
import { tireSizeCatalog } from '../data/tire-size-catalog';
import { boltPatternCatalog } from '../data/bolt-pattern-catalog';
import { entityDetailPath, entityHubPath, entityLocales } from './entity-routes';
import { dtcRecords } from '../data/dtc-records';

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
  const routes: string[] = [
    '/vehicles/', '/vehicles/compare/',
    '/de/fahrzeuge/', '/de/fahrzeuge/vergleichen/',
    '/es/vehiculos/', '/es/vehiculos/comparar/',
  ];
  for (const vehicle of vehicleFitmentData) {
    if (vehicle.market === 'us') routes.push(`/vehicles/${vehicle.id}/`);
    else {
      routes.push(`/de/fahrzeuge/${vehicle.id}/`);
      routes.push(`/es/vehiculos/${vehicle.id}/`);
    }
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
    routes.push(entityHubPath('bolt-pattern', locale));
    for (const entry of boltPatternCatalog) routes.push(entityDetailPath('bolt-pattern', locale, entry.slug));
  }
  return routes;
}

export function sitemapEntries(): readonly string[] {
  const diagnosticRoutes = ['/obd-codes/', ...dtcRecords.map((record) => `/obd-codes/${record.slug}/`)];
  return Object.freeze([...indexableRoutes, ...localizedRoutes(), ...vehiclePageRoutes(), ...entityPageRoutes(), ...diagnosticRoutes].map(canonicalForPath));
}

export function renderSitemapXml(): string {
  const urls = sitemapEntries().map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
