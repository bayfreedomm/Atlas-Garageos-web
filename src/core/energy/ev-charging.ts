import type { EfficiencyPercentage, ChargePercentage } from '../../domain/ev-charging';
import type { PositiveQuantity } from '../../domain/utility-calculators';

export interface EvChargingCalculationInput {
  readonly batteryCapacityKwh: PositiveQuantity;
  readonly startPercent: ChargePercentage;
  readonly endPercent: ChargePercentage;
  readonly pricePerKwh: PositiveQuantity;
  readonly chargerPowerKw: PositiveQuantity;
  readonly chargingEfficiency: EfficiencyPercentage;
}

export interface EvChargingCalculationResult {
  readonly batteryEnergyKwh: number;
  readonly gridEnergyKwh: number;
  readonly chargingLossKwh: number;
  readonly cost: number;
  readonly hours: number;
}

export function calculateEvCharging(input: EvChargingCalculationInput): EvChargingCalculationResult {
  const batteryEnergyKwh = input.batteryCapacityKwh * ((input.endPercent - input.startPercent) / 100);
  const gridEnergyKwh = batteryEnergyKwh / (input.chargingEfficiency / 100);
  return {
    batteryEnergyKwh,
    gridEnergyKwh,
    chargingLossKwh: gridEnergyKwh - batteryEnergyKwh,
    cost: gridEnergyKwh * input.pricePerKwh,
    hours: gridEnergyKwh / input.chargerPowerKw,
  };
}
