'use strict';
// Feedback-control lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A small drone holding altitude: m·z'' = u − m·g − c·z' (+ optional extra downward force),
// thrust u limited to [0, U_MAX] (rotors cannot pull down), ground at z = 0.
// Every trace and every number on the page comes from simulate(); tests/core.cjs pins the claims.
(function (root) {
  const PLANT = { m: 1, g: 9.8, c: 1, uMin: 0, uMax: 30 };
  const DT = 0.01, T_END = 10;
  const BAND = 0.05; // settling band: ±5 % of the setpoint step

  // Seeded PRNG (mulberry32) + Box–Muller, so the simulated sensor noise is the same on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gaussian(n, sigma, seed) {
    const r = rng(seed), out = [];
    while (out.length < n) {
      const u = Math.max(r(), 1e-12), v = r(), mm = Math.sqrt(-2 * Math.log(u));
      out.push(sigma * mm * Math.cos(2 * Math.PI * v)); if (out.length < n) out.push(sigma * mm * Math.sin(2 * Math.PI * v));
    }
    return out;
  }

  /**
   * opts: kp, ki, kd, r (setpoint, m), m (true mass, kg), antiWindup (bool), noise (σ in m),
   *       seed, push (extra downward force in N) with pushFrom (s), openLoop (array of thrust to replay),
   *       T (s)
   * Controller (runs every DT on the *measured* altitude ym = z + noise):
   *   e = r − ym,  P = kp·e,  I = ki·∫e dt,  D = −kd·dym/dt (rate of the measurement, so a setpoint jump
   *   does not produce a spike; while r is constant this equals kd·de/dt), u = clamp(P + I + D).
   *   antiWindup: the integral is frozen while u is clamped and the error would push it further out.
   */
  function simulate(o) {
    const P = PLANT, m = o.m || P.m, T = o.T || T_END, n = Math.round(T / DT) + 1;
    const kp = o.kp || 0, ki = o.ki || 0, kd = o.kd || 0, r = o.r === undefined ? 5 : o.r;
    const noise = o.noise ? gaussian(n, o.noise, o.seed || 1) : null;
    const out = { t: new Float64Array(n), z: new Float64Array(n), ym: new Float64Array(n), e: new Float64Array(n), u: new Float64Array(n),
      uP: new Float64Array(n), uI: new Float64Array(n), uD: new Float64Array(n), integ: new Float64Array(n), sat: new Uint8Array(n), r, m };
    let z = 0, v = 0, integ = 0, prevYm = null;
    for (let k = 0; k < n; k++) {
      const t = k * DT, ym = z + (noise ? noise[k] : 0), e = r - ym;
      let u, uP = 0, uI = 0, uD = 0, raw;
      if (o.openLoop) { raw = o.openLoop[Math.min(k, o.openLoop.length - 1)]; }
      else {
        const rate = prevYm === null ? 0 : (ym - prevYm) / DT;
        uP = kp * e; uD = -kd * rate;
        // tentative integral update; frozen by anti-windup if it would deepen saturation
        const integNext = integ + e * DT;
        const rawNext = uP + ki * integNext + uD;
        const pushingOut = (rawNext > P.uMax && e > 0) || (rawNext < P.uMin && e < 0);
        if (!(o.antiWindup && pushingOut)) integ = integNext;
        uI = ki * integ; raw = uP + uI + uD;
      }
      u = Math.min(P.uMax, Math.max(P.uMin, raw));
      out.t[k] = t; out.z[k] = z; out.ym[k] = ym; out.e[k] = r - z; out.u[k] = u; out.uP[k] = uP; out.uI[k] = uI; out.uD[k] = uD; out.integ[k] = integ;
      out.sat[k] = raw > P.uMax + 1e-9 || raw < P.uMin - 1e-9 ? 1 : 0;
      prevYm = ym;
      // plant, semi-implicit Euler
      const push = o.push && t >= (o.pushFrom || 0) ? o.push : 0;
      const a = (u - m * P.g - P.c * v - push) / m;
      v += a * DT; z += v * DT;
      if (z <= 0) { z = 0; if (v < 0) v = 0; } // ground
    }
    return out;
  }

  // Metrics on the true altitude z (not the noisy measurement).
  function metrics(s) {
    const r = s.r, n = s.z.length;
    let peak = -Infinity, peakT = 0;
    for (let k = 0; k < n; k++) if (s.z[k] > peak) { peak = s.z[k]; peakT = s.t[k]; }
    const overshoot = Math.max(0, (peak - r) / r * 100);
    let last = -1;
    for (let k = 0; k < n; k++) if (Math.abs(s.z[k] - r) > BAND * r) last = k;
    const settle = last === n - 1 ? Infinity : (last < 0 ? 0 : s.t[last + 1]);
    const tail = Math.round(1 / DT); let sum = 0;
    for (let k = n - tail; k < n; k++) sum += s.z[k];
    const finalZ = sum / tail;
    let uMax = 0, satT = 0;
    for (let k = 0; k < n; k++) { uMax = Math.max(uMax, s.u[k]); if (s.sat[k]) satT += DT; }
    return { peak, peakT, overshoot, settle, finalZ, sag: r - finalZ, uMax, satT };
  }

  // Standard deviation of the thrust over the last 4 s (what sensor noise does to the motors).
  function thrustJitter(s) {
    const n = s.u.length, from = n - Math.round(4 / DT);
    let mean = 0; for (let k = from; k < n; k++) mean += s.u[k]; mean /= n - from;
    let v = 0; for (let k = from; k < n; k++) v += (s.u[k] - mean) ** 2;
    return Math.sqrt(v / (n - from));
  }

  // Count how many times the altitude error changes sign after first reaching the setpoint (wobble count).
  function crossings(s) {
    let c = 0, prev = 0;
    for (let k = 0; k < s.z.length; k++) { const sg = Math.sign(s.r - s.z[k]); if (sg !== 0 && prev !== 0 && sg !== prev) c++; if (sg !== 0) prev = sg; }
    return c;
  }

  // Step 5 tuning targets (with σ = 5 mm altimeter noise, seed 3).
  const SPEC = { overshoot: 5, settle: 3, sag: 0.05, jitter: 3 };
  function meetsSpec(mt, jitter) { return { os: mt.overshoot <= SPEC.overshoot, st: mt.settle <= SPEC.settle, ss: Math.abs(mt.sag) <= SPEC.sag, j: jitter <= SPEC.jitter }; }

  // Presets used on the page (one place, so the tests check exactly what the page uses).
  const PRESETS = {
    step0: { kp: 14, ki: 6, kd: 6, r: 5 },
    step2: { kp: 20, r: 5 },
    step3: { kp: 20, kd: 6, r: 5 },
    step4: { kp: 14, ki: 8, kd: 6 },
    gentle: { kp: 8, ki: 1, kd: 5 },
    aggressive: { kp: 40, ki: 30, kd: 3 },
  };

  const api = { PLANT, DT, T_END, BAND, SPEC, PRESETS, simulate, metrics, thrustJitter, crossings, meetsSpec, gaussian };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PID_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
