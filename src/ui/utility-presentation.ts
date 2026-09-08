import type { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { formatNumber } from './format-number';
import type { PresentedMetric } from './tool-presentation';

type ValidValue<T extends (...args: never[]) => unknown> = ReturnType<T> extends infer Result ? Result extends { readonly ok: true; readonly value: infer Value } ? Value : never : never;
const money = (value: number, currency: string): string => `${currency} ${formatNumber(value, 2)}`;

export function fuelCostPresentation(result: ValidValue<typeof calculateFuelCostTool>, currency: string) {
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distanceUnit = result.system === 'metric' ? 'km' : 'mile';
  return Object.freeze({
    summary: `You'll use approximately ${formatNumber(result.fuelRequired)} ${fuelUnit} of fuel and spend about ${money(result.fuelCost, currency)}.`,
    metrics: Object.freeze<PresentedMetric[]>([
      { label: 'Fuel required', value: `${formatNumber(result.fuelRequired)} ${fuelUnit}` },
      { label: 'Estimated fuel cost', value: money(result.fuelCost, currency) },
      { label: `Cost per ${distanceUnit}`, value: money(result.costPerDistance, currency) },
    ]),
  });
}

export function roadTripPresentation(result: ValidValue<typeof calculateRoadTripCostTool>, currency: string) {
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distanceUnit = result.system === 'metric' ? 'km' : 'mi';
  return Object.freeze({
    summary: `${result.roundTrip ? 'Round trip' : 'One way'}: ${formatNumber(result.distance)} ${distanceUnit} · ${formatNumber(result.fuelRequired)} ${fuelUnit} · ${money(result.totalTripCost, currency)} total.`,
    metrics: Object.freeze<PresentedMetric[]>([
      { label: 'Total distance', value: `${formatNumber(result.distance)} ${distanceUnit}` },
      { label: 'Estimated fuel used', value: `${formatNumber(result.fuelRequired)} ${fuelUnit}` },
      { label: 'Fuel cost', value: money(result.fuelCost, currency) },
      { label: 'Total trip cost', value: money(result.totalTripCost, currency) },
      { label: 'Cost per person', value: money(result.costPerPerson, currency) },
      { label: `Cost per ${distanceUnit}`, value: money(result.costPerDistance, currency) },
    ]),
  });
}

export function fuelEconomyPresentation(result: ValidValue<typeof convertFuelEconomyTool>) {
  return Object.freeze({ summary: `${formatNumber(result.litersPer100Km)} L/100km equals ${formatNumber(result.usMpg)} US MPG or ${formatNumber(result.imperialMpg)} Imperial MPG.`, metrics: Object.freeze<PresentedMetric[]>([
    { label: 'US MPG', value: formatNumber(result.usMpg) }, { label: 'Imperial MPG', value: formatNumber(result.imperialMpg) }, { label: 'Litres per 100 km', value: `${formatNumber(result.litersPer100Km)} L/100km` },
  ]) });
}

export function pressurePresentation(result: ValidValue<typeof convertPressureTool>) {
  return Object.freeze({ summary: `${formatNumber(result.psi)} PSI equals ${formatNumber(result.bar, 3)} bar or ${formatNumber(result.kpa)} kPa.`, metrics: Object.freeze<PresentedMetric[]>([
    { label: 'PSI', value: formatNumber(result.psi) }, { label: 'Bar', value: formatNumber(result.bar, 3) }, { label: 'Kilopascals', value: `${formatNumber(result.kpa)} kPa` },
  ]) });
}

export function powerPresentation(result: ValidValue<typeof convertPowerTool>) {
  return Object.freeze({ summary: `${formatNumber(result.mechanicalHorsepower)} mechanical hp equals ${formatNumber(result.kilowatts)} kW.`, metrics: Object.freeze<PresentedMetric[]>([
    { label: 'Mechanical horsepower', value: `${formatNumber(result.mechanicalHorsepower)} hp` }, { label: 'Kilowatts', value: `${formatNumber(result.kilowatts)} kW` },
  ]) });
}

export function torquePresentation(result: ValidValue<typeof convertTorqueTool>) {
  return Object.freeze({ summary: `${formatNumber(result.newtonMeters)} Nm equals ${formatNumber(result.poundFeet)} lb-ft.`, metrics: Object.freeze<PresentedMetric[]>([
    { label: 'Newton-metres', value: `${formatNumber(result.newtonMeters)} Nm` }, { label: 'Pound-feet', value: `${formatNumber(result.poundFeet)} lb-ft` },
  ]) });
}

export function powerToWeightPresentation(result: ValidValue<typeof calculatePowerToWeightTool>, enteredPower: number, powerUnit: string, enteredWeight: number, weightUnit: string) {
  return Object.freeze({ summary: `${formatNumber(enteredPower)} ${powerUnit} in a ${formatNumber(enteredWeight)} ${weightUnit} vehicle equals ${formatNumber(result.mechanicalHorsepowerPerTonne)} hp/tonne.`, metrics: Object.freeze<PresentedMetric[]>([
    { label: 'Mechanical hp per tonne', value: `${formatNumber(result.mechanicalHorsepowerPerTonne)} hp/t` }, { label: 'Kilowatts per tonne', value: `${formatNumber(result.kilowattsPerTonne)} kW/t` }, { label: 'Watts per kilogram', value: `${formatNumber(result.wattsPerKilogram)} W/kg` },
  ]) });
}
