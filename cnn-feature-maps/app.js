/* cnn-feature-maps: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x, L.y + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
/* deterministic RNG so every run of a demo is repeatable */
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
/* ticker(fn): fn(dtSeconds) returns false to stop. Stops when the tab is hidden. */
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
function slider10(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value / 10); const o = $(id + 'v'); if (o) o.textContent = (e.value / 10).toFixed(1); }); }

/* Model: 12x12 grayscale toy images, 3x3 kernels, "valid" convolution (cross-correlation, as in CNNs). Pure functions only. */
const N = 12;
function image(kind) { const a = []; for (let i = 0; i < N; i++) { a.push([]); for (let j = 0; j < N; j++) { let v = 0;
  if (kind === 'square') v = (i >= 3 && i <= 8 && j >= 3 && j <= 8) ? 1 : 0; if (kind === 'circle') v = ((i - 5.5) ** 2 + (j - 5.5) ** 2 <= 12.5) ? 1 : 0;
  if (kind === 'stripes') v = (j % 4 < 2) ? 1 : 0; if (kind === 'diag') v = (Math.abs(i - j) <= 1) ? 1 : 0; a[i].push(v); } } return a; }
const IMGS = ['square', 'circle', 'stripes', 'diag', 'scene'];
function getImage(kind) { if (kind === 'scene') { const m = ['square', 'circle', 'diag'].map(image); return m[0].map((r, i) => r.map((_, j) => Math.max(m[0][i][j], m[1][i][j], m[2][i][j]))); } return image(kind); }
const KERNELS = { id: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], edgeV: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], edgeH: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], blur: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] };
function conv2d(x, k, pad, stride) { pad = pad || 0; stride = stride || 1; const n = x.length, m = Math.floor((n + 2 * pad - 3) / stride) + 1, o = []; for (let i = 0; i < m; i++) { o.push([]); for (let j = 0; j < m; j++) { let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const ii = i * stride + a - pad, jj = j * stride + b - pad; if (ii >= 0 && ii < n && jj >= 0 && jj < n) s += k[a][b] * x[ii][jj]; } o[i].push(s); } } return o; }
const convAt = (x, k, i, j) => { const prods = []; let s = 0; for (let a = 0; a < 3; a++) { prods.push([]); for (let b = 0; b < 3; b++) { const p = k[a][b] * x[i + a][j + b]; prods[a].push(p); s += p; } } return { prods, sum: s }; };
const relu = m => m.map(r => r.map(v => Math.max(0, v)));
const maxPool2 = m => { const n = Math.floor(m.length / 2), o = []; for (let i = 0; i < n; i++) { o.push([]); for (let j = 0; j < n; j++) o[i].push(Math.max(m[2 * i][2 * j], m[2 * i][2 * j + 1], m[2 * i + 1][2 * j], m[2 * i + 1][2 * j + 1])); } return o; };
const absMap = m => m.map(r => r.map(Math.abs));
const outSize = (n, pad, stride) => Math.floor((n + 2 * pad - 3) / stride) + 1;
const mapMax = m => Math.max.apply(null, m.map(r => Math.max.apply(null, r))), mapMin = m => Math.min.apply(null, m.map(r => Math.min.apply(null, r)));
const countAbove = (m, th) => m.reduce((a, r) => a + r.filter(v => v > th).length, 0);
/* two-layer toy: channels |Gx| and |Gy|, 3x3 mean pooling, then one neuron relu(a*V + b*H - c) */
function layer2(x, a, b, c) { const V = absMap(conv2d(x, KERNELS.edgeV)), H = absMap(conv2d(x, KERNELS.edgeH)), box = KERNELS.blur, Vm = conv2d(V, box), Hm = conv2d(H, box); return { V, H, out: Vm.map((r, i) => r.map((v, j) => Math.max(0, a * v + b * Hm[i][j] - c))) , Vm, Hm }; }
/* learning a kernel by gradient descent on mean squared error */
function trainStep(k, x, tgt, lr) { const o = conv2d(x, k), m = o.length, g = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; let L = 0; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const e = o[i][j] - tgt[i][j]; L += e * e; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) g[a][b] += 2 * e * x[i + a][j + b]; }
  return { k: k.map((r, a) => r.map((v, b) => v - lr * g[a][b] / (m * m))), loss: L / (m * m) }; }
