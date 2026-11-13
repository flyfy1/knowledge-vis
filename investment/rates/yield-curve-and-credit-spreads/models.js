/* The Yield Curve and Credit Spreads: pure mathematical models (no DOM).
 * Loaded as window.YieldCreditModels in the browser and module.exports in Node.
 * Units: yields & spreads in percent per year unless a name ends in "Bp" (basis points)
 * or "Dec" (decimal); prices per 100 face value; time in years unless stated.
 * Every block names the textbook or research source so a reviewer can re-derive it. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.YieldCreditModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  /* Standard normal CDF (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7) and PDF */
  function phi(z) {
    return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  }
  function Phi(z) {
    const s = z < 0 ? -1 : 1;
    const x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + s * y);
  }

  /* ───────── ch1 · spot vs forward rates & par-yield bootstrapping ─────────
   * Standard textbook method: Tuckman & Serrat, Fixed Income Securities, ch. 1-2;
   * Fabozzi, Bond Markets, Analysis, and Strategies, ch. 5.
   * Benchmark par yields at mats = [1, 2, 3, 5, 7, 10, 20, 30] are linearly interpolated
   * to integer years 1..N. Treating each integer-year bond as an annual-coupon par bond:
   *   1 = c_n * sum_{t=1}^{n-1} DF_t + (1 + c_n) * DF_n
   *   => DF_n = (1 - c_n * sum_{t=1}^{n-1} DF_t) / (1 + c_n)
   * Spot zero rate:  z_n = DF_n^(-1/n) - 1
   * 1-yr forward:    f_{n-1->n} = DF_{n-1} / DF_n - 1  (with DF_0 = 1) */
  const boot = {
    mats: [1, 2, 3, 5, 7, 10, 20, 30],
    presets: {
      nov2026: [4.56, 4.73, 4.74, 4.81, 4.89, 4.98, 5.39, 5.35], // FRED DGS* on 2026-11-10
      inv2023: [5.40, 4.87, 4.49, 4.13, 3.97, 3.81, 4.06, 3.85], // FRED DGS* on 2023-06-30
      zirp2021: [0.39, 0.73, 0.97, 1.26, 1.44, 1.52, 1.94, 1.90] // FRED DGS* on 2021-12-31
    },
    customCurve(y2, y10, y30) {
      const y1 = Math.max(0.1, y2 - 0.15 * (y10 - y2));
      const lerp = (a, b, w) => +(a + w * (b - a)).toFixed(4);
      return [
        y1,
        y2,
        lerp(y2, y10, 1 / 8),
        lerp(y2, y10, 3 / 8),
        lerp(y2, y10, 5 / 8),
        y10,
        lerp(y10, y30, 0.5),
        y30
      ];
    },
    interp(mats, ys, n) {
      if (n <= mats[0]) return ys[0];
      for (let i = 1; i < mats.length; i++) {
        if (n <= mats[i]) {
          const w = (n - mats[i - 1]) / (mats[i] - mats[i - 1]);
          return ys[i - 1] + w * (ys[i] - ys[i - 1]);
        }
      }
      return ys[ys.length - 1];
    },
    bootstrap(ys, N = 30, mats = boot.mats) {
      const par = [], df = [], spot = [], fwd = [];
      let acc = 0;
      for (let n = 1; n <= N; n++) {
        const c = boot.interp(mats, ys, n) / 100;
        const d = (1 - c * acc) / (1 + c);
        par.push(100 * c);
        df.push(d);
        spot.push(100 * (Math.pow(d, -1 / n) - 1));
        fwd.push(100 * ((n === 1 ? 1 : df[n - 2]) / d - 1));
        acc += d;
      }
      return { par, df, spot, fwd };
    },
    // Verification helper: reprices the n-year par bond off bootstrapped discount factors (must equal 100)
    reprice(b, n) {
      const c = b.par[n - 1];
      let p = 0;
      for (let t = 1; t <= n; t++) {
        p += (c + (t === n ? 100 : 0)) * b.df[t - 1];
      }
      return p;
    }
  };

  /* ───────── ch2 · expectations hypothesis + term premium ─────────
   * Campbell & Shiller (1991) continuous expectations decomposition:
   *   E[r_t] = rL + (r0 - rL) * 2^(-t / h)
   *   avgExp(n) = (1/n) * int_0^n E[r_t] dt = rL + (r0 - rL) * (1 - exp(-k*n)) / (k*n), k = ln(2)/h
   *   TP_n = tp10 * min(n, 10) / 10   (stylized linear ramp capped at 10Y, stated on page)
   *   y_n = avgExp(n) + TP_n */
  const eh = {
    presets: {
      normal: { r0: 3.5, rL: 3.8, h: 2.0, tp10: 0.9 },
      flat: { r0: 4.5, rL: 4.5, h: 2.0, tp10: 0.0 },
      inverted: { r0: 5.5, rL: 3.0, h: 1.5, tp10: 0.2 },
      tpShock: { r0: 3.8, rL: 3.8, h: 2.0, tp10: 1.8 }
    },
    expShort(p, t) {
      return p.rL + (p.r0 - p.rL) * Math.pow(2, -t / p.h);
    },
    avgExp(p, n) {
      if (n <= 0) return p.r0;
      const k = Math.LN2 / p.h;
      return p.rL + (p.r0 - p.rL) * (1 - Math.exp(-k * n)) / (k * n);
    },
    tp(p, n) {
      return p.tp10 * Math.min(n, 10) / 10;
    },
    yieldAt(p, n) {
      return eh.avgExp(p, n) + eh.tp(p, n);
    },
    curve(p, N = 30) {
      const out = [];
      for (let n = 1; n <= N; n++) {
        const expAvg = eh.avgExp(p, n);
        const tp = eh.tp(p, n);
        out.push({ n, expShort: eh.expShort(p, n), expAvg, tp, yield: expAvg + tp });
      }
      return out;
    },
    summary(p) {
      const y3m = eh.yieldAt(p, 0.25);
      const y2 = eh.yieldAt(p, 2);
      const y10 = eh.yieldAt(p, 10);
      const y30 = eh.yieldAt(p, 30);
      return {
        y3m, y2, y10, y30,
        s10y2y: y10 - y2,
        s10y3m: y10 - y3m,
        expSlope10y2y: eh.avgExp(p, 10) - eh.avgExp(p, 2),
        tpSlope10y2y: eh.tp(p, 10) - eh.tp(p, 2)
      };
    }
  };

  /* ───────── ch3 · bond duration, convexity & exact DCF repricing ─────────
   * Fabozzi, Bond Markets, ch. 4 (annual coupons, face = 100):
   *   P(y) = sum_{t=1..T} c/(1+y)^t + 100/(1+y)^T
   *   D_mac = sum t * PV_t / P
   *   D_mod = D_mac / (1 + y)
   *   C     = sum t(t+1) * PV_t / (P * (1+y)^2)
   *   Taylor 1st order: dP/P ~= -D_mod * dy
   *   Taylor 2nd order: dP/P ~= -D_mod * dy + 0.5 * C * dy^2 */
  const dur = {
    flows(c, T) {
      const f = [];
      for (let t = 1; t <= T; t++) f.push(c + (t === T ? 100 : 0));
      return f;
    },
    price(c, T, yPct) {
      const f = dur.flows(c, T);
      const Y = 1 + yPct / 100;
      let p = 0;
      for (let i = 0; i < f.length; i++) p += f[i] * Math.pow(Y, -(i + 1));
      return p;
    },
    macaulay(c, T, yPct) {
      const f = dur.flows(c, T);
      const Y = 1 + yPct / 100;
      let p = 0, num = 0;
      for (let i = 0; i < f.length; i++) {
        const pv = f[i] * Math.pow(Y, -(i + 1));
        p += pv;
        num += (i + 1) * pv;
      }
      return num / p;
    },
    modified(c, T, yPct) {
      return dur.macaulay(c, T, yPct) / (1 + yPct / 100);
    },
    convexity(c, T, yPct) {
      const f = dur.flows(c, T);
      const Y = 1 + yPct / 100;
      let p = 0, num = 0;
      for (let i = 0; i < f.length; i++) {
        const pv = f[i] * Math.pow(Y, -(i + 1));
        p += pv;
        num += (i + 1) * (i + 2) * pv;
      }
      return num / (p * Y * Y);
    },
    analyze(c, T, y0Pct, dyPct) {
      const p0 = dur.price(c, T, y0Pct);
      const pNew = dur.price(c, T, y0Pct + dyPct);
      const dMac = dur.macaulay(c, T, y0Pct);
      const dMod = dMac / (1 + y0Pct / 100);
      const conv = dur.convexity(c, T, y0Pct);
      const dyDec = dyPct / 100;
      const exactPct = 100 * (pNew / p0 - 1);
      const durPct = -dMod * dyPct;
      const durConvPct = 100 * (-dMod * dyDec + 0.5 * conv * dyDec * dyDec);
      const pLin = p0 * (1 + durPct / 100);
      const pQuad = p0 * (1 + durConvPct / 100);
      return {
        p0, pNew, pLin, pQuad,
        dMac, dMod, conv,
        exactPct, durPct, durConvPct,
        convexityGainPct: exactPct - durPct,
        quadErrorPct: exactPct - durConvPct
      };
    }
  };

  /* ───────── ch4 · curve inversion record (1960-01..2026-10) & NY Fed probit ─────────
   * Data source: FRED monthly GS10 - TB3MS and USREC (1960-01 to 2026-10, 802 months; retrieved 2026-11-13).
   * Probit model: Estrella & Trubin (2006), NY Fed Current Issues 12(5),
   *   "The Yield Curve as a Leading Indicator: Some Practical Issues"
   *   P(Recession 12m ahead) = Phi(-0.6045 - 0.7374 * spreadPct) */
  const HIST_SPREAD = [0.37,0.53,0.94,1.05,1.06,1.69,1.6,1.5,1.32,1.59,1.56,1.59,1.6,1.36,1.35,1.49,1.42,1.55,1.68,1.65,1.7,1.62,1.46,1.46,1.36,1.31,1.21,1.11,1.18,1.18,1.09,1.16,1.2,1.19,1.09,0.99,0.92,1,1.04,1.07,1,1,0.84,0.68,0.7,0.66,0.6,0.61,0.65,0.62,0.68,0.76,0.72,0.69,0.73,0.69,0.67,0.62,0.51,0.34,0.38,0.28,0.28,0.27,0.32,0.41,0.36,0.41,0.37,0.32,0.36,0.24,0.02,0.18,0.28,0.13,0.14,0.31,0.22,0.26,-0.19,-0.34,-0.16,-0.12,-0.14,0.07,0.28,0.75,1.25,1.48,0.95,1.01,0.88,0.92,1.02,0.73,0.53,0.58,0.57,0.26,0.21,0.2,0.19,0.33,0.27,0.23,0.25,0.07,-0.1,0.07,0.28,0.06,0.28,0.13,-0.28,-0.29,0.07,0.1,-0.1,-0.17,-0.08,0.11,0.44,0.88,1.07,1.16,1.01,1.12,1.27,1.42,1.56,1.52,1.8,2.41,2.32,1.97,2.25,1.77,1.33,1.64,1.45,1.47,1.59,1.92,2.57,2.88,2.34,2.48,2.44,2.2,2.13,2.19,1.89,1.74,1.5,1.29,1.05,1.04,0.62,0.41,0.49,-0.29,-0.88,-1.27,-1.2,-0.43,-1.1,-0.71,-0.78,-0.16,-0.75,-0.82,-0.65,-0.36,0.26,-0.92,-0.02,0.44,0.21,0.28,1.24,1.89,2.24,2.62,2.83,2.52,1.93,1.96,2.01,2.18,2.57,2.56,2.87,2.91,2.73,2.7,2.7,2.45,2.6,2.63,2.51,2.49,2.54,2.52,2.59,2.72,2.86,2.83,2.5,2.26,2.14,1.91,1.53,1.36,1.48,1.62,1.52,1.58,1.75,1.86,1.94,1.73,1.63,1.33,0.57,0.65,0.17,-0.07,-0.25,-0.22,-0.36,-0.28,-0.36,-0.15,-0.29,-0.49,-0.93,-1.4,-1.14,-1.65,-1.2,-0.45,-2.45,-1.73,1.6,2.71,2.19,1.97,1.24,0.13,-1.05,-2.65,-2.45,-1.6,-0.24,-0.01,-2.2,-1.26,-0.67,-0.57,0.62,1.61,2.53,2.87,2.31,0.95,1.18,1.17,1.53,1.83,2.6,4.38,4.42,3.2,2.48,2.6,2.6,2.61,2.16,2.19,2.19,2.06,2.3,2.51,2.65,2.9,2.93,2.83,2.77,2.75,2.8,2.94,3.58,3.69,3.24,2.25,2.15,2.42,2.96,3.44,3.62,3.24,3.34,3.48,3.37,3.21,3.23,3.19,3.27,3.08,2.54,2.16,2.12,1.64,1.22,1.24,1.56,1.59,1.47,1.64,2.24,2.25,1.9,1.58,1.65,1.66,1.66,2.38,2.95,2.73,2.76,2.72,3.02,3.39,3.17,3.22,2.86,2.55,2.67,2.81,2.83,2.46,2.33,2.2,1.74,1.45,1.2,1.04,0.82,0.64,0.54,0.53,0.43,0.13,0.14,0.21,0.44,0.37,0.18,0.21,0.57,0.73,0.69,1.02,1.02,0.75,0.85,1.3,1.53,1.55,1.33,1.34,1.87,1.91,2.2,2.39,2.61,2.71,2.69,2.57,2.43,2.54,2.86,3.02,3.23,3.5,3.5,3.73,3.76,3.6,3.63,3.46,3.51,3.73,3.74,3.55,3.6,3.33,3.03,3.1,3.08,2.89,2.77,2.66,2.41,2.31,2.62,2.71,2.77,2.72,2.98,3.29,3.04,2.96,2.97,2.76,2.84,2.79,2.67,2.21,2.07,1.7,1.47,1.41,0.96,0.7,0.86,1.09,0.92,0.76,0.57,0.57,0.65,0.98,1.31,1.56,1.72,1.82,1.72,1.59,1.74,1.54,1.17,1.39,1.55,1.41,1.55,1.73,1.66,1.56,1.17,1.16,1.26,1.06,0.74,0.65,0.5,0.48,0.62,0.69,0.65,0.52,0.5,0.44,0.2,0.57,0.42,0.26,0.38,0.56,0.79,0.89,1.04,1.33,1.24,1.22,1.24,1.25,0.96,1.08,1.34,0.97,0.57,0.33,0.65,0.41,0.09,-0.26,-0.2,-0.37,-0.45,-0.53,0.01,0.22,0.47,1.27,1.77,1.79,1.73,1.61,2.09,2.41,2.78,3.4,3.39,3.19,3.49,3.5,3.43,3.23,2.97,2.64,2.24,2.36,2.82,2.84,2.88,2.73,2.68,2.83,2.5,2.41,3.08,3.5,3.33,3.37,3.37,3.37,3.27,3.15,2.89,3.41,3.7,3.46,3.17,2.8,2.48,2.34,2.12,2.04,1.89,1.63,1.76,1.56,1.3,1.03,0.96,0.82,0.78,0.75,0.66,0.58,0.18,0.14,0.21,0.39,0.39,0.32,0.14,-0.08,-0.09,-0.19,-0.34,-0.29,-0.22,-0.31,-0.38,-0.18,0.02,0.49,0.18,0.47,0.63,0.63,0.88,1.1,0.99,1.62,2.25,2.39,2.15,2.24,2.38,2.17,2.56,3.14,3.34,2.39,2.39,2.57,2.61,2.77,3.11,3.54,3.38,3.42,3.28,3.32,3.35,3.54,3.67,3.58,3.58,3.69,3.26,3.08,2.85,2.54,2.5,2.41,2.62,3.15,3.24,3.45,3.31,3.4,3.13,2.96,2.96,2.28,1.97,2.13,2,1.97,1.94,1.88,2.09,1.97,1.71,1.53,1.43,1.58,1.61,1.65,1.56,1.65,1.84,1.88,1.87,1.7,1.89,2.25,2.54,2.7,2.79,2.57,2.65,2.83,2.82,2.66,2.67,2.68,2.53,2.56,2.51,2.39,2.51,2.28,2.31,2.18,1.85,1.96,2.01,1.92,2.18,2.34,2.29,2.1,2.15,2.05,2.14,2.01,1.83,1.47,1.6,1.58,1.54,1.37,1.2,1.26,1.34,1.43,1.69,1.98,1.92,1.9,1.74,1.5,1.41,1.21,1.25,1.2,1.17,1.29,1.12,1.08,1.17,1.29,1.14,1.11,1.12,1.01,0.93,0.86,0.87,0.9,0.79,0.46,0.34,0.29,0.17,0.15,0.05,-0.1,-0.04,-0.32,-0.19,0.06,0.27,0.32,0.24,-0.02,0.58,0.52,0.54,0.57,0.49,0.55,0.57,0.69,0.78,0.84,1,1.22,1.58,1.62,1.6,1.48,1.27,1.23,1.33,1.53,1.51,1.41,1.61,1.6,1.69,1.99,1.92,1.65,0.67,0.27,0.39,0.26,-0.26,-0.63,-1.01,-0.9,-1.03,-1.46,-1.57,-1.41,-1.35,-1.13,-0.94,-0.54,-0.77,-1.22,-1.16,-1.03,-1.03,-0.7,-0.77,-0.93,-0.95,-1.18,-1,-0.41,-0.06,0.12,0.42,0.23,0.08,0.07,0.17,0.15,0.14,0.14,0.2,0.24,0.31,0.55,0.64,0.53,0.64,0.71,0.88,0.81,0.87,0.96,1.05,1.08];
  const REC_RANGES = [[4,13],[120,130],[167,182],[241,246],[259,274],[367,374],[495,502],[576,593],[722,723]];

  const inv = {
    startYm: '1960-01',
    endYm: '2026-10',
    spread: HIST_SPREAD,
    recRanges: REC_RANGES,
    alpha: -0.6045,
    beta: -0.7374,
    ymAt(idx) {
      const y = 1960 + Math.floor(idx / 12);
      const m = (idx % 12) + 1;
      return y + '-' + String(m).padStart(2, '0');
    },
    probit(spreadPct) {
      return 100 * Phi(inv.alpha + inv.beta * spreadPct);
    },
    record(leadMonths = 12) {
      const s = HIST_SPREAD;
      const recStarts = REC_RANGES.map((r) => r[0]).filter((i) => i >= leadMonths);
      const called = [], missed = [];
      for (const rs of recStarts) {
        let hit = false;
        for (let k = rs - leadMonths; k < rs; k++) {
          if (s[k] < 0) { hit = true; break; }
        }
        if (hit) called.push(inv.ymAt(rs));
        else missed.push(inv.ymAt(rs));
      }
      const rawEps = [];
      let inE = false, es = -1;
      for (let i = 0; i < s.length; i++) {
        if (s[i] < 0 && !inE) { inE = true; es = i; }
        else if (s[i] >= 0 && inE) { rawEps.push([es, i - 1]); inE = false; }
      }
      if (inE) rawEps.push([es, s.length - 1]);
      const episodes = [];
      for (const e of rawEps) {
        if (episodes.length && e[0] - episodes[episodes.length - 1][1] < 6) {
          episodes[episodes.length - 1][1] = e[1];
        } else {
          episodes.push([e[0], e[1]]);
        }
      }
      const falseAlarms = [];
      let openEpisodes = 0;
      for (const [a, b] of episodes) {
        const hasRec = recStarts.some((rs) => rs > a && rs <= b + leadMonths);
        if (!hasRec) {
          if (b + leadMonths < s.length) falseAlarms.push(inv.ymAt(a) + '..' + inv.ymAt(b));
          else openEpisodes++;
        }
      }
      const latestSpread = s[s.length - 1];
      return {
        months: s.length,
        totalRecessions: recStarts.length,
        calledCount: called.length,
        called,
        missed,
        episodeCount: episodes.length,
        falseAlarmCount: falseAlarms.length,
        falseAlarms,
        openEpisodes,
        latestSpread,
        latestProb: inv.probit(latestSpread),
        trough2023: Math.min(...s.slice(744)),
        trough2023Prob: inv.probit(Math.min(...s.slice(744)))
      };
    },
    decompose(observedSpreadPct, tp10Pct) {
      // Observed 10Y - 3M spread = expected rate-path slope + term premium wedge
      // Rate-cut expectation component = observedSpreadPct - tp10Pct
      const expSlope = observedSpreadPct - tp10Pct;
      const probRaw = inv.probit(observedSpreadPct);
      const probExpOnly = inv.probit(expSlope);
      return { observedSpreadPct, tp10Pct, expSlope, probRaw, probExpOnly };
    }
  };

  /* ───────── ch5 · credit spreads, default arithmetic & recovery waterfall ─────────
   * Standard corporate credit decomposition (Elton, Gruber, Agrawal & Mann 2001; Fabozzi):
   *   Promised yield:       y = rf + spread
   *   1-yr expected return (recovery of par R at default):
   *     E[r_1] = (1 - p)*(1 + y) + p*R - 1 = y - p*(1 - R + y)
   *   Textbook 1st-order loss:  EL_approx = p * (1 - R)
   *   Exact 1-yr loss:          EL_exact  = y - E[r_1] = p * (1 - R + y)
   *   Net credit risk/liq prem: excess    = E[r_1] - rf = spread - EL_exact
   *   Break-even default prob:  p*        = spread / (1 - R + y)  (where E[r_1] = rf) */
  const cred = {
    presets: {
      ig_bbb: { rf: 4.81, spreadBp: 89, defaultPct: 0.15, recoveryPct: 45, years: 5 },
      hy_bb: { rf: 4.81, spreadBp: 330, defaultPct: 1.50, recoveryPct: 45, years: 5 },
      hy_ccc: { rf: 4.81, spreadBp: 850, defaultPct: 8.50, recoveryPct: 35, years: 5 },
      gfc_hy: { rf: 2.50, spreadBp: 2182, defaultPct: 13.10, recoveryPct: 28, years: 5 }
    },
    compute({ rf, spreadBp, defaultPct, recoveryPct, years = 5 }) {
      const s = spreadBp / 100;
      const y = rf + s;
      const yDec = y / 100;
      const rfDec = rf / 100;
      const p = clamp(defaultPct / 100, 0, 1);
      const R = clamp(recoveryPct / 100, 0, 1);

      const expRetDec = (1 - p) * (1 + yDec) + p * R - 1;
      const expRetPct = 100 * expRetDec;
      const expLossExactPct = y - expRetPct;
      const expLossApproxPct = 100 * p * (1 - R);
      const netPremiumPct = expRetPct - rf;
      const breakevenPct = 100 * ((s / 100) / (1 - R + yDec));

      // Multi-year horizon T survival & expected wealth (starting 100, default recoveries reinvested at rf)
      const survivalPath = [100];
      const promisedWealth = [100];
      const rfWealth = [100];
      const expectedWealth = [100];
      for (let t = 1; t <= years; t++) {
        survivalPath.push(100 * Math.pow(1 - p, t));
        promisedWealth.push(100 * Math.pow(1 + yDec, t));
        rfWealth.push(100 * Math.pow(1 + rfDec, t));
        // E[W_t] with recovery R*100 reinvested at rf after default
        let ew = 100 * Math.pow(1 - p, t) * Math.pow(1 + yDec, t);
        for (let k = 1; k <= t; k++) {
          ew += 100 * Math.pow(1 - p, k - 1) * p * R * Math.pow(1 + yDec, k - 1) * Math.pow(1 + rfDec, t - k);
        }
        expectedWealth.push(ew);
      }
      const cumDefaultPct = 100 - survivalPath[years];
      const cagrExpected = 100 * (Math.pow(expectedWealth[years] / 100, 1 / years) - 1);

      return {
        rf, spreadPct: s, spreadBp, promisedYield: y,
        expLossExactPct, expLossApproxPct, expRetPct,
        netPremiumPct, netPremiumBp: netPremiumPct * 100,
        breakevenPct, cumDefaultPct, survivalPct: survivalPath[years],
        cagrExpected, survivalPath, promisedWealth, rfWealth, expectedWealth
      };
    }
  };

  /* ───────── ch6 · Merton (1974) structural credit & liquidity crunch ─────────
   * Merton (1974), "On the Pricing of Corporate Debt: The Risk Structure of Interest Rates":
   *   Firm asset value V = 100 follows GBM with asset vol sigmaV, risk-free rate r,
   *   zero-coupon debt face F due at maturity T (leverage L = F / V).
   *   Equity = Call(V, F, r, T, sigmaV) = V*Phi(d1) - F*exp(-rT)*Phi(d2)
   *   Risky debt D = V - E = F*exp(-rT) - Put(V, F, r, T, sigmaV)
   *   Credit spread (bp) = -(1/T)*ln(D / (F*exp(-rT))) * 10000
   *   Distance to default (Q): d2 = [ln(V/F) + (r - 0.5*sigmaV^2)*T] / (sigmaV*sqrt(T))
   *   Observed spread = s_Merton + liqWedgeBp (non-default liquidity crunch component) */
  const merton = {
    compute({ leveragePct, sigmaVPct, T = 5, rfPct = 4.8, muAddonPct = 3.0, liqWedgeBp = 0 }) {
      const V = 100;
      const L = clamp(leveragePct / 100, 0.05, 1.2);
      const F = V * L;
      const sig = clamp(sigmaVPct / 100, 0.04, 0.90);
      const r = rfPct / 100;
      const mu = r + muAddonPct / 100;
      const tau = Math.max(0.25, T);
      const sT = sig * Math.sqrt(tau);

      const d1 = (Math.log(V / F) + (r + 0.5 * sig * sig) * tau) / sT;
      const d2 = d1 - sT;
      const d2P = (Math.log(V / F) + (mu - 0.5 * sig * sig) * tau) / sT;

      const discF = F * Math.exp(-r * tau);
      const equity = V * Phi(d1) - discF * Phi(d2);
      const debt = V - equity;
      const putVal = discF - debt;

      const spreadDec = Math.max(0, -(1 / tau) * Math.log(Math.max(1e-12, debt / discF)));
      const spreadBp = 10000 * spreadDec;
      const totalSpreadBp = spreadBp + liqWedgeBp;
      const yieldPct = rfPct + totalSpreadBp / 100;

      const qDefaultPct = 100 * Phi(-d2);
      const pDefaultPct = 100 * Phi(-d2P);
      const recGivenDefPct = Phi(-d2) > 1e-8 ? clamp(100 * (V * Math.exp(r * tau) * Phi(-d1)) / (F * Phi(-d2)), 0, 100) : 100;

      return {
        V, F, L, equity, debt, discF, putVal,
        d1, ddQ: d2, ddP: d2P,
        spreadBp, liqWedgeBp, totalSpreadBp, yieldPct,
        qDefaultPct, pDefaultPct, recGivenDefPct
      };
    },
    sweepLeverage(sigmaVPct, T, rfPct, liqWedgeBp) {
      const pts = [];
      for (let lev = 20; lev <= 95; lev += 2.5) {
        const res = merton.compute({ leveragePct: lev, sigmaVPct, T, rfPct, liqWedgeBp });
        pts.push({ lev, spreadBp: res.spreadBp, totalSpreadBp: res.totalSpreadBp, ddQ: res.ddQ });
      }
      return pts;
    }
  };

  /* ───────── ch7 · real vs nominal yields, Fisher identity & spread decomposition ─────────
   * Exact Fisher relation: 1 + y_nom = (1 + r_real) * (1 + pi_be)
   *   pi_be = E[pi] + irpNet  (inflation expectation + inflation risk premium - TIPS liquidity wedge)
   *   y_corp = y_nom + oasSpread
   * Purchasing power after T years per $1,000 invested (reinvested at coupon/real yield):
   *   Nominal Treasury real purchasing power = 1000 * ((1 + y_nom) / (1 + pi_actual))^T
   *   TIPS real purchasing power             = 1000 * (1 + r_real)^T */
  const tips = {
    tiers: {
      ust: { oasBp: 0, elBp: 0 },
      ig: { oasBp: 89, elBp: 8 },    // ~89 bp IG OAS (Nov 2026), ~8 bp assumed loss
      hy: { oasBp: 330, elBp: 83 }   // ~330 bp HY OAS (Nov 2026), ~1.5% * (1-0.45) = 82.5 bp loss
    },
    compute({ rRealPct, expInflPct, irpNetPct, tier = 'ig', actualInflPct = 2.5, horizon = 10 }) {
      const rR = rRealPct / 100;
      const bePct = expInflPct + irpNetPct;
      const beDec = bePct / 100;
      const yNomDec = (1 + rR) * (1 + beDec) - 1;
      const yNomPct = 100 * yNomDec;
      const approxNomPct = rRealPct + bePct;
      const fisherCrossPct = yNomPct - approxNomPct;

      const tSpec = tips.tiers[tier] || tips.tiers.ig;
      const oasPct = tSpec.oasBp / 100;
      const elPct = tSpec.elBp / 100;
      const creditPremPct = oasPct - elPct;
      const yCorpPct = yNomPct + oasPct;

      const actInf = actualInflPct / 100;
      const nomRealWealth = 1000 * Math.pow((1 + yNomDec) / (1 + actInf), horizon);
      const tipsRealWealth = 1000 * Math.pow(1 + rR, horizon);
      const corpRealWealth = 1000 * Math.pow((1 + yCorpPct / 100) / (1 + actInf), horizon);

      return {
        rRealPct, expInflPct, irpNetPct,
        breakevenPct: bePct,
        yNomPct, approxNomPct, fisherCrossPct,
        oasBp: tSpec.oasBp, oasPct, elPct, creditPremPct, yCorpPct,
        actualInflPct, horizon,
        nomRealWealth, tipsRealWealth, corpRealWealth,
        tipsEdgeDollar: tipsRealWealth - nomRealWealth
      };
    }
  };

  /* ───────── ch8 · DATED FRONTIER SNAPSHOT (November 2026) ─────────
   * All values observed 2026-11-10..2026-11-12 from FRED / TradingEconomics / ChinaMoney.
   * Update ONLY this block (and BRIEF.md "Facts that will go stale") when refreshing data. */
  const frontier = {
    asOf: '2026-11-12',
    treasuryDate: '2026-11-10',
    mats: [1, 2, 3, 5, 7, 10, 20, 30],
    curves: {
      nov2026: [4.56, 4.73, 4.74, 4.81, 4.89, 4.98, 5.39, 5.35],
      inv2023: [5.40, 4.87, 4.49, 4.13, 3.97, 3.81, 4.06, 3.85],
      zirp2021: [0.39, 0.73, 0.97, 1.26, 1.44, 1.52, 1.94, 1.90]
    },
    ust3m: 4.30,          // FRED DGS3MO, 2026-11-10
    ust2y: 4.73,          // FRED DGS2, 2026-11-10
    ust10y: 4.98,         // FRED DGS10, 2026-11-10
    ust30y: 5.35,         // FRED DGS30, 2026-11-10
    spread10y2y: 0.24,    // FRED T10Y2Y, 2026-11-12 (+24 bp)
    spread10y2yDate: '2026-11-12',
    spread10y3m: 0.78,    // FRED T10Y3M, 2026-11-12 (+78 bp)
    spread10y3mDate: '2026-11-12',
    tp10: 0.87,           // FRED THREEFYTP10 (Kim-Wright 10Y TP), 2026-11-06
    tp10Date: '2026-11-06',
    tips10: 2.78,         // FRED DFII10, 2026-11-10
    tips10Date: '2026-11-10',
    breakeven10: 2.24,    // FRED T10YIE, 2026-11-12
    breakeven10Date: '2026-11-12',
    igOasBp: 89,          // FRED BAMLC0A0CM (0.89%), 2026-11-12
    igOasDate: '2026-11-12',
    hyOasBp: 330,         // FRED BAMLH0A0HYM2 (3.30%), 2026-11-11
    hyOasDate: '2026-11-11',
    crisis: {
      igGfcBp: 656,       // 2008-12-05
      igCovidBp: 401,     // 2020-03-23
      hyGfcBp: 2182,      // 2008-12-15
      hyCovidBp: 1087     // 2020-03-23
    },
    moody: {
      ig1yPct: 0.02,      // Moody's long-run IG ~0.01-0.02%
      sgAvgPct: 4.5,      // Moody's long-run speculative grade ~4-5%
      sgPeak2009Pct: 13.1,// Late 2009 peak
      recoveryPct: 45     // Senior unsecured long-run ~40-50%
    },
    global10y: [
      { id: 'us', y: 4.98, date: '2026-11-10' },
      { id: 'uk', y: 5.32, date: '2026-11' },
      { id: 'de', y: 3.39, date: '2026-11' },
      { id: 'jp', y: 2.83, date: '2026-11' },
      { id: 'cn', y: 1.60, date: '2026-11' }
    ]
  };

  return { clamp, sum, phi, Phi, boot, eh, dur, inv, cred, merton, tips, frontier };
}));
