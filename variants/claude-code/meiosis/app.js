'use strict';
// Meiosis lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every chromosome drawn, count, tally and frequency comes from window.MEIOSIS_MODEL (model.js).
// Canvas text is limited to panel titles, axis ticks, row labels and cell counts in fixed slots.
(function () {

const $ = id => document.getElementById(id);
const M = window.MEIOSIS_MODEL;
const t = (...a) => window.MEIOSIS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', blue: '#4f7cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', cell: 'rgba(126,160,200,0.07)', cellLine: '#3d5068', egg: '#c9d5e3' };
const ORIGIN = { m: C.pink, p: C.cyan, e: C.egg };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const trim = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const group = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fx = (v, d) => trim(v.toFixed(d));
let seedCounter = 1000;
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
function roundRect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

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

/* ---------- chromosome drawing ---------- */
// One chromatid as a rounded rod from (x, y0) downward, coloured segment by segment.
function rodV(ctx, x, y0, len, wd, segs) {
  ctx.save(); roundRect(ctx, x - wd / 2, y0, wd, len, wd / 2); ctx.clip();
  segs.forEach(s => { ctx.fillStyle = ORIGIN[s.o]; ctx.fillRect(x - wd / 2, y0 + s.a * len, wd, (s.b - s.a) * len + 0.5); });
  ctx.restore();
}
function rodH(ctx, x0, y, len, wd, segs) {
  ctx.save(); roundRect(ctx, x0, y - wd / 2, len, wd, wd / 2); ctx.clip();
  segs.forEach(s => { ctx.fillStyle = ORIGIN[s.o]; ctx.fillRect(x0 + s.a * len, y - wd / 2, (s.b - s.a) * len + 0.5, wd); });
  ctx.restore();
}
// A chromosome centred at (cx, cy): one or two chromatids side by side, joined at the centromere.
function chrom(ctx, cx, cy, len, wd, chs) {
  const k = chs.length, gap = wd * 0.35;
  chs.forEach((c, i) => rodV(ctx, cx + (i - (k - 1) / 2) * (wd + gap), cy - len / 2, len, wd, c.segs));
  ctx.fillStyle = '#0d1621'; ctx.strokeStyle = C.text; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, wd * 0.42) + (k - 1) * wd * 0.35, 0, 7); ctx.fill(); ctx.stroke();
}
function cellShape(ctx, cx, cy, rx, ry) {
  ctx.save(); ctx.fillStyle = C.cell; ctx.strokeStyle = C.cellLine; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
}
function plate(ctx, x, y0, y1, horiz) {
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.35)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
  if (horiz) { ctx.moveTo(y0, x); ctx.lineTo(y1, x); } else { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  ctx.stroke(); ctx.restore();
}
const whole = (o, k) => Array.from({ length: k }, () => ({ segs: [{ a: 0, b: 1, o }] }));

/* ---------- step 0: why halve ---------- */
const s0 = { sp: 'human' };
const SPKEY = { human: 'spHuman', pea: 'spPea', fly: 'spFly' };
function draw0() {
  const g = num('g0'), twoN = M.SPECIES[s0.sp];
  $('g0v').textContent = String(g);
  Object.keys(SPKEY).forEach(k => $(SPKEY[k].replace('sp', 'sp')).setAttribute('aria-pressed', k === s0.sp));
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0title'), 8, 18, W - 16);
  const maxV = M.zygoteCount(twoN, 6, false) * 1.12, P = { l: 52, r: W - 10, t: 34, b: H - 30 };
  const y = v => P.b - v / maxV * (P.b - P.t), colW = (P.r - P.l) / 7;
  const step = [500, 1000] .find(s => (P.b - P.t) * s / maxV >= 30) || 1000;
  const tick = maxV > 2000 ? step : maxV > 200 ? 100 : maxV > 100 ? 50 : 20;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right';
  for (let v = 0; v <= maxV; v += tick) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(group(String(v)), P.l - 6, y(v) + 4); }
  for (let k = 0; k <= 6; k++) {
    const cx = P.l + (k + 0.5) * colW, bw = Math.min(26, colW * 0.34);
    fitText(ctx, t('gen', { g: k }), cx, H - 10, colW - 4, { size: 11, color: k <= g ? C.text : C.muted, align: 'center' });
    if (k > g) continue;
    const full = M.zygoteCount(twoN, k, false), half = M.zygoteCount(twoN, k, true);
    ctx.fillStyle = C.raw; ctx.fillRect(cx + 1, y(full), bw, P.b - y(full));
    ctx.fillStyle = C.cyan; ctx.fillRect(cx - bw - 1, y(half), bw, P.b - y(half));
    // value above the grey bar only when it clears the cyan one
    if (k === g) {
      ctx.textAlign = 'center'; ctx.fillStyle = C.text; ctx.font = '11px system-ui,sans-serif';
      if (y(half) - y(full) > 14 || k === 0) ctx.fillText(group(String(full)), cx + 1 + bw / 2, y(full) - 5);
    }
  }
  ctx.restore();
  const full = M.zygoteCount(twoN, g, false), half = M.zygoteCount(twoN, g, true);
  $('r0').textContent = t('s0readout', { sp: t(SPKEY[s0.sp]), g, half, twoN, full: group(String(full)), ratio: full / half });
}

