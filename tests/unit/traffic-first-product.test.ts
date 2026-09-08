import { describe, expect, it } from 'vitest';
import quickStart from '../../src/components/QuickStart.astro?raw';
import home from '../../src/pages/en/index.astro?raw';
import hub from '../../src/pages/en/tools/index.astro?raw';
import { TOOL_CATEGORY_ORDER, routeForTool, toolById, toolRegistry } from '../../src/seo/tool-registry';
import { CURRENCY_STORAGE_KEY, parseCurrencyLabel, parseUnitSystem, UNIT_SYSTEM_STORAGE_KEY } from '../../src/ui/utility-preference';

describe('traffic-first product surfaces', () => {
  it('maps all four Quick Start intents to a real working surface', () => {
    for (const id of ['tire', 'fuel', 'trip', 'convert']) {
      expect(quickStart).toContain(`data-quick-tab="${id}"`);
      expect(quickStart).toContain(`data-quick-panel="${id}"`);
    }
    expect(quickStart).toContain('data-calculator="tire-size"');
    expect(quickStart).toContain('data-utility-calculator="fuel-cost"');
    expect(quickStart).toContain('data-utility-calculator="road-trip"');
    expect(quickStart).toContain('data-utility-calculator="pressure"');
  });

  it('puts the working Quick Start before discovery and product promotion', () => {
    expect(home.indexOf('<QuickStart')).toBeLessThan(home.indexOf('popular-tools'));
    expect(home.indexOf('popular-tools')).toBeLessThan(home.indexOf('product-paths'));
    expect(home).toContain('All 13 tools');
  });

  it('groups every non-flagship tool exactly once in the compact directory', () => {
    expect(TOOL_CATEGORY_ORDER).toEqual(['Fuel & Trips', 'Tires & Wheels', 'Converters', 'Performance']);
    const tools = toolRegistry.filter(({ kind }) => kind === 'tool');
    expect(tools).toHaveLength(13);
    expect(tools.every(({ category }) => TOOL_CATEGORY_ORDER.includes(category))).toBe(true);
    expect(hub).toContain('TOOL_CATEGORY_ORDER.map');
  });

  it('exposes all seven new utilities at stable indexable routes', () => {
    const ids = ['fuel-cost-calculator', 'road-trip-cost-calculator', 'mpg-l100km-converter', 'psi-bar-converter', 'hp-kw-converter', 'nm-lb-ft-converter', 'power-to-weight-calculator'] as const;
    for (const id of ids) expect(routeForTool(toolById(id))).toBe(`/en/tools/${id}/`);
  });

  it('keeps unit system and currency as independent validated preferences', () => {
    expect(UNIT_SYSTEM_STORAGE_KEY).toBe('atlas-unit-system');
    expect(CURRENCY_STORAGE_KEY).toBe('atlas-currency');
    expect(parseUnitSystem('imperial')).toBe('imperial');
    expect(parseUnitSystem('invalid')).toBe('metric');
    expect(parseCurrencyLabel('EUR')).toBe('EUR');
    expect(parseCurrencyLabel('usd')).toBe('USD');
  });
});
