import { describe, expect, it } from 'vitest';
import { calculateEvChargingCostTool } from '../../src/features/tools/ev-charging-tool';

describe('EV charging calculator', () => {
  it('separates battery energy from grid energy and includes charging loss in cost', () => {
    const result = calculateEvChargingCostTool({ batteryCapacityKwh: 64, startPercent: 20, endPercent: 80, pricePerKwh: .18, chargerPowerKw: 11, chargingEfficiency: 90 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.batteryEnergyKwh).toBeCloseTo(38.4);
    expect(result.value.gridEnergyKwh).toBeCloseTo(42.6667);
    expect(result.value.cost).toBeCloseTo(7.68);
    expect(result.value.hours).toBeCloseTo(3.8788);
  });

  it('rejects reversed charge targets and impossible efficiency', () => {
    expect(calculateEvChargingCostTool({ batteryCapacityKwh: 64, startPercent: 80, endPercent: 20, pricePerKwh: .18, chargerPowerKw: 11, chargingEfficiency: 90 }).ok).toBe(false);
    expect(calculateEvChargingCostTool({ batteryCapacityKwh: 64, startPercent: 20, endPercent: 80, pricePerKwh: .18, chargerPowerKw: 11, chargingEfficiency: 40 }).ok).toBe(false);
  });
});
