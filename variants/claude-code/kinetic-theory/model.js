'use strict';
// Kinetic theory lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every particle position, hit count, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Two kinds of units:
//  - Box simulations (steps 0, 1, 2, 4, 5) use teaching units: particle mass m = 1, box depth and height 1,
//    the right wall (or piston) has area A = 1, and velocity components are drawn with spread σ = √(kT/m) = 1.
//  - Step 3 and the real-gas conversions use SI units with CODATA constants.
// Gas model: ideal gas of point particles; walls are perfectly elastic and smooth (a hit reverses v_x only).
// Particles in steps 1, 2, 4 never collide with each other (an ideal gas does not need them to); step 5 adds
// random pair collisions to show where the speed distribution comes from.
(function (root) {
  const KB = 1.380649e-23;          // J/K
  const U = 1.66053906660e-27;      // kg (atomic mass unit)
  const EV = 1.602176634e-19;       // J
  const GASES = [
    { id: 'He', u: 4.0026 }, { id: 'Ne', u: 20.180 }, { id: 'N2', u: 28.014 },
    { id: 'CO2', u: 44.009 }, { id: 'Xe', u: 131.29 }
  ];

  /* ---------- seeded randomness (mulberry32 + Box–Muller) ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function normalSource(seed) {
    const r = rng(seed); let spare = null;
    return () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      const u = Math.max(r(), 1e-12), v = r(), m = Math.sqrt(-2 * Math.log(u));
      spare = m * Math.sin(2 * Math.PI * v); return m * Math.cos(2 * Math.PI * v);
    };
  }

  /* ---------- a gas sample: N particles, positions uniform in the unit box, velocities Gaussian (σ = 1) ---------- */
  function gas(N, seed = 1) {
    const r = rng(seed * 7919 + 13), nrm = normalSource(seed);
    const P = [];
    for (let i = 0; i < N; i++) P.push({ x: r(), y: r(), z: r(), vx: nrm(), vy: nrm(), vz: nrm() });
    return P;
  }
  // "Beam": the same speeds, but every velocity points along ±x (a gas with a preferred direction).
  function beam(P) {
    return P.map((p, i) => { const s = Math.hypot(p.vx, p.vy, p.vz); return { ...p, vx: i % 2 ? -s : s, vy: 0, vz: 0 }; });
  }
  const mean = (a, f) => a.reduce((s, p) => s + f(p), 0) / a.length;
  function sums(P) {
    let sx = 0, sy = 0, sz = 0;
    P.forEach(p => { sx += p.vx * p.vx; sy += p.vy * p.vy; sz += p.vz * p.vz; });
    return { sx, sy, sz, s: sx + sy + sz };
  }

  /* ---------- reflecting coordinate: a particle bouncing between 0 and L ---------- */
  // Unfold the motion onto a line of period 2L, then fold back.
  function bounce(x0, v, L, t) {
    let u = (x0 + v * t) % (2 * L); if (u < 0) u += 2 * L;
    return u <= L ? u : 2 * L - u;
  }
  // Time of the first hit on the wall at x = L, and the interval between hits.
  function firstHit(x0, v, L) {
    const a = Math.abs(v); if (a === 0) return { t1: Infinity, dt: Infinity };
    return { t1: v > 0 ? (L - x0) / a : (x0 + L) / a, dt: 2 * L / a };
  }
  function hitsBy(x0, v, L, t) {
    const { t1, dt } = firstHit(x0, v, L);
    return t < t1 ? 0 : Math.floor((t - t1) / dt + 1e-12) + 1;
  }

  /* ---------- step 0: one particle, one wall ---------- */
  // Starts at the left wall moving right with speed v; mass m = 1.
  function single(v, L, t) {
    const hits = hitsBy(0, v, L, t), impulse = 2 * v;
    return { hits, impulse, gap: 2 * L / v, total: hits * impulse, mean: t > 0 ? hits * impulse / t : 0, theory: v * v / L, x: bounce(0, v, L, t) };
  }
  function hitTimes(v, L, tMax) { const out = []; for (let k = 0; ; k++) { const t = (2 * k + 1) * L / v; if (t > tMax + 1e-12) break; out.push(t); } return out; }

  /* ---------- steps 1 and 4: wall pressure measured by counting hits ---------- */
  // Wall at x = L, area A = 1, box volume V = L. Each hit transfers 2m|v_x|.
  function wallLedger(P, L, t) {
    let hits = 0, impulse = 0;
    for (const p of P) { const k = hitsBy(p.x * L, p.vx, L, t); hits += k; impulse += k * 2 * Math.abs(p.vx); }
    return { hits, impulse, P: t > 0 ? impulse / t : 0 };
  }
  // Long-run pressure of this sample: Σ m v_x² / V. Isotropic estimate: N m ⟨v²⟩ / (3V).
  function pressureTheory(P, L) { const s = sums(P); return { exact: s.sx / L, iso: s.s / (3 * L) }; }
  // Running pressure on a time grid (for the strip chart).
  function ledgerSeries(P, L, tMax, n) { const out = []; for (let i = 1; i <= n; i++) { const t = tMax * i / n; out.push({ t, P: wallLedger(P, L, t).P }); } return out; }

  /* ---------- step 2: the share of v_x² in v² ---------- */
  function shares(P) { const s = sums(P); return { x: s.sx / s.s, y: s.sy / s.s, z: s.sz / s.s }; }
  // For Gaussian components the x share is Beta(N/2, N) distributed: mean 1/3, sd below.
  function shareSD(N) { const a = N / 2, b = N; return Math.sqrt(a * b / ((a + b) * (a + b) * (a + b + 1))); }

  /* ---------- step 3: real gases ---------- */
  function realGas(id, T) {
    const g = GASES.find(q => q.id === id), m = g.u * U;
    const sigma = Math.sqrt(KB * T / m);
    return { id, u: g.u, m, sigma, vrms: Math.sqrt(3) * sigma, vmean: Math.sqrt(8 / Math.PI) * sigma, vmp: Math.SQRT2 * sigma, ke: 1.5 * KB * T, keMeV: 1.5 * KB * T / EV * 1000 };
  }
  // Number density of a gas at pressure p (Pa) and temperature T: n = p / kT; and P back from (1/3) n m v_rms².
  function airCheck(p = 101325, T = 293.15, id = 'N2') {
    const n = p / (KB * T), g = realGas(id, T);
    return { n, pBack: n * g.m * g.vrms * g.vrms / 3, perLitre: n / 1000 };
  }

  /* ---------- step 5: Maxwell speed distribution (σ = √(kT/m)) ---------- */
  function maxwell(v, s = 1) { return Math.sqrt(2 / Math.PI) * v * v / (s * s * s) * Math.exp(-v * v / (2 * s * s)); }
  // erf with |error| < 1.2e-7 (Numerical Recipes erfc Chebyshev), enough for 4-digit readouts.
  function erfc(x) {
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  // P(speed > a·σ)
  function tail(a) { return erfc(a / Math.SQRT2) + Math.sqrt(2 / Math.PI) * a * Math.exp(-a * a / 2); }
  function cdf(a) { return 1 - tail(a); }

  const HIST = { bins: 30, vMax: 4.5 };
  function histogram(speeds) {
    const h = new Array(HIST.bins).fill(0), w = HIST.vMax / HIST.bins;
    speeds.forEach(s => { const i = Math.floor(s / w); if (i < HIST.bins) h[i]++; });
    return h.map(c => c / speeds.length / w); // density, same units as maxwell()
  }
  // Expected density in each bin (exact bin integral / width) and total-variation distance to it.
  function binMaxwell() { const w = HIST.vMax / HIST.bins; return Array.from({ length: HIST.bins }, (_, i) => (cdf((i + 1) * w) - cdf(i * w)) / w); }
  function tvDistance(hist) {
    const w = HIST.vMax / HIST.bins, ref = binMaxwell();
    let d = 0; hist.forEach((v, i) => { d += Math.abs(v - ref[i]) * w; });
    d += tail(HIST.vMax); // mass beyond the last bin (the histogram puts none there)
    return d / 2;
  }

  // Random-pair collisions ("Maxwell molecules": every pair equally likely to collide). Each collision keeps
  // total momentum and energy; the relative velocity keeps its length and gets a random new direction.
  // All particles start with the same speed √3 (so ⟨v²⟩ = 3, i.e. σ = 1) in random directions.
  function relaxStart(N, seed = 3) {
    const r = rng(seed), V = [];
    for (let i = 0; i < N; i++) { const c = 2 * r() - 1, ph = 2 * Math.PI * r(), s = Math.sqrt(1 - c * c), v = Math.sqrt(3); V.push([v * s * Math.cos(ph), v * s * Math.sin(ph), v * c]); }
    return { V, r, rounds: 0 };
  }
  function relaxRound(st) {
    const { V, r } = st, N = V.length;
    for (let c = 0; c < N / 2; c++) {
      const i = Math.floor(r() * N); let j = Math.floor(r() * (N - 1)); if (j >= i) j++;
      const a = V[i], b = V[j];
      const cm = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      const g = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      const ct = 2 * r() - 1, ph = 2 * Math.PI * r(), sn = Math.sqrt(1 - ct * ct);
      const n = [sn * Math.cos(ph), sn * Math.sin(ph), ct];
      for (let k = 0; k < 3; k++) { a[k] = cm[k] + g * n[k] / 2; b[k] = cm[k] - g * n[k] / 2; }
    }
    st.rounds++;
    return st;
  }
  const speedsOf = st => st.V.map(v => Math.hypot(v[0], v[1], v[2]));
  function energyOf(st) { return st.V.reduce((s, v) => s + v[0] * v[0] + v[1] * v[1] + v[2] * v[2], 0) / st.V.length; } // ⟨v²⟩
  function momentumOf(st) { const p = [0, 0, 0]; st.V.forEach(v => { p[0] += v[0]; p[1] += v[1]; p[2] += v[2]; }); return p; }
  const RELAX = { N: 3000, rounds: 12, seed: 3 };

  const api = { KB, U, EV, GASES, rng, normalSource, gas, beam, sums, mean, bounce, firstHit, hitsBy, single, hitTimes, wallLedger, pressureTheory, ledgerSeries, shares, shareSD, realGas, airCheck, maxwell, erfc, tail, cdf, HIST, histogram, binMaxwell, tvDistance, relaxStart, relaxRound, speedsOf, energyOf, momentumOf, RELAX };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
