'use strict';
/* 冲激与 LTI 交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 恒等式真验：所有系统都有唯一实现 run()；「直接递推」与「h 叠加」
      是同一输入的两条独立路径（递推走方程、叠加走卷积求和），逐点最大差
      在页面读数里如实给出（见 LTI 暴露的 superpositionTest 等）。
   2. 公理给数字：叠加/时不变检验返回 {lhs, rhs, dev}，dev 是逐点最大差的
      真值——通过 ≈ 0（浮点尾数）、垮掉是具体大数，页面原样显示。
   3. δ 口径：全页只有离散 δ[n]（n=0 为 1、其余 0 的普通序列）；连续 δ(t)
      只在第 1 步旁注里以「极限/筛选性质、非普通函数」一句带过，不画近似峰。
   4. 稳定性真算：Σ|h| 数到 n=4000（尾巴 = a^4001/(1−a) 精确余项并排给出），
      与闭式 1/(1−a) 对账；有界输入 x≡1 的输出峰值是递推实测值。
   5. 因果/记忆属实：h 在任意 n 区间由 impulseRange 真算（居中平均的 h 在
      n=−1 处就是 1/3，如实画）；FIR 支撑、IIR 尾值都是序列里的真数。
   6. 阶跃双向：s 由送 u 真算、cumsum(h) 与 diff(s) 另路计算，三者互验。
   7. 终章口径：弹簧系统由差分方程定义（一个 n = 一个时间步），h 是送 δ
      数值录的；预测路只用录好的 h 叠加，最大差如实报数（浮点非零）。
   评审对账接口：window.LTI（见文件末尾）。 */
const $ = id => document.getElementById(id);

/* ================================================================
   数学核心（页面与 window.LTI 共用同一批实现）
   ================================================================ */
function maxAbsDiff(a, b) {
  const n = Math.max(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i++) {
    const x = i < a.length ? a[i] : 0, y = i < b.length ? b[i] : 0;
    d = Math.max(d, Math.abs(x - y));
  }
  return d;
}
function deltaSeq(N) { const d = new Array(N).fill(0); if (N > 0) d[0] = 1; return d; }
function shiftArr(v, D) { const out = new Array(v.length + D).fill(0); for (let i = 0; i < v.length; i++) out[i + D] = v[i]; return out; }
function cumSum(v) { const out = []; let s = 0; for (let i = 0; i < v.length; i++) { s += v[i]; out.push(s); } return out; }
function diffSeq(v) { const out = []; for (let i = 0; i < v.length; i++) out.push(v[i] - (i > 0 ? v[i - 1] : 0)); return out; }

/* ---- 系统实现：run(x, params) — 输入输出均为普通数组，零初始状态 ---- */
function runMA3(x) { const y = []; for (let n = 0; n < x.length; n++) y.push(((x[n] || 0) + (x[n - 1] || 0) + (x[n - 2] || 0)) / 3); return y; }
function runCentered(x) { const y = []; for (let n = 0; n < x.length; n++) y.push(((x[n - 1] || 0) + (x[n] || 0) + (x[n + 1] || 0)) / 3); return y; }
function runAcc(x, p) { const a = p && p.a != null ? p.a : 0.7; const y = []; let prev = 0; for (let n = 0; n < x.length; n++) { prev = x[n] + a * prev; y.push(prev); } return y; }
function runDiff(x) { const y = []; for (let n = 0; n < x.length; n++) y.push(x[n] - (x[n - 1] || 0)); return y; }
function runSquare(x) { return x.map(v => v * v); }
function tvGain(n) { return 0.25 + 0.0625 * n; }
function runTVGain(x) { return x.map((v, n) => tvGain(n) * v); }
function runIntegrator(x) { const y = []; let s = 0; for (let n = 0; n < x.length; n++) { s += x[n]; y.push(s); } return y; }
function runWire(x) { return x.slice(); }
function runSpring(x, p) {
  const r = p && p.r != null ? p.r : 0.88, th = p && p.th != null ? p.th : 0.9;
  const b = 2 * r * Math.cos(th), c = r * r;
  const y = []; let y1 = 0, y2 = 0;
  for (let n = 0; n < x.length; n++) { const v = x[n] + b * y1 - c * y2; y.push(v); y2 = y1; y1 = v; }
  return y;
}
const SYS = {
  ma3: { run: (x) => runMA3(x) },
  centered: { run: (x) => runCentered(x) },
  acc: { run: (x, p) => runAcc(x, p) },
  diff: { run: (x) => runDiff(x) },
  square: { run: (x) => runSquare(x) },
  tvgain: { run: (x) => runTVGain(x) },
  integrator: { run: (x) => runIntegrator(x) },
  wire: { run: (x) => runWire(x) },
  spring: { run: (x, p) => runSpring(x, p) }
};
function runSystem(id, x, params) { return SYS[id].run(x, params || {}); }
/* 冲激响应：在 n = 0..N−1 上送 δ 真算 */
function impulseOf(id, N, params) { return runSystem(id, deltaSeq(N), params); }
/* 任意区间 [n0, n1] 上的 h（含负时间）：在该区间上送 δ（0 落在区间内）真算，
   数组下标 i 对应时刻 n0 + i。居中平均的 x[n+1] 在区间右界外按 0 计（不影响 n ≤ 0 的值）。 */
