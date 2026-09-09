export function initializeNavigationDrawer(): void {
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const layer = document.querySelector<HTMLElement>('[data-drawer-layer]');
  const drawer = document.querySelector<HTMLElement>('#navigation-drawer');
  if (!openButton || !layer || !drawer) return;
  const closeButtons = [...layer.querySelectorAll<HTMLButtonElement>('[data-menu-close]')];
  let lastFocus: HTMLElement | null = null;
  let closeTimer: number | undefined;
  const focusables = (): HTMLElement[] => [...drawer.querySelectorAll<HTMLElement>('a, button, select, [tabindex]:not([tabindex="-1"])')];
  const open = (): void => {
    if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    lastFocus = document.activeElement as HTMLElement;
    layer.hidden = false;
    requestAnimationFrame(() => { layer.dataset.open = 'true'; });
    drawer.setAttribute('aria-hidden', 'false');
    openButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
    document.querySelector<HTMLElement>('main')?.setAttribute('inert', '');
    focusables()[0]?.focus();
  };
  const close = (): void => {
    delete layer.dataset.open;
    drawer.setAttribute('aria-hidden', 'true');
    openButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    document.querySelector<HTMLElement>('main')?.removeAttribute('inert');
    closeTimer = window.setTimeout(() => { layer.hidden = true; lastFocus?.focus(); closeTimer = undefined; }, 240);
  };
  openButton.addEventListener('click', open);
  closeButtons.forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (layer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const items = focusables(); const first = items[0]; const last = items.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}
