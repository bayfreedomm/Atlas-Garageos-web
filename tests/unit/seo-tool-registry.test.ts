import { describe, expect, it } from 'vitest';
import { canonicalForPath, createSeoPageModel, indexableRoutes, relatedTools, routeForTool, toolRegistry } from '../../src/seo/tool-registry';
import { renderSitemapXml, sitemapEntries } from '../../src/seo/sitemap';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { tireSizeCatalog } from '../../src/data/tire-size-catalog';
import { boltPatternCatalog } from '../../src/data/bolt-pattern-catalog';
import { entityLocales } from '../../src/seo/entity-routes';

const intendedRoutes = [
  '/',
  '/tools/',
  '/methodology/',
  '/privacy-policy/',
  '/fitment-studio/',
  '/tools/tire-size-calculator/',
  '/tools/tire-size-comparison/',
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
    // Localized (DE/ES) platform + tool pages are appended after the English routes;
    // the flagship fitment-studio page has no localized version and is intentionally excluded.
    const localizedTools = toolRegistry.filter((tool) => tool.indexable && tool.status === 'implemented' && tool.id !== 'fitment-studio').length;
    // Vehicle pages: three localized index routes plus one route per US vehicle and two
    // (DE + ES) per non-US vehicle.
    const vehicleRoutes = 3 + vehicleFitmentData.reduce((total, vehicle) => total + (vehicle.market === 'us' ? 1 : 2), 0);
    // Entity pages: per published locale, one hub per family plus one detail page per catalog
    // row. Both catalogs are derived from vehicleFitmentData, so this figure moves on its own
    // when a vehicle with a new tire size or bolt pattern is added — nothing here is a
    // hand-maintained page count.
    const entityRoutes = entityLocales().length * (2 + tireSizeCatalog.length + boltPatternCatalog.length);
    const expectedCount = intendedRoutes.length + 2 * (4 + localizedTools) + vehicleRoutes + entityRoutes;
    expect(entries).toHaveLength(expectedCount);
    for (const route of intendedRoutes.map(canonicalForPath)) expect(entries).toContain(route);
    expect(entries).toContain('https://atlasgarageos.com/de/');
    expect(entries).toContain('https://atlasgarageos.com/es/');
    expect(entries).toContain('https://atlasgarageos.com/de/tools/felgen-et-rechner/');
    expect(entries).toContain('https://atlasgarageos.com/es/tools/calculadora-offset-llantas/');
    expect(entries).not.toContain('https://atlasgarageos.com/de/fitment-studio/');
    expect(entries).not.toContain('https://atlasgarageos.com/es/fitment-studio/');
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
