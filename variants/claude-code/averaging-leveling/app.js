'use strict';
// Averages · Level by Pouring (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every cup, line and readout is computed by window.AVG_MODEL (model.js). Canvas text is limited to cup
// names, cup values, axis ticks and line tags in reserved rows/margins; label() keeps them apart and on-canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.AVG_MODEL;
const t = (...a) => window.AVG_I18N.t(...a);
const lang = () => window.AVG_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#f5d76e', blue: '#5fb3ff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', glass: '#2c3b50' };
const CUPCOL = [C.cyan, C.green, C.violet, C.pink, C.yellow, C.blue];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/\.?0+$/, '') || '0'; };
const isExact = (v, d = 2) => Math.abs(Number(v.toFixed(d)) - v) < 1e-9;
const list = a => a.join(lang() === 'zh' ? '、' : ', ');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height, boxes: [] };
}

// Places one label: clamps it inside the canvas and, if it would touch a label already placed in this
// drawing, tries the alternative rows in `alt` (y offsets); if none is free the label is left out
// (every canvas number is also in the DOM readout).
function label(cv, text, x, y, o = {}) {
  const { ctx, W, H, boxes } = cv, size = o.size || 12;
  ctx.save(); ctx.font = `${o.bold ? 700 : 500} ${size}px system-ui,sans-serif`;
  const w = ctx.measureText(text).width, asc = size * 0.78, desc = size * 0.24;
  const align = o.align || 'center';
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(2, Math.min(W - 2 - w, x0));
  const tries = [0].concat(o.alt || []);
  for (const dy of tries) {
    const yy = Math.max(asc + 2, Math.min(H - desc - 2, y + dy));
    const b = { x0: x0 - 2, x1: x0 + w + 2, y0: yy - asc - 1, y1: yy + desc + 1 };
    if (boxes.some(q => b.x0 < q.x1 && q.x0 < b.x1 && b.y0 < q.y1 && q.y0 < b.y1)) continue;
    boxes.push(b);
    if (o.bg) { ctx.fillStyle = C.bg; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
    ctx.fillStyle = o.color || C.muted; ctx.textAlign = 'left'; ctx.fillText(text, x0, yy); ctx.restore(); return true;
  }
  ctx.restore(); return false;
}

// Cup geometry: n slots across [L, W − R]; values map to heights between base B and top T for 0..cap.
function cupFrame(W, n, o) {
  const L = o.L == null ? 34 : o.L, R = o.R == null ? 44 : o.R, slot = (W - L - R) / n;
  const cw = Math.min(o.maxW || 66, slot * 0.66);
  const unit = (o.B - o.T) / o.cap;
  return { L, R, slot, cw, unit, T: o.T, B: o.B, cap: o.cap, cx: i => L + slot * (i + 0.5), y: v => o.B - v * unit };
}
function yTicks(cv, F, ticks) {
  const { ctx } = cv;
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ticks.forEach(v => { ctx.beginPath(); ctx.moveTo(F.L - 3, F.y(v)); ctx.lineTo(cv.W - F.R + 2, F.y(v)); ctx.stroke(); });
  ctx.restore();
  ticks.forEach(v => label(cv, String(v), F.L - 7, F.y(v) + 4, { align: 'right', size: 11 }));
}
// Glass outline of cup i.
function glass(ctx, F, i, opts = {}) {
  const x = F.cx(i) - F.cw / 2;
  ctx.save(); ctx.strokeStyle = opts.color || C.glass; ctx.lineWidth = opts.lw || 1.6; if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.beginPath(); ctx.moveTo(x - 3, F.T - 4); ctx.lineTo(x - 3, F.B + 2); ctx.lineTo(x + F.cw + 3, F.B + 2); ctx.lineTo(x + F.cw + 3, F.T - 4); ctx.stroke();
  ctx.restore();
}
// One part-sized block (integer level k, 0-based from the bottom) inside cup i.
function block(ctx, F, i, k, color, o = {}) {
  const x = F.cx(i) - F.cw / 2, y = F.B - (k + 1) * F.unit;
  ctx.save(); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, F.cw - 2, F.unit - 2);
  if (o.frame) { ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, F.cw - 4, F.unit - 4); }
  ctx.restore();
}
function slotBox(ctx, F, i, k) {
  const x = F.cx(i) - F.cw / 2, y = F.B - (k + 1) * F.unit;
  ctx.save(); ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.8; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 2.5, y + 2.5, F.cw - 5, F.unit - 5); ctx.restore();
}
function hline(ctx, x0, x1, y, color, dash = [7, 5], lw = 2.2) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
}
// Cup names and values in two fixed rows under the cups.
function cupLabels(cv, F, n, values, o = {}) {
  for (let i = 0; i < n; i++) {
    label(cv, o.names ? o.names[i] : M.LETTERS[i], F.cx(i), F.B + 17, { size: 12, color: C.muted });
    if (values) label(cv, values[i], F.cx(i), F.B + 34, { size: 13, bold: true, color: o.valColor ? o.valColor(i) : C.text });
  }
}

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

