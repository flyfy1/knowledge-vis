'use strict';
// Molecules & atoms lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Counts, masses and verdicts come from window.MA_MODEL (model.js); pictures use its 2D layouts.
// Canvas text is limited to panel titles, axis ticks, bar labels in fixed slots and the electrode signs.
(function () {

const $ = id => document.getElementById(id);
const M = window.MA_MODEL;
const t = (...a) => window.MA_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a' };
const EL = { H: { col: '#e8edf4', r: 0.22 }, O: { col: '#ff7a93', r: 0.32 }, C: { col: '#8c9bb0', r: 0.32 }, N: { col: '#7aa2ff', r: 0.31 }, I: { col: '#b79cff', r: 0.42 } };
const EL_NAME = { zh: { H: '氢', O: '氧', C: '碳', N: '氮', I: '碘' }, en: { H: 'hydrogen', O: 'oxygen', C: 'carbon', N: 'nitrogen', I: 'iodine' } };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s).replace('-', '−'); };
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const pretty = f => (f === 'C2H5OH' ? 'C₂H₅OH' : f.replace(/\d/g, d => SUB[+d]));
const lang = () => window.MA_I18N.getLang();
const atomsText = atoms => Object.entries(atoms).map(([e, k]) => t('atomCount', { k, e })).join(t('plus'));
const molsText = mix => Object.entries(mix).filter(([, k]) => k > 0).map(([f, k]) => t('molCount', { k, f: pretty(f) })).join(t('listSep'));
const elementLegend = els => els.map(e => `<span class="lg"><span class="sw sw-atom" style="background:${EL[e].col}"></span><span>${e} · ${EL_NAME[lang()][e]}</span></span>`).join('');

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
function title(ctx, text, X, Y, maxW) {
  let size = 12; ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Text that must fit a slot: shrinks rather than overflow.
function fitText(ctx, text, X, Y, maxW, size = 11, color = C.muted, align = 'center') {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceTicks(lo, hi, maxN = 4) {
  const span = hi - lo, raw = span / maxN, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map(f => f * mag).find(s => span / s <= maxN) || 10 * mag;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
// Axes with y ticks; x is either numeric (ticks) or categorical (labels in equal slots).
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  niceTicks(o.yMin, o.yMax, o.yN || 4).forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v, 0), P.l - 6, y(v) + 4); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  if (o.xTicks) { ctx.textAlign = 'center'; niceTicks(o.xMin, o.xMax, Math.max(2, Math.floor((P.r - P.l) / 40))).forEach(v => { if (Number.isInteger(v)) { ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v, 0), x(v), P.b + 15); } }); }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function bars(ctx, A, labels, values, cols, ghost) {
  const n = labels.length, slot = (A.P.r - A.P.l) / n, bw = Math.min(46, slot * 0.56);
  labels.forEach((lab, i) => {
    const X = A.P.l + slot * (i + 0.5), Y = A.y(values[i]), Y0 = A.y(0);
    ctx.save(); ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.85; ctx.fillRect(X - bw / 2, Math.min(Y, Y0), bw, Math.abs(Y0 - Y)); ctx.restore();
    if (ghost) { ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; const G = A.y(ghost[i]); ctx.strokeRect(X - bw / 2 - 3, Math.min(G, Y0), bw + 6, Math.abs(Y0 - G)); ctx.restore(); }
    fitText(ctx, lab, X, A.P.b + 15, slot - 4);
  });
}

/* ---------- molecule drawing ---------- */
function drawMol(ctx, f, cx, cy, s, opts = {}) {
  const L = M.LAYOUT[f], pts = L.map(([e, x, y]) => ({ e, X: cx + x * s, Y: cy + y * s }));
  ctx.save(); ctx.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
  ctx.strokeStyle = '#7d8ea5'; ctx.lineWidth = Math.max(2, s * 0.09);
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const d = Math.hypot(L[i][1] - L[j][1], L[i][2] - L[j][2]); if (d > 0.95 || (L[i][0] === 'H' && L[j][0] === 'H' && f !== 'H2')) continue;
    ctx.beginPath(); ctx.moveTo(pts[i].X, pts[i].Y); ctx.lineTo(pts[j].X, pts[j].Y); ctx.stroke();
  }
  pts.forEach(p => atom(ctx, p.e, p.X, p.Y, s));
  ctx.restore();
}
function atom(ctx, e, X, Y, s) {
  const r = EL[e].r * s;
  ctx.fillStyle = EL[e].col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(X - r * 0.3, Y - r * 0.3, r * 0.32, 0, 7); ctx.fill();
}
// Half-width of a layout in units (for fitting).
const halfW = f => Math.max(...M.LAYOUT[f].map(([e, x]) => Math.abs(x) + EL[e].r));

