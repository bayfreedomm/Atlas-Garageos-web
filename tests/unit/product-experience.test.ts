import { describe, expect, it } from 'vitest';
import brand from '../../src/components/Brand.astro?raw';
import home from '../../src/pages/index.astro?raw';
import homeLauncher from '../../src/components/HomeLauncher.astro?raw';
import toolsHub from '../../src/pages/tools/index.astro?raw';
import siteLayout from '../../src/components/SiteLayout.astro?raw';
import navigationDrawer from '../../src/components/NavigationDrawer.astro?raw';
import toolDirectory from '../../src/components/ToolDirectory.astro?raw';
import studio from '../../src/pages/fitment-studio/index.astro?raw';
import toolCalculators from '../../src/ui/tool-calculators.ts?raw';
import { inchesToMillimeters } from '../../src/core/units/conversion';
import { tireScaleMapping, wheelOffsetVisualMapping } from '../../src/ui/fitment-visualizer-model';
import { parseThemePreference, resolveTheme, THEME_STORAGE_KEY } from '../../src/ui/theme-preference';
import { platformPageRegistry, routeForTool, toolRegistry } from '../../src/seo/tool-registry';

describe('Milestone 8 product experience', () => {
  it('supports persisted light, dark, and system theme preferences', () => {
    expect(THEME_STORAGE_KEY).toBe('atlas-theme-v4');
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference('unknown')).toBe('system');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('uses the Atlas wordmark with its glyph mark and a simple three-part product shell', () => {
    expect(brand).toContain('brand-glyph');
    expect(brand).toContain('Atlas');
    expect(brand).toContain('Garage');
    expect(brand).toContain('brand-wordmark__os');
    // Nav labels are now locale-aware (uiStrings[locale] with an English fallback), so the
    // literal text is the JS fallback default rather than raw HTML — verify that default instead.
    for (const label of ['Home', 'Tools', 'Wheel & Tire Compare']) expect(`${siteLayout}${navigationDrawer}`).toContain(`?? '${label}'`);
    expect(siteLayout).not.toContain('>My Garage</a>');
  });

  it('publishes a useful home and maps every implemented tool into the hub', () => {
    expect(platformPageRegistry.map(({ pathname }) => pathname)).toEqual(['/', '/tools/', '/methodology/', '/privacy-policy/']);
    expect(home).toContain('<HomeLauncher');
    expect(homeLauncher).toContain('What do you want to calculate?');
    expect(homeLauncher).toContain('tool-launch-row');
    expect(`${home}${homeLauncher}`).toContain('/fitment-studio/');
    expect(`${home}${homeLauncher}${toolDirectory}`).toContain('/tools/');
    expect(toolsHub).toContain('<ToolDirectory mode="all"');
    expect(toolDirectory).toContain("toolRegistry.filter(({ kind }) => kind === 'tool')");
    for (const tool of toolRegistry.filter(({ kind }) => kind === 'tool')) expect(routeForTool(tool)).toMatch(/^\/tools\/.+\/$/);
    expect(homeLauncher).toContain('src="/atlas-hero-car.webp"');
    expect(homeLauncher).toContain('width="1672" height="941"');
  });

  it('keeps key internal routes connected', () => {
    expect(siteLayout).not.toContain('/fitment-studio/#garage');
    expect(studio).toContain('id="garage"');
    expect(studio).toContain('href="/"');
    expect(studio).toContain('id="compare"');
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

  it('hides stale result summaries while calculator input is invalid', () => {
    expect(toolCalculators).toContain('function hideSummary(form: HTMLFormElement)');
    expect(toolCalculators).toContain('hideSummary(form); renderIssues(errors, result.issues)');
    expect(toolCalculators).toContain('element.hidden = false; element.textContent = summary');
    expect(toolCalculators).toContain("if (visual) visual.hidden = true; const nearSizes");
    expect(toolCalculators).toContain('visual.hidden = false;');
  });
});
