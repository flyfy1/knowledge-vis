'use strict';
// Eye and glasses lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Every ray, dot and readout comes from window.EYE_MODEL (model.js). Canvas text is limited to panel titles,
// axis ticks and a few part labels laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EYE_MODEL;
const t = (...a) => window.EYE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', eye: '#3a4d66' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const sgn = (v, d = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const dist = u => (u === Infinity ? t('farLong') : u >= 1000 ? t('m', { x: fmt(u / 1000, 1) }) : t('cm', { x: fmt(u / 10, 1) }));
const at = u => (u === Infinity ? t('atFar') : t('atDist', { d: dist(u) }));
const distOrInf = u => (u === Infinity ? t('inf') : u === null ? t('none') : dist(u));
const POSV = M.POS.map(u => -M.objV(u)); // object "closeness" in D (0 = far away); the plots' x axis

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
// One-line title that shrinks until it fits.
function title(ctx, text, X, Y, maxW, color = C.text) {
  let size = 12;
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
// Plot panel; the title sits in its own row above, ticks left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const ymap = o.yMap || (v => v);
  const y = v => P.b - (ymap(v) - ymap(o.yMin)) / (ymap(o.yMax) - ymap(o.yMin)) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 3), P.l - 6, y(v) + 4);
  }
  if (o.xTickList) {
    ctx.textAlign = 'center';
    for (const v of o.xTickList) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2).replace('-', '−'), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
// Distance ticks on a "closeness" axis (1/distance): labels are placed in priority order and skipped if they would touch.
const DIST_TICKS = [[0, '∞'], [1, '1 m'], [2, '50 cm'], [4, '25 cm'], [10, '10 cm'], [1000 / 150, '15 cm'], [1000 / 70, '7 cm'], [1000 / 3000, '3 m'], [1000 / 6000, '6 m']];
function distAxis(ctx, m) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const taken = [];
  for (const [v, label] of DIST_TICKS) {
    const X = m.x(v), w = ctx.measureText(label).width, a = Math.max(2, X - w / 2), b = a + w;
    if (b > m.P.r + 12 || taken.some(([p, q]) => a < q + 6 && b > p - 6)) continue;
    taken.push([a, b]);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, m.P.b); ctx.lineTo(X, m.P.b + 4); ctx.stroke();
    ctx.fillText(label, (a + b) / 2, m.P.b + 15);
  }
  ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4], lw = 1.4) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
// Greedy row layout for short labels: each label takes the first row where it does not touch its neighbour.
function rowLayout(ctx, items, rows, minX, maxX, font) {
  ctx.save(); ctx.font = font; const ends = rows.map(() => -Infinity), out = [];
  items.slice().sort((a, b) => a.x - b.x).forEach(it => {
    const w = ctx.measureText(it.text).width;
    const X = Math.max(minX + w / 2, Math.min(maxX - w / 2, it.x));
    let r = ends.findIndex(e => X - w / 2 >= e + 8); if (r < 0) r = ends.indexOf(Math.min(...ends));
    ends[r] = X + w / 2; out.push({ ...it, X, Y: rows[r], w });
  });
  ctx.restore(); return out;
}

