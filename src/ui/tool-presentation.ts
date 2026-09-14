import type { ValidationIssue } from '../domain/validation';
import type { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool } from '../features/tools/calculator-tools';
import { formatNumber } from './format-number';
import { validationIssueText } from './presentation-model';

export interface PresentedMetric { readonly label: string; readonly value: string; }

const direction = (value: number, positive: string, negative: string): string => `${formatNumber(Math.abs(value))} mm ${value >= 0 ? positive : negative}`;

export function tireCalculatorSummary(result: Parameters<typeof tireCalculatorMetrics>[0]): string {
  return `Overall diameter is ${formatNumber(result.overallDiameterMm)} mm, with a ${formatNumber(result.sidewallHeightMm)} mm sidewall.`;
}

export function tireComparisonSummary(result: ValidValue<typeof compareTireSizesTool>): string {
  const sizeDirection = result.diameterDifferenceMm >= 0 ? 'taller' : 'shorter';
  const rideDirection = result.rideHeightDifferenceMm >= 0 ? 'raises' : 'lowers';
  return `The new tire is ${formatNumber(Math.abs(result.diameterDifferenceMm))} mm ${sizeDirection} overall and ${rideDirection} the vehicle by approximately ${formatNumber(Math.abs(result.rideHeightDifferenceMm))} mm.`;
}

export function wheelOffsetSummary(result: ValidValue<typeof calculateWheelOffsetTool>): string {
  return `The new wheel reaches ${direction(result.outerPokeChangeMm, 'farther outward', 'less outward')} and ${direction(result.innerPositionChangeMm, 'farther inward', 'less inward')}.`;
}

export function speedometerSummary(result: ValidValue<typeof calculateSpeedometerTool>): string {
  return `At an indicated ${formatNumber(result.indicatedSpeed)} ${result.unit}, calculated actual speed is ${formatNumber(result.actualSpeed)} ${result.unit}.`;
}

export function tireCalculatorMetrics(result: Extract<ReturnType<typeof calculateTireSizeTool>, { ok: true }>['value']): readonly PresentedMetric[] {
  return Object.freeze([
    { label: 'Overall diameter', value: `${formatNumber(result.overallDiameterMm)} mm` },
    { label: 'Sidewall height', value: `${formatNumber(result.sidewallHeightMm)} mm` },
    { label: 'Circumference', value: `${formatNumber(result.circumferenceMm)} mm` },
    { label: 'Revolutions per mile', value: formatNumber(result.revolutionsPerMile) },
    { label: 'Revolutions per kilometer', value: formatNumber(result.revolutionsPerKilometer) },
  ]);
}

export const toolIssueText = (issue: ValidationIssue): string => validationIssueText(issue);

type ValidValue<T extends (...args: never[]) => unknown> = ReturnType<T> extends infer Result ? Result extends { readonly ok: true; readonly value: infer Value } ? Value : never : never;

export function tireComparisonMetrics(result: ValidValue<typeof compareTireSizesTool>): readonly PresentedMetric[] {
  return Object.freeze([
    { label: 'Overall diameter change', value: `${formatNumber(result.diameterDifferenceMm)} mm` },
    { label: 'Diameter change', value: `${formatNumber(result.diameterDifferencePercent)} %` },
    { label: 'Sidewall change', value: `${formatNumber(result.sidewallDifferenceMm)} mm` },
    { label: 'Circumference change', value: `${formatNumber(result.circumferenceDifferenceMm)} mm` },
    { label: 'Static ride-height change', value: `${formatNumber(result.rideHeightDifferenceMm)} mm` },
    { label: 'Theoretical speed change', value: `${formatNumber(result.speedometerDifferencePercent)} %` },
  ]);
}

export function wheelOffsetMetrics(result: ValidValue<typeof calculateWheelOffsetTool>): readonly PresentedMetric[] {
  return Object.freeze([
    { label: 'Inner-position change', value: `${formatNumber(result.innerPositionChangeMm)} mm` },
    { label: 'Outer-poke change', value: `${formatNumber(result.outerPokeChangeMm)} mm` },
  ]);
}

export function speedometerMetrics(result: ValidValue<typeof calculateSpeedometerTool>): readonly PresentedMetric[] {
  return Object.freeze([
    { label: 'Indicated speed', value: `${formatNumber(result.indicatedSpeed)} ${result.unit}` },
    { label: 'Calculated actual speed', value: `${formatNumber(result.actualSpeed)} ${result.unit}` },
    { label: 'Diameter difference', value: `${formatNumber(result.diameterDifferenceMm)} mm` },
    { label: 'Speed difference', value: `${formatNumber(result.diameterDifferencePercent)} %` },
  ]);
}
