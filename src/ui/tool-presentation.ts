import type { ValidationIssue } from '../domain/validation';
import type { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool } from '../features/tools/calculator-tools';
import { formatNumber } from './format-number';
import { validationIssueText } from './presentation-model';

export interface PresentedMetric { readonly label: string; readonly value: string; }

export function tireCalculatorMetrics(result: Extract<ReturnType<typeof calculateTireSizeTool>, { ok: true }>['value']): readonly PresentedMetric[] {
  return Object.freeze([
    { label: 'Sidewall height', value: `${formatNumber(result.sidewallHeightMm)} mm` },
    { label: 'Overall diameter', value: `${formatNumber(result.overallDiameterMm)} mm` },
    { label: 'Circumference', value: `${formatNumber(result.circumferenceMm)} mm` },
    { label: 'Revolutions per mile', value: formatNumber(result.revolutionsPerMile) },
    { label: 'Revolutions per kilometer', value: formatNumber(result.revolutionsPerKilometer) },
  ]);
}

export const toolIssueText = (issue: ValidationIssue): string => validationIssueText(issue);

type ValidValue<T extends (...args: never[]) => unknown> = ReturnType<T> extends infer Result ? Result extends { readonly ok: true; readonly value: infer Value } ? Value : never : never;

export function tireComparisonMetrics(result: ValidValue<typeof compareTireSizesTool>): readonly PresentedMetric[] {
  return Object.freeze([
    { label: 'Diameter difference', value: `${formatNumber(result.diameterDifferenceMm)} mm` },
    { label: 'Diameter difference', value: `${formatNumber(result.diameterDifferencePercent)} %` },
    { label: 'Sidewall difference', value: `${formatNumber(result.sidewallDifferenceMm)} mm` },
    { label: 'Circumference difference', value: `${formatNumber(result.circumferenceDifferenceMm)} mm` },
    { label: 'Ride-height difference', value: `${formatNumber(result.rideHeightDifferenceMm)} mm` },
    { label: 'Speedometer difference', value: `${formatNumber(result.speedometerDifferencePercent)} %` },
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
