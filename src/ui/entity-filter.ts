/**
 * Client-side filter for the tire-size and bolt-pattern hub listings.
 *
 * Deliberately tiny and framework-free, in the same shape as toolbox-filter.ts: it only hides
 * rows that are already in the HTML. Every entity link is a real <a href> rendered at build
 * time, so the hubs are fully crawlable and fully usable with JavaScript disabled — this
 * script is a convenience layer over static markup, never the source of navigation.
 *
 * The query and the stored per-card haystack both go through normalizeEntitySearchText(), so
 * "205/55R16", "205-55-r16" and "20555r16" are the same search.
 */
import { normalizeEntitySearchText } from './entity-search';

export function initializeEntityFilters(): void {
  document.querySelectorAll<HTMLElement>('[data-entity-filter]').forEach((panel) => {
    if (panel.dataset.ready === 'true') return;
    panel.dataset.ready = 'true';
    const input = panel.querySelector<HTMLInputElement>('[data-entity-search]');
    const form = panel.querySelector<HTMLFormElement>('[data-entity-search-form]');
    const cards = [...panel.querySelectorAll<HTMLElement>('[data-entity-card]')];
    const groups = [...panel.querySelectorAll<HTMLElement>('[data-entity-group]')];
    const empty = panel.querySelector<HTMLElement>('[data-entity-empty]');
    const count = panel.querySelector<HTMLElement>('[data-entity-count]');
    const countOne = count?.dataset.countOne;
    const countOther = count?.dataset.countOther ?? '{n}';
    if (!input) return;

    const apply = (): void => {
      const query = normalizeEntitySearchText(input.value);
      let visible = 0;
      for (const card of cards) {
        const haystack = card.dataset.entitySearchText ?? '';
        const show = query === '' || haystack.includes(query);
        card.hidden = !show;
        if (show) visible++;
      }
      // A group heading with nothing left under it would read as a broken section.
      for (const group of groups) {
        group.hidden = [...group.querySelectorAll<HTMLElement>('[data-entity-card]')].every((card) => card.hidden);
      }
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = visible === 1 && countOne ? countOne : countOther.replace('{n}', String(visible));
    };

    input.addEventListener('input', apply);
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      apply();
      cards.find((card) => !card.hidden)?.querySelector<HTMLAnchorElement>('a')?.click();
    });
    apply();
  });
}
