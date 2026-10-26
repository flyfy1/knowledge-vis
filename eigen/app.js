'use strict';
/* ================================================================
   特征值与特征向量讲解页 — 矩阵不转的那些方向
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   全部数学（评审对账用，window.EIGEN 同源）：
   - 2×2 特征解闭式：tr = a+d，det = ad−bc，Δ = (a−d)² + 4bc；
     Δ>0 两实根 λ = (tr±√Δ)/2；Δ=0 重根（A=λI 时每个方向都是特征方向，
     否则亏损、只有一个特征方向）；Δ<0 复根 α±βi，α = tr/2，
     β = √(−Δ)/2，模 ρ = √(α²+β²) = √det，旋转角 φ = atan2(β, α)。
     特征向量：对 λ 取 (b, λ−a) 与 (λ−d, c) 中模较大者归一化
     （两者都是 (A−λI) 的零空间方向，取大者数值稳）。
   - 幂迭代：x ← Ax/‖Ax‖，逐点真迭代；夹角误差 = x 与主特征方向
     的共线夹角（内积取绝对值，0–90°）。
   - 对称步：Q 的列为单位特征向量，A′ = QᵀAQ、重构 QΛQᵀ 均真矩阵乘法。
   - PCA：数据 mulberry32(种子 20261016)：u ~ N(0,1.7)、w ~ N(0,0.5)
     （Box–Muller polar），沿 30° 方向合成 60 点；页面减去样本均值
     中心化，协方差与投影方差口径统一为 1/(n−1)。
   - 终章：4 节点图 A→{B,C}、B→{C}、C→{A,D}、D→{C}，列随机矩阵
     M[i][j] = 从 j 出发落到 i 的概率（每列和 = 1）；稳态的理论值
     恰为 (2/9, 1/9, 4/9, 2/9)，页面另用高斯消元独立解 (M−I)π=0
     （以 Σπ=1 替换一行）对账；迭代 π ← Mπ 真跑。
   ================================================================ */
const $ = id => document.getElementById(id);

/* ================================================================
   画布适配（DPR）：沿用站内 fitCanvas 方案（CSS 尺寸与 backing store 分离、幂等）
   ================================================================ */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const responsiveHeight = cv.hasAttribute('data-responsive-height');
  if (!responsiveHeight && cv.dataset.cssH === undefined) {
    const hAttr = parseInt(cv.getAttribute('height'), 10);
    cv.dataset.cssH = hAttr ? String(hAttr) : '';
  }
  if (!responsiveHeight && cv.dataset.cssH) cv.style.height = cv.dataset.cssH + 'px';
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
function fmtS(v, d) { return fmt(v, d === undefined ? 3 : d).replace('-', '−'); }
function fmtSci(v) {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e5) return fmtS(v, 4);
  const e = Math.floor(Math.log10(a));
  const m = v / Math.pow(10, e);
  return fmtS(m, 2) + '×10' + String(e).replace('-', '⁻').replace(/[0-9]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]);
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function polarGauss(rng) {
  let u = 0, v = 0, s = 0;
  do { u = 2 * rng() - 1; v = 2 * rng() - 1; s = u * u + v * v; } while (s >= 1 || s === 0);
  const m = Math.sqrt(-2 * Math.log(s) / s);
  return u * m;
}

