import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../dist/', import.meta.url);
const rootPath = fileURLToPath(root);
const origin = 'https://atlasgarageos.com';
const failures = [];
const warnings = [];
const verbose = process.argv.includes('--verbose');

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

const one = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[1]);
const pathForFile = (file) => {
  const local = relative(rootPath, file).split(sep).join('/');
  if (local === 'index.html') return '/';
  if (local.endsWith('/index.html')) return `/${local.slice(0, -'index.html'.length)}`;
  return `/${local}`;
};

// /sitemap.xml is a sitemap index; every child it lists must exist in dist/ and stay within
// the protocol limits (50,000 URLs, 50 MB uncompressed). A plain urlset is still accepted.
const sitemapXml = await readFile(new URL('sitemap.xml', root), 'utf8');
const sitemapUrls = [];
if (sitemapXml.includes('<sitemapindex')) {
  const children = one(sitemapXml, /<sitemap><loc>([^<]+)<\/loc><\/sitemap>/g);
  if (children.length === 0) failures.push('Sitemap index lists no child sitemaps.');
  if (new Set(children).size !== children.length) failures.push('Sitemap index lists a child twice.');
  for (const child of children) {
    if (!child.startsWith(`${origin}/`) || !child.endsWith('.xml')) { failures.push(`Sitemap index child is not a canonical .xml URL: ${child}`); continue; }
    let xml;
    try { xml = await readFile(new URL(child.slice(origin.length + 1), root), 'utf8'); }
    catch { failures.push(`Sitemap index child is missing from the build: ${child}`); continue; }
    const urls = one(xml, /<loc>([^<]+)<\/loc>/g);
    if (urls.length === 0) failures.push(`${child}: child sitemap is empty.`);
    if (urls.length > 50000) failures.push(`${child}: ${urls.length} URLs exceeds the 50,000 sitemap limit.`);
    if (Buffer.byteLength(xml) > 50 * 1024 * 1024) failures.push(`${child}: larger than 50 MB.`);
    sitemapUrls.push(...urls);
  }
  console.log(`Sitemap index: ${children.length} child sitemaps.`);
} else {
  sitemapUrls.push(...one(sitemapXml, /<loc>([^<]+)<\/loc>/g));
}
const sitemapSet = new Set(sitemapUrls);
if (sitemapSet.size !== sitemapUrls.length) failures.push('Sitemap contains duplicate URLs.');
if (sitemapUrls.some((url) => !url.startsWith(`${origin}/`) || /[?#]/.test(url))) failures.push('Sitemap contains a non-canonical, query, or fragment URL.');

const robots = await readFile(new URL('robots.txt', root), 'utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) failures.push('robots.txt does not advertise the canonical sitemap.');
// Internal links never carry calculator state (src/seo/state-links.ts), so query URLs only come
// from shares and bookmarks. They must stay crawlable so Google can read their clean canonical.
if (/^Disallow: \/\*\?/m.test(robots)) failures.push('robots.txt must not block query URLs: shared calculator URLs need their canonical read.');
let queryHrefs = 0;
const stylesheetChecked = new Map();
const { existsSync } = await import('node:fs');
const queryHrefSamples = [];

const htmlFiles = (await filesBelow(rootPath)).filter((file) => file.endsWith('.html'));
const pages = new Map();
const canonicalOwners = new Map();
const titleOwners = new Map();
const descriptionOwners = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const pathname = pathForFile(file);
  // Page-specific images: og:image must exist in dist and be the page's own visible <img>.
  const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1] ?? '';
  if (ogImage.startsWith(`${origin}/img/`)) {
    const imagePath = ogImage.slice(origin.length);
    if (!existsSync(new URL(`.${imagePath}`, root))) failures.push(`${pathname}: og:image ${imagePath} is missing from dist.`);
    if (!html.includes(`<img src="${imagePath}"`)) failures.push(`${pathname}: og:image ${imagePath} is not shown as an <img> on the page.`);
    if (!html.includes(`"primaryImageOfPage"`)) failures.push(`${pathname}: page image missing from structured data.`);
  }
  for (const match of html.matchAll(/<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"/g)) {
    if (!stylesheetChecked.has(match[1])) stylesheetChecked.set(match[1], existsSync(new URL(`.${match[1]}`, root)));
    if (!stylesheetChecked.get(match[1])) failures.push(`${pathname}: stylesheet ${match[1]} is missing from dist.`);
  }
  for (const match of html.matchAll(/<a\b[^>]*?\shref="((?:\/(?!\/)|\?|https:\/\/atlasgarageos\.com)[^"]*\?[^"]*)"/gi)) {
    queryHrefs += 1;
    if (queryHrefSamples.length < 5) queryHrefSamples.push(`${pathname} → ${match[1]}`);
  }
  const titles = one(html, /<title>([\s\S]*?)<\/title>/gi);
  const descriptions = one(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi);
  const canonicals = one(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi);
  const robotsValues = one(html, /<meta\s+name="robots"\s+content="([^"]+)"\s*\/?\s*>/gi);
  const langs = one(html, /<html\s+lang="([^"]+)"/gi);
  const h1s = [...html.matchAll(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/gi)];
  const alternates = [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/?\s*>/gi)]
    .map((match) => ({ lang: match[1], href: match[2] }));
  const noindex = robotsValues.some((value) => /(?:^|,)\s*noindex\b/i.test(value));

  if (titles.length !== 1 || titles[0].trim().length === 0) failures.push(`${pathname}: expected one non-empty title.`);
  if (robotsValues.length !== 1) failures.push(`${pathname}: expected exactly one robots meta tag.`);
  if (langs.length !== 1) failures.push(`${pathname}: expected exactly one html lang.`);
  if (!noindex && h1s.length !== 1) failures.push(`${pathname}: expected exactly one h1.`);

  if (!noindex) {
    if (descriptions.length !== 1 || descriptions[0].trim().length === 0) failures.push(`${pathname}: expected one non-empty meta description.`);
    if (canonicals.length !== 1) failures.push(`${pathname}: expected exactly one canonical.`);
    const expectedCanonical = `${origin}${pathname}`;
    if (canonicals[0] !== expectedCanonical) failures.push(`${pathname}: canonical is ${canonicals[0] ?? 'missing'}, expected ${expectedCanonical}.`);
    if (!sitemapSet.has(expectedCanonical)) failures.push(`${pathname}: indexable canonical is missing from sitemap.`);
    if (langs[0] === 'de' && !pathname.startsWith('/de/')) failures.push(`${pathname}: German lang does not match URL family.`);
    if (langs[0] === 'es' && !pathname.startsWith('/es/')) failures.push(`${pathname}: Spanish lang does not match URL family.`);
    if (langs[0] === 'en' && (pathname.startsWith('/de/') || pathname.startsWith('/es/'))) failures.push(`${pathname}: English lang conflicts with localized URL family.`);

    const canonical = canonicals[0];
    const previous = canonicalOwners.get(canonical);
    if (previous) failures.push(`${pathname}: canonical duplicates ${previous}.`);
    else canonicalOwners.set(canonical, pathname);

    const language = langs[0];
    for (const [value, owners, label] of [[titles[0], titleOwners, 'title'], [descriptions[0], descriptionOwners, 'description']]) {
      const key = `${language}:${value}`;
      const owner = owners.get(key);
      if (owner) failures.push(`${pathname}: duplicate ${label} in ${language}; also used by ${owner}.`);
      else owners.set(key, pathname);
    }

    if (titles[0].replace(/<[^>]+>/g, '').length > 75) warnings.push(`${pathname}: title exceeds 75 characters.`);
    if (descriptions[0].length > 180) warnings.push(`${pathname}: description exceeds 180 characters.`);
  } else if (canonicals[0] && sitemapSet.has(canonicals[0]) && !pathname.includes('/embed/')) {
    failures.push(`${pathname}: noindex page canonical unexpectedly appears in sitemap.`);
  }

  if (alternates.length > 0) {
    if (!alternates.some((alternate) => alternate.lang === 'x-default')) failures.push(`${pathname}: hreflang cluster has no x-default.`);
    if (!noindex && !alternates.some((alternate) => alternate.lang === langs[0] && alternate.href === canonicals[0])) failures.push(`${pathname}: hreflang cluster has no self-reference.`);
    if (new Set(alternates.map(({ lang }) => lang)).size !== alternates.length) failures.push(`${pathname}: duplicate hreflang code.`);
    if (alternates.some(({ href }) => !href.startsWith(`${origin}/`) || /[?#]/.test(href))) failures.push(`${pathname}: hreflang contains a non-canonical URL.`);
  }

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch { failures.push(`${pathname}: invalid JSON-LD.`); }
  }
  pages.set(`${origin}${pathname}`, { pathname, lang: langs[0], alternates, noindex });
}

if (queryHrefs > 0) failures.push(`${queryHrefs} internal links carry a query string (calculator state belongs in data-link-state): ${queryHrefSamples.join('; ')}`);

for (const url of sitemapUrls) {
  const page = pages.get(url);
  if (!page) failures.push(`Sitemap URL has no generated HTML: ${url}.`);
  else if (page.noindex) failures.push(`Sitemap URL is noindex: ${url}.`);
}

for (const [url, page] of pages) {
  if (page.noindex) continue;
  for (const alternate of page.alternates) {
    if (alternate.lang === 'x-default') continue;
    const target = pages.get(alternate.href);
    if (!target || target.noindex) failures.push(`${page.pathname}: hreflang target is not an indexable generated page: ${alternate.href}.`);
    else if (!target.alternates.some((back) => back.lang === page.lang && back.href === url)) failures.push(`${page.pathname}: hreflang is not reciprocal with ${target.pathname}.`);
  }
}

console.log(`SEO build audit: ${htmlFiles.length} HTML files, ${sitemapUrls.length} sitemap URLs, ${canonicalOwners.size} indexable canonicals.`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  const longTitles = warnings.filter((warning) => warning.includes('title exceeds')).length;
  const longDescriptions = warnings.filter((warning) => warning.includes('description exceeds')).length;
  console.log(`SEO build audit passed. Advisory length review: ${longTitles} titles over 75 characters, ${longDescriptions} descriptions over 180 characters.`);
  if (verbose) {
    for (const warning of warnings) console.warn(`WARN ${warning}`);
  }
}
