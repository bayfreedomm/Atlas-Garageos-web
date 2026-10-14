import type { APIRoute } from 'astro';
import { canonicalForPath } from '../seo/tool-registry';

/**
 * Query-string URLs are calculator application state (?current=…&new=…, ?size=…, shared
 * ?tool=…&state=…), never indexable pages: every one canonicalises to its clean route. Internal
 * hand-off links create ~100,000 distinct variants, so crawling them would spend crawl budget the
 * ~49,000 real pages need. Clean URLs stay fully crawlable.
 */
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\nDisallow: /*?\nSitemap: ${canonicalForPath('/sitemap.xml')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
