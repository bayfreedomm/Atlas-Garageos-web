import type { ToolId } from '../seo/tool-registry';
import { getPageLocale, type UiLocale } from './page-locale';

/**
 * Carries the values a visitor typed into one calculator over to the "next useful check"
 * links rendered by ToolPage (the #tool-next-decision block). Those links are built at
 * compile time, so without this every follow-up tool opened on its own defaults and the
 * visitor had to retype what they had just entered.
 *
 * Every target already knows how to read these URLs:
 * - `?current=W-A-R&new=W-A-R`            tire comparison, speedometer, Fitment Studio
 * - `?ow=&oe=&nw=&ne=`                    Fitment Studio wheel position
 * - `?tool=<form key>&state=<json>`       generic restore in shareable-tool-state.ts
 *
 * A link is only rewritten once the visitor has actually interacted with (or restored) the
 * form, and only while the values are valid — otherwise it falls back to its original href,
 * so a half-typed or invalid value is never handed to the next tool.
 */

type Handoff = Readonly<{ path?: string; search: string; hash?: string }>;
type Builder = (form: HTMLFormElement, locale: UiLocale) => Handoff | null;

const BADGE: Readonly<Record<UiLocale, string>> = {
  en: 'With your values',
  de: 'Mit Ihren Werten',
  es: 'Con sus valores',
};

const raw = (form: HTMLFormElement, name: string): string => {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement || field instanceof HTMLSelectElement ? field.value.trim() : '';
};

/** A finite number, or null. With `positive` (the default) zero and negatives are rejected. */
function num(form: HTMLFormElement, name: string, positive = true): number | null {
  const text = raw(form, name);
  if (text === '') return null;
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return positive && value <= 0 ? null : value;
}

/** The strict W-A-R token the tire comparison, speedometer and Fitment Studio all accept. */
function tireToken(form: HTMLFormElement, prefix: string): string | null {
  const width = num(form, `${prefix}widthMm`);
  const aspect = num(form, `${prefix}aspectRatio`);
  const rim = num(form, `${prefix}rimDiameterInches`);
  if (width === null || aspect === null || rim === null) return null;
  const token = `${width}-${aspect}-${rim}`;
  return /^\d{2,3}-\d{2,3}-\d{2}(?:\.5)?$/.test(token) ? token : null;
}

function stateHandoff(targetFormKey: string, state: Readonly<Record<string, string>>): Handoff {
  const params = new URLSearchParams();
  params.set('tool', targetFormKey);
  params.set('state', JSON.stringify(state));
  return { search: `?${params.toString()}` };
}

const fitmentStudioPath = (locale: UiLocale): string => (locale === 'en' ? '/fitment-studio/' : `/${locale}/fitment-studio/`);

const tirePair = (form: HTMLFormElement): string | null => {
  const current = tireToken(form, 'original-');
  const next = tireToken(form, 'new-');
  if (!current || !next) return null;
  const params = new URLSearchParams({ current, new: next });
  return `?${params.toString()}`;
};

const fuelState = (form: HTMLFormElement, distance: number): Record<string, string> | null => {
  const economy = num(form, 'economy');
  const price = num(form, 'price', false);
  if (economy === null || price === null || price < 0) return null;
  const system = raw(form, 'system') === 'imperial' ? 'imperial' : 'metric';
  const state: Record<string, string> = { system, distance: String(distance), economy: String(economy), price: String(price) };
  const currency = raw(form, 'currency');
  if (currency) state['currency'] = currency;
  return state;
};

const powerWeightState = (form: HTMLFormElement): Record<string, string> | null => {
  const power = num(form, 'power');
  const weight = num(form, 'weight');
  const powerUnit = raw(form, 'powerUnit');
  const weightUnit = raw(form, 'weightUnit');
  if (power === null || weight === null || !['hp', 'kw'].includes(powerUnit) || !['kg', 'lb'].includes(weightUnit)) return null;
  return { power: String(power), powerUnit, weight: String(weight), weightUnit };
};

