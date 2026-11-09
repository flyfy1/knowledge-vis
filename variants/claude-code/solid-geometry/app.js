'use strict';
// Solid geometry lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every solid, section, count and volume comes from window.SOLID_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks; all names and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SOLID_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', grid2: '#2a3a4d', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const PAINT = ['#55657a', '#7ee2a8', '#67d7f9', '#ffb454'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const dim = (hex, k) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round((n >> 16) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  // 3D views (data-sq) shrink on narrow screens instead of leaving empty bands; never taller than authored
  const height = canvas.dataset.sq ? Math.min(Number(canvas.dataset.h), Math.round(width * 0.82 + 34)) : Number(canvas.dataset.h);
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
// 2D plot panel with tick labels outside the box (x labels thinned).
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid2; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  (o.yTicks || []).forEach((v, i) => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yLab ? o.yLab[i] : fmt(v), P.l - 5, y(v) + 4); });
  let last = -Infinity; ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    const s = fmt(v), w = ctx.measureText(s).width, X = Math.min(Math.max(x(v), P.l), W - w / 2 - 1);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke();
    if (X - w / 2 < last + 6) continue; ctx.fillText(s, X, P.b + 15); last = X + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}

/* ---------- a tiny orthographic 3D renderer (z up) ---------- */
function camera(W, H, yawDeg, pitchDeg, R, top = 26) {
  const a = yawDeg * Math.PI / 180, b = pitchDeg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  const s = Math.min(W - 16, H - top - 10) / (2 * R), cx = W / 2, cy = top + (H - top) / 2;
  const P = p => { const x1 = p[0] * ca - p[1] * sa, y1 = p[0] * sa + p[1] * ca; return { x: cx + x1 * s, y: cy - (p[2] * cb + y1 * sb) * s, d: y1 * cb - p[2] * sb }; };
  return { P, s, dir: v => P(v).d - P([0, 0, 0]).d };
}
// polys: [{pts, fill, stroke, lw}] painted far → near
function paint(ctx, cam, polys) {
  polys.forEach(q => { q.pp = q.pts.map(cam.P); q.depth = q.pp.reduce((s, p) => s + p.d, 0) / q.pp.length + (q.bias || 0); });
  polys.sort((a, b) => b.depth - a.depth).forEach(q => {
    ctx.beginPath(); q.pp.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
    if (q.fill) { ctx.fillStyle = q.fill; ctx.fill(); }
    if (q.stroke) { ctx.strokeStyle = q.stroke; ctx.lineWidth = q.lw || 1; ctx.lineJoin = 'round'; ctx.stroke(); }
  });
}
// edges dimmed by depth: near = bright, far = faint
function edges(ctx, cam, segs, color, lw = 2) {
  const pr = segs.map(([a, b]) => [cam.P(a), cam.P(b)]), ds = pr.flatMap(([a, b]) => [a.d, b.d]), lo = Math.min(...ds), hi = Math.max(...ds);
  pr.forEach(([a, b]) => { const f = hi > lo ? ((a.d + b.d) / 2 - lo) / (hi - lo) : 0; ctx.strokeStyle = hexA(color, 1 - 0.7 * f); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
}
const shift = (p, c) => [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
const H0 = [0.5, 0.5, 0.5];

/* ---------- animation runner ---------- */
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
function pressGroup(id, v) { document.querySelectorAll(`#${id} [data-v]`).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false')); }

/* ---------- step 0: V − E + F ---------- */
const s0 = { solid: 'cube', seen: new Map() };
function draw0() {
  const yaw = num('yaw0'), pit = num('pit0'), S = M.SOLIDS[s0.solid](), c = M.counts(s0.solid);
  $('yaw0v').textContent = yaw + '°'; $('pit0v').textContent = pit + '°';
  pressGroup('solidPick', s0.solid);
  s0.seen.set(s0.solid, c.chi);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 17, W - 16);
  const cam = camera(W, H, yaw, pit, 1.25);
  paint(ctx, cam, S.faces.map(f => ({ pts: f.map(i => S.vs[i]), fill: 'rgba(154,170,189,0.13)' })));
  edges(ctx, cam, M.edgesOf(S).map(([a, b]) => [S.vs[a], S.vs[b]]), C.cyan, 2.2);
  S.vs.map(cam.P).sort((a, b) => b.d - a.d).forEach(p => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); });
  $('r0').textContent = t('s0readout', { name: t('sol_' + s0.solid), ...c });
  $('tally0').textContent = t('tally0', { list: [...s0.seen].map(([k, v]) => t('tallyItem', { name: t('sol_' + k), chi: v })).join(' · ') });
}

/* ---------- shared cube + section drawing ---------- */
function cubeWithSection(ctx, W, H, yaw, P) {
  const cam = camera(W, H, yaw, 24, 0.98);
  const polys = M.CUBE_FACES.map(f => ({ pts: f.map(i => shift(M.CUBE_VS[i], H0)), fill: 'rgba(103,215,249,0.05)' }));
  if (P.length) polys.push({ pts: P.map(p => shift(p, H0)), fill: hexA(C.orange, 0.6), stroke: C.orange, lw: 2, bias: -0.001 });
  paint(ctx, cam, polys);
  edges(ctx, cam, M.CUBE_EDGES.map(([a, b]) => [shift(M.CUBE_VS[a], H0), shift(M.CUBE_VS[b], H0)]), C.cyan, 1.8);
}
// the polygon face-on, centred, at a fixed scale (1 unit = s px), with a 0.5-unit grid
function trueShape(ctx, P, n, box) {
  const [e1, e2] = M.planeBasis(n), cx = (box.l + box.r) / 2, cy = (box.t + box.b) / 2, s = Math.min(box.r - box.l, box.b - box.t) / 1.7;
  ctx.save(); ctx.beginPath(); ctx.rect(box.l, box.t, box.r - box.l, box.b - box.t); ctx.clip();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let k = -6; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(cx + k * 0.5 * s, box.t); ctx.lineTo(cx + k * 0.5 * s, box.b); ctx.stroke(); ctx.beginPath(); ctx.moveTo(box.l, cy + k * 0.5 * s); ctx.lineTo(box.r, cy + k * 0.5 * s); ctx.stroke(); }
  if (P.length) {
    const c = P.reduce((a, p) => M.add(a, p), [0, 0, 0]).map(v => v / P.length);
    ctx.beginPath(); P.forEach((p, i) => { const d = M.sub(p, c), X = cx + M.dot(d, e1) * s, Y = cy - M.dot(d, e2) * s; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath();
    ctx.fillStyle = hexA(C.orange, 0.6); ctx.fill(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = C.grid2; ctx.strokeRect(box.l, box.t, box.r - box.l, box.b - box.t);
}

/* ---------- step 1: three preset cuts ---------- */
const s1 = { cut: 'diag', seen: new Map(), prog: '' };
const pOf = k => k / 30;
function draw1() {
  const k = num('p1'), p = pOf(k), yaw = num('yaw1'), r = M.presetSection(s1.cut, p);
  $('p1v').textContent = fmt(p, 2); $('yaw1v').textContent = yaw + '°';
  pressGroup('cutPick', s1.cut);
  s1.seen.set(k, r.area);
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 17, W - 16);
  cubeWithSection(ctx, W, H, yaw, r.P);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  title(ctx, t('c1b'), 8, 17, W - 16);
  const split = Math.round(26 + (H - 26) * 0.5);
  trueShape(ctx, r.P, M.PRESETS[s1.cut].n, { l: 40, r: W - 12, t: 26, b: split - 6 });
  const A = panel(ctx, W, { top: split + 8, bottom: H - 22, xMin: 0, xMax: 1, yMin: 0, yMax: 1.5, yTicks: [0, 0.5, 1, 1.5], xTicks: [0, 0.25, 0.5, 0.75, 1] });
  ctx.save(); ctx.strokeStyle = hexA(C.orange, 0.5); ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
  for (let j = 1; j <= 29; j++) { const X = A.x(pOf(j)), Y = A.y(M.presetSection(s1.cut, pOf(j)).area); if (j === 1) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); ctx.setLineDash([]);
  s1.seen.forEach((v, j) => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(pOf(j)), A.y(v), 3.2, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(A.x(p), A.y(r.area), 5.5, 0, 7); ctx.fill(); ctx.restore();
  $('r1').textContent = t('s1readout', { prog: s1.prog, cut: t('cut_' + s1.cut), p: fmt(p, 2), shape: t('shp_' + r.kind), n: r.n, area: r.area.toFixed(3) });
}

/* ---------- step 2: any cut ---------- */
const s2 = { found: new Set() };
function draw2() {
  const th = num('th2'), ph = num('ph2'), k = num('p2'), yaw = num('yaw2'), r = M.freeSection(th, ph, pOf(k));
  $('th2v').textContent = th + '°'; $('ph2v').textContent = ph + '°'; $('p2v').textContent = fmt(pOf(k), 2); $('yaw2v').textContent = yaw + '°';
  if (r.n >= 3) s2.found.add(r.n);
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 17, W - 16);
  cubeWithSection(ctx, W, H, yaw, r.P);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  title(ctx, t('c2b'), 8, 17, W - 16);
  trueShape(ctx, r.P, r.normal, { l: 12, r: W - 12, t: 26, b: H - 12 });
  $('chips2').innerHTML = [3, 4, 5, 6].map(n => `<span class="chip${s2.found.has(n) ? ' on' : ''}">${t('chip', { n })}${s2.found.has(n) ? ' ✓' : ''}</span>`).join('') + `<span class="chip never">${t('chipNever')}</span>`;
  $('r2').textContent = t('s2readout', { n: r.n, shape: t('shp_' + r.kind), area: r.area.toFixed(3), found: s2.found.size });
}

/* ---------- step 3: the painted cube ---------- */
function draw3() {
  const n = num('n3'), gap = num('gap3'), yaw = num('yaw3');
  $('n3v').textContent = String(n); $('gap3v').textContent = fmt(gap); $('yaw3v').textContent = yaw + '°';
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 17, W - 16);
  const step = 1 + gap * 0.9, half = (n - 1) / 2, R = (n * step) * 0.92;
  const cam = camera(W, H, yaw, 28, R);
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].filter(v => cam.dir(v) < 0);
  const cubes = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    const c = [(i - half) * step, (j - half) * step, (k - half) * step];
    // hide fully enclosed cubes when packed tight (they cannot be seen)
    if (gap === 0 && i > 0 && j > 0 && k > 0 && i < n - 1 && j < n - 1 && k < n - 1) continue;
    cubes.push({ c, col: PAINT[M.paintCount(n, i, j, k)], d: cam.P(c).d });
  }
  cubes.sort((a, b) => b.d - a.d);
  const shade = v => (v[2] === 1 ? 1 : v[0] !== 0 ? 0.82 : 0.66);
  cubes.forEach(q => {
    dirs.forEach(v => {
      const ax = v.findIndex(x => x !== 0), o = [0, 1, 2].filter(a => a !== ax), pts = [];
      for (const [u, w] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const p = q.c.slice(); p[ax] += v[ax] * 0.5; p[o[0]] += u * 0.5; p[o[1]] += w * 0.5; pts.push(cam.P(p)); }
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
      ctx.fillStyle = dim(q.col, shade(v)); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.stroke();
    });
  });
  const c = M.painted(n), S = 6 * n * n, Vol = n * n * n;
  $('r3').textContent = t('s3readout', { n, total: Vol, c3: c[3], c2: c[2], c1: c[1], c0: c[0], S, Vol, ratio: fmt(S / Vol, 3), frac: fmt(100 * c[0] / Vol, 1) });
}

