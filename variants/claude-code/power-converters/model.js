'use strict';
// Buck/boost lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every voltage, current, waveform and power figure on the page is computed here; tests/core.cjs pins the claims.
// Idealisations (stated on the page): ideal switch and diode (zero drop, instant), lossless L and C, resistive load,
// fixed switching frequency. Units: V, A, s (µs only for display), H, F, Ω, W.
(function (root) {
  const P = {
    f: 100e3, T: 10e-6,            // switching frequency and period
    L: 47e-6, C: 100e-6,           // default inductor and capacitor
    buck: { Vin: 12, R: 6 },       // step 2/3/5 buck: 12 V in, 6 Ω load
    boost: { Vin: 5, R: 24 },      // step 4 boost: 5 V in, 24 Ω load
    pulse: 10e-6                   // step 1: length of one voltage pulse on the inductor
  };

  // ---- step 0: linear regulator vs ideal switching converter ----
  function linear(Vin, Vout, I) { return { pin: Vin * I, pout: Vout * I, heat: (Vin - Vout) * I, eff: Vout / Vin, iin: I }; }
  function ideal(Vin, Vout, I) { return { pin: Vout * I, pout: Vout * I, heat: 0, eff: 1, iin: Vout * I / Vin }; }

  // ---- step 1: an inductor under voltage pulses: Δi = V·Δt / L, energy ½Li² ----
  const pulseStep = (V, L = P.L, dt = P.pulse) => V * dt / L;
  const energy = (L, i) => 0.5 * L * i * i;

  // ---- ideal converter equations (CCM) ----
  const buckRatio = D => D;                       // Vout/Vin
  const boostRatio = D => 1 / (1 - D);
  // Buck ripple and CCM boundary. K = 2L/(R·T); CCM iff K > 1 − D.
  const buckRipple = (Vin, D, L = P.L, T = P.T) => (Vin - D * Vin) * D * T / L;
  const boostRipple = (Vin, D, L = P.L, T = P.T) => Vin * D * T / L;
  const Kpar = (L, R, T = P.T) => 2 * L / (R * T);
  const buckCCM = (D, L, R, T = P.T) => Kpar(L, R, T) >= (1 - D) * (1 - 1e-12); // boundary counts as CCM (both formulas give D there)
  // Buck conversion ratio including DCM (standard result for ideal switch/diode with constant output voltage).
  function buckM(D, L, R, T = P.T) { const K = Kpar(L, R, T); return buckCCM(D, L, R, T) ? D : 2 / (1 + Math.sqrt(1 + 4 * K / (D * D))); }
  const Lcrit = (D, R, T = P.T) => (1 - D) * R * T / 2;

  // Step 2: inductor-current drift per cycle if the output were held at a trial voltage Vg (volt-second imbalance).
  const buckDrift = (Vin, D, Vg, L = P.L, T = P.T) => ((Vin - Vg) * D - Vg * (1 - D)) * T / L;

  // ---- time-domain simulation (RK4, ideal switch and diode) ----
  // topo 'buck' | 'boost'. Returns samples every `keep` substeps: {t, i, v, on}.
  function simulate(o) {
    const { topo, Vin, D, R } = o, L = o.L || P.L, C = o.C || P.C, T = o.T || P.T, sub = o.sub || 200, cycles = o.cycles || 100, keep = o.keep || 1;
    let i = o.i0 || 0, v = o.v0 || 0, t = 0; const h = T / sub, out = [];
    const deriv = (ii, vv, on) => {
      let vL, iC;
      if (topo === 'buck') { vL = (on ? Vin : 0) - vv; iC = ii - vv / R; }
      else { vL = on ? Vin : Vin - vv; iC = (on ? 0 : ii) - vv / R; }
      if (!on && ii <= 0 && vL < 0) vL = 0;          // diode blocks: current cannot reverse (DCM)
      return [vL / L, iC / C];
    };
    for (let c = 0; c < cycles; c++) for (let s = 0; s < sub; s++) {
      const on = (s + 0.5) / sub < D;
      if (s % keep === 0) out.push({ t, i, v, on });
      const k1 = deriv(i, v, on), k2 = deriv(i + h / 2 * k1[0], v + h / 2 * k1[1], on), k3 = deriv(i + h / 2 * k2[0], v + h / 2 * k2[1], on), k4 = deriv(i + h * k3[0], v + h * k3[1], on);
      i += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); v += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); t += h;
      if (!on && i < 0) i = 0;
    }
    out.push({ t, i, v, on: false });
    return out;
  }
  // Averages over the last cycle of a run.
  function lastCycle(run, perCycle) {
    const seg = run.slice(run.length - 1 - perCycle, run.length - 1);
    const avg = k => seg.reduce((s, p) => s + p[k], 0) / seg.length;
    return { v: avg('v'), i: avg('i'), iMin: Math.min(...seg.map(p => p.i)), iMax: Math.max(...seg.map(p => p.i)), vMin: Math.min(...seg.map(p => p.v)), vMax: Math.max(...seg.map(p => p.v)), seg };
  }
  // Steady state: start near the predicted operating point and run until the waveform repeats.
  function steady(topo, Vin, D, R, L = P.L, C = P.C, cycles = 400) {
    const M = topo === 'buck' ? buckM(D, L, R) : boostRatio(D), V = M * Vin;
    const i0 = topo === 'buck' ? Math.max(0, V / R - buckRipple(Vin, D, L) / 2) : Math.max(0, V / R / (1 - D) - boostRipple(Vin, D, L) / 2);
    const sub = 200, run = simulate({ topo, Vin, D, R, L, C, sub, cycles, i0, v0: V });
    return { ...lastCycle(run, sub), predicted: V };
  }
  // Step 3: start-up from rest, sampled for display (40 samples per cycle).
  function startup(D, R, cycles = 600) {
    const sub = 200, keep = 5, run = simulate({ topo: 'buck', Vin: P.buck.Vin, D, R, sub, cycles, keep });
    const per = sub / keep, last = lastCycle(run, per);
    const peak = Math.max(...run.map(p => p.v));
    return { run, per, cycles, final: last.v, peak, target: D * P.buck.Vin, overshoot: Math.max(0, peak / (D * P.buck.Vin) - 1) };
  }
  // Second-order output filter seen at start-up: natural frequency and damping (for the step-response link).
  function filter(R, L = P.L, C = P.C) { const w0 = 1 / Math.sqrt(L * C); return { w0, f0: w0 / (2 * Math.PI), zeta: Math.sqrt(L / C) / (2 * R) }; }

  // ---- step 6: power budget of a real (lossy) converter, described only by its efficiency ----
  function budget(Vin, Vout, Iout, eff) { const pout = Vout * Iout, pin = pout / eff; return { pout, pin, loss: pin - pout, iin: pin / Vin }; }
  const QUIZ = { Vin: 5, Vout: 12, Iout: 1, eff: 0.9 };

  const api = { P, linear, ideal, pulseStep, energy, buckRatio, boostRatio, buckRipple, boostRipple, Kpar, buckCCM, buckM, Lcrit, buckDrift, simulate, lastCycle, steady, startup, filter, budget, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
