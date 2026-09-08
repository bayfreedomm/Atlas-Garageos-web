import type { TireSize } from '../../domain/vehicle';
import { inchesToMillimeters, MILLIMETERS_PER_KILOMETER, MILLIMETERS_PER_MILE } from '../units/conversion';

export const calculateSidewallHeightMm = (tire: TireSize): number => tire.widthMm * (tire.aspectRatio / 100);

export const calculateOverallDiameterMm = (tire: TireSize): number =>
  inchesToMillimeters(tire.rimDiameterInches) + 2 * calculateSidewallHeightMm(tire);

export const calculateCircumferenceMm = (tire: TireSize): number => Math.PI * calculateOverallDiameterMm(tire);

export const calculateRevolutionsPerKilometer = (tire: TireSize): number =>
  MILLIMETERS_PER_KILOMETER / calculateCircumferenceMm(tire);

export const calculateRevolutionsPerMile = (tire: TireSize): number =>
  MILLIMETERS_PER_MILE / calculateCircumferenceMm(tire);
