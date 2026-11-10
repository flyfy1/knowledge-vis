'use strict';
// Multi-armed bandit lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.BANDIT_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BANDIT_MODEL;
const t = (...a) => window.BANDIT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', lose: '#3a4a5e' };
const ARM = [C.pink, C.orange, C.cyan, C.violet];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); };
const pct = v => fmt(v * 100, 0) + '%';

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
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.yFmt || fmt)(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  let ticks = [];
  if (o.xList) ticks = o.xList;
  else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 36, o.xSteps || [1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) ticks.push([v, (o.xFmt || fmt)(v)]);
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
function curve(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function vline(ctx, X, y0, y1, color, { dash = null, lw = 1.4, alpha = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hTick(ctx, X0, X1, Y, color = C.green) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(X1, Y); ctx.stroke(); ctx.restore(); }
const ARMX = M.NAMES.map((n, i) => [i, n]);
const yTicks01 = [0, 0.5, 1];

/* ---------- animation runner ---------- */
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
function stopAnim(name) { if (anims[name]) { const a = anims[name]; cancelAnimationFrame(a.id); delete anims[name]; if (a.done) a.done(); } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: hand play ---------- */
const s0 = { g: 0, game: M.game(0), n: [0, 0, 0, 0], w: [0, 0, 0, 0], hist: [[], [], [], []], k: 0, revealed: false };
function draw0() {
  const G = s0.game, { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 30, bottom: 180, left: 36, xMin: -0.5, xMax: 3.5, yMin: 0, yMax: 1, yTicks: yTicks01, xList: ARMX, title: t('c0') });
  const bw = (m.x(1) - m.x(0)) * 0.46;
  for (let a = 0; a < 4; a++) {
    const X = m.x(a);
    if (s0.n[a]) { ctx.fillStyle = ARM[a]; ctx.globalAlpha = 0.85; const Y = m.y(s0.w[a] / s0.n[a]); ctx.fillRect(X - bw / 2, Y, bw, Math.max(1.5, m.P.b - Y)); ctx.globalAlpha = 1; }
    else { ctx.save(); ctx.strokeStyle = ARM[a]; ctx.setLineDash([3, 3]); ctx.strokeRect(X - bw / 2, m.P.b - 6, bw, 6); ctx.restore(); }
    if (s0.revealed) hTick(ctx, X - bw / 2 - 6, X + bw / 2 + 6, m.y(G.P[a]));
    // results as squares, five per row, oldest first
    const sq = Math.max(6, Math.min(14, bw / 5 - 3)), gap = sq + 3, x0 = X - (5 * gap - 3) / 2;
    s0.hist[a].forEach((r, i) => { ctx.fillStyle = r ? C.green : C.lose; ctx.fillRect(x0 + (i % 5) * gap, 206 + Math.floor(i / 5) * gap, sq, sq); });
  }
  const arms = M.NAMES.map((nm, a) => (s0.n[a] ? t('s0arm', { m: nm, w: s0.w[a], n: s0.n[a] }) : t('s0armNone', { m: nm }))).join(' · ');
  let txt = t('s0readout', { k: s0.k, B: M.BUDGET, w: s0.w.reduce((s, v) => s + v, 0), arms });
  if (s0.revealed) {
    const bp = M.best(G.P), bi = G.P.indexOf(bp), reg = s0.hist.reduce((s, h, a) => s + h.length * (bp - G.P[a]), 0);
    txt += ' ' + t('s0reveal', { truth: M.NAMES.map((nm, a) => nm + ' ' + fix(G.P[a], 2)).join(' · '), bm: M.NAMES[bi], bp: fix(bp, 2), reg: fix(reg, 2), k: s0.k, ideal: fmt(s0.k * bp, 2) });
  }
  $('r0').textContent = txt;
  for (let a = 0; a < 4; a++) { const b = $('pull' + a); b.textContent = t('pull', { m: M.NAMES[a] }); b.disabled = s0.k >= M.BUDGET; }
}
function pull0(a) {
  if (s0.k >= M.BUDGET) return;
  const r = s0.game.streams[a][s0.n[a]];
  s0.n[a]++; s0.w[a] += r; s0.hist[a].push(r); s0.k++;
  if (s0.k >= M.BUDGET) s0.revealed = true;
  draw0();
}

/* ---------- step 1: explore-then-commit ---------- */
const s1 = { tally: [0, 0, 0, 0], N: 0, chunk: 0 };
const etcCache = new Map();
const etc = m => { if (!etcCache.has(m)) etcCache.set(m, { c: M.etcCommit(M.ARMS, m), r: M.etcRegret(M.ARMS, m) }); return etcCache.get(m); };
function draw1() {
  const m = num('m1'), e = etc(m);
  $('m1v').textContent = String(m);
  {
    const { ctx, W, H } = fitCanvas($('c1'));
    const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 40, xMin: -0.5, xMax: 3.5, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: pct, xList: ARMX, title: t('c1a') });
    const bw = (p.x(1) - p.x(0)) * 0.5;
    e.c.forEach((v, a) => { ctx.fillStyle = ARM[a]; ctx.globalAlpha = 0.8; const Y = p.y(v); ctx.fillRect(p.x(a) - bw / 2, Y, bw, p.P.b - Y); ctx.globalAlpha = 1; });
    if (s1.N) s1.tally.forEach((c, a) => dot(ctx, p.x(a), p.y(c / s1.N), 5, C.text));
  }
  {
    const { ctx, W, H } = fitCanvas($('c1b'));
    const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 34, xMin: 0, xMax: 41, yMin: 0, yMax: 60, yTicks: [0, 20, 40, 60], xTicks: true, xSteps: [5, 10, 20], title: t('c1b') });
    const pts = []; for (let q = 1; q <= 40; q++) pts.push([p.x(q), p.y(etc(q).r)]);
    curve(ctx, pts, C.orange, 2);
    dot(ctx, p.x(20), p.y(etc(20).r), 5, C.green);
    vline(ctx, p.x(m), p.P.t, p.P.b, C.muted, { dash: [3, 3] });
    dot(ctx, p.x(m), p.y(e.r), 7, C.text, true);
  }
  $('r1').textContent = t('s1readout', {
    m, k: 4 * m, ex: fix(0.6 * m, 1), pc: pct(e.c[2]), reg: fix(e.r, 1),
    sim: s1.N ? t('s1sim', { N: s1.N, a: s1.tally[0], b: s1.tally[1], c: s1.tally[2], d: s1.tally[3] }) : t('s1nosim')
  });
}
function clear1() { stopAnim('s1'); s1.tally = [0, 0, 0, 0]; s1.N = 0; s1.chunk = 0; }

