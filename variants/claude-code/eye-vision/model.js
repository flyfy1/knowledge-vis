'use strict';
// Eye and glasses lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// A "reduced eye": one thin lens (cornea + crystalline lens together) and a retina L mm behind it.
// Lengths in mm, lens strengths in dioptres D (1 D = a lens with a 1 m focal length = "100 度" on a Chinese prescription).
// Vergence bookkeeping: light spreading out from a point u mm away has vergence −1000/u D; a lens adds its power;
// light converging to a point v mm ahead has vergence +1000/v D. Everything here is paraxial (thin rays near the axis).
(function (root) {
  const L0 = 17;                 // normal eye: lens-to-retina distance (mm)
  const P0 = 1000 / L0;          // relaxed power of every eye on this page (D) ≈ 58.82
  const PUPIL = 4;               // pupil diameter (mm)
  const BLUR_OK = 0.012;         // teaching threshold: a blur spot up to 0.012 mm still looks sharp
  const VERTEX = 12;             // glasses sit 12 mm in front of the eye's lens
  const A_YOUNG = 10;            // accommodation range of the young eye in steps 1–3 (D)
  const READ = 330;              // reading distance for step 4 (mm)
  // Object positions offered by the distance sliders (mm); Infinity = very far away.
  const POS = [Infinity, 6000, 3000, 1000, 500, 250, 150, 100, 70];

  const objV = u => (u === Infinity ? 0 : -1000 / u);
  // Vergence reaching the eye's lens from an object u mm in front of the eye, through glasses of power Pg (D)
  // worn d mm in front (Pg = 0: no glasses).
  function eyeVergence(u, Pg = 0, d = VERTEX) {
    if (!Pg) return objV(u);
    const V = (u === Infinity ? 0 : -1000 / (u - d)) + Pg;
    return V / (1 - d * V / 1000);
  }
  // Extra power the eye must add (accommodation, D) to put the focus exactly on the retina.
  const need = (L, Ve) => 1000 / L - P0 - Ve;
  // Where the light focuses for a given accommodation; blur = diameter of the light spot on the retina.
  function focus(L, Ve, acc = 0) {
    const Vi = Ve + P0 + acc;
    return { Vi, v: Vi > 0 ? 1000 / Vi : Infinity, offset: Vi > 0 ? 1000 / Vi - L : Infinity, blur: PUPIL * Math.abs(1 - L * Vi / 1000) };
  }
  // The eye focuses as well as it can: it may add between 0 and A dioptres, never less than 0.
  function autoFocus(L, u, Pg = 0, A = A_YOUNG) {
    const Ve = eyeVergence(u, Pg), n = need(L, Ve), acc = Math.max(0, Math.min(A, n));
    const f = focus(L, Ve, acc);
    return { Ve, need: n, acc, residual: n - acc, ...f, sharp: f.blur <= BLUR_OK + 1e-12 };
  }
  // Refractive error of an eye of length L (D): negative = short-sighted (myopia), positive = long-sighted.
  const refErr = L => 1000 / L - P0;
  const degrees = D => Math.round(Math.abs(D) * 100); // Chinese prescription "度"

  // Object distance (mm) whose light reaches the eye with vergence Ve, through glasses Pg at d.
  // Returns Infinity when even parallel light is not enough ("sharp all the way to infinity"), and null
  // when no real object works (e.g. glasses too strong for this eye).
  function objectFor(Ve, Pg = 0, d = VERTEX) {
    const V = Pg ? Ve / (1 + d * Ve / 1000) : Ve; // vergence just after the glasses
    const Vobj = V - Pg;                          // vergence of the light arriving at the glasses
    if (Vobj > 1e-12) return null;
    if (Vobj > -1e-12) return Infinity;
    return -1000 / Vobj + (Pg ? d : 0);
  }
  // Far point: the farthest object seen exactly in focus without effort. Near point: the closest with full effort A.
  const farPoint = (L, Pg = 0) => { const Ve = 1000 / L - P0; return Ve >= 0 && !Pg ? Infinity : objectFor(Ve, Pg); };
  const nearPoint = (L, A, Pg = 0) => objectFor(1000 / L - P0 - A, Pg);
  // Glasses (at the vertex distance) that put a far object exactly on the retina of a relaxed eye.
  const bestLens = (L, d = VERTEX) => { const R = refErr(L); return R / (1 + d * R / 1000); };

  // Average accommodation range by age (Hofstetter's average line), floored at 0.5 D.
  const ampAtAge = age => Math.max(0.5, 18.5 - 0.3 * age);
  // Weakest reading glasses (multiple of 0.25 D, from 0) that make text at READ sharp for this age.
  function readingLens(age, L = L0, step = 0.25) {
    for (let P = 0; P <= 6 + 1e-9; P += step) if (autoFocus(L, READ, P, ampAtAge(age)).sharp) return Math.round(P / step) * step;
    return null;
  }
  // Weakest (least negative) glasses on a 0.25 D grid that make a far object sharp with no effort.
  function weakestFarLens(L, step = 0.25) {
    for (let k = 0; k >= -40; k--) { const P = k * step; if (autoFocus(L, Infinity, P, 0).sharp) return P; }
    return null;
  }

  // Paraxial ray trace for drawing (and for the tests): a ray that crosses the eye's lens at height yEye.
  // Returns heights at the glasses plane (x = −d), the lens (x = 0) and the retina (x = L), plus slopes.
  function traceRay(o, yEye) {
    const { u, Pg = 0, d = VERTEX, Pe, L } = o;
    const run = s0 => { // s0: incoming slope (or height for a parallel beam)
      let y, s;
      if (Pg) {
        if (u === Infinity) { y = s0; s = 0; } else { y = s0 * (u - d); s = s0; }
        const yG = y; s = s - yG * Pg / 1000; const yE = yG + s * d;
        return { yG, sIn: u === Infinity ? 0 : s0, yE, s };
      }
      if (u === Infinity) { y = s0; s = 0; } else { y = s0 * u; s = s0; }
      return { yG: null, sIn: u === Infinity ? 0 : s0, yE: y, s };
    };
    const k = run(1).yE; // y at the lens is linear in s0
    const r = run(yEye / k);
    const sAfter = r.s - r.yE * Pe / 1000;
    return { yG: r.yG, yE: r.yE, sIn: r.sIn, sMid: r.s, sAfter, yR: r.yE + sAfter * L, xFocus: sAfter !== 0 ? -r.yE / sAfter : Infinity };
  }

  const API = { L0, P0, PUPIL, BLUR_OK, VERTEX, A_YOUNG, READ, POS, objV, eyeVergence, need, focus, autoFocus,
    refErr, degrees, objectFor, farPoint, nearPoint, bestLens, ampAtAge, readingLens, weakestFarLens, traceRay };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root) root.EYE_MODEL = API;
})(typeof window !== 'undefined' ? window : null);
