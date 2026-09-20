#!/usr/bin/env node
/**
 * Fetches today's national-average fuel prices for Germany and Spain from
 * free, official public sources and writes them to src/data/fuel-prices.json.
 *
 * This script is meant to run on a schedule (see .github/workflows/update-fuel-prices.yml),
 * NOT from a visitor's browser. Running it once a day (or a few times a day) from a
 * scheduled job keeps it well inside each source's fair-use limits regardless of how
 * many people visit the site, and keeps the site itself fully static with zero
 * third-party requests from the browser.
 *
 * Design rule: never let a failed fetch erase good data. If a source fails or returns
 * something we don't recognise, we keep the previous value for that country and just
 * record that today's refresh for it failed, rather than writing a broken/empty price.
 *
 * Sources:
 * - Spain: Ministerio para la Transición Ecológica, official open REST service (no key).
 *   https://datos.gob.es/en/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas
 * - Germany: Tankerkoenig API (CC BY 4.0, free registration required for an API key).
 *   https://creativecommons.tankerkoenig.de/
 *   Requires the TANKERKOENIG_API_KEY environment variable (a GitHub Actions secret in CI).
 * - United States: EIA (U.S. Energy Information Administration) Open Data v2, official,
 *   free instant self-serve API key (no manual approval wait, unlike Tankerkoenig).
 *   https://www.eia.gov/opendata/
 *   Requires the EIA_API_KEY environment variable (a GitHub Actions secret in CI).
 *   NOTE: EIA's retail gasoline/diesel series are published WEEKLY, not daily — the US
 *   number on the site is honestly labelled "weekly average", not "daily" like DE/ES.
 *
 * This script also appends one row per day to src/data/fuel-price-history.json (capped to
 * the most recent 90 days) so the public price pages can show a trend, not just today's
 * number. Multiple runs on the same UTC day update that day's row in place instead of
 * appending duplicates.
 *
 * IMPORTANT — not yet verified against a live response in this session: the network this
 * script was authored in could not reach any of these government/API hosts to confirm the
 * exact current JSON shape. The field names below match each source's long-standing,
 * publicly documented format, but the first real run should be checked by hand (open the
 * Action's log, or run this script locally once) before trusting it unattended.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'fuel-prices.json');
const HISTORY_PATH = path.join(__dirname, '..', 'src', 'data', 'fuel-price-history.json');
const HISTORY_MAX_DAYS = 90;

const FETCH_TIMEOUT_MS = 15_000;
const US_GALLON_TO_LITRE = 3.785411784;

/** @typedef {{ e5: number | null, diesel: number | null, source: string, sourceUrl: string, fetchedAt: string, ok: boolean, note?: string }} CountryFuelPrice */

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function average(numbers) {
  const valid = numbers.filter((n) => typeof n === 'number' && Number.isFinite(n) && n > 0);
  if (valid.length === 0) return null;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round((sum / valid.length) * 1000) / 1000;
}

/**
 * Spain: official Ministerio REST endpoint. No API key. Returns all stations nationwide
 * with prices as comma-decimal strings (Spanish number format), e.g. "1,559".
 * We average "Precio Gasolina 95 E5" and "Precio Gasoleo A" across every station that
 * reports a non-empty value.
 */
