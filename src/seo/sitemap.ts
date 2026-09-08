import { canonicalForPath, indexableRoutes } from './tool-registry';

export function sitemapEntries(): readonly string[] {
  return Object.freeze(indexableRoutes.map(canonicalForPath));
}

export function renderSitemapXml(): string {
  const urls = sitemapEntries().map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
