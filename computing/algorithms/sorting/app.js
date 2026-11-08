'use strict';
/* ================================================================
   排序与大 O 讲解页 — 增长的形状
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   计数口径与全部约定（评审对账用，与 window.SORTING 导出同源）：
   - RNG：mulberry32（与站内各页同规格）。genPermutation(n, seed)：
     [1..n] 经 Fisher–Yates 洗牌（i 从 n−1 递减，j = floor(rng()·(i+1))）。
     genNearly：有序数组上做 max(2, round(n/8)) 次随机两点交换（同一支 rng）。
     genBounded(n, k, seed)：n 个 floor(rng()·(k+1))。
   - 冒泡 bubbleSort：带早停（一趟无交换即停）。比较 = 相邻比较次数；
     交换只在 a[j] > a[j+1] 时发生，故总交换数恒 = 逆序数；
     已排序输入比较数恰 = n−1。最好 O(n) 的声明只对此实现成立。
   - 选择 selectionSort：比较恒 = n(n−1)/2；交换仅当 minIdx ≠ i 时计 1。
   - 归并 mergeSort：自顶向下，左半 ⌊n/2⌋（mid = lo + floor((hi−lo)/2)），
     稳定（左头 ≤ 右头时取左）。比较 = 合并时双头比较次数；
     移动 = 合并时写入主数组的元素个数（每层每元素恰写 1 次）。
   - 快排 quickSort（Lomuto）：pivot 规则 mode='last' 取 a[hi]；
     mode='random' 用 mulberry32(seed) 从 [lo, hi] 等概率抽 pivot 并先与 a[hi] 交换。
     分区：i 从 lo 起，j 扫 lo..hi−1，a[j] ≤ pivot 则 swap(i, j) 后 i++，
     最后 swap(i, hi)。交换计数只计下标不同者（自交换跳过、不计）。
     已排序输入 + last：每分区 m−1 次比较，总比较 = n(n−1)/2（递推 T(n)=T(n−1)+(n−1)）。
     第 2 步 pivot 的 rng 种子 = 数据种子 + 1000；计数台快排 rng 种子 = 该档种子。
   - 计数排序 countingSort(a, k)：比较恒 0；操作 = 计数遍 n + 扫桶 (k+1) + 输出遍 n
     = 2n + k + 1；内存 = k + 1 格。
   - 计数台：n ∈ {50,100,200,400,800}；第 n 档数组种子 = benchSeed*1000 + n；
     拟合斜率 = 对 (log₂n, log₂比较数) 五点最小二乘（fitSlope）。
   - 常数对决：A(n) = 100·n·log₂n，B(n) = n²，交叉点 = 第一个 A < B 的整数（扫描求得）。
   - 动画帧约定：冒泡/归并 trace 的帧 0 = 初始态，其后每 1 次比较恰产生 1 帧
     （帧内含该次比较后的数组与累计计数），末尾另有 1 个 done 帧；
     快排/选择的原始 trace 在比较帧之外、每个元素落位时多 1 个 place 帧，
     但播放器用的展示 trace 滤掉 place 帧（落位并入下一比较帧，其状态已含
     落位结果），故单步钮每次点按严格推进恰一次比较；计数排序每 1 次操作 1 帧。
     动画推进单位 = 比较（操作）次数，非墙钟。
   ================================================================ */
const $ = id => document.getElementById(id);

/* ================================================================
   画布适配（DPR）：沿用站内 fitCanvas 方案（CSS 尺寸与 backing store 分离、幂等）
   ================================================================ */
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
let refitQueued = false;
window.addEventListener('resize', () => {
  if (refitQueued) return;
  refitQueued = true;
  requestAnimationFrame(() => {
    refitQueued = false;
    allCanvases.forEach(fitCanvas);
    refitHooks.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  });
});

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

