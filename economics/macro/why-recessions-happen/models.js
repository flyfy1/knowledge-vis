/* Why Do Recessions Happen? — models (UMD: page + node).
   Every model is a pure function of its parameters. Units: output is an index, 100 = the economy before the
   shock, one step = one period (a quarter unless a comment says otherwise). Nothing here is a forecast of any
   economy; every model is a textbook mechanism at toy scale. Sources per model are in BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RecessionModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    d = d == null ? 0 : d;
    const neg = x < 0;
    let s = Math.abs(x).toFixed(d);
    if (Number(s) === 0) return (0).toFixed(d);
    const [i, f] = s.split('.');
    const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + ii + (f ? '.' + f : '');
  }

  /* seeded RNG (mulberry32) and a standard normal (Box–Muller) */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normals(n, seed) {
    const r = rng(seed), out = [];
    while (out.length < n) {
      const u = Math.max(r(), 1e-12), v = r();
      const m = Math.sqrt(-2 * Math.log(u));
      out.push(m * Math.cos(2 * Math.PI * v), m * Math.sin(2 * Math.PI * v));
    }
    return out.slice(0, n);
  }

  /* ════════ ch1: paradox of thrift ════════
     Households spend out of last period's income: C_t = C0 + c·Y_{t−1}.
     Saving out of that income:                    S_t = Y_{t−1} − C_t.
     Investment, optionally induced by income:     I_t = I0 + b·Y_{t−1}.
     Output is what is bought:                     Y_t = C_t + I_t.
     Steady state: Y* = (C0 + I0)/(1 − c − b), and S* = I* (saving equals investment).
     At t = 0 every household lowers c from c0 to c1. */
  function thrift(o) {
    const C0 = o.C0, I0 = o.I0, b = o.b || 0, n = o.n == null ? 24 : o.n;
    const Ystar = c => (C0 + I0) / (1 - c - b);
    const Y = [Ystar(o.c0)], S = [Y[0] - C0 - o.c0 * Y[0]], I = [I0 + b * Y[0]];
    for (let t = 1; t <= n; t++) {
      const c = o.c1, yl = Y[t - 1];
      const C = C0 + c * yl, inv = I0 + b * yl;
      Y.push(C + inv); S.push(yl - C); I.push(inv);
    }
    return { Y, S, I, y0: Ystar(o.c0), y1: Ystar(o.c1), s0: S[0], s1: I0 + b * Ystar(o.c1),
      sPeak: Math.max(...S) };
  }

  /* ════════ ch2: the accelerator ════════
     A firm keeps capital K_t = v·sales_t and replaces a share δ of last year's capital.
     Machine orders I_t = δ·K_{t−1} + (K_t − K_{t−1}) = δ·v·s_{t−1} + v·(s_t − s_{t−1}).
     Sales grow g1 for three years, then g2. */
  function accelerator(o) {
    const v = o.v, d = o.delta, s = [100];
    const g = [o.g1, o.g1, o.g1, o.g2, o.g2, o.g2];
    g.forEach(x => s.push(s[s.length - 1] * (1 + x / 100)));
    const inv = [];
    for (let t = 1; t < s.length; t++) inv.push(d * v * s[t - 1] + v * (s[t] - s[t - 1]));
    const before = inv[2], after = inv[3];
    return { sales: s, inv, before, after, change: (after / before - 1) * 100,
      salesGrowth: o.g2 };
  }

  /* ════════ ch3: Samuelson (1939) multiplier–accelerator ════════
     C_t = c·Y_{t−1};  I_t = v·(C_t − C_{t−1});  Y_t = C_t + I_t + G_t (+ ε_t)
     ⇒ Y_t = c(1+v)·Y_{t−1} − c·v·Y_{t−2} + G_t + ε_t.
     Characteristic equation λ² − c(1+v)λ + cv = 0. */
  function samuelsonRoots(c, v) {
    const a = c * (1 + v), b = c * v, disc = a * a - 4 * b;
    if (disc < 0) {
      const mod = Math.sqrt(b), th = Math.acos(Math.max(-1, Math.min(1, a / (2 * mod))));
      return { complex: true, mod, theta: th, period: 2 * Math.PI / th, re: a / 2, im: Math.sqrt(-disc) / 2 };
    }
    const r1 = (a + Math.sqrt(disc)) / 2, r2 = (a - Math.sqrt(disc)) / 2;
    return { complex: false, mod: Math.max(Math.abs(r1), Math.abs(r2)), r1, r2, period: null };
  }
  // region: 'mono' (monotone, converges), 'damped', 'explosive' (oscillating, grows), 'runaway' (monotone, grows)
  function samuelsonRegion(c, v) {
    const R = samuelsonRoots(c, v);
    const stable = c * v < 1;            // for 0 < c < 1 stability ⇔ cv < 1
    if (R.complex) return stable ? 'damped' : 'explosive';
    return stable ? 'mono' : 'runaway';
  }
  // boundary of the complex region: c(1+v)² = 4v  ⇒  c = 4v/(1+v)²
  const complexBoundaryC = v => 4 * v / ((1 + v) * (1 + v));
  // response to a permanent step in G (from G0 to G1 at t = 0), optional seeded shocks of size sigma
  function samuelsonPath(o) {
    const c = o.c, v = o.v, n = o.n == null ? 60 : o.n;
    const G0 = o.G0 == null ? 20 : o.G0, G1 = o.G1 == null ? G0 * 1.1 : o.G1;
    const y0 = G0 / (1 - c);
    const eps = o.sigma ? normals(n + 2, o.seed || 7) : null;
    const Y = [y0, y0];
    for (let t = 2; t < n + 2; t++) {
      const G = t >= 2 ? G1 : G0;
      const e = eps ? o.sigma * eps[t] : 0;
      Y.push(c * (1 + v) * Y[t - 1] - c * v * Y[t - 2] + G + e);
    }
    const yNew = G1 / (1 - c);
    // normalise: 100 = the old steady state
    const out = Y.slice(1).map(y => y / y0 * 100);
    return { Y: out, yOld: 100, yNew: yNew / y0 * 100, peak: Math.max(...out), trough: Math.min(...out.slice(1)) };
  }

  /* ════════ ch4: inventory bullwhip (Metzler 1941; Forrester 1961; Sterman 1989) ════════
     Three stages k = 0 retailer, 1 wholesaler, 2 factory. Each period, stage k:
       receives D_t (orders from downstream; for the retailer, final demand) and ships them (backlog allowed);
       receives what it ordered L periods ago (the factory: what it started producing L periods ago);
       forecasts F_t = α·D_t + (1 − α)·F_{t−1};
       wants stock S* = k·F_t (k periods of cover) and, if it watches the pipeline, a supply line of L·F_t;
       orders O_t = max(0, F_t + [(k·F_t − S_t) + w·(L·F_t − P_t)] / T).
     Final demand steps from 100 to 100·(1 − drop) at period 4. */
  function bullwhip(o) {
    const n = o.n == null ? 60 : o.n, L = o.L, T = o.T, a = o.alpha, k = o.cover, w = o.w || 0;
    const base = 100, stages = 3;
    const demand = t => (t >= 4 ? base * (1 - o.drop / 100) : base);
    const S = Array(stages).fill(k * base);
    const F = Array(stages).fill(base);
    const pipe = Array.from({ length: stages }, () => Array(L).fill(base));   // arrivals queue
    const orders = Array.from({ length: stages + 1 }, () => []);              // orders[0] = final demand
    for (let t = 0; t < n; t++) {
      let D = demand(t);
      orders[0].push(D);
      for (let s = 0; s < stages; s++) {
        const arrive = pipe[s].shift();
        S[s] += arrive - D;
        F[s] = a * D + (1 - a) * F[s];
        const P = pipe[s].reduce((x, y) => x + y, 0);
        const O = Math.max(0, F[s] + ((k * F[s] - S[s]) + w * ((L - 1) * F[s] - P)) / T);
        pipe[s].push(O);
        orders[s + 1].push(O);
        D = O;
      }
    }
    const lows = orders.map(series => Math.min(...series));
    const highs = orders.map(series => Math.max(...series.slice(4)));
    const dropPct = lows.map(m => (1 - m / base) * 100);
    return { orders, dropPct, highs, amp: dropPct[3] / o.drop };
  }

  /* ════════ ch6: balance-sheet recession (after Koo 2003; Eggertsson & Krugman 2012; Mian & Sufi 2014) ════════
     Households hold debt D against houses worth H and may owe at most m·H. At t = 0 house prices fall by x%.
     Debt above the limit is repaid at a rate φ per period: R_t = φ·max(0, D_t − m·H).
     Consumption C_t = C0 + c·Y_{t−1} − R_t; investment fixed; G_t = G0 + γ·R_t (γ: the share of repayment the
     government borrows back into the economy; γ = 0 is no offset).  Y_t = C_t + I + G_t. */
  function deleverage(o) {
    const n = o.n == null ? 40 : o.n, c = o.c, C0 = o.C0, I = o.I, G0 = o.G0;
    const y0 = (C0 + I + G0) / (1 - c);
    const H = 100 * (1 - o.priceDrop / 100), lim = o.m * H;
    let D = o.D0, yl = y0;
    const Y = [100], R = [0], debt = [D];
    let cum = 0;
    for (let t = 1; t <= n; t++) {
      const rep = o.phi * Math.max(0, D - lim);
      D -= rep;
      const y = C0 + c * yl - rep + I + G0 + (o.gamma || 0) * rep;
      Y.push(y / y0 * 100); R.push(rep); debt.push(D); cum += (y0 - y) / y0 * 100; yl = y;
    }
    const trough = Math.min(...Y);
    const below = Y.filter(y => y < 99).length;
    return { Y, R, debt, excess: Math.max(0, o.D0 - lim), trough, cumLoss: cum, below,
      // closed form for the total loss (in % of one period's output): excess debt × multiplier × (1 − γ)
      cumLossExact: Math.max(0, o.D0 - lim) * (1 - (o.gamma || 0)) / (1 - c) / y0 * 100 };
  }

  /* ════════ ch7: automatic stabilisers and lagged policy ════════
     Same economy as ch3, with a tax-and-transfer share τ: consumption depends on after-tax income,
     C_t = c(1−τ)·Y_{t−1}; I_t = v·(C_t − C_{t−1}); and optionally a discretionary rule that reacts L periods late,
     P_t = −k·(Y_{t−L} − Y*). Autonomous demand A drops by `shock` for `dur` periods from t = 0.
     Static multiplier: 1/(1 − c(1 − τ)). */
  const stabMultiplier = (c, tau) => 1 / (1 - c * (1 - tau));
  function stabiliser(o) {
    const c = o.c * (1 - o.tau), v = o.v, n = o.n == null ? 40 : o.n;
    const ys = 100, A0 = ys * (1 - c);
    const Y = [ys, ys], Cc = [c * ys, c * ys];
    const lag = o.lag || 0, k = o.k || 0;
    for (let t = 2; t < n + 2; t++) {
      const shockOn = (t - 2) < o.dur;
      const A = A0 - (shockOn ? o.shock : 0);
      const C = c * Y[t - 1];
      const inv = v * (C - Cc[t - 1]);
      const past = t - 1 - lag;
      const P = k && lag >= 0 && past >= 0 ? -k * (Y[Math.max(0, past)] - ys) : 0;
      Cc.push(C); Y.push(C + inv + A + P);
    }
    const out = Y.slice(1);
    const trough = Math.min(...out);
    const peakAfter = Math.max(...out.slice(1));
    let below = 0; out.forEach(y => { if (y < ys - 1) below++; });
    const rms = Math.sqrt(out.reduce((a, y) => a + (y - ys) * (y - ys), 0) / out.length);
    return { Y: out, trough, depth: 100 - trough, peakAfter, over: Math.max(0, peakAfter - ys), below, rms,
      mult: stabMultiplier(o.c, o.tau) };
  }

  /* ════════ ch8: an indicator as a classifier (Bayes) ════════
     p: base rate (probability that a recession starts in a given year), h: hit rate P(signal | recession),
     f: false-alarm rate P(signal | no recession). */
  function classifier(p, h, f) {
    const tp = h * p, fp = f * (1 - p);
    return { ppv: tp / (tp + fp), perCentury: { hits: 100 * tp, falses: 100 * fp, misses: 100 * (1 - h) * p } };
  }
  /* The Sahm rule's record as stated in how-an-economy-is-measured #ch7 (FRED unemployment, 1960 to Oct 2026):
     11 crossings, 9 of them at the 9 NBER recessions since 1960, 2 not followed by a recession. Per-year rates. */
  const SAHM = { years: 66, recessions: 9, hits: 9, falseAlarms: 2 };
  function sahmRates() {
    const p = SAHM.recessions / SAHM.years;
    const h = SAHM.hits / SAHM.recessions;
    const f = SAHM.falseAlarms / (SAHM.years - SAHM.recessions);
    return { p, h, f };
  }

  /* ════════ facts (dated; sources in BRIEF.md) ════════ */
  const FACTS = {
    // NBER US business cycle reference dates, peaks and troughs since 1945 (contraction months)
    nber: [
      ['1945-02', '1945-10', 8], ['1948-11', '1949-10', 11], ['1953-07', '1954-05', 10], ['1957-08', '1958-04', 8],
      ['1960-04', '1961-02', 10], ['1969-12', '1970-11', 11], ['1973-11', '1975-03', 16], ['1980-01', '1980-07', 6],
      ['1981-07', '1982-11', 16], ['1990-07', '1991-03', 8], ['2001-03', '2001-11', 8], ['2007-12', '2009-06', 18],
      ['2020-02', '2020-04', 2]
    ],
    // expansion (months) from the previous trough to each peak above, as listed by NBER
    nberExpansionBefore: [80, 37, 45, 39, 24, 106, 36, 58, 12, 92, 120, 73, 128],
    // NBER's averages for 1945–2020 (12 cycles from the Oct 1945 trough)
    nberAvgContraction: 10.3, nberAvgExpansion: 64.2,
    // Philadelphia Fed SPF, 2026:Q4 survey released 16 Nov 2026: mean probability of negative real GDP growth
    spf2026q4: { released: '2026-11-16', probs: [11.5, 17.4, 20.9, 22.8, 21.8], prevQ4: 20.0, gdp: 2.3, unemp: 4.2 },
    anxious2001q1: 32, anxious2009q1: 94.41,
    // Bloomberg Economics model, reported 17 Oct 2022: 12-month recession probability
    bbg2022: { prob: 100, prev: 65 },
    // BEA: 2025Q1 real GDP, annual rate (third estimate, June 2025; later revised to −0.6); imports' contribution
    bea2025q1: { third: -0.5, revised: -0.6, imports: -4.66 },
    // NY Fed GSCPI peak, end-2021, standard deviations above the mean (vintage-dependent: 4.2–4.3)
    gscpiPeak: 4.3,
    // Rudebusch (2016): monthly hazard ≈ 2% for a 50-month expansion, ≈ 23% over the next year
    rudebusch: { monthly: 2, yearly: 23 },
    // Dolls, Fuest & Peichl (2012), share of a shock absorbed by taxes and transfers
    dfp: { incomeEU: 38, incomeUS: 32, unempEU: 47, unempUS: 34 },
    // Mian, Rao & Sufi (2013): elasticity of consumption to housing net worth; auto sales in high-debt counties
    mrs: { elastLow: 0.6, elastHigh: 0.8, autoDrop: 40 }
  };

  return { fmt, rng, normals, thrift, accelerator, samuelsonRoots, samuelsonRegion, complexBoundaryC, samuelsonPath,
    bullwhip, deleverage, stabMultiplier, stabiliser, classifier, SAHM, sahmRates, FACTS };
}));
