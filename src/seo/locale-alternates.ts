import { LOCALE_CODES, localeDefinitions, localizedToolPath, type AtlasLocale } from '../localization/locales';
import { canonicalForPath, toolById, type ToolId } from './tool-registry';

export interface HreflangAlternate { readonly hreflang: string; readonly href: string; }

/** Pages that exist under the same path in every locale (the locale prefix is the only change). */
export type PlatformPath = '/' | '/tools/' | '/methodology/' | '/privacy-policy/' | '/contact/' | '/fitment-studio/';

/** Fuel market pages are market-specific and keep no cross-market alternates. */
const LOCALE_SPECIFIC_TOOLS: readonly ToolId[] = ['gas-prices-today'];

export function localePrefixedPath(locale: AtlasLocale, path: string): string {
  return locale === 'en' ? path : `/${locale}${path}`;
}

/** Path of a tool in a locale; the fitment studio keeps the same slug in every locale. */
export function localizedToolRoute(locale: AtlasLocale, id: ToolId): string {
  if (id === 'fitment-studio') return localePrefixedPath(locale, '/fitment-studio/');
  return localizedToolPath(locale, id, toolById(id).kind);
}

function withDefault(entries: readonly HreflangAlternate[]): readonly HreflangAlternate[] {
  return Object.freeze([...entries, { hreflang: 'x-default', href: entries[0]!.href }]);
}

/** Every published translation of a calculator, plus x-default (English). */
export function toolAlternates(id: ToolId): readonly HreflangAlternate[] {
  if (LOCALE_SPECIFIC_TOOLS.includes(id)) return Object.freeze([]);
  return withDefault(LOCALE_CODES.map((code) => ({ hreflang: localeDefinitions[code].hreflang, href: canonicalForPath(localizedToolRoute(code, id)) })));
}

/** Every published translation of a platform page (home, tools index, policies, fitment studio). */
export function platformAlternates(path: PlatformPath): readonly HreflangAlternate[] {
  return withDefault(LOCALE_CODES.map((code) => ({ hreflang: localeDefinitions[code].hreflang, href: canonicalForPath(localePrefixedPath(code, path)) })));
}

/** Language switcher links (native labels) for pages that build their own header. */
export function localeSwitchLinks(path: PlatformPath): readonly { readonly code: string; readonly label: string; readonly href: string }[] {
  return LOCALE_CODES.map((code) => ({ code, label: localeDefinitions[code].nativeLabel, href: localePrefixedPath(code, path) }));
}
