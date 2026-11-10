'use strict';
// Entropy lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every card, bar, tree, curve and readout comes from window.ENTROPY_MODEL (model.js).
// Canvas text is limited to panel titles and axis ticks; tick labels are placed with a collision check.
(function () {

const $ = id => document.getElementById(id);
const M = window.ENTROPY_MODEL;
const t = (...a) => window.ENTROPY_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', cell: '#1b2737' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s) || '0'; };
function fitCanvas(canvas, hOf) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = Math.round(hOf(width));
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

// Panel title: shrinks the font until it fits (never overflows).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Tick labels placed in priority order; a label that would touch an already placed one is skipped.
function placeLabels(ctx, items, axis, lo, hi) {
  const taken = [];
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const it of items) {
    const w = ctx.measureText(it.text).width;
    let a, b;
    if (axis === 'x') { a = it.pos - w / 2; b = it.pos + w / 2; if (a < lo) { a = lo; b = lo + w; } if (b > hi) { b = hi; a = hi - w; } }
    else { a = it.pos - 7; b = it.pos + 7; }
    if (taken.some(([p, q]) => a < q + 6 && b > p - 6)) continue;
    taken.push([a, b]);
    if (axis === 'x') { ctx.textAlign = 'left'; ctx.fillText(it.text, a, it.y); }
    else { ctx.textAlign = 'right'; ctx.fillText(it.text, it.x, it.pos + 4); }
  }
  ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Generic plot panel: title row above, y ticks on the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.restore();
  placeLabels(ctx, o.yTicks.map(v => ({ text: (o.yFmt || fmt)(v), pos: y(v), x: P.l - 6 })), 'y');
  if (o.xTicks) {
    const xs = [];
    if (Array.isArray(o.xTicks)) o.xTicks.forEach(v => { if (v >= o.xMin - 1e-9 && v <= o.xMax + 1e-9) xs.push(v); });
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200]); for (let v = Math.ceil(o.xMin / step - 1e-9) * step; v <= o.xMax + 1e-9; v += step) xs.push(v); }
    ctx.save(); ctx.strokeStyle = C.grid; xs.forEach(v => { ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); }); ctx.restore();
    placeLabels(ctx, xs.map(v => ({ text: (o.xFmt || fmt)(v), pos: x(v), y: P.b + 15 })), 'x', 2, W - 2);
  }
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function curve(ctx, m, xs, ys, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); xs.forEach((v, i) => { const X = m.x(v), Y = Math.max(m.P.t - 2, m.y(ys[i])); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.orange) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }
function arrow(ctx, x0, x1, Y, color, lw, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke();
  if (Math.abs(x1 - x0) > 4) { const s = Math.sign(x1 - x0), hs = 4 + lw; ctx.beginPath(); ctx.moveTo(x1, Y); ctx.lineTo(x1 - s * hs * 1.4, Y - hs); ctx.lineTo(x1 - s * hs * 1.4, Y + hs); ctx.closePath(); ctx.fill(); }
  ctx.restore();
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
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }


const SYMCOL = ['#ffb454', '#67d7f9', '#7ee2a8', '#b79cff', '#e8edf4', '#ff7a93'];
const symName = i => t('sym_' + M.SYMBOLS[i]);
function niceTicks(max, px, minPx = 28) {
  const step = niceStep(max, px, minPx, [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100]);
  const out = []; for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toFixed(6)); return out;
}
function hbar(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, w), h); }

