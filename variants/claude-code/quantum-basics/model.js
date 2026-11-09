'use strict';
// Quantum basics lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, bar, curve and simulated count on the page is computed here; tests/core.cjs pins the claims.
// Scope: one qubit, ideal projective measurement, no noise or decoherence. Simulated shots use a seeded
// pseudo-random generator, so they are a demonstration of sampling, not experimental data.
(function (root) {
  const DEG = Math.PI / 180;
  // ---- complex numbers as {re, im} ----
  const cx = (re, im = 0) => ({ re, im });
  const add = (a, b) => cx(a.re + b.re, a.im + b.im);
  const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const scale = (a, k) => cx(a.re * k, a.im * k);
  const expi = t => cx(Math.cos(t), Math.sin(t));
  const abs2 = a => a.re * a.re + a.im * a.im;

  // ---- states ----
  // Step 0: real amplitudes on a circle, angle psi (degrees): α = cos ψ, β = sin ψ.
  function realState(psiDeg) { const p = psiDeg * DEG, a = Math.cos(p), b = Math.sin(p); return { a: cx(a), b: cx(b), p0: a * a, p1: b * b }; }
  // Steps 2, 4: Bloch angles θ (polar, from |0⟩) and φ (relative phase), both in degrees.
  function bloch(thDeg, phDeg) {
    const th = thDeg * DEG, ph = phDeg * DEG;
    const a = cx(Math.cos(th / 2)), b = scale(expi(ph), Math.sin(th / 2));
    const v = { x: Math.sin(th) * Math.cos(ph), y: Math.sin(th) * Math.sin(ph), z: Math.cos(th) };
    return { a, b, v, pZ: abs2(a), pX: (1 + v.x) / 2, pY: (1 + v.y) / 2 };
  }
  // Hadamard gate (a 50/50 beam splitter): new amplitudes (α + β)/√2 and (α − β)/√2.
  function hadamard(a, b) { const r = Math.SQRT1_2; return { a: scale(add(a, b), r), b: scale(sub(a, b), r) }; }
  // Probability of "+" when measuring along the direction (sin χ, 0, cos χ) in the x–z plane.
  const pAlong = (v, chiDeg) => (1 + Math.sin(chiDeg * DEG) * v.x + Math.cos(chiDeg * DEG) * v.z) / 2;

  // ---- step 3: Mach–Zehnder interferometer ----
  // After BS1 each arm carries amplitude 1/√2; the upper arm gets phase φ; BS2 is a Hadamard.
  // D0 amplitude = (1 + e^{iφ})/2, D1 amplitude = (1 − e^{iφ})/2. With a which-path marker the two
  // arms no longer interfere and probabilities add instead: ½ · ½ + ½ · ½ = ½ at each detector.
  function mz(phDeg, whichPath) {
    const e = expi(phDeg * DEG);
    const d0 = scale(add(cx(1), e), 0.5), d1 = scale(sub(cx(1), e), 0.5);
    const q0 = abs2(d0), q1 = abs2(d1);
    return { d0, d1, pQuantum: q0, p0: whichPath ? 0.5 : q0, p1: whichPath ? 0.5 : q1, armAmp: Math.SQRT1_2 };
  }

  // ---- seeded sampling ----
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // Draw n outcomes (0 or 1) with P(0) = p.
  const shots = (p, n, r) => Array.from({ length: n }, () => (r() < p ? 0 : 1));

  // ---- step 5: Z, then (optionally) a measurement along χ, then Z again; start in |0⟩ ----
  // Exact probability that the final Z gives 0: with the middle measurement (1 + cos²χ)/2, without it 1.
  const pFinalZero = (chiDeg, middle) => (middle ? (1 + Math.cos(chiDeg * DEG) ** 2) / 2 : 1);
  function chain(chiDeg, middle, n, r) {
    const c = Math.cos(chiDeg * DEG), out = { first: [0, 0], mid: [0, 0], last: [0, 0] };
    for (let i = 0; i < n; i++) {
      out.first[0]++;                         // |0⟩ measured in Z always gives 0 and stays |0⟩
      let z = 1;                              // Bloch z of the state along the measured axis family
      let along = null;
      if (middle) { const plus = r() < (1 + c) / 2; out.mid[plus ? 0 : 1]++; along = plus ? 1 : -1; }
      const p0 = middle ? (1 + along * c) / 2 : (1 + z) / 2;
      out.last[r() < p0 ? 0 : 1]++;
    }
    return out;
  }

  const api = { DEG, cx, add, sub, mul, scale, expi, abs2, realState, bloch, hadamard, pAlong, mz, rng, shots, pFinalZero, chain };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
