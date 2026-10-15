/**
 * Generation years for the most searched European / Turkish models, so model pages can answer
 * "Megane 4 bijon aralığı", "Corsa F Lochkreis" or "Passat B8 Lochkreis" directly.
 *
 * Generation names and production years are sourced per model (SOURCES below: English and German
 * Wikipedia generation articles, checked 2026-10-15; a row is kept only when both agree on the start
 * year within one year, and the European production span is used). Every bolt pattern,
 * center bore and wheel size shown for a generation is read from the ANKUSI wheel records whose
 * model year falls inside that span. A generation with no record says so — nothing is filled in.
 * Spans may overlap by a year where production overlapped; such records count for both.
 */
import type { CarModel, WheelRow } from './cars';

const W = (lang: 'en' | 'de', title: string): string => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

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
  'renault/megane': [g('1', 1995, 2002), g('2', 2002, 2008), g('3', 2008, 2016), g('4', 2016, 2024, { exclude: /E-Tech/i })],
  'renault/clio': [g('1', 1990, 1998), g('2', 1998, 2005), g('3', 2005, 2012), g('4', 2012, 2019), g('5', 2019, 2025)],
  'dacia/duster': [g('1', 2010, 2017), g('2', 2018, 2024), g('3', 2024)],
  'dacia/sandero': [g('1', 2008, 2012), g('2', 2012, 2020), g('3', 2020)],
  'dacia/logan': [g('1', 2004, 2012), g('2', 2012, 2020), g('3', 2020)],
  'opel/corsa': [g('C', 2000, 2006), g('D', 2006, 2014), g('E', 2014, 2019), g('F', 2019)],
  'opel/astra': [g('G', 1998, 2004), g('H', 2004, 2009), g('J', 2009, 2015), g('K', 2015, 2021), g('L', 2021)],
  'opel/insignia': [g('A', 2008, 2017), g('B', 2017, 2022)],
  'opel/mokka': [g('A', 2012, 2019), g('B', 2020)],
  'volkswagen/golf': [g('4', 1997, 2003), g('5', 2003, 2008), g('6', 2008, 2012), g('7', 2012, 2020), g('8', 2019)],
  'volkswagen/polo': [g('4', 2001, 2009, { code: '9N' }), g('5', 2009, 2017, { code: '6R' }), g('6', 2017, undefined, { code: 'AW' })],
  'volkswagen/passat': [g('B5', 1996, 2005), g('B6', 2005, 2010), g('B7', 2010, 2014), g('B8', 2014, 2023), g('B9', 2023)],
  'volkswagen/tiguan': [g('1', 2007, 2016), g('2', 2016, 2024), g('3', 2024)],
  'volkswagen/jetta': [g('5', 2005, 2010), g('6', 2010, 2018), g('7', 2018)],
  'ford/focus': [g('1', 1998, 2004), g('2', 2004, 2010), g('3', 2010, 2018), g('4', 2018, 2025)],
  'ford/fiesta': [g('Mk5', 2002, 2008), g('Mk6', 2008, 2017), g('Mk7', 2017, 2023)],
  'ford/mondeo': [g('Mk3', 2000, 2007), g('Mk4', 2007, 2014), g('Mk5', 2014, 2022)],
  'toyota/yaris': [g('1', 1999, 2005), g('2', 2005, 2011), g('3', 2011, 2020), g('4', 2020, undefined, { exclude: /Cross/i })],
  'toyota/rav4': [g('1', 1994, 2000), g('2', 2000, 2005), g('3', 2005, 2012), g('4', 2012, 2018), g('5', 2018, 2025)],
  'hyundai/i20': [g('1', 2008, 2014), g('2', 2014, 2020), g('3', 2020)],
  'hyundai/i30': [g('1', 2007, 2011), g('2', 2011, 2016), g('3', 2016)],
  'hyundai/tucson': [g('JM', 2004, 2009), g('LM', 2009, 2015), g('TL', 2015, 2020), g('NX4', 2020)],
  'skoda/octavia': [g('1', 1996, 2004), g('2', 2004, 2012), g('3', 2012, 2019), g('4', 2019)],
  'skoda/fabia': [g('1', 1999, 2007), g('2', 2007, 2014), g('3', 2014, 2021), g('4', 2021)],
  'skoda/superb': [g('2', 2008, 2015), g('3', 2015, 2023), g('4', 2023)],
  'seat/leon': [g('1', 1999, 2005), g('2', 2005, 2012), g('3', 2012, 2020), g('4', 2020)],
  'seat/ibiza': [g('3', 2002, 2008), g('4', 2008, 2017), g('5', 2017)],
  'bmw/3-series': [g('E30', 1982, 1994), g('E36', 1990, 2000), g('E46', 1998, 2006), g('E90', 2005, 2013), g('F30', 2011, 2019), g('G20', 2018)],
  'mercedes-benz/c-class': [g('W202', 1993, 2000), g('W203', 2000, 2007), g('W204', 2007, 2014), g('W205', 2014, 2021), g('W206', 2021)],
  'audi/a3': [g('8L', 1996, 2003), g('8P', 2003, 2012), g('8V', 2012, 2020), g('8Y', 2020)],
  'audi/a4': [g('B5', 1994, 2001), g('B6', 2000, 2004), g('B7', 2004, 2008), g('B8', 2007, 2015), g('B9', 2015, 2024)],
  'honda/civic': [g('8', 2005, 2011), g('9', 2011, 2017), g('10', 2015, 2021), g('11', 2021)],
  'nissan/qashqai': [g('J10', 2006, 2013), g('J11', 2013, 2021), g('J12', 2021)],
  'kia/sportage': [g('3', 2010, 2015, { code: 'SL' }), g('4', 2015, 2021, { code: 'QL' }), g('5', 2021, undefined, { code: 'NQ5' })],
  'kia/ceed': [g('1', 2006, 2012, { code: 'ED' }), g('2', 2012, 2018, { code: 'JD' }), g('3', 2018, 2025, { code: 'CD' })],
});

