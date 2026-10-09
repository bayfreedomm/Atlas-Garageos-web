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
  'pt-br': { fartherOutward: 'mais para fora', lessOutward: 'menos para fora', fartherInward: 'mais para dentro', lessInward: 'menos para dentro' },
  fr: { fartherOutward: 'plus vers l’extérieur', lessOutward: 'moins vers l’extérieur', fartherInward: 'plus vers l’intérieur', lessInward: 'moins vers l’intérieur' },
  it: { fartherOutward: 'più verso l’esterno', lessOutward: 'meno verso l’esterno', fartherInward: 'più verso l’interno', lessInward: 'meno verso l’interno' },
  pl: { fartherOutward: 'dalej na zewnątrz', lessOutward: 'mniej na zewnątrz', fartherInward: 'dalej do wewnątrz', lessInward: 'mniej do wewnątrz' },
  nl: { fartherOutward: 'verder naar buiten', lessOutward: 'minder ver naar buiten', fartherInward: 'verder naar binnen', lessInward: 'minder ver naar binnen' },
  tr: { fartherOutward: 'daha dışarıda', lessOutward: 'daha az dışarıda', fartherInward: 'daha içeride', lessInward: 'daha az içeride' },
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
    'pt-br': `O diâmetro total é de ${diameter} mm, com flanco de ${sidewall} mm.`,
    fr: `Le diamètre total est de ${diameter} mm, avec un flanc de ${sidewall} mm.`,
    it: `Il diametro totale è di ${diameter} mm, con una spalla di ${sidewall} mm.`,
    pl: `Średnica całkowita wynosi ${diameter} mm, a wysokość ścianki bocznej ${sidewall} mm.`,
    nl: `De totale diameter is ${diameter} mm, met een wanghoogte van ${sidewall} mm.`,
    tr: `Toplam çap ${diameter} mm, yanak yüksekliği ${sidewall} mm.`,
  };
  return templates[locale];
}

