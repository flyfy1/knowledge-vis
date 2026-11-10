'use strict';
// PageRank lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every circle, bar, curve and readout comes from window.PR_MODEL (model.js). Canvas text is limited to
// panel titles (own row), page letters inside their circles, bar labels/values in fixed columns, and axis ticks.
(function () {
const $ = id => document.getElementById(id);
const M = window.PR_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#f2e86d', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: '#5b6f86', edge: '#53667d', node: '#1d2a3a' };
const PCOL = [C.cyan, C.orange, C.green, C.pink, C.violet, C.yellow, C.text];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const f3 = v => v.toFixed(3);
const pct = v => (v * 100).toFixed(1) + '%';

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
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = '', color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, W, Y) => fitText(ctx, text, 8, Y, W - 16, { size: 12, weight: '600' });

function frame(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const tx = v => (o.logX ? Math.log10(v) : v), ty = v => (o.logY ? Math.log10(v) : v);
  const x = v => P.l + (tx(Math.max(o.xMin, Math.min(o.xMax, v))) - tx(o.xMin)) / (tx(o.xMax) - tx(o.xMin)) * (P.r - P.l);
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
function line(ctx, F, pts, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(F.P.l, F.P.t - 2, F.P.r - F.P.l, F.P.b - F.P.t + 4); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => { if (i) ctx.lineTo(F.x(a), F.y(b)); else ctx.moveTo(F.x(a), F.y(b)); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 4.5) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
function vguide(ctx, X, y0, y1, color = C.muted) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
// Horizontal bars: label column | bars | value column.
function hbars(ctx, W, o) {
  const rowH = o.rowH || 30, top = o.top + 16, n = o.rows.length, x0 = 30, valueW = 56, x1 = W - valueW - 8;
  const x = v => x0 + Math.max(0, Math.min(1, v / o.max)) * (x1 - x0);
  title(ctx, o.title, W, o.top);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.ticks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), top - 2); ctx.lineTo(x(v), top + n * rowH + 2); ctx.stroke(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(o.tickFmt(v), x(v), top + n * rowH + 15); }
  ctx.restore();
  o.rows.forEach((r, i) => {
    const yc = top + i * rowH + rowH / 2, bh = Math.min(16, rowH - 8);
    fitText(ctx, r.label, x0 - 10, yc + 4, x0 - 12, { size: 12, weight: '700', color: r.color, align: 'right' });
    ctx.fillStyle = r.color; ctx.globalAlpha = r.alpha || 1; ctx.fillRect(x0, yc - bh / 2, Math.max(1.5, x(r.value) - x0), bh); ctx.globalAlpha = 1;
    if (r.tick !== undefined) { ctx.fillStyle = C.text; ctx.fillRect(x(r.tick) - 1.5, yc - bh / 2 - 3, 3, bh + 6); }
    fitText(ctx, r.valueText, W - 8, yc + 4, valueW, { size: 11.5, color: C.muted, align: 'right' });
  });
}

/* ---------- graph drawing ---------- */
// box: {l, t, w, h}; sizes: value per page (area ∝ value); opts: highlight, edgeColor(i, j), fakes, trail, at
function graph(ctx, box, links, sizes, o = {}) {
  const g = M.build(links), names = g.names.filter(n => M.POS[n]);
  const rMax = Math.max(14, Math.min(26, Math.min(box.w, box.h) * 0.085)), m = rMax + 4;
  const P = {}; names.forEach(n => { const p = M.POS[n]; P[n] = [box.l + m + p[0] * (box.w - 2 * m), box.t + m + p[1] * (box.h - 2 * m)]; });
  const vmax = o.vmax || Math.max(...names.map(n => sizes[n]));
  const R = {}; names.forEach(n => { R[n] = Math.max(8, rMax * Math.sqrt(Math.max(0, sizes[n]) / vmax)); });
  // fake pages (step 5): a grid of small dots in a reserved column on the right
  if (o.fakes) {
    const cols = 4, gap = Math.min(9, (box.h - 20) / Math.ceil(o.fakes / cols)), fx = box.l + box.w + 12;
    for (let i = 0; i < o.fakes; i++) {
      const X = fx + (i % cols) * 9, Y = box.t + 14 + Math.floor(i / cols) * gap;
      ctx.save(); ctx.strokeStyle = C.faint; ctx.globalAlpha = 0.35; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(P.D[0], P.D[1]); ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#6b7c90'; ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, 7); ctx.fill();
    }
  }
  // edges as gentle arcs so that i→j and j→i don't overlap
  names.forEach(a => (links[a] || []).forEach(b => {
    if (!P[b]) return;
    const [x0, y0] = P[a], [x1, y1] = P[b], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    const cx = (x0 + x1) / 2 - dy / L * L * 0.12, cy = (y0 + y1) / 2 + dx / L * L * 0.12;
    const sAng = Math.atan2(cy - y0, cx - x0), eAng = Math.atan2(y1 - cy, x1 - cx);
    const sx = x0 + Math.cos(sAng) * (R[a] + 2), sy = y0 + Math.sin(sAng) * (R[a] + 2);
    const ex = x1 - Math.cos(eAng) * (R[b] + 3), ey = y1 - Math.sin(eAng) * (R[b] + 3);
    const col = o.edgeColor ? o.edgeColor(a, b) : C.edge;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = col === C.edge ? 1.4 : 2.4;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
    const ah = 8; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ah * Math.cos(eAng - 0.4), ey - ah * Math.sin(eAng - 0.4)); ctx.lineTo(ex - ah * Math.cos(eAng + 0.4), ey - ah * Math.sin(eAng + 0.4)); ctx.closePath(); ctx.fill();
    ctx.restore();
  }));
  if (o.trail) o.trail.forEach((mv, i) => {
    const a = P[names[mv.from]], b = P[names[mv.to]], alpha = 0.25 + 0.75 * (i + 1) / o.trail.length;
    if (mv.from === mv.to) return;
    ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = alpha; ctx.lineWidth = 2.2; if (mv.jump) ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
  });
  names.forEach(n => {
    const [X, Y] = P[n], hi = o.highlight === n;
    ctx.save(); ctx.fillStyle = o.fill ? o.fill(n) : C.node; ctx.strokeStyle = hi ? C.orange : C.cyan; ctx.lineWidth = hi ? 3 : 1.6;
    ctx.beginPath(); ctx.arc(X, Y, R[n], 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(n, X, Y + 4); ctx.restore();
  });
  if (o.at !== undefined) { const p = P[names[o.at]]; ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(p[0] + R[names[o.at]] * 0.75, p[1] - R[names[o.at]] * 0.75, 6, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
  return P;
}
const graphBox = (W, H, extraRight = 0) => ({ l: 8, t: 24, w: W - 16 - extraRight, h: H - 32 });
const toMap = (names, arr) => { const o = {}; names.forEach((n, i) => { o[n] = arr[i]; }); return o; };

/* ---------- animation runner ---------- */
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

const G0 = M.build(M.BASE), PR = M.pagerank(G0).r, IN = M.inCounts(G0), NAMES = G0.names;
const orderStr = r => M.order(r).map(i => NAMES[i]).join(' > ');

/* ---------- step 0: votes ---------- */
const s0 = { metric: 'pr' };
function draw0() {
  const byPr = s0.metric === 'pr', vals = byPr ? PR : IN, pick = $('pick0').value, pi = G0.idx[pick];
  $('byIn').setAttribute('aria-pressed', String(!byPr)); $('byPr').setAttribute('aria-pressed', String(byPr));
  let { ctx, W, H } = fitCanvas($('c0a'));
  title(ctx, t('c0a'), W, 16);
  graph(ctx, graphBox(W, H), M.BASE, toMap(NAMES, vals), { highlight: pick, edgeColor: (a, b) => (a === pick ? C.orange : C.edge) });
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const max = byPr ? 0.3 : 4;
  hbars(ctx, W, { top: 16, rowH: (H - 50) / 7, title: t('c0b', { metric: t(byPr ? 'metricPr' : 'metricIn') }), max, ticks: byPr ? [0, 0.1, 0.2, 0.3] : [0, 1, 2, 3, 4], tickFmt: v => (byPr ? fmt(v, 1) : String(v)),
    rows: NAMES.map((n, i) => ({ label: n, value: vals[i], color: PCOL[i], valueText: byPr ? f3(vals[i]) : String(vals[i]) })) });
  const outs = G0.out[pi];
  if (!outs.length) { $('r0').textContent = t('s0dead', { page: pick }); return; }
  $('r0').textContent = t('s0readout', { order: orderStr(PR), page: pick, score: f3(PR[pi]), outs: outs.length, share: f3(0.85 * PR[pi] / outs.length), targets: outs.map(j => NAMES[j]).join(', ') });
}

/* ---------- step 1: one random surfer ---------- */
const MAX1 = 20000;
const s1 = { u: M.rng(77), at: 0, n: 0, jumps: 0, counts: new Array(7).fill(0), trail: [], trace: [], running: false };
function walk(k) {
  k = Math.min(k, MAX1 - s1.n);
  for (let i = 0; i < k; i++) {
    const mv = M.surf(G0, s1.at, 0.85, s1.u);
    s1.trail.push({ from: s1.at, to: mv.to, jump: mv.jump }); if (s1.trail.length > 8) s1.trail.shift();
    s1.at = mv.to; s1.n++; if (mv.jump) s1.jumps++; s1.counts[s1.at]++;
  }
  if (k > 0) s1.trace.push([s1.n, s1.counts[1] / s1.n, s1.counts[6] / s1.n]);
}
function reset1() { stopAnim('s1'); s1.running = false; s1.u = M.rng(77); s1.at = 0; s1.n = 0; s1.jumps = 0; s1.counts.fill(0); s1.trail = []; s1.trace = []; draw1(); }
function draw1() {
  const freq = s1.counts.map(c => (s1.n ? c / s1.n : 0));
  let { ctx, W, H } = fitCanvas($('c1a'));
  title(ctx, t('c1a'), W, 16);
  const mx = Math.max(...freq, 1e-9);
  graph(ctx, graphBox(W, H), M.BASE, toMap(NAMES, NAMES.map(() => 1)), { trail: s1.trail, at: s1.at,
    fill: n => { const v = freq[G0.idx[n]] / mx; return `rgba(103,215,249,${(0.08 + 0.55 * v).toFixed(3)})`; } });
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 40, xMin: 1, xMax: MAX1, logX: true, yMin: 0, yMax: 0.6, yTicks: [0, 0.2, 0.4, 0.6], yFmt: v => fmt(v, 1),
    xTicks: w => (w < 220 ? [1, 100, 10000] : [1, 10, 100, 1000, 10000]), xFmt: v => (v >= 1000 ? (v / 1000) + 'k' : String(v)), title: t('c1b') });
  line(ctx, F, [[1, PR[1]], [MAX1, PR[1]]], C.orange, { lw: 1.2, dash: [5, 4], alpha: 0.8 });
  line(ctx, F, [[1, PR[6]], [MAX1, PR[6]]], C.text, { lw: 1.2, dash: [5, 4], alpha: 0.8 });
  if (s1.trace.length) {
    line(ctx, F, s1.trace.map(q => [q[0], q[1]]), C.orange, { lw: 2.2 }); line(ctx, F, s1.trace.map(q => [q[0], q[2]]), C.text, { lw: 2.2 });
    const q = s1.trace[s1.trace.length - 1]; dot(ctx, F.x(q[0]), F.y(q[1]), C.orange); dot(ctx, F.x(q[0]), F.y(q[2]), C.text);
  }
  ['w1', 'w100', 'wAuto'].forEach(id => { $(id).disabled = s1.n >= MAX1; });
  if (!s1.n) { $('r1').textContent = t('s1empty'); return; }
  const tv = freq.reduce((s, f, i) => s + Math.abs(f - PR[i]), 0) / 2;
  $('r1').textContent = t('s1readout', { n: s1.n, prog: s1.running ? t('s1prog') : '', jumps: s1.jumps, fb: f3(freq[1]), pb: f3(PR[1]), fg: f3(freq[6]), pg: f3(PR[6]), tv: f3(tv) });
}
function auto1() {
  stopAnim('s1'); if (s1.n >= MAX1) return;
  s1.running = true; const l0 = Math.log10(Math.max(1, s1.n));
  animate('s1', 7000, p => { const target = Math.min(MAX1, Math.max(s1.n + 1, Math.round(Math.pow(10, l0 + p * (Math.log10(MAX1) - l0))))); walk(target - s1.n); if (p >= 1) s1.running = false; draw1(); }, () => { s1.running = false; draw1(); });
}

/* ---------- step 2: power iteration ---------- */
const HIST2 = M.history(G0, 0.85, 40), DIST2 = HIST2.map(r => M.l1(r, PR));
function draw2() {
  const k = num('k2'), r = HIST2[k];
  $('k2v').textContent = String(k);
  let { ctx, W, H } = fitCanvas($('c2a'));
  title(ctx, t('c2a', { k }), W, 16);
  graph(ctx, graphBox(W, H), M.BASE, toMap(NAMES, r), { vmax: 0.3 });
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const sup = { '-12': '10⁻¹²', '-9': '10⁻⁹', '-6': '10⁻⁶', '-3': '10⁻³', '0': '1' };
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 44, xMin: 0, xMax: 40, yMin: 1e-12, yMax: 2, logY: true, yTicks: [1e-12, 1e-9, 1e-6, 1e-3, 1], yFmt: v => sup[String(Math.round(Math.log10(v)))],
    xTicks: [0, 10, 20, 30, 40], xFmt: v => String(v), title: t('c2b'), right: 16 });
  line(ctx, F, DIST2.map((v, i) => [i, DIST2[0] * Math.pow(0.85, i)]), C.muted, { lw: 1.3, dash: [5, 4] });
  line(ctx, F, DIST2.slice(0, k + 1).map((v, i) => [i, Math.max(1e-12, v)]), C.cyan, { lw: 2.4 });
  dot(ctx, F.x(k), F.y(Math.max(1e-12, DIST2[k])), C.cyan, 5);
  const ratio = k > 0 ? t('s2ratio', { r: fmt(DIST2[k] / DIST2[k - 1], 2) }) : '';
  $('r2').textContent = t('s2readout', { k, a: f3(r[0]), b: f3(r[1]), c: f3(r[2]), g: f3(r[6]), sum: fmt(r.reduce((s, v) => s + v, 0), 6), dist: DIST2[k].toExponential(2), ratio });
}
function play2() { animate('s2', 6000, p => { $('k2').value = String(Math.round(p * 40)); draw2(); }); }

