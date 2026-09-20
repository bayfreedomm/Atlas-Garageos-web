import { getPageLocale } from './page-locale';

const TOOL_COUNT_WORDS = {
  en: { one: 'tool', other: 'tools' },
  de: { one: 'Tool', other: 'Tools' },
  es: { one: 'herramienta', other: 'herramientas' },
} as const;

export interface ToolFilterCandidate { readonly category: string; readonly searchText: string; readonly popular: boolean; }
export function toolMatchesFilter(candidate: ToolFilterCandidate, query: string, category: string, homeDefault: boolean): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return (category === 'All' || candidate.category === category)
    && (!normalizedQuery || candidate.searchText.includes(normalizedQuery))
    && (!homeDefault || normalizedQuery.length > 0 || category !== 'All' || candidate.popular);
}

export function initializeToolboxes(): void {
  const countWords = TOOL_COUNT_WORDS[getPageLocale()];
  document.querySelectorAll<HTMLElement>('[data-toolbox]').forEach((toolbox) => {
    if (toolbox.dataset.ready === 'true') return;
    toolbox.dataset.ready = 'true';
    const search = toolbox.querySelector<HTMLInputElement>('[data-tool-search]');
    const searchForm = toolbox.querySelector<HTMLFormElement>('[data-tool-search-form]');
    const buttons = [...toolbox.querySelectorAll<HTMLButtonElement>('[data-tool-category]')];
    const rows = [...toolbox.querySelectorAll<HTMLAnchorElement>('[data-tool-row]')];
    const empty = toolbox.querySelector<HTMLElement>('[data-tool-empty]');
    const count = toolbox.querySelector<HTMLElement>('[data-tool-count]');
    const home = toolbox.dataset.mode === 'home';
    let category = 'All';
    const apply = (): void => {
      const query = search?.value.trim().toLocaleLowerCase() ?? '';
      let visible = 0;
      rows.forEach((row) => {
        const show = toolMatchesFilter({ category: row.dataset.toolCategoryName ?? '', searchText: row.dataset.toolSearchText ?? '', popular: row.dataset.popular === 'true' }, query, category, home);
        row.hidden = !show;
        // `visible` is incremented from the exact same `show` value that decides row.hidden,
        // for every row, with no exceptions — so the count and the empty state can never
        // disagree with what the DOM actually shows. (There used to be a
        // `data-tool-count-exclude` opt-out here for a hand-written Gas Prices Today row;
        // that row is now a real registry entry and counts like anything else.)
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = `${visible} ${visible === 1 ? countWords.one : countWords.other}`;
    };
    buttons.forEach((button) => button.addEventListener('click', () => {
      category = button.dataset.toolCategory ?? 'All';
      buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      apply();
    }));
    search?.addEventListener('input', apply);
    searchForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      apply();
      rows.find((row) => !row.hidden)?.click();
    });
    const initialCategory = new URLSearchParams(window.location.search).get('category');
    const initial = buttons.find((button) => button.dataset.toolCategory === initialCategory);
    initial?.click();
    apply();
  });
}
