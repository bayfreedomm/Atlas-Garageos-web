import type { ValidationIssue } from '../domain/validation';
import type { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool } from '../features/tools/calculator-tools';
import { formatNumber } from './format-number';
import { getPageLocale, type UiLocale } from './page-locale';
import { validationIssueText } from './presentation-model';

export interface PresentedMetric { readonly label: string; readonly value: string; }

type DirectionKind = 'inward' | 'outward';

const DIRECTION_PHRASES = {
  en: { fartherOutward: 'farther outward', lessOutward: 'less outward', fartherInward: 'farther inward', lessInward: 'less inward' },
  de: { fartherOutward: 'weiter nach außen', lessOutward: 'weniger weit nach außen', fartherInward: 'weiter nach innen', lessInward: 'weniger weit nach innen' },
  es: { fartherOutward: 'más hacia afuera', lessOutward: 'menos hacia afuera', fartherInward: 'más hacia adentro', lessInward: 'menos hacia adentro' },
} as const;

const direction = (value: number, kind: DirectionKind, locale: UiLocale): string => {
  const phrases = DIRECTION_PHRASES[locale];
  const positive = kind === 'outward' ? phrases.fartherOutward : phrases.fartherInward;
  const negative = kind === 'outward' ? phrases.lessOutward : phrases.lessInward;
  return `${formatNumber(Math.abs(value))} mm ${value >= 0 ? positive : negative}`;
};

export function tireCalculatorSummary(result: Parameters<typeof tireCalculatorMetrics>[0]): string {
  const locale = getPageLocale();
  const diameter = formatNumber(result.overallDiameterMm);
  const sidewall = formatNumber(result.sidewallHeightMm);
  const templates: Record<UiLocale, string> = {
    en: `Overall diameter is ${diameter} mm, with a ${sidewall} mm sidewall.`,
    de: `Der Gesamtdurchmesser beträgt ${diameter} mm, bei einer Flankenhöhe von ${sidewall} mm.`,
    es: `El diámetro total es de ${diameter} mm, con un flanco de ${sidewall} mm.`,
  };
  return templates[locale];
}

export function tireComparisonSummary(result: ValidValue<typeof compareTireSizesTool>): string {
  const locale = getPageLocale();
  if (Math.abs(result.diameterDifferenceMm) < 0.000001) return {
    en: 'Both tires have the same nominal overall diameter, so nominal static ride height does not change.',
    de: 'Beide Reifen haben denselben Nenngesamtdurchmesser; die nominale statische Fahrzeughöhe bleibt gleich.',
    es: 'Ambos neumáticos tienen el mismo diámetro nominal total; la altura estática nominal no cambia.',
  }[locale];
  const diameterAbs = formatNumber(Math.abs(result.diameterDifferenceMm));
  const rideAbs = formatNumber(Math.abs(result.rideHeightDifferenceMm));
  const taller = result.diameterDifferenceMm >= 0;
  const raises = result.rideHeightDifferenceMm >= 0;
  const templates: Record<UiLocale, string> = {
    en: `The new tire is ${diameterAbs} mm ${taller ? 'taller' : 'shorter'} overall and ${raises ? 'raises' : 'lowers'} the vehicle by approximately ${rideAbs} mm.`,
    de: `Der neue Reifen ist insgesamt ${diameterAbs} mm ${taller ? 'höher' : 'niedriger'} und ${raises ? 'erhöht' : 'senkt'} die Fahrzeughöhe um etwa ${rideAbs} mm.`,
    es: `El neumático nuevo es ${diameterAbs} mm ${taller ? 'más alto' : 'más bajo'} en total y ${raises ? 'eleva' : 'reduce'} la altura del vehículo en aproximadamente ${rideAbs} mm.`,
  };
  return templates[locale];
}

export function wheelOffsetSummary(result: ValidValue<typeof calculateWheelOffsetTool>): string {
  const locale = getPageLocale();
  const outer = direction(result.outerPokeChangeMm, 'outward', locale);
  const inner = direction(result.innerPositionChangeMm, 'inward', locale);
  const templates: Record<UiLocale, string> = {
    en: `The new wheel reaches ${outer} and ${inner}.`,
    de: `Die neue Felge verschiebt sich um ${outer} und ${inner}.`,
    es: `La nueva llanta se desplaza ${outer} y ${inner}.`,
  };
  return templates[locale];
}

export function speedometerSummary(result: ValidValue<typeof calculateSpeedometerTool>): string {
  const locale = getPageLocale();
  const indicated = formatNumber(result.indicatedSpeed);
  const actual = formatNumber(result.actualSpeed);
  const templates: Record<UiLocale, string> = {
    en: `At an indicated ${indicated} ${result.unit}, calculated actual speed is ${actual} ${result.unit}.`,
    de: `Bei einer angezeigten Geschwindigkeit von ${indicated} ${result.unit} beträgt die berechnete tatsächliche Geschwindigkeit ${actual} ${result.unit}.`,
    es: `A una velocidad indicada de ${indicated} ${result.unit}, la velocidad real calculada es de ${actual} ${result.unit}.`,
  };
  return templates[locale];
}

const TIRE_CALCULATOR_LABELS = {
  en: { overallDiameter: 'Overall diameter', sidewallHeight: 'Sidewall height', circumference: 'Circumference', revolutionsPerMile: 'Revolutions per mile', revolutionsPerKilometer: 'Revolutions per kilometer' },
  de: { overallDiameter: 'Gesamtdurchmesser', sidewallHeight: 'Flankenhöhe', circumference: 'Umfang', revolutionsPerMile: 'Umdrehungen pro Meile', revolutionsPerKilometer: 'Umdrehungen pro Kilometer' },
  es: { overallDiameter: 'Diámetro total', sidewallHeight: 'Altura del flanco', circumference: 'Circunferencia', revolutionsPerMile: 'Revoluciones por milla', revolutionsPerKilometer: 'Revoluciones por kilómetro' },
} as const;

