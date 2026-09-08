import { createEmptyGarageState, createGarageState, createSavedSetup, createVehicleProfile, GARAGE_SCHEMA_VERSION, type GarageState } from '../domain/garage';
import { createTireSize, createVehicleSetup, createWheelSpec, type VehicleProfile, type VehicleSetup } from '../domain/vehicle';
import type { SavedSetup } from '../domain/garage';
import type { GarageLoadResult } from './garage-repository';

type Migration = (value: Record<string, unknown>) => Record<string, unknown>;

// Add migrations by their source schema version. V1 has no predecessors yet.
export const garageMigrations: Readonly<Partial<Record<number, Migration>>> = Object.freeze({});

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
  if (!Array.isArray(value.vehicles) || !Array.isArray(value.savedSetups)) return undefined;
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

  const state = createGarageState({
    vehicles,
    activeVehicleId: typeof value.activeVehicleId === 'string' ? value.activeVehicleId : null,
    savedSetups,
  });
  return state.ok ? state.value : undefined;
}

export function serializeGarageState(state: GarageState): string {
  return JSON.stringify(state);
}

export function deserializeGarageState(raw: string | null): GarageLoadResult {
  if (raw === null) return { state: createEmptyGarageState(), status: 'empty' };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { state: createEmptyGarageState(), status: 'recovered-corrupt' };
  }
  if (!isRecord(value)) return { state: createEmptyGarageState(), status: 'recovered-invalid' };

  let record = value;
  let version = record.schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version)) return { state: createEmptyGarageState(), status: 'recovered-invalid' };
  while (version < GARAGE_SCHEMA_VERSION) {
    const migrate = garageMigrations[version];
    if (!migrate) return { state: createEmptyGarageState(), status: 'recovered-unsupported' };
    record = migrate(record);
    version = record.schemaVersion;
    if (typeof version !== 'number' || !Number.isInteger(version)) return { state: createEmptyGarageState(), status: 'recovered-invalid' };
  }
  if (version !== GARAGE_SCHEMA_VERSION) return { state: createEmptyGarageState(), status: 'recovered-unsupported' };

  const state = parseCurrentSchema(record);
  return state ? { state, status: 'loaded' } : { state: createEmptyGarageState(), status: 'recovered-invalid' };
}
