import type { ValidationResult } from './validation';
import { invalid, valid } from './validation';

declare const tireSizeBrand: unique symbol;
declare const wheelSpecBrand: unique symbol;
declare const vehicleSetupBrand: unique symbol;

export interface TireSize {
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
  readonly [tireSizeBrand]: true;
}

export interface WheelSpec {
  readonly diameterInches: number;
  readonly widthInches: number;
  readonly offsetMm: number;
  readonly [wheelSpecBrand]: true;
}

export interface VehicleSetup {
  readonly tire: TireSize;
  readonly wheel: WheelSpec;
  readonly [vehicleSetupBrand]: true;
}

export interface VehicleProfile {
  readonly id: string;
  readonly displayName: string;
  readonly year?: number;
  readonly make?: string;
  readonly model?: string;
  readonly trim?: string;
  readonly activeSetup?: VehicleSetup;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FitmentComparisonResult {
  readonly current: {
    readonly sidewallHeightMm: number;
    readonly overallDiameterMm: number;
    readonly circumferenceMm: number;
    readonly revolutionsPerKilometer: number;
    readonly revolutionsPerMile: number;
  };
  readonly proposed: {
    readonly sidewallHeightMm: number;
    readonly overallDiameterMm: number;
    readonly circumferenceMm: number;
    readonly revolutionsPerKilometer: number;
    readonly revolutionsPerMile: number;
  };
  readonly diameterDifferenceMm: number;
  readonly diameterDifferencePercent: number;
  readonly rideHeightDifferenceMm: number;
  readonly speedometerDifferencePercent: number;
  readonly wheelInnerPositionChangeMm: number;
  readonly wheelOuterPokeChangeMm: number;
}

export interface VehicleEventBase<TType extends string, TData = unknown> {
  readonly id: string;
  readonly vehicleProfileId: string;
  readonly type: TType;
  readonly occurredAt: string;
  readonly recordedAt: string;
  readonly source?: 'user' | 'import' | 'system';
  readonly odometerKm?: number;
  readonly data: TData;
}

export type VehicleEvent = VehicleEventBase<string, unknown>;

interface TireSizeInput {
  readonly widthMm: number;
  readonly aspectRatio: number;
  readonly rimDiameterInches: number;
}

interface WheelSpecInput {
  readonly diameterInches: number;
  readonly widthInches: number;
  readonly offsetMm: number;
}

const finiteNumberIssue = (field: string, value: unknown) => ({
  code: 'not-a-number' as const,
  field,
  message: `${field} must be a finite number.`,
  received: value,
});

const rangeIssue = (field: string, value: number, min: number, max: number) => ({
  code: 'out-of-range' as const,
  field,
  message: `${field} must be between ${min} and ${max}.`,
  received: value,
});

export function createTireSize(input: TireSizeInput): ValidationResult<TireSize> {
  const issues = [];
  const fields = [
    ['widthMm', input.widthMm, 80, 500, true],
    ['aspectRatio', input.aspectRatio, 20, 100, true],
    ['rimDiameterInches', input.rimDiameterInches, 8, 30, false],
  ] as const;

  for (const [field, value, min, max, mustBeInteger] of fields) {
    if (!Number.isFinite(value)) issues.push(finiteNumberIssue(field, value));
    else if (mustBeInteger && !Number.isInteger(value)) issues.push({ code: 'not-an-integer' as const, field, message: `${field} must be a whole number.`, received: value });
    else if (value < min || value > max) issues.push(rangeIssue(field, value, min, max));
  }

  if (issues.length > 0) return invalid(...issues);
  return valid(Object.freeze({ ...input }) as TireSize);
}

export function createWheelSpec(input: WheelSpecInput): ValidationResult<WheelSpec> {
  const issues = [];
  const fields = [
    ['diameterInches', input.diameterInches, 8, 30],
    ['widthInches', input.widthInches, 3, 20],
    ['offsetMm', input.offsetMm, -100, 150],
  ] as const;

  for (const [field, value, min, max] of fields) {
    if (!Number.isFinite(value)) issues.push(finiteNumberIssue(field, value));
    else if (value < min || value > max) issues.push(rangeIssue(field, value, min, max));
  }

  if (issues.length > 0) return invalid(...issues);
  return valid(Object.freeze({ ...input }) as WheelSpec);
}

export function createVehicleSetup(tire: TireSize, wheel: WheelSpec): ValidationResult<VehicleSetup> {
  if (tire.rimDiameterInches !== wheel.diameterInches) {
    return invalid({
      code: 'incompatible-values',
      field: 'wheel.diameterInches',
      message: 'Wheel diameter must match the tire rim diameter.',
      received: wheel.diameterInches,
    });
  }

  return valid(Object.freeze({ tire, wheel }) as VehicleSetup);
}
