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
 *
 * IMPORTANT — not yet verified against a live response in this session: the network this
 * script was authored in could not reach either government/API host to confirm the exact
 * current JSON shape. The field names below match each source's long-standing, publicly
 * documented format, but the first real run should be checked by hand (open the Action's
 * log, or run this script locally once) before trusting it unattended.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'fuel-prices.json');

const FETCH_TIMEOUT_MS = 15_000;

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

async function readPreviousOutput() {
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Never let a failed fetch overwrite a previously good value; keep the last-known-good one and flag it as stale instead. */
function mergeWithFallback(countryKey, freshResult, previous) {
  if (freshResult.ok) return freshResult;
  const previousForCountry = previous?.[countryKey];
  if (previousForCountry?.ok && (previousForCountry.e5 !== null || previousForCountry.diesel !== null)) {
    return { ...previousForCountry, ok: false, note: `Refresh failed (${freshResult.note}); showing last known value from ${previousForCountry.fetchedAt}` };
  }
  return freshResult;
}

async function main() {
  const previous = await readPreviousOutput();
  const [spainFresh, germanyFresh] = await Promise.all([fetchSpainAverage(), fetchGermanyAverage()]);

  const output = {
    generatedAt: new Date().toISOString(),
    disclaimer: 'National averages are estimates from public/official sources, not a live quote for any specific station. Always treat the number as a reference, not a guarantee.',
    es: mergeWithFallback('es', spainFresh, previous),
    de: mergeWithFallback('de', germanyFresh, previous),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log('Wrote', OUTPUT_PATH);
  console.log(JSON.stringify(output, null, 2));

  if (!output.es.ok && !output.de.ok) {
    console.error('Both sources failed this run — keeping previous file contents (if any) intact.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal error in update-fuel-prices:', err);
  process.exitCode = 1;
});
