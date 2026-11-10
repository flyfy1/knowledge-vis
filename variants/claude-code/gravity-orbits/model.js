'use strict';
// Gravity and orbits model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trajectory, chart and readout on the page comes from here; tests/core.cjs pins the claims.
// Scope: Newtonian two-body motion around a fixed point-mass Earth, no air drag, no Earth rotation.
// Trajectories are integrated numerically (RK4); the closed forms are used only to check them.
(function (root) {
  const GM = 3.986e14, R = 6.371e6, G0 = GM / (R * R); // m³/s², m, m/s² (≈ 9.82)
  const TOWER = 1.0e6;          // step 1 launch altitude: a 1000 km thought-experiment tower
  const FRAME1 = 6 * R;         // step 1 frame: paths that pass 6 R⊕ are followed by the closed forms instead
  const MOON = { a: 3.844e8, T: 27.32 * 86400 }; // mean Earth–Moon distance, sidereal month
  const SIDEREAL_DAY = 86164;   // one turn of the Earth relative to the stars, s

  /* ---------- step 0: inverse square ---------- */
  const gAt = rR => G0 / (rR * rR);             // r in Earth radii
  const moonAccel = () => 4 * Math.PI * Math.PI * MOON.a / (MOON.T * MOON.T); // centripetal accel of the Moon

  /* ---------- numerical integration ---------- */
  function accel(x, y) { const r2 = x * x + y * y, r = Math.sqrt(r2), k = -GM / (r2 * r); return [k * x, k * y]; }
  // Launch at (0, r0) moving horizontally (+x) at speed v. Integrate until it hits the ground, completes one
  // revolution (cumulative angle 2π), escapes past rMax, or runs out of time. Returns sampled points with times.
  function fly(r0, v, opts = {}) {
    const dt = opts.dt || 2, rMax = opts.rMax || 12 * R, tMax = opts.tMax || 4e5, every = opts.every || 10;
    let x = 0, y = r0, vx = v, vy = 0, t = 0, ang = 0, prevA = Math.atan2(y, x);
    const pts = [{ x, y, t }], step = [];
    let vAtMin = v, vAtMax = v, rmin = r0, rmax = r0, outcome = 'timeout', tEnd = tMax, i = 0, area = 0;
    while (t < tMax) {
      const f = (X, Y, VX, VY) => { const a = accel(X, Y); return [VX, VY, a[0], a[1]]; };
      const k1 = f(x, y, vx, vy), k2 = f(x + dt / 2 * k1[0], y + dt / 2 * k1[1], vx + dt / 2 * k1[2], vy + dt / 2 * k1[3]);
      const k3 = f(x + dt / 2 * k2[0], y + dt / 2 * k2[1], vx + dt / 2 * k2[2], vy + dt / 2 * k2[3]);
      const k4 = f(x + dt * k3[0], y + dt * k3[1], vx + dt * k3[2], vy + dt * k3[3]);
      const nx = x + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), ny = y + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      vx += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]); vy += dt / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);
      const dA = 0.5 * Math.abs(x * ny - y * nx); // swept triangle (chord approximation of the sector)
      if (opts.slices) step.push({ t0: t, t1: t + dt, dA, dL: Math.hypot(nx - x, ny - y) });
      area += dA; x = nx; y = ny; t += dt; i++;
      const r = Math.hypot(x, y), a = Math.atan2(y, x); let d = a - prevA; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; ang += d; prevA = a;
      if (r < rmin) { rmin = r; vAtMin = Math.hypot(vx, vy); } if (r > rmax) { rmax = r; vAtMax = Math.hypot(vx, vy); }
      if (i % every === 0) pts.push({ x, y, t });
      if (r <= R) { // hit the ground: interpolate back to r = R
        const p = pts[pts.length - 1]; if (p.t !== t) pts.push({ x, y, t });
        outcome = 'ground'; tEnd = t; break;
      }
      if (-ang >= 2 * Math.PI) { outcome = 'orbit'; // moving +x at the top means clockwise: angle decreases
        const over = (-ang - 2 * Math.PI) / Math.abs(d); tEnd = t - over * dt; pts.push({ x, y, t }); break; }
      if (r >= rMax) { outcome = 'escape'; tEnd = t; pts.push({ x, y, t }); break; }
    }
    const res = { r0, v, pts, outcome, tEnd, rmin, rmax, vAtMin, vAtMax, area, steps: step, vEnd: Math.hypot(vx, vy) };
    if (outcome === 'ground') {
      const last = pts[pts.length - 1], ground = R * Math.abs(Math.atan2(last.x, last.y)); // arc from the launch point
      res.groundKm = ground / 1e3; res.flightAng = Math.abs(Math.atan2(last.x, last.y));
    }
    if (outcome === 'orbit') { res.T = tEnd; res.a = (rmin + rmax) / 2; }
    return res;
  }

  /* ---------- closed forms (checks and thresholds) ---------- */
  const vCirc = r => Math.sqrt(GM / r);
  const vEsc = r => Math.sqrt(2 * GM / r);
  // Horizontal launch at r0 with speed v: the other turning radius of the conic (periapsis or apoapsis).
  function otherTurn(r0, v) { const den = 2 * GM - v * v * r0; return den <= 0 ? Infinity : v * v * r0 * r0 / den; }
  // Slowest horizontal speed at r0 that never dips below the ground: periapsis = R.
  const vGraze = r0 => Math.sqrt(2 * GM * R / (r0 * (r0 + R)));
  const periodOf = a => 2 * Math.PI * Math.sqrt(a * a * a / GM);
  const aForPeriod = T => Math.cbrt(GM * T * T / (4 * Math.PI * Math.PI));
  function classify(r0, v) {
    if (v >= vEsc(r0)) return 'escape';
    if (v < vGraze(r0)) return 'ground';
    if (Math.abs(v - vCirc(r0)) < 1e-9) return 'circle';
    return 'ellipse';
  }

  /* ---------- step 2: straight up, with and without the inverse square ---------- */
  // Energy per kg: ½v² − GM/R = −GM/r_top. Constant-g estimate: h = v²/(2g₀).
  function riseTrue(v) { const inv = 1 / R - v * v / (2 * GM); return inv <= 0 ? Infinity : 1 / inv - R; }
  const riseFlat = v => v * v / (2 * G0);
  const U = r => -GM / r;                       // potential energy per kg
  const Uflat = r => -GM / R + G0 * (r - R);    // the straight line a constant g would give

  /* ---------- step 3: equal areas in equal times ---------- */
  function wedges(r0, v, n = 12) {
    const f = fly(r0, v, { dt: 1, slices: true, every: 20, tMax: 2e5, rMax: 40 * R });
    if (f.outcome !== 'orbit') return null;
    const T = f.T, areas = new Array(n).fill(0), lens = new Array(n).fill(0);
    for (const s of f.steps) { if (s.t0 >= T) break; const mid = (s.t0 + s.t1) / 2, k = Math.min(n - 1, Math.floor(mid / T * n)), w = Math.min(1, (T - s.t0) / (s.t1 - s.t0)); areas[k] += s.dA * w; lens[k] += s.dL * w; }
    const meanL = lens.reduce((a, b) => a + b, 0) / n;
    const mean = areas.reduce((a, b) => a + b, 0) / n, spread = (Math.max(...areas) - Math.min(...areas)) / mean;
    return { fly: f, T, areas, lens, mean, meanL, spread, lenRatio: Math.max(...lens) / Math.min(...lens), rp: f.rmin, ra: f.rmax, vp: f.vAtMin, va: f.vAtMax, ellipseArea: Math.PI * (f.rmin + f.rmax) / 2 * Math.sqrt(f.rmin * f.rmax) };
  }

  /* ---------- step 4: Kepler's third law from simulated orbits ---------- */
  function measureOrbit(altKm, vRatio) {
    const r0 = R + altKm * 1e3, v = vRatio * vCirc(r0);
    const f = fly(r0, v, { dt: Math.max(1, Math.sqrt(r0 * r0 * r0 / GM) / 800), every: 4, tMax: 5e6, rMax: 1e3 * R });
    if (f.outcome !== 'orbit' || f.rmin <= R) return { ok: false, f };
    return { ok: true, f, T: f.T, a: f.a, ratio: f.T * f.T / (f.a * f.a * f.a), law: 4 * Math.PI * Math.PI / GM };
  }

  /* ---------- step 5: circular satellites ---------- */
  const SATS = [
    { key: 'satISS', alt: 420e3 }, { key: 'satGPS', alt: 20200e3 }, { key: 'satGEO', alt: aForPeriod(SIDEREAL_DAY) - R }, { key: 'satMoon', alt: MOON.a - R }
  ];
  function circular(altM) { const a = R + altM; return { a, T: periodOf(a), v: vCirc(a) }; }

  const api = { GM, R, G0, TOWER, FRAME1, MOON, SIDEREAL_DAY, gAt, moonAccel, fly, vCirc, vEsc, otherTurn, vGraze, periodOf, aForPeriod, classify,
    riseTrue, riseFlat, U, Uflat, wedges, measureOrbit, SATS, circular };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ORBIT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