export function tireComparisonSummary(result: ValidValue<typeof compareTireSizesTool>): string {
  const locale = getPageLocale();
  if (Math.abs(result.diameterDifferenceMm) < 0.000001) return {
    en: 'Both tires have the same nominal overall diameter, so nominal static ride height does not change.',
    de: 'Beide Reifen haben denselben Nenngesamtdurchmesser; die nominale statische Fahrzeughöhe bleibt gleich.',
    es: 'Ambos neumáticos tienen el mismo diámetro nominal total; la altura estática nominal no cambia.',
    'pt-br': 'Os dois pneus têm o mesmo diâmetro total nominal; a altura estática nominal do veículo não muda.',
    fr: 'Les deux pneus ont le même diamètre total nominal ; la hauteur statique nominale du véhicule ne change pas.',
    it: 'I due pneumatici hanno lo stesso diametro totale nominale; l’altezza statica nominale del veicolo non cambia.',
    pl: 'Obie opony mają tę samą nominalną średnicę całkowitą, więc nominalna wysokość statyczna pojazdu się nie zmienia.',
    nl: 'Beide banden hebben dezelfde nominale totale diameter; de nominale statische rijhoogte verandert niet.',
    tr: 'İki lastiğin nominal toplam çapı aynı; aracın nominal statik yüksekliği değişmez.',
  }[locale];
  const diameterAbs = formatNumber(Math.abs(result.diameterDifferenceMm));
  const rideAbs = formatNumber(Math.abs(result.rideHeightDifferenceMm));
  const taller = result.diameterDifferenceMm >= 0;
  const raises = result.rideHeightDifferenceMm >= 0;
  const templates: Record<UiLocale, string> = {
    en: `The new tire is ${diameterAbs} mm ${taller ? 'taller' : 'shorter'} overall and ${raises ? 'raises' : 'lowers'} the vehicle by approximately ${rideAbs} mm.`,
    de: `Der neue Reifen ist insgesamt ${diameterAbs} mm ${taller ? 'höher' : 'niedriger'} und ${raises ? 'erhöht' : 'senkt'} die Fahrzeughöhe um etwa ${rideAbs} mm.`,
    es: `El neumático nuevo es ${diameterAbs} mm ${taller ? 'más alto' : 'más bajo'} en total y ${raises ? 'eleva' : 'reduce'} la altura del vehículo en aproximadamente ${rideAbs} mm.`,
    'pt-br': `O pneu novo é ${diameterAbs} mm ${taller ? 'mais alto' : 'mais baixo'} no total e ${raises ? 'eleva' : 'abaixa'} o veículo em aproximadamente ${rideAbs} mm.`,
    fr: `Le nouveau pneu est ${taller ? 'plus haut' : 'plus bas'} de ${diameterAbs} mm au total et ${raises ? 'rehausse' : 'abaisse'} le véhicule d’environ ${rideAbs} mm.`,
    it: `Il nuovo pneumatico è ${taller ? 'più alto' : 'più basso'} di ${diameterAbs} mm in totale e ${raises ? 'alza' : 'abbassa'} il veicolo di circa ${rideAbs} mm.`,
    pl: `Nowa opona jest łącznie o ${diameterAbs} mm ${taller ? 'wyższa' : 'niższa'} i ${raises ? 'podnosi' : 'obniża'} pojazd o około ${rideAbs} mm.`,
    nl: `De nieuwe band is in totaal ${diameterAbs} mm ${taller ? 'hoger' : 'lager'} en ${raises ? 'verhoogt' : 'verlaagt'} het voertuig met ongeveer ${rideAbs} mm.`,
    tr: `Yeni lastik toplamda ${diameterAbs} mm ${taller ? 'daha yüksek' : 'daha alçak'} ve aracı yaklaşık ${rideAbs} mm ${raises ? 'yükseltiyor' : 'alçaltıyor'}.`,
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
    'pt-br': `A roda nova fica ${outer} e ${inner}.`,
    fr: `La nouvelle jante se place ${outer} et ${inner}.`,
    it: `Il nuovo cerchio si sposta di ${outer} e di ${inner}.`,
    pl: `Nowa felga przesuwa się: ${outer} i ${inner}.`,
    nl: `De nieuwe velg komt ${outer} en ${inner}.`,
    tr: `Yeni jant ${outer} ve ${inner} konumlanıyor.`,
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
    'pt-br': `Com ${indicated} ${result.unit} indicados, a velocidade real calculada é de ${actual} ${result.unit}.`,
    fr: `À ${indicated} ${result.unit} affichés, la vitesse réelle calculée est de ${actual} ${result.unit}.`,
    it: `Con ${indicated} ${result.unit} indicati, la velocità reale calcolata è di ${actual} ${result.unit}.`,
    pl: `Przy wskazaniu ${indicated} ${result.unit} obliczona prędkość rzeczywista wynosi ${actual} ${result.unit}.`,
    nl: `Bij een aangegeven ${indicated} ${result.unit} is de berekende werkelijke snelheid ${actual} ${result.unit}.`,
    tr: `Gösterilen ${indicated} ${result.unit} hızda hesaplanan gerçek hız ${actual} ${result.unit}.`,
  };
  return templates[locale];
}

