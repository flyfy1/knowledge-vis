'use strict';
// Pins the page's models against textbook examples and against each other:
//   the normal CDF against quadrature; cost of carry and its arbitrage by explicit cash flows; put–call parity;
//   the one-step binomial against Hull's example; the CRR tree against Hull's American put and against Black–Scholes
//   (convergence); Black–Scholes against Hull's example, its Greeks against numerical derivatives; the PDE (Crank–
//   Nicolson, second order; explicit, stable only above its step bound) against the formula; geometric Brownian motion
//   moments; delta hedging: zero mean when realised = priced volatility, spread ∝ 1/√n (Kamal & Derman), mean equal to
//   the premium difference otherwise (two derivations); the shipped smile (parity residuals, Cboe's own implied
//   volatilities); the shipped return histogram (internal consistency, tails); Heston: characteristic function against
//   Broadie & Kaya's reference value and the Black–Scholes limit, Monte Carlo against the characteristic function;
//   margin, netting and the minimum-variance hedge on closed forms.
// Then: every number the prose binds ({=…}) that has an independent derivation; the literal amounts and dates of the
// prose against FRONTIER; numbers drawn on diagrams; copy keys used by app.js; language hygiene; the registry.
// Seeded simulations: when a statistical check is tight, raise the number of paths, never the tolerance.
// Run: node investment/derivatives/a-fair-price-for-a-bet/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const Bd = require(path.join(DIR, 'bindings.cjs'))(M);
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const fig = n => fs.readFileSync(path.join(DIR, 'figures', n), 'utf8');
const allZ = Object.values(Z).join('\n');
const { EX, FRONTIER: X, DATA } = M, B = EX.base;
const f = (x, d) => M.fmt(x, d, 'en');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);

/* ── 1. normal distribution ── */
{
  const simpson = (a, b, m) => { let s = 0; const h = (b - a) / m; for (let i = 0; i <= m; i++) s += (i === 0 || i === m ? 1 : i % 2 ? 4 : 2) * M.pdf(a + i * h); return s * h / 3; };
  for (const x of [-6, -3.2, -1.96, -0.5, 0, 0.3, 1, 1.96, 2.5, 4]) near('cdf(' + x + ') = ∫pdf', M.cdf(x), simpson(-12, x, 20000), 1e-12);
  near('N(1.96)', M.cdf(1.96), 0.9750021048517795, 1e-13);
  ok('about two thirds within one sd', M.cdf(1) - M.cdf(-1) > 0.66 && M.cdf(1) - M.cdf(-1) < 0.70);
}

/* ── 2. forwards: the arbitrage by explicit cash flows, at three terminal prices ── */
{
  near('F = S·e^{rT}', M.forward(100, 0.04, 0, 1), 100 * Math.exp(0.04), 1e-12);
  for (const [r, q, T, Fq] of [[0.04, 0, 1, 110], [0.04, 0, 1, 95], [0.06, 0.02, 2.5, 120], [0.01, 0.05, 0.75, 99]]) {
    const a = M.forwardArb(100, r, q, T, Fq), res = [];
    for (const ST of [30, 100, 260]) {
      // hold e^{−qT} units, income reinvested → 1 unit at T
      const units = Math.exp(-q * T), loan = 100 * units;
      const carry = (Fq - ST) + ST - loan * Math.exp(r * T);        // short forward + deliver the unit + repay
      const reverse = (ST - Fq) - ST + loan * Math.exp(r * T);      // long forward + return the borrowed unit + deposit
      res.push(Fq > a.fair ? carry : reverse);
    }
    ok(`arbitrage profit independent of S_T (${Fq})`, Math.abs(res[0] - res[1]) < 1e-9 && Math.abs(res[1] - res[2]) < 1e-9);
    near(`arbitrage profit = |quote − fair| (${Fq})`, res[0], a.profit, 1e-9);
    check(`kind (${Fq})`, a.kind, Fq > a.fair ? 'carry' : 'reverse');
  }
  check('no arbitrage at the fair price', M.forwardArb(100, 0.04, 0, 1, M.forward(100, 0.04, 0, 1)).kind, 'none');
  ok('carry negative → forward below spot', M.forward(100, 0.02, 0.05, 1) < 100);
}

