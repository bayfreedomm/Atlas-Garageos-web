export function initializeMobileDock(): void {
  const dock = document.querySelector<HTMLElement>('.mobile-dock');
  if (!dock || dock.dataset.ready === 'true') return;
  dock.dataset.ready = 'true';
  let lastY = window.scrollY;
  let idleTimer = 0;

  const setHidden = (hidden: boolean): void => { dock.dataset.hidden = hidden ? 'true' : 'false'; };
  const hasFocusedField = (): boolean => document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLSelectElement || document.activeElement instanceof HTMLTextAreaElement;

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 960) return;
    const nextY = window.scrollY;
    const delta = nextY - lastY;
    if (hasFocusedField()) setHidden(true);
    else if (delta > 7 && nextY > 90) setHidden(true);
    else if (delta < -5 || nextY < 50) setHidden(false);
    lastY = nextY;
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => { if (!hasFocusedField()) setHidden(false); }, 850);
  }, { passive: true });

  document.addEventListener('focusin', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) setHidden(true);
  });
  document.addEventListener('focusout', () => window.setTimeout(() => setHidden(false), 120));
}
