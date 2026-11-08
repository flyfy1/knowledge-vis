'use strict';
/* ================================================================
   梯度下降讲解页 — 摸黑下山
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   全部地形与公式（评审对账用，window.GRAD 同源）：
   - 第 0 步：一维 f(x) = x²，∇f = 2x，迭代 x ← x − η·2x（字面表达式）。
   - 第 1 步：圆形碗 f(p) = ½‖p‖²，∇f = p。
   - 第 2/3 步：二次型 f(p) = ½ pᵀAp，A = diag(1, κ)，∇f = Ap；
     λmin = 1，λmax = κ，η 上限 2/λmax，η* = 2/(λmin+λmax)，率 (κ−1)/(κ+1)。
     动量：v ← βv − η∇f(x)，x ← x + v（重球法，本页唯一采用的公式）。
   - 第 4 步：线性回归 MSE，数据 mulberry32(种子 20261016)：
     x = −2+4u，y = 1.3x + 0.4 + 0.55·高斯（Box–Muller polar）。
     全量梯度 = 全部样本梯度均值；batch 梯度 = 子集均值；batcher 种子 777。
   - 第 5 步：f(x,y) = (x²−1)² + y² + 0.3x，∇f = (4x³−4x+0.3, 2y)，
     Hessian = diag(12x²−4, 2)；临界点 = 解 4x³−4x+0.3 = 0（Newton 多起点）。
     噪声：每步梯度加 σ=1.0 的高斯扰动（种子 13579）。
   - 第 6 步：最小二乘线性回归分类器（BRIEF 红线 8 给「线性或逻辑回归」二选一；
     逻辑回归在有界数据上梯度饱和、任意 η 都不发散，与「训飞爆表」的演示要求
     数学上不可兼得，故按数学真值取线性回归——裁决见 report.md）。
     两团高斯点（种子 987654321，σ=0.55，中心 (−1.05,−0.55) / (1.0,0.75)，
     各 30 点），打分 ŷ = w₁x + w₂y + b 拟合 0/1 标签，损失 = 均方误差，
     梯度 = (2/N)Σ(ŷᵢ−yᵢ)·[xᵢ, yᵢ, 1]，决策边界 ŷ = 0.5；
     Hessian λmax ≈ 3.54，η > 2/λmax ≈ 0.564 起指数发散（真爆表）。
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
function fmt(v, d) { if (!isFinite(v)) return '—'; return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
function fmtS(v, d) { return fmt(v, d === undefined ? 2 : d).replace('-', '−'); }
function fmtSmart(v) {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) return v.toExponential(2).replace('-', '−');
  return fmtS(v, 3);
}
function drawClipNote(ctx, xRight, yTop, text, xLeft) {
  ctx.font = '11.5px system-ui, sans-serif';
  const tw = ctx.measureText(text).width;
  const x0 = xLeft != null ? xLeft : Math.max(2, xRight - tw - 12);
  ctx.fillStyle = 'rgba(10,14,20,0.88)';
  ctx.fillRect(x0, yTop, tw + 12, 21);
  ctx.strokeStyle = 'rgba(255,180,84,0.5)'; ctx.lineWidth = 1;
  ctx.strokeRect(x0, yTop, tw + 12, 21);
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x0 + 6, yTop + 11);
}
function drawSideLabel(ctx, text, px, py, w, preferLeft, gap) {
  gap = gap || 10;
  const tw = ctx.measureText(text).width;
  const fitsL = px + gap + tw <= w - 4, fitsR = px - gap - tw >= 4;
  let x;
  if (preferLeft && fitsL) { ctx.textAlign = 'left'; x = px + gap; }
  else if (!preferLeft && fitsR) { ctx.textAlign = 'right'; x = px - gap; }
  else if (fitsL) { ctx.textAlign = 'left'; x = px + gap; }
  else if (fitsR) { ctx.textAlign = 'right'; x = px - gap; }
  else if (preferLeft) { ctx.textAlign = 'left'; x = Math.max(4, w - 4 - tw); }
  else { ctx.textAlign = 'right'; x = Math.min(w - 4, 4 + tw); }
  ctx.fillText(text, x, py - 8);
}
/* 图例助手（窄屏自适应）：量宽 → 贪心分行 → 逐行绘制 */
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
  ctx.textAlign = 'left';
  rows.forEach((row, ri) => {
    let lx = x;
    const yy = y + ri * 16;
    for (const [txt, col] of row) {
      ctx.fillStyle = col;
      ctx.fillRect(lx, yy - 5, 16, 10);
      ctx.fillText(txt, lx + 21, yy + 1);
      lx += 21 + ctx.measureText(txt).width + 18;
    }
  });
}

/* ---------- 带种子的随机数（与 CLT 页同规格，评审可跨语言复刻） ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function makeGauss(rng) {
  let spare = null;
  return function () {
    if (spare !== null) { const v = spare; spare = null; return v; }
    let u, v, s;
    do { u = rng() * 2 - 1; v = rng() * 2 - 1; s = u * u + v * v; } while (s >= 1 || s === 0);
    const m = Math.sqrt(-2 * Math.log(s) / s);
    spare = v * m;
    return u * m;
  };
}

/* ================================================================
   数学核心
   ================================================================ */
/* ---- 第 0 步：一维 f(x) = x² ---- */
const f0 = x => x * x;
const g0 = x => 2 * x;
function s0Step(x, eta) { return x - eta * g0(x); } // 字面迭代式 x ← x − η·2x
function s0Iterate(x0, eta, n) {
  const xs = [x0];
  for (let i = 0; i < n; i++) xs.push(s0Step(xs[xs.length - 1], eta));
  return xs;
}
function s0Regime(eta) {
  if (eta < 0.5) return 'mono';
  if (eta === 0.5) return 'one';
  if (eta < 1) return 'osc';
  if (eta === 1) return 'stay';
  return 'div';
}

/* ---- 第 1 步：圆形碗 f(p) = ½‖p‖² ---- */
const f1 = p => 0.5 * (p[0] * p[0] + p[1] * p[1]);
const g1 = p => [p[0], p[1]];
function gdStep(f, grad, p, eta) { const g = grad(p); return [p[0] - eta * g[0], p[1] - eta * g[1]]; }

/* ---- 第 2/3 步：二次型 f(p) = ½ pᵀAp ---- */
function quadF(A, p) { return 0.5 * (A[0][0] * p[0] * p[0] + 2 * A[0][1] * p[0] * p[1] + A[1][1] * p[1] * p[1]); }
function quadG(A, p) { return [A[0][0] * p[0] + A[0][1] * p[1], A[0][1] * p[0] + A[1][1] * p[1]]; }
const canyonA = kap => [[1, 0], [0, kap]];
/* 2x2 对称阵特征分解：返回两组正交特征向量 u,v 与对应特征值 lu,lv（u 由半角公式给出） */
function eig2(A) {
  const a = A[0][0], b = A[0][1], d = A[1][1];
  const phi = 0.5 * Math.atan2(2 * b, a - d);
  const u = [Math.cos(phi), Math.sin(phi)], v = [-Math.sin(phi), Math.cos(phi)];
  const ray = w => A[0][0] * w[0] * w[0] + 2 * A[0][1] * w[0] * w[1] + A[1][1] * w[1] * w[1];
  const lu = ray(u), lv = ray(v);
  return { u, v, lu, lv, lmin: Math.min(lu, lv), lmax: Math.max(lu, lv) };
}
const etaStarOf = (lmin, lmax) => 2 / (lmin + lmax);
const etaLimitOf = lmax => 2 / lmax;
const rateOf = (lmin, lmax) => (lmax - lmin) / (lmax + lmin);
/* 通用轨迹计算：stepper(p, state) 推进一��；epsRel/divNorm/maxSteps 控制停止 */
function runPath(stepper, x0, opts) {
  const o = Object.assign({ maxSteps: 20000, epsRel: 1e-3, divNorm: 1e4, tail: 25 }, opts || {});
  const pts = [[x0[0], x0[1]]];
  const n0 = Math.hypot(x0[0], x0[1]);
  let stepsToEps = -1, diverged = false, state = null;
  for (let n = 1; n <= o.maxSteps; n++) {
    const r = stepper(pts[pts.length - 1], state);
    state = r.state;
    const p = r.p;
    if (!isFinite(p[0]) || !isFinite(p[1])) { diverged = true; break; }
    pts.push([p[0], p[1]]);
    const nn = Math.hypot(p[0], p[1]);
    if (nn > o.divNorm) { diverged = true; break; }
    if (stepsToEps < 0 && nn <= o.epsRel * n0) stepsToEps = n;
    if (nn < 1e-13) break;
    if (stepsToEps > 0 && n >= stepsToEps + o.tail) break;
  }
  return { pts, stepsToEps, diverged, steps: pts.length - 1 };
}
function gdPathQuad(A, x0, eta, opts) {
  return runPath(p => ({ p: [p[0] - eta * (A[0][0] * p[0] + A[0][1] * p[1]), p[1] - eta * (A[0][1] * p[0] + A[1][1] * p[1])] }), x0, opts);
}
/* 重球法（本页动量唯一公式）：v ← βv − η∇f(x)，x ← x + v；β = 0 时与 gdPathQuad 逐点同值 */
function heavyBallPathQuad(A, x0, eta, beta, opts) {
  return runPath((p, st) => {
    const v = st || [0, 0];
    const g = quadG(A, p);
    const nv = [beta * v[0] - eta * g[0], beta * v[1] - eta * g[1]];
    return { p: [p[0] + nv[0], p[1] + nv[1]], state: nv };
  }, x0, opts);
}

