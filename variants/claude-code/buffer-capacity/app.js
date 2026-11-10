'use strict';
// Buffer-capacity lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every pH, amount and curve comes from window.BUFFER_MODEL (model.js). Canvas text is limited to panel titles,
// axis ticks and the beaker / bar captions laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BUFFER_MODEL;
const t = (...a) => window.BUFFER_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', glass: '#c9d5e3' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const sgn = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(d);
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// mol amounts: 3 decimals, or 9.9×10⁻⁷ style below 0.001
function mol(v) {
  if (Math.abs(v) >= 0.001 || v === 0) return v.toFixed(3);
  let e = Math.floor(Math.log10(Math.abs(v))), m = (v / Math.pow(10, e)).toPrecision(2); if (Math.abs(Number(m)) >= 10) { e += 1; m = (v / Math.pow(10, e)).toPrecision(2); }
  return `${m}×10${String(e).split('').map(c => SUP[c]).join('')}`;
}
const ratioLabel = lr => { const r = Math.pow(10, lr); return r >= 10 ? fmt(r, 0) : r >= 1 ? fmt(r, 2) : r >= 0.1 ? fmt(r, 3) : fmt(r, 4); };
const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
const BUF0 = M.make(0.2, 1, M.PAIRS.acetic.pKa); // 0.10 mol HA + 0.10 mol NaA in 1 L

