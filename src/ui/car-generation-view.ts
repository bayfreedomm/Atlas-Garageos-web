/**
 * What a car model page shows about generations: one row per sourced generation (newest first),
 * the FAQ answers and the title/description fragments. Server-only (reads the cars dataset).
 *
 * A generation names a single bolt pattern only when its records agree (`clear`); otherwise the
 * row lists every recorded pattern with the versions that carry it, and no title or FAQ claims
 * one pattern for it.
 */
import type { CarModel } from '../data/cars';
import { GENERATION_SOURCES, generationName, generationSummaries, generationYears, generationsFor } from '../data/car-generations';
import { carGenerationText } from '../content/car-generation-text';
import type { EntityLocale } from '../seo/entity-routes';
import { formatPlain } from './locale-format';

export interface GenerationRow {
  readonly id: string;
  readonly name: string;
  readonly years: string;
  readonly records: number;
  /** The generation's bolt pattern when its records agree; undefined otherwise. */
  readonly pcd?: string;
  readonly bore?: string;
  readonly wheels?: string;
  /** Every pattern recorded for this generation, main first, with up to two version names. */
  readonly patterns: readonly { readonly pcd: string; readonly versions: readonly string[] }[];
}

export interface GenerationView {
  readonly rows: readonly GenerationRow[];
  readonly faqs: readonly { readonly q: string; readonly a: string }[];
  /** Newest clear generations' labels for titles, e.g. "4, 3, 2". */
  readonly titleLabels: string;
  /** "4 (2016–2024): 5x114.3; 3 (2008–2016): 5x114.3" for meta descriptions. */
  readonly descriptionList: string;
  readonly sources: readonly string[];
}

export function generationView(model: CarModel, locale: EntityLocale, now = new Date().getFullYear()): GenerationView | undefined {
  if (generationsFor(model).length === 0) return undefined;
  const t = carGenerationText[locale];
  const mm = (value: number | undefined): string | undefined => (value === undefined ? undefined : `${formatPlain(value, locale)} mm`);
  const summaries = generationSummaries(model, now);
  const rows: GenerationRow[] = summaries.map((summary) => {
    const name = generationName(model, summary.generation);
    const clear = summary.clear && summary.pcd !== undefined;
    return Object.freeze({
      id: `gen-${summary.generation.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      years: generationYears(summary.generation, t.present),
      records: summary.records,
      ...(clear ? { pcd: summary.pcd } : {}),
      ...(summary.bore !== undefined && clear ? { bore: mm(summary.bore)! } : {}),
      ...(summary.wheelMin !== undefined ? { wheels: summary.wheelMin === summary.wheelMax ? `${summary.wheelMin}″` : `${summary.wheelMin}–${summary.wheelMax}″` } : {}),
      patterns: Object.freeze([
        ...(summary.pcd ? [{ pcd: summary.pcd, versions: [] as readonly string[] }] : []),
        ...summary.others.map((other) => ({ pcd: other.pcd, versions: other.versions })),
      ]),
    });
  });
  const clearRows = rows.filter((row) => row.pcd !== undefined);
  const faqs = clearRows.slice(0, 6).map((row) => {
    const also = row.patterns.slice(1).map((pattern) => `${pattern.pcd}${pattern.versions.length ? ` (${pattern.versions.join(', ')})` : ''}`).join('; ');
    return { q: t.genFaqQ(row.name), a: t.genFaqA(row.name, row.years, row.pcd!, row.bore, also) };
  });
  const labelOf = (row: GenerationRow): string => row.name.slice(`${model.make} ${model.model} `.length).replace(/\s*\(.*\)$/, '');
  return Object.freeze({
    rows: Object.freeze(rows),
    faqs: Object.freeze(faqs),
    titleLabels: clearRows.slice(0, 3).map(labelOf).join(', '),
    descriptionList: clearRows.slice(0, 4).map((row) => `${labelOf(row)} (${row.years}): ${row.pcd}`).join('; '),
    sources: GENERATION_SOURCES[`${model.makeSlug}/${model.modelSlug}`] ?? [],
  });
}
