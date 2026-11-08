'use strict';
/* Mandelbrot 分形交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。
   渲染：渐进式分块（低清先行 → 细化），代次计数器可打断；
   颜色与迭代分离——先算平滑逃逸值 ν 存数组，换调色板/着色模式只重上色。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);
const FULL_SPAN = 3.2;               // 全景时实轴宽度（放大倍数的基准）
const HOME = { cx: -0.65, cy: 0, span: FULL_SPAN };

/* ---------- 画布适配（DPR）：沿用傅里叶/卷积页 fitCanvas 方案 ----------
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

/* ---------- 工具 ---------- */
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function fmt(v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
function trimNum(s) { return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
function fmtCoord(v, span) {
  const d = clamp(Math.ceil(-Math.log10(Math.abs(span))) + 2, 2, 15);
  return trimNum(fmt(v, d));
}
function fmtC(x, y, d) {
  const dd = d === undefined ? 4 : d;
  const re = trimNum(fmt(x, dd));
  const im = trimNum(fmt(Math.abs(y), dd));
  return re + (y < 0 ? ' − ' : ' + ') + im + 'i';
}
function fmtZoom(z) {
  if (z < 100) return '×' + trimNum(fmt(z, 1));
  if (z < 10000) return '×' + Math.round(z);
  const e = Math.floor(Math.log10(z));
  return '×' + trimNum(fmt(z / Math.pow(10, e), 2)) + '×10^' + e;
}
function fmtSci(v) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v)));
  return trimNum(fmt(v / Math.pow(10, e), 2)) + '×10^' + e;
}

/* ---------- 核心数学：逃逸迭代 ----------
   Mandelbrot：z₀=0，对 c 迭代 z←z²+c；Julia：c 固定，对 z₀ 迭代同一公式。
   逃逸判据 |z|>2。平滑逃逸值 ν = n + 1 − log₂(ln|zₙ|)（与页面文案一致）。
   返回 {n: 逃逸步数（未逃逸=maxIter）, nu: 平滑值（未逃逸=-1）, inside} */
function escapeRaw(cx, cy, maxIter, julia) {
  let zx, zy, cr, ci;
  if (julia) { zx = cx; zy = cy; cr = julia.x; ci = julia.y; }
  else {
    cr = cx; ci = cy;
    // 主心形体与周期-2 圆盘的解析判内（仅 Mandelbrot，省去大量注定不逃逸的迭代）
    const q = (cx - 0.25) * (cx - 0.25) + cy * cy;
    if (q * (q + (cx - 0.25)) <= 0.25 * cy * cy) return { n: maxIter, nu: -1, inside: true };
    const bx = cx + 1;
    if (bx * bx + cy * cy <= 0.0625) return { n: maxIter, nu: -1, inside: true };
    zx = 0; zy = 0;
  }
  for (let n = 1; n <= maxIter; n++) {
    const nx = zx * zx - zy * zy + cr;
    const ny = 2 * zx * zy + ci;
    zx = nx; zy = ny;
    const m2 = zx * zx + zy * zy;
    if (m2 > 4) {
      const mod = Math.sqrt(m2);
      let nu = n + 1 - Math.log2(Math.log(mod));
      if (!isFinite(nu)) nu = n;
      return { n, nu, inside: false };
    }
  }
  return { n: maxIter, nu: -1, inside: true };
}
function autoMaxIter(span) {
  const d = Math.max(0, Math.log10(FULL_SPAN / span));
  return Math.round(clamp(200 + 160 * d, 200, 3000));
}

/* ---------- 调色板（256 级 LUT） ---------- */
const PALETTES = [
  { // 深空：深蓝 → 青 → 金 → 白
    stops: [[0, [6, 8, 30]], [0.16, [16, 42, 110]], [0.36, [20, 104, 178]], [0.54, [110, 231, 255]], [0.70, [190, 240, 255]], [0.84, [255, 180, 84]], [0.94, [255, 226, 160]], [1, [255, 255, 255]]]
  },
  { // 熔岩：黑 → 暗红 → 橙 → 黄 → 白
    stops: [[0, [8, 0, 0]], [0.22, [110, 8, 0]], [0.45, [214, 66, 0]], [0.66, [252, 140, 24]], [0.82, [255, 206, 92]], [0.93, [255, 238, 180]], [1, [255, 255, 255]]]
  },
  { // 极光：深紫 → 品红 → 青绿 → 浅绿
    stops: [[0, [14, 4, 34]], [0.24, [86, 18, 138]], [0.46, [198, 42, 138]], [0.64, [22, 168, 168]], [0.82, [120, 246, 180]], [0.93, [216, 255, 230]], [1, [246, 255, 250]]]
  }
];
function buildLUT(pal) {
  const lut = new Uint8Array(256 * 3);
  const stops = PALETTES[pal].stops;
  for (let i = 0; i < 256; i++) {
    const p = i / 255;
    let a = stops[0], b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (p >= stops[s][0] && p <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
    }
    const f = (p - a[0]) / Math.max(1e-9, b[0] - a[0]);
    lut[i * 3] = Math.round(a[1][0] + (b[1][0] - a[1][0]) * f);
    lut[i * 3 + 1] = Math.round(a[1][1] + (b[1][1] - a[1][1]) * f);
    lut[i * 3 + 2] = Math.round(a[1][2] + (b[1][2] - a[1][2]) * f);
  }
  return lut;
}
const LUTS = PALETTES.map((_, i) => buildLUT(i));

