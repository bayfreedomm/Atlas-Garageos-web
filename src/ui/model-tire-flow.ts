/**
 * Tire sizes for a car model page's Vehicle → Tire → Compare → Calculator table: the curated
 * vehicle rows' standard and factory-option sizes first, then sizes listed in the model's ANKUSI
 * wheel records (labelled "recorded" — the source does not say standard or option).
 */
import { curatedVehiclesFor, type CarModel } from '../data/cars';
import { ankusiTireSizes } from '../data/tire-comparisons';

export type FlowRole = 'standard' | 'option' | 'recorded';
export interface FlowSize { readonly notation: string; readonly role: FlowRole; }

export function modelFlowSizes(model: CarModel): readonly FlowSize[] {
  const sizes: FlowSize[] = [];
  const seen = new Set<string>();
  const push = (notation: string, role: FlowRole): void => { if (!seen.has(notation)) { seen.add(notation); sizes.push({ notation, role }); } };
  const curated = curatedVehiclesFor(model);
  for (const vehicle of curated) push(vehicle.tireSize, 'standard');
  for (const vehicle of curated) for (const option of vehicle.optionalTireSizes ?? []) push(option, 'option');
  const newestFirst = model.wheels.slice().sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  for (const row of newestFirst) for (const notation of ankusiTireSizes(row[11])) push(notation, 'recorded');
  return Object.freeze(sizes);
}