/* ---------- 线性代数核心（页面与 window.EIGEN 同源实现） ---------- */
function matVec(A, v) { return [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]]; }
function matMul(A, B) {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
  ];
}
function transpose(A) { return [[A[0][0], A[1][0]], [A[0][1], A[1][1]]]; }
function norm(v) { return Math.hypot(v[0], v[1]); }
function unit(v) { const n = norm(v); return n > 0 ? [v[0] / n, v[1] / n] : [0, 0]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
/* 两条直线（无向）的夹角，0–90°：共线（含反向）即 0 */
function lineAngleDeg(a, b) {
  const d = Math.abs(dot(unit(a), unit(b)));
  return Math.acos(clamp(d, 0, 1)) * 180 / Math.PI;
}
/* 有向夹角，0–180° */
function dirAngleDeg(a, b) {
  const d = dot(unit(a), unit(b));
  return Math.acos(clamp(d, -1, 1)) * 180 / Math.PI;
}
/* DIRECTION-PROBE-BEGIN: same vector primitives as the existing course. */
function directionProbe(A, v) {
  if (!Array.isArray(A) || A.length !== 2 || A.some(row => !Array.isArray(row) || row.length !== 2 || row.some(x => !Number.isFinite(x))) || !Array.isArray(v) || v.length !== 2 || v.some(x => !Number.isFinite(x))) throw new TypeError('Finite 2x2 matrix and vector required');
  const length = norm(v);
  if (!(length > 0) || !Number.isFinite(length)) throw new RangeError('A finite nonzero input vector is required');
  const Av = matVec(A, v), imageLength = norm(Av), u = [v[0] / length, v[1] / length];
  const signed = dot(u, Av) / length;
  const projection = [signed * v[0], signed * v[1]];
  const residual = [Av[0] - projection[0], Av[1] - projection[1]], residualNorm = norm(residual);
  const matrixBound = Math.hypot(...A[0], ...A[1]) * length;
  if (![...Av, imageLength, signed, ...projection, ...residual, residualNorm, matrixBound].every(Number.isFinite)) throw new RangeError('Derived values exceed the supported finite range');
  const tolerance = 64 * Number.EPSILON * matrixBound;
  const ang = imageLength === 0 ? null : Math.atan2(Math.abs(u[0] * Av[1] - u[1] * Av[0]), Math.abs(dot(u, Av))) * 180 / Math.PI;
  return { Av, ang, signed, scale: imageLength / length, projection, residual, residualNorm, tolerance, numericallyAligned: residualNorm <= tolerance };
}
/* DIRECTION-PROBE-END */
const DELTA_TOL = 1e-9;
function eig(A) {
  const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
  const tr = a + d, det = a * d - b * c;
  const delta = (a - d) * (a - d) + 4 * b * c;
  const scale = Math.max(1, Math.abs(tr * tr), Math.abs(det));
  const out = { tr, det, delta };
  function eigVec(lam) {
    const r1 = [b, lam - a], r2 = [lam - d, c];
    const n1 = norm(r1), n2 = norm(r2);
    if (Math.max(n1, n2) < 1e-12) return null;
    return unit(n1 >= n2 ? r1 : r2);
  }
  if (delta > DELTA_TOL * scale) {
    const sq = Math.sqrt(delta);
    const l1 = (tr + sq) / 2, l2 = (tr - sq) / 2;
    /* 数值稳：模较大的根直接算，较小的根用 det/λ */
    let lam1 = Math.abs(l1) >= Math.abs(l2) ? l1 : l2;
    let lam2 = lam1 !== 0 ? det / lam1 : (tr - lam1);
    if (Math.abs(lam1) < Math.abs(lam2)) { const tmp = lam1; lam1 = lam2; lam2 = tmp; }
    out.kind = 'two';
    out.lambda1 = lam1; out.lambda2 = lam2;
    out.v1 = eigVec(lam1); out.v2 = eigVec(lam2);
  } else if (delta < -DELTA_TOL * scale) {
    out.kind = 'complex';
    out.alpha = tr / 2;
    out.beta = Math.sqrt(-delta) / 2;
    out.rho = Math.sqrt(out.alpha * out.alpha + out.beta * out.beta);
    out.phiDeg = Math.atan2(out.beta, out.alpha) * 180 / Math.PI;
  } else {
    const lam = tr / 2;
    out.lambda1 = lam; out.lambda2 = lam;
    if (Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12 && Math.abs(a - d) < 1e-12) {
      out.kind = 'scalar';
    } else {
      out.kind = 'defective';
      out.v1 = eigVec(lam);
    }
  }
  return out;
}
/* 幂迭代：返回轨迹（含起点）与逐步夹角误差 */
function powerIter(A, x0, steps, targetDir) {
  const traj = [[x0[0], x0[1]]];
  let x = unit(x0);
  traj[0] = [x[0], x[1]];
  const errs = [lineAngleDeg(x, targetDir)];
  for (let k = 0; k < steps; k++) {
    const y = matVec(A, x);
    const n = norm(y);
    if (n === 0) break;
    x = [y[0] / n, y[1] / n];
    traj.push([x[0], x[1]]);
    errs.push(lineAngleDeg(x, targetDir));
  }
  return { traj, errs };
}

/* ---------- 图例助手（量宽换行，沿用站内做法） ---------- */
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
/* 放在左下角的图例：先量总高，从底部往上排，避免压住标题区 */
function legendBL(ctx, items, w, h) {
  const rows = legendRows(ctx, items, w - 16);
  drawLegendRows(ctx, rows, 8, h - 8 - (rows.length - 1) * 16);
  return rows.length;
}

/* ---------- 二维绘图坐标系（等比缩放：x/y 同 px/单位，角度与垂直关系不失真；
   数据盒 [−rx,rx]×[−ry,ry] 居中 letterbox 适配画布） ---------- */
function makePlot(cv, rx, ry) {
  const RX = rx, RY = ry === undefined ? rx : ry;
  const S = () => {
    const s = Math.min(cv._w / (2 * RX), cv._h / (2 * RY));
    return s > 0 && isFinite(s) ? s : 1; /* 隐藏画布（尺寸 0）时兜底，杜绝 NaN/∞ 传播 */
  };
  return {
    cv,
    S,
    halfW() { return cv._w / 2 / S(); },
    halfH() { return cv._h / 2 / S(); },
    X(x) { return cv._w / 2 + x * S(); },
    Y(y) { return cv._h / 2 - y * S(); },
    invX(px) { return (px - cv._w / 2) / S(); },
    invY(py) { return (cv._h / 2 - py) / S(); },
    grid(ctx, step) {
      const w = cv._w, h = cv._h;
      ctx.clearRect(0, 0, w, h);
      if (!(step > 0)) return;
      const hw = this.halfW(), hh = this.halfH();
      if (!isFinite(hw) || !isFinite(hh)) return;
      ctx.strokeStyle = 'rgba(120,140,170,0.13)'; ctx.lineWidth = 1;
      for (let g = -Math.floor(hw / step) * step; g <= hw + 1e-9; g += step) {
        if (Math.abs(g) < 1e-9) continue;
        ctx.beginPath(); ctx.moveTo(this.X(g), 0); ctx.lineTo(this.X(g), h); ctx.stroke();
      }
      for (let g = -Math.floor(hh / step) * step; g <= hh + 1e-9; g += step) {
        if (Math.abs(g) < 1e-9) continue;
        ctx.beginPath(); ctx.moveTo(0, this.Y(g)); ctx.lineTo(w, this.Y(g)); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(160,180,205,0.4)';
      ctx.beginPath(); ctx.moveTo(this.X(0), 0); ctx.lineTo(this.X(0), h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, this.Y(0)); ctx.lineTo(w, this.Y(0)); ctx.stroke();
    },
    arrow(ctx, p, q, color, width, headScale) {
      const x1 = this.X(p[0]), y1 = this.Y(p[1]), x2 = this.X(q[0]), y2 = this.Y(q[1]);
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const hs = (headScale || 1) * 9;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width || 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - hs * Math.cos(ang - 0.42), y2 - hs * Math.sin(ang - 0.42));
      ctx.lineTo(x2 - hs * Math.cos(ang + 0.42), y2 - hs * Math.sin(ang + 0.42));
      ctx.closePath(); ctx.fill();
    },
    line(ctx, p, q, color, width, dash) {
      ctx.strokeStyle = color; ctx.lineWidth = width || 1.5;
      ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(this.X(p[0]), this.Y(p[1])); ctx.lineTo(this.X(q[0]), this.Y(q[1])); ctx.stroke();
      ctx.setLineDash([]);
    },
    dot(ctx, p, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(this.X(p[0]), this.Y(p[1]), r, 0, Math.PI * 2); ctx.fill();
    },
    /* 过原点沿单位方向 u 的整条直线（画到画布边缘） */
    lineDir(ctx, u, color, width, dash) {
      const k = Math.max(this.halfW(), this.halfH()) * 1.05;
      this.line(ctx, [-u[0] * k, -u[1] * k], [u[0] * k, u[1] * k], color, width, dash);
    }
  };
}
function canvasPos(cv, ev) {
  const r = cv.getBoundingClientRect();
  const src = (ev.touches && ev.touches[0]) || ev;
  return [src.clientX - r.left, src.clientY - r.top];
}
function pointerDrag(cv, onMove) {
  let down = false;
  const start = e => { down = true; onMove(canvasPos(cv, e)); if (e.cancelable) e.preventDefault(); };
  const move = e => { if (!down) return; onMove(canvasPos(cv, e)); if (e.cancelable) e.preventDefault(); };
  const end = () => { down = false; };
  cv.addEventListener('pointerdown', start);
  cv.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  cv.addEventListener('pointerleave', end);
}

/* 常用颜色 */
const C_CYAN = '#6ee7ff', C_ORANGE = '#ffb454', C_PINK = '#ff7a93',
      C_GOOD = '#7ee2a8', C_MUT = '#9aa7b8', C_FAINT = 'rgba(154,167,184,0.55)';

/* ================================================================
   第 0 步：圆变椭圆（钩子）
   ================================================================ */
const S0 = (() => {
  const A = [[2.2, 0.6], [0.6, 1.0]];
  const E = eig(A);
  let mt = 1, playing = false, playDir = -1;
  const cv = $('s0-canvas'), ctx = ctxOf('s0-canvas');
  const plot = makePlot(cv, 3.2);
  const N = 20;
  const us = [];
  for (let i = 0; i < N; i++) { const th = i / N * Math.PI * 2; us.push([Math.cos(th), Math.sin(th)]); }

  function morph(u) {
    const Au = matVec(A, u);
    return [(1 - mt) * u[0] + mt * Au[0], (1 - mt) * u[1] + mt * Au[1]];
  }
  function draw() {
    plot.grid(ctx, 1);
    /* 特征方向参考线（mt>0 时淡显，mt=1 时醒目） */
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.55 * mt;
    plot.lineDir(ctx, E.v1, C_ORANGE, 1.5, [6, 5]);
    plot.lineDir(ctx, E.v2, C_PINK, 1.5, [6, 5]);
    ctx.restore();
    /* 原始单位圆 */
    ctx.strokeStyle = 'rgba(154,167,184,0.5)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const th = i / 96 * Math.PI * 2, p = [Math.cos(th), Math.sin(th)];
      const px = plot.X(p[0]), py = plot.Y(p[1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    /* 变形后的圆周 */
    ctx.strokeStyle = C_CYAN; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const th = i / 96 * Math.PI * 2, p = morph([Math.cos(th), Math.sin(th)]);
      const px = plot.X(p[0]), py = plot.Y(p[1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    /* 20 根均布箭头（青色）：普遍被转走 */
    for (const u of us) {
      plot.arrow(ctx, [0, 0], morph(u), 'rgba(110,231,255,0.55)', 1.6);
    }
    /* 精确特征箭头（正、反两根 × 两方向）：严格沿特征线，只伸缩——
       不用均布网格里「最接近」的一根冒充（网格步长 18°，会差出数度、真的会转） */
    for (const [vdir, col] of [[E.v1, C_ORANGE], [E.v2, C_PINK]]) {
      for (const sgn of [1, -1]) {
        const p = morph([vdir[0] * sgn, vdir[1] * sgn]);
        plot.arrow(ctx, [0, 0], p, col, 3);
        plot.dot(ctx, p, 3.5, col);
      }
    }
    legendBL(ctx, [[t('cv0unit'), C_MUT], [t('cv0eig1'), C_ORANGE], [t('cv0eig2'), C_PINK]], cv._w, cv._h);
    $('s0-t-val').textContent = fmt(mt, 2);
    $('s0-readout').innerHTML = t('s0ro', { l1: fmtS(E.lambda1, 2), l2: fmtS(E.lambda2, 2) });
  }
  const slider = $('s0-t');
  function syncS0PlayBtn() { $('s0-play').textContent = playing ? t('s0pause') : t('s0play'); }
  slider.addEventListener('input', () => { playing = false; syncS0PlayBtn(); mt = parseFloat(slider.value); draw(); });
  $('s0-play').addEventListener('click', () => {
    playing = !playing;
    if (playing) playDir = mt >= 1 ? -1 : 1;
    syncS0PlayBtn();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  animate($('step0'), dt => {
    if (!playing) return;
    mt += playDir * dt * 0.55;
    if (mt >= 1) { mt = 1; playing = false; syncS0PlayBtn(); }
    if (mt <= 0) { mt = 0; playing = false; syncS0PlayBtn(); }
    slider.value = String(mt);
    draw();
  });
  onLangRefresh(draw); onLangRefresh(syncS0PlayBtn); onRefit(draw);
  draw();
  return { A, E, state: () => ({ t: mt, lambda1: E.lambda1, lambda2: E.lambda2 }) };
})();

/* ================================================================
   第 1 步：拖向量找特征方向
   ================================================================ */
const S1 = (() => {
  const PRESETS = [
    [[2, 1], [1, 2]],
    [[3, 0.5], [0.5, 1]],
    [[0.5, 1.5], [1.5, 0.5]]
  ];
  let A = PRESETS[0], E = eig(A);
  let angleDeg = 20;
  let v = [Math.cos(angleDeg * Math.PI / 180), Math.sin(angleDeg * Math.PI / 180)];
  const cv = $('s1-canvas'), ctx = ctxOf('s1-canvas');
  const plot = makePlot(cv, 3.4);
  const cvc = $('s1-curve'), ctxc = ctxOf('s1-curve');

  function metrics() { return { ...directionProbe(A, v), thDeg: angleDeg, curveDeg: ((angleDeg % 180) + 180) % 180 }; }
  function setAngle(degrees) {
    if (!Number.isFinite(degrees)) return;
    angleDeg = clamp(degrees, 0, 360);
    const rad = angleDeg * Math.PI / 180;
    v = [Math.cos(rad), Math.sin(rad)];
    draw();
  }
  function directionKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const step = e.shiftKey ? 1 : .1;
    const next = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? angleDeg - step : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? angleDeg + step : e.key === 'Home' ? 0 : e.key === 'End' ? 360 : null;
    if (next === null) return;
    e.preventDefault(); setAngle(Math.max(0, Math.min(360, next)));
  }
  function draw() {
    const m = metrics();
    plot.grid(ctx, 1);
    /* 单位圆参照 */
    ctx.strokeStyle = 'rgba(154,167,184,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(plot.X(0), plot.Y(0), (plot.X(1) - plot.X(0)), 0, Math.PI * 2); ctx.stroke();
    /* Input line and the transverse remainder, not a second origin-based vector. */
    plot.lineDir(ctx, v, C_FAINT, 1.5, [4, 5]);
    if (!m.numericallyAligned) {
      plot.line(ctx, m.projection, m.Av, C_PINK, 3);
      plot.dot(ctx, m.projection, 3, C_PINK);
    }
    plot.arrow(ctx, [0, 0], m.Av, C_ORANGE, 3);
    plot.arrow(ctx, [0, 0], v, C_CYAN, 3);
    plot.dot(ctx, v, 5, C_CYAN);
    ctx.font = '13px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C_CYAN; ctx.textAlign = 'left';
    ctx.fillText(t('cv1v'), plot.X(v[0]) + 10, plot.Y(v[1]) - 10);
    ctx.fillStyle = C_ORANGE;
    const avx = plot.X(m.Av[0]), avy = plot.Y(m.Av[1]);
    ctx.textAlign = avx > cv._w - 60 ? 'right' : 'left';
    ctx.fillText(t('cv1av'), avx + (avx > cv._w - 60 ? -10 : 10), avy - 10);
    drawCurve(m);
    /* The same state owns native input, drawing and rounded descriptive readouts. */
    $('s1-angle').value = String(angleDeg);
    $('s1-angle-value').textContent = 'θ ≈ ' + fmt(angleDeg, 1) + '°';
    $('s1-angle').setAttribute('aria-valuetext', t('s1angleValue', { th: fmt(angleDeg, 1) }));
    cv.setAttribute('aria-label', t('s1canvas'));
    const residualText = m.residualNorm === 0 ? '0' : m.residualNorm.toExponential(3);
    $('s1-readout').innerHTML = t('s1ro', {
      th: fmtS(m.thDeg, 1), ang: m.ang === null ? '—' : fmtS(m.ang, 3), sc: fmtS(m.scale, 3), lam: fmtS(m.signed, 5), res: residualText
    });
    const found = $('s1-found');
    found.style.display = '';
    found.dataset.classification = m.numericallyAligned ? 'numerical' : m.ang !== null && m.ang < 1 ? 'near' : 'off-line';
    found.textContent = t(m.numericallyAligned ? 's1exact' : m.ang !== null && m.ang < 1 ? 's1found' : 's1near', { lam: fmt(m.signed, 5) });
    document.querySelectorAll('#s1-presets .btn').forEach((button, i) => button.setAttribute('aria-pressed', String(A === PRESETS[i])));
  }
  function drawCurve(m) {
    const w = cvc._w, h = cvc._h;
    ctxc.clearRect(0, 0, w, h);
    const padL = 8, padR = 8, padT = 18, padB = 8;
    const X = th => padL + th / 180 * (w - padL - padR);
    const Y = a => padT + (1 - a / 90) * (h - padT - padB);
    ctxc.font = '12px system-ui, sans-serif'; ctxc.textAlign = 'left'; ctxc.textBaseline = 'alphabetic';
    ctxc.fillStyle = C_MUT;
    ctxc.fillText(t('cv1curveT'), padL, 12);
    ctxc.strokeStyle = 'rgba(120,140,170,0.25)';
    ctxc.beginPath(); ctxc.moveTo(padL, Y(0)); ctxc.lineTo(w - padR, Y(0)); ctxc.stroke();
    /* 曲线 */
    ctxc.strokeStyle = C_CYAN; ctxc.lineWidth = 1.8;
    ctxc.beginPath();
    let pen = false;
    for (let i = 0; i <= 180; i++) {
      const th = i * Math.PI / 180;
      const u = [Math.cos(th), Math.sin(th)];
      const a = directionProbe(A, u).ang;
      if (a === null) { pen = false; continue; }
      const px = X(i), py = Y(a);
      if (!pen) ctxc.moveTo(px, py); else ctxc.lineTo(px, py);
      pen = true;
    }
    ctxc.stroke();
    /* 零点标记（特征方向，折到 [0,180)） */
    ctxc.fillStyle = C_ORANGE;
    for (const dir of [E.v1, E.v2]) {
      if (!dir) continue;
      let th = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;
      if (th < 0) th += 180;
      ctxc.beginPath(); ctxc.arc(X(th), Y(0), 4, 0, Math.PI * 2); ctxc.fill();
    }
    ctxc.font = '11.5px system-ui, sans-serif'; ctxc.fillStyle = C_ORANGE; ctxc.textAlign = 'right';
    ctxc.fillText(t('cv1zero'), w - padR, 12);
    /* 当前 θ 亮点 */
    const th = m.curveDeg;
    ctxc.fillStyle = '#fff';
    if (m.ang !== null) { ctxc.beginPath(); ctxc.arc(X(th), Y(m.ang), 4.5, 0, Math.PI * 2); ctxc.fill(); }
  }
  pointerDrag(cv, ([px, py]) => {
    const dx = plot.invX(px), dy = plot.invY(py);
    if (Math.hypot(dx, dy) < 0.15) return;
    const deg = Math.atan2(dy, dx) * 180 / Math.PI;
    setAngle(deg < 0 ? deg + 360 : deg);
  });
  cv.addEventListener('keydown', directionKey);
  $('s1-angle').addEventListener('input', e => setAngle(Number(e.target.value)));
  $('s1-angle').addEventListener('keydown', directionKey);
  $('s1-reset').addEventListener('click', () => {
    A = PRESETS[0]; E = eig(A);
    document.querySelectorAll('#s1-presets .btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    setAngle(20);
  });
  document.querySelectorAll('#s1-presets .btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#s1-presets .btn').forEach(x => x.classList.toggle('active', x === b));
      A = PRESETS[+b.dataset.preset]; E = eig(A);
      draw();
    });
  });
  onLangRefresh(draw); onRefit(draw);
  draw();
  return { presets: PRESETS, state: () => ({ A, v, metrics: metrics(), E }) };
})();

/* ================================================================
   第 2 步：特征值的性格（四元可调）
   ================================================================ */
const S2 = (() => {
  let A = [[2.2, 0.6], [0.6, 1.0]];
  let spiralOn = false;
  let spiralK = 12, spiralPlaying = false, lastE = null;
  const cv = $('s2-canvas'), ctx = ctxOf('s2-canvas');
  const plot = makePlot(cv, 3.4);
  const cvs = $('s2-spiral'), ctxs = ctxOf('s2-spiral');
  const PRESETS = {
    neg: [[0.5, 1.5], [1.5, 0.5]],
    shrink: [[0.6, 0.2], [0.2, 0.8]],
    shear: [[1, 1], [0, 1]],
    rot: [[0.55, -0.953], [0.953, 0.55]],
    free: [[2.2, 0.6], [0.6, 1.0]]
  };
  const keys = ['a', 'b', 'c', 'd'];

  function spiralPts() {
    let p = [1, 0];
    const pts = [[p[0], p[1]]];
    for (let k = 0; k < 12; k++) { p = matVec(A, p); pts.push([p[0], p[1]]); }
    return pts;
  }
  function drawSpiral() {
    const all = spiralPts();
    const pts = all.slice(0, spiralK + 1);
    /* 缩放按全程落点算：播放途中窗口不跳变 */
    let mx = 0.5;
    all.forEach(p => { mx = Math.max(mx, Math.abs(p[0]), Math.abs(p[1])); });
    const sp = makePlot(cvs, mx * 1.15);
    sp.grid(ctxs, Math.max(0.5, Math.round(mx / 2 * 2) / 2));
    ctxs.strokeStyle = C_CYAN; ctxs.lineWidth = 1.8;
    ctxs.beginPath();
    pts.forEach((p, i) => { const px = sp.X(p[0]), py = sp.Y(p[1]); if (i === 0) ctxs.moveTo(px, py); else ctxs.lineTo(px, py); });
    ctxs.stroke();
    pts.forEach((p, i) => {
      const isHead = i === pts.length - 1 && spiralK > 0;
      sp.dot(ctxs, p, isHead ? 4.5 : (i === 0 ? 4 : 3), isHead ? '#ffffff' : (i === 0 ? C_ORANGE : C_CYAN));
    });
    const last = pts[pts.length - 1];
    $('s2-spiral-ro').innerHTML = t('s2spiralRo', {
      k: spiralK,
      len: fmtS(Math.hypot(last[0], last[1]), 3),
      turn: fmtS(spiralK * (lastE ? lastE.phiDeg : 0), 1)
    });
  }
  function syncSpiralUI() {
    $('s2-spiral-play').textContent = spiralPlaying ? t('s2spiralPause') : (spiralK >= 12 ? t('s2spiralReplay') : t('s2spiralPlay'));
    $('s2-spiral-step').disabled = spiralK >= 12;
  }
  function draw() {
    const E = eig(A);
    lastE = E;
    plot.grid(ctx, 1);
    /* 单位圆 */
    ctx.strokeStyle = 'rgba(154,167,184,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(plot.X(0), plot.Y(0), plot.X(1) - plot.X(0), 0, Math.PI * 2); ctx.stroke();
    /* A 作用后的圆周 */
    ctx.strokeStyle = C_CYAN; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const th = i / 96 * Math.PI * 2, u = [Math.cos(th), Math.sin(th)];
      const p = matVec(A, u);
      const px = plot.X(p[0]), py = plot.Y(p[1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    /* 特征方向线（仅实特征值情形；复数情形一条不画） */
    if (E.kind === 'two') {
      plot.lineDir(ctx, E.v1, C_ORANGE, 2, [7, 5]);
      plot.lineDir(ctx, E.v2, C_PINK, 2, [7, 5]);
      plot.arrow(ctx, [0, 0], [E.v1[0] * E.lambda1, E.v1[1] * E.lambda1], C_ORANGE, 2.5);
      plot.arrow(ctx, [0, 0], [E.v2[0] * E.lambda2, E.v2[1] * E.lambda2], C_PINK, 2.5);
      legendBL(ctx, [[t('cv2line1'), C_ORANGE], [t('cv2line2'), C_PINK]], cv._w, cv._h);
    } else if (E.kind === 'defective') {
      plot.lineDir(ctx, E.v1, C_ORANGE, 2, [7, 5]);
      plot.arrow(ctx, [0, 0], [E.v1[0] * E.lambda1, E.v1[1] * E.lambda1], C_ORANGE, 2.5);
      legendBL(ctx, [[t('cv2line1'), C_ORANGE]], cv._w, cv._h);
    } else if (E.kind === 'complex') {
      ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = C_PINK;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(t('cv2noline'), 10, 16);
    }
    /* 读数牌 */
    const board = $('s2-board'), note = $('s2-note');
    if (E.kind === 'complex') {
      board.innerHTML =
        `<div class="cell">${t('bdDelta', { v: fmtS(E.delta, 3) })}</div>` +
        `<div class="cell">λ = <b>${fmtS(E.alpha, 3)} ± ${fmtS(E.beta, 3)}i</b></div>` +
        `<div class="cell">|λ| = <b>${fmtS(E.rho, 3)}</b></div>`;
      note.innerHTML = t('s2complex', { alpha: fmtS(E.alpha, 3), beta: fmtS(E.beta, 3), ang: fmtS(E.phiDeg, 1), rho: fmtS(E.rho, 3) });
    } else {
      const sum = E.lambda1 + E.lambda2, prod = E.lambda1 * E.lambda2;
      board.innerHTML =
        `<div class="cell">${t('bdL1', { v: fmtS(E.lambda1, 4) })}</div>` +
        `<div class="cell">${t('bdL2', { v: fmtS(E.lambda2, 4) })}</div>` +
        `<div class="cell">${t('bdSum', { s: fmtS(sum, 4), tr: fmtS(E.tr, 4), e: fmtSci(Math.abs(sum - E.tr)) })}</div>` +
        `<div class="cell">${t('bdProd', { p: fmtS(prod, 4), det: fmtS(E.det, 4), e: fmtSci(Math.abs(prod - E.det)) })}</div>` +
        `<div class="cell">${t('bdDelta', { v: fmtS(E.delta, 3) })}</div>`;
      if (E.kind === 'defective') note.innerHTML = t('s2double', { lam: fmtS(E.lambda1, 3) });
      else if (E.kind === 'scalar') note.innerHTML = t('s2scalar', { lam: fmtS(E.lambda1, 3) });
      else note.innerHTML = '';
    }
    /* 螺旋窗：只在复数情形可开 */
    const showSpiralBtn = E.kind === 'complex';
    $('s2-spiral-btn').style.display = showSpiralBtn ? '' : 'none';
    if (!showSpiralBtn) { spiralOn = false; spiralPlaying = false; }
    $('s2-spiral-wrap').style.display = spiralOn && showSpiralBtn ? '' : 'none';
    if (spiralOn && showSpiralBtn) { fitCanvas(cvs); drawSpiral(); }
    syncSpiralUI();
  }
  function syncSliders() {
    const vals = [A[0][0], A[0][1], A[1][0], A[1][1]];
    keys.forEach((k, i) => {
      $('s2-' + k).value = String(vals[i]);
      $('s2-' + k + '-val').textContent = fmt(vals[i], 2);
    });
  }
  keys.forEach((k, i) => {
    $('s2-' + k).addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      A[Math.floor(i / 2)][i % 2] = val;
      $('s2-' + k + '-val').textContent = fmt(val, 2);
      document.querySelectorAll('#s2-presets .btn').forEach(x => x.classList.remove('active'));
      draw();
    });
  });
  document.querySelectorAll('#s2-presets .btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#s2-presets .btn').forEach(x => x.classList.toggle('active', x === b));
      A = PRESETS[b.dataset.q].map(r => r.slice());
      syncSliders();
      draw();
    });
  });
  $('s2-spiral-btn').addEventListener('click', () => {
    spiralOn = !spiralOn;
    if (spiralOn) { spiralK = 0; spiralPlaying = true; }
    else spiralPlaying = false;
    draw(); syncSpiralUI();
  });
  $('s2-spiral-step').addEventListener('click', () => {
    spiralPlaying = false;
    if (spiralK < 12) spiralK++;
    draw(); syncSpiralUI();
  });
  $('s2-spiral-play').addEventListener('click', () => {
    if (!spiralPlaying && spiralK >= 12) spiralK = 0;
    spiralPlaying = !spiralPlaying;
    draw(); syncSpiralUI();
  });
  let spAcc = 0;
  animate($('step2'), dt => {
    if (!spiralOn || !spiralPlaying) return;
    spAcc += dt;
    while (spAcc > 0.45) {
      spAcc -= 0.45;
      if (spiralK < 12) spiralK++;
      draw();
      if (spiralK >= 12) { spiralPlaying = false; syncSpiralUI(); break; }
    }
  });
  onLangRefresh(draw); onLangRefresh(syncSpiralUI); onRefit(draw);
  draw();
  return { presets: PRESETS, spiralPts, state: () => ({ A, E: eig(A), spiralOn, spiralK, spiralPlaying }) };
})();

