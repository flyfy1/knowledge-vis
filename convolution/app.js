'use strict';
/* 卷积交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 画布适配（DPR）：沿用傅里叶页 fitCanvas 方案 ----------
   CSS 高度只在首次从 height 属性读一次并存 dataset，之后永远钉回同一值；
   backing store 与 CSS 尺寸严格分离，resize 反复调用幂等。 */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) {
    const hAttr = parseInt(cv.getAttribute('height'), 10);
    cv.dataset.cssH = hAttr ? String(hAttr) : '';
  }
  if (cv.dataset.cssH) cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth;
  const h = cv.clientHeight || parseInt(cv.dataset.cssH || '0', 10);
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv._w = w; cv._h = h;
  return ctx;
}
const allCanvases = [];
function ctxOf(id) { const cv = $(id); allCanvases.push(cv); return fitCanvas(cv); }
const refitHooks = [];
function onRefit(fn) { refitHooks.push(fn); }

/* ---------- 动画调度：只跑视口内的步骤 ---------- */
const animators = [];
const visibleSet = new Set();
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) visibleSet.add(e.target); else visibleSet.delete(e.target); });
}, { threshold: 0.05 });
function animate(el, fn) { animators.push({ el, fn }); io.observe(el); }
let lastTs = 0;
function loop(ts) {
  const dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
  lastTs = ts;
  for (const a of animators) if (visibleSet.has(a.el)) { try { a.fn(dt); } catch (err) { console.error(err); } }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- 导航高亮 ---------- */
(function nav() {
  const links = document.querySelectorAll('.nav-step');
  const nio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.dataset.nav === e.target.dataset.step));
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(s => nio.observe(s));
})();

/* ---------- 数学工具 ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function fmt(v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
function fmtNum(v) { // 序列显示：整数不带小数，否则最多 2 位
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return String(Math.round(v * 100) / 100);
}
function conv1d(f, g) { // 全卷积（full convolution），定义与第 2 步一致
  const out = new Array(f.length + g.length - 1).fill(0);
  for (let n = 0; n < out.length; n++)
    for (let k = 0; k < f.length; k++) {
      const j = n - k;
      if (j >= 0 && j < g.length) out[n] += f[k] * g[j];
    }
  return out;
}
/* 基-2 迭代 FFT（复数用两个 Float64Array 存实/虚部） */
function fft(re, im, invert) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (invert ? -2 : 2) * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1, cwi = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cwr - im[i + k + len / 2] * cwi;
        const vi = re[i + k + len / 2] * cwi + im[i + k + len / 2] * cwr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const nwr = cwr * wr - cwi * wi; cwi = cwr * wi + cwi * wr; cwr = nwr;
      }
    }
  }
  if (invert) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
function convViaFFT(f, g) {
  let n = 1;
  while (n < f.length + g.length - 1) n <<= 1;
  const fre = new Float64Array(n), fim = new Float64Array(n);
  const gre = new Float64Array(n), gim = new Float64Array(n);
  f.forEach((v, i) => fre[i] = v);
  g.forEach((v, i) => gre[i] = v);
  fft(fre, fim, false); fft(gre, gim, false);
  const specF = [], specG = [], specP = [];
  for (let i = 0; i < n / 2 + 1; i++) {
    specF.push(Math.hypot(fre[i], fim[i]));
    specG.push(Math.hypot(gre[i], gim[i]));
    specP.push(specF[i] * specG[i]);
  }
  for (let i = 0; i < n; i++) {
    const r = fre[i] * gre[i] - fim[i] * gim[i];
    const m = fre[i] * gim[i] + fim[i] * gre[i];
    fre[i] = r; fim[i] = m;
  }
  fft(fre, fim, true);
  return { out: Array.from(fre.slice(0, f.length + g.length - 1)), specF, specG, specP };
}

