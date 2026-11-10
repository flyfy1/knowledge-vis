'use strict';
// Mechanical energy lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Pure functions shared by the page and tests/core.cjs. SI units: m, s, kg, J; g = 9.8 N/kg.
(function (root) {
  const G = 9.8;

  /* ---------- step 0: free fall ---------- */
  const fallTime = h0 => Math.sqrt(2 * h0 / G);
  function fallState(h0, m, t) {
    const tt = Math.max(0, Math.min(t, fallTime(h0)));
    const v = G * tt, h = h0 - 0.5 * G * tt * tt;
    return { t: tt, h: Math.max(0, h), v, Ep: m * G * Math.max(0, h), Ek: 0.5 * m * v * v, E0: m * G * h0 };
  }
  const impactSpeed = h0 => Math.sqrt(2 * G * h0);

  /* ---------- steps 1 and 3: the coaster track ---------- */
  // Key points (x, h) in metres; between neighbours the height follows a half cosine, so the slope is 0 at every key point.
  const KEYS = [[0, 16], [16, 1], [30, 10], [42, 3], [54, 7], [68, 0.8], [84, 0.8], [98, 16]];
  const XMAX = 98, MASS = 500; // coaster car mass (kg)
  function seg(x) { let i = 0; while (i < KEYS.length - 2 && x > KEYS[i + 1][0]) i++; return i; }
  function h(x) {
    const xc = Math.max(0, Math.min(XMAX, x)), i = seg(xc), [x0, h0] = KEYS[i], [x1, h1] = KEYS[i + 1], u = (xc - x0) / (x1 - x0);
    return h0 + (h1 - h0) * (1 - Math.cos(Math.PI * u)) / 2;
  }
  function dh(x) {
    const xc = Math.max(0, Math.min(XMAX, x)), i = seg(xc), [x0, h0] = KEYS[i], [x1, h1] = KEYS[i + 1], u = (xc - x0) / (x1 - x0);
    return (h1 - h0) * Math.PI * Math.sin(Math.PI * u) / (2 * (x1 - x0));
  }
  // Release point: where the first slope is at height H (the car starts from rest there).
  function releaseX(H) { let lo = 0, hi = 16; for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (h(mid) > H) lo = mid; else hi = mid; } return (lo + hi) / 2; }
  // Speed at x for a frictionless car released from height H (null where the track is higher than H).
  const speedAt = (H, x) => (h(x) <= H ? Math.sqrt(2 * G * (H - h(x))) : null);
  // Reachable stretch from the release point: the car turns back where the track first rises to H.
  function reach(H) {
    const x0 = releaseX(H); let x = x0;
    while (x < XMAX && h(x) <= H + 1e-9) x += 0.01;
    let lo = x - 0.01, hi = Math.min(x, XMAX);
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (h(mid) <= H) lo = mid; else hi = mid; }
    return { x0, x1: lo };
  }

  // Motion along the track with a constant resistive force k·m·g opposite the velocity (k = 0: no friction).
  // State: x (horizontal position), v (speed along the track, signed). RK4 with dt = 2 ms; heat Q = k·m·g × path length.
  // The books are NOT forced to balance: tests check that Ep + Ek + Q stays equal to E0 as a test of the integration.
  function simulate(H, k, { T = 60, dt = 0.002, m = MASS, every = 0.02 } = {}) {
    let x = releaseX(H), v = 0, Q = 0, s = 0, t = 0, stopT = null;
    const E0 = m * G * h(x), out = [];
    const q = xx => Math.sqrt(1 + dh(xx) ** 2);
    const tang = xx => -G * dh(xx) / q(xx);               // gravity along the track (per unit mass)
    const f = (xx, vv, dir) => [vv / q(xx), tang(xx) - dir * k * G];
    const push = () => out.push({ t, x, v, s, h: h(x), Ep: m * G * h(x), Ek: 0.5 * m * v * v, Q, E0 });
    push();
    let next = every;
    while (t < T - 1e-9) {
      if (stopT === null) {
        // direction of motion (friction opposes it); from rest the car moves the way gravity pulls
        const dir = v > 0 ? 1 : v < 0 ? -1 : Math.sign(tang(x));
        if (v === 0 && Math.abs(tang(x)) <= k * G) { stopT = t; continue; }
        const [a1, b1] = f(x, v, dir), [a2, b2] = f(x + dt / 2 * a1, v + dt / 2 * b1, dir), [a3, b3] = f(x + dt / 2 * a2, v + dt / 2 * b2, dir), [a4, b4] = f(x + dt * a3, v + dt * b3, dir);
        let nx = x + dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4), nv = v + dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4);
        if (k > 0 && v !== 0 && Math.sign(nv) !== Math.sign(v)) { // came to a momentary halt inside this step
          const frac = v / (v - nv); nx = x + (nx - x) * frac; nv = 0;
        }
        const ds = Math.abs(nx - x) * q((nx + x) / 2);
        s += ds; Q += k * m * G * ds; x = nx; v = nv;
      }
      t += dt;
      if (t >= next - 1e-9) { push(); next += every; }
    }
    return { E0, frames: out, stopT, every };
  }

  /* ---------- step 2: Galileo's interrupted pendulum ---------- */
  const PEND = { L: 3 };
  // Released from rest at th0 (degrees) on the left. On the right a peg at depth p (m) below the pivot catches the
  // string, so the ball swings on a shorter radius r = L − p. Phases: L1 (left, radius L), R (right, radius r), L2 (back).
  function pendulum(th0deg, p, { dt = 0.0002, every = 0.01 } = {}) {
    const L = PEND.L, r = L - p, th0 = th0deg * Math.PI / 180, h0 = L * (1 - Math.cos(th0));
    const pts = []; let t = 0, th = -th0, w = 0, phase = 'L1', hmax = 0, next = 0;
    const R = () => (phase === 'R' ? r : L);
    const pos = () => (phase === 'R' ? { x: r * Math.sin(th), y: -p - r * Math.cos(th) } : { x: L * Math.sin(th), y: -L * Math.cos(th) });
    for (let i = 0; i < 1e6; i++) {
      const P = pos(), hh = P.y + L;
      if (phase === 'R') hmax = Math.max(hmax, hh);
      if (t >= next - 1e-12) { pts.push({ t, x: P.x, y: P.y, h: hh, phase }); next += every; }
      const acc = a => -G / R() * Math.sin(a);
      const a0 = acc(th), thN = th + w * dt + 0.5 * a0 * dt * dt, wN = w + 0.5 * (a0 + acc(thN)) * dt;
      t += dt;
      if (phase === 'L1' && thN >= 0) { const v = wN * L; phase = 'R'; th = thN * L / r; w = v / r; continue; }
      if (phase === 'R' && thN < 0) { const v = wN * r; phase = 'L2'; th = thN * r / L; w = v / L; continue; }
      th = thN; w = wN;
      if (phase === 'L2' && w >= 0) { const Q = pos(); pts.push({ t, x: Q.x, y: Q.y, h: Q.y + L, phase }); break; }
    }
    const phiMax = Math.acos(1 - h0 / r) * 180 / Math.PI; // turning angle around the peg predicted by energy
    return { h0, hmax, r, phiMax, pts, T: t };
  }

  /* ---------- step 4: speed squared ---------- */
  const kmh = v => v / 3.6;
  const dropHeight = vKmh => kmh(vKmh) ** 2 / (2 * G);   // height that gives the same speed in free fall
  const FLOOR = 3; // metres per storey

  const API = { G, fallTime, fallState, impactSpeed, KEYS, XMAX, MASS, h, dh, releaseX, speedAt, reach, simulate, PEND, pendulum, kmh, dropHeight, FLOOR };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root) root.ME_MODEL = API;
})(typeof window !== 'undefined' ? window : null);