/* ---------- 小工具 ---------- */
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function fmtInt(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmt2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
/* 对决专用：整数显整数，非整数带 1 位小数——交叉点附近 0.2 量级的差绝不能被取整吃掉 */
function fmtCost(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return fmtInt(v);
  const r = Math.round(v * 10) / 10;
  const intPart = Math.floor(r);
  return fmtInt(intPart) + '.' + Math.round((r - intPart) * 10);
}

/* 画布文字统一出口：量宽 → 必要时缩字号 → 按对齐方式把文本框钳进画布 [2, W−2] */
function drawText(ctx, text, x, y, opts) {
  opts = opts || {};
  const align = opts.align || 'left';
  let font = opts.font || '12px system-ui, sans-serif';
  ctx.font = font;
  ctx.textBaseline = opts.baseline || 'alphabetic';
  let w = ctx.measureText(text).width;
  if (opts.maxW && w > opts.maxW) {
    let size = parseFloat((font.match(/([\d.]+)px/) || [0, 12])[1]);
    while (w > opts.maxW && size > 8.5) {
      size -= 0.5;
      font = font.replace(/[\d.]+px/, size + 'px');
      ctx.font = font;
      w = ctx.measureText(text).width;
    }
  }
  const W = ctx.canvas.clientWidth;
  let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  left = Math.max(2, Math.min(left, Math.max(2, W - 2 - w)));
  const nx = align === 'left' ? left : align === 'right' ? left + w : left + w / 2;
  ctx.textAlign = align;
  if (opts.color) ctx.fillStyle = opts.color;
  ctx.fillText(text, nx, y);
  return w;
}
/* 图例助手（窄屏自适应）：量宽 → 贪心分行 → 逐行绘制（沿用站内做法） */
const LEG_FONT = '12.5px system-ui, sans-serif';
function legendRows(ctx, items, maxW) {
  ctx.font = LEG_FONT;
  const rows = [];
  let row = [], rowW = 0;
  for (const [txt, col] of items) {
    const w = 21 + ctx.measureText(txt).width;
    if (row.length && rowW + 18 + w > maxW) { rows.push(row); row = []; rowW = 0; }
    if (row.length) rowW += 18;
    row.push([txt, col]); rowW += w;
  }
  if (row.length) rows.push(row);
  return rows;
}
function drawLegendRows(ctx, rows, x, y) {
  ctx.font = LEG_FONT;
  ctx.textBaseline = 'middle';
  rows.forEach((row, ri) => {
    let lx = x;
    const yy = y + ri * 16;
    for (const [txt, col] of row) {
      ctx.fillStyle = col;
      ctx.fillRect(lx, yy - 5, 16, 10);
      drawText(ctx, txt, lx + 21, yy + 1, { font: LEG_FONT, color: '#e8edf4', baseline: 'middle' });
      lx += 21 + ctx.measureText(txt).width + 18;
    }
  });
}

/* ---------- 带种子 RNG（mulberry32，与站内各页同规格，评审可跨语言复刻） ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 数据生成（口径见页首注释） ---------- */
function genPermutation(n, seed) {
  const rng = mulberry32(seed);
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
function genNearly(n, seed) {
  const rng = mulberry32(seed);
  const a = Array.from({ length: n }, (_, i) => i + 1);
  const swaps = Math.max(2, Math.round(n / 8));
  for (let s = 0; s < swaps; s++) {
    const i = Math.floor(rng() * n), j = Math.floor(rng() * n);
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
function genData(n, preset, seed) {
  if (preset === 'sorted') return Array.from({ length: n }, (_, i) => i + 1);
  if (preset === 'reversed') return Array.from({ length: n }, (_, i) => n - i);
  if (preset === 'nearly') return genNearly(n, seed);
  return genPermutation(n, seed);
}
function genBounded(n, k, seed) {
  const rng = mulberry32(seed);
  const a = [];
  for (let i = 0; i < n; i++) a.push(Math.floor(rng() * (k + 1)));
  return a;
}
function countInversions(a) {
  let inv = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
  return inv;
}

/* ================================================================
   排序实现（唯一正本：动画 trace 与计数台、window.SORTING 导出共用同一份代码）
   emit(frame) 可选：frame 0 = 初始态，其后每 1 次「比较」（计数排序为每 1 次「操作」）1 帧。
   ================================================================ */
function bubbleSort(input, emit) {
  const a = input.slice();
  const C = { cmp: 0, swp: 0 };
  const n = a.length;
  if (emit) emit({ arr: a.slice(), cmp: 0, swp: 0, kind: 'init', sortedFrom: n, hl: null, didSwap: false });
  for (let end = n - 1; end >= 1; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++) {
      C.cmp++;
      let didSwap = false;
      if (a[j] > a[j + 1]) {
        const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
        C.swp++; swapped = true; didSwap = true;
      }
      if (emit) emit({ arr: a.slice(), cmp: C.cmp, swp: C.swp, kind: 'cmp', hl: [j, j + 1], didSwap, sortedFrom: end + 1 });
    }
    if (!swapped) break;
  }
  if (emit) emit({ arr: a.slice(), cmp: C.cmp, swp: C.swp, kind: 'done', sortedFrom: 0, hl: null, didSwap: false });
  return { sorted: a, comparisons: C.cmp, swaps: C.swp };
}

function selectionSort(input, emit) {
  const a = input.slice();
  const C = { cmp: 0, swp: 0 };
  const n = a.length;
  if (emit) emit({ arr: a.slice(), cmp: 0, swp: 0, kind: 'init', sortedUpto: 0, minIdx: -1, scan: -1, hl: null });
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) {
      C.cmp++;
      if (a[j] < a[m]) m = j;
      if (emit) emit({ arr: a.slice(), cmp: C.cmp, swp: C.swp, kind: 'cmp', sortedUpto: i, minIdx: m, scan: j, hl: [j, m] });
    }
    if (m !== i) { const tmp = a[i]; a[i] = a[m]; a[m] = tmp; C.swp++; }
    if (emit) emit({ arr: a.slice(), cmp: C.cmp, swp: C.swp, kind: 'place', sortedUpto: i + 1, minIdx: i, scan: -1, hl: [i] });
  }
  if (emit) emit({ arr: a.slice(), cmp: C.cmp, swp: C.swp, kind: 'done', sortedUpto: n, minIdx: -1, scan: -1, hl: null });
  return { sorted: a, comparisons: C.cmp, swaps: C.swp };
}

function mergeSort(input, emit) {
  const a = input.slice();
  const C = { cmp: 0, moves: 0 };
  const n = a.length;
  let ctx = null; // 当前合并上下文 {lo, hi, aux, L, li, ri, w}
  function visual() {
    if (!ctx) return a.slice();
    const v = a.slice();
    let p = ctx.w;
    for (let x = ctx.li; x < ctx.L; x++) v[p++] = ctx.aux[x];
    for (let x = ctx.ri; x < ctx.aux.length; x++) v[p++] = ctx.aux[x];
    return v;
  }
  function frame(kind, extra) {
    if (!emit) return;
    const f = { arr: visual(), cmp: C.cmp, moves: C.moves, kind, hl: null, segLo: -1, segHi: -1 };
    if (ctx) { f.segLo = ctx.lo; f.segHi = ctx.hi; }
    if (extra) Object.assign(f, extra);
    emit(f);
  }
  frame('init');
  function sort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    sort(lo, mid); sort(mid, hi);
    const aux = a.slice(lo, hi);
    const L = mid - lo;
    ctx = { lo, hi, aux, L, li: 0, ri: L, w: lo };
    while (ctx.li < L && ctx.ri < aux.length) {
      C.cmp++;
      let pickedLeft;
      if (aux[ctx.li] <= aux[ctx.ri]) { a[ctx.w] = aux[ctx.li]; ctx.li++; pickedLeft = true; }
      else { a[ctx.w] = aux[ctx.ri]; ctx.ri++; pickedLeft = false; }
      C.moves++; ctx.w++;
      const otherPos = pickedLeft ? ctx.w + (L - ctx.li) : ctx.w;
      frame('cmp', { hl: [ctx.w - 1, otherPos] });
    }
    while (ctx.li < L) { a[ctx.w] = aux[ctx.li]; ctx.li++; C.moves++; ctx.w++; }
    while (ctx.ri < aux.length) { a[ctx.w] = aux[ctx.ri]; ctx.ri++; C.moves++; ctx.w++; }
    ctx = null;
  }
  sort(0, n);
  frame('done');
  return { sorted: a, comparisons: C.cmp, moves: C.moves };
}

function quickSort(input, mode, seed, emit) {
  const a = input.slice();
  const C = { cmp: 0, swp: 0 };
  const rng = mulberry32((seed || 0) >>> 0);
  const placed = new Set();
  function swapCounted(i, j) {
    if (i === j) return;
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp; C.swp++;
  }
  function frame(kind, extra) {
    if (!emit) return;
    const f = { arr: a.slice(), cmp: C.cmp, swp: C.swp, kind, placed: Array.from(placed), lo: -1, hi: -1, pivotPos: -1, jPos: -1, iPos: -1 };
    if (extra) Object.assign(f, extra);
    emit(f);
  }
  frame('init', { lo: 0, hi: a.length - 1 });
  function qs(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) { placed.add(lo); frame('place', { lo, hi, pivotPos: lo }); return; }
    if (mode === 'random') {
      const p = lo + Math.floor(rng() * (hi - lo + 1));
      swapCounted(p, hi);
    }
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      C.cmp++;
      if (a[j] <= pivot) { swapCounted(i, j); i++; }
      frame('cmp', { lo, hi, pivotPos: hi, jPos: j, iPos: i });
    }
    swapCounted(i, hi);
    placed.add(i);
    frame('place', { lo, hi, pivotPos: i });
    qs(lo, i - 1); qs(i + 1, hi);
  }
  qs(0, a.length - 1);
  frame('done', {});
  return { sorted: a, comparisons: C.cmp, swaps: C.swp };
}

function countingSort(input, k, emit) {
  const n = input.length;
  const cnt = new Array(k + 1).fill(0);
  const out = [];
  let ops = 0;
  function frame(phase, extra) {
    if (!emit) return;
    const f = { phase, ops, cnt: cnt.slice(), out: out.slice(), cur: -1, bucket: -1 };
    if (extra) Object.assign(f, extra);
    emit(f);
  }
  frame('init');
  for (let idx = 0; idx < n; idx++) { cnt[input[idx]]++; ops++; frame('count', { cur: idx }); }
  for (let v = 0; v <= k; v++) {
    ops++; frame('scan', { bucket: v });
    for (let c = 0; c < cnt[v]; c++) { out.push(v); ops++; frame('out', { bucket: v }); }
  }
  frame('done');
  return { sorted: out, comparisons: 0, ops, memory: k + 1 };
}

