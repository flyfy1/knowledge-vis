'use strict';
// Titration-curve lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, marker and readout comes from window.TITR_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.TITR_MODEL;
const t = (...a) => window.TITR_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', raw: '#55657a', track: '#1b2836' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so toFixed(0) values such as 90 stay 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const signedPct = r => (r < 0 ? '−' : '+') + Math.abs(r * 100).toFixed(2) + '%';
const cText = c => c === 0.1 ? '0.100' : c === 0.01 ? '0.0100' : '0.00100';
const kindName = k => t(k === 'strong' ? 'kindStrong' : 'kindWeak');

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
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A plot panel with its title in its own row above; tick labels left of / below the plot.
function plot(ctx, W, o) {
  const P = { l: o.left || 34, r: W - 14, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  o.yTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v, 1), P.l - 6, y(v) + 4); });
  ctx.textAlign = 'center';
  const xt = (P.r - P.l) / o.xTicks.length < 30 && o.xTicksNarrow ? o.xTicksNarrow : o.xTicks;
  xt.forEach(v => { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v, 2), x(v), P.b + 16); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 2, m.P.r - m.P.l, m.P.b - m.P.t + 4); ctx.clip(); }
function line(ctx, m, pts, color, lw = 2, dash = null) {
  clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => { if (!i) ctx.moveTo(m.x(a), m.y(b)); else ctx.lineTo(m.x(a), m.y(b)); }); ctx.stroke(); ctx.restore();
}
function vdash(ctx, m, v, color = C.pink) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.8; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5.5, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
// Curve sampled densely near the equivalence point so the cliff is drawn sharply.
function dense(kind, pKa, c, v0, v1) {
  const pts = [], add = V => pts.push([V, M.pH(kind, pKa, c, V)]);
  const n = 240; for (let i = 0; i <= n; i++) add(v0 + (v1 - v0) * i / n);
  for (let V = Math.max(v0, 24); V <= Math.min(v1, 26); V += 0.005) add(V);
  return pts.sort((a, b) => a[0] - b[0]);
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
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: draw the curve ---------- */
const s0 = { kind: 'strong', visited: new Uint8Array(501), last: 0, auto: false };
s0.visited[0] = 1;
const idx0 = V => Math.round(V * 10);
function mark0(V) { const i = idx0(V), j = s0.last; for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s0.visited[q] = 1; s0.last = i; }
function clear0() { s0.visited.fill(0); s0.last = idx0(num('v0')); s0.visited[s0.last] = 1; }
function draw0() {
  const V = num('v0'), pk = s0.kind === 'weak' ? M.ACETIC : 0, p = M.pH(s0.kind, pk, 0.1, V);
  $('v0v').textContent = V.toFixed(1);
  $('k0s').setAttribute('aria-pressed', s0.kind === 'strong'); $('k0w').setAttribute('aria-pressed', s0.kind === 'weak');
  const { ctx, W } = fitCanvas($('c0'));
  const A = plot(ctx, W, { top: 30, bottom: 236, xMin: 0, xMax: 50, yMin: 0, yMax: 14, yTicks: [0, 2, 4, 6, 8, 10, 12, 14], xTicks: [0, 10, 20, 25, 30, 40, 50], xTicksNarrow: [0, 10, 20, 30, 40, 50], title: t('c0a') });
  vdash(ctx, A, M.VEQ);
  // visited stretches of the curve (dense near the cliff)
  clipTo(ctx, A); ctx.strokeStyle = C.text; ctx.lineWidth = 2.4; ctx.beginPath(); let pen = false;
  const pt = v => { const X = A.x(v), Y = A.y(M.pH(s0.kind, pk, 0.1, v)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); };
  for (let i = 0; i <= 500; i++) {
    if (!s0.visited[i]) { pen = false; continue; }
    pt(i / 10);
    if (i >= 240 && i < 260 && s0.visited[i + 1]) for (let k = 1; k < 20; k++) pt(i / 10 + k * 0.005); // resolve the cliff
  }
  ctx.stroke(); ctx.restore();
  dot(ctx, A.x(V), A.y(p), C.text, 6);
  // amounts panel on the same horizontal scale: OH⁻ added = 0.100 × V mmol, so x(V) is also x(mmol × 10)
  fitText(ctx, t('c0b'), 8, 274, W - 16);
  const r1 = 286, r2 = 314, bh = 20;
  ctx.fillStyle = 'rgba(232,237,244,0.10)'; ctx.fillRect(A.x(0), r1, A.x(25) - A.x(0), bh);
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.strokeRect(A.x(0), r1, A.x(25) - A.x(0), bh);
  ctx.fillStyle = C.track; ctx.fillRect(A.x(0), r2, A.x(50) - A.x(0), bh);
  ctx.fillStyle = C.cyan; ctx.fillRect(A.x(0), r2, A.x(V) - A.x(0), bh);
  vdash(ctx, { x: A.x, P: { t: r1 - 4, b: r2 + bh + 4 } }, M.VEQ);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  [0, 1, 2, 3, 4, 5].forEach(m => { const X = A.x(m * 10); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X, r2 + bh); ctx.lineTo(X, r2 + bh + 4); ctx.stroke(); ctx.fillText(String(m), X, r2 + bh + 16); });
  ctx.restore();
  const inv = M.inventory(0.1, V);
  const state = Math.abs(V - M.VEQ) < 1e-9 ? t('s0eq') : V < M.VEQ ? t('s0before', { left: inv.left.toFixed(2) }) : t('s0after', { sur: inv.surplus.toFixed(2) });
  $('r0').textContent = t('s0readout', { prog: s0.auto ? t('s0progress', { v: V.toFixed(1) }) : '', v: V.toFixed(1), nb: inv.nB.toFixed(2), state, pH: p.toFixed(2) });
}

