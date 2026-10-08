/**
 * Locale-aware number presentation for the static entity and vehicle pages.
 *
 * The calculations themselves are locale-independent; only the decimal separator and the
 * spacing before a percent sign change. German and Spanish readers expect "631,9 mm" and
 * "55 %", English readers "631.9 mm" and "55%". Grouping separators are deliberately not
 * added: four-digit engineering figures such as a 1985,2 mm circumference read cleanly
 * without them in all three languages, and it keeps every rendered value unambiguous.
 */
export type NumberLocale = 'en' | 'de' | 'es' | 'fr';

/** Fixed-digit decimal with the locale's decimal separator. Minus is the typographic sign. */
export function formatDecimal(value: number, digits: number, locale: NumberLocale): string {
  const text = Math.abs(value).toFixed(digits);
  const localized = locale === 'en' ? text : text.replace('.', ',');
  return value < 0 && Number(text) !== 0 ? `−${localized}` : localized;
}

/** A plain number that may or may not carry decimals (e.g. a PCD of 112 or 114.3). */
export function formatPlain(value: number, locale: NumberLocale): string {
  const text = String(value);
  return locale === 'en' ? text : text.replace('.', ',');
}

export function formatMm(value: number, digits: number, locale: NumberLocale): string {
  return `${formatDecimal(value, digits, locale)} mm`;
}

/** "55%" in English, "55 %" in German and Spanish. */
export function formatPercent(value: number, digits: number, locale: NumberLocale): string {
  const number = formatDecimal(value, digits, locale);
  return locale === 'en' ? `${number}%` : `${number} %`;
}

/** Signed difference with an explicit plus sign, e.g. "+1,3 mm" or "−0,72 %". */
export function formatSigned(value: number, digits: number, unit: string, locale: NumberLocale): string {
  const rounded = Number(Math.abs(value).toFixed(digits));
  const sign = rounded === 0 ? '' : value > 0 ? '+' : '−';
  const number = formatDecimal(Math.abs(value), digits, locale);
  if (unit === '%') return locale === 'en' ? `${sign}${number}%` : `${sign}${number} %`;
  return `${sign}${number} ${unit}`;
}