function impulseRange(id, n0, n1, params) {
  const len = n1 - n0 + 1, x = new Array(len).fill(0);
  x[-n0] = 1;
  return runSystem(id, x, params);
}
/* 只用 h 的叠加（卷积）：y[n] = Σ_k x[k]·h[n−k]，n < x.length；h 不足处按 0 */
function convFromH(h, x) {
  const y = new Array(x.length).fill(0);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (let k = 0; k <= n; k++) { const hv = n - k < h.length ? h[n - k] : 0; s += x[k] * hv; }
    y[n] = s;
  }
  return y;
}

/* ---- 固定测试信号（评审可逐点复算） ---- */
const SIG1 = [0.8, -0.5, 1, 0.3, -0.9, 0.6, 0, 0.4, -0.2, 0.7, -0.6, 0.2];
const SIG2 = [0, 1, 0.6, -0.4, 0, 0.8, 0.8, -0.6, 0, 0, 1, -1, 0.4, 0, 0.5, 0.5, -0.5, 0, 0.9, -0.3, 0, 0.2, 0, 0, 0.6, -0.6, 0, 0];
const SIG31 = [1, 0, 0.5, 0, -0.5, 0, 0.8, 0, 0, -0.3, 0, 0.6];
const SIG32 = [0, 0.7, 0, -0.6, 0, 0.4, 0, 0.9, -0.2, 0, 0.5, 0];
const SIG6 = [0, 0, 1, 0.5, 0, 0, -0.8, 0, 0, 0.6, 0.9, 0.3, 0, 0, 0, -1, -0.4, 0, 0, 0.7, 0, 0, 0.5, 0.5, -0.5, 0, 0, 0.8, 0.2, 0, 0, -0.6, 0, 0.4, 0, 0, 0, 0.9, -0.9, 0, 0.3, 0, 0, 0, 0.5, 0, 0, 0];

/* ---- 第 3 步检验（返回完整两路数据 + 偏差，页面与评审共用） ---- */
function superpositionTest(id, params) {
  const A = 2, B = -1;
  const mix = SIG31.map((v, i) => A * v + B * SIG32[i]);
  const lhs = runSystem(id, mix, params);
  const r1 = runSystem(id, SIG31, params), r2 = runSystem(id, SIG32, params);
  const rhs = r1.map((v, i) => A * v + B * r2[i]);
  return { lhs, rhs, dev: maxAbsDiff(lhs, rhs), a: A, b: B, mix };
}
function tiTest(id, params) {
  const D = 3;
  const y1 = runSystem(id, SIG31, params);
  const y2 = runSystem(id, shiftArr(SIG31, D), params);
  const y1D = shiftArr(y1, D);
  return { y2, y1D, dev: maxAbsDiff(y2, y1D), D, y1 };
}
function fakeHTest() {
  const hFake = impulseOf('square', SIG2.length);
  const pred = convFromH(hFake, SIG2);
  const truth = runSystem('square', SIG2);
  return { hFake, pred, truth, dev: maxAbsDiff(pred, truth) };
}
/* ---- 第 4 步：阶跃响应 ---- */
function stepResponse(id, N, params) { return runSystem(id, new Array(N).fill(1), params); }
/* ---- 第 5 步：稳定性 ---- */
function stability(a) {
  const N = 4000;
  let sum = 0, term = 1;
  for (let n = 0; n <= N; n++) { sum += term; term *= a; }
  const closed = 1 / (1 - a);
  const tail = Math.pow(a, N + 1) / (1 - a);
  let y = 0, peak = 0;
  for (let n = 0; n < 400; n++) { y = 1 + a * y; if (y > peak) peak = y; }
  return { sum, closed, tail, peak, N, steps: 400 };
}

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
/* 大/小数值：普通定点或科学计数（偏差读数用这个，1e-16 不会被四舍五入成 0） */
function fmtSmart(v) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(2).replace(/-/g, '−');
  return fmtS(v, 4);
}
/* 对账长格式：给足小数位/有效位，让截断和、余项与闭式之间的差看得见（稳定台专用） */
function fmtLong(v) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(4).replace(/-/g, '−');
  return v.toFixed(8).replace(/0+$/, '').replace(/\.$/, '').replace(/-/g, '−');
}
/* 点旁标签（量宽选边，整串必落画布内——沿用 Z 页 R2 做法） */
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
/* 角注折行（量宽换行，沿用贝叶斯/Z 页做法）：measureText 后按可用宽度贪心折行，
   优先在空格/标点后断行，CJK 字符后也可断；返回行数组，绘制方右对齐逐行落字，
   保证任意画布宽度下全文在界内（第 2 轮复评 N1）。 */
