'use strict';
// Interference lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every pixel of the wave pictures, every time trace and every readout is computed from window.WAVE_MODEL
// (model.js) at the current time — the pictures are the model, not a decoration drawn beside it.
// Canvas labels go through a small placer that never lets two labels overlap or leave the canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.WAVE_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: 'rgba(232,237,244,0.22)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { const s = (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d); return s.includes('.') ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };

// Static placeholders inside explanatory text.
window.PAGE_PARAMS = { L: 10 };

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

/* ---------- wave-field rendering ---------- */
// World window seen from above (cm). Sources sit on y = 0; the picture shows y from −1 to 11.
const WIN = { x0: -12, x1: 12, y0: -1, y1: 11 };
const fieldH = w => Math.round(Math.max(170, w * (WIN.y1 - WIN.y0) / (WIN.x1 - WIN.x0) + 34));
function fieldView(W, H, top) {
  const sc = Math.min((W - 12) / (WIN.x1 - WIN.x0), (H - top - 6) / (WIN.y1 - WIN.y0));
  const w = (WIN.x1 - WIN.x0) * sc, h = (WIN.y1 - WIN.y0) * sc, ox = (W - w) / 2, oy = top + Math.max(0, (H - top - 6 - h) / 2);
  return { sc, w, h, ox, oy, X: x => ox + (x - WIN.x0) * sc, Y: y => oy + (WIN.y1 - y) * sc, ix: px => WIN.x0 + (px - ox) / sc, iy: py => WIN.y1 - (py - oy) / sc };
}
const offs = new WeakMap();
// Paint value(x, y) → [r, g, b] on a coarse grid (one sample per ~3 CSS px), then scale it up smoothly.
function paint(ctx, V, colorAt) {
  const cell = V.w > 600 ? 3 : 2.5, gw = Math.max(40, Math.round(V.w / cell)), gh = Math.max(20, Math.round(V.h / cell));
  let off = offs.get(ctx.canvas);
  if (!off || off.width !== gw || off.height !== gh) { off = document.createElement('canvas'); off.width = gw; off.height = gh; offs.set(ctx.canvas, off); }
  const octx = off.getContext('2d'), img = octx.createImageData(gw, gh), d = img.data;
  for (let j = 0; j < gh; j++) {
    const y = WIN.y1 - (j + 0.5) / gh * (WIN.y1 - WIN.y0);
    for (let i = 0; i < gw; i++) {
      const x = WIN.x0 + (i + 0.5) / gw * (WIN.x1 - WIN.x0), c = colorAt(x, y), k = 4 * (j * gw + i);
      d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, V.ox, V.oy, V.w, V.h); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.axis; ctx.strokeRect(V.ox, V.oy, V.w, V.h); ctx.restore();
}
const mix = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const BASE = [22, 44, 76], CREST = [150, 232, 255], TROUGH = [3, 8, 20], DARK = [5, 8, 14], HOT = [255, 196, 110];
// Displacement colour: crest bright cyan, calm water mid blue, trough near black.
const dispColor = (v, vmax) => { const s = Math.max(-1, Math.min(1, v / vmax)); return s >= 0 ? mix(BASE, CREST, s) : mix(BASE, TROUGH, -s); };
// Amplitude colour: 0 (still) black → 2A (loudest) warm white.
const ampColor = B => mix(DARK, HOT, Math.pow(Math.max(0, Math.min(1, B / (2 * M.A))), 1.8));

function sourceMarks(ctx, L, V, srcs, names) {
  srcs.forEach((s, i) => {
    const x = V.X(s.x), y = V.Y(s.y);
    ctx.save(); ctx.fillStyle = C.text; ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    L.block(x - 6, y - 6, x + 6, y + 6);
  });
  srcs.forEach((s, i) => { const x = V.X(s.x), y = V.Y(s.y); L.put(names[i], [[x, y + 14], [x - 18, y - 4], [x + 18, y - 4], [x, y - 16]], C.text, '600'); });
}
function pointMark(ctx, L, V, P) {
  const x = V.X(P.x), y = V.Y(P.y);
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke();
  ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 9.5, 0, 7); ctx.stroke(); ctx.restore();
  L.block(x - 10, y - 10, x + 10, y + 10);
  L.put(t('lbP'), [[x + 18, y - 12], [x - 18, y - 12], [x + 18, y + 12], [x - 18, y + 12], [x, y - 22], [x, y + 22]], C.pink, '700');
}
function overlayLines(ctx, V, d, lam, phi) {
  const Ls = M.lines(d, lam, phi);
  ctx.save(); ctx.beginPath(); ctx.rect(V.ox, V.oy, V.w, V.h); ctx.clip();
  const draw = (c, color, dash, lw) => {
    const pts = M.hyperbola(c, d, WIN.y1, 90); if (!pts) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(V.X(p.x), V.Y(p.y)) : ctx.moveTo(V.X(p.x), V.Y(p.y)))); ctx.stroke(); ctx.restore();
  };
  Ls.loud.forEach(c => draw(c, 'rgba(255,255,255,0.75)', null, 1.4));
  Ls.still.forEach(c => draw(c, C.pink, [5, 4], 1.6));
  ctx.restore();
  return Ls;
}

