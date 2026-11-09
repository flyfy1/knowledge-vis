'use strict';
// Momentum & collisions lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, cart position and readout on the page comes from here; tests/core.cjs pins the claims.
// Scope: one-dimensional motion, rigid carts on a level track, no friction except the stated braking
// force, contact forces taken as constant during a short contact time (a teaching simplification).
(function (root) {
  const BRAKE_F = 2;              // N: the same braking force for every cart in step 0
  const REF = { m: 2, v: 1.5 };   // step 0 reference cart B (p = 3 kg·m/s)
  const PUSH = { v0: 0.5, t0: 0.5, T: 3 };     // step 1: start speed, push start time, plotted window (s)
  const EGG = { m: 0.06, limit: 25, g: 9.8 };  // step 2: egg mass (kg), assumed breaking force (N)
  const CONTACT = { tc: 1, tau: 0.08, T: 3, D: 1, XC: 6 }; // step 3: contact starts at 1 s, lasts 0.08 s; carts 1 m long
  const ICE = { T: 6, mark: 0.5, X: 25 }; // step 5: watch 6 s after the push on a ±25 m strip of ice, a footprint every 0.5 s

  const momentum = (m, v) => m * v;
  const ke = (m, v) => 0.5 * m * v * v;

  // Step 0: constant braking force F on mass m moving at v. Deceleration a = F/m.
  function braking(m, v, F = BRAKE_F) {
    const p = m * v, a = F / m, tStop = p / F, dist = v * v / (2 * a);
    const vel = t => Math.max(0, v - a * Math.max(0, t));
    const pos = t => { const s = Math.min(Math.max(0, t), tStop); return v * s - 0.5 * a * s * s; };
    return { m, v, p, a, F, tStop, dist, vel, pos };
  }

  // Step 1: cart (mass m, start speed v0) pushed forward with force F from t0 to t0 + dt.
  function push(m, F, dt, v0 = PUSH.v0, t0 = PUSH.t0) {
    const J = F * dt, p0 = m * v0, p1 = p0 + J;
    const p = t => p0 + F * Math.min(dt, Math.max(0, t - t0));
    const force = t => (t >= t0 && t <= t0 + dt ? F : 0);
    return { m, F, dt, J, p0, p1, v0, v1: p1 / m, dv: J / m, t0, t1: t0 + dt, p, force };
  }

  // Step 2: an egg (mass EGG.m) arriving at speed v is stopped in time dt.
  // Average stopping force = Δp / Δt (the egg's weight, m·g ≈ 0.59 N, is left out and stated so).
  function cushion(v, dt, m = EGG.m, limit = EGG.limit) {
    const dp = m * v, F = dp / dt;
    return { v, dt, dp, F, safe: F <= limit + 1e-12, dtMin: dp / limit, weight: m * EGG.g, limit };
  }

  // Steps 3–4: carts A (left) and B (right) on a line. e = restitution (separation speed ÷ approach speed).
  function collide(mA, mB, vA, vB, e) {
    const u = vA - vB, M = mA + mB, mu = mA * mB / M;
    const hit = u > 1e-12;
    const J = hit ? (1 + e) * mu * u : 0;             // impulse A gives B (N·s)
    const vA2 = vA - J / mA, vB2 = vB + J / mB;
    const pBefore = mA * vA + mB * vB, pAfter = mA * vA2 + mB * vB2;
    const keBefore = ke(mA, vA) + ke(mB, vB), keAfter = ke(mA, vA2) + ke(mB, vB2);
    return { mA, mB, vA, vB, e, u, hit, J, vA2, vB2, pA: mA * vA, pB: mB * vB, pA2: mA * vA2, pB2: mB * vB2,
      pBefore, pAfter, keBefore, keAfter, keLost: keBefore - keAfter, keFrac: keBefore > 0 ? keAfter / keBefore : 1,
      vCommon: pBefore / M, sep: vB2 - vA2 };
  }
  // Closed form for the kinetic energy lost: ½·μ·u²·(1 − e²), μ = mA·mB/(mA + mB).
  const keLossFormula = (mA, mB, vA, vB, e) => { const u = vA - vB; return u > 0 ? 0.5 * mA * mB / (mA + mB) * u * u * (1 - e * e) : 0; };

  // Timeline for the animated collision: contact from tc to tc + tau with a constant force J/tau.
  function timeline(mA, mB, vA, vB, e, c = CONTACT) {
    const r = collide(mA, mB, vA, vB, e), F = r.J / c.tau;
    const s = t => Math.min(c.tau, Math.max(0, t - c.tc));           // time spent in contact so far
    const after = t => Math.max(0, t - c.tc - c.tau);
    const vAt = t => (t < c.tc ? vA : t < c.tc + c.tau ? vA - F / mA * s(t) : r.vA2);
    const vBt = t => (t < c.tc ? vB : t < c.tc + c.tau ? vB + F / mB * s(t) : r.vB2);
    // Centres. When they collide they touch at t = tc; otherwise they start 2 m apart and never meet.
    const a0 = r.hit ? c.XC - c.D / 2 - vA * c.tc : 3, b0 = r.hit ? c.XC + c.D / 2 - vB * c.tc : 3 + c.D + 2;
    const xA = t => {
      if (!r.hit) return a0 + vA * t;
      const sc = s(t), x1 = a0 + vA * Math.min(t, c.tc);
      return x1 + vA * sc - F / mA * sc * sc / 2 + r.vA2 * after(t);
    };
    const xB = t => {
      if (!r.hit) return b0 + vB * t;
      const sc = s(t), x1 = b0 + vB * Math.min(t, c.tc);
      return x1 + vB * sc + F / mB * sc * sc / 2 + r.vB2 * after(t);
    };
    return { ...r, F, xA, xB, vAt, vBt, pAt: t => mA * vAt(t), pBt: t => mB * vBt(t) };
  }

  // Step 5: two skaters at rest push apart with impulse J (N·s); skater 1 goes left.
  function recoil(m1, m2, J) {
    const v1 = -J / m1, v2 = J / m2;
    return { m1, m2, J, v1, v2, p1: m1 * v1, p2: m2 * v2, total: m1 * v1 + m2 * v2, speedRatio: (J / m2) / (J / m1), d1: Math.abs(v1) * ICE.T, d2: v2 * ICE.T };
  }

  const api = { BRAKE_F, REF, PUSH, EGG, CONTACT, ICE, momentum, ke, braking, push, cushion, collide, keLossFormula, timeline, recoil };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MOM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
