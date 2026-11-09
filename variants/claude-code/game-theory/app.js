'use strict';
// Game theory lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every payoff, arrow, equilibrium and curve comes from window.GT_MODEL (model.js). Canvas text is limited to
// action names in reserved header cells, payoffs centred in their cells, region names and axis ticks.
(function () {

const $ = id => document.getElementById(id);
const M = window.GT_MODEL;
const t = (...a) => window.GT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', cell: '#16212e', cellOn: '#203246' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s.replace('-', '−'); };

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
function fitText(ctx, s, x, y, maxW, size = 13, weight = 600, color = C.text, align = 'center') {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(s).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(s, x, y); ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, tie) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  if (tie) { ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.7; }
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
  if (!tie) { const a = Math.atan2(y1 - y0, x1 - x0), L = 9; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - L * Math.cos(a - 0.45), y1 - L * Math.sin(a - 0.45)); ctx.lineTo(x1 - L * Math.cos(a + 0.45), y1 - L * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

/* ---------- action names ---------- */
const actName = (id, side, k) => (id === 'random' ? t(`random${k}${side}`) : t(`${id === 'family' ? 'pd' : id}${k}`));
const cellName = (id, i, j) => t('cellFmt', { r: actName(id, 'r', i), c: actName(id, 'c', j) });

/* ---------- the shared matrix painter ----------
   o: { sel: [i,j] | null, rowArrows: [j...] columns whose row arrow is shown, colArrows: [i...], faded: {r:[], c:[]}, ne: bool } */
function drawMatrix(canvas, id, g, o = {}) {
  const { ctx, W, H } = fitCanvas(canvas);
  const LW = Math.min(104, Math.max(64, W * 0.24)), top = 30, cw = (W - LW - 10) / 2, ch = (H - top - 8) / 2;
  const cx = j => LW + cw * (j + 0.5), cy = i => top + ch * (i + 0.5);
  for (let j = 0; j < 2; j++) fitText(ctx, actName(id, 'c', j), cx(j), top / 2, cw - 10, 13, 700, C.cyan);
  for (let i = 0; i < 2; i++) fitText(ctx, actName(id, 'r', i), LW - 8, cy(i), LW - 14, 13, 700, C.orange, 'right');
  const ne = o.ne ? M.pureNE(g) : [];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const x = LW + j * cw, y = top + i * ch, on = o.sel && o.sel[0] === i && o.sel[1] === j;
    ctx.fillStyle = on ? C.cellOn : C.cell; ctx.fillRect(x + 3, y + 3, cw - 6, ch - 6);
    if (on) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, cw - 8, ch - 8); }
    if (ne.some(([a, b]) => a === i && b === j)) { ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.strokeRect(x + 8.5, y + 8.5, cw - 17, ch - 17); }
    // payoff pair "a , b": orange right of the comma's left, cyan left of its right
    const size = Math.max(12, Math.min(19, cw / 6));
    ctx.save(); ctx.font = `700 ${size}px system-ui,sans-serif`; ctx.textBaseline = 'middle';
    ctx.textAlign = 'right'; ctx.fillStyle = C.orange; ctx.fillText(fmt(g.A[i][j]), cx(j) - 6, cy(i));
    ctx.textAlign = 'center'; ctx.fillStyle = C.muted; ctx.fillText(',', cx(j), cy(i));
    ctx.textAlign = 'left'; ctx.fillStyle = C.cyan; ctx.fillText(fmt(g.B[i][j]), cx(j) + 6, cy(i)); ctx.restore();
  }
  const rowArrow = (j, alpha) => { // Row compares A[0][j] and A[1][j]: vertical arrow across the middle line of column j
    const br = M.rowBR(g, j), yMid = top + ch, d = ch * 0.24;
    ctx.save(); ctx.globalAlpha = alpha;
    if (br.length === 2) arrow(ctx, cx(j), yMid - d, cx(j), yMid + d, C.orange, true);
    else if (br[0] === 0) arrow(ctx, cx(j), yMid + d, cx(j), yMid - d, C.orange); else arrow(ctx, cx(j), yMid - d, cx(j), yMid + d, C.orange);
    ctx.restore();
  };
  const colArrow = (i, alpha) => { // Column compares B[i][0] and B[i][1]: horizontal arrow under the payoffs of row i
    const br = M.colBR(g, i), xMid = LW + cw, d = cw * 0.24, y = cy(i) + ch * 0.27;
    ctx.save(); ctx.globalAlpha = alpha;
    if (br.length === 2) arrow(ctx, xMid - d, y, xMid + d, y, C.cyan, true);
    else if (br[0] === 0) arrow(ctx, xMid + d, y, xMid - d, y, C.cyan); else arrow(ctx, xMid - d, y, xMid + d, y, C.cyan);
    ctx.restore();
  };
  (o.faded ? o.faded.r : []).forEach(j => rowArrow(j, 0.3)); (o.faded ? o.faded.c : []).forEach(i => colArrow(i, 0.3));
  (o.rowArrows || []).forEach(j => rowArrow(j, 1)); (o.colArrows || []).forEach(i => colArrow(i, 1));
}

