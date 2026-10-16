'use strict';
/* 贝叶斯交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 后验一律闭式：概率形式 P(H|E)=P(E|H)P(H)/[P(E|H)P(H)+P(E|¬H)P(¬H)]；
      赔率形式 后验赔率 = 先验赔率 × LR；两套读数同源互洽。
      贯穿案例：患病率 1%、灵敏度 90%、假阳性率 9% →
      PPV = 0.009/0.0981 ≈ 9.17%，LR+ = 10，LR− = 0.10/0.91 ≈ 0.1099，
      两次阳性 ≈ 50.3%，三次 ≈ 91.0%——全部由公式现算，不写死。
   2. 自然频率：第 0/5 步用 10000 人基数；第 5 步患病率整百分点步进，
      使患病/真阳/假阳/真阴人数全为整数；图上人数、读数、由人数算出的
      概率与公式 PPV 严格一致。
   3. 证据连乘处常驻独立性假设与同种检测相关性警告（i18n 键 s3warn）。
   4. 连续版闭式：Beta(α,β) + (H,T) → Beta(α+H, β+T)；pdf 经 lnΓ 计算；
      只报均值与众数——本页不给可信区间（要数值积分求分位，见第 4 步注脚）。
   5. 洗刷演示：两个先验喂同一条带种子序列，均值差由各自 Beta 参数独立算得。
   6. 随机抛币走带种子 mulberry32；种子在读数中可见；随机序列计数与
      手动记账在状态里分开（getState 分列 randH/randT 与 manH/manT）。
   评审对账接口：window.BAYES（见文件末尾）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 带种子 PRNG：mulberry32（沿用蒙特卡洛页贯例） ---------- */
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

/* ================================================================
   数学核心（页面与 window.BAYES 共用同一份实现）
   ================================================================ */
const CASE = { prev: 0.01, sens: 0.90, fpr: 0.09 };
const LR_PLUS = CASE.sens / CASE.fpr;                 // 10
const LR_MINUS = (1 - CASE.sens) / (1 - CASE.fpr);    // ≈ 0.10989
const COIN_THETA = 0.65;                              // 硬币真实偏差（文案明示）

/* 概率形式后验：P(H|E) */
function postProb(prior, pEH, pEnH) {
  const num = pEH * prior;
  return num / (num + pEnH * (1 - prior));
}
function probToOdds(p) { return p / (1 - p); }
function oddsToProb(o) { return o / (1 + o); }
function lrPlus(sens, fpr) { return sens / fpr; }
function lrMinus(sens, fpr) { return (1 - sens) / (1 - fpr); }
/* 赔率形式：从先验出发依次乘上 lrs，返回每步后验概率（含起点） */
function applyEvidence(prior, lrs) {
  let odds = probToOdds(prior);
  const posts = [prior];
  for (const lr of lrs) { odds *= lr; posts.push(oddsToProb(odds)); }
  return posts;
}
/* 自然频率计数：N 人、患病率 prev、灵敏度 sens、假阳性率 fpr */
function freqCounts(N, prev, sens, fpr) {
  const sick = N * prev, healthy = N - sick;
  const tp = sick * sens, fn = sick - tp;
  const fp = healthy * fpr, tn = healthy - fp;
  const pool = tp + fp;
  return { N, sick, healthy, tp, fn, fp, tn, pool, ppv: pool ? tp / pool : NaN };
}

/* ---------- Beta 分布（lnΓ 用 Lanczos 近似，数值稳定） ---------- */
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function lnGamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = LANCZOS[0];
  for (let i = 1; i < 9; i++) x += LANCZOS[i] / (z + i);
  const tt = z + 7.5;
  return 0.5 * Math.log(TAU) + (z + 0.5) * Math.log(tt) - tt + Math.log(x);
}
function betaLnB(a, b) { return lnGamma(a) + lnGamma(b) - lnGamma(a + b); }
function betaPdf(x, a, b) {
  if (x <= 0) return a < 1 ? Infinity : (a === 1 ? Math.exp(-betaLnB(a, b)) : 0);
  if (x >= 1) return b < 1 ? Infinity : (b === 1 ? Math.exp(-betaLnB(a, b)) : 0);
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - betaLnB(a, b));
}
function betaMean(a, b) { return a / (a + b); }
function betaMode(a, b) {
  if (a > 1 && b > 1) return (a - 1) / (a + b - 2);
  if (a <= 1 && b > 1) return 0;
  if (a > 1 && b <= 1) return 1;
  return NaN; /* a = b = 1：均匀分布，无唯一众数 */
}
function posteriorAfterFlips(a, b, H, T) {
  const A = a + H, B = b + T;
  return { a: A, b: B, mean: betaMean(A, B), mode: betaMode(A, B) };
}
/* 带种子抛币序列：返回前 n 次（true = 正面）与正面数 */
function coinSequence(seed, theta, n) {
  const rnd = mulberry32(seed);
  const seq = [];
  let h = 0;
  for (let i = 0; i < n; i++) { const f = rnd() < theta; seq.push(f); if (f) h++; }
  return { seq, h, t: n - h };
}

