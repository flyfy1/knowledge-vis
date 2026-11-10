'use strict';
// Simple circuits lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every glow, moving dot, hot wire and readout comes from window.CIRCUIT_MODEL (model.js), which solves each drawn
// circuit by nodal analysis. Canvas text is limited to +/− marks, cut letters A–D, meter numbers ①②③, bulb names
// and one chart title with its ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.CIRCUIT_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', red: '#ff6b6b', hot: '#ff5a3c', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', wire: '#9aa7b4', cell: '#33475c', glass: '#16222f', yellow: '#ffe27a', black: '#111' };
const MAT_COL = { copper: '#e08a4f', iron: '#aab4c0', foil: '#e6e9ee', lead: '#4b4f56', salt: '#7fc8e8', plastic: '#5aa9ff', rubber: '#f29bb6', wood: '#c69a63', glass: '#b9eef5', paper: '#f4f1e8' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// trailing zeros are stripped only after a decimal point, so toFixed(0) of 90 stays "90"
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const fmtI = I => { const a = Math.abs(I); return a >= 0.1 ? fmt(a, 2) + ' A' : a >= 1e-3 ? fmt(a * 1e3, 1) + ' mA' : a >= 1e-6 ? fmt(a * 1e6, 1) + ' µA' : '< 1 µA'; };
const fmtP = P => (P >= 0.01 ? fmt(P, 2) : P >= 1e-4 ? fmt(P, 4) : '0');
const I_REF = 0.27;          // about the current of one bulb on two cells; dots move 60 px/s at this current
const HOT_I = 1;             // wires carrying more than 1 A are drawn hot (a short circuit)

function fitCanvas(canvas, height) {
  const dpr = Math.min(3, window.devicePixelRatio || 1), W = Math.max(240, canvas.clientWidth || 600);
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, height);
  return { ctx, W, H: height };
}
const widthOf = c => Math.max(240, c.clientWidth || 600);
// Text that shrinks until it fits maxW and is kept inside the canvas.
function label(ctx, text, x, y, { align = 'left', maxW = 9999, size = 12, weight = 600, color = C.text, W = 9999 } = {}) {
  ctx.save(); ctx.fillStyle = color; let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  const w = ctx.measureText(text).width;
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(4, Math.min(W - 4 - w, x0));
  ctx.textAlign = 'left'; ctx.fillText(text, x0, y); ctx.restore();
}

/* ---------- polyline helpers ---------- */
const segLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
function pointAt(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= l || i === pts.length - 1) { const f = l ? Math.max(0, Math.min(1, d / l)) : 0; return [pts[i - 1][0] + f * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1]), (pts[i][0] - pts[i - 1][0]) / (l || 1), (pts[i][1] - pts[i - 1][1]) / (l || 1)]; }
    d -= l;
  }
  return [pts[0][0], pts[0][1], 1, 0];
}
function stroke(ctx, pts, color, w = 3, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
const bezierPts = (p0, c0, c1, p1, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const s = i / n, u = 1 - s; return [u * u * u * p0[0] + 3 * u * u * s * c0[0] + 3 * u * s * s * c1[0] + s * s * s * p1[0], u * u * u * p0[1] + 3 * u * u * s * c0[1] + 3 * u * s * s * c1[1] + s * s * s * p1[1]]; });

/* ---------- moving dots: speed follows the solved current ---------- */
const phases = {};           // key → distance travelled (px), advanced by the animation loop
const flows = {};            // step → [{ key, I }] registered by the last draw
const speedOf = I => (Math.abs(I) < 1e-6 ? 0 : Math.min(480, 60 * Math.abs(I) / I_REF));
function dots(ctx, step, key, pts, I, hidden) {
  if (hidden) return;
  const k = step + ':' + key; (flows[step] = flows[step] || []).push({ key: k, I });
  const L = segLen(pts), gap = 16, still = speedOf(I) === 0, off = (phases[k] || 0) % gap;
  ctx.save(); ctx.fillStyle = Math.abs(I) > HOT_I ? '#ffd2c4' : C.cyan; ctx.globalAlpha = still ? 0.3 : 0.95;
  for (let d = off; d < L; d += gap) { const p = pointAt(pts, I < 0 ? L - d : d); ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, 7); ctx.fill(); }
  ctx.restore();
}

