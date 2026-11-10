'use strict';
// Word-embedding lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, bar, map position and ranking comes from window.EMB_MODEL (model.js). Canvas text is limited
// to panel titles, row/column labels in fixed slots, corpus words in their own boxes, and axis ticks; map
// labels are placed by a small collision search. Legends and readouts live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EMB_MODEL;
const I18N = window.LESSON_I18N;
const t = (...a) => I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', node: '#182433', rawbar: '#7b8ba0', ghost: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) = "90" stays "90"); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fixed = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const word = i => M.VOCAB[i][I18N.getLang() === 'zh' ? 1 : 0];
const sentence = s => M.CORPUS[s].map(word).join(' ');

const C2 = M.counts(M.CORPUS.length, 2), P2 = M.ppmi(C2);
const PRONOUNS = new Set(['he', 'she', 'it'].map(w => M.ID[w]));

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
function fitFont(ctx, text, maxW, base, weight = '') {
  let size = base;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  return size;
}
function title(ctx, text, X, Y, maxW) { ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; fitFont(ctx, text, maxW, 12, '600'); ctx.fillText(text, X, Y); ctx.restore(); }
function niceTicks(lo, hi, maxCount) {
  const span = hi - lo, raw = span / Math.max(1, maxCount), mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || 10 * mag;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return out;
}
function dot(ctx, X, Y, r, fill, stroke, lw = 2) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }

// Horizontal bar chart: rows of labels on the left, 1–2 bars per row, x ticks below.
// series: [{color, values[]}], rows: [label]; returns the bottom y.
function hbars(ctx, W, o) {
  const n = o.rows.length, labelW = Math.min(76, Math.max(46, W * 0.2)), l = 8 + labelW + 6, r = W - 14;
  const rowH = Math.min(o.maxRow || 24, (o.bottom - o.top) / Math.max(1, n));
  const x = v => l + v / o.xMax * (r - l);
  if (o.title) title(ctx, o.title, 8, o.top - 10, W - 16);
  ctx.save();
  const ticks = o.xTicks || niceTicks(0, o.xMax, W < 360 ? 3 : 5);
  ctx.font = '11px system-ui,sans-serif'; ctx.textBaseline = 'alphabetic';
  const yEnd = o.top + rowH * n;
  ticks.forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), o.top); ctx.lineTo(x(v), yEnd); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(fmt(v), x(v), yEnd + 14); });
  let size = 12; o.rows.forEach(lb => { size = Math.min(size, fitFont(ctx, lb, labelW, 12)); });
  const k = o.series.length, bh = Math.max(3, Math.min(9, (rowH - 4) / k));
  o.rows.forEach((lb, i) => {
    const yc = o.top + rowH * (i + 0.5);
    ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = o.rowColor ? o.rowColor(i) : C.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(lb, l - 6, yc);
    o.series.forEach((s, j) => { const v = s.values[i]; if (!v) return; const y0 = yc - (k * bh) / 2 + j * bh; ctx.fillStyle = s.color; ctx.fillRect(x(0), y0, Math.max(1.5, x(Math.min(v, o.xMax)) - x(0)), bh - 1); });
  });
  ctx.restore();
  return yEnd;
}

/* ---------- animation runner ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

function fillSelect(sel, ids) { const cur = sel.value; sel.innerHTML = ''; ids.forEach(i => { const o = document.createElement('option'); o.value = String(i); o.textContent = word(i); sel.appendChild(o); }); if (cur !== '') sel.value = cur; }
const ALL = M.VOCAB.map((_, i) => i);

/* ---------- step 0: one-hot ---------- */
function draw0() {
  const a = num('a0'), b = num('b0'), A = M.oneHot(a), B = M.oneHot(b), prod = A.map((v, i) => v * B[i]);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0'), 8, 18, W - 16);
  const labelW = Math.min(80, W * 0.24), l = 8 + labelW + 6, r = W - 10, cw = (r - l) / M.V, ch = Math.min(26, cw * 1.6 + 6);
  const rows = [['A ' + word(a), A, C.cyan], ['B ' + word(b), B, C.orange], [t('rowProd'), prod, C.green]];
  ctx.save();
  rows.forEach(([lb, vec, col], k) => {
    const y = 34 + k * (ch + 10);
    ctx.fillStyle = C.text; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; fitFont(ctx, lb, labelW, 12, '600'); ctx.fillText(lb, l - 6, y + ch / 2);
    vec.forEach((v, i) => { ctx.fillStyle = v ? col : C.node; ctx.fillRect(l + i * cw + 0.5, y, cw - 1, ch); });
  });
  const yT = 34 + 3 * (ch + 10) + 4;
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  [1, 10, 20, 29].forEach(n => ctx.fillText(String(n), l + (n - 0.5) * cw, yT + 10));
  ctx.restore();
  const same = a === b;
  $('r0').textContent = t('s0readout', { a: word(a), b: word(b), d: fmt(M.dot(A, B), 0), c: fmt(M.cosine(A, B), 3), e: fmt(M.dist(A, B), 3), note: t(same ? 's0same' : 's0diff') });
}