/* ---------- step 2: ε-greedy ---------- */
const epsCache = new Map();
const epsAt = e => { const k = Math.round(e * 100); if (!epsCache.has(k)) epsCache.set(k, M.epsCurve(k / 100)); return epsCache.get(k); };
let gridTimer = null;
function fillGrid() {
  if (gridTimer) return;
  const step = () => {
    let did = 0;
    for (const e of M.EPS_GRID) { if (!epsCache.has(Math.round(e * 100))) { epsAt(e); if (++did >= 2) break; } }
    draw2();
    gridTimer = did ? setTimeout(step, 30) : null;
  };
  gridTimer = setTimeout(step, 60);
}
function draw2() {
  const e = num('e2'), cur = epsAt(e), g0 = epsAt(0), g1 = epsAt(0.1), T = M.T_EPS;
  $('e2v').textContent = fix(e, 2);
  const yt = [0, 30, 60, 90];
  {
    const { ctx, W, H } = fitCanvas($('c2'));
    const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 34, xMin: 0, xMax: T, yMin: 0, yMax: 90, yTicks: yt, xTicks: true, xSteps: [250, 500], title: t('c2a') });
    const line = (c, color, lw, dash) => { const pts = []; for (let i = 0; i < T; i += 5) pts.push([p.x(i + 1), p.y(c.curve[i])]); pts.push([p.x(T), p.y(c.curve[T - 1])]); curve(ctx, pts, color, lw, dash); };
    line(g0, C.muted, 1.6, [5, 4]); line(g1, C.orange, 1.6, [5, 4]); line(cur, C.cyan, 2.6);
  }
  const done = M.EPS_GRID.filter(v => epsCache.has(Math.round(v * 100)));
  {
    const { ctx, W, H } = fitCanvas($('c2b'));
    const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 34, xMin: 0, xMax: 0.5, yMin: 0, yMax: 90, yTicks: yt, xTicks: true, xSteps: [0.1, 0.25], title: t('c2b') });
    const pts = done.map(v => [p.x(v), p.y(epsAt(v).final)]);
    if (pts.length > 1) curve(ctx, pts, C.raw, 1.6);
    pts.forEach(([X, Y]) => dot(ctx, X, Y, 2.2, C.raw));
    dot(ctx, p.x(0), p.y(g0.final), 5, C.muted); dot(ctx, p.x(0.1), p.y(g1.final), 5, C.orange);
    vline(ctx, p.x(e), p.P.t, p.P.b, C.cyan, { dash: [3, 3], alpha: 0.6 });
    dot(ctx, p.x(e), p.y(cur.final), 7, C.cyan, true);
  }
  $('r2').textContent = t('s2readout', {
    e: fix(e, 2), r: fix(cur.final, 1), late: pct(cur.bestShareLate), rg: fix(g0.final, 1), lg: pct(g0.bestShareLate), r1: fix(g1.final, 1), l1: pct(g1.bestShareLate),
    prog: done.length < M.EPS_GRID.length ? t('s2prog', { c: done.length, N: M.EPS_GRID.length }) : ''
  });
}

