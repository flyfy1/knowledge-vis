'use strict';
// Number theory & counting lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number drawn or printed comes from window.NC_MODEL (model.js). Canvas text is limited to numbers
// inside their own cells/circles/pills, two row labels and axis ticks, each laid out in a reserved slot.
(function () {

const $ = id => document.getElementById(id);
const M = window.NC_MODEL;
const t = (...a) => window.NC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', panel2: '#182433', head: '#1d2a3a', dot: '#9fb4cc' };
const ROUND = [C.cyan, C.orange, C.green, C.pink, C.violet];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = e => String(e).split('').map(d => SUP[d]).join('');
const pf = n => M.factorize(n).map(([p, e]) => p + (e > 1 ? sup(e) : '')).join(' × ');
const expFormula = n => M.factorize(n).map(([, e]) => `(${e} + 1)`).join(' × ');

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
function setHeight(canvas, h) { canvas.dataset.h = h; canvas.style.height = h + 'px'; }
// Centred text that shrinks until it fits maxW (never spills out of its cell).
function fitText(ctx, s, x, y, maxW, size = 13, weight = 600, color = C.text) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(s).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(s, x, y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

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

/* ---------- step 0: factor tree ---------- */
const s0 = { choice: 0, tried: new Set([0]), sets: new Set(), reveal: Infinity };
function layoutTree(root) {
  let slot = 0; const nodes = [];
  const walk = (nd, depth) => {
    if (!nd.kids.length) { nd.slot = slot++; } else { nd.kids.forEach(k => walk(k, depth + 1)); nd.slot = (nd.kids[0].slot + nd.kids[1].slot) / 2; }
    nd.depth = depth; nodes.push(nd);
  };
  walk(root, 0); return { nodes, leaves: slot };
}
function draw0() {
  const n = num('n0'); $('n0v').textContent = String(n);
  const tree = M.factorTree(n, s0.choice), D = M.treeDepth(tree), { nodes, leaves } = layoutTree(tree);
  const { ctx, W, H } = fitCanvas($('c0'));
  const slotW = (W - 24) / leaves, rowH = D ? Math.min(66, (H - 52) / D) : 0, r = Math.max(12, Math.min(18, slotW * 0.45));
  const X = nd => 12 + (nd.slot + 0.5) * slotW, Y = nd => 26 + nd.depth * rowH + (D ? 0 : (H - 52) / 2);
  ctx.lineWidth = 1.6; ctx.strokeStyle = C.axis;
  nodes.forEach(nd => nd.kids.forEach(k => { if (k.depth > s0.reveal) return; ctx.beginPath(); ctx.moveTo(X(nd), Y(nd) + r); ctx.lineTo(X(k), Y(k) - r); ctx.stroke(); }));
  nodes.forEach(nd => {
    if (nd.depth > s0.reveal) return;
    const col = nd.prime ? C.orange : C.cyan;
    ctx.beginPath(); ctx.arc(X(nd), Y(nd), r, 0, 7); ctx.fillStyle = C.bg; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = col; ctx.stroke();
    fitText(ctx, String(nd.v), X(nd), Y(nd) + 0.5, 2 * r - 6, 13, 700, nd.prime ? C.orange : C.text);
  });
  const J = M.splits(n).length;
  if (!J) { $('r0').textContent = t('s0prime', { n }); return; }
  const [a, b] = M.splits(n)[s0.choice % J], leavesList = M.treeLeaves(tree).sort((x, y) => x - y);
  s0.sets.add(leavesList.join(','));
  $('r0').textContent = t('s0readout', { n, a, b, J, j: (s0.choice % J) + 1, leaves: leavesList.join(', '), pf: pf(n), tried: s0.tried.size, same: t(s0.sets.size === 1 ? 'sameYes' : 'sameNo') });
}
function regrow0() {
  const D = M.treeDepth(M.factorTree(num('n0'), s0.choice));
  s0.reveal = 0; draw0();
  animate('s0', 320 * (D + 1), p => { s0.reveal = p >= 1 ? Infinity : Math.floor(p * (D + 1)); draw0(); });
}

/* ---------- step 1: divisor table ---------- */
function syncPick1() {
  const d = M.divisorCount(num('n1')), el = $('d1');
  el.max = String(d); if (num('d1') > d) el.value = String(d);
}
function draw1() {
  const n = num('n1'), T = M.divisorTable(n), r = T.rows.length, c = T.cols.length, d = r * c;
  const idx = num('d1') - 1, x = T.cells[Math.floor(idx / c)][idx % c], y = n / x;
  $('n1v').textContent = String(n); $('d1v').textContent = `${idx + 1}/${d} → ${x}`;
  const { ctx, W, H } = fitCanvas($('c1'));
  const cw = Math.min(84, (W - 16) / (c + 1)), ch = Math.min(42, (H - 16) / (r + 1));
  const x0 = (W - cw * (c + 1)) / 2, y0 = (H - ch * (r + 1)) / 2;
  const cell = (i, j) => [x0 + j * cw, y0 + i * ch];
  const box = (i, j, fill, stroke, lw) => { const [px, py] = cell(i, j); ctx.fillStyle = fill; ctx.fillRect(px + 2, py + 2, cw - 4, ch - 4); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(px + 2.5, py + 2.5, cw - 5, ch - 5); } };
  box(0, 0, C.head); fitText(ctx, '×', x0 + cw / 2, y0 + ch / 2, cw - 8, 14, 700, C.muted);
  T.cols.forEach((v, j) => { box(0, j + 1, C.head); fitText(ctx, String(v), x0 + (j + 1.5) * cw, y0 + ch / 2, cw - 8, 13, 600, C.muted); });
  T.rows.forEach((v, i) => { box(i + 1, 0, C.head); fitText(ctx, T.p + sup(i), x0 + cw / 2, y0 + (i + 1.5) * ch, cw - 8, 13, 600, C.muted); });
  T.cells.forEach((row, i) => row.forEach((v, j) => {
    const sel = v === x, mate = v === y;
    box(i + 1, j + 1, C.panel2, sel ? C.orange : mate ? C.cyan : null, 2.5);
    if (sel && mate) { const [px, py] = cell(i + 1, j + 1); ctx.setLineDash([4, 3]); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.strokeRect(px + 6, py + 6, cw - 12, ch - 12); ctx.setLineDash([]); }
    fitText(ctx, String(v), x0 + (j + 1.5) * cw, y0 + (i + 1.5) * ch, cw - 10, 13, 600, sel ? C.orange : mate ? C.cyan : C.text);
  }));
  const s = Math.round(Math.sqrt(n)), sq = M.isSquare(n) ? t('sqYes', { n, s }) : t('sqNo', { n });
  $('r1').textContent = t('s1readout', { n, pf: pf(n), r, c, d, formula: expFormula(n), x, y, sq });
}

/* ---------- step 2: Euclid as square cutting ---------- */
const s2 = { shown: Infinity };
function pieces(a, b) {
  const E = M.euclid(a, b), rect = { x: 0, y: 0, w: Math.max(a, b), h: Math.min(a, b) }, out = [];
  E.rows.forEach((row, k) => {
    for (let i = 0; i < row.q; i++) {
      if (rect.w >= rect.h) { out.push({ k, x: rect.x, y: rect.y, s: row.b }); rect.x += row.b; rect.w -= row.b; }
      else { out.push({ k, x: rect.x, y: rect.y, s: row.b }); rect.y += row.b; rect.h -= row.b; }
    }
  });
  return { E, out };
}
function draw2() {
  const a = num('a2'), b = num('b2'); $('a2v').textContent = String(a); $('b2v').textContent = String(b);
  const { E, out } = pieces(a, b), shown = Math.min(s2.shown, E.steps);
  const A = Math.max(a, b), B = Math.min(a, b), cv = $('c2'), W0 = Math.max(240, cv.clientWidth || 600);
  setHeight(cv, Math.max(90, Math.min(300, Math.round((W0 - 24) * B / A + 24))));
  const { ctx, W, H } = fitCanvas(cv);
  const sc = Math.min((W - 24) / A, (H - 24) / B);
  const ox = (W - A * sc) / 2, oy = (H - B * sc) / 2;
  ctx.fillStyle = '#121c28'; ctx.fillRect(ox, oy, A * sc, B * sc);
  out.forEach(p => {
    if (p.k >= shown) return;
    const col = ROUND[p.k % ROUND.length];
    ctx.globalAlpha = 0.28; ctx.fillStyle = col; ctx.fillRect(ox + p.x * sc, oy + p.y * sc, p.s * sc, p.s * sc);
    ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(ox + p.x * sc + 0.75, oy + p.y * sc + 0.75, p.s * sc - 1.5, p.s * sc - 1.5);
    if (p.s * sc >= 26) fitText(ctx, String(p.s), ox + (p.x + p.s / 2) * sc, oy + (p.y + p.s / 2) * sc, p.s * sc - 8, 13, 700, col);
  });
  ctx.setLineDash([5, 4]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.strokeRect(ox + 0.5, oy + 0.5, A * sc - 1, B * sc - 1); ctx.setLineDash([]);
  const chain = E.rows.slice(0, shown).map(r => `${r.a} = ${r.q} × ${r.b} + ${r.r}`).join(t('sep'));
  const prog = shown < E.steps || s2.shown !== Infinity ? t('s2progress', { c: shown, N: E.steps }) : '';
  if (shown < E.steps) { $('r2').textContent = prog + chain + t('s2more'); return; }
  const g = E.gcd, ev = M.exponentView(a, b);
  $('r2').textContent = t('s2readout', { prog, chain, steps: E.steps, sq: E.squares, a, b, g, pfa: pf(a), pfb: pf(b), g2: ev.gcd, coprime: g === 1 ? t('coprimeNote', { a, b }) : '' });
}

/* ---------- step 3: two lamps ---------- */
const s3 = { t: null };
function draw3() {
  const a = num('a3'), b = num('b3'); $('a3v').textContent = String(a); $('b3v').textContent = String(b);
  const g = M.gcd(a, b), l = M.lcm(a, b), T = l + Math.max(a, b), L = M.lamps(a, b, T);
  const { ctx, W, H } = fitCanvas($('c3'));
  const x0 = 62, x1 = W - 16, X = v => x0 + v / T * (x1 - x0), yA = 58, yB = 112, axisY = 150;
  const now = s3.t === null ? T : s3.t;
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.cyan; ctx.fillText(t('lampA'), 8, yA); ctx.fillStyle = C.green; ctx.fillText(t('lampB'), 8, yB); ctx.restore();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  [yA, yB].forEach(y => { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); });
  for (let m = 0; m <= T; m += l) { if (m > now) break; ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(m), 34); ctx.lineTo(X(m), axisY); ctx.stroke(); }
  const mark = (arr, y, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; arr.forEach(v => { if (v > now) return; ctx.beginPath(); ctx.moveTo(X(v), y - 12); ctx.lineTo(X(v), y + 12); ctx.stroke(); }); };
  mark(L.fa, yA, C.cyan); mark(L.fb, yB, C.green);
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x0, axisY); ctx.lineTo(x1, axisY); ctx.stroke();
  const step = niceStep(T, x1 - x0, 40, [1, 2, 5, 10, 20, 25, 50, 100, 200]);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let v = 0; v <= T; v += step) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X(v), axisY); ctx.lineTo(X(v), axisY + 4); ctx.stroke(); ctx.fillText(String(v), X(v), axisY + 16); }
  ctx.textAlign = 'right'; ctx.fillText(t('sec'), x1, axisY + 34); ctx.restore();
  if (now >= l) {
    ctx.save(); ctx.font = '700 12px system-ui,sans-serif'; ctx.fillStyle = C.orange; ctx.textBaseline = 'alphabetic';
    const s = 'lcm = ' + l, w = ctx.measureText(s).width; ctx.textAlign = 'left';
    ctx.fillText(s, Math.max(4, Math.min(W - w - 4, X(l) - w / 2)), 22); ctx.restore();
  }
  if (s3.t !== null) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(now), 34); ctx.lineTo(X(now), axisY); ctx.stroke(); }
  const prog = s3.t !== null && s3.t < l ? t('s3playing', { t: Math.floor(s3.t), ca: Math.floor(s3.t / a), cb: Math.floor(s3.t / b) }) : '';
  const note = g === 1 ? t('noteCoprime', { a, b }) : (a % b === 0 || b % a === 0) ? t('noteDivides', { s: Math.min(a, b), L: Math.max(a, b) }) : t('noteShared', { g, a, b, ab: a * b });
  $('r3').textContent = t('s3readout', { prog, a, b, l, na: l / a, nb: l / b, g, gl: g * l, note });
}