/* ---------- step 0: subscript vs coefficient ---------- */
const s0 = { f: 'H2O' };
const F0 = ['H2O', 'CO2', 'O2', 'NH3', 'CH4'];
function draw0() {
  const f = s0.f, n = num('n0'), per = M.atomsIn(f), tot = M.atomsIn(f, n);
  $('n0v').textContent = String(n);
  document.querySelectorAll('#mols0 .btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f));
  $('lg0').innerHTML = elementLegend(Object.keys(per));
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 18, W - 16);
  const cw = (W - 20) / 2, ch = (H - 34) / 2, s = Math.min(cw / (2 * halfW(f) + 0.6), ch / 1.9);
  for (let i = 0; i < 4; i++) { const cx = 10 + cw * (i % 2 + 0.5), cy = 30 + ch * (Math.floor(i / 2) + 0.5); if (i < n) drawMol(ctx, f, cx, cy, s); else { ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([4, 4]); ctx.strokeRect(cx - cw / 2 + 8, cy - ch / 2 + 6, cw - 16, ch - 12); ctx.restore(); } }
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const els = Object.keys(per), yMax = Math.max(...els.map(e => per[e] * 4));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, yMin: 0, yMax: yMax + 1, title: t('c0b') });
  bars(ctx, A, els, els.map(e => tot[e]), els.map(e => EL[e].col));
  $('r0').textContent = t('s0readout', { coef: n > 1 ? n : '', f: pretty(f), per: atomsText(per), pm: M.atomTotal(f), n, tot: atomsText(tot), all: M.atomTotal(f, n) });
}

/* ---------- step 1: same elements, different molecules ---------- */
const s1 = { f: 'H2O2' };
function draw1() {
  const f = s1.f;
  document.querySelectorAll('#mols1 .btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f));
  $('lg1').innerHTML = elementLegend(['H', 'O']) + `<span class="lg"><span class="sw sw-ref"></span><span>${t('room')}</span></span>`;
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a') + ' · ' + pretty(f), 8, 18, W - 16);
  const s = Math.min((W - 40) / (2 * halfW(f) + 0.4), (H - 60) / 1.8, 120);
  drawMol(ctx, f, W / 2, 30 + (H - 30) / 2, s);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, yMin: -280, yMax: 180, title: t('c1b') });
  bars(ctx, A, M.HO_SET.map(pretty), M.HO_SET.map(q => M.BOIL[q]), M.HO_SET.map(q => (q === f ? C.cyan : q === 'H2O' ? '#8fa6bf' : C.ghost)));
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(20)); ctx.lineTo(A.P.r, A.y(20)); ctx.stroke(); ctx.restore();
  const els = Object.keys(M.FORMULA[f]);
  const cmp = M.sameMolecule(f, 'H2O') ? t('cmpSame') : M.sameKinds(f, 'H2O') ? t('cmpKinds') : t('cmpOther', { els: els.join('') });
  $('r1').textContent = t('s1readout', { f: pretty(f), per: atomsText(M.atomsIn(f)), cmp, bp: fmt(M.BOIL[f]), state: t('st_' + M.stateAt(f, 20)) });
}

