'use strict';
// Two-source interference model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Water-surface waves seen from above, lengths in cm, time in s, displacement in mm.
// Model: each source makes a sine wave of the same amplitude A everywhere (no spreading loss, no damping);
// waves add linearly (superposition). Source 1 sits at (−d/2, 0), source 2 at (+d/2, 0).
//   y_i(P, t) = A·sin(2π f_i t − 2π r_i / λ_i − φ_i),   λ_i = v / f_i
// Every pixel of the wave fields, every trace and every readout on the page comes from these functions;
// tests/core.cjs pins the claims.
(function (root) {
  const A = 1, F1 = 1, V = 2;   // amplitude 1 mm; 1 cycle per second (slowed down for teaching); speed 2 cm/s → λ = 2 cm
  const TAU = 2 * Math.PI;

  function wave(r, t, lam, phi = 0, f = F1) { return A * Math.sin(TAU * f * t - TAU * r / lam - phi); }
  const dist = (x, y, sx, sy) => Math.hypot(x - sx, y - sy);
  const sources = d => [{ x: -d / 2, y: 0 }, { x: d / 2, y: 0 }];

  // Displacement at (x, y) and time t. opts: d, lam (wave 1), phi (source 2 starts φ behind), ratio = f2 / f1.
  function field(x, y, t, { d, lam, phi = 0, ratio = 1 }) {
    const [s1, s2] = sources(d), r1 = dist(x, y, s1.x, s1.y), r2 = dist(x, y, s2.x, s2.y);
    const lam2 = lam / ratio;
    return wave(r1, t, lam, 0, F1) + wave(r2, t, lam2, phi, F1 * ratio);
  }
  // Same-frequency case: the resultant at P is itself a sine of amplitude B = 2A·|cos(δ/2)|,
  // where δ = 2π·Δr/λ + φ is how far source 2's wave lags source 1's on arrival and Δr = r₂ − r₁.
  function pointInfo(x, y, { d, lam, phi = 0 }) {
    const [s1, s2] = sources(d), r1 = dist(x, y, s1.x, s1.y), r2 = dist(x, y, s2.x, s2.y), dr = r2 - r1;
    const delta = TAU * dr / lam + phi, c = Math.cos(delta / 2);
    return { r1, r2, dr, cycles: dr / lam, delta, B: 2 * A * Math.abs(c), kind: classify(c) };
  }
  // Strict classes: loud only when |cos(δ/2)| = 1 and still only when it is 0 (to rounding); everything else is
  // "partial" with its own amplitude — a point that merely moves a little is not called still.
  function classify(c) { const a = Math.abs(c); return a > 1 - 1e-9 ? 'loud' : a < 1e-9 ? 'still' : 'partial'; }
  // Largest |y| over one period, found by sampling the actual sum (an independent check of B).
  function sampledAmp(x, y, opts, n = 720) { let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(field(x, y, i / n, opts))); return m; }

  // Point on the horizontal line y = Y whose path difference r₂ − r₁ equals c (|c| < d); Δr falls as x grows.
  function pointWithDelta(c, Y, d) {
    let lo = -200, hi = 200;
    const g = x => { const [s1, s2] = sources(d); return dist(x, Y, s2.x, s2.y) - dist(x, Y, s1.x, s1.y) - c; };
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (g(m) > 0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  // The curve r₂ − r₁ = c (one branch of a hyperbola with foci at the sources), sampled for y ∈ [0, yMax].
  // With a = d/2, α = c/2, β² = a² − α²: x = −sign(c)·α·√(1 + y²/β²). Points with r₂ > r₁ lie nearer source 1 (x < 0).
  function hyperbola(c, d, yMax, n = 80) {
    const a = d / 2, al = Math.abs(c) / 2, b2 = a * a - al * al;
    if (b2 <= 0) return null;
    const pts = [];
    for (let i = 0; i <= n; i++) { const y = yMax * i / n; pts.push({ x: -Math.sign(c) * al * Math.sqrt(1 + y * y / b2), y }); }
    return pts;
  }
  // Path differences of the loud and still curves that exist between the sources (|Δr| < d), for phase φ.
  // Loud: δ = 2πm ⇒ Δr = (m − φ/2π)·λ. Still: δ = 2πm + π ⇒ Δr = (m + ½ − φ/2π)·λ.
  function lines(d, lam, phi = 0) {
    const loud = [], still = [], s = phi / TAU;
    for (let m = -60; m <= 60; m++) {
      const a = (m - s) * lam, b = (m + 0.5 - s) * lam;
      if (Math.abs(a) < d - 1e-12) loud.push(a);
      if (Math.abs(b) < d - 1e-12) still.push(b);
    }
    return { loud, still };
  }

  // Step 4: different frequencies. The sum is a fast wave inside a slow envelope 2A·|cos(Δ/2)|, where Δ is the
  // difference of the two phases; Δ drifts by 2π(f₂ − f₁) every second, so loud and still places keep moving.
  function envelope(x, y, t, { d, lam, ratio }) {
    const [s1, s2] = sources(d), r1 = dist(x, y, s1.x, s1.y), r2 = dist(x, y, s2.x, s2.y);
    const p1 = TAU * F1 * t - TAU * r1 / lam, p2 = TAU * F1 * ratio * t - TAU * r2 / (lam / ratio);
    return 2 * A * Math.abs(Math.cos((p2 - p1) / 2));
  }
  function beatPeriod(ratio) { const df = Math.abs(F1 * ratio - F1); return df < 1e-12 ? Infinity : 1 / df; }

  // Step 5: a line of detectors at distance L. Exact loud positions (r₂ − r₁ = mλ, solved on the line) against the
  // small-angle estimate x_m ≈ m·λ·L/d; reading the first spacing backwards gives λ ≈ x₁·d/L.
  function screen(d, lam, L) {
    const exact = [], approx = [];
    for (let m = -20; m <= 20; m++) { if (Math.abs(m * lam) >= d) continue; exact.push({ m, x: pointWithDelta(-m * lam, L, d) }); approx.push({ m, x: m * lam * L / d }); }
    const x1 = exact.find(e => e.m === 1), est = x1 ? x1.x * d / L : null;
    return { exact, approx, x1: x1 ? x1.x : null, x1approx: lam * L / d, lamEst: est, err: est === null ? null : (est - lam) / lam };
  }

  // Step 6 answers.
  function quiz() {
    const lam = 2, d = 6;
    const x1 = pointWithDelta(1.5 * lam, 6, d), q1 = pointInfo(x1, 6, { d, lam });
    const x2 = pointWithDelta(lam / 2, 6, d), q2a = pointInfo(x2, 6, { d, lam }), q2b = pointInfo(x2, 6, { d, lam: lam / 2 });
    const q3 = pointInfo(0, 6, { d, lam, phi: Math.PI });
    return { q1: q1.kind, q2: [q2a.kind, q2b.kind], q3: q3.kind, q3amp: [Math.abs(wave(q3.r1, 0.3, lam)), Math.abs(wave(q3.r2, 0.3, lam, Math.PI))] };
  }

  const api = { A, F1, V, TAU, wave, dist, sources, field, pointInfo, classify, sampledAmp, pointWithDelta, hyperbola, lines, envelope, beatPeriod, screen, quiz };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WAVE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
