'use strict';
// Pins the page's models against closed forms and independent re-derivations, then the prose bindings, the shipped
// data, the copy keys app.js uses and language hygiene. Run: node investment/rates/what-the-yield-curve-says/tests/models.cjs
// Optional: RAW=<dir of FRED / ACM CSVs> re-checks data.js point by point against the raw downloads.
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const Bd = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(DIR, '..', '..', '..', 'scripts', 'lib', 'prefill.cjs'));
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh'), D = M.DATA;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const md = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');

let n = 0, fails = 0;
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);
const eq = (name, got, want) => ok(name, got === want, `got ${got}, expected ${want}`);
const A = '2021-12-31', B = '2023-06-30', L = D.last;

/* 1. normal helpers */
near('ncdf(1.96)', M.ncdf(1.96), 0.9750021, 2e-7);
for (const p of [0.001, 0.02, 0.3, 0.5, 0.9, 0.999]) near('ninv∘ncdf ' + p, M.ncdf(M.ninv(p)), p, 1e-7);

/* 2. ch1: zero-coupon bundle */
for (const d of [A, B, L]) {
  const cv = M.realCurve(d);
  near('zero-coupon ytm = zero rate ' + d, M.bundle(cv, 10, 0).y, cv.z(10), 1e-9);
  const b = M.bundle(cv, 10, 0.06);
  let P = 0; for (let t = 1; t <= 10; t++) P += (6 + (t === 10 ? 100 : 0)) * Math.exp(-D.curves[d].zero[t - 1] / 100 * t);
  near('bundle price = Σ CF·e^(−z t) ' + d, b.P, P, 1e-9);
  near('ytm reprices ' + d, b.flows.reduce((s, f) => s + f.cf * Math.exp(-b.y * f.t), 0), P, 1e-7);
  near('weights sum to 1 ' + d, b.flows.reduce((s, f) => s + f.w, 0), 1, 1e-12);
}
ok('upward curve: coupon ytm below z10', M.bundle(M.realCurve(L), 10, 0.06).gap < 0);
ok('inverted curve: coupon ytm above z10', M.bundle(M.realCurve(B), 10, 0.06).gap > 0);

/* 3. ch2: forwards and the lock-in */
{
  const cv = M.realCurve(L), fw = M.forward(cv, 2, 5);
  near('forward from discount factors', fw.f, fw.check, 1e-12);
  // explicit cash flows: buy 1 face of 5y zero, short P5/P2 face of 2y zero → pay P5/P2 at 2, receive 1 at 5
  near('lock-in cost zero', 1 * fw.P2 - fw.units * fw.P1, 0, 1e-12);
  near('lock-in rate = f', Math.log(1 / fw.units) / 3, fw.f, 1e-12);
  const q = 0.055, arb = M.forwardArb(cv, 2, 5, q, 100);
  near('arbitrage profit explicit', arb.profit, 100 * Math.exp(q * 3) - 100 / fw.units, 1e-9);
  eq('arbitrage side', arb.side, 'lend');
  eq('no arbitrage at f', M.forwardArb(cv, 2, 5, fw.f, 100).profit, 0);
  const fc = M.fwdCurve(cv); let s = 0; fc.forEach((f, i) => { s += f; near('average of forwards = zero rate ' + (i + 1), s / (i + 1), cv.z(i + 1), 1e-12); });
}

/* 4. ch3: builder and its inverse */
{
  const P = M.PATHS.cuts.map(v => v / 100), b = M.build(P, 0.008);
  for (let k = 0; k < 10; k++) near('implied path with the same TP returns the path ' + k, M.impliedPath(b.y, 0.008)[k], P[k], 1e-12);
  const pB = M.impliedPath(b.y, -0.005), bB = M.build(pB, -0.005);
  for (let k = 0; k < 10; k++) near('other story rebuilds the same curve ' + k, bB.y[k], b.y[k], 1e-12);
  near('y10 = mean(path) + TP10', b.y[9], P.reduce((a, v) => a + v, 0) / 10 + 0.008, 1e-12);
  ok('cuts preset inverts', b.y[9] < b.y[0]); ok('hikes preset slopes up', M.build(M.PATHS.hikes.map(v => v / 100), 0.008).y[9] > 0.02);
}

/* 5. ch4: holding period */
for (const d of [A, B, L]) for (const nn of [2, 5, 10]) {
  const cv = M.realCurve(d);
  near(`forwards realised → return = 1y rate (${d}, ${nn})`, M.hold(cv, nn, 'fwd').ret, cv.z(1), 1e-12);
  near(`unchanged curve → return = forward (${d}, ${nn})`, M.hold(cv, nn, 'same').ret, M.forward(cv, nn - 1, nn).f, 1e-12);
  const be = M.hold(cv, nn, 'same').breakeven; near(`breakeven shift zeroes the excess (${d}, ${nn})`, M.hold(cv, nn, 'shift', be).excess, 0, 1e-12);
}
{ // excess return series against the ACM monthly file (January rows)
  const s = M.rxStats(1962); eq('rx years', s.n, 64); ok('rx mean positive', s.mean > 0);
}

