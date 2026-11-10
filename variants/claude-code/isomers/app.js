'use strict';
// Isomers lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Skeletons, counts, Wiener indices, formulas and energies all come from window.ISO_MODEL (model.js).
// Canvas text is limited to panel titles, axis ticks and the A/B tags; names and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ISO_MODEL;
const t = (...a) => window.ISO_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', c: '#8d9aab', h: '#e8edf4', o: '#ff5c5c', bond: '#6f8098' };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sci = v => { if (v > 0.01) return fix(v, 2); const e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); return `${fix(m, 1)}×10${String(e).split('').map(c => SUP[c]).join('')}`; };
const temp = v => (v < 0 ? '−' + fix(-v, 1) : fix(v, 1));

function fitCanvas(canvas, hOverride) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (hOverride) { canvas.dataset.h = hOverride; canvas.style.height = hOverride + 'px'; }
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function label(ctx, text, X, Y, maxW, { size = 12, color = C.text, align = 'center', weight = 400 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, X, Y, maxW) => label(ctx, text, X, Y, maxW, { align: 'left', weight: 600 });
function panel(ctx, W, o) {
  const P = { l: o.left || 46, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  o.yTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : String(v), P.l - 6, y(v) + 4); });
  if (o.xTicks) { ctx.textAlign = 'center'; o.xTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xFmt ? o.xFmt(v) : String(v), x(v), P.b + 15); }); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 13, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); }
const niceTicks = (lo, hi, n = 5) => { const span = hi - lo, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 5, 10].map(k => k * mag).find(s => s >= raw); const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6)); return out; };

