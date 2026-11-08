/* prisoners-dilemma: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function setup(c) {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const w = Math.max(200, Math.round(c.getBoundingClientRect().width || 300));
  const ratio = (w >= 560 && c.dataset.wide) ? +c.dataset.wide : +c.dataset.ratio;
  const h = Math.round(w * ratio);
  c.style.height = h + 'px';
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h, wide: w >= 560 };
}
function text(ctx, s, x, y, o) { o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.fillText(s, x, y); }
function line(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function slider(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value); const o = $(id + 'v'); if (o) o.textContent = e.value; }); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const PAY = { T: 5, R: 3, P: 1, S: 0 };
/* Payoff to the player choosing a against an opponent choosing b (1 = cooperate, 0 = defect). */
const payoff = (a, b) => a ? (b ? PAY.R : PAY.S) : (b ? PAY.T : PAY.P);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
/* A strategy sees its own and the opponent's past moves and returns 1 (cooperate) or 0 (defect). */
const STRAT = {
  allc: () => 1, alld: () => 0,
  tft: (me, op) => op.length ? op[op.length - 1] : 1,
  grim: (me, op) => op.includes(0) ? 0 : 1,
  rand: (me, op, r) => r() < 0.5 ? 1 : 0,
  gtft: (me, op, r, g) => op.length && op[op.length - 1] === 0 ? (r() < g ? 1 : 0) : 1
};
const NAMES = ['allc', 'alld', 'tft', 'grim', 'rand'];
/* Play n rounds; with probability noise a chosen move is flipped by mistake. Returns both histories and total scores. */
function play(sa, sb, n, noise, seed, g) { const r = rng(seed), ha = [], hb = []; let A = 0, B = 0; for (let i = 0; i < n; i++) { let a = STRAT[sa](ha, hb, r, g), b = STRAT[sb](hb, ha, r, g); if (noise && r() < noise) a = 1 - a; if (noise && r() < noise) b = 1 - b; ha.push(a); hb.push(b); A += payoff(a, b); B += payoff(b, a); } return { ha, hb, A, B }; }
function tournament(n, seed) { const m = NAMES.map(() => NAMES.map(() => 0)); NAMES.forEach((a, i) => NAMES.forEach((b, j) => { let tot = 0; const reps = a === 'rand' || b === 'rand' ? 40 : 1; for (let k = 0; k < reps; k++) tot += play(a, b, n, 0, seed + k * 7 + i * 31 + j).A; m[i][j] = tot / reps; })); const total = m.map(row => row.reduce((s, v) => s + v, 0)); return { m, total }; }
const POP = ['allc', 'alld', 'tft'];
const matchMatrix = n => POP.map(a => POP.map(b => play(a, b, n, 0, 1).A));
/* One generation of replicator dynamics: each strategy's share grows in proportion to its average score. */
function replicator(x, M) { const f = M.map(row => row.reduce((s, v, j) => s + v * x[j], 0)), fb = f.reduce((s, v, i) => s + v * x[i], 0); if (fb <= 0) return x.slice(); return x.map((v, i) => v * f[i] / fb); }
function evolve(x0, n, gens) { const M = matchMatrix(n), path = [x0]; for (let k = 0; k < gens; k++) path.push(replicator(path[path.length - 1], M)); return { path, M }; }
/* Value of cooperating forever versus defecting now, when each round is followed by another with probability d. */
const coopValue = d => PAY.R / (1 - d), defectValue = d => PAY.T + PAY.P * d / (1 - d), dStar = (PAY.T - PAY.R) / (PAY.T - PAY.P);
function noisyAvg(sa, n, noise, g, seed) { const r = play(sa, sa, n, noise, seed, g); return r.A / n; }
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100);
const S = { me0: -1, op0: -1, a1: 'tft', b1: 'alld', n1: 12, seed1: 1, n2: 10, n3d: 0.7, ex4: 0.1, tft4: 0.1, n4: 20, gen4: 1, raf4: 0, noise5: 0.05, g5: 0.33, seed5: 3, a1h: 0 };
const NAME_KEY = { allc: 'nAllC', alld: 'nAllD', tft: 'nTft', grim: 'nGrim', rand: 'nRand', gtft: 'nGtft' };
const nm = id => t(NAME_KEY[id]);
function axes(ctx, R, xm, ym, xl, yl, xt, yt) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); const X = v => R.x + v / xm * R.w, Y = v => R.y + R.h - v / ym * R.h; xt.forEach(v => text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 })); yt.forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, String(v), R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); }); if (xl) text(ctx, xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); if (yl) text(ctx, yl, R.x, R.y - 5, { size: 11 }); return { X, Y }; }
function render0() { const { ctx, w, h } = setup($('cv0')), x0 = 70, y0 = 46, cw = Math.min(150, (w - x0 - 14) / 2), ch = Math.min(96, (h - y0 - 20) / 2), cells = [[1, 1], [1, 0], [0, 1], [0, 0]];
  text(ctx, t('opMoves'), x0 + cw, 18, { align: 'center', size: 12, color: COL.violet }); text(ctx, t('myMoves'), 6, y0 + ch, { size: 12, color: COL.cyan }); ['mC', 'mD'].forEach((k, i) => { text(ctx, t(k), x0 + cw * (i + 0.5), 38, { align: 'center', size: 13, color: COL.violet }); text(ctx, t(k), x0 - 8, y0 + ch * (i + 0.5) + 5, { align: 'right', size: 13, color: COL.cyan }); });
  cells.forEach(([a, b]) => { const cx = x0 + (b ? 0 : cw), cy = y0 + (a ? 0 : ch), sel = S.me0 === a && S.op0 === b, hint = S.op0 === b && S.me0 < 0, best = S.op0 >= 0 && a === (payoff(1, S.op0) > payoff(0, S.op0) ? 1 : 0); ctx.fillStyle = sel ? 'rgba(246,164,91,0.35)' : best ? 'rgba(116,223,170,0.2)' : '#101d2a'; ctx.fillRect(cx + 2, cy + 2, cw - 4, ch - 4); ctx.strokeStyle = sel ? COL.orange : COL.grid; ctx.lineWidth = sel ? 3 : 1; ctx.strokeRect(cx + 2, cy + 2, cw - 4, ch - 4);
    text(ctx, String(payoff(a, b)), cx + cw * 0.3, cy + ch * 0.6, { align: 'center', size: 24, color: COL.cyan, bold: true }); text(ctx, String(payoff(b, a)), cx + cw * 0.7, cy + ch * 0.6, { align: 'center', size: 24, color: COL.violet, bold: true }); });
  ['pc', 'pd'].forEach((k, i) => { const b = $('op0_' + i); b.classList.toggle('active', S.op0 === (i ? 0 : 1)); }); ['pc', 'pd'].forEach((k, i) => { $('me0_' + i).classList.toggle('active', S.me0 === (i ? 0 : 1)); });
  let ro; if (S.op0 < 0) ro = t('s0ro0'); else { const b = payoff(0, S.op0) > payoff(1, S.op0) ? 'D' : 'C'; ro = S.me0 < 0 ? t('s0roBest', { op: t(S.op0 ? 'mC' : 'mD'), best: t(b === 'D' ? 'mD' : 'mC'), d: payoff(0, S.op0), c: payoff(1, S.op0) }) : t('s0roPick', { me: t(S.me0 ? 'mC' : 'mD'), op: t(S.op0 ? 'mC' : 'mD'), pm: payoff(S.me0, S.op0), po: payoff(S.op0, S.me0), best: t(b === 'D' ? 'mD' : 'mC'), both: PAY.R }); } $('ro0').textContent = ro; }