/* 由 ν 数组上色：mode = 'smooth'（平滑 ν）| 'band'（整数步数 n）| 'bw'（黑白） */
function colorize(nu, nArr, w, h, mode, palIdx) {
  const img = new ImageData(w, h);
  const d = img.data;
  const lut = LUTS[palIdx];
  const total = w * h;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const v = nu[i];
    if (v < 0) { d[o] = 0; d[o + 1] = 0; d[o + 2] = 0; d[o + 3] = 255; continue; }
    if (mode === 'bw') { d[o] = 232; d[o + 1] = 237; d[o + 2] = 244; d[o + 3] = 255; continue; }
    const src = mode === 'band' ? nArr[i] : v;
    let li = Math.floor((src * 8) % 256);
    if (li < 0) li += 256;
    d[o] = lut[li * 3]; d[o + 1] = lut[li * 3 + 1]; d[o + 2] = lut[li * 3 + 2]; d[o + 3] = 255;
  }
  return img;
}

/* ---------- 分形画布：渐进渲染 + 飞入动画 + 叠加层 ---------- */
const PASS_DIVS = [8, 3, 1];
class Fractal {
  constructor(cv, opts) {
    this.cv = cv;
    this.ctx = fitCanvas(cv);
    this.cx = opts.cx; this.cy = opts.cy; this.span = opts.span;
    this.julia = opts.julia || null;
    this.fixedIter = opts.fixedIter || 0;
    this.mode = opts.mode || 'smooth';
    this.palette = opts.palette || 0;
    this.onAfterDraw = opts.onAfterDraw || null;
    this.onRenderDone = opts.onRenderDone || null;
    this.onViewChange = opts.onViewChange || null;
    this.gen = 0;
    this.started = false;
    this.rendered = false;
    this.flying = false;
    this.nu = null; this.nArr = null; this.dataW = 0; this.dataH = 0;
    this.usedIter = 0;
    this.off = document.createElement('canvas');
    this.off.width = 8; this.off.height = 8;
  }
  imSpan() { return this.span * (this.cv._h / this.cv._w); }
  toComplex(px, py) {
    const is = this.imSpan();
    return [this.cx - this.span / 2 + (px / this.cv._w) * this.span,
            this.cy + is / 2 - (py / this.cv._h) * is];
  }
  toPx(x, y) {
    const is = this.imSpan();
    return [(x - (this.cx - this.span / 2)) / this.span * this.cv._w,
            (this.cy + is / 2 - y) / is * this.cv._h];
  }
  maxIter() { return this.fixedIter > 0 ? this.fixedIter : autoMaxIter(this.span); }
  zoom() { return FULL_SPAN / this.span; }
  pixelScale() { return this.span / (this.dataW || this.cv._w); }
  bufSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let bw = Math.max(60, Math.round(this.cv._w * dpr));
    let bh = Math.max(40, Math.round(this.cv._h * dpr));
    const MAXPX = 1500000;
    if (bw * bh > MAXPX) { const s = Math.sqrt(MAXPX / (bw * bh)); bw = Math.round(bw * s); bh = Math.round(bh * s); }
    return [bw, bh];
  }
  setView(cx, cy, span, renderNow) {
    this.cx = cx; this.cy = cy; this.span = span;
    if (this.onViewChange) this.onViewChange();
    if (renderNow !== false) this.render();
  }
  render() {
    const gen = ++this.gen;
    this.started = true;
    const [BW, BH] = this.bufSize();
    const maxIter = this.maxIter();
    this.usedIter = maxIter;
    if (this.onViewChange) this.onViewChange();
    let pass = 0;
    const doPass = () => {
      if (gen !== this.gen) return;
      const div = PASS_DIVS[pass];
      const w = Math.max(24, Math.round(BW / div));
      const h = Math.max(18, Math.round(BH / div));
      this.computeChunked(w, h, maxIter, gen, (nu, nArr) => {
        if (gen !== this.gen) return;
        if (div === 1) {
          this.nu = nu; this.nArr = nArr; this.dataW = w; this.dataH = h; this.rendered = true;
        }
        this.paint(nu, nArr, w, h);
        this.draw();
        pass++;
        if (pass < PASS_DIVS.length) doPass();
        else if (this.onRenderDone) this.onRenderDone();
      });
    };
    doPass();
  }
  computeChunked(w, h, maxIter, gen, done) {
    const nu = new Float32Array(w * h);
    const nn = new Uint16Array(w * h);
    const span = this.span, ispan = span * (this.cv._h / this.cv._w);
    const x0 = this.cx - span / 2, yTop = this.cy + ispan / 2;
    const dx = span / w, dy = ispan / h;
    const julia = this.julia;
    let row = 0;
    const step = () => {
      if (gen !== this.gen) return;
      const t0 = performance.now();
      while (row < h && performance.now() - t0 < 26) {
        const cy = yTop - (row + 0.5) * dy;
        let idx = row * w;
        for (let i = 0; i < w; i++, idx++) {
          const r = escapeRaw(x0 + (i + 0.5) * dx, cy, maxIter, julia);
          nu[idx] = r.nu; nn[idx] = r.n;
        }
        row++;
      }
      if (row < h) setTimeout(step, 0);
      else done(nu, nn);
    };
    step();
  }
  paint(nu, nArr, w, h) {
    if (this.off.width !== w) this.off.width = w;
    if (this.off.height !== h) this.off.height = h;
    this.off.getContext('2d').putImageData(colorize(nu, nArr, w, h, this.mode, this.palette), 0, 0);
  }
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.cv._w, this.cv._h);
    if (this.off.width > 8) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.off, 0, 0, this.cv._w, this.cv._h);
    }
    if (this.onAfterDraw) this.onAfterDraw(ctx);
  }
  recolor() {
    if (!this.rendered || !this.nu) return;
    this.paint(this.nu, this.nArr, this.dataW, this.dataH);
    this.draw();
  }
  /* 把某个视图的整幅图（snap 画布）按当前视图对齐画出——飞入动画与轮廓叠加共用 */
  drawStretched(snap, sv) {
    const ctx = this.ctx, W = this.cv._w, H = this.cv._h;
    const isV = this.imSpan(), isS = sv.span * (H / W);
    const vx0 = this.cx - this.span / 2, vx1 = this.cx + this.span / 2;
    const vyT = this.cy + isV / 2, vyB = this.cy - isV / 2;
    let sx0 = (vx0 - (sv.cx - sv.span / 2)) / sv.span * snap.width;
    let sx1 = (vx1 - (sv.cx - sv.span / 2)) / sv.span * snap.width;
    let sy0 = ((sv.cy + isS / 2) - vyT) / isS * snap.height;
    let sy1 = ((sv.cy + isS / 2) - vyB) / isS * snap.height;
    let dx0 = 0, dy0 = 0, dx1 = W, dy1 = H;
    if (sx0 < 0) { dx0 = (0 - sx0) / (sx1 - sx0) * W; sx0 = 0; }
    if (sx1 > snap.width) { dx1 = W - (sx1 - snap.width) / (sx1 - sx0) * W; sx1 = snap.width; }
    if (sy0 < 0) { dy0 = (0 - sy0) / (sy1 - sy0) * H; sy0 = 0; }
    if (sy1 > snap.height) { dy1 = H - (sy1 - snap.height) / (sy1 - sy0) * H; sy1 = snap.height; }
    if (sx1 - sx0 < 1 || sy1 - sy0 < 1) return;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(snap, sx0, sy0, sx1 - sx0, sy1 - sy0, dx0, dy0, dx1 - dx0, dy1 - dy0);
  }
  flyTo(tx, ty, tspan, dur) {
    dur = dur || 1100;
    if (this.off.width <= 8) { this.setView(tx, ty, tspan); return; }
    const gen = ++this.gen;
    this.flying = true;
    const from = { cx: this.cx, cy: this.cy, span: this.span };
    const snap = document.createElement('canvas');
    snap.width = this.off.width; snap.height = this.off.height;
    snap.getContext('2d').drawImage(this.off, 0, 0);
    const t0 = performance.now();
    const frame = now => {
      if (gen !== this.gen) { this.flying = false; return; }
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      this.cx = from.cx + (tx - from.cx) * e;
      this.cy = from.cy + (ty - from.cy) * e;
      this.span = from.span * Math.pow(tspan / from.span, e);
      const ctx = this.ctx;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.cv._w, this.cv._h);
      this.drawStretched(snap, from);
      if (this.onAfterDraw) this.onAfterDraw(ctx);
      if (this.onViewChange) this.onViewChange();
      if (k < 1) requestAnimationFrame(frame);
      else { this.flying = false; this.render(); }
    };
    requestAnimationFrame(frame);
  }
}

