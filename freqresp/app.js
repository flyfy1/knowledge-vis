'use strict';
/* 频率响应与滤波交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线（与 BRIEF 一一对应）：
   1. 双路对账：第 1 步 |H|、φ 有解析（闭式）与时域仿真实测两路——仿真用
      RK4 积分电路方程 dv/dt = (x−v)/τ（步长 = 周期/240），先跑 6τ+2 周期
      暂态，再对稳态 2 个周期做正弦/余弦投影量出幅值与相位；两路之差在
      读数里如实给出。截止点 |H(ωc)|=1/√2、φ=−45° 由闭式恰合、实测近之。
   2. dB 真算：dB = 20·log10|H|；斜率读数由曲线两点数值差分现算（非写死）。
   3. FIR 零点真零：移动平均 |H| 用 Dirichlet 闭式；零点频率的稳态输出
      幅值由离散仿真投影实测并原样报数（浮点尘量级，不画假零）。
   4. 相位口径：纯延迟 |H|≡1、φ=−ωτ 线性；RC 群延迟由 −dφ/dω 对闭式
      相位做中心差分数值微分现算，不编造。
   5. 终章判定真算：验收的两处衰减由所选工具的 |H| 公式现算判定，页面
      不预置任何结论；二阶为理想级联（级间缓冲假设，文案已注明）。
   6. 带通对账：半功率点由对 |H(f)| 公式二分求解实测，Q = f0/Δf 反推
      与滑杆设定并排对账。
   评审对账接口：window.FREQ（见文件末尾）。 */
const $ = id => document.getElementById(id);

/* ================================================================
   数学核心（页面与 window.FREQ 共用同一批实现）
   ================================================================ */
const SQRT2 = Math.SQRT2;
function bodeDb(mag) { return 20 * Math.log10(Math.max(mag, 1e-300)); }

/* ---- 一阶 RC 低通：H(jω) = 1/(1+jωτ) ---- */
function rcLPmag(w, tau) { const x = w * tau; return 1 / Math.sqrt(1 + x * x); }
function rcLPphase(w, tau) { return -Math.atan(w * tau); }           // rad
function rcCascadeMag(w, tau) { const m = rcLPmag(w, tau); return m * m; } // 理想级联（缓冲隔离）
/* ---- 一阶 RC 高通：H(jω) = jωτ/(1+jωτ) ---- */
function rcHPmag(w, tau) { const x = w * tau; return x / Math.sqrt(1 + x * x); }
function rcHPphase(w, tau) { return Math.atan2(1, w * tau); }        // rad，+45°@ωc
/* 数值斜率：两点差分（dB/dec），页面读数与评审共用 */
function slopeDbPerDec(magFn, w1, w2) {
  return (bodeDb(magFn(w2)) - bodeDb(magFn(w1))) / (Math.log10(w2) - Math.log10(w1));
}
/* 群延迟：−dφ/dω 中心差分（φ 为闭式，单位 rad；h 取相对步长） */
function groupDelayRC(w, tau) {
  const h = 1e-4 * Math.max(1, w);
  const w1 = Math.max(0, w - h), w2 = w + h;
  return -(rcLPphase(w2, tau) - rcLPphase(w1, tau)) / (w2 - w1);
}

/* ---- 时域仿真：RK4 积分 dv/dt = (cos(ωt) − v)/τ，量稳态幅值/相位 ----
   口径：第 1 步实测牌与第 0 步放行率共用。先跑 tSettle = 6τ + 2T 丢弃暂态，
   再对 2 个周期做投影：p = (2/Tm)∫y·cos(ωt)，q = (2/Tm)∫y·sin(ωt)，
   则 y ≈ p·cos(ωt) − q·sin(ωt)，幅值 = √(p²+q²)，相位 = atan2(−q, p)。 */
function simRC(tau, omega) {
  const T = 2 * Math.PI / omega;
  let dt = T / 240;
  const tSettle = 6 * tau + 2 * T, tMeas = 2 * T, total = tSettle + tMeas;
  const maxSteps = 120000;
  if (total / dt > maxSteps) dt = total / maxSteps;
  const f = (tt, v) => (Math.cos(omega * tt) - v) / tau;
  let v = 0, tt = 0;
  const nSettle = Math.floor(tSettle / dt);
  for (let i = 0; i < nSettle; i++) {
    const k1 = f(tt, v), k2 = f(tt + dt / 2, v + dt * k1 / 2),
          k3 = f(tt + dt / 2, v + dt * k2 / 2), k4 = f(tt + dt, v + dt * k3);
    v += dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6; tt += dt;
  }
  const t0 = tt;
  let Sc = 0, Ss = 0, prevY = null, prevC = null, prevS = null;
  const win = [];
  const nMeas = Math.max(16, Math.round(tMeas / dt));
  const dtm = tMeas / nMeas;
  for (let i = 0; i <= nMeas; i++) {
    const c = Math.cos(omega * tt), s = Math.sin(omega * tt);
    if (prevY !== null) {
      Sc += 0.5 * (prevY * prevC + v * c) * dtm;
      Ss += 0.5 * (prevY * prevS + v * s) * dtm;
    }
    prevY = v; prevC = c; prevS = s;
    if (i % 2 === 0) win.push([tt - t0, Math.cos(omega * tt), v]);
    if (i < nMeas) {
      const k1 = f(tt, v), k2 = f(tt + dtm / 2, v + dtm * k1 / 2),
            k3 = f(tt + dtm / 2, v + dtm * k2 / 2), k4 = f(tt + dtm, v + dtm * k3);
      v += dtm * (k1 + 2 * k2 + 2 * k3 + k4) / 6; tt += dtm;
    }
  }
  const p = 2 / tMeas * Sc, q = 2 / tMeas * Ss;
  return {
    amp: Math.hypot(p, q),
    phase: Math.atan2(-q, p),           // rad
    win,                                 // [t, x, y] 稳态窗（2 周期，隔点采样）
    dt, method: 'RK4, dt=T/240, settle=6τ+2T, projection over 2 periods'
  };
}

/* ---- 移动平均 FIR：|H(ω)| = |sin(Mω/2)| / (M·|sin(ω/2)|) ---- */
function maMag(M, w) {
  if (w < 1e-9) return 1;
  const s = Math.sin(w / 2);
  if (Math.abs(s) < 1e-12) return (Math.round(w / (2 * Math.PI)) % 2 === 0) ? 1 : 1; // ω≈0 的极限
  return Math.abs(Math.sin(M * w / 2) / (M * s));
}
function maZeros(M) {
  const z = [];
  for (let k = 1; 2 * Math.PI * k / M < Math.PI - 1e-12; k++) z.push(2 * Math.PI * k / M);
  return z;
}
function maSidelobe(M) { // 第一旁瓣峰：在 (2π/M, min(4π/M, π)) 内细扫
  const a = 2 * Math.PI / M, b = Math.min(4 * Math.PI / M, Math.PI);
  let bw = a, bm = -1;
  const N = 4000;
  for (let i = 0; i <= N; i++) {
    const w = a + (b - a) * i / N, m = maMag(M, w);
    if (m > bm) { bm = m; bw = w; }
  }
  return { w: bw, mag: bm, db: bodeDb(bm) };
}
/* 离散仿真：x[n]=cos(ωn)，y[n]=最近 M 个样本均值；末段最小二乘投影量稳态幅值
   （对 [cos ωn, sin ωn] 做 2×2 最小二乘拟合——窗口不必凑整数周期，
    纯正弦稳态下拟合精确，避免简单投影在非整数周期窗口上的泄漏误差） */
