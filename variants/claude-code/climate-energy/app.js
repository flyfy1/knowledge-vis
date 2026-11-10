'use strict';
// Climate energy ledger lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every beam, bar, curve and readout comes from window.CLIMATE_MODEL (model.js). Canvas labels go through a small
// collision-aware placer (each label tries a few anchor offsets and is dropped rather than drawn on top of another).
(function () {

const $ = id => document.getElementById(id);
const M = window.CLIMATE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { sun: '#ffd76a', cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', red: '#ff6b6b', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', norm: '#3fb6dc', rev: '#22303f', ocean: '#2b5d86', cont: '#9c8a64', mantle: '#3a2418', water: '#123a5a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const FONT = 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
// fixed decimals; trailing zeros are trimmed only after a decimal point
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const minus = s => String(s).replace(/^-/, '−');

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
  return { ctx, W: width, H: height, L: labeler(ctx, width, height) };
}

// Collision-aware labels. put() tries each candidate offset [dx, dy, align]; keeps labels inside the canvas.
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    block(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
    put(text, x, y, o = {}) {
      let size = o.size || 11.5;
      ctx.save(); ctx.font = `${o.weight || 500} ${size}px ${FONT}`;
      if (o.maxW) while (ctx.measureText(text).width > o.maxW && size > 8) { size -= 0.5; ctx.font = `${o.weight || 500} ${size}px ${FONT}`; }
      const m = ctx.measureText(text), w = m.width, asc = m.actualBoundingBoxAscent || size * 0.8, desc = m.actualBoundingBoxDescent || size * 0.25;
      for (const [dx, dy, al] of (o.cands || [[0, 0]])) {
        const align = al || o.align || 'center';
        let x0 = x + dx - (align === 'center' ? w / 2 : align === 'right' ? w : 0);
        x0 = Math.max(3, Math.min(W - 3 - w, x0));
        const by = Math.max(asc + 2, Math.min(H - desc - 2, y + dy));
        const b = { x0: x0 - 2, y0: by - asc - 2, x1: x0 + w + 2, y1: by + desc + 2 };
        if (!hit(b)) {
          if (o.bg) { ctx.fillStyle = 'rgba(13,22,33,0.82)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          ctx.fillStyle = o.color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x0, by);
          boxes.push(b); ctx.restore(); return b;
        }
      }
      ctx.restore(); return null;
    }
  };
}
const AROUND = (d = 10) => [[0, -d], [0, d + 10], [d, 4, 'left'], [-d, 4, 'right'], [d, -d, 'left'], [-d, -d, 'right'], [d, d + 8, 'left'], [-d, d + 8, 'right']];

// An equal-scale view of a region (model units) inside the canvas below the title row.
function view(W, H, top, xmin, xmax, ymin, ymax, pad = 18) {
  const s = Math.min((W - 2 * pad) / (xmax - xmin), (H - top - 2 * pad) / (ymax - ymin));
  const cx = W / 2 - s * (xmin + xmax) / 2, cy = top + (H - top) / 2 + s * (ymin + ymax) / 2;
  return { s, X: x => cx + s * x, Y: y => cy - s * y };
}

// A plot panel with ticks. o: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks [{v, s}], xTicks [{v, s}]
function panel(ctx, L, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  if (o.title) L.put(o.title, 8, P.t - 11, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  ctx.save(); ctx.lineWidth = 1;
  for (const tk of o.yTicks) {
    ctx.strokeStyle = tk.zero ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(tk.v)); ctx.lineTo(P.r, y(tk.v)); ctx.stroke();
    L.put(tk.s, P.l - 5, y(tk.v) + 4, { align: 'right', color: C.muted, size: 10.5 });
  }
  for (const tk of (o.xTicks || [])) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(tk.v), P.t); ctx.lineTo(x(tk.v), P.b + 4); ctx.stroke();
    L.put(tk.s, x(tk.v), P.b + 16, { color: C.muted, size: 10.5 });
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  return { x, y, P };
}
function title(L, W, text, y = 18) { L.put(text, 8, y, { align: 'left', weight: 600, size: 12, maxW: W - 16 }); }
/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

function dot(ctx, X, Y, r, fill, stroke) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 2 * Math.PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
function seg(ctx, x0, y0, x1, y1, col, lw = 2, dash = null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
// A thick flow arrow from (x0, y0) to (x1, y1) with body width w (px).
function flow(ctx, x0, y0, x1, y1, w, col, alpha = 0.9) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2 || w < 0.4) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, hw = Math.max(w, 2) / 2, head = Math.min(L * 0.45, Math.max(10, hw * 1.6)), hh = hw + Math.max(5, hw * 0.5);
  const bx = x1 - ux * head, by = y1 - uy * head;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x0 + nx * hw, y0 + ny * hw); ctx.lineTo(bx + nx * hw, by + ny * hw); ctx.lineTo(bx + nx * hh, by + ny * hh); ctx.lineTo(x1, y1);
  ctx.lineTo(bx - nx * hh, by - ny * hh); ctx.lineTo(bx - nx * hw, by - ny * hw); ctx.lineTo(x0 - nx * hw, y0 - ny * hw); ctx.closePath(); ctx.fill(); ctx.restore();
}
const line = (ctx, P, pts, col, lw = 2, dash = null) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(P.x(x), P.y(y)) : ctx.moveTo(P.x(x), P.y(y)))); ctx.stroke(); ctx.restore(); };

