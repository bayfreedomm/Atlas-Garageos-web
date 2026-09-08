import type { FitmentComparisonResult, TireSize, VehicleSetup } from '../../domain/vehicle';
import {
  calculateCircumferenceMm,
  calculateOverallDiameterMm,
  calculateRevolutionsPerKilometer,
  calculateRevolutionsPerMile,
  calculateSidewallHeightMm,
} from '../tire/geometry';
import { compareWheelPosition } from '../wheel/position';

const tireMetrics = (tire: TireSize) => ({
  sidewallHeightMm: calculateSidewallHeightMm(tire),
  overallDiameterMm: calculateOverallDiameterMm(tire),
  circumferenceMm: calculateCircumferenceMm(tire),
  revolutionsPerKilometer: calculateRevolutionsPerKilometer(tire),
  revolutionsPerMile: calculateRevolutionsPerMile(tire),
});

export function compareFitment(current: VehicleSetup, proposed: VehicleSetup): FitmentComparisonResult {
  const currentMetrics = tireMetrics(current.tire);
  const proposedMetrics = tireMetrics(proposed.tire);
  const diameterDifferenceMm = proposedMetrics.overallDiameterMm - currentMetrics.overallDiameterMm;
  const diameterDifferencePercent = (diameterDifferenceMm / currentMetrics.overallDiameterMm) * 100;
  const wheelPosition = compareWheelPosition(current.wheel, proposed.wheel);

  return {
    current: currentMetrics,
    proposed: proposedMetrics,
    diameterDifferenceMm,
    diameterDifferencePercent,
    rideHeightDifferenceMm: diameterDifferenceMm / 2,
    speedometerDifferencePercent: diameterDifferencePercent,
    wheelInnerPositionChangeMm: wheelPosition.innerPositionChangeMm,
    wheelOuterPokeChangeMm: wheelPosition.outerPokeChangeMm,
  };
}

export const calculateActualSpeed = (indicatedSpeed: number, result: FitmentComparisonResult): number =>
  indicatedSpeed * (1 + result.speedometerDifferencePercent / 100);