/* 拖框 / 滚轮 / 双击缩放（第 0、4 步共用） */
function attachZoom(fr, onChange) {
  const cv = fr.cv;
  let drag = null;
  const pos = e => {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  cv.addEventListener('pointerdown', e => {
    if (fr.flying) return;
    cv.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    drag = { x0: x, y0: y, x1: x, y1: y };
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const [x, y] = pos(e);
    drag.x1 = x; drag.y1 = y;
    fr.draw();
    const ctx = fr.ctx;
    const rx = Math.min(drag.x0, drag.x1), ry = Math.min(drag.y0, drag.y1);
    const rw = Math.abs(drag.x1 - drag.x0), rh = Math.abs(drag.y1 - drag.y0);
    ctx.fillStyle = 'rgba(110,231,255,0.13)';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#6ee7ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, ry, rw, rh);
  });
  cv.addEventListener('pointerup', e => {
    if (!drag) return;
    const d = drag; drag = null;
    const rw = Math.abs(d.x1 - d.x0), rh = Math.abs(d.y1 - d.y0);
    if (rw < 14 || rh < 10) { fr.draw(); return; }
    // 选中矩形 → 新视图（按画布宽高比扩到不变形）
    const [ax, ay] = fr.toComplex(Math.min(d.x0, d.x1), Math.min(d.y0, d.y1));
    const [bx, by] = fr.toComplex(Math.max(d.x0, d.x1), Math.max(d.y0, d.y1));
    let span = bx - ax;
    const ispanNeed = (ay - by);
    const aspect = fr.cv._h / fr.cv._w;
    if (ispanNeed / aspect > span) span = ispanNeed / aspect;
    span = clamp(span, 1e-15, FULL_SPAN * 1.3);
    fr.setView((ax + bx) / 2, (ay + by) / 2, span);
    if (onChange) onChange();
  });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    if (fr.flying) return;
    const [mx, my] = pos(e);
    const factor = e.deltaY < 0 ? 0.76 : 1.32;
    const span = clamp(fr.span * factor, 1e-15, FULL_SPAN * 1.3);
    if (span === fr.span) return;
    const [rx, ry] = fr.toComplex(mx, my);
    const ncx = rx - (mx / fr.cv._w - 0.5) * span;
    const ncy = ry + (my / fr.cv._h - 0.5) * (span * fr.cv._h / fr.cv._w);
    fr.setView(ncx, ncy, span);
    if (onChange) onChange();
  }, { passive: false });
  cv.addEventListener('dblclick', e => {
    if (fr.flying) return;
    const [mx, my] = pos(e);
    const [rx, ry] = fr.toComplex(mx, my);
    fr.setView(rx, ry, clamp(fr.span * 0.35, 1e-15, FULL_SPAN * 1.3));
    if (onChange) onChange();
  });
}

