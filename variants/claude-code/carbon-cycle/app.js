'use strict';
// Carbon cycle lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, arrow and readout comes from window.CARBON_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few short labels that are measured first and only drawn where they fit.
(function () {

const $ = id => document.getElementById(id);
const M = window.CARBON_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const lang = () => window.LESSON_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffd166', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', blue: '#678cf9', brown: '#6b5638', sea: '#1d4f7c' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const degC = () => (lang() === 'zh' ? ' ℃' : ' °C');
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (90 stays 90).
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const group = s => { const [i, f] = s.split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : ''); };

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
// Draw `text` shrinking the font until it fits maxW; returns false (draws nothing) if it cannot fit at minSize.
function fitText(ctx, text, X, Y, maxW, { size = 12, min = 8, weight = '', color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.textAlign = align; ctx.fillStyle = color;
  let s = size;
  for (; s >= min; s -= 0.5) { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; }
  const ok = s >= min; if (ok) ctx.fillText(text, X, Y); ctx.restore(); return ok;
}
const title = (ctx, text, X, Y, maxW) => fitText(ctx, text, X, Y, maxW, { size: 12, min: 7, weight: '600' });
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Linear plot panel. Title sits in its own row above the plot; tick labels left of / below it.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 2), P.l - 6, y(v) + 4);
  }
  const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
  ctx.textAlign = 'center';
  if (!o.noX) for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function polyline(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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
function arrowHead(ctx, x, y, ang, size, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(ang - 0.45) * size, y - Math.sin(ang - 0.45) * size); ctx.lineTo(x - Math.cos(ang + 0.45) * size, y - Math.sin(ang + 0.45) * size); ctx.closePath(); ctx.fill(); ctx.restore(); }
const BOX_KEY = { air: 'bAir', plants: 'bPlants', soil: 'bSoil', surf: 'bSurf', deep: 'bDeep' };
const BTN = { air: 'bAir', plants: 'bPlants', soil: 'bSoil', surf: 'bSurf', deep: 'bDeep' };
const vline = (ctx, X, y0, y1, color = C.yellow) => polyline(ctx, [[X, y0], [X, y1]], color, 1.4, [4, 4], 0.8);
const ticksFor = (lo, hi, step) => { const a = []; for (let v = lo; v <= hi + 1e-9; v += step) a.push(v); return a; };

