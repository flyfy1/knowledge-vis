'use strict';
// Pinhole-camera lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// All light paths are straight segments between two points; every shadow edge, image point and
// blur spot on the page is computed here, and tests/core.cjs pins the claims.
// Side view coordinates (cm): z runs along the axis (lamp/candle → screen), y is up.
// The hole is at z = 0, y = 0; the candle stands at z = −u, centred on the axis; the screen is at z = +v.
(function (root) {
  const EPS = 1e-9;

  // Where the straight line through P and Q crosses the plane z = Z (null if the line is parallel to it).
  function crossAt(P, Q, Z) {
    const dz = Q.z - P.z;
    if (Math.abs(dz) < EPS) return null;
    const s = (Z - P.z) / dz;
    return { z: Z, y: P.y + s * (Q.y - P.y), x: (P.x || 0) + s * ((Q.x || 0) - (P.x || 0)) };
  }

  // ---- step 0: a point lamp, a card, a screen ----
  const LAMP = { z: 0, y: 0 };
  const SCREEN0 = 100;     // lamp → screen (cm)
  const CARD_HALF = 10;    // the card is 20 cm tall, centred on the axis
  function shadow(c, half = CARD_HALF, screen = SCREEN0) {
    const top = crossAt(LAMP, { z: c, y: half }, screen).y, bot = crossAt(LAMP, { z: c, y: -half }, screen).y;
    return { top, bot, height: top - bot };
  }
  // N rays fanning out from the lamp; each stops at the card if it hits it, otherwise at the screen.
  function fan(c, N = 25, spread = 0.75, half = CARD_HALF, screen = SCREEN0) {
    const out = [];
    for (let i = 0; i < N; i++) {
      const m = -spread + 2 * spread * i / (N - 1); // slope dy/dz
      const yCard = m * c, blocked = Math.abs(yCard) <= half + EPS;
      out.push({ m, blocked, end: blocked ? { z: c, y: yCard } : { z: screen, y: m * screen } });
    }
    return out;
  }

  // ---- steps 1–2: candle, hole, screen ----
  // Candle of height H centred on the axis: flame tip A at +H/2, base B at −H/2.
  function image(H, u, v) {
    const O = { z: 0, y: 0 };
    const A = { z: -u, y: H / 2 }, B = { z: -u, y: -H / 2 };
    const Ai = crossAt(A, O, v), Bi = crossAt(B, O, v); // ray drawn through the hole centre
    const hRay = Ai.y - Bi.y;                           // signed: negative = upside down
    const hFormula = H * v / u;
    return { A, B, Ai, Bi, hRay, h: Math.abs(hRay), hFormula, ratio: v / u, inverted: hRay < 0 };
  }
  // Front view: a point (x across, y up) of the candle lands at (−x·v/u, −y·v/u) on the screen,
  // i.e. the picture is turned half a turn (180°) and scaled by v/u.
  const mapPoint = (x, y, u, v) => ({ x: crossAt({ z: -u, y, x }, { z: 0, y: 0, x: 0 }, v).x, y: crossAt({ z: -u, y, x }, { z: 0, y: 0, x: 0 }, v).y });

  // Candle outline in front view, as seen by someone standing behind the candle and facing the screen:
  // r = that person's right, y = up. Body: left half white, right half green; flame on top.
  // mapPoint works the same in these coordinates (a half turn is a half turn whichever way you face).
  function candleParts(H) {
    const w = Math.max(6, H * 0.22), flame = H * 0.24, bodyTop = H / 2 - flame, L = w / 2;
    return {
      white: [[-L, -H / 2], [0, -H / 2], [0, bodyTop], [-L, bodyTop]],
      green: [[0, -H / 2], [L, -H / 2], [L, bodyTop], [0, bodyTop]],
      flame: Array.from({ length: 24 }, (_, i) => { const a = Math.PI * 2 * i / 24; return [Math.sin(a) * w * 0.35 * (1 - Math.max(0, Math.cos(a))), bodyTop + flame / 2 + Math.cos(a) * flame / 2]; })
    };
  }

  // ---- step 3: a hole of width d ----
  // From object point y0, the rays through the hole's top edge, centre and bottom edge land here on the screen.
  function spotRays(y0, d, u, v) {
    const P = { z: -u, y: y0 };
    return [d / 2, 0, -d / 2].map(yh => ({ through: yh, hit: crossAt(P, { z: 0, y: yh }, v).y }));
  }
  const spotWidth = (d, u, v) => d * (u + v) / u;
  const brightness = d => d * d; // light through a square hole of side d, relative to d = 1 cm
  // Five object points along the candle (top to bottom); image points are h/4 apart.
  function blur(H, u, v, d) {
    const pts = [0, 1, 2, 3, 4].map(i => H / 2 - i * H / 4);
    const spots = pts.map(y0 => { const r = spotRays(y0, d, u, v); return { y0, centre: r[1].hit, hi: Math.max(r[0].hit, r[2].hit), lo: Math.min(r[0].hit, r[2].hit) }; });
    const w = spotWidth(d, u, v), gap = H * v / u / 4;
    return { spots, width: w, gap, overlap: Math.max(0, w - gap), merged: w > gap + EPS };
  }

  // ---- quiz (every verdict computed) ----
  const QUIZ = {
    q1: { H: 60, u: 30, v: 15 },
    q1Options() { const { H, u, v } = this.q1; return { right: H * v / u, same: H, flipped: H * u / v }; }
  };

  const api = { EPS, crossAt, LAMP, SCREEN0, CARD_HALF, shadow, fan, image, mapPoint, candleParts, spotRays, spotWidth, brightness, blur, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
