'use strict';
// Reflection & refraction lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ray direction and every readout number comes from window.RR_MODEL (model.js). Canvas labels go
// through a small placer that tries candidate spots and never lets two labels overlap or leave the canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.RR_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', water: 'rgba(56,128,196,0.20)', glass: 'rgba(150,190,220,0.16)', faint: 'rgba(232,237,244,0.22)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const f1 = v => (Math.abs(v) < 0.05 ? 0 : v).toFixed(1);
const f2 = v => v.toFixed(2);
const R = M.rad;

// Static placeholders inside explanatory text (computed, never typed in).
window.PAGE_PARAMS = { crit: f1(M.critical(M.N_WATER, M.N_AIR)), w: f1(M.acceptance(M.N_GLASS, M.N_WATER)) };

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

function niceTicks(ctx, P, L, xs, ys, fx, fy) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of ys) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, fy(v)); ctx.lineTo(P.r, fy(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v + '°', P.l - 5, fy(v)); L.block(P.l - 34, fy(v) - 7, P.l - 3, fy(v) + 7); }
  for (const v of xs) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(fx(v), P.t); ctx.lineTo(fx(v), P.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(v + '°', fx(v), P.b + 5); L.block(fx(v) - 14, P.b + 3, fx(v) + 14, P.b + 18); }
  ctx.restore();
}
// θ₂-against-θ₁ chart shared by steps 2 and 3. Returns the mapping.
function angleChart(canvas, ttl) {
  const { ctx, W, H } = fitCanvas(canvas), L = labeler(ctx, W, H);
  const tb = title(ctx, L, ttl, W);
  const P = { l: 40, r: W - 12, t: tb + 12, b: H - 26 };
  const fx = v => P.l + v / 90 * (P.r - P.l), fy = v => P.b - v / 90 * (P.b - P.t);
  niceTicks(ctx, P, L, [0, 30, 60, 90], [0, 30, 60, 90], fx, fy);
  return { ctx, W, H, L, P, fx, fy };
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

/* ---------- step 0: a flat mirror ---------- */
const s0 = { hist: [] };
function geo0(W, H) { const my = H - 66, O = [W / 2, my], Rr = Math.min(W * 0.42, my - 56); return { O, Rr, my }; }
function draw0() {
  const th = num('i0'), out = M.reflect(th);
  $('i0v').textContent = th + '°';
  const { ctx, W, H } = fitCanvas($('c0'), w => Math.max(230, Math.min(340, w * 0.42 + 140))), L = labeler(ctx, W, H), { O, Rr, my } = geo0(W, H);
  title(ctx, L, t('c0title'), W);
  // mirror with hatching
  ctx.save(); ctx.fillStyle = '#1b2735'; ctx.fillRect(10, my, W - 20, 14);
  ctx.strokeStyle = '#3b4d63'; ctx.lineWidth = 1; for (let x = 14; x < W - 14; x += 10) { ctx.beginPath(); ctx.moveTo(x, my + 14); ctx.lineTo(x + 8, my + 2); ctx.stroke(); }
  ctx.restore(); line(ctx, [10, my], [W - 10, my], '#c9d5e3', 3);
  L.block(10, my - 2, W - 10, my + 16);
  L.put(t('lbMirrorWord'), [[44, my + 30], [W - 44, my + 30]], C.muted);
  // normal
  line(ctx, [O[0], my], [O[0], my - Rr - 12], C.text, 1.4, [6, 5], 0.8);
  // earlier paths (faint): each is a symmetric pair
  s0.hist.forEach(a => { if (a === th) return; const sx = Math.sin(R(a)), cy = Math.cos(R(a)); line(ctx, [O[0] - Rr * sx, my - Rr * cy], O, C.faint, 1.6); line(ctx, O, [O[0] + Rr * sx, my - Rr * cy], C.faint, 1.6); });
  const sx = Math.sin(R(th)), cy = Math.cos(R(th)), sx2 = Math.sin(R(out)), cy2 = Math.cos(R(out));
  const S = [O[0] - Rr * sx, my - Rr * cy], T = [O[0] + Rr * sx2, my - Rr * cy2];
  ray(ctx, S, O, C.orange); ray(ctx, O, T, C.cyan, th === 0 ? 1.8 : 2.6);
  ctx.save(); ctx.shadowColor = C.orange; ctx.shadowBlur = 14; dotAt(ctx, S[0], S[1], 7, C.orange); ctx.restore();
  // arcs from the normal (up = −π/2)
  const ra = Math.min(58, Rr * 0.42), up = -Math.PI / 2;
  arc(ctx, O[0], O[1], ra, up - R(th), up, C.orange, 2.2); arc(ctx, O[0], O[1], ra + 6, up, up + R(out), C.cyan, 2.2);
  // angle to the mirror, measured on the incoming side (grey)
  const rm = Math.min(30, ra * 0.55); arc(ctx, O[0], O[1], rm, -Math.PI, up - R(th), C.muted, 1.5);
  L.block(S[0] - 9, S[1] - 9, S[0] + 9, S[1] + 9);
  L.seg(S, O); L.seg(O, T); L.seg([O[0], my], [O[0], my - Rr - 12]);
  L.put(t('lbIn', { v: th }), ring(O[0], O[1], up - R(th) / 2, [ra + 22, ra + 40, ra + 62, ra + 90], [0, -0.25, 0.25, -0.5, -0.8, 0.5, -1.1]), C.orange, '600');
  L.put(t('lbOut', { v: out }), ring(O[0], O[1], up + R(out) / 2, [ra + 22, ra + 40, ra + 62, ra + 90], [0, 0.25, -0.25, 0.5, 0.8, -0.5, 1.1]), C.cyan, '600');
  L.put(t('lbMirror', { v: 90 - th }), ring(O[0], O[1], (-Math.PI + up - R(th)) / 2, [rm + 40, rm + 62, rm + 90], [0, 0.25, -0.25, 0.5, 0.8]).concat([[O[0] - Rr * 0.75, my - 14], [O[0] - Rr * 0.95, my - 32]]), C.muted);
  $('r0').textContent = t('s0readout', { i: th, r: out, m: 90 - th, extra: th === 0 ? t('s0straight') : '' });
}
function setTh0(v) { $('i0').value = v; note0(); draw0(); }
function note0() { const v = num('i0'); s0.hist = s0.hist.filter(a => a !== v); s0.hist.push(v); if (s0.hist.length > 7) s0.hist.shift(); }

/* ---------- step 1: rough surface ---------- */
function draw1() {
  const r = num('g1'), th = num('b1'), B = M.beam(th, r), S = M.surface(r);
  $('g1v').textContent = r.toFixed(2); $('b1v').textContent = th + '°';
  const { ctx, W, H } = fitCanvas($('c1'), w => Math.max(190, Math.min(330, 44 + (M.ROUGH.top + 1) * (w - 20) / M.ROUGH.width))), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c1title'), W);
  const top = M.ROUGH.top, bot = -1.0, wx = M.ROUGH.width;
  const sc = Math.min((W - 20) / wx, (H - tb - 16) / (top - bot)), ox = (W - wx * sc) / 2, oy = tb + 6 + top * sc;
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  ctx.save(); ctx.beginPath(); ctx.rect(ox, tb + 6, wx * sc, (top - bot) * sc + 2); ctx.clip();
  // material
  ctx.fillStyle = '#243243'; ctx.beginPath(); ctx.moveTo(X(S[0].x), Y(S[0].y)); S.forEach(p => ctx.lineTo(X(p.x), Y(p.y))); ctx.lineTo(X(wx), Y(bot)); ctx.lineTo(X(0), Y(bot)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9d5e3'; ctx.lineWidth = 2; ctx.beginPath(); S.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y)))); ctx.stroke();
  B.rays.forEach((q, i) => {
    const hl = i === 4, lw = hl ? 2.8 : 1.6, a = hl ? 1 : 0.8;
    const P = q.pts.map(p => [X(p.x), Y(p.y)]);
    line(ctx, P[0], P[1], C.orange, lw, null, a);
    for (let k = 1; k < P.length - 1; k++) line(ctx, P[k], P[k + 1], C.cyan, lw, null, a);
    q.hits.forEach(h => { const n = 0.9; line(ctx, [X(h.p.x), Y(h.p.y)], [X(h.p.x + n * h.n.x), Y(h.p.y + n * h.n.y)], C.text, 1.2, [3, 3], 0.85); });
  });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.axis; ctx.strokeRect(ox, tb + 6, wx * sc, (top - bot) * sc + 2); ctx.restore();
  const hq = B.rays[4].hits[0];
  if (hq) {
    const hx = X(hq.p.x), hy = Y(hq.p.y);
    L.block(ox, Y(0.4), ox + wx * sc, H);
    L.put(t('lbFacet', { i: f1(hq.inc), r: f1(hq.ref) }), [[hx, hy - 1.6 * sc], [hx + 60, hy - 2.2 * sc], [hx - 60, hy - 2.2 * sc], [hx, hy - 3 * sc], [hx, 40]], C.text);
  }
  const multi = B.bounces - B.rays.length;
  const extra = B.spread < 0.05 ? t('s1parallel') : multi > 0 ? t('s1multi', { k: multi }) : '';
  $('r1').textContent = t('s1readout', { a: f1(B.min), b: f1(B.max), s: f1(B.spread), e: B.lawErr < 0.05 ? '0.0' : f1(B.lawErr), extra });
}

/* ---------- step 2: air → water / glass ---------- */
const s2 = { n: M.N_WATER, hist: new Set(), sweeping: null };
function geo2(W, H, up) { const iy = up ? H / 2 + 12 : H / 2 - 4, O = [W / 2, iy], Rr = Math.min(W * 0.40, H / 2 - 44); return { O, Rr, iy }; }
function mediumScene(ctx, L, W, H, iy, below, aboveName, belowName) {
  ctx.save(); ctx.fillStyle = below; ctx.fillRect(0, iy, W, H - iy); ctx.restore();
  line(ctx, [0, iy], [W, iy], '#8fb7d9', 1.6);
  L.block(0, iy - 1, W, iy + 1);
  L.put(aboveName, [[W - 60, iy - 16], [W - 60, 40], [64, iy - 16]], C.muted);
  L.put(belowName, [[W - 60, iy + 18], [W - 60, H - 14], [64, H - 14]], '#9cc8ee');
}
function draw2() {
  const th = num('i2'), res = M.snell(M.N_AIR, s2.n, th), th2 = res.theta2;
  $('i2v').textContent = th + '°';
  $('mWater').setAttribute('aria-pressed', s2.n === M.N_WATER); $('mGlass').setAttribute('aria-pressed', s2.n === M.N_GLASS);
  const mName = s2.n === M.N_WATER ? t('lbWater') : t('lbGlass');
  let { ctx, W, H } = fitCanvas($('c2')); let L = labeler(ctx, W, H);
  title(ctx, L, t('c2title', { m: mName }), W);
  const { O, Rr, iy } = geo2(W, H, true);
  mediumScene(ctx, L, W, H, iy, s2.n === M.N_WATER ? C.water : C.glass, t('lbAir'), mName);
  line(ctx, [O[0], iy - Rr - 8], [O[0], iy + Rr + 8], C.text, 1.3, [6, 5], 0.8);
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.25)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.arc(O[0], O[1], Rr, 0, 7); ctx.stroke(); ctx.restore();
  const S = [O[0] - Rr * Math.sin(R(th)), iy - Rr * Math.cos(R(th))], T = [O[0] + Rr * Math.sin(R(th2)), iy + Rr * Math.cos(R(th2))];
  line(ctx, O, [O[0] + Rr * Math.sin(R(th)), iy - Rr * Math.cos(R(th))], C.faint, 1.4, [5, 4]);
  // half-chords = R·sin θ
  line(ctx, S, [O[0], S[1]], C.orange, 1.6, null, 0.9); line(ctx, T, [O[0], T[1]], C.cyan, 1.6, null, 0.9);
  ray(ctx, S, O, C.orange); ray(ctx, O, T, C.cyan);
  const ra = Math.min(50, Rr * 0.36);
  arc(ctx, O[0], O[1], ra, -Math.PI / 2 - R(th), -Math.PI / 2, C.orange, 2.2); arc(ctx, O[0], O[1], ra, Math.PI / 2 - R(th2), Math.PI / 2, C.cyan, 2.2);
  L.seg(S, O); L.seg(O, T); L.seg(S, [O[0], S[1]]); L.seg(T, [O[0], T[1]]); L.seg([O[0], iy - Rr - 8], [O[0], iy + Rr + 8]);
  L.put(t('lbTh1', { v: th }), ring(O[0], O[1], -Math.PI / 2 - R(th) / 2, [ra + 18, ra + 34, ra + 54], [0, -0.25, 0.25, -0.5, 0.5, -0.9]), C.orange, '600');
  L.put(t('lbTh2', { v: f1(th2) }), ring(O[0], O[1], Math.PI / 2 - R(th2) / 2, [ra + 18, ra + 34, ra + 54], [0, -0.25, 0.25, -0.5, 0.5, -0.9]), C.cyan, '600');

  // chart
  const G = angleChart($('c2b'), t('c2btitle'));
  ({ ctx } = G); L = G.L;
  line(ctx, [G.fx(0), G.fy(0)], [G.fx(90), G.fy(90)], C.muted, 1.2, [5, 5]);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
  for (let a = 0; a <= 90; a += 0.5) { const b = M.snell(M.N_AIR, s2.n, a).theta2; a ? ctx.lineTo(G.fx(a), G.fy(b)) : ctx.moveTo(G.fx(a), G.fy(b)); }
  ctx.stroke(); ctx.restore();
  [...s2.hist].forEach(a => { if (a !== th) { const b = M.snell(M.N_AIR, s2.n, a).theta2; dotAt(ctx, G.fx(a), G.fy(b), 3.2, C.text); } });
  dotAt(ctx, G.fx(th), G.fy(th2), 5.5, C.cyan);
  L.block(G.fx(th) - 7, G.fy(th2) - 7, G.fx(th) + 7, G.fy(th2) + 7);
  L.put(t('lbNoBend'), [[G.fx(30), G.fy(48)], [G.fx(24), G.fy(42)], [G.fx(40), G.fy(60)], [G.fx(50), G.fy(72)]], C.muted);
  const prog = s2.sweeping !== null ? t('s2progress', { c: s2.sweeping, N: 86 }) : '';
  $('r2').textContent = th === 0 ? t('s2zero', { prog, n: s2.n.toFixed(2) })
    : t('s2readout', { prog, a: th, b: f1(th2), d: f1(th - th2), s1: Math.sin(R(th)).toFixed(3), s2: Math.sin(R(th2)).toFixed(3), q: (Math.sin(R(th)) / Math.sin(R(th2))).toFixed(2) });
}

/* ---------- step 3: water → air, total internal reflection ---------- */
const CRIT = M.critical(M.N_WATER, M.N_AIR);
// The slider steps by 0.1°, so "exactly critical" is kept as a flag until the slider moves again.
const s3 = { hist: new Set(), sweeping: null, exact: false };
function draw3() {
  const th = s3.exact ? CRIT : num('i3'), res = M.snell(M.N_WATER, M.N_AIR, th);
  $('i3v').textContent = (Math.abs(th - CRIT) < 1e-9 ? CRIT.toFixed(2) : th.toFixed(1)) + '°';
  let { ctx, W, H } = fitCanvas($('c3')); let L = labeler(ctx, W, H);
  title(ctx, L, t('c3title'), W);
  const { O, Rr, iy } = geo2(W, H, false);
  mediumScene(ctx, L, W, H, iy, C.water, t('lbAir'), t('lbWater'));
  line(ctx, [O[0], iy - Rr - 8], [O[0], iy + Rr + 8], C.text, 1.3, [6, 5], 0.8);
  const sn = Math.sin(R(th)), cs = Math.cos(R(th));
  const S = [O[0] - Rr * sn, iy + Rr * cs], Rf = [O[0] + Rr * sn, iy + Rr * cs];
  const tir = res.type === 'tir';
  ray(ctx, S, O, C.orange);
  ray(ctx, O, Rf, C.green, tir ? 3 : 1.6, tir ? 1 : 0.55);
  const ra = Math.min(50, Rr * 0.36);
  arc(ctx, O[0], O[1], ra, Math.PI / 2, Math.PI / 2 + R(th), C.orange, 2.2);
  const T3 = res.type === 'tir' ? null : [O[0] + Rr * Math.sin(R(res.theta2)), iy - Rr * Math.cos(R(res.theta2))];
  L.seg(S, O); L.seg(O, Rf); if (T3) L.seg(O, T3); L.seg([O[0], iy - Rr - 8], [O[0], iy + Rr + 8]);
  L.put(t('lbTh1', { v: Math.abs(th - CRIT) < 1e-9 ? CRIT.toFixed(2) : th.toFixed(1) }), ring(O[0], O[1], Math.PI / 2 + R(th) / 2, [ra + 18, ra + 34, ra + 54], [0, 0.25, -0.25, 0.5, -0.5, 0.9]), C.orange, '600');
  if (!tir) {
    const th2 = res.theta2, T = [O[0] + Rr * Math.sin(R(th2)), iy - Rr * Math.cos(R(th2))];
    ray(ctx, O, T, C.cyan);
    if (res.type === 'grazing') L.put(t('lbGraze'), [[O[0] + Rr * 0.6, iy - 16], [O[0] + Rr * 0.5, iy - 34]], C.cyan, '600');
    else { arc(ctx, O[0], O[1], ra, -Math.PI / 2, -Math.PI / 2 + R(th2), C.cyan, 2.2); L.put(t('lbTh2', { v: f1(th2) }), ring(O[0], O[1], -Math.PI / 2 + R(th2) / 2, [ra + 18, ra + 34, ra + 54], [0, 0.25, -0.25, 0.5, -0.5, 0.9]), C.cyan, '600'); }
  }
  // chart
  const G = angleChart($('c3b'), t('c3btitle'));
  ({ ctx } = G); L = G.L;
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.12)'; ctx.fillRect(G.fx(CRIT), G.P.t, G.fx(90) - G.fx(CRIT), G.P.b - G.P.t); ctx.restore();
  line(ctx, [G.fx(CRIT), G.P.t], [G.fx(CRIT), G.P.b], C.pink, 1.2, [4, 4]);
  line(ctx, [G.fx(0), G.fy(0)], [G.fx(90), G.fy(90)], C.muted, 1.2, [5, 5]);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const a = CRIT * i / 200, b = M.snell(M.N_WATER, M.N_AIR, a).theta2; i ? ctx.lineTo(G.fx(a), G.fy(b)) : ctx.moveTo(G.fx(a), G.fy(b)); }
  ctx.stroke(); ctx.restore();
  const plot = (a, big) => { const q = M.snell(M.N_WATER, M.N_AIR, a); if (q.type === 'tir') dotAt(ctx, G.fx(a), G.fy(0), big ? 5.5 : 3.2, C.pink); else dotAt(ctx, G.fx(a), G.fy(q.theta2), big ? 5.5 : 3.2, big ? C.cyan : C.text); };
  [...s3.hist].forEach(a => { if (a !== th) plot(a, false); });
  plot(th, true);
  L.put(t('lbTIR'), [[(G.fx(CRIT) + G.fx(90)) / 2, G.fy(55)], [(G.fx(CRIT) + G.fx(90)) / 2, G.fy(40)], [(G.fx(CRIT) + G.fx(90)) / 2, G.fy(25)]], C.pink, '600');
  const prog = s3.sweeping !== null ? t('s3progress', { c: s3.sweeping, N: 86 }) : '';
  const c = CRIT.toFixed(1);
  if (res.type === 'refract') $('r3').textContent = t('s3refract', { prog, a: th.toFixed(1), b: f1(res.theta2), d: f1(res.theta2 - th), c, gap: (CRIT - th).toFixed(1) });
  else if (res.type === 'grazing') $('r3').textContent = t('s3graze', { prog, c: CRIT.toFixed(2) });
  else $('r3').textContent = t('s3tir', { prog, a: th.toFixed(1), c, s: res.s.toFixed(3) });
}

