import { createGarageState, createSavedSetup, createVehicleProfile, type GarageState } from '../../domain/garage';
import type { ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import type { GarageLoadResult, GarageRepository } from '../../storage/garage-repository';
import { createSetupFromInput, type SetupInput } from '../compare/compare-setups';
import type { SetupShareV1 } from '../share/setup-share';
import { createVehicleClearanceProfile } from '../../domain/clearance';

export interface GarageServiceDependencies {
  readonly createId: () => string;
  readonly nowIso: () => string;
}

export interface SaveSetupCommand {
  readonly name: string;
  readonly vehicleNickname: string;
  readonly setup: SetupInput;
}

export class GarageService {
  public constructor(
    private readonly repository: GarageRepository,
    private readonly dependencies: GarageServiceDependencies,
  ) {}

  public load(): Promise<GarageLoadResult> {
    return this.repository.load();
  }

  private async persist(state: GarageState): Promise<ValidationResult<GarageState>> {
    try {
      await this.repository.save(state);
      return valid(state);
    } catch {
      return invalid({ code: 'invalid-format', field: 'browserStorage', message: 'Browser storage is unavailable or full. Nothing was saved.' });
    }
  }

  public async selectVehicle(vehicleId: string): Promise<ValidationResult<GarageState>> {
    const loaded = await this.repository.load();
    if (!loaded.state.vehicles.some((vehicle) => vehicle.id === vehicleId)) {
      return invalid({ code: 'invalid-reference', field: 'vehicleId', message: 'Selected vehicle does not exist in My Garage.', received: vehicleId });
    }
    const next = createGarageState({ ...loaded.state, activeVehicleId: vehicleId });
    if (!next.ok) return next;
    return this.persist(next.value);
  }

  public async saveSetup(command: SaveSetupCommand): Promise<ValidationResult<GarageState>> {
    const setup = createSetupFromInput(command.setup);
    if (!setup.ok) return setup;
    const loaded = await this.repository.load();
    let state = loaded.state;
    let vehicleId = state.activeVehicleId;
    let vehicles = [...state.vehicles];
    const now = this.dependencies.nowIso();

    if (vehicleId === null) {
      const profile = createVehicleProfile({
        id: this.dependencies.createId(),
        displayName: command.vehicleNickname,
        createdAt: now,
        updatedAt: now,
      });
      if (!profile.ok) return invalid(...profile.issues);
      vehicles.push(profile.value);
      vehicleId = profile.value.id;
    }

    const savedSetup = createSavedSetup({
      id: this.dependencies.createId(),
      vehicleId,
      name: command.name,
      setup: setup.value,
      createdAt: now,
      updatedAt: now,
    });
    if (!savedSetup.ok) return invalid(...savedSetup.issues);
    const next = createGarageState({ vehicles, activeVehicleId: vehicleId, savedSetups: [...state.savedSetups, savedSetup.value], clearanceProfiles: state.clearanceProfiles });
    if (!next.ok) return next;
    return this.persist(next.value);
  }

  public saveSharedSetup(shared: SetupShareV1, name: string, vehicleNickname: string): Promise<ValidationResult<GarageState>> {
    return this.saveSetup({ name, vehicleNickname, setup: shared.proposed });
  }

  public async deleteSetup(id: string): Promise<ValidationResult<GarageState>> {
    const state = (await this.repository.load()).state;
    const next = createGarageState({
      vehicles: state.vehicles,
      activeVehicleId: state.activeVehicleId,
      savedSetups: state.savedSetups.filter((setup) => setup.id !== id),
      clearanceProfiles: state.clearanceProfiles.map((profile) => profile.baselineSetupId === id ? { ...profile, baselineSetupId: null } : profile),
    });
    if (!next.ok) return next;
    return this.persist(next.value);
  }

  public async saveClearanceProfile(command: {
    readonly vehicleNickname: string;
    readonly baselineSetup: SetupInput;
    readonly baselineSetupId?: string | null;
    readonly measuredInnerClearanceMm: number;
    readonly measuredOuterClearanceMm: number;
    readonly minimumDesiredInnerClearanceMm: number | null;
    readonly minimumDesiredOuterClearanceMm: number | null;
  }): Promise<ValidationResult<GarageState>> {
    const baseline = createSetupFromInput(command.baselineSetup, 'baseline');
    if (!baseline.ok) return baseline;
    const loaded = await this.repository.load();
    const state = loaded.state;
    const now = this.dependencies.nowIso();
    let vehicleId = state.activeVehicleId;
    const vehicles = [...state.vehicles];
    if (vehicleId === null) {
      const vehicle = createVehicleProfile({ id: this.dependencies.createId(), displayName: command.vehicleNickname, createdAt: now, updatedAt: now });
      if (!vehicle.ok) return invalid(...vehicle.issues);
      vehicles.push(vehicle.value);
      vehicleId = vehicle.value.id;
    }
    const profile = createVehicleClearanceProfile({
      vehicleId,
      baselineSetupId: command.baselineSetupId ?? null,
      baselineSetup: baseline.value,
      measuredInnerClearanceMm: command.measuredInnerClearanceMm,
      measuredOuterClearanceMm: command.measuredOuterClearanceMm,
      minimumDesiredInnerClearanceMm: command.minimumDesiredInnerClearanceMm,
      minimumDesiredOuterClearanceMm: command.minimumDesiredOuterClearanceMm,
      updatedAt: now,
    });
    if (!profile.ok) return invalid(...profile.issues);
    const next = createGarageState({
      vehicles,
      activeVehicleId: vehicleId,
      savedSetups: state.savedSetups,
      clearanceProfiles: [...state.clearanceProfiles.filter((item) => item.vehicleId !== vehicleId), profile.value],
    });
    if (!next.ok) return next;
    return this.persist(next.value);
  }
}
