import { vehicleFitmentData, type VehicleFitment } from '../data/vehicle-fitment';
import { boltPatternSlug } from '../data/bolt-pattern-catalog';
import { parseTireNotation, tireSizeSlug } from '../data/tire-size-catalog';
import { localizedToolPath } from '../localization/locales';
import { entityDetailPath, type EntityLocale } from '../seo/entity-routes';
import { tireComparisonHref, vehicleLink } from './entity-page-model';
import { torquePresentation } from './vehicle-torque';

export type ComparisonStatus = 'ready' | 'incomplete' | 'same' | 'invalid';

export interface VehicleGeometry {
  readonly widthMm: number;
  readonly sidewallMm: number;
  readonly diameterMm: number;
  readonly circumferenceMm: number;
}

export interface VehicleComparisonRow {
  readonly id: string;
  readonly label: string;
  readonly a: string;
  readonly b: string;
  readonly shared: boolean;
  readonly aHref?: string;
  readonly bHref?: string;
  readonly aNote?: string;
  readonly bNote?: string;
}

export interface ComparisonAction { readonly href: string; readonly label: string; }

export interface VehicleComparisonResult {
  readonly status: ComparisonStatus;
  readonly message: string;
  readonly canonicalIds?: readonly [string, string];
  readonly vehicleA?: VehicleFitment;
  readonly vehicleB?: VehicleFitment;
  readonly summaries: readonly string[];
  readonly rows: readonly VehicleComparisonRow[];
  readonly actions: readonly ComparisonAction[];
  readonly diameterDifferencePercent?: number;
}

interface ComparisonCopy {
  readonly chooseBoth: string;
  readonly same: string;
  readonly invalid: string;
  readonly market: string;
  readonly generation: string;
  readonly tire: string;
  readonly width: string;
  readonly sidewall: string;
  readonly diameter: string;
  readonly circumference: string;
  readonly wheel: string;
  readonly pcd: string;
  readonly lugs: string;
  readonly bore: string;
  readonly fastener: string;
  readonly torque: string;
  readonly marketNames: Readonly<Record<VehicleFitment['market'], string>>;
  readonly fastenerNames: Readonly<Record<VehicleFitment['fastenerType'], string>>;
  readonly missing: string;
  readonly summary: {
    readonly widerA: (name: string, amount: number) => string;
    readonly widerB: (name: string, amount: number) => string;
    readonly sameWidth: string;
    readonly pcdDifferent: (a: string, b: string) => string;
    readonly pcdSame: (pcd: string) => string;
    readonly diameter: (percent: number) => string;
  };
  readonly actions: { readonly vehicleA: string; readonly vehicleB: string; readonly compareTires: string; readonly fitment: string };
}

