/* How electricity reaches you: the models behind every chart on the page.
 * Pure functions only (no DOM, no visible text). Loaded by index.html as window.GridModels and by
 * tests/models.cjs via require(). Simulations advance in fixed internal steps so results do not depend
 * on frame rate; the page feeds real elapsed time × a model-time speed into `advance`.
 *
 * Every model is a toy: one bus (a single frequency for the whole grid) or a DC power flow on six buses.
 * None of them is a model of any real country's grid. Parameters marked TUNED were chosen for a clear
 * picture, not fitted to data; BRIEF.md lists which numbers come from sources. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GridModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const F0 = 50;                      // Hz, nominal frequency (50 Hz in China and Europe, 60 Hz in North America)
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const SQ3 = Math.sqrt(3);

  function advance(state, span, h, stepFn) {
    state._acc = (state._acc || 0) + span;
    let n = 0;
    while (state._acc >= h - 1e-12 && n < 200000) { stepFn(state, h); state._acc -= h; n++; }
    return n;
  }

  /* ───────── 1–2 · One bus, the swing equation, governors and AGC ─────────
   * Per unit on the system base S (MW). w = frequency deviation (pu, so Δf = 50·w Hz).
   *   2H dw/dt = Pm − PL − D·w                 (swing equation with load damping D)
   *   governor: valve → clamp(Pref − w/R, ±reserve) with lag Tg; reheat turbine Pm = Fhp·v + (1 − Fhp)·y
   *   dPref/dt = −Ki·w                         (secondary control / AGC, an integral controller)
   * Standard single-area load–frequency model (Kundur, Power System Stability and Control, ch. 11;
   * Bergen & Vittal, Power Systems Analysis, ch. 11). H 4 s and D 1 follow NREL's worked example
   * (Denholm et al. 2020: H 2–7 s for typical plants; D 1–2); R 5 % is the usual droop setting.
   * Tg 0.2 s, Trh 7 s, Fhp 0.3 are Kundur's textbook reheat-turbine values; Ki is TUNED. */
  const swing = {
    H: 0.01, // s, RK4 step
    defaults: { S: 30000, H: 4, D: 1, R: 0.05, governor: false, Tg: 0.2, Trh: 7, Fhp: 0.3, agc: false, Ki: 0.02, reserve: Infinity, dP: 1000 },
    create() { return { t: 0, w: 0, v: 0, y: 0, pref: 0 }; },
    /* states: w frequency deviation, v governor valve, y reheater output, pref AGC set point (all pu).
     * Mechanical power Pm = Fhp·v + (1 − Fhp)·y: the reheat steam turbine of Kundur §9.1 / §11.1. */
    pm: (x, p) => p.Fhp * x.v + (1 - p.Fhp) * x.y,
    deriv(x, p) {
      const PL = p.dP / p.S, res = p.reserve / p.S, on = p.governor || p.agc;
      const gov = clamp(x.pref - (p.governor ? x.w / p.R : 0), -res, res);
      return { w: (swing.pm(x, p) - PL - p.D * x.w) / (2 * p.H), v: on ? (gov - x.v) / p.Tg : 0, y: on ? (x.v - x.y) / p.Trh : 0, pref: p.agc ? -p.Ki * (p.D + 1 / p.R) * x.w : 0 }; // ACE with frequency bias β = D + 1/R
    },
    step(x, h, p) { // RK4
      const K = ['w', 'v', 'y', 'pref'], add = (a, k, c) => { const o = {}; K.forEach(n => o[n] = a[n] + c * k[n]); return o; };
      const k1 = swing.deriv(x, p), k2 = swing.deriv(add(x, k1, h / 2), p), k3 = swing.deriv(add(x, k2, h / 2), p), k4 = swing.deriv(add(x, k3, h), p);
      K.forEach(n => { x[n] += h / 6 * (k1[n] + 2 * k2[n] + 2 * k3[n] + k4[n]); });
      x.t += h;
    },
    /* whole run from a load step at t = 0: series [[t, f]], nadir and when, f at 1 s */
    run(pp, until, every = 0.1) {
      const p = Object.assign({}, swing.defaults, pp), x = swing.create(), out = [[0, F0]];
      let nadir = F0, tNadir = 0, f1 = null, n = 0;
      const per = Math.round(every / swing.H);
      while (x.t < until - 1e-9) {
        swing.step(x, swing.H, p); n++;
        const f = F0 * (1 + x.w);
        if (f < nadir) { nadir = f; tNadir = x.t; }
        if (f1 == null && x.t >= 1 - 1e-9) f1 = f;
        if (n % per === 0) out.push([x.t, f]);
      }
      return { series: out, nadir, tNadir, f1, fEnd: F0 * (1 + x.w), pm: swing.pm(x, p) * p.S };
    },
    rocof: pp => { const p = Object.assign({}, swing.defaults, pp); return -F0 * (p.dP / p.S) / (2 * p.H); }, // Hz/s at t = 0+
    // where frequency settles (closed form): no governor → −ΔP/D; droop → −ΔP/(D + 1/R); AGC → 0
    settle(pp) {
      const p = Object.assign({}, swing.defaults, pp), PL = p.dP / p.S;
      if (p.agc) return F0;
      if (!p.governor) return F0 * (1 - PL / p.D);
      const w = -PL / (p.D + 1 / p.R), res = p.reserve / p.S;
      if (Math.abs(w / p.R) <= res) return F0 * (1 + w);
      return F0 * (1 - (PL - res) / p.D); // governors run out of headroom
    },
    tau: pp => { const p = Object.assign({}, swing.defaults, pp); return 2 * p.H / p.D; },  // s, time constant with no governor
    // kinetic energy stored in the spinning machines (MW·s = MJ): H·S; drawn when speed falls by w: ≈ 2·H·S·|w|
    stored: pp => { const p = Object.assign({}, swing.defaults, pp); return p.H * p.S; },
    drawn(pp, f) { const p = Object.assign({}, swing.defaults, pp), w = f / F0; return p.H * p.S * (1 - w * w); }
  };

  /* ───────── data: CAISO "Today's Outlook" history, hourly means of 5-minute values ─────────
   * https://www.caiso.com/outlook/history/<date>/demand.csv, netdemand.csv and renewables.csv,
   * downloaded 2026-11-11; values in GW, hour h = the hour starting at h:00. "Demand" is load served
   * by the CAISO grid (rooftop solar behind the meter already lowers it). */
  const caiso = {
    julyDemand: [28.32, 26.77, 25.50, 24.85, 24.80, 25.53, 26.33, 26.83, 26.73, 26.58, 26.27, 26.51, 27.56, 28.69, 30.21, 32.09, 33.80, 35.46, 36.71, 36.91, 35.64, 34.52, 32.42, 29.58],
    julySolar:  [0, 0, 0, 0, 0, 0, 1.86, 8.90, 13.98, 15.80, 17.09, 17.67, 18.01, 17.78, 17.65, 17.34, 16.50, 14.59, 9.71, 2.70, 0.02, 0, 0, 0],
    julyWind:   [4.57, 4.23, 4.04, 3.75, 3.44, 3.04, 2.80, 2.52, 2.48, 2.07, 1.84, 1.98, 2.08, 2.38, 3.09, 3.62, 4.36, 4.78, 4.94, 4.84, 4.85, 4.95, 5.27, 5.20],
    aprDemand:  [20.49, 19.76, 19.23, 18.90, 18.79, 19.11, 19.60, 19.59, 19.11, 18.48, 17.60, 17.26, 16.73, 16.17, 15.88, 16.54, 17.26, 19.08, 20.89, 22.78, 23.60, 23.13, 21.82, 20.49],
    aprSolar:   [0.06, 0.04, 0.02, 0, 0, 0.01, 0.56, 5.32, 9.02, 10.38, 12.24, 12.75, 13.07, 13.08, 12.65, 12.85, 11.44, 9.01, 3.58, 0.11, 0, 0, 0.01, 0],
    aprWind:    [3.01, 2.83, 2.78, 2.88, 2.64, 2.26, 2.02, 1.90, 2.16, 2.31, 2.21, 2.40, 2.50, 2.43, 2.60, 2.48, 2.60, 2.89, 3.20, 3.35, 3.62, 3.93, 3.98, 4.06]
  };
  // value at fractional hour t (0–24), piecewise linear through hour midpoints, wrapping at midnight
  function hourly(arr, t) {
    const x = ((t - 0.5) % 24 + 24) % 24, i = Math.floor(x), u = x - i;
    return arr[i] * (1 - u) + arr[(i + 1) % 24] * u;
  }

  /* ───────── 3 · You are the operator: a day in quasi-steady state ─────────
   * Load changes over hours; the fast part (ch1–2) settles in seconds, so frequency is taken at its
   * settled value for the current mismatch m = G − L (GW): governors (droop R) absorb the mismatch
   * until their headroom `reserve` is used, then only load damping D is left.
   *   |m| small:  Δf = 50·m / (S·(D + 1/R))
   *   beyond:     Δf = 50·(m ∓ reserve) / (S·D)
   * Output G follows the operator's target at most `ramp` GW per hour. S, reserve and ramp are TUNED. */
  const operator = {
    P: { S: 35, D: 1, R: 0.05, reserve: 1.0, band: 0.2 },
    df(m, P = operator.P) {
      const k = P.D + 1 / P.R, lim = P.reserve * k * P.R; // mismatch at which governors hit their limit
      if (Math.abs(m) <= lim) return F0 * m / (P.S * k);
      return F0 * (m - Math.sign(m) * P.reserve) / (P.S * P.D);
    },
    load(day, t) {
      if (day === 'net') return hourly(caiso.aprDemand, t) - hourly(caiso.aprSolar, t) - hourly(caiso.aprWind, t);
      return hourly(caiso.julyDemand, t);
    },
    create(day) { const L = operator.load(day, 0); return { t: 0, G: L, target: L, day, out: 0, worst: F0, done: false }; },
    H: 1 / 120, // h (30 s of the day)
    step(s, h, ramp, auto, look = operator.H) { // auto: follow the load as fast as the ramp limit allows
      if (s.done) return;
      if (auto) s.target = operator.load(s.day, s.t + look);
      const dG = clamp(s.target - s.G, -ramp * h, ramp * h);
      s.G += dG; s.t += h;
      const f = F0 + operator.df(s.G - operator.load(s.day, s.t));
      if (Math.abs(f - F0) > operator.P.band) s.out += h;
      if (Math.abs(f - F0) > Math.abs(s.worst - F0)) s.worst = f;
      if (s.t >= 24 - 1e-9) s.done = true;
    },
    runDay(day, ramp, auto = true, look = operator.H) {
      const s = operator.create(day);
      while (!s.done) operator.step(s, operator.H, ramp, auto, look);
      return s;
    },
    maxRamp(day) { let mx = 0, at = 0; for (let t = 0; t < 24; t += 1 / 60) { const r = (operator.load(day, t + 1 / 60) - operator.load(day, t)) * 60; if (r > mx) { mx = r; at = t; } } return { rate: mx, at }; }
  };

  /* ───────── 4 · Why high voltage: I²R ─────────
   * A three-phase line delivering P (MW) at line voltage V (kV), unity power factor, resistance r (Ω/km)
   * per phase over L km: I = P/(√3·V), loss = 3·I²·R = P²·R/V², loss share = P·R/V².
   * r = 0.08 Ω/km: one 795-kcmil (Drake-class) aluminium conductor per phase (Southwire tables: 0.066 Ω/km
   * DC at 20 °C, 0.082 Ω/km AC at 75 °C). Real high-voltage lines bundle 2–4 conductors per phase. */
  const line = {
    r: 0.08,
    current: (P, V) => P * 1e6 / (SQ3 * V * 1e3),                // A
    loss: (P, V, L, r = line.r) => P * P * r * L / (V * V),       // MW  (P MW, V kV → MW·Ω/kV² = MW)
    share: (P, V, L, r = line.r) => P * r * L / (V * V),          // fraction of the delivered power
    levels: [0.4, 10, 35, 110, 220, 500, 1000]                     // kV, standard levels in China (GB/T 156)
  };

  /* ───────── 5 · Ideal transformer ─────────
   * v2 = (N2/N1)·v1 because both windings see the same changing flux (Faraday: v = N·dΦ/dt);
   * power in = power out, so i1 = (N2/N1)·i2. With direct current the flux stops changing and v2 = 0. */
  const xfmr = {
    out(V1, ratio, Pkw) { // ratio = N2/N1; V rms; P kW drawn on the secondary (resistive)
      const V2 = V1 * ratio, I2 = V2 > 0 ? Pkw * 1e3 / V2 : 0, I1 = I2 * ratio;
      return { V2, I2, I1, P1: V1 * I1 / 1e3, P2: V2 * I2 / 1e3 };
    },
    // waveforms over time t (s): AC sinusoid, or DC switched on at t = 0 (secondary only sees the switching instant)
    v1: (V1, t, dc) => dc ? V1 : V1 * Math.SQRT2 * Math.sin(2 * Math.PI * F0 * t),
    v2: (V1, ratio, t, dc) => dc ? 0 : ratio * V1 * Math.SQRT2 * Math.sin(2 * Math.PI * F0 * t)
  };

  /* ───────── 6 · Three phases ─────────
   * v_k(θ) = Vm·sin(θ − k·φ), k = 0, 1, 2. Balanced resistive load R: p(θ) = Σ v_k²/R.
   * With φ = 120°: Σ v_k = 0 and Σ sin²(θ − 2πk/3) = 3/2, so p is constant. */
  const three = {
    v: (theta, k, phi) => Math.sin(theta - k * phi),
    sum(theta, phi, n = 3) { let s = 0; for (let k = 0; k < n; k++) s += three.v(theta, k, phi); return s; },
    power(theta, phi, n = 3) { let s = 0; for (let k = 0; k < n; k++) { const v = three.v(theta, k, phi); s += v * v; } return s; }, // in units of Vm²/R
    stats(phi, n = 3) {
      let mx = -Infinity, mn = Infinity, tot = 0, smax = 0; const N = 3600;
      for (let i = 0; i < N; i++) { const th = 2 * Math.PI * i / N, p = three.power(th, phi, n); mx = Math.max(mx, p); mn = Math.min(mn, p); tot += p; smax = Math.max(smax, Math.abs(three.sum(th, phi, n))); }
      const mean = tot / N;
      return { mean, min: mn, max: mx, ripple: (mx - mn) / mean, neutral: smax };
    },
    lineRatio: phi => 2 * Math.sin(phi / 2)   // amplitude of v0 − v1 relative to one phase (√3 at 120°)
  };

  /* ───────── 7 · Merit order: a uniform-price dispatch stack (textbook market model) ─────────
   * Plants run cheapest first until demand is met; the last one needed sets the price for everyone.
   * Capacities and costs are TUNED for a toy system sized to the CAISO day; gas plant costs follow
   * cost = heat rate × gas price + variable O&M, heat rates 7 (combined cycle) and 10.5 (peaker) MMBtu/MWh. */
  const merit = {
    plants: [
      { id: 'ren', cap: null, cost: () => 0 },                // wind + solar: what the weather gives, zero fuel cost
      { id: 'nuc', cap: 3, cost: () => 12 },
      { id: 'coal', cap: 9, cost: () => 35 },
      { id: 'ccgt', cap: 14, cost: g => 7 * g + 3 },
      { id: 'peak', cap: 8, cost: g => 10.5 * g + 5 },
      { id: 'oil', cap: 4, cost: () => 250 }
    ],
    // stack for a given renewable output (GW) and gas price ($/MMBtu), sorted by cost (stable for ties)
    stack(ren, g) {
      return merit.plants.map((p, i) => ({ id: p.id, cap: p.cap == null ? ren : p.cap, cost: p.cost(g), i }))
        .sort((a, b) => a.cost - b.cost || a.i - b.i);
    },
    // nuclear is must-run (it cannot follow a midday dip; TUNED): it runs first, then the rest by cost.
    dispatch(demand, ren, g) {
      const st = merit.stack(ren, g), run = {};
      const must = st.find(u => u.id === 'nuc'), base = Math.min(must.cap, demand);
      let left = demand - base, price = 0, marginal = null;
      for (const u of st) {
        if (u.id === 'nuc') { run.nuc = base; if (base > 1e-9 && u.cost > price) { price = u.cost; marginal = 'nuc'; } continue; }
        const take = Math.max(0, Math.min(u.cap, left)); run[u.id] = take;
        if (take > 1e-9 && u.cost >= price) { price = u.cost; marginal = u.id; }
        left -= take;
      }
      if (run.ren < ren - 1e-9) { price = 0; marginal = 'ren'; } // weather output had to be curtailed: the last MWh is free
      return { price, marginal, run, unserved: Math.max(0, left), curtailed: Math.max(0, ren - run.ren), stack: st };
    },
    day(g, scaleSolar = 1, month = 'july') {
      const D = month === 'july' ? caiso.julyDemand : caiso.aprDemand, S = month === 'july' ? caiso.julySolar : caiso.aprSolar, W = month === 'july' ? caiso.julyWind : caiso.aprWind;
      return D.map((d, h) => merit.dispatch(d, S[h] * scaleSolar + W[h], g));
    }
  };

  /* ───────── 8 · Net load (the "duck curve") ─────────
   * net = demand − solar×k − wind (hourly CAISO, 14 April 2024). Ramp = largest rise over 3 hours.
   * Below a must-run floor (TUNED: 3 GW, the nuclear block in the merit stack) extra output is curtailed. */
  const duck = {
    floor: 3,
    net(k, wind = true) { return caiso.aprDemand.map((d, h) => d - caiso.aprSolar[h] * k - (wind ? caiso.aprWind[h] : 0)); },
    stats(net, floor = duck.floor) {
      let mn = Infinity, tmn = 0, mx = -Infinity, tmx = 0, ramp = 0, tr = 0, curt = 0;
      net.forEach((v, h) => { if (v < mn) { mn = v; tmn = h; } if (v > mx) { mx = v; tmx = h; } curt += Math.max(0, floor - v); });
      for (let h = 0; h + 3 < 24; h++) { const r = net[h + 3] - net[h]; if (r > ramp) { ramp = r; tr = h; } }
      return { min: mn, tMin: tmn, max: mx, tMax: tmx, ramp3: ramp, tRamp: tr, curtail: curt };
    }
  };

  /* ───────── 9 · Storage: shift energy from noon to evening ─────────
   * Peak shaving / valley filling with one daily cycle, the day assumed to repeat. Charging is allowed
   * 08:00–16:00 (the sunny hours), discharging 16:00–08:00 the next morning. Discharge shaves the evening above a level T (at most Pmax per hour); the energy needed
   * is E_out = Σ min(Pmax, max(0, net − T)); charging fills the lowest hours up to a level V with
   * E_in = E_out/η, first from curtailed surplus (below the floor) and never more than Emax stored.
   * T is the lowest level the battery can afford (bisection). η = round-trip efficiency. */
  const storage = {
    plan(net, Pmax, Emax, eta, floor = duck.floor) {
      const chg = h => h >= 8 && h < 16, dis = h => !chg(h);
      const outAt = T => net.map((v, h) => dis(h) ? Math.min(Pmax, Math.max(0, v - T)) : 0);
      const sum = a => a.reduce((x, y) => x + y, 0);
      // energy that can be charged if filling up to level V
      const inAt = V => net.map((v, h) => chg(h) ? Math.min(Pmax, Math.max(0, V - v)) : 0);
      const maxV = Math.max(...net); // charging above the evening peak would make no sense
      const cost = T => sum(outAt(T)) / eta;   // energy to put in
      const feasible = T => { const need = cost(T); return sum(outAt(T)) <= Emax + 1e-9 && sum(inAt(T)) >= need - 1e-9; };
      let lo = Math.min(...net), hi = Math.max(...net.filter((_, h) => dis(h)));
      if (Pmax <= 0 || Emax <= 0) hi = lo = Math.max(...net.filter((_, h) => dis(h)));
      for (let i = 0; i < 60 && hi - lo > 1e-6; i++) { const T = (lo + hi) / 2; if (feasible(T)) hi = T; else lo = T; }
      const T = hi, out = outAt(T), need = cost(T);
      // valley level V so that charged energy = need
      let a = Math.min(...net), b = maxV;
      for (let i = 0; i < 60 && b - a > 1e-6; i++) { const V = (a + b) / 2; if (sum(inAt(V)) >= need) b = V; else a = V; }
      const inn = need > 0 ? inAt(b) : net.map(() => 0);
      const after = net.map((v, h) => v + inn[h] - out[h]);
      let soc = 0, socMax = 0; const socs = new Array(24).fill(0);
      for (let k = 0; k < 24; k++) { const h = (k + 8) % 24; soc += inn[h] * eta - out[h]; socMax = Math.max(socMax, soc); socs[h] = soc; } // cycle starts empty at 08:00
      const curtBefore = sum(net.map(v => Math.max(0, floor - v))), curtAfter = sum(after.map(v => Math.max(0, floor - v)));
      return { T, V: b, out, inn, after, Ein: sum(inn), Eout: sum(out), lost: sum(inn) - sum(out), socs, socMax, curtBefore, curtAfter };
    }
  };

  /* ───────── 10 · A small grid that can cascade ─────────
   * Six buses, DC power flow (flows ∝ angle differences, B·θ = P, the standard linearised approximation),
   * each island with its own frequency from the swing equation of ch1–2 (governors with headroom),
   * stepwise under-frequency load shedding (5 % of the island's original load per stage, from 48.8 Hz,
   * stage 1 as in GB; later stages TUNED), generator under-frequency protection at 47.5 Hz (TUNED),
   * and line overload protection that opens a line after `tripAfter` s above its limit (TUNED: real
   * thermal protection is slower; the page says so). Base 100 MW, line reactances in pu. */
  const net6 = {
    buses: [
      { id: 'A', gen: { p: 300, cap: 350, H: 6 } },
      { id: 'B', gen: { p: 850, cap: 1100, H: 6 } },
      { id: 'C', gen: { p: 650, cap: 900, H: 6 } },
      { id: 'X', load: 700 },
      { id: 'Y', load: 650 },
      { id: 'Z', load: 450 }
    ],
    // limits: the largest flow after any single outage at 1.05 × base load, rounded up (TUNED so that the
    // base case is "N−1 secure": any one element can fail at normal load without overloading another)
    lines: [ // from, to, reactance (pu), limit (MW)
      { a: 0, b: 3, x: 0.10, lim: 530 },
      { a: 0, b: 5, x: 0.12, lim: 480 },
      { a: 1, b: 3, x: 0.12, lim: 900 },
      { a: 1, b: 4, x: 0.10, lim: 900 },
      { a: 2, b: 4, x: 0.12, lim: 690 },
      { a: 2, b: 5, x: 0.10, lim: 690 },
      { a: 3, b: 4, x: 0.15, lim: 410 }
    ],
    P: { D: 1, R: 0.05, Tg: 6, uf: [48.8, 48.6, 48.4, 48.2, 48.0], shedStep: 0.05, genTrip: 47.5, tripAfter: 4, H: 0.01 },
    create(loadScale = 1, ufls = true) {
      const B = net6.buses, total = B.reduce((s, b) => s + (b.load || 0), 0) * loadScale;
      const capSum = B.reduce((s, b) => s + (b.gen ? b.gen.p : 0), 0);
      const st = {
        t: 0, loadScale, ufls,
        load: B.map(b => (b.load || 0) * loadScale), load0: B.map(b => (b.load || 0) * loadScale),
        gen: B.map(b => b.gen ? { on: true, p0: Math.min(b.gen.cap, b.gen.p * total / capSum), pm: 0, cap: b.gen.cap, H: b.gen.H } : null),
        lineOn: net6.lines.map(() => true), over: net6.lines.map(() => 0), flow: net6.lines.map(() => 0),
        w: B.map(() => 0), stages: B.map(() => 0), dead: B.map(() => false), events: [], shed: 0, lost: 0
      };
      st.gen.forEach(g => { if (g) g.pm = g.p0; });
      net6.solve(st);
      return st;
    },
    islands(st) {
      const n = net6.buses.length, par = [...Array(n).keys()], f = i => par[i] === i ? i : (par[i] = f(par[i]));
      net6.lines.forEach((l, i) => { if (st.lineOn[i]) par[f(l.a)] = f(l.b); });
      const groups = {}; for (let i = 0; i < n; i++) (groups[f(i)] = groups[f(i)] || []).push(i);
      return Object.values(groups);
    },
    // DC power flow in each island; generator injections share the island's mismatch by inertia
    solve(st) {
      const n = net6.buses.length;
      st.flow = net6.lines.map(() => 0);
      for (const isl of net6.islands(st)) {
        const inj = new Array(n).fill(0);
        let gen = 0, load = 0, Hs = 0;
        for (const i of isl) { const g = st.gen[i]; if (g && g.on) { gen += g.pm; Hs += g.H * g.cap; } if (!st.dead[i]) load += st.load[i]; }
        for (const i of isl) {
          const g = st.gen[i];
          inj[i] = (st.dead[i] ? 0 : -st.load[i]) + (g && g.on ? g.pm + (Hs > 0 ? (load - gen) * g.H * g.cap / Hs : 0) : 0);
        }
        if (isl.length < 2) continue;
        // B matrix on the island, reference = first bus
        const idx = isl.slice(1), m = idx.length, pos = {}; idx.forEach((b, k) => pos[b] = k);
        const A = Array.from({ length: m }, () => new Array(m + 1).fill(0));
        net6.lines.forEach((l, li) => {
          if (!st.lineOn[li] || !isl.includes(l.a)) return;
          const y = 1 / l.x, pa = pos[l.a], pb = pos[l.b];
          if (pa != null) A[pa][pa] += y; if (pb != null) A[pb][pb] += y;
          if (pa != null && pb != null) { A[pa][pb] -= y; A[pb][pa] -= y; }
        });
        idx.forEach((b, k) => { A[k][m] = inj[b] / 100; });
        for (let c = 0; c < m; c++) { // Gaussian elimination with partial pivoting
          let pr = c; for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[pr][c])) pr = r;
          [A[c], A[pr]] = [A[pr], A[c]];
          for (let r = 0; r < m; r++) if (r !== c) { const k = A[r][c] / A[c][c]; for (let q = c; q <= m; q++) A[r][q] -= k * A[c][q]; }
        }
        const th = new Array(n).fill(0); idx.forEach((b, k) => { th[b] = A[k][m] / A[k][k]; });
        net6.lines.forEach((l, li) => { if (st.lineOn[li] && isl.includes(l.a)) st.flow[li] = 100 * (th[l.a] - th[l.b]) / l.x; });
      }
    },
    tripGen(st, i) { if (st.gen[i] && st.gen[i].on) { st.gen[i].on = false; st.events.push({ t: st.t, k: 'gen', i }); } },
    tripLine(st, li) { if (st.lineOn[li]) { st.lineOn[li] = false; st.events.push({ t: st.t, k: 'line', i: li }); } },
    step(st, h) {
      const P = net6.P;
      for (const isl of net6.islands(st)) {
        let Hs = 0, gen = 0, load = 0, load0 = 0, cap = 0;
        const gens = isl.filter(i => st.gen[i] && st.gen[i].on), loads = isl.filter(i => !st.dead[i] && st.load0[i] > 0);
        for (const i of gens) { const g = st.gen[i]; Hs += g.H * g.cap; gen += g.pm; cap += g.cap; }
        for (const i of loads) { load += st.load[i]; load0 += st.load0[i]; }
        if (!gens.length) { // nothing left to feed this island: its loads go dark
          for (const i of loads) { st.dead[i] = true; st.lost += st.load[i]; st.events.push({ t: st.t, k: 'dark', i }); }
          for (const i of isl) st.w[i] = 0;
          continue;
        }
        const w = st.w[isl[0]], S = cap;
        // swing equation on the island (base = online capacity)
        const dw = ((gen - load * (1 + P.D * w)) / S) / (2 * Hs / S);
        const nw = w + h * dw;
        for (const i of isl) st.w[i] = nw;
        for (const i of gens) { const g = st.gen[i]; const target = clamp(g.p0 - nw / P.R * g.cap, 0, g.cap); g.pm += h * (target - g.pm) / P.Tg; }
        const f = F0 * (1 + nw);
        // under-frequency load shedding, stage by stage, 5 % of the island's original load each
        if (st.ufls) for (const i of loads) {
          while (st.stages[i] < P.uf.length && f < P.uf[st.stages[i]]) {
            const cut = P.shedStep * st.load0[i]; st.load[i] = Math.max(0, st.load[i] - cut); st.shed += cut; st.stages[i]++;
            st.events.push({ t: st.t, k: 'shed', i, stage: st.stages[i] });
          }
        }
        if (f < P.genTrip) for (const i of gens) net6.tripGen(st, i);
        if (!load && gens.length) { for (const i of gens) { st.gen[i].p0 = 0; } }
      }
      net6.solve(st);
      net6.lines.forEach((l, li) => {
        if (!st.lineOn[li]) return;
        if (Math.abs(st.flow[li]) > l.lim) { st.over[li] += h; if (st.over[li] >= P.tripAfter) net6.tripLine(st, li); }
        else st.over[li] = 0;
      });
      st.t += h;
    },
    freq: (st, i) => F0 * (1 + st.w[i]),
    served(st) { return st.load.reduce((s, v, i) => s + (st.dead[i] ? 0 : v), 0); },
    run(loadScale, action, until = 40, ufls = true) {
      const st = net6.create(loadScale, ufls); let minF = F0;
      const doIt = () => { if (action === 'genA') net6.tripGen(st, 0); else if (typeof action === 'number') net6.tripLine(st, action); };
      doIt();
      while (st.t < until - 1e-9) { net6.step(st, net6.P.H); for (let i = 0; i < 6; i++) if (!st.dead[i] && st.load0[i] > 0) minF = Math.min(minF, net6.freq(st, i)); }
      return { st, minF, served: net6.served(st), total: st.load0.reduce((a, b) => a + b, 0), linesOut: st.lineOn.filter(x => !x).length };
    }
  };

  return { F0, clamp, advance, swing, caiso, hourly, operator, line, xfmr, three, merit, duck, storage, net6 };
}));
