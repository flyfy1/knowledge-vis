'use strict';
// LLM sampling lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.LLM_MODEL (model.js). Canvas text is limited to
// panel titles, row labels in their own column, values in their own column, and axis ticks.
(function () {
const $ = id => document.getElementById(id);
const M = window.LLM_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#3a4859', faint: '#5b6f86' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
// Percent with fixed decimals; tiny non-zero values show as <0.1%, values just under 1 as >99.9% (never a false 0% or 100%).
const pct = (v, d = 1) => { const s = (v * 100).toFixed(d), u = Math.pow(10, -d).toFixed(d); if (v > 0 && Number(s) === 0) return '<' + u + '%'; if (v < 1 && Number(s) === 100) return '>' + (100 - Math.pow(10, -d)).toFixed(d) + '%'; return s + '%'; };
const word = (prompt, i) => (i < M.NAMED ? t('w_' + M.PROMPTS[prompt].ids[i]) : t('tail'));

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
// Text that shrinks until it fits maxW (never overflows the canvas).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = '', color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, W, Y) => fitText(ctx, text, 8, Y, W - 16, { size: 12, weight: '600' });

// Horizontal bars: label column | bar area | value column. One row per item, nothing overlaps.
function hbars(ctx, W, o) {
  const rowH = o.rowH || 19, top = o.top + 16, n = o.rows.length;
  ctx.font = '12px system-ui,sans-serif';
  const labelW = Math.min(Math.max(...o.rows.map(r => ctx.measureText(r.label).width)) + 12, W * 0.36);
  const valueW = o.valueW || 50, x0 = labelW, x1 = W - valueW - 6;
  const x = v => x0 + (Math.max(o.min, Math.min(o.max, v)) - o.min) / (o.max - o.min) * (x1 - x0);
  title(ctx, o.title, W, o.top);
  // grid + ticks
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.ticks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), top - 2); ctx.lineTo(x(v), top + n * rowH + 2); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(o.tickFmt(v), x(v), top + n * rowH + 15);
  }
  ctx.restore();
  o.rows.forEach((r, i) => {
    const yc = top + i * rowH + rowH / 2, bh = rowH - 6;
    fitText(ctx, r.label, x0 - 8, yc + 4, x0 - 12, { size: 12, color: r.labelColor || C.text, align: 'right' });
    const parts = r.parts || [{ v: r.value, color: r.color }];
    let from = 0;
    for (const p of parts) {
      if (!p.v) continue;
      const a = x(Math.min(from, from + p.v)), b = x(Math.max(from, from + p.v));
      ctx.fillStyle = p.color; ctx.fillRect(a, yc - bh / 2, Math.max(1.5, b - a), bh);
      from += p.v;
    }
    if (r.ref !== undefined) { ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.strokeRect(x(0), yc - bh / 2 - 1, Math.max(1, x(r.ref) - x(0)), bh + 2); ctx.restore(); }
    if (r.tick !== undefined) { ctx.fillStyle = C.text; ctx.fillRect(x(r.tick) - 1.5, yc - bh / 2 - 3, 3, bh + 6); }
    fitText(ctx, r.valueText, W - 6, yc + 4, valueW, { size: 11.5, color: r.valueColor || C.muted, align: 'right' });
  });
  return { x, rowH, top };
}

// Line-chart frame with fixed tick rows. opts: top, bottom, left, xMin, xMax, yMin, yMax, xTicks, yTicks, xFmt, yFmt, logX, logY.
function frame(ctx, W, o) {
  const P = { l: o.left || 42, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const tx = v => (o.logX ? Math.log10(v) : v), ty = v => (o.logY ? Math.log10(v) : v);
  const x = v => P.l + (tx(v) - tx(o.xMin)) / (tx(o.xMax) - tx(o.xMin)) * (P.r - P.l);
  const y = v => P.b - (ty(Math.max(o.yMin, Math.min(o.yMax, v))) - ty(o.yMin)) / (ty(o.yMax) - ty(o.yMin)) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt(v), P.l - 6, y(v) + 4); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  const xt = typeof o.xTicks === 'function' ? o.xTicks(P.r - P.l) : o.xTicks;
  for (const v of xt) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(o.xFmt(v), x(v), P.b + 16); }
  ctx.restore();
  if (o.title) title(ctx, o.title, W, P.t - 10);
  return { x, y, P };
}
function curve(ctx, F, pts, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => { const X = F.x(a), Y = F.y(b); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 4.5) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
function vguide(ctx, X, y0, y1, color = C.muted) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
const pctTick = v => Math.round(v * 100) + '%';
const evenTicks = (lo, hi, step) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(6))); return out; };

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