/* ── 3. payoffs and parity ── */
{
  for (const K of [70, 100, 130]) for (let S = 0; S <= 300; S += 7) {
    near(`stock+put = call+bond = max(S,K) (K=${K}, S=${S})`, M.payoff(M.strat('protect', K), S), M.payoff(M.strat('fiduciary', K), S), 1e-12);
    near('… = max(S, K)', M.payoff(M.strat('protect', K), S), Math.max(S, K), 1e-12);
    near('call − put = forward', M.payoff(M.strat('synth', K), S), S - K, 1e-12);
  }
  const r = M.rng(11);
  for (let i = 0; i < 200; i++) {
    const o = { S: 50 + 100 * r(), K: 50 + 100 * r(), r: 0.1 * r(), q: 0.05 * r(), sigma: 0.05 + 0.6 * r(), T: 0.05 + 3 * r() };
    const C = M.bs(o).price, P = M.bs(Object.assign({ type: 'put' }, o)).price;
    near('parity under Black–Scholes #' + i, M.parityGap(C, P, o.S, o.K, o.r, o.q, o.T), 0, 1e-10);
  }
  near('legsValue: protect = fiduciary', M.legsValue(M.strat('protect', 100), 100, 0.04, 0, 0.2, 1), M.legsValue(M.strat('fiduciary', 100), 100, 0.04, 0, 0.2, 1), 1e-10);
  check('parityArb: a put quoted above parity is rich', M.parityArb(9.93, 7, 100, 100, 0.04, 0, 1).kind, 'putRich');
}

/* ── 4. one step (Hull, Options, Futures, and Other Derivatives, ch. 13: S=20, 22 or 18, K=21, r=12%, 3 months) ── */
{
  const h = M.oneStep({ S: 20, u: 1.1, d: 0.9, r: 0.12, T: 0.25, K: 21, type: 'call' });
  near('Hull Δ = 0.25', h.delta, 0.25, 1e-12); check('Hull price 0.633', h.price.toFixed(3), '0.633'); check('Hull p = 0.6523', h.q.toFixed(4), '0.6523');
  const o = M.oneStep(EX.one);
  near('replicates up', o.delta * o.Su + o.B * o.R, o.fu, 1e-12); near('replicates down', o.delta * o.Sd + o.B * o.R, o.fd, 1e-12);
  near('repayment is 40', -o.B * o.R, 40, 1e-12); near('Δ is one half', o.delta, 0.5, 1e-12);
  near('price by q = replication cost', o.viaQ, o.price, 1e-12); near('naive(q) = price', o.naive(o.q), o.price, 1e-12);
  ok('naive price moves with p, replication does not', o.naive(0.8) > o.price && o.naive(0.3) < o.price);
  near('under q the stock earns the riskless rate', 1 + o.stockReturn(o.q), o.R, 1e-12);
}

/* ── 5. the CRR tree ── */
{
  // Hull ch. 21 example: American put, S=50, K=50, r=10%, σ=40%, 5 months, 5 steps → 4.49
  check('Hull American put, 5 steps', M.crr({ S: 50, K: 50, r: 0.1, sigma: 0.4, T: 5 / 12, N: 5, type: 'put', american: true }).price.toFixed(2), '4.49');
  const bsC = M.bs(B).price, err = N => Math.abs(M.crr(Object.assign({}, B, { N })).price - bsC);
  ok('tree → Black–Scholes: N=50', err(50) < 0.05, err(50)); ok('N=500', err(500) < 0.005, err(500)); ok('N=2000', err(2000) < 0.0013, err(2000));
  for (const N of [50, 100, 200, 400]) { const k = err(2 * N) / err(N); ok(`doubling the steps roughly halves the gap (N=${N})`, k > 0.45 && k < 0.55, k); }
  for (const N of [1, 3, 10, 77]) { const c = M.crr(Object.assign({}, B, { N })).price, p = M.crr(Object.assign({}, B, { N, type: 'put' })).price; near(`parity on the tree (N=${N})`, c - p, 100 - 100 * Math.exp(-0.04), 1e-10); }
  near('American call without dividends = European', M.crr(Object.assign({}, B, { N: 200, american: true })).price, M.crr(Object.assign({}, B, { N: 200 })).price, 1e-12);
  ok('American put > European put', M.crr(Object.assign({}, B, { N: 200, type: 'put', american: true })).price > M.crr(Object.assign({}, B, { N: 200, type: 'put' })).price + 0.2);
  ok('with dividends an American call is worth more', M.crr(Object.assign({}, B, { N: 200, q: 0.08, american: true })).price > M.crr(Object.assign({}, B, { N: 200, q: 0.08 })).price + 0.05);
  // the three-step tree on the diagram, by an independent backward induction
  const dt = 1 / 3, u = Math.exp(0.2 * Math.sqrt(dt)), d = 1 / u, q = (Math.exp(0.04 * dt) - d) / (u - d), disc = Math.exp(-0.04 * dt);
  let lv = [0, 1, 2, 3].map(j => Math.max(100 * Math.pow(u, 2 * j - 3) - 100, 0)); const svg = fig('dg-tree.html'); let shown = 0;
  for (let i = 3; i >= 0; i--) {
    for (let j = 0; j <= i; j++) { for (const v of [100 * Math.pow(u, 2 * j - i), lv[j]]) { ok(`tree diagram shows ${f(v, 2)}`, svg.includes('>' + f(v, 2) + '</text>')); shown++; } }
    if (i > 0) lv = Array.from({ length: i }, (_, j) => disc * (q * lv[j + 1] + (1 - q) * lv[j]));
  }
  check('twenty numbers on the tree', shown, 20); check('its root is the 3-step price', f(lv[0], 2), Bd['ch4.n3']);
}

