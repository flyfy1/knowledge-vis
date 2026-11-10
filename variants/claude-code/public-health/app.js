'use strict';
// Epidemic maths lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, count and readout comes from window.PH_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink-to-fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PH_MODEL;
const t = (...a) => window.PH_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', tn: '#2b3a4d', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (v, d = 1) => fmt(v * 100, d);
const count = v => (v >= 10 ? String(Math.round(v)) : fmt(v, 2));

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
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A plot panel. xTicks / yTicks are [value, label] pairs; x labels that would collide are skipped.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: (o.r !== undefined ? o.r : W - (o.right || 12)), t: o.top, b: o.bottom };
  if (o.l !== undefined) P.l = o.l;
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const [v, label] of o.yTicks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(label, P.l - 6, y(v) + 4);
  }
  let lastRight = -Infinity; ctx.textAlign = 'center';
  for (const [v, label] of o.xTicks) {
    const X = x(v), w = ctx.measureText(label).width;
    if (o.xGrid !== false) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b); ctx.stroke(); }
    const cx = Math.min(Math.max(X, P.l + w / 2), W - 2 - w / 2);
    if (cx - w / 2 < lastRight + 6) continue;
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    ctx.fillText(label, cx, P.b + 15); lastRight = cx + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, o.titleX !== undefined ? o.titleX : 8, P.t - 9, o.titleW || W - 16);
  return { x, y, P };
}
const linTicks = (a, b, s, d = 0, suffix = '') => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push([v, fmt(v, d) + suffix]); return out; };
function line(ctx, m, xs, ys, color, { lw = 2, alpha = 1, dash = null } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip();
  ctx.beginPath(); xs.forEach((v, i) => { const X = m.x(v), Y = m.y(ys[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
  ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [5, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, color, r = 6) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
// A "nice" upper limit and 4–5 ticks for an axis that starts at 0.
function niceMax(v) { const steps = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]; for (const s of steps) if (v <= s * 4) return { max: s * 4, step: s }; return { max: 100, step: 25 }; }

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: generations ---------- */
const LOGT = [[-3, '0.001'], [0, '1'], [3, '1000'], [6, '10⁶']];
function draw0() {
  const R0 = num('r0'), g = num('g0');
  $('r0v').textContent = fmt(R0, 1); $('g0v').textContent = String(g);
  const { ctx, W, H } = fitCanvas($('c0'));
  // --- top: tree, only while the last drawn generation stays countable ---
  const levels = M.tree(R0, Math.min(g, 6));
  let shown = 0; for (let k = 1; k <= Math.min(g, 5); k++) { if (levels[k].length > 0 && levels[k].length <= Math.min(110, (W - 24) / 3.2)) shown = k; else break; }
  title(ctx, t('c0top'), 8, 17, W - 16);
  const tTop = 34, tBot = 166, rowH = shown ? (tBot - tTop) / Math.max(shown, 1) : 0;
  const pos = levels.slice(0, shown + 1).map((lv, k) => lv.map((_, j) => ({ x: 12 + (j + 0.5) / lv.length * (W - 24), y: tTop + k * rowH })));
  ctx.save();
  for (let k = 1; k <= shown; k++) levels[k].forEach((nd, j) => { const a = pos[k][j], b = pos[k - 1][nd.parent]; ctx.strokeStyle = 'rgba(103,215,249,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
  for (let k = 0; k <= shown; k++) { const r = Math.max(1.8, Math.min(6, 160 / Math.max(10, levels[k].length * 4))); pos[k].forEach(p => { ctx.fillStyle = k === 0 ? C.text : C.cyan; ctx.beginPath(); ctx.arc(p.x, p.y, k === 0 ? 6 : r, 0, 7); ctx.fill(); }); }
  ctx.restore();
  // --- bottom: bars on a log axis ---
  const m = panel(ctx, W, { top: 214, bottom: H - 26, xMin: -0.6, xMax: 10.6, yMin: -3, yMax: 6.5, yTicks: LOGT, xTicks: linTicks(0, 10, 1), xGrid: false, left: 44, title: t('c0bot') });
  const bw = Math.min(30, (m.x(1) - m.x(0)) * 0.62);
  for (let k = 0; k <= 10; k++) {
    const v = Math.log10(M.generation(R0, k)), Y = m.y(Math.max(-3, Math.min(6.5, v)));
    ctx.fillStyle = k <= g ? C.orange : 'rgba(255,180,84,0.12)';
    ctx.fillRect(m.x(k) - bw / 2, Y, bw, m.P.b - Y);
  }
  hline(ctx, m, 0, C.ghost, [5, 4], 1.5);
  const n = M.generation(R0, g), cum = M.cumulative(R0, g);
  const trend = R0 > 1 + 1e-9 ? t('trendUp') : R0 < 1 - 1e-9 ? t('trendDown', { lim: fmt(1 / (1 - R0), 2) }) : t('trendFlat');
  let txt = t('s0readout', { r: fmt(R0, 1), g, n: count(n), cum: count(cum), trend });
  if (shown < Math.min(g, 5) && levels[shown + 1] && levels[shown + 1].length) txt += ' ' + t('treeMore', { k: shown + 1, shown });
  $('o0').textContent = txt;
}

/* ---------- step 1: the whole SIR curve ---------- */
const s1 = { tried: [] };
function draw1() {
  const R0 = num('r1'), D = num('d1');
  $('r1v').textContent = fmt(R0, 1); $('d1v').textContent = t('days', { n: D });
  const run = M.sir({ R0, D }), s = M.summary(run);
  const key = R0 + '/' + D; if (!s1.tried.some(q => q.key === key)) { s1.tried.push({ key, run }); if (s1.tried.length > 12) s1.tried.shift(); }
  const xMax = Math.min(720, Math.max(120, Math.ceil(s.peakDay * 2.4 / 60) * 60));
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax, yMin: 0, yMax: 100, yTicks: linTicks(0, 100, 25, 0, '%'), xTicks: linTicks(0, xMax, xMax / 6), left: 44, title: t('c1') });
  for (const q of s1.tried) if (q.key !== key) line(ctx, m, q.run.t, q.run.I.map(v => v * 100), C.pink, { lw: 1.4, alpha: 0.3 });
  line(ctx, m, run.t, run.S.map(v => v * 100), C.cyan, { lw: 2.2 });
  line(ctx, m, run.t, run.R.map(v => v * 100), C.green, { lw: 2.2 });
  line(ctx, m, run.t, run.I.map(v => v * 100), C.pink, { lw: 2.6 });
  if (s.peakDay <= xMax) { vline(ctx, m.x(s.peakDay), m.y(s.peak * 100), m.P.b, C.pink, [3, 3], 1); dot(ctx, m.x(s.peakDay), m.y(s.peak * 100), C.pink, 5); }
  $('o1').textContent = t('s1readout', { r: fmt(R0, 1), d: D, day: s.peakDay, peak: pct(s.peak), final: pct(s.final), never: pct(1 - s.final) });
}

/* ---------- step 2: why it peaks ---------- */
const BASE = M.sir(), BASE_S = M.summary(BASE);
function draw2(progress = null) {
  const day = num('t2'), i = day;
  $('t2v').textContent = String(day);
  const { ctx, W, H } = fitCanvas($('c2'));
  const days = BASE.t.slice(0, 121);
  const top = panel(ctx, W, { top: 30, bottom: 190, xMin: 0, xMax: 120, yMin: 0, yMax: 25, yTicks: linTicks(0, 25, 5, 0, '%'), xTicks: linTicks(0, 120, 20), left: 44, title: t('c2top') });
  line(ctx, top, days, BASE.I.slice(0, 121).map(v => v * 100), C.pink, { lw: 1.4, alpha: 0.3 });
  line(ctx, top, days.slice(0, i + 1), BASE.I.slice(0, i + 1).map(v => v * 100), C.pink, { lw: 2.6 });
  const bot = panel(ctx, W, { top: 236, bottom: H - 26, xMin: 0, xMax: 120, yMin: 0, yMax: 2.7, yTicks: [[0, '0'], [1, '1'], [2, '2'], [2.5, '2.5']], xTicks: linTicks(0, 120, 20), left: 44, title: t('c2bot') });
  hline(ctx, bot, 1, C.ghost);
  const Re = BASE.S.slice(0, 121).map((_, j) => M.effectiveR(BASE, j));
  line(ctx, bot, days, Re, C.orange, { lw: 1.4, alpha: 0.3 });
  line(ctx, bot, days.slice(0, i + 1), Re.slice(0, i + 1), C.orange, { lw: 2.6 });
  vline(ctx, top.x(day), top.P.t, bot.P.b, C.text, [3, 3], 1.2);
  dot(ctx, top.x(day), top.y(BASE.I[i] * 100), C.pink, 5); dot(ctx, bot.x(day), bot.y(Re[i]), C.orange, 5);
  const re = Re[i], atPeak = day === BASE_S.peakDay || day === BASE_S.peakDay - 1;
  const trend = atPeak ? t('s2peak') : re > 1 ? t('s2up') : t('s2down');
  $('o2').textContent = (progress !== null ? t('s2progress', { day }) + ' ' : '') + t('s2readout', { day, s: pct(BASE.S[i]), i: pct(BASE.I[i]), sf: fmt(BASE.S[i], 3), re: fmt(re, 2), trend });
}

/* ---------- step 3: temporary contact reduction ---------- */
const PRESETS = { pre3a: [0.6, 10, 60], pre3b: [0.5, 30, 60], pre3c: [0.9, 0, 200] };
function draw3() {
  const c = num('cc3'), st = num('st3'), len = num('ln3');
  $('c3v').textContent = Math.round(c * 100) + '%'; $('s3v').textContent = String(st); $('l3v').textContent = t('days', { n: len });
  for (const [id, p] of Object.entries(PRESETS)) $(id).setAttribute('aria-pressed', p[0] === c && p[1] === st && p[2] === len ? 'true' : 'false');
  const run = M.sir({ contact: M.window(c, st, len) }), s = M.summary(run), b = BASE_S;
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 360, yMin: 0, yMax: 25, yTicks: linTicks(0, 25, 5, 0, '%'), xTicks: linTicks(0, 360, 60), left: 44, title: t('c3') });
  if (c > 0 && len > 0) { ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.13)'; const x0 = m.x(st), x1 = m.x(Math.min(360, st + len)); ctx.fillRect(x0, m.P.t, x1 - x0, m.P.b - m.P.t); ctx.restore(); }
  hline(ctx, m, M.CAPACITY * 100, C.orange);
  line(ctx, m, BASE.t, BASE.I.map(v => v * 100), C.ghost, { lw: 1.8, dash: [6, 4] });
  line(ctx, m, run.t, run.I.map(v => v * 100), C.pink, { lw: 2.6 });
  if (s.peakDay <= 360) dot(ctx, m.x(s.peakDay), m.y(s.peak * 100), C.pink, 5);
  const base = { bpk: pct(b.peak), bpd: b.peakDay, bfin: pct(b.final), bab: b.above };
  $('o3').textContent = c === 0 || len === 0 ? t('s3none', base)
    : t('s3readout', Object.assign({ c: Math.round(c * 100), st, end: st + len, pk: pct(s.peak), pd: s.peakDay, fin: pct(s.final), ab: s.above }, base));
}
function preset(id) { const [c, st, len] = PRESETS[id]; $('cc3').value = c; $('st3').value = st; $('ln3').value = len; draw3(); }

/* ---------- step 4: vaccination ---------- */
const VGRID = []; for (let k = 0; k <= 40; k++) VGRID.push(k / 40);
const finalCache = new Map();
function finalCurve(e) {
  const k = e.toFixed(2);
  if (!finalCache.has(k)) finalCache.set(k, VGRID.map(v => M.summary(M.sir({ immune: v * e })).final));
  return finalCache.get(k);
}
function draw4() {
  const v = num('v4'), e = num('e4'), R0 = M.DEFAULTS.R0;
  $('v4v').textContent = Math.round(v * 100) + '%'; $('e4v').textContent = Math.round(e * 100) + '%';
  const run = M.sir({ immune: v * e }), s = M.summary(run), vc = M.vaccineThreshold(R0, e), re0 = R0 * (1 - v * e);
  const { ctx, W, H } = fitCanvas($('c4'));
  const top = panel(ctx, W, { top: 30, bottom: 190, xMin: 0, xMax: 1, yMin: 0, yMax: 100, yTicks: linTicks(0, 100, 25, 0, '%'), xTicks: VGRID.filter((_, i) => i % 8 === 0).map(x => [x, Math.round(x * 100) + '%']), left: 44, title: t('c4top') });
  line(ctx, top, VGRID, finalCurve(e).map(z => z * 100), C.text, { lw: 2.2 });
  if (vc <= 1) vline(ctx, top.x(vc), top.P.t, top.P.b, C.orange);
  dot(ctx, top.x(v), top.y(s.final * 100), C.text, 6);
  const ny = niceMax(Math.max(s.peak * 100 * 1.15, 0.5));
  const bot = panel(ctx, W, { top: 236, bottom: H - 26, xMin: 0, xMax: 720, yMin: 0, yMax: ny.max, yTicks: linTicks(0, ny.max, ny.step, ny.step < 1 ? 1 : 0, '%'), xTicks: linTicks(0, 720, 120), left: 44, title: t('c4bot') });
  line(ctx, bot, run.t, run.I.map(z => z * 100), C.pink, { lw: 2.4 });
  const eP = Math.round(e * 100);
  const res = re0 <= 1 + 1e-12 ? t('s4stop', { fin: pct(s.final, 2) }) : t('s4grow', { pk: pct(s.peak, 2), pd: s.peakDay, fin: pct(s.final) });
  $('o4').textContent = t('s4readout', { v: Math.round(v * 100), e: eP, imm: pct(v * e), re: fmt(re0, 3), res, vc: vc <= 1 ? pct(vc) + '%' : pct(vc) + '% ' + t('s4unreach', { e: eP }) });
}

/* ---------- step 5: testing ---------- */
const s5 = { peakNote: null };
const GROUP_COL = { TP: C.pink, FN: C.violet, FP: C.orange, TN: C.tn };
function draw5() {
  const p = num('p5'), se = num('se5'), sp = num('sp5');
  $('p5v').textContent = pct(p) + '%'; $('se5v').textContent = pct(se) + '%'; $('sp5v').textContent = pct(sp) + '%';
  const c = M.testCounts(p, se, sp), g = M.testGrid(p, se, sp);
  const { ctx, W, H } = fitCanvas($('c5'));
  const wide = W >= 560;
  title(ctx, t('c5'), 8, 17, W - 16);
  const side = wide ? Math.min(H - 40, W * 0.48) : Math.min(W - 16, H - 190), cell = side / 100;
  const gx = 8, gy = 28;
  const order = []; ['TP', 'FN', 'FP', 'TN'].forEach(k => order.push([k, g[k]]));
  let idx = 0;
  for (const [k, n] of order) {
    ctx.fillStyle = GROUP_COL[k];
    for (let q = 0; q < n; q++, idx++) { const r = Math.floor(idx / 100), col = idx % 100; ctx.fillRect(gx + col * cell, gy + r * cell, cell + 0.3, cell + 0.3); }
  }
  // two stacked bars: what positives and negatives are made of
  const bx = wide ? gx + side + 24 : 8, bw = wide ? W - bx - 12 : W - 16;
  const by0 = wide ? gy + 30 : gy + side + 34, gap = wide ? 90 : 48;
  const bar = (Y, label, parts) => {
    title(ctx, label, bx, Y - 8, bw);
    const total = parts.reduce((a, [, v]) => a + v, 0) || 1; let x = bx;
    for (const [col, v] of parts) { const w = v / total * bw; ctx.fillStyle = col; ctx.fillRect(x, Y, w, 18); x += w; }
    ctx.strokeStyle = C.axis; ctx.strokeRect(bx, Y, bw, 18);
  };
  bar(by0, t('c5all'), [[C.pink, c.TP], [C.violet, c.FN], [C.orange, c.FP], [C.tn, c.TN]]);
  bar(by0 + gap, t('c5pos'), [[C.pink, c.TP], [C.orange, c.FP]]);
  bar(by0 + 2 * gap, t('c5neg'), [[C.tn, c.TN], [C.violet, c.FN]]);
  let txt = t('s5readout', { p: pct(p), se: pct(se), sp: pct(sp), tp: g.TP, fp: g.FP, fn: g.FN, tn: g.TN, pos: g.TP + g.FP, ppv: pct(c.PPV), npv: pct(c.NPV, 2) });
  if (s5.peakNote !== null) txt += ' ' + t('s5peakNote', { pk: pct(s5.peakNote) });
  $('o5').textContent = txt;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['r0', 'g0'].forEach(id => $(id).addEventListener('input', draw0));
  ['r1', 'd1'].forEach(id => $(id).addEventListener('input', draw1));
  $('clear1').addEventListener('click', () => { s1.tried = []; draw1(); });
  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => animate('s2', 6000, p => { $('t2').value = Math.round(p * 120); draw2(p < 1 ? p : null); }));
  ['cc3', 'st3', 'ln3'].forEach(id => $(id).addEventListener('input', draw3));
  Object.keys(PRESETS).forEach(id => $(id).addEventListener('click', () => preset(id)));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  ['v4', 'e4'].forEach(id => $(id).addEventListener('input', draw4));
  ['p5', 'se5', 'sp5'].forEach(id => $(id).addEventListener('input', () => { s5.peakNote = null; draw5(); }));
  $('usePeak5').addEventListener('click', () => {
    const pk = M.summary(M.sir({ R0: num('r1'), D: num('d1') })).peak;
    $('p5').value = Math.min(0.3, Math.round(pk * 1000) / 1000); s5.peakNote = pk; draw5();
  });
  $('reset5').addEventListener('click', () => { $('p5').value = 0.01; $('se5').value = 0.9; $('sp5').value = 0.95; s5.peakNote = null; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPH = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
