'use strict';
// Electric field lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, line, contour and readout on the page is computed here; tests/core.cjs pins the claims.
// Model: point charges fixed in vacuum (SI units, Coulomb's law in 3-D space). The page draws the plane z = 0
// through the charges. Test charges are assumed too small to move the sources.
(function (root) {
  const K = 8.9875517923e9;          // N·m²/C², Coulomb constant
  const EPS0 = 1 / (4 * Math.PI * K); // F/m
  const E_CHARGE = 1.602176634e-19;  // C
  const M_E = 9.1093837015e-31;      // kg
  const nC = 1e-9, cm = 0.01;

  // charges: [{q (C), x (m), y (m), z? (m)}]; field at (x, y, z) in N/C (= V/m), potential in V.
  function field(charges, x, y, z = 0) {
    let Ex = 0, Ey = 0, Ez = 0;
    for (const c of charges) {
      const dx = x - c.x, dy = y - c.y, dz = z - (c.z || 0), r2 = dx * dx + dy * dy + dz * dz;
      if (r2 === 0) continue;
      const s = K * c.q / (r2 * Math.sqrt(r2));
      Ex += s * dx; Ey += s * dy; Ez += s * dz;
    }
    return { Ex, Ey, Ez, E: Math.hypot(Ex, Ey, Ez) };
  }
  function potential(charges, x, y, z = 0) {
    let V = 0;
    for (const c of charges) { const r = Math.hypot(x - c.x, y - c.y, z - (c.z || 0)); if (r > 0) V += K * c.q / r; }
    return V;
  }
  const pointE = (q, r) => K * Math.abs(q) / (r * r);

  // ---- field lines (plane z = 0) ----
  // Follow the unit field direction with RK4 (dir = +1 along E, −1 against E). Stops on reaching another
  // charge (within rStop), leaving the box, or after maxSteps.
  function traceLine(charges, x0, y0, dir, opt = {}) {
    const rStop = opt.rStop || 0.004, box = opt.box || 2, maxSteps = opt.maxSteps || 6000, from = opt.from;
    const pts = [[x0, y0]];
    const unit = (x, y) => { const e = field(charges, x, y); return e.E > 0 ? [dir * e.Ex / e.E, dir * e.Ey / e.E] : [0, 0]; };
    let x = x0, y = y0;
    for (let i = 0; i < maxSteps; i++) {
      let dmin = Infinity;
      charges.forEach(c => { dmin = Math.min(dmin, Math.hypot(x - c.x, y - c.y)); });
      const h = Math.max(2e-5, Math.min(0.01, 0.05 * dmin));
      const k1 = unit(x, y), k2 = unit(x + h / 2 * k1[0], y + h / 2 * k1[1]), k3 = unit(x + h / 2 * k2[0], y + h / 2 * k2[1]), k4 = unit(x + h * k3[0], y + h * k3[1]);
      x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      pts.push([x, y]);
      for (let j = 0; j < charges.length; j++) {
        if (j === from) continue;
        if (Math.hypot(x - charges[j].x, y - charges[j].y) < rStop) return { pts, end: j };
      }
      if (Math.abs(x) > box || Math.abs(y) > box) return { pts, end: -1 };
    }
    return { pts, end: -2 };
  }

  // Start angles measured from the axis toward the partner charge. Each line in a half-plane carries the same
  // share of the charge's (3-D) flux, so 1 − cos φ is evenly spaced: φ_j = acos(1 − 2(j + ½)/n).
  function startAngles(n) { const a = []; for (let j = 0; j < n; j++) a.push(Math.acos(1 - 2 * (j + 0.5) / n)); return a; }
  const LINES_PER_NC = 4; // per half-plane (8 per nC in the whole picture)

  // Two charges on the x axis: [{q, x, y: 0}, {q, x, y: 0}]. Returns traced lines (both half-planes) and counts.
  function fieldLines(charges, perNC = LINES_PER_NC) {
    const lines = [], qn = charges.map(c => c.q / nC), n = qn.map(q => Math.round(perNC * Math.abs(q)));
    const sources = [];
    const opposite = qn[0] * qn[1] < 0;
    if (opposite) sources.push(Math.abs(qn[0]) >= Math.abs(qn[1]) ? 0 : 1);
    else { if (n[0]) sources.push(0); if (n[1]) sources.push(1); }
    let landed = 0, escaped = 0;
    for (const i of sources) {
      const me = charges[i], other = charges[1 - i];
      const ax = other.x === me.x && n[1 - i] === 0 ? 1 : Math.sign(other.x - me.x) || 1; // axis direction
      const dir = qn[i] > 0 ? 1 : -1, r0 = 0.004;
      for (const phi of startAngles(n[i])) for (const side of [1, -1]) {
        const x0 = me.x + r0 * ax * Math.cos(phi), y0 = me.y + r0 * side * Math.sin(phi);
        const L = traceLine(charges, x0, y0, dir, { from: i });
        L.from = i; L.side = side; lines.push(L);
        if (L.end === 1 - i) landed++; else escaped++;
      }
    }
    return { lines, sources, landed, escaped, n };
  }

  // ---- parallel plates built from point charges (3-D): two square sheets in the planes y = ±gap/2 ----
  // Each plate is an N × N grid of equal point charges at cell centres over x, z ∈ [−a, a]; totals +Q and −Q.
  function plates(N, Q, a, gap) {
    const out = [], q = Q / (N * N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = -a + (2 * a) * (i + 0.5) / N, z = -a + (2 * a) * (j + 0.5) / N;
      out.push({ q, x, y: gap / 2, z }, { q: -q, x, y: -gap / 2, z });
    }
    return out;
  }
  // Uniformity in the central region |x| ≤ a/2, |y| ≤ gap/4 (z = 0): largest deviation of the field from its
  // centre value (vector difference ÷ centre magnitude), plus the field just outside and the ideal σ/ε₀.
  function plateStats(N, Q, a, gap) {
    const ch = plates(N, Q, a, gap), c0 = field(ch, 0, 0, 0);
    let dev = 0;
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 4; j++) {
      const x = -a / 2 + a * i / 8, y = -gap / 4 + gap / 2 * j / 4, e = field(ch, x, y, 0);
      dev = Math.max(dev, Math.hypot(e.Ex - c0.Ex, e.Ey - c0.Ey) / c0.E);
    }
    const out = field(ch, 0, gap, 0); // gap/2 outside the top plate
    const ideal = Q / (4 * a * a) / EPS0;
    return { E0: c0.E, Ey0: c0.Ey, dev, outside: out.E, ideal, ratio: c0.E / ideal };
  }

  // ---- an electron through a uniform field (plates gap d, length L, screen D beyond the plates) ----
  // Upper plate at +U (relative to the lower one), so E points down and the electron is pushed up.
  function deflect(U, v0, d, L, D) {
    const a = E_CHARGE * U / (M_E * d);              // m/s², upward
    const tIn = L / v0, y1 = a * tIn * tIn / 2, vy = a * tIn, tanPhi = vy / v0;
    // does it hit the upper plate (y = d/2, entering on the centre line)?
    const xHit = a > 0 ? v0 * Math.sqrt(d / a) : Infinity; // y = a x²/(2 v0²) = d/2
    const hit = xHit < L;
    const Y = y1 + D * tanPhi;
    return { a, tIn, y1, vy, tanPhi, Y, hit, xHit, gainEV: U * (y1 / d) };
  }
  // path y(x) for drawing (x from 0 to L + D, or to the plate hit)
  function deflectPath(U, v0, d, L, D, n = 120) {
    const r = deflect(U, v0, d, L, D), pts = [], xEnd = r.hit ? r.xHit : L + D;
    for (let i = 0; i <= n; i++) {
      const x = xEnd * i / n;
      const y = x <= L ? r.a * x * x / (2 * v0 * v0) : r.y1 + (x - L) * r.tanPhi;
      pts.push([x, y]);
    }
    return { pts, ...r };
  }

  const api = { K, EPS0, E_CHARGE, M_E, nC, cm, field, potential, pointE, traceLine, startAngles, LINES_PER_NC, fieldLines, plates, plateStats, deflect, deflectPath };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EF_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
