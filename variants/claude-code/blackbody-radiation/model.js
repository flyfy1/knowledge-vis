'use strict';
// Blackbody radiation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, colour and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: SI units inside (metres, kelvin, W/m² per metre of wavelength); the page converts for display.
// Quantity: spectral exitance M(λ, T) of an ideal blackbody (emissivity 1) — power leaving 1 m² of surface
// per unit wavelength, summed over all directions. Not radiance (per steradian), not per unit frequency.
(function (root) {
  const h = 6.62607015e-34, c = 2.99792458e8, k = 1.380649e-23, eV = 1.602176634e-19;
  const sigma = 2 * Math.pow(Math.PI, 5) * Math.pow(k, 4) / (15 * Math.pow(h, 3) * c * c); // 5.670374e-8 W/(m²·K⁴)
  const WIEN_X = 4.965114231744276; // root of x = 5(1 − e^(−x))
  const b = h * c / (WIEN_X * k); // Wien constant, 2.897772e-3 m·K
  const VIS = [380e-9, 750e-9];

  // Planck: M(λ,T) = 2πhc²/λ⁵ · 1/(e^x − 1), with x = hc/(λkT)
  const xOf = (lam, T) => h * c / (lam * k * T);
  function planck(lam, T) {
    const x = xOf(lam, T);
    if (x > 700) return 0;
    return 2 * Math.PI * h * c * c / Math.pow(lam, 5) / Math.expm1(x);
  }
  // Classical (Rayleigh–Jeans): every mode carries kT on average → 2πckT/λ⁴
  const rayleighJeans = (lam, T) => 2 * Math.PI * c * k * T / Math.pow(lam, 4);
  // Mode factor 2πc/λ⁴ times the mean energy per mode: classical kT, quantum hν/(e^x − 1)
  const modeFactor = lam => 2 * Math.PI * c / Math.pow(lam, 4);
  const meanEnergyRatio = x => (x < 1e-8 ? 1 - x / 2 : x / Math.expm1(x)); // ⟨E⟩/kT
  const occupancy = (x, n) => -Math.expm1(-x) * Math.exp(-n * x); // P(n lumps) = (1 − e^−x) e^(−nx)

  const wienPeak = T => b / T;
  // Numerical argmax of M(λ,T) by golden-section search on ln λ (independent of the closed form).
  function peakNumeric(T) {
    let a = Math.log(1e-3 / T), d = Math.log(1e-2 / T);
    const g = (Math.sqrt(5) - 1) / 2, f = u => planck(Math.exp(u), T);
    let x1 = d - g * (d - a), x2 = a + g * (d - a), f1 = f(x1), f2 = f(x2);
    for (let i = 0; i < 200; i++) {
      if (f1 < f2) { a = x1; x1 = x2; f1 = f2; x2 = a + g * (d - a); f2 = f(x2); }
      else { d = x2; x2 = x1; f2 = f1; x1 = d - g * (d - a); f1 = f(x1); }
    }
    return Math.exp((a + d) / 2);
  }
  const peakValue = T => planck(b / T, T);

  // ∫ M dλ between λ1 and λ2 by Simpson's rule on ln λ (dλ = λ d ln λ).
  function integrate(T, l1, l2, n = 4000, fn = planck) {
    if (n % 2) n++;
    const u1 = Math.log(l1), u2 = Math.log(l2), du = (u2 - u1) / n;
    let s = 0;
    for (let i = 0; i <= n; i++) { const lam = Math.exp(u1 + i * du), w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2; s += w * fn(lam, T) * lam; }
    return s * du / 3;
  }
  const total = T => sigma * Math.pow(T, 4);
  // Whole spectrum numerically: 0.01·b/T to 1000·b/T holds all but ~1e-8 of the power.
  const totalNumeric = T => integrate(T, 0.01 * b / T, 1000 * b / T, 6000);
  const visiblePower = T => integrate(T, VIS[0], VIS[1], 800);
  const visibleShare = T => visiblePower(T) / total(T);
  // Classical prediction integrated from λ out to infinitely long waves: 2πckT/(3λ³). Grows without bound as λ → 0.
  const rjTail = (lam, T) => 2 * Math.PI * c * k * T / (3 * Math.pow(lam, 3));
  // Shortest wavelength where the classical curve is within tol of Planck: (e^x − 1)/x = 1 + tol.
  function rjValidX(tol = 0.05) { let lo = 1e-9, hi = 5; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Math.expm1(m) / m < 1 + tol) lo = m; else hi = m; } return (lo + hi) / 2; }
  const rjValidLambda = (T, tol = 0.05) => h * c / (rjValidX(tol) * k * T);

  // CIE 1931 2° colour-matching functions, multi-lobe Gaussian fit (Wyman, Sloan & Shirley 2013, JCGT 2(2)).
  const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
  function cmf(nm) {
    return [
      1.056 * g(nm, 599.8, 37.9, 31.0) + 0.362 * g(nm, 442.0, 16.0, 26.7) - 0.065 * g(nm, 501.1, 20.4, 26.2),
      0.821 * g(nm, 568.8, 46.9, 40.5) + 0.286 * g(nm, 530.9, 16.3, 31.1),
      1.217 * g(nm, 437.0, 11.8, 36.0) + 0.681 * g(nm, 459.0, 26.0, 13.8)
    ];
  }
  function xyzToRgb(X, Y, Z) {
    let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, bb = 0.0557 * X - 0.2040 * Y + 1.0570 * Z;
    r = Math.max(0, r); gg = Math.max(0, gg); bb = Math.max(0, bb); // out of gamut (deep reds): clip negative channels
    const hi = Math.max(r, gg, bb) || 1; r /= hi; gg /= hi; bb /= hi; // colour only: brightest channel → 1
    const gam = v => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
    return [gam(r), gam(gg), gam(bb)];
  }
  // Display colour of a blackbody at T: Planck spectrum weighted by the eye's colour-matching curves (380–780 nm).
  function colorOf(T) {
    let X = 0, Y = 0, Z = 0;
    for (let nm = 380; nm <= 780; nm += 2) { const m = planck(nm * 1e-9, T), q = cmf(nm); X += m * q[0]; Y += m * q[1]; Z += m * q[2]; }
    const s = X + Y + Z;
    return { rgb: xyzToRgb(X, Y, Z), x: X / s, y: Y / s };
  }
  // Colour of a single wavelength, for the rainbow strip.
  function lineColor(nm) { const q = cmf(nm); return xyzToRgb(q[0], q[1], q[2]); }

  const PRESETS = [
    { id: 'body', T: 310 }, { id: 'ember', T: 1000 }, { id: 'bulb', T: 2800 }, { id: 'sun', T: 5772 }, { id: 'sirius', T: 9940 }
  ];

  const api = { h, c, k, eV, sigma, b, WIEN_X, VIS, xOf, planck, rayleighJeans, modeFactor, meanEnergyRatio, occupancy, wienPeak, peakNumeric, peakValue, integrate, total, totalNumeric, visiblePower, visibleShare, rjTail, rjValidX, rjValidLambda, cmf, colorOf, lineColor, PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
