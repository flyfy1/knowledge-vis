'use strict';
// Titration-curve lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, marker and readout on the page is computed here; tests/core.cjs pins the claims.
// Setting: 25.00 mL of a monoprotic acid HA (formal concentration c) titrated with NaOH of the same
// concentration c at 25 °C. pH is found from the full charge balance
//   [H⁺] + [Na⁺] = [OH⁻] + [A⁻],  [A⁻] = C_A·Ka/(Ka + [H⁺]),  [OH⁻] = Kw/[H⁺]
// by bisection (no Henderson–Hasselbalch or other shortcut). Activities = concentrations, volumes add.
(function (root) {
  const KW = 1e-14, VA = 25, DROP = 0.05;
  const VEQ = VA; // equal concentrations → equivalence at 25.00 mL

  // kind: 'strong' (HA fully dissociated) or 'weak' with the given pKa.
  function pH(kind, pKa, c, V) {
    const Vt = VA + V, CA = c * VA / Vt, Na = c * V / Vt, Ka = Math.pow(10, -pKa);
    const f = h => h + Na - KW / h - (kind === 'strong' ? CA : CA * Ka / (Ka + h));
    let lo = -16, hi = 2; // log10 [H⁺]; f is increasing in h
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(Math.pow(10, mid)) > 0) hi = mid; else lo = mid; }
    return -(lo + hi) / 2;
  }
  function curve(kind, pKa, c, v0 = 0, v1 = 50, n = 500) { const out = []; for (let i = 0; i <= n; i++) { const V = v0 + (v1 - v0) * i / n; out.push([V, pH(kind, pKa, c, V)]); } return out; }

  // Change in pH caused by one drop added at volume V (drop from V to V + 0.05 mL).
  const dropJump = (kind, pKa, c, V) => pH(kind, pKa, c, V + DROP) - pH(kind, pKa, c, V);
  // Acid left un-neutralised and base surplus, in mmol, after V mL.
  function inventory(c, V) { const nA = c * VA, nB = c * V; return { nA, nB, left: Math.max(0, nA - nB), surplus: Math.max(0, nB - nA), drop: c * DROP }; }

  // Textbook "jump": pH at 99.9 % and 100.1 % of the equivalence volume.
  function jump(kind, pKa, c) { const a = pH(kind, pKa, c, VEQ * 0.999), b = pH(kind, pKa, c, VEQ * 1.001); return { a, b, height: b - a }; }

  // Volume at which the pH first reaches `target` (pH rises monotonically with V); null if never within 0–50 mL.
  function volumeAt(kind, pKa, c, target) {
    if (pH(kind, pKa, c, 0) >= target) return 0;
    if (pH(kind, pKa, c, 50) < target) return null;
    let lo = 0, hi = 50;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (pH(kind, pKa, c, mid) >= target) hi = mid; else lo = mid; }
    return (lo + hi) / 2;
  }

  // Indicators: transition range [lo, hi]; this page takes the end point where the pH reaches the middle of the range.
  const INDICATORS = [
    { id: 'mo', lo: 3.1, hi: 4.4, c: [[220, 50, 50], [240, 200, 60]] },
    { id: 'mr', lo: 4.4, hi: 6.2, c: [[220, 50, 60], [240, 200, 60]] },
    { id: 'btb', lo: 6.0, hi: 7.6, c: [[230, 200, 50], [50, 90, 200]] },
    { id: 'pp', lo: 8.2, hi: 10.0, c: [[236, 236, 240], [222, 40, 140]] }
  ];
  const indicator = id => INDICATORS.find(d => d.id === id);
  const midOf = ind => (ind.lo + ind.hi) / 2;
  function indColor(ind, p) { const f = Math.max(0, Math.min(1, (p - ind.lo) / (ind.hi - ind.lo))); return ind.c[0].map((v, i) => Math.round(v + (ind.c[1][i] - v) * f)); }
  function endPoint(kind, pKa, c, ind) {
    const V = volumeAt(kind, pKa, c, midOf(ind));
    return V === null ? null : { V, err: V - VEQ, rel: (V - VEQ) / VEQ };
  }
  // The colour-change point lies inside the ±0.1 % jump ⇔ the end-point error is within ±0.1 % (pH rises monotonically).
  function inJump(kind, pKa, c, ind) { const j = jump(kind, pKa, c), m = midOf(ind); return m >= j.a && m <= j.b; }

  const ACETIC = 4.76; // acetic acid pKa at 25 °C
  const CONCS = [0.1, 0.01, 0.001];

  const api = { KW, VA, VEQ, DROP, pH, curve, dropJump, inventory, jump, volumeAt, INDICATORS, indicator, midOf, indColor, endPoint, inJump, ACETIC, CONCS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TITR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