function maSim(M, w) {
  const N = 600, L = 240;
  const x = new Array(N), y = new Array(N);
  let runSum = 0;
  for (let n = 0; n < N; n++) {
    x[n] = Math.cos(w * n);
    runSum += x[n];
    if (n - M >= 0) runSum -= x[n - M];
    y[n] = runSum / M;
  }
  let Scc = 0, Scs = 0, Sss = 0, Syc = 0, Sys = 0;
  for (let n = N - L; n < N; n++) {
    const c = Math.cos(w * n), s = Math.sin(w * n);
    Scc += c * c; Scs += c * s; Sss += s * s; Syc += y[n] * c; Sys += y[n] * s;
  }
  const det = Scc * Sss - Scs * Scs;
  let a, b;
  if (Math.abs(det) > 1e-9) {
    a = (Syc * Sss - Sys * Scs) / det;
    b = (Sys * Scc - Syc * Scs) / det;
  } else { // At DC/Nyquist the sine/cosine design is rank one, not an orthogonal pair.
    // Normalize by the surviving basis energy;2/L would double the measured amplitude.
    if (Scc >= Sss) { a = Scc ? Syc / Scc : 0; b = 0; }
    else { a = 0; b = Sss ? Sys / Sss : 0; }
  }
  return { x, y, amp: Math.hypot(a, b), phase: Math.atan2(-b, a), N, L };
}

/* ---- 二阶带通：H(jω) = 1 / (1 + jQ(ω/ω0 − ω0/ω))（f 制） ---- */
function bpMag(f, f0, Q) {
  const r = f / f0, d = Q * (r - 1 / r);
  return 1 / Math.sqrt(1 + d * d);
}
function bpPhase(f, f0, Q) { const r = f / f0; return -Math.atan(Q * (r - 1 / r)); }
/* 半功率点：对 |H| 公式二分（log f），返回 {f1, f2, bw, qFromBw} */
function bpHalfPower(f0, Q) {
  const target = 1 / SQRT2;
  function solve(lo, hi) { // mag(lo) 与 mag(hi) 跨过 target，二分 80 次
    for (let i = 0; i < 80; i++) {
      const mid = Math.sqrt(lo * hi);
      const m = bpMag(mid, f0, Q);
      if ((bpMag(lo, f0, Q) - target) * (m - target) <= 0) hi = mid; else lo = mid;
    }
    return Math.sqrt(lo * hi);
  }
  const f1 = solve(f0 / 1000, f0), f2 = solve(f0, f0 * 1000);
  return { f1, f2, bw: f2 - f1, qFromBw: f0 / (f2 - f1) };
}

