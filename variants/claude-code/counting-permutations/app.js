'use strict';
// Permutations & combinations lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count and probability comes from window.CP_MODEL (model.js). People are drawn as coloured squares
// (their letters live in the DOM legend), so canvas text is limited to titles, ticks, town letters and counts.
(function () {

const $ = id => document.getElementById(id);
const M = window.CP_MODEL;
const t = (...a) => window.CP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', off: '#3a4a5e', faint: 'rgba(103,215,249,0.3)' };
const PEOPLE = ['#67d7f9', '#ffb454', '#7ee2a8', '#ff7a93', '#b79cff', '#ffd27a', '#5fb3ff', '#f28fdc', '#9be36b', '#e8edf4'];
const LETTERS = 'ABCDEFGHIJ';
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const trim = s => (s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const big = v => { const s = String(v); return s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s; };
const pct = v => trim((100 * v).toFixed(1)) + '%';

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function label(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const dot = (ctx, X, Y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } };
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// A row of boxes, each with a number centred in it (seat choices). Font shrinks to the box.
function numberBoxes(ctx, nums, x0, y, bw, bh, gap, styleOf) {
  nums.forEach((v, i) => {
    const X = x0 + i * (bw + gap), st = styleOf(i);
    ctx.save(); rrect(ctx, X, y, bw, bh, 6); ctx.fillStyle = st.fill; ctx.fill(); ctx.strokeStyle = st.stroke; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    label(ctx, String(v), X + bw / 2, y + bh / 2 + 5, bw - 6, { size: Math.min(15, bh * 0.5), weight: 700, color: st.text, align: 'center' });
  });
}
function legendPeople(id, n) { $(id).innerHTML = Array.from({ length: n }, (_, i) => `<span class="lg"><span class="sw sw-person" style="background:${PEOPLE[i]}"></span><span>${LETTERS[i]}</span></span>`).join(''); }

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: routes and the multiplication principle ---------- */
const s0 = { idx: 0, done: new Set([0]) };
const legs0 = () => [num('a0'), num('b0'), num('c0in')];
function draw0() {
  const [a, b, c] = legs0(), R = M.routes(a, b, c), N = R.length, cur = R[s0.idx] || R[0];
  $('a0v').textContent = String(a); $('b0v').textContent = String(b); $('c0v').textContent = String(c);
  const { ctx, W, H } = fitCanvas($('c0'));
  label(ctx, t('c0map'), 8, 17, W - 16);
  // map: four towns, roads drawn as arcs fanning out between neighbours
  const towns = [0, 1, 2, 3].map(i => [28 + i * (W - 56) / 3, 104]);
  const legs = [a, b, c];
  legs.forEach((r, L) => {
    const [x0, y0] = towns[L], [x1] = towns[L + 1], mx = (x0 + x1) / 2;
    for (let i = 1; i <= r; i++) {
      const off = (i - (r + 1) / 2) * 30, on = cur[L] === i;
      ctx.save(); ctx.strokeStyle = on ? C.cyan : C.axis; ctx.lineWidth = on ? 3.4 : 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, y0 + off * 2, x1, y0); ctx.stroke(); ctx.restore();
      const ay = y0 + off; dot(ctx, mx, ay, 8, C.bg, on ? C.cyan : C.axis);
      label(ctx, String(i), mx, ay + 4, 12, { size: 10, weight: 700, color: on ? C.cyan : C.muted, align: 'center' });
    }
  });
  towns.forEach(([X, Y], i) => { dot(ctx, X, Y, 13, '#1d2a3a', C.orange); label(ctx, 'ABCD'[i], X, Y + 5, 20, { size: 13, weight: 700, color: C.orange, align: 'center' }); });
  // tree: root, three levels, N leaves
  const top = 214, bot = H - 30;
  label(ctx, t('c0tree', { N }), 8, top - 14, W - 16);
  const lx = i => 14 + (N === 1 ? (W - 28) / 2 : i * (W - 28) / (N - 1));
  const ys = [top + 6, top + 6 + (bot - top) / 3, top + 6 + 2 * (bot - top) / 3, bot];
  const span = [N, b * c, c, 1];   // leaves under one node at each level (leaves are in lexicographic order)
  const nodeX = (level, idx) => (lx(idx * span[level]) + lx(idx * span[level] + span[level] - 1)) / 2;
  const edge = (x0, y0, x1, y1, col, lw) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
  const pathOf = q => { const [i, j] = R[q]; return [0, i - 1, (i - 1) * b + (j - 1), q]; };
  const drawRoute = (q, col, lw) => { const pi = pathOf(q); for (let L = 0; L < 3; L++) edge(nodeX(L, pi[L]), ys[L], nodeX(L + 1, pi[L + 1]), ys[L + 1], col, lw); };
  for (let q = 0; q < N; q++) drawRoute(q, C.grid, 1);
  s0.done.forEach(q => { if (q !== s0.idx && q < N) drawRoute(q, C.faint, 1.6); });
  drawRoute(s0.idx, C.cyan, 3);
  for (let q = 0; q < N; q++) dot(ctx, lx(q), bot, Math.max(2, Math.min(5, (W - 28) / N / 2.5)), s0.done.has(q) ? (q === s0.idx ? C.cyan : 'rgba(103,215,249,0.6)') : C.off);
  dot(ctx, nodeX(0, 0), ys[0], 5, C.orange);
  $('r0').textContent = t('s0readout', { a, b, c, N, i: s0.idx + 1, x: cur[0], y: cur[1], z: cur[2], m: [...s0.done].filter(q => q < N).length });
}
function reset0() { stopAnim('s0'); s0.idx = 0; s0.done = new Set([0]); }

/* ---------- step 1: everyone in a row, n! ---------- */
const s1 = { reveal: Infinity };
function draw1() {
  const n = num('n1'); $('n1v').textContent = String(n); legendPeople('lg1', n);
  $('play1').disabled = n > 4;
  const { ctx, W, H } = fitCanvas($('c1'));
  label(ctx, t('c1seats'), 8, 17, W - 16);
  const gap = 6, bw = Math.min(54, (W - 16 - gap * (n - 1)) / n), x0 = (W - (n * bw + (n - 1) * gap)) / 2;
  numberBoxes(ctx, M.factors(n, n), x0, 30, bw, 40, gap, () => ({ fill: '#15283a', stroke: C.cyan, text: C.cyan }));
  const top = 112;
  if (n <= 4) {
    const all = M.orderedPicks(n, n), shown = Math.min(all.length, s1.reveal);
    label(ctx, t('c1list', { N: all.length }), 8, top - 12, W - 16);
    // largest square size (14–30 px) whose grid of strips still fits the panel
    let sq = 30, tw, cellW, cols, cellH;
    for (; sq >= 14; sq--) {
      tw = n * sq + (n - 1) * 3; cellW = tw + Math.max(16, sq); cols = Math.max(1, Math.floor((W - 16) / cellW)); cellH = sq + Math.max(10, sq * 0.6);
      if (Math.ceil(all.length / cols) * cellH <= H - top - 8) break;
    }
    sq = Math.max(sq, 14);
    const usedCols = Math.min(cols, all.length), startX = (W - usedCols * cellW) / 2 + 8;
    all.forEach((p, i) => {
      const cx = startX + (i % cols) * cellW, cy = top + Math.floor(i / cols) * cellH;
      p.forEach((person, j) => { ctx.save(); ctx.globalAlpha = i < shown ? 1 : 0.12; ctx.fillStyle = PEOPLE[person]; rrect(ctx, cx + j * (sq + 3), cy, sq, sq, 3); ctx.fill(); ctx.restore(); });
    });
  } else {
    // growth of m! for m = 1..10, on a log scale
    label(ctx, t('c1growth'), 8, top - 12, W - 16);
    const TICKS = [1, 100, 1e4, 1e6];
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
    const L = 8 + Math.ceil(Math.max(...TICKS.map(v => ctx.measureText(big(v)).width))) + 6, Rr = W - 12, B = H - 40, T = top + 4, ymax = 7;
    const y = v => B - Math.log10(v) / ymax * (B - T);
    TICKS.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(L, y(v)); ctx.lineTo(Rr, y(v)); ctx.stroke(); ctx.fillText(big(v), L - 6, y(v) + 4); });
    ctx.restore();
    const bw2 = (Rr - L) / 10;
    for (let m = 1; m <= 10; m++) {
      const v = M.fact(m), X = L + (m - 0.5) * bw2, on = m === n;
      ctx.fillStyle = on ? C.cyan : 'rgba(103,215,249,0.35)'; ctx.fillRect(X - bw2 * 0.32, y(Math.max(1, v)), bw2 * 0.64, B - y(Math.max(1, v)) + (v === 1 ? 2 : 0));
      label(ctx, String(m), X, B + 15, bw2, { size: on ? 12 : 11, weight: on ? 700 : 400, color: on ? C.text : C.muted, align: 'center' });
    }
    label(ctx, t('c1axis'), (L + Rr) / 2, H - 8, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  }
  const f = M.fact(n);
  $('r1').textContent = t('s1readout', { n, prod: M.factors(n, n).join(' × '), N: big(f) }) + (n <= 4 ? t('s1listed', { N: f, s: Math.min(f, s1.reveal) }) : t('s1tooMany', { N: big(f) }));
}

/* ---------- step 2: k seats from n people ---------- */
function draw2() {
  const n = num('n2'), kIn = $('k2'); if (Number(kIn.max) !== n) { kIn.max = n; if (num('k2') > n) kIn.value = n; }
  const k = num('k2'); $('n2v').textContent = String(n); $('k2v').textContent = String(k);
  const { ctx, W } = fitCanvas($('c2'));
  label(ctx, t('c2title', { n, k }), 8, 17, W - 16);
  const gap = 6, bw = Math.min(54, (W - 16 - gap * (n - 1)) / n), x0 = (W - (n * bw + (n - 1) * gap)) / 2;
  numberBoxes(ctx, M.factors(n, n), x0, 34, bw, 44, gap, i => (i < k ? { fill: '#15283a', stroke: C.cyan, text: C.cyan } : { fill: '#121a24', stroke: C.off, text: C.muted }));
  // brackets under the used part and the cut-off part
  const brace = (i0, i1, col, Y) => {
    if (i1 < i0) return;
    const xa = x0 + i0 * (bw + gap), xb = x0 + i1 * (bw + gap) + bw;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xa, Y - 6); ctx.lineTo(xa, Y); ctx.lineTo(xb, Y); ctx.lineTo(xb, Y - 6); ctx.stroke(); ctx.restore();
  };
  brace(0, k - 1, C.cyan, 92); brace(k, n - 1, C.off, 92);
  label(ctx, t('c2used', { k, A: big(M.perm(n, k)) }), 8, 124, W - 16, { size: 12, weight: 600, color: C.cyan });
  label(ctx, t('c2cut', { r: n - k, F: big(M.fact(n - k)) }), 8, 148, W - 16, { size: 12, weight: 600, color: C.muted });
  label(ctx, t('c2all', { n, F: big(M.fact(n)) }), 8, 172, W - 16, { size: 12, weight: 600, color: C.text });
  label(ctx, t('c2eq', { n, k, r: n - k, A: big(M.perm(n, k)), F: big(M.fact(n)), G: big(M.fact(n - k)) }), 8, 204, W - 16, { size: 13, weight: 700, color: C.orange });
  const prod = k ? M.factors(n, k).join(' × ') : t('emptyProd');
  $('r2').textContent = t('s2readout', { n, k, prod, A: big(M.perm(n, k)), r: n - k, F: big(M.fact(n)), G: big(M.fact(n - k)) }) + (k === n ? t('s2zero') : '');
}

