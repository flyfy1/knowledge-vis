'use strict';
// Reaction-rates model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A 2-D hard-disc gas in a box. A–B collisions are counted; a collision "succeeds" when the kinetic energy of the
// approach along the line of centres, ½·μ·v_n², reaches the bar E0. All energies are in units of kT at 300 K.
// Every number on the page comes from here (measured from the simulation or from the closed forms below);
// tests/core.cjs pins the claims.
(function (root) {
  const BOX = { w: 400, h: 260 };
  const R = 3.5;                 // disc radius (model units); collision distance 2R
  const M = 1;                   // every particle has the same mass
  const SIGMA300 = 80;           // per-axis speed spread at 300 K (units/s): σ² = kT/m
  const KT300 = M * SIGMA300 * SIGMA300;
  const DT = 1 / 120;
  const E0_DEFAULT = 2;          // bar in units of kT(300 K)
  const R_GAS = 8.314;           // J/(mol·K), for the real-units step

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rand) { let u = 0; while (u === 0) u = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()); }
  const sigmaAt = T => Math.sqrt(KT300 * (T / 300) / M);

  // ---- closed forms ----
  // Fraction of collisions whose line-of-centres energy reaches E0 (flux-weighted 1-D normal component): exp(−E0/kT).
  const successFraction = (e0, T) => Math.exp(-e0 * 300 / T);
  // Dilute-gas A–B collision rate in 2-D: Z = nA·nB·Area · (2d) · ⟨|v_rel|⟩, ⟨|v_rel|⟩ = σ·√π (σ per axis, equal masses).
  const collisionRate = (nA, nB, T, area = BOX.w * BOX.h) => nA * nB / area * (4 * R) * sigmaAt(T) * Math.sqrt(Math.PI);
  // Gas A hitting fixed discs: per exposed disc, flux onto a disc of radius 2R from a gas of density n: n·(2·2R)·⟨|v|⟩/π·… — not used
  // directly; the surface-area step compares measured hits with the exposed count instead.
  const meanSpeed = T => sigmaAt(T) * Math.sqrt(Math.PI / 2);

  // ---- gas simulation (steps 0–3) ----
  function makeGas({ nA = 30, nB = 30, T = 300, e0 = E0_DEFAULT, seed = 1 } = {}) {
    const rand = mulberry32(seed), n = nA + nB, g = {
      n, nA, nB, T, e0, rand, t: 0, x: new Float64Array(n), y: new Float64Array(n), vx: new Float64Array(n), vy: new Float64Array(n),
      kind: new Uint8Array(n), flash: new Float64Array(n).fill(-1e9), flashOk: new Uint8Array(n),
      coll: 0, ok: 0, energies: [], log: [] // log: per-tick [collisions, successes]
    };
    for (let i = 0; i < n; i++) {
      g.kind[i] = i < nA ? 0 : 1;
      let tries = 0;
      do { g.x[i] = R + rand() * (BOX.w - 2 * R); g.y[i] = R + rand() * (BOX.h - 2 * R); tries++; }
      while (tries < 200 && overlaps(g, i));
    }
    thermalise(g, T);
    return g;
  }
  function overlaps(g, i) { for (let j = 0; j < i; j++) { const dx = g.x[i] - g.x[j], dy = g.y[i] - g.y[j]; if (dx * dx + dy * dy < 4 * R * R) return true; } return false; }
  // Draw fresh velocities at temperature T (the page's thermostat when T changes).
  function thermalise(g, T) {
    const s = sigmaAt(T); g.T = T;
    for (let i = 0; i < g.n; i++) { g.vx[i] = s * gauss(g.rand); g.vy[i] = s * gauss(g.rand); }
    // rescale so the sample's mean kinetic energy is exactly kT (a small sample would otherwise sit a few % off)
    const k = Math.sqrt(T / measuredT(g)); for (let i = 0; i < g.n; i++) { g.vx[i] *= k; g.vy[i] *= k; }
  }
  // Temperature read back from the particles: in 2-D, ⟨KE⟩ = kT.
  function measuredT(g) { let ke = 0; for (let i = 0; i < g.n; i++) ke += 0.5 * M * (g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i]); return ke / g.n / KT300 * 300; }
  function meanSpeedOf(g) { let s = 0; for (let i = 0; i < g.n; i++) s += Math.hypot(g.vx[i], g.vy[i]); return s / g.n; }

  function stepGas(g, dt = DT, now = 0) {
    const { x, y, vx, vy, n } = g;
    for (let i = 0; i < n; i++) {
      x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      if (x[i] < R) { x[i] = 2 * R - x[i]; vx[i] = Math.abs(vx[i]); } else if (x[i] > BOX.w - R) { x[i] = 2 * (BOX.w - R) - x[i]; vx[i] = -Math.abs(vx[i]); }
      if (y[i] < R) { y[i] = 2 * R - y[i]; vy[i] = Math.abs(vy[i]); } else if (y[i] > BOX.h - R) { y[i] = 2 * (BOX.h - R) - y[i]; vy[i] = -Math.abs(vy[i]); }
    }
    let coll = 0, ok = 0; const d2 = 4 * R * R, mu = M / 2, kt = KT300;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = x[j] - x[i], dy = y[j] - y[i], r2 = dx * dx + dy * dy;
      if (r2 >= d2 || r2 === 0) continue;
      const dvx = vx[j] - vx[i], dvy = vy[j] - vy[i], dot = dvx * dx + dvy * dy;
      if (dot >= 0) continue; // already separating
      // Rewind the pair to the moment of contact (|p + v·τ| = 2R, τ ≤ 0) so the line of centres is the true one;
      // otherwise fast pairs are caught deep in overlap with a too-glancing normal and their energy is underestimated.
      const vv = dvx * dvx + dvy * dvy, tau = (-dot - Math.sqrt(Math.max(0, dot * dot - vv * (r2 - d2)))) / vv; // ≤ 0
      const cx = dx + dvx * tau, cy = dy + dvy * tau, nx = cx / (2 * R), ny = cy / (2 * R);
      const vn = dvx * nx + dvy * ny; // < 0: approach speed along centres
      if (g.kind[i] !== g.kind[j]) {
        const e = 0.5 * mu * vn * vn / kt; // line-of-centres energy in kT(300 K)
        const success = e >= g.e0;
        coll++; if (success) ok++;
        g.energies.push(e); if (g.energies.length > 600) g.energies.shift();
        g.flash[i] = g.flash[j] = now; g.flashOk[i] = g.flashOk[j] = success ? 1 : 0;
      }
      // move both back to contact, exchange the normal components (equal masses), then replay the rewound time
      x[i] += vx[i] * tau; y[i] += vy[i] * tau; x[j] += vx[j] * tau; y[j] += vy[j] * tau;
      vx[i] += vn * nx; vy[i] += vn * ny; vx[j] -= vn * nx; vy[j] -= vn * ny;
      x[i] -= vx[i] * tau; y[i] -= vy[i] * tau; x[j] -= vx[j] * tau; y[j] -= vy[j] * tau;
    }
    g.coll += coll; g.ok += ok; g.t += dt; g.log.push([coll, ok]);
    if (g.log.length > 120 * 30) g.log.shift();
    return { coll, ok };
  }
  // Rates over the last `seconds` of the log.
  function windowRates(g, seconds, dt = DT) {
    const k = Math.min(g.log.length, Math.round(seconds / dt)); let c = 0, o = 0;
    for (let i = g.log.length - k; i < g.log.length; i++) { c += g.log[i][0]; o += g.log[i][1]; }
    const span = k * dt || 1; return { coll: c / span, ok: o / span, frac: c ? o / c : 0, span };
  }
  // Long seeded run for tests: returns collision rate, success rate, success fraction.
  function measureGas(opts, seconds, burn = 2) {
    const g = makeGas(opts); for (let i = 0; i < burn / DT; i++) stepGas(g);
    const c0 = g.coll, o0 = g.ok, steps = Math.round(seconds / DT);
    for (let i = 0; i < steps; i++) stepGas(g);
    const c = g.coll - c0, o = g.ok - o0; return { coll: c / seconds, ok: o / seconds, frac: o / c, T: measuredT(g), speed: meanSpeedOf(g) };
  }

  // ---- surface area (step 4): one solid of 6×6 B molecules, cut into square pieces of side 6, 3, 2 or 1 molecules ----
  // Pieces are flat-faced squares (a molecule is CELL wide); the gas A molecules are small (radius RG) and do not hit
  // each other here (a dilute gas), so only hits on the solid count.
  const SOLID_SIDE = 6, CELL = 14, RG = 1.5, PIECES = [6, 3, 2, 1];
  function pieceLayout(piece) {
    const per = SOLID_SIDE / piece, count = per * per, cols = per, rows = per;
    const cellW = BOX.w / cols, cellH = BOX.h / rows, L = piece * CELL, out = [];
    for (let p = 0; p < count; p++) out.push({ cx: (p % cols + 0.5) * cellW, cy: (Math.floor(p / cols) + 0.5) * cellH, L, side: piece });
    return out;
  }
  // Molecules of the solid; a molecule is exposed when it sits on its piece's edge (a lattice neighbour is missing).
  function solidSites(piece) {
    const sites = [];
    pieceLayout(piece).forEach((P, p) => { for (let a = 0; a < piece; a++) for (let b = 0; b < piece; b++)
      sites.push({ x: P.cx + (a - (piece - 1) / 2) * CELL, y: P.cy + (b - (piece - 1) / 2) * CELL, piece: p, a, b, size: piece }); });
    return sites;
  }
  const exposed = q => q.a === 0 || q.b === 0 || q.a === q.size - 1 || q.b === q.size - 1;
  const exposedCount = piece => solidSites(piece).filter(exposed).length;
  // Total outer edge of all pieces, in molecule widths: (6/side)² pieces × 4·side.
  const perimeter = piece => (SOLID_SIDE / piece) ** 2 * 4 * piece;

  function makeSolid({ piece = 6, nA = 60, T = 300, e0 = E0_DEFAULT, seed = 5 } = {}) {
    const rand = mulberry32(seed), pieces = pieceLayout(piece), sites = solidSites(piece);
    const s = { piece, pieces, sites, hits: new Float64Array(sites.length), nA, T, e0, rand, t: 0,
      x: new Float64Array(nA), y: new Float64Array(nA), vx: new Float64Array(nA), vy: new Float64Array(nA), flash: new Float64Array(nA).fill(-1e9), flashOk: new Uint8Array(nA), coll: 0, ok: 0, log: [] };
    const inside = (x, y) => pieces.some(P => Math.abs(x - P.cx) < P.L / 2 + RG && Math.abs(y - P.cy) < P.L / 2 + RG);
    for (let i = 0; i < nA; i++) {
      let tries = 0;
      do { s.x[i] = RG + rand() * (BOX.w - 2 * RG); s.y[i] = RG + rand() * (BOX.h - 2 * RG); tries++; } while (inside(s.x[i], s.y[i]) && tries < 500);
      const sg = sigmaAt(T); s.vx[i] = sg * gauss(rand); s.vy[i] = sg * gauss(rand);
    }
    let ke = 0; for (let i = 0; i < nA; i++) ke += 0.5 * M * (s.vx[i] ** 2 + s.vy[i] ** 2);
    const k = Math.sqrt(KT300 * T / 300 / (ke / nA)); for (let i = 0; i < nA; i++) { s.vx[i] *= k; s.vy[i] *= k; }
    return s;
  }
  // Index (in s.sites) of the edge molecule nearest to a hit at (hx, hy) on piece p.
  function siteAt(s, p, hx, hy) {
    const P = s.pieces[p], n = P.side, a = Math.max(0, Math.min(n - 1, Math.round((hx - P.cx) / CELL + (n - 1) / 2))), b = Math.max(0, Math.min(n - 1, Math.round((hy - P.cy) / CELL + (n - 1) / 2)));
    return p * n * n + a * n + b;
  }
  function stepSolid(s, dt = DT, now = 0) {
    const { x, y, vx, vy, nA, pieces } = s; let coll = 0, ok = 0;
    for (let i = 0; i < nA; i++) {
      x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      // Container walls are a heat bath at T: a molecule leaves a wall with fresh thermal velocity (normal part
      // flux-weighted, Rayleigh; tangential part Gaussian). Without gas–gas collisions this is what keeps the gas Maxwellian.
      const sg = sigmaAt(s.T), out = () => sg * Math.sqrt(-2 * Math.log(1 - s.rand())), tan = () => sg * gauss(s.rand);
      if (x[i] < RG) { x[i] = RG; vx[i] = out(); vy[i] = tan(); } else if (x[i] > BOX.w - RG) { x[i] = BOX.w - RG; vx[i] = -out(); vy[i] = tan(); }
      if (y[i] < RG) { y[i] = RG; vy[i] = out(); vx[i] = tan(); } else if (y[i] > BOX.h - RG) { y[i] = BOX.h - RG; vy[i] = -out(); vx[i] = tan(); }
      for (let p = 0; p < pieces.length; p++) {
        const P = pieces[p], h = P.L / 2 + RG, dx = x[i] - P.cx, dy = y[i] - P.cy;
        if (Math.abs(dx) >= h || Math.abs(dy) >= h) continue;
        // which face was crossed most recently? (time since crossing = depth / inward speed)
        const tx = vx[i] * dx < 0 ? (h - Math.abs(dx)) / Math.abs(vx[i]) : Infinity, ty = vy[i] * dy < 0 ? (h - Math.abs(dy)) / Math.abs(vy[i]) : Infinity;
        const onX = tx <= ty, tau = -(onX ? tx : ty);
        if (!isFinite(tau)) continue;
        const vn = onX ? vx[i] : vy[i], e = 0.5 * M * vn * vn / KT300, success = e >= s.e0;
        coll++; if (success) ok++;
        const hx = x[i] + vx[i] * tau, hy = y[i] + vy[i] * tau; s.hits[siteAt(s, p, hx, hy)]++;
        s.flash[i] = now; s.flashOk[i] = success ? 1 : 0;
        if (onX) { x[i] = hx; vx[i] = -vx[i]; x[i] -= vx[i] * tau; } else { y[i] = hy; vy[i] = -vy[i]; y[i] -= vy[i] * tau; }
      }
    }
    s.coll += coll; s.ok += ok; s.t += dt; s.log.push([coll, ok]); if (s.log.length > 120 * 30) s.log.shift();
    return { coll, ok };
  }
  function measureSolid(opts, seconds) {
    const s = makeSolid(opts); for (let i = 0; i < 120; i++) stepSolid(s);
    const c0 = s.coll, o0 = s.ok; for (let i = 0; i < Math.round(seconds / DT); i++) stepSolid(s);
    const interiorHits = s.sites.reduce((a, q, k) => a + (exposed(q) ? 0 : s.hits[k]), 0);
    return { coll: (s.coll - c0) / seconds, ok: (s.ok - o0) / seconds, frac: (s.ok - o0) / (s.coll - c0), interiorHits };
  }

  // ---- real units (step 5): Arrhenius-type factor and the collision-frequency factor ----
  const fractionRatio = (EaKJ, T1, T2) => Math.exp(EaKJ * 1000 / R_GAS * (1 / T1 - 1 / T2));
  const collisionRatio = (T1, T2) => Math.sqrt(T2 / T1);
  const rateRatio = (EaKJ, T1, T2) => fractionRatio(EaKJ, T1, T2) * collisionRatio(T1, T2);
  // Ea (kJ/mol) that the sim's bar e0 (units of kT at 300 K) stands for.
  const e0ToKJ = e0 => e0 * R_GAS * 300 / 1000;

  const api = { BOX, R, DT, KT300, SIGMA300, E0_DEFAULT, R_GAS, mulberry32, sigmaAt, successFraction, collisionRate, meanSpeed,
    makeGas, thermalise, measuredT, meanSpeedOf, stepGas, windowRates, measureGas,
    SOLID_SIDE, CELL, RG, PIECES, pieceLayout, solidSites, exposed, exposedCount, perimeter, makeSolid, stepSolid, measureSolid,
    fractionRatio, collisionRatio, rateRatio, e0ToKJ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RATES_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
