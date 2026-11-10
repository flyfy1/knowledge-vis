'use strict';
// Z-transform lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, stem, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: bilateral X(z) = Σ x[n] z^{−n}; Ω in radians per sample; complex numbers as [re, im].
(function (root) {
  const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  const cabs = a => Math.hypot(a[0], a[1]);
  const polar = (r, th) => [r * Math.cos(th), r * Math.sin(th)];
  const cpow = (z, n) => { const r = cabs(z), th = Math.atan2(z[1], z[0]); return polar(Math.pow(r, n), th * n); };
  const wrapPi = a => { let v = ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; if (v <= -Math.PI + 1e-12) v += 2 * Math.PI; return v; };

  // Step 0: z0 = r·e^{jθ}; x[n] = Re(z0ⁿ) = rⁿ cos(θn).
  const seq0 = (r, th, n) => Math.pow(r, n) * Math.cos(th * n);

  // Step 1: x[n] = aⁿu[n] (real a); partial sums S_N = Σ_{n=0}^{N} (a/z)ⁿ; closed form z/(z − a) when |z| > |a|.
  function partialSums(a, z, N) {
    const q = cdiv([a, 0], z), out = [[1, 0]]; let term = [1, 0], s = [1, 0];
    for (let n = 1; n <= N; n++) { term = cmul(term, q); s = cadd(s, term); out.push(s); }
    return out;
  }
  const closed1 = (a, z) => cdiv(z, csub(z, [a, 0]));

  // Step 2: z = e^{sT}.
  function s2z(sig, w, T = 1) { return { z: polar(Math.exp(sig * T), w * T), r: Math.exp(sig * T), ang: wrapPi(w * T) }; }

  // Step 3: X(z) = 1/((1 − p1 z⁻¹)(1 − p2 z⁻¹)), real poles 0 < |p1| < |p2|. Partial fractions A/(1 − p1 z⁻¹) + B/(1 − p2 z⁻¹).
  // Each term is causal (pⁿu[n]) if the ROC lies outside |p|, anti-causal (−pⁿu[−n−1]) if inside.
  const ROCS = ['out', 'ring', 'in'];
  function twoPole(p1, p2) { return { A: p1 / (p1 - p2), B: p2 / (p2 - p1) }; }
  function termSeq(c, p, causal, n) { if (causal) return n >= 0 ? c * Math.pow(p, n) : 0; return n < 0 ? -c * Math.pow(p, n) : 0; }
  function seq3(p1, p2, roc, n) {
    const { A, B } = twoPole(p1, p2);
    const c1 = roc !== 'in', c2 = roc === 'out'; // outside |p1| for 'out' and 'ring'; outside |p2| only for 'out'
    return termSeq(A, p1, c1, n) + termSeq(B, p2, c2, n);
  }
  const X3 = (p1, p2, z) => { const zi = cdiv([1, 0], z); return cdiv([1, 0], cmul(csub([1, 0], cmul([p1, 0], zi)), csub([1, 0], cmul([p2, 0], zi)))); };
  function rocRange(p1, p2, roc) { const a = Math.abs(p1), b = Math.abs(p2); return roc === 'out' ? [b, Infinity] : roc === 'ring' ? [a, b] : [0, a]; }
  const stable3 = (p1, p2, roc) => { const [lo, hi] = rocRange(p1, p2, roc); return lo < 1 - 1e-9 && 1 + 1e-9 < hi; }; // a pole on the unit circle is not stable
  function series3(p1, p2, roc, z, N = 600) { let s = [0, 0]; for (let n = -N; n <= N; n++) { const v = seq3(p1, p2, roc, n); if (v) s = cadd(s, cmul([v, 0], cpow(z, -n))); } return s; }

  // Difference equation y[n] = Σ b_k x[n−k] − Σ_{k≥1} a_k y[n−k], a_0 = 1.
  function filter(b, a, x) {
    const y = new Array(x.length).fill(0);
    for (let n = 0; n < x.length; n++) {
      let s = 0; for (let k = 0; k < b.length; k++) if (n - k >= 0) s += b[k] * x[n - k];
      for (let k = 1; k < a.length; k++) if (n - k >= 0) s -= a[k] * y[n - k];
      y[n] = s;
    }
    return y;
  }
  // H(e^{jΩ}) from the coefficients.
  function Hw(b, a, W) {
    const ev = c => c.reduce((s, v, k) => cadd(s, polar(v, -W * k)), [0, 0]);
    return cdiv(ev(b), ev(a));
  }
  // Feed cos(Ωn) for L samples and least-squares fit c·cos + d·sin over the steady-state tail.
  function measureGain(b, a, W, L = 1200, from = 700) {
    const x = Array.from({ length: L }, (_, n) => Math.cos(W * n)), y = filter(b, a, x);
    let cc = 0, ss = 0, cs = 0, yc = 0, ys = 0;
    for (let n = from; n < L; n++) { const c = Math.cos(W * n), s = Math.sin(W * n); cc += c * c; ss += s * s; cs += c * s; yc += y[n] * c; ys += y[n] * s; }
    const det = cc * ss - cs * cs;
    if (ss < 1e-9 * cc || Math.abs(det) < 1e-9 * cc * cc) return Math.abs(yc / cc);
    return Math.hypot((yc * ss - ys * cs) / det, (ys * cc - yc * cs) / det);
  }

  // Step 4: resonator with poles r·e^{±jΩp}: H(z) = 1/(1 − 2r cosΩp z⁻¹ + r² z⁻²).
  const OMP = Math.PI / 3;
  const res = (r, Wp = OMP) => ({ b: [1], a: [1, -2 * r * Math.cos(Wp), r * r] });
  function resGeometry(r, W, Wp = OMP) {
    const e = polar(1, W), d1 = cabs(csub(e, polar(r, Wp))), d2 = cabs(csub(e, polar(r, -Wp)));
    return { d1, d2, gain: 1 / (d1 * d2) };
  }
  function peakInfo(r, Wp = OMP, n = 20000) {
    let pk = 0, at = 0; const g = [];
    for (let i = 0; i <= n; i++) { const W = Math.PI * i / n, v = resGeometry(r, W, Wp).gain; g.push(v); if (v > pk) { pk = v; at = W; } }
    let lo = null, hi = null; g.forEach((v, i) => { if (v >= pk / Math.SQRT2) { const W = Math.PI * i / n; if (lo === null) lo = W; hi = W; } });
    return { peak: pk, at, width: hi - lo };
  }

  // Step 5: notch. Zeros e^{±jΩ0} on the circle, poles ρ·e^{±jΩ0} just inside.
  const S5 = { want: 0.3, hum: 1.2, L: 160 };
  const notch = (W0, rho) => ({ b: [1, -2 * Math.cos(W0), 1], a: [1, -2 * rho * Math.cos(W0), rho * rho] });
  const input5 = n => Math.cos(S5.want * n) + Math.cos(S5.hum * n);
  // Samples after which the transient ρⁿ has fallen below 1%.
  const settle = rho => Math.ceil(Math.log(0.01) / Math.log(rho));

  const api = { cadd, csub, cmul, cdiv, cabs, polar, cpow, wrapPi, seq0, partialSums, closed1, s2z, ROCS, twoPole, seq3, X3, rocRange, stable3, series3, filter, Hw, measureGain, OMP, res, resGeometry, peakInfo, S5, notch, input5, settle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Z_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