/* ---------- step 0: softmax ---------- */
function draw0() {
  const zL = num('z0'), c = num('c0');
  $('z0v').textContent = fmt(zL, 1); $('c0v').textContent = (c > 0 ? '+' : '') + fmt(c, 1);
  const base = M.logits('capital').slice(); base[1] = zL;
  const z = base.map(v => v + c), p = M.softmax(z);
  let { ctx, W } = fitCanvas($('c0a'));
  hbars(ctx, W, { top: 16, title: t('c0a'), min: -6, max: 13, ticks: [-5, 0, 5, 10], tickFmt: v => String(v),
    rows: z.slice(0, M.NAMED).map((v, i) => ({ label: word('capital', i), value: v, color: i === 1 ? C.orange : C.cyan, valueText: fmt(v, 1) })) });
  ({ ctx, W } = fitCanvas($('c0b')));
  const lp = M.lump(p);
  hbars(ctx, W, { top: 16, title: t('c0b'), min: 0, max: 1, ticks: [0, 0.5, 1], tickFmt: pctTick,
    rows: lp.map((v, i) => ({ label: word('capital', i), value: v, color: i === M.NAMED ? C.pink : i === 1 ? C.orange : C.cyan, valueText: pct(v), labelColor: i === M.NAMED ? C.pink : C.text })) });
  const d = z[0] - z[1];
  $('r0').textContent = t('s0readout', { pp: pct(p[0]), pl: pct(p[1]), d: fmt(d, 1), ratio: fmt(Math.exp(d), 2), sum: fmt(M.sum(p), 6) });
}

/* ---------- step 1: temperature ---------- */
const s1 = { prompt: 'capital' };
const curveCache = {};
function shareCurve(prompt) {
  if (!curveCache[prompt]) curveCache[prompt] = evenTicks(0.1, 3, 0.025).map(T => { const q = M.softmax(M.logits(prompt), T); return { T, top: Math.max(...q), tail: M.tailShare(q) }; });
  return curveCache[prompt];
}
function draw1() {
  const T = num('t1'), z = M.logits(s1.prompt), q = M.softmax(z, T), q1 = M.softmax(z, 1);
  $('t1v').textContent = fmt(T, 2);
  $('p1cap').setAttribute('aria-pressed', String(s1.prompt === 'capital')); $('p1wk').setAttribute('aria-pressed', String(s1.prompt === 'weekend'));
  let { ctx, W, H } = fitCanvas($('c1a'));
  const lq = M.lump(q), lq1 = M.lump(q1);
  hbars(ctx, W, { top: 16, title: t('c1a'), min: 0, max: 1, ticks: [0, 0.5, 1], tickFmt: pctTick,
    rows: lq.map((v, i) => ({ label: word(s1.prompt, i), value: v, ref: lq1[i], color: i === M.NAMED ? C.pink : C.cyan, valueText: pct(v), labelColor: i === M.NAMED ? C.pink : C.text })) });
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, xMin: 0.1, xMax: 3, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: pctTick,
    xTicks: [0.5, 1, 1.5, 2, 2.5, 3], xFmt: v => 'T=' + fmt(v, 1), title: t('c1b') });
  const cv = shareCurve(s1.prompt);
  curve(ctx, F, cv.map(r => [r.T, r.top]), C.cyan, { lw: 2.4 });
  curve(ctx, F, cv.map(r => [r.T, r.tail]), C.pink, { lw: 2.4 });
  vguide(ctx, F.x(T), F.P.t, F.P.b);
  dot(ctx, F.x(T), F.y(Math.max(...q)), C.cyan); dot(ctx, F.x(T), F.y(M.tailShare(q)), C.pink);
  const ord = q.map((v, i) => i).sort((a, b) => q[b] - q[a]);
  $('r1').textContent = t('s1readout', { prompt: t(s1.prompt === 'capital' ? 'promptCapital' : 'promptWeekend').replace(/[…\.]+$/, ''), T: fmt(T, 2), w1: word(s1.prompt, ord[0]), p1: pct(q[ord[0]]), w2: word(s1.prompt, ord[1]), p2: pct(q[ord[1]]), ratio: fmtRatio(q[ord[0]] / q[ord[1]]), tail: pct(M.tailShare(q)) });
}
function fmtRatio(r) { return r >= 1e5 ? r.toExponential(1).replace('e+', '×10^') : r >= 100 ? r.toFixed(0) : fmt(r, 2); }

