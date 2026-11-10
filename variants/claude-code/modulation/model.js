'use strict';
// Modulation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Everything is computed on real samples: fs = 102.4 kHz, N = 8192 samples (80 ms window), so the
// FFT bin spacing is 12.5 Hz and every frequency used on the page sits exactly on a bin (no leakage).
// Filters are ideal FFT masks (stated on the page). tests/core.cjs pins every claim the page makes.
(function (root) {
  const FS = 102400, N = 8192, DF = FS / N, TAU = 2 * Math.PI;
  const tAt = n => n / FS;

  // ---- radix-2 FFT (in place, complex arrays re/im) ----
  function fft(re, im, inv = false) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inv ? 1 : -1) * TAU / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ar = re[i + k], ai = im[i + k], br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ar + br; im[i + k] = ai + bi; re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
    if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
  const spec = x => { const re = Float64Array.from(x), im = new Float64Array(x.length); fft(re, im); return { re, im }; };
  // One-sided amplitude spectrum: a cosine of amplitude A at bin k shows as A.
  function amplitude(x) { const { re, im } = spec(x), out = new Float64Array(N / 2 + 1); for (let k = 0; k <= N / 2; k++) out[k] = Math.hypot(re[k], im[k]) / ((k === 0 || k === N / 2) ? N : N / 2); return out; }
  const bin = f => Math.round(f / DF);
  // Ideal filters: keep bins with lo ≤ f ≤ hi (and their mirror images), zero the rest.
  function bandKeep(x, lo, hi) {
    const { re, im } = spec(x);
    for (let k = 0; k < N; k++) { const f = (k <= N / 2 ? k : N - k) * DF; if (f < lo - 1e-9 || f > hi + 1e-9) { re[k] = 0; im[k] = 0; } }
    fft(re, im, true); return Array.from(re);
  }
  // Analytic signal of a real x (negative frequencies removed): |z| is the envelope, arg z the phase.
  function analytic(x) {
    const { re, im } = spec(x);
    for (let k = 1; k < N / 2; k++) { re[k] *= 2; im[k] *= 2; }
    for (let k = N / 2 + 1; k < N; k++) { re[k] = 0; im[k] = 0; }
    fft(re, im, true); return { re, im };
  }
  const rms = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
  const power = a => a.reduce((s, v) => s + v * v, 0) / a.length;

  // ---- messages: sums of cosines (Hz, amplitude) ----
  const MSG = {
    A: [[500, 0.6], [1500, 0.4]],   // "voice A": peak |m| = 1 (both cosines hit −1 at t = 1 ms)
    B: [[800, 0.7], [1200, 0.3]]    // "voice B"
  };
  const BAND = 1500;                 // message bandwidth B: highest tone of A
  const msg = (tones, n) => tones.reduce((s, [f, a]) => s + a * Math.cos(TAU * f * tAt(n)), 0);
  const msgArr = tones => Array.from({ length: N }, (_, n) => msg(tones, n));
  const carrier = (fc, n, ph = 0) => Math.cos(TAU * fc * tAt(n) + ph);
  // Spectral lines above a threshold, as [f, amplitude].
  function lines(x, thr = 1e-6) { const a = amplitude(x), out = []; a.forEach((v, k) => { if (v > thr) out.push([k * DF, v]); }); return out; }

  // ---- step 0: multiply by a carrier ----
  function multiply(fc, which = 'A') {
    const m = msgArr(MSG[which]), s = m.map((v, n) => v * carrier(fc, n));
    return { m, s, mLines: lines(m), sLines: lines(s) };
  }

  // ---- step 1: two voices share one wire (DSB, carriers fA, fB); recover A ----
  // Receiver for A: multiply by 2·cos(2π fA t), ideal low-pass at B. Crosstalk = what of voice B leaks through.
  function share(fA, fB) {
    const mA = msgArr(MSG.A), mB = msgArr(MSG.B);
    const wire = mA.map((v, n) => v * carrier(fA, n) + mB[n] * carrier(fB, n));
    const mixed = wire.map((v, n) => 2 * v * carrier(fA, n));
    const out = bandKeep(mixed, 0, BAND);
    const leak = out.map((v, n) => v - mA[n]);
    const pl = power(leak), pa = power(mA);
    return { mA, wire, out, wireLines: lines(wire), err: Math.sqrt(pl / pa), xtalkDb: pl < 1e-24 ? -Infinity : 10 * Math.log10(pl / pa) };
  }

  // ---- step 2: coherent demodulation with a mistuned / dephased local oscillator ----
  function coherent(fc, dfHz, phDeg) {
    const m = msgArr(MSG.A), s = m.map((v, n) => v * carrier(fc, n));
    const lo = n => 2 * Math.cos(TAU * (fc + dfHz) * tAt(n) + phDeg * Math.PI / 180);
    const out = bandKeep(s.map((v, n) => v * lo(n)), 0, 2 * BAND);   // receiver low-pass 3 kHz: leaves room for a mistuned (shifted) message
    // theory: m(t)·cos(2π·Δf·t + φ) (sum-frequency terms removed by the low-pass)
    const theory = m.map((v, n) => v * Math.cos(TAU * dfHz * tAt(n) + phDeg * Math.PI / 180));
    let num = 0, den = 0; out.forEach((v, n) => { num += v * m[n]; den += m[n] * m[n]; });
    return { m, out, theory, scale: num / den, err: rms(out.map((v, n) => v - theory[n])) };
  }

  // ---- step 3: AM with a carrier, ideal envelope detector, over-modulation ----
  function am(fc, mu) {
    const m = msgArr(MSG.A), s = m.map((v, n) => (1 + mu * v) * carrier(fc, n));
    const z = analytic(s), env = Array.from(z.re, (r, n) => Math.hypot(r, z.im[n]));
    const rec = env.map(v => (v - 1) / mu);                    // what the detector reports as m(t)
    const dist = rms(rec.map((v, n) => v - m[n])) / rms(m);   // 0 when the envelope never folds
    const pm = power(m), eff = mu * mu * pm / 2 / (0.5 + mu * mu * pm / 2);
    return { m, s, env, rec, dist, eff, minEnv: Math.min(...m.map(v => 1 + mu * v)), sLines: lines(s) };
  }

  // ---- step 4: FM ----
  // s = cos(2π fc t + β sin(2π fm t)), β = Δf / fm. Lines at fc ± k·fm with amplitudes |J_k(β)|.
  function fm(fc, fmHz, dev) {
    const beta = dev / fmHz, s = Array.from({ length: N }, (_, n) => Math.cos(TAU * fc * tAt(n) + beta * Math.sin(TAU * fmHz * tAt(n))));
    const a = amplitude(s), tot = a.reduce((q, v) => q + v * v / 2, 0);
    // 98 % bandwidth: widen a symmetric window around fc one line pair at a time
    const kc = bin(fc), step = bin(fmHz); let k = 0, inside = (a[kc] ** 2) / 2;
    while (inside < 0.98 * tot) { k++; inside += (a[kc + k * step] ** 2 + a[kc - k * step] ** 2) / 2; }
    return { beta, s, amp: a, power: tot, bw98: 2 * k * fmHz, carson: 2 * (dev + fmHz), carrierLine: a[kc], lines: lines(s, 0.005) };   // lines visible on the chart
  }
  // Bessel J_n(x) by its integral (for the tests): J_n(x) = (1/π) ∫₀^π cos(nτ − x sin τ) dτ.
  function besselJ(n, x) { const M = 4000; let s = 0; for (let i = 0; i < M; i++) { const t = (i + 0.5) * Math.PI / M; s += Math.cos(n * t - x * Math.sin(t)); } return s / M; }

  // ---- step 5: AM vs FM through the same noise ----
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(seed) { const r = rng(seed), out = new Float64Array(N); for (let i = 0; i < N; i += 2) { const u = Math.max(r(), 1e-12), v = r(), m = Math.sqrt(-2 * Math.log(u)); out[i] = m * Math.cos(TAU * v); out[i + 1] = m * Math.sin(TAU * v); } return out; }
  const NOISE = { fc: 25600, dev: 7500, mu: 1 };   // FM: Δf = 7.5 kHz, β = Δf / B = 5
  // cnrDb: unmodulated-carrier power (1/2) ÷ noise power over the whole 0–51.2 kHz sampling band. Both
  // transmitters use a unit carrier; AM at μ = 1 actually sends a little more power (0.63 vs 0.5), which favours AM.
  function noisy(cnrDb, seed = 1) {
    const m = msgArr(MSG.A), w = gauss(seed), fc = NOISE.fc;
    const sigma = Math.sqrt(0.5 / Math.pow(10, cnrDb / 10));          // noise σ per sample; reference power 1/2 (unit carrier)
    // AM: (1 + μm)·cos; receiver keeps fc ± B, takes the envelope, removes the DC, divides by μ.
    const sAM = m.map((v, n) => (1 + NOISE.mu * v) * carrier(fc, n));
    const rAM = bandKeep(sAM.map((v, n) => v + sigma * w[n]), fc - BAND, fc + BAND);
    const zA = analytic(rAM), envA = Array.from(zA.re, (r, n) => Math.hypot(r, zA.im[n]));
    const meanA = envA.reduce((q, v) => q + v, 0) / N;
    const outAM = bandKeep(envA.map(v => (v - meanA) / NOISE.mu), 0, BAND);
    // FM: phase = 2π Δf ∫m dt (exact integral of the cosines); receiver keeps the Carson band, measures the
    // instantaneous frequency from consecutive samples of the analytic signal, low-passes to B, divides by Δf.
    const intM = n => MSG.A.reduce((q, [f, a]) => q + a * Math.sin(TAU * f * tAt(n)) / (TAU * f), 0);
    const sFM = Array.from({ length: N }, (_, n) => Math.cos(TAU * fc * tAt(n) + TAU * NOISE.dev * intM(n)));
    const carson = NOISE.dev + BAND;
    const rFM = bandKeep(sFM.map((v, n) => v + sigma * w[n]), fc - carson, fc + carson);
    const z = analytic(rFM), fi = new Array(N);
    for (let n = 0; n < N; n++) { const p = (n + N - 1) % N, re = z.re[n] * z.re[p] + z.im[n] * z.im[p], im = z.im[n] * z.re[p] - z.re[n] * z.im[p]; fi[n] = Math.atan2(im, re) * FS / TAU - fc; }
    const outFM = bandKeep(fi.map(v => v / NOISE.dev), 0, BAND);
    // The one-sample difference delays the estimate by half a sample; compare against m at t − ½/fs.
    const mHalf = Array.from({ length: N }, (_, n) => MSG.A.reduce((q, [f, a]) => q + a * Math.cos(TAU * f * (n - 0.5) / FS), 0));
    const snr = (out, ref) => 10 * Math.log10(power(ref) / power(out.map((v, n) => v - ref[n])));
    return { m, outAM, outFM, snrAM: snr(outAM, m), snrFM: snr(outFM, mHalf), sigma, pAM: power(sAM), pFM: power(sFM) };
  }

  const api = { FS, N, DF, fft, amplitude, bin, bandKeep, analytic, rms, power, MSG, BAND, msgArr, lines, multiply, share, coherent, am, fm, besselJ, gauss, NOISE, noisy };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MOD_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
