'use strict';
// pH scale lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every marker, bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: dilute aqueous solutions at 25 °C, concentrations in mol/L, Kw = 1.0e-14,
// pH = −log10[H⁺] with activity taken as concentration. Strong acid / strong base only.
(function (root) {
  const KW = 1e-14;

  // Typical pH of everyday liquids (rounded textbook-style values; real samples vary).
  const LIQUIDS = [
    { id: 'stomach', pH: 1.5 }, { id: 'lemon', pH: 2.2 }, { id: 'vinegar', pH: 2.9 }, { id: 'orange', pH: 3.5 },
    { id: 'coffee', pH: 5.0 }, { id: 'rain', pH: 5.6 }, { id: 'milk', pH: 6.6 }, { id: 'water', pH: 7.0 },
    { id: 'blood', pH: 7.4 }, { id: 'sea', pH: 8.1 }, { id: 'soda', pH: 8.3 }, { id: 'soap', pH: 10.0 },
    { id: 'ammonia', pH: 11.5 }, { id: 'bleach', pH: 12.5 }
  ];

  const hFromPH = pH => Math.pow(10, -pH);
  const pHFromH = h => -Math.log10(h);
  // 25 °C: below 7 acidic, exactly 7 neutral, above 7 alkaline (values are on a 0.1 grid).
  function classify(pH) { const r = Math.round(pH * 1000) / 1000; return r < 7 ? 'acid' : r > 7 ? 'base' : 'neutral'; }

  // [H⁺] written out as a plain decimal with two significant digits, plus the decimal place of its first non-zero digit.
  function decimalOf(pH) {
    const h = hFromPH(pH);
    const place = Math.floor(-Math.log10(h) + 1e-9) + (Math.abs(pH - Math.round(pH)) < 1e-9 ? 0 : 1); // integer pH n → place n
    const places = place + 1; // two significant digits
    let s = h.toFixed(Math.min(20, places));
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); // trailing zeros only after a decimal point
    return { h, text: s, place };
  }

  // Ratio of [H⁺] between two pH values (how many times more H⁺ the lower-pH sample has).
  const ratio = (pHa, pHb) => Math.pow(10, Math.abs(pHa - pHb));

  // Universal-indicator style colour (illustrative), interpolated through fixed stops.
  const UNI = [[0, [214, 40, 40]], [2, [238, 92, 42]], [4, [246, 168, 40]], [5.5, [240, 214, 52]], [7, [92, 186, 76]], [8.5, [40, 160, 150]], [10, [52, 104, 196]], [12, [84, 62, 168]], [14, [112, 40, 128]]];
  function mix(a, b, f) { return a.map((v, i) => Math.round(v + (b[i] - v) * f)); }
  function universalColor(pH) {
    const p = Math.max(0, Math.min(14, pH));
    for (let i = 1; i < UNI.length; i++) if (p <= UNI[i][0]) { const [x0, c0] = UNI[i - 1], [x1, c1] = UNI[i]; return mix(c0, c1, (p - x0) / (x1 - x0)); }
    return UNI[UNI.length - 1][1];
  }

  // Indicators: below lo → acid colour, lo..hi (inclusive) → transition colour, above hi → base colour.
  // Ranges are common textbook values; colours are illustrative.
  const INDICATORS = [
    { id: 'mo', lo: 3.1, hi: 4.4, c: [[220, 50, 50], [240, 130, 40], [240, 200, 60]] },
    { id: 'litmus', lo: 5.0, hi: 8.0, c: [[210, 50, 70], [140, 80, 170], [60, 90, 200]] },
    { id: 'btb', lo: 6.0, hi: 7.6, c: [[230, 200, 50], [70, 170, 90], [50, 90, 200]] },
    { id: 'pp', lo: 8.2, hi: 10.0, c: [[236, 236, 240], [244, 150, 200], [222, 40, 140]] }
  ];
  const indicator = id => INDICATORS.find(d => d.id === id);
  function indicatorResult(ind, pH) { return pH < ind.lo ? 'acid' : pH > ind.hi ? 'base' : 'mid'; }
  function indicatorColor(ind, pH) {
    if (pH < ind.lo) return ind.c[0];
    if (pH > ind.hi) return ind.c[2];
    const f = (pH - ind.lo) / (ind.hi - ind.lo);
    return f < 0.5 ? mix(ind.c[0], ind.c[1], f * 2) : mix(ind.c[1], ind.c[2], (f - 0.5) * 2);
  }
  // What a colour tells you about pH (a closed interval for drawing; the open ends do not matter at 0.1 resolution).
  function indicatorInterval(ind, result) { return result === 'acid' ? [0, ind.lo] : result === 'base' ? [ind.hi, 14] : [ind.lo, ind.hi]; }
  function combine(intervals) { let lo = 0, hi = 14; intervals.forEach(([a, b]) => { lo = Math.max(lo, a); hi = Math.min(hi, b); }); return [lo, hi]; }

  // Mystery samples for the indicator step (fixed list, cycled by the "new sample" button).
  const MYSTERY = [3.8, 9.1, 6.8, 2.4, 11.3, 5.4, 7.8, 4.7];

  // [H⁺] of a strong acid (or base) of formal concentration c, including water's own ionisation:
  // [H⁺] = c/2 + √(c²/4 + Kw) for an acid; for a base the same for [OH⁻] and [H⁺] = Kw/[OH⁻].
  function strongAcidH(c) { return c / 2 + Math.sqrt(c * c / 4 + KW); }
  // Signed excess: d > 0 means excess strong acid, d < 0 excess strong base (mol/L).
  function hFromExcess(d) { return d >= 0 ? strongAcidH(d) : KW / strongAcidH(-d); }

  // Step 3: dilute 1 mL of a pH-2 strong acid (or pH-12 strong base) tenfold, k times.
  const DIL = { c0: 0.01, kMax: 10 };
  function dilution(kind, k) {
    const c = DIL.c0 / Math.pow(10, k), h = hFromExcess(kind === 'acid' ? c : -c);
    const naive = kind === 'acid' ? 2 + k : 12 - k;
    return { k, c, h, pH: pHFromH(h), naive, volume: Math.pow(10, k) };
  }

  // Step 4: 20.0 mL of 0.100 mol/L HCl, NaOH 1.00 mol/L added from a dropper of 0.0200 mL per drop.
  const NEUT = { Va: 20, ca: 0.1, cb: 1.0, drop: 0.02, maxDrops: 200 };
  NEUT.eqDrops = Math.round(NEUT.Va * NEUT.ca / NEUT.cb / NEUT.drop); // 100
  function neutral(drops) {
    const Vb = drops * NEUT.drop, nH = NEUT.Va * NEUT.ca, nOH = Vb * NEUT.cb; // mmol
    const V = NEUT.Va + Vb, d = (nH - nOH) / V;
    const h = hFromExcess(d), pH = pHFromH(h);
    const left = Math.max(0, nH - nOH) / nH; // fraction of the original H⁺ still free
    // Split the pH rise into "fewer H⁺ ions" and "more volume" (only meaningful before the end point).
    const fromRemoval = left > 0 ? -Math.log10(left) : null, fromVolume = Math.log10(V / NEUT.Va);
    return { drops, Vb, V, d, h, pH, left, removed: 1 - left, fromRemoval, fromVolume, excessOH: Math.max(0, nOH - nH) };
  }

  const api = { KW, LIQUIDS, hFromPH, pHFromH, classify, decimalOf, ratio, universalColor, INDICATORS, indicator, indicatorResult, indicatorColor, indicatorInterval, combine, MYSTERY, strongAcidH, hFromExcess, DIL, dilution, NEUT, neutral };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
