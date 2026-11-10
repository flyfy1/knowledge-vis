'use strict';
// Neuroscience basics (Claude Code edition) — model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every voltage, threshold and rate shown on the page is computed here; tests/core.cjs pins the claims.
// Steps 0–1: textbook mammalian ion concentrations at 37 °C (Nernst, Goldman–Hodgkin–Katz).
// Steps 2–5: the classic Hodgkin–Huxley squid-axon model (1952 parameters, 6.3 °C, rest ≈ −65 mV),
// integrated with fixed-step RK4. Units: mV, ms, µA/cm², mS/cm², µF/cm².
(function (root) {
  /* ---------- steps 0–1: ions and the resting potential ---------- */
  const RT_F = 8.314462618 * 310.15 / 96485.33212 * 1000; // mV at 37 °C (≈ 26.7)
  const SLOPE10 = RT_F * Math.LN10;                        // mV per tenfold ratio (≈ 61.5)
  const ION = {
    K: { in: 140, out: 5, z: 1 },
    Na: { in: 12, out: 145, z: 1 },
  };
  function nernst(out, inside, z = 1) { return RT_F / z * Math.log(out / inside); }
  // GHK voltage equation with K⁺ and Na⁺ only; p = P_Na / P_K.
  function ghk(p, Ko = ION.K.out, Ki = ION.K.in, Nao = ION.Na.out, Nai = ION.Na.in) {
    return RT_F * Math.log((Ko + p * Nao) / (Ki + p * Nai));
  }
  const P_REST = 0.04; // a typical neuronal P_Na/P_K at rest

  /* ---------- steps 2–5: Hodgkin–Huxley ---------- */
  const HH = { C: 1, gNa: 120, gK: 36, gL: 0.3, ENa: 50, EK: -77, EL: -54.387 };
  // Rate functions (1/ms); the removable singularities are filled with their limits.
  const xexp = (x, k) => (Math.abs(x) < 1e-7 ? k : x / (1 - Math.exp(-x / k)));
  const an = V => 0.01 * xexp(V + 55, 10), bn = V => 0.125 * Math.exp(-(V + 65) / 80);
  const am = V => 0.1 * xexp(V + 40, 10), bm = V => 4 * Math.exp(-(V + 65) / 18);
  const ah = V => 0.07 * Math.exp(-(V + 65) / 20), bh = V => 1 / (1 + Math.exp(-(V + 35) / 10));
  const inf = (a, b) => V => a(V) / (a(V) + b(V));
  const mInf = inf(am, bm), hInf = inf(ah, bh), nInf = inf(an, bn);

  function currents(V, m, h, n) {
    return { Na: HH.gNa * m * m * m * h * (V - HH.ENa), K: HH.gK * n * n * n * n * (V - HH.EK), L: HH.gL * (V - HH.EL) };
  }
  function deriv(s, I) {
    const [V, m, h, n] = s, c = currents(V, m, h, n);
    return [(I - c.Na - c.K - c.L) / HH.C, am(V) * (1 - m) - bm(V) * m, ah(V) * (1 - h) - bh(V) * h, an(V) * (1 - n) - bn(V) * n];
  }
  function rk4(s, I0, Ih, I1, dt) {
    const k1 = deriv(s, I0);
    const k2 = deriv(s.map((v, i) => v + dt / 2 * k1[i]), Ih);
    const k3 = deriv(s.map((v, i) => v + dt / 2 * k2[i]), Ih);
    const k4 = deriv(s.map((v, i) => v + dt * k3[i]), I1);
    return s.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }

  const DT = 0.01;
  const SPIKE_LEVEL = -20; // a spike = an upward crossing of −20 mV (sub-threshold bumps stay far below)
  // simulate(I, T): I is a function of t (ms) → µA/cm². Returns samples every `every` ms and spike times
  // (upward crossings of SPIKE_LEVEL, linearly interpolated).
  function simulate(I, T, { dt = DT, every = 0.05, start = null } = {}) {
    let s = start ? start.slice() : REST.slice();
    const out = { t: [0], V: [s[0]], m: [s[1]], h: [s[2]], n: [s[3]], spikes: [], peak: s[0] };
    const N = Math.round(T / dt), stride = Math.max(1, Math.round(every / dt));
    for (let i = 1; i <= N; i++) {
      const t0 = (i - 1) * dt, prev = s[0];
      s = rk4(s, I(t0), I(t0 + dt / 2), I(t0 + dt), dt);
      if (prev < SPIKE_LEVEL && s[0] >= SPIKE_LEVEL) out.spikes.push(t0 + dt * (SPIKE_LEVEL - prev) / (s[0] - prev));
      if (s[0] > out.peak) out.peak = s[0];
      if (i % stride === 0) { out.t.push(i * dt); out.V.push(s[0]); out.m.push(s[1]); out.h.push(s[2]); out.n.push(s[3]); }
    }
    out.end = s;
    return out;
  }
  // Steady state with no input: start from the gate steady states at −65 mV and settle for 200 ms.
  let REST = [-65, mInf(-65), hInf(-65), nInf(-65)];
  (function settle() { let s = REST; for (let i = 0; i < 20000; i++) s = rk4(s, 0, 0, 0, DT); REST = s; })();

  // A train of rectangular current pulses: [{ t0, dur, amp }].
  const pulses = list => t => { let I = 0; for (const p of list) if (t >= p.t0 && t < p.t0 + p.dur) I += p.amp; return I; };
  const T0 = 5, PULSE = 1; // first pulse at 5 ms, every pulse lasts 1 ms

  // Smallest amplitude of one 1-ms pulse that produces a spike (bisection to 1e-4 µA/cm²).
  function bisect(fires, lo, hi, tol = 1e-4) {
    if (!fires(hi)) return Infinity;
    while (hi - lo > tol) { const mid = (lo + hi) / 2; if (fires(mid)) hi = mid; else lo = mid; }
    return hi;
  }
  const single = (amp, T = 30) => simulate(pulses([{ t0: T0, dur: PULSE, amp }]), T);
  const THRESHOLD = bisect(a => single(a).spikes.length > 0, 0, 40);

  /* step 2: two sub-threshold inputs, each a fraction of THRESHOLD, onsets Δt apart */
  function pair(frac, gap, T = 40) {
    const amp = frac * THRESHOLD;
    return simulate(pulses([{ t0: T0, dur: PULSE, amp }, { t0: T0 + gap, dur: PULSE, amp }]), T);
  }
  // Longest onset gap (to 0.01 ms) at which two inputs of this size still fire; −1 if they never do.
  function maxGap(frac, limit = 30) {
    if (pair(frac, 0).spikes.length === 0) return -1;
    let lo = 0, hi = limit;
    if (pair(frac, hi).spikes.length > 0) return limit;
    while (hi - lo > 0.01) { const mid = (lo + hi) / 2; if (pair(frac, mid).spikes.length > 0) lo = mid; else hi = mid; }
    return lo;
  }

  /* step 3: peak voltage against stimulus strength */
  const peakOf = amp => single(amp).peak;

  /* step 4: refractoriness — a conditioning spike (2 × THRESHOLD at T0), then a test pulse Δt later */
  const COND = 2, CAP = 10; // test pulses up to 10 × THRESHOLD are tried
  function paired(gap, mult, T = 40) {
    const r = simulate(pulses([{ t0: T0, dur: PULSE, amp: COND * THRESHOLD }, { t0: T0 + gap, dur: PULSE, amp: mult * THRESHOLD }]), T);
    const second = r.spikes.filter(s => s > T0 + gap);
    let peak2 = -Infinity;
    r.t.forEach((t, i) => { if (t >= T0 + gap && r.V[i] > peak2) peak2 = r.V[i]; });
    return { run: r, fires: second.length > 0, peak2 };
  }
  // Test-pulse threshold (in multiples of THRESHOLD) at onset gap Δt; Infinity if even CAP × fails.
  function secondThreshold(gap) { return bisect(m => paired(gap, m).fires, 0, CAP, 1e-3); }
  // Absolute refractory period (within the CAP): the shortest gap at which some test pulse ≤ CAP fires.
  function absoluteRefractory() {
    let lo = 0.5, hi = 10;
    while (hi - lo > 0.01) { const mid = (lo + hi) / 2; if (isFinite(secondThreshold(mid))) hi = mid; else lo = mid; }
    return hi;
  }
  // Relative refractory period ends where the test threshold is back within 5 % of THRESHOLD.
  function relativeRefractory() {
    let lo = absoluteRefractory(), hi = 40;
    while (hi - lo > 0.05) { const mid = (lo + hi) / 2; if (secondThreshold(mid) <= 1.05) hi = mid; else lo = mid; }
    return hi;
  }

  /* step 5: constant current → firing rate (steady state, counted between 100 and 400 ms) */
  function rate(I, { T = 400, from = 100, dt = 0.02 } = {}) {
    const r = simulate(() => I, T, { dt, every: 0.25 });
    const late = r.spikes.filter(s => s >= from);
    let hi = -Infinity, lo = Infinity;
    r.t.forEach((t, i) => { if (t >= from) { hi = Math.max(hi, r.V[i]); lo = Math.min(lo, r.V[i]); } });
    const base = { run: r, count: late.length, early: r.spikes.length - late.length, hi, lo, swing: hi - lo };
    if (late.length < 2) return Object.assign(base, { hz: 0 });
    const isi = (late[late.length - 1] - late[0]) / (late.length - 1);
    return Object.assign(base, { hz: 1000 / isi, isi });
  }

  const api = { SPIKE_LEVEL, DT, RT_F, SLOPE10, ION, nernst, ghk, P_REST, HH, mInf, hInf, nInf, currents, simulate, pulses, get REST() { return REST.slice(); },
    T0, PULSE, THRESHOLD, single, pair, maxGap, peakOf, COND, CAP, paired, secondThreshold, absoluteRefractory, relativeRefractory, rate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NEURO_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