/* ---------- the eye cross-section, shared by every step ---------- */
// o: { L, u, Pg, acc }. Distances inside the eye are to scale; the stretch outside the eye is not.
const DIAG = { top: 24, eyeTop: 66, eyeBot: 280, labelRows: [42, 58], bottomRow: 298 };
function drawEye(ctx, W, o) {
  const { L, u, Pg = 0, acc = 0 } = o;
  const s = Math.min(11, (W - 56) / 38, (DIAG.eyeBot - DIAG.eyeTop) / 24);
  const srcLen = Math.max(30, Math.min(260, W - 16 - 38 * s));
  const x0 = (W - (srcLen + 38 * s)) / 2;
  const srcX = x0, lensX = x0 + srcLen + 14 * s, retX = lensX + L * s, gX = lensX - M.VERTEX * s;
  const mid = (DIAG.eyeTop + DIAG.eyeBot) / 2, Y = mm => mid - mm * s;
  const Pe = M.P0 + acc;
  ctx.save();
  // optical axis
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(srcX, mid); ctx.lineTo(W - 6, mid); ctx.stroke(); ctx.setLineDash([]);
  // eyeball: cornea at the front, retina is the back wall
  const eL = lensX - 2.4 * s, cx = (eL + retX) / 2, rx = (retX - eL) / 2, ry = 11 * s;
  ctx.fillStyle = 'rgba(58,77,102,0.18)'; ctx.strokeStyle = C.eye; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, mid, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.pink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(cx, mid, rx, ry, 0, -0.85, 0.85); ctx.stroke();
  // iris around the 4 mm pupil, and the lens (thicker with more accommodation)
  ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
  [[M.PUPIL / 2 + 0.2, 5.2], [-M.PUPIL / 2 - 0.2, -5.2]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(lensX - 0.9 * s, Y(a)); ctx.lineTo(lensX - 0.9 * s, Y(b)); ctx.stroke(); });
  const lrx = (0.55 + 0.1 * acc) * s;
  ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.strokeStyle = 'rgba(103,215,249,0.75)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(lensX, mid, lrx, 4.3 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // glasses
  if (Pg) {
    const tC = Pg < 0 ? 0.5 : 0.5 + Math.abs(Pg) * 0.28, tE = Pg < 0 ? 0.5 + Math.abs(Pg) * 0.28 : 0.5, h = 6.5;
    const xl = gX - tE * s / 2, xr = gX + tE * s / 2;
    ctx.beginPath(); ctx.moveTo(xl, Y(h)); ctx.lineTo(xr, Y(h));
    ctx.quadraticCurveTo(gX + tC * s - tE * s / 2, mid, xr, Y(-h)); ctx.lineTo(xl, Y(-h));
    ctx.quadraticCurveTo(gX - tC * s + tE * s / 2, mid, xl, Y(h)); ctx.closePath();
    ctx.fillStyle = 'rgba(183,206,232,0.22)'; ctx.fill(); ctx.strokeStyle = '#b7cee8'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // rays: five rays that cross the lens at −2…+2 mm
  const heights = [-2, -1, 0, 1, 2], rays = heights.map(h => M.traceRay({ u, Pg, Pe, L }, h));
  const srcPt = [srcX + 4, mid];
  if (u !== Infinity) dot(ctx, srcPt[0], srcPt[1], 4, C.text);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9;
  rays.forEach(r => {
    const entryX = Pg ? gX : lensX, entryY = Pg ? r.yG : r.yE;
    ctx.beginPath();
    if (u === Infinity) ctx.moveTo(srcX, Y(entryY)); else ctx.moveTo(srcPt[0], srcPt[1]);
    ctx.lineTo(entryX, Y(entryY));
    if (Pg) ctx.lineTo(lensX, Y(r.yE));
    ctx.lineTo(retX, Y(r.yR)); ctx.stroke();
  });
  ctx.globalAlpha = 1;
  // focus behind the retina: show where the light would have met (dashed)
  const fx = rays[0].xFocus, fX = lensX + fx * s;
  if (fx > L) {
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.2;
    rays.forEach(r => { const xe = Math.min(W - 6, fX), ye = r.yR + (r.yE + r.sAfter * ((xe - lensX) / s) - r.yR); ctx.beginPath(); ctx.moveTo(retX, Y(r.yR)); ctx.lineTo(xe, Y(ye)); ctx.stroke(); });
    ctx.restore();
  }
  // blur spot on the retina (true size, at least 3 px tall so it stays visible)
  const ys = rays.map(r => r.yR), top = Y(Math.max(...ys)), bot = Y(Math.min(...ys)), hgt = Math.max(3, bot - top);
  ctx.fillStyle = C.orange; ctx.fillRect(retX - 2.5, (top + bot) / 2 - hgt / 2, 5, hgt);
  if (isFinite(fx) && fx > 0 && fX < W - 4) dot(ctx, fX, mid, 3.8, C.text);
  // part labels in two rows above the eye; the object label in a row below it
  const items = [{ x: lensX, text: t('lblLens'), c: C.cyan }, { x: retX, text: t('lblRetina'), c: C.pink }];
  if (Pg) items.push({ x: gX, text: t('lblGlass', { P: sgn(Pg) }), c: '#b7cee8' });
  rowLayout(ctx, items, DIAG.labelRows, 6, W - 6, '600 11px system-ui,sans-serif').forEach(it => {
    ctx.fillStyle = it.c; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(it.text, it.X, it.Y);
  });
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left';
  const srcText = u === Infinity ? t('lblSrcFar') : t('lblSrc', { u: at(u) });
  ctx.fillText(srcText, Math.max(6, Math.min(srcX, W - 6 - ctx.measureText(srcText).width)), DIAG.bottomRow, W - 12);
  ctx.restore();
}

