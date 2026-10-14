/**
 * Generation years for the most searched European / Turkish models, so model pages can answer
 * "Megane 4 bijon aralığı", "Corsa F Lochkreis" or "Passat B8 Lochkreis" directly.
 *
 * Only the generation NAMES and production YEARS are editorial (Atlas); every bolt pattern,
 * center bore and wheel size shown for a generation is read from the ANKUSI wheel records whose
 * model year falls inside that span. A generation with no record says so — nothing is filled in.
 * Spans may overlap by a year where production overlapped; such records count for both.
 */
import type { CarModel, WheelRow } from './cars';

export interface CarGeneration {
  /** Search form after the model name: "4" → "Renault Megane 4", "B8" → "Volkswagen Passat B8". */
  readonly label: string;
  /** Optional chassis code shown in brackets, e.g. "6R". */
  readonly code?: string;
  readonly from: number;
  /** Omitted while in production. */
  readonly to?: number;
  /** Version names matching this pattern are not part of the generation (e.g. a separate EV). */
  readonly exclude?: RegExp;
}

type GenerationTable = Readonly<Record<string, readonly CarGeneration[]>>;

const g = (label: string, from: number, to?: number, extra: Partial<CarGeneration> = {}): CarGeneration =>
  Object.freeze({ label, from, ...(to === undefined ? {} : { to }), ...extra });

export const CAR_GENERATIONS: GenerationTable = Object.freeze({
  'renault/megane': [g('1', 1995, 2002), g('2', 2002, 2008), g('3', 2008, 2016), g('4', 2016, 2023, { exclude: /E-Tech/i }), g('E-Tech', 2022, undefined, { exclude: /^(?!.*E-Tech)/i })],
  'renault/clio': [g('1', 1990, 1998), g('2', 1998, 2005), g('3', 2005, 2012), g('4', 2012, 2019), g('5', 2019)],
  'dacia/duster': [g('1', 2010, 2017), g('2', 2018, 2023), g('3', 2024)],
  'dacia/sandero': [g('1', 2008, 2012), g('2', 2012, 2020), g('3', 2020)],
  'dacia/logan': [g('1', 2004, 2012), g('2', 2012, 2020), g('3', 2020)],
  'opel/corsa': [g('C', 2000, 2006), g('D', 2006, 2014), g('E', 2014, 2019), g('F', 2019)],
  'opel/astra': [g('G', 1998, 2004), g('H', 2004, 2010), g('J', 2009, 2015), g('K', 2015, 2021), g('L', 2021)],
  'opel/insignia': [g('A', 2008, 2017), g('B', 2017, 2022)],
  'opel/mokka': [g('A', 2012, 2019), g('B', 2020)],
  'volkswagen/golf': [g('4', 1997, 2003), g('5', 2003, 2008), g('6', 2008, 2012), g('7', 2012, 2019), g('8', 2019)],
  'volkswagen/polo': [g('4', 2001, 2009, { code: '9N' }), g('5', 2009, 2017, { code: '6R' }), g('6', 2017, undefined, { code: 'AW' })],
  'volkswagen/passat': [g('B5', 1996, 2005), g('B6', 2005, 2010), g('B7', 2010, 2014), g('B8', 2014, 2023), g('B9', 2023)],
  'volkswagen/tiguan': [g('1', 2007, 2016), g('2', 2016, 2024), g('3', 2024)],
  'volkswagen/jetta': [g('5', 2005, 2010), g('6', 2010, 2018), g('7', 2018)],
  'ford/focus': [g('1', 1998, 2004), g('2', 2004, 2011), g('3', 2011, 2018), g('4', 2018, 2025)],
  'ford/fiesta': [g('Mk5', 2002, 2008), g('Mk6', 2008, 2017), g('Mk7', 2017, 2023)],
  'ford/mondeo': [g('Mk3', 2000, 2007), g('Mk4', 2007, 2014), g('Mk5', 2014, 2022)],
  'toyota/yaris': [g('1', 1999, 2005), g('2', 2005, 2011), g('3', 2011, 2020), g('4', 2020)],
  'toyota/rav4': [g('1', 1994, 2000), g('2', 2000, 2005), g('3', 2005, 2012), g('4', 2012, 2018), g('5', 2018)],
  'hyundai/i20': [g('1', 2008, 2014), g('2', 2014, 2020), g('3', 2020)],
  'hyundai/i30': [g('1', 2007, 2012), g('2', 2011, 2016), g('3', 2016)],
  'hyundai/tucson': [g('JM', 2004, 2010), g('TL', 2015, 2020), g('NX4', 2020)],
  'skoda/octavia': [g('1', 1996, 2004), g('2', 2004, 2013), g('3', 2012, 2020), g('4', 2019)],
  'skoda/fabia': [g('1', 1999, 2007), g('2', 2007, 2014), g('3', 2014, 2021), g('4', 2021)],
  'skoda/superb': [g('2', 2008, 2015), g('3', 2015, 2023), g('4', 2024)],
  'seat/leon': [g('1', 1999, 2005), g('2', 2005, 2012), g('3', 2012, 2020), g('4', 2020)],
  'seat/ibiza': [g('3', 2002, 2008), g('4', 2008, 2017), g('5', 2017)],
  'bmw/3-series': [g('E30', 1982, 1994), g('E36', 1990, 2000), g('E46', 1998, 2006), g('E90', 2005, 2012), g('F30', 2011, 2019), g('G20', 2018)],
  'mercedes-benz/c-class': [g('W202', 1993, 2000), g('W203', 2000, 2007), g('W204', 2007, 2014), g('W205', 2014, 2021), g('W206', 2021)],
  'audi/a3': [g('8L', 1996, 2003), g('8P', 2003, 2012), g('8V', 2012, 2020), g('8Y', 2020)],
  'audi/a4': [g('B5', 1994, 2001), g('B6', 2000, 2004), g('B7', 2004, 2008), g('B8', 2007, 2015), g('B9', 2015)],
  'honda/civic': [g('8', 2005, 2011), g('9', 2011, 2017), g('10', 2015, 2021), g('11', 2021)],
  'nissan/qashqai': [g('J10', 2006, 2013), g('J11', 2013, 2021), g('J12', 2021)],
  'kia/sportage': [g('3', 2010, 2015), g('4', 2015, 2021), g('5', 2021)],
  'kia/ceed': [g('1', 2006, 2012), g('2', 2012, 2018), g('3', 2018)],
});

