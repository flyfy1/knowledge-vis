/* Why Some Countries Got Rich: models (UMD: page + node).
   Every model is a pure function. Rates are in percent per year unless a comment says otherwise.
   Real data (Maddison, solar module prices, Penn World Table period averages) lives in data.js.
   Nothing here is a forecast: the AI chapter reproduces published arithmetic, not a prediction. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.GrowthModels = factory(root.GrowthData);
}(typeof self !== 'undefined' ? self : this, function (DATA) {
  'use strict';

  /* ── number formatting (same digits in zh/en; thousands separator) ── */
  function fmt(x, d) {
    if (x == null || !isFinite(x)) return '—';
    d = d == null ? 0 : d;
    const neg = x < 0;
    const s = Math.abs(x).toFixed(d);
    if (Number(s) === 0) return (0).toFixed(d);
    const parts = s.split('.');
    const ii = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + ii + (parts[1] ? '.' + parts[1] : '');
  }
  const LN2 = Math.log(2);

  /* ════════ ch1: compounding and the rule of 70 ════════ */
  // exact doubling time for growth g% per year, compounded yearly
  function doublingExact(g) { return g > 0 ? LN2 / Math.log(1 + g / 100) : Infinity; }
  function rule70(g) { return g > 0 ? 70 / g : Infinity; }
  function factorAfter(g, years) { return Math.pow(1 + g / 100, years); }
  const COUNTRIES = ['us', 'jp', 'kr', 'tw', 'cn', 'my', 'th', 'mx', 'br', 'ar', 'in', 'ng', 'uk'];
  function mad(c, year) { const s = DATA.maddison[c]; return s ? s[year - DATA.madStart] : null; }
  // average annual growth (compound) of GDP per capita between two years
  function cagr(c, y0, y1) { return 100 * (Math.pow(mad(c, y1) / mad(c, y0), 1 / (y1 - y0)) - 1); }
  function series(c) { return DATA.maddison[c].map((v, i) => [DATA.madStart + i, v]); }

  /* ════════ ch2: production function per worker y = A·k^α ════════ */
  function output(k, A, a) { return A * Math.pow(k, a); }
  function mpk(k, A, a) { return a * A * Math.pow(k, a - 1); }
  // how much more output from doubling capital per worker (fraction)
  function doubleGain(a) { return Math.pow(2, a) - 1; }

  /* ════════ ch3–ch4: Solow model (annual, effective-worker units) ════════
     k̃' = (s·A·k̃^α + (1 − δ)·k̃) / ((1 + n)(1 + g)); output per worker = A_t·k̃^α with A_t growing at g.
     s, n, δ, g in percent. A is the level of technology at t = 0. */
  function steady(o) {
    const s = o.s / 100, n = o.n / 100, d = o.d / 100, g = (o.g || 0) / 100, a = o.a, A = o.A;
    // exact fixed point of the discrete map: s·A·k^α = ((1+n)(1+g) − 1 + δ)·k
    const brk = (1 + n) * (1 + g) - 1 + d;
    const k = Math.pow(s * A / brk, 1 / (1 - a));
    const y = A * Math.pow(k, a);
    return { k, y, c: (1 - s) * y, brk };
  }
  function solowPath(o, T, k0, shock) {
    const n = o.n / 100, d = o.d / 100, g = (o.g || 0) / 100, a = o.a, A = o.A;
    const out = [];
    let k = k0, lvl = 1;
    for (let t = 0; t <= T; t++) {
      const s = (shock && t >= shock.at ? shock.s : o.s) / 100;
      const yE = A * Math.pow(k, a);
      out.push({ t, k, y: yE * lvl, yE });
      k = (s * yE + (1 - d) * k) / ((1 + n) * (1 + g));
      lvl *= 1 + g;
    }
    // growth of output per worker, %/yr
    for (let t = 1; t < out.length; t++) out[t].gy = 100 * (out[t].y / out[t - 1].y - 1);
    out[0].gy = null;
    return out;
  }
  // continuous-time half-life of the gap to the steady state
  function halfLife(o) { return LN2 / ((1 - o.a) * (o.n + (o.g || 0) + o.d) / 100); }
  // two economies with the same parameters, the poor one starting at frac·k*
  function convergence(o, frac, T) {
    const st = steady(o);
    const poor = solowPath(o, T, frac * st.k), rich = solowPath(o, T, st.k);
    return { st, poor, rich };
  }
  // raise the saving rate at year `at`: growth jumps, then falls back to g
  function savingsShock(o, s1, at, T) {
    const st0 = steady(o), st1 = steady(Object.assign({}, o, { s: s1 }));
    const p = solowPath(o, T, st0.k, { at, s: s1 });
    let peak = -Infinity, back = null;
    for (const r of p) if (r.gy != null && r.t > at) { if (r.gy > peak) peak = r.gy; }
    for (const r of p) if (r.gy != null && r.t > at + 1 && back == null && r.gy - (o.g || 0) < 0.5 * (peak - (o.g || 0))) back = r.t - at;
    return { p, st0, st1, peak, halfBack: back, levelGain: st1.y / st0.y - 1 };
  }

  /* ════════ ch5: growth accounting on PWT period averages ════════
     g_Y = α·g_K + (1 − α)·(g_L + g_h) + g_A  →  g_A is the residual. */
  function decompose(row, alpha, useHc) {
    const a = alpha == null ? row.alpha : alpha;
    const cap = a * row.gk, lab = (1 - a) * row.gl, hc = useHc ? (1 - a) * row.gh : 0;
    return { a, gy: row.gy, cap, lab, hc, tfp: row.gy - cap - lab - hc, pwt: row.pwtTfp };
  }

  /* ════════ ch6: ideas (Jones 1995 semi-endogenous growth) ════════
     A' = A·(1 + θ·R^λ·A^(φ−1)),  R = R0·(1 + n_R)^t.  θ is set so that growth starts at g0%.
     Long-run growth: g_A* = λ·n_R / (1 − φ). */
  function ideasPath(o, T) {
    const g0 = (o.g0 == null ? 2 : o.g0) / 100, nR = o.nR / 100, lam = o.lam, phi = o.phi;
    const theta = g0; // R0 = A0 = 1
    const out = [];
    let A = 1, R = 1;
    for (let t = 0; t <= T; t++) {
      const gA = theta * Math.pow(R, lam) * Math.pow(A, phi - 1);
      out.push({ t, A, R, gA: 100 * gA, prod: 100 * gA / R });
      A *= 1 + gA; R *= 1 + nR;
    }
    return out;
  }
  function ideasLongRun(o) { return o.phi < 1 ? o.lam * o.nR / (1 - o.phi) : Infinity; }

  /* ════════ ch7: Wright's law  price = c0·X^(−b), learning rate = 1 − 2^(−b) ════════ */
  function wrightFit(y0, y1) {
    const pts = DATA.solar.filter(r => r[0] >= y0 && r[0] <= y1);
    const X = pts.map(r => Math.log2(r[2])), Y = pts.map(r => Math.log2(r[1]));
    const n = X.length;
    const mx = X.reduce((s, v) => s + v, 0) / n, my = Y.reduce((s, v) => s + v, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; syy += (Y[i] - my) ** 2; }
    const slope = sxy / sxx, icpt = my - slope * mx;
    let sse = 0; for (let i = 0; i < n; i++) sse += (Y[i] - icpt - slope * X[i]) ** 2;
    const first = pts[0], last = pts[n - 1];
    return {
      n, slope, icpt, b: -slope, lr: 1 - Math.pow(2, slope), r2: 1 - sse / syy,
      doublings: X[n - 1] - X[0], priceDrop: first[1] / last[1],
      first, last, pts,
      // price after one more doubling of cumulative capacity, on the fitted line from the last point
      nextPrice: last[1] * Math.pow(2, slope)
    };
  }
  function solarRow(year) { return DATA.solar.find(r => r[0] === year); }

  /* ════════ ch8: catch-up, ratio to US GDP per capita ════════ */
  function ratioUS(c, year) { return 100 * mad(c, year) / mad('us', year); }
  function ratioSeries(c) { return DATA.maddison[c].map((v, i) => [DATA.madStart + i, 100 * v / DATA.maddison.us[i]]); }
  function kyRatio(c) { return KY[c]; }
  // capital/output ratio from PWT 11.0 (rnna / rgdpna, both at constant 2017 national prices)
  const KY = { cn: { 2000: 3.09, 2010: 3.67, 2019: 4.91, 2023: 5.51 }, us: { 2000: 3.34, 2023: 3.24 } };

  /* ════════ ch9: Acemoglu (2024) task-based arithmetic via Hulten's theorem ════════
     TFP gain (level, over the horizon) = share of tasks impacted × average overall cost saving,
     impacted = exposed × profitable; overall saving = labour-cost saving × labour share of those tasks.
     With hard tasks: a fraction `easy` of impacted tasks saves `lcs`, the rest saves `hardLcs`. */
  function hulten(o) {
    const impacted = o.exp / 100 * o.prof / 100;
    const ls = o.ls;
    const save = o.hard ? ls * (o.easy / 100 * o.lcs / 100 + (1 - o.easy / 100) * o.hardLcs / 100) : ls * o.lcs / 100;
    const tfp = impacted * save;                                 // fraction
    const years = o.years || 10;
    const perYear = Math.pow(1 + tfp, 1 / years) - 1;           // fraction per year
    const capShare = o.capShare == null ? 1 / 3 : o.capShare;
    // if capital per worker rises with TFP as in the Solow steady state: Y/L rises by TFP/(1 − α)
    const gdp = Math.pow(1 + tfp, 1 / (1 - capShare)) - 1;
    return { impacted: 100 * impacted, save: 100 * save, tfp: 100 * tfp, perYear: 100 * perYear, gdp: 100 * gdp };
  }
  const ACEMOGLU = { exp: 20, prof: 23, lcs: 27, ls: 0.535, easy: 72.6, hardLcs: 7, years: 10 };

  /* ════════ ch10: productivity J-curve toy (after Brynjolfsson, Rock & Syverson 2021) ════════
     A share i(t) of resources goes into intangible capital that the statistics do not count as output.
     The intangible stock S builds up (depreciation dep) and, at its long-run size, raises true output by `pay`.
     Measured TFP (index, baseline 100) = (1 − i(t))·(1 + pay·S/S*);  true = 1 + pay·S/S*. */
  function jcurve(o, T) {
    const iMax = o.i / 100, pay = o.pay / 100, ramp = Math.max(1, o.ramp), dep = (o.dep == null ? 15 : o.dep) / 100;
    const Sstar = iMax / dep;
    const out = [];
    let S = 0;
    for (let t = 0; t <= T; t++) {
      const i = t === 0 ? 0 : iMax * Math.min(1, t / ramp);
      const lift = Sstar > 0 ? pay * S / Sstar : 0;
      out.push({ t, i: 100 * i, measured: 100 * (1 - i) * (1 + lift), truth: 100 * (1 + lift) });
      S = (1 - dep) * S + i;
    }
    let low = Infinity, lowT = 0, cross = null;
    for (const r of out) if (r.measured < low) { low = r.measured; lowT = r.t; }
    for (const r of out) if (r.t > lowT && cross == null && r.measured >= 100) cross = r.t;
    const end = out[out.length - 1];
    return { path: out, low, lowT, cross, endMeasured: end.measured, endTrue: end.truth };
  }

  /* ════════ ch11: AI productivity estimates on one basis ════════
     unit 'tfpLevel10': cumulative TFP level gain over 10 years (%);
     unit 'tfpPerYear': percentage points per year of TFP growth;
     unit 'lpPerYear': percentage points per year of labour-productivity growth.
     To compare, convert to labour-productivity pp per year with LP = TFP / (1 − α). */
  const ESTIMATES = [
    { id: 'acemoglu', unit: 'tfpLevel10', lo: 0.53, hi: 0.66 },
    { id: 'aghion', unit: 'tfpPerYear', lo: 0.07, hi: 1.24, mid: 0.68 },
    { id: 'goldman', unit: 'lpPerYear', lo: 1.5, hi: 1.5 },
    { id: 'anthropic', unit: 'lpPerYear', lo: 1.8, hi: 1.8 }
  ];
  // per-year percentage points; TFP-type estimates are divided by (1 − α) only when `convert` is set
  function toPerYear(v, unit, a, convert) {
    if (unit === 'lpPerYear') return v;
    const perYear = unit === 'tfpLevel10' ? 100 * (Math.pow(1 + v / 100, 1 / 10) - 1) : v;
    return convert ? perYear / (1 - a) : perYear;
  }
  function estimatesOnBasis(a, convert) {
    const c = convert !== false;
    return ESTIMATES.map(e => ({ id: e.id, unit: e.unit, lo: toPerYear(e.lo, e.unit, a, c), hi: toPerYear(e.hi, e.unit, a, c), mid: e.mid == null ? null : toPerYear(e.mid, e.unit, a, c) }));
  }

  /* ════════ dated facts for the frontier chapter (sources in BRIEF.md) ════════ */
  const FRONTIER = {
    cnGdp2025: 5.0, cnGdpYuan2025: 1401879, cnGdppcYuan2025: 99665, cnGdppcUsd2025: 13953, cnPopDrop2025: 339,
    cnQ: { q1: 5.4, q2: 5.2, q3: 4.8, q4: 4.5 }, cnQ3_2026: 4.5, cnQ2_2026: 4.3, cn9m2026: 4.6, cnTarget2026: [4.5, 5],
    imfCnGfcf2025: 38.8, imfCnG2026: 4.5, imfMisalloc: 1.2,
    cnWapPeakYear: 2015, cnWapPeak: 1000.0, cnWap2023: 982.9,
    usProdQ3_2026: 3.6, usProdYoY_Q3_2026: 2.1,
    bnef2025: 108, bnefStationary2025: 70, bnefChina2025: 84,
    wbEscaped: 34, wbStuck: 108, wbShare: 10,
    acemogluGdpLo: 0.93, acemogluGdpHi: 1.16,
    bickUsers: 5.4, bickAll: 1.4, bickProd: 1.1, fredSaved2024: 1.6, fredSaved2026: 2.2,
    brynAvg: 14, brynNovice: 34, noyTime: 40, noyQuality: 18, pengFaster: 55.8, metrSlower: 19, metrExpected: 24, metrBelieved: 20,
    humlumTime: 3, brsTfp2017: 15.9, mooreResearchers: 18
  };

  return {
    fmt, LN2, COUNTRIES, DATA,
    doublingExact, rule70, factorAfter, mad, cagr, series,
    output, mpk, doubleGain,
    steady, solowPath, halfLife, convergence, savingsShock,
    decompose,
    ideasPath, ideasLongRun,
    wrightFit, solarRow,
    ratioUS, ratioSeries, kyRatio,
    hulten, ACEMOGLU,
    jcurve,
    ESTIMATES, toPerYear, estimatesOnBasis,
    FRONTIER
  };
}));
