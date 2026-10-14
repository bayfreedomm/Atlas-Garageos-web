import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { additional3DToolIds } from '../../src/localization/tool-3d-catalog';
import { visualization3DText } from '../../src/localization/visualization-3d';
import { tool3DText } from '../../src/localization/tool-3d-catalog';
import { sceneForTool } from '../../src/lib/visualization/tool-3d-scenes';
import { compressionChamberScene, evBatteryScene } from '../../src/lib/visualization/scene-builders';
import { toolRegistry } from '../../src/seo/tool-registry';
import toolPage from '../../src/components/ToolPage.astro?raw';
import engineering2D from '../../src/components/ToolEngineering2D.astro?raw';
import toolVisualStudio from '../../src/components/ToolVisualStudio.astro?raw';
import gearRatioTechnicalVisual from '../../src/components/GearRatioTechnicalVisual.astro?raw';
import tool3DController from '../../src/ui/tool-3d.ts?raw';
import toolDrawings from '../../src/ui/tool-drawings.ts?raw';
import toolDrawingDriver from '../../src/ui/tool-drawing-driver.ts?raw';
const productV4Css = readFileSync(new URL('../../src/styles/product-v4.css', import.meta.url), 'utf8');

const palette = { current: '#2e9dff', proposed: '#ff8a22', metal: '#8fa2b1', hub: '#415563', guide: '#8295a4', accent: '#7ed6ff', warning: '#ffc35b' };
const existing3D = new Set([
  'tire-size-calculator', 'tire-size-comparison', 'wheel-offset-calculator',
  'speedometer-error-calculator', 'gear-ratio-calculator', 'ev-charging-cost-calculator',
  'bolt-pattern-calculator', 'compression-ratio-calculator',
  // The tire-size fit check embeds the same parametric tire-comparison 3D panel (mode="tire").
  'tire-fit-check',
]);

