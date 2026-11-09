'use strict';
// Trigonometry lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Angles in degrees are used where the page needs exact quarter turns (cos 90° is exactly 0, tan 90°
// is undefined); radians are used for arc length and waves. Values are IEEE doubles, not exact reals.
(function (root) {
  const TAU = 2 * Math.PI, DEG = Math.PI / 180;

  // Reduce degrees to [0, 360).
  const norm360 = d => ((d % 360) + 360) % 360;
  // cos/sin of an angle in degrees, exact at multiples of 90° (no 6.1e-17 instead of 0).
  function cosDeg(d) { const r = norm360(d); if (r === 0) return 1; if (r === 90 || r === 270) return 0; if (r === 180) return -1; return Math.cos(r * DEG); }
  function sinDeg(d) { const r = norm360(d); if (r === 0 || r === 180) return 0; if (r === 90) return 1; if (r === 270) return -1; return Math.sin(r * DEG); }
  // tan in degrees; null where cos = 0 exactly (90° + k·180°).
  function tanDeg(d) { const c = cosDeg(d); return c === 0 ? null : sinDeg(d) / c; }

  // Exact forms for the special angles (multiples of 30° and 45°).
  const EXACT = { 0: '0', 0.5: '1/2', [Math.SQRT1_2]: '√2/2', [Math.sqrt(3) / 2]: '√3/2', 1: '1', [1 / Math.sqrt(3)]: '√3/3', [Math.sqrt(3)]: '√3' };
  function exactOf(v) {
    if (v === null) return null;
    const a = Math.abs(v);
    for (const k of Object.keys(EXACT)) if (Math.abs(a - Number(k)) < 1e-12) return (v < 0 ? '−' : '') + EXACT[k];
    return null;
  }
  const isSpecial = d => { const r = norm360(d); return Number.isInteger(r) && (r % 30 === 0 || r % 45 === 0); };

  // Quadrant 1..4, or 0 on an axis; reference angle in [0, 90].
  function quadrant(d) { const r = norm360(d); if (r % 90 === 0) return 0; return Math.floor(r / 90) + 1; }
  function reference(d) { const r = norm360(d); if (r <= 90) return r; if (r <= 180) return 180 - r; if (r <= 270) return r - 180; return 360 - r; }
  // The four mirror images of an angle α in [0, 90]: α, 180 − α, 180 + α, 360 − α.
  const mirrors = a => [a, 180 - a, 180 + a, 360 - a];

  // Arc of a circle of radius r swept by θ radians: length r·θ; whole radii that fit along it.
  function arc(theta, r) { const s = r * theta; return { s, wholeRadii: Math.floor(theta + 1e-12), deg: theta / DEG }; }

  // y(t) = A sin(ω t + φ): period, first peak time in [0, T), first upward zero crossing in [0, T).
  function wave(A, w, phi) {
    const T = TAU / w, mod = (x, m) => ((x % m) + m) % m;
    return { T, peak: mod((Math.PI / 2 - phi) / w, T), rise: mod(-phi / w, T), y: t => A * Math.sin(w * t + phi) };
  }

  // a cos t + b sin t = R sin(t + φ) with R = √(a² + b²), φ = atan2(a, b).
  function phasorSum(a, b) { return { R: Math.hypot(a, b), phi: Math.atan2(a, b) }; }

  // tan sampled on [0, 2π] with NaN gaps where |tan| is beyond the clip (so the plot never joins across a pole).
  function tanSamples(n, clip) {
    const out = [];
    for (let i = 0; i <= n; i++) { const th = TAU * i / n, v = Math.tan(th); out.push([th, Math.abs(v) > clip || Math.abs(Math.cos(th)) < 1e-12 ? NaN : v]); }
    return out;
  }

  // Display a radian value as a multiple of π when it is one (to 1e-9), else as a decimal.
  function piForm(th) {
    const q = th / Math.PI;
    for (const den of [1, 2, 3, 4, 6]) { const num = Math.round(q * den); if (Math.abs(q * den - num) < 1e-9) {
      if (num === 0) return '0';
      const g = gcd(Math.abs(num), den), n = num / g, d = den / g, s = (n < 0 ? '−' : '') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + 'π';
      return d === 1 ? s : s + '/' + d;
    } }
    return null;
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  const api = { TAU, DEG, norm360, cosDeg, sinDeg, tanDeg, exactOf, isSpecial, quadrant, reference, mirrors, arc, wave, phasorSum, tanSamples, piForm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TRIG_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
