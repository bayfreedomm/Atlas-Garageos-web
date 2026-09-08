import type { ValidationIssue, ValidationResult } from './validation';
import { invalid, valid } from './validation';
import type { VehicleProfile, VehicleSetup } from './vehicle';
import type { VehicleClearanceProfile } from './clearance';

export const GARAGE_SCHEMA_VERSION = 2 as const;

export interface SavedSetup {
  readonly id: string;
  readonly vehicleId: string;
  readonly name: string;
  readonly setup: VehicleSetup;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GarageState {
  readonly schemaVersion: typeof GARAGE_SCHEMA_VERSION;
  readonly vehicles: readonly VehicleProfile[];
  readonly activeVehicleId: string | null;
  readonly savedSetups: readonly SavedSetup[];
  readonly clearanceProfiles: readonly VehicleClearanceProfile[];
}

export interface VehicleProfileInput {
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

export interface SavedSetupInput {
  readonly id: string;
  readonly vehicleId: string;
  readonly name: string;
  readonly setup: VehicleSetup;
  readonly createdAt: string;
  readonly updatedAt: string;
}

const textIssue = (field: string, maxLength: number, value: unknown): ValidationIssue | undefined => {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maxLength) {
    return { code: 'invalid-format', field, message: `${field} must contain between 1 and ${maxLength} characters.`, received: value };
  }
  return undefined;
};

const dateIssue = (field: string, value: string): ValidationIssue | undefined => {
  if (!Number.isFinite(Date.parse(value))) {
    return { code: 'invalid-format', field, message: `${field} must be a valid ISO date.`, received: value };
  }
  return undefined;
};

export function createVehicleProfile(input: VehicleProfileInput): ValidationResult<VehicleProfile> {
  const issues = [
    textIssue('id', 128, input.id),
    textIssue('displayName', 80, input.displayName),
    dateIssue('createdAt', input.createdAt),
    dateIssue('updatedAt', input.updatedAt),
  ].filter((issue): issue is ValidationIssue => issue !== undefined);

  if (input.year !== undefined && (!Number.isInteger(input.year) || input.year < 1886 || input.year > 2200)) {
    issues.push({ code: 'out-of-range', field: 'year', message: 'year must be between 1886 and 2200.', received: input.year });
  }
  if (issues.length > 0) return invalid(...issues);

  return valid(Object.freeze({
    ...input,
    id: input.id.trim(),
    displayName: input.displayName.trim(),
  }));
}

export function createSavedSetup(input: SavedSetupInput): ValidationResult<SavedSetup> {
  const issues = [
    textIssue('id', 128, input.id),
    textIssue('vehicleId', 128, input.vehicleId),
    textIssue('name', 80, input.name),
    dateIssue('createdAt', input.createdAt),
    dateIssue('updatedAt', input.updatedAt),
  ].filter((issue): issue is ValidationIssue => issue !== undefined);
  if (issues.length > 0) return invalid(...issues);

  return valid(Object.freeze({
    ...input,
    id: input.id.trim(),
    vehicleId: input.vehicleId.trim(),
    name: input.name.trim(),
  }));
}

export function createGarageState(input: Omit<GarageState, 'schemaVersion'>): ValidationResult<GarageState> {
  const issues: ValidationIssue[] = [];
  const vehicleIds = new Set<string>();
  const setupIds = new Set<string>();
  const clearanceVehicleIds = new Set<string>();

  for (const vehicle of input.vehicles) {
    if (vehicleIds.has(vehicle.id)) issues.push({ code: 'duplicate', field: 'vehicles.id', message: `Duplicate vehicle id: ${vehicle.id}.`, received: vehicle.id });
    vehicleIds.add(vehicle.id);
  }
  for (const setup of input.savedSetups) {
    if (setupIds.has(setup.id)) issues.push({ code: 'duplicate', field: 'savedSetups.id', message: `Duplicate setup id: ${setup.id}.`, received: setup.id });
    setupIds.add(setup.id);
    if (!vehicleIds.has(setup.vehicleId)) issues.push({ code: 'invalid-reference', field: 'savedSetups.vehicleId', message: `Saved setup references an unknown vehicle: ${setup.vehicleId}.`, received: setup.vehicleId });
  }
  if (input.activeVehicleId !== null && !vehicleIds.has(input.activeVehicleId)) {
    issues.push({ code: 'invalid-reference', field: 'activeVehicleId', message: 'Active vehicle id must reference an existing vehicle.', received: input.activeVehicleId });
  }
  for (const profile of input.clearanceProfiles) {
    if (!vehicleIds.has(profile.vehicleId)) issues.push({ code: 'invalid-reference', field: 'clearanceProfiles.vehicleId', message: 'Clearance profile must reference an existing vehicle.', received: profile.vehicleId });
    if (clearanceVehicleIds.has(profile.vehicleId)) issues.push({ code: 'duplicate', field: 'clearanceProfiles.vehicleId', message: 'A vehicle may have only one active clearance profile.', received: profile.vehicleId });
    clearanceVehicleIds.add(profile.vehicleId);
    if (profile.baselineSetupId !== null) {
      const baseline = input.savedSetups.find((setup) => setup.id === profile.baselineSetupId);
      if (!baseline || baseline.vehicleId !== profile.vehicleId) issues.push({ code: 'invalid-reference', field: 'clearanceProfiles.baselineSetupId', message: 'Baseline setup id must reference a saved setup for the same vehicle.', received: profile.baselineSetupId });
    }
  }
  if (issues.length > 0) return invalid(...issues);

  return valid(Object.freeze({
    schemaVersion: GARAGE_SCHEMA_VERSION,
    vehicles: Object.freeze([...input.vehicles]),
    activeVehicleId: input.activeVehicleId,
    savedSetups: Object.freeze([...input.savedSetups]),
    clearanceProfiles: Object.freeze([...input.clearanceProfiles]),
  }));
}

export function createEmptyGarageState(): GarageState {
  return Object.freeze({
    schemaVersion: GARAGE_SCHEMA_VERSION,
    vehicles: Object.freeze([]),
    activeVehicleId: null,
    savedSetups: Object.freeze([]),
    clearanceProfiles: Object.freeze([]),
  });
}