/* ---------- step 2: heating water (sketch motion, real ledger) ---------- */
const N2 = 12;
const rnd = (() => { let s = 12345; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })();
const homes = Array.from({ length: N2 }, (_, i) => ({
  solid: [1.6 + (i % 4) * 1.3, 4.6 - Math.floor(i / 4) * 1.15], sAng: (i % 2) * Math.PI,
  liquid: [1.2 + (i % 5) * 1.35 + (Math.floor(i / 5) % 2) * 0.6 + (rnd() - 0.5) * 0.2, 4.85 - Math.floor(i / 5) * 1.05 + (rnd() - 0.5) * 0.15],
  gas: [0.8 + rnd() * 6.4, 0.8 + rnd() * 4.2], v: [(rnd() - 0.5) * 2, (rnd() - 0.5) * 2], ph: rnd() * 6.28, w: 0.6 + rnd()
}));
const BOX = { w: 8, h: 5.6 };
const bounce = (p, lo, hi) => { const span = hi - lo, m = ((p - lo) % (2 * span) + 2 * span) % (2 * span); return lo + (m < span ? m : 2 * span - m); };
function molPose(i, T, time) {
  const h = homes[i], ph = M.phase(T), k = (T + 30) / 150;
  if (ph === 'solid') { const a = 0.04 + 0.05 * k; return { x: h.solid[0] + a * Math.sin(time * 9 * h.w + h.ph), y: h.solid[1] + a * Math.cos(time * 11 * h.w + h.ph), ang: h.sAng + 0.15 * Math.sin(time * 7 + h.ph) }; }
  if (ph === 'liquid') { const a = 0.12 + 0.1 * k; return { x: h.liquid[0] + a * Math.sin(time * 1.7 * h.w + h.ph), y: h.liquid[1] + a * 0.6 * Math.cos(time * 2.3 * h.w + h.ph), ang: time * 0.8 * h.w + h.ph }; }
  const sp = 0.7 * Math.sqrt((T + 273) / 373);
  return { x: bounce(h.gas[0] + h.v[0] * sp * time, 0.5, BOX.w - 0.5), y: bounce(h.gas[1] + h.v[1] * sp * time, 0.5, BOX.h - 0.5), ang: time * 2 * h.w + h.ph };
}
const s2 = { time: 0, raf: null, last: null, visible: false };
function draw2() {
  const T = num('t2'), ph = M.phase(T);
  $('t2v').textContent = fmt(T, 0) + ' °C';
  $('lg2').innerHTML = elementLegend(['H', 'O']);
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 18, W - 16);
  const u = Math.min((W - 20) / BOX.w, (H - 40) / BOX.h), ox = (W - u * BOX.w) / 2, oy = 30;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy, u * BOX.w, u * BOX.h); ctx.restore();
  for (let i = 0; i < N2; i++) {
    const p = molPose(i, T, s2.time);
    ctx.save(); ctx.translate(ox + p.x * u, oy + p.y * u); ctx.rotate(p.ang); drawMol(ctx, 'H2O', 0, 0, u * 0.62); ctx.restore();
  }
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const mix = { H2O: N2, H2: 0, O2: 0 }, tl = M.tally(mix);
  const A = panel(ctx, W, { top: 30, bottom: H - 26, yMin: 0, yMax: 26, title: t('c2b') });
  bars(ctx, A, ['H₂O', 'H₂', 'O₂', 'H', 'O'], [mix.H2O, mix.H2, mix.O2, tl.atoms.H, tl.atoms.O], [C.cyan, C.green, C.orange, EL.H.col, EL.O.col]);
  const r = M.steamSpacingRatio(100);
  $('r2').textContent = t('s2readout', { T: fmt(T, 0), state: t('ph_' + ph), mols: molsText({ H2O: N2 }), atoms: atomsText(tl.atoms), gas: ph === 'gas' ? t('s2gas', { r: Math.round(r.spacing), v: Math.round(r.volume / 100) * 100 }) : '' });
}
function loop2(now) {
  s2.raf = null;
  if (!s2.visible || document.hidden || reduceMotion()) { s2.last = null; return; }
  if (s2.last != null) s2.time += Math.min(0.05, (now - s2.last) / 1000);
  s2.last = now; draw2(); s2.raf = requestAnimationFrame(loop2);
}
function kick2() { if (s2.raf == null && s2.visible && !document.hidden && !reduceMotion()) s2.raf = requestAnimationFrame(loop2); }

