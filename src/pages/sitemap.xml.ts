import type { APIRoute } from 'astro';
import { renderSitemapXml } from '../seo/sitemap';
export const GET: APIRoute = () => new Response(renderSitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
