'use strict';
// Carnot cycle lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, number and readout on the page is computed here; tests/core.cjs pins the claims.
// Working substance: 1 mol of ideal monatomic gas (γ = 5/3, Cv = 3R/2). Units: V in litres, p in kPa,
// so p·V comes out directly in joules (1 kPa·L = 1 J). All processes are reversible (quasi-static).
(function (root) {
  const R = 8.314462618, n = 1, GAMMA = 5 / 3, CV = 1.5 * R;
  const V1 = 10; // litres, state 1 of every cycle on the page

  const pressure = (V, T) => n * R * T / V; // kPa when V is in L
  const isoWork = (T, Va, Vb) => n * R * T * Math.log(Vb / Va); // J, work done BY the gas
  // Work as a sum of thin strips (midpoint rule) — the "area" picture of step 0.
  function stripSum(f, Va, Vb, N) { const d = (Vb - Va) / N; let s = 0; for (let i = 0; i < N; i++) s += f(Va + (i + 0.5) * d) * d; return s; }
  // Reversible adiabat through (V0, T0): T·V^(γ−1) = const.
  const adiabatT = (T0, V0, V) => T0 * Math.pow(V0 / V, GAMMA - 1);
  const adiabatV = (T0, V0, T) => V0 * Math.pow(T0 / T, 1 / (GAMMA - 1)); // volume at which the adiabat reaches T
  const adiabatWork = (T0, T1) => n * CV * (T0 - T1); // = −ΔU
  const dU = (Ta, Tb) => n * CV * (Tb - Ta);
  // Entropy relative to (T = 1 K, V = 1 L); only differences matter.
  const entropy = (V, T) => n * CV * Math.log(T) + n * R * Math.log(V);

  // The four states and legs of a Carnot cycle: 1→2 isothermal expansion at Th, 2→3 adiabatic expansion,
  // 3→4 isothermal compression at Tc, 4→1 adiabatic compression.
  function cycle(Th, Tc, r) {
    const Va = V1, Vb = r * V1, Vc = adiabatV(Th, Vb, Tc), Vd = adiabatV(Th, Va, Tc);
    const S = [entropy(Va, Th), entropy(Vb, Th), entropy(Vc, Tc), entropy(Vd, Tc)];
    const legs = [
      { kind: 'isoExp', from: [Va, Th], to: [Vb, Th], Q: isoWork(Th, Va, Vb), W: isoWork(Th, Va, Vb), dU: 0 },
      { kind: 'adiExp', from: [Vb, Th], to: [Vc, Tc], Q: 0, W: adiabatWork(Th, Tc), dU: dU(Th, Tc) },
      { kind: 'isoCmp', from: [Vc, Tc], to: [Vd, Tc], Q: isoWork(Tc, Vc, Vd), W: isoWork(Tc, Vc, Vd), dU: 0 },
      { kind: 'adiCmp', from: [Vd, Tc], to: [Va, Th], Q: 0, W: adiabatWork(Tc, Th), dU: dU(Tc, Th) }
    ];
    const Qh = legs[0].Q, Qc = -legs[2].Q, W = legs.reduce((s, l) => s + l.W, 0);
    return { Th, Tc, r, V: [Va, Vb, Vc, Vd], S, legs, Qh, Qc, W, eta: W / Qh };
  }
  // A point along the cycle, u ∈ [0, 4): integer part = leg, fraction = progress (geometric in V).
  function pointAt(cy, u) {
    const k = Math.min(3, Math.floor(u)), f = u - k, leg = cy.legs[k];
    const [Va, Ta] = leg.from, [Vb] = leg.to;
    const V = Va * Math.pow(Vb / Va, f);
    const T = leg.kind === 'isoExp' ? cy.Th : leg.kind === 'isoCmp' ? cy.Tc : adiabatT(Ta, Va, V);
    return { leg: k, V, T, p: pressure(V, T), S: entropy(V, T) };
  }
  // Net work as the enclosed area of the sampled p–V loop (shoelace), independent of the leg formulas.
  function loopArea(cy, perLeg = 4000) {
    const pts = []; for (let i = 0; i < 4 * perLeg; i++) { const q = pointAt(cy, i / perLeg); pts.push([q.V, q.p]); }
    let a = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a += x1 * y2 - x2 * y1; }
    return -a / 2; // clockwise loop on p–V → positive work
  }
  // Work done BY the gas from the start of the cycle up to u ∈ [0, 4] (exact, leg by leg) — step 1's running total.
  function cumWork(cy, u) {
    let s = 0;
    for (let k = 0; k < 4; k++) {
      if (u >= k + 1) { s += cy.legs[k].W; continue; }
      if (u <= k) break;
      const q = pointAt(cy, u), leg = cy.legs[k], [Va, Ta] = leg.from;
      s += leg.kind === 'isoExp' || leg.kind === 'isoCmp' ? isoWork(Ta, Va, q.V) : adiabatWork(Ta, q.T);
      break;
    }
    return s;
  }
  // Fixed axis limits for a given Th (and r): the widest loop over the Tc slider range, so dragging Tc never rescales.
  function axisFor(Th, r, TcMin = 250) { return { Vmax: adiabatV(Th, r * V1, TcMin), pmax: pressure(V1, Th) }; }
  const carnotEta = (Th, Tc) => 1 - Tc / Th;

  // Step 4: entropy ledger for an engine that claims efficiency eta, taking Qh from Th and dumping Qc at Tc.
  function ledger(Th, Tc, eta, Qh = 1000) {
    const W = eta * Qh, Qc = Qh - W, dSh = -Qh / Th, dSc = Qc / Tc;
    return { W, Qc, dSh, dSc, total: dSh + dSc };
  }
  // Step 5: reversed Carnot cycle (refrigerator / heat pump).
  const copFridge = (Th, Tc) => Tc / (Th - Tc);
  const copPump = (Th, Tc) => Th / (Th - Tc);
  const C2K = c => c + 273.15;

  const api = { R, n, GAMMA, CV, V1, pressure, isoWork, stripSum, adiabatT, adiabatV, adiabatWork, dU, entropy, cycle, pointAt, loopArea, cumWork, axisFor, carnotEta, ledger, copFridge, copPump, C2K };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CARNOT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
