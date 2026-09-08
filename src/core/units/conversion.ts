export const MILLIMETERS_PER_INCH = 25.4;
export const MILLIMETERS_PER_KILOMETER = 1_000_000;
export const MILLIMETERS_PER_MILE = 1_609_344;

export const inchesToMillimeters = (inches: number): number => inches * MILLIMETERS_PER_INCH;
export const millimetersToInches = (millimeters: number): number => millimeters / MILLIMETERS_PER_INCH;
export const kilometersToMiles = (kilometers: number): number => kilometers / 1.609344;
export const milesToKilometers = (miles: number): number => miles * 1.609344;
