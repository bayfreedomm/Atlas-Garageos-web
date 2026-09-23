#!/usr/bin/env node
/**
 * Fetches fuel prices for Spain, the United States and (manually only) Germany from free,
 * official public sources and writes them to src/data/fuel-prices.json.
 *
 * This script is meant to run from CI (see .github/workflows/update-fuel-prices.yml),
 * NOT from a visitor's browser. Running it a few times a day from a scheduled job keeps it
 * well inside each source's fair-use limits regardless of how many people visit the site,
 * and keeps the site itself fully static with zero third-party requests from the browser.
 *
 * ---------------------------------------------------------------------------------------
 * PROVIDER SELECTION — which countries a given run touches
 * ---------------------------------------------------------------------------------------
 * Run with `--providers=es,us` (or the FUEL_PROVIDERS env var). Default: `es,us`.
 *
 * Germany is deliberately NOT part of any recurring schedule. Tankerkönig is a
 * community-funded per-station service, not a bulk national feed to be polled on a timer,
 * and this site has no backend that could fetch it on demand (output: 'static', no adapter,
 * no API routes). Until a data source suited to automatic national reporting is chosen,
 * Germany is only ever refreshed by a deliberate manual run
 * (.github/workflows/update-fuel-prices-germany.yml, workflow_dispatch only), and otherwise
 * stays honestly `pending` (never verified) or `stale` (verified once, not refreshed since).
 *
 * A country that is NOT selected for a run is carried forward byte-for-byte from the
 * previous snapshot: its status, lastAttemptAt, lastSuccessAt and products are untouched,
 * and — crucially — it can never write a history point for that run, because no fetch for
 * it happened (see updateHistory's `ran` argument).
 *
 * ---------------------------------------------------------------------------------------
 * THREE EXPLICIT STATES — pending / fresh / stale
 * ---------------------------------------------------------------------------------------
 * Each country snapshot carries an explicit `status`:
 *   - "pending": this country has NEVER had a successful fetch. There is no real
 *     last-known value, so every numeric price field for it is `null`. Nothing downstream
 *     may treat a pending country's numbers as real, because there are no numbers.
 *   - "fresh": the most recent refresh attempt for this country succeeded. The values are
 *     from that attempt.
 *   - "stale": this country has a real last-known-good value from an earlier success, but
 *     the most recent refresh attempt failed. The values shown are the last genuinely
 *     fetched ones (never seed/placeholder numbers), tagged with the real `lastSuccessAt`.
 *
 * `lastAttemptAt` is when the most recent refresh attempt happened (success or not).
 * `lastSuccessAt` is when a fetch last actually succeeded for that country, or `null` if
 * it never has. These are deliberately separate from each other and from `status`, so a
 * "was verified once, now failing" country is never confused with a "never verified" one.
 *
 * Sources:
 * - Spain: Ministerio para la Transición Ecológica, official open REST service (no key).
 *   https://datos.gob.es/en/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas
 *   Station objects expose several official price fields beyond "Precio Gasolina 95 E5" and
 *   "Precio Gasoleo A" — this script also reads "Precio Gasolina 98 E5" and
 *   "Precio Gasoleo Premium" (both are part of the documented schema). LPG ("Precio Gases
 *   licuados del petróleo") is intentionally NOT included: this session's sandbox could not
 *   reach the live API to measure real national station coverage for it, and shipping an
 *   average built from an unknown (possibly tiny) sample would be its own kind of dishonesty.
 *   See MIN_SAMPLE_SIZE below for how thin-coverage products are suppressed automatically
 *   once real data does flow.
 * - Germany: Tankerkoenig API (CC BY 4.0, free registration required for an API key).
 *   https://creativecommons.tankerkoenig.de/
 *   Requires the TANKERKOENIG_API_KEY environment variable (a GitHub Actions secret in CI —
 *   read only here, via process.env, inside a Node script that only ever runs in CI; it is
 *   never embedded in the built site, never logged, and never reachable from a browser).
 *   The radius endpoint (list.php) is documented as limited to 1 request per minute — see
 *   the spacing note on DE_REQUEST_SPACING_MS below. Manual runs only (see PROVIDER
 *   SELECTION above). What it produces is a MONITORED SAMPLE of a few large cities, never a
 *   German national average, and every label in this file and on the site says so.
 * - United States: EIA (U.S. Energy Information Administration) Open Data v2, official,
 *   free instant self-serve API key (no manual approval wait, unlike Tankerkoenig).
 *   https://www.eia.gov/opendata/
 *   Prefers EIA_API_KEY for four grades. Without a working key, the official public
 *   weekly table supplies regular gasoline and diesel only, with explicit provenance.
 *   NOTE: EIA's retail gasoline/diesel series are published WEEKLY, not daily — the US
 *   number on the site is honestly labelled "weekly average", not "daily" like DE/ES.
 *
 * This script also updates src/data/fuel-price-history.json, a per-country log (capped to
 * the most recent 90 real data points per country) so the public price pages can show a
 * trend, not just today's number. Crucially: a history point for a country is only ever
 * written when THIS RUN's fetch for that country was a genuine fresh success — a stale
 * fallback value, or a country that is still pending, can never create or overwrite a
 * history row. The US, being weekly, is keyed by the real EIA `weekOf` period rather than
 * by calendar date, and a new US history point is only added when this run's fresh EIA
 * fetch reports a `weekOf` not already present in history (never one row per day).
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'fuel-prices.json');
const HISTORY_PATH = path.join(__dirname, '..', 'src', 'data', 'fuel-price-history.json');
const HISTORY_MAX_POINTS = 90;

const FETCH_TIMEOUT_MS = 15_000;
// The official nationwide Spain response contains more than 11,000 stations and takes
// longer than the small EIA response. A 15-second deadline produced false pending states.
const ES_FETCH_TIMEOUT_MS = 75_000;
const US_GALLON_TO_LITRE = 3.785411784;

const DISCLAIMER = 'Prices are averages from public or official sources — a national dataset where the source says so, an Atlas monitored sample of selected stations otherwise. They are a reference figure, never a live quote for a specific station.';

/** Every provider this script knows how to fetch, and the identity fields a country keeps
 *  even when it has no verified data yet. */
