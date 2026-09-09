import { invalid, valid, type ValidationIssue } from '../../domain/validation';

export interface EvChargingInput {
  readonly batteryCapacityKwh: number;
  readonly startPercent: number;
  readonly endPercent: number;
  readonly pricePerKwh: number;
  readonly chargerPowerKw: number;
}

export interface EvChargingResult {
  readonly energyAddedKwh: number;
  readonly cost: number;
  readonly hours: number;
}

function calculateEvChargingCost(input: EvChargingInput): EvChargingResult {
  const percentAdded = Math.max(0, input.endPercent - input.startPercent);
  const energyAddedKwh = input.batteryCapacityKwh * (percentAdded / 100);
  const cost = energyAddedKwh * input.pricePerKwh;
  const hours = input.chargerPowerKw > 0 ? energyAddedKwh / input.chargerPowerKw : 0;
  return { energyAddedKwh, cost, hours };
}

const check = (value: number, field: string, min: number, max: number): ValidationIssue | null => {
  if (Number.isNaN(value)) return { code: 'not-a-number', field, message: `${field} must be a number.` };
  if (value < min || value > max) return { code: 'out-of-range', field, message: `${field} must be between ${min} and ${max}.`, received: value };
  return null;
};

export function calculateEvChargingCostTool(input: EvChargingInput) {
  const issues = [
    check(input.batteryCapacityKwh, 'batteryCapacityKwh', 1, 250),
    check(input.startPercent, 'startPercent', 0, 100),
    check(input.endPercent, 'endPercent', 0, 100),
    check(input.pricePerKwh, 'pricePerKwh', 0, 10),
    check(input.chargerPowerKw, 'chargerPowerKw', 0.1, 400),
  ].filter((issue): issue is ValidationIssue => issue !== null);
  if (issues.length) return invalid(...issues);
  if (input.endPercent <= input.startPercent) return invalid({ code: 'incompatible-values', field: 'endPercent', message: 'End charge must be higher than start charge.' });
  return valid(calculateEvChargingCost(input));
}
