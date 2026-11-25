/* What a stock is worth: the page's models. Each is the textbook result at small scale; tests/models.cjs re-derives
   them by brute force and against closed forms.
   - strip: present value of a growing stream of cash, year by year (Williams 1938; Gordon 1959).
   - gordon: P = D1/(r − g) and its sensitivity to r (duration 1/(r − g) under continuous compounding of the change).
   - impliedG / yearsOfGrowth: what a P/E has to assume. Sustainable growth g = (1 − payout)·ROE gives
     P/E = (1 − g/ROE)/(r − g); a two-stage version asks how many years of fast growth a P/E needs.
   - capeCycle: trailing P/E versus a ten-year-average P/E (Graham & Dodd 1934; Campbell & Shiller 1998) on a
     schematic earnings path with recessions.
   - impliedERP: the required return that equates an index price with its expected cash to owners, minus the
     risk-free rate (the method of Damodaran's monthly implied equity risk premium, simplified to two stages).
   - sml / betaFit: CAPM required return rf + β·ERP (Sharpe 1964; Lintner 1965) and the noise in a β estimated by
     least squares from n months.
   - excessVol: dividends = trend × (1 + x), x an AR(1); the price under a belief about persistence versus the
     ex-post rational price P* (Shiller 1981).
   - funds: active managers with mean-zero skill before costs (Sharpe 1991), fees and tracking noise; the share that
     trail the index over a horizon, closed form and seeded simulation with closures.
   - bubble: a rational bubble that survives each year with probability π (Blanchard & Watson 1982).
   UMD: window.StockWorthModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.StockWorthModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── utilities ── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gaussian(r) { // Box–Muller
    let spare = null;
    return function () {
      if (spare != null) { const s = spare; spare = null; return s; }
      let u = 0, v = 0; while (u <= 1e-12) u = r(); v = r();
      const m = Math.sqrt(-2 * Math.log(u)); spare = m * Math.sin(2 * Math.PI * v); return m * Math.cos(2 * Math.PI * v);
    };
  }
  function cdf(x) { // standard normal CDF, Abramowitz–Stegun 7.1.26 replaced by erfc via continued series (W. J. Cody style)
    const z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.5 * z);
    const y = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
      t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? 1 - y / 2 : y / 2; // Numerical Recipes erfc, |error| < 1.2e-7
  }
  function fmt(x, d, lang) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    d = d == null ? 0 : d;
    let s = Math.abs(x).toFixed(d);
    if (+s === 0) return s;
    const [i, f] = s.split('.');
    s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
    return (x < 0 ? '−' : '') + s;
  }
  function signed(x, d, lang) { const s = fmt(x, d, lang); return (+Math.abs(x).toFixed(d == null ? 0 : d) === 0 || x < 0) ? s : '+' + s; }

  /* ── ch2: a growing strip of cash ──
     Year k pays D1·(1+g)^(k−1) and is worth that /(1+r)^k today. With q = (1+g)/(1+r) < 1 the first n years
     are worth P·(1 − q^n) of the whole P = D1/(r − g). */
  function strip(D1, r, g, n) {
    const out = []; let cum = 0;
    for (let k = 1; k <= n; k++) { const cash = D1 * Math.pow(1 + g, k - 1), pv = cash / Math.pow(1 + r, k); cum += pv; out.push({ k, cash, pv, cum }); }
    return out;
  }
  function shareFirst(r, g, n) { const q = (1 + g) / (1 + r); return r > g ? 1 - Math.pow(q, n) : 0; }
  function halfYear(r, g) { const q = (1 + g) / (1 + r); return r > g ? Math.log(0.5) / Math.log(q) : Infinity; } // years until half the value is in

  /* ── ch3: Gordon growth ── */
  function gordon(D1, r, g) { return r > g ? D1 / (r - g) : Infinity; }
  function gordonShock(D1, r, g, dr) { // price change when r moves by dr, g fixed
    const p0 = gordon(D1, r, g), p1 = gordon(D1, r + dr, g);
    return { p0, p1, chg: isFinite(p0) && isFinite(p1) ? p1 / p0 - 1 : NaN, dur: r > g ? 1 / (r - g) : Infinity };
  }

  /* ── ch4: what a P/E assumes ──
     Forward P/E = payout/(r − g) with payout = 1 − g/ROE (growth paid for by retained earnings).
     Solving for g: g = (PE·r − 1)/(PE − 1/ROE). When ROE = r the P/E is 1/r whatever g is. */
  function peFrom(r, g, roe) { return r > g ? (1 - g / roe) / (r - g) : Infinity; }
  function impliedG(pe, r, roe) {
    const den = pe - 1 / roe;
    if (Math.abs(den) < 1e-12) return NaN;
    return (pe * r - 1) / den;
  }
  // Two stages: earnings grow at g1 for N years with nothing paid out; then the firm is mature with P/E pm.
  // P0/E1 = pm·((1+g1)/(1+r))^N  →  N = ln(PE/pm)/ln((1+g1)/(1+r)).
  function yearsOfGrowth(pe, r, g1, pm) {
    if (pe <= pm) return 0;
    if (g1 <= r) return Infinity;
    return Math.log(pe / pm) / Math.log((1 + g1) / (1 + r));
  }

  /* ── ch5: trailing P/E versus a ten-year average ──
     Earnings = trend(1+gt)^t × (1 − depth·dip(t)); dip is a V that lasts 3 years, at fixed recession years.
     The price looks through most of the cycle: P = pe0 × trend × (1 − 0.4·depth·dip). */
  const CAPE = { years: 70, gt: 0.015, pe0: 17, priceShare: 0.4, recessions: [11, 19, 27, 38, 46, 57, 66] };
  function dip(t) { // 0 outside recessions; 1 at the trough year; t in years (real)
    let d = 0;
    for (const y of CAPE.recessions) { const u = t - y; if (u > -1 && u < 2) d = Math.max(d, u < 0 ? 1 + u : 1 - u / 2); }
    return d;
  }
  function capeCycle(depth) {
    const E = [], P = [], trail = [], cape = [];
    for (let t = 0; t <= CAPE.years; t++) {
      const tr = Math.pow(1 + CAPE.gt, t), d = dip(t);
      E.push(tr * (1 - depth * d)); P.push(CAPE.pe0 * tr * (1 - CAPE.priceShare * depth * d));
    }
    for (let t = 0; t <= CAPE.years; t++) {
      trail.push(P[t] / E[t]);
      if (t >= 9) { let s = 0; for (let k = t - 9; k <= t; k++) s += E[k]; cape.push(P[t] / (s / 10)); } else cape.push(NaN);
    }
    const rng2 = a => { const v = a.filter(x => isFinite(x)).slice(); return { lo: Math.min(...v), hi: Math.max(...v) }; };
    const from = 10; // compare both over the same years
    return { E, P, trail, cape, trailR: rng2(trail.slice(from)), capeR: rng2(cape.slice(from)) };
  }

  /* ── ch6: implied equity risk premium ──
     Index at price P (relative to 1 = today) pays cash y (fraction of today's price) next year growing at g1 for 5
     years, then at g2 = rf forever. Solve r: P = Σ_{k=1..5} y(1+g1)^(k−1)/(1+r)^k + TV/(1+r)^5,
     TV = y(1+g1)^4(1+g2)/(r − g2). ERP = r − rf. */
  function erpValue(r, y, g1, g2) {
    if (r <= g2) return Infinity;
    let v = 0, c = y;
    for (let k = 1; k <= 5; k++) { v += c / Math.pow(1 + r, k); if (k < 5) c *= 1 + g1; }
    return v + c * (1 + g2) / (r - g2) / Math.pow(1 + r, 5);
  }
  function impliedERP(price, y, g1, rf) {
    let lo = rf + 1e-9, hi = 1; // value falls in r; find erpValue(r) = price
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (erpValue(m, y, g1, rf) > price) lo = m; else hi = m; }
    const r = (lo + hi) / 2;
    return { r, erp: r - rf };
  }

  /* ── ch7: CAPM ──
     Damodaran's U.S. industry averages of levered β, January 2026 (pages.stern.nyu.edu/~adamodar, Betas.html). */
  const INDUSTRIES = [
    { id: 'power', beta: 0.48, n: 46 }, { id: 'food', beta: 0.61, n: 78 }, { id: 'drugs', beta: 0.98, n: 228 },
    { id: 'software', beta: 1.28, n: 309 }, { id: 'auto', beta: 1.46, n: 33 }, { id: 'semi', beta: 1.52, n: 66 }
  ];
  function sml(rf, erp, beta) { return rf + beta * erp; }
  // A stock's monthly excess return = β·market + noise. Least squares over n months; theoretical standard error
  // of the slope ≈ σε/(σm·√n).
  function betaFit(beta, sigE, n, seed, sigM) {
    sigM = sigM == null ? 0.045 : sigM;
    const z = gaussian(rng(seed)), pts = [];
    for (let i = 0; i < n; i++) { const m = sigM * z(), s = beta * m + sigE * z(); pts.push([m, s]); }
    let mx = 0, my = 0; for (const [x, y] of pts) { mx += x; my += y; } mx /= n; my /= n;
    let sxy = 0, sxx = 0; for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) * (x - mx); }
    const b = sxy / sxx, a = my - b * mx;
    return { pts, b, a, se: sigE / (sigM * Math.sqrt(n)) };
  }

  /* ── ch8: excess volatility ──
     D_t = T_t·(1 + x_t), T_t = (1+g)^t, x_{t+1} = ρ x_t + σ ε. Under a belief ρb about persistence,
     E[D_{t+k}] = T_{t+k}(1 + ρb^k x_t), so P_t/T_t = q/(1−q) + x_t·qρb/(1−qρb), q = (1+g)/(1+r).
     P*_t = Σ actual D_{t+k}/(1+r)^k, the series closed at the end with the rational price. */
  const EXV = { years: 160, r: 0.07, g: 0.02, rho: 0.6, sigma: 0.06, seed: 1981, burn: 10, tail: 40 };
  function excessVol(rhoB, o) {
    o = Object.assign({}, EXV, o || {});
    const z = gaussian(rng(o.seed)), N = o.years, x = [0];
    for (let t = 1; t <= N; t++) x.push(o.rho * x[t - 1] + o.sigma * z());
    const q = (1 + o.g) / (1 + o.r), base = q / (1 - q);
    const priceN = (xt, rho) => base + xt * q * rho / (1 - q * rho); // P_t / T_t
    const p = x.map(xt => priceN(xt, rhoB));
    const ps = new Array(N + 1); ps[N] = priceN(x[N], o.rho); // P*/T, closed with the rational price at the end
    for (let t = N - 1; t >= 0; t--) ps[t] = q * ((1 + x[t + 1]) + ps[t + 1]); // P*_t = (D_{t+1} + P*_{t+1})/(1+r), divided by T_t
    const lo = o.burn, hi = N - o.tail; // drop the start and the last years, where P* leans on the closing value
    const sd = a => { const v = a.slice(lo, hi + 1), m = v.reduce((s, u) => s + u, 0) / v.length; return Math.sqrt(v.reduce((s, u) => s + (u - m) * (u - m), 0) / (v.length - 1)); };
    const sdP = sd(p), sdS = sd(ps);
    return { x, p, ps, sdP, sdS, ratio: sdP / sdS, lo, hi, base };
  }

  /* ── ch9: active funds versus the index ──
     Fund i, year t: excess return over the index = a_i − fee + te·z_{i,t}, a_i ~ N(0, skill) before costs
     (Sharpe's arithmetic: the average active dollar earns the market before costs). Over T years the average annual
     excess is a_i − fee + te·Z/√T, so the share that trail is Φ(fee / √(skill² + te²/T)). */
  function trailShare(fee, skill, te, T) { const s = Math.sqrt(skill * skill + te * te / T); return s > 0 ? cdf(fee / s) : (fee > 0 ? 1 : 0); }
  // Seeded simulation; a fund closes after three straight years below the index by more than `cut` on average.
  // A closed fund counts as trailing (the SPIVA convention: the denominator is every fund alive at the start).
  function funds(o) {
    const n = o.n || 2000, Tm = o.T || 20, z = gaussian(rng(o.seed || 7));
    const a = [], cum = new Float64Array(n), alive = new Uint8Array(n).fill(1), hist = [];
    for (let i = 0; i < n; i++) a.push(o.skill * z());
    const last3 = Array.from({ length: n }, () => []), aliveAt = [], trailAt = [], trailSurv = [];
    for (let t = 1; t <= Tm; t++) {
      for (let i = 0; i < n; i++) {
        if (!alive[i]) continue;
        const e = a[i] - o.fee + o.te * z(); cum[i] += e; last3[i].push(e); if (last3[i].length > 3) last3[i].shift();
        if (o.close && t >= 3 && last3[i].length === 3 && (last3[i][0] + last3[i][1] + last3[i][2]) / 3 < -o.cut) alive[i] = 0;
      }
      let al = 0, tr = 0, trS = 0;
      for (let i = 0; i < n; i++) { if (alive[i]) { al++; if (cum[i] < 0) { tr++; trS++; } } else tr++; }
      aliveAt.push(al / n); trailAt.push(tr / n); trailSurv.push(al ? trS / al : 1);
    }
    for (let i = 0; i < n; i++) hist.push(alive[i] ? cum[i] / Tm : NaN);
    return { aliveAt, trailAt, trailSurv, hist, a };
  }

  /* ── ch10: a rational bubble ──
     Price = fundamental F + bubble B. Each year the bubble survives with probability π and then grows to
     B(1+r)/π, else it bursts to 0. Its expected return is exactly r, the same as any other asset's. */
  function bubbleGrowth(r, pi) { return (1 + r) / pi - 1; }
  function bubblePath(o) {
    const u = rng(o.seed), path = [{ t: 0, B: o.B0, P: o.F + o.B0 }]; let B = o.B0, burst = -1;
    for (let t = 1; t <= o.years; t++) {
      if (B > 0) { if (u() < o.pi) B *= (1 + o.r) / o.pi; else { B = 0; burst = t; } }
      path.push({ t, B, P: o.F + B });
    }
    return { path, burst };
  }

  /* ── real-world figures the prose quotes (sources and dates in BRIEF.md; one place, so the prose and the tests
     read the same numbers) ── */
  const FRONTIER = {
    // SPIVA U.S. Scorecard Year-End 2025 (S&P Dow Jones Indices, data to 2025-12-31), Report 1a and Report 2:
    // share of all active large-cap U.S. equity funds that trailed the S&P 500, absolute return, net of fees.
    spiva: { h: [1, 3, 5, 10, 15, 20], large: [78.78, 66.84, 88.96, 85.59, 89.93, 92.89], prev1: 65, surv20: 34.61, n20: 760,
      riskAdj20: 97.76 },
    // Report 3 (equal-weighted average returns, annualised, 20 years to 2025-12-31)
    spivaRet20: { sp500: 11.00, largeEw: 8.86 },
    // Damodaran, implied ERP on 2026-11-01 (trailing 12-month cash yield with adjusted payout) and the T-bond rate he used;
    // start of 2026: 4.23%.
    erp: { nov26: 4.41, tbond: 4.94, jan26: 4.23 },
    // RBC Wealth Management (T. Frawley, 2026-01-22): top-10 weight in the S&P 500 at 2025-12-31, their share of 2025
    // expected earnings, the 2000 peak and the 1990–2015 range.
    top10: { w25: 40.7, earn25: 32, peak2000: 27, lo: 18, hi: 23 },
    // T. Leger, CFA Institute Enterprising Investor, 2026-11-18 (charts dated 2026-09-09): CAPE 40.3; late-1999 44.2.
    cape: { now: 40.3, y1999: 44.2 },
    // CNBC (J. Elias, 2026-02-06): Alphabet, Microsoft, Meta, Amazon 2026 capex "nearly $700 billion"; their combined free
    // cash flow $200 billion in 2025, $237 billion in 2024.
    capex: { y26: 700, fcf25: 200, fcf24: 237 },
    // Bain & Company Global Technology Report 2025 (press release 2025-09-23): $2 trillion of annual revenue needed by 2030,
    // $800 billion short even after AI savings.
    bain: { need: 2, gap: 800 },
    // Nasdaq Composite close 2000-03-10 and 2002-10-09 (FRED NASDAQCOM).
    nasdaq: { peak: 5048.62, trough: 1114.11 },
    // McLean & Pontiff (2016): anomaly returns 26% lower out of sample, 58% lower after publication.
    mp: { oos: 26, post: 58 }
  };

  return { FRONTIER, rng, gaussian, cdf, fmt, signed, strip, shareFirst, halfYear, gordon, gordonShock, peFrom, impliedG, yearsOfGrowth,
    CAPE, dip, capeCycle, erpValue, impliedERP, INDUSTRIES, sml, betaFit, EXV, excessVol, trailShare, funds, bubbleGrowth, bubblePath };
});