/* ── 6. Black–Scholes and the Greeks ── */
{
  // Hull ch. 15: S=42, K=40, r=10%, σ=20%, 6 months → c = 4.76, p = 0.81
  check('Hull call 4.76', M.bs({ S: 42, K: 40, r: 0.1, sigma: 0.2, T: 0.5 }).price.toFixed(2), '4.76');
  check('Hull put 0.81', M.bs({ S: 42, K: 40, r: 0.1, sigma: 0.2, T: 0.5, type: 'put' }).price.toFixed(2), '0.81');
  const r = M.rng(5);
  for (let i = 0; i < 60; i++) {
    const o = { S: 60 + 80 * r(), K: 60 + 80 * r(), r: 0.08 * r(), q: 0.04 * r(), sigma: 0.1 + 0.5 * r(), T: 0.1 + 2 * r(), type: i % 2 ? 'put' : 'call' };
    const g = M.bs(o), p = (k, x) => M.bs(Object.assign({}, o, { [k]: x })).price, h = 1e-3;
    near('delta #' + i, g.delta, (p('S', o.S + h) - p('S', o.S - h)) / (2 * h), 1e-6);
    near('gamma #' + i, g.gamma, (p('S', o.S + 0.05) - 2 * g.price + p('S', o.S - 0.05)) / 0.0025, 1e-5);
    near('vega #' + i, g.vega, (p('sigma', o.sigma + 1e-4) - p('sigma', o.sigma - 1e-4)) / 2e-4, 1e-5);
    near('theta #' + i, g.theta, -(p('T', o.T + 1e-4) - p('T', o.T - 1e-4)) / 2e-4, 1e-5);
    near('rho #' + i, g.rho, (p('r', o.r + 1e-5) - p('r', o.r - 1e-5)) / 2e-5, 1e-4);
    near('implied volatility inverts the formula #' + i, M.impliedVol(g.price, s => M.bs(Object.assign({}, o, { sigma: s })).price), o.sigma, g.vega > 0.5 ? 1e-7 : 1e-3);
  }
  const g = M.bs(B); near('C = shares − loan', g.shares - g.loan, g.price, 1e-12); near('Black 76 on the forward = Black–Scholes', M.black76(100 * Math.exp(0.04), 100, Math.exp(-0.04), 0.2, 1, 'call'), g.price, 1e-12);
  ok('mu does not enter the price (the function takes no drift)', !('mu' in B));
}

/* ── 7. geometric Brownian motion ── */
{
  const o = { mu: 0.06, sigma: 0.2, T: 1, paths: 200000, seed: 9 }, s = M.stats(M.gbmTerminal(o)), th = M.gbmStats(100, 0.06, 0.2, 1);
  near('mean log-return (μ − σ²/2)T', s.mean, th.logMean, 4 * 0.2 / Math.sqrt(o.paths)); near('sd σ√T', s.sd, 0.2, 0.002);
  const p = M.gbmPaths({ S: 100, mu: 0.06, sigma: 0.2, T: 4, steps: 16, paths: 40000, seed: 3 });
  const e = M.stats(p.map(a => Math.log(a[16] / 100))), q = M.stats(p.map(a => Math.log(a[4] / 100)));
  near('paths: sd over 4 years is σ·2', e.sd, 0.4, 0.006); near('paths: sd over 1 year is σ', q.sd, 0.2, 0.003);
  near('paths: mean of S_T is S·e^{μT}', M.stats(p.map(a => a[16])).mean, 100 * Math.exp(0.24), 4 * 100 * Math.exp(0.24) * Math.sqrt(Math.exp(0.16) - 1) / 200);
  const drag = M.gbmStats(100, 0.06, 0.6, 1); ok('σ=60%, μ=6%: mean above the start, most paths below it', drag.mean > 100 && drag.pBelow > 0.5 && drag.median < 100, drag.pBelow);
}

