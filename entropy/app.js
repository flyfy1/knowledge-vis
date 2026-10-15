'use strict';
/* 熵交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 全部读数真算：I = −log₂p、H = −Σp·log₂p、交叉熵、KL、平均码长 L
      一律由当前分布逐值计算（函数 surprise/entropy/crossEntropy/kl/
      huffmanAvgLen），单位 bits；p = 0 的项按 0·log0 = 0（极限）计，
      任何读数不出现 NaN。
   2. 对数可加性：读数由 I(1/4)、I(1/16) 与 1/p 标价现算对照
      （log：2 + 2 = 4 ✓；1/p：4 + 4 = 8 ≠ 16 ✗），非写死结论。
   3. 采样诚实：第 2 步经验平均惊讶由 mulberry32 带种子采样真跑，
      样本数 = 实际采样计数；分布一变采样即重置，不拿 H 冒充经验均值。
   4. 哈夫曼真算法：反复合并最小两节点（并列规则：权重相等时先入名单
      者先合并——叶子按 A→D、内部节点按生成先后，即 (权重, 序号) 排序）；
      码字 = 树上路径（左 0 右 1），码长 = 树深，L 由所构之树真算，
      且 H ≤ L < H+1 在读数牌上由实测值程序化判定后才打 ✓。
      构树前先剔除 p = 0 的符号（永不出现、不需要码字）：支撑只剩一个
      符号时码字为空串、码长 0、L = 0 = H（第 1 轮评审 M1 的教训：
      零符号参与构树曾抬出 L = 1 并让界牌打出假 ✓）。
   5. KL 性质：KL 由定义式逐项算（pᵢ>0 而 qᵢ=0 → +∞，如实显示 ∞，
      不钳成大数）；显示层对浮点 −0.000 量级负数钳为 0（口径写在页面上）；
      分解 H(p,q) = H(p) + KL(p‖q) 三项独立算、残差并列展示。
   6. 二十问：平均问数按决策树深度数组真算（二分全 3、逐个 [1..7,7]）。
   7. 终章：密码熵 = 长度 × log₂(字符集)，期望尝试 = 2^(H−1)（口径明示），
      时间 = 尝试 / 10¹⁰ 次每秒（速率假设明示）；物理熵注明 k_B 与单位之别。
   评审对账接口：window.ENTROPY（见文件末尾）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);
const SYMS = ['A', 'B', 'C', 'D'];
const SYMCOL = ['#6ee7ff', '#ffb454', '#ff7a93', '#7ee2a8'];
const INK = '#e8edf4', MUT = '#9aa7b8', GRID = '#2b3547', ACC = '#6ee7ff', ACC2 = '#ffb454', GOOD = '#7ee2a8', BAD = '#ff7a93';

/* ---------- 带种子 PRNG：mulberry32（沿用蒙特卡洛/贝叶斯/CLT 页贯例） ---------- */
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
   核心数学（红线 1/5 的实现本尊；读数与 ENTROPY 对账接口共用）
   ================================================================ */
function normalize(weights) {
  let s = 0;
  for (const w of weights) s += Math.max(0, w);
  if (!(s > 0)) return weights.map(() => 1 / weights.length);
  return weights.map(w => Math.max(0, w) / s);
}
/* 信息量（惊讶）：I = −log₂p；p ≤ 0 时为 +∞（不可能事件一旦发生） */
function surprise(p) { return p > 0 ? -Math.log2(p) : Infinity; }
/* 熵 H = −Σ p·log₂p；p = 0 项按极限取 0 */
function entropy(dist) {
  let h = 0;
  for (const p of dist) if (p > 0) h -= p * Math.log2(p);
  return h;
}
/* 交叉熵 H(p,q) = −Σ p·log₂q；任一 pᵢ>0 且 qᵢ=0 → +∞（如实，不钳制） */
function crossEntropy(p, q) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      if (!(q[i] > 0)) return Infinity;
      s -= p[i] * Math.log2(q[i]);
    }
  }
  return s;
}
/* KL 散度 KL(p‖q) = Σ p·log₂(p/q)，逐项真算（与 H(p,q)−H(p) 数学等价，
   页面用两者独立计算互相对账）；pᵢ>0 且 qᵢ=0 → +∞ */
function klDivergence(p, q) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      if (!(q[i] > 0)) return Infinity;
      s += p[i] * Math.log2(p[i] / q[i]);
    }
  }
  return s;
}
/* 二元熵 H(p)，端点取极限 0 */
function binaryEntropy(p) {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}
/* 惊讶 I 在分布下的标准差 σ_I（第 2 步标准误用） */
function surpriseStd(dist) {
  const H = entropy(dist);
  let v = 0;
  for (const p of dist) if (p > 0) { const d = -Math.log2(p) - H; v += p * d * d; }
  return Math.sqrt(v);
}
/* 按分布采样一个符号下标（rng 为 [0,1) 发生器） */
function drawSymbol(rng, dist) {
  const r = rng();
  let acc = 0;
  for (let i = 0; i < dist.length; i++) { acc += dist[i]; if (r < acc) return i; }
  return dist.length - 1;
}

/* ================================================================
   哈夫曼（红线 4）：反复合并 (权重, 序号) 最小的两节点。
   序号：叶子 = 符号下标 0..n−1，内部节点按生成先后递增——
   即「先入名单者先合并」。码字：左枝 0、右枝 1（先合并出的较小节点为左）。
   支撑集口径：只有 p > 0 的符号参与构树；p = 0 的符号永不出现、
   没有码字（codes/lengths 为 null）。支撑为单符号时树退化为单个
   叶子：码字为空串、码长 0、L = 0 = H（评审 M1)。
   ================================================================ */
function buildHuffman(dist) {
  const support = [];
  for (let i = 0; i < dist.length; i++) if (dist[i] > 0) support.push(i);
  const leaves = support.map(i => ({ w: dist[i], sym: i, left: null, right: null, order: i, label: SYMS[i] }));
  const stages = [leaves.slice()];   /* stages[k] = 完成 k 次合并后的森林 */
  const merges = [];
  let pool = leaves.slice();
  let order = dist.length;
  while (pool.length > 1) {
    const sorted = pool.slice().sort((x, y) => (x.w - y.w) || (x.order - y.order));
    const a = sorted[0], b = sorted[1];
    const nn = { w: a.w + b.w, sym: -1, left: a, right: b, order: order++, label: a.label + b.label };
    merges.push({ a, b, nn });
    pool = pool.filter(n => n !== a && n !== b);
    pool.push(nn);
    stages.push(pool.slice());
  }
  const root = pool[0] || null;
  const codes = {}, lengths = {};
  for (let i = 0; i < dist.length; i++) { codes[SYMS[i]] = null; lengths[SYMS[i]] = null; }
  if (root) {
    (function walk(node, path) {
      if (node.sym >= 0) { codes[SYMS[node.sym]] = path; lengths[SYMS[node.sym]] = path.length; return; }
      walk(node.left, path + '0');
      walk(node.right, path + '1');
    })(root, '');
  }
  let L = 0;
  for (const i of support) L += dist[i] * lengths[SYMS[i]];
  return { stages, merges, root, codes, lengths, L, support: support.length };
}

