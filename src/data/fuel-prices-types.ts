// Shared types for src/data/fuel-prices.json and src/data/fuel-price-history.json.
//
// Astro/TS narrow a JSON import to the literal shape of whatever is currently on disk (e.g.
// the committed seed's `products: []` would otherwise be inferred as `never[]`). Every
// consumer imports the raw JSON and casts it through these types instead, so edits to the
// seed file never change what TypeScript thinks the shape is at other call sites.
//
// Keep this in sync with scripts/update-fuel-prices.mjs, which is the single writer of both
// files.

export type FuelStatus = 'pending' | 'fresh' | 'stale';

/** A single product's average for Germany or Spain (both denominated in EUR per litre).
 *  Spain's is a genuine national average from the official Ministerio dataset; Germany's is
 *  an Atlas monitored sample of selected city stations and is never labelled national. */
export interface FuelProduct {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  /** Number of stations nationally that contributed a non-null reading to this average. */
  readonly sampleSize: number;
}

/** A single US product, denominated both per US gallon (EIA's native unit) and per litre
 *  (converted, to match the rest of the site's calculators). */
export interface UsFuelProduct {
  readonly id: string;
  readonly label: string;
  readonly valuePerLitre: number;
  readonly valuePerGallon: number;
}

interface FuelCountryBase {
  readonly status: FuelStatus;
  readonly source: string;
  readonly sourceUrl: string;
  /** When the most recent refresh attempt happened, success or not — null for a market
   *  that has never been attempted (e.g. Germany, which is manual-run-only). */
  readonly lastAttemptAt: string | null;
  /** When a fetch last actually succeeded for this country, or null if it never has. */
  readonly lastSuccessAt: string | null;
  readonly note?: string;
}

export interface EsDeFuelCountry extends FuelCountryBase {
  readonly products: readonly FuelProduct[];
}

export interface UsFuelCountry extends FuelCountryBase {
  readonly products: readonly UsFuelProduct[];
  readonly weekOf: string | null;
}

export interface FuelPricesData {
  readonly generatedAt: string;
  readonly disclaimer: string;
  readonly es: EsDeFuelCountry;
  readonly de: EsDeFuelCountry;
  readonly us: UsFuelCountry;
}

export interface FuelHistoryPoint {
  readonly date: string;
  readonly products: Readonly<Record<string, number>>;
}

export interface UsFuelHistoryPoint {
  readonly weekOf: string;
  readonly products: Readonly<Record<string, { readonly perLitre: number; readonly perGallon: number }>>;
}

export interface FuelPriceHistoryData {
  readonly es: readonly FuelHistoryPoint[];
  readonly de: readonly FuelHistoryPoint[];
  readonly us: readonly UsFuelHistoryPoint[];
}

/** Cast helper: `asFuelPrices(rawJsonImport)`. Keeps the `as unknown as X` boilerplate in
 *  one place. */
export function asFuelPrices(raw: unknown): FuelPricesData {
  return raw as FuelPricesData;
}
export function asFuelPriceHistory(raw: unknown): FuelPriceHistoryData {
  return raw as FuelPriceHistoryData;
}