const BASE_COPY: Readonly<Record<'en' | 'de' | 'es', ComparisonCopy>> = {
  en: {
    chooseBoth: 'Choose two vehicles to compare their documented wheel and tire references.',
    same: 'Choose two different vehicles. A vehicle cannot be compared with itself.',
    invalid: 'One or both vehicle IDs are not available in this Atlas market view.',
    market: 'Market reference', generation: 'Generation / years', tire: 'Reference tire', width: 'Tire width', sidewall: 'Sidewall height', diameter: 'Overall diameter', circumference: 'Circumference', wheel: 'Reference wheel', pcd: 'Bolt pattern / PCD', lugs: 'Lug count', bore: 'Center bore', fastener: 'Fastener type', torque: 'Wheel torque',
    marketNames: { us: 'US', eu: 'Europe' }, fastenerNames: { 'lug-nut': 'Lug nut', 'wheel-bolt': 'Wheel bolt' }, missing: 'Not documented',
    summary: {
      widerA: (name, amount) => `${name} uses a ${amount.toFixed(0)} mm wider reference tire.`,
      widerB: (name, amount) => `${name} uses a ${amount.toFixed(0)} mm wider reference tire.`,
      sameWidth: 'The documented reference tires have the same nominal width.',
      pcdDifferent: (a, b) => `The vehicles use different PCDs: ${a} and ${b}.`,
      pcdSame: (pcd) => `Both entries use ${pcd}, but PCD alone does not prove wheel compatibility.`,
      diameter: (percent) => `Their reference tire diameters differ by ${percent.toFixed(2)}%.`,
    },
    actions: { vehicleA: 'Open Vehicle A', vehicleB: 'Open Vehicle B', compareTires: 'Compare these tire sizes', fitment: 'Open Wheel & Tire Compare' },
  },
  de: {
    chooseBoth: 'Wählen Sie zwei Fahrzeuge, um ihre dokumentierten Rad- und Reifenreferenzen zu vergleichen.',
    same: 'Wählen Sie zwei verschiedene Fahrzeuge. Ein Fahrzeug kann nicht mit sich selbst verglichen werden.',
    invalid: 'Eine oder beide Fahrzeug-IDs sind in dieser Atlas-Marktansicht nicht verfügbar.',
    market: 'Marktreferenz', generation: 'Generation / Baujahre', tire: 'Referenzreifen', width: 'Reifenbreite', sidewall: 'Flankenhöhe', diameter: 'Gesamtdurchmesser', circumference: 'Abrollumfang', wheel: 'Referenzfelge', pcd: 'Lochkreis / PCD', lugs: 'Lochzahl', bore: 'Nabenbohrung', fastener: 'Befestigungsart', torque: 'Anzugsdrehmoment',
    marketNames: { us: 'USA', eu: 'Europa' }, fastenerNames: { 'lug-nut': 'Radmutter', 'wheel-bolt': 'Radschraube' }, missing: 'Nicht dokumentiert',
    summary: {
      widerA: (name, amount) => `${name} nutzt einen ${amount.toFixed(0)} mm breiteren Referenzreifen.`,
      widerB: (name, amount) => `${name} nutzt einen ${amount.toFixed(0)} mm breiteren Referenzreifen.`,
      sameWidth: 'Die dokumentierten Referenzreifen haben dieselbe Nennbreite.',
      pcdDifferent: (a, b) => `Die Fahrzeuge nutzen unterschiedliche Lochkreise: ${a} und ${b}.`,
      pcdSame: (pcd) => `Beide Einträge nutzen ${pcd}; der Lochkreis allein beweist jedoch keine Radkompatibilität.`,
      diameter: (percent) => `Die Durchmesser der Referenzreifen unterscheiden sich um ${percent.toFixed(2)} %.`,
    },
    actions: { vehicleA: 'Fahrzeug A öffnen', vehicleB: 'Fahrzeug B öffnen', compareTires: 'Diese Reifengrößen vergleichen', fitment: 'Rad- & Reifenvergleich öffnen' },
  },
  es: {
    chooseBoth: 'Elija dos vehículos para comparar sus referencias documentadas de ruedas y neumáticos.',
    same: 'Elija dos vehículos distintos. Un vehículo no puede compararse consigo mismo.',
    invalid: 'Uno o ambos identificadores no están disponibles en esta vista de mercado de Atlas.',
    market: 'Mercado de referencia', generation: 'Generación / años', tire: 'Neumático de referencia', width: 'Ancho del neumático', sidewall: 'Altura del flanco', diameter: 'Diámetro total', circumference: 'Circunferencia', wheel: 'Llanta de referencia', pcd: 'Patrón / PCD', lugs: 'Número de birlos', bore: 'Diámetro de buje', fastener: 'Tipo de fijación', torque: 'Par de apriete',
    marketNames: { us: 'EE. UU.', eu: 'Europa' }, fastenerNames: { 'lug-nut': 'Tuerca de rueda', 'wheel-bolt': 'Birlo de rueda' }, missing: 'No documentado',
    summary: {
      widerA: (name, amount) => `${name} usa un neumático de referencia ${amount.toFixed(0)} mm más ancho.`,
      widerB: (name, amount) => `${name} usa un neumático de referencia ${amount.toFixed(0)} mm más ancho.`,
      sameWidth: 'Los neumáticos de referencia documentados tienen el mismo ancho nominal.',
      pcdDifferent: (a, b) => `Los vehículos usan PCD distintos: ${a} y ${b}.`,
      pcdSame: (pcd) => `Ambas entradas usan ${pcd}, pero el PCD por sí solo no demuestra compatibilidad.`,
      diameter: (percent) => `Los diámetros de sus neumáticos de referencia difieren un ${percent.toFixed(2)} %.`,
    },
    actions: { vehicleA: 'Abrir Vehículo A', vehicleB: 'Abrir Vehículo B', compareTires: 'Comparar estos neumáticos', fitment: 'Abrir comparación de llantas y neumáticos' },
  },
};
// French has no vehicle-comparison page; French entity pages link to the English one.
const COPY: Readonly<Record<EntityLocale, ComparisonCopy>> = { ...BASE_COPY, fr: BASE_COPY.en };

