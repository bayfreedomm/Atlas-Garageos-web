import { describe, expect, it } from 'vitest';
import { pcdFromAdjacentHoleSpacingMm } from '../../src/data/bolt-pattern-geometry';
import { buildPcd3DModel, buildTireComparison3DModel, buildWheelOffset3DModel } from '../../src/lib/visualization/parametric-3d-model';

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
});