/* ---------- step 4: a glass rod ---------- */
const s4 = { out: M.N_AIR };
function draw4() {
  const a = num('a4');
  $('a4v').textContent = a + '°';
  [['oAir', M.N_AIR], ['oWater', M.N_WATER], ['oClad', M.N_CLAD]].forEach(([id, n]) => $(id).setAttribute('aria-pressed', s4.out === n));
  const { ctx, W, H } = fitCanvas($('c4'), w => Math.max(190, Math.min(250, Math.max(34, Math.min(56, w / 14)) * 3.4 + 70))), L = labeler(ctx, W, H);
  title(ctx, L, t('c4title'), W);
  const u = Math.max(34, Math.min(56, W / 14)), x0 = 14 + 1.9 * u, cy = H / 2 + 12;
  const len = Math.max(3, Math.floor((W - 12 - x0) / u * 10) / 10);
  const res = M.rod(a, M.N_GLASS, s4.out, len);
  const X = x => x0 + x * u, Y = y => cy - y * u;
  const outFill = s4.out === M.N_AIR ? null : s4.out === M.N_WATER ? C.water : 'rgba(170,150,230,0.18)';
  if (outFill) { ctx.save(); ctx.fillStyle = outFill; ctx.fillRect(X(0), 28, len * u, H - 28); ctx.restore(); }
  ctx.save(); ctx.fillStyle = 'rgba(150,190,220,0.22)'; ctx.fillRect(X(0), Y(0.5), len * u, u); ctx.strokeStyle = '#a9c6de'; ctx.lineWidth = 1.6; ctx.strokeRect(X(0), Y(0.5), len * u, u); ctx.restore();
  L.block(X(0), Y(0.5) - 1, X(len), Y(-0.5) + 1);
  line(ctx, [X(-1.8), cy], [X(0), cy], C.muted, 1, [4, 4]);
  // incoming ray in air: aimed at the centre of the end face, rising at angle a
  const Lin = 1.7, src = [X(-Lin * Math.cos(R(a))), Y(-Lin * Math.sin(R(a)))];
  ray(ctx, src, [X(0), cy], C.orange, 2.4);
  ctx.save(); ctx.beginPath(); ctx.rect(X(0), 0, len * u + 2, H); ctx.clip();
  const P = res.pts.map(p => [X(p.x), Y(p.y)]);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
  ctx.restore();
  // first wall contact: normal + labels
  const first = res.pts[1];
  if (first && Math.abs(Math.abs(first.y) - 0.5) < 1e-9) {
    const sg = Math.sign(first.y), fx = X(first.x), fy = Y(first.y);
    line(ctx, [fx, fy - sg * 0.7 * u], [fx, fy + sg * 0.45 * u], C.text, 1.2, [3, 3], 0.85);
    if (res.escape) {
      const o = res.escape.theta, d = [Math.sin(R(o)), Math.cos(R(o)) * sg], Lx = 1.1;
      ray(ctx, [fx, fy], [fx + d[0] * Lx * u, fy - d[1] * Lx * u], C.pink, 2.4);
      L.block(fx - 4, Math.min(fy, fy - d[1] * Lx * u) - 4, fx + d[0] * Lx * u + 4, Math.max(fy, fy - d[1] * Lx * u) + 4);
    }
    const side = sg > 0 ? -1 : 1, yy = sg > 0 ? Y(0.5) - 16 : Y(-0.5) + 16;
    const txt = t('lbWall', { w: f1(res.wall) }) + ' · ' + t('lbCrit', { c: res.crit === null ? '—' : f1(res.crit) });
    L.put(txt, [[fx, yy], [fx + 70, yy], [fx + 140, yy], [fx, yy + side * 18], [fx + 90, yy + side * 18], [W / 2, yy]], res.trapped ? C.text : C.pink);
  }
  const acc = res.accept >= 90 ? t('acceptAll') : t('acceptDeg', { v: f1(res.accept) });
  $('r4').textContent = res.trapped
    ? t('s4trapped', { a, b: f1(res.thC), w: f1(res.wall), c: f1(res.crit), L: len.toFixed(1), k: res.bounces, acc })
    : t('s4leak', { a, b: f1(res.thC), w: f1(res.wall), c: f1(res.crit), o: f1(res.escape.theta), acc });
}