/* ---------- preset button rows ---------- */
const sel = { g0: 'pd', g1: 'pd', g3: 'stag', g4: 'pennies', g5: 'pennies' };
function buildPresets(onChange) {
  Object.keys(sel).forEach(gid => {
    const box = $(gid), first = box.firstChild;
    box.dataset.games.split(',').forEach(name => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn toggle'; b.id = `${gid}-${name}`; b.dataset.step = box.dataset.step; b.dataset.i18n = name;
      b.addEventListener('click', () => { sel[gid] = name; onChange(gid); });
      box.insertBefore(b, first);
    });
  });
}
function syncPresets() { Object.keys(sel).forEach(gid => $(gid).querySelectorAll('.btn.toggle').forEach(b => b.setAttribute('aria-pressed', String(b.id === `${gid}-${sel[gid]}`)))); }
function pair(ids, id, side, k) { ids.forEach((bid, q) => { const b = $(bid); b.textContent = actName(id, side, q); b.setAttribute('aria-pressed', String(q === k)); }); }

/* ---------- step 0 ---------- */
const s0 = { i: 0, j: 0 };
const STORY = { pd: 'storyPd', stag: 'storyStag', concert: 'storyConcert', pennies: 'storyPennies', chicken: 'storyChicken', random: 'storyRandom' };
function draw0() {
  const id = sel.g0, g = M.PRESETS[id];
  pair(['r0a', 'r0b'], id, 'r', s0.i); pair(['c0a', 'c0b'], id, 'c', s0.j);
  drawMatrix($('c0'), id, g, { sel: [s0.i, s0.j] });
  $('r0').textContent = t('s0readout', { game: t(id), ra: actName(id, 'r', s0.i), ca: actName(id, 'c', s0.j), a: fmt(g.A[s0.i][s0.j]), b: fmt(g.B[s0.i][s0.j]), story: t(STORY[id]) });
}

/* ---------- step 1 ---------- */
const s1 = { j: 0, i: 0, all: false, seenR: new Set([0]), seenC: new Set([0]) };
function draw1() {
  const id = sel.g1, g = M.PRESETS[id];
  pair(['ac1a', 'ac1b'], id, 'c', s1.j); pair(['ar1a', 'ar1b'], id, 'r', s1.i);
  $('all1').setAttribute('aria-pressed', String(s1.all));
  const rowArrows = s1.all ? [0, 1] : [s1.j], colArrows = s1.all ? [0, 1] : [s1.i];
  drawMatrix($('c1'), id, g, { rowArrows, colArrows, faded: { r: [...s1.seenR], c: [...s1.seenC] } });
  const br = (list, side) => list.length === 2 ? t('tieBR') : t('quote', { x: actName(id, side, list[0]) });
  $('r1').textContent = t('s1readout', {
    c: actName(id, 'c', s1.j), r0: actName(id, 'r', 0), r1: actName(id, 'r', 1), x0: fmt(g.A[0][s1.j]), x1: fmt(g.A[1][s1.j]), br: br(M.rowBR(g, s1.j), 'r'),
    r: actName(id, 'r', s1.i), c0: actName(id, 'c', 0), c1: actName(id, 'c', 1), y0: fmt(g.B[s1.i][0]), y1: fmt(g.B[s1.i][1]), br2: br(M.colBR(g, s1.i), 'c'),
    seen: s1.seenR.size + s1.seenC.size
  });
}

