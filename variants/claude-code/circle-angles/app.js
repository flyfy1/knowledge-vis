'use strict';
// Inscribed angles lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every angle drawn or printed comes from window.CIRCLE_MODEL (model.js), which measures it from point
// coordinates. Canvas text goes through a label placer that keeps labels inside the canvas and apart.
(function () {

const $ = id => document.getElementById(id);
const M = window.CIRCLE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#7d8ca0', white: '#e8edf4', ring: '#5d7088' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s.replace('-', '−'); };
const deg = v => fmt(v, 1);

/* ---------- shared canvas kit: fitCanvas, label placer, primitives, animation runner ---------- */
function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Label placer: each label tries its candidate anchors (and smaller sizes) until it fits inside the canvas
// without touching an earlier label; a label that fits nowhere is skipped rather than drawn on top of another.
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    put(text, cands, o = {}) {
      const size0 = o.size || 11, minSize = o.minSize || Math.min(size0, 9);
      for (let s = size0; s >= minSize; s -= 0.5) {
        ctx.font = `${o.weight || ''} ${s}px system-ui,"PingFang SC",sans-serif`;
        const w = ctx.measureText(text).width, asc = s * 0.92, desc = s * 0.28;
        for (const [ax, ay, align] of cands) {
          let x0 = align === 'center' ? ax - w / 2 : align === 'right' ? ax - w : ax;
          if (o.clamp !== false) x0 = Math.max(3, Math.min(W - 3 - w, x0));
          const y = Math.max(asc + 3, Math.min(H - 3 - desc, ay));
          const b = { x0: x0 - 2, y0: y - asc - 1, x1: x0 + w + 2, y1: y + desc + 1 };
          if (b.x0 < 0 || b.x1 > W || hit(b)) continue;
          boxes.push(b);
          ctx.save();
          if (o.bg !== false) { ctx.fillStyle = 'rgba(13,22,33,0.82)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          ctx.fillStyle = o.color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x0, y);
          ctx.restore();
          return b;
        }
      }
      return null;
    }
  };
}

function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p; }
function niceTicks(max, n) { const s = niceStep(max / n); const out = []; for (let v = 0; v <= max + s * 0.999; v += s) out.push(v); return out; }

function line(ctx, pts, color, w = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, r, color, ring) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, w = 2.5) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), hd = Math.min(9, L * 0.5);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hd * 0.7, y1 - Math.sin(a) * hd * 0.7); ctx.stroke();
  if (L > 2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(a - 0.45), y1 - hd * Math.sin(a - 0.45)); ctx.lineTo(x1 - hd * Math.cos(a + 0.45), y1 - hd * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function clipRect(ctx, P) { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); }

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }


