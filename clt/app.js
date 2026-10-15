'use strict';
/* 中心极限定理交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 直方图一律由真采样累积：带种子 mulberry32；经验均值/标准差/偏度
      全部由页面保存的样本均值数组现算，读数与数组严格自洽。
   2. 叠画的正态曲线只用理论参数 N(μ, σ/√n)：μ、σ 是母分布的理论值
      （来源公式见 PARENTS 注释与第 1 步公式行），绝不拿经验值冒充。
   3. σ/√n 在第 2/3 步多档 n 现场验证（经验 vs 理论比值读数）。
   4. 重尾诚实：帕累托 α ≤ 2 时 σ = ∞，页面不声称其均值趋于正态，
      不叠正态曲线；直方图不截尾美化（出窗样本折入边缘 bin 如实显示），
      经验统计仍由原始数组全量计算。
   5. 卷积阶梯真算：U(0,1) 分段常数密度（网格 dx = 0.002、格心取值）
      逐级离散卷积；每级积分恒为 1（离散卷积保总质量）；与 Irwin–Hall
      解析值的最大偏差约 2.6e-3（格心口径），方法写在第 5 步讲解里。
   6. 样本量 n = ⌈(zσ/E)²⌉（z = 1.96）闭式；算完真跑 K 组验证，
      覆盖率实测如实呈现（约 95% 上下统计波动，不写成恰好 95.00%）。
   评审对账接口：window.CLT（见文件末尾）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 带种子 PRNG：mulberry32（沿用蒙特卡洛/贝叶斯页贯例） ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let tt = Math.imul(a ^ (a >>> 15), 1 | a);
    tt = (tt + Math.imul(tt ^ (tt >>> 7), 61 | tt)) ^ tt;
    return ((tt ^ (tt >>> 14)) >>> 0) / 4294967296;
  };
}
function freshSeed() { return (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0; }
/* 高斯发生器（Box–Muller / Marsaglia polar），由传入的带种子 rng 驱动 */
function makeGauss(rng) {
  let spare = null;
  return function () {
    if (spare !== null) { const v = spare; spare = null; return v; }
    let u = 0, v = 0, s = 0;
    do { u = rng() * 2 - 1; v = rng() * 2 - 1; s = u * u + v * v; } while (s >= 1 || s === 0);
    const m = Math.sqrt(-2 * Math.log(s) / s);
    spare = v * m;
    return u * m;
  };
}

/* ================================================================
   母分布（理论参数全为闭式；σ 来源公式与第 1 步公式行一致）
   uniform U(0,1)：μ=(a+b)/2=0.5，σ=(b−a)/√12
   exp Exp(1)：μ=1/λ=1，σ=1/λ=1
   bimodal ½N(2,0.6²)+½N(5,0.6²)：μ=Σwᵢμᵢ=3.5，
     方差=Σwᵢ(σᵢ²+μᵢ²)−μ²=0.5(0.36+4)+0.5(0.36+25)−12.25=2.61
   dice：μ=3.5，σ²=(n²−1)/12（n=6）=35/12
   pareto(α)（x_m=1）：μ=α/(α−1)（α>1），
     方差=α/[(α−1)²(α−2)]（α>2），α≤2 时 σ=∞
   ================================================================ */
const BIMOD = { w: [0.5, 0.5], mu: [2, 5], sd: [0.6, 0.6] };
function parentSpec(id, alpha) {
  switch (id) {
    case 'uniform':
      return { id, mu: 0.5, sigma: 1 / Math.sqrt(12), fKey: 'fUniform', win: [-0.08, 1.08], discrete: false };
    case 'exp':
      return { id, mu: 1, sigma: 1, fKey: 'fExp', win: [-0.15, 5.2], discrete: false };
    case 'bimodal': {
      const ex2 = BIMOD.w[0] * (BIMOD.sd[0] ** 2 + BIMOD.mu[0] ** 2) + BIMOD.w[1] * (BIMOD.sd[1] ** 2 + BIMOD.mu[1] ** 2);
      const mu = BIMOD.w[0] * BIMOD.mu[0] + BIMOD.w[1] * BIMOD.mu[1];
      return { id, mu, sigma: Math.sqrt(ex2 - mu * mu), fKey: 'fBimodal', win: [-0.2, 7.2], discrete: false };
    }
    case 'dice':
      return { id, mu: 3.5, sigma: Math.sqrt(35 / 12), fKey: 'fDice', win: [0.7, 6.3], discrete: true };
    case 'pareto': {
      const a = alpha || 3.5;
      const mu = a / (a - 1);
      const sigma = a > 2 ? Math.sqrt(a / ((a - 1) * (a - 1) * (a - 2))) : Infinity;
      return { id, alpha: a, mu, sigma, fKey: a > 2 ? 'fPareto35' : 'fPareto15', win: a > 2 ? [0.8, 6.5] : [0.8, 12], discrete: false };
    }
  }
  throw new Error('unknown parent ' + id);
}
/* 理论 pdf（骰子为离散概率质量，单独处理） */
function parentPdf(id, alpha, x) {
  switch (id) {
    case 'uniform': return (x >= 0 && x <= 1) ? 1 : 0;
    case 'exp': return x >= 0 ? Math.exp(-x) : 0;
    case 'bimodal': {
      let s = 0;
      for (let i = 0; i < 2; i++) {
        const z = (x - BIMOD.mu[i]) / BIMOD.sd[i];
        s += BIMOD.w[i] * Math.exp(-0.5 * z * z) / (BIMOD.sd[i] * Math.sqrt(TAU));
      }
      return s;
    }
    case 'pareto': { const a = alpha || 3.5; return x >= 1 ? a * Math.pow(x, -a - 1) : 0; }
  }
  return 0;
}
/* 采样器：带种子、同种子同序列；返回 {draw, spec} */
function makeSampler(id, alpha, seed) {
  const spec = parentSpec(id, alpha);
  const rng = mulberry32(seed);
  const gauss = makeGauss(rng);
  let draw;
  switch (id) {
    case 'uniform': draw = () => rng(); break;
    case 'exp': draw = () => -Math.log(1 - rng()); break;
    case 'bimodal': draw = () => { const c = rng() < BIMOD.w[0] ? 0 : 1; return BIMOD.mu[c] + BIMOD.sd[c] * gauss(); }; break;
    case 'dice': draw = () => 1 + Math.floor(rng() * 6); break;
    case 'pareto': { const a = spec.alpha; draw = () => Math.pow(1 - rng(), -1 / a); break; }
  }
  return { draw, spec, rng };
}
/* 抽 K 组样本均值（每组 n 个），全量真采样；同时记录最大单值 */
function sampleMeans(id, alpha, n, K, seed) {
  const s = makeSampler(id, alpha, seed);
  const means = new Float64Array(K);
  let maxSingle = -Infinity;
  for (let i = 0; i < K; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) { const v = s.draw(); sum += v; if (v > maxSingle) maxSingle = v; }
    means[i] = sum / n;
  }
  return { means, maxSingle };
}
/* 数组统计（总体口径，与读数一致） */
function arrMean(a, n) { let s = 0; for (let i = 0; i < n; i++) s += a[i]; return s / n; }
function arrStd(a, n, m) { let s = 0; for (let i = 0; i < n; i++) { const d = a[i] - m; s += d * d; } return Math.sqrt(s / n); }
function arrSkew(a, n, m, sd) {
  if (!(sd > 0)) return 0;
  let s = 0; for (let i = 0; i < n; i++) { const z = (a[i] - m) / sd; s += z * z * z; }
  return s / n;
}
function normPdf(x, mu, sd) { const z = (x - mu) / sd; return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(TAU)); }
function theoryStd(id, alpha, n) { const sp = parentSpec(id, alpha); return sp.sigma / Math.sqrt(n); }

