/* Models for "Random Walks and Brownian Motion". Pure functions, no DOM.
   UMD: window.RWModels in the browser, module.exports in node (tests/models.cjs, bindings.cjs). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RWModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── helpers ── */
  function rng(seed) { // xorshift32, repeatable
    let x = (seed >>> 0) || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  }
  function gauss(R) { // Box–Muller
    let u = 0; while (u === 0) u = R();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R());
  }
  function erf(x) { // Abramowitz–Stegun 7.1.26; |error| < 1.5e-7
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  const normPdf = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  function lnChoose(n, k) { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }
  function fmt(x, d, lang) {
    if (!isFinite(x)) return '–';
    return Number(x).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  const pct = (x, d, lang) => fmt(x * 100, d, lang) + '%';

  /* ── ch1: the coin-flip walk ── */
  // Exact distribution of S_n = sum of n steps of ±1: P(S_n = 2k − n) = C(n,k) / 2^n.
  function walkPmf(n) {
    const out = [];
    for (let k = 0; k <= n; k++) out.push({ s: 2 * k - n, p: Math.exp(lnChoose(n, k) - n * Math.LN2) });
    return out;
  }
  // P(|S_n| <= c) exactly.
  function shareWithin(n, c) { return walkPmf(n).reduce((t, o) => t + (Math.abs(o.s) <= c + 1e-9 ? o.p : 0), 0); }
  // E|S_n| exactly; approaches sqrt(2n/pi) = 0.798 sqrt(n).
  function meanAbs(n) { return walkPmf(n).reduce((t, o) => t + Math.abs(o.s) * o.p, 0); }
  // An ensemble of walkers: positions after each step, seeded.
  function makeEnsemble(m, seed) { return { m, n: 0, x: new Float64Array(m), R: rng(seed) }; }
  function stepEnsemble(E) { for (let i = 0; i < E.m; i++) E.x[i] += E.R() < 0.5 ? -1 : 1; E.n++; return E; }
  function ensembleStats(E) {
    let ss = 0, abs = 0, inside = 0; const c = Math.sqrt(E.n);
    for (let i = 0; i < E.m; i++) { const v = E.x[i]; ss += v * v; abs += Math.abs(v); if (Math.abs(v) <= c + 1e-9) inside++; }
    return { n: E.n, rms: Math.sqrt(ss / E.m), meanAbs: abs / E.m, inside: inside / E.m };
  }

  /* ── ch2: any step with variance 1 ── */
  // Three step laws, each with mean 0 and variance 1. skew = E[X^3].
  const STEPS = {
    coin: { draw: R => (R() < 0.5 ? -1 : 1), skew: 0, kurt: 1 },
    uniform: { draw: R => (2 * R() - 1) * Math.sqrt(3), skew: 0, kurt: 1.8 },
    lopsided: { draw: R => (R() < 0.25 ? Math.sqrt(3) : -1 / Math.sqrt(3)), skew: 2 / Math.sqrt(3), kurt: 7 / 3 },
  };
  // Theory for S_n: sd = sqrt(n) for every law; skewness = skew / sqrt(n); excess kurtosis = (kurt − 3) / n.
  function sumTheory(type, n) { const L = STEPS[type]; return { sd: Math.sqrt(n), skew: L.skew / Math.sqrt(n), exKurt: (L.kurt - 3) / n }; }
  function sampleSums(type, n, m, seed) {
    const R = rng(seed), L = STEPS[type], out = new Float64Array(m);
    for (let i = 0; i < m; i++) { let s = 0; for (let j = 0; j < n; j++) s += L.draw(R); out[i] = s; }
    return out;
  }
  function moments(a) {
    const n = a.length; let m = 0; for (const v of a) m += v; m /= n;
    let s2 = 0, s3 = 0; for (const v of a) { const d = v - m; s2 += d * d; s3 += d * d * d; }
    const sd = Math.sqrt(s2 / n);
    return { mean: m, sd, skew: (s3 / n) / (sd * sd * sd) };
  }

  /* ── ch3: Brownian motion and diffusion ── */
  const KB = 1.380649e-23; // J/K, exact since the 2019 SI
  const NA = 6.02214076e23; // 1/mol, exact since the 2019 SI
  // Viscosity of water, Pa·s: Vogel equation eta = A · 10^(B / (T − C)), A = 2.414e-5 Pa·s, B = 247.8 K, C = 140 K
  // (a standard fit, within about 2.5% from 0 to 370 °C).
  const etaWater = tC => 2.414e-5 * Math.pow(10, 247.8 / (tC + 273.15 - 140));
  // Stokes–Einstein: D = kT / (6 pi eta a), a = sphere radius (m). Returns m^2/s.
  function stokesEinstein(aMeters, tC) { return KB * (tC + 273.15) / (6 * Math.PI * etaWater(tC) * aMeters); }
  // Per axis: <x^2> = 2 D t. RMS displacement along one axis after t seconds; time to spread a distance x.
  const rms1d = (D, t) => Math.sqrt(2 * D * t);
  const timeToSpread = (D, x) => x * x / (2 * D);
  // A cloud of particles in the plane, positions in micrometres, stepping with dt seconds.
  function makeCloud(m, seed) { return { m, t: 0, x: new Float64Array(m), y: new Float64Array(m), R: rng(seed) }; }
  function stepCloud(C, Dum2, dt) { // Dum2: D in µm²/s
    const s = Math.sqrt(2 * Dum2 * dt);
    for (let i = 0; i < C.m; i++) { C.x[i] += s * gauss(C.R); C.y[i] += s * gauss(C.R); }
    C.t += dt; return C;
  }
  function cloudMsd(C) { let sx = 0; for (let i = 0; i < C.m; i++) sx += C.x[i] * C.x[i] + C.y[i] * C.y[i]; return sx / C.m / 2; } // per axis
  // A lattice walk with step a every tau seconds has D = a^2 / (2 tau) along one axis.
  const latticeD = (a, tau) => a * a / (2 * tau);

  /* ── ch4: drift plus noise, geometric Brownian motion ── */
  // dS/S = mu dt + sigma dW. ln(S_T/S_0) ~ Normal((mu − sigma^2/2) T, sigma^2 T).
  function gbm(mu, sigma, T, S0) {
    S0 = S0 || 100;
    const m = mu - sigma * sigma / 2, s = sigma * Math.sqrt(T);
    return {
      logDrift: m * T, logSd: s,
      median: S0 * Math.exp(m * T), mean: S0 * Math.exp(mu * T),
      lo: S0 * Math.exp(m * T - s), hi: S0 * Math.exp(m * T + s),
      pLoss: Phi(-(m * T) / s),
      tStar: m > 0 ? (sigma * sigma) / (m * m) : Infinity, // drift (m T) equals one sd (sigma sqrt T)
    };
  }
  function gbmPaths(mu, sigma, T, k, steps, seed, S0) {
    S0 = S0 || 100; const R = rng(seed), dt = T / steps, m = mu - sigma * sigma / 2, out = [];
    for (let j = 0; j < k; j++) { const p = [S0]; let l = 0; for (let i = 0; i < steps; i++) { l += m * dt + sigma * Math.sqrt(dt) * gauss(R); p.push(S0 * Math.exp(l)); } out.push(p); }
    return out;
  }
  const annualise = (sdDaily, perYear) => sdDaily * Math.sqrt(perYear);

  /* ── ch5: is the market a random walk ── */
  // Expected count in a z-bin under the normal law, for n observations.
  const normalBinCount = (n, lo, w) => n * (Phi(lo + w) - Phi(lo));
  const normalTail = k => 2 * (1 - Phi(k)); // P(|Z| >= k)
  // Read the data object: horizon summary and the random-walk prediction sd_1 sqrt(q).
  function horizon(D, q) {
    const h = D.horizons[q], s1 = D.horizons[1].sd;
    return { n: h.n, sd: h.sd, pred: s1 * Math.sqrt(q), ratio: h.sd / (s1 * Math.sqrt(q)), kurt: h.kurt, over4: h.over4, exp4: h.n * normalTail(4), hist: h.hist };
  }
  function vrAt(D, era, q) {
    const e = D.eras[era], i = D.qs.indexOf(q);
    const v = e.vr[i], lo = e.lo[i], hi = e.hi[i];
    return { vr: v, lo, hi, verdict: v > hi ? 'above' : v < lo ? 'below' : 'inside', sdRatio: Math.sqrt(v) };
  }

  /* ── ch6: first passage, gambler's ruin ── */
  // Unit bets, win with p: probability of reaching N before 0 from i.
  function ruinTimid(i, N, p) {
    const q = 1 - p;
    if (Math.abs(p - 0.5) < 1e-12) return i / N;
    const r = q / p; return (1 - Math.pow(r, i)) / (1 - Math.pow(r, N));
  }
  // Expected number of unit bets until 0 or N.
  function durationTimid(i, N, p) {
    const q = 1 - p;
    if (Math.abs(p - 0.5) < 1e-12) return i * (N - i);
    const r = q / p; return i / (q - p) - (N / (q - p)) * (1 - Math.pow(r, i)) / (1 - Math.pow(r, N));
  }
  // Any stake policy b(c) on capital c in 1..N−1: solve f(c) = p f(c + b) + q f(c − b), f(0) = 0, f(N) = 1, and the
  // expected number of bets g(c) = 1 + p g(c + b) + q g(c − b), by Gaussian elimination. Exact for every policy.
  function solvePolicy(N, p, stake) {
    const q = 1 - p, n = N - 1;
    const solve = (rhsOf, bnd) => {
      const A = [], b = [];
      for (let c = 1; c <= n; c++) {
        const row = new Float64Array(n); row[c - 1] = 1; let rhs = rhsOf(c);
        const s = stake(c), up = c + s, dn = c - s;
        if (up >= N) rhs += p * bnd(N); else row[up - 1] -= p;
        if (dn <= 0) rhs += q * bnd(0); else row[dn - 1] -= q;
        A.push(row); b.push(rhs);
      }
      for (let k = 0; k < n; k++) {
        let piv = k; for (let r2 = k + 1; r2 < n; r2++) if (Math.abs(A[r2][k]) > Math.abs(A[piv][k])) piv = r2;
        [A[k], A[piv]] = [A[piv], A[k]]; [b[k], b[piv]] = [b[piv], b[k]];
        for (let r2 = k + 1; r2 < n; r2++) { const f = A[r2][k] / A[k][k]; if (!f) continue; for (let c2 = k; c2 < n; c2++) A[r2][c2] -= f * A[k][c2]; b[r2] -= f * b[k]; }
      }
      const x = new Float64Array(n);
      for (let k = n - 1; k >= 0; k--) { let s = b[k]; for (let c2 = k + 1; c2 < n; c2++) s -= A[k][c2] * x[c2]; x[k] = s / A[k][k]; }
      return x;
    };
    const win = solve(() => 0, c => (c >= N ? 1 : 0));
    const dur = solve(() => 1, () => 0);
    return { win: c => win[c - 1], dur: c => dur[c - 1] };
  }
  const STAKE = {
    timid: () => 1,
    bold: N => c => Math.min(c, N - c),
  };
  function ruin(i, N, p) {
    const bold = solvePolicy(N, p, STAKE.bold(N));
    return { timid: ruinTimid(i, N, p), timidBets: durationTimid(i, N, p), bold: bold.win(i), boldBets: bold.dur(i) };
  }
  function ruinPaths(i, N, p, k, seed, maxSteps) {
    const R = rng(seed), out = [];
    for (let j = 0; j < k; j++) { const path = [i]; let c = i; while (c > 0 && c < N && path.length <= maxSteps) { c += R() < p ? 1 : -1; path.push(c); } out.push(path); }
    return out;
  }

  /* ── ch7: the forward process of a diffusion model ── */
  // DDPM schedule (Ho, Jain and Abbeel 2020): beta_t linear from 1e-4 to 0.02 over T = 1000 steps,
  // alphaBar_t = prod (1 − beta_s). x_t = sqrt(alphaBar) x_0 + sqrt(1 − alphaBar) eps.
  const DDPM_T = 1000;
  const betaAt = t => 1e-4 + (0.02 - 1e-4) * (t - 1) / (DDPM_T - 1);
  const ALPHABAR = (() => { const a = new Float64Array(DDPM_T + 1); a[0] = 1; for (let t = 1; t <= DDPM_T; t++) a[t] = a[t - 1] * (1 - betaAt(t)); return a; })();
  const alphaBar = t => ALPHABAR[Math.max(0, Math.min(DDPM_T, Math.round(t)))];
  // Toy data: two equal peaks at ±mu0 with sd s0. After t noising steps each peak is
  // Normal(±sqrt(aB) mu0, aB s0^2 + 1 − aB). An equal two-normal mixture has two humps iff the half-separation > sd.
  const TOY = { mu0: 2, s0: 0.3 };
  function forward(t) {
    const aB = alphaBar(t), mu = Math.sqrt(aB) * TOY.mu0, sd = Math.sqrt(aB * TOY.s0 * TOY.s0 + 1 - aB);
    const dens = x => 0.5 * (normPdf((x - mu) / sd) + normPdf((x + mu) / sd)) / sd;
    return { aB, mu, sd, twoPeaks: mu > sd, signal: Math.sqrt(aB), dens };
  }
  function mergeStep() { for (let t = 0; t <= DDPM_T; t++) if (!forward(t).twoPeaks) return t; return null; }

  return {
    rng, gauss, Phi, normPdf, fmt, pct,
    walkPmf, shareWithin, meanAbs, makeEnsemble, stepEnsemble, ensembleStats,
    STEPS, sumTheory, sampleSums, moments,
    KB, NA, etaWater, stokesEinstein, rms1d, timeToSpread, makeCloud, stepCloud, cloudMsd, latticeD,
    gbm, gbmPaths, annualise,
    normalBinCount, normalTail, horizon, vrAt,
    ruinTimid, durationTimid, solvePolicy, STAKE, ruin, ruinPaths,
    DDPM_T, betaAt, alphaBar, TOY, forward, mergeStep,
  };
});