/* ---------- 程序化「照片」：多边形风景（无外部资源，卷积前后对比明显） ---------- */
function drawPhoto(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
  sky.addColorStop(0, '#274b73'); sky.addColorStop(0.55, '#7fa8c9'); sky.addColorStop(1, '#e8b07e');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.72);
  // 太阳
  const sg = ctx.createRadialGradient(w * 0.76, h * 0.30, 4, w * 0.76, h * 0.30, h * 0.20);
  sg.addColorStop(0, 'rgba(255,236,170,1)'); sg.addColorStop(0.25, 'rgba(255,205,110,.95)'); sg.addColorStop(1, 'rgba(255,205,110,0)');
  ctx.fillStyle = sg; ctx.fillRect(w * 0.5, 0, w * 0.5, h * 0.62);
  ctx.fillStyle = '#ffd873';
  ctx.beginPath(); ctx.arc(w * 0.76, h * 0.30, h * 0.075, 0, TAU); ctx.fill();
  // 云
  ctx.fillStyle = 'rgba(255,255,255,.88)';
  for (const [cx, cy, s] of [[0.16, 0.16, 1], [0.42, 0.10, 0.7], [0.60, 0.20, 0.55]]) {
    ctx.beginPath();
    ctx.arc(w * cx, h * cy, h * 0.045 * s, 0, TAU);
    ctx.arc(w * cx + h * 0.055 * s, h * cy + h * 0.008, h * 0.036 * s, 0, TAU);
    ctx.arc(w * cx - h * 0.055 * s, h * cy + h * 0.010, h * 0.033 * s, 0, TAU);
    ctx.fill();
  }
  // 远山 / 近山
  ctx.fillStyle = '#4a5f7d';
  ctx.beginPath(); ctx.moveTo(0, h * 0.55);
  ctx.lineTo(w * 0.20, h * 0.30); ctx.lineTo(w * 0.38, h * 0.52); ctx.lineTo(w * 0.55, h * 0.34);
  ctx.lineTo(w * 0.74, h * 0.55); ctx.lineTo(w, h * 0.44); ctx.lineTo(w, h * 0.72); ctx.lineTo(0, h * 0.72); ctx.fill();
  ctx.fillStyle = '#31435c';
  ctx.beginPath(); ctx.moveTo(0, h * 0.66);
  ctx.lineTo(w * 0.16, h * 0.44); ctx.lineTo(w * 0.33, h * 0.64); ctx.lineTo(w * 0.52, h * 0.48);
  ctx.lineTo(w * 0.70, h * 0.68); ctx.lineTo(w, h * 0.56); ctx.lineTo(w, h * 0.78); ctx.lineTo(0, h * 0.78); ctx.fill();
  // 雪顶
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  for (const [px, py, s] of [[0.20, 0.30, 1], [0.55, 0.34, 0.8], [0.16, 0.44, 0.66]]) {
    ctx.beginPath();
    ctx.moveTo(w * px - h * 0.045 * s, h * py + h * 0.055 * s);
    ctx.lineTo(w * px, h * py);
    ctx.lineTo(w * px + h * 0.045 * s, h * py + h * 0.055 * s);
    ctx.lineTo(w * px + h * 0.014 * s, h * py + h * 0.036 * s);
    ctx.lineTo(w * px, h * py + h * 0.048 * s);
    ctx.lineTo(w * px - h * 0.016 * s, h * py + h * 0.034 * s);
    ctx.fill();
  }
  // 草地
  const gr = ctx.createLinearGradient(0, h * 0.70, 0, h);
  gr.addColorStop(0, '#5d8a4a'); gr.addColorStop(1, '#2f5427');
  ctx.fillStyle = gr; ctx.fillRect(0, h * 0.70, w, h * 0.30);
  // 小路
  ctx.fillStyle = '#c9a06a';
  ctx.beginPath();
  ctx.moveTo(w * 0.44, h); ctx.lineTo(w * 0.515, h * 0.78); ctx.lineTo(w * 0.545, h * 0.78); ctx.lineTo(w * 0.60, h); ctx.fill();
  // 房子
  const hx = w * 0.60, hy = h * 0.60, hw = w * 0.17, hh = h * 0.17;
  ctx.fillStyle = '#8a4b2d'; ctx.fillRect(hx, hy, hw, hh);
  ctx.fillStyle = '#5d2f1a';
  ctx.beginPath(); ctx.moveTo(hx - hw * 0.10, hy); ctx.lineTo(hx + hw * 0.5, hy - hh * 0.52); ctx.lineTo(hx + hw * 1.10, hy); ctx.fill();
  ctx.fillStyle = '#ffd873';
  ctx.fillRect(hx + hw * 0.14, hy + hh * 0.30, hw * 0.24, hh * 0.34);
  ctx.fillRect(hx + hw * 0.60, hy + hh * 0.30, hw * 0.24, hh * 0.34);
  ctx.fillStyle = '#3a2415'; ctx.fillRect(hx + hw * 0.42, hy + hh * 0.42, hw * 0.16, hh * 0.58);
  // 树
  for (const [tx, ts] of [[0.10, 1], [0.20, 0.75], [0.88, 0.85]]) {
    ctx.fillStyle = '#4a3220';
    ctx.fillRect(w * tx - 3 * ts, h * 0.70, 6 * ts, h * 0.11 * ts);
    ctx.fillStyle = '#2e6b34';
    ctx.beginPath();
    ctx.arc(w * tx, h * 0.665, h * 0.075 * ts, 0, TAU);
    ctx.arc(w * tx - h * 0.05 * ts, h * 0.695, h * 0.055 * ts, 0, TAU);
    ctx.arc(w * tx + h * 0.05 * ts, h * 0.695, h * 0.055 * ts, 0, TAU);
    ctx.fill();
  }
  // 花丛点缀（高对比小色块，边缘核下很醒目）
  const rnd = mulberry32(7);
  const cols = ['#ff7a93', '#ffd873', '#ffffff', '#ff9d5c'];
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = cols[i % 4];
    const fx = rnd() * w, fy = h * (0.86 + rnd() * 0.12);
    ctx.fillRect(fx, fy, 3, 3);
  }
}
function makePhoto(w, h) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  drawPhoto(cv.getContext('2d'), w, h);
  const img = cv.getContext('2d').getImageData(0, 0, w, h);
  return { cv, img, w, h };
}
function convolveImage(img, kernel, div, off) { // 3×3 真卷积（注意：与 CNN 惯例同为相关运算，核已按显示方向使用）
  const { width: w, height: h, data: src } = img;
  const out = new ImageData(w, h);
  const dst = out.data;
  const at = (x, y, c) => src[(clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)) * 4 + c];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let s = 0;
      for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++)
        s += at(x + kx, y + ky, c) * kernel[(ky + 1) * 3 + (kx + 1)];
      dst[(y * w + x) * 4 + c] = clamp(Math.round(s / div + off), 0, 255);
    }
    dst[(y * w + x) * 4 + 3] = 255;
  }
  return out;
}

/* ================================================================
   步骤 0：钩子 — 照片卷积前后对比拖杆
   ================================================================ */