// Time trace: series drawn over the window [t − span, t] (now at the right edge), computed analytically.
function trace(canvas, ttl, span, series, yMax, yTicks, heightFor) {
  const { ctx, W, H } = fitCanvas(canvas, heightFor), L = labeler(ctx, W, H);
  const tb = title(ctx, L, ttl, W);
  const P = { l: 34, r: W - 10, t: tb + 12, b: H - 24 };
  const fx = s => P.l + (s + span) / span * (P.r - P.l), fy = v => P.t + (yMax - v) / (2 * yMax) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, fy(v)); ctx.lineTo(P.r, fy(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(fmt(v), P.l - 5, fy(v)); L.block(P.l - 28, fy(v) - 7, P.l - 3, fy(v) + 7); }
  const step = span <= 4 ? 1 : 5;
  for (let s = -span; s <= 1e-9; s += step) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; const lab = (s === 0 ? '0' : fmt(s)) + ' s'; ctx.fillText(lab, Math.min(P.r - 12, Math.max(P.l + 10, fx(s))), P.b + 5); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 2, P.r - P.l, P.b - P.t + 4); ctx.clip();
  const n = Math.max(200, Math.round((P.r - P.l) * (span > 4 ? 3 : 1.5)));
  for (const S of series) {
    ctx.strokeStyle = S.color; ctx.lineWidth = S.lw; ctx.globalAlpha = S.alpha || 1; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const s = -span + span * i / n, v = S.fn(clock.t + s); i ? ctx.lineTo(fx(s), fy(v)) : ctx.moveTo(fx(s), fy(v)); }
    ctx.stroke();
  }
  ctx.restore();
  return { ctx, L, P, fx, fy };
}
const traceH = c => w => { const f = c.previousElementSibling || c.nextElementSibling; return f && f.offsetTop === c.offsetTop && f.clientWidth ? Number(f.dataset.h || fieldH(f.clientWidth)) : 200; };

/* ---------- clock: one shared time, paused under reduced motion until the reader presses play ---------- */
const clock = { t: 0.15, playing: !reduceMotion(), last: null, raf: null };
const visible = new Set([0, 1, 2, 3, 4, 5]);
const ANIM = [0, 1, 2, 4];
function playLabels() { ['play0', 'play1', 'play2', 'play4'].forEach(id => { $(id).textContent = t(clock.playing ? 'play' : 'resume'); $(id).setAttribute('aria-pressed', String(!clock.playing)); }); }
function tick(now) {
  clock.raf = null;
  if (!clock.playing || document.hidden) { clock.last = null; return; }
  if (clock.last !== null) clock.t += Math.min(0.1, (now - clock.last) / 1000);
  clock.last = now;
  ANIM.forEach(i => { if (visible.has(i)) DRAW[i](); });
  clock.raf = requestAnimationFrame(tick);
}
function startLoop() { if (clock.playing && !clock.raf && !document.hidden) { clock.last = null; clock.raf = requestAnimationFrame(tick); } }
function togglePlay() { clock.playing = !clock.playing; playLabels(); if (clock.playing) startLoop(); }

