'use strict';
// Regression & correlation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, line and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: means and standard deviations divide by n (the page says so); r = mean of z_x·z_y.
(function (root) {
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length); };

  // Everything a fit needs: means, SDs, r, least-squares slope/intercept, SSE, SST, R².
  function fit(xs, ys) {
    const n = xs.length, mx = mean(xs), my = mean(ys), sx = sd(xs), sy = sd(ys);
    let sxy = 0; for (let i = 0; i < n; i++) sxy += (xs[i] - mx) * (ys[i] - my);
    const cov = sxy / n, r = sx > 0 && sy > 0 ? cov / (sx * sy) : NaN, b = sx > 0 ? cov / (sx * sx) : 0, a = my - b * mx;
    let sse = 0; for (let i = 0; i < n; i++) { const e = ys[i] - (a + b * xs[i]); sse += e * e; }
    const sst = sy * sy * n;
    return { n, mx, my, sx, sy, r, b, a, sse, sst, r2: sst > 0 ? 1 - sse / sst : 0, rmse: Math.sqrt(sse / n) };
  }
  // r computed the "rectangle" way: the average of standardised products (equals fit().r).
  function rFromProducts(xs, ys) {
    const mx = mean(xs), my = mean(ys), sx = sd(xs), sy = sd(ys);
    const prods = xs.map((x, i) => ((x - mx) / sx) * ((ys[i] - my) / sy));
    return { prods, r: mean(prods), pos: prods.filter(p => p > 0).reduce((s, v) => s + v, 0), neg: prods.filter(p => p < 0).reduce((s, v) => s + v, 0), nPos: prods.filter(p => p > 0).length, nNeg: prods.filter(p => p < 0).length };
  }
  function sseLine(xs, ys, a, b) { let s = 0; for (let i = 0; i < xs.length; i++) { const e = ys[i] - (a + b * xs[i]); s += e * e; } return s; }

  /* ---------- steps 0–2: a school shop over 30 days ---------- */
  // Daily high temperature (°C) and cups sold. Simulated, not measured.
  const PRODUCTS = { ice: { base: 60, slope: 5 }, soup: { base: 150, slope: -4 }, pens: { base: 70, slope: 0 } };
  const SHOP_N = 30;
  function shop(product, noise) {
    const r = rng(20261109), temps = [], z = [];
    for (let i = 0; i < SHOP_N; i++) { temps.push(Math.round((18 + 18 * r()) * 10) / 10); z.push(gauss(r)); }
    const P = PRODUCTS[product];
    // The same 30 days and the same random wobble for every product; only the trend and the noise size change.
    const sales = temps.map((T, i) => P.base + P.slope * (T - 18) + noise * z[i]);
    return { x: temps, y: sales };
  }
  const toF = c => c * 9 / 5 + 32;
  const STEP1_NOISE = 15;
  const fixedShop = () => shop('ice', STEP1_NOISE);

  /* ---------- step 3: shapes that r cannot see ---------- */
  const SHAPES = ['line', 'ushape', 'saturate'];
  function shape(kind) {
    const r = rng(kind === 'line' ? 39 : kind === 'ushape' ? 32 : 33), xs = [], ys = [];
    for (let i = 0; i < 40; i++) {
      if (kind === 'line') { const x = 18 + 18 * i / 39; xs.push(x); ys.push(60 + 5 * (x - 18) + 12 * gauss(r)); }
      else if (kind === 'ushape') { const x = 30 + 90 * i / 39; xs.push(x); ys.push(5 + 0.0016 * (x - 75) * (x - 75) + 0.25 * gauss(r)); }
      else { const x = 30 * i / 39; xs.push(x); ys.push(8 * (1 - Math.exp(-x / 4)) + 0.25 * gauss(r)); }
    }
    return { x: xs, y: ys };
  }
  function residuals(d) { const f = fit(d.x, d.y); return d.x.map((x, i) => d.y[i] - (f.a + f.b * x)); }

  /* ---------- step 4: one point at a time ---------- */
  // Weekly practice hours vs test score for 15 students, plus one student who practised 20 hours.
  function practice(farY) {
    const r = rng(404), xs = [], ys = [];
    for (let i = 0; i < 15; i++) { const x = 1 + 7 * i / 14; xs.push(Math.round(x * 10) / 10); ys.push(55 + 4 * (x - 1) + 6 * gauss(r)); }
    xs.push(20); ys.push(farY);
    return { x: xs, y: ys };
  }
  function without(d, k) { return { x: d.x.filter((_, i) => i !== k), y: d.y.filter((_, i) => i !== k) }; }
  function influence(d) { const full = fit(d.x, d.y); return d.x.map((_, k) => { const w = without(d, k), f = fit(w.x, w.y); return { k, b: f.b, r: f.r, db: f.b - full.b }; }); }

  /* ---------- step 5: a lurking variable ---------- */
  // 210 pupils aged 6–12 (30 per age): foot length (cm) and reading score both grow with age, independently otherwise.
  function pupils() {
    const r = rng(555), out = [];
    for (let age = 6; age <= 12; age++) for (let i = 0; i < 30; i++) out.push({ age, foot: 16 + 0.9 * (age - 6) + 0.9 * gauss(r), read: 30 + 9 * (age - 6) + 8 * gauss(r) });
    return out;
  }
  function pupilsFit(list) { return fit(list.map(p => p.foot), list.map(p => p.read)); }

  /* ---------- step 6: regression to the mean (test, retest) ---------- */
  // 500 students; each score = 70 + 10·(√ρ·ability + √(1−ρ)·luck), with fresh luck on each test. ρ = share of the score spread due to ability.
  const N6 = 500;
  function retest(rho) {
    const r = rng(666), a = [], t1 = [], t2 = [];
    for (let i = 0; i < N6; i++) { const ab = gauss(r), e1 = gauss(r), e2 = gauss(r); a.push(ab); t1.push(70 + 10 * (Math.sqrt(rho) * ab + Math.sqrt(Math.max(0, 1 - rho)) * e1)); t2.push(70 + 10 * (Math.sqrt(rho) * ab + Math.sqrt(Math.max(0, 1 - rho)) * e2)); }
    const idx = t1.map((v, i) => i).sort((i, j) => t1[i] - t1[j]), k = N6 / 10;
    const bottom = idx.slice(0, k), top = idx.slice(N6 - k);
    const g = ids => ({ t1: mean(ids.map(i => t1[i])), t2: mean(ids.map(i => t2[i])) });
    return { t1, t2, top, bottom, topM: g(top), botM: g(bottom), all: g(idx), f: fit(t1, t2) };
  }

  const api = { rng, gauss, mean, sd, fit, rFromProducts, sseLine, PRODUCTS, SHOP_N, shop, toF, STEP1_NOISE, fixedShop, SHAPES, shape, residuals, practice, without, influence, pupils, pupilsFit, N6, retest };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.REGRESSION_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
