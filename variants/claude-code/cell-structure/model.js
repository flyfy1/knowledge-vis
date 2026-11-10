'use strict';
// The Cell (Claude Code edition) — pure model shared by the page and node tests.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Holds: typical sizes for the zoom step, the cell-diagram geometry (used for both drawing and
// hit-testing), the membrane random-walk simulation, the Acetabularia graft rule, and the lookup
// tables for plant-vs-animal differences and the structure-to-job scenarios.
(function (root) {

/* ---------- step 0: sizes (typical orders of magnitude, micrometres) ---------- */
const UM_PER_MM = 1000;
const EYE_LIMIT_UM = 100;            // unaided eye at reading distance resolves about 0.1 mm
const FIELD_AT_1X_UM = 60000;        // the zoom canvas shows a 6 cm wide field at 1×
const MAG_MIN = 1, MAG_MAX = 1000;   // an ordinary school light microscope tops out near 1000×
const SIZES = [                      // id, typical size in µm (order of magnitude, not a measurement)
  { id: 'leaf', um: 50000 },
  { id: 'cell', um: 50 },
  { id: 'nucleus', um: 10 },
  { id: 'chloro', um: 5 },
  { id: 'mito', um: 1 }
];
const TILE = { w: 60, h: 40 };       // drawn leaf-cell tile (µm); about 50 µm on average
const sizeOf = id => SIZES.find(s => s.id === id).um;
const magFromSlider = v => Math.pow(10, v / 100);          // slider 0..300 → 1×..1000×
const fieldUm = mag => FIELD_AT_1X_UM / mag;
const apparentUm = (um, mag) => um * mag;                   // how big it looks to the eye
const visibleAt = (um, mag) => apparentUm(um, mag) >= EYE_LIMIT_UM - 1e-9;
const minMagToSee = um => EYE_LIMIT_UM / um;
const cellsPerMm = () => UM_PER_MM / sizeOf('cell');

// Scale bar: the largest 1-2-5 length not longer than a quarter of the field.
function scaleBar(fieldWidthUm) {
  const target = fieldWidthUm / 4;
  let best = 1;
  for (let e = -1; e <= 6; e++) for (const m of [1, 2, 5]) { const v = m * Math.pow(10, e); if (v <= target + 1e-9) best = v; }
  return best;
}
// Length → value + unit id ('um' | 'mm' | 'cm').
function lengthUnit(um) {
  if (um >= 10000) return { v: um / 10000, unit: 'cm' };
  if (um >= 1000) return { v: um / 1000, unit: 'mm' };
  return { v: um, unit: 'um' };
}

/* ---------- cell diagrams (unit box: x 0..1, y 0..ASPECT) ---------- */
const ASPECT = 0.62;
const STRUCTS = ['membrane', 'cytoplasm', 'nucleus', 'mito', 'chloro', 'vacuole', 'wall'];
const PLANT_ONLY = ['wall', 'chloro', 'vacuole'];        // the three differences (large central vacuole)
const ANIMAL_HAS = ['membrane', 'cytoplasm', 'nucleus', 'mito'];
const PLANT_HAS = STRUCTS.slice();

function plantCell() {
  const box = { x: 0.03, y: 0.03, w: 0.94, h: ASPECT - 0.06, r: 0.05 };
  const mem = { x: box.x + 0.03, y: box.y + 0.03, w: box.w - 0.06, h: box.h - 0.06, r: 0.035 };
  const chloro = [[0.13, 0.42, 0.3], [0.24, 0.52, -0.2], [0.42, 0.53, 0.1], [0.62, 0.53, -0.1], [0.82, 0.5, 0.4], [0.88, 0.3, 1.4], [0.85, 0.12, -0.5], [0.62, 0.105, 0.15], [0.41, 0.1, -0.15]]
    .map(([x, y, a]) => ({ kind: 'ellipse', cx: x, cy: y, rx: 0.042, ry: 0.022, a }));
  const mito = [[0.12, 0.33, 0.9], [0.31, 0.12, 0.3], [0.73, 0.54, -0.3], [0.9, 0.42, 1.3]]
    .map(([x, y, a]) => ({ kind: 'ellipse', cx: x, cy: y, rx: 0.026, ry: 0.012, a }));
  return {
    wall: [{ kind: 'rrect', ...box }],
    membrane: [{ kind: 'rrect', ...mem }],
    cytoplasm: [{ kind: 'rrect', ...mem }],
    vacuole: [{ kind: 'ellipse', cx: 0.57, cy: 0.315, rx: 0.27, ry: 0.15, a: 0 }],
    nucleus: [{ kind: 'ellipse', cx: 0.18, cy: 0.19, rx: 0.075, ry: 0.07, a: 0 }],
    chloro, mito
  };
}
function animalCell() {
  const mem = { kind: 'ellipse', cx: 0.5, cy: ASPECT / 2, rx: 0.46, ry: 0.27, a: 0 };
  const mito = [[0.26, 0.2, 0.5], [0.3, 0.44, -0.4], [0.7, 0.18, -0.6], [0.74, 0.43, 0.5], [0.5, 0.11, 0.05], [0.5, 0.51, -0.1], [0.14, 0.32, 1.5], [0.86, 0.32, 1.4]]
    .map(([x, y, a]) => ({ kind: 'ellipse', cx: x, cy: y, rx: 0.03, ry: 0.014, a }));
  return {
    membrane: [mem], cytoplasm: [mem],
    nucleus: [{ kind: 'ellipse', cx: 0.5, cy: ASPECT / 2, rx: 0.1, ry: 0.09, a: 0 }],
    mito
  };
}

// Signed distance (unit coords) from point to a shape outline; negative = inside.
function sdist(s, x, y) {
  if (s.kind === 'ellipse') {
    const c = Math.cos(-s.a || 0), sn = Math.sin(-s.a || 0), dx = x - s.cx, dy = y - s.cy;
    const u = dx * c - dy * sn, v = dx * sn + dy * c;
    const k = Math.hypot(u / s.rx, v / s.ry), r = Math.hypot(u, v);
    return k < 1e-9 ? -Math.min(s.rx, s.ry) : r * (1 - 1 / k); // distance along the ray from the centre
  }
  const hx = s.w / 2, hy = s.h / 2, qx = Math.abs(x - (s.x + hx)) - hx + s.r, qy = Math.abs(y - (s.y + hy)) - hy + s.r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - s.r;
}
// Which structure was hit? tol = touch tolerance in unit coords (so small organelles get ≥40 px targets).
// Small organelles win over the big regions they sit on; membrane and wall are thin bands.
function hitTest(cell, x, y, tol) {
  const nearestBand = id => (cell[id] || []).reduce((m, s) => Math.min(m, Math.abs(sdist(s, x, y))), Infinity);
  let best = null, bd = Infinity;
  for (const id of ['nucleus', 'mito', 'chloro']) for (const s of cell[id] || []) {
    // inside the shape, or within tol of its centre (a ≥ 2·tol touch disc even for tiny organelles)
    const d = sdist(s, x, y) <= 0 ? -1 : Math.hypot(x - s.cx, y - s.cy);
    if (d < bd) { bd = d; best = id; }
  }
  if (bd <= tol) return best;
  const mem = nearestBand('membrane'), wall = cell.wall ? nearestBand('wall') : Infinity;
  const band = Math.max(tol * 0.6, 0.012);
  if (cell.wall) {
    const inWall = sdist(cell.wall[0], x, y) <= band && sdist(cell.membrane[0], x, y) >= -band * 0.5;
    if (inWall) return mem < wall ? 'membrane' : 'wall';
  } else if (mem <= band) return 'membrane';
  if (cell.vacuole && cell.vacuole.some(s => sdist(s, x, y) <= 0)) return 'vacuole';
  if (cell.cytoplasm.some(s => sdist(s, x, y) <= 0)) return 'cytoplasm';
  return null;
}

/* ---------- step 2: membrane random walk ---------- */
const MEM = {
  cx: 0.5, cy: 0.5, R: 0.3,
  kinds: { small: { n: 30, sigma: 0.02, start: 'out' }, sugar: { n: 20, sigma: 0.016, start: 'out' }, protein: { n: 16, sigma: 0.016, start: 'in' } },
  channels: [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4], channelHalf: 0.18,
  holeAt: 0, holeHalf: 0.9, ticks: 900
};
const insideArea = Math.PI * MEM.R * MEM.R; // fraction of the unit square inside the cell
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const angDiff = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };
function canCross(kind, angle, torn) {
  if (torn && angDiff(angle, MEM.holeAt) <= MEM.holeHalf) return true;
  if (kind === 'small') return true;
  if (kind === 'sugar') return MEM.channels.some(c => angDiff(angle, c) <= MEM.channelHalf);
  return false;
}
const isIn = p => Math.hypot(p.x - MEM.cx, p.y - MEM.cy) < MEM.R;
function createMembraneSim(seed) {
  const rnd = mulberry32(seed || 1), parts = [];
  const gauss = () => { const u = Math.max(1e-12, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  for (const kind of Object.keys(MEM.kinds)) {
    const k = MEM.kinds[kind];
    for (let i = 0; i < k.n; i++) {
      let p;
      do { p = { kind, x: 0.03 + 0.94 * rnd(), y: 0.03 + 0.94 * rnd() }; }
      while ((k.start === 'in') !== (Math.hypot(p.x - MEM.cx, p.y - MEM.cy) < MEM.R - 0.03) || (k.start === 'out' && Math.hypot(p.x - MEM.cx, p.y - MEM.cy) < MEM.R + 0.03));
      parts.push(p);
    }
  }
  const sim = { parts, tick: 0, torn: false, hist: [] };
  sim.count = () => { const c = { small: 0, sugar: 0, protein: 0 }; parts.forEach(p => { if (isIn(p)) c[p.kind]++; }); return c; };
  sim.step = () => {
    for (const p of parts) {
      const s = MEM.kinds[p.kind].sigma;
      let nx = p.x + s * gauss(), ny = p.y + s * gauss();
      nx = nx < 0.01 ? 0.02 - nx : nx > 0.99 ? 1.98 - nx : nx;
      ny = ny < 0.01 ? 0.02 - ny : ny > 0.99 ? 1.98 - ny : ny;
      const was = isIn(p), now = Math.hypot(nx - MEM.cx, ny - MEM.cy) < MEM.R;
      if (was !== now) {
        const ang = Math.atan2((p.y + ny) / 2 - MEM.cy, (p.x + nx) / 2 - MEM.cx);
        if (!canCross(p.kind, ang, sim.torn)) continue; // blocked: the particle stays put this tick
      }
      p.x = nx; p.y = ny;
    }
    sim.tick++; sim.hist.push(sim.count());
  };
  sim.hist.push(sim.count());
  return sim;
}
function runMembrane(seed, torn, ticks) {
  const sim = createMembraneSim(seed); sim.torn = !!torn;
  for (let i = 0; i < (ticks || MEM.ticks); i++) sim.step();
  return sim;
}

/* ---------- step 3: Acetabularia graft ---------- */
// The regrown cap follows the species of the base that holds the nucleus. Hämmerling saw the first
// cap after a graft sometimes come out intermediate (instructions already sent into the stalk);
// cut it off and every later cap is purely the nucleus species. mix = share of the nucleus type.
function capAfterGraft(base, stalk, round) {
  if (base === stalk || round >= 2) return { type: base, mix: 1 };
  return { type: base, mix: 0.7 };
}

/* ---------- step 5: structure fits job (lookup table) ---------- */
const SCENARIOS = [
  { id: 'muscle', ask: 'most', options: ['mito', 'chloro', 'vacuole', 'nucleus'], answer: 'mito' },
  { id: 'leaf', ask: 'most', options: ['mito', 'chloro', 'vacuole', 'wall'], answer: 'chloro' },
  { id: 'root', ask: 'none', options: ['nucleus', 'chloro', 'vacuole', 'mito'], answer: 'chloro' },
  { id: 'rbc', ask: 'none', options: ['membrane', 'nucleus', 'cytoplasm'], answer: 'nucleus' }
];
const judge = (scenarioId, choice) => { const s = SCENARIOS.find(q => q.id === scenarioId); return !!s && s.answer === choice; };
// Plant-vs-animal: claiming a structure as a difference is right exactly when the plant has it and the animal does not.
const isDifference = id => PLANT_HAS.includes(id) && !ANIMAL_HAS.includes(id);

const api = {
  EYE_LIMIT_UM, FIELD_AT_1X_UM, MAG_MIN, MAG_MAX, SIZES, TILE, sizeOf, magFromSlider, fieldUm, apparentUm, visibleAt, minMagToSee, cellsPerMm, scaleBar, lengthUnit,
  ASPECT, STRUCTS, PLANT_ONLY, ANIMAL_HAS, PLANT_HAS, plantCell, animalCell, sdist, hitTest,
  MEM, insideArea, createMembraneSim, runMembrane, canCross, isIn, mulberry32,
  capAfterGraft, SCENARIOS, judge, isDifference
};
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.CELL_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