/* 步骤首次进入视口才开始渲染（省首屏开销） */
const lazyStarters = [];
function lazyStart(sectionId, fn) {
  const el = $(sectionId);
  let done = false;
  const check = () => { if (!done && visibleSet.has(el)) { done = true; fn(); } };
  lazyStarters.push(check);
  io.observe(el);
  animate(el, () => check());
}

/* ================= 第 0 步：钩子 ================= */
const s0time = { t0: performance.now(), done: 0 };
const fr0 = new Fractal($('s0-canvas'), {
  cx: HOME.cx, cy: HOME.cy, span: HOME.span,
  onRenderDone: () => { if (!s0time.done) s0time.done = performance.now(); updateS0Readout(); },
  onViewChange: updateS0Readout
});
$('s0-canvas').classList.add('fractal');
function updateS0Readout() {
  $('s0-readout').innerHTML = t('s0ro', {
    zoom: fmtZoom(fr0.zoom()),
    cx: fmtCoord(fr0.cx, fr0.span), cy: fmtCoord(fr0.cy, fr0.span),
    iter: fr0.usedIter || fr0.maxIter()
  });
}
attachZoom(fr0, updateS0Readout);
$('s0-reset').addEventListener('click', () => { fr0.flyTo(HOME.cx, HOME.cy, HOME.span, 800); });
$('s0-start').addEventListener('click', () => { $('step1').scrollIntoView({ behavior: 'smooth' }); });
onLangRefresh(() => { fr0.draw(); updateS0Readout(); });