/* ---------- 通用播放器：推进单位 = 帧（= 比较/操作次数），非墙钟 ---------- */
function makePlayer(onFrame, speed) {
  return {
    frames: [], idx: 0, playing: false, speed: speed || 30, acc: 0, onFrame,
    setFrames(frames) { this.frames = frames; this.idx = 0; this.playing = false; this.acc = 0; this.show(); },
    show() { if (this.frames.length) this.onFrame(this.frames[this.idx], this.idx, this.frames.length); },
    atEnd() { return this.idx >= this.frames.length - 1; },
    step() {
      if (this.idx < this.frames.length - 1) { this.idx++; this.show(); }
      if (this.atEnd()) this.playing = false;
    },
    toggle() {
      if (this.atEnd()) { this.idx = 0; this.show(); }
      this.playing = !this.playing;
      return this.playing;
    },
    reset() { this.idx = 0; this.playing = false; this.acc = 0; this.show(); },
    tick(dt) {
      if (!this.playing) return;
      this.acc += dt * this.speed;
      while (this.acc >= 1) { this.acc -= 1; this.step(); if (!this.playing) break; }
    }
  };
}
function traceOf(fn) {
  const frames = [];
  const result = fn(fr => frames.push(fr));
  return { frames, result };
}
/* 展示 trace（单步/连播用）：滤掉 place（落位）帧——落位并入紧随其后的比较帧呈现。
   依据：落位帧之后的第一个比较帧，其数组、sortedUpto（选择）/ placed 集合（快排）
   都已包含落位结果，滤掉落位帧不丢任何状态；于是「走一次比较」每点一次严格推进
   恰一次比较（计数 +1），不再偶遇计数不动的平台帧。原始 trace（含 place 帧）仍由
   window.SORTING.traces 原样导出，计数恒等式与帧内累计值分毫不动。 */
function displayFrames(frames) { return frames.filter(f => f.kind !== 'place'); }

/* ---------- 柱状图绘制 ---------- */
const COL = {
  base: '#54789c', dim: '#33506e', accent: '#6ee7ff', orange: '#ffb454',
  pink: '#ff7a93', good: '#7ee2a8', text: '#e8edf4', muted: '#9aa7b8'
};
function drawBars(ctx, W, H, arr, opts) {
  opts = opts || {};
  ctx.clearRect(0, 0, W, H);
  const n = arr.length;
  if (!n) return;
  const maxV = opts.maxV || Math.max.apply(null, arr.concat([1]));
  const pad = 6, top = opts.top != null ? opts.top : 18, bottom = 8;
  const bw = (W - pad * 2) / n;
  const barW = Math.max(1, bw * 0.7);
  if (opts.seg && opts.seg[1] > opts.seg[0]) {
    const x0 = pad + opts.seg[0] * bw, x1 = pad + opts.seg[1] * bw;
    ctx.fillStyle = 'rgba(110,231,255,0.06)';
    ctx.fillRect(x0, 4, x1 - x0, H - 8);
    ctx.strokeStyle = 'rgba(110,231,255,0.35)'; ctx.lineWidth = 1;
    ctx.strokeRect(x0, 4, x1 - x0, H - 8);
  }
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const bh = Math.max(2, (H - top - bottom) * (v / maxV));
    const x = pad + i * bw + (bw - barW) / 2;
    const y = H - bottom - bh;
    let col = COL.base;
    if (opts.colorAt) col = opts.colorAt(i, v) || col;
    ctx.fillStyle = col;
    ctx.fillRect(x, y, barW, bh);
  }
  if (opts.labels && bw >= 13) {
    ctx.font = '10px system-ui, sans-serif';
    for (let i = 0; i < n; i++) {
      if (opts.skipLabel && opts.skipLabel.has(i)) continue;
      const v = arr[i];
      const bh = Math.max(2, (H - top - bottom) * (v / maxV));
      const cx = pad + i * bw + bw / 2;
      drawText(ctx, String(v), cx, H - bottom - bh - 3, { align: 'center', font: '10px system-ui, sans-serif', color: COL.muted });
    }
  }
  if (opts.markers) {
    ctx.fillStyle = COL.accent;
    for (const i of opts.markers) {
      if (i < 0 || i >= n) continue;
      const cx = pad + i * bw + bw / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, H - 2); ctx.lineTo(cx + 4, H - 2); ctx.lineTo(cx, H - 8);
      ctx.closePath(); ctx.fill();
    }
  }
}

/* ================================================================
   第 0 步 · 双赛道：同数组，冒泡 vs 归并，按比较次数推进
   ================================================================ */