/* ---- 第 6 步设计台：三件工具的 |H(f)| 与衰减 ---- */
const DESIGN_FS = 4000, DESIGN_F1 = 50, DESIGN_F2 = 500;
function designMag(tool, prm, f) {
  if (tool === 'rc1') return 1 / Math.sqrt(1 + (f / prm.fc) * (f / prm.fc));
  if (tool === 'rc2') { const m = 1 / Math.sqrt(1 + (f / prm.fc) * (f / prm.fc)); return m * m; }
  return maMag(prm.M, 2 * Math.PI * f / DESIGN_FS); // ma
}
function designAtt(tool, prm, f) { // 衰减 dB（正数）；数值零时给出 >300 的大数，显示层封顶
  const m = designMag(tool, prm, f);
  if (m < 1e-15) return 300;
  return -bodeDb(m);
}
function judgeDesign(tool, prm) {
  const a50 = designAtt(tool, prm, DESIGN_F1), a500 = designAtt(tool, prm, DESIGN_F2);
  const passKeep = a50 <= 1 + 1e-12, passKill = a500 >= 20 - 1e-12;
  return { a50, a500, passKeep, passKill, pass: passKeep && passKill,
           gapKeep: passKeep ? 0 : a50 - 1, gapKill: passKill ? 0 : 20 - a500 };
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
function fmtS(v, d) { return fmt(v, d === undefined ? 2 : d).replace(/-/g, '−'); }
/* 大/小数值：普通定点或科学计数（微小量不被四舍五入成 0） */
function fmtSmart(v) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(2).replace(/-/g, '−');
  return fmtS(v, 4);
}
/* 文字落字（量宽夹取）：无论锚点在哪，整串必落在画布内 4px 边距里 */
function putText(ctx, txt, x, y, o) {
  o = o || {};
  const align = o.align || 'left';
  ctx.font = o.font || '12px system-ui, sans-serif';
  ctx.fillStyle = o.color || '#9aa7b8';
  ctx.textAlign = align;
  ctx.textBaseline = o.baseline || 'alphabetic';
  const W = ctx.canvas._w || ctx.canvas.clientWidth || 0;
  const w = ctx.measureText(txt).width;
  let lo, hi;
  if (align === 'left') { lo = 4; hi = W - 4 - w; }
  else if (align === 'right') { lo = 4 + w; hi = W - 4; }
  else { lo = 4 + w / 2; hi = W - 4 - w / 2; }
  const ax = clamp(x, Math.min(lo, hi), Math.max(lo, hi));
  ctx.fillText(txt, ax, y);
  return ax;
}
/* 点旁标签（量宽选边，沿用 Z 页做法） */
function drawSideLabel(ctx, text, px, py, w, preferLeft, gap, color) {
  gap = gap || 10;
  ctx.font = '12px system-ui, sans-serif';
  const tw = ctx.measureText(text).width;
  const fitsL = px + gap + tw <= w - 4, fitsR = px - gap - tw >= 4;
  let x, align;
  if (preferLeft && fitsL) { align = 'left'; x = px + gap; }
  else if (!preferLeft && fitsR) { align = 'right'; x = px - gap; }
  else if (fitsL) { align = 'left'; x = px + gap; }
  else if (fitsR) { align = 'right'; x = px - gap; }
  else if (preferLeft) { align = 'left'; x = Math.max(4, w - 4 - tw); }
  else { align = 'right'; x = Math.min(w - 4, 4 + tw); }
  ctx.fillStyle = color || '#e8edf4';
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
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
/* 图例助手（窄屏自适应）：量宽 → 贪心分行 → 逐行绘制（沿用站内做法） */
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

/* ---------- 通用曲线图骨架 ----------
   cfg: {cv, legend, padL, padR, padT, padB, xLo, xHi, yLo, yHi,
         xLog, xTicks:[[v,label]..], yTicks:[[v,label]..], xLabel, yLabel}
   返回 {ctx, R(绘图区), X(v), Y(v), legH}；曲线绘制方自行 clip 到 R。 */
function plotFrame(cv, cfg) {
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  ctx.fillStyle = '#11161f';
  ctx.fillRect(0, 0, W, H);
  const legRows = cfg.legend ? legendRows(ctx, cfg.legend, W - 20) : [];
  const legH = legRows.length ? legRows.length * 16 + 8 : 0;
  const labH = cfg.yLabel ? 15 : 0;
  const padL = cfg.padL != null ? cfg.padL : 46, padR = cfg.padR != null ? cfg.padR : 12;
  const padT = (cfg.padT != null ? cfg.padT : 8) + legH + labH, padB = cfg.padB != null ? cfg.padB : 24;
  const R = { x: padL, y: padT, w: W - padL - padR, h: H - padT - padB };
  if (legRows.length) drawLegendRows(ctx, legRows, 10, 12);
  if (cfg.yLabel) putText(ctx, cfg.yLabel, padL, padT - labH + 11, { color: '#7d8ca3', font: '11px system-ui, sans-serif' });
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.lineWidth = 1;
  ctx.strokeRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1);
  const lx0 = cfg.xLog ? Math.log10(cfg.xLo) : cfg.xLo, lx1 = cfg.xLog ? Math.log10(cfg.xHi) : cfg.xHi;
  const X = v => R.x + ((cfg.xLog ? Math.log10(Math.max(v, cfg.xLo)) : v) - lx0) / (lx1 - lx0) * R.w;
  const Y = v => R.y + (cfg.yHi - v) / (cfg.yHi - cfg.yLo) * R.h;
  ctx.font = '10.5px system-ui, sans-serif';
  for (const [v, lab] of (cfg.yTicks || [])) {
    ctx.strokeStyle = 'rgba(120,140,165,0.13)';
    ctx.beginPath(); ctx.moveTo(R.x, Y(v)); ctx.lineTo(R.x + R.w, Y(v)); ctx.stroke();
    putText(ctx, lab, R.x - 5, Y(v) + 3, { align: 'right', font: '10.5px system-ui, sans-serif', color: '#5f7089' });
  }
  for (const [v, lab] of (cfg.xTicks || [])) {
    ctx.strokeStyle = 'rgba(120,140,165,0.10)';
    ctx.beginPath(); ctx.moveTo(X(v), R.y); ctx.lineTo(X(v), R.y + R.h); ctx.stroke();
    putText(ctx, lab, X(v), R.y + R.h + 15, { align: 'center', font: '10.5px system-ui, sans-serif', color: '#5f7089' });
  }
  if (cfg.xLabel) putText(ctx, cfg.xLabel, R.x + R.w - 2, R.y + R.h + 15, { align: 'right', color: '#7d8ca3', font: '11px system-ui, sans-serif' });
  return { ctx, R, X, Y, legH };
}
function clipTo(ctx, R, fn) {
  ctx.save();
  ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  fn();
  ctx.restore();
}
function drawCurve(ctx, pts, color, width, dash) {
  ctx.strokeStyle = color; ctx.lineWidth = width || 2;
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  pts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
  ctx.stroke();
  ctx.setLineDash([]);
}
function drawDot(ctx, x, y, color, r, ring) {
  ctx.beginPath(); ctx.arc(x, y, r || 4, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  if (ring) { ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 1.4; ctx.stroke(); }
}

/* ================================================================
   第 0 步 · 钩子：神秘盒子（RC 低通 τ=0.1，先不揭晓）
   ================================================================ */
const BOX_TAU = 0.1;
const s0 = { f: 1, g: null, measured: new Map(), phase: 0 };
function s0Mixture(t, out) {
  const fA = 0.5, fB = 7, ph = 1.3;
  if (!out) return Math.cos(2 * Math.PI * fA * t) + 0.35 * Math.cos(2 * Math.PI * fB * t + ph);
  const a1 = rcLPmag(2 * Math.PI * fA, BOX_TAU), p1 = rcLPphase(2 * Math.PI * fA, BOX_TAU);
  const a2 = rcLPmag(2 * Math.PI * fB, BOX_TAU), p2 = rcLPphase(2 * Math.PI * fB, BOX_TAU);
  return a1 * Math.cos(2 * Math.PI * fA * t + p1) + 0.35 * a2 * Math.cos(2 * Math.PI * fB * t + ph + p2);
}
function drawS0Wave() {
  const cv = $('s0-wave'); const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  ctx.fillStyle = '#11161f'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  const lanes = [[62, '#9aa7b8', false, t('cv0In')], [188, '#6ee7ff', true, t('cv0Out')]];
  for (const [cy, col, isOut, lab] of lanes) {
    ctx.strokeStyle = 'rgba(160,180,205,0.30)';
    ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(W - 8, cy); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = isOut ? 2.2 : 1.6;
    ctx.beginPath();
    const N = 340;
    for (let i = 0; i <= N; i++) {
      const tt = s0.phase + i / N * 4;
      const v = s0Mixture(tt, isOut);
      const x = 8 + i / N * (W - 16), y = cy - v * 33;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    putText(ctx, lab, 10, cy - 47, { color: col, font: '12.5px system-ui, sans-serif' });
  }
}
function drawS0Gain() {
  const cv = $('s0-gain');
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 0.15, xHi: 15, yLo: 0, yHi: 1.08,
    xTicks: [[0.2, '0.2'], [0.5, '0.5'], [1, '1'], [2, '2'], [5, '5'], [10, '10']],
    yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']],
    xLabel: t('cvFreq'), yLabel: t('cvGain')
  });
  /* 当前频率竖线 */
  ctx.strokeStyle = 'rgba(255,180,84,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X(s0.f), R.y); ctx.lineTo(X(s0.f), R.y + R.h); ctx.stroke();
  const pts = [...s0.measured.values()].sort((a, b) => a.f - b.f);
  clipTo(ctx, R, () => {
    if (pts.length > 1) drawCurve(ctx, pts.map(p => [X(p.f), Y(p.g)]), '#ffb454', 1.4, [5, 4]);
  });
  for (const p of pts) drawDot(ctx, X(p.f), Y(p.g), '#ffb454', 3.6);
  if (s0.g !== null) {
    drawDot(ctx, X(s0.f), Y(s0.g), '#ffb454', 5, true);
    drawSideLabel(ctx, 'f = ' + fmtS(s0.f, s0.f < 1 ? 2 : 1) + ' Hz', X(s0.f), Y(s0.g), cv._w, s0.f < 1.2);
  }
}
function updateS0() {
  const sim = simRC(BOX_TAU, 2 * Math.PI * s0.f);
  s0.g = sim.amp;
  s0.measured.set(Math.round(Math.log10(s0.f) * 24), { f: s0.f, g: sim.amp });
  $('s0-f-val').textContent = fmtS(s0.f, s0.f < 1 ? 2 : 1) + ' Hz';
  $('s0-readout').innerHTML = t('s0ro', { f: fmtS(s0.f, s0.f < 1 ? 2 : 1), g: fmtS(s0.g, 3), n: s0.measured.size });
  drawS0Wave(); drawS0Gain();
}

/* ================================================================
   第 1 步 · RC 低通：解析 vs 实测双路
   ================================================================ */
