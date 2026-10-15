/**
 * Post-build: rasterize the entity image SVGs that `astro build` wrote to dist/img/** into the
 * PNGs the pages reference, then delete the SVGs. Runs on all CPU cores; output is identical on
 * every machine because the font is bundled (scripts/fonts, OFL) and system fonts are ignored.
 */
import { availableParallelism } from 'node:os';
import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FONT_FILES = ['Inter-Regular.otf', 'Inter-SemiBold.otf', 'Inter-Bold.otf'].map((file) => join(ROOT, 'scripts', 'fonts', file));

async function rasterize(files) {
  const { Resvg } = await import('@resvg/resvg-js');
  const { default: sharp } = await import('sharp');
  sharp.concurrency(1);
  for (const file of files) {
    const svg = await readFile(file, 'utf8');
    const raw = new Resvg(svg, { font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Inter' } }).render().asPng();
    // Flat technical drawing: a 64-colour palette PNG looks identical at ~40 % of the size.
    const png = await sharp(raw).png({ palette: true, colors: 64, compressionLevel: 6, effort: 1 }).toBuffer();
    await writeFile(file.replace(/\.svg$/, '.png'), png);
    await unlink(file);
  }
}

if (isMainThread) {
  const dir = join(ROOT, 'dist', 'img');
  const files = [];
  for (const family of await readdir(dir)) for (const name of await readdir(join(dir, family))) if (name.endsWith('.svg')) files.push(join(dir, family, name));
  const workers = Math.max(1, Math.min(availableParallelism(), 8));
  const started = Date.now();
  await Promise.all(Array.from({ length: workers }, (_, index) => new Promise((resolve, reject) => {
    const worker = new Worker(fileURLToPath(import.meta.url), { workerData: files.filter((_, i) => i % workers === index) });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => { if (code !== 0) reject(new Error(`rasterize worker exited with ${code}`)); });
  })));
  console.log(`rasterize-entity-images: ${files.length} images on ${workers} threads in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
} else {
  await rasterize(workerData);
  parentPort.postMessage('done');
}