/* ---------- step 0: pour freely; the total never changes ---------- */
const s0 = { stacks: null, k: 0, sel: null, msgKey: null };
function reset0() { s0.stacks = M.S0.cups.map((v, i) => new Array(v).fill(i)); s0.k = 0; s0.sel = null; s0.msgKey = null; }
function fillSelects() {
  ['from0', 'to0'].forEach((id, which) => {
    const sel = $(id), keep = sel.value;
    sel.innerHTML = M.S0.cups.map((_, i) => `<option value="${i}">${t('cupName', { l: M.LETTERS[i] })}</option>`).join('');
    sel.value = keep !== '' ? keep : String(which === 0 ? 0 : 3);
  });
}
function doPour0(i, j) {
  const counts = s0.stacks.map(s => s.length), r = M.pour(counts, i, j, M.S0.cap);
  if (!r.ok) { s0.msgKey = { reason: r.reason, i, j }; draw0(); return; }
  s0.stacks[j].push(s0.stacks[i].pop()); s0.k++; s0.msgKey = null; draw0();
}
function draw0() {
  const cv = fitCanvas($('c0')), { ctx, W, H } = cv, n = 4;
  const F = cupFrame(W, n, { T: 58, B: H - 46, cap: M.S0.cap });
  yTicks(cv, F, [0, 5, 10]);
  // strip: every part in one row, grouped by the cup it is in now
  const total = s0.stacks.reduce((s, a) => s + a.length, 0), x0 = F.L, x1 = W - F.R, uw = (x1 - x0) / total;
  let pos = 0;
  s0.stacks.forEach(st => st.forEach(o => { ctx.fillStyle = CUPCOL[o]; ctx.fillRect(x0 + pos * uw + 0.5, 14, uw - 1, 20); pos++; }));
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; pos = 0;
  s0.stacks.forEach((st, i) => { pos += st.length; if (i < n - 1) { ctx.beginPath(); ctx.moveTo(x0 + pos * uw, 10); ctx.lineTo(x0 + pos * uw, 38); ctx.stroke(); } });
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(x0 - 0.5, 13.5, x1 - x0 + 1, 21); ctx.restore();
  label(cv, String(total), x1 + 6, 29, { align: 'left', size: 13, bold: true, color: C.text });
  for (let i = 0; i < n; i++) {
    glass(ctx, F, i, s0.sel === i ? { color: C.text, lw: 2.6 } : {});
    s0.stacks[i].forEach((o, k) => block(ctx, F, i, k, CUPCOL[o]));
  }
  cupLabels(cv, F, n, s0.stacks.map(s => String(s.length)));
  const counts = s0.stacks.map(s => s.length);
  $('r0').textContent = (s0.msgKey ? msg0() + ' ' : '') + t('s0readout', { k: s0.k, cups: list(counts), total, total0: M.sum(M.S0.cups), gap: Math.max(...counts) - Math.min(...counts) });
}
function msg0() { const m = s0.msgKey; return m.reason === 'same' ? t('s0same') : t(m.reason === 'empty' ? 's0empty' : 's0full', { l: M.LETTERS[m.reason === 'empty' ? m.i : m.j] }); }

