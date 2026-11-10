'use strict';
// Poisson process lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every mark and readout on the page is computed here; tests/core.cjs pins the claims.
// Units: steps 0–5 use minutes and calls per minute; step 6 uses hours and calls per hour.
(function (root) {
  /* ---------- exact distributions ---------- */
  const LF = [0];
  for (let k = 1; k <= 6000; k++) LF[k] = LF[k - 1] + Math.log(k);
  const lfact = k => LF[k];
  function poissonPmf(k, mu) { if (k < 0) return 0; if (mu === 0) return k === 0 ? 1 : 0; return Math.exp(k * Math.log(mu) - mu - lfact(k)); }
  function poissonCdf(k, mu) { let s = 0; for (let j = 0; j <= k; j++) s += poissonPmf(j, mu); return s; }
  function binomPmf(k, n, p) {
    if (k < 0 || k > n) return 0;
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === n ? 1 : 0;
    return Math.exp(lfact(n) - lfact(k) - lfact(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }
  // Total-variation distance between Binomial(n, mu/n) and Poisson(mu): half the summed gap between the two bar charts.
  function tvBinomPoisson(n, mu) {
    const p = mu / n; let s = 0, pc = 0;
    for (let k = 0; k <= n; k++) { const q = poissonPmf(k, mu); s += Math.abs(binomPmf(k, n, p) - q); pc += q; }
    return 0.5 * (s + Math.max(0, 1 - pc));
  }

  /* ---------- seeded randomness (mulberry32) ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const expDraw = (r, lam) => -Math.log(1 - r()) / lam;
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  // Variance = average squared distance from the mean (divide by N), as the page defines it.
  const variance = a => { const m = mean(a); return a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length; };

  /* ---------- step 0: chop ten minutes into n slices ---------- */
  const T0 = 10, SLICES = [10, 20, 50, 100, 500, 2000];
  function sliceDraw(n, lam, seed) {
    const r = rng(seed * 7919 + n), p = lam * T0 / n, hits = [];
    for (let i = 0; i < n; i++) if (r() < p) hits.push(i);
    return { n, p, dt: T0 / n, hits, times: hits.map(i => (i + 0.5) * T0 / n) };
  }

  /* ---------- steps 1–2: one long recording built from 1/1000-minute slices ---------- */
  // Each 0.001-minute slice independently holds a call with probability λ·0.001 (the step-0 recipe, finer).
  const DT = 0.001, T1 = 2400, NWIN = 400, NGAP = 1000;
  const streamCache = new Map();
  function stream(lam, seed) {
    const key = lam.toFixed(3) + ':' + seed;
    if (streamCache.has(key)) return streamCache.get(key);
    const r = rng(seed * 104729 + Math.round(lam * 1000)), p = lam * DT, n = Math.round(T1 / DT), times = [];
    for (let i = 0; i < n; i++) if (r() < p) times.push((i + 0.5) * DT);
    if (streamCache.size > 40) streamCache.clear();
    streamCache.set(key, times);
    return times;
  }
  function windowCounts(times, w, N = NWIN) {
    const c = new Array(N).fill(0);
    for (const t of times) { const i = Math.floor(t / w); if (i >= N) break; c[i]++; }
    return c;
  }
  function countStats(c) { const m = mean(c), v = variance(c); return { mean: m, variance: v, ratio: m > 0 ? v / m : NaN }; }
  function histogram(values, maxK) { const h = new Array(maxK + 1).fill(0); for (const v of values) if (v <= maxK) h[v]++; return h; }
  function gaps(times, N = NGAP) { const g = []; for (let i = 1; i < times.length && g.length < N; i++) g.push(times[i] - times[i - 1]); return g; }
  const survival = (g, t) => g.filter(v => v > t).length / g.length;

  /* ---------- step 3: already waited s minutes ---------- */
  const N3 = 20000;
  function waitSample(kind, seed) {
    const r = rng(seed * 31337 + (kind === 'exp' ? 1 : 2)), out = [];
    for (let i = 0; i < N3; i++) out.push(kind === 'exp' ? expDraw(r, 1) : 2 * r()); // both have a mean of 1 minute
    return out;
  }
  function remaining(sample, s) { const rest = []; for (const v of sample) if (v > s) rest.push(v - s); return rest; }
  const remainingTheory = (kind, s) => (kind === 'exp' ? 1 : (2 - s) / 2);

  /* ---------- step 4: waiting for a bus (mean headway 10 minutes) ---------- */
  const HEAD = 10, BUS_T = 1200, PASS = 400;
  function buses(kind, seed) {
    const r = rng(seed * 2654435 + (kind === 'poisson' ? 11 : 13)), t = [];
    if (kind === 'regular') { for (let x = HEAD; x <= BUS_T + 1e-9; x += HEAD) t.push(x); return t; }
    let x = 0; for (;;) { x += expDraw(r, 1 / HEAD); if (x > BUS_T) break; t.push(x); }
    return t;
  }
  function passengers(busT, seed, N = PASS) {
    const r = rng(seed * 97 + 5), last = busT[busT.length - 1], out = [];
    for (let i = 0; i < N; i++) {
      const a = r() * last;
      let j = 0; while (busT[j] < a) j++;
      const prev = j === 0 ? 0 : busT[j - 1];
      out.push({ t: a, bus: busT[j], wait: busT[j] - a, gap: busT[j] - prev });
    }
    return out;
  }
  function busStats(busT, pax) {
    const head = busT.map((v, i) => v - (i === 0 ? 0 : busT[i - 1]));
    return { meanHead: mean(head), meanWait: mean(pax.map(p => p.wait)), meanGap: mean(pax.map(p => p.gap)), long: pax.filter(p => p.gap > HEAD).length / pax.length, headLong: head.filter(h => h > HEAD).length / head.length };
  }
  // Long-run theory: regular → wait H/2, landed gap H. Exponential headways → wait H, landed gap 2H (length bias).
  const busTheory = kind => (kind === 'regular' ? { wait: HEAD / 2, gap: HEAD } : { wait: HEAD, gap: 2 * HEAD });

  /* ---------- step 5: two phone lines merged, then thinned ---------- */
  const T5 = 1000;
  function poissonTimes(lam, T, r) { const t = []; let x = 0; for (;;) { x += expDraw(r, lam); if (x > T) return t; t.push(x); } }
  function mergeThin(l1, l2, p, seed) {
    const r = rng(seed * 6007 + 3);
    const A = poissonTimes(l1, T5, r), B = poissonTimes(l2, T5, r);
    const merged = A.map(t => ({ t, src: 'A' })).concat(B.map(t => ({ t, src: 'B' }))).sort((a, b) => a.t - b.t);
    const rk = rng(seed * 6007 + 4);
    const kept = merged.filter(() => rk() < p); // thinning: each merged call kept independently with probability p
    const mt = merged.map(e => e.t), kt = kept.map(e => e.t);
    const g = []; for (let i = 1; i < mt.length; i++) g.push(mt[i] - mt[i - 1]);
    const ct = countStats(windowCounts(kt, 1, T5));
    return { A, B, merged, kept, mergedRate: mt.length / T5, keptRate: kt.length / T5, shareA: A.length / Math.max(1, mt.length), gaps: g, meanGap: g.length ? mean(g) : NaN, keptRatio: ct.ratio };
  }

  /* ---------- step 6: a rate that changes through the day ---------- */
  // Calls per hour at each whole hour of a 12-hour opening day (8:00–20:00), linear in between.
  const RATE_KNOTS = [2, 5, 11, 14, 10, 6, 5, 7, 12, 15, 9, 4, 2];
  const DAY = 12, DAYS = 500, RMAX = 15;
  function rate(t) { const i = Math.min(DAY - 1, Math.max(0, Math.floor(t))), f = t - i; return RATE_KNOTS[i] * (1 - f) + RATE_KNOTS[i + 1] * f; }
  // Exact area under the piecewise-linear rate between a and b (expected calls in the window).
  function Lambda(a, b) {
    let s = 0;
    for (let i = 0; i < DAY; i++) { const lo = Math.max(a, i), hi = Math.min(b, i + 1); if (hi > lo) s += (hi - lo) * (rate(lo) + rate(hi)) / 2; }
    return s;
  }
  // Thinning (Lewis–Shedler): candidates at the top rate RMAX, each kept with probability rate(t)/RMAX.
  const dayCache = new Map();
  function days(seed) {
    if (dayCache.has(seed)) return dayCache.get(seed);
    const r = rng(seed * 4099 + 17), out = [];
    for (let d = 0; d < DAYS; d++) { const day = []; for (const t of poissonTimes(RMAX, DAY, r)) if (r() < rate(t) / RMAX) day.push(t); out.push(day); }
    dayCache.clear(); dayCache.set(seed, out);
    return out;
  }
  function windowAcrossDays(dd, a, b) { return dd.map(day => day.filter(t => t >= a && t < b).length); }
  function pooledHourly(dd) {
    const c = []; for (const day of dd) for (let h = 0; h < DAY; h++) c.push(day.filter(t => t >= h && t < h + 1).length);
    const hourL = []; for (let h = 0; h < DAY; h++) hourL.push(Lambda(h, h + 1));
    const mL = mean(hourL), vL = variance(hourL);
    return { ...countStats(c), theoryMean: mL, theoryVar: mL + vL, theoryRatio: (mL + vL) / mL };
  }

  const api = { lfact, poissonPmf, poissonCdf, binomPmf, tvBinomPoisson, rng, mean, variance, T0, SLICES, sliceDraw, DT, T1, NWIN, NGAP, stream, windowCounts, countStats, histogram, gaps, survival, N3, waitSample, remaining, remainingTheory, HEAD, BUS_T, PASS, buses, passengers, busStats, busTheory, T5, poissonTimes, mergeThin, RATE_KNOTS, DAY, DAYS, RMAX, rate, Lambda, days, windowAcrossDays, pooledHourly };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.POISSON_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
