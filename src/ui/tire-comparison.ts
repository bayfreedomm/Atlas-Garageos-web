/**
 * Page model for the "X vs Y" tire-size comparison pages: figures, metadata and the vehicles
 * that carry either size. Server-only (reads the ANKUSI car dataset through tire-comparisons).
 */
import { tireComparisonText, type ComparisonFigures, type Side } from '../content/tire-comparison-text';
import { tireSizePageText } from '../content/entity-page-text';
import type { CarModel } from '../data/cars';
import { ankusiTireSizes, carModelsForTireSize, type TireComparisonPair } from '../data/tire-comparisons';
import { vehiclesForTireSize, type TireSizeEntry } from '../data/tire-size-catalog';
import type { VehicleFitment } from '../data/vehicle-fitment';
import { entityAlternates, entityDetailPath, entityHubPath, type EntityLocale } from '../seo/entity-routes';
import { displayTireNotation, homePath, SIMILAR_DIAMETER_TOLERANCE_PERCENT, tireSizeMetrics, type EntityPageMeta } from './entity-page-model';
import { carName } from './car-pages';
import { formatDecimal, formatPercent } from './locale-format';

const side = (a: number, b: number, epsilon: number): Side => (Math.abs(b - a) < epsilon ? 'equal' : b > a ? 'b' : 'a');

export interface ComparisonVehicles {
  readonly both: readonly string[];
  readonly curatedA: readonly VehicleFitment[];
  readonly curatedB: readonly VehicleFitment[];
  readonly modelsA: readonly CarModel[];
  readonly modelsB: readonly CarModel[];
  /** Vehicle rows and ANKUSI models that list both sizes (shown first, named in the FAQ). */
  readonly curatedBoth: readonly VehicleFitment[];
  readonly modelsBoth: readonly CarModel[];
}

const sizesOf = (vehicle: VehicleFitment): readonly string[] => [vehicle.tireSize, ...(vehicle.optionalTireSizes ?? [])];

