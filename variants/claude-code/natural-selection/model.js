'use strict';
// Natural-selection lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.NATSEL_MODEL) and node tests (module.exports).
(function (root) {
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // ---- survival on a given bark ----
  // Tones from 0 (pale) to 1 (black). A bird spots a moth more easily the more it contrasts with the bark:
  // chance of being eaten in one season = K · |moth tone − bark tone|.
  const TONE = { light: 0.2, dark: 0.85 };
  const K0 = 0.6;
  const survival = (tone, bark, K = K0) => 1 - K * Math.abs(tone - bark);
  const wL = (bark, K = K0) => survival(TONE.light, bark, K);
  const wD = (bark, K = K0) => survival(TONE.dark, bark, K);
  const EQUAL_BARK = (TONE.light + TONE.dark) / 2; // both survive equally here
  // One hunt on a set of moths: each survives with its own probability.
  function hunt(moths, bark, seed, K = K0) {
    const r = rng(seed);
    return moths.map(m => ({ ...m, alive: r() < survival(TONE[m.kind], bark, K) }));
  }
  function makeMoths(nEach, seed) {
    const r = rng(seed), out = [];
    for (let i = 0; i < 2 * nEach; i++) out.push({ kind: i % 2 ? 'dark' : 'light', x: r(), y: r(), a: r() * Math.PI * 2 });
    return out;
  }

  // ---- step 1: generations, with the three conditions switchable ----
  // Survivors breed; each offspring takes its parent's colour (heredity on) or is dark with the fixed
  // background chance p0 (heredity off). Variation off = everyone light. Selection off = equal survival.
  function nextP(p, bark, cond, p0, K = K0) {
    if (!cond.variation) return 0;
    if (!cond.heredity) return p0;
    const a = cond.selection ? wD(bark, K) : 1, b = cond.selection ? wL(bark, K) : 1;
    return p * a / (p * a + (1 - p) * b);
  }
  function run(p0, bark, cond, gens, K = K0) {
    const out = [cond.variation ? p0 : 0];
    for (let g = 0; g < gens; g++) out.push(nextP(out[g], bark, cond, p0, K));
    return out;
  }

  // ---- step 2: how fast ----
  const logit = p => Math.log(p / (1 - p));
  const advantage = (bark, K = K0) => wD(bark, K) / wL(bark, K); // r: dark survival ÷ light survival
  // generations for the dark share to go from p1 to p2 (r > 1): log-odds rise by ln r each generation
  const gensBetween = (p1, p2, r) => (logit(p2) - logit(p1)) / Math.log(r);
  const rNeeded = (p1, p2, gens) => Math.exp((logit(p2) - logit(p1)) / gens);
  const HISTORY = { start: 1848, end: 1895, p1: 0.01, p2: 0.98 }; // 1% in 1848 is this page's assumption

  // ---- step 3: soot arrives, then clean air ----
  // A sketch of bark tone by year (not measured data): pale until 1850, darkening to 1900, dark until
  // 1956 (UK Clean Air Act), lightening again by 2000. One generation per year.
  const YEARS = { from: 1800, to: 2020 };
  const smooth = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  function barkAt(year) {
    const pale = 0.15, dark = 0.85;
    if (year < 1956) return pale + (dark - pale) * smooth((year - 1850) / 50);
    return dark - (dark - pale) * smooth((year - 1956) / 44);
  }
  const MU = 1e-4; // new mutations each generation, both directions, so the rare colour never vanishes entirely
  function history(K = K0, p0 = 0.001) {
    const out = [{ year: YEARS.from, p: p0, bark: barkAt(YEARS.from) }];
    for (let y = YEARS.from; y < YEARS.to; y++) {
      const b = barkAt(y), p = out[out.length - 1].p;
      let q = p * wD(b, K) / (p * wD(b, K) + (1 - p) * wL(b, K));
      q = q * (1 - MU) + (1 - q) * MU;
      out.push({ year: y + 1, p: q, bark: barkAt(y + 1) });
    }
    return out;
  }
  // Years when the dark share crosses 50% (up, then down) and when the bark crosses the equal-survival tone.
  function crossings(K = K0) {
    const h = history(K);
    const find = (f, from) => { for (let i = Math.max(1, from); i < h.length; i++) if (f(h[i - 1], h[i])) return i; return -1; };
    const iUp = find((a, b) => a.p < 0.5 && b.p >= 0.5, 0), iDown = find((a, b) => a.p >= 0.5 && b.p < 0.5, iUp + 1);
    const bUp = find((a, b) => a.bark < EQUAL_BARK && b.bark >= EQUAL_BARK, 0), bDown = find((a, b) => a.bark >= EQUAL_BARK && b.bark < EQUAL_BARK, bUp + 1);
    const yr = i => (i < 0 ? null : h[i].year);
    return { pUp: yr(iUp), pDown: yr(iDown), barkUp: yr(bUp), barkDown: yr(bDown), peak: Math.max(...h.map(q => q.p)) };
  }

  // ---- step 4: chance versus selection (haploid Wright–Fisher) ----
  // Dark moths leave (1 + s) times as many offspring; the next N moths are drawn at random from the offspring.
  function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  function binom(n, p, r) {
    if (p <= 0) return 0; if (p >= 1) return n;
    if (n <= 60) { let k = 0; for (let i = 0; i < n; i++) if (r() < p) k++; return k; }
    return Math.max(0, Math.min(n, Math.round(n * p + Math.sqrt(n * p * (1 - p)) * gauss(r))));
  }
  const T_MAX = 1500;
  function wfRun(N, s, p0, r) {
    const traj = [p0]; let k = Math.round(N * p0);
    while (k > 0 && k < N && traj.length <= T_MAX) {
      const p = k / N, ps = p * (1 + s) / (1 + p * s);
      k = binom(N, ps, r); traj.push(k / N);
    }
    return { traj, fate: k >= N ? 'fixed' : k <= 0 ? 'lost' : 'open' };
  }
  function wfBatch(N, s, p0, runs, seed) { const r = rng(seed); return Array.from({ length: runs }, () => wfRun(N, s, p0, r)); }
  // Diffusion approximation to the chance that the dark form takes over the whole population.
  const fixProb = (N, s, p0) => (Math.abs(s) < 1e-12 ? p0 : (1 - Math.exp(-2 * N * s * p0)) / (1 - Math.exp(-2 * N * s)));
  const N_STEPS = [10, 30, 100, 300, 1000];

  const api = { rng, TONE, K0, survival, wL, wD, EQUAL_BARK, hunt, makeMoths, nextP, run, logit, advantage, gensBetween, rNeeded, HISTORY, YEARS, barkAt, MU, history, crossings, binom, T_MAX, wfRun, wfBatch, fixProb, N_STEPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NATSEL_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
