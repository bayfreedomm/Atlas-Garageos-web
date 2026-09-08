import { describe, expect, it } from 'vitest';
import { GARAGE_SCHEMA_VERSION } from '../../src/domain/garage';
import { GarageService } from '../../src/features/garage/garage-service';
import { LocalStorageGarageRepository, GARAGE_STORAGE_KEY, type StringStorage } from '../../src/storage/local-storage-garage-repository';

class MemoryStorage implements StringStorage {
  public readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

const setup = {
  tireWidthMm: 225,
  tireAspectRatio: 45,
  rimDiameterInches: 18,
  wheelWidthInches: 8,
  wheelOffsetMm: 40,
} as const;

const dependencies = () => {
  let id = 0;
  return { createId: () => `id-${++id}`, nowIso: () => '2026-09-08T09:00:00.000Z' };
};

describe('garage storage', () => {
  it('round-trips and loads after a repository is reopened', async () => {
    const storage = new MemoryStorage();
    const first = new GarageService(new LocalStorageGarageRepository(storage), dependencies());
    const saved = await first.saveSetup({ name: 'Daily', vehicleNickname: 'Roadster', setup });
    expect(saved.ok).toBe(true);

    const reopened = new LocalStorageGarageRepository(storage);
    const loaded = await reopened.load();
    expect(loaded.status).toBe('loaded');
    expect(loaded.state.schemaVersion).toBe(GARAGE_SCHEMA_VERSION);
    expect(loaded.state.vehicles[0]?.displayName).toBe('Roadster');
    expect(loaded.state.savedSetups[0]?.name).toBe('Daily');
    expect(loaded.state.savedSetups[0]?.setup.tire.widthMm).toBe(225);
  });

  it('recovers safely from corrupted JSON', async () => {
    const storage = new MemoryStorage();
    storage.values.set(GARAGE_STORAGE_KEY, '{broken');
    const loaded = await new LocalStorageGarageRepository(storage).load();
    expect(loaded.status).toBe('recovered-corrupt');
    expect(loaded.state.savedSetups).toEqual([]);
  });

  it('recovers safely from unsupported and invalid schemas', async () => {
    const storage = new MemoryStorage();
    storage.values.set(GARAGE_STORAGE_KEY, JSON.stringify({ schemaVersion: 99, vehicles: [], activeVehicleId: null, savedSetups: [] }));
    expect((await new LocalStorageGarageRepository(storage).load()).status).toBe('recovered-unsupported');

    storage.values.set(GARAGE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, vehicles: 'invalid', activeVehicleId: null, savedSetups: [] }));
    expect((await new LocalStorageGarageRepository(storage).load()).status).toBe('recovered-invalid');
  });
});
