'use strict';
// Hashing lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bit, bucket, bar and readout comes from window.HASH_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and row labels in reserved columns; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.HASH_MODEL;
const t = (...a) => window.HASH_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', off: '#1f2c3b', ghost: '#8696aa', dim: '#3a4a5e' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const big = v => Math.round(v).toLocaleString('en-US');
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(c => SUP[c]).join('');
const pow10 = e => (e === 0 ? '1' : '10' + sup(e));
// Probability: ≈ 1 near certainty, a percentage down to 0.1%, then m × 10^e.
function fmtP(P) {
  if (P > 0.9995) return '1';
  if (P >= 1e-3) return fmt(P * 100, P >= 0.1 ? 1 : 2) + '%';
  if (P === 0) return '0';
  const e = Math.floor(Math.log10(P)), m = P / Math.pow(10, e);
  return `${fmt(m, 1)} × 10${sup(e)}`;
}

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 400, color = C.text, align = 'left', mono = false } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  const fam = mono ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : 'system-ui,sans-serif';
  do { ctx.font = `${weight} ${size}px ${fam}`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, Y, W) => fitText(ctx, text, 8, Y, W - 16, { weight: 600 });
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const ty = v => (o.yLog ? Math.log10(v) : v);
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (ty(v) - ty(o.yMin)) / (ty(o.yMax) - ty(o.yMin)) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  (o.yTicks || []).forEach(([v, lab]) => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 6, y(v) + 4); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  let lastR = -1e9; ctx.textAlign = 'center';
  (o.xTicks || []).forEach(([v, lab]) => {
    const X = x(v), w = ctx.measureText(lab).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    const L = Math.max(X - w / 2, 2), R = L + w;
    if (L > lastR + 6 && R <= W - 2) { ctx.fillText(lab, L + w / 2, P.b + 15); lastR = R; }
  });
  ctx.restore();
  if (o.title) title(ctx, o.title, P.t - 9, W);
  return { x, y, P };
}
function vdash(ctx, X, y0, y1, col = C.ghost) { ctx.save(); ctx.strokeStyle = col; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hdash(ctx, x0, x1, Y, col = C.ghost) { ctx.save(); ctx.strokeStyle = col; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); }

/* ---------- simple timed animation (reduced motion jumps to the end; hidden page finishes it) ---------- */
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

// One row of 32 bit cells, most significant bit first.
function bitRow(ctx, h, X, Y, w, hgt, { diff = 0, outline = null } = {}) {
  const cw = w / 32, b = M.bits(h), d = M.bits(diff);
  for (let i = 0; i < 32; i++) {
    ctx.fillStyle = d[i] ? C.orange : b[i] ? C.cyan : C.off;
    ctx.fillRect(X + i * cw + (cw > 4 ? 0.5 : 0), Y, Math.max(0.8, cw - (cw > 4 ? 1 : 0)), hgt);
  }
  if (outline) { ctx.save(); ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.strokeRect(X - 1.5, Y - 1.5, w + 3, hgt + 3); ctx.restore(); }
}
const byteLabel = b => (b >= 33 && b <= 126 ? `'${String.fromCharCode(b)}'` : b === 32 ? "' '" : '0x' + b.toString(16).padStart(2, '0'));