export const comparisonPath = (locale: EntityLocale): string => locale === 'de' ? '/de/fahrzeuge/vergleichen/' : locale === 'es' ? '/es/vehiculos/comparar/' : '/vehicles/compare/';

export function canonicalVehiclePair(firstId: string, secondId: string): readonly [string, string] {
  return firstId.localeCompare(secondId) <= 0 ? [firstId, secondId] : [secondId, firstId];
}

export function vehicleComparisonHref(locale: EntityLocale, firstId?: string, secondId?: string): string {
  const path = comparisonPath(locale);
  if (!firstId) return path;
  if (!secondId || firstId === secondId) return `${path}?a=${encodeURIComponent(firstId)}`;
  const [a, b] = canonicalVehiclePair(firstId, secondId);
  return `${path}?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
}

export function vehicleTripHref(locale: EntityLocale, vehicleId: string): string {
  return `${localizedToolPath(locale === 'fr' ? 'en' : locale, 'road-trip-cost-calculator', 'tool')}?vehicle=${encodeURIComponent(vehicleId)}`;
}

export function vehicleFuelHref(locale: EntityLocale, vehicleId: string): string {
  return `${localizedToolPath(locale === 'fr' ? 'en' : locale, 'fuel-cost-calculator', 'tool')}?vehicle=${encodeURIComponent(vehicleId)}`;
}

export function geometryForVehicle(vehicle: VehicleFitment): VehicleGeometry {
  const tire = parseTireNotation(vehicle.tireSize);
  if (!tire) throw new Error(`Malformed reference tire on ${vehicle.id}: ${vehicle.tireSize}`);
  const sidewallMm = tire.widthMm * tire.aspectRatio / 100;
  const diameterMm = tire.rimDiameterInches * 25.4 + sidewallMm * 2;
  return Object.freeze({ widthMm: tire.widthMm, sidewallMm, diameterMm, circumferenceMm: diameterMm * Math.PI });
}

const displayName = (vehicle: VehicleFitment): string => `${vehicle.make} ${vehicle.model}`;
const sameNumber = (a: number | undefined, b: number | undefined): boolean => a === b;
const mm = (value: number | undefined, missing: string, digits = 1): string => value === undefined ? missing : `${value.toFixed(digits)} mm`;

export function compareVehicleIds(firstId: string | null | undefined, secondId: string | null | undefined, locale: EntityLocale, catalog: readonly VehicleFitment[] = vehicleFitmentData): VehicleComparisonResult {
  const copy = COPY[locale];
  const empty = (status: ComparisonStatus, message: string): VehicleComparisonResult => Object.freeze({ status, message, summaries: Object.freeze([]), rows: Object.freeze([]), actions: Object.freeze([]) });
  if (!firstId || !secondId) return empty('incomplete', copy.chooseBoth);
  if (firstId === secondId) return empty('same', copy.same);
  const [canonicalA, canonicalB] = canonicalVehiclePair(firstId, secondId);
  const a = catalog.find((vehicle) => vehicle.id === canonicalA);
  const b = catalog.find((vehicle) => vehicle.id === canonicalB);
  if (!a || !b) return empty('invalid', copy.invalid);

  const aGeometry = geometryForVehicle(a);
  const bGeometry = geometryForVehicle(b);
  const diameterDifferencePercent = Math.abs(bGeometry.diameterMm - aGeometry.diameterMm) / aGeometry.diameterMm * 100;
  const aTorque = torquePresentation(a, locale);
  const bTorque = torquePresentation(b, locale);
  const aVehicleLink = vehicleLink(a, locale).href;
  const bVehicleLink = vehicleLink(b, locale).href;
  const tireEntry = (vehicle: VehicleFitment) => ({ notation: vehicle.tireSize, slug: tireSizeSlug(vehicle.tireSize), ...parseTireNotation(vehicle.tireSize)! });
  const aTire = tireEntry(a);
  const bTire = tireEntry(b);

  const rows: readonly VehicleComparisonRow[] = Object.freeze([
    { id: 'market', label: copy.market, a: copy.marketNames[a.market], b: copy.marketNames[b.market], shared: a.market === b.market },
    { id: 'generation', label: copy.generation, a: a.generation, b: b.generation, shared: a.generation === b.generation },
    { id: 'tire', label: copy.tire, a: a.tireSize, b: b.tireSize, shared: a.tireSize === b.tireSize, aHref: entityDetailPath('tire-size', locale, tireSizeSlug(a.tireSize)), bHref: entityDetailPath('tire-size', locale, tireSizeSlug(b.tireSize)) },
    { id: 'width', label: copy.width, a: mm(aGeometry.widthMm, copy.missing, 0), b: mm(bGeometry.widthMm, copy.missing, 0), shared: sameNumber(aGeometry.widthMm, bGeometry.widthMm) },
    { id: 'sidewall', label: copy.sidewall, a: mm(aGeometry.sidewallMm, copy.missing), b: mm(bGeometry.sidewallMm, copy.missing), shared: sameNumber(aGeometry.sidewallMm, bGeometry.sidewallMm) },
    { id: 'diameter', label: copy.diameter, a: mm(aGeometry.diameterMm, copy.missing), b: mm(bGeometry.diameterMm, copy.missing), shared: sameNumber(aGeometry.diameterMm, bGeometry.diameterMm) },
    { id: 'circumference', label: copy.circumference, a: mm(aGeometry.circumferenceMm, copy.missing), b: mm(bGeometry.circumferenceMm, copy.missing), shared: sameNumber(aGeometry.circumferenceMm, bGeometry.circumferenceMm) },
    { id: 'wheel', label: copy.wheel, a: a.wheelSize, b: b.wheelSize, shared: a.wheelSize === b.wheelSize },
    { id: 'pcd', label: copy.pcd, a: a.boltPattern, b: b.boltPattern, shared: a.boltPattern === b.boltPattern, aHref: entityDetailPath('bolt-pattern', locale, boltPatternSlug(a.boltPattern)), bHref: entityDetailPath('bolt-pattern', locale, boltPatternSlug(b.boltPattern)) },
    { id: 'lugs', label: copy.lugs, a: String(a.lugCount), b: String(b.lugCount), shared: a.lugCount === b.lugCount },
    { id: 'bore', label: copy.bore, a: mm(a.centerBoreMm, copy.missing), b: mm(b.centerBoreMm, copy.missing), shared: sameNumber(a.centerBoreMm, b.centerBoreMm) },
    { id: 'fastener', label: copy.fastener, a: copy.fastenerNames[a.fastenerType], b: copy.fastenerNames[b.fastenerType], shared: a.fastenerType === b.fastenerType },
    {
      id: 'torque', label: copy.torque, a: aTorque.value, b: bTorque.value,
      shared: aTorque.value === bTorque.value && aTorque.qualifier === bTorque.qualifier,
      ...(aTorque.qualifier ? { aNote: aTorque.qualifier } : aTorque.note ? { aNote: aTorque.note } : {}),
      ...(bTorque.qualifier ? { bNote: bTorque.qualifier } : bTorque.note ? { bNote: bTorque.note } : {}),
    },
  ]);

  const widthDifference = aGeometry.widthMm - bGeometry.widthMm;
  const summaries = Object.freeze([
    widthDifference > 0 ? copy.summary.widerA(displayName(a), widthDifference) : widthDifference < 0 ? copy.summary.widerB(displayName(b), -widthDifference) : copy.summary.sameWidth,
    a.boltPattern === b.boltPattern ? copy.summary.pcdSame(a.boltPattern) : copy.summary.pcdDifferent(a.boltPattern, b.boltPattern),
    copy.summary.diameter(diameterDifferencePercent),
  ]);

  const actions = Object.freeze([
    { href: aVehicleLink, label: copy.actions.vehicleA },
    { href: bVehicleLink, label: copy.actions.vehicleB },
    { href: tireComparisonHref(locale, aTire, bTire), label: copy.actions.compareTires },
    { href: locale === 'en' ? '/fitment-studio/' : `/${locale}/fitment-studio/`, label: copy.actions.fitment },
  ]);

  return Object.freeze({ status: 'ready', message: '', canonicalIds: Object.freeze([canonicalA, canonicalB] as const), vehicleA: a, vehicleB: b, summaries, rows, actions, diameterDifferencePercent });
}

export const vehicleComparisonCopy = (locale: EntityLocale): ComparisonCopy => COPY[locale];
