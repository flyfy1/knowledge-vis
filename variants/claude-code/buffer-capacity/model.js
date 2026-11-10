'use strict';
// Buffer-capacity model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Exact pH from the full charge balance (water included), plus the Henderson–Hasselbalch shortcut for comparison.
// Conventions: 25 °C, ideal solution, 1 L of solution, amounts in mol (so mol = mol/L); strong acid/base are added
// as concentrated drops and the volume change is ignored. tests/core.cjs pins every claim on the page.
(function (root) {
  const KW = 1e-14;
  const PAIRS = {
    acetic: { pKa: 4.76, acid: 'CH₃COOH', base: 'CH₃COO⁻' },
    phosphate: { pKa: 7.21, acid: 'H₂PO₄⁻', base: 'HPO₄²⁻' },
    ammonium: { pKa: 9.25, acid: 'NH₄⁺', base: 'NH₃' },
    carbonic: { pKa: 6.1, acid: 'H₂CO₃', base: 'HCO₃⁻' } // apparent pKa at body temperature (CO₂ + H₂CO₃ lumped)
  };
  const DROP = 0.005; // one drop: 5 mL of 1 mol/L strong acid or base into 1 L

  // A buffer made from HA and its salt (spectator ion, e.g. Na⁺): total C, ratio r = [A⁻]/[HA] as mixed.
  const make = (C, r, pKa) => ({ C, A0: C * r / (1 + r), HA0: C / (1 + r), pKa, Ka: Math.pow(10, -pKa) });
  const WATER = { C: 0, A0: 0, HA0: 0, pKa: 7, Ka: 1e-7 };

  // Exact pH after adding n mol of strong acid (n > 0) or −n mol of strong base (n < 0) to 1 L.
  // Charge balance: [H⁺] + [Na⁺] + [base cation] = [A⁻] + [OH⁻] + [acid anion]; [A⁻] = C·Ka/(Ka + [H⁺]).
  function pH(buf, n = 0) {
    const na = Math.max(0, n), nb = Math.max(0, -n), Na = buf.A0;
    const f = h => h + Na + nb - (buf.C ? buf.C * buf.Ka / (buf.Ka + h) : 0) - KW / h - na; // increasing in h
    let lo = -15, hi = 1.5;
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (f(Math.pow(10, mid)) > 0) hi = mid; else lo = mid; }
    return -(lo + hi) / 2;
  }
  // Inventory after neutralisation by stoichiometry (A⁻ + H⁺ → HA, HA + OH⁻ → A⁻ + H₂O); excess is left over.
  function inventory(buf, n) {
    let A = buf.A0, HA = buf.HA0, exAcid = 0, exBase = 0;
    if (n >= 0) { const used = Math.min(n, A); A -= used; HA += used; exAcid = n - used; }
    else { const m = -n, used = Math.min(m, HA); HA -= used; A += used; exBase = m - used; }
    return { A, HA, exAcid, exBase };
  }
  // Henderson–Hasselbalch estimate: pKa + lg([A⁻]/[HA]) from the inventory (undefined once a side is used up).
  function hh(buf, n = 0) { const q = inventory(buf, n); return q.A > 0 && q.HA > 0 ? buf.pKa + Math.log10(q.A / q.HA) : NaN; }
  // Buffer capacity β = dn/dpH (mol per pH unit, for 1 L): analytic form for a monoprotic pair plus water.
  function beta(buf, pHv) { const h = Math.pow(10, -pHv); return Math.LN10 * (h + KW / h + (buf.C ? buf.C * buf.Ka * h / Math.pow(buf.Ka + h, 2) : 0)); }
  // Amount of strong acid (dir = +1) or base (dir = −1) that moves pH by `shift` units from the start.
  function capacity(buf, dir = 1, shift = 1) {
    const p0 = pH(buf, 0), target = p0 - dir * shift; let lo = 0, hi = 2;
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; const p = pH(buf, dir * mid); if (dir > 0 ? p > target : p < target) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  const curve = (buf, nMin, nMax, steps) => Array.from({ length: steps + 1 }, (_, i) => { const n = nMin + (nMax - nMin) * i / steps; return [n, pH(buf, n)]; });

  // Universal-indicator style colour for a pH (used for the beakers; purely a display mapping).
  function indicator(p) {
    const stops = [[0, [214, 48, 49]], [3, [240, 98, 56]], [5, [255, 179, 71]], [6, [240, 222, 90]], [7, [126, 226, 128]], [8, [64, 196, 170]], [10, [80, 130, 230]], [12, [126, 90, 210]], [14, [150, 70, 180]]];
    const x = Math.max(0, Math.min(14, p));
    for (let i = 1; i < stops.length; i++) if (x <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i], u = (x - a) / (b - a);
      return ca.map((v, k) => Math.round(v + (cb[k] - v) * u));
    }
    return stops[stops.length - 1][1];
  }

  const api = { KW, PAIRS, DROP, make, WATER, pH, inventory, hh, beta, capacity, curve, indicator };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BUFFER_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
