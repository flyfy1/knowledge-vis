/* What makes prices rise and fall: the essay's models as pure functions (UMD: page and node).
   No visible text here; labels live in copy.*.js. Data (FRED, World Bank) comes from data.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.PriceModels = factory(root.PriceData);
}(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';
  const round = (x, d) => { const k = Math.pow(10, d); return Math.round(x * k) / k; };
  const fmt = (x, d) => { const v = round(x, d); return (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d); };
  const pct = (x, d) => fmt(100 * x, d);

  /* ── ch1 quantity equation on real US data: M·V = P·Y, with V and P defined from the data ──
     P is the implicit GDP deflator (nominal / real GDP), V = nominal GDP / M2. Both are definitions,
     so the identity holds exactly; the question is how each piece moved. */
  const us = D.us;
  const idx = y => y - us.y0;
  function usAt(y) {
    const i = idx(y), N = us.ngdp[i], R = us.rgdp[i], M = us.m2[i];
    return { y, M, N, R, P: N / R, V: N / M, base: us.base[i] };
  }
  function qty(y0, y1) {
    const a = usAt(y0), b = usAt(y1), n = y1 - y0;
    const f = { M: b.M / a.M, V: b.V / a.V, P: b.P / a.P, Y: b.R / a.R, base: b.base / a.base };
    const ann = x => Math.pow(x, 1 / n) - 1;
    const cfP = f.M / f.Y;                       // price level if velocity had stayed where it was
    return {
      y0, y1, n, f,
      g: { M: ann(f.M), V: ann(f.V), P: ann(f.P), Y: ann(f.Y), base: ann(f.base) },
      cf: { P: cfP, pi: ann(cfP) },
      log: { M: Math.log(f.M), V: Math.log(f.V), P: Math.log(f.P), Y: Math.log(f.Y) },
      identity: f.M * f.V / (f.P * f.Y),          // exactly 1
      v0: a.V, v1: b.V
    };
  }
  const QTY_PRESETS = { qe: [2008, 2014], surge: [2019, 2021], rebound: [2021, 2023], seventies: [1970, 1980], all: [1960, 2025] };

  /* ── ch2 AD/AS in logs, annual steps ──
     AD (the quantity equation in logs): y = d − p, d = m + v is nominal demand.
     SRAS: p = pe + α(y − y*) + u, with pe = p(−1) + π̄ (sellers expect last year's price plus the usual 2%).
     ⇒ p = [p(−1) + π̄ + α(d − y*) + u] / (1 + α).  y* = 0, π̄ = 2, d grows 2 a year at baseline. */
  const ADAS_SHOCKS = {
    demand: { D: 6, G: 0, U: 0, rho: 0.5 },          // nominal demand +6% for good
    supply: { D: 0, G: 0, U: 6, rho: 0.5 },          // energy: costs +6% in year 1, half left each year
    both: { D: 6, G: 0, U: 6, rho: 0.5 },
    china: { D: 0, G: -1, U: -1, rho: 0.9 },         // nominal demand grows 1 point a year slower; new capacity cuts costs 1%, fading slowly
    none: { D: 0, G: 0, U: 0, rho: 0.5 }
  };
  // policy a ∈ [0, 1]: each year demand policy (rates or budget) moves nominal demand to close a share a of the output
  // gap that would otherwise open; the move stays in place (z accumulates). a = 1 keeps output at potential.
  function adas(kind, alpha, a, years) {
    const s = ADAS_SHOCKS[kind], T = years || 10, PI = 2;
    let p = 0, z = 0, lossSum = 0; const out = [{ t: 0, p: 0, y: 0, pi: PI, d: 0, u: 0, pe: 0, z: 0 }];
    for (let t = 1; t <= T; t++) {
      const u = s.U * Math.pow(s.rho, t - 1), pe = p + PI;
      const d0 = (PI + s.G) * t + s.D + z;
      const y0 = (d0 - pe - u) / (1 + alpha);               // output gap before this year's policy move
      z = z - a * (1 + alpha) * y0;
      const d = (PI + s.G) * t + s.D + z;
      const pNew = (pe + alpha * d + u) / (1 + alpha);
      const y = d - pNew;
      lossSum += y;
      out.push({ t, p: pNew, y, pi: pNew - p, d, u, pe, z });
      p = pNew;
    }
    const rows = out.slice(1);
    const peak = rows.reduce((m, r) => (r.pi > m.pi ? r : m), rows[0]);
    const low = rows.reduce((m, r) => (r.pi < m.pi ? r : m), rows[0]);
    return { path: out, peak, low, y1: out[1].y, pi1: out[1].pi, pT: out[T].p - PI * T, yT: out[T].y, ySum: lossSum };
  }

  /* ── ch3–4 expectations-augmented Phillips curve ──
     π_t = πe_t − β(u_t − u*) + s_t,   πe_t = θ·π* + (1 − θ)·π_{t−1}.
     θ = 0: adaptive (people expect last year again). θ = 1: fully anchored on the target π*. */
  const PC = { ustar: 5, target: 2, beta: 0.5 };
  function phillips(o) {
    const T = o.years || 20, beta = o.beta == null ? PC.beta : o.beta, th = o.theta, ustar = PC.ustar;
    const out = [];
    if (o.mode === 'hot') {
      let pi = PC.target; out.push({ t: 0, u: ustar, pi, pe: pi });
      for (let t = 1; t <= T; t++) {
        const u = ustar - o.gap, s = (o.oil && (t === 3 || t === 9)) ? 3 : 0;
        const pe = th * PC.target + (1 - th) * pi;
        pi = pe - beta * (u - ustar) + s; out.push({ t, u, pi, pe, s });
      }
      const ss = th > 0 ? PC.target + beta * o.gap / th : Infinity;
      return { path: out, pi10: out[10].pi, piT: out[T].pi, ss };
    }
    // 'cool': start at 10% inflation (people expect 10), hold u above u* by gap until inflation is ≤ 3, then u = u*
    let pi = 10, done = null, pointYears = 0; out.push({ t: 0, u: ustar, pi, pe: pi });
    for (let t = 1; t <= T; t++) {
      const u = done == null ? ustar + o.gap : ustar;
      const pe = th * PC.target + (1 - th) * pi;
      pi = pe - beta * (u - ustar);
      if (done == null) pointYears += u - ustar;
      out.push({ t, u, pi, pe });
      if (done == null && pi <= 3 + 1e-9) done = t;
    }
    const drop = 10 - (done == null ? out[T].pi : out[done].pi);
    return { path: out, years: done, pointYears, drop, ratio: pointYears / drop };
  }

  /* ── ch5 conflict model of a wage–price spiral (after Lorenzoni & Werning 2023, in logs, annual) ──
     Prices: p = (1 − s)w + s·e, energy e = p + x (x: real energy premium) ⇒ p = w + c·x, c = s/(1 − s).
     So the real wage ω = w − p = −c·x: it is set by the energy price alone.
     Wages: Δw_t = πe_t + χ·a·(−ω_{t−1}) (workers try to win back a share a of the lost real wage).
     πe_t = θπ* + (1 − θ)π_{t−1}.  x_t = X·ρ^(t−1) from year 1. */
  const WP = { chi: 0.5, target: 2 };
  function spiral(o) {
    const T = o.years || 15, c = o.s / (1 - o.s), th = o.theta;
    let pi = WP.target, xPrev = 0; const out = [{ t: 0, pi, w: WP.target, x: 0, omega: 0 }];
    for (let t = 1; t <= T; t++) {
      const x = o.X * Math.pow(o.rho, t - 1);
      const pe = th * WP.target + (1 - th) * pi;
      const dw = pe + WP.chi * o.a * c * xPrev;
      pi = dw + c * (x - xPrev);
      out.push({ t, pi, w: dw, x, omega: -c * x, pe });
      xPrev = x;
    }
    const peak = out.slice(1).reduce((m, r) => (r.pi > m.pi ? r : m), out[1]);
    const ssPerm = th > 0 ? WP.target + WP.chi * o.a * c * o.X / th : Infinity;  // ρ = 1
    return { path: out, peak, pi1: out[1].pi, pi8: out[8].pi, piT: out[T].pi, omega1: out[1].omega, omega8: out[8].omega, ssPerm };
  }

  /* ── ch6 & ch9 printing money to pay a deficit (Cagan 1956 money demand, Sargent & Wallace 1981 arithmetic) ──
     Monthly. Real money balances m = M/(P·Y_year) = k·exp(−α·πe), πe in log points per month.
     The government covers a deficit of d (share of annual GDP) by printing: μ·m = d/12.
     Price level clears the money market: π = (μ − αβ·πe)/(1 − αβ); expectations πe' = πe + β(π − πe). */
  const SG = { beta: 0.1, months: 120, hyper: Math.log(1.5) };   // Cagan's line: 50% a month
  const seignSteady = (pi, k, alpha) => 12 * pi * k * Math.exp(-alpha * pi);   // per year, share of GDP
  function seignMax(k, alpha) { return { pi: 1 / alpha, d: 12 * k / (alpha * Math.E) }; }
  function seignRoots(d, k, alpha) {          // low and high steady states of 12·π·k·e^(−απ) = d
    const top = seignMax(k, alpha); if (d > top.d + 1e-12) return null;
    const solve = (lo, hi) => { for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; ((seignSteady(mid, k, alpha) - d) * (seignSteady(lo, k, alpha) - d) <= 0) ? (hi = mid) : (lo = mid); } return (lo + hi) / 2; };
    return { low: solve(0, top.pi), high: solve(top.pi, 50 / alpha) };
  }
  function seignorage(o) {
    const k = o.k, a = o.alpha, b = SG.beta, d = o.d, T = o.months || SG.months;
    let pe = o.pe0 || 0, hyperAt = null; const out = [];
    for (let t = 1; t <= T; t++) {
      const m = k * Math.exp(-a * pe), mu = d / 12 / m;
      const pi = (mu - a * b * pe) / (1 - a * b);
      out.push({ t, pi, pe, m, mu });
      if (hyperAt == null && pi > SG.hyper) { hyperAt = t; break; }
      pe = pe + b * (pi - pe);
    }
    const last = out[out.length - 1];
    return { path: out, hyperAt, last, roots: seignRoots(d, k, a), max: seignMax(k, a) };
  }
  const annualOfMonthly = x => Math.exp(12 * x) - 1;

  /* ── ch7 debt deflation: a borrower with fixed nominal debt ──
     Debt / income b: b' = (b(1 + i) − σ) / ((1 + g)(1 + π_t)), σ = share of income paid each year.
     Fisher's feedback (optional): distress selling lowers prices, π_t = π − φ·max(0, b_{t−1} − b0). */
  function debtDeflation(o) {
    const T = o.years || 10; let b = o.b0, P = 1; const out = [{ t: 0, b, P, realDebt: b, pi: 0 }];
    let D = o.b0;                                   // nominal debt, income in year 0 = 1
    for (let t = 1; t <= T; t++) {
      const pi = o.pi - (o.phi || 0) * Math.max(0, b - o.b0);
      const Yprev = D / b;
      D = D * (1 + o.i) - o.sigma * Yprev;
      P = P * (1 + pi);
      const Y = Yprev * (1 + o.g) * (1 + pi);
      b = D / Y;
      out.push({ t, b, P, realDebt: D / P, pi, D });
    }
    return { path: out, b4: out[Math.min(4, T)].b, bT: out[T].b, real4: out[Math.min(4, T)].realDebt, realRate: (1 + o.i) / (1 + o.pi) - 1, piT: out[T].pi };
  }
  // 1929–1933 in the United States (FRED: CPIAUCNS, GDPA)
  function depression() {
    const c = D.dep.cpi, n = D.dep.ngdp, r = D.dep.rgdp;
    return { cpi: c[4] / c[0] - 1, ngdp: n[4] / n[0] - 1, rgdp: r[4] / r[0] - 1, realBurden: c[0] / c[4], debtToIncome: n[0] / n[4], cpiPerYear: Math.pow(c[4] / c[0], 1 / 4) - 1 };
  }

  /* ── data helpers for the two data charts (ch3 scatter, ch4 expectations, ch8 three countries) ── */
  function usSeries(name) { const a = us[name], out = []; for (let i = 0; i < a.length; i++) out.push([us.y0 + i, a[i]]); return out; }
  function cpiInfl() { const c = us.cpi, out = []; for (let i = 1; i < c.length; i++) if (c[i] != null && c[i - 1] != null) out.push([us.y0 + i, (c[i] / c[i - 1] - 1) * 100]); return out; }
  const ERAS = [{ k: 'e60', y0: 1960, y1: 1969 }, { k: 'e70', y0: 1970, y1: 1983 }, { k: 'e84', y0: 1984, y1: 2019 }, { k: 'e20', y0: 2020, y1: 2025 }];
  function phillipsData() {
    const pi = cpiInfl(), out = [];
    for (const [y, p] of pi) { if (y < 1960) continue; const u = us.u[idx(y)]; if (u == null) continue; const e = ERAS.find(e => y >= e.y0 && y <= e.y1); out.push({ y, u, pi: p, era: e.k }); }
    return out;
  }
  function slope(points) {   // OLS of inflation on unemployment
    const n = points.length, mx = points.reduce((s, p) => s + p.u, 0) / n, my = points.reduce((s, p) => s + p.pi, 0) / n;
    let sxy = 0, sxx = 0; for (const p of points) { sxy += (p.u - mx) * (p.pi - my); sxx += (p.u - mx) * (p.u - mx); }
    return sxy / sxx;
  }
  function eraSlopes() { const d = phillipsData(), out = {}; for (const e of ERAS) out[e.k] = slope(d.filter(p => p.era === e.k)); return out; }
  function wbAvg(country, y0, y1) { const a = D.wb[country]; let s = 0, n = 0, neg = 0; for (let y = y0; y <= y1; y++) { const v = a[y - D.wb.y0]; s += v; n++; if (v < 0) neg++; } return { avg: s / n, neg, n }; }

  /* ── dated facts used by prose, diagrams and the frontier chapter (sources in BRIEF.md) ── */
  const FACTS = {
    china2610: { cpi: 0.7, core: 0.8, ppi: 5.7, mining: 27.9, raw: 11.6, processing: 3.5, consumer: -0.1, ppiYtd: 2.7, cpiYtd: 0.9 },   // NBS, 2026-11-09/11
    china: { cpi23: 0.2, cpi24: 0.2, cpi25: 0.0, ppi23: -3.0, ppi24: -2.2, ppi25: -2.6, negMonths: 41, turn: 0.5 },                      // NBS annual releases; PPI y/y < 0 Oct 2022–Feb 2026
    us2610: { cpi: 4.08, core: 2.87 },                        // BLS via FRED, as on how-an-economy-is-measured
    us2206: { cpi: 9.1 },
    brentPeak: 126,                                            // intraday 2026-04-30
    shapiro: { gap: 4.8, coreGap: 3.3 },
    jorda: 3,
    spirals: { episodes: 79, similar: 22 },
    exp10Nov26: 2.67,                                          // Cleveland Fed EXPINF10YR, 2026-11 (FRED)
    nrou26: 4.39,                                              // CBO NROU, 2026Q4 (FRED)
    fedTariff: { coreGoods: 3.1, corePce: 0.8 },               // FEDS Notes 2026-04-08, via who-pays-a-tariff
    jpWb: null
  };

  return { round, fmt, pct, usAt, qty, QTY_PRESETS, ADAS_SHOCKS, adas, PC, phillips, WP, spiral, SG, seignSteady, seignMax, seignRoots, seignorage, annualOfMonthly,
    debtDeflation, depression, usSeries, cpiInfl, ERAS, phillipsData, eraSlopes, wbAvg, FACTS, data: D };
}));
