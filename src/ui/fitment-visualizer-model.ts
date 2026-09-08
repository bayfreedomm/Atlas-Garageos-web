import { inchesToMillimeters } from '../core/units/conversion';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export interface TireScaleInput {
  readonly currentDiameterMm: number;
  readonly currentRimDiameterInches: number;
  readonly proposedDiameterMm?: number;
  readonly proposedRimDiameterInches?: number;
}

export function tireScaleMapping(input: TireScaleInput) {
  const proposedDiameter = input.proposedDiameterMm ?? input.currentDiameterMm;
  const proposedRim = input.proposedRimDiameterInches ?? input.currentRimDiameterInches;
  const maximumDiameter = Math.max(input.currentDiameterMm, proposedDiameter);
  const radiusScale = 62 / maximumDiameter;
  return Object.freeze({
    currentTireRadius: input.currentDiameterMm * radiusScale,
    proposedTireRadius: proposedDiameter * radiusScale,
    currentRimRadius: inchesToMillimeters(input.currentRimDiameterInches) * radiusScale,
    proposedRimRadius: inchesToMillimeters(proposedRim) * radiusScale,
  });
}

export function wheelOffsetVisualMapping(innerPositionChangeMm: number, outerPokeChangeMm: number) {
  const pixelsPerMm = 1.1;
  const currentLeft = 82;
  const currentRight = 278;
  const proposedLeft = clamp(currentLeft - innerPositionChangeMm * pixelsPerMm, 42, 122);
  const proposedRight = clamp(currentRight + outerPokeChangeMm * pixelsPerMm, 238, 318);
  return Object.freeze({ currentX: currentLeft, currentWidth: currentRight - currentLeft, proposedX: proposedLeft, proposedWidth: proposedRight - proposedLeft });
}
