'use strict';
// Mean / median / mode lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, line and readout comes from window.MMM_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MMM_MODEL;
const t = (...a) => window.MMM_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', dot: '#9fb4cc' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
const listModes = (ms, unit = '') => (ms.length ? ms.map(v => fmt(v, 1) + unit).join(' ' + t('s3and') + ' ') : t('s3none'));

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
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function panel(ctx, W, o) {
  const P = { l: o.left || 36, r: W - (o.right || 16), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 1), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  let ticks = [];
  if (o.xList) ticks = o.xList;
  else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) ticks.push([v, fmt(v, 1)]);
  }
  ctx.textAlign = 'center';
  for (const [v, lab] of ticks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(lab, x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 13, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, color, ring = false, lw = 2) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function vline(ctx, X, y0, y1, color, { dash = null, lw = 2, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
// The three measure markers share one style across the page.
const meanLine = (ctx, m, v) => vline(ctx, m.x(v), m.P.t, m.P.b, C.orange, { lw: 2.6 });
const medianLine = (ctx, m, v) => vline(ctx, m.x(v), m.P.t, m.P.b, C.cyan, { lw: 2.4, dash: [7, 5] });
const modeMark = (ctx, m, v) => { vline(ctx, m.x(v), m.P.t, m.P.b, C.green, { lw: 1.6, dash: [2, 4] }); dot(ctx, m.x(v), m.P.t + 6, 5.5, C.green); };
// Dot plot: equal values stack; returns each value's drawn position (in input order).
function dotPlot(ctx, m, values, r, colorOf = () => C.dot) {
  const seen = new Map(), pos = [];
  values.forEach((v, i) => { const row = seen.get(v) || 0; seen.set(v, row + 1); const X = m.x(v), Y = m.P.b - r - 2 - row * (2 * r + 2); pos.push([X, Y]); dot(ctx, X, Y, r, colorOf(v, i)); });
  return pos;
}
const dotR = m => Math.max(4, Math.min(8, (m.x(1) - m.x(0)) * 0.9));

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

const D = M.COMMUTE, MEAN = M.mean(D), MEDIAN = M.median(D), MODE = M.modes(D)[0];

/* ---------- step 0 ---------- */
const s0 = { mean: false, median: 0, mode: false }; // median: number of sorted dots lit (0..6)
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 30, bottom: H - 28, left: 16, xMin: 0, xMax: 65, yMin: 0, yMax: 1, xTicks: true, title: t('c0') });
  const r = dotR(m);
  if (s0.mean) D.forEach((v, i) => { const Y = m.P.b - r - 2; ctx.save(); ctx.strokeStyle = v < MEAN ? C.orange : C.cyan; ctx.globalAlpha = 0.25; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.x(v), Y - 0.5); ctx.lineTo(m.x(MEAN), Y - 0.5); ctx.stroke(); ctx.restore(); });
  const pos = dotPlot(ctx, m, D, r);
  for (let k = 0; k < s0.median; k++) dot(ctx, pos[k][0], pos[k][1], r + 3, k === 5 ? C.cyan : C.muted, true, k === 5 ? 3 : 1.5);
  if (s0.mode) { const idx = D.map((v, i) => (v === MODE ? i : -1)).filter(i => i >= 0); idx.forEach(i => dot(ctx, pos[i][0], pos[i][1], r + 3, C.green, true, 2.5)); modeMark(ctx, m, MODE); }
  if (s0.median >= 6) medianLine(ctx, m, MEDIAN);
  if (s0.mean) meanLine(ctx, m, MEAN);
  const parts = [];
  if (s0.mean) parts.push(t('s0mean', { sum: M.sum(D), m: fmt(MEAN, 1) }));
  if (s0.median >= 6) parts.push(t('s0median', { md: fmt(MEDIAN) }));
  if (s0.mode) parts.push(t('s0mode', { c: D.filter(v => v === MODE).length, mo: MODE }));
  if (s0.mean && s0.median >= 6 && s0.mode) parts.push(t('s0below', { k: D.filter(v => v < MEAN).length }));
  $('r0').textContent = parts.length ? parts.join(' ') : t('s0none');
}

