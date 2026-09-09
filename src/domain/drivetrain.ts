import { invalid, valid, type ValidationIssue, type ValidationResult } from './validation';

declare const tireDiameterBrand: unique symbol;
declare const gearRatioBrand: unique symbol;
declare const roadSpeedBrand: unique symbol;

export type TireDiameterInches = number & { readonly [tireDiameterBrand]: true };
export type GearRatio = number & { readonly [gearRatioBrand]: true };
export type RoadSpeedMph = number & { readonly [roadSpeedBrand]: true };

const finiteRange = <T extends number>(value: number, field: string, min: number, max: number): ValidationResult<T> => {
  const issue = (code: ValidationIssue['code'], message: string): ValidationResult<T> => invalid({ code, field, message, received: value });
  if (!Number.isFinite(value)) return issue('not-a-number', `${field} must be a finite number.`);
  if (value < min || value > max) return issue('out-of-range', `${field} must be between ${min} and ${max}.`);
  return valid(value as T);
};

export const createTireDiameterInches = (value: number, field = 'tireDiameter') => finiteRange<TireDiameterInches>(value, field, 15, 60);
export const createGearRatio = (value: number, field = 'axleRatio') => finiteRange<GearRatio>(value, field, 1, 8);
export const createRoadSpeedMph = (value: number, field = 'roadSpeed') => finiteRange<RoadSpeedMph>(value, field, 1, 200);