/* ---------- 2-D layout of a tree: chosen path across, branches perpendicular ---------- */
function layout(g, path, flipX = false, flipY = false, bend = -1) {
  // The drawn chain runs across; after index `bend` it turns downward. Branches take the free axis directions.
  const pos = [], on = new Set(path); let alt = -1;
  path.forEach((v, i) => { pos[v] = bend >= 0 && i > bend ? [bend, i - bend] : [i, 0]; });
  const place = (u, parent, dir) => {
    pos[u] = [pos[parent][0] + dir[0], pos[parent][1] + dir[1]];
    const kids = g.adj[u].filter(w => w !== parent), angs = kids.length === 1 ? [0] : kids.length === 2 ? [-50, 50] : [-70, 0, 70];
    kids.forEach((w, j) => { const a = angs[j] * Math.PI / 180; place(w, u, [dir[0] * Math.cos(a) - dir[1] * Math.sin(a), dir[0] * Math.sin(a) + dir[1] * Math.cos(a)]); });
  };
  path.forEach((v, i) => {
    const br = g.adj[v].filter(u => !on.has(u)); if (!br.length) return;
    const used = g.adj[v].filter(u => on.has(u)).map(u => [Math.sign(Math.round(pos[u][0] - pos[v][0])), Math.sign(Math.round(pos[u][1] - pos[v][1]))]);
    const pref = [[0, alt], [0, -alt], [alt, 0], [-alt, 0], [-1, -1], [1, -1]];
    const free = pref.filter(d => !used.some(q => q[0] === d[0] && q[1] === d[1]));
    const taken = new Set();
    br.forEach(u => {
      // first free direction whose first atom does not land next to an atom already drawn
      const clear = d => !pos.some((p, w) => p && w !== v && Math.hypot(p[0] - pos[v][0] - d[0], p[1] - pos[v][1] - d[1]) < 1.2);
      const d = free.find((q, k) => !taken.has(k) && clear(q)) || free.find((q, k) => !taken.has(k));
      taken.add(free.indexOf(d)); place(u, v, d);
    });
    alt = -alt;
  });
  return pos.map(([x, y]) => [flipX ? -x : x, flipY ? -y : y]);
}
// Fit positions (unit bond length) into a box; returns pixel coordinates and the bond length used.
function fit(pos, box, maxD, pad = 0.6) {
  const xs = pos.map(p => p[0]), ys = pos.map(p => p[1]);
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  const d = Math.min(maxD, box.w / (x1 - x0), box.h / (y1 - y0));
  const ox = box.x + (box.w - (x1 - x0) * d) / 2 - x0 * d, oy = box.y + (box.h - (y1 - y0) * d) / 2 - y0 * d;
  return { P: pos.map(([x, y]) => [ox + x * d, oy + y * d]), d };
}
function drawSkeleton(ctx, g, pos, box, { maxD = 34, col = C.c, hl = null, lw = 2.5 } = {}) {
  const { P, d } = fit(pos, box, maxD);
  ctx.save(); ctx.lineCap = 'round';
  g.adj.forEach((a, v) => a.forEach(u => { if (u > v) { const on = hl && hl.has(u) && hl.has(v); ctx.strokeStyle = on ? C.orange : C.bond; ctx.lineWidth = on ? lw + 1.5 : lw; ctx.beginPath(); ctx.moveTo(P[v][0], P[v][1]); ctx.lineTo(P[u][0], P[u][1]); ctx.stroke(); } }));
  P.forEach(([X, Y], v) => dot(ctx, X, Y, Math.max(2.5, Math.min(6, d * 0.17)), hl && hl.has(v) ? C.orange : col));
  ctx.restore();
  return { P, d };
}
// Ball-and-stick with hydrogens filled in (valence C 4, O 2). hl: 'C' | 'H' | 'L' (longest chain) | null.
const VAL = { C: 4, O: 2 };
function hydrogens(g, pos) {
  const out = [], cand = [-90, 90, 180, 0, -45, 45, 135, -135];
  g.el.forEach((e, v) => {
    const used = g.adj[v].map(u => Math.atan2(pos[u][1] - pos[v][1], pos[u][0] - pos[v][0]) * 180 / Math.PI);
    for (let k = 0; k < VAL[e] - g.adj[v].length; k++) {
      const gapTo = a => Math.min(...used.map(b => { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; }), 360);
      const best = cand.slice().sort((a, b) => gapTo(b) - gapTo(a))[0];
      used.push(best); const r = best * Math.PI / 180;
      out.push({ v, x: pos[v][0] + 0.62 * Math.cos(r), y: pos[v][1] + 0.62 * Math.sin(r) });
    }
  });
  return out;
}
function drawBalls(ctx, g, box, { hl = null, maxD = 46, ohRing = false } = {}) {
  const path = M.longestPath(g), pos = layout(g, path), Hs = hydrogens(g, pos);
  const all = pos.concat(Hs.map(h => [h.x, h.y]));
  const { P, d } = fit(all, box, maxD, 0.35);
  const chainSet = new Set(path);
  ctx.save(); ctx.lineCap = 'round';
  Hs.forEach((h, i) => { const p = P[pos.length + i]; ctx.strokeStyle = C.bond; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P[h.v][0], P[h.v][1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
  g.adj.forEach((a, v) => a.forEach(u => { if (u > v) { const on = hl === 'L' && chainSet.has(u) && chainSet.has(v) && g.el[u] === 'C' && g.el[v] === 'C'; ctx.strokeStyle = on ? C.orange : C.bond; ctx.lineWidth = on ? 5 : 3; ctx.beginPath(); ctx.moveTo(P[v][0], P[v][1]); ctx.lineTo(P[u][0], P[u][1]); ctx.stroke(); } }));
  Hs.forEach((h, i) => { const p = P[pos.length + i]; dot(ctx, p[0], p[1], d * 0.19, C.h); if (hl === 'H') { ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p[0], p[1], d * 0.19 + 3, 0, 7); ctx.stroke(); }
    if (ohRing && g.el[h.v] === 'O') { ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p[0], p[1], d * 0.19 + 4, 0, 7); ctx.stroke(); } });
  g.el.forEach((e, v) => { const [X, Y] = P[v]; dot(ctx, X, Y, d * 0.27, e === 'O' ? C.o : C.c);
    const on = (hl === 'C' && e === 'C') || (hl === 'L' && chainSet.has(v) && e === 'C'); if (on) { ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, d * 0.27 + 3, 0, 7); ctx.stroke(); } });
  ctx.restore();
}

