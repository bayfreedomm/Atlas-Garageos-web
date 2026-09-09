import { describe, expect, it } from 'vitest';
import brand from '../../src/components/Brand.astro?raw';
import home from '../../src/pages/en/index.astro?raw';
import toolsHub from '../../src/pages/en/tools/index.astro?raw';
import siteLayout from '../../src/components/SiteLayout.astro?raw';
import navigationDrawer from '../../src/components/NavigationDrawer.astro?raw';
import toolDirectory from '../../src/components/ToolDirectory.astro?raw';
import studio from '../../src/pages/en/fitment-studio/index.astro?raw';
import { inchesToMillimeters } from '../../src/core/units/conversion';
import { tireScaleMapping, wheelOffsetVisualMapping } from '../../src/ui/fitment-visualizer-model';
import { parseThemePreference, resolveTheme, THEME_STORAGE_KEY } from '../../src/ui/theme-preference';
import { platformPageRegistry, routeForTool, toolRegistry } from '../../src/seo/tool-registry';

describe('Milestone 8 product experience', () => {
  it('supports persisted light, dark, and system theme preferences', () => {
    expect(THEME_STORAGE_KEY).toBe('atlas-theme');
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference('unknown')).toBe('system');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('uses the responsive Atlas glyph and the four-part product shell', () => {
    expect(brand).toContain('brand-glyph');
    expect(brand).toContain('Atlas');
    for (const label of ['Home', 'My Garage', 'Fitment Studio', 'Tools']) expect(`${siteLayout}${navigationDrawer}`).toContain(`>${label}</a>`);
  });

  it('publishes a useful home and maps every implemented tool into the hub', () => {
    expect(platformPageRegistry.map(({ pathname }) => pathname)).toEqual(['/en/', '/en/tools/']);
    expect(home).toContain('Every automotive tool in one place.');
    expect(home).toContain('/en/fitment-studio/');
    expect(`${home}${toolDirectory}`).toContain('/en/tools/');
    expect(toolsHub).toContain('<ToolDirectory mode="all"');
    expect(toolDirectory).toContain("toolRegistry.filter(({ kind }) => kind === 'tool')");
    for (const tool of toolRegistry.filter(({ kind }) => kind === 'tool')) expect(routeForTool(tool)).toMatch(/^\/en\/tools\/.+\/$/);
  });

  it('keeps key internal routes connected', () => {
    expect(siteLayout).toContain('/en/fitment-studio/#garage');
    expect(studio).toContain('href="/en/"');
    expect(studio).toContain('href="/en/tools/"');
  });

  it('maps calculated tire dimensions to a shared SVG scale', () => {
    const mapping = tireScaleMapping({ currentDiameterMm: 600, currentRimDiameterInches: 18, proposedDiameterMm: 660, proposedRimDiameterInches: 19 });
    expect(mapping.proposedTireRadius).toBeCloseTo(62);
    expect(mapping.currentTireRadius).toBeCloseTo(56.364);
    expect(mapping.currentRimRadius).toBeCloseTo(inchesToMillimeters(18) * (62 / 660));
  });

  it('maps core wheel deltas relative to the unchanged baseline', () => {
    const unchanged = wheelOffsetVisualMapping(0, 0);
    const moved = wheelOffsetVisualMapping(10, 15);
    expect(unchanged).toEqual({ currentX: 82, currentWidth: 196, proposedX: 82, proposedWidth: 196 });
    expect(moved.proposedX).toBeLessThan(unchanged.proposedX);
    expect(moved.proposedWidth).toBeGreaterThan(unchanged.proposedWidth);
  });
});
