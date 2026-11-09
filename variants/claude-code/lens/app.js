'use strict';
// Convex lens lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ray, image position and readout comes from window.LENS_MODEL (model.js). Canvas labels go through a
// small placer that tries candidate spots and never lets two labels overlap, sit on a ray or leave the canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.LENS_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const lang = () => window.PAGE_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: 'rgba(232,237,244,0.22)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);

// Static placeholders inside explanatory text (computed, never typed in).
window.PAGE_PARAMS = { D: M.APERTURE };

// heightFor (optional): CSS height as a function of CSS width, so narrow screens keep the scene large and
// do not waste space. Otherwise the authored height attribute is used once.
function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h0) canvas.dataset.h0 = canvas.getAttribute('height') || 300;
  const h = Math.round(heightFor ? heightFor(width) : Number(canvas.dataset.h0));
  if (canvas.dataset.h !== String(h)) { canvas.dataset.h = h; canvas.style.height = h + 'px'; }
  const height = h;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Label placer: each label tries its candidate centres in order (then a smaller font) and takes the first
// spot that is inside the canvas and clear of every earlier label or blocked box. A dark plate under the
// text keeps it legible where it crosses a line.
function labeler(ctx, W, H) {
  const boxes = [];
  const fits = b => b.x0 >= 2 && b.y0 >= 2 && b.x1 <= W - 2 && b.y1 <= H - 2 && !boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    block(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
    // Treat a drawn line as an obstacle (small boxes every few px) so labels do not sit on rays.
    seg(a, b, pad = 3) { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5)); for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n; boxes.push({ x0: x - pad, y0: y - pad, x1: x + pad, y1: y + pad }); } },
    put(text, cands, color = C.text, weight = '') {
      for (const size of [12, 10.5]) {
        ctx.save(); ctx.font = `${weight} ${size}px system-ui,sans-serif`;
        const w = ctx.measureText(text).width, h = size + 3;
        for (const [cx, cy] of cands) {
          const b = { x0: cx - w / 2 - 3, x1: cx + w / 2 + 3, y0: cy - h / 2 - 1, y1: cy + h / 2 + 1 };
          if (!fits(b)) continue;
          boxes.push(b);
          ctx.fillStyle = 'rgba(13,22,33,0.85)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
          ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, cx, cy + 0.5);
          ctx.restore(); return true;
        }
        ctx.restore();
      }
      return false;
    }
  };
}
// Candidate centres on rings around (x, y), starting at angle a0 (radians, canvas orientation) and fanning out.
function ring(x, y, a0, radii, spread = [0, 0.35, -0.35, 0.7, -0.7, 1.1, -1.1, 1.6, -1.6, 2.2, -2.2, 3.14]) {
  const out = [];
  for (const r of radii) for (const d of spread) out.push([x + r * Math.cos(a0 + d), y + r * Math.sin(a0 + d)]);
  return out;
}
// Panel title in the top-left; shrinks to 10.5px, then wraps onto a second line. Returns the y below it.
function title(ctx, L, text, W) {
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let size = 12.5;
  const fit = s => { ctx.font = `600 ${s}px system-ui,sans-serif`; return ctx.measureText(text).width <= W - 16; };
  while (!fit(size) && size > 10.5) size -= 0.5;
  let lines = [text];
  if (!fit(size)) {
    // break at the last space (or anywhere, for CJK) that keeps the first line inside the width
    let cut = text.length;
    while (cut > 1 && ctx.measureText(text.slice(0, cut)).width > W - 16) cut--;
    const sp = text.lastIndexOf(' ', cut); if (sp > cut * 0.5) cut = sp;
    lines = [text.slice(0, cut).trim(), text.slice(cut).trim()];
  }
  lines.forEach((ln, i) => { ctx.fillText(ln, 8, 17 + i * 15); L.block(4, 3 + i * 15, 12 + ctx.measureText(ln).width, 22 + i * 15); });
  ctx.restore();
  return 22 + (lines.length - 1) * 15;
}
function line(ctx, a, b, color, lw = 2.4, dash = null, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
}
// A ray with an arrowhead at its middle pointing from a to b.
function ray(ctx, a, b, color, lw = 2.6, alpha = 1) {
  line(ctx, a, b, color, lw, null, alpha);
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = 7 + lw;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(mx + s * Math.cos(ang), my + s * Math.sin(ang));
  ctx.lineTo(mx + s * Math.cos(ang + 2.5), my + s * Math.sin(ang + 2.5));
  ctx.lineTo(mx + s * Math.cos(ang - 2.5), my + s * Math.sin(ang - 2.5));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function arc(ctx, x, y, r, a0, a1, color, lw = 2) {
  if (Math.abs(a1 - a0) < 1e-6) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke(); ctx.restore();
}
function dotAt(ctx, x, y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

// Pointer dragging on a canvas maps to a slider value (the slider stays the keyboard-accessible equivalent).
function dragOn(canvas, input, toValue, after) {
  canvas.classList.add('drag');
  let on = false;
  const set = e => {
    const r = canvas.getBoundingClientRect(), v = toValue(e.clientX - r.left, e.clientY - r.top, r.width, Number(canvas.dataset.h));
    if (v === null || !isFinite(v)) return;
    const lo = Number(input.min), hi = Number(input.max), st = Number(input.step);
    input.value = String(Math.min(hi, Math.max(lo, Math.round(v / st) * st)));
    after();
  };
  canvas.addEventListener('pointerdown', e => { on = true; canvas.setPointerCapture(e.pointerId); set(e); });
  canvas.addEventListener('pointermove', e => { if (on) set(e); });
  canvas.addEventListener('pointerup', () => { on = false; });
  canvas.addEventListener('pointercancel', () => { on = false; });
}

/* ---------- lens diagram helpers ---------- */
// World x ∈ [x0, x1] cm across the plot; y ∈ [yBot, yTop] cm. The vertical scale may be larger than the
// horizontal one (stretch k, shown on the canvas); straight lines stay straight, so crossings are unchanged.
function view(W, H, top, x0, x1, yBot, yTop) {
  const P = { l: 10, r: W - 10, t: top, b: H - 22 };
  const sx = (P.r - P.l) / (x1 - x0), sy = Math.max(sx, (P.b - P.t) / (yTop - yBot));
  const X = x => P.l + (x - x0) * sx, Y = y => P.t + (yTop - y) * sy;
  return { P, X, Y, sx, sy, k: sy / sx, x0, x1, yBot, yTop };
}
function clipTo(ctx, V) { ctx.save(); ctx.beginPath(); ctx.rect(V.P.l, V.P.t - 2, V.P.r - V.P.l, V.P.b - V.P.t + 4); ctx.clip(); }
// Axis, lens outline, F and 2F marks on both sides; their labels are placed first so later labels avoid them.
function lensFrame(ctx, L, V, f, opts = {}) {
  const ay = V.Y(0);
  line(ctx, [V.P.l, ay], [V.P.r, ay], C.axis, 1.2);
  L.seg([V.P.l, ay], [V.P.r, ay], 2);
  const lx = V.X(0), half = opts.half !== undefined ? opts.half * V.sy : Math.min(ay - V.P.t, V.P.b - ay) - 2, w = Math.min(10, Math.max(5, V.sx * 0.9));
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.13)'; ctx.strokeStyle = '#8fd3ef'; ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(lx, ay - half); ctx.quadraticCurveTo(lx + w * 2, ay, lx, ay + half); ctx.quadraticCurveTo(lx - w * 2, ay, lx, ay - half); ctx.fill(); ctx.stroke(); ctx.restore();
  L.block(lx - w, ay - half, lx + w, ay + half);
  for (const m of [-2, -1, 1, 2]) { const x = m * f; if (x >= V.x0 && x <= V.x1) line(ctx, [V.X(x), ay - 4], [V.X(x), ay + 4], C.text, 1.5); }
}
// F / 2F names and the stretch note, placed after the rays so the placer can steer around them.
function lensLabels(L, V, f) {
  const ay = V.Y(0);
  for (const m of [-2, -1, 1, 2]) {
    const x = m * f; if (x < V.x0 || x > V.x1) continue;
    const X = V.X(x);
    L.put(Math.abs(m) === 1 ? t('lbF') : t('lb2F'), [[X, ay + 14], [X, ay + 27], [X, ay - 13], [X + 13, ay + 14], [X - 13, ay + 14], [X, ay + 40], [X, ay - 26]], C.muted);
  }
  if (V.k > 1.05) L.put(t('stretch', { k: V.k.toFixed(1) }), [[V.P.r - 90, V.P.b + 12], [V.P.l + 100, V.P.b + 12], [V.P.r - 90, V.P.t + 8]], C.muted);
}
// A candle (or its image) standing on the axis at x with tip height y; flame at the tip.
function candle(ctx, V, x, y, color, { dashed = false, alpha = 1 } = {}) {
  const X = V.X(x), Y0 = V.Y(0), Y1 = V.Y(y), up = y >= 0 ? -1 : 1, bw = 5;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = dashed ? 'rgba(103,215,249,0.10)' : color; ctx.lineWidth = 1.6;
  if (dashed) ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.rect(X - bw / 2, Math.min(Y0, Y1), bw, Math.abs(Y1 - Y0)); ctx.fill(); ctx.stroke();
  const fh = Math.min(14, Math.max(7, Math.abs(Y1 - Y0) * 0.35));
  ctx.beginPath(); ctx.ellipse(X, Y1 + up * fh * 0.55, 4, fh * 0.55, 0, 0, 7);
  ctx.fillStyle = dashed ? 'rgba(255,180,84,0.18)' : C.orange; ctx.fill(); if (dashed) { ctx.strokeStyle = C.orange; ctx.stroke(); }
  ctx.restore();
  return [X - 7, Math.min(Y0, Y1 + up * fh * 1.1), X + 7, Math.max(Y0, Y1 + up * fh * 1.1)];
}
// Draw an after-lens line from the lens plane to the plot edge (forward), and optionally its backward extension.
function afterLens(ctx, V, r, color, { back = false, lw = 2, toX = null } = {}) {
  const [dx, dy] = r.dir, xEnd = toX !== null ? toX : (dx >= 0 ? V.x1 : V.x0), tEnd = (xEnd - 0) / dx;
  const a = [V.X(0), V.Y(r.y0)], b = [V.X(xEnd), V.Y(r.y0 + tEnd * dy)];
  line(ctx, a, b, color, lw);
  if (back) { const tb = (V.x0 - 0) / dx; line(ctx, a, [V.X(V.x0), V.Y(r.y0 + tb * dy)], C.cyan, 1.3, [5, 4], 0.8); }
  return [a, b];
}
const fmt = (v, d = 1) => { const s = (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d); return s.includes('.') ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };

/* ---------- step 0: the focus ---------- */
const s0 = { mode: 'beam', hist: new Set() };
function draw0() {
  const f = num('f0'); s0.hist.add(f);
  $('f0v').textContent = fmt(f) + t('unitCm');
  $('mBeam').setAttribute('aria-pressed', s0.mode === 'beam'); $('mPoint').setAttribute('aria-pressed', s0.mode === 'point');
  const { ctx, W, H } = fitCanvas($('c0'), w => Math.max(230, Math.min(300, w * 0.36 + 60))), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c0title'), W);
  const V = view(W, H, tb + 14, -32, 32, -4.5, 4.5);
  lensFrame(ctx, L, V, f);
  [...s0.hist].forEach(q => { if (q !== f) dotAt(ctx, V.X(q), V.Y(0), 3, C.text); });
  const ys = [-3, -2, -1, 0, 1, 2, 3];
  clipTo(ctx, V);
  if (s0.mode === 'beam') {
    ys.forEach(y => { ray(ctx, [V.X(-32), V.Y(y)], [V.X(0), V.Y(y)], C.orange, 1.8); afterLens(ctx, V, { y0: y, dir: [f, -y] }, C.cyan, { lw: 1.8 }); });
  } else {
    ys.forEach(y => { line(ctx, [V.X(-f), V.Y(0)], [V.X(0), V.Y(y)], C.orange, 1.8); ray(ctx, [V.X(0), V.Y(y)], [V.X(32), V.Y(y)], C.cyan, 1.8); });
    ctx.save(); ctx.shadowColor = C.orange; ctx.shadowBlur = 12; dotAt(ctx, V.X(-f), V.Y(0), 6, C.orange); ctx.restore();
  }
  ctx.restore();
  dotAt(ctx, V.X(s0.mode === 'beam' ? f : -f), V.Y(0), 4.5, C.text);
  lensLabels(L, V, f);
  // focal-length bracket under the axis
  const by = V.Y(-3.9), fx = V.X(s0.mode === 'beam' ? f : -f);
  line(ctx, [V.X(0), by], [fx, by], C.muted, 1.2); line(ctx, [V.X(0), by - 4], [V.X(0), by + 4], C.muted, 1.2); line(ctx, [fx, by - 4], [fx, by + 4], C.muted, 1.2);
  L.put('f = ' + fmt(f) + ' cm', [[(V.X(0) + fx) / 2, by - 11], [(V.X(0) + fx) / 2, by + 11]], C.text);
  const cross = M.beamCross(f, ys.filter(y => y !== 0));
  $('r0').textContent = s0.mode === 'beam' ? t('s0beam', { x: fmt(cross[0], 2), f: fmt(f) }) : t('s0point', { f: fmt(f) });
}

/* ---------- step 1: three construction rays ---------- */
const RAYC = [C.orange, C.green, C.pink];
function draw1() {
  const u = num('u1'), h = num('h1'), f = M.F, im = M.image(u, f), R3 = M.rays(u, h, f);
  $('u1v').textContent = fmt(u) + t('unitCm'); $('h1v').textContent = fmt(h) + t('unitCm');
  const on = [$('ray1').checked, $('ray2').checked, $('ray3').checked];
  const { ctx, W, H } = fitCanvas($('c1'), w => Math.max(250, Math.min(320, w * 0.34 + 80))), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c1title'), W);
  const V = view(W, H, tb + 12, -42, 34, -11, 11);
  lensFrame(ctx, L, V, f);
  const objBox = candle(ctx, V, -u, h, C.orange);
  clipTo(ctx, V);
  R3.forEach((r, i) => {
    if (!on[i] || !r) return;
    const tip = [V.X(-u), V.Y(h)], hit = [V.X(0), V.Y(r.y0)];
    line(ctx, tip, hit, RAYC[i], 2); L.seg(tip, hit);
    const [a, b] = afterLens(ctx, V, r, RAYC[i]); L.seg(a, b);
  });
  ctx.restore();
  const imgBox = candle(ctx, V, im.v, im.M * h, C.cyan);
  L.block(...objBox); L.block(...imgBox);
  const ix = V.X(im.v), iy = V.Y(im.M * h);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ix, iy, 7, 0, 7); ctx.stroke(); ctx.restore();
  L.block(ix - 8, iy - 8, ix + 8, iy + 8);
  lensLabels(L, V, f);
  L.put(t('lbObj'), [[objBox[0] - 18, V.Y(h / 2)], [objBox[2] + 20, V.Y(h / 2)], [V.X(-u), objBox[1] - 10]], C.orange);
  L.put(t('lbImg'), [[imgBox[2] + 18, V.Y(im.M * h / 2)], [imgBox[0] - 18, V.Y(im.M * h / 2)], [ix, iy + 18], [ix + 26, iy]], C.cyan);
  const names = ['①', '②', '③'], act = [0, 1, 2].filter(i => on[i] && R3[i]), meets = [];
  for (let a = 0; a < act.length; a++) for (let b = a + 1; b < act.length; b++) {
    const p = M.meet(R3[act[a]], R3[act[b]]); meets.push(t('s1meet', { a: names[act[a]], b: names[act[b]], x: fmt(p.x, 2), y: fmt(p.y, 2) }));
  }
  const ms = act.length === 0 ? t('s1none') : act.length === 1 ? t('s1one') : meets.join(lang() === 'zh' ? '；' : '; ');
  $('r1').textContent = t('s1readout', { v: fmt(im.v, 2), hi: fmt(im.M * h, 2), meets: ms });
}

