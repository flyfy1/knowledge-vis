'use strict';
/* Generator for ../data.js: rebuilds every shipped series from FRED CSV downloads.
 *
 *   node tools/build-data.cjs --fetch <dir>            download the 21 series into <dir> (one <ID>.csv each), using curl
 *   node tools/build-data.cjs --check <dir>            rebuild from <dir> and compare with ../data.js (exit 1 on any difference)
 *   node tools/build-data.cjs --write <dir>            rebuild from <dir> and overwrite ../data.js
 *   options: --asof YYYY-MM-DD   last observation date used for the daily and weekly series (default below)
 *            --retrieved YYYY-MM-DD, --verified YYYY-MM-DD   the two date stamps written into data.js
 *
 * Keep <dir> outside the repository (for example /tmp/agent-tasks/<task>/fred): the CSVs are not committed.
 * Source: https://fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>. The shipped data.js was first built from
 * downloads of 2026-11-11 and reproduced byte for byte by this script from downloads of 2026-11-18 with
 * --asof 2026-11-06 (FRED had not revised any value used here in between).
 *
 * Series and what is built from each
 *   FEDFUNDS            taylor.ff    quarterly mean of the monthly effective federal funds rate, 2 dp, 1990Q1 … END_Q
 *   PCEPILFE            taylor.infl  core PCE inflation: 100·(quarter mean of the index / same quarter a year earlier − 1), 2 dp
 *   GDPC1, GDPPOT       taylor.gap   output gap 100·(real GDP / CBO potential − 1), 2 dp (current vintage of both)
 *   GS10, TB3MS         spread.s     monthly GS10 − BEY(TB3MS), 2 dp, 1960-01 … END_M, where BEY(d) = 100·365·(d/100)/(360 − 91·d/100)
 *                                    turns the bill's discount quote into a bond-equivalent yield (Estrella & Trubin 2006, note 4)
 *   USREC               spread.rec   NBER recession indicator, same months
 *   THREEFYTP10         tp.v         Kim–Wright 10-year term premium: mean of the daily values in each month, 2 dp, 1990-01 … asof
 *   DGS1,2,3,5,7,10,20,30  curves    par yields on the three dates in CURVE_DATES
 *   WALCL               fedBS.v      Fed total assets, last weekly value in each month, USD trillion, 2 dp, 2007-01 … asof
 *   ECBASSETSW          ecbBS.v      Eurosystem total assets, last weekly value in each month, EUR trillion, 2 dp
 *   A091RC1Q027SBEA, FYGFDPUN, GDP   debt.<quarter>: ratio = 100·debt held by the public / (GDP·1000), 2 dp;
 *                                    rEff = 100·federal interest payments (annual rate, bn) / (debt/1000), 2 dp;
 *                                    g = nominal GDP growth over four quarters, 2 dp
 * The last month of tp, fedBS and ecbBS is a part month: it holds whatever had been published up to --asof. */
const fs = require('fs'), path = require('path');
const IDS = ['FEDFUNDS', 'PCEPILFE', 'GDPC1', 'GDPPOT', 'GS10', 'TB3MS', 'USREC', 'THREEFYTP10', 'DGS1', 'DGS2', 'DGS3', 'DGS5', 'DGS7', 'DGS10', 'DGS20', 'DGS30', 'WALCL', 'ECBASSETSW', 'A091RC1Q027SBEA', 'FYGFDPUN', 'GDP'];
const END_Q = '2026Q3', END_M = '2026-10', CURVE_DATES = ['2021-12-31', '2023-06-30', '2026-11-09'], CURVE_MAT = [1, 2, 3, 5, 7, 10, 20, 30], DEBT_Q = ['2025Q2', '2026Q2'];
const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const mode = ['--fetch', '--check', '--write'].find(m => args.includes(m)), dir = mode && opt(mode);
const ASOF = opt('--asof') || '2026-11-06', RETRIEVED = opt('--retrieved') || '2026-11-11', VERIFIED = opt('--verified') || '2026-11-18';
const OUT = path.join(__dirname, '..', 'data.js');
if (!mode || !dir) { console.error('usage: node tools/build-data.cjs --fetch|--check|--write <csv dir> [--asof YYYY-MM-DD]'); process.exit(2); }

const r2 = x => Math.round(x * 100) / 100, mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const bey = d => 100 * 365 * (d / 100) / (360 - 91 * (d / 100));
function load(id) { // Map 'YYYY-MM-DD' → number; missing observations ('' or '.') are dropped
  const out = new Map();
  for (const line of fs.readFileSync(path.join(dir, id + '.csv'), 'utf8').trim().split('\n').slice(1)) { const [d, v] = line.split(','); if (v !== '' && v !== '.' && isFinite(+v)) out.set(d, +v); }
  return out;
}
const months = (from, to) => { const out = []; let y = +from.slice(0, 4), m = +from.slice(5, 7); for (;;) { const k = `${y}-${String(m).padStart(2, '0')}`; out.push(k); if (k === to) return out; if (++m > 12) { m = 1; y++; } } };
const quarters = (from, to) => { const out = []; let y = +from.slice(0, 4), q = +from.slice(5); for (;;) { const k = `${y}Q${q}`; out.push(k); if (k === to) return out; if (++q > 4) { q = 1; y++; } } };
const qMonths = q => [0, 1, 2].map(i => `${q.slice(0, 4)}-${String((+q.slice(5) - 1) * 3 + 1 + i).padStart(2, '0')}-01`);
const qFirst = q => qMonths(q)[0], yearBefore = q => `${+q.slice(0, 4) - 1}Q${q.slice(5)}`;
const need = (map, key, id) => { if (!map.has(key)) throw new Error(`${id}: no observation for ${key}`); return map.get(key); };

