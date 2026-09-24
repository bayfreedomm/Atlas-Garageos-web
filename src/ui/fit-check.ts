import { countByStatus, runFitCheck, SPEEDOMETER_REVIEW_PERCENT, type FitCheck, type FitCheckResult, type FitCheckStatus } from '../features/tools/fit-check';
import type { TireToolInput, WheelOffsetToolInput } from '../features/tools/calculator-tools';
import type { TireAvailability } from '../features/tools/tire-availability';
import type { EvidenceLevel } from '../domain/evidence';
import { EVIDENCE_LEVELS } from '../domain/evidence';
import { fitCheckText, type FitCheckText, type SpeedoCase } from '../localization/fit-check-catalog';
import { localizedToolPath } from '../localization/locales';
import { createEvidenceBadge, createEvidenceLegend } from './evidence-badge';
import { formatNumber } from './format-number';
import { getPageLocale, type UiLocale } from './page-locale';
import { toolIssueText } from './tool-presentation';
import { initializeTirePrintSheet } from './tire-print-sheet';

/**
 * Page controller for "Can I fit this tire size?" (tools/can-i-fit-tire-size and DE/ES).
 * NUMBER → SHAPE → MEANING → DECISION: runs features/tools/fit-check.ts and renders the verdict,
 * a true-scale drawing, one row per check (each with its evidence label) and next actions that
 * carry the entered sizes into the detailed tools.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const field = (form: HTMLFormElement, name: string): HTMLInputElement | null => {
  const element = form.elements.namedItem(name);
  return element instanceof HTMLInputElement ? element : null;
};
const numberOf = (form: HTMLFormElement, name: string): number => Number(field(form, name)?.value ?? NaN);

const tireOf = (form: HTMLFormElement, prefix: string): TireToolInput => ({
  widthMm: numberOf(form, `${prefix}widthMm`),
  aspectRatio: numberOf(form, `${prefix}aspectRatio`),
  rimDiameterInches: numberOf(form, `${prefix}rimDiameterInches`),
});

/** Wheel inputs are optional; only a complete, numeric set runs the wheel-position engine. */
function wheelsOf(form: HTMLFormElement): WheelOffsetToolInput | undefined {
  const names = ['originalWidthInches', 'originalOffsetMm', 'newWidthInches', 'newOffsetMm'] as const;
  const raw = names.map((name) => field(form, name)?.value.trim() ?? '');
  if (raw.some((value) => value === '' || !Number.isFinite(Number(value)))) return undefined;
  const [ow, oe, nw, ne] = raw.map(Number) as [number, number, number, number];
  return { originalWidthInches: ow, originalOffsetMm: oe, newWidthInches: nw, newOffsetMm: ne };
}

const token = (t: TireToolInput): string => `${t.widthMm}-${t.aspectRatio}-${t.rimDiameterInches}`;
const sizeText = (t: { readonly widthMm: number; readonly aspectRatio: number; readonly rimDiameterInches: number }): string => `${t.widthMm}/${t.aspectRatio} R${t.rimDiameterInches}`;