/* ---------- step 1: the stages ---------- */
const N1 = 3;
const s1 = { mode: 'meiosis', seed: 7, data: null, orient: null, cross: null, maxSeen: 0 };
function roll1(seed) {
  const r = M.rng(seed);
  s1.orient = Array.from({ length: N1 }, () => r() < 0.5);
  s1.cross = Array.from({ length: N1 }, () => 0.25 + r() * 0.5);
  s1.data = M.meiosis(N1, s1.orient, s1.cross);
}
function layout1(mode, st, W, H) {
  const top = 30, cy = (top + H - 8) / 2, ry = (H - top - 12) / 2;
  const u = ry * 0.62, wd = Math.max(3, Math.min(10, u * 0.1)), L = M.LENGTHS.map(v => v * u);
  const D = s1.data, cells = [], items = [], plates = [];
  const stackY = (lens, gap = 8) => { const tot = lens.reduce((a, b) => a + b, 0) + gap * (lens.length - 1); let y0 = cy - tot / 2; return lens.map(l => { const c = y0 + l / 2; y0 += l + gap; return c; }); };
  const rx1 = Math.min(W * 0.44, ry * 1.7);
  const scatter = (rep, scale = 1) => {
    const order = [['m', 0], ['p', 1], ['m', 2], ['p', 0], ['m', 1], ['p', 2]];
    order.forEach(([o, i], k) => items.push({ x: W / 2 + (k - 2.5) / 2.5 * rx1 * 0.62, y: cy + (k % 2 ? 0.12 : -0.12) * ry, len: L[i] * scale, wd: wd * (scale > 1 ? 1 : 1), chs: whole(o, rep ? 2 : 1) }));
  };
  if (st <= 1 || (mode === 'mitosis' && st === 2)) { cells.push([W / 2, cy, rx1, ry]); scatter(st >= 1); return { cells, items, plates }; }
  if (mode === 'mitosis') {
    const sc = 0.45, order = [['m', 0], ['p', 0], ['m', 1], ['p', 1], ['m', 2], ['p', 2]], lens = order.map(([, i]) => L[i] * sc), ys = stackY(lens, 6);
    if (st === 3) { cells.push([W / 2, cy, rx1, ry]); plates.push([W / 2, cy - ry * 0.9, cy + ry * 0.9]); order.forEach(([o], k) => items.push({ x: W / 2, y: ys[k], len: lens[k], wd, chs: whole(o, 2) })); }
    else if (st === 4) { cells.push([W / 2, cy, Math.min(W * 0.47, rx1 * 1.12), ry * 0.92]); order.forEach(([o], k) => [-1, 1].forEach(sg => items.push({ x: W / 2 + sg * rx1 * 0.6, y: ys[k], len: lens[k], wd, chs: whole(o, 1) }))); }
    else {
      const rx = Math.min(W * 0.22, ry * 1.1);
      [W * 0.27, W * 0.73].forEach(cx => { cells.push([cx, cy, rx, ry * 0.9]); order.forEach(([o, i], k) => items.push({ x: cx + (k - 2.5) / 2.5 * rx * 0.62, y: cy, len: L[i] * 0.8, wd: Math.min(wd, rx * 0.1), chs: whole(o, 1) })); });
    }
    return { cells, items, plates };
  }
  // meiosis
  const homolog = (i, side) => { const q = D.pairs[i], toA = s1.orient[i] ? q.p : q.m, toB = s1.orient[i] ? q.m : q.p; return side === 'A' ? toA : toB; };
  if (st === 2) {
    cells.push([W / 2, cy, rx1, ry]);
    for (let i = 0; i < N1; i++) { const x = W / 2 + (i - 1) * rx1 * 0.55; items.push({ x: x - wd * 1.6, y: cy, len: L[i], wd, chs: D.pairs[i].m }); items.push({ x: x + wd * 1.6, y: cy, len: L[i], wd, chs: D.pairs[i].p }); }
    return { cells, items, plates };
  }
  const ys = stackY(L);
  if (st === 3 || st === 4) {
    const spread = st === 3 ? wd * 1.6 : rx1 * 0.55;
    cells.push([W / 2, cy, st === 3 ? rx1 : Math.min(W * 0.47, rx1 * 1.12), st === 3 ? ry : ry * 0.92]);
    if (st === 3) plates.push([W / 2, cy - ry * 0.9, cy + ry * 0.9]);
    for (let i = 0; i < N1; i++) { items.push({ x: W / 2 - spread, y: ys[i], len: L[i], wd, chs: homolog(i, 'A') }); items.push({ x: W / 2 + spread, y: ys[i], len: L[i], wd, chs: homolog(i, 'B') }); }
    return { cells, items, plates };
  }
  if (st === 5 || st === 6) {
    const rx = Math.min(W * 0.22, ry * 1.1);
    [['A', W * 0.27], ['B', W * 0.73]].forEach(([side, cx]) => {
      cells.push([cx, cy, rx, ry * 0.9]);
      if (st === 6) plates.push([cx, cy - ry * 0.8, cy + ry * 0.8]);
      for (let i = 0; i < N1; i++) items.push(st === 5 ? { x: cx + (i - 1) * rx * 0.48, y: cy, len: L[i], wd, chs: homolog(i, side) } : { x: cx, y: ys[i], len: L[i], wd, chs: homolog(i, side) });
    });
    return { cells, items, plates };
  }
  const rx = Math.min(W * 0.115, ry * 0.75);
  D.gametes.forEach((g, k) => {
    const cx = W * (0.125 + 0.25 * k); cells.push([cx, cy, rx, ry * 0.8]);
    g.forEach((c, i) => items.push({ x: cx + (i - 1) * rx * 0.45, y: cy, len: L[i] * 0.9, wd: Math.min(wd, rx * 0.16), chs: [c] }));
  });
  return { cells, items, plates };
}
function draw1() {
  const max = M.STAGES[s1.mode] - 1, st = Math.min(num('st1'), max);
  $('st1').max = String(max); if (num('st1') > max) $('st1').value = String(max);
  $('st1v').textContent = `${st}/${max}`;
  $('modeMeiosis').setAttribute('aria-pressed', s1.mode === 'meiosis'); $('modeMitosis').setAttribute('aria-pressed', s1.mode === 'mitosis');
  $('reroll1').disabled = s1.mode !== 'meiosis';
  s1.maxSeen = Math.max(s1.maxSeen, st);
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, `${st} · ${t(`st_${s1.mode}_${st}`)}`, 8, 18, W - 16);
  const lay = layout1(s1.mode, st, W, H);
  lay.cells.forEach(c => cellShape(ctx, ...c));
  lay.plates.forEach(p => plate(ctx, ...p));
  lay.items.forEach(it => chrom(ctx, it.x, it.y, it.len, it.wd, it.chs));
  // counts chart
  ({ ctx, W, H } = fitCanvas($('c1b')));
  title(ctx, t('c1btitle'), 8, 18, W - 16);
  const P = { l: 36, r: W - 14, t: 32, b: H - 24 }, yMax = 4 * N1;
  const x = s => P.l + s / max * (P.r - P.l), y = v => P.b - v / yMax * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  for (let v = 0; v <= yMax; v += N1) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  for (let s = 0; s <= max; s++) { ctx.fillStyle = s === st ? C.text : C.muted; ctx.textAlign = 'center'; ctx.fillText(String(s), x(s), P.b + 16); }
  const upto = Math.max(st, Math.min(s1.maxSeen, max));
  [['chr', C.green, -2], ['dna', C.orange, 2]].forEach(([k, col, dy]) => {
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let s = 0; s <= upto; s++) { const v = M.counts(s1.mode, s, N1)[k], X = x(s), Y = y(v) + dy; if (!s) ctx.moveTo(X, Y); else { ctx.lineTo(X, y(M.counts(s1.mode, s - 1, N1)[k]) + dy); ctx.lineTo(X, Y); } }
    ctx.stroke();
    for (let s = 0; s <= upto; s++) { ctx.fillStyle = col; ctx.globalAlpha = s === st ? 1 : 0.6; ctx.beginPath(); ctx.arc(x(s), y(M.counts(s1.mode, s, N1)[k]) + dy, s === st ? 5 : 3, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  });
  ctx.strokeStyle = 'rgba(232,237,244,0.4)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(st), P.t); ctx.lineTo(x(st), P.b); ctx.stroke();
  ctx.restore();
  const c = M.counts(s1.mode, st, N1);
  let txt = t('s1readout', { mode: t(s1.mode === 'meiosis' ? 'modeMeiosis' : 'modeMitosis'), s: st, name: t(`st_${s1.mode}_${st}`), cells: c.cells, chr: c.chr, dna: c.dna });
  if (st === max) txt += ' ' + (s1.mode === 'meiosis' ? t('s1tailMeiosis', { n: N1, two: 2 * N1, rec: s1.data.gametes.flat().filter(M.isRecombinant).length }) : t('s1tailMitosis', { two: 2 * N1 }));
  $('r1').textContent = txt;
}
function play1() {
  const max = M.STAGES[s1.mode] - 1; s1.maxSeen = 0; $('st1').value = '0';
  animate('play1', (max + 1) * 1100, p => { $('st1').value = String(Math.min(max, Math.floor(p * (max + 1)))); s1.maxSeen = 0; draw1(); });
}