const lossOf = (k, x, tgt) => { const o = conv2d(x, k); let L = 0; o.forEach((r, i) => r.forEach((v, j) => { L += (v - tgt[i][j]) ** 2; })); return L / (o.length * o.length); };
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2), sci = v => v.toExponential(1);
const S = { k0: 'edgeV', i0: 3, j0: 2, img1: 'scene', k1: 'edgeV', kern2: KERNELS.id.map(r => r.slice()), img2: 'scene', pad3: 0, str3: 1, relu3: false, pool3: false, a4: 1, b4: 1, c4: 3, kern5: KERNELS.id.map(r => r.slice()), steps5: 0, hist5: [], lr5: 0.1 };
const TRAIN_X = getImage('scene'), TRAIN_T = conv2d(TRAIN_X, KERNELS.edgeV);
S.hist5 = [lossOf(S.kern5, TRAIN_X, TRAIN_T)];
const KNAMES = ['id', 'edgeV', 'edgeH', 'blur', 'sharpen'];
function drawMap(ctx, m, x0, y0, size, mode, vmax, hi) { const n = m.length, c = size / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = m[i][j]; let col; if (mode === 'gray') { const g = Math.max(0, Math.min(1, v)); col = 'rgb(' + Math.round(20 + g * 215) + ',' + Math.round(28 + g * 217) + ',' + Math.round(38 + g * 212) + ')'; } else { const q = Math.max(-1, Math.min(1, v / (vmax || 1))), a = Math.abs(q); col = q >= 0 ? 'rgb(' + Math.round(17 + a * 229) + ',' + Math.round(25 + a * 139) + ',' + Math.round(36 + a * 55) + ')' : 'rgb(' + Math.round(17 + a * 86) + ',' + Math.round(25 + a * 190) + ',' + Math.round(36 + a * 213) + ')'; } ctx.fillStyle = col; ctx.fillRect(x0 + j * c, y0 + i * c, c + 0.6, c + 0.6); }
  if (hi) { ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.strokeRect(x0 + hi.j * c, y0 + hi.i * c, hi.w * c, hi.h * c); } ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, size, size); }
function drawGrid(ctx, g, x0, y0, c, fmt, col) { for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { ctx.fillStyle = '#101d2a'; ctx.fillRect(x0 + b * c, y0 + a * c, c - 2, c - 2); text(ctx, fmt(g[a][b]), x0 + b * c + c / 2 - 1, y0 + a * c + c / 2 + 4, { align: 'center', size: c > 30 ? 12 : 10, color: col || COL.ink }); } }
const fmtK = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString());
const scan0 = ticker(dt => { S.acc0 = (S.acc0 || 0) + dt * 6; const steps = Math.floor(S.acc0); if (steps > 0) { S.acc0 -= steps; for (let q = 0; q < steps; q++) { S.j0++; if (S.j0 > 9) { S.j0 = 0; S.i0++; } if (S.i0 > 9) { S.i0 = 9; S.j0 = 9; render0(); return false; } } } render0(); });