const s1 = { w: 1, sim: null, lit: new Map() };
function drawS1Circuit() {
  const cv = $('s1-circuit'); const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  ctx.fillStyle = '#11161f'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,140,165,0.25)'; ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  const yT = 52, yB = 118, x0 = 36, xR1 = Math.min(150, W * 0.22), xR2 = xR1 + 62, xN = xR2 + 34, xOut = W - 44;
  ctx.strokeStyle = '#9aa7b8'; ctx.lineWidth = 2; ctx.fillStyle = '#9aa7b8';
  /* 顶边导线 + 电阻（矩形） */
  ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(xR1, yT); ctx.stroke();
  ctx.strokeStyle = '#ffb454'; ctx.strokeRect(xR1, yT - 11, 62, 22);
  ctx.beginPath(); ctx.moveTo(xR2, yT); ctx.lineTo(xOut, yT); ctx.stroke();
  /* 底边回线 */
  ctx.strokeStyle = '#9aa7b8';
  ctx.beginPath(); ctx.moveTo(x0, yB); ctx.lineTo(xN, yB); ctx.stroke();
  /* 节点与电容 */
  drawDot(ctx, xN, yT, '#e8edf4', 3.4);
  ctx.beginPath(); ctx.moveTo(xN, yT); ctx.lineTo(xN, 92); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = '#6ee7ff';
  ctx.beginPath(); ctx.moveTo(xN - 17, 92); ctx.lineTo(xN + 17, 92); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xN - 17, 100); ctx.lineTo(xN + 17, 100); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = '#9aa7b8';
  ctx.beginPath(); ctx.moveTo(xN, 100); ctx.lineTo(xN, yB); ctx.stroke();
  /* 输入/输出端子 */
  drawDot(ctx, x0, yT, '#e8edf4', 3); drawDot(ctx, x0, yB, '#e8edf4', 3);
  drawDot(ctx, xOut, yT, '#e8edf4', 3); drawDot(ctx, xOut, yB, '#e8edf4', 3);
  putText(ctx, 'x(t) = cos(ωt)', x0, yT - 14, { color: '#9aa7b8', font: '13px Georgia, serif' });
  putText(ctx, 'R', (xR1 + xR2) / 2, yT - 18, { align: 'center', color: '#ffb454', font: 'italic 14px Georgia, serif' });
  putText(ctx, 'C', xN + 24, 100, { color: '#6ee7ff', font: 'italic 14px Georgia, serif' });
  putText(ctx, 'y(t)', xOut, yT - 14, { align: 'right', color: '#e8edf4', font: '13px Georgia, serif' });
  putText(ctx, '+', xOut + 8, yT + 4, { color: '#e8edf4', font: '13px system-ui, sans-serif' });
  putText(ctx, '−', xOut + 8, yB + 4, { color: '#e8edf4', font: '13px system-ui, sans-serif' });
}
function drawS1Wave() {
  const cv = $('s1-wave');
  const win = s1.sim.win, tEnd = win.length ? win[win.length - 1][0] : 1;
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLo: 0, xHi: tEnd, yLo: -1.28, yHi: 1.28,
    yTicks: [[-1, '−1'], [0, '0'], [1, '1']], xTicks: [],
    legend: [[t('cv1In'), '#9aa7b8'], [t('cv1Out'), '#6ee7ff']]
  });
  clipTo(ctx, R, () => {
    drawCurve(ctx, win.map(p => [X(p[0]), Y(p[1])]), '#9aa7b8', 1.4);
    drawCurve(ctx, win.map(p => [X(p[0]), Y(p[2])]), '#6ee7ff', 2.2);
  });
}
function drawS1Mag() {
  const cv = $('s1-mag');
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 0.03, xHi: 40, yLo: 0, yHi: 1.08,
    xTicks: [[0.1, '0.1'], [1, '1'], [10, '10']],
    yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']],
    yLabel: t('cvMag'),
    legend: [[t('cvCurve'), '#6ee7ff'], [t('cvLit'), '#ffb454']]
  });
  clipTo(ctx, R, () => {
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const w = 0.03 * Math.pow(40 / 0.03, i / 220);
      pts.push([X(w), Y(rcLPmag(w, 1))]);
    }
    drawCurve(ctx, pts, '#6ee7ff', 2);
  });
  for (const p of s1.lit.values()) drawDot(ctx, X(p.w), Y(p.amp), '#ffb454', 3.6);
  drawDot(ctx, X(s1.w), Y(rcLPmag(s1.w, 1)), '#ffb454', 5, true);
}
function updateS1() {
  s1.sim = simRC(1, s1.w);
  const ana = { mag: rcLPmag(s1.w, 1), ph: rcLPphase(s1.w, 1) * 180 / Math.PI };
  const mea = { mag: s1.sim.amp, ph: s1.sim.phase * 180 / Math.PI };
  s1.lit.set(Math.round(Math.log10(s1.w) * 6), { w: s1.w, amp: mea.mag });
  $('s1-w-val').textContent = fmtS(s1.w, 2) + ' rad/s';
  $('s1-ana').innerHTML = '|H| = <b>' + fmtS(ana.mag, 4) + '</b> · φ = <b>' + fmtS(ana.ph, 1) + '°</b>';
  $('s1-mea').innerHTML = '|H| = <b>' + fmtS(mea.mag, 4) + '</b> · φ = <b>' + fmtS(mea.ph, 1) + '°</b>';
  $('s1-readout').innerHTML = t('s1ro', {
    w: fmtS(s1.w, 2),
    dm: fmtSmart(Math.abs(ana.mag - mea.mag)),
    dp: fmtS(Math.abs(ana.ph - mea.ph), 2),
    n: s1.lit.size
  });
  drawS1Circuit(); drawS1Wave(); drawS1Mag();
}

/* ================================================================
   第 2 步 · 波特图 + 读图练习
   ================================================================ */