/* ---------- step 1: counting neighbours ---------- */
const s1 = { k: 0 };
function draw1() {
  const tg = num('t1'), w = num('w1'), N = M.CORPUS.length, k = s1.k;
  $('w1v').textContent = String(w);
  const Ck = M.counts(k, w);
  const rowsIds = ALL.filter(j => C2[tg][j] > 0);
  const { ctx, W, H } = fitCanvas($('c1'));
  // current sentence: three word boxes with arcs for the pairs counted in the window
  if (k === 0) { title(ctx, t('c1none'), 8, 18, W - 16); }
  else {
    title(ctx, t('c1sent', { k }), 8, 18, W - 16);
    const S = M.CORPUS[k - 1], gap = Math.min(70, W * 0.12);
    ctx.save(); ctx.font = '600 14px system-ui,sans-serif';
    const widths = S.map(id => ctx.measureText(word(id)).width + 22), total = widths.reduce((p, q) => p + q, 0) + gap * (S.length - 1);
    let xx = (W - total) / 2; const yb = 92, bh = 30, cx = [];
    S.forEach((id, i) => { cx.push(xx + widths[i] / 2); xx += widths[i] + gap; });
    // arcs above the boxes
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
      if (j - i > w) continue;
      const hit = S[i] === tg || S[j] === tg, hgt = 14 + (j - i) * 16;
      ctx.strokeStyle = hit ? C.orange : C.rawbar; ctx.lineWidth = hit ? 2.4 : 1.6;
      ctx.beginPath(); ctx.moveTo(cx[i], yb); ctx.bezierCurveTo(cx[i], yb - hgt, cx[j], yb - hgt, cx[j], yb); ctx.stroke();
    }
    S.forEach((id, i) => {
      const X = cx[i] - widths[i] / 2;
      ctx.fillStyle = C.node; ctx.fillRect(X, yb, widths[i], bh); ctx.strokeStyle = id === tg ? C.orange : C.axis; ctx.lineWidth = id === tg ? 2 : 1; ctx.strokeRect(X, yb, widths[i], bh);
      ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word(id), cx[i], yb + bh / 2 + 1);
    });
    ctx.restore();
  }
  const maxC = Math.max(3, ...rowsIds.map(j => C2[tg][j]));
  hbars(ctx, W, { top: 166, bottom: H - 26, xMax: maxC, xTicks: Array.from({ length: maxC + 1 }, (_, i) => i), rows: rowsIds.map(word), series: [{ color: C.cyan, values: rowsIds.map(j => Ck[tg][j]) }], title: t('c1bars', { w: word(tg), k, n: N }) });
  const list = ALL.filter(j => Ck[tg][j] > 0).map(j => `${word(j)} ${Ck[tg][j]}`).join(I18N.getLang() === 'zh' ? '、' : ', ');
  $('r1').textContent = t('s1readout', { k, n: N, w, t: word(tg), list: list || t('s1empty') });
  $('one1').disabled = k >= N;
}

/* ---------- step 2: cosine on raw counts ---------- */
function draw2() {
  const a = num('a2'), b = num('b2'), A = C2[a], B = C2[b];
  const rowsIds = ALL.filter(j => A[j] > 0 || B[j] > 0);
  const { ctx, W, H } = fitCanvas($('c2'));
  hbars(ctx, W, { top: 30, bottom: H - 26, xMax: 3, xTicks: [0, 1, 2, 3], maxRow: 26, rows: rowsIds.map(word), series: [{ color: C.cyan, values: rowsIds.map(j => A[j]) }, { color: C.orange, values: rowsIds.map(j => B[j]) }], title: t('c2') });
  $('lg2').innerHTML = `<span class="lg"><span class="sw sw-cyan"></span><span>A ${word(a)}</span></span><span class="lg"><span class="sw sw-orange"></span><span>B ${word(b)}</span></span>`;
  const nn = M.neighbours(C2, a).slice(0, 3).map(o => `${word(o.j)} ${fixed(o.cos, 2)}`).join(I18N.getLang() === 'zh' ? '、' : ', ');
  $('r2').textContent = t('s2readout', { d: fmt(M.dot(A, B), 0), na: fixed(M.norm(A), 3), nb: fixed(M.norm(B), 3), c: fixed(M.cosine(A, B), 3), e: fixed(M.dist(A, B), 3), a: word(a), nn });
}

