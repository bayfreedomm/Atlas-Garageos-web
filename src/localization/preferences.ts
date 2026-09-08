import type { SupportedLocale } from './catalog';
import type { CurrencyCode, UnitSystem } from '../domain/preferences';

export type { SupportedLocale } from './catalog';
export type { CurrencyCode, UnitSystem } from '../domain/preferences';

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