/* ---------- step 2: the T–S family ---------- */
const s2 = { visited: new Set(['5,0']) };
function draw2() {
  const T = num('T2'), S = num('S2'), g = M.family(T, S), name = M.familyName(T, S);
  $('T2v').textContent = fmt(T, 1); $('S2v').textContent = fmt(S, 1);
  s2.visited.add(`${T},${S}`);
  drawMatrix($('c2'), 'family', g, { rowArrows: [0, 1], colArrows: [0, 1], ne: true });
  // plane
  const { ctx, W, H } = fitCanvas($('c2b'));
  const P = { l: 34, r: W - 12, t: 12, b: H - 28 }, X = v => P.l + (v - 1) / 5 * (P.r - P.l), Y = v => P.b - (v + 2) / 5 * (P.b - P.t);
  const regions = [['harmony', 1, 3, 1, 3, 'rgba(126,226,168,0.10)'], ['stag', 1, 3, -2, 1, 'rgba(103,215,249,0.10)'], ['chicken', 3, 6, 1, 3, 'rgba(183,156,255,0.10)'], ['pd', 3, 6, -2, 1, 'rgba(255,122,147,0.12)']];
  regions.forEach(([key, t0, t1, s0_, s1_, col]) => {
    ctx.fillStyle = col; ctx.fillRect(X(t0), Y(s1_), X(t1) - X(t0), Y(s0_) - Y(s1_));
    fitText(ctx, t(key), (X(t0) + X(t1)) / 2, (Y(s0_) + Y(s1_)) / 2 - (key === 'harmony' || key === 'chicken' ? 0 : 0), X(t1) - X(t0) - 10, 13, 700, key === name ? C.text : C.muted);
  });
  ctx.strokeStyle = C.axis; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X(3), P.t); ctx.lineTo(X(3), P.b); ctx.moveTo(P.l, Y(1)); ctx.lineTo(P.r, Y(1)); ctx.stroke(); ctx.setLineDash([]);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let v = 1; v <= 6; v++) ctx.fillText('T=' + v, X(v), P.b + 16);
  ctx.textAlign = 'right'; for (let v = -2; v <= 3; v++) ctx.fillText(fmt(v), P.l - 6, Y(v) + 4);
  ctx.restore();
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l + 0.5, P.t + 0.5, P.r - P.l - 1, P.b - P.t - 1);
  s2.visited.forEach(k => { const [a, b] = k.split(',').map(Number); if (a === T && b === S) return; ctx.fillStyle = 'rgba(154,170,189,0.7)'; ctx.beginPath(); ctx.arc(X(a), Y(b), 3.2, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X(T), Y(S), 6, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
  // readout
  const dr = M.rowDominant(g), dc = M.colDominant(g);
  const dom = dr === 1 && dc === 1 ? t('domBoth', { T: fmt(T, 1), S: fmt(S, 1) }) : dr === 0 && dc === 0 ? t('domCoop', { T: fmt(T, 1), S: fmt(S, 1) }) : t('domNone');
  const ne = M.pureNE(g);
  let pareto = '';
  for (const [i, j] of ne) for (let k = 0; k < 2; k++) for (let l = 0; l < 2; l++) if (!pareto && M.bothBetter(g, i, j, k, l) && g.A[i][j] === g.B[i][j] && g.A[k][l] === g.B[k][l]) pareto = t('paretoNote', { cell: cellName('family', i, j), u: fmt(g.A[i][j]), better: cellName('family', k, l), v: fmt(g.A[k][l]) });
  $('r2').textContent = t('s2readout', { T: fmt(T, 1), S: fmt(S, 1), name: t(name), dom, ne: ne.length ? ne.map(([i, j]) => cellName('family', i, j)).join(t('listSep')) : t('none'), pareto });
}

/* ---------- step 3 ---------- */
const s3 = { i: 0, j: 0, seed: 0, tally: [0, 0, 0], game: null };
const game3 = () => (sel.g3 === 'random' ? s3.game : M.PRESETS[sel.g3]);
function draw3() {
  const id = sel.g3, g = game3();
  pair(['r3a', 'r3b'], id, 'r', s3.i); pair(['c3a', 'c3b'], id, 'c', s3.j);
  drawMatrix($('c3'), id, g, { sel: [s3.i, s3.j], rowArrows: [0, 1], colArrows: [0, 1], ne: true });
  const d = M.deviation(g, s3.i, s3.j);
  const delta = v => (v > M.EPS ? t('more', { x: fmt(v) }) : v < -M.EPS ? t('less', { x: fmt(-v) }) : t('same'));
  const ne = M.pureNE(g), n = s3.tally[0] + s3.tally[1] + s3.tally[2];
  $('r3').textContent = t('s3readout', {
    r: actName(id, 'r', s3.i), c: actName(id, 'c', s3.j), r2: actName(id, 'r', 1 - s3.i), c2: actName(id, 'c', 1 - s3.j),
    rowDelta: delta(d.rowGain), colDelta: delta(d.colGain), verdict: t(!d.rowWants && !d.colWants ? 'verdictNE' : 'verdictNot'),
    list: ne.length ? ne.map(([i, j]) => cellName(id, i, j)).join(t('listSep')) : t('none'),
    tally: n ? t('tally', { n, z: s3.tally[0], o: s3.tally[1], t: s3.tally[2] }) : ''
  });
}

/* ---------- step 4 ---------- */
function game4() { const g = M.clone(M.PRESETS[sel.g4]); g.A[0][0] = num('a4'); return g; }
function draw4() {
  const id = sel.g4, g = game4(), q = num('q4');
  $('q4v').textContent = q.toFixed(2); $('a4v').textContent = fmt(num('a4'), 1);
  drawMatrix($('c4m'), id, g, { sel: null });
  const { ctx, W, H } = fitCanvas($('c4'));
  const vals = [g.A[0][0], g.A[0][1], g.A[1][0], g.A[1][1]], lo = Math.min(...vals, 0) - 0.5, hi = Math.max(...vals, 0) + 0.5;
  const P = { l: 34, r: W - 14, t: 14, b: H - 26 }, X = v => P.l + v * (P.r - P.l), Y = v => P.b - (v - lo) / (hi - lo) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  const step = hi - lo > 8 ? 2 : 1;
  for (let v = Math.ceil(lo); v <= hi; v += step) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, Y(v) + 4); }
  ctx.textAlign = 'center'; [0, 0.25, 0.5, 0.75, 1].forEach(v => ctx.fillText(String(v), X(v), P.b + 16)); ctx.restore();
  const line = (i, col) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(M.rowEU(g, i, 0))); ctx.lineTo(X(1), Y(M.rowEU(g, i, 1))); ctx.stroke(); };
  line(0, C.orange); line(1, C.violet);
  const ind = M.indifference(g);
  if (ind.q !== null) { const v = M.rowEU(g, 0, ind.q); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(ind.q), Y(v), 7, 0, 7); ctx.stroke(); }
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(q), P.t); ctx.lineTo(X(q), P.b); ctx.stroke(); ctx.restore();
  [[0, C.orange], [1, C.violet]].forEach(([i, col]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(q), Y(M.rowEU(g, i, q)), 5, 0, 7); ctx.fill(); });
  const e0 = M.rowEU(g, 0, q), e1 = M.rowEU(g, 1, q);
  const verdict = Math.abs(e0 - e1) < 0.005 ? t('indiff') : t('better', { r: actName(id, 'r', e0 > e1 ? 0 : 1) });
  $('r4').textContent = t('s4readout', { q: q.toFixed(2), r0: actName(id, 'r', 0), r1: actName(id, 'r', 1), e0: fmt(e0, 3), e1: fmt(e1, 3), verdict, qs: ind.q === null ? t('noStar') : fmt(ind.q, 3), ps: ind.p === null ? t('noStar') : fmt(ind.p, 3) });
}