const s2 = { R: 1, C: 1, quiz: null, score: { n: 0, c: 0 } };
function s2tau() { return s2.R * s2.C; }
function drawS2Mag() {
  const cv = $('s2-mag'), tau = s2tau(), wc = 1 / tau;
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 0.01, xHi: 100, yLo: -62, yHi: 4,
    xTicks: [[0.01, '0.01'], [0.1, '0.1'], [1, '1'], [10, '10'], [100, '100']],
    yTicks: [[0, '0'], [-20, '−20'], [-40, '−40'], [-60, '−60']],
    yLabel: t('cvDb'),
    legend: [[t('cvAsym'), '#8b98a9']]
  });
  clipTo(ctx, R, () => {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const w = 0.01 * Math.pow(10000, i / 240);
      pts.push([X(w), Y(bodeDb(rcLPmag(w, tau)))]);
    }
    drawCurve(ctx, pts, '#6ee7ff', 2.2);
    /* 渐近线：0 dB 到 ωc，之后 −20 dB/dec */
    drawCurve(ctx, [[X(0.01), Y(0)], [X(wc), Y(0)], [X(100), Y(-20 * Math.log10(100 / wc))]], '#8b98a9', 1.4, [6, 4]);
    if (s2.quiz && s2.quiz.kind === 'mag') {
      ctx.strokeStyle = 'rgba(255,180,84,0.4)';
      ctx.beginPath(); ctx.moveTo(X(s2.quiz.w), R.y); ctx.lineTo(X(s2.quiz.w), R.y + R.h); ctx.stroke();
    }
  });
  drawDot(ctx, X(wc), Y(bodeDb(1 / SQRT2)), '#ffb454', 4.6, true);
  drawSideLabel(ctx, t('cvCut'), X(wc), Y(bodeDb(1 / SQRT2)), cv._w, wc < 1);
  if (s2.quiz && s2.quiz.kind === 'mag') drawDot(ctx, X(s2.quiz.w), Y(bodeDb(rcLPmag(s2.quiz.w, tau))), '#ffb454', 4);
}
function drawS2Phase() {
  const cv = $('s2-phase'), tau = s2tau(), wc = 1 / tau;
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 0.01, xHi: 100, yLo: -95, yHi: 5,
    xTicks: [[0.01, '0.01'], [0.1, '0.1'], [1, '1'], [10, '10'], [100, '100']],
    yTicks: [[0, '0'], [-45, '−45'], [-90, '−90']],
    yLabel: t('cvPhase')
  });
  clipTo(ctx, R, () => {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const w = 0.01 * Math.pow(10000, i / 240);
      pts.push([X(w), Y(rcLPphase(w, tau) * 180 / Math.PI)]);
    }
    drawCurve(ctx, pts, '#6ee7ff', 2.2);
    if (s2.quiz && s2.quiz.kind === 'ph') {
      ctx.strokeStyle = 'rgba(255,180,84,0.4)';
      ctx.beginPath(); ctx.moveTo(X(s2.quiz.w), R.y); ctx.lineTo(X(s2.quiz.w), R.y + R.h); ctx.stroke();
    }
  });
  drawDot(ctx, X(wc), Y(-45), '#ffb454', 4.6, true);
  drawSideLabel(ctx, t('cvM45'), X(wc), Y(-45), cv._w, wc < 1);
  if (s2.quiz && s2.quiz.kind === 'ph') drawDot(ctx, X(s2.quiz.w), Y(rcLPphase(s2.quiz.w, tau) * 180 / Math.PI), '#ffb454', 4);
}
function quizTrue(kind, w) {
  const tau = s2tau();
  return kind === 'mag' ? bodeDb(rcLPmag(w, tau)) : rcLPphase(w, tau) * 180 / Math.PI;
}
function genQuiz(forceKind, regenerated = false) {
  const kind = forceKind || (!s2.quiz ? 'mag' : (s2.quiz.kind === 'mag' ? 'ph' : 'mag'));
  const ws = [0.03, 0.1, 0.3, 1, 3, 10, 30];
  const w = ws[Math.floor(Math.random() * ws.length)];
  const tru = quizTrue(kind, w);
  const dec = kind === 'mag' ? 1 : 0;
  const offs = kind === 'mag' ? [6, -6, 12, -12] : [15, -15, 30, -30];
  const vals = new Set([Math.round(tru * Math.pow(10, dec)) / Math.pow(10, dec)]);
  const opts = [vals.values().next().value];
  for (const o of offs) {
    if (opts.length >= 4) break;
    let v = Math.round((tru + o) * Math.pow(10, dec)) / Math.pow(10, dec);
    if (kind === 'ph') v = clamp(v, -90, 0);
    if (!vals.has(v)) { vals.add(v); opts.push(v); }
  }
  let guard = 0;
  while (opts.length < 4 && guard++ < 50) {
    let v = Math.round((tru + (Math.random() * 24 - 12)) * Math.pow(10, dec)) / Math.pow(10, dec);
    if (kind === 'ph') v = clamp(v, -90, 0);
    if (!vals.has(v)) { vals.add(v); opts.push(v); }
  }
  /* 洗牌（Fisher–Yates） */
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  const unit = kind === 'mag' ? ' dB' : '°';
  s2.quiz = {
    kind, w, trueVal: tru, answered: false, picked: -1, regenerated,
    options: opts.map(v => ({ value: v, label: fmtS(v, dec) + unit })),
    correctIdx: opts.findIndex(v => Math.abs(v - Math.round(tru * Math.pow(10, dec)) / Math.pow(10, dec)) < 1e-9)
  };
}
function renderQuiz() {
  const q = s2.quiz;
  if (!q) return;
  $('s2-quiz-q').innerHTML = t(q.kind === 'mag' ? 's2quizQmag' : 's2quizQph', { w: fmtS(q.w, q.w < 1 ? 2 : 0) });
  const box = $('s2-quiz-opts');
  box.innerHTML = '';
  q.options.forEach((op, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn'; b.textContent = op.label;
    if (q.answered) {
      if (i === q.correctIdx) b.classList.add('right');
      else if (i === q.picked) b.classList.add('wrong');
      b.disabled = true; /* 揭晓后锁定全部选项：计分已定，再点只会让人误读反馈是在判新点击 */
    }
    b.addEventListener('click', () => answerQuiz(i));
    box.appendChild(b);
  });
  if (q.answered) {
    const dec = q.kind === 'mag' ? 1 : 0, unit = q.kind === 'mag' ? ' dB' : '°';
    $('s2-quiz-ro').innerHTML = t(q.picked === q.correctIdx ? 's2quizRight' : 's2quizWrong', {
      v: fmtS(q.trueVal, dec) + unit, w: fmtS(q.w, q.w < 1 ? 2 : 0), n: s2.score.n, c: s2.score.c
    });
  } else {
    $('s2-quiz-ro').innerHTML = t(q.regenerated ? 's2quizRegen' : 's2quizIdle');
  }
}
function answerQuiz(i) {
  const q = s2.quiz;
  if (!q || q.answered) return;
  q.answered = true; q.picked = i;
  s2.score.n++;
  const ok = i === q.correctIdx;
  if (ok) s2.score.c++;
  renderQuiz();
}
/* 纯刷新：语言/布局变化只重画与重渲染，不换题、不计分。 */
function updateS2() {
  const tau = s2tau(), wc = 1 / tau;
  $('s2-r-val').textContent = fmtS(s2.R, 2);
  $('s2-c-val').textContent = fmtS(s2.C, 2);
  const slope = slopeDbPerDec(w => rcLPmag(w, tau), 10 * wc, 100 * wc);
  $('s2-readout').innerHTML = t('s2ro', { tau: fmtS(tau, 2), wc: fmtS(wc, 2), slope: fmtS(slope, 1) });
  drawS2Mag(); drawS2Phase();
  renderQuiz();
}
function setS2Param(key, value) {
  if (s2[key] === value) return;
  s2[key] = value;
  /* 先结束旧题并按新参数出题，再统一刷新；累计分数保留。 */
  genQuiz(s2.quiz ? s2.quiz.kind : undefined, true);
  updateS2();
}

/* ================================================================
   第 3 步 · 移动平均 FIR
   ================================================================ */