/* ================= 第 1 步：一个点的一生 ================= */
const s1 = {
  cv: $('s1-canvas'),
  cx: 0.5, cy: 0.5,
  orbit: [],        // [[x,y],...] 从 z₀=0 开始
  shown: 1,         // 已画出的点数（orbit 前 shown 个）
  state: 'idle',    // idle | running | escaped | stayed | cycle
  playing: false,
  playT: 0,
  view: { cx: 0.2, cy: 0, span: 8.4 }
};
s1.ctx = fitCanvas(s1.cv);
s1.cv.classList.add('orbit');
function s1ImSpan() { return s1.view.span * (s1.cv._h / s1.cv._w); }
function s1ToPx(x, y) {
  const is = s1ImSpan();
  return [(x - (s1.view.cx - s1.view.span / 2)) / s1.view.span * s1.cv._w,
          (s1.view.cy + is / 2 - y) / is * s1.cv._h];
}
function s1ToComplex(px, py) {
  const is = s1ImSpan();
  return [s1.view.cx - s1.view.span / 2 + (px / s1.cv._w) * s1.view.span,
          s1.view.cy + is / 2 - (py / s1.cv._h) * is];
}
function s1ComputeOrbit() {
  const pts = [[0, 0]];
  let x = 0, y = 0, state = 'stayed';
  for (let n = 1; n <= 80; n++) {
    const nx = x * x - y * y + s1.cx, ny = 2 * x * y + s1.cy;
    x = nx; y = ny;
    pts.push([x, y]);
    if (x * x + y * y > 4) { state = 'escaped'; break; }
    // 周期检测：与先前某点几乎重合
    let cyc = false;
    for (let k = 0; k < pts.length - 1; k++) {
      if (Math.abs(pts[k][0] - x) < 1e-9 && Math.abs(pts[k][1] - y) < 1e-9) { cyc = true; break; }
    }
    if (cyc) { state = 'cycle'; break; }
  }
  s1.orbit = pts;
  s1.finalState = state;
  s1.shown = 1;
  s1.state = 'running';
  s1.playing = false;
  $('s1-play').textContent = t('s1play');
}
function s1Draw() {
  const ctx = s1.ctx, W = s1.cv._w, H = s1.cv._h;
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);
  // 网格（每 1 单位）
  ctx.strokeStyle = 'rgba(110,140,180,0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = -4; gx <= 4; gx++) { const [px] = s1ToPx(gx, 0); ctx.moveTo(px, 0); ctx.lineTo(px, H); }
  const is = s1ImSpan();
  for (let gy = Math.ceil(s1.view.cy - is / 2); gy <= s1.view.cy + is / 2; gy++) { const [, py] = s1ToPx(0, gy); ctx.moveTo(0, py); ctx.lineTo(W, py); }
  ctx.stroke();
  // 坐标轴
  const [ox, oy] = s1ToPx(0, 0);
  ctx.strokeStyle = 'rgba(200,215,235,0.35)';
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();
  // 逃逸圆
  const [ccx, ccy] = s1ToPx(0, 0);
  const rPx = 2 / s1.view.span * W;
  ctx.strokeStyle = '#ffb454';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.arc(ccx, ccy, rPx, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  ctx.font = '13px sans-serif';
  const [lx, ly] = s1ToPx(2 * Math.SQRT1_2, 2 * Math.SQRT1_2);
  ctx.fillText(t('cEscCircle'), lx + 8, ly - 8);
  // 轨道
  const pts = s1.orbit.slice(0, s1.shown);
  if (pts.length > 1) {
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = s1ToPx(pts[i - 1][0], pts[i - 1][1]);
      const [x2, y2] = s1ToPx(pts[i][0], pts[i][1]);
      const escapedSeg = (pts[i][0] * pts[i][0] + pts[i][1] * pts[i][1] > 4);
      ctx.strokeStyle = escapedSeg ? '#ff7a93' : '#6ee7ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  }
  pts.forEach((p, i) => {
    const [px, py] = s1ToPx(p[0], p[1]);
    ctx.fillStyle = i === pts.length - 1 ? '#fff' : '#6ee7ff';
    ctx.beginPath(); ctx.arc(px, py, i === pts.length - 1 ? 4.5 : 3.2, 0, TAU); ctx.fill();
  });
  // c 标记
  const [mx, my] = s1ToPx(s1.cx, s1.cy);
  ctx.strokeStyle = '#ffb454';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx - 7, my); ctx.lineTo(mx + 7, my);
  ctx.moveTo(mx, my - 7); ctx.lineTo(mx, my + 7);
  ctx.stroke();
  ctx.fillStyle = '#ffb454';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(t('cPointC') + ' = ' + fmtC(s1.cx, s1.cy, 3), mx + 10, my + 18);
}
function s1Readout() {
  const n = s1.shown - 1;
  const p = s1.orbit[s1.shown - 1] || [0, 0];
  const mod = Math.hypot(p[0], p[1]);
  let html = t('s1roC', { c: fmtC(s1.cx, s1.cy) }) + '<br>';
  if (n === 0) html += t('s1roStep', { n: 0, z: '0', mod: '0' });
  else if (s1.state === 'done' && s1.finalState === 'escaped')
    html += t('s1roEsc', { n, z: fmtC(p[0], p[1], 3), mod: fmt(mod, 2) });
  else if (s1.state === 'done' && s1.finalState === 'cycle')
    html += t('s1roCycle', { n, z: fmtC(p[0], p[1], 3), mod: fmt(mod, 2) });
  else if (s1.state === 'done')
    html += t('s1roStay', { n, mod: fmt(mod, 2) });
  else
    html += t('s1roStep', { n, z: fmtC(p[0], p[1], 3), mod: fmt(mod, 2) });
  $('s1-readout').innerHTML = html;
}
function s1Advance(count) {
  const step = count || 1;
  if (s1.shown < s1.orbit.length) {
    // 多步推进时中间点也全部真实存在于 orbit 并会被 s1Draw 画出，读数对应推进到的真实步数
    s1.shown = Math.min(s1.shown + step, s1.orbit.length);
    if (s1.shown >= s1.orbit.length) { s1.state = 'done'; s1.playing = false; $('s1-play').textContent = t('s1play'); }
  }
  s1Draw(); s1Readout();
}
$('s1-step').addEventListener('click', () => { s1.playing = false; $('s1-play').textContent = t('s1play'); s1Advance(); });
$('s1-play').addEventListener('click', () => {
  if (s1.state === 'done') s1ComputeOrbit();
  s1.playing = !s1.playing;
  s1.playT = 0;
  $('s1-play').textContent = s1.playing ? t('s1pause') : t('s1play');
});
$('s1-reset').addEventListener('click', () => { s1ComputeOrbit(); s1Draw(); s1Readout(); });
function s1SetC(x, y) {
  s1.cx = clamp(x, -3.2, 3.2); s1.cy = clamp(y, -3.2, 3.2);
  s1ComputeOrbit(); s1Draw(); s1Readout();
}
$('s1-p-esc').addEventListener('click', () => s1SetC(0.5, 0.5));
$('s1-p-stay').addEventListener('click', () => s1SetC(0.1, 0.6));
$('s1-p-cycle').addEventListener('click', () => s1SetC(0, 1));
(function s1Pointer() {
  let dragging = false;
  const pos = e => { const r = s1.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  s1.cv.addEventListener('pointerdown', e => {
    dragging = true; s1.cv.setPointerCapture(e.pointerId);
    const [px, py] = pos(e); const [x, y] = s1ToComplex(px, py); s1SetC(x, y);
  });
  s1.cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    const [px, py] = pos(e); const [x, y] = s1ToComplex(px, py); s1SetC(x, y);
  });
  s1.cv.addEventListener('pointerup', () => { dragging = false; });
})();
animate($('step1'), dt => {
  if (!s1.playing) return;
  s1.playT += dt;
  // 分段加速：前段慢速看清轨道成形，步数越大每帧推进越多（80 步「留下」判决约 9–10s 到达）
  const n = s1.shown - 1;
  const interval = n < 10 ? 0.45 : n < 30 ? 0.28 : 0.2;
  const steps = n < 10 ? 1 : n < 30 ? 2 : 5;
  if (s1.playT > interval) { s1.playT = 0; s1Advance(steps); }
});
onLangRefresh(() => { s1Draw(); s1Readout(); $('s1-play').textContent = s1.playing ? t('s1pause') : t('s1play'); });