/* ---------- step 0 ---------- */
const s0 = { hl: 'C' };
const A0 = M.ALKANES.find(a => a.id === 'butane'), B0 = M.ALKANES.find(a => a.id === 'methylpropane');
function draw0() {
  ['C', 'H', 'L'].forEach(k => $('h0' + k).setAttribute('aria-pressed', String(s0.hl === k)));
  const { ctx, W, H } = fitCanvas($('c0'));
  const top = H - 110, half = (W - 24) / 2;
  drawBalls(ctx, A0.g, { x: 8, y: 10, w: half, h: top - 20 }, { hl: s0.hl });
  drawBalls(ctx, B0.g, { x: 16 + half, y: 10, w: half, h: top - 20 }, { hl: s0.hl });
  ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(W / 2, 14); ctx.lineTo(W / 2, top - 10); ctx.stroke();
  const P = panel(ctx, W, { top: top + 34, bottom: top + 34, left: 20, right: 20, xMin: -20, xMax: 30, yTicks: [], xTicks: niceTicks(-20, 30, Math.max(3, Math.floor((W - 40) / 60))), xFmt: v => temp(v).replace('.0', ''), title: t('c0bp') });
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.pink; ctx.beginPath(); ctx.moveTo(P.x(25), P.P.b - 22); ctx.lineTo(P.x(25), P.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, P.x(A0.bp), P.P.b - 9, 6, C.cyan); dot(ctx, P.x(B0.bp), P.P.b - 9, 6, C.orange);
  const fa = M.formula(A0.g), fb = M.formula(B0.g);
  $('r0').textContent = s0.hl === 'C' ? t('r0C', { ca: fa.C, cb: fb.C }) : s0.hl === 'H' ? t('r0H', { ha: fa.H, hb: fb.H, f: M.formulaText(fa) })
    : t('r0L', { la: M.longestPath(A0.g).length, lb: M.longestPath(B0.g).length, ba: temp(A0.bp), bb: temp(B0.bp) });
}

/* ---------- step 1 ---------- */
const s1 = { n: 6, k: 0, answered: null, right: 0, total: 0 };
const nameOf = g => { const a = M.named(g); return a ? t('iso_' + a.id) : '?'; };
function draw1() {
  [5, 6, 7].forEach(n => $('n1_' + n).setAttribute('aria-pressed', String(s1.n === n)));
  const q = M.question(s1.n, s1.k);
  const { ctx, W, H } = fitCanvas($('c1'));
  const half = (W - 24) / 2;
  [[q.A, 8, 'A'], [q.B, 16 + half, 'B']].forEach(([dr, x0, tag]) => {
    ctx.strokeStyle = C.grid; ctx.strokeRect(x0, 8, half, H - 16);
    label(ctx, tag, x0 + 12, 28, 30, { size: 15, weight: 700, color: C.cyan, align: 'left' });
    drawSkeleton(ctx, dr.g, layout(dr.g, dr.path, dr.flipX, dr.flipY, dr.bend), { x: x0 + 10, y: 36, w: half - 20, h: H - 54 }, { maxD: 46 });
  });
  $('same1').disabled = $('diff1').disabled = s1.answered !== null;
  if (s1.answered === null) $('r1').textContent = t('r1ask', { k: s1.k + 1, c: 'C' + '₀₁₂₃₄₅₆₇₈₉'[s1.n] });
  else {
    const v = t(s1.answered === q.same ? 'r1right' : 'r1wrong');
    $('r1').textContent = q.same ? t('r1truthSame', { v, na: nameOf(q.A.g), la: M.longestPath(q.A.g).length })
      : t('r1truthDiff', { v, na: nameOf(q.A.g), la: M.longestPath(q.A.g).length, nb: nameOf(q.B.g), lb: M.longestPath(q.B.g).length });
  }
  $('score1').textContent = t('score1', { r: s1.right, t: s1.total });
}