// "What the eye sees": a black tumbling E spread over a disc whose size follows the blur spot (illustrative).
function drawView(id, blur) {
  const cv = $(id), dpr = Math.min(3, window.devicePixelRatio || 1), S = 96;
  if (cv.width !== S * dpr) { cv.width = S * dpr; cv.height = S * dpr; }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#f4f1e8'; ctx.fillRect(0, 0, S, S);
  const r = Math.min(14, 45 * blur), offs = [[0, 0]];
  if (r > 0.4) [[6, 1 / 3], [12, 2 / 3], [18, 1]].forEach(([n, f]) => { for (let i = 0; i < n; i++) { const a = 2 * Math.PI * (i + f) / n; offs.push([r * f * Math.cos(a), r * f * Math.sin(a)]); } });
  const bars = [[30, 26, 8, 44], [30, 26, 36, 8], [30, 44, 30, 8], [30, 62, 36, 8]];
  ctx.fillStyle = '#111';
  ctx.globalAlpha = offs.length === 1 ? 1 : Math.min(1, 2.4 / offs.length);
  offs.forEach(([dx, dy]) => bars.forEach(([x, y, w, h]) => ctx.fillRect(x + dx, y + dy, w, h)));
  ctx.globalAlpha = 1;
  $(id + 's').textContent = blur <= M.BLUR_OK + 1e-12 ? t('sharp') : t('blurry');
  $(id + 's').style.color = blur <= M.BLUR_OK + 1e-12 ? C.green : C.orange;
}

/* ---------- shared animation runner ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

const PLOT = { top: 334 };
const where = off => (Math.abs(off) < 0.005 ? t('onRetina') : off > 0 ? t('behind', { x: off.toFixed(2) }) : t('ahead', { x: Math.abs(off).toFixed(2) }));
const verdict = b => (b <= M.BLUR_OK + 1e-12 ? t('sharp') : t('blurry'));

/* ---------- step 0: relaxed eye, object moves ---------- */
const s0 = { seen: new Set([0]) };
function draw0() {
  const i = num('u0'), u = M.POS[i]; s0.seen.add(i);
  $('u0v').textContent = dist(u);
  const f = M.focus(M.L0, M.objV(u), 0);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0eye'), 8, 16, W - 16);
  drawEye(ctx, W, { L: M.L0, u });
  const m = panel(ctx, W, { top: PLOT.top, bottom: H - 26, xMin: -0.4, xMax: 15, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6], title: t('c0plot') });
  distAxis(ctx, m);
  const pts = [...s0.seen].sort((a, b) => a - b).map(k => [POSV[k], M.focus(M.L0, M.objV(M.POS[k]), 0).offset]);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.beginPath();
  pts.forEach(([x, y], k) => (k ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y)))); ctx.stroke(); ctx.restore();
  pts.forEach(([x, y]) => dot(ctx, m.x(x), m.y(y), 3.5, C.cyan));
  dot(ctx, m.x(POSV[i]), m.y(f.offset), 7, C.text, true);
  drawView('v0', f.blur);
  $('r0').textContent = t('s0readout', { u: at(u), v: f.v.toFixed(2), where: where(f.offset), b: f.blur.toFixed(3), verdict: verdict(f.blur) });
}