/* ---------- circuit parts ---------- */
function cellsPart(ctx, A, B, n, { hot = false, W = 9999 } = {}) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L;
  const pack = Math.min(L * 0.72, 40 * n + 8), s0 = (L - pack) / 2, cl = pack / n;
  ctx.save(); ctx.translate(A[0], A[1]); ctx.rotate(Math.atan2(uy, ux));
  for (let i = 0; i < n; i++) {
    const x = s0 + i * cl;
    ctx.fillStyle = hot ? '#8a3324' : C.cell; ctx.strokeStyle = hot ? C.hot : '#7d93aa'; ctx.lineWidth = 1.2;
    ctx.fillRect(x + 1, -12, cl - 6, 24); ctx.strokeRect(x + 1, -12, cl - 6, 24);
    ctx.fillStyle = hot ? C.hot : '#c9d3de'; ctx.fillRect(x + cl - 5, -5, 4, 10);       // + nub, toward B
  }
  ctx.restore();
  // + and − marks on the outer side (toward the canvas edge the pack sits next to is avoided by the caller's side)
  const px = -uy, py = ux;
  label(ctx, '+', B[0] - ux * (s0 - 2) + px * 22, B[1] - uy * (s0 - 2) + py * 22 + 5, { align: 'center', size: 15, color: C.red, W });
  label(ctx, '−', A[0] + ux * (s0 - 2) + px * 22, A[1] + uy * (s0 - 2) + py * 22 + 5, { align: 'center', size: 15, color: C.cyan, W });
  return { a0: [A[0] + ux * s0, A[1] + uy * s0], b0: [B[0] - ux * s0, B[1] - uy * s0] };
}
// A bulb on a straight edge. P = its power (W). state: 'ok' | 'burnt' | 'removed'. neutral: drawn unlit (quiz, before checking).
function bulbPart(ctx, A, B, P, { state = 'ok', neutral = false, r = 15 } = {}) {
  const cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L;
  const on = !neutral && state === 'ok' && M.lit(P), b = Math.min(2.2, M.brightness(P));
  if (on) {
    const R = r + 8 + 22 * Math.sqrt(b), g = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, R);
    g.addColorStop(0, `rgba(255,226,122,${0.45 + 0.4 * Math.min(1, b)})`); g.addColorStop(1, 'rgba(255,226,122,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  }
  ctx.save();
  if (state === 'removed') { ctx.strokeStyle = C.muted; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.restore(); return; }
  ctx.fillStyle = on ? '#fff3c4' : C.glass; ctx.strokeStyle = on ? C.yellow : '#7d93aa'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.stroke();
  // filament: a zigzag across the bulb along the wire direction (broken in the middle when burnt)
  ctx.translate(cx, cy); ctx.rotate(Math.atan2(uy, ux));
  ctx.strokeStyle = on ? '#d9822b' : state === 'burnt' ? '#6b7785' : '#c9d3de'; ctx.lineWidth = 1.6; ctx.beginPath();
  const zz = [[-r, 0], [-r * 0.55, 0], [-r * 0.4, -4], [-r * 0.2, 4], [0, -4], [r * 0.2, 4], [r * 0.4, -4], [r * 0.55, 0], [r, 0]];
  zz.forEach(([x, y], i) => { if (state === 'burnt' && i === 4) { ctx.stroke(); ctx.beginPath(); ctx.moveTo(r * 0.12, 3); return; } i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.stroke(); ctx.restore();
}
function switchPart(ctx, A, B, closed) {
  const cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L;
  const c1 = [cx - ux * 15, cy - uy * 15], c2 = [cx + ux * 15, cy + uy * 15];
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(Math.min(c1[0], c2[0]) - 5, Math.min(c1[1], c2[1]) - 5, Math.abs(c2[0] - c1[0]) + 10, Math.abs(c2[1] - c1[1]) + 10); ctx.restore();
  // the open lever is turned 0.6 rad away from the line
  const ex2 = closed ? c2[0] : c1[0] + 30 * (ux * Math.cos(0.6) - uy * Math.sin(0.6)), ey2 = closed ? c2[1] : c1[1] + 30 * (ux * Math.sin(0.6) + uy * Math.cos(0.6));
  stroke(ctx, [c1, [ex2, ey2]], closed ? C.text : C.orange, 3);
  ctx.save(); ctx.fillStyle = C.text; [c1, c2].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 7); ctx.fill(); }); ctx.restore();
}
function gapPart(ctx, A, B, mat) {
  const cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L;
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(cx - 24, cy - 14, 48, 28); ctx.restore();
  if (mat) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.atan2(uy, ux)); ctx.fillStyle = MAT_COL[mat]; ctx.fillRect(-20, -8, 40, 16); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.strokeRect(-20, -8, 40, 16); ctx.restore(); }
  // two crocodile clips
  ctx.save(); ctx.fillStyle = '#d0d6de'; [-1, 1].forEach(sg => { ctx.beginPath(); ctx.arc(cx + sg * 20 * ux, cy + sg * 20 * uy, 4.5, 0, 7); ctx.fill(); }); ctx.restore();
}
function meterPart(ctx, p, ch, W) {
  ctx.save(); ctx.fillStyle = '#1c2a39'; ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], 12, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  label(ctx, ch, p[0], p[1] + 5, { align: 'center', size: 13, W });
}