/* ---------- step 0: one wave ---------- */
function P0() { return { x: num('px0'), y: num('py0') }; }
function draw0() {
  const P = P0(), lam = num('lam0'), S = { x: 0, y: 0 }, r = Math.hypot(P.x, P.y);
  $('px0v').textContent = fmt(P.x) + t('unitCm'); $('py0v').textContent = fmt(P.y) + t('unitCm'); $('lam0v').textContent = fmt(lam) + t('unitCm');
  const { ctx, W, H } = fitCanvas($('c0'), fieldH), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c0title'), W), V = fieldView(W, H, tb + 6); ctx.canvas._view = V;
  const tt = clock.t;
  paint(ctx, V, (x, y) => dispColor(M.wave(Math.hypot(x, y), tt, lam), M.A * 1.05));
  L.block(V.ox, V.oy + V.h - 1, V.ox + V.w, V.oy + V.h + 1);
  // λ bracket between two neighbouring crests, along the upper-left diagonal
  const ph = ((tt - 0.25) % 1 + 1) % 1, r0 = lam * ph + lam * Math.ceil((2.2 - lam * ph) / lam);
  const ux = -Math.SQRT1_2, uy = Math.SQRT1_2, a = [V.X(ux * r0), V.Y(uy * r0)], b = [V.X(ux * (r0 + lam)), V.Y(uy * (r0 + lam))];
  if (r0 + lam < 10.5) {
    line(ctx, a, b, C.orange, 2.2); [a, b].forEach(p => dotAt(ctx, p[0], p[1], 3.5, C.orange));
    L.seg(a, b); L.put(t('lbLam'), [[(a[0] + b[0]) / 2 - 12, (a[1] + b[1]) / 2 - 12], [(a[0] + b[0]) / 2 + 12, (a[1] + b[1]) / 2 + 12]], C.orange, '700');
  }
  line(ctx, [V.X(0), V.Y(0)], [V.X(P.x), V.Y(P.y)], C.text, 1, [3, 4], 0.7);
  sourceMarks(ctx, L, V, [S], [t('lbS')]);
  pointMark(ctx, L, V, P);
  L.put(t('slow'), [[V.ox + V.w - 80, V.oy + 12], [V.ox + 90, V.oy + 12]], C.muted);
  const T = trace($('c0b'), t('c0btitle'), 3, [{ fn: s => M.wave(r, s, lam), color: C.cyan, lw: 2.2 }], 1.3, [-1, 0, 1], traceH($('c0b')));
  const yNow = M.wave(r, tt, lam); dotAt(T.ctx, T.fx(0), T.fy(yNow), 4.5, C.cyan);
  $('r0').textContent = t('s0readout', { r: fmt(r, 2), c: fmt(r / lam, 2), lag: fmt(r / lam * 1, 2), A: fmt(M.A), T: fmt(1 / M.F1), y: fmt(yNow, 2) });
}

/* ---------- step 1: two waves add at a point ---------- */
const D1 = 6, LAM1 = 2;
function draw1() {
  const P = s1exact || { x: num('px1'), y: num('py1') }, o = { d: D1, lam: LAM1 }, info = M.pointInfo(P.x, P.y, o), S = M.sources(D1);
  $('px1v').textContent = fmt(P.x, 2) + t('unitCm'); $('py1v').textContent = fmt(P.y, 2) + t('unitCm');
  const { ctx, W, H } = fitCanvas($('c1'), fieldH), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c1title'), W), V = fieldView(W, H, tb + 6), tt = clock.t; ctx.canvas._view = V;
  paint(ctx, V, (x, y) => dispColor(M.field(x, y, tt, o), 2.1));
  line(ctx, [V.X(S[0].x), V.Y(0)], [V.X(P.x), V.Y(P.y)], C.orange, 1.6, null, 0.9);
  line(ctx, [V.X(S[1].x), V.Y(0)], [V.X(P.x), V.Y(P.y)], C.green, 1.6, null, 0.9);
  sourceMarks(ctx, L, V, S, [t('lbS1'), t('lbS2')]);
  pointMark(ctx, L, V, P);
  L.put(t('slow'), [[V.ox + V.w - 80, V.oy + 12], [V.ox + 90, V.oy + 12]], C.muted);
  const T = trace($('c1b'), t('c1btitle'), 3, [
    { fn: s => M.wave(info.r1, s, LAM1), color: C.orange, lw: 1.4, alpha: 0.9 },
    { fn: s => M.wave(info.r2, s, LAM1), color: C.green, lw: 1.4, alpha: 0.9 },
    { fn: s => M.field(P.x, P.y, s, o), color: C.text, lw: 2.8 }], 2.3, [-2, -1, 0, 1, 2], traceH($('c1b')));
  dotAt(T.ctx, T.fx(0), T.fy(M.field(P.x, P.y, tt, o)), 4.5, C.text);
  $('r1').textContent = t('s1readout', { r1: fmt(info.r1, 2), r2: fmt(info.r2, 2), dr: fmt(info.dr, 2), c: fmt(info.cycles, 2), B: fmt(info.B, 2), kind: t('kind_' + info.kind) });
}
// Presets place P exactly on the chosen path difference (the 0.1 cm slider grid would round it off).
let s1exact = null;
function preset1(c) { const x = M.pointWithDelta(c, 6, D1); s1exact = { x, y: 6 }; $('py1').value = 6; $('px1').value = x; draw1(); }