/* ---------- step 3: PPMI ---------- */
const sameKind = (i, j) => { const k = x => Math.floor(M.NOUNS.indexOf(x) / 2); return M.NOUNS.includes(i) && M.NOUNS.includes(j) && k(i) === k(j); };
function pairStats(X) {
  const rel = [], un = [];
  for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) { const i = M.NOUNS[a], j = M.NOUNS[b], c = M.cosine(X[i], X[j]); (sameKind(i, j) ? rel : un).push(c); }
  const mean = v => v.reduce((p, q) => p + q, 0) / v.length;
  return { rel: mean(rel), un: mean(un), nRel: rel.length, nUn: un.length };
}
const STATS3 = { raw: pairStats(C2), ppmi: pairStats(P2) };
function topContext(i) { let best = -1; ALL.forEach(j => { if (PRONOUNS.has(j) || j === M.ID.is) return; if (best < 0 || P2[i][j] > P2[i][best] + 1e-12) best = j; }); return best; }
function draw3() {
  const a = num('t3'), rowsIds = ALL.filter(j => C2[a][j] > 0), others = M.NOUNS.filter(j => j !== a);
  const { ctx, W, H } = fitCanvas($('c3'));
  const yEnd = hbars(ctx, W, { top: 30, bottom: 300, xMax: 3.5, xTicks: [0, 1, 2, 3], maxRow: 26, rows: rowsIds.map(word), series: [{ color: C.rawbar, values: rowsIds.map(j => C2[a][j]) }, { color: C.cyan, values: rowsIds.map(j => P2[a][j]) }], title: t('c3vec', { w: word(a) }), rowColor: i => (rowsIds[i] === M.ID.is ? C.orange : C.muted) });
  hbars(ctx, W, { top: yEnd + 50, bottom: H - 26, xMax: 1, xTicks: [0, 0.25, 0.5, 0.75, 1], maxRow: 26, rows: others.map(word), series: [{ color: C.rawbar, values: others.map(j => M.cosine(C2[a], C2[j])) }, { color: C.cyan, values: others.map(j => M.cosine(P2[a], P2[j])) }], title: t('c3cos', { w: word(a) }) });
  const top = topContext(a);
  $('r3').textContent = t('s3readout', { w: word(a), ri: C2[a][M.ID.is], pi: fixed(P2[a][M.ID.is], 2), top: word(top), rt: C2[a][top], pt: fixed(P2[a][top], 2), rr: fixed(STATS3.raw.rel, 2), pr: fixed(STATS3.ppmi.rel, 2), ru: fixed(STATS3.raw.un, 2), pu: fixed(STATS3.ppmi.un, 2) });
}

