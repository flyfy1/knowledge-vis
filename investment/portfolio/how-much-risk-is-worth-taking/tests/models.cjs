'use strict';
// Pins the models against closed forms and independent re-derivations, plus the numbers written directly into the
// prose (laws). Run: node investment/portfolio/how-much-risk-is-worth-taking/tests/models.cjs
const path = require('path'), fs = require('fs');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const md = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
let n = 0, fails = 0;
const ok = (name, c, info) => { n++; if (!c) { fails++; console.error('FAIL ' + name + (info != null ? ': ' + info : '')); } };
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);
const A = M.ASSETS, S = M.covFrom(A.sig, A.rho);

/* ch1: risk floor, closed form against a brute-force wᵀΣw */
for (const [N, r] of [[1, 0.3], [10, 0.3], [50, 0.1]]) {
  const Sg = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0.04 : r * 0.04))), w = Array(N).fill(1 / N);
  near(`floor N=${N}`, M.floor1(N, 0.2, r).var, M.quad(w, Sg), 1e-12);
}
near('floor value', M.floor1(1e6, 0.2, 0.3).vol, Math.sqrt(0.3) * 0.2, 1e-6);

/* ch2: frontier closed form = constrained minimum; no-short solution feasible and never below unconstrained */
const U = M.frontierU(A.mu, S);
for (const m of [0.05, 0.06, 0.07]) {
  const w = U.w(m); near('sum w ' + m, M.sum(w), 1, 1e-12); near('mean ' + m, M.dot(w, A.mu), m, 1e-12);
  near('vol ' + m, Math.sqrt(M.quad(w, S)), U.vol(m), 1e-12);
  const ns = M.minVarNS(A.mu, S, m); ok('ns feasible ' + m, ns.w.every(x => x >= 0) && Math.abs(M.sum(ns.w) - 1) < 1e-9);
  ok('ns >= u ' + m, ns.vol >= U.vol(m) - 1e-12);
  // random feasible portfolios with the same mean never beat it
  const R = M.rng(9); for (let k = 0; k < 2000; k++) { const v = A.mu.map(() => R()), t = M.sum(v), q = v.map(x => x / t); if (Math.abs(M.dot(q, A.mu) - m) < 1e-3) { const at = M.minVarNS(A.mu, S, M.dot(q, A.mu)); ok('ns optimal ' + m, Math.sqrt(M.quad(q, S)) >= at.vol - 1e-12); } }
}

/* ch3: tangency maximises Sharpe; CML; ch5: CAPM identity inside the model */
const T = M.tangencyU(A.mu, S, A.rf);
near('tangency Sharpe = sqrt(ex Σ⁻¹ ex)', T.sr, T.srMax, 1e-12);
{ const R = M.rng(3); for (let k = 0; k < 3000; k++) { const w = A.mu.map(() => R() * 2 - 0.5), t = M.sum(w); if (Math.abs(t) < 0.1) continue; const q = w.map(x => x / t), sr = (M.dot(q, A.mu) - A.rf) / Math.sqrt(M.quad(q, S)); ok('no portfolio beats tangency', sr <= T.sr + 1e-9); } }
const be = M.betas(A.mu, S, T.w); be.forEach((b, i) => near('SML ' + i, A.mu[i] - A.rf, b * (T.m - A.rf), 1e-12));
near('beta of tangency = 1', M.dot(be, T.w), 1, 1e-12);

/* ch4: Lo SE and the law's numbers (−0.16, 1.16, 0.59) */
near('Lo SE', M.sharpeSE(0.5, 10), Math.sqrt(1.125 / 10), 1e-12);
ok('law −0.16', B['ch4.lo'] === '−0.16'); ok('law 1.16', B['ch4.hi'] === '1.16'); ok('law 0.59', B['ch4.k20sim'] === '0.59' && B['ch4.k20'] === '0.59');
near('E max of 2 normals = 1/√π', M.expMaxNormal(2), 1 / Math.sqrt(Math.PI), 1e-4);
{ const r = M.sharpeTrials(0.5, 10, 1, 4000, 21), m = M.sum(r) / r.length, sd = Math.sqrt(M.sum(r.map(x => (x - m) ** 2)) / r.length); near('sim SE ≈ Lo', sd, M.sharpeSE(0.5, 10), 0.02); }

/* ch6: SE of the mean (law: about ±5 points for σ = 16 %, 10 years) */
near('se 16%/√10', 0.16 / Math.sqrt(10), 0.0506, 1e-4);
{ const e = M.resample(A, 10, 200, 7, false); ok('estimated < optimal', e.srMean < e.srOpt); ok('1/N close to optimal', e.srEq > e.srMean); }

/* ch7: ±50 % = 75; drag formula; sim agrees with theory */
near('updown', M.updown(0.5, -0.5), 0.75, 1e-12);
near('g1', M.growthL(0.07, 0.18, 0.03, 1), 0.07 - 0.0162, 1e-12);
{ const p = M.pathsL(0.07, 0.18, 0.03, 1, 10, 3000, 1); near('sim median ≈ e^{gT}', Math.log(p.med) / 10, M.growthL(0.07, 0.18, 0.03, 1), 0.006); near('sim mean ≈ e^{μT}', Math.log(p.mean) / 10, 0.07, 0.004); }

/* ch8: diversification return; law numbers 5 %, 6 % */
near('div return ρ=0', M.divReturn([0.5, 0.5], [0.2, 0.2], 0).dr, 0.01, 1e-12);
near('single growth 5%', 0.07 - 0.02, 0.05, 1e-12);

/* ch9: Kelly vertex, g(2f*) = r, half Kelly gets 75 %; coin f* = 2p − 1 */
const fs_ = M.kellyF(0.07, 0.03, 0.18);
near('f* ≈ 123 %', fs_, 1.2346, 1e-4); near('g(2f*) = r', M.gK(2 * fs_, 0.07, 0.03, 0.18), 0.03, 1e-12);
near('half Kelly 75 %', (M.gK(fs_ / 2, 0.07, 0.03, 0.18) - 0.03) / (M.gK(fs_, 0.07, 0.03, 0.18) - 0.03), 0.75, 1e-12);
{ let best = 0, bg = -1; for (let f = 0; f <= 0.99; f += 0.001) { const g = M.coinG(f, 0.6); if (g > bg) { bg = g; best = f; } } near('coin f*', best, 0.2, 0.0015); }
ok('coin 2f* negative', M.coinG(0.4, 0.6) < 0);

/* every {=binding} in the prose is defined */
for (const m of md.matchAll(/\{=([\w.]+)\}/g)) ok('binding ' + m[1], B[m[1]] != null);

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