/* ---------- step 2: the long tail compounds ---------- */
const s2 = { seed: 7, hist: new Set(['1.00']) };
const MAXL = 100;
function tailQ(T) { return M.tailShare(M.softmax(M.logits('weekend'), T)); }
function halfL(q) { if (q <= 0) return Infinity; return Math.ceil(Math.log(0.5) / Math.log(1 - q)); }
function draw2() {
  const T = num('t2'), L = num('l2'), dist = M.softmax(M.logits('weekend'), T), q = M.tailShare(dist);
  $('t2v').textContent = fmt(T, 2); $('l2v').textContent = String(L);
  const u = M.rng(s2.seed), picks = []; for (let i = 0; i < MAXL; i++) picks.push(M.draw(dist, u()) >= M.NAMED);
  const { ctx, W, H } = fitCanvas($('c2'));
  // strip: fixed cell size, wraps; its block height is reserved for MAXL cells so the chart never jumps
  const sq = 11, gap = 3, cols = Math.max(10, Math.floor((W - 16 + gap) / (sq + gap))), rowsMax = Math.ceil(MAXL / cols);
  title(ctx, t('c2a', { L }), W, 18);
  for (let i = 0; i < L; i++) {
    const cx = 8 + (i % cols) * (sq + gap), cy = 28 + Math.floor(i / cols) * (sq + gap);
    ctx.fillStyle = picks[i] ? C.pink : C.grey; ctx.fillRect(cx, cy, sq, sq);
  }
  const top = 28 + rowsMax * (sq + gap) + 34;
  const F = frame(ctx, W, { top, bottom: H - 28, xMin: 1, xMax: MAXL, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: pctTick,
    xTicks: w => (w < 300 ? [1, 25, 50, 75, 100] : [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]), xFmt: v => String(v), title: t('c2b') });
  const pts = qq => { const a = []; for (let l = 1; l <= MAXL; l++) a.push([l, M.atLeastOne(qq, l)]); return a; };
  [...s2.hist].forEach(k => { if (Math.abs(Number(k) - T) > 1e-9) curve(ctx, F, pts(tailQ(Number(k))), C.faint, { lw: 1.4 }); });
  ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(F.P.l, F.y(0.5)); ctx.lineTo(F.P.r, F.y(0.5)); ctx.stroke(); ctx.restore();
  curve(ctx, F, pts(q), C.cyan, { lw: 2.6 });
  vguide(ctx, F.x(L), F.P.t, F.P.b); dot(ctx, F.x(L), F.y(M.atLeastOne(q, L)), C.text, 5);
  const half = halfL(q), maxw = Math.max(...dist.slice(M.NAMED));
  $('r2').textContent = t('s2readout', { T: fmt(T, 2), q: pct(q), maxw: pct(maxw), L, pL: pct(M.atLeastOne(q, L)), half: half > 1000 ? t('halfNever') : t('halfAt', { half }), hits: picks.slice(0, L).filter(Boolean).length });
}

/* ---------- step 3: top-k vs top-p ---------- */
const s3 = { method: 'k' };
function truncRule() { return s3.method === 'k' ? { k: num('k3') } : { p: num('p3') }; }
function draw3() {
  const k = num('k3'), p = num('p3'), rule = truncRule();
  $('k3v').textContent = String(k); $('p3v').textContent = fmt(p, 2);
  $('m3k').setAttribute('aria-pressed', String(s3.method === 'k')); $('m3p').setAttribute('aria-pressed', String(s3.method === 'p'));
  $('k3').disabled = s3.method !== 'k'; $('p3').disabled = s3.method !== 'p';
  const res = {};
  [['capital', 'c3a', 1, [0, 0.5, 1]], ['weekend', 'c3b', 0.2, [0, 0.1, 0.2]]].forEach(([prompt, id, max, ticks]) => {
    const s = M.shape(M.logits(prompt), rule); res[prompt] = s;
    const { ctx, W } = fitCanvas($(id));
    const rows = [];
    for (let i = 0; i < M.NAMED; i++) { const kept = s.kept.has(i); rows.push({ label: word(prompt, i), value: s.q[i], color: kept ? C.cyan : C.grey, valueText: pct(s.q[i]), labelColor: kept ? C.text : C.muted }); }
    let tk = 0; for (let i = M.NAMED; i < s.q.length; i++) if (s.kept.has(i)) tk += s.q[i];
    const tailAll = M.tailShare(s.q);
    rows.push({ label: t('tail'), parts: [{ v: tk, color: C.cyan }, { v: tailAll - tk, color: C.grey }], valueText: pct(tailAll), labelColor: C.pink });
    hbars(ctx, W, { top: 16, title: t(id, { n: s.count }), min: 0, max, ticks, tickFmt: pctTick, rows });
  });
  const A = res.capital, B = res.weekend;
  $('r3').textContent = t('s3readout', { rule: s3.method === 'k' ? t('ruleK', { k }) : t('ruleP', { p: fmt(p, 2) }), nA: A.count, mA: pct(A.mass), wrongA: pct(1 - A.out[0]), nB: B.count, mB: pct(B.mass) });
}