/* ---------- step 5 ---------- */
const N5 = 400, s5 = { path: [], k: 0 };
function draw5() {
  const id = sel.g5, g = M.PRESETS[id];
  const { ctx, W, H } = fitCanvas($('c5'));
  const side = Math.min(W - 70, H - 46), P = { l: (W - side) / 2 + 14, t: 12 }; P.r = P.l + side; P.b = P.t + side;
  const X = q => P.l + q * side, Y = p => P.b - p * side;
  ctx.fillStyle = '#111b27'; ctx.fillRect(P.l, P.t, side, side);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; [0.25, 0.5, 0.75].forEach(v => { ctx.beginPath(); ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), P.b); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); });
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l + 0.5, P.t + 0.5, side - 1, side - 1);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.textAlign = 'center'; [0, 0.5, 1].forEach(v => ctx.fillText('q=' + v, X(v), P.b + 16));
  ctx.textAlign = 'right'; [0, 0.5, 1].forEach(v => ctx.fillText('p=' + v, P.l - 6, Y(v) + 4)); ctx.restore();
  const ind = M.indifference(g);
  // Row's best response p(q)
  const pAt = q => M.rowBRp(g, q), qAt = p => M.colBRq(g, p);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = C.orange; ctx.lineWidth = 5; ctx.beginPath();
  if (ind.q !== null) { const a = pAt(ind.q / 2), b = pAt((1 + ind.q) / 2); ctx.moveTo(X(0), Y(a)); ctx.lineTo(X(ind.q), Y(a)); ctx.lineTo(X(ind.q), Y(b)); ctx.lineTo(X(1), Y(b)); }
  else { const a = pAt(0.5); ctx.moveTo(X(0), Y(a)); ctx.lineTo(X(1), Y(a)); }
  ctx.stroke();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.beginPath();
  if (ind.p !== null) { const a = qAt(ind.p / 2), b = qAt((1 + ind.p) / 2); ctx.moveTo(X(a), Y(0)); ctx.lineTo(X(a), Y(ind.p)); ctx.lineTo(X(b), Y(ind.p)); ctx.lineTo(X(b), Y(1)); }
  else { const a = qAt(0.5); ctx.moveTo(X(a), Y(0)); ctx.lineTo(X(a), Y(1)); }
  ctx.stroke();
  if (s5.k > 0) {
    ctx.strokeStyle = 'rgba(232,237,244,0.75)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(0.5), Y(0.5));
    for (let n = 0; n < s5.k; n++) ctx.lineTo(X(s5.path[n].q), Y(s5.path[n].p));
    ctx.stroke(); const L = s5.path[s5.k - 1]; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X(L.q), Y(L.p), 4.5, 0, 7); ctx.fill();
  }
  const all = M.allNE(g);
  all.forEach(e => { ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(X(e.q), Y(e.p), 7, 0, 7); ctx.fill(); ctx.stroke(); });
  const list = all.map(e => (e.pure ? t('nePure', { cell: cellName(id, e.cell[0], e.cell[1]) }) : t('neMixed', { p: fmt(e.p, 3), q: fmt(e.q, 3) }))).join(t('listSep'));
  let fp = '';
  if (s5.k > 0) { const L = s5.path[s5.k - 1], d = Math.min(...all.map(e => Math.hypot(e.p - L.p, e.q - L.q))); fp = t('s5fp', { k: s5.k, N: N5, p: L.p.toFixed(3), q: L.q.toFixed(3), d: d.toFixed(3) }); }
  $('r5').textContent = t('s5readout', { game: t(id), list, fp });
}

