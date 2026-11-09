'use strict';
// Materials science lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Scope: uniaxial, quasi-static, room-temperature tension of smooth bars. Engineering stress s = F/A0 (MPa),
// engineering strain e = ΔL/L0. Plastic hardening uses the Ludwik law in true stress / true strain:
//   σt = σp + K·εp^n,  εt = σt/E + εp,  e = exp(εt) − 1,  s = σt·exp(−εt)  (constant volume, uniform bar).
// After the maximum of s (necking) the drop to fracture is an empirical curve, not a mechanics solution.
// Material numbers are typical textbook-order values for illustration, not design data.
(function (root) {
  const MATS = {
    steel: { E: 200000, sp: 250, K: 445, n: 0.355, Astd: 0.30, drop: 0.75, rho: 7850, KIC: 50 },
    al:    { E: 69000,  sp: 276, K: 175, n: 0.415, Astd: 0.14, drop: 0.85, rho: 2700, KIC: 29 },
    cu:    { E: 115000, sp: 69,  K: 377, n: 0.415, Astd: 0.50, drop: 0.70, rho: 8900, KIC: 70 },
    ceramic: { E: 370000, sf: 260, brittle: true, rho: 3900, KIC: 4 }
  };
  const ORDER = ['steel', 'al', 'cu', 'ceramic'];
  const OFFSET = 0.002; // the 0.2 % offset convention

  // True stress at true plastic strain ep (Ludwik).
  const sigT = (m, ep) => m.sp + m.K * Math.pow(Math.max(0, ep), m.n);
  // Hardening rate dσt/dεt along the plastic branch (εt includes the elastic part σt/E).
  function theta(m, ep) {
    if (ep <= 0) return Infinity;
    const d = m.K * m.n * Math.pow(ep, m.n - 1); // dσt/dεp
    return d / (1 + d / m.E);
  }
  // Uniform (pre-necking) branch: from true strain, solve for εp by bisection.
  function uniformAtTrue(m, et) {
    if (m.brittle || et <= m.sp / m.E) return { st: m.E * et, ep: 0 };
    let lo = 0, hi = et;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (sigT(m, mid) / m.E + mid < et) lo = mid; else hi = mid; }
    const ep = (lo + hi) / 2; return { st: sigT(m, ep), ep };
  }

  // Uniform-deformation branch at engineering strain e, even past necking (used only for the dashed extrapolation).
  function trueUniform(key, e) {
    const m = MATS[key], u = uniformAtTrue(m, Math.log(1 + e));
    return { st: u.st, ep: u.ep, theta: u.ep > 0 ? theta(m, u.ep) : m.E };
  }

  // Necking onset: Considère, dσt/dεt = σt. Returns true plastic strain, engineering strain and stress (UTS).
  const neckCache = {};
  function necking(key) {
    if (neckCache[key]) return neckCache[key];
    const m = MATS[key];
    if (m.brittle) return (neckCache[key] = null);
    let lo = 1e-9, hi = 3;
    for (let i = 0; i < 200; i++) { const mid = Math.sqrt(lo * hi); if (theta(m, mid) > sigT(m, mid)) lo = mid; else hi = mid; }
    const ep = Math.sqrt(lo * hi), st = sigT(m, ep), et = st / m.E + ep;
    return (neckCache[key] = { ep, st, et, eu: Math.exp(et) - 1, uts: st * Math.exp(-et) });
  }

  // Elongation at break. Neck extension scales with √A0 (Barba), so e_f depends on gauge length L0 and area A0.
  // For the standard proportional bar (L0 = 5.65·√A0) it equals the material's Astd.
  function breakStrain(key, ratio) { // ratio = √A0 / L0
    const m = MATS[key];
    if (m.brittle) return m.sf / m.E;
    const nk = necking(key), r = ratio === undefined ? 1 / 5.65 : ratio;
    return nk.eu + (m.Astd - nk.eu) * 5.65 * r;
  }

  // Engineering response at engineering strain e. Returns stress, regime and the strain left after unloading.
  function response(key, e, ratio) {
    const m = MATS[key];
    if (e < 0) e = 0;
    if (m.brittle) {
      const ef = m.sf / m.E;
      if (e > ef) return { s: 0, broken: true, regime: 'broken', ef, eres: 0 };
      return { s: m.E * e, regime: 'elastic', ef, eres: 0, st: m.E * e };
    }
    const nk = necking(key), ef = breakStrain(key, ratio);
    if (e > ef + 1e-12) return { s: 0, broken: true, regime: 'broken', ef, eres: ef };
    if (e <= nk.eu) {
      const et = Math.log(1 + e), u = uniformAtTrue(m, et);
      const s = u.st * Math.exp(-et);
      return { s, st: u.st, ep: u.ep, regime: u.ep > 0 ? 'plastic' : 'elastic', ef, eres: Math.exp(u.ep) - 1 };
    }
    // Necked: empirical drop from UTS (zero slope at e_u) to drop·UTS at e_f. Unloading is elastic with slope E.
    const q = (e - nk.eu) / (ef - nk.eu), s = nk.uts - (1 - m.drop) * nk.uts * q * q;
    return { s, regime: 'necked', ef, eres: e - s / m.E };
  }

  // 0.2 % offset yield strength Rp0.2: intersection with s = E·(e − 0.002).
  function rp02(key) {
    const m = MATS[key];
    if (m.brittle) return null;
    let lo = OFFSET, hi = necking(key).eu;
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (response(key, mid).s > m.E * (mid - OFFSET)) lo = mid; else hi = mid; }
    const e = (lo + hi) / 2; return { e, s: m.E * (e - OFFSET) };
  }

  // Area under the engineering curve from 0 to e (MPa × strain = MJ/m³), Simpson on a fine grid.
  function energyTo(key, e, ratio) {
    const ef = breakStrain(key, ratio), top = Math.min(e, ef);
    if (top <= 0) return 0;
    const m = MATS[key];
    // integrate the elastic piece analytically-safe by splitting at the elastic limit
    const ey = m.brittle ? top : Math.min(top, Math.exp(m.sp / m.E) - 1);
    const simpson = (a, b, N) => { if (b <= a) return 0; const h = (b - a) / N; let s = response(key, a, ratio).s + response(key, b, ratio).s; for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * response(key, a + i * h, ratio).s; return s * h / 3; };
    return simpson(0, ey, 200) + simpson(ey, top, 2000);
  }
  // Stored (recoverable) part at e: triangle under the unloading line.
  function recoverable(key, e) { const r = response(key, e); return r.broken ? 0 : 0.5 * r.s * (e - r.eres); }
  const memo = (fn) => { const c = {}; return key => (key in c ? c[key] : (c[key] = fn(key))); };
  const toughness = memo(key => energyTo(key, breakStrain(key)));
  // Modulus of resilience: energy stored up to the elastic limit (proportional limit, or fracture for the ceramic).
  const resilience = key => { const m = MATS[key], s = m.brittle ? m.sf : m.sp; return s * s / (2 * m.E); };
  // Strength used for design: Rp0.2 for metals, fracture strength for the ceramic.
  const strength = memo(key => (MATS[key].brittle ? MATS[key].sf : rp02(key).s));

  // ---- step 0: specimens of different size ----
  const SPEC = { dMin: 6, dMax: 20, LMin: 20, LMax: 100 };
  function specimen(d, L0) {
    const A0 = Math.PI * d * d / 4, ratio = Math.sqrt(A0) / L0, ef = breakStrain('steel', ratio);
    const nk = necking('steel');
    return { A0, ratio, ef, Fmax: nk.uts * A0 / 1000, dLbreak: ef * L0, eu: nk.eu, uts: nk.uts, isStd: Math.abs(L0 - 5.65 * Math.sqrt(A0)) < 0.5 };
  }

  // ---- step 4: choose a material for a 1 m tie rod ----
  const DESIGN = { L: 1, S: 2 };
  // F in kN, delta (allowed elastic stretch) in mm, U (energy to absorb before breaking) in J.
  // goal 'mass' → lightest rod wins; 'thin' → smallest diameter wins.
  function design(F, delta, U, goal) {
    const rows = ORDER.map(key => {
      const m = MATS[key];
      const Astr = DESIGN.S * F * 1000 / strength(key);                   // mm²
      const Astf = F * 1000 * DESIGN.L * 1000 / (m.E * delta);            // mm²  (ΔL = F L / (E A))
      const uT = toughness(key);                                           // MJ/m³ = J/cm³ … per m³: ×1e6
      const Aen = U > 0 ? U / (uT * 1e6 * DESIGN.L) * 1e6 : 0;             // mm²
      const A = Math.max(Astr, Astf, Aen);
      const binds = A === Astr ? 'strength' : A === Astf ? 'stiffness' : 'energy';
      return { key, Astr, Astf, Aen, A, binds, d: Math.sqrt(4 * A / Math.PI), mass: m.rho * A * 1e-6 * DESIGN.L };
    });
    const val = r => (goal === 'thin' ? r.A : r.mass);
    let best = rows[0]; rows.forEach(r => { if (val(r) < val(best)) best = r; });
    return { rows, best: best.key };
  }

  // ---- step 5: a crack of half-length a (m) in a wide plate, Y = 1 ----
  const fractureStress = (key, a) => MATS[key].KIC / Math.sqrt(Math.PI * a);           // MPa
  const transitionCrack = key => Math.pow(MATS[key].KIC / strength(key), 2) / Math.PI;  // m
  function failure(key, a) {
    const sc = fractureStress(key, a), sy = strength(key);
    if (MATS[key].brittle) return { s: Math.min(sc, sy), mode: 'brittle' };
    return sc < sy ? { s: sc, mode: 'fracture' } : { s: sy, mode: 'yield' };
  }

  const api = { MATS, ORDER, OFFSET, sigT, theta, trueUniform, necking, breakStrain, response, rp02, energyTo, recoverable, toughness, resilience, strength, SPEC, specimen, DESIGN, design, fractureStress, transitionCrack, failure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MAT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