/* ================= 第 2 步：分界线 ================= */
const fr2 = new Fractal($('s2-canvas'), {
  cx: HOME.cx, cy: HOME.cy, span: HOME.span, fixedIter: 100,
  onRenderDone: updateS2Readout
});
$('s2-canvas').classList.add('fractal');
function updateS2Readout() {
  let pct = '—';
  if (fr2.rendered && fr2.nu) {
    let inside = 0;
    for (let i = 0; i < fr2.nu.length; i++) if (fr2.nu[i] < 0) inside++;
    pct = fmt(inside / fr2.nu.length * 100, 1);
  }
  $('s2-readout').innerHTML = t('s2ro', { iter: fr2.fixedIter, pct });
}
let s2Timer = 0;
$('s2-iter').addEventListener('input', e => {
  const v = parseInt(e.target.value, 10);
  $('s2-iter-val').textContent = v;
  clearTimeout(s2Timer);
  s2Timer = setTimeout(() => { fr2.fixedIter = v; fr2.render(); }, 110);
});
/* 示意图：c = 0.8 的 |z| 雪球（数据现场算，不写死） */
const s2diag = { cv: $('s2-diag') };
s2diag.ctx = fitCanvas(s2diag.cv);
function s2DrawDiag() {
  const ctx = s2diag.ctx, W = s2diag.cv._w, H = s2diag.cv._h;
  ctx.fillStyle = '#1c2330';
  ctx.fillRect(0, 0, W, H);
  // 现场迭代 c=0.8，收集 |z| 直到 >60
  const vals = [];
  let x = 0, y = 0;
  for (let n = 1; n <= 8; n++) {
    const nx = x * x - y * y + 0.8, ny = 2 * x * y;
    x = nx; y = ny;
    const m = Math.hypot(x, y);
    vals.push(m);
    if (m > 60) break;
  }
  const padL = 58, padR = 76, top = 16, rowH = (H - top - 14) / vals.length;
  const lo = Math.log10(0.5), hi = Math.log10(90);
  const X = v => padL + (Math.log10(Math.max(v, 0.5)) - lo) / (hi - lo) * (W - padL - padR);
  // 逃逸线
  ctx.strokeStyle = '#ff7a93';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(X(2), 6); ctx.lineTo(X(2), H - 8); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff7a93';
  ctx.font = '12.5px sans-serif';
  ctx.fillText(t('cWall'), X(2) + 6, 18);
  vals.forEach((v, i) => {
    const y0 = top + i * rowH;
    const bh = Math.min(17, rowH - 6);
    const clipped = v > 90;
    ctx.fillStyle = v > 2 ? '#ff7a93' : '#6ee7ff';
    ctx.fillRect(padL, y0, Math.max(2, X(Math.min(v, 90)) - padL), bh);
    ctx.fillStyle = '#9aa7b8';
    ctx.font = '12.5px sans-serif';
    ctx.fillText('n=' + (i + 1), 12, y0 + bh - 3);
    ctx.fillStyle = '#e8edf4';
    ctx.fillText('|z| = ' + (v >= 10 ? fmt(v, 1) : fmt(v, 2)) + (clipped ? ' »' : ''), X(Math.min(v, 90)) + 8, y0 + bh - 3);
  });
}
onLangRefresh(() => { fr2.recolor(); updateS2Readout(); s2DrawDiag(); });

/* ================= 第 3 步：颜色从哪来 ================= */
const fr3 = new Fractal($('s3-canvas'), {
  cx: -0.7429, cy: 0.1313, span: 0.0052, fixedIter: 500
});
$('s3-canvas').classList.add('fractal');
const S3_MODE_KEYS = { bw: 's3bw', band: 's3band', smooth: 's3smooth' };
function updateS3Readout() {
  $('s3-readout').innerHTML = t('s3ro', {
    mode: t(S3_MODE_KEYS[fr3.mode]),
    pal: t('pal' + fr3.palette)
  });
}
function s3SetMode(m) {
  fr3.mode = m;
  ['bw', 'band', 'smooth'].forEach(k => $('s3-mode-' + k).classList.toggle('active', k === m));
  fr3.recolor();
  updateS3Readout();
}
function s3SetPal(p) {
  fr3.palette = p;
  [0, 1, 2].forEach(k => $('s3-pal-' + k).classList.toggle('active', k === p));
  fr3.recolor();
  updateS3Readout();
}
$('s3-mode-bw').addEventListener('click', () => s3SetMode('bw'));
$('s3-mode-band').addEventListener('click', () => s3SetMode('band'));
$('s3-mode-smooth').addEventListener('click', () => s3SetMode('smooth'));
$('s3-pal-0').addEventListener('click', () => s3SetPal(0));
$('s3-pal-1').addEventListener('click', () => s3SetPal(1));
$('s3-pal-2').addEventListener('click', () => s3SetPal(2));
onLangRefresh(() => { fr3.recolor(); updateS3Readout(); });

/* ================= 第 4 步：往里钻 ================= */
/* 书签坐标：开发期逐个真实渲染验证构图后定版（见 report.md 的验证记录） */
const BOOKMARKS = [
  { cx: -0.7429, cy: 0.1313, span: 0.0052 },       // 海马谷（实测：双螺旋居中）
  { cx: 0.27, cy: 0.004, span: 0.05 },             // 象谷（实测：尖点山谷 + 两侧象鼻卷）
  { cx: -0.1609, cy: 0.6495, span: 0.015 },        // 顶部螺旋（实测：心形体上沿的螺旋链）
  { cx: -0.23463, cy: 0.82607, span: 0.0048 }      // 迷你布罗特（实测：完整小号全图轮廓）
];
const fr4 = new Fractal($('s4-canvas'), {
  cx: HOME.cx, cy: HOME.cy, span: HOME.span,
  onViewChange: updateS4Readout, onRenderDone: updateS4Readout
});
$('s4-canvas').classList.add('fractal');
function updateS4Readout() {
  $('s4-readout').innerHTML = t('s4ro', {
    zoom: fmtZoom(fr4.zoom()),
    cx: fmtCoord(fr4.cx, fr4.span), cy: fmtCoord(fr4.cy, fr4.span),
    pix: fmtSci(fr4.pixelScale()),
    iter: fr4.usedIter || fr4.maxIter()
  });
  $('s4-warn').classList.toggle('hidden', fr4.zoom() < 1e12);
}
function s4ClearActive() { BOOKMARKS.forEach((_, i) => $('s4-bm-' + i).classList.remove('active')); }
BOOKMARKS.forEach((b, i) => {
  $('s4-bm-' + i).addEventListener('click', () => {
    s4ClearActive();
    $('s4-bm-' + i).classList.add('active');
    fr4.flyTo(b.cx, b.cy, b.span, 1200);
  });
});
$('s4-reset').addEventListener('click', () => { s4ClearActive(); fr4.flyTo(HOME.cx, HOME.cy, HOME.span, 900); });
attachZoom(fr4, () => { s4ClearActive(); updateS4Readout(); });
onLangRefresh(() => { fr4.draw(); updateS4Readout(); });