/* ---------- step 4: three pyramids ---------- */
const PCOL = [C.orange, C.cyan, C.green];
function draw4() {
  const ex = num('ex4'), yaw = num('yaw4');
  $('ex4v').textContent = fmt(ex); $('yaw4v').textContent = yaw + '°';
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 17, W - 16);
  const cam = camera(W, H, yaw, 26, 1.45);
  edges(ctx, cam, M.CUBE_EDGES.map(([a, b]) => [shift(M.CUBE_VS[a], H0), shift(M.CUBE_VS[b], H0)]), C.ghost, 1);
  const polys = [];
  M.PYRS.forEach((Q, k) => {
    const off = [0, 0, 0]; off[Q.ax] = -0.75 * ex;
    const mv = p => M.add(shift(p, H0), off);
    const base = Q.base.map(i => M.CUBE_VS[i]), c = base.reduce((a, p) => M.add(a, p), [0, 0, 0]).map(v => v / 4), axes = [0, 1, 2].filter(a => a !== Q.ax);
    base.sort((p, q) => Math.atan2(p[axes[1]] - c[axes[1]], p[axes[0]] - c[axes[0]]) - Math.atan2(q[axes[1]] - c[axes[1]], q[axes[0]] - c[axes[0]]));
    const apex = M.CUBE_VS[Q.apex];
    polys.push({ pts: base.map(mv), fill: hexA(PCOL[k], 0.55), stroke: PCOL[k], lw: 1.6 });
    base.forEach((p, i) => polys.push({ pts: [p, base[(i + 1) % 4], apex].map(mv), fill: hexA(PCOL[k], 0.42), stroke: PCOL[k], lw: 1.6 }));
  });
  paint(ctx, cam, polys);
  const v = M.PYRS.map(M.pyrVolume);
  $('r4').textContent = t('s4readout', { v1: v[0].toFixed(4), v2: v[1].toFixed(4), v3: v[2].toFixed(4), sum: (v[0] + v[1] + v[2]).toFixed(4), third: (1 / 3).toFixed(4) });
}

