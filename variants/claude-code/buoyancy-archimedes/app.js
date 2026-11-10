'use strict';
// Buoyancy lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every scene position, bar, plot point and readout comes from window.BUOY_MODEL (model.js).
// Canvas text is limited to panel titles, axis ticks, three bar letters (step 3) and the hydrometer marks (step 5).
(function () {

const $ = id => document.getElementById(id);
const M = window.BUOY_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', water: 'rgba(80,160,230,0.28)', waterLine: '#5fb0ec', metal: '#b9c4d0', wall: '#6f8299' };
const MATCOL = { al: '#cfd8e3', iron: '#7c8796', copper: '#e0915a', stone: '#a99b85' };
const MATKEY = { al: 'matAl', iron: 'matIron', copper: 'matCopper', stone: 'matStone' };
const LIQCOL = { oil: '#e8c95a', water: '#5fb0ec', brine: '#b79cff' };
const LIQKEY = { oil: 'liqOil', water: 'liqWater', brine: 'liqBrine' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 9);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: (o.x0 || 0) + (o.w || W) - (o.right || 14), t: o.top, b: o.bottom };
  if (o.x0) P.l += o.x0;
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.yFmt || String)(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.textAlign = 'center'; let lastR = -Infinity;
  for (const v of o.xTicks) {
    const X = x(v), s = (o.xFmt || String)(v), w = ctx.measureText(s).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b + 4); ctx.stroke();
    const cx = Math.min(Math.max(X, P.l + w / 2), (o.x0 || 0) + (o.w || W) - 2 - w / 2);
    if (cx - w / 2 < lastR + 6) continue;
    ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, (o.x0 || 0) + 8, P.t - 9, (o.w || W) - 16);
  return { x, y, P };
}
function path(ctx, pts, color, lw = 2, dash = null) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 3) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, h = Math.min(9, L * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * h * 0.8, y1 - uy * h * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * h - uy * h * 0.55, y1 - uy * h + ux * h * 0.55); ctx.lineTo(x1 - ux * h + uy * h * 0.55, y1 - uy * h - ux * h * 0.55); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// open tank: walls + liquid up to `surf`
function tank(ctx, x0, x1, top, surf, bottom, liquid = C.water, line = C.waterLine) {
  ctx.save(); ctx.fillStyle = liquid; ctx.fillRect(x0, surf, x1 - x0, bottom - surf);
  ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, surf); ctx.lineTo(x1, surf); ctx.stroke();
  ctx.strokeStyle = C.wall; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bottom); ctx.lineTo(x1, bottom); ctx.lineTo(x1, top); ctx.stroke(); ctx.restore();
}
// spring scale hanging from the top edge; reading sets the pointer inside the housing
function springScale(ctx, cx, topY, hookY, reading, full) {
  const hh = 46, hw = 22, y0 = hookY - hh - 6;
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, y0); ctx.stroke();
  ctx.fillStyle = '#1d2a3a'; ctx.strokeStyle = C.wall; ctx.fillRect(cx - hw / 2, y0, hw, hh); ctx.strokeRect(cx - hw / 2, y0, hw, hh);
  const py = y0 + 6 + (hh - 12) * Math.min(1, reading / full);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2; ctx.beginPath();
  const turns = 7; for (let i = 0; i <= turns * 2; i++) { const yy = y0 + 4 + (py - y0 - 4) * i / (turns * 2); ctx.lineTo(cx + (i % 2 ? 5 : -5), yy); } ctx.stroke();
  ctx.fillStyle = C.cyan; ctx.fillRect(cx - hw / 2 + 2, py - 1.5, hw - 4, 3);
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, y0 + hh); ctx.lineTo(cx, hookY); ctx.stroke();
  ctx.restore();
}