/* ---------- step 4: SVD map ---------- */
const NOUNVEC = M.NOUNS.map(i => P2[i]);
const Z4 = M.compress(NOUNVEC);
const s4 = { pair: [1, 2] };
function placeLabels(ctx, pts, bounds) {
  const placed = [];
  const hit = (b, c) => b.x0 < c.x1 && c.x0 < b.x1 && b.y0 < c.y1 && c.y0 < b.y1;
  pts.forEach(p => {
    const w = ctx.measureText(p.text).width, h = 13;
    const cands = [[9, -4], [-9 - w, -4], [-w / 2, -10], [-w / 2, 20], [9, 12], [-9 - w, 12], [9, -16], [-9 - w, -16], [-w / 2, -24], [-w / 2, 34]];
    let best = null;
    for (const [dx, dy] of cands) {
      const bx = { x0: p.X + dx, x1: p.X + dx + w, y0: p.Y + dy - h + 3, y1: p.Y + dy + 3 };
      if (bx.x0 < bounds.x0 || bx.x1 > bounds.x1 || bx.y0 < bounds.y0 || bx.y1 > bounds.y1) continue;
      if (placed.some(q => hit(bx, q))) continue;
      if (pts.some(q => q !== p && hit(bx, { x0: q.X - 5, x1: q.X + 5, y0: q.Y - 5, y1: q.Y + 5 }))) continue;
      best = { ...bx, tx: p.X + dx, ty: p.Y + dy }; break;
    }
    if (best) { placed.push(best); ctx.fillText(p.text, best.tx, best.ty); }
  });
}
function draw4() {
  const k = num('k4'), [i, j] = s4.pair;
  $('k4v').textContent = String(k);
  $('p12').setAttribute('aria-pressed', i === 1); $('p23').setAttribute('aria-pressed', i === 2);
  const xs = Z4.coords.map(c => c[i - 1]), ys = Z4.coords.map(c => c[j - 1]);
  const pad = (lo, hi) => { const m = (hi - lo) * 0.18 + 0.4; return [lo - m, hi + m]; };
  const [x0, x1] = pad(Math.min(...xs), Math.max(...xs)), [y0, y1] = pad(Math.min(...ys), Math.max(...ys));
  const { ctx, W, H } = fitCanvas($('c4'));
  const P = { l: 40, r: W - 14, t: 30, b: 330 };
  const X = v => P.l + (v - x0) / (x1 - x0) * (P.r - P.l), Y = v => P.b - (v - y0) / (y1 - y0) * (P.b - P.t);
  title(ctx, t('c4map', { i, j }), 8, P.t - 10, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  niceTicks(y0, y1, 4).forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText(fmt(v), P.l - 5, Y(v) + 4); });
  niceTicks(x0, x1, W < 360 ? 4 : 6).forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), P.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(fmt(v), X(v), P.b + 15); });
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  // same-kind pairs joined by a faint line
  for (let a = 0; a < 6; a += 2) { ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(xs[a]), Y(ys[a])); ctx.lineTo(X(xs[a + 1]), Y(ys[a + 1])); ctx.stroke(); }
  ctx.setLineDash([]);
  const pts = M.NOUNS.map((id, n) => ({ X: X(xs[n]), Y: Y(ys[n]), text: word(id) }));
  pts.forEach(p => dot(ctx, p.X, p.Y, 5.5, C.orange, C.bg, 1.5));
  ctx.fillStyle = C.text; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  placeLabels(ctx, pts, { x0: P.l + 2, x1: P.r - 2, y0: P.t + 2, y1: P.b - 2 });
  ctx.restore();
  // share bars
  const B = { l: 40, r: W - 14, t: 386, b: H - 28 };
  title(ctx, t('c4share'), 8, B.t - 10, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const shares = [1, 2, 3, 4, 5, 6].map(d => Z4.share(d) - Z4.share(d - 1));
  const by = v => B.b - v / 0.4 * (B.b - B.t);
  [0, 0.2, 0.4].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(B.l, by(v)); ctx.lineTo(B.r, by(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText((v * 100).toFixed(0) + '%', B.l - 5, by(v) + 4); });
  const slot = (B.r - B.l) / 6;
  shares.forEach((s, d) => { ctx.fillStyle = d < k ? C.cyan : C.ghost; ctx.fillRect(B.l + slot * d + slot * 0.2, by(s), slot * 0.6, B.b - by(s)); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(String(d + 1), B.l + slot * (d + 0.5), B.b + 15); });
  ctx.restore();
  const Xk = M.truncate(Z4.coords, k);
  let err = 0, agree = 0;
  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) if (a !== b) err = Math.max(err, Math.abs(M.cosine(Xk[a], Xk[b]) - M.cosine(NOUNVEC[a], NOUNVEC[b])));
    if (M.neighbours(NOUNVEC, a)[0].j === M.neighbours(Xk, a)[0].j) agree++;
  }
  $('r4').textContent = t('s4readout', { k, s: (Z4.share(k) * 100).toFixed(0), err: fixed(err, 2), agree });
}