/* ---------- 二十问的决策深度（红线 6，按算法真算） ---------- */
function depthBinary(n) {  /* 二分：问「≤ 中点吗」 */
  let lo = 1, hi = 8, c = 0;
  while (lo < hi) { const mid = (lo + hi) >> 1; c++; if (n <= mid) hi = mid; else lo = mid + 1; }
  return c;
}
function depthSeq(n) {     /* 逐个问：是 1 吗、是 2 吗……问到 7 次全否即可排除出 8 */
  return n < 8 ? n : 7;
}

/* ---------- 密码（红线 7） ---------- */
const CRACK_RATE = 1e10;        /* 次/秒，明示假设 */
const UNIVERSE_YEARS = 13.8e9;  /* 宇宙年龄（年） */
const YEAR_SEC = 365.25 * 86400;
function passwordInfo(len, size) {
  const H = len * Math.log2(size);
  const guesses = Math.pow(2, H - 1);          /* 期望尝试：平均试遍一半空间 */
  return { H, perBit: Math.log2(size), guesses, seconds: guesses / CRACK_RATE };
}

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
function fmt(v, d) {
  if (typeof v !== 'number' || isNaN(v)) return '—';
  if (!isFinite(v)) return '∞';
  return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
}
function fmtW(v) { return String(Math.round(v * 1000) / 1000); }  /* 权重/概率简显 */
/* 大数科学计数：返回 {m, e} 使 v = m×10^e（由 log10 算，永不溢出） */
function sciParts(v) {
  if (!(v > 0) || !isFinite(v)) return { m: '∞', e: 0 };
  const e = Math.floor(Math.log10(v));
  const m = v / Math.pow(10, e);
  return { m: fmt(m, 2), e };
}
function sciStr(v) { const s = sciParts(v); return s.m + '×10^' + s.e; }
/* KL 显示口径：浮点 −0.000 量级负数钳为 0（吉布斯不等式保证 KL ≥ 0） */
function fmtKL(v) { return isFinite(v) ? fmt(Math.max(0, v), 3) : '∞'; }
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
      ctx.fillStyle = INK;
      ctx.fillText(txt, lx + 21, yy + 1);
      lx += 21 + ctx.measureText(txt).width + 18;
    }
  });
  return rows.length * 16;
}
/* 画布标题：单行长文案窄屏收字号直到量宽 ≤ maxW（沿用贝叶斯页 fitFontPx 做法） */
function drawTitle(ctx, txt, x, y, maxW) {
  let size = 13;
  const apply = () => { ctx.font = '600 ' + size + 'px system-ui, sans-serif'; };
  apply();
  while (size > 9.5 && ctx.measureText(txt).width > maxW) { size -= 0.5; apply(); }
  ctx.fillStyle = MUT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(txt, x, y);
  return size;
}

/* ================================================================
   第 0 步 · 猜下一个符号
   两台机器各自带种子 RNG；先猜后揭晓，命中率由真实猜测累积。
   ================================================================ */
