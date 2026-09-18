import { createEmptyGarageState, createGarageState, createSavedSetup, createVehicleProfile, GARAGE_SCHEMA_VERSION, type GarageState } from '../domain/garage';
import { createTireSize, createVehicleSetup, createWheelSpec, type VehicleProfile, type VehicleSetup } from '../domain/vehicle';
import type { SavedSetup } from '../domain/garage';
import type { GarageLoadResult } from './garage-repository';
import { createVehicleClearanceProfile, type VehicleClearanceProfile } from '../domain/clearance';

type Migration = (value: Record<string, unknown>) => Record<string, unknown>;

export const garageMigrations: Readonly<Partial<Record<number, Migration>>> = Object.freeze({
  1: (value) => ({ ...value, schemaVersion: 2, clearanceProfiles: [] }),
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function parseSetup(value: unknown): VehicleSetup | undefined {
  if (!isRecord(value) || !isRecord(value.tire) || !isRecord(value.wheel)) return undefined;
  const tire = createTireSize({
    widthMm: Number(value.tire.widthMm),
    aspectRatio: Number(value.tire.aspectRatio),
    rimDiameterInches: Number(value.tire.rimDiameterInches),
  });
  const wheel = createWheelSpec({
    diameterInches: Number(value.wheel.diameterInches),
    widthInches: Number(value.wheel.widthInches),
    offsetMm: Number(value.wheel.offsetMm),
  });
  if (!tire.ok || !wheel.ok) return undefined;
  const setup = createVehicleSetup(tire.value, wheel.value);
  return setup.ok ? setup.value : undefined;
}

function parseCurrentSchema(value: Record<string, unknown>): GarageState | undefined {
  if (!Array.isArray(value.vehicles) || !Array.isArray(value.savedSetups) || !Array.isArray(value.clearanceProfiles)) return undefined;
  const vehicles: VehicleProfile[] = [];
  for (const candidate of value.vehicles) {
    if (!isRecord(candidate)) return undefined;
    const activeSetup = candidate.activeSetup === undefined ? undefined : parseSetup(candidate.activeSetup);
    if (candidate.activeSetup !== undefined && activeSetup === undefined) return undefined;
    const profile = createVehicleProfile({
      id: typeof candidate.id === 'string' ? candidate.id : '',
      displayName: typeof candidate.displayName === 'string' ? candidate.displayName : '',
      ...(typeof candidate.year === 'number' ? { year: candidate.year } : {}),
      ...(typeof candidate.make === 'string' ? { make: candidate.make } : {}),
      ...(typeof candidate.model === 'string' ? { model: candidate.model } : {}),
      ...(typeof candidate.trim === 'string' ? { trim: candidate.trim } : {}),
      ...(activeSetup === undefined ? {} : { activeSetup }),
      createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : '',
      updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : '',
    });
    if (!profile.ok) return undefined;
    vehicles.push(profile.value);
  }

  const savedSetups: SavedSetup[] = [];
  for (const candidate of value.savedSetups) {
    if (!isRecord(candidate)) return undefined;
    const setup = parseSetup(candidate.setup);
    if (!setup) return undefined;
    const saved = createSavedSetup({
      id: typeof candidate.id === 'string' ? candidate.id : '',
      vehicleId: typeof candidate.vehicleId === 'string' ? candidate.vehicleId : '',
      name: typeof candidate.name === 'string' ? candidate.name : '',
      setup,
      createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : '',
      updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : '',
    });
    if (!saved.ok) return undefined;
    savedSetups.push(saved.value);
  }

  const clearanceProfiles: VehicleClearanceProfile[] = [];
  for (const candidate of value.clearanceProfiles) {
    if (!isRecord(candidate) || !isRecord(candidate.measuredInnerClearance) || !isRecord(candidate.measuredOuterClearance)) return undefined;
    if (candidate.measuredInnerClearance.source !== 'userMeasured' || candidate.measuredOuterClearance.source !== 'userMeasured') return undefined;
    const baselineSetup = parseSetup(candidate.baselineSetup);
    if (!baselineSetup) return undefined;
    const profile = createVehicleClearanceProfile({
      vehicleId: typeof candidate.vehicleId === 'string' ? candidate.vehicleId : '',
      baselineSetupId: typeof candidate.baselineSetupId === 'string' ? candidate.baselineSetupId : null,
      baselineSetup,
      measuredInnerClearanceMm: Number(candidate.measuredInnerClearance.valueMm),
      measuredOuterClearanceMm: Number(candidate.measuredOuterClearance.valueMm),
      minimumDesiredInnerClearanceMm: candidate.minimumDesiredInnerClearanceMm === null ? null : Number(candidate.minimumDesiredInnerClearanceMm),
      minimumDesiredOuterClearanceMm: candidate.minimumDesiredOuterClearanceMm === null ? null : Number(candidate.minimumDesiredOuterClearanceMm),
      updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : '',
    });
    if (!profile.ok) return undefined;
    clearanceProfiles.push(profile.value);
  }

  const state = createGarageState({
    vehicles,
    activeVehicleId: typeof value.activeVehicleId === 'string' ? value.activeVehicleId : null,
    savedSetups,
    clearanceProfiles,
  });
  return state.ok ? state.value : undefined;
}

export function serializeGarageState(state: GarageState): string {
  return JSON.stringify(state);
}

export const MAX_GARAGE_STORAGE_LENGTH = 1_000_000;

export function deserializeGarageState(raw: string | null): GarageLoadResult {
  if (raw === null) return { state: createEmptyGarageState(), status: 'empty' };
  if (raw.length > MAX_GARAGE_STORAGE_LENGTH) return { state: createEmptyGarageState(), status: 'recovered-invalid' };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { state: createEmptyGarageState(), status: 'recovered-corrupt' };
  }
  if (!isRecord(value)) return { state: createEmptyGarageState(), status: 'recovered-invalid' };

  let record = value;
  let migrated = false;
  let version = record.schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version)) return { state: createEmptyGarageState(), status: 'recovered-invalid' };
  while (version < GARAGE_SCHEMA_VERSION) {
    const migrate = garageMigrations[version];
    if (!migrate) return { state: createEmptyGarageState(), status: 'recovered-unsupported' };
    record = migrate(record);
    migrated = true;
    version = record.schemaVersion;
    if (typeof version !== 'number' || !Number.isInteger(version)) return { state: createEmptyGarageState(), status: 'recovered-invalid' };
  }
  if (version !== GARAGE_SCHEMA_VERSION) return { state: createEmptyGarageState(), status: 'recovered-unsupported' };

  const state = parseCurrentSchema(record);
  return state ? { state, status: migrated ? 'migrated' : 'loaded' } : { state: createEmptyGarageState(), status: 'recovered-invalid' };
}
