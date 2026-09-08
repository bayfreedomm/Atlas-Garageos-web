import { createEmptyGarageState, type GarageState } from '../domain/garage';
import type { GarageLoadResult, GarageRepository } from './garage-repository';
import { deserializeGarageState, serializeGarageState } from './garage-serialization';

export const GARAGE_STORAGE_KEY = 'atlas-garageos:garage';

export interface StringStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class LocalStorageGarageRepository implements GarageRepository {
  public constructor(
    private readonly storage: StringStorage,
    private readonly key = GARAGE_STORAGE_KEY,
  ) {}

  public async load(): Promise<GarageLoadResult> {
    try {
      const result = deserializeGarageState(this.storage.getItem(this.key));
      if (result.status === 'migrated') {
        try { this.storage.setItem(this.key, serializeGarageState(result.state)); } catch { /* Keep the valid in-memory migration. */ }
      }
      return result;
    } catch {
      return { state: createEmptyGarageState(), status: 'recovered-corrupt' };
    }
  }

  public async save(state: GarageState): Promise<void> {
    this.storage.setItem(this.key, serializeGarageState(state));
  }
}

export function createBrowserGarageRepository(): GarageRepository {
  return new LocalStorageGarageRepository(window.localStorage);
}
