'use strict';
// Resonance lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.RESONANCE_MODEL (model.js): "measured" values from its
// RK4 simulation, "formula" values from its closed forms. Canvas text is limited to panel titles and
// axis ticks in reserved rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.RESONANCE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', metal: '#8ea3b8', ghost: '#55657a', block: '#3d5a78' };
const B_COL = { 0.2: C.violet, 0.4: C.cyan, 0.8: C.green, 1.6: C.orange };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const fix = (v, d) => (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d);

function fitCanvas(canvas, height) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function label(ctx, text, x, y, { align = 'left', maxW = 9999, size = 12, weight = 400, color = C.text, W = 9999 } = {}) {
  ctx.save(); ctx.fillStyle = color; let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  const w = ctx.measureText(text).width;
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(4, Math.min(W - 4 - w, x0));
  ctx.textAlign = 'left'; ctx.fillText(text, x0, y); ctx.restore();
}
const title = (ctx, text, y, W) => label(ctx, text, 10, y, { maxW: W - 20, size: 12, weight: 600, W });
function arrow(ctx, x0, y0, x1, y1, color, lw = 2.5, head = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0); if (len < 1) return;
  const hd = Math.min(head, len * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hd * 0.7 * Math.cos(a), y1 - hd * 0.7 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(a - 0.45), y1 - hd * Math.sin(a - 0.45)); ctx.lineTo(x1 - hd * Math.cos(a + 0.45), y1 - hd * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function frame(ctx, o) {
  const x = v => o.l + (v - o.xMin) / (o.xMax - o.xMin) * (o.r - o.l);
  const y = v => o.b - (v - o.yMin) / (o.yMax - o.yMin) * (o.b - o.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(o.l, y(v)); ctx.lineTo(o.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), o.l - 5, y(v) + 4); }
  for (const v of o.xTicks) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), o.b); ctx.lineTo(x(v), o.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), o.b + 16); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(o.l, o.t); ctx.lineTo(o.l, o.b); ctx.stroke();
  ctx.restore();
  return { x, y };
}
function xTicks(max, W) { const step = W < 420 ? (max > 20 ? 10 : 2) : (max > 20 ? 10 : 1); const out = []; for (let v = 0; v <= max + 1e-9; v += step) out.push(v); return out; }
// Trace one simulation (x in m → cm) up to a time limit.
function trace(ctx, f, sim, tMax, color, lw = 2, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath();
  for (let i = 0; i < sim.t.length && sim.t[i] <= tMax + 1e-9; i++) { const X = f.x(sim.t[i]), Y = f.y(sim.x[i] * 100); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function valueAt(sim, tq) { const dt = sim.t[1] - sim.t[0], i = Math.min(sim.t.length - 1, Math.max(0, Math.round(tq / dt))); return sim.x[i]; }

// Top view of the spring and block. x in metres, range ±xr metres mapped onto the strip.
function springView(ctx, W, top, x, xr, push) {
  const wall = 16, rest = W * 0.5, half = Math.min(W * 0.5 - 70, 220), px = rest + x / xr * half, bw = 34, bh = 28, cy = top + 30;
  ctx.fillStyle = C.metal; ctx.fillRect(wall - 6, cy - 22, 6, 44);
  // rest mark
  ctx.save(); ctx.strokeStyle = C.axis; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(rest, cy - 24); ctx.lineTo(rest, cy + 24); ctx.stroke(); ctx.restore();
  // spring zigzag from the wall to the block's left face
  const x0 = wall, x1 = px - bw / 2, coils = 12;
  ctx.strokeStyle = C.metal; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, cy);
  for (let i = 1; i <= coils * 2; i++) ctx.lineTo(x0 + (x1 - x0) * i / (coils * 2 + 1), cy + (i % 2 ? -9 : 9));
  ctx.lineTo(x1, cy); ctx.stroke();
  ctx.fillStyle = C.block; ctx.fillRect(px - bw / 2, cy - bh / 2, bw, bh); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.strokeRect(px - bw / 2, cy - bh / 2, bw, bh);
  if (push !== undefined) { const L = 34 * push; if (Math.abs(L) > 1.5) arrow(ctx, px + (L > 0 ? bw / 2 + 4 : -bw / 2 - 4) - (L > 0 ? 0 : 0), cy, px + (L > 0 ? bw / 2 + 4 + L : -bw / 2 - 4 + L), cy, C.orange, 3, 8); }
}

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

/* ---------- step 0: natural period ---------- */
const s0 = { cur: null, ghosts: [], head: 1, played: null };
function compute0() { const m = num('m0'), k = num('k0'); s0.cur = { m, k, ...M.free(m, k) }; }
function draw0() {
  const { m, k, sim, Tm, Tf } = s0.cur, T = 8, tNow = s0.head * T;
  $('m0v').textContent = fmt(m) + ' kg'; $('k0v').textContent = k + ' N/m';
  const { ctx, W, H } = fitCanvas($('c0'), 330);
  title(ctx, t('cSpring'), 18, W);
  springView(ctx, W, 28, valueAt(sim, tNow), 0.12);
  title(ctx, t('c0b'), 112, W);
  const f = frame(ctx, { l: 36, r: W - 12, t: 124, b: H - 26, xMin: 0, xMax: T, yMin: -12, yMax: 12, xTicks: xTicks(T, W), yTicks: [-10, 0, 10] });
  s0.ghosts.forEach((g, i) => trace(ctx, f, g.sim, T, C.ghost, 1.5, 0.9 - 0.3 * i));
  trace(ctx, f, sim, tNow, C.cyan, 2.2);
  // upward zero crossings up to the playhead
  ctx.fillStyle = C.text;
  for (let i = 1; i < sim.x.length && sim.t[i] <= tNow; i++) if (sim.x[i - 1] < 0 && sim.x[i] >= 0) { const tc = sim.t[i - 1] + (-sim.x[i - 1]) / (sim.x[i] - sim.x[i - 1]) * (sim.t[i] - sim.t[i - 1]); ctx.beginPath(); ctx.arc(f.x(tc), f.y(0), 3.5, 0, 7); ctx.fill(); }
  $('r0').textContent = t('s0readout', { m: fmt(m), k, Tm: fix(Tm, 3), Tf: fix(Tf, 3), f: fix(1 / Tm, 3) });
}
function play0() {
  if (s0.played && (s0.played.m !== s0.cur.m || s0.played.k !== s0.cur.k)) { s0.ghosts.unshift(s0.played); s0.ghosts = s0.ghosts.slice(0, 2); }
  s0.played = s0.cur;
  animate('s0', 8000, p => { s0.head = p; draw0(); });
}

/* ---------- step 1: damping ---------- */
const s1 = { head: 1 };
function draw1() {
  const b = M.B_LIST[num('b1')], d = M.damped(b), T = 10, tNow = s1.head * T, crit = Math.abs(b - M.bCritical(M.SYS.m, M.SYS.k)) < 1e-9;
  $('b1v').textContent = fmt(b, 1) + (crit ? t('bCritTag') : '');
  const { ctx, W, H } = fitCanvas($('c1'), 330);
  title(ctx, t('cSpring'), 18, W);
  springView(ctx, W, 28, valueAt(d.sim, tNow), 0.12);
  title(ctx, t('c1b'), 112, W);
  const f = frame(ctx, { l: 36, r: W - 12, t: 124, b: H - 26, xMin: 0, xMax: T, yMin: -12, yMax: 12, xTicks: xTicks(T, W), yTicks: [-10, 0, 10] });
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
  [1, -1].forEach(sg => { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const tt = T * i / 200, Y = f.y(sg * d.envelope(tt) * 100); if (i) ctx.lineTo(f.x(tt), Y); else ctx.moveTo(f.x(tt), Y); } ctx.stroke(); });
  ctx.restore();
  trace(ctx, f, d.sim, tNow, C.cyan, 2.2);
  ctx.fillStyle = C.text; M.peaks(d.sim).forEach(p => { if (p.t <= tNow && p.x * 100 > 0.3) { ctx.beginPath(); ctx.arc(f.x(p.t), f.y(p.x * 100), 3.5, 0, 7); ctx.fill(); } });
  const bc = fmt(M.bCritical(M.SYS.m, M.SYS.k), 1);
  if (b === 0) $('r1').textContent = t('s1readFree', { rm: fmt(d.ratioM * 100, 1) });
  else if (d.under) $('r1').textContent = t('s1readUnder', { b: fmt(b, 1), rm: fmt(d.ratioM * 100, 1), rf: fmt(d.ratioF * 100, 1), th: fmt(d.tHalf, 2) });
  else $('r1').textContent = t('s1readOver', { b: fmt(b, 1), bc, n: d.crossings });
}