/* ---------- step 0: the ledger ---------- */
const s0 = { sel: 'air' };
const POS = { air: [0.5, 0], plants: [0.15, 0.52], soil: [0.42, 1], surf: [0.85, 0.52], deep: [0.85, 1] };
function boxGeom(W, top, h) {
  const bw = Math.min(124, (W - 24) * 0.27), bh = 42, g = {};
  M.BOXES.forEach(b => { const [fx, fy] = POS[b]; g[b] = { x: Math.min(W - 12 - bw / 2, Math.max(12 + bw / 2, fx * W)), y: top + bh / 2 + fy * (h - bh), w: bw, h: bh }; });
  return g;
}
function edgePt(b, tx, ty) { const dx = tx - b.x, dy = ty - b.y, s = Math.max(Math.abs(dx) / (b.w / 2 + 3), Math.abs(dy) / (b.h / 2 + 3), 1e-9); return [b.x + dx / s, b.y + dy / s]; }
function flowPath(g, from, to) {
  const A = g[from], B = g[to], twin = M.GROSS.some(f => f[0] === to && f[1] === from);
  const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, off = twin ? 9 : 0;
  const a = edgePt(A, B.x + nx * off, B.y + ny * off), b = edgePt(B, A.x + nx * off, A.y + ny * off);
  return { a: [a[0] + nx * off, a[1] + ny * off], b: [b[0] + nx * off, b[1] + ny * off], nx, ny };
}
function draw0() {
  M.BOXES.forEach(b => $(BTN[b]).setAttribute('aria-pressed', String(b === s0.sel)));
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0'), 8, 18, W - 16);
  const g = boxGeom(W, 32, H - 44), placed = [];
  const boxes = M.BOXES.map(b => [g[b].x - g[b].w / 2, g[b].y - g[b].h / 2, g[b].w, g[b].h]);
  const order = [...M.GROSS].sort((p, q) => ((p[0] === s0.sel || p[1] === s0.sel) ? 1 : 0) - ((q[0] === s0.sel || q[1] === s0.sel) ? 1 : 0));
  order.forEach(([from, to, q]) => {
    const on = from === s0.sel || to === s0.sel, p = flowPath(g, from, to), lw = 1 + 1.9 * Math.log10(1 + q), col = on ? C.yellow : 'rgba(103,215,249,.6)';
    const [x0, y0] = p.a, [x1, y1] = p.b, ang = Math.atan2(y1 - y0, x1 - x0), hl = 6 + lw;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * hl * 0.8, y1 - Math.sin(ang) * hl * 0.8); ctx.stroke(); ctx.restore();
    arrowHead(ctx, x1, y1, ang, hl, col);
    const label = String(q); ctx.font = '600 11px system-ui,sans-serif'; const tw = ctx.measureText(label).width, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    for (const d of [12 + lw / 2, 22 + lw / 2, -(12 + lw / 2), 34, -34]) {
      const lx = mx + p.nx * d, ly = my + p.ny * d, rect = [lx - tw / 2 - 2, ly - 8, tw + 4, 14];
      const hit = r2 => !(rect[0] > r2[0] + r2[2] || rect[0] + rect[2] < r2[0] || rect[1] > r2[1] + r2[3] || rect[1] + rect[3] < r2[1]);
      if (rect[0] < 2 || rect[0] + rect[2] > W - 2 || rect[1] < 24 || boxes.some(hit) || placed.some(hit)) continue;
      placed.push(rect); ctx.fillStyle = C.bg; ctx.fillRect(...rect); ctx.fillStyle = on ? C.yellow : C.text; ctx.textAlign = 'center'; ctx.fillText(label, lx, ly + 4); break;
    }
  });
  M.BOXES.forEach(b => {
    const q = g[b], on = b === s0.sel;
    ctx.fillStyle = '#182433'; ctx.strokeStyle = on ? C.yellow : '#2c3b50'; ctx.lineWidth = on ? 2.4 : 1.5;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h, 8); else ctx.rect(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h); ctx.fill(); ctx.stroke();
    fitText(ctx, t(BOX_KEY[b]), q.x, q.y - 4, q.w - 10, { size: 12.5, min: 8, weight: '700', align: 'center', color: on ? C.yellow : C.text });
    fitText(ctx, group(String(M.STOCK0[b])), q.x, q.y + 13, q.w - 10, { size: 10.5, min: 8, color: C.muted, align: 'center' });
  });
  const b = s0.sel;
  $('r0').textContent = t('s0readout', { box: t(BOX_KEY[b]), stock: group(String(M.STOCK0[b])), in: M.grossIn(b), out: M.grossOut(b), tau: fmt(M.turnover(b), M.turnover(b) < 10 ? 1 : 0), extra: b === 'air' ? t('s0air', { ppm: fmt(M.ppm(M.STOCK0.air), 0) }) : '' });
}

/* ---------- step 1: tagged atoms vs extra carbon ---------- */
const s1 = { P: 0, curve: null, tNow: 200 };
function draw1() {
  const P = num('P1'); $('P1v').textContent = group(String(P)) + ' GtC';
  if (P !== s1.P) { s1.P = P; s1.curve = M.pulse(P, 200); }
  const c = s1.curve, tn = Math.round(s1.tNow);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 200, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xSteps: [25, 50], minPx: 34, left: 36, title: t('c1') });
  const upto = c.filter(r => r.t <= tn);
  polyline(ctx, upto.map(r => [A.x(r.t), A.y(r.tagged * 100)]), C.cyan, 2.6);
  polyline(ctx, upto.map(r => [A.x(r.t), A.y(r.excess * 100)]), C.orange, 2.6);
  [10, 100].forEach(y => { if (y <= tn) vline(ctx, A.x(y), A.P.t, A.P.b, C.raw); });
  vline(ctx, A.x(tn), A.P.t, A.P.b);
  dot(ctx, A.x(tn), A.y(c[tn].tagged * 100), 5, C.cyan); dot(ctx, A.x(tn), A.y(c[tn].excess * 100), 5, C.orange);
  const pc = v => fmt(v * 100, 0);
  $('r1').textContent = t('s1readout', { P: group(String(P)), ppm: fmt(M.ppm(P), 0), t: tn, tag: pc(c[tn].tagged), ex: pc(c[tn].excess), tag10: pc(c[10].tagged), ex10: pc(c[10].excess), tag100: pc(c[100].tagged), ex100: pc(c[100].excess) });
}