/* ---------- step 2: independent assortment ---------- */
const s2 = { tally: null, runs: 0, orient: null };
const L2 = [1, 0.8, 0.62, 0.5];
function reset2() { const n = num('n2'); s2.tally = new Array(1 << n).fill(0); s2.runs = 0; s2.orient = null; }
function run2(k) {
  const n = num('n2'), seed = nextSeed(), r = M.rng(seed);
  for (let j = 0; j < k; j++) {
    const orient = Array.from({ length: n }, () => r() < 0.5);
    M.assortTypes(n, orient).forEach(tp => s2.tally[tp]++);
    s2.runs++; s2.orient = orient;
  }
  draw2();
}
function draw2() {
  const n = num('n2'), types = M.nTypes(n);
  $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2top'), 8, 18, W - 16);
  // top: line-up around a horizontal plate
  const topH = 150, py = 30 + topH / 2, u = topH * 0.4, wd = Math.max(4, Math.min(8, u * 0.12));
  plate(ctx, py, 16, W - 16, true);
  const orient = s2.orient || new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    const x = W / 2 + (i - (n - 1) / 2) * Math.min(90, (W - 40) / n), len = L2[i] * u;
    const up = orient[i] ? 'p' : 'm', down = orient[i] ? 'm' : 'p';
    chrom(ctx, x, py - 6 - len / 2, len, wd, whole(up, 2));
    chrom(ctx, x, py + 6 + len / 2, len, wd, whole(down, 2));
    if (!s2.orient) { ctx.fillStyle = 'rgba(13,22,33,0.6)'; ctx.fillRect(x - 3 * wd, py - topH / 2, 6 * wd, topH); }
  }
  // bottom: tally with recipes
  const by = 30 + topH + 20;
  title(ctx, t('c2bot'), 8, by, W - 16);
  const sq = Math.min(10, ((W - 60) / types) * 0.55), recipeH = n * (sq + 2);
  const P = { l: 44, r: W - 12, t: by + 14, b: H - 10 - recipeH - 6 };
  const exp = 4 * s2.runs / types, maxV = Math.max(4, ...s2.tally, exp * 1.25);
  const y = v => P.b - v / maxV * (P.b - P.t), colW = (P.r - P.l) / types;
  const tick = [1, 2, 5, 10, 20, 50, 100, 200, 500].find(s => (P.b - P.t) * s / maxV >= 26) || 1000;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right';
  for (let v = 0; v <= maxV; v += tick) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  const lastTypes = s2.orient ? M.assortTypes(n, s2.orient) : [];
  for (let tp = 0; tp < types; tp++) {
    const cx = P.l + (tp + 0.5) * colW, bw = Math.min(30, colW * 0.6);
    ctx.fillStyle = lastTypes.includes(tp) ? C.orange : '#8fa3bb';
    ctx.fillRect(cx - bw / 2, y(s2.tally[tp]), bw, P.b - y(s2.tally[tp]));
    for (let i = 0; i < n; i++) { ctx.fillStyle = (tp >> i) & 1 ? C.cyan : C.pink; ctx.fillRect(cx - sq / 2, P.b + 6 + i * (sq + 2), sq, sq); }
  }
  if (s2.runs) { ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(P.l, y(exp)); ctx.lineTo(P.r, y(exp)); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
  if (!s2.runs) { $('r2').textContent = t('s2empty', { n, types }) + ' ' + t('s2human', { human: group(String(M.nTypes(23))) }); return; }
  const seen = s2.tally.filter(v => v > 0).length;
  const note = (s2.runs <= 3 ? t('s2note1') + ' ' : '') + t('s2human', { human: group(String(M.nTypes(23))) });
  $('r2').textContent = t('s2readout', { n, types, runs: s2.runs, gam: 4 * s2.runs, seen, exp: fx(exp, 1), note });
}

