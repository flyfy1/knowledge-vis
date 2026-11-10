'use strict';
// Diversification lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, dot, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// All numbers are invented teaching examples: no real company, market or product is modelled.
(function (root) {
  // ---- Steps 0–1: two invented shops in one town ----
  // Each year the weather is a fair coin (rainy W = +1 / hot W = −1) and each shop has its own luck,
  // another fair coin (e = ±1). Returns in percent:
  //   umbrella  U = 6 + 15·W + 8·e1      ice cream  I = 6 − 15·W + 8·e2
  const SHOP = { mean: 6, weather: 15, luck: 8 };
  const shopVar = () => SHOP.weather ** 2 + SHOP.luck ** 2;            // 289 → σ = 17
  const shopCov = () => -(SHOP.weather ** 2);                          // −225
  const shopRho = () => shopCov() / shopVar();
  // σ of a mix: w in the umbrella shop, 1 − w in the ice-cream shop.
  function mixSd(w) { const v = shopVar(), c = shopCov(); return Math.sqrt(w * w * v + (1 - w) * (1 - w) * v + 2 * w * (1 - w) * c); }
  // Every equally likely (W, e1, e2) outcome — 8 of them — for exact checks.
  function shopOutcomes() { const out = []; for (const W of [1, -1]) for (const e1 of [1, -1]) for (const e2 of [1, -1]) out.push({ W, U: SHOP.mean + SHOP.weather * W + SHOP.luck * e1, I: SHOP.mean - SHOP.weather * W + SHOP.luck * e2 }); return out; }

  // Seeded PRNG (mulberry32) + Box–Muller so every "random" picture is identical on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  const SEEDS = [5, 17, 29, 43, 61];
  const YEARS = 20;
  function shopYears(seed, n = YEARS) {
    const r = rng(seed), out = [];
    for (let y = 0; y < n; y++) { const W = r() < 0.5 ? 1 : -1, e1 = r() < 0.5 ? 1 : -1, e2 = r() < 0.5 ? 1 : -1; out.push({ W, U: SHOP.mean + SHOP.weather * W + SHOP.luck * e1, I: SHOP.mean - SHOP.weather * W + SHOP.luck * e2 }); }
    return out;
  }

  // ---- Steps 2–4: generic assets, each with average 6 % and swing σ = 20 % ----
  const ASSET = { mean: 6, sd: 20 };
  // Equal-weight portfolio of N assets whose every pair has correlation ρ.
  const portSd = (N, rho, sd = ASSET.sd) => sd * Math.sqrt(rho + (1 - rho) / N);
  const floorSd = (rho, sd = ASSET.sd) => sd * Math.sqrt(rho);
  // Step 2: 40 simulated years of two assets with correlation ρ (same base draws for every ρ,
  // so moving the slider changes only how the pairs line up, not the luck).
  const PAIR_N = 40;
  function pairYears(rho, seed) {
    const r = rng(seed), out = [];
    for (let y = 0; y < PAIR_N; y++) { const z1 = gauss(r), z2 = gauss(r); out.push({ a: ASSET.mean + ASSET.sd * z1, b: ASSET.mean + ASSET.sd * (rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2) }); }
    return out;
  }
  function stats(a) { const m = a.reduce((x, y) => x + y, 0) / a.length; return { mean: m, sd: Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length) }; }
  function corr(xs, ys) { const sx = stats(xs), sy = stats(ys); let c = 0; for (let i = 0; i < xs.length; i++) c += (xs[i] - sx.mean) * (ys[i] - sy.mean); return c / xs.length / (sx.sd * sy.sd); }

  // Step 4: each asset = shared market part + its own part:  r_i = 6 + 10·m + 17.32·e_i  (σ = 20, ρ = 0.25).
  const SPLIT = { shared: 10, own: Math.sqrt(ASSET.sd ** 2 - 100) };
  const MARKET_YEARS = 30, MAX_N = 50;
  function marketWorld(seed) {
    const r = rng(seed), m = [], e = [];
    for (let y = 0; y < MARKET_YEARS; y++) { m.push(gauss(r)); const row = []; for (let i = 0; i < MAX_N; i++) row.push(gauss(r)); e.push(row); }
    const marketPart = m.map(v => ASSET.mean + SPLIT.shared * v);
    const asset = (i, y) => ASSET.mean + SPLIT.shared * m[y] + SPLIT.own * e[y][i];
    const portfolio = N => m.map((_, y) => { let s = 0; for (let i = 0; i < N; i++) s += asset(i, y); return s / N; });
    return { marketPart, asset, portfolio };
  }
  const splitVar = N => ({ shared: SPLIT.shared ** 2, own: SPLIT.own ** 2 / N });

  const api = { SHOP, shopVar, shopCov, shopRho, mixSd, shopOutcomes, rng, gauss, SEEDS, YEARS, shopYears, ASSET, portSd, floorSd, PAIR_N, pairYears, stats, corr, SPLIT, MARKET_YEARS, MAX_N, marketWorld, splitVar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