/* ---------- step 2: the whole map ---------- */
const s2 = { view: 'field', P: { x: 1, y: 7 } };
function draw2() {
  const lam = num('lam2'), d = num('d2'), o = { d, lam }, tt = clock.t, P = s2.P, info = M.pointInfo(P.x, P.y, o);
  $('lam2v').textContent = fmt(lam) + t('unitCm'); $('d2v').textContent = fmt(d) + t('unitCm');
  $('vField').setAttribute('aria-pressed', s2.view === 'field'); $('vAmp').setAttribute('aria-pressed', s2.view === 'amp');
  const { ctx, W, H } = fitCanvas($('c2'), w => fieldH(w) + 8), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t(s2.view === 'field' ? 'c2title_field' : 'c2title_amp'), W), V = fieldView(W, H, tb + 6); ctx.canvas._view = V;
  if (s2.view === 'field') paint(ctx, V, (x, y) => dispColor(M.field(x, y, tt, o), 2.1));
  else paint(ctx, V, (x, y) => ampColor(M.pointInfo(x, y, o).B));
  const Ls = $('lines2').checked ? overlayLines(ctx, V, d, lam, 0) : M.lines(d, lam, 0);
  sourceMarks(ctx, L, V, M.sources(d), [t('lbS1'), t('lbS2')]);
  pointMark(ctx, L, V, P);
  $('r2').textContent = t('s2readout', { d: fmt(d), lam: fmt(lam), nl: Ls.loud.length, ns: Ls.still.length, c: fmt(info.cycles, 2), B: fmt(info.B, 2) });
}

/* ---------- step 3: phase difference ---------- */
const s3 = { P: { x: 0, y: 7 } };
const D3 = 6, LAM3 = 2;
function draw3() {
  const phiDeg = num('phi3'), phi = phiDeg * Math.PI / 180, o = { d: D3, lam: LAM3, phi }, P = s3.P, info = M.pointInfo(P.x, P.y, o);
  $('phi3v').textContent = phiDeg + '°';
  const { ctx, W, H } = fitCanvas($('c3'), w => fieldH(w) + 8), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c3title'), W), V = fieldView(W, H, tb + 6); ctx.canvas._view = V;
  paint(ctx, V, (x, y) => ampColor(M.pointInfo(x, y, o).B));
  overlayLines(ctx, V, D3, LAM3, phi);
  sourceMarks(ctx, L, V, M.sources(D3), [t('lbS1'), t('lbS2')]);
  pointMark(ctx, L, V, P);
  const path = 360 * info.dr / LAM3, delta = path + phiDeg, red = ((delta % 360) + 360) % 360;
  $('r3').textContent = t('s3readout', { path: fmt(path, 1), phi: phiDeg, delta: fmt(delta, 1), red: fmt(red, 1), B: fmt(info.B, 2), kind: t('kind_' + info.kind) });
}

/* ---------- step 4: different frequencies ---------- */
const s4 = { P: { x: 2, y: 7 } };
const D4 = 6, LAM4 = 2;
function draw4() {
  const ratio = num('ratio4'), o = { d: D4, lam: LAM4, ratio }, tt = clock.t, P = s4.P;
  $('ratio4v').textContent = ratio.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c4'), fieldH), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c4title'), W), V = fieldView(W, H, tb + 6); ctx.canvas._view = V;
  paint(ctx, V, (x, y) => ampColor(M.envelope(x, y, tt, o)));
  sourceMarks(ctx, L, V, M.sources(D4), [t('lbS1'), t('lbS2')]);
  pointMark(ctx, L, V, P);
  trace($('c4b'), t('c4btitle'), 20, [
    { fn: s => M.envelope(P.x, P.y, s, o), color: C.orange, lw: 1.4, alpha: 0.85 },
    { fn: s => -M.envelope(P.x, P.y, s, o), color: C.orange, lw: 1.4, alpha: 0.85 },
    { fn: s => M.field(P.x, P.y, s, o), color: C.cyan, lw: 1 }], 2.3, [-2, 0, 2], traceH($('c4b')));
  const B = M.envelope(P.x, P.y, tt, o), df = M.F1 * ratio - M.F1;
  $('r4').textContent = Math.abs(df) < 1e-9 ? t('s4stable', { B: fmt(B, 2) }) : t('s4beat', { df: fmt(df, 2), dps: fmt(360 * df, 1), Tb: fmt(M.beatPeriod(ratio), 1), B: fmt(B, 2) });
}