/* ================= 第 5 步：迷你布罗特 ================= */
const S5_MINI = { cx: -0.23463, cy: 0.82607, span: 0.0042 };   // 实测：mini 全轮廓（心形体+周期-2 圆盘+触须）
const S5_DEEP = { cx: -0.23345, cy: 0.82602, span: 0.0006 };      // 实测：mini 尖点外的螺旋丝丛
let s5Where = 'mini';
let s5OverlayOn = false;
let s5Silhouette = null; // 整图轮廓（由 inset 的 ν 数据生成）
const fr5Inset = new Fractal($('s5-inset'), {
  cx: HOME.cx, cy: HOME.cy, span: HOME.span, fixedIter: 120,
  onRenderDone: () => { buildS5Silhouette(); fr5Inset.draw(); }
});
$('s5-inset').classList.add('fractal');
fr5Inset.onAfterDraw = ctx => {
  // 在整图上标出小岛的位置框（小岛在全图里不到 2px，先描深色底再描亮虚线，并放大到可辨认）
  const [x0, y0] = fr5Inset.toPx(S5_MINI.cx - S5_MINI.span / 2, S5_MINI.cy + S5_MINI.span * (fr5Inset.cv._h / fr5Inset.cv._w) / 2);
  const [x1, y1] = fr5Inset.toPx(S5_MINI.cx + S5_MINI.span / 2, S5_MINI.cy - S5_MINI.span * (fr5Inset.cv._h / fr5Inset.cv._w) / 2);
  const bx = Math.min(x0, x1), by = Math.min(y0, y1);
  const bw = Math.max(20, Math.abs(x1 - x0)), bh = Math.max(16, Math.abs(y1 - y0));
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(bx - bw / 2 + Math.abs(x1 - x0) / 2, by - bh / 2 + Math.abs(y1 - y0) / 2, bw, bh);
  ctx.strokeStyle = '#ff7a93';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(bx - bw / 2 + Math.abs(x1 - x0) / 2, by - bh / 2 + Math.abs(y1 - y0) / 2, bw, bh);
  ctx.setLineDash([]);
};
function buildS5Silhouette() {
  if (!fr5Inset.nu) return;
  const w = fr5Inset.dataW, h = fr5Inset.dataH;
  s5Silhouette = document.createElement('canvas');
  s5Silhouette.width = w; s5Silhouette.height = h;
  const sctx = s5Silhouette.getContext('2d');
  const img = sctx.createImageData(w, h);
  // 只描轮廓：集内点且四邻域里有集外点（或出界）才上色——叠上去是一条轮廓线而非实心色块
  const inside = i => fr5Inset.nu[i] < 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!inside(i)) continue;
      const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1 ||
        !inside(i - 1) || !inside(i + 1) || !inside(i - w) || !inside(i + w);
      if (edge) {
        img.data[i * 4] = 110; img.data[i * 4 + 1] = 231; img.data[i * 4 + 2] = 255;
        img.data[i * 4 + 3] = 235;
      }
    }
  }
  sctx.putImageData(img, 0, 0);
}
const fr5 = new Fractal($('s5-canvas'), {
  cx: S5_MINI.cx, cy: S5_MINI.cy, span: S5_MINI.span,
  onViewChange: updateS5Readout, onRenderDone: updateS5Readout
});
$('s5-canvas').classList.add('fractal');
fr5.onAfterDraw = ctx => {
  if (!s5OverlayOn || !s5Silhouette) return;
  // 把「整图」的轮廓按迷你布罗特在当前视图中的位置框缩放叠上来——
  // 在小图全景视图下它正好盖满小图，可以直接对比两者轮廓像不像。
  const [x0, y0] = fr5.toPx(S5_MINI.cx - S5_MINI.span / 2, S5_MINI.cy + S5_MINI.span * (fr5.cv._h / fr5.cv._w) / 2);
  const [x1, y1] = fr5.toPx(S5_MINI.cx + S5_MINI.span / 2, S5_MINI.cy - S5_MINI.span * (fr5.cv._h / fr5.cv._w) / 2);
  const rx = Math.min(x0, x1), ry = Math.min(y0, y1);
  const rw = Math.abs(x1 - x0), rh = Math.abs(y1 - y0);
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(s5Silhouette, rx, ry, rw, rh);
  ctx.restore();
  ctx.strokeStyle = '#ff7a93';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(rx, ry, rw, rh);
  ctx.setLineDash([]);
};
function updateS5Readout() {
  $('s5-readout').innerHTML = t('s5ro', {
    where: t('s5where' + (s5Where === 'mini' ? 'Mini' : s5Where === 'deep' ? 'Deep' : 'Home')),
    zoom: fmtZoom(fr5.zoom()),
    pix: fmtSci(fr5.pixelScale())
  });
}
function s5SetActive(id) {
  ['s5-mini', 's5-drill', 's5-home'].forEach(k => $(k).classList.toggle('active', k === id));
}
$('s5-mini').addEventListener('click', () => { s5Where = 'mini'; s5SetActive('s5-mini'); fr5.flyTo(S5_MINI.cx, S5_MINI.cy, S5_MINI.span, 1000); });
$('s5-drill').addEventListener('click', () => { s5Where = 'deep'; s5SetActive('s5-drill'); fr5.flyTo(S5_DEEP.cx, S5_DEEP.cy, S5_DEEP.span, 1100); });
$('s5-home').addEventListener('click', () => { s5Where = 'home'; s5SetActive('s5-home'); fr5.flyTo(HOME.cx, HOME.cy, HOME.span, 1000); });
$('s5-overlay').addEventListener('click', () => {
  s5OverlayOn = !s5OverlayOn;
  $('s5-overlay').classList.toggle('active', s5OverlayOn);
  fr5.draw();
});
attachZoom(fr5, updateS5Readout);
onLangRefresh(() => { fr5Inset.recolor(); fr5.recolor(); updateS5Readout(); });

