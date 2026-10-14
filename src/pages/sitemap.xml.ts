import type { APIRoute } from 'astro';
import { renderSitemapIndexXml } from '../seo/sitemap';

/** Sitemap index: one child sitemap per page type (see src/seo/sitemap.ts). */
export const GET: APIRoute = () => new Response(renderSitemapIndexXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