/* ---------- shared animation runner ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: the reading drops ---------- */
const s0 = { seen: new Set(Array.from({ length: 16 }, (_, i) => i)) };
const zKey = v => Math.round(v * 5);
function draw0() {
  const z = num('z0'), q = M.lowered(z), B = M.BLOCK;
  s0.seen.add(zKey(z));
  $('z0v').textContent = z.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0scene'), 8, 19, W - 16);
  const s = 7, surf = 118, cx = W / 2, bw = B.a * s, bh = B.h * s;
  const bottomY = surf + z * s;
  tank(ctx, cx - Math.min(150, W / 2 - 20), cx + Math.min(150, W / 2 - 20), 64, surf, surf + 12 * s + 12);
  springScale(ctx, cx, 26, bottomY - bh, q.reading, B.W * 1.1);
  ctx.save(); ctx.fillStyle = C.metal; ctx.fillRect(cx - bw / 2, bottomY - bh, bw, bh);
  // submerged part tinted
  if (q.hs > 0) { ctx.fillStyle = 'rgba(80,160,230,0.35)'; ctx.fillRect(cx - bw / 2, bottomY - q.hs * s, bw, q.hs * s); }
  ctx.strokeStyle = C.wall; ctx.strokeRect(cx - bw / 2, bottomY - bh, bw, bh); ctx.restore();
  const A = panel(ctx, W, { top: 262, bottom: H - 26, xMin: 0, xMax: 12, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6], xTicks: [0, 2, 4, 6, 8, 10, 12], title: t('c0plot') });
  path(ctx, [[A.x(0), A.y(B.W)], [A.x(12), A.y(B.W)]], C.text, 1.6);
  const pts = [...s0.seen].sort((a, b) => a - b);
  // draw the visited samples as connected runs
  const run = (fy, col) => { let seg = []; pts.forEach((k, i) => { if (i && k !== pts[i - 1] + 1) { path(ctx, seg, col, 2.4); seg = []; } const v = k / 5; seg.push([A.x(v), A.y(fy(v))]); }); path(ctx, seg, col, 2.4); pts.forEach(k => { const v = k / 5; dot(ctx, A.x(v), A.y(fy(v)), col, 1.8); }); };
  run(v => M.lowered(v).reading, C.cyan); run(v => M.lowered(v).Fb, C.orange);
  dot(ctx, A.x(z), A.y(q.reading), C.cyan, 5.5); dot(ctx, A.x(z), A.y(q.Fb), C.orange, 5.5);
  $('r0').textContent = t('s0readout', { z: z.toFixed(1), hs: q.hs.toFixed(1), read: fmt(q.reading), W: fmt(B.W), Fb: fmt(q.Fb), state: t(q.full ? 's0full' : 's0part') });
}

/* ---------- step 1: pressure on the faces ---------- */
function draw1() {
  const z = num('z1'), f = M.faces(z), B = M.BLOCK;
  $('z1v').textContent = z.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1scene'), 8, 19, W - 16);
  const s = 7, surf = 52, cx = W / 2, bw = B.a * s, bh = B.h * s, k = 14; // k: px per N
  const bot = surf + z * s, topY = bot - bh;
  tank(ctx, cx - Math.min(150, W / 2 - 20), cx + Math.min(150, W / 2 - 20), 32, surf, surf + 20 * s + 78);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, 26); ctx.lineTo(cx, topY); ctx.stroke();
  ctx.fillStyle = C.metal; ctx.fillRect(cx - bw / 2, topY, bw, bh); ctx.strokeStyle = C.wall; ctx.strokeRect(cx - bw / 2, topY, bw, bh); ctx.restore();
  // side pressures: short grey arrows at three depths on the submerged part
  for (let i = 1; i <= 3; i++) {
    const yy = topY + bh * (i / 4), d = (yy - surf) / s;
    if (d <= 0) continue;
    const len = Math.min(30, 4 + d * 1.4);
    arrow(ctx, cx - bw / 2 - len - 2, yy, cx - bw / 2 - 2, yy, C.raw, 2); arrow(ctx, cx + bw / 2 + len + 2, yy, cx + bw / 2 + 2, yy, C.raw, 2);
  }
  if (f.Ftop > 0) arrow(ctx, cx - 6, topY - 4 - f.Ftop * k, cx - 6, topY - 2, C.pink, 3.5);
  arrow(ctx, cx + 6, bot + 4 + f.Fbot * k, cx + 6, bot + 2, C.cyan, 3.5);
  const A = panel(ctx, W, { top: 322, bottom: H - 26, xMin: 0, xMax: 20, yMin: 0, yMax: 5, yTicks: [0, 1, 2, 3, 4, 5], xTicks: [0, 4, 8, 12, 16, 20], title: t('c1plot') });
  const curve = fn => { const p = []; for (let i = 0; i <= 200; i++) { const v = 20 * i / 200; p.push([A.x(v), A.y(fn(M.faces(v)))]); } return p; };
  path(ctx, curve(q => q.Ftop), C.pink, 2.2); path(ctx, curve(q => q.Fbot), C.cyan, 2.2); path(ctx, curve(q => q.net), C.orange, 2.6);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(8), A.P.t); ctx.lineTo(A.x(8), A.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(z), A.y(f.Ftop), C.pink, 5); dot(ctx, A.x(z), A.y(f.Fbot), C.cyan, 5); dot(ctx, A.x(z), A.y(f.net), C.orange, 5.5);
  $('r1').textContent = t('s1readout', { z: z.toFixed(1), Fbot: fmt(f.Fbot), Ftop: fmt(f.Ftop), net: fmt(f.net), Fb: fmt(M.lowered(z).Fb) });
}

