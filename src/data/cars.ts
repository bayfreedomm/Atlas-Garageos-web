/**
 * Car model reference built from two open datasets (see scripts/build-cars-data.py):
 *  - U.S. EPA / DOE fuel economy data (fueleconomy.gov, public domain): one variant per
 *    engine/transmission/drive configuration and model year.
 *  - ANKUSI Wheel Fitment Dataset (CC BY 4.0): bolt pattern, center bore, factory wheel,
 *    flush-fit and maximum wheel per vehicle variant.
 * Both are grouped by make and base model into src/data/generated/cars.json. It is loaded with
 * import.meta.glob (typed as unknown) so the type checker never has to infer an 8 MB JSON literal.
 */
import { vehicleFitmentData, type VehicleFitment } from './vehicle-fitment';
import fuelPrices from './fuel-prices.json';

/** [variant name, displacement L, cylinders, drive, transmission, fuel, city, highway, combined, EPA annual cost $, EV range mi, EV motor, charger bits (1 turbo, 2 super), EPA class] */
export type EpaVariant = readonly [string, number | null, number | null, string, string, string, number | null, number | null, number | null, number | null, number | null, string, number, string];
/** [variant name, year from, year to, chassis code, PCD, center bore mm, rear center bore mm, lug count, factory wheel, flush-fit wheel, maximum wheel, tire sizes, region tag, source URL] */
export type WheelRow = readonly [string, number | null, number | null, string | null, string | null, number | null, number | null, number | null, string | null, string | null, string | null, string | null, string | null, string];

export interface CarModel {
  readonly make: string;
  readonly makeSlug: string;
  readonly model: string;
  readonly modelSlug: string;
  readonly epa: Readonly<Record<string, readonly EpaVariant[]>>;
  readonly wheels: readonly WheelRow[];
}

/** Year pages are published from this model year on; older years appear in the model page table. */
export const CAR_YEAR_PAGE_MIN = 2000;

export const EPA_SOURCE = { name: 'U.S. EPA / DOE — fueleconomy.gov', url: 'https://www.fueleconomy.gov/feg/download.shtml' } as const;
export const ANKUSI_SOURCE = { name: 'ANKUSI Wheel Fitment Dataset (CC BY 4.0)', url: 'https://github.com/david025445/ankusi-wheel-fitment-data' } as const;

function load(): readonly CarModel[] {
  const files = import.meta.glob('./generated/cars.json', { eager: true, import: 'default' });
  const data = files['./generated/cars.json'];
  if (!Array.isArray(data)) throw new Error('src/data/generated/cars.json is missing — run scripts/build-cars-data.py');
  return Object.freeze(data as CarModel[]);
}

export const carModels: readonly CarModel[] = load();

const byKey = new Map(carModels.map((model) => [`${model.makeSlug}/${model.modelSlug}`, model]));

export interface CarMake { readonly make: string; readonly makeSlug: string; readonly models: readonly CarModel[]; }

export const carMakes: readonly CarMake[] = (() => {
  const groups = new Map<string, CarModel[]>();
  for (const model of carModels) {
    const list = groups.get(model.makeSlug);
    if (list) list.push(model); else groups.set(model.makeSlug, [model]);
  }
  return Object.freeze([...groups.values()].map((models) => ({ make: models[0]!.make, makeSlug: models[0]!.makeSlug, models: Object.freeze(models.slice().sort((a, b) => a.model.localeCompare(b.model))) }))
    .sort((a, b) => a.make.localeCompare(b.make)));
})();

const makeBySlug = new Map(carMakes.map((make) => [make.makeSlug, make]));

export const carModelByKey = (makeSlug: string, modelSlug: string): CarModel | undefined => byKey.get(`${makeSlug}/${modelSlug}`);
export const carMakeBySlug = (makeSlug: string): CarMake | undefined => makeBySlug.get(makeSlug);

export const carMakePath = (makeSlug: string): string => `/cars/${makeSlug}/`;
export const carModelPath = (model: CarModel): string => `/cars/${model.makeSlug}/${model.modelSlug}/`;
export const carYearPath = (model: CarModel, year: number | string): string => `/cars/${model.makeSlug}/${model.modelSlug}/${year}/`;