/* ---------- step 1: the seesaw ---------- */
function draw1() {
  const f = num('f1'), B = M.balance(D, f), S = M.split(D, f);
  $('f1v').textContent = fmt(f, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const L = 16, R = W - 16, x = v => L + v / 65 * (R - L), X0 = x(f), Y0 = 112;
  const half = Math.max(X0 - L, R - X0), thMax = Math.asin(Math.min(0.9, 38 / half));
  const th = thMax * Math.tanh(B.net / 40);
  title(ctx, t('c1a'), 8, 17, W - 16);
  const cs = Math.cos(th), sn = Math.sin(th), at = (u, w) => [X0 + u * cs + w * sn, Y0 + u * sn - w * cs];
  // beam
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...at(L - X0, 0)); ctx.lineTo(...at(R - X0, 0)); ctx.stroke(); ctx.restore();
  // pivot triangle
  ctx.save(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(X0, Y0 + 2); ctx.lineTo(X0 - 12, Y0 + 26); ctx.lineTo(X0 + 12, Y0 + 26); ctx.closePath(); ctx.fill(); ctx.restore();
  // balls stacked on the beam
  const r = Math.max(4, Math.min(7, (x(1) - x(0)) * 0.9)), seen = new Map();
  D.forEach(v => { const row = seen.get(v) || 0; seen.set(v, row + 1); const [bx, by] = at(x(v) - X0, r + 2 + row * (2 * r + 1)); dot(ctx, bx, by, r, v < f - 1e-9 ? C.orange : v > f + 1e-9 ? C.cyan : C.text); });
  // distance arms, one row per classmate
  const top = 194, bot = H - 30, rowH = (bot - top) / D.length;
  title(ctx, t('c1b'), 8, top - 12, W - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(L, bot); ctx.lineTo(R, bot); ctx.stroke(); ctx.restore();
  D.forEach((v, i) => {
    const Y = top + rowH * (i + 0.5), col = v < f ? C.orange : C.cyan;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.min(6, rowH * 0.45); ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(x(v), Y); ctx.stroke(); ctx.restore();
    dot(ctx, x(v), Y, Math.min(4, rowH * 0.3), C.text);
  });
  vline(ctx, X0, top - 4, bot, C.text, { lw: 1.5, dash: [3, 3] });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const step = niceStep(65, R - L, 30, [5, 10, 20]);
  for (let v = 0; v <= 65; v += step) { ctx.fillText(String(v), Math.min(R - 6, Math.max(L + 6, x(v))), bot + 15); }
  ctx.restore();
  const d = Math.abs(B.net);
  const state = d < 0.05 ? t('s1even', { m: fmt(MEAN, 1) }) : t(B.net < 0 ? 's1left' : 's1right', { d: fmt(d, 1) });
  $('r1').textContent = t('s1readout', { f: fmt(f, 1), nl: S.l, L: fmt(B.L, 1), nr: S.r, R: fmt(B.R, 1), state });
}

/* ---------- step 2: the middle line ---------- */
const s2 = { ten: false };
function draw2() {
  const data = s2.ten ? D.slice(0, 10) : D, n = data.length, c = num('cc2'), S = M.split(data, c), md = M.median(data), ranks = M.medianRanks(n);
  $('c2v').textContent = fmt(c, 1);
  $('tog2').textContent = t(s2.ten ? 'toggle11' : 'toggle10');
  const { ctx, W, H } = fitCanvas($('c2'));
  // top: queue of bars
  const q = panel(ctx, W, { top: 34, bottom: 170, left: 30, xMin: 0, xMax: 11, yMin: 0, yMax: 65, yTicks: [0, 20, 40, 60], xList: data.map((_, i) => [i + 0.5, String(i + 1)]), title: t('c2a') });
  const bw = (q.x(1) - q.x(0)) * 0.62;
  M.sorted(data).forEach((v, i) => {
    const mid = ranks.includes(i + 1), col = mid ? C.green : v < c - 1e-9 ? C.orange : v > c + 1e-9 ? C.cyan : C.text;
    ctx.fillStyle = col; ctx.globalAlpha = mid ? 1 : 0.75; ctx.fillRect(q.x(i + 0.5) - bw / 2, q.y(v), bw, q.P.b - q.y(v)); ctx.globalAlpha = 1;
  });
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(q.P.l, q.y(c)); ctx.lineTo(q.P.r, q.y(c)); ctx.stroke(); ctx.restore();
  // bottom: dots and the line
  const m = panel(ctx, W, { top: 222, bottom: H - 28, left: 16, xMin: 0, xMax: 65, yMin: 0, yMax: 1, xTicks: true, title: t('c2b') });
  const r = Math.min(dotR(m), 7);
  dotPlot(ctx, m, M.sorted(data), r, v => (v < c - 1e-9 ? C.orange : v > c + 1e-9 ? C.cyan : C.text));
  vline(ctx, m.x(c), m.P.t, m.P.b, C.text, { lw: 2.5 });
  dot(ctx, m.x(md), m.P.t + 6, 5, C.green);
  const s = M.sorted(data);
  const state = n % 2 ? t('s2odd', { n, k: ranks[0], md: fmt(md) }) : t('s2even', { n, k1: ranks[0], k2: ranks[1], a: s[ranks[0] - 1], b: s[ranks[1] - 1], md: fmt(md) });
  $('r2').textContent = t('s2readout', { n, c: fmt(c, 1), l: S.l, on: S.on, r: S.r, state });
}

/* ---------- step 3: tallies and the mode ---------- */
const s3 = { kind: 'shoes', counts: { shoes: M.SIZE_COUNTS.slice(), sports: M.SPORT_COUNTS.slice() }, pick: { shoes: 4, sports: 0 } };
const labels3 = () => (s3.kind === 'shoes' ? M.SIZES.map(String) : M.SPORTS.map(k => t('sport_' + k)));
function fillPick() {
  const sel = $('pick3'), labs = labels3();
  sel.innerHTML = '';
  labs.forEach((lab, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = lab; sel.appendChild(o); });
  sel.value = String(s3.pick[s3.kind]);
}
function draw3() {
  const counts = s3.counts[s3.kind], labs = labels3(), K = counts.length, total = counts.reduce((a, b) => a + b, 0);
  ['kindShoes', 'kindSports'].forEach(id => $(id).setAttribute('aria-pressed', (id === 'kindShoes') === (s3.kind === 'shoes') ? 'true' : 'false'));
  const top = Math.max(1, ...counts), ys = top <= 5 ? 1 : top <= 10 ? 2 : top <= 25 ? 5 : 10, yMax = Math.ceil((top + 0.5) / ys) * ys, yt = []; for (let v = 0; v <= yMax; v += ys) yt.push(v);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 34, bottom: H - 28, left: 30, xMin: -0.5, xMax: K - 0.5, yMin: 0, yMax, yTicks: yt, xList: labs.map((l, i) => [i, l]), title: t('c3') });
  const modeIdx = M.countsMode(counts), bw = (m.x(1) - m.x(0)) * 0.6, pick = s3.pick[s3.kind];
  counts.forEach((c, i) => {
    const X = m.x(i);
    if (c) { ctx.fillStyle = modeIdx.includes(i) ? C.green : C.raw; ctx.fillRect(X - bw / 2, m.y(c), bw, m.P.b - m.y(c)); }
    if (i === pick) { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(X - bw / 2 - 4, m.y(Math.max(c, 0)) - 4, bw + 8, m.P.b - m.y(Math.max(c, 0)) + 4); ctx.restore(); }
  });
  if (s3.kind === 'shoes' && total) {
    const data = M.expand(M.SIZES, counts), toX = v => v - M.SIZES[0];
    medianLine(ctx, m, toX(M.median(data))); meanLine(ctx, m, toX(M.mean(data)));
    $('r3').textContent = t('s3shoes', { n: total, mo: modeIdx.length ? listModes(modeIdx.map(i => M.SIZES[i]), t('s3unit') ? ' ' + t('s3unit') : '') : t('s3none'), m: fmt(M.mean(data), 1), md: fmt(M.median(data), 1) });
  } else if (s3.kind === 'shoes') $('r3').textContent = t('s3empty');
  else $('r3').textContent = total ? t('s3sports', { n: total, mo: modeIdx.length ? modeIdx.map(i => labs[i]).join(' ' + t('s3and') + ' ') : t('s3none') }) : t('s3empty');
  $('remove3').disabled = counts[pick] <= 0;
  $('add3').disabled = counts[pick] >= 30;
}

