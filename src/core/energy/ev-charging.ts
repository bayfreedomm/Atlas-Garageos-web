import type { ChargingEfficiency, ChargePercent } from '../../domain/ev-charging';
import type { PositiveQuantity } from '../../domain/utility-calculators';

export interface EvChargingCalculationInput {
  readonly batteryCapacityKwh: PositiveQuantity;
  readonly startPercent: ChargePercent;
  readonly endPercent: ChargePercent;
  readonly pricePerKwh: PositiveQuantity;
  readonly chargerPowerKw: PositiveQuantity;
  readonly chargingEfficiency: ChargingEfficiency;
}

export function calculateEvCharging(input: EvChargingCalculationInput) {
  const batteryEnergyKwh = input.batteryCapacityKwh * ((input.endPercent - input.startPercent) / 100);
  const gridEnergyKwh = batteryEnergyKwh / (input.chargingEfficiency / 100);
  return Object.freeze({
    batteryEnergyKwh,
    gridEnergyKwh,
    chargingLossKwh: gridEnergyKwh - batteryEnergyKwh,
    cost: gridEnergyKwh * input.pricePerKwh,
    hours: gridEnergyKwh / input.chargerPowerKw,
  });
}