/* ── 8. the PDE ── */
{
  for (const type of ['call', 'put']) for (const S of [70, 90, 100, 110, 140]) near(`Crank–Nicolson 240×400 = formula (${type}, S=${S})`, M.pde(Object.assign({}, B, { M: 240, Nt: 400, type })).at(S), M.bs(Object.assign({}, B, { S, type })).price, 0.006);
  const e = m => Math.abs(M.pde(Object.assign({}, B, { M: m, Nt: m })).at(100) - M.bs(B).price);
  for (const m of [75, 150, 300]) { const k = e(m) / e(2 * m); ok(`second order: halving both steps divides the error by about 4 (M=${m})`, k > 3.8 && k < 4.2, k); }
  const c = M.pde(Object.assign({}, B, { M: 60, Nt: 100, scheme: 'explicit' }));
  check('explicit, 60 nodes: needs 145 steps', c.stableNt, Math.ceil(1 / (1 / (0.04 * 3600 + 0.04)))); check('…145', c.stableNt, 145);
  ok('explicit below the bound is unstable', c.unstable);
  const s = M.pde(Object.assign({}, B, { M: 60, Nt: 145, scheme: 'explicit' }));
  ok('explicit at the bound is stable', !s.unstable); near('… and agrees with the formula on that coarse grid', s.at(100), M.bs(B).price, 0.08);
  near('explicit and Crank–Nicolson agree on the same grid', s.at(100), M.pde(Object.assign({}, B, { M: 60, Nt: 145 })).at(100), 0.01);
  const k = M.pde(Object.assign({}, B, { M: 240, Nt: 1, scheme: 'explicit', stopAt: 0 })).stableNt / 145; ok('a grid 4 times finer needs about 16 times the steps', k > 15.5 && k < 16.5, k);
  const z = M.pde(Object.assign({}, B, { M: 60, Nt: 100, stopAt: 0 })); near('τ = 0 is the payoff', z.at(120), 20, 1e-12);
}

/* ── 9. delta hedging ── */
{
  const H = (o, paths, seed) => M.hedgeSim(Object.assign({}, B, { sigmaImp: 0.2, sigmaReal: 0.2, paths, seed }, o));
  const sds = {};
  for (const nn of [4, 16, 64, 256]) { const h = H({ n: nn }, 20000, 101); ok(`realised = priced: mean P&L is zero within 3 standard errors (n=${nn})`, Math.abs(h.mean) < 3 * h.se, `${h.mean} vs se ${h.se}`); sds[nn] = h.sd; }
  for (const nn of [4, 16, 64]) { const k = sds[nn] / sds[4 * nn]; ok(`4 times the rebalances about halves the spread (n=${nn})`, k > 1.85 && k < 2.15, k); }
  for (const nn of [16, 64, 256]) { const a = M.hedgeSdApprox(100, 100, 0.04, 0.2, 1, nn); ok(`spread ≈ √(π/4)·vega·σ/√n (Kamal & Derman), within 6% (n=${nn})`, Math.abs(sds[nn] / a - 1) < 0.06, sds[nn] / a); }
  for (const sr of [0.1, 0.15, 0.25, 0.3]) {
    const h = H({ n: 252, sigmaReal: sr }, 20000, 202), th = M.hedgeMeanTheory(100, 100, 0.04, 1, 0.2, sr), exact = (M.bs(B).price - M.bs(Object.assign({}, B, { sigma: sr })).price) * Math.exp(0.04);
    ok(`realised ${sr}: simulated mean = theory within 3 standard errors`, Math.abs(h.mean - exact) < 3 * h.se, `${h.mean} vs ${exact}, se ${h.se}`);
    near(`… and the Γ-integral equals the premium difference grown at r (${sr})`, th / exact, 1, 0.005);
    ok(`sign: seller ${sr < 0.2 ? 'gains' : 'loses'}`, sr < 0.2 ? h.mean > 0 : h.mean < 0);
  }
  const a = H({ n: 252, sigmaReal: 0.3, mu: 0.15 }, 20000, 303), b = H({ n: 252, sigmaReal: 0.3, mu: -0.05 }, 20000, 303);
  ok('the drift μ barely moves the mean (less than 3% of it at daily rebalancing)', Math.abs(a.mean - b.mean) < 0.03 * Math.abs(a.mean), `${a.mean} vs ${b.mean}`);
  const rows = M.hedgePath(Object.assign({}, B, { sigmaImp: 0.2, sigmaReal: 0.2, n: 2000, seed: 4 })), last = rows[rows.length - 1];
  ok('one path, 2,000 rebalances: the portfolio tracks the option to within 0.35', Math.abs(last.port - last.opt) < 0.35, last.port - last.opt);
}

/* ── 10. the shipped smile ── */
{
  const S = DATA.SMILE;
  check('snapshot date', S.asOf, '2026-11-17'); ok('source and URL recorded', /cboe\.com/.test(S.url) && S.retrieved === '2026-11-18');
  for (const key of ['dec', 'mar']) {
    const E = S.expiries[key], sm = M.smile(key);
    check(`${key}: 19 strikes`, E.rows.length, 19);
    ok(`${key}: every quote has bid < ask`, E.rows.every(x => x.cb < x.ca && x.pb < x.pa));
    ok(`${key}: discount factor below 1, forward above spot`, sm.D < 1 && sm.D > 0.95 && sm.F > S.spot);
    for (const x of E.rows.filter(x => Math.abs(x.K / S.spot - 1) < 0.06)) ok(`${key}: parity holds in the quotes at ${x.K} (within the bid–ask)`, Math.abs((x.cb + x.ca) / 2 - (x.pb + x.pa) / 2 - sm.D * (sm.F - x.K)) < ((x.ca - x.cb) + (x.pa - x.pb)) / 2 + 0.5);
    for (const p of sm.pts.filter(p => p.m > 0.72 && p.m < 1.12)) ok(`${key}: implied volatility at ${p.K} within 0.6 points of Cboe's own`, Math.abs(p.iv - p.cboe) < 0.006, `${p.iv} vs ${p.cboe}`);
    const left = sm.pts.filter(p => p.m < 1.06); ok(`${key}: implied volatility falls as the strike rises up to 106% of the forward`, left.every((p, i) => i === 0 || p.iv < left[i - 1].iv));
    ok(`${key}: the "10% below" strike is 88–92% of the forward`, sm.p90.m > 0.88 && sm.p90.m < 0.92, sm.p90.m);
    for (const p of sm.pts) near(`${key}: repricing at the implied volatility returns the mid (${p.K})`, M.black76(sm.F, p.K, sm.D, p.iv, sm.T, p.type), p.mid, 1e-6);
  }
  const mis = M.smileMisprice('dec'); ok('the 90% put costs several times its flat-volatility price', mis.ratio > 5 && mis.ratio < 9, mis.ratio);
}