/* ---------- step 4: one classmate moves ---------- */
const who4 = () => (document.querySelector('input[name="who4"]:checked') || {}).value || 'far';
const RANGE4 = { far: [25, 120, 60], mid: [0, 60, 15] };
const sweepCache = {};
function draw4() {
  const w = who4(), [lo, hi] = RANGE4[w], idx = w === 'far' ? M.FAR : M.MID, v = num('v4');
  $('v4v').textContent = String(v);
  if (!sweepCache[w]) sweepCache[w] = M.sweep(D, idx, lo, hi, 0.5);
  const sw = sweepCache[w], b = M.withValue(D, idx, v);
  const { ctx, W, H } = fitCanvas($('c4'));
  const m = panel(ctx, W, { top: 34, bottom: H - 28, left: 30, xMin: lo, xMax: hi, yMin: 0, yMax: 30, yTicks: [0, 10, 20, 30], xTicks: true, xSteps: [5, 10, 20, 25], title: t('c4') });
  const line = (key, color, dash) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.6; if (dash) ctx.setLineDash(dash); ctx.beginPath(); sw.forEach((p, i) => (i ? ctx.lineTo(m.x(p.v), m.y(p[key])) : ctx.moveTo(m.x(p.v), m.y(p[key])))); ctx.stroke(); ctx.restore(); };
  sw.forEach((p, i) => { if (i % 4 === 0) p.modes.forEach(mo => dot(ctx, m.x(p.v), m.y(mo), 2.4, C.green)); });
  line('mean', C.orange); line('median', C.cyan, [7, 5]);
  vline(ctx, m.x(v), m.P.t, m.P.b, C.text, { lw: 1.4, dash: [3, 3], alpha: 0.7 });
  dot(ctx, m.x(v), m.y(M.mean(b)), 5.5, C.orange); dot(ctx, m.x(v), m.y(M.median(b)), 5.5, C.cyan); M.modes(b).forEach(mo => dot(ctx, m.x(v), m.y(mo), 5.5, C.green));
  $('r4').textContent = t('s4readout', { who: t(w === 'far' ? 's4far' : 's4mid'), v, m: fmt(M.mean(b), 1), md: fmt(M.median(b), 1), mo: listModes(M.modes(b)) });
}