const s0 = {
  seed: 7, n: 48, MS_PER_CMP: 5,
  bFrames: [], mFrames: [], bTotal: 0, mTotal: 0,
  playing: false, elapsed: 0, finished: false
};
const s0ctxL = ctxOf('s0-left'), s0ctxR = ctxOf('s0-right');
function s0SyncPlayBtn() { $('s0-play').textContent = s0.playing ? t('pause') : t('s0race'); }
function s0Rebuild() {
  const data = genPermutation(s0.n, s0.seed);
  s0.bFrames = traceOf(emit => bubbleSort(data, emit)).frames;
  const mt = traceOf(emit => mergeSort(data, emit));
  s0.mFrames = mt.frames;
  s0.bTotal = s0.bFrames[s0.bFrames.length - 1].cmp;
  s0.mTotal = s0.mFrames[s0.mFrames.length - 1].cmp;
  s0.elapsed = 0; s0.playing = false; s0.finished = false;
  s0SyncPlayBtn();
  s0Draw();
}
function s0FrameAt(frames, elapsed) {
  const c = Math.floor(elapsed / s0.MS_PER_CMP);
  return frames[Math.min(c, frames.length - 1)];
}
function s0Draw() {
  const bf = s0FrameAt(s0.bFrames, s0.elapsed);
  const mf = s0FrameAt(s0.mFrames, s0.elapsed);
  const bDone = bf.cmp >= s0.bTotal, mDone = mf.cmp >= s0.mTotal;
  drawBars(s0ctxL, s0ctxL.canvas._w, s0ctxL.canvas._h, bf.arr, {
    maxV: s0.n,
    colorAt: i => {
      if (bf.kind === 'done') return COL.good;
      if (bf.hl && bf.hl.indexOf(i) >= 0) return bf.didSwap ? COL.orange : COL.accent;
      if (i >= bf.sortedFrom) return COL.good;
      return COL.base;
    }
  });
  drawBars(s0ctxR, s0ctxR.canvas._w, s0ctxR.canvas._h, mf.arr, {
    maxV: s0.n,
    colorAt: i => {
      if (mf.kind === 'done') return COL.good;
      if (mf.hl && mf.hl.indexOf(i) >= 0) return COL.accent;
      return COL.base;
    }
  });
  $('s0-left-count').textContent = t('cmpLab') + ' ' + bf.cmp + ' / ' + s0.bTotal;
  $('s0-right-count').textContent = t('cmpLab') + ' ' + mf.cmp + ' / ' + s0.mTotal;
  $('s0-readout').innerHTML = t('s0ro', {
    bc: bf.cmp, bs: bf.swp, bst: bDone ? t('stDone') : t('stRunning'),
    mc: mf.cmp, mm: mf.moves, mst: mDone ? t('stDone') : t('stRunning')
  });
  const fin = $('s0-final');
  if (s0.finished) {
    const last = s0.bFrames[s0.bFrames.length - 1];
    const lastM = s0.mFrames[s0.mFrames.length - 1];
    fin.style.display = '';
    fin.innerHTML = t('s0final', {
      n: s0.n, bc: last.cmp, mc: lastM.cmp,
      x: fmt2(last.cmp / Math.max(1, lastM.cmp))
    });
  } else fin.style.display = 'none';
}
animate($('step0'), dt => {
  if (!s0.playing) return;
  s0.elapsed += dt * 1000;
  const bf = s0FrameAt(s0.bFrames, s0.elapsed);
  const mf = s0FrameAt(s0.mFrames, s0.elapsed);
  if (bf.cmp >= s0.bTotal && mf.cmp >= s0.mTotal) {
    s0.playing = false; s0.finished = true;
    s0SyncPlayBtn();
  }
  s0Draw();
});
$('s0-play').addEventListener('click', () => {
  if (s0.finished || s0.elapsed >= Math.max(s0.bTotal, s0.mTotal) * s0.MS_PER_CMP) {
    s0.elapsed = 0; s0.finished = false;
  }
  s0.playing = !s0.playing;
  s0SyncPlayBtn();
  s0Draw();
});
$('s0-reset').addEventListener('click', () => { s0.elapsed = 0; s0.playing = false; s0.finished = false; s0SyncPlayBtn(); s0Draw(); });
$('s0-seed').addEventListener('click', () => { s0.seed += 1; s0Rebuild(); });
$('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));
onLangRefresh(() => { s0SyncPlayBtn(); s0Draw(); });
onRefit(() => s0Draw());

/* ================================================================
   第 1 步 · 冒泡与选择（单步走）
   ================================================================ */
const s1 = { seed: 11, n: 24, algo: 'bubble', preset: 'random', data: [], inv: 0, player: null };
const s1ctx = ctxOf('s1-canvas');
function s1Rebuild() {
  s1.data = genData(s1.n, s1.preset, s1.seed);
  s1.inv = countInversions(s1.data);
  const tr = s1.algo === 'bubble'
    ? traceOf(emit => bubbleSort(s1.data, emit))
    : traceOf(emit => selectionSort(s1.data, emit));
  s1.player.setFrames(displayFrames(tr.frames));
  $('s1-play').textContent = t('play');
}
function s1DrawFrame(f) {
  const W = s1ctx.canvas._w, H = s1ctx.canvas._h;
  if (s1.algo === 'bubble') {
    drawBars(s1ctx, W, H, f.arr, {
      maxV: s1.n, labels: true,
      colorAt: i => {
        if (f.kind === 'done' || i >= f.sortedFrom) return COL.good;
        if (f.hl && f.hl.indexOf(i) >= 0) return f.didSwap ? COL.orange : COL.accent;
        return COL.base;
      },
      markers: f.hl || []
    });
  } else {
    drawBars(s1ctx, W, H, f.arr, {
      maxV: s1.n, labels: true,
      colorAt: i => {
        if (f.kind === 'done' || i < f.sortedUpto) return COL.good;
        if (i === f.minIdx) return COL.orange;
        if (i === f.scan) return COL.accent;
        return COL.base;
      },
      markers: f.scan >= 0 ? [f.scan] : []
    });
  }
  const st = f.kind === 'done' ? t('stDone') : (f.cmp === 0 ? t('stReady') : t('stRunning'));
  if (s1.algo === 'bubble') {
    $('s1-readout').innerHTML = t('s1roB', { c: f.cmp, s: f.swp, inv: s1.inv, st });
  } else {
    $('s1-readout').innerHTML = t('s1roS', { c: f.cmp, f: s1.n * (s1.n - 1) / 2, s: f.swp, st });
  }
  const note = $('s1-note');
  if (f.kind === 'done') {
    note.style.display = '';
    if (s1.algo === 'bubble' && s1.preset === 'sorted') {
      note.innerHTML = t('s1noteBubSorted', { v: s1.n - 1 });
    } else if (s1.algo === 'bubble') {
      note.innerHTML = t('s1noteBubDone', { s: f.swp, inv: s1.inv });
    } else {
      note.innerHTML = t('s1noteSel', { c: f.cmp, f: s1.n * (s1.n - 1) / 2 });
    }
  } else note.style.display = 'none';
}
s1.player = makePlayer(s1DrawFrame, 26);
animate($('step1'), dt => { s1.player.tick(dt); if (!s1.player.playing) $('s1-play').textContent = t('play'); });
$('s1-step').addEventListener('click', () => { s1.player.step(); $('s1-play').textContent = t('play'); });
$('s1-play').addEventListener('click', () => { $('s1-play').textContent = s1.player.toggle() ? t('pause') : t('play'); });
$('s1-reset').addEventListener('click', () => { s1.player.reset(); $('s1-play').textContent = t('play'); });
$('s1-seed').addEventListener('click', () => { s1.seed += 1; s1Rebuild(); });
$('s1-algo').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  s1.algo = b.dataset.algo;
  $('s1-algo').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  s1Rebuild();
}));
$('s1-preset').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  s1.preset = b.dataset.preset;
  $('s1-preset').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  s1Rebuild();
}));
onLangRefresh(() => { $('s1-play').textContent = s1.player.playing ? t('pause') : t('play'); s1.player.show(); });
onRefit(() => s1.player.show());

/* ================================================================
   第 2 步 · 归并与快排
   ================================================================ */
$('s2-algo').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  const which = b.dataset.s2algo;
  $('s2-algo').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  $('s2-merge-panel').style.display = which === 'merge' ? '' : 'none';
  $('s2-quick-panel').style.display = which === 'quick' ? '' : 'none';
  if (which === 'merge') { fitCanvas($('s2m-canvas')); fitCanvas($('s2split-canvas')); s2m.player.show(); s2SplitDraw(); }
  else { fitCanvas($('s2q-canvas')); s2q.player.show(); }
}));

/* ---- 归并 ---- */
const s2m = { seed: 13, n: 16, player: null };
const s2mCtx = ctxOf('s2m-canvas');
function s2mRebuild() {
  const data = genPermutation(s2m.n, s2m.seed);
  const tr = traceOf(emit => mergeSort(data, emit));
  s2m.player.setFrames(tr.frames);
  $('s2m-play').textContent = t('play');
}
function s2mDrawFrame(f) {
  if (!s2mCtx.canvas._w) fitCanvas(s2mCtx.canvas);
  const W = s2mCtx.canvas._w, H = s2mCtx.canvas._h;
  drawBars(s2mCtx, W, H, f.arr, {
    maxV: s2m.n, labels: true,
    seg: f.segLo >= 0 ? [f.segLo, f.segHi] : null,
    colorAt: i => {
      if (f.kind === 'done') return COL.good;
      if (f.hl && f.hl.indexOf(i) >= 0) return COL.accent;
      if (f.segLo >= 0 && (i < f.segLo || i >= f.segHi)) return COL.dim;
      return COL.base;
    },
    markers: f.hl || []
  });
  const st = f.kind === 'done' ? t('stDone') : (f.cmp === 0 ? t('stReady') : t('stRunning'));
  $('s2m-readout').innerHTML = t('s2roM', { c: f.cmp, m: f.moves, st });
}
s2m.player = makePlayer(s2mDrawFrame, 22);
animate($('step2'), dt => {
  s2m.player.tick(dt);
  s2q.player.tick(dt);
  if (!s2m.player.playing) $('s2m-play').textContent = t('play');
  if (!s2q.player.playing) $('s2q-play').textContent = t('play');
});
$('s2m-step').addEventListener('click', () => { s2m.player.step(); $('s2m-play').textContent = t('play'); });
$('s2m-play').addEventListener('click', () => { $('s2m-play').textContent = s2m.player.toggle() ? t('pause') : t('play'); });
$('s2m-reset').addEventListener('click', () => { s2m.player.reset(); $('s2m-play').textContent = t('play'); });
$('s2m-seed').addEventListener('click', () => { s2m.seed += 1; s2mRebuild(); });
onLangRefresh(() => { $('s2m-play').textContent = s2m.player.playing ? t('pause') : t('play'); s2m.player.show(); });
onRefit(() => s2m.player.show());

/* ---- 归并切分层级示意（静态）：逐层对半切分到段长 1。
   切分不产生比较、不计数、不进 trace——帧只从合并开始（口径见页首注释）。 ---- */
