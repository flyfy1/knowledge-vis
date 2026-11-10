'use strict';
// Pinhole-camera lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ray is a straight segment between two points computed by window.PH_MODEL (model.js); shadow edges,
// image points and blur spots are the same numbers the readouts print. Canvas text: point letters (A, B, A′, B′),
// distance letters (u, v) and chart ticks, laid out so they cannot collide; everything else lives in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PH_MODEL;
const t = (...a) => window.PH_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffe27a', dim: '#6d6447', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', board: '#55657a', screen: '#dfe6ee', candle: '#f3efe6', ghost: '#8696aa' };
const SPOTCOL = [C.orange, C.pink, C.green, C.violet, C.cyan];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const f1 = v => (Math.abs(v) < 0.05 ? 0 : v).toFixed(1);   // lengths: one decimal
const f2 = v => v.toFixed(2);                              // ratios: two decimals

// Canvas sizing: CSS width from layout; CSS height either fixed (height attribute) or width × data-aspect,
// clamped to [data-min, data-max]. The bitmap follows the DPR; drawing uses CSS px.
function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  let height;
  if (canvas.dataset.aspect) height = Math.round(Math.min(Number(canvas.dataset.max), Math.max(Number(canvas.dataset.min), width * Number(canvas.dataset.aspect))));
  else { if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300; height = Number(canvas.dataset.h); }
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// World (cm) → canvas px with one scale for both axes, so angles and ratios on screen are true.
function view(W, H, box, pad = 14) {
  const s = Math.min((W - 2 * pad) / (box.z1 - box.z0), (H - 2 * pad) / (box.y1 - box.y0));
  const ox = (W - s * (box.z1 - box.z0)) / 2, oy = (H - s * (box.y1 - box.y0)) / 2;
  return { s, X: z => ox + (z - box.z0) * s, Y: y => oy + (box.y1 - y) * s, z: X => box.z0 + (X - ox) / s };
}
function seg(ctx, x0, y0, x1, y1, color, lw = 1.6, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
// Polyline along given points, drawn only up to fraction p of its length.
function partial(ctx, pts, p, color, lw = 2, alpha = 1) {
  const lens = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let left = Math.max(0, Math.min(1, p)) * total;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let head = pts[0];
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i - 1]);
    head = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    ctx.lineTo(head[0], head[1]); left -= lens[i - 1];
  }
  ctx.stroke(); ctx.restore();
  return { head, done: p >= 1 - 1e-9, total };
}
const dot = (ctx, X, Y, r, fill) => { ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); };
// Letter labels for one column: keep at least `gap` px apart vertically and inside the canvas.
function labels(ctx, items, H, gap = 14) {
  const sorted = items.slice().sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) if (sorted[i].y - sorted[i - 1].y < gap) sorted[i].y = sorted[i - 1].y + gap;
  const over = sorted.length ? sorted[sorted.length - 1].y - (H - 6) : 0; if (over > 0) sorted.forEach(l => { l.y -= over; });
  const under = sorted.length ? 12 - sorted[0].y : 0; if (under > 0) sorted.forEach(l => { l.y += under; });
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.textBaseline = 'middle';
  sorted.forEach(l => { ctx.fillStyle = l.color; ctx.textAlign = l.align || 'left'; ctx.fillText(l.text, l.x, l.y); });
  ctx.restore();
}
// Side-view candle at z = −u, height H, centred on the axis; width 0.22H (same proportions as the front view).
function sideCandle(ctx, V, u, H) {
  const P = M.candleParts(H), w = Math.max(6, H * 0.22), bodyTop = P.white[2][1];
  ctx.save(); ctx.fillStyle = C.candle; ctx.fillRect(V.X(-u - w / 2), V.Y(bodyTop), w * V.s, (bodyTop + H / 2) * V.s);
  ctx.fillStyle = C.orange; ctx.beginPath(); P.flame.forEach(([r, y], i) => { const X = V.X(-u + r), Y = V.Y(y); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.closePath(); ctx.fill(); ctx.restore();
}
// The image painted on the screen, seen side-on: an upside-down candle of height h just right of the screen line.
function sideImage(ctx, V, v, H, ratio, alpha = 1) {
  const P = M.candleParts(H), w = Math.max(6, H * 0.22) * ratio, bodyTop = P.white[2][1];
  const x0 = V.X(v) + 3, k = ratio;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(243,239,230,0.85)';
  ctx.fillRect(x0, V.Y(H / 2 * k), Math.max(2, w * V.s * 0.5), (bodyTop + H / 2) * k * V.s);
  const rMax = Math.max(...P.flame.map(q => q[0]));
  ctx.fillStyle = C.orange; ctx.beginPath(); P.flame.forEach(([r, y], i) => { const X = x0 + (r + rMax) * k * V.s * 0.5, Y = V.Y(-y * k); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.closePath(); ctx.fill(); ctx.restore();
}
function board(ctx, V, y0, y1, hole, marks = false) {
  ctx.save(); ctx.strokeStyle = C.board; ctx.lineWidth = 5; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(V.X(0), V.Y(y1)); ctx.lineTo(V.X(0), V.Y(hole / 2) - 1); ctx.moveTo(V.X(0), V.Y(-hole / 2) + 1); ctx.lineTo(V.X(0), V.Y(y0)); ctx.stroke();
  if (marks) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; [hole / 2, -hole / 2].forEach(e => { ctx.beginPath(); ctx.moveTo(V.X(0) - 7, V.Y(e)); ctx.lineTo(V.X(0) + 7, V.Y(e)); ctx.stroke(); }); }
  ctx.restore();
}
function screenLine(ctx, V, z, half) { seg(ctx, V.X(z), V.Y(half), V.X(z), V.Y(-half), C.screen, 3.5); }
function dim(ctx, V, z0, z1, y, text) {
  const X0 = V.X(z0), X1 = V.X(z1), Y = V.Y(y);
  seg(ctx, X0, Y, X1, Y, C.muted, 1); seg(ctx, X0, Y - 4, X0, Y + 4, C.muted, 1); seg(ctx, X1, Y - 4, X1, Y + 4, C.muted, 1);
  ctx.save(); ctx.font = 'italic 600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.muted;
  const w = ctx.measureText(text).width + 8; ctx.fillStyle = C.bg; ctx.fillRect((X0 + X1) / 2 - w / 2, Y - 8, w, 16);
  ctx.fillStyle = C.muted; ctx.textBaseline = 'middle'; ctx.fillText(text, (X0 + X1) / 2, Y); ctx.restore();
}

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

/* ---------- step 0: shadows ---------- */
const s0 = { p: 1 };
const BOX0 = { z0: -8, z1: 108, y0: -47, y1: 47 };
function draw0() {
  const c = num('cpos'); $('c0v').textContent = String(c);
  const { ctx, W, H } = fitCanvas($('c0')), V = view(W, H, BOX0);
  const sh = M.shadow(c), rays = M.fan(c, 25, 0.45);
  // lit part of the screen first, then the shadow on top
  screenLine(ctx, V, M.SCREEN0, 45);
  const maxLen = Math.max(...rays.map(r => Math.hypot(r.end.z, r.end.y)));
  let finished = 0;
  rays.forEach(r => {
    const len = Math.hypot(r.end.z, r.end.y), p = Math.min(1, s0.p * maxLen / len);
    const out = partial(ctx, [[V.X(0), V.Y(0)], [V.X(r.end.z), V.Y(r.end.y)]], p, r.blocked ? C.dim : C.yellow, 1.4, r.blocked ? 0.9 : 0.75);
    if (out.done) { finished++; if (!r.blocked) dot(ctx, V.X(r.end.z), V.Y(r.end.y), 2.6, C.yellow); }
    else dot(ctx, out.head[0], out.head[1], 3.2, r.blocked ? '#c9b46a' : C.yellow);
  });
  if (s0.p >= 1) {
    ctx.save(); ctx.fillStyle = '#05080c'; ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5;
    ctx.fillRect(V.X(M.SCREEN0) - 3, V.Y(sh.top), 9, sh.height * V.s); ctx.strokeRect(V.X(M.SCREEN0) - 3, V.Y(sh.top), 9, sh.height * V.s); ctx.restore();
  }
  // straight lines lamp → card edge → screen
  [M.CARD_HALF, -M.CARD_HALF].forEach(e => seg(ctx, V.X(0), V.Y(0), V.X(M.SCREEN0), V.Y(e * M.SCREEN0 / c), C.ghost, 1.2, [5, 4]));
  ctx.save(); ctx.fillStyle = '#8b98a8'; ctx.fillRect(V.X(c) - 3, V.Y(M.CARD_HALF), 6, 2 * M.CARD_HALF * V.s); ctx.restore();
  ctx.save(); ctx.shadowColor = C.yellow; ctx.shadowBlur = 14; dot(ctx, V.X(0), V.Y(0), 6, C.yellow); ctx.restore();
  const prog = s0.p < 1 ? t('s0prog', { k: finished, N: rays.length }) : '';
  $('r0').textContent = t('s0readout', { prog, c, top: f1(Math.abs(sh.top)), bot: f1(Math.abs(sh.bot)), sh: f1(sh.height) });
}

/* ---------- step 1: one tiny hole ---------- */
const S1 = { H: 60, u: 90, v: 60 };
const s1 = { p: 3 };
const BOX1 = { z0: -112, z1: 92, y0: -40, y1: 40 };
function draw1() {
  const { H, u, v } = S1, im = M.image(H, u, v), p = s1.p;
  const { ctx, W, H: CH } = fitCanvas($('c1')), V = view(W, CH, BOX1);
  board(ctx, V, -38, 38, 0.8); screenLine(ctx, V, v, 37);
  sideCandle(ctx, V, u, H);
  // faint rays from other candle points (phase 3)
  if (p > 2) for (let i = 1; i < 8; i++) { const y0 = H / 2 - i * H / 8, hit = M.crossAt({ z: -u, y: y0 }, { z: 0, y: 0 }, v); seg(ctx, V.X(-u), V.Y(y0), V.X(v), V.Y(hit.y), C.muted, 1, null, 0.35 * Math.min(1, p - 2)); }
  partial(ctx, [[V.X(-u), V.Y(im.A.y)], [V.X(0), V.Y(0)], [V.X(v), V.Y(im.Ai.y)]], Math.min(1, p), C.orange, 2.2);
  if (p > 1) partial(ctx, [[V.X(-u), V.Y(im.B.y)], [V.X(0), V.Y(0)], [V.X(v), V.Y(im.Bi.y)]], Math.min(1, p - 1), C.cyan, 2.2);
  if (p > 2) sideImage(ctx, V, v, H, v / u, Math.min(1, p - 2));
  dot(ctx, V.X(-u), V.Y(im.A.y), 4, C.orange); dot(ctx, V.X(-u), V.Y(im.B.y), 4, C.cyan);
  if (p >= 1) dot(ctx, V.X(v), V.Y(im.Ai.y), 4, C.orange);
  if (p >= 2) dot(ctx, V.X(v), V.Y(im.Bi.y), 4, C.cyan);
  const lw = Math.max(6, H * 0.22) / 2 * V.s + 8;
  labels(ctx, [{ text: 'A', x: V.X(-u) - lw, y: V.Y(im.A.y), color: C.orange, align: 'right' }, { text: 'B', x: V.X(-u) - lw, y: V.Y(im.B.y), color: C.cyan, align: 'right' }], CH);
  const right = []; if (p >= 1) right.push({ text: 'A′', x: V.X(v) + 18, y: V.Y(im.Ai.y), color: C.orange }); if (p >= 2) right.push({ text: 'B′', x: V.X(v) + 18, y: V.Y(im.Bi.y), color: C.cyan });
  labels(ctx, right, CH);
  drawFront1(p > 2 ? Math.min(1, p - 2) : 0);
  const prog = p < 3 ? t('s1prog', { k: Math.min(3, Math.floor(p) + 1), N: 3 }) : '';
  $('r1').textContent = t('s1readout', { prog, ya: f1(Math.abs(im.Ai.y)), yb: f1(Math.abs(im.Bi.y)) });
}
// Front view: candle as seen from behind it facing the screen, and the image on the screen, same scale.
function frontShape(ctx, parts, map, X, Y, s, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  const poly = (pts, color) => { ctx.fillStyle = color; ctx.beginPath(); pts.forEach(([r, y], i) => { const q = map(r, y); if (!i) ctx.moveTo(X + q.x * s, Y - q.y * s); else ctx.lineTo(X + q.x * s, Y - q.y * s); }); ctx.closePath(); ctx.fill(); };
  poly(parts.white, C.candle); poly(parts.green, C.green); poly(parts.flame, C.orange);
  ctx.restore();
}
function drawFront1(alpha) {
  const { H, u, v } = S1, parts = M.candleParts(H);
  const { ctx, W, H: CH } = fitCanvas($('c1f'));
  const s = (CH - 40) / H, cy = CH / 2;
  const xL = W * 0.27, xR = W * 0.73;
  ctx.save(); ctx.fillStyle = '#1b2633'; const sw = Math.min(W * 0.4, H * 1.3 * s), shh = CH - 24; ctx.fillRect(xR - sw / 2, 12, sw, shh); ctx.strokeStyle = C.screen; ctx.globalAlpha = 0.5; ctx.strokeRect(xR - sw / 2, 12, sw, shh); ctx.restore();
  frontShape(ctx, parts, (r, y) => ({ x: r, y }), xL, cy, s);
  frontShape(ctx, parts, (r, y) => M.mapPoint(r, y, u, v), xR, cy, s, alpha);
  // arrow from candle to screen
  const a0 = xL + 0.25 * H * s, a1 = xR - sw / 2 - 8;
  if (a1 - a0 > 20) { seg(ctx, a0, cy, a1, cy, C.muted, 1.4, [4, 4]); ctx.save(); ctx.fillStyle = C.muted; ctx.beginPath(); ctx.moveTo(a1, cy); ctx.lineTo(a1 - 7, cy - 4); ctx.lineTo(a1 - 7, cy + 4); ctx.closePath(); ctx.fill(); ctx.restore(); }
}

/* ---------- step 2: how big ---------- */
const s2 = { hist: new Map() };
const BOX2 = { z0: -186, z1: 206, y0: -90, y1: 88 };
function draw2() {
  const H = num('H2'), u = num('u2'), v = num('v2'), im = M.image(H, u, v);
  $('Hv').textContent = String(H); $('uv').textContent = String(u); $('vv').textContent = String(v);
  s2.hist.set(`${H}|${u}|${v}`, { x: v / u, y: im.h / H });
  let { ctx, W, H: CH } = fitCanvas($('c2')); const V = view(W, CH, BOX2, 10);
  board(ctx, V, -86, 86, 1); screenLine(ctx, V, v, 84);
  sideCandle(ctx, V, u, H);
  partial(ctx, [[V.X(-u), V.Y(im.A.y)], [V.X(0), V.Y(0)], [V.X(v), V.Y(im.Ai.y)]], 1, C.orange, 2);
  partial(ctx, [[V.X(-u), V.Y(im.B.y)], [V.X(0), V.Y(0)], [V.X(v), V.Y(im.Bi.y)]], 1, C.cyan, 2);
  sideImage(ctx, V, v, H, v / u);
  dot(ctx, V.X(-u), V.Y(im.A.y), 3.5, C.orange); dot(ctx, V.X(-u), V.Y(im.B.y), 3.5, C.cyan); dot(ctx, V.X(v), V.Y(im.Ai.y), 3.5, C.orange); dot(ctx, V.X(v), V.Y(im.Bi.y), 3.5, C.cyan);
  const lw = Math.max(6, H * 0.22) / 2 * V.s + 6, iw = Math.max(6, H * 0.22) * v / u * V.s * 0.5 + 8;
  labels(ctx, [{ text: 'A', x: V.X(-u) - lw, y: V.Y(im.A.y), color: C.orange, align: 'right' }, { text: 'B', x: V.X(-u) - lw, y: V.Y(im.B.y), color: C.cyan, align: 'right' }], CH);
  labels(ctx, [{ text: 'A′', x: V.X(v) + iw, y: V.Y(im.Ai.y), color: C.orange }, { text: 'B′', x: V.X(v) + iw, y: V.Y(im.Bi.y), color: C.cyan }], CH);
  dim(ctx, V, -u, 0, -88, 'u'); dim(ctx, V, 0, v, -88, 'v');
  // ratio chart
  ({ ctx, W, H: CH } = fitCanvas($('c2r')));
  const P = { l: 40, r: W - 12, t: 30, b: CH - 30 }, mx = 2.8;
  const X = q => P.l + q / mx * (P.r - P.l), Y = q => P.b - q / mx * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [0, 1, 2].forEach(q => { ctx.strokeStyle = q ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, Y(q)); ctx.lineTo(P.r, Y(q)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(q), P.l - 6, Y(q) + 4); ctx.beginPath(); ctx.moveTo(X(q), P.b); ctx.lineTo(X(q), P.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(String(q), X(q), P.b + 15); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke(); ctx.restore();
  seg(ctx, X(0), Y(0), X(mx), Y(mx), C.ghost, 1.4, [5, 4]);
  s2.hist.forEach(q => dot(ctx, X(q.x), Y(q.y), 3, C.text));
  dot(ctx, X(v / u), Y(im.h / H), 6, C.orange);
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = C.text; let size = 12;
  const title = t('c2r'); while (ctx.measureText(title).width > W - 16 && size > 9) { size -= 0.5; ctx.font = `600 ${size}px system-ui,sans-serif`; }
  ctx.fillText(title, 8, 18); ctx.restore();
  const cmp = Math.abs(v - u) < 1e-9 ? 'cmpSame' : v > u ? 'cmpBig' : 'cmpSmall';
  $('r2').textContent = t('s2readout', { ya: f1(Math.abs(im.Bi.y)), yb: f1(Math.abs(im.Ai.y)), h: f1(im.h), H, v, u, hf: f1(im.hFormula), r: f2(v / u), rh: f2(im.h / H), cmp: t(cmp) });
}

/* ---------- step 3: a bigger hole ---------- */
// In-place separable box blur of width w (px) on premultiplied channels.
function boxBlur(img, w) {
  if (w <= 1) return;
  const { width: N, height: R, data } = img, ch = [0, 1, 2].map(() => new Float32Array(N * R)), al = new Float32Array(N * R);
  for (let i = 0; i < N * R; i++) { const a = data[4 * i + 3] / 255; al[i] = a; for (let c = 0; c < 3; c++) ch[c][i] = data[4 * i + c] * a; }
  const pass = (arr, horiz) => {
    const out = new Float32Array(arr.length), L = horiz ? N : R, M2 = horiz ? R : N, h = (w - 1) / 2;
    for (let m = 0; m < M2; m++) {
      const at = q => (horiz ? m * N + q : q * N + m);
      let acc = 0; const lo = q => Math.ceil(q - h), hi = q => Math.floor(q + h);
      for (let q = lo(0); q <= hi(0); q++) if (q >= 0 && q < L) acc += arr[at(q)];
      for (let q = 0; q < L; q++) {
        out[at(q)] = acc / w;
        const add = hi(q + 1), rem = lo(q);
        if (add >= 0 && add < L) acc += arr[at(add)];
        if (rem >= 0 && rem < L) acc -= arr[at(rem)];
      }
    }
    return out;
  };
  const chans = [...ch, al].map(a => pass(pass(a, true), false));
  for (let i = 0; i < N * R; i++) { const a = chans[3][i]; data[4 * i + 3] = Math.round(a * 255); for (let c = 0; c < 3; c++) data[4 * i + c] = a > 1e-6 ? Math.round(chans[c][i] / a) : 0; }
}
const S3 = { H: 60, u: 90, v: 90, dMax: 15 };
const BOX3 = { z0: -112, z1: 112, y0: -52, y1: 52 };
let stampCache = null;
function draw3() {
  const d = num('d3'), { H, u, v } = S3, bl = M.blur(H, u, v, d);
  $('dv').textContent = fmt(d, 1);
  let { ctx, W, H: CH } = fitCanvas($('c3')); const V = view(W, CH, BOX3, 10);
  board(ctx, V, -50, 50, d, true); screenLine(ctx, V, v, 50);
  sideCandle(ctx, V, u, H);
  [[H / 2, C.orange], [-H / 2, C.cyan]].forEach(([y0, col]) => M.spotRays(y0, d, u, v).forEach(r => {
    seg(ctx, V.X(-u), V.Y(y0), V.X(0), V.Y(r.through), col, 1.4, null, 0.85); seg(ctx, V.X(0), V.Y(r.through), V.X(v), V.Y(r.hit), col, 1.4, null, 0.85);
  }));
  bl.spots.forEach((sp, i) => {
    dot(ctx, V.X(-u), V.Y(sp.y0), 3.5, SPOTCOL[i]);
    const lane = V.X(v) + 6 + (i % 2) * 8;
    ctx.save(); ctx.strokeStyle = SPOTCOL[i]; ctx.lineWidth = 5; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(lane, V.Y(sp.hi)); ctx.lineTo(lane, V.Y(sp.lo) + 0.01); ctx.stroke(); ctx.restore();
  });
  // front view: the inverted candle stamped once for every point of a k × k grid over the square hole
  ({ ctx, W, H: CH } = fitCanvas($('c3f')));
  const barW = 14, s = (CH - 30) / (H + 32), cx = (W - barW - 20) / 2, cy = CH / 2;
  ctx.save(); ctx.fillStyle = '#1b2633'; ctx.fillRect(10, 10, W - barW - 30, CH - 20); ctx.restore();
  const shift = (u + v) / u, parts = M.candleParts(H);
  const spread = d * shift * s; // blur-spot width in px on this view
  const key = `${s.toFixed(4)}|${d}`;
  if (!stampCache || stampCache.key !== key) {
    // Draw the sharp pinhole image, then blur it by a square box as wide as the spot (a square hole of side d
    // spreads each point into a d·(u+v)/u square). The box blur runs on the pixel values, separably.
    const pad = Math.ceil(spread / 2) + 2, size = Math.ceil(H * 1.2 * s) + 2 * pad;
    const off = document.createElement('canvas'); off.width = size; off.height = size;
    const oc = off.getContext('2d');
    frontShape(oc, parts, (r, y) => M.mapPoint(r, y, u, v), size / 2, size / 2, s);
    const img = oc.getImageData(0, 0, size, size);
    boxBlur(img, 2 * Math.round(spread / 2) + 1); // odd width keeps the box centred
    oc.putImageData(img, 0, 0);
    stampCache = { key, off, size };
  }
  ctx.save(); ctx.beginPath(); ctx.rect(10, 10, W - barW - 30, CH - 20); ctx.clip();
  ctx.drawImage(stampCache.off, cx - stampCache.size / 2, cy - stampCache.size / 2); ctx.restore();
  // light-in bar (area of the hole, full = 15 cm)
  const bx = W - barW - 10, frac = M.brightness(d) / M.brightness(S3.dMax);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(bx, 10, barW, CH - 20); ctx.fillStyle = C.yellow;
  const fh = Math.max(1, frac * (CH - 22)); ctx.fillRect(bx + 1, CH - 11 - fh, barW - 2, fh); ctx.restore();
  const state = bl.merged ? t('s3merged', { o: f1(bl.overlap) }) : t('s3sharp');
  $('r3').textContent = t('s3readout', { d: fmt(d, 1), w: f1(bl.width), g: f1(bl.gap), state, b: fmt(M.brightness(d), 2) });
}

/* ---------- step 4: quiz ---------- */
const quiz = {};
const KEY = {
  q1: () => 'right',
  q2: () => (M.image(60, 90, 120).h > M.image(60, 90, 90).h ? 'a' : 'b'),
  q3: () => { const q = M.mapPoint(1, 1, 90, 60); return q.x < 0 && q.y < 0 ? 'a' : 'b'; },
  q4: () => (M.blur(60, 90, 90, 15).merged ? 'a' : 'b')
};
function renderQuiz() {
  const o = M.QUIZ.q1Options();
  $('q1same').textContent = t('optCm', { x: fmt(o.same) }); $('q1right').textContent = t('optCm', { x: fmt(o.right) }); $('q1flip').textContent = t('optCm', { x: fmt(o.flipped) });
  let right = 0;
  Object.keys(quiz).forEach(q => {
    const st = quiz[q], fb = $('fb-' + q); if (!st) return;
    let txt;
    if (q === 'q1') txt = st.choice === 'right' ? t('q1ok', { h: fmt(o.right) }) : st.choice === 'same' ? t('q1same', { x: fmt(o.same) }) : t('q1flip', { x: fmt(o.flipped) });
    else if (st.ok) txt = q === 'q2' ? t('q2ok', { h0: fmt(M.image(60, 90, 90).h), h1: fmt(M.image(60, 90, 120).h) }) : q === 'q4' ? t('q4ok', { w: fmt(M.spotWidth(15, 90, 90)) }) : t(q + 'ok');
    else txt = t(`${q}${st.choice}_no`);
    fb.textContent = txt; fb.dataset.state = st.ok ? 'correct' : 'wrong'; if (st.ok) right++;
  });
  const n = Object.keys(quiz).length;
  $('score').textContent = n ? (right === 4 ? t('allRight') : t('score', { k: right })) : '';
}
function checkQuiz(q) {
  const ch = document.querySelector(`input[name="${q}"]:checked`);
  if (!ch) return;
  quiz[q] = { choice: ch.value, ok: ch.value === KEY[q]() }; renderQuiz();
}

/* ---------- dragging in the scenes (slider stays the equivalent input) ---------- */
function draggable(canvas, pick) {
  let active = null;
  const rel = e => { const r = canvas.getBoundingClientRect(); return e.clientX - r.left; };
  canvas.addEventListener('pointerdown', e => { active = pick(rel(e)); if (active) { canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; e.preventDefault(); } });
  canvas.addEventListener('pointermove', e => { if (active) active(rel(e)); });
  const end = () => { active = null; canvas.style.cursor = ''; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
}
function setSlider(id, value) { const el = $(id); el.value = Math.round(Math.max(Number(el.min), Math.min(Number(el.max), value))); el.dispatchEvent(new Event('input')); }

function refresh() { draw0(); draw1(); draw2(); draw3(); renderQuiz(); }
function setup() {
  $('cpos').addEventListener('input', () => { stopAnim('s0'); s0.p = 1; draw0(); });
  $('fly0').addEventListener('click', () => { s0.p = 0; draw0(); animate('s0', 2600, p => { s0.p = p; draw0(); }); });
  $('light1').addEventListener('click', () => { s1.p = 0; draw1(); animate('s1', 4200, p => { s1.p = 3 * p; draw1(); }); });
  ['H2', 'u2', 'v2'].forEach(id => $(id).addEventListener('input', draw2));
  const preset = (u, v) => { $('u2').value = u; $('v2').value = v; draw2(); };
  $('preEq').addEventListener('click', () => preset(90, 90));
  $('preHalf').addEventListener('click', () => preset(120, 60));
  $('preDouble').addEventListener('click', () => preset(70, 140));
  $('clear2').addEventListener('click', () => { s2.hist.clear(); draw2(); });
  $('d3').addEventListener('input', draw3);
  document.querySelectorAll('[data-check]').forEach(b => b.addEventListener('click', () => checkQuiz(b.dataset.check)));

  draggable($('c0'), x => { const V = view($('c0').clientWidth, $('c0').clientHeight, BOX0); return Math.abs(x - V.X(num('cpos'))) < 26 ? X => setSlider('cpos', V.z(X)) : null; });
  draggable($('c2'), x => {
    const V = view($('c2').clientWidth, $('c2').clientHeight, BOX2, 10), dc = Math.abs(x - V.X(-num('u2'))), ds = Math.abs(x - V.X(num('v2')));
    if (Math.min(dc, ds) > 28) return null;
    return dc <= ds ? X => setSlider('u2', -V.z(X)) : X => setSlider('v2', V.z(X));
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { stampCache = null; refresh(); }); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPinhole = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
