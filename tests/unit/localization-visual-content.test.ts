import { describe, expect, it } from 'vitest';
import tireVisual from '../../src/components/TireComparisonVisual.astro?raw';
import offsetVisual from '../../src/components/WheelOffsetTechnicalVisual.astro?raw';
import toolPage from '../../src/components/ToolPage.astro?raw';
import parametricPanel from '../../src/components/Parametric3DPanel.astro?raw';
import fitmentStudio from '../../src/pages/fitment-studio/index.astro?raw';
import methodology from '../../src/pages/methodology/index.astro?raw';
import { LOCALE_CODES, localeDefinitions, localizedToolPath } from '../../src/localization/locales';
import { toolInsights } from '../../src/content/tool-insights';
import { toolRegistry } from '../../src/seo/tool-registry';
import { localizedTool } from '../../src/localization/site-catalog';

describe('V3 visual and localization foundation', () => {
  it('keeps first-wave locale routing explicit, publishing only QA-passed translations', () => {
    expect(LOCALE_CODES).toEqual(['en', 'de', 'es', 'pt-br', 'fr', 'it', 'pl', 'nl', 'tr']);
    // Every locale now has the full site translated: home, calculators, fitment studio and policies.
    for (const code of LOCALE_CODES) expect(localeDefinitions[code].published).toBe(true);
    expect(localizedToolPath('en', 'wheel-offset-calculator', 'tool')).toBe('/tools/wheel-offset-calculator/');
    expect(localizedToolPath('de', 'wheel-offset-calculator', 'tool')).toBe('/de/tools/felgen-et-rechner/');
    expect(localizedToolPath('es', 'wheel-offset-calculator', 'tool')).toBe('/es/tools/calculadora-offset-llantas/');
    expect(localizedToolPath('pt-br', 'fuel-cost-calculator', 'tool')).toBe('/pt-br/tools/calculadora-gasto-combustivel/');
    expect(localizedToolPath('tr', 'tire-size-calculator', 'tool')).toBe('/tr/tools/lastik-ebadi-hesaplama/');
  });

  it('provides page-specific insight content for every registered tool', () => {
    expect(Object.keys(toolInsights)).toHaveLength(toolRegistry.length);
    for (const tool of toolRegistry) expect(toolInsights[tool.id].facts).toHaveLength(3);
    // ToolPage now forwards the active content locale to ToolInsights so DE/ES pages
    // render translated facts/warnings instead of always falling back to English.
    expect(toolPage).toContain('<ToolInsights id={definition.id} locale={locale} />');
  });

  it('uses true-scale and magnified-difference tire visualization together', () => {
    expect(tireVisual).toContain('TRUE SCALE');
    expect(tireVisual).toContain('SMALL CHANGES MAGNIFIED');
    expect(tireVisual).toContain('data-fitment-section');
    expect(tireVisual).toContain('renderFitmentSection');
  });

  it('uses a fixed hub plane for the live wheel-offset cutaway', () => {
    expect(offsetVisual).toContain('HUB MOUNTING FACE');
    expect(offsetVisual).toContain('data-fitment-section');
    expect(offsetVisual).toContain("mode: 'wheel'");
  });

  it('publishes a methodology page that distinguishes calculation from real-world verdicts', () => {
    expect(methodology).toContain('Accuracy &amp; methodology');
    expect(methodology).toContain('static wheel geometry only');
    expect(methodology).toContain('idealized constant-power estimate');
  });

  it('describes the PCD calculator input as adjacent center-to-center spacing in every locale', () => {
    const english = toolInsights['bolt-pattern-calculator'];
    expect(english.faqs?.[0]?.answer).toContain('center-to-center');
    expect(english.facts[2]?.body).toContain('neighboring holes');
    const german = localizedTool('bolt-pattern-calculator', 'de');
    const spanish = localizedTool('bolt-pattern-calculator', 'es');
    expect(german.faqs?.[0]?.answer).toContain('Mittelpunktabstand');
    expect(spanish.faqs?.[0]?.answer).toContain('distancia entre centros');
  });

  it('keeps a persistent in-scene measurement HUD and a switchable flagship 3D workspace', () => {
    expect(parametricPanel).toContain('parametric-3d__hud');
    expect(parametricPanel).toContain('data-p3d-fitment-view');
    expect(fitmentStudio).toContain('<Parametric3DPanel mode="fitment" locale="en" />');
  });
});