/* ---------- step 5: slabs and Cavalieri ---------- */
const s5 = { seen: new Set([5]) };
function draw5() {
  const n = num('n5'), s = num('s5'), yaw = num('yaw5');
  $('n5v').textContent = String(n); $('s5v').textContent = fmt(s, 1); $('yaw5v').textContent = yaw + '°';
  s5.seen.add(n);
  let { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5a'), 8, 17, W - 16);
  const cam = camera(W, H, yaw, 22, 1.0);
  const O = [0.5, 0.5, 0.5], polys = [];
  M.slabs(n, s).forEach(q => {
    const x0 = q.cx - q.side / 2, x1 = q.cx + q.side / 2, y0 = q.cy - q.side / 2, y1 = q.cy + q.side / 2;
    const v = [[x0, y0, q.z0], [x1, y0, q.z0], [x1, y1, q.z0], [x0, y1, q.z0], [x0, y0, q.z1], [x1, y0, q.z1], [x1, y1, q.z1], [x0, y1, q.z1]].map(p => shift(p, O));
    M.CUBE_FACES.forEach(f => polys.push({ pts: f.map(i => v[i]), fill: 'rgba(103,215,249,0.22)', stroke: 'rgba(103,215,249,0.55)', lw: 1 }));
  });
  paint(ctx, cam, polys);
  const apex = shift([0.5 + s, 0.5, 1], O), base = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]].map(p => shift(p, O));
  ctx.lineWidth = 2; ctx.strokeStyle = C.orange;
  base.forEach((p, i) => { const a = cam.P(p), b = cam.P(base[(i + 1) % 4]), c = cam.P(apex); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke(); });

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const A = panel(ctx, W, { top: 26, bottom: H - 22, xMin: 0, xMax: 31, yMin: 0.3, yMax: 1.05, yTicks: [1 / 3, 0.5, 0.75, 1], yLab: ['1/3', '0.5', '0.75', '1'], xTicks: [1, 5, 10, 15, 20, 25, 30], title: t('c5b') });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(1 / 3)); ctx.lineTo(A.P.r, A.y(1 / 3)); ctx.stroke(); ctx.setLineDash([]);
  s5.seen.forEach(m => { if (m === n) return; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(m), A.y(M.slabSum(m, s)), 3.4, 0, 7); ctx.fill(); });
  const sum = M.slabSum(n, s);
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(A.x(n), A.y(sum), 6, 0, 7); ctx.fill(); ctx.restore();
  $('r5').textContent = t('s5readout', { n, sum: sum.toFixed(4), diff: (sum - 1 / 3).toFixed(4), ex: M.slabExact(n).toFixed(4), s: fmt(s, 1) });
}

