'use strict';
// Complex numbers lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, arrow and readout comes from window.COMPLEX_MODEL (model.js). Canvas text goes through a
// label placer that keeps labels inside the canvas and apart from each other.
(function () {

const $ = id => document.getElementById(id);
const M = window.COMPLEX_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1d2a38', axis: '#56708c', text: '#e8edf4', bg: '#0d1621', ghost: '#7d8ca0', white: '#e8edf4' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s.replace('-', '−'); };
const deg = v => fmt(v, 1) + '°';
// a + bi with true minus signs; "i" alone for ±1 imaginary parts; 2 decimals.
function cstr(z, d = 2) {
  const a = fmt(z.re, d), b = fmt(Math.abs(z.im), d), neg = Number(z.im.toFixed(d)) < 0 && b !== '0';
  const bi = b === '1' ? 'i' : b + 'i';
  if (b === '0') return a;
  if (a === '0') return (neg ? '−' : '') + bi;
  return a + (neg ? ' − ' : ' + ') + bi;
}
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = n => String(n).split('').map(c => SUP[c] || c).join('');

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


/* ---------- the complex plane ---------- */
// R = half-width of the shortest side, in units. Returns mapping helpers and a label placer.
function plane(canvas, R, o = {}) {
  const { ctx, W, H } = fitCanvas(canvas), L = labeler(ctx, W, H), pad = 22;
  const s = Math.min((W - 2 * pad) / (2 * R), (H - 2 * pad) / (2 * R)), ox = W / 2, oy = H / 2;
  const P = z => ({ x: ox + z.re * s, y: oy - z.im * s }), inv = (x, y) => M.cx((x - ox) / s, (oy - y) / s);
  const xr = (W / 2 - 6) / s, yr = (H / 2 - 6) / s;
  canvas._plane = { inv };
  const step = s < 18 ? 4 : s < 30 ? 2 : 1;
  ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
  for (let k = -Math.floor(xr); k <= xr; k++) { ctx.beginPath(); ctx.moveTo(ox + k * s, 0); ctx.lineTo(ox + k * s, H); ctx.stroke(); }
  for (let k = -Math.floor(yr); k <= yr; k++) { ctx.beginPath(); ctx.moveTo(0, oy - k * s); ctx.lineTo(W, oy - k * s); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
  if (!o.lineOnly) { ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke(); }
  ctx.restore();
  const ticks = () => {
    for (let k = -Math.floor(xr); k <= xr; k++) if (k && k % step === 0) L.put(fmt(k, 0), [[ox + k * s, oy + 14, 'center']], { color: C.muted, bg: false, size: 10 });
    if (!o.lineOnly) for (let k = -Math.floor(yr); k <= yr; k++) if (k && k % step === 0) L.put(fmt(k, 0) + 'i', [[ox - 5, oy - k * s + 4, 'right']], { color: C.muted, bg: false, size: 10 });
    L.put(o.reName || 'Re', [[W - 6, oy - 7, 'right'], [W - 6, oy + 26, 'right']], { color: C.muted, size: 10.5, bg: false });
    if (!o.lineOnly) L.put('Im', [[ox + 7, 13], [ox - 7, 13, 'right']], { color: C.muted, size: 10.5, bg: false });
  };
  return { ctx, W, H, L, P, s, ox, oy, xr, yr, ticks };
}
function unitCircle(g, color = C.ghost) { const { ctx } = g; ctx.save(); ctx.strokeStyle = color; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(g.ox, g.oy, g.s, 0, 7); ctx.stroke(); ctx.restore(); }
function arrowZ(g, from, to, color, w = 2.6, dash = null) {
  const a = g.P(from), b = g.P(to);
  if (Math.hypot(b.x - a.x, b.y - a.y) < 1) return;
  if (dash) { line(g.ctx, [[a.x, a.y], [b.x, b.y]], color, w - 0.8, dash); return; }
  arrow(g.ctx, a.x, a.y, b.x, b.y, color, w);
}
function shape(g, pts, color, { fill = 0.14, dash = null, w = 1.8 } = {}) {
  const { ctx } = g; ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((z, i) => { const p = g.P(z); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.closePath();
  if (fill) { ctx.globalAlpha = fill; ctx.fill(); ctx.globalAlpha = 1; } ctx.stroke(); ctx.restore();
}
// Arc around the origin from angle a0 to a1 (degrees, maths convention), radius in px.
function arcO(g, a0, a1, rad, color, w = 2) {
  const { ctx } = g; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.arc(g.ox, g.oy, rad, -a0 * Math.PI / 180, -a1 * Math.PI / 180, a1 > a0); ctx.stroke(); ctx.restore();
}
// Label near a point, pushed away from the origin first.
function zLabel(g, z, text, color, o = {}) {
  const p = g.P(z); let dx = p.x - g.ox, dy = p.y - g.oy; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n; if (n < 2) { dx = 0.7; dy = -0.7; }
  const cands = [];
  for (const rad of [13, 24, 38]) for (const rot of [0, 0.5, -0.5, 1.1, -1.1, 1.8, -1.8]) { const c = Math.cos(rot), s = Math.sin(rot); const ux = dx * c - dy * s, uy = dx * s + dy * c; cands.push([p.x + ux * rad, p.y + uy * rad + 4, ux > 0.35 ? 'left' : ux < -0.35 ? 'right' : 'center']); }
  return g.L.put(text, cands, { color, weight: o.weight || 600, size: o.size || 12 });
}
function zDot(g, z, color, r = 4.5) { const p = g.P(z); dot(g.ctx, p.x, p.y, r, color); g.L.reserve(p.x - r, p.y - r, p.x + r, p.y + r); }
function setSlider(id, v) { $(id).value = v; }
// Drag on the plane: reports the pointer position as a complex number.
function dragPlane(canvas, onDown, onMove) {
  let active = null;
  canvas.addEventListener('pointerdown', e => {
    const pl = canvas._plane; if (!pl) return; const r = canvas.getBoundingClientRect();
    active = onDown(pl.inv(e.clientX - r.left, e.clientY - r.top)); if (active === null) return;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } e.preventDefault();
  });
  canvas.addEventListener('pointermove', e => { if (active === null) return; const pl = canvas._plane, r = canvas.getBoundingClientRect(); onMove(active, pl.inv(e.clientX - r.left, e.clientY - r.top)); });
  const end = () => { active = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
}
const snap = (v, st, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v / st) * st));

/* ---------- step 0: half a U-turn ---------- */
function draw0() {
  const phi = num('phi0'); $('phi0v').textContent = phi + '°';
  const g = plane($('c0'), 1.55, { lineOnly: true, reName: t('axisRe') });
  const { first, second } = M.turnTwice(phi), one = M.cx(1, 0), neg = M.cx(-1, 0);
  unitCircle(g);
  arcO(g, 0, phi, g.s * 0.28, C.cyan, 2); arcO(g, phi, 2 * phi, g.s * 0.42, C.orange, 2);
  const tp = g.P(neg); g.ctx.save(); g.ctx.strokeStyle = C.pink; g.ctx.lineWidth = 2.5; g.ctx.beginPath(); g.ctx.arc(tp.x, tp.y, 9, 0, 7); g.ctx.stroke(); g.ctx.restore();
  arrowZ(g, M.cx(0, 0), one, C.white, 2.2);
  arrowZ(g, M.cx(0, 0), first, C.cyan, 2.6); arrowZ(g, M.cx(0, 0), second, C.orange, 2.6);
  [one, first, second].forEach((z, i) => zDot(g, z, [C.white, C.cyan, C.orange][i], 3.5));
  g.L.reserve(tp.x - 10, tp.y - 10, tp.x + 10, tp.y + 10);
  g.ticks();
  const hit = M.near(second, neg, 1e-9);
  zLabel(g, neg, '−1', C.pink); zLabel(g, one, '1', C.white);
  zLabel(g, first, `(${fmt(first.re)}, ${fmt(first.im)})`, C.cyan, { size: 11 });
  if (!M.near(second, first, 1e-6)) zLabel(g, second, `(${fmt(second.re)}, ${fmt(second.im)})`, C.orange, { size: 11 });
  const P0 = { phi, x1: fmt(first.re), y1: fmt(first.im) };
  $('r0').textContent = t('s0readout', { ...P0, phi2: 2 * phi, x2: fmt(second.re), y2: fmt(second.im), note: hit ? t('s0hit', P0) : t('s0miss', { d: fmt(Math.hypot(second.re + 1, second.im), 3) }) });
}

/* ---------- step 1: a point of the plane ---------- */
const s1 = { z: M.cx(3, 4) };
function draw1() {
  const z = s1.z; $('a1v').textContent = fmt(z.re); $('b1v').textContent = fmt(z.im);
  const g = plane($('c1'), 4.6), a = M.cx(z.re, 0), m = M.mod(z), ar = M.arg(z);
  unitCircle(g);
  line(g.ctx, [[g.P(M.cx(0, 0)).x, g.oy], [g.P(a).x, g.oy]], C.orange, 3.5);
  line(g.ctx, [[g.P(a).x, g.oy], [g.P(z).x, g.P(z).y]], C.orange, 3.5);
  if (ar !== null) arcO(g, 0, ar, Math.min(34, g.s * m * 0.45), C.violet, 2.2);
  arrowZ(g, M.cx(0, 0), z, C.cyan, 2.8); zDot(g, z, C.cyan, 4.5);
  g.ticks();
  zLabel(g, z, 'z = ' + cstr(z), C.cyan);
  if (Math.abs(z.re) > 0.01) g.L.put('a = ' + fmt(z.re), [[(g.ox + g.P(a).x) / 2, g.oy + (z.im >= 0 ? 28 : -12), 'center'], [(g.ox + g.P(a).x) / 2, g.oy + (z.im >= 0 ? -10 : 30), 'center']], { color: C.orange, size: 11 });
  if (Math.abs(z.im) > 0.01) g.L.put('b = ' + fmt(z.im), [[g.P(a).x + (z.re >= 0 ? 8 : -8), (g.oy + g.P(z).y) / 2 + 4, z.re >= 0 ? 'left' : 'right'], [g.P(a).x + (z.re >= 0 ? -8 : 8), (g.oy + g.P(z).y) / 2 + 4, z.re >= 0 ? 'right' : 'left']], { color: C.orange, size: 11 });
  if (ar !== null) { const mid = ar / 2 * Math.PI / 180, rr = Math.min(34, g.s * m * 0.45) + 14; g.L.put(deg(ar), [[g.ox + Math.cos(mid) * rr, g.oy - Math.sin(mid) * rr + 4, 'center'], [g.ox + Math.cos(mid) * (rr + 14), g.oy - Math.sin(mid) * (rr + 14) + 4, 'center']], { color: C.violet, size: 11 }); }
  const sq = v => (v < 0 ? `(${fmt(v)})²` : `${fmt(v)}²`);
  $('r1').textContent = t('s1readout', { z: cstr(z), a: fmt(z.re), b: fmt(z.im), expr: `√(${sq(z.re)} + ${sq(z.im)})`, m: fmt(m, 3), arg: ar === null ? t('argNone') : deg(ar) });
}
function setZ1(z) { s1.z = z; setSlider('a1', snap(z.re, 0.5, -4, 4)); setSlider('b1', snap(z.im, 0.5, -4, 4)); draw1(); }

/* ---------- step 2: addition is a shift ---------- */
function z2() { return M.cx(num('za2'), num('zb2')); } function w2() { return M.cx(num('wa2'), num('wb2')); }
function draw2() {
  const z = z2(), w = w2(), sum = M.add(z, w);
  ['za2', 'zb2', 'wa2', 'wb2'].forEach(id => { $(id + 'v').textContent = fmt(num(id)); });
  const g = plane($('c2'), 5.2), O = M.cx(0, 0);
  shape(g, M.SHAPE_F, C.ghost, { fill: 0.1 }); shape(g, M.SHAPE_F.map(p => M.add(p, w)), C.orange, { fill: 0.08, dash: [5, 4] });
  arrowZ(g, z, sum, C.orange, 2, [5, 4]); arrowZ(g, w, sum, C.cyan, 2, [5, 4]);
  arrowZ(g, O, z, C.cyan); arrowZ(g, O, w, C.orange); arrowZ(g, O, sum, C.green, 3);
  [z, w, sum].forEach((p, i) => zDot(g, p, [C.cyan, C.orange, C.green][i], 4));
  g.ticks();
  zLabel(g, sum, 'z + w', C.green); zLabel(g, z, 'z', C.cyan); zLabel(g, w, 'w', C.orange);
  $('r2').textContent = t('s2readout', { za: fmt(z.re), wa: fmt(w.re), zb: fmt(z.im), wb: fmt(w.im), s: cstr(sum) });
}

/* ---------- step 3: times i ---------- */
const s3 = { k: 0, anim: 1 };
function z3() { return M.cx(num('za3'), num('zb3')); }
function draw3() {
  ['za3', 'zb3'].forEach(id => { $(id + 'v').textContent = fmt(num(id)); });
  const z0 = z3(), k = s3.k, orb = M.orbit(z0, k);
  const g = plane($('c3'), 4.4);
  unitCircle(g);
  // earlier positions of the shape, then the current one (turning in from the previous position while animating)
  for (let j = 0; j < k; j++) shape(g, M.mapShape(M.SHAPE_F, M.orbit(M.cx(1, 0), j)[j]), C.ghost, { fill: 0.05, w: 1.2 });
  const turn = k === 0 ? M.cx(1, 0) : M.mul(M.orbit(M.cx(1, 0), k - 1)[k - 1], M.fromPolar(1, 90 * s3.anim));
  shape(g, M.mapShape(M.SHAPE_F, turn), C.orange, { fill: 0.16 });
  const m = M.mod(z0);
  if (m > 1e-9) for (let j = 1; j <= k; j++) { const a0 = M.arg(orb[j - 1]), a1 = a0 + (j === k ? 90 * s3.anim : 90); arcO(g, a0, a1, m * g.s, C.cyan, 1.6); }
  const cur = M.mul(z0, turn);
  for (let j = 0; j < k; j++) zDot(g, orb[j], C.ghost, 3.5);
  arrowZ(g, M.cx(0, 0), cur, C.cyan, 2.8); zDot(g, cur, C.cyan, 4.5);
  g.ticks();
  for (let j = Math.max(0, k - 7); j < k; j++) zLabel(g, orb[j], String(j), C.ghost, { size: 11 });
  zLabel(g, cur, k + ': ' + cstr(orb[k]), C.cyan);
  $('prog3').textContent = t('prog3', { k });
  const ik = M.orbit(M.cx(1, 0), k)[k], last = k ? t('s3last', { prev: cstr(orb[k - 1]), cur: cstr(orb[k]), pa: fmt(orb[k - 1].re), pb: fmt(orb[k - 1].im), ca: fmt(orb[k].re), cb: fmt(orb[k].im) }) : t('s3start');
  const ar = M.arg(orb[k]);
  $('r3').textContent = t('s3readout', { k, ks: sup(k), ik: cstr(ik), zk: cstr(orb[k]), m: fmt(M.mod(orb[k]), 3), arg: ar === null ? t('argNone') : deg(ar), last });
}

/* ---------- step 4: general multiplication ---------- */
const s4 = { w: M.fromPolar(1.5, 60) };
function z4() { return M.cx(num('za4'), num('zb4')); }
function draw4() {
  const w = s4.w, z = z4(), zw = M.mul(z, w), r = M.mod(w), f = M.arg(w), mz = M.mod(z), az = M.arg(z);
  $('r4v').textContent = fmt(r); $('f4v').textContent = f === null ? '—' : deg(f);
  ['za4', 'zb4'].forEach(id => { $(id + 'v').textContent = fmt(num(id)); });
  const g = plane($('c4'), 4.2), O = M.cx(0, 0);
  unitCircle(g);
  shape(g, M.SHAPE_F, C.ghost, { fill: 0.08 }); shape(g, M.mapShape(M.SHAPE_F, w), C.orange, { fill: 0.14 });
  if (az !== null && f !== null) arcO(g, az, az + f, Math.max(14, Math.min(mz, M.mod(zw)) * g.s * 0.55), C.violet, 1.6);
  arrowZ(g, O, w, C.violet, 2.4); arrowZ(g, O, z, C.cyan); arrowZ(g, O, zw, C.orange, 3);
  [w, z, zw].forEach((p, i) => zDot(g, p, [C.violet, C.cyan, C.orange][i], 4));
  g.ticks();
  zLabel(g, zw, 'z·w', C.orange); zLabel(g, z, 'z', C.cyan); zLabel(g, w, 'w', C.violet);
  if (r < 1e-12 || mz < 1e-12) { $('out4').textContent = t('s4zero', { w: cstr(w), z: cstr(z), mz: fmt(mz, 3), r: fmt(r, 3) }); return; }
  const polar = M.mulPolar(z, w), sa = az + f, wrapped = M.normDeg(sa);
  $('out4').textContent = t('s4readout', { w: cstr(w), r: fmt(r, 3), f: deg(f), z: cstr(z), mz: fmt(mz, 3), az: deg(az), zw: cstr(zw), mzw: fmt(mz * r, 3), sa: deg(sa), wrap: Math.abs(wrapped - sa) > 1e-9 ? t('wrapNote', { v: deg(wrapped) }) : '', gap: fmt(Math.hypot(polar.re - zw.re, polar.im - zw.im), 6) });
}
function setW4(w) { s4.w = w; setSlider('r4', snap(M.mod(w), 0.05, 0, 2)); setSlider('f4', snap(M.arg(w) || 0, 5, -180, 180)); draw4(); }

/* ---------- step 5: keep multiplying ---------- */
const s5 = { shown: null, w: M.fromPolar(1, 72) };
function draw5() {
  const w = s5.w, n = num('n5'), r = M.mod(w), f = M.arg(w), pw = M.powers(w, n), k = s5.shown === null ? n : s5.shown;
  $('r5v').textContent = fmt(r); $('f5v').textContent = deg(f); $('n5v').textContent = n;
  const g = plane($('c5'), 2.4), O = M.cx(0, 0);
  unitCircle(g, '#8696aa');
  const vis = pw.slice(0, k + 1).map(z => g.P(z));
  g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(0, 0, g.W, g.H); g.ctx.clip(); line(g.ctx, vis.map(p => [p.x, p.y]), C.cyan, 2); g.ctx.restore();
  arrowZ(g, O, w, C.violet, 2.4);
  pw.slice(0, k + 1).forEach((z, j) => zDot(g, z, j === k ? C.white : C.cyan, j === k ? 5 : 3.2));
  g.ticks();
  zLabel(g, pw[k], 'w' + sup(k), C.white); zLabel(g, w, 'w', C.violet); zLabel(g, M.cx(1, 0), '1', C.text);
  const off = pw.some(z => Math.abs(z.re) > g.xr || Math.abs(z.im) > g.yr), wn = pw[n], back = M.near(wn, M.cx(1, 0), 1e-9) && Math.abs(r - 1) < 1e-12;
  const nf = n * f, wrapped = M.normDeg(nf);
  const prog = s5.shown !== null ? t('multiplying', { k, N: n }) : '';
  $('out5').textContent = t('s5readout', { prog, ns: sup(n), w: cstr(w, 3), n, wn: cstr(wn, 3), r: fmt(r, 3), rn: fmt(Math.pow(r, n), 3), f: deg(f), nf: deg(nf), wrap: Math.abs(wrapped - nf) > 1e-9 ? t('wrapNote', { v: deg(wrapped) }) : '', note: (back ? t('s5back', { n }) : '') + (off ? t('s5off') : '') });
}
function setW5(r, f, n) { stopAnim('s5'); s5.shown = null; s5.w = M.fromPolar(r, f); setSlider('r5', r); setSlider('f5', f); if (n) setSlider('n5', n); draw5(); }

/* ---------- step 6: quiz ---------- */
function checkQuiz() {
  [['q1', 'f1', cstr(M.QUIZ.q1)], ['q2', 'f2', fmt(M.QUIZ.q2[0], 3)], ['q3', 'f3', cstr(M.QUIZ.q3)]].forEach(([q, f, v]) => {
    const pick = document.querySelector(`input[name="${q}"]:checked`), el = $(f);
    if (!pick) { el.textContent = t('q0'); el.className = 'quiz-feedback bad'; el.dataset.state = 'empty'; return; }
    const ok = pick.value === M.quizKey(q);
    el.textContent = t(q + (ok ? 'ok' : 'no'), { v, pick: t(q + pick.value) });
    el.className = 'quiz-feedback' + (ok ? '' : ' bad'); el.dataset.state = ok ? 'correct' : 'wrong';
  });
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4(); draw5();
  ['f1', 'f2', 'f3'].forEach(id => { if ($(id).dataset.state) checkQuiz(); });
}

function setup() {
  $('phi0').addEventListener('input', draw0);

  ['a1', 'b1'].forEach(id => $(id).addEventListener('input', () => { s1.z = M.cx(num('a1'), num('b1')); draw1(); }));
  [['pr34', M.cx(3, 4)], ['prNeg', M.cx(-2, 0)], ['prImag', M.cx(0, 2)], ['prUnit', M.fromPolar(1, 40)], ['prO', M.cx(0, 0)]].forEach(([id, z]) => $(id).addEventListener('click', () => setZ1(z)));
  dragPlane($('c1'), () => 'z', (_, p) => setZ1(M.cx(snap(p.re, 0.5, -4, 4), snap(p.im, 0.5, -4, 4))));

  ['za2', 'zb2', 'wa2', 'wb2'].forEach(id => $(id).addEventListener('input', draw2));
  dragPlane($('c2'), p => { const z = z2(), w = w2(); return Math.hypot(p.re - z.re, p.im - z.im) <= Math.hypot(p.re - w.re, p.im - w.im) ? 'z' : 'w'; },
    (which, p) => { setSlider(which === 'z' ? 'za2' : 'wa2', snap(p.re, 0.5, -3, 3)); setSlider(which === 'z' ? 'zb2' : 'wb2', snap(p.im, 0.5, -3, 3)); draw2(); });

  ['za3', 'zb3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); s3.k = 0; s3.anim = 1; draw3(); }));
  $('times3').addEventListener('click', () => { stopAnim('s3'); s3.k = Math.min(8, s3.k + 1); s3.anim = 0; animate('s3', 500, p => { s3.anim = p; draw3(); }); });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.k = 0; s3.anim = 1; draw3(); });

  ['r4', 'f4'].forEach(id => $(id).addEventListener('input', () => { s4.w = M.fromPolar(num('r4'), num('f4')); draw4(); }));
  ['za4', 'zb4'].forEach(id => $(id).addEventListener('input', draw4));
  [['w2', M.cx(2, 0)], ['wi', M.cx(0, 1)], ['w1i', M.cx(1, 1)], ['wm1', M.cx(-1, 0)]].forEach(([id, w]) => $(id).addEventListener('click', () => setW4(w)));
  dragPlane($('c4'), () => 'w', (_, p) => { const r = snap(M.mod(p), 0.05, 0, 2), f = snap(M.arg(p) || 0, 5, -180, 180); setSlider('r4', r); setSlider('f4', f); s4.w = M.fromPolar(r, f); draw4(); });

  ['r5', 'f5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.shown = null; s5.w = M.fromPolar(num('r5'), num('f5')); draw5(); }));
  $('n5').addEventListener('input', () => { stopAnim('s5'); s5.shown = null; draw5(); });
  [['q4i', 1, 90, 4], ['q5', 1, 72, 5], ['qin', 0.9, 30, 24], ['qout', 1.1, 30, 12]].forEach(([id, r, f, n]) => $(id).addEventListener('click', () => setW5(r, f, n)));
  $('play5').addEventListener('click', () => { const n = num('n5'); s5.shown = 0; draw5(); animate('s5', Math.min(7000, (n + 1) * 450), p => { s5.shown = Math.min(n, Math.floor(p * (n + 1))); draw5(); }, () => { s5.shown = null; draw5(); }); });
  dragPlane($('c5'), () => 'w', (_, p) => { const r = snap(M.mod(p), 0.01, 0.8, 1.15), f = snap(M.arg(p) || 0, 1, -180, 180); setW5(r, f); });
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