/* ---------- step 3: group ordered picks by who was chosen ---------- */
const s3 = { t: 0 };
function layout3(n, k, W, H) {
  const g = M.groupBySet(n, k), A = g.picks.length, kf = M.fact(k), top = 34, availH = H - top - 10, availW = W - 16;
  // choose the largest square size that fits both layouts
  let sq = 22, best = null;
  for (; sq >= 6; sq--) {
    const tw = k * sq + (k - 1) * 2 + 8, th = sq + 8;
    const cols = Math.max(1, Math.floor(availW / tw)), rowsU = Math.ceil(A / cols);
    const gw = kf * tw + 10, gcols = Math.max(1, Math.floor(availW / gw)), rowsG = Math.ceil(g.rows.length / gcols);
    if (rowsU * th <= availH && rowsG * (th + 4) <= availH) { best = { tw, th, cols, gw, gcols }; break; }
  }
  if (!best) { sq = 6; const tw = k * 6 + (k - 1) * 2 + 8, th = 14; best = { tw, th, cols: Math.floor(availW / tw), gw: kf * tw + 10, gcols: Math.max(1, Math.floor(availW / (kf * tw + 10))) }; }
  const { tw, th, cols, gw, gcols } = best;
  const ux = (W - Math.min(cols, A) * tw) / 2, gx = (W - Math.min(gcols, g.rows.length) * gw) / 2 + 5;
  const posU = i => [ux + (i % cols) * tw, top + Math.floor(i / cols) * th];
  const posG = new Array(A);
  g.rows.forEach((row, r) => row.idx.forEach((i, j) => { posG[i] = [gx + (r % gcols) * gw + j * tw, top + Math.floor(r / gcols) * (th + 4)]; }));
  return { g, sq, tw, th, gw, gcols, gx, top, posU, posG };
}
function draw3() {
  const n = num('n3'), kIn = $('k3'); kIn.max = Math.min(3, n); if (num('k3') > n) kIn.value = n;
  const k = num('k3'); $('n3v').textContent = String(n); $('k3v').textContent = String(k); legendPeople('lg3', n);
  const { ctx, W, H } = fitCanvas($('c3'));
  const L = layout3(n, k, W, H), e = s3.t < 0.5 ? 2 * s3.t * s3.t : 1 - Math.pow(-2 * s3.t + 2, 2) / 2;
  label(ctx, t(s3.t >= 1 ? 'c3grouped' : 'c3ordered', { A: L.g.picks.length, C: L.g.rows.length, kf: M.fact(k) }), 8, 17, W - 16);
  if (s3.t >= 1) L.g.rows.forEach((row, r) => { const X = L.gx + (r % L.gcols) * L.gw - 4, Y = L.top + Math.floor(r / L.gcols) * (L.th + 4) - 3; ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; rrect(ctx, X, Y, M.fact(k) * L.tw + 2, L.sq + 6, 5); ctx.stroke(); ctx.restore(); });
  L.g.picks.forEach((p, i) => {
    const [ax, ay] = L.posU(i), [bx, by] = L.posG[i], X = ax + (bx - ax) * e, Y = ay + (by - ay) * e;
    p.forEach((person, j) => { ctx.fillStyle = PEOPLE[person]; rrect(ctx, X + j * (L.sq + 2), Y, L.sq, L.sq, 2); ctx.fill(); });
  });
  const A = L.g.picks.length, Cn = L.g.rows.length, kf = M.fact(k);
  $('r3').textContent = t('s3readout', { n, k, A, kf, C: Cn }) + t(s3.t >= 1 ? 's3grouped' : 's3ordered', { kf });
}

