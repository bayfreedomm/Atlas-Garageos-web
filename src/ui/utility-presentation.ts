import type { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { formatNumber } from './format-number';
import type { PresentedMetric } from './tool-presentation';
import { getPageLocale, type UiLocale } from './page-locale';

type ValidValue<T extends (...args: never[]) => unknown> = ReturnType<T> extends infer Result ? Result extends { readonly ok: true; readonly value: infer Value } ? Value : never : never;
const money = (value: number, currency: string): string => `${currency} ${formatNumber(value, 2)}`;

const FUEL_COST_TEXT = {
  en: {
    summary: (fuel: string, cost: string) => `You'll use approximately ${fuel} of fuel and spend about ${cost}.`,
    fuelRequired: 'Fuel required', estimatedCost: 'Estimated fuel cost', costPer: (distanceUnit: string) => `Cost per ${distanceUnit}`,
  },
  de: {
    summary: (fuel: string, cost: string) => `Sie benötigen etwa ${fuel} Kraftstoff und zahlen dafür rund ${cost}.`,
    fuelRequired: 'Kraftstoffbedarf', estimatedCost: 'Geschätzte Kraftstoffkosten', costPer: (distanceUnit: string) => `Kosten pro ${distanceUnit}`,
  },
  es: {
    summary: (fuel: string, cost: string) => `Necesitará aproximadamente ${fuel} de combustible y gastará unos ${cost}.`,
    fuelRequired: 'Combustible necesario', estimatedCost: 'Coste de combustible estimado', costPer: (distanceUnit: string) => `Coste por ${distanceUnit}`,
  },
} as const satisfies Record<UiLocale, { summary: (fuel: string, cost: string) => string; fuelRequired: string; estimatedCost: string; costPer: (distanceUnit: string) => string }>;

const DISTANCE_UNIT_TEXT = {
  en: { km: 'km', mile: 'mile', mi: 'mi' },
  de: { km: 'km', mile: 'Meile', mi: 'mi' },
  es: { km: 'km', mile: 'milla', mi: 'mi' },
} as const satisfies Record<UiLocale, { km: string; mile: string; mi: string }>;

export function fuelCostPresentation(result: ValidValue<typeof calculateFuelCostTool>, currency: string, locale: UiLocale = getPageLocale()) {
  const text = FUEL_COST_TEXT[locale];
  const distanceUnits = DISTANCE_UNIT_TEXT[locale];
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distanceUnit = result.system === 'metric' ? distanceUnits.km : distanceUnits.mile;
  return Object.freeze({
    summary: text.summary(`${formatNumber(result.fuelRequired)} ${fuelUnit}`, money(result.fuelCost, currency)),
    metrics: Object.freeze<PresentedMetric[]>([
      { label: text.fuelRequired, value: `${formatNumber(result.fuelRequired)} ${fuelUnit}` },
      { label: text.estimatedCost, value: money(result.fuelCost, currency) },
      { label: text.costPer(distanceUnit), value: money(result.costPerDistance, currency) },
    ]),
  });
}

const ROAD_TRIP_TEXT = {
  en: {
    roundTrip: 'Round trip', oneWay: 'One way',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · ${cost} total.`,
    totalDistance: 'Total distance', estimatedFuelUsed: 'Estimated fuel used', fuelCost: 'Fuel cost', totalTripCost: 'Total trip cost', costPerPerson: 'Cost per person', costPer: (distanceUnit: string) => `Cost per ${distanceUnit}`,
  },
  de: {
    roundTrip: 'Hin- und Rückfahrt', oneWay: 'Einfache Fahrt',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · ${cost} gesamt.`,
    totalDistance: 'Gesamtstrecke', estimatedFuelUsed: 'Geschätzter Kraftstoffverbrauch', fuelCost: 'Kraftstoffkosten', totalTripCost: 'Gesamte Reisekosten', costPerPerson: 'Kosten pro Person', costPer: (distanceUnit: string) => `Kosten pro ${distanceUnit}`,
  },
  es: {
    roundTrip: 'Ida y vuelta', oneWay: 'Solo ida',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · ${cost} en total.`,
    totalDistance: 'Distancia total', estimatedFuelUsed: 'Combustible estimado', fuelCost: 'Coste de combustible', totalTripCost: 'Coste total del viaje', costPerPerson: 'Coste por persona', costPer: (distanceUnit: string) => `Coste por ${distanceUnit}`,
  },
} as const satisfies Record<UiLocale, {
  roundTrip: string; oneWay: string; summary: (direction: string, distance: string, fuel: string, cost: string) => string;
  totalDistance: string; estimatedFuelUsed: string; fuelCost: string; totalTripCost: string; costPerPerson: string; costPer: (distanceUnit: string) => string;
}>;

export function roadTripPresentation(result: ValidValue<typeof calculateRoadTripCostTool>, currency: string, locale: UiLocale = getPageLocale()) {
  const text = ROAD_TRIP_TEXT[locale];
  const distanceUnits = DISTANCE_UNIT_TEXT[locale];
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distanceUnit = result.system === 'metric' ? distanceUnits.km : distanceUnits.mi;
  const direction = result.roundTrip ? text.roundTrip : text.oneWay;
  return Object.freeze({
    summary: text.summary(direction, `${formatNumber(result.distance)} ${distanceUnit}`, `${formatNumber(result.fuelRequired)} ${fuelUnit}`, money(result.totalTripCost, currency)),
    metrics: Object.freeze<PresentedMetric[]>([
      { label: text.totalDistance, value: `${formatNumber(result.distance)} ${distanceUnit}` },
      { label: text.estimatedFuelUsed, value: `${formatNumber(result.fuelRequired)} ${fuelUnit}` },
      { label: text.fuelCost, value: money(result.fuelCost, currency) },
      { label: text.totalTripCost, value: money(result.totalTripCost, currency) },
      { label: text.costPerPerson, value: money(result.costPerPerson, currency) },
      { label: text.costPer(distanceUnit), value: money(result.costPerDistance, currency) },
    ]),
  });
}

const FUEL_ECONOMY_TEXT = {
  en: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km equals ${usMpg} US MPG or ${impMpg} Imperial MPG.`,
    usMpg: 'US MPG', imperialMpg: 'Imperial MPG', litersPer100Km: 'Litres per 100 km',
  },
  de: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km entsprechen ${usMpg} US-MPG bzw. ${impMpg} Imperial-MPG.`,
    usMpg: 'US-MPG', imperialMpg: 'Imperial-MPG', litersPer100Km: 'Liter pro 100 km',
  },
  es: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km equivalen a ${usMpg} MPG estadounidenses o ${impMpg} MPG imperiales.`,
    usMpg: 'MPG estadounidense', imperialMpg: 'MPG imperial', litersPer100Km: 'Litros por 100 km',
  },
} as const satisfies Record<UiLocale, { summary: (l100: string, usMpg: string, impMpg: string) => string; usMpg: string; imperialMpg: string; litersPer100Km: string }>;

