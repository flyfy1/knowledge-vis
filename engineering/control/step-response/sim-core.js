'use strict';
// Second-order step response: y'' + 2ζωn y' + ωn² y = ωn² u, u = unit step at t = 0,
// y(0) = y'(0) = 0. Every curve and metric on the page comes from simulate() + metrics();
// formulas() is the textbook closed form the page compares against (underdamped only).
// Author: Claude Code (claude-opus-5-5), 2026-11-08.
(function (root) {
  const DT = 0.005;

  function simulate(zeta, wn, duration = 10, dt = DT) {
    const f = (y, v) => wn * wn * (1 - y) - 2 * zeta * wn * v; // acceleration for u = 1
    let y = 0, v = 0;
    const points = [{ t: 0, y: 0 }];
    const steps = Math.round(duration / dt);
    for (let i = 1; i <= steps; i++) {
      // classic RK4 on (y, v)
      const k1y = v, k1v = f(y, v);
      const k2y = v + 0.5 * dt * k1v, k2v = f(y + 0.5 * dt * k1y, v + 0.5 * dt * k1v);
      const k3y = v + 0.5 * dt * k2v, k3v = f(y + 0.5 * dt * k2y, v + 0.5 * dt * k2v);
      const k4y = v + dt * k3v, k4v = f(y + dt * k3y, v + dt * k3v);
      y += dt / 6 * (k1y + 2 * k2y + 2 * k3y + k4y);
      v += dt / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
      points.push({ t: i * dt, y });
    }
    return { zeta, wn, duration, dt, points };
  }

  // Metrics read from the simulated samples, not from the formulas.
  // overshoot: (peak − 1) × 100 %, 0 if the curve never passes 1.
  // settling: first time after which |y − 1| stays ≤ band (2 %); null if the run does not show
  // it staying there for at least the last 10 % of the run.
  // rise: 10 % → 90 % of the final value.
  function metrics(run, band = 0.02) {
    const pts = run.points;
    let peak = pts[0];
    for (const p of pts) if (p.y > peak.y) peak = p;
    let settling = null;
    for (let i = pts.length - 1; i >= 0; i--) {
      if (Math.abs(pts[i].y - 1) > band) { settling = i === pts.length - 1 ? null : pts[i + 1].t; break; }
      if (i === 0) settling = 0;
    }
    // A run that is still inside the band only for its last moments has not shown settling.
    if (settling !== null && run.duration - settling < 0.1 * run.duration) settling = null;
    const cross = level => { const p = pts.find(q => q.y >= level); return p ? p.t : null; };
    const r10 = cross(0.1), r90 = cross(0.9);
    return {
      peak: peak.y,
      peakTime: peak.y > 1 ? peak.t : null,
      overshoot: Math.max(0, (peak.y - 1) * 100),
      settling,
      rise: r10 !== null && r90 !== null ? r90 - r10 : null,
    };
  }

  // Textbook closed forms for 0 < ζ < 1, checked against MSU ME451 lecture 15 (J. Choi),
  // slides 9–12. Settling uses the 2 % approximation 4/(ζωn) (envelope e^(−ζωn t)
  // reaching e^(−4)); it is an estimate that can be above or below the simulated settling time
  // (within about ±25 % for 0.1 ≤ ζ ≤ 0.95, checked in tests/core.cjs).
  function formulas(zeta, wn) {
    // Outside 0 < ζ < 1 the formulas do not apply (no peak; 4/(ζωn) underestimates overdamped).
    if (!(zeta > 0 && zeta < 1)) return { overshoot: 0, peakTime: null, settling: null, wd: 0 };
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    return {
      overshoot: 100 * Math.exp(-zeta * Math.PI / Math.sqrt(1 - zeta * zeta)),
      peakTime: Math.PI / wd,
      settling: 4 / (zeta * wn),
      wd,
    };
  }

  // Poles of s² + 2ζωn s + ωn²: −ζωn ± ωn√(ζ² − 1).
  function poles(zeta, wn) {
    if (zeta < 1) {
      const im = wn * Math.sqrt(1 - zeta * zeta);
      return [{ re: -zeta * wn, im }, { re: -zeta * wn, im: -im }];
    }
    const d = wn * Math.sqrt(zeta * zeta - 1);
    return [{ re: -zeta * wn + d, im: 0 }, { re: -zeta * wn - d, im: 0 }];
  }

  function regime(zeta) {
    if (zeta <= 0) return 'undamped';
    if (Math.abs(zeta - 1) < 0.005) return 'critical';
    return zeta < 1 ? 'under' : 'over';
  }

  // Inverse of the overshoot formula: the ζ that gives a target overshoot (percent).
  function zetaForOvershoot(po) {
    const l = Math.log(po / 100);
    return -l / Math.sqrt(Math.PI * Math.PI + l * l);
  }

  const api = { simulate, metrics, formulas, poles, regime, zetaForOvershoot, DT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.STEP_RESPONSE = api;
})(typeof window !== 'undefined' ? window : globalThis);