/* ---------- step 0: fingerprint ---------- */
const s0 = { text: 'hello world' };
function draw0() {
  const bytes = M.utf8(s0.text), { h, trace } = M.fnv1a(bytes, true), rows = [M.OFFSET, ...trace];
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0title'), 18, W);
  const top = 30, area = H - top - 10, rowH = Math.min(20, area / rows.length), showLab = rowH >= 11;
  ctx.font = '11px ui-monospace,Menlo,monospace';
  const labW = showLab ? Math.max(ctx.measureText("0x00").width, ctx.measureText(t('rowStart')).width) + 12 : 8;
  const hexW = showLab ? ctx.measureText('811c9dc5').width + 14 : 8;
  const gx = 8 + labW, gw = W - 8 - hexW - gx;
  rows.forEach((v, i) => {
    const Y = top + i * rowH, last = i === rows.length - 1;
    bitRow(ctx, v, gx, Y + (rowH > 6 ? 1 : 0), gw, Math.max(0.8, rowH - (rowH > 6 ? 3 : 0.4)), { outline: last && rowH >= 4 ? C.orange : null });
    if (showLab) {
      const fs = Math.min(11, rowH - 3);
      fitText(ctx, i === 0 ? t('rowStart') : byteLabel(bytes[i - 1]), 8, Y + rowH / 2 + fs / 2 - 1, labW - 8, { size: fs, color: C.muted, mono: true });
      fitText(ctx, M.hex(v), W - 8, Y + rowH / 2 + fs / 2 - 1, hexW - 8, { size: fs, color: last ? C.orange : C.muted, align: 'right', mono: true });
    }
  });
  const chars = [...s0.text].length;
  $('r0').textContent = bytes.length ? t('s0readout', { chars, bytes: bytes.length, hex: M.hex(h) }) : t('s0empty', { hex: M.hex(h) });
}

