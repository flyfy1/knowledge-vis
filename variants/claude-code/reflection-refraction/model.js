'use strict';
// Reflection & refraction model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ray on the page and every number in a readout is computed here; tests/core.cjs pins the claims.
// Conventions: angles in degrees, measured from the NORMAL (the line perpendicular to the surface).
// World coordinates have y pointing up; a flat interface lies on y = 0 with normal (0, 1).
// Media are uniform, transparent and non-dispersive; line brightness on the page never encodes power.
(function (root) {
  const N_AIR = 1.00, N_WATER = 1.33, N_GLASS = 1.50, N_CLAD = 1.46;
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;

  // Law of reflection: angle of reflection = angle of incidence (both from the normal).
  function reflect(theta) { return theta; }

  // Snell: n1·sinθ1 = n2·sinθ2. Returns the refraction angle or a total-internal-reflection state.
  // s = (n1/n2)·sinθ1. s < 1: ordinary refraction; s = 1 (to rounding): the limiting 90° grazing ray;
  // s > 1: no refraction angle exists (sin can never exceed 1) → total internal reflection.
  function snell(n1, n2, theta1) {
    if (!(n1 > 0 && n2 > 0) || !(theta1 >= 0 && theta1 < 90 + 1e-9)) return { type: 'invalid', theta2: null, s: null };
    const s = n1 / n2 * Math.sin(rad(theta1));
    if (s > 1 + 1e-12) return { type: 'tir', theta2: null, s };
    if (s > 1 - 1e-12) return { type: 'grazing', theta2: 90, s: 1 };
    return { type: 'refract', theta2: deg(Math.asin(s)), s };
  }

  // Critical angle exists only when light goes from the denser medium (n1 > n2): θc = arcsin(n2 / n1).
  function critical(n1, n2) { return n1 > n2 ? deg(Math.asin(n2 / n1)) : null; }

  /* ---------- step 1: rough surface = many tiny mirrors with different normals ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const ROUGH = { facets: 14, width: 14, top: 6, maxSlope: 0.18 }; // world units; slope cap keeps every facet tilt ≤ atan(2·0.18) ≈ 19.8°
  // Surface polyline: heights seeded once (seed 3, not hand-picked), scaled by roughness r ∈ [0, 1].
  function surface(r) {
    const R = rng(3), pts = [];
    for (let i = 0; i <= ROUGH.facets; i++) pts.push({ x: i * ROUGH.width / ROUGH.facets, y: r * ROUGH.maxSlope * (ROUGH.width / ROUGH.facets) * (2 * R() - 1) });
    return pts;
  }
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  // Ray (p + t·d) against segment a→b; returns t > eps or null.
  function hitSeg(p, d, a, b) {
    const ex = b.x - a.x, ey = b.y - a.y, den = d.x * ey - d.y * ex;
    if (Math.abs(den) < 1e-12) return null;
    const t = ((a.x - p.x) * ey - (a.y - p.y) * ex) / den, u = ((a.x - p.x) * d.y - (a.y - p.y) * d.x) / den;
    return t > 1e-9 && u >= 0 && u <= 1 ? t : null;
  }
  // Trace one ray of the parallel beam: it comes from the upper left at angle theta (from the vertical),
  // aimed at surface position x0, reflects off every facet it meets (up to 4), then leaves the picture.
  function traceRough(theta, x0, r) {
    const S = surface(r), d0 = { x: Math.sin(rad(theta)), y: -Math.cos(rad(theta)) };
    let p = { x: x0 - ROUGH.top * Math.tan(rad(theta)), y: ROUGH.top }, d = d0;
    const pts = [p], hits = [];
    for (let bounce = 0; bounce < 4; bounce++) {
      let best = null;
      for (let i = 0; i < S.length - 1; i++) { const t = hitSeg(p, d, S[i], S[i + 1]); if (t !== null && (!best || t < best.t)) best = { t, i }; }
      if (!best) break;
      const a = S[best.i], b = S[best.i + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
      const n = { x: -(b.y - a.y) / L, y: (b.x - a.x) / L }; // upward unit normal of this facet
      const q = { x: p.x + best.t * d.x, y: p.y + best.t * d.y }, dn = dot(d, n);
      const out = { x: d.x - 2 * dn * n.x, y: d.y - 2 * dn * n.y };
      hits.push({ p: q, n, tilt: deg(Math.atan2(b.y - a.y, b.x - a.x)), inc: deg(Math.acos(Math.min(1, -dn))), ref: deg(Math.acos(Math.min(1, dot(out, n)))) });
      pts.push(q); p = q; d = out;
    }
    // leave the picture: run up to y = top (or far out sideways)
    const tTop = d.y > 1e-9 ? (ROUGH.top - p.y) / d.y : 40;
    pts.push({ x: p.x + d.x * tTop, y: p.y + d.y * tTop });
    return { pts, hits, out: deg(Math.atan2(d.x, d.y)), escaped: d.y > 0 };
  }
  const BEAM = 9;
  function beam(theta, r) {
    const rays = [];
    for (let i = 0; i < BEAM; i++) rays.push(traceRough(theta, 2.2 + i * (ROUGH.width - 4.4) / (BEAM - 1), r));
    const outs = rays.map(q => q.out);
    const lawErr = Math.max(0, ...rays.flatMap(q => q.hits.map(h => Math.abs(h.inc - h.ref))));
    return { rays, min: Math.min(...outs), max: Math.max(...outs), spread: Math.max(...outs) - Math.min(...outs), lawErr, bounces: rays.reduce((s, q) => s + q.hits.length, 0) };
  }

  /* ---------- step 4: light trapped in a glass rod ---------- */
  // Rod from x = 0 to LEN, walls at y = ±0.5. Light enters the centre of the flat left end from air at
  // angle thIn (from the rod axis, which is the end face's normal), refracts, then meets the side walls.
  const ROD = { LEN: 12, D: 1 };
  function rod(thIn, nCore, nOuter, len = ROD.LEN) {
    const end = snell(N_AIR, nCore, thIn), thC = end.theta2; // angle to the axis inside the glass
    const wall = 90 - thC, crit = critical(nCore, nOuter);
    const trapped = crit !== null && wall > crit + 1e-9;
    const pts = [{ x: 0, y: 0 }]; let x = 0, y = 0, dir = 1, bounces = 0, escape = null;
    const slope = Math.tan(rad(thC));
    while (true) {
      if (slope < 1e-12) { pts.push({ x: len, y }); break; }
      const target = dir * ROD.D / 2, dx = (target - y) / (dir * slope);
      if (x + dx >= len) { pts.push({ x: len, y: y + dir * slope * (len - x) }); break; }
      x += dx; y = target; pts.push({ x, y });
      if (!trapped) { const o = snell(nCore, nOuter, wall); escape = { x, y, dir, theta: o.theta2 }; break; }
      bounces++; dir = -dir;
    }
    return { thIn, thC, wall, crit, trapped, bounces, pts, escape, len, accept: acceptance(nCore, nOuter) };
  }
  // Largest entry angle that is still trapped: sin θa = √(n_core² − n_outer²) (90° if that exceeds 1).
  function acceptance(nCore, nOuter) {
    const na = Math.sqrt(Math.max(0, nCore * nCore - nOuter * nOuter));
    return na >= 1 ? 90 : deg(Math.asin(na));
  }

  /* ---------- step 5: the fish looks shallower ---------- */
  // Fish at (0, −d) under water (n); eye at (X, H) in air. Find the surface point s where the ray from the fish
  // refracts into the eye (bisection on n·sinθw − sinθa, which increases with s), then extend the air part of
  // that ray backwards to the vertical line above the fish: the depth where it crosses is the apparent depth.
  const FISH = { d: 1.2, H: 0.8, n: N_WATER };
  function fishView(X, d = FISH.d, H = FISH.H, n = FISH.n) {
    if (X <= 1e-9) return { X: 0, s: 0, thW: 0, thA: 0, apparent: d / n, ratio: 1 / n, limit: true };
    const f = s => n * s / Math.hypot(s, d) - (X - s) / Math.hypot(X - s, H);
    let lo = 0, hi = X;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
    const s = (lo + hi) / 2, thW = deg(Math.atan2(s, d)), thA = deg(Math.atan2(X - s, H));
    const apparent = H * s / (X - s);
    return { X, s, thW, thA, apparent, ratio: apparent / d, limit: false };
  }

  /* ---------- step 6: self-test, answers computed here ---------- */
  function quiz() {
    return {
      q1: 90 - reflect(35),                         // reflected ray vs the mirror surface, incidence 35° from the normal
      q2: snell(N_AIR, N_GLASS, 45).theta2,         // air → glass at 45°
      q3: snell(N_WATER, N_AIR, 50).type,           // water → air at 50°
      q3crit: critical(N_WATER, N_AIR)
    };
  }

  const api = { N_AIR, N_WATER, N_GLASS, N_CLAD, rad, deg, reflect, snell, critical, ROUGH, surface, traceRough, BEAM, beam, ROD, rod, acceptance, FISH, fishView, quiz };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
