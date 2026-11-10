'use strict';
// Plate tectonics lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stripe, arrow, dot and readout comes from window.PLATE_MODEL (model.js). Canvas labels go through a small
// collision-aware placer (each label tries a few anchor offsets and is dropped rather than drawn on top of another).
(function () {

const $ = id => document.getElementById(id);
const M = window.PLATE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', red: '#ff6b6b', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', norm: '#3fb6dc', rev: '#34465a', ocean: '#2b5d86', cont: '#9c8a64', mantle: '#3a2418', water: '#123a5a' };
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
function arrow(ctx, x0, y0, x1, y1, col, lw = 2.5, hd = 9) {
  if (Math.hypot(x1 - x0, y1 - y0) < 2) return;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  seg(ctx, x0, y0, x1 - 0.6 * hd * Math.cos(ang), y1 - 0.6 * hd * Math.sin(ang), col, lw);
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(ang - 0.42), y1 - hd * Math.sin(ang - 0.42)); ctx.lineTo(x1 - hd * Math.cos(ang + 0.42), y1 - hd * Math.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
}
function poly(ctx, pts, fill, stroke, lw = 1.5) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }

/* ---------- step 0: magnetic stripes and the spreading rate ---------- */
const X0 = 450; // km shown each side of the ridge
function draw0() {
  const u = num('u0'), el = num('t0'), tNow = Math.max(0, M.T0 - el);
  $('u0v').textContent = u.toFixed(1) + ' cm/yr'; $('t0v').textContent = el.toFixed(2);
  const { ctx, W, H, L } = fitCanvas($('c0'));
  const A = panel(ctx, L, W, { top: 30, bottom: 180, left: 14, right: 14, xMin: -X0, xMax: X0, yMin: 0, yMax: 1, yTicks: [], title: t('c0a') });
  ctx.fillStyle = '#121820'; ctx.fillRect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t);
  ctx.save(); ctx.strokeStyle = '#1e2733'; ctx.lineWidth = 1; for (let hx = A.P.l - 150; hx < A.P.r; hx += 9) { ctx.beginPath(); ctx.moveTo(hx, A.P.b); ctx.lineTo(hx + 150, A.P.t); ctx.stroke(); } ctx.restore();
  for (const s of M.stripes(u, tNow)) for (const side of [-1, 1]) {
    const xa = A.x(side * s.x0), xb = A.x(side * Math.min(s.x1, X0));
    ctx.fillStyle = s.pol > 0 ? C.norm : C.rev; ctx.fillRect(Math.min(xa, xb), A.P.t + 1, Math.abs(xb - xa), A.P.b - A.P.t - 2);
  }
  seg(ctx, A.x(0), A.P.t, A.x(0), A.P.b, C.red, 3);
  const bKm = (0.78 - tNow) * M.kmPerMyr(u);
  if (tNow < 0.78) for (const side of [-1, 1]) seg(ctx, A.x(side * bKm), A.P.t - 4, A.x(side * bKm), A.P.b + 4, C.orange, 1.4, [4, 3]);
  L.put(t('lbRidge'), A.x(0), A.P.t + 16, { color: C.red, weight: 700, bg: true, cands: [[0, 0], [0, 20]] });
  if (tNow < 0.78) L.put(t('lbBrunhes'), A.x(bKm), A.P.b - 8, { align: 'left', color: C.orange, bg: true, cands: [[5, 0, 'left'], [5, -20, 'left'], [-5, 0, 'right']] });
  const B = panel(ctx, L, W, { top: 222, bottom: H - 28, left: 30, right: 14, xMin: -X0, xMax: X0, yMin: -1.35, yMax: 1.35,
    yTicks: [{ v: 1, s: t('tickNormal') }, { v: 0, s: '0', zero: true }, { v: -1, s: t('tickReversed') }], xTicks: [-400, -200, 0, 200, 400].map(v => ({ v, s: minus(v) + (v === 400 ? ' km' : '') })), title: t('c0b') });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = -X0, i = 0; x <= X0; x += 1, i++) { const Y = B.y(M.profile(u, tNow, x, 5)); if (!i) ctx.moveTo(B.x(x), Y); else ctx.lineTo(B.x(x), Y); }
  ctx.stroke(); ctx.restore();
  seg(ctx, B.x(0), B.P.t, B.x(0), B.P.b, C.red, 1, [3, 3]);
  const w = M.widthAt(u, tNow);
  const brunhes = tNow >= 0.78 ? t('s0brunhesNot') : tNow < 1e-9 ? t('s0brunhes', { b: fmt(M.brunhesKm(u), 1), u: u.toFixed(1) }) : t('s0brunhesPart', { b: fmt(bKm, 1) });
  $('r0').textContent = t('s0readout', { u: u.toFixed(1), full: (2 * u).toFixed(1), el: el.toFixed(2), ago: tNow.toFixed(2), w: fmt(w, 1), brunhes });
}