/* ================================================================
   第 3 步：幂迭代
   ================================================================ */
const S3 = (() => {
  const THETA = 35 * Math.PI / 180;
  const FAIL_A = [[0, 2], [2, 0]];
  let failMode = false;
  let r = 0.33;
  let A, E, traj = [], errs = [], playing = false;
  const rng = mulberry32(424242);
  const cv = $('s3-canvas'), ctx = ctxOf('s3-canvas');
  const plot = makePlot(cv, 1.6);
  const cvc = $('s3-chart'), ctxc = ctxOf('s3-chart');

  function buildA() {
    if (failMode) return FAIL_A.map(row => row.slice());
    const l1 = 2, l2 = 2 * r;
    const cs = Math.cos(THETA), sn = Math.sin(THETA);
    const v1 = [cs, sn], v2 = [-sn, cs];
    return [
      [l1 * v1[0] * v1[0] + l2 * v2[0] * v2[0], l1 * v1[0] * v1[1] + l2 * v2[0] * v2[1]],
      [l1 * v1[1] * v1[0] + l2 * v2[1] * v2[0], l1 * v1[1] * v1[1] + l2 * v2[1] * v2[1]]
    ];
  }
  function targetDir() { return failMode ? unit([1, 1]) : [Math.cos(THETA), Math.sin(THETA)]; }
  function ratioShown() { return failMode ? 1 : Math.abs(E.lambda2 / E.lambda1); }
  function syncS3PlayBtn() { $('s3-play').textContent = playing ? t('s3pause') : t('s3play'); }
  function reset(x0) {
    A = buildA(); E = eig(A);
    const res = powerIter(A, x0 || unit([1, 0.25]), 0, targetDir());
    traj = res.traj; errs = res.errs;
    playing = false; syncS3PlayBtn();
    draw();
  }
  function step() {
    if (traj.length > 400) return;
    const x = traj[traj.length - 1];
    const y = matVec(A, x), n = norm(y);
    if (n === 0) return;
    const nx = [y[0] / n, y[1] / n];
    traj.push(nx);
    errs.push(lineAngleDeg(nx, targetDir()));
    draw();
  }
  function draw() {
    plot.grid(ctx, 0.5);
    /* 单位圆 */
    ctx.strokeStyle = 'rgba(154,167,184,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(plot.X(0), plot.Y(0), plot.X(1) - plot.X(0), 0, Math.PI * 2); ctx.stroke();
    /* 主特征方向线 */
    plot.lineDir(ctx, targetDir(), C_ORANGE, 2, [7, 5]);
    /* 轨迹：逐点连线 + 圆点，新点醒目 */
    if (traj.length > 1) {
      ctx.strokeStyle = 'rgba(110,231,255,0.65)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      traj.forEach((p, i) => { const px = plot.X(p[0]), py = plot.Y(p[1]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
      ctx.stroke();
      traj.forEach((p, i) => plot.dot(ctx, p, i === traj.length - 1 ? 5 : 2.6, i === traj.length - 1 ? '#ffffff' : C_CYAN));
    } else if (traj.length === 1) {
      plot.dot(ctx, traj[0], 5, '#ffffff');
    }
    /* 图例放左上：避开 35° 主方向线扫过的左下角 */
    drawLegendRows(ctx, legendRows(ctx, [[t('cv3main'), C_ORANGE], [t('cv3traj'), C_CYAN]], cv._w - 16), 8, 14);
    drawChart();
    const k = traj.length - 1;
    $('s3-readout').innerHTML = t('s3ro', { k, err: fmtS(errs[k], 3), r: fmtS(ratioShown(), 3) });
    const note = $('s3-note');
    if (failMode) note.innerHTML = t('s3failNote');
    else if (errs[k] < 0.01 && k > 0) note.innerHTML = t('s3conv', { lam: fmtS(E.lambda1, 3) });
    else note.innerHTML = '';
  }
  function drawChart() {
    const w = cvc._w, h = cvc._h;
    ctxc.clearRect(0, 0, w, h);
    const padL = 34, padR = 10, padT = 8, padB = 18;
    const maxK = Math.max(20, errs.length - 1);
    const lo = -6, hi = 2; /* log10(度)：10^-6 .. 100，衰减到底也不贴边 */
    const X = k => padL + k / maxK * (w - padL - padR);
    const Y = e => {
      const lg = Math.log10(Math.max(e, 1e-7));
      return padT + (hi - clamp(lg, lo, hi)) / (hi - lo) * (h - padT - padB);
    };
    ctxc.font = '10.5px system-ui, sans-serif'; ctxc.fillStyle = C_MUT;
    ctxc.textAlign = 'right'; ctxc.textBaseline = 'middle';
    [1, 0, -1, -2, -3, -4, -5, -6].forEach(g => {
      const y = Y(Math.pow(10, g));
      ctxc.strokeStyle = 'rgba(120,140,170,0.16)';
      ctxc.beginPath(); ctxc.moveTo(padL, y); ctxc.lineTo(w - padR, y); ctxc.stroke();
      ctxc.fillText('10' + String(g).replace('-', '⁻').replace(/[0-9]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]), padL - 4, y);
    });
    ctxc.textAlign = 'center'; ctxc.textBaseline = 'top';
    ctxc.fillText('k', padL + (w - padL - padR) / 2, h - 14);
    if (errs.length > 1) {
      ctxc.strokeStyle = C_CYAN; ctxc.lineWidth = 1.8;
      ctxc.beginPath();
      errs.forEach((e, i) => { const px = X(i), py = Y(e); if (i === 0) ctxc.moveTo(px, py); else ctxc.lineTo(px, py); });
      ctxc.stroke();
      ctxc.fillStyle = '#fff';
      ctxc.beginPath(); ctxc.arc(X(errs.length - 1), Y(errs[errs.length - 1]), 3.5, 0, Math.PI * 2); ctxc.fill();
    }
  }
  const slider = $('s3-r');
  /* 等模模式下 r 不适用：置灰滑杆并把读数刷成「不适用」，不留旧值误导读者 */
  function syncRUI() {
    slider.disabled = failMode;
    slider.closest('label').style.opacity = failMode ? '0.5' : '';
    $('s3-r-val').textContent = failMode ? t('s3rNA') : fmt(r, 2);
  }
  slider.addEventListener('input', () => {
    r = parseFloat(slider.value);
    failMode = false;
    syncRUI();
    document.querySelectorAll('#step3 [data-r]').forEach(x => x.classList.toggle('active', Math.abs(parseFloat(x.dataset.r) - r) < 0.005));
    $('s3-fail').classList.remove('active');
    reset(traj[0]);
  });
  document.querySelectorAll('#step3 [data-r]').forEach(b => {
    b.addEventListener('click', () => {
      r = parseFloat(b.dataset.r);
      slider.value = String(r);
      failMode = false;
      syncRUI();
      document.querySelectorAll('#step3 [data-r]').forEach(x => x.classList.toggle('active', x === b));
      $('s3-fail').classList.remove('active');
      reset(traj[0]);
    });
  });
  $('s3-fail').addEventListener('click', () => {
    failMode = true;
    syncRUI();
    document.querySelectorAll('#step3 [data-r]').forEach(x => x.classList.remove('active'));
    $('s3-fail').classList.add('active');
    reset(traj[0]);
  });
  $('s3-rand').addEventListener('click', () => {
    const th = rng() * Math.PI * 2;
    reset([Math.cos(th), Math.sin(th)]);
  });
  pointerDrag(cv, ([px, py]) => {
    const dx = plot.invX(px), dy = plot.invY(py);
    if (Math.hypot(dx, dy) < 0.1) return;
    reset(unit([dx, dy]));
  });
  $('s3-step').addEventListener('click', step);
  $('s3-run').addEventListener('click', () => { for (let i = 0; i < 60; i++) step(); });
  $('s3-play').addEventListener('click', () => {
    playing = !playing;
    syncS3PlayBtn();
  });
  $('s3-reset').addEventListener('click', () => reset(unit([1, 0.25])));
  let acc = 0;
  animate($('step3'), dt => {
    if (!playing) return;
    acc += dt;
    while (acc > 0.16) { acc -= 0.16; step(); if (traj.length > 400) { playing = false; syncS3PlayBtn(); } }
  });
  onLangRefresh(draw); onLangRefresh(syncRUI); onLangRefresh(syncS3PlayBtn); onRefit(draw);
  reset();
  return { buildA, targetDir, state: () => ({ A, E, failMode, r, traj, errs }) };
})();