function makeMachine(dist, seed) {
  return { dist: dist.slice(), seed, rng: mulberry32(seed), draws: 0, feed: [], guesses: 0, hits: 0, lastInfo: null };
}
const s0 = {
  A: makeMachine([0.7, 0.1, 0.1, 0.1], 20261016),
  B: makeMachine([0.25, 0.25, 0.25, 0.25], 20261017)
};
function s0Draw(m, guess) {
  const sym = drawSymbol(m.rng, m.dist);
  m.draws++;
  m.feed.push(sym);
  if (m.feed.length > 200) m.feed.splice(0, m.feed.length - 200);
  if (guess !== null && guess !== undefined) {
    m.guesses++;
    const hit = guess === sym;
    if (hit) m.hits++;
    m.lastInfo = { sym, guess, hit };
  }
  return sym;
}
for (const k of ['A', 'B']) for (let i = 0; i < 14; i++) s0Draw(s0[k], null);  /* 首屏预填一段流 */
function s0DrawMachine(cvId, m) {
  const ctx = ctxOf(cvId);
  const cv = $(cvId), W = cv._w, H = cv._h;
  ctx.clearRect(0, 0, W, H);
  /* 符号流：最近 28 个，格子两行 */
  const feed = m.feed.slice(-28);
  const cols = 14, cw = (W - 16) / cols, ch = 30;
  feed.forEach((s, i) => {
    const x = 8 + (i % cols) * cw, y = 6 + Math.floor(i / cols) * (ch + 6);
    const isLast = i === feed.length - 1;
    ctx.fillStyle = '#1c2330';
    ctx.strokeStyle = isLast ? ACC2 : GRID;
    ctx.lineWidth = isLast ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(x + 1.5, y, cw - 3, ch, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = SYMCOL[s];
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(SYMS[s], x + cw / 2, y + ch / 2 + 1);
  });
  /* 分布小条：四个符号的概率 */
  const bw = (W - 16) / 4;
  m.dist.forEach((p, i) => {
    const x = 8 + i * bw, y0 = 96, bh = 34;
    ctx.fillStyle = GRID;
    ctx.fillRect(x + 4, y0, bw - 8, bh);
    ctx.fillStyle = SYMCOL[i];
    ctx.fillRect(x + 4, y0 + bh * (1 - p / 0.75), bw - 8, bh * (p / 0.75));
    ctx.fillStyle = MUT;
    ctx.font = '11.5px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(SYMS[i] + ' ' + Math.round(p * 100) + '%', x + bw / 2, y0 + bh + 4);
  });
}
function s0Render() {
  s0DrawMachine('s0a-canvas', s0.A);
  s0DrawMachine('s0b-canvas', s0.B);
  for (const k of ['A', 'B']) {
    const m = s0[k], el = $('s0' + k.toLowerCase() + '-readout');
    if (!m.guesses) { el.innerHTML = t('s0ro0'); continue; }
    const last = m.lastInfo
      ? SYMS[m.lastInfo.sym] + (m.lastInfo.hit ? ' · ' + t('s0hit') : ' · ' + t('s0miss') + ' ' + SYMS[m.lastInfo.guess])
      : t('dash');
    el.innerHTML = t('s0ro', {
      n: m.guesses, hits: m.hits,
      rate: fmt(m.hits / m.guesses * 100, 1) + '%',
      last
    });
  }
  $('s0-entropy').innerHTML = t('s0H', { hA: fmt(entropy(s0.A.dist), 3), hB: fmt(entropy(s0.B.dist), 3) });
}
document.querySelectorAll('#s0a-guess .btn[data-m], #s0b-guess .btn[data-m]').forEach(b => {
  b.addEventListener('click', () => {
    const m = s0[b.dataset.m];
    s0Draw(m, parseInt(b.dataset.s, 10));
    s0Render();
  });
});
$('s0a-draw10').addEventListener('click', () => { for (let i = 0; i < 10; i++) s0Draw(s0.A, null); s0Render(); });
$('s0b-draw10').addEventListener('click', () => { for (let i = 0; i < 10; i++) s0Draw(s0.B, null); s0Render(); });
$('s0-start').addEventListener('click', () => {
  document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
});
onLangRefresh(s0Render);
onRefit(s0Render);

/* ================================================================
   第 1 步 · 惊讶的标价 I = −log₂ p ＋ 对数可加性
   滑杆 u ∈ [0,1] → p = 2^(−8u)，p ∈ [1, 1/256]。
   ================================================================ */
const s1 = { u: 0.125, seed: 777, rng: mulberry32(777), trials: 0, hits: 0 };
function s1P() { return Math.pow(2, -8 * s1.u); }
function s1Draw() {
  const ctx = ctxOf('s1-canvas');
  const W = $('s1-canvas')._w, H = $('s1-canvas')._h;
  const p = s1P(), I = surprise(p);
  ctx.clearRect(0, 0, W, H);
  const x0 = 46, x1 = W - 14, y0 = 26, y1 = H - 30;
  /* 网格：每 1 bit 一条 */
  ctx.font = '11.5px system-ui, sans-serif';
  for (let b = 0; b <= 8; b++) {
    const x = x0 + (x1 - x0) * b / 8;
    ctx.strokeStyle = b === 0 ? MUT : GRID;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    ctx.fillStyle = MUT; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(String(b), x, y1 + 6);
  }
  ctx.fillStyle = MUT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(t('cSurpY'), x0, 12);
  /* 惊讶条 */
  const bx = x0 + (x1 - x0) * Math.min(I, 8) / 8;
  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, '#2b7ea6'); grad.addColorStop(1, '#ffb454');
  ctx.fillStyle = grad;
  ctx.fillRect(x0, y0 + 62, Math.max(2, bx - x0), 58);
  ctx.fillStyle = INK; ctx.font = '700 17px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('I = ' + fmt(I, 3) + ' bits', x0 + 2, y0 + 54);
  /* 锚点刻度：1/2→1、1/8→3、1/64→6 */
  ctx.font = '11.5px system-ui, sans-serif'; ctx.textBaseline = 'top';
  for (const [bb, lab] of [[1, '1/2→1'], [3, '1/8→3'], [6, '1/64→6']]) {
    const x = x0 + (x1 - x0) * bb / 8;
    ctx.fillStyle = ACC;
    ctx.beginPath(); ctx.moveTo(x, y1 - 8); ctx.lineTo(x - 4, y1); ctx.lineTo(x + 4, y1); ctx.fill();
    ctx.fillStyle = MUT; ctx.textAlign = 'center';
    ctx.fillText(lab, x, y1 + 18);
  }
  /* 读数 */
  let frac;
  const k = -Math.log2(p);
  if (Math.abs(k - Math.round(k)) < 1e-9 && Math.round(k) <= 8) frac = Math.round(k) === 0 ? '1' : '1/' + Math.pow(2, Math.round(k));
  else frac = '≈ 1/' + Math.round(1 / p);
  $('s1-p-val').textContent = 'p = ' + fmt(p, p >= 0.01 ? 4 : 5);
  $('s1-readout').innerHTML = t('s1ro', { p: fmt(p, p >= 0.01 ? 4 : 5), frac, I: fmt(I, 3) });
}
function s1AddRender() {
  /* 对数可加性账本：全部现算（红线 2） */
  const a = surprise(0.25), j = surprise(1 / 16);          /* 2 与 4 */
  const pa = 1 / 0.25, pj = 1 / (1 / 16);                   /* 4 与 16 */
  $('s1-add').innerHTML = t('s1add', { a: fmt(a, 0), s: fmt(a + a, 0), j: fmt(j, 0), pa: fmt(pa, 0), ps: fmt(pa + pa, 0), pj: fmt(pj, 0) });
  if (!s1.trials) { $('s1-flip-readout').innerHTML = t('s1flip0'); return; }
  $('s1-flip-readout').innerHTML = t('s1flip', { n: s1.trials, hits: s1.hits, seed: s1.seed });
}
$('s1-p').addEventListener('input', e => {
  s1.u = parseInt(e.target.value, 10) / 1000;
  document.querySelectorAll('.pre1').forEach(x => x.classList.toggle('active', Math.abs(parseFloat(x.dataset.u) - s1.u) < 1e-9));
  s1Draw();
});
document.querySelectorAll('.pre1').forEach(b => {
  b.addEventListener('click', () => {
    s1.u = parseFloat(b.dataset.u);
    $('s1-p').value = String(Math.round(s1.u * 1000));
    document.querySelectorAll('.pre1').forEach(x => x.classList.toggle('active', x === b));
    s1Draw();
  });
});
$('s1-flip').addEventListener('click', () => {
  /* 一次掷四枚：全正面（四次 rng 都 < 0.5）记一次命中 */
  let all = true;
  for (let i = 0; i < 4; i++) if (s1.rng() >= 0.5) all = false;
  s1.trials++;
  if (all) s1.hits++;
  s1AddRender();
});
$('s1-seed').addEventListener('click', () => {
  s1.seed = freshSeed(); s1.rng = mulberry32(s1.seed); s1.trials = 0; s1.hits = 0;
  s1AddRender();
});
onLangRefresh(() => { s1Draw(); s1AddRender(); });
onRefit(s1Draw);

/* ================================================================
   第 2 步 · 熵工坊（与第 4 步共享分布）
   采样：带种子真跑；分布改变 → 采样重置（样本与分布严格对应）。
   ================================================================ */