/* ── 11. the shipped return histogram ── */
{
  const R = DATA.RETURNS;
  check('histogram sums to n', R.hist.reduce((s, x) => s + x, 0), R.n);
  for (let k = 2; k <= 10; k += 0.5) { let c = 0; R.hist.forEach((v, i) => { const a = R.binLo + i * R.binW; if (a >= k || a + R.binW <= -k) c += v; }); check(`exceedance count at ${k}σ = histogram tails`, c, R.exceed[k.toFixed(1)]); }
  ok('fat tails: kurtosis far above 3', R.kurtosis > 8); near('two-tail probability at 1.96', M.twoTail(1.96), 0.05, 1e-4);
  const t5 = M.tails(5); near('normal expects n·P(|Z|≥5) days', t5.exp, R.n * 2 * M.cdf(-5), 1e-12); ok('observed 5σ days outnumber that by thousands', t5.obs / t5.exp > 1000);
  const c = M.crash87(); near('19 October 1987 in standard deviations', c.z, (Math.log(1 + R.oct19.pct / 100) - R.mean) / R.sd, 0.01);
  near('its normal probability: order of magnitude', c.log10p, Math.log10(M.cdf(c.z)), 0.1);
  check('the largest fall in the sample', R.worst[0].date, '2020-03-16'); ok('1987-10-19 is the second largest', R.worst[1].date === '1987-10-19');
  ok('returns barely autocorrelated, their size strongly', Math.abs(R.acfRaw[0]) < 0.05 && R.acfAbs[0] > 0.25 && R.acfAbs[19] > 0.15);
  ok('source recorded', /NASDAQCOM/.test(R.url) && R.from === '1971-02-05');
}

/* ── 12. Heston ── */
{
  // Broadie & Kaya (2006), Table 1 case: S=100, K=100, v0=0.010201, κ=6.21, θ=0.019, ξ=0.61, ρ=−0.70, r=3.19%, T=1 → 6.8061
  check('characteristic function reproduces Broadie & Kaya 6.8061', M.hestonCF({ S: 100, K: 100, r: 0.0319, T: 1, v0: 0.010201, kappa: 6.21, theta: 0.019, xi: 0.61, rho: -0.7 }).toFixed(4), '6.8061');
  near('ξ → 0 gives Black–Scholes', M.hestonCF({ S: 100, K: 100, r: 0.04, T: 1, v0: 0.04, kappa: 2, theta: 0.04, xi: 0.01, rho: 0 }), M.bs(B).price, 0.001);
  const k = 2, th = 0.09, v0 = 0.04, avg = th + (v0 - th) * (1 - Math.exp(-k)) / k;
  near('ξ → 0 with v0 ≠ θ: Black–Scholes at the average variance', M.hestonCF({ S: 100, K: 105, r: 0.04, T: 1, v0, kappa: k, theta: th, xi: 0.01, rho: 0 }), M.bs({ S: 100, K: 105, r: 0.04, sigma: Math.sqrt(avg), T: 1 }).price, 0.001);
  const P = EX.heston, mc = M.hestonMC(P);
  near('Monte Carlo: the mean terminal price is the forward', mc.meanS, mc.F, 4 * 100 * 0.15 / Math.sqrt(P.paths));
  for (const p of mc.pts) { const call = M.hestonCF(Object.assign({}, P, { K: p.K })), ref = p.type === 'put' ? call - mc.D * (mc.F - p.K) : call; ok(`Monte Carlo = characteristic function within 3 standard errors (K=${p.K})`, Math.abs(p.price - ref) < 3 * p.se, `${p.price} vs ${ref}, se ${p.se}`); }
  const iv = K => mc.pts.find(p => p.K === K).iv; ok('negative ρ: low strikes carry the higher implied volatility', iv(80) > iv(100) && iv(100) > iv(120));
  const pos = M.hestonMC(Object.assign({}, P, { rho: 0.7 })), ivp = K => pos.pts.find(p => p.K === K).iv; ok('positive ρ: the skew flips', ivp(120) > ivp(80));
  const flat = M.hestonMC(Object.assign({}, P, { xi: 0.05, rho: 0 })); ok('small ξ: flat near 20%', flat.pts.filter(p => p.K >= 85 && p.K <= 115).every(p => Math.abs(p.iv - 0.2) < 0.006));
  check('prose: twenty thousand paths, half a year, variance 0.04, κ = 2', [P.paths, P.T, P.v0, P.theta, P.kappa].join(), '20000,0.5,0.04,0.04,2');
}

