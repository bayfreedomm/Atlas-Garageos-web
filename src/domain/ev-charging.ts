import { invalid, valid, type ValidationResult } from './validation';

declare const percentBrand: unique symbol;
declare const efficiencyBrand: unique symbol;
export type ChargePercent = number & { readonly [percentBrand]: true };
export type ChargingEfficiency = number & { readonly [efficiencyBrand]: true };

export function createChargePercent(value: number, field: string): ValidationResult<ChargePercent> {
  if (!Number.isFinite(value)) return invalid({ code: 'not-a-number', field, message: `${field} must be a finite number.`, received: value });
  if (value < 0 || value > 100) return invalid({ code: 'out-of-range', field, message: `${field} must be between 0 and 100.`, received: value });
  return valid(value as ChargePercent);
}

export function createChargingEfficiency(value: number): ValidationResult<ChargingEfficiency> {
  if (!Number.isFinite(value)) return invalid({ code: 'not-a-number', field: 'chargingEfficiency', message: 'Charging efficiency must be a finite number.', received: value });
  if (value < 50 || value > 100) return invalid({ code: 'out-of-range', field: 'chargingEfficiency', message: 'Charging efficiency must be between 50 and 100.', received: value });
  return valid(value as ChargingEfficiency);
}