/* ---------- step 1: move from more to less ---------- */
const s1 = { preset: 0, cups: null, k: 0, need: 0, fly: null, auto: false };
function reset1() { stopAnim('s1'); s1.auto = false; s1.cups = M.S1.presets[s1.preset].slice(); s1.k = 0; s1.need = M.levelPlan(s1.cups).moves.length; s1.fly = null; }
function leveled1() { return Math.max(...s1.cups) - Math.min(...s1.cups) <= 1; }
function move1(then) {
  if (leveled1()) { s1.auto = false; draw1(); return; }
  const mv = M.levelPlan(s1.cups).moves[0];
  s1.fly = { from: mv.from, to: mv.to, p: 0 };
  animate('s1', 520, p => { s1.fly.p = p; draw1(); }, () => {
    s1.cups = M.pour(s1.cups, mv.from, mv.to, Infinity).cups; s1.k++; s1.fly = null; draw1();
    if (then) then();
  });
}
function auto1() { s1.auto = true; const go = () => { if (s1.auto && !leveled1()) move1(go); else { s1.auto = false; draw1(); } }; go(); }
function draw1() {
  const cv = fitCanvas($('c1')), { ctx, W, H } = cv, cups = s1.cups, n = cups.length, mean = M.mean(M.S1.presets[s1.preset]);
  const F = cupFrame(W, n, { T: 22, B: H - 46, cap: M.S1.cap });
  yTicks(cv, F, [0, 5, 10]);
  const shown = cups.slice(); if (s1.fly) shown[s1.fly.from] -= 1;
  for (let i = 0; i < n; i++) {
    glass(ctx, F, i);
    for (let k = 0; k < shown[i]; k++) block(ctx, F, i, k, CUPCOL[i], { frame: k >= mean });
    for (let k = shown[i]; k < mean; k++) slotBox(ctx, F, i, k);
  }
  hline(ctx, F.L - 3, W - F.R + 2, F.y(mean), C.orange);
  label(cv, fmt(mean), W - F.R + 6, F.y(mean) + 5, { align: 'left', size: 13, bold: true, color: C.orange, alt: [-14, 14] });
  if (s1.fly) {
    const { from, to, p } = s1.fly, e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const ax = F.cx(from) - F.cw / 2, ay = F.B - cups[from] * F.unit, bx = F.cx(to) - F.cw / 2, by = F.B - (cups[to] + 1) * F.unit;
    const x = ax + (bx - ax) * e, y = ay + (by - ay) * e - Math.sin(Math.PI * e) * 40;
    ctx.save(); ctx.fillStyle = CUPCOL[from]; ctx.fillRect(x + 1, y + 1, F.cw - 2, F.unit - 2); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, F.cw - 4, F.unit - 4); ctx.restore();
  }
  cupLabels(cv, F, n, shown.map(String));
  const ex = M.excess(cups, mean), sh = M.shortfall(cups, mean);
  $('r1').textContent = leveled1() ? t('s1done', { k: s1.k, need: s1.need, mean: fmt(mean) }) : t('s1readout', { k: s1.k, need: s1.need, cups: list(cups), mean: fmt(mean), ex, sh });
  $('pour1').disabled = leveled1() || !!s1.fly; $('auto1').disabled = leveled1() || s1.auto;
}