/* ---------- step 2: overflow can ---------- */
const s2 = { mat: 'al', rec: new Map() };
function buildMats2() {
  const box = $('mats2');
  Object.keys(M.MATS).forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.mat = k; b.dataset.step = '2';
    b.addEventListener('click', () => { s2.mat = k; record2(); draw2(); }); box.appendChild(b);
  });
}
function record2() { const V = num('V2'); s2.rec.set(s2.mat + '|' + V, { mat: s2.mat, V }); }
function draw2() {
  const V = num('V2'), k = s2.mat, q = M.overflow(k, V);
  $('V2v').textContent = String(V);
  $('mats2').querySelectorAll('button').forEach(b => { b.textContent = t(MATKEY[b.dataset.mat]); b.setAttribute('aria-pressed', String(b.dataset.mat === k)); });
  $('lg2').innerHTML = `<span class="lg"><span class="sw sw-ghost"></span><span>${t('s2lgLine')}</span></span><span class="lg"><span>${t('s2lgPts')}</span></span>` +
    Object.keys(M.MATS).map(m => `<span class="lg"><span class="sw" style="background:${MATCOL[m]};border-radius:50%;width:10px;height:10px"></span><span>${t(MATKEY[m])}</span></span>`).join('');
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2scene'), 8, 19, W - 16);
  // can (left) and beaker (right); the object volume sets its drawn size (cube side ∝ V^(1/3))
  const s = 6, canW = 16 * s, canX = Math.max(14, W / 2 - canW - 20), canTop = 110, canBot = 220, rim = canTop + 10;
  tank(ctx, canX, canX + canW, canTop, rim, canBot);
  ctx.save(); ctx.strokeStyle = C.wall; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(canX + canW, rim + 2); ctx.lineTo(canX + canW + 26, rim + 12); ctx.stroke(); ctx.restore();
  const side = Math.cbrt(V) * s, ox = canX + canW / 2, oy = rim + 14;
  springScale(ctx, ox, 26, oy, q.reading, M.N(8.9 * 400) * 1.05);
  ctx.save(); ctx.fillStyle = MATCOL[k]; ctx.fillRect(ox - side / 2, oy, side, side); ctx.strokeStyle = C.wall; ctx.strokeRect(ox - side / 2, oy, side, side); ctx.restore();
  const bx = canX + canW + 40, bw = 8 * s, bTop = 140, bBot = 220, beakerCap = 450, lvl = bBot - (bBot - bTop) * q.spilledMass / beakerCap;
  tank(ctx, bx, bx + bw, bTop, lvl, bBot);
  // a falling stream from the spout
  ctx.save(); ctx.strokeStyle = C.waterLine; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(canX + canW + 26, rim + 12); ctx.quadraticCurveTo(bx + bw / 2, rim + 14, bx + bw / 2, lvl); ctx.stroke(); ctx.restore();
  const A = panel(ctx, W, { top: 262, bottom: H - 26, xMin: 0, xMax: 450, yMin: 0, yMax: 4.5, yTicks: [0, 1, 2, 3, 4], xTicks: [0, 100, 200, 300, 400], title: t('c2plot') });
  path(ctx, [[A.x(0), A.y(0)], [A.x(450), A.y(M.N(450))]], C.ghost, 1.6, [6, 5]);
  const mats = Object.keys(M.MATS);
  s2.rec.forEach(r => { const off = (mats.indexOf(r.mat) - 1.5) * 4; dot(ctx, A.x(r.V) + off, A.y(M.overflow(r.mat, r.V).Fb), MATCOL[r.mat], 4.2); });
  dot(ctx, A.x(V), A.y(q.Fb), MATCOL[k], 7, true);
  $('r2').textContent = cap(t('s2readout', { mat: t(MATKEY[k]), V, W: fmt(q.W), read: fmt(q.reading), Fb: fmt(q.Fb), sm: fmt(q.spilledMass, 0), sw: fmt(q.spilledWeight) }));
}