/** L/100km per imperial (UK) MPG: 100 × 4.54609 L / 1.609344 km. */
const IMPERIAL_MPG_TO_L100KM = (100 * 4.54609) / 1.609344;

// Keyed by the source form's data-calculator / data-utility-calculator value, then by the
// target tool id that appears in the decision block (as `next-<id>` or `support-<id>`).
const HANDOFFS: Readonly<Record<string, Partial<Record<ToolId, Builder>>>> = {
  'tire-size': {
    'tire-size-comparison': (form) => {
      const current = tireToken(form, '');
      return current ? { search: `?${new URLSearchParams({ current }).toString()}` } : null;
    },
    'speedometer-error-calculator': (form) => {
      const current = tireToken(form, '');
      if (!current) return null;
      const [w, a, r] = current.split('-');
      return stateHandoff('speedometer', { 'original-widthMm': w!, 'original-aspectRatio': a!, 'original-rimDiameterInches': r! });
    },
  },
  speedometer: {
    'tire-size-comparison': (form) => { const search = tirePair(form); return search ? { search } : null; },
    // The size calculator describes one tire; the new one is the size being considered.
    'tire-size-calculator': (form) => {
      const size = tireToken(form, 'new-');
      return size ? { search: `?${new URLSearchParams({ size }).toString()}` } : null;
    },
    'fitment-studio': (form) => { const search = tirePair(form); return search ? { search, hash: '#compare' } : null; },
  },
  'wheel-offset': {
    // "Measure my car" is a static checklist whose own call-to-action is Fitment Studio's guided
    // measurement. Sending the visitor straight there with both wheels loaded skips a page and
    // ties their measurements to the exact setup they just calculated.
    'measure-my-car': (form, locale) => {
      const search = wheelSearch(form);
      return search ? { path: fitmentStudioPath(locale), search, hash: '#measure-flow' } : null;
    },
    'fitment-studio': (form) => { const search = wheelSearch(form); return search ? { search, hash: '#compare' } : null; },
  },
  'fuel-cost': {
    // Fuel cost takes the total distance; the road trip form takes a one-way leg, so pin it to
    // one-way rather than let a remembered "round trip" silently double the distance.
    'road-trip-cost-calculator': (form) => {
      const distance = num(form, 'distance');
      const state = distance === null ? null : fuelState(form, distance);
      return state ? stateHandoff('road-trip', { ...state, tripType: 'one' }) : null;
    },
    'mpg-l100km-converter': economyToConverter,
  },
  'road-trip': {
    'fuel-cost-calculator': (form) => {
      const leg = num(form, 'distance');
      if (leg === null) return null;
      const total = raw(form, 'tripType') === 'round' ? leg * 2 : leg;
      const state = fuelState(form, total);
      return state ? stateHandoff('fuel-cost', state) : null;
    },
    'mpg-l100km-converter': economyToConverter,
  },
  'fuel-economy': {
    'fuel-cost-calculator': (form) => { const state = converterEconomy(form); return state ? stateHandoff('fuel-cost', state) : null; },
    // Economy only: the road trip keeps its own remembered distance and price.
    'road-trip-cost-calculator': (form) => { const state = converterEconomy(form); return state ? stateHandoff('road-trip', state) : null; },
  },
  power: {
    'power-to-weight-calculator': (form) => {
      const value = num(form, 'value');
      const unit = raw(form, 'unit');
      return value !== null && (unit === 'hp' || unit === 'kw') ? stateHandoff('power-weight', { power: String(value), powerUnit: unit }) : null;
    },
  },
  'power-weight': {
    'quarter-mile-calculator': (form) => { const state = powerWeightState(form); return state ? stateHandoff('quarter-mile', state) : null; },
    'hp-kw-converter': powerToConverter,
  },
  'quarter-mile': {
    'power-to-weight-calculator': (form) => { const state = powerWeightState(form); return state ? stateHandoff('power-weight', state) : null; },
    'hp-kw-converter': powerToConverter,
  },
};

/** Fuel form economy -> the MPG / L/100km converter (US system means US MPG). */
function economyToConverter(form: HTMLFormElement): Handoff | null {
  const economy = num(form, 'economy');
  if (economy === null) return null;
  return stateHandoff('fuel-economy', { unit: raw(form, 'system') === 'imperial' ? 'us-mpg' : 'l100km', value: String(economy) });
}