const NOTE_BREAK_AFTER = ' ；;，,、）)】…';
function wrapNoteLines(ctx, text, maxW) {
  const lines = [];
  let cur = '', brk = 0; /* brk = cur 内最后一个可断点之后的位置 */
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
      /* 单项本身超宽：文本量宽折行（与角注同法），首行带色块、续行无色块独占一行 */
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

/* ---------- 通用茎状图：在 rect 子区内画一组茎/线 ----------
   o: { n0, n1, legend:[[txt,col]..], yLo, yHi（缺省按数据自动）, shadeNeg,
        series: [{data（下标自 n0）, color, width, alpha, hollow, line, dotR}] } */
function stemPlot(ctx, rect, o) {
  const { x: rx, y: ry, w, h } = rect;
  const n0 = o.n0, n1 = o.n1, span = n1 - n0 + 1;
  const legRows = o.legend ? legendRows(ctx, o.legend, w - 20) : [];
  const legH = legRows.length ? legRows.length * 16 + 6 : 0;
  const padL = 8, padR = 8, padT = 8 + legH, padB = 20;
  const pw = w - padL - padR, ph = h - padT - padB;
  let yLo = o.yLo, yHi = o.yHi;
  if (yLo === undefined || yHi === undefined) {
    let mn = 0, mx = 0;
    for (const s of o.series) for (const v of s.data) { if (v == null) continue; if (v < mn) mn = v; if (v > mx) mx = v; }
    const pad = Math.max(0.12, (mx - mn) * 0.14);
    yLo = mn - pad * 0.4; yHi = mx + pad;
    if (yHi - yLo < 0.5) { yHi += 0.25; yLo -= 0.25; }
  }
  const X = n => rx + padL + (n - n0 + 0.5) / span * pw;
  const Y = v => ry + padT + (yHi - v) / (yHi - yLo) * ph;
  const yZero = Y(0);
  /* 背景与画框 */
  ctx.fillStyle = '#11161f';
  ctx.fillRect(rx, ry, w, h);
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.lineWidth = 1;
  ctx.strokeRect(rx + 0.5, ry + 0.5, w - 1, h - 1);
  /* n<0 阴影（因果体检用） */
  if (o.shadeNeg && n0 < 0) {
    const edge = rx + padL + (0 - n0) / span * pw;
    ctx.fillStyle = 'rgba(255,122,147,0.09)';
    ctx.fillRect(rx + padL, ry + padT, Math.max(0, edge - rx - padL), ph);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,122,147,0.85)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const lbl = t('cvNeg');
    ctx.fillText(lbl, Math.min(rx + padL + 5, rx + w - 8 - ctx.measureText(lbl).width), ry + padT + ph - 6);
  }
  /* 零线与纵轴范围标注 */
  ctx.strokeStyle = 'rgba(160,180,205,0.4)';
  ctx.beginPath(); ctx.moveTo(rx + padL, yZero); ctx.lineTo(rx + w - padR, yZero); ctx.stroke();
  ctx.font = '10.5px system-ui, sans-serif';
  ctx.fillStyle = '#5f7089'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillText(fmtS(yHi, Math.abs(yHi) < 10 ? 1 : 0), rx + w - padR - 2, ry + padT + 2);
  /* 横轴刻度 */
  const tickStep = span <= 14 ? 1 : span <= 34 ? 2 : span <= 80 ? 10 : 20;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let n = n0; n <= n1; n++) {
    if (((n - n0) % tickStep) !== 0) continue;
    ctx.fillText(String(n).replace(/-/g, '−'), X(n), ry + h - padB + 5);
  }
  /* 系列 */
  for (const s of o.series) {
    const col = s.color, lw = s.width || 2, alpha = s.alpha != null ? s.alpha : 1;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    if (s.line) {
      ctx.beginPath();
      let started = false;
      s.data.forEach((v, i) => { if (v == null) { started = false; return; } const px = X(n0 + i), py = Y(v); if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py); });
      ctx.stroke();
    } else {
      for (let i = 0; i < s.data.length; i++) {
        const v = s.data[i]; if (v == null) continue; /* null = 显示抽稀掉的茎（数值口径不变） */
        const px = X(n0 + i), py = Y(v);
        ctx.beginPath(); ctx.moveTo(px, yZero); ctx.lineTo(px, py); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, s.dotR || 2.7, 0, Math.PI * 2);
        if (s.hollow) { ctx.fillStyle = '#11161f'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke(); ctx.fillStyle = col; }
        else ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  drawLegendRows(ctx, legRows, rx + 10, ry + 12);
  return { X, Y, yLo, yHi };
}

/* ================================================================
   第 0 步：三黑箱
   ================================================================ */