/* ---------- step 3: traps and dead ends ---------- */
const s3 = { variant: 'trap' };
const K3 = 60;
function draw3() {
  const d = num('d3'), v = s3.variant, links = M.VARIANTS[v], g = M.build(links);
  $('d3v').textContent = fmt(d, 2);
  [['vNormal', 'normal'], ['vTrap', 'trap'], ['vDead', 'deadend']].forEach(([id, k]) => $(id).setAttribute('aria-pressed', String(v === k)));
  const hist = M.history(g, d, K3), fin = d < 1 ? M.pagerank(g, d).r : hist[K3];
  const vname = t(v === 'trap' ? 'vTrap' : v === 'deadend' ? 'vDead' : 'vNormal');
  let { ctx, W, H } = fitCanvas($('c3a'));
  title(ctx, t('c3a', { variant: vname }), W, 16);
  graph(ctx, graphBox(W, H), links, toMap(NAMES, fin), { vmax: Math.max(0.3, ...fin), highlight: v === 'deadend' ? 'G' : undefined,
    edgeColor: (a, b) => (v === 'trap' && ((a === 'F' && b === 'G') || (a === 'G' && b === 'F')) ? C.pink : C.edge) });
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const what = v === 'deadend' ? 'whatDead' : 'whatTrap';
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 40, xMin: 0, xMax: K3, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v2 => Math.round(v2 * 100) + '%',
    xTicks: [0, 20, 40, 60], xFmt: v2 => String(v2), title: t('c3b', { what: t(what) }), right: 16 });
  let solid, dashed;
  if (v === 'deadend') {
    solid = hist.map((r, k) => [k, r.reduce((s, q) => s + q, 0)]);
    let r = M.uniform(7); dashed = [[0, 1]]; for (let k = 1; k <= K3; k++) { r = M.stepLeaky(g, r, d); dashed.push([k, r.reduce((s, q) => s + q, 0)]); }
  } else {
    solid = hist.map((r, k) => [k, r[5] + r[6]]);
    dashed = M.history(g, 1, K3).map((r, k) => [k, r[5] + r[6]]);
  }
  line(ctx, F, dashed, C.muted, { lw: 1.6, dash: [5, 4] });
  line(ctx, F, solid, C.pink, { lw: 2.6 });
  $('lg3').innerHTML = `<span class="lg"><span class="sw sw-line sw-pink"></span><span>${t('lgCurD')}</span></span><span class="lg"><span class="sw sw-dline"></span><span>${t(v === 'deadend' ? 'lgLeak' : 'lgD1')}</span></span>`;
  let body;
  if (v === 'normal') body = t('s3bodyNormal', { scores: NAMES.map((n, i) => n + ' ' + f3(fin[i])).join(', ') });
  else if (v === 'trap') body = t('s3bodyTrap', { fg: pct(fin[5] + fin[6]), fg1: pct(dashed[40][1]) });
  else body = t('s3bodyDead', { sum: fmt(solid[K3][1], 3), leak: pct(dashed[K3][1]) });
  $('r3').textContent = t('s3readout', { variant: vname, d: fmt(d, 2), body });
}