/* ---------- step 2 ---------- */
const s2 = { seen: new Set([5]) };
function draw2() {
  const n = Number($('n2').value), S = M.skeletons(n); s2.seen.add(n);
  $('n2v').textContent = String(n);
  const c = $('c2'), W0 = Math.max(240, c.clientWidth || 600);
  const cols = Math.max(2, Math.floor((W0 - 16) / 130)), rows = Math.ceil(S.length / cols), cellH = 84, chartH = 170;
  const { ctx, W, H } = fitCanvas(c, rows * cellH + chartH + 16);
  const cw = (W - 16) / cols;
  S.forEach((g, i) => {
    const X = 8 + (i % cols) * cw, Y = 8 + Math.floor(i / cols) * cellH;
    ctx.strokeStyle = C.grid; ctx.strokeRect(X + 2, Y + 2, cw - 4, cellH - 4);
    drawSkeleton(ctx, g, layout(g, M.longestPath(g)), { x: X + 8, y: Y + 6, w: cw - 16, h: cellH - 12 }, { maxD: 22, lw: 2 });
  });
  const top = rows * cellH + 16 + 40;
  const P = panel(ctx, W, { top, bottom: H - 26, left: 40, xMin: 0.4, xMax: 8.6, yMin: 0, yMax: 20, yTicks: [0, 5, 10, 15, 20], xTicks: [1, 2, 3, 4, 5, 6, 7, 8], title: t('c2bar') });
  const bw = (P.x(1) - P.x(0)) * 0.6;
  for (let m = 1; m <= 8; m++) {
    if (!s2.seen.has(m)) continue;
    const cnt = M.skeletons(m).length; ctx.fillStyle = m === n ? C.orange : 'rgba(103,215,249,0.7)';
    ctx.fillRect(P.x(m) - bw / 2, P.y(cnt), bw, P.y(0) - P.y(cnt));
    label(ctx, String(cnt), P.x(m), P.y(cnt) - 4, bw + 8, { size: 11, color: C.text });
  }
  const f = M.formulaText(M.formula(S[0]));
  const more = n === 1 ? t('r2one') : S.length === M.skeletons(n - 1).length ? t('r2one') : t('r2more', { m: n - 1, d: S.length - M.skeletons(n - 1).length });
  $('r2').textContent = t('r2', { n, c: S.length, f, more: S.length === 1 ? t('r2one') : more });
}

/* ---------- step 3 ---------- */
const s3 = { n: 6, id: 'hexane' };
function buildIso3() {
  const row = $('iso3'); row.innerHTML = '';
  M.byN(s3.n).forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle small'; b.id = 'iso_' + a.id; b.dataset.step = '3'; b.addEventListener('click', () => { s3.id = a.id; draw3(); }); row.appendChild(b); });
}
function draw3() {
  [5, 6, 7].forEach(n => $('n3_' + n).setAttribute('aria-pressed', String(s3.n === n)));
  const L = M.byN(s3.n), sel = L.find(a => a.id === s3.id);
  L.forEach(a => { const b = $('iso_' + a.id); b.textContent = t('iso_' + a.id); b.setAttribute('aria-pressed', String(a.id === s3.id)); });
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3top'), 8, 20, W - 16);
  drawSkeleton(ctx, sel.g, layout(sel.g, M.longestPath(sel.g)), { x: 8, y: 28, w: W - 16, h: 110 }, { maxD: 40, col: C.orange });
  const Ws = L.map(a => a.W), Bs = L.map(a => a.bp);
  const xMin = Math.min(...Ws) - 1, xMax = Math.max(...Ws) + 1, yMin = Math.floor((Math.min(...Bs) - 4) / 5) * 5, yMax = Math.ceil((Math.max(...Bs) + 4) / 5) * 5;
  const P = panel(ctx, W, { top: 192, bottom: H - 46, left: 44, xMin, xMax, yMin, yMax, yTicks: niceTicks(yMin, yMax, 5), xTicks: niceTicks(xMin, xMax, Math.max(3, Math.min(8, Math.floor((W - 60) / 40)))), title: t('c3bot') });
  label(ctx, t('axisW'), (P.P.l + P.P.r) / 2, H - 10, W - 20, { size: 11, color: C.muted });
  L.forEach(a => { if (a.id !== s3.id) dot(ctx, P.x(a.W), P.y(a.bp), 5, C.text); });
  dot(ctx, P.x(sel.W), P.y(sel.bp), 8, C.orange);
  const tr = M.trend(s3.n);
  $('r3').textContent = t('r3', { name: t('iso_' + sel.id), W: sel.W, bp: temp(sel.bp), N: L.length, agree: tr.agree, total: tr.total });
}

