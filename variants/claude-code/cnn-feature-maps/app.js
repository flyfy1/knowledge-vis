'use strict';
// CNN feature-map lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every pixel, map, weight and readout comes from window.CNN_MODEL (model.js). Panels sit in a row on wide
// screens and stack vertically on narrow ones (the canvas grows to fit); titles get their own one- or two-line row.
(function () {

const $ = id => document.getElementById(id);
const M = window.CNN_MODEL;
const t = (...a) => window.CNN_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', blue: '#5b8def', green: '#7ee2a8', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', zero: '#1a2533', unseen: '#111922', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (so 90 stays 90).
// Kernel cells: ordinary numbers up to 999, then a short power-of-ten form (a diverged kernel can reach 10^5 and beyond).
const fmtCell = v => { if (!isFinite(v)) return v > 0 ? '∞' : '−∞'; if (Math.abs(v) < 999.5) return fmt(v, 2); return Math.abs(v).toExponential(0).replace('e+', 'e').replace(/^/, v < 0 ? '−' : ''); };
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = v => { if (!isFinite(v)) return '∞'; if (v === 0) return '0'; if (v >= 1e-3 && v < 1e4) return fmt(v, v < 0.01 ? 5 : v < 1 ? 4 : 3); const e = Math.floor(Math.log10(Math.abs(v))); return `${fmt(v / Math.pow(10, e), 2)} × 10${String(e).split('').map(c => SUP[c]).join('')}`; };

function fitCanvas(canvas, height) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
const widthOf = canvas => Math.max(240, canvas.clientWidth || 600);
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 400, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Title in a 34 px band: one line at 12 px if it fits, otherwise two lines at ≤ 11 px (break at a space, or anywhere for CJK).
const TITLE_H = 34;
function title(ctx, text, X, Y, maxW) {
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif';
  if (ctx.measureText(text).width <= maxW) { ctx.restore(); fitText(ctx, text, X, Y + 18, maxW, { weight: 600 }); return; }
  ctx.restore();
  const chars = [...text]; let best = Math.ceil(chars.length / 2), bestScore = Infinity;
  for (let i = 1; i < chars.length; i++) { const sp = chars[i - 1] === ' ' || chars[i] === ' '; const ascii = /[A-Za-z0-9]/.test(chars[i - 1]) && /[A-Za-z0-9]/.test(chars[i]); if (ascii && !sp) continue; const score = Math.abs(i - chars.length / 2) - (sp ? 3 : 0); if (score < bestScore) { bestScore = score; best = i; } }
  const a = chars.slice(0, best).join('').trim(), b = chars.slice(best).join('').trim();
  fitText(ctx, a, X, Y + 12, maxW, { size: 11, weight: 600 }); fitText(ctx, b, X, Y + 27, maxW, { size: 11, weight: 600 });
}
// Lay out square panels: in one row when there is room, otherwise stacked. specs: [{rel}] (rel = size relative to a full panel).
function layout(W, specs, maxS = 280) {
  const gap = 16, n = specs.length, sumRel = specs.reduce((s, q) => s + q.rel, 0);
  const rowS = Math.min(maxS, (W - 16 - gap * (n - 1)) / sumRel);
  if (rowS >= 150) {
    const used = rowS * sumRel + gap * (n - 1); let x = (W - used) / 2;
    const boxes = specs.map(q => { const s = rowS * q.rel, b = { x, y: 6, s, w: s }; x += s + gap; return b; });
    const H = 6 + TITLE_H + rowS + 10;
    boxes.forEach(b => { b.gy = 6 + TITLE_H + (rowS - b.s) / 2; });
    return { boxes, H };
  }
  const full = Math.min(W - 16, 300); let y = 6;
  const boxes = specs.map(q => { const s = full * q.rel, b = { x: (W - s) / 2, y, s, w: Math.max(s, Math.min(W - 16, full)), gy: y + TITLE_H }; b.tx = Math.min(b.x, (W - b.w) / 2); y += TITLE_H + s + 14; return b; });
  return { boxes, H: y };
}
const titleBox = (ctx, b, text) => title(ctx, text, b.tx !== undefined ? b.tx : b.x, b.y, b.tx !== undefined ? b.w : b.s);

const lerp = (a, b, f) => Math.round(a + (b - a) * f);
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const Z = hexRGB(C.zero), O = hexRGB(C.orange), B = hexRGB(C.blue);
function signedColor(v, scale) { const f = Math.min(1, Math.abs(v) / scale), T = v >= 0 ? O : B; return `rgb(${lerp(Z[0], T[0], f)},${lerp(Z[1], T[1], f)},${lerp(Z[2], T[2], f)})`; }
function drawGray(ctx, img, x, y, s) { const n = img.length, c = s / n; img.forEach((r, i) => r.forEach((v, j) => { const g = Math.round(20 + 225 * v); ctx.fillStyle = `rgb(${g},${g},${g})`; ctx.fillRect(x + j * c, y + i * c, c + 0.4, c + 0.4); })); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(x, y, s, s); }
function drawMap(ctx, m, x, y, s, scale, seen) { const n = m.length, c = s / n; m.forEach((r, i) => r.forEach((v, j) => { ctx.fillStyle = seen && !seen(i, j) ? C.unseen : signedColor(v, scale); ctx.fillRect(x + j * c, y + i * c, c + 0.4, c + 0.4); })); ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.6; for (let i = 1; i < n; i++) { ctx.beginPath(); ctx.moveTo(x + i * c, y); ctx.lineTo(x + i * c, y + s); ctx.moveTo(x, y + i * c); ctx.lineTo(x + s, y + i * c); ctx.stroke(); } ctx.restore(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(x, y, s, s); }
function drawKernel(ctx, k, x, y, s) {
  const c = s / 3, scale = Math.max(1e-9, ...k.flat().map(Math.abs));
  k.forEach((r, a) => r.forEach((v, b) => {
    ctx.fillStyle = signedColor(v, scale); ctx.fillRect(x + b * c + 1, y + a * c + 1, c - 2, c - 2);
    fitText(ctx, fmtCell(v), x + b * c + c / 2, y + a * c + c / 2 + 5, c - 8, { size: Math.min(15, c / 3), weight: 600, align: 'center', color: Math.abs(v) / scale > 0.6 ? '#0b1118' : C.text });
  }));
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(x, y, s, s);
}
function ring(ctx, x, y, w, h, col = C.cyan, lw = 2.5) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); ctx.restore(); }

/* ---------- timed animation (reduced motion jumps to the end; hidden page finishes it) ---------- */
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

const IMG_LABEL = { square: 'imgSquare', disc: 'imgDisc', diagonal: 'imgDiagonal', letterT: 'imgT' };
function imageButtons(boxId, state, redraw, keys = M.IMAGE_KEYS) {
  $(boxId).innerHTML = keys.map(k => `<button class="btn preset" type="button" data-img="${k}"></button>`).join('');
  $(boxId).querySelectorAll('[data-img]').forEach(b => b.addEventListener('click', () => { state.img = b.dataset.img; redraw(); }));
}
function syncButtons(boxId, attr, current) { $(boxId).querySelectorAll(`[${attr}]`).forEach(b => { const key = b.getAttribute(attr); b.setAttribute('aria-pressed', key === current ? 'true' : 'false'); }); }

/* ---------- step 0: one pixel ---------- */
const s0 = { seen: new Set(['3,2']) };
const K0 = M.edgeAt(0);
const MAP0 = M.conv(M.IMAGES.square, K0);
function draw0() {
  const i = num('i0'), j = num('j0'), img = M.IMAGES.square;
  $('i0v').textContent = String(i); $('j0v').textContent = String(j);
  const L = layout(widthOf($('c0')), [{ rel: 1 }, { rel: 0.55 }, { rel: 1 }]);
  const { ctx } = fitCanvas($('c0'), L.H);
  const [A, Kb, Bx] = L.boxes;
  titleBox(ctx, A, t('cInput')); titleBox(ctx, Kb, t('cKernel')); titleBox(ctx, Bx, t('c0map'));
  drawGray(ctx, img, A.x, A.gy, A.s);
  const c = A.s / 14; ring(ctx, A.x + j * c, A.gy + i * c, 3 * c, 3 * c);
  drawKernel(ctx, K0, Kb.x, Kb.gy, Kb.s);
  drawMap(ctx, MAP0, Bx.x, Bx.gy, Bx.s, M.maxAbs(MAP0), (a, b) => s0.seen.has(a + ',' + b));
  const co = Bx.s / 12; ring(ctx, Bx.x + j * co, Bx.gy + i * co, co, co);
  const pr = M.products(img, K0, i, j);
  const terms = pr.terms.map(q => `${fmt(q.w)}×${fmt(q.x)}`).join(' + ');
  $('r0').textContent = t('s0readout', { r0: i, r1: i + 2, c0: j, c1: j + 2, terms, sum: fmt(pr.sum), v: s0.seen.size });
}

/* ---------- step 1: swap kernels ---------- */
const s1 = { img: 'square', ker: 'edge' };
const KER_LABEL = { edge: 'kerEdge', blur: 'kerBlur', sharpen: 'kerSharpen', identity: 'kerIdentity' };
const kernelOf = (name, deg) => (name === 'edge' ? M.edgeAt(deg) : M.KERNELS[name]());
function draw1() {
  const deg = num('a1'), k = kernelOf(s1.ker, deg), img = M.IMAGES[s1.img], f = M.conv(img, k);
  $('a1v').textContent = `${deg}°`; $('a1').disabled = s1.ker !== 'edge';
  syncButtons('img1', 'data-img', s1.img); syncButtons('ker1', 'data-ker', s1.ker);
  const L = layout(widthOf($('c1')), [{ rel: 1 }, { rel: 0.55 }, { rel: 1 }]);
  const { ctx } = fitCanvas($('c1'), L.H);
  const [A, Kb, Bx] = L.boxes;
  titleBox(ctx, A, t('cInput')); titleBox(ctx, Kb, t('cKernel')); titleBox(ctx, Bx, t('c1map'));
  drawGray(ctx, img, A.x, A.gy, A.s); drawKernel(ctx, k, Kb.x, Kb.gy, Kb.s); drawMap(ctx, f, Bx.x, Bx.gy, Bx.s, M.maxAbs(f));
  const flat = f.flat(), mx = Math.max(...flat), mn = Math.min(...flat), am = M.argmax(f), half = M.maxAbs(f) / 2;
  const strong = Math.max(...flat.map(Math.abs)) < 1e-9 ? 0 : flat.filter(v => Math.abs(v) > half).length;
  $('r1').textContent = t('s1readout', { ker: t(KER_LABEL[s1.ker]), sum: fmt(k.flat().reduce((a, b) => a + b, 0), 2), max: fmt(mx), at: t('rc', { i: am.i, j: am.j }), min: fmt(mn), strong });
}

/* ---------- step 2: size ---------- */
function draw2() {
  const p = num('p2'), s = num('s2'), n = 14, o = M.outSize(n, 3, p, s), f = M.conv(M.IMAGES.square, K0, p, s);
  $('p2v').textContent = String(p); $('s2v').textContent = String(s);
  const L = layout(widthOf($('c2')), [{ rel: 1 }, { rel: 1 }]);
  const { ctx } = fitCanvas($('c2'), L.H);
  const [A, Bx] = L.boxes;
  titleBox(ctx, A, t('c2in')); titleBox(ctx, Bx, t('c2out', { o }));
  const tot = n + 2 * p, c = A.s / tot;
  for (let r = 0; r < tot; r++) for (let q = 0; q < tot; q++) {
    const ir = r - p, iq = q - p, inside = ir >= 0 && ir < n && iq >= 0 && iq < n;
    if (inside) { const g = Math.round(20 + 225 * M.IMAGES.square[ir][iq]); ctx.fillStyle = `rgb(${g},${g},${g})`; } else ctx.fillStyle = C.zero;
    ctx.fillRect(A.x + q * c, A.gy + r * c, c + 0.4, c + 0.4);
  }
  if (p) { ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.strokeRect(A.x + p * c, A.gy + p * c, n * c, n * c); ctx.restore(); }
  ctx.strokeStyle = C.axis; ctx.strokeRect(A.x, A.gy, A.s, A.s);
  for (let a = 0; a < o; a++) for (let b = 0; b < o; b++) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(A.x + (b * s + 1.5) * c, A.gy + (a * s + 1.5) * c, Math.max(1.6, c * 0.18), 0, 7); ctx.fill(); }
  ring(ctx, A.x, A.gy, 3 * c, 3 * c);
  const side = Bx.s * o / Math.max(o, 16), off = (Bx.s - side) / 2;
  drawMap(ctx, f, Bx.x + off, Bx.gy + off, side, M.maxAbs(f));
  const reach = (o - 1) * s + 3, m = tot - reach;
  $('r2').textContent = t('s2readout', { p, s, o, cells: o * o, mults: 9 * o * o, miss: m > 0 ? t('s2miss', { m }) : '' });
}

