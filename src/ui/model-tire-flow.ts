/**
 * Tire sizes for a car model page's Vehicle → Tire → Compare → Calculator table: the curated
 * vehicle rows' standard and factory-option sizes first, then sizes listed in the model's ANKUSI
 * wheel records (labelled "recorded" — the source does not say standard or option).
 */
import { curatedVehiclesFor, type CarModel } from '../data/cars';
import { ankusiTireSizes } from '../data/tire-comparisons';

export type FlowRole = 'standard' | 'option' | 'recorded';
export interface FlowSize { readonly notation: string; readonly role: FlowRole; /** Which curated vehicle a standard/option size belongs to, e.g. "Mégane (IV facelift) 2020–2025". */ readonly source?: string }

export function modelFlowSizes(model: CarModel): readonly FlowSize[] {
  const sizes: FlowSize[] = [];
  const seen = new Set<string>();
  const push = (notation: string, role: FlowRole, source?: string): void => { if (!seen.has(notation)) { seen.add(notation); sizes.push(source ? { notation, role, source } : { notation, role }); } };
  const curated = curatedVehiclesFor(model);
  const sourceOf = (vehicle: (typeof curated)[number]): string => `${vehicle.model} ${vehicle.generation}`;
  for (const vehicle of curated) push(vehicle.tireSize, 'standard', sourceOf(vehicle));
  for (const vehicle of curated) for (const option of vehicle.optionalTireSizes ?? []) push(option, 'option', sourceOf(vehicle));
  const newestFirst = model.wheels.slice().sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  for (const row of newestFirst) for (const notation of ankusiTireSizes(row[11])) push(notation, 'recorded');
  return Object.freeze(sizes);
}