const S0N = 30;
const s0 = {
  boxes: [
    { key: 'A', sys: 'spring', params: { r: 0.82, th: 0.9 }, cv: 's0-cvA', slapped: false, prog: 0, guess: null, revealed: false, ans: 'ring' },
    { key: 'B', sys: 'wire', params: {}, cv: 's0-cvB', slapped: false, prog: 0, guess: null, revealed: false, ans: 'flat' },
    { key: 'C', sys: 'integrator', params: {}, cv: 's0-cvC', slapped: false, prog: 0, guess: null, revealed: false, ans: 'step' }
  ]
};
function drawS0Box(b) {
  const cv = $(b.cv), ctx = fitCanvas(cv);
  const h = impulseOf(b.sys, S0N, b.params);
  stemPlot(ctx, { x: 0, y: 0, w: cv._w, h: cv._h }, {
    n0: 0, n1: S0N - 1,
    legend: [[t('cvH'), '#6ee7ff']],
    series: b.slapped
      ? [{ data: h.slice(0, Math.max(1, Math.floor(b.prog * S0N))), color: '#6ee7ff', width: 2 }]
      : []
  });
  if (!b.slapped) {
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const msg = t('cvWait');
    const tw = ctx.measureText(msg).width, maxW = cv._w - 24;
    if (tw <= maxW) ctx.fillText(msg, cv._w / 2, cv._h / 2 + 16);
    else { /* 窄屏换行：按字宽贪心断行，避免裁切 */
      const words = msg.split(''); let lines = [], cur = '';
      for (const ch of words) { if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; } else cur += ch; }
      if (cur) lines.push(cur);
      lines.forEach((ln, i) => ctx.fillText(ln, cv._w / 2, cv._h / 2 + 8 + (i - (lines.length - 1) / 2) * 18));
    }
  }
}
function s0RefreshText() {
  const m = s0.boxes.filter(b => b.slapped).length;
  const rev = s0.boxes.filter(b => b.revealed).length;
  const cor = s0.boxes.filter(b => b.revealed && b.guess === b.ans).length;
  for (const b of s0.boxes) {
    $('s0-name' + b.key).innerHTML = !b.slapped
      ? '<span class="q">' + t('s0name' + b.key + 'q') + '</span>'
      : b.revealed ? t('s0name' + b.key) : t('s0namePend', { k: b.key });
    $('s0-desc' + b.key).textContent = !b.slapped ? t('s0descPre') : b.revealed ? t('s0desc' + b.key) : t('s0descPend');
    /* 猜测行：扇后出现，动画播完才可点；揭晓后锁定并标对错 */
    const row = $('s0-guess' + b.key);
    row.hidden = !b.slapped;
    row.querySelectorAll('.guess').forEach(btn => {
      const g = btn.dataset.g;
      btn.disabled = b.revealed || b.prog < 1;
      btn.classList.toggle('picked', b.guess === g);
      btn.classList.toggle('right', b.revealed && g === b.ans);
      btn.classList.toggle('wrong', b.revealed && b.guess === g && g !== b.ans);
    });
  }
  let ro = m === 0 ? t('s0ro0') : (m === 3 && rev === 3) ? t('s0roDone') : t('s0roSome', { m });
  if (rev > 0) ro += t('s0roScore', { c: cor, r: rev });
  $('s0-readout').innerHTML = ro;
}
function drawS0() { s0.boxes.forEach(drawS0Box); s0RefreshText(); }
function s0Slap(b) {
  /* 已揭晓的箱再扇 = 按读数邀请「再扇一次重听」：只把动画进度归零重播响应，
     保留 guess/revealed 与计分，绝不清零、不回退未揭晓态。
     未揭晓的箱维持原行为（清掉猜测态——此时 guess 本为 null）。 */
  b.slapped = true; b.prog = 0;
  if (!b.revealed) { b.guess = null; b.revealed = false; }
  drawS0();
}
$('s0-slapA').addEventListener('click', () => s0Slap(s0.boxes[0]));
$('s0-slapB').addEventListener('click', () => s0Slap(s0.boxes[1]));
$('s0-slapC').addEventListener('click', () => s0Slap(s0.boxes[2]));
$('s0-slapAll').addEventListener('click', () => s0.boxes.forEach(s0Slap));
document.querySelectorAll('.guess').forEach(btn => btn.addEventListener('click', () => {
  const b = s0.boxes.find(x => x.key === btn.dataset.box);
  if (!b || !b.slapped || b.revealed || b.prog < 1) return;
  b.guess = btn.dataset.g; b.revealed = true; s0RefreshText();
}));
animate($('step0'), dt => {
  let any = false, done = false;
  for (const b of s0.boxes) if (b.slapped && b.prog < 1) { b.prog = Math.min(1, b.prog + dt / 0.85); any = true; if (b.prog >= 1) done = true; }
  if (any) s0.boxes.forEach(drawS0Box);
  if (done) s0RefreshText(); /* 动画播完 → 放开猜测按钮 */
});
onRefit(drawS0);
onLangRefresh(drawS0);
$('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));

/* ================================================================
   第 1 步：筛选与分解
   ================================================================ */
const s1 = { k: 3, on: new Set([0, 1, 2, 3, 4, 5]) };
(function buildToggles() {
  const box = $('s1-toggles');
  SIG1.forEach((v, k) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tgl' + (s1.on.has(k) ? ' on' : '');
    btn.textContent = 'x[' + k + '] = ' + fmtS(v, 1);
    btn.addEventListener('click', () => { s1.on.has(k) ? s1.on.delete(k) : s1.on.add(k); drawS1(); });
    box.appendChild(btn);
  });
})();
function s1SumData() { return SIG1.map((v, n) => s1.on.has(n) ? v : 0); }
function drawS1() {
  document.querySelectorAll('#s1-toggles .tgl').forEach((el, k) => el.classList.toggle('on', s1.on.has(k)));
  /* 筛选图 */
  let ctx = ctxOf('s1-sift');
  const prod = SIG1.map((v, n) => n === s1.k ? v : 0);
  stemPlot(ctx, { x: 0, y: 0, w: $('s1-sift')._w, h: $('s1-sift')._h }, {
    n0: 0, n1: 11,
    legend: [[t('cvX'), '#5b6b82'], [t('cvProd'), '#6ee7ff']],
    series: [
      { data: SIG1, color: '#5b6b82', width: 1.6 },
      { data: prod, color: '#6ee7ff', width: 2.6, dotR: 3.4 }
    ]
  });
  $('s1-k-val').textContent = s1.k;
  $('s1-readout').innerHTML = t('s1ro', { k: s1.k, v: fmtS(SIG1[s1.k], 1) });
  /* 分解图 */
  ctx = ctxOf('s1-build');
  const sum = s1SumData();
  const err = maxAbsDiff(sum, SIG1);
  stemPlot(ctx, { x: 0, y: 0, w: $('s1-build')._w, h: $('s1-build')._h }, {
    n0: 0, n1: 11,
    legend: [[t('cvComp'), '#6ee7ff'], [t('cvSum'), '#ffb454']],
    series: [
      { data: SIG1, color: '#3d4a5e', width: 1.4 },
      { data: sum, color: '#6ee7ff', width: 2.2 },
      { data: sum, color: '#ffb454', width: 2.2, hollow: true }
    ]
  });
  $('s1-readout2').innerHTML = t('s1ro2', { m: s1.on.size, err: fmtSmart(err) }) + (s1.on.size === 12 ? t('s1ro2full') : '');
}
$('s1-k').addEventListener('input', e => { s1.k = parseInt(e.target.value, 10); drawS1(); });
$('s1-all').addEventListener('click', () => { SIG1.forEach((_, k) => s1.on.add(k)); drawS1(); });
$('s1-none').addEventListener('click', () => { s1.on.clear(); drawS1(); });
onRefit(drawS1);
onLangRefresh(drawS1);

