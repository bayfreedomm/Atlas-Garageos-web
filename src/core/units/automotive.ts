import type { FuelCostCalculationInput, FuelEconomyUnit, PositiveQuantity, PowerToWeightCalculationInput, PowerUnit, PressureUnit, RoadTripCalculationInput, TorqueUnit, WeightUnit } from '../../domain/utility-calculators';

export const LITERS_PER_US_GALLON = 3.785411784;
export const LITERS_PER_IMPERIAL_GALLON = 4.54609;
export const KILOMETERS_PER_MILE = 1.609344;
export const US_MPG_L100KM_CONSTANT = 100 * LITERS_PER_US_GALLON / KILOMETERS_PER_MILE;
export const IMPERIAL_MPG_L100KM_CONSTANT = 100 * LITERS_PER_IMPERIAL_GALLON / KILOMETERS_PER_MILE;
export const PASCALS_PER_PSI = 6894.757293168;
export const PASCALS_PER_BAR = 100_000;
export const BAR_PER_PSI = PASCALS_PER_PSI / PASCALS_PER_BAR;
export const KILOPASCALS_PER_BAR = 100;
export const WATTS_PER_MECHANICAL_HP = 745.6998715822702;
export const NEWTON_METERS_PER_POUND_FOOT = 1.3558179483314004;
export const KILOGRAMS_PER_POUND = 0.45359237;

export interface FuelCostResult {
  readonly system: FuelCostCalculationInput['system'];
  readonly distance: number;
  readonly fuelRequired: number;
  readonly fuelCost: number;
  readonly costPerDistance: number;
}

export function calculateFuelCost(input: FuelCostCalculationInput): FuelCostResult {
  const fuelRequired = input.system === 'metric' ? input.distance * input.economy / 100 : input.distance / input.economy;
  const fuelCost = fuelRequired * input.price;
  return Object.freeze({ system: input.system, distance: input.distance, fuelRequired, fuelCost, costPerDistance: fuelCost / input.distance });
}

export function convertFuelCostInputSystem(input: FuelCostCalculationInput, target: FuelCostCalculationInput['system']) {
  if (input.system === target) return Object.freeze({ system: target, distance: input.distance, economy: input.economy, price: input.price });
  return input.system === 'metric'
    ? Object.freeze({ system: target, distance: input.distance / KILOMETERS_PER_MILE, economy: US_MPG_L100KM_CONSTANT / input.economy, price: input.price * LITERS_PER_US_GALLON })
    : Object.freeze({ system: target, distance: input.distance * KILOMETERS_PER_MILE, economy: US_MPG_L100KM_CONSTANT / input.economy, price: input.price / LITERS_PER_US_GALLON });
}

export function calculateRoadTripCost(input: RoadTripCalculationInput) {
  const multiplier = input.roundTrip ? 2 : 1;
  const fuel = calculateFuelCost({ system: input.system, distance: (input.distance * multiplier) as PositiveQuantity, economy: input.economy, price: input.price });
  const totalTripCost = fuel.fuelCost + input.extraCost;
  return Object.freeze({ ...fuel, totalTripCost, costPerPerson: totalTripCost / input.people, costPerDistance: totalTripCost / fuel.distance, people: input.people, extraCost: input.extraCost, roundTrip: input.roundTrip });
}

export function convertFuelEconomy(value: PositiveQuantity, from: FuelEconomyUnit) {
  const litersPer100Km = from === 'l100km' ? value : (from === 'us-mpg' ? US_MPG_L100KM_CONSTANT : IMPERIAL_MPG_L100KM_CONSTANT) / value;
  return Object.freeze({ litersPer100Km, usMpg: US_MPG_L100KM_CONSTANT / litersPer100Km, imperialMpg: IMPERIAL_MPG_L100KM_CONSTANT / litersPer100Km });
}

export function convertPressure(value: PositiveQuantity, from: PressureUnit) {
  const bar = from === 'bar' ? value : from === 'psi' ? value * BAR_PER_PSI : value / KILOPASCALS_PER_BAR;
  return Object.freeze({ psi: bar / BAR_PER_PSI, bar, kpa: bar * KILOPASCALS_PER_BAR });
}

export function convertPower(value: PositiveQuantity, from: PowerUnit) {
  const watts = from === 'hp' ? value * WATTS_PER_MECHANICAL_HP : value * 1000;
  return Object.freeze({ mechanicalHorsepower: watts / WATTS_PER_MECHANICAL_HP, kilowatts: watts / 1000, watts });
}

export function convertTorque(value: PositiveQuantity, from: TorqueUnit) {
  const newtonMeters = from === 'nm' ? value : value * NEWTON_METERS_PER_POUND_FOOT;
  return Object.freeze({ newtonMeters, poundFeet: newtonMeters / NEWTON_METERS_PER_POUND_FOOT });
}

const weightInKilograms = (value: PositiveQuantity, unit: WeightUnit): number => unit === 'kg' ? value : value * KILOGRAMS_PER_POUND;
const powerInWatts = (value: PositiveQuantity, unit: PowerUnit): number => unit === 'hp' ? value * WATTS_PER_MECHANICAL_HP : value * 1000;

export function calculatePowerToWeight(input: PowerToWeightCalculationInput) {
  const kilograms = weightInKilograms(input.weight, input.weightUnit);
  const watts = powerInWatts(input.power, input.powerUnit);
  const tonnes = kilograms / 1000;
  return Object.freeze({ watts, kilograms, mechanicalHorsepowerPerTonne: watts / WATTS_PER_MECHANICAL_HP / tonnes, kilowattsPerTonne: watts / 1000 / tonnes, wattsPerKilogram: watts / kilograms });
}
