'use strict';
// Recompute the group means in sim-core.js from Praat's Peterson & Barney table.
// Author: Claude Code (claude-opus-5-5), 2026-11-08.
// Usage: node tools/pb-means.cjs <path/to/praat/dwtools/Table_dataSets.cpp>
// Source fetched from https://raw.githubusercontent.com/praat/praat/6a9874e525d80a2b4c2e6a8d687081963c6d4e6a/dwtools/Table_dataSets.cpp
// Row order (per the Praat code): speaker 1..76, each with 10 vowels × 2 repetitions; speakers 1–33 men,
// 34–61 women, 62–76 children. All 1520 rows are averaged, starred or not.
const fs = require('node:fs'), path = require('node:path');
const src = fs.readFileSync(process.argv[2], 'utf8');
const a = src.slice(src.indexOf('pbdata [] = {')), body = a.slice(0, a.indexOf('};'));
const rows = [...body.matchAll(/\{(\d),\s*\{(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\}\}/g)].map(m => m.slice(2).map(Number));
if (rows.length !== 1520) throw new Error('expected 1520 rows, got ' + rows.length);
const IDS = ['iy', 'ih', 'eh', 'ae', 'ah', 'aa', 'ao', 'uh', 'uw', 'er'], acc = {};
rows.forEach((r, i) => {
  const v = IDS[Math.floor((i % 20) / 2)], s = Math.floor(i / 20) + 1, g = s <= 33 ? 'm' : s <= 61 ? 'w' : 'c', k = g + v;
  (acc[k] = acc[k] || { n: 0, f: [0, 0, 0, 0] }).n++; r.forEach((x, j) => { acc[k].f[j] += x; });
});
const out = {}; for (const g of ['m', 'w', 'c']) { out[g] = {}; for (const v of IDS) out[g][v] = acc[g + v].f.map(x => Math.round(x / acc[g + v].n)); }
const V = require(path.resolve(__dirname, '..', 'sim-core.js'));
const same = JSON.stringify(out) === JSON.stringify(V.MEANS);
console.log(same ? 'MATCH sim-core.js MEANS' : 'DIFFERS from sim-core.js MEANS'); console.log(JSON.stringify(out));
process.exit(same ? 0 : 1);