/* ---------- step 1: drop by drop near the end ---------- */
const s1 = { visited: new Uint8Array(200), auto: false };
const idx1 = V => Math.round((V - 20) / M.DROP);
for (let q = 0; q <= idx1(24); q++) s1.visited[q] = 1; // start with 20–24 mL already walked
function draw1() {
  const V = num('v1'), i = idx1(V);
  $('v1v').textContent = V.toFixed(2);
  const { ctx, W } = fitCanvas($('c1'));
  const A = plot(ctx, W, { top: 30, bottom: 190, xMin: 20, xMax: 30, yMin: 0, yMax: 14, yTicks: [0, 7, 14], xTicks: [20, 22, 24, 25, 26, 28, 30], xTicksNarrow: [20, 22, 24, 26, 28, 30], title: t('c1a') });
  vdash(ctx, A, M.VEQ);
  clipTo(ctx, A); ctx.strokeStyle = C.text; ctx.lineWidth = 2.2;
  for (let q = 0; q < 200; q++) if (s1.visited[q]) {
    const v = 20 + q * M.DROP; ctx.beginPath();
    for (let k = 0; k <= 10; k++) { const u = v + M.DROP * k / 10, X = A.x(u), Y = A.y(M.pH('strong', 0, 0.1, u)); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke();
  }
  ctx.restore();
  dot(ctx, A.x(V), A.y(M.pH('strong', 0, 0.1, V)), C.cyan, 5.5);
  const B = plot(ctx, W, { top: 236, bottom: 370, xMin: 20, xMax: 30, yMin: 0, yMax: 3.2, yTicks: [0, 1, 2, 3], xTicks: [20, 22, 24, 25, 26, 28, 30], xTicksNarrow: [20, 22, 24, 26, 28, 30], title: t('c1b') });
  vdash(ctx, B, M.VEQ);
  const bw = Math.max(1.2, (B.x(20 + M.DROP) - B.x(20)) * 0.7);
  for (let q = 0; q < 200; q++) if (s1.visited[q] || q === i) {
    const v = 20 + q * M.DROP, d = M.dropJump('strong', 0, 0.1, v);
    ctx.fillStyle = q === i ? C.cyan : C.orange; const X = B.x(v + M.DROP / 2), Y = B.y(Math.min(3.2, d));
    ctx.fillRect(X - bw / 2, Y, bw, B.y(0) - Y);
  }
  const p0 = M.pH('strong', 0, 0.1, V), p1 = M.pH('strong', 0, 0.1, V + M.DROP), inv = M.inventory(0.1, V);
  const total = s1.visited.reduce((s, v) => s + v, 0);
  const prog = s1.auto ? t('s1progress', { k: total }) : '';
  const base = { prog, v: V.toFixed(2), p0: p0.toFixed(2), p1: p1.toFixed(2), d: (p1 - p0).toFixed(2) };
  let text;
  if (Math.abs(V - M.VEQ) < 1e-9) text = t('s1eq', base);
  else if (V < M.VEQ) {
    const pct = inv.drop / inv.left * 100;
    text = Math.abs(pct - 100) < 1e-6 ? t('s1last', { ...base, left: inv.left.toFixed(3) }) : t('s1before', { ...base, left: inv.left.toFixed(3), pct: fmt(pct, 1) });
  } else text = t('s1after', { ...base, sur: inv.surplus.toFixed(3), pct: fmt(inv.drop / inv.surplus * 100, 1) });
  $('r1').textContent = text;
}

/* ---------- step 2: weak acid and pKa ---------- */
function draw2() {
  const pk = num('pk2');
  $('pk2v').textContent = pk.toFixed(2);
  const { ctx, W } = fitCanvas($('c2'));
  const A = plot(ctx, W, { top: 30, bottom: 300, xMin: 0, xMax: 50, yMin: 0, yMax: 14, yTicks: [0, 2, 4, 6, 7, 8, 10, 12, 14].filter(v => v !== 7), xTicks: [0, 10, 12.5, 20, 25, 30, 40, 50], xTicksNarrow: [0, 10, 20, 30, 40, 50], title: t('c2title') });
  line(ctx, A, dense('strong', 0, 0.1, 0, 50), C.ghost, 1.6, [5, 4]);
  line(ctx, A, dense('weak', pk, 0.1, 0, 50), C.cyan, 2.6);
  const ph = M.pH('weak', pk, 0.1, 12.5), pe = M.pH('weak', pk, 0.1, 25);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.moveTo(A.P.l, A.y(pk)); ctx.lineTo(A.x(12.5), A.y(pk)); ctx.moveTo(A.x(12.5), A.y(pk)); ctx.lineTo(A.x(12.5), A.P.b); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.green; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(7)); ctx.lineTo(A.P.r, A.y(7)); ctx.stroke(); ctx.restore();
  vdash(ctx, A, M.VEQ);
  dot(ctx, A.x(12.5), A.y(ph), C.orange, 6, true);
  dot(ctx, A.x(25), A.y(pe), C.text, 6);
  $('r2').textContent = t('s2readout', { pKa: pk.toFixed(2), p0: M.pH('weak', pk, 0.1, 0).toFixed(2), ph: ph.toFixed(2), dh: Math.abs(ph - pk).toFixed(3), pe: pe.toFixed(2) });
}