/* ---------- step 5: analogies ---------- */
const ANALOGIES = [['king', 'man', 'woman', 'queen'], ['queen', 'woman', 'man', 'king'], ['man', 'king', 'queen', 'woman'], ['king', 'he', 'she', 'queen'], ['he', 'man', 'woman', 'she']].map(q => q.map(w => M.ID[w]));
function draw5() {
  const [a, b, c, e] = ANALOGIES[num('q5')], res = M.analogy(P2, a, b, c), r = res.r;
  const cols = [P2[a], P2[b].map(v => -v), P2[c], r, P2[e]];
  const heads = [word(a), '−' + word(b), '+' + word(c), t('colResult'), word(e)];
  const rowsIds = ALL.filter(j => cols.some(v => Math.abs(v[j]) > 1e-9));
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5grid'), 8, 20, W - 16);
  const labelW = Math.min(76, Math.max(46, W * 0.2)), l = 8 + labelW + 6, r0 = W - 10, cw = (r0 - l) / 5, top = 52;
  const rowH = Math.min(17, 330 / rowsIds.length);
  ctx.save(); ctx.textBaseline = 'middle';
  let hs = 12; heads.forEach(h => { hs = Math.min(hs, fitFont(ctx, h, cw - 4, 12, '600')); });
  heads.forEach((h, n) => { ctx.font = `600 ${hs}px system-ui,sans-serif`; ctx.fillStyle = n === 3 ? C.orange : C.text; ctx.textAlign = 'center'; ctx.fillText(h, l + cw * (n + 0.5), top - 10); });
  let ls = 12; rowsIds.forEach(j => { ls = Math.min(ls, fitFont(ctx, word(j), labelW, 12)); });
  rowsIds.forEach((j, m) => {
    const y = top + m * rowH;
    ctx.font = `${ls}px system-ui,sans-serif`; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(word(j), l - 6, y + rowH / 2);
    cols.forEach((v, n) => {
      const val = v[j], s = Math.min(1, Math.abs(val) / 3);
      ctx.fillStyle = Math.abs(val) < 1e-9 ? C.node : val > 0 ? `rgba(103,215,249,${0.15 + 0.85 * s})` : `rgba(255,122,147,${0.15 + 0.85 * s})`;
      ctx.fillRect(l + cw * n + 2, y + 1, cw - 4, rowH - 2);
    });
  });
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.strokeRect(l + cw * 3 + 1, top - 1, cw - 2, rowH * rowsIds.length + 2);
  ctx.restore();
  const ranked = res.ranked.slice(0, 5);
  const yTop = top + rowH * rowsIds.length + 56;
  hbars(ctx, W, { top: yTop, bottom: H - 26, xMax: 1, xTicks: [0, 0.25, 0.5, 0.75, 1], maxRow: 24, rows: ranked.map(o => word(o.j)), series: [{ color: C.cyan, values: ranked.map(o => Math.max(0, o.cos)) }], title: t('c5rank'), rowColor: i => (ranked[i].j === e ? C.orange : C.muted) });
  const rank = res.ranked.findIndex(o => o.j === e) + 1, top1 = res.ranked[0], sec = res.ranked[1];
  const verdict = top1.j === e ? t('s5hit', { exp: word(e) }) : t('s5miss', { exp: word(e), rank });
  $('r5').textContent = t('s5readout', { a: word(a), b: word(b), c: word(c), top: word(top1.j), cos: fixed(top1.cos, 3), second: word(sec.j), cos2: fixed(sec.cos, 3), verdict });
}

function relabel() {
  fillSelect($('a0'), ALL); fillSelect($('b0'), ALL);
  fillSelect($('t1'), [...M.NOUNS, M.ID.he, M.ID.she, M.ID.is]);
  fillSelect($('a2'), ALL); fillSelect($('b2'), ALL);
  fillSelect($('t3'), M.NOUNS);
  const q = $('q5'), cur = q.value; q.innerHTML = '';
  ANALOGIES.forEach(([a, b, c], n) => { const o = document.createElement('option'); o.value = String(n); o.textContent = `${word(a)} − ${word(b)} + ${word(c)}`; q.appendChild(o); });
  if (cur !== '') q.value = cur;
}
function refresh() { relabel(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  relabel();
  $('a0').value = M.ID.cat; $('b0').value = M.ID.dog; $('t1').value = M.ID.king; $('a2').value = M.ID.cat; $('b2').value = M.ID.dog; $('t3').value = M.ID.king; $('q5').value = '0';
  ['a0', 'b0'].forEach(id => $(id).addEventListener('change', draw0));
  $('t1').addEventListener('change', draw1);
  $('w1').addEventListener('input', draw1);
  $('one1').addEventListener('click', () => { stopAnim('s1'); s1.k = Math.min(M.CORPUS.length, s1.k + 1); draw1(); });
  $('all1').addEventListener('click', () => { const from = s1.k, N = M.CORPUS.length; animate('s1', (N - from) * 250, p => { s1.k = Math.min(N, from + Math.floor(p * (N - from) + 1e-9)); if (p >= 1) s1.k = N; draw1(); }); });
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.k = 0; draw1(); });
  ['a2', 'b2'].forEach(id => $(id).addEventListener('change', draw2));
  $('t3').addEventListener('change', draw3);
  $('p12').addEventListener('click', () => { s4.pair = [1, 2]; draw4(); }); $('p23').addEventListener('click', () => { s4.pair = [2, 3]; draw4(); });
  $('k4').addEventListener('input', draw4);
  $('q5').addEventListener('change', draw5);

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