/* ---------- step 5: measuring λ ---------- */
const L5 = window.PAGE_PARAMS.L; // detector line distance (cm), also quoted in s5e
function draw5() {
  const lam = num('lam5'), d = num('d5'), o = { d, lam }, sc = M.screen(d, lam, L5);
  $('lam5v').textContent = fmt(lam) + t('unitCm'); $('d5v').textContent = fmt(d) + t('unitCm');
  let { ctx, W, H } = fitCanvas($('c5'), fieldH); let L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c5title'), W), V = fieldView(W, H, tb + 6); ctx.canvas._view = V;
  paint(ctx, V, (x, y) => ampColor(M.pointInfo(x, y, o).B));
  line(ctx, [V.ox, V.Y(L5)], [V.ox + V.w, V.Y(L5)], C.cyan, 1.6, [6, 4]);
  sc.exact.forEach(e => { if (e.x > WIN.x0 && e.x < WIN.x1) dotAt(ctx, V.X(e.x), V.Y(L5), 3.5, C.cyan); });
  sourceMarks(ctx, L, V, M.sources(d), [t('lbS1'), t('lbS2')]);
  L.put('L = ' + L5 + ' cm', [[V.ox + 44, V.Y(L5 / 2)], [V.ox + V.w - 44, V.Y(L5 / 2)]], C.cyan);
  // amplitude along the detector line
  ({ ctx, W, H } = fitCanvas($('c5b'))); L = labeler(ctx, W, H);
  const tb2 = title(ctx, L, t('c5btitle'), W);
  const P = { l: 34, r: W - 10, t: tb2 + 12, b: H - 24 }, fx = x => P.l + (x - WIN.x0) / (WIN.x1 - WIN.x0) * (P.r - P.l), fy = v => P.b - v / 2.2 * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of [0, 1, 2]) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, fy(v)); ctx.lineTo(P.r, fy(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(String(v), P.l - 5, fy(v)); }
  const xs = W < 420 ? [-10, 0, 10] : [-10, -5, 0, 5, 10];
  for (const x of xs) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(String(x), fx(x), P.b + 5); }
  ctx.restore();
  sc.exact.forEach(e => { if (e.x > WIN.x0 && e.x < WIN.x1) line(ctx, [fx(e.x), P.t], [fx(e.x), P.b], C.cyan, 1, null, 0.45); });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 600; i++) { const x = WIN.x0 + (WIN.x1 - WIN.x0) * i / 600, B = M.pointInfo(x, L5, o).B; i ? ctx.lineTo(fx(x), fy(B)) : ctx.moveTo(fx(x), fy(B)); }
  ctx.stroke(); ctx.restore();
  sc.approx.forEach(a => { if (a.x > WIN.x0 && a.x < WIN.x1) { const X = fx(a.x), Y = fy(2.08); ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(X, Y - 7); ctx.lineTo(X - 5, Y + 2); ctx.lineTo(X + 5, Y + 2); ctx.closePath(); ctx.fill(); ctx.restore(); } });
  if (sc.x1 === null) { $('r5').textContent = t('s5none', { d: fmt(d), lam: fmt(lam) }); return; }
  const errPct = sc.err * 100;
  $('r5').textContent = t('s5readout', { x1: fmt(sc.x1, 2), xa: fmt(sc.x1approx, 2), est: fmt(sc.lamEst, 2), lam: fmt(lam), err: fmt(errPct, 1), note: Math.abs(errPct) < 5 ? t('s5good') : t('s5bad') });
}