export const PROVIDERS = Object.freeze({
  es: {
    source: 'Ministerio para la Transición Ecológica (official national dataset, no key)',
    sourceUrl: 'https://sedeaplicaciones.minetur.gob.es/ServiciosRestCarburantes/PreciosCarburantes/EstacionesTerrestres/',
  },
  de: {
    source: 'Tankerkönig — Atlas monitored sample of selected German city stations (not a national average)',
    sourceUrl: 'https://creativecommons.tankerkoenig.de/',
  },
  us: {
    source: 'U.S. Energy Information Administration (EIA), Weekly Retail Gasoline and Diesel Prices (official, weekly average)',
    sourceUrl: 'https://www.eia.gov/petroleum/gasdiesel/',
    weekOf: null,
  },
});
const PROVIDER_IDS = Object.freeze(Object.keys(PROVIDERS));
/** Germany is intentionally absent: it is manual-run-only (see the header comment). */
const DEFAULT_PROVIDERS = Object.freeze(['es', 'us']);

/** Reads `--providers=es,us` (or FUEL_PROVIDERS), defaulting to the scheduled pair. */
export function selectedProviders(argv = process.argv.slice(2)) {
  const flag = argv.find((arg) => arg.startsWith('--providers='));
  const raw = flag ? flag.slice('--providers='.length) : (process.env.FUEL_PROVIDERS ?? '');
  const requested = raw.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
  const chosen = requested.length > 0 ? requested : [...DEFAULT_PROVIDERS];
  const unknown = chosen.filter((id) => !PROVIDER_IDS.includes(id));
  if (unknown.length > 0) throw new Error(`Unknown provider(s): ${unknown.join(', ')}. Valid: ${PROVIDER_IDS.join(', ')}`);
  return new Set(chosen);
}

