import type { APIRoute } from 'astro';

/**
 * Commit that produced this deployment. Cloudflare Workers Builds exposes it as
 * WORKERS_CI_COMMIT_SHA; GitHub Actions as GITHUB_SHA. The IndexNow workflow polls this file
 * so it only notifies search engines after the new pages are actually live.
 */
const commit = process.env.WORKERS_CI_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local';
export const GET: APIRoute = () => new Response(`${commit}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