/* ---------- step 4: sampling, frequencies approach probabilities ---------- */
const P4 = M.lump(M.softmax(M.logits('weekend'), 1)), DIST4 = M.softmax(M.logits('weekend'), 1);
const s4 = { u: M.rng(2024), counts: new Array(M.NAMED + 1).fill(0), N: 0, trace: [], running: false };
const expTv = N => 0.5 * P4.reduce((s, p) => s + Math.sqrt(2 * p * (1 - p) / (Math.PI * N)), 0);
const MAXN = 10000;
function drawN(n) {
  n = Math.min(n, MAXN - s4.N); if (n <= 0) return;
  for (let i = 0; i < n; i++) { const w = M.draw(DIST4, s4.u()); s4.counts[Math.min(w, M.NAMED)]++; }
  s4.N += n; s4.trace.push([s4.N, M.tv(s4.counts.map(c => c / s4.N), P4)]);
}
function reset4() { stopAnim('s4'); s4.running = false; s4.u = M.rng(2024); s4.counts.fill(0); s4.N = 0; s4.trace = []; draw4(); }
function draw4() {
  const freq = s4.N ? s4.counts.map(c => c / s4.N) : s4.counts.map(() => 0);
  let { ctx, W, H } = fitCanvas($('c4a'));
  const maxF = Math.max(...freq), max = maxF > 0.5 ? 1 : maxF > 0.2 ? 0.5 : 0.2;
  hbars(ctx, W, { top: 16, title: t('c4a'), min: 0, max, ticks: max === 1 ? [0, 0.5, 1] : max === 0.5 ? [0, 0.25, 0.5] : [0, 0.1, 0.2], tickFmt: pctTick,
    rows: freq.map((f, i) => ({ label: word('weekend', i), value: f, tick: P4[i], color: i === M.NAMED ? C.pink : C.cyan, valueText: s4.N ? pct(f) : '—', labelColor: i === M.NAMED ? C.pink : C.text })) });
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 46, xMin: 1, xMax: 10000, logX: true, yMin: 0.003, yMax: 1, logY: true, yTicks: [0.01, 0.1, 1], yFmt: v => fmt(v, 2),
    xTicks: [1, 10, 100, 1000, 10000], xFmt: v => (v >= 1000 ? (v / 1000) + 'k' : String(v)), title: t('c4b') });
  const th = []; for (let e = 0; e <= 4.0001; e += 0.05) th.push([Math.pow(10, e), expTv(Math.pow(10, e))]);
  curve(ctx, F, th, C.muted, { lw: 1.4, dash: [5, 4] });
  if (s4.trace.length) { curve(ctx, F, s4.trace, C.orange, { lw: 2 }); const last = s4.trace[s4.trace.length - 1]; dot(ctx, F.x(last[0]), F.y(last[1]), C.orange); }
  ['d1', 'd10', 'd100', 'dAuto'].forEach(id => { $(id).disabled = s4.N >= MAXN; });
  if (!s4.N) { $('r4').textContent = t('s4empty'); return; }
  let best = 0; s4.counts.forEach((c, i) => { if (c > s4.counts[best]) best = i; });
  $('r4').textContent = t('s4readout', { N: s4.N, prog: s4.running ? t('s4prog') : '', tv: fmt(M.tv(freq, P4), 3), exp: fmt(expTv(s4.N), 3), w: word('weekend', best), c: s4.counts[best], f: pct(freq[best]), p: pct(P4[best]) });
}
function auto4() {
  stopAnim('s4');
  const start = s4.N; if (start >= 10000) return;
  s4.running = true;
  const l0 = Math.log10(Math.max(1, start));
  animate('s4', 6000, p => {
    const target = Math.min(10000, Math.max(start + 1, Math.round(Math.pow(10, l0 + p * (4 - l0)))));
    if (target > s4.N) drawN(target - s4.N);
    if (p >= 1) s4.running = false;
    draw4();
  }, () => { s4.running = false; draw4(); });
}