/* ---------- step 0: the guessing game ---------- */
const s0 = { rng: M.mulberry32(808), game: null, shown: 0, counts: {}, games: 0, total: 0, cleared: false };
function draw0() {
  const N = num('n0'); $('n0v').textContent = String(N);
  const ROWS = 5;
  const { ctx, W, H } = fitCanvas($('c0'), () => 360);
  title(ctx, t('c0top'), 8, 17, W - 16);
  const L = 8, cw = (W - 16) / N, gap = Math.min(3, cw * 0.18), top = 26, ch = 20, rh = 15;
  const g = s0.game, done = g && s0.shown >= g.steps.length;
  for (let i = 0; i < N; i++) { ctx.fillStyle = done && i === g.secret ? C.orange : C.cyan; ctx.fillRect(L + i * cw + gap / 2, top, cw - gap, ch); }
  if (g) for (let r = 0; r < Math.min(s0.shown, g.steps.length); r++) {
    const st = g.steps[r], lo = st.yes ? st.lo : st.mid, hi = st.yes ? st.mid : st.hi, Y = top + ch + 8 + r * (rh + 4);
    for (let i = 0; i < N; i++) { const inRange = i >= lo && i < hi; ctx.fillStyle = inRange ? (hi - lo === 1 ? C.orange : C.cyan) : C.raw; ctx.globalAlpha = inRange ? 1 : 0.35; ctx.fillRect(L + i * cw + gap / 2, Y, cw - gap, rh); }
    ctx.globalAlpha = 1;
  }
  const maxQ = Math.ceil(Math.log2(32)), cnt = s0.counts, ymax = Math.max(1, ...Object.values(cnt)) * 1.15;
  const B = panel(ctx, W, { top: top + ch + 8 + ROWS * (rh + 4) + 30, bottom: H - 28, xMin: 0.4, xMax: maxQ + 0.6, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, 100, 24).filter(v => Number.isInteger(v)), xTicks: [1, 2, 3, 4, 5], xFmt: v => fmt(v, 0), title: t('c0bot') });
  const bw = (B.x(1) - B.x(0)) * 0.5;
  Object.keys(cnt).forEach(k => { const Y = B.y(cnt[k]); ctx.fillStyle = C.cyan; ctx.fillRect(B.x(+k) - bw / 2, Y, bw, B.y(0) - Y); });
  const avg = M.avgQuestions(N);
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(B.x(avg), B.P.t); ctx.lineTo(B.x(avg), B.P.b); ctx.stroke(); ctx.restore();
  const k = Math.floor(Math.log2(N)), pow = Math.pow(2, k) === N;
  const played = (s0.games ? t('s0played', { g: s0.games, m: fmt(s0.total / s0.games, 2) }) : '') + (s0.cleared ? ' ' + t('s0cleared') : '');
  $('r0').textContent = pow ? t('s0readoutPow', { N, lg: fmt(Math.log2(N), 3), k, played }) : t('s0readout', { N, lg: fmt(Math.log2(N), 3), k, k1: k + 1, avg: fmt(avg, 3), played });
}
function newGame() { const N = num('n0'), secret = Math.floor(s0.rng() * N); return { N, secret, steps: M.halving(N, secret) }; }
function record(g) { const q = g.steps.length; s0.counts[q] = (s0.counts[q] || 0) + 1; s0.games++; s0.total += q; s0.cleared = false; }

