'use strict';
// Newton's laws lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, force and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: point masses, g = 9.8 m/s², SI units, motion along one straight line (+x to the right).
(function (root) {
  const G = 9.8;

  /* ---- step 0: a puck launched at v0 on ice of friction coefficient mu (no push after launch) ---- */
  const S0 = { v0: 4, track: 12, dt: 0.25 };
  function glide(mu, v0 = S0.v0) {
    const a = mu * G; // deceleration from kinetic friction μ·m·g ÷ m
    if (mu <= 0) return { a: 0, tStop: Infinity, dStop: Infinity };
    return { a, tStop: v0 / a, dStop: v0 * v0 / (2 * a) };
  }
  function glidePos(mu, t, v0 = S0.v0) {
    const s = glide(mu, v0), tt = Math.min(t, s.tStop);
    return v0 * tt - 0.5 * s.a * tt * tt;
  }
  // Time at which the puck reaches the end of the track (Infinity if it stops first).
  function glideExit(mu, L = S0.track, v0 = S0.v0) {
    const s = glide(mu, v0);
    if (s.dStop <= L) return Infinity;
    if (s.a === 0) return L / v0;
    return (v0 - Math.sqrt(v0 * v0 - 2 * s.a * L)) / s.a;
  }
  // The strobe positions shown on the track: every dt until the puck stops or leaves the track.
  function glideStrobe(mu) {
    const s = glide(mu), tEnd = Math.min(s.tStop, glideExit(mu)), out = [];
    for (let k = 0; k * S0.dt <= tEnd + 1e-9; k++) out.push({ t: k * S0.dt, x: glidePos(mu, k * S0.dt) });
    return { pts: out, tEnd, stops: s.dStop <= S0.track };
  }

  /* ---- steps 1–2: a constant net force F on a cart of mass m, starting from rest ---- */
  function strobe(a, dt, n) { // positions at t = 0, dt, …, n·dt
    const x = []; for (let k = 0; k <= n; k++) x.push(0.5 * a * (k * dt) * (k * dt));
    return x;
  }
  function gaps(x) { const g = []; for (let k = 1; k < x.length; k++) g.push(x[k] - x[k - 1]); return g; }
  // Acceleration read back from the strobe: every gap is longer than the one before by a·dt².
  function aFromStrobe(x, dt) { const g = gaps(x); return (g[1] - g[0]) / (dt * dt); }
  const S1 = { m: 2, dt: 0.5, n: 4, Fmax: 8 };
  const S2 = { F: 6, dt: 0.25, n: 4 };
  // Least-squares slope of a line through the origin (used for the a–F and a–1/m fits).
  function slopeThroughOrigin(pts) {
    let sxy = 0, sxx = 0; pts.forEach(([x, y]) => { sxy += x * y; sxx += x * x; });
    return sxx > 0 ? sxy / sxx : NaN;
  }

  /* ---- step 3: pushing a crate from rest on a rough floor ---- */
  const S3 = { m: 5, muS: 0.5, muK: 0.4, dt: 0.5, n: 4 };
  function crate(F, p = S3) {
    const N = p.m * G, fsMax = p.muS * N, fk = p.muK * N;
    if (F <= fsMax + 1e-12) return { N, fsMax, fk, moving: false, f: F, net: 0, a: 0 };
    return { N, fsMax, fk, moving: true, f: fk, net: F - fk, a: (F - fk) / p.m };
  }

  /* ---- step 4: a cart on a frictionless table pulled by a hanging mass over a light pulley ---- */
  function hanger(m1, m2) {
    const a = m2 * G / (m1 + m2), T = m1 * a, W2 = m2 * G;
    return { a, T, W2, netHanger: W2 - T, ratio: T / W2 };
  }

  /* ---- step 5: two carts pushed apart by a compressed spring (k, compression c0) ---- */
  const S5 = { k: 400, c0: 0.1, tMax: 0.3 };
  function springApart(m1, m2, p = S5) {
    const M = m1 + m2, mu = m1 * m2 / M, w = Math.sqrt(p.k / mu), tRel = Math.PI / (2 * w);
    const vRel = p.c0 * w; // relative speed when the spring reaches its natural length
    const v1 = -m2 / M * vRel, v2 = m1 / M * vRel; // cart 1 goes left (−), cart 2 goes right (+)
    function at(t) {
      const tt = Math.min(Math.max(t, 0), tRel), c = p.c0 * Math.cos(w * tt), vr = p.c0 * w * Math.sin(w * tt);
      const pushed = t < tRel; // spring still in contact
      const F = pushed && t >= 0 ? p.k * c : 0; // magnitude of the force each cart feels
      const extra = Math.max(0, t - tRel);
      const x1 = -m2 / M * (p.c0 - c) + (t > tRel ? v1 * extra : 0);
      const x2 = m1 / M * (p.c0 - c) + (t > tRel ? v2 * extra : 0);
      return { F1: -F, F2: F, v1: -m2 / M * vr, v2: m1 / M * vr, x1, x2, c: pushed ? c : 0 };
    }
    return { M, mu, w, tRel, vRel, v1, v2, p1: m1 * v1, p2: m2 * v2, Fpeak: p.k * p.c0, at };
  }
  // Impulse ∫F dt over the push (trapezoid rule) — equals the momentum each cart ends with.
  function impulse(m1, m2, steps = 4000) {
    const s = springApart(m1, m2); let J = 0; const h = s.tRel / steps;
    for (let i = 0; i < steps; i++) J += 0.5 * (s.at(i * h).F2 + s.at((i + 1) * h - 1e-15).F2) * h;
    return J;
  }

  const api = { G, S0, glide, glidePos, glideExit, glideStrobe, strobe, gaps, aFromStrobe, S1, S2, slopeThroughOrigin, S3, crate, hanger, S5, springApart, impulse };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NEWTON_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