function build() {
  const S = {}; for (const id of IDS) S[id] = load(id);
  const qs = quarters('1990Q1', END_Q), qmean = (id, q) => mean(qMonths(q).map(d => need(S[id], d, id)));
  const taylor = { start: '1990Q1',
    ff: qs.map(q => r2(qmean('FEDFUNDS', q))),
    infl: qs.map(q => r2(100 * (qmean('PCEPILFE', q) / qmean('PCEPILFE', yearBefore(q)) - 1))),
    gap: qs.map(q => r2(100 * (need(S.GDPC1, qFirst(q), 'GDPC1') / need(S.GDPPOT, qFirst(q), 'GDPPOT') - 1))), end: END_Q };
  const ms = months('1960-01', END_M);
  const spread = { start: '1960-01', s: ms.map(m => r2(need(S.GS10, m + '-01', 'GS10') - bey(need(S.TB3MS, m + '-01', 'TB3MS')))), rec: ms.map(m => need(S.USREC, m + '-01', 'USREC')), end: END_M, basis: 'GS10 minus bond-equivalent TB3MS' };
  const lastM = ASOF.slice(0, 7), upTo = id => [...S[id]].filter(([d]) => d <= ASOF);
  const byMonth = (id, from, pick) => { const g = new Map(); for (const [d, v] of upTo(id)) { const k = d.slice(0, 7); if (!g.has(k)) g.set(k, []); g.get(k).push(v); } return months(from, lastM).map(m => { if (!g.has(m)) throw new Error(`${id}: nothing in ${m}`); return pick(g.get(m)); }); };
  const tp = { start: '1990-01', v: byMonth('THREEFYTP10', '1990-01', a => r2(mean(a))), end: lastM };
  const curves = {}; for (const d of CURVE_DATES) curves[d] = CURVE_MAT.map(n => need(S['DGS' + n], d, 'DGS' + n));
  const fedBS = { start: '2007-01', v: byMonth('WALCL', '2007-01', a => r2(a[a.length - 1] / 1e6)), end: lastM };
  const ecbBS = { start: '2007-01', v: byMonth('ECBASSETSW', '2007-01', a => r2(a[a.length - 1] / 1e6)), end: lastM };
  const debt = {}; for (const q of DEBT_Q) { const d = qFirst(q), d0 = qFirst(yearBefore(q)), pub = need(S.FYGFDPUN, d, 'FYGFDPUN'), gdp = need(S.GDP, d, 'GDP');
    debt[q] = { ratio: r2(100 * pub / (gdp * 1000)), rEff: r2(100 * need(S.A091RC1Q027SBEA, d, 'A091RC1Q027SBEA') / (pub / 1000)), g: r2(100 * (gdp / need(S.GDP, d0, 'GDP') - 1)) }; }
  return { retrieved: RETRIEVED, taylor, spread, tp, curves, curveMat: CURVE_MAT, fedBS, ecbBS, debt, verified: VERIFIED };
}
const HEAD = '/* Data shipped with the essay. Built from FRED series retrieved 2026-11-11 and re-verified point by point against fresh downloads on 2026-11-18 (see BRIEF.md "Data"). spread.s was rebuilt on 2026-11-18 as GS10 minus the bond-equivalent yield of TB3MS. Do not edit by hand. */\n';
const WRAP = '(function (root, d) { if (typeof module === "object" && module.exports) module.exports = d; else root.RateData = d; }(typeof self !== "undefined" ? self : this, ';
const render = d => HEAD + WRAP + JSON.stringify(d) + '));\n';

(async () => {
  if (mode === '--fetch') {
    fs.mkdirSync(dir, { recursive: true });
    // curl, not Node's fetch: FRED closed Node's HTTP/2 streams with an internal error when this was written (2026-11-18)
    for (const id of IDS) { const text = require('child_process').execFileSync('curl', ['-sS', '--fail', '-m', '90', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + id], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); if (!/^observation_date,/.test(text)) throw new Error(`${id}: not a FRED CSV`); fs.writeFileSync(path.join(dir, id + '.csv'), text); console.log(`${id}: ${text.trim().split('\n').length - 1} rows`); }
    return;
  }
  const built = build(), text = render(built);
  if (mode === '--write') { fs.writeFileSync(OUT, text); console.log('wrote ' + OUT); return; }
  const have = require(OUT), diffs = [];
  (function walk(a, b, p) { if (a && typeof a === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b || {})])) walk(a[k], b == null ? undefined : b[k], p ? p + '.' + k : k); } else if (a !== b) diffs.push(`${p}: built ${a}, shipped ${b}`); }(built, have, ''));
  if (diffs.length) { console.error(`${diffs.length} differences (first 20):\n` + diffs.slice(0, 20).join('\n')); process.exit(1); }
  const same = fs.readFileSync(OUT, 'utf8') === text;
  console.log(`OK: every value in data.js reproduced from ${IDS.length} FRED series (asof ${ASOF}); file ${same ? 'identical byte for byte' : 'differs only in formatting or key order'}`);
  if (!same) process.exit(1);
})().catch(e => { console.error(e.message); process.exit(1); });
