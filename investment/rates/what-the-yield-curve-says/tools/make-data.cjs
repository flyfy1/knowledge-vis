#!/usr/bin/env node
'use strict';
/* Builds ../data.js from public downloads kept outside the repo.
   Usage: node tools/make-data.cjs <raw-dir> [--check]
   <raw-dir> holds:
     FRED CSVs  https://fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>  for
       DGS3MO DGS6MO DGS1 DGS2 DGS3 DGS5 DGS7 DGS10 DGS20 DGS30 T10Y3M T10Y2Y THREEFYTP10
       BAMLH0A0HYM2 BAMLC0A0CM BAMLC0A4CBBB BAMLH0A1HYBB BAMLH0A2HYB BAMLH0A3HYC   (ICE BofA OAS; FRED serves 3 years only)
     acm_monthly.csv, acm_daily.csv  from the NY Fed workbook ACMTermPremium.xls via tools/acm-xls-to-csv.py
       https://www.newyorkfed.org/medialibrary/media/research/data_indicators/ACMTermPremium.xls
   S&P figures (spg) are typed from S&P Global Ratings, "2024 Annual Global Corporate Default And Rating Transition
   Study" (27 Mar 2025), Table 1 and Table 24; see BRIEF.md. Retrieved 2026-11-25. */
const fs = require('fs'), path = require('path');
const RAW = process.argv[2];
if (!RAW) { console.error('usage: node tools/make-data.cjs <raw-dir> [--check]'); process.exit(2); }
const OUT = path.join(__dirname, '..', 'data.js');
const r3 = x => Math.round(x * 1000) / 1000, r2 = x => Math.round(x * 100) / 100;

function fred(id) {
  const rows = fs.readFileSync(path.join(RAW, id + '.csv'), 'utf8').trim().split('\n').slice(1);
  const o = [];
  for (const l of rows) { const [d, v] = l.split(','); if (v === '' || v === '.' || v == null) continue; o.push([d, +v]); }
  return o;
}
function monthly(series, from, to) { // calendar-month mean of daily values; returns {start, v[]}
  const acc = new Map();
  for (const [d, v] of series) { const m = d.slice(0, 7); if (m < from || m > to) continue; const a = acc.get(m) || [0, 0]; a[0] += v; a[1]++; acc.set(m, a); }
  const v = []; let m = from;
  while (m <= to) { const a = acc.get(m); v.push(a ? r3(a[0] / a[1]) : null); m = nextM(m); }
  return { start: from, v };
}
function nextM(m) { let [y, mo] = m.split('-').map(Number); mo++; if (mo > 12) { mo = 1; y++; } return y + '-' + String(mo).padStart(2, '0'); }
const MON = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
function acm(file) {
  const L = fs.readFileSync(path.join(RAW, file), 'utf8').trim().split(/\r?\n/);
  const H = L[0].split(','); const rows = [];
  for (const l of L.slice(1)) {
    const c = l.split(','); const [dd, mm, yy] = c[0].split('-');
    const o = { d: yy + '-' + MON[mm] + '-' + dd.padStart(2, '0') };
    H.forEach((h, i) => { if (i) o[h] = +c[i]; });
    rows.push(o);
  }
  return rows;
}

const am = acm('acm_monthly.csv'), ad = acm('acm_daily.csv');
const last = ad[ad.length - 1];
const pick = d => { const r = ad.find(x => x.d === d); if (!r) throw new Error('ACM daily: no ' + d); return r; };
const zeroAt = r => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => r3(r['ACMY' + String(n).padStart(2, '0')]));
const tpAt = r => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => r3(r['ACMTP' + String(n).padStart(2, '0')]));

/* 1. ACM 10-year decomposition, monthly (end of month), 1990-01 .. last month */
const amFrom = am.findIndex(r => r.d.startsWith('1990-01'));
const amS = am.slice(amFrom);
const acmM = { start: '1990-01', end: amS[amS.length - 1].d.slice(0, 7), y10: amS.map(r => r3(r.ACMY10)), tp10: amS.map(r => r3(r.ACMTP10)), y1: amS.map(r => r3(r.ACMY01)), tp1: amS.map(r => r3(r.ACMTP01)) };

/* 2. Kim–Wright 10-year term premium, monthly mean */
const kw = fred('THREEFYTP10');
const kwM = monthly(kw, '1990-01', last.d.slice(0, 7));

/* 3. zero curves (ACM fitted, continuously compounded, 1..10 y) and par curves (Treasury, via FRED) on dates */
const DATES = ['2021-12-31', '2023-06-30', last.d];
const curves = {};
const PAR = ['DGS3MO', 'DGS6MO', 'DGS1', 'DGS2', 'DGS3', 'DGS5', 'DGS7', 'DGS10', 'DGS20', 'DGS30'];
const parMat = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
const parS = Object.fromEntries(PAR.map(id => [id, new Map(fred(id))]));
for (const d of DATES) {
  const r = pick(d);
  curves[d] = { zero: zeroAt(r), tp: tpAt(r), par: PAR.map(id => { const v = parS[id].get(d); if (v == null) throw new Error(id + ' missing ' + d); return v; }) };
}

