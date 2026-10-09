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
  'pt-br': {
    summary: (fuel: string, cost: string) => `Você vai usar aproximadamente ${fuel} de combustível e gastar cerca de ${cost}.`,
    fuelRequired: 'Combustível necessário', estimatedCost: 'Gasto estimado com combustível', costPer: (distanceUnit: string) => `Custo por ${distanceUnit}`,
  },
  fr: {
    summary: (fuel: string, cost: string) => `Vous consommerez environ ${fuel} de carburant, pour un coût d’environ ${cost}.`,
    fuelRequired: 'Carburant nécessaire', estimatedCost: 'Coût estimé du carburant', costPer: (distanceUnit: string) => `Coût par ${distanceUnit}`,
  },
  it: {
    summary: (fuel: string, cost: string) => `Consumerai circa ${fuel} di carburante e spenderai circa ${cost}.`,
    fuelRequired: 'Carburante necessario', estimatedCost: 'Costo stimato del carburante', costPer: (distanceUnit: string) => `Costo per ${distanceUnit}`,
  },
  pl: {
    summary: (fuel: string, cost: string) => `Zużyjesz około ${fuel} paliwa i wydasz około ${cost}.`,
    fuelRequired: 'Potrzebne paliwo', estimatedCost: 'Szacowany koszt paliwa', costPer: (distanceUnit: string) => `Koszt za ${distanceUnit}`,
  },
  nl: {
    summary: (fuel: string, cost: string) => `Je verbruikt ongeveer ${fuel} brandstof en betaalt zo’n ${cost}.`,
    fuelRequired: 'Benodigde brandstof', estimatedCost: 'Geschatte brandstofkosten', costPer: (distanceUnit: string) => `Kosten per ${distanceUnit}`,
  },
  tr: {
    summary: (fuel: string, cost: string) => `Yaklaşık ${fuel} yakıt kullanacak ve yaklaşık ${cost} harcayacaksınız.`,
    fuelRequired: 'Gereken yakıt', estimatedCost: 'Tahmini yakıt maliyeti', costPer: (distanceUnit: string) => `${distanceUnit} başına maliyet`,
  },
} as const satisfies Record<UiLocale, { summary: (fuel: string, cost: string) => string; fuelRequired: string; estimatedCost: string; costPer: (distanceUnit: string) => string }>;

