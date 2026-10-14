import type { APIRoute } from 'astro';
import { canonicalForPath } from '../seo/tool-registry';

/**
 * Every URL is crawlable. Internal links never carry calculator state (src/seo/state-links.ts moves
 * it to data-link-state), so the link graph has no parameter variants; the query URLs that remain
 * come from shares and bookmarks, and crawling them lets Google read their clean canonical.
 * History: 2026-10-14 v7-16 briefly used `Disallow: /*?` while ~105,000 internal variants existed.
 */
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\nSitemap: ${canonicalForPath('/sitemap.xml')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