async function fetchSpainAverage() {
  const sourceUrl = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRestCarburantes/PreciosCarburantes/EstacionesTerrestres/';
  try {
    const res = await fetchWithTimeout(sourceUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const stations = body?.ListaEESSPrecio;
    if (!Array.isArray(stations) || stations.length === 0) throw new Error('Unexpected response shape: no ListaEESSPrecio array');

    const parseEsNumber = (raw) => {
      if (typeof raw !== 'string' || raw.trim() === '') return null;
      const n = Number.parseFloat(raw.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };

    const gasolina95 = average(stations.map((s) => parseEsNumber(s['Precio Gasolina 95 E5'])));
    const diesel = average(stations.map((s) => parseEsNumber(s['Precio Gasoleo A'])));
    if (gasolina95 === null && diesel === null) throw new Error('Could not parse any station prices');

    return { e5: gasolina95, diesel, source: 'Ministerio para la Transición Ecológica (official, no key)', sourceUrl, fetchedAt: new Date().toISOString(), ok: true };
  } catch (err) {
    return { e5: null, diesel: null, source: 'Ministerio para la Transición Ecológica (official, no key)', sourceUrl, fetchedAt: new Date().toISOString(), ok: false, note: String(err?.message ?? err) };
  }
}

/**
 * Germany: Tankerkoenig gives per-station prices, not a national average, so we sample a
 * spread of major cities and average the open stations found within each. This is a
 * reasonable proxy for a national average, not an official statistic — the site must say so.
 */
const DE_SAMPLE_CITIES = [
  { name: 'Berlin', lat: 52.520008, lng: 13.404954 },
  { name: 'Hamburg', lat: 53.551086, lng: 9.993682 },
  { name: 'Munich', lat: 48.137154, lng: 11.576124 },
  { name: 'Cologne', lat: 50.937531, lng: 6.960279 },
  { name: 'Frankfurt', lat: 50.110924, lng: 8.682127 },
];
const DE_SAMPLE_RADIUS_KM = 15;

async function fetchGermanyAverage() {
  const sourceUrl = 'https://creativecommons.tankerkoenig.de/';
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  if (!apiKey) {
    return { e5: null, diesel: null, source: 'Tankerkoenig API (sampled cities)', sourceUrl, fetchedAt: new Date().toISOString(), ok: false, note: 'TANKERKOENIG_API_KEY is not set' };
  }

  const e5Values = [];
  const dieselValues = [];
  const errors = [];

  for (const city of DE_SAMPLE_CITIES) {
    try {
      const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${city.lat}&lng=${city.lng}&rad=${DE_SAMPLE_RADIUS_KM}&sort=dist&type=all&apikey=${apiKey}`;
      const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body?.ok !== true || !Array.isArray(body?.stations)) throw new Error(`Unexpected response for ${city.name}: ${JSON.stringify(body).slice(0, 200)}`);
      for (const station of body.stations) {
        if (station?.isOpen === false) continue;
        if (typeof station.e5 === 'number') e5Values.push(station.e5);
        if (typeof station.diesel === 'number') dieselValues.push(station.diesel);
      }
      // Stay well inside the 1 request/minute limit even though this whole script only
      // runs a few times a day from CI, never from a visitor's browser.
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    } catch (err) {
      errors.push(`${city.name}: ${String(err?.message ?? err)}`);
    }
  }

  const e5 = average(e5Values);
  const diesel = average(dieselValues);
  if (e5 === null && diesel === null) {
    return { e5: null, diesel: null, source: 'Tankerkoenig API (sampled cities)', sourceUrl, fetchedAt: new Date().toISOString(), ok: false, note: errors.join('; ') || 'No stations returned prices' };
  }
  return { e5, diesel, source: `Tankerkoenig API, live average of ${e5Values.length + dieselValues.length} station readings across ${DE_SAMPLE_CITIES.map((c) => c.name).join(', ')}`, sourceUrl, fetchedAt: new Date().toISOString(), ok: true, note: errors.length > 0 ? `Partial failures: ${errors.join('; ')}` : undefined };
}

/**
 * United States: EIA Open Data v2 "seriesid" convenience endpoint, weekly national-average
 * retail prices in USD/gallon. We convert to USD/litre so the site's fuel calculators (which
 * take a per-litre price everywhere, matching the metric/imperial toggle) stay consistent.
 */
const EIA_REGULAR_GAS_SERIES = 'PET.EMM_EPM0_PTE_NUS_DPG.W';
const EIA_DIESEL_SERIES = 'PET.EMD_EPD2D_PTE_NUS_DPG.W';

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

async function fetchUsAverage() {
  const sourceUrl = 'https://www.eia.gov/petroleum/gasdiesel/';
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    return { regular: null, diesel: null, source: 'EIA Weekly Retail Gasoline and Diesel Prices', sourceUrl, fetchedAt: new Date().toISOString(), ok: false, note: 'EIA_API_KEY is not set' };
  }
  try {
    const [gas, diesel] = await Promise.all([
      fetchEiaSeriesLatest(EIA_REGULAR_GAS_SERIES, apiKey),
      fetchEiaSeriesLatest(EIA_DIESEL_SERIES, apiKey),
    ]);
    return {
      regular: Math.round((gas.value / US_GALLON_TO_LITRE) * 1000) / 1000,
      diesel: Math.round((diesel.value / US_GALLON_TO_LITRE) * 1000) / 1000,
      regularPerGallon: gas.value,
      dieselPerGallon: diesel.value,
      weekOf: gas.period,
      source: 'U.S. Energy Information Administration (EIA), Weekly Retail Gasoline and Diesel Prices (official, weekly average)',
      sourceUrl,
      fetchedAt: new Date().toISOString(),
      ok: true,
    };
  } catch (err) {
    return { regular: null, diesel: null, source: 'EIA Weekly Retail Gasoline and Diesel Prices', sourceUrl, fetchedAt: new Date().toISOString(), ok: false, note: String(err?.message ?? err) };
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

/** Never let a failed fetch overwrite a previously good value; keep the last-known-good one and flag it as stale instead. */
function mergeWithFallback(countryKey, freshResult, previous, valueKeys) {
  if (freshResult.ok) return freshResult;
  const previousForCountry = previous?.[countryKey];
  const hadValue = previousForCountry?.ok && valueKeys.some((k) => previousForCountry[k] !== null && previousForCountry[k] !== undefined);
  if (hadValue) {
    return { ...previousForCountry, ok: false, note: `Refresh failed (${freshResult.note}); showing last known value from ${previousForCountry.fetchedAt}` };
  }
  return freshResult;
}

async function readHistory() {
  try {
    const raw = await readFile(HISTORY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Appends (or updates, if already run today) one row to the daily history log. */
async function updateHistory(output) {
  const history = await readHistory();
  const today = output.generatedAt.slice(0, 10); // YYYY-MM-DD (UTC)
  const row = {
    date: today,
    es: { e5: output.es.e5, diesel: output.es.diesel },
    de: { e5: output.de.e5, diesel: output.de.diesel },
    us: { regular: output.us.regular, diesel: output.us.diesel },
  };
  const existingIndex = history.findIndex((entry) => entry.date === today);
  if (existingIndex >= 0) history[existingIndex] = row;
  else history.push(row);
  history.sort((a, b) => a.date.localeCompare(b.date));
  const trimmed = history.slice(-HISTORY_MAX_DAYS);
  await writeFile(HISTORY_PATH, `${JSON.stringify(trimmed, null, 2)}\n`, 'utf8');
  console.log('Wrote', HISTORY_PATH, `(${trimmed.length} day${trimmed.length === 1 ? '' : 's'})`);
}

async function main() {
  const previous = await readPreviousOutput();
  const [spainFresh, germanyFresh, usFresh] = await Promise.all([fetchSpainAverage(), fetchGermanyAverage(), fetchUsAverage()]);

  const output = {
    generatedAt: new Date().toISOString(),
    disclaimer: 'National averages are estimates from public/official sources, not a live quote for any specific station. Always treat the number as a reference, not a guarantee.',
    es: mergeWithFallback('es', spainFresh, previous, ['e5', 'diesel']),
    de: mergeWithFallback('de', germanyFresh, previous, ['e5', 'diesel']),
    us: mergeWithFallback('us', usFresh, previous, ['regular', 'diesel']),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  await updateHistory(output);

  console.log('Wrote', OUTPUT_PATH);
  console.log(JSON.stringify(output, null, 2));

  if (!output.es.ok && !output.de.ok && !output.us.ok) {
    console.error('All sources failed this run — keeping previous file contents (if any) intact.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal error in update-fuel-prices:', err);
  process.exitCode = 1;
});