/* ---------- step 1: avalanche ---------- */
const s1 = { bytes: null, dF: [], dM: [], hF: 0, hM: 0, visited: new Set() };
function prep1() {
  s1.bytes = M.utf8(s0.text); s1.hF = M.fnv1a(s1.bytes); s1.hM = M.mixed(s1.bytes);
  const N = s1.bytes.length * 8;
  s1.dF = []; s1.dM = [];
  for (let i = 0; i < N; i++) { const b2 = M.flipBit(s1.bytes, i); s1.dF.push((s1.hF ^ M.fnv1a(b2)) >>> 0); s1.dM.push((s1.hM ^ M.mixed(b2)) >>> 0); }
  $('i1').max = Math.max(0, N - 1); if (num('i1') > N - 1) $('i1').value = 0;
  $('i1').disabled = N === 0; $('sweep1').disabled = N === 0;
  s1.visited = new Set(Array.from({ length: N }, (_, j) => j)); // start with every bit tried; the sweep replays it
}
function draw1() {
  const N = s1.dF.length, i = num('i1');
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1rows'), 18, W);
  if (!N) { $('i1v').textContent = '—'; $('r1').textContent = t('s0empty', { hex: M.hex(M.OFFSET) }); return; }
  $('i1v').textContent = `${i} / ${N - 1}`;
  ctx.font = '11px system-ui,sans-serif';
  const labW = Math.max(ctx.measureText('FNV-1a').width, ctx.measureText(t('rowMix')).width) + 12, gx = 8 + labW, gw = W - 16 - labW;
  const rh = 14, rowsY = [32, 50, 82, 100];
  const fF = s1.hF ^ s1.dF[i], fM = s1.hM ^ s1.dM[i];
  bitRow(ctx, s1.hF, gx, rowsY[0], gw, rh); bitRow(ctx, fF, gx, rowsY[1], gw, rh, { diff: s1.dF[i] });
  bitRow(ctx, s1.hM, gx, rowsY[2], gw, rh); bitRow(ctx, fM, gx, rowsY[3], gw, rh, { diff: s1.dM[i] });
  fitText(ctx, 'FNV-1a', 8, rowsY[0] + 24, labW - 8, { size: 11, color: C.pink, weight: 600 });
  fitText(ctx, t('rowMix'), 8, rowsY[2] + 24, labW - 8, { size: 11, color: C.green, weight: 600 });
  // per-output-bit flip rate over the visited input bits
  const vis = [...s1.visited], cF = new Array(32).fill(0), cM = new Array(32).fill(0);
  let sumF = 0, sumM = 0;
  vis.forEach(j => { for (let k = 0; k < 32; k++) { if ((s1.dF[j] >>> k) & 1) cF[31 - k]++; if ((s1.dM[j] >>> k) & 1) cM[31 - k]++; } sumF += M.popcount(s1.dF[j]); sumM += M.popcount(s1.dM[j]); });
  const ticks = [[0, '31'], [8, '23'], [16, '15'], [24, '7'], [31, '0']].map(([x, l]) => [x + 0.5, l]);
  const bars = (top, bottom, counts, col, ttl) => {
    const pl = panel(ctx, W, { top, bottom, xMin: 0, xMax: 32, yMin: 0, yMax: 1, yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']], xTicks: ticks, title: ttl, left: 34 });
    const bw = (pl.P.r - pl.P.l) / 32;
    counts.forEach((c, k) => { const f = vis.length ? c / vis.length : 0, Y = pl.y(f); ctx.fillStyle = col; ctx.fillRect(pl.x(k) + bw * 0.15, Y, bw * 0.7, pl.P.b - Y); });
    hdash(ctx, pl.P.l, pl.P.r, pl.y(0.5));
  };
  bars(164, 270, cF, C.pink, t('c1barsF'));
  bars(312, H - 26, cM, C.green, t('c1barsM'));
  const ch = (() => { const s = [...s0.text]; let pos = 0; for (const c of s) { const n = M.utf8(c).length; if ((i >> 3) < pos + n) return `'${c}'`; pos += n; } return ''; })();
  const low = vis.length ? 100 * cF[31] / vis.length : 0;
  $('r1').textContent = t('s1readout', { byte: i >> 3, ch, bit: i & 7, a: M.popcount(s1.dF[i]), b: M.popcount(s1.dM[i]), v: vis.length, N, ma: fmt(vis.length ? sumF / vis.length : 0, 2), mb: fmt(vis.length ? sumM / vis.length : 0, 2), low: fmt(low, 1) });
}

/* ---------- step 2: hash table ---------- */
const s2 = { kind: 'mixed' };
function draw2() {
  const n = num('n2'), m = num('m2'), T = M.table(n, m, s2.kind);
  $('n2v').textContent = String(n); $('m2v').textContent = String(m);
  $('good2').setAttribute('aria-pressed', s2.kind === 'mixed'); $('bad2').setAttribute('aria-pressed', s2.kind === 'sum');
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2buckets'), 18, W);
  const top = 30, bottom = 220, cw = (W - 16) / m, sq = Math.min(cw - 1, 12, (bottom - top) / Math.max(T.longest, 10));
  T.lens.forEach((len, b) => {
    const X = 8 + b * cw + (cw - sq) / 2;
    ctx.fillStyle = C.off; ctx.fillRect(8 + b * cw + 0.5, bottom + 2, Math.max(1, cw - 1), 3);
    for (let j = 0; j < len; j++) { ctx.fillStyle = len === T.longest ? C.orange : C.cyan; ctx.fillRect(X, bottom - (j + 1) * sq + 0.5, sq, Math.max(0.6, sq - 1)); }
  });
  const K = Math.max(T.longest, Math.ceil(T.alpha + 3 * Math.sqrt(T.alpha) + 2));
  const exp = M.poissonBins(n, m, K), yMax = Math.max(4, Math.ceil(Math.max(...T.hist, ...exp) * 1.15));
  const xt = []; const stepK = K <= 12 ? 1 : K <= 30 ? 5 : 10; for (let k = 0; k <= K; k += stepK) xt.push([k, String(k)]);
  const pl = panel(ctx, W, { top: 266, bottom: H - 26, xMin: -0.6, xMax: K + 0.6, yMin: 0, yMax, yTicks: [[0, '0'], [Math.round(yMax / 2), String(Math.round(yMax / 2))], [yMax, String(yMax)]], xTicks: xt, title: t('c2hist'), left: 34 });
  const bw = Math.min(26, (pl.P.r - pl.P.l) / (K + 1.2) * 0.7);
  T.hist.forEach((c, k) => { const Y = pl.y(c); ctx.fillStyle = k === T.longest ? C.orange : C.cyan; ctx.fillRect(pl.x(k) - bw / 2, Y, bw, pl.P.b - Y); });
  exp.forEach((v, k) => { ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pl.x(k), pl.y(Math.min(v, yMax)), 4, 0, 7); ctx.stroke(); dot(ctx, pl.x(k), pl.y(Math.min(v, yMax)), 3.5, C.text); });
  $('r2').textContent = t('s2readout', { name: t(s2.kind === 'mixed' ? 'goodHash' : 'badHash'), a: fmt(T.alpha, 2), e: T.empty, ee: fmt(M.expectEmpty(n, m), 1), L: T.longest, p: fmt(T.probes, 2), pe: fmt(n ? M.expectProbes(n, m) : 0, 2) });
}

/* ---------- step 3: birthday clashes ---------- */
const s3 = { trials: [], next: 0 };
function cdfTable(d, kmax) { const F = [0]; let q = 1; for (let k = 1; k <= kmax; k++) { q *= 1 - (k - 1) / d; F.push(1 - q); } return F; }
function draw3() {
  const b = num('b3'), d = Math.pow(2, b), sq = Math.sqrt(d), kmax = Math.ceil(4 * sq), F = cdfTable(d, kmax), k50 = M.k50(d);
  $('b3v').textContent = `${b} (d = ${big(d)})`;
  const { ctx, W, H } = fitCanvas($('c3'));
  const T = s3.trials.length, bins = 40, bwK = Math.max(1, Math.ceil(kmax / bins)), nb = Math.ceil(kmax / bwK);
  const counts = new Array(nb).fill(0); s3.trials.forEach(v => { counts[Math.min(nb - 1, Math.floor((Math.min(v, kmax) - 1) / bwK))]++; });
  const expC = Array.from({ length: nb }, (_, i) => T * (F[Math.min(kmax, (i + 1) * bwK)] - F[Math.min(kmax, i * bwK)]));
  const yMax = Math.max(5, Math.ceil(Math.max(...counts, ...expC) * 1.15));
  const kt = [0, Math.round(kmax / 4), Math.round(kmax / 2), Math.round(3 * kmax / 4), kmax].map(v => [v, String(v)]);
  const A = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: kmax, yMin: 0, yMax, yTicks: [[0, '0'], [yMax, String(yMax)]], xTicks: kt, title: t('c3hist'), left: 34 });
  counts.forEach((c, i) => { const X0 = A.x(i * bwK), X1 = A.x((i + 1) * bwK), Y = A.y(c); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.85; ctx.fillRect(X0 + 0.5, Y, Math.max(1, X1 - X0 - 1), A.P.b - Y); ctx.globalAlpha = 1; });
  if (T) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.beginPath(); expC.forEach((v, i) => { const X0 = A.x(i * bwK), X1 = A.x(Math.min(kmax, (i + 1) * bwK)), Y = A.y(v); if (!i) ctx.moveTo(X0, Y); else ctx.lineTo(X0, Y); ctx.lineTo(X1, Y); }); ctx.stroke(); ctx.restore(); }
  const B = panel(ctx, W, { top: 244, bottom: H - 26, xMin: 0, xMax: kmax, yMin: 0, yMax: 1, yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']], xTicks: kt, title: t('c3cdf'), left: 34 });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); F.forEach((v, k) => { if (!k) ctx.moveTo(B.x(k), B.y(v)); else ctx.lineTo(B.x(k), B.y(v)); }); ctx.stroke(); ctx.restore();
  if (T) {
    const sorted = s3.trials.slice().sort((a, c) => a - c);
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0));
    let j = 0; for (let k = 1; k <= kmax; k++) { while (j < T && sorted[j] <= k) j++; ctx.lineTo(B.x(k), B.y(j / T)); }
    ctx.stroke(); ctx.restore();
  }
  [A, B].forEach(pl => { vdash(ctx, pl.x(sq), pl.P.t, pl.P.b); vdash(ctx, pl.x(k50), pl.P.t, pl.P.b); });
  let med = t('s3none');
  if (T) { const s = s3.trials.slice().sort((a, c) => a - c); med = t('s3med', { m: T % 2 ? s[(T - 1) / 2] : fmt((s[T / 2 - 1] + s[T / 2]) / 2, 1) }); }
  $('r3').textContent = t('s3readout', { b, d: big(d), k50, approx: fmt(1.1774 * sq, 1), half: big(d / 2), sq: fmt(sq, 1), psq: fmt(100 * M.pCollide(Math.round(sq), d), 1), T, med });
}
function run3() {
  const b = num('b3'), start = s3.trials.length, goal = 100;
  animate('s3', 2000, p => { const want = start + Math.round(p * goal); while (s3.trials.length < want) s3.trials.push(M.firstCollision(s3.next++, b)); draw3(); });
}

