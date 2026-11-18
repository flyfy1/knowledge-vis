/* What "magnitude 7" means: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.QuakeModels and by tests/models.cjs via require().
 * Each block names the standard result it implements; parameters that are tuned for shape say so. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuakeModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const SEC_PER_YEAR = 365.25 * 86400;

  /* seeded RNG (mulberry32): runs are repeatable */
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ───────── 1 · One block on a spring: stick–slip (Reid's elastic rebound; the textbook spring–block slider) ─────────
   * A block held by static friction Fs is pulled through a spring (stiffness k) whose far end moves at the plate
   * speed v. When the spring force reaches Fs the block slips against a lower dynamic friction Fd. With constant
   * Fd the slip is half a period of an undamped oscillator about the dynamic equilibrium:
   *   slip D = 2(Fs − Fd)/k,  slip duration = π·sqrt(m/k),  force after slip = 2Fd − Fs,  recurrence T = D / v.
   * Units: force in "spring-metres" (k = 1 per metre, so force and displacement share a number), v in cm/yr.
   * The slip duration (4 s) is tuned for shape: a real rupture's duration grows with its length. */
  const block = {
    K: 1, FS: 10, DUR: 4,
    slip: p => 2 * p.drop / block.K,                          // metres
    recurrence: p => block.slip(p) / (p.v / 100),             // years
    ratio: p => block.recurrence(p) * SEC_PER_YEAR / block.DUR, // loading time ÷ slip time
    create(p) { return { phase: 'stick', t: 0, F: block.FS - 2 * p.drop, x: 0, tau: 0, events: [] }; },
    // advance the stick phase by up to `years`; returns the unused years if a slip starts
    load(s, years, p) {
      const rate = block.K * p.v / 100, need = (block.FS - s.F) / rate;
      if (years < need) { s.F += rate * years; s.t += years; return 0; }
      s.F = block.FS; s.t += need; s.phase = 'slip'; s.tau = 0; s.x0 = s.x; s.e0 = p.drop / block.K;
      return years - need;
    },
    // advance the slip phase by up to `seconds`; e(τ) = e0·cos(ωτ), ω = π / DUR
    slide(s, seconds, p) {
      const w = Math.PI / block.DUR;
      s.tau = Math.min(block.DUR, s.tau + seconds);
      const e = s.e0 * Math.cos(w * s.tau);
      s.x = s.x0 + (s.e0 - e);
      s.F = (block.FS - p.drop) + block.K * e;
      if (s.tau >= block.DUR - 1e-12) { s.phase = 'stick'; s.events.push({ t: s.t, slip: 2 * s.e0 }); s.F = block.FS - 2 * p.drop; }
    }
  };

  /* ───────── 2 · Moment magnitude (Hanks & Kanamori 1979; the USGS form) ─────────
   * M0 = μ·A·D (N·m), Mw = (2/3)(log10 M0 − 9.1). μ = 32 GPa for crustal rock (USGS).
   * Radiated energy: log10 E = 1.5 Mw + 4.8 (J), the Gutenberg–Richter energy relation, which is the same as
   * E = M0 × 5×10⁻⁵ (Kanamori 1977). USGS also quotes log10 E = 5.24 + 1.44 Mw; both are given below. */
  const mag = {
    MU: 3.2e10,
    moment: (Lkm, Wkm, Dm) => mag.MU * Lkm * 1e3 * Wkm * 1e3 * Dm,
    mw: M0 => (2 / 3) * (Math.log10(M0) - 9.1),
    m0FromMw: Mw => Math.pow(10, 1.5 * Mw + 9.1),
    energy: Mw => Math.pow(10, 1.5 * Mw + 4.8),
    energyUSGS: Mw => Math.pow(10, 5.24 + 1.44 * Mw),
    perUnit: () => Math.pow(10, 1.5),              // energy ratio for +1 magnitude
    // reference energies (J): 1 t TNT (NIST SP 811), Hiroshima ≈ 15 kt (DOE/OSTI), a 1 GW plant for a day,
    // world primary energy use in 2023 ≈ 620 EJ (Energy Institute Statistical Review 2024)
    REF: { tnt: 4.184e9, hiroshima: 15e3 * 4.184e9, gwday: 1e9 * 86400, world: 620e18 }
  };

  /* ───────── 3 · Intensity with distance (Allen, Wald & Worden 2012, hypocentral form, active crust) ─────────
   * MMI = c0 + c1·M + c2·ln sqrt(R² + Rm²) + [R > 50 km] c4·ln(R/50),  Rm = m1 + m2·e^(M−5),  R = hypocentral km.
   * c0 2.085, c1 1.428, c2 −1.402, c4 0.078, m1 −0.209, m2 2.042 (OpenQuake AllenEtAl2012Rhypo). Total σ ≈ 0.8–1.2.
   * Soft ground: an amplitude factor F adds 3.47·log10 F (Wald et al. 1999, MMI from peak velocity). The three
   * ground choices (×1, ×2, ×4) are illustrative; USGS measured factors up to more than 7 after Northridge. */
  const ipe = {
    C: { c0: 2.085, c1: 1.428, c2: -1.402, c4: 0.078, m1: -0.209, m2: 2.042 },
    SITE: 3.47,
    hypo: (r, h) => Math.sqrt(r * r + h * h),
    mmi(M, r, h, F = 1) {
      const C = ipe.C, R = ipe.hypo(r, h), rm = C.m1 + C.m2 * Math.exp(M - 5);
      let I = C.c0 + C.c1 * M + C.c2 * Math.log(Math.sqrt(R * R + rm * rm));
      if (R > 50) I += C.c4 * Math.log(R / 50);
      return I + ipe.SITE * Math.log10(F);
    },
    sigma: R => 0.82 + 0.37 / (1 + (R / 22.9) * (R / 22.9)),
    level: I => clamp(Math.round(I), 1, 12),
    // farthest epicentral distance (km) at which intensity is still ≥ target (bisection; intensity falls with r)
    reach(M, h, F, target) {
      if (ipe.mmi(M, 0, h, F) < target) return 0;
      let a = 0, b = 2000;
      if (ipe.mmi(M, b, h, F) >= target) return b;
      for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (ipe.mmi(M, m, h, F) >= target) a = m; else b = m; }
      return a;
    }
  };

  /* ───────── 4 · Locating from S−P, and early warning ─────────
   * Uniform crust with IASP91 upper-crust speeds vp = 5.8, vs = 3.36 km/s; hypocentre depth h.
   * S−P at hypocentral distance R: R(1/vs − 1/vp). Distance from S−P: Δt / (1/vs − 1/vp).
   * Alert time = P arrival at the nearest station + processing delay. Warning at epicentral distance d:
   *   W(d) = sqrt(d² + h²)/vs − t_alert.  Blind ("late-alert") zone: W ≤ 0, radius sqrt((vs·t_alert)² − h²). */
  const loc = {
    VP: 5.8, VS: 3.36,
    slow: () => 1 / loc.VS - 1 / loc.VP,
    sp: R => R * loc.slow(),
    distFromSp: dt => dt / loc.slow(),
    kmPerSecond: () => 1 / loc.slow(),
    alertTime(dNearest, h, proc) { return Math.sqrt(dNearest * dNearest + h * h) / loc.VP + proc; },
    warning(d, h, tAlert) { return Math.sqrt(d * d + h * h) / loc.VS - tAlert; },
    blindRadius(h, tAlert) { const R = loc.VS * tAlert; return R > h ? Math.sqrt(R * R - h * h) : 0; },
    STATIONS: [{ x: 40, y: 30 }, { x: 175, y: 45 }, { x: 95, y: 125 }], // km on a 240 × 160 km map
    CITY: { x: 215, y: 135 },
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  };

  /* ───────── 5 · A sheet of blocks: the Burridge–Knopoff idea as the Olami–Feder–Christensen automaton (1992) ─────────
   * L×L blocks, each with stress f ∈ [0,1). The plate loads all blocks at the same rate. A block reaching 1 slips:
   * its stress drops to 0 and each of its four neighbours receives α times the dropped stress (α = 0.2 < 0.25:
   * some stress is lost, as in a real fault). Open edges. Slips cascade within the same instant: one earthquake.
   * Rupture area A = number of blocks that slipped × (2 km)². Magnitude from a circular crack with a constant
   * stress drop Δσ = 3 MPa (Eshelby; Kanamori & Anderson 1975): M0 = 16/(7π^1.5)·Δσ·A^1.5, then Mw as in model 2.
   * Time: one unit of loading (a block from 0 to 1) is set to 100 model years. Block size, Δσ and the time scale
   * are choices, not data. */
  const sheet = {
    L: 32, ALPHA: 0.2, PATCH_KM: 2, DSIG: 3e6, YEARS: 100, BURN: 30000,
    create(seed = 7, burn = sheet.BURN, alpha = sheet.ALPHA) {
      const L = sheet.L, N = L * L, R = rng(seed), f = new Float64Array(N);
      for (let i = 0; i < N; i++) f[i] = R();
      const s = { L, N, f, alpha, t: 0, mark: new Int32Array(N).fill(-1), n: 0, stack: new Int32Array(N * 8), last: null };
      for (let i = 0; i < burn; i++) sheet.next(s);
      s.t = 0; s.n = 0;
      return s;
    },
    // time (model years) until the next slip starts
    wait(s) { let mx = -1; for (let i = 0; i < s.N; i++) if (s.f[i] > mx) mx = s.f[i]; return (1 - mx) * sheet.YEARS; },
    // load for `years` without crossing a threshold (caller must keep years < wait)
    load(s, years) { const g = years / sheet.YEARS; for (let i = 0; i < s.N; i++) s.f[i] += g; s.t += years; },
    // jump to the next slip and run the whole cascade; returns the event
    next(s) {
      const { L, N, f, mark, stack } = s, a = s.alpha;
      let mx = -1, k = 0;
      for (let i = 0; i < N; i++) if (f[i] > mx) { mx = f[i]; k = i; }
      const gap = 1 - mx; s.t += gap * sheet.YEARS;
      for (let i = 0; i < N; i++) f[i] += gap;
      f[k] = 1;
      const id = s.n++; let sp = 0, area = 0; stack[sp++] = k;
      while (sp) {
        const i = stack[--sp]; if (f[i] < 1) continue;
        const d = f[i]; f[i] = 0; if (mark[i] !== id) { mark[i] = id; area++; }
        const x = i % L, y = (i / L) | 0;
        if (x > 0) { const j = i - 1; f[j] += a * d; if (f[j] >= 1) stack[sp++] = j; }
        if (x < L - 1) { const j = i + 1; f[j] += a * d; if (f[j] >= 1) stack[sp++] = j; }
        if (y > 0) { const j = i - L; f[j] += a * d; if (f[j] >= 1) stack[sp++] = j; }
        if (y < L - 1) { const j = i + L; f[j] += a * d; if (f[j] >= 1) stack[sp++] = j; }
      }
      const ev = { t: s.t, id, area, M: sheet.mw(area), start: k };
      s.last = ev;
      return ev;
    },
    areaKm2: blocks => blocks * sheet.PATCH_KM * sheet.PATCH_KM,
    mw(blocks) {
      const A = sheet.areaKm2(blocks) * 1e6, M0 = 16 / (7 * Math.pow(Math.PI, 1.5)) * sheet.DSIG * Math.pow(A, 1.5);
      return mag.mw(M0);
    },
    // a long catalogue of events (for statistics); burn-in already done by create
    catalogue(seed, years, alpha = sheet.ALPHA) { const s = sheet.create(seed, sheet.BURN, alpha), out = []; while (s.t < years) out.push(sheet.next(s)); return out; },
    // cumulative counts per 1000 years for each magnitude threshold
    rates(cat, ms) { const span = cat[cat.length - 1].t - cat[0].t; return ms.map(m => cat.filter(e => e.M >= m - 1e-9).length / span * 1000); },
    // intervals between events at or above M
    intervals(cat, M) { const t = cat.filter(e => e.M >= M - 1e-9).map(e => e.t); return t.slice(1).map((x, i) => x - t[i]); },
    cv(xs) { const m = xs.reduce((a, b) => a + b, 0) / xs.length; const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length); return sd / m; },
    mean: xs => xs.reduce((a, b) => a + b, 0) / xs.length
  };

  /* ───────── 6 · How often: Gutenberg–Richter, log10 N(≥M) = a − b·M ─────────
   * Data: USGS worldwide counts per year, 2000–2021, by magnitude bin. Fit: least squares on log10 of the mean
   * cumulative yearly counts at M = 5, 6, 7, 8. */
  const gr = {
    YEARS: [2000, 2021],
    COUNTS: { // per year 2000…2021
      8: [1, 1, 0, 1, 2, 1, 2, 4, 0, 1, 1, 1, 2, 2, 1, 1, 0, 1, 1, 1, 0, 3],
      7: [14, 15, 13, 14, 14, 10, 9, 14, 12, 16, 23, 19, 12, 17, 11, 18, 16, 6, 16, 9, 9, 16],
      6: [146, 121, 127, 140, 141, 140, 142, 178, 168, 144, 150, 185, 108, 123, 143, 127, 130, 104, 117, 135, 112, 140],
      5: [1344, 1224, 1201, 1203, 1515, 1693, 1712, 2074, 1768, 1896, 2209, 2276, 1401, 1453, 1574, 1419, 1550, 1455, 1674, 1492, 1312, 2047]
    },
    binMean(m) { const a = gr.COUNTS[m]; return a.reduce((x, y) => x + y, 0) / a.length; },
    binRange(m) { const a = gr.COUNTS[m]; return [Math.min(...a), Math.max(...a)]; },
    cumMean(m) { let s = 0; for (const k of [5, 6, 7, 8]) if (k >= m) s += gr.binMean(k); return s; },
    cumYear(m, i) { let s = 0; for (const k of [5, 6, 7, 8]) if (k >= m) s += gr.COUNTS[k][i]; return s; },
    fit() {
      const xs = [5, 6, 7, 8], ys = xs.map(m => Math.log10(gr.cumMean(m)));
      const mx = xs.reduce((a, b) => a + b) / 4, my = ys.reduce((a, b) => a + b) / 4;
      let sxy = 0, sxx = 0; for (let i = 0; i < 4; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
      const b = -sxy / sxx; return { a: my + b * mx, b };
    },
    perYear(M, f = gr.fit()) { return Math.pow(10, f.a - f.b * M); },
    // a fitted least-squares slope for any catalogue rate list
    slope(ms, rates) {
      const ys = rates.map(r => Math.log10(r)), n = ms.length, mx = ms.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
      let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (ms[i] - mx) * (ys[i] - my); sxx += (ms[i] - mx) * (ms[i] - mx); }
      return -sxy / sxx;
    }
  };

  /* ───────── 7 · Aftershocks: modified Omori law with Gutenberg–Richter (Reasenberg & Jones 1989) ─────────
   * λ(t, ≥M) = 10^(a + b(Mm − M)) · (t + c)^(−p) per day; generic California values a −1.67, b 0.91, p 1.08,
   * c 0.05 d. Expected number in [S, S+T]: 10^(a+b(Mm−M)) · ∫ (t+c)^(−p) dt.  P(at least one) = 1 − e^(−N). */
  const after = {
    P: { a: -1.67, b: 0.91, p: 1.08, c: 0.05 },
    rate(t, Mm, M, P = after.P) { return Math.pow(10, P.a + P.b * (Mm - M)) * Math.pow(t + P.c, -P.p); },
    integral(S, T, P = after.P) { const q = 1 - P.p; return (Math.pow(S + T + P.c, q) - Math.pow(S + P.c, q)) / q; },
    expected(Mm, M, S, T, P = after.P) { return Math.pow(10, P.a + P.b * (Mm - M)) * after.integral(S, T, P); },
    prob(Mm, M, S, T, P = after.P) { return 1 - Math.exp(-after.expected(Mm, M, S, T, P)); },
    // one random sequence (inhomogeneous Poisson by inversion of the cumulative integral), seeded
    simulate(Mm, M, days, seed, P = after.P) {
      const R = rng(seed), k = Math.pow(10, P.a + P.b * (Mm - M)), q = 1 - P.p, out = [];
      let t = 0;
      for (let i = 0; i < 5000; i++) {
        const target = -Math.log(1 - R()) / k;            // next unit-rate gap in "integral" space
        const base = Math.pow(t + P.c, q);
        const val = base + q * target;                     // q < 0: val decreases
        if (val <= 0) break;                               // the remaining integral is finite: no more events
        t = Math.pow(val, 1 / q) - P.c;
        if (t > days) break;
        // magnitude above M from the Gutenberg–Richter tail with slope b
        const mag = M - Math.log10(1 - R()) / P.b;
        out.push({ t, M: Math.min(mag, Mm) });
      }
      return out;
    }
  };

  /* ───────── 8 · Calling the next big one on the sheet ─────────
   * Hit rate of a rule over many "now" moments along a long catalogue. A rule returns a window [t0, t0 + W]; a hit
   * is at least one event ≥ Mbig inside it. Rules: "from now", "periodic" (centred on last big + mean interval). */
  const call = {
    hitRates(cat, Mbig, W, step) {
      const big = cat.filter(e => e.M >= Mbig - 1e-9).map(e => e.t);
      const ints = big.slice(1).map((x, i) => x - big[i]), mean = ints.reduce((a, b) => a + b, 0) / ints.length;
      const t0 = big[0], t1 = cat[cat.length - 1].t - W;
      let n = 0, hitNow = 0, hitPer = 0, j = 0;
      const anyIn = (a, b) => { let lo = 0, hi = big.length; while (lo < hi) { const m = (lo + hi) >> 1; if (big[m] < a) lo = m + 1; else hi = m; } return lo < big.length && big[lo] <= b; };
      for (let now = t0 + step / 2; now < t1; now += step) {
        while (j + 1 < big.length && big[j + 1] <= now) j++;
        const last = big[j];
        n++;
        if (anyIn(now, now + W)) hitNow++;
        const c = Math.max(now, last + mean - W / 2);
        if (c + W <= t1 + W && anyIn(c, c + W)) hitPer++;
      }
      return { n, mean, now: hitNow / n, periodic: hitPer / n };
    }
  };

  return { clamp, rng, SEC_PER_YEAR, block, mag, ipe, loc, sheet, gr, after, call };
}));
