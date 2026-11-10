'use strict';
// Ethical-decisions lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, line, region and readout comes from window.ETHICS_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and laid-out group labels; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ETHICS_MODEL;
const t = (...a) => window.ETHICS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', blue: '#4f8fd6', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const PCOL = { none: '#9aaabd', A: C.cyan, B: C.green, C: C.orange };
const PLETTER = { none: '0', A: 'A', B: 'B', C: 'C' };
// map colours: each plan colour blended 55 % over the panel background
const blend = (hex, k) => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)), b = [13, 22, 33]; return `rgb(${c.map((v, i) => Math.round(v * k + b[i] * (1 - k))).join(',')})`; };
const MAPCOL = {}; Object.keys(PCOL).forEach(id => { MAPCOL[id] = blend(PCOL[id], 0.55); });
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (v, d = 1) => fmt(v * 100, d) + '%';
const planName = id => t({ none: 'planNone', A: 'planA', B: 'planB', C: 'planC' }[id]);
const shortName = id => t({ none: 'pnNone', A: 'pnA', B: 'pnB', C: 'pnC' }[id]);
const grpName = key => t(`grp${key}`);

// One shared set of assumptions; every slider that names the same quantity writes here.
const S = Object.assign({}, M.DEFAULTS, { plan0: 'A' });
const A = () => ({ p: S.p, lam: S.lam, eA: S.eA, mR: S.mR, hm: S.hm, q: S.q, rule: S.rule });

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

// Panel title: shrinks the font until it fits the width (never overflows the canvas).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function niceMax(v, steps = [1, 2, 5, 10, 20, 25, 50, 100]) { const st = steps.find(s => v / s <= 6) || steps[steps.length - 1]; return { max: Math.ceil(v / st - 1e-9) * st, step: st }; }

// A plot panel. Title sits in its own row above the plot; tick labels sit left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 36, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
const yTicksFor = (max, step) => { const out = []; for (let v = 0; v <= max + 1e-9; v += step) out.push(v); return out; };
function dot(ctx, X, Y, r, fill, stroke) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } }
function vguide(ctx, X, y0, y1, color = C.text) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hatch(ctx, x, y, w, h, color) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = color; ctx.lineWidth = 1.6;
  for (let s = -h; s < w + h; s += 6) { ctx.beginPath(); ctx.moveTo(x + s, y + h); ctx.lineTo(x + s + h, y); ctx.stroke(); }
  ctx.restore(); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.restore();
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame }; else delete anims[name]; };
  anims[name] = { id: requestAnimationFrame(tick), frame };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); }); }

/* ---------- Mekko bars: width = homes, height = burden per home, stacked by source ---------- */
// rows: model rows (key, n, flood, tax, hard, forcedN?). ref: the do-nothing rows (outlined). k: 0..1 tween.
function mekko(ctx, W, top, bottom, rows, ref, yMax, step) {
  const m = panel(ctx, W, { top, bottom, xMin: 0, xMax: M.N, yMin: 0, yMax, yTicks: yTicksFor(yMax, step), xTicks: false });
  const gap = 2, X = v => m.x(v);
  // reference outline per neighbourhood (riverside spans all of its sub-groups)
  let acc = 0;
  ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.3;
  ref.forEach(r => { const x0 = X(acc) + gap / 2, x1 = X(acc + r.n) - gap / 2; ctx.strokeRect(x0, m.y(r.b), x1 - x0, m.y(0) - m.y(r.b)); acc += r.n; });
  ctx.restore();
  acc = 0;
  const labels = [];
  rows.forEach(r => {
    if (r.n <= 0) return;
    const x0 = X(acc) + gap / 2, x1 = X(acc + r.n) - gap / 2, w = Math.max(1, x1 - x0);
    let base = 0;
    [['flood', C.blue], ['tax', C.orange], ['hard', C.violet]].forEach(([k, col]) => {
      const v = r[k]; if (v <= 0) return;
      const yT = m.y(base + v), yB = m.y(base);
      ctx.fillStyle = col; ctx.fillRect(x0, yT, w, yB - yT); base += v;
    });
    if (r.forcedN > 0) { const fw = w * r.forcedN / r.n; hatch(ctx, x1 - fw, m.y(base), fw, m.y(0) - m.y(base), C.pink); }
    labels.push({ cx: (x0 + x1) / 2, text: `${grpName(r.key)} ${t('hh', { n: fmt(r.n, 0) })}` });
    acc += r.n;
  });
  placeLabels(ctx, labels, m.P.b, W);
  return m;
}
// Labels under bars: centred on their bar, pushed down a row (with a leader line) when they would collide.
function placeLabels(ctx, labels, yAxis, W) {
  ctx.save(); ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left';
  const rowsUsed = [[], [], []];
  labels.forEach(L => {
    const w = ctx.measureText(L.text).width;
    let x0 = Math.max(4, Math.min(W - 4 - w, L.cx - w / 2));
    let row = 0;
    while (row < 2 && rowsUsed[row].some(([a, b]) => x0 < b + 8 && x0 + w > a - 8)) row++;
    rowsUsed[row].push([x0, x0 + w]);
    const Y = yAxis + 16 + row * 16;
    if (row > 0) { ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L.cx, yAxis + 2); ctx.lineTo(L.cx, Y - 11); ctx.stroke(); }
    ctx.fillStyle = C.muted; ctx.fillText(L.text, x0, Y);
  });
  ctx.restore();
}
function lerpRows(from, to, k) {
  // Rows can differ in structure between plans (riverside splits under C); tween only when keys match.
  if (!from || from.length !== to.length || from.some((r, i) => r.key !== to[i].key)) return to;
  return to.map((r, i) => Object.assign({}, r, { flood: from[i].flood + (r.flood - from[i].flood) * k, tax: from[i].tax + (r.tax - from[i].tax) * k, hard: from[i].hard + (r.hard - from[i].hard) * k }));
}
const burdenMax = a => Math.max(...M.PLANS.map(id => M.summary(id, a).rows.reduce((m, r) => Math.max(m, r.b), 0)));