/* ---------- step 4: how many bits ---------- */
function draw4() {
  const x = num('n4'), y = num('p4'), N = Math.pow(10, x), p = Math.pow(10, y);
  $('n4v').textContent = `${x} (N = ${pow10(x)})`; $('p4v').textContent = `${y} (p = ${pow10(y)})`;
  const { ctx, W, H } = fitCanvas($('c4'));
  const yMin = 1e-40, pl = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 16, xMax: 256, yMin, yMax: 1, yLog: true, yTicks: [0, -10, -20, -30, -40].map(e => [Math.pow(10, e), pow10(e)]), xTicks: [16, 32, 64, 128, 192, 256].map(v => [v, String(v)]), title: t('c4title'), left: 48 });
  ctx.save(); ctx.beginPath(); ctx.rect(pl.P.l, pl.P.t - 2, pl.P.r - pl.P.l, pl.P.b - pl.P.t + 4); ctx.clip();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let b = 16; b <= 256; b += 0.5) { const P = Math.max(yMin / 10, M.pAny(N, b)), X = pl.x(b), Y = pl.y(P); if (b === 16) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  hdash(ctx, pl.P.l, pl.P.r, pl.y(p));
  [32, 64, 128, 256].forEach(b => { const P = M.pAny(N, b); if (P >= yMin) dot(ctx, pl.x(b), pl.y(P), 5, C.text); else { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(pl.x(b), pl.P.b - 5, 4, 0, 7); ctx.stroke(); ctx.restore(); } });
  const need = M.bitsNeeded(N, p);
  vdash(ctx, pl.x(need), pl.P.t, pl.P.b, C.cyan);
  $('r4').textContent = t('s4readout', { N: pow10(x), p32: fmtP(M.pAny(N, 32)), p64: fmtP(M.pAny(N, 64)), p128: fmtP(M.pAny(N, 128)), p256: fmtP(M.pAny(N, 256)), pt: pow10(y), need });
}