/* ---------- 画布适配（DPR）：沿用站内 fitCanvas 方案 ---------- */
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
function fmt(v, d) { if (!isFinite(v)) return '∞'; return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
function fmtInt(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
/* 图例助手（画布内图例窄屏自适应）：量宽 → 贪心分行 → 逐行绘制（沿用贝叶斯页做法） */
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
/* 直方图分箱（密度口径）：出窗样本折入边缘 bin，不丢弃 */
function histBins(means, count, lo, hi, nb) {
  const bins = new Float64Array(nb);
  const w = (hi - lo) / nb;
  for (let i = 0; i < count; i++) {
    const x = means[i];
    let b = x <= lo ? 0 : x >= hi ? nb - 1 : Math.floor((x - lo) / w);
    bins[b]++;
  }
  return { bins, w };
}
/* 出窗样本计数（与 histBins 同口径：x < lo 折入左缘、x > hi 折入右缘；
   恰好落在边界上的点归内侧，与分箱的 <= / >= 判定互补不重叠于内部） */
function countFold(means, count, lo, hi) {
  let below = 0, above = 0;
  for (let i = 0; i < count; i++) {
    const x = means[i];
    if (x < lo) below++;
    else if (x > hi) above++;
  }
  return { below, above };
}
/* 折入徽章（第 2 轮修复·建议 1）：直方图有出窗样本折入边缘柱时，
   在图面相应一侧的顶部画一枚小牌说明，避免读者把边缘柱误读成
   「值在那里扎堆」。只在该侧折入数 > 0 时出现；计数同步写进 canvas
   的 dataset（foldBelow/foldAbove），供自测/评审程序化核对。 */
function drawFoldBadges(ctx, g, means, count, lo, hi) {
  const { below, above } = countFold(means, count, lo, hi);
  ctx.canvas.dataset.foldBelow = String(below);
  ctx.canvas.dataset.foldAbove = String(above);
  const y = g.T + 13;
  const badge = (txt, right) => {
    ctx.font = '11.5px system-ui, sans-serif';
    const tw = ctx.measureText(txt).width;
    const bw = tw + 14, bh = 19;
    const bx = right ? g.L + g.pw - 2 - bw : g.L + 2;
    ctx.fillStyle = 'rgba(10,14,20,0.78)';
    ctx.strokeStyle = 'rgba(255,180,84,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, y - bh / 2, bw, bh, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffb454';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, bx + 7, y + 0.5);
  };
  if (above > 0) badge(t('foldR', { c: fmtInt(above) }), true);
  if (below > 0) badge(t('foldL', { c: fmtInt(below) }), false);
}
/* 通用直方图绘制：返回绘图区几何，供调用方叠曲线/图例 */
function drawHistPlot(ctx, opts) {
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const L = 14, R = 14, T = opts.topPad !== undefined ? opts.topPad : 34, B = 24;
  const pw = W - L - R, ph = H - T - B;
  const { lo, hi } = opts;
  const cnt = Math.max(0, opts.count | 0);
  const { bins, w } = cnt ? histBins(opts.means, cnt, lo, hi, opts.nb || 40)
    : { bins: new Float64Array(opts.nb || 40), w: (hi - lo) / (opts.nb || 40) };
  let ymax = 0;
  if (cnt) for (let i = 0; i < bins.length; i++) { const d = bins[i] / (cnt * w); if (d > ymax) ymax = d; }
  if (opts.curveMax) ymax = Math.max(ymax, opts.curveMax);
  if (!(ymax > 0)) ymax = 1;
  ymax *= 1.08;
  const X = x => L + (x - lo) / (hi - lo) * pw;
  const Y = y => T + ph - y / ymax * ph;
  /* 坐标轴与刻度（lo / 中点 / hi） */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();
  ctx.font = '11.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const dec = opts.dec !== undefined ? opts.dec : (hi - lo > 4 ? 1 : 2);
  for (const xv of [lo, (lo + hi) / 2, hi]) ctx.fillText(fmt(xv, dec), X(xv), T + ph + 6);
  /* 柱 */
  ctx.fillStyle = opts.barColor || 'rgba(110,231,255,0.55)';
  if (cnt) for (let i = 0; i < bins.length; i++) {
    const d = bins[i] / (cnt * w);
    if (d <= 0) continue;
    const x0 = X(lo + i * w), x1 = X(lo + (i + 1) * w);
    ctx.fillRect(x0 + 0.5, Y(d), Math.max(1, x1 - x0 - 1), T + ph - Y(d));
  }
  return { L, R, T, B, pw, ph, X, Y, ymax, bins, w };
}

/* ================================================================
   第 0 步 · 钩子：骰子机（1/2/5/30 颗取平均）
   每档独立带种子采样器与累积数组；中心钉 3.5，宽度按 σ/√k 收缩。
   ================================================================ */
const S0_SEED = 20261016, S0_CAP = 20000;
const s0 = { k: 1, running: true, runs: {} };
function s0Run(k) {
  if (!s0.runs[k]) {
    const sampler = makeSampler('dice', null, S0_SEED + k);
    s0.runs[k] = { sampler, means: new Float64Array(S0_CAP), count: 0 };
  }
  return s0.runs[k];
}
function s0Draw() {
  const ctx = ctxOf('s0-canvas');
  const run = s0Run(s0.k);
  const spec = parentSpec('dice');
  const g = drawHistPlot(ctx, {
    means: run.means, count: Math.max(1, run.count), lo: 0.7, hi: 6.3, nb: 28,
    curveMax: 0.42, dec: 1
  });
  /* μ 竖线 */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(g.X(3.5), g.T); ctx.lineTo(g.X(3.5), g.T + g.ph); ctx.stroke();
  ctx.lineWidth = 1;
  const rows = legendRows(ctx, [[t('cHist'), 'rgba(110,231,255,0.85)'], [t('cMuLine'), '#ffb454']], g.pw);
  drawLegendRows(ctx, rows, g.L + 2, g.T - 18);
  /* 读数（由数组全量现算） */
  const m = run.count ? arrMean(run.means, run.count) : NaN;
  const sd = run.count > 1 ? arrStd(run.means, run.count, m) : NaN;
  $('s0-readout').innerHTML = t('s0ro', {
    k: s0.k, K: fmtInt(run.count),
    mean: run.count ? fmt(m, 3) : '—', std: run.count > 1 ? fmt(sd, 3) : '—',
    tstd: fmt(spec.sigma / Math.sqrt(s0.k), 3), seed: S0_SEED + s0.k
  });
}
document.querySelectorAll('.dice-k').forEach(b => {
  b.addEventListener('click', () => {
    s0.k = parseInt(b.dataset.k, 10);
    document.querySelectorAll('.dice-k').forEach(x => x.classList.toggle('active', x === b));
    s0.running = true;
    s0Draw();
  });
});
$('s0-run').addEventListener('click', () => { s0.running = true; });
$('s0-start').addEventListener('click', () => {
  document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
});
animate($('step0'), () => {
  const run = s0Run(s0.k);
  if (s0.running && run.count < S0_CAP) {
    const batch = Math.min(240, S0_CAP - run.count);
    for (let i = 0; i < batch; i++) {
      let sum = 0;
      for (let j = 0; j < s0.k; j++) sum += run.sampler.draw();
      run.means[run.count++] = sum / s0.k;
    }
    if (run.count >= S0_CAP) s0.running = false;
    s0Draw();
  }
});
onLangRefresh(s0Draw);
onRefit(s0Draw);

/* ================================================================
   第 1 步 · 母分布画廊：pdf（理论）+ 真采样直方图
   ================================================================ */
const S1_SEED = 777001, S1_K = 20000;
const s1 = { par: 'uniform', alpha: 3.5, means: null };
function s1Compute() {
  const { means } = sampleMeans(s1.par, s1.alpha, 1, S1_K, S1_SEED);
  s1.means = means;
}
function s1Draw() {
  const ctx = ctxOf('s1-canvas');
  const spec = parentSpec(s1.par, s1.alpha);
  const [lo, hi] = spec.win;
  let curveMax = 0;
  if (!spec.discrete) { for (let i = 0; i <= 120; i++) { const v = parentPdf(s1.par, s1.alpha, lo + (hi - lo) * i / 120); if (v > curveMax) curveMax = v; } }
  else curveMax = 1 / 6 / 1 * 1.15;
  const g = drawHistPlot(ctx, {
    means: s1.means, count: S1_K, lo, hi, nb: spec.discrete ? 28 : 44,
    curveMax, dec: (hi - lo) > 4 ? 1 : 2, barColor: 'rgba(91,107,130,0.75)'
  });
  /* 理论 pdf 曲线（骰子画每面概率的台阶线） */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (spec.discrete) {
    for (let v = 1; v <= 6; v++) {
      const y = g.Y(1 / 6);
      ctx.moveTo(g.X(v - 0.5), y); ctx.lineTo(g.X(v + 0.5), y);
    }
  } else {
    for (let i = 0; i <= 240; i++) {
      const x = lo + (hi - lo) * i / 240;
      const y = g.Y(parentPdf(s1.par, s1.alpha, x));
      if (i === 0) ctx.moveTo(g.X(x), y); else ctx.lineTo(g.X(x), y);
    }
  }
  ctx.stroke(); ctx.lineWidth = 1;
  const rows = legendRows(ctx, [[t('lgPdf'), '#6ee7ff'], [t('lgHist'), 'rgba(91,107,130,0.9)']], g.pw);
  drawLegendRows(ctx, rows, g.L + 2, g.T - 18);
  drawFoldBadges(ctx, g, s1.means, S1_K, lo, hi);
  $('s1-readout').innerHTML = t('s1ro', {
    mu: fmt(spec.mu, 4), sigma: isFinite(spec.sigma) ? fmt(spec.sigma, 4) : '∞',
    formula: t(spec.fKey), seed: S1_SEED
  });
  $('s1-alpha-row').style.display = s1.par === 'pareto' ? '' : 'none';
  $('s1-warn').style.display = (s1.par === 'pareto' && s1.alpha <= 2) ? '' : 'none';
}
function s1Select(par, alpha) {
  s1.par = par; if (alpha) s1.alpha = alpha;
  s1Compute(); s1Draw();
}
document.querySelectorAll('.par1').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.par1').forEach(x => x.classList.toggle('active', x === b));
    s1Select(b.dataset.par);
  });
});
document.querySelectorAll('.alp1').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.alp1').forEach(x => x.classList.toggle('active', x === b));
    s1Select('pareto', parseFloat(b.dataset.alpha));
  });
});
onLangRefresh(s1Draw);
onRefit(s1Draw);
s1Compute();

