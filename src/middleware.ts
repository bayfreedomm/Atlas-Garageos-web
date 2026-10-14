import { defineMiddleware } from 'astro:middleware';
import { cleanStateLinks } from './seo/state-links';

/**
 * Every rendered page leaves the build with clean internal hrefs: calculator state moves from
 * the query string into `data-link-state` (src/seo/state-links.ts). One enforcement point, so
 * new components cannot reintroduce parameter URLs into the crawl graph.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;
  const html = await response.text();
  return new Response(cleanStateLinks(html, context.url.pathname), { status: response.status, statusText: response.statusText, headers: response.headers });
});