/* ---------- step 3: electrolysis, 2 H2O → 2 H2 + O2 per event ---------- */
const s3 = { k: 0, p: 1, start: 8 };
function layout3(W, H) {
  // Water: 4 × 4 grid in the cell. Gas: 2 columns per tube, filled from the top with the same row height in
  // both tubes, so the hydrogen column grows twice as tall as the oxygen column.
  const cont = { x0: W * 0.06, x1: W * 0.94, y0: H * 0.6, y1: H * 0.96 };
  const tubes = [{ x0: W * 0.1, x1: W * 0.44, y0: 30, y1: H * 0.53 }, { x0: W * 0.56, x1: W * 0.9, y0: 30, y1: H * 0.53 }];
  const cw = (cont.x1 - cont.x0) / 4, chh = (cont.y1 - cont.y0) / 4, tw = (tubes[0].x1 - tubes[0].x0) / 2, th = (tubes[0].y1 - tubes[0].y0) / 8;
  const s = Math.min(cw / 1.8, chh / 1.3, tw / 1.75, th / 0.75, 34);
  const water = i => [cont.x0 + cw * (i % 4 + 0.5), cont.y0 + chh * (Math.floor(i / 4) + 0.5)];
  const slot = (tb, j) => [tb.x0 + tw * (j % 2 + 0.5), tb.y0 + th * (Math.floor(j / 2) + 0.5)];
  return { cont, tubes, s, water, h2: j => slot(tubes[0], j), o2: j => slot(tubes[1], j) };
}
const lerp = (a, b, p) => a + (b - a) * p;
const ease = p => p * p * (3 - 2 * p);
function draw3() {
  const start = s3.start, ev = M.electrolysis(start, s3.k), max = ev.max;
  $('w3v').textContent = String(start);
  $('lg3').innerHTML = [['lgH2O', C.cyan, ''], ['lgH2', C.green, ''], ['lgO2', C.orange, ''], ['lgHat', C.violet, 'dash'], ['lgOat', C.muted, 'dash']].map(([k, c, d]) => `<span class="lg"><span class="sw ${d ? 'sw-dash' : ''}" style="${d ? 'border-color:' + c : 'background:' + c}"></span><span>${t(k)}</span></span>`).join('') + elementLegend(['H', 'O']);
  let { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 18, W - 16);
  const L = layout3(W, H), s = L.s;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(103,215,249,0.06)'; ctx.fillRect(L.cont.x0, L.cont.y0, L.cont.x1 - L.cont.x0, L.cont.y1 - L.cont.y0); ctx.strokeRect(L.cont.x0, L.cont.y0, L.cont.x1 - L.cont.x0, L.cont.y1 - L.cont.y0);
  L.tubes.forEach((tb, i) => { ctx.strokeStyle = C.axis; ctx.strokeRect(tb.x0, tb.y0, tb.x1 - tb.x0, tb.y1 - tb.y0); const ex = (tb.x0 + tb.x1) / 2; ctx.strokeStyle = i ? C.orange : C.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex, tb.y1); ctx.lineTo(ex, L.cont.y0 + 6); ctx.stroke(); ctx.lineWidth = 1.5; });
  ctx.restore();
  fitText(ctx, '−', L.tubes[0].x0 - 2, L.tubes[0].y1 + 2, 14, 16, C.green, 'right');
  fitText(ctx, '+', L.tubes[1].x1 + 2, L.tubes[1].y1 + 2, 14, 16, C.orange, 'left');
  const doneEvents = s3.p < 1 ? s3.k - 1 : s3.k; // while p < 1, event k − 1 is being acted out
  for (let i = 0; i < start; i++) {
    const e = Math.floor(i / 2), [wx, wy] = L.water(i);
    if (e < doneEvents) continue;
    if (s3.p < 1 && e === s3.k - 1) {
      const p = ease(s3.p), [hx, hy] = L.h2(i), [ox, oy] = L.o2(e), half = i % 2;
      const tgtO = [ox + (half ? 0.42 : -0.42) * s, oy], tgtH = [[hx - 0.3 * s, hy], [hx + 0.3 * s, hy]];
      const srcO = [wx, wy], srcH = [[wx - 0.62 * s, wy + 0.48 * s], [wx + 0.62 * s, wy + 0.48 * s]];
      ctx.save(); if (p < 0.25) { ctx.globalAlpha = 1 - p * 4; drawMol(ctx, 'H2O', wx, wy, s); } ctx.restore();
      if (p >= 0.25) { atom(ctx, 'O', lerp(srcO[0], tgtO[0], p), lerp(srcO[1], tgtO[1], p), s); srcH.forEach((h, j) => atom(ctx, 'H', lerp(h[0], tgtH[j][0], p), lerp(h[1], tgtH[j][1], p), s)); }
      continue;
    }
    drawMol(ctx, 'H2O', wx, wy, s);
  }
  for (let e = 0; e < doneEvents; e++) { drawMol(ctx, 'H2', ...L.h2(2 * e), s); drawMol(ctx, 'H2', ...L.h2(2 * e + 1), s); drawMol(ctx, 'O2', ...L.o2(e), s); }

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: Math.max(1, max), yMin: 0, yMax: 2 * start + 1, xTicks: true, title: t('c3b') });
  const shown = s3.p < 1 ? s3.k - 1 + s3.p : s3.k;
  const series = [['H2O', C.cyan], ['H2', C.green], ['O2', C.orange]];
  const pts = key => { const out = []; for (let j = 0; j <= Math.floor(shown); j++) out.push([A.x(j), A.y(M.electrolysis(start, j)[key])]); return out; };
  [[2 * start, C.violet], [start, C.muted]].forEach(([v, c]) => { ctx.save(); ctx.strokeStyle = c; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(v)); ctx.lineTo(A.x(max), A.y(v)); ctx.stroke(); ctx.restore(); });
  series.forEach(([key, c]) => { const P = pts(key); ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2.2; ctx.beginPath(); P.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); P.forEach(([X, Y]) => { ctx.beginPath(); ctx.arc(X, Y, 3.2, 0, 7); ctx.fill(); }); ctx.restore(); });
  const now = M.electrolysis(start, doneEvents), tl = M.tally({ H2O: now.H2O, H2: now.H2, O2: now.O2 });
  $('zap1').disabled = s3.k >= max; $('zapAll').disabled = s3.k >= max;
  $('r3').textContent = t('s3readout', { k: doneEvents, max, w: now.H2O, h: now.H2, o: now.O2, ratio: now.O2 > 0 ? t('s3ratio') : '', atoms: atomsText(tl.atoms) });
}

