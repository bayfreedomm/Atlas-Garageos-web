import { describe, expect, it } from 'vitest';
import directory from '../../src/components/ToolDirectory.astro?raw';
import drawer from '../../src/components/NavigationDrawer.astro?raw';
import layout from '../../src/components/SiteLayout.astro?raw';
import toolPage from '../../src/components/ToolPage.astro?raw';
import home from '../../src/pages/en/index.astro?raw';
import homeLauncher from '../../src/components/HomeLauncher.astro?raw';
import hub from '../../src/pages/en/tools/index.astro?raw';
import { TOOL_CATEGORY_ORDER, routeForTool, toolById, toolRegistry } from '../../src/seo/tool-registry';
import { toolMatchesFilter } from '../../src/ui/toolbox-filter';
import { CURRENCY_STORAGE_KEY, parseCurrencyLabel, parseUnitSystem, UNIT_SYSTEM_STORAGE_KEY } from '../../src/ui/utility-preference';

describe('toolbox-first product surfaces', () => {
  it('searches tools and filters by category without hiding valid matches', () => {
    const psi = { category: 'Converters', searchText: 'psi to bar converter tire pressure', popular: true };
    expect(toolMatchesFilter(psi, 'psi', 'All', true)).toBe(true);
    expect(toolMatchesFilter(psi, 'pressure', 'Converters', false)).toBe(true);
    expect(toolMatchesFilter(psi, 'psi', 'Fuel & Trips', false)).toBe(false);
    expect(TOOL_CATEGORY_ORDER).toEqual(['Fuel & Trips', 'Tires & Wheels', 'Converters', 'Performance']);
    expect(directory).toContain('toolRegistry.filter');
  });

  it('uses clear labels and recognizable icons rather than developer abbreviations', () => {
    expect(directory).not.toMatch(/['"](?:FC|RT|TS|ET)['"]/);
    expect(directory).toContain('<ToolIcon');
    expect(directory).toContain('Search automotive tools...');
  });

  it('keeps every implemented tool discoverable and direct popular links on home', () => {
    expect(toolRegistry.filter(({ kind }) => kind === 'tool')).toHaveLength(13);
    expect(hub).toContain('<ToolDirectory mode="all"');
    expect(home).toContain('<HomeLauncher');
    expect(homeLauncher).toContain('data-tool-search-form');
    expect(homeLauncher).toContain('toolRegistry.filter');
    expect(directory).toContain('View all tools');
  });

  it('provides an accessible drawer with product navigation and theme settings', () => {
    expect(layout).not.toContain('bottom-nav');
    expect(drawer).toContain('aria-controls="navigation-drawer"');
    expect(drawer).toContain('data-menu-close');
    expect(drawer).toContain('Fitment Studio');
    expect(drawer).toContain('My Garage');
    expect(drawer).toContain('<ThemeControl');
  });

  it('puts calculator inputs directly after a compact tool heading', () => {
    expect(toolPage.indexOf('tool-intro')).toBeLessThan(toolPage.indexOf('tool-workspace'));
    expect(toolPage.indexOf('tool-workspace')).toBeLessThan(toolPage.indexOf('tool-explanation'));
    expect(toolPage).toContain('Related tools');
  });

  it('exposes all utility URLs and preserves independent preferences', () => {
    const ids = ['fuel-cost-calculator', 'road-trip-cost-calculator', 'mpg-l100km-converter', 'psi-bar-converter', 'hp-kw-converter', 'nm-lb-ft-converter', 'power-to-weight-calculator'] as const;
    for (const id of ids) expect(routeForTool(toolById(id))).toBe(`/en/tools/${id}/`);
    expect(UNIT_SYSTEM_STORAGE_KEY).toBe('atlas-unit-system');
    expect(CURRENCY_STORAGE_KEY).toBe('atlas-currency');
    expect(parseUnitSystem('imperial')).toBe('imperial');
    expect(parseCurrencyLabel('EUR')).toBe('EUR');
  });
});