/* ---------- step 4: does order matter? ---------- */
const s4 = { sc: 0, checked: false, solved: new Set() };
function draw4() {
  const s = M.SCENARIOS[s4.sc], A = M.perm(s.n, s.k), Cc = M.comb(s.n, s.k);
  document.querySelectorAll('[data-sc]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.sc) === s4.sc)));
  $('scText').textContent = t('sc' + s4.sc + 'q');
  const { ctx, W, H } = fitCanvas($('c4'));
  label(ctx, t('c4title', { n: s.n, k: s.k }), 8, 17, W - 16);
  const L = 12, R = W - 12, maxW = R - L, rows = [{ v: A, col: C.orange, key: 'c4A', on: s.ordered }, { v: Cc, col: C.cyan, key: 'c4C', on: !s.ordered }];
  rows.forEach((r, i) => {
    const Y = 40 + i * 80;
    label(ctx, t(r.key, { n: s.n, k: s.k, v: big(r.v) }), L, Y + 12, maxW, { size: 12, weight: 600, color: s4.checked && r.on ? C.text : C.muted });
    const w = Math.max(2, maxW * r.v / A);
    ctx.save(); ctx.globalAlpha = s4.checked && !r.on ? 0.35 : 1; ctx.fillStyle = r.col; ctx.fillRect(L, Y + 22, w, 26);
    if (s4.checked && r.on) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(L, Y + 22, w, 26); }
    ctx.restore();
  });
  label(ctx, t('c4ratio', { kf: M.fact(s.k), k: s.k }), L, H - 14, maxW, { size: 11, weight: 400, color: C.muted });
  $('r4').textContent = t('s4readout', { c: s4.solved.size });
}
function check4() {
  const s = M.SCENARIOS[s4.sc], choice = document.querySelector('input[name="ord"]:checked');
  if (!choice) { $('fb4').textContent = t('pickFirst'); $('fb4').dataset.state = 'none'; $('fb4').style.color = C.orange; return; }
  const right = (choice.value === 'yes') === s.ordered;
  if (right) s4.solved.add(s4.sc);
  s4.checked = true;
  $('fb4').textContent = t(right ? 'right' : 'notQuite') + t('sc' + s4.sc + 'why') + t(s.ordered ? 'ansA' : 'ansC', { n: s.n, k: s.k, v: big(M.answer(s)) });
  $('fb4').dataset.state = right ? 'correct' : 'wrong'; $('fb4').style.color = right ? C.green : C.orange;
  draw4();
}
function pick4(i) { s4.sc = i; s4.checked = false; document.querySelectorAll('input[name="ord"]').forEach(r => { r.checked = false; }); $('fb4').textContent = ''; draw4(); }