(function step0() {
  const cv = $('s0-canvas');
  const ctx = ctxOf('s0-canvas');
  const W = 512, H = 384;
  const photo = makePhoto(W, H);
  const blurK = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const edgeK = [0, -1, 0, -1, 4, -1, 0, -1, 0];
  const blurImg = convolveImage(photo.img, blurK, 16, 0);
  const edgeImg = convolveImage(photo.img, edgeK, 1, 0);
  const blurCv = document.createElement('canvas'); blurCv.width = W; blurCv.height = H;
  blurCv.getContext('2d').putImageData(blurImg, 0, 0);
  const edgeCv = document.createElement('canvas'); edgeCv.width = W; edgeCv.height = H;
  edgeCv.getContext('2d').putImageData(edgeImg, 0, 0);
  let mode = 'blur', split = 0.55;

  /* 画布高度随宽度按照片比例（4:3）自适应：桌面不再 cover 裁切、移动端不再留黑边（R2 M1/建议6） */
  function fitS0() {
    const w = cv.clientWidth || 0;
    if (!w) return;
    const target = Math.max(220, Math.min(600, Math.round(w * H / W)));
    if (cv.dataset.cssH !== String(target)) cv.dataset.cssH = String(target);
    fitCanvas(cv);
  }
  function draw() {
    fitS0();
    const w = cv._w, h = cv._h;
    /* contain 适配：整张照片完整可见，桌面/移动端构图一致（与步 4/5 的 fitRect 做法统一） */
    const s = Math.min(w / W, h / H);
    const iw = W * s, ih = H * s;
    const ix = (w - iw) / 2, iy = (h - ih) / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(photo.cv, ix, iy, iw, ih);
    const px = ix + iw * split;
    ctx.save();
    ctx.beginPath(); ctx.rect(px, iy, ix + iw - px, ih); ctx.clip();
    ctx.drawImage(mode === 'blur' ? blurCv : edgeCv, ix, iy, iw, ih);
    ctx.restore();
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, iy); ctx.lineTo(px, iy + ih); ctx.stroke();
    ctx.fillStyle = '#6ee7ff';
    ctx.beginPath(); ctx.arc(px, iy + ih / 2, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = '#08131a'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('◂▸', px, iy + ih / 2 + 0.5);
    /* 标签锚定在可见照片矩形内（桌面端曾画到画布外，R1 M1）；底色加深+描边，边缘模式近黑画面上也清楚 */
    ctx.font = '600 13.5px sans-serif'; ctx.textBaseline = 'alphabetic';
    const t1 = t('cOrig'), t2 = t('cAfter');
    const chip = (x, width) => {
      ctx.fillStyle = 'rgba(8,19,26,.85)';
      ctx.fillRect(x, iy + 10, width, 24);
      ctx.strokeStyle = 'rgba(232,237,244,.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(x, iy + 10, width, 24);
    };
    chip(ix + 10, ctx.measureText(t1).width + 16);
    chip(ix + iw - ctx.measureText(t2).width - 26, ctx.measureText(t2).width + 16);
    ctx.fillStyle = '#e8edf4';
    ctx.textAlign = 'left';
    ctx.fillText(t1, ix + 18, iy + 27);
    ctx.textAlign = 'right';
    ctx.fillText(t2, ix + iw - 18, iy + 27);
  }
  $('s0-split').addEventListener('input', e => { split = e.target.value / 100; draw(); });
  function setMode(m) {
    mode = m;
    $('s0-mode-blur').classList.toggle('active', m === 'blur');
    $('s0-mode-edge').classList.toggle('active', m === 'edge');
    draw();
  }
  $('s0-mode-blur').addEventListener('click', () => setMode('blur'));
  $('s0-mode-edge').addEventListener('click', () => setMode('edge'));
  $('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));
  onRefit(draw);
  onLangRefresh(draw);
  draw();
})();

/* ================================================================
   步骤 1：滑动平均（= 盒式核卷积）
   ================================================================ */
(function step1() {
  const cv = $('s1-canvas');
  const ctx = ctxOf('s1-canvas');
  const section = $('step1');
  const N = 240;
  const rnd = mulberry32(42);
  const data = [];
  for (let i = 0; i < N; i++) {
    const base = 50 + 22 * Math.sin(i / 26) + 10 * Math.sin(i / 7.3 + 1.2);
    data.push(base + (rnd() - 0.5) * 17);
  }
  let W = 9, pos = 0, playing = true;

  function smoothedAt(i, w) { // 与窗口 [i-w+1, i] 对齐（因果滑动平均）
    let s = 0, c = 0;
    for (let k = Math.max(0, i - w + 1); k <= i; k++) { s += data[k]; c++; }
    return s / c;
  }
  function draw() {
    const w = cv._w, h = cv._h;
    const padL = 14, padR = 14, padT = 26, padB = 16;
    const iw = w - padL - padR, ih = h - padT - padB;
    const x = i => padL + iw * i / (N - 1);
    const y = v => padT + ih * (1 - (v - 8) / 84);
    ctx.clearRect(0, 0, w, h);
    // 窗口带
    const i1 = Math.floor(pos), i0 = Math.max(0, i1 - W + 1);
    ctx.fillStyle = 'rgba(110,231,255,.10)';
    ctx.fillRect(x(i0), padT, x(i1) - x(i0), ih);
    ctx.strokeStyle = 'rgba(110,231,255,.55)'; ctx.lineWidth = 1;
    ctx.strokeRect(x(i0), padT, Math.max(1, x(i1) - x(i0)), ih);
    // 原始曲线
    ctx.strokeStyle = 'rgba(154,167,184,.75)'; ctx.lineWidth = 1.2; ctx.beginPath();
    data.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
    ctx.stroke();
    // 窗口内数据点
    ctx.fillStyle = '#6ee7ff';
    for (let i = i0; i <= i1; i++) { ctx.beginPath(); ctx.arc(x(i), y(data[i]), 2.2, 0, TAU); ctx.fill(); }
    // 平滑曲线（已走过的部分亮，未走的暗）
    for (const [upto, style, lw] of [[N - 1, 'rgba(255,180,84,.28)', 2], [i1, '#ffb454', 2.4]]) {
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = 0; i <= upto; i++) { const v = smoothedAt(i, W); i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)); }
      ctx.stroke();
    }
    // 当前平均点
    const avg = smoothedAt(i1, W);
    ctx.fillStyle = '#ffb454';
    ctx.beginPath(); ctx.arc(x(i1), y(avg), 4.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.5; ctx.stroke();
    // 图例
    ctx.font = '13px sans-serif'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'left';
    ctx.fillText(t('cRaw'), padL, 16);
    ctx.fillStyle = '#ffb454'; ctx.textAlign = 'right';
    ctx.fillText(t('cSmooth'), w - padR, 16);
    return { avg, i1 };
  }
  function readout() {
    const { avg } = drawCache;
    $('s1-readout').textContent = t('s1ro', { w: W, avg: fmt(avg, 1), lag: ((W - 1) / 2).toFixed(1) });
  }
  let drawCache = draw(); readout();
  animate(section, dt => {
    if (playing) {
      pos += dt * 26;
      if (pos > N + 30) pos = 0;
      drawCache = draw(); readout();
    }
  });
  $('s1-win').addEventListener('input', e => {
    W = parseInt(e.target.value, 10);
    $('s1-win-val').textContent = W;
    drawCache = draw(); readout();
  });
  $('s1-play').addEventListener('click', () => {
    playing = !playing;
    $('s1-play').textContent = playing ? t('s1pause') : t('s1play');
  });
  onLangRefresh(() => {
    $('s1-play').textContent = playing ? t('s1pause') : t('s1play');
    drawCache = draw(); readout();
  });
  onRefit(() => { drawCache = draw(); readout(); });
})();


/* ================================================================
   步骤 2：离散卷积拆开算账（翻转 → 滑动 → 相乘 → 求和）
   对齐约定：输出 n 时，列 k 上的核系数是 g[n−k]，即核在 f 轴上倒序出现。
   ================================================================ */
