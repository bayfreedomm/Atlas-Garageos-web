import { describe, expect, it } from 'vitest';
import tireVisual from '../../src/components/TireComparisonVisual.astro?raw';
import offsetVisual from '../../src/components/WheelOffsetTechnicalVisual.astro?raw';
import toolPage from '../../src/components/ToolPage.astro?raw';
import methodology from '../../src/pages/en/methodology/index.astro?raw';
import { LOCALE_CODES, localeDefinitions, localizedToolPath } from '../../src/localization/locales';
import { toolInsights } from '../../src/content/tool-insights';
import { toolRegistry } from '../../src/seo/tool-registry';

describe('V3 visual and localization foundation', () => {
  it('keeps first-wave locale routing explicit without publishing unfinished translations', () => {
    expect(LOCALE_CODES).toEqual(['en', 'de', 'es', 'pt-br', 'fr']);
    expect(localeDefinitions.en.published).toBe(true);
    expect(localeDefinitions.de.published).toBe(false);
    expect(localizedToolPath('de', 'wheel-offset-calculator', 'tool')).toBe('/de/tools/felgen-et-rechner/');
    expect(localizedToolPath('pt-br', 'fuel-cost-calculator', 'tool')).toBe('/pt-br/tools/calculadora-gasto-combustivel/');
  });

  it('provides page-specific insight content for every registered tool', () => {
    expect(Object.keys(toolInsights)).toHaveLength(toolRegistry.length);
    for (const tool of toolRegistry) expect(toolInsights[tool.id].facts).toHaveLength(3);
    expect(toolPage).toContain('<ToolInsights id={definition.id} />');
  });

  it('uses true-scale and magnified-difference tire visualization together', () => {
    expect(tireVisual).toContain('TRUE SCALE');
    expect(tireVisual).toContain('SMALL CHANGES MAGNIFIED');
    expect(tireVisual).toContain('data-current-front-body');
    expect(tireVisual).toContain('data-new-side-tire');
  });

  it('uses a fixed hub plane for the live wheel-offset cutaway', () => {
    expect(offsetVisual).toContain('HUB MOUNTING FACE');
    expect(offsetVisual).toContain('data-current-offset-body');
    expect(offsetVisual).toContain('data-new-offset-body');
  });

  it('publishes a methodology page that distinguishes calculation from real-world verdicts', () => {
    expect(methodology).toContain('Accuracy &amp; methodology');
    expect(methodology).toContain('static wheel geometry only');
    expect(methodology).toContain('idealized constant-power estimate');
  });
});
