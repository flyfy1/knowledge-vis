/* What sets an exchange rate: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.FxModels and by tests/models.cjs / bindings.cjs
 * via require(). Each block names the textbook result it implements. Parameters marked "illustrative" are round
 * numbers chosen for a readable picture, not estimates, and the page says so next to the model.
 * Real data: BIGMAC (The Economist, July 2026 release) and FRONTIER (dated, sourced; BRIEF.md lists the links). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FxModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // Locale-aware number format shared by the page and bindings.cjs.
  function fmt(x, d = 0, lang = 'zh') {
    if (x == null || !isFinite(x)) return '—';
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    return v.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  /* Seeded RNG (mulberry32) and a standard normal (Box–Muller), so simulated runs repeat exactly. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normal(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

  /* ───────── 1 · The onshore dollar market (illustrative) ─────────
   * Quote S = yuan per dollar. Dollars supplied: the share k of export receipts X that exporters convert ("jiehui"),
   * plus inflows Fin, plus price-sensitive sales β(S − S0). Dollars demanded: imports M, outflows Fout, the central
   * bank's net purchases G, minus β(S − S0). Clearing: S* = S0 + (M + Fout + G − kX − Fin)/(2β).
   * Balance of payments: X − M (current account) = private net capital outflow + G (reserve change), always. */
  const market = {
    X: 300, M: 220, Fin: 30, S0: 7, beta: 50,   // billions of dollars per month; β in billions per yuan
    solve(k, Fout, G) {
      const S = this.S0 + (this.M + Fout + G - k * this.X - this.Fin) / (2 * this.beta);
      const ca = this.X - this.M;
      return { S, ca, kept: (1 - k) * this.X, privOut: ca - G, dRes: G,
        volume: k * this.X + this.Fin + this.beta * (S - this.S0) };
    }
  };

  /* ───────── 2 · Big Mac index, July 2026 (The Economist, github.com/TheEconomist/big-mac-data) ─────────
   * [iso, local price, dollar exchange rate (local per USD), GDP per person in dollars or null].
   * Implied PPP = local price / US price; raw valuation = dollar price / US price − 1.
   * GDP-adjusted: OLS of dollar price on GDP per person over countries with GDP data (as The Economist does);
   * valuation = (dollar price / fitted) / (US dollar price / US fitted) − 1. */
  const BIGMAC = { date: '2026-07-01', usPrice: 6.22, rows: [
    ['ARE', 19, 3.67285, 60392], ['ARG', 8700, 1472.98605, 12765], ['AUS', 8.5, 1.42867347667691, 75324], ['AZE', 7.25, 1.7, 10679],
    ['BHR', 1.8, 0.37705, 38126], ['BRA', 23.9, 5.07935, 15538], ['CAN', 8.17, 1.40515, 59356], ['CHE', 7.3, 0.80735, 81901],
    ['CHL', 4990, 922.715, 21029], ['CHN', 26.5, 6.7708, 23418], ['COL', 25900, 3236.28, 8393], ['CRI', 3150, 450.28, 19051],
    ['CZE', 115, 21.1625, 42226], ['DNK', 46, 6.5366, 68986], ['EGY', 145, 50.53, 7210], ['EUZ', 6.19, 0.87439, 44687],
    ['GBR', 5.49, 0.74187, 49528], ['GTM', 34, 7.6199, 9116], ['HKG', 25.5, 7.83895, 108203], ['HND', 139, 26.77, 4189],
    ['HUN', 1660, 313.352, 33882], ['IDN', 43000, 18065, 12114], ['IND', 236.25, 96.26375, 6232], ['ISR', 23, 2.9993, 56323],
    ['JOR', 2.5, 0.709, 9446], ['JPN', 500, 162.135, 66973], ['KOR', 5700, 1485.9, 56232], ['KWT', 1.4, 0.3095, 42042],
    ['LBN', 480000, 89550, null], ['MDA', 80, 17.55, 11543], ['MEX', 109, 17.386, 15085], ['MYS', 14.55, 4.078, 25548],
    ['NIC', 187, 36.6243, 4065], ['NOR', 78, 9.68565, 78314], ['NZL', 8.8, 1.71335560695622, 59084], ['OMN', 1.53, 0.38505, 31256],
    ['PAK', 1080, 277.925, 2729], ['PER', 16.9, 3.3857, 12949], ['PHL', 169, 61.685, 9038], ['POL', 23.5, 3.77915, 28239],
    ['QAT', 18, 3.641, 87645], ['ROU', 18.35, 4.58165, 34386], ['SAU', 19, 3.755, 43537], ['SGP', 7.45, 1.29005, 108466],
    ['SWE', 69, 9.63495, 55474], ['THA', 135, 33.62, 12206], ['TUR', 325, 47.0275, 14053], ['TWN', 78, 32.1875, 98223],
    ['UKR', 149, 44.6702, 11311], ['URY', 359, 40.165, 17473], ['USA', 6.22, 1, 89991], ['VEN', 3267, 724.8398, null],
    ['VNM', 76000, 26255.5, 10278], ['ZAF', 56.9, 16.325, 13238]
  ] };
  const bigmac = (() => {
    const us = BIGMAC.usPrice;
    const pts = BIGMAC.rows.map(([iso, lp, ex, gdp]) => ({ iso, lp, ex, gdp, usd: lp / ex, ppp: lp / us, raw: lp / ex / us - 1 }));
    const g = pts.filter(p => p.gdp != null), n = g.length;
    const mx = g.reduce((s, p) => s + p.gdp, 0) / n, my = g.reduce((s, p) => s + p.usd, 0) / n;
    const sxy = g.reduce((s, p) => s + (p.gdp - mx) * (p.usd - my), 0), sxx = g.reduce((s, p) => s + (p.gdp - mx) ** 2, 0);
    const syy = g.reduce((s, p) => s + (p.usd - my) ** 2, 0);
    const slope = sxy / sxx, icpt = my - slope * mx, r2 = sxy * sxy / (sxx * syy);
    const fit = x => icpt + slope * x, usFit = fit(pts.find(p => p.iso === 'USA').gdp);
    pts.forEach(p => { p.adj = p.gdp == null ? null : (p.usd / fit(p.gdp)) / (us / usFit) - 1; });
    // log-log check of PPP against market rates: slope of ln(market) on ln(implied PPP), all countries but the US
    const q = pts.filter(p => p.iso !== 'USA'), lx = q.map(p => Math.log(p.ppp)), ly = q.map(p => Math.log(p.ex));
    const ax = lx.reduce((a, b) => a + b, 0) / q.length, ay = ly.reduce((a, b) => a + b, 0) / q.length;
    let cxy = 0, cxx = 0, cyy = 0; for (let i = 0; i < q.length; i++) { cxy += (lx[i] - ax) * (ly[i] - ay); cxx += (lx[i] - ax) ** 2; cyy += (ly[i] - ay) ** 2; }
    const under = pts.filter(p => p.iso !== 'USA' && p.raw < 0).length;
    return { pts, n, slope, icpt, r2, fit, usFit, logSlope: cxy / cxx, logR2: cxy * cxy / (cxx * cyy), under, count: pts.length - 1,
      get: iso => pts.find(p => p.iso === iso) };
  })();

  /* ───────── 3 · Real exchange rate ─────────
   * Real value of the yuan against the dollar: q = P_cn / (S · P_us), S = yuan per dollar.
   * After n years with nominal yuan appreciation a (fraction), inflation πcn and πus:
   * q1/q0 = (1 + a) · ((1 + πcn)/(1 + πus))^n. */
  const real = {
    ratio(a, pcn, pus, n) { return (1 + a) * Math.pow((1 + pcn) / (1 + pus), n); },
    breakEven(pcn, pus, n) { return Math.pow((1 + pus) / (1 + pcn), n) - 1; }   // nominal appreciation that keeps q flat
  };

  /* ───────── 4 · Covered interest parity (simple interest over tenor τ in years) ─────────
   * F = S · (1 + i_cny·τ)/(1 + i_usd·τ). A yuan investor who buys dollar deposits and sells the dollars forward
   * earns (1 + i_usd τ)·F/S − 1 = i_cny τ: the hedge hands back exactly the rate gap (before any basis). */
  const cip = {
    forward(S, iusd, icny, tau) { return S * (1 + icny * tau) / (1 + iusd * tau); },
    points(S, F) { return Math.round((F - S) * 10000); },
    hedged(S, iusd, icny, tau) { const F = this.forward(S, iusd, icny, tau); return ((1 + iusd * tau) * F / S - 1) / tau; },
    premium(S, F, tau) { return (F / S - 1) / tau; }
  };

  /* ───────── 5 · Carry trade with crash risk (illustrative) ─────────
   * Monthly return on notional: d/12 + σ/√12·z − c·[crash], crash with probability p/12 a month.
   * Equity E ← E·(1 + L·r); a position whose equity reaches zero is closed out (margin call) and stays at zero.
   * Risk-neutral break-even carry = p·c: the yearly expected crash loss per unit of notional. */
  const carry = {
    sigma: 0.08, years: 10, paths: 2000, seed: 20240805,
    run(d, L, p, c, opts = {}) {
      const N = opts.paths || this.paths, T = 12 * this.years, r = rng(opts.seed || this.seed), sm = this.sigma / Math.sqrt(12);
      const fin = new Float64Array(N); let wiped = 0, sample = null, crashes = 0;
      for (let k = 0; k < N; k++) {
        let E = 1; const path = k === 0 ? [1] : null;
        for (let t = 0; t < T; t++) {
          const z = normal(r), crash = r() < p / 12;
          if (E > 0) {
            if (crash && k === 0) crashes++;
            const ret = d / 12 + sm * z - (crash ? c : 0);
            E = E * (1 + L * ret); if (E <= 0) { E = 0; }
          }
          if (path) path.push(E);
        }
        fin[k] = E; if (E === 0) wiped++; if (path) sample = path;
      }
      const s = Array.from(fin).sort((a, b) => a - b);
      const mean = s.reduce((a, b) => a + b, 0) / N;
      const med = s[Math.floor(N / 2)];
      const lose = s.filter(x => x < 1).length / N;
      return { fin: s, mean, median: med, annMean: Math.pow(mean, 1 / this.years) - 1, annMedian: med > 0 ? Math.pow(med, 1 / this.years) - 1 : -1,
        pLose: lose, pWiped: wiped / N, sample, sampleCrashes: crashes, breakEven: p * c, yearsToRepay: c / Math.max(d, 1e-9) };
    },
    // one adverse move of size m on a position with leverage L: share of equity lost, and years of carry it takes back
    shock(m, L, d) { return { loss: Math.min(1, m * L), years: m / d }; }
  };


  /* ───────── 5 · Overshooting (Dornbusch 1976, perfect-foresight linear version) ─────────
   * Permanent money rise Δm (%). Long run: s̄ and p̄ up Δm. Prices close the gap at rate θ a year:
   * p(t) = Δm(1 − e^{−θt}). Money market with p fixed on impact: Δi = −Δm/λ (λ: semi-elasticity, years).
   * UIP with expected appreciation θ(s − s̄): s(0) − s̄ = Δm/(λθ), so s(0) = Δm(1 + 1/(λθ)); s(t) = Δm + (Δm/(λθ))e^{−θt}. */
  const over = {
    solve(dm, lam, th) { return { jump: dm * (1 + 1 / (lam * th)), long: dm, over: dm / (lam * th), di: -dm / lam, half: Math.LN2 / th }; },
    s(t, dm, lam, th) { return dm + dm / (lam * th) * Math.exp(-th * t); },
    p(t, dm, lam, th) { return dm * (1 - Math.exp(-th * t)); }
  };

  /* ───────── 9 · Currency mismatch on a balance sheet (illustrative) ─────────
   * Assets 100, liabilities 60 in home currency. Share ψ of assets and share φ of liabilities are in dollars.
   * After a depreciation d (fraction): A = 100(1 + ψd), L = 60(1 + φd), net worth A − L.
   * Net worth hits zero at d* = (100 − 60)/(60φ − 100ψ) when 60φ > 100ψ. */
  const mismatch = {
    A0: 100, L0: 60,
    solve(phi, psi, d) {
      const A = this.A0 * (1 + psi * d), L = this.L0 * (1 + phi * d), nw0 = this.A0 - this.L0, nw = A - L;
      const k = this.L0 * phi - this.A0 * psi;
      return { A, L, nw, nw0, dNw: nw / nw0 - 1, lev: L / A, star: k > 1e-12 ? nw0 / k : null };
    }
  };

  /* ───────── 6 · Trilemma: a foreign rate rise of Δ (percentage points) lasting H years ─────────
   * Under UIP with the long-run rate unchanged, a floating currency must jump by Δ·H percent now so that its
   * expected appreciation afterwards pays the gap (Dornbusch 1976 logic, no price stickiness here).
   * 'peg' fixed + open: home rate follows (+Δ), currency still. 'float' open + own rate: currency falls Δ·H%.
   * 'ctrl' fixed + own rate: controls hold back a yearly gap of Δ points. 'mid' (illustrative): half via the rate,
   * half via the currency, with partial controls. */
  const tri = {
    regimes: ['peg', 'float', 'ctrl', 'mid'],
    lost: { peg: 'policy', float: 'fixed', ctrl: 'open', mid: 'part' },
    shock(reg, D, H) {
      if (reg === 'peg') return { dRate: D, dFx: 0, gap: 0 };
      if (reg === 'float') return { dRate: 0, dFx: D * H, gap: 0 };
      if (reg === 'ctrl') return { dRate: 0, dFx: 0, gap: D };
      return { dRate: D / 2, dFx: D * H / 2, gap: D / 2 };
    }
  };

  /* ───────── 7 · Speculative attack on a peg (Krugman 1979; Flood & Garber 1984, linear version) ─────────
   * Money M = D + R (domestic credit + reserves), money demand M = S − α·(expected depreciation per month),
   * peg S̄ = 100. Credit grows μ a month, so under the peg reserves fall μ a month.
   * Shadow floating rate S̃(t) = D(t) + α·μ. The attack comes when S̃ reaches the peg:
   * T = R0/μ − α (not R0/μ), and the last αμ of reserves goes in one day. The rate does not jump at T. */
  const peg = {
    Sbar: 100,
    solve(mu, alpha, R0) {
      const naive = R0 / mu, T = Math.max(0, naive - alpha), run = Math.min(R0, alpha * mu);
      return { naive, T, run, runShare: run / R0, early: naive - T, D0: this.Sbar - R0 };
    },
    reservesAt(t, mu, alpha, R0) { const s = this.solve(mu, alpha, R0); return t < s.T ? R0 - mu * t : 0; },
    rateAt(t, mu, alpha, R0) { const s = this.solve(mu, alpha, R0); return t < s.T ? this.Sbar : this.Sbar - R0 + mu * t + alpha * mu; },
    shadowAt(t, mu, alpha, R0) { return this.Sbar - R0 + mu * t + alpha * mu; }
  };

  /* ───────── 8 · Central parity fixing and the ±2% band (illustrative) ─────────
   * Day t: the market's desired rate W_t = W0·(1 + τ)^t (τ < 0: pressure for the yuan to rise).
   * Fixing: fix_t = close_{t−1} + κ·(fix_{t−1} − close_{t−1}) — κ = 0 follows yesterday's close (the 2015 reform),
   * κ near 1 holds the fix still (leaning against the move; the "counter-cyclical factor" works in this direction).
   * Spot close_t = clamp(W_t, fix_t·(1 − b), fix_t·(1 + b)), b = 2%. The gap W − close is pressure someone must absorb. */
  const fixing = {
    band: 0.02, days: 60, W0: 6.70,
    run(tau, kappa) {
      const fix = [this.W0], close = [this.W0], want = [this.W0], gap = [0]; let edgeDays = 0;
      for (let t = 1; t <= this.days; t++) {
        const W = this.W0 * Math.pow(1 + tau, t);
        const f = close[t - 1] + kappa * (fix[t - 1] - close[t - 1]);
        const c = clamp(W, f * (1 - this.band), f * (1 + this.band));
        if (Math.abs(c - W) > 1e-12) edgeDays++;
        fix.push(f); close.push(c); want.push(W); gap.push(W / c - 1);
      }
      return { fix, close, want, gap, edgeDays, lastFix: fix[this.days], lastClose: close[this.days], lastWant: want[this.days], lastGap: gap[this.days] };
    }
  };

  /* ───────── 9 · Why one currency dominates: a coordination game (illustrative) ─────────
   * Share s of firms invoice in dollars. A firm's net gain from choosing dollars: a + b·(2s − 1)
   * (a: the dollar's own edge — deep markets, safe assets — minus any push for the rival; b: how much it matters
   * what everyone else uses). Logit choice with unit noise: s' = 1/(1 + exp(−(a + b(2s − 1)))).
   * With b > 2 there can be two stable equilibria: history decides which one the world sits in. */
  const coord = {
    next(s, a, b) { return 1 / (1 + Math.exp(-(a + b * (2 * s - 1)))); },
    path(s0, a, b, n = 40) { const out = [s0]; for (let i = 0; i < n; i++) out.push(this.next(out[i], a, b)); return out; },
    equilibria(a, b) {
      const f = s => this.next(s, a, b) - s, out = [], N = 4000;
      for (let i = 0; i < N; i++) {
        const x0 = i / N, x1 = (i + 1) / N, f0 = f(x0), f1 = f(x1);
        if (f0 === 0 || f0 * f1 < 0) {
          let lo = x0, hi = x1; for (let j = 0; j < 60; j++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
          const s = (lo + hi) / 2, slope = 2 * b * this.next(s, a, b) * (1 - this.next(s, a, b));
          out.push({ s, stable: slope < 1 });
        }
      }
      return out;
    },
    // smallest push (lowering a) that removes the high equilibrium, found by bisection on a
    tipping(b) {
      if (b <= 2) return null;
      let lo = -b, hi = b; const hasHigh = a => this.equilibria(a, b).some(e => e.stable && e.s > 0.5);
      for (let j = 0; j < 50; j++) { const m = (lo + hi) / 2; if (hasHigh(m)) hi = m; else lo = m; }
      return (lo + hi) / 2;
    }
  };

  /* ───────── Frontier facts (dated; sources in BRIEF.md) ───────── */
  const FRONTIER = {
    cofer: { asOf: '2026-Q2', published: '2026-09-30', usd: 56.70, usdPrev: 57.18, eur: 20.60, jpy: 4.96, cny: 2.11, cnyPrev: 1.98, totalTn: 13.22,
      kind: 'measured', source: 'IMF COFER data brief, 2026-09-30' },
    swift: { asOf: '2026-06', usd: 59.10, eur: 13.92, gbp: 5.08, jpy: 4.94, cny: 2.18, cnyRank: 6, usdExEuro: 75, cny2020: 1.5,
      kind: 'measured', source: 'Swift Global Currency Tracker (formerly RMB Tracker), June 2026, as reported by Trade Treasury Payments' },
    swiftTf: { asOf: '2026-06', usd: 82.50, eur: 7.00, cny: 5.51, kind: 'measured', source: 'Swift Global Currency Tracker, trade finance, June 2026' },
    bis: { asOf: '2025-04', published: '2025-09-30', dailyTn: 9.6, dailyTn2022: 7.5, usd: 89.2, usd2022: 88.4, eur: 28.9, jpy: 16.8, gbp: 10.2, cny: 8.5, cny2022: 7.0,
      kind: 'measured', source: 'BIS Triennial Central Bank Survey 2025' },
    dxy2025: { lo: 9.4, hi: 9.6, worstSince: 2017, kind: 'measured', source: 'Reuters, Bloomberg year-end reports, 2025-12-31' },
    fed: { asOf: '2026-10-28', lo: 3.75, hi: 4.00, kind: 'measured', source: 'FOMC statement 2026-10-28' },
    boj: { asOf: '2026-10-30', rate: 1.25, kind: 'measured', source: 'Bank of Japan statement 2026-10-30 (via news reports)' },
    pboc7d: { asOf: '2026-11', rate: 1.40, kind: 'measured', source: 'PBOC open market operations, Nov 2026 (via MNI)' },
    cnyFix: { date: '2026-11-25', fix: 6.7088, est: 6.6559, pips: 529, strongestSince: '2022-07', kind: 'measured', source: 'Reuters via 5paisa; Newsquawk preview' },
    cnySpot: { date: '2026-11-25', spot: 6.6581, kind: 'measured', source: 'Reuters (via Business Recorder headline)' },
    cnReserves: { asOf: '2026-10', tn: 3.4052, peak2014: 3.993, low2017: 2.998, kind: 'measured', source: 'SAFE monthly release 2026-11; SAFE historical series' },
    fix2015: { date: '2015-08-11', before: 6.1162, after: 6.2298, kind: 'measured', source: 'CFETS / PBOC 2015-08-11' },
    cips2025: { trnYuan: 180.15, kind: 'measured', source: 'CIPS annual figures as reported by China Daily, 2026' },
    yen2024: { hi: 161.9, lo: 141.7, carryPts: 5.3, bojHike: '2024-07-31', crashDay: '2024-08-05', nikkei: 12.4, posTn: 40,
      kind: 'measured', source: 'BIS Bulletin 90 (2024-08-27); market data' }
  };

  return { FRONTIER, BIGMAC, clamp, fmt, rng, normal, market, bigmac, real, cip, over, carry, tri, peg, mismatch, fixing, coord };
}));