(function step2() {
  const cv = $('s2-canvas');
  const ctx = ctxOf('s2-canvas');
  let f = [1, 2, 3, 2, 1];
  let g = [1, 0, -1];
  let st = { n: 0, phase: 0, done: false };
  let playing = false, acc = 0;

  function buildInputs() {
    const mk = (box, arr, cb) => {
      box.innerHTML = '';
      arr.forEach((v, i) => {
        const inp = document.createElement('input');
        inp.type = 'number'; inp.value = v; inp.step = 'any';
        inp.setAttribute('aria-label', 'seq-' + i);
        inp.addEventListener('input', () => {
          const nv = parseFloat(inp.value);
          arr[i] = isFinite(nv) ? clamp(nv, -99, 99) : 0;
          cb();
        });
        /* 失焦/回车时把实际取值回填进框：清空 = 按 0 计算，框里也显示 0，不再「显示与取值脱节」（R2 建议3） */
        inp.addEventListener('change', () => { inp.value = fmtNum(arr[i]); });
        box.appendChild(inp);
      });
    };
    mk($('s2-f-inputs'), f, reset);
    mk($('s2-g-inputs'), g, reset);
  }
  function outLen() { return f.length + g.length - 1; }
  function terms(n) { // 返回 [k, f[k], g[n-k], product]（仅重叠项）
    const list = [];
    for (let k = 0; k < f.length; k++) {
      const j = n - k;
      if (j >= 0 && j < g.length) list.push([k, f[k], g[j], f[k] * g[j]]);
    }
    return list;
  }
  function yVal(n) { return terms(n).reduce((s, x) => s + x[3], 0); }

  function box(x, y, s, val, opts) {
    const { border, fill, color, bold } = opts;
    ctx.beginPath();
    ctx.roundRect(x - s / 2, y - s / 2, s, s, 8);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = (bold ? '700 ' : '') + '16px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmtNum(val), x, y + 1);
  }
  function draw() {
    const w = cv._w, h = cv._h;
    ctx.clearRect(0, 0, w, h);
    const nCols = f.length + g.length + 1; // 列范围 -(g-1) .. f+g-2
    const padL = w < 560 ? 8 : 118;
    const s = Math.min(52, (w - padL - 16) / nCols);
    const colX = c => padL + (c + g.length - 1 + 0.5) * ((w - padL - 16) / nCols);
    const yF = 44, yK = 128, yP = 200, yO = 284;
    const label = (txt, y, color) => {
      ctx.fillStyle = color || '#9aa7b8';
      ctx.font = '13.5px sans-serif'; ctx.textBaseline = 'middle';
      if (w < 560) { // 窄屏：标签画在该行上方左侧
        ctx.textAlign = 'left';
        ctx.fillText(txt, padL + 2, y - s / 2 - 12);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(txt, padL - 10, y);
      }
    };
    // f 行
    label(t('s2f'), yF);
    f.forEach((v, k) => box(colX(k), yF, s - 6, v, { border: '#6ee7ff', fill: '#1c2330', color: '#e8edf4' }));
    // 翻转核行（列 k 上的系数 g[n−k]）
    label(t('s2flip'), yK, '#ffb454');
    const n = st.n;
    for (let k = n - g.length + 1; k <= n; k++) {
      const j = n - k;
      if (j < 0 || j >= g.length) continue;
      const inF = k >= 0 && k < f.length;
      box(colX(k), yK, s - 6, g[j], {
        border: '#ffb454', fill: inF ? '#3a2c14' : '#23202a',
        color: inF ? '#ffd9a0' : '#8b93a3',
      });
      if (inF) { // 对齐虚线
        ctx.strokeStyle = 'rgba(110,231,255,.30)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(colX(k), yF + s / 2 - 2); ctx.lineTo(colX(k), yK - s / 2 + 2); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    // 乘积行
    label(t('s2prod'), yP);
    if (st.phase >= 1 || st.done) {
      for (let k = 0; k < f.length; k++) {
        const j = n - k;
        if (j >= 0 && j < g.length) {
          box(colX(k), yP, s - 6, f[k] * g[j], { border: '#7ee2a8', fill: '#16301f', color: '#b9f4d2', bold: true });
        } else { // f 的这一列没有核与之重叠 → 不参与本次求和
          ctx.fillStyle = 'rgba(154,167,184,.35)';
          ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('·', colX(k), yP);
        }
      }
    }
    // 输出行
    label(t('s2out'), yO);
    for (let i = 0; i < outLen(); i++) {
      const filled = st.done || i < st.n || (i === st.n && st.phase >= 2);
      if (filled) box(colX(i), yO, s - 6, yVal(i), { border: '#ff7a93', fill: '#3a1622', color: '#ffc2cf', bold: true });
      else {
        ctx.beginPath(); ctx.roundRect(colX(i) - (s - 6) / 2, yO - (s - 6) / 2, s - 6, s - 6, 8);
        ctx.strokeStyle = 'rgba(255,122,147,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,194,207,.4)'; ctx.font = '13px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('y' + i, colX(i), yO);
      }
    }
    if (st.n === n && !st.done) { // 当前输出位置标记
      ctx.fillStyle = '#ff7a93'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', colX(n), yO + s / 2 + 14);
    }
  }
  function readout() {
    const el = $('s2-readout');
    if (st.done) {
      const vals = [];
      for (let i = 0; i < outLen(); i++) vals.push(fmtNum(yVal(i)));
      el.textContent = t('s2done', { vals: vals.join(', ') });
      return;
    }
    if (st.phase === 0) el.textContent = t('s2align', { n: st.n });
    else if (st.phase === 1) {
      const ts = terms(st.n).map(([k, fv, gv]) => 'f[' + k + ']·g[' + (st.n - k) + ']');
      el.textContent = t('s2prods') + ' ' + ts.join(' , ');
    } else {
      const ts = terms(st.n);
      const termStr = ts.map(([, fv, gv]) => fmtNum(fv) + '×' + fmtNum(gv)).join(' + ');
      el.textContent = t('s2sum', { n: st.n, terms: termStr || '0', sum: fmtNum(yVal(st.n)) });
    }
  }
  function advance() {
    if (st.done) return;
    if (st.phase < 2) st.phase++;
    else if (st.n < outLen() - 1) { st.n++; st.phase = 0; }
    else { st.done = true; playing = false; $('s2-play').textContent = t('s2play'); }
    draw(); readout();
  }
  function reset() {
    st = { n: 0, phase: 0, done: false };
    playing = false; $('s2-play').textContent = t('s2play');
    draw(); readout();
    $('s2-readout').textContent = t('s2idle');
  }
  buildInputs();
  $('s2-step').addEventListener('click', advance);
  $('s2-play').addEventListener('click', () => {
    if (st.done) reset();
    playing = !playing;
    $('s2-play').textContent = playing ? t('s1pause') : t('s2play');
  });
  $('s2-reset').addEventListener('click', () => {
    /* 「重置」同时把被改过的数字恢复默认序列（R2 建议3）：原地改回默认值，再重建输入框并归零算账状态 */
    f.splice(0, f.length, 1, 2, 3, 2, 1);
    g.splice(0, g.length, 1, 0, -1);
    buildInputs();
    reset();
  });
  animate($('step2'), dt => {
    if (!playing) return;
    acc += dt;
    if (acc > 0.95) { acc = 0; advance(); }
  });
  onLangRefresh(() => {
    $('s2-play').textContent = playing ? t('s1pause') : t('s2play');
    draw(); readout();
    if (st.n === 0 && st.phase === 0 && !st.done) $('s2-readout').textContent = t('s2idle');
  });
  onRefit(draw);
  draw();
  $('s2-readout').textContent = t('s2idle');
})();

/* ================================================================
   步骤 3：连续卷积 = 重叠面积
   ================================================================ */
(function step3() {
  const cv = $('s3-canvas');
  const ctx = ctxOf('s3-canvas');
  let mode = 'rr'; // rr: rect×rect, rt: rect×triangle
  let tau = -4, playing = false;
  const fShape = x => (Math.abs(x) <= 1 ? 1 : 0);
  const gShape = x => mode === 'rr' ? (Math.abs(x) <= 1 ? 1 : 0) : Math.max(0, 1 - Math.abs(x));
  // 预计算输出曲线（数值积分）
  let outCurve = [];
  function computeOut() {
    outCurve = [];
    const dx = 0.01;
    for (let tt = -400; tt <= 400; tt++) {
      const tv = tt / 100;
      let s = 0;
      for (let x = -2.5; x <= 2.5; x += dx) s += fShape(x) * gShape(tv - x) * dx;
      outCurve.push([tv, s]);
    }
  }
  function outAt(tv) {
    let s = 0; const dx = 0.01;
    for (let x = -2.5; x <= 2.5; x += dx) s += fShape(x) * gShape(tv - x) * dx;
    return s;
  }
  computeOut();

  function draw() {
    const w = cv._w, h = cv._h;
    ctx.clearRect(0, 0, w, h);
    const unit = (w - 30) / 8.8;
    const cx = w / 2;
    const X = v => cx + v * unit;
    // —— 上：两条脉冲 ——
    const baseT = 168, topH = 96;
    ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(-4.3), baseT); ctx.lineTo(X(4.3), baseT); ctx.stroke();
    const N = 340;
    const plot = (fn, shift, color, fillA) => {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const x = -4.3 + 8.6 * i / N;
        const v = fn(x - shift);
        const px = X(x), py = baseT - v * topH;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      if (fillA) {
        ctx.lineTo(X(4.3), baseT); ctx.lineTo(X(-4.3), baseT); ctx.closePath();
        ctx.fillStyle = fillA; ctx.fill();
      }
    };
    // 重叠填充（min 曲线之下）
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= N; i++) {
      const x = -4.3 + 8.6 * i / N;
      const v = Math.min(fShape(x), gShape(x - tau));
      const px = X(x), py = baseT - v * topH;
      if (v > 0.001) { started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; }
    }
    if (started) {
      ctx.lineTo(X(Math.min(1, tau + 1)), baseT); ctx.lineTo(X(Math.max(-1, tau - 1)), baseT); ctx.closePath();
      ctx.fillStyle = 'rgba(126,226,168,.30)'; ctx.fill();
    }
    plot(fShape, 0, '#6ee7ff', 'rgba(110,231,255,.10)');
    plot(gShape, tau, '#ffb454', 'rgba(255,180,84,.10)');
    ctx.font = '13px sans-serif'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'left';
    ctx.fillText(t('cFixedF'), X(-4.25), 24);
    ctx.fillStyle = '#ffb454'; ctx.textAlign = 'right';
    ctx.fillText(t('cSlideG'), X(4.25), 24);
    const area = outAt(tau);
    if (area > 0.01) {
      ctx.fillStyle = '#7ee2a8'; ctx.textAlign = 'center';
      ctx.fillText(t('cOverlap') + ' = ' + fmt(area, 2), X(tau / 2), baseT - topH - 12);
    }
    // —— 下：输出曲线 ——
    const baseB = h - 26, outH = 108, maxOut = mode === 'rr' ? 2 : 1.05;
    ctx.strokeStyle = '#2b3547';
    ctx.beginPath(); ctx.moveTo(X(-4.3), baseB); ctx.lineTo(X(4.3), baseB); ctx.stroke();
    ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'left';
    ctx.fillText(t('cOut'), X(-4.25), baseB - outH - 8);
    const drawCurve = upto => {
      ctx.beginPath();
      let began = false;
      for (const [tv, v] of outCurve) {
        if (tv > upto) break;
        const px = X(tv), py = baseB - v / maxOut * outH;
        began ? ctx.lineTo(px, py) : ctx.moveTo(px, py); began = true;
      }
      ctx.stroke();
    };
    ctx.strokeStyle = 'rgba(255,122,147,.30)'; ctx.lineWidth = 2; drawCurve(99);
    ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 2.4; drawCurve(tau);
    // 当前点 + 连接虚线
    ctx.strokeStyle = 'rgba(126,226,168,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(tau), baseT); ctx.lineTo(X(tau), baseB - area / maxOut * outH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff7a93';
    ctx.beginPath(); ctx.arc(X(tau), baseB - area / maxOut * outH, 4.5, 0, TAU); ctx.fill();
    $('s3-shift-val').textContent = fmt(tau, 2).replace('-', '−');
    $('s3-readout').textContent = t('s3ro', { tau: fmt(tau, 2), area: fmt(area, 2) });
  }
  function setMode(m) {
    mode = m;
    $('s3-mode-rr').classList.toggle('active', m === 'rr');
    $('s3-mode-rt').classList.toggle('active', m === 'rt');
    computeOut(); draw();
  }
  $('s3-mode-rr').addEventListener('click', () => setMode('rr'));
  $('s3-mode-rt').addEventListener('click', () => setMode('rt'));
  $('s3-shift').addEventListener('input', e => {
    tau = parseFloat(e.target.value);
    playing = false; $('s3-play').textContent = t('s1play');
    draw();
  });
  $('s3-play').addEventListener('click', () => {
    playing = !playing;
    $('s3-play').textContent = playing ? t('s1pause') : t('s1play');
    if (playing && tau >= 3.99) { tau = -4; $('s3-shift').value = -4; }
  });
  animate($('step3'), dt => {
    if (!playing) return;
    tau += dt * 1.5;
    if (tau >= 4) { tau = 4; playing = false; $('s3-play').textContent = t('s1play'); }
    $('s3-shift').value = tau;
    draw();
  });
  onLangRefresh(() => {
    $('s3-play').textContent = playing ? t('s1pause') : t('s1play');
    draw();
  });
  onRefit(draw);
  draw();
})();

