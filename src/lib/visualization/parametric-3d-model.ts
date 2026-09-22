import { compareTireSizesTool, calculateWheelOffsetTool, type TireToolInput, type WheelOffsetToolInput } from '../../features/tools/calculator-tools';
import { adjacentHoleSpacingMm, lugPositions } from '../../data/bolt-pattern-geometry';
import { inchesToMillimeters } from '../../core/units/conversion';

export interface Tire3DGeometry {
  readonly widthMm: number;
  readonly sidewallMm: number;
  readonly rimDiameterMm: number;
  readonly overallDiameterMm: number;
  readonly circumferenceMm: number;
}

export interface TireComparison3DModel {
  readonly current: Tire3DGeometry;
  readonly proposed: Tire3DGeometry;
  readonly diameterDifferenceMm: number;
  readonly circumferenceDifferenceMm: number;
  readonly speedometerDifferencePercent: number;
}

export function buildTireComparison3DModel(original: TireToolInput, proposed: TireToolInput): TireComparison3DModel | null {
  const result = compareTireSizesTool(original, proposed);
  if (!result.ok) return null;
  return Object.freeze({
    current: Object.freeze({
      widthMm: original.widthMm,
      sidewallMm: result.value.current.sidewallHeightMm,
      rimDiameterMm: inchesToMillimeters(original.rimDiameterInches),
      overallDiameterMm: result.value.current.overallDiameterMm,
      circumferenceMm: result.value.current.circumferenceMm,
    }),
    proposed: Object.freeze({
      widthMm: proposed.widthMm,
      sidewallMm: result.value.proposed.sidewallHeightMm,
      rimDiameterMm: inchesToMillimeters(proposed.rimDiameterInches),
      overallDiameterMm: result.value.proposed.overallDiameterMm,
      circumferenceMm: result.value.proposed.circumferenceMm,
    }),
    diameterDifferenceMm: result.value.diameterDifferenceMm,
    circumferenceDifferenceMm: result.value.circumferenceDifferenceMm,
    speedometerDifferencePercent: result.value.speedometerDifferencePercent,
  });
}

export interface WheelOffset3DModel {
  readonly originalWidthMm: number;
  readonly newWidthMm: number;
  readonly originalOffsetMm: number;
  readonly newOffsetMm: number;
  readonly originalCenterFromHubMm: number;
  readonly newCenterFromHubMm: number;
  readonly innerPositionChangeMm: number;
  readonly outerPokeChangeMm: number;
}

export function buildWheelOffset3DModel(input: WheelOffsetToolInput): WheelOffset3DModel | null {
  const result = calculateWheelOffsetTool(input);
  if (!result.ok) return null;
  return Object.freeze({
    originalWidthMm: inchesToMillimeters(input.originalWidthInches),
    newWidthMm: inchesToMillimeters(input.newWidthInches),
    originalOffsetMm: input.originalOffsetMm,
    newOffsetMm: input.newOffsetMm,
    // Positive ET places the wheel centerline inward of the fixed mounting face.
    originalCenterFromHubMm: -input.originalOffsetMm,
    newCenterFromHubMm: -input.newOffsetMm,
    innerPositionChangeMm: result.value.innerPositionChangeMm,
    outerPokeChangeMm: result.value.outerPokeChangeMm,
  });
}

export interface Pcd3DModel {
  readonly lugCount: number;
  readonly pcdMm: number;
  readonly pcdRadiusMm: number;
  readonly centerBoreMm: number | null;
  readonly adjacentSpacingMm: number;
  readonly lugPositionsMm: readonly Readonly<{ x: number; y: number }>[];
}

export function buildPcd3DModel(lugCount: number, pcdMm: number, centerBoreMm?: number | null): Pcd3DModel | null {
  if (!Number.isInteger(lugCount) || lugCount < 3 || lugCount > 10) return null;
  if (!Number.isFinite(pcdMm) || pcdMm <= 0 || pcdMm > 500) return null;
  if (centerBoreMm !== undefined && centerBoreMm !== null && (!Number.isFinite(centerBoreMm) || centerBoreMm <= 0 || centerBoreMm >= pcdMm)) return null;
  const radius = pcdMm / 2;
  const positions = lugPositions(lugCount).map(([x, y]) => Object.freeze({ x: x * radius, y: y * radius }));
  return Object.freeze({
    lugCount,
    pcdMm,
    pcdRadiusMm: radius,
    centerBoreMm: centerBoreMm ?? null,
    adjacentSpacingMm: adjacentHoleSpacingMm(pcdMm, lugCount),
    lugPositionsMm: Object.freeze(positions),
  });
}
