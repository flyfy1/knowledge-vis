/* A fair price for a bet: the page's models. Each is the standard result at small scale; tests/models.cjs re-derives
   them against textbook examples and against each other.
   - forward: cost of carry, F = S·e^{(r−q)T}, and the arbitrage a mispriced forward allows (Hull, ch. 5).
   - payoffs, put–call parity (Stoll 1969; Hull ch. 11).
   - oneStep: the one-period binomial replication (Cox, Ross & Rubinstein 1979 §2; Hull ch. 13).
   - crr: the Cox–Ross–Rubinstein tree with backward induction and American exercise.
   - bs: Black–Scholes–Merton price and Greeks (Black & Scholes 1973; Merton 1973), black76 on a forward, impliedVol.
   - gbm: exact log-normal sampling of geometric Brownian motion.
   - pde: the Black–Scholes PDE by finite differences, explicit and Crank–Nicolson (Wilmott, Howison & Dewynne ch. 8).
   - hedgeSim: discrete delta hedging of a sold option (Kamal & Derman 1999; Ahmad & Wilmott 2005), hedgeMeanTheory:
     the expected P&L when priced and realised volatility differ, by quadrature.
   - smile: implied volatilities from the shipped Cboe snapshot (data.js), forward and discount factor read off parity.
   - tails: the shipped histogram of Nasdaq Composite daily returns against the normal curve.
   - heston: Heston (1993) by full-truncation Euler Monte Carlo (Lord, Koekkoek & van Dijk 2010) and by the
     characteristic function (Albrecher et al. 2007 form) for the test.
   - marginSim: a futures margin account marked to market daily. netting: bilateral against central clearing.
   - minVar: the minimum-variance hedge ratio h* = ρ·σs/σf (Hull ch. 3).
   FRONTIER is the dated data block of the frontier chapter (BRIEF.md has each URL and the date it was opened).
   Anything chosen for a model rather than taken from a source is marked TUNED.
   UMD: window.FairBetModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.FairBetModels = factory(root.FairBetData);
})(typeof self !== 'undefined' ? self : this, function (DATA) {
  'use strict';

  /* ───────── seeded randomness ───────── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gaussian(r) { // Box–Muller; returns a generator of standard normals
    let spare = null;
    return function () {
      if (spare != null) { const s = spare; spare = null; return s; }
      let u = 0; while (u === 0) u = r();
      const m = Math.sqrt(-2 * Math.log(u)), a = 2 * Math.PI * r();
      spare = m * Math.sin(a); return m * Math.cos(a);
    };
  }

  /* ───────── the normal distribution ───────── */
  const pdf = x => Math.exp(-x * x / 2) / 2.5066282746310002;
  function cdf(x) { // Hart (1968) as given by G. West, "Better approximations to cumulative normal functions" (2005)
    const xa = Math.abs(x); let c;
    if (xa > 37) c = 0;
    else {
      const e = Math.exp(-xa * xa / 2);
      if (xa < 7.07106781186547) {
        let b = 3.52624965998911e-02 * xa + 0.700383064443688; b = b * xa + 6.37396220353165; b = b * xa + 33.912866078383; b = b * xa + 112.079291497871; b = b * xa + 221.213596169931; b = b * xa + 220.206867912376;
        c = e * b;
        b = 8.83883476483184e-02 * xa + 1.75566716318264; b = b * xa + 16.064177579207; b = b * xa + 86.7807322029461; b = b * xa + 296.564248779674; b = b * xa + 637.333633378831; b = b * xa + 793.826512519948; b = b * xa + 440.413735824752;
        c = c / b;
      } else { let b = xa + 0.65; b = xa + 4 / b; b = xa + 3 / b; b = xa + 2 / b; b = xa + 1 / b; c = e / b / 2.506628274631; }
    }
    return x > 0 ? 1 - c : c;
  }

  /* ───────── ch1: forwards ───────── */
  const forward = (S, r, q, T) => S * Math.exp((r - q) * T);
  // A forward quoted at Fq against spot S. Per unit, money at delivery, nothing paid today.
  //   too high: borrow S, buy the asset (reinvesting its income), sell forward: Fq − S·e^{(r−q)T} at T (cash and carry)
  //   too low:  sell the asset short, lend the proceeds, buy forward:  S·e^{(r−q)T} − Fq at T (reverse)
  function forwardArb(S, r, q, T, Fq) {
    const fair = forward(S, r, q, T), gap = Fq - fair;
    const kind = Math.abs(gap) < 0.005 ? 'none' : gap > 0 ? 'carry' : 'reverse';
    return { fair, gap, kind, profit: Math.abs(gap), units: Math.exp(-q * T), loan: S * Math.exp(-q * T), repay: S * Math.exp((r - q) * T) };
  }

  /* ───────── ch2: payoffs and parity ───────── */
  const callPay = (S, K) => Math.max(S - K, 0), putPay = (S, K) => Math.max(K - S, 0);
  // legs: [{kind:'call'|'put'|'stock'|'bond', n, K}]; a bond pays K at expiry
  function payoff(legs, S) {
    let v = 0;
    for (const l of legs) v += l.n * (l.kind === 'call' ? callPay(S, l.K) : l.kind === 'put' ? putPay(S, l.K) : l.kind === 'stock' ? S : l.K);
    return v;
  }
  const STRATS = { // n is the quantity; K is filled in by strat()
    call: [['call', 1]], put: [['put', 1]], scall: [['call', -1]], sput: [['put', -1]],
    protect: [['stock', 1], ['put', 1]], fiduciary: [['call', 1], ['bond', 1]],
    covered: [['stock', 1], ['call', -1]], straddle: [['call', 1], ['put', 1]], synth: [['call', 1], ['put', -1]]
  };
  const strat = (key, K) => STRATS[key].map(([kind, n]) => ({ kind, n, K }));
  // today's value of a set of legs under Black–Scholes
  function legsValue(legs, S, r, q, sigma, T) {
    let v = 0;
    for (const l of legs) v += l.n * (l.kind === 'call' || l.kind === 'put' ? bs({ S, K: l.K, r, q, sigma, T, type: l.kind }).price : l.kind === 'stock' ? S * Math.exp(-q * T) : l.K * Math.exp(-r * T));
    return v;
  }
  // C − P − (S·e^{−qT} − K·e^{−rT}); zero when parity holds
  const parityGap = (C, P, S, K, r, q, T) => C - P - (S * Math.exp(-q * T) - K * Math.exp(-r * T));
  // Given a quoted call, the put parity demands, and the arbitrage if the quoted put differs
  function parityArb(C, Pq, S, K, r, q, T) {
    const P = C - S * Math.exp(-q * T) + K * Math.exp(-r * T), gap = Pq - P;
    return { P, gap, kind: Math.abs(gap) < 0.005 ? 'none' : gap > 0 ? 'putRich' : 'putCheap', profit: Math.abs(gap) };
  }

  /* ───────── ch3: one step ───────── */
  // The stock goes to S·u or S·d; R = e^{rT} is the growth of one unit of cash. Replicate with Δ shares and B in cash.
  function oneStep(o) {
    const { S, u, d, r, T, K, type } = o, R = Math.exp(r * T);
    const pay = s => (type === 'put' ? putPay(s, K) : callPay(s, K));
    const Su = S * u, Sd = S * d, fu = pay(Su), fd = pay(Sd);
    const delta = (fu - fd) / (Su - Sd), B = (fu - delta * Su) / R; // Δ·Su + B·R = fu and Δ·Sd + B·R = fd
    const price = delta * S + B, q = (R - d) / (u - d);
    return { Su, Sd, fu, fd, delta, B, price, q, R, arbFree: d < R && R < u, viaQ: (q * fu + (1 - q) * fd) / R,
      naive: p => (p * fu + (1 - p) * fd) / R,           // "expected payoff, discounted": depends on p
      stockReturn: p => p * u + (1 - p) * d - 1,           // the stock's expected return under p
      optionReturn: p => (p * fu + (1 - p) * fd) / (delta * S + B) - 1 };
  }

  /* ───────── ch4: the CRR tree ───────── */
  function crr(o) {
    const { S, K, r, sigma, T, N } = o, q = o.q || 0, put = o.type === 'put', am = !!o.american;
    const dt = T / N, u = Math.exp(sigma * Math.sqrt(dt)), d = 1 / u, a = Math.exp((r - q) * dt), p = (a - d) / (u - d), disc = Math.exp(-r * dt);
    const pay = s => (put ? Math.max(K - s, 0) : Math.max(s - K, 0));
    let v = new Float64Array(N + 1);
    for (let j = 0; j <= N; j++) v[j] = pay(S * Math.pow(u, 2 * j - N));
    let v1 = null, early = 0;
    const keep = o.keep ? [Array.from(v)] : null;
    for (let i = N - 1; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        let x = disc * (p * v[j + 1] + (1 - p) * v[j]);
        if (am) { const ex = pay(S * Math.pow(u, 2 * j - i)); if (ex > x) { x = ex; early++; } }
        v[j] = x;
      }
      if (i === 1) v1 = [v[0], v[1]];
      if (keep) keep.unshift(Array.from(v.subarray(0, i + 1)));
    }
    return { price: v[0], u, d, p, dt, disc, early, delta: v1 ? (v1[1] - v1[0]) / (S * u - S * d) : NaN, levels: keep };
  }
  // stock prices on the tree's level i (j up-moves)
  const crrNode = (S, u, i, j) => S * Math.pow(u, 2 * j - i);

  /* ───────── ch6: Black–Scholes–Merton ───────── */
  function bs(o) {
    const { S, K, r, sigma, T } = o, q = o.q || 0, put = o.type === 'put';
    if (T <= 0 || sigma <= 0) {
      const f = S * Math.exp(-q * T) - K * Math.exp(-r * T), itm = put ? f < 0 : f > 0;
      return { price: Math.max(put ? -f : f, 0), delta: itm ? (put ? -1 : 1) : 0, gamma: 0, vega: 0, theta: 0, rho: 0, d1: NaN, d2: NaN };
    }
    const sq = sigma * Math.sqrt(T), d1 = (Math.log(S / K) + (r - q + sigma * sigma / 2) * T) / sq, d2 = d1 - sq;
    const eq = Math.exp(-q * T), er = Math.exp(-r * T), n1 = pdf(d1);
    const price = put ? K * er * cdf(-d2) - S * eq * cdf(-d1) : S * eq * cdf(d1) - K * er * cdf(d2);
    const delta = put ? -eq * cdf(-d1) : eq * cdf(d1);
    const gamma = eq * n1 / (S * sq), vega = S * eq * n1 * Math.sqrt(T);
    const theta = put ? -S * eq * n1 * sigma / (2 * Math.sqrt(T)) + r * K * er * cdf(-d2) - q * S * eq * cdf(-d1)
      : -S * eq * n1 * sigma / (2 * Math.sqrt(T)) - r * K * er * cdf(d2) + q * S * eq * cdf(d1);
    const rho = put ? -K * T * er * cdf(-d2) : K * T * er * cdf(d2);
    return { price, delta, gamma, vega, theta, rho, d1, d2, Nd1: cdf(d1), Nd2: cdf(d2), shares: S * eq * cdf(d1), loan: K * er * cdf(d2) };
  }
  // Black (1976): an option on a forward F, discount factor D
  function black76(F, K, D, sigma, T, type) {
    if (T <= 0 || sigma <= 0) return D * Math.max(type === 'put' ? K - F : F - K, 0);
    const sq = sigma * Math.sqrt(T), d1 = (Math.log(F / K) + sq * sq / 2) / sq, d2 = d1 - sq;
    return type === 'put' ? D * (K * cdf(-d2) - F * cdf(-d1)) : D * (F * cdf(d1) - K * cdf(d2));
  }
  // implied volatility by bisection on a price function increasing in sigma; NaN when the price is outside its bounds
  function impliedVol(price, f) {
    let lo = 1e-6, hi = 5;
    if (!(price > f(lo) + 1e-12) || !(price < f(hi))) return NaN;
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (f(mid) < price) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  /* ───────── ch5: geometric Brownian motion ───────── */
  // exact: S(t+dt) = S(t)·exp((μ − σ²/2)dt + σ√dt·Z)
  function gbmPaths(o) {
    const { S, mu, sigma, T, steps, paths, seed } = o, g = gaussian(rng(seed)), dt = T / steps;
    const drift = (mu - sigma * sigma / 2) * dt, vol = sigma * Math.sqrt(dt), out = [];
    for (let k = 0; k < paths; k++) { const p = new Float64Array(steps + 1); p[0] = S; for (let i = 1; i <= steps; i++) p[i] = p[i - 1] * Math.exp(drift + vol * g()); out.push(p); }
    return out;
  }
  function gbmStats(S, mu, sigma, T) {
    const m = (mu - sigma * sigma / 2) * T, s = sigma * Math.sqrt(T);
    return { logMean: m, logSd: s, median: S * Math.exp(m), mean: S * Math.exp(mu * T), pBelow: cdf(-m / s), lo: S * Math.exp(m - s), hi: S * Math.exp(m + s) };
  }
  // terminal log-returns only, for the histogram
  function gbmTerminal(o) {
    const { mu, sigma, T, paths, seed } = o, g = gaussian(rng(seed)), m = (mu - sigma * sigma / 2) * T, s = sigma * Math.sqrt(T), out = new Float64Array(paths);
    for (let k = 0; k < paths; k++) out[k] = m + s * g();
    return out;
  }
  function stats(a) { let s = 0; for (const x of a) s += x; const m = s / a.length; let v = 0; for (const x of a) v += (x - m) * (x - m); return { mean: m, sd: Math.sqrt(v / (a.length - 1)), n: a.length }; }

  /* ───────── ch6: the PDE by finite differences ─────────
     In time to expiry τ:  V_τ = ½σ²S²·V_SS + (r−q)·S·V_S − r·V,  V(S,0) = payoff.
     Uniform grid S_i = i·dS, i = 0..M, up to Smax; with S = i·dS the operator at node i is
       a_i·V_{i−1} + b_i·V_i + c_i·V_{i+1},  a = ½σ²i² − ½(r−q)i,  b = −σ²i² − r,  c = ½σ²i² + ½(r−q)i.
     explicit: V ← V + dτ·L V.  Crank–Nicolson: (I − ½dτ·L)·V_new = (I + ½dτ·L)·V_old, solved by the Thomas algorithm. */
  function pde(o) {
    const { K, r, sigma, T } = o, q = o.q || 0, put = o.type === 'put', M = o.M || 150, Nt = o.Nt || 150, Smax = o.Smax || 3 * K, scheme = o.scheme || 'cn';
    const dS = Smax / M, dt = T / Nt;
    const a = new Float64Array(M + 1), b = new Float64Array(M + 1), c = new Float64Array(M + 1);
    for (let i = 1; i < M; i++) { const s2 = sigma * sigma * i * i, m = (r - q) * i; a[i] = 0.5 * s2 - 0.5 * m; b[i] = -s2 - r; c[i] = 0.5 * s2 + 0.5 * m; }
    let V = new Float64Array(M + 1);
    for (let i = 0; i <= M; i++) V[i] = put ? Math.max(K - i * dS, 0) : Math.max(i * dS - K, 0);
    const lo = tau => (put ? K * Math.exp(-r * tau) : 0), hi = tau => (put ? 0 : Smax * Math.exp(-q * tau) - K * Math.exp(-r * tau));
    const stopAt = o.stopAt == null ? Nt : Math.min(Nt, o.stopAt);
    let blown = false;
    const W = new Float64Array(M + 1), cp = new Float64Array(M + 1), dp = new Float64Array(M + 1);
    for (let n = 1; n <= stopAt; n++) {
      const tau = n * dt;
      if (scheme === 'explicit') {
        for (let i = 1; i < M; i++) W[i] = V[i] + dt * (a[i] * V[i - 1] + b[i] * V[i] + c[i] * V[i + 1]);
      } else {
        // right-hand side
        for (let i = 1; i < M; i++) W[i] = V[i] + 0.5 * dt * (a[i] * V[i - 1] + b[i] * V[i] + c[i] * V[i + 1]);
        const L0 = lo(tau), LM = hi(tau);
        W[1] += 0.5 * dt * a[1] * L0; W[M - 1] += 0.5 * dt * c[M - 1] * LM;
        // tridiagonal: −½dt·a_i, 1 − ½dt·b_i, −½dt·c_i
        cp[1] = (-0.5 * dt * c[1]) / (1 - 0.5 * dt * b[1]); dp[1] = W[1] / (1 - 0.5 * dt * b[1]);
        for (let i = 2; i < M; i++) { const A = -0.5 * dt * a[i], den = (1 - 0.5 * dt * b[i]) - A * cp[i - 1]; cp[i] = (-0.5 * dt * c[i]) / den; dp[i] = (W[i] - A * dp[i - 1]) / den; }
        W[M - 1] = dp[M - 1];
        for (let i = M - 2; i >= 1; i--) W[i] = dp[i] - cp[i] * W[i + 1];
      }
      W[0] = lo(tau); W[M] = hi(tau);
      for (let i = 0; i <= M; i++) V[i] = W[i];
      if (!blown) for (let i = 0; i <= M; i += 1) if (!(Math.abs(V[i]) < 1e6 * K)) { blown = true; break; }
      if (blown) break;
    }
    // wiggles: an unstable explicit run oscillates long before it overflows
    let wig = 0; for (let i = 2; i < M - 1; i++) { const d2a = V[i + 1] - 2 * V[i] + V[i - 1]; if (d2a < -1e-6 * K) wig++; }
    const at = S => { const x = S / dS, i = Math.min(M - 1, Math.max(0, Math.floor(x))), w = x - i; return V[i] * (1 - w) + V[i + 1] * w; };
    // explicit scheme is stable when dτ ≤ 1/(σ²M² + r) (the weights stay non-negative at the top node)
    const dtMax = 1 / (sigma * sigma * M * M + r);
    return { V, dS, dt, M, Nt, Smax, at, blown, unstable: blown || wig > 0, wig, dtMax, stableNt: Math.ceil(T / dtMax), tau: stopAt * dt };
  }

  /* ───────── ch7: delta hedging a sold option ─────────
     The seller receives the premium priced at sigmaImp, holds Δ(S,t; sigmaImp) shares financed at r, and rebalances
     n times. The stock really moves with drift mu and volatility sigmaReal. P&L is measured at expiry. */
  function hedgeSim(o) {
    const { S, K, r, T, n, paths, seed } = o, si = o.sigmaImp, sr = o.sigmaReal, mu = o.mu == null ? r : o.mu, type = o.type || 'call';
    const g = gaussian(rng(seed)), dt = T / n, gr = Math.exp(r * dt), drift = (mu - sr * sr / 2) * dt, vol = sr * Math.sqrt(dt);
    const prem = bs({ S, K, r, sigma: si, T, type }).price, pnl = new Float64Array(paths);
    for (let k = 0; k < paths; k++) {
      let s = S, sh = bs({ S, K, r, sigma: si, T, type }).delta, cash = prem - sh * s;
      for (let i = 1; i <= n; i++) {
        s *= Math.exp(drift + vol * g()); cash *= gr;
        if (i < n) { const nd = bs({ S: s, K, r, sigma: si, T: T - i * dt, type }).delta; cash -= (nd - sh) * s; sh = nd; }
      }
      pnl[k] = cash + sh * s - (type === 'put' ? putPay(s, K) : callPay(s, K));
    }
    const st = stats(pnl);
    return { pnl, prem, mean: st.mean, sd: st.sd, se: st.sd / Math.sqrt(paths) };
  }
  // one path with its bookkeeping, for the drawing
  function hedgePath(o) {
    const { S, K, r, T, n, seed } = o, si = o.sigmaImp, sr = o.sigmaReal, mu = o.mu == null ? r : o.mu, type = o.type || 'call';
    const g = gaussian(rng(seed)), dt = T / n, gr = Math.exp(r * dt);
    let s = S, sh = bs({ S, K, r, sigma: si, T, type }).delta, cash = bs({ S, K, r, sigma: si, T, type }).price - sh * s;
    const rows = [{ t: 0, s, sh, port: cash + sh * s, opt: bs({ S, K, r, sigma: si, T, type }).price }];
    for (let i = 1; i <= n; i++) {
      s *= Math.exp((mu - sr * sr / 2) * dt + sr * Math.sqrt(dt) * g()); cash *= gr;
      const opt = bs({ S: s, K, r, sigma: si, T: T - i * dt, type }).price, port = cash + sh * s;
      if (i < n) { const nd = bs({ S: s, K, r, sigma: si, T: T - i * dt, type }).delta; cash -= (nd - sh) * s; sh = nd; }
      rows.push({ t: i * dt, s, sh, port, opt });
    }
    return rows;
  }
  // Kamal & Derman (1999): with n rebalances and the right volatility, sd(P&L) ≈ √(π/4)·vega·σ/√n
  const hedgeSdApprox = (S, K, r, sigma, T, n) => Math.sqrt(Math.PI / 4) * bs({ S, K, r, sigma, T }).vega * sigma / Math.sqrt(n);
  // Continuous hedging at the priced volatility while the stock moves at the realised one (mu = r):
  //   E[P&L at T] = ½(σi² − σr²)·∫₀ᵀ e^{r(T−t)}·E[S_t²·Γ_i(S_t, t)] dt   (Carr; Ahmad & Wilmott 2005), by quadrature
  function hedgeMeanTheory(S, K, r, T, si, sr) {
    const NT = 400, NZ = 201; let tot = 0;
    for (let k = 0; k < NT; k++) {
      const t = (k + 0.5) * T / NT; let e = 0;
      for (let j = 0; j < NZ; j++) {
        const z = -8 + 16 * j / (NZ - 1), w = (j === 0 || j === NZ - 1 ? 1 : j % 2 ? 4 : 2) * (16 / (NZ - 1)) / 3;
        const st = S * Math.exp((r - sr * sr / 2) * t + sr * Math.sqrt(t) * z);
        e += w * pdf(z) * st * st * bs({ S: st, K, r, sigma: si, T: T - t }).gamma;
      }
      tot += Math.exp(r * (T - t)) * e * T / NT;
    }
    return 0.5 * (si * si - sr * sr) * tot;
  }

  /* ───────── ch8: the smile from the shipped snapshot ─────────
     For one expiry: regress C − P on K over the strikes near the money. Parity says C − P = D·(F − K), so the slope
     is −D and the intercept D·F: the market's own discount factor and forward. Then invert Black (1976) on the
     out-of-the-money option's mid price at each strike. */
  function smile(key) {
    const E = DATA.SMILE.expiries[key], T = E.T, rows = E.rows;
    const near = rows.filter(x => Math.abs(x.K / DATA.SMILE.spot - 1) < 0.06);
    let sx = 0, sy = 0, sxx = 0, sxy = 0; const n = near.length;
    for (const x of near) { const y = (x.cb + x.ca) / 2 - (x.pb + x.pa) / 2; sx += x.K; sy += y; sxx += x.K * x.K; sxy += x.K * y; }
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx), D = -slope, F = (sy - slope * sx) / n / D;
    const pts = rows.map(x => {
      const put = x.K < F, mid = put ? (x.pb + x.pa) / 2 : (x.cb + x.ca) / 2, type = put ? 'put' : 'call';
      const iv = impliedVol(mid, s => black76(F, x.K, D, s, T, type));
      const ivB = impliedVol(put ? x.pb : x.cb, s => black76(F, x.K, D, s, T, type)), ivA = impliedVol(put ? x.pa : x.ca, s => black76(F, x.K, D, s, T, type));
      return { K: x.K, m: x.K / F, type, mid, iv, ivB, ivA, cboe: put ? x.piv : x.civ };
    });
    const atm = pts.reduce((b, p) => (Math.abs(p.m - 1) < Math.abs(b.m - 1) ? p : b));
    const near9 = t => pts.reduce((b, p) => (Math.abs(p.m - t) < Math.abs(b.m - t) ? p : b));
    return { T, D, F, rate: -Math.log(D) / T, carry: Math.log(F / DATA.SMILE.spot) / T, pts, atm, p90: near9(0.9), p105: near9(1.05) };
  }
  // What a 10%-below put is worth at its own implied volatility, against at the at-the-money one
  function smileMisprice(key) {
    const s = smile(key), p = s.p90;
    const flat = black76(s.F, p.K, s.D, s.atm.iv, s.T, 'put');
    return { K: p.K, market: p.mid, flat, ratio: p.mid / flat };
  }

  /* ───────── ch8: tails ───────── */
  // P(|Z| ≥ k) and how many such days a normal distribution expects among n
  const twoTail = k => 2 * cdf(-k);
  function tails(k) {
    const R = DATA.RETURNS, obs = R.exceed[k.toFixed(1)]; // counts of |z| ≥ k, k in half-sigma steps from 2 to 10
    const exp = R.n * twoTail(k);
    return { k, obs, exp, ratio: obs / exp, pct: k * R.sd, yearsNormal: 1 / (twoTail(k) * R.perYear), yearsObs: obs ? R.n / obs / R.perYear : Infinity };
  }
  // the crash of 19 October 1987 on this index, in the units of the sample's daily standard deviation
  function crash87() {
    const R = DATA.RETURNS, z = (R.oct19.log - R.mean) / R.sd, p = cdf(z);
    return { z, pct: R.oct19.pct, log10p: Math.log10(pdf(z) / Math.abs(z)) /* tail ≈ φ(z)/|z| for large |z| */, p };
  }

  /* ───────── ch9: Heston ─────────
     dS = r·S·dt + √v·S·dW₁,  dv = κ(θ − v)dt + ξ√v·dW₂,  corr(dW₁, dW₂) = ρ.
     Full-truncation Euler on log S (v⁺ = max(v, 0) in the drift and the diffusion). */
  function hestonMC(o) {
    const { S, r, T, v0, kappa, theta, xi, rho, paths, steps, seed, strikes } = o, g = gaussian(rng(seed)), dt = T / steps, sq = Math.sqrt(dt), rc = Math.sqrt(1 - rho * rho);
    const ST = new Float64Array(paths);
    for (let k = 0; k < paths; k++) {
      let x = Math.log(S), v = v0;
      for (let i = 0; i < steps; i++) {
        const z1 = g(), z2 = rho * z1 + rc * g(), vp = v > 0 ? v : 0, sv = Math.sqrt(vp);
        x += (r - vp / 2) * dt + sv * sq * z1;
        v += kappa * (theta - vp) * dt + xi * sv * sq * z2;
      }
      ST[k] = Math.exp(x);
    }
    const D = Math.exp(-r * T), F = S * Math.exp(r * T);
    // control variate: E[S_T] = F is known; price OTM options, with the stock itself as control
    let ms = 0; for (const s of ST) ms += s; ms /= paths;
    const out = strikes.map(K => {
      const put = K < F; let m = 0, m2 = 0, cv = 0, vs = 0;
      for (const s of ST) { const p = put ? Math.max(K - s, 0) : Math.max(s - K, 0); m += p; m2 += p * p; cv += p * (s - ms); vs += (s - ms) * (s - ms); }
      m /= paths; const beta = cv / vs, adj = m - beta * (ms - F);
      const varp = m2 / paths - m * m, varAdj = Math.max(varp - beta * beta * vs / paths, 0);
      const price = D * adj, se = D * Math.sqrt(varAdj / paths), type = put ? 'put' : 'call';
      return { K, type, price, se, iv: impliedVol(price, s => black76(F, K, D, s, T, type)) };
    });
    return { F, D, pts: out, meanS: ms };
  }
  // The same model by its characteristic function (Heston 1993 in the form of Albrecher et al. 2007), call price
  function hestonCF(o) {
    const { S, K, r, T, v0, kappa, theta, xi, rho } = o;
    // complex helpers on [re, im]
    const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
    const cexp = a => { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; };
    const clog = a => [Math.log(Math.hypot(a[0], a[1])), Math.atan2(a[1], a[0])];
    const csqrt = a => { const m = Math.hypot(a[0], a[1]); if (a[0] >= 0) { const re = Math.sqrt((m + a[0]) / 2); return [re, re ? a[1] / (2 * re) : 0]; } const im = Math.sqrt((m - a[0]) / 2); return [Math.abs(a[1]) / (2 * im), a[1] < 0 ? -im : im]; }; // stable principal root
    const x0 = Math.log(S);
    function phi(u) { // E[exp(i·u·ln S_T)], u complex
      const iu = mul([0, 1], u), b = sub([kappa, 0], mul([rho * xi, 0], iu));
      const d = csqrt(add(mul(b, b), mul([xi * xi, 0], add(iu, mul(u, u)))));
      const g2 = div(sub(b, d), add(b, d)), edT = cexp(mul([-T, 0], d));
      const C = add(mul([r * T, 0], iu), mul([kappa * theta / (xi * xi), 0], sub(mul(sub(b, d), [T, 0]), mul([2, 0], clog(div(sub([1, 0], mul(g2, edT)), sub([1, 0], g2)))))));
      const Dd = mul(div(sub(b, d), [xi * xi, 0]), div(sub([1, 0], edT), sub([1, 0], mul(g2, edT))));
      return cexp(add(add(C, mul(Dd, [v0, 0])), mul(iu, [x0, 0])));
    }
    const F = S * Math.exp(r * T), lnK = Math.log(K);
    // P1, P2 by Simpson on [ε, 200 + ε]; the integrand is finite at 0 but loses precision there (b − d cancels),
    // so the rule starts at ε = 1e-5 and the sliver [0, ε] is added as ε·f(ε)
    const NU = 4000, U = 200, h = U / NU, EPS = 1e-5; let p1 = 0, p2 = 0;
    for (let j = 0; j <= NU; j++) {
      const u = EPS + j * h, w = (j === 0 ? 1 + 3 * EPS / h : j === NU ? 1 : j % 2 ? 4 : 2) * h / 3;
      const e = cexp([0, -u * lnK]);
      const f2 = div(mul(e, phi([u, 0])), [0, u]), f1 = div(mul(e, phi([u, -1])), mul([0, u], [F, 0]));
      p1 += w * f1[0]; p2 += w * f2[0];
    }
    const P1 = 0.5 + p1 / Math.PI, P2 = 0.5 + p2 / Math.PI;
    return S * P1 - K * Math.exp(-r * T) * P2;
  }

  /* ───────── ch9: margin ─────────
     One long futures contract on notional N. The account starts with initial margin im·N; each day's gain or loss is
     paid in or out (variation margin). When equity falls below mm·N a call restores it to im·N if the holder has
     money left in reserve, else the position is closed at that day's price. Daily moves are normal with volatility
     sigma (annual) and no drift. */
  function marginSim(o) {
    const { im, mm, sigma, days, seed, reserve } = o, N = o.notional || 100, g = gaussian(rng(seed)), sd = sigma / Math.sqrt(252);
    let price = 100, eq = im * N, res = reserve * N, calls = 0, closed = -1, paid = 0;
    const rows = [{ d: 0, price, eq }];
    for (let d = 1; d <= days; d++) {
      const np = price * Math.exp(-sd * sd / 2 + sd * g()); let callToday = false;
      if (closed < 0) {
        eq += N * (np - price) / 100;
        if (eq < mm * N) {
          const need = im * N - eq;
          callToday = true;
          if (res >= need) { res -= need; paid += need; eq = im * N; calls++; }
          else { closed = d; }
        }
      }
      price = np; rows.push({ d, price, eq: closed >= 0 && closed < d ? null : eq, call: callToday });
    }
    const finalPrice = price, unlevered = N * (finalPrice - 100) / 100;
    const outcome = closed >= 0 ? rows[closed].eq - im * N - paid : eq - im * N - paid;
    return { rows, calls, closed, paid, finalPrice, unlevered, outcome, leverage: 1 / im, wipe: -im * 100 };
  }
  // how often (out of `runs` seeds) the position is closed out before the end
  function marginStats(o, runs) {
    let closed = 0, rescued = 0;
    for (let k = 0; k < runs; k++) { const r = marginSim(Object.assign({}, o, { seed: o.seed + 1000 + k })); if (r.closed >= 0) { closed++; if (r.unlevered > 0) rescued++; } }
    return { closed: closed / runs, wouldHaveWon: rescued / runs };
  }

  /* ───────── ch9: netting ─────────
     owes[i][j] = what i owes j. Bilateral gross: every entry. Bilateral net: |owes[i][j] − owes[j][i]| per pair.
     Through one central counterparty: each member's single net position against it. */
  const NET_EXAMPLE = { names: ['A', 'B', 'C', 'D'], owes: [[0, 90, 40, 0], [60, 0, 70, 30], [50, 20, 0, 80], [10, 50, 60, 0]] }; // TUNED: an example
  function netting(owes) {
    const n = owes.length; let gross = 0, bil = 0, links = 0; const net = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { gross += owes[i][j]; net[i] += owes[j][i] - owes[i][j]; if (j > i) { bil += Math.abs(owes[i][j] - owes[j][i]); if (owes[i][j] || owes[j][i]) links++; } }
    const pairs = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push({ i, j, net: owes[i][j] - owes[j][i] });
    return { gross, bilateral: bil, ccp: net.reduce((s, x) => s + Math.max(x, 0), 0), net, links, pairs };
  }

  /* ───────── ch10: the minimum-variance hedge ─────────
     A producer will sell one unit at an uncertain price (sd σs) and sells h futures (sd σf, correlation ρ with the
     price they actually get). Var = σs² + h²σf² − 2hρσsσf, least at h* = ρσs/σf, where it is σs²(1 − ρ²). */
  function minVar(o) {
    const { sigS, sigF, rho, h } = o, v = hh => sigS * sigS + hh * hh * sigF * sigF - 2 * hh * rho * sigS * sigF, hs = rho * sigS / sigF;
    return { sd: Math.sqrt(Math.max(v(h), 0)), sd0: sigS, hStar: hs, sdStar: Math.sqrt(Math.max(v(hs), 0)), cut: 1 - Math.sqrt(Math.max(v(h), 0)) / sigS, cutStar: 1 - Math.sqrt(1 - rho * rho) };
  }
  // a seeded sample of the producer's income per unit for the picture: spot S_T and futures F_T around 100
  function hedgeSample(o) {
    const { sigS, sigF, rho, h, n, seed } = o, g = gaussian(rng(seed)), rc = Math.sqrt(1 - rho * rho), out = new Float64Array(n), raw = new Float64Array(n);
    for (let k = 0; k < n; k++) { const z1 = g(), z2 = rho * z1 + rc * g(); const s = 100 + sigS * z2, f = 100 + sigF * z1; raw[k] = s; out[k] = s - h * (f - 100); }
    return { hedged: out, raw };
  }

  /* ───────── ch11: perpetual funding (a toy of the mechanism only) ─────────
     Every period the longs pay the shorts k·(perp − spot)/spot of the notional. An arbitrageur who is short the perp
     and long the spot collects it; the page shows the payment, not a strategy. */
  const funding = (perp, spot, k) => k * (perp - spot) / spot;

  /* ───────── the frontier data block (ch8, ch10, ch11) ─────────
     Every entry: value, as-of date, source (BRIEF.md "Facts that will go stale" has the URL and the day it was opened).
     kind: 'established' | 'demonstrated' | 'claimed'. Update here; the prose binds to these through bindings.cjs. */
  const FRONTIER = {
    asOf: '2026-11',
    bisOtc: { date: '2025-06', notionalTn: 846, gmvTn: 21.8, yoyNotionalPct: 16, irdSharePct: 79, fxTn: 155, published: '2025-12-08', src: 'BIS, OTC derivatives statistics at end-June 2025' },
    bisOtcDec: { date: '2025-12', notionalTn: 844.6, gmvTn: 22.8, src: 'ISDA summary (2026-07-09) of BIS data; BIS page not opened' },
    triennial: { date: '2025-04', irdDailyTn: 7.9, fxDailyTn: 9.6, published: '2025-09-30', src: 'BIS Triennial Central Bank Survey 2025' },
    fia2025: { totalBn: 119.29, futuresBn: 30.64, optionsBn: 88.65, totalChgPct: -42.2, optionsChgPct: -50.3, futuresChgPct: 8.6, equityChgPct: -48.8, published: '2026-01-12', src: 'FIA, ETD volume December 2025' },
    usOptions: { date: '2026-Q2', advMn: 72.8, yoyPct: 19, zeroDteMn: 20, zeroDteYtdPct: 46.2, published: '2026-07-21', src: 'Cboe, State of the Options Industry Q2 2026' },
    spx0dte: { date: '2026-07', sharePct: 66.2, published: '2026-08-05', src: 'Cboe Global Markets, trading volume for July 2026' },
    cboe0dte: { date: '2025-05-02', mmGammaPct: 0.2, retailLo: 50, retailHi: 60, src: 'Cboe, 0DTEs Decoded (M. Xu)' },
    sebi: { fy26LossPct: 87.7, fy26TradersLakh: 78.6, fy22to24LossPct: 93, buyersPct: 97, fiveYearProfitPct: 0.5, fiveYearLossPct: 65.6, published: '2026-08', src: 'SEBI, Trading Behaviour of Individual Traders in the Equity Derivatives Segment (FY25–FY26)' },
    treasuryClearing: { cash: '2026-12-31', repo: '2027-06-30', decided: '2025-02-25', src: 'SEC press release 2025-43' },
    libor: { usdEnd: '2023-06-30', src: 'ARRC (Federal Reserve Bank of New York)' },
    crash87: { djiaPct: 22.6, djiaPts: 508, src: 'Federal Reserve History, Stock Market Crash of 1987' },
    ltcm: { leverage: 30, augLossPct: 44, rescueBn: 3.6, firms: 14, date: '1998-09-23', src: 'Federal Reserve History, Near Failure of Long-Term Capital Management' },
    aig: { loanBn: 85, date: '2008-09-16', src: 'Federal Reserve Board, AIG, Maiden Lane II and III' },
    perpClaim: { year: 2025, volumeTn: 61.8, src: 'CryptoQuant figure as quoted in secondary coverage; exchange-reported volume, not verified' },
    sofr: { date: '2026-11-16', pct: 3.93, src: 'FRED series SOFR (Federal Reserve Bank of New York)' }
  };

  /* ───────── the running example and the labs' defaults (shared by app.js, bindings.cjs and the tests) ───────── */
  const EX = {
    base: { S: 100, K: 100, r: 0.04, sigma: 0.2, T: 1 },                      // the stock every chapter prices
    one: { S: 100, u: 1.2, d: 0.8, r: 0.04, T: 1, K: 100, type: 'call' },     // ch3
    hedge: { paths: 1500, seed: 1, NS: [1, 4, 12, 52, 252] },                 // ch7
    heston: { S: 100, r: 0.04, T: 0.5, v0: 0.04, kappa: 2, theta: 0.04, xi: 0.5, rho: -0.7, paths: 20000, steps: 50, seed: 1,
      strikes: [70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130] }, // ch9; TUNED for a visible skew, not fitted
    margin: { im: 0.10, mmFrac: 0.75, sigma: 0.20, days: 120, seed: 10, runs: 400 }, // ch9; TUNED
    farm: { sigS: 15, sigF: 15, n: 2000, seed: 1 }                            // ch10; TUNED
  };

  /* ───────── number formatting ───────── */
  function fmt(x, d, lang) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    d = d == null ? 0 : d;
    let s = Math.abs(x).toFixed(d);
    if (+s === 0) return s; // no "−0.00"
    const [i, f] = s.split('.');
    s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
    return (x < 0 ? '−' : '') + s;
  }
  const signed = (x, d, lang) => { const s = fmt(x, d, lang); return x > 0 && +Math.abs(x).toFixed(d == null ? 0 : d) !== 0 ? '+' + s : s; };
  function sci(x, d) { // 1.2 × 10⁻⁷
    if (x === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e), sup = String(e).replace(/-/g, '⁻').replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
    return m.toFixed(d == null ? 1 : d) + ' × 10' + sup;
  }

  return { rng, gaussian, pdf, cdf, forward, forwardArb, callPay, putPay, payoff, STRATS, strat, legsValue, parityGap, parityArb, oneStep, crr, crrNode, bs, black76, impliedVol,
    gbmPaths, gbmStats, gbmTerminal, stats, pde, hedgeSim, hedgePath, hedgeSdApprox, hedgeMeanTheory, smile, smileMisprice, twoTail, tails, crash87,
    hestonMC, hestonCF, marginSim, marginStats, NET_EXAMPLE, netting, minVar, hedgeSample, funding, FRONTIER, EX, DATA, fmt, signed, sci };
});