/* ---------- shared: pulls per arm over time (steps 3–4) ---------- */
function drawCounts(canvas, tr, tNow, ttl) {
  const { ctx, W, H } = fitCanvas(canvas);
  const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 34, xMin: 0, xMax: M.T_ONE, yMin: 0, yMax: 300, yTicks: [0, 100, 200, 300], xTicks: true, xSteps: [50, 100, 150], title: ttl });
  for (let a = 0; a < 4; a++) {
    const pts = [[p.x(0), p.y(0)]]; let c = 0;
    for (let i = 0; i < tNow - 1; i++) { if (tr.picks[i] === a) c++; pts.push([p.x(i + 1), p.y(c)]); }
    curve(ctx, pts, ARM[a], 2);
  }
  vline(ctx, p.x(tNow - 1), p.P.t, p.P.b, C.muted, { dash: [3, 3] });
}
function playToggle(id, slider, name, redraw) {
  const btn = $(id);
  if (anims[name]) { stopAnim(name); return; }
  let start = num(slider); if (start >= 301) start = 1;
  btn.textContent = t('pause');
  animate(name, (301 - start) * 22, q => { $(slider).value = Math.round(start + q * (301 - start)); redraw(); }, () => { btn.textContent = t('play'); });
}

/* ---------- step 3: UCB ---------- */
const ucbCache = new Map();
const ucbTr = c => { const k = Math.round(c * 10); if (!ucbCache.has(k)) ucbCache.set(k, M.ucbTrace(k / 10)); return ucbCache.get(k); };
function draw3() {
  const c = num('cc3'), tNow = num('t3'), tr = ucbTr(c), st = tr.states[tNow - 1];
  $('c3v').textContent = fix(c, 1); $('t3v').textContent = String(tNow);
  const YMAX = 1.6;
  const end = tNow > M.T_ONE;
  const idx = end ? null : M.ucbIndices(st, c);
  {
    const { ctx, W, H } = fitCanvas($('c3'));
    const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 34, xMin: -0.5, xMax: 3.5, yMin: 0, yMax: YMAX, yTicks: [0, 0.5, 1, 1.5], xList: ARMX, title: t('c3a') });
    const bw = (p.x(1) - p.x(0)) * 0.46;
    for (let a = 0; a < 4; a++) {
      const X = p.x(a), n = st.n[a], e = n ? st.s[a] / n : 0;
      if (n) { ctx.fillStyle = ARM[a]; ctx.globalAlpha = 0.85; ctx.fillRect(X - bw / 2, p.y(e), bw, p.P.b - p.y(e)); ctx.globalAlpha = 1; }
      if (idx) {
        const top = Math.min(YMAX, idx[a]), y0 = n ? p.y(e) : p.P.b;
        ctx.save(); ctx.strokeStyle = ARM[a]; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(X - bw / 2, p.y(top), bw, y0 - p.y(top)); ctx.restore();
        if (idx[a] > YMAX) { ctx.save(); ctx.fillStyle = ARM[a]; ctx.beginPath(); ctx.moveTo(X, p.P.t - 2); ctx.lineTo(X - 6, p.P.t + 7); ctx.lineTo(X + 6, p.P.t + 7); ctx.fill(); ctx.restore(); }
        if (a === st.pick) { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.strokeRect(X - bw / 2 - 5, p.y(top) - 4, bw + 10, p.P.b - p.y(top) + 4); ctx.restore(); }
      }
      hTick(ctx, X - bw / 2 - 3, X + bw / 2 + 3, p.y(M.ARMS[a]));
    }
  }
  drawCounts($('c3b'), tr, tNow, t('c3b'));
  const reg = tNow > 1 ? tr.regret[tNow - 2] : 0;
  if (end) $('r3').textContent = t('s3end', { t: M.T_ONE, counts: st.n.join('/'), reg: fix(reg, 1) });
  else {
    const arms = M.NAMES.map((nm, a) => (st.n[a] ? t('s3arm', { m: nm, n: st.n[a], e: fix(st.s[a] / st.n[a], 2), b: fix(M.ucbBonus(tNow, st.n[a], c), 2), i: fix(idx[a], 2) }) : t('s3armNew', { m: nm }))).join(t('sep'));
    $('r3').textContent = t('s3readout', { t: tNow, arms, next: M.NAMES[st.pick], reg: fix(reg, 1) });
  }
}

