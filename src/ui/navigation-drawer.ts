export function initializeNavigationDrawer(): void {
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const layer = document.querySelector<HTMLDialogElement>('[data-drawer-layer]');
  const drawer = document.querySelector<HTMLElement>('#navigation-drawer');
  if (!openButton || !layer || !drawer) return;
  const closeButtons = [...layer.querySelectorAll<HTMLButtonElement>('[data-menu-close]')];
  let lastFocus: HTMLElement | null = null;
  const focusables = (): HTMLElement[] => [...drawer.querySelectorAll<HTMLElement>('a, button, select, [tabindex]:not([tabindex="-1"])')];
  const open = (): void => {
    lastFocus = document.activeElement as HTMLElement;
    if (!layer.open) layer.showModal();
    requestAnimationFrame(() => { layer.dataset.open = 'true'; });
    openButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
    focusables()[0]?.focus();
  };
  const close = (): void => {
    delete layer.dataset.open;
    openButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    if (layer.open) layer.close();
    lastFocus?.focus();
  };
  openButton.addEventListener('click', open);
  closeButtons.forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (!layer.open) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const items = focusables(); const first = items[0]; const last = items.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  layer.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  window.addEventListener('pageshow', () => { if (layer.open) close(); });
}