/* ---------- step 6: quiz ---------- */
const s6 = { seed: 3, state: 'open' };
function quizGame() { return M.randomGame(1000 + s6.seed); }
function build6() {
  const g = quizGame(), tb = $('qmat');
  const prev = [...tb.querySelectorAll('input')].map(x => x.checked);
  tb.innerHTML = `<tr><th></th><th>${t('random0c')}</th><th>${t('random1c')}</th></tr>` + [0, 1].map(i => `<tr><th>${t(`random${i}r`)}</th>` + [0, 1].map(j => `<td><label><span><span class="po">${fmt(g.A[i][j])}</span> , <span class="pc">${fmt(g.B[i][j])}</span></span><input type="checkbox" id="q6-${i}${j}" data-step="6" aria-label="${cellName('random', i, j)}"></label></td>`).join('') + '</tr>').join('');
  tb.querySelectorAll('input').forEach((x, k) => { if (prev.length === 4) x.checked = prev[k]; x.addEventListener('change', () => { if (s6.state !== 'shown') { s6.state = 'open'; draw6(); } }); });
}
function draw6() {
  const g = quizGame(), ne = M.pureNE(g), fb = $('fb6');
  const list = ne.length ? ne.map(([i, j]) => cellName('random', i, j)).join(t('listSep')) : t('none');
  if (s6.state === 'open') { fb.textContent = ''; delete fb.dataset.state; return; }
  if (s6.state === 'right') { fb.textContent = t('qRight', { list }); fb.style.color = C.green; }
  else if (s6.state === 'wrong') { fb.textContent = t('qWrong'); fb.style.color = C.orange; }
  else {
    const detail = [0, 1].flatMap(i => [0, 1].map(j => { const d = M.deviation(g, i, j); return t('detailCell', { r: actName('random', 'r', i), c: actName('random', 'c', j), v: t('devFmt', { a: d.rowWants ? t('yes') : t('no'), b: d.colWants ? t('yes') : t('no') }) }); })).join(t('listSep'));
    fb.textContent = t('qShown', { list, detail }); fb.style.color = C.cyan;
  }
  fb.dataset.state = s6.state;
}

