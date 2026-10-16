'use strict';
/* 卡尔曼滤波交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 递推真算：一维 kalman1d / stepKalman1d、二二维 kalman2d 只有一份实现，
      页面所有轨迹都由它按印出的公式逐点算出；序列由带种子 RNG 生成，
      经 window.KALMAN 全量导出，任何人可按公式逐步复算。
   2. RMSE 真算：所有误差读数由同一批序列对真值现算；文案不预设结论，
      参数调拧时滤波可以当场输（第 3 步信模型档 RMSE 就大于原始测量）。
   3. K 方向属实：稳态 K 由闭式 steadyQR 给出，Q↑→K↑、R↑→K↓；
      恢复用「进入步数 + 带内占比」双指标（定义见第 3 步正文与 entryShare）。
   4. 稳态自洽：P 的固定点满足代数 Riccati 方程（残差在读数里给出）；
      指数平滑等价演示从第 250 步同状态起跑，最大差如实读出。
   5. 二维 P 健全：kalman2d 每步更新后对称化（数值卫生，标准做法），
      P 全程对称、对角元 > 0，逐步值经 window.KALMAN 导出可查。
   6. 回勾口径：第 6 步只讲「高斯后验均值 = 精度加权」这一真结论，
      与贝叶斯页的二元情形只称同源，不称同一。 */
const $ = id => document.getElementById(id);

/* ================================================================
   带种子 RNG（mulberry32 + Marsaglia polar 高斯，与独立实现可逐位对齐）
   ================================================================ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
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
   场景生成（抽取顺序固定并写明，评审可按种子重建）
   genWalk / genStep：先抽完全部过程噪声 w[0..N-2]，再抽全部测量噪声 v[0..N-1]。
   gen2D：真值速度剖面是确定的，只抽测量噪声 v[0..N-1]；
   man === false 时速度全程恒定 0.35（无机动对照场景），噪声抽取顺序与数值不变。
   ================================================================ */
function genWalk(seed, N, sigW, sigV, jumpAt, jump) {
  const g = makeGauss(mulberry32(seed));
  const w = [], v = [];
  for (let i = 0; i < N - 1; i++) w.push(g());
  for (let i = 0; i < N; i++) v.push(g());
  const truth = [0];
  for (let k = 1; k < N; k++) truth.push(truth[k - 1] + w[k - 1] * sigW + (k === jumpAt ? jump : 0));
  const z = truth.map((x, k) => x + v[k] * sigV);
  return { truth, z };
}
function genStep(seed, N, sigW, sigV, J, level) {
  const g = makeGauss(mulberry32(seed));
  const w = [], v = [];
  for (let i = 0; i < N - 1; i++) w.push(g());
  for (let i = 0; i < N; i++) v.push(g());
  const truth = [0];
  for (let k = 1; k < N; k++) truth.push(truth[k - 1] + w[k - 1] * sigW);
  for (let k = 0; k < N; k++) if (k >= J) truth[k] += level;
  const z = truth.map((x, k) => x + v[k] * sigV);
  return { truth, z };
}
function gen2D(seed, N, sigV, man) {
  const g = makeGauss(mulberry32(seed));
  const v = [];
  for (let i = 0; i < N; i++) v.push(g());
  const vel = [];
  for (let k = 0; k < N; k++) vel.push(man === false ? 0.35 : (k < 60 ? 0.35 : (k < 110 ? -0.30 : 0.55)));
  const pos = [0];
  for (let k = 1; k < N; k++) pos.push(pos[k - 1] + vel[k - 1]);
  const z = pos.map((x, k) => x + v[k] * sigV);
  return { pos, vel, z };
}

/* ================================================================
   一维卡尔曼（随机游走模型，公式与页面印出的完全一致）
   预测 x̂⁻ = x̂ ， P⁻ = P + Q ；K = P⁻ / (P⁻ + R) ；
   更新 x̂ = x̂⁻ + K(z − x̂⁻) ， P = (1 − K)P⁻ 。
   est[0] = x0 ， P[0] = P0 ， K[0] = null（第 0 步没有更新）。
   ================================================================ */
function stepKalman1d(x, P, z, Q, R) {
  const xPred = x, PPred = P + Q;
  const K = PPred / (PPred + R);
  const res = z - xPred;
  return { xPred, PPred, K, res, x: xPred + K * res, P: (1 - K) * PPred };
}
function kalman1d(z, Q, R, x0, P0) {
  const N = z.length;
  const est = new Array(N), Parr = new Array(N), Karr = new Array(N).fill(null);
  let x = x0, P = P0;
  est[0] = x; Parr[0] = P;
  for (let k = 1; k < N; k++) {
    const s = stepKalman1d(x, P, z[k], Q, R);
    x = s.x; P = s.P;
    est[k] = x; Parr[k] = P; Karr[k] = s.K;
  }
  return { est, P: Parr, K: Karr };
}
/* 稳态闭式：预测方差 S 解 S² − QS − QR = 0 → S = (Q + √(Q² + 4QR)) / 2，
   P* = S − Q ， K* = S / (S + R) 。 */