/* ---------- step 2: near and far ---------- */
const s2 = { hist: new Set(), sweeping: null };
const ZCOL = { beyond2f: 'rgba(126,226,168,0.55)', between: 'rgba(255,180,84,0.55)', inside: 'rgba(255,122,147,0.55)' };
function draw2() {
  const u = num('u2'), f = M.F, h = M.H, im = M.image(u, f), z = M.zone(u, f);
  $('u2v').textContent = fmt(u) + t('unitCm');
  let { ctx, W, H } = fitCanvas($('c2'), w => Math.max(240, Math.min(300, w * 0.32 + 80))); let L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c2title'), W);
  const V = view(W, H, tb + 14, -42, 46, -8.5, 8.5);
  // zone strip under the axis on the object side
  const sy = V.Y(-7.6);
  [['beyond2f', -42, -2 * f, 'zBeyond'], ['between', -2 * f, -f, 'zBetween'], ['inside', -f, 0, 'zInside']].forEach(([k, a, b, key]) => {
    ctx.save(); ctx.fillStyle = ZCOL[k]; ctx.globalAlpha = k === (z === 'at2f' ? 'between' : z === 'atf' ? 'inside' : z) ? 1 : 0.45; ctx.fillRect(V.X(a), sy - 3, V.X(b) - V.X(a) - 1, 6); ctx.restore();
    L.block(V.X(a), sy - 4, V.X(b), sy + 4);
    L.put(t(key), [[(V.X(a) + V.X(b)) / 2, sy - 13], [(V.X(a) + V.X(b)) / 2, sy + 13]], C.muted);
  });
  lensFrame(ctx, L, V, f);
  // images left behind
  clipTo(ctx, V);
  [...s2.hist].forEach(q => { if (q === u) return; const g = M.image(q, f); if ((g.type === 'real' || g.type === 'virtual') && g.v > V.x0 && g.v < V.x1) candle(ctx, V, g.v, g.M * h, C.cyan, { dashed: g.type === 'virtual', alpha: 0.2 }); });
  ctx.restore();
  const objBox = candle(ctx, V, -u, h, C.orange); L.block(...objBox);
  const R3 = M.rays(u, h, f);
  clipTo(ctx, V);
  [0, 1].forEach(i => { const r = R3[i], tip = [V.X(-u), V.Y(h)], hit = [V.X(0), V.Y(r.y0)]; line(ctx, tip, hit, RAYC[i], 1.8); L.seg(tip, hit); const [a, b] = afterLens(ctx, V, r, RAYC[i], { back: im.type === 'virtual', lw: 1.8 }); L.seg(a, b); });
  ctx.restore();
  lensLabels(L, V, f);
  if (im.type === 'real' || im.type === 'virtual') {
    if (im.v > V.x0 && im.v < V.x1) {
      const box = candle(ctx, V, im.v, im.M * h, C.cyan, { dashed: im.type === 'virtual' }); L.block(...box);
      L.put(t(im.type === 'real' ? 'lbImg' : 'lbVirt'), [[box[2] + 30, V.Y(im.M * h / 2)], [box[0] - 30, V.Y(im.M * h / 2)], [V.X(im.v), box[1] - 10], [V.X(im.v), box[3] + 10]], C.cyan);
    } else L.put(t(im.v > 0 ? 'offRight' : 'offLeft', { v: fmt(Math.abs(im.v)) }), im.v > 0 ? [[V.P.r - 120, V.P.t + 8], [V.P.r - 120, V.P.t + 26]] : [[V.P.l + 130, V.P.t + 8], [V.P.l + 130, V.P.t + 26]], C.cyan);
  }
  L.put(t('lbObj'), [[objBox[0] - 18, V.Y(h / 2)], [objBox[2] + 18, V.Y(h / 2)], [V.X(-u), objBox[1] - 10]], C.orange);

  // chart: v against u
  ({ ctx, W, H } = fitCanvas($('c2b'))); L = labeler(ctx, W, H);
  const tb2 = title(ctx, L, t('c2btitle'), W);
  const P = { l: 40, r: W - 12, t: tb2 + 10, b: H - 24 }, fx = x => P.l + x / 40 * (P.r - P.l), fy = y => P.t + (60 - y) / 120 * (P.b - P.t);
  [['beyond2f', 2 * f, 40], ['between', f, 2 * f], ['inside', 0, f]].forEach(([k, a, b]) => { ctx.save(); ctx.fillStyle = ZCOL[k]; ctx.globalAlpha = 0.12; ctx.fillRect(fx(a), P.t, fx(b) - fx(a), P.b - P.t); ctx.restore(); });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of [-60, -30, 0, 30, 60]) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, fy(v)); ctx.lineTo(P.r, fy(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(String(v), P.l - 5, fy(v)); L.block(P.l - 30, fy(v) - 7, P.l - 3, fy(v) + 7); }
  for (const x of [0, 10, 20, 30, 40]) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(String(x), fx(x), P.b + 5); L.block(fx(x) - 10, P.b + 3, fx(x) + 10, P.b + 18); }
  ctx.restore();
  line(ctx, [fx(f), P.t], [fx(f), P.b], C.pink, 1.1, [4, 4]);
  ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.8;
  for (const [a, b] of [[0.2, f - 0.01], [f + 0.01, 40]]) { ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = a + (b - a) * i / 300, v = M.image(x, f).v; i ? ctx.lineTo(fx(x), fy(Math.max(-200, Math.min(200, v)))) : ctx.moveTo(fx(x), fy(Math.max(-200, Math.min(200, v)))); } ctx.stroke(); }
  [...s2.hist].forEach(q => { const g = M.image(q, f); if (g.v !== null && q !== u) dotAt(ctx, fx(q), fy(g.v), 2.8, C.muted); });
  if (im.v !== null) dotAt(ctx, fx(u), fy(im.v), 5.5, C.cyan);
  ctx.restore();
  line(ctx, [fx(u), P.t], [fx(u), P.b], C.cyan, 1, [3, 4]);
  const prog = s2.sweeping !== null ? t('s2progress', { c: s2.sweeping, N: SWEEP2.length }) : '';
  if (im.type === 'infinity') { $('r2').textContent = t('s2inf', { prog, u: fmt(u) }); return; }
  const d = M.describe(im.M);
  $('r2').textContent = t('s2readout', { prog, u: fmt(u), zone: t('zone_' + z), v: fmt(im.v, 2), m: fmt(im.M, 2), kind: t(im.type === 'real' ? 'kReal' : 'kVirtual'), orient: t(d.upright ? 'up' : 'down'), size: t(d.size), a: fmt(Math.abs(im.M), 2) });
}
const SWEEP2 = []; for (let x = 400; x >= 20; x -= 5) SWEEP2.push(x / 10);