/* 6. ch6: bond maths vs finite differences and the zero-coupon identity */
for (const [c, T, y] of [[0.04, 10, 0.04], [0.06, 30, 0.05], [0, 30, 0.04], [0.1, 2, 0.01]]) {
  const b = M.bond(c, T, y), h = 1e-5, up = M.bond(c, T, y + h).P, dn = M.bond(c, T, y - h).P;
  near(`modified duration = −P'/P (${c},${T})`, b.mod, -(up - dn) / (2 * h) / b.P, 1e-5);
  near(`convexity = P''/P (${c},${T})`, b.conv, (up - 2 * b.P + dn) / (h * h) / b.P, 2e-2);
}
near('par bond prices at 100', M.bond(0.04, 10, 0.04).P, 100, 1e-9);
near('zero coupon Macaulay = maturity', M.bond(0, 30, 0.04).mac, 30, 1e-12);
{ const s = M.shock(0.04, 30, 0.04, 0.03); ok('duration overstates the fall', s.dur < s.exact); ok('convexity correction helps', Math.abs(s.errDC) < Math.abs(s.errDur)); }

/* 7. ch7: immunisation */
{
  const pf = M.immunise(7, 100, 2, 15, 0.045), dur = pf.barbell.reduce((s, l) => s + l.pv * l.t, 0) / pf.PVL;
  near('barbell duration = 7', dur, 7, 1e-12); near('barbell PV = liability PV', pf.barbell[0].pv + pf.barbell[1].pv, pf.PVL, 1e-9);
  near('no move → no surplus', M.surplus(pf, 7, 0.045, 0, 0).barbell, 0, 1e-12);
  for (const d of [-0.02, -0.005, 0.005, 0.02]) { const s = M.surplus(pf, 7, 0.045, d, 0); near('bullet immune ' + d, s.bullet, 0, 1e-9); ok('barbell gains on a parallel move ' + d, s.barbell > 0);
    const s2 = M.surplus(pf, 7, 0.045, -d, 0); near('even part = ½·PV·M²·Δ² to fourth order ' + d, (s.barbell + s2.barbell) / 2, 0.5 * pf.PVL * M.dispersion(pf.barbell, 7) * d * d, 0.03 * 0.5 * pf.PVL * M.dispersion(pf.barbell, 7) * d * d); }
  ok('steepening twist hurts the barbell', M.surplus(pf, 7, 0.045, 0, 0.01).barbell < 0);
}

/* 8. ch8: Nelson–Siegel recovers known betas; PCA */
{
  const bt = [5, -2, 1.5], ys = D.parMat.map(t => M.ns(bt, t)), f = M.nsFit(D.parMat, ys);
  bt.forEach((v, i) => near('NS recovers β' + i, f.b[i], v, 1e-9)); near('NS exact fit rmse 0', f.rmse, 0, 1e-9);
  const sh = D.pca.share; ok('PCA shares descending', sh[0] > sh[1] && sh[1] > sh[2]); ok('PCA shares ≤ 1', sh.reduce((a, b) => a + b, 0) <= 1.0001);
  const L0 = D.pca.load; for (let i = 0; i < 3; i++) near('loading unit length ' + i, Math.sqrt(L0[i].reduce((a, v) => a + v * v, 0)), 1, 2e-3);
}

/* 9. ch9: split adds up and matches the ACM file */
for (let i = 0; i < D.acmM.y10.length; i += 37) { const s = M.split(i); near('split adds up ' + i, s.exp + s.tp, s.s, 1e-12); }

/* 10. ch10: credit */
{
  near('no default → no spread', M.risky(0.045, 5, 0, 0.4).s, 0, 1e-12);
  near('zero recovery: spread = −ln(1−q)', M.risky(0.045, 5, 0.03, 0).s, -Math.log(0.97), 1e-12);
  const c = M.credit({ r: 0.045, T: 5, p: 0.02, R: 0.4, k: 1 }); near('k=1: no premium', c.prem, 0, 1e-12);
  ok('triangle close to exact', Math.abs(c.s - c.tri) < 0.002);
  near('5y cumulative ↔ annual', 1 - Math.pow(1 - M.annualFromCum(0.0575, 5), 5), 0.0575, 1e-12);
}

