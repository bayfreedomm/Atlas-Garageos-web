import { describe, expect, it } from 'vitest';
import { canonicalForPath, createSeoPageModel, indexableRoutes, relatedTools, routeForTool, toolRegistry } from '../../src/seo/tool-registry';
import { renderSitemapXml, sitemapEntries } from '../../src/seo/sitemap';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { tireSizeCatalog } from '../../src/data/tire-size-catalog';
import { boltPatternCatalog } from '../../src/data/bolt-pattern-catalog';
import { entityLocales } from '../../src/seo/entity-routes';
import { dtcRecords } from '../../src/data/dtc-records';
import { tireDiameterGroups } from '../../src/ui/entity-page-model';
import { boltMakes } from '../../src/ui/bolt-make';
import { carMakes, publishedCarModels, yearPageYears } from '../../src/data/cars';

const intendedRoutes = [
  '/',
  '/tools/',
  '/methodology/',
  '/privacy-policy/',
  '/contact/',
  '/fitment-studio/',
  '/tools/tire-size-calculator/',
  '/tools/tire-size-comparison/',
  '/tools/can-i-fit-tire-size/',
  '/tools/wheel-offset-calculator/',
  '/tools/speedometer-error-calculator/',
  '/tools/gear-ratio-calculator/',
  '/tools/fitment-map/',
  '/tools/measure-my-car/',
  '/tools/fuel-cost-calculator/',
  '/tools/road-trip-cost-calculator/',
  '/tools/ev-charging-cost-calculator/',
  '/tools/mpg-l100km-converter/',
  '/tools/psi-bar-converter/',
  '/tools/hp-kw-converter/',
  '/tools/nm-lb-ft-converter/',
  '/tools/power-to-weight-calculator/',
  '/tools/bolt-pattern-calculator/',
  '/tools/tire-load-speed-rating/',
  '/tools/tire-date-code-decoder/',
  '/tools/towing-capacity-calculator/',
  '/tools/quarter-mile-calculator/',
  '/tools/compression-ratio-calculator/',
  // The fuel market dashboard is a real registry entry (kind: 'data-product') with its own
  // top-level route, so it appears here through the same indexableRoutes path as the tools.
  '/gas-prices-today/',
  '/tools/find-my-vehicle/',
];