/* ---------- step 5: the fish ---------- */
const s5 = { hist: new Set() };
function fishShape(ctx, x, y, s, color, ghost) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = ghost ? 'rgba(255,180,84,0.12)' : color; ctx.lineWidth = 1.6; if (ghost) ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.ellipse(x, y, 0.3 * s, 0.11 * s, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 0.27 * s, y); ctx.lineTo(x - 0.44 * s, y - 0.1 * s); ctx.lineTo(x - 0.44 * s, y + 0.1 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (!ghost) dotAt(ctx, x + 0.17 * s, y - 0.025 * s, 2, C.bg);
  ctx.restore();
}
function draw5() {
  const Xe = num('x5'), F = M.FISH, v = M.fishView(Xe);
  $('x5v').textContent = Xe.toFixed(2) + t('unitM');
  const { ctx, W, H } = fitCanvas($('c5'), w => Math.max(230, Math.min(360, 46 + 2.75 * (w - 16) / 4.1))), L = labeler(ctx, W, H);
  const tb = title(ctx, L, t('c5title', { d: F.d.toFixed(1), h: F.H.toFixed(1) }), W);
  const xmin = -0.7, xmax = 3.4, ymin = -1.6, ymax = 1.15;
  const sc = Math.min((W - 16) / (xmax - xmin), (H - tb - 18) / (ymax - ymin)), ox = (W - (xmax - xmin) * sc) / 2 - xmin * sc, oy = tb + 10 + ymax * sc;
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  ctx.save(); ctx.fillStyle = C.water; ctx.fillRect(0, Y(0), W, H - Y(0)); ctx.restore();
  line(ctx, [0, Y(0)], [W, Y(0)], '#8fb7d9', 1.6);
  line(ctx, [X(0), Y(0.35)], [X(0), Y(-1.55)], C.muted, 1.1, [3, 4]);
  // history of apparent depths on the vertical line
  [...s5.hist].forEach(x => { if (Math.abs(x - Xe) > 1e-9) dotAt(ctx, X(0), Y(-M.fishView(x).apparent), 3, C.text); });
  fishShape(ctx, X(0), Y(-F.d), sc, C.orange, false);
  fishShape(ctx, X(0), Y(-v.apparent), sc, C.orange, true);
  const sP = [X(v.s), Y(0)], eye = [X(Xe), Y(F.H)];
  if (!v.limit) {
    line(ctx, [sP[0], Y(0.45)], [sP[0], Y(-0.45)], C.text, 1.1, [3, 3], 0.7);
    line(ctx, sP, [X(0), Y(-v.apparent)], C.cyan, 1.6, [6, 4]);
  }
  ray(ctx, [X(0) + (v.limit ? 0 : 0.3 * sc * Math.sin(R(v.thW))), Y(-F.d)], sP, C.cyan, 2.2);
  ray(ctx, sP, eye, C.cyan, 2.2);
  // eye icon
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(eye[0], eye[1], 13, 8, 0, 0, 7); ctx.stroke(); dotAt(ctx, eye[0], eye[1], 4, C.cyan); ctx.restore();
  L.block(eye[0] - 14, eye[1] - 9, eye[0] + 14, eye[1] + 9);
  L.block(X(0) - 0.45 * sc, Y(-F.d) - 0.13 * sc, X(0) + 0.32 * sc, Y(-F.d) + 0.13 * sc);
  L.block(X(0) - 0.45 * sc, Y(-v.apparent) - 0.13 * sc, X(0) + 0.32 * sc, Y(-v.apparent) + 0.13 * sc);
  L.put(t('lbEye'), [[eye[0], eye[1] - 20], [eye[0] + 34, eye[1]], [eye[0] - 34, eye[1]], [eye[0], eye[1] + 20]], C.text);
  const fx = X(0) - 0.45 * sc;
  L.put(t('lbFish'), [[fx - 34, Y(-F.d)], [X(0), Y(-F.d) + 0.24 * sc], [X(0) + 0.32 * sc + 36, Y(-F.d)]], C.orange);
  L.put(t('lbImage'), [[fx - 46, Y(-v.apparent)], [X(0) + 0.32 * sc + 48, Y(-v.apparent)], [X(0), Y(-v.apparent) - 0.24 * sc]], C.orange);
  $('r5').textContent = v.limit ? t('s5limit', { ap: f2(v.apparent), r: v.ratio.toFixed(2) })
    : t('s5readout', { s: f2(v.s), w: f1(v.thW), a: f1(v.thA), ap: f2(v.apparent), d: F.d.toFixed(2), r: v.ratio.toFixed(2) });
}

