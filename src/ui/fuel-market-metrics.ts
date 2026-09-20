// Pure helpers for the fuel market dashboard's metric cards and trend ranges.
//
// Every number these produce comes from real committed data (src/data/fuel-prices.json and
// src/data/fuel-price-history.json). Nothing here invents, interpolates or back-fills a
// value: when the data cannot support a metric, the metric is `null` and the dashboard
// renders an honest "not enough data yet" card in its place.

export interface TrendPoint {
  /** ISO yyyy-mm-dd for daily markets, or the real EIA weekOf period for the US. */
  readonly date: string;
  readonly value: number;
}

export interface SeriesSummary {
  /** Number of real observations available for this product. */
  readonly count: number;
  /** Latest verified value (the live snapshot value when one was supplied, else the last
   *  history point), or null when nothing has ever been verified. */
  readonly current: number | null;
  /** The observation before the current one, or null when only one observation exists. */
  readonly previous: number | null;
  readonly changeAbs: number | null;
  readonly changePct: number | null;
  readonly average: number | null;
  readonly low: number | null;
  readonly high: number | null;
  readonly firstDate: string | null;
  readonly lastDate: string | null;
  /** Calendar days between the first and last observation (0 when fewer than two exist). */
  readonly spanDays: number;
}

const DAY_MS = 86_400_000;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Summarizes a product's real history. `currentValue` is the value from the current
 * snapshot (fuel-prices.json) when one exists; it is used as "current" so the dashboard
 * agrees with the price board even before that value has landed in history. Change is only
 * computed when two genuinely distinct observations exist.
 */
export function summarizeSeries(points: readonly TrendPoint[], currentValue?: number | null): SeriesSummary {
  const sorted = [...points].filter((point) => Number.isFinite(point.value) && point.value > 0).sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((point) => point.value);
  const lastHistory = values.length > 0 ? values[values.length - 1]! : null;
  const current = typeof currentValue === 'number' && Number.isFinite(currentValue) ? currentValue : lastHistory;

  // "Previous" is the observation before the current one. If the current value came from the
  // snapshot and is not yet in history, the last history point IS the previous observation.
  let previous: number | null = null;
  if (current !== null) {
    if (lastHistory !== null && current !== lastHistory && typeof currentValue === 'number') previous = lastHistory;
    else if (values.length >= 2) previous = values[values.length - 2]!;
  }

  const changeAbs = current !== null && previous !== null ? round(current - previous, 4) : null;
  const changePct = changeAbs !== null && previous ? round((changeAbs / previous) * 100, 2) : null;

  const firstDate = sorted.length > 0 ? sorted[0]!.date : null;
  const lastDate = sorted.length > 0 ? sorted[sorted.length - 1]!.date : null;
  const spanDays = firstDate && lastDate ? Math.max(0, Math.round((Date.parse(`${lastDate}T00:00:00Z`) - Date.parse(`${firstDate}T00:00:00Z`)) / DAY_MS)) : 0;

  return {
    count: values.length,
    current,
    previous,
    changeAbs,
    changePct,
    average: values.length > 0 ? round(values.reduce((sum, value) => sum + value, 0) / values.length, 4) : null,
    low: values.length > 0 ? Math.min(...values) : null,
    high: values.length > 0 ? Math.max(...values) : null,
    firstDate,
    lastDate,
    spanDays,
  };
}

export interface RangeOption {
  readonly id: string;
  readonly label: string;
  readonly days: number;
}

export interface AvailableRange {
  readonly range: RangeOption;
  readonly points: readonly TrendPoint[];
}

/** The smallest number of real points the sparkline is willing to draw (matches
 *  FuelPriceTrend's own MIN_POINTS_FOR_TREND). */
export const MIN_POINTS_FOR_RANGE = 4;
/** A range is only offered when the data actually spans a meaningful part of it — otherwise
 *  a "1Y" tab would just redraw the same two weeks of data under a misleading label. */
const MIN_SPAN_RATIO = 0.6;

/**
 * Returns only those ranges the committed history can genuinely support, each already
 * filtered to its window. History that is still building returns an empty array, and the
 * dashboard then falls back to the trend component's honest "building" state.
 */
export function availableRanges(points: readonly TrendPoint[], ranges: readonly RangeOption[], minPoints: number = MIN_POINTS_FOR_RANGE): readonly AvailableRange[] {
  const sorted = [...points].filter((point) => Number.isFinite(point.value) && point.value > 0).sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < minPoints) return [];
  const lastMs = Date.parse(`${sorted[sorted.length - 1]!.date}T00:00:00Z`);
  const firstMs = Date.parse(`${sorted[0]!.date}T00:00:00Z`);
  if (!Number.isFinite(lastMs) || !Number.isFinite(firstMs)) return [];
  const spanDays = Math.max(0, Math.round((lastMs - firstMs) / DAY_MS));

  const result: AvailableRange[] = [];
  for (const range of ranges) {
    if (spanDays < range.days * MIN_SPAN_RATIO) continue;
    const cutoff = lastMs - range.days * DAY_MS;
    const windowed = sorted.filter((point) => Date.parse(`${point.date}T00:00:00Z`) >= cutoff);
    if (windowed.length < minPoints) continue;
    result.push({ range, points: windowed });
  }
  return result;
}

/** One card in the dashboard's market snapshot (see FuelMarketSnapshot.astro). A metric with
 *  no real data must be passed with `value: null` plus an honest `placeholder`. */
export interface SnapshotMetric {
  readonly label: string;
  readonly value: string | null;
  readonly detail?: string | undefined;
  readonly placeholder: string;
  readonly tone?: 'up' | 'down' | 'flat' | undefined;
}
