import type { UnitSystem } from '../domain/utility-calculators';

export const UNIT_SYSTEM_STORAGE_KEY = 'atlas-unit-system';
export const CURRENCY_STORAGE_KEY = 'atlas-currency';

export const parseUnitSystem = (value: unknown): UnitSystem => value === 'imperial' ? 'imperial' : 'metric';
export const parseCurrencyLabel = (value: unknown): string => typeof value === 'string' && /^[A-Z]{3}$/.test(value) ? value : 'USD';