const s2splitCtx = ctxOf('s2split-canvas');
function s2SplitDraw() {
  const cv = s2splitCtx.canvas;
  if (!cv._w) fitCanvas(cv);
  const ctx = s2splitCtx, W = cv._w, H = cv._h;
  ctx.clearRect(0, 0, W, H);
  const n = s2m.n;
  const levels = Math.round(Math.log2(n)); // n=16 → 4，共 5 排（含整段与单元素段）
  const labW = 48, x0 = labW + 4, x1 = W - 8;
  const rowH = 15, gap = 5, top = 8;
  for (let k = 0; k <= levels; k++) {
    const segs = Math.pow(2, k), segLen = n / segs;
    const y = top + k * (rowH + gap);
    drawText(ctx, t('s2splitLv', { k }), 2, y + rowH / 2 + 1, { font: '11px system-ui, sans-serif', color: COL.muted, baseline: 'middle' });
    const segW = (x1 - x0) * (segLen / n);
    for (let s = 0; s < segs; s++) {
      const sx = x0 + s * segW;
      ctx.fillStyle = k === levels ? 'rgba(126,226,168,0.35)' : 'rgba(84,120,156,0.55)';
      ctx.fillRect(sx + 1, y, Math.max(1, segW - 2), rowH);
      ctx.strokeStyle = 'rgba(110,231,255,0.45)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx + 1, y, Math.max(1, segW - 2), rowH);
      if (segW >= 15) {
        drawText(ctx, String(segLen), sx + segW / 2, y + rowH / 2 + 1, { align: 'center', font: '10px system-ui, sans-serif', color: COL.text, baseline: 'middle' });
      }
    }
  }
}
onLangRefresh(() => s2SplitDraw());
onRefit(() => s2SplitDraw());

/* ---- 快排 ---- */
const s2q = { seed: 17, n: 24, mode: 'last', preset: 'random', player: null };
const s2qCtx = ctxOf('s2q-canvas');
function s2qRebuild() {
  const data = s2q.preset === 'sorted'
    ? Array.from({ length: s2q.n }, (_, i) => i + 1)
    : genPermutation(s2q.n, s2q.seed);
  const tr = traceOf(emit => quickSort(data, s2q.mode, s2q.seed + 1000, emit));
  s2q.player.setFrames(displayFrames(tr.frames));
  $('s2q-play').textContent = t('play');
}
function s2qDrawFrame(f) {
  if (!s2qCtx.canvas._w) fitCanvas(s2qCtx.canvas);
  const W = s2qCtx.canvas._w, H = s2qCtx.canvas._h;
  const placedSet = new Set(f.placed || []);
  drawBars(s2qCtx, W, H, f.arr, {
    maxV: s2q.n, labels: true,
    skipLabel: f.pivotPos >= 0 ? new Set([f.pivotPos]) : null,
    seg: f.lo >= 0 ? [f.lo, f.hi + 1] : null,
    colorAt: i => {
      if (f.kind === 'done' || placedSet.has(i)) return COL.good;
      if (i === f.pivotPos) return COL.pink;
      if (i === f.jPos) return COL.accent;
      if (f.lo >= 0 && (i < f.lo || i > f.hi)) return COL.dim;
      return COL.base;
    },
    markers: f.jPos >= 0 ? [f.jPos] : []
  });
  /* 分区边界线（iPos）：≤ pivot 的区域右界 */
  if (f.kind === 'cmp' && f.iPos >= 0 && f.lo >= 0) {
    const pad = 6, bw = (W - pad * 2) / s2q.n;
    const x = pad + f.iPos * bw;
    s2qCtx.strokeStyle = 'rgba(255,180,84,0.8)';
    s2qCtx.setLineDash([4, 4]);
    s2qCtx.beginPath(); s2qCtx.moveTo(x, 6); s2qCtx.lineTo(x, H - 8); s2qCtx.stroke();
    s2qCtx.setLineDash([]);
  }
  if (f.pivotPos >= 0 && f.kind !== 'done') {
    const pad = 6, bw = (W - pad * 2) / s2q.n;
    const cx = pad + f.pivotPos * bw + bw / 2;
    drawText(s2qCtx, 'pivot', cx, 12, { align: 'center', font: '11px system-ui, sans-serif', color: COL.pink });
  }
  const st = f.kind === 'done' ? t('stDone') : (f.cmp === 0 ? t('stReady') : t('stRunning'));
  $('s2q-readout').innerHTML = t('s2roQ', { c: f.cmp, s: f.swp, p: placedSet.size, st });
  const note = $('s2q-note');
  if (f.kind === 'done' && s2q.preset === 'sorted' && s2q.mode === 'last') {
    note.style.display = '';
    note.innerHTML = t('s2noteWorst', { f: s2q.n * (s2q.n - 1) / 2, c: f.cmp });
  } else if (f.kind === 'done' && s2q.preset === 'sorted' && s2q.mode === 'random') {
    note.style.display = '';
    note.innerHTML = t('s2noteRand', { c: f.cmp });
  } else note.style.display = 'none';
}
s2q.player = makePlayer(s2qDrawFrame, 26);
$('s2q-step').addEventListener('click', () => { s2q.player.step(); $('s2q-play').textContent = t('play'); });
$('s2q-play').addEventListener('click', () => { $('s2q-play').textContent = s2q.player.toggle() ? t('pause') : t('play'); });
$('s2q-reset').addEventListener('click', () => { s2q.player.reset(); $('s2q-play').textContent = t('play'); });
$('s2q-seed').addEventListener('click', () => { s2q.seed += 1; s2qRebuild(); });
$('s2-pivot').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  s2q.mode = b.dataset.pivot;
  $('s2-pivot').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  s2qRebuild();
}));
$('s2-preset').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  s2q.preset = b.dataset.preset;
  $('s2-preset').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  s2qRebuild();
}));
onLangRefresh(() => { $('s2q-play').textContent = s2q.player.playing ? t('pause') : t('play'); s2q.player.show(); });
onRefit(() => s2q.player.show());

/* ================================================================
   第 3 步 · 计数台
   ================================================================ */
