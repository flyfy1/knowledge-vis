'use strict';
// Laplace transform & ROC lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, map and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: bilateral Laplace transform X(s) = ∫ x(t) e^{−st} dt, s = σ + jω; complex numbers as [re, im].
(function (root) {
  const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  const cabs = a => Math.hypot(a[0], a[1]);
  const cexp = a => { const m = Math.exp(a[0]); return [m * Math.cos(a[1]), m * Math.sin(a[1])]; };

  // Step 0: e^{st} = e^{σt}(cos ωt + j sin ωt).
  function est(sig, w, t) { return cexp([sig * t, w * t]); }
  function character(sig, w) {
    return { half: sig < 0 ? Math.LN2 / -sig : null, dbl: sig > 0 ? Math.LN2 / sig : null, period: w > 0 ? 2 * Math.PI / w : null };
  }

  // Step 1: x(t) = e^{at}u(t). At real s = σ the integrand is e^{(a−σ)t}; I(T) = ∫₀ᵀ e^{(a−σ)t} dt.
  function runningIntegral(a, sig, T) { const c = a - sig; return Math.abs(c) < 1e-12 ? T : (Math.exp(c * T) - 1) / c; }
  // Independent check: midpoint Riemann sum.
  function runningIntegralNumeric(a, sig, T, n = 20000) { const d = T / n; let s = 0; for (let i = 0; i < n; i++) s += Math.exp((a - sig) * (i + 0.5) * d) * d; return s; }
  const converges = (a, sig) => sig > a;
  const limit = (a, sig) => (sig > a ? 1 / (sig - a) : Infinity);
  // Complex version at any s: ∫₀^∞ e^{at} e^{−st} dt = 1/(s − a) when Re s > a.
  function laplaceRightNumeric(a, s, T = 60, n = 120000) {
    const d = T / n; let acc = [0, 0];
    for (let i = 0; i < n; i++) { const t = (i + 0.5) * d; acc = cadd(acc, cexp([(a - s[0]) * t, -s[1] * t])); }
    return [acc[0] * d, acc[1] * d];
  }
  // Left-sided −e^{at}u(−t): ∫_{−∞}^0 −e^{at} e^{−st} dt = 1/(s − a) when Re s < a.
  function laplaceLeftNumeric(a, s, T = 60, n = 120000) {
    const d = T / n; let acc = [0, 0];
    for (let i = 0; i < n; i++) { const t = -(i + 0.5) * d; acc = csub(acc, cexp([(a - s[0]) * t, -s[1] * t])); }
    return [acc[0] * d, acc[1] * d];
  }

  // Steps 2 and 5: damped oscillator with poles p = −α ± jβ, H(s) = (α² + β²)/((s − p)(s − p̄)), so H(0) = 1.
  function Hpair(alpha, beta, s) {
    const p1 = [-alpha, beta], p2 = [-alpha, -beta];
    return cdiv([alpha * alpha + beta * beta, 0], cmul(csub(s, p1), csub(s, p2)));
  }
  // Geometric reading on the jω axis: |H(jω)| = (α² + β²)/(d₁·d₂), d = distance from jω to each pole.
  function geometry(alpha, beta, w) {
    const d1 = Math.hypot(alpha, w - beta), d2 = Math.hypot(alpha, w + beta);
    return { d1, d2, gain: (alpha * alpha + beta * beta) / (d1 * d2) };
  }
  const peakW = (alpha, beta) => (beta > alpha ? Math.sqrt(beta * beta - alpha * alpha) : 0);
  // The impulse response of H: h(t) = (α² + β²)/β · e^{−αt} sin(βt) for t ≥ 0 (causal; ROC Re s > −α).
  const hPair = (alpha, beta, t) => (t < 0 ? 0 : (alpha * alpha + beta * beta) / beta * Math.exp(-alpha * t) * Math.sin(beta * t));
  // Slice through the terrain at Re s = σ₀: |H(σ₀ + jω)|; inside the ROC only when σ₀ > −α.
  function slicePeak(alpha, beta, sig0, wMax = 4, n = 8000) {
    let best = 0, at = 0;
    for (let i = 0; i <= n; i++) { const w = wMax * i / n, g = cabs(Hpair(alpha, beta, [sig0, w])); if (g > best) { best = g; at = w; } }
    return { peak: best, at };
  }

  // Step 4: a pole pair p = σp ± jωp, impulse response e^{σp t} cos(ωp t) (the t ≥ 0 part of the inverse of (s − σp)/((s − σp)² + ωp²)).
  const hPole = (sp, wp, t) => (t < 0 ? 0 : Math.exp(sp * t) * Math.cos(wp * t));
  function poleCharacter(sp, wp) {
    const kind = Math.abs(sp) < 1e-9 ? 'marginal' : sp < 0 ? 'stable' : 'unstable';
    return { kind, settle: sp < 0 ? Math.log(50) / -sp : null, period: wp > 0 ? 2 * Math.PI / wp : null, grow: sp > 0 ? Math.LN2 / sp : null };
  }

  const api = { cadd, csub, cmul, cdiv, cabs, cexp, est, character, runningIntegral, runningIntegralNumeric, converges, limit, laplaceRightNumeric, laplaceLeftNumeric, Hpair, geometry, peakW, hPair, slicePeak, hPole, poleCharacter };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LAP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