/* ================================================================
   步骤 4：图像卷积核（真算像素 + 悬停看算账）
   ================================================================ */
(function step4() {
  const W = 256, H = 192;
  const photo = makePhoto(W, H);
  const srcCv = $('s4-src'), outCv = $('s4-out');
  const srcCtx = ctxOf('s4-src'), outCtx = ctxOf('s4-out');
  let kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1].slice();
  let div = 16, off = 0;
  let outImg = null;
  let hover = null; // {x, y}
  const outOff = document.createElement('canvas'); outOff.width = W; outOff.height = H;

  const kbox = $('s4-kernel');
  const kInputs = [];
  for (let i = 0; i < 9; i++) {
    const inp = document.createElement('input');
    inp.type = 'number'; inp.step = 'any'; inp.value = kernel[i];
    inp.setAttribute('aria-label', 'kernel-' + i);
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      kernel[i] = isFinite(v) ? v : 0;
      markCustom();
      apply();
    });
    kbox.appendChild(inp); kInputs.push(inp);
  }
  function markCustom() {
    ['identity', 'blur', 'sharpen', 'edge', 'emboss'].forEach(n => $('s4-p-' + n).classList.remove('active'));
  }
  function fitRect(cv) {
    const s = Math.min(cv._w / W, cv._h / H);
    return { dx: (cv._w - W * s) / 2, dy: (cv._h - H * s) / 2, dw: W * s, dh: H * s, s };
  }
  function drawSrc() {
    const r = fitRect(srcCv);
    srcCtx.clearRect(0, 0, srcCv._w, srcCv._h);
    srcCtx.imageSmoothingEnabled = false;
    srcCtx.drawImage(photo.cv, r.dx, r.dy, r.dw, r.dh);
    if (hover) {
      srcCtx.strokeStyle = '#ff7a93'; srcCtx.lineWidth = 1.6;
      srcCtx.strokeRect(r.dx + (hover.x - 1) * r.s, r.dy + (hover.y - 1) * r.s, 3 * r.s, 3 * r.s);
      srcCtx.strokeStyle = '#6ee7ff';
      srcCtx.strokeRect(r.dx + hover.x * r.s, r.dy + hover.y * r.s, r.s, r.s);
    }
  }
  function drawOut() {
    const r = fitRect(outCv);
    outCtx.clearRect(0, 0, outCv._w, outCv._h);
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(outOff, r.dx, r.dy, r.dw, r.dh);
    if (hover) {
      outCtx.strokeStyle = '#6ee7ff'; outCtx.lineWidth = 1.6;
      outCtx.strokeRect(r.dx + hover.x * r.s, r.dy + hover.y * r.s, r.s, r.s);
    }
  }
  function pixelAccount(x, y) {
    const d = photo.img.data;
    const at = (xx, yy, c) => d[(clamp(yy, 0, H - 1) * W + clamp(xx, 0, W - 1)) * 4 + c];
    const cells = [], sums = [0, 0, 0];
    for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) {
      const kv = kernel[(ky + 1) * 3 + (kx + 1)];
      const rv = at(x + kx, y + ky, 0);
      for (let c = 0; c < 3; c++) sums[c] += at(x + kx, y + ky, c) * kv;
      cells.push({ v: rv, k: kv, p: rv * kv });
    }
    const fin = c => clamp(Math.round(sums[c] / (div || 1) + off), 0, 255);
    return { cells, sums, fin: [fin(0), fin(1), fin(2)] };
  }
  function renderAccount() {
    const head = $('s4-acc-head'), grid = $('s4-acc-grid'), sumEl = $('s4-acc-sum');
    if (!hover) {
      head.textContent = t('s4idle');
      grid.innerHTML = ''; sumEl.textContent = '';
      return;
    }
    const a = pixelAccount(hover.x, hover.y);
    head.textContent = t('s4accHead', { x: hover.x, y: hover.y });
    grid.innerHTML = a.cells.map(c =>
      '<div class="cell"><b>' + c.v + '</b> × ' + fmtNum(c.k) + ' = <span class="prod">' + fmtNum(Math.round(c.p * 10) / 10) + '</span></div>'
    ).join('');
    sumEl.textContent = t('s4accSum', {
      sum: fmtNum(Math.round(a.sums[0] * 10) / 10), div: fmtNum(div || 1),
      off: off ? t('s4offTxt', { off: fmtNum(off) }) : '',
      val: a.fin[0], g: a.fin[1], b: a.fin[2],
    });
  }
  function apply() {
    outImg = convolveImage(photo.img, kernel, div || 1, off);
    outOff.getContext('2d').putImageData(outImg, 0, 0);
    drawSrc(); drawOut(); renderAccount();
  }
  const PRESETS = {
    identity: { k: [0, 0, 0, 0, 1, 0, 0, 0, 0], div: 1, off: 0 },
    blur: { k: [1, 2, 1, 2, 4, 2, 1, 2, 1], div: 16, off: 0 },
    sharpen: { k: [0, -1, 0, -1, 5, -1, 0, -1, 0], div: 1, off: 0 },
    edge: { k: [0, -1, 0, -1, 4, -1, 0, -1, 0], div: 1, off: 0 },
    emboss: { k: [-2, -1, 0, -1, 1, 1, 0, 1, 2], div: 1, off: 128 },
  };
  function setPreset(name) {
    const p = PRESETS[name];
    kernel = p.k.slice(); div = p.div; off = p.off;
    kInputs.forEach((inp, i) => inp.value = kernel[i]);
    $('s4-div').value = div; $('s4-off').value = off;
    ['identity', 'blur', 'sharpen', 'edge', 'emboss'].forEach(n =>
      $('s4-p-' + n).classList.toggle('active', n === name));
    apply();
  }
  ['identity', 'blur', 'sharpen', 'edge', 'emboss'].forEach(n =>
    $('s4-p-' + n).addEventListener('click', () => setPreset(n)));
  $('s4-div').addEventListener('input', e => { div = parseFloat(e.target.value) || 1; apply(); });
  $('s4-off').addEventListener('input', e => { off = parseFloat(e.target.value) || 0; apply(); });
  function pick(e) {
    const rect = outCv.getBoundingClientRect();
    const r = fitRect(outCv);
    const px = (e.clientX - rect.left - r.dx) / r.s;
    const py = (e.clientY - rect.top - r.dy) / r.s;
    if (px < 0 || py < 0 || px >= W || py >= H) return;
    hover = { x: Math.floor(px), y: Math.floor(py) };
    drawSrc(); drawOut(); renderAccount();
  }
  outCv.addEventListener('pointermove', pick);
  outCv.addEventListener('pointerdown', pick);
  onLangRefresh(renderAccount);
  onRefit(() => { drawSrc(); drawOut(); });
  // 初始：模糊预设（与第 0 步呼应），但核值已在上方给出——把除数同步成 16
  $('s4-div').value = 16;
  apply();
})();