/** Where each model's generation names and years come from (EN + DE Wikipedia, read 2026-10-15). */
export const GENERATION_SOURCES: Readonly<Record<string, readonly string[]>> = Object.freeze({
  'renault/megane': [W('en', 'Renault Mégane'), W('de', 'Renault Mégane IV')],
  'renault/clio': [W('en', 'Renault Clio'), W('de', 'Renault Clio V')],
  'dacia/duster': [W('en', 'Dacia Duster'), W('de', 'Dacia Duster')],
  'dacia/sandero': [W('en', 'Dacia Sandero'), W('de', 'Dacia Sandero')],
  'dacia/logan': [W('en', 'Dacia Logan'), W('de', 'Dacia Logan')],
  'opel/corsa': [W('en', 'Opel Corsa'), W('de', 'Opel Corsa F')],
  'opel/astra': [W('en', 'Opel Astra'), W('de', 'Opel Astra L')],
  'opel/insignia': [W('en', 'Opel Insignia'), W('de', 'Opel Insignia B')],
  'opel/mokka': [W('en', 'Opel Mokka'), W('de', 'Opel Mokka B')],
  'volkswagen/golf': [W('en', 'Volkswagen Golf Mk8'), W('de', 'VW Golf VIII')],
  'volkswagen/polo': [W('en', 'Volkswagen Polo'), W('de', 'VW Polo VI')],
  'volkswagen/passat': [W('en', 'Volkswagen Passat (B8)'), W('de', 'VW Passat B8')],
  'volkswagen/tiguan': [W('en', 'Volkswagen Tiguan'), W('de', 'VW Tiguan II')],
  'volkswagen/jetta': [W('en', 'Volkswagen Jetta (A6)'), W('de', 'VW Jetta VI')],
  'ford/focus': [W('en', 'Ford Focus (third generation)'), W('de', 'Ford Focus')],
  'ford/fiesta': [W('en', 'Ford Fiesta'), W('de', 'Ford Fiesta ’09')],
  'ford/mondeo': [W('en', 'Ford Mondeo (third generation)'), W('de', 'Ford Mondeo')],
  'toyota/yaris': [W('en', 'Toyota Yaris'), W('de', 'Toyota Yaris (XP13)')],
  'toyota/rav4': [W('en', 'Toyota RAV4'), W('de', 'Toyota RAV4')],
  'hyundai/i20': [W('en', 'Hyundai i20'), W('de', 'Hyundai i20')],
  'hyundai/i30': [W('en', 'Hyundai i30'), W('de', 'Hyundai i30 (GD)')],
  'hyundai/tucson': [W('en', 'Hyundai Tucson'), W('de', 'Hyundai Tucson')],
  'skoda/octavia': [W('en', 'Škoda Octavia'), W('de', 'Škoda Octavia III')],
  'skoda/fabia': [W('en', 'Škoda Fabia'), W('de', 'Škoda Fabia III')],
  'skoda/superb': [W('en', 'Škoda Superb'), W('de', 'Škoda Superb III')],
  'seat/leon': [W('en', 'SEAT León'), W('de', 'Seat Leon III')],
  'seat/ibiza': [W('en', 'SEAT Ibiza'), W('de', 'Seat Ibiza IV')],
  'bmw/3-series': [W('en', 'BMW 3 Series (F30)'), W('de', 'BMW F30')],
  'mercedes-benz/c-class': [W('en', 'Mercedes-Benz C-Class'), W('de', 'Mercedes-Benz Baureihe 205')],
  'audi/a3': [W('en', 'Audi A3'), W('de', 'Audi A3 8V')],
  'audi/a4': [W('en', 'Audi A4'), W('de', 'Audi A4 B8')],
  'honda/civic': [W('en', 'Honda Civic (tenth generation)'), W('de', 'Honda Civic 10. Generation')],
  'nissan/qashqai': [W('en', 'Nissan Qashqai'), W('de', 'Nissan Qashqai')],
  'kia/sportage': [W('en', 'Kia Sportage'), W('de', 'Kia Sportage')],
  'kia/ceed': [W('en', 'Kia Ceed'), W('de', 'Kia Ceed')],
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
  /**
   * True when at least two records exist and every regular (non-performance) version shares
   * the main pattern — only then may titles and short answers name the pattern for the
   * generation. Otherwise the page lists every recorded pattern with its versions.
   */
  readonly clear: boolean;
}

export function generationsFor(model: CarModel): readonly CarGeneration[] {
  return CAR_GENERATIONS[`${model.makeSlug}/${model.modelSlug}`] ?? [];
}

/**
 * Each wheel record belongs to exactly one generation: the newest one that had started by the
 * record's first year. A record is never counted twice, so overlap years cannot double-count;
 * any other pattern in a generation is listed with the version names that carry it.
 */
function assignRows(generations: readonly CarGeneration[], rows: readonly WheelRow[], now: number): Map<WheelRow, CarGeneration> {
  const assigned = new Map<WheelRow, CarGeneration>();
  for (const row of rows) {
    const years = rowYears(row);
    if (!years) continue;
    const start = years[0];
    const generation = generations
      .filter((candidate) => candidate.from <= start && start <= (candidate.to ?? now + 2) && !(candidate.exclude && candidate.exclude.test(row[0])))
      .sort((x, y) => y.from - x.from)[0];
    if (generation) assigned.set(row, generation);
  }
  return assigned;
}

/** Real bolt-pattern notation only ("5x114.3"); free-text notes in the source are ignored. */
const isPcd = (value: string | null): value is string => typeof value === 'string' && /^\d+x\d+(?:\.\d+)?$/.test(value);
/** Performance trims often use a different hub; the headline pattern follows the regular cars. */
const PERFORMANCE = /\b(Type R|RS ?\d*|R26|OPC|GSi|ST\d*|Trophy|N[uü]rburgring|N|GTI|AMG|M\d|S\d|Cupra R)\b/i;

export function generationSummaries(model: CarModel, now = new Date().getFullYear()): readonly GenerationSummary[] {
  const generations = generationsFor(model);
  const assigned = assignRows(generations, model.wheels, now);
  return generations.map((generation) => {
    const rows = model.wheels.filter((row) => assigned.get(row) === generation);
    const regular = rows.filter((row) => isPcd(row[4]) && !PERFORMANCE.test(row[0]));
    const pcd = mostFrequent((regular.length ? regular : rows).map((row) => row[4]).filter(isPcd));
    const bore = mostFrequent(rows.filter((row) => row[4] === pcd).map((row) => row[5]).filter((value): value is number => typeof value === 'number'));
    const diameters = rows.map((row) => rimDiameter(row[8])).filter((value): value is number => value !== undefined && value >= 12 && value <= 24);
    const others = [...new Set(rows.map((row) => row[4]).filter((value): value is string => isPcd(value) && value !== pcd))]
      .map((other) => Object.freeze({ pcd: other, versions: Object.freeze([...new Set(rows.filter((row) => row[4] === other).map((row) => row[0]))].slice(0, 2)) }));
    return Object.freeze({
      generation,
      records: rows.length,
      ...(pcd ? { pcd } : {}),
      ...(bore !== undefined ? { bore } : {}),
      ...(diameters.length ? { wheelMin: Math.min(...diameters), wheelMax: Math.max(...diameters) } : {}),
      others: Object.freeze(others),
      clear: regular.length >= 2 && regular.every((row) => row[4] === pcd),
    });
  }).reverse();
}
