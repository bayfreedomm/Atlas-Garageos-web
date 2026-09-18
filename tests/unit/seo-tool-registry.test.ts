import { describe, expect, it } from 'vitest';
import { canonicalForPath, createSeoPageModel, indexableRoutes, relatedTools, routeForTool, toolRegistry } from '../../src/seo/tool-registry';
import { renderSitemapXml, sitemapEntries } from '../../src/seo/sitemap';

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
    const expectedCount = intendedRoutes.length + 2 * (4 + localizedTools);
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