/* ---------- step 2: pool everything, then cut into equal pieces ---------- */
const s2 = { p: 1 };
function meanText(total, n) {
  const m = total / n, fr = M.meanFrac(M.S2.cups.slice(0, n));
  const v = isExact(m) ? t('exact', { v: fmt(m) }) : t('approx', { v: fmt(m) });
  return fr.r ? v + t('fracZh', { w: fr.whole, num: fr.num, den: fr.den }) : v;
}
function draw2() {
  const n = num('n2'), all = M.S2.cups, cups = all.slice(0, n), total = M.sum(cups), mean = total / n, maxTotal = M.sum(all);
  $('n2v').textContent = String(n);
  const cv = fitCanvas($('c2')), { ctx, W, H } = cv;
  // While the demo runs, parts leave the top cups for the tube and then fill the bottom cups;
  // the resting picture (p = 1) shows all three stages at once.
  const p = s2.p, running = p < 1, pA = running ? Math.min(1, p / 0.45) : 1, pC = running ? Math.min(1, Math.max(0, (p - 0.55) / 0.45)) : 1;
  const poured = Math.round(total * pA), drained = running ? poured : 0;
  // top row: all six cups, the unused ones faded; parts leave the cups in order as they are poured
  const A = cupFrame(W, all.length, { T: 14, B: 108, cap: 10, maxW: 44 });
  let left = drained;
  for (let i = 0; i < all.length; i++) {
    const used = i < n, take = used ? Math.min(all[i], left) : 0; if (used) left -= take;
    glass(ctx, A, i, { color: used ? C.glass : '#1b2634' });
    for (let k = 0; k < all[i] - take; k++) block(ctx, A, i, k, CUPCOL[i], { alpha: used ? 1 : 0.22 });
    label(cv, String(all[i]), A.cx(i), A.B + 17, { size: 12, bold: used, color: used ? C.text : '#4b5a6c' });
  }
  // middle: the long tube
  const tx0 = A.L, tx1 = W - A.R, uw = (tx1 - tx0) / maxTotal, ty = 140, th = 22;
  ctx.save(); ctx.strokeStyle = C.glass; ctx.lineWidth = 1.4; ctx.strokeRect(tx0 - 0.5, ty - 0.5, total * uw + 1, th + 1);
  let pos = 0;
  for (let i = 0; i < n && pos < poured; i++) for (let k = 0; k < all[i] && pos < poured; k++) { ctx.fillStyle = CUPCOL[i]; ctx.globalAlpha = running ? 1 - 0.5 * pC : 1; ctx.fillRect(tx0 + pos * uw + 0.5, ty, uw - 1, th); pos++; }
  ctx.globalAlpha = 1;
  if (p >= 0.45) { ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; for (let q = 1; q < n; q++) { const x = tx0 + total * uw * q / n; ctx.beginPath(); ctx.moveTo(x, ty - 7); ctx.lineTo(x, ty + th + 7); ctx.stroke(); } }
  ctx.restore();
  label(cv, String(total), tx0 + total * uw + 6, ty + 16, { align: 'left', size: 13, bold: true, color: C.text });
  // bottom row: n cups, each holding one equal piece (may be a fraction of a part)
  const Cf = cupFrame(W, n, { T: 192, B: H - 30, cap: 10, maxW: 56 });
  for (let i = 0; i < n; i++) {
    glass(ctx, Cf, i);
    const h = mean * pC * Cf.unit, x = Cf.cx(i) - Cf.cw / 2;
    ctx.save(); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.85; ctx.fillRect(x + 1, Cf.B - h, Cf.cw - 2, h); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; for (let k = 1; k < mean * pC; k++) { ctx.beginPath(); ctx.moveTo(x + 1, Cf.y(k)); ctx.lineTo(x + Cf.cw - 1, Cf.y(k)); ctx.stroke(); } ctx.restore();
    if (pC >= 1) label(cv, fmt(mean), Cf.cx(i), Cf.B + 17, { size: 12, bold: true, color: C.text });
  }
  if (pC >= 1) {
    hline(ctx, Cf.L - 3, W - Cf.R + 2, Cf.y(mean), C.orange);
    label(cv, fmt(mean), W - Cf.R + 6, Cf.y(mean) + 5, { align: 'left', size: 13, bold: true, color: C.orange });
  }
  $('r2').textContent = t('s2readout', { expr: cups.join(' + '), total, n, mean: meanText(total, n) });
}

/* ---------- step 3: one very full cup ---------- */
function draw3() {
  const x = num('x3'), r = M.step3(x);
  $('x3v').textContent = String(x);
  const cv = fitCanvas($('c3')), { ctx, W, H } = cv;
  const F = cupFrame(W, 5, { T: 18, B: H - 46, cap: M.S3.cap });
  yTicks(cv, F, [0, 5, 10, 15, 20]);
  r.cups.forEach((v, i) => {
    glass(ctx, F, i, i === 4 ? { color: C.text, lw: 2 } : {});
    const col = v > r.mean + 1e-9 ? C.green : v < r.mean - 1e-9 ? C.violet : C.cyan, x0 = F.cx(i) - F.cw / 2;
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x0 + 1, F.y(v), F.cw - 2, v * F.unit);
    ctx.strokeStyle = C.bg; ctx.lineWidth = 1; for (let k = 1; k < v; k++) { ctx.beginPath(); ctx.moveTo(x0 + 1, F.y(k)); ctx.lineTo(x0 + F.cw - 1, F.y(k)); ctx.stroke(); } ctx.restore();
  });
  hline(ctx, F.L - 3, W - F.R + 2, F.y(r.mean0), C.ghost, [4, 5], 1.6);
  hline(ctx, F.L - 3, W - F.R + 2, F.y(r.mean), C.orange);
  label(cv, fmt(r.mean), W - F.R + 6, F.y(r.mean) + 5, { align: 'left', size: 13, bold: true, color: C.orange, alt: [-14, 14] });
  label(cv, fmt(r.mean0), W - F.R + 6, F.y(r.mean0) + 5, { align: 'left', size: 12, color: C.ghost, alt: [14, -14] });
  cupLabels(cv, F, 5, r.cups.map(String));
  const sign = r.change > 0 ? '+' : '';
  $('r3').textContent = t('s3readout', { total: r.total, mean: fmt(r.mean), change: sign + fmt(r.change), above: r.above, below: r.below, equal: r.equal, min: r.min, max: r.max });
}

