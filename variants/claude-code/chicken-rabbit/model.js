'use strict';
// Chickens & Rabbits (Claude Code edition) — pure model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, gap and readout on the page comes from here; tests/core.cjs pins the claims.
// Two kinds of thing, a fixed amount each (chicken 2 feet, rabbit 4); counts are whole numbers ≥ 0.
(function (root) {
  const LEGS = { chicken: 2, rabbit: 4 };
  const S0 = { heads: 10, feet: 28, rDefault: 2 };          // steps 0–2
  const S3 = { hMin: 2, hMax: 20, hDefault: 10, fMin: 4, fMax: 80, fDefault: 28 };  // steps 3–4
  // Step 5: same structure, other stories. a = the cheaper/smaller kind, b = the other; a < b.
  const STORIES = [
    { id: 'bikes', a: 2, b: 3, n: 12, total: 31, nMax: 20, tMax: 60 },
    { id: 'tickets', a: 5, b: 8, n: 15, total: 93, nMax: 20, tMax: 160 },
    { id: 'bugs', a: 6, b: 8, n: 10, total: 72, nMax: 20, tMax: 160 }
  ];

  const feet = (c, r) => LEGS.chicken * c + LEGS.rabbit * r;

  // General "assume all of kind a" solver: n things, total amount T, a each or b each (a < b).
  // reason: null (solved), 'low' (T < n·a), 'high' (T > n·b), 'frac' (gap not a whole multiple of b − a).
  function solve(n, T, a, b) {
    const base = n * a, top = n * b, gap = T - base, step = b - a;
    const out = { n, T, a, b, base, top, gap, step, over: top - T };
    if (T < base) return { ...out, ok: false, reason: 'low' };
    if (T > top) return { ...out, ok: false, reason: 'high' };
    if (gap % step !== 0) return { ...out, ok: false, reason: 'frac', lo: Math.floor(gap / step), hi: Math.ceil(gap / step) };
    const nb = gap / step;
    return { ...out, ok: true, reason: null, nb, na: n - nb };
  }
  const solveCR = (H, F) => solve(H, F, LEGS.chicken, LEGS.rabbit);

  // Swap path "assume all chickens": feet after 0, 1, 2 … swaps until the target (or the end) is reached.
  function pathFromChickens(H, F) { const s = solveCR(H, F), out = []; for (let k = 0; k <= H; k++) { out.push(feet(H - k, k)); if (s.ok && k === s.nb) break; } return out; }
  // "Assume all rabbits": feet after 0, 1, 2 … rabbit→chicken swaps.
  function pathFromRabbits(H, F) { const s = solveCR(H, F), out = []; for (let k = 0; k <= H; k++) { out.push(feet(k, H - k)); if (s.ok && k === s.na) break; } return out; }

  // Lifting method: every animal lifts 2 feet; what is left on the ground belongs to rabbits only.
  function lift(H, F) { const lifted = 2 * H, ground = F - lifted; return { lifted, ground, rabbits: ground / 2 }; }

  const api = { LEGS, S0, S3, STORIES, feet, solve, solveCR, pathFromChickens, pathFromRabbits, lift };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