/** Converter input -> fuel form fields. Fuel forms read US MPG ("imperial") or L/100km ("metric"). */
function converterEconomy(form: HTMLFormElement): Record<string, string> | null {
  const value = num(form, 'value');
  if (value === null) return null;
  const unit = raw(form, 'unit');
  if (unit === 'us-mpg') return { system: 'imperial', economy: String(value) };
  if (unit === 'l100km') return { system: 'metric', economy: String(value) };
  if (unit === 'imperial-mpg') return { system: 'metric', economy: String(Number((IMPERIAL_MPG_TO_L100KM / value).toFixed(2))) };
  return null;
}

/** Power field of the power-weight / quarter-mile forms -> hp/kW converter (same unit values). */
function powerToConverter(form: HTMLFormElement): Handoff | null {
  const power = num(form, 'power');
  const unit = raw(form, 'powerUnit');
  return power !== null && (unit === 'hp' || unit === 'kw') ? stateHandoff('power', { unit, value: String(power) }) : null;
}

function wheelSearch(form: HTMLFormElement): string | null {
  const ow = num(form, 'originalWidthInches');
  const oe = num(form, 'originalOffsetMm', false);
  const nw = num(form, 'newWidthInches');
  const ne = num(form, 'newOffsetMm', false);
  if (ow === null || oe === null || nw === null || ne === null) return null;
  return `?${new URLSearchParams({ ow: String(ow), oe: String(oe), nw: String(nw), ne: String(ne) }).toString()}`;
}

interface Target { readonly link: HTMLAnchorElement; readonly baseHref: string; readonly build: Builder; }

function setBadge(link: HTMLAnchorElement, text: string | null): void {
  let badge = link.querySelector<HTMLElement>('[data-handoff-badge]');
  if (text === null) { badge?.remove(); link.classList.remove('has-handoff'); return; }
  if (!badge) {
    badge = document.createElement('em');
    badge.className = 'decision-handoff';
    badge.dataset.handoffBadge = '';
    // Main actions keep text in a <span>; supporting links end with an arrow <span>.
    const textSpan = link.querySelector(':scope > span:not([aria-hidden])');
    const arrow = link.querySelector(':scope > span[aria-hidden]');
    if (textSpan) textSpan.append(badge);
    else if (arrow) arrow.before(badge);
    else link.append(badge);
  }
  badge.textContent = text;
  link.classList.add('has-handoff');
}

export function initializeToolHandoff(): void {
  const block = document.querySelector<HTMLElement>('#tool-next-decision');
  const form = document.querySelector<HTMLFormElement>('.tool-workspace form[data-calculator], .tool-workspace form[data-utility-calculator]');
  if (!block || !form) return;
  const key = form.dataset.calculator ?? form.dataset.utilityCalculator ?? '';
  const builders = HANDOFFS[key];
  if (!builders) return;
  const locale = getPageLocale();

  const targets: Target[] = [];
  block.querySelectorAll<HTMLAnchorElement>('a[data-decision]').forEach((link) => {
    const match = /^(?:next|support)-(.+)$/.exec(link.dataset.decision ?? '');
    const build = match ? builders[match[1] as ToolId] : undefined;
    if (build) targets.push({ link, baseHref: link.getAttribute('href') ?? '', build });
  });
  if (targets.length === 0) return;

  const update = (): void => {
    for (const { link, baseHref, build } of targets) {
      const handoff = build(form, locale);
      if (!handoff) { link.setAttribute('href', baseHref); setBadge(link, null); continue; }
      link.setAttribute('href', `${handoff.path ?? baseHref}${handoff.search}${handoff.hash ?? ''}`);
      setBadge(link, BADGE[locale]);
    }
  };

  // Only after a real interaction (or a restored share/prefill link, which replays input
  // events): untouched defaults are not "your values".
  let pending = false;
  const schedule = (): void => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  };
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  form.addEventListener('submit', schedule);
}
