export interface ToolFilterCandidate { readonly category: string; readonly searchText: string; readonly popular: boolean; }
export function toolMatchesFilter(candidate: ToolFilterCandidate, query: string, category: string, homeDefault: boolean): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return (category === 'All' || candidate.category === category)
    && (!normalizedQuery || candidate.searchText.includes(normalizedQuery))
    && (!homeDefault || normalizedQuery.length > 0 || category !== 'All' || candidate.popular);
}

export function initializeToolboxes(): void {
  document.querySelectorAll<HTMLElement>('[data-toolbox]').forEach((toolbox) => {
    if (toolbox.dataset.ready === 'true') return;
    toolbox.dataset.ready = 'true';
    const search = toolbox.querySelector<HTMLInputElement>('[data-tool-search]');
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
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = `${visible} ${visible === 1 ? 'tool' : 'tools'}`;
    };
    buttons.forEach((button) => button.addEventListener('click', () => {
      category = button.dataset.toolCategory ?? 'All';
      buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      apply();
    }));
    search?.addEventListener('input', apply);
    const initialCategory = new URLSearchParams(window.location.search).get('category');
    const initial = buttons.find((button) => button.dataset.toolCategory === initialCategory);
    initial?.click();
    apply();
  });
}