/* ---------- step 0: one beam at equinox noon ---------- */
function draw0() {
  const lat = num('lat0'), h = M.elevation(lat), I = M.noonFlux(lat), sp = M.spread(lat);
  $('lat0v').textContent = lat + '°';
  const { ctx, W, H, L } = fitCanvas($('c0'));
  L.put(t('c0a'), 8, 18, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  const top = 30, bot = 270, R = Math.min(105, (bot - top) / 2 - 12, W * 0.3), cx = W - R - Math.max(20, W * 0.12), cy = (top + bot) / 2 + 6;
  // faint parallel rays
  for (let y = top + 12; y < bot - 6; y += 18) seg(ctx, 12, y, cx - Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)) - 2, y, 'rgba(255,215,106,0.12)', 1);
  const g = ctx.createRadialGradient(cx - R * 0.4, cy, R * 0.2, cx, cy, R); g.addColorStop(0, '#2f6e9a'); g.addColorStop(1, '#173550');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(5,8,12,0.55)'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); ctx.fill(); // night half
  seg(ctx, cx - R, cy, cx + R, cy, C.muted, 1, [4, 4]);
  const hw = 0.06; // beam half-width in units of R
  const beam = (phi, col, ghost) => {
    const s0 = Math.sin(phi * Math.PI / 180) - hw, s1 = Math.min(1, Math.sin(phi * Math.PI / 180) + hw);
    const pts = []; for (let i = 0; i <= 24; i++) { const s = s0 + (s1 - s0) * i / 24; pts.push([cx - R * Math.sqrt(1 - s * s), cy - R * s]); }
    ctx.save(); ctx.fillStyle = ghost ? 'rgba(134,150,170,0.18)' : 'rgba(255,180,84,0.45)';
    ctx.beginPath(); ctx.moveTo(12, cy - R * s0); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(12, cy - R * s1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ghost ? '#8696aa' : col; ctx.lineWidth = ghost ? 2 : 4; if (ghost) ctx.setLineDash([4, 3]); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    return pts;
  };
  beam(0, null, true);
  const fp = beam(lat, C.orange, false);
  L.block(cx - R, cy - R, cx + R, cy + R);
  L.put(t('lbSun') + ' →', 16, top + 14, { align: 'left', color: C.sun, weight: 700 });
  L.put(t('lbEquator'), cx + R + 6, cy + 4, { align: 'left', color: C.muted, cands: [[0, 0, 'left'], [0, 16, 'left'], [-R - 12, 20, 'right']] });
  const mid = fp[12];
  L.put(t('lbFoot'), mid[0] - 8, mid[1] - 10, { align: 'right', color: C.orange, weight: 700, bg: true, cands: [[0, 0, 'right'], [0, -16, 'right'], [0, 18, 'right']] });
  // curve
  const P = panel(ctx, L, W, { top: 314, bottom: H - 28, left: 46, right: 14, xMin: 0, xMax: 90, yMin: 0, yMax: 1500,
    yTicks: [{ v: 0, s: '0', zero: true }, { v: 680.5, s: '680' }, { v: 1361, s: '1361' }], xTicks: [0, 15, 30, 45, 60, 75, 90].map(v => ({ v, s: v + '°' })), title: t('c0b') });
  const pts = []; for (let a = 0; a <= 90; a++) pts.push([a, M.noonFlux(a)]); line(ctx, P, pts, C.cyan, 2);
  seg(ctx, P.x(lat), P.y(0), P.x(lat), P.y(I), C.orange, 1, [3, 3]);
  dot(ctx, P.x(lat), P.y(I), 6, C.orange);
  $('r0').textContent = t('s0readout', { lat, h, sp: sp.toFixed(2), I: Math.round(I), pct: Math.round(I / M.S * 100) });
}