/* ================================================================
   步骤 5：三个马甲（回声 / 虚化 / 平滑）
   ================================================================ */
(function step5() {
  const tabs = ['audio', 'photo', 'data'];
  function show(name) {
    tabs.forEach(n => {
      $('s5-tab-' + n).classList.toggle('active', n === name);
      $('s5-panel-' + n).classList.toggle('hidden', n !== name);
    });
    if (name === 'photo') drawPhotoTab();
    if (name === 'data') drawDataTab();
    if (name === 'audio') drawIR();
  }
  tabs.forEach(n => $('s5-tab-' + n).addEventListener('click', () => show(n)));

  /* ---- ① 音频回声：与冲激串的卷积（ConvolverNode 真卷积） ---- */
  const irCv = $('s5-ir'); const irCtx = ctxOf('s5-ir');
  let actx = null, srcBuf = null;
  function drawIR() {
    fitCanvas(irCv);
    const w = irCv._w, h = irCv._h;
    const delay = parseFloat($('s5-delay').value), decay = parseFloat($('s5-decay').value);
    const reps = parseInt($('s5-reps').value, 10);
    irCtx.clearRect(0, 0, w, h);
    const base = h - 26, top = 14;
    const span = Math.max(1.9, delay * reps * 1.12 + 0.25); // 显示跨度随延迟×次数放大，保证最后一根茎不被裁掉
    irCtx.strokeStyle = '#2b3547';
    irCtx.beginPath(); irCtx.moveTo(14, base); irCtx.lineTo(w - 10, base); irCtx.stroke();
    const stem = (tt, amp, color) => {
      const x = 14 + (w - 24) * tt / span;
      irCtx.strokeStyle = color; irCtx.lineWidth = 3;
      irCtx.beginPath(); irCtx.moveTo(x, base); irCtx.lineTo(x, base - amp * (base - top)); irCtx.stroke();
      irCtx.fillStyle = color;
      irCtx.beginPath(); irCtx.arc(x, base - amp * (base - top), 3.4, 0, TAU); irCtx.fill();
    };
    stem(0, 1, '#9aa7b8');
    for (let k = 1; k <= reps; k++) stem(delay * k, Math.pow(decay, k), '#ffb454');
    irCtx.fillStyle = '#9aa7b8'; irCtx.font = '13px sans-serif'; irCtx.textAlign = 'left';
    irCtx.fillText(t('cIR'), 14, h - 6);
    $('s5-delay-val').textContent = fmt(delay, 2);
    $('s5-decay-val').textContent = fmt(decay, 2);
    $('s5-reps-val').textContent = reps;
  }
  async function ensureAudio() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') await actx.resume();
    if (!srcBuf) {
      const sr = actx.sampleRate;
      const off = new OfflineAudioContext(1, sr * 1.6, sr);
      [[659.25, 0], [523.25, 0.38], [783.99, 0.76]].forEach(([fr, t0]) => {
        const o = off.createOscillator(), gn = off.createGain();
        o.type = 'triangle'; o.frequency.value = fr;
        gn.gain.setValueAtTime(0.0001, t0);
        gn.gain.exponentialRampToValueAtTime(0.5, t0 + 0.015);
        gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
        o.connect(gn); gn.connect(off.destination);
        o.start(t0); o.stop(t0 + 0.4);
      });
      srcBuf = await off.startRendering();
    }
  }
  function playEcho(withEcho) {
    ensureAudio().then(() => {
      const sr = actx.sampleRate;
      const src = actx.createBufferSource(); src.buffer = srcBuf;
      const dry = actx.createGain(); dry.gain.value = 0.9;
      src.connect(dry); dry.connect(actx.destination);
      if (withEcho) {
        const delay = parseFloat($('s5-delay').value), decay = parseFloat($('s5-decay').value);
        const reps = parseInt($('s5-reps').value, 10);
        const len = Math.floor(sr * delay * reps) + 1; // IR 长度由重复次数决定：最后一根冲激恰好落在末尾（R2 建议7）
        const ir = actx.createBuffer(1, len, sr);
        const ch = ir.getChannelData(0);
        for (let k = 1; k <= reps; k++) ch[Math.floor(sr * delay * k)] = Math.pow(decay, k);
        const conv = actx.createConvolver(); conv.buffer = ir; conv.normalize = false;
        const wet = actx.createGain(); wet.gain.value = 1.0;
        src.connect(conv); conv.connect(wet); wet.connect(actx.destination);
      }
      src.start();
    }).catch(err => console.error(err));
  }
  $('s5-play-dry').addEventListener('click', () => playEcho(false));
  $('s5-play-echo').addEventListener('click', () => playEcho(true));
  $('s5-delay').addEventListener('input', drawIR);
  $('s5-decay').addEventListener('input', drawIR);
  $('s5-reps').addEventListener('input', drawIR);
  onLangRefresh(drawIR);

  /* ---- ② 照片虚化：可分离盒式卷积 ---- */
  const pCv = $('s5-photo'); const pCtx = ctxOf('s5-photo');
  const photo5 = makePhoto(256, 192);
  function boxBlur(img, r) {
    if (r === 0) return img;
    const w = img.width, h = img.height;
    const pass = (src, horiz) => {
      const out = new Float32Array(src.length);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        for (let c = 0; c < 3; c++) {
          let s = 0;
          for (let d = -r; d <= r; d++) {
            const xx = horiz ? clamp(x + d, 0, w - 1) : x;
            const yy = horiz ? y : clamp(y + d, 0, h - 1);
            s += src[(yy * w + xx) * 4 + c];
          }
          out[(y * w + x) * 4 + c] = s / (2 * r + 1);
        }
      }
      return out;
    };
    const f32 = new Float32Array(img.data);
    const tmp = pass(f32, true), res = pass(tmp, false);
    const out = new ImageData(w, h);
    for (let i = 0; i < res.length; i++) out.data[i] = i % 4 === 3 ? 255 : clamp(Math.round(res[i]), 0, 255);
    return out;
  }
  const pOff = document.createElement('canvas'); pOff.width = 256; pOff.height = 192;
  function drawPhotoTab() {
    fitCanvas(pCv);
    const r = parseInt($('s5-radius').value, 10);
    $('s5-radius-val').textContent = r;
    const img = boxBlur(photo5.img, r);
    pOff.getContext('2d').putImageData(img, 0, 0);
    const s = Math.min(pCv._w / 256, pCv._h / 192);
    pCtx.clearRect(0, 0, pCv._w, pCv._h);
    pCtx.imageSmoothingEnabled = true;
    pCtx.drawImage(pOff, (pCv._w - 256 * s) / 2, (pCv._h - 192 * s) / 2, 256 * s, 192 * s);
  }
  $('s5-radius').addEventListener('input', drawPhotoTab);

  /* ---- ③ 平滑数据：盒式 vs [1,2,1]/4 多遍 ---- */
  const dCv = $('s5-data'); const dCtx = ctxOf('s5-data');
  const DN = 200, drnd = mulberry32(123);
  const dData = [];
  for (let i = 0; i < DN; i++)
    dData.push(50 + 20 * Math.sin(i / 21) + 9 * Math.sin(i / 6.1 + 0.7) + (drnd() - 0.5) * 15);
  const centered = (arr, k, div) => arr.map((_, i) => {
    let s = 0;
    for (let j = 0; j < k.length; j++) s += arr[clamp(i + j - (k.length >> 1), 0, arr.length - 1)] * k[j];
    return s / div;
  });
  function drawDataTab() {
    fitCanvas(dCv);
    const w = dCv._w, h = dCv._h;
    const passes = parseInt($('s5-pass').value, 10);
    $('s5-pass-val').textContent = passes;
    let gauss = dData.slice();
    for (let p = 0; p < passes; p++) gauss = centered(gauss, [1, 2, 1], 4);
    const box = centered(dData, [1, 1, 1, 1, 1], 5);
    const padL = 12, padR = 12, padT = 14, padB = 12;
    const X = i => padL + (w - padL - padR) * i / (DN - 1);
    const Y = v => padT + (h - padT - padB) * (1 - (v - 12) / 76);
    dCtx.clearRect(0, 0, w, h);
    const line = (arr, style, lw) => {
      dCtx.strokeStyle = style; dCtx.lineWidth = lw; dCtx.beginPath();
      arr.forEach((v, i) => i ? dCtx.lineTo(X(i), Y(v)) : dCtx.moveTo(X(i), Y(v)));
      dCtx.stroke();
    };
    line(dData, 'rgba(154,167,184,.45)', 1);
    line(box, '#9aa7b8', 1.8);
    line(gauss, '#6ee7ff', 2.4);
  }
  $('s5-pass').addEventListener('input', drawDataTab);
  onRefit(() => {
    drawIR();
    if (!$('s5-panel-photo').classList.contains('hidden')) drawPhotoTab();
    if (!$('s5-panel-data').classList.contains('hidden')) drawDataTab();
  });
  drawIR();
})();

