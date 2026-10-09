import type { AtlasLocale } from '../localization/locales';

export type UiLocale = AtlasLocale;

const UI_LOCALES: readonly UiLocale[] = ['en', 'de', 'es', 'pt-br', 'fr', 'it', 'pl', 'nl', 'tr'];

/**
 * Every locale route sets `<html lang>` in SiteLayout.astro (pt-br renders as "pt-BR").
 * Client-side calculator scripts read it here instead of receiving an explicit prop, so no
 * per-page wiring is needed and the value always matches what the page actually rendered.
 */
export function getPageLocale(): UiLocale {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang.toLowerCase() : 'en';
  return (UI_LOCALES as readonly string[]).includes(lang) ? lang as UiLocale : 'en';
}
