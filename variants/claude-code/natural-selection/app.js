'use strict';
// Natural-selection lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every survival rate, share, curve, lag and tally comes from window.NATSEL_MODEL (model.js).
// Canvas text is limited to panel titles and axis ticks laid out in fixed rows.
(function () {

const $ = id => document.getElementById(id);
const M = window.NATSEL_MODEL;
const t = (...a) => window.NATSEL_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', dim: '#4a5f78', grey: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const trim = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const fx = (v, d) => trim(v.toFixed(d));
const pct = (v, d = 1) => fx(100 * v, d);
let seedCounter = 500;
const nextSeed = () => ++seedCounter;

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
function fitText(ctx, text, x, y, maxW, { size = 12, min = 8, weight = '', color = C.text, align = 'left' } = {}) {
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > min);
  ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y);
}
function title(ctx, text, X, Y, maxW) { ctx.save(); fitText(ctx, text, X, Y, maxW, { weight: '600' }); ctx.restore(); }
// Tone 0 (pale lichen grey-cream) → 1 (soot black).
function toneColor(v) {
  const a = [222, 214, 196], b = [34, 33, 38], k = Math.max(0, Math.min(1, v));
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * k)).join(',')})`;
}
// Axes for a plot; returns mappers. o: l, r, t, b, xMin, xMax, yMin, yMax, yTicks, yFmt, xTicks
function axes(ctx, o) {
  const x = v => o.l + (v - o.xMin) / (o.xMax - o.xMin) * (o.r - o.l), y = v => o.b - (v - o.yMin) / (o.yMax - o.yMin) * (o.b - o.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.lineWidth = 1;
  o.yTicks.forEach(v => { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(o.l, y(v)); ctx.lineTo(o.r, y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(o.yFmt(v), o.l - 6, y(v) + 4); });
  (o.xTicks || []).forEach(v => { ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(String(v), x(v), o.b + 15); });
  ctx.restore();
  return { x, y };
}
const xTicksFor = (min, max, px, steps) => { const st = steps.find(s => (max - min) / s * 34 <= px) || steps[steps.length - 1]; const out = []; for (let v = Math.ceil(min / st) * st; v <= max + 1e-9; v += st) out.push(v); return out; };
function line(ctx, pts, color, lw, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function moth(ctx, x, y, size, tone, angle = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 0.25);
  ctx.fillStyle = toneColor(tone); ctx.strokeStyle = 'rgba(120,120,120,0.35)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, -size * 0.25); ctx.lineTo(-size, size * 0.45); ctx.lineTo(-size * 0.2, size * 0.55); ctx.lineTo(0, size * 0.2); ctx.lineTo(size * 0.2, size * 0.55); ctx.lineTo(size, size * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function bark(ctx, x0, y0, w, h, tone, seed = 3) {
  ctx.fillStyle = toneColor(tone); ctx.fillRect(x0, y0, w, h);
  const r = M.rng(seed);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  for (let i = 0; i < w / 6; i++) { const X = x0 + r() * w; ctx.strokeStyle = toneColor(Math.min(1, tone + 0.08 + r() * 0.06)); ctx.globalAlpha = 0.5; ctx.lineWidth = 1 + r() * 2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X + (r() - 0.5) * 10, y0 + h); ctx.stroke(); }
  const lichen = Math.max(0, 1 - tone / 0.5);
  if (lichen > 0) for (let i = 0; i < w * h / 900; i++) { ctx.globalAlpha = 0.35 * lichen; ctx.fillStyle = '#b9c7a6'; ctx.beginPath(); ctx.ellipse(x0 + r() * w, y0 + r() * h, 4 + r() * 10, 3 + r() * 6, r() * 3, 0, 7); ctx.fill(); }
  ctx.restore();
}

/* ---------- shared animation runner ---------- */
const anims = {};
function animate(key, ms, frame, done) {
  stopAnim(key);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[key] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[key]; if (done) done(); }
  };
  anims[key] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(key) { if (anims[key]) { cancelAnimationFrame(anims[key].id); delete anims[key]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: one season ---------- */
const s0 = { moths: M.makeMoths(30, 11), hunted: false };
function draw0() {
  const b = num('b0'); $('b0v').textContent = fx(b, 2);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0title'), 8, 18, W - 16);
  const X0 = 8, Y0 = 28, BW = W - 16, BH = H - 36;
  bark(ctx, X0, Y0, BW, BH, b);
  const size = Math.max(7, Math.min(13, BW / 50));
  s0.moths.forEach(m => {
    const x = X0 + size + m.x * (BW - 2 * size), y = Y0 + size + m.y * (BH - 2 * size);
    ctx.save(); if (s0.hunted && !m.alive) ctx.globalAlpha = 0.35;
    moth(ctx, x, y, size, M.TONE[m.kind], m.a); ctx.restore();
    if (s0.hunted && !m.alive) { ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - size * 0.6, y - size * 0.5); ctx.lineTo(x + size * 0.6, y + size * 0.6); ctx.moveTo(x + size * 0.6, y - size * 0.5); ctx.lineTo(x - size * 0.6, y + size * 0.6); ctx.stroke(); ctx.restore(); }
  });
  let txt = t('s0readout', { bark: fx(b, 2), wl: pct(M.wL(b)), wd: pct(M.wD(b)) });
  if (s0.hunted) {
    const cnt = k => s0.moths.filter(m => m.kind === k), al = k => cnt(k).filter(m => m.alive).length;
    txt += ' ' + t('s0hunted', { sl: al('light'), nl: cnt('light').length, pl: pct(al('light') / cnt('light').length, 0), sd: al('dark'), nd: cnt('dark').length, pd: pct(al('dark') / cnt('dark').length, 0) });
  }
  txt += ' ' + t('s0equal', { eq: fx(M.EQUAL_BARK, 3) });
  $('r0').textContent = txt;
}

/* ---------- step 1: three conditions ---------- */
const GENS = 40;
const s1 = { cond: { variation: true, heredity: true, selection: true }, shown: GENS, hist: [] };
const COND = { condVar: 'variation', condHer: 'heredity', condSel: 'selection' };
const key1 = () => [num('p1'), num('b1'), s1.cond.variation, s1.cond.heredity, s1.cond.selection].join('|');
const run1 = () => M.run(num('p1'), num('b1'), s1.cond, GENS);
function commit1() { const k = key1(); s1.hist = s1.hist.filter(h => h.k !== k); s1.hist.push({ k, run: run1() }); if (s1.hist.length > 5) s1.hist.shift(); }
function draw1() {
  const p0 = num('p1'), b = num('b1'); $('p1v').textContent = pct(p0, 0) + '%'; $('b1v').textContent = fx(b, 2);
  Object.keys(COND).forEach(id => $(id).setAttribute('aria-pressed', s1.cond[COND[id]]));
  const run = run1(), g = Math.min(GENS, s1.shown), p = run[g];
  const { ctx, W, H } = fitCanvas($('c1'));
  // strip: 20 moths on the current bark
  title(ctx, t('c1strip'), 8, 18, W - 16);
  const sx = 8, sy = 26, sw = W - 16, sh = 40; ctx.fillStyle = '#6b7684'; ctx.fillRect(sx, sy, sw, sh); // neutral grey so both colours show
  const nD = Math.round(p * 20), size = Math.max(5, Math.min(11, sw / 20 / 2.4));
  for (let i = 0; i < 20; i++) moth(ctx, sx + (i + 0.5) * sw / 20, sy + sh / 2, size, i < nD ? M.TONE.dark : M.TONE.light);
  // chart
  title(ctx, t('c1title'), 8, sy + sh + 24, W - 16);
  const o = { l: 44, r: W - 12, t: sy + sh + 36, b: H - 24, xMin: 0, xMax: GENS, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v => Math.round(v * 100) + '%' };
  o.xTicks = xTicksFor(0, GENS, o.r - o.l, [5, 10, 20]);
  const A = axes(ctx, o), k = key1();
  s1.hist.forEach(h => { if (h.k !== k) line(ctx, h.run.map((v, i) => [A.x(i), A.y(v)]), C.dim, 1.8, 0.9); });
  line(ctx, run.slice(0, g + 1).map((v, i) => [A.x(i), A.y(v)]), C.orange, 2.6);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(A.x(g), A.y(p), 4.5, 0, 7); ctx.fill();
  let why;
  if (!s1.cond.variation) why = t('s1noVar');
  else if (!s1.cond.heredity) why = t('s1noHer', { p0: pct(p0, 0) });
  else if (!s1.cond.selection) why = t('s1noSel');
  else if (Math.abs(M.wD(b) - M.wL(b)) < 0.035) why = t('s1equal');
  else why = t('s1all', { wd: pct(M.wD(b)), wl: pct(M.wL(b)), dir: t(M.wD(b) > M.wL(b) ? 'dirUp' : 'dirDown') });
  $('r1').textContent = t('s1readout', { g, p: pct(p), p0: pct(s1.cond.variation ? p0 : 0, 0), why });
  $('h1').textContent = t('s1hint', { p0: pct(p0, 0) });
}
function play1() { s1.shown = 0; animate('play1', 4000, q => { s1.shown = Math.round(q * GENS); draw1(); }); }

/* ---------- step 2: how fast ---------- */
const XMAX2 = 100;
const s2 = { hist: [] };
const curve2 = b => { const r = M.advantage(b), l0 = M.logit(0.01); return Array.from({ length: XMAX2 + 1 }, (_, g) => l0 + g * Math.log(r)); };
const sig = l => 1 / (1 + Math.exp(-l));
function draw2() {
  const b = num('b2'); $('b2v').textContent = fx(b, 2);
  const r = M.advantage(b), gens = M.gensBetween(0.01, 0.99, r);
  const { ctx, W, H } = fitCanvas($('c2'));
  const half = (H - 20) / 2;
  title(ctx, t('c2top'), 8, 18, W - 16);
  const xt = xTicksFor(0, XMAX2, W - 56, [10, 20, 25, 50]);
  const A = axes(ctx, { l: 44, r: W - 12, t: 30, b: half - 10, xMin: 0, xMax: XMAX2, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => Math.round(v * 100) + '%', xTicks: xt });
  title(ctx, t('c2bot'), 8, half + 26, W - 16);
  const B = axes(ctx, { l: 44, r: W - 12, t: half + 38, b: H - 24, xMin: 0, xMax: XMAX2, yMin: -5, yMax: 5, yTicks: [-5, -2.5, 0, 2.5, 5], yFmt: v => fx(v, 1), xTicks: xt });
  const clampL = v => Math.max(-5, Math.min(5, v));
  s2.hist.forEach(hb => { if (Math.abs(hb - b) < 1e-9) return; const c = curve2(hb); line(ctx, c.map((l, g) => [A.x(g), A.y(sig(l))]), C.dim, 1.6); line(ctx, c.filter(l => l <= 5.2).map((l, g) => [B.x(g), B.y(clampL(l))]), C.dim, 1.6); });
  const c = curve2(b);
  line(ctx, c.map((l, g) => [A.x(g), A.y(sig(l))]), C.orange, 2.6);
  line(ctx, c.filter(l => l <= 5.2).map((l, g) => [B.x(g), B.y(clampL(l))]), C.orange, 2.6);
  if (gens <= XMAX2) { ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.45)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(gens), 30); ctx.lineTo(A.x(gens), H - 24); ctx.stroke(); ctx.restore(); }
  $('r2').textContent = t('s2readout', { bark: fx(b, 2), wd: pct(M.wD(b)), wl: pct(M.wL(b)), r: fx(r, 3), lnr: fx(Math.log(r), 3), gens: Math.round(gens) });
  const H0 = M.HISTORY, g = H0.end - H0.start, rn = M.rNeeded(H0.p1, H0.p2, g);
  $('r2h').textContent = t('s2history', { g, rn: fx(rn, 2), pct: Math.round(100 * (rn - 1)) });
}

/* ---------- step 3: soot, then clean air ---------- */
const s3 = { hist: null, k: null };
function draw3() {
  const year = num('y3'), K = num('k3');
  $('y3v').textContent = String(year); $('k3v').textContent = fx(K, 1);
  if (s3.k !== K) { s3.hist = M.history(K); s3.k = K; }
  const h = s3.hist, i = year - M.YEARS.from, now = h[i];
  $('s3e').innerHTML = t('s3e', { eq: fx(M.EQUAL_BARK, 3) });
  const { ctx, W, H } = fitCanvas($('c3'));
  const xt = xTicksFor(M.YEARS.from, M.YEARS.to, W - 56, [25, 50, 100]);
  title(ctx, t('c3top'), 8, 18, W - 16);
  const topB = 140;
  const A = axes(ctx, { l: 44, r: W - 12, t: 30, b: topB, xMin: M.YEARS.from, xMax: M.YEARS.to, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => fx(v, 1), xTicks: xt });
  // bark colour band behind the line
  const bandY = topB + 22;
  for (let yv = M.YEARS.from; yv < M.YEARS.to; yv++) { ctx.fillStyle = toneColor(M.barkAt(yv)); ctx.fillRect(A.x(yv), bandY, A.x(yv + 1) - A.x(yv) + 0.6, 10); }
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.4)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(M.YEARS.from), A.y(M.EQUAL_BARK)); ctx.lineTo(A.x(M.YEARS.to), A.y(M.EQUAL_BARK)); ctx.stroke(); ctx.restore();
  line(ctx, h.map(q => [A.x(q.year), A.y(q.bark)]), C.text, 2);
  title(ctx, t('c3bot'), 8, bandY + 34, W - 16);
  const B = axes(ctx, { l: 44, r: W - 12, t: bandY + 46, b: H - 24, xMin: M.YEARS.from, xMax: M.YEARS.to, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => Math.round(v * 100) + '%', xTicks: xt });
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.4)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.x(M.YEARS.from), B.y(0.5)); ctx.lineTo(B.x(M.YEARS.to), B.y(0.5)); ctx.stroke(); ctx.restore();
  line(ctx, h.slice(0, i + 1).map(q => [B.x(q.year), B.y(q.p)]), C.orange, 2.6);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(A.x(year), 30); ctx.lineTo(A.x(year), H - 24); ctx.stroke(); ctx.restore();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(B.x(year), B.y(now.p), 4.5, 0, 7); ctx.fill();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(year), A.y(now.bark), 4, 0, 7); ctx.fill();
  const c = M.crossings(K);
  let txt = t('s3readout', { year, bark: fx(now.bark, 2), p: pct(now.p) });
  if (c.pUp) txt += ' ' + (c.pDown ? t('s3lag', { bu: c.barkUp, pu: c.pUp, lu: c.pUp - c.barkUp, bd: c.barkDown, pd: c.pDown, ld: c.pDown - c.barkDown }) : t('s3lagNoDown', { bu: c.barkUp, pu: c.pUp, lu: c.pUp - c.barkUp, bd: c.barkDown }));
  $('r3').textContent = txt;
}
function play3() { const span = M.YEARS.to - M.YEARS.from; animate('play3', 8000, q => { $('y3').value = String(M.YEARS.from + Math.round(q * span)); draw3(); }); }

/* ---------- step 4: luck ---------- */
const P0 = 0.1;
const s4 = { lines: [], fix: 0, lost: 0, open: 0, runs: 0 };
function clear4() { s4.lines = []; s4.fix = s4.lost = s4.open = s4.runs = 0; }
function run4() {
  const N = M.N_STEPS[num('n4')], s = num('s4');
  const B = M.wfBatch(N, s, P0, 20, nextSeed());
  s4.lines = B; B.forEach(b => { s4[b.fate === 'fixed' ? 'fix' : b.fate === 'lost' ? 'lost' : 'open']++; s4.runs++; });
  draw4();
}
function draw4() {
  const N = M.N_STEPS[num('n4')], s = num('s4');
  $('n4v').textContent = String(N); $('s4v').textContent = fx(s, 3);
  $('lg4open').textContent = t('s4lgOpen', { T: M.T_MAX });
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4title'), 8, 18, W - 16);
  const xMax = Math.max(20, ...s4.lines.map(l => l.traj.length - 1));
  const xt = xTicksFor(0, xMax, W - 56, [5, 10, 20, 50, 100, 200, 250, 500]);
  const A = axes(ctx, { l: 44, r: W - 12, t: 32, b: H - 24, xMin: 0, xMax, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v => Math.round(v * 100) + '%', xTicks: xt });
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(0), A.y(P0)); ctx.lineTo(A.x(xMax), A.y(P0)); ctx.stroke(); ctx.restore();
  s4.lines.forEach(l => line(ctx, l.traj.map((v, g) => [A.x(g), A.y(v)]), l.fate === 'fixed' ? C.orange : l.fate === 'lost' ? C.grey : C.text, 1.5, 0.85));
  const u = M.fixProb(N, s, P0), ns = fx(N * s, 2);
  if (!s4.runs) { $('r4').textContent = t('s4empty', { N, s: fx(s, 3), ns, u: pct(u) }); return; }
  $('r4').textContent = t('s4readout', { N, s: fx(s, 3), ns, runs: s4.runs, fix: s4.fix, pf: pct(s4.fix / s4.runs), lost: s4.lost, open: s4.open ? t('s4open', { T: M.T_MAX, o: s4.open }) : '', u: pct(u) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('b0').addEventListener('input', () => { s0.hunted = false; draw0(); });
  $('hunt0').addEventListener('click', () => { s0.moths = M.hunt(M.makeMoths(30, 11), num('b0'), nextSeed()); s0.hunted = true; draw0(); });
  $('reset0').addEventListener('click', () => { s0.moths = M.makeMoths(30, 11); s0.hunted = false; draw0(); });

  commit1();
  Object.keys(COND).forEach(id => $(id).addEventListener('click', () => { stopAnim('play1'); s1.cond[COND[id]] = !s1.cond[COND[id]]; s1.shown = GENS; commit1(); draw1(); }));
  ['p1', 'b1'].forEach(id => { $(id).addEventListener('input', () => { stopAnim('play1'); s1.shown = GENS; draw1(); }); $(id).addEventListener('change', () => { commit1(); draw1(); }); });
  $('play1').addEventListener('click', play1);

  s2.hist = [num('b2')];
  $('b2').addEventListener('input', draw2);
  $('b2').addEventListener('change', () => { const b = num('b2'); if (!s2.hist.some(v => Math.abs(v - b) < 1e-9)) s2.hist.push(b); if (s2.hist.length > 6) s2.hist.shift(); draw2(); });

  $('y3').addEventListener('input', () => { stopAnim('play3'); draw3(); });
  $('k3').addEventListener('input', draw3);
  $('play3').addEventListener('click', play3);

  $('n4').addEventListener('input', () => { clear4(); draw4(); });
  $('s4').addEventListener('input', () => { clear4(); draw4(); });
  $('run4').addEventListener('click', run4);
  $('clear4').addEventListener('click', () => { clear4(); draw4(); });
  run4();

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
  window.refreshNatSel = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
