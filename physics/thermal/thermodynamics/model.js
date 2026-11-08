'use strict';

/* A deliberately small, inspectable ideal-gas model for the lesson.
 * Units: pressure kPa, volume L, temperature K, n mol. Since
 * 1 kPa·L = 1 J, PV areas are converted to kJ for the readout.
 */
(function (root) {
  const R = 8.314; // kPa·L·mol⁻¹·K⁻¹ (same numerical value as J/mol/K)

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function pressure(n, T, V) { return n * R * T / Math.max(V, 1e-9); }
  function internalEnergy(n, T, cv = 20.785) { return n * cv * T / 1000; } // kJ; 1 kPa·L = 1 J
  function isothermalPressure(Pi, Vi, V) { return Pi * Vi / Math.max(V, 1e-9); }
  function adiabaticPressure(Pi, Vi, V, gamma = 1.4) {
    return Pi * Math.pow(Vi / Math.max(V, 1e-9), gamma);
  }
  function workIsothermal(Pi, Vi, Vf) { return Pi * Vi * Math.log(Math.max(Vf, 1e-9) / Math.max(Vi, 1e-9)) / 1000; }
  function workAdiabatic(Pi, Vi, Vf, gamma = 1.4) {
    if (Math.abs(gamma - 1) < 1e-9) return workIsothermal(Pi, Vi, Vf);
    return (Pi * Vi - adiabaticPressure(Pi, Vi, Vf, gamma) * Vf) / (gamma - 1) / 1000;
  }
  function tempAfterAdiabatic(Ti, Vi, Vf, gamma = 1.4) {
    return Ti * Math.pow(Vi / Math.max(Vf, 1e-9), gamma - 1);
  }
  function process({ n = 1, T = 300, Vi = 10, Vf = 20, type = 'isothermal', gamma = 1.4 } = {}) {
    const Pi = pressure(n, T, Vi);
    const W = type === 'adiabatic' ? workAdiabatic(Pi, Vi, Vf, gamma) : workIsothermal(Pi, Vi, Vf);
    const Tf = type === 'adiabatic' ? tempAfterAdiabatic(T, Vi, Vf, gamma) : T;
    const cv = R / (gamma - 1);
    const dU = internalEnergy(n, Tf, cv) - internalEnergy(n, T, cv);
    const Q = dU + W; // ΔU = Q − W_by_system → Q = ΔU + W
    const samples = [];
    const count = 48;
    for (let i = 0; i <= count; i++) {
      const V = Vi + (Vf - Vi) * i / count;
      const P = type === 'adiabatic' ? adiabaticPressure(Pi, Vi, V, gamma) : isothermalPressure(Pi, Vi, V);
      samples.push({ V, P });
    }
    return { Pi, Pf: samples[samples.length - 1].P, Ti: T, Tf, W, dU, Q, samples, gamma, cv };
  }
  function carnotEfficiency(Th, Tc) { return 1 - Tc / Math.max(Th, Tc + 1e-9); }
  function engineCycle({ Th = 600, Tc = 300, compression = 2 } = {}) {
    const ratio = clamp(compression, 1.1, 8);
    const hot = process({ n: 1, T: Th, Vi: 10, Vf: 10 * ratio, type: 'isothermal' });
    const cold = process({ n: 1, T: Tc, Vi: 10 * ratio, Vf: 10, type: 'isothermal' });
    const Qin = Math.max(0, hot.Q);
    const Qout = Math.abs(Math.min(0, cold.Q));
    const Wnet = Qin - Qout;
    return { hot, cold, Qin, Qout, Wnet, efficiency: Qin > 0 ? Wnet / Qin : 0, carnot: carnotEfficiency(Th, Tc) };
  }
  const api = { R, clamp, pressure, internalEnergy, isothermalPressure, adiabaticPressure, workIsothermal, workAdiabatic, tempAfterAdiabatic, process, carnotEfficiency, engineCycle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ThermodynamicsModel = api;
})(typeof window === 'undefined' ? globalThis : window);
