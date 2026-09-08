export function formatNumber(value: number, maximumFractionDigits = 2, locale = 'en'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}