const s3 = { M: 8, w: 2 * Math.PI / 8, sim: null };
function drawS3Mag() {
  const cv = $('s3-mag');
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLo: 0, xHi: Math.PI, yLo: -0.05, yHi: 1.08,
    xTicks: [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π']],
    yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']],
    yLabel: t('cvMagW'),
    legend: [[t('cv3Zero'), '#ff7a93'], [t('cv3Cur'), '#ffb454']]
  });
  clipTo(ctx, R, () => {
    const pts = [];
    for (let i = 0; i <= 300; i++) {
      const w = Math.PI * i / 300;
      pts.push([X(w), Y(maMag(s3.M, w))]);
    }
    drawCurve(ctx, pts, '#6ee7ff', 2.2);
    ctx.strokeStyle = 'rgba(255,180,84,0.4)';
    ctx.beginPath(); ctx.moveTo(X(s3.w), R.y); ctx.lineTo(X(s3.w), R.y + R.h); ctx.stroke();
  });
  for (const z of maZeros(s3.M)) drawDot(ctx, X(z), Y(0), '#ff7a93', 3.6);
  drawDot(ctx, X(s3.w), Y(maMag(s3.M, s3.w)), '#ffb454', 5, true);
}
function drawS3Tone() {
  const cv = $('s3-tone');
  const sim = s3.sim, N0 = 480, N1 = 600;
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLo: 0, xHi: N1 - N0, yLo: -1.25, yHi: 1.25,
    yTicks: [[-1, '−1'], [0, '0'], [1, '1']], xTicks: [],
    legend: [[t('cv3In'), '#9aa7b8'], [t('cv3Out'), '#6ee7ff']]
  });
  clipTo(ctx, R, () => {
    for (let n = N0; n < N1; n++) {
      const px = X(n - N0 + 0.5);
      ctx.strokeStyle = 'rgba(154,167,184,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, Y(0)); ctx.lineTo(px, Y(sim.x[n])); ctx.stroke();
      ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, Y(0)); ctx.lineTo(px, Y(sim.y[n])); ctx.stroke();
      drawDot(ctx, px, Y(sim.y[n]), '#6ee7ff', 1.8);
    }
  });
}
function updateS3() {
  s3.sim = maSim(s3.M, s3.w);
  const side = maSidelobe(s3.M);
  const hasSide = s3.M >= 3 && 2 * Math.PI / s3.M < Math.PI;
  $('s3-m-val').textContent = String(s3.M);
  $('s3-w-val').textContent = fmtS(s3.w, 3);
  $('s3-w').value = String(s3.w);
  $('s3-p-side').disabled = !hasSide;
  const sideSeg = hasSide
    ? t('s3sideSeg', { side: fmtS(side.mag, 4), sidedb: fmtS(side.db, 1) })
    : t('s3sideNoneSeg');
  $('s3-readout').innerHTML = t('s3ro', {
    M: s3.M, w: fmtS(s3.w, 3),
    ana: fmtSmart(maMag(s3.M, s3.w)),
    mea: fmtSmart(s3.sim.amp),
    sideSeg,
    gd: fmtS((s3.M - 1) / 2, 1)
  });
  drawS3Mag(); drawS3Tone();
}

/* ================================================================
   第 4 步 · 相位毁波形
   ================================================================ */
const s4 = { sig: 'pulse', tau: 0.6 };
function s4x(tt) {
  const m = ((tt % 4) + 4) % 4;
  return s4.sig === 'pulse' ? (m < 1 ? 1 : 0) : (m < 2 ? 1 : -1);
}
function simRCSiginal(tau) {
  const dt = 0.004, t0 = -8, t1 = 8;
  const f = (tt, v) => (s4x(tt) - v) / tau;
  let v = 0, tt = t0;
  const pts = [];
  const steps = Math.round((t1 - t0) / dt);
  for (let i = 0; i <= steps; i++) {
    if (tt >= -1e-9 && i % 4 === 0) pts.push([tt, v]);
    if (i < steps) {
      const k1 = f(tt, v), k2 = f(tt + dt / 2, v + dt * k1 / 2),
            k3 = f(tt + dt / 2, v + dt * k2 / 2), k4 = f(tt + dt, v + dt * k3);
      v += dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6; tt += dt;
    }
  }
  return pts;
}
let s4rcCache = null;
function drawS4Wave() {
  const cv = $('s4-wave');
  const rc = simRCSiginal(s4.tau);
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLo: 0, xHi: 8, yLo: -1.35, yHi: 1.35,
    xTicks: [[0, '0'], [2, '2'], [4, '4'], [6, '6'], [8, '8 s']],
    yTicks: [[-1, '−1'], [0, '0'], [1, '1']],
    legend: [[t('cv4In'), '#9aa7b8'], [t('cv4Delay'), '#6ee7ff'], [t('cv4RC'), '#ffb454']]
  });
  clipTo(ctx, R, () => {
    const inp = [], del = [];
    for (let i = 0; i <= 400; i++) {
      const tt = i / 400 * 8;
      inp.push([X(tt), Y(s4x(tt))]);
      del.push([X(tt), Y(s4x(tt - s4.tau))]);
    }
    drawCurve(ctx, inp, 'rgba(154,167,184,0.8)', 1.3);
    drawCurve(ctx, del, '#6ee7ff', 1.8);
    drawCurve(ctx, rc.map(p => [X(p[0]), Y(p[1])]), '#ffb454', 2.2);
  });
}
function drawS4Phase() {
  const cv = $('s4-phase');
  const gdMax = 1.6;
  /* 纵轴贴合数据（第 2 轮）：曲线本体的最深点是纯延迟相位在 ω=2.5 处的
     −2.5τ rad。按 45° 一档收紧纵轴下限、每 45° 一条网格刻度——只改映射
     范围与刻度，曲线数据一根不动；群延迟右轴随新范围同比映射。 */
  const needDeg = 2.5 * s4.tau * 180 / Math.PI;
  let yLo = -270;
  for (const cand of [-45, -90, -135, -180, -225, -270]) {
    if (-cand >= needDeg * 1.06) { yLo = cand; break; }
  }
  const yTicks = [];
  for (let v = 0; v >= yLo; v -= 45) yTicks.push([v, fmtS(v, 0)]);
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLo: 0, xHi: 2.5, yLo, yHi: 10, padR: 32,
    xTicks: [[0, '0'], [0.5, '0.5'], [1, '1'], [1.5, '1.5'], [2, '2'], [2.5, '2.5 rad/s']],
    yTicks,
    yLabel: t('cvPhase4'),
    legend: [[t('cv4PhD'), '#6ee7ff'], [t('cv4PhRC'), '#ffb454'], [t('cv4Gd'), '#7ee2a8']]
  });
  const gdY = g => Y(yLo + (g / gdMax) * (10 - yLo));
  for (const g of [0, 0.8, 1.6]) {
    putText(ctx, fmtS(g, 1), R.x + R.w + 10, gdY(g) + 3, { align: 'left', font: '10.5px system-ui, sans-serif', color: '#5f7089' });
  }
  clipTo(ctx, R, () => {
    const pd = [], pr = [], gd = [];
    for (let i = 0; i <= 200; i++) {
      const w = 2.5 * i / 200;
      pd.push([X(w), Y(-w * s4.tau * 180 / Math.PI)]);
      pr.push([X(w), Y(rcLPphase(w, s4.tau) * 180 / Math.PI)]);
      gd.push([X(w), gdY(groupDelayRC(w, s4.tau))]);
    }
    drawCurve(ctx, pd, '#6ee7ff', 1.8);
    drawCurve(ctx, pr, '#ffb454', 2);
    drawCurve(ctx, gd, '#7ee2a8', 1.8, [6, 4]);
  });
}
function updateS4() {
  $('s4-tau-val').textContent = fmtS(s4.tau, 2) + ' s';
  $('s4-readout').innerHTML = t('s4ro', {
    tau: fmtS(s4.tau, 2),
    gd0: fmtS(groupDelayRC(0, s4.tau), 3),
    gd2: fmtS(groupDelayRC(2, s4.tau), 3)
  });
  drawS4Wave(); drawS4Phase();
}