function fitCanvas(canvas, H) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = H || Number(canvas.getAttribute('height')) || 300;
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function fitLine(ctx, text, X, Y, maxW, weight = 600, size = 12, align = 'left') {
  ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y);
}
// Panel title: one line if it fits at ≥ 10 px, otherwise split at " · " into two lines.
function title(ctx, text, X, Y, maxW) {
  ctx.save(); ctx.fillStyle = C.text; ctx.font = '600 10px system-ui,sans-serif';
  const cut = text.indexOf(' · ');
  if (ctx.measureText(text).width > maxW && cut > 0) { fitLine(ctx, text.slice(0, cut), X, Y - 13, maxW); fitLine(ctx, text.slice(cut + 3), X, Y, maxW); }
  else fitLine(ctx, text, X, Y, maxW);
  ctx.restore();
}
function panel(ctx, R, o) {
  const x = v => R.l + (v - o.xMin) / (o.xMax - o.xMin) * (R.r - R.l);
  const y = v => R.b - (v - o.yMin) / (o.yMax - o.yMin) * (R.b - R.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(R.l, y(v)); ctx.lineTo(R.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), R.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    ctx.strokeStyle = o.xGrid ? C.grid : C.grid; ctx.beginPath(); ctx.moveTo(x(v), o.xGrid ? R.t : R.b); ctx.lineTo(x(v), R.b + 4); ctx.stroke();
    ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), R.b + 15);
  }
  ctx.restore();
  const tx = o.titleX != null ? o.titleX : 8;
  if (o.title) title(ctx, o.title, tx, R.t - 9, R.r - tx);
  return { x, y, R };
}
function line(ctx, pts, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
function clipTo(ctx, R) { ctx.save(); ctx.beginPath(); ctx.rect(R.l, R.t - 1, R.r - R.l, R.b - R.t + 2); ctx.clip(); }

/* ---------- step 0: one drop at a time ---------- */
const MAXD = 25;
const s0 = { d: 0, seen: new Set([0]), anim: null };
function beaker(ctx, cx, top, w, h, pHv, name, fall) {
  const x0 = cx - w / 2, lip = 6, fillTop = top + h * 0.22;
  ctx.save();
  ctx.fillStyle = rgb(M.indicator(pHv)); ctx.globalAlpha = 0.85;
  ctx.fillRect(x0 + 3, fillTop, w - 6, top + h - fillTop - 3); ctx.globalAlpha = 1;
  ctx.strokeStyle = C.glass; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0 - lip, top); ctx.lineTo(x0, top + 4); ctx.lineTo(x0, top + h); ctx.lineTo(x0 + w, top + h); ctx.lineTo(x0 + w, top + 4); ctx.lineTo(x0 + w + lip, top); ctx.stroke();
  if (fall != null) { ctx.fillStyle = fall.kind > 0 ? C.pink : C.violet; ctx.beginPath(); ctx.arc(cx, top - 18 + (fillTop - top + 18) * fall.p, 4, 0, 7); ctx.fill(); }
  ctx.fillStyle = C.text; fitLine(ctx, name, cx, top + h + 18, w + 2 * lip + 10, 600, 12, 'center');
  ctx.fillStyle = C.muted; fitLine(ctx, 'pH ' + pHv.toFixed(2), cx, top + h + 34, w + 2 * lip + 10, 600, 12, 'center');
  ctx.restore();
}
function draw0() {
  const cv = $('c0'), W = Math.max(240, cv.clientWidth || 600), wide = W >= 620;
  const H = wide ? 320 : 470, { ctx } = fitCanvas(cv, H);
  const pw = M.pH(M.WATER, s0.d * M.DROP), pb = M.pH(BUF0, s0.d * M.DROP);
  const bw = wide ? Math.min(120, W * 0.13) : Math.min(100, W * 0.3), bh = wide ? 170 : 130;
  const region = wide ? { l: 10, r: W * 0.42 } : { l: 0, r: W }, top = wide ? 60 : 40;
  const cx1 = region.l + (region.r - region.l) * 0.28, cx2 = region.l + (region.r - region.l) * 0.72;
  const fall = s0.anim ? { kind: s0.anim.kind, p: s0.anim.p } : null;
  beaker(ctx, cx1, top, bw, bh, s0.anim ? s0.anim.pw : pw, t('c0water'), fall);
  beaker(ctx, cx2, top, bw, bh, s0.anim ? s0.anim.pb : pb, t('c0buffer'), fall);
  const R = wide ? { l: W * 0.42 + 44, r: W - 14, t: 44, b: H - 26 } : { l: 40, r: W - 12, t: top + bh + 92, b: H - 26 };
  const P = panel(ctx, R, { xMin: -MAXD, xMax: MAXD, yMin: 0, yMax: 14, yTicks: [0, 7, 14], xTicks: [-20, -10, 0, 10, 20], xFmt: v => fmt(v, 0), title: t('c0chart'), titleX: wide ? W * 0.42 + 14 : 8 });
  const seen = [...s0.seen].sort((a, b) => a - b);
  line(ctx, seen.map(d => [P.x(d), P.y(M.pH(M.WATER, d * M.DROP))]), C.ghost, { lw: 1.6 });
  line(ctx, seen.map(d => [P.x(d), P.y(M.pH(BUF0, d * M.DROP))]), C.green, { lw: 2 });
  seen.forEach(d => { dot(ctx, P.x(d), P.y(M.pH(M.WATER, d * M.DROP)), d === s0.d ? 5 : 3, C.ghost); dot(ctx, P.x(d), P.y(M.pH(BUF0, d * M.DROP)), d === s0.d ? 5.5 : 3.2, C.green); });
  const n = Math.abs(s0.d) * M.DROP;
  $('r0').textContent = t('s0readout', { d: s0.d, amt: t(s0.d > 0 ? 'amtAcid' : s0.d < 0 ? 'amtBase' : 'amtNone', { n: n.toFixed(3) }), pw: pw.toFixed(2), dw: sgn(pw - 7, 2), pb: pb.toFixed(2), db: sgn(pb - M.pH(BUF0, 0), 2) });
  $('acid0').disabled = s0.d >= MAXD; $('base0').disabled = s0.d <= -MAXD;
}
function drop(kind) {
  if (s0.anim) return;
  const next = Math.max(-MAXD, Math.min(MAXD, s0.d + kind)); if (next === s0.d) return;
  if (reduceMotion()) { s0.d = next; s0.seen.add(next); draw0(); return; }
  const pw = M.pH(M.WATER, s0.d * M.DROP), pb = M.pH(BUF0, s0.d * M.DROP), start = performance.now();
  s0.anim = { kind, p: 0, pw, pb, next };
  const tick = now => {
    if (!s0.anim) return;
    s0.anim.p = Math.min(1, (now - start) / 380);
    if (s0.anim.p >= 1 || document.hidden) { s0.anim = null; s0.d = next; s0.seen.add(next); draw0(); return; }
    draw0(); requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- step 1: the stockpile ---------- */
function draw1() {
  const n = num('n1'), q = M.inventory(BUF0, n), p = M.pH(BUF0, n), hh = M.hh(BUF0, n);
  $('n1v').textContent = (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(3) + ' mol';
  const { ctx, W, H } = fitCanvas($('c1'));
  const top = panel(ctx, { l: 56, r: W - 16, t: 30, b: 150 }, { xMin: 0, xMax: 0.25, yMin: 0, yMax: 1, yTicks: [], xTicks: W < 420 ? [0, 0.1, 0.2] : [0, 0.05, 0.1, 0.15, 0.2, 0.25], xFmt: v => fmt(v, 2), xGrid: true, title: t('c1inv') });
  const rows = [['HA', q.HA, C.cyan], ['A⁻', q.A, C.green], ['H⁺', q.exAcid, C.pink], ['OH⁻', q.exBase, C.violet]];
  const rh = (top.R.b - top.R.t) / rows.length;
  rows.forEach(([lab, v, col], i) => {
    const y0 = top.R.t + i * rh + rh * 0.18, h = rh * 0.64;
    ctx.fillStyle = col; ctx.fillRect(top.x(0), y0, Math.max(v > 0 ? 1.5 : 0, top.x(Math.min(0.25, v)) - top.x(0)), h);
    ctx.fillStyle = C.text; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillText(lab, top.R.l - 8, y0 + h / 2 + 4);
  });
  // pH ruler 0–14 painted with the indicator palette
  const R = { l: 16, r: W - 16, y: 222, h: 16 }, X = v => R.l + v / 14 * (R.r - R.l);
  title(ctx, t('c1ruler'), 8, 186, W - 16);
  for (let i = 0; i < 140; i++) { ctx.fillStyle = rgb(M.indicator(i / 10)); ctx.fillRect(X(i / 10), R.y, X((i + 1) / 10) - X(i / 10) + 0.5, R.h); }
  ctx.save(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  const step = W < 420 ? 2 : 1; for (let v = 0; v <= 14; v += step) ctx.fillText(String(v), X(v), R.y + R.h + 30);
  ctx.restore();
  const tri = (v, up, col) => { const x = X(Math.max(0, Math.min(14, v))); ctx.fillStyle = col; ctx.beginPath(); if (up) { ctx.moveTo(x - 7, R.y - 12); ctx.lineTo(x + 7, R.y - 12); ctx.lineTo(x, R.y - 1); } else { ctx.moveTo(x - 6, R.y + R.h + 12); ctx.lineTo(x + 6, R.y + R.h + 12); ctx.lineTo(x, R.y + R.h + 1); } ctx.fill(); };
  if (isFinite(hh)) tri(hh, false, C.text);
  tri(p, true, C.orange);
  const action = n > 0 ? t('actAcid', { n: n.toFixed(3), u: Math.min(n, BUF0.A0).toFixed(3) }) : n < 0 ? t('actBase', { n: (-n).toFixed(3), u: Math.min(-n, BUF0.HA0).toFixed(3) }) : t('actNone');
  const excess = q.exAcid > 1e-12 ? t('exAcid', { x: q.exAcid.toFixed(3) }) : q.exBase > 1e-12 ? t('exBase', { x: q.exBase.toFixed(3) }) : t('exNone');
  $('r1').textContent = t('s1readout', { action, A: q.A.toFixed(3), HA: q.HA.toFixed(3), excess, p: p.toFixed(2), hh: isFinite(hh) ? ' ' + hh.toFixed(2) : t('hhNa') });
}

/* ---------- step 2: the ratio sets pH ---------- */
let pair2 = 'acetic';
const pairName = k => t({ acetic: 'pairAcetic', phosphate: 'pairPhosphate', ammonium: 'pairAmmonium' }[k]);
function draw2() {
  const lr = num('lr2'), lc = num('lc2'), Cc = Math.pow(10, lc), pKa = M.PAIRS[pair2].pKa, buf = M.make(Cc, Math.pow(10, lr), pKa);
  $('r2v').textContent = ratioLabel(lr); $('c2v').textContent = (Cc >= 0.01 ? fmt(Cc, 3) : Cc.toPrecision(2)) + ' mol/L';
  document.querySelectorAll('#pairBtns [data-pair]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pair === pair2 ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c2'));
  const y0 = Math.floor(pKa) - 3, y1 = Math.ceil(pKa) + 3;
  const yt = []; for (let v = y0; v <= y1; v++) if (W >= 420 || (v - y0) % 2 === 0) yt.push(v);
  const P = panel(ctx, { l: 44, r: W - 14, t: 40, b: H - 26 }, { xMin: -2, xMax: 2, yMin: y0, yMax: y1, yTicks: yt, xTicks: [-2, -1, 0, 1, 2], xFmt: v => ratioLabel(v), title: t('c2chart') });
  line(ctx, [[P.x(-2), P.y(pKa - 2)], [P.x(2), P.y(pKa + 2)]], C.text, { lw: 1.5, dash: [6, 4], alpha: 0.85 });
  const pts = []; for (let v = -2; v <= 2.0001; v += 0.025) pts.push([P.x(v), P.y(M.pH(M.make(Cc, Math.pow(10, v), pKa), 0))]);
  clipTo(ctx, P.R); line(ctx, pts, C.green, { lw: 2.4 }); ctx.restore();
  const p = M.pH(buf, 0), hh = pKa + lr;
  dot(ctx, P.x(lr), P.y(Math.max(y0, Math.min(y1, p))), 6, C.orange);
  const dd = M.pH(M.make(Cc / 10, Math.pow(10, lr), pKa), 0) - p;
  $('r2').textContent = t('s2readout', { pair: pairName(pair2), r: ratioLabel(lr), C: Cc >= 0.01 ? fmt(Cc, 3) : Cc.toPrecision(2), p: p.toFixed(2), hh: hh.toFixed(2), d: Math.abs(p - hh).toFixed(2), dd: sgn(dd, 3) });
}

/* ---------- step 3: capacity grows with the stockpile ---------- */
const tried3 = new Set([0.2]);
function draw3() {
  const Cc = num('c3s'), buf = M.make(Cc, 1, M.PAIRS.acetic.pKa);
  $('c3v').textContent = fmt(Cc, 2) + ' mol/L';
  const { ctx, W, H } = fitCanvas($('c3'));
  const P = panel(ctx, { l: 40, r: W - 14, t: 40, b: H - 26 }, { xMin: -0.25, xMax: 0.25, yMin: 0, yMax: 14, yTicks: W < 420 ? [0, 7, 14] : [0, 2, 4, 6, 8, 10, 12, 14], xTicks: W < 420 ? [-0.2, 0, 0.2] : [-0.2, -0.1, 0, 0.1, 0.2], xFmt: v => fmt(v, 1), title: t('c3chart') });
  const p0 = M.pH(buf, 0);
  ctx.fillStyle = 'rgba(255,180,84,0.12)'; ctx.fillRect(P.R.l, P.y(p0 + 1), P.R.r - P.R.l, P.y(p0 - 1) - P.y(p0 + 1));
  const cv = b => M.curve(b, -0.25, 0.25, 400).map(([n, p]) => [P.x(n), P.y(p)]);
  line(ctx, cv(M.WATER), C.ghost, { lw: 1.6 });
  for (const c of tried3) if (Math.abs(c - Cc) > 1e-9) line(ctx, cv(M.make(c, 1, M.PAIRS.acetic.pKa)), C.green, { lw: 1.4, alpha: 0.3 });
  line(ctx, cv(buf), C.green, { lw: 2.6 });
  const ca = M.capacity(buf, 1), cb = M.capacity(buf, -1);
  dot(ctx, P.x(ca), P.y(p0 - 1), 5, C.orange); dot(ctx, P.x(-cb), P.y(p0 + 1), 5, C.orange);
  const cw = M.capacity(M.WATER, 1);
  $('r3').textContent = t('s3readout', { C: fmt(Cc, 2), half: (Cc / 2).toFixed(3), ca: ca.toFixed(3), cb: cb.toFixed(3), k: (((ca + cb) / 2) / Cc).toFixed(2), cw: mol(cw), x: Number((ca / cw).toPrecision(2)).toLocaleString(window.BUFFER_I18N.getLang() === 'zh' ? 'zh-CN' : 'en-US') });
}

/* ---------- step 4: where the buffer is stiffest ---------- */
function draw4() {
  const lr = num('lr4'), buf = M.make(0.2, Math.pow(10, lr), M.PAIRS.acetic.pKa), pKa = buf.pKa;
  $('r4v').textContent = ratioLabel(lr);
  const { ctx, W, H } = fitCanvas($('c4'));
  const P = panel(ctx, { l: 48, r: W - 14, t: 40, b: H - 26 }, { xMin: 2, xMax: 8, yMin: 0, yMax: 0.12, yTicks: [0, 0.04, 0.08, 0.12], xTicks: W < 420 ? [2, 4, 6, 8] : [2, 3, 4, 5, 6, 7, 8], xFmt: v => fmt(v, 0), title: t('c4chart') });
  ctx.fillStyle = 'rgba(255,180,84,0.12)'; ctx.fillRect(P.x(pKa - 1), P.R.t, P.x(pKa + 1) - P.x(pKa - 1), P.R.b - P.R.t);
  const pts = []; for (let v = 2; v <= 8.0001; v += 0.02) pts.push([P.x(v), P.y(Math.min(0.12, M.beta(buf, v)))]);
  line(ctx, pts, C.green, { lw: 2.4 });
  line(ctx, [[P.x(pKa), P.R.t], [P.x(pKa), P.R.b]], C.orange, { lw: 1.2, dash: [4, 4], alpha: 0.7 });
  const p = M.pH(buf, 0), b = M.beta(buf, p), bm = M.beta(buf, pKa);
  dot(ctx, P.x(p), P.y(b), 6.5, C.orange);
  const ca = M.capacity(buf, 1), cb = M.capacity(buf, -1), rel = (ca - cb) / Math.max(ca, cb);
  const verdict = t(Math.abs(rel) < 0.05 ? 'v4Even' : rel > 0 ? 'v4Acid' : 'v4Base');
  $('r4').textContent = t('s4readout', { r: ratioLabel(lr), p: p.toFixed(2), b: b.toFixed(3), bm: bm.toFixed(3), ca: ca.toFixed(3), cb: cb.toFixed(3), verdict });
}

function draw5() { $('s5fin').innerHTML = t('s5fin', { blood: (M.PAIRS.carbonic.pKa + Math.log10(20)).toFixed(2) }); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('acid0').addEventListener('click', () => drop(1));
  $('base0').addEventListener('click', () => drop(-1));
  $('reset0').addEventListener('click', () => { s0.anim = null; s0.d = 0; s0.seen = new Set([0]); draw0(); });
  $('n1').addEventListener('input', draw1);
  ['lr2', 'lc2'].forEach(id => $(id).addEventListener('input', draw2));
  document.querySelectorAll('#pairBtns [data-pair]').forEach(b => b.addEventListener('click', () => { pair2 = b.dataset.pair; draw2(); }));
  $('c3s').addEventListener('input', () => { tried3.add(num('c3s')); draw3(); });
  $('lr4').addEventListener('input', draw4);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const nav = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => nav.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && s0.anim) { s0.d = s0.anim.next; s0.seen.add(s0.d); s0.anim = null; draw0(); } }); // finish a falling drop at once
  window.refreshBuffer = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