/* ---------- step 3: crossing over ---------- */
const PA = 0.05;
const s3 = { hist: {}, last: null };
const dKey = () => num('d3').toFixed(2);
function run3(k) {
  const d = num('d3'), pb = PA + d, r = M.rng(nextSeed()), h = s3.hist[dKey()] || (s3.hist[dKey()] = { runs: 0, tally: { AB: 0, ab: 0, Ab: 0, aB: 0 } });
  for (let j = 0; j < k; j++) {
    const c = 1e-6 + r() * (1 - 2e-6);
    M.twoGeneGametes(PA, pb, c).forEach(g => h.tally[g]++);
    h.runs++; s3.last = c;
  }
  draw3();
}
function draw3() {
  const d = num('d3'), pb = PA + d, h = s3.hist[dKey()];
  $('d3v').textContent = fx(d, 2);
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3top'), 8, 18, W - 16);
  const X0 = 24, X1 = W - 24, len = X1 - X0, wd = 12, ys = [58, 78, 104, 124];
  const segsFor = k => {
    if (s3.last == null) return [{ a: 0, b: 1, o: k < 2 ? 'm' : 'p' }];
    const m = M.meiosis(1, [false], [s3.last]).pairs[0];
    return [m.m[0], m.m[1], m.p[0], m.p[1]][k].segs;
  };
  ys.forEach((yy, k) => rodH(ctx, X0, yy, len, wd, segsFor(k)));
  ctx.save();
  [PA, pb].forEach((pos, g) => {
    const X = X0 + pos * len;
    ctx.strokeStyle = 'rgba(232,237,244,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, ys[0] - 10); ctx.lineTo(X, ys[3] + 10); ctx.stroke();
    ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.pink; ctx.fillText(g ? 'B' : 'A', X, ys[0] - 14);
    ctx.fillStyle = C.cyan; ctx.fillText(g ? 'b' : 'a', X, ys[3] + 24);
  });
  if (s3.last != null) { const X = X0 + s3.last * len; ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X, ys[1] - 8); ctx.lineTo(X, ys[2] + 8); ctx.stroke(); }
  ctx.restore();
  // bottom: RF vs distance
  const by = 182; title(ctx, t('c3bot'), 8, by, W - 16);
  const P = { l: 44, r: W - 14, t: by + 16, b: H - 24 }, x = v => P.l + v / 0.9 * (P.r - P.l), y = v => P.b - v / 50 * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  for (let v = 0; v <= 50; v += 10) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(v + '%', P.l - 6, y(v) + 4); }
  const xs = (P.r - P.l) / 9 >= 30 ? 0.1 : 0.2;
  for (let v = 0; v <= 0.9001; v += xs) { ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(fx(v, 1), x(v), P.b + 16); }
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(0), y(0)); ctx.lineTo(x(0.9), y(100 * M.expectedRF(0, 0.9))); ctx.stroke();
  Object.entries(s3.hist).forEach(([k, q]) => {
    const tot = 4 * q.runs; if (!tot) return;
    const rf = 100 * (q.tally.Ab + q.tally.aB) / tot, cur = k === dKey();
    ctx.fillStyle = cur ? C.cyan : C.text; ctx.globalAlpha = cur ? 1 : 0.8;
    ctx.beginPath(); ctx.arc(x(Number(k)), y(rf), Math.min(8, 2.5 + Math.sqrt(q.runs) * 0.35), 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  });
  ctx.strokeStyle = 'rgba(103,215,249,0.5)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(d), P.t); ctx.lineTo(x(d), P.b); ctx.stroke();
  ctx.restore();
  const exp = fx(100 * M.expectedRF(PA, pb), 1);
  $('h3').textContent = t('s3hint', { max: fx(100 * M.expectedRF(0, 0.9), 1) });
  if (!h || !h.runs) { $('r3').textContent = t('s3empty', { d: fx(d, 2), exp }); return; }
  const tot = 4 * h.runs, rf = 100 * (h.tally.Ab + h.tally.aB) / tot;
  let txt = t('s3readout', { d: fx(d, 2), runs: h.runs, total: tot, ...h.tally, rf: fx(rf, 1), exp });
  if (s3.last != null) txt += ' ' + t('s3last', { c: fx(s3.last, 2), where: t(s3.last > PA && s3.last < pb ? 's3between' : 's3outside') });
  $('r3').textContent = txt;
}

