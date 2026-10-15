/**
 * Turns a ChangeSummary into the plain-language rows of the "If you switch" panel.
 * Pure: no DOM, so the wording for every locale is unit-tested.
 */
import type { ChangeDirection, ChangeSummary } from '../features/decision/change-decision';
import type { DecisionText } from '../content/decision-text';
import { formatDecimal, formatMm, formatSigned, type NumberLocale } from './locale-format';

export type DecisionRowKey = 'width' | 'diameter' | 'rideHeight' | 'speedometer' | 'sidewall' | 'wheels';

export interface DecisionRow {
  readonly key: DecisionRowKey;
  readonly label: string;
  readonly text: string;
  /** Visual tone only — never a fit verdict. */
  readonly tone: 'neutral' | 'attention';
}

export const fill = (template: string, values: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w)\}/g, (match, key: string) => values[key] ?? match);

const pick = (direction: ChangeDirection, up: string, down: string, same: string): string =>
  direction === 'up' ? up : direction === 'down' ? down : same;

export function decisionRows(summary: ChangeSummary, t: DecisionText, locale: NumberLocale): readonly DecisionRow[] {
  const mm = (value: number, digits = 0): string => formatMm(Math.abs(value), digits, locale);
  const rideDirection: ChangeDirection = summary.rideHeightMm > 0.5 ? 'up' : summary.rideHeightMm < -0.5 ? 'down' : 'same';
  const rows: DecisionRow[] = [
    { key: 'width', label: t.rows.width, text: fill(pick(summary.widthDirection, t.widthUp, t.widthDown, t.widthSame), { x: mm(summary.widthMm) }), tone: summary.widthMm > 0 ? 'attention' : 'neutral' },
    {
      key: 'diameter',
      label: t.rows.diameter,
      text: fill(pick(summary.diameterDirection, t.diameterUp, t.diameterDown, t.diameterSame), { x: mm(summary.diameterMm, 1), p: formatSigned(summary.diameterPercent, 2, '%', locale) }),
      tone: summary.diameterWithinRule ? 'neutral' : 'attention',
    },
    { key: 'rideHeight', label: t.rows.rideHeight, text: fill(pick(rideDirection, t.rideUp, t.rideDown, t.rideSame), { x: mm(summary.rideHeightMm, 1) }), tone: 'neutral' },
    { key: 'speedometer', label: t.rows.speedometer, text: fill(t.speed, { v: formatDecimal(summary.actualAt100, 1, locale) }), tone: summary.speedometerNeedsReview ? 'attention' : 'neutral' },
    { key: 'sidewall', label: t.rows.sidewall, text: fill(pick(summary.sidewallDirection, t.sidewallUp, t.sidewallDown, t.sidewallSame), { x: mm(summary.sidewallMm, 1) }), tone: 'neutral' },
  ];
  if (summary.wheelPosition) {
    rows.push({
      key: 'wheels',
      label: t.rows.wheels,
      text: fill(t.wheelPosition, { i: formatSigned(summary.wheelPosition.innerMm, 1, 'mm', locale), o: formatSigned(summary.wheelPosition.outerMm, 1, 'mm', locale) }),
      tone: summary.wheelPosition.outerMm > 0 || summary.wheelPosition.innerMm > 0 ? 'attention' : 'neutral',
    });
  }
  return rows;
}

export const ruleSentence = (summary: ChangeSummary, t: DecisionText): string => (summary.diameterWithinRule ? t.withinRule : t.outsideRule);

export const progressText = (t: DecisionText, done: number, total: number): string => fill(t.progress, { n: String(done), t: String(total) });