/* ---------- step 2: steady emissions ---------- */
const s2 = { runs: {}, hist: [], last: null };
const run2 = E => s2.runs[E] || (s2.runs[E] = M.run(() => E, 150, { every: 1 }));
function draw2() {
  const E = num('E2'), Y = num('Y2'); $('E2v').textContent = E + ' GtC/' + (lang() === 'zh' ? '年' : 'yr'); $('Y2v').textContent = (lang() === 'zh' ? '第 ' + Y + ' 年' : 'year ' + Y);
  const r = run2(E), at = r[Y];
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: 226, xMin: 0, xMax: 150, yMin: 250, yMax: 800, yTicks: [250, 400, 550, 700], xSteps: [25, 50], minPx: 34, left: 40, title: t('c2a') });
  s2.hist.filter(e => e !== E).forEach(e => polyline(ctx, run2(e).map(q => [A.x(q.t), A.y(q.ppm)]), C.raw, 1.6));
  polyline(ctx, r.filter(q => q.t <= Y).map(q => [A.x(q.t), A.y(q.ppm)]), C.text, 2.6);
  polyline(ctx, r.filter(q => q.t >= Y).map(q => [A.x(q.t), A.y(q.ppm)]), C.text, 1.2, [3, 4], 0.5);
  vline(ctx, A.x(Y), A.P.t, A.P.b); dot(ctx, A.x(Y), A.y(at.ppm), 5, C.text);
  const B = panel(ctx, W, { top: 272, bottom: H - 26, xMin: 0, xMax: 150, yMin: 0, yMax: 3000, yTicks: [0, 1000, 2000, 3000], xSteps: [25, 50], minPx: 34, left: 40, title: t('c2b') });
  const layer = (lo, hi, col) => { const seg = r.filter(q => q.t <= Y); if (seg.length < 2) return; ctx.fillStyle = col; ctx.beginPath(); seg.forEach((q, i) => (i ? ctx.lineTo(B.x(q.t), B.y(hi(q))) : ctx.moveTo(B.x(q.t), B.y(hi(q))))); for (let i = seg.length - 1; i >= 0; i--) ctx.lineTo(B.x(seg[i].t), B.y(lo(seg[i]))); ctx.closePath(); ctx.fill(); };
  const air = q => M.excess(q);
  layer(() => 0, air, 'rgba(255,180,84,.85)');
  layer(air, q => air(q) + q.landCum, 'rgba(126,226,168,.85)');
  layer(q => air(q) + q.landCum, q => air(q) + q.landCum + q.oceanCum, 'rgba(63,143,216,.9)');
  polyline(ctx, r.map(q => [B.x(q.t), B.y(q.cum)]), C.text, 1.2, [3, 4], 0.6);
  vline(ctx, B.x(Y), B.P.t, B.P.b);
  if (E === 0) { $('r2').textContent = t('s2zero', { ppm: fmt(M.ppm(M.STOCK0.air), 0) }); return; }
  const ex = air(at), sum = ex + at.landCum + at.oceanCum;
  $('r2').textContent = t('s2readout', { E, t: Y, ppm: fmt(at.ppm, 0), cum: group(fmt(at.cum, 0)), air: group(fmt(ex, 0)), land: group(fmt(at.landCum, 0)), ocean: group(fmt(at.oceanCum, 0)), sum: group(fmt(sum, 0)), af: Y ? fmt(ex / at.cum * 100, 0) : '—' });
}
function remember2() { const E = num('E2'); if (s2.last !== null && s2.last !== E && !s2.hist.includes(s2.last)) { s2.hist.push(s2.last); if (s2.hist.length > 5) s2.hist.shift(); } s2.last = E; }

/* ---------- step 3: the two sinks ---------- */
const s3 = { cache: {} };
const XI = ticksFor(1, 15, 0.5);
function afCurve(beta) { const k = beta.toFixed(2); return s3.cache[k] || (s3.cache[k] = XI.map(xi => M.airborne(10, 100, { xi, beta }))); }
function draw3() {
  const xi = num('X3'), beta = num('B3'); $('X3v').textContent = fmt(xi, 1); $('B3v').textContent = fmt(beta, 2);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: 15, yMin: 0, yMax: 70, yTicks: [0, 10, 20, 30, 40, 50, 60, 70], xSteps: [1, 2, 5], minPx: 30, left: 34, title: t('c3') });
  const line = (b, col, lw) => polyline(ctx, afCurve(b).map((v, i) => [A.x(XI[i]), A.y(v * 100)]), col, lw);
  line(0, C.pink, 1.8); line(0.6, C.green, 1.8); line(beta, C.text, 2.8);
  const r = M.run(() => 10, 100, { xi, beta, every: 100 }), L = r[1], af = M.excess(L) / L.cum;
  vline(ctx, A.x(xi), A.P.t, A.P.b); dot(ctx, A.x(xi), A.y(af * 100), 5.5, C.yellow);
  $('r3').textContent = t('s3readout', { xi: fmt(xi, 1), beta: fmt(beta, 2), air: fmt(M.excess(L), 0), af: fmt(af * 100, 0), land: fmt(L.landCum, 0), ocean: fmt(L.oceanCum, 0), afDef: fmt(M.airborne(10, 100) * 100, 0) });
}