const DISTANCE_UNIT_TEXT = {
  en: { km: 'km', mile: 'mile', mi: 'mi' },
  de: { km: 'km', mile: 'Meile', mi: 'mi' },
  es: { km: 'km', mile: 'milla', mi: 'mi' },
  'pt-br': { km: 'km', mile: 'milha', mi: 'mi' },
  fr: { km: 'km', mile: 'mile', mi: 'mi' },
  it: { km: 'km', mile: 'miglio', mi: 'mi' },
  pl: { km: 'km', mile: 'milę', mi: 'mi' },
  nl: { km: 'km', mile: 'mijl', mi: 'mi' },
  tr: { km: 'km', mile: 'mil', mi: 'mi' },
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
  'pt-br': {
    roundTrip: 'Ida e volta', oneWay: 'Só ida',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · ${cost} no total.`,
    totalDistance: 'Distância total', estimatedFuelUsed: 'Combustível estimado', fuelCost: 'Gasto com combustível', totalTripCost: 'Custo total da viagem', costPerPerson: 'Custo por pessoa', costPer: (distanceUnit: string) => `Custo por ${distanceUnit}`,
  },
  fr: {
    roundTrip: 'Aller-retour', oneWay: 'Aller simple',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction} : ${distance} · ${fuel} · ${cost} au total.`,
    totalDistance: 'Distance totale', estimatedFuelUsed: 'Carburant consommé estimé', fuelCost: 'Coût du carburant', totalTripCost: 'Coût total du trajet', costPerPerson: 'Coût par personne', costPer: (distanceUnit: string) => `Coût par ${distanceUnit}`,
  },
  it: {
    roundTrip: 'Andata e ritorno', oneWay: 'Solo andata',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · ${cost} in totale.`,
    totalDistance: 'Distanza totale', estimatedFuelUsed: 'Carburante stimato', fuelCost: 'Costo del carburante', totalTripCost: 'Costo totale del viaggio', costPerPerson: 'Costo a persona', costPer: (distanceUnit: string) => `Costo per ${distanceUnit}`,
  },
  pl: {
    roundTrip: 'Tam i z powrotem', oneWay: 'W jedną stronę',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · łącznie ${cost}.`,
    totalDistance: 'Łączny dystans', estimatedFuelUsed: 'Szacowane zużycie paliwa', fuelCost: 'Koszt paliwa', totalTripCost: 'Łączny koszt podróży', costPerPerson: 'Koszt na osobę', costPer: (distanceUnit: string) => `Koszt za ${distanceUnit}`,
  },
  nl: {
    roundTrip: 'Heen en terug', oneWay: 'Enkele reis',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · ${cost} totaal.`,
    totalDistance: 'Totale afstand', estimatedFuelUsed: 'Geschat brandstofverbruik', fuelCost: 'Brandstofkosten', totalTripCost: 'Totale reiskosten', costPerPerson: 'Kosten per persoon', costPer: (distanceUnit: string) => `Kosten per ${distanceUnit}`,
  },
  tr: {
    roundTrip: 'Gidiş-dönüş', oneWay: 'Tek yön',
    summary: (direction: string, distance: string, fuel: string, cost: string) => `${direction}: ${distance} · ${fuel} · toplam ${cost}.`,
    totalDistance: 'Toplam mesafe', estimatedFuelUsed: 'Tahmini yakıt kullanımı', fuelCost: 'Yakıt maliyeti', totalTripCost: 'Toplam yolculuk maliyeti', costPerPerson: 'Kişi başı maliyet', costPer: (distanceUnit: string) => `${distanceUnit} başına maliyet`,
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
  'pt-br': {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km equivalem a ${usMpg} MPG americano ou ${impMpg} MPG imperial.`,
    usMpg: 'MPG americano', imperialMpg: 'MPG imperial', litersPer100Km: 'Litros por 100 km',
  },
  fr: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km correspondent à ${usMpg} MPG US ou ${impMpg} MPG impérial.`,
    usMpg: 'MPG US', imperialMpg: 'MPG impérial', litersPer100Km: 'Litres aux 100 km',
  },
  it: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km equivalgono a ${usMpg} MPG USA o ${impMpg} MPG imperiali.`,
    usMpg: 'MPG USA', imperialMpg: 'MPG imperiali', litersPer100Km: 'Litri per 100 km',
  },
  pl: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km to ${usMpg} MPG (USA) lub ${impMpg} MPG (imperialne).`,
    usMpg: 'MPG (USA)', imperialMpg: 'MPG (imperialne)', litersPer100Km: 'Litry na 100 km',
  },
  nl: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km komt overeen met ${usMpg} US-MPG of ${impMpg} Imperial-MPG.`,
    usMpg: 'US-MPG', imperialMpg: 'Imperial-MPG', litersPer100Km: 'Liter per 100 km',
  },
  tr: {
    summary: (l100: string, usMpg: string, impMpg: string) => `${l100} L/100km, ${usMpg} ABD MPG veya ${impMpg} İngiliz (Imperial) MPG değerine eşittir.`,
    usMpg: 'ABD MPG', imperialMpg: 'İngiliz (Imperial) MPG', litersPer100Km: '100 km’de litre',
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
  'pt-br': { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI equivalem a ${bar} bar ou ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Quilopascais' },
  fr: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI correspondent à ${bar} bar ou ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopascals' },
  it: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI equivalgono a ${bar} bar o ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopascal' },
  pl: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI to ${bar} bar lub ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopaskale' },
  nl: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI komt overeen met ${bar} bar of ${kpa} kPa.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopascal' },
  tr: { summary: (psi: string, bar: string, kpa: string) => `${psi} PSI, ${bar} bar veya ${kpa} kPa değerine eşittir.`, psi: 'PSI', bar: 'Bar', kilopascals: 'Kilopaskal' },
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
  'pt-br': { summary: (hp: string, kw: string) => `${hp} hp mecânicos equivalem a ${kw} kW.`, horsepower: 'Cavalos-força mecânicos (hp)', kilowatts: 'Quilowatts' },
  fr: { summary: (hp: string, kw: string) => `${hp} hp mécaniques correspondent à ${kw} kW.`, horsepower: 'Chevaux mécaniques (hp)', kilowatts: 'Kilowatts' },
  it: { summary: (hp: string, kw: string) => `${hp} hp meccanici equivalgono a ${kw} kW.`, horsepower: 'Cavalli meccanici (hp)', kilowatts: 'Kilowatt' },
  pl: { summary: (hp: string, kw: string) => `${hp} hp mechanicznych to ${kw} kW.`, horsepower: 'Konie mechaniczne (hp)', kilowatts: 'Kilowaty' },
  nl: { summary: (hp: string, kw: string) => `${hp} mechanische hp komt overeen met ${kw} kW.`, horsepower: 'Mechanische paardenkracht (hp)', kilowatts: 'Kilowatt' },
  tr: { summary: (hp: string, kw: string) => `${hp} mekanik hp, ${kw} kW değerine eşittir.`, horsepower: 'Mekanik beygir gücü (hp)', kilowatts: 'Kilovat' },
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
  'pt-br': { summary: (nm: string, lbft: string) => `${nm} Nm equivalem a ${lbft} lb-ft.`, newtonMetres: 'Newton-metros', poundFeet: 'Libra-pé' },
  fr: { summary: (nm: string, lbft: string) => `${nm} Nm correspondent à ${lbft} lb-ft.`, newtonMetres: 'Newton-mètres', poundFeet: 'Livre-pied' },
  it: { summary: (nm: string, lbft: string) => `${nm} Nm equivalgono a ${lbft} lb-ft.`, newtonMetres: 'Newton-metro', poundFeet: 'Libbra-piede' },
  pl: { summary: (nm: string, lbft: string) => `${nm} Nm to ${lbft} lb-ft.`, newtonMetres: 'Niutonometry', poundFeet: 'Funto-stopy' },
  nl: { summary: (nm: string, lbft: string) => `${nm} Nm komt overeen met ${lbft} lb-ft.`, newtonMetres: 'Newtonmeter', poundFeet: 'Pound-feet' },
  tr: { summary: (nm: string, lbft: string) => `${nm} Nm, ${lbft} lb-ft değerine eşittir.`, newtonMetres: 'Newton metre', poundFeet: 'Pound-feet (lb-ft)' },
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
  'pt-br': {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} em um veículo de ${weight} equivalem a ${hpPerTonne} hp/tonelada.`,
    hpPerTonne: 'hp mecânicos por tonelada', kwPerTonne: 'Quilowatts por tonelada', wPerKg: 'Watts por quilograma',
  },
  fr: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} pour un véhicule de ${weight} correspondent à ${hpPerTonne} hp/tonne.`,
    hpPerTonne: 'hp mécaniques par tonne', kwPerTonne: 'Kilowatts par tonne', wPerKg: 'Watts par kilogramme',
  },
  it: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} su un veicolo di ${weight} equivalgono a ${hpPerTonne} hp/tonnellata.`,
    hpPerTonne: 'hp meccanici per tonnellata', kwPerTonne: 'Kilowatt per tonnellata', wPerKg: 'Watt per chilogrammo',
  },
  pl: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} w pojeździe o masie ${weight} daje ${hpPerTonne} hp/tonę.`,
    hpPerTonne: 'hp mechaniczne na tonę', kwPerTonne: 'Kilowaty na tonę', wPerKg: 'Waty na kilogram',
  },
  nl: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${power} in een voertuig van ${weight} komt overeen met ${hpPerTonne} hp/ton.`,
    hpPerTonne: 'Mechanische hp per ton', kwPerTonne: 'Kilowatt per ton', wPerKg: 'Watt per kilogram',
  },
  tr: {
    summary: (power: string, weight: string, hpPerTonne: string) => `${weight} ağırlığındaki bir araçta ${power}, ton başına ${hpPerTonne} hp demektir.`,
    hpPerTonne: 'Ton başına mekanik hp', kwPerTonne: 'Ton başına kilovat', wPerKg: 'Kilogram başına vat',
  },
} as const satisfies Record<UiLocale, { summary: (power: string, weight: string, hpPerTonne: string) => string; hpPerTonne: string; kwPerTonne: string; wPerKg: string }>;

export function powerToWeightPresentation(result: ValidValue<typeof calculatePowerToWeightTool>, enteredPower: number, powerUnit: string, enteredWeight: number, weightUnit: string, locale: UiLocale = getPageLocale()) {
  const text = POWER_TO_WEIGHT_TEXT[locale];
  return Object.freeze({ summary: text.summary(`${formatNumber(enteredPower)} ${powerUnit}`, `${formatNumber(enteredWeight)} ${weightUnit}`, formatNumber(result.mechanicalHorsepowerPerTonne)), metrics: Object.freeze<PresentedMetric[]>([
    { label: text.hpPerTonne, value: `${formatNumber(result.mechanicalHorsepowerPerTonne)} hp/t` }, { label: text.kwPerTonne, value: `${formatNumber(result.kilowattsPerTonne)} kW/t` }, { label: text.wPerKg, value: `${formatNumber(result.wattsPerKilogram)} W/kg` },
  ]) });
}