/* ---------- step 4: grid routes ---------- */
const s4 = { drawn: 0, cur: -1 };
function draw4() {
  const r = num('r4'), u = num('u4'); $('r4v').textContent = String(r); $('u4v').textContent = String(u);
  const P = M.allPaths(r, u), Wt = M.pathTable(r, u), N = P.length;
  const { ctx, W, H } = fitCanvas($('c4'));
  const s = Math.min(64, (W - 70) / r, (H - 56) / u), gx = (W - r * s) / 2 - 8, gy = 34 + u * s + (H - 56 - u * s) / 2;
  const X = i => gx + i * s, Y = j => gy - j * s;
  ctx.strokeStyle = C.grid; ctx.lineWidth = 2;
  for (let i = 0; i <= r; i++) { ctx.beginPath(); ctx.moveTo(X(i), Y(0)); ctx.lineTo(X(i), Y(u)); ctx.stroke(); }
  for (let j = 0; j <= u; j++) { ctx.beginPath(); ctx.moveTo(X(0), Y(j)); ctx.lineTo(X(r), Y(j)); ctx.stroke(); }
  const use = new Map(); let maxUse = 1;
  const edges = w => { const out = []; let i = 0, j = 0; for (const c of w) { const ni = c === 'R' ? i + 1 : i, nj = c === 'U' ? j + 1 : j; out.push([i, j, ni, nj]); i = ni; j = nj; } return out; };
  P.slice(0, s4.drawn).forEach(w => edges(w).forEach(e => { const k = e.join(','); const v = (use.get(k) || 0) + 1; use.set(k, v); maxUse = Math.max(maxUse, v); }));
  use.forEach((v, k) => { const [i, j, ni, nj] = k.split(',').map(Number), f = v / maxUse; ctx.strokeStyle = `rgba(103,215,249,${0.18 + 0.82 * f})`; ctx.lineWidth = 2 + 4 * f; ctx.beginPath(); ctx.moveTo(X(i), Y(j)); ctx.lineTo(X(ni), Y(nj)); ctx.stroke(); });
  if (s4.cur >= 0 && s4.cur < N) { ctx.strokeStyle = C.orange; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); edges(P[s4.cur]).forEach(e => ctx.lineTo(X(e[2]), Y(e[3]))); ctx.stroke(); ctx.lineCap = 'butt'; }
  for (let i = 0; i <= r; i++) for (let j = 0; j <= u; j++) {
    ctx.fillStyle = (i === 0 && j === 0) || (i === r && j === u) ? C.orange : C.muted; ctx.beginPath(); ctx.arc(X(i), Y(j), (i === 0 && j === 0) || (i === r && j === u) ? 5 : 3, 0, 7); ctx.fill();
    const label = String(Wt[i][j]); ctx.font = '600 11px system-ui,sans-serif'; const tw = ctx.measureText(label).width;
    const lx = X(i) + 5, ly = Y(j) - 17;
    ctx.fillStyle = 'rgba(13,22,33,0.92)'; ctx.fillRect(lx, ly, tw + 8, 15); ctx.strokeStyle = i === r && j === u ? C.orange : '#3a4a5e'; ctx.lineWidth = 1; ctx.strokeRect(lx + 0.5, ly + 0.5, tw + 7, 14);
    ctx.fillStyle = i === r && j === u ? C.orange : C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, lx + 4, ly + 8);
  }
  const prog = s4.drawn > 0 ? t('s4progress', { c: s4.drawn, N, word: P[Math.max(0, s4.cur)] }) : '';
  $('rd4').textContent = t('s4readout', { prog, r, u, n: r + u, N: Wt[r][u] });
}