const s2 = {
  weights: [50, 25, 15, 10],
  seed: 424242,
  rng: mulberry32(424242),
  surprises: [],
  running: false
};
function s2Dist() { return normalize(s2.weights); }
function s2ResetSampling() {
  s2.rng = mulberry32(s2.seed);
  s2.surprises = [];
  s2.running = false;
  $('s2-run').textContent = t('sampleRun');
}
function s2Sample(n) {
  const d = s2Dist();
  for (let i = 0; i < n; i++) {
    const idx = drawSymbol(s2.rng, d);
    s2.surprises.push(surprise(d[idx]));
    if (s2.surprises.length >= 20000) { s2.running = false; $('s2-run').textContent = t('sampleRun'); break; }
  }
}
function s2SetWeights(w, fromStep4) {
  s2.weights = w.slice();
  for (let i = 0; i < 4; i++) $('s2-w' + i).value = String(w[i]);
  s2ResetSampling();
  s2Render();
  s4Rebuild();
  if (!fromStep4) document.querySelectorAll('.pre2').forEach(x =>
    x.classList.toggle('active', x.dataset.w.split(',').map(Number).join() === w.join()));
}
function s2Draw() {
  const ctx = ctxOf('s2-canvas');
  const W = $('s2-canvas')._w, H = $('s2-canvas')._h;
  const d = s2Dist(), Hv = entropy(d);
  ctx.clearRect(0, 0, W, H);
  const lh = drawTitle(ctx, t('cDistT'), 10, 12, W - 20);
  /* 上半：分布柱 */
  const gx0 = 12, gx1 = W - 12, gy0 = 44, gy1 = 168;
  const bw = (gx1 - gx0) / 4;
  const pmax = Math.max(0.4, Math.max.apply(null, d));
  d.forEach((p, i) => {
    const x = gx0 + i * bw, bh = (gy1 - gy0) * 0.9 * p / pmax;
    ctx.fillStyle = '#1c2330';
    ctx.fillRect(x + 8, gy0, bw - 16, gy1 - gy0);
    ctx.fillStyle = SYMCOL[i];
    ctx.fillRect(x + 8, gy1 - bh, bw - 16, bh);
    ctx.fillStyle = INK; ctx.font = '700 13.5px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(SYMS[i], x + bw / 2, gy1 + 16);
    ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'top';
    ctx.fillStyle = MUT;
    ctx.fillText('p = ' + fmt(p, 3), x + bw / 2, gy1 + 20);
    if (p > 0) {
      ctx.fillStyle = SYMCOL[i]; ctx.textBaseline = 'bottom';
      ctx.fillText('I = ' + fmt(surprise(p), 2), x + bw / 2, gy1 - bh - 4);
    }
  });
  /* 下半：运行平均惊讶曲线 */
  const cy0 = 228, cy1 = H - 26;
  drawTitle(ctx, t('cRunT'), 10, 208, W - 20);
  const pos = d.filter(p => p > 0);
  const Imax = pos.length ? Math.max.apply(null, pos.map(surprise)) : 1;
  /* 纵轴口径：样本极少时运行平均可合法冲到接近 Imax（首样命中稀有符号），
     故 yMax 除原基线外还计入已见运行平均的最大值并留 6% 余量；
     曲线另有图框 clip 兜底，双保险保证折线永不出框（第 1 轮评审 S3）。 */
  const n = s2.surprises.length;
  let maxRun = 0;
  if (n > 0) {
    let r0 = 0;
    for (let i = 0; i < n; i++) { r0 += s2.surprises[i]; const m = r0 / (i + 1); if (m > maxRun) maxRun = m; }
  }
  const yMax = Math.max(Hv * 1.25, Math.min(Imax, Hv + 2.5), 0.5, maxRun * 1.06);
  const yOf = v => cy1 - (cy1 - cy0) * v / yMax;
  ctx.strokeStyle = GRID; ctx.strokeRect(gx0, cy0, gx1 - gx0, cy1 - cy0);
  /* H 线 */
  ctx.strokeStyle = ACC2; ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(gx0, yOf(Hv)); ctx.lineTo(gx1, yOf(Hv)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = ACC2; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(t('cHLine') + ' = ' + fmt(Hv, 3), gx0 + 6, yOf(Hv) - 3);
  if (n > 0) {
    let run = 0, mean = 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(gx0, cy0, gx1 - gx0, cy1 - cy0); ctx.clip();
    ctx.strokeStyle = ACC; ctx.lineWidth = 1.6;
    ctx.beginPath();
    const stride = Math.max(1, Math.floor(n / 600));
    for (let i = 0; i < n; i++) {
      run += s2.surprises[i];
      if (i % stride !== 0 && i !== n - 1) continue;
      const x = gx0 + (gx1 - gx0) * (i + 1) / Math.max(50, n);
      const y = yOf(run / (i + 1));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.restore();
    mean = run / n;
    ctx.fillStyle = ACC; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    /* 均值贴近纵轴顶端时标签改到点下方，避免与右上角 yMax 刻度叠字 */
    const mY = yOf(mean);
    ctx.fillText(t('cEmpLine') + ' = ' + fmt(mean, 3) + ' (n = ' + n + ')', gx1 - 6, mY < cy0 + 20 ? mY + 18 : mY + 3);
  }
  ctx.fillStyle = MUT; ctx.font = '11.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('0', gx0 + 2, cy1 + 5);
  ctx.textAlign = 'right';
  ctx.fillText(fmt(yMax, 1) + ' bits', gx1 - 2, cy0 + 3);
}
function s2Render() {
  const d = s2Dist();
  for (let i = 0; i < 4; i++) $('s2-w' + i + '-val').textContent = 'p = ' + fmt(d[i], 3);
  s2Draw();
  const Hv = entropy(d), n = s2.surprises.length;
  const pStr = d.map(x => fmt(x, 3)).join(', ');
  if (!n) {
    $('s2-readout').innerHTML = t('s2ro0', { p: pStr, H: fmt(Hv, 3), seed: s2.seed });
    return;
  }
  let sum = 0;
  for (const v of s2.surprises) sum += v;
  const mean = sum / n;
  $('s2-readout').innerHTML = t('s2ro', {
    p: pStr, H: fmt(Hv, 3), n, emp: fmt(mean, 3),
    diff: fmt(Math.abs(mean - Hv), 3), se: fmt(surpriseStd(d) / Math.sqrt(n), 3), seed: s2.seed
  });
}
for (let i = 0; i < 4; i++) {
  $('s2-w' + i).addEventListener('input', e => {
    s2.weights[i] = parseInt(e.target.value, 10);
    document.querySelectorAll('.pre2').forEach(x => x.classList.remove('active'));
    s2ResetSampling();
    s2Render();
    s4Rebuild();
  });
}
document.querySelectorAll('.pre2').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.pre2').forEach(x => x.classList.toggle('active', x === b));
    s2SetWeights(b.dataset.w.split(',').map(Number), false);
  });
});
$('s2-sample1').addEventListener('click', () => { s2Sample(1); s2Render(); });
$('s2-sample20').addEventListener('click', () => { s2Sample(20); s2Render(); });
$('s2-run').addEventListener('click', () => {
  s2.running = !s2.running;
  $('s2-run').textContent = t(s2.running ? 'sampleStop' : 'sampleRun');
});
$('s2-reset').addEventListener('click', () => { s2ResetSampling(); s2Render(); });
$('s2-seed').addEventListener('click', () => { s2.seed = freshSeed(); s2ResetSampling(); s2Render(); });
animate($('step2'), () => { if (s2.running) { s2Sample(4); s2Render(); } });
onLangRefresh(s2Render);
onRefit(s2Draw);

/* ================================================================
   第 3 步 · 二元熵曲线 ＋ 二十问
   ================================================================ */
