'use strict';
// Pins the page's models against closed forms and the prose numbers against the models.
// Run: node economics/money/what-makes-a-stablecoin-stable/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const Bd = require(path.join(DIR, 'bindings.cjs'))(M);
const zhMd = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
let n = 0, fails = 0;
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);
const X = M.FRONTIER;

/* normal cdf */
near('N(1.96)', M.cdf(1.96), 0.9750021048517795, 1e-12);

/* ch3: unit of account — closed forms */
{
  const u = M.unitOfAccount({ sigma: 0.5, days: 30, band: 0.05 }), s = 0.5 * Math.sqrt(30 / 365), a = Math.log(1.05);
  near('90% band low', u.lo, 100 * Math.exp(-1.6448536269514722 * s), 1e-9);
  near('reprices/yr = σ²/a²', u.perYear, 0.25 / (a * a), 1e-9);
  // Monte Carlo exit time of driftless BM from ±a (fine steps) ≈ a²/σ²
  const g = M.gaussian(M.rng(3)), dt = 1e-5; let tot = 0, N = 400;
  for (let i = 0; i < N; i++) { let x = 0, t = 0; while (Math.abs(x) < a) { x += 0.5 * Math.sqrt(dt) * g(); t += dt; } tot += t; }
  near('exit time MC ≈ a²/σ²', tot / N, a * a / 0.25, 0.15 * a * a / 0.25);
  ok('quarter σ → 1/4 reprices', Math.abs(M.unitOfAccount({ sigma: 0.25, days: 30, band: 0.05 }).perYear * 4 - u.perYear) < 1e-9);
}

/* ch4: peg */
{
  const D = { fee: 0.001, cap: 0.01, jump: 0.03 };
  const open = M.pegSim(D), shut = M.pegSim(Object.assign({}, D, { closed: true })), none = M.pegSim(Object.assign({}, D, { cap: 0 }));
  ok('closure deepens the dip', shut.minPrice < open.minPrice);
  ok('no arbitrage → most hours out of band', none.outShare > 0.5);
  // with ample capacity the price stays within the fee band except in the jump hour
  const big = M.pegSim({ fee: 0.002, cap: 1, jump: 0 });
  ok('ample capacity keeps price in band', big.maxDev <= 0.002 + 1e-12, big.maxDev);
  ok('identity p = 1 − (wish − absorbed)', open.price.every((p, i) => Math.abs(p - (1 - (open.wish[i] - open.absorbed[i]))) < 1e-12));
}

/* ch5: run — accounting and exact thresholds */
{
  for (const k in M.RUN_PRESETS) {
    const o = M.RUN_PRESETS[k], B = M.runBook(o);
    for (const R of [0, 0.1, 0.3, 0.5, 0.8]) {
      const s = B.at(R); if (s.dflt) continue;
      near(`conservation ${k} R=${R}`, R + s.left + s.fire + o.loss, 1 + o.buf, 1e-12);
    }
  }
  const h = M.RUN_PRESETS.hole;
  ok('buffer ≥ loss → calm', M.runModel(Object.assign({}, h, { buf: h.loss })).status === 'calm');
  ok('buffer < loss → run', M.runModel(Object.assign({}, h, { buf: h.loss - 0.01 })).status !== 'calm');
  near('hole V0', M.runModel(h).V0, (1 - h.loss - h.jumpy) / (1 - h.jumpy), 1e-12);
  ok('panic preset: run with no loss', M.runModel(M.RUN_PRESETS.panic).status === 'default');
  ok('genius preset calm', M.runModel(M.RUN_PRESETS.genius).status === 'calm');
  // same arithmetic as why-banks-run's Diamond–Dybvig payoffs (R = 1, s = 1 − h, no loss, no buffer), if present
  const F = path.join(DIR, '..', 'why-banks-run', 'models.js');
  if (fs.existsSync(F)) {
    try {
      const BR = require(F);
      if (BR.ddPayoffs) for (const w of [0.1, 0.3, 0.5]) {
        const o = { liq: 0.2, hair: 0.1, loss: 0, buf: 0 }, mine = M.runBook(o).at(w);
        const theirs = BR.ddPayoffs(w, { lam: 0.2, R: 1, s: 0.9, loss: 0, lolr: false });
        if (!mine.dflt && !theirs.failT1) near(`matches why-banks-run ddPayoffs w=${w}`, mine.V, theirs.wait, 1e-9);
      }
    } catch (e) { console.log('note: why-banks-run models not loadable:', e.message); }
  }
}

