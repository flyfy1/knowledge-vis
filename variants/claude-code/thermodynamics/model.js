'use strict';
// Thermodynamics lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout on the page is computed here; tests/core.cjs pins the claims.
// Model: n = 0.2 mol of ideal gas, quasi-static paths, constant heat capacities.
// Units: P in kPa, V in L, T in K, energy in J (1 kPa·L = 1 J). Sign convention: W = work done BY the gas,
// Q = heat INTO the gas, ΔU = Q − W.
(function (root) {
  const R = 8.314;          // J/(mol·K)
  const N = 0.2;            // mol, fixed for the whole page
  const GAS = { mono: 5 / 3, di: 7 / 5 };
  const A = { V: 2, P: 250 };                  // steps 1–2: fixed start state
  const ADIA = { V1: 1.5, T1: 400 };           // step 3: common start state
  const CYCLE = { V1: 1 };                     // steps 4–5: smallest volume (L)

  const cv = g => R / (g - 1);                 // molar heat capacity at constant volume
  const pressure = (T, V) => N * R * T / V;
  const temp = (P, V) => P * V / (N * R);
  const U = (T, g) => N * cv(g) * T;           // internal energy relative to 0 K

  // ---- steps 1–2: three paths from A to B ----
  // 'pv' = constant pressure first, then constant volume; 'vp' = constant volume first; 'line' = straight segment.
  function paths(B, g, a = A) {
    const dU = N * cv(g) * (temp(B.P, B.V) - temp(a.P, a.V));
    const W = { pv: a.P * (B.V - a.V), vp: B.P * (B.V - a.V), line: (a.P + B.P) / 2 * (B.V - a.V) };
    const corner = { pv: { V: B.V, P: a.P }, vp: { V: a.V, P: B.P } };
    const out = {};
    for (const k of ['pv', 'vp', 'line']) {
      const pts = k === 'line' ? [a, B] : [a, corner[k], B];
      out[k] = { key: k, pts, W: W[k], dU, Q: dU + W[k] };
    }
    return out;
  }
  // Point on a polyline at fraction f ∈ [0, 1] of its length in (V, P/100) units (for the animation).
  function along(pts, f) {
    const segs = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].V - pts[i - 1].V, (pts[i].P - pts[i - 1].P) / 100); segs.push(d); L += d; }
    if (L === 0) return { V: pts[0].V, P: pts[0].P };
    let s = f * L;
    for (let i = 0; i < segs.length; i++) {
      if (s <= segs[i] || i === segs.length - 1) { const q = segs[i] ? Math.min(1, s / segs[i]) : 1; return { V: pts[i].V + (pts[i + 1].V - pts[i].V) * q, P: pts[i].P + (pts[i + 1].P - pts[i].P) * q }; }
      s -= segs[i];
    }
    return pts[pts.length - 1];
  }
  // Work along a polyline up to fraction f: ∫ P dV of the straight pieces.
  function workAlong(pts, f) {
    const p = along(pts, f), segs = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].V - pts[i - 1].V, (pts[i].P - pts[i - 1].P) / 100); segs.push(d); L += d; }
    let s = f * L, W = 0;
    for (let i = 0; i < segs.length; i++) {
      const a = pts[i], b = s >= segs[i] ? pts[i + 1] : p;
      W += (a.P + b.P) / 2 * (b.V - a.V);
      if (s < segs[i]) break; s -= segs[i];
    }
    return W;
  }

  // ---- step 3: isothermal vs adiabatic from the same start ----
  function isoAdia(V2, g, V1 = ADIA.V1, T1 = ADIA.T1) {
    const P1 = pressure(T1, V1);
    const iso = { T2: T1, P2: pressure(T1, V2), W: N * R * T1 * Math.log(V2 / V1) };
    iso.Q = iso.W; iso.dU = 0;
    const T2 = T1 * Math.pow(V1 / V2, g - 1);
    const adia = { T2, P2: pressure(T2, V2), dU: N * cv(g) * (T2 - T1), Q: 0 };
    adia.W = -adia.dU;
    return { V1, T1, P1, V2, g, iso, adia, Tiso: () => T1, Tadia: V => T1 * Math.pow(V1 / V, g - 1), Piso: V => pressure(T1, V), Padia: V => P1 * Math.pow(V1 / V, g) };
  }

  // ---- step 4: Carnot cycle 1 →(Th, expand)→ 2 →(adiabatic)→ 3 →(Tc, compress)→ 4 →(adiabatic)→ 1 ----
  function carnot(Th, Tc, r, g, V1 = CYCLE.V1) {
    const k = Math.pow(Th / Tc, 1 / (g - 1));
    const V = [V1, r * V1, r * V1 * k, V1 * k];
    const Qh = N * R * Th * Math.log(r), Qc = N * R * Tc * Math.log(r), W = Qh - Qc;
    // stage s ∈ [0, 4]: integer part = leg, fraction = progress (volume linear within a leg)
    const legs = [
      { a: V[0], b: V[1], T: V0 => Th, kind: 'hot' },
      { a: V[1], b: V[2], T: v => Th * Math.pow(V[1] / v, g - 1), kind: 'adia' },
      { a: V[2], b: V[3], T: v => Tc, kind: 'cold' },
      { a: V[3], b: V[0], T: v => Tc * Math.pow(V[3] / v, g - 1), kind: 'adia' }
    ];
    function at(s) {
      const i = Math.min(3, Math.floor(s)), f = Math.min(1, s - i), L = legs[i], v = L.a + (L.b - L.a) * f, T = L.T(v);
      return { leg: i, V: v, T, P: pressure(T, v) };
    }
    // Running ledger after progress s: heat in at Th, heat out at Tc, net work by the gas so far.
    function ledger(s) {
      const p = at(s), done = Math.floor(s);
      const legW = i => [Qh, N * cv(g) * (Th - Tc), -Qc, -N * cv(g) * (Th - Tc)][i];
      let W = 0; for (let i = 0; i < Math.min(done, 4); i++) W += legW(i);
      let qin = done >= 1 ? Qh : 0, qout = done >= 3 ? Qc : 0;
      if (done < 4) {
        if (p.leg === 0) { const w = N * R * Th * Math.log(p.V / V[0]); W += w; qin = w; }
        if (p.leg === 1) W += N * cv(g) * (Th - p.T);
        if (p.leg === 2) { const w = N * R * Tc * Math.log(p.V / V[2]); W += w; qout = -w; }
        if (p.leg === 3) W += -N * cv(g) * (p.T - Tc);
      }
      return { qin, qout, W };
    }
    return { Th, Tc, r, g, V, Qh, Qc, W, eta: W / Qh, etaC: 1 - Tc / Th, legs, at, ledger };
  }

  // ---- step 5: Stirling cycle (two isotherms + two constant-volume legs), with or without a regenerator ----
  function stirling(Th, Tc, r, g, regen, V1 = CYCLE.V1) {
    const W = N * R * (Th - Tc) * Math.log(r);
    const Qiso = N * R * Th * Math.log(r), Qv = N * cv(g) * (Th - Tc);
    const Qin = Qiso + (regen ? 0 : Qv);
    const pts = [{ V: V1, T: Th }, { V: r * V1, T: Th }, { V: r * V1, T: Tc }, { V: V1, T: Tc }];
    return { Th, Tc, r, g, regen, W, Qiso, Qv, Qin, Qout: Qin - W, eta: W / Qin, etaC: 1 - Tc / Th, pts: pts.map(p => ({ ...p, P: pressure(p.T, p.V) })) };
  }

  const api = { R, N, GAS, A, ADIA, CYCLE, cv, pressure, temp, U, paths, along, workAlong, isoAdia, carnot, stirling };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.THERMO_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