/* ================================================================
   第 4 步：对称矩阵、主轴与对角化
   ================================================================ */
const S4 = (() => {
  let a = 2.2, m = 1.0, d = 1.0;
  let phi = 0, phiTarget = 0, rotated = false;
  const cv = $('s4-canvas'), ctx = ctxOf('s4-canvas');
  const plot = makePlot(cv, 3.4);

  function cur() {
    const A = [[a, m], [m, d]];
    const E = eig(A);
    let Aprime = null, reconErr = 0;
    if (E.kind === 'two' || E.kind === 'defective' || E.kind === 'scalar') {
      const q1 = E.kind === 'scalar' ? [1, 0] : E.v1;
      const q2 = E.kind === 'two' ? E.v2 : (E.kind === 'scalar' ? [0, 1] : [-q1[1], q1[0]]);
      const Q = [[q1[0], q2[0]], [q1[1], q2[1]]];
      Aprime = matMul(transpose(Q), matMul(A, Q));
      const Lam = [[E.lambda1, 0], [0, E.lambda2]];
      const rec = matMul(Q, matMul(Lam, transpose(Q)));
      reconErr = Math.max(Math.abs(rec[0][0] - A[0][0]), Math.abs(rec[0][1] - A[0][1]),
                           Math.abs(rec[1][0] - A[1][0]), Math.abs(rec[1][1] - A[1][1]));
      return { A, E, Q, Aprime, reconErr, q1, q2 };
    }
    return { A, E, Q: null, Aprime: null, reconErr: 0, q1: null, q2: null };
  }
  function rot(p) {
    const cs = Math.cos(phi), sn = Math.sin(phi);
    return [cs * p[0] - sn * p[1], sn * p[0] + cs * p[1]];
  }
  function draw() {
    const { A, E, Aprime, reconErr, q1, q2 } = cur();
    plot.grid(ctx, 1);
    const pd = E.kind !== 'complex' && E.lambda2 > 0.02;
    if (pd) {
      /* 二次型等高线椭圆 xᵀAx = L */
      for (const L of [1, 2.2, 3.8]) {
        ctx.strokeStyle = 'rgba(110,231,255,0.5)'; ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i <= 128; i++) {
          const th = i / 128 * Math.PI * 2;
          const u = [Math.cos(th), Math.sin(th)];
          const q = u[0] * (A[0][0] * u[0] + A[0][1] * u[1]) + u[1] * (A[1][0] * u[0] + A[1][1] * u[1]);
          if (q <= 0) continue;
          const rr = Math.sqrt(L / q);
          const p = rot([u[0] * rr, u[1] * rr]);
          const px = plot.X(p[0]), py = plot.Y(p[1]);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    if (q1) {
      const r1 = rot(q1), r2 = rot(q2);
      plot.lineDir(ctx, r1, C_ORANGE, 2, [7, 5]);
      plot.lineDir(ctx, r2, C_PINK, 2, [7, 5]);
      plot.arrow(ctx, [0, 0], r1, C_ORANGE, 3);
      plot.arrow(ctx, [0, 0], r2, C_PINK, 3);
      ctx.font = '13px system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = C_ORANGE;
      ctx.fillText(rotated ? 'u (λ₁)' : t('cv4axis1'), plot.X(r1[0]) + 9, plot.Y(r1[1]) - 9);
      ctx.fillStyle = C_PINK;
      const lx = plot.X(r2[0]);
      ctx.textAlign = lx > cv._w - 90 ? 'right' : 'left';
      ctx.fillText(rotated ? 'v (λ₂)' : t('cv4axis2'), lx + (lx > cv._w - 90 ? -9 : 9), plot.Y(r2[1]) - 9);
    }
    /* 读数牌 */
    const board = $('s4-board');
    if (E.kind !== 'complex' && q1) {
      const kap = E.lambda2 !== 0 ? Math.abs(E.lambda1 / E.lambda2) : Infinity;
      board.innerHTML =
        `<div class="cell">${t('bdL1', { v: fmtS(E.lambda1, 4) })}</div>` +
        `<div class="cell">${t('bdL2', { v: fmtS(E.lambda2, 4) })}</div>` +
        `<div class="cell">${t('bdDot', { v: fmtSci(Math.abs(dot(q1, q2))) })}</div>` +
        `<div class="cell">${t('bdKappa', { v: fmtS(kap, 3) })}</div>` +
        `<div class="cell">${t('bdRecon', { v: fmtSci(reconErr) })}</div>`;
    } else board.innerHTML = '';
    const mats = $('s4-mats'), note = $('s4-note');
    const mtx = M => `<span class="mtx">${fmtS(M[0][0], 3)}&nbsp;&nbsp;${fmtS(M[0][1], 3)}<br>${fmtS(M[1][0], 3)}&nbsp;&nbsp;${fmtS(M[1][1], 3)}</span>`;
    if (Aprime) {
      mats.innerHTML = t('s4matA') + ' ' + mtx(A) +
        (rotated ? '<br>' + t('s4matA2') + ' ' + mtx(Aprime) : '');
      note.innerHTML = (rotated ? t('s4cross', { v: fmtSci(Aprime[0][1]) }) : '') + (pd ? '' : t('s4notpd'));
    } else { mats.innerHTML = ''; note.innerHTML = ''; }
  }
  function bindSlider(id, fn) {
    $(id).addEventListener('input', e => {
      fn(parseFloat(e.target.value));
      $(id + '-val').textContent = fmt(parseFloat(e.target.value), 2);
      draw();
    });
  }
  bindSlider('s4-a', v => { a = v; });
  bindSlider('s4-m', v => { m = v; });
  bindSlider('s4-d', v => { d = v; });
  $('s4-rot').addEventListener('click', () => {
    const { E } = cur();
    if (!E.v1) return;
    rotated = !rotated;
    const th = Math.atan2(E.v1[1], E.v1[0]);
    phiTarget = rotated ? -th : 0;
    $('s4-rot').textContent = rotated ? t('s4unrotBtn') : t('s4rotBtn');
  });
  animate($('step4'), () => {
    if (Math.abs(phi - phiTarget) < 0.002) { if (phi !== phiTarget) { phi = phiTarget; draw(); } return; }
    phi += (phiTarget - phi) * 0.12;
    draw();
  });
  onLangRefresh(() => { $('s4-rot').textContent = rotated ? t('s4unrotBtn') : t('s4rotBtn'); draw(); });
  onRefit(draw);
  draw();
  return { cur, state: () => ({ A: [[a, m], [m, d]], phi, rotated }) };
})();

/* ================================================================
   第 5 步：PCA — 数据的主成分
   数据：mulberry32(20261016)，u~N(0,1.7)、w~N(0,0.5)（polar 高斯），
   沿 30° 合成 60 点；页面减去样本均值中心化；
   协方差与投影方差口径统一 1/(n−1)。
   ================================================================ */
const S5 = (() => {
  const rng = mulberry32(20261016);
  const N = 60, TH = 30 * Math.PI / 180;
  const raw = [];
  for (let i = 0; i < N; i++) {
    const u = polarGauss(rng) * 1.7, w = polarGauss(rng) * 0.5;
    raw.push([u * Math.cos(TH) - w * Math.sin(TH), u * Math.sin(TH) + w * Math.cos(TH)]);
  }
  const mean = [raw.reduce((s, p) => s + p[0], 0) / N, raw.reduce((s, p) => s + p[1], 0) / N];
  const data = raw.map(p => [p[0] - mean[0], p[1] - mean[1]]);
  let cov = [[0, 0], [0, 0]];
  for (const p of data) {
    cov[0][0] += p[0] * p[0]; cov[0][1] += p[0] * p[1];
    cov[1][0] += p[1] * p[0]; cov[1][1] += p[1] * p[1];
  }
  cov = cov.map(row => row.map(x => x / (N - 1)));
  const E = eig(cov);
  let axis = unit([1, 0.15]);
  let showPC = false;
  const cv = $('s5-canvas'), ctx = ctxOf('s5-canvas');
  const plot = makePlot(cv, 5.4, 4.4);

  function varAlong(dir) {
    let s = 0;
    for (const p of data) { const pr = dot(p, dir); s += pr * pr; }
    return s / (N - 1);
  }
  function draw() {
    plot.grid(ctx, 1);
    /* 投影线（淡）+ 数据点 */
    ctx.strokeStyle = 'rgba(110,231,255,0.13)'; ctx.lineWidth = 1;
    for (const p of data) {
      const pr = dot(p, axis);
      const q = [axis[0] * pr, axis[1] * pr];
      ctx.beginPath(); ctx.moveTo(plot.X(p[0]), plot.Y(p[1])); ctx.lineTo(plot.X(q[0]), plot.Y(q[1])); ctx.stroke();
    }
    for (const p of data) plot.dot(ctx, p, 3, 'rgba(232,237,244,0.85)');
    /* 用户轴 */
    plot.lineDir(ctx, axis, C_CYAN, 2.5);
    plot.arrow(ctx, [0, 0], [axis[0] * 4.3, axis[1] * 4.3], C_CYAN, 3);
    ctx.font = '13px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C_CYAN; ctx.textAlign = 'left';
    const tip = [axis[0] * 4.3, axis[1] * 4.3];
    ctx.textAlign = plot.X(tip[0]) > cv._w - 80 ? 'right' : 'left';
    ctx.fillText(t('cv5axis'), plot.X(tip[0]) + (plot.X(tip[0]) > cv._w - 80 ? -8 : 8), plot.Y(tip[1]) - 12);
    /* 主成分 */
    if (showPC && E.v1) {
      plot.lineDir(ctx, E.v1, C_ORANGE, 2, [8, 5]);
      plot.lineDir(ctx, E.v2, C_PINK, 2, [8, 5]);
      plot.arrow(ctx, [0, 0], [E.v1[0] * 4.0, E.v1[1] * 4.0], C_ORANGE, 2.5);
      plot.arrow(ctx, [0, 0], [E.v2[0] * 2.2, E.v2[1] * 2.2], C_PINK, 2.5);
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillStyle = C_ORANGE; ctx.textAlign = 'left';
      ctx.fillText(t('cv5pc1'), plot.X(E.v1[0] * 4.0) + 8, plot.Y(E.v1[1] * 4.0) + 14);
      ctx.fillStyle = C_PINK;
      ctx.fillText(t('cv5pc2'), plot.X(E.v2[0] * 2.2) + 8, plot.Y(E.v2[1] * 2.2) - 12);
    }
    const thDeg = Math.atan2(axis[1], axis[0]) * 180 / Math.PI;
    $('s5-readout').innerHTML = t('s5ro', { th: fmtS(thDeg, 1), v: fmtS(varAlong(axis), 3), l1: fmtS(E.lambda1, 3) });
    const pc = $('s5-pc');
    if (showPC) {
      pc.style.display = '';
      pc.innerHTML = t('s5pc', {
        l1: fmtS(E.lambda1, 4), l2: fmtS(E.lambda2, 4),
        share: fmt(E.lambda1 / (E.lambda1 + E.lambda2) * 100, 1),
        pv: fmtS(varAlong(E.v1), 4)
      });
    } else pc.style.display = 'none';
  }
  pointerDrag(cv, ([px, py]) => {
    const dx = plot.invX(px), dy = plot.invY(py);
    if (Math.hypot(dx, dy) < 0.2) return;
    axis = unit([dx, dy]);
    draw();
  });
  cv.addEventListener('keydown', e => {
    const step = e.shiftKey ? 0.01 : 0.05;
    let th = Math.atan2(axis[1], axis[0]);
    if (e.key === 'ArrowLeft') th += step;
    else if (e.key === 'ArrowRight') th -= step;
    else return;
    e.preventDefault();
    axis = [Math.cos(th), Math.sin(th)];
    draw();
  });
  $('s5-show').addEventListener('click', () => {
    showPC = !showPC;
    if (showPC && E.v1) axis = E.v1.slice();
    $('s5-show').textContent = showPC ? t('s5hide') : t('s5show');
    $('s5-show').classList.toggle('active', showPC);
    draw();
  });
  onLangRefresh(() => { $('s5-show').textContent = showPC ? t('s5hide') : t('s5show'); draw(); });
  onRefit(draw);
  draw();
  return { data, mean, cov, E, varAlong, state: () => ({ axis, showPC }) };
})();

/* ================================================================
   第 6 步：终章 — 马尔可夫链稳态与 PageRank
   图：A→{B,C}、B→{C}、C→{A,D}、D→{C}；列随机 M（列=出发点）。
   稳态理论值 (2/9, 1/9, 4/9, 2/9)；页面另用高斯消元独立求解对账。
   ================================================================ */
const S6 = (() => {
  /* M[i][j]：从 j 出发落到 i 的概率（行=到达，列=出发）。
     列A：到 B、C 各 0.5；列B：到 C 为 1；列C：到 A、D 各 0.5；列D：到 C 为 1。 */
  const M = [
    [0, 0, 0.5, 0],
    [0.5, 0, 0, 0],
    [0.5, 1, 0, 1],
    [0, 0, 0.5, 0]
  ];
  function solveSteady() {
    /* 解 (M − I)π = 0 且 Σπ = 1：把最后一行换成全 1、右端换成 (0,0,0,1)，高斯消元 */
    const n = 4;
    const A = M.map((row, i) => row.map((x, j) => x - (i === j ? 1 : 0)));
    const b = [0, 0, 0, 0];
    A[n - 1] = [1, 1, 1, 1]; b[n - 1] = 1;
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      [A[col], A[piv]] = [A[piv], A[col]];
      [b[col], b[piv]] = [b[piv], b[col]];
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = A[r][col] / A[col][col];
        for (let cc = col; cc < n; cc++) A[r][cc] -= f * A[col][cc];
        b[r] -= f * b[col];
      }
    }
    return A.map((row, i) => b[i] / row[i]);
  }
  const steady = solveSteady();
  let dist = [0.25, 0.25, 0.25, 0.25], k = 0, playing = false;
  const rng = mulberry32(777);
  const cv = $('s6-canvas'), ctx = ctxOf('s6-canvas');
  const POS = [[0.24, 0.74], [0.76, 0.78], [0.74, 0.26], [0.24, 0.22]]; /* A B C D，归一化 (x, y-up) */
  const NAMES = ['A', 'B', 'C', 'D'];
  const EDGES = [ /* [from, to, curve] */
    [0, 1, 0], [1, 2, 0], [3, 2, -0.16], [2, 3, -0.16],
    [0, 2, 0.20], [2, 0, 0.20]
  ];
  function px(nx) { return nx * cv._w; }
  function py(ny) { return (1 - ny) * cv._h; }
  function nodeR(w) { return 13 + 40 * w; }
  function draw() {
    const w = cv._w, h = cv._h;
    ctx.clearRect(0, 0, w, h);
    /* 边（曲线箭头） */
    for (const [f, tt, curve] of EDGES) {
      const p1 = POS[f], p2 = POS[tt];
      const x1 = px(p1[0]), y1 = py(p1[1]), x2 = px(p2[0]), y2 = py(p2[1]);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const cxp = mx + (-dy / len) * curve * len, cyp = my + (dx / len) * curve * len;
      const r2 = nodeR(dist[tt]);
      /* 箭头终点：二分求曲线上距目标节点中心恰 r2+4 的点 */
      const q = tt2 => [
        (1 - tt2) * (1 - tt2) * x1 + 2 * (1 - tt2) * tt2 * cxp + tt2 * tt2 * x2,
        (1 - tt2) * (1 - tt2) * y1 + 2 * (1 - tt2) * tt2 * cyp + tt2 * tt2 * y2
      ];
      let lo = 0, hi = 1;
      for (let it = 0; it < 24; it++) {
        const mid = (lo + hi) / 2, p = q(mid);
        if (Math.hypot(p[0] - x2, p[1] - y2) > r2 + 4) lo = mid; else hi = mid;
      }
      const [ex, ey] = q((lo + hi) / 2);
      const ang = Math.atan2(ey - cyp, ex - cxp);
      ctx.strokeStyle = 'rgba(110,231,255,0.5)'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cxp, cyp, ex, ey); ctx.stroke();
      ctx.fillStyle = 'rgba(110,231,255,0.8)';
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 10 * Math.cos(ang - 0.42), ey - 10 * Math.sin(ang - 0.42));
      ctx.lineTo(ex - 10 * Math.cos(ang + 0.42), ey - 10 * Math.sin(ang + 0.42));
      ctx.closePath(); ctx.fill();
    }
    /* 节点 */
    NAMES.forEach((nm, i) => {
      const x = px(POS[i][0]), y = py(POS[i][1]), r = nodeR(dist[i]);
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
      grad.addColorStop(0, '#23405a'); grad.addColorStop(1, '#16283d');
      ctx.fillStyle = grad;
      ctx.strokeStyle = C_CYAN; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8edf4';
      ctx.font = 'bold 17px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(nm, x, y - 8);
      ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = C_ORANGE;
      /* 小节点（权重小）时数值放圆外下方，避免溢出圆界 */
      ctx.fillText(fmt(dist[i], 3), x, r < 21 ? y + r + 11 : y + 11);
    });
    ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = C_MUT;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(t('cv6from'), 10, cv._h - 12);
    /* 读数 */
    const dL1 = dist.reduce((s, x, i) => s + Math.abs(x - steady[i]), 0);
    $('s6-readout').innerHTML = t('s6ro', {
      k, dist: dist.map(x => fmt(x, 4)).join(', '), d: fmtSci(dL1)
    });
    $('s6-steady').innerHTML = t('s6steady', { dist: steady.map(x => fmt(x, 4)).join(', ') });
    const sums = [0, 1, 2, 3].map(j => M[0][j] + M[1][j] + M[2][j] + M[3][j]);
    $('s6-colsum').innerHTML = t('s6colsum', { sums: sums.map(x => fmt(x, 1)).join(', ') });
  }
  function step() {
    const nd = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) nd[i] += M[i][j] * dist[j];
    dist = nd; k++;
    draw();
  }
  function syncS6PlayBtn() { $('s6-play').textContent = playing ? t('s6pause') : t('s6play'); }
  function setInit(kind) {
    playing = false; syncS6PlayBtn();
    k = 0;
    if (kind === 'uni') dist = [0.25, 0.25, 0.25, 0.25];
    else if (kind === 'A') dist = [1, 0, 0, 0];
    else if (kind === 'D') dist = [0, 0, 0, 1];
    else {
      const r = [rng(), rng(), rng(), rng()];
      const s = r.reduce((x, y) => x + y, 0);
      dist = r.map(x => x / s);
    }
    document.querySelectorAll('#s6-inits .btn').forEach(x => x.classList.toggle('active', x.dataset.init === kind));
    draw();
  }
  document.querySelectorAll('#s6-inits .btn').forEach(b => b.addEventListener('click', () => setInit(b.dataset.init)));
  $('s6-step').addEventListener('click', step);
  $('s6-run').addEventListener('click', () => { for (let i = 0; i < 80; i++) step(); });
  $('s6-reset').addEventListener('click', () => setInit('uni'));
  $('s6-play').addEventListener('click', () => {
    playing = !playing;
    syncS6PlayBtn();
  });
  let acc = 0;
  animate($('step6'), dt => {
    if (!playing) return;
    acc += dt;
    while (acc > 0.35) { acc -= 0.35; step(); }
  });
  onLangRefresh(draw); onLangRefresh(syncS6PlayBtn); onRefit(draw);
  draw();
  return {
    M, steady, solveSteady,
    colSums: () => [0, 1, 2, 3].map(j => M[0][j] + M[1][j] + M[2][j] + M[3][j]),
    iterate: (x0, n) => {
      let x = x0.slice();
      const traj = [x.slice()];
      for (let s = 0; s < n; s++) {
        const nd = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) nd[i] += M[i][j] * x[j];
        x = nd; traj.push(x.slice());
      }
      return traj;
    },
    state: () => ({ dist, k, steady })
  };
})();

/* ================================================================
   window.EIGEN — 评审对账接口（全部走与页面相同的实现）
   ================================================================ */
window.EIGEN = {
  eig, matVec, matMul, transpose, dot, norm, unit, lineAngleDeg, dirAngleDeg, directionProbe,
  powerIter,
  mulberry32, polarGauss,
  s0: S0, s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6,
  pca: { data: S5.data, mean: S5.mean, cov: S5.cov, eig: S5.E, varAlong: S5.varAlong },
  markov: { M: S6.M, steady: S6.steady, colSums: S6.colSums, iterate: S6.iterate }
};