/* ---------- step 5: scenarios ---------- */
const s5 = { sc: 1 };
const SHOES = M.expand(M.SIZES, M.SIZE_COUNTS);
function draw5() {
  document.querySelectorAll('[data-sc]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.sc) === s5.sc ? 'true' : 'false'));
  $('q5').textContent = t('q' + s5.sc);
  const { ctx, W, H } = fitCanvas($('c5'));
  let data, m;
  if (s5.sc === 2) {
    data = SHOES;
    const top = Math.max(...M.SIZE_COUNTS);
    m = panel(ctx, W, { top: 34, bottom: H - 28, left: 30, xMin: 33.5, xMax: 41.5, yMin: 0, yMax: 8, yTicks: [0, 4, 8], xList: M.SIZES.map(s => [s, String(s)]), title: t('c5') });
    const bw = (m.x(1) - m.x(0)) * 0.6;
    M.SIZE_COUNTS.forEach((c, i) => { ctx.fillStyle = c === top ? C.green : C.raw; ctx.fillRect(m.x(M.SIZES[i]) - bw / 2, m.y(c), bw, m.P.b - m.y(c)); });
  } else {
    data = s5.sc === 1 ? D : M.PAGES;
    const xMax = s5.sc === 1 ? 65 : 160;
    m = panel(ctx, W, { top: 34, bottom: H - 28, left: 16, xMin: 0, xMax, yMin: 0, yMax: 1, xTicks: true, xSteps: [5, 10, 20, 40], title: t('c5') });
    dotPlot(ctx, m, data, Math.min(7, Math.max(4, (m.x(s5.sc === 1 ? 1 : 2.5) - m.x(0)) * 0.9)));
  }
  const mo = M.modes(data);
  mo.forEach(v => modeMark(ctx, m, v)); medianLine(ctx, m, M.median(data)); meanLine(ctx, m, M.mean(data));
  $('d5').textContent = t('s5data' + s5.sc, { m: fmt(M.mean(data), 1), md: fmt(M.median(data), 1), mo: listModes(mo), total: M.sum(data) });
}
const ANSWER5 = { 1: 'median', 2: 'mode', 3: 'mean' };
function clear5() { document.querySelectorAll('input[name="q5"]').forEach(r => { r.checked = false; }); $('fb5').textContent = ''; delete $('fb5').dataset.state; }

/* ---------- step 6: your own numbers ---------- */
function calc6() {
  const res = M.parseList($('in6').value);
  if (!res.ok) { $('r6').textContent = t(res.reason === 'nan' ? 's6errNan' : 's6errCount'); return; }
  const a = res.nums, mn = M.mean(a), md = M.median(a), range = Math.max(...a) - Math.min(...a);
  const rel = range > 0 && mn - md > 0.1 * range ? 's6relUp' : range > 0 && md - mn > 0.1 * range ? 's6relDown' : 's6relEq';
  $('r6').textContent = t('s6result', { n: a.length, m: fmt(mn, 2), md: fmt(md, 2), mo: listModes(M.modes(a)), rel: t(rel) });
}

function refresh() { draw0(); draw1(); draw2(); fillPick(); draw3(); draw4(); draw5(); calc6(); if ($('fb5').dataset.state) $('fb5').textContent = t($('fb5').dataset.state); }

function setup() {
  $('showMean').addEventListener('click', () => { s0.mean = true; draw0(); });
  $('showMedian').addEventListener('click', () => { s0.median = 0; draw0(); animate('s0', 6 * 380, p => { s0.median = Math.min(6, 1 + Math.floor(p * 6)); draw0(); }); });
  $('showMode').addEventListener('click', () => { s0.mode = true; draw0(); });
  $('showNone').addEventListener('click', () => { stopAnim('s0'); s0.mean = false; s0.median = 0; s0.mode = false; draw0(); });

  $('f1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('find1').addEventListener('click', () => {
    const start = num('f1');
    animate('s1', 2200, p => { const e = 1 - Math.pow(1 - p, 3); $('f1').value = (start + (MEAN - start) * e).toFixed(1); draw1(); }, () => { $('f1').value = MEAN.toFixed(1); draw1(); });
  });

  $('cc2').addEventListener('input', draw2);
  $('tog2').addEventListener('click', () => { s2.ten = !s2.ten; draw2(); });

  $('kindShoes').addEventListener('click', () => { s3.kind = 'shoes'; fillPick(); draw3(); });
  $('kindSports').addEventListener('click', () => { s3.kind = 'sports'; fillPick(); draw3(); });
  $('pick3').addEventListener('change', () => { s3.pick[s3.kind] = Number($('pick3').value); draw3(); });
  $('add3').addEventListener('click', () => { const c = s3.counts[s3.kind], i = s3.pick[s3.kind]; if (c[i] < 30) c[i]++; draw3(); });
  $('remove3').addEventListener('click', () => { const c = s3.counts[s3.kind], i = s3.pick[s3.kind]; if (c[i] > 0) c[i]--; draw3(); });
  $('reset3').addEventListener('click', () => { s3.counts = { shoes: M.SIZE_COUNTS.slice(), sports: M.SPORT_COUNTS.slice() }; draw3(); });

  document.querySelectorAll('input[name="who4"]').forEach(r => r.addEventListener('change', () => {
    const [lo, hi, v0] = RANGE4[who4()], s = $('v4'); s.min = lo; s.max = hi; s.value = v0; draw4();
  }));
  $('v4').addEventListener('input', draw4);

  document.querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { s5.sc = Number(b.dataset.sc); clear5(); draw5(); }));
  $('check5').addEventListener('click', () => {
    const choice = document.querySelector('input[name="q5"]:checked'), ok = !!choice && choice.value === ANSWER5[s5.sc];
    const key = `fb${s5.sc}${ok ? 'Good' : 'Bad'}`;
    $('fb5').textContent = t(key); $('fb5').dataset.state = key; $('fb5').style.color = ok ? C.green : C.orange;
  });

  $('calc6').addEventListener('click', calc6);
  $('in6').addEventListener('keydown', e => { if (e.key === 'Enter') calc6(); });

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
  window.refreshMMM = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
