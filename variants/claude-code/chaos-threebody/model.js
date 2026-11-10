'use strict';
// Chaos and the three-body problem — lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Every curve, point and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  /* ---------- logistic map x → r x (1 − x) ---------- */
  const logistic = (r, x) => r * x * (1 - x);
  function orbit(r, x0, n) { const o = [x0]; let x = x0; for (let i = 0; i < n; i++) { x = logistic(r, x); o.push(x); } return o; }
  // The same iteration with every operation rounded to 32-bit floats (about 7 significant digits).
  function orbit32(r, x0, n) { const R = Math.fround(r); let y = Math.fround(x0); const o = [y]; for (let i = 0; i < n; i++) { y = Math.fround(R * Math.fround(y * Math.fround(1 - y))); o.push(y); } return o; }
  // First index where two sequences differ by more than tol (null if never within the length).
  function splitAt(a, b, tol = 0.1) { for (let i = 0; i < Math.min(a.length, b.length); i++) if (Math.abs(a[i] - b[i]) > tol) return i; return null; }
  // Lyapunov exponent: average of ln|f'(x)| = ln|r(1 − 2x)| along the orbit (natural-log units per step).
  function lyapunov(r, x0 = 0.4, skip = 300, n = 3000) {
    let x = x0; for (let i = 0; i < skip; i++) x = logistic(r, x);
    let s = 0; for (let i = 0; i < n; i++) { s += Math.log(Math.max(1e-300, Math.abs(r * (1 - 2 * x)))); x = logistic(r, x); }
    return s / n;
  }
  // Long-term values (for the bifurcation diagram and the period count).
  function longTerm(r, x0 = 0.4, skip = 500, n = 128) { let x = x0; for (let i = 0; i < skip; i++) x = logistic(r, x); const o = []; for (let i = 0; i < n; i++) { x = logistic(r, x); o.push(x); } return o; }
  function periodOf(r) { const v = longTerm(r); for (let p = 1; p <= 32; p++) { let ok = true; for (let i = p; i < v.length; i++) if (Math.abs(v[i] - v[i - p]) > 1e-6) { ok = false; break; } if (ok) return p; } return null; }

  /* ---------- Lorenz system ---------- */
  const SIGMA = 10, BETA = 8 / 3, RHO_HOPF = 24.74, LORENZ_LAMBDA = 0.9056, DT = 0.005;
  const lorenzF = (s, rho) => [SIGMA * (s[1] - s[0]), s[0] * (rho - s[2]) - s[1], s[0] * s[1] - BETA * s[2]];
  function lorenzStep(s, rho, h = DT) {
    const a = lorenzF(s, rho), b = lorenzF(s.map((v, i) => v + h / 2 * a[i]), rho), c = lorenzF(s.map((v, i) => v + h / 2 * b[i]), rho), d = lorenzF(s.map((v, i) => v + h * c[i]), rho);
    return s.map((v, i) => v + h / 6 * (a[i] + 2 * b[i] + 2 * c[i] + d[i]));
  }
  const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  // Two runs from (1, 1, 1) and (1 + δ, 1, 1); sampled every `every` time units.
  function lorenzTwin(rho, delta, T = 30, every = 0.02, start = [1, 1, 1]) {
    let a = start.slice(), b = start.slice(); b[0] += delta;
    const per = Math.round(every / DT), A = [a], Bt = [b], sep = [dist3(a, b)];
    const steps = Math.round(T / DT);
    for (let i = 1; i <= steps; i++) { a = lorenzStep(a, rho); b = lorenzStep(b, rho); if (i % per === 0) { A.push(a); Bt.push(b); sep.push(dist3(a, b)); } }
    return { A, B: Bt, sep, every };
  }
  // A point on the ρ = 28 attractor: (1, 1, 1) run for 20 time units.
  const ATTRACTOR_START = (() => { let s = [1, 1, 1]; for (let i = 0; i < 20 / DT; i++) s = lorenzStep(s, 28); return s; })();
  // Prediction horizon: time until two runs that start 10^−k apart differ by more than 1.
  function horizon(k, rho = 28, Tmax = 80) {
    let a = ATTRACTOR_START.slice(), b = ATTRACTOR_START.slice(); b[0] += Math.pow(10, -k);
    for (let i = 1; i <= Tmax / DT; i++) { a = lorenzStep(a, rho); b = lorenzStep(b, rho); if (dist3(a, b) > 1) return i * DT; }
    return null;
  }
  function fitLine(pts) { const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n; const sl = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0); return { slope: sl, icpt: my - sl * mx }; }
  function lorenzRegime(rho) { return rho < 1 ? 'origin' : rho < 24.06 ? 'steady' : rho < RHO_HOPF ? 'mixed' : 'chaos'; }

  /* ---------- three equal stars (G = m = 1), planar ---------- */
  const SOFT = 0.01;   // gravity softened at very close range (distance² + 0.01²) so close passes stay accurate
  function accel(y) {
    const a = new Float64Array(6); let rmin = Infinity;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      const dx = y[2 * j] - y[2 * i], dy = y[2 * j + 1] - y[2 * i + 1], r2 = dx * dx + dy * dy, q = r2 + SOFT * SOFT, f = 1 / (q * Math.sqrt(q));
      rmin = Math.min(rmin, Math.sqrt(r2));
      a[2 * i] += dx * f; a[2 * i + 1] += dy * f; a[2 * j] -= dx * f; a[2 * j + 1] -= dy * f;
    }
    return { a, rmin };
  }
  function deriv(y) { const { a } = accel(y), d = new Float64Array(12); for (let k = 0; k < 6; k++) { d[k] = y[6 + k]; d[6 + k] = a[k]; } return d; }
  function rk4(y, h) {
    const k1 = deriv(y), t = new Float64Array(12);
    for (let i = 0; i < 12; i++) t[i] = y[i] + h / 2 * k1[i]; const k2 = deriv(t);
    for (let i = 0; i < 12; i++) t[i] = y[i] + h / 2 * k2[i]; const k3 = deriv(t);
    for (let i = 0; i < 12; i++) t[i] = y[i] + h * k3[i]; const k4 = deriv(t);
    const o = new Float64Array(12); for (let i = 0; i < 12; i++) o[i] = y[i] + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]); return o;
  }
  function energy(y) {
    let K = 0, U = 0; for (let i = 0; i < 3; i++) K += 0.5 * (y[6 + 2 * i] ** 2 + y[7 + 2 * i] ** 2);
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) U -= 1 / Math.sqrt((y[2 * j] - y[2 * i]) ** 2 + (y[2 * j + 1] - y[2 * i + 1]) ** 2 + SOFT * SOFT);
    return K + U;
  }
  // Figure-eight orbit of Chenciner & Montgomery (2000), 8 digits; ε nudges the middle star sideways.
  const F8 = { x1: 0.97000436, y1: -0.24308753, vx3: -0.93240737, vy3: -0.86473146, period: 6.3259 };
  function eightStart(eps) { const { x1, y1, vx3, vy3 } = F8; return Float64Array.from([x1, y1, -x1, -y1, eps, 0, -vx3 / 2, -vy3 / 2, -vx3 / 2, -vy3 / 2, vx3, vy3]); }
  // Adaptive RK4: base step 0.002, shrunk as (closest distance / 0.4)^1.5 during close passes; output every 0.02.
  function threeBody(eps, T = 60, every = 0.02, base = 0.002) {
    let y = eightStart(eps); const E0 = energy(y), out = [y]; let rmin = Infinity, drift = 0;
    for (let i = 0; i < Math.round(T / every); i++) {
      let left = every;
      while (left > 1e-12) { const r = accel(y).rmin; rmin = Math.min(rmin, r); let h = Math.max(1e-6, base * Math.min(1, Math.pow(r / 0.4, 1.5))); if (h > left) h = left; y = rk4(y, h); left -= h; }
      out.push(y); drift = Math.max(drift, Math.abs((energy(y) - E0) / E0));
    }
    return { out, every, rmin, drift, E0 };
  }
  const TWIN = 1e-8;
  // Largest coordinate difference between two runs at each output time.
  function gap(a, b) { return a.out.map((y, i) => { let d = 0; for (let k = 0; k < 6; k++) d = Math.max(d, Math.abs(y[k] - b.out[i][k])); return d; }); }
  function maxRadius(run) { let m = 0; for (const y of run.out) for (let i = 0; i < 3; i++) m = Math.max(m, Math.hypot(y[2 * i], y[2 * i + 1])); return m; }

  const api = { logistic, orbit, orbit32, splitAt, lyapunov, longTerm, periodOf, SIGMA, BETA, RHO_HOPF, LORENZ_LAMBDA, DT, lorenzStep, lorenzTwin, dist3, ATTRACTOR_START, horizon, fitLine, lorenzRegime, SOFT, accel, energy, F8, eightStart, threeBody, TWIN, gap, maxRadius };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CHAOS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
