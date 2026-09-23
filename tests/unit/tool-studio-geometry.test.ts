import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createToolStudioProduct } from '../../src/lib/visualization/three-tool-geometry';

const nativeIds = [
  'psi-bar-converter', 'fuel-cost-calculator', 'road-trip-cost-calculator',
  'mpg-l100km-converter', 'hp-kw-converter', 'nm-lb-ft-converter',
  'power-to-weight-calculator', 'towing-capacity-calculator',
  'quarter-mile-calculator', 'vehicle-fitment-finder',
  'compression-ratio-calculator', 'ev-charging-calculator',
] as const;

const spec = (id: string, primary = .38) => ({
  kind: 'tool-studio' as const, id, current: '#2e9dff', proposed: '#ff8a22',
  accent: '#7ed6ff', metal: '#8fa2b1', hub: '#415563', primary,
  secondary: .67, count: id === 'vehicle-fitment-finder' ? 4 : 86,
});

describe('native tool studio geometry', () => {
  it('builds detailed, finite WebGL geometry for each dedicated product', () => {
    for (const id of nativeIds) {
      const group = createToolStudioProduct(spec(id));
      let meshCount = 0;
      group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        meshCount += 1;
        const position = object.geometry.getAttribute('position');
        expect(position.count).toBeGreaterThan(0);
        for (let i = 0; i < position.count; i += Math.max(1, Math.floor(position.count / 16))) {
          expect(Number.isFinite(position.getX(i) + position.getY(i) + position.getZ(i))).toBe(true);
        }
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
      });
      expect(meshCount, id).toBeGreaterThan(20);
    }
  });

  it('changes the visible needle position when pressure changes', () => {
    const location = (primary: number) => {
      const group = createToolStudioProduct(spec('psi-bar-converter', primary));
      const positions: string[] = [];
      group.traverse((object) => { if (object instanceof THREE.Mesh) positions.push(object.position.toArray().join(',')); });
      return positions.join('|');
    };
    expect(location(.2)).not.toBe(location(.8));
  });
});