/* ---------- step 1: accommodation ---------- */
const s1 = { seen: new Set([5]), anim: false };
function draw1() {
  const i = num('u1'), u = M.POS[i], acc = num('a1'); s1.seen.add(i);
  $('u1v').textContent = dist(u); $('a1v').textContent = `+${acc.toFixed(2)} D → f = ${(1000 / (M.P0 + acc)).toFixed(2)} mm`;
  const Ve = M.objV(u), need = M.need(M.L0, Ve), f = M.focus(M.L0, Ve, acc), fNeed = 1000 / (M.P0 + need), fNow = 1000 / (M.P0 + acc);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1eye'), 8, 16, W - 16);
  drawEye(ctx, W, { L: M.L0, u, acc });
  const fMin = 1000 / (M.P0 + M.A_YOUNG);
  const m = panel(ctx, W, { top: PLOT.top, bottom: H - 26, xMin: -0.4, xMax: 15, yMin: 13, yMax: 17.5, yTicks: [13, 14, 15, 16, 17], title: t('c1plot') });
  distAxis(ctx, m);
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.13)'; ctx.fillRect(m.P.l, m.y(M.L0), m.P.r - m.P.l, m.y(fMin) - m.y(M.L0));
  ctx.strokeStyle = 'rgba(126,226,168,0.55)'; ctx.lineWidth = 1; [M.L0, fMin].forEach(v => { ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); }); ctx.restore();
  hline(ctx, m, fNow, C.text, [5, 4], 1.4);
  [...s1.seen].forEach(k => { const n = M.need(M.L0, M.objV(M.POS[k])), fy = 1000 / (M.P0 + n); dot(ctx, m.x(POSV[k]), m.y(fy), 4, n > M.A_YOUNG + 1e-9 ? C.pink : C.cyan); });
  dot(ctx, m.x(POSV[i]), m.y(fNeed), 7.5, C.text, true);
  drawView('v1', f.blur);
  let state;
  if (need > M.A_YOUNG + 1e-9) state = t('stOut');
  else state = Math.abs(f.offset) < 0.02 ? t('stOn') : f.offset > 0 ? t('stBehind', { x: f.offset.toFixed(2) }) : t('stAhead', { x: Math.abs(f.offset).toFixed(2) });
  $('r1').textContent = (s1.anim ? t('s1prog', { acc: acc.toFixed(2) }) : '') + t('s1readout', { u: at(u), fneed: fNeed.toFixed(2), need: need.toFixed(2), acc: acc.toFixed(2), f: fNow.toFixed(2), state, b: f.blur.toFixed(3), verdict: verdict(f.blur) });
}

