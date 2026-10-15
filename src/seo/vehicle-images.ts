/**
 * Page image for vehicle and car-model pages: the licensed photo of the exact generation when
 * src/data/vehicle-photos.ts has one, otherwise Atlas's bolt-pattern drawing for the vehicle's
 * pattern. One file per vehicle, shared by all locales.
 */
import { boltPatternCatalog } from '../data/bolt-pattern-catalog';
import { type CarModel, curatedVehiclesFor, newestFirst } from '../data/cars';
import type { VehicleFitment } from '../data/vehicle-fitment';
import { VEHICLE_PHOTOS, vehiclePhotoPath } from '../data/vehicle-photos';
import { ENTITY_IMAGE_HEIGHT, ENTITY_IMAGE_WIDTH, boltPatternImage, type PageImage } from './entity-images';
import type { EntityLocale } from './entity-routes';

const byNotation = new Map(boltPatternCatalog.map((entry) => [entry.notation, entry]));

function photoFor(vehicle: VehicleFitment): PageImage | undefined {
  const photo = VEHICLE_PHOTOS[vehicle.id];
  if (!photo) return undefined;
  return Object.freeze({
    src: vehiclePhotoPath(vehicle.id),
    width: ENTITY_IMAGE_WIDTH,
    height: ENTITY_IMAGE_HEIGHT,
    alt: `${vehicle.make} ${vehicle.model} (${vehicle.generation})`,
    credit: Object.freeze({ artist: photo.artist, license: photo.license, licenseUrl: photo.licenseUrl, page: photo.page }),
  });
}

const patternImage = (notation: string | null | undefined, locale: EntityLocale): PageImage | undefined => {
  const entry = notation ? byNotation.get(notation) : undefined;
  return entry ? boltPatternImage(entry, locale) : undefined;
};

export const vehicleImage = (vehicle: VehicleFitment, locale: EntityLocale): PageImage | undefined =>
  photoFor(vehicle) ?? patternImage(vehicle.boltPattern, locale);

/** Model pages: the newest curated generation with a photo, else the newest recorded bolt pattern. */
export function carModelImage(model: CarModel, locale: EntityLocale): PageImage | undefined {
  for (const vehicle of curatedVehiclesFor(model)) {
    const photo = photoFor(vehicle);
    if (photo) return photo;
  }
  return patternImage(newestFirst(model.wheels, (row) => row[4])[0], locale);
}
