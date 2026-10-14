/**
 * Indexable "X vs Y" tire-size comparisons and the "models on this size" index.
 *
 * Pairs are not every combination of the ~1,000 catalog sizes (that would be hundreds of
 * thousands of thin pages). A pair is published only when real factory data puts the two sizes
 * side by side:
 *   1. two factory sizes of the same vehicle (curated vehicle rows: standard + options), or of
 *      the same ANKUSI wheel record (its listed OE tire sizes);
 *   2. a factory size and its closest manufactured plus/minus-one-inch alternative (the first
 *      row of tireAlternatives() one rim size down and one up) — the "205/55R16 vs 225/45R17"
 *      question people actually search.
 * Server-only: it reads the ANKUSI car dataset.
 */
import { carModels, type CarModel } from './cars';
import { tireSizeCatalog, type TireSizeEntry } from './tire-size-catalog';
import { vehicleFitmentData } from './vehicle-fitment';
import { tireAlternatives } from '../ui/entity-page-model';

export type ComparisonReason = 'same-vehicle' | 'plus-minus-one';

export interface TireComparisonPair {
  /** "205-55-r16-vs-225-45-r17" — always the catalog-order (smaller rim first) pair. */
  readonly slug: string;
  readonly a: TireSizeEntry;
  readonly b: TireSizeEntry;
  readonly reason: ComparisonReason;
}

const catalogIndex = new Map(tireSizeCatalog.map((entry, index) => [entry.notation, index]));
const byNotation = new Map(tireSizeCatalog.map((entry) => [entry.notation, entry]));

const ANKUSI_TIRE = /(\d{3})\/(\d{2})\s?Z?R\s?(\d{2}(?:\.5)?)/g;

/** OE tire sizes listed on an ANKUSI wheel record, normalized to catalog notation. */
export function ankusiTireSizes(text: string | null | undefined): readonly string[] {
  return [...new Set([...(text ?? '').matchAll(ANKUSI_TIRE)].map((match) => `${match[1]}/${match[2]}R${match[3]}`))];
}

/** Catalog notation → ANKUSI car models whose wheel records list that size, most records first. */
const modelsByNotation: ReadonlyMap<string, readonly CarModel[]> = (() => {
  const counts = new Map<string, Map<CarModel, number>>();
  for (const model of carModels) {
    for (const row of model.wheels) {
      for (const notation of ankusiTireSizes(row[11])) {
        if (!byNotation.has(notation)) continue;
        const bucket = counts.get(notation) ?? new Map<CarModel, number>();
        bucket.set(model, (bucket.get(model) ?? 0) + 1);
        counts.set(notation, bucket);
      }
    }
  }
  return new Map([...counts].map(([notation, bucket]) => [notation, Object.freeze([...bucket].sort((x, y) => y[1] - x[1] || x[0].make.localeCompare(y[0].make) || x[0].model.localeCompare(y[0].model)).map(([model]) => model))]));
})();

export function carModelsForTireSize(notation: string): readonly CarModel[] {
  return modelsByNotation.get(notation) ?? [];
}

const usable = (entry: TireSizeEntry | undefined): entry is TireSizeEntry => entry !== undefined && !entry.flotation;

function orderedPair(x: TireSizeEntry, y: TireSizeEntry): [TireSizeEntry, TireSizeEntry] {
  return catalogIndex.get(x.notation)! <= catalogIndex.get(y.notation)! ? [x, y] : [y, x];
}

export const tireComparisonSlug = (x: TireSizeEntry, y: TireSizeEntry): string => {
  const [a, b] = orderedPair(x, y);
  return `${a.slug}-vs-${b.slug}`;
};

function buildPairs(): readonly TireComparisonPair[] {
  const pairs = new Map<string, TireComparisonPair>();
  const add = (x: TireSizeEntry, y: TireSizeEntry, reason: ComparisonReason): void => {
    if (x.notation === y.notation) return;
    const [a, b] = orderedPair(x, y);
    const slug = `${a.slug}-vs-${b.slug}`;
    if (!pairs.has(slug)) pairs.set(slug, Object.freeze({ slug, a, b, reason }));
  };

  const factoryGroups: TireSizeEntry[][] = [];
  for (const vehicle of vehicleFitmentData) {
    factoryGroups.push([vehicle.tireSize, ...(vehicle.optionalTireSizes ?? [])].map((notation) => byNotation.get(notation)).filter(usable));
  }
  for (const model of carModels) {
    for (const row of model.wheels) factoryGroups.push(ankusiTireSizes(row[11]).map((notation) => byNotation.get(notation)).filter(usable));
  }

  const factorySizes = new Map<string, TireSizeEntry>();
  for (const group of factoryGroups) {
    for (const entry of group) factorySizes.set(entry.notation, entry);
    for (let i = 0; i < group.length; i += 1) for (let j = i + 1; j < group.length; j += 1) add(group[i]!, group[j]!, 'same-vehicle');
  }

  for (const entry of factorySizes.values()) {
    for (const row of tireAlternatives(entry)) {
      if (row.rimDelta !== -1 && row.rimDelta !== 1) continue;
      const best = row.options[0];
      if (best && usable(best.entry)) add(entry, best.entry, 'plus-minus-one');
    }
  }

  return Object.freeze([...pairs.values()].sort((p, q) => catalogIndex.get(p.a.notation)! - catalogIndex.get(q.a.notation)! || catalogIndex.get(p.b.notation)! - catalogIndex.get(q.b.notation)!));
}

export const tireComparisonPairs: readonly TireComparisonPair[] = buildPairs();

const pairsBySize = (() => {
  const map = new Map<string, TireComparisonPair[]>();
  for (const pair of tireComparisonPairs) {
    for (const entry of [pair.a, pair.b]) {
      const list = map.get(entry.notation) ?? [];
      list.push(pair);
      map.set(entry.notation, list);
    }
  }
  return map;
})();

/** Published comparisons that include this size (factory pairs first). */
export function comparisonsForTireSize(notation: string): readonly TireComparisonPair[] {
  const list = pairsBySize.get(notation) ?? [];
  return list.slice().sort((p, q) => Number(p.reason !== 'same-vehicle') - Number(q.reason !== 'same-vehicle'));
}

const pairsBySlug = new Map(tireComparisonPairs.map((pair) => [pair.slug, pair]));

export function tireComparisonBySlug(slug: string): TireComparisonPair | undefined {
  return pairsBySlug.get(slug);
}

/** The published comparison page for two sizes, if that pair is one of the factory-backed pairs. */
export function publishedComparison(x: TireSizeEntry, y: TireSizeEntry): TireComparisonPair | undefined {
  return x.notation === y.notation ? undefined : pairsBySlug.get(tireComparisonSlug(x, y));
}