/* ---------- step 3: float, hover or sink ---------- */
const s3 = { liq: 'water', trail: [], y: null };
function buildLiq3() {
  const box = $('liq3');
  Object.keys(M.LIQ).forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.liq = k; b.dataset.step = '3';
    b.addEventListener('click', () => { s3.liq = k; addTrail3(); settle3(); }); box.appendChild(b);
  });
}
function addTrail3() { const r = num('r3'); s3.trail = s3.trail.filter(p => !(p.liq === s3.liq && p.r === r)); s3.trail.push({ liq: s3.liq, r }); }
const OBJ_SIDE = Math.cbrt(M.OBJ_V); // cm
// target height of the cube's bottom above the tank floor, in cm (tank liquid depth 14 cm)
const DEPTH3 = 14;
function target3() { const q = M.settle(num('r3'), M.LIQ[s3.liq]); return q.state === 'sink' ? 0 : q.state === 'hover' ? (DEPTH3 - OBJ_SIDE) / 2 : DEPTH3 - q.frac * OBJ_SIDE; }
function settle3() {
  const to = target3(), from = s3.y === null ? to : s3.y;
  animate('s3', 900, p => { const e = 1 - Math.pow(1 - p, 3); s3.y = from + (to - from) * e; draw3(); });
}
function draw3() {
  const r = num('r3'), L = M.LIQ[s3.liq], q = M.settle(r, L);
  if (s3.y === null) s3.y = target3();
  $('r3v').textContent = r.toFixed(2);
  $('liq3').querySelectorAll('button').forEach(b => { b.textContent = t(LIQKEY[b.dataset.liq]); b.setAttribute('aria-pressed', String(b.dataset.liq === s3.liq)); });
  const { ctx, W, H } = fitCanvas($('c3'));
  const split = Math.round(W * 0.58);
  title(ctx, t('c3scene'), 8, 19, split - 16);
  const s = Math.min(11, (split - 40) / 18), floor = 40 + 17 * s, tx0 = 18, tx1 = split - 14, surf = floor - DEPTH3 * s;
  const liqFill = { oil: 'rgba(232,201,90,0.25)', water: C.water, brine: 'rgba(183,156,255,0.25)' }[s3.liq];
  tank(ctx, tx0, tx1, floor - 17 * s, surf, floor, liqFill, LIQCOL[s3.liq]);
  const side = OBJ_SIDE * s, ox = (tx0 + tx1) / 2, oyBot = floor - s3.y * s;
  ctx.save(); ctx.fillStyle = '#d7b98e'; ctx.globalAlpha = 0.95; ctx.fillRect(ox - side / 2, oyBot - side, side, side); ctx.strokeStyle = C.wall; ctx.strokeRect(ox - side / 2, oyBot - side, side, side); ctx.restore();
  // bars
  title(ctx, t('c3bars'), split + 8, 19, W - split - 16);
  const bTop = 44, bBot = floor, fmax = M.N(3 * M.OBJ_V), bh = v => (bBot - bTop) * v / fmax;
  const cols = [[t('barW'), q.W, C.text], [t('barFb'), q.Fb, C.orange], [t('barN'), q.support, C.green]];
  const cw = (W - split - 16) / 3;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(split + 6, bBot); ctx.lineTo(W - 8, bBot); ctx.stroke();
  cols.forEach(([lab, v, col], i) => {
    const x = split + 8 + cw * i + cw * 0.2, w = cw * 0.6;
    ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x, bBot - bh(v), w, bh(v)); ctx.globalAlpha = 1;
    ctx.fillStyle = C.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(lab, x + w / 2, bBot + 15);
  });
  ctx.restore();
  const A = panel(ctx, W, { top: floor + 62, bottom: H - 26, xMin: 0, xMax: 3, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => Math.round(v * 100) + '%', xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], left: 46, title: t('c3plot') });
  s3.trail.forEach(p => { const qq = M.settle(p.r, M.LIQ[p.liq]); dot(ctx, A.x(p.r), A.y(qq.frac), LIQCOL[p.liq], 3.2); });
  ctx.save(); ctx.strokeStyle = LIQCOL[s3.liq]; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(L), A.P.t); ctx.lineTo(A.x(L), A.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(r), A.y(q.frac), LIQCOL[s3.liq], 6.5, true);
  const p = { liq: t(LIQKEY[s3.liq]).replace(/\s*[\d.]+$/, ''), ro: r.toFixed(2), rl: L.toFixed(2), W: fmt(q.W), Fb: fmt(q.Fb), N: fmt(q.support), pct: fmt(q.frac * 100, 1) };
  $('r3o').textContent = t(q.state === 'float' ? 's3float' : q.state === 'hover' ? 's3hover' : 's3sink', p);
}