function render1() { const { ctx, w, h } = setup($('cv1')), n = S.n1, r = play(S.a1, S.b1, n, 0, S.seed1), R = { x: 14, y: 22, w: w - 28, h: 40 }, sz = Math.min(24, (R.w - 4) / n), pad = (R.w - sz * n) / 2;
  [[r.ha, 30, COL.cyan], [r.hb, 82, COL.violet]].forEach(([hist, y, col], k) => { text(ctx, nm(k ? S.b1 : S.a1), pad, y - 6, { size: 12, color: col }); hist.forEach((m, i) => { ctx.fillStyle = m ? 'rgba(116,223,170,0.65)' : 'rgba(224,100,78,0.75)'; ctx.fillRect(pad + i * sz + 1, y, sz - 2, 34); text(ctx, t(m ? 'cShort' : 'dShort'), pad + i * sz + sz / 2, y + 22, { align: 'center', size: Math.min(13, sz - 6), color: '#0a0e14', bold: true }); }); });
  const L = { x: 40, y: 134, w: w - 56, h: h - 176 }, cum = (ha, hb) => { let s = 0; return ha.map((a, i) => (s += payoff(a, hb[i]))); }, ca = cum(r.ha, r.hb), cb = cum(r.hb, r.ha), ym = Math.max(5, ...ca, ...cb) * 1.05, M = axes(ctx, L, n, ym, t('roundAxis'), t('scoreAxis'), [0, Math.round(n / 2), n], [0, Math.round(ym / 2), Math.round(ym)]);
  [[ca, COL.cyan], [cb, COL.violet]].forEach(([c, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(M.X(0), M.Y(0)); c.forEach((v, i) => ctx.lineTo(M.X(i + 1), M.Y(v))); ctx.stroke(); });
  ['allc', 'alld', 'tft', 'grim', 'rand'].forEach(id => { $('a1_' + id).classList.toggle('active', S.a1 === id); $('b1_' + id).classList.toggle('active', S.b1 === id); }); $('n1v').textContent = n; $('ro1').textContent = t('s1ro', { a: nm(S.a1), b: nm(S.b1), n, sa: r.A, sb: r.B, ca: r.ha.filter(v => v).length, cb: r.hb.filter(v => v).length }); }
function render2() { const { ctx, w, h } = setup($('cv2')), n = S.n2, T = tournament(n, 5), mx = Math.max(...T.total, 1), order = NAMES.map((_, i) => i).sort((a, b) => T.total[b] - T.total[a]), R = { x: 14, y: 14, w: w - 28, h: h - 28 };
  const barW = R.w * 0.46, rowH = Math.min(46, R.h / 5); order.forEach((i, k) => { const y = R.y + k * rowH; text(ctx, nm(NAMES[i]), R.x, y + rowH * 0.45, { size: 13, color: COL.ink }); const bw = (barW - 90) * T.total[i] / mx; ctx.fillStyle = k === 0 ? COL.orange : COL.cyan; ctx.fillRect(R.x + 88, y + 6, bw, rowH - 14); text(ctx, f1(T.total[i]), R.x + 92 + bw, y + rowH * 0.5 + 3, { size: 12, color: COL.ink }); });
  const hx = R.x + R.w * 0.52, cs = Math.min(36, (R.w * 0.46) / 6); text(ctx, t('rowVs'), hx, R.y + 10, { size: 11 }); NAMES.forEach((a, j) => text(ctx, t(NAME_KEY[a] + 'S'), hx + cs * (j + 1.5), R.y + 30, { align: 'center', size: 10 })); NAMES.forEach((a, i) => { text(ctx, t(NAME_KEY[a] + 'S'), hx + cs * 0.7, R.y + 56 + i * cs, { align: 'center', size: 10 }); NAMES.forEach((b, j) => { const v = T.m[i][j], f = v / (5 * n); ctx.fillStyle = 'rgba(103,215,249,' + (0.12 + 0.7 * f) + ')'; ctx.fillRect(hx + cs * (j + 1) + 1, R.y + 40 + i * cs + 1, cs - 2, cs - 2); text(ctx, String(Math.round(v)), hx + cs * (j + 1.5), R.y + 40 + i * cs + cs / 2 + 4, { align: 'center', size: 10, color: COL.ink }); }); });
  $('n2v').textContent = n; $('ro2').textContent = t('s2ro', { n, win: nm(NAMES[order[0]]), ws: f1(T.total[order[0]]), tft: f1(T.total[2]), alld: f1(T.total[1]) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), d = S.n3d, R = { x: 44, y: 22, w: w - 60, h: h - 62 }, ym = 30, xm = 0.95, M = axes(ctx, R, xm, ym, t('deltaAxis'), t('valueAxis'), [0, 0.2, 0.4, 0.6, 0.8], [0, 10, 20, 30]); ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  const cv = (fn, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 190; i++) { const x = 0.95 * i / 190, y = fn(x); i ? ctx.lineTo(M.X(x), M.Y(y)) : ctx.moveTo(M.X(x), M.Y(y)); } ctx.stroke(); }; cv(coopValue, COL.green); cv(defectValue, COL.red); ctx.restore();
  line(ctx, M.X(dStar), M.Y(0), M.X(dStar), M.Y(ym), COL.violet, 1.5, [4, 4]); text(ctx, t('dstarLabel', { d: dStar }), M.X(dStar) + 6, R.y + R.h - 8, { size: 11, color: COL.violet }); line(ctx, M.X(d), M.Y(0), M.X(d), M.Y(ym), COL.orange, 2); dot(ctx, M.X(d), M.Y(Math.min(ym, coopValue(d))), 5, COL.green); dot(ctx, M.X(d), M.Y(Math.min(ym, defectValue(d))), 5, COL.red);
  text(ctx, t('legCoop'), R.x + 8, R.y + 16, { size: 12, color: COL.green }); text(ctx, t('legDef'), R.x + 8, R.y + 32, { size: 12, color: COL.red }); $('d3v').textContent = d;
  $('ro3').textContent = t('s3ro', { d, len: f1(1 / (1 - d)), c: f2(coopValue(d)), x: f2(defectValue(d)), verdict: t(coopValue(d) >= defectValue(d) ? 'vCoop' : 'vDef'), ds: dStar }); }
function tern(R, x) { const ax = [R.x + R.w * 0.1, R.y + R.h * 0.88], bx = [R.x + R.w * 0.9, R.y + R.h * 0.88], cx = [R.x + R.w * 0.5, R.y + R.h * 0.13]; return [x[0] * ax[0] + x[1] * bx[0] + x[2] * cx[0], x[0] * ax[1] + x[1] * bx[1] + x[2] * cx[1]]; }
function render4() { const { ctx, w, h, wide } = setup($('cv4')), R = wide ? { x: 0, y: 0, w: w * 0.6, h } : { x: 0, y: 0, w, h: h * 0.66 }, d = S.ex4, tf = Math.min(S.tft4, 1 - d), x0 = [Math.max(0, 1 - d - tf), d, tf], ev = evolve(x0, S.n4, 80), k = Math.floor((ev.path.length - 1) * S.gen4), cur = ev.path[k], A = tern(R, [1, 0, 0]), B = tern(R, [0, 1, 0]), C = tern(R, [0, 0, 1]);
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath(); ctx.stroke(); text(ctx, nm('allc'), A[0], A[1] + 18, { align: 'center', size: 12, color: COL.cyan }); text(ctx, nm('alld'), B[0], B[1] + 18, { align: 'center', size: 12, color: COL.red }); text(ctx, nm('tft'), C[0], C[1] - 8, { align: 'center', size: 12, color: COL.green });
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ev.path.slice(0, k + 1).forEach((x, i) => { const p = tern(R, x); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); const s0 = tern(R, x0), p = tern(R, cur); dot(ctx, s0[0], s0[1], 4, COL.ink); dot(ctx, p[0], p[1], 6, COL.orange);
  const bx = wide ? w * 0.6 : 14, by = wide ? 24 : h * 0.7, bl = wide ? 80 : Math.min(200, w - 190), gap = wide ? 26 : 22; [['allc', COL.cyan], ['alld', COL.red], ['tft', COL.green]].forEach(([id, col], i) => { const v = cur[i]; text(ctx, nm(id), bx, by + i * gap + 12, { size: 12, color: col }); ctx.fillStyle = COL.dim; ctx.fillRect(bx + 112, by + i * gap, bl, 14); ctx.fillStyle = col; ctx.fillRect(bx + 112, by + i * gap, bl * v, 14); text(ctx, Math.round(v * 100) + '%', bx + 118 + bl, by + i * gap + 12, { size: 11 }); });
  text(ctx, t('genLabel', { g: k, n: 80 }), bx, by + 3 * gap + 14, { size: 12, color: COL.orange }); $('ex4v').textContent = S.ex4; $('tft4v').textContent = S.tft4; $('n4v').textContent = S.n4;
  const fin = ev.path[ev.path.length - 1], win = fin.indexOf(Math.max(...fin)); $('ro4').textContent = t('s4ro', { n: S.n4, a: Math.round(x0[0] * 100), d: Math.round(x0[1] * 100), f: Math.round(x0[2] * 100), wn: nm(POP[win]), wp: Math.round(fin[win] * 100), tdd: ev.M[2][1], ddd: ev.M[1][1], ttt: ev.M[2][2], dtt: ev.M[1][2] }); }
function render5() { const { ctx, w, h } = setup($('cv5')), R = { x: 44, y: 22, w: w - 60, h: h - 62 }, M = axes(ctx, R, 0.2, 3.2, t('noiseAxis'), t('perRoundAxis'), [0, 0.05, 0.1, 0.15, 0.2], [0, 1, 2, 3]), pts = [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2];
  const cvv = (id, col, g) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach((e, i) => { const y = noisyAvg(id, 3000, e, g, S.seed5); i ? ctx.lineTo(M.X(e), M.Y(y)) : ctx.moveTo(M.X(e), M.Y(y)); }); ctx.stroke(); }; cvv('tft', COL.red, 0); cvv('gtft', COL.green, S.g5);
  const a = noisyAvg('tft', 3000, S.noise5, 0, S.seed5), b = noisyAvg('gtft', 3000, S.noise5, S.g5, S.seed5); line(ctx, M.X(S.noise5), M.Y(0), M.X(S.noise5), M.Y(3.2), COL.orange, 1.5, [4, 3]); dot(ctx, M.X(S.noise5), M.Y(a), 5, COL.red); dot(ctx, M.X(S.noise5), M.Y(b), 5, COL.green); text(ctx, t('legTft'), R.x + 8, R.y + 16, { size: 12, color: COL.red }); text(ctx, t('legGtft', { g: S.g5 }), R.x + 8, R.y + 32, { size: 12, color: COL.green }); $('noise5v').textContent = S.noise5; $('g5v').textContent = S.g5;
  $('ro5').textContent = t('s5ro', { e: S.noise5, g: S.g5, a: f2(a), b: f2(b), best: PAY.R }); }
function replay4() { cancelAnimationFrame(S.raf4); if (reduceMotion()) { S.gen4 = 1; render4(); return; } S.gen4 = 0; const t0 = performance.now(); const tick = now => { S.gen4 = Math.max(0, Math.min(1, (now - t0) / 5000)); render4(); if (S.gen4 < 1) S.raf4 = requestAnimationFrame(tick); }; S.raf4 = requestAnimationFrame(tick); }
function onHide() { cancelAnimationFrame(S.raf4); S.gen4 = 1; render4(); }
function wire() {
  [0, 1].forEach(i => { $('op0_' + i).addEventListener('click', () => { S.op0 = i ? 0 : 1; render0(); }); $('me0_' + i).addEventListener('click', () => { S.me0 = i ? 0 : 1; render0(); }); }); $('rs0').addEventListener('click', () => { S.me0 = -1; S.op0 = -1; render0(); });
  ['allc', 'alld', 'tft', 'grim', 'rand'].forEach(id => { $('a1_' + id).addEventListener('click', () => { S.a1 = id; render1(); }); $('b1_' + id).addEventListener('click', () => { S.b1 = id; render1(); }); }); slider('n1', v => { S.n1 = v; render1(); }); $('nw1').addEventListener('click', () => { S.seed1++; render1(); });
  slider('n2', v => { S.n2 = v; render2(); }); slider('d3', v => { S.n3d = v; render3(); });
  slider('ex4', v => { cancelAnimationFrame(S.raf4); S.gen4 = 1; S.ex4 = v; render4(); }); slider('tft4', v => { cancelAnimationFrame(S.raf4); S.gen4 = 1; S.tft4 = v; render4(); }); slider('n4', v => { cancelAnimationFrame(S.raf4); S.gen4 = 1; S.n4 = v; render4(); }); $('rp4').addEventListener('click', replay4);
  slider('noise5', v => { S.noise5 = v; render5(); }); slider('g5', v => { S.g5 = v; render5(); });
}

const RENDERS = [typeof render0 === 'function' && render0, typeof render1 === 'function' && render1, typeof render2 === 'function' && render2, typeof render3 === 'function' && render3, typeof render4 === 'function' && render4, typeof render5 === 'function' && render5].filter(Boolean);
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && typeof onHide === 'function') onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { PAY, payoff, play, tournament, matchMatrix, replicator, evolve, coopValue, defectValue, dStar, noisyAvg, STRAT, NAMES, POP };