export const generationName = (model: CarModel, generation: CarGeneration): string =>
  `${model.make} ${model.model} ${generation.label}${generation.code ? ` (${generation.code})` : ''}`;

export const generationYears = (generation: CarGeneration, present: string): string =>
  `${generation.from}–${generation.to ?? present}`;

const rowYears = (row: WheelRow): [number, number] | undefined => {
  const from = row[1] ?? row[2];
  const to = row[2] ?? row[1];
  return from && to ? [from, to] : undefined;
};

/** Leading rim diameter of a wheel text such as "17x7J ET43" or "F 18x7J ET42 / R 18x8.5J". */
const rimDiameter = (text: string | null): number | undefined => {
  const match = /(\d{2})(?:\.\d)?\s*x\s*\d/.exec(text ?? '');
  return match ? Number(match[1]) : undefined;
};

const mostFrequent = <T,>(values: readonly T[]): T | undefined => {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

export interface OtherPattern { readonly pcd: string; readonly versions: readonly string[]; }

export interface GenerationSummary {
  readonly generation: CarGeneration;
  readonly records: number;
  readonly pcd?: string;
  readonly bore?: number;
  readonly wheelMin?: number;
  readonly wheelMax?: number;
  /** Bolt patterns recorded for some versions of this generation besides the main one. */
  readonly others: readonly OtherPattern[];
}

export function generationsFor(model: CarModel): readonly CarGeneration[] {
  return CAR_GENERATIONS[`${model.makeSlug}/${model.modelSlug}`] ?? [];
}

export function generationSummaries(model: CarModel, now = new Date().getFullYear()): readonly GenerationSummary[] {
  return generationsFor(model).map((generation) => {
    const end = generation.to ?? now + 2;
    const rows = model.wheels.filter((row) => {
      const years = rowYears(row);
      if (!years || years[1] < generation.from || years[0] > end) return false;
      return !(generation.exclude && generation.exclude.test(row[0]));
    });
    const pcd = mostFrequent(rows.map((row) => row[4]).filter((value): value is string => Boolean(value)));
    const bore = mostFrequent(rows.filter((row) => row[4] === pcd).map((row) => row[5]).filter((value): value is number => typeof value === 'number'));
    const diameters = rows.map((row) => rimDiameter(row[8])).filter((value): value is number => value !== undefined && value >= 12 && value <= 24);
    const others = [...new Set(rows.map((row) => row[4]).filter((value): value is string => Boolean(value) && value !== pcd))]
      .map((other) => Object.freeze({ pcd: other, versions: Object.freeze([...new Set(rows.filter((row) => row[4] === other).map((row) => row[0]))].slice(0, 2)) }));
    return Object.freeze({
      generation,
      records: rows.length,
      ...(pcd ? { pcd } : {}),
      ...(bore !== undefined ? { bore } : {}),
      ...(diameters.length ? { wheelMin: Math.min(...diameters), wheelMax: Math.max(...diameters) } : {}),
      others: Object.freeze(others),
    });
  }).reverse();
}

export interface PatternPeriod {
  readonly pcd: string;
  readonly bore?: number;
  readonly from: number;
  readonly to: number;
  readonly versions: readonly string[];
  readonly records: number;
}

/** Every bolt pattern + center bore combination recorded for a model, newest first, with years. */
export function patternTimeline(model: CarModel): readonly PatternPeriod[] {
  const groups = new Map<string, { pcd: string; bore?: number; from: number; to: number; versions: Set<string>; records: number }>();
  for (const row of model.wheels) {
    const years = rowYears(row);
    if (!row[4] || !years) continue;
    const key = `${row[4]}|${row[5] ?? ''}`;
    const group = groups.get(key) ?? { pcd: row[4], ...(typeof row[5] === 'number' ? { bore: row[5] } : {}), from: years[0], to: years[1], versions: new Set<string>(), records: 0 };
    group.from = Math.min(group.from, years[0]);
    group.to = Math.max(group.to, years[1]);
    group.versions.add(row[0]);
    group.records += 1;
    groups.set(key, group);
  }
  return Object.freeze([...groups.values()]
    .sort((a, b) => b.to - a.to || b.records - a.records)
    .map((group) => Object.freeze({ pcd: group.pcd, ...(group.bore !== undefined ? { bore: group.bore } : {}), from: group.from, to: group.to, versions: Object.freeze([...group.versions].slice(0, 3)), records: group.records })));
}