/* ---------- step 4 ---------- */
const s4 = { id: 'ethanol' };
function buildFn4() {
  M.FUNCTIONAL.forEach(f => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle small'; b.id = 'fn_' + f.id; b.dataset.step = '4'; b.addEventListener('click', () => { s4.id = f.id; draw4(); }); $('fn4').appendChild(b); });
}
function groupGap(fm) {
  const grp = M.FUNCTIONAL.filter(f => M.formulaText(M.formula(f.g)) === fm);
  return Math.min(...grp.filter(f => f.kind === 'alcohol').map(f => f.bp)) - Math.max(...grp.filter(f => f.kind === 'ether').map(f => f.bp));
}
function draw4() {
  const sel = M.FUNCTIONAL.find(f => f.id === s4.id);
  M.FUNCTIONAL.forEach(f => { const b = $('fn_' + f.id); b.textContent = `${t('fn_' + f.id)} · ${M.formulaText(M.formula(f.g))}`; b.setAttribute('aria-pressed', String(f.id === s4.id)); });
  const { ctx, W, H } = fitCanvas($('c4'));
  drawBalls(ctx, sel.g, { x: 8, y: 8, w: W - 16, h: 170 }, { ohRing: true, maxD: 52 });
  const P = panel(ctx, W, { top: 222, bottom: H - 40, left: 44, xMin: 0, xMax: 6, yMin: -40, yMax: 120, yTicks: [-40, 0, 40, 80, 120], yFmt: v => temp(v).replace('.0', ''), title: t('c4bot') });
  const xs = [0.7, 1.7, 3.4, 4.4, 5.4];
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.P.l, P.y(0)); ctx.lineTo(P.P.r, P.y(0)); ctx.stroke();
  M.FUNCTIONAL.forEach((f, i) => {
    const X = P.x(xs[i]), bw = Math.min(46, (P.x(1) - P.x(0)) * 0.7), y0 = P.y(0), y1 = P.y(f.bp);
    ctx.fillStyle = f.kind === 'alcohol' ? 'rgba(103,215,249,0.75)' : 'rgba(255,180,84,0.75)'; ctx.fillRect(X - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0));
    if (f.id === s4.id) { ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.strokeRect(X - bw / 2 - 2, Math.min(y0, y1) - 2, bw + 4, Math.abs(y1 - y0) + 4); }
  });
  label(ctx, 'C₂H₆O', P.x(1.2), H - 14, P.x(2.5) - P.x(0), { size: 12, color: C.muted });
  label(ctx, 'C₃H₈O', P.x(4.4), H - 14, P.x(3.2) - P.x(0), { size: 12, color: C.muted });
  const fm = M.formulaText(M.formula(sel.g));
  $('r4').textContent = t('r4', { name: t('fn_' + sel.id), kind: t('kind_' + sel.kind), f: fm, oh: M.ohCount(sel.g), bp: temp(sel.bp), gap: fix(groupGap(fm), 1) });
}