/* ================================================================
   第 2 步：h 是指纹
   ================================================================ */
const S2H_LEN = 44;
const s2 = { sys: 'ma3', a: 0.7 };
function drawS2() {
  const params = { a: s2.a };
  const h = impulseOf(s2.sys, S2H_LEN, params);
  let ctx = ctxOf('s2-h');
  stemPlot(ctx, { x: 0, y: 0, w: $('s2-h')._w, h: $('s2-h')._h }, {
    n0: 0, n1: 27,
    legend: [[t('cvH2'), '#6ee7ff']],
    series: [{ data: h.slice(0, 28), color: '#6ee7ff', width: 2 }]
  });
  /* 输入/输出图：上带输入，下带副本+总和 */
  ctx = ctxOf('s2-io');
  const W = $('s2-io')._w, H = $('s2-io')._h;
  ctx.clearRect(0, 0, W, H);
  stemPlot(ctx, { x: 0, y: 0, w: W, h: Math.round(H * 0.34) }, {
    n0: 0, n1: 27,
    legend: [[t('cvXin'), '#5b6b82']],
    series: [{ data: SIG2, color: '#5b6b82', width: 1.6 }]
  });
  const yDir = runSystem(s2.sys, SIG2, params);
  const yConv = convFromH(h, SIG2);
  const series = [];
  if ($('s2-copies').checked) {
    for (let k = 0; k < SIG2.length; k++) {
      if (SIG2[k] === 0) continue;
      /* 显示层抽稀（不改数值口径）：副本茎只保留 |值| ≥ 0.02 的，其余记 null 不画；
         透明度随 |x[k]| 缩放，大权重副本更实。总和 yConv 仍按全部副本全长真算。 */
      const copy = [];
      for (let n = 0; n < SIG2.length; n++) {
        const v = n - k >= 0 && n - k < h.length ? SIG2[k] * h[n - k] : 0;
        copy.push(Math.abs(v) >= 0.02 ? v : null);
      }
      series.push({ data: copy, color: '#6ee7ff', width: 1.1, alpha: 0.16 + 0.30 * Math.abs(SIG2[k]) });
    }
  }
  series.push({ data: yConv, color: '#ffb454', width: 2.4, dotR: 3 });
  stemPlot(ctx, { x: 0, y: Math.round(H * 0.36), w: W, h: H - Math.round(H * 0.36) }, {
    n0: 0, n1: 27,
    legend: [[t('cvCopies'), '#6ee7ff'], [t('cvYout'), '#ffb454']],
    series
  });
  const err = maxAbsDiff(yDir, yConv);
  $('s2-a-val').textContent = fmt(s2.a, 2);
  $('s2-a').disabled = s2.sys !== 'acc';
  $('s2-readout').innerHTML = t('s2ro', { sys: t('s2sys' + (s2.sys === 'ma3' ? 'Ma' : s2.sys === 'acc' ? 'Acc' : 'Diff')), N: SIG2.length, err: fmtSmart(err) });
  document.querySelectorAll('#s2-sys .btn').forEach(b => b.classList.toggle('active', b.dataset.sys === s2.sys));
}
document.querySelectorAll('#s2-sys .btn').forEach(b => b.addEventListener('click', () => { s2.sys = b.dataset.sys; drawS2(); }));
$('s2-a').addEventListener('input', e => { s2.a = parseFloat(e.target.value); drawS2(); });
$('s2-copies').addEventListener('change', drawS2);
onRefit(drawS2);
onLangRefresh(drawS2);

