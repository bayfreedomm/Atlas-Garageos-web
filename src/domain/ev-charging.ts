import { invalid, valid, type ValidationResult } from './validation';

declare const chargePercentageBrand: unique symbol;
declare const efficiencyPercentageBrand: unique symbol;

export type ChargePercentage = number & { readonly [chargePercentageBrand]: true };
export type EfficiencyPercentage = number & { readonly [efficiencyPercentageBrand]: true };

function boundedPercentage<T extends number>(value: number, field: string, minimum: number, maximum: number): ValidationResult<T> {
  if (!Number.isFinite(value)) return invalid({ code: 'not-a-number', field, message: `${field} must be a finite number.`, received: value });
  if (value < minimum || value > maximum) return invalid({ code: 'out-of-range', field, message: `${field} must be between ${minimum} and ${maximum}.`, received: value });
  return valid(value as T);
}

export const createChargePercentage = (value: number, field: string): ValidationResult<ChargePercentage> => boundedPercentage<ChargePercentage>(value, field, 0, 100);
export const createEfficiencyPercentage = (value: number): ValidationResult<EfficiencyPercentage> => boundedPercentage<EfficiencyPercentage>(value, 'chargingEfficiency', 50, 100);
