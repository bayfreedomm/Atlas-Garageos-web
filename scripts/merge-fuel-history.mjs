#!/usr/bin/env node
// Merges a second fuel-price history file into the first (observations are immutable; an entry
// already present in the first file wins). Used by the fuel workflows when they re-apply their
// update on top of a newer default-branch commit.
import { readFile, writeFile } from 'node:fs/promises';
import { mergeHistories } from './update-fuel-prices.mjs';

const [target, extra] = process.argv.slice(2);
if (!target || !extra) throw new Error('usage: merge-fuel-history.mjs <target.json> <extra.json>');
const read = async (file) => { try { return JSON.parse(await readFile(file, 'utf8')); } catch { return { es: [], de: [], us: [] }; } };
const merged = mergeHistories(await read(target), await read(extra));
await writeFile(target, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
console.log(`Merged history (es:${merged.es.length} de:${merged.de.length} us:${merged.us.length})`);