/* ---------- step 6: nets ---------- */
const s6 = { i: 0, f: 0, guess: {}, revealed: {}, seen: new Set([0]) };
function draw6() {
  const net = M.NETS[s6.i], yaw = num('yaw6'), f = s6.f, truth = M.foldCheck(net.cells);
  $('f6v').textContent = fmt(f); $('yaw6v').textContent = yaw + '°';
  if (f >= 1) s6.revealed[s6.i] = true;
  const g = s6.guess[s6.i], rev = !!s6.revealed[s6.i];
  $('guessY').setAttribute('aria-pressed', g === 'y' ? 'true' : 'false'); $('guessN').setAttribute('aria-pressed', g === 'n' ? 'true' : 'false');
  $('guessY').disabled = rev; $('guessN').disabled = rev;
  const { ctx, W, H } = fitCanvas($('c6'));
  title(ctx, t('c6a'), 8, 17, W - 16);
  const faces = M.fold(net.cells, f);
  const all = faces.flatMap(q => q.corners), lo = [0, 1, 2].map(a => Math.min(...all.map(p => p[a]))), hi = [0, 1, 2].map(a => Math.max(...all.map(p => p[a])));
  const mid = lo.map((v, a) => (v + hi[a]) / 2);
  const ext = Math.max(1, ...[0, 1, 2].map(a => hi[a] - lo[a]));
  const cam = camera(W, H, yaw, 38, 0.52 * ext + 0.42);
  const clash = f >= 1 && truth.clash ? truth.clash : [];
  paint(ctx, cam, faces.map((q, i) => ({ pts: q.corners.map(p => shift(p, mid)), fill: hexA(clash.includes(i) ? C.pink : i === 0 ? C.orange : C.cyan, 0.62), stroke: clash.includes(i) ? C.pink : i === 0 ? C.orange : C.cyan, lw: 1.8 })));
  let state;
  if (f <= 0) state = t('st_flat');
  else if (f < 1) state = t('st_part', { deg: Math.round(f * 90) });
  else state = t(truth.ok ? 'st_ok' : 'st_bad') + ' ' + (g ? t((g === 'y') === truth.ok ? 'guessRight' : 'guessWrong') : '');
  $('r6').textContent = t('s6readout', { i: s6.i + 1, state: state.trim() });
  const gs = Object.keys(s6.guess).map(Number), right = gs.filter(i => s6.revealed[i] && (s6.guess[i] === 'y') === M.foldCheck(M.NETS[i].cells).ok).length;
  $('tally6').textContent = t('tally6', { seen: s6.seen.size, g: gs.length, right });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  document.querySelectorAll('#solidPick [data-v]').forEach(b => b.addEventListener('click', () => { s0.solid = b.dataset.v; draw0(); }));
  ['yaw0', 'pit0'].forEach(id => $(id).addEventListener('input', draw0));

  document.querySelectorAll('#cutPick [data-v]').forEach(b => b.addEventListener('click', () => { stopAnim('s1'); s1.cut = b.dataset.v; s1.seen.clear(); s1.prog = ''; draw1(); }));
  $('p1').addEventListener('input', () => { stopAnim('s1'); s1.prog = ''; draw1(); });
  $('yaw1').addEventListener('input', draw1);
  $('sweep1').addEventListener('click', () => {
    s1.seen.clear();
    animate('s1', 29 * 160, p => {
      const k = 1 + Math.min(28, Math.floor(p * 29));
      for (let j = 1; j <= k; j++) s1.seen.set(j, M.presetSection(s1.cut, pOf(j)).area);
      $('p1').value = k; s1.prog = k < 29 ? t('s1progress', { c: k, N: 29 }) : ''; draw1();
    });
  });

  ['th2', 'ph2', 'p2', 'yaw2'].forEach(id => $(id).addEventListener('input', draw2));
  $('clear2').addEventListener('click', () => { s2.found.clear(); draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });

  ['n3', 'gap3', 'yaw3'].forEach(id => $(id).addEventListener('input', draw3));
  ['ex4', 'yaw4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); draw4(); }));
  $('play4').addEventListener('click', () => animate('s4', 3200, p => { $('ex4').value = Math.round(Math.sin(Math.PI * p) * 20) / 20; draw4(); }));

  ['n5', 's5', 'yaw5'].forEach(id => $(id).addEventListener('input', draw5));

  $('f6').addEventListener('input', () => { stopAnim('s6'); s6.f = num('f6'); draw6(); });
  $('yaw6').addEventListener('input', draw6);
  $('guessY').addEventListener('click', () => { if (!s6.revealed[s6.i]) { s6.guess[s6.i] = 'y'; draw6(); } });
  $('guessN').addEventListener('click', () => { if (!s6.revealed[s6.i]) { s6.guess[s6.i] = 'n'; draw6(); } });
  $('fold6').addEventListener('click', () => { const f0 = s6.f; animate('s6', 1800 * (1 - f0) + 1, p => { s6.f = f0 + (1 - f0) * p; $('f6').value = s6.f; draw6(); }); });
  $('next6').addEventListener('click', () => { stopAnim('s6'); s6.i = (s6.i + 1) % M.NETS.length; s6.seen.add(s6.i); s6.f = 0; $('f6').value = 0; draw6(); });

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
