/* Body in balance: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.BodyModels and by tests/models.cjs via require().
 * Every live simulation advances with a fixed internal step so the result does not depend on frame rate:
 * the page feeds real elapsed time × a model-time speed into `advance`, which runs whole fixed steps. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BodyModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LN2 = Math.log(2);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* Run `stepFn(state, h)` in whole steps of h covering `span` model time; leftover time is carried. */
  function advance(state, span, h, stepFn) {
    state._acc = (state._acc || 0) + span;
    let n = 0;
    while (state._acc >= h - 1e-12 && n < 100000) { stepFn(state, h); state._acc -= h; n++; }
    return n;
  }

  /* ───────── 1 · Leaky bucket: dL/dt = I − kL ───────── */
  const bucket = {
    H: 0.02, // min
    create(level) { return { t: 0, L: level }; },
    step(s, h, p) { // exact update over h for constant I, k
      const Ls = p.I / p.k; s.L = Ls + (s.L - Ls) * Math.exp(-p.k * h); s.t += h;
    },
    setpoint: p => p.I / p.k,
    halfGap: p => LN2 / p.k,             // time for the distance to the set point to halve
    outflow: (s, p) => p.k * s.L,
    exact: (L0, t, p) => p.I / p.k + (L0 - p.I / p.k) * Math.exp(-p.k * t)
  };

  /* ───────── 2 · Repeated dosing, one compartment, instantaneous absorption ─────────
   * Concentration in "doses": one standard dose raises the level by 1. kel = ln2 / t½. */
  const dosing = {
    // doses: [{t, amt}]  → concentration at time t (exact superposition)
    conc(t, doses, half) {
      const k = LN2 / half; let c = 0;
      for (const d of doses) if (d.t <= t + 1e-9) c += d.amt * Math.exp(-k * (t - d.t));
      return c;
    },
    schedule(interval, until, opts = {}) {
      // regular doses from t=0; opts.miss = index of a missed dose; opts.double = index that gets 2 doses; opts.amt
      const out = [], amt = opts.amt == null ? 1 : opts.amt;
      for (let i = 0, t = 0; t <= until + 1e-9; i++, t = i * interval) {
        if (opts.miss === i) continue;
        out.push({ t, amt: amt * (opts.double === i ? 2 : 1) });
      }
      return out;
    },
    // steady state for regular dosing (exact)
    accumulation: (interval, half) => 1 / (1 - Math.pow(2, -interval / half)),
    steadyPeak(interval, half, amt = 1) { return amt * dosing.accumulation(interval, half); },
    steadyTrough(interval, half, amt = 1) { return dosing.steadyPeak(interval, half, amt) - amt; },
    // fraction of the steady level reached after time t (continuous-infusion view, also the trough fraction)
    fractionOfPlateau: (t, half) => 1 - Math.pow(2, -t / half),
    peakTroughRatio: (interval, half) => Math.pow(2, interval / half)
  };

  /* ───────── 3 · Alcohol: Michaelis–Menten elimination ─────────
   * C in mg/100 mL. Each drink puts `perDrink` into the stomach; it is absorbed first-order (ka per hour).
   * Elimination Vmax·C/(Km + C): Vmax 15 mg/100 mL/h, Km 5 mg/100 mL (Jones 2010: typical rate 15, Km 2–10). */
  const alcohol = {
    P: { vmax: 15, km: 5, ka: 3, perDrink: 20 },
    H: 1 / 120, // h (half a minute)
    create() { return { t: 0, C: 0, gut: 0, given: 0 }; },
    step(s, h, p) {
      const P = Object.assign({}, alcohol.P, p);
      // drinks: n drinks, one every `spacing` hours starting at t = 0
      while (s.given < P.n && s.given * P.spacing <= s.t + 1e-9) { s.gut += P.perDrink; s.given++; }
      const abs = P.ka * s.gut, elim = P.vmax * s.C / (P.km + s.C);
      s.gut -= abs * h; s.C = Math.max(0, s.C + (abs - elim) * h); s.t += h;
    },
    run(p, until) {
      const s = alcohol.create(), out = [];
      let peak = 0, tPeak = 0, tClear = null;
      for (let i = 0; s.t <= until; i++) {
        if (i % 6 === 0) out.push([s.t, s.C]);
        if (s.C > peak) { peak = s.C; tPeak = s.t; }
        if (tClear == null && s.given >= p.n && s.gut < 0.05 && s.C < 1) tClear = s.t;
        alcohol.step(s, alcohol.H, p);
      }
      return { series: out, peak, tPeak, tClear };
    },
    // slope of the falling straight part (mg/100 mL per hour) at concentration C
    rateAt: (C, P = alcohol.P) => P.vmax * C / (P.km + C),
    // drinks per hour the liver can match at most
    maxDrinksPerHour: (P = alcohol.P) => P.vmax / P.perDrink
  };

  /* ───────── 4 · Blood glucose with insulin and glucagon ─────────
   * Illustrative feedback model (in the spirit of Bergman's minimal model, not fitted to patients). Time in min.
   * gut: Q' = −ka·Q, appearance Ra = ka·Q (mmol/L per min)
   * insulin signal: I' = (gain·max(0, G(t − delay) − Gb) − I) / tauI
   * G' = Ra − I·G/Gb − k0·(G − Gb) + glucagon·cg·max(0, Gb − G) */
  const glucose = {
    P: { Gb: 5, ka: 1 / 30, tauI: 12, k0: 0.002, cg: 0.06, gain: 0.04, delay: 10, glucagon: true, meal: 5.5 },
    H: 0.25,
    create(p) { const P = Object.assign({}, glucose.P, p); return { t: 0, G: P.Gb, I: 0, Q: 0, hist: [] }; },
    eat(s, size) { s.Q += size; },
    step(s, h, p) {
      const P = Object.assign({}, glucose.P, p);
      s.hist.push(s.G); const lag = Math.round(P.delay / h);
      while (s.hist.length > lag + 1) s.hist.shift();
      const Gd = s.hist[0];
      const Ra = P.ka * s.Q;
      const dI = (P.gain * Math.max(0, Gd - P.Gb) - s.I) / P.tauI;
      const dG = Ra - s.I * s.G / P.Gb - P.k0 * (s.G - P.Gb) + (P.glucagon ? P.cg * Math.max(0, P.Gb - s.G) : 0);
      s.Q -= Ra * h; s.I += dI * h; s.G = Math.max(0.5, s.G + dG * h); s.t += h;
    },
    run(p, until = 300) {
      const P = Object.assign({}, glucose.P, p), s = glucose.create(P);
      glucose.eat(s, P.meal);
      const out = []; let peak = -1, tPeak = 0, low = 99, above = 0;
      for (let i = 0; s.t <= until + 1e-9; i++) {
        if (i % 4 === 0) out.push([s.t, s.G, s.I]);
        if (s.G > peak) { peak = s.G; tPeak = s.t; }
        if (s.G < low) low = s.G;
        if (s.G > 7.8) above += glucose.H;
        glucose.step(s, glucose.H, P);
      }
      const at = tt => out.reduce((b, r) => Math.abs(r[0] - tt) < Math.abs(b[0] - tt) ? r : b)[1];
      return { series: out, peak, tPeak, low, above, at120: at(120), at240: at(240) };
    }
  };

  /* ───────── 5 · Body temperature with a set point ─────────
   * Time in min, T in °C. Effector u = clamp(Kc·(Tset − T), −coolMax, heatMax): positive = shivering and
   * narrowing skin vessels, negative = sweating and widening skin vessels. Passive drift kp·(T − 37).
   * dT/dt = u + load − ice − kp·(T − 37). Antipyretic: Tset relaxes back towards 37 with time constant 20 min. */
  const thermo = {
    P: { Kc: 0.1, heatMax: 0.04, coolMax: 0.06, kp: 0.01, iceRate: 0.03, tauDrug: 20 },
    H: 0.1,
    create() { return { t: 0, T: 37, set: 37, target: 37, u: 0 }; },
    effector(s, P = thermo.P) { return clamp(P.Kc * (s.set - s.T), -P.coolMax, P.heatMax); },
    step(s, h, p) {
      const P = Object.assign({}, thermo.P, p);
      s.set += (s.target - s.set) * (1 - Math.exp(-h / P.tauDrug));
      s.u = thermo.effector(s, P);
      s.T += (s.u + (p.load || 0) - (p.ice ? P.iceRate : 0) - P.kp * (s.T - 37)) * h; s.t += h;
    },
    // steady temperature for a fixed set point (solve u(T) + load − ice − kp(T − 37) = 0 by bisection)
    steady(set, load = 0, ice = false, P = thermo.P) {
      const f = T => clamp(P.Kc * (set - T), -P.coolMax, P.heatMax) + load - (ice ? P.iceRate : 0) - P.kp * (T - 37);
      let a = 30, b = 46;
      for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
      const T = (a + b) / 2; return { T, u: clamp(P.Kc * (set - T), -P.coolMax, P.heatMax) };
    },
    feel(s) { const e = s.set - s.T; return e > 0.2 ? 'cold' : e < -0.2 ? 'hot' : 'ok'; }
  };

  /* ───────── 6 · Dose–response and the therapeutic window ─────────
   * Quantal Hill curves: share of people who get the effect / the harm at concentration C (in "doses"). */
  const windowM = {
    P: { ec50: 0.8, nE: 3, tc50: 5, nT: 4 },
    effect: (C, P = windowM.P) => C <= 0 ? 0 : 1 / (1 + Math.pow(P.ec50 / C, P.nE)),
    harm: (C, P = windowM.P) => C <= 0 ? 0 : 1 / (1 + Math.pow(P.tc50 / C, P.nT)),
    // lower edge: half of people respond; upper edge: 5 % are harmed
    lower: (P = windowM.P) => P.ec50,
    upper: (P = windowM.P) => P.tc50 * Math.pow(0.05 / 0.95, 1 / P.nT),
    index: (P = windowM.P) => P.tc50 / P.ec50,
    // plan: n doses a day sharing `daily` doses in total; t½ = 8 h × slow
    run(n, slow, days = 6, daily = 3, half0 = 8) {
      const half = half0 * slow, interval = 24 / n, amt = daily / n, until = days * 24;
      const doses = dosing.schedule(interval, until, { amt });
      const lo = windowM.lower(), hi = windowM.upper(), dt = 0.1, series = [];
      let inWin = 0, below = 0, over = 0, firstOver = null, peakLast = 0, troughLast = Infinity;
      const steps = Math.round(until / dt);
      for (let i = 0; i <= steps; i++) { // integer index: no drift in t
        const t = i * dt, c = dosing.conc(t, doses, half);
        if (i % 2 === 0) series.push([t, c]);
        if (c > hi && firstOver == null) firstOver = t;
        if (t >= until - 24 - 1e-9) { if (c > peakLast) peakLast = c; if (t > until - 24 + 1e-9 && c < troughLast) troughLast = c; }
      }
      // time shares on the last day [until − 24, until): midpoint rule on a fine grid, so each sample counts
      // exactly dt and the dose at `until` itself is not counted (the old end-inclusive sum overcounted it)
      const fine = 0.01, nLast = Math.round(24 / fine);
      for (let i = 0; i < nLast; i++) {
        const c = dosing.conc(until - 24 + (i + 0.5) * fine, doses, half);
        if (c >= lo && c <= hi) inWin += fine; else if (c < lo) below += fine; else over += fine;
      }
      return { series, half, interval, amt, inWin: inWin / 24, below: below / 24, over: over / 24, firstOver, peak: peakLast, trough: troughLast,
        ssPeak: dosing.steadyPeak(interval, half, amt), ssTrough: dosing.steadyTrough(interval, half, amt) };
    }
  };

  /* ───────── 7 · Heart budget: cardiac output = heart rate × stroke volume ─────────
   * Demand (L/min) = 5 + 2 × workload level (0–10). Stroke volume rises from rest to its maximum by level 5.
   * The body sets heart rate to meet demand, up to HRmax = 208 − 0.7 × age (Tanaka 2001). HR follows its
   * target with a 20 s time constant (illustrative). */
  const heart = {
    FIT: { untrained: { sv0: 70, sv1: 130 }, trained: { sv0: 90, sv1: 170 } },
    TAU: 20, // s
    H: 0.05,
    hrMax: age => 208 - 0.7 * age,
    demand: level => 5 + 2 * level,
    sv(level, fit) { const f = heart.FIT[fit]; return f.sv0 + (f.sv1 - f.sv0) * Math.min(1, level / 5); },
    target(level, fit, age) {
      const sv = heart.sv(level, fit), need = heart.demand(level), hrNeed = need * 1000 / sv, hm = heart.hrMax(age);
      const hr = Math.min(hrNeed, hm);
      return { sv, need, hrNeed, hr, co: hr * sv / 1000, short: Math.max(0, need - hr * sv / 1000), hm };
    },
    maxCO: (fit, age) => heart.hrMax(age) * heart.FIT[fit].sv1 / 1000,
    create(level, fit, age) { const g = heart.target(level, fit, age); return { t: 0, hr: g.hr }; },
    step(s, h, p) { const g = heart.target(p.level, p.fit, p.age); s.hr += (g.hr - s.hr) * (1 - Math.exp(-h / heart.TAU)); s.t += h; }
  };

  /* ───────── 8 · Antibiotic selection ─────────
   * Two strains in one infection, time in hours. Drug concentration from the dosing model (t½ 4 h, every 8 h),
   * in multiples of the sensitive strain's MIC. Growth r·(1 − N/K); drug kill Emax·C^h/(MIC^h + C^h);
   * immune kill m·Nimm/(Nimm + N) per cell (strong against small populations, swamped by large ones).
   * A strain below 1 cell is gone. Illustrative parameters, not any real drug or bacterium. */
  const bact = {
    P: { r: 0.4, K: 1e9, emax: 0.6, hill: 2, micS: 1, micR: 8, m: 0.1, nImm: 1e3, half: 4, interval: 8, S0: 1e8, R0: 100 },
    H: 0.02,
    killRate(C, mic, P = bact.P) { return C <= 0 ? 0 : P.emax * Math.pow(C, P.hill) / (Math.pow(mic, P.hill) + Math.pow(C, P.hill)); },
    run(o, untilDays = 14) {
      const P = Object.assign({}, bact.P, o.P || {});
      const until = untilDays * 24, stop = o.days * 24;
      const doses = o.dose > 0 ? dosing.schedule(P.interval, stop - 1e-6, { amt: o.dose, miss: o.miss }) : [];
      let S = P.S0, R = P.R0, t = 0; const out = [];
      let cleared = null, peakR = R;
      for (let i = 0; t <= until + 1e-9; i++) {
        const C = dosing.conc(t, doses, P.half);
        if (i % 25 === 0) out.push([t, S, R, C]);
        const N = S + R, grow = P.r * (1 - N / P.K), imm = P.m * P.nImm / (P.nImm + N);
        S = S * Math.exp((grow - bact.killRate(C, P.micS, P) - imm) * bact.H);
        R = R * Math.exp((grow - bact.killRate(C, P.micR, P) - imm) * bact.H);
        if (S < 1) S = 0; if (R < 1) R = 0;
        if (R > peakR) peakR = R;
        if (cleared == null && S === 0 && R === 0) cleared = t;
        t += bact.H;
      }
      const last = out[out.length - 1];
      return { series: out, S: last[1], R: last[2], cleared, peakR, doses };
    }
  };

  /* ───────── 9 · Herd immunity: Reed–Frost chain binomial ─────────
   * N people, a share v immune. Each generation a susceptible escapes each infectious person with
   * probability 1 − R0/N. Exact threshold and final size for comparison. */
  function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const herd = {
    threshold: R0 => Math.max(0, 1 - 1 / R0),
    re: (R0, v) => R0 * (1 - v),
    // share of the whole population eventually infected (deterministic final-size equation)
    finalSize(R0, v) {
      const s0 = 1 - v; if (R0 * s0 <= 1) return 0;
      let z = s0; for (let i = 0; i < 500; i++) z = s0 * (1 - Math.exp(-R0 * z));
      return z;
    },
    create(N, R0, v, seed, seeds = 1) {
      const R = rng(seed), st = new Uint8Array(N); // 0 S, 1 immune (vaccinated), 2 I, 3 recovered
      const idx = [...Array(N).keys()];
      for (let i = N - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const nV = Math.round(v * N);
      for (let i = 0; i < nV; i++) st[idx[i]] = 1;
      let placed = 0;
      for (let i = nV; i < N && placed < seeds; i++) { st[idx[i]] = 2; placed++; }
      return { N, R0, st, rand: R, gen: 0, infected: placed, done: placed === 0, newest: placed };
    },
    generation(s) {
      if (s.done) return 0;
      const I = s.st.reduce((a, x) => a + (x === 2), 0), p = Math.min(1, s.R0 / s.N), esc = Math.pow(1 - p, I);
      const nxt = [];
      for (let i = 0; i < s.N; i++) if (s.st[i] === 0 && s.rand() > esc) nxt.push(i);
      for (let i = 0; i < s.N; i++) if (s.st[i] === 2) s.st[i] = 3;
      for (const i of nxt) s.st[i] = 2;
      s.gen++; s.infected += nxt.length; s.newest = nxt.length; if (!nxt.length) s.done = true;
      return nxt.length;
    },
    runToEnd(N, R0, v, seed, seeds = 1) { const s = herd.create(N, R0, v, seed, seeds); while (!s.done && s.gen < 1000) herd.generation(s); return s; },
    // average outbreak size over many seeded runs (share of N)
    meanAttack(N, R0, v, runs, seed0 = 1, seeds = 1) {
      let tot = 0, big = 0;
      for (let k = 0; k < runs; k++) { const s = herd.runToEnd(N, R0, v, seed0 + k, seeds); tot += s.infected; if (s.infected > 0.05 * N) big++; }
      return { mean: tot / runs / N, bigShare: big / runs };
    }
  };

  return { LN2, clamp, advance, rng, bucket, dosing, alcohol, glucose, thermo, window: windowM, heart, bact, herd };
}));
