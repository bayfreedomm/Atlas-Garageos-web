/**
 * Bolt pattern by year for a car model, straight from its ANKUSI wheel records: every bolt
 * pattern + center bore combination with the first and last model year recorded. No editorial
 * generation names — those wait for sourced data (DECISIONS 2026-10-14).
 */
import type { CarModel, WheelRow } from '../data/cars';

export interface PatternPeriod {
  readonly pcd: string;
  readonly bore?: number;
  readonly from: number;
  readonly to: number;
  readonly versions: readonly string[];
  readonly records: number;
}

const rowYears = (row: WheelRow): readonly [number, number] | undefined => {
  const from = row[1] ?? row[2];
  const to = row[2] ?? row[1];
  return from && to ? [Math.min(from, to), Math.max(from, to)] : undefined;
};

/** Newest pattern first (latest year, then most records). */
export function patternTimeline(model: CarModel): readonly PatternPeriod[] {
  const groups = new Map<string, { pcd: string; bore?: number; from: number; to: number; versions: Set<string>; records: number }>();
  for (const row of model.wheels) {
    const years = rowYears(row);
    if (!row[4] || !years) continue;
    const key = `${row[4]}|${row[5] ?? ''}`;
    const group = groups.get(key) ?? { pcd: row[4], ...(typeof row[5] === 'number' ? { bore: row[5] } : {}), from: years[0], to: years[1], versions: new Set<string>(), records: 0 };
    group.from = Math.min(group.from, years[0]);
    group.to = Math.max(group.to, years[1]);
    group.versions.add(row[0]);
    group.records += 1;
    groups.set(key, group);
  }
  return Object.freeze([...groups.values()]
    .sort((a, b) => b.to - a.to || b.records - a.records)
    .map((group) => Object.freeze({ pcd: group.pcd, ...(group.bore !== undefined ? { bore: group.bore } : {}), from: group.from, to: group.to, versions: Object.freeze([...group.versions].slice(0, 3)), records: group.records })));
}

export const periodYears = (period: PatternPeriod): string => (period.from === period.to ? String(period.from) : `${period.from}–${period.to}`);
