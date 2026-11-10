'use strict';
// Double-slit lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page and tests/core.cjs. All lengths are in metres unless a name says otherwise.
(function (root) {
  const PLANCK = 6.62607015e-34, C_LIGHT = 299792458;
  const M_E = 9.1093837015e-31, M_N = 1.67492749804e-27, AMU = 1.66053906660e-27;

  const sinc2 = b => { if (Math.abs(b) < 1e-12) return 1; const s = Math.sin(b) / b; return s * s; };
  const sinTheta = (y, L) => y / Math.sqrt(y * y + L * L);

  // Step 0: exact distances from the two (point) slits at ±d/2 to a screen point y at distance L.
  function paths(y, d, L) {
    const r1 = Math.hypot(L, y - d / 2), r2 = Math.hypot(L, y + d / 2);
    return { r1, r2, delta: r2 - r1 };
  }
  // Two equal waves with path difference Δ: relative intensity cos²(πΔ/λ) (1 = bright, 0 = dark).
  const pointIntensity = (y, lam, d, L) => { const c = Math.cos(Math.PI * paths(y, d, L).delta / lam); return c * c; };

  // Far-field pattern of two slits of width a (a = 0: point slits). V is the fringe visibility (1 = ideal).
  // Normalised so the centre of the ideal pattern is 1; with V = 0 the centre is 0.5 = sum of two single slits.
  function envelope(y, p) { return p.a ? sinc2(Math.PI * p.a * sinTheta(y, p.L) / p.lam) : 1; }
  function intensity(y, p) {
    const V = p.V === undefined ? 1 : p.V;
    return envelope(y, p) * (1 + V * Math.cos(2 * Math.PI * p.d * sinTheta(y, p.L) / p.lam)) / 2;
  }

  // Distance from the central bright fringe to the next one, found from the exact path difference Δ = λ.
  function firstMaxExact(lam, d, L) {
    let lo = 0, hi = L * 10;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (paths(mid, d, L).delta < lam) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  const spacingApprox = (lam, d, L) => lam * L / d;

  // Step 2: first zero of the single-slit envelope and the bright fringes that fit inside the central lobe.
  const envelopeZero = (lam, a, L) => L * Math.tan(Math.asin(Math.min(1, lam / a)));
  function fringesInLobe(d, a) {
    const r = d / a, n = Math.ceil(r - 1e-9) - 1; // orders m with |m| < d/a
    return { ratio: r, count: 2 * n + 1, missing: Math.abs(r - Math.round(r)) < 1e-9 ? Math.round(r) : 0 };
  }
  // Bright bands actually visible inside the central lobe: orders |m| < d/a whose two-slit peak still forms a
  // local maximum (an order very close to the envelope zero is swallowed even when d/a is not an integer).
  function lobeOrders(p) {
    const y0 = envelopeZero(p.lam, p.a, p.L), sp = firstMaxExact(p.lam, p.d, p.L), r = p.d / p.a;
    let count = 0;
    for (let m = 0; m < r - 0.1 && m * sp < y0; m++) { // an order within 0.1 of d/a sits on the zero: missing
      const K = 120; let best = -1, arg = 0;
      for (let k = -K; k <= K; k++) { const I = intensity(m * sp + 0.3 * sp * k / K, p); if (I > best) { best = I; arg = k; } }
      if (Math.abs(arg) < K && best > 0) count += m === 0 ? 1 : 2;
    }
    const mNear = Math.round(r);
    return { ratio: r, count, missing: mNear > 0 && Math.abs(r - mNear) < 0.1 ? mNear : 0 };
  }

  // Step 3: hits are drawn from the intensity curve (the predicted probability density) on a finite screen.
  function sampler(p, Y, N = 4000) {
    const ys = new Float64Array(N + 1), cdf = new Float64Array(N + 1);
    for (let i = 0; i <= N; i++) ys[i] = -Y + 2 * Y * i / N;
    for (let i = 1; i <= N; i++) cdf[i] = cdf[i - 1] + (intensity(ys[i - 1], p) + intensity(ys[i], p)) / 2;
    const total = cdf[N];
    for (let i = 0; i <= N; i++) cdf[i] /= total;
    return u => { // inverse CDF with linear interpolation
      let lo = 0, hi = N;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cdf[mid] < u) lo = mid; else hi = mid; }
      const span = cdf[hi] - cdf[lo];
      return ys[lo] + (span > 0 ? (u - cdf[lo]) / span : 0) * (ys[hi] - ys[lo]);
    };
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // "Dark band" = where the curve is below DARK of its peak. Returns the share of screen width it covers
  // and the share of hits the curve predicts there.
  const DARK = 0.05;
  function darkStats(p, Y, N = 20000) {
    let peak = 0; for (let i = 0; i <= N; i++) peak = Math.max(peak, intensity(-Y + 2 * Y * i / N, p));
    let all = 0, dark = 0, width = 0;
    for (let i = 0; i < N; i++) {
      const y = -Y + 2 * Y * (i + 0.5) / N, I = intensity(y, p);
      all += I; if (I < DARK * peak) { dark += I; width++; }
    }
    return { peak, widthShare: width / N, hitShare: dark / all };
  }
  const isDark = (y, p, peak) => intensity(y, p) < DARK * peak;
  // Expected counts per histogram bin for n hits.
  function expectedBins(p, Y, bins, n, sub = 20) {
    const out = new Float64Array(bins); let total = 0;
    for (let b = 0; b < bins; b++) {
      let s = 0; for (let k = 0; k < sub; k++) s += intensity(-Y + 2 * Y * (b + (k + 0.5) / sub) / bins, p);
      out[b] = s; total += s;
    }
    for (let b = 0; b < bins; b++) out[b] *= n / total;
    return out;
  }

  // Step 4: which-path information D (0 = none, 1 = certain). Ideal complementarity: V = √(1 − D²).
  const visibility = D => Math.sqrt(Math.max(0, 1 - D * D));
  const guessRight = D => (1 + D) / 2;
  // Contrast read off the curve at the central fringe: bright centre vs the first dark position.
  function measuredContrast(p) {
    const yMin = firstMaxExact(p.lam, p.d, p.L) / 2;
    const hi = intensity(0, p), lo = intensity(yMin, p);
    return { hi, lo, V: (hi - lo) / (hi + lo) };
  }

  // Step 5: de Broglie wavelength λ = h/p with relativistic momentum p = γmv.
  const OBJECTS = [
    { id: 'electron', m: M_E, v: 1.0e7 },
    { id: 'neutron', m: M_N, v: 2000 },
    { id: 'c60', m: 720 * AMU, v: 220 },
    { id: 'dust', m: 1.05e-15, v: 1e-3 },
    { id: 'baseball', m: 0.145, v: 40 }
  ];
  function deBroglie(m, v) { const g = 1 / Math.sqrt(1 - (v / C_LIGHT) ** 2); return { gamma: g, lam: PLANCK / (g * m * v) }; }
  const MATTER = { d: 1e-6, L: 1 }; // the imagined apparatus for step 5: slit spacing 1 µm, screen 1 m away
  const REFS = [ // reference sizes for the log ruler (metres)
    { id: 'proton', s: 1.7e-15 }, { id: 'atom', s: 1e-10 }, { id: 'light', s: 5e-7 }, { id: 'hair', s: 7e-5 }
  ];

  // Wavelength (nm) → sRGB colour for the screen strip (piecewise approximation, display only).
  function lamColor(nm, k = 1) {
    let r = 0, g = 0, b = 0;
    if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { g = 1; b = (510 - nm) / 20; } else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1;
    const f = nm < 420 ? 0.4 + 0.6 * (nm - 380) / 40 : nm > 680 ? 0.4 + 0.6 * (750 - nm) / 70 : 1;
    const c = v => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v * f * k)), 0.8));
    return `rgb(${c(r)},${c(g)},${c(b)})`;
  }

  const API = { PLANCK, M_E, M_N, AMU, sinc2, sinTheta, paths, pointIntensity, envelope, intensity, firstMaxExact, spacingApprox,
    envelopeZero, fringesInLobe, lobeOrders, sampler, mulberry32, DARK, darkStats, isDark, expectedBins,
    visibility, guessRight, measuredContrast, OBJECTS, deBroglie, MATTER, REFS, lamColor };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root) root.DSLIT_MODEL = API;
})(typeof window !== 'undefined' ? window : null);