/* ================================================================
   第 5 步 · 高通与带通
   ================================================================ */
const s5 = { tau: 1, f0: 100, Q: 5 };
function drawS5HP() {
  const cv = $('s5-hp'), wc = 1 / s5.tau;
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 0.01, xHi: 100, yLo: -0.05, yHi: 1.08,
    xTicks: [[0.01, '0.01'], [0.1, '0.1'], [1, '1'], [10, '10'], [100, '100']],
    yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']],
    legend: [[t('cv5hp'), '#6ee7ff']]
  });
  clipTo(ctx, R, () => {
    const lp = [], hp = [];
    for (let i = 0; i <= 240; i++) {
      const w = 0.01 * Math.pow(10000, i / 240);
      lp.push([X(w), Y(rcLPmag(w, s5.tau))]);
      hp.push([X(w), Y(rcHPmag(w, s5.tau))]);
    }
    drawCurve(ctx, lp, 'rgba(139,152,169,0.55)', 1.4, [5, 4]);
    drawCurve(ctx, hp, '#6ee7ff', 2.2);
  });
  drawDot(ctx, X(wc), Y(1 / SQRT2), '#ffb454', 4.6, true);
  drawSideLabel(ctx, t('cv5cut'), X(wc), Y(1 / SQRT2), cv._w, wc < 1);
}
function drawS5BP() {
  const cv = $('s5-bp');
  const hp = bpHalfPower(s5.f0, s5.Q);
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 10, xHi: 1000, yLo: -0.05, yHi: 1.12,
    xTicks: [[10, '10'], [100, '100'], [1000, '1000 Hz']],
    yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']],
    legend: [[t('cv5bp'), '#6ee7ff'], [t('cv5half'), '#ffb454']]
  });
  clipTo(ctx, R, () => {
    const pts = [];
    for (let i = 0; i <= 260; i++) {
      const f = 10 * Math.pow(100, i / 260);
      pts.push([X(f), Y(bpMag(f, s5.f0, s5.Q))]);
    }
    drawCurve(ctx, pts, '#6ee7ff', 2.2);
    ctx.strokeStyle = 'rgba(255,180,84,0.6)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(X(hp.f1), Y(1 / SQRT2)); ctx.lineTo(X(hp.f2), Y(1 / SQRT2)); ctx.stroke();
    ctx.setLineDash([]);
  });
  drawDot(ctx, X(hp.f1), Y(1 / SQRT2), '#ffb454', 4);
  drawDot(ctx, X(hp.f2), Y(1 / SQRT2), '#ffb454', 4);
  drawDot(ctx, X(s5.f0), Y(1), '#ffb454', 4.6, true);
  drawSideLabel(ctx, t('cv5peak'), X(s5.f0), Y(1), cv._w, s5.f0 < 100);
}
/* 带通相位小图（第 2 轮补）：数据走 bpPhase 真算——低频端 +90° 超前、
   在 f₀ 处过零、高频端 −90° 滞后，与第 2/4 步的相位叙事闭环 */
function drawS5BPPhase() {
  const cv = $('s5-bp-phase');
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 10, xHi: 1000, yLo: -95, yHi: 95,
    xTicks: [[10, '10'], [100, '100'], [1000, '1000 Hz']],
    yTicks: [[90, '90'], [0, '0'], [-90, '−90']],
    yLabel: t('cvPhase'),
    legend: [[t('cv5bpPh'), '#ffb454']]
  });
  clipTo(ctx, R, () => {
    const pts = [];
    for (let i = 0; i <= 260; i++) {
      const f = 10 * Math.pow(100, i / 260);
      pts.push([X(f), Y(bpPhase(f, s5.f0, s5.Q) * 180 / Math.PI)]);
    }
    drawCurve(ctx, pts, '#ffb454', 2.2);
  });
  drawDot(ctx, X(s5.f0), Y(0), '#ffb454', 4.6, true);
  drawSideLabel(ctx, 'φ = 0 @ f₀', X(s5.f0), Y(0), cv._w, s5.f0 < 100);
}
function updateS5() {
  const wc = 1 / s5.tau;
  $('s5-tau-val').textContent = fmtS(s5.tau, 2) + ' s（ωc = ' + fmtS(wc, 2) + '）';
  $('s5-hp-ro').innerHTML = t('s5hpro', {
    tau: fmtS(s5.tau, 2), wc: fmtS(wc, 2), lo: fmtS(rcHPmag(0.1 * wc, s5.tau), 4)
  });
  const hp = bpHalfPower(s5.f0, s5.Q);
  $('s5-f0-val').textContent = fmtS(s5.f0, 0) + ' Hz';
  $('s5-q-val').textContent = fmtS(s5.Q, 2);
  $('s5-bp-ro').innerHTML = t('s5bpro', {
    f0: fmtS(s5.f0, 0), q: fmtS(s5.Q, 2),
    f1: fmtS(hp.f1, 1), f2: fmtS(hp.f2, 1), bw: fmtS(hp.bw, 1),
    qchk: fmtS(hp.qFromBw, 2)
  });
  drawS5HP(); drawS5BP(); drawS5BPPhase();
}

/* ================================================================
   第 6 步 · 设计台
   ================================================================ */