/* ---------- step 5: permutations grouped into combinations ---------- */
function syncGroup5() {
  const c = M.choose(num('n5'), num('k5')), el = $('j5');
  el.max = String(c); if (num('j5') > c) el.value = String(c);
}
function draw5() {
  const n = num('n5'), k = num('k5'), j = num('j5'), sets = M.subsets(n, k), kf = M.factorial(k), P = M.perm(n, k);
  $('n5v').textContent = String(n); $('k5v').textContent = String(k); $('j5v').textContent = String(j);
  const cv = $('c5'), W0 = Math.max(240, cv.clientWidth || 600), colW = 44, perRow = Math.max(1, Math.min(sets.length, Math.floor((W0 - 16) / colW)));
  const rowsN = Math.ceil(sets.length / perRow), rowH = 30 + kf * 10 + 10;
  setHeight(cv, Math.max(140, rowsN * rowH + 16));
  const { ctx, W } = fitCanvas(cv);
  const ox = (W - perRow * colW) / 2;
  sets.forEach((set, q) => {
    const row = Math.floor(q / perRow), col = q % perRow, x = ox + col * colW, y = 8 + row * rowH, on = q === j - 1;
    ctx.strokeStyle = on ? C.orange : C.axis; ctx.lineWidth = on ? 2.2 : 1; ctx.strokeRect(x + 3.5, y + 0.5, colW - 7, rowH - 8);
    fitText(ctx, set, x + colW / 2, y + 13, colW - 12, 12, 700, on ? C.orange : C.text);
    for (let d = 0; d < kf; d++) { ctx.fillStyle = on ? C.orange : C.dot; ctx.beginPath(); ctx.arc(x + colW / 2, y + 30 + d * 10, 3.4, 0, 7); ctx.fill(); }
  });
  const set = sets[j - 1];
  $('r5').textContent = t('s5readout', { n, k, P, C: sets.length, kf, j, set, list: M.orderings(set).join(', ') });
}