/* ---------- step 1: area-weighted daily mean → S/4 ---------- */
const s1 = { k: 9 };
function draw1() {
  const { ctx, W, H, L } = fitCanvas($('c1'));
  const P = panel(ctx, L, W, { top: 32, bottom: H - 30, left: 44, right: 14, xMin: 0, xMax: 1, yMin: 0, yMax: 480,
    yTicks: [{ v: 0, s: '0', zero: true }, { v: 200, s: '200' }, { v: 400, s: '400' }], xTicks: [0, 15, 30, 45, 60, 90].map(v => ({ v: Math.sin(v * Math.PI / 180), s: v + '°' })), title: t('c1') });
  M.BANDS.forEach(([a, b], i) => {
    const x0 = P.x(Math.sin(a * Math.PI / 180)), x1 = P.x(Math.sin(b * Math.PI / 180)), q = M.bandMean(a, b);
    if (i < s1.k) { ctx.fillStyle = i === s1.k - 1 ? 'rgba(103,215,249,0.85)' : 'rgba(103,215,249,0.45)'; ctx.fillRect(x0 + 0.5, P.y(q), Math.max(1, x1 - x0 - 1), P.y(0) - P.y(q)); }
    else { ctx.strokeStyle = 'rgba(134,150,170,0.5)'; ctx.setLineDash([3, 3]); ctx.strokeRect(x0 + 0.5, P.y(q), Math.max(1, x1 - x0 - 1), P.y(0) - P.y(q)); ctx.setLineDash([]); }
  });
  const curve = []; for (let i = 0; i <= 90; i++) curve.push([Math.sin(i * Math.PI / 180), M.dailyMean(i)]); line(ctx, P, curve, 'rgba(232,237,244,0.35)', 1.2);
  const d1 = v => (Math.round(v * 10 + 1e-6) / 10).toFixed(1); // runningMean(9) = 340.2499…; round both readouts alike
  const s4 = M.globalMean(); seg(ctx, P.x(0), P.y(s4), P.x(1), P.y(s4), C.orange, 1.6, [6, 4]);
  L.put(t('lbS4'), P.P.r - 4, P.y(s4) - 6, { align: 'right', color: C.orange, weight: 700, bg: true, cands: [[0, 0, 'right'], [0, 20, 'right']] });
  if (s1.k > 0) {
    const run = M.runningMean(s1.k), xr = P.x(Math.sin(M.BANDS[s1.k - 1][1] * Math.PI / 180));
    seg(ctx, P.x(0), P.y(run), xr, P.y(run), C.text, 2.4);
    dot(ctx, xr, P.y(run), 4, C.text);
    L.put(t('lbRunning') + ' ' + d1(run), Math.min(xr, P.P.r) - 4, P.y(run) - 8, { align: 'right', color: C.text, bg: true, size: 11, cands: [[0, 0, 'right'], [0, -16, 'right'], [0, 24, 'right']] });
  }
  const k = Math.max(1, s1.k), [a, b] = M.BANDS[k - 1];
  const prog = s1.k < 9 ? t('s1progress', { k: s1.k }) : '';
  $('r1').textContent = t('s1readout', { prog, a, b, q: M.bandMean(a, b).toFixed(1), share: (2 * M.bandArea(a, b) * 100).toFixed(1), run: d1(M.runningMean(k)), s4: d1(s4) });
}