/* ---------- step 3: screen versus eye ---------- */
const s3 = { scene: 'real', eye: false };
const SCENE = { real: 15, mag: 6 };
function blurDraw(ctx, cx, ay, ppc, hScreen, rb, inverted) {
  // the candle image (height hScreen cm, inverted or not) smeared over a disc of radius rb px
  const N = rb < 0.6 ? 1 : 24;
  for (let i = 0; i < N; i++) {
    const a = i * 2.39996, rr = N === 1 ? 0 : rb * Math.sqrt((i + 0.5) / N);
    ctx.save(); ctx.globalAlpha = N === 1 ? 1 : 0.11; ctx.translate(cx + rr * Math.cos(a), ay + rr * Math.sin(a));
    const tip = (inverted ? 1 : -1) * hScreen * ppc;
    ctx.fillStyle = '#d8c7a0'; ctx.fillRect(-3, Math.min(0, tip), 6, Math.abs(tip));
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.ellipse(0, tip + (inverted ? 1 : -1) * 8, 5, 9, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
}
function draw3() {
  const p = num('p3'), f = M.F, h = M.H, u = SCENE[s3.scene], im = M.image(u, f), D = M.APERTURE, b = M.blur(p, u, f);
  const eye = s3.eye && s3.scene === 'mag';
  $('p3v').textContent = fmt(p) + t('unitCm');
  $('sceneReal').setAttribute('aria-pressed', s3.scene === 'real'); $('sceneMag').setAttribute('aria-pressed', s3.scene === 'mag');
  $('eyeBtn').setAttribute('aria-pressed', eye); $('eyeBtn').disabled = s3.scene !== 'mag'; $('p3').disabled = eye;
  let { ctx, W, H } = fitCanvas($('c3')); let L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c3title'), W);
  const V = view(W, H, tb + 14, -18, 62, -9, 9);
  lensFrame(ctx, L, V, f, { half: D / 2 });
  const objBox = candle(ctx, V, -u, h, C.orange); L.block(...objBox);
  const yi = im.M * h, tip = [V.X(-u), V.Y(h)];
  const edge = y0 => ({ y0, dir: [-im.v, y0 - yi] }); // line from the lens edge through (or away from) the image point
  const xEnd = eye ? V.x1 : p;
  clipTo(ctx, V);
  for (const y0 of [D / 2, 0, -D / 2]) {
    const r = y0 === 0 ? { y0: 0, dir: [u, -h] } : edge(y0);
    const dir = r.dir[0] < 0 ? [-r.dir[0], -r.dir[1]] : r.dir;
    line(ctx, tip, [V.X(0), V.Y(y0)], C.orange, y0 === 0 ? 1.2 : 1.8, null, y0 === 0 ? 0.7 : 1);
    afterLens(ctx, V, { y0, dir }, C.orange, { lw: y0 === 0 ? 1.2 : 1.8, toX: xEnd });
    if (im.type === 'virtual' && (eye || y0 !== 0)) line(ctx, [V.X(0), V.Y(y0)], [V.X(im.v), V.Y(yi)], C.cyan, 1.3, [5, 4], 0.85);
  }
  ctx.restore();
  if (im.type === 'virtual' && eye) { const box = candle(ctx, V, im.v, yi, C.cyan, { dashed: true }); L.block(...box); L.put(t('lbVirt'), [[box[0] - 34, V.Y(yi / 2)], [V.X(im.v), box[1] - 10]], C.cyan); }
  if (!eye) {
    // the screen and the light patch it catches
    const sx = V.X(p); line(ctx, [sx, V.P.t], [sx, V.P.b], '#cfd8e3', 4, null, 0.55);
    const yTop = D / 2 + (D / 2 - yi) / (-im.v) * p, yBot = -D / 2 + (-D / 2 - yi) / (-im.v) * p;
    line(ctx, [sx, V.Y(Math.min(9, yTop))], [sx, V.Y(Math.max(-9, yBot))], C.text, 4);
    L.block(sx - 3, V.P.t, sx + 3, V.P.b);
    L.put(t('lbScreen'), [[sx + 26, V.P.t + 8], [sx - 26, V.P.t + 8]], C.text);
  } else {
    const ex = V.X(V.x1) - 18, ey = V.Y(0.6);
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(ex, ey, 12, 8, 0, 0, 7); ctx.stroke(); dotAt(ctx, ex - 4, ey, 4, C.cyan); ctx.restore();
    L.block(ex - 13, ey - 9, ex + 13, ey + 9); L.put(t('lbEye'), [[ex - 4, ey - 20], [ex - 4, ey + 20]], C.text);
  }
  lensLabels(L, V, f);
  // right panel: what appears
  ({ ctx, W, H } = fitCanvas($('c3b'))); L = labeler(ctx, W, H);
  const tb2 = title(ctx, L, t(eye ? 'c3btitleEye' : 'c3btitle'), W);
  const ppc = (H - tb2 - 30) / 26, cx = W / 2, ay = tb2 + 10 + (H - tb2 - 10) / 2;
  ctx.save(); ctx.fillStyle = eye ? '#0d1621' : '#e9edf2'; ctx.globalAlpha = eye ? 1 : 0.08; ctx.fillRect(8, tb2 + 6, W - 16, H - tb2 - 14); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(8, tb2 + 6, W - 16, H - tb2 - 14); ctx.clip();
  if (eye) blurDraw(ctx, cx, ay + Math.abs(yi) * ppc / 2, ppc, Math.abs(yi), 0, false);
  else blurDraw(ctx, cx, ay - (h * p / u) * ppc / 2, ppc, h * p / u, b * ppc / 2, true); // chief ray: patch centre at −h·p/u
  ctx.restore();
  if (eye) $('r3').textContent = t('s3eye', { v: fmt(-im.v), m: fmt(im.M, 2) });
  else if (im.type === 'real') $('r3').textContent = t('s3real', { v: fmt(im.v), p: fmt(p), d: fmt(Math.abs(p - im.v)), b: fmt(b, 2), sharp: b < 1e-9 ? t('s3sharp') : '' });
  else $('r3').textContent = t('s3mag', { v: fmt(-im.v), p: fmt(p), b: fmt(b, 2), D });
}

/* ---------- step 4: three uses ---------- */
const s4 = { dev: 'camera' };
function devWindow(d) {
  const D = M.DEVICES[d]; let vMin = 0, vMax = 0, yMin = 0, yMax = D.h;
  for (let i = 0; i <= 100; i++) { const u = D.uMin + (D.uMax - D.uMin) * i / 100, g = M.image(u, D.f); vMin = Math.min(vMin, g.v); vMax = Math.max(vMax, g.v); yMin = Math.min(yMin, g.M * D.h); yMax = Math.max(yMax, g.M * D.h); }
  const ym = Math.max(-yMin + 1.2, yMax + 1.6); // symmetric about the axis so the lens is centred on it
  return { x0: Math.min(-D.uMax, vMin) - 4, x1: Math.max(vMax, D.f * 1.5) + 6, y0: -ym, y1: ym };
}
function setDevice(d) {
  s4.dev = d; const D = M.DEVICES[d], el = $('u4');
  el.min = D.uMin; el.max = D.uMax; el.step = 0.5; el.value = D.u0; draw4();
}
function draw4() {
  const d = s4.dev, D = M.DEVICES[d], u = num('u4'), im = M.image(u, D.f), dsc = M.describe(im.M), z = M.zone(u, D.f);
  $('u4v').textContent = fmt(u) + t('unitCm');
  [['dCamera', 'camera'], ['dProjector', 'projector'], ['dMagnifier', 'magnifier']].forEach(([id, k]) => $(id).setAttribute('aria-pressed', d === k));
  const { ctx, W, H } = fitCanvas($('c4'), w => Math.max(240, Math.min(300, w * 0.32 + 80))), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c4title_' + d), W);
  const w = devWindow(d), V = view(W, H, tb + 14, w.x0, w.x1, w.y0, w.y1);
  lensFrame(ctx, L, V, D.f);
  const objBox = candle(ctx, V, -u, D.h, C.orange); L.block(...objBox);
  const R3 = M.rays(u, D.h, D.f);
  clipTo(ctx, V);
  [0, 1].forEach(i => { const r = R3[i], tip = [V.X(-u), V.Y(D.h)], hit = [V.X(0), V.Y(r.y0)]; line(ctx, tip, hit, RAYC[i], 1.8); L.seg(tip, hit); const [a, b] = afterLens(ctx, V, r, RAYC[i], { back: im.type === 'virtual', lw: 1.8 }); L.seg(a, b); });
  ctx.restore();
  const box = candle(ctx, V, im.v, im.M * D.h, C.cyan, { dashed: im.type === 'virtual' }); L.block(...box);
  if (im.type === 'real') { const sx = V.X(im.v); line(ctx, [sx + 6, V.P.t + 4], [sx + 6, V.P.b - 4], '#cfd8e3', 3, null, 0.5); L.block(sx + 3, V.P.t, sx + 9, V.P.b); }
  else { const ex = V.P.r - 16, ey = V.Y(D.h * 0.5); ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(ex, ey, 12, 8, 0, 0, 7); ctx.stroke(); dotAt(ctx, ex - 4, ey, 4, C.cyan); ctx.restore(); L.block(ex - 13, ey - 9, ex + 13, ey + 9); L.put(t('lbEye'), [[ex - 4, ey - 20], [ex - 4, ey + 20]], C.text); }
  L.put(t(im.type === 'real' ? 'lbImg' : 'lbVirt'), [[box[2] + 30, V.Y(im.M * D.h / 2)], [box[0] - 30, V.Y(im.M * D.h / 2)], [V.X(im.v), box[1] - 10], [V.X(im.v), box[3] + 10], [V.X(im.v), box[3] + 24], [box[2] + 30, V.Y(0) + 26], [box[0] - 30, V.Y(0) + 26], [V.X(im.v), V.P.b - 6]], C.cyan);
  lensLabels(L, V, D.f);
  L.put(t('lbObj'), [[objBox[0] - 20, V.Y(D.h / 2)], [V.X(-u), objBox[1] - 10], [objBox[2] + 20, V.Y(D.h / 2)]], C.orange);
  const a = Math.abs(im.M);
  $('r4').textContent = t('s4readout', { dev: t(d === 'camera' ? 'dCamera' : d === 'projector' ? 'dProjector' : 'dMagnifier').split(' ')[0], f: D.f, u: fmt(u), zone: t('zone_' + z), v: fmt(im.v, 2), m: fmt(im.M, 2), kind: t(im.type === 'real' ? 'kReal' : 'kVirtual'), orient: t(dsc.upright ? 'up' : 'down'), size: t(dsc.size), note: t('note_' + d, { v: fmt(Math.abs(im.v), 2), a: fmt(a, 2) }) });
}

/* ---------- step 5: quiz ---------- */
const s5 = { checked: false };
function checkQuiz() {
  const Q = M.quiz(), pick = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  // correct options derived from the model: q1 from describe(), q2 from the change in v and |M|, q3 from zone()
  const r1 = Q.q1.d.upright ? 'c' : Q.q1.d.size === 'smaller' ? 'a' : 'b';
  const r2 = Q.q2.v1 > Q.q2.v0 && Math.abs(Q.q2.M1) > Math.abs(Q.q2.M0) ? 'a' : 'b';
  const r3 = { beyond2f: 'a', between: 'b', inside: 'c' }[Q.q3];
  const rows = [['q1', r1, 'fb1ok', 'fb1no', { v: fmt(Q.q1.v), m: fmt(Q.q1.M, 2) }], ['q2', r2, 'fb2ok', 'fb2no', { v0: fmt(Q.q2.v0), v1: fmt(Q.q2.v1), m0: fmt(Q.q2.M0, 2), m1: fmt(Q.q2.M1, 2) }], ['q3', r3, 'fb3ok', 'fb3no', {}]];
  const box = $('quizFeedback'); box.innerHTML = '';
  rows.forEach(([q, right, ok, no, p]) => {
    const v = pick(q), el = document.createElement('p');
    el.textContent = !v ? t('fbNone') : v === right ? t(ok, p) : t(no, p);
    el.className = v === right ? 'ok' : 'no'; el.dataset.state = !v ? 'none' : v === right ? 'correct' : 'wrong';
    box.appendChild(el);
  });
  s5.checked = true;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); if (s5.checked) checkQuiz(); }

function setup() {
  $('f0').addEventListener('input', draw0);
  $('mBeam').addEventListener('click', () => { s0.mode = 'beam'; draw0(); });
  $('mPoint').addEventListener('click', () => { s0.mode = 'point'; draw0(); });
  ['u1', 'h1'].forEach(id => $(id).addEventListener('input', draw1));
  ['ray1', 'ray2', 'ray3'].forEach(id => $(id).addEventListener('change', draw1));
  const set2 = v => { stopAnim('s2'); s2.sweeping = null; $('u2').value = v; s2.hist.add(num('u2')); draw2(); };
  $('u2').addEventListener('input', () => set2(num('u2')));
  $('at2F').addEventListener('click', () => set2(2 * M.F));
  $('atF').addEventListener('click', () => set2(M.F));
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.sweeping = null; s2.hist = new Set([num('u2')]); draw2(); });
  $('sweep2').addEventListener('click', () => {
    s2.hist.clear();
    animate('s2', SWEEP2.length * 110, p => { const k = Math.min(SWEEP2.length - 1, Math.floor(p * SWEEP2.length)); for (let i = 0; i <= k; i++) s2.hist.add(SWEEP2[i]); s2.sweeping = k + 1; $('u2').value = SWEEP2[k]; draw2(); }, () => { s2.sweeping = null; draw2(); });
  });
  s2.hist.add(num('u2'));
  $('p3').addEventListener('input', draw3);
  $('sceneReal').addEventListener('click', () => { s3.scene = 'real'; s3.eye = false; draw3(); });
  $('sceneMag').addEventListener('click', () => { s3.scene = 'mag'; s3.eye = false; draw3(); });
  $('eyeBtn').addEventListener('click', () => { if (s3.scene === 'mag') { s3.eye = !s3.eye; draw3(); } });
  $('u4').addEventListener('input', draw4);
  $('dCamera').addEventListener('click', () => setDevice('camera'));
  $('dProjector').addEventListener('click', () => setDevice('projector'));
  $('dMagnifier').addEventListener('click', () => setDevice('magnifier'));
  setDevice('camera');
  $('checkQuiz').addEventListener('click', checkQuiz);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