function signed(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  if (rounded === 0) return formatNumber(0, digits);
  return `${rounded > 0 ? '+' : '−'}${formatNumber(Math.abs(rounded), digits)}`;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function speedoCase(percent: number): SpeedoCase {
  if (Math.abs(percent) < 0.05) return 'same';
  if (percent < 0) return 'higher';
  return percent > SPEEDOMETER_REVIEW_PERCENT ? 'lower-large' : 'lower-small';
}

/** Title, NUMBER and MEANING for one check. */
function describe(check: FitCheck, r: FitCheckResult, input: { readonly current: TireToolInput; readonly proposed: TireToolInput }, t: FitCheckText): { title: string; value: string | null; meaning: string; availability?: TireAvailability } {
  switch (check.id) {
    case 'diameter':
      return { title: t.diameter.title, value: t.diameter.value(formatNumber(r.currentDiameterMm, 1), formatNumber(r.proposedDiameterMm, 1), signed(r.diameterDifferenceMm, 1), signed(r.diameterDifferencePercent, 2)), meaning: check.status === 'pass' ? t.diameter.pass : check.status === 'review' ? t.diameter.review : t.diameter.conflict };
    case 'speedometer':
      return { title: t.speedometer.title, value: t.speedometer.value(formatNumber(r.actualAtIndicated100, 1)), meaning: t.speedometer.meaning[speedoCase(r.diameterDifferencePercent)] };
    case 'ride-height': {
      const rounded = Number(r.rideHeightDifferenceMm.toFixed(1));
      return { title: t.rideHeight.title, value: t.rideHeight.value(signed(r.rideHeightDifferenceMm, 1)), meaning: t.rideHeight.meaning(rounded === 0 ? null : rounded > 0) };
    }
    case 'availability-current':
      return { title: t.availabilityCurrent(sizeText(input.current)), value: null, meaning: t.availability[r.availability.current.status], availability: r.availability.current };
    case 'availability-proposed':
      return { title: t.availabilityProposed(sizeText(input.proposed)), value: null, meaning: t.availability[r.availability.proposed.status], availability: r.availability.proposed };
    case 'wheels':
      return { title: t.wheels.title, value: `R${input.current.rimDiameterInches} → R${input.proposed.rimDiameterInches}`, meaning: r.rimChanges ? t.wheels.changes(input.proposed.rimDiameterInches) : t.wheels.same };
    case 'wheel-position':
      // Two decimals, same as the wheel offset calculator: one decimal would show 11.35 mm as
      // "11.3" (binary 11.3499…) while the detailed tool shows 11.35 for the same wheels.
      return { title: t.wheelPosition.title, value: r.wheelPosition ? t.wheelPosition.value(signed(r.wheelPosition.innerPositionChangeMm, 2), signed(r.wheelPosition.outerPokeChangeMm, 2)) : null, meaning: t.wheelPosition.meaning };
    case 'rim-width': return { title: t.rimWidth.title, value: null, meaning: t.rimWidth.meaning };
    case 'load-speed': return { title: t.loadSpeed.title, value: null, meaning: t.loadSpeed.meaning };
    case 'clearance': return { title: t.clearance.title, value: null, meaning: t.clearance.meaning };
    case 'approval': return { title: t.approval.title, value: null, meaning: t.approval.meaning };
  }
}

const STATUS_ICON: Readonly<Record<FitCheckStatus, string>> = { pass: '✓', review: '!', conflict: '×', info: 'i', unknown: '?' };

/** SHAPE: both tires (and rims) at true relative scale on one ground line. */
function drawShape(host: HTMLElement, input: { readonly current: TireToolInput; readonly proposed: TireToolInput }, r: FitCheckResult, t: FitCheckText): void {
  const width = 360; const height = 222; const ground = 184; const maxRadius = 76;
  const scale = maxRadius / (Math.max(r.currentDiameterMm, r.proposedDiameterMm) / 2);
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${t.shapeCurrent} ${sizeText(input.current)}: ${formatNumber(r.currentDiameterMm, 1)} mm. ${t.shapeNew} ${sizeText(input.proposed)}: ${formatNumber(r.proposedDiameterMm, 1)} mm.`);
  const add = (tag: string, attrs: Readonly<Record<string, string | number>>, text?: string): SVGElement => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    if (text !== undefined) node.textContent = text;
    svg.append(node);
    return node;
  };
  add('line', { x1: 16, y1: ground, x2: width - 16, y2: ground, class: 'fit-shape__ground' });
  const tires = [
    { cx: 100, tire: input.current, diameter: r.currentDiameterMm, kind: 'current', label: t.shapeCurrent },
    { cx: 260, tire: input.proposed, diameter: r.proposedDiameterMm, kind: 'new', label: t.shapeNew },
  ] as const;
  for (const item of tires) {
    const outer = (item.diameter / 2) * scale;
    const rim = (item.tire.rimDiameterInches * 25.4 / 2) * scale;
    const cy = ground - outer;
    add('circle', { cx: item.cx, cy, r: outer, class: `fit-shape__tire fit-shape__tire--${item.kind}` });
    add('circle', { cx: item.cx, cy, r: rim, class: `fit-shape__rim fit-shape__rim--${item.kind}` });
    add('line', { x1: item.cx - outer - 6, y1: ground - 2 * outer, x2: item.cx + outer + 6, y2: ground - 2 * outer, class: `fit-shape__top fit-shape__top--${item.kind}` });
    // Two short lines instead of one long one, so labels stay readable (and apart) on phones.
    add('text', { x: item.cx, y: ground + 17, 'text-anchor': 'middle', class: 'fit-shape__label' }, sizeText(item.tire));
    add('text', { x: item.cx, y: ground + 32, 'text-anchor': 'middle', class: 'fit-shape__value' }, `${item.label} · Ø ${formatNumber(item.diameter, 1)} mm`);
  }
  host.replaceChildren(svg);
}

function setBadgeRow(check: FitCheck, locale: UiLocale, t: FitCheckText): HTMLElement {
  const status = el('span', undefined, `fit-check__status fit-check__status--${check.status}`);
  const icon = el('strong', STATUS_ICON[check.status]); icon.setAttribute('aria-hidden', 'true');
  status.append(icon, el('span', t.statusLabel[check.status], 'fit-check__status-text'));
  const row = el('div', undefined, 'fit-check__meta');
  row.append(status, createEvidenceBadge(check.evidence, locale));
  return row;
}

export function initializeFitCheck(): void {
  const form = document.querySelector<HTMLFormElement>('form[data-calculator="tire-fit-check"]');
  if (!form) return;
  const locale = getPageLocale();
  const t = fitCheckText[locale];
  const q = <T extends HTMLElement>(selector: string): T | null => document.querySelector<T>(selector);
  const errors = q<HTMLElement>('[data-fit-errors]');
  const result = q<HTMLElement>('[data-fit-result]');
  const verdictBox = q<HTMLElement>('[data-fit-verdict]');
  const shape = q<HTMLElement>('[data-fit-shape]');
  const checksList = q<HTMLElement>('[data-fit-checks]');
  const actions = q<HTMLElement>('[data-fit-actions]');
  const legend = q<HTMLElement>('[data-fit-legend]');
  const comparisonPath = localizedToolPath(locale, 'tire-size-comparison', 'tool');
  const speedometerPath = localizedToolPath(locale, 'speedometer-error-calculator', 'tool');
  const offsetPath = localizedToolPath(locale, 'wheel-offset-calculator', 'tool');
  const loadIndexPath = localizedToolPath(locale, 'tire-load-speed-rating', 'tool');
  const studioPath = locale === 'en' ? '/fitment-studio/' : `/${locale}/fitment-studio/`;

  // Prefill from ?current=W-A-R&new=W-A-R(&ow=&oe=&nw=&ne=) — links from other tools and shares.
  const params = new URLSearchParams(window.location.search);
  const setTire = (prefix: string, value: string | null): void => {
    if (!value || !/^\d{2,3}-\d{2,3}-\d{2}(?:\.5)?$/.test(value)) return;
    const [w, a, r] = value.split('-');
    const set = (name: string, v: string | undefined): void => { const input = field(form, name); if (input && v !== undefined) input.value = v; };
    set(`${prefix}widthMm`, w); set(`${prefix}aspectRatio`, a); set(`${prefix}rimDiameterInches`, r);
  };
  setTire('original-', params.get('current'));
  setTire('new-', params.get('new'));
  for (const [key, name] of [['ow', 'originalWidthInches'], ['oe', 'originalOffsetMm'], ['nw', 'newWidthInches'], ['ne', 'newOffsetMm']] as const) {
    const value = params.get(key);
    const input = field(form, name);
    if (input && value !== null && value.trim() !== '' && Number.isFinite(Number(value))) input.value = value;
  }
  if (params.has('ow')) form.querySelector('details[data-fit-wheels]')?.setAttribute('open', '');

  const render = (): void => {
    const input = { current: tireOf(form, 'original-'), proposed: tireOf(form, 'new-') };
    const wheels = wheelsOf(form);
    const outcome = runFitCheck({ ...input, wheels });
    if (!outcome.ok) {
      if (errors) { errors.replaceChildren(...outcome.issues.map((issue) => el('p', toolIssueText(issue)))); errors.hidden = false; }
      if (result) result.hidden = true;
      return;
    }
    if (errors) { errors.hidden = true; errors.replaceChildren(); }
    const r = outcome.value;
    const counts = countByStatus(r.checks);

    if (verdictBox) {
      verdictBox.className = `fit-verdict fit-verdict--${r.verdict}`;
      verdictBox.dataset.verdict = r.verdict;
      const title = el('h2', t.verdictTitle[r.verdict], 'fit-verdict__title');
      title.id = 'fit-verdict-title';
      const pct = formatNumber(Math.abs(r.diameterDifferencePercent), 2);
      verdictBox.replaceChildren(
        title,
        el('p', t.verdictSummary(pct, r.diameterDifferencePercent >= 0), 'fit-verdict__summary'),
        el('p', t.counts(counts.pass, counts.review, counts.conflict, counts.unknown), 'fit-verdict__counts'),
        el('p', t.geometryOnly, 'fit-verdict__note'),
      );
    }

    if (shape) drawShape(shape, input, r, t);

    if (checksList) {
      checksList.replaceChildren(...r.checks.map((check) => {
        const d = describe(check, r, input, t);
        const item = el('li', undefined, `fit-check fit-check--${check.status}`);
        item.dataset.check = check.id;
        item.dataset.status = check.status;
        const head = el('div', undefined, 'fit-check__head');
        head.append(el('h3', d.title, 'fit-check__title'), setBadgeRow(check, locale, t));
        item.append(head);
        if (d.value) item.append(el('p', d.value, 'fit-check__value'));
        item.append(el('p', d.meaning, 'fit-check__meaning'));
        if (d.availability && d.availability.status !== 'listed' && d.availability.nearest.length > 0) {
          const nearest = el('p', `${t.nearest} `, 'fit-check__nearest');
          const isCurrent = check.id === 'availability-current';
          d.availability.nearest.forEach((suggestion, index) => {
            if (index > 0) nearest.append(document.createTextNode(' · '));
            const size = { widthMm: suggestion.size.widthMm, aspectRatio: suggestion.size.aspectRatio, rimDiameterInches: suggestion.size.rimDiameterInches };
            const next = isCurrent ? { current: size, proposed: input.proposed } : { current: input.current, proposed: size };
            const link = el('a', sizeText(size));
            link.href = `?${new URLSearchParams({ current: token(next.current), new: token(next.proposed) }).toString()}`;
            nearest.append(link);
          });
          item.append(nearest);
        }
        return item;
      }));
    }

    if (actions) {
      const pair = new URLSearchParams({ current: token(input.current), new: token(input.proposed) });
      const links: [string, string][] = [
        [t.actions.compare, `${comparisonPath}?${pair.toString()}`],
        [t.actions.speedometer, `${speedometerPath}?${pair.toString()}`],
        [t.actions.measure, `${studioPath}?${pair.toString()}${wheels ? `&${new URLSearchParams({ ow: String(wheels.originalWidthInches), oe: String(wheels.originalOffsetMm), nw: String(wheels.newWidthInches), ne: String(wheels.newOffsetMm) }).toString()}` : ''}#measure-flow`],
        ...(wheels ? [[t.actions.wheelOffset, `${offsetPath}?${new URLSearchParams({ ow: String(wheels.originalWidthInches), oe: String(wheels.originalOffsetMm), nw: String(wheels.newWidthInches), ne: String(wheels.newOffsetMm) }).toString()}`] as [string, string]] : []),
        [t.actions.loadIndex, loadIndexPath],
      ];
      const heading = el('h2', t.nextHeading, 'fit-actions__heading');
      const list = el('div', undefined, 'fit-actions__links');
      for (const [label, href] of links) {
        const link = el('a', undefined, 'fit-actions__link');
        link.href = href;
        link.append(el('span', label), (() => { const arrow = el('i', '›'); arrow.setAttribute('aria-hidden', 'true'); return arrow; })());
        list.append(link);
      }
      actions.replaceChildren(heading, list);
    }

    if (legend) {
      const used = EVIDENCE_LEVELS.filter((level: EvidenceLevel) => r.checks.some((check) => check.evidence === level));
      legend.replaceChildren(el('h2', t.legendHeading, 'fit-legend__heading'), createEvidenceLegend(used, locale));
    }
    if (result) result.hidden = false;
  };

  let pending = false;
  const schedule = (): void => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; render(); });
  };
  form.addEventListener('input', schedule);
  form.addEventListener('submit', (event) => { event.preventDefault(); render(); });
  initializeTirePrintSheet(form);
  render();
}