/* ---------- step 3: ReLU and pooling ---------- */
const s3 = { img: 'disc', relu: true };
function draw3() {
  const q = num('q3'), raw = M.conv(M.IMAGES[s3.img], K0), feat = s3.relu ? M.relu(raw) : raw, pool = q === 1 ? feat : M.maxpool(feat, q), o = pool.length;
  $('q3v').textContent = q === 1 ? '1' : `${q} (${q}×${q})`;
  syncButtons('img3', 'data-img', s3.img); $('relu3').setAttribute('aria-pressed', s3.relu ? 'true' : 'false');
  const L = layout(widthOf($('c3')), [{ rel: 1 }, { rel: 1 }]);
  const { ctx } = fitCanvas($('c3'), L.H);
  const [A, Bx] = L.boxes;
  titleBox(ctx, A, t(s3.relu ? 'c3featRelu' : 'c3feat')); titleBox(ctx, Bx, t('c3pool', { o }));
  const scale = M.maxAbs(raw);
  drawMap(ctx, feat, A.x, A.gy, A.s, scale);
  if (q > 1) { const c = A.s / 12; ctx.save(); ctx.strokeStyle = 'rgba(103,215,249,0.55)'; ctx.lineWidth = 1.2; for (let a = 0; a < o; a++) for (let b = 0; b < o; b++) ctx.strokeRect(A.x + b * q * c, A.gy + a * q * c, q * c, q * c); ctx.restore(); ring(ctx, A.x, A.gy, q * c, q * c); }
  drawMap(ctx, pool, Bx.x, Bx.gy, Bx.s, scale);
  if (q > 1) ring(ctx, Bx.x, Bx.gy, Bx.s / o, Bx.s / o);
  const neg = raw.flat().filter(v => v < -1e-9).length, pos = raw.flat().filter(v => v > 1e-9).length;
  $('r3').textContent = t('s3readout', { state: t(s3.relu ? 'on' : 'off'), neg, gone: s3.relu && neg ? t('s3gone') : '', pos, q, o, cout: o * o, mx: fmt(Math.max(...pool.flat())) });
}

