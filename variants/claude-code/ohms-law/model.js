'use strict';
// Ohm's law lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every reading, curve and meter value on the page is computed here; tests/core.cjs pins the claims.
// Conventions: steady direct current, ideal battery (no internal resistance), ideal meters
// (ammeter has no resistance, voltmeter draws no current), SI units.
(function (root) {
  /* ---- step 0: n dry cells (1.5 V each) across a 10 Ω resistor ---- */
  const CELL = 1.5, R0 = 10, NMAX = 6;
  function cells(n, R = R0) { const U = n * CELL; return { n, U, I: U / R, ratio: n > 0 ? U / (U / R) : NaN }; }

  /* ---- step 1: U and R both adjustable ---- */
  function ohm(U, R) { return { U, R, I: U / R, IR: (U / R) * R }; }
  // quiz: a resistor draws 0.15 A at 3 V; what does it draw at 6 V, and what is its resistance?
  const QUIZ = { U1: 3, I1: 0.15, U2: 6 };
  function quizAnswer() { const R = QUIZ.U1 / QUIZ.I1; return { R, I2: QUIZ.U2 / R }; }

  /* ---- step 2: resistance of a wire from its length and cross-section ---- */
  // Table value (20 °C): a wire 1 m long with 1 mm² cross-section has R = 1.0 Ω for nichrome, 0.017 Ω for copper.
  const WIRE = { nichrome: 1.0, copper: 0.017 };
  function wire(L, S, material = 'nichrome') { return WIRE[material] * L / S; }

  /* ---- step 3: voltmeter–ammeter method with real meter resolution ---- */
  // Hidden resistors cycled by "another resistor"; the supply knob is continuous (step 0.05 V),
  // the voltmeter (0–3 V) is read to its 0.1 V division, the ammeter (0–0.6 A) to its 0.02 A division.
  const MYSTERY = [8, 15, 6];
  const METER = { dU: 0.1, dI: 0.02, Umax: 3, Imax: 0.6 };
  const roundTo = (v, d) => Math.round(v / d + 1e-9) * d;
  function reading(Usupply, Rx) {
    const I = Usupply / Rx;
    return { Utrue: Usupply, Itrue: I, U: Number(roundTo(Usupply, METER.dU).toFixed(2)), I: Number(roundTo(I, METER.dI).toFixed(2)) };
  }
  // Least-squares line I = U / R through the origin, fitted to the recorded readings (U on x, I on y).
  function fitR(pts) {
    let suu = 0, sui = 0; pts.forEach(p => { suu += p.U * p.U; sui += p.U * p.I; });
    return sui > 0 ? suu / sui : NaN;
  }
  const relErr = (est, truth) => (est - truth) / truth;

  /* ---- step 4: a small "2.5 V 0.3 A" bulb whose filament resistance grows as it heats ---- */
  // Simplified filament: R = Rcold · (1 + c·P), P = U·I. Rcold = 2 Ω; c chosen so 2.5 V gives exactly 0.3 A.
  const BULB = { Rcold: 2, Urated: 2.5, Irated: 0.3 };
  BULB.Rhot = BULB.Urated / BULB.Irated;
  BULB.c = (BULB.Rhot / BULB.Rcold - 1) / (BULB.Urated * BULB.Irated);
  // U = I · Rcold · (1 + c·U·I)  ⇒  Rcold·c·U·I² + Rcold·I − U = 0, positive root.
  function bulb(U) {
    if (U <= 0) return { U: 0, I: 0, R: BULB.Rcold, P: 0 };
    const a = BULB.Rcold * BULB.c * U, b = BULB.Rcold, I = (-b + Math.sqrt(b * b + 4 * a * U)) / (2 * a);
    return { U, I, R: U / I, P: U * I };
  }

  /* ---- step 5: which resistor gets hotter? R1 = 10 Ω and R2 on a 6 V battery, in parallel or in series ---- */
  const HEAT = { U: 6, R1: 10 };
  function heat(mode, R2, p = HEAT) {
    if (mode === 'parallel') {
      const I1 = p.U / p.R1, I2 = p.U / R2;
      return { mode, U1: p.U, U2: p.U, I1, I2, I: I1 + I2, P1: p.U * I1, P2: p.U * I2 };
    }
    const I = p.U / (p.R1 + R2);
    return { mode, U1: I * p.R1, U2: I * R2, I1: I, I2: I, I, P1: I * I * p.R1, P2: I * I * R2 };
  }

  const api = { CELL, R0, NMAX, cells, ohm, QUIZ, quizAnswer, WIRE, wire, MYSTERY, METER, roundTo, reading, fitR, relErr, BULB, bulb, HEAT, heat };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OHM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