/* ---------- step 4: physical or chemical ---------- */
const s4 = { id: 'melt', guesses: {} };
function drawSide(ctx, list, x0, x1, y0, y1) {
  const n = list.length, w = (x1 - x0) / n;
  list.forEach((f, i) => { const s = Math.min((w - 8) / (2 * halfW(f) + 0.3), (y1 - y0) / 1.7, 54); drawMol(ctx, f, x0 + w * (i + 0.5), (y0 + y1) / 2, s); });
}
function draw4() {
  const sc = M.SCENARIOS.find(q => q.id === s4.id), g = s4.guesses[sc.id], v = M.classify(sc);
  document.querySelectorAll('#sc4 .btn').forEach(b => { b.setAttribute('aria-pressed', b.dataset.sc === sc.id); b.classList.toggle('done', !!s4.guesses[b.dataset.sc]); });
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 18, W - 16);
  const mid = W / 2, y0 = 34, y1 = H - 12;
  drawSide(ctx, sc.before, 8, mid - 22, y0, y1);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.fillStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mid - 14, (y0 + y1) / 2); ctx.lineTo(mid + 10, (y0 + y1) / 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mid + 16, (y0 + y1) / 2); ctx.lineTo(mid + 6, (y0 + y1) / 2 - 6); ctx.lineTo(mid + 6, (y0 + y1) / 2 + 6); ctx.fill(); ctx.restore();
  if (g) drawSide(ctx, sc.after, mid + 22, W - 8, y0, y1);
  else { ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([5, 5]); ctx.strokeRect(mid + 26, y0 + 6, W - mid - 34, y1 - y0 - 12); ctx.restore(); }
  const name = t('sc_' + sc.id), fm = list => list.map(pretty).join(' + ');
  if (!g) $('r4').textContent = t('s4pick', { sc: name, before: fm(sc.before) });
  else {
    const extra = (sc.id === 'ozone' ? t('s4ozone') : '') + (sc.id === 'charcoal' ? t('s4carbon') : '');
    $('r4').textContent = t('s4readout', { sc: name, before: fm(sc.before), after: fm(sc.after), verdict: v.chemical ? t('s4chem', { new: v.newKinds.map(pretty).join(t('listSep')) }) : t('s4phys'), extra, guess: t(g === 'chem' ? 'gChem' : 'gPhys'), right: t((g === 'chem') === v.chemical ? 'rightYes' : 'rightNo') });
  }
  const judged = Object.keys(s4.guesses), correct = judged.filter(id => (s4.guesses[id] === 'chem') === M.classify(M.SCENARIOS.find(q => q.id === id)).chemical).length;
  $('score4').textContent = t('s4score', { n: judged.length, N: M.SCENARIOS.length, c: correct });
  $('gPhys').disabled = !!g; $('gChem').disabled = !!g;
}