/* ---------- step 4: damping factor ---------- */
const D_GRID = []; for (let i = 0; i <= 99; i++) D_GRID.push(i / 100);
const SWEEP4 = D_GRID.map(d => { const q = M.pagerank(G0, d); return { d, r: q.r, it: q.iterations }; });
function draw4() {
  const d = num('d4'), row = SWEEP4[Math.round(d * 100)];
  $('d4v').textContent = fmt(d, 2);
  let { ctx, W, H } = fitCanvas($('c4a'));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 40, xMin: 0, xMax: 0.99, yMin: 0, yMax: 0.3, yTicks: [0, 0.1, 0.2, 0.3], yFmt: v => fmt(v, 1),
    xTicks: w => (w < 300 ? [0, 0.5, 0.85] : [0, 0.2, 0.4, 0.6, 0.85]), xFmt: v => fmt(v, 2), title: t('c4a'), right: 16 });
  NAMES.forEach((n, i) => line(ctx, F, SWEEP4.map(q => [q.d, q.r[i]]), PCOL[i], { lw: i === 1 || i === 6 ? 2.8 : 1.5, alpha: i === 1 || i === 6 ? 1 : 0.75 }));
  vguide(ctx, F.x(d), F.P.t, F.P.b);
  NAMES.forEach((n, i) => dot(ctx, F.x(d), F.y(row.r[i]), PCOL[i], 3.8));
  ({ ctx, W, H } = fitCanvas($('c4b')));
  hbars(ctx, W, { top: 16, rowH: (H - 50) / 7, title: t('c4b', { d: fmt(d, 2) }), max: 0.3, ticks: [0, 0.1, 0.2, 0.3], tickFmt: v => fmt(v, 1),
    rows: NAMES.map((n, i) => ({ label: n, value: row.r[i], color: PCOL[i], valueText: f3(row.r[i]) })) });
  $('r4').textContent = t('s4readout', { d: fmt(d, 2), order: orderStr(row.r), it: row.it, cross: d < 0.01 ? '' : t(row.r[1] > row.r[6] ? 's4crossAfter' : 's4crossBefore') });
}