/* ================= 第 6 步：朱利亚集 ================= */
const s6 = { cx: -0.123, cy: 0.745 };
const fr6L = new Fractal($('s6-left'), {
  cx: HOME.cx, cy: HOME.cy, span: HOME.span, fixedIter: 300
});
$('s6-left').classList.add('fractal');
const fr6R = new Fractal($('s6-right'), {
  cx: 0, cy: 0, span: 3.4, fixedIter: 260,
  julia: { x: s6.cx, y: s6.cy }
});
$('s6-right').classList.add('fractal');
fr6L.onAfterDraw = ctx => {
  const [px, py] = fr6L.toPx(s6.cx, s6.cy);
  ctx.strokeStyle = '#ffb454';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(px - 11, py); ctx.lineTo(px + 11, py);
  ctx.moveTo(px, py - 11); ctx.lineTo(px, py + 11);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#ffb454';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('c', px + 10, py - 8);
};
function s6Update() {
  fr6R.julia = { x: s6.cx, y: s6.cy };
  fr6R.render();
  fr6L.draw();
  const fate = escapeRaw(s6.cx, s6.cy, 1000, null);
  const key = fate.inside ? 's6roIn' : 's6roOut';
  $('s6-readout').innerHTML = t(key, { c: fmtC(s6.cx, s6.cy) }) + ' ' + t('s6roTest', { iter: 1000 });
}
(function s6Pointer() {
  let dragging = false;
  const apply = e => {
    const r = fr6L.cv.getBoundingClientRect();
    const [x, y] = fr6L.toComplex(e.clientX - r.left, e.clientY - r.top);
    s6.cx = clamp(x, -2.4, 1.2); s6.cy = clamp(y, -1.6, 1.6);
    s6Update();
  };
  fr6L.cv.addEventListener('pointerdown', e => { dragging = true; fr6L.cv.setPointerCapture(e.pointerId); apply(e); });
  fr6L.cv.addEventListener('pointermove', e => { if (dragging) apply(e); });
  fr6L.cv.addEventListener('pointerup', () => { dragging = false; });
})();
const S6_PRESETS = [[-0.123, 0.745], [-0.8, 0.156], [0.5, 0.5]];
S6_PRESETS.forEach((p, i) => {
  $('s6-j-' + i).addEventListener('click', () => { s6.cx = p[0]; s6.cy = p[1]; s6Update(); });
});
onLangRefresh(() => { fr6L.recolor(); fr6R.recolor(); s6Update(); });

/* ================= 全局接线 ================= */
lazyStart('step0', () => fr0.render());
lazyStart('step1', () => { s1ComputeOrbit(); s1Draw(); s1Readout(); });
lazyStart('step2', () => { fr2.render(); s2DrawDiag(); });
lazyStart('step3', () => { fr3.render(); updateS3Readout(); });
lazyStart('step4', () => { fr4.render(); updateS4Readout(); });
lazyStart('step5', () => { fr5Inset.render(); fr5.render(); updateS5Readout(); });
lazyStart('step6', () => { fr6L.render(); fr6R.render(); s6Update(); });

/* resize：仅宽度变化时重排（移动端滚动地址栏高度变化不触发重渲染） */
let lastWinW = window.innerWidth;
let resizeTimer = 0;
window.addEventListener('resize', () => {
  if (window.innerWidth === lastWinW) return;
  lastWinW = window.innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    allCanvases.forEach(cv => fitCanvas(cv));
    [fr0, fr2, fr3, fr4, fr5Inset, fr5, fr6L, fr6R].forEach(fr => { if (fr.started) fr.render(); });
    if (s1.orbit.length) { s1Draw(); }
    s2DrawDiag();
  }, 220);
});

/* 初始化（语言已由 i18n.js 在 DOMContentLoaded 先行应用；这里补画布登记与静态绘制） */
ctxOf('s0-canvas'); ctxOf('s2-canvas'); ctxOf('s3-canvas'); ctxOf('s4-canvas');
ctxOf('s5-inset'); ctxOf('s5-canvas'); ctxOf('s6-left'); ctxOf('s6-right');
/* 注：s1/s2-diag 的 ctx 已在各自模块里 fitCanvas 登记，补进 allCanvases 供 resize 统一处理 */
allCanvases.push(s1.cv, s2diag.cv);
s1ComputeOrbit(); s1Draw(); s1Readout();
updateS0Readout(); updateS4Readout(); updateS5Readout();

/* 调试/自测钩子（无副作用，供 Playwright 复核坐标与读数） */
window.MB = {
  escapeRaw, autoMaxIter, FULL_SPAN, HOME, BOOKMARKS, S5_MINI, S5_DEEP, S6_PRESETS,
  fr: { fr0, fr2, fr3, fr4, fr5Inset, fr5, fr6L, fr6R },
  s1, s6, s0time,
  setS4(cx, cy, span) { fr4.setView(cx, cy, span); },
  setS5(cx, cy, span) { fr5.setView(cx, cy, span); },
  setS3(cx, cy, span) { fr3.cx = cx; fr3.cy = cy; fr3.span = span; fr3.render(); }
};