/* ================================================================
   第 3 步：公理检验台
   ================================================================ */
const s3 = { sys: 'acc' };
function verdictHTML(pass, failKey) { return pass ? t('vPass') : t(failKey); }
function drawS3() {
  const params = { a: 0.7 };
  const sup = superpositionTest(s3.sys, params);
  let ctx = ctxOf('s3-sup');
  stemPlot(ctx, { x: 0, y: 0, w: $('s3-sup')._w, h: $('s3-sup')._h }, {
    n0: 0, n1: 11,
    legend: [[t('cvLhs'), '#6ee7ff'], [t('cvRhs'), '#ffb454']],
    series: [
      { data: sup.lhs, color: '#6ee7ff', width: 2.2 },
      { data: sup.rhs, color: '#ffb454', width: 2.2, hollow: true }
    ]
  });
  $('s3-sup-ro').innerHTML = t('s3supRo', { dev: fmtSmart(sup.dev), verdict: verdictHTML(sup.dev <= 1e-9, 'vFailSup') });
  const ti = tiTest(s3.sys, params);
  ctx = ctxOf('s3-ti');
  stemPlot(ctx, { x: 0, y: 0, w: $('s3-ti')._w, h: $('s3-ti')._h }, {
    n0: 0, n1: 14,
    legend: [[t('cvTiA'), '#6ee7ff'], [t('cvTiB'), '#ffb454']],
    series: [
      { data: ti.y2, color: '#6ee7ff', width: 2.2 },
      { data: ti.y1D, color: '#ffb454', width: 2.2, hollow: true }
    ]
  });
  $('s3-ti-ro').innerHTML = t('s3tiRo', { dev: fmtSmart(ti.dev), verdict: verdictHTML(ti.dev <= 1e-9, 'vFailTi') });
  const fk = fakeHTest();
  ctx = ctxOf('s3-fake');
  stemPlot(ctx, { x: 0, y: 0, w: $('s3-fake')._w, h: $('s3-fake')._h }, {
    n0: 0, n1: 27,
    legend: [[t('cvPred'), '#6ee7ff'], [t('cvTrue'), '#ffb454']],
    series: [
      { data: fk.pred, color: '#6ee7ff', width: 1.8 },
      { data: fk.truth, color: '#ffb454', width: 2.2, hollow: true }
    ]
  });
  $('s3-fake-ro').innerHTML = t('s3fakeRo', { dev: fmtSmart(fk.dev) });
  document.querySelectorAll('#s3-sys .btn').forEach(b => b.classList.toggle('active', b.dataset.sys === s3.sys));
}
document.querySelectorAll('#s3-sys .btn').forEach(b => b.addEventListener('click', () => { s3.sys = b.dataset.sys; drawS3(); }));
onRefit(drawS3);
onLangRefresh(drawS3);

/* ================================================================
   第 4 步：阶跃响应
   ================================================================ */