/* ---------- step 4: second layer ---------- */
const s4 = { img: 'square' };
function draw4() {
  const c = num('c4s'), q = M.corner(s4.img, c), R = M.cornerRange(s4.img);
  $('c4v').textContent = fmt(c, 1);
  syncButtons('img4', 'data-img', s4.img);
  const L = layout(widthOf($('c4')), [{ rel: 1 }, { rel: 1 }, { rel: 1 }]);
  const { ctx } = fitCanvas($('c4'), L.H);
  const [A, Bx, Cx] = L.boxes;
  titleBox(ctx, A, t('c4V')); titleBox(ctx, Bx, t('c4H')); titleBox(ctx, Cx, t('c4out'));
  drawMap(ctx, q.V, A.x, A.gy, A.s, 1); drawMap(ctx, q.H, Bx.x, Bx.gy, Bx.s, 1);
  drawMap(ctx, q.out, Cx.x, Cx.gy, Cx.s, Math.max(0.25, Math.max(...q.out.flat())));
  const cc = Cx.s / 12; [A, Bx, Cx].forEach(b => ring(ctx, b.x + R.at[1] * cc, b.gy + R.at[0] * cc, cc, cc, C.cyan, 2));
  const where = q.on.length === 1 ? t('s4where', { at: t('rc', { i: q.on[0][0], j: q.on[0][1] }) }) : '';
  $('r4').textContent = t('s4readout', { c: fmt(c, 1), n: q.on.length, where, hi: fmt(R.hi, 2), at: t('rc', { i: R.at[0], j: R.at[1] }), lo: fmt(R.lo, 2) });
}