export function fuelEconomyPresentation(result: ValidValue<typeof convertFuelEconomyTool>, locale: UiLocale = getPageLocale()) {
  const text = FUEL_ECONOMY_TEXT[locale];
  return Object.freeze({ summary: text.summary(formatNumber(result.litersPer100Km), formatNumber(result.usMpg), formatNumber(result.imperialMpg)), metrics: Object.freeze<PresentedMetric[]>([
    { label: text.usMpg, value: formatNumber(result.usMpg) }, { label: text.imperialMpg, value: formatNumber(result.imperialMpg) }, { label: text.litersPer100Km, value: `${formatNumber(result.litersPer100Km)} L/100km` },
  ]) });
}

const PRESSURE_TEXT = {
  en: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI equals ${bar} bar or ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopascals' },
  de: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI entsprechen ${bar} Bar bzw. ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopascal' },
  es: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI equivalen a ${bar} bar o ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopascales' },
} as const satisfies Record<UiLocale, { summary: (psi: string, bar: string, kpa: string) => string; psi: string; bar: string; kilopascals: string }>;

export function pressurePresentation(result: ValidValue<typeof convertPressureTool>, locale: UiLocale = getPageLocale()) {
  const text = PRESSURE_TEXT[locale];
  return Object.freeze({ summary: text.summary(formatNumber(result.psi), formatNumber(result.bar, 3), formatNumber(result.kpa)), metrics: Object.freeze<PresentedMetric[]>([
    { label: text.psi, value: formatNumber(result.psi) }, { label: text.bar, value: formatNumber(result.bar, 3) }, { label: text.kilopascals, value: `${formatNumber(result.kpa)} kPa` },
  ]) });
}