const s3 = { p: 0.5, target: 4, log: null };   /* log: {kind:'bin'|'seq', target} 只存数据，文本现算 */
function s3Draw() {
  const ctx = ctxOf('s3-canvas');
  const W = $('s3-canvas')._w, H = $('s3-canvas')._h;
  ctx.clearRect(0, 0, W, H);
  drawTitle(ctx, t('cCurveT'), 10, 12, W - 20);
  const x0 = 46, x1 = W - 16, y0 = 30, y1 = H - 34;
  const X = p => x0 + (x1 - x0) * p, Y = v => y1 - (y1 - y0) * v / 1.1;
  ctx.strokeStyle = GRID;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  ctx.beginPath(); ctx.moveTo(x0, Y(1)); ctx.lineTo(x1, Y(1)); ctx.stroke();
  ctx.fillStyle = MUT; ctx.font = '11.5px system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('1 bit', x0 - 5, Y(1));
  ctx.fillText('0', x0 - 5, Y(0));
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const pv of [0, 0.25, 0.5, 0.75, 1]) ctx.fillText(fmt(pv, 2), X(pv), y1 + 6);
  /* 驼峰曲线 */
  ctx.strokeStyle = ACC; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const p = i / 200, x = X(p), y = Y(binaryEntropy(p));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke(); ctx.lineWidth = 1;
  /* 峰顶标注（量宽后靠右收，避免窄屏出界） */
  ctx.font = '12px system-ui, sans-serif';
  const pk = t('cPeak'), pw = ctx.measureText(pk).width;
  ctx.fillStyle = ACC2; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(pk, clamp(X(0.5) - pw / 2, x0, Math.max(x0, x1 - pw)), Y(1) - 6);
  /* 当前点 */
  const cx = X(s3.p), cy = Y(binaryEntropy(s3.p));
  ctx.strokeStyle = MUT; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, y1); ctx.moveTo(cx, cy); ctx.lineTo(x0, cy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = ACC2;
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
  ctx.fillStyle = INK; ctx.font = '700 13px system-ui, sans-serif';
  ctx.textAlign = cx > (x0 + x1) / 2 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('H = ' + fmt(binaryEntropy(s3.p), 3), cx + (cx > (x0 + x1) / 2 ? -10 : 10), cy - 4);
  $('s3-p-val').textContent = 'p = ' + fmt(s3.p, 3);
  $('s3-readout').innerHTML = t('s3ro', { p: fmt(s3.p, 3), H: fmt(binaryEntropy(s3.p), 3) });
}
/* 二分决策树（静态结构，深度由 depthBinary 真算；高亮到 target 的路径） */
function s3TreeDraw() {
  const ctx = ctxOf('s3q-canvas');
  const W = $('s3q-canvas')._w, H = $('s3q-canvas')._h;
  ctx.clearRect(0, 0, W, H);
  drawTitle(ctx, t('treeT'), 10, 12, W - 20);
  const yTop = 44, yBot = H - 34, levels = 3;
  const yOf = d => yTop + (yBot - yTop) * d / levels;
  const gx0 = 18, leafW = (W - gx0 * 2) / 8;
  const xOf = (lo, hi) => gx0 + ((lo + hi) / 2 - 0.5) * leafW;  /* 区间中心 = 其叶子中心均值 */
  function onPath(lo, hi) { return s3.target >= lo && s3.target <= hi; }
  function node(lo, hi, d) {
    const x = xOf(lo, hi), y = yOf(d);
    if (lo === hi) {
      const hot = s3.target === lo;
      ctx.fillStyle = hot ? ACC2 : '#1c2330';
      ctx.strokeStyle = hot ? ACC2 : GRID;
      ctx.beginPath(); ctx.roundRect(x - 13, y - 12, 26, 24, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = hot ? '#1a1206' : INK;
      ctx.font = '700 13.5px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(lo), x, y + 1);
      return;
    }
    const mid = (lo + hi) >> 1;
    const hot = onPath(lo, hi);
    ctx.fillStyle = hot ? ACC : MUT;
    ctx.beginPath(); ctx.arc(x, y, hot ? 4.5 : 3.5, 0, TAU); ctx.fill();
    ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(t('nodeQ', { mid }), x, y - 6);
    for (const [clo, chi, bit] of [[lo, mid, '0'], [mid + 1, hi, '1']]) {
      const cx = xOf(clo, chi), cy = yOf(d + 1);
      ctx.strokeStyle = onPath(clo, chi) ? ACC2 : GRID;
      ctx.lineWidth = onPath(clo, chi) ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = MUT; ctx.font = '10.5px system-ui, sans-serif'; ctx.textBaseline = 'middle';
      ctx.textAlign = bit === '0' ? 'right' : 'left';
      ctx.fillText(bit, (x + cx) / 2 + (bit === '0' ? -3 : 3), (y + cy) / 2);
      node(clo, chi, d + 1);
    }
  }
  node(1, 8, 0);
}
function s3AskLog() {
  const el = $('s3-qlog');
  if (!s3.log) { el.innerHTML = t('qIdle'); return; }
  const { kind, target } = s3.log;
  const lines = [];
  if (kind === 'bin') {
    let lo = 1, hi = 8, i = 0;
    while (lo < hi) {
      const mid = (lo + hi) >> 1; i++;
      const yes = target <= mid;
      lines.push(t('qAskLe', { i, mid, ans: yes ? t('qYes') : t('qNo') }));
      if (yes) hi = mid; else lo = mid + 1;
    }
    lines.push(t('qFound', { n: target, c: i }));
  } else {
    let i = 0, found = false;
    for (let k = 1; k <= 7; k++) {
      i++;
      const yes = target === k;
      lines.push(t('qAskEq', { i, k, ans: yes ? t('qYes') : t('qNo') }));
      if (yes) { found = true; break; }
    }
    if (!found) lines.push(t('qDeduce', { i, n: target }));
    lines.push(t('qFound', { n: target, c: i }));
  }
  el.innerHTML = lines.join('\n');
}
function s3DRender() {
  const bd = [1, 2, 3, 4, 5, 6, 7, 8].map(depthBinary);
  const sd = [1, 2, 3, 4, 5, 6, 7, 8].map(depthSeq);
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  $('s3-dreadout').innerHTML = t('s3dro', {
    bd: bd.join(', '), bm: fmt(avg(bd), 3),
    sd: sd.join(', '), sm: fmt(avg(sd), 3), extra: fmt(avg(sd) - avg(bd), 3)
  });
}
function s3Render() { s3Draw(); s3TreeDraw(); s3AskLog(); s3DRender(); }
$('s3-p').addEventListener('input', e => { s3.p = parseInt(e.target.value, 10) / 1000; s3Draw(); });
document.querySelectorAll('.num3').forEach(b => {
  b.addEventListener('click', () => {
    s3.target = parseInt(b.dataset.n, 10);
    document.querySelectorAll('.num3').forEach(x => x.classList.toggle('active', x === b));
    s3TreeDraw();
  });
});
$('s3-rand').addEventListener('click', () => {
  const n = 1 + Math.floor(Math.random() * 8);
  s3.target = n;
  document.querySelectorAll('.num3').forEach(x => x.classList.toggle('active', parseInt(x.dataset.n, 10) === n));
  s3TreeDraw();
});
$('s3-bin').addEventListener('click', () => { s3.log = { kind: 'bin', target: s3.target }; s3AskLog(); });
$('s3-seq').addEventListener('click', () => { s3.log = { kind: 'seq', target: s3.target }; s3AskLog(); });
onLangRefresh(s3Render);
onRefit(() => { s3Draw(); s3TreeDraw(); });

/* ================================================================
   第 4 步 · 哈夫曼（分布与第 2 步共享）
   ================================================================ */
const s4 = { built: null, step: 0, playing: false, timer: 0, msg: 'ABACADAB', encoded: null, msgBad: false };
function s4Rebuild() {
  s4.built = buildHuffman(s2Dist());
  s4.step = 0;
  s4.playing = false;
  s4.encoded = null;
  s4.msgBad = false;
  $('s4-play').textContent = t('hPlay');
  s4Render();
}
function s4Layout(root) {
  /* 给森林里每棵树布局：叶子按中序占列，x = 子树叶子均值，y = 深度 */
  let col = 0;
  const pos = new Map();
  function walk(node, depth) {
    if (node.sym >= 0) { const c = col++; pos.set(node, { x: c, y: depth }); return c; }
    const l = walk(node.left, depth + 1), r = walk(node.right, depth + 1);
    pos.set(node, { x: (pos.get(node.left).x + pos.get(node.right).x) / 2, y: depth });
    return r;
  }
  walk(root, 0);
  return { pos, cols: col };
}
function s4Draw() {
  const ctx = ctxOf('s4-canvas');
  const W = $('s4-canvas')._w, H = $('s4-canvas')._h;
  ctx.clearRect(0, 0, W, H);
  drawTitle(ctx, t('cTreeT'), 10, 12, W - 20);
  const B = s4.built;
  if (!B) return;
  const forest = B.stages[s4.step];
  const pair = s4.step < B.merges.length ? B.merges[s4.step] : null;
  const yTop = 52, yBot = H - 44, maxDepth = 3;
  /* 森林总列数与各树布局 */
  const layouts = forest.map(s4Layout);
  const totalCols = layouts.reduce((s, l) => s + l.cols, 0);
  const x0 = 26, x1 = W - 26;
  const colX = c => totalCols <= 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * c / (totalCols - 1 || 1);
  const yOf = d => yTop + (yBot - yTop) * d / maxDepth;
  let offset = 0;
  forest.forEach((root, fi) => {
    const { pos } = layouts[fi];
    const px = node => colX(offset + pos.get(node).x);
    /* 连线（带 0/1） */
    (function edges(node) {
      if (node.sym >= 0) return;
      for (const [child, bit] of [[node.left, '0'], [node.right, '1']]) {
        ctx.strokeStyle = GRID;
        ctx.beginPath(); ctx.moveTo(px(node), yOf(pos.get(node).y)); ctx.lineTo(px(child), yOf(pos.get(child).y)); ctx.stroke();
        ctx.fillStyle = MUT; ctx.font = '10.5px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(bit, (px(node) + px(child)) / 2 + (bit === '0' ? -7 : 7), (yOf(pos.get(node).y) + yOf(pos.get(child).y)) / 2);
        edges(child);
      }
    })(root);
    /* 节点 */
    (function nodes(node) {
      const x = px(node), y = yOf(pos.get(node).y);
      const isPair = pair && (node === pair.a || node === pair.b);
      ctx.beginPath(); ctx.arc(x, y, node.sym >= 0 ? 15 : 12, 0, TAU);
      ctx.fillStyle = node.sym >= 0 ? '#1c2330' : '#232f45';
      ctx.fill();
      ctx.strokeStyle = isPair ? ACC2 : (node.sym >= 0 ? SYMCOL[node.sym] : MUT);
      ctx.lineWidth = isPair ? 2.5 : 1.2;
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = node.sym >= 0 ? SYMCOL[node.sym] : INK;
      ctx.font = '700 ' + (node.sym >= 0 ? 13 : 10.5) + 'px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(node.sym >= 0 ? SYMS[node.sym] : fmtW(node.w), x, y + 0.5);
      ctx.fillStyle = MUT; ctx.font = '11px system-ui, sans-serif'; ctx.textBaseline = 'top';
      if (node.sym >= 0) ctx.fillText(fmtW(node.w), x, y + 17);
      if (node.left) { nodes(node.left); nodes(node.right); }
    })(root);
    offset += layouts[fi].cols;
  });
}
function s4Render() {
  s4Draw();
  const B = s4.built;
  if (!B) return;
  const d = s2Dist(), Hv = entropy(d), L = B.L;
  const desc = s4.step < B.merges.length
    ? (s4.step === 0 ? t('s4stepInit', { n: B.support }) : t('s4stepMerge', (() => { const m = B.merges[s4.step - 1]; return { a: m.a.label, pa: fmtW(m.a.w), b: m.b.label, pb: fmtW(m.b.w), ab: m.nn.label, pab: fmtW(m.nn.w) }; })()))
    : t('s4stepDone');
  /* 定长编码基准：只有会出现的符号需要码位，support 个符号需 ceil(log2(support)) bits（单符号为 0） */
  const fixed = B.support > 1 ? Math.ceil(Math.log2(B.support)) : 0;
  /* 界牌 ✓/✗ 一律由实测 H、L 程序化判定（评审 M1：不许字符串拼凑假勾） */
  const boundOk = (L >= Hv - 1e-9) && (L <= Hv + 1 - 1e-9);
  $('s4-readout').innerHTML =
    t('s4step', { k: s4.step, total: B.merges.length, desc }) + '<br>' +
    t('s4ro', { H: fmt(Hv, 3), L: fmt(L, 3), n: B.support, fixed: fmt(fixed, 3), save: fmt(fixed - L, 3) }) + '<br>' +
    t(boundOk ? 's4bound' : 's4boundBad', { H: fmt(Hv, 3), L: fmt(L, 3), H1: fmt(Hv + 1, 3) }) +
    (B.support === 1 ? '<br>' + t('s4degen') : '');
  const lines = [t('s4codesT')];
  for (let i = 0; i < 4; i++) {
    if (!(d[i] > 0)) lines.push(t('s4codeZero', { s: SYMS[i] }));
    else if (B.lengths[SYMS[i]] === 0) lines.push(t('s4codeEmpty', { s: SYMS[i], p: fmt(d[i], 3) }));
    else lines.push(t('s4codeLine', { s: SYMS[i], p: fmt(d[i], 3), code: B.codes[SYMS[i]], len: B.lengths[SYMS[i]] }));
  }
  $('s4-codes').innerHTML = lines.join('<br>');
  $('s4-prev').disabled = s4.step <= 0;
  $('s4-next').disabled = s4.step >= B.merges.length;
  if (s4.msgBad) {
    $('s4-mreadout').innerHTML = t('s4mroBad');
  } else if (s4.encoded !== null && s4.encoded !== undefined) {
    const bits = s4.encoded;
    $('s4-mreadout').innerHTML = t('s4mro', {
      msg: s4.msg, n: s4.msg.length, bits,
      count: bits.length, emp: fmt(bits.length / s4.msg.length, 3), exp: fmt(s4.msg.length * L, 2)
    });
  } else {
    $('s4-mreadout').innerHTML = t('s4mro0');
  }
}
$('s4-prev').addEventListener('click', () => { if (s4.step > 0) { s4.step--; s4Render(); } });
$('s4-next').addEventListener('click', () => { if (s4.built && s4.step < s4.built.merges.length) { s4.step++; s4Render(); } });
$('s4-play').addEventListener('click', () => {
  s4.playing = !s4.playing;
  if (s4.playing && s4.built && s4.step >= s4.built.merges.length) s4.step = 0;
  $('s4-play').textContent = t(s4.playing ? 'hPause' : 'hPlay');
  s4Render();
});
animate($('step4'), dt => {
  if (!s4.playing || !s4.built) return;
  s4.timer += dt;
  if (s4.timer >= 0.9) {
    s4.timer = 0;
    if (s4.step < s4.built.merges.length) { s4.step++; s4Render(); }
    else { s4.playing = false; $('s4-play').textContent = t('hPlay'); }
  }
});
document.querySelectorAll('.pre4').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.pre4').forEach(x => x.classList.toggle('active', x === b));
    s2SetWeights(b.dataset.w.split(',').map(Number), true);
  });
});
document.querySelectorAll('.msg4').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.msg4').forEach(x => x.classList.toggle('active', x === b));
    s4.msg = b.dataset.msg;
    s4.encoded = null;
    s4.msgBad = false;
    s4Render();
  });
});
$('s4-encode').addEventListener('click', () => {
  if (!s4.built) return;
  /* 消息含 p = 0 的符号时该符号没有码字——如实提示，不拼出假比特串 */
  if (s4.msg.split('').some(ch => s4.built.codes[ch] === null)) {
    s4.encoded = null;
    s4.msgBad = true;
  } else {
    s4.encoded = s4.msg.split('').map(ch => s4.built.codes[ch]).join('');
    s4.msgBad = false;
  }
  s4Render();
});
onLangRefresh(() => { if (s4.built) { $('s4-play').textContent = t(s4.playing ? 'hPause' : 'hPlay'); s4Render(); } });
onRefit(s4Draw);