/* ---------- step 4: siblings ---------- */
const s4 = { hist: null, runs: 0, last: null, sum: 0, sum2: 0 };
const GP = [[C.cyan, C.blue], [C.orange, C.pink]]; // [father side: grandfather, grandmother], [mother side: …]
function reset4() { const n = num('n4'); s4.hist = new Array(2 * n + 1).fill(0); s4.runs = 0; s4.sum = 0; s4.sum2 = 0; }
function run4(k) {
  const n = num('n4'), r = M.rng(nextSeed());
  for (let j = 0; j < k; j++) { const p = M.siblingPair(n, r); s4.hist[p.shared]++; s4.runs++; const f = p.shared / (2 * n); s4.sum += f; s4.sum2 += f * f; s4.last = p; }
  draw4();
}
function draw4() {
  const n = num('n4'), two = 2 * n;
  $('n4v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c4'));
  const lab = 54, X0 = lab + 6, X1 = W - 8, pw = (X1 - X0) / n, cw = Math.max(2, Math.min(14, pw / 2 - 1.5)), rowH = 34;
  const rows = [30, 30 + rowH + 22];
  [['c4kid1', 0], ['c4kid2', 1]].forEach(([key, r]) => {
    ctx.save(); ctx.textBaseline = 'middle'; fitText(ctx, t(key), 4, rows[r] + rowH / 2, lab - 4, { size: 12, weight: '600' }); ctx.restore();
    if (!s4.last) return;
    const kid = r ? s4.last.b : s4.last.a;
    kid.forEach((pair, i) => pair.forEach((g, side) => {
      const x = X0 + i * pw + pw / 2 + (side ? 0.75 : -0.75 - cw);
      ctx.fillStyle = GP[side][g]; roundRect(ctx, x, rows[r], cw, rowH, Math.min(3, cw / 2)); ctx.fill();
    }));
  });
  if (s4.last) s4.last.a.forEach((pair, i) => pair.forEach((g, side) => {
    if (s4.last.b[i][side] !== g) return;
    const x = X0 + i * pw + pw / 2 + (side ? 0.75 + cw / 2 : -0.75 - cw / 2);
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, rows[0] + rowH + 11, Math.max(1.6, Math.min(3.5, cw / 2)), 0, 7); ctx.fill();
  }));
  // histogram of shared fraction
  const by = rows[1] + rowH + 34; title(ctx, t('c4bot'), 8, by, W - 16);
  const P = { l: 44, r: W - 14, t: by + 16, b: H - 24 }, x = f => P.l + f * (P.r - P.l);
  const maxV = Math.max(4, ...s4.hist), y = v => P.b - v / maxV * (P.b - P.t);
  const tick = [1, 2, 5, 10, 20, 50, 100, 200, 500].find(s => (P.b - P.t) * s / maxV >= 24) || 1000;
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  for (let v = 0; v <= maxV; v += tick) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  [0, 0.25, 0.5, 0.75, 1].forEach(f => { ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(Math.round(f * 100) + '%', x(f), P.b + 16); });
  const bw = Math.max(2, (P.r - P.l) / (two + 1) * 0.8);
  s4.hist.forEach((c, k) => { if (!c) return; const isLast = s4.last && k === s4.last.shared; ctx.fillStyle = isLast ? C.orange : C.cyan; ctx.fillRect(x(k / two) - bw / 2, y(c), bw, P.b - y(c)); });
  if (s4.runs) { const m = s4.sum / s4.runs; ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x(m), P.t); ctx.lineTo(x(m), P.b); ctx.stroke(); }
  ctx.restore();
  const inv = group(String(Math.round(1 / M.pIdentical(n)))), sdT = fx(100 * M.sharedSD(n), 1);
  if (!s4.runs) { $('r4').textContent = t('s4empty', { n, two, sdT, inv }); return; }
  const mean = s4.sum / s4.runs, sd = Math.sqrt(Math.max(0, s4.sum2 / s4.runs - mean * mean));
  $('r4').textContent = t('s4readout', { k: s4.last.shared, two, pct: fx(100 * s4.last.shared / two, 1), runs: s4.runs, mean: fx(100 * mean, 1), sd: fx(100 * sd, 1), sdT, inv });
}