const POWER_TEXT = {
  en: { summary: (hp: string, kw: string) => `${hp} mechanical hp equals ${kw} kW.`, horsepower: 'Mechanical horsepower', kilowatts: 'Kilowatts' },
  de: { summary: (hp: string, kw: string) => `${hp} mechanische PS entsprechen ${kw} kW.`, horsepower: 'Mechanische Pferdestärke', kilowatts: 'Kilowatt' },
  es: { summary: (hp: string, kw: string) => `${hp} CV mecánicos equivalen a ${kw} kW.`, horsepower: 'Caballos de fuerza mecánicos', kilowatts: 'Kilovatios' },
} as const satisfies Record<UiLocale, { summary: (hp: string, kw: string) => string; horsepower: string; kilowatts: string }>;

export function powerPresentation(result: ValidValue<typeof convertPowerTool>, locale: UiLocale = getPageLocale()) {
  const text = POWER_TEXT[locale];
  return Object.freeze({ summary: text.summary(formatNumber(result.mechanicalHorsepower), formatNumber(result.kilowatts)), metrics: Object.freeze<PresentedMetric[]>([
    { label: text.horsepower, value: `${formatNumber(result.mechanicalHorsepower)} hp` }, { label: text.kilowatts, value: `${formatNumber(result.kilowatts)} kW` },
  ]) });
}

const TORQUE_TEXT = {
  en: { summary: (nm: string, lbft: string) => `${nm} Nm equals ${lbft} lb-ft.`, newtonMetres: 'Newton-metres', poundFeet: 'Pound-feet' },
  de: { summary: (nm: string, lbft: string) => `${nm} Nm entsprechen ${lbft} lb-ft.`, newtonMetres: 'Newtonmeter', poundFeet: 'Pfund-Fuß' },
  es: { summary: (nm: string, lbft: string) => `${nm} Nm equivalen a ${lbft} lb-ft.`, newtonMetres: 'Newton-metros', poundFeet: 'Libra-pie' },
} as const satisfies Record<UiLocale, { summary: (nm: string, lbft: string) => string; newtonMetres: string; poundFeet: string }>;

export function torquePresentation(result: ValidValue<typeof convertTorqueTool>, locale: UiLocale = getPageLocale()) {
  const text = TORQUE_TEXT[locale];
  return Object.freeze({ summary: text.summary(formatNumber(result.newtonMeters), formatNumber(result.poundFeet)), metrics: Object.freeze<PresentedMetric[]>([
    { label: text.newtonMetres, value: `${formatNumber(result.newtonMeters)} Nm` }, { label: text.poundFeet, value: `${formatNumber(result.poundFeet)} lb-ft` },
  ]) });
}

const POWER_TO_WEIGHT_TEXT = {
  en: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} in a ${weight} vehicle equals ${hpPerTonne} hp/tonne.`,
    hpPerTonne: 'Mechanical hp per tonne', kwPerTonne: 'Kilowatts per tonne', wPerKg: 'Watts per kilogram',
  },
  de: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} in einem ${weight} schweren Fahrzeug entsprechen ${hpPerTonne} PS/Tonne.`,
    hpPerTonne: 'Mechanische PS pro Tonne', kwPerTonne: 'Kilowatt pro Tonne', wPerKg: 'Watt pro Kilogramm',
  },
  es: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} en un vehículo de ${weight} equivalen a ${hpPerTonne} CV/tonelada.`,
    hpPerTonne: 'CV mecánicos por tonelada', kwPerTonne: 'Kilovatios por tonelada', wPerKg: 'Vatios por kilogramo',
  },
} as const satisfies Record<UiLocale, { summary: (power: string, weight: string, hpPerTonne: string) => string; hpPerTonne: string; kwPerTonne: string; wPerKg: string }>;

export function powerToWeightPresentation(result: ValidValue<typeof calculatePowerToWeightTool>, enteredPower: number, powerUnit: string, enteredWeight: number, weightUnit: string, locale: UiLocale = getPageLocale()) {
  const text = POWER_TO_WEIGHT_TEXT[locale];
  return Object.freeze({ summary: text.summary(`${formatNumber(enteredPower)} ${powerUnit}`, `${formatNumber(enteredWeight)} ${weightUnit}`, formatNumber(result.mechanicalHorsepowerPerTonne)), metrics: Object.freeze<PresentedMetric[]>([
    { label: text.hpPerTonne, value: `${formatNumber(result.mechanicalHorsepowerPerTonne)} hp/t` }, { label: text.kwPerTonne, value: `${formatNumber(result.kilowattsPerTonne)} kW/t` }, { label: text.wPerKg, value: `${formatNumber(result.wattsPerKilogram)} W/kg` },
  ]) });
}