/* ---------- step 4: after stopping ---------- */
const s4 = { cache: {} };
const run4 = T => s4.cache[T] || (s4.cache[T] = M.run(M.stopAt(10, T), 700, { every: 1 }));
function draw4() {
  const T = num('T4'); $('T4v').textContent = lang() === 'zh' ? '第 ' + T + ' 年' : 'year ' + T;
  const r = run4(T), ex = q => M.ppm(M.excess(q));
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 700, yMin: 0, yMax: 250, yTicks: [0, 50, 100, 150, 200, 250], xSteps: [50, 100, 200], minPx: 34, left: 36, title: t('c4') });
  polyline(ctx, r.map(q => [A.x(q.t), A.y(ex(q))]), C.orange, 2.6);
  vline(ctx, A.x(T), A.P.t, A.P.b);
  [50, 200, 500].forEach(k => dot(ctx, A.x(T + k), A.y(ex(r[T + k])), 4, C.orange));
  dot(ctx, A.x(T), A.y(ex(r[T])), 5.5, C.yellow);
  const peak = ex(r[T]), rr = k => fmt(ex(r[T + k]) / peak * 100, 0);
  $('r4').textContent = t('s4readout', { T, peak: fmt(r[T].ppm, 0), ex: fmt(peak, 0), r50: rr(50), r200: rr(200), r500: rr(500), ppm500: fmt(r[T + 500].ppm, 0) });
}

/* ---------- step 5: holding the level ---------- */
const s5 = { cache: {} };
const run5 = g => s5.cache[g] || (s5.cache[g] = M.stabilise(g, 10, 500));
function draw5() {
  const g = num('G5'); $('G5v').textContent = g + ' ppm';
  const r = run5(g), held = r.held;
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 210, xMin: 0, xMax: 500, yMin: 250, yMax: 650, yTicks: [250, 350, 450, 550, 650], xSteps: [50, 100, 200], minPx: 34, left: 40, title: t('c5a') });
  polyline(ctx, [[A.P.l, A.y(g)], [A.P.r, A.y(g)]], C.raw, 1.2, [3, 4]);
  polyline(ctx, r.out.map(q => [A.x(q.t), A.y(q.ppm)]), C.orange, 2.6);
  const B = panel(ctx, W, { top: 256, bottom: H - 26, xMin: 0, xMax: 500, yMin: 0, yMax: 12, yTicks: [0, 4, 8, 12], xSteps: [50, 100, 200], minPx: 34, left: 40, title: t('c5b') });
  polyline(ctx, r.out.map(q => [B.x(q.t), B.y(q.emit)]), C.green, 2.6);
  if (held !== null) {
    vline(ctx, A.x(held), A.P.t, A.P.b); vline(ctx, B.x(held), B.P.t, B.P.b);
    const h = Math.ceil(held), at = k => r.out[Math.min(r.out.length - 1, h + k)].emit;
    dot(ctx, B.x(held), B.y(r.e0), 4.5, C.green); [50, 200].forEach(k => dot(ctx, B.x(h + k), B.y(at(k)), 4.5, C.green));
    $('r5').textContent = t('s5readout', { target: g, held: fmt(held, 0), e0: fmt(r.e0, 1), e50: fmt(at(50), 1), e200: fmt(at(200), 1) });
  } else $('r5').textContent = t('s5never', { target: g, pre: fmt(M.ppm(M.STOCK0.air), 0) });
}

/* ---------- step 6 ---------- */
function draw6() {
  const p = M.pulse(500, 100), pc = v => fmt(v * 100, 0);
  $('fin6').innerHTML = t('s6fin', { tauAir: fmt(M.turnover('air'), 1), ex100: pc(p[100].excess), tag100: pc(p[100].tagged) });
  const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state, { ex: pc(p[100].excess), tag: pc(p[100].tagged) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  M.BOXES.forEach(b => $(BTN[b]).addEventListener('click', () => { s0.sel = b; draw0(); }));
  $('P1').addEventListener('input', () => { stopAnim('s1'); s1.tNow = 200; draw1(); });
  $('play1').addEventListener('click', () => animate('s1', 6000, p => { s1.tNow = 200 * p; draw1(); }));
  $('E2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('E2').addEventListener('change', () => { remember2(); draw2(); });
  $('Y2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => animate('s2', 6000, p => { $('Y2').value = Math.round(150 * p); draw2(); }));
  $('clear2').addEventListener('click', () => { s2.hist = []; draw2(); });
  ['X3', 'B3'].forEach(id => $(id).addEventListener('input', draw3));
  $('T4').addEventListener('input', draw4);
  $('G5').addEventListener('input', draw5);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b', fb = $('quizFeedback');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.style.color = ok ? C.green : C.orange; draw6();
  });
  s2.last = num('E2');

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
