import { vehicleFitmentData } from '../data/vehicle-fitment';
import type { EntityLocale } from '../seo/entity-routes';
import { compareVehicleIds, vehicleComparisonHref } from './vehicle-comparison';

const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

const ENTITY_LOCALE_VALUES: readonly EntityLocale[] = ['en', 'de', 'es', 'pt-br', 'fr', 'it', 'pl', 'nl', 'tr'];

const localeFor = (root: HTMLElement): EntityLocale => {
  const locale = root.dataset.locale;
  return (ENTITY_LOCALE_VALUES as readonly string[]).includes(locale ?? '') ? locale as EntityLocale : 'en';
};

function initializeComparison(root: HTMLElement): void {
  const locale = localeFor(root);
  const catalog = vehicleFitmentData.slice();
  const form = root.querySelector<HTMLFormElement>('form[data-vehicle-comparison-form]');
  const first = form?.elements.namedItem('vehicleA') as HTMLSelectElement | null;
  const second = form?.elements.namedItem('vehicleB') as HTMLSelectElement | null;
  const message = root.querySelector<HTMLElement>('[data-comparison-message]');
  const result = root.querySelector<HTMLElement>('[data-comparison-result]');
  const headingA = root.querySelector<HTMLElement>('[data-comparison-name-a]');
  const headingB = root.querySelector<HTMLElement>('[data-comparison-name-b]');
  const summary = root.querySelector<HTMLElement>('[data-comparison-summary]');
  const rows = root.querySelector<HTMLElement>('[data-comparison-rows]');
  const actions = root.querySelector<HTMLElement>('[data-comparison-actions]');
  if (!form || !first || !second || !message || !result || !headingA || !headingB || !summary || !rows || !actions) return;

  const render = (firstId: string | null, secondId: string | null, updateUrl: boolean): void => {
    const comparison = compareVehicleIds(firstId, secondId, locale, catalog);
    message.textContent = comparison.message;
    message.hidden = comparison.status === 'ready';
    result.hidden = comparison.status !== 'ready';
    if (comparison.status !== 'ready' || !comparison.vehicleA || !comparison.vehicleB || !comparison.canonicalIds) {
      if (updateUrl) history.replaceState({}, '', vehicleComparisonHref(locale));
      return;
    }

    const [canonicalA, canonicalB] = comparison.canonicalIds;
    first.value = canonicalA;
    second.value = canonicalB;
    headingA.textContent = `${comparison.vehicleA.make} ${comparison.vehicleA.model}`;
    headingB.textContent = `${comparison.vehicleB.make} ${comparison.vehicleB.model}`;
    summary.replaceChildren(...comparison.summaries.map((text) => {
      const item = element('li'); item.textContent = text; return item;
    }));
    rows.replaceChildren(...comparison.rows.map((row) => {
      const item = element('div', 'vehicle-comparison__row');
      item.dataset.shared = String(row.shared);
      const label = element('strong'); label.textContent = row.label;
      const value = (text: string, href?: string, note?: string): HTMLElement => {
        const cell = element('span', 'vehicle-comparison__value');
        const main = href ? element('a') : element('b');
        main.textContent = text;
        if (href && main instanceof HTMLAnchorElement) main.href = href;
        cell.append(main);
        if (note) { const small = element('small'); small.textContent = note; cell.append(small); }
        return cell;
      };
      item.append(label, value(row.a, row.aHref, row.aNote), value(row.b, row.bHref, row.bNote));
      return item;
    }));
    actions.replaceChildren(...comparison.actions.map((action) => {
      const link = element('a'); link.href = action.href; link.textContent = action.label; return link;
    }));
    if (updateUrl) history.replaceState({}, '', vehicleComparisonHref(locale, canonicalA, canonicalB));
  };

  form.addEventListener('change', () => render(first.value || null, second.value || null, true));
  form.addEventListener('submit', (event) => { event.preventDefault(); render(first.value || null, second.value || null, true); });
  const params = new URLSearchParams(location.search);
  const incomingA = params.get('a');
  const incomingB = params.get('b');
  if (incomingA && [...first.options].some((option) => option.value === incomingA)) first.value = incomingA;
  if (incomingB && [...second.options].some((option) => option.value === incomingB)) second.value = incomingB;
  render(incomingA ?? (first.value || null), incomingB ?? (second.value || null), Boolean(incomingA || incomingB));
}

export function initializeVehicleComparisons(): void {
  document.querySelectorAll<HTMLElement>('[data-vehicle-comparison]').forEach(initializeComparison);
}