/* ---------- figure helpers ---------- */
function geo(canvas, W, H, padX = 30, padY = 28) {
  const r = Math.max(60, Math.min(W / 2 - padX, H / 2 - padY)), cx = W / 2, cy = H / 2;
  const g = { cx, cy, r, p: q => ({ x: cx + q.x * r, y: cy - q.y * r }) };
  canvas._geo = g; return g;
}
function circle(ctx, g, color = C.ring, w = 2) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r, 0, 7); ctx.stroke(); ctx.restore(); }
function seg(ctx, g, P, Q, color, w = 2, dash = null) { const a = g.p(P), b = g.p(Q); line(ctx, [[a.x, a.y], [b.x, b.y]], color, w, dash); }
function pt(ctx, g, P, color, r = 4.5) { const a = g.p(P); dot(ctx, a.x, a.y, r, color); }
// Highlight the arc between A and B: the minor one (through the bottom) or the major one.
function arcAB(ctx, g, c, which, color, w = 5) {
  const tA = -(270 - c / 2) * Math.PI / 180, tB = -(270 + c / 2) * Math.PI / 180;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.globalAlpha = 0.85; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r, tA, tB, which === 'minor'); ctx.stroke(); ctx.restore();
}
// Angle mark at V between rays to P1 and P2 (or the reflex angle). Returns the bisector direction (radians, canvas).
function angMark(ctx, g, V, P1, P2, rad, color, { reflex = false, alpha = 0.16, lw = 2 } = {}) {
  const v = g.p(V), a = g.p(P1), b = g.p(P2);
  const a1 = Math.atan2(a.y - v.y, a.x - v.x), a2 = Math.atan2(b.y - v.y, b.x - v.x);
  let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d <= -Math.PI) d += 2 * Math.PI;
  if (reflex) d = d > 0 ? d - 2 * Math.PI : d + 2 * Math.PI;
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.arc(v.x, v.y, rad, a1, a1 + d, d < 0); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(v.x, v.y, rad, a1, a1 + d, d < 0); ctx.stroke(); ctx.restore();
  return a1 + d / 2;
}
function angLabel(L, g, V, dir, rad, text, color) {
  const v = g.p(V), cands = [];
  for (const rr of [rad + 14, rad + 28, rad + 44]) for (const rot of [0, 0.35, -0.35, 0.7, -0.7]) cands.push([v.x + Math.cos(dir + rot) * rr, v.y + Math.sin(dir + rot) * rr + 4, 'center']);
  return L.put(text, cands, { color, weight: 600 });
}
function ptLabel(L, g, P, name, color = C.text) {
  const a = g.p(P); let dx = a.x - g.cx, dy = a.y - g.cy; const n = Math.hypot(dx, dy);
  const cands = [];
  if (n < 1) for (const [ox, oy, al] of [[0, -9, 'center'], [-9, -7, 'right'], [9, -7, 'left'], [-11, 5, 'right'], [11, 5, 'left'], [-9, 17, 'right'], [9, 17, 'left']]) cands.push([a.x + ox, a.y + oy, al]);
  else { dx /= n; dy /= n; for (const rad of [14, 24]) for (const rot of [0, 0.55, -0.55, 1.1, -1.1]) { const c = Math.cos(rot), s = Math.sin(rot); cands.push([a.x + (dx * c - dy * s) * rad, a.y + (dx * s + dy * c) * rad + 5, 'center']); } }
  return L.put(name, cands, { color, weight: 700, size: 13, bg: false });
}
function reservePts(L, g, pts) { pts.forEach(P => { const a = g.p(P); L.reserve(a.x - 5, a.y - 5, a.x + 5, a.y + 5); }); }

// Angle-vs-position chart (steps 1 and 3): x = position s (−180..180), y = measured angle (0..180).
function chart(canvas, title, series, refs, cur) {
  const { ctx, W, H } = fitCanvas(canvas), L = labeler(ctx, W, H);
  const P = { l: 40, r: W - 12, t: 30, b: H - 28 };
  const X = s => P.l + (s + 180) / 360 * (P.r - P.l), Y = v => P.b - v / 180 * (P.b - P.t);
  L.put(title, [[8, 17]], { size: 11.5, weight: 600, bg: false, minSize: 8.5 });
  ctx.save(); ctx.lineWidth = 1;
  for (const v of [0, 45, 90, 135, 180]) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); }
  ctx.restore();
  for (const v of [0, 45, 90, 135, 180]) L.put(v + '°', [[P.l - 5, Y(v) + 4, 'right']], { color: C.muted, bg: false, size: 10.5 });
  for (const s of [-180, -90, 0, 90, 180]) L.put(fmt(s, 0) + '°', [[X(s), P.b + 16, 'center']], { color: C.muted, bg: false, size: 10.5 });
  refs.forEach(r => line(ctx, [[P.l, Y(r.v)], [P.r, Y(r.v)]], r.color, 1.4, [6, 4]));
  series.forEach(sr => sr.pts.forEach(q => { ctx.fillStyle = q.color || sr.color; ctx.globalAlpha = sr.alpha || 1; ctx.beginPath(); ctx.arc(X(q.s), Y(q.p), 2.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }));
  series.forEach(sr => sr.pts.forEach(q => L.reserve(X(q.s) - 2, Y(q.p) - 2, X(q.s) + 2, Y(q.p) + 2)));
  if (cur && cur.p !== null) { line(ctx, [[X(cur.s), P.t], [X(cur.s), P.b]], C.white, 1, [2, 3]); dot(ctx, X(cur.s), Y(cur.p), 5, C.white); L.reserve(X(cur.s) - 6, Y(cur.p) - 6, X(cur.s) + 6, Y(cur.p) + 6); }
  refs.forEach(r => { if (r.label) L.put(r.label, [[P.r - 4, Y(r.v) - 6, 'right'], [P.r - 4, Y(r.v) + 15, 'right'], [P.l + 6, Y(r.v) - 6], [P.l + 6, Y(r.v) + 15]], { color: r.color, size: 10.5 }); });
  series.forEach(sr => { if (sr.label && sr.pts.length) { const q = sr.pts.reduce((a, b) => (a.s < b.s ? a : b)); L.put(sr.label, [[X(q.s) - 6, Y(q.p) + 4, 'right'], [X(q.s), Y(q.p) - 8, 'center'], [X(q.s), Y(q.p) + 16, 'center']], { color: sr.color, size: 10.5 }); } });
}

