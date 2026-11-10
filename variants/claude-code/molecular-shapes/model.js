'use strict';
// Molecular shapes (VSEPR) lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Electron domains are equal-or-weighted point charges held on a unit sphere around the central atom;
// they repel with Coulomb energy E = Σ wᵢwⱼ / rᵢⱼ and slide downhill (projected gradient descent).
// Every angle, energy and dipole number on the page comes from here; tests/core.cjs pins the claims.
(function (root) {
  const DEG = 180 / Math.PI;
  // Lone-pair weight used in step 3/4. Chosen in step 2 as the value that puts both NH3 and H2O
  // within 1° of experiment; tests pin that this is true.
  const LAMBDA = 1.25;
  const ETA = 0.1, MAX_MOVE = 0.1, STOP = 1e-5, ITERS = 1500, ARRANGE_ITERS = 2000, STARTS = 8;

  function mulberry32(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * DEG;

  // Random, uniformly spread starting points on the sphere (seeded, so "replay" is reproducible).
  function randomStart(N, seed) {
    const r = mulberry32(seed * 7919 + N), P = [];
    for (let i = 0; i < N; i++) { const z = 2 * r() - 1, ph = 2 * Math.PI * r(), s = Math.sqrt(1 - z * z); P.push([s * Math.cos(ph), s * Math.sin(ph), z]); }
    return P;
  }
  function energy(P, w) {
    let E = 0;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++)
      E += (w ? w[i] * w[j] : 1) / Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]);
    return E;
  }
  // One downhill step: each point moves along the tangential part of the push it feels, then back onto the sphere.
  function step(P, w, eta = ETA) {
    return P.map((p, i) => {
      const f = [0, 0, 0];
      for (let j = 0; j < P.length; j++) {
        if (j === i) continue;
        const d = [p[0] - P[j][0], p[1] - P[j][1], p[2] - P[j][2]], r = Math.hypot(d[0], d[1], d[2]), k = (w ? w[i] * w[j] : 1) / (r * r * r);
        f[0] += k * d[0]; f[1] += k * d[1]; f[2] += k * d[2];
      }
      const fr = dot(f, p), tg = [f[0] - fr * p[0], f[1] - fr * p[1], f[2] - fr * p[2]];
      // cap a single move at MAX_MOVE so two points that start almost on top of each other cannot overshoot
      const len = eta * Math.hypot(tg[0], tg[1], tg[2]), k = len > MAX_MOVE ? MAX_MOVE / len : 1;
      return norm([p[0] + k * eta * tg[0], p[1] + k * eta * tg[1], p[2] + k * eta * tg[2]]);
    });
  }
  // Full relaxation, keeping every frame (used by the step 0 animation and its energy curve).
  // It stops at the first round in which no point moves more than STOP (1e-5 of the radius), capped at ITERS rounds.
  function relaxTrace(N, seed, w = null, iters = ITERS) {
    let P = randomStart(N, seed); const frames = [P], E = [energy(P, w)];
    for (let k = 0; k < iters; k++) {
      const Q = step(P, w), move = Math.max(...Q.map((q, i) => Math.hypot(q[0] - P[i][0], q[1] - P[i][1], q[2] - P[i][2])));
      P = Q; frames.push(P); E.push(energy(P, w));
      if (move < STOP) break;
    }
    return { frames, E, K: frames.length - 1 };
  }
  function relax(P, w, iters = ITERS) { for (let k = 0; k < iters; k++) P = step(P, w); return P; }

  // All pair angles (sorted), and the distinct values with how often each occurs.
  function pairAngles(P, idx) {
    const ids = idx || P.map((_, i) => i), out = [];
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) out.push(angle(P[ids[a]], P[ids[b]]));
    return out.sort((x, y) => x - y);
  }
  function distinct(angles, tol = 0.5) {
    const g = [];
    angles.forEach(a => { const last = g[g.length - 1]; if (last && Math.abs(a - last.sum / last.n) < tol) { last.sum += a; last.n++; } else g.push({ sum: a, n: 1 }); });
    return g.map(q => ({ deg: q.sum / q.n, count: q.n }));
  }

  // Lowest-energy arrangement of N domains, the first L of which are lone pairs with weight lam.
  // Best of STARTS seeded starts (the weighted problem can have several valleys).
  const cache = new Map();
  function arrange(N, L = 0, lam = 1) {
    const key = N + ':' + L + ':' + lam.toFixed(4);
    if (cache.has(key)) return cache.get(key);
    const w = Array.from({ length: N }, (_, i) => (i < L ? lam : 1));
    let best = null;
    for (let s = 1; s <= STARTS; s++) { const P = relax(randomStart(N, s), w, ARRANGE_ITERS), E = energy(P, w); if (!best || E < best.E - 1e-9) best = { P, E }; }
    const bonds = Array.from({ length: N - L }, (_, i) => i + L), lones = Array.from({ length: L }, (_, i) => i);
    const bondAngles = pairAngles(best.P, bonds);
    const res = { N, L, lam, P: best.P, E: best.E, w, bondAngles, minBond: bondAngles[0], maxBond: bondAngles[bondAngles.length - 1],
      loneAngle: L >= 2 ? angle(best.P[0], best.P[1]) : null,
      // number of domains sitting ~90° from each lone pair (2 = equatorial, 3 = axial on a trigonal bipyramid)
      loneNear90: lones.map(i => best.P.filter((q, j) => j !== i && Math.abs(angle(best.P[i], q) - 90) < 12).length),
      // trigonal-bipyramid slot of each lone pair: axial ones have a partner almost straight opposite
      lonePos: lones.map(i => (Math.max(...best.P.map((q, j) => (j === i ? 0 : angle(best.P[i], q)))) > 150 ? 'axial' : 'equatorial')) };
    cache.set(key, res);
    return res;
  }

  // Display frame only (angles are unchanged): lone pairs' mean direction (or the first bond) points up (+z),
  // and the next non-parallel domain is turned into the xz plane, so every molecule is shown the same way round.
  function orient(P, L = 0) {
    const sum = [0, 0, 0]; for (let i = 0; i < L; i++) for (let k = 0; k < 3; k++) sum[k] += P[i][k];
    const a = Math.hypot(sum[0], sum[1], sum[2]) > 1e-6 ? norm(sum) : P[0];
    const rot = (v, axis, th) => { const c = Math.cos(th), s = Math.sin(th), d = dot(axis, v), x = [axis[1] * v[2] - axis[2] * v[1], axis[2] * v[0] - axis[0] * v[2], axis[0] * v[1] - axis[1] * v[0]];
      return [v[0] * c + x[0] * s + axis[0] * d * (1 - c), v[1] * c + x[1] * s + axis[1] * d * (1 - c), v[2] * c + x[2] * s + axis[2] * d * (1 - c)]; };
    let Q = P;
    const cz = Math.max(-1, Math.min(1, a[2]));
    if (cz < 1 - 1e-12) {
      let ax = [a[1], -a[0], 0]; // a × z
      if (Math.hypot(ax[0], ax[1]) < 1e-9) ax = [1, 0, 0];
      ax = norm(ax); Q = Q.map(v => rot(v, ax, Math.acos(cz)));
    }
    const b = Q.find(v => Math.hypot(v[0], v[1]) > 1e-3);
    if (b) { const ph = -Math.atan2(b[1], b[0]); Q = Q.map(v => rot(v, [0, 0, 1], ph)); }
    return Q.map(v => norm(v));
  }

  // Step 1: four domains, pair A at ±α from +z in the xz plane, pair B at ±α from −z in the yz plane.
  // α = 90° flattens them into a square; the angle within each pair is 2α.
  function fourAt(thetaDeg) {
    const a = thetaDeg / 2 / DEG, s = Math.sin(a), c = Math.cos(a);
    return [[s, 0, c], [-s, 0, c], [0, s, -c], [0, -s, -c]];
  }
  function fourStats(thetaDeg) {
    const P = fourAt(thetaDeg), ang = pairAngles(P);
    return { P, E: energy(P), within: thetaDeg, across: angle(P[0], P[2]), min: ang[0] };
  }
  const TETRA = Math.acos(-1 / 3) * DEG;      // 109.4712…

  // Ideal angles for N equal domains (what step 0 converges to).
  const IDEAL = { 2: [180], 3: [120], 4: [TETRA], 5: [90, 120, 180], 6: [90, 180] };

  // Pauling electronegativities used in step 4.
  const EN = { H: 2.20, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, P: 2.19, S: 2.58, Cl: 3.16, Xe: 2.60 };
  // Step 3 molecules. valence = central atom's outer-shell electrons; bonds = bond order to each ligand.
  // exp: experimental bond angles in degrees (gas phase, standard tables); dipole: measured, debye.
  const MOLECULES = [
    { id: 'BeCl2', c: 'Be', x: 'Cl', valence: 2, bonds: [1, 1], exp: [180], dipole: 0 },
    { id: 'CO2', c: 'C', x: 'O', valence: 4, bonds: [2, 2], exp: [180], dipole: 0 },
    { id: 'BF3', c: 'B', x: 'F', valence: 3, bonds: [1, 1, 1], exp: [120], dipole: 0 },
    { id: 'SO2', c: 'S', x: 'O', valence: 6, bonds: [2, 2], exp: [119.5], dipole: 1.63 },
    { id: 'CH4', c: 'C', x: 'H', valence: 4, bonds: [1, 1, 1, 1], exp: [109.5], dipole: 0 },
    { id: 'NH3', c: 'N', x: 'H', valence: 5, bonds: [1, 1, 1], exp: [106.7], dipole: 1.47 },
    { id: 'H2O', c: 'O', x: 'H', valence: 6, bonds: [1, 1], exp: [104.5], dipole: 1.85 },
    { id: 'PCl5', c: 'P', x: 'Cl', valence: 5, bonds: [1, 1, 1, 1, 1], exp: [90, 120, 180], dipole: 0 },
    { id: 'ClF3', c: 'Cl', x: 'F', valence: 7, bonds: [1, 1, 1], exp: [87.5, 175], dipole: 0.6 },
    { id: 'SF6', c: 'S', x: 'F', valence: 6, bonds: [1, 1, 1, 1, 1, 1], exp: [90, 180], dipole: 0 },
    { id: 'XeF4', c: 'Xe', x: 'F', valence: 8, bonds: [1, 1, 1, 1], exp: [90, 180], dipole: 0 }
  ];
  // Counting: each ligand is one domain whatever its bond order; leftover valence electrons pair up as lone pairs.
  function count(m) {
    const used = m.bonds.reduce((s, b) => s + b, 0), left = m.valence - used, L = left / 2, X = m.bonds.length;
    return { X, used, left, L, N: X + L };
  }
  // Shape name key from AXmEn (names describe atom positions only; lone pairs are invisible to the name).
  const SHAPE = { '2:0': 'linear', '3:0': 'trigonal', '3:1': 'bent', '4:0': 'tetrahedral', '4:1': 'pyramidal', '4:2': 'bent', '5:0': 'bipyramidal', '5:1': 'seesaw', '5:2': 'tshape', '5:3': 'linear', '6:0': 'octahedral', '6:1': 'squarePyramidal', '6:2': 'squarePlanar' };
  const shapeKey = (N, L) => SHAPE[N + ':' + L];

  function molecule(id, lam = LAMBDA) {
    const m = MOLECULES.find(q => q.id === id), c = count(m), a = arrange(c.N, c.L, lam);
    return { ...m, ...c, arr: a, shape: shapeKey(c.N, c.L) };
  }
  // Model angle closest to each experimental angle (how the step 3 table pairs them up).
  function compare(id, lam = LAMBDA) {
    const q = molecule(id, lam), groups = distinct(q.arr.bondAngles, 1.5).map(g => g.deg);
    return q.exp.map(e => { const m = groups.reduce((b, g) => (Math.abs(g - e) < Math.abs(b - e) ? g : b), groups[0]); return { exp: e, model: m, diff: m - e }; });
  }

  // Step 4: bond dipole arrows. Each bond contributes ΔEN (Pauling) along the bond, pointing to the more
  // electronegative atom; the net is their vector sum. Lone pairs are not included (stated on the page).
  function bondDipole(c, x) { return EN[x] - EN[c]; } // >0: arrow points from centre to ligand
  function netDipole(id, lam = LAMBDA) {
    const q = molecule(id, lam), d = bondDipole(q.c, q.x), v = [0, 0, 0];
    for (let i = q.L; i < q.N; i++) { v[0] += d * q.arr.P[i][0]; v[1] += d * q.arr.P[i][1]; v[2] += d * q.arr.P[i][2]; }
    return { bond: d, v, mag: Math.hypot(v[0], v[1], v[2]) };
  }
  // AX2 with bond angle θ: |net| = 2·|bond|·cos(θ/2).
  const bentNet = (bond, thetaDeg) => 2 * Math.abs(bond) * Math.cos(thetaDeg / 2 / DEG);

  const api = { DEG, LAMBDA, ETA, STOP, ITERS, ARRANGE_ITERS, STARTS, TETRA, IDEAL, EN, MOLECULES, SHAPE,
    mulberry32, randomStart, energy, orient, step, relax, relaxTrace, pairAngles, distinct, arrange, angle,
    fourAt, fourStats, count, shapeKey, molecule, compare, bondDipole, netDipole, bentNet };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