const BENCH_NS = [50, 100, 200, 400, 800];
const BENCH_ALGOS = [
  { id: 'bubble', nameKey: 'algBubble', color: '#ff7a93' },
  { id: 'selection', nameKey: 'algSelection', color: '#ffb454' },
  { id: 'merge', nameKey: 'algMerge', color: '#6ee7ff' },
  { id: 'quick', nameKey: 'algQuick', color: '#7ee2a8' }
];
function runBench(seed) {
  const table = {};
  for (const n of BENCH_NS) {
    const data = genPermutation(n, seed * 1000 + n);
    table[n] = {
      bubble: bubbleSort(data, null).comparisons,
      selection: selectionSort(data, null).comparisons,
      merge: mergeSort(data, null).comparisons,
      quick: quickSort(data, 'random', seed * 1000 + n, null).comparisons
    };
  }
  const slopes = {}, ratios = {};
  for (const a of BENCH_ALGOS) {
    const counts = BENCH_NS.map(n => table[n][a.id]);
    slopes[a.id] = fitSlope(BENCH_NS.map(n => Math.log2(n)), counts.map(c => Math.log2(c)));
    ratios[a.id] = counts.slice(1).map((c, i) => c / counts[i]);
  }
  return { seed, table, slopes, ratios };
}
function fitSlope(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) * (xs[i] - mx); }
  return num / den;
}
const s3 = { seed: 2026, bench: null };
const s3ctx = ctxOf('s3-plot');
function s3Render() {
  const b = s3.bench;
  if (!b) return;
  $('s3-readout').innerHTML = t('s3ro', { seed: b.seed });
  /* 计数表 */
  let html = '<table class="cmp-tbl"><thead><tr><th>' + t('tblAlgo') + '</th>';
  for (const n of BENCH_NS) html += '<th>n = ' + n + '</th>';
  html += '<th>' + t('s3slope') + '</th></tr></thead><tbody>';
  for (const a of BENCH_ALGOS) {
    html += '<tr><td>' + t(a.nameKey) + '</td>';
    for (const n of BENCH_NS) html += '<td>' + fmtInt(b.table[n][a.id]) + '</td>';
    html += '<td class="slope">' + fmt2(b.slopes[a.id]) + '</td></tr>';
  }
  html += '</tbody></table>';
  $('s3-table').innerHTML = html;
  /* 翻倍比表 */
  let rh = '<table class="cmp-tbl"><thead><tr><th>' + t('tblAlgo') + '</th>';
  for (let i = 1; i < BENCH_NS.length; i++) rh += '<th>' + BENCH_NS[i - 1] + ' ' + t('s3ratioTo') + ' ' + BENCH_NS[i] + '</th>';
  rh += '</tr></thead><tbody>';
  for (const a of BENCH_ALGOS) {
    rh += '<tr><td>' + t(a.nameKey) + '</td>';
    for (const r of b.ratios[a.id]) rh += '<td class="ratio">× ' + fmt2(r) + '</td>';
    rh += '</tr>';
  }
  rh += '</tbody></table>';
  $('s3-ratios').innerHTML = rh;
  s3DrawPlot();
}
function s3DrawPlot() {
  const b = s3.bench;
  if (!b) return;
  const ctx = s3ctx, W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const legendItems = BENCH_ALGOS.map(a => [t(a.nameKey), a.color]);
  const rows = legendRows(ctx, legendItems, W - 24);
  const topPad = 14 + rows.length * 16;
  drawLegendRows(ctx, rows, 12, 14 + 6);
  const L = 62, R = 14, T = topPad + 24, B = 48;
  const xs = BENCH_NS.map(n => Math.log2(n));
  const allCounts = [];
  BENCH_ALGOS.forEach(a => BENCH_NS.forEach(n => allCounts.push(b.table[n][a.id])));
  let yMin = Math.floor(Math.log2(Math.min.apply(null, allCounts))) - 0.4;
  let yMax = Math.ceil(Math.log2(Math.max.apply(null, allCounts))) + 0.4;
  const xMin = xs[0] - 0.25, xMax = xs[xs.length - 1] + 0.25;
  const px = v => L + (v - xMin) / (xMax - xMin) * (W - L - R);
  const py = v => T + (yMax - v) / (yMax - yMin) * (H - T - B);
  /* 网格与刻度 */
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  for (let e = Math.ceil(yMin); e <= Math.floor(yMax); e += 2) {
    ctx.beginPath(); ctx.moveTo(L, py(e)); ctx.lineTo(W - R, py(e)); ctx.stroke();
    drawText(ctx, fmtInt(Math.pow(2, e)), L - 6, py(e) + 4, { align: 'right', font: '11px system-ui, sans-serif', color: COL.muted });
  }
  BENCH_NS.forEach((n, i) => {
    drawText(ctx, String(n), px(xs[i]), H - 26, { align: 'center', font: '11px system-ui, sans-serif', color: COL.muted });
  });
  ctx.strokeStyle = '#2b3547';
  ctx.strokeRect(L, T, W - L - R, H - T - B);
  drawText(ctx, t('cvAxisY'), L, T - 9, { font: '11.5px system-ui, sans-serif', color: COL.muted });
  drawText(ctx, t('cvAxisX'), W - R, H - 8, { align: 'right', font: '11.5px system-ui, sans-serif', color: COL.muted });
  /* 参照线：斜率 2 过选择首点、斜率 1 过归并首点 */
  function refLine(algoId, slope, label) {
    const x0 = xs[0], y0 = Math.log2(b.table[BENCH_NS[0]][algoId]);
    const x1 = xs[xs.length - 1], y1 = y0 + slope * (x1 - x0);
    ctx.strokeStyle = 'rgba(154,167,184,0.55)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(px(x0), py(y0)); ctx.lineTo(px(x1), py(Math.min(y1, yMax))); ctx.stroke();
    ctx.setLineDash([]);
    drawText(ctx, label, px(x1), py(Math.min(y1, yMax)) - 6, { align: 'right', font: '11px system-ui, sans-serif', color: COL.muted, maxW: 130 });
  }
  refLine('selection', 2, t('cvRef2'));
  refLine('merge', 1, t('cvRef1'));
  /* 实测点与连线。冒泡与选择的计数同为 ≈n²/2，两线在本图上几乎重合：
     冒泡先以同色宽描边（半透明）垫底、点标记也大一号，之后选择（橙）压在其上，
     于是橙线两侧露出的粉色描边就是冒泡线——两条线可分别循迹，读数分毫不动。 */
  for (const a of BENCH_ALGOS) {
    const pts = BENCH_NS.map((n, i) => [px(xs[i]), py(Math.log2(b.table[n][a.id]))]);
    if (a.id === 'bubble') {
      ctx.strokeStyle = a.color; ctx.globalAlpha = 0.45; ctx.lineWidth = 5.5;
      ctx.beginPath();
      pts.forEach(([X, Y], i) => { if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = a.color; ctx.fillStyle = a.color; ctx.lineWidth = 1.6;
    ctx.beginPath();
    pts.forEach(([X, Y], i) => { if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke();
    const r = a.id === 'bubble' ? 4.6 : 3.4;
    for (const [X, Y] of pts) {
      ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineWidth = 1;
  }
}
$('s3-run').addEventListener('click', () => { s3.bench = runBench(s3.seed); s3Render(); });
$('s3-seed').addEventListener('click', () => { s3.seed += 1; s3.bench = runBench(s3.seed); s3Render(); });
onLangRefresh(() => s3Render());
onRefit(() => s3DrawPlot());

/* ================================================================
   第 4 步 · 常数对决 + 主导项
   ================================================================ */
const duel = {
  costA: n => 100 * n * Math.log2(n),
  costB: n => n * n,
  crossover: 0
};
for (let n = 2; n <= 1000000; n++) { if (duel.costA(n) < duel.costB(n)) { duel.crossover = n; break; } }
const s4 = { n: 100, termN: 100 };
const s4ctx = ctxOf('s4-plot'), s4tCtx = ctxOf('s4-term');
function s4Draw() {
  const ctx = s4ctx, W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const L = 58, R = 14, T = 16, B = 30;
  const xMin = 1, xMax = 3.5, yMin = 2, yMax = 7;
  const px = v => L + (v - xMin) / (xMax - xMin) * (W - L - R);
  const py = v => T + (yMax - v) / (yMax - yMin) * (H - T - B);
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  for (let e = yMin; e <= yMax; e++) {
    ctx.beginPath(); ctx.moveTo(L, py(e)); ctx.lineTo(W - R, py(e)); ctx.stroke();
    drawText(ctx, fmtInt(Math.pow(10, e)), L - 6, py(e) + 4, { align: 'right', font: '11px system-ui, sans-serif', color: COL.muted });
  }
  [10, 100, 1000].forEach(n => {
    drawText(ctx, String(n), px(Math.log10(n)), H - 10, { align: 'center', font: '11px system-ui, sans-serif', color: COL.muted });
  });
  ctx.strokeStyle = '#2b3547';
  ctx.strokeRect(L, T, W - L - R, H - T - B);
  /* 交叉点竖线 */
  const cxX = px(Math.log10(duel.crossover));
  ctx.strokeStyle = 'rgba(255,180,84,0.75)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(cxX, T); ctx.lineTo(cxX, H - B); ctx.stroke();
  ctx.setLineDash([]);
  drawText(ctx, t('cvCross', { x: duel.crossover }), cxX, T + 12, { align: 'center', font: '11.5px system-ui, sans-serif', color: COL.orange, maxW: W - 30 });
  /* 两条成本曲线（log-log） */
  function curve(fn, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const lx = xMin + (xMax - xMin) * i / 120;
      const n = Math.pow(10, lx);
      const X = px(lx), Y = py(Math.log10(fn(n)));
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke(); ctx.lineWidth = 1;
  }
  curve(duel.costA, COL.accent);
  curve(duel.costB, COL.pink);
  /* 曲线标签（贴各自曲线右端） */
  drawText(ctx, 'A = 100·n·log₂n', W - R - 4, py(Math.log10(duel.costA(Math.pow(10, xMax)))) + 17, { align: 'right', font: '12px system-ui, sans-serif', color: COL.accent });
  drawText(ctx, 'B = n²', W - R - 4, py(Math.log10(duel.costB(Math.pow(10, xMax)))) + 16, { align: 'right', font: '12px system-ui, sans-serif', color: COL.pink });
  /* 当前 n 标记 */
  const n = s4.n;
  const mx = px(Math.log10(n));
  ctx.strokeStyle = 'rgba(232,237,244,0.4)';
  ctx.beginPath(); ctx.moveTo(mx, T); ctx.lineTo(mx, H - B); ctx.stroke();
  ctx.fillStyle = COL.accent;
  ctx.beginPath(); ctx.arc(mx, py(Math.log10(duel.costA(n))), 4.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COL.pink;
  ctx.beginPath(); ctx.arc(mx, py(Math.log10(duel.costB(n))), 4.4, 0, Math.PI * 2); ctx.fill();
  /* 读数 */
  const A = duel.costA(n), Bv = duel.costB(n);
  const aWins = A < Bv;
  $('s4-n-val').textContent = fmtInt(n);
  $('s4-readout').innerHTML = t('s4ro', {
    n: fmtInt(n), a: fmtCost(A), b: fmtCost(Bv),
    w: aWins ? t('s4winA') : t('s4winB'), d: fmtCost(Math.abs(A - Bv))
  });
  const x = duel.crossover;
  $('s4-cross').innerHTML = t('s4cross', {
    x, xm: x - 1,
    am: fmtCost(duel.costA(x - 1)), bm: fmtCost(duel.costB(x - 1)),
    ax: fmtCost(duel.costA(x)), bx: fmtCost(duel.costB(x))
  });
}
function s4TermDraw() {
  const ctx = s4tCtx, W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const n = s4.termN;
  const q = 2 * n * n, l = 100 * n, tot = q + l;
  const qp = q / tot * 100, lp = l / tot * 100;
  const L = 10, R = 10, barY = 44, barH = 30;
  const qw = (W - L - R) * (q / tot);
  ctx.fillStyle = COL.orange;
  ctx.fillRect(L, barY, Math.max(1, qw), barH);
  ctx.fillStyle = COL.accent;
  ctx.fillRect(L + qw, barY, Math.max(1, (W - L - R) - qw), barH);
  drawText(ctx, '2n² · ' + fmt2(qp) + '%', L + qw / 2, barY - 10, { align: 'center', font: '12.5px system-ui, sans-serif', color: COL.orange, maxW: W - 20 });
  drawText(ctx, '100n · ' + fmt2(lp) + '%', L + qw + (W - L - R - qw) / 2, barY - 10, { align: 'center', font: '12.5px system-ui, sans-serif', color: COL.accent, maxW: W - 20 });
  drawText(ctx, 'f(n) = 2n² + 100n', L, barY + barH + 24, { font: '12.5px system-ui, sans-serif', color: COL.muted });
  $('s4-termro').innerHTML = t('s4termRo', {
    n: fmtInt(n), q: fmtInt(q), qp: fmt2(qp), l: fmtInt(l), lp: fmt2(lp)
  });
}
$('s4-n').addEventListener('input', e => {
  s4.n = Math.max(2, Math.round(Math.pow(10, parseFloat(e.target.value))));
  s4Draw();
});
$('s4-term-btns').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  s4.termN = parseInt(b.dataset.termn, 10);
  $('s4-term-btns').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  s4TermDraw();
}));
onLangRefresh(() => { s4Draw(); s4TermDraw(); });
onRefit(() => { s4Draw(); s4TermDraw(); });

/* ================================================================
   第 5 步 · 计数排序
   ================================================================ */
const s5 = { seed: 5, n: 24, k: 9, blow: false, input: [], totalOps: 0, mergeCmp: 0, player: null, blowResult: null };
const s5ctx = ctxOf('s5-canvas');
function s5Rebuild() {
  if (s5.blow) {
    s5.input = genBounded(50, 100000, s5.seed);
    s5.blowResult = countingSort(s5.input, 100000, null);
    s5.mergeCmp = mergeSort(s5.input, null).comparisons;
    s5DrawBlow();
    s5ReadoutBlow();
    return;
  }
  s5.input = genBounded(s5.n, s5.k, s5.seed);
  s5.mergeCmp = mergeSort(s5.input, null).comparisons;
  const tr = traceOf(emit => countingSort(s5.input, s5.k, emit));
  s5.totalOps = tr.result.ops;
  s5.player.setFrames(tr.frames);
  $('s5-play').textContent = t('play');
}
function s5DrawFrame(f) {
  if (s5.blow) { s5DrawBlow(); return; }
  const ctx = s5ctx, W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const input = s5.input, k = s5.k, n = input.length;
  /* 输入行 */
  drawText(ctx, t('cvIn', { n }), 8, 16, { font: '12px system-ui, sans-serif', color: COL.muted });
  const inTop = 22, inH = 92;
  (function drawInput() {
    const pad = 8, bw = (W - pad * 2) / n, barW = Math.max(1, bw * 0.68);
    const maxV = Math.max(1, k);
    for (let i = 0; i < n; i++) {
      const v = input[i];
      const bh = Math.max(2, (inH - 14) * (v / maxV));
      const x = pad + i * bw + (bw - barW) / 2;
      let col = COL.base;
      if (f.phase !== 'init' && f.phase !== 'done') {
        if (f.phase === 'count') col = i < f.cur ? COL.dim : (i === f.cur ? COL.accent : COL.base);
        else col = COL.dim;
      }
      if (f.phase === 'done') col = COL.dim;
      ctx.fillStyle = col;
      ctx.fillRect(x, inTop + inH - bh, barW, bh);
    }
  })();
  /* 桶行 */
  const bkTop = 140;
  drawText(ctx, t('cvBuckets'), 8, bkTop - 8, { font: '12px system-ui, sans-serif', color: COL.muted });
  (function drawBuckets() {
    const pad = 8, cols = k + 1, bw = (W - pad * 2) / cols, barW = Math.max(1, bw * 0.6);
    const maxC = Math.max(1, Math.max.apply(null, f.cnt));
    const bkH = 96;
    for (let v = 0; v < cols; v++) {
      const c = f.cnt[v];
      const bh = (bkH - 26) * (c / maxC);
      const x = pad + v * bw + (bw - barW) / 2;
      let col = COL.base;
      if ((f.phase === 'scan' || f.phase === 'out') && f.bucket === v) col = COL.orange;
      else if (f.phase === 'count' && f.cur >= 0 && input[f.cur] === v) col = COL.accent;
      ctx.fillStyle = col;
      if (c > 0) ctx.fillRect(x, bkTop + bkH - 22 - bh, barW, Math.max(2, bh));
      ctx.strokeStyle = '#2b3547';
      ctx.strokeRect(x, bkTop + bkH - 22 - (bkH - 26), barW, bkH - 26);
      if (c > 0) drawText(ctx, String(c), pad + v * bw + bw / 2, bkTop + bkH - 30 - Math.max(2, bh), { align: 'center', font: '11px system-ui, sans-serif', color: COL.text });
      drawText(ctx, String(v), pad + v * bw + bw / 2, bkTop + bkH - 4, { align: 'center', font: '11px system-ui, sans-serif', color: COL.muted });
    }
  })();
  /* 输出行 */
  const outTop = 292;
  drawText(ctx, t('cvOut'), 8, outTop - 8, { font: '12px system-ui, sans-serif', color: COL.muted });
  (function drawOut() {
    const pad = 8, bw = (W - pad * 2) / n, barW = Math.max(1, bw * 0.68);
    const maxV = Math.max(1, k), outH = 82;
    for (let i = 0; i < n; i++) {
      const x = pad + i * bw + (bw - barW) / 2;
      if (i < f.out.length) {
        const v = f.out[i];
        const bh = Math.max(2, (outH - 12) * (v / maxV));
        ctx.fillStyle = f.phase === 'done' ? COL.good : COL.good;
        ctx.fillRect(x, outTop + outH - bh, barW, bh);
      } else {
        ctx.strokeStyle = '#232d3f';
        ctx.strokeRect(x, outTop + 4, barW, outH - 4);
      }
    }
  })();
  const st = f.phase === 'done' ? t('stDone') : (f.ops === 0 ? t('stReady') : t('stRunning'));
  $('s5-readout').innerHTML = t('s5ro', { ops: f.ops, total: s5.totalOps, mc: s5.mergeCmp, st });
}
function s5DrawBlow() {
  const ctx = s5ctx, W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  function barRow(arr, top, height, color) {
    const pad = 8, n = arr.length, bw = (W - pad * 2) / n, barW = Math.max(1, bw * 0.68);
    for (let i = 0; i < n; i++) {
      const bh = Math.max(2, (height - 8) * (arr[i] / 100000));
      ctx.fillStyle = color;
      ctx.fillRect(pad + i * bw + (bw - barW) / 2, top + height - bh, barW, bh);
    }
  }
  drawText(ctx, t('cvIn', { n: s5.input.length }), 8, 16, { font: '12px system-ui, sans-serif', color: COL.muted });
  barRow(s5.input, 22, 120, COL.base);
  const stripY = 196;
  drawText(ctx, t('cvBucketsBig', { k: fmtInt(100001) }), 8, stripY - 10, { font: '12px system-ui, sans-serif', color: COL.muted, maxW: W - 16 });
  const cells = 90, cw = (W - 16) / cells;
  const present = new Set(s5.input);
  for (let i = 0; i < cells; i++) {
    const v = Math.floor(i / cells * 100001);
    ctx.fillStyle = present.has(v) ? COL.orange : '#1c2635';
    ctx.fillRect(8 + i * cw, stripY, Math.max(1, cw - 1), 26);
  }
  drawText(ctx, '0', 8, stripY + 44, { font: '11px system-ui, sans-serif', color: COL.muted });
  drawText(ctx, '100000', W - 8, stripY + 44, { align: 'right', font: '11px system-ui, sans-serif', color: COL.muted });
  drawText(ctx, t('cvOut'), 8, 278, { font: '12px system-ui, sans-serif', color: COL.muted });
  if (s5.blowResult) barRow(s5.blowResult.sorted, 286, 100, COL.good);
}
function s5ReadoutBlow() {
  const r = s5.blowResult;
  $('s5-readout').innerHTML = t('s5roBlow', {
    n: s5.input.length, k: fmtInt(100000), ops: fmtInt(r.ops),
    kb: fmtInt(100001), mem: fmtInt(r.memory), mc: s5.mergeCmp
  });
}
s5.player = makePlayer(s5DrawFrame, 22);
animate($('step5'), dt => { s5.player.tick(dt); if (!s5.player.playing) $('s5-play').textContent = t('play'); });
$('s5-step').addEventListener('click', () => { if (!s5.blow) { s5.player.step(); $('s5-play').textContent = t('play'); } });
$('s5-play').addEventListener('click', () => { if (!s5.blow) $('s5-play').textContent = s5.player.toggle() ? t('pause') : t('play'); });
$('s5-reset').addEventListener('click', () => { if (!s5.blow) { s5.player.reset(); $('s5-play').textContent = t('play'); } else s5Rebuild(); });
$('s5-seed').addEventListener('click', () => { s5.seed += 1; s5Rebuild(); });
$('s5-k').addEventListener('input', e => {
  s5.k = parseInt(e.target.value, 10);
  $('s5-k-val').textContent = s5.k;
  if (!s5.blow) s5Rebuild();
});
$('s5-blow').addEventListener('click', () => {
  s5.blow = !s5.blow;
  $('s5-blow').textContent = t(s5.blow ? 's5blowOff' : 's5blow');
  $('s5-controls').style.display = s5.blow ? 'none' : '';
  $('s5-step').disabled = s5.blow;
  $('s5-play').disabled = s5.blow;
  s5Rebuild();
});
onLangRefresh(() => {
  $('s5-play').textContent = s5.player.playing ? t('pause') : t('play');
  $('s5-blow').textContent = t(s5.blow ? 's5blowOff' : 's5blow');
  if (s5.blow) { s5DrawBlow(); s5ReadoutBlow(); } else s5.player.show();
});
onRefit(() => { if (s5.blow) s5DrawBlow(); else s5.player.show(); });

/* ================================================================
   初始化 + window.SORTING 导出（评审对账入口）
   ================================================================ */
s0Rebuild();
s1Rebuild();
s2mRebuild();
s2SplitDraw();
s2qRebuild();
s3.bench = runBench(s3.seed);
s3Render();
s4Draw();
s4TermDraw();
s5Rebuild();

window.SORTING = {
  mulberry32, genPermutation, genData, genBounded, countInversions,
  bubbleSort: a => bubbleSort(a, null),
  selectionSort: a => selectionSort(a, null),
  mergeSort: a => mergeSort(a, null),
  quickSort: (a, mode, seed) => quickSort(a, mode || 'last', seed || 0, null),
  countingSort: (a, k) => countingSort(a, k, null),
  traces: {
    bubble: a => traceOf(emit => bubbleSort(a, emit)),
    selection: a => traceOf(emit => selectionSort(a, emit)),
    merge: a => traceOf(emit => mergeSort(a, emit)),
    quick: (a, mode, seed) => traceOf(emit => quickSort(a, mode || 'last', seed || 0, emit)),
    counting: (a, k) => traceOf(emit => countingSort(a, k, emit))
  },
  bench: { ns: BENCH_NS.slice(), run: runBench, fitSlope, last: () => s3.bench },
  duel: { costA: duel.costA, costB: duel.costB, crossover: duel.crossover },
  state: {
    s0: () => ({ seed: s0.seed, n: s0.n, bubbleTotal: s0.bTotal, mergeTotal: s0.mTotal }),
    s1: () => ({ seed: s1.seed, n: s1.n, algo: s1.algo, preset: s1.preset, data: s1.data.slice(), inversions: s1.inv }),
    s2quick: () => ({ seed: s2q.seed, n: s2q.n, mode: s2q.mode, preset: s2q.preset, pivotSeed: s2q.seed + 1000 }),
    s5: () => ({ seed: s5.seed, n: s5.n, k: s5.k, blow: s5.blow, input: s5.input.slice(), totalOps: s5.totalOps, mergeCmp: s5.mergeCmp })
  }
};