describe('truthful visual coverage', () => {
  it('keeps 3D for spatial/mechanical tools while retaining a related visual for every tool page', () => {
    expect(existing3D).toEqual(new Set([
      'tire-size-calculator', 'tire-size-comparison', 'wheel-offset-calculator',
      'speedometer-error-calculator', 'gear-ratio-calculator', 'ev-charging-cost-calculator',
      'bolt-pattern-calculator', 'compression-ratio-calculator', 'tire-fit-check',
    ]));
    const publishedToolIds = new Set(toolRegistry.filter(({ kind }) => kind === 'tool').map(({ id }) => id));
    expect(new Set([...existing3D, ...additional3DToolIds])).toEqual(publishedToolIds);
    expect(toolPage).toContain('ToolVisualStudio');
    expect(toolPage).toContain('Every tool keeps a relevant visual explanation');
    expect(toolPage).toContain('hasToolVisualStudio');
    expect(visualization3DText.en.fitmentTitle).toBeTruthy();
  });

  it('builds nonempty, finite geometry and localized copy for each new scene', () => {
    for (const id of additional3DToolIds) {
      for (const locale of ['en', 'de', 'es'] as const) {
        expect(tool3DText(locale, id).title.length).toBeGreaterThan(4);
        const result = sceneForTool(id, {}, palette, locale);
        expect(result.scene.meshes.length).toBeGreaterThan(0);
        for (const mesh of result.scene.meshes) {
          expect(mesh.vertices.length).toBeGreaterThan(0);
          for (const vertex of mesh.vertices) expect([vertex.x, vertex.y, vertex.z].every(Number.isFinite)).toBe(true);
        }
      }
    }
  });

  it('moves a pressure needle, fuel volume and towing geometry when inputs change', () => {
    const pressure = (value: string) => sceneForTool('psi-bar-converter', { value, unit: 'psi' }, palette).scene.lines?.[0]?.points[1]?.x;
    expect(pressure('20')).not.toBe(pressure('80'));
    const fuel = (distance: string) => sceneForTool('fuel-cost-calculator', { distance, economy: '7', price: '1.9', system: 'metric' }, palette).readout;
    expect(fuel('100')).not.toBe(fuel('600'));
    const towing = (gcwr: string) => {
      const vertices = sceneForTool('towing-capacity-calculator', { gcwr, curbWeight: '5000', loadWeight: '500' }, palette).scene.meshes[4]?.vertices ?? [];
      return Math.max(...vertices.map((point) => point.x)) - Math.min(...vertices.map((point) => point.x));
    };
    expect(towing('15000')).not.toBe(towing('25000'));
  });

  it('shows only documented lug counts in vehicle lookup geometry', () => {
    const noSelection = sceneForTool('vehicle-fitment-finder', {}, palette).scene.meshes.length;
    const fourLugs = sceneForTool('vehicle-fitment-finder', { model: 'peugeot-208' }, palette).scene.meshes.length;
    const fiveLugs = sceneForTool('vehicle-fitment-finder', { model: 'vw-golf' }, palette).scene.meshes.length;
    expect(fourLugs - noSelection).toBe(4);
    expect(fiveLugs - noSelection).toBe(5);
    expect(sceneForTool('vehicle-fitment-finder', {}, palette).detail).toContain('No bolt pattern');
  });

  it('uses dedicated native WebGL products while retaining Canvas fallback geometry', () => {
    const tireProducts = new Set(['fitment-map', 'measure-my-car', 'tire-load-speed-rating', 'tire-date-code-decoder']);
    for (const id of additional3DToolIds) {
      const scene = sceneForTool(id, {}, palette).scene;
      expect(scene.meshes.length).toBeGreaterThan(0);
      if (tireProducts.has(id)) {
        expect(scene.products?.[0]?.kind).toBe('tire-wheel');
        expect(scene.studio).toBeUndefined();
      } else {
        expect(scene.studio?.id).toBe(id);
        expect(scene.studio?.primary).toBeGreaterThanOrEqual(0);
        expect(scene.studio?.primary).toBeLessThanOrEqual(1);
      }
    }
    expect(sceneForTool('psi-bar-converter', { value: '20', unit: 'psi' }, palette).scene.studio?.primary)
      .not.toBe(sceneForTool('psi-bar-converter', { value: '80', unit: 'psi' }, palette).scene.studio?.primary);
    expect(sceneForTool('vehicle-fitment-finder', { model: 'peugeot-208' }, palette).scene.studio?.count).toBe(4);
  });

  it('binds the shared 2D drawing to current form state through authoritative calculators', () => {
    expect(engineering2D).toContain('ToolDrawingFrame');
    expect(toolVisualStudio).toContain('bindToolDrawing(plate, form)');
    for (const fn of ['convertPressureTool', 'convertFuelEconomyTool', 'convertPowerTool', 'convertTorqueTool', 'calculatePowerToWeightTool', 'calculateFuelCostTool', 'calculateRoadTripCostTool', 'pcdFromAdjacentHoleSpacingMm']) {
      expect(toolDrawings, fn).toContain(fn);
    }
    for (const name of ['input', 'change', 'submit']) expect(toolDrawingDriver).toContain(`'${name}'`);
  });

  it('connects sibling 3D studios to the owning calculator form and refreshes after edits', () => {
    expect(tool3DController).toContain("panel.closest<HTMLElement>('[data-tool-visual-studio]')");
    expect(tool3DController).toContain("previous.matches('.tool-machine')");
    expect(tool3DController).toContain('previous.dataset.toolId === id');
    expect(tool3DController).toContain("for (const name of ['input', 'change', 'submit'])");
    expect(tool3DController).toContain('new FormData(form)');
  });

  it('produces a different 3D state for two valid form values on every live additional-tool scene', () => {
    const cases = [
      ['fuel-cost-calculator', { distance: '200', economy: '7', price: '2', system: 'metric' }, { distance: '300', economy: '7', price: '2', system: 'metric' }],
      ['road-trip-cost-calculator', { distance: '200', tripType: 'one-way' }, { distance: '300', tripType: 'round' }],
      ['mpg-l100km-converter', { value: '20', unit: 'US mpg' }, { value: '40', unit: 'US mpg' }],
      ['psi-bar-converter', { value: '20', unit: 'psi' }, { value: '40', unit: 'psi' }],
      ['hp-kw-converter', { value: '200', unit: 'hp' }, { value: '300', unit: 'hp' }],
      ['nm-lb-ft-converter', { value: '200', unit: 'Nm' }, { value: '300', unit: 'Nm' }],
      ['power-to-weight-calculator', { power: '200', weight: '1400' }, { power: '300', weight: '1400' }],
      ['tire-load-speed-rating', { loadIndex: '91', speedRating: 'V' }, { loadIndex: '95', speedRating: 'W' }],
      ['tire-date-code-decoder', { code: '2219' }, { code: '3024' }],
      ['towing-capacity-calculator', { gcwr: '15000', curbWeight: '5000', loadWeight: '500' }, { gcwr: '20000', curbWeight: '5000', loadWeight: '500' }],
      ['quarter-mile-calculator', { weight: '3400', power: '200' }, { weight: '3400', power: '300' }],
      ['vehicle-fitment-finder', { model: 'peugeot-208' }, { model: 'vw-golf' }],
    ] as const;
    const signature = (id: typeof cases[number][0], values: Readonly<Record<string, string>>) => {
      const result = sceneForTool(id, values, palette);
      return JSON.stringify({ readout: result.readout, studio: result.scene.studio, annotations: result.scene.annotations?.map(({ label }) => label) });
    };
    for (const [id, first, second] of cases) expect(signature(id, first)).not.toBe(signature(id, second));
  });

  it('keeps shared engineering drawings legible on phones without overflowing the document', () => {
    expect(productV4Css).toContain('.tool-engineering-plate__drawing{display:block;overflow-x:auto');
    expect(productV4Css).toContain('.tool-engineering-plate__drawing svg{width:30rem;max-width:none');
    expect(toolVisualStudio).toContain('centerMobileDrawing');
    expect(toolVisualStudio).toContain('(drawing.scrollWidth - drawing.clientWidth) / 2');
  });

  it('keeps the gearing visual tied to authoritative live values', () => {
    for (const hook of ['data-gear-current-wheel', 'data-gear-new-wheel', 'data-gear-current-ratio', 'data-gear-effective-visual']) {
      expect(gearRatioTechnicalVisual).toContain(hook);
    }
  });

  it('drives the native engine and battery sections from validated calculator inputs', () => {
    const compression = compressionChamberScene(86, 86, 52, palette);
    const changedBore = compressionChamberScene(100, 86, 52, palette);
    expect(compression.studio?.count).toBe(86);
    expect(changedBore.studio?.count).toBe(100);
    expect(compression.studio?.primary).not.toBe(changedBore.studio?.primary);
    const battery = evBatteryScene(20, 80, palette);
    expect(battery.studio?.primary).toBe(.2);
    expect(battery.studio?.secondary).toBe(.8);
    expect(battery.meshes.length).toBeGreaterThan(1);
  });
});
