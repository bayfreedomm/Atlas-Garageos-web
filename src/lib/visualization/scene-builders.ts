import { annulusCylinder, circleLine, cylinder, ellipticalTorus, plane, type Line3D, type Mesh3D, type Scene3D, type Vec3 } from './canvas-3d';
import type { Pcd3DModel, TireComparison3DModel, Tire3DGeometry, WheelOffset3DModel } from './parametric-3d-model';

export interface VisualizationPalette {
  readonly current: string;
  readonly proposed: string;
  readonly metal: string;
  readonly hub: string;
  readonly guide: string;
  readonly accent: string;
  readonly warning: string;
}

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

function tireAssembly(geometry: Tire3DGeometry, color: string, center: Vec3, scale: number, alpha = 1): readonly Mesh3D[] {
  const outerRadius = (geometry.overallDiameterMm / 2) * scale;
  const innerRadius = (geometry.rimDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const rimOuter = innerRadius * .96;
  const rimInner = innerRadius * .43;
  return [
    ellipticalTorus(outerRadius, innerRadius, width, color, center, alpha),
    annulusCylinder(rimOuter, rimInner, width * .56, '#899aa7', center, Math.min(1, alpha + .08)),
    cylinder(rimInner * .38, width * .38, '#566874', center, Math.min(1, alpha + .1)),
  ];
}

export function tireComparisonScene(model: TireComparison3DModel, palette: VisualizationPalette, view: 'side-by-side' | 'overlay'): Scene3D {
  const maxRadiusMm = Math.max(model.current.overallDiameterMm, model.proposed.overallDiameterMm) / 2;
  const scale = 1 / Math.max(1, maxRadiusMm);
  const meshes: Mesh3D[] = [];
  const lines: Line3D[] = [];

  if (view === 'overlay') {
    meshes.push(...tireAssembly(model.current, palette.current, v(0, 0, -.09), scale, .72));
    meshes.push(...tireAssembly(model.proposed, palette.proposed, v(0, 0, .09), scale, .60));
    lines.push(circleLine((model.current.overallDiameterMm / 2) * scale, palette.current, .38, 72));
    lines.push(circleLine((model.proposed.overallDiameterMm / 2) * scale, palette.proposed, .42, 72));
    return { meshes, lines, fitRadius: 1.22 };
  }

  const spacing = 1.18;
  meshes.push(...tireAssembly(model.current, palette.current, v(-spacing, 0, 0), scale));
  meshes.push(...tireAssembly(model.proposed, palette.proposed, v(spacing, 0, 0), scale));
  lines.push({ points: [v(-2.25, -1.1, -.5), v(2.25, -1.1, -.5)], color: palette.guide, width: 1, alpha: .72 });
  return { meshes, lines, fitRadius: 2.3 };
}

export function wheelOffsetScene(model: WheelOffset3DModel, palette: VisualizationPalette): Scene3D {
  // One consistent world scale for millimetres means width and ET position changes stay proportional.
  const mmScale = 1 / 112;
  const radius = 1.02;
  const innerRadius = .58;
  const currentDepth = model.originalWidthMm * mmScale;
  const newDepth = model.newWidthMm * mmScale;
  const currentZ = model.originalCenterFromHubMm * mmScale;
  const newZ = model.newCenterFromHubMm * mmScale;

  const meshes: Mesh3D[] = [
    plane(2.55, 2.55, palette.hub, 0, .13),
    annulusCylinder(radius, innerRadius, currentDepth, palette.current, v(0, 0, currentZ), .38),
    annulusCylinder(radius * 1.01, innerRadius * .98, newDepth, palette.proposed, v(0, 0, newZ), .52),
    cylinder(.22, .22, palette.metal, v(0, 0, .1), .96),
  ];

  const lines: Line3D[] = [
    circleLine(radius * 1.04, palette.guide, 0.015, 72),
    { points: [v(-1.48, 0, 0), v(1.48, 0, 0)], color: palette.guide, width: 1.2, alpha: .86 },
    { points: [v(0, -1.48, 0), v(0, 1.48, 0)], color: palette.guide, width: 1.2, alpha: .86 },
    // Wheel centerline markers show how ET moves the center relative to the fixed hub face.
    { points: [v(-1.22, 0, currentZ), v(1.22, 0, currentZ)], color: palette.current, width: 2, alpha: .9 },
    { points: [v(0, -1.22, newZ), v(0, 1.22, newZ)], color: palette.proposed, width: 2, alpha: .9 },
  ];
  return { meshes, lines, fitRadius: 1.55 };
}

export function pcdScene(model: Pcd3DModel, palette: VisualizationPalette): Scene3D {
  const scale = 1 / Math.max(72, model.pcdRadiusMm + 22);
  const pcdRadius = model.pcdRadiusMm * scale;
  const hubOuter = Math.min(1.16, pcdRadius + .28);
  const boreRadius = model.centerBoreMm ? Math.max(.16, (model.centerBoreMm / 2) * scale) : Math.max(.2, pcdRadius * .34);
  const lugRadius = Math.max(.065, Math.min(.095, .23 / Math.sqrt(model.lugCount)));
  const meshes: Mesh3D[] = [
    annulusCylinder(hubOuter, boreRadius, .18, palette.hub, v(0, 0, 0), .94),
    annulusCylinder(boreRadius * 1.02, boreRadius * .84, .25, palette.metal, v(0, 0, .02), .95),
  ];

  for (const point of model.lugPositionsMm) {
    meshes.push(cylinder(lugRadius, .30, palette.current, v(point.x * scale, point.y * scale, .08), .98));
  }

  const first = model.lugPositionsMm[0]!;
  const second = model.lugPositionsMm[1] ?? first;
  const lines: Line3D[] = [
    circleLine(pcdRadius, palette.accent, .18, 72),
    circleLine(boreRadius, palette.guide, .19, 48),
    { points: [v(first.x * scale, first.y * scale, .24), v(second.x * scale, second.y * scale, .24)], color: palette.warning, width: 2.4, alpha: 1 },
    { points: [v(-pcdRadius, 0, .21), v(pcdRadius, 0, .21)], color: palette.guide, width: 1.25, alpha: .86 },
  ];
  return { meshes, lines, fitRadius: 1.22 };
}
