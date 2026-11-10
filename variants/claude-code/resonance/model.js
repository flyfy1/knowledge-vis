'use strict';
// Resonance lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// One block on a spring with a damping force −b·v and a push F₀·cos(Ωt): m·a = −k·x − b·v + F₀·cos(Ωt).
// The "measured" numbers on the page come from the RK4 simulation below; the "formula" numbers come
// from the closed forms. tests/core.cjs checks that the two agree and pins every claim in the text.
// Units: kg, N/m, N·s/m, N, s, m (the page shows displacements in cm).
(function (root) {
  const SYS = { m: 1, k: 40 };       // steps 1–4: f₀ ≈ 1.007 Hz
  const F0 = 1;                       // N, the push in steps 2–4
  const X0 = 0.1;                     // m, release displacement in steps 0–1
  const B_LIST = [0, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 2 * Math.sqrt(SYS.m * SYS.k), 20]; // step 1 slider values
  const B_DRIVE = 0.4;                // step 2 and 4
  const B_CURVES = [0.2, 0.4, 0.8, 1.6]; // step 3 choices

  const omega0 = (m, k) => Math.sqrt(k / m);
  const period0 = (m, k) => 2 * Math.PI * Math.sqrt(m / k);
  const bCritical = (m, k) => 2 * Math.sqrt(m * k);

  // RK4 for x'' = (−k x − b v + F₀ cos Ωt)/m. Returns samples every `every` steps.
  function simulate({ m, k, b = 0, F = 0, Omega = 0, x0 = 0, v0 = 0, T, dt = 0.002, every = 5 }) {
    const acc = (t, x, v) => (-k * x - b * v + F * Math.cos(Omega * t)) / m;
    const n = Math.round(T / dt), ts = [0], xs = [x0], vs = [v0];
    let x = x0, v = v0;
    for (let i = 0; i < n; i++) {
      const t = i * dt;
      const k1x = v, k1v = acc(t, x, v);
      const k2x = v + 0.5 * dt * k1v, k2v = acc(t + 0.5 * dt, x + 0.5 * dt * k1x, v + 0.5 * dt * k1v);
      const k3x = v + 0.5 * dt * k2v, k3v = acc(t + 0.5 * dt, x + 0.5 * dt * k2x, v + 0.5 * dt * k2v);
      const k4x = v + dt * k3v, k4v = acc(t + dt, x + dt * k3x, v + dt * k3v);
      x += dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); v += dt / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
      if ((i + 1) % every === 0) { ts.push((i + 1) * dt); xs.push(x); vs.push(v); }
    }
    return { t: ts, x: xs, v: vs };
  }

  // Upward zero crossings (linear interpolation) → mean spacing = measured period.
  function measuredPeriod(sim) {
    const c = [];
    for (let i = 1; i < sim.x.length; i++) if (sim.x[i - 1] < 0 && sim.x[i] >= 0) c.push(sim.t[i - 1] + (0 - sim.x[i - 1]) / (sim.x[i] - sim.x[i - 1]) * (sim.t[i] - sim.t[i - 1]));
    if (c.length < 2) return null;
    return (c[c.length - 1] - c[0]) / (c.length - 1);
  }
  // Positive peaks (parabolic interpolation through the three samples around each local maximum).
  function peaks(sim) {
    const out = [];
    for (let i = 1; i < sim.x.length - 1; i++) {
      const a = sim.x[i - 1], b = sim.x[i], c = sim.x[i + 1];
      if (b > a && b >= c && b > 0) { const den = a - 2 * b + c, d = den ? 0.5 * (a - c) / den : 0; out.push({ t: sim.t[i] + d * (sim.t[i + 1] - sim.t[i]), x: b - 0.25 * (a - c) * d }); }
    }
    return out;
  }

  /* ---------- step 0: free swing ---------- */
  function free(m, k, T = 8) {
    const sim = simulate({ m, k, x0: X0, T });
    return { sim, Tm: measuredPeriod(sim), Tf: period0(m, k) };
  }

  /* ---------- step 1: damping ---------- */
  function damped(b, T = 10) {
    const { m, k } = SYS, sim = simulate({ m, k, b, x0: X0, T }), pk = peaks(sim);
    const under = b < bCritical(m, k) - 1e-9;
    const wd = under ? Math.sqrt(k / m - (b / (2 * m)) ** 2) : 0;
    const ratioF = under ? Math.exp(-b / (2 * m) * 2 * Math.PI / wd) : null;     // amplitude kept per swing
    const ratioM = pk.length >= 2 ? pk[1].x / pk[0].x : null;
    const tHalf = b > 0 ? 2 * m * Math.log(2) / b : Infinity;
    // Crossings of zero after release: an underdamped block swings through; critical/overdamped never does.
    let crossings = 0; for (let i = 1; i < sim.x.length; i++) if ((sim.x[i - 1] > 0) !== (sim.x[i] > 0)) crossings++;
    return { b, sim, under, ratioF, ratioM, tHalf, crossings, envelope: t => X0 * Math.exp(-b / (2 * m) * t) };
  }

  /* ---------- steps 2–4: driven ---------- */
  // Steady-state amplitude and phase lag (closed form).
  function steady(m, k, b, Omega, F = F0) {
    const re = k - m * Omega * Omega, im = b * Omega;
    return { A: F / Math.hypot(re, im), phi: Math.atan2(im, re) };
  }
  // Simulate from rest; measure the steady amplitude as max |x| over the last three drive periods.
  function driven(r, b = B_DRIVE, T) {
    const { m, k } = SYS, Omega = r * omega0(m, k), tau = 2 * m / b;
    const Tend = T || Math.max(40, 10 * tau + 6 * 2 * Math.PI / Omega);
    const sim = simulate({ m, k, b, F: F0, Omega, T: Tend, dt: 0.002, every: 5 });
    const tStart = Tend - 3 * 2 * Math.PI / Omega;
    let Am = 0; for (let i = 0; i < sim.t.length; i++) if (sim.t[i] >= tStart) Am = Math.max(Am, Math.abs(sim.x[i]));
    return { r, b, Omega, sim, Am, ...steady(m, k, b, Omega), Tend };
  }
  const staticX = () => F0 / SYS.k;
  const Q = b => SYS.m * omega0(SYS.m, SYS.k) / b;
  // Peak of the amplitude curve: Ω_r = √(ω₀² − b²/2m²) (exists while b² < 2mk).
  function peak(b) {
    const { m, k } = SYS, w0 = omega0(m, k), wr2 = w0 * w0 - b * b / (2 * m * m);
    const Omega = Math.sqrt(Math.max(0, wr2));
    return { r: Omega / w0, A: steady(m, k, b, Omega).A };
  }
  // Width of the peak: distance in r between the two points where A falls to peak/√2 (bisection on the closed form).
  function width(b) {
    const { m, k } = SYS, w0 = omega0(m, k), pk = peak(b), target = pk.A / Math.SQRT2;
    const A = r => steady(m, k, b, r * w0).A;
    const solve = (lo, hi) => { for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if ((A(lo) - target) * (A(mid) - target) <= 0) hi = mid; else lo = mid; } return (lo + hi) / 2; };
    const r1 = solve(0.01, pk.r), r2 = solve(pk.r, 3);
    return { r1, r2, dr: r2 - r1 };
  }

  /* ---------- step 4: work done by the push over one steady cycle ---------- */
  function cycleWork(r, b = B_DRIVE, n = 2000) {
    const { m, k } = SYS, Omega = r * omega0(m, k), { A, phi } = steady(m, k, b, Omega), Tp = 2 * Math.PI / Omega;
    let Wp = 0, Wn = 0, Wd = 0; const dt = Tp / n, curve = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) * dt, F = F0 * Math.cos(Omega * t), v = -A * Omega * Math.sin(Omega * t - phi), P = F * v;
      if (P > 0) Wp += P * dt; else Wn += P * dt;
      Wd += b * v * v * dt;
      if (i % 20 === 0) curve.push({ t, F, v, P });
    }
    return { r, Omega, A, phi, Tp, Wp, Wn, W: Wp + Wn, Wd, Wformula: Math.PI * F0 * A * Math.sin(phi), curve, vmax: A * Omega };
  }

  const api = { SYS, F0, X0, B_LIST, B_DRIVE, B_CURVES, omega0, period0, bCritical, simulate, measuredPeriod, peaks, free, damped, steady, driven, staticX, Q, peak, width, cycleWork };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RESONANCE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
