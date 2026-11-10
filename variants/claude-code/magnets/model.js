'use strict';
// Magnets lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every needle, filing, field line, arrow and readout on the page is computed here; tests/core.cjs pins the claims.
// Model: a bar magnet magnetised evenly along its length acts as if its two end faces carried "pole charge":
// +1 spread over the N face and −1 over the S face (here 7 points across each face). The field of each point falls
// off with the square of distance (B = q·r̂ / r²). Lengths are in centimetres, strengths are relative.
// Because the poles sit on the faces, two pieces pressed face to face cancel exactly at the join (step 5).
(function (root) {
  const MAG = { len: 6, half: 0.7 };            // a 6 cm × 1.4 cm bar magnet
  const EPS = 0.06;                             // softening radius (cm) so the field stays finite at a pole

  // A magnet {x, y, ang, len}: centre, direction of its N end (radians, 0 = pointing right), length.
  const K = 7;
  function poles(m) {
    const L = (m.len || MAG.len) / 2, H = (m.half || MAG.half) * 0.9, c = Math.cos(m.ang || 0), s = Math.sin(m.ang || 0), out = [];
    for (const sgn of [1, -1]) for (let j = 0; j < K; j++) {
      const v = H * (2 * j / (K - 1) - 1);
      out.push({ x: m.x + sgn * L * c - v * s, y: m.y + sgn * L * s + v * c, q: sgn / K });
    }
    return out;
  }
  function allPoles(mags) { return mags.flatMap(poles); }
  function field(P, x, y, ext) {
    let bx = ext ? ext.bx : 0, by = ext ? ext.by : 0;
    for (const p of P) {
      const dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy + EPS * EPS, k = p.q / (r2 * Math.sqrt(r2));
      bx += k * dx; by += k * dy;
    }
    return { bx, by, b: Math.hypot(bx, by) };
  }
  // Is (x, y) inside the body of magnet m (with an optional margin)?
  function inside(m, x, y, pad = 0) {
    const c = Math.cos(m.ang || 0), s = Math.sin(m.ang || 0), dx = x - m.x, dy = y - m.y;
    const u = dx * c + dy * s, v = -dx * s + dy * c;
    return Math.abs(u) <= (m.len || MAG.len) / 2 + pad && Math.abs(v) <= (m.half || MAG.half) + pad;
  }

  /* ---- step 0: which things stick ---- */
  const ITEMS = [
    { id: 'nail', metal: true, magnetic: true },
    { id: 'clip', metal: true, magnetic: true },
    { id: 'nickel', metal: true, magnetic: true },
    { id: 'foil', metal: true, magnetic: false },
    { id: 'copper', metal: true, magnetic: false },
    { id: 'gold', metal: true, magnetic: false },
    { id: 'ruler', metal: false, magnetic: false },
    { id: 'wood', metal: false, magnetic: false },
    { id: 'glass', metal: false, magnetic: false }
  ];
  function itemStats(tested) {
    const T = ITEMS.filter(it => tested.includes(it.id));
    return {
      tested: T.length, total: ITEMS.length,
      stuck: T.filter(it => it.magnetic).length,
      metals: T.filter(it => it.metal).length,
      metalsNotStuck: T.filter(it => it.metal && !it.magnetic).length,
      nonMetalStuck: T.filter(it => !it.metal && it.magnetic).length
    };
  }

  /* ---- step 1: pull along the underside of one magnet ---- */
  // The pull on a small piece of iron grows with how fast the field's strength changes as you move toward the
  // magnet: force ∝ |grad(B²)|. Measured 0.5 cm below the bottom face.
  const ONE = [{ x: 0, y: 0, ang: 0, len: MAG.len }];
  const PROBE_Y = -(MAG.half + 0.5);
  function pullRaw(x, y = PROBE_Y, mags = ONE) {
    const P = allPoles(mags), h = 1e-3, B2 = (a, b) => { const f = field(P, a, b); return f.b * f.b; };
    const gx = (B2(x + h, y) - B2(x - h, y)) / (2 * h), gy = (B2(x, y + h) - B2(x, y - h)) / (2 * h);
    return Math.hypot(gx, gy);
  }
  const PULL_X = { min: -3, max: 3, step: 0.25 };
  const PULL_MAX = (() => { let m = 0; for (let x = PULL_X.min; x <= PULL_X.max + 1e-9; x += 0.01) m = Math.max(m, pullRaw(x)); return m; })();
  const pullPct = x => 100 * pullRaw(x) / PULL_MAX;
  const CLIP_PCT = 12;                          // teaching scale: one paper clip for every 12 % of the strongest pull
  const clips = x => Math.min(8, Math.floor(pullPct(x) / CLIP_PCT + 1e-9));

  /* ---- step 2: two magnets on a track ---- */
  // Left magnet fixed with its N end pointing right; the right magnet sits `gap` cm away.
  // facing = 'N' → its N end faces the left magnet (like poles), 'S' → its S end faces it (unlike poles).
  function pair(gap, facing) {
    const L = MAG.len;
    return [{ x: -L / 2 - gap / 2, y: 0, ang: 0, len: L }, { x: L / 2 + gap / 2, y: 0, ang: facing === 'N' ? Math.PI : 0, len: L }];
  }
  // Force on the right magnet along x (positive = pushed right = repelled), summed over the four pole pairs.
  function pairForce(gap, facing) {
    const [A, B] = pair(gap, facing).map(poles);
    let fx = 0;
    for (const p of B) for (const q of A) { const dx = p.x - q.x, dy = p.y - q.y, r = Math.hypot(dx, dy); fx += p.q * q.q * dx / (r * r * r); }
    return fx;
  }
  const F_REF = Math.abs(pairForce(1, 'S'));     // attraction at a 1 cm gap = 100
  const forcePct = (gap, facing) => 100 * pairForce(gap, facing) / F_REF;
  const GAP = { min: 1, max: 8, step: 0.5 };
  // Release the right magnet from rest: it slides under the magnetic force against sliding friction.
  const FRICTION = 0.05 * F_REF;                // teaching value: friction = 5 % of the 1 cm attraction
  const GAP_STOP = 9;                           // the track ends 9 cm from the fixed magnet
  function release(gap0, facing, { dt = 0.002, mass = 0.02, tMax = 20 } = {}) {
    let g = gap0, v = 0, t = 0; const path = [{ t, g }];
    const F0 = pairForce(g, facing);
    if (Math.abs(F0) <= FRICTION) return { path, end: g, moved: false, snapped: false, stopped: false };
    while (t < tMax) {
      const F = pairForce(g, facing);
      let a = F / mass;
      if (Math.abs(v) > 1e-9) a -= Math.sign(v) * FRICTION / mass;
      else if (Math.abs(F) <= FRICTION) break;
      else a -= Math.sign(F) * FRICTION / mass;
      const v1 = v + a * dt;
      if (Math.abs(v) > 1e-9 && Math.sign(v1) !== Math.sign(v)) { v = 0; break; } // friction stopped it
      v = v1; g += v * dt; t += dt;
      if (g <= 0) { g = 0; path.push({ t, g }); return { path, end: 0, moved: true, snapped: true, stopped: false }; }
      if (g >= GAP_STOP) { g = GAP_STOP; path.push({ t, g }); return { path, end: g, moved: true, snapped: false, stopped: true }; }
      if (path.length < 4000 && (path.length === 0 || t - path[path.length - 1].t >= 0.02)) path.push({ t, g });
    }
    path.push({ t, g });
    return { path, end: g, moved: Math.abs(g - gap0) > 1e-6, snapped: false, stopped: false };
  }

  /* ---- step 3: field lines and iron filings ---- */
  const LAYOUTS = {
    single: () => [{ x: 0, y: 0, ang: 0, len: MAG.len }],
    unlike: () => pair(3, 'S'),
    like: () => pair(3, 'N')
  };
  // Follow the field from seeds just outside the N half of every magnet (3 on the N face, 4 along each long side)
  // until the line runs into a magnet or leaves the box.
  // end: 'mag' (into magnet index `hit`), 'box' (leaves the view) or 'null' (field vanishes).
  const SEEDS = [[0, 0], [0, 0.42], [0, -0.42], [0.15, 1], [0.6, 1], [1.2, 1], [2.0, 1], [0.15, -1], [0.6, -1], [1.2, -1], [2.0, -1]];
  function traceLines(mags, box, seeds = SEEDS, ext = null) {
    const P = allPoles(mags), lines = [];
    mags.forEach((m, mi) => {
      const L = (m.len || MAG.len) / 2, Hh = m.half || MAG.half, c = Math.cos(m.ang || 0), s = Math.sin(m.ang || 0);
      for (const [back, side] of seeds) {
        // face seeds sit 0.15 cm beyond the N face; side seeds sit 0.15 cm off the long side, `back` cm in from the N end
        // (scaled to the magnet's length, so short pieces get the same pattern)
        const u = back === 0 ? L + 0.15 : L - back * L / 3, v = back === 0 ? side : side * (Hh + 0.15);
        let x = m.x + u * c - v * s, y = m.y + u * s + v * c;
        if (mags.some(q => inside(q, x, y, 0.05))) continue;
        // the drawn line starts on the magnet's surface, right next to its seed
        const u0 = back === 0 ? L : u, v0 = back === 0 ? side : side * Hh;
        const pts = [[m.x + u0 * c - v0 * s, m.y + u0 * s + v0 * c], [x, y]]; let end = 'box', hit = -1;
        for (let k = 0; k < 3000; k++) {
          const f = field(P, x, y, ext); if (f.b < 1e-6) { end = 'null'; break; }
          const st = 0.05; x += st * f.bx / f.b; y += st * f.by / f.b; pts.push([x, y]);
          const h = mags.findIndex(q => inside(q, x, y, -0.01));
          if (h >= 0) { end = 'mag'; hit = h; break; }
          if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) break;
        }
        lines.push({ pts, end, hit, from: mi });
      }
    });
    return lines;
  }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // Filings: random spots on the card; a spot keeps a filing more often where the field is strong (filings crowd
  // there), and every filing ends up lying along the field once the card is tapped.
  function filings(mags, box, n, seed = 7) {
    const P = allPoles(mags), R = rng(seed), out = [];
    let tries = 0;
    while (out.length < n && tries < n * 40) {
      tries++;
      const x = box.x0 + R() * (box.x1 - box.x0), y = box.y0 + R() * (box.y1 - box.y0);
      if (mags.some(m => inside(m, x, y, 0.08))) continue;
      const f = field(P, x, y), keep = Math.min(1, Math.pow(f.b / 0.3, 0.75));
      if (R() > keep) continue;
      out.push({ x, y, ang: Math.atan2(f.by, f.bx), start: R() * Math.PI, b: f.b });
    }
    return out;
  }

  /* ---- step 4: compass ---- */
  const EARTH = 0.02;                           // Earth's field in the same relative units, pointing to the top (north)
  const earthField = on => (on ? { bx: 0, by: EARTH } : null);
  function compass(x, y, earthOn, mags = ONE) {
    const P = allPoles(mags), f = field(P, x, y), g = field(P, x, y, earthField(earthOn));
    return { ang: Math.atan2(g.by, g.bx), magnet: f.b, ratio: f.b / EARTH };
  }
  // Compass bearing (0° = up / north, clockwise) of the needle's N tip, in page coordinates where +y is up.
  const bearing = ang => ((90 - ang * 180 / Math.PI) % 360 + 360) % 360;
  const compass8 = deg => Math.round(deg / 45) % 8; // 0 up, 1 up-right, 2 right, ... 7 up-left

  /* ---- step 5: breaking a magnet ---- */
  // n pieces of the 6 cm magnet, pulled `gap` cm apart. Each piece is a whole magnet with its own N and S.
  function pieces(n, gap) {
    const L = MAG.len / n, total = n * L + (n - 1) * gap, out = [];
    for (let i = 0; i < n; i++) out.push({ x: -total / 2 + L / 2 + i * (L + gap), y: 0, ang: 0, len: L });
    return out;
  }
  // Count poles by adding up pole strength: each N face carries +1 in total, each S face −1.
  function poleCount(n) { const P = allPoles(pieces(n, 0)); return { N: Math.round(P.filter(p => p.q > 0).reduce((a, p) => a + p.q, 0)), S: Math.round(-P.filter(p => p.q < 0).reduce((a, p) => a + p.q, 0)) }; }

  /* ---- step 6: hidden magnet quiz ---- */
  // A covered magnet points its N end left or right; two compasses sit at the given spots.
  function quiz(k) {
    const R = rng(1000 + k), nRight = R() < 0.5;
    const spots = [{ x: -5.2 + R() * 0.8, y: 1.8 + R() * 1.2 }, { x: 4.4 + R() * 0.8, y: -1.8 - R() * 1.2 }];
    const mag = { x: 0, y: 0, ang: nRight ? 0 : Math.PI, len: MAG.len };
    return { nRight, mag, needles: spots.map(s => ({ ...s, ...compass(s.x, s.y, false, [mag]) })) };
  }

  const FEW = [[0, 0], [0, 0.42], [0, -0.42], [0.6, 1], [0.6, -1]];
  const api = { MAG, EPS, K, SEEDS, FEW, earthField, poles, allPoles, field, inside, ITEMS, itemStats, ONE, PROBE_Y, pullRaw, pullPct, PULL_X, CLIP_PCT, clips,
    pair, pairForce, forcePct, F_REF, GAP, GAP_STOP, FRICTION, release, LAYOUTS, traceLines, filings, rng, EARTH, compass, bearing, compass8,
    pieces, poleCount, quiz };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MAGNET_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