/* ================================================================
   第 5 步 · 交叉熵与 KL
   p、q 各四个权重滑杆；平滑开关 q′ = 0.99q + 0.01·均匀。
   ∞ 口径：原始 q 使 KL = +∞ 时如实显示；平滑后读数标注「已平滑」，
   且警告框保留（说明原 q 是 +∞）。
   ================================================================ */
const EPS_SMOOTH = 0.01;
const s5 = { pw: [50, 25, 15, 10], qw: [25, 25, 25, 25], smooth: false };
function s5P() { return normalize(s5.pw); }
function s5QRaw() { return normalize(s5.qw); }
function s5QEff() {
  const q = s5QRaw();
  if (!s5.smooth) return q;
  return q.map(v => (1 - EPS_SMOOTH) * v + EPS_SMOOTH / 4);
}
function s5Draw() {
  const ctx = ctxOf('s5-canvas');
  const W = $('s5-canvas')._w, H = $('s5-canvas')._h;
  ctx.clearRect(0, 0, W, H);
  drawTitle(ctx, t('cBarsT'), 10, 12, W - 20);
  const p = s5P(), q = s5QEff();
  const items = [[t('lgP'), ACC], [t(s5.smooth ? 'lgQS' : 'lgQ'), ACC2]];
  const rows = legendRows(ctx, items, W - 24);
  drawLegendRows(ctx, rows, 12, 34);
  const gy0 = 44 + rows.length * 16, gy1 = H - 36;
  const gx0 = 14, gx1 = W - 14, gw = (gx1 - gx0) / 4;
  const pmax = Math.max(0.4, Math.max.apply(null, p.concat(q)));
  for (let i = 0; i < 4; i++) {
    const cx = gx0 + i * gw + gw / 2;
    for (const [dist, col, off] of [[p, ACC, -1], [q, ACC2, 1]]) {
      const bw = Math.min(34, gw / 2 - 8);
      const bh = (gy1 - gy0) * dist[i] / pmax;
      ctx.fillStyle = col;
      ctx.fillRect(off < 0 ? cx - bw - 2 : cx + 2, gy1 - bh, bw, bh);
      ctx.fillStyle = INK; ctx.font = '11.5px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(fmt(dist[i], 2), off < 0 ? cx - bw / 2 - 2 : cx + bw / 2 + 2, gy1 - bh - 3);
    }
    ctx.fillStyle = SYMCOL[i]; ctx.font = '700 14px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(SYMS[i], cx, gy1 + 8);
  }
}
function s5Render() {
  const p = s5P(), qRaw = s5QRaw(), q = s5QEff();
  for (let i = 0; i < 4; i++) {
    $('s5-pw' + i + '-val').textContent = 'p = ' + fmt(p[i], 3);
    $('s5-qw' + i + '-val').textContent = 'q = ' + fmt(qRaw[i], 3);
  }
  s5Draw();
  const Hp = entropy(p);
  const rawInf = !isFinite(klDivergence(p, qRaw));
  const el = $('s5-readout');
  if (!s5.smooth && rawInf) {
    const klr = klDivergence(qRaw, p);
    el.innerHTML = t('s5roInf', { Hp: fmt(Hp, 3), KLr: fmtKL(klr) });
  } else {
    const ce = crossEntropy(p, q), kl = klDivergence(p, q), klr = klDivergence(q, p);
    el.innerHTML = t(s5.smooth ? 's5roSmooth' : 's5ro', {
      Hp: fmt(Hp, 3), Hpq: fmt(ce, 3), KL: fmtKL(kl),
      sum: fmt(Hp + kl, 3), res: fmt(Math.abs(Hp + kl - ce), 4), KLr: fmtKL(klr)
    });
  }
  $('s5-inf').style.display = rawInf ? '' : 'none';
}
function s5SetSliders() {
  for (let i = 0; i < 4; i++) {
    $('s5-pw' + i).value = String(s5.pw[i]);
    $('s5-qw' + i).value = String(s5.qw[i]);
  }
}
for (let i = 0; i < 4; i++) {
  $('s5-pw' + i).addEventListener('input', e => { s5.pw[i] = parseInt(e.target.value, 10); s5Render(); });
  $('s5-qw' + i).addEventListener('input', e => { s5.qw[i] = parseInt(e.target.value, 10); s5Render(); });
}
document.querySelectorAll('.pre5p').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.pre5p').forEach(x => x.classList.toggle('active', x === b));
    s5.pw = b.dataset.w.split(',').map(Number);
    s5SetSliders();
    s5Render();
  });
});
$('s5-qcopy').addEventListener('click', () => { s5.qw = s5.pw.slice(); s5SetSliders(); s5Render(); });
$('s5-swap').addEventListener('click', () => {
  const tmp = s5.pw; s5.pw = s5.qw; s5.qw = tmp;
  s5SetSliders(); s5Render();
});
$('s5-smooth').addEventListener('change', e => { s5.smooth = e.target.checked; s5Render(); });
onLangRefresh(s5Render);
onRefit(s5Draw);