/* ---------- step 1: relative motion → boundary type ---------- */
function draw1() {
  const th = num('th1'), v = num('v1'), r = M.relMotion(v, th);
  $('th1v').textContent = th + '°'; $('v1v').textContent = v.toFixed(1) + ' cm/yr';
  const { ctx, W, H, L } = fitCanvas($('c1'));
  // map view
  const top = 30, bot = 230, mid = W / 2;
  L.put(t('c1a'), 8, top - 11, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  ctx.fillStyle = '#152a3d'; ctx.fillRect(10, top, mid - 10, bot - top);
  ctx.fillStyle = '#272a45'; ctx.fillRect(mid, top, W - 10 - mid, bot - top);
  seg(ctx, mid, top, mid, bot, C.text, 2, [6, 4]);
  L.put(t('lbPlateA'), 18, top + 18, { align: 'left', color: C.muted, maxW: mid - 30 });
  L.put(t('lbPlateB'), W - 18, top + 18, { align: 'right', color: C.muted, maxW: mid - 30 });
  L.put(t('lbBoundary'), mid, bot - 10, { color: C.text, bg: true, cands: [[0, 0], [0, -18]] });
  const ox = mid + Math.min(150, (W - 10 - mid) * 0.5), oy = (top + bot) / 2, s = Math.min(13, (W - 10 - mid) * 0.065);
  const kx = r.normal * s, ky = -r.shear * s; // screen: north = up
  if (Math.abs(r.normal) > 0.05 && Math.abs(r.shear) > 0.05) { seg(ctx, ox + kx, oy, ox + kx, oy + ky, C.muted, 1, [3, 3]); seg(ctx, ox, oy + ky, ox + kx, oy + ky, C.muted, 1, [3, 3]); }
  arrow(ctx, ox, oy, ox + kx, oy, C.pink, 3); arrow(ctx, ox, oy, ox, oy + ky, C.green, 3);
  arrow(ctx, ox, oy, ox + kx, oy + ky, C.orange, 3.5, 11);
  dot(ctx, ox, oy, 4, C.text);
  // cross-section
  const c = { t: 290, b: H - 22 };
  L.put(t('c1b'), 8, c.t - 30, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  const sea = c.t + 22, thick = 26;
  ctx.fillStyle = C.mantle; ctx.fillRect(10, sea + thick, W - 20, c.b - sea - thick);
  if (r.type === 'divergent') {
    const gap = 16, ridge = 16;
    poly(ctx, [[10, sea], [mid - gap, sea - ridge * 0.4], [mid, sea - ridge], [mid + gap, sea - ridge * 0.4], [W - 10, sea], [W - 10, sea + thick], [mid + gap, sea + thick], [mid, sea + 4], [mid - gap, sea + thick], [10, sea + thick]], C.ocean, null);
    for (const dx of [-1, 1]) arrow(ctx, mid + dx * 40, sea + thick / 2, mid + dx * 90, sea + thick / 2, C.text, 2);
    ctx.fillStyle = 'rgba(255,140,60,0.75)'; ctx.beginPath(); ctx.moveTo(mid - 10, c.b); ctx.quadraticCurveTo(mid, sea + thick + 10, mid, sea + 2); ctx.quadraticCurveTo(mid, sea + thick + 10, mid + 10, c.b); ctx.fill();
    for (const dx of [-1, 1]) arrow(ctx, mid + dx * 6, c.b - 8, mid + dx * 60, sea + thick + 16, C.orange, 1.8, 7);
    L.block(mid - 20, sea - ridge - 2, mid + 20, sea + thick);
    L.put(t('lbRift'), mid, sea - ridge - 8, { color: C.text, weight: 700, cands: [[0, 0], [0, -14]] });
    L.put(t('lbMagma'), mid + 14, c.b - 12, { align: 'left', color: C.orange, cands: [[0, 0, 'left'], [-28, 0, 'right']] });
  } else if (r.type === 'convergent') {
    // plate B (east) sinks westward under plate A
    poly(ctx, [[10, sea - 10], [mid - 6, sea - 10], [mid, sea], [mid, sea + thick], [10, sea + thick + 6]], C.cont, null);
    const dip = 0.55;
    poly(ctx, [[W - 10, sea], [mid + 4, sea], [mid - 120, sea + 120 * dip + 4], [mid - 120, sea + 120 * dip + thick + 4], [mid + 4 + 20, sea + thick], [W - 10, sea + thick]], C.ocean, null);
    poly(ctx, [[mid - 4, sea - 2], [mid + 8, sea + 14], [mid + 20, sea - 2]], C.water, null);
    const vx = mid - Math.min(150, mid * 0.6);
    poly(ctx, [[vx - 14, sea - 10], [vx, sea - 30], [vx + 14, sea - 10]], C.red, null);
    arrow(ctx, W - 40, sea + thick / 2, W - 100, sea + thick / 2, C.text, 2);
    L.block(vx - 15, sea - 31, vx + 15, sea - 10);
    L.put(t('lbArc'), vx, sea - 36, { color: C.red, weight: 700, cands: [[0, 0], [0, -14]] });
    L.put(t('lbTrench'), mid + 8, sea + 30, { color: C.cyan, weight: 700, bg: true, cands: [[0, 0], [24, 0, 'left']] });
    L.put(t('lbSlab'), mid - 60, sea + 120 * dip + thick + 24, { color: C.muted, cands: [[0, 0], [0, 14]] });
  } else if (r.type === 'transform') {
    ctx.fillStyle = C.ocean; ctx.fillRect(10, sea, W - 20, thick);
    seg(ctx, mid, sea - 8, mid, c.b, C.text, 2.5);
    const sym = r.shear > 0 ? '⊗' : '⊙', sideX = mid + Math.min(80, mid * 0.45);
    L.put(sym, sideX, sea + thick / 2 + 6, { color: C.text, size: 20, weight: 700 });
    L.put(t('lbFault'), mid, sea - 14, { color: C.text, weight: 700, maxW: W - 24, cands: [[0, 0], [0, -14]] });
    L.put(t(r.shear > 0 ? 'lbAway' : 'lbToward'), sideX, c.b - 10, { color: C.muted, maxW: W - sideX - 4, cands: [[0, 0], [0, -14], [-sideX + mid + 8, 0, 'left']] });
  }
  const nWord = Math.abs(r.normal) < 0.05 ? t('wNone') : r.normal > 0 ? t('wOpen') : t('wClose');
  $('r1').textContent = t('s1readout', { th, v: v.toFixed(1), n: minus(fmt(Math.abs(r.normal) < 0.05 ? 0 : r.normal, 1)), nWord, s: minus(fmt(Math.abs(r.shear) < 0.05 ? 0 : r.shear, 1)), off: Math.round(r.off), type: t('t_' + r.type), obl: r.oblique ? t('oblique') : '' });
}

/* ---------- step 2: which plate sinks ---------- */
const s2 = { pair: 'OO' };
const kinds = () => ({ OO: ['ocean', 'ocean'], OC: ['ocean', 'cont'], CC: ['cont', 'cont'] })[s2.pair];
function draw2() {
  const [ka, kb] = kinds(), A = { kind: ka, age: num('ageA') }, B = { kind: kb, age: num('ageB') }, w = M.whoSinks(A, B);
  $('ageAv').textContent = ka === 'ocean' ? String(A.age) : '—'; $('ageBv').textContent = kb === 'ocean' ? String(B.age) : '—';
  $('ageA').disabled = ka !== 'ocean'; $('ageB').disabled = kb !== 'ocean';
  ['OO', 'OC', 'CC'].forEach(p => $('pair' + p).setAttribute('aria-pressed', String(s2.pair === p)));
  const { ctx, W, H, L } = fitCanvas($('c2'));
  const P = panel(ctx, L, W, { top: 30, bottom: 186, left: 46, right: 14, xMin: 0, xMax: 180, yMin: -7000, yMax: -2000,
    yTicks: [{ v: -2000, s: '2000' }, { v: -4000, s: '4000' }, { v: -6000, s: '6000' }], xTicks: [0, 30, 60, 90, 120, 150, 180].map(v => ({ v, s: String(v) })), title: t('c2a') });
  ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.beginPath();
  for (let a = 0; a <= 180; a += 1) { const Y = P.y(-M.seaDepth(a)); if (!a) ctx.moveTo(P.x(a), Y); else ctx.lineTo(P.x(a), Y); }
  ctx.stroke(); ctx.restore();
  if (ka === 'ocean') dot(ctx, P.x(A.age), P.y(-M.seaDepth(A.age)), 6, C.cyan);
  if (kb === 'ocean') dot(ctx, P.x(B.age), P.y(-M.seaDepth(B.age)), 6, C.orange, C.bg);
  // cross-section
  const top = 252, bot = H - 16, mid = W / 2, sea = top + 40;
  L.put(t('c2b'), 8, top - 26, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  ctx.fillStyle = C.mantle; ctx.fillRect(10, sea + 22, W - 20, bot - sea - 22);
  const th = k => (k === 'cont' ? 44 : 22), col = k => (k === 'cont' ? C.cont : C.ocean), lift = k => (k === 'cont' ? -14 : 0);
  const dip = 0.5, dl = Math.min(150, mid - 30);
  const flat = (x0, x1, k, edge) => poly(ctx, [[x0, sea + lift(k)], [x1, sea + lift(k)], [x1, sea + lift(k) + th(k)], [x0, sea + lift(k) + th(k)]], col(k), edge, 2);
  if (w.sinks === 'a') { // A dives eastward under B
    poly(ctx, [[10, sea], [mid, sea], [mid + dl, sea + dl * dip], [mid + dl, sea + dl * dip + th(ka)], [mid - 10, sea + th(ka)], [10, sea + th(ka)]], col(ka), C.cyan, 2);
    flat(mid, W - 10, kb, C.orange);
    arrow(ctx, 40, sea + th(ka) / 2, 100, sea + th(ka) / 2, C.text, 2);
  } else if (w.sinks === 'b') {
    poly(ctx, [[W - 10, sea], [mid, sea], [mid - dl, sea + dl * dip], [mid - dl, sea + dl * dip + th(kb)], [mid + 10, sea + th(kb)], [W - 10, sea + th(kb)]], col(kb), C.orange, 2);
    flat(10, mid, ka, C.cyan);
    arrow(ctx, W - 40, sea + th(kb) / 2, W - 100, sea + th(kb) / 2, C.text, 2);
  } else if (w.sinks === 'tie') {
    flat(10, mid - 2, ka, C.cyan); flat(mid + 2, W - 10, kb, C.orange);
    L.put('?', mid, sea - 8, { color: C.orange, size: 20, weight: 700 });
  } else {
    flat(10, mid, ka, C.cyan); flat(mid, W - 10, kb, C.orange);
    poly(ctx, [[mid - 70, sea - 14], [mid - 20, sea - 58], [mid, sea - 46], [mid + 26, sea - 64], [mid + 70, sea - 14]], C.cont, null);
    poly(ctx, [[mid - 50, sea + 30], [mid + 50, sea + 30], [mid + 30, sea + 78], [mid - 30, sea + 78]], C.cont, null);
    L.block(mid - 70, sea - 64, mid + 70, sea - 14);
    L.put(t('lbMountain'), mid, sea - 70, { color: C.text, weight: 700, cands: [[0, 0], [90, 30, 'left']] });
  }
  const name = (k, side) => `${t(side)} · ${t(k === 'cont' ? 'lbCont' : 'lbOcean')} ${k === 'cont' ? M.RHO.cont : M.RHO.ocean}`;
  L.put(name(ka, 'sideA'), 16, sea - 24, { align: 'left', color: C.cyan, maxW: mid - 30, cands: [[0, 0, 'left'], [0, -14, 'left']] });
  L.put(name(kb, 'sideB'), W - 16, sea - 24, { align: 'right', color: C.orange, maxW: mid - 30, cands: [[0, 0, 'right'], [0, -14, 'right']] });
  L.put(t('lbMantle'), W - 16, bot - 8, { align: 'right', color: '#d9a07a' });
  let txt;
  if (w.reason === 'older') {
    const oldA = w.sinks === 'a';
    txt = t('v_older', { old: t(oldA ? 'sideA' : 'sideB'), ageOld: oldA ? A.age : B.age, dOld: Math.round(oldA ? w.da : w.db), ageYoung: oldA ? B.age : A.age, dYoung: Math.round(oldA ? w.db : w.da) });
  } else txt = t('v_' + w.reason);
  $('r2').textContent = txt;
  $('h2').textContent = t('s2hint', { sw: Math.round(M.T_SWITCH) });
}

/* ---------- step 3: Wadati–Benioff zone and the volcanic arc ---------- */
const s3 = { n: 0 };
const N3 = 300;
function draw3() {
  const dip = num('dip3'), q = M.slabQuakes(dip, N3, 11).slice(0, s3.n), arc = M.arcDistance(dip);
  $('dip3v').textContent = dip + '°';
  const { ctx, W, H, L } = fitCanvas($('c3'));
  L.put(t('c3'), 8, 18, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  const P = { l: 44, r: W - 12, t: 62, b: H - 28 }, sc = (P.b - P.t) / 700, xMin = -60, xMax = xMin + (P.r - P.l) / sc;
  const X = x => P.l + (x - xMin) * sc, Y = z => P.t + z * sc;
  ctx.fillStyle = '#1a1410'; ctx.fillRect(P.l, P.t, P.r - P.l, P.b - P.t);
  // ticks
  const stepX = (xMax - xMin) > 900 ? 400 : 200;
  ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
  for (const z of [0, 200, 400, 600]) { ctx.beginPath(); ctx.moveTo(P.l, Y(z)); ctx.lineTo(P.r, Y(z)); ctx.stroke(); L.put(String(z), P.l - 5, Y(z) + 4, { align: 'right', color: C.muted, size: 10.5 }); }
  for (let x = 0; x <= xMax; x += stepX) { ctx.beginPath(); ctx.moveTo(X(x), P.t); ctx.lineTo(X(x), P.b + 4); ctx.stroke(); L.put(String(x), X(x), P.b + 16, { color: C.muted, size: 10.5 }); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 40, P.r - P.l, P.b - P.t + 40); ctx.clip();
  // slab band (thickness 80 km perpendicular)
  const rad = dip * Math.PI / 180, len = 760 / Math.sin(rad), ux = Math.cos(rad), uz = Math.sin(rad), nx = Math.sin(rad), nz = -Math.cos(rad);
  poly(ctx, [[X(0), Y(0)], [X(len * ux), Y(len * uz)], [X(len * ux - 80 * nx), Y(len * uz - 80 * nz)], [X(-80 * nx), Y(-80 * nz)]], 'rgba(85,101,122,0.45)', null);
  seg(ctx, X(0), Y(0), X(len * ux), Y(len * uz), C.raw, 1.5);
  // surface: ocean on the left, land on the right
  ctx.fillStyle = C.water; ctx.fillRect(P.l, Y(0) - 10, X(0) - P.l, 10);
  seg(ctx, P.l, Y(0), P.r, Y(0), C.muted, 1.2);
  poly(ctx, [[X(arc) - 12, Y(0)], [X(arc), Y(0) - 20], [X(arc) + 12, Y(0)]], C.red, null);
  seg(ctx, X(arc), Y(0), X(arc), Y(100), C.red, 1.2, [4, 3]);
  dot(ctx, X(arc), Y(100), 4, C.red);
  q.forEach(p => { ctx.fillStyle = 'rgba(232,237,244,0.85)'; ctx.fillRect(X(p.x) - 1.6, Y(p.z) - 1.6, 3.2, 3.2); });
  const est = q.length >= 20 ? M.fitDip(q) : null;
  if (est !== null) { const r2 = est * Math.PI / 180, l2 = 760 / Math.sin(r2); seg(ctx, X(0), Y(0), X(l2 * Math.cos(r2)), Y(l2 * Math.sin(r2)), C.orange, 2, [7, 4]); }
  ctx.restore();
  L.block(X(arc) - 13, Y(0) - 21, X(arc) + 13, Y(0));
  L.put(t('lbTrench3'), X(0), Y(0) - 16, { color: C.cyan, weight: 700, cands: [[0, 0], [0, -14], [6, 0, 'left']] });
  L.put(t('lbVolcano'), X(arc), Y(0) - 26, { color: C.red, weight: 700, cands: [[0, 0], [0, -12], [16, 6, 'left']] });
  L.put(t('lb100'), X(arc) + 6, Y(100) + 4, { align: 'left', color: C.red, bg: true, cands: [[0, 0, 'left'], [-12, 0, 'right'], [0, 16, 'left']] });
  const fit = q.length ? t('s3fit', { n: q.length, zmax: Math.round(Math.max(...q.map(p => p.z))), est: est === null ? '—' : est.toFixed(1) }) : t('s3nofit');
  $('r3').textContent = t('s3readout', { dip, arc: Math.round(arc), fit });
}

/* ---------- step 4: stick-slip on a transform fault ---------- */
const LOCK = 15; // km locking depth for the elastic bending profile
function draw4() {
  const v = num('v4'), D = num('d4'), yr = num('y4'), irr = $('irr4').checked, S = M.stickSlip(v, D, 1000, irr);
  $('v4v').textContent = v.toFixed(1) + ' cm/yr'; $('d4v').textContent = D.toFixed(1) + ' m'; $('y4v').textContent = String(yr);
  const { ctx, W, H, L } = fitCanvas($('c4'));
  const top = 30, bot = 230, cx = W / 2, cy = (top + bot) / 2;
  L.put(t('c4a'), 8, top - 11, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  ctx.fillStyle = '#1b2a1f'; ctx.fillRect(10, top, W - 20, cy - top); ctx.fillStyle = '#231f2e'; ctx.fillRect(10, cy, W - 20, bot - cy);
  seg(ctx, 10, cy, W - 10, cy, C.red, 2.5);
  // far-field arrows: north side moves west, south side east (right-lateral)
  arrow(ctx, W - 40, top + 20, W - 90, top + 20, C.muted, 2); arrow(ctx, 40, bot - 20, 90, bot - 20, C.muted, 2);
  const R = S.releasedAt(yr), Dn = S.deficitAt(yr), maxFar = v / 100 * 1000 / 2, pxPerM = (W * 0.36) / Math.max(maxFar, 1e-9);
  const kmPx = (cy - top - 6) / 60; // ±60 km of map north–south
  seg(ctx, cx, top + 4, cx, bot - 4, C.text, 1, [3, 4]); // fence when built
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 3;
  for (const side of [1, -1]) {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const yk = side * Math.max(0.01, i), disp = R / 2 * Math.sign(yk) + Dn / Math.PI * Math.atan(yk / LOCK); const X = cx - disp * pxPerM, Y = cy - yk * kmPx; if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke();
  }
  ctx.restore();
  L.block(cx - 4, top, cx + 4, bot);
  L.put(t('lbFaultLine'), W - 16, cy + 16, { align: 'right', color: C.red, weight: 700, bg: true, cands: [[0, 0, 'right'], [0, -22, 'right'], [-W + 32, 16, 'left']] });
  L.put(t('lbFence'), cx + 8, top + 16, { align: 'left', color: C.cyan, bg: true, cands: [[0, 0, 'left'], [-16, 0, 'right']] });
  // deficit vs time
  const yMax = Math.ceil((irr ? D * 1.3 : D) * 1.15);
  const P = panel(ctx, L, W, { top: 286, bottom: H - 28, left: 36, right: 14, xMin: 0, xMax: 1000, yMin: 0, yMax,
    yTicks: [{ v: 0, s: '0', zero: true }, { v: D, s: fmt(D, 1) }, { v: yMax, s: String(yMax) }], xTicks: [0, 250, 500, 750, 1000].map(x => ({ v: x, s: String(x) })), title: t('c4b') });
  seg(ctx, P.x(0), P.y(D), P.x(1000), P.y(D), C.raw, 1, [4, 4]);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(P.x(0), P.y(0));
  let last = 0; for (const e of S.events) { if (e.year > yr) break; ctx.lineTo(P.x(e.year), P.y(e.slip)); ctx.lineTo(P.x(e.year), P.y(0)); last = e.year; }
  ctx.lineTo(P.x(yr), P.y(S.rate * (yr - last))); ctx.stroke(); ctx.restore();
  S.events.filter(e => e.year <= yr).forEach(e => dot(ctx, P.x(e.year), P.y(e.slip), 4.5, C.red));
  dot(ctx, P.x(yr), P.y(Dn), 5, C.orange, C.bg);
  const n = S.events.filter(e => e.year <= yr).length;
  $('r4').textContent = t('s4readout', { y: yr, v: v.toFixed(1), D: D.toFixed(1), T: Math.round(S.recurrence), n, rel: R.toFixed(1), def: Dn.toFixed(2) });
}

/* ---------- step 5: classify three sites ---------- */
const SITE_TYPES = ['transform', 'divergent', 'convergent'];
function draw5() {
  ['c5a', 'c5b', 'c5c'].forEach((id, i) => {
    const { ctx, W, H, L } = fitCanvas($(id));
    const P = panel(ctx, L, W, { top: 30, bottom: H - 26, left: 36, right: 10, xMin: 0, xMax: 600, yMin: -700, yMax: 0,
      yTicks: [{ v: 0, s: '0', zero: true }, { v: -300, s: '300' }, { v: -600, s: '600' }], xTicks: [0, 300, 600].map(x => ({ v: x, s: String(x) })), title: t('c5', { site: t('site' + (i + 1)) }) });
    M.siteQuakes(SITE_TYPES[i], 140, 31 + i).forEach(p => { if (p.x <= 600) { ctx.fillStyle = 'rgba(232,237,244,0.85)'; ctx.fillRect(P.x(p.x) - 1.5, P.y(-p.z) - 1.5, 3, 3); } });
  });
}
function check5() {
  let n = 0;
  SITE_TYPES.forEach((type, i) => {
    const v = $('pick' + (i + 1)).value, fb = $('fb' + (i + 1));
    if (!v) { fb.textContent = t('fb_none'); fb.dataset.state = 'none'; return; }
    const ok = v === type; if (ok) n++;
    fb.textContent = t(ok ? 'fb_ok' : 'fb_no', { why: t('why' + (i + 1)) }); fb.dataset.state = ok ? 'ok' : 'no';
  });
  $('r5').textContent = t('s5score', { n });
  s5.checked = true;
}
const s5 = { checked: false };

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); if (s5.checked) check5(); }

function setup() {
  ['u0', 't0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); draw0(); }));
  $('play0').addEventListener('click', () => animate('s0', 9000, p => { $('t0').value = (p * M.T0).toFixed(2); draw0(); }));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong'; $('quizFeedback').dataset.key = ok ? 'correct' : 'wrong';
  });

  ['th1', 'v1'].forEach(id => $(id).addEventListener('input', draw1));
  document.querySelectorAll('[data-th]').forEach(b => b.addEventListener('click', () => { $('th1').value = b.dataset.th; draw1(); }));

  ['OO', 'OC', 'CC'].forEach(p => $('pair' + p).addEventListener('click', () => { s2.pair = p; draw2(); }));
  ['ageA', 'ageB'].forEach(id => $(id).addEventListener('input', draw2));

  $('dip3').addEventListener('input', () => { stopAnim('s3'); s3.n = 0; draw3(); });
  $('rec3').addEventListener('click', () => { s3.n = 0; animate('s3', 2400, p => { s3.n = Math.round(p * 10) * 30; draw3(); }); });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.n = 0; draw3(); });

  ['v4', 'd4', 'y4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); draw4(); }));
  $('irr4').addEventListener('change', draw4);
  $('play4').addEventListener('click', () => animate('s4', 10000, p => { $('y4').value = String(Math.round(p * 1000)); draw4(); }));

  $('check5').addEventListener('click', check5);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(en.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = () => { const fb = $('quizFeedback'); if (fb.dataset.key) fb.textContent = t(fb.dataset.key); refresh(); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
