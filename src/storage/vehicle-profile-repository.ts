import type { VehicleProfile } from '../domain/vehicle';

export interface VehicleProfileRepository {
  list(): Promise<readonly VehicleProfile[]>;
  get(id: string): Promise<VehicleProfile | undefined>;
  save(profile: VehicleProfile): Promise<void>;
  remove(id: string): Promise<void>;
}

export const VEHICLE_PROFILE_STORAGE_VERSION = 1;
