import { calculateEvCharging } from '../../core/energy/ev-charging';
import { createChargePercent, createChargingEfficiency } from '../../domain/ev-charging';
import { createPositiveQuantity } from '../../domain/utility-calculators';
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
  const batteryCapacityKwh = createPositiveQuantity(input.batteryCapacityKwh, 'batteryCapacityKwh');
  const startPercent = createChargePercent(input.startPercent, 'startPercent');
  const endPercent = createChargePercent(input.endPercent, 'endPercent');
  const pricePerKwh = createPositiveQuantity(input.pricePerKwh, 'pricePerKwh');
  const chargerPowerKw = createPositiveQuantity(input.chargerPowerKw, 'chargerPowerKw');
  const chargingEfficiency = createChargingEfficiency(input.chargingEfficiency);
  const validated = { batteryCapacityKwh, startPercent, endPercent, pricePerKwh, chargerPowerKw, chargingEfficiency };
  const issues = Object.values(validated).flatMap((result) => result.ok ? [] : result.issues);
  if (issues.length || !batteryCapacityKwh.ok || !startPercent.ok || !endPercent.ok || !pricePerKwh.ok || !chargerPowerKw.ok || !chargingEfficiency.ok) return invalid(...issues);
  if (endPercent.value <= startPercent.value) return invalid({ code: 'incompatible-values', field: 'endPercent', message: 'End charge must be higher than start charge.' });
  return valid(calculateEvCharging({ batteryCapacityKwh: batteryCapacityKwh.value, startPercent: startPercent.value, endPercent: endPercent.value, pricePerKwh: pricePerKwh.value, chargerPowerKw: chargerPowerKw.value, chargingEfficiency: chargingEfficiency.value }));
}