/* ---------- step 2: driven from rest ---------- */
const T2 = 50, s2 = { run: null, head: 0, ghost: null };
function draw2() {
  const r = num('ratio2'), A = M.steady(M.SYS.m, M.SYS.k, M.B_DRIVE, r * M.omega0(M.SYS.m, M.SYS.k)).A;
  $('ratio2v').textContent = fix(r, 2);
  const { ctx, W, H } = fitCanvas($('c2'), 360);
  title(ctx, t('cSpring'), 18, W);
  const run = s2.run, tNow = run ? s2.head * T2 : 0, xNow = run ? valueAt(run.sim, tNow) : 0;
  springView(ctx, W, 28, xNow, 0.45, run ? Math.cos(run.Omega * tNow) : 1);
  title(ctx, t('c2b'), 112, W);
  const f = frame(ctx, { l: 36, r: W - 12, t: 124, b: H - 26, xMin: 0, xMax: T2, yMin: -45, yMax: 45, xTicks: xTicks(T2, W), yTicks: [-40, -20, 0, 20, 40] });
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); [1, -1].forEach(sg => { ctx.beginPath(); ctx.moveTo(f.x(0), f.y(sg * A * 100)); ctx.lineTo(f.x(T2), f.y(sg * A * 100)); ctx.stroke(); }); ctx.restore();
  if (s2.ghost) trace(ctx, f, s2.ghost.sim, T2, C.ghost, 1.3, 0.9);
  if (run) trace(ctx, f, run.sim, tNow, C.cyan, 1.8);
  const xs = fmt(M.staticX() * 100, 1);
  if (!run) $('r2').textContent = t('s2idle', { r: fix(r, 2) });
  else if (s2.head < 1) $('r2').textContent = t('s2run', { r: fix(r, 2), t: Math.floor(tNow) });
  else $('r2').textContent = t('s2done', { r: fix(r, 2), Am: fmt(run.Am * 100, 1), Af: fmt(run.A * 100, 1), xs, ratio: fmt(run.A / M.staticX(), 1), old: s2.ghost ? t('s2old', { r: fix(s2.ghost.r, 2), A: fmt(s2.ghost.A * 100, 1) }) : '' });
}
function retire2() { stopAnim('s2'); if (s2.run && s2.head >= 1) s2.ghost = s2.run; s2.run = null; s2.head = 0; }
function play2() {
  retire2();
  s2.run = M.driven(num('ratio2'), M.B_DRIVE, T2); s2.head = 0;
  animate('s2', T2 * 1000 / 5, p => { s2.head = p; draw2(); });
}

