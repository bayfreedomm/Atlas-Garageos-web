/** A local, reversible inspection mode for a single 3D panel. */
export function mountStudioFocus(panel: HTMLElement, button: HTMLButtonElement | null, signal: AbortSignal): () => void {
  if (!button) return () => {};
  let previousFocus: HTMLElement | null = null;
  const close = (): void => {
    if (!panel.classList.contains('is-expanded')) return;
    panel.classList.remove('is-expanded');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
    document.body.classList.remove('has-expanded-3d');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = button.dataset.focusOpen ?? button.textContent;
    previousFocus?.focus();
    previousFocus = null;
  };
  button.addEventListener('click', () => {
    if (panel.classList.contains('is-expanded')) { close(); return; }
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.classList.add('is-expanded');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    document.body.classList.add('has-expanded-3d');
    button.setAttribute('aria-expanded', 'true');
    button.textContent = button.dataset.focusClose ?? button.textContent;
    button.focus();
  }, { signal });
  panel.addEventListener('keydown', (event) => {
    if (!panel.classList.contains('is-expanded')) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])')]
      .filter((element) => element.offsetParent !== null);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, { signal });
  return close;
}