/* ================================================================
   第 2 步 · 抽样分布实验室
   经验统计与理论 N(μ, σ/√n) 并排；σ=∞ 时不叠曲线（诚实口径）。
   ================================================================ */
const NS2 = [1, 2, 3, 5, 10, 30, 100], S2_K = 10000;
const s2 = {
  par: 'uniform', alpha: 3.5, nIdx: 3, seed: 1357911,
  sampler: null, means: new Float64Array(S2_K), count: 0, running: false
};
function s2Reset() {
  s2.sampler = makeSampler(s2.par, s2.alpha, s2.seed);
  s2.count = 0; s2.running = false;
}
function s2Window() {
  const spec = parentSpec(s2.par, s2.alpha);
  const n = NS2[s2.nIdx];
  if (!isFinite(spec.sigma)) return [0.6, 14];
  if (n === 1) return spec.win;
  const half = 3.9 * spec.sigma / Math.sqrt(n);
  return [spec.mu - half, spec.mu + half];
}
function s2Draw() {
  const ctx = ctxOf('s2-canvas');
  const spec = parentSpec(s2.par, s2.alpha);
  const n = NS2[s2.nIdx];
  const [lo, hi] = s2Window();
  const tstd = spec.sigma / Math.sqrt(n);
  const curveMax = isFinite(tstd) && s2.count > 0 ? normPdf(spec.mu, spec.mu, tstd) : 0;
  const g = drawHistPlot(ctx, {
    means: s2.means, count: Math.max(1, s2.count), lo, hi, nb: 42,
    curveMax, dec: (hi - lo) > 4 ? 1 : 2
  });
  if (isFinite(tstd) && s2.count > 0) {
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = lo + (hi - lo) * i / 200;
      const y = g.Y(normPdf(x, spec.mu, tstd));
      if (i === 0) ctx.moveTo(g.X(x), y); else ctx.lineTo(g.X(x), y);
    }
    ctx.stroke(); ctx.lineWidth = 1;
  }
  /* μ 竖线 */
  ctx.strokeStyle = 'rgba(232,237,244,0.65)'; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(g.X(spec.mu), g.T); ctx.lineTo(g.X(spec.mu), g.T + g.ph); ctx.stroke();
  ctx.setLineDash([]);
  const items = [[t('lgMeanHist'), 'rgba(110,231,255,0.85)']];
  if (isFinite(tstd)) items.push([t('lgNorm'), '#ffb454']);
  items.push([t('lgMu'), '#e8edf4']);
  const rows = legendRows(ctx, items, g.pw);
  drawLegendRows(ctx, rows, g.L + 2, g.T - 18);
  drawFoldBadges(ctx, g, s2.means, s2.count, lo, hi);
  /* 读数 */
  const m = s2.count ? arrMean(s2.means, s2.count) : NaN;
  const sd = s2.count > 1 ? arrStd(s2.means, s2.count, m) : NaN;
  $('s2-n-val').textContent = 'n = ' + n;
  $('s2-readout').innerHTML = t('s2ro', {
    n, K: fmtInt(s2.count),
    mean: s2.count ? fmt(m, 4) : '—', mu: fmt(spec.mu, 4),
    std: s2.count > 1 ? fmt(sd, 4) : '—',
    tstd: isFinite(tstd) ? fmt(tstd, 4) : '∞',
    ratio: (s2.count > 1 && isFinite(tstd)) ? fmt(sd / tstd, 3) : '—',
    seed: s2.seed
  });
  $('s2-note').innerHTML = !isFinite(spec.sigma) ? t('s2infNote') : (n === 1 ? t('s2n1note') : '');
  $('s2-alpha-row').style.display = s2.par === 'pareto' ? '' : 'none';
}
function s2RunStart() { s2Reset(); s2.running = true; s2Draw(); }
document.querySelectorAll('.par2').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.par2').forEach(x => x.classList.toggle('active', x === b));
    s2.par = b.dataset.par; s2RunStart();
  });
});
document.querySelectorAll('.alp2').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.alp2').forEach(x => x.classList.toggle('active', x === b));
    s2.alpha = parseFloat(b.dataset.alpha); s2.par = 'pareto'; s2RunStart();
  });
});
$('s2-n').addEventListener('input', e => { s2.nIdx = parseInt(e.target.value, 10); s2RunStart(); });
$('s2-run').addEventListener('click', s2RunStart);
$('s2-seed').addEventListener('click', () => { s2.seed = freshSeed(); s2RunStart(); });
$('s2-reset').addEventListener('click', () => { s2Reset(); s2Draw(); });
animate($('step2'), () => {
  if (s2.running && s2.count < S2_K) {
    const n = NS2[s2.nIdx];
    const batch = Math.min(400, S2_K - s2.count);
    for (let i = 0; i < batch; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) sum += s2.sampler.draw();
      s2.means[s2.count++] = sum / n;
    }
    if (s2.count >= S2_K) s2.running = false;
    s2Draw();
  }
});
onLangRefresh(s2Draw);
onRefit(s2Draw);
s2Reset();

