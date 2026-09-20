import { canonicalForPath, indexableRoutes, toolRegistry } from './tool-registry';
import { localizedToolPath } from '../localization/locales';

const LOCALIZED_PLATFORM_PATHS = ['/', '/tools/', '/methodology/', '/privacy-policy/'] as const;

function localizedRoutes(): readonly string[] {
  const locales = ['de', 'es'] as const;
  const routes: string[] = [];
  for (const locale of locales) {
    for (const path of LOCALIZED_PLATFORM_PATHS) {
      routes.push(path === '/' ? `/${locale}/` : `/${locale}${path}`);
    }
    for (const tool of toolRegistry) {
      // The fitment-studio flagship page has no localized version yet; it stays English-only.
      if (tool.id === 'fitment-studio') continue;
      if (!(tool.indexable && tool.status === 'implemented')) continue;
      routes.push(localizedToolPath(locale, tool.id, 'tool'));
    }
  }
  return routes;
}

const STANDALONE_CONTENT_ROUTES = ['/de/kraftstoffpreise/', '/es/precio-gasolina-hoy/'] as const;

export function sitemapEntries(): readonly string[] {
  return Object.freeze([...indexableRoutes, ...localizedRoutes(), ...STANDALONE_CONTENT_ROUTES].map(canonicalForPath));
}

export function renderSitemapXml(): string {
  const urls = sitemapEntries().map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