/* ── 13. margin, netting, the minimum-variance hedge ── */
{
  const G = EX.margin, o = { im: G.im, mm: G.im * G.mmFrac, sigma: G.sigma, days: G.days, seed: G.seed, reserve: 0 };
  const d = M.marginSim(o); ok('default path: closed out, yet the price ends higher', d.closed > 0 && d.unlevered > 0 && d.outcome < 0);
  check('10% margin is 10× leverage', d.leverage, 10); check('prose: 75% maintenance, 120 days, 400 runs', [G.mmFrac, G.days, G.runs].join(), '0.75,120,400');
  for (let s = 1; s <= 40; s++) { const r = M.marginSim(Object.assign({}, o, { seed: s, reserve: 1 })); ok('with reserves the outcome is the unlevered P&L, seed ' + s, r.closed < 0 && Math.abs(r.outcome - r.unlevered) < 1e-9); }
  // probability of touching −2.5% within 120 days, by the reflection principle (continuous monitoring is an upper bound)
  const st = M.marginStats(o, 4000), sdT = G.sigma * Math.sqrt(G.days / 252), cont = 2 * M.cdf(Math.log(1 - G.im * (1 - G.mmFrac)) / sdT);
  ok('closed-out share just below the continuous barrier probability', st.closed < cont + 0.01 && st.closed > cont - 0.06, `${st.closed} vs ${cont}`);
  const N = M.netting(M.NET_EXAMPLE.owes); check('netting example', [N.gross, N.bilateral, N.ccp].join(), '560,140,20');
  near('net positions sum to zero', N.net.reduce((s, x) => s + x, 0), 0, 1e-12); ok('gross ≥ bilateral ≥ multilateral', N.gross >= N.bilateral && N.bilateral >= N.ccp);
  const svg = fig('dg-ccp.html'); for (const p of N.pairs) ok('ccp diagram shows pair amount ' + Math.abs(p.net), svg.includes('>' + Math.abs(p.net) + '</text>')); for (const x of N.net) ok('… and net ' + Math.abs(x), svg.includes('>' + Math.abs(x) + '</text>'));
  const F = EX.farm;
  for (const rho of [0.5, 0.7, 0.9, 1]) {
    const best = M.minVar({ sigS: F.sigS, sigF: F.sigF, rho, h: rho }); near('h* = ρσs/σf', best.hStar, rho, 1e-12); near('residual √(1−ρ²)', best.sdStar, F.sigS * Math.sqrt(1 - rho * rho), 1e-9);
    let m = Infinity, arg = 0; for (let h = 0; h <= 2; h += 0.001) { const v = M.minVar({ sigS: F.sigS, sigF: F.sigF, rho, h }).sd; if (v < m) { m = v; arg = h; } } near('numerical minimum at h*', arg, rho, 0.002);
    near('at twice h* the risk is back to unhedged', M.minVar({ sigS: F.sigS, sigF: F.sigF, rho, h: 2 * rho }).sd, F.sigS, 1e-9);
    for (const h of [0, 0.6, 1, 1.7]) { const s = M.stats(M.hedgeSample({ sigS: F.sigS, sigF: F.sigF, rho, h, n: 200000, seed: 5 }).hedged); near(`sample sd = formula (ρ=${rho}, h=${h})`, s.sd, M.minVar({ sigS: F.sigS, sigF: F.sigF, rho, h }).sd, 0.08); }
  }
  check('prose: the farm', [F.sigS, F.n].join(), '15,2000');
}