/* ---------- step 5: learn the kernel ---------- */
const s5 = { k: M.zeroKernel(), losses: [], diverged: false };
const TARGET_MAP = M.target();
function reset5() { stopAnim('s5'); s5.k = M.zeroKernel(); s5.losses = [M.lossGrad(s5.k).loss]; s5.diverged = false; }
function trainSteps(n) {
  const lr = num('lr5');
  for (let q = 0; q < n && !s5.diverged; q++) { s5.k = M.step(s5.k, lr); const l = M.lossGrad(s5.k).loss; s5.losses.push(l); if (!(l < 1e8)) s5.diverged = true; }
}
function draw5() {
  const lr = num('lr5'); $('lr5v').textContent = fmt(lr, 2);
  const W = widthOf($('c5'));
  const L = layout(W, [{ rel: 0.75 }, { rel: 0.75 }, { rel: 1 }], 240);
  const lossH = 190, H = L.H + lossH + 10;
  const { ctx } = fitCanvas($('c5'), H);
  const [A, Bx, Cx] = L.boxes;
  titleBox(ctx, A, t('c5learn')); titleBox(ctx, Bx, t('c5target')); titleBox(ctx, Cx, t('c5out'));
  drawKernel(ctx, s5.k, A.x, A.gy, A.s); drawKernel(ctx, M.TARGET_KERNEL, Bx.x, Bx.gy, Bx.s);
  const y = M.conv(M.TRAIN, s5.k);
  drawMap(ctx, y, Cx.x, Cx.gy, Cx.s, M.maxAbs(TARGET_MAP));
  // loss history
  const top = L.H + 30, bot = H - 26, left = 52, right = W - 14;
  title(ctx, t('c5loss'), 8, L.H, W - 16);
  const ls = s5.losses.map(v => Math.min(1e8, Math.max(1e-10, v)));
  const lo = Math.floor(Math.log10(Math.min(...ls))), hi = Math.max(lo + 1, Math.ceil(Math.log10(Math.max(...ls))));
  const T = Math.max(100, ls.length - 1), X = v => left + v / T * (right - left), Y = v => bot - (Math.log10(v) - lo) / (hi - lo) * (bot - top);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  const stepE = Math.max(1, Math.ceil((hi - lo) / 4));
  for (let e = lo; e <= hi; e += stepE) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(left, Y(Math.pow(10, e))); ctx.lineTo(right, Y(Math.pow(10, e))); ctx.stroke(); ctx.fillText(e === 0 ? '1' : '10' + String(e).split('').map(ch => SUP[ch]).join(''), left - 6, Y(Math.pow(10, e)) + 4); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bot); ctx.lineTo(right, bot); ctx.stroke();
  ctx.textAlign = 'center'; let lastR = -1e9; const stepX = T <= 100 ? 25 : T <= 400 ? 100 : T <= 1000 ? 250 : 500;
  for (let v = 0; v <= T; v += stepX) { const w = ctx.measureText(String(v)).width, Lx = X(v) - w / 2; if (Lx > lastR + 6 && Lx + w <= W - 2) { ctx.fillText(String(v), X(v), bot + 15); lastR = Lx + w; } }
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ls.forEach((v, i) => { if (!i) ctx.moveTo(X(i), Y(v)); else ctx.lineTo(X(i), Y(v)); }); ctx.stroke();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X(ls.length - 1), Y(ls[ls.length - 1]), 4.5, 0, 7); ctx.fill(); ctx.restore();
  const tSteps = s5.losses.length - 1, loss = s5.losses[tSteps];
  $('r5').textContent = s5.diverged || loss > s5.losses[0] * 10
    ? t('s5div', { t: tSteps, lr: fmt(lr, 2), loss: sci(loss) })
    : t('s5readout', { t: tSteps, lr: fmt(lr, 2), loss: sci(loss), l0: sci(s5.losses[0]), err: sci(M.maxErr(s5.k)) });
  ['t1', 't10', 't100'].forEach(id => { $(id).disabled = s5.diverged; });
}