/* ---------- step 5: atom ledger for 2 H2 + O2 → 2 H2O ---------- */
function draw5() {
  const r = num('r5'), mix = M.burn(r), tl = M.tally(mix), t0 = M.tally(M.burn(0));
  $('r5v').textContent = r + '/' + M.BURN_MAX;
  let { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5a'), 8, 18, W - 16);
  const list = [].concat(Array(mix.H2O).fill('H2O'), Array(mix.H2).fill('H2'), Array(mix.O2).fill('O2'));
  const cols = 4, rows = 3, cw = (W - 16) / cols, ch = (H - 36) / rows, s = Math.min(cw / 1.9, ch / 1.5);
  list.forEach((f, i) => drawMol(ctx, f, 8 + cw * (i % cols + 0.5), 32 + ch * (Math.floor(i / cols) + 0.5), s));
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const A = panel(ctx, W, { top: 30, bottom: H * 0.55, yMin: 0, yMax: 18, title: t('c5b') });
  bars(ctx, A, [t('barMol'), t('barH'), t('barO')], [tl.molecules, tl.atoms.H, tl.atoms.O], [C.cyan, EL.H.col, EL.O.col], [t0.molecules, t0.atoms.H, t0.atoms.O]);
  const B = panel(ctx, W, { top: H * 0.55 + 40, bottom: H - 26, yMin: 0, yMax: 160 });
  bars(ctx, B, [t('barMass')], [tl.mass], [C.violet], [t0.mass]);
  $('r5o').textContent = t('s5readout', { r, max: M.BURN_MAX, mix: molsText(mix), m: tl.molecules, m0: t0.molecules, atoms: atomsText(tl.atoms), mass: tl.mass, mass0: t0.mass });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function molButtons(boxId, list, state, draw, step) {
  list.forEach(f => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.textContent = pretty(f); b.dataset.f = f; b.dataset.step = step; b.addEventListener('click', () => { state.f = f; draw(); }); $(boxId).appendChild(b); });
}
let anim3 = null;
function runEvents(count) {
  if (anim3) { cancelAnimationFrame(anim3); anim3 = null; s3.p = 1; }
  const max = M.electrolysis(s3.start, 0).max; let left = Math.min(count, max - s3.k);
  const next = () => {
    if (left <= 0) { draw3(); return; }
    left--; s3.k++;
    if (reduceMotion()) { s3.p = 1; next(); return; }
    s3.p = 0; const t0 = performance.now(), dur = 900;
    const tick = now => { s3.p = Math.min(1, (now - t0) / dur); draw3(); if (s3.p < 1) anim3 = requestAnimationFrame(tick); else { anim3 = null; next(); } };
    anim3 = requestAnimationFrame(tick);
  };
  next();
}
function stop3() { if (anim3) { cancelAnimationFrame(anim3); anim3 = null; } s3.p = 1; }

function setup() {
  molButtons('mols0', F0, s0, draw0, '0'); $('n0').addEventListener('input', draw0);
  molButtons('mols1', M.HO_SET, s1, draw1, '1');
  $('t2').addEventListener('input', () => { draw2(); kick2(); });
  $('zap1').addEventListener('click', () => runEvents(1));
  $('zapAll').addEventListener('click', () => runEvents(99));
  $('refill').addEventListener('click', () => { stop3(); s3.k = 0; draw3(); });
  $('w3').addEventListener('input', () => { stop3(); s3.start = num('w3'); s3.k = 0; draw3(); });
  M.SCENARIOS.forEach(sc => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.sc = sc.id; b.dataset.step = '4'; b.dataset.i18n = 'sc_' + sc.id; b.textContent = t('sc_' + sc.id); b.addEventListener('click', () => { s4.id = sc.id; draw4(); }); $('sc4').appendChild(b); });
  $('gPhys').addEventListener('click', () => { if (!s4.guesses[s4.id]) s4.guesses[s4.id] = 'phys'; draw4(); });
  $('gChem').addEventListener('click', () => { if (!s4.guesses[s4.id]) s4.guesses[s4.id] = 'chem'; draw4(); });
  $('reset4').addEventListener('click', () => { s4.guesses = {}; draw4(); });
  $('r5').addEventListener('input', draw5);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    new IntersectionObserver(es => es.forEach(e => { s2.visible = e.isIntersecting; if (s2.visible) kick2(); }), { threshold: 0.05 }).observe($('c2'));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop3(); draw3(); } else kick2(); });
  window.refreshMolecules = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