function refresh() { syncPresets(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); build6(); draw6(); }

/* ---------- animation (fictitious play) ---------- */
let raf = null;
function stop5() { if (raf) cancelAnimationFrame(raf); raf = null; }
function run5() {
  stop5(); s5.path = M.fictitious(M.PRESETS[sel.g5], N5);
  if (reduceMotion()) { s5.k = N5; draw5(); return; }
  const start = performance.now(), ms = 6000;
  const tick = now => { const p = Math.min(1, (now - start) / ms); s5.k = Math.max(1, Math.round(p * N5)); draw5(); raf = p < 1 ? requestAnimationFrame(tick) : null; };
  raf = requestAnimationFrame(tick);
}

function setup() {
  buildPresets(gid => {
    if (gid === 'g0') { s0.i = 0; s0.j = 0; }
    if (gid === 'g1') { s1.seenR = new Set([s1.j]); s1.seenC = new Set([s1.i]); }
    if (gid === 'g3') { s3.i = 0; s3.j = 0; }
    if (gid === 'g4') { $('a4').value = String(M.PRESETS[sel.g4].A[0][0]); }
    if (gid === 'g5') { stop5(); s5.k = 0; s5.path = []; }
    syncPresets(); window.GT_I18N.setLang(window.GT_I18N.getLang());
  });
  [['r0a', () => { s0.i = 0; }], ['r0b', () => { s0.i = 1; }], ['c0a', () => { s0.j = 0; }], ['c0b', () => { s0.j = 1; }]].forEach(([id, f]) => $(id).addEventListener('click', () => { f(); draw0(); }));
  [['ac1a', () => { s1.j = 0; s1.seenR.add(0); }], ['ac1b', () => { s1.j = 1; s1.seenR.add(1); }], ['ar1a', () => { s1.i = 0; s1.seenC.add(0); }], ['ar1b', () => { s1.i = 1; s1.seenC.add(1); }]].forEach(([id, f]) => $(id).addEventListener('click', () => { f(); draw1(); }));
  $('all1').addEventListener('click', () => { s1.all = !s1.all; if (s1.all) { s1.seenR = new Set([0, 1]); s1.seenC = new Set([0, 1]); } draw1(); });
  ['T2', 'S2'].forEach(id => $(id).addEventListener('input', draw2));
  [['r3a', () => { s3.i = 0; }], ['r3b', () => { s3.i = 1; }], ['c3a', () => { s3.j = 0; }], ['c3b', () => { s3.j = 1; }]].forEach(([id, f]) => $(id).addEventListener('click', () => { f(); draw3(); }));
  $('rand3').addEventListener('click', () => {
    s3.seed += 1; s3.game = M.randomGame(s3.seed); sel.g3 = 'random'; s3.i = 0; s3.j = 0;
    s3.tally[Math.min(2, M.pureNE(s3.game).length)]++; syncPresets(); draw3();
  });
  ['q4', 'a4'].forEach(id => $(id).addEventListener('input', draw4));
  $('play5').addEventListener('click', run5);
  $('clear5').addEventListener('click', () => { stop5(); s5.k = 0; s5.path = []; draw5(); });
  $('check6').addEventListener('click', () => {
    const ne = M.pureNE(quizGame()), boxes = [0, 1].flatMap(i => [0, 1].map(j => $(`q6-${i}${j}`).checked === ne.some(([a, b]) => a === i && b === j)));
    s6.state = boxes.every(Boolean) ? 'right' : 'wrong'; draw6();
  });
  $('show6').addEventListener('click', () => { s6.state = 'shown'; draw6(); });
  $('new6').addEventListener('click', () => { s6.seed += 1; s6.state = 'open'; $('qmat').innerHTML = ''; build6(); draw6(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && raf) { stop5(); s5.k = N5; draw5(); } });
  window.refreshGT = refresh;
  window.GT_I18N.setLang(window.GT_I18N.getLang());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