/* ---------- step 6: quiz ---------- */
const s6 = { checked: false };
function checkQuiz() {
  const Q = M.quiz(), pick = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const r1 = { loud: 'a', still: 'b', partial: 'c' }[Q.q1];
  const r2 = Q.q2[1] === 'loud' ? 'b' : Q.q2[1] === 'still' ? 'a' : 'c';
  const r3 = Q.q3 === 'still' ? (Q.q3amp.every(a => a > 1e-6) ? 'c' : 'b') : 'a';
  const rows = [['q1', r1, 'fb1ok', 'fb1no'], ['q2', r2, 'fb2ok', 'fb2no'], ['q3', r3, 'fb3ok', 'fb3no']];
  const box = $('quizFeedback'); box.innerHTML = '';
  rows.forEach(([q, right, ok, no]) => {
    const v = pick(q), el = document.createElement('p');
    el.textContent = !v ? t('fbNone') : v === right ? t(ok) : t(no);
    el.className = v === right ? 'ok' : 'no'; el.dataset.state = !v ? 'none' : v === right ? 'correct' : 'wrong';
    box.appendChild(el);
  });
  s6.checked = true;
}

const DRAW = [draw0, draw1, draw2, draw3, draw4, draw5];
function refresh() { playLabels(); DRAW.forEach(f => f()); if (s6.checked) checkQuiz(); }

// Clicking/dragging on a field picture moves that step's point P (sliders remain the keyboard route).
function pickOn(canvas, set) {
  let on = false;
  canvas.classList.add('drag');
  const go = e => {
    const r = canvas.getBoundingClientRect(), V = canvas._view; if (!V) return;
    const x = V.ix(e.clientX - r.left), y = V.iy(e.clientY - r.top);
    if (x < WIN.x0 || x > WIN.x1 || y < 0 || y > WIN.y1 - 0.5) return;
    set(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  };
  canvas.addEventListener('pointerdown', e => { on = true; canvas.setPointerCapture(e.pointerId); go(e); });
  canvas.addEventListener('pointermove', e => { if (on) go(e); });
  canvas.addEventListener('pointerup', () => { on = false; }); canvas.addEventListener('pointercancel', () => { on = false; });
}

function setup() {
  ['px0', 'py0', 'lam0'].forEach(id => $(id).addEventListener('input', draw0));
  pickOn($('c0'), (x, y) => { $('px0').value = x; $('py0').value = y; draw0(); });
  ['px1', 'py1'].forEach(id => $(id).addEventListener('input', () => { s1exact = null; draw1(); }));
  pickOn($('c1'), (x, y) => { s1exact = null; $('px1').value = x; $('py1').value = y; draw1(); });
  $('d0').addEventListener('click', () => preset1(0));
  $('dHalf').addEventListener('click', () => preset1(LAM1 / 2));
  $('dOne').addEventListener('click', () => preset1(LAM1));
  ['lam2', 'd2'].forEach(id => $(id).addEventListener('input', draw2));
  $('lines2').addEventListener('change', draw2);
  $('vField').addEventListener('click', () => { s2.view = 'field'; draw2(); });
  $('vAmp').addEventListener('click', () => { s2.view = 'amp'; draw2(); });
  pickOn($('c2'), (x, y) => { s2.P = { x, y }; draw2(); });
  $('phi3').addEventListener('input', draw3);
  $('phiA').addEventListener('click', () => { $('phi3').value = 0; draw3(); });
  $('phiB').addEventListener('click', () => { $('phi3').value = 180; draw3(); });
  pickOn($('c3'), (x, y) => { s3.P = { x, y }; draw3(); });
  $('ratio4').addEventListener('input', draw4);
  pickOn($('c4'), (x, y) => { s4.P = { x, y }; draw4(); });
  ['lam5', 'd5'].forEach(id => $(id).addEventListener('input', draw5));
  ['play0', 'play1', 'play2', 'play4'].forEach(id => $(id).addEventListener('click', togglePlay));
  $('checkQuiz').addEventListener('click', checkQuiz);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    // only steps on screen are redrawn by the animation loop
    const vis = new IntersectionObserver(es => es.forEach(e => { const i = steps.indexOf(e.target); if (e.isIntersecting) visible.add(i); else visible.delete(i); }));
    visible.clear(); steps.forEach(s => vis.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (clock.raf) cancelAnimationFrame(clock.raf); clock.raf = null; clock.last = null; } else startLoop(); });
  window.refreshPage = refresh;
  refresh();
  startLoop();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
