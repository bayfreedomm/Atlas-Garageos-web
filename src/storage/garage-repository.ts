import type { GarageState } from '../domain/garage';

export type GarageLoadStatus = 'empty' | 'loaded' | 'migrated' | 'recovered-corrupt' | 'recovered-unsupported' | 'recovered-invalid';

export interface GarageLoadResult {
  readonly state: GarageState;
  readonly status: GarageLoadStatus;
}

export interface GarageRepository {
  load(): Promise<GarageLoadResult>;
  save(state: GarageState): Promise<void>;
}