export const epaYears = (model: CarModel): readonly number[] => Object.keys(model.epa).map(Number).sort((a, b) => a - b);
export const yearPageYears = (model: CarModel): readonly number[] => epaYears(model).filter((year) => year >= CAR_YEAR_PAGE_MIN);

/** Wheel rows recorded for exactly this model year. */
export function wheelRowsForYear(model: CarModel, year: number): readonly WheelRow[] {
  return model.wheels.filter((row) => (row[1] ?? 0) <= year && year <= (row[2] ?? row[1] ?? 0));
}

/** Distinct, most frequent first. */
export function frequent<T>(values: readonly (T | null | undefined)[]): readonly T[] {
  const counts = new Map<T, number>();
  for (const value of values) if (value !== null && value !== undefined && value !== '') counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
}

export interface MpgSummary { readonly best: number | null; readonly worst: number | null; readonly bestCity: number | null; readonly bestHighway: number | null; readonly electric: boolean; }

export function mpgSummary(variants: readonly EpaVariant[]): MpgSummary {
  const combined = variants.map((v) => v[8]).filter((n): n is number => n !== null && n > 0);
  const city = variants.map((v) => v[6]).filter((n): n is number => n !== null && n > 0);
  const highway = variants.map((v) => v[7]).filter((n): n is number => n !== null && n > 0);
  return {
    best: combined.length ? Math.max(...combined) : null,
    worst: combined.length ? Math.min(...combined) : null,
    bestCity: city.length ? Math.max(...city) : null,
    bestHighway: highway.length ? Math.max(...highway) : null,
    electric: variants.some((v) => v[5].startsWith('Electricity')),
  };
}

/** U.S. MPG to L/100 km. */
export const mpgToL100 = (mpg: number): number => 235.214583 / mpg;

export const engineLabel = (v: EpaVariant): string => {
  if (v[5].startsWith('Electricity')) return v[11] ? `Electric (${v[11]})` : 'Electric';
  const parts = [v[1] !== null ? `${v[1].toFixed(1)} L` : '', v[2] !== null ? `${v[2]}-cyl` : '', v[12] & 1 ? 'turbo' : '', v[12] & 2 ? 'supercharged' : ''].filter(Boolean);
  return parts.join(' ') || '—';
};


const normName = (value: string): string => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');

/** Curated Atlas vehicle pages (tire size, torque) for the same make and model, if any. */
export function curatedVehiclesFor(model: CarModel): readonly VehicleFitment[] {
  const target = normName(model.model);
  if (target.length < 2) return [];
  return vehicleFitmentData.filter((vehicle) => normName(vehicle.make) === normName(model.make) && normName(vehicle.model.replace(/\s*\(.*$/, '')) === target);
}

/** Annual fuel cost at today's U.S. average price, 15,000 miles a year; regular gasoline and diesel only. */
export const ANNUAL_MILES = 15000;
const usProducts = fuelPrices.us.products as readonly { readonly id: string; readonly valuePerGallon: number }[];
export const usFuelPrice = {
  regular: usProducts.find((product) => product.id === 'regular')?.valuePerGallon ?? null,
  diesel: usProducts.find((product) => product.id === 'diesel')?.valuePerGallon ?? null,
  weekOf: fuelPrices.us.weekOf as string,
};

export function annualFuelCost(variant: EpaVariant): number | null {
  const mpg = variant[8];
  if (mpg === null || mpg <= 0) return null;
  const price = variant[5] === 'Regular Gasoline' ? usFuelPrice.regular : variant[5] === 'Diesel' ? usFuelPrice.diesel : null;
  return price === null ? null : Math.round((ANNUAL_MILES / mpg) * price);
}

/** The /cars/ model page for a curated Atlas vehicle, if the open data has the same make and model. */
export function carModelForVehicle(vehicle: VehicleFitment): CarModel | undefined {
  const make = normName(vehicle.make);
  const model = normName(vehicle.model.replace(/\s*\(.*$/, ''));
  return carModels.find((candidate) => normName(candidate.make) === make && normName(candidate.model) === model);
}
