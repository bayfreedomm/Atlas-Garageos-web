import { calculateFuelCost, calculatePowerToWeight, calculateRoadTripCost, convertFuelCostInputSystem, convertFuelEconomy, convertPower, convertPressure, convertTorque } from '../../core/units/automotive';
import { collectValid, createNonNegativeQuantity, createPositiveQuantity, type FuelEconomyUnit, type PositiveQuantity, type PowerUnit, type PressureUnit, type TorqueUnit, type UnitSystem, type WeightUnit } from '../../domain/utility-calculators';
import { invalid, valid } from '../../domain/validation';

export interface FuelCostToolInput { readonly system: UnitSystem; readonly distance: number; readonly economy: number; readonly price: number; }
export interface RoadTripToolInput extends FuelCostToolInput { readonly roundTrip: boolean; readonly extraCost?: number; readonly people?: number; }

export function calculateFuelCostTool(input: FuelCostToolInput) {
  const values = { distance: createPositiveQuantity(input.distance, 'distance'), economy: createPositiveQuantity(input.economy, 'fuelEconomy'), price: createPositiveQuantity(input.price, 'fuelPrice') };
  const issues = collectValid(values);
  if (issues.length || !values.distance.ok || !values.economy.ok || !values.price.ok) return invalid(...issues);
  return valid(calculateFuelCost({ system: input.system, distance: values.distance.value, economy: values.economy.value, price: values.price.value }));
}

export function convertFuelInputSystemTool(input: FuelCostToolInput, target: UnitSystem) {
  const values = { distance: createPositiveQuantity(input.distance, 'distance'), economy: createPositiveQuantity(input.economy, 'fuelEconomy'), price: createPositiveQuantity(input.price, 'fuelPrice') };
  const issues = collectValid(values);
  if (issues.length || !values.distance.ok || !values.economy.ok || !values.price.ok) return invalid(...issues);
  return valid(convertFuelCostInputSystem({ system: input.system, distance: values.distance.value, economy: values.economy.value, price: values.price.value }, target));
}

export function calculateRoadTripCostTool(input: RoadTripToolInput) {
  const values = { distance: createPositiveQuantity(input.distance, 'distance'), economy: createPositiveQuantity(input.economy, 'fuelEconomy'), price: createPositiveQuantity(input.price, 'fuelPrice'), extraCost: createNonNegativeQuantity(input.extraCost ?? 0, 'extraCost'), people: createPositiveQuantity(input.people ?? 1, 'people') };
  const issues = collectValid(values);
  if (issues.length || !values.distance.ok || !values.economy.ok || !values.price.ok || !values.extraCost.ok || !values.people.ok) return invalid(...issues);
  if (!Number.isInteger(values.people.value)) return invalid({ code: 'not-an-integer', field: 'people', message: 'people must be a whole number.', received: input.people });
  return valid(calculateRoadTripCost({ system: input.system, distance: values.distance.value, economy: values.economy.value, price: values.price.value, extraCost: values.extraCost.value, people: values.people.value, roundTrip: input.roundTrip }));
}

function convertValue<TUnit extends string, TResult>(value: number, field: string, unit: TUnit, convert: (value: PositiveQuantity, unit: TUnit) => TResult) {
  const quantity = createPositiveQuantity(value, field);
  return quantity.ok ? valid(convert(quantity.value, unit)) : quantity;
}

export const convertFuelEconomyTool = (value: number, unit: FuelEconomyUnit) => convertValue(value, 'fuelEconomy', unit, convertFuelEconomy);
export const convertPressureTool = (value: number, unit: PressureUnit) => convertValue(value, 'pressure', unit, convertPressure);
export const convertPowerTool = (value: number, unit: PowerUnit) => convertValue(value, 'power', unit, convertPower);
export const convertTorqueTool = (value: number, unit: TorqueUnit) => convertValue(value, 'torque', unit, convertTorque);

export function calculatePowerToWeightTool(input: { readonly power: number; readonly powerUnit: PowerUnit; readonly weight: number; readonly weightUnit: WeightUnit }) {
  const values = { power: createPositiveQuantity(input.power, 'power'), weight: createPositiveQuantity(input.weight, 'weight') };
  const issues = collectValid(values);
  if (issues.length || !values.power.ok || !values.weight.ok) return invalid(...issues);
  return valid(calculatePowerToWeight({ power: values.power.value, powerUnit: input.powerUnit, weight: values.weight.value, weightUnit: input.weightUnit }));
}