/* ---------- step 0: who bears what ---------- */
const s0 = { shown: null };
function draw0(k = 1) {
  const a = A(), sm = M.summary(S.plan0, a), ref = M.summary('none', a).rows;
  const rows = k < 1 ? lerpRows(s0.from, sm.rows, k) : sm.rows;
  if (k >= 1) s0.shown = sm.rows;
  document.querySelectorAll('[data-plan]').forEach(b => b.setAttribute('aria-pressed', b.dataset.plan === S.plan0 ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c0'));
  const nm = niceMax(burdenMax(a) * 1.05, [5, 10, 20]);
  mekko(ctx, W, 28, H - 56, rows, ref, nm.max, nm.step);
  title(ctx, t('c0title'), 8, 17, W - 16);
  const list = sm.rows.map(r => `${grpName(r.key)} ${fmt(r.b, 1)}`).join(t('joinAnd'));
  $('r0').textContent = t('s0readout', { plan: planName(S.plan0), p: pct(a.p), list, tot: fmt(sm.total, 0), mean: fmt(sm.mean, 2), worst: grpName(sm.worstKey), wv: fmt(sm.worst, 1) });
}

/* ---------- step 1: consequences lens ---------- */
function draw1() {
  const a = A();
  $('p1v').textContent = pct(a.p); $('p1').value = a.p;
  $('lg1').innerHTML = M.PLANS.map(id => `<span class="lg"><span class="sw sw-${id}"></span><span>${planName(id)}</span></span>`).join('');
  const { ctx, W, H } = fitCanvas($('c1'));
  const top = Math.max(...M.PLANS.map(id => M.summary(id, Object.assign({}, a, { p: 0.3 })).mean));
  const nm = niceMax(top * 1.05, [5, 10]);
  const m = panel(ctx, W, { top: 28, bottom: H - 28, xMin: 0, xMax: 0.3, yMin: 0, yMax: nm.max, yTicks: yTicksFor(nm.max, nm.step), xTicks: true, xSteps: [0.05, 0.1], xFmt: v => pct(v, 0), title: t('c1title') });
  M.PLANS.forEach(id => {
    const L = M.meanLine(id, a);
    ctx.save(); ctx.strokeStyle = PCOL[id]; ctx.lineWidth = id === M.bestMean(a) ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(m.x(0), m.y(L.c0)); ctx.lineTo(m.x(0.3), m.y(L.c0 + L.c1 * 0.3)); ctx.stroke(); ctx.restore();
  });
  const cx = M.crossP('none', 'A', a);
  if (cx !== null && cx >= 0 && cx <= 0.3) { const L = M.meanLine('A', a); ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(m.x(cx), m.y(L.c0 + L.c1 * cx), 7, 0, 7); ctx.stroke(); ctx.restore(); }
  vguide(ctx, m.x(a.p), m.P.t, m.P.b);
  M.PLANS.forEach(id => dot(ctx, m.x(a.p), m.y(M.summary(id, a).mean), 4.5, PCOL[id], C.bg));
  const r = M.ranking(Object.assign({}, a, { lam: 0 }));
  $('r1').textContent = t('s1readout', { p: pct(a.p), order: r.map(s => `${shortName(s.id)} ${fmt(s.mean, 2)}`).join(' < '), best: planName(r[0].id), cross: pct(cx) });
}

/* ---------- step 2: distribution lens ---------- */
function lamSequence(a) {
  const { segs } = M.sweep(a, 'lam');
  return segs.map((s, i) => (i === 0 ? '' : t('seqStep', { v: fmt(s.lo, 2) })) + shortName(s.id)).join('');
}
function draw2() {
  const a = A();
  $('l2v').textContent = fmt(a.lam, 2); $('l2').value = a.lam;
  $('lg2').innerHTML = M.PLANS.map(id => `<span class="lg"><span class="sw sw-${id}"></span><span>${id === 'none' ? '0 ' : ''}${planName(id)}</span></span>`).join('');
  const sms = M.ranking(a);
  const { ctx, W, H } = fitCanvas($('c2'));
  const nx = niceMax(Math.max(...sms.map(s => s.mean)) * 1.25, [2, 5, 10]), ny = niceMax(Math.max(...sms.map(s => s.worst)) * 1.2, [5, 10, 20]);
  const m = panel(ctx, W, { top: 28, bottom: H - 28, xMin: 0, xMax: nx.max, yMin: 0, yMax: ny.max, yTicks: yTicksFor(ny.max, ny.step), xTicks: true, xSteps: [1, 2, 5, 10], title: t('c2title') });
  ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip();
  sms.slice().reverse().forEach((s, idx) => {
    const win = s.id === sms[0].id, sc = s.score, l = a.lam;
    ctx.strokeStyle = PCOL[s.id]; ctx.lineWidth = win ? 2.4 : 1.2; ctx.globalAlpha = win ? 1 : 0.55; ctx.setLineDash(win ? [] : [5, 5]);
    ctx.beginPath();
    if (l < 1e-9) { ctx.moveTo(m.x(s.mean), m.P.t); ctx.lineTo(m.x(s.mean), m.P.b); }
    else { const yAt = x => (sc - (1 - l) * x) / l; ctx.moveTo(m.x(0), m.y(yAt(0))); ctx.lineTo(m.x(nx.max), m.y(yAt(nx.max))); }
    ctx.stroke();
  });
  ctx.restore();
  // dots; the letter goes inside only when no other dot is close enough to collide
  const pts = sms.map(s => ({ id: s.id, X: m.x(s.mean), Y: m.y(s.worst) }));
  pts.forEach(pt => {
    const win = pt.id === sms[0].id;
    dot(ctx, pt.X, pt.Y, win ? 10 : 8.5, PCOL[pt.id], win ? C.text : C.bg);
    if (!pts.some(o => o !== pt && Math.hypot(o.X - pt.X, o.Y - pt.Y) < 20)) {
      ctx.save(); ctx.fillStyle = '#07131a'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(PLETTER[pt.id], pt.X, pt.Y + 4); ctx.restore();
    }
  });
  $('r2').textContent = t('s2readout', { p: pct(a.p), lam: fmt(a.lam, 2), order: sms.map(s => `${shortName(s.id)} ${fmt(s.score, 2)}`).join(' < '), best: planName(sms[0].id), seq: lamSequence(a) });
}

/* ---------- step 3: consent lens ---------- */
function draw3() {
  const a = A();
  $('q3v').textContent = pct(a.q, 0); $('q3').value = a.q;
  document.querySelectorAll('[data-rule]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.rule === 'on') === a.rule ? 'true' : 'false'));
  const sm = M.summary('C', a), ref = M.summary('none', a).rows;
  const { ctx, W, H } = fitCanvas($('c3'));
  const nm = niceMax(burdenMax(Object.assign({}, a, { q: 0.999, rule: true })) * 1.05, [5, 10, 20]);
  mekko(ctx, W, 28, 190, sm.rows, ref, nm.max, nm.step);
  title(ctx, t('c3top'), 8, 17, W - 16);
  const vol = Object.assign({}, a, { rule: true }), man = Object.assign({}, a, { rule: false });
  const mm = M.summary('C', man);
  const b = panel(ctx, W, { top: 278, bottom: H - 28, xMin: 0, xMax: 1, yMin: 0, yMax: nm.max, yTicks: yTicksFor(nm.max, nm.max > 40 ? 20 : 10), xTicks: true, xSteps: [0.25, 0.5], xFmt: v => pct(v, 0), title: t('c3bot') });
  const curve = (key, col, dash, alpha) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.globalAlpha = alpha; ctx.setLineDash(dash);
    ctx.beginPath();
    for (let i = 0; i <= 199; i++) { const q = i / 200, v = M.summary('C', Object.assign({}, vol, { q }))[key]; if (!i) ctx.moveTo(b.x(q), b.y(v)); else ctx.lineTo(b.x(q), b.y(v)); }
    ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, b.x(1), b.y(M.summary('C', Object.assign({}, vol, { q: 1 }))[key]), 3.5, col); ctx.restore();
  };
  const onA = a.rule ? 1 : 0.35, offA = a.rule ? 0.35 : 1;
  curve('mean', C.orange, [], onA); curve('worst', C.orange, [6, 4], onA);
  ctx.save(); ctx.globalAlpha = offA; ctx.strokeStyle = C.pink; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(b.x(0), b.y(mm.mean)); ctx.lineTo(b.x(1), b.y(mm.mean)); ctx.stroke();
  ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(b.x(0), b.y(mm.worst)); ctx.lineTo(b.x(1), b.y(mm.worst)); ctx.stroke(); ctx.restore();
  vguide(ctx, b.x(a.q), b.P.t, b.P.b);
  const cur = M.summary('C', a);
  dot(ctx, b.x(a.q), b.y(cur.mean), 5, a.rule ? C.orange : C.pink, C.text); dot(ctx, b.x(a.q), b.y(cur.worst), 5, a.rule ? C.orange : C.pink, C.text);
  if (a.rule) {
    $('r3').textContent = t('s3readoutOn', { q: pct(a.q, 0), moved: fmt(100 * a.q, 0), stay: fmt(100 - 100 * a.q, 0), mean: fmt(sm.mean, 2), worst: fmt(sm.worst, 1), worstName: grpName(sm.worstKey), mMean: fmt(mm.mean, 2), mWorst: fmt(mm.worst, 1) });
  } else {
    $('r3').textContent = t('s3readoutOff', { q: pct(a.q, 0), forced: fmt(sm.forced, 0), mean: fmt(sm.mean, 2), worst: fmt(sm.worst, 1), worstName: grpName(sm.worstKey) });
  }
}

/* ---------- step 4: map of disagreement ---------- */
const PEOPLE = [{ p: 0.10, lam: 0.10 }, { p: 0.10, lam: 0.50 }, { p: 0.03, lam: 0.10 }];
const map = { key: '', cells: null };
const P4 = { min: 0.02, max: 0.30 };
function mapCells(a, nx, ny) {
  const key = [a.rule, a.q, a.eA, a.mR, a.hm, nx, ny].join('|');
  if (map.key === key) return map.cells;
  const cells = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const p = P4.min + (P4.max - P4.min) * (i + 0.5) / nx, lam = 1 - (j + 0.5) / ny;
    cells.push(M.winner(Object.assign({}, a, { p, lam })));
  }
  map.key = key; map.cells = cells; return cells;
}
function flipText(mg, fmtV) {
  const parts = [];
  if (mg.below) parts.push(t('flipBelow', { v: fmtV(mg.below.at), to: planName(mg.below.from) }));
  if (mg.above) parts.push(t('flipAbove', { v: fmtV(mg.above.at), to: planName(mg.above.to) }));
  return parts.length ? parts.join(t('joinAnd')) : t('flipNone');
}
let m4 = null;
function draw4() {
  const a = A();
  $('p4v').textContent = pct(a.p); $('p4').value = a.p; $('l4v').textContent = fmt(a.lam, 2); $('l4').value = a.lam;
  $('lg4').innerHTML = M.PLANS.map(id => `<span class="lg"><span class="sw sw-${id}"></span><span>${planName(id)}</span></span>`).join('') + `<span class="lg"><span class="sw sw-you"></span><span>${t('lgYou')}</span></span><span class="lg"><span class="sw sw-person"></span><span>${t('lgPeople')}</span></span>`;
  const { ctx, W, H } = fitCanvas($('c4'));
  const m = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: P4.min, xMax: P4.max, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [0.04, 0.05, 0.1], xFmt: v => pct(v, 0), title: t('c4title') });
  const nx = Math.max(60, Math.round((m.P.r - m.P.l) / 3)), ny = Math.max(40, Math.round((m.P.b - m.P.t) / 3));
  const cells = mapCells(a, nx, ny), cw = (m.P.r - m.P.l) / nx, ch = (m.P.b - m.P.t) / ny;
  // one opaque pre-blended colour per plan, so neighbouring cells do not leave a visible grid
  cells.forEach((id, k) => { const i = k % nx, j = Math.floor(k / nx); ctx.fillStyle = MAPCOL[id]; ctx.fillRect(Math.floor(m.P.l + i * cw), Math.floor(m.P.t + j * ch), Math.ceil(cw) + 1, Math.ceil(ch) + 1); });
  // region borders
  ctx.save(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath();
  cells.forEach((id, k) => { const i = k % nx, j = Math.floor(k / nx); if (i + 1 < nx && cells[k + 1] !== id) { ctx.moveTo(m.P.l + (i + 1) * cw, m.P.t + j * ch); ctx.lineTo(m.P.l + (i + 1) * cw, m.P.t + (j + 1) * ch); } if (j + 1 < ny && cells[k + nx] !== id) { ctx.moveTo(m.P.l + i * cw, m.P.t + (j + 1) * ch); ctx.lineTo(m.P.l + (i + 1) * cw, m.P.t + (j + 1) * ch); } });
  ctx.stroke(); ctx.restore();
  // residents
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif';
  PEOPLE.forEach((pp, i) => {
    const X = m.x(pp.p), Y = m.y(pp.lam);
    dot(ctx, X, Y, 4, '#07131a', C.text);
    const tag = t(`tag${i}`), w = ctx.measureText(tag).width;
    const left = X + 8 + w > m.P.r;
    ctx.fillStyle = '#07131a'; ctx.globalAlpha = 0.7; ctx.fillRect(left ? X - 10 - w : X + 6, Y - 17, w + 4, 15); ctx.globalAlpha = 1;
    ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.fillText(tag, left ? X - 8 - w : X + 8, Y - 5);
  });
  ctx.restore();
  dot(ctx, m.x(a.p), m.y(a.lam), 7.5, '#ffffff', '#07131a');
  m4 = m;
  const best = M.winner(a);
  $('r4').textContent = t('s4readout', { p: pct(a.p), lam: fmt(a.lam, 2), rule: t(a.rule ? 'ruleOnShort' : 'ruleOffShort'), best: planName(best),
    pm: t('s4pm', { pdir: flipText(M.margins(a, 'p'), v => pct(v)) }), lm: t('s4lm', { ldir: flipText(M.margins(a, 'lam'), v => fmt(v, 2)) }) });
}

