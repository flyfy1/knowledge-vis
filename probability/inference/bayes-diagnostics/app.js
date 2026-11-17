'use strict';
// Bayes diagnostics lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, bar, curve and readout comes from window.BAYES_MODEL (model.js). Canvas text is limited
// to one title row per panel, axis ticks and the step 4/5 bar labels; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BAYES_MODEL;
const t = (...a) => window.BAYES_I18N.t(...a);
const C = { cyan: '#67d7f9', cyanDim: '#4f6f86', orange: '#ffb454', pink: '#ff7a93', green: '#7ee2a8', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#6b7a8d' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (toFixed(0) of 90 stays "90").
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (p, d = 1) => fmt(p * 100, d) + '%';
const cnt = v => fmt(v, 1);

function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = Math.round(heightFor ? heightFor(width) : Number(canvas.dataset.h));
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// One-line label that shrinks its font until it fits maxW (never overflows the canvas).
function label(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

/* ---------- the 1,000-dot grid ---------- */
// Column-major fill so each group forms a contiguous block that reads left to right.
const TOP = 30;
function gridLayout(W) {
  const cols = W >= 560 ? 50 : 25, rows = M.N / cols, cell = (W - 16) / cols;
  return { cols, rows, cell, x0: 8, y0: TOP, H: TOP + rows * cell + 8 };
}
const gridHeight = W => gridLayout(W).H;
const STYLE = {
  TP: { color: C.pink, fill: true }, FN: { color: C.pink, fill: false },
  FP: { color: C.cyan, fill: true }, TN: { color: C.cyanDim, fill: false },
  ill: { color: C.pink, fill: true }, healthy: { color: C.cyan, fill: true }, unk: { color: C.grey, fill: true }
};
// groups: [{ kind, n, alpha }]; limit: draw only the first `limit` people in colour (reveal animation).
function drawGrid(ctx, L, groups, limit = M.N) {
  const r = Math.max(1.6, L.cell * 0.36);
  let i = 0;
  for (const g of groups) {
    for (let q = 0; q < g.n; q++, i++) {
      const col = Math.floor(i / L.rows), row = i % L.rows;
      const X = L.x0 + (col + 0.5) * L.cell, Y = L.y0 + (row + 0.5) * L.cell;
      const st = i < limit ? STYLE[g.kind] : STYLE.unk;
      ctx.globalAlpha = g.alpha == null ? 1 : g.alpha;
      ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
      if (st.fill) { ctx.fillStyle = st.color; ctx.fill(); }
      else { ctx.strokeStyle = st.color; ctx.lineWidth = Math.max(1, r * 0.45); ctx.beginPath(); ctx.arc(X, Y, r * 0.8, 0, 7); ctx.stroke(); }
    }
  }
  ctx.globalAlpha = 1;
}
// Outline people [a, b) of the column-major grid.
function outlineBlock(ctx, L, a, b, color = C.orange) {
  if (b <= a) return;
  const R = L.rows, X = c => L.x0 + c * L.cell, Y = r => L.y0 + r * L.cell;
  const ca = Math.floor(a / R), ra = a % R, cb = Math.floor((b - 1) / R), rb = (b - 1) % R;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.beginPath();
  if (ca === cb) ctx.rect(X(ca), Y(ra), L.cell, (rb - ra + 1) * L.cell);
  else {
    ctx.moveTo(X(ca), Y(ra)); ctx.lineTo(X(ca + 1), Y(ra)); ctx.lineTo(X(ca + 1), Y(0)); ctx.lineTo(X(cb + 1), Y(0));
    ctx.lineTo(X(cb + 1), Y(rb + 1)); ctx.lineTo(X(cb), Y(rb + 1)); ctx.lineTo(X(cb), Y(R)); ctx.lineTo(X(ca), Y(R)); ctx.closePath();
  }
  ctx.stroke(); ctx.restore();
}
const dotLegend = keys => keys.map(([cls, key]) => `<span class="lg"><span class="dot ${cls}"></span><span>${t(key)}</span></span>`).join('');
const LEG4 = [['dot-pink', 'lgTP'], ['dot-pinkring', 'lgFN'], ['dot-cyan', 'lgFP'], ['dot-cyanring', 'lgTN']];

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
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- shared state: the population built in steps 1–2 ---------- */
const S = { prev: M.DEFAULTS.prev, sens: M.DEFAULTS.sens, spec: M.DEFAULTS.spec };

/* ---------- step 0: guess, then reveal ---------- */
const s0 = { revealed: false, limit: 0 };
function draw0() {
  const g = num('g0'), D = M.DEFAULTS, c = M.counts(D.prev, D.sens, D.spec), R = M.roundedCells(D.prev, D.sens, D.spec);
  $('g0v').textContent = g + '%';
  const { ctx, W } = fitCanvas($('c0'), gridHeight), L = gridLayout(W);
  label(ctx, t(s0.revealed ? 'c0titleAfter' : 'c0titleBefore'), 8, 19, W - 16);
  drawGrid(ctx, L, [{ kind: 'TP', n: R.TP }, { kind: 'FN', n: R.FN }, { kind: 'FP', n: R.FP }, { kind: 'TN', n: R.TN }], s0.revealed ? s0.limit : 0);
  $('lg0').innerHTML = s0.revealed ? dotLegend(LEG4) : dotLegend([['dot-grey', 'lgUnk']]);
  if (!s0.revealed) { $('r0').textContent = t('s0readoutBefore', { g: g + '%' }); return; }
  const verdict = g / 100 > c.ppv + 0.1 ? t('verdictHigh') : g / 100 < c.ppv - 0.1 ? t('verdictLow') : t('verdictClose');
  $('r0').textContent = t('s0readout', { g: g + '%', ill: cnt(c.ill), tp: cnt(c.TP), healthy: cnt(c.healthy), fp: cnt(c.FP), pos: cnt(c.pos), ppv: pct(c.ppv), verdict });
}

/* ---------- step 1: the prior ---------- */
function draw1() {
  const c = M.counts(S.prev, S.sens, S.spec), R = M.roundedCells(S.prev, S.sens, S.spec);
  $('p1v').textContent = pct(S.prev);
  const { ctx, W } = fitCanvas($('c1'), gridHeight), L = gridLayout(W);
  label(ctx, t('c1title'), 8, 19, W - 16);
  drawGrid(ctx, L, [{ kind: 'ill', n: R.ill }, { kind: 'healthy', n: R.healthy }]);
  $('lg1').innerHTML = dotLegend([['dot-pink', 'lgIll'], ['dot-cyan', 'lgHealthy']]);
  $('r1').textContent = t('s1readout', { p: pct(S.prev), ill: cnt(c.ill), healthy: cnt(c.healthy), ratio: fmt(c.healthy / c.ill, 1) });
}

/* ---------- step 2: four groups ---------- */
function table(id, c, { rowHi = false, colHi = false } = {}) {
  const ch = colHi ? ' class="colhi"' : '';
  $(id).innerHTML =
    `<thead><tr><th>${t('thStatus')}</th><th${ch}>${t('thPos')}</th><th>${t('thNeg')}</th><th>${t('thTotal')}</th></tr></thead><tbody>` +
    `<tr${rowHi ? ' class="rowhi"' : ''}><th>${t('rowIll')}</th><td class="tp${colHi ? ' colhi' : ''}">${cnt(c.TP)}</td><td class="fn">${cnt(c.FN)}</td><td>${cnt(c.ill)}</td></tr>` +
    `<tr><th>${t('rowHealthy')}</th><td class="fp${colHi ? ' colhi' : ''}">${cnt(c.FP)}</td><td class="tn">${cnt(c.TN)}</td><td>${cnt(c.healthy)}</td></tr>` +
    `<tr><th>${t('rowTotal')}</th><td${ch}>${cnt(c.pos)}</td><td>${cnt(c.neg)}</td><td>${M.N}</td></tr></tbody>`;
}
function draw2() {
  const c = M.counts(S.prev, S.sens, S.spec), R = M.roundedCells(S.prev, S.sens, S.spec);
  $('se2v').textContent = pct(S.sens, 0); $('sp2v').textContent = pct(S.spec, 0);
  const { ctx, W } = fitCanvas($('c2'), gridHeight), L = gridLayout(W);
  label(ctx, t('c2title'), 8, 19, W - 16);
  drawGrid(ctx, L, [{ kind: 'TP', n: R.TP }, { kind: 'FN', n: R.FN }, { kind: 'FP', n: R.FP }, { kind: 'TN', n: R.TN }]);
  $('lg2').innerHTML = dotLegend(LEG4);
  table('tab2', c);
  $('r2').textContent = t('s2readout', { p: pct(S.prev), se: pct(S.sens, 0), sp: pct(S.spec, 0), ill: cnt(c.ill), tp: cnt(c.TP), fn: cnt(c.FN), healthy: cnt(c.healthy), fp: cnt(c.FP), tn: cnt(c.TN), fpr: pct(c.fpr, 0) });
}

/* ---------- step 3: the new denominator ---------- */
const prevKey = () => String(Math.round(S.prev * 1000) / 10);
const s3 = { view: 'pos', trail: new Set([prevKey()]) };
function plotAxes(ctx, W, H, o) {
  const P = { l: 42, r: W - 14, t: o.top, b: H - 28 };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt(v), P.l - 6, y(v) + 4); }
  ctx.textAlign = 'center';
  for (const v of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xFmt(v), x(v), P.b + 16); }
  ctx.restore();
  return { x, y, P };
}
function draw3() {
  const c = M.counts(S.prev, S.sens, S.spec), R = M.roundedCells(S.prev, S.sens, S.spec), pos = s3.view === 'pos';
  $('p3v').textContent = pct(S.prev);
  $('pos3').setAttribute('aria-pressed', pos); $('neg3').setAttribute('aria-pressed', !pos);
  let { ctx, W, H } = fitCanvas($('c3'), gridHeight); const L = gridLayout(W);
  label(ctx, t(pos ? 'c3titlePos' : 'c3titleNeg'), 8, 19, W - 16);
  const dimPos = pos ? 1 : 0.18, dimNeg = pos ? 0.18 : 1;
  drawGrid(ctx, L, [{ kind: 'TP', n: R.TP, alpha: dimPos }, { kind: 'FP', n: R.FP, alpha: dimPos }, { kind: 'FN', n: R.FN, alpha: dimNeg }, { kind: 'TN', n: R.TN, alpha: dimNeg }]);
  const nPos = R.TP + R.FP;
  if (pos) outlineBlock(ctx, L, 0, nPos); else outlineBlock(ctx, L, nPos, M.N);
  $('lg3').innerHTML = dotLegend(pos ? [['dot-pink', 'lgTP'], ['dot-cyan', 'lgFP']] : [['dot-pinkring', 'lgFN'], ['dot-cyanring', 'lgTN']]);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  label(ctx, t('c3btitle'), 8, 18, W - 16);
  const A = plotAxes(ctx, W, H, { top: 34, xMin: 0, xMax: 30, yMin: 0, yMax: 1, xTicks: [0, 5, 10, 15, 20, 25, 30], yTicks: [0, 0.25, 0.5, 0.75, 1], xFmt: v => v + '%', yFmt: v => Math.round(v * 100) + '%' });
  const curve = (fn, dash, width) => {
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash); ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const pv = 0.1 + i * (29.9 / 300); const Y = A.y(fn(pv / 100)); if (!i) ctx.moveTo(A.x(pv), Y); else ctx.lineTo(A.x(pv), Y); }
    ctx.stroke(); ctx.restore();
  };
  const fPos = p => M.ppvFormula(p, S.sens, S.spec), fNeg = p => 1 - M.npvFormula(p, S.sens, S.spec);
  curve(fPos, null, pos ? 2.6 : 1.4); curve(fNeg, [6, 5], pos ? 1.4 : 2.6);
  const fn = pos ? fPos : fNeg;
  ctx.save();
  for (const k of s3.trail) { const pv = Number(k); if (Math.abs(pv - S.prev * 100) < 1e-9) continue; ctx.fillStyle = C.text; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(A.x(pv), A.y(fn(pv / 100)), 3.2, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1; const X = A.x(S.prev * 100), Y = A.y(fn(S.prev));
  ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(X, A.P.t); ctx.lineTo(X, A.P.b); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = C.text; ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 6, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();

  if (pos) {
    const dom = c.FP > c.TP ? t('s3domFP', { healthy: cnt(c.healthy), ill: cnt(c.ill), fpr: pct(c.fpr, 0) }) : t('s3domTP');
    $('r3').textContent = t('s3readoutPos', { pos: cnt(c.pos), tp: cnt(c.TP), fp: cnt(c.FP), ppv: pct(c.ppv), p: pct(S.prev), times: fmt(c.ppv / S.prev, 1), dom });
  } else {
    $('r3').textContent = t('s3readoutNeg', { neg: cnt(c.neg), fn: cnt(c.FN), inp: pct(c.illGivenNeg, 2), p: pct(S.prev), npv: pct(c.npv, 2) });
  }
}

/* ---------- step 4: two directions ---------- */
function draw4() {
  const c = M.counts(S.prev, S.sens, S.spec);
  $('p4v').textContent = pct(S.prev);
  table('tab4', c, { rowHi: true, colHi: true });
  const { ctx, W } = fitCanvas($('c4'));
  const x0 = 12, x1 = W - 12, bw = x1 - x0;
  const bar = (yTop, parts, outline) => {
    let x = x0;
    for (const [frac, color, alpha] of parts) { ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(x, yTop, frac * bw, 34); x += frac * bw; }
    ctx.globalAlpha = 1; ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.strokeRect(x0, yTop, bw, 34);
  };
  label(ctx, t('c4rowA', { n: cnt(c.ill), v: pct(S.sens, 0) }), x0, 22, bw);
  bar(32, [[S.sens, C.pink, 0.95], [1 - S.sens, C.pink, 0.22]], C.pink);
  label(ctx, t('c4rowB', { n: cnt(c.pos), v: pct(c.ppv) }), x0, 96, bw);
  bar(106, [[c.ppv, C.pink, 0.95], [1 - c.ppv, C.cyan, 0.8]], C.orange);
  // shared 0–100% scale
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.strokeStyle = C.grid;
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    const X = x0 + v * bw; ctx.beginPath(); ctx.moveTo(X, 146); ctx.lineTo(X, 152); ctx.stroke();
    ctx.textAlign = v === 0 ? 'left' : v === 1 ? 'right' : 'center'; ctx.fillText(Math.round(v * 100) + '%', X, 168);
  });
  ctx.restore();
  $('r4').textContent = t('s4readout', { p: pct(S.prev), ill: cnt(c.ill), tp: cnt(c.TP), se: pct(S.sens, 0), pos: cnt(c.pos), ppv: pct(c.ppv) });
}
const QUIZ = { prev: 0.001, sens: 0.99, spec: 0.99 };

