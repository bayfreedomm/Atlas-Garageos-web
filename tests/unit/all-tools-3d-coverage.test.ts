import { describe, expect, it } from 'vitest';
import { additional3DToolIds } from '../../src/localization/tool-3d-catalog';
import { visualization3DText } from '../../src/localization/visualization-3d';
import { tool3DText } from '../../src/localization/tool-3d-catalog';
import { sceneForTool } from '../../src/lib/visualization/tool-3d-scenes';
import { toolRegistry } from '../../src/seo/tool-registry';

const palette = { current: '#2e9dff', proposed: '#ff8a22', metal: '#8fa2b1', hub: '#415563', guide: '#8295a4', accent: '#7ed6ff', warning: '#ffc35b' };
const existing3D = new Set([
  'tire-size-calculator', 'tire-size-comparison', 'wheel-offset-calculator',
  'speedometer-error-calculator', 'gear-ratio-calculator', 'ev-charging-cost-calculator',
  'bolt-pattern-calculator', 'compression-ratio-calculator',
]);

describe('3D coverage for the complete tool directory', () => {
  it('assigns every published tool route exactly one 3D experience', () => {
    const tools = toolRegistry.filter((tool) => tool.kind === 'tool');
    expect(tools).toHaveLength(22);
    for (const tool of tools) {
      expect(Number(existing3D.has(tool.id)) + Number((additional3DToolIds as readonly string[]).includes(tool.id))).toBe(1);
    }
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
});
