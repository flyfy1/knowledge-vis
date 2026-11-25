'use strict';
// Wrap-up 2026-11-25: pins the model identities in models.js (no prose exists yet, so no prose numbers).
// Run: node economics/labour/where-wages-come-from/tests/models.cjs
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
let n = 0, fails = 0;
const near = (name, got, want, tol = 1e-6) => { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} vs ${want}`); } };
const ok = (name, c) => { n++; if (!c) { fails++; console.error('FAIL ' + name); } };

// ch1 Cobb–Douglas: w = MPL, share = 1 − α, doubling L / K
const c = M.cd;
near('cd wage default', c.wage(100, 100), 300, 1e-9);
near('cd wage 2L', c.wage(100, 200), 300 * Math.pow(2, -1 / 3), 1e-9);
near('cd wage 2K', c.wage(200, 100), 300 * Math.pow(2, 1 / 3), 1e-9);
near('cd share const', c.share(150, 70), 2 / 3, 1e-12);
near('cd wage = dY/dL', c.wage(100, 100), (c.Y(100, 100.0001) - c.Y(100, 99.9999)) / 0.0002, 1e-4);

// ch2–3 monopsony: markdown = 1/(1+ε); min wage regimes
const mo = M.mono;
for (const e of [1, 2, 5]) near(`markdown ε=${e}`, mo.monopsony(e).markdown, 1 / (1 + e), 1e-6);
const r2 = mo.monopsony(2);
ok('monopsony employs less than 100', r2.L < 100 && r2.w < 20);
ok('min wage between w_M and 20 raises employment (monopsony)', mo.withMin(19, 2, 'mono').E > r2.L);
ok('same min wage is non-binding in competitive market', mo.withMin(19, 2, 'comp').E === 100);
near('min wage above 20 lowers employment in both', mo.withMin(24, 2, 'comp').E, 80, 1e-9);
near('…monopsony too', mo.withMin(24, 2, 'mono').E, 80, 1e-9);

// ch4 Katz–Murphy: premium constant when supply growth = demand growth
near('race breakeven', M.race.end(3, 3, 3, 1.4).end, 0.5, 1e-9);

// ch5 bundle: inelastic demand never raises occupation employment; elastic can
near('bundle η=1 peak stays 1', M.bundle.peak(1).E, 1, 1e-9);
ok('bundle η=2 partial automation raises employment', M.bundle.peak(2).E > 1);
ok('bundle full automation → 0', M.bundle.E(1e-4, 2) === 0);

// ch6 task model: share = N − I, exact decomposition, derivative = marginal saving
const t = M.task, Mg = t.M.good;
const d = t.decompose(0.45, 1.05, Mg);
near('task share', d.s, 0.6, 1e-12);
near('task decomposition exact', Math.log(t.w(0.45, 1.05, Mg) / t.w(t.I0, t.N0, Mg)), d.total, 1e-12);
near('task ∂lnY/∂I = marginal saving', (t.lnY(0.4 + 1e-6, 1, Mg) - t.lnY(0.4 - 1e-6, 1, Mg)) / 2e-6, t.marginalSaving(0.4, 1, Mg), 1e-6);
near('task baseline margin saving 0.5', t.marginalSaving(0.4, 1, Mg), 0.5, 1e-9);
near('task I* zero saving', t.marginalSaving(t.Istar(1, Mg), 1, Mg), 0, 1e-9);

// ch7 bottleneck: σ = 1/2 equals scarcity-moves #c11 harmonic mean; cap 2.5
near('neck = harmonic mean', M.neck.Y(1e6, 0.5), 1 / (0.6 / 1e6 + 0.4), 1e-9);
near('neck cap', M.neck.cap(0.5), 2.5, 1e-12);
ok('neck slow share → 1', M.neck.slowShare(1e9, 0.5) > 0.9999);

// ch8 Baumol: η = 1 share constant; η < 1 rises
near('baumol η=1', M.baumol.share(2, 1, 80), 0.3, 1e-12);
ok('baumol η=0.5 rises', M.baumol.share(2, 0.5, 50) > 0.3);
near('baumol rel price', M.baumol.relPrice(2, 50), Math.E, 1e-12);

// ch9 CES share: σ>1 share falls with K while wage rises
ok('share falls σ=1.25', M.share.sL(2, 1.25) < 0.65 && M.share.wageRel(2, 1.25) > 1);
ok('share rises σ=0.6', M.share.sL(2, 0.6) > 0.65);
near('share σ=1 fixed', M.share.sL(3, 1), 0.65, 1e-12);

console.log(fails ? `${fails}/${n} FAILED` : `ok ${n} checks`);
process.exit(fails ? 1 : 0);
