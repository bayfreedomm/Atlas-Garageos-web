import { createGarageState, createSavedSetup, createVehicleProfile, type GarageState } from '../../domain/garage';
import type { ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import type { GarageLoadResult, GarageRepository } from '../../storage/garage-repository';
import { createSetupFromInput, type SetupInput } from '../compare/compare-setups';
import type { SetupShareV1 } from '../share/setup-share';

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
    const next = createGarageState({ vehicles, activeVehicleId: vehicleId, savedSetups: [...state.savedSetups, savedSetup.value] });
    if (!next.ok) return next;
    await this.repository.save(next.value);
    return valid(next.value);
  }

  public saveSharedSetup(shared: SetupShareV1, name: string, vehicleNickname: string): Promise<ValidationResult<GarageState>> {
    return this.saveSetup({ name, vehicleNickname, setup: shared.proposed });
  }

  public async deleteSetup(id: string): Promise<GarageState> {
    const state = (await this.repository.load()).state;
    const next = createGarageState({
      vehicles: state.vehicles,
      activeVehicleId: state.activeVehicleId,
      savedSetups: state.savedSetups.filter((setup) => setup.id !== id),
    });
    if (!next.ok) return state;
    await this.repository.save(next.value);
    return next.value;
  }
}
