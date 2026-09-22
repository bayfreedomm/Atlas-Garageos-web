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

function extrudedPolygon(points: readonly Readonly<{ x: number; y: number }>[], depth: number, color: string, position: Vec3, alpha = 1, material = METAL_MATERIAL): Mesh3D {
  const half = depth / 2;
  const vertices: Vec3[] = [
    ...points.map((point) => v(point.x, point.y, -half)),
    ...points.map((point) => v(point.x, point.y, half)),
  ];
  const faces: { a: number; b: number; c: number }[] = [];
  const count = points.length;
  for (let index = 1; index < count - 1; index += 1) {
    faces.push({ a: 0, b: index + 1, c: index });
    faces.push({ a: count, b: count + index, c: count + index + 1 });
  }
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % count;
    faces.push({ a: index, b: next, c: count + next }, { a: index, b: count + next, c: count + index });
  }
  return { vertices, faces, color, alpha, position, material };
}

function taperedSpoke(innerRadius: number, outerRadius: number, angle: number, depth: number, color: string, z: number, alpha: number): Mesh3D {
  const centers = [
    { radius: innerRadius, angle: angle - 0.075, halfWidth: innerRadius * 0.25 },
    { radius: innerRadius + (outerRadius - innerRadius) * 0.53, angle: angle + 0.055, halfWidth: innerRadius * 0.20 },
    { radius: outerRadius, angle: angle + 0.11, halfWidth: innerRadius * 0.135 },
  ];
  const side = (center: typeof centers[number], direction: number) => ({
    x: Math.cos(center.angle) * center.radius + Math.cos(center.angle + Math.PI / 2) * center.halfWidth * direction,
    y: Math.sin(center.angle) * center.radius + Math.sin(center.angle + Math.PI / 2) * center.halfWidth * direction,
  });
  return extrudedPolygon(
    [side(centers[0]!, 1), side(centers[1]!, 1), side(centers[2]!, 1), side(centers[2]!, -1), side(centers[1]!, -1), side(centers[0]!, -1)],
    depth,
    color,
    v(0, 0, z),
    alpha,
    METAL_MATERIAL,
  );
}

const RUBBER_MATERIAL = Object.freeze({ ambient: 0.28, diffuse: 0.78, specular: 0.07, shininess: 8, metallic: 0, rim: 0.18 });
const TREAD_MATERIAL = Object.freeze({ ambient: 0.26, diffuse: 0.74, specular: 0.06, shininess: 7, metallic: 0, rim: 0.12 });
const METAL_MATERIAL = Object.freeze({ ambient: 0.42, diffuse: 0.66, specular: 0.34, shininess: 28, metallic: 0.82, rim: 0.08 });
const HUB_MATERIAL = Object.freeze({ ambient: 0.34, diffuse: 0.68, specular: 0.24, shininess: 20, metallic: 0.46, rim: 0.1 });
const GUIDE_MATERIAL = Object.freeze({ ambient: 0.28, diffuse: 0.45, specular: 0.08, shininess: 12, metallic: 0.12, rim: 0.04 });