/* ---------- step 4: Thompson sampling ---------- */
let tsTrace = null;
const s4 = { draw: null, tally: [0, 0, 0, 0], N: 0, r: M.rng(9090), exact: null, exactT: -1 };
function draw4() {
  if (!tsTrace) tsTrace = M.tsTrace();
  const tNow = num('t4'), st = tsTrace.states[tNow - 1];
  $('t4v').textContent = String(tNow);
  const ab = st.n.map((n, i) => [1 + st.s[i], 1 + n - st.s[i]]);
  {
    const { ctx, W, H } = fitCanvas($('c4'));
    let peak = 1; ab.forEach(([a, b]) => { if (a + b > 2) { const mode = (a - 1) / (a + b - 2); peak = Math.max(peak, M.betaPdf(Math.min(0.999, Math.max(0.001, mode)), a, b)); } });
    const yMax = peak * 1.12 + 0.4;
    const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 14, right: 14, xMin: 0, xMax: 1, yMin: 0, yMax, xTicks: true, xSteps: [0.25, 0.5], title: t('c4a') });
    ab.forEach(([a, b], i) => { const pts = []; for (let k = 1; k < 400; k++) { const x = k / 400; pts.push([p.x(x), p.y(Math.min(yMax, M.betaPdf(x, a, b)))]); } curve(ctx, pts, ARM[i], 2); });
    M.ARMS.forEach(v => vline(ctx, p.x(v), p.P.b - 10, p.P.b, C.green, { lw: 3 }));
    if (s4.draw && s4.draw.t === tNow) {
      const mx = s4.draw.vals.indexOf(Math.max(...s4.draw.vals));
      s4.draw.vals.forEach((v, i) => { const Y = p.P.t + 6 + i * 9; dot(ctx, p.x(v), Y, 3.5, ARM[i]); if (i === mx) dot(ctx, p.x(v), Y, 7, C.text, true); });
    }
  }
  drawCounts($('c4b'), tsTrace, tNow, t('c4b'));
  const arms = M.NAMES.map((nm, i) => t('s4arm', { m: nm, a: ab[i][0], b: ab[i][1] })).join(' · ');
  let draw = s4.draw && s4.draw.t === tNow ? t('s4draw', { vals: s4.draw.vals.map((v, i) => M.NAMES[i] + ' ' + fix(v, 3)).join(', '), pick: M.NAMES[s4.draw.vals.indexOf(Math.max(...s4.draw.vals))] }) : t('s4nodraw');
  if (s4.N) {
    if (s4.exactT !== tNow) { s4.exact = M.probBest(ab); s4.exactT = tNow; }
    draw += t('s4tally', { N: s4.N, sim: s4.tally.map(c => fix(c / s4.N, 3)).join('/'), exact: s4.exact.map(v => fix(v, 3)).join('/') });
  }
  $('r4').textContent = t('s4readout', { t: tNow, arms, draw });
}
function abNow() { const st = tsTrace.states[num('t4') - 1]; return st.n.map((n, i) => [1 + st.s[i], 1 + n - st.s[i]]); }
function reset4() { s4.draw = null; s4.tally = [0, 0, 0, 0]; s4.N = 0; }