/* ================================================================
   第 3 步 · 精度的代价：log-log 实证 σ/√n
   每档独立种子真采样；拟合斜率为最小二乘（log-log）。
   ================================================================ */
const NS3 = [1, 2, 3, 5, 10, 20, 50, 100], S3_K = 4000, S3_SEED = 246810;
const s3 = { par: 'uniform', points: null, slope: NaN, ratio: NaN, started: false };
function s3Compute() {
  const spec = parentSpec(s3.par);
  s3.points = NS3.map(n => {
    const { means } = sampleMeans(s3.par, null, n, S3_K, S3_SEED + n * 7919);
    const m = arrMean(means, S3_K);
    const emp = arrStd(means, S3_K, m);
    return { n, emp, theory: spec.sigma / Math.sqrt(n) };
  });
  /* log-log 最小二乘斜率 */
  const xs = s3.points.map(p => Math.log10(p.n)), ys = s3.points.map(p => Math.log10(p.emp));
  const xm = xs.reduce((a, b) => a + b, 0) / xs.length, ym = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) { num += (xs[i] - xm) * (ys[i] - ym); den += (xs[i] - xm) ** 2; }
  s3.slope = num / den;
  const p5 = s3.points.find(p => p.n === 5), p20 = s3.points.find(p => p.n === 20);
  s3.ratio = p5 && p20 ? p20.emp / p5.emp : NaN;
}
function s3Draw() {
  const ctx = ctxOf('s3-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const spec = parentSpec(s3.par);
  const L = 16, R = 16, T = 42, B = 42, pw = W - L - R, ph = H - T - B;
  const x0 = 0, x1 = 2; /* log10 n ∈ [0, 2] */
  const yTop = Math.log10(spec.sigma) + 0.25, yBot = Math.log10(spec.sigma) - 0.5 * 2 - 0.35;
  const X = lx => L + (lx - x0) / (x1 - x0) * pw;
  const Y = ly => T + (yTop - ly) / (yTop - yBot) * ph;
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();
  ctx.font = '11.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const n of [1, 10, 100]) ctx.fillText(String(n), X(Math.log10(n)), T + ph + 5);
  ctx.textAlign = 'right';
  ctx.fillText(t('cNX'), L + pw, T + ph + 21);
  ctx.textAlign = 'left';
  ctx.fillText(t('cStdY'), L + 2, 4);
  /* 理论线 */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(X(0), Y(Math.log10(spec.sigma)));
  ctx.lineTo(X(2), Y(Math.log10(spec.sigma) - 1));
  ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  /* 实测点 */
  if (s3.points) {
    ctx.fillStyle = '#6ee7ff';
    for (const p of s3.points) {
      ctx.beginPath();
      ctx.arc(X(Math.log10(p.n)), Y(Math.log10(p.emp)), 4.5, 0, TAU);
      ctx.fill();
    }
  }
  const rows = legendRows(ctx, [[t('lgEmp'), '#6ee7ff'], [t('lgTheory'), '#ffb454']], pw);
  drawLegendRows(ctx, rows, L + 2, T - 16);
  $('s3-readout').innerHTML = s3.points ? t('s3ro', {
    slope: fmt(s3.slope, 3), ratio: fmt(s3.ratio, 3), seed: S3_SEED
  }) : '';
}
document.querySelectorAll('.par3').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.par3').forEach(x => x.classList.toggle('active', x === b));
    s3.par = b.dataset.par; s3Compute(); s3Draw();
  });
});
$('s3-run').addEventListener('click', () => { s3Compute(); s3Draw(); });
onLangRefresh(s3Draw);
onRefit(s3Draw);