/* ---------- a generic scene: nodes in unit coordinates, edges drawn by kind ---------- */
// spec: { nodes: {name: [u, v]}, edges: [{ id, kind, a, b, via?, cells?, tag?, tagSide? }], meters?: [{ id, f, ch }], cuts?: [{ id, f, letter, side }] }
function drawScene(ctx, box, spec, res, o) {
  const P = ([u, v]) => [box.x + u * box.w, box.y + v * box.h];
  const node = n => P(spec.nodes[n]), cut = new Set(o.cut || []), removed = new Set(o.removed || []), burnt = res.burnt || new Set();
  const paths = {};
  for (const e of spec.edges) {
    const pts = [node(e.a), ...(e.via || []).map(P), node(e.b)];
    paths[e.id] = pts;
    const I = res.cur[e.id] || 0, hot = Math.abs(I) > HOT_I && !o.hidden;
    if (e.kind === 'wire' || e.kind === 'short') {
      if (e.kind === 'short' && e.off) { continue; }
      const col = hot ? C.hot : e.kind === 'short' ? C.orange : C.wire;
      const c = (spec.cuts || []).find(q => q.id === e.id);
      if (c && cut.has(e.id)) {
        const L = segLen(pts), d = c.f * L, p0 = pointAt(pts, d - 9), p1 = pointAt(pts, d + 9);
        const first = [], second = []; let acc = 0;
        first.push(pts[0]); for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc < d - 9) first.push(pts[i]); else if (acc > d + 9) second.push(pts[i]); }
        stroke(ctx, [...first, [p0[0], p0[1]]], col, 3); stroke(ctx, [[p1[0], p1[1]], ...second], col, 3);
      } else stroke(ctx, pts, col, e.kind === 'short' ? 4 : 3);
    } else {
      const A = pts[0], B = pts[pts.length - 1];
      if (e.kind === 'cells') { stroke(ctx, pts, C.wire, 3); cellsPart(ctx, A, B, e.cells, { hot: !o.hidden && (res.pow[e.id] || 0) > 1, W: o.W }); }
      else if (e.kind === 'bulb') { stroke(ctx, pts, C.wire, 3); bulbPart(ctx, A, B, res.pow[e.id] || 0, { state: removed.has(e.id) ? 'removed' : burnt.has(e.id) ? 'burnt' : 'ok', neutral: o.hidden }); }
      else if (e.kind === 'switch') { stroke(ctx, pts, C.wire, 3); switchPart(ctx, A, B, !e.open); }
      else if (e.kind === 'sample') { stroke(ctx, pts, C.wire, 3); gapPart(ctx, A, B, e.mat); }
    }
  }
  // the loose short wire lying on the table when it is not connected
  for (const e of spec.edges) if (e.kind === 'short' && e.off) { const pts = e.loose.map(P); stroke(ctx, pts, C.orange, 4); ctx.save(); ctx.fillStyle = C.orange; pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7); ctx.fill(); }); ctx.restore(); }
  for (const e of spec.edges) if (!(e.kind === 'short' && e.off)) dots(ctx, o.step, e.id, paths[e.id], res.cur[e.id] || 0, o.hidden);
  for (const m of spec.meters || []) { const p = pointAt(paths[m.id], m.f * segLen(paths[m.id])); meterPart(ctx, p, m.ch, o.W); }
  for (const c of spec.cuts || []) {
    const p = pointAt(paths[c.id], c.f * segLen(paths[c.id])), nx = -p[3] * c.side, ny = p[2] * c.side, on = cut.has(c.id);
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.setLineDash(on ? [] : [2, 2]); ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7); ctx.stroke(); ctx.restore();
    label(ctx, c.letter, p[0] + nx * 22, p[1] + ny * 22 + 5, { align: 'center', size: 13, color: C.orange, W: o.W });
  }
  for (const e of spec.edges) if (e.tag) {
    const A = node(e.a), B = node(e.b), cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2;
    label(ctx, e.tag, cx, cy + (e.tagSide > 0 ? 42 : -32), { align: 'center', size: 12, color: C.muted, W: o.W });
  }
  if (o.ring) { const e = spec.edges.find(q => q.id === o.ring), A = node(e.a), B = node(e.b); ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 24, 0, 7); ctx.stroke(); ctx.restore(); }
}
// Fit a circuit box into the canvas: at most `maxW` wide, centred, with room for marks around it.
const boxIn = (x, y, w, h, maxW = 620) => { const bw = Math.min(w - 76, maxW); return { x: x + (w - bw) / 2, y: y + 50, w: bw, h: h - 90 }; };