/* ---------- step 5: the birthday problem ---------- */
const s5 = { sims: new Map(), seed: 500 };
function draw5() {
  const n = num('n5'); $('n5v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c5'));
  const P = { l: 44, r: W - 12, t: 30, b: H - 42 };
  const x = v => P.l + (v - 0) / 80 * (P.r - P.l), y = v => P.b - v * (P.b - P.t);
  label(ctx, t('c5title'), 8, 18, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [0, 0.25, 0.5, 0.75, 1].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(trim(v.toFixed(2)), P.l - 6, y(v) + 4); });
  let lastR = -Infinity; ctx.textAlign = 'center';
  [0, 10, 20, 30, 40, 50, 60, 70, 80].forEach(v => { const s = String(v), w = ctx.measureText(s).width, X = Math.min(x(v), W - w / 2 - 2); if (X - w / 2 < lastR + 6) return; ctx.fillText(s, X, P.b + 15); lastR = X + w / 2; });
  ctx.strokeStyle = C.orange; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(P.l, y(0.5)); ctx.lineTo(P.r, y(0.5)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; ctx.beginPath(); for (let m = 1; m <= 80; m++) { const X = x(m), Y = y(M.shared(m)); if (m === 1) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke();
  ctx.restore();
  s5.sims.forEach((h, m) => dot(ctx, x(m), y(h / 100), 3.6, C.text));
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.5)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x(n), P.t); ctx.lineTo(x(n), P.b); ctx.stroke(); ctx.restore();
  dot(ctx, x(n), y(M.shared(n)), 5.5, C.cyan, C.bg);
  label(ctx, t('c5axis'), (P.l + P.r) / 2, H - 10, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  const q = M.allDifferent(n), h = s5.sims.get(n);
  $('r5').textContent = t('s5readout', { n, top: n <= 3 ? Array.from({ length: n }, (_, i) => 365 - i).join(' × ') : `365 × 364 × … × ${365 - n + 1}`, q: q.toFixed(4), p: (1 - q).toFixed(4), pc: pct(1 - q), pairs: M.comb(n, 2) })
    + (h !== undefined ? t('s5sim', { h, n }) : '');
}