/* ================================================================
   第 4 步 · 慢的与坏的
   左：指数均值，偏度 2/√n 被磨平；右：帕累托 α=1.5 失效展览。
   右侧统计由原始数组全量计算：均值、最大单值、去掉最大单值后的均值
   （全批 K·n 个原始抽样的总均值口径）。
   ================================================================ */
const S4_K = 6000;
const s4l = { n: 5, cache: {} };
function s4lData(n) {
  if (!s4l.cache[n]) {
    const { means } = sampleMeans('exp', null, n, S4_K, 555000 + n);
    const m = arrMean(means, S4_K), sd = arrStd(means, S4_K, m);
    s4l.cache[n] = { means, mean: m, std: sd, skew: arrSkew(means, S4_K, m, sd) };
  }
  return s4l.cache[n];
}
function s4lDraw() {
  const ctx = ctxOf('s4l-canvas');
  const d = s4lData(s4l.n);
  const spec = parentSpec('exp');
  const tstd = spec.sigma / Math.sqrt(s4l.n);
  const half = 3.9 * tstd;
  const lo = Math.max(spec.win[0], spec.mu - half), hi = spec.mu + half;
  const g = drawHistPlot(ctx, {
    means: d.means, count: S4_K, lo, hi, nb: 40,
    curveMax: normPdf(spec.mu, spec.mu, tstd), dec: 2
  });
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const x = lo + (hi - lo) * i / 200;
    const y = g.Y(normPdf(x, spec.mu, tstd));
    if (i === 0) ctx.moveTo(g.X(x), y); else ctx.lineTo(g.X(x), y);
  }
  ctx.stroke(); ctx.lineWidth = 1;
  const rows = legendRows(ctx, [[t('lgMeanHist'), 'rgba(110,231,255,0.85)'], [t('lgNorm'), '#ffb454']], g.pw);
  drawLegendRows(ctx, rows, g.L + 2, g.T - 18);
  drawFoldBadges(ctx, g, d.means, S4_K, lo, hi);
  $('s4l-readout').innerHTML = t('s4lro', {
    sk: fmt(d.skew, 3), tsk: fmt(2 / Math.sqrt(s4l.n), 3),
    std: fmt(d.std, 4), tstd: fmt(tstd, 4), K: fmtInt(S4_K), seed: 555000 + s4l.n
  });
}
document.querySelectorAll('.n4l').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.n4l').forEach(x => x.classList.toggle('active', x === b));
    s4l.n = parseInt(b.dataset.n, 10); s4lDraw();
  });
});
onLangRefresh(s4lDraw);
onRefit(s4lDraw);