function render0() {
  const { ctx, w, h } = setup($('cv0')), k = KERNELS[S.k0], x = getImage('scene'), o = conv2d(x, k), p = Math.min(w * 0.44, 220), i = S.i0, j = S.j0, ca = convAt(x, k, i, j), vm = Math.max(1, mapMax(absMap(o)));
  $('i0v').textContent = i; $('j0v').textContent = j; drawMap(ctx, x, 8, 8, p, 'gray', 1, { i: i, j: j, w: 3, h: 3 }); text(ctx, t('lblInput'), 8, p + 22, { size: 11 });
  const ox = w - 8 - p; const part = o.map((r, ii) => r.map((v, jj) => (ii < i || (ii === i && jj <= j)) ? v : 0)); drawMap(ctx, part, ox, 8, p, 'div', vm, { i: i, j: j, w: 1, h: 1 }); text(ctx, t('lblOutput'), ox, p + 22, { size: 11 });
  const c = Math.min(30, (w - 16) / 8), y1 = p + 50; text(ctx, t('lblKernel'), 8, y1 - 4, { size: 11 }); drawGrid(ctx, k, 8, y1 + 2, c, fmtK, COL.orange); text(ctx, '×', 8 + 3 * c + 6, y1 + 2 + 1.5 * c + 4, { size: 16, color: COL.ink });
  const px = 8 + 3 * c + 24; text(ctx, t('lblProducts'), px, y1 - 4, { size: 11 }); drawGrid(ctx, ca.prods, px, y1 + 2, c, v => fmtK(Math.round(v * 100) / 100), COL.cyan); text(ctx, '= ' + f2(ca.sum), px + 3 * c + 10, y1 + 2 + 1.5 * c + 5, { size: 15, color: COL.green, bold: true });
  KNAMES.slice(1).forEach(n => { const b = $('k0_' + n); b.classList.toggle('active', n === S.k0); b.setAttribute('aria-pressed', n === S.k0 ? 'true' : 'false'); }); $('scan0').textContent = scan0.running ? t('pause') : t('scan');
  $('ro0').textContent = t('s0ro', { name: t('kn_' + S.k0), i: i, j: j, sum: f2(ca.sum), n: o.length });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), x = getImage(S.img1), cell = (w - 32) / 3, ex = [['lblInput', null], ['kn_edgeV', 'edgeV'], ['kn_edgeH', 'edgeH'], ['kn_blur', 'blur'], ['kn_sharpen', 'sharpen']];
  ex.forEach(([lab, kn], idx) => { const cx = 8 + (idx % 3) * (cell + 8), cy = 8 + Math.floor(idx / 3) * (cell + 28); if (!kn) drawMap(ctx, x, cx, cy, cell, 'gray', 1); else { const o = conv2d(x, KERNELS[kn]); drawMap(ctx, o, cx, cy, cell, 'div', kn === 'blur' ? 1 : Math.max(1, mapMax(absMap(o))), null); if (kn === S.k1) { ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; ctx.strokeRect(cx - 2, cy - 2, cell + 4, cell + 4); } } text(ctx, t(lab), cx, cy + cell + 14, { size: 11, color: kn === S.k1 ? COL.orange : COL.muted }); });
  IMGS.forEach(n => { const b = $('im1_' + n); b.classList.toggle('active', n === S.img1); b.setAttribute('aria-pressed', n === S.img1 ? 'true' : 'false'); }); KNAMES.slice(1).forEach(n => { const b = $('kk1_' + n); b.classList.toggle('active', n === S.k1); b.setAttribute('aria-pressed', n === S.k1 ? 'true' : 'false'); });
  const ov = conv2d(x, KERNELS.edgeV), oh = conv2d(x, KERNELS.edgeH);
  $('ro1').textContent = t('s1ro', { img: t('im_' + S.img1), v: countAbove(absMap(ov), 0.5), hh: countAbove(absMap(oh), 0.5), n: ov.length * ov.length });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), x = getImage(S.img2), k = S.kern2, o = conv2d(x, k), p = Math.min(w * 0.44, 220), vm = Math.max(1, mapMax(absMap(o)));
  drawMap(ctx, x, 8, 8, p, 'gray', 1); drawMap(ctx, o, w - 8 - p, 8, p, 'div', vm); text(ctx, t('lblInput'), 8, p + 22, { size: 11 }); text(ctx, t('lblOutput'), w - 8 - p, p + 22, { size: 11 });
  const sum = k.reduce((a, r) => a + r.reduce((u, v) => u + v, 0), 0); for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const e = $('k2_' + (a * 3 + b)); if (document.activeElement !== e) e.value = k[a][b]; }
  $('ro2').textContent = t('s2ro', { sum: f2(sum), kind: Math.abs(sum) < 0.01 ? t('kindZero') : Math.abs(sum - 1) < 0.01 ? t('kindOne') : t('kindOther'), mx: f2(mapMax(o)), mn: f2(mapMin(o)) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), x = getImage('scene'); let o = conv2d(x, KERNELS.edgeV, S.pad3, S.str3); const n1 = o.length; if (S.relu3) o = relu(o); let n2 = n1; if (S.pool3) { o = maxPool2(o); n2 = o.length; }
  const p = Math.min(w * 0.44, 220), vm = Math.max(1, mapMax(absMap(conv2d(x, KERNELS.edgeV, S.pad3, S.str3)))); drawMap(ctx, x, 8, 8, p, 'gray', 1); drawMap(ctx, o, w - 8 - p, 8, p, 'div', vm);
  text(ctx, t('lblInputSize', { n: N }), 8, p + 22, { size: 11 }); text(ctx, t('lblOutSize', { n: n2 }), w - 8 - p, p + 22, { size: 11 });
  [['relu3', S.relu3], ['pool3', S.pool3]].forEach(([id, on]) => { const b = $(id); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  $('ro3').textContent = t('s3ro', { pad: S.pad3, st: S.str3, n1: n1, formula: '⌊(12 + 2·' + S.pad3 + ' − 3)/' + S.str3 + '⌋ + 1', relu: S.relu3 ? t('on') : t('off'), pool: S.pool3 ? t('on') : t('off'), n2: n2 });
}
function render4() {
  $('c4v').textContent = S.c4.toFixed(1);
  const { ctx, w, h } = setup($('cv4')), x = getImage('square'), L = layer2(x, S.a4, S.b4, S.c4), cell = (w - 32) / 3, lab = ['lblV', 'lblH', 'lblL2'], maps = [L.V, L.H, L.out], vm = Math.max(1, mapMax(L.V));
  maps.forEach((m, idx) => { const cx = 8 + idx * (cell + 8); drawMap(ctx, m, cx, 8, cell, 'div', idx === 2 ? Math.max(1, mapMax(L.out)) : vm); text(ctx, t(lab[idx]), cx, cell + 24, { size: 11, color: idx === 2 ? COL.orange : COL.muted }); });
  const mx = mapMax(L.out), act = countAbove(L.out, Math.max(0.01, mx * 0.5)); $('ro4').textContent = mx <= 0 ? t('s4roNone', { a: S.a4, b: S.b4, c: S.c4 }) : t('s4ro', { a: S.a4, b: S.b4, c: S.c4, mx: f2(mx), act: act });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), k = S.kern5, c = Math.min(46, (w - 24) / 8), loss = S.hist5[S.hist5.length - 1];
  text(ctx, t('lblLearned'), 8, 16, { size: 11 }); drawGrid(ctx, k, 8, 22, c, fmtK, COL.orange); const tx = 8 + 3 * c + 24; text(ctx, t('lblTarget'), tx, 16, { size: 11 }); drawGrid(ctx, KERNELS.edgeV, tx, 22, c, fmtK, COL.green);
  const L = { x: 44, y: 22 + 3 * c + 24, w: w - 60, h: h - (22 + 3 * c + 24) - 36 }; axes(ctx, L); const lo = -7, hi = 1, X = i => L.x + i / Math.max(60, S.hist5.length - 1) * L.w, Y = v => L.y + L.h - (Math.max(lo, Math.min(hi, Math.log10(Math.max(v, 1e-12)))) - lo) / (hi - lo) * L.h;
  curve(ctx, S.hist5.map((v, i) => [X(i), Y(v)]), COL.cyan, 2.5); text(ctx, t('axLoss'), L.x + 4, L.y + 10, { size: 11 }); text(ctx, t('axTrain'), L.x + L.w, L.y + L.h + 16, { align: 'right', size: 11 }); [1e-6, 1e-3, 1].forEach(v => text(ctx, '10^' + Math.round(Math.log10(v)), L.x - 4, Y(v) + 3, { align: 'right', size: 10 }));
  $('lr5v').textContent = S.lr5.toFixed(2); const gap = Math.max.apply(null, k.map((r, a) => Math.max.apply(null, r.map((v, b) => Math.abs(v - KERNELS.edgeV[a][b])))));
  $('ro5').textContent = t('s5ro', { n: S.steps5, loss: sci(loss), gap: f2(gap), lr: S.lr5.toFixed(2) });
}
function train(n) { for (let q = 0; q < n; q++) { const r = trainStep(S.kern5, TRAIN_X, TRAIN_T, S.lr5); S.kern5 = r.k; S.steps5++; S.hist5.push(lossOf(S.kern5, TRAIN_X, TRAIN_T)); if (!isFinite(S.hist5[S.hist5.length - 1])) break; } render5(); }
function wire() {
  slider('i0', v => { scan0.stop(); S.i0 = v; render0(); }); slider('j0', v => { scan0.stop(); S.j0 = v; render0(); });
  KNAMES.slice(1).forEach(n => $('k0_' + n).addEventListener('click', () => { S.k0 = n; render0(); }));
  $('scan0').addEventListener('click', () => { if (scan0.running) scan0.stop(); else if (reduceMotion()) { S.i0 = 9; S.j0 = 9; } else { S.i0 = 0; S.j0 = 0; scan0.start(); } render0(); });
  IMGS.forEach(n => $('im1_' + n).addEventListener('click', () => { S.img1 = n; render1(); })); KNAMES.slice(1).forEach(n => $('kk1_' + n).addEventListener('click', () => { S.k1 = n; render1(); }));
  for (let q = 0; q < 9; q++) $('k2_' + q).addEventListener('input', e => { const v = parseFloat(e.target.value); if (isFinite(v)) { S.kern2[Math.floor(q / 3)][q % 3] = Math.max(-5, Math.min(5, v)); render2(); } });
  KNAMES.forEach(n => $('p2_' + n).addEventListener('click', () => { S.kern2 = KERNELS[n].map(r => r.slice()); render2(); }));
  IMGS.slice(0, 4).concat(['scene']).forEach(n => $('im2_' + n).addEventListener('click', () => { S.img2 = n; render2(); }));
  slider('pad3', v => { S.pad3 = v; render3(); }); slider('str3', v => { S.str3 = v; render3(); });
  $('relu3').addEventListener('click', () => { S.relu3 = !S.relu3; render3(); }); $('pool3').addEventListener('click', () => { S.pool3 = !S.pool3; render3(); });
  slider('a4', v => { S.a4 = v; render4(); }); slider('b4', v => { S.b4 = v; render4(); }); slider10('c4', v => { S.c4 = v; render4(); });
  $('lr5').addEventListener('input', e => { S.lr5 = +e.target.value / 100; render5(); });
  $('tr1').addEventListener('click', () => train(1)); $('tr10').addEventListener('click', () => train(10)); $('tr100').addEventListener('click', () => train(100));
  $('rs5').addEventListener('click', () => { S.kern5 = KERNELS.id.map(r => r.slice()); S.steps5 = 0; S.hist5 = [lossOf(S.kern5, TRAIN_X, TRAIN_T)]; render5(); });
}

/* boot */
const RENDERS = [render0, render1, render2, render3, render4, render5];
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();

if (typeof module !== 'undefined') module.exports = { N, getImage, KERNELS, conv2d, convAt, relu, maxPool2, absMap, outSize, layer2, trainStep, lossOf, countAbove, mapMax };