/**
 * Minimum number of stations reporting a non-null value, nationally, before we consider a
 * product's average meaningful enough to show. Below this, the row is suppressed from the
 * output entirely (value/sampleSize still recorded internally isn't necessary — we simply
 * don't include the product) rather than shown next to a two-station "average" that would
 * look precise but isn't representative. Chosen conservatively: Spain and Germany both have
 * many thousands of stations nationwide, so a product genuinely sold at meaningful volume
 * should clear this floor easily; a product that doesn't is either niche or badly reported.
 */
const MIN_SAMPLE_SIZE = 50;

function average(numbers) {
  const valid = numbers.filter((n) => typeof n === 'number' && Number.isFinite(n) && n > 0);
  if (valid.length === 0) return { value: null, sampleSize: 0 };
  const sum = valid.reduce((a, b) => a + b, 0);
  return { value: Math.round((sum / valid.length) * 1000) / 1000, sampleSize: valid.length };
}

async function fetchWithTimeout(url, init = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Builds the `products` array for a country from a map of id -> { label, value, sampleSize }.
 * Products whose sample size is below MIN_SAMPLE_SIZE are dropped (thin coverage is treated
 * as "we don't have this", not shown as a suspiciously precise number).
 */
function buildProducts(entries) {
  return entries
    .filter(({ value, sampleSize }) => value !== null && sampleSize >= MIN_SAMPLE_SIZE)
    .map(({ id, label, value, sampleSize }) => ({ id, label, value, sampleSize }));
}

/**
 * Spain: official Ministerio REST endpoint. No API key. Returns all stations nationwide
 * with prices as comma-decimal strings (Spanish number format), e.g. "1,559". We average
 * four documented price fields across every station that reports a non-empty value for
 * each: 95 E5, 98 E5, Gasóleo A, and Gasóleo Premium.
 */
async function fetchSpainAverage() {
  const { source, sourceUrl } = PROVIDERS.es;
  const lastAttemptAt = new Date().toISOString();
  try {
    const res = await fetchWithTimeout(sourceUrl, { headers: { Accept: 'application/json' } }, ES_FETCH_TIMEOUT_MS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const stations = body?.ListaEESSPrecio;
    if (!Array.isArray(stations) || stations.length === 0) throw new Error('Unexpected response shape: no ListaEESSPrecio array');

    const parseEsNumber = (raw) => {
      if (typeof raw !== 'string' || raw.trim() === '') return null;
      const n = Number.parseFloat(raw.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };

    const e5 = average(stations.map((s) => parseEsNumber(s['Precio Gasolina 95 E5'])));
    const e5_98 = average(stations.map((s) => parseEsNumber(s['Precio Gasolina 98 E5'])));
    const diesel = average(stations.map((s) => parseEsNumber(s['Precio Gasoleo A'])));
    const dieselPremium = average(stations.map((s) => parseEsNumber(s['Precio Gasoleo Premium'])));

    const products = buildProducts([
      { id: 'e5', label: 'Gasolina 95 E5', ...e5 },
      { id: 'e5_98', label: 'Gasolina 98 E5', ...e5_98 },
      { id: 'diesel', label: 'Gasóleo A', ...diesel },
      { id: 'dieselPremium', label: 'Gasóleo Premium', ...dieselPremium },
    ]);
    if (products.length === 0) throw new Error('Could not parse enough station prices for any product');

    return { ok: true, products, source, sourceUrl, lastAttemptAt };
  } catch (err) {
    return { ok: false, products: [], source, sourceUrl, lastAttemptAt, note: String(err?.message ?? err) };
  }
}

/**
 * Germany: Tankerkoenig gives per-station prices, not a national statistic. We sample a
 * handful of large cities and average the open stations found within each. The result is an
 * Atlas MONITORED SAMPLE of those cities and nothing more — it is never described anywhere
 * (here, in the JSON, or on the site) as a German national average, because it isn't one.
 * This function only ever runs on a deliberate manual run, never on a recurring schedule.
 */
const DE_SAMPLE_CITIES = [
  { name: 'Berlin', lat: 52.520008, lng: 13.404954 },
  { name: 'Hamburg', lat: 53.551086, lng: 9.993682 },
  { name: 'Munich', lat: 48.137154, lng: 11.576124 },
  { name: 'Cologne', lat: 50.937531, lng: 6.960279 },
  { name: 'Frankfurt', lat: 50.110924, lng: 8.682127 },
];
const DE_SAMPLE_RADIUS_KM = 15;
// Tankerkoenig's documentation for the radius/list endpoint (list.php) states a hard limit
// of 1 request per minute per API key. We only run a handful of times a day from CI, never
// from a visitor's browser, but within a single run we still must not issue the 5 city
// requests faster than that — so every request after the first waits a full 60 seconds.
const DE_REQUEST_SPACING_MS = 60_000;

async function fetchGermanyAverage() {
  const { source, sourceUrl } = PROVIDERS.de;
  const lastAttemptAt = new Date().toISOString();
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  if (!apiKey) {
    return { ok: false, products: [], source, sourceUrl, lastAttemptAt, note: 'TANKERKOENIG_API_KEY is not set' };
  }

  const e5Values = [];
  const e10Values = [];
  const dieselValues = [];
  const errors = [];
  let stationReadings = 0;

  for (let i = 0; i < DE_SAMPLE_CITIES.length; i++) {
    const city = DE_SAMPLE_CITIES[i];
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, DE_REQUEST_SPACING_MS));
    try {
      const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${city.lat}&lng=${city.lng}&rad=${DE_SAMPLE_RADIUS_KM}&sort=dist&type=all&apikey=${apiKey}`;
      const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body?.ok !== true || !Array.isArray(body?.stations)) throw new Error(`Unexpected response for ${city.name}: ${JSON.stringify(body).slice(0, 200)}`);
      for (const station of body.stations) {
        if (station?.isOpen === false) continue;
        if (typeof station.e5 === 'number') { e5Values.push(station.e5); stationReadings++; }
        if (typeof station.e10 === 'number') { e10Values.push(station.e10); stationReadings++; }
        if (typeof station.diesel === 'number') { dieselValues.push(station.diesel); stationReadings++; }
      }
    } catch (err) {
      errors.push(`${city.name}: ${String(err?.message ?? err)}`);
    }
  }

  const e5 = average(e5Values);
  const e10 = average(e10Values);
  const diesel = average(dieselValues);
  const products = buildProducts([
    { id: 'e5', label: 'Super E5', ...e5 },
    { id: 'e10', label: 'Super E10', ...e10 },
    { id: 'diesel', label: 'Diesel', ...diesel },
  ]);
  if (products.length === 0) {
    return { ok: false, products: [], source, sourceUrl, lastAttemptAt, note: errors.join('; ') || 'No stations returned prices' };
  }
  return {
    ok: true,
    products,
    source: `Tankerkönig — Atlas monitored sample: ${stationReadings} station readings across ${DE_SAMPLE_CITIES.map((c) => c.name).join(', ')} (not a national average)`,
    sourceUrl,
    lastAttemptAt,
    note: errors.length > 0 ? `Partial failures: ${errors.join('; ')}` : undefined,
  };
}

/**
 * United States: EIA Open Data v2 "seriesid" convenience endpoint, weekly national-average
 * retail prices in USD/gallon. We convert to USD/litre so the site's fuel calculators (which
 * take a per-litre price everywhere, matching the metric/imperial toggle) stay consistent.
 *
 * Series IDs below are all in the same official "All Formulations" retail-gasoline family as
 * the pre-existing Regular series (PET.EMM_EPM0_PTE_NUS_DPG.W); Midgrade and Premium use the
 * documented EPMM/EPMP product codes (confirmed against eia.gov's own published dnav URLs for
 * "Weekly U.S. Midgrade All Formulations Retail Gasoline Prices" and "Weekly U.S. Premium All
 * Formulations Retail Gasoline Prices"), and Diesel keeps the existing EPD2D series.
 */
const EIA_SERIES = {
  regular: { id: 'PET.EMM_EPM0_PTE_NUS_DPG.W', label: 'Regular' },
  midgrade: { id: 'PET.EMM_EPMM_PTE_NUS_DPG.W', label: 'Midgrade' },
  premium: { id: 'PET.EMM_EPMP_PTE_NUS_DPG.W', label: 'Premium' },
  diesel: { id: 'PET.EMD_EPD2D_PTE_NUS_DPG.W', label: 'Diesel' },
};

async function fetchEiaSeriesLatest(seriesId, apiKey) {
  const url = `https://api.eia.gov/v2/seriesid/${seriesId}?api_key=${apiKey}`;
  const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for series ${seriesId}`);
  const body = await res.json();
  const rows = body?.response?.data;
  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`Unexpected EIA response shape for ${seriesId}: ${JSON.stringify(body).slice(0, 200)}`);
  const latest = rows.reduce((best, row) => (!best || String(row.period) > String(best.period) ? row : best), null);
  const value = Number.parseFloat(latest?.value);
  if (!Number.isFinite(value)) throw new Error(`No numeric value in latest row for ${seriesId}`);
  return { value, period: latest.period };
}

/** The EIA's public weekly table is a keyless, official fallback. It exposes only
 * regular gasoline and on-highway diesel, so never manufacture midgrade/premium. */
export function parseEiaPublicWeeklyTable(html) {
  const tables = [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  const parseTable = (caption) => {
    const table = tables.find((item) => new RegExp(`<caption>\\s*${caption}`, 'i').test(item));
    if (!table) throw new Error(`EIA public table missing: ${caption}`);
    const heading = table.match(/<thead\b[^>]*>[\s\S]*?<\/thead>/i)?.[0] ?? '';
    const dates = [...heading.matchAll(/<th\b[^>]*>\s*(\d{2})\/(\d{2})\/(\d{2})\s*<\/th>/gi)];
    if (dates.length < 1) throw new Error(`EIA public table has no report date: ${caption}`);
    const row = table.match(/<tbody\b[^>]*>[\s\S]*?<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0] ?? '';
    if (!/U\.S\.<\/a>/i.test(row)) throw new Error(`EIA public table has no U.S. row: ${caption}`);
    const prices = [...row.matchAll(/<td\b[^>]*>\s*(\d+\.\d{3})\s*<\/td>/gi)].map((match) => Number(match[1]));
    if (prices.length < dates.length) throw new Error(`EIA public table has no matching prices: ${caption}`);
    const [, month, day, year] = dates.at(-1);
    const period = `20${year}-${month}-${day}`;
    const value = prices[dates.length - 1];
    if (!Number.isFinite(value) || value <= 0 || value > 20) throw new Error(`Invalid EIA public price: ${caption}`);
    return { period, value };
  };
  const regular = parseTable('U\\.S\\. Regular Gasoline Prices');
  const diesel = parseTable('U\\.S\\. On-Highway Diesel Fuel Prices');
  if (regular.period !== diesel.period) throw new Error('EIA public tables report different weeks');
  return { regular: regular.value, diesel: diesel.value, weekOf: regular.period };
}

async function fetchUsPublicWeekly(lastAttemptAt) {
  const { source, sourceUrl } = PROVIDERS.us;
  const response = await fetchWithTimeout(sourceUrl, { headers: { Accept: 'text/html' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for EIA public weekly page`);
  const { regular, diesel, weekOf } = parseEiaPublicWeeklyTable(await response.text());
  const products = [
    { id: 'regular', label: 'Regular', valuePerGallon: regular, valuePerLitre: Math.round(regular / US_GALLON_TO_LITRE * 1000) / 1000 },
    { id: 'diesel', label: 'Diesel', valuePerGallon: diesel, valuePerLitre: Math.round(diesel / US_GALLON_TO_LITRE * 1000) / 1000 },
  ];
  return { ok: true, products, weekOf, source: `${source} — public weekly table (regular and diesel)`, sourceUrl, lastAttemptAt };
}

async function fetchUsAverage() {
  const { source, sourceUrl } = PROVIDERS.us;
  const lastAttemptAt = new Date().toISOString();
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    try { return await fetchUsPublicWeekly(lastAttemptAt); }
    catch (err) { return { ok: false, products: [], weekOf: null, source, sourceUrl, lastAttemptAt, note: String(err?.message ?? err) }; }
  }
  try {
    const entries = Object.entries(EIA_SERIES);
    const results = await Promise.all(entries.map(([, series]) => fetchEiaSeriesLatest(series.id, apiKey)));
    const weekOf = results[0]?.period;
    const products = entries.map(([id, series], i) => {
      const perGallon = results[i].value;
      return {
        id,
        label: series.label,
        valuePerGallon: perGallon,
        valuePerLitre: Math.round((perGallon / US_GALLON_TO_LITRE) * 1000) / 1000,
      };
    });
    return { ok: true, products, weekOf, source, sourceUrl, lastAttemptAt };
  } catch (err) {
    try { return await fetchUsPublicWeekly(lastAttemptAt); }
    catch (fallbackError) { return { ok: false, products: [], weekOf: null, source, sourceUrl, lastAttemptAt, note: `EIA API: ${String(err?.message ?? err)}; public page: ${String(fallbackError?.message ?? fallbackError)}` }; }
  }
}

async function readPreviousOutput() {
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Turns a fresh fetch result plus the previous snapshot into the final country entry, with
 * an explicit status distinguishing "never verified" (pending) from "verified, refresh just
 * failed" (stale) from "verified, this refresh succeeded" (fresh). Unlike the old boolean
 * `ok` flag, this never conflates those three cases: a stale snapshot keeps the LAST
 * genuinely-fetched products and its real lastSuccessAt, never seed/placeholder numbers.
 */
export function mergeWithStatus(freshResult, previous) {
  const { ok, products, source, sourceUrl, lastAttemptAt, note, ...rest } = freshResult;
  if (ok) {
    return { status: 'fresh', products, source, sourceUrl, lastAttemptAt, lastSuccessAt: lastAttemptAt, note: undefined, ...rest };
  }
  const hadRealSuccess = previous && (previous.status === 'fresh' || previous.status === 'stale') && previous.lastSuccessAt;
  if (hadRealSuccess) {
    return {
      status: 'stale',
      products: previous.products,
      source: previous.source,
      sourceUrl,
      lastAttemptAt,
      lastSuccessAt: previous.lastSuccessAt,
      note: `Refresh failed (${note}); showing last known value from ${previous.lastSuccessAt}`,
      ...(previous.weekOf !== undefined ? { weekOf: previous.weekOf } : {}),
    };
  }
  return { status: 'pending', products: [], source, sourceUrl, lastAttemptAt, lastSuccessAt: null, note, ...rest };
}

/**
 * For a country this run did NOT fetch (e.g. Germany on the scheduled Spain+US run): keep
 * the previous snapshot exactly as it was. No attempt happened, so lastAttemptAt must not
 * move, the status must not change, and — because updateHistory is told which providers ran
 * — no history point can be written from a carried-forward value. If there is no previous
 * snapshot at all, the country is honestly `pending` with no numbers and no attempt time.
 */
export function carryForward(previous, providerId) {
  if (previous) return previous;
  const defaults = PROVIDERS[providerId];
  return {
    status: 'pending',
    products: [],
    source: defaults.source,
    sourceUrl: defaults.sourceUrl,
    lastAttemptAt: null,
    lastSuccessAt: null,
    note: 'No verified data yet — this market is not part of the recurring automatic refresh.',
    ...(defaults.weekOf !== undefined ? { weekOf: null } : {}),
  };
}

async function readHistory() {
  try {
    const raw = await readFile(HISTORY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.es) && Array.isArray(parsed.de) && Array.isArray(parsed.us)) return parsed;
    return { es: [], de: [], us: [] };
  } catch {
    return { es: [], de: [], us: [] };
  }
}

function productsToMap(products) {
  const map = {};
  for (const p of products) {
    map[p.id] = p.valuePerLitre !== undefined ? { perLitre: p.valuePerLitre, perGallon: p.valuePerGallon } : p.value;
  }
  return map;
}

/**
 * Updates the per-country history log. DE/ES are keyed by today's UTC calendar date; a row
 * is only written/updated when THAT country's fetch this run was a genuine fresh success —
 * a stale fallback or a still-pending country never touches history. US is keyed by the
 * real EIA `weekOf` period and only gets a new point when this run's fresh fetch reports a
 * weekOf not already present (so a week is never duplicated across daily runs).
 */
export function updateHistoryData(currentHistory, output, ran) {
  const history = {
    es: [...currentHistory.es],
    de: [...currentHistory.de],
    us: [...currentHistory.us],
  };
  const today = output.generatedAt.slice(0, 10); // YYYY-MM-DD (UTC)

  for (const key of ['es', 'de']) {
    const country = output[key];
    // Only a country actually fetched in THIS run may touch history. A carried-forward
    // 'fresh' snapshot from an earlier manual run is last-known data, not a new observation.
    if (!ran.has(key)) continue;
    if (country.status !== 'fresh') continue;
    const row = { date: today, products: productsToMap(country.products) };
    const idx = history[key].findIndex((entry) => entry.date === today);
    if (idx >= 0) history[key][idx] = row;
    else history[key].push(row);
    history[key].sort((a, b) => a.date.localeCompare(b.date));
    history[key] = history[key].slice(-HISTORY_MAX_POINTS);
  }

  if (ran.has('us') && output.us.status === 'fresh' && output.us.weekOf) {
    const exists = history.us.some((entry) => entry.weekOf === output.us.weekOf);
    if (!exists) {
      history.us.push({ weekOf: output.us.weekOf, products: productsToMap(output.us.products) });
      history.us.sort((a, b) => a.weekOf.localeCompare(b.weekOf));
      history.us = history.us.slice(-HISTORY_MAX_POINTS);
    }
  }

  return history;
}

async function updateHistory(output, ran) {
  const history = updateHistoryData(await readHistory(), output, ran);
  await writeFile(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
  console.log('Wrote', HISTORY_PATH, `(es:${history.es.length} de:${history.de.length} us:${history.us.length})`);
}

const FETCHERS = {
  es: fetchSpainAverage,
  de: fetchGermanyAverage,
  us: fetchUsAverage,
};

async function main() {
  const ran = selectedProviders();
  console.log(`Providers this run: ${[...ran].join(', ')} (unselected markets are carried forward untouched)`);
  const previous = await readPreviousOutput();

  // One shared code path for all providers: fetch the selected ones in parallel, normalize
  // every result through the same mergeWithStatus(), carry the rest forward verbatim.
  const fetched = Object.fromEntries(
    await Promise.all(PROVIDER_IDS.filter((id) => ran.has(id)).map(async (id) => [id, await FETCHERS[id]()])),
  );
  const resolve = (id) => (ran.has(id) ? mergeWithStatus(fetched[id], previous?.[id]) : carryForward(previous?.[id], id));

  const output = {
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    es: resolve('es'),
    de: resolve('de'),
    us: resolve('us'),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  await updateHistory(output, ran);

  console.log('Wrote', OUTPUT_PATH);
  console.log(JSON.stringify(output, null, 2));

  const failed = [...ran].filter((id) => output[id].status !== 'fresh');
  if (failed.length > 0) {
    console.error(`Selected provider(s) not fresh: ${failed.join(', ')}. Published data must not be mistaken for a full refresh.`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Fatal error in update-fuel-prices:', err);
    process.exitCode = 1;
  });
}