/* ---------- step 6: quiz ---------- */
function checkQuiz() {
  const Q = M.quiz(), pick = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const right = { q1: 'b', q2: 'a', q3: Q.q3 === 'tir' ? 'c' : 'b' };
  const rows = [['q1', 'fb1ok', 'fb1no', { v: Q.q1 }], ['q2', 'fb2ok', 'fb2no', { v: f1(Q.q2) }], ['q3', 'fb3ok', 'fb3no', { c: f1(Q.q3crit) }]];
  const box = $('quizFeedback'); box.innerHTML = '';
  rows.forEach(([q, ok, no, p]) => {
    const v = pick(q), el = document.createElement('p');
    if (!v) { el.textContent = t('fbNone'); el.className = 'no'; }
    else if (v === right[q]) { el.textContent = t(ok, p); el.className = 'ok'; }
    else { el.textContent = t(no, p); el.className = 'no'; }
    el.dataset.q = q; el.dataset.state = !v ? 'none' : v === right[q] ? 'correct' : 'wrong';
    box.appendChild(el);
  });
  s6.checked = true;
}
const s6 = { checked: false };

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); if (s6.checked) checkQuiz(); }

function setup() {
  // step 0
  $('i0').addEventListener('input', () => { note0(); draw0(); });
  $('p0a').addEventListener('click', () => setTh0(0)); $('p0b').addEventListener('click', () => setTh0(30)); $('p0c').addEventListener('click', () => setTh0(60));
  dragOn($('c0'), $('i0'), (x, y, W, H) => { const { O } = geo0(W, H); return y < O[1] - 4 ? M.deg(Math.atan2(Math.abs(x - O[0]), O[1] - y)) : null; }, () => { note0(); draw0(); });
  note0();
  // step 1
  ['g1', 'b1'].forEach(id => $(id).addEventListener('input', draw1));
  $('smooth1').addEventListener('click', () => { $('g1').value = 0; draw1(); });
  $('rough1').addEventListener('click', () => { $('g1').value = 1; draw1(); });
  // step 2
  const add2 = () => { stopAnim('s2'); s2.sweeping = null; s2.hist.add(num('i2')); draw2(); };
  $('i2').addEventListener('input', add2);
  $('mWater').addEventListener('click', () => { stopAnim('s2'); s2.sweeping = null; s2.n = M.N_WATER; s2.hist = new Set([num('i2')]); draw2(); });
  $('mGlass').addEventListener('click', () => { stopAnim('s2'); s2.sweeping = null; s2.n = M.N_GLASS; s2.hist = new Set([num('i2')]); draw2(); });
  $('sweep2').addEventListener('click', () => {
    s2.hist.clear();
    animate('s2', 4300, p => { const a = Math.min(85, Math.floor(p * 86)); for (let k = 0; k <= a; k++) s2.hist.add(k); s2.sweeping = a + 1; $('i2').value = a; draw2(); }, () => { s2.sweeping = null; draw2(); });
  });
  dragOn($('c2'), $('i2'), (x, y, W, H) => { const { O } = geo2(W, H, true); return y < O[1] - 4 ? M.deg(Math.atan2(Math.abs(x - O[0]), O[1] - y)) : null; }, add2);
  s2.hist.add(num('i2'));
  // step 3
  const add3 = () => { stopAnim('s3'); s3.sweeping = null; s3.exact = false; s3.hist.add(num('i3')); draw3(); };
  $('i3').addEventListener('input', add3);
  const set3 = v => { stopAnim('s3'); s3.sweeping = null; s3.exact = false; $('i3').value = v; s3.hist.add(num('i3')); draw3(); };
  $('p3a').addEventListener('click', () => set3(30));
  $('p3b').addEventListener('click', () => { stopAnim('s3'); s3.sweeping = null; $('i3').value = CRIT; s3.exact = true; s3.hist.add(CRIT); draw3(); });
  $('p3c').addEventListener('click', () => set3(60));
  $('sweep3').addEventListener('click', () => {
    s3.hist.clear(); s3.exact = false;
    animate('s3', 4300, p => { const a = Math.min(85, Math.floor(p * 86)); for (let k = 0; k <= a; k++) s3.hist.add(k); s3.sweeping = a + 1; $('i3').value = a; draw3(); }, () => { s3.sweeping = null; draw3(); });
  });
  dragOn($('c3'), $('i3'), (x, y, W, H) => { const { O } = geo2(W, H, false); return y > O[1] + 4 ? M.deg(Math.atan2(Math.abs(x - O[0]), y - O[1])) : null; }, add3);
  s3.hist.add(num('i3'));
  // step 4
  $('a4').addEventListener('input', draw4);
  [['oAir', M.N_AIR], ['oWater', M.N_WATER], ['oClad', M.N_CLAD]].forEach(([id, n]) => $(id).addEventListener('click', () => { s4.out = n; draw4(); }));
  // step 5
  $('x5').addEventListener('input', () => { s5.hist.add(num('x5')); draw5(); });
  s5.hist.add(num('x5'));
  // step 6
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
