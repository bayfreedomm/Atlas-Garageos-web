/**
 * Reference-only locales: languages that publish the data-driven reference families (tire
 * sizes, tire heights, bolt patterns, vehicles) and a localized home, while calculators, the
 * fitment studio and policy pages stay in English for them. One list drives routing, hreflang,
 * the sitemap and the page chrome, so adding a language is a data change.
 */
export const REFERENCE_LOCALES = ['fr', 'it', 'pt-br', 'pl', 'nl', 'tr'] as const;
export type ReferenceLocale = (typeof REFERENCE_LOCALES)[number];

export function isReferenceLocale(code: string | undefined): code is ReferenceLocale {
  return code !== undefined && (REFERENCE_LOCALES as readonly string[]).includes(code);
}

export interface ReferenceLocaleMeta {
  /** <html lang> value. */
  readonly htmlLang: string;
  /** hreflang attribute value. */
  readonly hreflang: string;
  /** Header switcher chip. */
  readonly short: string;
  /** Drawer switcher label, in the language itself. */
  readonly full: string;
}

export const REFERENCE_LOCALE_META: Readonly<Record<ReferenceLocale, ReferenceLocaleMeta>> = Object.freeze({
  fr: { htmlLang: 'fr', hreflang: 'fr', short: 'FR', full: 'Français' },
  it: { htmlLang: 'it', hreflang: 'it', short: 'IT', full: 'Italiano' },
  'pt-br': { htmlLang: 'pt-BR', hreflang: 'pt-BR', short: 'PT', full: 'Português (Brasil)' },
  pl: { htmlLang: 'pl', hreflang: 'pl', short: 'PL', full: 'Polski' },
  nl: { htmlLang: 'nl', hreflang: 'nl', short: 'NL', full: 'Nederlands' },
  tr: { htmlLang: 'tr', hreflang: 'tr', short: 'TR', full: 'Türkçe' },
});