/* 4. curve-slope series, monthly mean, 2018-01 .. ; and daily inversion summary since 2019 */
const t3 = fred('T10Y3M'), t2 = fred('T10Y2Y');
const lastFredM = t2[t2.length - 1][0].slice(0, 7);
const slope = { start: '2000-01', s3m: monthly(t3, '2000-01', lastFredM).v, s2y: monthly(t2, '2000-01', lastFredM).v, end: lastFredM };
function runs(series, from) { // stretches of consecutive negative trading days, merged when a gap is < 30 trading days
  const s = series.filter(([d]) => d >= from); const out = [];
  let cur = null, pos = 0;
  for (const [d, v] of s) {
    if (v < 0) { if (!cur) cur = { first: d, last: d, min: v, minD: d, neg: 0 }; cur.last = d; cur.neg++; if (v < cur.min) { cur.min = v; cur.minD = d; } pos = 0; }
    else if (cur) { pos++; if (pos >= 30) { out.push(cur); cur = null; pos = 0; } }
  }
  if (cur) out.push(cur);
  return out;
}
const inv = { s3m: runs(t3, '2022-01-01'), s2y: runs(t2, '2022-01-01'), lastS3m: t3[t3.length - 1], lastS2y: t2[t2.length - 1] };

/* 5. PCA of monthly changes in ACM fitted zero yields 1..10 y, 1990-01 .. end */
function pca(rows) {
  const X = []; for (let i = 1; i < rows.length; i++) X.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => { const k = 'ACMY' + String(n).padStart(2, '0'); return rows[i][k] - rows[i - 1][k]; }));
  const n = X.length, p = 10, mu = Array(p).fill(0); X.forEach(x => x.forEach((v, j) => { mu[j] += v / n; }));
  const S = Array.from({ length: p }, () => Array(p).fill(0));
  X.forEach(x => { for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) S[a][b] += (x[a] - mu[a]) * (x[b] - mu[b]) / (n - 1); });
  // Jacobi eigenvalue iteration
  const A = S.map(r => r.slice()), V = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0; for (let a = 0; a < p; a++) for (let b = a + 1; b < p; b++) off += A[a][b] * A[a][b];
    if (off < 1e-20) break;
    for (let a = 0; a < p; a++) for (let b = a + 1; b < p; b++) {
      if (Math.abs(A[a][b]) < 1e-15) continue;
      const th = (A[b][b] - A[a][a]) / (2 * A[a][b]), tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
      for (let k = 0; k < p; k++) { const ak = A[a][k], bk = A[b][k]; A[a][k] = c * ak - s * bk; A[b][k] = s * ak + c * bk; }
      for (let k = 0; k < p; k++) { const ka = A[k][a], kb = A[k][b]; A[k][a] = c * ka - s * kb; A[k][b] = s * ka + c * kb; }
      for (let k = 0; k < p; k++) { const ka = V[k][a], kb = V[k][b]; V[k][a] = c * ka - s * kb; V[k][b] = s * ka + c * kb; }
    }
  }
  const ev = A.map((r, i) => [r[i], V.map(row => row[i])]).sort((x, y) => y[0] - x[0]);
  const tot = ev.reduce((s, e) => s + e[0], 0);
  return { months: n, from: rows[0].d.slice(0, 7), to: rows[rows.length - 1].d.slice(0, 7), share: ev.slice(0, 4).map(e => r3(e[0] / tot)),
    load: ev.slice(0, 3).map(e => { const sg = (e[1][9] + e[1][0]) < 0 && e === ev[0] ? -1 : 1; return e[1].map(v => r3(v * sg)); }) };
}
const pc = pca(amS);
// orient: level positive; slope rising with maturity; curvature positive in the middle
pc.load[0] = pc.load[0].map(v => (pc.load[0][4] < 0 ? -v : v));
pc.load[1] = pc.load[1].map(v => (pc.load[1][9] - pc.load[1][0] < 0 ? -v : v));
pc.load[2] = pc.load[2].map(v => (pc.load[2][4] < 0 ? -v : v));

