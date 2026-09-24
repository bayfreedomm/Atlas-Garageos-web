import type { CombinedFitmentCandidate } from '../core/fitment/combined-candidate';
import type { FitmentMapCell } from '../core/fitment/map';
import type { GarageState } from '../domain/garage';
import type { FitmentComparisonResult } from '../domain/vehicle';
import type { ValidationIssue } from '../domain/validation';
import { formatNumber } from './format-number';
import { getPageLocale, type UiLocale } from './page-locale';

export type ProductSection = 'garage' | 'fitment' | 'tools';

function compactMetric(value: number): string {
  return String(Number(value.toFixed(3)));
}

const FIELD_NAMES: Readonly<Record<UiLocale, Readonly<Record<string, string>>>> = Object.freeze({
  en: {
    widthMm: 'tire width',
    aspectRatio: 'tire profile',
    rimDiameterInches: 'rim diameter',
    wheelWidthInches: 'wheel width',
    widthInches: 'wheel width',
    diameterInches: 'wheel diameter',
    offsetMm: 'wheel offset',
    indicatedSpeed: 'indicated speed',
    distance: 'distance',
    fuelEconomy: 'fuel economy',
    fuelPrice: 'fuel price',
    extraCost: 'extra trip cost',
    people: 'number of people',
    pressure: 'pressure',
    power: 'power',
    torque: 'torque',
    weight: 'vehicle weight',
    measuredInnerClearanceMm: 'inner clearance',
    measuredOuterClearanceMm: 'outer clearance',
    minimumDesiredInnerClearanceMm: 'desired inner clearance',
    minimumDesiredOuterClearanceMm: 'desired outer clearance',
  },
  de: {
    widthMm: 'Reifenbreite',
    aspectRatio: 'Reifenprofil',
    rimDiameterInches: 'Felgendurchmesser',
    wheelWidthInches: 'Felgenbreite',
    widthInches: 'Felgenbreite',
    diameterInches: 'Felgendurchmesser',
    offsetMm: 'Felgeneinpresstiefe',
    indicatedSpeed: 'angezeigte Geschwindigkeit',
    distance: 'Distanz',
    fuelEconomy: 'Kraftstoffverbrauch',
    fuelPrice: 'Kraftstoffpreis',
    extraCost: 'zusätzliche Reisekosten',
    people: 'Personenzahl',
    pressure: 'Druck',
    power: 'Leistung',
    torque: 'Drehmoment',
    weight: 'Fahrzeuggewicht',
    measuredInnerClearanceMm: 'inneren Freigang',
    measuredOuterClearanceMm: 'äußeren Freigang',
    minimumDesiredInnerClearanceMm: 'gewünschten inneren Freigang',
    minimumDesiredOuterClearanceMm: 'gewünschten äußeren Freigang',
  },
  es: {
    widthMm: 'ancho del neumático',
    aspectRatio: 'perfil del neumático',
    rimDiameterInches: 'diámetro de llanta',
    wheelWidthInches: 'ancho de llanta',
    widthInches: 'ancho de llanta',
    diameterInches: 'diámetro de llanta',
    offsetMm: 'offset de llanta',
    indicatedSpeed: 'velocidad indicada',
    distance: 'distancia',
    fuelEconomy: 'consumo de combustible',
    fuelPrice: 'precio del combustible',
    extraCost: 'gastos adicionales del viaje',
    people: 'número de personas',
    pressure: 'presión',
    power: 'potencia',
    torque: 'par motor',
    weight: 'peso del vehículo',
    measuredInnerClearanceMm: 'holgura interior',
    measuredOuterClearanceMm: 'holgura exterior',
    minimumDesiredInnerClearanceMm: 'holgura interior deseada',
    minimumDesiredOuterClearanceMm: 'holgura exterior deseada',
  },
});