// Dragging along the circle: reports the polar angle (degrees, maths convention) of the pointer.
function dragOnCircle(canvas, onPhi) {
  let active = false;
  const phiAt = e => {
    const rect = canvas.getBoundingClientRect(), g = canvas._geo; if (!g) return null;
    const x = e.clientX - rect.left, y = e.clientY - rect.top, d = Math.hypot(x - g.cx, y - g.cy);
    if (!active && (d < g.r * 0.55 || d > g.r * 1.4)) return null;
    return Math.atan2(-(y - g.cy), x - g.cx) * 180 / Math.PI;
  };
  canvas.addEventListener('pointerdown', e => { const phi = phiAt(e); if (phi === null) return; active = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } onPhi(phi); e.preventDefault(); });
  canvas.addEventListener('pointermove', e => { if (!active) return; const phi = phiAt(e); if (phi !== null) onPhi(phi); });
  const end = () => { active = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
}
function setSlider(id, v) { const el = $(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
function majorRange(id, c) {
  const el = $(id), lim = Math.floor(M.majorLimit(c) - M.MIN_GAP);
  el.min = -lim; el.max = lim; if (Number(el.value) > lim) el.value = lim; if (Number(el.value) < -lim) el.value = -lim;
}

/* ---------- step 0: name the two angles ---------- */
function drawFigure0() {
  const c = 100, s = num('s0'); $('s0v').textContent = deg(s) + '°';
  const { ctx, W, H } = fitCanvas($('c0')), L = labeler(ctx, W, H), g = geo($('c0'), W, H);
  const { A, B } = M.chord(c), P = M.pointAt(s), p = M.inscribed(c, s), major = M.onMajor(c, s);
  circle(ctx, g);
  if (p !== null) arcAB(ctx, g, c, major ? 'minor' : 'major', C.orange);
  seg(ctx, g, M.O, A, C.violet, 2); seg(ctx, g, M.O, B, C.violet, 2);
  seg(ctx, g, A, B, C.ghost, 1.4, [4, 4]);
  if (p !== null) { seg(ctx, g, P, A, C.cyan, 2.2); seg(ctx, g, P, B, C.cyan, 2.2); }
  const dO = angMark(ctx, g, M.O, A, B, 24, C.violet);
  const dP = p !== null ? angMark(ctx, g, P, A, B, 26, C.cyan) : 0;
  [A, B, P].forEach(Q => pt(ctx, g, Q, C.text)); pt(ctx, g, M.O, C.violet, 4);
  reservePts(L, g, [A, B, P, M.O]);
  ptLabel(L, g, M.O, 'O', C.violet); ptLabel(L, g, A, 'A'); ptLabel(L, g, B, 'B'); ptLabel(L, g, P, 'P', C.cyan);
  angLabel(L, g, M.O, dO, 24, deg(M.central(c)) + '°', C.violet);
  if (p !== null) angLabel(L, g, P, dP, 26, deg(p) + '°', C.cyan);
  $('r0').textContent = p === null ? t('coincide', { pt: s > 0 ? 'A' : 'B' }) : t('s0readout', { arc: t(major ? 'arcMajor' : 'arcMinor'), c: deg(M.central(c)), p: deg(p) });
}

/* ---------- step 1: drag P along the major arc ---------- */
const OLD = ['#b79cff', '#7ee2a8', '#ff7a93', '#9aaabd'];
const s1 = { traces: [{ c: 100, pts: new Map() }], walking: null };
function cur1() { return s1.traces[s1.traces.length - 1]; }
function record1() { const c = num('c1s'), s = num('s1'), p = M.inscribed(c, s); if (p !== null) cur1().pts.set(s, p); }
function draw1() {
  const c = num('c1s'), s = num('s1'), p = M.inscribed(c, s);
  $('c1sv').textContent = c + '°'; $('s1v').textContent = deg(s) + '°';
  const { ctx, W, H } = fitCanvas($('c1')), L = labeler(ctx, W, H), g = geo($('c1'), W, H, 26, 24);
  const { A, B } = M.chord(c), P = M.pointAt(s);
  circle(ctx, g); arcAB(ctx, g, c, 'minor', C.orange, 4);
  seg(ctx, g, M.O, A, C.violet, 2); seg(ctx, g, M.O, B, C.violet, 2);
  seg(ctx, g, P, A, C.cyan, 2.2); seg(ctx, g, P, B, C.cyan, 2.2);
  const dO = angMark(ctx, g, M.O, A, B, 22, C.violet), dP = angMark(ctx, g, P, A, B, 24, C.cyan);
  // ghost positions already measured, so the path P took stays visible on the circle
  ctx.save(); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.35;
  for (const ss of cur1().pts.keys()) { const q = g.p(M.pointAt(ss)); ctx.beginPath(); ctx.arc(q.x, q.y, 2.2, 0, 7); ctx.fill(); }
  ctx.restore();
  [A, B, P].forEach(Q => pt(ctx, g, Q, C.text)); pt(ctx, g, M.O, C.violet, 4);
  reservePts(L, g, [A, B, P, M.O]);
  ptLabel(L, g, M.O, 'O', C.violet); ptLabel(L, g, A, 'A'); ptLabel(L, g, B, 'B'); ptLabel(L, g, P, 'P', C.cyan);
  angLabel(L, g, M.O, dO, 22, deg(M.central(c)) + '°', C.violet);
  angLabel(L, g, P, dP, 24, deg(p) + '°', C.cyan);
  const series = s1.traces.map((tr, i) => {
    const last = i === s1.traces.length - 1;
    return { pts: [...tr.pts].map(([ss, pp]) => ({ s: ss, p: pp })), color: last ? C.cyan : OLD[i % OLD.length], alpha: last ? 1 : 0.7, label: last ? null : '∠AOB ' + tr.c + '°' };
  });
  chart($('g1'), t('g1title'), series, [{ v: M.central(c), color: C.violet, label: '∠AOB' }, { v: M.central(c) / 2, color: C.ghost, label: '½∠AOB' }], { s, p });
  const vals = [...cur1().pts.values()], spread = vals.length ? Math.max(...vals) - Math.min(...vals) : 0;
  const prog = s1.walking ? t('walking', s1.walking) : '';
  $('r1').textContent = t('s1readout', { prog, c, s: deg(s), p: deg(p), h: deg(M.central(c) / 2), diff: fmt(Math.abs(p - M.central(c) / 2), 1), n: vals.length, spread: fmt(spread, 1) });
}

/* ---------- step 2: the proof, one construction line at a time ---------- */
const s2 = { k: 0 };
function draw2() {
  const c = num('c2s'), s = num('s2'), k = s2.k;
  $('c2sv').textContent = c + '°'; $('s2v').textContent = deg(s) + '°';
  const pr = M.proof(c, s), { A, B, P, D } = pr;
  const { ctx, W, H } = fitCanvas($('c2')), L = labeler(ctx, W, H), g = geo($('c2'), W, H);
  circle(ctx, g);
  const rc = k >= 1 ? C.pink : C.violet;
  seg(ctx, g, M.O, A, rc, 2.2); seg(ctx, g, M.O, B, rc, 2.2);
  seg(ctx, g, P, A, C.cyan, 2.2); seg(ctx, g, P, B, C.cyan, 2.2);
  if (k >= 1) { seg(ctx, g, M.O, P, C.pink, 2.2); seg(ctx, g, M.O, D, C.pink, 1.6, [6, 5]); }
  const labels = [];
  if (k === 0 || k === 4) { const d = angMark(ctx, g, M.O, A, B, 20, C.violet, { alpha: 0.22 }); labels.push([M.O, d, 20, deg(pr.AOB) + '°', C.violet]); }
  const dP = angMark(ctx, g, P, A, B, 46, C.cyan, { alpha: 0.08, lw: 1.5 });
  if (k >= 2) {
    const a1 = angMark(ctx, g, A, M.O, P, 22, C.orange), a2 = angMark(ctx, g, P, M.O, A, 26, C.orange);
    const b1 = angMark(ctx, g, B, M.O, P, 22, C.green), b2 = angMark(ctx, g, P, M.O, B, 30, C.green);
    labels.push([A, a1, 22, 'α ' + deg(pr.baseA) + '°', C.orange], [P, a2, 26, 'α', C.orange], [B, b1, 22, 'β ' + deg(pr.baseB) + '°', C.green], [P, b2, 30, 'β', C.green]);
  }
  if (k >= 3) {
    const d1 = angMark(ctx, g, M.O, A, D, 30, C.orange, { alpha: 0.12 }), d2 = angMark(ctx, g, M.O, B, D, 40, C.green, { alpha: 0.12 });
    labels.push([M.O, d1, 30, '2α', C.orange], [M.O, d2, 40, '2β', C.green]);
  }
  const pts = [A, B, P, M.O].concat(k >= 1 ? [D] : []);
  pts.forEach(Q => pt(ctx, g, Q, C.text)); reservePts(L, g, pts);
  ptLabel(L, g, M.O, 'O', C.violet); ptLabel(L, g, A, 'A'); ptLabel(L, g, B, 'B'); ptLabel(L, g, P, 'P', C.cyan); if (k >= 1) ptLabel(L, g, D, 'D', C.pink);
  labels.forEach(([V, d, rad, txt, col]) => angLabel(L, g, V, d, rad, txt, col));
  angLabel(L, g, P, dP, 46, '∠APB ' + deg(pr.APB) + '°', C.cyan);
  // the proof lines, revealed up to k
  const vals = { apb: deg(pr.APB), aob: deg(pr.AOB), r: fmt(pr.OA, 3), a1: deg(pr.baseA), a2: deg(pr.baseP_A), b1: deg(pr.baseB), b2: deg(pr.baseP_B), aod: deg(pr.AOD), bod: deg(pr.BOD), a2x: deg(2 * pr.baseA), b2x: deg(2 * pr.baseB) };
  const keys = ['p0', 'p1', 'p2', 'p3', pr.inside ? 'p4in' : 'p4out'];
  const list = $('proof2'); list.innerHTML = '';
  keys.slice(0, k + 1).forEach((key, i) => { const li = document.createElement('li'); li.textContent = t(key, vals); if (i === k) li.className = 'cur'; list.appendChild(li); });
  $('prog2').textContent = t('prog', { k });
  $('prev2').disabled = k === 0; $('next2').disabled = k === 4;
  $('r2').textContent = t('s2readout', { s: deg(s), where: t(pr.inside ? 'whereIn' : 'whereOut'), prog: t('prog', { k }) });
}

/* ---------- step 3: the chord becomes a diameter ---------- */
const s3 = { pts: new Map(), walking: null };
function record3() { const c = M.cFromOffset(num('d3')), s = num('s3'), p = M.inscribed(c, s); if (p !== null) s3.pts.set(s, { p, up: M.onMajor(c, s) }); }
function draw3() {
  const d = num('d3'), c = M.cFromOffset(d), s = num('s3'), p = M.inscribed(c, s), up = M.onMajor(c, s);
  $('d3v').textContent = fmt(d, 2); $('s3v').textContent = deg(s) + '°';
  const { ctx, W, H } = fitCanvas($('c3')), L = labeler(ctx, W, H), g = geo($('c3'), W, H, 26, 24);
  const { A, B } = M.chord(c), P = M.pointAt(s);
  circle(ctx, g);
  seg(ctx, g, A, B, d === 0 ? C.pink : C.ghost, 2.2);
  if (p !== null) { arcAB(ctx, g, c, up ? 'minor' : 'major', up ? C.cyan : C.orange, 3); seg(ctx, g, P, A, up ? C.cyan : C.orange, 2.2); seg(ctx, g, P, B, up ? C.cyan : C.orange, 2.2); }
  const dP = p !== null ? angMark(ctx, g, P, A, B, 22, up ? C.cyan : C.orange) : 0;
  ctx.save(); for (const [ss, q] of s3.pts) { const a = g.p(M.pointAt(ss)); ctx.fillStyle = q.up ? C.cyan : C.orange; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(a.x, a.y, 2.2, 0, 7); ctx.fill(); } ctx.restore();
  [A, B, P].forEach(Q => pt(ctx, g, Q, C.text)); pt(ctx, g, M.O, C.pink, 4);
  reservePts(L, g, [A, B, P, M.O]);
  ptLabel(L, g, M.O, 'O', C.pink); ptLabel(L, g, A, 'A'); ptLabel(L, g, B, 'B'); ptLabel(L, g, P, 'P', up ? C.cyan : C.orange);
  if (p !== null) angLabel(L, g, P, dP, 22, deg(p) + '°', up ? C.cyan : C.orange);
  const pts = [...s3.pts].map(([ss, q]) => ({ s: ss, p: q.p, color: q.up ? C.cyan : C.orange }));
  chart($('g3'), t('g3title'), [{ pts, color: C.cyan }], [{ v: 90, color: C.ghost, label: '90°' }], { s, p });
  const rng = upSide => {
    const v = [...s3.pts.values()].filter(q => q.up === upSide).map(q => q.p), side = t(upSide ? 'sideUp' : 'sideDown');
    return v.length ? t('rangeHas', { side, n: v.length, lo: deg(Math.min(...v)), hi: deg(Math.max(...v)) }) : t('rangeNone', { side });
  };
  const prog = s3.walking ? t('walking', s3.walking) : '';
  if (p === null) $('r3').textContent = prog + t('coincide', { pt: s > 0 ? 'A' : 'B' }) + ' ' + rng(true) + rng(false);
  else $('r3').textContent = t('s3readout', { prog, d: fmt(d, 2), dia: d === 0 ? t('diaYes') : t('diaNo', { c: deg(c) }), s: deg(s), side: t(up ? 'sideUp' : 'sideDown'), p: deg(p), ranges: rng(true) + rng(false) });
}

/* ---------- step 4: both sides of the chord ---------- */
function draw4() {
  const c = num('c4s'), u = num('u4') / 100, v = num('v4') / 100;
  $('c4sv').textContent = c + '°'; $('u4v').textContent = num('u4') + '%'; $('v4v').textContent = num('v4') + '%';
  const q = M.quad(c, u, v), { A, B } = M.chord(c), P = M.pointAt(q.sP), Q = M.pointAt(q.sQ);
  const { ctx, W, H } = fitCanvas($('c4')), L = labeler(ctx, W, H), g = geo($('c4'), W, H);
  circle(ctx, g);
  seg(ctx, g, M.O, A, C.violet, 1.6); seg(ctx, g, M.O, B, C.violet, 1.6);
  const dR = angMark(ctx, g, M.O, A, B, 20, C.violet, { reflex: true, alpha: 0.1 });
  seg(ctx, g, P, A, C.cyan, 2.2); seg(ctx, g, P, B, C.cyan, 2.2); seg(ctx, g, Q, A, C.orange, 2.2); seg(ctx, g, Q, B, C.orange, 2.2);
  const dP = angMark(ctx, g, P, A, B, 24, C.cyan), dQ = angMark(ctx, g, Q, A, B, 20, C.orange);
  [A, B, P, Q].forEach(X => pt(ctx, g, X, C.text)); pt(ctx, g, M.O, C.violet, 4);
  reservePts(L, g, [A, B, P, Q, M.O]);
  ptLabel(L, g, M.O, 'O', C.violet); ptLabel(L, g, A, 'A'); ptLabel(L, g, B, 'B'); ptLabel(L, g, P, 'P', C.cyan); ptLabel(L, g, Q, 'Q', C.orange);
  angLabel(L, g, P, dP, 24, deg(q.P) + '°', C.cyan); angLabel(L, g, Q, dQ, 20, deg(q.Q) + '°', C.orange);
  angLabel(L, g, M.O, dR, 20, deg(q.reflex) + '°', C.violet);
  $('r4').textContent = t('s4readout', { p: deg(q.P), q: deg(q.Q), sum: deg(q.sum), c: deg(M.central(c)), reflex: deg(q.reflex), half: deg(q.reflex / 2) });
}

/* ---------- step 5: find the centre with a set square ---------- */
const s5 = { lines: [] };
function draw5() {
  const phi = num('phi5'), tau = num('tau5'); $('phi5v').textContent = phi + '°'; $('tau5v').textContent = fmt(tau, 0) + '°';
  const sq = M.setSquare(phi, tau);
  const { ctx, W, H } = fitCanvas($('c5')), L = labeler(ctx, W, H), g = geo($('c5'), W, H);
  circle(ctx, g, C.ring, 2.4);
  s5.lines.forEach(l => seg(ctx, g, l.X, l.Y, C.cyan, 2));
  seg(ctx, g, sq.X, sq.Y, C.orange, 1.4, [5, 5]);
  // the set square: two thick legs from V and a right-angle box
  seg(ctx, g, sq.V, sq.X, C.orange, 4); seg(ctx, g, sq.V, sq.Y, C.orange, 4);
  const v = g.p(sq.V), x = g.p(sq.X), y = g.p(sq.Y), ux = (x.x - v.x) / Math.hypot(x.x - v.x, x.y - v.y), uy = (x.y - v.y) / Math.hypot(x.x - v.x, x.y - v.y);
  const wx = (y.x - v.x) / Math.hypot(y.x - v.x, y.y - v.y), wy = (y.y - v.y) / Math.hypot(y.x - v.x, y.y - v.y), k = 12;
  line(ctx, [[v.x + ux * k, v.y + uy * k], [v.x + ux * k + wx * k, v.y + uy * k + wy * k], [v.x + wx * k, v.y + wy * k]], C.orange, 1.6);
  [sq.V, sq.X, sq.Y].forEach(Q => pt(ctx, g, Q, C.text)); reservePts(L, g, [sq.V, sq.X, sq.Y]);
  let after;
  const n = s5.lines.length;
  if (n === 0) after = t('after0'); else if (n === 1) after = t('after1');
  else {
    const X0 = M.intersect(s5.lines[0], s5.lines[1]);
    if (!X0) after = t('afterPar', { n });
    else {
      pt(ctx, g, X0, C.white, 6); reservePts(L, g, [X0]);
      L.put(t('centreLabel'), [[g.p(X0).x + 10, g.p(X0).y - 8], [g.p(X0).x - 10, g.p(X0).y - 8, 'right'], [g.p(X0).x + 10, g.p(X0).y + 18], [g.p(X0).x - 10, g.p(X0).y + 18, 'right']], { color: C.white, weight: 700 });
      after = t('afterN', { n, d1: fmt(M.dist(X0, sq.V), 3), d2: fmt(M.dist(X0, sq.X), 3), d3: fmt(M.dist(X0, sq.Y), 3) });
    }
  }
  ptLabel(L, g, sq.V, 'V', C.orange); ptLabel(L, g, sq.X, 'X'); ptLabel(L, g, sq.Y, 'Y');
  $('r5').textContent = t('s5readout', { corner: deg(sq.corner), len: fmt(sq.len, 3), off: fmt(sq.off, 3), after });
}

/* ---------- step 6: quiz ---------- */
function checkQuiz() {
  [['q1', 'f1', M.QUIZ.q1], ['q2', 'f2', M.QUIZ.q2], ['q3', 'f3', 90]].forEach(([q, f, v]) => {
    const pick = document.querySelector(`input[name="${q}"]:checked`), el = $(f);
    if (!pick) { el.textContent = t('q0'); el.className = 'quiz-feedback bad'; el.dataset.state = 'empty'; return; }
    const ok = pick.value === M.quizKey(q);
    el.textContent = t(q + (ok ? 'ok' : 'no'), { v: deg(v), pick: t(q + pick.value) });
    el.className = 'quiz-feedback' + (ok ? '' : ' bad'); el.dataset.state = ok ? 'correct' : 'wrong';
  });
}

function refresh() {
  drawFigure0(); draw1(); draw2(); draw3(); draw4(); draw5();
  ['f1', 'f2', 'f3'].forEach(id => { if ($(id).dataset.state) checkQuiz(); });
}

function walk(name, state, id, from, to, record, draw) {
  const N = to - from + 1;
  animate(name, Math.min(6000, N * 30), p => {
    const k = Math.min(N, Math.floor(p * N) + 1);
    for (let i = 0; i < k; i++) { $(id).value = from + i; record(); }
    state.walking = p < 1 ? { k, N } : null; $(id).value = from + k - 1; draw();
  }, () => { state.walking = null; draw(); });
}

function setup() {
  $('s0').addEventListener('input', drawFigure0);
  dragOnCircle($('c0'), phi => setSlider('s0', Math.round(M.norm(phi - 90))));

  majorRange('s1', num('c1s'));
  $('c1s').addEventListener('input', () => {
    stopAnim('s1'); s1.walking = null;
    const c = num('c1s'); majorRange('s1', c);
    if (cur1().pts.size) { s1.traces.push({ c, pts: new Map() }); if (s1.traces.length > 4) s1.traces.shift(); } else cur1().c = c;
    record1(); draw1();
  });
  $('s1').addEventListener('input', () => { stopAnim('s1'); s1.walking = null; record1(); draw1(); });
  dragOnCircle($('c1'), phi => { const el = $('s1'); setSlider('s1', Math.max(Number(el.min), Math.min(Number(el.max), Math.round(M.norm(phi - 90))))); });
  $('walk1').addEventListener('click', () => walk('s1', s1, 's1', Number($('s1').min), Number($('s1').max), record1, draw1));
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.walking = null; s1.traces = [{ c: num('c1s'), pts: new Map() }]; record1(); draw1(); });
  record1();

  majorRange('s2', num('c2s'));
  $('c2s').addEventListener('input', () => { majorRange('s2', num('c2s')); draw2(); });
  $('s2').addEventListener('input', draw2);
  dragOnCircle($('c2'), phi => { const el = $('s2'); setSlider('s2', Math.max(Number(el.min), Math.min(Number(el.max), Math.round(M.norm(phi - 90))))); });
  $('prev2').addEventListener('click', () => { s2.k = Math.max(0, s2.k - 1); draw2(); });
  $('next2').addEventListener('click', () => { s2.k = Math.min(4, s2.k + 1); draw2(); });

  $('d3').addEventListener('input', () => { stopAnim('s3'); s3.walking = null; s3.pts.clear(); record3(); draw3(); });
  $('s3').addEventListener('input', () => { stopAnim('s3'); s3.walking = null; record3(); draw3(); });
  dragOnCircle($('c3'), phi => setSlider('s3', Math.round(M.norm(phi - 90))));
  $('walk3').addEventListener('click', () => walk('s3', s3, 's3', -180, 180, record3, draw3));
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.walking = null; s3.pts.clear(); record3(); draw3(); });
  record3();

  ['c4s', 'u4', 'v4'].forEach(id => $(id).addEventListener('input', draw4));
  dragOnCircle($('c4'), phi => {
    const c = num('c4s'), lim = M.majorLimit(c), s = M.norm(phi - 90), gap = M.MIN_GAP;
    if (Math.abs(s) < lim) setSlider('u4', Math.round(Math.max(0, Math.min(1, (s + lim - gap) / (2 * (lim - gap)))) * 100));
    else { const s2v = s < 0 ? s + 360 : s; setSlider('v4', Math.round(Math.max(0, Math.min(1, (s2v - lim - gap) / (360 - 2 * lim - 2 * gap))) * 100)); }
  });

  ['phi5', 'tau5'].forEach(id => $(id).addEventListener('input', draw5));
  dragOnCircle($('c5'), phi => setSlider('phi5', Math.round(((phi % 360) + 360) % 360) % 360));
  $('draw5').addEventListener('click', () => { const sq = M.setSquare(num('phi5'), num('tau5')); s5.lines.push({ X: sq.X, Y: sq.Y }); draw5(); });
  $('clear5').addEventListener('click', () => { s5.lines = []; draw5(); });
  $('checkQuiz').addEventListener('click', checkQuiz);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
