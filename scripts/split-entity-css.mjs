/**
 * Post-build: give reference pages (tire sizes, comparisons, bolt patterns, vehicles, cars,
 * OBD codes — every typed sitemap except `pages`) a stylesheet that contains only the rules
 * those pages can use. They carry almost all search traffic and need ~20 % of the site CSS.
 *
 * Kept rules = selectors whose tokens appear in the reference pages' HTML or in the scripts
 * those pages load, plus class names that source code builds at runtime from a template
 * (`fit-check__status--${s}` keeps every `fit-check__status--*` rule). Tool pages, home and
 * the other `pages` routes keep the full stylesheet. Deterministic: same build → same file.
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PurgeCSS } from 'purgecss';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://atlasgarageos.com';
const TOKEN = /[A-Za-z0-9_-]+/g;

async function walk(directory, out = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path, out); else out.push(path);
  }
  return out;
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

async function referencePages() {
  const index = await readFile(join(DIST, 'sitemap.xml'), 'utf8');
  const pages = [];
  for (const child of locs(index)) {
    if (child.endsWith('/sitemap-pages.xml')) continue;
    const xml = await readFile(join(DIST, child.slice(ORIGIN.length + 1)), 'utf8');
    for (const url of locs(xml)) pages.push(join(DIST, url.slice(ORIGIN.length), 'index.html'));
  }
  return pages;
}

/** Class-name prefixes that source code completes at runtime: `name--${x}`, `is-${x}`. */
async function templatePrefixes() {
  const prefixes = new Set();
  for (const file of await walk(join(ROOT, 'src'))) {
    if (!/\.(astro|ts|tsx|js|mjs)$/.test(file)) continue;
    for (const match of (await readFile(file, 'utf8')).matchAll(/([a-z][a-z0-9_-]*[-_])\$\{/g)) prefixes.add(match[1]);
  }
  return [...prefixes].sort().map((prefix) => new RegExp(`^${prefix.replace(/[-_]/g, (c) => `\\${c}`)}`));
}

const pages = await referencePages();
const tokens = new Set();
const scripts = new Set();
let fullHref = '';
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  for (const token of html.match(TOKEN) ?? []) tokens.add(token);
  for (const match of html.matchAll(/<script[^>]*\ssrc="(\/_astro\/[^"]+\.js)"/g)) scripts.add(match[1]);
  if (!fullHref) fullHref = /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)">/.exec(html)?.[1] ?? '';
}
if (!fullHref) throw new Error('split-entity-css: no stylesheet link found on reference pages.');

// Scripts can import further chunks; follow static and dynamic imports inside _astro.
const queue = [...scripts];
while (queue.length) {
  const src = queue.pop();
  const code = await readFile(join(DIST, src), 'utf8');
  for (const token of code.match(TOKEN) ?? []) tokens.add(token);
  for (const match of code.matchAll(/["'`](?:\.\/|\/_astro\/)([A-Za-z0-9_.-]+\.js)["'`]/g)) {
    const next = `/_astro/${match[1]}`;
    if (!scripts.has(next)) { scripts.add(next); queue.push(next); }
  }
}

const fullCss = await readFile(join(DIST, fullHref), 'utf8');
const [result] = await new PurgeCSS().purge({
  content: [{ raw: [...tokens].join(' '), extension: 'txt' }],
  css: [{ raw: fullCss }],
  defaultExtractor: (content) => content.split(/\s+/),
  safelist: { standard: [/^is-/, /^has-/], greedy: await templatePrefixes() },
  variables: false,
  keyframes: false,
  fontFace: false,
});
const css = result.css;
const hash = createHash('sha256').update(css).digest('base64url').slice(0, 8);
const slimHref = `/_astro/reference.${hash}.css`;
await writeFile(join(DIST, slimHref), css);

const from = `<link rel="stylesheet" href="${fullHref}">`;
const to = `<link rel="stylesheet" href="${slimHref}">`;
let rewritten = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  if (!html.includes(from)) continue;
  await writeFile(page, html.replace(from, to));
  rewritten += 1;
}
console.log(`split-entity-css: ${rewritten}/${pages.length} reference pages → ${slimHref} (${Math.round(css.length / 1024)} KB, full ${Math.round(fullCss.length / 1024)} KB).`);
