/**
 * Calculator state never appears in a crawlable href.
 *
 * Internal links that hand state to a calculator (`?current=…&new=…`, `?size=…`, `?category=…`,
 * `?a=…&b=…`, …) are rendered with the clean canonical path in `href` and the query in
 * `data-link-state`. `src/ui/state-link-enhancer.ts` puts the query back on the link the moment a
 * person points at, focuses or opens it, so clicks, middle-clicks, "open in new tab" and
 * "copy link" still carry the state. Crawlers that read the HTML only see clean URLs, so the
 * link graph has no parameter variants. Shared/bookmarked query URLs keep working unchanged.
 *
 * Pure string functions: no DOM, no Astro.
 */

const SITE_ORIGIN = 'https://atlasgarageos.com';

export interface StateHref { readonly href: string; readonly state: string }

/** Splits `/path/?q=1#frag` into `{ href: '/path/#frag', state: 'q=1' }`. Relative `?q` resolves against `pagePath`. */
export function splitStateHref(raw: string, pagePath = '/'): StateHref | null {
  const hashAt = raw.indexOf('#');
  const hash = hashAt >= 0 ? raw.slice(hashAt) : '';
  const beforeHash = hashAt >= 0 ? raw.slice(0, hashAt) : raw;
  const queryAt = beforeHash.indexOf('?');
  if (queryAt < 0) return null;
  let path = beforeHash.slice(0, queryAt);
  const state = beforeHash.slice(queryAt + 1);
  if (path.startsWith(SITE_ORIGIN)) path = path.slice(SITE_ORIGIN.length) || '/';
  if (path === '') path = pagePath;
  if (!path.startsWith('/') || path.startsWith('//')) return null; // external or protocol-relative: leave alone
  if (state === '') return { href: `${path}${hash}`, state: '' };
  return { href: `${path}${hash}`, state };
}

/** Attribute pair for templates: `<a {...stateLinkAttrs(url)}>`. */
export function stateLinkAttrs(url: string, pagePath = '/'): Readonly<Record<string, string>> {
  const split = splitStateHref(url, pagePath);
  if (!split) return { href: url };
  return split.state ? { href: split.href, 'data-link-state': split.state } : { href: split.href };
}

const ANCHOR = /<a\b[^>]*>/gi;
const HREF = /\shref="([^"]*)"/i;

/** Rewrites every internal `<a href="…?…">` in a rendered page. Idempotent. */
export function cleanStateLinks(html: string, pagePath: string): string {
  if (!html.includes('?')) return html;
  return html.replace(ANCHOR, (tag) => {
    if (/\sdata-link-state=/i.test(tag)) return tag;
    const match = HREF.exec(tag);
    if (!match || !match[1]!.includes('?')) return tag;
    // Attribute values are HTML-escaped; keep them escaped in both attributes.
    const split = splitStateHref(match[1]!.replace(/&amp;/g, '&'), pagePath);
    if (!split) return tag;
    const escape = (value: string): string => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const state = split.state ? ` data-link-state="${escape(split.state)}"` : '';
    return tag.replace(HREF, ` href="${escape(split.href)}"${state}`);
  });
}