/* 11. ch11: Vasicek */
{
  const xs = M.vasicekSim({ N: 1000, p: 0.039, rho: 0, years: 2000, seed: 20261125 }), s = M.stats(xs);
  near('ρ=0 mean ≈ p', s.mean, 0.039, 0.002); near('ρ=0 sd ≈ binomial', s.sd, Math.sqrt(0.039 * 0.961 / 1000), 0.0008);
  const x1 = M.vasicekSim({ N: 1000, p: 0.039, rho: 0.1, years: 2000, seed: 20261125 }), s1 = M.stats(x1);
  near('ρ=0.1 99th pct ≈ closed form', s1.q99, M.vasicekQ(0.039, 0.1, 0.99), 0.025);
  near('S&P speculative-grade mean', M.stats(D.spg.sg).mean, 3.8832, 0.001); eq('S&P years', D.spg.sg.length, 44);
  eq('S&P 1991', D.spg.sg[1991 - 1981], 11.02); eq('S&P 2009', D.spg.sg[2009 - 1981], 9.89);
}

/* 12. prose bindings that have an independent derivation */
{
  const b = Bd;
  eq('ch6.mac', b['ch6.mac'], '8.44'); eq('ch6.ex1', b['ch6.ex1'], '−7.72');
  eq('ch2.f', b['ch2.f'], ((M.realCurve(L).z(5) * 5 - M.realCurve(L).z(2) * 2) / 3 * 100).toFixed(2) + '%');
  eq('ch12.dy = dy of decomposition', b['ch12.dy'], M.signed(D.decomp[3].y10 - D.decomp[2].y10, 2));
  near('decomp adds up (latest)', D.decomp[3].rn10 + D.decomp[3].tp10, D.decomp[3].y10, 0.002);
  eq('ch8.p1', b['ch8.p1'], (D.pca.share[0] * 100).toFixed(1) + '%');
  eq('ch10.c5BBB', b['ch10.c5BBB'], '1.36%');
}

