import { describe, expect, it } from 'vitest';
import { canonicalForPath, createSeoPageModel, indexableRoutes, relatedTools, routeForTool, toolRegistry } from '../../src/seo/tool-registry';
import { renderSitemapXml, sitemapEntries } from '../../src/seo/sitemap';

const intendedRoutes = [
  '/en/',
  '/en/tools/',
  '/en/fitment-studio/',
  '/en/tools/tire-size-calculator/',
  '/en/tools/tire-size-comparison/',
  '/en/tools/wheel-offset-calculator/',
  '/en/tools/speedometer-error-calculator/',
  '/en/tools/fitment-map/',
  '/en/tools/measure-my-car/',
  '/en/tools/fuel-cost-calculator/',
  '/en/tools/road-trip-cost-calculator/',
  '/en/tools/mpg-l100km-converter/',
  '/en/tools/psi-bar-converter/',
  '/en/tools/hp-kw-converter/',
  '/en/tools/nm-lb-ft-converter/',
  '/en/tools/power-to-weight-calculator/',
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
    expect(routeForTool(toolRegistry[1]!)).toBe('/en/tools/tire-size-calculator/');
    expect(canonicalForPath('/en/fitment-studio/?unit=imperial#setup=abc')).toBe('https://atlasgarageos.com/en/fitment-studio/');
  });

  it('keeps every related-tool edge valid and non-self-referential', () => {
    for (const tool of toolRegistry) {
      expect(relatedTools(tool)).toHaveLength(tool.relatedToolIds.length);
      expect(tool.relatedToolIds).not.toContain(tool.id);
    }
  });

  it('renders a sitemap with intended canonical pages and no app state', () => {
    expect(sitemapEntries()).toEqual(intendedRoutes.map(canonicalForPath));
    const xml = renderSitemapXml();
    expect(xml.match(/<url>/g)).toHaveLength(intendedRoutes.length);
    expect(xml).not.toContain('#');
    expect(sitemapEntries().every((url) => !url.includes('?'))).toBe(true);
    expect(xml).not.toContain('<loc>https://atlasgarageos.com/</loc>');
  });

  it('provides a validated seam for future high-value SEO pages', () => {
    expect(createSeoPageModel({ locale: 'en', pathname: '/en/tire-size/225-45-r18/', indexable: false, kind: 'tire-size' })).toMatchObject({ canonical: 'https://atlasgarageos.com/en/tire-size/225-45-r18/', indexable: false });
    expect(() => createSeoPageModel({ locale: 'en', pathname: '/en/tire-size/225 45 r18/', indexable: false, kind: 'tire-size' })).toThrow('Invalid SEO pathname');
  });
});
