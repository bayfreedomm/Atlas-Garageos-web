import type { SupportedLocale } from './catalog';

export type { SupportedLocale } from './catalog';
export type UnitSystem = 'metric' | 'imperial';
export type CurrencyCode = string;

export interface UserPreferences {
  readonly locale: SupportedLocale;
  readonly unitSystem: UnitSystem;
  readonly currency: CurrencyCode;
}

export const defaultPreferences: UserPreferences = {
  locale: 'en',
  unitSystem: 'metric',
  currency: 'USD',
};
