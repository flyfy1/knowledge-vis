'use strict';
// Fourier lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: time in seconds, frequency in Hz (cycles per second). Steps 0–2 and 4 use one
// window of T = 1 s, where every whole-number frequency fits a whole number of cycles.
(function (root) {
  const TWO_PI = 2 * Math.PI;
  // The hidden mixture of steps 0–2: three sines with these frequencies (Hz) and amplitudes.
  const TARGET = [{ f: 2, a: 0.8 }, { f: 5, a: 0.5 }, { f: 9, a: 0.3 }];
  const NS = 2000; // samples per second for the averages (midpoint rule; exact for these sines)

  // x(t) = Σ a·sin(2πft + φ). comps: [{f, a, ph}] with ph in radians (default 0).
  function mix(comps, tt) { let s = 0; for (const c of comps) s += c.a * Math.sin(TWO_PI * c.f * tt + (c.ph || 0)); return s; }
  const samples = (T = 1, ns = NS) => Array.from({ length: Math.round(T * ns) }, (_, i) => (i + 0.5) / ns);

  // Average of g(t) over [0, T].
  function mean(g, T = 1, ns = NS) { const ts = samples(T, ns); let s = 0; for (const tt of ts) s += g(tt); return s / ts.length; }
  // Residual RMS between the target and a guess (step 0).
  function rmsDiff(f1, f2, T = 1) { return Math.sqrt(mean(tt => (f1(tt) - f2(tt)) ** 2, T)); }

  // Step 1: the sine probe. b_k = 2 · mean( x(t) · sin(2πkt) ).
  const sinProbe = (x, k, T = 1) => 2 * mean(tt => x(tt) * Math.sin(TWO_PI * k * tt), T);
  const cosProbe = (x, k, T = 1) => 2 * mean(tt => x(tt) * Math.cos(TWO_PI * k * tt), T);
  // Step 2: both probes together. For A·sin(2πkt + φ): sin reading = A cos φ, cos reading = A sin φ.
  function probePair(x, k, T = 1) { const s = sinProbe(x, k, T), c = cosProbe(x, k, T); return { s, c, mag: Math.hypot(s, c), ang: Math.atan2(c, s) }; }

  // Step 3: continuous spectrum of a sum of sines seen through a window of length T.
  // X(f) = (2/T) ∫₀ᵀ x(t) e^{−i2πft} dt, in closed form (no sampling error). Returns |X(f)|.
  function cexpInt(alpha, T) { // ∫₀ᵀ e^{iαt} dt as [re, im]
    if (Math.abs(alpha) < 1e-12) return [T, 0];
    return [Math.sin(alpha * T) / alpha, (1 - Math.cos(alpha * T)) / alpha];
  }
  function windowSpectrum(comps, f, T) {
    // sin(ωt + φ) = (e^{i(ωt+φ)} − e^{−i(ωt+φ)}) / (2i)
    let re = 0, im = 0;
    for (const c of comps) {
      const w = TWO_PI * c.f, v = TWO_PI * f, ph = c.ph || 0;
      const p = cexpInt(w - v, T), q = cexpInt(-w - v, T);
      // e^{iφ}·p − e^{−iφ}·q, then divide by 2i
      const ar = Math.cos(ph) * p[0] - Math.sin(ph) * p[1] - (Math.cos(ph) * q[0] + Math.sin(ph) * q[1]);
      const ai = Math.cos(ph) * p[1] + Math.sin(ph) * p[0] - (Math.cos(ph) * q[1] - Math.sin(ph) * q[0]);
      re += c.a * ai / 2; im += -c.a * ar / 2;
    }
    return 2 / T * Math.hypot(re, im);
  }
  // Two equal tones at f1 and f1 + d: are they two separate peaks? Resolved when the lowest point
  // between them is below DIP × the lower of the two values at the tone frequencies.
  const F1 = 5, DIP = 0.8;
  // Lowest point between the two tone frequencies ÷ the smaller of the readings at those frequencies.
  function valleyRatio(d, T) {
    const comps = [{ f: F1, a: 1 }, { f: F1 + d, a: 1 }];
    const top = Math.min(windowSpectrum(comps, F1, T), windowSpectrum(comps, F1 + d, T));
    let lo = Infinity; for (let i = 0; i <= 200; i++) lo = Math.min(lo, windowSpectrum(comps, F1 + d * i / 200, T));
    return lo / top;
  }
  const resolved = (d, T) => valleyRatio(d, T) < DIP;
  // Smallest separation that resolves at window T (bisection on d·T; monotone over the slider range).
  function threshold(T) {
    let a = 0.05, b = 4; // in units of 1/T
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (resolved(m / T, T)) b = m; else a = m; }
    return b / T;
  }
  // Main-lobe width (zero to zero) of one tone seen through a window T: 2/T.
  const lobeWidth = T => 2 / T;

  // Step 4: square wave sign(sin 2πt) and its Fourier partial sums (odd harmonics, 4/(πk)).
  const square = tt => { const s = Math.sin(TWO_PI * tt); return Math.abs(s) < 1e-12 ? 0 : Math.sign(s); };
  const squareCoef = k => (k % 2 === 1 ? 4 / (Math.PI * k) : 0);
  function partialSquare(nTerms, tt) { let s = 0; for (let j = 0; j < nTerms; j++) { const k = 2 * j + 1; s += squareCoef(k) * Math.sin(TWO_PI * k * tt); } return s; }
  // Highest value of the partial sum (the overshoot next to the jump) and RMS error over one period.
  function squareStats(nTerms) {
    const kMax = 2 * nTerms - 1;
    // the first peak sits near t = 1/(4·kMax+4); search the first 1/4 period finely
    let peak = -Infinity; const n = 4000 + 400 * nTerms;
    for (let i = 1; i <= n; i++) peak = Math.max(peak, partialSquare(nTerms, 0.25 * i / n));
    // Parseval: mean square error = 1 − Σ b_k²/2 over the kept terms
    let kept = 0; for (let j = 0; j < nTerms; j++) kept += squareCoef(2 * j + 1) ** 2 / 2;
    return { peak, overshoot: peak - 1, rms: Math.sqrt(Math.max(0, 1 - kept)), kMax };
  }
  // The limit of the overshoot (Gibbs): (2/π)·Si(π) − 1 ≈ 0.17898.
  function gibbsLimit() { let s = 0; const n = 200000; for (let i = 0; i < n; i++) { const u = Math.PI * (i + 0.5) / n; s += Math.sin(u) / u; } return 2 / Math.PI * s * Math.PI / n - 1; }

  // Step 5: DFT of N samples of cos(2π f n / N).
  function dft(x) {
    const N = x.length, out = [];
    for (let k = 0; k < N; k++) { let re = 0, im = 0; for (let n = 0; n < N; n++) { const a = -TWO_PI * k * n / N; re += x[n] * Math.cos(a); im += x[n] * Math.sin(a); } out.push({ re, im, mag: Math.hypot(re, im) }); }
    return out;
  }
  const cosSamples = (f, N) => Array.from({ length: N }, (_, n) => Math.cos(TWO_PI * f * n / N));
  // Where the DFT of a cosine of whole-number frequency f (0 ≤ f ≤ N) puts its energy.
  function dftPeaks(f, N) { const a = ((f % N) + N) % N, b = (N - a) % N; return a === b ? [a] : [Math.min(a, b), Math.max(a, b)]; }
  // The lowest frequency that gives the same samples: the alias.
  const alias = (f, N) => { const a = ((f % N) + N) % N; return Math.min(a, N - a); };

  const API = { TWO_PI, TARGET, NS, mix, samples, mean, rmsDiff, sinProbe, cosProbe, probePair, cexpInt, windowSpectrum, F1, DIP, valleyRatio, resolved, threshold, lobeWidth,
    square, squareCoef, partialSquare, squareStats, gibbsLimit, dft, cosSamples, dftPeaks, alias };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.FOURIER_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
