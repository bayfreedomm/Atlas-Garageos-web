export function initializeNavigationDrawer(): void {
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-navigation-dialog]');
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!openButton || !dialog || !closeButton) return;
  const close = (): void => { if (dialog.open) dialog.close(); };
  openButton.addEventListener('click', () => { dialog.showModal(); openButton.setAttribute('aria-expanded', 'true'); document.body.classList.add('nav-open'); closeButton.focus({ preventScroll: true }); });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => { openButton.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); openButton.focus({ preventScroll: true }); });
  window.addEventListener('pageshow', () => { if (dialog.open) dialog.close(); openButton.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); });
}