/* ================================================================
   步骤 6：与傅里叶相遇（时域卷积 vs 频域相乘，FFT 真算）
   ================================================================ */
(function step6() {
  const cv = $('s6-canvas'); const ctx = ctxOf('s6-canvas');
  const spCv = $('s6-spec'); const spCtx = ctxOf('s6-spec');
  const N = 96;
  let sigName = 'rect', kerName = 'smooth';
  const SIGNS = {
    rect: () => Array.from({ length: N }, (_, i) => (i >= 29 && i <= 52 ? 1 : 0)),
    tri: () => Array.from({ length: N }, (_, i) => Math.max(0, 1 - Math.abs(i - 48) / 24)),
    sine: () => Array.from({ length: N }, (_, i) => (i < 8 || i > 87 ? 0 : Math.sin(2 * Math.PI * 4 * i / N) * Math.sin(Math.PI * (i + 0.5) / N))),
    steps: () => {
      const r = mulberry32(99), arr = [];
      for (let sgm = 0; sgm < 8; sgm++) { const v = 0.15 + r() * 0.85; for (let i = 0; i < 12; i++) arr.push(v); }
      return arr;
    },
  };
  const KERS = {
    smooth: () => [1, 2, 3, 2, 1],
    diff: () => [-1, 1],
    echo: () => { const a = new Array(27).fill(0); a[0] = 1; a[13] = 0.55; a[26] = 0.3; return a; },
  };
  function draw() {
    const f = SIGNS[sigName](), g = KERS[kerName]();
    const yTime = conv1d(f, g);
    const fr = convViaFFT(f, g);
    const yFreq = fr.out;
    let err = 0;
    for (let i = 0; i < yTime.length; i++) err = Math.max(err, Math.abs(yTime[i] - yFreq[i]));
    $('s6-readout').textContent = t('s6ro', { err: err.toExponential(2) });
    // —— 主图：两条结果叠画 + 输入小图 ——
    const w = cv._w, h = cv._h;
    ctx.clearRect(0, 0, w, h);
    let maxV = 0.001;
    yTime.forEach(v => maxV = Math.max(maxV, Math.abs(v)));
    const padL = 14, padR = 14;
    const outN = yTime.length;
    const X = i => padL + (w - padL - padR) * i / (outN - 1);
    const baseY = h * 0.68, amp = h * 0.52;
    const Y = v => baseY - v / maxV * amp * 0.92;
    ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, baseY); ctx.lineTo(w - padR, baseY); ctx.stroke();
    const plot = (arr, style, lw, dash) => {
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
      ctx.beginPath();
      arr.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
      ctx.stroke(); ctx.setLineDash([]);
    };
    plot(yTime, '#6ee7ff', 2.4);
    plot(yFreq, '#ffb454', 1.6, [6, 4]);
    // 图例
    ctx.font = '13px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const leg = (yy, style, dash, txt) => {
      ctx.strokeStyle = style; ctx.lineWidth = 2.4; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(padL, yy - 4); ctx.lineTo(padL + 26, yy - 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c9d4e2'; ctx.fillText(txt, padL + 34, yy);
    };
    leg(20, '#6ee7ff', null, t('cTime'));
    leg(42, '#ffb454', [6, 4], t('cFreq'));
    // 输入 f / g 小图（底部条带，茎状）
    const stripY = h - 30, stripH = 22;
    const stem = (arr, color, label, x0, x1) => {
      const mx = Math.max(...arr.map(Math.abs), 0.001);
      ctx.strokeStyle = color; ctx.lineWidth = 1.4;
      arr.forEach((v, i) => {
        const x = x0 + (x1 - x0) * i / Math.max(1, arr.length - 1);
        ctx.beginPath(); ctx.moveTo(x, stripY); ctx.lineTo(x, stripY - v / mx * stripH); ctx.stroke();
      });
      ctx.fillStyle = color; ctx.font = '12.5px sans-serif';
      ctx.fillText(label, x0, stripY + 16);
    };
    stem(f, 'rgba(110,231,255,.75)', 'f', padL, w * 0.55);
    stem(g, 'rgba(255,180,84,.85)', 'g', w * 0.62, w - padR);
    // —— 频谱图 ——
    const sw = spCv._w, sh = spCv._h;
    spCtx.clearRect(0, 0, sw, sh);
    spCtx.fillStyle = '#9aa7b8'; spCtx.font = '13px sans-serif'; spCtx.textAlign = 'left';
    spCtx.fillText(t('cSpec'), 14, 18);
    const rows = [
      { a: fr.specF, c: '#6ee7ff', lab: '|F|' },
      { a: fr.specG, c: '#ffb454', lab: '|G|' },
      { a: fr.specP, c: '#ff7a93', lab: '|F·G|' },
    ];
    rows.forEach((row, ri) => {
      const y0 = 34 + ri * 46, bh = 36;
      const mx = Math.max(...row.a, 0.001);
      const bw = (sw - 90) / row.a.length;
      spCtx.fillStyle = row.c;
      row.a.forEach((v, i) => {
        const bhv = v / mx * bh;
        spCtx.fillRect(52 + i * bw, y0 + bh - bhv, Math.max(1, bw - 0.6), bhv);
      });
      spCtx.fillStyle = '#c9d4e2'; spCtx.font = '12.5px sans-serif';
      spCtx.fillText(row.lab, 14, y0 + bh - 12);
    });
  }
  function bindBtns(prefix, names, set) {
    names.forEach(n => $('s6-' + prefix + '-' + n).addEventListener('click', () => {
      set(n);
      names.forEach(m => $('s6-' + prefix + '-' + m).classList.toggle('active', m === n));
      draw();
    }));
  }
  bindBtns('sig', ['rect', 'tri', 'sine', 'steps'], n => sigName = n);
  bindBtns('ker', ['smooth', 'diff', 'echo'], n => kerName = n);
  onLangRefresh(draw);
  onRefit(draw);
  draw();
})();

/* ---------- 全局 resize：重适配全部画布并触发重绘 ---------- */
(function resizeAll() {
  let tm = null;
  window.addEventListener('resize', () => {
    clearTimeout(tm);
    tm = setTimeout(() => {
      allCanvases.forEach(cv => fitCanvas(cv));
      refitHooks.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    }, 140);
  });
})();
