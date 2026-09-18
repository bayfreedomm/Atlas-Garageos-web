/**
 * Broader make/model name coverage for Find My Vehicle, sourced from NHTSA's
 * public vPIC API (https://vpic.nhtsa.dot.gov/api/ — US Department of
 * Transportation open data, free to use in third-party apps and databases;
 * no OEM tire/wheel fitment values are published by NHTSA, only vehicle
 * identity names).
 *
 * This is NAME coverage only — it lets a visitor find and select a model that
 * is not yet in `vehicle-fitment.ts`'s curated 30-vehicle fitment dataset,
 * instead of not finding their car at all. When a selected model has no
 * matching fitment entry, the UI must show an honest "not verified yet"
 * state and point to the manual Tire Size / Bolt Pattern calculators — it
 * must never guess a tire size or bolt pattern for these models.
 *
 * The raw NHTSA response per make mixes passenger cars with motorcycles,
 * medium/heavy trucks, trailers, and even non-vehicle manufacturer records
 * (transport/chassis builders sharing a brand name). Each list below has been
 * manually filtered down to mainstream passenger car/SUV/pickup nameplates
 * for that reason — this is curation, not a raw API dump.
 *
 * Snapshot date: 2026-09-18. NHTSA's live data will keep adding newer model
 * years; this list is a starting point, not an auto-syncing feed.
 */

export const VEHICLE_MODEL_INDEX: Readonly<Record<string, readonly string[]>> = Object.freeze({
  Toyota: ['Corolla', 'Corolla Cross', 'Camry', 'Prius', 'Prius Prime', 'Yaris', 'Avalon', 'RAV4', 'Highlander', 'Grand Highlander', '4Runner', 'Land Cruiser', 'Sequoia', 'Tacoma', 'Tundra', 'Sienna', 'Venza', 'C-HR', 'GR86', 'GR Corolla', 'Supra', 'Crown', 'Crown Signia', 'bZ4X', 'Mirai'],
  Honda: ['Civic', 'Civic Si', 'Civic Type R', 'Accord', 'Insight', 'Fit', 'HR-V', 'CR-V', 'Passport', 'Pilot', 'Ridgeline', 'Odyssey', 'Element', 'S2000', 'Clarity', 'Prologue'],
  Ford: ['Fiesta', 'Focus', 'Fusion', 'Mustang', 'Mustang Mach-E', 'Taurus', 'EcoSport', 'Escape', 'Edge', 'Explorer', 'Expedition', 'Bronco', 'Bronco Sport', 'Maverick', 'Ranger', 'F-150', 'Transit Connect', 'Transit', 'C-Max'],
  Volkswagen: ['Golf', 'Golf GTI', 'Golf R', 'Golf Alltrack', 'Jetta', 'Jetta GLI', 'Passat', 'Beetle', 'CC', 'Arteon', 'Tiguan', 'Atlas', 'Atlas Cross Sport', 'Taos', 'Touareg', 'ID.4', 'ID. Buzz'],
  BMW: ['128i', '228i', '320i', '328i', '330i', '340i', 'M3', 'M4', '428i', '430i', '440i', '528i', '530i', '540i', 'M5', '640i', '740i', '750i', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'i7', 'i8', 'iX', 'M2'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA-Class', 'CLS-Class', 'CLE', 'GLA-Class', 'GLB-Class', 'GLC-Class', 'GLE-Class', 'GLS-Class', 'G-Class', 'SL-Class', 'AMG GT', 'Sprinter', 'Metris', 'EQB-Class', 'EQE-Class Sedan', 'EQS-Class Sedan'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'S3', 'S4', 'S5', 'S6', 'S8', 'RS 3', 'RS 5', 'RS 6', 'RS 7', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'TT', 'TTS', 'R8', 'e-tron', 'e-tron GT'],
  Hyundai: ['Accent', 'Elantra', 'Elantra N', 'Sonata', 'Veloster', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Ioniq 9', 'Venue', 'Kona', 'Kona N', 'Tucson', 'Santa Fe', 'Santa Cruz', 'Palisade', 'Genesis'],
  Kia: ['Rio', 'Forte', 'K4', 'K5', 'Optima', 'Soul', 'Niro', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Carnival', 'Stinger', 'EV6', 'EV9', 'EV3'],
  Nissan: ['Versa', 'Sentra', 'Altima', 'Maxima', 'Z', 'Leaf', 'Kicks', 'Juke', 'Rogue', 'Murano', 'X-Trail', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Ariya'],
  Chevrolet: ['Spark', 'Sonic', 'Cruze', 'Malibu', 'Impala', 'Camaro', 'Corvette', 'Bolt EV', 'Bolt EUV', 'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Silverado'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda5', 'Mazda6', 'MX-5', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'CX-90', 'CX-70', 'MX-30'],
  Subaru: ['Impreza', 'Legacy', 'WRX', 'BRZ', 'Crosstrek', 'Forester', 'Outback', 'Ascent', 'Solterra'],
  Volvo: ['S60', 'S90', 'V60', 'V90', 'C30', 'C40', 'XC40', 'XC60', 'XC90', 'EX30', 'EX90'],
  Fiat: ['500', '500X', '500L', 'Panda', 'Tipo', 'Punto'],
  Renault: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Talisman', 'Zoe'],
  Peugeot: ['208', '308', '2008', '3008', '5008', '508'],
  Opel: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland'],
  SEAT: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
});

const normalizedMakeIndex: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.keys(VEHICLE_MODEL_INDEX).map((make) => [make.toLowerCase(), make])),
);

/** All make names covered by the name index, sorted for display. */
export function indexedVehicleMakes(): readonly string[] {
  return Object.freeze(Object.keys(VEHICLE_MODEL_INDEX).sort((a, b) => a.localeCompare(b)));
}

/** Model names for a make, resolved case-insensitively; empty if the make isn't indexed. */
export function indexedModelsForMake(make: string): readonly string[] {
  const resolved = normalizedMakeIndex[make.toLowerCase()];
  return resolved ? VEHICLE_MODEL_INDEX[resolved]! : Object.freeze([]);
}
