'use strict';
// Limits and ε–δ lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every band, best δ, witness and N comes from window.LIM_MODEL (model.js). Canvas text is limited to
// one panel title per canvas (its own row, shrunk to fit) and axis tick labels.
(function () {

const $ = id => document.getElementById(id);
const M = window.LIM_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { bg: '#0d1621', grid: '#1f2d3d', axis: '#4a5f78', muted: '#9aaabd', text: '#e8edf4', cyan: '#67d7f9', green: '#7ee2a8', red: '#ff6b81', orange: '#ffb454', epsF: 'rgba(126,226,168,0.16)', epsS: 'rgba(126,226,168,0.7)', delF: 'rgba(103,215,249,0.13)', delS: 'rgba(103,215,249,0.75)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const MINUS = '−';
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', MINUS); };
const trim = (v, d = 3) => fix(v, d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
// Small positive numbers: plain decimals down to 1e-4, scientific below.
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = v => { const [m, e] = v.toExponential(2).split('e'); return m + '×10' + String(Number(e)).split('').map(c => SUP[c]).join(''); };
const small = v => (Math.abs(v) >= 9.95e-5 ? String(Number(v.toPrecision(3))) : sci(v)).replace(/^-/, MINUS);
const sig = (v, s = 4) => (Math.abs(v) >= 1e5 ? sci(v) : String(Number(v.toPrecision(s)))).replace(/^-/, MINUS);

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
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A plot. o: x0,x1,y0,y1, left, right, top, bottom, xticks/yticks: [{v, l}], title, xmap (optional, e.g. log)
function plot(ctx, W, H, o) {
  const P = { l: o.left || 44, r: W - (o.right || 12), t: o.top || 30, b: H - (o.bottom || 26) };
  const xm = o.xmap || (v => v);
  const X = v => P.l + (xm(v) - xm(o.x0)) / (xm(o.x1) - xm(o.x0)) * (P.r - P.l);
  const Y = v => P.b - (v - o.y0) / (o.y1 - o.y0) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.lineWidth = 1;
  ctx.fillStyle = C.muted;
  // x labels: skip any label that would collide with the previous one
  let lastR = -Infinity; ctx.textAlign = 'center';
  for (const q of o.xticks || []) {
    const px = X(q.v); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(px, P.t); ctx.lineTo(px, P.b); ctx.stroke();
    const w = ctx.measureText(q.l).width;
    if (px - w / 2 > lastR + 6 && px - w / 2 >= 0 && px + w / 2 <= W) { ctx.fillText(q.l, px, P.b + 15); lastR = px + w / 2; }
  }
  ctx.textAlign = 'right'; let lastT = Infinity;
  for (const q of o.yticks || []) {
    const py = Y(q.v); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, py); ctx.lineTo(P.r, py); ctx.stroke();
    if (py + 4 < lastT - 6) { ctx.fillText(q.l, P.l - 6, py + 4); lastT = py - 8; }
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, 18, W - 16);
  return { X, Y, P, o };
}
function clip(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function hband(ctx, m, lo, hi) { clip(ctx, m); ctx.fillStyle = C.epsF; ctx.fillRect(m.P.l, m.Y(hi), m.P.r - m.P.l, m.Y(lo) - m.Y(hi)); ctx.strokeStyle = C.epsS; ctx.setLineDash([5, 4]); [lo, hi].forEach(v => { ctx.beginPath(); ctx.moveTo(m.P.l, m.Y(v)); ctx.lineTo(m.P.r, m.Y(v)); ctx.stroke(); }); ctx.restore(); }
function vband(ctx, m, lo, hi) { clip(ctx, m); ctx.fillStyle = C.delF; ctx.fillRect(m.X(lo), m.P.t, m.X(hi) - m.X(lo), m.P.b - m.P.t); ctx.strokeStyle = C.delS; ctx.setLineDash([5, 4]); [lo, hi].forEach(v => { ctx.beginPath(); ctx.moveTo(m.X(v), m.P.t); ctx.lineTo(m.X(v), m.P.b); ctx.stroke(); }); ctx.restore(); }
function vline(ctx, m, x, color, lw = 1.6, dash = null) { clip(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.X(x), m.P.t); ctx.lineTo(m.X(x), m.P.b); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, y, color, lw = 1.4, dash = null) { clip(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.Y(y)); ctx.lineTo(m.P.r, m.Y(y)); ctx.stroke(); ctx.restore(); }
// Curve from x0 to x1; colour(x, y) picks the stroke per segment; breaks at gaps (null y) and at huge jumps.
function curve(ctx, m, f, x0, x1, n, colour, lw = 2) {
  clip(ctx, m); ctx.lineWidth = lw; ctx.lineJoin = 'round';
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, y = f(x);
    if (y === null || !isFinite(y)) { prev = null; continue; }
    const py = Math.max(m.P.t - 40, Math.min(m.P.b + 40, m.Y(y)));
    const cur = { px: m.X(x), py, x, y };
    if (prev && Math.abs(cur.py - prev.py) < (m.P.b - m.P.t) * 1.5) { ctx.strokeStyle = colour(x, y); ctx.beginPath(); ctx.moveTo(prev.px, prev.py); ctx.lineTo(cur.px, cur.py); ctx.stroke(); }
    prev = cur;
  }
  ctx.restore();
}
function dot(ctx, m, x, y, color, r = 5, hollow = false) {
  clip(ctx, m); ctx.beginPath(); ctx.arc(m.X(x), m.Y(y), r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
const ticks = (vals, d = 2) => vals.map(v => ({ v, l: trim(v, d) }));

/* ---------- animation runner ---------- */
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

/* ---------- step 0: a hole at x = 1 ---------- */
const s0 = { ks: new Set([1]) };
const H0 = k => Math.pow(10, -k);
function digits0(k) { return Math.min(12, Math.ceil(k) + 3); }
function draw0() {
  const k = num('k0'), h = H0(k), fl = M.hole(1 - h), fr = M.hole(1 + h);
  $('k0v').textContent = small(h);
  let { ctx, W, H } = fitCanvas($('c0'));
  let m = plot(ctx, W, H, { x0: 0, x1: 2.2, y0: 0.6, y1: 3.4, left: 34, xticks: ticks([0, 0.5, 1, 1.5, 2]), yticks: ticks([1, 2, 3]), title: t('c0a') });
  curve(ctx, m, x => (Math.abs(x - 1) < 1e-9 ? null : M.hole(x)), 0, 2.2, 220, () => C.text, 2);
  [...s0.ks].forEach(q => { const hh = H0(q); dot(ctx, m, 1 - hh, M.hole(1 - hh), C.cyan, 3.6); dot(ctx, m, 1 + hh, M.hole(1 + hh), C.orange, 3.6); });
  dot(ctx, m, 1, 2, C.text, 5.5, true);
  ({ ctx, W, H } = fitCanvas($('c0b')));
  m = plot(ctx, W, H, { x0: 1 - 3 * h, x1: 1 + 3 * h, y0: 2 - 3 * h, y1: 2 + 3 * h, left: 52, xticks: [{ v: 1 - 2 * h, l: '1−2h' }, { v: 1, l: '1' }, { v: 1 + 2 * h, l: '1+2h' }], yticks: [{ v: 2 - 2 * h, l: '2−2h' }, { v: 2, l: '2' }, { v: 2 + 2 * h, l: '2+2h' }], title: t('c0b') });
  // in the magnifier the curve is drawn from the cancelled form x + 1: at h = 1e-6 the literal formula's rounding
  // (≈ 1e-10) is invisible at this scale, and tests pin that the two agree to 1e-9 on the slider range
  curve(ctx, m, x => (Math.abs(x - 1) < h * 1e-6 ? null : x + 1), 1 - 3 * h, 1 + 3 * h, 60, () => C.text, 2);
  dot(ctx, m, 1 - h, fl, C.cyan, 5.5); dot(ctx, m, 1 + h, fr, C.orange, 5.5);
  dot(ctx, m, 1, 2, C.text, 6, true);
  const dec = digits0(k);
  $('tbl0').querySelector('tbody').innerHTML = [...s0.ks].sort((a, b) => a - b).map(q => {
    const hh = H0(q), a = M.hole(1 - hh), b = M.hole(1 + hh);
    return `<tr class="${q === k ? 'now' : ''}"><td>${small(hh)}</td><td>${small(Math.abs(b - 2))}</td><td>${fix(a, digits0(q))}</td><td>${fix(b, digits0(q))}</td></tr>`;
  }).join('');
  $('r0').textContent = t('s0readout', { h: small(h), fl: fix(fl, dec), fr: fix(fr, dec), d: small(Math.abs(fr - 2)) });
}

/* ---------- step 1: the game at a = 1 ---------- */
const s1 = { rounds: [], next: 0 };
const EPS_SEQ = [0.8, 0.3, 0.1, 0.6, 0.05, 0.45, 0.2, 1, 0.15];
const inBand = (y, L, e) => Math.abs(y - L) < e;
function gameGraph(ctx, W, H, a, e, d, opt) {
  const L = a * a;
  const m = plot(ctx, W, H, opt);
  hband(ctx, m, L - e, L + e); vband(ctx, m, a - d, a + d);
  curve(ctx, m, x => x * x, opt.x0, opt.x1, 300, () => 'rgba(232,237,244,0.55)', 1.4);
  curve(ctx, m, x => x * x, a - d, a + d, 400, (x, y) => (inBand(y, L, e) ? C.green : C.red), 3.2);
  dot(ctx, m, a, L, C.text, 4.5, true);
  return m;
}
function draw1() {
  const e = num('e1'), d = num('d1'), ds = M.bestDelta(1, e), w = M.worstSq(1, d), win = M.wins(1, e, d);
  $('e1v').textContent = trim(e, 2); $('d1v').textContent = trim(d, 2);
  let { ctx, W, H } = fitCanvas($('c1'));
  gameGraph(ctx, W, H, 1, e, d, { x0: 0.2, x1: 1.8, y0: -0.1, y1: 3.2, left: 34, xticks: ticks([0.5, 1, 1.5]), yticks: ticks([0, 1, 2, 3]), title: t('c1a') });
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const m = plot(ctx, W, H, { x0: 0, x1: 1.05, y0: 0, y1: 0.62, left: 40, xticks: ticks([0, 0.25, 0.5, 0.75, 1]), yticks: ticks([0, 0.2, 0.4, 0.6]), title: t('c1b') });
  curve(ctx, m, x => M.bestDelta(1, x), 0, 1.05, 200, () => C.orange, 2.4);
  s1.rounds.forEach(r => dot(ctx, m, r.e, r.d, r.win ? C.green : C.red, 4.5));
  clip(ctx, m); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(m.X(e), m.Y(d), 7, 0, 7); ctx.stroke(); ctx.restore();
  $('r1').textContent = t('s1readout', { e: trim(e, 2), d: trim(d, 2), w: trim(w, 4), verdict: t(win ? 's1win' : 's1lose'), ds: trim(ds, 4), n: s1.rounds.length });
}

/* ---------- step 2: δ* across positions ---------- */
function draw2() {
  const a = num('a2'), e = num('e2'), ds = M.bestDelta(a, e), ap = e / (2 * a);
  $('a2v').textContent = trim(a, 2); $('e2v').textContent = trim(e, 2);
  let { ctx, W, H } = fitCanvas($('c2'));
  gameGraph(ctx, W, H, a, e, ds, { x0: a - 0.8, x1: a + 0.8, y0: a * a - 1.5, y1: a * a + 1.5, left: 44, xticks: ticks([a - 0.5, a, a + 0.5]), yticks: ticks([a * a - 1, a * a, a * a + 1]), title: t('c2a') });
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const m = plot(ctx, W, H, { x0: 0, x1: 3.2, y0: 0, y1: 0.75, left: 40, xticks: ticks([0, 1, 2, 3]), yticks: ticks([0, 0.25, 0.5, 0.75]), title: t('c2b') });
  // the approximation ε ÷ (2a), dashed, as one path
  clip(ctx, m); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]); ctx.beginPath();
  for (let i = 0; i <= 300; i++) { const x = 0.05 + 3.15 * i / 300, Y = Math.max(m.P.t - 20, m.Y(e / (2 * x))); if (i) ctx.lineTo(m.X(x), Y); else ctx.moveTo(m.X(x), Y); }
  ctx.stroke(); ctx.restore();
  curve(ctx, m, x => M.bestDelta(x, e), 0, 3.2, 300, () => C.orange, 2.6);
  vline(ctx, m, a, 'rgba(232,237,244,0.35)', 1, [3, 4]);
  dot(ctx, m, a, ds, C.text, 5.5);
  $('r2').textContent = t('s2readout', { a: trim(a, 2), e: trim(e, 2), ds: trim(ds, 4), ap: trim(ap, 4), r: trim(ds / ap, 3) });
}

/* ---------- step 3: no limit ---------- */
const s3 = { kind: 'jump' };
const EPS3 = 0.5;
function draw3() {
  const L = num('L3'), d = Math.pow(10, -num('k3')), f = M.F3[s3.kind], kind = s3.kind;
  $('L3v').textContent = trim(L, 1); $('k3v').textContent = small(d);
  ['Jump', 'Osc', 'Blow', 'Damped'].forEach(k => $('k' + k).setAttribute('aria-pressed', String(k.toLowerCase() === kind)));
  const { ctx, W, H } = fitCanvas($('c3'));
  const sx = [-2, -1, 0, 1, 2], lab = ['−2δ', '−δ', '0', 'δ', '2δ'];
  const m = plot(ctx, W, H, { x0: -2.5 * d, x1: 2.5 * d, y0: -2.6, y1: 2.6, left: 34, xticks: sx.map((q, i) => ({ v: q * d, l: lab[i] })), yticks: ticks([-2, -1, 0, 1, 2]), title: t('c3a') });
  hband(ctx, m, L - EPS3, L + EPS3); vband(ctx, m, -d, d);
  const g = x => (x === 0 ? null : f(x));
  // two halves so the jump and the blow-up are not joined across 0
  const n = kind === 'osc' || kind === 'damped' ? 2400 : 400;
  curve(ctx, m, g, -2.5 * d, -1e-12 * d, n, () => C.text, 1.6);
  curve(ctx, m, g, 1e-12 * d, 2.5 * d, n, () => C.text, 1.6);
  if (kind === 'jump') { dot(ctx, m, 0, 1, C.text, 4, true); dot(ctx, m, 0, -1, C.text, 4, true); }
  const w = M.witness(kind, L, EPS3, d);
  if (w.x !== null) {
    const yy = Math.max(-2.5, Math.min(2.5, w.fx));
    vline(ctx, m, w.x, C.red, 1.4, [3, 3]);
    dot(ctx, m, w.x, yy, C.red, 6.5);
    $('r3').textContent = t('s3found', { L: trim(L, 1), d: small(d), x: sig(w.x), fx: sig(w.fx), err: sig(Math.abs(w.fx - L)) });
  } else $('r3').textContent = t(w.proof ? 's3proof' : 's3none', { L: trim(L, 1), d: small(d) });
}

/* ---------- step 4: ε–N ---------- */
const s4 = { kind: 'alt' };
function draw4() {
  const e = Math.pow(10, -num('k4')), S = M.SEQ[s4.kind], r = M.epsN(s4.kind, e), kind = s4.kind;
  $('k4v').textContent = small(e);
  ['Alt', 'Sin', 'Flip'].forEach(k => $('q' + k).setAttribute('aria-pressed', String(k.toLowerCase() === kind)));
  const { ctx, W, H } = fitCanvas($('c4'));
  const nMax = kind === 'flip' ? 60 : Math.max(40, Math.ceil(1.25 * r.N));
  const yr = kind === 'alt' ? [-1.3, 3.3] : kind === 'sin' ? [-0.9, 0.9] : [-1.5, 1.5];
  const step = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].find(s => (W - 60) / (nMax / s) >= 52) || 5000;
  const xt = []; for (let v = 0; v <= nMax; v += step) xt.push(v);
  const yt = kind === 'sin' ? [-0.5, 0, 0.5] : [-1, 0, 1, 2, 3].filter(v => v >= yr[0] && v <= yr[1]);
  const m = plot(ctx, W, H, { x0: 0, x1: nMax, y0: yr[0], y1: yr[1], left: 40, xticks: xt.map(v => ({ v, l: String(v) })), yticks: ticks(yt, 1), title: t('c4a') });
  hband(ctx, m, S.L - e, S.L + e);
  const rad = nMax <= 120 ? 3.4 : nMax <= 600 ? 2 : 1.3;
  clip(ctx, m);
  for (let n = 1; n <= nMax; n++) {
    const v = S.a(n), bad = Math.abs(v - S.L) >= e;
    ctx.fillStyle = bad ? C.red : C.cyan; ctx.beginPath(); ctx.arc(m.X(n), m.Y(Math.max(yr[0], Math.min(yr[1], v))), bad ? rad + 0.6 : rad, 0, 7); ctx.fill();
  }
  ctx.restore();
  if (r.N !== null) vline(ctx, m, r.N, C.orange, 2);
  if (kind === 'alt') $('r4').textContent = t('s4readAlt', { e: small(e), last: r.lastBad, N: r.N, b: sig(2 / e) });
  else if (kind === 'sin') $('r4').textContent = t('s4readSin', { e: small(e), N: r.N, last: r.lastBad, G: r.guaranteed });
  else $('r4').textContent = t('s4readFlip', { e: small(e) });
}

/* ---------- step 5: a rule is a proof ---------- */
const s5 = { rule: 'q4' };
const RULEKEY = { q4: ['rA', 'gA'], q5: ['rB', 'gB'], min: ['rC', 'gC'] };
function draw5() {
  const e = Math.pow(10, num('k5')), rule = s5.rule, c = M.ruleCheck(rule, e), a = M.A5;
  $('k5v').textContent = sig(e, 3);
  [['rA', 'q4'], ['rB', 'q5'], ['rC', 'min']].forEach(([id, r]) => $(id).setAttribute('aria-pressed', String(r === rule)));
  let { ctx, W, H } = fitCanvas($('c5'));
  const wx = 1.8 * Math.max(c.d, c.ds), wy = 1.8 * e;
  const m = plot(ctx, W, H, { x0: a - wx, x1: a + wx, y0: 4 - wy, y1: 4 + wy, left: 40, xticks: [{ v: a - c.d, l: '2−δ' }, { v: a, l: '2' }, { v: a + c.d, l: '2+δ' }], yticks: [{ v: 4 - e, l: '4−ε' }, { v: 4, l: '4' }, { v: 4 + e, l: '4+ε' }], title: t('c5a') });
  hband(ctx, m, 4 - e, 4 + e); vband(ctx, m, a - c.d, a + c.d);
  vline(ctx, m, a + c.ds, C.orange, 2); vline(ctx, m, a - c.ds, C.orange, 2);
  curve(ctx, m, x => x * x, a - wx, a + wx, 300, () => 'rgba(232,237,244,0.55)', 1.4);
  curve(ctx, m, x => x * x, a - c.d, a + c.d, 400, (x, y) => (inBand(y, 4, e) ? C.green : C.red), 3.2);
  if (!c.ok) dot(ctx, m, c.x, Math.min(4 + wy * 0.98, c.x * c.x), C.red, 6);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const lg = v => Math.log10(v);
  const m2 = plot(ctx, W, H, { x0: 0.01, x1: 100, y0: 0, y1: 3.2, xmap: lg, left: 34, xticks: [0.01, 0.1, 1, 10, 100].map(v => ({ v, l: String(v) })), yticks: ticks([0, 1, 2, 3]), title: t('c5b') });
  hline(ctx, m2, 1, C.text, 1.2, [5, 4]);
  const ratio = q => M.ruleCheck(rule, q).ratio;
  clip(ctx, m2); ctx.lineWidth = 2.6;
  let prev = null;
  for (let i = 0; i <= 400; i++) {
    const q = Math.pow(10, -2 + 4 * i / 400), r = ratio(q), p = [m2.X(q), m2.Y(Math.min(3.3, r))];
    if (prev) { ctx.strokeStyle = r > 1 + 1e-12 ? C.red : C.green; ctx.beginPath(); ctx.moveTo(...prev); ctx.lineTo(...p); ctx.stroke(); }
    prev = p;
  }
  ctx.restore();
  vline(ctx, m2, e, 'rgba(232,237,244,0.45)', 1, [3, 4]);
  dot(ctx, m2, e, Math.min(3.15, c.ratio), c.ok ? C.green : C.red, 5.5);
  const global = t(RULEKEY[rule][1]);
  if (c.ok) $('r5').textContent = t('s5ok', { e: sig(e, 3), d: sig(c.d), ds: sig(c.ds), global });
  else $('r5').textContent = t('s5bad', { e: sig(e, 3), d: sig(c.d), ds: sig(c.ds), x: sig(c.x, 6), err: sig(c.err), global });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('k0').addEventListener('input', () => { stopAnim('s0'); s0.ks.add(num('k0')); draw0(); });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.ks = new Set([num('k0')]); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.ks = new Set();
    animate('s0', 11 * 450, p => { const k = 1 + Math.min(10, Math.floor(p * 11)) * 0.5; for (let q = 1; q <= k + 1e-9; q += 0.5) s0.ks.add(q); $('k0').value = k; draw0(); });
  });

  ['e1', 'd1'].forEach(id => $(id).addEventListener('input', draw1));
  $('judge1').addEventListener('click', () => { const e = num('e1'), d = num('d1'); s1.rounds.push({ e, d, win: M.wins(1, e, d) }); if (s1.rounds.length > 60) s1.rounds.shift(); draw1(); });
  $('newEps1').addEventListener('click', () => { $('e1').value = EPS_SEQ[s1.next++ % EPS_SEQ.length]; draw1(); });
  $('clear1').addEventListener('click', () => { s1.rounds = []; draw1(); });

  ['a2', 'e2'].forEach(id => $(id).addEventListener('input', draw2));
  [['kJump', 'jump'], ['kOsc', 'osc'], ['kBlow', 'blow'], ['kDamped', 'damped']].forEach(([id, k]) => $(id).addEventListener('click', () => { s3.kind = k; draw3(); }));
  ['L3', 'k3'].forEach(id => $(id).addEventListener('input', draw3));
  [['qAlt', 'alt'], ['qSin', 'sin'], ['qFlip', 'flip']].forEach(([id, k]) => $(id).addEventListener('click', () => { s4.kind = k; draw4(); }));
  $('k4').addEventListener('input', draw4);
  [['rA', 'q4'], ['rB', 'q5'], ['rC', 'min']].forEach(([id, r]) => $(id).addEventListener('click', () => { s5.rule = r; draw5(); }));
  $('k5').addEventListener('input', draw5);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = () => { const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state === 'correct' ? 'correct' : 'wrong'); refresh(); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
