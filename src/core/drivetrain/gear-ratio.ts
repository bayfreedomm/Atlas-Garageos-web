import type { GearRatio, RoadSpeedMph, TireDiameterInches } from '../../domain/drivetrain';

export interface GearRatioComparison {
  readonly effectiveRatio: number;
  readonly matchingAxleRatio: number;
  readonly rpmAtSpeedDirectDrive: number;
}

export function compareGearRatio(currentDiameter: TireDiameterInches, newDiameter: TireDiameterInches, currentAxleRatio: GearRatio, speed: RoadSpeedMph): GearRatioComparison {
  return Object.freeze({
    effectiveRatio: currentAxleRatio * currentDiameter / newDiameter,
    matchingAxleRatio: currentAxleRatio * newDiameter / currentDiameter,
    rpmAtSpeedDirectDrive: speed * currentAxleRatio * 336 / newDiameter,
  });
}

export function directDriveRpm(diameter: TireDiameterInches, axleRatio: GearRatio, speed: RoadSpeedMph): number {
  return speed * axleRatio * 336 / diameter;
}