function refreshAll() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['a0', 'b0', 'c0in'].forEach(id => $(id).addEventListener('input', () => { reset0(); draw0(); }));
  $('next0').addEventListener('click', () => { stopAnim('s0'); const N = M.routes(...legs0()).length; s0.idx = (s0.idx + 1) % N; s0.done.add(s0.idx); draw0(); });
  $('list0').addEventListener('click', () => {
    const N = M.routes(...legs0()).length; s0.done = new Set([0]); s0.idx = 0;
    animate('s0', Math.min(6000, 240 * N), q => { const i = Math.min(N - 1, Math.floor(q * N)); for (let j = 0; j <= i; j++) s0.done.add(j); s0.idx = i; draw0(); });
  });
  $('n1').addEventListener('input', () => { stopAnim('s1'); s1.reveal = Infinity; draw1(); });
  $('play1').addEventListener('click', () => {
    const N = M.fact(num('n1')); s1.reveal = 0;
    animate('s1', Math.min(4800, 220 * N), q => { s1.reveal = q >= 1 ? N : Math.floor(q * N) + 1; draw1(); });
  });
  ['n2', 'k2'].forEach(id => $(id).addEventListener('input', draw2));
  ['n3', 'k3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); s3.t = 0; draw3(); }));
  $('group3').addEventListener('click', () => { const from = s3.t; animate('s3', 1400, q => { s3.t = from + (1 - from) * q; draw3(); }); });
  $('ungroup3').addEventListener('click', () => { stopAnim('s3'); s3.t = 0; draw3(); });
  document.querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => pick4(Number(b.dataset.sc))));
  $('check4').addEventListener('click', check4);
  $('n5').addEventListener('input', draw5);
  $('sim5').addEventListener('click', () => { const n = num('n5'); s5.sims.set(n, M.simulateRooms(n, 100, s5.seed++)); draw5(); });
  $('clear5').addEventListener('click', () => { s5.sims.clear(); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refreshAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshCounting = () => { refreshAll(); if (s4.checked) { /* keep the feedback in the new language */ const st = $('fb4').dataset.state; if (st === 'correct' || st === 'wrong') check4(); } if ($('fb4').dataset.state === 'none') $('fb4').textContent = t('pickFirst'); };
  refreshAll();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