const VALIDATION_TEXT = {
  en: {
    original: 'Original',
    new: 'New',
    tire: 'Tire',
    invalidNumber: (label: string) => `Enter a valid ${label.toLowerCase()}.`,
    wholeNumber: (label: string) => `${label} must be a whole number.`,
    atLeastZero: (label: string) => `${label} must be zero or greater.`,
    greaterThanZero: (label: string) => `${label} must be greater than zero.`,
    between: (label: string, min: number, max: number) => `${label} must be between ${min} and ${max}.`,
  },
  de: {
    original: 'Ursprünglicher',
    new: 'Neuer',
    tire: 'Reifen',
    invalidNumber: (label: string) => `Geben Sie einen gültigen Wert für ${label.toLowerCase()} ein.`,
    wholeNumber: (label: string) => `${label} muss eine ganze Zahl sein.`,
    atLeastZero: (label: string) => `${label} muss null oder größer sein.`,
    greaterThanZero: (label: string) => `${label} muss größer als null sein.`,
    between: (label: string, min: number, max: number) => `${label} muss zwischen ${min} und ${max} liegen.`,
  },
  es: {
    original: 'Original',
    new: 'Nuevo',
    tire: 'Neumático',
    invalidNumber: (label: string) => `Introduzca un valor válido para ${label.toLowerCase()}.`,
    wholeNumber: (label: string) => `${label} debe ser un número entero.`,
    atLeastZero: (label: string) => `${label} debe ser cero o mayor.`,
    greaterThanZero: (label: string) => `${label} debe ser mayor que cero.`,
    between: (label: string, min: number, max: number) => `${label} debe estar entre ${min} y ${max}.`,
  },
} as const satisfies Record<UiLocale, {
  original: string; new: string; tire: string;
  invalidNumber: (label: string) => string; wholeNumber: (label: string) => string;
  atLeastZero: (label: string) => string; greaterThanZero: (label: string) => string;
  between: (label: string, min: number, max: number) => string;
}>;

export function validationIssueText(issue: ValidationIssue, locale: UiLocale = getPageLocale()): string {
  const fieldNames = FIELD_NAMES[locale];
  const text = VALIDATION_TEXT[locale];
  const parts = issue.field.split('.');
  const field = parts.at(-1) ?? issue.field;
  const context = parts[0] === 'current' || parts[0] === 'original' ? text.original : parts[0] === 'proposed' || parts[0] === 'new' ? text.new : '';
  const fieldLabel = fieldNames[field] ?? field;
  const label = context ? `${context} ${fieldLabel}` : `${fieldLabel.charAt(0).toUpperCase()}${fieldLabel.slice(1)}`;
  if (issue.code === 'not-a-number') return text.invalidNumber(label);
  if (issue.code === 'not-an-integer') return text.wholeNumber(label);
  if (issue.code === 'out-of-range' && issue.minimum !== undefined) {
    if (issue.maximum !== undefined) return text.between(label, issue.minimum, issue.maximum);
    return issue.minimum === 0 ? text.atLeastZero(label) : text.greaterThanZero(label);
  }
  const message = issue.message.replace(field, label.toLowerCase());
  return `${message.charAt(0).toUpperCase()}${message.slice(1)}`;
}

const MEASUREMENT_GUIDANCE_TEXT = {
  en: { message: 'We need your inner and outer clearance measurements first.', ctaLabel: 'Measure my car' },
  de: { message: 'Wir benötigen zuerst Ihre gemessenen Werte für den inneren und äußeren Freigang.', ctaLabel: 'Mein Auto vermessen' },
  es: { message: 'Primero necesitamos sus medidas de holgura interior y exterior.', ctaLabel: 'Medir mi coche' },
} as const satisfies Record<UiLocale, { message: string; ctaLabel: string }>;

export function measurementErrorGuidance(issues: readonly ValidationIssue[], locale: UiLocale = getPageLocale()) {
  const needsMeasurement = issues.some(({ field }) => field.includes('measuredInnerClearanceMm') || field.includes('measuredOuterClearanceMm'));
  const text = MEASUREMENT_GUIDANCE_TEXT[locale];
  return needsMeasurement
    ? Object.freeze({ message: text.message, ctaLabel: text.ctaLabel, href: '#measure-flow' })
    : null;
}