const s4r = { n: 100, cache: {} };
function s4rData(n) {
  if (!s4r.cache[n]) {
    const { means, maxSingle } = sampleMeans('pareto', 1.5, n, S4_K, 909090 + n);
    const m = arrMean(means, S4_K), sd = arrStd(means, S4_K, m);
    const total = S4_K * n;
    const meanWo = (m * total - maxSingle) / (total - 1);
    s4r.cache[n] = { means, mean: m, std: sd, maxSingle, meanWo };
  }
  return s4r.cache[n];
}
function s4rDraw() {
  const ctx = ctxOf('s4r-canvas');
  const d = s4rData(s4r.n);
  const g = drawHistPlot(ctx, {
    means: d.means, count: S4_K, lo: 0.8, hi: 15, nb: 44, dec: 1,
    barColor: 'rgba(255,122,147,0.55)'
  });
  /* μ = 3 参考线 */
  ctx.strokeStyle = 'rgba(232,237,244,0.65)'; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(g.X(3), g.T); ctx.lineTo(g.X(3), g.T + g.ph); ctx.stroke();
  ctx.setLineDash([]);
  const rows = legendRows(ctx, [[t('lgMeanHist'), 'rgba(255,122,147,0.85)'], ['μ = 3', '#e8edf4']], g.pw);
  drawLegendRows(ctx, rows, g.L + 2, g.T - 18);
  drawFoldBadges(ctx, g, d.means, S4_K, 0.8, 15);
  $('s4r-readout').innerHTML = t('s4rro', {
    mean: fmt(d.mean, 3), max: fmt(d.maxSingle, 1), meanWo: fmt(d.meanWo, 3),
    std: fmt(d.std, 2), K: fmtInt(S4_K), seed: 909090 + s4r.n
  });
}
document.querySelectorAll('.n4r').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.n4r').forEach(x => x.classList.toggle('active', x === b));
    s4r.n = parseInt(b.dataset.n, 10); s4rDraw();
  });
});
onLangRefresh(s4rDraw);
onRefit(s4rDraw);

/* ================================================================
   第 5 步 · 卷积阶梯：U(0,1) 分段常数密度逐级离散卷积
   网格 dx = 0.002，每格存格平均密度；离散卷积保总质量（积分恒 1）。
   ================================================================ */
const LAD_DX = 0.002, LAD_M = Math.round(1 / LAD_DX);
const ladder = { levels: null };
function ladderBuild() {
  if (ladder.levels) return ladder.levels;
  const u = new Float64Array(LAD_M).fill(1);
  const levels = { 1: u };
  let cur = u;
  for (let n = 2; n <= 10; n++) {
    const out = new Float64Array(cur.length + LAD_M - 1);
    for (let i = 0; i < cur.length; i++) {
      if (cur[i] === 0) continue;
      const fi = cur[i] * LAD_DX;
      for (let j = 0; j < LAD_M; j++) out[i + j] += fi;
    }
    /* out[i] 是格平均密度：(f*u)(x) 在格内 ≈ Σ f 格平均 · u 格平均 · dx ——
       u 格平均恒 1，故每项乘 dx 一次即可（见 report 方法说明）。 */
    levels[n] = out;
    cur = out;
  }
  ladder.levels = levels;
  return levels;
}
function ladderPdfAt(n, x) {
  const lv = ladderBuild()[n];
  if (!lv || x < 0 || x >= lv.length * LAD_DX) return 0;
  return lv[Math.floor(x / LAD_DX)];
}
const s5 = { n: 5 };
function s5Draw() {
  const ctx = ctxOf('s5-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const lv = ladderBuild()[s5.n];
  const L = 14, R = 14, T = 34, B = 24, pw = W - L - R, ph = H - T - B;
  const lo = -0.15, hi = s5.n + 0.15;
  const muS = s5.n * 0.5, sdS = Math.sqrt(s5.n / 12);
  let peak = 0;
  for (let i = 0; i < lv.length; i++) if (lv[i] > peak) peak = lv[i];
  const ymax = Math.max(peak, normPdf(muS, muS, sdS)) * 1.12;
  const X = x => L + (x - lo) / (hi - lo) * pw;
  const Y = y => T + ph - y / ymax * ph;
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();
  ctx.font = '11.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const xv of [0, s5.n / 2, s5.n]) ctx.fillText(fmt(xv, xv % 1 ? 1 : 0), X(xv), T + ph + 6);
  /* 同参数正态（虚线） */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
  ctx.beginPath();
  for (let i = 0; i <= 240; i++) {
    const x = lo + (hi - lo) * i / 240;
    const y = Y(normPdf(x, muS, sdS));
    if (i === 0) ctx.moveTo(X(x), y); else ctx.lineTo(X(x), y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  /* 卷积曲线（格心连线） */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < lv.length; i++) {
    const x = (i + 0.5) * LAD_DX;
    if (i === 0) ctx.moveTo(X(x), Y(lv[i])); else ctx.lineTo(X(x), Y(lv[i]));
  }
  ctx.stroke(); ctx.lineWidth = 1;
  const rows = legendRows(ctx, [[t('lgConv'), '#6ee7ff'], [t('lgNormSum'), '#ffb454']], pw);
  drawLegendRows(ctx, rows, L + 2, T - 18);
  /* 最大偏差（格心口径） */
  let dev = 0;
  for (let i = 0; i < lv.length; i++) {
    const x = (i + 0.5) * LAD_DX;
    const d = Math.abs(lv[i] - normPdf(x, muS, sdS));
    if (d > dev) dev = d;
  }
  $('s5-readout').innerHTML = t('s5ro', {
    n: s5.n, peak: fmt(peak, 3), dev: fmt(dev, 3), p2: fmt(ladderPdfAt(2, 1), 3)
  });
}
document.querySelectorAll('.n5').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.n5').forEach(x => x.classList.toggle('active', x === b));
    s5.n = parseInt(b.dataset.n, 10); s5Draw();
  });
});
onLangRefresh(s5Draw);
onRefit(s5Draw);