export function comparisonVehicles(pair: TireComparisonPair): ComparisonVehicles {
  const curatedA = vehiclesForTireSize(pair.a.notation);
  const curatedB = vehiclesForTireSize(pair.b.notation);
  const curatedBoth = curatedA.filter((vehicle) => sizesOf(vehicle).includes(pair.b.notation));
  const candidatesB = new Set(carModelsForTireSize(pair.b.notation));
  const modelsBoth = carModelsForTireSize(pair.a.notation).filter((model) => candidatesB.has(model) && model.wheels.some((row) => {
    const sizes = ankusiTireSizes(row[11]);
    return sizes.includes(pair.a.notation) && sizes.includes(pair.b.notation);
  }));
  const both = [...curatedBoth.map((vehicle) => `${vehicle.make} ${vehicle.model}`), ...modelsBoth.map(carName)];
  // A vehicle is listed once per page: under "both sizes" if it has both, otherwise under the
  // first size it is found on. Curated rows win over ANKUSI models with the same name.
  const seen = new Set<string>();
  const keep = <T,>(items: readonly T[], name: (item: T) => string): T[] => items.filter((item) => {
    const key = name(item).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const curatedName = (vehicle: VehicleFitment): string => `${vehicle.make} ${vehicle.model}`;
  const keptCuratedBoth = keep(curatedBoth, curatedName);
  const keptModelsBoth = keep(modelsBoth, carName);
  const baseName = (name: string): string => name.replace(/\s*\(.*\)\s*$/, '');
  const keptCuratedA = keep(curatedA.filter((vehicle) => !curatedBoth.includes(vehicle)), curatedName);
  const keptCuratedB = keep(curatedB.filter((vehicle) => !curatedBoth.includes(vehicle)), curatedName);
  for (const vehicle of [...keptCuratedBoth, ...keptCuratedA, ...keptCuratedB]) seen.add(baseName(curatedName(vehicle)).toLowerCase());
  return Object.freeze({
    both: Object.freeze([...new Set(both)]),
    curatedA: keptCuratedA,
    curatedB: keptCuratedB,
    modelsA: keep(carModelsForTireSize(pair.a.notation).filter((model) => !modelsBoth.includes(model)), carName),
    modelsB: keep(carModelsForTireSize(pair.b.notation).filter((model) => !modelsBoth.includes(model)), carName),
    curatedBoth: keptCuratedBoth,
    modelsBoth: keptModelsBoth,
  });
}

export interface ComparisonModel {
  readonly figures: ComparisonFigures;
  readonly metricsA: ReturnType<typeof tireSizeMetrics>;
  readonly metricsB: ReturnType<typeof tireSizeMetrics>;
  /** Indicated → true speed rows (speedometer calibrated for A). */
  readonly speedRows: readonly { readonly indicated: string; readonly actual: string }[];
  readonly ratio: number;
}

export function comparisonModel(pair: TireComparisonPair, locale: EntityLocale, vehicles: ComparisonVehicles = comparisonVehicles(pair)): ComparisonModel {
  const metricsA = tireSizeMetrics(pair.a);
  const metricsB = tireSizeMetrics(pair.b);
  const ratio = metricsB.overallDiameterMm / metricsA.overallDiameterMm;
  const pct = Math.abs(ratio - 1) * 100;
  const speedBase = tireSizePageText[locale].speedBase;
  const speeds = speedBase.unit === 'mph' ? [30, 45, 60, 75] : [50, 80, 100, 130];
  const sharedNames = vehicles.both.slice(0, 6).join(', ');
  const figures: ComparisonFigures = Object.freeze({
    a: displayTireNotation(pair.a.notation, locale),
    b: displayTireNotation(pair.b.notation, locale),
    diameterA: formatDecimal(metricsA.overallDiameterMm, 0, locale),
    diameterB: formatDecimal(metricsB.overallDiameterMm, 0, locale),
    diameterPct: formatPercent(pct, 1, locale),
    diameterMm: formatDecimal(Math.abs(metricsB.overallDiameterMm - metricsA.overallDiameterMm), 1, locale),
    widthMm: formatDecimal(Math.abs(metricsB.sectionWidthMm - metricsA.sectionWidthMm), 0, locale),
    sidewallMm: formatDecimal(Math.abs(metricsB.sidewallHeightMm - metricsA.sidewallHeightMm), 1, locale),
    larger: pct < 0.05 ? 'equal' : ratio > 1 ? 'b' : 'a',
    wider: side(metricsA.sectionWidthMm, metricsB.sectionWidthMm, 0.5),
    tallerSidewall: side(metricsA.sidewallHeightMm, metricsB.sidewallHeightMm, 0.5),
    speedShown: String(speedBase.indicated),
    speedTrue: formatDecimal(speedBase.indicated * ratio, 1, locale),
    speedUnit: speedBase.unit,
    within3: pct <= SIMILAR_DIAMETER_TOLERANCE_PERCENT,
    sharedVehicles: vehicles.both.length > 6 ? `${sharedNames} …` : sharedNames,
  });
  return Object.freeze({
    figures,
    metricsA,
    metricsB,
    ratio,
    speedRows: Object.freeze(speeds.map((speed) => ({ indicated: `${speed} ${speedBase.unit}`, actual: `${formatDecimal(speed * ratio, 1, locale)} ${speedBase.unit}` }))),
  });
}

export function tireComparisonMeta(pair: TireComparisonPair, locale: EntityLocale, model: ComparisonModel = comparisonModel(pair, locale)): EntityPageMeta {
  const t = tireComparisonText[locale];
  const page = tireSizePageText[locale];
  const pathname = entityDetailPath('tire-size', locale, pair.slug);
  return Object.freeze({
    title: t.title(model.figures),
    description: t.description(model.figures),
    pathname,
    alternates: entityAlternates('tire-size', pair.slug),
    breadcrumbs: Object.freeze([
      { name: page.breadcrumbHome, href: homePath(locale) },
      { name: page.breadcrumbHub, href: entityHubPath('tire-size', locale) },
      { name: `${model.figures.a} vs ${model.figures.b}`, href: pathname },
    ]),
  });
}

/** The other size of a pair, seen from one size's page. */
export const otherSize = (pair: TireComparisonPair, entry: TireSizeEntry): TireSizeEntry => (pair.a.notation === entry.notation ? pair.b : pair.a);