/* ── 14. bindings re-derived independently ── */
{
  const want = {
    'ch1.F': f(100 * Math.exp(0.04), 2), 'ch1.gap': f(110 - 100 * Math.exp(0.04), 2),
    'ch2.cp': f(100 - 100 * Math.exp(-0.04), 2), 'ch2.kf': f(100 * Math.exp(0.04), 0),
    'ch3.delta': '0.5', 'ch3.B': f(40 * Math.exp(-0.04), 2), 'ch3.cost': '50', 'ch3.price': f(50 - 40 * Math.exp(-0.04), 2),
    'ch3.naive80': f(0.8 * 20 * Math.exp(-0.04), 2), 'ch3.naive30': f(0.3 * 20 * Math.exp(-0.04), 2), 'ch3.q': f((Math.exp(0.04) - 0.8) / 0.4 * 100, 1) + '%',
    'ch5.day': f(20 / Math.sqrt(252), 2) + '%', 'ch5.month': f(20 / Math.sqrt(12), 1) + '%', 'ch5.y4': '40%',
    'ch6.Nd1': f(M.cdf(0.3), 3), 'ch6.need60': '145', 'ch7.paths': '1,500',
    'ch8.n': f(DATA.RETURNS.n, 0), 'ch8.exp5': f(DATA.RETURNS.n * 2 * M.cdf(-5), 3), 'ch8.obs5': String(DATA.RETURNS.exceed['5.0']), 'ch8.oct19': '11.35%', 'ch8.worstPct': '12.32%',
    'ch9.gross': '560', 'ch9.bil': '140', 'ch9.ccp': '20', 'ch10.cut90': f((1 - Math.sqrt(1 - 0.81)) * 100, 0) + '%', 'ch10.cut70': f((1 - Math.sqrt(1 - 0.49)) * 100, 0) + '%',
    'f.gmvPct': f(21.8 / 846 * 100, 1) + '%', 'f.bisNotional': '846', 'f.bisGmv': '21.8', 'f.djia87': '22.6%', 'f.sebiLoss': '87.7%', 'f.zeroShare': '66.2%', 'f.sofr': '3.93%'
  };
  for (const [k, v] of Object.entries(want)) check('binding ' + k, Bd[k], v);
  // d1 = 0.3 exactly for the running example
  near('d1 of the running example', M.bs(B).d1, 0.3, 1e-12);
  check('ch2: C and P of the running example', [Bd['ch2.C'], Bd['ch2.P']].join(), [f(M.bs(B).price, 2), f(M.bs(Object.assign({}, B, { type: 'put' })).price, 2)].join());
  check('ch6.C = ch2.C', Bd['ch6.C'], Bd['ch2.C']); ok('shares − loan on the page, to rounding', Math.abs(+Bd['ch6.shares'] - +Bd['ch6.loan'] - M.bs(B).price) < 0.011); check('ch6: stock and loan legs', [Bd['ch6.shares'], Bd['ch6.loan']].join(), [f(100 * M.cdf(0.3), 2), f(100 * Math.exp(-0.04) * M.cdf(0.1), 2)].join());
  ok('ch4: 500 steps within a cent of the formula', Math.abs(+Bd['ch4.n500'] - +Bd['ch6.C']) <= 0.011);
  check('ch4: European put on the tree = formula to the cent', Bd['ch4.euPut'], Bd['ch2.P']);
  // the hedging numbers of the prose are the lab's own seeded run; their claims: 1/√n and the sign and size of the mean
  ok('ch7: sd at 4, 52, 252 rebalances falls roughly as 1/√n', +Bd['ch7.sd4'] / +Bd['ch7.sd52'] > 2.9 && +Bd['ch7.sd4'] / +Bd['ch7.sd52'] < 4.3 && +Bd['ch7.sd52'] / +Bd['ch7.sd252'] > 1.8 && +Bd['ch7.sd52'] / +Bd['ch7.sd252'] < 2.6);
  near('ch7: the loss at 30% realised is the premium difference', +Bd['ch7.loss30'], (M.bs(Object.assign({}, B, { sigma: 0.3 })).price - M.bs(B).price) * Math.exp(0.04), 0.12);
  near('ch7: the gain at 10% realised is the premium difference', +Bd['ch7.gain10'], (M.bs(B).price - M.bs(Object.assign({}, B, { sigma: 0.1 })).price) * Math.exp(0.04), 0.12);
  // every binding is used by the copy (the build enforces it too)
  for (const [k, v] of Object.entries(Bd)) ok(`binding ${k} = ${v} appears in the copy`, allZ.includes(v));
}