/* ================================================================
   第 6 步 · 样本量计算器：n = ⌈(zσ/E)²⌉ + 真跑覆盖率验证
   验证分布的标准差恰为 σ（伯努利仅 σ = 0.5，选它时锁定 σ）。
   ================================================================ */
const Z95 = 1.96;
function sampleSize(sigma, E, z) { return Math.ceil(Math.pow((z || Z95) * sigma / E, 2)); }
const s6 = { ver: 'bern', sigma: 0.5, E: 0.03, seed: 31415926, result: null, stale: false };
function s6Sampler(rng) {
  if (s6.ver === 'bern') return { draw: () => (rng() < 0.5 ? 1 : 0), mu: 0.5 };
  if (s6.ver === 'uniform') { const a = Math.sqrt(3) * s6.sigma; return { draw: () => (rng() * 2 - 1) * a, mu: 0 }; }
  return { draw: () => -Math.log(1 - rng()) * s6.sigma, mu: s6.sigma };
}
function verifyCoverage(kind, sigma, E, seed) {
  const bak = { ver: s6.ver, sigma: s6.sigma };
  s6.ver = kind; s6.sigma = sigma;
  const n = sampleSize(sigma, E);
  const K = clamp(Math.floor(6e6 / n), 200, 4000);
  const rng = mulberry32(seed);
  const smp = s6Sampler(rng);
  const means = new Float64Array(K);
  let hits = 0;
  for (let i = 0; i < K; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) sum += smp.draw();
    const m = sum / n;
    means[i] = m;
    if (Math.abs(m - smp.mu) <= E) hits++;
  }
  s6.ver = bak.ver; s6.sigma = bak.sigma;
  return { n, K, hits, coverage: hits / K, mu: smp.mu, means };
}
function s6Calc() {
  s6.result = verifyCoverage(s6.ver, s6.sigma, s6.E, s6.seed);
  s6.stale = false;
  s6Draw();
}
function s6Draw() {
  const ctx = ctxOf('s6-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  $('s6-sig-val').textContent = 'σ = ' + fmt(s6.sigma, 3);
  $('s6-e-val').textContent = 'E = ' + fmt(s6.E, 3);
  $('s6-sig').disabled = s6.ver === 'bern';
  if (!s6.result) { $('s6-readout').innerHTML = s6.stale ? t('s6stale') : ''; return; }
  const r = s6.result;
  const lo = r.mu - 2.6 * s6.E, hi = r.mu + 2.6 * s6.E;
  const g = drawHistPlot(ctx, { means: r.means, count: r.K, lo, hi, nb: 36, dec: 2, topPad: 34 });
  /* μ ± E 带 */
  ctx.fillStyle = 'rgba(255,180,84,0.13)';
  ctx.fillRect(g.X(r.mu - s6.E), g.T, g.X(r.mu + s6.E) - g.X(r.mu - s6.E), g.ph);
  ctx.strokeStyle = '#ffb454'; ctx.setLineDash([5, 4]);
  for (const xv of [r.mu - s6.E, r.mu + s6.E]) {
    ctx.beginPath(); ctx.moveTo(g.X(xv), g.T); ctx.lineTo(g.X(xv), g.T + g.ph); ctx.stroke();
  }
  ctx.setLineDash([]);
  const rows = legendRows(ctx, [[t('lgVerHist'), 'rgba(110,231,255,0.85)'], [t('lgBand'), '#ffb454']], g.pw);
  drawLegendRows(ctx, rows, g.L + 2, g.T - 18);
  const raw = Math.pow(Z95 * s6.sigma / s6.E, 2);
  $('s6-readout').innerHTML = t('s6ro', {
    sig: fmt(s6.sigma, 3), e: fmt(s6.E, 3), raw: fmt(raw, 2), n: fmtInt(r.n),
    K: fmtInt(r.K), hits: fmtInt(r.hits), cov: fmt(r.coverage * 100, 2) + '%', seed: s6.seed
  });
}
function s6SetSliders() {
  $('s6-sig').value = String(Math.round(Math.log(s6.sigma / 0.05) / Math.log(40) * 1000));
  $('s6-e').value = String(Math.round(Math.log(s6.E / 0.005) / Math.log(100) * 1000));
}
document.querySelectorAll('.pre6').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.pre6').forEach(x => x.classList.toggle('active', x === b));
    const pre = b.dataset.pre;
    if (pre === 'poll') { s6.ver = 'bern'; s6.sigma = 0.5; s6.E = 0.03; }
    if (pre === 'uniform') { s6.ver = 'uniform'; s6.sigma = 1 / Math.sqrt(12); s6.E = 0.02; }
    if (pre === 'exp') { s6.ver = 'exp'; s6.sigma = 1; s6.E = 0.05; }
    document.querySelectorAll('.ver6').forEach(x => x.classList.toggle('active', x.dataset.ver === s6.ver));
    s6SetSliders(); s6Calc();
  });
});
document.querySelectorAll('.ver6').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.ver6').forEach(x => x.classList.toggle('active', x === b));
    s6.ver = b.dataset.ver;
    if (s6.ver === 'bern') s6.sigma = 0.5;
    s6SetSliders(); s6Calc();
  });
});
$('s6-sig').addEventListener('input', e => {
  s6.sigma = 0.05 * Math.pow(40, parseInt(e.target.value, 10) / 1000);
  s6.result = null; /* 参数已变，旧验证作废，待重算（读数位留 s6stale 提示） */
  s6.stale = true;
  s6Draw();
});
$('s6-e').addEventListener('input', e => {
  s6.E = 0.005 * Math.pow(100, parseInt(e.target.value, 10) / 1000);
  s6.result = null;
  s6.stale = true;
  s6Draw();
});
$('s6-calc').addEventListener('click', s6Calc);
$('s6-seed').addEventListener('click', () => { s6.seed = freshSeed(); s6Calc(); });
onLangRefresh(s6Draw);
onRefit(s6Draw);