/* ---- 第 4 步：SGD 线性回归（数据带种子） ---- */
const SGD_SEED = 20261016, SGD_BATCH_SEED = 777, SGD_N = 40, SGD_ETA = 0.15;
const SGD_START = [-1.5, 2.6];
const SGD_DATA = (() => {
  const rng = mulberry32(SGD_SEED), gauss = makeGauss(rng), pts = [];
  for (let i = 0; i < SGD_N; i++) {
    const x = -2 + 4 * rng();
    pts.push({ x, y: 1.3 * x + 0.4 + 0.55 * gauss() });
  }
  return pts;
})();
function sgdLoss(th) {
  let s = 0;
  for (const d of SGD_DATA) { const r = th[0] * d.x + th[1] - d.y; s += r * r; }
  return s / SGD_N;
}
function sgdGradIdx(th, idx) {
  let gw = 0, gb = 0;
  for (const i of idx) { const d = SGD_DATA[i]; const r = th[0] * d.x + th[1] - d.y; gw += d.x * r; gb += r; }
  const m = idx.length;
  return [2 * gw / m, 2 * gb / m];
}
const ALL_IDX = SGD_DATA.map((_, i) => i);
const sgdGradFull = th => sgdGradIdx(th, ALL_IDX);
function sgdOLS() {
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const d of SGD_DATA) { sx += d.x; sy += d.y; sxx += d.x * d.x; sxy += d.x * d.y; }
  const det = SGD_N * sxx - sx * sx;
  return [(SGD_N * sxy - sx * sy) / det, (sy * sxx - sx * sxy) / det];
}
function makeBatcher(B) {
  const rng = mulberry32(SGD_BATCH_SEED);
  let queue = [];
  return {
    next() {
      while (queue.length < B) {
        const idx = ALL_IDX.slice();
        for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
        queue = queue.concat(idx);
      }
      /* 返回的 batch 按索引升序：梯度求和次序规范化——B = 全量时与全量梯度逐位同值（数学上仍是该子集的均值） */
      return queue.splice(0, B).sort((a, b) => a - b);
    }
  };
}
function sgdRun(B, steps) {
  const batcher = makeBatcher(B);
  const gd = [[SGD_START[0], SGD_START[1]]], sg = [[SGD_START[0], SGD_START[1]]], batches = [];
  for (let k = 0; k < steps; k++) {
    const pg = gd[gd.length - 1], gf = sgdGradFull(pg);
    gd.push([pg[0] - SGD_ETA * gf[0], pg[1] - SGD_ETA * gf[1]]);
    const idx = batcher.next();
    batches.push(idx);
    const ps = sg[sg.length - 1], gb = sgdGradIdx(ps, idx);
    sg.push([ps[0] - SGD_ETA * gb[0], ps[1] - SGD_ETA * gb[1]]);
  }
  return { gd, sgd: sg, batches };
}

/* ---- 第 5 步：非凸 f(x,y) = (x²−1)² + y² + 0.3x ---- */
const ncF = p => { const q = p[0] * p[0] - 1; return q * q + p[1] * p[1] + 0.3 * p[0]; };
const ncG = p => [4 * p[0] * p[0] * p[0] - 4 * p[0] + 0.3, 2 * p[1]];
const ncH = p => [[12 * p[0] * p[0] - 4, 0], [0, 2]];
function ncCriticalPoints() {
  const g = x => 4 * x * x * x - 4 * x + 0.3, dg = x => 12 * x * x - 4;
  const roots = [];
  for (const x00 of [-1.5, 0, 1.5]) {
    let x = x00;
    for (let i = 0; i < 80; i++) { const dx = g(x) / dg(x); x -= dx; if (Math.abs(dx) < 1e-14) break; }
    if (isFinite(x) && Math.abs(g(x)) < 1e-9 && !roots.some(r => Math.abs(r - x) < 1e-7)) roots.push(x);
  }
  roots.sort((a, b) => a - b);
  return roots.map(x => {
    const hxx = 12 * x * x - 4;
    return { x, y: 0, f: ncF([x, 0]), hxx, hyy: 2, type: hxx > 0 ? 'min' : 'saddle' };
  });
}
const NC_CPS = ncCriticalPoints();
const NC_NOISE_SEED = 13579, NC_NOISE_SIGMA = 1.0;

/* ---- 第 6 步：最小二乘线性回归分类器（数据带种子；模型裁决见文件头注） ---- */
const LR_SEED = 987654321, LR_N = 60;
const LR_DATA = (() => {
  const rng = mulberry32(LR_SEED), gauss = makeGauss(rng), pts = [];
  for (let i = 0; i < 30; i++) pts.push({ x: -1.05 + 0.55 * gauss(), y: -0.55 + 0.55 * gauss(), c: 0 });
  for (let i = 0; i < 30; i++) pts.push({ x: 1.0 + 0.55 * gauss(), y: 0.75 + 0.55 * gauss(), c: 1 });
  return pts;
})();
const LR_INIT = { w1: -1.35, w2: 0.55, b: 0.85 };
function lrScore(th, d) { return th.w1 * d.x + th.w2 * d.y + th.b; }
function lrLoss(th) {
  let s = 0;
  for (const d of LR_DATA) { const r = lrScore(th, d) - d.c; s += r * r; }
  return s / LR_N;
}
function lrGrad(th) {
  let g1 = 0, g2 = 0, gb = 0;
  for (const d of LR_DATA) {
    const r = lrScore(th, d) - d.c;
    g1 += r * d.x; g2 += r * d.y; gb += r;
  }
  return { w1: 2 * g1 / LR_N, w2: 2 * g2 / LR_N, b: 2 * gb / LR_N };
}
function lrAcc(th) {
  let ok = 0;
  for (const d of LR_DATA) {
    if ((lrScore(th, d) > 0.5) === (d.c === 1)) ok++;
  }
  return ok / LR_N;
}
function lrStep(th, eta) {
  const g = lrGrad(th);
  return { w1: th.w1 - eta * g.w1, w2: th.w2 - eta * g.w2, b: th.b - eta * g.b };
}

/* ================================================================
   绘图助手
   ================================================================ */
