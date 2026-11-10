'use strict';
// Magnets lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every needle, filing, line, arrow and readout comes from window.MAGNET_MODEL (model.js). Canvas text is limited
// to a few titles in fixed rows, axis ticks and the N/S letters inside magnets; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MAGNET_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', red: '#ff6b6b', blue: '#5aa9ff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', card: '#1a2431', filing: '#c9d2dc', line: '#8fd3ef', hidden: '#3a4656' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };

// CSS size and backing store kept apart. Height follows the width through `ratio`, clamped to [minH, maxH].
function fitCanvas(canvas, ratio, minH, maxH) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const W = Math.max(240, canvas.clientWidth || 600);
  const H = Math.round(Math.max(minH, Math.min(maxH, W * ratio)));
  if (canvas.style.height !== H + 'px') canvas.style.height = H + 'px';
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  return { ctx, W, H };
}
// Text that shrinks until it fits maxW (never overflows, never squeezes glyphs).
function label(ctx, text, x, y, maxW, { size = 12, color = C.text, align = 'left', weight = 600 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  ctx.fillText(text, x, y); ctx.restore();
}
// World (cm, +y up) → canvas px. The world box is the smallest one that still shows `minW` × `minH` cm.
function makeView(W, H, minW, minH, cx = 0, cy = 0, pad = 8) {
  const s = Math.min((W - 2 * pad) / minW, (H - 2 * pad) / minH);
  const X = x => W / 2 + (x - cx) * s, Y = y => H / 2 - (y - cy) * s;
  const box = { x0: cx - W / 2 / s, x1: cx + W / 2 / s, y0: cy - H / 2 / s, y1: cy + H / 2 / s };
  return { s, X, Y, box, ix: px => cx + (px - W / 2) / s, iy: py => cy - (py - H / 2) / s };
}

function drawMagnet(ctx, V, m, { hidden = false, alpha = 1, letters = true } = {}) {
  const L = (m.len || M.MAG.len) * V.s, T = 2 * (m.half || M.MAG.half) * V.s;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(V.X(m.x), V.Y(m.y)); ctx.rotate(-(m.ang || 0));
  if (hidden) { ctx.fillStyle = C.hidden; ctx.fillRect(-L / 2, -T / 2, L, T); }
  else {
    ctx.fillStyle = C.red; ctx.fillRect(0, -T / 2, L / 2, T);
    ctx.fillStyle = C.blue; ctx.fillRect(-L / 2, -T / 2, L / 2, T);
  }
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.strokeRect(-L / 2, -T / 2, L, T);
  ctx.restore();
  if (hidden || !letters) return;
  // Letters are drawn unrotated at the centre of each half, only if they fit inside it.
  const size = Math.min(15, T * 0.62), c = Math.cos(m.ang || 0), sn = Math.sin(m.ang || 0), q = (m.len || M.MAG.len) / 4;
  ctx.save(); ctx.font = `700 ${size}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0a0e14'; ctx.globalAlpha = alpha;
  const fits = ctx.measureText('N').width + 4 <= L / 2 && size >= 8;
  if (fits) {
    ctx.fillText('N', V.X(m.x + q * c), V.Y(m.y + q * sn));
    ctx.fillText('S', V.X(m.x - q * c), V.Y(m.y - q * sn));
  }
  ctx.restore();
}
function drawLines(ctx, V, lines, color = C.line, alpha = 0.85) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.4;
  for (const l of lines) {
    if (l.pts.length < 3) continue;
    ctx.beginPath(); l.pts.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.stroke();
    // arrowhead at the visible middle of the line, pointing along the field
    const vis = l.pts.filter(([x, y]) => x > V.box.x0 && x < V.box.x1 && y > V.box.y0 && y < V.box.y1);
    if (vis.length < 6) continue;
    const i = Math.floor(vis.length / 2), [x0, y0] = vis[i - 1], [x1, y1] = vis[i + 1];
    const a = Math.atan2(V.Y(y1) - V.Y(y0), V.X(x1) - V.X(x0)), px = V.X(vis[i][0]), py = V.Y(vis[i][1]);
    ctx.beginPath(); ctx.moveTo(px + 6 * Math.cos(a), py + 6 * Math.sin(a));
    ctx.lineTo(px + 6 * Math.cos(a + 2.5), py + 6 * Math.sin(a + 2.5)); ctx.lineTo(px + 6 * Math.cos(a - 2.5), py + 6 * Math.sin(a - 2.5)); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// A compass at canvas (px, py); `ang` is the field direction in world coordinates (+y up).
function drawCompass(ctx, px, py, ang, r = 15, { alpha = 1, ring = true } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(px, py);
  if (ring) { ctx.fillStyle = 'rgba(232,237,244,.12)'; ctx.strokeStyle = 'rgba(232,237,244,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.rotate(-ang);
  const n = r * 0.85, w = r * 0.26;
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(n, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dfe6ee'; ctx.beginPath(); ctx.moveTo(-n, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function arrow(ctx, x0, y, len, color = C.green, w = 4) {
  if (Math.abs(len) < 1) return;
  const d = Math.sign(len), x1 = x0 + len, head = Math.min(10, Math.abs(len));
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 - d * head * 0.6, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 - d * head, y - head * 0.65); ctx.lineTo(x1 - d * head, y + head * 0.65); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Plot frame: ticks on the left and below; returns mappers.
function frame(ctx, P, o) {
  const x = v => P.l + (v - o.x0) / (o.x1 - o.x0) * (P.r - P.l), y = v => P.b - (v - o.y0) / (o.y1 - o.y0) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  ctx.textAlign = 'center';
  for (const v of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(String(v), x(v), P.b + 16); }
  ctx.restore();
  return { x, y };
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frameFn(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }
const ease = p => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

/* ---------- step 0: what sticks ---------- */
const ICON = { nail: '#aab4c0', clip: '#c6ced8', nickel: '#d9dde2', foil: '#e6e9ee', copper: '#e08a4f', gold: '#f2c14e', ruler: '#5aa9ff', wood: '#b88457', glass: '#9fe3f0' };
function drawItem(ctx, id, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = ICON[id]; ctx.strokeStyle = ICON[id]; ctx.lineWidth = 2;
  switch (id) {
    case 'nail': ctx.fillRect(-r, -2, 2 * r * 0.9, 4); ctx.fillRect(-r - 1, -5, 3, 10); break;
    case 'clip': ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(r * 0.6, -r * 0.35); ctx.lineTo(-r * 0.7, -r * 0.35); ctx.arc(-r * 0.7, 0, r * 0.35, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(r * 0.8, r * 0.35); ctx.arc(r * 0.8, 0, r * 0.35, Math.PI / 2, -Math.PI / 2, true); ctx.stroke(); break;
    case 'nickel': ctx.fillRect(-r * 0.9, -r * 0.35, r * 1.8, r * 0.7); break;
    case 'foil': ctx.beginPath(); ctx.moveTo(-r, -r * 0.5); ctx.lineTo(-r * 0.3, -r * 0.7); ctx.lineTo(r * 0.4, -r * 0.45); ctx.lineTo(r, -r * 0.6); ctx.lineTo(r * 0.8, r * 0.55); ctx.lineTo(0, r * 0.7); ctx.lineTo(-r * 0.9, r * 0.5); ctx.closePath(); ctx.fill(); break;
    case 'copper': ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 6, xx = -r + i / 40 * 2 * r; ctx.lineTo(xx, Math.sin(a) * r * 0.45); } ctx.stroke(); break;
    case 'gold': ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, 7); ctx.stroke(); break;
    case 'ruler': ctx.fillRect(-r, -r * 0.3, 2 * r, r * 0.6); ctx.fillStyle = '#0d1621'; for (let i = 1; i < 6; i++) ctx.fillRect(-r + i * r / 3, -r * 0.3, 1, r * 0.25); break;
    case 'wood': ctx.fillRect(-r * 0.8, -r * 0.55, r * 1.6, r * 1.1); break;
    case 'glass': ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.14, 0, 7); ctx.fill(); break;
  }
  ctx.restore();
}
const s0 = { tested: [], moving: null, p: 0, queue: [] };
function layout0(W, H) {
  const magW = Math.min(W * 0.4, 210), magH = 24, mx = W * 0.3, my = 64, split = W * 0.6;
  const slotW = (W - 16) / M.ITEMS.length, trayY = H - 28, r = Math.min(17, slotW * 0.38);
  const tray = id => ({ x: 8 + slotW * (M.ITEMS.findIndex(it => it.id === id) + 0.5), y: trayY });
  // stuck objects hang below the two ends of the magnet, alternating ends
  const stuckPos = k => ({ x: mx + (k % 2 ? 1 : -1) * (magW / 2 - r - 2), y: my + magH / 2 + r + 4 + Math.floor(k / 2) * (2 * r + 6) });
  const binX0 = split + 8, binX1 = W - 8, binY0 = 46, binY1 = H - 60, cols = Math.max(1, Math.floor((binX1 - binX0) / (2 * r + 8)));
  const binPos = k => ({ x: binX0 + (2 * r + 8) * (k % cols + 0.5), y: binY1 - r - 6 - Math.floor(k / cols) * (2 * r + 6) });
  return { magW, magH, mx, my, split, r, tray, stuckPos, binX0, binX1, binY0, binY1, binPos, near: { x: mx, y: my + magH / 2 + r + 30 } };
}
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'), 0.5, 290, 360), Lo = layout0(W, H);
  label(ctx, t('c0yes'), 8, 20, Lo.split - 16);
  label(ctx, t('c0no'), Lo.split + 8, 20, W - Lo.split - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(Lo.split, 30); ctx.lineTo(Lo.split, H - 52); ctx.stroke(); ctx.restore();
  // the box for objects that were not held
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Lo.binX0, Lo.binY0); ctx.lineTo(Lo.binX0, Lo.binY1); ctx.lineTo(Lo.binX1, Lo.binY1); ctx.lineTo(Lo.binX1, Lo.binY0); ctx.stroke(); ctx.restore();
  // magnet
  const mag = { x: 0, y: 0, ang: 0, len: M.MAG.len, half: M.MAG.half }, V = { s: Lo.magW / M.MAG.len, X: x => Lo.mx + x * Lo.magW / M.MAG.len, Y: y => Lo.my - y * Lo.magW / M.MAG.len };
  drawMagnet(ctx, V, { ...mag, half: Lo.magH / 2 / V.s });
  // table / tray line
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(8, H - 8); ctx.lineTo(W - 8, H - 8); ctx.stroke(); ctx.restore();
  let ks = 0, kn = 0;
  for (const id of s0.tested) {
    const it = M.ITEMS.find(q => q.id === id);
    if (s0.moving === id) continue;
    const p = it.magnetic ? Lo.stuckPos(ks++) : Lo.binPos(kn++);
    drawItem(ctx, id, p.x, p.y, Lo.r);
  }
  for (const it of M.ITEMS) if (!s0.tested.includes(it.id) && s0.moving !== it.id) { const p = Lo.tray(it.id); drawItem(ctx, it.id, p.x, p.y, Lo.r); }
  if (s0.moving) {
    const it = M.ITEMS.find(q => q.id === s0.moving), a = Lo.tray(it.id), p = s0.p;
    const ks2 = s0.tested.filter(id => id !== it.id && M.ITEMS.find(q => q.id === id).magnetic).length;
    const kn2 = s0.tested.filter(id => id !== it.id && !M.ITEMS.find(q => q.id === id).magnetic).length;
    let x, y;
    if (it.magnetic) { const b = Lo.stuckPos(ks2), e = ease(p); x = a.x + (b.x - a.x) * e; y = a.y + (b.y - a.y) * e; }
    else if (p < 0.5) { const e = ease(p / 0.5); x = a.x + (Lo.near.x - a.x) * e; y = a.y + (Lo.near.y - a.y) * e; }
    else { const b = Lo.binPos(kn2), e = ease((p - 0.5) / 0.5); x = Lo.near.x + (b.x - Lo.near.x) * e; y = Lo.near.y + (b.y - Lo.near.y) * e; }
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, Lo.r + 4, 0, 7); ctx.stroke(); ctx.restore();
    drawItem(ctx, it.id, x, y, Lo.r);
  }
  const st = M.itemStats(s0.tested.filter(id => id !== s0.moving));
  const verdict = st.metals === 0 ? t('s0verdictNone') : st.metalsNotStuck > 0 ? t('s0verdictSome') : t('s0verdictAll');
  $('r0').textContent = t('s0readout', { n: st.tested, N: st.total, s: st.stuck, m: st.metals, mn: st.metalsNotStuck }) + ' ' + verdict;
  document.querySelectorAll('#items0 button').forEach(b => {
    const id = b.dataset.item, done = s0.tested.includes(id) && s0.moving !== id, it = M.ITEMS.find(q => q.id === id);
    b.textContent = t('item_' + id) + (done ? (it.magnetic ? ' ✓' : ' ✗') : '');
    b.classList.toggle('yes', done && it.magnetic); b.classList.toggle('no', done && !it.magnetic);
    b.disabled = done || !!s0.moving;
  });
  $('tryAll').disabled = !!s0.moving || s0.tested.length === M.ITEMS.length;
}
function test0(id, then) {
  if (s0.tested.includes(id)) { if (then) then(); return; }
  s0.tested.push(id); s0.moving = id; s0.p = 0;
  animate('s0', 1100, p => { s0.p = p; draw0(); }, () => { s0.moving = null; draw0(); if (then) then(); });
}
function tryAll0() {
  const next = M.ITEMS.find(it => !s0.tested.includes(it.id));
  if (next) test0(next.id, tryAll0);
}

/* ---------- step 1: where is the pull strongest ---------- */
const s1 = { visited: new Set() };
const X1 = x => Math.round(x / M.PULL_X.step) * M.PULL_X.step;
function draw1() {
  const x = num('p1'); $('p1v').textContent = fmt(x, 2);
  const { ctx, W, H } = fitCanvas($('c1'), 0.62, 400, 430);
  const P = { l: 40, r: W - 14, t: 236, b: H - 26 };
  const sx = (P.r - P.l) / 7.4, cx = (P.l + P.r) / 2, X = v => cx + v * sx;
  const magH = Math.min(34, 1.4 * sx), my = 12 + magH / 2;
  drawMagnet(ctx, { s: sx, X, Y: y => my - y * sx }, { x: 0, y: 0, ang: 0, len: M.MAG.len, half: magH / 2 / sx });
  // chain of clips hanging 0.5 cm below
  const c = M.clips(x), top = my + magH / 2 + Math.max(4, 0.5 * sx * 0.5);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(x), top); ctx.lineTo(X(x), P.t - 30); ctx.stroke(); ctx.restore();
  // the longest chain (8 clips) must end above the chart title row, so the link spacing follows the free height
  const sp = Math.min(22, (P.t - 30 - top - 6 - 20) / 7), ry = Math.min(10, sp * 0.5 + 1);
  for (let i = 0; i < c; i++) {
    const y = top + 6 + i * sp; ctx.save(); ctx.strokeStyle = '#d4dbe4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(X(x), y + ry, ry / 2, ry, 0, 0, 7); ctx.stroke(); ctx.restore();
  }
  label(ctx, t('c1plot'), 8, P.t - 10, W - 16);
  const F = frame(ctx, P, { x0: -3.7, x1: 3.7, y0: 0, y1: 100, yTicks: [0, 50, 100], xTicks: [-3, -2, -1, 0, 1, 2, 3] });
  // dots for visited spots, joined where neighbours are both visited
  const vis = [...s1.visited].sort((a, b) => a - b);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6;
  for (let i = 1; i < vis.length; i++) if (Math.abs(vis[i] - vis[i - 1] - M.PULL_X.step) < 1e-9) { ctx.beginPath(); ctx.moveTo(F.x(vis[i - 1]), F.y(M.pullPct(vis[i - 1]))); ctx.lineTo(F.x(vis[i]), F.y(M.pullPct(vis[i]))); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.fillStyle = C.cyan; vis.forEach(v => { ctx.beginPath(); ctx.arc(F.x(v), F.y(M.pullPct(v)), 3.2, 0, 7); ctx.fill(); }); ctx.restore();
  ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(F.x(x), F.y(M.pullPct(x)), 5.5, 0, 7); ctx.fill(); ctx.restore();
  const mid = M.pullPct(0);
  $('r1').textContent = t('s1readout', { x: fmt(x, 2), p: Math.round(M.pullPct(x)), c, mid: mid.toFixed(1) });
}

/* ---------- step 2: two magnets ---------- */
const s2 = { facing: 'S', gap: null, trail: [], result: null };
function draw2() {
  const g0 = num('g2'), facing = s2.facing, g = s2.gap === null ? g0 : s2.gap;
  $('g2v').textContent = fmt(g0, 1);
  const { ctx, W, H } = fitCanvas($('c2'), 0.62, 380, 420);
  // track: the fixed magnet's N face sits at x = 0 cm; the view runs from −6.4 to the end stop + 6.4 cm
  const x0 = -6.4, x1 = M.GAP_STOP + 6.4, sx = (W - 16) / (x1 - x0), X = v => 8 + (v - x0) * sx, ty = 54;
  const V = { s: sx, X, Y: y => ty - y * sx };
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(x0), ty + M.MAG.half * sx + 3); ctx.lineTo(X(x1), ty + M.MAG.half * sx + 3); ctx.stroke();
  ctx.fillStyle = C.axis; ctx.fillRect(X(x1) - 3, ty - M.MAG.half * sx - 4, 3, 2 * M.MAG.half * sx + 7); ctx.restore();
  const right = gg => ({ x: gg + 3, y: 0, ang: facing === 'N' ? Math.PI : 0, len: M.MAG.len });
  s2.trail.forEach(gg => drawMagnet(ctx, V, right(gg), { alpha: 0.18, letters: false }));
  drawMagnet(ctx, V, { x: -3, y: 0, ang: 0, len: M.MAG.len });
  drawMagnet(ctx, V, right(g));
  // arrow length grows with the square root of the force so small forces stay visible
  const f = M.forcePct(g, facing), len = (10 + 7 * Math.sqrt(Math.abs(f))) * Math.max(0.55, Math.min(1.4, sx / 20)) * Math.sign(f);
  if (g > 0) { arrow(ctx, X(g + 3), ty + M.MAG.half * sx + 16, len); arrow(ctx, X(-3), ty + M.MAG.half * sx + 16, -len); }
  // chart of signed force against gap
  const P = { l: 46, r: W - 14, t: 150, b: H - 26 };
  label(ctx, t('c2plot'), 8, P.t - 14, W - 16);
  const F = frame(ctx, P, { x0: 0.5, x1: 8.5, y0: -100, y1: 100, yTicks: [-100, 0, 100], xTicks: [1, 2, 3, 4, 5, 6, 7, 8] });
  for (const fc of ['S', 'N']) {
    ctx.save(); ctx.strokeStyle = fc === facing ? C.cyan : C.axis; ctx.lineWidth = fc === facing ? 2 : 1.2; if (fc !== facing) ctx.setLineDash([4, 4]);
    ctx.beginPath(); for (let v = 1; v <= 8.0001; v += 0.05) { const yy = F.y(M.forcePct(v, fc)); v === 1 ? ctx.moveTo(F.x(v), yy) : ctx.lineTo(F.x(v), yy); } ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(F.x(1), F.y(M.FRICTION / M.F_REF * 100)); ctx.lineTo(F.x(8), F.y(M.FRICTION / M.F_REF * 100)); ctx.moveTo(F.x(1), F.y(-M.FRICTION / M.F_REF * 100)); ctx.lineTo(F.x(8), F.y(-M.FRICTION / M.F_REF * 100)); ctx.stroke(); ctx.restore();
  if (g0 >= 1 && g0 <= 8) { ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(F.x(g0), F.y(M.forcePct(g0, facing)), 5.5, 0, 7); ctx.fill(); ctx.restore(); }
  const fg = M.forcePct(g0, facing);
  const dbl = 2 * g0 <= M.GAP.max ? t('dbl2', { g2: fmt(2 * g0, 1), r: fmt(100 * M.pairForce(2 * g0, facing) / M.pairForce(g0, facing), 1) }) : '';
  let txt = t('s2readout', { pair: t(facing === 'N' ? 'pairNN' : 'pairNS'), kind: t(fg > 0 ? 'kindPush' : 'kindPull'), f: fmt(Math.abs(fg), 1), g: fmt(g0, 1), dbl });
  if (s2.result === 'run') txt += ' ' + t('relRunning');
  else if (s2.result) txt += ' ' + s2.result;
  $('r2').textContent = txt;
  $('faceS').setAttribute('aria-pressed', facing === 'S'); $('faceN').setAttribute('aria-pressed', facing === 'N');
}
function reset2() { stopAnim('s2'); s2.gap = null; s2.trail = []; s2.result = null; }
function release2() {
  reset2();
  const g0 = num('g2'), R = M.release(g0, s2.facing);
  const fr = fmt(100 * M.FRICTION / M.F_REF, 1), fNow = fmt(Math.abs(M.forcePct(g0, s2.facing)), 1);
  const msg = !R.moved ? t('relStay', { f: fNow, fr }) : R.snapped ? t('relSnap') : R.stopped ? t('relStop', { g: fmt(R.end, 1) }) : t('relPushed', { g: fmt(R.end, 1) });
  if (!R.moved) { s2.result = msg; draw2(); return; }
  const T = R.path[R.path.length - 1].t, ms = Math.max(600, Math.min(3500, T * 1000));
  s2.result = 'run'; let lastTrail = -1;
  animate('s2', ms, p => {
    const tt = p * T; let i = 0; while (i < R.path.length - 1 && R.path[i + 1].t <= tt) i++;
    s2.gap = R.path[i].g;
    const k = Math.floor(p * 8); if (k !== lastTrail) { lastTrail = k; s2.trail.push(s2.gap); }
    draw2();
  }, () => { s2.gap = R.end; s2.result = msg; draw2(); });
}

/* ---------- step 3: filings and field lines ---------- */
const s3 = { layout: 'single', count: 0, align: 0, lines: false, cache: {}, N: 0 };
function data3(V, W, H) {
  const key = s3.layout + '|' + W + '|' + H;
  if (!s3.cache[key]) {
    const mags = M.LAYOUTS[s3.layout](), n = Math.min(1400, Math.round(W * H / (W < 500 ? 140 : 230)));
    s3.cache = { [key]: { mags, fil: M.filings(mags, V.box, n, 11), lines: M.traceLines(mags, V.box) } };
  }
  return s3.cache[key];
}
function draw3() {
  const { ctx, W, H } = fitCanvas($('c3'), 0.56, 260, 480), V = makeView(W, H, W < 500 ? 16.5 : 21, 10.5), D = data3(V, W, H);
  ctx.fillStyle = C.card; ctx.fillRect(4, 4, W - 8, H - 8);
  const shown = D.fil.slice(0, s3.count), len = Math.max(4, Math.min(8, 0.35 * V.s));
  ctx.save(); ctx.strokeStyle = C.filing; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
  for (const f of shown) {
    let d = ((f.ang - f.start) % Math.PI + Math.PI * 1.5) % Math.PI - Math.PI / 2; // shortest turn (a filing has no head)
    const a = f.start + d * s3.align, dx = len / 2 * Math.cos(a), dy = len / 2 * Math.sin(a);
    ctx.globalAlpha = 0.45 + 0.5 * Math.min(1, Math.sqrt(f.b / 0.3));
    ctx.beginPath(); ctx.moveTo(V.X(f.x) - dx, V.Y(f.y) + dy); ctx.lineTo(V.X(f.x) + dx, V.Y(f.y) - dy); ctx.stroke();
  }
  ctx.restore();
  if (s3.lines) drawLines(ctx, V, D.lines);
  D.mags.forEach(m => drawMagnet(ctx, V, m));
  const N = D.fil.length; s3.N = N; if (s3.count > N) s3.count = N;
  let txt = s3.count ? t('s3progress', { k: s3.count, N, tap: t(s3.align >= 1 ? 'tapYes' : 'tapNo') }) : t('s3noFilings');
  const c = D.lines.filter(l => l.from === 0 && l.end === 'mag' && l.hit === 1).length;
  txt += ' ' + (s3.layout === 'single' ? t('note1') : s3.layout === 'unlike' ? t('note2', { c }) : t('note3'));
  $('r3').textContent = txt;
  ['lay1', 'lay2', 'lay3'].forEach((id, i) => $(id).setAttribute('aria-pressed', s3.layout === ['single', 'unlike', 'like'][i]));
  $('lines3').setAttribute('aria-pressed', s3.lines);
  $('tap3').disabled = !s3.count || s3.align >= 1 || !!anims.s3;
}

/* ---------- step 4: compass ---------- */
const s4 = { earth: false, ring: false, trail: [], cache: {} };
function lines4(V, W, H) {
  const key = s4.earth + '|' + W + '|' + H;
  if (!s4.cache[key]) s4.cache = { [key]: M.traceLines(M.ONE, V.box, M.SEEDS, M.earthField(s4.earth)) };
  return s4.cache[key];
}
function clampPos(x, y) {
  x = Math.max(-11, Math.min(11, x)); y = Math.max(-6.5, Math.min(6.5, y));
  if (M.inside(M.ONE[0], x, y, 0.9)) y = (y >= 0 ? 1 : -1) * (M.MAG.half + 0.95);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}
function view4(W, H) { return makeView(W, H, 23.5, 14.2); }
function draw4() {
  const [x, y] = clampPos(num('x4'), num('y4'));
  $('x4v').textContent = fmt(x, 1); $('y4v').textContent = fmt(y, 1);
  const { ctx, W, H } = fitCanvas($('c4'), 0.6, 300, 460), V = view4(W, H);
  drawLines(ctx, V, lines4(V, W, H), C.line, 0.35);
  drawMagnet(ctx, V, M.ONE[0]);
  label(ctx, t('north'), W - 10, 20, W * 0.3, { align: 'right', color: C.orange });
  const r = Math.max(10, Math.min(15, V.s * 0.75));
  s4.trail.forEach(([tx, ty]) => drawCompass(ctx, V.X(tx), V.Y(ty), M.compass(tx, ty, s4.earth).ang, r * 0.8, { alpha: 0.32, ring: false }));
  if (s4.ring) for (let i = 0; i < 16; i++) {
    const a = i / 16 * 2 * Math.PI, rx = 5.2 * Math.cos(a), ry = 2.9 * Math.sin(a);
    drawCompass(ctx, V.X(rx), V.Y(ry), M.compass(rx, ry, s4.earth).ang, r * 0.75, { alpha: 0.9 });
  }
  const cp = M.compass(x, y, s4.earth);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(V.X(x), V.Y(y), r + 4, 0, 7); ctx.stroke(); ctx.restore();
  drawCompass(ctx, V.X(x), V.Y(y), cp.ang, r);
  const deg = M.bearing(cp.ang), k = cp.ratio;
  const cmp = !s4.earth ? t('cmpOff') : t(k > 3 ? 'cmpMag' : k < 1 / 3 ? 'cmpEarth' : 'cmpBoth', { k: k >= 10 ? Math.round(k) : k.toFixed(k < 0.1 ? 3 : 2) });
  $('r4').textContent = t('s4readout', { dir: t('dir' + M.compass8(deg)), deg: Math.round(deg) % 360, cmp });
  $('earth4').setAttribute('aria-pressed', s4.earth); $('ring4').setAttribute('aria-pressed', s4.ring);
}
function move4(x, y) {
  const [cx, cy] = clampPos(x, y); $('x4').value = cx; $('y4').value = cy;
  const last = s4.trail[s4.trail.length - 1];
  if (!last || Math.hypot(last[0] - cx, last[1] - cy) >= 1.4) { s4.trail.push([cx, cy]); if (s4.trail.length > 60) s4.trail.shift(); }
  draw4();
}

/* ---------- step 5: break the magnet ---------- */
const s5 = { cache: {} };
function draw5() {
  const n = num('n5'), g = num('d5'); $('n5v').textContent = String(n); $('d5v').textContent = fmt(g, 1);
  const { ctx, W, H } = fitCanvas($('c5'), 0.45, 230, 380), V = makeView(W, H, 18, 8.5);
  const key = n + '|' + g + '|' + W + '|' + H;
  // pressed together the field outside is exactly the whole magnet's (checked below), so its lines are drawn
  if (!s5.cache[key]) { const ps = M.pieces(n, g); s5.cache = { [key]: { ps, lines: g === 0 ? M.traceLines(M.ONE, V.box) : M.traceLines(ps, V.box, M.FEW) } }; }
  const D = s5.cache[key];
  drawLines(ctx, V, D.lines, C.line, 0.7);
  D.ps.forEach(m => drawMagnet(ctx, V, m));
  const pc = M.poleCount(n);
  // compare the field outside with the unbroken magnet on a grid of points (exact cancellation when pressed together)
  let d = 0;
  if (g === 0) { const A = M.allPoles(D.ps), B = M.allPoles(M.ONE); for (let x = -8; x <= 8; x += 0.5) for (const y of [1.2, 2, 3.5]) { const a = M.field(A, x, y), b = M.field(B, x, y); d = Math.max(d, Math.hypot(a.bx - b.bx, a.by - b.by) / b.b); } }
  const note = n === 1 ? '' : g === 0 ? t('s5join', { d: (100 * d).toFixed(1) }) : t('s5apart', { g: fmt(g, 1) });
  $('r5').textContent = t('s5readout', { n, N: pc.N, S: pc.S, note }).trim();
}

/* ---------- step 6: hidden magnet ---------- */
const s6 = { k: 0, revealed: false, cache: {} };
function draw6() {
  const Q = M.quiz(s6.k);
  const { ctx, W, H } = fitCanvas($('c6'), 0.5, 250, 380), V = makeView(W, H, 13.5, 8.2);
  if (s6.revealed) {
    const key = s6.k + '|' + W + '|' + H;
    if (!s6.cache[key]) s6.cache = { [key]: M.traceLines([Q.mag], V.box) };
    drawLines(ctx, V, s6.cache[key], C.line, 0.45);
  }
  drawMagnet(ctx, V, Q.mag, { hidden: !s6.revealed });
  if (!s6.revealed) label(ctx, '?', V.X(0), V.Y(0) + 6, 30, { size: 18, align: 'center', color: C.text });
  const r = Math.max(12, Math.min(18, V.s * 0.9));
  Q.needles.forEach(nd => drawCompass(ctx, V.X(nd.x), V.Y(nd.y), nd.ang, r));
}
function check6() {
  const choice = document.querySelector('input[name="quiz6"]:checked'), fb = $('fb6');
  if (!choice) { fb.textContent = t('quizPick'); fb.dataset.state = 'none'; fb.style.color = C.orange; return; }
  const ok = (choice.value === 'R') === M.quiz(s6.k).nRight;
  s6.revealed = true; draw6();
  fb.textContent = t(ok ? 'quizRight' : 'quizWrong'); fb.dataset.state = ok ? 'correct' : 'wrong'; fb.style.color = ok ? C.green : C.orange;
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6();
  const fb = $('fb6'); if (fb.dataset.state === 'correct') fb.textContent = t('quizRight'); else if (fb.dataset.state === 'wrong') fb.textContent = t('quizWrong'); else if (fb.dataset.state === 'none') fb.textContent = t('quizPick');
}

function setup() {
  // step 0 buttons
  const box = $('items0');
  M.ITEMS.forEach(it => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn item'; b.dataset.item = it.id; b.dataset.step = '0'; b.addEventListener('click', () => { if (!s0.moving) test0(it.id); }); box.appendChild(b); });
  $('tryAll').addEventListener('click', () => { if (!s0.moving) tryAll0(); });
  $('reset0').addEventListener('click', () => { stopAnim('s0'); s0.tested = []; s0.moving = null; draw0(); });

  $('p1').addEventListener('input', () => { stopAnim('s1'); s1.visited.add(X1(num('p1'))); draw1(); });
  $('sweep1').addEventListener('click', () => {
    s1.visited.clear(); const steps = Math.round((M.PULL_X.max - M.PULL_X.min) / M.PULL_X.step);
    animate('s1', 4200, p => { const i = Math.min(steps, Math.floor(p * (steps + 1))); for (let j = 0; j <= i; j++) s1.visited.add(X1(M.PULL_X.min + j * M.PULL_X.step)); $('p1').value = M.PULL_X.min + i * M.PULL_X.step; draw1(); });
  });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.visited = new Set([X1(num('p1'))]); draw1(); });
  s1.visited.add(X1(num('p1')));

  $('g2').addEventListener('input', () => { reset2(); draw2(); });
  $('faceS').addEventListener('click', () => { reset2(); s2.facing = 'S'; draw2(); });
  $('faceN').addEventListener('click', () => { reset2(); s2.facing = 'N'; draw2(); });
  $('release2').addEventListener('click', release2);
  $('reset2').addEventListener('click', () => { reset2(); draw2(); });

  const setLayout = l => { stopAnim('s3'); s3.layout = l; s3.count = 0; s3.align = 0; draw3(); };
  $('lay1').addEventListener('click', () => setLayout('single'));
  $('lay2').addEventListener('click', () => setLayout('unlike'));
  $('lay3').addEventListener('click', () => setLayout('like'));
  $('sprinkle3').addEventListener('click', () => {
    s3.align = 0; s3.count = 0;
    animate('s3', 1600, p => { s3.count = Math.round(p * s3.N); draw3(); }, () => draw3());
  });
  $('tap3').addEventListener('click', () => { if (!s3.count) return; const a0 = s3.align; animate('s3', 1200, p => { s3.align = a0 + (1 - a0) * ease(p); draw3(); }, () => { s3.align = 1; draw3(); }); });
  $('lines3').addEventListener('click', () => { s3.lines = !s3.lines; draw3(); });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.count = 0; s3.align = 0; draw3(); });

  ['x4', 'y4'].forEach(id => $(id).addEventListener('input', () => move4(num('x4'), num('y4'))));
  $('earth4').addEventListener('click', () => { s4.earth = !s4.earth; draw4(); });
  $('ring4').addEventListener('click', () => { s4.ring = !s4.ring; draw4(); });
  $('clear4').addEventListener('click', () => { s4.trail = []; draw4(); });
  const c4 = $('c4'); let drag = false;
  const at = e => { const r = c4.getBoundingClientRect(), V = view4(r.width, r.height); return [V.ix(e.clientX - r.left), V.iy(e.clientY - r.top)]; };
  c4.addEventListener('pointerdown', e => { drag = true; try { c4.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } move4(...at(e)); });
  c4.addEventListener('pointermove', e => { if (drag) move4(...at(e)); });
  const up = () => { drag = false; }; c4.addEventListener('pointerup', up); c4.addEventListener('pointercancel', up);
  s4.trail.push(clampPos(num('x4'), num('y4')));

  ['n5', 'd5'].forEach(id => $(id).addEventListener('input', draw5));

  $('check6').addEventListener('click', check6);
  $('next6').addEventListener('click', () => { s6.k++; s6.revealed = false; document.querySelectorAll('input[name="quiz6"]').forEach(r => { r.checked = false; }); $('fb6').textContent = ''; $('fb6').dataset.state = ''; draw6(); });

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