/* ================================================================
   首屏渲染（语言先行由 i18n 的 DOMContentLoaded 触发 applyLang；
   这里先按当前语言画一遍，applyLang 时会经 onLangRefresh 重绘）
   ================================================================ */
s1Draw();
s2Draw();
s2RunStart();
s3Compute(); s3Draw();
s4lDraw();
s4rDraw();
s5Draw();
s6SetSliders();
s6Calc();

/* ================================================================
   window.CLT — 评审对账接口（全部走与页面相同的实现）
   ================================================================ */
window.CLT = {
  mulberry32, makeSampler, sampleMeans, parentSpec, parentPdf, theoryStd,
  normPdf,
  PARENTS: {
    uniform: { mu: 0.5, sigma: 1 / Math.sqrt(12) },
    exp: { mu: 1, sigma: 1 },
    bimodal: { mu: parentSpec('bimodal').mu, sigma: parentSpec('bimodal').sigma },
    dice: { mu: 3.5, sigma: Math.sqrt(35 / 12) },
    pareto35: { alpha: 3.5, mu: parentSpec('pareto', 3.5).mu, sigma: parentSpec('pareto', 3.5).sigma },
    pareto15: { alpha: 1.5, mu: parentSpec('pareto', 1.5).mu, sigma: Infinity }
  },
  ladder: {
    dx: LAD_DX,
    pdfAt: ladderPdfAt,
    level(n) {
      const lv = ladderBuild()[n];
      const xs = new Float64Array(lv.length);
      for (let i = 0; i < lv.length; i++) xs[i] = (i + 0.5) * LAD_DX;
      return { xs, ys: lv };
    }
  },
  sampleSize,
  verifyCoverage,
  getState() {
    const r0 = s0Run(s0.k);
    const m0 = r0.count ? arrMean(r0.means, r0.count) : NaN;
    const spec2 = parentSpec(s2.par, s2.alpha);
    const m2 = s2.count ? arrMean(s2.means, s2.count) : NaN;
    const d4 = s4rData(s4r.n), l4 = s4lData(s4l.n);
    return {
      s0: { k: s0.k, seed: S0_SEED + s0.k, K: r0.count, mean: m0, std: r0.count > 1 ? arrStd(r0.means, r0.count, m0) : NaN, theoryStd: parentSpec('dice').sigma / Math.sqrt(s0.k) },
      s1: { par: s1.par, alpha: s1.alpha, mu: parentSpec(s1.par, s1.alpha).mu, sigma: parentSpec(s1.par, s1.alpha).sigma, seed: S1_SEED },
      s2: {
        par: s2.par, alpha: s2.alpha, n: NS2[s2.nIdx], seed: s2.seed, K: s2.count,
        mean: m2, std: s2.count > 1 ? arrStd(s2.means, s2.count, m2) : NaN,
        mu: spec2.mu, theoryStd: spec2.sigma / Math.sqrt(NS2[s2.nIdx])
      },
      s3: { par: s3.par, seed: S3_SEED, points: s3.points, slope: s3.slope, ratio: s3.ratio },
      s4l: { n: s4l.n, K: S4_K, mean: l4.mean, std: l4.std, skew: l4.skew, theorySkew: 2 / Math.sqrt(s4l.n), theoryStd: 1 / Math.sqrt(s4l.n) },
      s4r: { n: s4r.n, K: S4_K, mean: d4.mean, std: d4.std, maxSingle: d4.maxSingle, meanWithoutMax: d4.meanWo, mu: 3, sigma: Infinity },
      s5: { n: s5.n, dx: LAD_DX, pdf2at1: ladderPdfAt(2, 1) },
      s6: {
        ver: s6.ver, sigma: s6.sigma, E: s6.E, seed: s6.seed,
        n: s6.result ? s6.result.n : null, K: s6.result ? s6.result.K : 0,
        hits: s6.result ? s6.result.hits : 0, coverage: s6.result ? s6.result.coverage : NaN,
        mu: s6.result ? s6.result.mu : NaN
      }
    };
  }
};
