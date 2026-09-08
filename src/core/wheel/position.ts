import type { WheelSpec } from '../../domain/vehicle';
import { inchesToMillimeters } from '../units/conversion';

export interface WheelPositionChange {
  readonly innerPositionChangeMm: number;
  readonly outerPokeChangeMm: number;
}

export function compareWheelPosition(current: WheelSpec, proposed: WheelSpec): WheelPositionChange {
  const halfWidthChangeMm = inchesToMillimeters(proposed.widthInches - current.widthInches) / 2;
  const offsetChangeMm = proposed.offsetMm - current.offsetMm;

  return {
    innerPositionChangeMm: halfWidthChangeMm + offsetChangeMm,
    outerPokeChangeMm: halfWidthChangeMm - offsetChangeMm,
  };
}