/* ---------- step 2: axial length ---------- */
const s2 = { hist: ['17.0'] };
function draw2() {
  const L = num('L2'), i = num('u2'), u = M.POS[i], key = L.toFixed(1);
  s2.hist = s2.hist.filter(k => k !== key); s2.hist.push(key); if (s2.hist.length > 6) s2.hist.shift();
  $('L2v').textContent = L.toFixed(1); $('u2v').textContent = dist(u);
  const a = M.autoFocus(L, u), R = M.refErr(L);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2eye'), 8, 16, W - 16);
  drawEye(ctx, W, { L, u, acc: a.acc });
  const m = panel(ctx, W, { top: PLOT.top, bottom: H - 26, left: 62, xMin: -0.4, xMax: 15, yMin: 0, yMax: 1, title: t('c2plot') });
  distAxis(ctx, m);
  const rowH = Math.min(17, (m.P.b - m.P.t) / 6);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right';
  s2.hist.forEach((k, r) => {
    const Lk = Number(k), Rk = M.refErr(Lk), lo = Math.max(0, -Rk), hi = Math.min(15, M.A_YOUNG - Rk), yc = m.P.t + rowH * (r + 0.5), cur = k === key;
    ctx.fillStyle = cur ? C.text : C.muted; ctx.fillText(`${k} mm`, m.P.l - 6, yc + 4);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.P.l, yc); ctx.lineTo(m.P.r, yc); ctx.stroke();
    if (hi > lo) { ctx.fillStyle = cur ? C.cyan : C.raw; ctx.fillRect(m.x(lo), yc - rowH * 0.3, m.x(hi) - m.x(lo), rowH * 0.6); }
  });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(m.x(POSV[i]), m.P.t - 2); ctx.lineTo(m.x(POSV[i]), m.P.b); ctx.stroke(); ctx.restore();
  drawView('v2', a.blur);
  const kind = Math.abs(R) < 0.005 ? t('kindNormal') : R < 0 ? t('kindMyopia') : t('kindHyper');
  const state = Math.abs(a.residual) < 1e-9 ? t('stAcc', { acc: a.acc.toFixed(2) }) : a.residual < 0 ? t('stRelaxAhead', { x: Math.abs(a.offset).toFixed(2) }) : t('stMaxBehind', { x: a.offset.toFixed(2) });
  $('r2').textContent = t('s2readout', { L: L.toFixed(1), kind, R: sgn(R), deg: M.degrees(R), far: distOrInf(M.farPoint(L)), near: distOrInf(M.nearPoint(L, M.A_YOUNG)), u: at(u), state, b: a.blur.toFixed(3), verdict: verdict(a.blur) });
}

/* ---------- step 3: glasses for distance ---------- */
const s3 = { L: null, pts: new Map() };
const status3 = a => (a.blur > M.BLUR_OK + 1e-12 ? 'blur' : a.acc > 0.005 ? 'strain' : 'ok');
function draw3() {
  const L = num('L3'), Pg = num('g3');
  if (s3.L !== L) { s3.L = L; s3.pts.clear(); }
  const a = M.autoFocus(L, Infinity, Pg);
  s3.pts.set(Pg.toFixed(2), { Pg, blur: a.blur, st: status3(a) });
  $('L3v').textContent = L.toFixed(1); $('g3v').textContent = `${sgn(Pg)} D`;
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3eye'), 8, 16, W - 16);
  drawEye(ctx, W, { L, u: Infinity, Pg, acc: a.acc });
  const m = panel(ctx, W, { top: PLOT.top, bottom: H - 26, left: 46, xMin: -8, xMax: 4, yMin: 0, yMax: 1, yMap: Math.sqrt, yTicks: [0, 0.012, 0.1, 0.4, 1], xTickList: [-8, -6, -4, -2, 0, 2, 4], title: t('c3plot') });
  hline(ctx, m, M.BLUR_OK, C.green, [5, 4], 1.4);
  const col = { ok: C.cyan, strain: C.orange, blur: C.ghost };
  s3.pts.forEach(p => dot(ctx, m.x(p.Pg), m.y(Math.min(1, p.blur)), 3.8, col[p.st]));
  dot(ctx, m.x(Pg), m.y(Math.min(1, a.blur)), 7.5, C.text, true);
  drawView('v3', a.blur);
  const kind = Pg === 0 ? t('lensNone') : Pg < 0 ? t('lensConcave', { deg: M.degrees(Pg) }) : t('lensConvex', { deg: M.degrees(Pg) });
  let state;
  if (a.residual < -1e-9) state = t('st3Ahead', { x: Math.abs(a.offset).toFixed(2) });
  else if (a.residual > 1e-9) state = t('st3Behind', { x: a.offset.toFixed(2) });
  else state = a.acc > 0.005 ? t('st3Strain', { acc: a.acc.toFixed(2) }) : t('st3On');
  $('r3').textContent = t('s3readout', { P: sgn(Pg), kind, state, b: a.blur.toFixed(3), verdict: verdict(a.blur), best: sgn(M.bestLens(L)), weak: sgn(M.weakestFarLens(L)) });
}

