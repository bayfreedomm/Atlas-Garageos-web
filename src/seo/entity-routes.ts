/**
 * Localized routing for the data-driven entity page families (tire sizes, bolt patterns).
 *
 * These are deliberately NOT part of the `ToolId` union in tool-registry.ts. That union is
 * the closed list of ~24 hand-built tools and data products; every one of them has its own
 * page file, its own copy, and its own registry row. Tire-size and bolt-pattern pages are a
 * different shape: a single dynamic route per locale that generates one page per row of a
 * catalog derived from vehicleFitmentData. Forcing them into `ToolId` would mean editing a
 * union type every time a vehicle with a new tire size is added, which is exactly the manual
 * step this route family exists to remove.
 *
 * The URL convention still matches locales.ts exactly: '' / '/de' / '/es' prefixes, one
 * localized top-level segment per locale, trailing slash. The locale list itself comes from
 * publishedLocales() rather than being redefined here, so unpublishing a locale removes its
 * entity pages too.
 */
import { publishedLocales } from '../localization/locales';
import { REFERENCE_LOCALES, REFERENCE_LOCALE_META, isReferenceLocale, type ReferenceLocale } from '../localization/reference-locales';

export type EntityFamily = 'tire-size' | 'bolt-pattern';
/** The locales these families actually publish in. Narrower than AtlasLocale by design. */
export type EntityLocale = 'en' | 'de' | 'es' | ReferenceLocale;
/** Locales with their own calculators and tool pages (the reference-only locales link to EN). */
export type ToolEntityLocale = 'en' | 'de' | 'es';

/** The tool-page locale to link to from an entity page: reference-only locales use English. */
export function toolLocaleFor(locale: EntityLocale): ToolEntityLocale {
  return isReferenceLocale(locale) ? 'en' : locale;
}

/**
 * One localized top-level path segment per family per locale. German follows the compound-noun
 * convention already used by the DE tool slugs ('reifengroesse-rechner', 'lochkreis-rechner');
 * Spanish follows the descriptive-phrase convention ('calculadora-tamano-neumaticos',
 * 'calculadora-patron-birlos'). Both use the same ASCII transliteration rules as those slugs.
 */
const ENTITY_SEGMENTS: Readonly<Record<EntityFamily, Readonly<Record<EntityLocale, string>>>> = Object.freeze({
  'tire-size': Object.freeze({ en: 'tire-sizes', de: 'reifengroessen', es: 'medidas-neumaticos', fr: 'dimensions-pneus', it: 'misure-pneumatici', 'pt-br': 'medidas-pneus', pl: 'rozmiary-opon', nl: 'bandenmaten', tr: 'lastik-ebatlari' }),
  'bolt-pattern': Object.freeze({ en: 'bolt-patterns', de: 'lochkreise', es: 'patrones-birlos', fr: 'entraxes', it: 'foratura-cerchi', 'pt-br': 'furacao-rodas', pl: 'rozstaw-srub', nl: 'steekmaten', tr: 'bijon-araligi' }),
});

const ENTITY_LOCALE_ORDER: readonly EntityLocale[] = Object.freeze(['en', 'de', 'es', ...REFERENCE_LOCALES]);

/**
 * Locales these families publish in: the published full-site locales (EN/DE/ES) plus every
 * reference-only locale (see reference-locales.ts), whose calculators stay in English.
 */
export function entityLocales(): readonly EntityLocale[] {
  const published = new Set<string>([...publishedLocales(), ...REFERENCE_LOCALES]);
  return Object.freeze(ENTITY_LOCALE_ORDER.filter((code) => published.has(code)));
}

/** hreflang value for an entity locale (pt-br → pt-BR). */
export function entityHreflang(locale: EntityLocale): string {
  return isReferenceLocale(locale) ? REFERENCE_LOCALE_META[locale].hreflang : locale;
}

export function entitySegment(family: EntityFamily, locale: EntityLocale): string {
  return ENTITY_SEGMENTS[family][locale];
}

export function entityHubPath(family: EntityFamily, locale: EntityLocale): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}/${entitySegment(family, locale)}/`;
}

export function entityDetailPath(family: EntityFamily, locale: EntityLocale, slug: string): string {
  return `${entityHubPath(family, locale)}${slug}/`;
}

export interface HreflangAlternate { readonly hreflang: string; readonly href: string; }

const SITE = 'https://atlasgarageos.com';

/** hreflang set for a hub (slug omitted) or a detail page, with en as x-default. */
export function entityAlternates(family: EntityFamily, slug?: string): readonly HreflangAlternate[] {
  const href = (locale: EntityLocale): string =>
    `${SITE}${slug === undefined ? entityHubPath(family, locale) : entityDetailPath(family, locale, slug)}`;
  return Object.freeze([
    ...entityLocales().map((locale) => ({ hreflang: entityHreflang(locale), href: href(locale) })),
    { hreflang: 'x-default', href: href('en') },
  ]);
}