/* ---------- step layouts (unit coordinates, y down) ---------- */
function specLoop(closed) {
  return {
    nodes: { n0: [0, 0], n1: [0.32, 0], n2: [0.62, 0], n3: [1, 0], n4: [1, 0.55], n6: [1, 1], n5: [0, 1] },
    edges: [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n3' }, { id: 'sw', kind: 'switch', a: 'n3', b: 'n4', open: !closed }, { id: 'w3', kind: 'wire', a: 'n4', b: 'n6' }, { id: 'w4', kind: 'wire', a: 'n6', b: 'n5' }
    ]
  };
}
function specTester(mat) {
  return {
    nodes: { n0: [0, 0], n1: [0.36, 0], n2: [0.64, 0], n3: [0.64, 1], n5: [0.36, 1], n4: [0, 1] },
    edges: [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n4', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n3', via: [[1, 0], [1, 1]] }, { id: 'gap', kind: 'sample', a: 'n3', b: 'n5', mat }, { id: 'w3', kind: 'wire', a: 'n5', b: 'n4' }
    ]
  };
}
function specTwo(mode) {
  const b1 = t('bulbN', { n: 1 }), b2 = t('bulbN', { n: 2 });
  if (mode === 'series') return {
    nodes: { n0: [0, 0], n1: [0.24, 0], n2: [0.46, 0], n3: [0.6, 0], n4: [0.82, 0], n5: [0, 1] },
    edges: [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'b1', kind: 'bulb', a: 'n1', b: 'n2', tag: b1, tagSide: 1 },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n3' }, { id: 'b2', kind: 'bulb', a: 'n3', b: 'n4', tag: b2, tagSide: 1 }, { id: 'w3', kind: 'wire', a: 'n4', b: 'n5', via: [[1, 0], [1, 1]] }
    ]
  };
  return {
    nodes: { n0: [0, 0], n1: [0.3, 0], n2: [0.66, 0], n3: [0.3, 0.55], n4: [0.66, 0.55], n6: [1, 0.55], n5: [0, 1] },
    edges: [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'b1', kind: 'bulb', a: 'n1', b: 'n2', tag: b1, tagSide: -1 },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n6', via: [[1, 0]] }, { id: 'w4', kind: 'wire', a: 'n1', b: 'n3' }, { id: 'b2', kind: 'bulb', a: 'n3', b: 'n4', tag: b2, tagSide: 1 },
      { id: 'w5', kind: 'wire', a: 'n4', b: 'n6' }, { id: 'w3', kind: 'wire', a: 'n6', b: 'n5', via: [[1, 1]] }
    ]
  };
}
function specShort(on) {
  return {
    nodes: { n0: [0, 0], n1: [0.36, 0], n2: [0.72, 0], n5: [0, 1] },
    edges: [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' },
      { id: 'short', kind: 'short', a: 'n1', b: 'n2', via: [[0.36, 0.42], [0.72, 0.42]], off: !on, loose: [[0.4, 0.7], [0.68, 0.7]] },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n5', via: [[1, 0], [1, 1]] }
    ]
  };
}
function specCells(n) {
  return {
    nodes: { n0: [0, 0], n1: [0.4, 0], n2: [0.7, 0], n3: [0, 1] },
    edges: [{ id: 'bat', kind: 'cells', cells: n, a: 'n3', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' }, { id: 'w2', kind: 'wire', a: 'n2', b: 'n3', via: [[1, 0], [1, 1]] }]
  };
}

/* ---------- step 0: the cut-open bulb and two leads ---------- */
// wires: [{ id, from: 'plus'|'minus', to: 'tip'|'side'|'plus'|'none', color }]
function scene0(ctx, W, H, wires, res, o) {
  const bx = Math.max(46, W * 0.16), plusY = 54, minusY = H - 44;
  const cx = W * (W < 500 ? 0.56 : 0.6), R = Math.max(30, Math.min(58, H * 0.19, W * 0.16)), gy = 30 + R;
  const yb0 = gy + R * 0.78, yb1 = yb0 + R * 0.72, bw = R * 0.92;
  const T = { plus: [bx, plusY], minus: [bx, minusY], tip: [cx, yb1 + 9], side: [cx - bw / 2 - 2, (yb0 + yb1) / 2] };
  // battery pack (two cells), − at the bottom, + at the top
  const batPts = [T.minus, T.plus];
  stroke(ctx, batPts, C.wire, 3);
  cellsPart(ctx, T.minus, T.plus, 2, { hot: !o.hidden && (res.pow.bat || 0) > 1, W });
  // leads
  const freeEnd = from => (from === 'plus' ? [bx + 70, plusY - 26] : [bx + 70, minusY + 22]);
  const leadPts = w => {
    const p0 = T[w.from], p1 = w.to === 'none' ? freeEnd(w.from) : T[w.to];
    if (w.to === 'plus') return bezierPts(p0, [p0[0] + 90, p0[1] - 10], [p1[0] + 90, p1[1] + 10], p1);
    if (w.to === 'none') return bezierPts(p0, [p0[0] + 30, p0[1]], [p1[0] - 20, p1[1]], p1, 16);
    // every lead arrives from the left (the thread contact is on the left of the screw base, the tip from below-left),
    // so the contact labels on the right of the bulb never sit on a wire
    const c0 = [p0[0] + (p1[0] - p0[0]) * 0.45, p0[1]], c1 = w.to === 'tip' ? [p1[0] - 12, p1[1] + (w.from === 'plus' ? 70 : 45)] : [p1[0] - 60, p1[1] + (w.from === 'plus' ? 0 : 20)];
    return bezierPts(p0, c0, c1, p1);
  };
  const paths = {};
  for (const w of wires) {
    const pts = leadPts(w); paths[w.id] = w.from === 'minus' ? pts.slice().reverse() : pts; // model: a black lead runs from its far end to −
    const hot = !o.hidden && Math.abs(res.cur[w.id] || 0) > HOT_I;
    stroke(ctx, pts, hot ? C.hot : w.color === 'red' ? C.red : '#9aa7b4', 6); stroke(ctx, pts, hot ? '#ffb3a3' : w.color === 'red' ? '#c43c3c' : C.black, 3.4);
    if (w.to === 'none') { const e = pts[pts.length - 1]; ctx.save(); ctx.fillStyle = '#c9a26b'; ctx.beginPath(); ctx.arc(e[0], e[1], 3.5, 0, 7); ctx.fill(); ctx.restore(); }
  }
  // the bulb, cut open: glass, filament, two leads, the screw base (side contact) and the tip under an insulating ring
  const P = res.pow.bulb || 0, on = !o.hidden && M.lit(P), b = Math.min(2.2, M.brightness(P));
  if (on) { const g = ctx.createRadialGradient(cx, gy, R * 0.2, cx, gy, R * (1.25 + 0.6 * Math.sqrt(b))); g.addColorStop(0, `rgba(255,226,122,${0.5 + 0.35 * Math.min(1, b)})`); g.addColorStop(1, 'rgba(255,226,122,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, gy, R * (1.25 + 0.6 * Math.sqrt(b)), 0, 7); ctx.fill(); }
  ctx.save(); ctx.fillStyle = on ? 'rgba(255,243,196,.28)' : 'rgba(150,180,210,.08)'; ctx.strokeStyle = on ? C.yellow : '#7d93aa'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, gy, R, Math.PI * 0.62, Math.PI * 2.38); ctx.lineTo(cx + bw / 2, yb0); ctx.lineTo(cx - bw / 2, yb0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = '#8f9cab'; ctx.fillRect(cx - bw / 2, yb0, bw, yb1 - yb0); ctx.strokeStyle = '#5d6b7a'; ctx.lineWidth = 1.2;
  for (let k = 1; k < 4; k++) { const y = yb0 + k * (yb1 - yb0) / 4; ctx.beginPath(); ctx.moveTo(cx - bw / 2, y - 3); ctx.lineTo(cx + bw / 2, y + 3); ctx.stroke(); }
  ctx.fillStyle = '#2a2f36'; ctx.fillRect(cx - bw * 0.32, yb1, bw * 0.64, 6); ctx.fillStyle = '#c9d3de'; ctx.beginPath(); ctx.arc(cx, yb1 + 9, 5, 0, 7); ctx.fill(); ctx.restore();
  const coilY = gy - R * 0.12, cl = [cx - R * 0.36, coilY], cr = [cx + R * 0.36, coilY];
  const fil = [T.tip, [cx, yb0 + 2], [cx - R * 0.12, yb0 - R * 0.1], cl];
  for (let k = 1; k <= 8; k++) fil.push([cl[0] + (cr[0] - cl[0]) * k / 8, coilY + (k % 2 ? -5 : 5) * (k < 8 ? 1 : 0)]);
  // the second lead joins the metal screw shell; the shell carries the current round to the thread contact
  fil.push(cr, [cx + R * 0.2, yb0 - R * 0.1], [cx + bw / 2 - 4, yb0 + 4], [cx + bw / 2 - 6, T.side[1]], T.side);
  stroke(ctx, fil.slice(0, 3), '#c9d3de', 1.4); stroke(ctx, fil.slice(2, -4), on ? '#ffb454' : '#c9d3de', on ? 2.2 : 1.4); stroke(ctx, fil.slice(-5, -2), '#c9d3de', 1.4);
  // contact labels (tip below, thread to the right) and the battery's own wire path for dots
  const lx = cx + bw / 2 + 10, lw = Math.max(40, W - lx - 8);
  label(ctx, t('inSide'), lx, T.side[1] + 4, { size: 12, color: C.muted, W, maxW: lw });
  label(ctx, t('inTip'), cx + 12, yb1 + 22, { size: 12, color: C.muted, W, maxW: lw + bw / 2 });
  if (o.ring) { ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, gy, R + 8, 0, 7); ctx.stroke(); ctx.restore(); }
  dots(ctx, o.step, 'bat', batPts, res.cur.bat || 0, o.hidden);
  dots(ctx, o.step, 'bulb', fil, res.cur.bulb || 0, o.hidden);
  for (const w of wires) dots(ctx, o.step, w.id, paths[w.id], res.cur[w.id] || 0, o.hidden);
}
// model edges for a set of leads (the same convention as model.hookup: red a = +, black b = −)
function edges0(wires) {
  const edges = [{ id: 'bat', kind: 'cells', cells: 2, a: 'minus', b: 'plus' }, { id: 'bulb', kind: 'bulb', a: 'tip', b: 'side' }];
  for (const w of wires) if (w.to !== 'none') edges.push(w.from === 'plus' ? { id: w.id, kind: 'wire', a: 'plus', b: w.to } : { id: w.id, kind: 'wire', a: w.to, b: 'minus' });
  return edges;
}

/* ---------- state ---------- */
const S = { paused: false, s0: { red: 'tip', black: 'none' }, s1: { closed: false, cuts: [] }, s2: { mat: null, log: [] }, s3: { mode: 'series', gone: false }, s5: { burnt: false, tried: new Set([1]) }, s6: { k: 0, revealed: false } };

function draw0() {
  const c = $('c0'), W = widthOf(c), { ctx, H } = fitCanvas(c, W < 500 ? 300 : 320);
  const wires = [{ id: 'red', from: 'plus', to: S.s0.red, color: 'red' }, { id: 'black', from: 'minus', to: S.s0.black, color: 'black' }];
  const res = M.run(edges0(wires));
  flows[0] = []; scene0(ctx, W, H, wires, res, { step: 0 });
  return res;
}
function upd0() {
  draw0(); const H = M.hookup(S.s0.red, S.s0.black);
  document.querySelectorAll('[data-red]').forEach(b => b.setAttribute('aria-pressed', b.dataset.red === S.s0.red));
  document.querySelectorAll('[data-black]').forEach(b => b.setAttribute('aria-pressed', b.dataset.black === S.s0.black));
  let html;
  if (M.lit(H.bulbP)) html = t('s0lit', { in: t(S.s0.red === 'tip' ? 'inTip' : 'inSide'), out: t(S.s0.black === 'tip' ? 'inTip' : 'inSide'), i: fmt(H.bulbI, 3) });
  else if (H.short) html = t(S.s0.black === 'plus' ? 's0shortPlus' : 's0shortSame', { i: fmt(H.batI, 2) });
  else html = t('s0open');
  $('r0').innerHTML = html;
}

function draw1() {
  const c = $('c1'), W = widthOf(c), { ctx, H } = fitCanvas(c, W < 500 ? 280 : 300);
  const spec = specLoop(S.s1.closed), res = M.loop(S.s1.closed, S.s1.cuts);
  spec.meters = [{ id: 'w1', f: 0.6, ch: '①' }, { id: 'w2', f: 0.45, ch: '②' }, { id: 'w4', f: 0.62, ch: '③' }];
  spec.cuts = [{ id: 'w1', f: 0.22, letter: 'A', side: -1 }, { id: 'w2', f: 0.82, letter: 'B', side: -1 }, { id: 'w3', f: 0.5, letter: 'C', side: 1 }, { id: 'w4', f: 0.25, letter: 'D', side: 1 }];
  flows[1] = []; drawScene(ctx, boxIn(0, 0, W, H), spec, res, { step: 1, cut: S.s1.cuts, W });
  return res;
}
function upd1() {
  const res = draw1(), cur = res.cur;
  $('sw1').textContent = t(S.s1.closed ? 'swOpen' : 'swClose');
  document.querySelectorAll('[data-cut]').forEach(b => b.setAttribute('aria-pressed', S.s1.cuts.includes(b.dataset.cut)));
  if (M.lit(res.pow.bulb)) $('r1').textContent = t('s1on', { a: fmt(Math.abs(cur.w1), 3), b: fmt(Math.abs(cur.w2), 3), c: fmt(Math.abs(cur.w4), 3), p: fmt(res.pow.bulb, 2) });
  else {
    const letters = { w1: 'A', w2: 'B', w3: 'C', w4: 'D' }, list = S.s1.cuts.map(k => letters[k]).sort().join(' / ');
    const where = !S.s1.closed ? t('whereSw') + (list ? ' + ' + t('whereCut', { list }) : '') : t('whereCut', { list });
    $('r1').textContent = t('s1off', { where });
  }
}

function draw2() {
  const c = $('c2'), W = widthOf(c), { ctx, H } = fitCanvas(c, W < 500 ? 260 : 280);
  const spec = specTester(S.s2.mat), res = M.tester(S.s2.mat);
  flows[2] = []; drawScene(ctx, boxIn(0, 0, W, H), spec, res, { step: 2, W });
  return res;
}
function verdict2(T) {
  if (T.cls === 'good') return T.P < 0.8 * M.tester('copper').P ? t('clsGoodDim') : t('clsGood');
  return T.cls === 'poor' ? t('clsPoor') : t('clsNone');
}
function upd2() {
  draw2();
  document.querySelectorAll('[data-mat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mat === S.s2.mat));
  if (!S.s2.mat) $('r2').textContent = t('s2empty');
  else { const T = M.tester(S.s2.mat); $('r2').textContent = t('s2readout', { m: t('mat_' + S.s2.mat), i: fmtI(T.I), p: fmtP(T.P), verdict: verdict2(T) }); }
  const rows = S.s2.log.map(id => { const T = M.tester(id); return `<tr class="${id === S.s2.mat ? 'on' : ''}"><td>${t('mat_' + id)}</td><td>${t(M.lit(T.P) ? 'litYes' : 'litNo')}</td><td>${fmtI(T.I)}</td><td class="${T.cls}">${t(T.cls === 'good' ? 'kGood' : T.cls === 'poor' ? 'kPoor' : 'kNone')}</td></tr>`; });
  $('t2').innerHTML = rows.length ? `<tr><th>${t('tblMat')}</th><th>${t('tblLit')}</th><th>${t('tblI')}</th><th>${t('tblClass')}</th></tr>` + rows.join('') : '';
}

function draw3() {
  const c = $('c3'), W = widthOf(c), { ctx, H } = fitCanvas(c, W < 500 ? 280 : 300);
  const spec = specTwo(S.s3.mode), rm = S.s3.gone ? ['b2'] : [], res = M.twoBulbs(S.s3.mode, rm);
  flows[3] = []; drawScene(ctx, boxIn(0, 0, W, H), spec, res, { step: 3, removed: rm, W });
  return res;
}
function upd3() {
  const res = draw3(), p0 = M.cells(2).P;
  $('series3').setAttribute('aria-pressed', S.s3.mode === 'series'); $('parallel3').setAttribute('aria-pressed', S.s3.mode === 'parallel');
  $('unscrew3').textContent = t(S.s3.gone ? 'screw' : 'unscrew');
  const note = S.s3.mode === 'series' ? (S.s3.gone ? 'noteSGone' : 'noteS') : (S.s3.gone ? 'notePGone' : 'noteP');
  $('r3').textContent = t('s3readout', { mode: t(S.s3.mode === 'series' ? 'modeS' : 'modeP'), p1: fmt(res.pow.b1, 2), p2: fmt(res.pow.b2, 2), i: fmt(Math.abs(res.cur.bat), 3), p0: fmt(p0, 2), k: Math.round(100 * res.pow.b1 / p0), note: t(note) });
}

let short4 = false;
function draw4() {
  const c = $('c4'), W = widthOf(c), { ctx, H } = fitCanvas(c, W < 500 ? 280 : 300);
  const res = M.shorted(short4);
  flows[4] = []; drawScene(ctx, boxIn(0, 0, W, H), specShort(short4), res, { step: 4, W });
  return res;
}
function upd4() {
  const res = draw4(), off = M.shorted(false);
  $('short4').textContent = t(short4 ? 'shortOff' : 'shortOn');
  $('r4').textContent = short4
    ? t('s4on', { i: fmt(res.batI, 2), k: fmt(res.batI / off.batI, 1), ib: fmt(res.bulbI, 4), h: fmt(res.heat, 2), kh: Math.round(res.heat / off.heat) })
    : t('s4off', { i: fmt(res.batI, 3), h: fmt(res.heat, 3) });
}

// A bulb that burned out stays broken until a new one is fitted; with 4 cells a new bulb burns out at once.
function state5(n) {
  const c = M.cells(n);
  if (c.burnt) return { ...c, burntNow: true, keep: false };
  if (S.s5.burnt) return { ...c, P: 0, I: 0, burntNow: false, keep: true, cur: Object.fromEntries(Object.keys(c.cur).map(k => [k, 0])), pow: { bulb: 0, bat: 0 }, burnt: new Set(['bulb']) };
  return { ...c, burntNow: false, keep: false };
}
function draw5() {
  const c = $('c5'), W = widthOf(c), wide = W >= 600, { ctx, H } = fitCanvas(c, wide ? 300 : 500), n = Number($('n5').value), st = state5(n);
  const A = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: 250 };
  const R = wide ? { x: W * 0.5, y: 0, w: W * 0.5, h: H } : { x: 0, y: 250, w: W, h: H - 250 };
  flows[5] = [];
  drawScene(ctx, boxIn(A.x, A.y, A.w, A.h, 360), specCells(n), { cur: st.cur, pow: st.pow, burnt: st.burnt instanceof Set ? st.burnt : new Set(st.burntNow ? ['bulb'] : []) }, { step: 5, W });
  if (!wide) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(10, R.y + 2); ctx.lineTo(W - 10, R.y + 2); ctx.stroke(); }
  // chart: bulb power at the moment of connecting, for every cell count tried
  label(ctx, t('c5plot'), R.x + 10, R.y + 20, { maxW: R.w - 20, W });
  const pl = { l: R.x + 44, r: R.x + R.w - 18, t: R.y + 36, b: R.y + R.h - 28 };
  const X = v => pl.l + (v - 0.5) / 4 * (pl.r - pl.l), Y = v => pl.b - v / 2.75 * (pl.b - pl.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of [0, 0.5, 1, 1.5, 2, 2.5]) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(pl.l, Y(v)); ctx.lineTo(pl.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v, 1), pl.l - 6, Y(v) + 4); }
  ctx.textAlign = 'center'; for (let k = 1; k <= 4; k++) ctx.fillText(String(k), X(k), pl.b + 16);
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(pl.l, pl.t); ctx.lineTo(pl.l, pl.b); ctx.stroke(); ctx.restore();
  stroke(ctx, [[pl.l, Y(M.BULB.ratedP)], [pl.r, Y(M.BULB.ratedP)]], C.green, 1.6, [5, 4]);
  stroke(ctx, [[pl.l, Y(M.BULB.burnP)], [pl.r, Y(M.BULB.burnP)]], C.red, 1.6, [5, 4]);
  const tried = [...S.s5.tried].sort();
  if (tried.length > 1) stroke(ctx, tried.map(k => [X(k), Y(M.cells(k).P0)]), 'rgba(103,215,249,.45)', 1.5);
  ctx.save(); tried.forEach(k => { const P0 = M.cells(k).P0; ctx.fillStyle = P0 > M.BULB.burnP ? C.red : C.cyan; ctx.beginPath(); ctx.arc(X(k), Y(P0), k === n ? 6.5 : 4, 0, 7); ctx.fill(); }); ctx.restore();
  return st;
}
function upd5() {
  const n = Number($('n5').value), st = draw5();
  $('n5v').textContent = String(n);
  const pct = Math.round(100 * st.P / M.BULB.ratedP);
  const state = st.keep ? t('stBurntKeep') : st.burntNow ? t('stBurnt', { p0: fmt(st.P0, 2) }) : pct < 60 ? t('stDim') : pct <= 120 ? t('stOk') : t('stOver');
  $('r5').textContent = t('s5readout', { n, v: fmt(1.5 * n, 1), i: fmt(st.I, 3), p: fmt(st.P, 2), pct, state });
  $('new5').disabled = !S.s5.burnt;
}

