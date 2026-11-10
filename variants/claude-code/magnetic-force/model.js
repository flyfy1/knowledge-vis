'use strict';
// Lorentz-force lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, path, landing mark and readout on the page is computed here; tests/core.cjs pins the claims.
// Units: steps 0–3 use teaching units (charge ±1, mass 1–3, field 0.5–2, speed 0.5–2; no SI meaning);
// steps 4–5 use SI with CODATA constants. Single particle, uniform fields, no radiation, non-relativistic
// (the size of the relativistic correction is computed and shown, never silently applied).
// Field convention: the page is the x–y plane, B points along z; Bz < 0 means "into the screen" (drawn ×).
(function (root) {
  const E = 1.602176634e-19, U = 1.66053906660e-27, MP = 1.67262192369e-27, MD = 3.3435837724e-27, C = 299792458;

  /* ---------- force ---------- */
  // F = q v × B with B = (0, 0, Bz): (q·vy·Bz, −q·vx·Bz)
  function lorentz(q, vx, vy, Bz) { return { fx: q * vy * Bz, fy: -q * vx * Bz }; }
  const angleDeg = (x, y) => { let a = Math.atan2(y, x) * 180 / Math.PI; if (a < 0) a += 360; return a; };
  // signed angle from vector a to vector b, in degrees (−180, 180]; positive = counter-clockwise
  function turn(ax, ay, bx, by) { return Math.atan2(ax * by - ay * bx, ax * bx + ay * by) * 180 / Math.PI; }

  /* ---------- exact motion in a uniform B (teaching units) ---------- */
  // ω = q·Bz/m; velocity rotates by −ωt. Start at (x0, y0) with velocity (vx, vy).
  function orbitAt(p, t) {
    const w = p.q * p.Bz / p.m;
    if (Math.abs(w) < 1e-15) return { x: p.x0 + p.vx * t, y: p.y0 + p.vy * t, vx: p.vx, vy: p.vy };
    const c = Math.cos(w * t), s = Math.sin(w * t);
    const vx = p.vx * c + p.vy * s, vy = -p.vx * s + p.vy * c;
    // ∫ v dt
    const x = p.x0 + (p.vx * s - p.vy * (c - 1)) / w, y = p.y0 + (p.vx * (c - 1) + p.vy * s) / w;
    return { x, y, vx, vy };
  }
  function radius(m, v, q, B) { return m * v / (Math.abs(q) * B); }
  function period(m, q, B) { return 2 * Math.PI * m / (Math.abs(q) * B); }
  function center(p) { const w = p.q * p.Bz / p.m; return { x: p.x0 + p.vy / w, y: p.y0 - p.vx / w }; }

  // Uniform E along +y (step 1 comparison): parabola, speed grows.
  function eFieldAt(p, t) { const a = p.q * p.Ey / p.m; return { x: p.x0 + p.vx * t, y: p.y0 + p.vy * t + 0.5 * a * t * t, vx: p.vx, vy: p.vy + a * t }; }

  /* ---------- independent numerical integration (RK4) used to "measure" ---------- */
  function rk4(p, field, dt, steps, onStep) {
    let s = [p.x0, p.y0, p.vx, p.vy];
    const f = st => { const F = field === 'B' ? lorentz(p.q, st[2], st[3], p.Bz) : { fx: 0, fy: p.q * p.Ey }; return [st[2], st[3], F.fx / p.m, F.fy / p.m]; };
    let work = 0;
    for (let i = 1; i <= steps; i++) {
      const k1 = f(s), k2 = f(s.map((v, j) => v + dt / 2 * k1[j])), k3 = f(s.map((v, j) => v + dt / 2 * k2[j])), k4 = f(s.map((v, j) => v + dt * k3[j]));
      const nxt = s.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      // work = ∫ F·v dt (trapezoid on force·velocity)
      const F0 = field === 'B' ? lorentz(p.q, s[2], s[3], p.Bz) : { fx: 0, fy: p.q * p.Ey }, F1 = field === 'B' ? lorentz(p.q, nxt[2], nxt[3], p.Bz) : { fx: 0, fy: p.q * p.Ey };
      work += dt / 2 * (F0.fx * s[2] + F0.fy * s[3] + F1.fx * nxt[2] + F1.fy * nxt[3]);
      s = nxt; if (onStep) onStep(i * dt, s, work);
    }
    return { x: s[0], y: s[1], vx: s[2], vy: s[3], work };
  }
  // Measured period: integrate until the velocity direction has turned through a full 360°
  // (accumulated signed angle), then interpolate the crossing time.
  function measurePeriod(p, dt = 1e-3) {
    let total = 0, prev = [p.vx, p.vy], tPrev = 0, found = null;
    rk4(p, 'B', dt, Math.ceil(4 * Math.PI * p.m / (Math.abs(p.q * p.Bz)) / dt), (t, s) => {
      if (found !== null) return;
      const d = turn(prev[0], prev[1], s[2], s[3]), before = total; total += d;
      if (Math.abs(total) >= 360) found = tPrev + (360 - Math.abs(before)) / Math.abs(d) * (t - tPrev);
      prev = [s[2], s[3]]; tPrev = t;
    });
    return found;
  }
  // Measured radius: largest distance from the start point over one numerically integrated lap, halved.
  function measureRadius(p, dt = 2e-3) {
    let dmax = 0;
    rk4(p, 'B', dt, Math.ceil(period(p.m, p.q, Math.abs(p.Bz)) / dt) + 2, (t, s) => { dmax = Math.max(dmax, Math.hypot(s[0] - p.x0, s[1] - p.y0)); });
    return dmax / 2;
  }

  /* ---------- step 4: mass spectrometer (SI) ---------- */
  const ISOTOPES = [{ id: '20Ne', u: 19.9924402 }, { id: '21Ne', u: 20.9938467 }, { id: '22Ne', u: 21.9913851 }];
  // Singly charged ions from rest through voltage Uacc, then a semicircle in B. (Electron mass neglected.)
  function spectro(massU, Uacc, B, q = E) {
    const m = massU * U, v = Math.sqrt(2 * q * Uacc / m), r = m * v / (q * B);
    return { m, v, r, x: 2 * r, t: Math.PI * m / (q * B) };
  }
  // Mass recovered from a landing distance x: m = q B² x² / (8 U)
  function massFromX(x, Uacc, B, q = E) { return q * B * B * x * x / (8 * Uacc) / U; }

  /* ---------- step 5: cyclotron (SI) ---------- */
  // Protons start at rest at the gap. Crossing k (k = 0, 1, …) happens at t = k·Tc/2 and gains q·U·cos(π·k·δ),
  // where δ = f_rf / f_c − 1 (thin gap, no transit-time effect, non-relativistic). Half-turn k then has radius
  // r = √(2mE)/(qB). Stops when r reaches the dee radius R (extracted), when the particle is brought to rest
  // (stalled), or after maxHalf half-turns.
  function cyclotron({ B = 1, Ugap = 5e4, delta = 0, R = 0.5, m = MP, q = E, maxHalf = 4000 } = {}) {
    const fc = q * B / (2 * Math.PI * m), Emax = q * q * B * B * R * R / (2 * m);
    let En = 0, peak = 0; const steps = [];
    let status = 'running';
    for (let k = 0; k < maxHalf; k++) {
      En += q * Ugap * Math.cos(Math.PI * k * delta);
      if (En <= 0) { En = 0; status = 'stalled'; steps.push({ k, E: 0, r: 0, t: (k + 1) / (2 * fc) }); break; }
      const r = Math.sqrt(2 * m * En) / (q * B);
      if (r >= R) { steps.push({ k, E: Emax, r: R, t: (k + 1) / (2 * fc) }); status = 'extracted'; break; }
      steps.push({ k, E: En, r, t: (k + 1) / (2 * fc) });
      peak = Math.max(peak, En);
    }
    if (status === 'running') status = 'limit';
    const last = steps[steps.length - 1];
    peak = Math.max(peak, last.E);
    return { fc, frf: fc * (1 + delta), Emax, steps, status, peak, Eend: last.E, halfTurns: steps.length, time: last.t };
  }
  // Path: semicircles alternating right dee (downward) and left dee (upward), chained at the gap x = 0.
  function cycloPath(steps) {
    let y = steps.length ? steps[0].r / 2 : 0; const arcs = [];
    steps.forEach((s, i) => {
      if (s.r <= 0) return;
      const right = i % 2 === 0, cy = right ? y - s.r : y + s.r;
      arcs.push({ cx: 0, cy, r: s.r, right, y0: y, y1: right ? y - 2 * s.r : y + 2 * s.r });
      y = right ? y - 2 * s.r : y + 2 * s.r;
    });
    return arcs;
  }
  // Largest |δ| (found by bisection, sign +) for which the beam still reaches the dee edge.
  function tolerance(opts) {
    let lo = 0, hi = 0.05;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (cyclotron({ ...opts, delta: mid }).status === 'extracted') lo = mid; else hi = mid; }
    return lo;
  }
  const MEV = 1e6 * E;
  function gamma(Ekin, m) { return 1 + Ekin / (m * C * C); }

  const api = { E, U, MP, MD, C, MEV, lorentz, angleDeg, turn, orbitAt, radius, period, center, eFieldAt, rk4, measurePeriod, measureRadius, ISOTOPES, spectro, massFromX, cyclotron, cycloPath, tolerance, gamma };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MF_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
