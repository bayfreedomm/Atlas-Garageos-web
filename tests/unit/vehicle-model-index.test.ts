import { describe, expect, it } from 'vitest';
import { vehicleMakes } from '../../src/data/vehicle-fitment';
import { VEHICLE_MODEL_INDEX, indexedModelsForMake, indexedVehicleMakes } from '../../src/data/vehicle-model-index';

describe('NHTSA-sourced vehicle name index', () => {
  it('exposes non-empty, deduplicated model lists for every indexed make', () => {
    for (const [make, models] of Object.entries(VEHICLE_MODEL_INDEX)) {
      expect(models.length).toBeGreaterThan(0);
      expect(new Set(models.map((model) => model.toLowerCase())).size).toBe(models.length);
      expect(make.trim()).toBe(make);
    }
  });

  it('resolves models case-insensitively and returns nothing for an unindexed make', () => {
    expect(indexedModelsForMake('toyota')).toEqual(indexedModelsForMake('TOYOTA'));
    expect(indexedModelsForMake('toyota').length).toBeGreaterThan(0);
    expect(indexedModelsForMake('Not A Real Make')).toEqual([]);
  });

  it('returns a sorted, deduplicated make list', () => {
    const makes = indexedVehicleMakes();
    expect([...makes]).toEqual([...makes].sort((a, b) => a.localeCompare(b)));
    expect(new Set(makes).size).toBe(makes.length);
  });

  it('shares exact make-name casing with the curated fitment dataset where both cover a make', () => {
    // e.g. 'SEAT' vs 'Seat', 'Volkswagen' vs 'VOLKSWAGEN' — a casing mismatch here would
    // silently duplicate a make in the Find My Vehicle dropdown instead of merging it.
    const curated = new Set(vehicleMakes());
    const indexed = new Set(indexedVehicleMakes());
    const overlapByLowercase = [...curated].filter((make) => [...indexed].some((other) => other.toLowerCase() === make.toLowerCase()));
    for (const make of overlapByLowercase) expect(indexed.has(make)).toBe(true);
  });
});