/* ---------- step 4: steel boat ---------- */
const s4 = { trail: [] };
function draw4() {
  const H4 = num('H4'), c = num('m4'), q = M.boat(H4, c), Bt = M.BOAT;
  $('H4v').textContent = H4.toFixed(1); $('m4v').textContent = String(c);
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4scene'), 8, 19, W - 16);
  const s = Math.min(12, (W - 60) / (Bt.L + 6)), surf = 110, bl = Bt.L * s, cx = W / 2, floor = surf + 9 * s + 8;
  tank(ctx, 14, W - 14, 40, surf, Math.min(floor, 232));
  const bottomY = q.sinks ? Math.min(floor, 232) - 3 : surf + q.draft * s, hp = H4 * s;
  ctx.save();
  if (q.sinks) { ctx.translate(cx, bottomY); ctx.rotate(-0.08); ctx.translate(-cx, -bottomY); }
  // hull (open box): bottom + two ends; cargo as a block inside
  ctx.fillStyle = 'rgba(150,165,185,0.25)'; ctx.fillRect(cx - bl / 2, bottomY - hp, bl, hp);
  const cargoH = Math.min(hp - 2, (c / 1500) * hp * 0.9);
  if (c > 0) { ctx.fillStyle = '#c89a5a'; ctx.fillRect(cx - bl * 0.3, bottomY - 3 - cargoH, bl * 0.6, cargoH); }
  ctx.strokeStyle = q.sinks ? C.pink : C.metal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - bl / 2, bottomY - hp); ctx.lineTo(cx - bl / 2, bottomY); ctx.lineTo(cx + bl / 2, bottomY); ctx.lineTo(cx + bl / 2, bottomY - hp); ctx.stroke();
  ctx.restore();
  if (q.sinks) { ctx.save(); ctx.fillStyle = C.water; ctx.fillRect(cx - bl / 2 + 2, bottomY - hp, bl - 4, hp - 2); ctx.restore(); }
  const yMax = 11, A = panel(ctx, W, { top: 262, bottom: H - 26, xMin: 0, xMax: 1500, yMin: 0, yMax, yTicks: [0, 2, 4, 6, 8, 10], xTicks: [0, 300, 600, 900, 1200, 1500], title: t('c4plot') });
  const cmax = Math.max(0, Math.min(1500, q.maxCargo));
  path(ctx, [[A.x(0), A.y(M.boat(H4, 0).draft)], [A.x(cmax), A.y(M.boat(H4, cmax).draft)]], C.cyan, 2.4);
  ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(H4)); ctx.lineTo(A.x(1500), A.y(H4)); ctx.stroke(); ctx.restore();
  s4.trail.forEach(p => { const qq = M.boat(p.H, p.c); if (p.H === H4) dot(ctx, A.x(p.c), A.y(Math.min(yMax, qq.draft)), qq.sinks ? C.pink : C.text, 3); });
  dot(ctx, A.x(c), A.y(Math.min(yMax, q.draft)), q.sinks ? C.pink : C.cyan, 6.5, true);
  const p = { H: H4.toFixed(1), c, m: q.mass, d: fmt(q.draft, 1), fb: fmt(q.freeboard, 1), avg: fmt(q.avg, 2), left: Math.max(0, q.maxCargo - c), max: Math.max(0, q.maxCargo), lv: fmt(q.lumpV, 0), lf: fmt(q.lumpFb), lw: fmt(q.lumpW) };
  $('r4').textContent = q.maxCargo <= 0 && c === 0 ? t('s4none', p) : t(q.sinks ? 's4sink' : 's4float', p);
}
function addTrail4() { const H4 = num('H4'), c = num('m4'); s4.trail = s4.trail.filter(p => !(p.H === H4 && p.c === c)); s4.trail.push({ H: H4, c }); }

