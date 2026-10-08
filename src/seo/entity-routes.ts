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
import { publishedLocales, type AtlasLocale } from '../localization/locales';

export type EntityFamily = 'tire-size' | 'bolt-pattern';
/** The locales these families actually publish in. Narrower than AtlasLocale by design. */
export type EntityLocale = 'en' | 'de' | 'es' | 'fr';

/**
 * One localized top-level path segment per family per locale. German follows the compound-noun
 * convention already used by the DE tool slugs ('reifengroesse-rechner', 'lochkreis-rechner');
 * Spanish follows the descriptive-phrase convention ('calculadora-tamano-neumaticos',
 * 'calculadora-patron-birlos'). Both use the same ASCII transliteration rules as those slugs.
 */
const ENTITY_SEGMENTS: Readonly<Record<EntityFamily, Readonly<Record<EntityLocale, string>>>> = Object.freeze({
  'tire-size': Object.freeze({ en: 'tire-sizes', de: 'reifengroessen', es: 'medidas-neumaticos', fr: 'dimensions-pneus' }),
  'bolt-pattern': Object.freeze({ en: 'bolt-patterns', de: 'lochkreise', es: 'patrones-birlos', fr: 'entraxes' }),
});

const ENTITY_LOCALE_ORDER: readonly EntityLocale[] = Object.freeze(['en', 'de', 'es', 'fr']);

function isEntityLocale(code: AtlasLocale): code is EntityLocale {
  return code === 'en' || code === 'de' || code === 'es' || code === 'fr';
}

/**
 * Published locales that this route family has localized copy and a URL segment for.
 * Derived from publishedLocales() so pt-br/fr (published: false) can never leak in.
 */
/**
 * Locales whose reference families (tire sizes, bolt patterns) are published ahead of the full
 * site translation. French has complete, reviewed copy for these two families and a French
 * home; its calculators stay unpublished (published: false in locales.ts) until translated.
 */
const ENTITY_FAMILY_ONLY_LOCALES: readonly EntityLocale[] = Object.freeze(['fr']);

export function entityLocales(): readonly EntityLocale[] {
  const published = new Set<string>([...publishedLocales(), ...ENTITY_FAMILY_ONLY_LOCALES]);
  return Object.freeze(ENTITY_LOCALE_ORDER.filter((code) => published.has(code) && isEntityLocale(code)));
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
    ...entityLocales().map((locale) => ({ hreflang: locale, href: href(locale) })),
    { hreflang: 'x-default', href: href('en') },
  ]);
}
