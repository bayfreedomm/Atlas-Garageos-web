export type UiLocale = 'en' | 'de' | 'es';

/**
 * Every locale route (`/`, `/de/...`, `/es/...`) sets `<html lang="en|de|es">`
 * in SiteLayout.astro. Client-side calculator scripts read it here instead of
 * receiving an explicit prop, so no per-page wiring is needed and the value
 * always matches what the page actually rendered.
 */
export function getPageLocale(): UiLocale {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  if (lang === 'de' || lang === 'es') return lang;
  return 'en';
}