const FITMENT_COMPARISON_TEXT = {
  en: {
    larger: 'larger', smaller: 'smaller', fartherOutward: 'farther outward', lessOutward: 'less outward', fartherInward: 'farther inward', lessInward: 'less inward',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `The new tire is ${diameterMm} mm ${direction} overall. The wheel reaches ${outerMm} mm ${outerDirection} and ${innerMm} mm ${innerDirection}.`,
  },
  de: {
    larger: 'größer', smaller: 'kleiner', fartherOutward: 'weiter nach außen', lessOutward: 'weniger weit nach außen', fartherInward: 'weiter nach innen', lessInward: 'weniger weit nach innen',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `Der neue Reifen ist insgesamt ${diameterMm} mm ${direction}. Das Rad reicht ${outerMm} mm ${outerDirection} und ${innerMm} mm ${innerDirection}.`,
  },
  es: {
    larger: 'más grande', smaller: 'más pequeño', fartherOutward: 'más hacia afuera', lessOutward: 'menos hacia afuera', fartherInward: 'más hacia adentro', lessInward: 'menos hacia adentro',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `El nuevo neumático es ${diameterMm} mm ${direction} en total. La llanta llega ${outerMm} mm ${outerDirection} y ${innerMm} mm ${innerDirection}.`,
  },
} as const satisfies Record<UiLocale, {
  larger: string; smaller: string; fartherOutward: string; lessOutward: string; fartherInward: string; lessInward: string;
  summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) => string;
}>;

export function fitmentComparisonSummary(result: FitmentComparisonResult, locale: UiLocale = getPageLocale()): string {
  const text = FITMENT_COMPARISON_TEXT[locale];
  const diameterDirection = result.diameterDifferenceMm >= 0 ? text.larger : text.smaller;
  const outerDirection = result.wheelOuterPokeChangeMm >= 0 ? text.fartherOutward : text.lessOutward;
  const innerDirection = result.wheelInnerPositionChangeMm >= 0 ? text.fartherInward : text.lessInward;
  return text.summary(
    formatNumber(Math.abs(result.diameterDifferenceMm)), diameterDirection,
    formatNumber(Math.abs(result.wheelOuterPokeChangeMm)), outerDirection,
    formatNumber(Math.abs(result.wheelInnerPositionChangeMm)), innerDirection,
  );
}

const PRODUCT_NAVIGATION_TEXT = {
  en: { garage: 'Garage', fitment: 'Fitment', tools: 'Tools' },
  de: { garage: 'Garage', fitment: 'Passform', tools: 'Tools' },
  es: { garage: 'Garaje', fitment: 'Ajuste', tools: 'Herramientas' },
} as const satisfies Record<UiLocale, { garage: string; fitment: string; tools: string }>;

export function productNavigation(locale: UiLocale = getPageLocale()) {
  const text = PRODUCT_NAVIGATION_TEXT[locale];
  return Object.freeze([
    { id: 'garage', label: text.garage, href: '#garage' },
    { id: 'fitment', label: text.fitment, href: '#fitment' },
    { id: 'tools', label: text.tools, href: '#tools' },
  ] as const);
}

export const PRODUCT_NAVIGATION = productNavigation('en');

export function wizardProgress(step: number, total = 5) {
  const current = Math.min(total, Math.max(1, Math.trunc(step)));
  return Object.freeze({ current, total, percent: (current / total) * 100, canGoBack: current > 1, canContinue: current < total });
}