function steadyQR(Q, R) {
  const S = (Q + Math.sqrt(Q * Q + 4 * Q * R)) / 2;
  return { S, P: S - Q, K: S / (S + R) };
}
function riccatiStep(P, Q, R) { return (P + Q) * R / (P + Q + R); }
function rmse(a, b) {
  let s = 0;
  for (let k = 0; k < a.length; k++) s += (a[k] - b[k]) * (a[k] - b[k]);
  return Math.sqrt(s / a.length);
}
function movingAvg(z, W) {
  const out = [];
  for (let k = 0; k < z.length; k++) {
    const lo = Math.max(0, k - W + 1);
    let s = 0;
    for (let j = lo; j <= k; j++) s += z[j];
    out.push(s / (k - lo + 1));
  }
  return out;
}
/* 第 3 步恢复双指标：进入步数 = 阶跃后 est 首次落进 truth ± band 的步数（无则 null）；
   带内占比 = k ≥ J 的全部步数中 |est − truth| ≤ band 的比例。 */
function entryShare(est, truth, J, band) {
  let entry = null, inside = 0;
  for (let k = J; k < est.length; k++) {
    if (Math.abs(est[k] - truth[k]) <= band) { inside++; if (entry === null) entry = k - J; }
  }
  return { entry, share: inside / (est.length - J) };
}

/* ================================================================
   二维卡尔曼（匀速模型，dt = 1）
   F = [[1,1],[0,1]] ， H = [1,0] ， Q = q·[[1/4,1/2],[1/2,1]] ， R 标量。
   k = 0 用初值 P 直接更新（不预测），k ≥ 1 先预测后更新；
   更新后对称化 P（数值卫生）。与独立实现同构。
   ================================================================ */
const F2 = [[1, 1], [0, 1]], H2 = [1, 0];
function qMatrix(q) { return [[q / 4, q / 2], [q / 2, q]]; }
function kalman2d(z, q, R) {
  const N = z.length, Q = qMatrix(q);
  let x = [z[0], 0];
  let P = [[4, 0], [0, 1]];
  const pos = new Array(N), vel = new Array(N), Parr = new Array(N);
  for (let k = 0; k < N; k++) {
    if (k > 0) {
      x = [x[0] + x[1], x[1]];
      P = [
        [P[0][0] + P[0][1] + P[1][0] + P[1][1] + Q[0][0], P[0][1] + P[1][1] + Q[0][1]],
        [P[1][0] + P[1][1] + Q[1][0], P[1][1] + Q[1][1]]
      ];
    }
    const S = P[0][0] + R;
    const K = [P[0][0] / S, P[1][0] / S];
    const r = z[k] - x[0];
    x = [x[0] + K[0] * r, x[1] + K[1] * r];
    P = [
      [(1 - K[0]) * P[0][0], (1 - K[0]) * P[0][1]],
      [P[1][0] - K[1] * P[0][0], P[1][1] - K[1] * P[0][1]]
    ];
    const sym = (P[0][1] + P[1][0]) / 2;
    P = [[P[0][0], sym], [sym, P[1][1]]];
    pos[k] = x[0]; vel[k] = x[1];
    Parr[k] = [[P[0][0], P[0][1]], [P[1][0], P[1][1]]];
  }
  return { pos, vel, P: Parr };
}

/* ---------- 固定场景（全页与 window.KALMAN 共用） ---------- */
const SCEN_A = Object.assign({ seed: 7, N: 90, sigW: 0.25, sigV: 1.0, jumpAt: 45, jump: 3, Q: 0.0625, R: 1, P0: 1 },
  genWalk(7, 90, 0.25, 1.0, 45, 3));
const SCEN_B = Object.assign({ seed: 1234, N: 120, sigW: 0.05, sigV: 1.0, J: 40, level: 4 },
  genStep(1234, 120, 0.05, 1.0, 40, 4));
const SCEN_C = Object.assign({ seed: 7, N: 300, sigW: 0.2, sigV: Math.SQRT2, Q: 0.04, R: 2 },
  genWalk(7, 300, 0.2, Math.SQRT2, -1, 0));
const SCEN_D = Object.assign({ seed: 99, N: 160, sigV: 1.2, R: 1.44 },
  gen2D(99, 160, 1.2));
const SCEN_D_OFF = Object.assign({ seed: 99, N: 160, sigV: 1.2, R: 1.44 },
  gen2D(99, 160, 1.2, false));

/* ================================================================
   画布适配（DPR）：沿用站内 fitCanvas 方案
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
function fmtS(v, d) { return fmt(v, d === undefined ? 2 : d).replace(/-/g, '−'); }
function fmtSmart(v) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(2).replace(/-/g, '−');
  return fmtS(v, 4);
}
/* 点旁标签（量宽选边，整串必落画布内——沿用 Z 页做法） */
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
/* 角注折行（量宽换行，沿用贝叶斯/Z 页做法） */
const NOTE_BREAK_AFTER = ' ；;，,、）)】…';
function wrapNoteLines(ctx, text, maxW) {
  const lines = [];
  let cur = '', brk = 0;
  const push = s => { const t2 = s.replace(/\s+$/, ''); if (t2) lines.push(t2); };
  for (const ch of text) {
    if (cur && ctx.measureText(cur + ch).width > maxW) {
      if (brk > 0) { push(cur.slice(0, brk)); cur = cur.slice(brk).replace(/^\s+/, ''); }
      else { push(cur); cur = ''; }
      brk = 0;
      for (let i = 0; i < cur.length; i++) {
        if (NOTE_BREAK_AFTER.includes(cur[i]) || cur.codePointAt(i) > 0x2e7f) brk = i + 1;
      }
    }
    cur += ch;
    if (NOTE_BREAK_AFTER.includes(ch) || ch.codePointAt(0) > 0x2e7f) brk = cur.length;
  }
  push(cur);
  return lines.length ? lines : [''];
}
/* 图例助手（窄屏自适应）：量宽 → 贪心分行 → 逐行绘制（沿用贝叶斯页做法） */
const LEG_FONT = '12.5px system-ui, sans-serif';
function legendRows(ctx, items, maxW) {
  ctx.font = LEG_FONT;
  const rows = [];
  let row = [], rowW = 0;
  for (const [txt, col] of items) {
    const w = 21 + ctx.measureText(txt).width;
    if (w > maxW) {
      if (row.length) { rows.push(row); row = []; rowW = 0; }
      wrapNoteLines(ctx, txt, Math.max(40, maxW - 21))
        .forEach((seg, si) => rows.push([[seg, col, si !== 0]]));
      continue;
    }
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
    for (const [txt, col, cont] of row) {
      ctx.fillStyle = col;
      if (!cont) ctx.fillRect(lx, yy - 5, 16, 10);
      ctx.fillText(txt, lx + 21, yy + 1);
      lx += 21 + ctx.measureText(txt).width + 18;
    }
  });
}

