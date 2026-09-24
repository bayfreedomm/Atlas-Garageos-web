/**
 * Behaviour specific to /embed/ pages (components/EmbedTireComparison.astro):
 * - `?theme=light|dark` lets the host site match its own design (otherwise the visitor's system
 *   preference is used — the embed has no access to the preference saved on atlasgarageos.com
 *   when it is shown on someone else's domain).
 * - Reports its content height to the parent page so the optional snippet in the embed code can
 *   size the iframe without an inner scrollbar. Only a number is sent; nothing about the visitor.
 * - Keeps the "open the full tool" links pointing at the sizes currently entered.
 */

export const EMBED_HEIGHT_MESSAGE = 'atlas-garageos:embed-height';

function applyThemeOverride(): void {
  const theme = new URLSearchParams(window.location.search).get('theme');
  if (theme !== 'light' && theme !== 'dark') return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function reportHeight(): void {
  if (window.parent === window) return;
  let last = 0;
  const send = (): void => {
    const height = Math.ceil(document.documentElement.scrollHeight);
    if (height === last) return;
    last = height;
    window.parent.postMessage({ type: EMBED_HEIGHT_MESSAGE, height }, '*');
  };
  new ResizeObserver(send).observe(document.body);
  window.addEventListener('load', send);
  send();
}

function syncFullToolLinks(): void {
  const form = document.querySelector<HTMLFormElement>('form[data-calculator="tire-comparison"]');
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-embed-full-link]');
  if (!form || links.length === 0) return;
  const base = links[0]!.href.split('?')[0]!;
  const token = (prefix: string): string | null => {
    const parts = ['widthMm', 'aspectRatio', 'rimDiameterInches'].map((name) => (form.elements.namedItem(`${prefix}${name}`) as HTMLInputElement | null)?.value.trim() ?? '');
    return parts.every((part) => part !== '' && Number.isFinite(Number(part))) ? parts.join('-') : null;
  };
  const update = (): void => {
    const current = token('original-');
    const next = token('new-');
    const href = current && next ? `${base}?${new URLSearchParams({ current, new: next }).toString()}` : base;
    links.forEach((link) => { link.href = href; });
  };
  form.addEventListener('input', update);
  update();
}

export function initializeEmbedFrame(): void {
  applyThemeOverride();
  if (window.parent !== window) document.body.classList.add('is-embedded');
  reportHeight();
  syncFullToolLinks();
}