/* ---------- 画布适配（DPR）：沿用傅里叶/蒙特卡洛页 fitCanvas 方案 ---------- */
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
function ctxOf(id) { const cv = $(id); if (!allCanvases.includes(cv)) allCanvases.push(cv); return fitCanvas(cv); }
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
function fmtInt(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
/* 百分比：<20% 用两位小数（9.17% / 0.99%），其余一位（50.3% / 91.0%） */
function pctTxt(p) {
  if (!isFinite(p)) return '—';
  return fmt(p * 100, p < 0.2 ? 2 : 1) + '%';
}
/* 去尾零的数字格式（赔率用）：99 → '99'、10.10 → '10.1'、1.01 → '1.01' */
function fmtTrim(v, maxD) {
  let s = fmt(v, maxD === undefined ? 2 : maxD);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
function fmtOdds(o) {
  if (!isFinite(o)) return '—';
  if (o >= 1) return fmtTrim(o) + ' : 1';
  return '1 : ' + fmtTrim(1 / o);
}
function fmtLR(lr) {
  if (!isFinite(lr)) return '—';
  if (lr >= 1) return String(Math.round(lr * 100) / 100);
  return lr.toFixed(3);
}
function fmtLogOdds(o) {
  const v = Math.log10(o);
  return (v >= 0 ? '+' : '') + fmt(v, 2);
}
/* 对数先验滑杆：u∈[0,1] → [0.001, 0.5]，锚点吸附保证 1% 等整点精确 */
function sliderToPrior(u) {
  let p = 0.001 * Math.pow(500, u);
  for (const a of [0.001, 0.01, 0.1, 0.5]) if (Math.abs(Math.log(p / a)) < 0.03) p = a;
  return p;
}
function sliderToLR(u) {
  let lr = Math.pow(10, -2 + 4 * u);
  for (const a of [LR_MINUS, 0.1, 1, 10, 100]) if (Math.abs(Math.log10(lr / a)) < 0.02) lr = a;
  return lr;
}
function lrToSlider(lr) { return (Math.log10(lr) + 2) / 4; }
/* 图例助手（画布内图例窄屏自适应）：量宽 → 贪心分行 → 逐行绘制，
   避免单行图例在 390 窄屏被画布边缘裁切（第 2 轮修复 M1）。 */
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
/* 单行长文案窄屏收字号：从 px 起逐级减小直到量宽 ≤ maxW（下限 9.5px） */
function fitFontPx(ctx, txt, maxW, px, weight) {
  let size = px;
  const apply = () => { ctx.font = (weight ? weight + ' ' : '') + size + 'px system-ui, sans-serif'; };
  apply();
  while (size > 9.5 && ctx.measureText(txt).width > maxW) { size -= 0.5; apply(); }
  return size;
}

/* ================================================================
   第 0 步 · 钩子：押注 + 一万人频率华夫图
   格子顺序固定：[0,90) 真阳 TP、[90,100) 漏检 FN、
   [100,991) 假阳 FP、[991,10000) 真阴 TN——人数与贯穿案例严格互算。
   ================================================================ */
const s0 = { bet: null, revealed: false, revealT: 0 };
const BET_KEYS = ['bet90', 'bet50', 'bet9', 'bet1'];
function s0Counts() { return freqCounts(10000, CASE.prev, CASE.sens, CASE.fpr); }
function s0Fb() {
  const el = $('s0-feedback');
  if (s0.bet === null) { el.innerHTML = t('s0fbNone'); return; }
  const pick = t(BET_KEYS[s0.bet]);
  el.innerHTML = t(s0.bet === 2 ? 's0fbRight' : 's0fbWrong', { pick });
}
function s0Readout() {
  const el = $('s0-readout');
  if (!s0.revealed || s0.revealT < 1) { el.innerHTML = ''; return; }
  el.innerHTML = t('s0ro', { ppv: pctTxt(s0Counts().ppv) });
}
function s0Draw() {
  const ctx = ctxOf('s0-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cAll'), W / 2, 16);
  const size = Math.min(W - 20, H - 118);
  const ox = (W - size) / 2, oy = 34;
  const cell = size / 100;
  const T = s0.revealed ? s0.revealT : 0;
  const sickLit = T > 0.03;
  const posPhase = clamp((T - 0.3) / 0.7, 0, 1);
  const posLit = Math.floor(posPhase * 981);
  for (let i = 0; i < 10000; i++) {
    const cx = ox + (i % 100) * cell, cy = oy + Math.floor(i / 100) * cell;
    let col = '#263044';
    if (i < 100) { /* 病人块 */
      if (T >= 0.3) {
        if (i < 90) col = i < posLit ? '#6ee7ff' : (sickLit ? '#ffb454' : col);
        else col = '#7a3b47';
      } else if (sickLit) col = '#ffb454';
    } else if (i < 991) { /* 假阳块：阳性序号 90..980 */
      if (T >= 0.3 && (i - 100 + 90) < posLit) col = '#ff9d5c';
    }
    ctx.fillStyle = col;
    const s = Math.max(1, cell - Math.min(1.2, cell * 0.22));
    ctx.fillRect(cx + (cell - s) / 2, cy + (cell - s) / 2, s, s);
  }
  ctx.font = '12.5px system-ui, sans-serif';
  if (T > 0.03 && T < 0.3) {
    ctx.fillStyle = '#ffb454';
    ctx.fillText(t('cSickCap'), W / 2, oy + size + 22);
  } else if (T >= 0.3) {
    /* 色键图例：贪心分行、逐行居中——窄屏一行放不下时换行，不被画布边缘裁切 */
    const items = [[t('cTPCap'), '#6ee7ff'], [t('cFPCap'), '#ff9d5c'], [t('cFNCap'), '#c96a7a']];
    const gap = 28, maxRowW = W - 16;
    ctx.textAlign = 'left';
    const rows = [];
    let row = [], rowW = 0;
    for (const [txt, col] of items) {
      const w = ctx.measureText(txt).width;
      if (row.length && rowW + gap + w > maxRowW) { rows.push(row); row = []; rowW = 0; }
      if (row.length) rowW += gap;
      row.push([txt, col, w]); rowW += w;
    }
    if (row.length) rows.push(row);
    rows.forEach((r, ri) => {
      const tot = r.reduce((s, it) => s + it[2], 0) + gap * (r.length - 1);
      let lx = (W - tot) / 2;
      for (const [txt, col, w] of r) {
        ctx.fillStyle = col;
        ctx.fillText(txt, lx, oy + size + 22 + ri * 17);
        lx += w + gap;
      }
    });
    ctx.textAlign = 'center';
  }
}
function s0RevealAdvance(dt) {
  if (s0.revealed && s0.revealT < 1) {
    s0.revealT = Math.min(1, s0.revealT + dt / 1.5);
    s0Draw();
    if (s0.revealT >= 1) s0Readout();
  }
}
document.querySelectorAll('#step0 .bet').forEach(b => {
  b.addEventListener('click', () => {
    s0.bet = parseInt(b.dataset.bet, 10);
    document.querySelectorAll('#step0 .bet').forEach(x => x.classList.toggle('picked', x === b));
    s0Fb();
  });
});
$('s0-reveal').addEventListener('click', () => {
  s0.revealed = !s0.revealed;
  s0.revealT = s0.revealed ? 0 : 0;
  $('s0-reveal').textContent = t(s0.revealed ? 's0again' : 's0reveal');
  s0Draw(); s0Readout();
  if (s0.revealed) document.querySelector('#step0 .stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('s0-start').addEventListener('click', () => {
  document.querySelector('#step1').scrollIntoView({ behavior: 'smooth' });
});
animate($('step0'), s0RevealAdvance);
onLangRefresh(() => {
  $('s0-reveal').textContent = t(s0.revealed ? 's0again' : 's0reveal');
  s0Fb(); s0Draw(); s0Readout();
});
onRefit(() => s0Draw());
s0Fb(); s0Draw(); s0Readout();

/* ================================================================
   第 1 步 · 先验是起点：同一份阳性证据 × 不同先验
   ================================================================ */
const s1 = { prior: CASE.prev };
function s1Post() { return postProb(s1.prior, CASE.sens, CASE.fpr); }
function s1Draw() {
  const ctx = ctxOf('s1-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const x0 = 56, x1 = W - 30;
  const post = s1Post();
  const rows = [
    { y: 84, frac: s1.prior, col: '#ffb454', lab: t('cPrior') + '  ' + pctTxt(s1.prior) },
    { y: 178, frac: post, col: '#6ee7ff', lab: t('cPost') + '  ' + pctTxt(post) }
  ];
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let g = 0; g <= 4; g++) {
    const gx = x0 + (x1 - x0) * g / 4;
    ctx.strokeStyle = '#232c3d';
    ctx.beginPath(); ctx.moveTo(gx, 56); ctx.lineTo(gx, 236); ctx.stroke();
    ctx.fillStyle = '#5b6b82';
    ctx.fillText((g * 25) + '%', gx, 244);
  }
  rows.forEach(r => {
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#c9d4e2';
    ctx.fillText(r.lab, x0, r.y - 12);
    ctx.fillStyle = '#1c2330';
    ctx.fillRect(x0, r.y, x1 - x0, 40);
    ctx.fillStyle = r.col;
    ctx.fillRect(x0, r.y, Math.max(2, (x1 - x0) * r.frac), 40);
  });
  /* 先验薄到像素级（条宽 <14px）时补一句画布内注——免得读者误以为条缺失；
     「薄到看不见」本身就是这一课的教学点（第 2 轮建议 S1） */
  if ((x1 - x0) * s1.prior < 14) {
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffb454';
    ctx.fillText('↑ ' + pctTxt(s1.prior) + ' · ' + t('cHair'), x0, rows[0].y + 58);
  }
}
function s1Readout() {
  const post = s1Post();
  $('s1-prior-val').textContent = pctTxt(s1.prior);
  $('s1-readout').innerHTML = t('s1ro', {
    prior: pctTxt(s1.prior), post: pctTxt(post), mult: fmt(post / s1.prior, 1)
  });
}
$('s1-prior').addEventListener('input', e => {
  s1.prior = sliderToPrior(parseInt(e.target.value, 10) / 1000);
  s1Draw(); s1Readout();
});
s1.prior = sliderToPrior(parseInt($('s1-prior').value, 10) / 1000);
onLangRefresh(() => { s1Draw(); s1Readout(); });
onRefit(() => s1Draw());
s1Draw(); s1Readout();

/* ================================================================
   第 2 步 · 赔率形式：log₁₀ 赔率轴上的位移
   ================================================================ */
const s2 = { prior: CASE.prev, lr: LR_PLUS };
function s2PostOdds() { return probToOdds(s2.prior) * s2.lr; }
function s2Draw() {
  const ctx = ctxOf('s2-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const x0 = 52, x1 = W - 26;
  const LO = -4, HI = 3;
  const X = v => x0 + (clamp(v, LO, HI) - LO) / (HI - LO) * (x1 - x0);
  const yAxis = 196, yPt = 108;
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9aa7b8';
  fitFontPx(ctx, t('cAxisLab'), W - x0 - 4, 12.5); /* EN 长标题窄屏收字号防右缘裁切 */
  ctx.fillText(t('cAxisLab'), x0, 26);
  /* 轴与刻度 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, yAxis); ctx.lineTo(x1, yAxis); ctx.stroke();
  const SUP = { '-4': '10⁻⁴', '-3': '10⁻³', '-2': '10⁻²', '-1': '10⁻¹', '0': '1', '1': '10¹', '2': '10²', '3': '10³' };
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let k = LO; k <= HI; k++) {
    const gx = X(k);
    ctx.strokeStyle = '#232c3d'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, 52); ctx.lineTo(gx, yAxis); ctx.stroke();
    ctx.strokeStyle = '#2b3547';
    ctx.beginPath(); ctx.moveTo(gx, yAxis - 5); ctx.lineTo(gx, yAxis + 5); ctx.stroke();
    ctx.fillStyle = '#9aa7b8';
    ctx.fillText(SUP[String(k)], gx, yAxis + 22);
    ctx.fillStyle = '#5b6b82';
    ctx.fillText(pctTxt(oddsToProb(Math.pow(10, k))), gx, yAxis + 42);
  }
  const lo0 = Math.log10(probToOdds(s2.prior));
  const lo1 = Math.log10(s2PostOdds());
  /* 位移箭头 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(X(lo0), yPt); ctx.lineTo(X(lo1), yPt); ctx.stroke();
  const dir = lo1 >= lo0 ? 1 : -1;
  ctx.fillStyle = '#6ee7ff';
  ctx.beginPath();
  ctx.moveTo(X(lo1), yPt);
  ctx.lineTo(X(lo1) - dir * 10, yPt - 5.5);
  ctx.lineTo(X(lo1) - dir * 10, yPt + 5.5);
  ctx.closePath(); ctx.fill();
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillStyle = '#6ee7ff';
  ctx.textAlign = 'center';
  ctx.fillText('× ' + fmtLR(s2.lr), (X(lo0) + X(lo1)) / 2, yPt - 16);
  /* 先验 / 后验点 */
  const dot = (v, col, lab) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(X(v), yPt, 7, 0, TAU); ctx.fill();
    if (lab) {
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillStyle = col;
      ctx.fillText(lab, X(v), yPt + 30);
    }
    if (v < LO || v > HI) { ctx.fillText('◀', X(v) + (v < LO ? 12 : -12), yPt); }
  };
  /* 两点过近时两标签（居中绘制）会互相粘连——后验标签改到下一行画 */
  ctx.font = '13px system-ui, sans-serif';
  const labCollide = Math.abs(X(lo1) - X(lo0)) <
    (ctx.measureText(t('cPriorPt')).width + ctx.measureText(t('cPostPt')).width) / 2 + 6;
  dot(lo0, '#ffb454', t('cPriorPt'));
  dot(lo1, '#6ee7ff', labCollide ? null : t('cPostPt'));
  ctx.strokeStyle = '#3a465e'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(X(lo0), yPt + 8); ctx.lineTo(X(lo0), yAxis); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(lo1), yPt + 8); ctx.lineTo(X(lo1), yAxis); ctx.stroke();
  ctx.setLineDash([]);
  /* 后验标签因防撞下移时单独成行（未钳制场景） */
  if (labCollide && !(lo1 < LO || lo1 > HI)) {
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#6ee7ff';
    ctx.textBaseline = 'alphabetic';
    const lw = ctx.measureText(t('cPostPt')).width;
    ctx.textAlign = 'center';
    ctx.fillText(t('cPostPt'), clamp(X(lo1), lw / 2 + 2, W - lw / 2 - 2), yPt + 50);
  }
  /* 后验点被钳制在轴端时，把后验概率标在点旁（第 2 轮建议 S2）：
     两点横距够大标点上方内侧；太近则标点下方居中，避开「× LR」位移文案；
     若标签已因防撞下移，概率与标签合并成同一行 */
  if (lo1 < LO || lo1 > HI) {
    const pTxt = pctTxt(oddsToProb(s2PostOdds()));
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#6ee7ff';
    ctx.textBaseline = 'alphabetic';
    if (Math.abs(X(lo1) - X(lo0)) >= 100) {
      if (lo1 < LO) { ctx.textAlign = 'left'; ctx.fillText(pTxt, X(lo1) + 16, yPt - 14); }
      else { ctx.textAlign = 'right'; ctx.fillText(pTxt, X(lo1) - 16, yPt - 14); }
    } else {
      const txt = labCollide ? t('cPostPt') + ' ' + pTxt : pTxt;
      const tw = ctx.measureText(txt).width;
      const cx = clamp(X(lo1), tw / 2 + 2, W - tw / 2 - 2);
      ctx.textAlign = 'center';
      ctx.fillText(txt, cx, yPt + 50);
    }
  }
}
function s2Readout() {
  const o0 = probToOdds(s2.prior), o1 = s2PostOdds();
  $('s2-prior-val').textContent = pctTxt(s2.prior);
  $('s2-lr-val').textContent = '× ' + fmtLR(s2.lr);
  $('s2-readout').innerHTML = t('s2ro', {
    p0: pctTxt(s2.prior), o0: fmtOdds(o0), l0: fmtLogOdds(o0),
    lr: fmtLR(s2.lr),
    o1: fmtOdds(o1), l1: fmtLogOdds(o1), p1: pctTxt(oddsToProb(o1))
  });
}
function s2SyncLR(lr) {
  s2.lr = lr;
  $('s2-lr').value = String(Math.round(lrToSlider(lr) * 1000));
  s2Draw(); s2Readout();
}
$('s2-prior').addEventListener('input', e => {
  s2.prior = sliderToPrior(parseInt(e.target.value, 10) / 1000);
  s2Draw(); s2Readout();
});
$('s2-lr').addEventListener('input', e => {
  s2.lr = sliderToLR(parseInt(e.target.value, 10) / 1000);
  s2Draw(); s2Readout();
});
$('s2-lrpos').addEventListener('click', () => s2SyncLR(LR_PLUS));
$('s2-lrneg').addEventListener('click', () => s2SyncLR(LR_MINUS));
s2.prior = sliderToPrior(parseInt($('s2-prior').value, 10) / 1000);
onLangRefresh(() => { s2Draw(); s2Readout(); });
onRefit(() => s2Draw());
s2Draw(); s2Readout();

/* ================================================================
   第 3 步 · 证据连乘（贯穿案例：先验 1%，阳性 ×10 / 阴性 ×0.11）
   ================================================================ */
const s3 = { lrs: [] }; /* 元素 'pos' | 'neg' */
const S3_MAX = 14;
function s3LR(kind) { return kind === 'pos' ? LR_PLUS : LR_MINUS; }
function s3Posts() { return applyEvidence(CASE.prev, s3.lrs.map(s3LR)); }
function s3Draw() {
  const ctx = ctxOf('s3-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const posts = s3Posts();
  const x0 = 56, x1 = W - 44, y0 = 40, y1 = H - 52;
  const X = i => x0 + (x1 - x0) * i / S3_MAX;
  const Y = p => y1 - (y1 - y0) * p;
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cTrajLab'), x0, 22);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const g of [0, 0.5, 1]) {
    ctx.strokeStyle = '#232c3d';
    ctx.beginPath(); ctx.moveTo(x0, Y(g)); ctx.lineTo(x1, Y(g)); ctx.stroke();
    ctx.fillStyle = '#5b6b82';
    ctx.fillText(pctTxt(g), x0 - 24, Y(g) + 4);
  }
  /* 轨迹 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  posts.forEach((p, i) => { const px = X(i), py = Y(p); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
  ctx.stroke();
  posts.forEach((p, i) => {
    ctx.fillStyle = i === 0 ? '#ffb454' : '#6ee7ff';
    ctx.beginPath(); ctx.arc(X(i), Y(p), i === posts.length - 1 ? 6 : 4, 0, TAU); ctx.fill();
  });
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'left';
  ctx.fillText(t('cStartPt') + ' ' + pctTxt(posts[0]), X(0), Y(posts[0]) - 14);
  const last = posts[posts.length - 1];
  ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'right';
  ctx.fillText(pctTxt(last), X(posts.length - 1) + 8, Y(last) - 12);
  /* x 轴步数 */
  ctx.fillStyle = '#5b6b82'; ctx.textAlign = 'center'; ctx.font = '12px system-ui, sans-serif';
  for (let i = 0; i <= S3_MAX; i += 2) ctx.fillText(String(i), X(i), y1 + 20);
}
function s3Chips() {
  const box = $('s3-chips');
  if (!s3.lrs.length) { box.innerHTML = '<span class="empty">' + t('chipPos') + ' ×0 · ' + t('chipNeg') + ' ×0</span>'; return; }
  box.innerHTML = s3.lrs.map(k =>
    '<span class="chip ' + k + '">' + t(k === 'pos' ? 'chipPos' : 'chipNeg') + ' ×' + fmtLR(s3LR(k)) + '</span>'
  ).join('');
}
function s3Readout() {
  const posts = s3Posts();
  const n = s3.lrs.length;
  $('s3-addpos').disabled = n >= S3_MAX;
  $('s3-addneg').disabled = n >= S3_MAX;
  $('s3-undo').disabled = n === 0;
  if (!n) { $('s3-readout').innerHTML = t('s3ro0'); return; }
  let odds = probToOdds(CASE.prev);
  let chain = fmtOdds(odds);
  for (const k of s3.lrs) { chain += ' ×' + fmtLR(s3LR(k)); odds *= s3LR(k); }
  let html = t('s3ro', { chain, odds: fmtOdds(odds), post: pctTxt(posts[n]), n });
  if (n >= S3_MAX) html += '<br>' + t('s3cap', { max: S3_MAX });
  $('s3-readout').innerHTML = html;
}
function s3Refresh() { s3Draw(); s3Chips(); s3Readout(); }
$('s3-addpos').addEventListener('click', () => { if (s3.lrs.length < S3_MAX) { s3.lrs.push('pos'); s3Refresh(); } });
$('s3-addneg').addEventListener('click', () => { if (s3.lrs.length < S3_MAX) { s3.lrs.push('neg'); s3Refresh(); } });
$('s3-undo').addEventListener('click', () => { s3.lrs.pop(); s3Refresh(); });
$('s3-clear').addEventListener('click', () => { s3.lrs = []; s3Refresh(); });
onLangRefresh(s3Refresh);
onRefit(() => s3Draw());
s3Refresh();

/* ================================================================
   第 4 步 · 连续版：Beta 先验 + 抛币 → Beta 后验（闭式）
   ================================================================ */
const PRIORS = { flat: [1, 1], weak: [8, 8], strong: [40, 10] };
const s4 = {
  priKey: 'flat', seed: 20261016, rng: null,
  randH: 0, randT: 0, manH: 0, manT: 0, recent: [], flash: null
};
function s4ResetStream() {
  s4.rng = mulberry32(s4.seed);
  s4.randH = 0; s4.randT = 0; s4.recent = [];
}
function s4Totals() { return { H: s4.randH + s4.manH, T: s4.randT + s4.manT }; }
function s4Post() {
  const [a, b] = PRIORS[s4.priKey];
  const { H, T } = s4Totals();
  return posteriorAfterFlips(a, b, H, T);
}
function s4FlipRandom(k) {
  s4.flash = null;
  for (let i = 0; i < k; i++) {
    const head = s4.rng() < COIN_THETA;
    if (head) s4.randH++; else s4.randT++;
    s4.recent.push(head ? 1 : 0);
    if (s4.recent.length > 24) s4.recent.shift();
  }
  s4Draw(); s4Readout();
}
function drawBetaPlot(ctx, curves, opts) {
  /* curves: [{a,b,col,dash,fill,legend}]；opts: {trueX, meanX, meanLab} */
  const W = ctx.canvas._w, H = ctx.canvas._h;
  const x0 = 52, x1 = W - 18, y1 = H - (opts.strip ? 78 : 44);
  /* 图例先量宽分行：窄屏换行时绘图区整体下移腾位（第 2 轮修复 M1） */
  const legItems = curves.map(c => [c.legend, c.col]);
  const legRows = legendRows(ctx, legItems, x1 - (x0 + 2) - 4);
  const y0 = (opts.trueX !== undefined ? 50 : 30) + (legRows.length - 1) * 16; /* 有 θ* 标签时让出图例行下的一行 */
  const NPT = 200;
  let ymax = 1.15;
  const sampled = curves.map(c => {
    const ys = [];
    for (let i = 0; i <= NPT; i++) {
      const x = 0.002 + 0.996 * i / NPT;
      const y = betaPdf(x, c.a, c.b);
      ys.push(isFinite(y) ? y : 0);
      if (y > ymax && isFinite(y)) ymax = y;
    }
    return ys;
  });
  ymax *= 1.12;
  const X = x => x0 + (x1 - x0) * x;
  const Y = y => y1 - (y1 - y0) * y / ymax;
  ctx.font = '12px system-ui, sans-serif';
  for (const g of [0, 0.25, 0.5, 0.75, 1]) {
    ctx.strokeStyle = '#1c2330';
    ctx.beginPath(); ctx.moveTo(X(g), y0); ctx.lineTo(X(g), y1); ctx.stroke();
    ctx.fillStyle = '#5b6b82'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(fmt(g, 2), X(g), y1 + 6);
  }
  ctx.fillStyle = '#5b6b82'; ctx.textAlign = 'right';
  ctx.fillText(opts.xLab || '', x1, y1 + 24);
  /* 真实 θ* 标记 */
  if (opts.trueX !== undefined) {
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(X(opts.trueX), y0); ctx.lineTo(X(opts.trueX), y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb454'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = '12px system-ui, sans-serif';
    const tx = clamp(X(opts.trueX), 64, W - 64);
    ctx.fillText(opts.trueLab || '', tx, y0 - 10);
  }
  curves.forEach((c, ci) => {
    const ys = sampled[ci];
    ctx.beginPath();
    for (let i = 0; i <= NPT; i++) {
      const x = 0.002 + 0.996 * i / NPT;
      const px = X(x), py = Y(ys[i]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    if (c.fill) {
      ctx.save();
      ctx.lineTo(X(0.998), Y(0)); ctx.lineTo(X(0.002), Y(0)); ctx.closePath();
      ctx.fillStyle = c.fill; ctx.fill();
      ctx.restore();
      ctx.beginPath();
      for (let i = 0; i <= NPT; i++) {
        const x = 0.002 + 0.996 * i / NPT;
        const px = X(x), py = Y(ys[i]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    }
    ctx.strokeStyle = c.col; ctx.lineWidth = 2;
    ctx.setLineDash(c.dash || []);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  drawLegendRows(ctx, legRows, x0 + 2, 16);
  return { X, Y, y0, y1, x0, x1 };
}
function s4Draw() {
  const ctx = ctxOf('s4-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const [pa, pb] = PRIORS[s4.priKey];
  const post = s4Post();
  const geo = drawBetaPlot(ctx, [
    { a: pa, b: pb, col: '#9aa7b8', dash: [5, 4], legend: t('cPriorPdf') },
    { a: post.a, b: post.b, col: '#6ee7ff', fill: 'rgba(110,231,255,0.12)', legend: t('cPostPdf') }
  ], { trueX: COIN_THETA, trueLab: t('cTrue'), xLab: t('cThetaLab'), strip: true });
  /* 后验均值竖线 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]);
  ctx.beginPath(); ctx.moveTo(geo.X(post.mean), geo.y0); ctx.lineTo(geo.X(post.mean), geo.y1); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#6ee7ff'; ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  const meanTxt = t('cMean') + ' ' + fmt(post.mean, 3);
  const meanW = ctx.measureText(meanTxt).width;
  if (post.mean > 0.8) {
    ctx.textAlign = 'right';
    ctx.fillText(meanTxt, Math.min(geo.X(post.mean) - 6, W - 4), geo.y0 + 26);
  } else {
    ctx.textAlign = 'left';
    /* 左对齐时右界钳制：均值 0.7 段在窄屏会顶出画布右缘（第 2 轮修复同类项） */
    ctx.fillText(meanTxt, Math.min(geo.X(post.mean) + 6, W - 4 - meanW), geo.y0 + 26);
  }
  /* 最近随机抛币条 */
  const sy = H - 34;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'left';
  const lab = t('cRecent');
  ctx.fillText(lab, geo.x0, sy + 4);
  let dx = geo.x0 + ctx.measureText(lab).width + 12;
  for (const f of s4.recent) {
    ctx.fillStyle = f ? '#6ee7ff' : '#5b6b82';
    ctx.beginPath(); ctx.arc(dx, sy + 3, 5, 0, TAU); ctx.fill();
    dx += 15;
    if (dx > W - 20) break;
  }
}
function s4Readout() {
  const post = s4Post();
  const { H, T } = s4Totals();
  const [pa, pb] = PRIORS[s4.priKey];
  $('s4-readout').innerHTML = t('s4ro', {
    seed: s4.seed, rh: s4.randH, rt: s4.randT, mh: s4.manH, mt: s4.manT,
    n: H + T, h: H, a: post.a, b: post.b,
    mean: fmt(post.mean, 3), mode: isFinite(post.mode) ? fmt(post.mode, 3) : t('dash'),
    pmean: fmt(betaMean(pa, pb), 3)
  }) + (s4.flash === 'seed'
    ? '<br>' + t('s4seedNote', { mh: s4.manH, mt: s4.manT })
    : '');
}
document.querySelectorAll('#step4 .pri').forEach(b => {
  b.addEventListener('click', () => {
    s4.priKey = b.dataset.pri;
    s4.flash = null;
    document.querySelectorAll('#step4 .pri').forEach(x => x.classList.toggle('active', x === b));
    s4Draw(); s4Readout();
  });
});
$('s4-f1').addEventListener('click', () => s4FlipRandom(1));
$('s4-f10').addEventListener('click', () => s4FlipRandom(10));
$('s4-f100').addEventListener('click', () => s4FlipRandom(100));
$('s4-manh').addEventListener('click', () => { s4.flash = null; s4.manH++; s4Draw(); s4Readout(); });
$('s4-mant').addEventListener('click', () => { s4.flash = null; s4.manT++; s4Draw(); s4Readout(); });
$('s4-seed').addEventListener('click', () => {
  /* B1 修复：换种子只重启随机序列——手动记账按正文承诺分开计数、保留不清零；
     并在读数里留一行反馈，写明手动账仍在（flash 在下一次其他操作时清除） */
  s4.seed = freshSeed();
  s4ResetStream();
  s4.flash = 'seed';
  s4Draw(); s4Readout();
});
$('s4-reset').addEventListener('click', () => {
  s4ResetStream(); s4.manH = 0; s4.manT = 0; s4.flash = null;
  s4Draw(); s4Readout();
});
s4ResetStream();
onLangRefresh(() => { s4Draw(); s4Readout(); });
onRefit(() => s4Draw());
s4Draw(); s4Readout();

/* ================================================================
   第 5 步上半 · 先验洗刷：两先验喂同一条带种子序列
   ================================================================ */
const s5w = { seed: 987654321, rng: null, flips: [], h: 0, n: 0 };
function s5wEnsure(n) {
  if (!s5w.rng) s5w.rng = mulberry32(s5w.seed);
  while (s5w.flips.length < n) {
    const f = s5w.rng() < COIN_THETA;
    s5w.flips.push(f);
    if (f) s5w.h++;
  }
}
function s5wMeans() {
  const H = s5w.flips.slice(0, s5w.n).reduce((s, f) => s + (f ? 1 : 0), 0);
  const Tn = s5w.n - H;
  return {
    H, T: Tn,
    flat: posteriorAfterFlips(1, 1, H, Tn),
    strong: posteriorAfterFlips(40, 10, H, Tn)
  };
}
function s5Draw() {
  const ctx = ctxOf('s5-canvas');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const m = s5wMeans();
  const narrow = W < 620; /* 窄屏图例去掉 Beta 参数后缀防撞行（参数可由读数 n/H 推出） */
  drawBetaPlot(ctx, [
    { a: m.flat.a, b: m.flat.b, col: '#e8edf4', dash: [5, 4], legend: t('cFlatPost') + (narrow ? '' : ' Beta(' + m.flat.a + ', ' + m.flat.b + ')') },
    { a: m.strong.a, b: m.strong.b, col: '#ffb454', fill: 'rgba(255,180,84,0.10)', legend: t('cStrongPost') + (narrow ? '' : ' Beta(' + m.strong.a + ', ' + m.strong.b + ')') }
  ], { trueX: COIN_THETA, trueLab: t('cTrue'), xLab: t('cThetaLab') });
}
function s5Readout() {
  const m = s5wMeans();
  const diff = Math.abs(m.strong.mean - m.flat.mean);
  $('s5-readout').innerHTML = t('s5ro', {
    seed: s5w.seed, n: s5w.n, h: m.H,
    ma: fmt(m.flat.mean, 3), mb: fmt(m.strong.mean, 3), diff: fmt(diff, 3)
  });
  $('s5-note').innerHTML = t(diff > 0.03 || s5w.n === 0 ? 's5noteSmall' : 's5noteBig', { diff: fmt(diff, 3) });
}
function s5SetN(n) {
  s5w.n = clamp(n, 0, 600);
  s5wEnsure(s5w.n);
  s5Draw(); s5Readout();
}
$('s5-w10').addEventListener('click', () => s5SetN(s5w.n + 10));
$('s5-w100').addEventListener('click', () => s5SetN(s5w.n + 100));
$('s5-w600').addEventListener('click', () => s5SetN(600));
$('s5-reset').addEventListener('click', () => s5SetN(0));
onLangRefresh(() => { s5Draw(); s5Readout(); });
onRefit(() => s5Draw());
s5Draw(); s5Readout();

/* ================================================================
   第 5 步下半 · 自然频率树（患病率整百分点 → 人数全整数）
   ================================================================ */
const s5t = { prevPct: 1 };
function s5Counts() {
  const c = freqCounts(10000, s5t.prevPct / 100, CASE.sens, CASE.fpr);
  /* 整百分点步进下理论上全整数，round 只去掉浮点尘 */
  for (const k of ['sick', 'healthy', 'tp', 'fn', 'fp', 'tn', 'pool']) c[k] = Math.round(c[k]);
  c.ppv = c.pool ? c.tp / c.pool : NaN;
  return c;
}
function s5TreeDraw() {
  const ctx = ctxOf('s5-tree');
  const W = ctx.canvas._w, H = ctx.canvas._h;
  ctx.clearRect(0, 0, W, H);
  const c = s5Counts();
  const box = (cx, y, w, h, col, lab, num, tag) => {
    ctx.fillStyle = '#1c2330';
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    const x = cx - w / 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (tag !== undefined) {
      ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
      ctx.fillText(lab, cx, y + 11);
      ctx.font = 'bold 16px system-ui, sans-serif'; ctx.fillStyle = '#e8edf4';
      ctx.fillText(fmtInt(num), cx, y + h / 2 + 3);
      ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = col;
      ctx.fillText(tag, cx, y + h - 11);
    } else {
      ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
      ctx.fillText(lab, cx, y + 13);
      ctx.font = 'bold 17px system-ui, sans-serif'; ctx.fillStyle = '#e8edf4';
      ctx.fillText(fmtInt(num), cx, y + h / 2 + 8);
    }
    return { x, y, w, h, cx };
  };
  const link = (x1, y1, x2, y2) => {
    ctx.strokeStyle = '#3a465e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const rootW = Math.min(200, W * 0.5), midW = Math.min(210, W * 0.44), leafW = Math.min(168, W * 0.235);
  const root = box(W / 2, 10, rootW, 46, '#2b3547', t('tbAll'), 10000);
  const sick = box(W * 0.26, 92, midW, 48, '#ffb454', t('tbSick'), c.sick);
  const heal = box(W * 0.74, 92, midW, 48, '#5b6b82', t('tbHealthy'), c.healthy);
  link(root.cx - rootW * 0.2, 56, sick.cx, 92);
  link(root.cx + rootW * 0.2, 56, heal.cx, 92);
  const leafY = 176, leafH = 62;
  const tpParts = t('tbTP').split('·').map(s => s.trim());
  const fnParts = t('tbFN').split('·').map(s => s.trim());
  const fpParts = t('tbFP').split('·').map(s => s.trim());
  const tnParts = t('tbTN').split('·').map(s => s.trim());
  const tp = box(W * 0.13, leafY, leafW, leafH, '#6ee7ff', tpParts[0], c.tp, tpParts[1]);
  const fn = box(W * 0.375, leafY, leafW, leafH, '#ff7a93', fnParts[0], c.fn, fnParts[1]);
  const fp = box(W * 0.625, leafY, leafW, leafH, '#ffb454', fpParts[0], c.fp, fpParts[1]);
  const tn = box(W * 0.87, leafY, leafW, leafH, '#9aa7b8', tnParts[0], c.tn, tnParts[1]);
  link(sick.cx - midW * 0.18, 140, tp.cx, leafY);
  link(sick.cx + midW * 0.18, 140, fn.cx, leafY);
  link(heal.cx - midW * 0.18, 140, fp.cx, leafY);
  link(heal.cx + midW * 0.18, 140, tn.cx, leafY);
  /* 阳性池结论行：患病率高时数字变长，窄屏收字号防双边溢出（第 2 轮修复同类项） */
  ctx.fillStyle = '#6ee7ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const poolCap = t('tbPoolCap', { pool: fmtInt(c.pool), tp: fmtInt(c.tp), ppv: pctTxt(c.ppv) });
  fitFontPx(ctx, poolCap, W - 12, 14.5, 'bold');
  ctx.fillText(poolCap, W / 2, 276);
}
function s5TreeReadout() {
  const c = s5Counts();
  const ppvFormula = postProb(s5t.prevPct / 100, CASE.sens, CASE.fpr);
  $('s5-prev-val').textContent = s5t.prevPct + '%';
  $('s5-treereadout').innerHTML = t('s5treRo', {
    sick: fmtInt(c.sick), tp: fmtInt(c.tp), fn: fmtInt(c.fn),
    healthy: fmtInt(c.healthy), fp: fmtInt(c.fp), tn: fmtInt(c.tn),
    pool: fmtInt(c.pool), ppv: pctTxt(c.ppv), ppvf: pctTxt(ppvFormula)
  });
}
$('s5-prev').addEventListener('input', e => {
  s5t.prevPct = parseInt(e.target.value, 10);
  s5TreeDraw(); s5TreeReadout();
});
onLangRefresh(() => { s5TreeDraw(); s5TreeReadout(); });
onRefit(() => s5TreeDraw());
s5TreeDraw(); s5TreeReadout();

/* ================================================================
   第 6 步 · 检察官谬误小测（只存所选下标，文本由状态现算）
   ================================================================ */
const s6 = { pick: null };
function s6Fb() {
  const el = $('s6-feedback');
  if (s6.pick === null) { el.innerHTML = t('s6fbNone'); return; }
  el.innerHTML = t(s6.pick === 1 ? 's6fbRight' : 's6fbWrong');
}
document.querySelectorAll('#step6 .opt').forEach(b => {
  b.addEventListener('click', () => {
    s6.pick = parseInt(b.dataset.opt, 10);
    document.querySelectorAll('#step6 .opt').forEach(x => x.classList.toggle('picked', x === b));
    s6Fb();
  });
});
onLangRefresh(s6Fb);
s6Fb();

/* ================================================================
   window.BAYES — 评审对账接口（全部走与页面相同的实现）
   ================================================================ */
window.BAYES = {
  CASE: { prev: CASE.prev, sens: CASE.sens, fpr: CASE.fpr },
  LR_PLUS, LR_MINUS, COIN_THETA,
  postProb, probToOdds, oddsToProb, lrPlus, lrMinus,
  applyEvidence, freqCounts,
  lnGamma, betaPdf, betaMean, betaMode, posteriorAfterFlips,
  mulberry32, coinSequence,
  getState() {
    const c0 = s0Counts();
    const post4 = s4Post();
    const { H, T } = s4Totals();
    const m5 = s5wMeans();
    const ct = s5Counts();
    return {
      s0: { bet: s0.bet, revealed: s0.revealed, counts: c0, ppv: c0.ppv },
      s1: { prior: s1.prior, post: s1Post() },
      s2: { prior: s2.prior, lr: s2.lr, postOdds: s2PostOdds(), post: oddsToProb(s2PostOdds()) },
      s3: { lrs: s3.lrs.slice(), posts: s3Posts() },
      s4: {
        priKey: s4.priKey, seed: s4.seed,
        randH: s4.randH, randT: s4.randT, manH: s4.manH, manT: s4.manT,
        H, T, post: post4
      },
      s5wash: {
        seed: s5w.seed, n: s5w.n, H: m5.H, T: m5.T,
        flatMean: m5.flat.mean, strongMean: m5.strong.mean,
        diff: Math.abs(m5.strong.mean - m5.flat.mean),
        flat: { a: m5.flat.a, b: m5.flat.b }, strong: { a: m5.strong.a, b: m5.strong.b }
      },
      s5tree: {
        prevPct: s5t.prevPct, counts: ct,
        ppvCounts: ct.ppv, ppvFormula: postProb(s5t.prevPct / 100, CASE.sens, CASE.fpr)
      },
      s6: { pick: s6.pick }
    };
  }
};