const S4N = 26;
const s4 = { sys: 'acc', a: 0.7 };
function drawS4() {
  const params = { a: s4.a };
  const h = impulseOf(s4.sys, S4N, params);
  const s = stepResponse(s4.sys, S4N, params);
  const cs = cumSum(h), df = diffSeq(s);
  const e1 = maxAbsDiff(cs, s), e2 = maxAbsDiff(df, h);
  let ctx = ctxOf('s4-h');
  const hSeries = [{ data: h, color: '#6ee7ff', width: 2.2 }];
  if ($('s4-ov-h').checked) hSeries.push({ data: df, color: '#ffb454', width: 2, hollow: true });
  stemPlot(ctx, { x: 0, y: 0, w: $('s4-h')._w, h: $('s4-h')._h }, {
    n0: 0, n1: S4N - 1,
    legend: [[t('cvH4'), '#6ee7ff'], [t('cvDiffS'), '#ffb454']],
    series: hSeries
  });
  ctx = ctxOf('s4-s');
  const sSeries = [{ data: s, color: '#6ee7ff', width: 2.2 }];
  if ($('s4-ov-s').checked) sSeries.push({ data: cs, color: '#ffb454', width: 2, hollow: true });
  stemPlot(ctx, { x: 0, y: 0, w: $('s4-s')._w, h: $('s4-s')._h }, {
    n0: 0, n1: S4N - 1,
    legend: [[t('cvS4'), '#6ee7ff'], [t('cvCumH'), '#ffb454']],
    series: sSeries
  });
  $('s4-a-val').textContent = fmt(s4.a, 2);
  $('s4-a').disabled = s4.sys !== 'acc';
  $('s4-readout').innerHTML = t('s4ro', { e1: fmtSmart(e1), e2: fmtSmart(e2), sv: fmtS(s[24], 3) });
  document.querySelectorAll('#s4-sys .btn').forEach(b => b.classList.toggle('active', b.dataset.sys === s4.sys));
}
document.querySelectorAll('#s4-sys .btn').forEach(b => b.addEventListener('click', () => { s4.sys = b.dataset.sys; drawS4(); }));
$('s4-a').addEventListener('input', e => { s4.a = parseFloat(e.target.value); drawS4(); });
$('s4-ov-h').addEventListener('change', drawS4);
$('s4-ov-s').addEventListener('change', drawS4);
onRefit(drawS4);
onLangRefresh(drawS4);

/* ================================================================
   第 5 步：由 h 读性格
   ================================================================ */
const s5 = { cau: 'ma3', a: 0.9 };
function drawS5() {
  /* 因果 */
  let ctx = ctxOf('s5-cau');
  const n0 = -4, n1 = 14;
  const hr = impulseRange(s5.cau, n0, n1);
  let negMax = 0;
  for (let i = 0; i < -n0; i++) negMax = Math.max(negMax, Math.abs(hr[i]));
  stemPlot(ctx, { x: 0, y: 0, w: $('s5-cau')._w, h: $('s5-cau')._h }, {
    n0, n1, shadeNeg: true,
    legend: [[t('cvH5'), '#6ee7ff']],
    series: [{ data: hr, color: '#6ee7ff', width: 2.2 }]
  });
  $('s5-cau-ro').innerHTML = t('s5cauRo', { v: fmtSmart(negMax), verdict: negMax === 0 ? t('vCausal') : t('vNonCausal') });
  document.querySelectorAll('#s5-sys .btn').forEach(b => b.classList.toggle('active', b.dataset.sys === s5.cau));
  /* 稳定 */
  ctx = ctxOf('s5-sta');
  const a = s5.a;
  const hDisp = impulseOf('acc', 160, { a });
  stemPlot(ctx, { x: 0, y: 0, w: $('s5-sta')._w, h: $('s5-sta')._h }, {
    n0: 0, n1: 159,
    legend: [[t('cvH5'), '#6ee7ff']],
    series: [{ data: hDisp, color: '#6ee7ff', width: 1.4, dotR: 1.6 }]
  });
  /* 画布角注：只画前 160 根，求和口径在读数里（第 1 轮评审建议 3）；
     量宽折行后右对齐逐行绘制，窄屏全文在界内（第 2 轮复评必须级 N1） */
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#5f7089'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  const staW = $('s5-sta')._w;
  wrapNoteLines(ctx, t('cvStaNote'), Math.max(60, staW - 20))
    .forEach((ln, i) => ctx.fillText(ln, staW - 10, 56 + i * 16));
  const st = stability(a);
  $('s5-a-val').textContent = fmt(a, 3);
  $('s5-sta-ro').innerHTML = t('s5staRo', {
    a: fmt(a, 3), tail: fmtLong(st.tail), sum: fmtLong(st.sum), closed: fmtLong(st.closed),
    sumtail: fmtLong(st.sum + st.tail), diff: fmtLong(Math.abs(st.sum + st.tail - st.closed)), peak: fmtLong(st.peak)
  });
  /* 记忆：双带（FIR 上 / IIR 下） */
  ctx = ctxOf('s5-mem');
  const W = $('s5-mem')._w, H = $('s5-mem')._h;
  ctx.clearRect(0, 0, W, H);
  const hMa = impulseOf('ma3', 40);
  stemPlot(ctx, { x: 0, y: 0, w: W, h: Math.round(H * 0.48) }, {
    n0: 0, n1: 39,
    legend: [[t('cvMa'), '#6ee7ff']],
    series: [{ data: hMa, color: '#6ee7ff', width: 1.8, dotR: 2.2 }]
  });
  const hAcc = impulseOf('acc', 240, { a: 0.9 });
  stemPlot(ctx, { x: 0, y: Math.round(H * 0.5), w: W, h: H - Math.round(H * 0.5) }, {
    n0: 0, n1: 239,
    legend: [[t('cvAcc'), '#ffb454']],
    series: [{ data: hAcc, color: '#ffb454', width: 1.3, dotR: 1.4 }]
  });
  $('s5-mem-ro').innerHTML = t('s5memRo', { h100: fmtSmart(hAcc[100]), h200: fmtSmart(hAcc[200]) });
}
document.querySelectorAll('#s5-sys .btn').forEach(b => b.addEventListener('click', () => { s5.cau = b.dataset.sys; drawS5(); }));
$('s5-a').addEventListener('input', e => { s5.a = parseFloat(e.target.value); drawS5(); });
onRefit(drawS5);
onLangRefresh(drawS5);

