export function initializeMobileDock(): void {
  const dock = document.querySelector<HTMLElement>('.mobile-dock');
  if (!dock || dock.dataset.ready === 'true') return;
  dock.dataset.ready = 'true';

  const homeIsActive = dock.querySelector<HTMLAnchorElement>('a[href="/"][aria-current="page"]') !== null;
  let lastY = window.scrollY;

  const setHidden = (hidden: boolean): void => { dock.dataset.hidden = hidden ? 'true' : 'false'; };
  const hasFocusedField = (): boolean => document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLSelectElement || document.activeElement instanceof HTMLTextAreaElement;
  const nearBottom = (): boolean => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 72;

  const syncInitialState = (): void => {
    if (window.innerWidth >= 960) return;
    // On Home, the fixed dock must not cover the first interactive section below the hero.
    if (homeIsActive && window.scrollY < 120) setHidden(true);
    else setHidden(false);
  };

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 960) return;
    const nextY = window.scrollY;
    const delta = nextY - lastY;

    if (hasFocusedField()) setHidden(true);
    else if (nearBottom()) setHidden(false);
    else if (homeIsActive && nextY < 120) setHidden(true);
    else if (delta > 5 && nextY > 80) setHidden(true);
    else if (delta < -5) setHidden(false);

    lastY = nextY;
  }, { passive: true });

  document.addEventListener('focusin', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) setHidden(true);
  });

  document.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (homeIsActive && window.scrollY < 120) setHidden(true);
    }, 120);
  });

  window.addEventListener('resize', syncInitialState, { passive: true });
  syncInitialState();
}
