import { calculateEvCharging } from '../../core/energy/ev-charging';
import { createChargePercentage, createEfficiencyPercentage } from '../../domain/ev-charging';
import { collectValid, createPositiveQuantity } from '../../domain/utility-calculators';
import { invalid, valid } from '../../domain/validation';

export interface EvChargingInput {
  readonly batteryCapacityKwh: number;
  readonly startPercent: number;
  readonly endPercent: number;
  readonly pricePerKwh: number;
  readonly chargerPowerKw: number;
  readonly chargingEfficiency: number;
}

export function calculateEvChargingCostTool(input: EvChargingInput) {
  const values = {
    batteryCapacityKwh: createPositiveQuantity(input.batteryCapacityKwh, 'batteryCapacityKwh'),
    startPercent: createChargePercentage(input.startPercent, 'startPercent'),
    endPercent: createChargePercentage(input.endPercent, 'endPercent'),
    pricePerKwh: createPositiveQuantity(input.pricePerKwh, 'pricePerKwh'),
    chargerPowerKw: createPositiveQuantity(input.chargerPowerKw, 'chargerPowerKw'),
    chargingEfficiency: createEfficiencyPercentage(input.chargingEfficiency),
  };
  const issues = collectValid(values);
  if (issues.length || !values.batteryCapacityKwh.ok || !values.startPercent.ok || !values.endPercent.ok || !values.pricePerKwh.ok || !values.chargerPowerKw.ok || !values.chargingEfficiency.ok) return invalid(...issues);
  if (input.endPercent <= input.startPercent) return invalid({ code: 'incompatible-values', field: 'endPercent', message: 'End charge must be higher than start charge.' });
  return valid(calculateEvCharging({ batteryCapacityKwh: values.batteryCapacityKwh.value, startPercent: values.startPercent.value, endPercent: values.endPercent.value, pricePerKwh: values.pricePerKwh.value, chargerPowerKw: values.chargerPowerKw.value, chargingEfficiency: values.chargingEfficiency.value }));
}
