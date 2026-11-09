'use strict';
// Chickens & Rabbits (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, path and readout is computed by window.CR_MODEL (model.js). Canvas text is limited to axis
// numbers, end captions and marker tags in reserved rows; label() keeps them apart and on-canvas.
(function () {

const $ = id => document.getElementById(id);
const M = window.CR_MODEL;
const t = (...a) => window.CR_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#f5d76e', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', dark: '#07131a', bar: '#2c3b50' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const lerp = (a, b, p) => a + (b - a) * p;
const ease = p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
// Which cage positions hold rabbits: the first r entries of this order (so r = 4 always looks the same).
const RABBIT_ORDER = [1, 4, 6, 9, 0, 2, 3, 5, 7, 8];
const kinds = r => { const k = new Array(10).fill('chicken'); RABBIT_ORDER.slice(0, r).forEach(i => { k[i] = 'rabbit'; }); return k; };

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

// Places one label inside the canvas; if it would touch a label already placed in this drawing it tries the
// rows in `alt`, and is left out when none is free (every number on a canvas is also in the DOM readout).
function label(cv, text, x, y, o = {}) {
  const { ctx, W, H, boxes } = cv, size = o.size || 12;
  ctx.save(); ctx.font = `${o.bold ? 700 : 500} ${size}px system-ui,sans-serif`;
  const w = ctx.measureText(text).width, asc = size * 0.78, desc = size * 0.24;
  const align = o.align || 'center';
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(2, Math.min(W - 2 - w, x0));
  for (const dy of [0].concat(o.alt || [])) {
    const yy = Math.max(asc + 2, Math.min(H - desc - 2, y + dy));
    const b = { x0: x0 - 2, x1: x0 + w + 2, y0: yy - asc - 1, y1: yy + desc + 1 };
    if (boxes.some(q => b.x0 < q.x1 && q.x0 < b.x1 && b.y0 < q.y1 && q.y0 < b.y1)) continue;
    boxes.push(b);
    if (o.bg) { ctx.fillStyle = C.bg; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
    ctx.fillStyle = o.color || C.muted; ctx.textAlign = 'left'; ctx.fillText(text, x0, yy); ctx.restore(); return true;
  }
  ctx.restore(); return false;
}

/* ---------- animals ---------- */
// One animal standing on groundY. lift ∈ [0, 1]: how far the 2 lifted feet are raised (both of a chicken's,
// a rabbit's front pair). morph ∈ [0, 1] cross-fades a chicken into a rabbit (step 1 swaps).
function animal(ctx, cx, gy, s, kind, o = {}) {
  const lift = o.lift || 0, alpha = o.alpha == null ? 1 : o.alpha, leg = s * 0.7;
  const isR = kind === 'rabbit';
  const sit = isR ? 0 : lift * leg * 0.85;            // a chicken with both feet up sits down
  const by = gy - leg - s * 0.45 + sit;                // body centre
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round';
  const legsX = isR ? [-0.5, -0.2, 0.2, 0.5] : [-0.2, 0.2];
  const lifted = isR ? [false, false, true, true] : [true, true];
  legsX.forEach((dx, i) => {
    const x = cx + dx * s, up = lifted[i] ? lift : 0;
    const footY = lerp(gy, by + s * 0.05, up), footX = x + (lifted[i] ? up * s * (isR ? 0.75 : 0.6) : 0);
    ctx.strokeStyle = isR ? '#c9d3df' : '#e0a33a'; ctx.lineWidth = Math.max(1.6, s * 0.11);
    ctx.beginPath(); ctx.moveTo(x, by + s * 0.25); ctx.lineTo(footX, footY); ctx.stroke();
    ctx.fillStyle = up > 0.5 ? C.orange : C.green;
    ctx.beginPath(); ctx.arc(footX, footY, Math.max(2.2, s * 0.13), 0, 7); ctx.fill();
  });
  if (isR) {
    ctx.fillStyle = '#e8edf4';
    [-0.15, 0.12].forEach(dx => { ctx.beginPath(); ctx.ellipse(cx + s * (0.42 + dx), by - s * 0.95, s * 0.1, s * 0.32, dx * 0.6, 0, 7); ctx.fill(); });
    ctx.beginPath(); ctx.ellipse(cx, by, s * 0.62, s * 0.45, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + s * 0.5, by - s * 0.45, s * 0.28, 0, 7); ctx.fill();
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(cx + s * 0.62, by - s * 0.48, s * 0.05, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.ellipse(cx, by, s * 0.5, s * 0.4, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + s * 0.42, by - s * 0.42, s * 0.24, 0, 7); ctx.fill();
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(cx + s * 0.4, by - s * 0.68, s * 0.09, 0, 7); ctx.fill();
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(cx + s * 0.64, by - s * 0.46); ctx.lineTo(cx + s * 0.82, by - s * 0.4); ctx.lineTo(cx + s * 0.64, by - s * 0.34); ctx.fill();
  }
  ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(cx + s * (isR ? 0.55 : 0.47), by - s * (isR ? 0.5 : 0.46), Math.max(1, s * 0.05), 0, 7); ctx.fill();
  ctx.restore();
}
// Cage of 10 animals in 2 rows of 5 between y0 and y1.
function cage(ctx, W, y0, y1, ks, o = {}) {
  const L = 14, R = W - 14, cw = (R - L) / 5, rh = (y1 - y0) / 2, s = Math.min(cw * 0.36, rh * 0.32, 26);
  ctx.save(); ctx.strokeStyle = C.bar; ctx.lineWidth = 1.5; ctx.strokeRect(L - 6, y0, R - L + 12, y1 - y0);
  for (let i = 1; i < 10; i++) { const x = L - 6 + (R - L + 12) * i / 10; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (let row = 0; row < 2; row++) { const gy = y0 + rh * (row + 1) - 8; ctx.beginPath(); ctx.moveTo(L - 6, gy + 0.5); ctx.lineTo(R + 6, gy + 0.5); ctx.stroke(); }
  ctx.restore();
  ks.forEach((k, i) => {
    const cx = L + cw * (i % 5 + 0.5) - s * 0.15, gy = y0 + rh * (Math.floor(i / 5) + 1) - 8;
    if (o.morph && o.morph.i === i) { animal(ctx, cx, gy, s, 'chicken', { alpha: 1 - o.morph.p }); animal(ctx, cx, gy, s, 'rabbit', { alpha: o.morph.p }); }
    else animal(ctx, cx, gy, s, k, { lift: o.lift || 0 });
  });
}

// Horizontal number line of feet. Returns x(v).
function numberLine(cv, y, vMin, vMax, o = {}) {
  const { ctx, W } = cv, L = o.L || 26, R = W - (o.R || 26), x = v => L + (v - vMin) / (vMax - vMin) * (R - L);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); ctx.restore();
  return x;
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

/* ---------- step 0: guess and check ---------- */
const s0 = { tried: new Set([M.S0.rDefault]) };
function draw0() {
  const r = num('r0'), H = M.S0.heads, c = H - r, f = M.feet(c, r), goal = M.S0.feet;
  $('r0v').textContent = String(r);
  const cv = fitCanvas($('c0')), { ctx, W } = cv;
  cage(ctx, W, 8, 200, kinds(r));
  const y = 262, x = numberLine(cv, y, 18, 42);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 18; v <= 42; v += 2) { ctx.beginPath(); ctx.moveTo(x(v), y - 5); ctx.lineTo(x(v), y + 5); ctx.stroke(); }
  ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(goal), y - 22); ctx.lineTo(x(goal), y + 10); ctx.stroke(); ctx.restore();
  for (let v = 20; v <= 40; v += 4) label(cv, String(v), x(v), y + 24, { size: 11 });
  label(cv, t('tickFeet'), 8, y + 44, { align: 'left', size: 11 });
  [...s0.tried].forEach(q => { if (q === r) return; ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(x(M.feet(H - q, q)), y, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
  ctx.fillStyle = f === goal ? C.green : C.cyan; ctx.beginPath(); ctx.arc(x(f), y, 8, 0, 7); ctx.fill();
  ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
  label(cv, String(goal), x(goal), y - 28, { size: 12, bold: true, color: C.green });
  label(cv, String(f), x(f), y - 14, { size: 13, bold: true, color: C.text, alt: [-30, 28] });
  const d = Math.abs(f - goal), cmp = f < goal ? t('s0less', { d }) : f > goal ? t('s0more', { d }) : t('s0hit');
  $('o0').textContent = t('s0readout', { r, c, f, cmp });
}

/* ---------- step 1: assume all chickens, swap one at a time ---------- */
const s1 = { k: 0, morph: null, auto: false };
const NEED1 = M.solveCR(M.S0.heads, M.S0.feet).nb;
function swap1(then) {
  if (s1.k >= NEED1 || s1.morph) return;
  s1.morph = { i: RABBIT_ORDER[s1.k], p: 0 };
  animate('s1', 600, p => { s1.morph.p = p; draw1(); }, () => { s1.k++; s1.morph = null; draw1(); if (then) then(); });
}
function auto1() { s1.auto = true; const go = () => { if (s1.auto && s1.k < NEED1) swap1(go); else { s1.auto = false; draw1(); } }; go(); }
function draw1() {
  const H = M.S0.heads, goal = M.S0.feet, k = s1.k, p = s1.morph ? ease(s1.morph.p) : 0;
  const fNow = M.feet(H - k, k) + 2 * p, gap = goal - M.feet(H - k, k);
  const cv = fitCanvas($('c1')), { ctx, W } = cv;
  cage(ctx, W, 8, 200, kinds(k), { morph: s1.morph ? { i: s1.morph.i, p: s1.morph.p } : null });
  const y = 248, x = numberLine(cv, y + 14, 0, 40, { L: 26, R: 26 });
  // the feet bar, built from 2-foot pieces; the newest piece glows while it grows in
  ctx.save();
  for (let v = 0; v < fNow - 1e-9; v += 2) {
    const w = Math.min(2, fNow - v), fresh = v >= M.feet(H - k, k) - 2 + 1e-9 && k > 0 && !s1.morph;
    ctx.fillStyle = v >= 2 * H ? (fresh ? C.green : C.cyan) : '#3f8fb0'; ctx.fillRect(x(v) + 0.5, y - 12, x(v + w) - x(v) - 1, 24);
  }
  ctx.setLineDash([4, 3]); ctx.strokeStyle = C.pink; ctx.lineWidth = 1.6;
  if (goal - fNow > 1e-9) ctx.strokeRect(x(fNow) + 1, y - 11, x(goal) - x(fNow) - 2, 22);
  ctx.setLineDash([]); ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x(goal), y - 22); ctx.lineTo(x(goal), y + 22); ctx.stroke();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; for (let v = 0; v <= 40; v += 10) { ctx.beginPath(); ctx.moveTo(x(v), y + 14); ctx.lineTo(x(v), y + 20); ctx.stroke(); }
  ctx.restore();
  for (const v of [0, 10, 20, 30, 40]) label(cv, String(v), x(v), y + 34, { size: 11 });
  label(cv, String(goal), x(goal), y - 28, { size: 12, bold: true, color: C.green });
  label(cv, t('tickFeet'), 8, y + 54, { align: 'left', size: 11 });
  $('o1').textContent = k >= NEED1 ? t('s1done', { k, c: H - k, f: M.feet(H - k, k) }) : t('s1readout', { k, c: H - k, f: M.feet(H - k, k), gap });
  $('swap1').disabled = k >= NEED1 || !!s1.morph; $('auto1').disabled = k >= NEED1 || s1.auto;
}

/* ---------- step 2: everyone lifts two feet ---------- */
const s2 = { lift: 0, up: false };
function draw2() {
  const H = M.S0.heads, F = M.S0.feet, s = M.solveCR(H, F), L = M.lift(H, F);
  const cv = fitCanvas($('c2')), { ctx, W } = cv;
  cage(ctx, W, 8, 268, kinds(s.nb), { lift: s2.lift });
  $('o2').textContent = s2.lift >= 1 ? t('s2readout', { lifted: L.lifted, H, F, ground: L.ground, r: L.rabbits, c: H - L.rabbits }) : t('s2before', { H, F });
  $('lift2').disabled = s2.up; $('down2').disabled = !s2.up;
}

/* ---------- steps 3 and 4: the number line from all chickens to all rabbits ---------- */
function feetLine(cv, H, F, y, o = {}) {
  const lo = 2 * H, hi = 4 * H, vMin = Math.min(lo, F) - 2, vMax = Math.max(hi, F) + 2;
  const x = numberLine(cv, y, vMin, vMax, { L: 24, R: 24 }), { ctx } = cv;
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4;
  for (let v = lo; v <= hi; v += 2) { ctx.beginPath(); ctx.moveTo(x(v), y - 6); ctx.lineTo(x(v), y + 6); ctx.stroke(); }
  ctx.lineWidth = 3; ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(x(lo), y - 10); ctx.lineTo(x(lo), y + 10); ctx.stroke();
  ctx.strokeStyle = C.pink; ctx.beginPath(); ctx.moveTo(x(hi), y - 10); ctx.lineTo(x(hi), y + 10); ctx.stroke(); ctx.restore();
  // F marker: a triangle pointing at the line
  ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(x(F), y - (o.markGap || 8)); ctx.lineTo(x(F) - 7, y - (o.markGap || 8) - 12); ctx.lineTo(x(F) + 7, y - (o.markGap || 8) - 12); ctx.closePath(); ctx.fill(); ctx.restore();
  label(cv, String(F), x(F), y - (o.markGap || 8) - 17, { size: 13, bold: true, color: C.orange });
  const dn = o.below || 26;
  label(cv, String(lo), x(lo), y + dn, { size: 12, bold: true, color: C.cyan });
  label(cv, String(hi), x(hi), y + dn, { size: 12, bold: true, color: C.pink });
  label(cv, t('allC'), x(lo), y + dn + 17, { size: 11, color: C.cyan, align: 'left', alt: [14] });
  label(cv, t('allR'), x(hi), y + dn + 17, { size: 11, color: C.pink, align: 'right', alt: [14] });
  return x;
}
function s3text(H, F) {
  const s = M.solveCR(H, F);
  if (s.ok) return t('s3ok', { H, base: s.base, F, gap: s.gap, r: s.nb, c: s.na });
  if (s.reason === 'low') return t('s3low', { H, base: s.base, F });
  if (s.reason === 'high') return t('s3high', { H, top: s.top, F });
  return t('s3frac', { gap: s.gap, F });
}
function draw3() {
  const H = num('h3'), F = num('f3'), s = M.solveCR(H, F);
  $('h3v').textContent = String(H); $('f3v').textContent = String(F);
  const cv = fitCanvas($('c3')), { ctx } = cv, y = 94;
  const x = feetLine(cv, H, F, y, { markGap: 10 });
  if (s.ok) {
    ctx.save(); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x(F), y, 6, 0, 7); ctx.fill(); ctx.restore();
    label(cv, t('rabbitsLbl', { r: s.nb }), x(F), y - 46, { size: 12, bold: true, color: C.green });
  }
  $('o3').textContent = s3text(H, F);
  draw4();
}
const s4 = { c: -1, r: -1 };
function draw4() {
  const H = num('h3'), F = num('f3'), s = M.solveCR(H, F);
  const cv = fitCanvas($('c4')), { ctx } = cv, y = 92;
  const x = feetLine(cv, H, F, y, { markGap: 26, below: 36 });
  const pc = M.pathFromChickens(H, F), pr = M.pathFromRabbits(H, F);
  const dots = (path, n, col, dy) => { for (let i = 0; i <= n && i < path.length; i++) { ctx.fillStyle = col; ctx.globalAlpha = i === n ? 1 : 0.5; ctx.beginPath(); ctx.arc(x(path[i]), y + dy, i === n ? 6 : 4, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; };
  if (s.ok) { if (s4.c >= 0) dots(pc, s4.c, C.cyan, -13); if (s4.r >= 0) dots(pr, s4.r, C.pink, 13); }
  ['fromC4', 'fromR4', 'both4'].forEach(id => { $(id).disabled = !s.ok; });
  let msg;
  if (!s.ok) msg = t('s4none');
  else {
    const parts = [];
    if (s4.c >= 0) parts.push(s4.c >= s.nb ? t('s4c', { base: s.base, gap: s.gap, r: s.nb, F }) : `${t('allC')} → ${pc[s4.c]}`);
    if (s4.r >= 0) parts.push(s4.r >= s.na ? t('s4r', { top: s.top, over: s.over, c: s.na, F }) : `${t('allR')} → ${pr[s4.r]}`);
    if (s4.c >= s.nb && s4.r >= s.na) parts.push(t('s4same', { c: s.na, r: s.nb, H }));
    msg = parts.length ? parts.join(' ') : t('s4idle');
  }
  $('o4').textContent = t('s4readout', { H, F, msg });
}
function walk4(which) {
  const H = num('h3'), F = num('f3'), s = M.solveCR(H, F); if (!s.ok) return;
  const n = which === 'c' ? s.nb : s.na, name = 's4' + which;
  s4[which] = 0; draw4();
  animate(name, Math.max(1, n) * 380, p => { s4[which] = Math.min(n, Math.floor(p * (n + 0.999))); draw4(); }, () => { s4[which] = n; draw4(); });
}

/* ---------- step 5: other stories ---------- */
const s5 = { story: 0 };
const KEYS = ['bikes', 'tickets', 'bugs'];
function pickStory(i) {
  s5.story = i; const st = M.STORIES[i];
  $('t5').max = String(st.tMax); $('n5').max = String(st.nMax); $('n5').value = String(st.n); $('t5').value = String(st.total);
  draw5();
}
function draw5() {
  const st = M.STORIES[s5.story], key = KEYS[s5.story], n = num('n5'), T = num('t5'), s = M.solve(n, T, st.a, st.b);
  KEYS.forEach((_, i) => $('story' + i).setAttribute('aria-pressed', String(i === s5.story)));
  $('n5v').textContent = String(n); $('t5v').textContent = String(T);
  const A = t(key + 'A'), B = t(key + 'B'), u = t(key + 'U'), q = t(key + 'Q');
  $('q5').textContent = t(key + 'Story', { n, T });
  const cv = fitCanvas($('c5')), { ctx, W, H } = cv;
  const L = 44, R = W - 44, Tp = 26, Bt = H - 50;
  const yMin = Math.min(s.base, T) - st.b, yMax = Math.max(s.top, T) + st.b;
  const x = k => L + (k + 0.5) / (n + 1) * (R - L), y = v => Bt - (v - yMin) / (yMax - yMin) * (Bt - Tp);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, Tp - 6); ctx.lineTo(L, Bt); ctx.lineTo(R, Bt); ctx.stroke();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; [s.base, s.top].forEach(v => { ctx.beginPath(); ctx.moveTo(L, y(v)); ctx.lineTo(R, y(v)); ctx.stroke(); });
  // staircase
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let k = 0; k <= n; k++) { const v = s.base + k * s.step; if (!k) ctx.moveTo(x(k), y(v)); else { ctx.lineTo(x(k), y(v - s.step)); ctx.lineTo(x(k), y(v)); } }
  ctx.stroke();
  for (let k = 0; k <= n; k++) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x(k), y(s.base + k * s.step), 3.2, 0, 7); ctx.fill(); }
  ctx.strokeStyle = C.orange; ctx.setLineDash([7, 5]); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(L, y(T)); ctx.lineTo(R + 4, y(T)); ctx.stroke(); ctx.setLineDash([]);
  if (s.ok) { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x(s.nb), y(T), 7, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
  label(cv, String(T), R + 8, y(T) + 5, { align: 'left', size: 13, bold: true, color: C.orange });
  label(cv, String(s.base), L - 6, y(s.base) + 4, { align: 'right', size: 11, alt: [12] });
  label(cv, String(s.top), L - 6, y(s.top) + 4, { align: 'right', size: 11, alt: [-12] });
  // x ticks: as many counts as fit with ≥ 26 px between them
  const every = [1, 2, 5, 10].find(m => (x(m) - x(0)) >= 26) || 10;
  for (let k = 0; k <= n; k += every) label(cv, String(k), x(k), Bt + 16, { size: 11 });
  if (s.ok) label(cv, String(s.nb), x(s.nb), Bt + 16, { size: 11, bold: true, color: C.green, alt: [14] });
  label(cv, t('s5xcap', { B }), R, Bt + 38, { align: 'right', size: 11, color: C.muted });
  label(cv, t('s5ycap', { u }), 6, 12, { align: 'left', size: 11, color: C.muted });
  const P = { A, B, u, q, n, a: st.a, b: st.b, T, base: s.base, top: s.top, gap: s.gap, step: s.step };
  let res;
  if (s.ok) res = t('s5ok', { ...P, nb: s.nb, na: s.na });
  else if (s.reason === 'low') res = t('s5low', P);
  else if (s.reason === 'high') res = t('s5high', P);
  else res = t('s5frac', { ...P, lo: s.lo, hi: s.hi });
  $('o5').textContent = res;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw5(); }

function setup() {
  $('r0').addEventListener('input', () => { s0.tried.add(num('r0')); draw0(); });
  $('clear0').addEventListener('click', () => { s0.tried = new Set([num('r0')]); draw0(); });
  $('swap1').addEventListener('click', () => { if (!s1.morph) swap1(); });
  $('auto1').addEventListener('click', () => { if (!s1.auto && !s1.morph) auto1(); });
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.auto = false; s1.morph = null; s1.k = 0; draw1(); });
  $('lift2').addEventListener('click', () => { s2.up = true; const from = s2.lift; animate('s2', 900, p => { s2.lift = lerp(from, 1, ease(p)); draw2(); }); });
  $('down2').addEventListener('click', () => { s2.up = false; const from = s2.lift; animate('s2', 600, p => { s2.lift = lerp(from, 0, ease(p)); draw2(); }); });
  // new heads/feet: the walks of step 4 start over (a resize or language switch keeps them)
  ['h3', 'f3'].forEach(id => $(id).addEventListener('input', () => { s4.c = -1; s4.r = -1; stopAnim('s4c'); stopAnim('s4r'); draw3(); }));
  $('fromC4').addEventListener('click', () => walk4('c'));
  $('fromR4').addEventListener('click', () => walk4('r'));
  $('both4').addEventListener('click', () => { walk4('c'); walk4('r'); });
  KEYS.forEach((_, i) => $('story' + i).addEventListener('click', () => pickStory(i)));
  ['n5', 't5'].forEach(id => $(id).addEventListener('input', draw5));

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
    // Hidden page: jump every animation to its end state and leave no loop running.
    if (anims.s1 || s1.auto) { stopAnim('s1'); s1.morph = null; s1.k = s1.auto ? NEED1 : Math.min(NEED1, s1.k + 1); s1.auto = false; draw1(); }
    if (anims.s2) { stopAnim('s2'); s2.lift = s2.up ? 1 : 0; draw2(); }
    ['c', 'r'].forEach(w => { if (anims['s4' + w]) { stopAnim('s4' + w); const s = M.solveCR(num('h3'), num('f3')); s4[w] = w === 'c' ? s.nb : s.na; } });
    draw4();
  });
  window.refreshCR = refresh;
  pickStory(0);
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