/* ---------- step 1: surprise ---------- */
function draw1() {
  const pa = num('pa'), pb = num('pb'), pab = pa * pb;
  $('pav').textContent = fmt(pa, 2); $('pbv').textContent = fmt(pb, 2);
  const { ctx, W } = fitCanvas($('c1'), () => 350);
  const A = panel(ctx, W, { top: 26, bottom: 160, xMin: 0, xMax: 1, yMin: 0, yMax: 9, yTicks: [0, 3, 6, 9], xTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c1top') });
  const xs = Array.from({ length: 400 }, (_, i) => 0.0025 + (1 - 0.0025) * i / 399);
  curve(ctx, A, xs, xs.map(M.surprise), C.text, 1.8);
  [[pab, C.green], [pb, C.orange], [pa, C.cyan]].forEach(([p, c]) => { vguide(ctx, A.x(p), A.y(M.surprise(p)), A.P.b, c); dot(ctx, A.x(p), A.y(M.surprise(p)), 5.5, c); });
  const row = (y0, ttl, a, b, ab, max, fmtv) => {
    title(ctx, ttl, 8, y0 - 8, W - 16);
    const x0 = 8, x1 = W - 8, sc = v => (x1 - x0) * v / max;
    hbar(ctx, x0, y0, sc(a), 14, C.cyan); hbar(ctx, x0 + sc(a), y0, sc(b), 14, C.orange);
    hbar(ctx, x0, y0 + 19, sc(ab), 14, C.green);
    placeLabels(ctx, [{ text: '0', pos: x0, y: y0 + 47 }, { text: fmtv(max), pos: x1, y: y0 + 47 }], 'x', 2, W - 2);
  };
  const ia = M.surprise(pa), ib = M.surprise(pb), iab = M.surprise(pab);
  row(196, t('c1mid'), ia, ib, iab, 9, v => fmt(v, 0) + ' bit');
  const ra = 1 / pa, rb = 1 / pb, rab = 1 / pab, mx = Math.max(ra + rb, rab);
  row(286, t('c1bot'), ra, rb, rab, mx, v => fmt(v, 1));
  $('r1').textContent = t('s1readout', { ia: fmt(ia, 3), ib: fmt(ib, 3), sum: fmt(ia + ib, 3), pab: fmt(pab, 4), iab: fmt(iab, 3), ra: fmt(ra, 2), rb: fmt(rb, 2), rsum: fmt(ra + rb, 2), rab: fmt(rab, 2) });
}

/* ---------- step 2: a coin ---------- */
const s2 = { seed: 0, runs: [], reveal: 1, p: null };
function draw2() {
  const p = num('p2'); $('p2v').textContent = fmt(p, 2);
  if (s2.p !== p) { s2.runs = []; s2.p = p; stopAnim('s2'); }
  const h = M.binaryH(p);
  const { ctx, W, H } = fitCanvas($('c2'), () => 430);
  const A = panel(ctx, W, { top: 26, bottom: 186, xMin: 0, xMax: 1, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c2top') });
  const xs = Array.from({ length: 201 }, (_, i) => i / 200);
  curve(ctx, A, xs, xs.map(M.binaryH), C.text, 2);
  const hh = p * M.surprise(p), X = A.x(p);
  ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(X, A.y(0)); ctx.lineTo(X, A.y(hh)); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(X, A.y(hh)); ctx.lineTo(X, A.y(h)); ctx.stroke(); ctx.restore();
  dot(ctx, X, A.y(h), 5, C.text);
  const N = 200, runs = s2.runs;
  const ymax = Math.max(1.2, h * 1.6, ...runs.map(r => Math.max(...r.slice(0, 200)))) * 1.05;
  const B = panel(ctx, W, { top: 230, bottom: H - 28, xMin: 1, xMax: N, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, H - 258, 26), xTicks: [1, 50, 100, 150, 200], xFmt: v => fmt(v, 0), title: t('c2bot') });
  hline(ctx, B, h, C.text);
  const ns = Array.from({ length: N }, (_, i) => i + 1);
  runs.forEach((r, j) => { const last = j === runs.length - 1, upto = last ? Math.max(1, Math.round(N * s2.reveal)) : N; curve(ctx, B, ns.slice(0, upto), Array.from(r.slice(0, upto)), last ? C.green : C.raw, last ? 2.2 : 1.3, null, last ? 1 : 0.7); });
  let run = '';
  if (runs.length) { const r = runs[runs.length - 1], upto = Math.max(1, Math.round(N * s2.reveal)); run = t('s2run', { n: upto, m: fmt(r[upto - 1], 3) }); }
  $('r2').textContent = t('s2readout', { p: fmt(p, 2), ih: fmt(M.surprise(p), 3), it: fmt(M.surprise(1 - p), 3), h: fmt(h, 3), run });
}

/* ---------- step 3: six kinds of weather ---------- */
function legend3() {
  $('lg3').innerHTML = M.SYMBOLS.map((_, i) => `<span class="lg"><span class="sw" style="background:${SYMCOL[i]}"></span><span>${symName(i)}</span></span>`).join('') + `<span class="lg"><span class="sw sw-ghost"></span><span>${t('lg3H')}</span></span>`;
}
function draw3() {
  const a = num('a3'), ps = M.source(a), h = M.entropy(ps), I = ps.map(M.surprise);
  $('a3v').textContent = fmt(a, 1); legend3();
  const { ctx, W, H } = fitCanvas($('c3'), () => 430);
  const ymax = Math.max(...ps) * 1.15;
  const A = panel(ctx, W, { top: 26, bottom: 166, xMin: -0.5, xMax: 5.5, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, 140, 24), xTicks: [0, 1, 2, 3, 4, 5], xFmt: v => symName(Math.round(v)), title: t('c3top') });
  const bw = (A.x(1) - A.x(0)) * 0.6;
  ps.forEach((p, i) => { ctx.fillStyle = SYMCOL[i]; ctx.fillRect(A.x(i) - bw / 2, A.y(p), bw, A.y(0) - A.y(p)); });
  const imax = Math.max(...I) * 1.08;
  const B = panel(ctx, W, { top: 210, bottom: H - 28, xMin: 0, xMax: 1, yMin: 0, yMax: imax, yTicks: niceTicks(imax, H - 238, 24), xTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c3bot') });
  let c = 0;
  ps.forEach((p, i) => { const x0 = B.x(c), x1 = B.x(c + p); ctx.fillStyle = SYMCOL[i]; ctx.globalAlpha = 0.85; ctx.fillRect(x0, B.y(I[i]), Math.max(0.5, x1 - x0), B.y(0) - B.y(I[i])); ctx.globalAlpha = 1; ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(x0, B.y(I[i]), x1 - x0, B.y(0) - B.y(I[i])); c += p; });
  hline(ctx, B, h, C.text, [6, 4]);
  const top = ps.indexOf(Math.max(...ps)), low = ps.indexOf(Math.min(...ps));
  $('r3').textContent = t('s3readout', { a: fmt(a, 1), h: fmt(h, 3), max: fmt(Math.log2(6), 3), top: symName(top), itop: fmt(I[top], 3), low: symName(low), ilow: fmt(I[low], 3) });
}

/* ---------- step 4: Huffman coding ---------- */
const s4 = { seed: 0, enc: null };
function draw4() {
  const a = num('a4'), ps = M.source(a), hf = M.huffman(ps), h = M.entropy(ps), l2 = M.blockAvg(ps, 2), l3 = M.blockAvg(ps, 3);
  $('a4v').textContent = fmt(a, 1);
  $('codeTable').innerHTML = `<thead><tr><th>${t('th_sym')}</th><th>${t('th_p')}</th><th>${t('th_i')}</th><th>${t('th_code')}</th><th>${t('th_len')}</th></tr></thead><tbody>` +
    ps.map((p, i) => `<tr><td><span class="sw" style="background:${SYMCOL[i]};margin-right:6px"></span>${symName(i)}</td><td>${fmt(p, 3)}</td><td>${fmt(M.surprise(p), 2)}</td><td class="code">${hf.codes[i]}</td><td>${hf.lengths[i]}</td></tr>`).join('') + '</tbody>';
  const { ctx, W, H } = fitCanvas($('c4'), () => 450);
  title(ctx, t('c4top'), 8, 17, W - 16);
  // tree layout: leaves get columns in DFS order, internal nodes sit above the middle of their children
  const leaves = []; const walk = (n, d) => { n.d = d; if (n.leaf !== undefined) { n.col = leaves.length; leaves.push(n); return; } n.kids.forEach(k => walk(k, d + 1)); n.col = (n.kids[0].col + n.kids[1].col) / 2; };
  walk(hf.root, 0);
  const maxD = Math.max(...leaves.map(n => n.d)), colW = (W - 32) / leaves.length, X = c => 16 + colW * (c + 0.5), lvl = (208 - 40) / Math.max(1, maxD), Y = d => 40 + d * lvl;
  const fix = n => { if (n.leaf === undefined) { n.kids.forEach(fix); n.col = (n.kids[0].col + n.kids[1].col) / 2; } }; fix(hf.root);
  const edges = n => { if (n.leaf !== undefined) return; n.kids.forEach((k, j) => { ctx.strokeStyle = j ? C.ghost : C.muted; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(n.col), Y(n.d)); ctx.lineTo(X(k.col), Y(k.d)); ctx.stroke(); edges(k); }); };
  edges(hf.root);
  const nodes = n => { if (n.leaf !== undefined) { dot(ctx, X(n.col), Y(n.d), 7, SYMCOL[n.leaf]); return; } dot(ctx, X(n.col), Y(n.d), 4, C.text); n.kids.forEach(nodes); };
  nodes(hf.root);
  ctx.save(); ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.text;
  leaves.forEach(n => { let s = symName(n.leaf); while (ctx.measureText(s).width > colW - 4 && s.length > 1) s = s.slice(0, -1); ctx.fillText(s, X(n.col), Y(n.d) + 22); });
  ctx.restore();
  const ymax = Math.ceil((h + 1.1) * 2) / 2;
  const B = panel(ctx, W, { top: 276, bottom: H - 28, xMin: 0.4, xMax: 3.6, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, H - 304, 24), xTicks: [1, 2, 3], xFmt: v => 'k = ' + fmt(v, 0), title: t('c4bot') });
  const Ls = [hf.avg, l2, l3], bw = (B.x(1) - B.x(0)) * 0.4;
  Ls.forEach((l, i) => { const k = i + 1; ctx.fillStyle = C.cyan; ctx.fillRect(B.x(k) - bw / 2, B.y(l), bw, B.y(0) - B.y(l)); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(B.x(k) - bw / 2 - 6, B.y(h + 1 / k)); ctx.lineTo(B.x(k) + bw / 2 + 6, B.y(h + 1 / k)); ctx.stroke(); });
  hline(ctx, B, h, C.ghost);
  const enc = s4.enc && s4.enc.a === a ? t('s4enc', { bits: s4.enc.bits, per: fmt(s4.enc.perSymbol, 3) }) : '';
  $('r4').textContent = t('s4readout', { a: fmt(a, 1), h: fmt(h, 3), l: fmt(hf.avg, 3), l2: fmt(l2, 3), l3: fmt(l3, 3), enc });
}

/* ---------- step 5: cross-entropy and KL ---------- */
const s5 = { zero: false };
function draw5() {
  const ap = num('ap5'), aq = num('aq5'), p = M.source(ap), q0 = M.source(aq), q = s5.zero ? M.withoutLast(q0) : q0;
  $('ap5v').textContent = fmt(ap, 1); $('aq5v').textContent = fmt(aq, 1); $('zero5').setAttribute('aria-pressed', String(s5.zero));
  const h = M.entropy(p), ce = M.crossEntropy(p, q);
  const { ctx, W, H } = fitCanvas($('c5'), () => 450);
  const lq = q.map(M.surprise), lp = p.map(M.surprise), finite = lq.concat(lp).filter(Number.isFinite), ymax = Math.max(4, ...finite) * 1.1;
  const A = panel(ctx, W, { top: 26, bottom: 214, xMin: 0, xMax: 1, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, 188, 24), xTicks: [0, 0.25, 0.5, 0.75, 1], title: t('c5top') });
  let c = 0;
  p.forEach((pi, i) => {
    const x0 = A.x(c), x1 = A.x(c + pi), hq = Number.isFinite(lq[i]) ? lq[i] : ymax;
    ctx.fillStyle = C.orange; ctx.globalAlpha = Number.isFinite(lq[i]) ? 0.75 : 0.35; ctx.fillRect(x0, A.y(hq), Math.max(0.5, x1 - x0), A.y(0) - A.y(hq)); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(x0, A.y(hq), x1 - x0, A.y(0) - A.y(hq));
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x0, A.y(lp[i])); ctx.lineTo(x1, A.y(lp[i])); ctx.stroke(); ctx.restore();
    c += pi;
  });
  const grid = Array.from({ length: 61 }, (_, i) => -1 + 3 * i / 60), ces = grid.map(g => M.crossEntropy(p, M.source(g)));
  const cmax = Math.max(...ces) * 1.05;
  const B = panel(ctx, W, { top: 258, bottom: H - 28, xMin: -1, xMax: 2, yMin: 0, yMax: cmax, yTicks: niceTicks(cmax, H - 286, 24), xTicks: [-1, -0.5, 0, 0.5, 1, 1.5, 2], title: t('c5bot') });
  hline(ctx, B, h, C.ghost);
  curve(ctx, B, grid, ces, C.text, 2, null, s5.zero ? 0.3 : 1);
  vguide(ctx, B.x(aq), B.P.t, B.P.b, C.orange);
  if (!s5.zero) dot(ctx, B.x(aq), B.y(ce), 5.5, C.orange);
  dot(ctx, B.x(ap), B.y(h), 4.5, C.cyan, true);
  $('r5').textContent = Number.isFinite(ce) ? t('s5readout', { h: fmt(h, 3), ce: fmt(ce, 3), kl: fmt(ce - h, 3) }) : t('s5inf', { h: fmt(h, 3), ph: fmt(p[5], 4) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('n0').addEventListener('input', () => { stopAnim('s0'); const had = s0.games > 0; s0.game = null; s0.shown = 0; s0.counts = {}; s0.games = 0; s0.total = 0; s0.cleared = had; draw0(); });
  $('play0').addEventListener('click', () => {
    finishAll();
    const g = newGame(); s0.game = g; s0.shown = 0;
    animate('s0', 450 * (g.steps.length + 1), p => { s0.shown = Math.floor(p * (g.steps.length + 1)); draw0(); }, () => { s0.shown = g.steps.length; record(g); draw0(); });
  });
  $('many0').addEventListener('click', () => {
    finishAll(); let done = 0;
    animate('s0', 1200, p => { const target = Math.round(p * 50); for (; done < target; done++) { const g = newGame(); record(g); s0.game = g; s0.shown = g.steps.length; } draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.game = null; s0.shown = 0; s0.counts = {}; s0.games = 0; s0.total = 0; s0.cleared = false; draw0(); });
  ['pa', 'pb'].forEach(id => $(id).addEventListener('input', draw1));
  $('p2').addEventListener('input', draw2);
  $('flip2').addEventListener('click', () => {
    finishAll(); s2.seed++; s2.runs.push(M.coinRun(num('p2'), 200, s2.seed)); if (s2.runs.length > 6) s2.runs.shift();
    animate('s2', 2000, p => { s2.reveal = p; draw2(); });
  });
  $('a3').addEventListener('input', draw3);
  $('a4').addEventListener('input', draw4);
  $('encode4').addEventListener('click', () => { s4.seed++; const ps = M.source(num('a4')); s4.enc = { a: num('a4'), ...M.encodeSample(ps, 1000, s4.seed) }; draw4(); });
  ['ap5', 'aq5'].forEach(id => $(id).addEventListener('input', draw5));
  $('zero5').addEventListener('click', () => { s5.zero = !s5.zero; draw5(); });

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
  { const g = newGame(); s0.game = g; s0.shown = g.steps.length; record(g); } // one finished game, so the halving rows are visible on arrival
  window.refreshEntropy = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
