import type { APIRoute } from 'astro';
import { tireSizeCatalog } from '../data/tire-size-catalog';

/**
 * Compact [slug, notation] list for the tire-size lookup box. One static file shared by every
 * locale (slugs are identical across locales), fetched only when a reader starts typing, so
 * no page carries the full catalog in its HTML.
 */
export const GET: APIRoute = () => new Response(
  JSON.stringify(tireSizeCatalog.map((entry) => [entry.slug, entry.notation])),
  { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
);
