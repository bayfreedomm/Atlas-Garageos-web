import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { publishedCarModels } from '../../src/data/cars';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { VEHICLE_PHOTOS, vehiclePhotoPath } from '../../src/data/vehicle-photos';
import { carModelImage, vehicleImage } from '../../src/seo/vehicle-images';

describe('vehicle photos', () => {
  it('only lists curated vehicles, stored locally, with a free licence and an author', () => {
    const ids = new Set(vehicleFitmentData.map((vehicle) => vehicle.id));
    for (const [id, photo] of Object.entries(VEHICLE_PHOTOS)) {
      expect(ids.has(id), id).toBe(true);
      expect(existsSync(`public${vehiclePhotoPath(id)}`), id).toBe(true);
      expect(photo.license, id).toMatch(/^(CC BY(-SA)? \d\.\d( de)?|Public domain|CC0)$/);
      expect(photo.artist.length, id).toBeGreaterThan(1);
      expect(photo.page, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it('shows the Opel Corsa F photo with attribution on the vehicle and the model page', () => {
    const corsa = vehicleFitmentData.find((vehicle) => vehicle.id === 'opel-corsa')!;
    expect(VEHICLE_PHOTOS['opel-corsa']!.article).toBe('Opel Corsa F');
    const image = vehicleImage(corsa, 'tr');
    expect(image?.src).toBe('/img/car/opel-corsa.jpg');
    expect(image?.credit?.license).toMatch(/CC BY/);
    const model = publishedCarModels.find((m) => m.makeSlug === 'opel' && m.modelSlug === 'corsa');
    if (model) expect(carModelImage(model, 'de')?.src).toBe('/img/car/opel-corsa.jpg');
  });

  it('falls back to the bolt-pattern drawing when no generation photo exists', () => {
    const vehicle = vehicleFitmentData.find((candidate) => !VEHICLE_PHOTOS[candidate.id])!;
    const image = vehicleImage(vehicle, 'en');
    if (image) {
      expect(image.src).toMatch(/^\/img\/pcd\//);
      expect(image.credit).toBeUndefined();
    }
  });
});