/* ---------- step 6: transfer check ---------- */
const s6 = { seed: 1, state: 'open' };
function qText(q) {
  if (q.kind === 'qDiv') return t('qDiv', { n: q.n });
  if (q.kind === 'qGcd') return t('qGcd', { a: q.a, b: q.b });
  if (q.kind === 'qLcm') return t('qLcm', { a: q.a, b: q.b });
  return t('qPath', { r: q.r, u: q.u });
}
function qWhy(q) {
  if (q.kind === 'qDiv') return t('whyDiv', { n: q.n, pf: pf(q.n), formula: expFormula(q.n), ans: q.answer });
  if (q.kind === 'qGcd') return t('whyGcd', { chain: M.euclid(q.a, q.b).rows.map(r => `${r.a} = ${r.q} × ${r.b} + ${r.r}`).join(t('sep')), ans: q.answer });
  if (q.kind === 'qLcm') return t('whyLcm', { a: q.a, b: q.b, g: M.gcd(q.a, q.b), ans: q.answer });
  return t('whyPath', { n: q.r + q.u, u: q.u, ans: q.answer });
}
const TIP = { qDiv: 'tipDiv', qGcd: 'tipGcd', qLcm: 'tipLcm', qPath: 'tipPath' };
function draw6() {
  const q = M.question(s6.seed), fb = $('fb6');
  $('q6').textContent = qText(q);
  if (s6.state === 'open') { fb.textContent = ''; return; }
  if (s6.state === 'empty') { fb.textContent = t('qEmpty'); fb.style.color = C.orange; return; }
  if (s6.state === 'right') { fb.textContent = t('qRight', { why: qWhy(q) }); fb.style.color = C.green; }
  else if (s6.state === 'shown') { fb.textContent = t('qShown', { ans: q.answer, why: qWhy(q) }); fb.style.color = C.cyan; }
  else { fb.textContent = t('qWrong', { tip: t(TIP[q.kind]) }); fb.style.color = C.orange; }
  fb.dataset.state = s6.state;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('n0').addEventListener('input', () => { stopAnim('s0'); s0.choice = 0; s0.tried = new Set([0]); s0.sets.clear(); s0.reveal = Infinity; draw0(); });
  $('split0').addEventListener('click', () => { const J = M.splits(num('n0')).length; if (!J) return; s0.choice = (s0.choice + 1) % J; s0.tried.add(s0.choice); regrow0(); });
  $('reset0').addEventListener('click', () => { s0.choice = 0; s0.tried.add(0); regrow0(); });

  $('n1').addEventListener('input', () => { syncPick1(); draw1(); });
  $('d1').addEventListener('input', draw1);
  syncPick1();

  ['a2', 'b2'].forEach(id => $(id).addEventListener('input', () => { s2.shown = Infinity; draw2(); }));
  $('cut2').addEventListener('click', () => {
    const steps = M.euclid(num('a2'), num('b2')).steps;
    s2.shown = s2.shown >= steps ? 1 : s2.shown + 1; draw2();
  });
  $('all2').addEventListener('click', () => { s2.shown = Infinity; draw2(); });

  ['a3', 'b3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); s3.t = null; draw3(); }));
  $('play3').addEventListener('click', () => {
    const l = M.lcm(num('a3'), num('b3'));
    s3.t = 0; draw3();
    animate('s3', Math.max(2500, Math.min(7000, l * 110)), p => { s3.t = p * l; draw3(); });
  });
  $('all3').addEventListener('click', () => { stopAnim('s3'); s3.t = null; draw3(); });

  ['r4', 'u4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); s4.drawn = 0; s4.cur = -1; draw4(); }));
  $('walk4').addEventListener('click', () => {
    const N = M.allPaths(num('r4'), num('u4')).length;
    s4.drawn = 0; s4.cur = -1;
    animate('s4', Math.max(1500, Math.min(9000, N * 110)), p => { s4.drawn = Math.max(1, Math.ceil(p * N)); s4.cur = s4.drawn - 1; draw4(); });
  });
  $('clear4').addEventListener('click', () => { stopAnim('s4'); s4.drawn = 0; s4.cur = -1; draw4(); });

  ['n5', 'k5'].forEach(id => $(id).addEventListener('input', () => { syncGroup5(); draw5(); }));
  $('j5').addEventListener('input', draw5);
  syncGroup5();

  $('new6').addEventListener('click', () => { s6.seed += 1; s6.state = 'open'; $('ans6').value = ''; draw6(); });
  $('check6').addEventListener('click', () => {
    const raw = $('ans6').value.trim();
    if (!/^\d+$/.test(raw)) s6.state = 'empty';
    else s6.state = Number(raw) === M.question(s6.seed).answer ? 'right' : 'wrong';
    draw6();
  });
  $('show6').addEventListener('click', () => { s6.state = 'shown'; draw6(); });

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
  window.refreshNC = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
