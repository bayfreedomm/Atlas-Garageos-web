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
  'pt-br': {
    widthMm: 'largura do pneu',
    aspectRatio: 'perfil do pneu',
    rimDiameterInches: 'diâmetro do aro',
    wheelWidthInches: 'largura da roda',
    widthInches: 'largura da roda',
    diameterInches: 'diâmetro da roda',
    offsetMm: 'offset da roda',
    indicatedSpeed: 'velocidade indicada',
    distance: 'distância',
    fuelEconomy: 'consumo de combustível',
    fuelPrice: 'preço do combustível',
    extraCost: 'custos extras da viagem',
    people: 'número de pessoas',
    pressure: 'pressão',
    power: 'potência',
    torque: 'torque',
    weight: 'peso do veículo',
    measuredInnerClearanceMm: 'folga interna',
    measuredOuterClearanceMm: 'folga externa',
    minimumDesiredInnerClearanceMm: 'folga interna desejada',
    minimumDesiredOuterClearanceMm: 'folga externa desejada',
  },
  fr: {
    widthMm: 'largeur du pneu',
    aspectRatio: 'série du pneu',
    rimDiameterInches: 'diamètre de jante',
    wheelWidthInches: 'largeur de jante',
    widthInches: 'largeur de jante',
    diameterInches: 'diamètre de jante',
    offsetMm: 'déport de jante',
    indicatedSpeed: 'vitesse affichée',
    distance: 'distance',
    fuelEconomy: 'consommation de carburant',
    fuelPrice: 'prix du carburant',
    extraCost: 'frais de trajet supplémentaires',
    people: 'nombre de personnes',
    pressure: 'pression',
    power: 'puissance',
    torque: 'couple',
    weight: 'poids du véhicule',
    measuredInnerClearanceMm: 'dégagement intérieur',
    measuredOuterClearanceMm: 'dégagement extérieur',
    minimumDesiredInnerClearanceMm: 'dégagement intérieur souhaité',
    minimumDesiredOuterClearanceMm: 'dégagement extérieur souhaité',
  },
  it: {
    widthMm: 'larghezza del pneumatico',
    aspectRatio: 'spalla del pneumatico',
    rimDiameterInches: 'diametro del cerchio',
    wheelWidthInches: 'canale del cerchio',
    widthInches: 'canale del cerchio',
    diameterInches: 'diametro del cerchio',
    offsetMm: 'offset del cerchio',
    indicatedSpeed: 'velocità indicata',
    distance: 'distanza',
    fuelEconomy: 'consumo di carburante',
    fuelPrice: 'prezzo del carburante',
    extraCost: 'costi extra del viaggio',
    people: 'numero di persone',
    pressure: 'pressione',
    power: 'potenza',
    torque: 'coppia',
    weight: 'peso del veicolo',
    measuredInnerClearanceMm: 'spazio interno',
    measuredOuterClearanceMm: 'spazio esterno',
    minimumDesiredInnerClearanceMm: 'spazio interno desiderato',
    minimumDesiredOuterClearanceMm: 'spazio esterno desiderato',
  },
  pl: {
    widthMm: 'szerokość opony',
    aspectRatio: 'profil opony',
    rimDiameterInches: 'średnica felgi',
    wheelWidthInches: 'szerokość felgi',
    widthInches: 'szerokość felgi',
    diameterInches: 'średnica felgi',
    offsetMm: 'odsadzenie felgi',
    indicatedSpeed: 'prędkość wskazywana',
    distance: 'dystans',
    fuelEconomy: 'zużycie paliwa',
    fuelPrice: 'cena paliwa',
    extraCost: 'dodatkowe koszty podróży',
    people: 'liczba osób',
    pressure: 'ciśnienie',
    power: 'moc',
    torque: 'moment obrotowy',
    weight: 'masa pojazdu',
    measuredInnerClearanceMm: 'prześwit wewnętrzny',
    measuredOuterClearanceMm: 'prześwit zewnętrzny',
    minimumDesiredInnerClearanceMm: 'pożądany prześwit wewnętrzny',
    minimumDesiredOuterClearanceMm: 'pożądany prześwit zewnętrzny',
  },
  nl: {
    widthMm: 'bandbreedte',
    aspectRatio: 'bandprofiel',
    rimDiameterInches: 'velgdiameter',
    wheelWidthInches: 'velgbreedte',
    widthInches: 'velgbreedte',
    diameterInches: 'velgdiameter',
    offsetMm: 'ET van de velg',
    indicatedSpeed: 'aangegeven snelheid',
    distance: 'afstand',
    fuelEconomy: 'brandstofverbruik',
    fuelPrice: 'brandstofprijs',
    extraCost: 'extra reiskosten',
    people: 'aantal personen',
    pressure: 'druk',
    power: 'vermogen',
    torque: 'koppel',
    weight: 'voertuiggewicht',
    measuredInnerClearanceMm: 'binnenspeling',
    measuredOuterClearanceMm: 'buitenspeling',
    minimumDesiredInnerClearanceMm: 'gewenste binnenspeling',
    minimumDesiredOuterClearanceMm: 'gewenste buitenspeling',
  },
  tr: {
    widthMm: 'lastik genişliği',
    aspectRatio: 'lastik profili',
    rimDiameterInches: 'jant çapı',
    wheelWidthInches: 'jant genişliği',
    widthInches: 'jant genişliği',
    diameterInches: 'jant çapı',
    offsetMm: 'jant ofseti',
    indicatedSpeed: 'gösterilen hız',
    distance: 'mesafe',
    fuelEconomy: 'yakıt tüketimi',
    fuelPrice: 'yakıt fiyatı',
    extraCost: 'ek yolculuk masrafı',
    people: 'kişi sayısı',
    pressure: 'basınç',
    power: 'güç',
    torque: 'tork',
    weight: 'araç ağırlığı',
    measuredInnerClearanceMm: 'iç boşluk',
    measuredOuterClearanceMm: 'dış boşluk',
    minimumDesiredInnerClearanceMm: 'istenen iç boşluk',
    minimumDesiredOuterClearanceMm: 'istenen dış boşluk',
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
  'pt-br': {
    original: 'Atual:',
    new: 'Novo:',
    tire: 'Pneu',
    invalidNumber: (label: string) => `Digite um valor válido (${label.toLowerCase()}).`,
    wholeNumber: (label: string) => `${label} — use um número inteiro.`,
    atLeastZero: (label: string) => `${label} — o valor deve ser zero ou maior.`,
    greaterThanZero: (label: string) => `${label} — o valor deve ser maior que zero.`,
    between: (label: string, min: number, max: number) => `${label} — o valor deve estar entre ${min} e ${max}.`,
  },
  fr: {
    original: 'Avant :',
    new: 'Après :',
    tire: 'Pneu',
    invalidNumber: (label: string) => `Saisissez une valeur valide (${label.toLowerCase()}).`,
    wholeNumber: (label: string) => `${label} — saisissez un nombre entier.`,
    atLeastZero: (label: string) => `${label} — la valeur doit être supérieure ou égale à zéro.`,
    greaterThanZero: (label: string) => `${label} — la valeur doit être supérieure à zéro.`,
    between: (label: string, min: number, max: number) => `${label} — la valeur doit être comprise entre ${min} et ${max}.`,
  },
  it: {
    original: 'Attuale:',
    new: 'Nuovo:',
    tire: 'Pneumatico',
    invalidNumber: (label: string) => `Inserisci un valore valido (${label.toLowerCase()}).`,
    wholeNumber: (label: string) => `${label} — inserisci un numero intero.`,
    atLeastZero: (label: string) => `${label} — il valore deve essere zero o superiore.`,
    greaterThanZero: (label: string) => `${label} — il valore deve essere maggiore di zero.`,
    between: (label: string, min: number, max: number) => `${label} — il valore deve essere compreso tra ${min} e ${max}.`,
  },
  pl: {
    original: 'Obecnie:',
    new: 'Po zmianie:',
    tire: 'Opona',
    invalidNumber: (label: string) => `Wpisz prawidłową wartość (${label.toLowerCase()}).`,
    wholeNumber: (label: string) => `${label} — wpisz liczbę całkowitą.`,
    atLeastZero: (label: string) => `${label} — wartość musi wynosić zero lub więcej.`,
    greaterThanZero: (label: string) => `${label} — wartość musi być większa od zera.`,
    between: (label: string, min: number, max: number) => `${label} — wartość musi mieścić się w przedziale od ${min} do ${max}.`,
  },
  nl: {
    original: 'Huidig:',
    new: 'Nieuw:',
    tire: 'Band',
    invalidNumber: (label: string) => `Vul een geldige waarde in (${label.toLowerCase()}).`,
    wholeNumber: (label: string) => `${label} — vul een geheel getal in.`,
    atLeastZero: (label: string) => `${label} — de waarde moet nul of hoger zijn.`,
    greaterThanZero: (label: string) => `${label} — de waarde moet groter zijn dan nul.`,
    between: (label: string, min: number, max: number) => `${label} — de waarde moet tussen ${min} en ${max} liggen.`,
  },
  tr: {
    original: 'Mevcut',
    new: 'Yeni',
    tire: 'Lastik',
    invalidNumber: (label: string) => `Geçerli bir değer girin (${label.toLowerCase()}).`,
    wholeNumber: (label: string) => `${label} tam sayı olmalıdır.`,
    atLeastZero: (label: string) => `${label} sıfır veya daha büyük olmalıdır.`,
    greaterThanZero: (label: string) => `${label} sıfırdan büyük olmalıdır.`,
    between: (label: string, min: number, max: number) => `${label} ${min} ile ${max} arasında olmalıdır.`,
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
  'pt-br': { message: 'Primeiro precisamos das suas medidas de folga interna e externa.', ctaLabel: 'Medir meu carro' },
  fr: { message: 'Nous avons d’abord besoin de vos mesures de dégagement intérieur et extérieur.', ctaLabel: 'Mesurer ma voiture' },
  it: { message: 'Prima ci servono le tue misure dello spazio interno ed esterno.', ctaLabel: 'Misura la mia auto' },
  pl: { message: 'Najpierw potrzebujemy Twoich pomiarów prześwitu wewnętrznego i zewnętrznego.', ctaLabel: 'Zmierz moje auto' },
  nl: { message: 'We hebben eerst je gemeten binnen- en buitenspeling nodig.', ctaLabel: 'Mijn auto opmeten' },
  tr: { message: 'Önce iç ve dış boşluk ölçümlerinize ihtiyacımız var.', ctaLabel: 'Aracımı ölç' },
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
  'pt-br': {
    larger: 'maior', smaller: 'menor', fartherOutward: 'mais para fora', lessOutward: 'menos para fora', fartherInward: 'mais para dentro', lessInward: 'menos para dentro',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `O pneu novo é ${diameterMm} mm ${direction} no diâmetro total. A roda fica ${outerMm} mm ${outerDirection} e ${innerMm} mm ${innerDirection}.`,
  },
  fr: {
    larger: 'plus grand', smaller: 'plus petit', fartherOutward: 'plus vers l’extérieur', lessOutward: 'moins vers l’extérieur', fartherInward: 'plus vers l’intérieur', lessInward: 'moins vers l’intérieur',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `Le nouveau pneu est ${direction} de ${diameterMm} mm au total. La jante se place ${outerMm} mm ${outerDirection} et ${innerMm} mm ${innerDirection}.`,
  },
  it: {
    larger: 'più grande', smaller: 'più piccolo', fartherOutward: 'più verso l’esterno', lessOutward: 'meno verso l’esterno', fartherInward: 'più verso l’interno', lessInward: 'meno verso l’interno',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `Il nuovo pneumatico è ${direction} di ${diameterMm} mm nel diametro totale. Il cerchio si sposta di ${outerMm} mm ${outerDirection} e di ${innerMm} mm ${innerDirection}.`,
  },
  pl: {
    larger: 'większa', smaller: 'mniejsza', fartherOutward: 'dalej na zewnątrz', lessOutward: 'mniej na zewnątrz', fartherInward: 'dalej do wewnątrz', lessInward: 'mniej do wewnątrz',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `Nowa opona jest łącznie o ${diameterMm} mm ${direction}. Felga sięga o ${outerMm} mm ${outerDirection} i o ${innerMm} mm ${innerDirection}.`,
  },
  nl: {
    larger: 'groter', smaller: 'kleiner', fartherOutward: 'verder naar buiten', lessOutward: 'minder ver naar buiten', fartherInward: 'verder naar binnen', lessInward: 'minder ver naar binnen',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `De nieuwe band is in totaal ${diameterMm} mm ${direction}. De velg komt ${outerMm} mm ${outerDirection} en ${innerMm} mm ${innerDirection}.`,
  },
  tr: {
    larger: 'daha büyük', smaller: 'daha küçük', fartherOutward: 'daha dışarıda', lessOutward: 'daha az dışarıda', fartherInward: 'daha içeride', lessInward: 'daha az içeride',
    summary: (diameterMm: string, direction: string, outerMm: string, outerDirection: string, innerMm: string, innerDirection: string) =>
      `Yeni lastiğin toplam çapı ${diameterMm} mm ${direction}. Jant ${outerMm} mm ${outerDirection} ve ${innerMm} mm ${innerDirection} konumlanıyor.`,
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
  'pt-br': { garage: 'Garagem', fitment: 'Encaixe', tools: 'Ferramentas' },
  fr: { garage: 'Garage', fitment: 'Montage', tools: 'Outils' },
  it: { garage: 'Garage', fitment: 'Montaggio', tools: 'Strumenti' },
  pl: { garage: 'Garaż', fitment: 'Dopasowanie', tools: 'Narzędzia' },
  nl: { garage: 'Garage', fitment: 'Pasvorm', tools: 'Tools' },
  tr: { garage: 'Garaj', fitment: 'Uyum', tools: 'Araçlar' },
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
  'pt-br': {
    meetsTargets: 'Atende às metas geométricas informadas',
    noOverlapNoTargets: 'Nenhuma sobreposição calculada da roda com as medidas informadas',
    missesTargets: 'Não atinge pelo menos uma meta informada, sem sobreposição calculada',
    noOverlapLessClearance: 'Sem sobreposição calculada, mas resta menos folga medida',
  },
  fr: {
    meetsTargets: 'Respecte les objectifs géométriques indiqués',
    noOverlapNoTargets: 'Aucun chevauchement calculé de la jante avec les mesures indiquées',
    missesTargets: 'Manque au moins un objectif indiqué, sans chevauchement calculé',
    noOverlapLessClearance: 'Aucun chevauchement calculé, mais il reste moins de dégagement mesuré',
  },
  it: {
    meetsTargets: 'Rispetta gli obiettivi geometrici indicati',
    noOverlapNoTargets: 'Nessuna sovrapposizione calcolata del cerchio con le misure indicate',
    missesTargets: 'Non raggiunge almeno un obiettivo indicato, senza sovrapposizione calcolata',
    noOverlapLessClearance: 'Nessuna sovrapposizione calcolata, ma resta meno spazio misurato',
  },
  pl: {
    meetsTargets: 'Spełnia podane cele geometryczne',
    noOverlapNoTargets: 'Brak obliczonego nachodzenia felgi przy podanych pomiarach',
    missesTargets: 'Nie spełnia co najmniej jednego podanego celu, bez obliczonego nachodzenia',
    noOverlapLessClearance: 'Brak obliczonego nachodzenia, ale zostaje mniej zmierzonego prześwitu',
  },
  nl: {
    meetsTargets: 'Voldoet aan de opgegeven geometrische doelen',
    noOverlapNoTargets: 'Geen berekende overlap van de velg bij de opgegeven metingen',
    missesTargets: 'Haalt minstens één opgegeven doel niet, zonder berekende overlap',
    noOverlapLessClearance: 'Geen berekende overlap, maar er blijft minder gemeten speling over',
  },
  tr: {
    meetsTargets: 'Girilen geometrik hedefleri karşılıyor',
    noOverlapNoTargets: 'Girilen ölçülerde hesaplanan jant çakışması yok',
    missesTargets: 'Hesaplanan çakışma yok, ancak girilen hedeflerden en az biri karşılanmıyor',
    noOverlapLessClearance: 'Hesaplanan çakışma yok, ancak ölçülen boşluk azalıyor',
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
  'pt-br': { checked: 'VERIFICADO', states: { green: 'VERDE', yellow: 'AMARELO', red: 'VERMELHO' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; folga interna projetada ${innerMm} mm; folga externa projetada ${outerMm} mm` },
  fr: { checked: 'VÉRIFIÉ', states: { green: 'VERT', yellow: 'JAUNE', red: 'ROUGE' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm} : ${stateLabel} ; dégagement intérieur projeté ${innerMm} mm ; dégagement extérieur projeté ${outerMm} mm` },
  it: { checked: 'VERIFICATO', states: { green: 'VERDE', yellow: 'GIALLO', red: 'ROSSO' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; spazio interno previsto ${innerMm} mm; spazio esterno previsto ${outerMm} mm` },
  pl: { checked: 'SPRAWDZONO', states: { green: 'ZIELONY', yellow: 'ŻÓŁTY', red: 'CZERWONY' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; przewidywany prześwit wewnętrzny ${innerMm} mm; przewidywany prześwit zewnętrzny ${outerMm} mm` },
  nl: { checked: 'GECONTROLEERD', states: { green: 'GROEN', yellow: 'GEEL', red: 'ROOD' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; verwachte binnenspeling ${innerMm} mm; verwachte buitenspeling ${outerMm} mm` },
  tr: { checked: 'KONTROL EDİLDİ', states: { green: 'YEŞİL', yellow: 'SARI', red: 'KIRMIZI' }, ariaLabel: (wheelWidthInches: number, offsetMm: number, stateLabel: string, innerMm: string, outerMm: string) => `${wheelWidthInches}J ET${offsetMm}: ${stateLabel}; öngörülen iç boşluk ${innerMm} mm; öngörülen dış boşluk ${outerMm} mm` },
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