/* ---------- step 3: resonance curve ---------- */
const s3 = { b: 0.4, dots: new Map(), sweep: null };
const key3 = (b, r) => b + ':' + r.toFixed(2);
function measure3(b, r) { const k = key3(b, r); if (!s3.dots.has(k)) s3.dots.set(k, { b, r, Am: M.driven(r, b).Am }); return s3.dots.get(k); }
function buildB() {
  M.B_CURVES.forEach(b => {
    const btn = document.createElement('button'); btn.className = 'btn toggle'; btn.type = 'button'; btn.dataset.step = '3'; btn.id = 'b3_' + String(b).replace('.', '_'); btn.textContent = fmt(b, 1);
    btn.addEventListener('click', () => { stopSweep(); s3.b = b; measure3(b, num('ratio3')); draw3(); });
    $('bButtons').appendChild(btn);
  });
}
function stopSweep() { stopAnim('s3'); s3.sweep = null; }
function draw3() {
  const r = num('ratio3'), b = s3.b, cur = measure3(b, r), w0 = M.omega0(M.SYS.m, M.SYS.k);
  $('ratio3v').textContent = fix(r, 2);
  M.B_CURVES.forEach(bb => $('b3_' + String(bb).replace('.', '_')).setAttribute('aria-pressed', bb === b ? 'true' : 'false'));
  $('lg3').innerHTML = M.B_CURVES.map(bb => `<span class="lg"><span class="sw" style="background:${B_COL[bb]}"></span><span>b = ${fmt(bb, 1)}</span></span>`).join('') + `<span class="lg"><span>${t('s3lgCurve')}</span></span><span class="lg"><span class="sw sw-dot"></span><span>${t('s3lgDot')}</span></span>`;
  const { ctx, W, H } = fitCanvas($('c3'), 340);
  title(ctx, t('c3'), 18, W);
  const f = frame(ctx, { l: 36, r: W - 12, t: 34, b: H - 26, xMin: 0.2, xMax: 2, yMin: 0, yMax: 80, xTicks: W < 420 ? [0.5, 1, 1.5, 2] : [0.2, 0.5, 0.8, 1, 1.2, 1.5, 2], yTicks: [0, 20, 40, 60, 80], xFmt: v => fmt(v, 1) });
  M.B_CURVES.forEach(bb => {
    ctx.strokeStyle = B_COL[bb]; ctx.lineWidth = bb === b ? 2.6 : 1.1; ctx.globalAlpha = bb === b ? 1 : 0.45; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const rr = 0.2 + 1.8 * i / 400, A = M.steady(M.SYS.m, M.SYS.k, bb, rr * w0).A * 100, Y = f.y(Math.min(A, 82)); if (i) ctx.lineTo(f.x(rr), Y); else ctx.moveTo(f.x(rr), Y); }
    ctx.stroke(); ctx.globalAlpha = 1;
  });
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(f.x(r), f.y(0)); ctx.lineTo(f.x(r), f.y(80)); ctx.stroke(); ctx.restore();
  s3.dots.forEach(d => { ctx.fillStyle = C.text; ctx.strokeStyle = B_COL[d.b]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(f.x(d.r), f.y(d.Am * 100), d === cur ? 5 : 3.2, 0, 7); ctx.fill(); ctx.stroke(); });
  const pk = M.peak(b), wd = M.width(b), Q = M.Q(b);
  const prog = s3.sweep ? t('s3progress', { c: s3.sweep.c, N: s3.sweep.N }) : '';
  $('r3').textContent = t('s3readout', { prog, b: fmt(b, 1), r: fix(r, 2), Am: fmt(cur.Am * 100, 1), Af: fmt(M.steady(M.SYS.m, M.SYS.k, b, r * w0).A * 100, 1), pr: fix(pk.r, 3), pA: fmt(pk.A * 100, 1), ratio: fmt(pk.A / M.staticX(), 1), Q: fmt(Q, 1), dr: fix(wd.dr, 3), iq: fix(1 / Q, 3) });
}
function sweep3() {
  stopSweep();
  const rs = []; for (let r = 0.2; r <= 2.0001; r += 0.04) rs.push(Math.round(r * 100) / 100);
  s3.sweep = { c: 0, N: rs.length };
  const b = s3.b;
  animate('s3', rs.length * 130, p => {
    const c = Math.min(rs.length, Math.floor(p * rs.length) + (p >= 1 ? 0 : 1));
    for (let i = 0; i < c; i++) measure3(b, rs[i]);
    if (s3.sweep) s3.sweep.c = c;
    $('ratio3').value = String(rs[c - 1]);
    draw3();
  }, () => { s3.sweep = null; draw3(); });
}