/* ---------- step 5: hydrometer ---------- */
const MARKS = [0.8, 0.9, 1.0, 1.1, 1.2];
const sx0 = W => Math.max(Math.round(W * 0.32) + 90, W - 120);
function draw5() {
  const r = num('r5'), h = M.hydLevel(r), Hd = M.HYD;
  $('r5v').textContent = r.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5scene'), 8, 19, W < 640 ? W - 16 : Math.min(sx0(W) - 40, W - 160));
  const s = 7, surf = 170, stemL = 20, cx = Math.round(W * 0.32);
  const bulbTop = surf + h * s, stemTop = bulbTop - stemL * s, bulbH = 34;
  tank(ctx, cx - 50, cx + 50, 60, surf, surf + 17 * s + bulbH + 22);
  ctx.save();
  ctx.fillStyle = 'rgba(232,237,244,0.18)'; ctx.strokeStyle = C.text; ctx.lineWidth = 1.5;
  ctx.fillRect(cx - 4, stemTop, 8, stemL * s); ctx.strokeRect(cx - 4, stemTop, 8, stemL * s);
  ctx.beginPath(); ctx.ellipse(cx, bulbTop + bulbH / 2, 13, bulbH / 2, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ghost; ctx.beginPath(); ctx.arc(cx, bulbTop + bulbH - 8, 6, 0, 7); ctx.fill();
  // marks on the stem (ticks only; numbers are on the strip)
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2;
  MARKS.forEach(m => { const y = bulbTop - M.hydLevel(m) * s; ctx.beginPath(); ctx.moveTo(cx - 4, y); ctx.lineTo(cx + 4, y); ctx.stroke(); });
  ctx.restore();
  // scale strip: the stem enlarged, 0..20 cm above the bulb
  const sx = Math.max(cx + 90, W - 120), s2 = (H - 80) / stemL, sb = H - 30, st = sb - stemL * s2;
  const stx = Math.min(sx - 30, W - 150), narrow = W < 640;
  title(ctx, t('c5scale'), narrow ? 8 : stx, narrow ? 36 : 19, narrow ? W - 16 : W - stx - 8);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(sx, st, 14, sb - st);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  for (let c = 0; c <= stemL; c += 5) { const y = sb - c * s2; ctx.beginPath(); ctx.moveTo(sx - 4, y); ctx.lineTo(sx, y); ctx.stroke(); ctx.fillText(String(c), sx - 7, y + 4); }
  ctx.textAlign = 'left'; ctx.fillStyle = C.orange; ctx.strokeStyle = C.orange;
  MARKS.forEach(m => { const y = sb - M.hydLevel(m) * s2; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + 20, y); ctx.stroke(); ctx.fillText(m.toFixed(1), sx + 24, y + 4); });
  const yc = sb - h * s2; ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(sx - 2, yc); ctx.lineTo(sx - 12, yc - 6); ctx.lineTo(sx - 12, yc + 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, yc); ctx.lineTo(sx + 14, yc); ctx.stroke();
  ctx.restore();
  // dashed link from the real surface on the stem to the strip
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.35; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx + 6, surf); ctx.lineTo(sx - 14, yc); ctx.stroke(); ctx.restore();
  $('r5o').textContent = t('s5readout', { r: r.toFixed(2), Vs: fmt(Hd.m / r, 1), h: fmt(h, 1), g1: fmt(M.hydLevel(0.8) - M.hydLevel(0.9), 1), g2: fmt(M.hydLevel(1.1) - M.hydLevel(1.2), 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildMats2(); buildLiq3();
  $('z0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.seen.clear();
    animate('s0', 4000, p => { const v = Math.round(p * 60) / 5; for (let k = 0; k <= Math.round(v * 5); k++) s0.seen.add(k); $('z0').value = v.toFixed(1); draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.seen.clear(); draw0(); });
  $('z1').addEventListener('input', draw1);
  $('V2').addEventListener('input', () => { record2(); draw2(); });
  $('clear2').addEventListener('click', () => { s2.rec.clear(); record2(); draw2(); });
  $('r3').addEventListener('input', () => { addTrail3(); settle3(); });
  $('clear3').addEventListener('click', () => { s3.trail = []; addTrail3(); draw3(); });
  ['H4', 'm4'].forEach(id => $(id).addEventListener('input', () => { addTrail4(); draw4(); }));
  $('clear4').addEventListener('click', () => { s4.trail = []; addTrail4(); draw4(); });
  $('r5').addEventListener('input', draw5);
  record2(); addTrail3(); addTrail4();

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
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
