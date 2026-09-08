import type { APIRoute } from 'astro';
import { canonicalForPath } from '../seo/tool-registry';
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\nSitemap: ${canonicalForPath('/sitemap.xml')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