/* ---------- step 5 ---------- */
const s5 = { kind: 'single', tried: new Set([0]) };
function draw5() {
  const th = Number($('th5').value), E = M.torsion(s5.kind, th);
  $('th5v').textContent = th + '°';
  $('b5s').setAttribute('aria-pressed', String(s5.kind === 'single')); $('b5d').setAttribute('aria-pressed', String(s5.kind === 'double'));
  const { ctx, W, H } = fitCanvas($('c5'));
  // side view along the middle bond
  const L = Math.min(70, W * 0.16), cx = W / 2, cy = 100, a = [cx - L / 2, cy], b = [cx + L / 2, cy];
  const r = th * Math.PI / 180, c1 = [a[0] - 0.5 * L, cy - 0.87 * L], z = Math.sin(r), c4 = [b[0] + 0.5 * L, cy - 0.87 * L * Math.cos(r)];
  ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(c4[0], cy - 0.87 * L); ctx.lineTo(c4[0], cy + 0.87 * L); ctx.stroke(); ctx.restore();
  const bond = (p, q, w = 4) => { ctx.strokeStyle = C.bond; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
  bond(c1, a);
  if (s5.kind === 'double') { const off = 5; ctx.strokeStyle = C.bond; ctx.lineWidth = 3; [-off, off].forEach(o => { ctx.beginPath(); ctx.moveTo(a[0], cy + o); ctx.lineTo(b[0], cy + o); ctx.stroke(); }); } else bond(a, b);
  const back = z < 0;
  const drawC4 = () => { bond(b, c4, 4 + 1.5 * z); dot(ctx, c4[0], c4[1], 11 * (1 + 0.3 * z), C.c); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c4[0], c4[1], 11 * (1 + 0.3 * z) + 2, 0, 7); ctx.stroke(); };
  if (back) drawC4();
  dot(ctx, a[0], a[1], 9, C.c); dot(ctx, b[0], b[1], 9, C.c); dot(ctx, c1[0], c1[1], 11, C.c);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c1[0], c1[1], 13, 0, 7); ctx.stroke();
  if (!back) drawC4();
  // energy curve
  const yMax = s5.kind === 'single' ? 20 : 300;
  const P = panel(ctx, W, { top: 222, bottom: H - 28, left: 46, xMin: 0, xMax: 360, yMin: 0, yMax, yTicks: s5.kind === 'single' ? [0, 5, 10, 15, 20] : [0, 100, 200, 300], xTicks: W < 360 ? [0, 180, 360] : [0, 90, 180, 270, 360], xFmt: v => v + '°', title: t('c5bot') });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let d = 0; d <= 360; d += 2) { const X = P.x(d), Y = P.y(M.torsion(s5.kind, d)); if (d) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.pink; ctx.beginPath(); ctx.moveTo(P.P.l, P.y(M.RT)); ctx.lineTo(P.P.r, P.y(M.RT)); ctx.stroke(); ctx.restore();
  s5.tried.forEach(d => { if (d !== th) dot(ctx, P.x(d), P.y(M.torsion(s5.kind, d)), 3.4, C.text); });
  dot(ctx, P.x(th), P.y(E), 6.5, C.orange);
  let max = 0; for (let d = 0; d <= 360; d++) max = Math.max(max, M.torsion(s5.kind, d));
  const x = fix(max / M.RT, 0);
  const st = s5.kind === 'single' ? t('stS', { max: fix(max, 0), x }) : (th % 360 <= 20 || th % 360 >= 340) ? t('stCis', { max: fix(max, 0), x }) : Math.abs(th - 180) <= 20 ? t('stTrans', { max: fix(max, 0), x }) : t('stMid');
  $('r5').textContent = t('r5', { bond: t(s5.kind === 'single' ? 'bondS' : 'bondD'), th, E: fix(E, 1), f: sci(M.boltz(E)), rt: fix(M.RT, 2), state: st });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['C', 'H', 'L'].forEach(k => $('h0' + k).addEventListener('click', () => { s0.hl = k; draw0(); }));

  [5, 6, 7].forEach(n => $('n1_' + n).addEventListener('click', () => { s1.n = n; s1.k = 0; s1.answered = null; draw1(); }));
  const answer = v => { if (s1.answered !== null) return; s1.answered = v; s1.total++; if (v === M.question(s1.n, s1.k).same) s1.right++; draw1(); };
  $('same1').addEventListener('click', () => answer(true)); $('diff1').addEventListener('click', () => answer(false));
  $('next1').addEventListener('click', () => { s1.k++; s1.answered = null; draw1(); });
  $('reset1').addEventListener('click', () => { s1.k = 0; s1.answered = null; s1.right = 0; s1.total = 0; draw1(); });

  $('n2').addEventListener('input', draw2);
  $('check2').addEventListener('click', () => {
    const c = document.querySelector('input[name="q2"]:checked'), good = !!c && c.value === 'b';
    $('fb2').textContent = t(good ? 'fb2ok' : 'fb2no'); $('fb2').style.color = good ? C.green : C.orange; $('fb2').dataset.state = good ? 'correct' : 'wrong';
  });

  [5, 6, 7].forEach(n => $('n3_' + n).addEventListener('click', () => { s3.n = n; s3.id = M.byN(n)[0].id; buildIso3(); draw3(); }));
  buildIso3(); buildFn4();

  $('b5s').addEventListener('click', () => { s5.kind = 'single'; s5.tried = new Set([Number($('th5').value)]); draw5(); });
  $('b5d').addEventListener('click', () => { s5.kind = 'double'; s5.tried = new Set([Number($('th5').value)]); draw5(); });
  $('th5').addEventListener('input', () => { s5.tried.add(Number($('th5').value)); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshIsomers = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
