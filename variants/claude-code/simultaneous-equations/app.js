'use strict';
// Simultaneous equations lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every line, point and readout comes from window.SIMEQ_MODEL (model.js). Canvas text is limited to axis
// ticks, the axis names x / y in fixed plot corners, and step 2's two panel titles in their own rows.
(function () {

const $ = id => document.getElementById(id);
const M = window.SIMEQ_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', muted: '#9aaabd', grid: '#1d2a39', grid2: '#2a3a4e', axis: '#5a7088', text: '#e8edf4', bg: '#0d1621', grey: '#6b7b90' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const MINUS = '−';
// Numbers: at most 2 decimals, trailing zeros trimmed, typographic minus, −0 shown as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; return s.replace('-', MINUS); };
const par = v => (v < 0 ? '(' + fmt(v) + ')' : fmt(v));

/* ---------- algebra formatting ---------- */
// lin([[3,'x'],[-1,'y'],[5,'']]) → "3x − y + 5"; zero terms are skipped.
function lin(terms) {
  let out = '';
  for (const [c, s] of terms) {
    if (Math.abs(c) < 1e-12) continue;
    const mag = Math.abs(c), body = (s && mag === 1 ? '' : fmt(mag)) + s;
    out += out ? (c < 0 ? ' − ' : ' + ') + body : (c < 0 ? MINUS : '') + body;
  }
  return out || '0';
}
const eqStr = e => lin([[e.a, 'x'], [e.b, 'y']]) + ' = ' + fmt(e.c);

/* ---------- canvas helpers ---------- */
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
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const niceStep = (span, px, minPx) => { for (const s of [1, 2, 5, 10, 20]) if (s / span * px >= minPx) return s; return 20; };
// A coordinate plane. o: xMin,xMax,yMin,yMax, top, bottom, left, right, names (draw x / y names), xName, yName.
function plane(ctx, W, o) {
  const P = { l: o.left || 34, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const xs = niceStep(o.xMax - o.xMin, P.r - P.l, 30), ys = niceStep(o.yMax - o.yMin, P.b - P.t, 22);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif';
  // light unit grid when the unit is wide enough, labelled grid every tick step
  const unitPx = (P.r - P.l) / (o.xMax - o.xMin);
  const unitPy = (P.b - P.t) / (o.yMax - o.yMin);
  ctx.strokeStyle = C.grid;
  if (unitPx >= 14) for (let v = Math.ceil(o.xMin); v <= o.xMax; v++) { ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); }
  if (unitPy >= 12) for (let v = Math.ceil(o.yMin); v <= o.yMax; v++) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  for (let v = Math.ceil(o.xMin / xs) * xs; v <= o.xMax + 1e-9; v += xs) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid2; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke();
    ctx.fillText(fmt(v), x(v), P.b + 15);
  }
  ctx.textAlign = 'right';
  for (let v = Math.ceil(o.yMin / ys) * ys; v <= o.yMax + 1e-9; v += ys) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid2; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.grid2; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  if (o.names !== false) {
    ctx.font = 'italic 600 13px Georgia,serif'; ctx.fillStyle = C.text;
    ctx.textAlign = 'right'; ctx.fillText(o.xName || 'x', P.r - 5, P.b - 6);
    ctx.textAlign = 'left'; ctx.fillText(o.yName || 'y', P.l + 6, P.t + 15);
  }
  ctx.restore();
  return { x, y, P, o };
}
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
// Draw a·x + b·y = c across the plot.
function eqLine(ctx, m, e, color, lw = 2.4, dash = null, alpha = 1) {
  if (Math.abs(e.a) < 1e-12 && Math.abs(e.b) < 1e-12) return;
  clipTo(ctx, m); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  if (Math.abs(e.b) > 1e-12) { const X0 = m.o.xMin - 1, X1 = m.o.xMax + 1; ctx.moveTo(m.x(X0), m.y((e.c - e.a * X0) / e.b)); ctx.lineTo(m.x(X1), m.y((e.c - e.a * X1) / e.b)); }
  else { const X = e.c / e.a; ctx.moveTo(m.x(X), m.P.t); ctx.lineTo(m.x(X), m.P.b); }
  ctx.stroke(); ctx.restore();
}
function dot(ctx, m, X, Y, color, r = 5, ring = true) {
  ctx.save(); clipTo(ctx, m); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(m.x(X), m.y(Y), r, 0, 7); ctx.fill();
  if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore(); ctx.restore();
}
function guides(ctx, m, X, Y, color = C.text) {
  clipTo(ctx, m); ctx.strokeStyle = color; ctx.globalAlpha = 0.45; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(m.x(X), m.P.b); ctx.lineTo(m.x(X), m.y(Y)); ctx.lineTo(m.P.l, m.y(Y)); ctx.stroke(); ctx.restore();
}

/* ---------- animation runner (reduced motion, hidden page) ---------- */
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

const VIEW = { xMin: -1, xMax: 11, yMin: -1, yMax: 9 };

/* ---------- step 0: one equation, a line of solutions ---------- */
const A0 = M.SYSTEMS[0].A;
const s0 = { xs: new Set([2]) };
function draw0() {
  const x = num('x0'), y = M.yOn(A0, x);
  $('x0v').textContent = fmt(x);
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = plane(ctx, W, { ...VIEW, top: 12, bottom: H - 24 });
  // the full line appears faintly only once the trail spans most of it, so the line is discovered, not given
  const xsArr = [...s0.xs];
  const span = Math.max(...xsArr) - Math.min(...xsArr);
  if (s0.xs.size >= 9 && span >= 6) eqLine(ctx, m, A0, C.cyan, 2, null, 0.85);
  xsArr.forEach(v => { if (v !== x) dot(ctx, m, v, M.yOn(A0, v), C.text, 4); });
  guides(ctx, m, x, y, C.cyan);
  dot(ctx, m, x, y, C.cyan, 6.5);
  $('r0').textContent = t('s0readout', { x: fmt(x), y: fmt(y), lhs: fmt(x + 2 * y), n: s0.xs.size });
}

/* ---------- shared system selector (steps 1–3) ---------- */
const sys = { i: 0 };
const S = () => M.SYSTEMS[sys.i];
function buildSysRows() {
  document.querySelectorAll('[data-sys-row]').forEach(row => {
    M.SYSTEMS.forEach((q, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.sys = i;
      b.textContent = eqStr(q.A) + ' ; ' + eqStr(q.B);
      b.addEventListener('click', () => setSystem(i));
      row.appendChild(b);
    });
  });
}
function setSystem(i) {
  sys.i = i; s1.pts = new Map(); s2.line = 0; s2.ys = new Set(); s3.tried = new Set();
  stopAnim('s3'); $('m3').value = 1; s3.mLive = null;
  $('y2').value = 1; s2.ys.add(1);
  addPt1(); refreshSys();
}
function refreshSys() {
  document.querySelectorAll('[data-sys]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.sys) === sys.i)));
  document.querySelectorAll('.eqA').forEach(n => { n.textContent = 'A: ' + eqStr(S().A); });
  document.querySelectorAll('.eqB').forEach(n => { n.textContent = 'B: ' + eqStr(S().B); });
  draw1(); draw2(); draw3();
}

/* ---------- step 1: a point that fits both ---------- */
const s1 = { pts: new Map() };
function addPt1() { const x = num('x1'), y = num('y1'); s1.pts.set(x + ',' + y, [x, y]); }
function classify(x, y) { const a = M.residual(S().A, x, y) === 0, b = M.residual(S().B, x, y) === 0; return a && b ? 'both' : a ? 'A' : b ? 'B' : 'none'; }
const PTCOL = { both: C.text, A: C.cyan, B: C.orange, none: C.grey };
function draw1() {
  const x = num('x1'), y = num('y1'), q = S();
  $('x1v').textContent = fmt(x); $('y1v').textContent = fmt(y);
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = plane(ctx, W, { ...VIEW, top: 12, bottom: H - 24 });
  eqLine(ctx, m, q.A, C.cyan); eqLine(ctx, m, q.B, C.orange);
  for (const [k, [px, py]] of s1.pts) if (px !== x || py !== y) dot(ctx, m, px, py, PTCOL[classify(px, py)], 3.6);
  const cls = classify(x, y);
  guides(ctx, m, x, y);
  dot(ctx, m, x, y, PTCOL[cls], 7);
  if (cls !== 'both') { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x(x), m.y(y), 9.5, 0, 7); ctx.stroke(); ctx.restore(); }
  const ea = M.residual(q.A, x, y), eb = M.residual(q.B, x, y);
  const verdict = t({ both: 's1both', A: 's1onlyA', B: 's1onlyB', none: 's1none' }[cls]);
  $('r1').textContent = t('s1readout', { x: fmt(x), y: fmt(y), ea: fmt(ea), eb: fmt(eb), verdict });
}

/* ---------- step 2: substitution ---------- */
const s2 = { line: 0, ys: new Set([1]) };
const Y2 = { min: 0, max: 5.5 };
function derivRows() {
  const { A, B } = S(), d = M.substitution(S());
  const inner = lin([[A.c, ''], [-A.b, 'y']]);
  const pre = B.a === 1 ? '' : B.a === -1 ? MINUS : fmt(B.a);
  const tail = lin([[1, '#'], [B.b, 'y']]).replace(/^#/, '');
  return [
    'x = ' + inner,
    pre + '(' + inner + ')' + tail + ' = ' + fmt(B.c),
    lin([[d.k, ''], [d.m1, 'y'], [B.b, 'y']]) + ' = ' + fmt(B.c),
    lin([[d.k, ''], [d.coefY, 'y']]) + ' = ' + fmt(B.c),
    lin([[d.coefY, 'y']]) + ' = ' + fmt(B.c) + ' − ' + par(d.k) + ' = ' + fmt(d.rhs),
    'y = ' + fmt(d.rhs) + ' ÷ ' + par(d.coefY) + ' = ' + fmt(d.y),
    'x = ' + fmt(A.c) + (A.b > 0 ? ' − ' : ' + ') + fmt(Math.abs(A.b)) + ' × ' + par(d.y) + ' = ' + fmt(d.x),
    fmt(B.a) + ' × ' + par(d.x) + ' + ' + par(B.b) + ' × ' + par(d.y) + ' = ' + fmt(d.check) + (d.check === B.c ? ' ✓' : ' ✗')
  ];
}
function draw2() {
  const q = S(), d = M.substitution(q), y = num('y2'), x = M.clean(q.A.c - q.A.b * y), rows = derivRows();
  $('y2v').textContent = fmt(y);
  const { ctx, W, H } = fitCanvas($('c2'));
  const top = plane(ctx, W, { ...VIEW, top: 30, bottom: 258 });
  title(ctx, t('c2a'), 8, 20, W - 16);
  eqLine(ctx, top, q.A, C.cyan, s2.line >= 1 ? 3.4 : 2.4);
  eqLine(ctx, top, q.B, C.orange, s2.line >= 8 ? 3.4 : 2.4);
  // residual-of-B-along-A panel
  const rs = [Y2.min, Y2.max].map(v => M.residualAlongA(q, v));
  const lo = Math.min(0, ...rs), hi = Math.max(0, ...rs), pad = (hi - lo) * 0.12;
  const bot = plane(ctx, W, { xMin: -0.5, xMax: 6, yMin: lo - pad, yMax: hi + pad, top: 314, bottom: H - 24, xName: 'y', yName: t('missB') });
  title(ctx, t('c2b'), 8, 304, W - 16);
  if (s2.line >= 4) { clipTo(ctx, bot); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(bot.x(-0.5), bot.y(M.residualAlongA(q, -0.5))); ctx.lineTo(bot.x(6), bot.y(M.residualAlongA(q, 6))); ctx.stroke(); ctx.restore(); }
  [...s2.ys].forEach(v => { if (v !== y) dot(ctx, bot, v, M.residualAlongA(q, v), C.orange, 3.6); });
  dot(ctx, bot, y, M.residualAlongA(q, y), C.orange, 6);
  if (s2.line >= 6) { clipTo(ctx, bot); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bot.x(d.y), bot.y(0), 8, 0, 7); ctx.stroke(); ctx.restore(); }
  // vertical link between the two panels at this y is not meaningful (different axes); the point itself:
  guides(ctx, top, x, y);
  dot(ctx, top, x, y, C.text, 6.5);
  if (s2.line >= 7) { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(top.x(d.x), top.y(d.y), 10, 0, 7); ctx.stroke(); ctx.restore(); }
  // derivation list
  const why = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'];
  $('deriv2').innerHTML = rows.slice(0, s2.line).map((r, i) => `<li class="${i === s2.line - 1 ? 'latest' : ''}"><span class="why">${i + 1}. ${t(why[i])}</span><span class="eq">${r}</span></li>`).join('');
  $('next2').disabled = s2.line >= rows.length;
  const prog = s2.line === 0 ? '' : s2.line < rows.length ? t('s2prog', { c: s2.line, N: rows.length }) : t('s2done');
  $('r2').textContent = t('s2readout', { prog, x: fmt(x), y: fmt(y), r: fmt(M.residualAlongA(q, y)) });
}

/* ---------- step 3: elimination, a pencil of lines through the solution ---------- */
const s3 = { tried: new Set([1]), mLive: null };
function draw3() {
  const q = S(), m = s3.mLive === null ? num('m3') : s3.mLive, sol = M.solve(q.A, q.B);
  $('m3v').textContent = fmt(m);
  const { ctx, W, H } = fitCanvas($('c3'));
  const pl = plane(ctx, W, { ...VIEW, top: 12, bottom: H - 24 });
  [...s3.tried].forEach(v => { if (Math.abs(v - m) > 1e-9) eqLine(ctx, pl, M.combine(q, v), C.green, 1.4, null, 0.28); });
  eqLine(ctx, pl, q.A, C.cyan, 2); eqLine(ctx, pl, q.B, C.orange, 2);
  const e = M.combine(q, m);
  eqLine(ctx, pl, e, C.green, 3);
  dot(ctx, pl, sol.x, sol.y, C.text, 6.5);
  let note;
  if (e.b === 0 && e.a !== 0) note = t('s3elimY', { x: fmt(e.c / e.a) });
  else if (e.a === 0 && e.b !== 0) note = t('s3elimX', { y: fmt(e.c / e.b) });
  else note = t('s3keep', { x: fmt(sol.x), y: fmt(sol.y) });
  $('r3').textContent = t('s3readout', { m: fmt(m), eq: eqStr(e), note });
}
function turnTo3(target) {
  const from = s3.mLive === null ? num('m3') : s3.mLive;
  animate('s3', 1400, p => { const e = 1 - Math.pow(1 - p, 3); s3.mLive = from + (target - from) * e; if (p >= 1) { s3.mLive = null; $('m3').value = target; s3.tried.add(target); } draw3(); });
}

/* ---------- step 4: one, none, or infinitely many ---------- */
const V4 = { xMin: -4, xMax: 14, yMin: -4, yMax: 10 };
const s4 = { trail: [] };
function draw4() {
  const k = num('k4'), c = num('c4in'), B = { a: k, b: 2, c }, sol = M.family(k, c);
  $('k4v').textContent = fmt(k); $('c4v').textContent = fmt(c);
  $('lg4B').textContent = 'B: ' + eqStr(B);
  const { ctx, W, H } = fitCanvas($('c4'));
  const m = plane(ctx, W, { ...V4, top: 12, bottom: H - 24 });
  s4.trail.forEach(([px, py]) => dot(ctx, m, px, py, C.muted, 4.2));
  eqLine(ctx, m, M.FIXED_A, C.cyan, sol.kind === 'many' ? 6 : 2.6, null, sol.kind === 'many' ? 0.55 : 1);
  eqLine(ctx, m, B, C.orange, 2.4, sol.kind === 'many' ? [8, 6] : null);
  let msg;
  if (sol.kind === 'one') {
    const off = sol.x < V4.xMin || sol.x > V4.xMax || sol.y < V4.yMin || sol.y > V4.yMax;
    if (!off) dot(ctx, m, sol.x, sol.y, C.text, 6.5);
    msg = t('s4one', { D: fmt(sol.D), x: fmt(sol.x), y: fmt(sol.y), off: off ? t('s4off') : '' });
  } else msg = t(sol.kind === 'none' ? 's4none' : 's4many');
  $('r4').textContent = msg;
}
function track4() {
  const sol = M.family(num('k4'), num('c4in'));
  if (sol.kind === 'one' && !s4.trail.some(([a, b]) => a === sol.x && b === sol.y)) { s4.trail.push([sol.x, sol.y]); if (s4.trail.length > 80) s4.trail.shift(); }
}

/* ---------- step 5: receipts back to prices ---------- */
const s5 = { copy: false };
function draw5() {
  const p = num('p5'), q = num('q5'), R = M.receipts(p, q, s5.copy);
  $('p5v').textContent = fmt(p); $('q5v').textContent = fmt(q);
  $('rc1').textContent = t('rc', { i: 1, a: R.r1.a, b: R.r1.b, c: fmt(R.r1.c) });
  $('rc2').textContent = t('rc', { i: 2, a: R.r2.a, b: R.r2.b, c: fmt(R.r2.c) });
  $('copy5').textContent = t(s5.copy ? 'copyOn' : 'copyOff'); $('copy5').setAttribute('aria-pressed', String(s5.copy));
  const { ctx, W, H } = fitCanvas($('c5'));
  const m = plane(ctx, W, { xMin: 0, xMax: 10, yMin: 0, yMax: 10, top: 12, bottom: H - 24 });
  eqLine(ctx, m, R.r1, C.cyan, s5.copy ? 6 : 2.6, null, s5.copy ? 0.55 : 1);
  eqLine(ctx, m, R.r2, C.orange, 2.4, s5.copy ? [8, 6] : null);
  const e1 = eqStr(R.r1), e2 = eqStr(R.r2);
  if (R.sol.kind === 'one') {
    guides(ctx, m, R.sol.x, R.sol.y); dot(ctx, m, R.sol.x, R.sol.y, C.text, 6.5);
    const same = R.sol.x === M.clean(p) && R.sol.y === M.clean(q);
    $('r5').textContent = t('s5one', { e1, e2, D: fmt(R.sol.D), x: fmt(R.sol.x), y: fmt(R.sol.y), p: fmt(p), q: fmt(q), match: t(same ? 's5match' : 's5mismatch') });
  } else $('r5').textContent = t('s5many', { e1, e2, p: fmt(p), q: fmt(q) });
}

function refresh() { draw0(); refreshSys(); draw4(); draw5(); }

function setup() {
  buildSysRows();
  $('x0').addEventListener('input', () => { stopAnim('s0'); s0.xs.add(num('x0')); draw0(); });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.xs = new Set([num('x0')]); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.xs = new Set();
    animate('s0', 21 * 220, p => { const v = Math.min(20, Math.floor(p * 21)) / 2; for (let u = 0; u <= v; u += 0.5) s0.xs.add(u); $('x0').value = v; draw0(); });
  });

  ['x1', 'y1'].forEach(id => $(id).addEventListener('input', () => { addPt1(); draw1(); }));
  $('clear1').addEventListener('click', () => { s1.pts = new Map(); addPt1(); draw1(); });
  addPt1();

  $('y2').addEventListener('input', () => { s2.ys.add(num('y2')); draw2(); });
  $('next2').addEventListener('click', () => {
    if (s2.line >= 8) return;
    s2.line++;
    if (s2.line === 6) { const y = M.substitution(S()).y; $('y2').value = y; s2.ys.add(y); }
    draw2();
  });
  $('reset2').addEventListener('click', () => { s2.line = 0; s2.ys = new Set([num('y2')]); draw2(); });

  $('m3').addEventListener('input', () => { stopAnim('s3'); s3.mLive = null; s3.tried.add(num('m3')); draw3(); });
  $('elimY3').addEventListener('click', () => turnTo3(M.elimY(S())));
  $('elimX3').addEventListener('click', () => turnTo3(M.elimX(S())));
  $('clear3').addEventListener('click', () => { s3.tried = new Set([num('m3')]); draw3(); });

  ['k4', 'c4in'].forEach(id => $(id).addEventListener('input', () => { track4(); draw4(); }));
  $('clear4').addEventListener('click', () => { s4.trail = []; track4(); draw4(); });
  track4();
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  ['p5', 'q5'].forEach(id => $(id).addEventListener('input', draw5));
  $('copy5').addEventListener('click', () => { s5.copy = !s5.copy; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = () => {
    // the quiz feedback is language text too
    const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state === 'correct' ? 'correct' : 'wrong');
    refresh();
  };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