/* ---------- step 2: albedo ---------- */
const mixHex = (a, b, f) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`; };
function draw2() {
  const al = num('a2'), inc = M.S / 4, refl = al * inc, abs = inc - refl;
  $('a2v').textContent = al.toFixed(2);
  let { ctx, W, H, L } = fitCanvas($('c2'));
  L.put(t('c2a'), 8, 18, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  // labels get their own row (y = 40); arrows start below it
  const gy = H - 70, k = Math.min(0.2, W / 2200), yTop = 54; // k: px per W/m²
  ctx.fillStyle = mixHex('#14324a', '#eef3f8', Math.min(1, al / 0.85)); ctx.fillRect(10, gy, W - 20, H - 10 - gy);
  const hx = W * 0.5, rw = Math.max(0.5, refl * k);
  flow(ctx, hx - W * 0.28, yTop, hx - 4, gy - 2, inc * k, C.sun);
  flow(ctx, hx + 6 + rw / 2, gy - 2, hx + W * 0.28, yTop + 8, rw, C.orange);
  flow(ctx, hx, gy + 2, hx, H - 14, Math.max(0.5, abs * k * 0.6), C.green);
  L.block(hx - W * 0.3, yTop - 4, hx + W * 0.3, gy);
  L.put(`${t('lbIn')} ${inc.toFixed(0)}`, 12, 40, { align: 'left', color: C.sun, weight: 700, bg: true, cands: [[0, 0, 'left'], [0, 18, 'left']] });
  L.put(`${t('lbRefl')} ${refl.toFixed(0)}`, W - 12, 40, { align: 'right', color: C.orange, weight: 700, bg: true, cands: [[0, 0, 'right'], [0, 18, 'right']] });
  L.put(`${t('lbAbs')} ${abs.toFixed(0)}`, hx + Math.max(10, abs * k * 0.3 + 8), H - 24, { align: 'left', color: C.green, weight: 700, bg: true, cands: [[0, 0, 'left'], [-2 * Math.max(10, abs * k * 0.3 + 8), 0, 'right']] });
  ({ ctx, W, H, L } = fitCanvas($('c2b')));
  const P = panel(ctx, L, W, { top: 32, bottom: H - 30, left: 44, right: 14, xMin: 0, xMax: 1, yMin: 0, yMax: 360,
    yTicks: [{ v: 0, s: '0', zero: true }, { v: 100, s: '100' }, { v: 200, s: '200' }, { v: 340.25, s: '340' }], title: t('c2b') });
  const bx0 = P.x(0.25), bx1 = P.x(0.75);
  ctx.fillStyle = C.green; ctx.fillRect(bx0, P.y(abs), bx1 - bx0, P.y(0) - P.y(abs));
  ctx.fillStyle = C.orange; ctx.fillRect(bx0, P.y(inc), bx1 - bx0, P.y(abs) - P.y(inc));
  if (P.y(abs) - P.y(inc) > 16) L.put(refl.toFixed(0), (bx0 + bx1) / 2, (P.y(abs) + P.y(inc)) / 2 + 4, { color: '#1a1206', weight: 700 });
  if (P.y(0) - P.y(abs) > 16) L.put(abs.toFixed(0), (bx0 + bx1) / 2, (P.y(0) + P.y(abs)) / 2 + 4, { color: '#06180e', weight: 700 });
  $('r2').textContent = t('s2readout', { a: al.toFixed(2), inc: inc.toFixed(1), refl: refl.toFixed(1), abs: abs.toFixed(1) });
}

/* ---------- step 3: relaxation without air ---------- */
const s3 = { runs: [], cur: null, p: 1 };
const Y3 = 10;
function draw3() {
  const al = num('a3'), T0 = num('T03'), te = M.Te(al), Q = M.absorbed(al);
  $('a3v').textContent = al.toFixed(2); $('T03v').textContent = T0 + ' K';
  const { ctx, W, H, L } = fitCanvas($('c3'));
  const xt = [0, 2, 4, 6, 8, 10].map(v => ({ v, s: String(v) }));
  const A = panel(ctx, L, W, { top: 32, bottom: 222, left: 44, right: 14, xMin: 0, xMax: Y3, yMin: 190, yMax: 330, yTicks: [200, 250, 300].map(v => ({ v, s: String(v) })), xTicks: xt, title: t('c3a') });
  seg(ctx, A.x(0), A.y(te), A.x(Y3), A.y(te), C.text, 1.2, [5, 4]);
  L.put(`${t('lbEq')} ${te.toFixed(1)} K`, A.P.r - 4, A.y(te) - 6, { align: 'right', color: C.text, bg: true, cands: [[0, 0, 'right'], [0, 18, 'right']] });
  const B = panel(ctx, L, W, { top: 272, bottom: H - 28, left: 44, right: 14, xMin: 0, xMax: Y3, yMin: 0, yMax: 650, yTicks: [0, 200, 400, 600].map(v => ({ v, s: String(v), zero: !v })), xTicks: xt, title: t('c3b') });
  seg(ctx, B.x(0), B.y(Q), B.x(Y3), B.y(Q), C.green, 2);
  const drawRun = (r, frac, col, lw) => {
    const n = Math.max(1, Math.round((r.data.length - 1) * frac)), d = r.data.slice(0, n + 1);
    line(ctx, A, d.map(p => [p.t, p.T]), col, lw);
    if (col === C.cyan) line(ctx, B, d.map(p => [p.t, M.emit(p.T)]), C.orange, 2);
    return d[d.length - 1];
  };
  s3.runs.forEach(r => { if (r !== s3.cur) drawRun(r, 1, C.raw, 1.4); });
  let last = null;
  if (s3.cur) { last = drawRun(s3.cur, s3.p, C.cyan, 2.4); dot(ctx, A.x(last.t), A.y(last.T), 5, C.cyan); dot(ctx, B.x(last.t), B.y(M.emit(last.T)), 4.5, C.orange); }
  L.put(t('lbInFlux'), B.P.l + 6, B.y(Q) - 7, { align: 'left', color: C.green, bg: true, cands: [[0, 0, 'left'], [0, 18, 'left']] });
  if (last) L.put(t('lbOut'), B.x(last.t) + 8, B.y(M.emit(last.T)) + 4, { align: 'left', color: C.orange, bg: true, cands: [[0, 0, 'left'], [-16, 0, 'right'], [0, -16, 'left'], [0, 18, 'left']] });
  const run = s3.cur ? t('s3run', { T0: s3.cur.T0, t: last.t.toFixed(1), T: last.T.toFixed(1), N: minus(last.N.toFixed(1)), tau: M.tauYears(s3.cur.alpha, 0).toFixed(1) }) : t('s3norun');
  $('r3').textContent = t('s3readout', { a: al.toFixed(2), Te: te.toFixed(1), C: minus((te - 273.15).toFixed(1)), out: M.emit(te).toFixed(1), run });
}

/* ---------- step 4: one-layer greenhouse ---------- */
function draw4() {
  const e = num('e4'), al = num('a4'), Lg = M.ledger(al, e);
  $('e4v').textContent = e.toFixed(2); $('a4v').textContent = al.toFixed(2);
  const { ctx, W, H, L } = fitCanvas($('c4'));
  L.put(t('c4'), 8, 18, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  const ySpace = 62, yA0 = 196, yA1 = 236, yG = H - 64;
  ctx.fillStyle = '#0a1018'; ctx.fillRect(10, 28, W - 20, ySpace - 28);
  ctx.fillStyle = `rgba(183,156,255,${0.08 + 0.3 * e})`; ctx.fillRect(10, yA0, W - 20, yA1 - yA0);
  ctx.fillStyle = '#2b3b2a'; ctx.fillRect(10, yG, W - 20, H - 12 - yG);
  const k = Math.min(0.13, (W - 40) / 4 / 420); // px per W/m², four columns
  // narrow canvases: shift the columns so each caption has room beside its arrow (lower captions may run under col 2, upper ones over col 3)
  const F = W < 480 ? [0.09, 0.38, 0.62, 0.8] : [0.125, 0.375, 0.625, 0.875], col = i => 10 + (W - 20) * F[i];
  // 0: sunlight down to the ground (passes the layer)
  flow(ctx, col(0), ySpace + 4, col(0), yG - 2, Lg.abs * k, C.sun);
  // 1: ground infrared up to the layer; the leaking part continues to space
  flow(ctx, col(1), yG - 2, col(1), yA1 + 2, Lg.up * k, C.orange, 0.55);
  flow(ctx, col(1), yA0 - 2, col(1), ySpace + 2, Lg.escape * k, C.orange);
  // 2: layer upward to space; 3: layer downward to the ground
  flow(ctx, col(2), yA0 - 2, col(2), ySpace + 2, Lg.layerUp * k, C.violet);
  flow(ctx, col(3), yA1 + 2, col(3), yG - 2, Lg.layerDown * k, C.violet);
  // reserve each arrow's own span (body half-width + 3 px) so labels may sit in the gaps, including inside the layer band
  const res = (i, y0, y1, v) => { const hw = Math.max(2, v * k) / 2 + 3; L.block(col(i) - hw, y0, col(i) + hw, y1); };
  res(0, ySpace, yG, Lg.abs); res(1, yA1, yG, Lg.up); res(1, ySpace, yA0, Lg.escape); res(2, ySpace, yA0, Lg.layerUp); res(3, yA1, yG, Lg.layerDown);
  L.put(t('lbSpace'), 16, 50, { align: 'left', color: C.muted });
  L.put(`${t('lbToSpace')} ${Lg.olr.toFixed(0)}`, W - 16, 50, { align: 'right', color: C.text, weight: 700, maxW: W * 0.6 });
  L.put(`${t('lbAtm')} ${Lg.ta.toFixed(0)} K`, W - 16, (yA0 + yA1) / 2 + 4, { align: 'right', color: C.text, weight: 700, cands: [[0, 0, 'right'], [-(W - 20) * 0.25, 0, 'right'], [-(W - 20) * 0.5, 0, 'right']] });
  L.put(`${t('lbGround')} ${Lg.ts.toFixed(0)} K`, W - 16, H - 22, { align: 'right', color: C.text, weight: 700, cands: [[0, 0, 'right'], [-W * 0.4, 0, 'right']] });
  const edge = (i, v) => col(i) - Math.max(2, v * k) / 2 - 3; // left edge of a reserved arrow span
  const tag = (i, y, name, val, colr, limit = W - 3) => {
    const off = Math.max(8, 0.5 * Math.max(2, val * k) + 6);
    L.put(val.toFixed(0), col(i) + off, y, { align: 'left', color: colr, weight: 700, bg: true, cands: [[0, 0, 'left'], [0, 18, 'left'], [-2 * off, 0, 'right']] });
    if (L.put(name, col(i) + off, y + 16, { align: 'left', color: colr, size: 10.5, bg: true, cands: [[0, 0, 'left'], [0, 16, 'left']] })) return;
    // narrow screens: break the caption into two short lines beside the arrow
    const sp = name.indexOf(' ', Math.floor(name.length / 2) - 3), cut = sp > 0 ? sp : Math.ceil(name.length / 2);
    const lines = [name.slice(0, cut).trim(), name.slice(cut).trim()], room = limit - (col(i) + off) - 6;
    lines.forEach((ln, j) => L.put(ln, col(i) + off, y + 16 + 15 * j, { align: 'left', color: colr, size: 10.5, maxW: room, bg: true }));
  };
  tag(0, (ySpace + yA0) / 2 + 20, t('lbSolar'), Lg.abs, C.sun, edge(1, Lg.escape));
  tag(1, (yA1 + yG) / 2, t('lbSurfUp'), Lg.up, C.orange, edge(3, Lg.layerDown));
  tag(1, (ySpace + yA0) / 2 - 18, t('lbLeak'), Lg.escape, C.orange, edge(2, Lg.layerUp));
  tag(2, (ySpace + yA0) / 2 + 20, t('lbLayerUp'), Lg.layerUp, C.violet);
  tag(3, (yA1 + yG) / 2, t('lbBack'), Lg.layerDown, C.violet);
  $('r4').textContent = t('s4readout', { e: e.toFixed(2), Ts: Lg.ts.toFixed(1), C: minus((Lg.ts - 273.15).toFixed(1)), Ta: Lg.ta.toFixed(1), abs: Lg.abs.toFixed(1), back: Lg.layerDown.toFixed(1), sin: Lg.surfaceIn.toFixed(1), up: Lg.up.toFixed(1), leak: Lg.escape.toFixed(1), lup: Lg.layerUp.toFixed(1), olr: Lg.olr.toFixed(1) });
}

/* ---------- step 5: imbalance after a sudden change ---------- */
const BASE = { alpha: 0.30, eps: M.EPS_EARTH };
const Y5 = 15, s5 = { runs: [], cur: null, p: 1 };
const sgn = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
function scenario(de, da) {
  const a1 = BASE.alpha + da, e1 = BASE.eps + de, T0 = M.Ts(BASE.alpha, BASE.eps);
  return { de, da, a1, e1, T0, T1: M.Ts(a1, e1), data: M.relax(a1, e1, T0, Y5, 0.02), tau: M.tauYears(a1, e1) };
}
function draw5() {
  const de = num('de5'), da = num('da5'), sc = scenario(de, da);
  $('de5v').textContent = sgn(de, 3); $('da5v').textContent = sgn(da, 3);
  const { ctx, W, H, L } = fitCanvas($('c5'));
  const xt = [0, 3, 6, 9, 12, 15].map(v => ({ v, s: String(v) }));
  // autoscale both plots to every run on show plus the scenario on the sliders
  const shown = s5.runs.concat([sc]);
  let lo = Math.min(...shown.map(r => Math.min(r.T0, r.T1))), hi = Math.max(...shown.map(r => Math.max(r.T0, r.T1)));
  const midT = (lo + hi) / 2, span = Math.max(4, hi - lo + 1); lo = midT - span / 2; hi = midT + span / 2;
  const tStep = span > 12 ? 5 : span > 6 ? 2 : 1, tTicks = [];
  for (let v = Math.ceil(lo / tStep) * tStep; v <= hi; v += tStep) tTicks.push({ v, s: String(v) });
  const nAbs = Math.max(...shown.map(r => Math.abs(r.data[0].N))), nTop = [5, 10, 15, 20, 30].find(v => v >= nAbs * 1.1) || 30;
  const A = panel(ctx, L, W, { top: 32, bottom: 222, left: 50, right: 14, xMin: 0, xMax: Y5, yMin: lo, yMax: hi, yTicks: tTicks, xTicks: xt, title: t('c5a') });
  seg(ctx, A.x(0), A.y(sc.T1), A.x(Y5), A.y(sc.T1), C.text, 1.2, [5, 4]);
  L.put(`${sc.T1.toFixed(2)} K`, A.P.r - 4, A.y(sc.T1) + (sc.T1 >= sc.T0 ? -6 : 16), { align: 'right', color: C.text, bg: true, cands: [[0, 0, 'right'], [0, sc.T1 >= sc.T0 ? 20 : -20, 'right']] });
  const B = panel(ctx, L, W, { top: 272, bottom: H - 28, left: 50, right: 14, xMin: 0, xMax: Y5, yMin: -nTop, yMax: nTop, yTicks: [-nTop, 0, nTop].map(v => ({ v, s: minus(String(v)), zero: !v })), xTicks: xt, title: t('c5b') });
  const drawRun = (r, frac, cT, cN, lw) => {
    const n = Math.max(1, Math.round((r.data.length - 1) * frac)), d = r.data.slice(0, n + 1);
    ctx.save(); ctx.beginPath(); ctx.rect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t); ctx.clip(); line(ctx, A, [[0, r.T0]].concat(d.map(p => [p.t, p.T])), cT, lw); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(B.P.l, B.P.t, B.P.r - B.P.l, B.P.b - B.P.t); ctx.clip(); line(ctx, B, [[0, 0]].concat(d.map(p => [p.t, p.N])), cN, lw); ctx.restore();
    return d[d.length - 1];
  };
  s5.runs.forEach(r => { if (r !== s5.cur) drawRun(r, 1, C.raw, C.raw, 1.4); });
  let last = null;
  if (s5.cur) { last = drawRun(s5.cur, s5.p, C.cyan, C.pink, 2.4); dot(ctx, A.x(last.t), A.y(last.T), 5, C.cyan); dot(ctx, B.x(last.t), B.y(last.N), 4.5, C.pink); }
  const run = s5.cur ? t('s5run', { t: last.t.toFixed(1), T: last.T.toFixed(2), N: minus(last.N.toFixed(2)) }) : t('s5norun');
  const dT = sc.T1 - sc.T0;
  $('r5').textContent = t('s5readout', { de: sgn(de, 3), da: sgn(da, 3), N0: minus(sc.data[0].N.toFixed(2)), T1: sc.T1.toFixed(2), dir: t(dT >= 0 ? 'warmer' : 'cooler'), dT: Math.abs(dT).toFixed(2), tau: sc.tau.toFixed(1), run });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('lat0').addEventListener('input', draw0);
  $('play1').addEventListener('click', () => { s1.k = 0; draw1(); animate('s1', 9 * 700, p => { s1.k = Math.min(9, Math.floor(p * 9) + (p >= 1 ? 0 : 1)); draw1(); }); });
  $('all1').addEventListener('click', () => { stopAnim('s1'); s1.k = 9; draw1(); });

  $('a2').addEventListener('input', draw2);
  document.querySelectorAll('[data-alpha]').forEach(b => b.addEventListener('click', () => { $('a2').value = b.dataset.alpha; draw2(); }));

  $('a3').addEventListener('input', () => { stopAnim('s3'); s3.runs = []; s3.cur = null; draw3(); });
  $('T03').addEventListener('input', draw3);
  $('run3').addEventListener('click', () => {
    stopAnim('s3');
    const al = num('a3'), r = { alpha: al, T0: num('T03'), data: M.relax(al, 0, num('T03'), Y3, 0.02) };
    s3.runs.push(r); if (s3.runs.length > 6) s3.runs.shift(); s3.cur = r; s3.p = 0;
    animate('s3', 4000, p => { s3.p = p; draw3(); });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.runs = []; s3.cur = null; draw3(); });

  ['e4', 'a4'].forEach(id => $(id).addEventListener('input', draw4));

  ['de5', 'da5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.cur = null; draw5(); }));
  $('run5').addEventListener('click', () => {
    stopAnim('s5');
    const r = scenario(num('de5'), num('da5'));
    s5.runs.push(r); if (s5.runs.length > 6) s5.runs.shift(); s5.cur = r; s5.p = 0;
    animate('s5', 5000, p => { s5.p = p; draw5(); });
  });
  $('clear5').addEventListener('click', () => { stopAnim('s5'); s5.runs = []; s5.cur = null; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(en.target))); }), { rootMargin: '-25% 0px -60% 0px' });
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
