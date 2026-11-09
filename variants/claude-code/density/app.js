'use strict';
// Density lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every size, level, point and readout comes from window.DENS_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and a few labels laid out in fixed columns/rows (material names, cylinder marks, layer names).
(function () {

const $ = id => document.getElementById(id);
const M = window.DENS_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', water: 'rgba(80,160,230,0.28)', waterLine: '#5fb0ec', wall: '#6f8299' };
const MCOL = { pine: '#d9b77e', ice: '#bfe6f5', al: '#cfd8e3', iron: '#7c8796', copper: '#e0915a', lead: '#8f8fb8', gold: '#f2c94c', silver: '#c9ced6' };
const MNAME = { pine: 'mPine', ice: 'mIce', al: 'mAl', iron: 'mIron', copper: 'mCopper', lead: 'mLead', gold: 'mGold', silver: 'mSilver' };
const LCOL = { oil: 'rgba(232,201,90,0.45)', water: 'rgba(95,176,236,0.35)', soap: 'rgba(126,226,168,0.40)', honey: 'rgba(214,140,50,0.65)' };
const LKEY = { oil: 'Oil', water: 'Water', soap: 'Soap', honey: 'Honey' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const name = k => t(MNAME[k]);

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 9);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
// Label that shrinks to fit a fixed slot width (centred).
function label(ctx, text, X, Y, maxW, color = C.muted, size0 = 12) {
  let size = size0; ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'center';
  do { ctx.font = `${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8.5);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
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
    const cx = Math.min(Math.max(X, P.l + w / 2), W - 2 - w / 2);
    if (cx - w / 2 < lastR + 6) continue;
    ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
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
// A box drawn in simple oblique projection; w, h, d in px. (x, y) = bottom-left of the front face.
function box(ctx, x, y, w, h, d, color) {
  const k = 0.45;
  ctx.save(); ctx.strokeStyle = 'rgba(10,14,20,0.6)'; ctx.lineWidth = 1;
  ctx.fillStyle = color; ctx.fillRect(x, y - h, w, h); ctx.strokeRect(x, y - h, w, h);
  ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + d * k, y - h - d * k); ctx.lineTo(x + w + d * k, y - h - d * k); ctx.lineTo(x + w, y - h); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d * k, y - d * k); ctx.lineTo(x + w + d * k, y - h - d * k); ctx.lineTo(x + w, y - h); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function cylinder(ctx, x0, x1, top, bottom, levelY) {
  ctx.save(); ctx.fillStyle = C.water; ctx.fillRect(x0, levelY, x1 - x0, bottom - levelY);
  ctx.strokeStyle = C.waterLine; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, levelY); ctx.lineTo(x1, levelY); ctx.stroke();
  ctx.strokeStyle = C.wall; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bottom); ctx.lineTo(x1, bottom); ctx.lineTo(x1, top); ctx.stroke(); ctx.restore();
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

/* ---------- step 0: equal masses ---------- */
function draw0() {
  const m = num('m0'), rows = M.equalMass(m);
  $('m0v').textContent = String(m);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0cubes'), 8, 19, W - 16);
  const cw = (W - 16) / 4, maxSide = Math.cbrt(500 / M.RHO.pine), s = Math.min(cw * 0.6, 120) / maxSide, base = 196;
  rows.forEach((r, i) => {
    const side = r.side * s, x = 8 + cw * i + (cw - side * 1.2) / 2;
    box(ctx, x, base, side, side, side, MCOL[r.key]);
    label(ctx, name(r.key), 8 + cw * i + cw / 2, base + 20, cw - 6);
  });
  // volume bars
  title(ctx, t('c0bars'), 8, 250, W - 16);
  ctx.save(); ctx.font = '12px system-ui,sans-serif';
  const labW = Math.max(...rows.map(r => ctx.measureText(name(r.key)).width)) + 12, valW = ctx.measureText('1000.0').width + 10;
  const x0 = 8 + labW, x1 = W - 8 - valW, bx = v => x0 + v / 1000 * (x1 - x0);
  ctx.strokeStyle = C.grid; ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  [0, 250, 500, 750, 1000].forEach((v, i) => { const X = bx(v); ctx.beginPath(); ctx.moveTo(X, 262); ctx.lineTo(X, 262 + 4 * 34); ctx.stroke(); if (i % (W < 420 ? 2 : 1) === 0) ctx.fillText(String(v), X, 262 + 4 * 34 + 14); });
  rows.forEach((r, i) => {
    const yc = 262 + i * 34 + 17;
    ctx.fillStyle = MCOL[r.key]; ctx.globalAlpha = 0.85; ctx.fillRect(x0, yc - 9, Math.max(2, bx(r.V) - x0), 18); ctx.globalAlpha = 1;
    ctx.fillStyle = C.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(name(r.key), 8, yc + 4);
    ctx.textAlign = 'right'; ctx.fillText(fmt(r.V, 1), W - 8, yc + 4);
  });
  ctx.restore();
  const list = rows.map(r => t('s0item', { name: name(r.key), V: fmt(r.V, 1) })).join(t('sep'));
  $('r0').textContent = t('s0readout', { m, list, ratio: fmt(rows[0].V / rows[3].V, 1) });
}

/* ---------- step 1: cut pieces ---------- */
const s1 = { mat: null, cut: { al: 0, iron: 0, pine: 0 }, last: null };
function buildMats1() {
  M.CUT.forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.mat = k; b.dataset.step = '1';
    b.addEventListener('click', () => { s1.mat = k; s1.last = s1.cut[k] ? M.piece(k, s1.cut[k] - 1) : null; draw1(); }); $('mats1').appendChild(b);
  });
}
function draw1() {
  $('mats1').querySelectorAll('button').forEach(b => { b.textContent = name(b.dataset.mat); b.setAttribute('aria-pressed', String(b.dataset.mat === s1.mat)); });
  $('cut1').disabled = !s1.mat || s1.cut[s1.mat] >= M.PIECES.length;
  $('lg1').innerHTML = M.CUT.map(k => `<span class="lg"><span class="sw" style="background:${MCOL[k]}"></span><span>${name(k)}</span></span>`).join('') + `<span class="lg"><span class="sw sw-ghost"></span><span>${t('s1lgLine')}</span></span>`;
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1piece'), 8, 19, W - 16);
  if (s1.last) { const [a, b, c] = s1.last.dims, s = 16; box(ctx, W / 2 - a * s / 2 - c * s * 0.22, 150, a * s, b * s, c * s, MCOL[s1.last.key]); }
  const A = panel(ctx, W, { top: 196, bottom: H - 26, xMin: 0, xMax: 130, yMin: 0, yMax: 1000, yTicks: [0, 250, 500, 750, 1000], xTicks: [0, 20, 40, 60, 80, 100, 120], left: 46, title: t('c1plot') });
  M.CUT.forEach(k => {
    const pts = []; for (let i = 0; i < s1.cut[k]; i++) pts.push(M.piece(k, i));
    if (!pts.length) return;
    const sl = M.slope(pts), xEnd = Math.min(130, 1000 / sl);
    path(ctx, [[A.x(0), A.y(0)], [A.x(xEnd), A.y(sl * xEnd)]], MCOL[k], 1.4, [6, 5]);
    pts.forEach(p => dot(ctx, A.x(p.V), A.y(p.m), MCOL[k], 4.5));
  });
  if (s1.last) dot(ctx, A.x(s1.last.V), A.y(s1.last.m), C.text, 8, true), dot(ctx, A.x(s1.last.V), A.y(s1.last.m), MCOL[s1.last.key], 4.5);
  if (!s1.mat) { $('r1').textContent = t('s1none'); return; }
  if (!s1.last) { $('r1').textContent = t('s1none'); return; }
  const k = s1.mat, pts = []; for (let i = 0; i < s1.cut[k]; i++) pts.push(M.piece(k, i));
  const p = s1.last;
  let txt = t('s1readout', { name: name(k), n: p.i + 1, a: p.dims[0], b: p.dims[1], c: p.dims[2], V: p.V, m: fmt(p.m, 1), r: fmt(p.ratio, 2), k: pts.length, s: fmt(M.slope(pts), 2) });
  if (s1.cut[k] >= M.PIECES.length) txt += ' ' + t('s1all');
  $('r1').textContent = txt.charAt(0).toUpperCase() + txt.slice(1);
}

/* ---------- step 2: a roomful of air ---------- */
function person(ctx, x, y, h, frac, color) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x - h * 0.3, y - h, h * 0.6 * frac, h + 1); ctx.clip();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y - h * 0.82, h * 0.16, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - h * 0.28, y); ctx.lineTo(x - h * 0.2, y - h * 0.58); ctx.quadraticCurveTo(x, y - h * 0.7, x + h * 0.2, y - h * 0.58); ctx.lineTo(x + h * 0.28, y); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y - h * 0.82, h * 0.16, 0, 7); ctx.stroke(); ctx.restore();
}
function draw2() {
  const L = num('L2'), Wd = num('W2'), Hh = num('H2'), q = M.room(L, Wd, Hh);
  $('L2v').textContent = String(L); $('W2v').textContent = String(Wd); $('H2v').textContent = Hh.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2room'), 8, 19, W - 16);
  const cell = Math.min((W - 40) / 12, 160 / 10), gx = (W - L * cell) / 2, gy = 34;
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(gx, gy, L * cell, Wd * cell);
  ctx.strokeStyle = 'rgba(103,215,249,0.35)'; ctx.lineWidth = 1;
  for (let i = 0; i <= L; i++) { ctx.beginPath(); ctx.moveTo(gx + i * cell, gy); ctx.lineTo(gx + i * cell, gy + Wd * cell); ctx.stroke(); }
  for (let j = 0; j <= Wd; j++) { ctx.beginPath(); ctx.moveTo(gx, gy + j * cell); ctx.lineTo(gx + L * cell, gy + j * cell); ctx.stroke(); }
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.strokeRect(gx, gy, L * cell, Wd * cell); ctx.restore();
  title(ctx, t('c2people'), 8, 232, W - 16);
  const n = q.students, ph = Math.min(64, (W - 24) / 12 / 0.62), step = ph * 0.62, row = Math.max(1, Math.floor((W - 16) / step));
  for (let i = 0; i < Math.ceil(n); i++) {
    const r = Math.floor(i / row), c = i % row;
    person(ctx, 8 + step / 2 + c * step, 248 + ph + r * (ph + 8), ph, Math.min(1, n - i), C.orange);
  }
  $('r2').textContent = t('s2readout', { L, W: Wd, H: Hh.toFixed(1), V: fmt(q.V, 0), m: fmt(q.m, 1), p: fmt(q.students, 1), g: q.gcm3.toFixed(4) });
}

/* ---------- step 3: displacement ---------- */
const s3 = { id: 'A', inside: false, level: M.START };
function buildObjs3() {
  Object.keys(M.OBJECTS).forEach(id => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.obj = id; b.dataset.step = '3';
    b.addEventListener('click', () => { stopAnim('s3'); s3.id = id; s3.inside = false; s3.level = M.START; draw3(); }); $('objs3').appendChild(b);
  });
}
function draw3() {
  const o = M.OBJECTS[s3.id], q = M.measure(s3.id);
  $('objs3').querySelectorAll('button').forEach(b => { b.textContent = t('objLabel', { id: b.dataset.obj, m: fmt(M.OBJECTS[b.dataset.obj].m, 1) }); b.setAttribute('aria-pressed', String(b.dataset.obj === s3.id)); });
  $('drop3').textContent = t(s3.inside ? 'lift' : 'drop');
  $('lg3').innerHTML = `<span class="lg"><span class="sw sw-orange"></span><span>${t('s3lgRange')}</span></span><span class="lg"><span>${t('s3lgRef')}</span></span>` +
    M.REF.map(k => `<span class="lg"><span class="sw" style="background:${MCOL[k]}"></span><span>${name(k)} ${M.RHO[k]}</span></span>`).join('');
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3cyl'), 8, 19, W - 16);
  const v0 = 40, v1 = 80, top = 40, bot = 250, yv = v => bot - (v - v0) / (v1 - v0) * (bot - top), cx = W / 2, cwid = 70;
  cylinder(ctx, cx - cwid / 2, cx + cwid / 2, top - 6, bot + 10, yv(s3.level));
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right';
  for (let v = v0; v <= v1; v++) { const Y = yv(v), big = v % 10 === 0, mid = v % 5 === 0; ctx.lineWidth = big ? 1.4 : 0.8; ctx.beginPath(); ctx.moveTo(cx - cwid / 2, Y); ctx.lineTo(cx - cwid / 2 + (big ? 16 : mid ? 11 : 6), Y); ctx.stroke(); if (big) ctx.fillText(String(v), cx - cwid / 2 - 6, Y + 4); }
  ctx.restore();
  // the metal piece: inside the water at the bottom, or hanging above the cylinder
  const side = Math.cbrt(o.V) * 9, py = s3.inside ? bot + 8 - side : top - 18 - side * 0.2;
  if (!s3.inside) { ctx.save(); ctx.strokeStyle = C.ghost; ctx.beginPath(); ctx.moveTo(cx + 2, 0); ctx.lineTo(cx + 2, py); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.fillStyle = MCOL[o.key]; ctx.beginPath(); ctx.moveTo(cx - side / 2, py + side * 0.2); ctx.lineTo(cx - side * 0.2, py); ctx.lineTo(cx + side / 2, py + side * 0.1); ctx.lineTo(cx + side * 0.4, py + side); ctx.lineTo(cx - side * 0.45, py + side * 0.9); ctx.closePath(); ctx.fill(); ctx.restore();
  // density number line
  const A = { l: 30, r: W - 20, y: H - 44 }, X = v => A.l + v / 14 * (A.r - A.l);
  title(ctx, t('c3axis'), 8, A.y - 66, W - 16);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(A.l, A.y); ctx.lineTo(A.r, A.y); ctx.stroke();
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  for (let v = 0; v <= 14; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), A.y); ctx.lineTo(X(v), A.y + 4); ctx.stroke(); ctx.fillText(String(v), X(v), A.y + 17); }
  M.REF.forEach(k => { ctx.strokeStyle = MCOL[k]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(M.RHO[k]), A.y - 30); ctx.lineTo(X(M.RHO[k]), A.y); ctx.stroke(); });
  ctx.restore();
  const done = s3.inside && Math.abs(s3.level - q.after) < 1e-9;
  if (done) {
    ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.35)'; ctx.fillRect(X(q.lo), A.y - 24, X(q.hi) - X(q.lo), 18); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(X(q.lo), A.y - 24, X(q.hi) - X(q.lo), 18); ctx.restore();
    dot(ctx, X(q.rho), A.y - 15, C.text, 4.5);
    const names = q.fits.map(name).join(t('and'));
    $('r3').textContent = t('s3readout', { id: s3.id, m: fmt(q.m, 1), b: q.before, a: q.after, V: q.dV, r: fmt(q.rho, 2), lo: fmt(q.lo, 2), hi: fmt(q.hi, 2), fit: t(q.fits.length === 1 ? 's3one' : 's3many', { names }) });
  } else $('r3').textContent = t('s3wait', { id: s3.id, m: fmt(q.m, 1) });
}

/* ---------- step 4: the crown ---------- */
const s4 = { seen: new Set([30]) };
function draw4() {
  const p = num('f4'), q = M.crown(p / 100);
  s4.seen.add(p);
  $('f4v').textContent = p + '%';
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4cyl'), 8, 19, W - 16);
  const v0 = 0, v1 = 180, top = 40, bot = 190, yv = v => bot - (v - v0) / (v1 - v0) * (bot - top), cw = 64;
  const xs = [W * 0.3, W * 0.7], vols = [q.pureV, q.V];
  xs.forEach((cx, i) => {
    cylinder(ctx, cx - cw / 2, cx + cw / 2, top, bot, yv(100 + vols[i]));
    ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx - cw / 2, yv(100)); ctx.lineTo(cx + cw / 2, yv(100)); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = MCOL.gold; ctx.globalAlpha = 0.9; const sz = Math.cbrt(vols[i]) * 6.5; ctx.fillRect(cx - sz / 2, bot - sz - 2, sz, sz); ctx.restore();
    label(ctx, t(i ? 'cylCrown' : 'cylGold'), cx, bot + 18, W * 0.38);
  });
  // a bracket showing the extra volume on the crown cylinder
  if (q.extra > 0.5) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; const X = xs[1] + cw / 2 + 8; ctx.beginPath(); ctx.moveTo(X - 4, yv(100 + q.pureV)); ctx.lineTo(X, yv(100 + q.pureV)); ctx.lineTo(X, yv(100 + q.V)); ctx.lineTo(X - 4, yv(100 + q.V)); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(xs[0] + cw / 2, yv(100 + q.pureV)); ctx.lineTo(xs[1] + cw / 2, yv(100 + q.pureV)); ctx.stroke(); ctx.restore();
  const A = panel(ctx, W, { top: 248, bottom: H - 26, xMin: 0, xMax: 50, yMin: 12, yMax: 20, yTicks: [12, 14, 16, 18, 20], xTicks: [0, 10, 20, 30, 40, 50], title: t('c4plot') });
  const c1 = [], c2 = []; for (let i = 0; i <= 100; i++) { const f = 0.5 * i / 100, r = M.crown(f); c1.push([A.x(f * 100), A.y(r.rho)]); c2.push([A.x(f * 100), A.y(r.naive)]); }
  path(ctx, c2, C.orange, 1.6, [6, 5]); path(ctx, c1, C.cyan, 2.4);
  [...s4.seen].forEach(v => dot(ctx, A.x(v), A.y(M.crown(v / 100).rho), C.text, 3.2));
  dot(ctx, A.x(p), A.y(q.rho), C.cyan, 6.5, true);
  $('r4').textContent = t('s4readout', { p, mg: fmt(1000 * (1 - p / 100), 0), ms: fmt(10 * p, 0), V: fmt(q.V, 1), x: fmt(q.extra, 1), r: fmt(q.rho, 2), n: fmt(q.naive, 2) });
}

/* ---------- step 5: density tower ---------- */
const s5 = { seen: new Set(), y: null };
function draw5() {
  const r = num('r5'), q = M.settle(r);
  s5.seen.add(r.toFixed(2));
  if (s5.y === null) s5.y = q.bottom;
  $('r5v').textContent = r.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5tower'), 8, 19, W - 16);
  const s = 11, gw = Math.min(W - 32, 280), gx = (W - gw) / 2, floor = 40 + (M.TOWER + 2) * s, yc = h => floor - h * s;
  M.LAYERS.forEach((L, i) => {
    const yTop = yc(M.TOWER - i * M.LAYER_H), yBot = yc(M.TOWER - (i + 1) * M.LAYER_H);
    ctx.fillStyle = LCOL[L.key]; ctx.fillRect(gx, yTop, gw, yBot - yTop);
    ctx.save(); ctx.fillStyle = C.text; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left';
    const txt = t('l' + LKEY[L.key]); let size = 12; while (ctx.measureText(txt).width > gw * 0.62 && size > 9) { size -= 0.5; ctx.font = size + 'px system-ui,sans-serif'; }
    ctx.fillText(txt, gx + 8, (yTop + yBot) / 2 + 4, gw * 0.62); ctx.restore();
  });
  ctx.save(); ctx.strokeStyle = C.wall; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(gx, yc(M.TOWER + 2)); ctx.lineTo(gx, floor); ctx.lineTo(gx + gw, floor); ctx.lineTo(gx + gw, yc(M.TOWER + 2)); ctx.stroke(); ctx.restore();
  const cs = M.CUBE * s, cxp = gx + gw * 0.82;
  ctx.save(); ctx.fillStyle = '#f0f3f7'; ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 1.5; ctx.fillRect(cxp - cs / 2, yc(s5.y) - cs, cs, cs); ctx.strokeRect(cxp - cs / 2, yc(s5.y) - cs, cs, cs); ctx.restore();
  const A = panel(ctx, W, { top: floor + 44, bottom: H - 26, xMin: 0.5, xMax: 1.6, yMin: 0, yMax: 16, yTicks: [0, 4, 8, 12, 16], xTicks: [0.5, 0.7, 0.9, 1.1, 1.3, 1.5], xFmt: v => v.toFixed(1), title: t('c5plot') });
  [...s5.seen].forEach(k => { const v = Number(k); dot(ctx, A.x(v), A.y(M.settle(v).bottom), C.text, 2.6); });
  dot(ctx, A.x(r), A.y(q.bottom), C.cyan, 6, true);
  const nm = k => t('n' + LKEY[k]);
  const pct = fmt(q.frac * 100, 0);
  $('r5o').textContent = q.where === 'floor' ? t('s5floor', { r: r.toFixed(2) }) : q.where === 'surface' ? t('s5surface', { r: r.toFixed(2), pct }) : t('s5iface', { r: r.toFixed(2), up: nm(q.above), low: nm(q.below), pct });
}
function settle5() {
  const to = M.settle(num('r5')).bottom, from = s5.y === null ? to : s5.y;
  animate('s5', 700, p => { const e = 1 - Math.pow(1 - p, 3); s5.y = from + (to - from) * e; draw5(); });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildMats1(); buildObjs3();
  $('m0').addEventListener('input', draw0);
  $('cut1').addEventListener('click', () => { const k = s1.mat; if (!k || s1.cut[k] >= M.PIECES.length) return; s1.last = M.piece(k, s1.cut[k]); s1.cut[k]++; draw1(); });
  $('clear1').addEventListener('click', () => { s1.cut = { al: 0, iron: 0, pine: 0 }; s1.last = null; draw1(); });
  ['L2', 'W2', 'H2'].forEach(id => $(id).addEventListener('input', draw2));
  $('drop3').addEventListener('click', () => {
    const q = M.measure(s3.id), from = s3.level;
    s3.inside = !s3.inside;
    const to = s3.inside ? q.after : q.before;
    animate('s3', 900, p => { s3.level = from + (to - from) * p; if (p === 1) s3.level = to; draw3(); });
  });
  $('f4').addEventListener('input', draw4);
  $('r5').addEventListener('input', settle5);
  $('clear5').addEventListener('click', () => { s5.seen.clear(); draw5(); });
  s1.mat = 'al';

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