/* ---------- step 5: test again ---------- */
const K_MAX = 4;
const s5 = { k: 0, grow: 1 };
const oddsStr = o => (o >= 1 ? fmt(o, 2) + ' : 1' : '1 : ' + fmt(1 / o, 2));
function draw5() {
  const rounds = M.repeatRounds(S.prev, S.sens, S.spec, K_MAX), k = s5.k;
  $('again5').disabled = k >= K_MAX;
  const { ctx, W, H } = fitCanvas($('c5'));
  label(ctx, t('c5title'), 8, 18, W - 16);
  const P = { l: 42, r: W - 10, t: 54, b: H - 50 };
  const y = v => P.b - v * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [0, 0.5, 1].forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(Math.round(v * 100) + '%', P.l - 6, y(v) + 4); });
  ctx.restore();
  const slot = (P.r - P.l) / (K_MAX + 1), bw = Math.min(64, slot * 0.6);
  rounds.forEach(r => {
    const cx = P.l + slot * (r.k + 0.5);
    label(ctx, t('c5round', { k: r.k }), cx, P.b + 18, slot - 4, { size: 11, weight: 400, color: C.muted, align: 'center' });
    if (r.k <= k) label(ctx, t('c5count', { n: fmt(r.ill + r.healthy, r.ill + r.healthy >= 100 ? 0 : 1) }), cx, P.b + 35, slot - 4, { size: 11, weight: 400, color: C.text, align: 'center' });
    if (r.k > k) { ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([4, 4]); ctx.strokeRect(cx - bw / 2, P.t, bw, P.b - P.t); ctx.restore(); return; }
    const prevPost = r.k > 0 ? rounds[r.k - 1].post : r.post;
    const share = r.k === k ? prevPost + (r.post - prevPost) * s5.grow : r.post;
    ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.8; ctx.fillRect(cx - bw / 2, P.t, bw, y(share) - P.t);
    ctx.fillStyle = C.pink; ctx.globalAlpha = 0.95; ctx.fillRect(cx - bw / 2, y(share), bw, P.b - y(share)); ctx.globalAlpha = 1;
    label(ctx, pct(r.k === k ? share : r.post), cx, P.t - 8, slot - 2, { size: 12, weight: 700, color: C.text, align: 'center' });
  });
  const r0 = rounds[0], rk = rounds[k], lr = M.lrPos(S.sens, S.spec);
  if (k === 0) { $('r5').textContent = t('s5readout0', { p: pct(S.prev), ill: cnt(r0.ill), healthy: cnt(r0.healthy) }); return; }
  $('r5').textContent = t('s5readout', {
    k, kk: String(k).split('').map(q => '⁰¹²³⁴⁵⁶⁷⁸⁹'[q]).join(''), ill: fmt(rk.ill, 2), healthy: fmt(rk.healthy, 2), post: pct(rk.post), o0: oddsStr(M.odds(S.prev)), lr: fmt(lr, 2),
    ok: oddsStr(rk.ill / rk.healthy), se: pct(S.sens, 0), fpr: pct(1 - S.spec, 0), note: k >= K_MAX ? t('s5max') : ''
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }
function setPrev(v, from) {
  S.prev = v / 100; s3.trail.add(String(v));
  ['p1', 'p3', 'p4'].forEach(id => { if (id !== from) $(id).value = v; });
  draw1(); draw2(); draw3(); draw4(); draw5();
}

function setup() {
  $('g0').addEventListener('input', draw0);
  $('reveal0').addEventListener('click', () => { s0.revealed = true; animate('s0', 1400, p => { s0.limit = Math.round(p * M.N); draw0(); }); });
  $('hide0').addEventListener('click', () => { stopAnim('s0'); s0.revealed = false; s0.limit = 0; draw0(); });

  ['p1', 'p3', 'p4'].forEach(id => $(id).addEventListener('input', () => setPrev(num(id), id)));
  const setTest = () => { S.sens = num('se2') / 100; S.spec = num('sp2') / 100; s3.trail = new Set([prevKey()]); draw2(); draw3(); draw4(); draw5(); };
  $('se2').addEventListener('input', setTest); $('sp2').addEventListener('input', setTest);

  $('pos3').addEventListener('click', () => { s3.view = 'pos'; draw3(); });
  $('neg3').addEventListener('click', () => { s3.view = 'neg'; draw3(); });
  $('clear3').addEventListener('click', () => { s3.trail = new Set([prevKey()]); draw3(); });

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b', q = M.counts(QUIZ.prev, QUIZ.sens, QUIZ.spec);
    $('quizFeedback').textContent = ok ? t('correct', { tp: fmt(q.TP, 2), fp: fmt(q.FP, 2), pos: fmt(q.pos, 2), ppv: pct(q.ppv), times: Math.round(q.ppv / QUIZ.prev) }) : t('wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('again5').addEventListener('click', () => {
    if (s5.k >= K_MAX) return;
    s5.k++; s5.grow = 0; draw5();
    animate('s5', 900, p => { s5.grow = p; draw5(); });
  });
  $('reset5').addEventListener('click', () => { stopAnim('s5'); s5.k = 0; s5.grow = 1; draw5(); });

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
  window.refreshBayes = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