/* ---------- step 5: nondisjunction ---------- */
const s5 = { mode: 'none' };
const ND = { ndNone: 'none', ndI: 'I', ndII: 'II' };
function draw5() {
  Object.keys(ND).forEach(id => $(id).setAttribute('aria-pressed', ND[id] === s5.mode));
  const R = M.nondisjunction(s5.mode, 23);
  const { ctx, W, H } = fitCanvas($('c5'));
  const rowH = (H - 8) / 4, wd = 6, len = Math.min(44, rowH * 0.42);
  // chromatid sets per cell for the tracked pair (m = maternal, p = paternal)
  const m2 = whole('m', 2), p2 = whole('p', 2);
  const afterI = s5.mode === 'I' ? [[m2, p2], []] : [[m2], [p2]];
  const gam = s5.mode === 'I' ? [[whole('m', 1), whole('p', 1)], [whole('m', 1), whole('p', 1)], [], []]
    : s5.mode === 'II' ? [[whole('m', 1), whole('m', 1)], [], [whole('p', 1)], [whole('p', 1)]]
      : [[whole('m', 1)], [whole('m', 1)], [whole('p', 1)], [whole('p', 1)]];
  const rows = [
    { key: 'c5rowP', cells: [[[m2, p2], null]] },
    { key: 'c5row0', cells: afterI.map((c, k) => [c, R.afterIChr[k]]) },
    { key: 'c5row1', cells: gam.map((c, k) => [c, R.gametes[k]]) },
    { key: 'c5row2', cells: gam.map((c, k) => [c.concat([whole('e', 1)]), R.zygotes[k]]) }
  ];
  rows.forEach((row, r) => {
    const y0 = 4 + r * rowH; title(ctx, t(row.key), 8, y0 + 14, W - 16);
    const k = row.cells.length, slot = (W - 16) / Math.max(k, 1), cy = y0 + 22 + (rowH - 26) / 2, rx = Math.min(slot * 0.42, 70), ry = (rowH - 30) / 2;
    row.cells.forEach(([chs, count], i) => {
      const cx = 8 + slot * (i + 0.5) * (k === 1 ? 1 : 1);
      const bad = count != null && count !== (r === 3 ? 46 : 23);
      cellShape(ctx, cx, cy, rx, ry);
      if (bad) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      // rods in the left part of the cell, the count in the right part; they never share space
      // wide cells: rods left, count right; narrow cells: rods above, count below. They never share space.
      const narrow = count != null && rx < 48, w = rx < 50 ? 4 : wd;
      const centre = count == null || narrow ? cx : cx - rx * 0.36, room = count == null ? rx : narrow ? rx * 1.2 : rx * 0.62;
      const L5 = narrow ? Math.min(len, ry * 0.95) : len, yc = narrow ? cy - ry * 0.28 : cy;
      const sp = chs.length > 1 ? Math.min(w * 3.6, (room - 2.6 * w) / (chs.length - 1)) : 0;
      chs.forEach((c, j) => chrom(ctx, centre + (j - (chs.length - 1) / 2) * sp, yc, L5, w, c));
      if (count != null) { ctx.save(); ctx.textBaseline = 'middle'; fitText(ctx, t('cnt', { c: count }), narrow ? cx : cx + rx * 0.42, narrow ? cy + ry * 0.6 : cy, narrow ? rx * 1.3 : rx * 0.66, { size: narrow ? 11 : 13, weight: '700', color: bad ? C.orange : C.text, align: 'center' }); ctx.restore(); }
    });
  });
  const tail = { none: 's5tailNone', I: 's5tailI', II: 's5tailII' }[s5.mode];
  const sep = t('listSepNum');
  $('r5').textContent = t('s5readout', { mode: t({ none: 'ndNone', I: 'ndI', II: 'ndII' }[s5.mode]), gam: R.gametes.join(sep), normal: R.normal, zyg: R.zygotes.join(sep), tail: t(tail) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  Object.keys(SPKEY).forEach(k => $(SPKEY[k]).addEventListener('click', () => { s0.sp = k; draw0(); }));
  $('g0').addEventListener('input', draw0);

  roll1(s1.seed);
  $('modeMeiosis').addEventListener('click', () => { stopAnim('play1'); s1.mode = 'meiosis'; s1.maxSeen = 0; draw1(); });
  $('modeMitosis').addEventListener('click', () => { stopAnim('play1'); s1.mode = 'mitosis'; s1.maxSeen = 0; if (num('st1') > 5) $('st1').value = '5'; draw1(); });
  $('st1').addEventListener('input', () => { stopAnim('play1'); draw1(); });
  $('play1').addEventListener('click', play1);
  $('reroll1').addEventListener('click', () => { s1.seed = nextSeed(); roll1(s1.seed); draw1(); });

  reset2(); run2(1);
  $('n2').addEventListener('input', () => { reset2(); draw2(); });
  $('once2').addEventListener('click', () => run2(1));
  $('many2').addEventListener('click', () => run2(50));
  $('clear2').addEventListener('click', () => { reset2(); draw2(); });

  run3(1);
  $('d3').addEventListener('input', () => { s3.last = null; draw3(); });
  $('once3').addEventListener('click', () => run3(1));
  $('many3').addEventListener('click', () => run3(100));
  $('clear3').addEventListener('click', () => { s3.hist = {}; s3.last = null; draw3(); });

  reset4(); run4(1);
  $('n4').addEventListener('input', () => { reset4(); s4.last = null; draw4(); });
  $('once4').addEventListener('click', () => run4(1));
  $('many4').addEventListener('click', () => run4(200));
  $('clear4').addEventListener('click', () => { reset4(); s4.last = null; draw4(); });

  Object.keys(ND).forEach(id => $(id).addEventListener('click', () => { s5.mode = ND[id]; draw5(); }));

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
  window.refreshMeiosis = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
