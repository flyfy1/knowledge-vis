'use strict';
// Climate energy ledger lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every beam, bar, curve and number on the page comes from here; tests/core.cjs pins the claims.
// Zero-dimensional energy balance: sunlight at the top of the atmosphere, a planetary albedo, a surface that emits
// as a blackbody, and (from step 4) one grey atmospheric layer that absorbs a fraction ε of the surface's infrared.
(function (root) {
  const S = 1361;               // W/m², total solar irradiance at Earth's distance
  const SIGMA = 5.670374419e-8; // W/(m²·K⁴), Stefan–Boltzmann constant
  const C_MIX = 4.18e6 * 50;    // J/(m²·K): 50 m of ocean mixed layer (water 4.18 MJ per m³ per K)
  const YEAR = 365.25 * 86400;
  const rad = d => d * Math.PI / 180;

  // ---- step 0: one beam, noon at the equinox ----
  const elevation = latDeg => 90 - Math.abs(latDeg);              // Sun's height above the horizon at equinox noon
  const noonFlux = latDeg => S * Math.sin(rad(elevation(latDeg))); // W per m² of level ground, top of atmosphere
  const spread = latDeg => 1 / Math.sin(rad(elevation(latDeg)));   // footprint length ÷ beam width

  // ---- step 1: spreading over a day and over the globe (equinox) ----
  const dailyMean = latDeg => S / Math.PI * Math.cos(rad(latDeg)); // 24-hour mean at the equinox
  // Area-weighted mean of dailyMean over a latitude band [a, b] (degrees): ∫Q cosφ dφ / ∫cosφ dφ.
  function bandMean(a, b) {
    const A = rad(a), B = rad(b);
    const num = S / Math.PI * ((B - A) / 2 + (Math.sin(2 * B) - Math.sin(2 * A)) / 4);
    return num / (Math.sin(B) - Math.sin(A));
  }
  const bandArea = (a, b) => (Math.sin(rad(b)) - Math.sin(rad(a))) / 2; // share of the globe's surface
  // Nine pairs of 10° bands, equator outward; each pair is a band in each hemisphere (equal at the equinox).
  const BANDS = Array.from({ length: 9 }, (_, i) => [10 * i, 10 * i + 10]);
  const globalMean = () => S / 4;
  // Running area-weighted mean after the first k pairs (the two hemispheres are mirror images, so the north band stands for both).
  function runningMean(k) {
    let w = 0, s = 0;
    for (let i = 0; i < k; i++) { const [a, b] = BANDS[i], ar = bandArea(a, b); w += ar; s += ar * bandMean(a, b); }
    return w ? s / w : 0;
  }

  // ---- step 2: reflection ----
  const SURFACES = [
    { id: 'ocean', alpha: 0.06 }, { id: 'forest', alpha: 0.15 }, { id: 'earth', alpha: 0.30 }, { id: 'desert', alpha: 0.40 }, { id: 'snow', alpha: 0.80 }
  ];
  const absorbed = alpha => (1 - alpha) * S / 4;

  // ---- step 3: no atmosphere ----
  const emit = T => SIGMA * T ** 4;
  const Te = alpha => Math.pow(absorbed(alpha) / SIGMA, 0.25);
  // ---- step 4: one grey layer ----
  const Ts = (alpha, eps) => Math.pow(absorbed(alpha) / (SIGMA * (1 - eps / 2)), 0.25);
  function ledger(alpha, eps) {
    const ts = Ts(alpha, eps), up = emit(ts), ta = ts / Math.pow(2, 0.25), layer = eps * emit(ta);
    const inc = S / 4, refl = alpha * inc, abs = inc - refl, escape = (1 - eps) * up;
    return { inc, refl, abs, ts, ta, up, escape, intoLayer: eps * up, layerUp: layer, layerDown: layer, olr: escape + layer, surfaceIn: abs + layer };
  }
  // ---- steps 3 and 5: warming or cooling towards balance ----
  // C dT/dt = absorbed(α) − (1 − ε/2)·σT⁴ (the layer adjusts instantly). Returns samples every dtYears.
  function relax(alpha, eps, T0, years, dtYears = 0.01, C = C_MIX) {
    const Q = absorbed(alpha), k = 1 - eps / 2, h = dtYears * YEAR, out = [{ t: 0, T: T0, N: Q - k * emit(T0) }];
    let T = T0;
    const f = x => (Q - k * emit(x)) / C;
    for (let i = 1; i <= Math.round(years / dtYears); i++) {
      const k1 = f(T), k2 = f(T + h * k1 / 2), k3 = f(T + h * k2 / 2), k4 = f(T + h * k3);
      T += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      out.push({ t: i * dtYears, T, N: Q - k * emit(T) });
    }
    return out;
  }
  const tauYears = (alpha, eps, C = C_MIX) => C / (4 * (1 - eps / 2) * SIGMA * Ts(alpha, eps) ** 3) / YEAR;
  const EPS_EARTH = 0.78; // chosen so the one-layer model lands near the observed ~288 K mean surface temperature

  const api = { S, SIGMA, C_MIX, YEAR, elevation, noonFlux, spread, dailyMean, bandMean, bandArea, BANDS, globalMean, runningMean, SURFACES, absorbed, emit, Te, Ts, ledger, relax, tauYears, EPS_EARTH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CLIMATE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