describe('SEO tool registry', () => {
  it('keeps ids, locale slugs, and generated routes unique', () => {
    expect(new Set(toolRegistry.map(({ id }) => id)).size).toBe(toolRegistry.length);
    expect(new Set(toolRegistry.map(({ locale, slug }) => `${locale}:${slug}`)).size).toBe(toolRegistry.length);
    expect(new Set(toolRegistry.map(routeForTool)).size).toBe(toolRegistry.length);
  });

  it('exposes only real platform and implemented tool pages as indexable routes', () => {
    expect(indexableRoutes).toEqual(intendedRoutes);
    expect(toolRegistry.every(({ status, indexable }) => status === 'implemented' && indexable)).toBe(true);
  });

  it('builds stable locale routes and canonical URLs without application state', () => {
    expect(routeForTool(toolRegistry[1]!)).toBe('/tools/tire-size-calculator/');
    expect(canonicalForPath('/fitment-studio/?unit=imperial#setup=abc')).toBe('https://atlasgarageos.com/fitment-studio/');
  });

  it('keeps every related-tool edge valid and non-self-referential', () => {
    for (const tool of toolRegistry) {
      expect(relatedTools(tool)).toHaveLength(tool.relatedToolIds.length);
      expect(tool.relatedToolIds).not.toContain(tool.id);
    }
  });

  it('renders a sitemap with intended canonical pages and no app state', () => {
    const entries = sitemapEntries();
    // Localized (DE/ES) platform + tool pages are appended after the English routes. Every
    // registry entry now has a DE/ES route — including the fitment-studio flagship, which gained
    // /de/fitment-studio/ and /es/fitment-studio/ — and the five platform pages include /contact/.
    const localizedPlatformPages = 5;
    const localizedTools = toolRegistry.filter((tool) => tool.indexable && tool.status === 'implemented').length;
    // Vehicle pages: three comparison hubs, plus per entity locale one directory and one page
    // per vehicle (every vehicle is published in every language). Pair state stays query-only.
    const vehicleRoutes = 3 + entityLocales().length * (1 + vehicleFitmentData.length);
    // Entity pages: per published locale, one hub per family plus one detail page per catalog
    // row. Both catalogs are derived from vehicleFitmentData, so this figure moves on its own
    // when a vehicle with a new tire size or bolt pattern is added — nothing here is a
    // hand-maintained page count.
    const entityRoutes = entityLocales().length * (2 + tireSizeCatalog.length + tireDiameterGroups().length + boltPatternCatalog.length + boltMakes.length);
    // Diagnostics adds one directory plus exactly one page per record that passed the production
    // catalog publication gate. Draft fixtures and arbitrary input state never reach the sitemap.
    const diagnosticRoutes = 1 + dtcRecords.length;
    // The six newer locales (fr, it, pt-br, pl, nl, tr) publish every platform page and calculator,
    // except the fuel market dashboard, which exists only for markets with official data (US, DE, ES).
    const newLocaleRoutes = 6 * (localizedPlatformPages + localizedTools - 1);
    // English /cars/ family: directory, makes, models and EPA model years from 2000.
    const carRoutes = 1 + carMakes.length + publishedCarModels.length + publishedCarModels.reduce((total, model) => total + yearPageYears(model).length, 0);
    // Cloudflare's free plan deploys at most 20,000 static files; keep headroom for assets.
    expect(entries.length).toBeLessThan(19_800);
    const expectedCount = intendedRoutes.length + 2 * (localizedPlatformPages + localizedTools) + vehicleRoutes + entityRoutes + diagnosticRoutes + newLocaleRoutes + carRoutes;
    expect(entries).toHaveLength(expectedCount);
    for (const route of intendedRoutes.map(canonicalForPath)) expect(entries).toContain(route);
    expect(entries).toContain('https://atlasgarageos.com/de/');
    expect(entries).toContain('https://atlasgarageos.com/es/');
    expect(entries).toContain('https://atlasgarageos.com/de/tools/felgen-et-rechner/');
    expect(entries).toContain('https://atlasgarageos.com/es/tools/calculadora-offset-llantas/');
    expect(entries).toContain('https://atlasgarageos.com/vehicles/compare/');
    expect(entries).toContain('https://atlasgarageos.com/de/fahrzeuge/vergleichen/');
    expect(entries).toContain('https://atlasgarageos.com/es/vehiculos/comparar/');
    expect(entries).toContain('https://atlasgarageos.com/tr/tools/lastik-ebadi-hesaplama/');
    expect(entries).toContain('https://atlasgarageos.com/fr/fitment-studio/');
    expect(entries).not.toContain('https://atlasgarageos.com/tr/akaryakit-fiyatlari-bugun/');
    // The flagship now has localized pages; they must be in the sitemap.
    expect(entries).toContain('https://atlasgarageos.com/de/fitment-studio/');
    expect(entries).toContain('https://atlasgarageos.com/es/fitment-studio/');
    expect(entries).toContain('https://atlasgarageos.com/obd-codes/');
    for (const record of dtcRecords) expect(entries).toContain(`https://atlasgarageos.com/obd-codes/${record.slug}/`);
    const xml = renderSitemapXml();
    expect(xml.match(/<url>/g)).toHaveLength(expectedCount);
    expect(xml).not.toContain('#');
    expect(entries.every((url) => !url.includes('?'))).toBe(true);
    expect(xml).toContain('<loc>https://atlasgarageos.com/</loc>');
    expect(xml).not.toContain('https://atlasgarageos.com/en/');
  });

  it('provides a validated seam for future high-value SEO pages', () => {
    expect(createSeoPageModel({ locale: 'en', pathname: '/tire-size/225-45-r18/', indexable: false, kind: 'tire-size' })).toMatchObject({ canonical: 'https://atlasgarageos.com/tire-size/225-45-r18/', indexable: false });
    expect(() => createSeoPageModel({ locale: 'en', pathname: '/tire-size/225 45 r18/', indexable: false, kind: 'tire-size' })).toThrow('Invalid SEO pathname');
  });
});