/* ---------- step 3: concentration ---------- */
const s3 = { kind: 'strong', ci: 0 };
function draw3() {
  const pk = s3.kind === 'weak' ? M.ACETIC : 0, c = M.CONCS[s3.ci];
  $('k3s').setAttribute('aria-pressed', s3.kind === 'strong'); $('k3w').setAttribute('aria-pressed', s3.kind === 'weak');
  M.CONCS.forEach((_, i) => $('c3_' + i).setAttribute('aria-pressed', i === s3.ci));
  const { ctx, W } = fitCanvas($('c3'));
  const A = plot(ctx, W, { top: 30, bottom: 300, xMin: 0, xMax: 50, yMin: 0, yMax: 14, yTicks: [0, 2, 4, 6, 8, 10, 12, 14], xTicks: [0, 10, 20, 25, 30, 40, 50], xTicksNarrow: [0, 10, 20, 30, 40, 50], title: t('c3title') });
  const j = M.jump(s3.kind, pk, c);
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.16)'; ctx.fillRect(A.P.l, A.y(j.b), A.P.r - A.P.l, A.y(j.a) - A.y(j.b));
  ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.7; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(j.a)); ctx.lineTo(A.P.r, A.y(j.a)); ctx.moveTo(A.P.l, A.y(j.b)); ctx.lineTo(A.P.r, A.y(j.b)); ctx.stroke(); ctx.restore();
  vdash(ctx, A, M.VEQ);
  M.CONCS.forEach((cc, i) => { if (i !== s3.ci) line(ctx, A, dense(s3.kind, pk, cc, 0, 50), C.raw, 1.6); });
  line(ctx, A, dense(s3.kind, pk, c, 0, 50), C.cyan, 2.8);
  $('r3').textContent = t('s3readout', { kind: kindName(s3.kind), c: cText(c), a: j.a.toFixed(2), b: j.b.toFixed(2), h: j.height.toFixed(2) });
}

