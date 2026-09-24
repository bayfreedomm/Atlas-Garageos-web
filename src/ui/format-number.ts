import { getPageLocale } from './page-locale';

/**
 * Display-only number formatting. The locale defaults to the page's `<html lang>` so DE/ES pages
 * get "43,4" rather than "43.4" without every caller passing it. Never feed the result back into
 * a number input or Number(): it may contain a decimal comma or grouping separators. (Outside a
 * browser — tests, build — getPageLocale() returns 'en', so existing outputs are unchanged.)
 */
export function formatNumber(value: number, maximumFractionDigits = 2, locale: string = getPageLocale()): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}