/* 6. realised one-year excess return of the ACM 10-year zero over the 1-year zero (log, %), 1962-01 .. */
function excess(rows, fromY) {
  const idx = rows.findIndex(r => r.d.startsWith(fromY + '-01')); const xs = [];
  for (let i = idx; i + 12 < rows.length; i++) { const a = rows[i], b = rows[i + 12]; xs.push([a.d.slice(0, 7), 10 * a.ACMY10 - 9 * b.ACMY09 - a.ACMY01, a.ACMTP10]); }
  const mean = xs.reduce((s, x) => s + x[1], 0) / xs.length, tpm = xs.reduce((s, x) => s + x[2], 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x[1] - mean) ** 2, 0) / (xs.length - 1));
  return { from: xs[0][0], to: xs[xs.length - 1][0], n: xs.length, mean: r3(mean), sd: r3(sd), pos: r3(xs.filter(x => x[1] > 0).length / xs.length), tpMean: r3(tpm) };
}
const rx = { all: excess(am, 1962), since1990: excess(am, 1990), since2008: excess(am, 2008) };
// annual (January-start) series for the chart, 1962..
rx.seriesStart = 1962; rx.series = []; { const i0 = am.findIndex(r => r.d.startsWith('1962-01')); for (let i = i0; i + 12 < am.length; i += 12) { const a = am[i], b = am[i + 12]; rx.series.push(r2(10 * a.ACMY10 - 9 * b.ACMY09 - a.ACMY01)); } }

/* 7. ICE BofA option-adjusted spreads: latest and the 3-year range FRED serves */
const oas = {};
for (const [k, id] of [['hy', 'BAMLH0A0HYM2'], ['ig', 'BAMLC0A0CM'], ['bbb', 'BAMLC0A4CBBB'], ['bb', 'BAMLH0A1HYBB'], ['b', 'BAMLH0A2HYB'], ['ccc', 'BAMLH0A3HYC']]) {
  const s = fred(id); const lo = s.reduce((m, x) => (x[1] < m[1] ? x : m)), hi = s.reduce((m, x) => (x[1] > m[1] ? x : m));
  oas[k] = { d: s[s.length - 1][0], v: s[s.length - 1][1], from: s[0][0], min: lo, max: hi };
}

/* 8. S&P Global Ratings 2024 study (typed; see header) */
const spg = {
  src: 'S&P Global Ratings, 2024 Annual Global Corporate Default And Rating Transition Study, 27 Mar 2025, Tables 1 and 24',
  sgStart: 1981,
  sg: [0.63, 4.46, 2.96, 3.29, 4.34, 5.73, 2.82, 3.88, 4.70, 8.10, 11.02, 6.10, 2.50, 2.12, 3.54, 1.81, 2.01, 3.75, 5.63, 6.21, 9.70, 9.35, 4.97, 2.02, 1.50, 1.18, 0.91, 3.71, 9.89, 3.02, 1.85, 2.59, 2.23, 1.44, 2.77, 4.23, 2.47, 2.07, 2.55, 5.54, 1.68, 1.94, 3.71, 3.94],
  cum: { // average cumulative default rate (%), years 1, 5, 10
    AAA: [0.00, 0.34, 0.67], AA: [0.02, 0.28, 0.65], A: [0.05, 0.39, 1.03], BBB: [0.14, 1.36, 2.86],
    BB: [0.56, 5.75, 10.44], B: [2.93, 15.60, 22.02], CCC: [26.12, 46.53, 50.43], IG: [0.08, 0.77, 1.69], SG: [3.54, 13.64, 19.15] }
};

/* 9. ACM decomposition of the 10-year on a few dates (daily): yield = expected average short rate + term premium */
const kwD = new Map(kw);
const EV = ['2020-08-04', '2023-10-19', '2024-09-17', last.d];
const decomp = EV.map(d => { const r = pick(d); return { d, y10: r3(r.ACMY10), rn10: r3(r.ACMRNY10), tp10: r3(r.ACMTP10), dgs10: parS.DGS10.get(d), kw10: kwD.has(d) ? r3(kwD.get(d)) : null }; });

const D = { decomp, retrieved: '2026-11-25', last: last.d, acmM, kwM, curves, parMat, slope, inv, pca: pc, rx, oas, spg,
  acmLast: { d: last.d, y10: r3(last.ACMY10), tp10: r3(last.ACMTP10), y1: r3(last.ACMY01), tp1: r3(last.ACMTP01) },
  kwLast: kw[kw.length - 1] };
const js = '/* GENERATED by tools/make-data.cjs from FRED, the NY Fed ACM workbook and the S&P 2024 default study (retrieved ' + D.retrieved + '). Do not edit by hand. */\n' +
  '(function (root, d) { if (typeof module === "object" && module.exports) module.exports = d; else root.CurveData = d; }(typeof self !== "undefined" ? self : this, ' + JSON.stringify(D) + '));\n';
if (process.argv.includes('--check')) { const ok = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === js; console.log(ok ? 'data.js up to date' : 'data.js differs'); process.exit(ok ? 0 : 1); }
fs.writeFileSync(OUT, js);
console.log('wrote data.js', js.length, 'bytes');