function tireProfile(geometry: Tire3DGeometry, scale: number) {
  const outerRadius = (geometry.overallDiameterMm / 2) * scale;
  const rimRadius = (geometry.rimDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const shoulderRadius = outerRadius * 0.982;
  const upperSidewallRadius = rimRadius + (outerRadius - rimRadius) * 0.72;
  const sidewallRadius = rimRadius + (outerRadius - rimRadius) * 0.45;
  const beadRadius = rimRadius * 1.035;
  const innerWallRadius = rimRadius * 0.975;
  const treadHalf = width * 0.34;
  const shoulderHalf = width * 0.425;
  const sideHalf = width * 0.51;
  const beadHalf = width * 0.455;
  const innerHalf = width * 0.31;
  return [
    { radius: beadRadius, z: -beadHalf },
    { radius: sidewallRadius, z: -sideHalf },
    { radius: upperSidewallRadius, z: -sideHalf * 0.97 },
    { radius: shoulderRadius, z: -shoulderHalf },
    { radius: outerRadius * 0.998, z: -treadHalf },
    { radius: outerRadius, z: -width * 0.12 },
    { radius: outerRadius, z: width * 0.12 },
    { radius: outerRadius * 0.998, z: treadHalf },
    { radius: shoulderRadius, z: shoulderHalf },
    { radius: upperSidewallRadius, z: sideHalf * 0.97 },
    { radius: sidewallRadius, z: sideHalf },
    { radius: beadRadius, z: beadHalf },
    { radius: rimRadius * 1.005, z: width * 0.39 },
    { radius: innerWallRadius, z: innerHalf },
    { radius: innerWallRadius, z: -innerHalf },
    { radius: rimRadius * 1.005, z: -width * 0.39 },
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

function treadDetails(geometry: Tire3DGeometry, center: Vec3, scale: number, alpha: number): readonly Mesh3D[] {
  const outerRadius = (geometry.overallDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const details: Mesh3D[] = [];
  const grooveWidth = Math.max(0.012, width * 0.035);
  for (const axial of [-0.19, -0.062, 0.062, 0.19]) {
    const z = center.z + width * axial;
    details.push(revolveProfile([
      { radius: outerRadius * 0.994, z: -grooveWidth },
      { radius: outerRadius * 1.006, z: -grooveWidth * 0.52 },
      { radius: outerRadius * 1.006, z: grooveWidth * 0.52 },
      { radius: outerRadius * 0.994, z: grooveWidth },
    ], '#10171c', v(center.x, center.y, z), alpha * 0.9, 64, TREAD_MATERIAL));
  }
  const blockCount = 28;
  for (let index = 0; index < blockCount; index += 1) {
    const angle = (Math.PI * 2 * index) / blockCount;
    const alternating = index % 2 === 0 ? 1 : -1;
    for (const shoulder of [-1, 1]) {
      const radius = outerRadius * 1.006;
      details.push(box(
        outerRadius * 0.035,
        outerRadius * 0.12,
        width * 0.13,
        '#20292f',
        v(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius, center.z + shoulder * width * 0.29 + alternating * width * 0.012),
        alpha * 0.94,
        angle,
        TREAD_MATERIAL,
      ));
    }
  }
  return details;
}

function wheelAssembly(geometry: Tire3DGeometry, color: string, center: Vec3, scale: number, alpha = 1): readonly Mesh3D[] {
  const rimRadius = (geometry.rimDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  const barrelOuter = rimRadius * 0.98;
  const barrelInner = rimRadius * 0.54;
  const faceOuter = rimRadius * 0.84;
  const faceInner = rimRadius * 0.23;
  const frontZ = center.z + width * 0.255;
  const spokeDepth = width * 0.075;
  const spokes: Mesh3D[] = [];
  for (let index = 0; index < 10; index += 1) {
    const angle = (Math.PI * 2 * index) / 10;
    spokes.push(taperedSpoke(faceInner * 0.92, faceOuter, angle, spokeDepth, color, frontZ, alpha * 0.98));
  }
  const meshes: Mesh3D[] = [
    annulusCylinder(barrelOuter, barrelInner, width * 0.64, '#657681', center, alpha, METAL_MATERIAL),
    annulusCylinder(barrelOuter * 1.018, barrelOuter * 0.88, width * 0.045, '#c8d4db', v(center.x, center.y, center.z + width * 0.315), alpha, METAL_MATERIAL),
    annulusCylinder(barrelOuter * 1.012, barrelOuter * 0.88, width * 0.04, '#8798a3', v(center.x, center.y, center.z - width * 0.315), alpha * 0.8, METAL_MATERIAL),
    annulusCylinder(faceOuter * 1.04, faceOuter * 0.92, width * 0.052, '#c5d1d8', v(center.x, center.y, frontZ), alpha, METAL_MATERIAL),
    ...spokes,
    annulusCylinder(faceInner * 1.08, faceInner * 0.34, width * 0.12, '#aebdc6', v(center.x, center.y, frontZ + width * 0.015), alpha, HUB_MATERIAL),
    cylinder(faceInner * 0.34, width * 0.16, '#758995', v(center.x, center.y, frontZ + width * 0.045), alpha, HUB_MATERIAL),
  ];
  const lugRadius = faceInner * 0.67;
  for (let index = 0; index < 5; index += 1) {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const lugCenter = v(center.x + Math.cos(angle) * lugRadius, center.y + Math.sin(angle) * lugRadius, frontZ + width * 0.08);
    meshes.push(cylinder(faceInner * 0.105, width * 0.065, '#26343d', lugCenter, alpha, GUIDE_MATERIAL));
    meshes.push(cylinder(faceInner * 0.055, width * 0.072, '#d8e1e6', v(lugCenter.x, lugCenter.y, lugCenter.z + width * 0.02), alpha, METAL_MATERIAL));
  }
  return meshes;
}

function tireAssembly(geometry: Tire3DGeometry, color: string, center: Vec3, scale: number, alpha = 1): readonly Mesh3D[] {
  const meshes: Mesh3D[] = [
    revolveProfile(tireProfile(geometry, scale), color, center, alpha, 72, RUBBER_MATERIAL),
    revolveProfile(treadProfile(geometry, scale), '#252d32', center, Math.min(1, alpha * 0.98), 72, TREAD_MATERIAL),
  ];
  meshes.push(...treadDetails(geometry, center, scale, alpha));
  const rimRadius = (geometry.rimDiameterMm / 2) * scale;
  const width = geometry.widthMm * scale;
  meshes.push(
    annulusCylinder(rimRadius * 1.055, rimRadius * 1.005, width * 0.025, '#151d22', v(center.x, center.y, center.z + width * 0.405), alpha, RUBBER_MATERIAL),
    annulusCylinder(rimRadius * 1.055, rimRadius * 1.005, width * 0.025, '#151d22', v(center.x, center.y, center.z - width * 0.405), alpha, RUBBER_MATERIAL),
  );
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
    { start: v(-spacing, -0.76, -model.current.widthMm * scale * 0.5), end: v(-spacing, -0.76, model.current.widthMm * scale * 0.5), color: palette.current, label: `${model.current.widthMm.toFixed(0)} mm width`, labelOffsetY: 18 },
    { start: v(spacing, model.proposed.rimDiameterMm * scale * 0.5, 0.34), end: v(spacing, proposedRadius, 0.34), color: palette.proposed, label: `${model.proposed.sidewallMm.toFixed(1)} mm sidewall`, labelOffsetX: 18 },
  );
  return { meshes, lines, shadows, annotations, fitRadius: 2.48 };
}

function offsetWheelMeshes(radius: number, width: number, centerZ: number, faceColor: string, alpha: number): readonly Mesh3D[] {
  const meshes: Mesh3D[] = [
    annulusCylinder(radius, radius * 0.58, width * 0.8, faceColor, v(0, 0, centerZ), alpha * 0.3, GUIDE_MATERIAL),
    annulusCylinder(radius * 1.02, radius * 0.86, width * 0.055, faceColor, v(0, 0, centerZ + width * 0.4), alpha, METAL_MATERIAL),
    annulusCylinder(radius * 0.9, radius * 0.82, width * 0.075, faceColor, v(0, 0, centerZ + width * 0.29), alpha, METAL_MATERIAL),
    annulusCylinder(radius * 0.24, radius * 0.08, width * 0.14, '#c5d2da', v(0, 0, centerZ + width * 0.3), alpha, HUB_MATERIAL),
  ];
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    meshes.push(taperedSpoke(radius * 0.2, radius * 0.79, angle, width * 0.075, faceColor, centerZ + width * 0.3, alpha * 0.97));
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
    plane(2.75, 2.75, palette.hub, 0, 0.085, GUIDE_MATERIAL),
    annulusCylinder(0.29, 0.075, 0.24, '#b8c7d0', v(0, 0, 0.1), 1, HUB_MATERIAL),
    cylinder(0.075, 0.52, '#667a87', v(0, 0, 0), 1, HUB_MATERIAL),
    ...offsetWheelMeshes(radius, currentDepth, currentZ, '#65b8f4', 0.46),
    ...offsetWheelMeshes(radius * 1.01, newDepth, newZ, '#f0a25d', 0.88),
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
    { start: v(-0.54, 1.36, 0), end: v(0.54, 1.36, 0), color: palette.accent, label: 'Hub plane · fixed', labelOffsetY: -14, dashed: true },
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
    annulusCylinder(plateOuter * 0.985, boreRadius * 0.82, 0.24, '#768894', v(0, 0, -0.03), 1, METAL_MATERIAL),
    annulusCylinder(plateOuter, plateOuter * 0.91, 0.16, '#c2d0d8', v(0, 0, 0.095), 1, METAL_MATERIAL),
    annulusCylinder(plateOuter * 0.91, hubOuter * 0.82, 0.08, '#91a3ae', v(0, 0, 0.13), 1, METAL_MATERIAL),
    annulusCylinder(hubOuter * 0.84, boreRadius, 0.19, '#596c78', v(0, 0, 0.09), 1, HUB_MATERIAL),
    annulusCylinder(boreRadius * 1.16, boreRadius * 0.83, 0.27, '#d0dbe1', v(0, 0, 0.12), 1, METAL_MATERIAL),
    annulusCylinder(boreRadius * 0.83, boreRadius * 0.69, 0.34, '#26343d', v(0, 0, 0.085), 1, GUIDE_MATERIAL),
  ];

  for (const point of model.lugPositionsMm) {
    const x = point.x * scale;
    const y = point.y * scale;
    meshes.push(annulusCylinder(holeRadius * 1.5, holeRadius * 0.9, 0.115, '#d2dce1', v(x, y, 0.18), 1, METAL_MATERIAL));
    meshes.push(annulusCylinder(holeRadius * 0.93, holeRadius * 0.62, 0.25, '#617580', v(x, y, 0.105), 1, HUB_MATERIAL));
    meshes.push(cylinder(holeRadius * 0.61, 0.31, '#18242c', v(x, y, 0.065), 1, GUIDE_MATERIAL));
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
  if (model.centerBoreMm) {
    annotations.push({ start: v(-boreRadius, 0, 0.31), end: v(boreRadius, 0, 0.31), color: palette.guide, label: `${model.centerBoreMm.toFixed(1)} mm bore`, labelOffsetY: 18 });
  }
  return { meshes, lines, shadows, annotations, fitRadius: 1.34 };
}