/* ── 15. literal amounts and dates in the prose, against FRONTIER and the data ── */
{
  const has = (name, s) => ok(`prose has "${s}" (${name})`, allZ.includes(s));
  const zhDate = d => { const [y, m, dd] = d.split('-').map(Number); return `${y} 年 ${m} 月` + (dd ? ` ${dd} 日` : ''); };
  has('LTCM rescue', f(X.ltcm.rescueBn * 10, 0) + ' 亿美元'); has('AIG loan', f(X.aig.loanBn * 10, 0) + ' 亿美元');
  has('FIA total', f(X.fia2025.totalBn * 10, 1) + ' 亿张'); has('FIA options', f(X.fia2025.optionsBn * 10, 1) + ' 亿张'); has('FIA futures', f(X.fia2025.futuresBn * 10, 1) + ' 亿张');
  has('US options ADV', f(X.usOptions.advMn * 100, 0) + ' 万张'); has('0DTE ADV', f(X.usOptions.zeroDteMn * 100, 0) + ' 万张'); has('SEBI traders', f(X.sebi.fy26TradersLakh * 10, 0) + ' 万');
  has('perpetuals claim', f(X.perpClaim.volumeTn, 1) + ' 万亿美元');
  has('BIS date', zhDate(X.bisOtc.date) + '底'); has('LIBOR end', zhDate(X.libor.usdEnd)); has('SOFR date', zhDate(X.sofr.date));
  has('Treasury clearing decided', zhDate(X.treasuryClearing.decided)); has('cash', zhDate(X.treasuryClearing.cash)); has('repo', zhDate(X.treasuryClearing.repo));
  has('LTCM date', '9 月 23 日'); check('LTCM date in the block', X.ltcm.date, '1998-09-23'); has('AIG date', zhDate(X.aig.date));
  has('worst day', zhDate(DATA.RETURNS.worst[0].date)); has('snapshot day', zhDate(DATA.SMILE.asOf));
  has('0DTE record month', '2026 年 7 月'); check('… in the block', X.spx0dte.date, '2026-07');
  ok('the page says it is not advice', /不构成任何投资建议/.test(Z['hero.note']) && /不构成投资建议/.test(Z.footer || Object.keys(Z).filter(k => k.startsWith('footer')).map(k => Z[k]).join('')));
  ok('no forecast or recommendation wording', !/(建议买入|建议卖出|应该买|值得买|必涨|必跌|稳赚不赔)/.test(allZ));
}

/* ── 16. diagrams ── */
{
  const w = 680 * X.bisOtc.gmvTn / X.bisOtc.notionalTn, svg = fig('dg-notional.html');
  ok('notional diagram: the gold bar is to scale (wide)', svg.includes(`width="${Math.round(w * 10) / 10}"`), w); ok('… and narrow', svg.includes(`width="${Math.round(w / 2 * 10) / 10}"`));
  const figs = fs.readdirSync(path.join(DIR, 'figures')).filter(x => x.startsWith('dg-')); check('nine diagrams', figs.length, 9);
  for (const x of figs) { const s = fig(x); ok(x + ': generated header', s.startsWith('<!-- GENERATED by tools/diagrams.cjs')); ok(x + ': no CJK in the partial', !/[　-〿㐀-鿿＀-￯]/.test(s)); check(x + ': a wide and a narrow svg', (s.match(/<svg /g) || []).length, 2);
    const sizes = [...s.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]); ok(x + ': every label is 14 units or more', Math.min(...sizes) >= 14, Math.min(...sizes)); }
  for (const x of fs.readdirSync(path.join(DIR, 'figures'))) ok(x + ': no CJK', !/[　-〿㐀-鿿＀-￯]/.test(fig(x)));
}

/* ── 17. copy keys, language hygiene, registry ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'[,)]/g)].map(m => m[1]);
  for (const k of new Set(keys)) ok('copy key used by app.js exists: ' + k, Z[k] != null);
  const pj = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  for (const [pre, vals] of Object.entries(pj.dynamicKeys)) for (const v of vals) ok(`dynamic key ${pre}.${v}`, Z[`${pre}.${v}`] != null);
  for (const k of Object.keys(M.STRATS)) if (pj.dynamicKeys['ch2.say'].includes(k)) ok('strategy has a radio: ' + k, html.includes(`name="c2St" value="${k}"`));
  const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
  for (const fn of ['app.js', 'models.js', 'bindings.cjs']) ok(fn + ': no CJK outside comments', !/[　-〿㐀-鿿＀-￯]/.test(code(fs.readFileSync(path.join(DIR, fn), 'utf8'))));
  ok('page.json: English declared as a stub, not live', pj.languages.en === 'stub' && pj.status == null);
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title = hero heading', R.title.zh, Z['hero.title'] || Z['hero.h1'] || (html.match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1]);
  check('registry desc = page desc', R.desc.zh, Z['doc.desc']);
  for (const c of R.concepts) { ok(`concept ${c.id}: anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`)); ok(`concept ${c.id}: aliases in both languages`, c.aliases.zh.length >= 5 && c.aliases.en.length >= 5); ok(`concept ${c.id}: a question-form alias`, [...c.aliases.zh, ...c.aliases.en].some(a => /什么|怎么|为什么|吗|多少|^(what|how|why|is|do) /i.test(a))); }
  const owner = {}; let dup = [];
  for (const c of R.concepts) for (const a of new Set([...c.aliases.zh, ...c.aliases.en].map(x => x.toLowerCase()))) { if (owner[a] && owner[a] !== c.id) dup.push(a); owner[a] = c.id; }
  check('no alias owned by two concepts of this page', dup.join(), '');
  for (const ch of Array.from({ length: 12 }, (_, i) => 'ch' + (i + 1))) ok(ch + ' has a law and a table-of-contents entry', Z[ch + '.law'] && Z['toc.' + ch]);
  for (const ch of ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10', 'ch11']) ok(ch + ' states its limits', Z[ch + '.limit']);
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