function buildButtons() {
  imageButtons('img1', s1, draw1); imageButtons('img3', s3, draw3); imageButtons('img4', s4, draw4, ['square', 'disc', 'letterT']);
  $('ker1').innerHTML = Object.keys(KER_LABEL).map(k => `<button class="btn preset" type="button" data-ker="${k}"></button>`).join('');
  $('ker1').querySelectorAll('[data-ker]').forEach(b => b.addEventListener('click', () => { s1.ker = b.dataset.ker; draw1(); }));
}
function labelButtons() {
  document.querySelectorAll('[data-img]').forEach(b => { b.textContent = t(IMG_LABEL[b.dataset.img]); });
  document.querySelectorAll('[data-ker]').forEach(b => { b.textContent = t(KER_LABEL[b.dataset.ker]); });
}
function redraw() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }
function refresh() { labelButtons(); redraw(); }

function setup() {
  buildButtons(); reset5();
  ['i0', 'j0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); s0.seen.add(num('i0') + ',' + num('j0')); draw0(); }));
  $('scan0').addEventListener('click', () => {
    s0.seen.clear();
    animate('s0', 7000, p => { const upto = Math.min(143, Math.floor(p * 144)); for (let q = 0; q <= upto; q++) s0.seen.add(Math.floor(q / 12) + ',' + (q % 12)); $('i0').value = Math.floor(upto / 12); $('j0').value = upto % 12; draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.seen = new Set([num('i0') + ',' + num('j0')]); draw0(); });
  $('a1').addEventListener('input', draw1);
  ['p2', 's2'].forEach(id => $(id).addEventListener('input', draw2));
  $('q3').addEventListener('input', draw3);
  $('relu3').addEventListener('click', () => { s3.relu = !s3.relu; draw3(); });
  $('c4s').addEventListener('input', draw4);
  $('lr5').addEventListener('input', draw5);
  $('t1').addEventListener('click', () => { stopAnim('s5'); trainSteps(1); draw5(); });
  $('t10').addEventListener('click', () => { stopAnim('s5'); trainSteps(10); draw5(); });
  $('t100').addEventListener('click', () => { const goal = s5.losses.length - 1 + 100; animate('s5', 2500, p => { const want = Math.round(goal - 100 + p * 100); trainSteps(Math.max(0, want - (s5.losses.length - 1))); draw5(); }); });
  $('reset5').addEventListener('click', () => { reset5(); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(redraw); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshCnn = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
