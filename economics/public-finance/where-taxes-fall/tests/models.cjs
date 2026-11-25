'use strict';
// Pins models.js against independent derivations (no prose exists yet; bindings come later).
// Run: node economics/public-finance/where-taxes-fall/tests/models.cjs
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
let n = 0, fails = 0;
const ok = (name, c, info) => { n++; if (!c) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } };
const near = (name, got, want, tol = 1e-9) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);

/* incidence: market clears, wedge = t, legal payer irrelevant */
for (const [ed, es, t] of [[0.5, 1.5, 10], [2, 0.3, 25], [0.8, 0.2, -10]]) {
  const a = M.incidence(ed, es, t, 'seller'), b = M.incidence(ed, es, t, 'buyer');
  near(`clears (${ed},${es},${t})`, M.qd(a.pb, ed), M.qs(a.ps, es));
  near('wedge = t', a.pb - a.ps, t);
  near('buyer share = es/(es+ed)', (a.pb - 100) / t, es / (es + ed));
  near('payer does not matter: pb', a.pb, b.pb); near('payer does not matter: ps', a.ps, b.ps);
  near('burdens add to revenue', a.buyerBurden + a.sellerBurden, a.rev);
}
{ const i = M.incidence(0.5, 1.5, 10); near('default pb 107.5', i.pb, 107.5); near('default q 96.25', i.q, 96.25); near('default dwl 18.75', i.dwl, 18.75); near('dwl ×4 at 2t', M.incidence(0.5, 1.5, 20).dwl / i.dwl, 4); }
{ const s = M.incidence(0.8, 0.2, -10); near('subsidy: sellers capture 80%', (s.ps - 100) / 10, 0.8); }
{ const l = M.incidence(0.5, 0, 10); near('fixed supply: sellers bear all', l.ps, 90); near('fixed supply: no loss', l.dwl, 0); }

/* revenue curve: peak at half the prohibitive tax, loss = revenue at two thirds (brute force) */
{
  const c = M.curve(0.5, 1.5, 0);
  let bt = 0, bR = -1; for (let t = 0; t <= c.tMax; t += 0.001) { const R = M.curve(0.5, 1.5, t).R; if (R > bR) { bR = R; bt = t; } }
  near('peak = tMax/2', bt, c.tPeak, 0.002); near('peak revenue', bR, c.Rpeak, 1e-3);
  const x = M.curve(0.5, 1.5, c.tCross); near('loss = revenue at 2/3 tMax', x.D, x.R, 1e-9);
  near('tMax 266.7', c.tMax, 800 / 3);
}

/* Ramsey: revenue met; optimum close to t_A/t_B = k_B/k_A; beats a uniform tax */
{
  const b = M.ramseyBest(), u = M.ramseyUniform();
  near('revenue met', b.r.tA * (100 - b.r.kA * b.r.tA) + b.r.tB * (100 - b.r.kB * b.r.tB), 1000, 1e-6);
  near('inverse-elasticity rule (small tax)', b.r.tA / b.r.tB, b.r.kB / b.r.kA, 0.05);
  ok('optimum beats uniform', b.dwl < u.dwl, `${b.dwl} vs ${u.dwl}`);
  near('uniform: equal taxes', u.tA, u.tB, 1e-9);
}

/* Laffer: numeric peak = 1/(1+ae); SSG example e = 0.5, a = 1.6: 55.6%, 43.1% lost at τ = 35%, MEB 76% */
for (const [e, a] of [[0.12, 1.6], [0.25, 1.6], [0.4, 1.6], [0.5, 1.6], [0.25, 1]]) {
  let bt = 0, bR = -1; for (let t = 0; t < 1; t += 1e-4) { const R = M.laffer(e, a, t).R; if (R > bR) { bR = R; bt = t; } }
  near(`peak (${e},${a})`, bt, 1 / (1 + a * e), 2e-4);
}
{ const L = M.laffer(0.5, 1.6, 0.35); near('SSG τ* 55.6%', L.star, 0.5556, 1e-4); near('SSG 43.1% lost', L.lost, 0.431, 5e-4); near('SSG MEB 0.76', L.meb, 0.757, 1e-3); }
{ let s = 0; const ae = 0.4, tau = 0.5; const m = 200000; for (let i = 0; i < m; i++) { const x = (i + 0.5) * tau / m; s += x * ae * Math.pow(1 - x, ae - 1) * tau / m; } near('excess burden integral', M.laffer(0.25, 1.6, 0.5).eb, s, 1e-5); }

/* IIT: quick deductions agree with the bracket sum; bonus notches */
for (const x of [0, 20000, 36000, 100000, 144000, 250000, 420000, 700000, 1500000]) near(`quick deduction ${x}`, M.iit(x + 60000).tax, M.bracketTax(M.IIT_YEAR, x), 1e-6);
{
  const N = M.bonusNotches();
  near('bonus 36,000 tax 1,080', N[0].before, 1080); near('bonus 36,001 tax 3,390.1', N[0].after, 3390.1, 1e-6);
  near('dead zone ends 38,566.67', N[0].end, 38566.6667, 1e-3); near('144,000 jump 13,200.2', N[1].jump, 13200.2, 1e-6); near('dead zone ends 160,500', N[1].end, 160500, 1e-6);
  near('benefit cliff: 603% implied', M.iit(95000, { benefit: { B: 6000, cut: 95000 } }).implied, 6.03, 1e-9);
}

/* VAT chain */
{
  near('VAT = rate × final value', M.vat('vat', 0.13).total, 13); near('retail sales tax same', M.vat('retail', 0.13).total, 13);
  near('turnover cascade', M.vat('turnover', 0.13).total, 0.13 * 30 + 0.13 * (33.9 + 30) + 0.13 * (33.9 + 30 + 0.13 * 63.9 + 40), 1e-9);
  near('exempt middle raises tax', M.vat('exMid', 0.13).total, 3.9 + 0.13 * 103.9, 1e-9);
  near('exempt last lowers tax', M.vat('exLast', 0.13).total, 7.8, 1e-9); near('exempt last price', M.vat('exLast', 0.13).final, 107.8, 1e-9);
}

/* price cap */
{
  const C = M.cap();
  near('year 0 shortage 9', C.path[0].shortage, 9); near('year 0 shadow 103', C.path[0].shadow, 103);
  near('year 10 stock', C.path[10].Q, 85 + 13.5 * Math.pow(0.7, 10)); near('long-run shadow 130', C.closed.shadow, 130);
  near('shadow clears demand', M.qd(C.path[10].shadow, 0.5), C.path[10].Q);
}

/* land: price drop = PV of taxes */
{ const L = M.land(0.03, 0.01, 0.6); near('drop 25%', L.drop, 0.25); near('drop = PV tax', 100 - L.P, L.pvTax); near('full pass-through 7→5', M.fullPass(0.07, 0.05), 1.05 / 1.07 - 1); }

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