/* ---------- step 4: choosing an indicator ---------- */
const s4 = { kind: 'strong', ci: 0, ind: 'pp' };
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
function layers4(ctx, m, pk, c, ind, j, e) {
  ctx.save(); clipTo(ctx, m);
  ctx.fillStyle = 'rgba(255,180,84,0.16)'; ctx.fillRect(m.P.l, m.y(j.b), m.P.r - m.P.l, m.y(j.a) - m.y(j.b));
  // indicator transition range: a colour strip along the right edge of the plot, centre line across
  const g = ctx.createLinearGradient(0, m.y(ind.lo), 0, m.y(ind.hi)); g.addColorStop(0, rgb(ind.c[0])); g.addColorStop(1, rgb(ind.c[1]));
  ctx.fillStyle = g; ctx.fillRect(m.P.r - 14, m.y(ind.hi), 14, m.y(ind.lo) - m.y(ind.hi));
  ctx.strokeStyle = C.text; ctx.lineWidth = 1; ctx.strokeRect(m.P.r - 14, m.y(ind.hi), 14, m.y(ind.lo) - m.y(ind.hi));
  ctx.globalAlpha = 0.9; ctx.strokeStyle = rgb(M.indColor(ind, M.midOf(ind))); ctx.setLineDash([6, 3]); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(m.P.l, m.y(M.midOf(ind))); ctx.lineTo(m.P.r, m.y(M.midOf(ind))); ctx.stroke();
  ctx.restore();
  vdash(ctx, m, M.VEQ);
}
function draw4() {
  const pk = s4.kind === 'weak' ? M.ACETIC : 0, c = M.CONCS[s4.ci], ind = M.indicator(s4.ind);
  $('k4s').setAttribute('aria-pressed', s4.kind === 'strong'); $('k4w').setAttribute('aria-pressed', s4.kind === 'weak');
  M.CONCS.forEach((_, i) => $('c4_' + i).setAttribute('aria-pressed', i === s4.ci));
  M.INDICATORS.forEach(d => $('i4_' + d.id).setAttribute('aria-pressed', d.id === s4.ind));
  const j = M.jump(s4.kind, pk, c), e = M.endPoint(s4.kind, pk, c, ind), mid = M.midOf(ind);
  const { ctx, W } = fitCanvas($('c4'));
  const A = plot(ctx, W, { top: 30, bottom: 240, xMin: 0, xMax: 50, yMin: 0, yMax: 14, yTicks: [0, 2, 4, 6, 8, 10, 12, 14], xTicks: [0, 10, 20, 25, 30, 40, 50], xTicksNarrow: [0, 10, 20, 30, 40, 50], title: t('c4a') });
  layers4(ctx, A, pk, c, ind, j, e);
  line(ctx, A, dense(s4.kind, pk, c, 0, 50), C.text, 2.4);
  if (e) dot(ctx, A.x(e.V), A.y(mid), C.cyan, 6.5, true);
  const B = plot(ctx, W, { top: 292, bottom: 440, xMin: 23, xMax: 27, yMin: 0, yMax: 14, yTicks: [0, 7, 14], xTicks: [23, 24, 25, 26, 27], title: t('c4b') });
  layers4(ctx, B, pk, c, ind, j, e);
  line(ctx, B, dense(s4.kind, pk, c, 23, 27), C.text, 2.4);
  if (e && e.V >= 23 && e.V <= 27) dot(ctx, B.x(e.V), B.y(mid), C.cyan, 6.5, true);
  else if (e) { // off the zoom window: an arrow at the left edge points to it
    const Y = B.y(mid), X = B.P.l + 2; ctx.save(); ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + 11, Y - 7); ctx.lineTo(X + 11, Y + 7); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const base = { kind: kindName(s4.kind), c: cText(c), ind: t('ind_' + ind.id), m: mid.toFixed(2) };
  if (!e || e.V === 0) { $('r4').textContent = t('s4start', { ...base, p0: M.pH(s4.kind, pk, c, 0).toFixed(2) }); return; }
  const inside = M.inJump(s4.kind, pk, c, ind);
  $('r4').textContent = t('s4readout', { ...base, v: e.V.toFixed(3), dir: t(e.err < 0 ? 'dirEarly' : 'dirLate'), dv: Math.abs(e.err).toFixed(3), rel: signedPct(e.rel) }) + ' ' + t(inside ? 's4ok' : 's4bad', { a: j.a.toFixed(2), b: j.b.toFixed(2) });
}