/* ---------- step 5: writing word by word ---------- */
const s5 = { seed: 3, shown: M.SENT_LEN, gen: null };
const sweepCache = {};
function sweepFor(p) { const key = p.toFixed(2); if (!sweepCache[key]) sweepCache[key] = M.sweep(p, 200); return sweepCache[key]; }
function gen5() { s5.gen = M.generate({ T: num('t5'), p: num('p5'), seed: s5.seed }); }
function avgAt(sw, T) { let best = sw[0]; for (const r of sw) if (Math.abs(r.T - T) < Math.abs(best.T - T)) best = r; return best; }
function draw5() {
  const T = num('t5'), p = num('p5'), g = s5.gen;
  $('t5v').textContent = fmt(T, 1); $('p5v').textContent = fmt(p, 2);
  const box = $('chips5'); box.innerHTML = '';
  for (let i = 0; i < s5.shown; i++) {
    const tok = M.TOKENS[g.toks[i]], el = document.createElement('span');
    el.className = 'chip' + (g.odd[i] ? ' odd' : '') + (tok === 'stop' ? ' stopw' : '');
    el.innerHTML = `<span></span><small></small>`; el.firstChild.textContent = t('tk_' + tok); el.lastChild.textContent = pct(g.probs[i], 0);
    box.appendChild(el);
  }
  const { ctx, W, H } = fitCanvas($('c5'));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, xMin: 0.1, xMax: 3, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: pctTick,
    xTicks: [0.5, 1, 1.5, 2, 2.5, 3], xFmt: v => 'T=' + fmt(v, 1), title: t('c5') });
  const sw = sweepFor(p);
  if (p < 1) { const ref = sweepFor(1); curve(ctx, F, ref.map(r => [r.T, r.repeat]), C.cyan, { lw: 1.4, dash: [5, 4], alpha: 0.6 }); curve(ctx, F, ref.map(r => [r.T, r.odd]), C.pink, { lw: 1.4, dash: [5, 4], alpha: 0.6 }); }
  curve(ctx, F, sw.map(r => [r.T, r.repeat]), C.cyan, { lw: 2.4 }); curve(ctx, F, sw.map(r => [r.T, r.odd]), C.pink, { lw: 2.4 });
  vguide(ctx, F.x(T), F.P.t, F.P.b);
  const done = s5.shown >= M.SENT_LEN;
  if (done) { dot(ctx, F.x(T), F.y(g.stats.repeat), C.text, 5); dot(ctx, F.x(T), F.y(g.stats.oddShare), C.text, 5); }
  const m = avgAt(sw, T);
  $('r5').textContent = done
    ? t('s5readout', { T: fmt(T, 1), p: fmt(p, 2), seed: s5.seed, rep: pct(g.stats.repeat, 0), odd: g.stats.odd, oddShare: pct(g.stats.oddShare, 0), distinct: g.stats.distinct, mRep: pct(m.repeat, 0), mOdd: pct(m.odd, 0) })
    : t('s5writing', { k: s5.shown, n: M.SENT_LEN });
}
function write5() {
  gen5(); s5.shown = 0; draw5();
  animate('s5', M.SENT_LEN * 140, pr => { const k = pr >= 1 ? M.SENT_LEN : Math.min(M.SENT_LEN, Math.floor(pr * M.SENT_LEN) + 1); if (k !== s5.shown) { s5.shown = k; draw5(); } }, () => { s5.shown = M.SENT_LEN; draw5(); });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['z0', 'c0'].forEach(id => $(id).addEventListener('input', draw0));
  $('t1').addEventListener('input', draw1);
  $('p1cap').addEventListener('click', () => { s1.prompt = 'capital'; draw1(); });
  $('p1wk').addEventListener('click', () => { s1.prompt = 'weekend'; draw1(); });
  $('t2').addEventListener('input', draw2);
  $('t2').addEventListener('change', () => { s2.hist.add(num('t2').toFixed(2)); draw2(); });
  $('l2').addEventListener('input', draw2);
  $('reroll2').addEventListener('click', () => { s2.seed += 1; draw2(); });
  $('clear2').addEventListener('click', () => { s2.hist = new Set([num('t2').toFixed(2)]); draw2(); });
  ['k3', 'p3'].forEach(id => $(id).addEventListener('input', draw3));
  $('m3k').addEventListener('click', () => { s3.method = 'k'; draw3(); });
  $('m3p').addEventListener('click', () => { s3.method = 'p'; draw3(); });
  [['d1', 1], ['d10', 10], ['d100', 100]].forEach(([id, n]) => $(id).addEventListener('click', () => { stopAnim('s4'); s4.running = false; drawN(n); draw4(); }));
  $('dAuto').addEventListener('click', auto4);
  $('reset4').addEventListener('click', reset4);
  ['t5', 'p5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); gen5(); s5.shown = M.SENT_LEN; draw5(); }));
  $('write5').addEventListener('click', write5);
  $('seed5').addEventListener('click', () => { s5.seed += 1; write5(); });
  gen5();

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