/* ---------- step 5: link farms ---------- */
const s5 = { aLink: false };
const FARM = [false, true].map(extra => { const out = []; for (let m = 0; m <= 40; m++) { const g = M.build(M.withFarm(M.BASE, 'D', m, extra ? { from: 'A', to: 'D' } : null)); out.push(M.pagerank(g).r); } return out; });
const ALINK = FARM[1][0][3];
function draw5() {
  const m = num('m5'), r = FARM[s5.aLink ? 1 : 0][m], links = M.withFarm(M.BASE, 'D', m, s5.aLink ? { from: 'A', to: 'D' } : null);
  $('m5v').textContent = String(m); $('aLink').setAttribute('aria-pressed', String(s5.aLink));
  let { ctx, W, H } = fitCanvas($('c5a'));
  title(ctx, t('c5a', { m, extra: s5.aLink ? t('c5extra') : '' }), W, 16);
  const real = {}; NAMES.forEach((n, i) => { real[n] = links[n]; });
  graph(ctx, graphBox(W, H, 44), real, toMap(NAMES, r.slice(0, 7)), { vmax: 0.3, fakes: m, highlight: 'D', edgeColor: (a, b) => (s5.aLink && a === 'A' && b === 'D' ? C.orange : C.edge) });
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const F = frame(ctx, W, { top: 30, bottom: H - 28, left: 44, xMin: 0, xMax: 40, yMin: 0, yMax: 0.25, yTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], yFmt: v => fmt(v, 2),
    xTicks: [0, 10, 20, 30, 40], xFmt: v => String(v), title: t('c5b'), right: 16 });
  line(ctx, F, [[0, ALINK], [40, ALINK]], C.muted, { lw: 1.4, dash: [5, 4] });
  line(ctx, F, FARM[0].map((q, i) => [i, q[3]]), C.pink, { lw: 2.4 });
  if (s5.aLink) line(ctx, F, FARM[1].map((q, i) => [i, q[3]]), C.orange, { lw: 2.4 });
  vguide(ctx, F.x(m), F.P.t, F.P.b); dot(ctx, F.x(m), F.y(r[3]), s5.aLink ? C.orange : C.pink, 5.5);
  const rank = M.order(r.slice(0, 7)).indexOf(3) + 1;
  $('r5').textContent = t('s5readout', { m, extra: s5.aLink ? t('c5extra') : '', score: f3(r[3]), rank, alink: f3(ALINK) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('byIn').addEventListener('click', () => { s0.metric = 'in'; draw0(); });
  $('byPr').addEventListener('click', () => { s0.metric = 'pr'; draw0(); });
  $('pick0').addEventListener('change', draw0);
  $('w1').addEventListener('click', () => { stopAnim('s1'); s1.running = false; walk(1); draw1(); });
  $('w100').addEventListener('click', () => { stopAnim('s1'); s1.running = false; walk(100); draw1(); });
  $('wAuto').addEventListener('click', auto1);
  $('reset1').addEventListener('click', reset1);
  $('k2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', play2);
  [['vNormal', 'normal'], ['vTrap', 'trap'], ['vDead', 'deadend']].forEach(([id, k]) => $(id).addEventListener('click', () => { s3.variant = k; draw3(); }));
  $('d3').addEventListener('input', draw3);
  $('d4').addEventListener('input', draw4);
  $('m5').addEventListener('input', draw5);
  $('aLink').addEventListener('click', () => { s5.aLink = !s5.aLink; draw5(); });

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
