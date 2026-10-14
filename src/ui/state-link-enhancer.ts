/**
 * Puts calculator state back on links rendered with a clean href (see src/seo/state-links.ts).
 * Runs on the first pointer, focus or context-menu interaction with the link, before the browser
 * reads the href, so normal clicks, middle-clicks, new tabs and "copy link" all carry the state.
 *
 * Links that scripts create or update after load (calculator hand-offs, finder results) get the
 * same treatment through a MutationObserver, so the rendered DOM a crawler sees stays clean too.
 */
import { splitStateHref } from '../seo/state-links';

export function withState(href: string, state: string): string {
  if (!state) return href;
  const hashAt = href.indexOf('#');
  const path = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const hash = hashAt >= 0 ? href.slice(hashAt) : '';
  return `${path}${path.includes('?') ? '&' : '?'}${state}${hash}`;
}

function restore(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-link-state]') : null;
  if (!target) return;
  const state = target.dataset.linkState ?? '';
  target.removeAttribute('data-link-state');
  target.dataset.linkRestored = 'true';
  target.setAttribute('href', withState(target.getAttribute('href') ?? '', state));
}

/** Sets a clean href plus state on a link created at runtime. */
export function setStateLink(link: HTMLAnchorElement, href: string, state: string): void {
  link.setAttribute('href', href);
  if (state) link.dataset.linkState = state; else delete link.dataset.linkState;
}

function clean(link: HTMLAnchorElement): void {
  if (link.dataset.linkRestored === 'true') return;
  const raw = link.getAttribute('href');
  if (!raw || !raw.includes('?')) return;
  const split = splitStateHref(raw, window.location.pathname);
  if (!split) return;
  link.setAttribute('href', split.href);
  if (split.state) link.dataset.linkState = split.state; else delete link.dataset.linkState;
}

function sweep(node: Node): void {
  if (node instanceof HTMLAnchorElement) clean(node);
  if (node instanceof Element) node.querySelectorAll<HTMLAnchorElement>('a[href*="?"]').forEach(clean);
}

export function enhanceStateLinks(root: Document = document): void {
  for (const name of ['pointerdown', 'focusin', 'contextmenu', 'click', 'auxclick'] as const) {
    root.addEventListener(name, restore, { capture: true, passive: true });
  }
  sweep(root.body);
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') sweep(record.target);
      else record.addedNodes.forEach(sweep);
    }
  }).observe(root.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
}