/* ---------- step 4: work per cycle ---------- */
function niceMax(v) { const e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e; }
function draw4() {
  const r = num('ratio4'), cw = M.cycleWork(r);
  $('ratio4v').textContent = fix(r, 2);
  const { ctx, W, H } = fitCanvas($('c4'), 360);
  title(ctx, t('c4a'), 18, W);
  const ticksX = [0, 0.25, 0.5, 0.75, 1], xf = v => (v === 0 ? '0' : v === 1 ? 'T' : fmt(v, 2) + 'T');
  const top = frame(ctx, { l: 40, r: W - 12, t: 30, b: 160, xMin: 0, xMax: 1, yMin: -1.15, yMax: 1.15, xTicks: ticksX, yTicks: [-1, 0, 1], xFmt: xf });
  const n = 300, pts = [];
  for (let i = 0; i <= n; i++) { const tt = cw.Tp * i / n, F = Math.cos(cw.Omega * tt), v = -cw.A * cw.Omega * Math.sin(cw.Omega * tt - cw.phi); pts.push({ u: i / n, F, v, P: M.F0 * F * v }); }
  [['F', C.orange, 1], ['v', C.cyan, 1 / cw.vmax]].forEach(([k, col, sc]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); pts.forEach((p, i) => { const X = top.x(p.u), Y = top.y(p[k] * sc); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); });
  title(ctx, t('c4b'), 196, W);
  const Pm = niceMax(Math.max(...pts.map(p => Math.abs(p.P))) * 1.05);
  const bot = frame(ctx, { l: 40, r: W - 12, t: 208, b: H - 26, xMin: 0, xMax: 1, yMin: -Pm, yMax: Pm, xTicks: ticksX, yTicks: [-Pm, 0, Pm], xFmt: xf, yFmt: v => (v === 0 ? '0' : (v > 0 ? '' : '−') + String(+Math.abs(v).toPrecision(2))) });
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[i + 1], X0 = bot.x(p.u), X1 = bot.x(q.u), mid = (p.P + q.P) / 2;
    ctx.fillStyle = mid >= 0 ? 'rgba(126,226,168,.55)' : 'rgba(255,122,147,.6)';
    ctx.beginPath(); ctx.moveTo(X0, bot.y(0)); ctx.lineTo(X0, bot.y(p.P)); ctx.lineTo(X1, bot.y(q.P)); ctx.lineTo(X1, bot.y(0)); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.2; ctx.beginPath(); pts.forEach((p, i) => { const X = bot.x(p.u), Y = bot.y(p.P); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke();
  const J = v => String(+v.toPrecision(3));
  $('r4').textContent = t('s4readout', { r: fix(r, 2), Wp: J(cw.Wp), Wn: J(Math.abs(cw.Wn)), W: J(cw.W), Wd: J(cw.Wd), A: fmt(cw.A * 100, 1), phi: fmt(cw.phi * 180 / Math.PI, 1) });
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  $('s1e_dyn').innerHTML = t('s1e', { bc: fmt(M.bCritical(M.SYS.m, M.SYS.k), 1) });
  $('s2e_dyn').innerHTML = t('s2e', { xs: fmt(M.staticX() * 100, 1) });
  const fb = $('fbQuiz'); if (fb.dataset.state) fb.textContent = quizText(fb.dataset.state === 'correct');
}
const quizText = ok => t(ok ? 'correct' : 'wrong', { ratio: fmt(M.peak(0.2).A / M.peak(0.4).A, 3) });

function setup() {
  buildB(); compute0();
  ['m0', 'k0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); s0.head = 1; compute0(); draw0(); }));
  $('play0').addEventListener('click', play0);
  $('b1').addEventListener('input', () => { stopAnim('s1'); s1.head = 1; draw1(); });
  $('play1').addEventListener('click', () => animate('s1', 10000, p => { s1.head = p; draw1(); }));
  $('ratio2').addEventListener('input', () => { retire2(); draw2(); });
  $('play2').addEventListener('click', play2);
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.run = null; s2.head = 0; s2.ghost = null; draw2(); });
  $('ratio3').addEventListener('input', () => { stopSweep(); draw3(); });
  $('sweep3').addEventListener('click', sweep3);
  $('clear3').addEventListener('click', () => { stopSweep(); s3.dots.clear(); draw3(); });
  $('ratio4').addEventListener('input', draw4);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b', fb = $('fbQuiz');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.textContent = quizText(ok); fb.style.color = ok ? C.green : C.orange;
  });

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
