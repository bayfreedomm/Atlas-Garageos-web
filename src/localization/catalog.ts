import { en } from './catalogs/en';

export const catalogs = { en } as const;
export type SupportedLocale = keyof typeof catalogs;
export type MessageKey = keyof typeof en;

export function translate(locale: SupportedLocale, key: MessageKey): string {
  return catalogs[locale][key];
}
