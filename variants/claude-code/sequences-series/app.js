'use strict';
// Sequences & series lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every brick, square, dot and readout comes from window.SEQ_MODEL (model.js). Canvas text is limited to panel
// titles, term symbols inside the step-3 boxes, two row labels and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SEQ_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/\.?0+$/, '') || '0'; };
const sci = v => { const a = Math.abs(v); if (a === 0) return '0'; if (a >= 0.01 && a < 1000) return fmt(v, a < 0.1 ? 3 : 2); return v.toExponential(1).replace('e', '×10^').replace(/\^\+?(-?\d+)/, (_, e) => toSup(e)); };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const toSup = e => String(e).split('').map(ch => SUP[ch]).join('');
const niceCeil = v => { const steps = [1, 2, 2.5, 4, 5, 8, 10, 12, 15, 16, 20, 25, 30, 40, 50]; for (const s of steps) if (v <= s) return s; return Math.ceil(v / 50) * 50; };

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
// Text that shrinks until it fits maxW (never overflows the canvas).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function ticks(lo, hi, px, minPx, minStep = 0) {
  const span = hi - lo; let step = 1;
  for (const s of [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]) { if (s < minStep || (minStep >= 1 && s % 1)) continue; step = s; if (s / span * px >= minPx) break; }
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
// A plot panel: title row above, y ticks left, x ticks below. yTicks may be given explicitly (with labels).
function panel(ctx, W, o) {
  const P = { l: o.left || 34, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yt = o.yTicks || ticks(o.yMin, o.yMax, P.b - P.t, 26).map(v => ({ v, s: fmt(v) }));
  for (const q of yt) {
    const v = typeof q === 'number' ? q : q.v, s = typeof q === 'number' ? fmt(q) : q.s;
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(s, P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.textAlign = 'center';
  for (const v of ticks(o.xMin, o.xMax, P.r - P.l, o.minPx || 30, o.xStepMin || 0)) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(fmt(v), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 6, P.t - 9, W - 12);
  return { x, y, P };
}
const clip = (ctx, m) => { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); };
function polyline(ctx, m, xs, ys, i0, i1, color, lw, alpha = 1, dash = null) {
  if (i1 - i0 < 1) return;
  clip(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); const stride = Math.max(1, Math.floor((i1 - i0) / 1500));
  for (let i = i0; i <= i1; i += stride) { const X = m.x(xs[i]), Y = m.y(ys[i]); if (i === i0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.lineTo(m.x(xs[i1]), m.y(ys[i1])); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = true) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function arrow(ctx, X0, Y0, X1, Y1, color, lw = 2, head = 7, alpha = 1) {
  const L = Math.hypot(X1 - X0, Y1 - Y0); if (L < 1) return;
  const ux = (X1 - X0) / L, uy = (Y1 - Y0) / L, hh = Math.min(head, L * 0.6);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1 - ux * hh * 0.7, Y1 - uy * hh * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X1 - ux * hh - uy * hh * 0.5, Y1 - uy * hh + ux * hh * 0.5); ctx.lineTo(X1 - ux * hh + uy * hh * 0.5, Y1 - uy * hh - ux * hh * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function vline(ctx, X, y0, y1, color, alpha = 0.6, dash = [4, 4], lw = 1.3) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, Y, x0, x1, color, alpha = 0.6, dash = [4, 4], lw = 1.3) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

const group = s => { const neg = s.startsWith('-'); s = neg ? s.slice(1) : s; const [i, f] = s.split('.'); return (neg ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : ''); };
const money = v => (v >= 1e9 ? sci(v) : group(v.toFixed(2)));
const signed = v => (v < 0 ? '−' + fmt(-v) : fmt(v));
const fracStr = v => { if (Math.abs(v - Math.round(v)) < 1e-9) return signed(Math.round(v)); const inv = 1 / v; if (Math.abs(inv - Math.round(inv)) < 1e-9) return (v < 0 ? '−' : '') + '1/' + Math.abs(Math.round(inv)); return signed(v); };
const subNum = k => String(k).split('').map(ch => '₀₁₂₃₄₅₆₇₈₉'[ch]).join('');
const supNum = k => String(k).split('').map(ch => SUP[ch]).join('');
function lerpColor(a, b, f) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`; }

/* ---------- step 0: arithmetic bars made of unit bricks ---------- */
function draw0() {
  const a1 = num('a0'), d = num('d0'), N = 10, terms = M.arithTerms(a1, d, N);
  $('a0v').textContent = String(a1); $('d0v').textContent = signed(d);
  const { ctx, W, H } = fitCanvas($('c0'));
  const lo = Math.min(0, ...terms), hi = Math.max(1, ...terms);
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.4, xMax: N + 0.6, yMin: lo < 0 ? -niceCeil(-lo) : 0, yMax: niceCeil(hi), title: t('c0'), xStepMin: 1 });
  const bw = Math.min(40, (m.x(1) - m.x(0)) * 0.66);
  terms.forEach((v, i) => {
    const n = i + 1, X = m.x(n) - bw / 2, cells = Math.abs(v), sgn = Math.sign(v), cellH = Math.abs(m.y(1) - m.y(0));
    for (let c = 0; c < cells; c++) {
      const isNew = n > 1 && d > 0 && v > 0 && c >= v - d;
      const y0 = m.y(sgn * c), y1 = m.y(sgn * (c + 1));
      ctx.fillStyle = isNew ? C.orange : C.cyan; ctx.fillRect(X, Math.min(y0, y1), bw, Math.abs(y1 - y0));
      if (cellH >= 4) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(X, Math.min(y0, y1), bw, Math.abs(y1 - y0)); }
    }
    if (v === 0) { ctx.fillStyle = C.cyan; ctx.fillRect(X, m.y(0) - 1, bw, 2); }
  });
  const trend = d > 0 ? t('tUp', { d }) : d === 0 ? t('tFlat') : t('tDown', { dd: -d });
  $('r0').textContent = t('s0readout', { list: terms.map(signed).join(', ') + ', …', a1, d: signed(d), a10: signed(terms[9]), trend });
}

/* ---------- step 1: reverse and add ---------- */
const s1 = { p: 0 };
function draw1() {
  const a1 = num('a1'), d = num('d1'), n = num('n1'), terms = M.arithTerms(a1, d, n), an = terms[n - 1];
  $('a1v').textContent = String(a1); $('d1v').textContent = String(d); $('n1v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c1'));
  fitText(ctx, t('c1'), 6, 18, W - 12);
  const l = 14, gap = 24, u = Math.min((W - l - 14) / (a1 + an), (W - l - 14 - gap) / (2 * an)), top = 30, bottom = H - 30, rh = Math.min(28, (bottom - top) / n);
  for (let k = 0; k < n; k++) {
    const y = top + k * rh, left = terms[k], right = terms[n - 1 - k];
    const xr0 = l + an * u + gap, xr1 = l + left * u, xr = xr0 + (xr1 - xr0) * s1.p;
    for (let c = 0; c < left; c++) { ctx.fillStyle = C.cyan; ctx.fillRect(l + c * u, y + 1, u, rh - 2); if (u >= 5) { ctx.strokeStyle = C.bg; ctx.strokeRect(l + c * u, y + 1, u, rh - 2); } }
    for (let c = 0; c < right; c++) { ctx.fillStyle = C.orange; ctx.fillRect(xr + c * u, y + 1, u, rh - 2); if (u >= 5) { ctx.strokeStyle = C.bg; ctx.strokeRect(xr + c * u, y + 1, u, rh - 2); } }
  }
  const bottomY = top + n * rh;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (const v of ticks(0, a1 + an, (a1 + an) * u, 30, 1)) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(l + v * u, bottomY); ctx.lineTo(l + v * u, bottomY + 4); ctx.stroke(); ctx.fillText(String(v), l + v * u, bottomY + 15); }
  ctx.restore();
  if (s1.p >= 1) { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(l, top, (a1 + an) * u, n * rh); ctx.restore(); }
  const w = a1 + an, area = n * w;
  $('r1').textContent = t('s1readout', { prog: s1.p > 0 && s1.p < 1 ? t('s1progress') : '', a1, n, ns: subNum(n), an, w, area, s: fmt(area / 2), terms: terms.join(' + '), direct: M.directSum(terms) });
}

/* ---------- step 2: chessboard ---------- */
function draw2() {
  const k = num('k2');
  $('k2v').textContent = String(k);
  let { ctx, W, H } = fitCanvas($('c2'));
  fitText(ctx, t('c2a'), 6, 18, W - 12);
  const size = Math.min(W - 24, H - 40), cs = size / 8, x0 = (W - size) / 2, y0 = 30;
  for (let i = 0; i < 64; i++) {
    const r = Math.floor(i / 8), c = i % 8, f = i / 63;
    ctx.fillStyle = i < k ? (f < 0.5 ? lerpColor('#14324a', '#67d7f9', f * 2) : lerpColor('#67d7f9', '#ffffff', (f - 0.5) * 2)) : ((r + c) % 2 ? '#141d29' : '#18222f');
    ctx.fillRect(x0 + c * cs + 1, y0 + r * cs + 1, cs - 2, cs - 2);
  }
  { const i = k - 1, r = Math.floor(i / 8), c = i % 8; ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.strokeRect(x0 + c * cs + 0.5, y0 + r * cs + 0.5, cs - 1, cs - 1); ctx.restore(); }

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 65, yMin: 0, yMax: 20, left: 40, yTicks: [0, 5, 10, 15, 20].map(v => ({ v, s: '10' + supNum(v) })), title: t('c2b'), xStepMin: 1 });
  const ks = Array.from({ length: 64 }, (_, i) => i + 1), lg = ks.map(q => (q - 1) * Math.LOG10E * Math.LN2), la = ks.map(q => Math.log10(q));
  polyline(ctx, m, ks, lg, 0, 63, C.cyan, 1.2, 0.3); polyline(ctx, m, ks, la, 0, 63, C.raw, 1.2, 0.5);
  polyline(ctx, m, ks, lg, 0, k - 1, C.cyan, 2.6); polyline(ctx, m, ks, la, 0, k - 1, C.ghost, 2.2);
  dot(ctx, m.x(k), m.y(lg[k - 1]), 5, C.cyan); dot(ctx, m.x(k), m.y(la[k - 1]), 4, C.ghost);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x(k), m.y(lg[k - 1]), 8, 0, 7); ctx.stroke(); ctx.restore();
  const prog = anims.s2 ? t('s2progress', { k }) : '';
  let txt = t('s2readout', { prog, k, g: group(M.grains(k).toString()), sum: group(M.grainsUpTo(k).toString()), lin: group(String(k * (k + 1) / 2)) });
  if (k === 64) txt += ' ' + t('s2full', { t: sci(M.tonnes(M.grainsUpTo(64))) });
  $('r2').textContent = txt;
}

/* ---------- step 3: shift and subtract ---------- */
const s3 = { p: 0 };
const termLabel = j => (j === 0 ? 'a' : j === 1 ? 'ar' : 'ar' + supNum(j));
function draw3() {
  const a = num('a3'), r = num('r3'), n = num('n3');
  $('a3v').textContent = String(a); $('r3v').textContent = signed(r); $('n3v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c3'));
  fitText(ctx, t('c3'), 6, 18, W - 12);
  const lab = 40, cols = n + 1, bw = (W - lab - 12) / cols, rows = [44, 120], bh = 52;
  fitText(ctx, 'Sₙ', 6, rows[0] + bh / 2 + 5, lab - 10, { size: 14, color: C.cyan });
  fitText(ctx, 'rSₙ', 6, rows[1] + bh / 2 + 5, lab - 10, { size: 14, color: C.orange });
  const box = (X, Y, label, color, gray) => {
    ctx.save(); ctx.globalAlpha = gray ? 0.35 : 1; ctx.fillStyle = gray ? '#2a3442' : 'rgba(255,255,255,0.03)'; ctx.fillRect(X + 2, Y, bw - 4, bh);
    ctx.strokeStyle = gray ? C.raw : color; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y, bw - 4, bh); ctx.restore();
    fitText(ctx, label, X + bw / 2, Y + bh / 2 + 5, bw - 10, { size: 14, color: gray ? C.raw : color, align: 'center' });
  };
  const done = s3.p >= 1;
  for (let j = 0; j < n; j++) box(lab + j * bw, rows[0], termLabel(j), C.cyan, done && j >= 1);
  for (let j = 0; j < n; j++) box(lab + (j + s3.p) * bw, rows[1], termLabel(j + 1), C.orange, done && j <= n - 2);
  const direct = M.directSum(M.geoTerms(a, r, n)), s = M.geoSum(a, r, n);
  $('r3o').textContent = t('s3readout', { prog: s3.p > 0 && s3.p < 1 ? t('s3progress') : '', a, r: signed(r), n, ns: subNum(n), direct: signed(direct), formula: r === 1 ? t('s3f1') : t('s3fr'), s: signed(s) });
}

/* ---------- step 4: partial sums and the limit ---------- */
function draw4() {
  const r = Math.round(num('r4') * 100) / 100, n = num('n4'), S = Array.from({ length: 30 }, (_, i) => M.geoSum(1, r, i + 1)), L = M.geoLimit(1, r);
  $('r4v').textContent = signed(r); $('n4v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c4'));
  const hi = Math.max(...S, Number.isFinite(L) ? L : 0), lo = Math.min(0, ...S);
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 30.5, yMin: lo, yMax: niceCeil(hi * 1.08), title: t('c4'), xStepMin: 1 });
  if (Number.isFinite(L)) {
    ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.22)'; const yb = m.y(L + 0.01), yt = m.y(L - 0.01); ctx.fillRect(m.P.l, yb, m.P.r - m.P.l, Math.max(2, yt - yb)); ctx.restore();
    hline(ctx, m.y(L), m.P.l, m.P.r, C.orange, 0.95, [7, 5], 1.8);
  }
  S.forEach((v, i) => dot(ctx, m.x(i + 1), m.y(v), i < n ? 4.2 : 2.4, i < n ? C.text : C.raw, false));
  polyline(ctx, m, S.map((_, i) => i + 1), S, 0, n - 1, C.text, 1.2, 0.5);
  const s = S[n - 1];
  let txt;
  if (Number.isFinite(L)) txt = t('s4conv', { n, ns: subNum(n), s: fmt(s, 4), L: fmt(L, 4), gap: fmt(Math.abs(L - s), 4), N: M.termsWithin(1, r, 0.01), alt: r < 0 ? t('s4alt') : '' });
  else if (Math.abs(r - 1) < 1e-9) txt = t('s4one', { n, ns: subNum(n) });
  else txt = t('s4div', { n, ns: subNum(n), s: fmt(s, 2) });
  $('r4o').textContent = txt;
}

/* ---------- step 5: adding vs multiplying ---------- */
const s5 = { log: false };
function draw5() {
  const d = num('d5'), r = Math.round(num('r5') * 100) / 100, N = num('N5'), p = M.pocket(d, r, { N });
  $('d5v').textContent = String(d); $('r5v').textContent = fmt(r); $('N5v').textContent = String(N);
  $('log5').textContent = t(s5.log ? 'logOn' : 'logOff'); $('log5').setAttribute('aria-pressed', s5.log);
  const { ctx, W, H } = fitCanvas($('c5'));
  const days = Array.from({ length: N }, (_, i) => i + 1), top = Math.max(p.A[N - 1], p.B[N - 1]);
  let m, A = p.A, B = p.B;
  if (s5.log) {
    const yMax = Math.ceil(Math.log10(top)) + 0.2;
    const tk = []; for (let v = -2; v <= yMax; v += Math.max(1, Math.ceil((yMax + 2) / 6))) tk.push({ v, s: '10' + supNum(v).replace('-', '⁻') });
    m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.5, xMax: N + 0.5, yMin: -2, yMax, left: 44, yTicks: tk, title: t('c5'), xStepMin: 1 });
    A = A.map(Math.log10); B = B.map(Math.log10);
  } else {
    const e10 = Math.pow(10, Math.floor(Math.log10(top * 1.05))), mant = top * 1.05 / e10, yMax = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(v => v >= mant - 1e-9) * e10;
    m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.5, xMax: N + 0.5, yMin: 0, yMax, left: 52, yTicks: [0, yMax / 2, yMax].map(v => ({ v, s: v >= 1e5 ? sci(v) : group(String(Math.round(v))) })), title: t('c5'), xStepMin: 1 });
  }
  polyline(ctx, m, days, A, 0, N - 1, C.cyan, 2.4); polyline(ctx, m, days, B, 0, N - 1, C.orange, 2.4);
  if (p.cross) { vline(ctx, m.x(p.cross), m.P.t, m.P.b, C.green, 0.8); dot(ctx, m.x(p.cross), m.y(B[p.cross - 1]), 6, C.green); }
  $('r5o').textContent = t('s5readout', { N, A: money(p.A[N - 1]), B: money(p.B[N - 1]), cross: p.cross ? t('s5cross', { k: p.cross }) : t('s5none', { N }) });
}

/* ---------- finale quiz ---------- */
const sq = { i: 0 };
function drawQuiz() {
  const seq = M.QUIZ[sq.i];
  $('qSeq').textContent = t('qProgress', { i: sq.i + 1, N: M.QUIZ.length }) + seq.map(signed).join(', ') + ', …';
  const fb = $('quizFeedback'); if (fb.dataset.state) checkQuiz(true);
}
function checkQuiz(silent) {
  const seq = M.QUIZ[sq.i], c = M.classify(seq), choice = document.querySelector('input[name="quiz"]:checked'), fb = $('quizFeedback');
  if (!choice) { if (!silent) { fb.textContent = ''; delete fb.dataset.state; } return; }
  const diffs = seq.slice(1).map((v, i) => signed(v - seq[i])).join(', ');
  const why = c.kind === 'arith' ? t('whyArith', { d: signed(c.d), next: signed(c.next) }) : c.kind === 'geo' ? t('whyGeo', { r: fracStr(c.r), next: fracStr(c.next) }) : t('whyNeither', { diffs });
  const ok = choice.value === c.kind;
  fb.textContent = t(ok ? 'qRight' : 'qWrong', { why }); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); drawQuiz(); }

function setup() {
  ['a0', 'd0'].forEach(id => $(id).addEventListener('input', draw0));
  ['a1', 'd1', 'n1'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); draw1(); }));
  $('join1').addEventListener('click', () => { const from = s1.p; animate('s1', 1600, p => { s1.p = from + (1 - from) * p; draw1(); }); });
  $('split1').addEventListener('click', () => { stopAnim('s1'); s1.p = 0; draw1(); });
  $('k2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => { animate('s2', 8000, p => { $('k2').value = Math.max(1, Math.round(p * 64)); draw2(); }, draw2); });
  ['a3', 'r3', 'n3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); draw3(); }));
  $('shift3').addEventListener('click', () => { const from = s3.p; animate('s3', 1200, p => { s3.p = from + (1 - from) * p; draw3(); }); });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.p = 0; draw3(); });
  ['r4', 'n4'].forEach(id => $(id).addEventListener('input', draw4));
  ['d5', 'r5', 'N5'].forEach(id => $(id).addEventListener('input', draw5));
  $('log5').addEventListener('click', () => { s5.log = !s5.log; draw5(); });
  $('checkQuiz').addEventListener('click', () => checkQuiz(false));
  $('nextQuiz').addEventListener('click', () => { sq.i = (sq.i + 1) % M.QUIZ.length; document.querySelectorAll('input[name="quiz"]').forEach(x => { x.checked = false; }); const fb = $('quizFeedback'); fb.textContent = ''; delete fb.dataset.state; drawQuiz(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