/* ---------- step 5: four strategies ---------- */
const cmpCache = new Map();
const s5 = { d: 0.1 };
const KEYS = ['greedy', 'eps', 'ucb', 'ts'], KCOL = { greedy: C.muted, eps: C.orange, ucb: C.violet, ts: C.cyan }, KNAME = { greedy: 'sGreedy', eps: 'sEps', ucb: 'sUcb', ts: 'sTs' };
function draw5() {
  if (!cmpCache.has(s5.d)) cmpCache.set(s5.d, M.compare(s5.d));
  const R = cmpCache.get(s5.d), tNow = num('t5'), T = M.T_CMP;
  $('t5v').textContent = String(tNow);
  document.querySelectorAll('[data-delta]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.delta) === s5.d ? 'true' : 'false'));
  const top = Math.max(...KEYS.map(k => R[k].final));
  const ys = [10, 20, 25, 50].find(s => top / s <= 6) || 50;
  const yMax = Math.ceil(top * 1.05 / ys) * ys, yt = []; for (let v = 0; v <= yMax + 1e-9; v += ys) yt.push(v);
  const { ctx, W, H } = fitCanvas($('c5'));
  const p = panel(ctx, W, { top: 36, bottom: H - 28, left: 40, xMin: 0, xMax: T, yMin: 0, yMax, yTicks: yt, xTicks: true, xSteps: [250, 500, 1000], title: t('c5') });
  KEYS.forEach(k => { const c = R[k].curve, pts = []; for (let i = 0; i < T; i += 10) pts.push([p.x(i + 1), p.y(c[i])]); pts.push([p.x(T), p.y(c[T - 1])]); curve(ctx, pts, KCOL[k], 2.2); });
  vline(ctx, p.x(tNow), p.P.t, p.P.b, C.text, { dash: [3, 3], alpha: 0.6 });
  KEYS.forEach(k => dot(ctx, p.x(tNow), p.y(R[k].curve[tNow - 1]), 4, KCOL[k]));
  const v = k => R[k].curve[tNow - 1], bestK = KEYS.reduce((a, b) => (v(b) < v(a) ? b : a));
  $('r5').textContent = t('s5readout', { d: fmt(s5.d, 2), t: tNow, g: fix(v('greedy'), 1), e: fix(v('eps'), 1), u: fix(v('ucb'), 1), s: fix(v('ts'), 1), best: t(KNAME[bestK]) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); if (!anims.s3) $('play3').textContent = t('play'); if (!anims.s4) $('play4').textContent = t('play'); }

function setup() {
  for (let a = 0; a < 4; a++) $('pull' + a).addEventListener('click', () => pull0(a));
  $('reveal0').addEventListener('click', () => { s0.revealed = true; draw0(); });
  $('newGame0').addEventListener('click', () => {
    s0.g = (s0.g + 1) % 50; s0.game = M.game(s0.g); s0.n = [0, 0, 0, 0]; s0.w = [0, 0, 0, 0]; s0.hist = [[], [], [], []]; s0.k = 0; s0.revealed = false; draw0();
  });

  $('m1').addEventListener('input', () => { clear1(); draw1(); });
  $('sim1').addEventListener('click', () => {
    const m = num('m1'), base = s1.chunk; stopAnim('s1');
    let done = 0;
    const addTo = k => { while (done < k) { const tl = M.etcSimulate(M.ARMS, m, 20, 77 + 13 * (base + done)); tl.forEach((c, a) => { s1.tally[a] += c; }); s1.N += 20; done++; } };
    s1.chunk += 10;
    animate('s1', 2000, q => { addTo(Math.round(q * 10)); draw1(); });
  });
  $('clear1').addEventListener('click', () => { clear1(); draw1(); });

  $('e2').addEventListener('input', draw2);

  $('cc3').addEventListener('input', draw3);
  $('t3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('play3').addEventListener('click', () => playToggle('play3', 't3', 's3', draw3));

  $('t4').addEventListener('input', () => { stopAnim('s4'); reset4(); draw4(); });
  $('play4').addEventListener('click', () => { reset4(); playToggle('play4', 't4', 's4', draw4); });
  $('draw4').addEventListener('click', () => {
    const vals = abNow().map(([a, b]) => s4.r.beta(a, b)); s4.draw = { t: num('t4'), vals };
    s4.tally[vals.indexOf(Math.max(...vals))]++; s4.N++; draw4();
  });
  $('draw4x').addEventListener('click', () => {
    const ab = abNow();
    for (let k = 0; k < 1000; k++) { const vals = ab.map(([a, b]) => s4.r.beta(a, b)); s4.tally[vals.indexOf(Math.max(...vals))]++; }
    s4.N += 1000; draw4();
  });

  document.querySelectorAll('[data-delta]').forEach(b => b.addEventListener('click', () => { s5.d = Number(b.dataset.delta); draw5(); }));
  $('t5').addEventListener('input', draw5);

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
  window.refreshBandit = refresh;
  refresh();
  fillGrid();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