function quizScene(name) {
  const q = M.quiz(name);
  switch (name) {
    case 'open': case 'normal': return { q, spec: specLoop(name === 'normal') };
    case 'seriesGone': return { q, spec: specTwo('series'), removed: ['b2'] };
    case 'parallelGone': return { q, spec: specTwo('parallel'), removed: ['b2'] };
    case 'shortWire': return { q, spec: specShort(true) };
    case 'plastic': case 'lead': return { q, spec: specTester(name) };
    case 'samePole': return { q, wires: [{ id: 'red', from: 'plus', to: 'tip', color: 'red' }, { id: 'red2', from: 'plus', to: 'side', color: 'red' }] };
  }
  return null;
}
function draw6() {
  const c = $('c6'), W = widthOf(c), { ctx, H } = fitCanvas(c, W < 500 ? 290 : 310), name = M.QUIZ[S.s6.k % M.QUIZ.length], Q = quizScene(name), hidden = !S.s6.revealed;
  flows[6] = [];
  if (Q.wires) scene0(ctx, W, H, Q.wires, Q.q, { step: 6, hidden, ring: true });
  else drawScene(ctx, boxIn(0, 0, W, H), Q.spec, Q.q, { step: 6, hidden, removed: Q.removed, ring: Q.q.ask, W });
}
function upd6() {
  draw6();
  $('qn6').textContent = t('quizN', { k: S.s6.k % M.QUIZ.length + 1, N: M.QUIZ.length });
  const fb = $('fb6'), st = fb.dataset.state, name = M.QUIZ[S.s6.k % M.QUIZ.length];
  if (st === 'none') fb.textContent = t('quizPick');
  else if (st) fb.textContent = t(st === 'right' ? 'quizRight' : 'quizWrong') + ' ' + t('why_' + name);
  else fb.textContent = '';
}