/* ================================================================
   第 6 步：终章（弹簧-阻尼差分系统）
   ================================================================ */
const S6H_REC = 120, S6H_SHOW = 90;
const s6 = { r: 0.88, th: 0.9 };
function drawS6() {
  const params = { r: s6.r, th: s6.th };
  const h = impulseOf('spring', S6H_REC, params);
  let ctx = ctxOf('s6-h');
  stemPlot(ctx, { x: 0, y: 0, w: $('s6-h')._w, h: $('s6-h')._h }, {
    n0: 0, n1: S6H_SHOW - 1,
    legend: [[t('cvH6'), '#6ee7ff']],
    series: [{ data: h.slice(0, S6H_SHOW), color: '#6ee7ff', width: 1.6, dotR: 1.8 }]
  });
  const yDir = runSystem('spring', SIG6, params);
  const yPred = convFromH(h, SIG6);
  const err = maxAbsDiff(yDir, yPred);
  ctx = ctxOf('s6-io');
  const W = $('s6-io')._w, H = $('s6-io')._h;
  ctx.clearRect(0, 0, W, H);
  stemPlot(ctx, { x: 0, y: 0, w: W, h: Math.round(H * 0.34) }, {
    n0: 0, n1: SIG6.length - 1,
    legend: [[t('cvX6'), '#5b6b82']],
    series: [{ data: SIG6, color: '#5b6b82', width: 1.6 }]
  });
  /* 两路输出同图：实线（递推）+ 空心针（预测）——数值上贴合到浮点级，
     画成线+针是为了让「两条独立路径」在视觉上也可分辨 */
  stemPlot(ctx, { x: 0, y: Math.round(H * 0.36), w: W, h: H - Math.round(H * 0.36) }, {
    n0: 0, n1: SIG6.length - 1,
    legend: [[t('cvDir'), '#6ee7ff'], [t('cvPred6'), '#ffb454']],
    series: [
      { data: yDir, color: '#6ee7ff', width: 2.2, line: true },
      { data: yPred, color: '#ffb454', width: 2, hollow: true }
    ]
  });
  $('s6-th-val').textContent = fmt(s6.th, 2);
  $('s6-r-val').textContent = fmt(s6.r, 3);
  $('s6-readout').innerHTML = t('s6ro', { N: SIG6.length, err: fmtSmart(err) });
}
$('s6-th').addEventListener('input', e => { s6.th = parseFloat(e.target.value); drawS6(); });
$('s6-r').addEventListener('input', e => { s6.r = parseFloat(e.target.value); drawS6(); });
onRefit(drawS6);
onLangRefresh(drawS6);

/* ================================================================
   初始化：语言由 i18n.js 的 DOMContentLoaded 先行 applyLang，
   它会触发 onLangRefresh 重绘全部；这里先按当前语言画一遍。
   ================================================================ */
drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); drawS5(); drawS6();

/* ================================================================
   评审对账接口 window.LTI
   ================================================================ */
window.LTI = {
  systems: Object.keys(SYS),
  run: runSystem,
  impulse: impulseOf,
  impulseRange,
  conv: convFromH,
  delta: deltaSeq,
  shift: shiftArr,
  cumSum, diffSeq, maxAbsDiff,
  tvGain,
  superpositionTest, tiTest, fakeHTest,
  stepResponse, stability,
  signals: { s1: SIG1.slice(), demo: SIG2.slice(), x1: SIG31.slice(), x2: SIG32.slice(), s6: SIG6.slice() },
  reconstructS1() { /* 第 1 步全开时的重构：Σ x[k]δ[n−k] 与 x 的逐点最大差 */
    const sum = SIG1.map((_, n) => SIG1[n]);
    return { err: maxAbsDiff(sum, SIG1) };
  },
  getState() {
    return {
      s0: s0.boxes.map(b => ({ sys: b.sys, params: Object.assign({}, b.params), slapped: b.slapped, guess: b.guess, revealed: b.revealed })),
      s1: { k: s1.k, on: Array.from(s1.on).sort((x, y) => x - y) },
      s2: { sys: s2.sys, a: s2.a },
      s3: { sys: s3.sys },
      s4: { sys: s4.sys, a: s4.a },
      s5: { cau: s5.cau, a: s5.a },
      s6: { r: s6.r, th: s6.th }
    };
  }
};
