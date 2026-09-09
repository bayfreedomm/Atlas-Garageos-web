import { describe, expect, it } from 'vitest';
import { calculateDirectDriveRpmTool, calculateGearRatioTool } from '../../src/features/tools/gear-ratio-tool';

describe('gear ratio calculator', () => {
  it('shows both effective gearing and the ratio that restores the original relationship', () => {
    const result = calculateGearRatioTool({ currentDiameter: 31, newDiameter: 35, currentRatio: 3.73, speedMph: 65 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.effectiveRatio).toBeCloseTo(3.3037, 3);
    expect(result.value.matchingAxleRatio).toBeCloseTo(4.2113, 3);
    expect(result.value.rpmAtSpeedDirectDrive).toBeCloseTo(2327.52, 1);
  });

  it('keeps matrix RPM explicit to direct drive and validates untrusted inputs', () => {
    const rpm = calculateDirectDriveRpmTool(35, 4.1, 65);
    expect(rpm.ok && rpm.value).toBeCloseTo(2558.4, 1);
    expect(calculateGearRatioTool({ currentDiameter: 0, newDiameter: 35, currentRatio: 3.73, speedMph: 65 }).ok).toBe(false);
  });
});
