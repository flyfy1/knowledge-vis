'use strict';
// Wavelets lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, image and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: sample rate FS = 256 samples per second; frequencies in Hz; "magnitude" means |coefficient|.
(function (root) {
  const FS = 256;

  /* ---------- seeded noise (mulberry32 + Box–Muller) ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(seed, n) {
    const u = rng(seed), out = [];
    while (out.length < n) {
      const a = Math.max(1e-12, u()), b = u(), r = Math.sqrt(-2 * Math.log(a));
      out.push(r * Math.cos(2 * Math.PI * b)); if (out.length < n) out.push(r * Math.sin(2 * Math.PI * b));
    }
    return out;
  }

  /* ---------- radix-2 FFT (in place on re/im arrays) ---------- */
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }
  function dftMag(x) {
    const re = x.slice(), im = new Array(x.length).fill(0); fft(re, im);
    return re.map((r, k) => ({ mag: Math.hypot(r, im[k]), phase: Math.atan2(im[k], r) }));
  }

  /* ---------- step 0: a tone burst slid in time ---------- */
  const S0 = { N: 256, f: 32, width: 0.04 };
  // 1 s record; Gaussian-enveloped 32 Hz burst centred at t0 (s), wrapped around the record (circular).
  function burst(t0) {
    const out = [];
    for (let n = 0; n < S0.N; n++) {
      let d = n / FS - t0; d -= Math.round(d); // circular distance on a 1 s record
      out.push(Math.exp(-0.5 * (d / S0.width) ** 2) * Math.cos(2 * Math.PI * S0.f * d));
    }
    return out;
  }
  function burstSpectrum(t0) {
    const X = dftMag(burst(t0)), mag = X.slice(0, S0.N / 2 + 1).map(q => q.mag * 2 / S0.N);
    return { mag, phase: X[S0.f].phase, peakBin: S0.f };
  }

  /* ---------- shared test signal (steps 1 and 3) ---------- */
  // 2 s record: two steady tones 12 Hz and 20 Hz (close in frequency) plus two short 72 Hz clicks
  // at 0.97 s and 1.03 s (close in time). Click envelope σ = 4 ms.
  const SIG = { N: 512, tones: [12, 20], clickF: 72, clicks: [0.97, 1.03], clickW: 0.004, clickA: 2 };
  function testSignal() {
    const out = [];
    for (let n = 0; n < SIG.N; n++) {
      const tt = n / FS; let v = 0;
      SIG.tones.forEach(f => { v += 0.5 * Math.cos(2 * Math.PI * f * tt); });
      SIG.clicks.forEach(c => { const d = tt - c; v += SIG.clickA * Math.exp(-0.5 * (d / SIG.clickW) ** 2) * Math.cos(2 * Math.PI * SIG.clickF * d); });
      out.push(v);
    }
    return out;
  }

  /* ---------- step 1: short-time Fourier transform with a Gaussian window ---------- */
  const LENS = [16, 32, 64, 128, 256];
  const NFFT = 512, HOP = 4;
  // Window of L samples, Gaussian with σ = L/6 samples (cut at ±3σ).
  function gaussWin(L) { const s = L / 6, c = (L - 1) / 2; return Array.from({ length: L }, (_, i) => Math.exp(-0.5 * ((i - c) / s) ** 2)); }
  // Spreads are standard deviations of the energy (|·|²) in time and in frequency; for a Gaussian of
  // parameter σ that is σ/√2 in time, and the product σt·σf is exactly 1/(4π) (untruncated).
  const winSigmaT = L => L / 6 / FS / Math.SQRT2;           // seconds
  const winSigmaF = L => 1 / (4 * Math.PI * winSigmaT(L));  // Hz
  // Measured σt (from w²) and σf (from |W(f)|²) of the truncated window, for the tests and the readout.
  function winSpread(L) {
    const w = gaussWin(L), c = (L - 1) / 2; let e = 0, m2 = 0;
    w.forEach((v, i) => { e += v * v; m2 += v * v * (i - c) ** 2; });
    const st = Math.sqrt(m2 / e) / FS;
    const re = new Array(4096).fill(0), im = new Array(4096).fill(0); w.forEach((v, i) => { re[i] = v; }); fft(re, im);
    let ef = 0, f2 = 0;
    for (let k = 0; k < 4096; k++) { const kk = k < 2048 ? k : k - 4096, p = re[k] * re[k] + im[k] * im[k], f = kk * FS / 4096; ef += p; f2 += p * f * f; }
    return { st, sf: Math.sqrt(f2 / ef), prod: st * Math.sqrt(f2 / ef) };
  }
  // Spectrogram magnitude: frames every HOP samples, frequencies k·FS/NFFT for k = 0..NFFT/2.
  function stft(x, L) {
    const w = gaussWin(L), half = Math.floor(L / 2), frames = [];
    const norm = 2 / w.reduce((s, v) => s + v, 0); // a unit cosine reads ≈ 1 at its frequency
    for (let c = 0; c < x.length; c += HOP) {
      const re = new Array(NFFT).fill(0), im = new Array(NFFT).fill(0);
      for (let i = 0; i < L; i++) { const n = c - half + i; if (n >= 0 && n < x.length) re[i] = x[n] * w[i]; }
      fft(re, im);
      const col = new Float64Array(NFFT / 2 + 1);
      for (let k = 0; k <= NFFT / 2; k++) col[k] = Math.hypot(re[k], im[k]) * norm;
      frames.push(col);
    }
    return { frames, tAt: j => j * HOP / FS, fAt: k => k * FS / NFFT, df: FS / NFFT };
  }

  /* ---------- steps 2–3: Morlet wavelet ---------- */
  // ψ_f(t) = exp(−t²/(2s²))·e^{i2πft} with envelope parameter s = ω0/(2πf): the envelope holds the same
  // number of cycles at every f. Energy spreads (same convention as the STFT window): σt = s/√2, σf = 1/(4πσt).
  const morletS = (f, w0) => w0 / (2 * Math.PI * f);
  const morletSigmaT = (f, w0) => morletS(f, w0) / Math.SQRT2;
  const morletSigmaF = (f, w0) => f / (Math.SQRT2 * w0);
  const cyclesInside = (f, w0) => 2 * morletSigmaT(f, w0) * f; // cycles within ±σt = ω0/(√2·π)
  // Scalogram on a log-spaced frequency grid; coefficient normalised so a unit cosine reads ≈ 1.
  const FGRID = Array.from({ length: 64 }, (_, i) => 4 * Math.pow(30, i / 63)); // 4 … 120 Hz
  function cwt(x, w0, freqs = FGRID) {
    const rows = [];
    for (const f of freqs) {
      const st = morletS(f, w0) * FS, half = Math.ceil(4 * st), kr = [], ki = []; let s = 0;
      for (let i = -half; i <= half; i++) { const g = Math.exp(-0.5 * (i / st) ** 2); kr.push(g * Math.cos(2 * Math.PI * f * i / FS)); ki.push(g * Math.sin(2 * Math.PI * f * i / FS)); s += g; }
      const norm = 2 / s, row = new Float64Array(Math.ceil(x.length / HOP));
      for (let c = 0, j = 0; c < x.length; c += HOP, j++) {
        let re = 0, im = 0;
        for (let i = -half; i <= half; i++) { const n = c + i; if (n < 0 || n >= x.length) continue; re += x[n] * kr[i + half]; im -= x[n] * ki[i + half]; }
        row[j] = Math.hypot(re, im) * norm;
      }
      rows.push(row);
    }
    return { rows, freqs, tAt: j => j * HOP / FS };
  }
  // Two peaks count as "separated" when the lowest point between them falls below half the smaller peak.
  function separated(arr, i0, i1) {
    let p0 = 0, p1 = 0, a0 = i0, a1 = i1;
    // local peaks searched within ±25 % of the spacing around each target index
    const r = Math.max(1, Math.round(Math.abs(i1 - i0) / 4));
    for (let i = i0 - r; i <= i0 + r; i++) if (arr[i] > p0) { p0 = arr[i]; a0 = i; }
    for (let i = i1 - r; i <= i1 + r; i++) if (arr[i] > p1) { p1 = arr[i]; a1 = i; }
    let lo = Infinity; for (let i = a0; i <= a1; i++) lo = Math.min(lo, arr[i]);
    const dip = lo / Math.min(p0, p1);
    return { dip, ok: dip < 0.5 };
  }
  // Resolution of the two tones (along frequency at t = 0.5 s) and the two clicks (along time at 72 Hz).
  function stftResolution(L) {
    const S = stft(testSignal(), L), j = Math.round(0.5 * FS / HOP), col = S.frames[j];
    const tones = separated(col, Math.round(12 / S.df), Math.round(20 / S.df));
    const k72 = Math.round(72 / S.df), row = S.frames.map(c => c[k72]);
    const clicks = separated(row, Math.round(0.97 * FS / HOP), Math.round(1.03 * FS / HOP));
    return { tones, clicks, S };
  }
  function cwtResolution(w0) {
    const x = testSignal(), fr = [12, 14, 16, 18, 20], cw = cwt(x, w0, fr), j = Math.round(0.5 * FS / HOP);
    const tones = separated(cw.rows.map(r => r[j]), 0, 4);
    const row = cwt(x, w0, [72]).rows[0];
    const clicks = separated(row, Math.round(0.97 * FS / HOP), Math.round(1.03 * FS / HOP));
    return { tones, clicks };
  }

  /* ---------- step 4: Haar transform of a step ---------- */
  // Orthonormal Haar: each level replaces pairs (a, b) by ((a+b)/√2, (a−b)/√2).
  function haar(x) {
    let a = x.slice(); const details = [];
    while (a.length > 1) {
      const na = [], d = [];
      for (let i = 0; i < a.length; i += 2) { na.push((a[i] + a[i + 1]) / Math.SQRT2); d.push((a[i] - a[i + 1]) / Math.SQRT2); }
      details.unshift(d); a = na;
    }
    return { approx: a, details }; // details[0] is the coarsest level (1 coefficient), last is finest (N/2)
  }
  function ihaar(h) {
    let a = h.approx.slice();
    for (const d of h.details) { const na = []; for (let i = 0; i < a.length; i++) { na.push((a[i] + d[i]) / Math.SQRT2, (a[i] - d[i]) / Math.SQRT2); } a = na; }
    return a;
  }
  // Orthonormal DCT-II (the Fourier-type basis we compare against).
  function dct(x) {
    const N = x.length;
    return x.map((_, k) => { let s = 0; for (let n = 0; n < N; n++) s += x[n] * Math.cos(Math.PI * (n + 0.5) * k / N); return s * Math.sqrt((k ? 2 : 1) / N); });
  }
  const S4 = { N: 64, lo: 0, hi: 1 };
  function stepSignal(j) { return Array.from({ length: S4.N }, (_, n) => (n < j ? S4.lo : S4.hi)); }
  // How many of the largest coefficients are needed to hold `frac` of the energy.
  function countFor(coefs, frac) {
    const e = coefs.map(c => c * c).sort((a, b) => b - a), tot = e.reduce((s, v) => s + v, 0);
    let acc = 0; for (let i = 0; i < e.length; i++) { acc += e[i]; if (acc >= frac * tot - 1e-12) return i + 1; }
    return e.length;
  }
  function energyCurve(coefs) {
    const e = coefs.map(c => c * c).sort((a, b) => b - a), tot = e.reduce((s, v) => s + v, 0); let acc = 0;
    return e.map(v => (acc += v) / tot);
  }
  const flatHaar = h => h.approx.concat(...h.details);
  function unflatHaar(c) {
    const approx = [c[0]], details = []; let i = 1;
    for (let len = 1; i < c.length; len *= 2) { details.push(c.slice(i, i + len)); i += len; }
    return { approx, details };
  }
  function idct(c) {
    const N = c.length;
    return c.map((_, n) => { let s = 0; for (let k = 0; k < N; k++) s += c[k] * Math.sqrt((k ? 2 : 1) / N) * Math.cos(Math.PI * (n + 0.5) * k / N); return s; });
  }
  // Keep the K largest-magnitude coefficients (ties broken by index), zero the rest.
  function keepK(c, K) {
    const order = c.map((v, i) => i).sort((a, b) => Math.abs(c[b]) - Math.abs(c[a]) || a - b), keep = new Set(order.slice(0, K));
    return c.map((v, i) => (keep.has(i) ? v : 0));
  }
  // Both bases are orthonormal, so the RMSE of a K-term rebuild is √(dropped energy / N).
  function rmseCurve(c) {
    const e = c.map(v => v * v).sort((a, b) => b - a), N = c.length, out = [];
    let rest = e.reduce((s, v) => s + v, 0);
    for (let K = 1; K <= N; K++) { rest -= e[K - 1]; out.push(Math.sqrt(Math.max(0, rest) / N)); }
    return out; // out[K − 1]
  }
  const firstBelow = (curve, eps) => { for (let i = 0; i < curve.length; i++) if (curve[i] <= eps) return i + 1; return curve.length; };
  function stepRecon(j, K) {
    const s = stepStats(j);
    return { ...s, haarRec: ihaar(unflatHaar(keepK(s.hc, K))), dctRec: idct(keepK(s.dc, K)), haarCurve: rmseCurve(s.hc), dctCurve: rmseCurve(s.dc) };
  }
  function stepStats(j) {
    const x = stepSignal(j), h = haar(x), hc = flatHaar(h), dc = dct(x);
    const nz = hc.filter(c => Math.abs(c) > 1e-9).length, nzD = dc.filter(c => Math.abs(c) > 1e-9).length;
    const hcur = rmseCurve(hc), dcur = rmseCurve(dc);
    return { x, h, hc, dc, nz, nzD, haarExact: firstBelow(hcur, 1e-6), dct1: firstBelow(dcur, 0.01), dct5: firstBelow(dcur, 0.05) };
  }

  /* ---------- step 5: denoising by shrinking Haar details ---------- */
  const S5 = { N: 256, sigma: 0.5, seed: 5 };
  // Piecewise-constant "blocks" signal with jumps of different sizes.
  const BLOCKS = [[0, 0], [40, 2], [72, -1], [104, 3], [120, 0.5], [168, -2], [200, 1], [232, 0]];
  function blocks() { const out = []; for (let n = 0; n < S5.N; n++) { let v = 0; BLOCKS.forEach(([s, a]) => { if (n >= s) v = a; }); out.push(v); } return out; }
  function noisy(seed = S5.seed) { const e = gauss(seed, S5.N); return blocks().map((v, i) => v + S5.sigma * e[i]); }
  const soft = (c, T) => Math.sign(c) * Math.max(0, Math.abs(c) - T);
  function denoise(y, T) {
    const h = haar(y); let kept = 0, total = 0;
    const details = h.details.map(d => d.map(c => { const s = soft(c, T); total++; if (s !== 0) kept++; return s; }));
    return { out: ihaar({ approx: h.approx, details }), kept, total };
  }
  const rmse = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length);
  const universal = () => S5.sigma * Math.sqrt(2 * Math.log(S5.N));
  const TGRID = Array.from({ length: 61 }, (_, i) => i * 0.05); // 0 … 3
  function denoiseCurve(seed = S5.seed) {
    const y = noisy(seed), x = blocks();
    const pts = TGRID.map(T => ({ T, rmse: rmse(denoise(y, T).out, x) }));
    let best = pts[0]; pts.forEach(p => { if (p.rmse < best.rmse) best = p; });
    return { pts, best, raw: rmse(y, x) };
  }

  const api = { FS, rng, gauss, fft, dftMag, S0, burst, burstSpectrum, SIG, testSignal, LENS, NFFT, HOP, gaussWin, winSigmaT, winSigmaF, winSpread, stft, morletS, morletSigmaT, morletSigmaF, cyclesInside, FGRID, cwt, separated, stftResolution, cwtResolution, haar, ihaar, dct, S4, stepSignal, countFor, energyCurve, flatHaar, unflatHaar, idct, keepK, rmseCurve, firstBelow, stepRecon, stepStats, S5, BLOCKS, blocks, noisy, soft, denoise, rmse, universal, TGRID, denoiseCurve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WAVELET_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