/* ---------- animation loop: only visible steps, never while hidden, paused or with reduced motion ---------- */
const visible = new Set();
const drawers = { 0: draw0, 1: draw1, 2: draw2, 3: draw3, 4: draw4, 5: draw5, 6: draw6 };
let raf = 0, last = 0;
function loopOn() { return !S.paused && !reduceMotion() && !document.hidden; }
function tick(now) {
  raf = 0; const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
  for (const st of visible) { for (const f of flows[st] || []) phases[f.key] = (phases[f.key] || 0) + speedOf(f.I) * dt; drawers[st](); }
  if (loopOn() && visible.size) raf = requestAnimationFrame(tick); else last = 0;
}
function kick() { if (!raf && loopOn() && visible.size) { last = 0; raf = requestAnimationFrame(tick); } }
function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; }

function refresh() {
  upd0(); upd1(); upd2(); upd3(); upd4(); upd5(); upd6();
  document.querySelectorAll('.flow-btn').forEach(b => { b.textContent = t(S.paused ? 'resume' : 'pause'); b.setAttribute('aria-pressed', S.paused); b.disabled = reduceMotion(); });
}

function setup() {
  document.querySelectorAll('[data-red]').forEach(b => b.addEventListener('click', () => { S.s0.red = b.dataset.red; upd0(); }));
  document.querySelectorAll('[data-black]').forEach(b => b.addEventListener('click', () => { S.s0.black = b.dataset.black; upd0(); }));
  $('sw1').addEventListener('click', () => { S.s1.closed = !S.s1.closed; upd1(); });
  document.querySelectorAll('[data-cut]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.cut, i = S.s1.cuts.indexOf(k); if (i >= 0) S.s1.cuts.splice(i, 1); else S.s1.cuts.push(k); upd1(); }));
  $('mend1').addEventListener('click', () => { S.s1.cuts = []; upd1(); });
  const box = $('mats2');
  M.MATERIALS.forEach(m => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.mat = m.id; b.dataset.step = '2'; b.dataset.i18n = 'mat_' + m.id; b.textContent = t('mat_' + m.id); b.addEventListener('click', () => { S.s2.mat = m.id; S.s2.log = S.s2.log.filter(x => x !== m.id).concat(m.id); upd2(); }); box.appendChild(b); });
  $('clear2').addEventListener('click', () => { S.s2.mat = null; S.s2.log = []; upd2(); });
  $('series3').addEventListener('click', () => { S.s3.mode = 'series'; upd3(); });
  $('parallel3').addEventListener('click', () => { S.s3.mode = 'parallel'; upd3(); });
  $('unscrew3').addEventListener('click', () => { S.s3.gone = !S.s3.gone; upd3(); });
  $('short4').addEventListener('click', () => { short4 = !short4; upd4(); });
  $('n5').addEventListener('input', () => { const n = Number($('n5').value); S.s5.tried.add(n); if (!S.s5.burnt && M.cells(n).burnt) S.s5.burnt = true; upd5(); });
  $('new5').addEventListener('click', () => { S.s5.burnt = M.cells(Number($('n5').value)).burnt; upd5(); });
  $('check6').addEventListener('click', () => {
    const ch = document.querySelector('input[name="quiz6"]:checked'), fb = $('fb6');
    if (!ch) { fb.dataset.state = 'none'; fb.style.color = C.orange; upd6(); return; }
    const ok = (ch.value === 'lit') === M.quizLit(M.quiz(M.QUIZ[S.s6.k % M.QUIZ.length]));
    S.s6.revealed = true; fb.dataset.state = ok ? 'right' : 'wrong'; fb.style.color = ok ? C.green : C.orange; upd6(); kick();
  });
  $('next6').addEventListener('click', () => { S.s6.k++; S.s6.revealed = false; document.querySelectorAll('input[name="quiz6"]').forEach(r => { r.checked = false; }); $('fb6').dataset.state = ''; upd6(); });
  document.querySelectorAll('.flow-btn').forEach(b => b.addEventListener('click', () => { S.paused = !S.paused; refresh(); if (S.paused) stopLoop(); else kick(); }));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const cv = new IntersectionObserver(es => { es.forEach(e => { const k = Number(e.target.id.slice(1)); if (e.isIntersecting) visible.add(k); else visible.delete(k); }); kick(); });
    for (let k = 0; k <= 6; k++) cv.observe($('c' + k));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoop(); else kick(); });
  if (window.matchMedia) { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const f = () => { refresh(); if (reduceMotion()) stopLoop(); else kick(); }; if (mq.addEventListener) mq.addEventListener('change', f); }
  window.refreshLesson = refresh;
  refresh(); kick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