const RESULT_CARD_TEXT = {
  en: {
    meetsTargets: 'Meets the supplied geometric targets',
    noOverlapNoTargets: 'No calculated wheel overlap in the supplied measurements',
    missesTargets: 'Misses at least one supplied target without calculated overlap',
    noOverlapLessClearance: 'No calculated overlap, but less measured clearance remains',
  },
  de: {
    meetsTargets: 'Erfüllt die vorgegebenen geometrischen Zielwerte',
    noOverlapNoTargets: 'Keine berechnete Radüberschneidung bei den angegebenen Messwerten',
    missesTargets: 'Verfehlt mindestens einen vorgegebenen Zielwert, ohne berechnete Überschneidung',
    noOverlapLessClearance: 'Keine berechnete Überschneidung, aber weniger gemessener Freigang bleibt übrig',
  },
  es: {
    meetsTargets: 'Cumple los objetivos geométricos indicados',
    noOverlapNoTargets: 'Sin solapamiento calculado de la llanta en las medidas indicadas',
    missesTargets: 'No alcanza al menos un objetivo indicado sin solapamiento calculado',
    noOverlapLessClearance: 'Sin solapamiento calculado, pero queda menos holgura medida',
  },
} as const satisfies Record<UiLocale, { meetsTargets: string; noOverlapNoTargets: string; missesTargets: string; noOverlapLessClearance: string }>;

export function resultCardModel(candidate: CombinedFitmentCandidate, locale: UiLocale = getPageLocale()) {
  const state = candidate.wheelGeometry.state;
  const hasUserTargets = candidate.explanation.constraints.length > 0;
  const text = RESULT_CARD_TEXT[locale];
  return Object.freeze({
    rank: candidate.rank,
    wheelPrimary: `${candidate.setup.wheel.diameterInches} × ${candidate.setup.wheel.widthInches}J`,
    wheelOffset: `ET${candidate.setup.wheel.offsetMm}`,
    tireSize: `${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio} R${candidate.setup.tire.rimDiameterInches}`,
    state,
    stateLabel: state.toUpperCase(),
    stateSummary:
      state === 'green'
        ? hasUserTargets
          ? text.meetsTargets
          : text.noOverlapNoTargets
        : hasUserTargets
          ? text.missesTargets
          : text.noOverlapLessClearance,
  });
}

const MAP_CELL_TEXT = {
  en: { checked: 'CHECKED', states: { green: 'GREEN', yellow: 'YELLOW', red: 'RED' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; projected inner ${innerMm} mm; projected outer ${outerMm} mm` },
  de: { checked: 'GEPRÜFT', states: { green: 'GRÜN', yellow: 'GELB', red: 'ROT' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; projizierter innerer Freigang ${innerMm} mm; projizierter äußerer Freigang ${outerMm} mm` },
  es: { checked: 'VERIFICADO', states: { green: 'VERDE', yellow: 'AMARILLO', red: 'ROJO' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; holgura interior proyectada ${innerMm} mm; holgura exterior proyectada ${outerMm} mm` },
} as const satisfies Record<UiLocale, { checked: string; states: Readonly<Record<'green' | 'yellow' | 'red', string>>; ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => string }>;

export function mapCellPresentation(cell: FitmentMapCell, selected: boolean, locale: UiLocale = getPageLocale()) {
  const text = MAP_CELL_TEXT[locale];
  const neutral = cell.reasons?.includes('no-targets') ?? false;
  const stateLabel = neutral ? text.checked : text.states[cell.state];
  const symbol = neutral ? '•' : cell.state === 'green' ? '✓' : cell.state === 'yellow' ? '!' : '×';
  return Object.freeze({
    stateLabel,
    symbol,
    selected,
    ariaLabel: text.ariaLabel(cell.wheelWidthInches, cell.offsetMm, stateLabel, compactMetric(cell.projectedInnerClearanceMm), compactMetric(cell.projectedOuterClearanceMm)),
  });
}

export function activeGaragePresentation(state: GarageState) {
  const vehicle = state.vehicles.find((item) => item.id === state.activeVehicleId) ?? null;
  const clearance = state.clearanceProfiles.find((item) => item.vehicleId === state.activeVehicleId) ?? null;
  const setups = Object.freeze(state.savedSetups.filter((item) => item.vehicleId === state.activeVehicleId));
  const currentSetup = vehicle?.activeSetup ?? clearance?.baselineSetup ?? setups.at(-1)?.setup ?? null;
  return Object.freeze({ vehicle, clearance, setups, currentSetup, isMeasured: clearance !== null });
}