/* ---------- step 4: unequal teams ---------- */
const s4 = { on: false };
function draw4() {
  const x = num('x4'), r = M.step4(s4.on, x);
  $('x4v').textContent = String(x); $('x4').disabled = !s4.on;
  $('add4').setAttribute('aria-pressed', String(s4.on));
  const cv = fitCanvas($('c4')), { ctx, W, H } = cv;
  // 4 slots for A, one gap slot, 7 slots reserved for B so nothing jumps when the newcomer joins
  const F = cupFrame(W, 12, { T: 20, B: 196, cap: 10, maxW: 30, R: 12 });
  yTicks(cv, F, [0, 5, 10]);
  const bars = r.a.map((v, i) => ({ v, slot: i, col: C.cyan })).concat(r.b.map((v, i) => ({ v, slot: 5 + i, col: i === 6 ? C.pink : C.violet })));
  bars.forEach(b => {
    const x0 = F.cx(b.slot) - F.cw / 2;
    ctx.fillStyle = b.col; ctx.globalAlpha = 0.9; ctx.fillRect(x0, F.y(b.v), F.cw, b.v * F.unit); ctx.globalAlpha = 1;
  });
  const gA = [F.cx(0) - F.slot / 2 + 2, F.cx(3) + F.slot / 2 - 2], gB = [F.cx(5) - F.slot / 2 + 2, F.cx(4 + r.nB) + F.slot / 2 - 2];
  hline(ctx, gA[0], gA[1], F.y(r.meanA), C.orange, [6, 4], 2.4);
  hline(ctx, gB[0], gB[1], F.y(r.meanB), C.orange, [6, 4], 2.4);
  bars.forEach(b => label(cv, String(b.v), F.cx(b.slot), F.y(b.v) - 5, { size: 11, color: C.text, bg: true }));
  const mid = g => (g[0] + g[1]) / 2;
  label(cv, t('teamLbl', { team: t('teamA'), n: r.nA }), mid(gA), F.B + 17, { size: 12, color: C.text });
  label(cv, t('teamLbl', { team: t('teamB'), n: r.nB }), mid(gB), F.B + 17, { size: 12, color: C.text });
  label(cv, t('meanLbl', { v: fmt(r.meanA) }), mid(gA), F.B + 34, { size: 12, bold: true, color: C.orange });
  label(cv, t('meanLbl', { v: fmt(r.meanB) }), mid(gB), F.B + 34, { size: 12, bold: true, color: C.orange });
  // totals: two horizontal bars on a 0..50 scale
  const bx0 = F.L, bx1 = W - 44, sc = v => bx0 + (bx1 - bx0) * v / 50;
  label(cv, t('totalLbl'), 8, 262, { align: 'left', size: 12, color: C.muted });
  [[r.totalA, C.cyan, 276, 'A'], [r.totalB, C.violet, 306, 'B']].forEach(([v, col, y, key]) => {
    ctx.fillStyle = col; ctx.fillRect(bx0, y, sc(v) - bx0, 20);
    if (key === 'B' && s4.on) { ctx.fillStyle = C.pink; ctx.fillRect(sc(v - x), y, sc(v) - sc(v - x), 20); }
    label(cv, t(key === 'A' ? 'teamAShort' : 'teamBShort'), bx0 - 8, y + 15, { align: 'right', size: 12, color: C.text });
    label(cv, String(v), sc(v) + 6, y + 15, { align: 'left', size: 13, bold: true, color: C.text });
  });
  const winT = r.totalA > r.totalB ? t('teamA') : r.totalB > r.totalA ? t('teamB') : '—';
  const winM = r.meanA > r.meanB ? t('teamA') : r.meanB > r.meanA ? t('teamB') : '—';
  let txt = t('s4readout', { nA: r.nA, tA: r.totalA, mA: fmt(r.meanA), nB: r.nB, tB: r.totalB, mB: fmt(r.meanB), winT, winM });
  if (s4.on) {
    const dir = x > r.meanBOld ? t('above') : x < r.meanBOld ? t('below') : t('same');
    const move = r.meanB > r.meanBOld + 1e-9 ? t('up') : r.meanB < r.meanBOld - 1e-9 ? t('down') : t('flat');
    txt += ' ' + t('s4newNote', { x, dir, old: fmt(r.meanBOld), move });
  }
  $('r4').textContent = txt;
}

