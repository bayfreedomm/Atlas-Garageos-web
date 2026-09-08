import type { ValidationIssue, ValidationResult } from './validation';
import { invalid, valid } from './validation';
import type { VehicleSetup } from './vehicle';

export type DataSource = 'userMeasured' | 'calculated' | 'official' | 'community' | 'estimate';

export interface UserMeasuredLength {
  readonly valueMm: number;
  readonly source: 'userMeasured';
}

export interface VehicleClearanceProfile {
  readonly vehicleId: string;
  readonly baselineSetupId: string | null;
  readonly baselineSetup: VehicleSetup;
  readonly measuredInnerClearance: UserMeasuredLength;
  readonly measuredOuterClearance: UserMeasuredLength;
  readonly minimumDesiredInnerClearanceMm: number | null;
  readonly minimumDesiredOuterClearanceMm: number | null;
  readonly updatedAt: string;
}

export interface VehicleClearanceProfileInput {
  readonly vehicleId: string;
  readonly baselineSetupId: string | null;
  readonly baselineSetup: VehicleSetup;
  readonly measuredInnerClearanceMm: number;
  readonly measuredOuterClearanceMm: number;
  readonly minimumDesiredInnerClearanceMm: number | null;
  readonly minimumDesiredOuterClearanceMm: number | null;
  readonly updatedAt: string;
}

function clearanceIssue(field: string, value: number | null, required: boolean): ValidationIssue | undefined {
  if (value === null && !required) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { code: 'not-a-number', field, message: `${field} must be a finite number${required ? '' : ' or omitted'}.`, received: value };
  }
  if (value < 0 || value > 1_000) {
    return { code: 'out-of-range', field, message: `${field} must be between 0 and 1000 mm.`, received: value };
  }
  return undefined;
}

export function createVehicleClearanceProfile(input: VehicleClearanceProfileInput): ValidationResult<VehicleClearanceProfile> {
  const issues: ValidationIssue[] = [];
  if (input.vehicleId.trim().length === 0 || input.vehicleId.length > 128) {
    issues.push({ code: 'invalid-format', field: 'vehicleId', message: 'vehicleId must contain between 1 and 128 characters.', received: input.vehicleId });
  }
  if (input.baselineSetupId !== null && (input.baselineSetupId.trim().length === 0 || input.baselineSetupId.length > 128)) {
    issues.push({ code: 'invalid-format', field: 'baselineSetupId', message: 'baselineSetupId must be null or a valid identifier.', received: input.baselineSetupId });
  }
  const measuredInnerIssue = clearanceIssue('measuredInnerClearanceMm', input.measuredInnerClearanceMm, true);
  const measuredOuterIssue = clearanceIssue('measuredOuterClearanceMm', input.measuredOuterClearanceMm, true);
  const desiredInnerIssue = clearanceIssue('minimumDesiredInnerClearanceMm', input.minimumDesiredInnerClearanceMm, false);
  const desiredOuterIssue = clearanceIssue('minimumDesiredOuterClearanceMm', input.minimumDesiredOuterClearanceMm, false);
  if (measuredInnerIssue) issues.push(measuredInnerIssue);
  if (measuredOuterIssue) issues.push(measuredOuterIssue);
  if (desiredInnerIssue) issues.push(desiredInnerIssue);
  if (desiredOuterIssue) issues.push(desiredOuterIssue);
  if (!Number.isFinite(Date.parse(input.updatedAt))) {
    issues.push({ code: 'invalid-format', field: 'updatedAt', message: 'updatedAt must be a valid ISO date.', received: input.updatedAt });
  }
  if (issues.length > 0) return invalid(...issues);

  return valid(Object.freeze({
    vehicleId: input.vehicleId.trim(),
    baselineSetupId: input.baselineSetupId?.trim() ?? null,
    baselineSetup: input.baselineSetup,
    measuredInnerClearance: Object.freeze({ valueMm: input.measuredInnerClearanceMm, source: 'userMeasured' as const }),
    measuredOuterClearance: Object.freeze({ valueMm: input.measuredOuterClearanceMm, source: 'userMeasured' as const }),
    minimumDesiredInnerClearanceMm: input.minimumDesiredInnerClearanceMm,
    minimumDesiredOuterClearanceMm: input.minimumDesiredOuterClearanceMm,
    updatedAt: input.updatedAt,
  }));
}
