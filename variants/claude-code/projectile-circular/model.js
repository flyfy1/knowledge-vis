'use strict';
// Projectiles & circular motion lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trajectory, arrow and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: point masses, SI units (step 5 uses km and s), x horizontal, y up.
(function (root) {
  const G = 9.8;

  /* ---- step 0: dropped vs thrown sideways from h = 20 m ---- */
  const S0 = { h: 20, dt: 0.2, vMax: 20 };
  const tLand = (h = S0.h) => Math.sqrt(2 * h / G);
  const height = (t, h = S0.h) => h - 0.5 * G * t * t;
  // Strobe frames every dt up to (and including) the landing instant.
  function strobe0(v0) {
    const T = tLand(), out = [];
    for (let k = 0; k * S0.dt < T - 1e-9; k++) out.push({ t: k * S0.dt, x: v0 * k * S0.dt, y: height(k * S0.dt) });
    out.push({ t: T, x: v0 * T, y: 0 });
    return out;
  }

  /* ---- step 1: launch angle, with and without air drag ---- */
  // Drag model (illustrative): deceleration k·v² opposite to the velocity, k = 0.01 per metre.
  const S1 = { v0: 20, k: 0.01 };
  function ideal(theta, v0 = S1.v0) {
    const th = theta * Math.PI / 180, vx = v0 * Math.cos(th), vy = v0 * Math.sin(th), T = 2 * vy / G;
    return { vx, vy, T, R: vx * T, H: vy * vy / (2 * G) };
  }
  // RK4 integration of the drag model until the ball comes back to y = 0 (landing interpolated linearly).
  function dragFlight(theta, k = S1.k, v0 = S1.v0, dt = 0.002) {
    const th = theta * Math.PI / 180;
    let s = [0, 0, v0 * Math.cos(th), v0 * Math.sin(th)], t = 0, H = 0;
    const f = q => { const sp = Math.hypot(q[2], q[3]); return [q[2], q[3], -k * sp * q[2], -G - k * sp * q[3]]; };
    const path = [[0, 0]];
    for (let i = 0; i < 200000; i++) {
      const k1 = f(s), k2 = f(s.map((v, j) => v + dt / 2 * k1[j])), k3 = f(s.map((v, j) => v + dt / 2 * k2[j])), k4 = f(s.map((v, j) => v + dt * k3[j]));
      const n = s.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      if (n[1] < 0 && t > 0) { const fr = s[1] / (s[1] - n[1]); const R = s[0] + fr * (n[0] - s[0]); path.push([R, 0]); return { R, H, T: t + fr * dt, path }; }
      s = n; t += dt; H = Math.max(H, s[1]); if (i % 10 === 0) path.push([s[0], s[1]]);
    }
    return { R: NaN, H, T: NaN, path };
  }
  const dragCache = {};
  function dragAt(theta) { const key = theta.toFixed(2); return dragCache[key] || (dragCache[key] = dragFlight(theta)); }
  // Best angle with drag: golden-section search on [20°, 60°] (the range is unimodal there), to 0.01°.
  function dragOptimum() {
    if (dragOptimum.c) return dragOptimum.c;
    let a = 20, b = 60; const r = (Math.sqrt(5) - 1) / 2;
    let c = b - r * (b - a), d = a + r * (b - a), fc = dragFlight(c).R, fd = dragFlight(d).R;
    while (b - a > 0.01) { if (fc > fd) { b = d; d = c; fd = fc; c = b - r * (b - a); fc = dragFlight(c).R; } else { a = c; c = d; fc = fd; d = a + r * (b - a); fd = dragFlight(d).R; } }
    const th = (a + b) / 2;
    return (dragOptimum.c = { theta: th, R: dragFlight(th).R });
  }

  /* ---- step 2: the velocity at each strobe instant, and how it changes ---- */
  const S2 = { v0: 20, dt: 0.25 };
  function vel(theta, t, v0 = S2.v0) { const th = theta * Math.PI / 180; const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th) - G * t; return { vx, vy, speed: Math.hypot(vx, vy), dir: Math.atan2(vy, vx) * 180 / Math.PI }; }
  function pos(theta, t, v0 = S2.v0) { const th = theta * Math.PI / 180; return { x: v0 * Math.cos(th) * t, y: v0 * Math.sin(th) * t - 0.5 * G * t * t }; }
  // Velocity change between two instants dt apart: always (0, −g·dt).
  function dv(theta, t, dt = S2.dt) { const a = vel(theta, t), b = vel(theta, t + dt); return { x: b.vx - a.vx, y: b.vy - a.vy }; }

  /* ---- step 3: uniform circular motion ---- */
  function circle(v, r) { return { w: v / r, T: 2 * Math.PI * r / v, a: v * v / r }; }
  // Average acceleration over an interval dt: |Δv| / dt = 2 v sin(ωdt/2) / dt, pointing at the centre (by symmetry).
  function chordAccel(v, r, dt) { const w = v / r; return Math.abs(2 * v * Math.sin(w * dt / 2)) / dt; }
  // Velocity at angle φ (counter-clockwise motion): perpendicular to the radius.
  function circVel(v, phi) { return { x: -v * Math.sin(phi), y: v * Math.cos(phi) }; }

  /* ---- step 4: a car over the top of an arched bridge ---- */
  const S4 = { r: 40, m: 1000 };
  const vCrit = (r = S4.r) => Math.sqrt(G * r);
  function bridge(v, p = S4) {
    const need = v * v / p.r; // centripetal acceleration needed at the top
    const N = Math.max(0, p.m * (G - need));
    return { need, N, ratio: N / (p.m * G), airborne: need > G + 1e-12 };
  }
  // How far below the top each path is after moving a horizontal distance x:
  // the free parabola (car with no road force) and the bridge surface.
  const fallParabola = (v, x) => (v > 0 ? G * x * x / (2 * v * v) : Infinity);
  const fallBridge = (x, r = S4.r) => (Math.abs(x) <= r ? r - Math.sqrt(r * r - x * x) : Infinity);

  /* ---- step 5: Newton's cannon on an imaginary 100 km mountain (no air) ---- */
  const E = { GM: 398600, R: 6371, h: 100 }; E.r0 = E.R + E.h; // km³/s², km
  const vCirc = () => Math.sqrt(E.GM / E.r0), vEsc = () => Math.sqrt(2 * E.GM / E.r0);
  const g0 = () => E.GM / (E.r0 * E.r0) * 1000; // m/s² at the launch height
  // Analytic orbit through the launch point (horizontal velocity v km/s): the other apsis and the period.
  function orbit(v) {
    const r0 = E.r0, en = v * v / 2 - E.GM / r0;
    if (v <= 0) return { kind: 'drop', other: 0, a: r0 / 2, T: NaN };
    const other = r0 * r0 * v * v / (2 * E.GM - r0 * v * v); // the second turning radius
    const a = -E.GM / (2 * en), T = 2 * Math.PI * Math.sqrt(a * a * a / E.GM);
    const crash = other < E.R;
    return { kind: crash ? 'crash' : Math.abs(other - r0) < 10 ? 'circle' : 'ellipse', other, a, T, rMin: Math.min(r0, other), rMax: Math.max(r0, other) };
  }
  // RK4 flight (dt in s) until the shell hits the ground or completes one full turn round the centre.
  function flight(v, dt = 1) {
    const f = q => { const r3 = Math.pow(Math.hypot(q[0], q[1]), 3); return [q[2], q[3], -E.GM * q[0] / r3, -E.GM * q[1] / r3]; };
    let s = [0, E.r0, v, 0], t = 0, swept = 0, prev = Math.atan2(s[0], s[1]);
    const path = [[s[0], s[1], 0]];
    for (let i = 0; i < 40000; i++) {
      const k1 = f(s), k2 = f(s.map((x, j) => x + dt / 2 * k1[j])), k3 = f(s.map((x, j) => x + dt / 2 * k2[j])), k4 = f(s.map((x, j) => x + dt * k3[j]));
      s = s.map((x, j) => x + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); t += dt;
      const ang = Math.atan2(s[0], s[1]); let d = ang - prev; if (d < -Math.PI) d += 2 * Math.PI; if (d > Math.PI) d -= 2 * Math.PI; swept += d; prev = ang;
      if (i % 5 === 4) path.push([s[0], s[1], t]);
      const r = Math.hypot(s[0], s[1]);
      if (r < E.R) { path.push([s[0], s[1], t]); return { crashed: true, t, swept, path }; }
      if (swept >= 2 * Math.PI) { path.push([s[0], s[1], t]); return { crashed: false, t, swept, path }; }
    }
    return { crashed: false, t, swept, path };
  }
  // In one second: how far the shell falls (½·g·1²) and how far the ground curves away below a straight line of length v·1 s.
  function oneSecond(v) {
    const fall = 0.5 * g0(), d = v; // m, km
    const drop = (E.r0 - Math.sqrt(E.r0 * E.r0 - d * d)) * 1000; // m, exact geometry
    return { fall, drop };
  }

  const api = { G, S0, tLand, height, strobe0, S1, ideal, dragFlight, dragAt, dragOptimum, S2, vel, pos, dv, circle, chordAccel, circVel, S4, vCrit, bridge, fallParabola, fallBridge, E, vCirc, vEsc, g0, orbit, flight, oneSecond };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PROJ_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
