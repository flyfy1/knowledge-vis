'use strict';
// Sampling & aliasing lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: ideal instantaneous uniform sampling x[n] = x(n/fs), no quantisation.
(function (root) {
  // Signed alias g = f − k·fs with k chosen so g ∈ (−fs/2, fs/2]; ties (|g| = fs/2) go to +fs/2.
  function aliasK(f, fs) { return Math.ceil(f / fs - 0.5 - 1e-12); }
  function aliasSigned(f, fs) { const k = aliasK(f, fs); return { k, g: f - k * fs }; }
  function fold(f, fs) { return Math.abs(aliasSigned(f, fs).g); }
  const wrap180 = d => { let a = ((d % 360) + 360) % 360; if (a > 180 + 1e-9) a -= 360; return a; };

  // Step 0: a one-spoke wheel at f rev/s filmed at fs frames/s.
  const FPS = 24;
  function wheel(f, fs = FPS) {
    const step = 360 * f / fs, { k, g } = aliasSigned(f, fs), app = 360 * g / fs;
    return { step, turns: k + 0, app, appHz: g, edge: Math.abs(Math.abs(app) - 180) < 1e-9 };
  }
  // Spoke angle (degrees, clockwise from 12 o'clock) in frame m; the camera sees only this.
  const spoke = (f, m, fs = FPS) => wrap180(360 * f * m / fs);

  // Step 1: cos(2π f t) and its candidates |f + k·fs| through the same samples.
  const S1 = { fs: 8, T: 1 };
  const cosw = (f, t, ph = 0) => Math.cos(2 * Math.PI * f * t + ph);
  function sameSamples(f, k, fs = S1.fs, T = S1.T) {
    const g = Math.abs(f + k * fs); let d0 = 0, d1 = 0;
    for (let n = 0; n <= Math.round(T * fs); n++) d0 = Math.max(d0, Math.abs(cosw(f, n / fs) - cosw(g, n / fs)));
    // largest gap anywhere on a fine grid of [0, T] (between the samples is where the curves part)
    for (let i = 0; i <= 4000; i++) { const t = T * i / 4000; d1 = Math.max(d1, Math.abs(cosw(f, t) - cosw(g, t))); }
    return { g, d0, d1, low: fold(f, fs) };
  }

  // Step 2: audio sample rates (kHz).
  const RATES = [8, 16, 22.05, 44.1, 48];

  // Step 3: ideal (Shannon) reconstruction from a finite block of samples n = N0..N1.
  const S3 = { fs: 10, N0: -200, N1: 219, T: 2, pts: 400 };
  const sinc = u => (Math.abs(u) < 1e-12 ? 1 : Math.sin(Math.PI * u) / (Math.PI * u));
  function samples(f, ph, fs = S3.fs) { const out = []; for (let n = S3.N0; n <= S3.N1; n++) out.push(cosw(f, n / fs, ph)); return out; }
  function recon(xs, t, fs = S3.fs) { let s = 0; for (let i = 0; i < xs.length; i++) s += xs[i] * sinc(fs * t - (S3.N0 + i)); return s; }
  // What ideal reconstruction must give: the alias inside (−fs/2, fs/2]; at the edge only cos φ survives.
  function predicted(f, ph, fs = S3.fs) {
    const { g } = aliasSigned(f, fs), edge = Math.abs(Math.abs(g) - fs / 2) < 1e-9;
    if (edge) return { fa: fs / 2, amp: Math.cos(ph), phase: 0, edge, g, fn: t => Math.cos(ph) * Math.cos(Math.PI * fs * t) };
    const phase = g < 0 ? -ph : ph;
    return { fa: Math.abs(g), amp: 1, phase, edge, g, fn: t => Math.cos(2 * Math.PI * Math.abs(g) * t + phase) };
  }
  function reconRun(f, ph) {
    const xs = samples(f, ph), P = predicted(f, ph), ts = [], y = [], x = [], p = [];
    for (let i = 0; i <= S3.pts; i++) { const t = S3.T * i / S3.pts; ts.push(t); y.push(recon(xs, t)); x.push(cosw(f, t, ph)); p.push(P.fn(t)); }
    const rms = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length);
    return { ts, y, x, p, P, eOrig: rms(y, x), eAlias: rms(y, p) };
  }

  // Step 4: triangular baseband spectrum of bandwidth B, copied every fs.
  const tri = (f, B) => Math.max(0, 1 - Math.abs(f) / B);
  function sampledSpec(f, B, fs, K = 6) { let s = 0; for (let k = -K; k <= K; k++) s += tri(f - k * fs, B); return s; }
  // Area of all copies k ≠ 0 that lands inside (−fs/2, fs/2), as a fraction of the baseband area B.
  function aliasFraction(B, fs, steps = 20000) {
    const lo = -fs / 2, d = fs / steps; let s = 0;
    for (let i = 0; i < steps; i++) { const f = lo + (i + 0.5) * d; s += (sampledSpec(f, B, fs) - tri(f, B)) * d; }
    return s / B;
  }
  const aliasFractionTheory = (B, fs) => (fs >= 2 * B ? 0 : (1 - fs / (2 * B)) ** 2); // valid for B ≤ fs

  // Step 5: N-th order Butterworth anti-aliasing filter before 44.1 kHz sampling.
  const S5 = { fs: 44.1, want: 5, hum: 30, hear: 20 };
  const butter = (f, fc, N) => 1 / Math.sqrt(1 + Math.pow(f / fc, 2 * N));
  const dB = a => 20 * Math.log10(a);
  function antiAlias(fc, N) {
    return { want: dB(butter(S5.want, fc, N)), hum: dB(butter(S5.hum, fc, N)), humAt: fold(S5.hum, S5.fs), edge: dB(butter(S5.hear, fc, N)), stop: S5.fs - S5.hear, stopDb: dB(butter(S5.fs - S5.hear, fc, N)) };
  }

  const api = { aliasK, aliasSigned, fold, wrap180, FPS, wheel, spoke, S1, cosw, sameSamples, RATES, S3, sinc, samples, recon, predicted, reconRun, tri, sampledSpec, aliasFraction, aliasFractionTheory, S5, butter, dB, antiAlias };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SAMP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
