/** Titles, descriptions and shared view helpers for the /cars/ page family (English). */
import { boltPatternCatalog } from '../data/bolt-pattern-catalog';
import { entityDetailPath } from '../seo/entity-routes';
import { type CarModel, type EpaVariant, type WheelRow, epaYears, mpgSummary, newestFirst } from '../data/cars';

const TITLE_BUDGET = 58; // 75 minus " — Atlas GarageOS"; '&' is never used, so no &amp; inflation.

const renderedLength = (text: string): number => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').length;

export function fit(candidates: readonly string[]): string {
  // Measured as rendered: & and " become &amp; / &quot; in the <title>.
  const hit = candidates.find((candidate) => renderedLength(candidate) <= TITLE_BUDGET);
  if (hit) return hit;
  const last = candidates[candidates.length - 1]!;
  return `${last.slice(0, TITLE_BUDGET - 1).trimEnd()}…`;
}

export function fitDescription(text: string): string {
  return text.length <= 178 ? text : `${text.slice(0, 176).replace(/\s+\S*$/, '')}…`;
}

export const carName = (model: CarModel): string => `${model.make} ${model.model}`;

export function carYearTitle(model: CarModel, year: number, hasWheels: boolean): string {
  const base = `${year} ${carName(model)}`;
  return fit([
    ...(hasWheels ? [`${base} MPG, Fuel Cost and Bolt Pattern`] : []),
    `${base} MPG and Fuel Cost`,
    `${base} MPG`,
    `${year} ${model.model} MPG`,
  ]);
}

export function carYearDescription(model: CarModel, year: number, variants: readonly EpaVariant[], wheelPcd: string | undefined): string {
  const s = mpgSummary(variants);
  const mpg = s.best === null ? '' : s.best === s.worst ? `${s.best} MPG combined` : `${s.worst}–${s.best} MPG combined`;
  return fitDescription(`${year} ${carName(model)}: ${mpg}${mpg ? ', ' : ''}city and highway MPG for ${variants.length} ${variants.length === 1 ? 'version' : 'versions'}, annual fuel cost at today's gas price${wheelPcd ? `, bolt pattern ${wheelPcd}` : ''}. EPA data.`);
}

export function carModelTitle(model: CarModel): string {
  const name = carName(model);
  const epa = Object.keys(model.epa).length > 0;
  const wheels = model.wheels.length > 0;
  if (epa && wheels) return fit([`${name} MPG by Year, Bolt Pattern and Wheel Size`, `${name} MPG by Year and Bolt Pattern`, `${name} MPG and Bolt Pattern`, `${name} Specs`]);
  if (epa) return fit([`${name} MPG and Fuel Cost by Year`, `${name} MPG by Year`, `${name} MPG`]);
  const pcd = newestFirst(model.wheels, (row) => row[4]).slice(0, 2).join(' / ');
  return fit([...(pcd ? [`${name} Bolt Pattern ${pcd}, Center Bore and Wheel Size`, `${name} Bolt Pattern: ${pcd}`] : []), `${name} Bolt Pattern, Center Bore and Wheel Size`, `${name} Bolt Pattern and Wheel Size`, `${name} Bolt Pattern`]);
}

export function carModelDescription(model: CarModel): string {
  const years = epaYears(model);
  const pcd = newestFirst(model.wheels, (row) => row[4]);
  const parts: string[] = [];
  if (years.length) parts.push(`EPA fuel economy for ${years.length} model ${years.length === 1 ? 'year' : 'years'} (${years[0]}–${years[years.length - 1]})`);
  if (pcd.length) parts.push(`bolt pattern ${pcd.slice(0, 2).join(' / ')}, center bore, factory and maximum wheel sizes`);
  return fitDescription(`${carName(model)}: ${parts.join('; ')}. Sourced from open data.`);
}

export const boltSlugFor = (pcd: string | null | undefined): string | undefined => {
  if (!pcd) return undefined;
  return boltPatternCatalog.find((entry) => entry.notation === pcd)?.slug;
};

export const boltHref = (pcd: string | null | undefined): string | undefined => {
  const slug = boltSlugFor(pcd);
  return slug ? entityDetailPath('bolt-pattern', 'en', slug) : undefined;
};

/** "17x7.0J ET45" style cleanup of the source's factory wheel text. */
export function wheelText(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace(/^F\/R:\s*/i, '').replace(/ at ET/i, ' ET').replace(/\s+offset, front and rear$/i, '').replace(/\s+F\/R$/i, '').trim();
}

export const yearsText = (row: WheelRow): string => row[1] && row[2] && row[1] !== row[2] ? `${row[1]}–${row[2]}` : String(row[1] ?? '—');

export const usd = (value: number): string => `$${value.toLocaleString('en-US')}`;