/* ================================================================
   通用序列图：在 rect 内画「随 k 变化」的折线/十字标
   o: { n0, n1, legend:[[txt,col]..], yLo, yHi（缺省按数据自动）, logY, yTicks,
        shade: [{k0,k1}], vlines: [{k, col}], upto（只画 k ≤ upto 的点，动画用）,
        series: [{data（绝对下标）, color, width, alpha, dash, cross, dotR}] }
   ================================================================ */
function seriesPlot(ctx, rect, o) {
  const { x: rx, y: ry, w, h } = rect;
  const n0 = o.n0, n1 = o.n1, span = n1 - n0;
  const upto = o.upto === undefined ? n1 : o.upto;
  const legRows = o.legend ? legendRows(ctx, o.legend, w - 20) : [];
  const legH = legRows.length ? legRows.length * 16 + 6 : 0;
  const padL = 10, padR = 10, padT = 8 + legH, padB = 20;
  const pw = w - padL - padR, ph = h - padT - padB;
  let yLo = o.yLo, yHi = o.yHi;
  if (yLo === undefined || yHi === undefined) {
    let mn = Infinity, mx = -Infinity;
    for (const s of o.series) {
      for (let k = n0; k <= Math.min(n1, upto); k++) {
        const v = s.data[k];
        if (v == null || !isFinite(v)) continue;
        if (v < mn) mn = v; if (v > mx) mx = v;
      }
    }
    if (!isFinite(mn)) { mn = -1; mx = 1; }
    const pad = Math.max(0.15, (mx - mn) * 0.14);
    yLo = mn - pad * 0.55; yHi = mx + pad;
    if (yHi - yLo < 0.5) { yHi += 0.25; yLo -= 0.25; }
  }
  const X = k => rx + padL + (k - n0) / span * pw;
  const Yraw = v => ry + padT + (yHi - v) / (yHi - yLo) * ph;
  const Y = o.logY
    ? v => { const lv = Math.log10(Math.max(v, 1e-12)); return ry + padT + (yHi - lv) / (yHi - yLo) * ph; }
    : Yraw;
  /* 背景与画框 */
  ctx.fillStyle = '#11161f';
  ctx.fillRect(rx, ry, w, h);
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.lineWidth = 1;
  ctx.strokeRect(rx + 0.5, ry + 0.5, w - 1, h - 1);
  /* 阴影区（机动段） */
  if (o.shade) for (const sh of o.shade) {
    ctx.fillStyle = 'rgba(255,180,84,0.07)';
    ctx.fillRect(X(Math.max(n0, sh.k0)), ry + padT, X(Math.min(n1, sh.k1)) - X(Math.max(n0, sh.k0)), ph);
  }
  /* 竖线标记（阶跃处） */
  if (o.vlines) for (const vl of o.vlines) {
    ctx.strokeStyle = vl.col || 'rgba(154,167,184,0.55)';
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(vl.k), ry + padT); ctx.lineTo(X(vl.k), ry + padT + ph); ctx.stroke();
    ctx.setLineDash([]);
  }
  /* 零线 */
  if (!o.logY && yLo < 0 && yHi > 0) {
    ctx.strokeStyle = 'rgba(160,180,205,0.35)';
    ctx.beginPath(); ctx.moveTo(rx + padL, Y(0)); ctx.lineTo(rx + w - padR, Y(0)); ctx.stroke();
  }
  /* 纵轴标注 */
  ctx.font = '10.5px system-ui, sans-serif';
  ctx.fillStyle = '#5f7089'; ctx.textBaseline = 'top';
  if (o.logY && o.yTicks) {
    ctx.textAlign = 'left';
    for (const tv of o.yTicks) {
      const yy = Y(tv);
      if (yy < ry + padT - 2 || yy > ry + padT + ph + 2) continue;
      ctx.fillText(fmtS(tv, tv < 0.1 ? 2 : tv < 1 ? 1 : 0), rx + padL + 3, yy - 5);
      ctx.strokeStyle = 'rgba(120,140,165,0.14)';
      ctx.beginPath(); ctx.moveTo(rx + padL, yy); ctx.lineTo(rx + w - padR, yy); ctx.stroke();
    }
  } else {
    ctx.textAlign = 'right';
    ctx.fillText(fmtS(yHi, Math.abs(yHi) < 10 ? 1 : 0), rx + w - padR - 2, ry + padT + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(fmtS(yLo, Math.abs(yLo) < 10 ? 1 : 0), rx + w - padR - 2, ry + padT + ph - 1);
  }
  /* 横轴刻度 */
  const tickStep = span <= 30 ? 5 : span <= 100 ? 10 : span <= 200 ? 20 : 50;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#5f7089';
  for (let k = n0; k <= n1; k++) {
    if ((k - n0) % tickStep !== 0 && k !== n1) continue;
    ctx.fillText(String(k), X(k), ry + h - padB + 5);
  }
  /* 系列 */
  for (const s of o.series) {
    const col = s.color, alpha = s.alpha != null ? s.alpha : 1;
    ctx.globalAlpha = alpha;
    if (s.cross) {
      ctx.strokeStyle = col; ctx.lineWidth = 1.3;
      const r = 3.4;
      for (let k = n0; k <= Math.min(n1, upto); k++) {
        const v = s.data[k]; if (v == null) continue;
        const px = X(k), py = Y(v);
        ctx.beginPath();
        ctx.moveTo(px - r, py - r); ctx.lineTo(px + r, py + r);
        ctx.moveTo(px - r, py + r); ctx.lineTo(px + r, py - r);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s.width || 2;
      ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      for (let k = n0; k <= Math.min(n1, upto); k++) {
        const v = s.data[k]; if (v == null) { started = false; continue; }
        const px = X(k), py = Y(v);
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  }
  drawLegendRows(ctx, legRows, rx + 10, ry + 12);
  return { X, Y, yLo, yHi, padT, padB, ph };
}

/* ================================================================
   第 0 步：钩子（场景 A）
   ================================================================ */
const KF_A = kalman1d(SCEN_A.z, SCEN_A.Q, SCEN_A.R, SCEN_A.z[0], SCEN_A.P0);
const RMSE_A_RAW = rmse(SCEN_A.z, SCEN_A.truth);
const RMSE_A_KF = rmse(KF_A.est, SCEN_A.truth);
const s0 = { prog: 0, running: false, ran: false, revealed: false };
function drawS0() {
  const ctx = ctxOf('s0-cv');
  const upto = Math.floor(s0.prog * (SCEN_A.N - 1));
  const series = [{ data: SCEN_A.z, color: '#5b6b82', cross: true }];
  if (s0.prog > 0) series.push({ data: KF_A.est, color: '#6ee7ff', width: 2.2 });
  if (s0.revealed) series.push({ data: SCEN_A.truth, color: '#ffb454', width: 2 });
  series[0].uptoK = upto;
  seriesPlot(ctx, { x: 0, y: 0, w: $('s0-cv')._w, h: $('s0-cv')._h }, {
    n0: 0, n1: SCEN_A.N - 1, upto: s0.revealed ? SCEN_A.N - 1 : upto,
    legend: [[t('lgMeas'), '#5b6b82'], [t('lgEst'), '#6ee7ff'], [t('lgTruth'), '#ffb454']],
    series
  });
  const ro = $('s0-readout');
  if (s0.revealed) {
    ro.innerHTML = t('s0roDone', { rm: fmt(RMSE_A_RAW, 3), rk: fmt(RMSE_A_KF, 3), pct: Math.round(RMSE_A_KF / RMSE_A_RAW * 100) });
  } else if (s0.ran) {
    ro.innerHTML = t('s0roRun');
  } else {
    ro.innerHTML = t('s0ro0');
  }
  $('s0-run').disabled = s0.running || s0.ran;
  $('s0-reveal').disabled = !s0.ran || s0.revealed;
}
animate($('step0'), dt => {
  if (!s0.running) return;
  s0.prog = Math.min(1, s0.prog + dt / 1.6);
  if (s0.prog >= 1) { s0.running = false; s0.ran = true; }
  drawS0();
});
$('s0-run').addEventListener('click', () => { if (!s0.ran) { s0.running = true; drawS0(); } });
$('s0-reveal').addEventListener('click', () => { s0.revealed = true; drawS0(); });
$('s0-reset').addEventListener('click', () => { s0.prog = 0; s0.running = false; s0.ran = false; s0.revealed = false; drawS0(); });
$('s0-start').addEventListener('click', () => { $('step1').scrollIntoView({ behavior: 'smooth' }); });
onRefit(drawS0);
onLangRefresh(drawS0);

/* ================================================================
   第 1 步：两种笨办法（场景 A）
   ================================================================ */
const s1 = { W: 8 };
function drawS1() {
  const ctx = ctxOf('s1-cv');
  const ma = movingAvg(SCEN_A.z, s1.W);
  const series = [{ data: SCEN_A.truth, color: '#ffb454', width: 2 }];
  if ($('s1-show-raw').checked) series.push({ data: SCEN_A.z, color: '#5b6b82', width: 1.2, alpha: 0.85 });
  if ($('s1-show-ma').checked) series.push({ data: ma, color: '#9aa7b8', width: 2 });
  if ($('s1-show-kf').checked) series.push({ data: KF_A.est, color: '#6ee7ff', width: 2.2 });
  seriesPlot(ctx, { x: 0, y: 0, w: $('s1-cv')._w, h: $('s1-cv')._h }, {
    n0: 0, n1: SCEN_A.N - 1,
    legend: [[t('lgTruth'), '#ffb454'], [t('lgRaw'), '#5b6b82'], [t('lgMa'), '#9aa7b8'], [t('lgEst'), '#6ee7ff']],
    vlines: [{ k: SCEN_A.jumpAt }],
    series
  });
  $('s1-w-val').textContent = String(s1.W);
  $('s1-readout').innerHTML = t('s1ro', {
    rr: fmt(RMSE_A_RAW, 3), w: s1.W, rm: fmt(rmse(ma, SCEN_A.truth), 3), rk: fmt(RMSE_A_KF, 3)
  });
}
$('s1-w').addEventListener('input', e => { s1.W = parseInt(e.target.value, 10); drawS1(); });
['s1-show-raw', 's1-show-ma', 's1-show-kf'].forEach(id => $(id).addEventListener('change', drawS1));
onRefit(drawS1);
onLangRefresh(drawS1);

/* ================================================================
   第 2 步：预测—更新（场景 A 的同一台滤波器，单步推进）
   ================================================================ */
const s2 = {
  k: 1, stage: 'predict', x: SCEN_A.z[0], P: SCEN_A.P0,
  pred: null, lastUpd: null, playing: false, playLeft: 0, timer: 0
};
const BELL_LO = Math.min(...SCEN_A.z, ...SCEN_A.truth) - 1.6;
const BELL_HI = Math.max(...SCEN_A.z, ...SCEN_A.truth) + 1.6;
function gaussPdf(x, mu, varr) { return Math.exp(-((x - mu) * (x - mu)) / (2 * varr)) / Math.sqrt(2 * Math.PI * varr); }
function drawBell(ctx, rect, mu, varr, color, fill) {
  const { x: rx, y: ry, w, h } = rect;
  const X = v => rx + (v - BELL_LO) / (BELL_HI - BELL_LO) * w;
  const peak = gaussPdf(mu, mu, varr);
  const Y = v => ry + h - (v / rect._maxPdf) * (h - 26);
  ctx.beginPath();
  const M = 120;
  for (let i = 0; i <= M; i++) {
    const v = BELL_LO + (BELL_HI - BELL_LO) * i / M;
    const px = X(v), py = Y(gaussPdf(v, mu, varr));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  if (fill) {
    const baseY = Y(0);
    ctx.lineTo(X(BELL_HI), baseY); ctx.lineTo(X(BELL_LO), baseY); ctx.closePath();
    ctx.globalAlpha = 0.16; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i <= M; i++) {
      const v = BELL_LO + (BELL_HI - BELL_LO) * i / M;
      const px = X(v), py = Y(gaussPdf(v, mu, varr));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  /* 均值竖线 */
  ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X(mu), Y(0)); ctx.lineTo(X(mu), Y(peak)); ctx.stroke();
  ctx.globalAlpha = 1;
}
function drawS2() {
  const cv = $('s2-bell'), ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  /* 决定要画的钟：[mu, var, color, fill, legendKey] */
  const bells = [];
  if (s2.stage === 'update' && s2.pred) {
    bells.push([s2.pred.prevX, s2.pred.prevP, '#5b6b82', false, 'cvPost']);
    bells.push([s2.pred.xPred, s2.pred.PPred, '#6ee7ff', false, 'cvPred']);
  } else if (s2.lastUpd) {
    bells.push([s2.lastUpd.xPred, s2.lastUpd.PPred, '#6ee7ff', false, 'cvPred']);
    bells.push([s2.lastUpd.z, SCEN_A.R, '#ffb454', false, 'cvMeasBell']);
    bells.push([s2.x, s2.P, '#7ee2a8', true, 'cvPostNew']);
  } else {
    bells.push([s2.x, s2.P, '#7ee2a8', true, 'cvPostNew']);
  }
  const maxPdf = Math.max(...bells.map(b => gaussPdf(b[0], b[0], b[1])));
  const rect = { x: 0, y: 0, w: W, h: H, _maxPdf: maxPdf * 1.12 };
  /* 底框与零线 */
  ctx.fillStyle = '#11161f'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  const legRows = legendRows(ctx, bells.map(b => [t(b[4]), b[2]]), W - 20);
  drawLegendRows(ctx, legRows, 10, 12);
  const plotRect = { x: 6, y: legRows.length * 16 + 12, w: W - 12, h: H - legRows.length * 16 - 40, _maxPdf: rect._maxPdf };
  for (const b of bells) drawBell(ctx, plotRect, b[0], b[1], b[2], b[3]);
  /* 横轴刻度（真值范围整数） */
  ctx.font = '10.5px system-ui, sans-serif';
  ctx.fillStyle = '#5f7089'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const X = v => plotRect.x + (v - BELL_LO) / (BELL_HI - BELL_LO) * plotRect.w;
  for (let v = Math.ceil(BELL_LO); v <= Math.floor(BELL_HI); v += 2) {
    ctx.fillText(String(v).replace(/-/g, '−'), X(v), plotRect.y + plotRect.h + 6);
  }
  /* 读数与按钮 */
  const ro = $('s2-readout'), btn = $('s2-next');
  if (s2.stage === 'done') {
    ro.innerHTML = t('s2roDone', { k: SCEN_A.N - 1 });
    btn.disabled = true; btn.textContent = t('s2nextPred');
  } else if (s2.stage === 'update' && s2.pred) {
    ro.innerHTML = t('s2roPred', { k: s2.k, xp: fmt(s2.pred.xPred, 3), pp: fmt(s2.pred.PPred, 4), sp: fmt(Math.sqrt(s2.pred.PPred), 3) });
    btn.disabled = false; btn.textContent = t('s2nextUpd');
  } else if (s2.lastUpd) {
    const u = s2.lastUpd;
    ro.innerHTML = t('s2roUpd', {
      K: fmt(u.K, 4), res: fmt(u.res, 3), x: fmt(s2.x, 3), p: fmt(s2.P, 4),
      z: fmt(u.z, 3), kpct: Math.round(u.K * 100)
    });
    btn.disabled = false; btn.textContent = t('s2nextPred');
  } else {
    ro.innerHTML = t('s2roInit', { x0: fmt(SCEN_A.z[0], 3) });
    btn.disabled = false; btn.textContent = t('s2nextPred');
  }
  $('s2-play').textContent = s2.playing ? t('s2stop') : t('s2play');
  $('s2-play').disabled = s2.stage === 'done';
}
function s2HalfStep() {
  if (s2.stage === 'predict') {
    s2.pred = { prevX: s2.x, prevP: s2.P, xPred: s2.x, PPred: s2.P + SCEN_A.Q };
    s2.stage = 'update'; s2.lastUpd = null;
  } else if (s2.stage === 'update') {
    const s = stepKalman1d(s2.x, s2.P, SCEN_A.z[s2.k], SCEN_A.Q, SCEN_A.R);
    s2.lastUpd = { xPred: s.xPred, PPred: s.PPred, K: s.K, res: s.res, z: SCEN_A.z[s2.k] };
    s2.x = s.x; s2.P = s.P; s2.pred = null;
    s2.k++;
    s2.stage = s2.k > SCEN_A.N - 1 ? 'done' : 'predict';
  }
  drawS2();
}
$('s2-next').addEventListener('click', () => { s2.playing = false; s2HalfStep(); });
$('s2-play').addEventListener('click', () => {
  if (s2.playing) { s2.playing = false; drawS2(); return; }
  if (s2.stage === 'done') return;
  s2.playing = true; s2.playLeft = 20; s2.timer = 0; drawS2();
});
$('s2-reset').addEventListener('click', () => {
  s2.k = 1; s2.stage = 'predict'; s2.x = SCEN_A.z[0]; s2.P = SCEN_A.P0;
  s2.pred = null; s2.lastUpd = null; s2.playing = false; drawS2();
});
animate($('step2'), dt => {
  if (!s2.playing) return;
  s2.timer += dt;
  if (s2.timer >= 0.55) {
    s2.timer = 0;
    s2HalfStep();
    s2.playLeft--;
    if (s2.playLeft <= 0 || s2.stage === 'done') { s2.playing = false; drawS2(); }
  }
});
onRefit(drawS2);
onLangRefresh(drawS2);

/* ================================================================
   第 3 步：K 的拔河（场景 B 阶跃）
   Q / R 滑杆是对数刻度（0..1000 → 10 的幂区间），映射写明可复算。
   ================================================================ */
const qFromSlider = v => Math.pow(10, -4 + 4 * (v / 1000));
const qToSlider = Q => 1000 * (Math.log10(Q) + 4) / 4;
const rFromSlider = v => Math.pow(10, -1.30103 + 2.60206 * (v / 1000));
const rToSlider = R => 1000 * (Math.log10(R) + 1.30103) / 2.60206;
const s3 = { Q: 0.04, R: 1 };
const S3_PRESETS = {
  model: { Q: 0.001, R: 4 },
  balanced: { Q: 0.04, R: 1 },
  meas: { Q: 0.5, R: 0.25 }
};
function s3EntryText(es) {
  return t('s3roFmt', {
    entry: es.entry === null ? t('s3roNever') : String(es.entry),
    share: (es.share * 100).toFixed(1) + '%'
  });
}
function drawS3() {
  const { Q, R } = s3;
  const run = kalman1d(SCEN_B.z, Q, R, SCEN_B.z[0], 1);
  seriesPlot(ctxOf('s3-cv'), { x: 0, y: 0, w: $('s3-cv')._w, h: $('s3-cv')._h }, {
    n0: 0, n1: SCEN_B.N - 1,
    legend: [[t('lgTruth'), '#ffb454'], [t('lgMeas'), '#5b6b82'], [t('lgEst'), '#6ee7ff']],
    vlines: [{ k: SCEN_B.J }],
    series: [
      { data: SCEN_B.truth, color: '#ffb454', width: 2 },
      { data: SCEN_B.z, color: '#5b6b82', cross: true },
      { data: run.est, color: '#6ee7ff', width: 2.2 }
    ]
  });
  const st = steadyQR(Q, R);
  $('s3-k-num').textContent = fmt(st.K, 4);
  $('s3-q-val').textContent = fmtSmart(Q);
  $('s3-r-val').textContent = fmtSmart(R);
  const es = entryShare(run.est, SCEN_B.truth, SCEN_B.J, 0.5);
  $('s3-readout').innerHTML = t('s3ro', {
    entry: es.entry === null ? t('s3roNever') : String(es.entry),
    share: (es.share * 100).toFixed(1) + '%',
    rk: fmt(rmse(run.est, SCEN_B.truth), 3),
    rr: fmt(rmse(SCEN_B.z, SCEN_B.truth), 3)
  });
  /* 三张对照小图：各自固定参数真算 */
  [['model', 's3-m1'], ['balanced', 's3-m2'], ['meas', 's3-m3']].forEach(([name, cid]) => {
    const p = S3_PRESETS[name];
    const r2 = kalman1d(SCEN_B.z, p.Q, p.R, SCEN_B.z[0], 1);
    seriesPlot(ctxOf(cid), { x: 0, y: 0, w: $(cid)._w, h: $(cid)._h }, {
      n0: 0, n1: SCEN_B.N - 1,
      legend: [[t('lgTruth'), '#ffb454'], [t('lgEst'), '#6ee7ff']],
      vlines: [{ k: SCEN_B.J }],
      series: [
        { data: SCEN_B.truth, color: '#ffb454', width: 1.6 },
        { data: r2.est, color: '#6ee7ff', width: 1.8 }
      ]
    });
    const es2 = entryShare(r2.est, SCEN_B.truth, SCEN_B.J, 0.5);
    $(cid + '-ro').textContent = t('s3miniK', { K: fmt(steadyQR(p.Q, p.R).K, 4) }) + ' · ' +
      s3EntryText(es2) + ' · RMSE ' + fmt(rmse(r2.est, SCEN_B.truth), 3);
  });
}
function syncS3Sliders() {
  $('s3-q').value = String(Math.round(qToSlider(s3.Q)));
  $('s3-r').value = String(Math.round(rToSlider(s3.R)));
}
$('s3-q').addEventListener('input', e => { s3.Q = qFromSlider(parseInt(e.target.value, 10)); drawS3(); });
$('s3-r').addEventListener('input', e => { s3.R = rFromSlider(parseInt(e.target.value, 10)); drawS3(); });
document.querySelectorAll('#s3-presets button').forEach(b => b.addEventListener('click', () => {
  const p = S3_PRESETS[b.dataset.preset];
  s3.Q = p.Q; s3.R = p.R;
  syncS3Sliders(); drawS3();
}));
onRefit(drawS3);
onLangRefresh(drawS3);

/* ================================================================
   第 4 步：稳态（场景 C，Q = 0.04 ， R = 2）
   ================================================================ */
const ST_C = steadyQR(SCEN_C.Q, SCEN_C.R);
function drawS4() {
  const runA = kalman1d(SCEN_C.z, SCEN_C.Q, SCEN_C.R, SCEN_C.z[0], 10);
  const runB = kalman1d(SCEN_C.z, SCEN_C.Q, SCEN_C.R, SCEN_C.z[0], 0.01);
  const pssLine = new Array(SCEN_C.N).fill(ST_C.P);
  seriesPlot(ctxOf('s4-cvP'), { x: 0, y: 0, w: $('s4-cvP')._w, h: $('s4-cvP')._h }, {
    n0: 0, n1: SCEN_C.N - 1, logY: true,
    yLo: Math.log10(0.005), yHi: Math.log10(20), yTicks: [0.01, 0.1, 1, 10],
    legend: [[t('cvP10'), '#6ee7ff'], [t('cvP001'), '#ffb454'], [t('cvPss'), '#7ee2a8']],
    series: [
      { data: runA.P, color: '#6ee7ff', width: 2 },
      { data: runB.P, color: '#ffb454', width: 2 },
      { data: pssLine, color: '#7ee2a8', width: 1.4, dash: [6, 4] }
    ]
  });
  const pEnd1 = runA.P[SCEN_C.N - 1], pEnd2 = runB.P[SCEN_C.N - 1];
  $('s4-readout1').innerHTML = t('s4ro1', {
    pss: fmt(ST_C.P, 4), kss: fmt(ST_C.K, 4),
    p1: fmt(pEnd1, 4), p2: fmt(pEnd2, 4),
    dp: fmtSmart(Math.abs(pEnd1 - pEnd2)),
    res: fmtSmart(Math.abs(riccatiStep(ST_C.P, SCEN_C.Q, SCEN_C.R) - ST_C.P))
  });
  /* 等价演示：从第 K0 步同状态起跑的常增益平滑器 */
  const K0 = 250;
  const sm = new Array(SCEN_C.N).fill(null);
  sm[K0] = runA.est[K0];
  let md = 0;
  for (let k = K0 + 1; k < SCEN_C.N; k++) {
    sm[k] = sm[k - 1] + ST_C.K * (SCEN_C.z[k] - sm[k - 1]);
    md = Math.max(md, Math.abs(sm[k] - runA.est[k]));
  }
  seriesPlot(ctxOf('s4-cvEq'), { x: 0, y: 0, w: $('s4-cvEq')._w, h: $('s4-cvEq')._h }, {
    n0: 230, n1: SCEN_C.N - 1,
    legend: [[t('cvEqK'), '#6ee7ff'], [t('cvEqS'), '#7ee2a8']],
    series: [
      { data: runA.est, color: '#6ee7ff', width: 2 },
      { data: sm, color: '#7ee2a8', width: 1.6, dash: [5, 4] }
    ]
  });
  $('s4-readout2').innerHTML = t('s4ro2', { md: fmtSmart(md) });
}
onRefit(drawS4);
onLangRefresh(drawS4);

/* ================================================================
   第 5 步：二维追踪（场景 D）
   ================================================================ */
const s5 = { q: 0.02, man: true };
function matHTML(M, dec) {
  const cell = v => '<span>' + fmt(v, dec) + '</span>';
  return '<span class="mat">' + M.map(row => row.map(cell).join('')).join('') + '</span>';
}
function drawS5Matrix() {
  const Q = qMatrix(s5.q);
  $('s5-matrices').innerHTML =
    '<span class="mat-note">' + t('s5matNote') + '</span>' +
    '<span><span class="mname">F</span>' + matHTML(F2, 0) + '</span>' +
    '<span><span class="mname">H</span>' + matHTML([H2], 0) + '</span>' +
    '<span><span class="mname">Q</span>' + matHTML(Q, 4) + '</span>' +
    '<span><span class="mname">R</span> ' + fmt(SCEN_D.R, 2) + '</span>' +
    '<span class="mat-note">' + t('s5symNote') + '</span>';
}
function drawS5() {
  const D = s5.man ? SCEN_D : SCEN_D_OFF;
  $('s5-explain').innerHTML = t(s5.man ? 's5e' : 's5eOff');
  $('s5-hint').innerHTML = t(s5.man ? 's5hint' : 's5hintOff');
  document.querySelectorAll('#s5-man button').forEach(b => {
    b.classList.toggle('active', (b.dataset.man === 'on') === s5.man);
  });
  const run = kalman2d(D.z, s5.q, D.R);
  const shade = s5.man ? [{ k0: 60, k1: 110 }] : [];
  const lgPos = [[t('lgPosTrue'), '#ffb454'], [t('lgMeas'), '#5b6b82'], [t('lgPosEst'), '#6ee7ff']];
  if (s5.man) lgPos.push([t('cvMan'), 'rgba(255,180,84,0.4)']);
  seriesPlot(ctxOf('s5-pos'), { x: 0, y: 0, w: $('s5-pos')._w, h: $('s5-pos')._h }, {
    n0: 0, n1: D.N - 1, shade,
    legend: lgPos,
    series: [
      { data: D.pos, color: '#ffb454', width: 2 },
      { data: D.z, color: '#5b6b82', cross: true },
      { data: run.pos, color: '#6ee7ff', width: 2.2 }
    ]
  });
  seriesPlot(ctxOf('s5-vel'), { x: 0, y: 0, w: $('s5-vel')._w, h: $('s5-vel')._h }, {
    n0: 0, n1: D.N - 1, shade,
    legend: [[t('lgVelTrue'), '#ffb454'], [t('lgVelEst'), '#6ee7ff']],
    series: [
      { data: D.vel, color: '#ffb454', width: 2 },
      { data: run.vel, color: '#6ee7ff', width: 2.2 }
    ]
  });
  const Pend = run.P[D.N - 1];
  $('s5-q-val').textContent = fmtSmart(s5.q);
  if (s5.man) {
    let mx = 0;
    for (let k = 60; k <= 80; k++) mx = Math.max(mx, Math.abs(run.pos[k] - D.pos[k]));
    $('s5-readout').innerHTML = t('s5ro', {
      rp: fmt(rmse(run.pos, D.pos), 3), rv: fmt(rmse(run.vel, D.vel), 3),
      mx: fmt(mx, 3),
      p00: fmt(Pend[0][0], 3), p01: fmt(Pend[0][1], 3), p11: fmt(Pend[1][1], 3)
    });
  } else {
    $('s5-readout').innerHTML = t('s5roOff', {
      rp: fmt(rmse(run.pos, D.pos), 3), rv: fmt(rmse(run.vel, D.vel), 3),
      p00: fmt(Pend[0][0], 3), p01: fmt(Pend[0][1], 3), p11: fmt(Pend[1][1], 3)
    });
  }
  drawS5Matrix();
}
$('s5-q').addEventListener('input', e => { s5.q = qFromSlider(parseInt(e.target.value, 10)); drawS5(); });
document.querySelectorAll('#s5-man button').forEach(b => b.addEventListener('click', () => {
  s5.man = b.dataset.man === 'on';
  drawS5();
}));
document.querySelectorAll('#s5-presets button').forEach(b => b.addEventListener('click', () => {
  s5.q = parseFloat(b.dataset.q);
  $('s5-q').value = String(Math.round(qToSlider(s5.q)));
  drawS5();
}));
onRefit(drawS5);
onLangRefresh(drawS5);

/* ================================================================
   初始化：同步滑杆 → 全部先画一遍
   （i18n 的 DOMContentLoaded 会再触发一次 onLangRefresh 重绘）
   ================================================================ */
syncS3Sliders();
$('s5-q').value = String(Math.round(qToSlider(s5.q)));
drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); drawS5();

/* ================================================================
   window.KALMAN —— 评审对账接口
   ================================================================ */
window.KALMAN = {
  version: 1,
  mulberry32, makeGauss,
  genWalk, genStep, gen2D,
  kalman1d, stepKalman1d, steadyQR, riccatiStep, rmse, movingAvg, entryShare,
  kalman2d, qMatrix, F2, H2,
  scenarios: {
    A: { seed: 7, N: 90, sigW: 0.25, sigV: 1.0, jumpAt: 45, jump: 3, Q: 0.0625, R: 1, P0: 1, truth: SCEN_A.truth, z: SCEN_A.z },
    B: { seed: 1234, N: 120, sigW: 0.05, sigV: 1.0, J: 40, level: 4, truth: SCEN_B.truth, z: SCEN_B.z },
    C: { seed: 7, N: 300, sigW: 0.2, sigV: Math.SQRT2, Q: 0.04, R: 2, truth: SCEN_C.truth, z: SCEN_C.z },
    D: { seed: 99, N: 160, sigV: 1.2, R: 1.44, pos: SCEN_D.pos, vel: SCEN_D.vel, z: SCEN_D.z },
    Doff: { seed: 99, N: 160, sigV: 1.2, R: 1.44, pos: SCEN_D_OFF.pos, vel: SCEN_D_OFF.vel, z: SCEN_D_OFF.z }
  },
  getState() {
    return {
      s1W: s1.W,
      s2: { k: s2.k, stage: s2.stage, x: s2.x, P: s2.P },
      s3: { Q: s3.Q, R: s3.R, Kss: steadyQR(s3.Q, s3.R).K },
      s5q: s5.q,
      s5man: s5.man,
      lang: getLang()
    };
  }
};