/* ---------- step 4: ageing eyes and reading glasses ---------- */
const s4 = { ages: new Set([20]) };
function draw4() {
  const age = num('age4'), Pg = num('g4'); s4.ages.add(age);
  $('age4v').textContent = String(age); $('g4v').textContent = `${sgn(Pg)} D`;
  const A = M.ampAtAge(age), a = M.autoFocus(M.L0, M.READ, Pg, A), needR = M.need(M.L0, M.objV(M.READ));
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4eye'), 8, 16, W - 16);
  drawEye(ctx, W, { L: M.L0, u: M.READ, Pg, acc: a.acc });
  const m = panel(ctx, W, { top: PLOT.top, bottom: H - 26, xMin: 10, xMax: 70, yMin: 5, yMax: 300, yMap: Math.log, yTicks: [5, 10, 20, 50, 100, 200], xTickList: [10, 20, 30, 40, 50, 60, 70], title: t('c4plot') });
  const npCm = ag => M.nearPoint(M.L0, M.ampAtAge(ag)) / 10;
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
  for (let ag = 10; ag <= 70; ag += 0.5) { const X = m.x(ag), Yp = m.y(Math.min(300, npCm(ag))); if (ag === 10) ctx.moveTo(X, Yp); else ctx.lineTo(X, Yp); }
  ctx.stroke(); ctx.restore();
  hline(ctx, m, M.READ / 10, C.green, [6, 4], 1.6);
  s4.ages.forEach(ag => dot(ctx, m.x(ag), m.y(Math.min(300, npCm(ag))), 3.8, C.cyan));
  dot(ctx, m.x(age), m.y(Math.min(300, npCm(age))), 7.5, C.text, true);
  const nearG = M.nearPoint(M.L0, A, Pg);
  if (Pg && nearG) dot(ctx, m.x(age), m.y(Math.max(5, Math.min(300, nearG / 10))), 5, C.orange);
  drawView('v4', a.blur);
  const minLens = M.readingLens(age);
  const state = a.need <= A + 1e-9 ? t('st4Ok') : t('st4Short', { x: (a.need - A).toFixed(2) });
  $('r4').textContent = t('s4readout', { age, A: A.toFixed(1), near: distOrInf(M.nearPoint(M.L0, A)), needR: needR.toFixed(2), P: sgn(Pg), needG: a.need.toFixed(2), state, b: a.blur.toFixed(3), verdict: verdict(a.blur),
    min: minLens === 0 ? t('noLens') : minLens === null ? t('none') : `${sgn(minLens)} D`, nearG: distOrInf(nearG), farG: distOrInf(M.farPoint(M.L0, Pg)) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('u0').addEventListener('input', draw0);
  $('u1').addEventListener('input', () => { stopAnim('s1'); s1.anim = false; draw1(); });
  $('a1').addEventListener('input', () => { stopAnim('s1'); s1.anim = false; draw1(); });
  $('auto1').addEventListener('click', () => {
    const from = num('a1'), to = Math.max(0, Math.min(M.A_YOUNG, M.need(M.L0, M.objV(M.POS[num('u1')]))));
    s1.anim = true;
    animate('s1', 900, p => { const e = p < 1 ? 1 - Math.pow(1 - p, 3) : 1; $('a1').value = from + (to - from) * e; if (p >= 1) { $('a1').value = to; s1.anim = false; } draw1(); });
  });
  ['L2', 'u2'].forEach(id => $(id).addEventListener('input', draw2));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  ['L3', 'g3'].forEach(id => $(id).addEventListener('input', draw3));
  ['age4', 'g4'].forEach(id => $(id).addEventListener('input', draw4));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshEyeVision = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
