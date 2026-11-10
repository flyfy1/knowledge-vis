'use strict';
// Standing-wave lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, marker and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: ideal linear string, displacement y in cm, position x in m, time t in s.
// Steps 0–2 use a slowed-down teaching clock (period T = 2 s); steps 3–4 quote real frequencies (Hz)
// but animate them slowed down with the ratios between modes kept.
(function (root) {
  const TAU = 2 * Math.PI;
  const A = 1;          // amplitude of each travelling wave (cm)
  const T = 2;          // teaching period for steps 0–2 (s)
  const ROPE = 4;       // rope shown in steps 0–1 (m)
  const LAMBDA0 = 2;    // wavelength in step 0 (m)
  const EPS = 1e-9;

  const k = lambda => TAU / lambda;
  const w = () => TAU / T;

  // ---- step 0: two identical waves running in opposite directions ----
  const yRight = (x, t, lambda) => A * Math.sin(w() * t - k(lambda) * x);
  const yLeft = (x, t, lambda) => A * Math.sin(w() * t + k(lambda) * x);
  const ySum = (x, t, lambda) => yRight(x, t, lambda) + yLeft(x, t, lambda);
  // the same sum written as envelope × clock
  const yProduct = (x, t, lambda) => 2 * A * Math.cos(k(lambda) * x) * Math.sin(w() * t);
  const clock = t => Math.sin(w() * t);
  const wrap = (v, p) => ((v % p) + p) % p;
  // Crest positions (where the wave reaches +A) inside [0, X].
  function crests(kind, t, lambda, X = ROPE) {
    // right-moving: ωt − kx = π/2 + 2πm → x = (ωt − π/2)/k − mλ ; left-moving: ωt + kx = π/2 + 2πm
    const base = kind === 'right' ? (w() * t - Math.PI / 2) / k(lambda) : (Math.PI / 2 - w() * t) / k(lambda);
    const out = [];
    for (let x = wrap(base, lambda); x <= X + EPS; x += lambda) out.push(x);
    return out;
  }
  const speed = lambda => lambda / T;

  // ---- step 1: envelope, nodes and antinodes (free rope, origin at an antinode) ----
  const amp = (x, lambda) => 2 * A * Math.abs(Math.cos(k(lambda) * x));
  const coef = (x, lambda) => 2 * A * Math.cos(k(lambda) * x); // signed spatial factor
  function nodes(lambda, X = ROPE) { const out = []; for (let x = lambda / 4; x <= X + EPS; x += lambda / 2) out.push(x); return out; }
  function antinodes(lambda, X = ROPE) { const out = []; for (let x = 0; x <= X + EPS; x += lambda / 2) out.push(x); return out; }
  // nearest node / antinode on the infinite ladders (not clipped to the rope)
  function nearestNode(x, lambda) { const m = Math.round((x - lambda / 4) / (lambda / 2)); return lambda / 4 + m * lambda / 2; }
  function nearestAntinode(x, lambda) { const m = Math.round(x / (lambda / 2)); return m * lambda / 2; }
  function classify(x, lambda) {
    const a = amp(x, lambda);
    if (a < EPS) return 'node';
    if (Math.abs(a - 2 * A) < EPS) return 'antinode';
    return 'between';
  }
  // Phase of P compared with the antinode at x = 0: same sign of the spatial factor = in step.
  function phaseVsOrigin(x, lambda) {
    const c = coef(x, lambda);
    if (Math.abs(c) < EPS) return 'none';
    return c > 0 ? 'same' : 'opposite';
  }
  // Largest |y| of point x over one full period, sampled finely (the "measured" swing).
  function swing(x, lambda, samples = 2000) {
    let m = 0;
    for (let i = 0; i < samples; i++) m = Math.max(m, Math.abs(ySum(x, T * i / samples, lambda)));
    return m;
  }

  // ---- step 2: both ends pinned ----
  // Wave coming from the right, reflected (inverted) at the fixed end x = 0:
  // A·sin(ωt + kx) − A·sin(ωt − kx) = 2A·sin(kx)·cos(ωt).
  const yIncoming = (x, t, lambda) => A * Math.sin(w() * t + k(lambda) * x);
  const yReflected = (x, t, lambda) => -A * Math.sin(w() * t - k(lambda) * x);
  const yFixed = (x, t, lambda) => yIncoming(x, t, lambda) + yReflected(x, t, lambda);
  const yFixedProduct = (x, t, lambda) => 2 * A * Math.sin(k(lambda) * x) * Math.cos(w() * t);
  const ampFixed = (x, lambda) => 2 * A * Math.abs(Math.sin(k(lambda) * x));
  const endAmp = (L, lambda) => ampFixed(L, lambda);
  // q = L ÷ (λ/2): how many half-wavelengths fit. A mode needs q to be a whole number ≥ 1
  // (checked to floating-point precision, not "near enough").
  function modeCheck(L, lambda) {
    const q = 2 * L / lambda, n = Math.round(q), dev = Math.abs(q - n);
    return { q, n: Math.max(1, n), dev, ok: n >= 1 && dev < EPS, end: endAmp(L, lambda) };
  }
  function snap(L, lambda) { const n = Math.max(1, Math.round(2 * L / lambda)); return { n, lambda: 2 * L / n }; }
  const modeLambda = (L, n) => 2 * L / n;

  // ---- step 3: the harmonic ladder ----
  const V = 143;          // wave speed on the string (m/s) — a simulation setting
  const L_GUITAR = 0.65;  // default vibrating length (m)
  const fN = (n, L = L_GUITAR, v = V) => n * v / (2 * L);
  const modeShape = (x, L, n) => Math.sin(n * Math.PI * x / L);
  const nodeCount = n => n + 1; // including both pinned ends
  const loopCount = n => n;     // antinodes
  // Count sign changes of the shape on a fine grid plus the two pinned ends: must equal n + 1.
  function countNodes(n, L = 1, samples = 4000) {
    let c = 2, prev = Math.sign(modeShape(L / samples / 2, L, n));
    for (let i = 1; i < samples; i++) { const s = Math.sign(modeShape((i + 0.5) * L / samples, L, n)); if (s !== prev) c++; prev = s; }
    return c;
  }

  // ---- step 4: driven string (schematic damping) ----
  // Point force at x_d drives every mode n with weight sin(nπx_d/L); each mode responds like a damped
  // oscillator 1/(f_n² − f² + 2iζ f_n f). Peak positions come from f_n; peak heights and widths depend on ζ,
  // which is a chosen schematic value, not measured data.
  const DRIVE = 0.1;      // drive point as a fraction of L
  const MODES = 12;
  const GRID = 81;
  function shapeAt(f, zeta, L = L_GUITAR, v = V) {
    const re = new Float64Array(GRID), im = new Float64Array(GRID);
    for (let n = 1; n <= MODES; n++) {
      const fn = fN(n, L, v), dr = fn * fn - f * f, di = 2 * zeta * fn * f, d = dr * dr + di * di;
      const g = Math.sin(n * Math.PI * DRIVE);
      const cr = g * dr / d, ci = -g * di / d;
      for (let i = 0; i < GRID; i++) { const s = Math.sin(n * Math.PI * i / (GRID - 1)); re[i] += cr * s; im[i] += ci * s; }
    }
    return { re, im };
  }
  const maxAbs = s => { let m = 0; for (let i = 0; i < GRID; i++) m = Math.max(m, Math.hypot(s.re[i], s.im[i])); return m; };
  let staticCache = null;
  function staticMax() { if (staticCache === null) staticCache = maxAbs(shapeAt(0, 0)); return staticCache; }
  // Amplification: largest swing anywhere on the string ÷ largest bend under a very slow push (f → 0).
  const gain = (f, zeta) => maxAbs(shapeAt(f, zeta)) / staticMax();
  // How much the current steady shape looks like mode n (1 = identical shape).
  function likeness(f, zeta, n) {
    const s = shapeAt(f, zeta); let pr = 0, pi = 0, ss = 0, pp = 0;
    for (let i = 0; i < GRID; i++) { const p = Math.sin(n * Math.PI * i / (GRID - 1)); pr += s.re[i] * p; pi += s.im[i] * p; ss += s.re[i] ** 2 + s.im[i] ** 2; pp += p * p; }
    return Math.hypot(pr, pi) / Math.sqrt(ss * pp);
  }
  function bestMode(f, zeta, upto = 6) { let best = 1, v = -1; for (let n = 1; n <= upto; n++) { const l = likeness(f, zeta, n); if (l > v) { v = l; best = n; } } return { n: best, like: v }; }
  // Find local maxima of gain on a 0.05 Hz grid between fLo and fHi.
  function peaks(zeta, fLo = 20, fHi = 500, step = 0.05) {
    const out = []; let a = gain(fLo, zeta), b = gain(fLo + step, zeta);
    for (let f = fLo + 2 * step; f <= fHi + 1e-9; f += step) { const c = gain(f, zeta); if (b > a && b >= c) out.push({ f: f - step, g: b }); a = b; b = c; }
    return out;
  }

  // ---- step 5: quiz, every verdict from the functions above ----
  const QUIZ = {
    q1: () => classify(1, 4),                   // λ = 4, x = 1 → 'node'
    q2: () => modeLambda(6, 1),                 // L = 6, longest λ = 2L = 12
    q3: () => {                                  // at a node both waves arrive, every instant y₁ = −y₂
      const x = nearestNode(0.3, 2); let both = true, cancel = true;
      for (let i = 0; i < 40; i++) { const t = i * 0.05, a = yRight(x, t, 2), b = yLeft(x, t, 2); if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) continue; both = both && (Math.abs(a) > 0 || Math.abs(b) > 0); cancel = cancel && Math.abs(a + b) < 1e-9; }
      return both && cancel ? 'false' : 'true';
    },
    q4: () => fN(1, L_GUITAR / 2) / fN(1, L_GUITAR) // halving the length → 2× the fundamental
  };

  const api = { TAU, A, T, ROPE, LAMBDA0, EPS, V, L_GUITAR, DRIVE, MODES, GRID, k, yRight, yLeft, ySum, yProduct, clock, crests, speed,
    amp, coef, nodes, antinodes, nearestNode, nearestAntinode, classify, phaseVsOrigin, swing,
    yIncoming, yReflected, yFixed, yFixedProduct, ampFixed, endAmp, modeCheck, snap, modeLambda,
    fN, modeShape, nodeCount, loopCount, countNodes, shapeAt, maxAbs, gain, likeness, bestMode, peaks, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SW_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