/* ch6: spiral — threshold and regimes */
{
  const D = { cover: 1.6, depth: 0.2, cap: 3, shock: 0.1, reserve: 0 };
  ok('threshold 1/d − 1', M.spiralThreshold(0.2) === 4);
  ok('below threshold spirals', M.spiral(D).halted != null);
  ok('above threshold stable', M.spiral(Object.assign({}, D, { cover: 4.5 })).halted == null);
  ok('deep market stable', M.spiral(Object.assign({}, D, { depth: 0.5 })).halted == null);
  ok('reserve 3 stops a 10% shock', M.spiral(Object.assign({}, D, { reserve: 3 })).halted == null);
  ok('reserve 3 does not stop a 30% shock', M.spiral(Object.assign({}, D, { reserve: 3, shock: 0.3 })).halted != null);
  // one swap mints exactly r/P tokens: supply after the first hour
  const P = Object.assign({}, M.SPIRAL, D), s = M.spiral(D), h1 = s.hours[1], r = P.U0 - h1.U;
  near('first-hour mint = r / P0', h1.S - P.cover * P.U0 / P.P0, r / P.P0, 1e-9);
  // small-swap direction: coverage change sign matches (1 + c − 1/d)
  for (const [c, d] of [[1.6, 0.2], [5, 0.2], [0.5, 0.9]]) {
    const U = 18, Mv = c * U, rr = 1e-4, c1 = Math.exp(-rr / (d * Mv)) * (Mv + rr) / (U - rr);
    ok(`direction c=${c} d=${d}`, Math.sign(c1 - c) === Math.sign(1 + c - 1 / d));
  }
}

/* ch7: issuer */
{
  const o = { eta: 20, delta: 0.5 }, i4 = M.issuer(Object.assign({ r: 0.04 }, o)), i2 = M.issuer(Object.assign({ r: 0.02 }, o));
  near('U(4%) = 100', i4.U, 100, 1e-12); near('profit(4%) = 1.4', i4.profit, 1.4, 1e-12);
  near('U(2%)', i2.U, 100 * Math.exp(0.4), 1e-9); near('profit(2%)', i2.profit, 100 * Math.exp(0.4) * 0.02 * 0.5 - 0.6, 1e-12);
  const best = M.bestRate(20), f = r => M.issuer(Object.assign({ r }, o)).profit;
  ok('profit peaks at 1/η', f(best) > f(best - 0.002) && f(best) > f(best + 0.002));
  near('break-even profit = 0', f(M.breakEven(o)), 0, 1e-9);
}

/* ch8: CBDC cap — E[min(D,c)] against Monte Carlo */
{
  const g = M.gaussian(M.rng(5)); let s = 0; const N = 200000, mu = Math.log(5000);
  for (let i = 0; i < N; i++) s += Math.min(Math.exp(mu + 1.4 * g()), 3000);
  near('E[min(D,3000)] MC', M.expMin(3000, 5000, 1.4), s / N, 15);
  ok('bank-liability kind drains nothing', M.cbdcCap({ cap: 3000, take: 1, kind: 'bank' }).drain === 0);
}

/* literal amounts in the zh prose (language-specific units, not bindings) */
{
  const lit = (name, str, want) => ok(`prose literal ${name}`, zhMd.includes(str) && want, str);
  lit('total 2,870 亿', '2,870 亿美元', Math.round(X.total * 10) === 2869 || Math.round(X.total / 10) * 100 === 2900);
  lit('UST 180 亿', '开始时 UST 有 180 亿美元', M.SPIRAL.U0 === 18);
  lit('cap 30 亿', '每天最多换 30 亿美元', true);
  const sp = M.spiral({ cover: 1.6, depth: 0.2, cap: 3, shock: 0.1, reserve: 0 });
  lit('left 120 亿', '还有 120 亿美元的 UST 没换走', Math.round(sp.U * 10) === 120);
  lit('circle 6.41 亿', '每季约 6.41 亿美元', Math.abs(X.circleAvg * X.circleRate / 100 / 4 - 0.641) < 0.001);
  lit('tether 18 亿', '一年少收约 18 亿美元', Math.round(X.tetherLiab * 0.01 * 10) === 18);
  const o = { eta: 20, delta: 0.5 }, i4 = M.issuer(Object.assign({ r: 0.04 }, o)), i2 = M.issuer(Object.assign({ r: 0.02 }, o));
  lit('ch7 paragraph', '一年利息 40 亿美元，分给渠道一半、减去 6 亿美元的固定成本，利润 14 亿美元', Math.round(i4.income * 10) === 40 && Math.round(i4.profit * 10) === 14 && M.ISSUER.cost === 0.6);
  lit('ch7 2%', '规模涨到 1,492 亿美元，利润却降到 8.9 亿美元', Math.round(i2.U * 10) === 1492 && Math.round(i2.profit * 100) === 89);
}

/* every binding is used in the zh source */
for (const k in Bd) ok(`binding used ${k}`, zhMd.includes(`{=${k}}`));

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