const s6 = { tool: 'rc1', fc: 100, M: 8, judged: false };
function s6prm() { return s6.tool === 'ma' ? { M: s6.M } : { fc: s6.fc }; }
function fmtAtt(a) { return a > 120 ? t('s6huge') : fmtS(a, 2) + ' dB'; }
function drawS6() {
  const cv = $('s6-mag'), prm = s6prm();
  const { ctx, R, X, Y } = plotFrame(cv, {
    xLog: true, xLo: 10, xHi: 2000, yLo: -72, yHi: 3,
    xTicks: [[10, '10'], [100, '100'], [1000, '1000 Hz']],
    yTicks: [[0, '0'], [-20, '−20'], [-40, '−40'], [-60, '−60']],
    yLabel: t('cv6Db'),
    legend: [[t('cv6keep'), '#7ee2a8'], [t('cv6kill'), '#ff7a93']]
  });
  clipTo(ctx, R, () => {
    ctx.strokeStyle = 'rgba(126,226,168,0.55)'; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(R.x, Y(-1)); ctx.lineTo(R.x + R.w, Y(-1)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,122,147,0.55)';
    ctx.beginPath(); ctx.moveTo(R.x, Y(-20)); ctx.lineTo(R.x + R.w, Y(-20)); ctx.stroke();
    ctx.setLineDash([]);
    const pts = [];
    for (let i = 0; i <= 260; i++) {
      const f = 10 * Math.pow(200, i / 260);
      pts.push([X(f), Y(bodeDb(designMag(s6.tool, prm, f)))]);
    }
    drawCurve(ctx, pts, '#6ee7ff', 2.2);
    for (const [f, col] of [[DESIGN_F1, '#7ee2a8'], [DESIGN_F2, '#ff7a93']]) {
      ctx.strokeStyle = col; ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(X(f), R.y); ctx.lineTo(X(f), R.y + R.h); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  putText(ctx, t('cv6Spec1'), R.x + R.w - 4, Y(-1) - 5, { align: 'right', color: '#7ee2a8', font: '11px system-ui, sans-serif' });
  putText(ctx, t('cv6Spec2'), R.x + R.w - 4, Y(-20) - 5, { align: 'right', color: '#ff7a93', font: '11px system-ui, sans-serif' });
  drawDot(ctx, X(DESIGN_F1), Y(-designAtt(s6.tool, prm, DESIGN_F1)), '#7ee2a8', 4.6, true);
  drawDot(ctx, X(DESIGN_F2), Y(-designAtt(s6.tool, prm, DESIGN_F2)), '#ff7a93', 4.6, true);
}
function updateS6() {
  const prm = s6prm();
  const j = judgeDesign(s6.tool, prm);
  $('s6-fc-val').textContent = fmtS(s6.fc, 0) + ' Hz';
  $('s6-m-val').textContent = String(s6.M);
  $('s6-fc-wrap').hidden = s6.tool === 'ma';
  $('s6-m-wrap').hidden = s6.tool !== 'ma';
  const param = s6.tool === 'ma'
    ? t('s6roParamM', { M: s6.M, z: fmtS(DESIGN_FS / s6.M, 1) })
    : t('s6roParamFc', { fc: fmtS(s6.fc, 0) });
  $('s6-readout').innerHTML = t('s6ro', {
    tool: t(s6.tool === 'rc1' ? 's6toolRc1' : s6.tool === 'rc2' ? 's6toolRc2' : 's6toolMa'),
    param, a50: fmtAtt(j.a50), a500: fmtAtt(j.a500)
  });
  if (!s6.judged) $('s6-verdict').innerHTML = t('s6idle');
  drawS6();
}
function judgeS6() {
  const j = judgeDesign(s6.tool, s6prm());
  s6.judged = true;
  if (j.pass) {
    $('s6-verdict').innerHTML = t('s6pass', { a50: fmtAtt(j.a50), a500: fmtAtt(j.a500) });
  } else {
    let why;
    if (!j.passKeep && !j.passKill) {
      why = t('s6failBoth', { g1: fmtS(j.gapKeep, 2), g2: fmtS(j.gapKill, 2) });
    } else if (!j.passKeep) {
      why = t('s6failKeep', { gap: fmtS(j.gapKeep, 2), a50: fmtAtt(j.a50) });
    } else {
      why = t('s6failKill', { gap: fmtS(j.gapKill, 2), a500: fmtAtt(j.a500) });
    }
    $('s6-verdict').innerHTML = t('s6fail', { why });
  }
}

/* ================================================================
   评审对账接口 window.FREQ
   ================================================================ */
window.FREQ = {
  rc: {
    mag: rcLPmag, phase: rcLPphase, hpMag: rcHPmag, hpPhase: rcHPphase,
    cascadeMag: rcCascadeMag, simSteady: simRC,
    groupDelay: groupDelayRC, slope: slopeDbPerDec
  },
  bode: { db: bodeDb },
  ma: { mag: maMag, zeros: maZeros, sidelobe: maSidelobe, sim: maSim },
  bp: { mag: bpMag, phase: bpPhase, halfPower: bpHalfPower },
  design: { magAt: designMag, attDb: designAtt, judge: judgeDesign, FS: DESIGN_FS },
  state: { s0, s1, s2, s3, s4, s5, s6 }
};

/* ================================================================
   接线与初始化
   ================================================================ */
function updateAll() { updateS0(); updateS1(); updateS2(); updateS3(); updateS4(); updateS5(); updateS6(); }
document.addEventListener('DOMContentLoaded', () => {
  ['s0-wave', 's0-gain', 's1-circuit', 's1-wave', 's1-mag', 's2-mag', 's2-phase',
   's3-mag', 's3-tone', 's4-wave', 's4-phase', 's5-hp', 's5-bp', 's5-bp-phase', 's6-mag']
   .forEach(id => ctxOf(id));

  $('s0-f').addEventListener('input', e => { s0.f = Math.pow(10, parseFloat(e.target.value)); updateS0(); });
  $('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));
  animate($('step0'), dt => { s0.phase += dt * 0.7; drawS0Wave(); });

  $('s1-w').addEventListener('input', e => { s1.w = Math.pow(10, parseFloat(e.target.value)); updateS1(); });

  $('s2-r').addEventListener('input', e => setS2Param('R', Math.pow(10, parseFloat(e.target.value))));
  $('s2-c').addEventListener('input', e => setS2Param('C', Math.pow(10, parseFloat(e.target.value))));
  $('s2-quiz-next').addEventListener('click', () => { genQuiz(undefined, true); updateS2(); });

  $('s3-m').addEventListener('input', e => { s3.M = parseInt(e.target.value, 10); updateS3(); });
  $('s3-w').addEventListener('input', e => { s3.w = parseFloat(e.target.value); updateS3(); });
  $('s3-w').addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (!['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const delta = e.shiftKey ? 0.05 : 0.005;
    s3.w = e.key === 'Home' ? 0.05 : e.key === 'End' ? Math.PI
      : clamp(s3.w + (['ArrowRight','ArrowUp'].includes(e.key) ? delta : -delta), 0.05, Math.PI);
    updateS3();
  });
  $('s3-p-zero').addEventListener('click', () => { s3.w = 2 * Math.PI / s3.M; updateS3(); });
  $('s3-p-side').addEventListener('click', () => { if (s3.M >= 3) { s3.w = maSidelobe(s3.M).w; updateS3(); } });
  $('s3-p-pass').addEventListener('click', () => { s3.w = 0.2; updateS3(); });

  $('s4-sig-pulse').addEventListener('click', () => {
    s4.sig = 'pulse';
    $('s4-sig-pulse').classList.add('active'); $('s4-sig-square').classList.remove('active');
    updateS4();
  });
  $('s4-sig-square').addEventListener('click', () => {
    s4.sig = 'square';
    $('s4-sig-square').classList.add('active'); $('s4-sig-pulse').classList.remove('active');
    updateS4();
  });
  $('s4-tau').addEventListener('input', e => { s4.tau = parseFloat(e.target.value); updateS4(); });

  $('s5-tau').addEventListener('input', e => { s5.tau = Math.pow(10, parseFloat(e.target.value)); updateS5(); });
  $('s5-f0').addEventListener('input', e => { s5.f0 = Math.pow(10, parseFloat(e.target.value)); updateS5(); });
  $('s5-q').addEventListener('input', e => { s5.Q = Math.pow(10, parseFloat(e.target.value)); updateS5(); });

  document.querySelectorAll('#s6-tools .btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#s6-tools .btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      s6.tool = b.dataset.tool; s6.judged = false;
      updateS6();
    });
  });
  $('s6-fc').addEventListener('input', e => { s6.fc = Math.pow(10, parseFloat(e.target.value)); s6.judged = false; updateS6(); });
  $('s6-m').addEventListener('input', e => { s6.M = parseInt(e.target.value, 10); s6.judged = false; updateS6(); });
  $('s6-judge').addEventListener('click', judgeS6);

  genQuiz();
  updateAll();
  onLangRefresh(() => updateAll());
  onRefit(() => updateAll());
});
