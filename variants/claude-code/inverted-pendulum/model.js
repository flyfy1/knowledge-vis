'use strict';
// Inverted-pendulum lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trace, pole and readout on the page is computed here; tests/core.cjs pins the claims.
// Model: a point mass on a massless rod of length L, pivoting on a cart (the wheel axle). The control
// input u is the cart's horizontal acceleration (m/s²); the motor is assumed to deliver whatever
// acceleration is asked, up to an optional limit. θ is the tilt from upright (rad, positive = leaning
// towards +x). Equations (nonlinear, no friction):
//   x'' = u,      θ'' = (g·sin θ − u·cos θ) / L
// "Fallen" means |θ| reached FALL (60°); the run stops there.
(function (root) {
  const G = 9.81, FALL = Math.PI / 3, DT = 0.002;
  const D2R = Math.PI / 180;

  // ctrl: { Kp, Kd, Kx, Kv } in u = Kp·θ + Kd·ω + Kx·x + Kv·v (m/s² per rad, per rad/s, per m, per m/s)
  // opts: { L, th0 (rad), om0, x0, v0, T (s), delay (s), umax (m/s², Infinity = none) }
  function simulate(ctrl, opts) {
    const L = opts.L || 0.5, T = opts.T || 6, delay = opts.delay || 0, umax = opts.umax === undefined ? Infinity : opts.umax;
    const c = { Kp: 0, Kd: 0, Kx: 0, Kv: 0, ...ctrl };
    let s = [opts.x0 || 0, opts.v0 || 0, opts.th0 || 0, opts.om0 || 0];
    const n = Math.round(T / DT), lag = Math.round(delay / DT), hist = [];
    const out = { t: [0], x: [s[0]], th: [s[2]], u: [0], fell: false, tFall: null, sat: 0, L };
    const law = q => { const u = c.Kp * q[2] + c.Kd * q[3] + c.Kx * q[0] + c.Kv * q[1]; return Math.abs(u) > umax ? Math.sign(u) * umax : u; };
    // With no delay the controller acts continuously (u is re-evaluated inside every RK4 stage), so a
    // step-held input does not sneak in an extra half-step of lag. With a delay, u is the law applied to
    // the state `delay` seconds ago, held over the step.
    const f = (q, u) => { const uu = u === null ? law(q) : u; return [q[1], uu, q[3], (G * Math.sin(q[2]) - uu * Math.cos(q[2])) / L]; };
    for (let i = 0; i < n; i++) {
      hist.push(s);
      const seen = hist[Math.max(0, hist.length - 1 - lag)];  // the state the controller sees
      const raw = c.Kp * seen[2] + c.Kd * seen[3] + c.Kx * seen[0] + c.Kv * seen[1];
      if (Math.abs(raw) > umax) out.sat++;
      const held = lag ? law(seen) : null, u = law(seen);
      const k1 = f(s, held), k2 = f(s.map((v, j) => v + DT / 2 * k1[j]), held), k3 = f(s.map((v, j) => v + DT / 2 * k2[j]), held), k4 = f(s.map((v, j) => v + DT * k3[j]), held);
      s = s.map((v, j) => v + DT / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      out.t.push((i + 1) * DT); out.x.push(s[0]); out.th.push(s[2]); out.u[i] = u; out.u.push(u);
      if (Math.abs(s[2]) >= FALL) { out.fell = true; out.tFall = (i + 1) * DT; break; }
    }
    out.vEnd = s[1];
    return out;
  }
  const maxAbs = (a, from = 0) => { let m = 0; for (let i = from; i < a.length; i++) m = Math.max(m, Math.abs(a[i])); return m; };
  // Largest |θ| over the final `span` seconds (fallen runs report FALL).
  function tailPeak(run, span = 2) { if (run.fell) return FALL; const from = Math.max(0, run.t.length - Math.round(span / DT)); return maxAbs(run.th, from); }

  // Step 0: no control. Time constant of the fall τ = √(L/g).
  const tau = L => Math.sqrt(L / G);
  const fallTime = (L, th0) => simulate({}, { L, th0, T: 20 }).tFall;

  // Step 1: P only. Linearised: L·θ'' = (g − Kp)·θ. Kp > g → undamped oscillation at ω = √((Kp − g)/L).
  const pOmega = (Kp, L) => (Kp > G ? Math.sqrt((Kp - G) / L) : null);

  // Step 2: PD. Linearised characteristic equation L·s² + Kd·s + (Kp − g) = 0.
  function pdPoles(Kp, Kd, L) {
    const a = L, b = Kd, c = Kp - G, disc = b * b - 4 * a * c;
    if (disc >= 0) { const r = Math.sqrt(disc); return [{ re: (-b - r) / (2 * a), im: 0 }, { re: (-b + r) / (2 * a), im: 0 }]; }
    const r = Math.sqrt(-disc); return [{ re: -b / (2 * a), im: -r / (2 * a) }, { re: -b / (2 * a), im: r / (2 * a) }];
  }
  function pdShape(Kp, Kd, L) { if (Kp <= G) return { wn: null, zeta: null }; const wn = Math.sqrt((Kp - G) / L); return { wn, zeta: Kd / (2 * L * wn) }; }
  // Kd that gives damping ratio ζ for a given Kp.
  const kdFor = (Kp, zeta, L) => 2 * zeta * L * Math.sqrt((Kp - G) / L);
  // 2% settling: last time |θ| exceeds 2% of the starting tilt.
  function settleTime(run, th0) { if (run.fell) return null; const lim = 0.02 * Math.abs(th0); for (let i = run.th.length - 1; i >= 0; i--) if (Math.abs(run.th[i]) > lim) return i === run.th.length - 1 ? null : run.t[i + 1]; return 0; }

  // Step 3: delay. The design used: Kp = 2g, ζ = 0.7 (L = 0.5 m).
  const L0 = 0.5, KP3 = 2 * G, KD3 = kdFor(2 * G, 0.7, L0), TH3 = 5 * D2R;
  const stable3 = delay => { const r = simulate({ Kp: KP3, Kd: KD3 }, { L: L0, th0: TH3, T: 10, delay }); return !r.fell && tailPeak(r, 2) < TH3 * 0.5; };
  function criticalDelay() { let a = 0, b = 0.3; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (stable3(m)) a = m; else b = m; } return (a + b) / 2; }

  // Step 4: add the cart position. Full-state gains placing all four closed-loop poles at −p:
  // characteristic polynomial s⁴ + ((Kd − L·Kv)/L)s³ + ((Kp − g − L·Kx)/L)s² + (g·Kv/L)s + g·Kx/L = (s + p)⁴.
  function placeGains(p, L) {
    const Kx = Math.pow(p, 4) * L / G, Kv = 4 * Math.pow(p, 3) * L / G;
    return { Kx, Kv, Kp: 6 * p * p * L + G + L * Kx, Kd: 4 * p * L + L * Kv };
  }
  // Coefficients of the linearised closed-loop characteristic polynomial (monic), for checking.
  function charPoly(c, L) { return [1, (c.Kd - L * c.Kv) / L, (c.Kp - G - L * c.Kx) / L, G * c.Kv / L, G * c.Kx / L]; }
  const PD4 = { Kp: 2 * G, Kd: kdFor(2 * G, 0.7, L0) };

  // Step 5: motor limit, upright robot given a shove (initial angular speed ω0, θ0 = 0).
  // Linearised, the falling mode is z = θ + τ·ω (τ = √(L/g)) with z' = z/τ − u/(g·τ); with |u| ≤ umax it
  // can only be brought back while |z| < umax/g. So no controller can catch a shove above
  // ω0 = umax / (g·τ) — the linear bound. The PD controller's measured limit sits at or below it.
  const pushBound = (umax, L = L0) => umax / (G * tau(L));
  const T5 = 8;
  const recovers = (ctrl, om0, umax, L = L0) => { const r = simulate(ctrl, { L, om0, umax, T: T5 }); return !r.fell && tailPeak(r, 1) < 2 * D2R; };
  function maxPush(ctrl, umax, L = L0, iters = 26) { let a = 0, b = 1.2 * pushBound(umax, L); for (let i = 0; i < iters; i++) { const m = (a + b) / 2; if (recovers(ctrl, m, umax, L)) a = m; else b = m; } return a; }

  // Mean period of a swing, from successive upward zero crossings of θ (null if fewer than two).
  function swingPeriod(run) {
    const ups = []; for (let i = 1; i < run.th.length; i++) if (run.th[i - 1] < 0 && run.th[i] >= 0) ups.push(run.t[i - 1] + (run.t[i] - run.t[i - 1]) * (-run.th[i - 1]) / (run.th[i] - run.th[i - 1]));
    return ups.length < 2 ? null : (ups[ups.length - 1] - ups[0]) / (ups.length - 1);
  }

  const API = { swingPeriod, G, FALL, DT, D2R, simulate, maxAbs, tailPeak, tau, fallTime, pOmega, pdPoles, pdShape, kdFor, settleTime,
    L0, KP3, KD3, TH3, stable3, criticalDelay, placeGains, charPoly, PD4, pushBound, T5, recovers, maxPush };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.PENDULUM_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
