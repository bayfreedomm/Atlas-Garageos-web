import { describe, expect, it } from 'vitest';
import { pcdFromAdjacentHoleSpacingMm } from '../../src/data/bolt-pattern-geometry';
import { buildPcd3DModel, buildTireComparison3DModel, buildWheelOffset3DModel } from '../../src/lib/visualization/parametric-3d-model';
import { compressionChamberScene, evBatteryScene, gearDiameterScene, pcdScene, singleTireScene, tireComparisonScene, wheelOffsetScene, type VisualizationPalette } from '../../src/lib/visualization/scene-builders';
import { createPcdProduct } from '../../src/lib/visualization/three-engineering-geometry';
import * as THREE from 'three';

const palette: VisualizationPalette = { current: '#249eff', proposed: '#ff8b38', metal: '#aaa', hub: '#777', guide: '#789', accent: '#5cf', warning: '#fc8' };

function closeTo(value: number, expected: number, tolerance = 0.02): void {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

describe('Package 5 parametric 3D models', () => {
  it('maps tire inputs through the canonical tire comparison math', () => {
    const model = buildTireComparison3DModel(
      { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 },
      { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 },
    );
    expect(model).not.toBeNull();
    closeTo(model!.current.sidewallMm, 101.25);
    closeTo(model!.current.overallDiameterMm, 659.7);
    closeTo(model!.proposed.sidewallMm, 94);
    closeTo(model!.proposed.overallDiameterMm, 670.6);
    closeTo(model!.diameterDifferenceMm, 10.9);
    closeTo(model!.circumferenceDifferenceMm, Math.PI * 10.9, 0.05);
  });

  it('maps wheel width and ET through the canonical wheel-position comparison', () => {
    const model = buildWheelOffset3DModel({ originalWidthInches: 8, originalOffsetMm: 40, newWidthInches: 8.5, newOffsetMm: 35 });
    expect(model).not.toBeNull();
    closeTo(model!.originalWidthMm, 203.2);
    closeTo(model!.newWidthMm, 215.9);
    closeTo(model!.innerPositionChangeMm, 1.35);
    closeTo(model!.outerPokeChangeMm, 11.35);
    expect(model!.originalCenterFromHubMm).toBe(-40);
    expect(model!.newCenterFromHubMm).toBe(-35);
  });

  it('builds PCD positions from one canonical lug-circle geometry source', () => {
    const model = buildPcd3DModel(5, 114.3, 66.1);
    expect(model).not.toBeNull();
    expect(model!.lugPositionsMm).toHaveLength(5);
    closeTo(model!.adjacentSpacingMm, 67.18, 0.02);
    for (const point of model!.lugPositionsMm) closeTo(Math.hypot(point.x, point.y), 57.15, 0.001);
    expect(model!.lugPositionsMm[0]!.x).toBeCloseTo(0, 8);
    expect(model!.lugPositionsMm[0]!.y).toBeCloseTo(-57.15, 8);
  });

  it('keeps the adjacent-spacing inverse consistent with the PCD formula', () => {
    const spacing = 114.3 * Math.sin(Math.PI / 5);
    closeTo(pcdFromAdjacentHoleSpacingMm(spacing, 5), 114.3, 0.0001);
  });

  it('declines invalid visualization inputs instead of drawing fabricated geometry', () => {
    expect(buildTireComparison3DModel(
      { widthMm: 0, aspectRatio: 45, rimDiameterInches: 18 },
      { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 },
    )).toBeNull();
    expect(buildWheelOffset3DModel({ originalWidthInches: 0, originalOffsetMm: 40, newWidthInches: 8.5, newOffsetMm: 35 })).toBeNull();
    expect(buildPcd3DModel(2, 114.3)).toBeNull();
    expect(buildPcd3DModel(5, -1)).toBeNull();
  });

  it('passes canonical tire dimensions to the native product geometry layer', () => {
    const model = buildTireComparison3DModel(
      { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 },
      { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 },
    )!;
    const scene = tireComparisonScene(model, palette, 'side-by-side');
    expect(scene.products).toHaveLength(2);
    expect(scene.products?.map((product) => product.role)).toEqual(['current', 'proposed']);
    closeTo(scene.products?.[0]?.outerRadius ?? 0, model.current.overallDiameterMm / Math.max(model.current.overallDiameterMm, model.proposed.overallDiameterMm));
    closeTo(scene.products?.[1]?.width ?? 0, model.proposed.widthMm * (2 / model.proposed.overallDiameterMm));
  });

  it('keeps overlay comparison as two neutral products with technical opacity separation', () => {
    const model = buildTireComparison3DModel(
      { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 },
      { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 },
    )!;
    const scene = tireComparisonScene(model, palette, 'overlay');
    expect(scene.products).toHaveLength(2);
    expect(scene.products?.[0]?.alpha).toBeLessThan(scene.products?.[1]?.alpha ?? 0);
    expect(scene.products?.[0]?.center.z).not.toBe(scene.products?.[1]?.center.z);
  });

  it('holds the offset mounting plane at zero while native wheel widths and centers follow canonical ET', () => {
    const model = buildWheelOffset3DModel({ originalWidthInches: 8, originalOffsetMm: 40, newWidthInches: 8.5, newOffsetMm: 35 })!;
    const product = wheelOffsetScene(model, palette).products?.[0];
    expect(product?.kind).toBe('wheel-offset');
    if (product?.kind !== 'wheel-offset') return;
    closeTo(product.currentWidth, 203.2 / 180);
    closeTo(product.proposedWidth, 215.9 / 180);
    closeTo(product.currentCenterZ, -40 / 180);
    closeTo(product.proposedCenterZ, -35 / 180);
    closeTo(product.proposedCenterZ - product.currentCenterZ, 5 / 180);
  });

  it('cuts a center bore and one through-hole per canonical PCD lug position', () => {
    const model = buildPcd3DModel(5, 114.3, 66.1)!;
    const product = pcdScene(model, palette).products?.[0];
    expect(product?.kind).toBe('pcd-plate');
    if (product?.kind !== 'pcd-plate') return;
    const assembly = createPcdProduct(product);
    const plate = assembly.children[0];
    expect(plate).toBeInstanceOf(THREE.Mesh);
    const geometry = (plate as THREE.Mesh).geometry as THREE.ExtrudeGeometry;
    const shape = geometry.parameters.shapes;
    expect(shape).toBeInstanceOf(THREE.Shape);
    expect((shape as THREE.Shape).holes).toHaveLength(model.lugCount + 1);
    for (let index = 0; index < model.lugCount; index += 1) {
      const hole = (shape as THREE.Shape).holes[index + 1]!;
      const center = new THREE.Box2().setFromPoints(hole.getPoints(24)).getCenter(new THREE.Vector2());
      closeTo(center.x, product.lugPositions[index]!.x, 0.02);
      closeTo(center.y, product.lugPositions[index]!.y, 0.02);
    }
  });

  it('builds Canvas geometry only when fallback is needed', () => {
    const tire = buildTireComparison3DModel(
      { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 },
      { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 },
    )!;
    const offset = buildWheelOffset3DModel({ originalWidthInches: 8, originalOffsetMm: 40, newWidthInches: 8.5, newOffsetMm: 35 })!;
    const pcd = buildPcd3DModel(5, 114.3)!;
    for (const [native, fallback] of [
      [tireComparisonScene(tire, palette, 'side-by-side', false), tireComparisonScene(tire, palette, 'side-by-side', true)],
      [wheelOffsetScene(offset, palette, false), wheelOffsetScene(offset, palette, true)],
      [pcdScene(pcd, palette, false), pcdScene(pcd, palette, true)],
    ] as const) {
      expect(native.meshes).toHaveLength(0);
      expect(native.products?.length).toBeGreaterThan(0);
      expect(fallback.meshes.length).toBeGreaterThan(0);
    }
  });

  it('localizes engineering callouts without changing their canonical endpoints', () => {
    const model = buildPcd3DModel(5, 114.3, 66.1)!;
    const en = pcdScene(model, palette, false, 'en');
    const de = pcdScene(model, palette, false, 'de');
    const es = pcdScene(model, palette, false, 'es');
    expect(en.annotations?.[1]?.label).toContain('spacing');
    expect(de.annotations?.[1]?.label).toContain('Abstand');
    expect(es.annotations?.[1]?.label).toContain('distancia');
    expect(de.annotations?.[1]?.start).toEqual(en.annotations?.[1]?.start);
    expect(es.annotations?.[1]?.end).toEqual(en.annotations?.[1]?.end);
  });

  it('builds the single-tire product from the validated tire geometry', () => {
    const model = buildTireComparison3DModel({ widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 }, { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 })!;
    const scene = singleTireScene(model, palette, false);
    expect(scene.products).toHaveLength(1);
    closeTo(scene.products![0]!.rimRadius, model.current.rimDiameterMm / model.current.overallDiameterMm);
    expect(scene.annotations?.[0]?.label).toContain('659.7');
  });

  it('keeps gear-view tire diameter proportions and a Canvas fallback', () => {
    const native = gearDiameterScene(31, 35, palette, false);
    const fallback = gearDiameterScene(31, 35, palette, true);
    expect(native.products).toHaveLength(2);
    closeTo(native.products![0]!.outerRadius / native.products![1]!.outerRadius, 31 / 35);
    expect(native.meshes).toHaveLength(0);
    expect(fallback.meshes.length).toBeGreaterThan(0);
  });

  it('maps bore/stroke and charge-window inputs into different physical scenes', () => {
    const compression = compressionChamberScene(86, 90, 52, palette);
    expect(compression.meshes.length).toBeGreaterThan(2);
    expect(compression.annotations?.[0]?.label).toContain('90.0 mm');
    const shortStroke = compressionChamberScene(86, 80, 52, palette);
    expect(compression.meshes[0]?.vertices).not.toEqual(shortStroke.meshes[0]?.vertices);
    const charging = evBatteryScene(20, 80, palette);
    const shorterWindow = evBatteryScene(20, 60, palette);
    expect(charging.meshes[3]?.vertices).not.toEqual(shorterWindow.meshes[3]?.vertices);
  });
});