function quizText(ok) {
  const j = M.jump('weak', M.ACETIC, 0.1), pp = M.endPoint('weak', M.ACETIC, 0.1, M.indicator('pp')), btb = M.endPoint('weak', M.ACETIC, 0.1, M.indicator('btb'));
  return ok ? t('correct', { a: j.a.toFixed(2), b: j.b.toFixed(2), m: M.midOf(M.indicator('pp')).toFixed(2), e: signedPct(pp.rel) })
    : t('wrong', { pe: M.pH('weak', M.ACETIC, 0.1, 25).toFixed(2), a: j.a.toFixed(2), b: j.b.toFixed(2), d: Math.abs(btb.err).toFixed(2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('k0s').addEventListener('click', () => { stopAnim('s0'); s0.auto = false; s0.kind = 'strong'; clear0(); draw0(); });
  $('k0w').addEventListener('click', () => { stopAnim('s0'); s0.auto = false; s0.kind = 'weak'; clear0(); draw0(); });
  $('v0').addEventListener('input', () => { stopAnim('s0'); s0.auto = false; mark0(num('v0')); draw0(); });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.auto = false; clear0(); draw0(); });
  $('auto0').addEventListener('click', () => {
    s0.visited.fill(0); s0.last = 0; s0.auto = true;
    animate('s0', 7000, p => { const V = Math.round(p * 500) / 10; $('v0').value = V; mark0(V); draw0(); }, () => { s0.auto = false; draw0(); });
  });

  $('v1').addEventListener('input', () => { stopAnim('s1'); s1.auto = false; s1.visited[idx1(num('v1'))] = 1; draw1(); });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.auto = false; s1.visited.fill(0); s1.visited[idx1(num('v1'))] = 1; draw1(); });
  $('walk1').addEventListener('click', () => {
    s1.visited.fill(0); s1.auto = true;
    animate('s1', 7000, p => { const k = Math.min(199, Math.floor(p * 200)); for (let q = 0; q <= k; q++) s1.visited[q] = 1; $('v1').value = (20 + k * M.DROP).toFixed(2); draw1(); }, () => { s1.auto = false; draw1(); });
  });

  $('pk2').addEventListener('input', draw2);

  $('k3s').addEventListener('click', () => { s3.kind = 'strong'; draw3(); });
  $('k3w').addEventListener('click', () => { s3.kind = 'weak'; draw3(); });
  M.CONCS.forEach((_, i) => $('c3_' + i).addEventListener('click', () => { s3.ci = i; draw3(); }));
  $('k4s').addEventListener('click', () => { s4.kind = 'strong'; draw4(); });
  $('k4w').addEventListener('click', () => { s4.kind = 'weak'; draw4(); });
  M.CONCS.forEach((_, i) => $('c4_' + i).addEventListener('click', () => { s4.ci = i; draw4(); }));
  M.INDICATORS.forEach(d => $('i4_' + d.id).addEventListener('click', () => { s4.ind = d.id; draw4(); }));

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = quizText(ok);
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshTitration = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = quizText(fb.dataset.state === 'correct'); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