/* ---------- step 5: what is holding the verdict up ---------- */
const ROWS = [
  { key: 'p', row: 'rowP', nm: 'nmP', f: v => pct(v) },
  { key: 'lam', row: 'rowLam', nm: 'nmLam', f: v => fmt(v, 2) },
  { key: 'eA', row: 'rowEA', nm: 'nmEA', f: v => pct(v, 0) },
  { key: 'mR', row: 'rowMR', nm: 'nmMR', f: v => fmt(v, 2) + '×' },
  { key: 'hm', row: 'rowHM', nm: 'nmHM', f: v => fmt(v, 1) },
  { key: 'q', row: 'rowQ', nm: 'nmQ', f: v => pct(v, 0) }
];
function draw5() {
  const a = A();
  $('eA5v').textContent = pct(a.eA, 0); $('eA5').value = a.eA; $('mR5v').textContent = fmt(a.mR, 1) + '×'; $('mR5').value = a.mR; $('hm5v').textContent = fmt(a.hm, 0); $('hm5').value = a.hm;
  $('lg5').innerHTML = M.PLANS.map(id => `<span class="lg"><span class="sw sw-${id}"></span><span>${planName(id)}</span></span>`).join('');
  const { ctx, W } = fitCanvas($('c5'));
  const L = 12, R = W - 12, rowH = 64, best = M.winner(a);
  const flips = [], flat = [];
  ROWS.forEach((rw, i) => {
    const y0 = 8 + i * rowH, [lo, hi] = M.RANGES[rw.key], X = v => L + (v - lo) / (hi - lo) * (R - L);
    const { segs } = M.sweep(a, rw.key, lo, hi, 300);
    title(ctx, t(rw.row, { v: rw.key === 'hm' ? fmt(a.hm, 0) : rw.f(a[rw.key]) }), L, y0 + 12, R - L);
    segs.forEach(s => { ctx.fillStyle = PCOL[s.id]; ctx.globalAlpha = 0.85; ctx.fillRect(X(s.lo), y0 + 20, Math.max(1, X(s.hi) - X(s.lo)), 16); ctx.globalAlpha = 1; });
    ctx.strokeStyle = C.bg; ctx.lineWidth = 2; segs.slice(1).forEach(s => { ctx.beginPath(); ctx.moveTo(X(s.lo), y0 + 20); ctx.lineTo(X(s.lo), y0 + 36); ctx.stroke(); });
    const cx = X(a[rw.key]);
    ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(cx, y0 + 37); ctx.lineTo(cx - 6, y0 + 45); ctx.lineTo(cx + 6, y0 + 45); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#07131a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, y0 + 18); ctx.lineTo(cx, y0 + 38); ctx.stroke();
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
    ctx.textAlign = 'left'; ctx.fillText(rw.f(lo), L, y0 + 56); ctx.textAlign = 'right'; ctx.fillText(rw.f(hi), R, y0 + 56); ctx.restore();
    if (segs.length === 1) flat.push(t(rw.nm));
    else { const mg = M.margins(a, rw.key); flips.push(t('s5item', { name: t(rw.nm), dir: flipText(mg, rw.f) })); }
  });
  $('r5').textContent = t('s5readout', { best: planName(best), list: flips.length ? flips.join(t('joinAnd')) : t('s5none'), flat: flat.length ? flat.join(t('listSep')) : t('s5none') });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  document.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => {
    s0.from = s0.shown; S.plan0 = b.dataset.plan;
    animate('s0', 450, k => draw0(1 - Math.pow(1 - k, 3)));
  }));
  const onP = v => { S.p = Number(v); refresh(); };
  $('p1').addEventListener('input', e => onP(e.target.value)); $('p4').addEventListener('input', e => onP(e.target.value));
  const onL = v => { S.lam = Number(v); refresh(); };
  $('l2').addEventListener('input', e => onL(e.target.value)); $('l4').addEventListener('input', e => onL(e.target.value));
  document.querySelectorAll('[data-rule]').forEach(b => b.addEventListener('click', () => { S.rule = b.dataset.rule === 'on'; refresh(); }));
  $('q3').addEventListener('input', e => { S.q = Number(e.target.value); refresh(); });
  $('eA5').addEventListener('input', e => { S.eA = Number(e.target.value); refresh(); });
  $('mR5').addEventListener('input', e => { S.mR = Number(e.target.value); refresh(); });
  $('hm5').addEventListener('input', e => { S.hm = Number(e.target.value); refresh(); });
  $('reset5').addEventListener('click', () => { S.eA = M.DEFAULTS.eA; S.mR = M.DEFAULTS.mR; S.hm = M.DEFAULTS.hm; refresh(); });
  document.querySelectorAll('[data-person]').forEach(b => b.addEventListener('click', () => { const pp = PEOPLE[Number(b.dataset.person)]; S.p = pp.p; S.lam = pp.lam; refresh(); }));
  // click or drag on the map moves the point (snapped to the slider steps)
  const c4 = $('c4');
  const pick = e => {
    if (!m4) return; const r = c4.getBoundingClientRect(), X = e.clientX - r.left, Y = e.clientY - r.top;
    const P = m4.P; if (X < P.l - 6 || X > P.r + 6 || Y < P.t - 6 || Y > P.b + 6) return;
    const p = P4.min + Math.min(1, Math.max(0, (X - P.l) / (P.r - P.l))) * (P4.max - P4.min), lam = 1 - Math.min(1, Math.max(0, (Y - P.t) / (P.b - P.t)));
    S.p = Math.round(p / 0.005) * 0.005; S.lam = Math.round(lam * 100) / 100; refresh();
  };
  let dragging = false;
  c4.addEventListener('pointerdown', e => { dragging = true; try { c4.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } pick(e); });
  c4.addEventListener('pointermove', e => { if (dragging) pick(e); });
  c4.addEventListener('pointerup', () => { dragging = false; }); c4.addEventListener('pointercancel', () => { dragging = false; });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

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
  window.refreshEthics = () => { const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); refresh(); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