function buildPresets() {
  $('presets0').innerHTML = M.SAMPLES.map((s, i) => `<button class="btn preset" type="button" data-step="0" data-sample="${i}"></button>`).join('');
  $('presets0').querySelectorAll('[data-sample]').forEach(b => { b.textContent = M.SAMPLES[Number(b.dataset.sample)]; b.addEventListener('click', () => { $('txt0').value = M.SAMPLES[Number(b.dataset.sample)]; onText(); }); });
}
function onText() { s0.text = $('txt0').value; stopAnim('s1'); prep1(); draw0(); draw1(); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  buildPresets();
  s0.text = $('txt0').value;
  prep1();
  for (let j = 0; j < 100; j++) s3.trials.push(M.firstCollision(s3.next++, num('b3'))); // open with 100 trials on screen
  $('txt0').addEventListener('input', onText);
  $('i1').addEventListener('input', () => { stopAnim('s1'); s1.visited.add(num('i1')); draw1(); });
  $('sweep1').addEventListener('click', () => {
    const N = s1.dF.length; if (!N) return;
    s1.visited.clear();
    animate('s1', Math.min(6000, 60 * N), p => { const upto = Math.min(N - 1, Math.floor(p * N)); for (let j = 0; j <= upto; j++) s1.visited.add(j); $('i1').value = upto; draw1(); });
  });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.visited = new Set([num('i1')]); draw1(); });
  ['n2', 'm2'].forEach(id => $(id).addEventListener('input', draw2));
  $('good2').addEventListener('click', () => { s2.kind = 'mixed'; draw2(); });
  $('bad2').addEventListener('click', () => { s2.kind = 'sum'; draw2(); });
  $('b3').addEventListener('input', () => { stopAnim('s3'); s3.trials = []; draw3(); });
  $('run3').addEventListener('click', run3);
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.trials = []; draw3(); });
  ['n4', 'p4'].forEach(id => $(id).addEventListener('input', draw4));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshHashing = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
