#!/usr/bin/env node
'use strict';
/* Writes ../data.js from one public download (not shipped; kept in the scratch directory):
     node tools/make-data.cjs /tmp/agent-tasks/econ-graph/random-walks/raw/fred_nasdaqcom.csv
   fred_nasdaqcom.csv: NASDAQ Composite Index, daily close, FRED series NASDAQCOM,
   https://fred.stlouisfed.org/graph/fredgraph.csv?id=NASDAQCOM&cosd=1971-02-05&coed=2026-11-24 (retrieved 2026-11-25).
   The series is cut at 2026-11-16 so that every count matches the sibling essay a-fair-price-for-a-bet, which used
   the same series up to that day (n = 14,063 daily returns). Kept: summary statistics per era, variance ratios with a
   shuffle band, histograms of q-day returns in units of their own standard deviation, and a few counts. No daily
   price or daily return is shipped.
   This is not a page.json generator (it needs the raw download), so --check does not rerun it. */
const fs = require('fs'), path = require('path');
const SRC = process.argv[2];
if (!SRC) { console.error('usage: node tools/make-data.cjs <fred_nasdaqcom.csv>'); process.exit(1); }
const CUT = '2026-11-16';
const rows = fs.readFileSync(SRC, 'utf8').trim().split('\n').slice(1).map(l => l.split(','))
  .filter(a => a[1] && isFinite(+a[1]) && a[0] <= CUT).map(a => [a[0], +a[1]]);
const r = [], dates = [];
for (let i = 1; i < rows.length; i++) { r.push(Math.log(rows[i][1] / rows[i - 1][1])); dates.push(rows[i][0]); }

const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sdev = a => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); };
const kurt = a => { const m = mean(a), s = sdev(a); return a.reduce((t, x) => t + ((x - m) / s) ** 4, 0) / a.length; };
const sums = (a, q) => { const o = []; for (let i = 0; i + q <= a.length; i += q) { let s = 0; for (let j = i; j < i + q; j++) s += a[j]; o.push(s); } return o; };
// Overlapping variance ratio (Lo and MacKinlay 1988 form, without their small-sample correction):
// VR(q) = Var(sum of q consecutive daily returns, every start day) / (q * Var(daily return)).
function vr(a, q) {
  const m = mean(a), n = a.length;
  let v1 = 0; for (const x of a) v1 += (x - m) * (x - m); v1 /= n;
  let s = 0; for (let j = 0; j < q; j++) s += a[j];
  let vq = 0, c = 0;
  for (let i = 0; ; i++) { vq += (s - q * m) * (s - q * m); c++; if (i + q >= n) break; s += a[i + q] - a[i]; }
  return (vq / c) / (q * v1);
}
function rng(seed) { let x = seed >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
const QS = [2, 5, 10, 21, 63, 252];
const ERAS = [['all', dates[0], CUT], ['e1', '1971-01-01', '1989-12-31'], ['e2', '1990-01-01', '2009-12-31'], ['e3', '2010-01-01', CUT]];
const SHUFFLES = 400;
const eras = {};
for (const [key, a, b] of ERAS) {
  const x = r.filter((v, i) => dates[i] >= a && dates[i] <= b);
  const d = dates.filter(v => v >= a && v <= b);
  const R = rng(20261125 + key.length * 7 + key.charCodeAt(key.length - 1));
  const band = QS.map(() => []);
  const y = x.slice();
  for (let k = 0; k < SHUFFLES; k++) {
    for (let i = y.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = y[i]; y[i] = y[j]; y[j] = t; }
    QS.forEach((q, qi) => band[qi].push(vr(y, q)));
  }
  const pct = (arr, p) => { const s = arr.slice().sort((u, v) => u - v); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const m = mean(x), s = sdev(x);
  let a1 = 0, v = 0; for (let i = 0; i < x.length; i++) { v += (x[i] - m) ** 2; if (i) a1 += (x[i] - m) * (x[i - 1] - m); }
  eras[key] = { from: d[0], to: d[d.length - 1], n: x.length, sd: +s.toPrecision(6), kurt: +kurt(x).toFixed(2), acf1: +(a1 / v).toFixed(4),
    vr: QS.map(q => +vr(x, q).toFixed(4)), lo: band.map(b2 => +pct(b2, 0.025).toFixed(4)), hi: band.map(b2 => +pct(b2, 0.975).toFixed(4)) };
}
// Histograms of non-overlapping q-day log returns (whole sample), z = (x - mean) / sd, bins of 0.5 sd from -12.
const HQ = [1, 5, 21, 63];
const BIN = 0.5, LO = -12, NB = 48;
const horizons = {};
for (const q of HQ) {
  const x = sums(r, q), m = mean(x), s = sdev(x);
  const hist = new Array(NB).fill(0);
  let over4 = 0;
  for (const v of x) { const z = (v - m) / s; hist[Math.min(NB - 1, Math.max(0, Math.floor((z - LO) / BIN)))]++; if (Math.abs(z) >= 4) over4++; }
  horizons[q] = { n: x.length, sd: +s.toPrecision(6), kurt: +kurt(x).toFixed(2), over4, hist };
}
// Volatility clustering: 21-day realised volatility, annualised with the sample's trading days per year.
const years = (Date.parse(dates[dates.length - 1]) - Date.parse(rows[0][0])) / (365.25 * 86400e3);
const perYear = r.length / years;
let vmin = Infinity, vmax = -Infinity, dmin = '', dmax = '';
for (let i = 21; i <= r.length; i++) {
  let ss = 0; for (let j = i - 21; j < i; j++) ss += r[j] * r[j];
  const vol = Math.sqrt(ss / 21 * perYear);
  if (vol < vmin) { vmin = vol; dmin = dates[i - 1]; }
  if (vol > vmax) { vmax = vol; dmax = dates[i - 1]; }
}
// Tail index of |daily log return| by the Hill estimator on the k largest values: alpha = 1 / mean(ln(x_i / x_(k+1))).
const absSorted = r.map(Math.abs).sort((a, b) => b - a);
const hill = k => { let s = 0; for (let i = 0; i < k; i++) s += Math.log(absSorted[i] / absSorted[k]); return +(k / s).toFixed(2); };
const tail = { k1: Math.round(r.length * 0.01), k25: Math.round(r.length * 0.025) };
tail.a1 = hill(tail.k1); tail.a25 = hill(tail.k25);
const RW = { tail, source: 'NASDAQ Composite Index, daily close (FRED series NASDAQCOM)', url: 'https://fred.stlouisfed.org/series/NASDAQCOM',
  retrieved: '2026-11-25', from: rows[0][0], to: dates[dates.length - 1], n: r.length, perYear: +perYear.toFixed(2),
  qs: QS, shuffles: SHUFFLES, eras, binLo: LO, binW: BIN, horizons,
  rv21: { min: +vmin.toFixed(4), minDate: dmin, max: +vmax.toFixed(4), maxDate: dmax } };
const body = `/* GENERATED by tools/make-data.cjs from one public download; do not edit. Source, URL and retrieval date are in
   the object below and in BRIEF.md. Summary extracts only: no daily price or return is shipped.
   UMD: window.RandomWalkData in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RandomWalkData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return ${JSON.stringify(RW)};
});
`;
fs.writeFileSync(path.join(__dirname, '..', 'data.js'), body);
console.log(JSON.stringify(RW, (k, v) => (k === 'hist' ? undefined : v), 1));