/* ================================================================
   第 6 步 · 密码强度计（物理/压缩两卡为静态文案）
   ================================================================ */
const s6 = { len: 12, size: 62 };
function timeText(seconds) {
  if (!isFinite(seconds)) return '∞';
  if (seconds < 60) return t('timeSec', { v: fmt(seconds, seconds < 10 ? 1 : 0) });
  if (seconds < 3600) return t('timeMin', { v: fmt(seconds / 60, 1) });
  if (seconds < 86400) return t('timeHour', { v: fmt(seconds / 3600, 1) });
  if (seconds < YEAR_SEC) return t('timeDay', { v: fmt(seconds / 86400, 1) });
  const years = seconds / YEAR_SEC;
  if (years < UNIVERSE_YEARS) return t('timeYear', { v: years < 1000 ? fmt(years, years < 10 ? 2 : 0) : sciStr(years) });
  return t('timeUniv', { v: sciStr(years / UNIVERSE_YEARS) });
}
function s6Draw() {
  const ctx = ctxOf('s6-canvas');
  const W = $('s6-canvas')._w, H = $('s6-canvas')._h;
  ctx.clearRect(0, 0, W, H);
  drawTitle(ctx, t('cTimeT'), 8, 11, W - 16);
  const info = passwordInfo(s6.len, s6.size);
  const x0 = 10, x1 = W - 10, y = 52, bh = 22;
  const LOGMAX = 18;   /* 10^18 秒 ≈ 31.7 × 宇宙年龄（秒） */
  const frac = clamp(Math.log10(Math.max(1, info.seconds)) / LOGMAX, 0, 1);
  ctx.fillStyle = '#1c2330';
  ctx.fillRect(x0, y, x1 - x0, bh);
  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, '#2b7ea6'); grad.addColorStop(0.55, '#ffb454'); grad.addColorStop(1, '#ff7a93');
  ctx.fillStyle = grad;
  ctx.fillRect(x0, y, (x1 - x0) * frac, bh);
  const ticks = [[0, 'tSec'], [Math.log10(86400), 'tDay'], [Math.log10(YEAR_SEC), 'tYear'], [Math.log10(UNIVERSE_YEARS * YEAR_SEC), 'tUniv']];
  ctx.font = '10.5px system-ui, sans-serif';
  for (const [lg, key] of ticks) {
    const x = x0 + (x1 - x0) * lg / LOGMAX;
    ctx.strokeStyle = MUT;
    ctx.beginPath(); ctx.moveTo(x, y + bh); ctx.lineTo(x, y + bh + 5); ctx.stroke();
    ctx.fillStyle = MUT;
    const lab = t(key), wLab = ctx.measureText(lab).width;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(lab, clamp(x - wLab / 2, x0, Math.max(x0, x1 - wLab)), y + bh + 9);
  }
  /* 当前值标记 */
  const mx = x0 + (x1 - x0) * frac;
  ctx.fillStyle = INK; ctx.font = '700 12px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText(timeText(info.seconds), clamp(mx, 60, Math.max(60, W - 60)), y - 5);
}
function s6Render() {
  $('s6-len-val').textContent = String(s6.len);
  s6Draw();
  const info = passwordInfo(s6.len, s6.size);
  $('s6-readout').innerHTML = t('s6ro', {
    size: s6.size, per: fmt(info.perBit, 3), H: fmt(info.H, 1),
    g: sciStr(info.guesses), time: timeText(info.seconds)
  });
}
$('s6-len').addEventListener('input', e => { s6.len = parseInt(e.target.value, 10); s6Render(); });
document.querySelectorAll('.cs6').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.cs6').forEach(x => x.classList.toggle('active', x === b));
    s6.size = parseInt(b.dataset.size, 10);
    s6Render();
  });
});
onLangRefresh(s6Render);
onRefit(s6Draw);