const TIRE_CALCULATOR_LABELS = {
  en: { overallDiameter: 'Overall diameter', sidewallHeight: 'Sidewall height', circumference: 'Circumference', revolutionsPerMile: 'Revolutions per mile', revolutionsPerKilometer: 'Revolutions per kilometer' },
  de: { overallDiameter: 'Gesamtdurchmesser', sidewallHeight: 'Flankenhöhe', circumference: 'Umfang', revolutionsPerMile: 'Umdrehungen pro Meile', revolutionsPerKilometer: 'Umdrehungen pro Kilometer' },
  es: { overallDiameter: 'Diámetro total', sidewallHeight: 'Altura del flanco', circumference: 'Circunferencia', revolutionsPerMile: 'Revoluciones por milla', revolutionsPerKilometer: 'Revoluciones por kilómetro' },
  'pt-br': { overallDiameter: 'Diâmetro total', sidewallHeight: 'Altura do flanco', circumference: 'Circunferência', revolutionsPerMile: 'Rotações por milha', revolutionsPerKilometer: 'Rotações por quilômetro' },
  fr: { overallDiameter: 'Diamètre total', sidewallHeight: 'Hauteur du flanc', circumference: 'Circonférence', revolutionsPerMile: 'Tours par mile', revolutionsPerKilometer: 'Tours par kilomètre' },
  it: { overallDiameter: 'Diametro totale', sidewallHeight: 'Altezza della spalla', circumference: 'Circonferenza', revolutionsPerMile: 'Giri per miglio', revolutionsPerKilometer: 'Giri per chilometro' },
  pl: { overallDiameter: 'Średnica całkowita', sidewallHeight: 'Wysokość ścianki bocznej', circumference: 'Obwód', revolutionsPerMile: 'Obroty na milę', revolutionsPerKilometer: 'Obroty na kilometr' },
  nl: { overallDiameter: 'Totale diameter', sidewallHeight: 'Wanghoogte', circumference: 'Omtrek', revolutionsPerMile: 'Omwentelingen per mijl', revolutionsPerKilometer: 'Omwentelingen per kilometer' },
  tr: { overallDiameter: 'Toplam çap', sidewallHeight: 'Yanak yüksekliği', circumference: 'Çevre', revolutionsPerMile: 'Mil başına devir', revolutionsPerKilometer: 'Kilometre başına devir' },
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
  'pt-br': { overallDiameterChange: 'Variação do diâmetro total', diameterChange: 'Variação do diâmetro', sidewallChange: 'Variação do flanco', circumferenceChange: 'Variação da circunferência', rideHeightChange: 'Variação da altura estática', speedChange: 'Variação teórica de velocidade' },
  fr: { overallDiameterChange: 'Variation du diamètre total', diameterChange: 'Variation du diamètre', sidewallChange: 'Variation du flanc', circumferenceChange: 'Variation de la circonférence', rideHeightChange: 'Variation de la hauteur statique', speedChange: 'Variation théorique de vitesse' },
  it: { overallDiameterChange: 'Variazione del diametro totale', diameterChange: 'Variazione del diametro', sidewallChange: 'Variazione della spalla', circumferenceChange: 'Variazione della circonferenza', rideHeightChange: 'Variazione dell’altezza statica', speedChange: 'Variazione teorica della velocità' },
  pl: { overallDiameterChange: 'Zmiana średnicy całkowitej', diameterChange: 'Zmiana średnicy', sidewallChange: 'Zmiana ścianki bocznej', circumferenceChange: 'Zmiana obwodu', rideHeightChange: 'Zmiana wysokości statycznej', speedChange: 'Teoretyczna zmiana prędkości' },
  nl: { overallDiameterChange: 'Verandering totale diameter', diameterChange: 'Diameterverandering', sidewallChange: 'Verandering wanghoogte', circumferenceChange: 'Omtrekverandering', rideHeightChange: 'Verandering statische rijhoogte', speedChange: 'Theoretische snelheidsverandering' },
  tr: { overallDiameterChange: 'Toplam çap değişimi', diameterChange: 'Çap değişimi', sidewallChange: 'Yanak değişimi', circumferenceChange: 'Çevre değişimi', rideHeightChange: 'Statik yükseklik değişimi', speedChange: 'Teorik hız değişimi' },
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
  'pt-br': { innerPositionChange: 'Variação da posição interna', outerPokeChange: 'Variação da projeção externa (poke)' },
  fr: { innerPositionChange: 'Variation de la position intérieure', outerPokeChange: 'Variation du débord extérieur (poke)' },
  it: { innerPositionChange: 'Variazione della posizione interna', outerPokeChange: 'Variazione della sporgenza esterna (poke)' },
  pl: { innerPositionChange: 'Zmiana położenia wewnętrznego', outerPokeChange: 'Zmiana wysunięcia na zewnątrz (poke)' },
  nl: { innerPositionChange: 'Verandering binnenpositie', outerPokeChange: 'Verandering uitsteek naar buiten (poke)' },
  tr: { innerPositionChange: 'İç konum değişimi', outerPokeChange: 'Dışa taşma değişimi (poke)' },
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
  'pt-br': { indicatedSpeed: 'Velocidade indicada', actualSpeed: 'Velocidade real calculada', diameterDifference: 'Diferença de diâmetro', speedDifference: 'Diferença de velocidade' },
  fr: { indicatedSpeed: 'Vitesse affichée', actualSpeed: 'Vitesse réelle calculée', diameterDifference: 'Écart de diamètre', speedDifference: 'Écart de vitesse' },
  it: { indicatedSpeed: 'Velocità indicata', actualSpeed: 'Velocità reale calcolata', diameterDifference: 'Differenza di diametro', speedDifference: 'Differenza di velocità' },
  pl: { indicatedSpeed: 'Prędkość wskazywana', actualSpeed: 'Obliczona prędkość rzeczywista', diameterDifference: 'Różnica średnicy', speedDifference: 'Różnica prędkości' },
  nl: { indicatedSpeed: 'Aangegeven snelheid', actualSpeed: 'Berekende werkelijke snelheid', diameterDifference: 'Diameterverschil', speedDifference: 'Snelheidsverschil' },
  tr: { indicatedSpeed: 'Gösterilen hız', actualSpeed: 'Hesaplanan gerçek hız', diameterDifference: 'Çap farkı', speedDifference: 'Hız farkı' },
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
