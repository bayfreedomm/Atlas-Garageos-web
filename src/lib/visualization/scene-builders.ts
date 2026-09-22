import { annulusCylinder, box, circleLine, cylinder, plane, revolveProfile, type Annotation3D, type Line3D, type Mesh3D, type Scene3D, type Shadow3D, type Vec3 } from './canvas-3d';
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

const RUBBER_MATERIAL = Object.freeze({ ambient: 0.28, diffuse: 0.78, specular: 0.07, shininess: 8, metallic: 0, rim: 0.18 });
const TREAD_MATERIAL = Object.freeze({ ambient: 0.26, diffuse: 0.74, specular: 0.06, shininess: 7, metallic: 0, rim: 0.12 });
const METAL_MATERIAL = Object.freeze({ ambient: 0.42, diffuse: 0.66, specular: 0.34, shininess: 28, metallic: 0.82, rim: 0.08 });
const HUB_MATERIAL = Object.freeze({ ambient: 0.34, diffuse: 0.68, specular: 0.24, shininess: 20, metallic: 0.46, rim: 0.1 });
const GUIDE_MATERIAL = Object.freeze({ ambient: 0.28, diffuse: 0.45, specular: 0.08, shininess: 12, metallic: 0.12, rim: 0.04 });

function tireProfile(geometry: Tire3DGeometry, scale: number) {
  const outerRadius = (geometry.overallDiameterMm / 2) * scale;
  const rimRadius = (geometry.rimDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const shoulderRadius = outerRadius * 0.985;
  const sidewallRadius = outerRadius * 0.915;
  const beadRadius = Math.max(rimRadius * 1.035, outerRadius * 0.77);
  const innerWallRadius = Math.max(rimRadius * 0.965, beadRadius * 0.93);
  const treadHalf = width * 0.37;
  const sideHalf = width * 0.52;
  const beadHalf = width * 0.58;
  const innerHalf = width * 0.28;
  return [
    { radius: beadRadius, z: -beadHalf },
    { radius: sidewallRadius, z: -sideHalf },
    { radius: shoulderRadius, z: -treadHalf },
    { radius: outerRadius, z: -width * 0.14 },
    { radius: outerRadius, z: width * 0.14 },
    { radius: shoulderRadius, z: treadHalf },
    { radius: sidewallRadius, z: sideHalf },
    { radius: beadRadius, z: beadHalf },
    { radius: innerWallRadius, z: innerHalf },
    { radius: innerWallRadius, z: -innerHalf },
  ] as const;
}

function treadProfile(geometry: Tire3DGeometry, scale: number) {
  const outerRadius = (geometry.overallDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const treadOuter = outerRadius * 1.008;
  const treadInner = outerRadius * 0.965;
  const half = width * 0.31;
  return [
    { radius: treadInner, z: -half },
    { radius: treadOuter, z: -half * 0.92 },
    { radius: treadOuter, z: half * 0.92 },
    { radius: treadInner, z: half },
  ] as const;
}

function wheelAssembly(geometry: Tire3DGeometry, color: string, center: Vec3, scale: number, alpha = 1): readonly Mesh3D[] {
  const rimRadius = (geometry.rimDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const barrelOuter = rimRadius * 0.98;
  const barrelInner = rimRadius * 0.54;
  const faceOuter = rimRadius * 0.88;
  const faceInner = rimRadius * 0.22;
  const frontZ = center.z + width * 0.18;
  const spokeDepth = width * 0.1;
  const spokes: Mesh3D[] = [];
  for (let index = 0; index < 5; index += 1) {
    const angle = (Math.PI * 2 * index) / 5;
    const radialLength = faceOuter * 0.74;
    const spokeRadius = faceInner * 0.56 + radialLength * 0.38;
    spokes.push(
      box(
        faceOuter * 0.16,
        radialLength,
        spokeDepth,
        color,
        v(Math.cos(angle) * spokeRadius, Math.sin(angle) * spokeRadius, frontZ),
        alpha * 0.95,
        angle - Math.PI / 2,
        METAL_MATERIAL,
      ),
    );
  }
  return [
    annulusCylinder(barrelOuter, barrelInner, width * 0.58, color, center, alpha, METAL_MATERIAL),
    annulusCylinder(barrelOuter * 1.01, barrelOuter * 0.84, width * 0.05, color, v(center.x, center.y, center.z + width * 0.27), alpha, METAL_MATERIAL),
    annulusCylinder(barrelOuter * 1.01, barrelOuter * 0.84, width * 0.05, color, v(center.x, center.y, center.z - width * 0.27), alpha * 0.76, METAL_MATERIAL),
    annulusCylinder(faceOuter, faceInner, width * 0.12, color, v(center.x, center.y, frontZ), alpha, METAL_MATERIAL),
    ...spokes,
    cylinder(faceInner * 0.86, width * 0.16, '#d7e2ea', v(center.x, center.y, frontZ + width * 0.03), alpha, HUB_MATERIAL),
    cylinder(faceInner * 0.34, width * 0.22, '#a0b1be', v(center.x, center.y, frontZ + width * 0.08), alpha, HUB_MATERIAL),
  ];
}

function tireAssembly(geometry: Tire3DGeometry, color: string, center: Vec3, scale: number, alpha = 1): readonly Mesh3D[] {
  const meshes: Mesh3D[] = [
    revolveProfile(tireProfile(geometry, scale), color, center, alpha, 56, RUBBER_MATERIAL),
    revolveProfile(treadProfile(geometry, scale), '#242f38', center, Math.min(1, alpha * 0.96), 56, TREAD_MATERIAL),
  ];
  meshes.push(...wheelAssembly(geometry, '#a3b5c3', center, scale, Math.min(1, alpha * 0.98)));
  return meshes;
}

export function tireComparisonScene(model: TireComparison3DModel, palette: VisualizationPalette, view: 'side-by-side' | 'overlay'): Scene3D {
  const maxRadiusMm = Math.max(model.current.overallDiameterMm, model.proposed.overallDiameterMm) / 2;
  const scale = 1 / Math.max(1, maxRadiusMm);
  const meshes: Mesh3D[] = [];
  const lines: Line3D[] = [];
  const shadows: Shadow3D[] = [];
  const annotations: Annotation3D[] = [];

  if (view === 'overlay') {
    meshes.push(...tireAssembly(model.current, '#273640', v(0, 0, -0.12), scale, 0.7));
    meshes.push(...tireAssembly(model.proposed, '#364450', v(0, 0, 0.12), scale, 0.58));
    lines.push(circleLine((model.current.overallDiameterMm / 2) * scale, palette.current, 0.34, 72));
    lines.push(circleLine((model.proposed.overallDiameterMm / 2) * scale, palette.proposed, 0.4, 72));
    shadows.push({ center: v(0, -1.06, 0), radiusX: 1.02, radiusZ: 0.7, alpha: 0.22 });
    const currentRadius = (model.current.overallDiameterMm / 2) * scale;
    const proposedRadius = (model.proposed.overallDiameterMm / 2) * scale;
    annotations.push(
      { start: v(-1.12, -currentRadius, 0), end: v(-1.12, currentRadius, 0), color: palette.current, label: `${model.current.overallDiameterMm.toFixed(1)} mm`, labelOffsetX: -12, labelOffsetY: -14 },
      { start: v(1.12, -proposedRadius, 0), end: v(1.12, proposedRadius, 0), color: palette.proposed, label: `${model.proposed.overallDiameterMm.toFixed(1)} mm`, labelOffsetX: 12, labelOffsetY: -14 },
    );
    return { meshes, lines, shadows, annotations, fitRadius: 1.36 };
  }

  const spacing = 1.28;
  meshes.push(...tireAssembly(model.current, '#2b3943', v(-spacing, 0, 0), scale));
  meshes.push(...tireAssembly(model.proposed, '#33414b', v(spacing, 0, 0), scale));
  lines.push(
    { points: [v(-2.58, -1.12, -0.64), v(2.58, -1.12, -0.64)], color: palette.guide, width: 1, alpha: 0.62 },
    { points: [v(0, -1.1, -0.76), v(0, 1.02, -0.76)], color: palette.guide, width: 1, alpha: 0.18, dashed: true },
  );
  shadows.push(
    { center: v(-spacing, -1.1, 0), radiusX: 0.86, radiusZ: 0.6, alpha: 0.18 },
    { center: v(spacing, -1.1, 0), radiusX: 0.86, radiusZ: 0.6, alpha: 0.18 },
  );
  const currentRadius = (model.current.overallDiameterMm / 2) * scale;
  const proposedRadius = (model.proposed.overallDiameterMm / 2) * scale;
  annotations.push(
    { start: v(-spacing - 1.04, -currentRadius, 0), end: v(-spacing - 1.04, currentRadius, 0), color: palette.current, label: `${model.current.overallDiameterMm.toFixed(1)} mm`, labelOffsetX: -12 },
    { start: v(spacing + 1.04, -proposedRadius, 0), end: v(spacing + 1.04, proposedRadius, 0), color: palette.proposed, label: `${model.proposed.overallDiameterMm.toFixed(1)} mm`, labelOffsetX: 12 },
    { start: v(-0.38, currentRadius + 0.16, 0), end: v(0.38, proposedRadius + 0.16, 0), color: palette.accent, label: `${model.speedometerDifferencePercent > 0 ? '+' : ''}${model.speedometerDifferencePercent.toFixed(2)}% speedo`, labelOffsetY: -18 },
  );
  return { meshes, lines, shadows, annotations, fitRadius: 2.48 };
}

function offsetWheelMeshes(radius: number, width: number, centerZ: number, faceColor: string, alpha: number): readonly Mesh3D[] {
  const meshes: Mesh3D[] = [
    annulusCylinder(radius, radius * 0.52, width * 0.78, faceColor, v(0, 0, centerZ), alpha * 0.34, GUIDE_MATERIAL),
    annulusCylinder(radius * 1.02, radius * 0.85, width * 0.06, faceColor, v(0, 0, centerZ + width * 0.38), alpha, METAL_MATERIAL),
    annulusCylinder(radius * 0.9, radius * 0.18, width * 0.14, faceColor, v(0, 0, centerZ + width * 0.23), alpha, METAL_MATERIAL),
    cylinder(radius * 0.17, width * 0.18, '#d1dce5', v(0, 0, centerZ + width * 0.28), alpha, HUB_MATERIAL),
  ];
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6;
    const spokeCenter = radius * 0.36;
    meshes.push(box(radius * 0.12, radius * 0.54, width * 0.09, faceColor, v(Math.cos(angle) * spokeCenter, Math.sin(angle) * spokeCenter, centerZ + width * 0.22), alpha * 0.96, angle - Math.PI / 2, METAL_MATERIAL));
  }
  return meshes;
}

export function wheelOffsetScene(model: WheelOffset3DModel, palette: VisualizationPalette): Scene3D {
  const mmScale = 1 / 112;
  const radius = 1.08;
  const currentDepth = model.originalWidthMm * mmScale;
  const newDepth = model.newWidthMm * mmScale;
  const currentZ = model.originalCenterFromHubMm * mmScale;
  const newZ = model.newCenterFromHubMm * mmScale;

  const meshes: Mesh3D[] = [
    plane(2.75, 2.75, palette.hub, 0, 0.16, GUIDE_MATERIAL),
    annulusCylinder(0.24, 0.08, 0.18, palette.metal, v(0, 0, 0.08), 1, HUB_MATERIAL),
    ...offsetWheelMeshes(radius, currentDepth, currentZ, '#9acfff', 0.56),
    ...offsetWheelMeshes(radius * 1.01, newDepth, newZ, '#ffc186', 0.72),
  ];

  const lines: Line3D[] = [
    circleLine(radius * 1.04, palette.guide, 0.018, 72),
    { points: [v(-1.55, 0, 0), v(1.55, 0, 0)], color: palette.guide, width: 1.1, alpha: 0.72 },
    { points: [v(0, -1.55, 0), v(0, 1.55, 0)], color: palette.guide, width: 1.1, alpha: 0.72 },
    { points: [v(-1.25, 0, currentZ), v(1.25, 0, currentZ)], color: palette.current, width: 1.9, alpha: 0.94 },
    { points: [v(0, -1.25, newZ), v(0, 1.25, newZ)], color: palette.proposed, width: 1.9, alpha: 0.94 },
  ];
  const shadows: Shadow3D[] = [
    { center: v(0, -1.18, currentZ), radiusX: 1.05, radiusZ: 0.65, alpha: 0.14 },
    { center: v(0, -1.18, newZ), radiusX: 1.08, radiusZ: 0.68, alpha: 0.14 },
  ];
  const annotations: Annotation3D[] = [
    { start: v(-1.42, 0, currentZ), end: v(-1.42, 0, newZ), color: palette.current, label: `${model.innerPositionChangeMm > 0 ? '+' : ''}${model.innerPositionChangeMm.toFixed(1)} mm inner`, labelOffsetX: -12, labelOffsetY: -18 },
    { start: v(1.42, 0, currentZ), end: v(1.42, 0, newZ), color: palette.proposed, label: `${model.outerPokeChangeMm > 0 ? '+' : ''}${model.outerPokeChangeMm.toFixed(1)} mm outer`, labelOffsetX: 12, labelOffsetY: 18 },
  ];
  return { meshes, lines, shadows, annotations, fitRadius: 1.72 };
}

export function pcdScene(model: Pcd3DModel, palette: VisualizationPalette): Scene3D {
  const scale = 1 / Math.max(72, model.pcdRadiusMm + 26);
  const pcdRadius = model.pcdRadiusMm * scale;
  const hubOuter = Math.min(1.18, pcdRadius + 0.32);
  const plateOuter = Math.min(1.28, hubOuter + 0.14);
  const boreRadius = model.centerBoreMm ? Math.max(0.16, (model.centerBoreMm / 2) * scale) : Math.max(0.2, pcdRadius * 0.34);
  const holeRadius = Math.max(0.075, Math.min(0.11, 0.24 / Math.sqrt(model.lugCount)));
  const meshes: Mesh3D[] = [
    annulusCylinder(plateOuter, boreRadius * 0.82, 0.16, '#7f909c', v(0, 0, 0), 0.94, METAL_MATERIAL),
    annulusCylinder(hubOuter, boreRadius, 0.18, palette.hub, v(0, 0, 0.02), 0.96, HUB_MATERIAL),
    annulusCylinder(boreRadius * 1.02, boreRadius * 0.78, 0.22, '#c6d2da', v(0, 0, 0.05), 0.96, METAL_MATERIAL),
  ];

  for (const point of model.lugPositionsMm) {
    const x = point.x * scale;
    const y = point.y * scale;
    meshes.push(cylinder(holeRadius * 1.06, 0.2, '#c5d1d9', v(x, y, 0.08), 0.92, METAL_MATERIAL));
    meshes.push(cylinder(holeRadius * 0.72, 0.28, '#22313b', v(x, y, 0.1), 1, GUIDE_MATERIAL));
  }

  const first = model.lugPositionsMm[0]!;
  const second = model.lugPositionsMm[1] ?? first;
  const lines: Line3D[] = [
    circleLine(pcdRadius, palette.accent, 0.19, 72),
    circleLine(boreRadius, palette.guide, 0.2, 48),
    { points: [v(-pcdRadius, 0, 0.22), v(pcdRadius, 0, 0.22)], color: palette.guide, width: 1.2, alpha: 0.84, dashed: true },
    { points: [v(first.x * scale, first.y * scale, 0.24), v(second.x * scale, second.y * scale, 0.24)], color: palette.warning, width: 2.2, alpha: 1 },
  ];
  const shadows: Shadow3D[] = [{ center: v(0, -1.02, 0), radiusX: 1.05, radiusZ: 0.62, alpha: 0.16 }];
  const annotations: Annotation3D[] = [
    { start: v(-pcdRadius, 0, 0.22), end: v(pcdRadius, 0, 0.22), color: palette.accent, label: `${model.pcdMm.toFixed(model.pcdMm % 1 ? 1 : 0)} mm PCD`, labelOffsetY: -18 },
    { start: v(first.x * scale, first.y * scale, 0.24), end: v(second.x * scale, second.y * scale, 0.24), color: palette.warning, label: `${model.adjacentSpacingMm.toFixed(2)} mm spacing`, labelOffsetY: 18 },
  ];
  return { meshes, lines, shadows, annotations, fitRadius: 1.34 };
}