export function tireCalculatorMetrics(result: Extract<ReturnType<typeof calculateTireSizeTool>, { ok: true }>['value']): readonly PresentedMetric[] {
  const labels = TIRE_CALCULATOR_LABELS[getPageLocale()];
  return Object.freeze([
    { label: labels.overallDiameter, value: `${formatNumber(result.overallDiameterMm)} mm` },
    { label: labels.sidewallHeight, value: `${formatNumber(result.sidewallHeightMm)} mm` },
    { label: labels.circumference, value: `${formatNumber(result.circumferenceMm)} mm` },
    { label: labels.revolutionsPerMile, value: formatNumber(result.revolutionsPerMile) },
    { label: labels.revolutionsPerKilometer, value: formatNumber(result.revolutionsPerKilometer) },
  ]);
}

export const toolIssueText = (issue: ValidationIssue): string => validationIssueText(issue);

type ValidValue<T extends (...args: never[]) => unknown> = ReturnType<T> extends infer Result ? Result extends { readonly ok: true; readonly value: infer Value } ? Value : never : never;

const TIRE_COMPARISON_LABELS = {
  en: { overallDiameterChange: 'Overall diameter change', diameterChange: 'Diameter change', sidewallChange: 'Sidewall change', circumferenceChange: 'Circumference change', rideHeightChange: 'Static ride-height change', speedChange: 'Theoretical speed change' },
  de: { overallDiameterChange: 'Änderung des Gesamtdurchmessers', diameterChange: 'Durchmesseränderung', sidewallChange: 'Flankenänderung', circumferenceChange: 'Umfangsänderung', rideHeightChange: 'Änderung der statischen Bodenfreiheit', speedChange: 'Theoretische Geschwindigkeitsänderung' },
  es: { overallDiameterChange: 'Cambio de diámetro total', diameterChange: 'Cambio de diámetro', sidewallChange: 'Cambio de flanco', circumferenceChange: 'Cambio de circunferencia', rideHeightChange: 'Cambio de altura estática', speedChange: 'Cambio teórico de velocidad' },
} as const;

export function tireComparisonMetrics(result: ValidValue<typeof compareTireSizesTool>): readonly PresentedMetric[] {
  const labels = TIRE_COMPARISON_LABELS[getPageLocale()];
  return Object.freeze([
    { label: labels.overallDiameterChange, value: `${formatNumber(result.diameterDifferenceMm)} mm` },
    { label: labels.diameterChange, value: `${formatNumber(result.diameterDifferencePercent)} %` },
    { label: labels.sidewallChange, value: `${formatNumber(result.sidewallDifferenceMm)} mm` },
    { label: labels.circumferenceChange, value: `${formatNumber(result.circumferenceDifferenceMm)} mm` },
    { label: labels.rideHeightChange, value: `${formatNumber(result.rideHeightDifferenceMm)} mm` },
    { label: labels.speedChange, value: `${formatNumber(result.speedometerDifferencePercent)} %` },
  ]);
}

const WHEEL_OFFSET_LABELS = {
  en: { innerPositionChange: 'Inner-position change', outerPokeChange: 'Outer-poke change' },
  de: { innerPositionChange: 'Änderung der Innenposition', outerPokeChange: 'Änderung des Außenversatzes (Poke)' },
  es: { innerPositionChange: 'Cambio de posición interior', outerPokeChange: 'Cambio de sobresalida exterior (poke)' },
} as const;

export function wheelOffsetMetrics(result: ValidValue<typeof calculateWheelOffsetTool>): readonly PresentedMetric[] {
  const labels = WHEEL_OFFSET_LABELS[getPageLocale()];
  return Object.freeze([
    { label: labels.innerPositionChange, value: `${formatNumber(result.innerPositionChangeMm)} mm` },
    { label: labels.outerPokeChange, value: `${formatNumber(result.outerPokeChangeMm)} mm` },
  ]);
}

const SPEEDOMETER_LABELS = {
  en: { indicatedSpeed: 'Indicated speed', actualSpeed: 'Calculated actual speed', diameterDifference: 'Diameter difference', speedDifference: 'Speed difference' },
  de: { indicatedSpeed: 'Angezeigte Geschwindigkeit', actualSpeed: 'Berechnete tatsächliche Geschwindigkeit', diameterDifference: 'Durchmesserunterschied', speedDifference: 'Geschwindigkeitsunterschied' },
  es: { indicatedSpeed: 'Velocidad indicada', actualSpeed: 'Velocidad real calculada', diameterDifference: 'Diferencia de diámetro', speedDifference: 'Diferencia de velocidad' },
} as const;

export function speedometerMetrics(result: ValidValue<typeof calculateSpeedometerTool>): readonly PresentedMetric[] {
  const labels = SPEEDOMETER_LABELS[getPageLocale()];
  return Object.freeze([
    { label: labels.indicatedSpeed, value: `${formatNumber(result.indicatedSpeed)} ${result.unit}` },
    { label: labels.actualSpeed, value: `${formatNumber(result.actualSpeed)} ${result.unit}` },
    { label: labels.diameterDifference, value: `${formatNumber(result.diameterDifferenceMm)} mm` },
    { label: labels.speedDifference, value: `${formatNumber(result.diameterDifferencePercent)} %` },
  ]);
}