/* ---------- step 5: work backwards from the mean ---------- */
function draw5() {
  const x = num('x5'), tt = num('t5'), r = M.step5(x, tt);
  $('x5v').textContent = String(x); $('t5v').textContent = String(tt);
  const cv = fitCanvas($('c5')), { ctx, W, H } = cv;
  const F = cupFrame(W, 4, { T: 18, B: H - 46, cap: M.S5.cap });
  yTicks(cv, F, [0, 4, 8, 12]);
  r.cups.forEach((v, i) => {
    const isD = i === 3;
    glass(ctx, F, i, isD ? { color: C.pink, lw: 2.2 } : {});
    for (let k = 0; k < v; k++) block(ctx, F, i, k, isD ? C.pink : C.cyan, { frame: !isD && k >= tt, alpha: isD ? 0.85 : 1 });
    if (!isD) for (let k = v; k < tt; k++) slotBox(ctx, F, i, k);
  });
  hline(ctx, F.L - 3, W - F.R + 2, F.y(tt), C.green, [8, 5], 2.4);
  hline(ctx, F.L - 3, W - F.R + 2, F.y(r.mean), C.orange, [4, 4], 2);
  label(cv, String(tt), W - F.R + 6, F.y(tt) + 5, { align: 'left', size: 13, bold: true, color: C.green, alt: [-14, 14] });
  label(cv, fmt(r.mean), W - F.R + 6, F.y(r.mean) + 5, { align: 'left', size: 12, bold: true, color: C.orange, alt: [14, -14, 28, -28] });
  cupLabels(cv, F, 4, r.cups.map(String), { valColor: i => (i === 3 ? C.pink : C.text) });
  let status;
  if (!r.feasible) status = r.need < 0 ? t('s5neg', { have: r.have, t: tt, T: r.targetTotal }) : t('s5cap', { need: r.need });
  else status = r.hit ? t('s5hit') : x > r.need ? t('s5more', { d: x - r.need }) : t('s5less', { d: r.need - x });
  $('r5').textContent = t('s5readout', { t: tt, T: r.targetTotal, have: r.have, need: r.need, x, m: fmt(r.mean), status });
}

function refresh() { fillSelects(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  reset0(); reset1(); fillSelects();
  $('pour0').addEventListener('click', () => { s0.sel = null; doPour0(num('from0'), num('to0')); });
  $('reset0').addEventListener('click', () => { reset0(); draw0(); });
  $('from0').addEventListener('change', () => { s0.sel = num('from0'); draw0(); });
  $('c0').classList.add('clickable');
  $('c0').addEventListener('click', e => {
    const rect = $('c0').getBoundingClientRect(), W = rect.width, slot = (W - 34 - 44) / 4, i = Math.floor((e.clientX - rect.left - 34) / slot);
    if (i < 0 || i > 3) return;
    if (s0.sel === null) { s0.sel = i; $('from0').value = String(i); s0.msgKey = null; draw0(); }
    else { const from = s0.sel; s0.sel = null; $('to0').value = String(i); doPour0(from, i); }
  });

  $('pour1').addEventListener('click', () => { if (!s1.fly) move1(); });
  $('auto1').addEventListener('click', () => { if (!s1.auto && !s1.fly) auto1(); });
  $('next1').addEventListener('click', () => { s1.preset = (s1.preset + 1) % M.S1.presets.length; reset1(); draw1(); });
  $('reset1').addEventListener('click', () => { reset1(); draw1(); });

  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.p = 1; draw2(); });
  $('play2').addEventListener('click', () => { s2.p = 0; animate('s2', 4200, p => { s2.p = p; draw2(); }); });

  $('x3').addEventListener('input', draw3);
  $('add4').addEventListener('click', () => { s4.on = !s4.on; draw4(); });
  $('x4').addEventListener('input', draw4);
  ['x5', 't5'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    // Hidden page: finish every running animation at once and leave no loop behind.
    if (anims.s2) { stopAnim('s2'); s2.p = 1; draw2(); }
    if (anims.s1 || s1.auto) {
      stopAnim('s1');
      if (s1.fly) { s1.cups = M.pour(s1.cups, s1.fly.from, s1.fly.to, Infinity).cups; s1.k++; s1.fly = null; }
      if (s1.auto) { const plan = M.levelPlan(s1.cups); s1.cups = plan.final; s1.k += plan.moves.length; s1.auto = false; }
      draw1();
    }
  });
  window.refreshAvg = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