/* 正方形等比视图：数据 [-R, R]²，底部留 legH 给图例 */
function squareView(cv, R, legH) {
  const w = cv._w, h = cv._h;
  const size = Math.min(w - 16, h - legH - 14);
  const ox = (w - size) / 2, oy = 6 + (h - legH - 14 - size) / 2;
  return {
    w, h, size, ox, oy, legH,
    X: x => ox + (x + R) / (2 * R) * size,
    Y: y => oy + (R - y) / (2 * R) * size,
    invX: px => (px - ox) / size * 2 * R - R,
    invY: py => R - (py - oy) / size * 2 * R,
    pxPerUnit: size / (2 * R)
  };
}
/* 矩形视图：x∈xr, y∈yr */
function rectView(cv, xr, yr, legH) {
  const w = cv._w, h = cv._h;
  const pw = w - 20, ph = h - legH - 14;
  const ox = 10, oy = 6;
  return {
    w, h, pw, ph, ox, oy, legH,
    X: x => ox + (x - xr[0]) / (xr[1] - xr[0]) * pw,
    Y: y => oy + (yr[1] - y) / (yr[1] - yr[0]) * ph,
    pxPerX: pw / (xr[1] - xr[0]), pxPerY: ph / (yr[1] - yr[0])
  };
}
function drawFrame(ctx, v, R) {
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(v.ox, v.oy, v.size, v.size);
  ctx.strokeStyle = 'rgba(120,140,170,0.25)';
  ctx.beginPath();
  ctx.moveTo(v.X(0), v.oy); ctx.lineTo(v.X(0), v.oy + v.size);
  ctx.moveTo(v.ox, v.Y(0)); ctx.lineTo(v.ox + v.size, v.Y(0));
  ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.rect(v.ox, v.oy, v.size, v.size); ctx.clip();
}
function drawFrameRect(ctx, v) {
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(v.ox, v.oy, v.pw, v.ph);
  ctx.save();
  ctx.beginPath(); ctx.rect(v.ox, v.oy, v.pw, v.ph); ctx.clip();
}
/* 二次型等高线：f = ½(p−c)ᵀA(p−c) 的 levels（f 值）逐圈参数化真画 */
function drawQuadContours(ctx, v, A, c, levels, color) {
  const e = eig2(A);
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  for (const L of levels) {
    if (!(L > 0)) continue;
    const au = Math.sqrt(2 * L / e.lu), av = Math.sqrt(2 * L / e.lv);
    ctx.beginPath();
    for (let i = 0; i <= 140; i++) {
      const th = i / 140 * 2 * Math.PI, cu = Math.cos(th), sv = Math.sin(th);
      const px = c[0] + e.u[0] * au * cu + e.v[0] * av * sv;
      const py = c[1] + e.u[1] * au * cu + e.v[1] * av * sv;
      const X = v.X(px), Y = v.Y(py);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.closePath(); ctx.stroke();
  }
}
function drawPathPts(ctx, v, pts, color, ballColor) {
  if (pts.length > 1) {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => { const X = v.X(p[0]), Y = v.Y(p[1]); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke();
    ctx.fillStyle = color;
    for (const p of pts) { ctx.beginPath(); ctx.arc(v.X(p[0]), v.Y(p[1]), 2.4, 0, 2 * Math.PI); ctx.fill(); }
  }
  const head = pts[pts.length - 1];
  ctx.beginPath(); ctx.arc(v.X(head[0]), v.Y(head[1]), 7, 0, 2 * Math.PI);
  ctx.fillStyle = ballColor; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke();
}
function drawArrow(ctx, x, y, dx, dy, lenPx, color) {
  const m = Math.hypot(dx, dy);
  if (!(m > 1e-12)) return;
  const ux = dx / m, uy = dy / m;
  const ex = x + ux * lenPx, ey = y + uy * lenPx;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
  const a = Math.atan2(uy, ux);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 6 * Math.cos(a - 0.45), ey - 6 * Math.sin(a - 0.45));
  ctx.lineTo(ex - 6 * Math.cos(a + 0.45), ey - 6 * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill();
}

/* ================================================================
   第 0 步：一维生死线
   ================================================================ */
const s0 = { eta: 0.9, xs: [2], playing: false, acc: 0, view: null };
const s0cv = $('s0-canvas');
function s0Draw() {
  const ctx = fitCanvas(s0cv);
  const w = s0cv._w, h = s0cv._h;
  ctx.clearRect(0, 0, w, h);
  const xr = [-2.7, 2.7], yr = [-0.7, 7.4];
  const v = rectView(s0cv, xr, yr, 26);
  s0.view = v;
  const rows = legendRows(ctx, [[t('cv0valley'), '#7ee2a8']], w - 24);
  drawFrameRect(ctx, v);
  /* 抛物线 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const x = xr[0] + (xr[1] - xr[0]) * i / 160, X = v.X(x), Y = v.Y(f0(x));
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();
  /* 轴与谷底标记 */
  ctx.strokeStyle = 'rgba(120,140,170,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(v.ox, v.Y(0)); ctx.lineTo(v.ox + v.pw, v.Y(0)); ctx.stroke();
  ctx.fillStyle = '#7ee2a8';
  ctx.beginPath(); ctx.arc(v.X(0), v.Y(0), 3.4, 0, 2 * Math.PI); ctx.fill();
  /* 迭代点：竖直虚线 + 曲线点 */
  const last = s0.xs[s0.xs.length - 1];
  const inFrame = Math.abs(last) <= 2.68;
  ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (const x of s0.xs) {
    if (Math.abs(x) > 2.68) continue;
    ctx.beginPath(); ctx.moveTo(v.X(x), v.Y(0)); ctx.lineTo(v.X(x), v.Y(f0(x))); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454';
  for (const x of s0.xs) {
    if (Math.abs(x) > 2.68) continue;
    ctx.beginPath(); ctx.arc(v.X(x), v.Y(f0(x)), 3, 0, 2 * Math.PI); ctx.fill();
  }
  if (inFrame) {
    ctx.beginPath(); ctx.arc(v.X(last), v.Y(f0(last)), 7.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffb454'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  ctx.restore();
  if (!inFrame) drawClipNote(ctx, w - 10, 8, t('cv0clip'), 10);
  drawLegendRows(ctx, rows, 12, h - rows.length * 16 - 4);
}
function s0Readout() {
  const n = s0.xs.length - 1, x = s0.xs[n], ratio = 1 - 2 * s0.eta;
  let verdict;
  if (x === 0) verdict = t('s0vDone');
  else {
    const rg = s0Regime(s0.eta);
    verdict = t(rg === 'mono' ? 's0vMono' : rg === 'one' ? 's0vOne' : rg === 'osc' ? 's0vOsc' : rg === 'stay' ? 's0vStay' : 's0vDiv');
  }
  $('s0-readout').innerHTML = t('s0ro', { n, x: fmtSmart(x), ax: fmtSmart(Math.abs(x)), ratio: fmtS(ratio, 2), verdict });
  const dn = $('s0-divnote');
  if (Math.abs(x) > 2.7) {
    dn.style.display = '';
    dn.innerHTML = t('s0divNote', { k: Math.floor(Math.log10(Math.abs(x))) });
  } else dn.style.display = 'none';
  $('s0-play').textContent = t(s0.playing ? 's0pause' : 's0play');
}
function s0Done() {
  const x = s0.xs[s0.xs.length - 1];
  return x === 0 || Math.abs(x) > 1e12 || s0.xs.length > 1200;
}
function s0StepOnce() {
  if (s0Done()) { s0.playing = false; return; }
  s0.xs.push(s0Step(s0.xs[s0.xs.length - 1], s0.eta));
  s0Draw(); s0Readout();
}
function s0Reset() { s0.xs = [2]; s0.playing = false; s0Draw(); s0Readout(); }
function s0SetEta(eta) {
  s0.eta = eta;
  $('s0-eta').value = eta;
  $('s0-eta-val').textContent = fmt(eta, 2);
  document.querySelectorAll('#step0 [data-eta]').forEach(b => b.classList.toggle('active', Math.abs(parseFloat(b.dataset.eta) - eta) < 1e-9));
  s0Reset();
}
$('s0-eta').addEventListener('input', e => s0SetEta(parseFloat(e.target.value)));
document.querySelectorAll('#step0 [data-eta]').forEach(b => b.addEventListener('click', () => s0SetEta(parseFloat(b.dataset.eta))));
$('s0-step').addEventListener('click', s0StepOnce);
$('s0-play').addEventListener('click', () => { s0.playing = !s0.playing; if (s0.playing && s0Done()) { s0Reset(); s0.playing = true; } s0Readout(); });
$('s0-reset').addEventListener('click', s0Reset);
$('s0-start').addEventListener('click', () => { $('step1').scrollIntoView({ behavior: 'smooth' }); });
animate($('step0'), dt => {
  if (!s0.playing) return;
  s0.acc += dt;
  if (s0.acc >= 0.26) { s0.acc = 0; s0StepOnce(); if (s0Done()) { s0.playing = false; s0Readout(); } }
});
onLangRefresh(() => { s0Draw(); s0Readout(); });
onRefit(() => s0Draw());

/* ================================================================
   第 1 步：二维圆形碗
   ================================================================ */
const s1 = { eta: 0.35, path: [[2.2, 1.6]], playing: false, acc: 0, view: null, done: false };
const s1cv = $('s1-canvas');
function s1Draw() {
  const ctx = fitCanvas(s1cv);
  const w = s1cv._w, h = s1cv._h;
  ctx.clearRect(0, 0, w, h);
  const v = squareView(s1cv, 3.1, 30);
  s1.view = v;
  const rows = legendRows(ctx, [[t('cv1grad'), '#6ee7ff']], w - 24);
  drawFrame(ctx, v, 3.1);
  drawQuadContours(ctx, v, [[1, 0], [0, 1]], [0, 0], [0.125, 0.5, 1.125, 2, 3.125, 4.5], 'rgba(103,215,249,0.4)');
  /* 梯度箭头场：−∇f */
  for (let gx = -2.5; gx <= 2.51; gx += 0.625) {
    for (let gy = -2.5; gy <= 2.51; gy += 0.625) {
      const m = Math.hypot(gx, gy);
      if (m < 0.2) continue;
      const len = (7 + 11 * Math.min(m, 3) / 3);
      const ex = v.X(gx) - gx / m * len, ey = v.Y(gy) + gy / m * len;
      ctx.strokeStyle = 'rgba(103,215,249,0.65)'; ctx.fillStyle = 'rgba(103,215,249,0.65)'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(v.X(gx), v.Y(gy)); ctx.lineTo(ex, ey); ctx.stroke();
      const a = Math.atan2(ey - v.Y(gy), ex - v.X(gx));
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 5 * Math.cos(a - 0.45), ey - 5 * Math.sin(a - 0.45));
      ctx.lineTo(ex - 5 * Math.cos(a + 0.45), ey - 5 * Math.sin(a + 0.45));
      ctx.closePath(); ctx.fill();
    }
  }
  drawPathPts(ctx, v, s1.path, '#ffb454', '#ffb454');
  ctx.restore();
  drawLegendRows(ctx, rows, 12, h - rows.length * 16 - 4);
  if (s1.path.length === 1) {
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t('cv1click'), w / 2, 18);
  }
}
function s1Readout() {
  const p = s1.path[s1.path.length - 1], g = g1(p);
  $('s1-readout').innerHTML = t('s1ro', {
    n: s1.path.length - 1, x: fmtS(p[0]), y: fmtS(p[1]), f: fmtSmart(f1(p)),
    g: fmtSmart(Math.hypot(g[0], g[1])), done: s1.done ? t('s1done') : ''
  });
  $('s1-play').textContent = t(s1.playing ? 's1pause' : 's1play');
}
function s1StepOnce() {
  const p = s1.path[s1.path.length - 1], g = g1(p);
  if (Math.hypot(g[0], g[1]) < 1e-6) { s1.done = true; s1.playing = false; s1Readout(); return; }
  s1.path.push(gdStep(null, g1, p, s1.eta));
  const np = s1.path[s1.path.length - 1], ng = g1(np);
  if (Math.hypot(ng[0], ng[1]) < 1e-6) s1.done = true;
  s1Draw(); s1Readout();
}
function s1ResetTo(p) { s1.path = [[p[0], p[1]]]; s1.done = false; s1.playing = false; s1Draw(); s1Readout(); }
$('s1-eta').addEventListener('input', e => { s1.eta = parseFloat(e.target.value); $('s1-eta-val').textContent = fmt(s1.eta, 2); });
$('s1-step').addEventListener('click', s1StepOnce);
$('s1-play').addEventListener('click', () => { s1.playing = !s1.playing; s1Readout(); });
$('s1-reset').addEventListener('click', () => s1ResetTo([2.2, 1.6]));
s1cv.addEventListener('pointerdown', e => {
  const rect = s1cv.getBoundingClientRect(), v = s1.view;
  if (!v) return;
  const x = v.invX(e.clientX - rect.left), y = v.invY(e.clientY - rect.top);
  if (Math.abs(x) <= 3.1 && Math.abs(y) <= 3.1) s1ResetTo([x, y]);
});
animate($('step1'), dt => {
  if (!s1.playing) return;
  s1.acc += dt;
  if (s1.acc >= 0.22) { s1.acc = 0; s1StepOnce(); if (s1.done) { s1.playing = false; s1Readout(); } }
});
onLangRefresh(() => { s1Draw(); s1Readout(); });
onRefit(() => s1Draw());

/* ================================================================
   第 2 步：峡谷（条件数）
   ================================================================ */
const S2_START = [2.3, 2.3];
const s2 = { kap: 12, eta: etaStarOf(1, 12), path: null, reveal: 1, playing: false, acc: 0 };
const s2cv = $('s2-canvas');
function s2Compute() {
  s2.path = gdPathQuad(canyonA(s2.kap), S2_START, s2.eta, { maxSteps: 20000 });
  s2.reveal = 1; s2.playing = false;
}
function s2Board() {
  const kap = s2.kap, rate = rateOf(1, kap);
  const theory = kap === 1 ? 1 : Math.ceil(Math.log(1000) / -Math.log(rate));
  const meas = s2.path.stepsToEps >= 0 ? String(s2.path.stepsToEps) : '—';
  $('s2-board').innerHTML =
    `<div class="cell">${t('bdLam', { a: '1', b: kap })}</div>` +
    `<div class="cell">${t('bdEtaLim', { v: fmt(etaLimitOf(kap), 4) })}</div>` +
    `<div class="cell">${t('bdEtaStar', { v: fmt(etaStarOf(1, kap), 4) })}</div>` +
    `<div class="cell">${t('bdRate', { v: fmt(rate, 4) })}</div>` +
    `<div class="cell">${t('bdTheory', { v: theory })}</div>` +
    `<div class="cell warnb">${t('bdMeas', { v: meas })}</div>`;
}
function s2Draw() {
  const ctx = fitCanvas(s2cv);
  const w = s2cv._w, h = s2cv._h;
  ctx.clearRect(0, 0, w, h);
  const v = squareView(s2cv, 3.1, 6);
  drawFrame(ctx, v, 3.1);
  const A = canyonA(s2.kap), f0v = quadF(A, S2_START);
  const levels = [];
  for (let k = 1; k <= 14; k++) levels.push(f0v * Math.pow(0.78, k));
  drawQuadContours(ctx, v, A, [0, 0], levels, 'rgba(103,215,249,0.4)');
  const pts = s2.path.pts.slice(0, s2.reveal);
  drawPathPts(ctx, v, pts, '#ffb454', '#ffb454');
  ctx.restore();
}
function s2Readout() {
  const pts = s2.path.pts, cur = pts[Math.min(s2.reveal, pts.length) - 1];
  const n = Math.min(s2.reveal, pts.length) - 1;
  let status;
  if (s2.path.diverged) {
    const end = pts[pts.length - 1], k = Math.floor(Math.log10(Math.max(1, Math.hypot(end[0], end[1]))));
    status = t('s2stDiv', { supk: '<sup>' + k + '</sup>' });
  } else if (s2.path.stepsToEps >= 0 && n >= s2.path.stepsToEps) status = t('s2stDone');
  else status = t('s2stRun');
  $('s2-readout').innerHTML = t('s2ro', {
    n, x: fmtS(cur[0]), y: fmtS(cur[1]), f: fmtSmart(quadF(canyonA(s2.kap), cur)), status
  });
  $('s2-play').textContent = t(s2.playing ? 's2pause' : 's2play');
}
function s2Refresh() { s2Draw(); s2Readout(); s2Board(); }
function s2SetKap(kap) {
  s2.kap = kap;
  $('s2-kap-val').textContent = kap;
  s2.eta = etaStarOf(1, kap);
  $('s2-eta').value = s2.eta;
  $('s2-eta-val').textContent = fmt(s2.eta, 4);
  s2Compute(); s2Refresh();
}
$('s2-kap').addEventListener('input', e => s2SetKap(parseInt(e.target.value, 10)));
$('s2-eta').addEventListener('input', e => {
  s2.eta = parseFloat(e.target.value);
  $('s2-eta-val').textContent = fmt(s2.eta, 4);
  s2Compute(); s2Refresh();
});
$('s2-etastar').addEventListener('click', () => {
  s2.eta = etaStarOf(1, s2.kap);
  $('s2-eta').value = s2.eta;
  $('s2-eta-val').textContent = fmt(s2.eta, 4);
  s2Compute(); s2Refresh();
});
$('s2-step').addEventListener('click', () => { s2.reveal = Math.min(s2.path.pts.length, s2.reveal + 1); s2Refresh(); });
$('s2-runall').addEventListener('click', () => { s2.reveal = s2.path.pts.length; s2.playing = false; s2Refresh(); });
$('s2-play').addEventListener('click', () => { s2.playing = !s2.playing; if (s2.playing && s2.reveal >= s2.path.pts.length) s2.reveal = 1; s2Readout(); });
$('s2-reset').addEventListener('click', () => { s2.reveal = 1; s2.playing = false; s2Refresh(); });
animate($('step2'), dt => {
  if (!s2.playing) return;
  s2.acc += dt;
  if (s2.acc >= 0.05) {
    s2.acc = 0;
    const total = s2.path.pts.length;
    s2.reveal = Math.min(total, s2.reveal + Math.max(1, Math.floor(total / 200)));
    if (s2.reveal >= total) s2.playing = false;
    s2Refresh();
  }
});
onLangRefresh(() => s2Refresh());
onRefit(() => s2Draw());

/* ================================================================
   第 3 步：动量（双轨并行）
   ================================================================ */
const S3_START = [2.3, 2.3];
const s3 = { kap: 20, beta: 0.5, gd: null, mo: null, reveal: 1, playing: false, acc: 0 };
const s3lcv = $('s3-left'), s3rcv = $('s3-right');
function s3Compute() {
  const A = canyonA(s3.kap), eta = etaStarOf(1, s3.kap);
  s3.gd = heavyBallPathQuad(A, S3_START, eta, 0, { maxSteps: 6000 });
  s3.mo = heavyBallPathQuad(A, S3_START, eta, s3.beta, { maxSteps: 6000 });
  s3.reveal = 1; s3.playing = false;
}
function s3DrawOne(cv, pathObj, color) {
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  ctx.clearRect(0, 0, w, h);
  const v = squareView(cv, 3.1, 6);
  drawFrame(ctx, v, 3.1);
  const A = canyonA(s3.kap), f0v = quadF(A, S3_START);
  const levels = [];
  for (let k = 1; k <= 14; k++) levels.push(f0v * Math.pow(0.78, k));
  drawQuadContours(ctx, v, A, [0, 0], levels, 'rgba(103,215,249,0.4)');
  drawPathPts(ctx, v, pathObj.pts.slice(0, s3.reveal), color, color);
  ctx.restore();
}
function s3Draw() { s3DrawOne(s3lcv, s3.gd, '#6ee7ff'); s3DrawOne(s3rcv, s3.mo, '#ffb454'); }
function s3StepsTxt(obj) { return obj.stepsToEps >= 0 ? String(obj.stepsToEps) : (obj.diverged ? '∞' : t('s3na')); }
function s3Readout() {
  $('s3-right-lab').textContent = t('s3rightLab', { beta: fmt(s3.beta, 2) });
  $('s3-readout').innerHTML = t('s3ro', {
    eta: fmt(etaStarOf(1, s3.kap), 4), n: Math.min(s3.reveal, Math.max(s3.gd.pts.length, s3.mo.pts.length)) - 1,
    gd: s3StepsTxt(s3.gd), mo: s3StepsTxt(s3.mo)
  });
  $('s3-play').textContent = t(s3.playing ? 's3pause' : 's3play');
}
function s3Refresh() { s3Draw(); s3Readout(); }
$('s3-kap').addEventListener('input', e => { s3.kap = parseInt(e.target.value, 10); $('s3-kap-val').textContent = s3.kap; s3Compute(); s3Refresh(); });
$('s3-beta').addEventListener('input', e => { s3.beta = parseFloat(e.target.value); $('s3-beta-val').textContent = fmt(s3.beta, 2); s3Compute(); s3Refresh(); });
$('s3-step').addEventListener('click', () => { s3.reveal = Math.min(Math.max(s3.gd.pts.length, s3.mo.pts.length), s3.reveal + 1); s3Refresh(); });
$('s3-runall').addEventListener('click', () => { s3.reveal = Math.max(s3.gd.pts.length, s3.mo.pts.length); s3.playing = false; s3Refresh(); });
$('s3-play').addEventListener('click', () => { s3.playing = !s3.playing; const mx = Math.max(s3.gd.pts.length, s3.mo.pts.length); if (s3.playing && s3.reveal >= mx) s3.reveal = 1; s3Readout(); });
$('s3-reset').addEventListener('click', () => { s3.reveal = 1; s3.playing = false; s3Refresh(); });
animate($('step3'), dt => {
  if (!s3.playing) return;
  s3.acc += dt;
  if (s3.acc >= 0.05) {
    s3.acc = 0;
    const mx = Math.max(s3.gd.pts.length, s3.mo.pts.length);
    s3.reveal = Math.min(mx, s3.reveal + Math.max(1, Math.floor(mx / 200)));
    if (s3.reveal >= mx) s3.playing = false;
    s3Refresh();
  }
});
onLangRefresh(() => s3Refresh());
onRefit(() => s3Draw());

/* ================================================================
   第 4 步：随机梯度下降
   ================================================================ */
const S4_STEPS = 90, S4_BATCHES = [1, 4, 16, SGD_N];
const s4 = { B: 4, run: null, k: 0, playing: false, acc: 0 };
const s4dcv = $('s4-data'), s4ccv = $('s4-contour');
const SGD_OLS = sgdOLS();
const SGD_H = (() => {
  let sxx = 0, sx = 0;
  for (const d of SGD_DATA) { sxx += d.x * d.x; sx += d.x; }
  return [[2 * sxx / SGD_N, 2 * sx / SGD_N], [2 * sx / SGD_N, 2]];
})();
function s4Compute() { s4.run = sgdRun(s4.B, S4_STEPS); s4.k = 0; s4.playing = false; }
function s4Heads() {
  return { g: s4.run.gd[s4.k], s: s4.run.sgd[s4.k] };
}
function s4DrawData() {
  const ctx = fitCanvas(s4dcv);
  const w = s4dcv._w, h = s4dcv._h;
  ctx.clearRect(0, 0, w, h);
  const v = rectView(s4dcv, [-2.4, 2.4], [-3.6, 3.8], 46);
  const rows = legendRows(ctx, [[t('cv4fitG'), '#6ee7ff'], [t('cv4fitS'), '#ffb454'], [t('cv4ols'), '#9aa7b8']], w - 24);
  drawFrameRect(ctx, v);
  const line = (th, color, dash) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []);
    ctx.beginPath();
    ctx.moveTo(v.X(-2.4), v.Y(th[0] * -2.4 + th[1]));
    ctx.lineTo(v.X(2.4), v.Y(th[0] * 2.4 + th[1]));
    ctx.stroke(); ctx.setLineDash([]);
  };
  line(SGD_OLS, 'rgba(154,167,184,0.8)', [5, 5]);
  const hd = s4Heads();
  line(hd.g, '#6ee7ff');
  line(hd.s, '#ffb454');
  ctx.fillStyle = '#e8edf4';
  for (const d of SGD_DATA) { ctx.beginPath(); ctx.arc(v.X(d.x), v.Y(d.y), 3, 0, 2 * Math.PI); ctx.fill(); }
  ctx.restore();
  drawLegendRows(ctx, rows, 12, h - rows.length * 16 - 4);
}
function s4DrawContour() {
  const ctx = fitCanvas(s4ccv);
  const w = s4ccv._w, h = s4ccv._h;
  ctx.clearRect(0, 0, w, h);
  const v = rectView(s4ccv, [-2.6, 3.2], [-2.2, 3.4], 46);
  const rows = legendRows(ctx, [[t('cv4gd'), '#6ee7ff'], [t('cv4sgd'), '#ffb454'], [t('cv4true'), '#7ee2a8'], [t('cv4batch'), '#ff7a93']], w - 24);
  drawFrameRect(ctx, v);
  const Lstar = sgdLoss(SGD_OLS), levels = [];
  for (let k = 0; k <= 11; k++) levels.push(0.10 * Math.pow(1.5, k));
  drawQuadContours(ctx, v, SGD_H, SGD_OLS, levels, 'rgba(103,215,249,0.38)');
  void Lstar;
  drawPathPts(ctx, v, s4.run.gd.slice(0, s4.k + 1), '#6ee7ff', '#6ee7ff');
  drawPathPts(ctx, v, s4.run.sgd.slice(0, s4.k + 1), '#ffb454', '#ffb454');
  /* 当前 SGD 点的双箭头：全量梯度（绿）与本步 batch 梯度（粉） */
  const hd = s4Heads(), thS = hd.s;
  const gf = sgdGradFull(thS);
  drawArrow(ctx, v.X(thS[0]), v.Y(thS[1]), -gf[0] * v.pxPerX, gf[1] * v.pxPerY, 44, '#7ee2a8');
  const bi = Math.min(s4.k, s4.run.batches.length - 1);
  if (bi >= 0) {
    const gb = sgdGradIdx(thS, s4.run.batches[bi]);
    drawArrow(ctx, v.X(thS[0]), v.Y(thS[1]), -gb[0] * v.pxPerX, gb[1] * v.pxPerY, 44, '#ff7a93');
  }
  ctx.restore();
  drawLegendRows(ctx, rows, 12, h - rows.length * 16 - 4);
}
function s4Draw() { s4DrawData(); s4DrawContour(); }
function s4Readout() {
  const hd = s4Heads();
  let ang = NaN;
  const bi = Math.min(s4.k, s4.run.batches.length - 1);
  if (bi >= 0) {
    const gf = sgdGradFull(hd.s), gb = sgdGradIdx(hd.s, s4.run.batches[bi]);
    const mf = Math.hypot(gf[0], gf[1]), mb = Math.hypot(gb[0], gb[1]);
    if (mf > 1e-12 && mb > 1e-12) ang = Math.acos(clamp((gf[0] * gb[0] + gf[1] * gb[1]) / (mf * mb), -1, 1)) * 180 / Math.PI;
  }
  let roHtml = t('s4ro', {
    k: s4.k, lg: fmtSmart(sgdLoss(hd.g)), ls: fmtSmart(sgdLoss(hd.s)), ang: isFinite(ang) ? fmt(ang, 1) : '—'
  });
  /* 末步（k = 90）已无「下一步」：粉箭头画的是产生这最后一步的批次，读数里注明口径 */
  if (s4.k >= S4_STEPS && s4.run.batches.length) roHtml += t('s4lastNote');
  $('s4-readout').innerHTML = roHtml;
  $('s4-play').textContent = t(s4.playing ? 's4pause' : 's4play');
}
function s4Texts() {
  $('s4-explain').innerHTML = t('s4e', { N: SGD_N });
  $('s4-formula').textContent = t('s4formula', { seed: SGD_SEED, N: SGD_N });
  $('s4-batch-val').textContent = s4.B === SGD_N ? t('s4bFull', { N: SGD_N }) : String(s4.B);
}
function s4Refresh() { s4Draw(); s4Readout(); }
$('s4-batch').addEventListener('input', e => { s4.B = S4_BATCHES[parseInt(e.target.value, 10)]; s4Texts(); s4Compute(); s4Refresh(); });
$('s4-step').addEventListener('click', () => { s4.k = Math.min(S4_STEPS, s4.k + 1); s4Refresh(); });
$('s4-play').addEventListener('click', () => { s4.playing = !s4.playing; if (s4.playing && s4.k >= S4_STEPS) s4.k = 0; s4Refresh(); });
$('s4-reset').addEventListener('click', () => { s4.k = 0; s4.playing = false; s4Refresh(); });
animate($('step4'), dt => {
  if (!s4.playing) return;
  s4.acc += dt;
  if (s4.acc >= 0.16) { s4.acc = 0; s4.k = Math.min(S4_STEPS, s4.k + 1); if (s4.k >= S4_STEPS) s4.playing = false; s4Refresh(); }
});
onLangRefresh(() => { s4Texts(); s4Refresh(); });
onRefit(() => s4Draw());

/* ================================================================
   第 5 步：非凸地形（双谷 + 鞍点）
   ================================================================ */
const NC_SADDLE = NC_CPS.find(c => c.type === 'saddle');
const NC_STARTS = [
  [-1.55, 1.05],
  [1.55, -1.05],
  [NC_SADDLE.x + 0.0005, 0]
];
/* 离脊判据：|x − x鞍点| 首次 ≥ 0.5 记为「离脊」；无噪声/噪声同判据、同起点 C 对照 */
const S5_ESC_THR = 0.5;
const s5 = { startIdx: 2, start: null, eta: 0.06, noise: false, path: [], gauss: null, playing: false, acc: 0, diverged: false, bg: null, bgKey: '', escStep: null, escRec: { plain: null, noise: null }, escArmed: false };
const s5cv = $('s5-canvas');
function s5Reset() {
  s5.start = NC_STARTS[s5.startIdx].slice();
  s5.path = [[s5.start[0], s5.start[1]]];
  const rng = mulberry32(NC_NOISE_SEED);
  s5.gauss = makeGauss(rng);
  s5.playing = false; s5.diverged = false;
  s5.escStep = null; s5.escArmed = (s5.startIdx === 2);
  s5Draw(); s5Readout();
}
function s5Status(p) {
  if (s5.diverged) return t('s5stDiv');
  for (const c of NC_CPS) {
    if (c.type !== 'min') continue;
    const d = Math.hypot(p[0] - c.x, p[1] - c.y);
    if (d < 0.06) {
      if (s5.noise) return t(c.x < 0 ? 's5stWellNoiseL' : 's5stWellNoiseR');
      return t(c.x < 0 ? 's5stWellL' : 's5stWellR');
    }
    /* 噪声开着时球不会静止：靠近谷底就如实报「在谷底附近抖动」，不报「停在」 */
    if (s5.noise && d < 0.35) return t(c.x < 0 ? 's5stWellNoiseL' : 's5stWellNoiseR');
  }
  const g = ncG(p);
  if (Math.abs(p[0] - NC_SADDLE.x) < 0.35 && Math.abs(p[1]) < 0.7 && Math.hypot(g[0], g[1]) < 0.15) return t('s5stSaddle');
  return t('s5stGo');
}
function s5StepOnce() {
  if (s5.diverged || s5.path.length > 3000) { s5.playing = false; return; }
  const p = s5.path[s5.path.length - 1], g = ncG(p);
  let gx = g[0], gy = g[1];
  if (s5.noise) { gx += NC_NOISE_SIGMA * s5.gauss(); gy += NC_NOISE_SIGMA * s5.gauss(); }
  const np = [p[0] - s5.eta * gx, p[1] - s5.eta * gy];
  if (!isFinite(np[0]) || !isFinite(np[1]) || Math.hypot(np[0], np[1]) > 50) { s5.diverged = true; s5.playing = false; }
  else {
    s5.path.push(np);
    if (s5.escStep === null && Math.abs(np[0] - NC_SADDLE.x) >= S5_ESC_THR) {
      s5.escStep = s5.path.length - 1;
      if (s5.escArmed) s5.escRec[s5.noise ? 'noise' : 'plain'] = s5.escStep;
    }
  }
  s5Draw(); s5Readout();
}
/* 地形底图：f 的分带填色（offscreen，按尺寸缓存） */
function s5Bg(w, h, v) {
  const key = w + 'x' + h;
  if (s5.bg && s5.bgKey === key) return s5.bg;
  const off = document.createElement('canvas');
  const GW = 190, GH = 190;
  off.width = GW; off.height = GH;
  const octx = off.getContext('2d');
  const img = octx.createImageData(GW, GH);
  const fmin = -0.32, fmax = 13.6, NB = 15;
  const edges = [];
  for (let i = 0; i <= NB; i++) edges.push(fmin + (fmax - fmin) * Math.pow(i / NB, 1.55));
  const cols = [];
  for (let i = 0; i < NB; i++) {
    const u = i / (NB - 1);
    cols.push([Math.round(13 + 26 * u), Math.round(22 + 52 * u), Math.round(34 + 66 * u)]);
  }
  for (let j = 0; j < GH; j++) {
    const y = 2.05 - (j + 0.5) / GH * 4.1;
    for (let i = 0; i < GW; i++) {
      const x = -2.05 + (i + 0.5) / GW * 4.1;
      const fv = ncF([x, y]);
      let b = NB - 1;
      for (let k = 0; k < NB; k++) { if (fv < edges[k + 1]) { b = k; break; } }
      const o = (j * GW + i) * 4, c = cols[b];
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  s5.bg = off; s5.bgKey = key;
  return off;
}
function s5Draw() {
  const ctx = fitCanvas(s5cv);
  const w = s5cv._w, h = s5cv._h;
  ctx.clearRect(0, 0, w, h);
  const v = squareView(s5cv, 2.05, 46);
  const rows = legendRows(ctx, [[t('cv5minL'), '#7ee2a8'], [t('cv5minR'), '#a8e063'], [t('cv5saddle'), '#ffb454'], [t('cv5start'), '#e8edf4']], w - 24);
  drawFrame(ctx, v, 2.05);
  const bg = s5Bg(Math.round(v.size), Math.round(v.size), v);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(bg, v.ox, v.oy, v.size, v.size);
  drawPathPts(ctx, v, s5.path, '#ffb454', '#ffb454');
  ctx.restore();
  /* 临界点与起点标记在裁剪区外画：标签可伸出绘图框，不被切字 */
  /* 临界点标记 */
  ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'middle';
  for (const c of NC_CPS) {
    const X = v.X(c.x), Y = v.Y(c.y);
    if (c.type === 'min') {
      ctx.beginPath(); ctx.arc(X, Y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = c.x < 0 ? '#7ee2a8' : '#a8e063'; ctx.fill();
      ctx.strokeStyle = '#08131a'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = c.x < 0 ? '#7ee2a8' : '#a8e063';
      if (w < 560) {
        /* 窄屏：谷底标签居中放到标记上方，与下方居中的鞍点标签错行，避免英文长标签互撞 */
        const lab = t(c.x < 0 ? 'cv5minL' : 'cv5minR'), tw = ctx.measureText(lab).width;
        ctx.textAlign = 'center';
        ctx.fillText(lab, clamp(X, tw / 2 + 4, w - tw / 2 - 4), Y - 16);
      } else {
        /* 左谷标签向左伸、右谷标签向右伸，避免三标签在鞍点附近相撞 */
        drawSideLabel(ctx, t(c.x < 0 ? 'cv5minL' : 'cv5minR'), X, Y, w, c.x > 0);
      }
    } else {
      ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(X - 6, Y - 6); ctx.lineTo(X + 6, Y + 6);
      ctx.moveTo(X + 6, Y - 6); ctx.lineTo(X - 6, Y + 6);
      ctx.stroke();
      /* 鞍点标签放标记下方居中（左右都是谷底标签的地盘） */
      ctx.fillStyle = '#ffb454'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(t('cv5saddle'), X, Y + 20);
    }
  }
  /* 起点标记 */
  if (s5.start) {
    ctx.beginPath(); ctx.arc(v.X(s5.start[0]), v.Y(s5.start[1]), 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#e8edf4'; ctx.fill();
  }
  drawLegendRows(ctx, rows, 12, h - rows.length * 16 - 4);
}
function s5Readout() {
  const p = s5.path[s5.path.length - 1], g = ncG(p);
  $('s5-readout').innerHTML = t('s5ro', {
    n: s5.path.length - 1, x: fmtS(p[0]), y: fmtS(p[1]), f: fmtSmart(ncF(p)),
    g: fmtSmart(Math.hypot(g[0], g[1])), status: s5Status(p)
  });
  $('s5-esc').innerHTML = t('s5esc', {
    eta: fmt(s5.eta, 3),
    plain: s5.escRec.plain === null ? '—' : s5.escRec.plain,
    noise: s5.escRec.noise === null ? '—' : s5.escRec.noise
  });
  $('s5-play').textContent = t(s5.playing ? 's5pause' : 's5play');
}
document.querySelectorAll('#s5-presets .btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#s5-presets .btn').forEach(x => x.classList.toggle('active', x === b));
  s5.startIdx = parseInt(b.dataset.start, 10);
  s5Reset();
}));
$('s5-eta').addEventListener('input', e => { s5.eta = parseFloat(e.target.value); $('s5-eta-val').textContent = fmt(s5.eta, 3); s5.escRec = { plain: null, noise: null }; s5Reset(); });
$('s5-noise').addEventListener('change', e => { s5.noise = e.target.checked; s5Reset(); });
$('s5-step').addEventListener('click', s5StepOnce);
$('s5-play').addEventListener('click', () => { s5.playing = !s5.playing; if (s5.playing && (s5.diverged || s5.path.length > 3000)) s5Reset(), s5.playing = true; s5Readout(); });
$('s5-reset').addEventListener('click', s5Reset);
s5cv.addEventListener('pointerdown', e => {
  const rect = s5cv.getBoundingClientRect();
  const v = squareView(s5cv, 2.05, 46);
  const x = v.invX(e.clientX - rect.left), y = v.invY(e.clientY - rect.top);
  if (Math.abs(x) <= 2.05 && Math.abs(y) <= 2.05) {
    document.querySelectorAll('#s5-presets .btn').forEach(b => b.classList.remove('active'));
    s5.start = [x, y]; s5.path = [[x, y]];
    const rng = mulberry32(NC_NOISE_SEED); s5.gauss = makeGauss(rng);
    s5.playing = false; s5.diverged = false;
    s5.escStep = null; s5.escArmed = false;
    s5Draw(); s5Readout();
  }
});
animate($('step5'), dt => {
  if (!s5.playing) return;
  s5.acc += dt;
  if (s5.acc >= 0.07) { s5.acc = 0; s5StepOnce(); }
});
onLangRefresh(() => { s5Draw(); s5Readout(); });
onRefit(() => { s5.bg = null; s5Draw(); });

/* ================================================================
   第 6 步：终章（真训一个线性回归分类器）
   ================================================================ */
const s6 = { eta: 0.35, thetas: [], losses: [], playing: false, acc: 0, blown: false };
const s6scv = $('s6-scatter'), s6lcv = $('s6-loss');
function s6Reset() {
  s6.thetas = [{ w1: LR_INIT.w1, w2: LR_INIT.w2, b: LR_INIT.b }];
  s6.losses = [lrLoss(s6.thetas[0])];
  s6.playing = false; s6.blown = false;
  s6Draw(); s6Readout();
}
function s6Advance(n) {
  for (let i = 0; i < n; i++) {
    if (s6.blown || s6.thetas.length > 1500) { s6.playing = false; break; }
    const th = lrStep(s6.thetas[s6.thetas.length - 1], s6.eta);
    if (!isFinite(th.w1) || !isFinite(th.w2) || !isFinite(th.b) || Math.max(Math.abs(th.w1), Math.abs(th.w2), Math.abs(th.b)) > 1e5) {
      s6.blown = true; s6.playing = false; break;
    }
    const L = lrLoss(th);
    if (!isFinite(L) || L > 1e6) { s6.thetas.push(th); s6.losses.push(L); s6.blown = true; s6.playing = false; break; }
    s6.thetas.push(th); s6.losses.push(L);
  }
  s6Draw(); s6Readout();
}
function s6DrawScatter() {
  const ctx = fitCanvas(s6scv);
  const w = s6scv._w, h = s6scv._h;
  ctx.clearRect(0, 0, w, h);
  const v = squareView(s6scv, 3.15, 30);
  const rows = legendRows(ctx, [[t('cv6a'), '#6ee7ff'], [t('cv6b'), '#ffb454'], [t('cv6bnd'), '#7ee2a8']], w - 24);
  drawFrame(ctx, v, 3.15);
  const th = s6.thetas[s6.thetas.length - 1];
  /* 决策边界：打分 ŷ = 0.5 处，即 w₁x + w₂y + (b − 0.5) = 0 */
  const bb = th.b - 0.5;
  ctx.strokeStyle = '#7ee2a8'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (Math.abs(th.w2) >= Math.abs(th.w1) && Math.abs(th.w2) > 1e-9) {
    ctx.moveTo(v.X(-3.15), v.Y(-(th.w1 * -3.15 + bb) / th.w2));
    ctx.lineTo(v.X(3.15), v.Y(-(th.w1 * 3.15 + bb) / th.w2));
  } else if (Math.abs(th.w1) > 1e-9) {
    ctx.moveTo(v.X(-(th.w2 * -3.15 + bb) / th.w1), v.Y(-3.15));
    ctx.lineTo(v.X(-(th.w2 * 3.15 + bb) / th.w1), v.Y(3.15));
  }
  ctx.stroke();
  for (const d of LR_DATA) {
    ctx.beginPath(); ctx.arc(v.X(d.x), v.Y(d.y), 4.4, 0, 2 * Math.PI);
    ctx.fillStyle = d.c === 0 ? '#6ee7ff' : '#ffb454'; ctx.fill();
    ctx.strokeStyle = 'rgba(8,19,26,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
  drawLegendRows(ctx, rows, 12, h - rows.length * 16 - 4);
}
function s6DrawLoss() {
  const ctx = fitCanvas(s6lcv);
  const w = s6lcv._w, h = s6lcv._h;
  ctx.clearRect(0, 0, w, h);
  const legH = 26, pw = w - 56, ph = h - legH - 12, ox = 44, oy = 6;
  /* 标题靠右上：左上要留给纵轴顶刻度（lmax），同行并置会叠压（EN 390 实测） */
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText(t('cv6lossT'), w - 10, 12);
  ctx.textAlign = 'left';
  const kmax = Math.max(60, s6.losses.length - 1);
  let lmax = 0.75;
  for (const L of s6.losses) if (isFinite(L)) lmax = Math.max(lmax, L);
  lmax *= 1.12;
  const X = k => ox + k / kmax * pw, Y = L => oy + ph - clamp(L, 0, lmax) / lmax * ph;
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.strokeRect(ox, oy, pw, ph);
  ctx.fillStyle = '#9aa7b8'; ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(fmt(lmax, 2), ox - 5, oy + 6);
  ctx.fillText('0', ox - 5, oy + ph - 4);
  ctx.textAlign = 'left';
  ctx.fillText('k = ' + kmax, ox + pw - 44, oy + ph + 12);
  const clipped = s6.losses.some(L => isFinite(L) && L > lmax / 1.12);
  ctx.save();
  ctx.beginPath(); ctx.rect(ox, oy, pw, ph); ctx.clip();
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  s6.losses.forEach((L, k) => { const px = X(k), py = Y(isFinite(L) ? L : lmax); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
  ctx.stroke();
  const lastL = s6.losses[s6.losses.length - 1];
  ctx.beginPath(); ctx.arc(X(s6.losses.length - 1), Y(isFinite(lastL) ? lastL : lmax), 4, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffb454'; ctx.fill();
  ctx.restore();
  if (clipped || s6.blown) drawClipNote(ctx, w - 8, 26, t('cv6clip'), ox + 6);
}
function s6Draw() { s6DrawScatter(); s6DrawLoss(); }
function s6Readout() {
  const th = s6.thetas[s6.thetas.length - 1], L = s6.losses[s6.losses.length - 1];
  $('s6-readout').innerHTML = t('s6ro', {
    k: s6.thetas.length - 1, loss: fmtSmart(L), acc: fmt(lrAcc(th) * 100, 1),
    w1: fmtS(th.w1), w2: fmtS(th.w2), b: fmtS(th.b), div: s6.blown ? t('s6div') : ''
  });
  $('s6-play').textContent = t(s6.playing ? 's6pause' : 's6play');
}
function s6Texts() {
  $('s6-explain').innerHTML = t('s6e', { N: LR_N });
  $('s6-cards-h').textContent = t('s6cardsH');
}
$('s6-eta').addEventListener('input', e => { s6.eta = parseFloat(e.target.value); $('s6-eta-val').textContent = fmt(s6.eta, 2); });
$('s6-step1').addEventListener('click', () => s6Advance(1));
$('s6-step10').addEventListener('click', () => s6Advance(10));
$('s6-play').addEventListener('click', () => { s6.playing = !s6.playing; if (s6.playing && s6.blown) { s6Reset(); s6.playing = true; } s6Readout(); });
$('s6-reset').addEventListener('click', s6Reset);
animate($('step6'), dt => {
  if (!s6.playing) return;
  s6.acc += dt;
  if (s6.acc >= 0.09) { s6.acc = 0; s6Advance(1); }
});
onLangRefresh(() => { s6Texts(); s6Draw(); s6Readout(); });
onRefit(() => s6Draw());

/* ================================================================
   初始化（语言先行由 i18n.js 的 DOMContentLoaded 触发 applyLang → onLangRefresh 重绘；
   这里先做一次与语言无关的计算与首绘，避免空白）
   ================================================================ */
s0Draw(); s0Readout();
s1Draw(); s1Readout();
s2Compute(); s2Refresh();
s3Compute(); s3Refresh();
s4Texts(); s4Compute(); s4Refresh();
s5Reset();
s6Texts(); s6Reset();
document.querySelectorAll('#step0 [data-eta]').forEach(b => b.classList.toggle('active', Math.abs(parseFloat(b.dataset.eta) - s0.eta) < 1e-9));

/* ================================================================
   window.GRAD — 评审对账接口
   ================================================================ */
window.GRAD = {
  s0: { f: f0, grad: g0, step: s0Step, iterate: s0Iterate, regime: s0Regime },
  s1: { f: f1, grad: g1, step: (p, eta) => gdStep(null, g1, p, eta) },
  quad: {
    f: quadF, grad: quadG, eig: eig2, canyonA,
    etaStar: etaStarOf, etaLimit: etaLimitOf, rate: rateOf,
    gdPath: gdPathQuad, heavyBallPath: heavyBallPathQuad
  },
  sgd: {
    seed: SGD_SEED, batchSeed: SGD_BATCH_SEED, eta: SGD_ETA, start: SGD_START.slice(),
    data: SGD_DATA, loss: sgdLoss, gradFull: sgdGradFull, gradBatch: sgdGradIdx,
    ols: sgdOLS, hessian: SGD_H, makeBatcher: B => { const b = makeBatcher(B); return { next: () => b.next().slice() }; },
    run: sgdRun
  },
  nc: {
    f: ncF, grad: ncG, hess: ncH, criticalPoints: () => NC_CPS,
    starts: NC_STARTS, noiseSeed: NC_NOISE_SEED, noiseSigma: NC_NOISE_SIGMA
  },
  lr: {
    seed: LR_SEED, data: LR_DATA, init: { w1: LR_INIT.w1, w2: LR_INIT.w2, b: LR_INIT.b },
    loss: lrLoss, grad: lrGrad, accuracy: lrAcc, step: lrStep
  },
  state: {
    s0: () => ({ eta: s0.eta, xs: s0.xs.slice() }),
    s1: () => ({ eta: s1.eta, path: s1.path.map(p => p.slice()), done: s1.done }),
    s2: () => ({ kap: s2.kap, eta: s2.eta, start: S2_START.slice(), stepsToEps: s2.path.stepsToEps, diverged: s2.path.diverged, pts: s2.path.pts.map(p => p.slice()), reveal: s2.reveal }),
    s3: () => ({ kap: s3.kap, beta: s3.beta, eta: etaStarOf(1, s3.kap), start: S3_START.slice(), gdSteps: s3.gd.stepsToEps, moSteps: s3.mo.stepsToEps, gd: s3.gd.pts.map(p => p.slice()), mo: s3.mo.pts.map(p => p.slice()) }),
    s4: () => ({ B: s4.B, k: s4.k, gd: s4.run.gd.map(p => p.slice()), sgd: s4.run.sgd.map(p => p.slice()), batches: s4.run.batches.map(b => b.slice()) }),
    s5: () => ({ eta: s5.eta, noise: s5.noise, start: s5.start ? s5.start.slice() : null, startIdx: s5.startIdx, path: s5.path.map(p => p.slice()), diverged: s5.diverged, esc: { thr: S5_ESC_THR, cur: s5.escStep, plain: s5.escRec.plain, noise: s5.escRec.noise, armed: s5.escArmed } }),
    s6: () => ({ eta: s6.eta, thetas: s6.thetas.map(th => ({ w1: th.w1, w2: th.w2, b: th.b })), losses: s6.losses.slice(), blown: s6.blown })
  }
};
