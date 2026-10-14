import type { APIRoute, GetStaticPaths } from 'astro';
import { SITEMAP_GROUP_IDS, renderSitemapGroupXml, type SitemapGroupId } from '../seo/sitemap';

export const getStaticPaths: GetStaticPaths = () => SITEMAP_GROUP_IDS.map((group) => ({ params: { group } }));

export const GET: APIRoute = ({ params }) => new Response(renderSitemapGroupXml(params.group as SitemapGroupId), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
