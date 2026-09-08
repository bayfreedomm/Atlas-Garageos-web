import { describe, expect, it } from 'vitest';
import { createGarageState, createSavedSetup, createVehicleProfile } from '../../src/domain/garage';
import { createSetupFromInput } from '../../src/features/compare/compare-setups';
import { GarageService } from '../../src/features/garage/garage-service';
import { decodeSetupShare, encodeSetupShare, type SetupShareV1 } from '../../src/features/share/setup-share';
import { InMemoryGarageRepository } from '../../src/storage/in-memory-garage-repository';

const daily = { tireWidthMm: 225, tireAspectRatio: 45, rimDiameterInches: 18, wheelWidthInches: 8, wheelOffsetMm: 40 } as const;
const winter = { tireWidthMm: 205, tireAspectRatio: 55, rimDiameterInches: 17, wheelWidthInches: 7.5, wheelOffsetMm: 42 } as const;

function service(repository = new InMemoryGarageRepository()) {
  let sequence = 0;
  return new GarageService(repository, {
    createId: () => `generated-${++sequence}`,
    nowIso: () => '2026-09-08T10:00:00.000Z',
  });
}

describe('garage service', () => {
  it('stores multiple named setups and deletes one', async () => {
    const garage = service();
    expect((await garage.saveSetup({ name: 'Daily', vehicleNickname: 'Atlas Car', setup: daily })).ok).toBe(true);
    expect((await garage.saveSetup({ name: 'Winter', vehicleNickname: 'Ignored after vehicle exists', setup: winter })).ok).toBe(true);
    expect((await garage.load()).state.savedSetups.map((item) => item.name)).toEqual(['Daily', 'Winter']);

    const state = (await garage.load()).state;
    const afterDelete = await garage.deleteSetup(state.savedSetups[0]!.id);
    expect(afterDelete.savedSetups.map((item) => item.name)).toEqual(['Winter']);
  });

  it('does not mutate garage when a shared setup is decoded, but saves explicitly', async () => {
    const repository = new InMemoryGarageRepository();
    const garage = service(repository);
    const payload: SetupShareV1 = { v: 1, current: daily, proposed: winter };
    const decoded = decodeSetupShare(encodeSetupShare(payload));
    expect(decoded.ok).toBe(true);
    expect((await garage.load()).state.savedSetups).toHaveLength(0);
    if (!decoded.ok) throw new Error('Fixture must decode');

    const saved = await garage.saveSharedSetup(decoded.value, 'Shared winter', 'Atlas Car');
    expect(saved.ok).toBe(true);
    expect((await garage.load()).state.savedSetups[0]?.name).toBe('Shared winter');
  });

  it('supports multiple vehicle profiles and their setups at domain level', () => {
    const timestamp = '2026-09-08T10:00:00.000Z';
    const first = createVehicleProfile({ id: 'car-1', displayName: 'Daily car', createdAt: timestamp, updatedAt: timestamp });
    const second = createVehicleProfile({ id: 'car-2', displayName: 'Project car', createdAt: timestamp, updatedAt: timestamp });
    const validSetup = createSetupFromInput(daily);
    if (!first.ok || !second.ok || !validSetup.ok) throw new Error('Fixtures must be valid');
    const firstSetup = createSavedSetup({ id: 'setup-1', vehicleId: 'car-1', name: 'Daily', setup: validSetup.value, createdAt: timestamp, updatedAt: timestamp });
    const secondSetup = createSavedSetup({ id: 'setup-2', vehicleId: 'car-2', name: 'Stock', setup: validSetup.value, createdAt: timestamp, updatedAt: timestamp });
    if (!firstSetup.ok || !secondSetup.ok) throw new Error('Saved setup fixtures must be valid');
    const state = createGarageState({ vehicles: [first.value, second.value], activeVehicleId: 'car-2', savedSetups: [firstSetup.value, secondSetup.value] });
    expect(state.ok).toBe(true);
    if (state.ok) {
      expect(state.value.vehicles).toHaveLength(2);
      expect(state.value.savedSetups.map((item) => item.vehicleId)).toEqual(['car-1', 'car-2']);
    }
  });
});
