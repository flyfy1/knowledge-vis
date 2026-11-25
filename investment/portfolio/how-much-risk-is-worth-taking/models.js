/* How much risk is worth taking: pure models (UMD: page and node). Returns, volatilities and rates are decimals a
   year. Every asset here is invented; its parameters are labelled assumptions, not estimates of any real market.
   Sources for each model: Markowitz (1952), Merton (1972) closed-form frontier; Tobin (1958) separation and Sharpe
   (1966) ratio; Lo (2002) standard error of a Sharpe ratio; Michaud (1989), Chopra–Ziemba (1993), DeMiguel–Garlappi–
   Uppal (2009) estimation error; Kelly (1956), Merton (1969), Thorp (2006) growth-optimal betting; Booth–Fama (1992)
   and Fernholz (2002) diversification return. */
(function (root, factory) {
  const M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M; else root.RiskModels = M;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const sqrt = Math.sqrt, ln = Math.log, exp = Math.exp;

  /* ───── helpers ───── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(R) { let u = 0, v = 0; while (u === 0) u = R(); while (v === 0) v = R(); return sqrt(-2 * ln(u)) * Math.cos(2 * Math.PI * v); }
  function gamma(R, k) { // Marsaglia–Tsang (2000), shape k > 0, scale 1
    if (k < 1) return gamma(R, k + 1) * Math.pow(R() || 1e-12, 1 / k);
    const d = k - 1 / 3, c = 1 / sqrt(9 * d);
    for (;;) { let x, v; do { x = gauss(R); v = 1 + c * x; } while (v <= 0); v = v * v * v; const u = R(); if (u < 1 - 0.0331 * x * x * x * x) return d * v; if (ln(u) < 0.5 * x * x + d * (1 - v + ln(v))) return d * v; }
  }
  function ncdf(x) { const s = x < 0 ? -1 : 1, z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.3275911 * z); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-z * z); return 0.5 * (1 + s * y); }
  const npdf = x => exp(-x * x / 2) / sqrt(2 * Math.PI);
  function fmt(x, d) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    d = d == null ? 0 : d; let s = Math.abs(x).toFixed(d);
    if (+s === 0) return s;
    const [i, f] = s.split('.'); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
    return (x < 0 ? '−' : '') + s;
  }
  const signed = (x, d) => { const s = fmt(x, d); return x > 0 && +Math.abs(x).toFixed(d == null ? 0 : d) !== 0 ? '+' + s : s; };
  const sum = a => a.reduce((s, v) => s + v, 0);
  const quant = (arr, q) => { const a = arr.slice().sort((x, y) => x - y), i = (a.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); };
  const median = a => quant(a, 0.5);

  /* ───── small linear algebra ───── */
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  const mv = (A, x) => A.map(r => dot(r, x));
  const quad = (w, S) => dot(w, mv(S, w));
  function inv(A) { // Gauss–Jordan with partial pivoting
    const n = A.length, M_ = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M_[r][c]) > Math.abs(M_[p][c])) p = r;
      if (Math.abs(M_[p][c]) < 1e-14) return null;
      [M_[c], M_[p]] = [M_[p], M_[c]];
      const d = M_[c][c]; for (let j = 0; j < 2 * n; j++) M_[c][j] /= d;
      for (let r = 0; r < n; r++) if (r !== c) { const f = M_[r][c]; if (f) for (let j = 0; j < 2 * n; j++) M_[r][j] -= f * M_[c][j]; }
    }
    return M_.map(r => r.slice(n));
  }
  function chol(S) { const n = S.length, L = S.map(() => Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = S[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k]; if (i === j) { if (s <= 0) return null; L[i][i] = sqrt(s); } else L[i][j] = s / L[j][j]; } return L; }
  const covFrom = (sig, rho) => sig.map((si, i) => sig.map((sj, j) => (i === j ? si * si : rho[i][j] * si * sj)));
  const sub = (v, idx) => idx.map(i => v[i]);
  const subM = (S, idx) => idx.map(i => idx.map(j => S[i][j]));
  const expand = (n, idx, w) => { const o = Array(n).fill(0); idx.forEach((i, k) => { o[i] = w[k]; }); return o; };
  function subsets(n) { const o = []; for (let m = 1; m < (1 << n); m++) { const s = []; for (let i = 0; i < n; i++) if (m & (1 << i)) s.push(i); o.push(s); } return o; }

  /* ───── the four invented assets of chapters 2–6 (labelled assumptions) ───── */
  const ASSETS = {
    mu: [0.04, 0.07, 0.09, 0.06],
    sig: [0.08, 0.16, 0.22, 0.18],
    rho: [[1, 0.2, 0.3, 0.1], [0.2, 1, 0.6, 0.3], [0.3, 0.6, 1, 0.4], [0.1, 0.3, 0.4, 1]],
    rf: 0.03
  };

  /* ch1: the risk floor. Equal weights over N assets with the same volatility s and average correlation r */
  function floor1(N, s, r) {
    const v = s * s / N + (1 - 1 / N) * r * s * s;
    return { var: v, vol: sqrt(v), floor: sqrt(r) * s, offShare: (N * N - N) / (N * N) };
  }
  // how many assets until the volatility is within (1 + tol) of the floor
  function nToFloor(s, r, tol) { if (r <= 0) return Infinity; for (let N = 1; N < 1e6; N++) if (floor1(N, s, r).vol <= sqrt(r) * s * (1 + tol)) return N; return Infinity; }

  /* ch2: the minimum-variance frontier, closed form (Merton 1972) */
  function abc(mu, S) {
    const Si = inv(S); if (!Si) return null;
    const one = mu.map(() => 1), a1 = mv(Si, one), am = mv(Si, mu);
    const A = sum(a1), B = sum(am), C = dot(mu, am), D = A * C - B * B;
    return { Si, A, B, C, D, a1, am };
  }
  function frontierU(mu, S) { // unconstrained (short sales allowed)
    const k = abc(mu, S); if (!k || k.D <= 1e-14) return null;
    const vol = m => sqrt(Math.max(0, (k.A * m * m - 2 * k.B * m + k.C) / k.D));
    const w = m => k.a1.map((v, i) => ((k.C - k.B * m) * v + (k.A * m - k.B) * k.am[i]) / k.D);
    return { k, vol, w, mMin: k.B / k.A, sMin: sqrt(1 / k.A) };
  }
  // no short sales: for a target mean m, the cheapest feasible subset solution (exact; n ≤ 5 so 2^n subsets is fine)
  function minVarNS(mu, S, m) {
    const n = mu.length; let best = null;
    for (const idx of subsets(n)) {
      let w;
      if (idx.length === 1) { if (Math.abs(mu[idx[0]] - m) > 1e-10) continue; w = [1]; }
      else { const F = frontierU(sub(mu, idx), subM(S, idx)); if (!F) continue; w = F.w(m); }
      if (w.some(x => x < -1e-10)) continue;
      const W = expand(n, idx, w.map(x => Math.max(0, x))), v = quad(W, S);
      if (!best || v < best.var - 1e-15) best = { w: W, var: v, vol: sqrt(v), m: dot(W, mu) };
    }
    return best;
  }
  function gmvNS(S) { // global minimum variance, no short sales
    const n = S.length; let best = null;
    for (const idx of subsets(n)) {
      const Si = inv(subM(S, idx)); if (!Si) continue; const a = mv(Si, idx.map(() => 1)), A = sum(a); const w = a.map(v => v / A);
      if (w.some(x => x < -1e-10)) continue; const W = expand(n, idx, w), v = quad(W, S);
      if (!best || v < best.var) best = { w: W, var: v, vol: sqrt(v) };
    }
    return best;
  }
  function frontierCurve(mu, S, noShort, steps) {
    steps = steps || 80; const lo = noShort ? Math.min(...mu) : Math.min(...mu) - 0.03, hi = noShort ? Math.max(...mu) : Math.max(...mu) + 0.03, o = [];
    const F = noShort ? null : frontierU(mu, S);
    for (let i = 0; i <= steps; i++) { const m = lo + (hi - lo) * i / steps; if (noShort) { const r = minVarNS(mu, S, m); if (r) o.push([r.vol, m]); } else if (F) o.push([F.vol(m), m]); }
    return o;
  }

  /* ch3: tangency portfolio and capital market line */
  const sharpe = (m, s, rf) => (m - rf) / s;
  function tangencyU(mu, S, rf) {
    const Si = inv(S); if (!Si) return null; const ex = mu.map(v => v - rf), z = mv(Si, ex), t = sum(z);
    if (t <= 1e-14) return null; const w = z.map(v => v / t), m = dot(w, mu), s = sqrt(quad(w, S));
    return { w, m, s, sr: (m - rf) / s, srMax: sqrt(dot(ex, z)) };
  }
  function tangencyNS(mu, S, rf) {
    const n = mu.length; let best = null;
    for (const idx of subsets(n)) {
      let w;
      if (idx.length === 1) w = [1];
      else { const T = tangencyU(sub(mu, idx), subM(S, idx), rf); if (!T) continue; w = T.w; }
      if (w.some(x => x < -1e-10)) continue;
      const W = expand(n, idx, w.map(x => Math.max(0, x))), m = dot(W, mu), s = sqrt(quad(W, S)), sr = (m - rf) / s;
      if (!best || sr > best.sr + 1e-12) best = { w: W, m, s, sr };
    }
    return best;
  }
  // a point on the capital market line: fraction a in the tangency portfolio, 1 − a at rf (a > 1 = borrowing)
  const cml = (T, rf, a) => ({ m: rf + a * (T.m - rf), s: a * T.s });
  // CAPM inside the model: betas against the tangency portfolio, and the identity μ_i − rf = β_i (μ_T − rf)
  function betas(mu, S, w) { const Sw = mv(S, w), vT = dot(w, Sw); return Sw.map(c => c / vT); }

  /* ch4: how noisy a measured Sharpe ratio is */
  const sharpeSE = (S, T) => sqrt((1 + S * S / 2) / T); // Lo (2002), iid returns, S annual, T years
  function expMaxNormal(K) { // E[max of K iid N(0,1)], numerical integral
    if (K === 1) return 0; let s = 0; const h = 0.001;
    for (let x = -8; x <= 8; x += h) s += x * K * npdf(x) * Math.pow(ncdf(x), K - 1) * h;
    return s;
  }
  // simulate: K strategies with the same true annual Sharpe S, T years of monthly returns; report the best measured one.
  // Exact sampling for normal returns: the sample mean is normal, (n−1)s²/σ² is chi-square(n−1) = 2·Gamma((n−1)/2).
  function sharpeTrials(S, T, K, trials, seed) {
    const R = rng(seed), n = Math.round(T * 12), mu = S / sqrt(12), out = [];
    for (let k = 0; k < trials; k++) {
      let best = -Infinity;
      for (let j = 0; j < K; j++) {
        const mean = mu + gauss(R) / sqrt(n), s2 = 2 * gamma(R, (n - 1) / 2) / (n - 1);
        const sr = mean / sqrt(s2) * sqrt(12); if (sr > best) best = sr;
      }
      out.push(best);
    }
    return out;
  }

  /* ch6: estimation error. Draw T years of monthly returns from the true parameters, re-estimate, re-optimise */
  function sampleMoments(R, mu, S, months) {
    const n = mu.length, L = chol(S.map(r => r.map(v => v / 12))), m12 = mu.map(v => v / 12), X = [];
    for (let t = 0; t < months; t++) { const z = mu.map(() => gauss(R)); X.push(m12.map((m, i) => { let s = m; for (let k = 0; k <= i; k++) s += L[i][k] * z[k]; return s; })); }
    const mean = Array(n).fill(0); X.forEach(x => x.forEach((v, i) => { mean[i] += v / months; }));
    const C = mean.map(() => Array(n).fill(0)); X.forEach(x => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) C[i][j] += (x[i] - mean[i]) * (x[j] - mean[j]) / (months - 1); });
    return { mu: mean.map(v => v * 12), S: C.map(r => r.map(v => v * 12)) };
  }
  function resample(P, years, trials, seed, knowMu) {
    const R = rng(seed), S = covFrom(P.sig, P.rho), n = P.mu.length, months = Math.round(years * 12), out = [];
    const trueSR = w => { const m = dot(w, P.mu), s = sqrt(quad(w, S)); return (m - P.rf) / s; };
    for (let k = 0; k < trials; k++) {
      const e = sampleMoments(R, P.mu, S, months), muHat = knowMu ? P.mu : e.mu;
      const T = tangencyNS(muHat, e.S, P.rf);
      out.push({ w: T.w, sr: trueSR(T.w), muHat: e.mu });
    }
    const opt = tangencyNS(P.mu, S, P.rf), eq = P.mu.map(() => 1 / n), iv = (() => { const a = P.sig.map(s => 1 / s), t = sum(a); return a.map(v => v / t); })(), gmv = gmvNS(S);
    return {
      trials: out, opt, srOpt: opt.sr, srEq: trueSR(eq), srIV: trueSR(iv), srGMV: trueSR(gmv.w),
      srMean: sum(out.map(o => o.sr)) / out.length, srMed: median(out.map(o => o.sr)),
      wRange: P.mu.map((_, i) => [quant(out.map(o => o.w[i]), 0.1), quant(out.map(o => o.w[i]), 0.9)]),
      seMu: P.sig.map(s => s / sqrt(years))
    };
  }

  /* ch7: volatility drag, and an L-times leveraged product rebalanced every day (lognormal, no fees or borrow spread) */
  const growthL = (mu, sig, r, L) => r + L * (mu - r) - 0.5 * L * L * sig * sig; // continuous growth rate
  function pathsL(mu, sig, r, L, years, nPaths, seed) {
    const R = rng(seed), dt = 1 / 252, steps = Math.round(years * 252), sd = sqrt(dt) * sig, ends = [], show = [];
    for (let p = 0; p < nPaths; p++) {
      let W = 1; const pts = p < 24 ? [[0, 1]] : null;
      for (let k = 1; k <= steps; k++) {
        const x = (mu - 0.5 * sig * sig) * dt + sd * gauss(R), idx = exp(x) - 1;   // the index's simple daily return
        W *= 1 + r * dt + L * (idx - r * dt);                                       // L × daily, financed at r
        if (W < 0) W = 0;
        if (pts && k % 21 === 0) pts.push([k / 252, W]);
      }
      ends.push(W); if (pts) show.push(pts);
    }
    return { ends, show, mean: sum(ends) / ends.length, med: median(ends), below: ends.filter(v => v < 1).length / ends.length, q10: quant(ends, 0.1), q90: quant(ends, 0.9) };
  }
  // the textbook ±50 % example
  const updown = (u, d) => (1 + u) * (1 + d);

  /* ch8: rebalancing two assets to fixed weights against buy-and-hold */
  const divReturn = (w, sig, rho) => { // ½(Σ w_i σ_i² − σ_p²), two assets
    const vp = w[0] * w[0] * sig[0] * sig[0] + w[1] * w[1] * sig[1] * sig[1] + 2 * w[0] * w[1] * rho * sig[0] * sig[1];
    return { dr: 0.5 * (w[0] * sig[0] * sig[0] + w[1] * sig[1] * sig[1] - vp), volP: sqrt(vp) };
  };
  function rebalSim(mu, sig, rho, years, nPaths, seed) { // monthly steps, rebalance yearly to 50/50
    const R = rng(seed), dt = 1 / 12, steps = Math.round(years * 12), out = { rb: [], bh: [], a: [], b: [] };
    for (let p = 0; p < nPaths; p++) {
      let A = 1, B = 1, xa = 0.5, xb = 0.5;
      for (let k = 1; k <= steps; k++) {
        const z1 = gauss(R), z2 = rho * z1 + sqrt(1 - rho * rho) * gauss(R);
        const ga = exp((mu[0] - 0.5 * sig[0] * sig[0]) * dt + sig[0] * sqrt(dt) * z1), gb = exp((mu[1] - 0.5 * sig[1] * sig[1]) * dt + sig[1] * sqrt(dt) * z2);
        A *= ga; B *= gb; xa *= ga; xb *= gb;
        if (k % 12 === 0) { const t = xa + xb; xa = t / 2; xb = t / 2; }
      }
      out.a.push(A); out.b.push(B); out.bh.push((A + B) / 2); out.rb.push(xa + xb);
    }
    const g = arr => ln(median(arr)) / years;
    return { gA: g(out.a), gB: g(out.b), gBH: g(out.bh), gRB: g(out.rb), winRB: out.rb.filter((v, i) => v > out.bh[i]).length / nPaths, raw: out };
  }

  /* ch9: Kelly. Continuous: g(f) = r + f(μ − r) − ½f²σ², f* = (μ − r)/σ². Coin: even-money bet won with probability p */
  const kellyF = (mu, r, sig) => (mu - r) / (sig * sig);
  const gK = (f, mu, r, sig) => r + f * (mu - r) - 0.5 * f * f * sig * sig;
  const coinG = (f, p) => p * ln(1 + f) + (1 - p) * ln(1 - f); // log growth per flip
  function coinSim(f, p, flips, players, seed) {
    const R = rng(seed), ends = [];
    for (let k = 0; k < players; k++) { let W = 1; for (let i = 0; i < flips; i++) W *= R() < p ? 1 + f : 1 - f; ends.push(W); }
    return { ends, med: median(ends), mean: sum(ends) / players, below: ends.filter(v => v < 1).length / players, ruin: ends.filter(v => v < 0.01).length / players };
  }

  return { rng, gauss, gamma, ncdf, fmt, signed, sum, quant, median, dot, mv, quad, inv, chol, covFrom, subsets,
    ASSETS, floor1, nToFloor, abc, frontierU, minVarNS, gmvNS, frontierCurve, sharpe, tangencyU, tangencyNS, cml, betas,
    sharpeSE, expMaxNormal, sharpeTrials, sampleMoments, resample, growthL, pathsL, updown, divReturn, rebalSim,
    kellyF, gK, coinG, coinSim };
}));
