import { compareGearRatio, directDriveRpm } from '../../core/drivetrain/gear-ratio';
import { createGearRatio, createRoadSpeedMph, createTireDiameterInches } from '../../domain/drivetrain';
import { invalid, valid } from '../../domain/validation';

export interface GearRatioToolInput { readonly currentDiameter: number; readonly newDiameter: number; readonly currentRatio: number; readonly speedMph: number; }

export function calculateGearRatioTool(input: GearRatioToolInput) {
  const currentDiameter = createTireDiameterInches(input.currentDiameter, 'currentDiameter');
  const newDiameter = createTireDiameterInches(input.newDiameter, 'newDiameter');
  const currentRatio = createGearRatio(input.currentRatio, 'currentRatio');
  const speed = createRoadSpeedMph(input.speedMph, 'speedMph');
  const issues = [currentDiameter, newDiameter, currentRatio, speed].flatMap((result) => result.ok ? [] : result.issues);
  if (issues.length || !currentDiameter.ok || !newDiameter.ok || !currentRatio.ok || !speed.ok) return invalid(...issues);
  return valid(compareGearRatio(currentDiameter.value, newDiameter.value, currentRatio.value, speed.value));
}

export function calculateDirectDriveRpmTool(diameter: number, ratio: number, speedMph: number) {
  const validDiameter = createTireDiameterInches(diameter);
  const validRatio = createGearRatio(ratio);
  const validSpeed = createRoadSpeedMph(speedMph);
  const issues = [validDiameter, validRatio, validSpeed].flatMap((result) => result.ok ? [] : result.issues);
  if (issues.length || !validDiameter.ok || !validRatio.ok || !validSpeed.ok) return invalid(...issues);
  return valid(directDriveRpm(validDiameter.value, validRatio.value, validSpeed.value));
}