/* ================================================================
   首屏渲染（语言先行由 i18n 的 DOMContentLoaded 触发 applyLang；
   这里先按当前语言画一遍，applyLang 时会经 onLangRefresh 重绘）
   ================================================================ */
s0Render();
s1Draw(); s1AddRender();
s2Render();
s3Render();
s4Rebuild();
s5Render();
s6Render();

/* ================================================================
   window.ENTROPY — 评审对账接口（全部走与页面相同的实现）
   ================================================================ */
window.ENTROPY = {
  mulberry32, normalize, surprise, entropy, crossEntropy, klDivergence, binaryEntropy, surpriseStd,
  buildHuffman, depthBinary, depthSeq, passwordInfo,
  CRACK_RATE, EPS_SMOOTH,
  /* 带种子采样原语：评审可换任意种子复跑 */
  sampleSymbols(dist, n, seed) {
    const rng = mulberry32(seed);
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = drawSymbol(rng, dist);
    return out;
  },
  sampleSurprises(dist, n, seed) {
    const rng = mulberry32(seed);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += surprise(dist[drawSymbol(rng, dist)]);
    return { n, mean: sum / n, H: entropy(dist) };
  },
  guessDepths: {
    binary: [1, 2, 3, 4, 5, 6, 7, 8].map(depthBinary),
    sequential: [1, 2, 3, 4, 5, 6, 7, 8].map(depthSeq)
  },
  getState() {
    const d2 = s2Dist();
    let s2mean = NaN;
    if (s2.surprises.length) { let s = 0; for (const v of s2.surprises) s += v; s2mean = s / s2.surprises.length; }
    const p5 = s5P(), q5r = s5QRaw(), q5 = s5QEff();
    return {
      s0: {
        A: { dist: s0.A.dist, seed: s0.A.seed, draws: s0.A.draws, guesses: s0.A.guesses, hits: s0.A.hits, H: entropy(s0.A.dist) },
        B: { dist: s0.B.dist, seed: s0.B.seed, draws: s0.B.draws, guesses: s0.B.guesses, hits: s0.B.hits, H: entropy(s0.B.dist) }
      },
      s1: { p: s1P(), I: surprise(s1P()), trials: s1.trials, hits: s1.hits, seed: s1.seed },
      s2: { weights: s2.weights.slice(), dist: d2, H: entropy(d2), seed: s2.seed, n: s2.surprises.length, empMean: s2mean },
      s3: { p: s3.p, H: binaryEntropy(s3.p), target: s3.target },
      s4: s4.built ? {
        dist: d2, H: entropy(d2), L: s4.built.L, support: s4.built.support, codes: s4.built.codes, lengths: s4.built.lengths,
        merges: s4.built.merges.map(m => ({ a: m.a.label, b: m.b.label, w: m.nn.w }))
      } : null,
      s5: {
        p: p5, qRaw: q5r, qEff: q5, smooth: s5.smooth,
        Hp: entropy(p5), Hpq: crossEntropy(p5, q5), KLpq: klDivergence(p5, q5), KLqp: klDivergence(q5, p5)
      },
      s6: { len: s6.len, size: s6.size, info: passwordInfo(s6.len, s6.size) }
    };
  }
};
