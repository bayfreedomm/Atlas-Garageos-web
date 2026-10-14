#!/usr/bin/env node
/**
 * IndexNow notifier for atlasgarageos.com.
 *
 * Reads the built sitemap index in dist/, hashes the HTML of every indexable URL and compares
 * it with the state saved by the previous run. Only new, changed or removed URLs are sent to
 * IndexNow (Bing, Yandex, Seznam, Naver …), in batches of up to 10,000 as the protocol allows.
 * With no saved state (first run, or --all) every sitemap URL is sent once.
 *
 * Usage:
 *   node scripts/indexnow.mjs [--dist dist] [--state .indexnow/state.json] [--all]
 *                             [--wait-for <commit sha>] [--timeout 900] [--dry-run] [--record-only]
 *
 * --record-only saves the current state without sending anything (marks the build as sent).
 * --wait-for polls https://atlasgarageos.com/build-id.txt until the live deployment reports that
 * commit, so engines are only pinged once the new pages are actually served. The state file is
 * written only after every batch was accepted, so a failed run is simply retried next time.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const SITE = 'https://atlasgarageos.com';
const HOST = 'atlasgarageos.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10_000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const dist = resolve(option('dist', 'dist'));
const statePath = resolve(option('state', '.indexnow/state.json'));
const waitFor = option('wait-for', '');
const timeoutSeconds = Number(option('timeout', '900'));
const dryRun = flag('dry-run');
const sendAll = flag('all');
const recordOnly = flag('record-only');

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

async function findKey() {
  const files = await readdir(dist);
  const keys = [];
  for (const file of files) {
    const match = /^([0-9a-f]{32})\.txt$/.exec(file);
    if (!match) continue;
    const body = (await readFile(join(dist, file), 'utf8')).trim();
    if (body === match[1]) keys.push(match[1]);
  }
  if (keys.length !== 1) throw new Error(`Expected exactly one IndexNow key file in ${dist}, found ${keys.length}.`);
  return keys[0];
}

async function sitemapUrls() {
  const index = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  if (!index.includes('<sitemapindex')) return locs(index);
  const urls = [];
  for (const child of locs(index)) urls.push(...locs(await readFile(join(dist, child.slice(SITE.length + 1)), 'utf8')));
  return urls;
}

function fileForUrl(url) {
  const path = decodeURIComponent(url.slice(SITE.length));
  return join(dist, path.endsWith('/') ? `${path}index.html` : path);
}

async function hashes(urls) {
  const result = {};
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const url = urls[next++];
      const html = await readFile(fileForUrl(url));
      result[url] = createHash('sha1').update(html).digest('hex').slice(0, 16);
    }
  };
  await Promise.all(Array.from({ length: 32 }, worker));
  return result;
}

async function loadState() {
  try {
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    return state && typeof state.hashes === 'object' ? state.hashes : null;
  } catch {
    return null;
  }
}

async function waitForDeployment() {
  if (!waitFor) return;
  const deadline = Date.now() + timeoutSeconds * 1000;
  let last = '';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${SITE}/build-id.txt?ts=${Date.now()}`, { cache: 'no-store' });
      last = response.ok ? (await response.text()).trim() : `HTTP ${response.status}`;
      if (last === waitFor) { console.log(`Live deployment is ${waitFor}.`); return; }
    } catch (error) {
      last = String(error);
    }
    console.log(`Waiting for deployment of ${waitFor.slice(0, 7)} (live: ${last.slice(0, 40)}) …`);
    await sleep(30_000);
  }
  console.warn(`::warning::Live site did not report ${waitFor} within ${timeoutSeconds}s (last: ${last}). Submitting anyway.`);
}

async function verifyLiveKey(key) {
  const response = await fetch(`${SITE}/${key}.txt?ts=${Date.now()}`, { cache: 'no-store' });
  const body = response.ok ? (await response.text()).trim() : '';
  if (body !== key) throw new Error(`Live key file ${SITE}/${key}.txt is not serving the key yet (HTTP ${response.status}).`);
}

async function submit(key, urlList) {
  const payload = JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList });
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: payload });
    if (response.status === 200 || response.status === 202) return response.status;
    const text = (await response.text()).slice(0, 300);
    if (response.status === 429 || response.status >= 500) {
      console.warn(`IndexNow HTTP ${response.status} (attempt ${attempt}): ${text}`);
      await sleep(attempt * 60_000);
      continue;
    }
    throw new Error(`IndexNow rejected the batch with HTTP ${response.status}: ${text}`);
  }
  throw new Error('IndexNow kept failing after 4 attempts.');
}

const key = await findKey();
const urls = await sitemapUrls();
const current = await hashes(urls);
const previous = sendAll ? null : await loadState();

let changed;
if (!previous) {
  changed = urls;
  console.log(`No previous state${sendAll ? ' (--all)' : ''}: submitting all ${urls.length} sitemap URLs.`);
} else {
  const added = urls.filter((url) => !(url in previous));
  const modified = urls.filter((url) => url in previous && previous[url] !== current[url]);
  const removed = Object.keys(previous).filter((url) => !(url in current));
  changed = [...added, ...modified, ...removed];
  console.log(`${urls.length} sitemap URLs: ${added.length} new, ${modified.length} changed, ${removed.length} removed.`);
}

if (changed.length === 0) {
  console.log('Nothing to submit.');
} else if (recordOnly) {
  console.log(`Record only — ${changed.length} URLs marked as sent without submitting.`);
} else if (dryRun) {
  console.log(`Dry run — would submit ${changed.length} URLs in ${Math.ceil(changed.length / BATCH)} batch(es). First few:`);
  for (const url of changed.slice(0, 10)) console.log(`  ${url}`);
} else {
  await waitForDeployment();
  await verifyLiveKey(key);
  for (let start = 0; start < changed.length; start += BATCH) {
    const batch = changed.slice(start, start + BATCH);
    const status = await submit(key, batch);
    console.log(`Submitted ${start + batch.length}/${changed.length} (HTTP ${status}).`);
  }
}

if (!dryRun) {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify({ updated: new Date().toISOString(), hashes: current }));
  console.log(`State saved to ${statePath}.`);
}