/* 13. literal numbers in the prose that are not bindings: dates of the essay's facts and the S&P table */
{
  const lit = ['STRIPS', '0.34%', '46.53%', '9.89%', '1,250', '970', '280', '1.68%', '1.94%', '3.71%', '1.37 年', '5.25%', '3%', '4.5%', '60%', '3.6%', '3.9%', '101%', '120%'];
  lit.forEach(s => ok('literal in prose: ' + s, md.includes(s)));
  if (process.env.RAW) { // literal market facts in the prose, against the raw downloads
    const rd = id => Object.fromEntries(fs.readFileSync(path.join(process.env.RAW, id + '.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(',')));
    const g10 = rd('DGS10'), ft = rd('DFEDTARU');
    eq('DGS10 2021-12-31', g10['2021-12-31'], '1.52'); eq('DGS10 2022-10-24', g10['2022-10-24'], '4.25');
    eq('target cut', ft['2024-09-18'] + '→' + ft['2024-09-19'], '5.50→5.00');
    const acm = fs.readFileSync(path.join(process.env.RAW, 'acm_daily.csv'), 'utf8').trim().split(/\r?\n/).slice(1).map(l => l.split(','));
    const mn = acm.reduce((m, r) => (+r[20] < +m[20] ? r : m)); eq('ACM daily TP10 minimum', mn[0] + ' ' + (+mn[20]).toFixed(2), '09-Mar-2020 -1.66');
  }
  if (process.env.RAW) {
    const rd = id => Object.fromEntries(fs.readFileSync(path.join(process.env.RAW, id + '.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(',')));
    for (const [id, a, b] of [['DGS3MO', '4.95', '4.37'], ['DGS2', '3.59', '4.63'], ['DGS30', '3.96', '5.29']]) { const s = rd(id); eq(id + ' 2024-09-17 / 2026-11-23', s['2024-09-17'] + '/' + s['2026-11-23'], a + '/' + b); }
    const ft = rd('DFEDTARU'); eq('policy path', ['2023-07-27', '2025-12-11', '2026-09-17'].map(d => ft[d]).join(','), '5.50,3.75,4.00');
    eq('rate before 2026-09-17', ft['2026-09-16'], '3.75');
    const ri = rd('DFII10'), be = rd('T10YIE'); // ch12 e3b real yield / breakeven (reviewer, 2026-11-25)
    eq('DFII10 2024-09-17 / 2026-11-23', ri['2024-09-17'] + '/' + ri['2026-11-23'], '1.53/2.79');
    eq('T10YIE 2024-09-17 / 2026-11-23', be['2024-09-17'] + '/' + be['2026-11-23'], '2.12/2.13');
    const t3 = fs.readFileSync(path.join(process.env.RAW, 'T10Y3M.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(',')).filter(r => r[1] !== '');
    eq('T10Y3M starts 1982', t3[0][0].slice(0, 4), '1982'); const mn = t3.reduce((m, r) => (+r[1] < +m[1] ? r : m)); eq('T10Y3M all-time min', mn[0] + ' ' + mn[1], '2023-05-04 -1.89');
    eq('T10Y3M 2006-07-17 negative, 2007-05-29 negative', [t3.find(r => r[0] === '2006-07-17')[1] < 0, t3.find(r => r[0] === '2007-05-29')[1] < 0].join(), 'true,true');
  }
  ['1.52%', '4.25%', '−1.66', '5.50%', '5.00%', '4.95%', '4.37%', '3.59%', '4.63%', '3.96%', '5.29%', '3.75%', '4.00%', '−0.64', '1.53%', '2.79%', '2.12%', '2.13%', 'AA 0.28%', '1.27 个百分点'].forEach(s => ok('literal in prose: ' + s, md.includes(s)));
  eq('S&P SG 2021/2022/2023', [2021, 2022, 2023].map(y => D.spg.sg[y - 1981]).join(), '1.68,1.94,3.71');
  ok('dt.c label = data date', /dt\.c: (\S+)/.exec(md)[1] === D.last);
  eq('S&P AAA 5y', D.spg.cum.AAA[1], 0.34); eq('S&P CCC 5y', D.spg.cum.CCC[1], 46.53);
  eq('S&P AA / A / BBB 5y', [D.spg.cum.AA[1], D.spg.cum.A[1], D.spg.cum.BBB[1]].join(), '0.28,0.39,1.36');
  eq('10y rise 2024-09-17 → 2026-11-23 = real + breakeven', (4.92 - 3.65).toFixed(2) + '=' + ((2.79 - 1.53) + (2.13 - 2.12)).toFixed(2), '1.27=1.27');
  eq('10y par on both dates matches ch12 bindings', Bd['ch12.g0'] + '/' + Bd['ch12.g1'], '3.65%/4.92%');
  near('NS λ', M.LAMBDA, 1 / (0.0609 * 12), 0.01);
  eq('refunding', JSON.stringify(M.FRONTIER.refunding), JSON.stringify({ d: '2026-11-04', offer: 125, refund: 97, newCash: 28 }));
}

/* 14. copy keys used by app.js exist; language hygiene */
{
  const keys = new Set(Object.keys(Z)), used = [...app.matchAll(/\bt\('([a-z][\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  used.forEach(k => ok('copy key ' + k, keys.has(k)));
  const pj = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  for (const [pre, vals] of Object.entries(pj.dynamicKeys)) vals.forEach(v => ok('dynamic key ' + pre + '.' + v, keys.has(pre + '.' + v)));
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  ok('no CJK in app.js', !CJK.test(app.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')));
  ok('no CJK in models.js', !CJK.test(fs.readFileSync(path.join(DIR, 'models.js'), 'utf8')));
  // registered 2026-11-25: the provenance label rendered from page-provenance.json is bilingual by design
  ok('page.json registry fields', ['category', 'subtopic', 'stage', 'status', 'path'].map(k => pj[k]).join() === 'investment,rates,university,live,investment/rates/what-the-yield-curve-says/');
  ok('exactly one provenance label', (html.match(/<details class="page-provenance"/g) || []).length === 1);
  const raw = unprefill(html, Z).replace(/<!--[\s\S]*?-->/g, '').replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
  const left = raw.match(new RegExp('[^<>]*' + CJK.source + '[^<>]*', 'g')) || [];
  ok('no CJK in index.html beyond pre-fill and the 中 toggle', left.every(s => s.trim() === '中' || s.includes(Z['doc.title']) || s.includes(Z['doc.desc']) || /provenance|开发版本/.test(s)), left.slice(0, 3).join(' | '));
  ok('no unresolved binding', !Object.values(Z).some(v => /\{=/.test(v)));
  ok('not investment advice is stated', /不构成任何投资建议/.test(md));
}

/* 15. optional: data.js against the raw downloads */
if (process.env.RAW) {
  const fred = id => new Map(fs.readFileSync(path.join(process.env.RAW, id + '.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(',')).filter(r => r[1] !== '').map(r => [r[0], +r[1]]));
  const d10 = fred('DGS10'); for (const d of [A, B, L]) near('DGS10 ' + d, D.curves[d].par[7], d10.get(d), 1e-9);
  const hy = fred('BAMLH0A0HYM2'); near('HY OAS latest', D.oas.hy.v, hy.get(D.oas.hy.d), 1e-9);
  const t3 = fred('T10Y3M'); ok('10y−3m negative on first inversion day', t3.get(D.inv.s3m[0].first) < 0);
}

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
