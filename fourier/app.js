'use strict';
/* 傅里叶变换交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D） */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 双语：文案一律经 i18n.js 的 t() 取值；语言切换后由各步骤注册的
   refresher 重贴「有状态」的动态文本（按钮状态、读数等），Canvas 文字在逐帧
   绘制时直接调 tr()，天然即时切换 ---------- */
const tr = (key, vars) => window.KI18N.t(key, vars);
const langRefreshers = [];
window.__onLangChange = () => { langRefreshers.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); };

/* ---------- 画布适配（DPR）：CSS 尺寸与 backing store 尺寸严格分离 ----------
   CSS 高度只在首次适配时从 HTML 的 height 属性读取一次（此时该属性尚未被任何
   代码改写），存入 dataset 后永远只从 dataset 读。绝不能读回 cv.height 或
   getAttribute('height')：给 cv.height 赋值会同步改写属性，读回就会把设备像素
   当成 CSS 高度，resize 时逐次累乘（第 2 轮评审必须级 1 的根因）。
   本函数对同一画布反复调用必须幂等：CSS 高度恒定、布局不漂移。 */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) {
    const hAttr = parseInt(cv.getAttribute('height'), 10);
    cv.dataset.cssH = hAttr ? String(hAttr) : '';
  }
  if (cv.dataset.cssH) cv.style.height = cv.dataset.cssH + 'px'; // 每次钉回同一个值
  const w = cv.clientWidth;
  const h = cv.clientHeight || parseInt(cv.dataset.cssH || '0', 10);
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;   // 尺寸没变就不赋值，避免无谓清空画布
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv._w = w; cv._h = h;
  return ctx;
}
const allCanvases = [];
function ctxOf(id) { const cv = $(id); allCanvases.push(cv); return fitCanvas(cv); }
/* 静态绘制型步骤（如第 5 步）在全局重适配后需要重绘，注册到这里 */
const refitHooks = [];
function onRefit(fn) { refitHooks.push(fn); }

/* ---------- 动画调度：只跑视口内的步骤 ---------- */
const animators = []; // {el, fn(dt)}
const visibleSet = new Set();
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) visibleSet.add(e.target); else visibleSet.delete(e.target); });
}, { threshold: 0.08 });
function animate(el, fn) { animators.push({ el, fn }); io.observe(el); }
let lastTs = 0;
function loop(ts) {
  const dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
  lastTs = ts;
  for (const a of animators) if (visibleSet.has(a.el)) { try { a.fn(dt); } catch (err) { console.error(err); } }
  requestAnimationFrame(loop);
}

/* ---------- 导航高亮 ---------- */
(function nav() {
  const links = document.querySelectorAll('.nav-step');
  const nio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.dataset.nav === e.target.dataset.step));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(s => nio.observe(s));
})();

/* =========================================================
   傅里叶图形：轮廓点 → 归一化 → 等弧长重采样 → 横/竖分别 DFT
   每个坐标写成 f(t) = mean + Σ R_k·cos(k·t − φ_k)，一项 = 一个圆
   ========================================================= */
const SAMPLES = 360, KMAX = 60;
class FourierShape {
  constructor(rawPts) {
    // rawPts: [[x,y],...] 任意坐标系、任意尺度（闭合轮廓，不必重复首点）
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (const [x, y] of rawPts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const size = Math.max(maxX - minX, maxY - minY) || 1;
    this.size = 2; // 归一化后图形尺寸（最大边长）= 2
    const pts = rawPts.map(([x, y]) => [(x - cx) * 2 / size, (y - cy) * 2 / size]);
    let bMinX = 1e9, bMaxX = -1e9, bMinY = 1e9, bMaxY = -1e9;
    for (const [x, y] of pts) { bMinX = Math.min(bMinX, x); bMaxX = Math.max(bMaxX, x); bMinY = Math.min(bMinY, y); bMaxY = Math.max(bMaxY, y); }
    this.bw = bMaxX - bMinX; this.bh = bMaxY - bMinY; // 归一化包围盒宽/高（双链布局自动缩放用）
    // 等弧长重采样（含闭合段）
    const seg = [], cum = [0];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      seg.push(L); cum.push(cum[i] + L);
    }
    const total = cum[cum.length - 1] || 1;
    this.samples = [];
    let si = 0;
    for (let j = 0; j < SAMPLES; j++) {
      const d = j / SAMPLES * total;
      while (si < seg.length - 1 && cum[si + 1] < d) si++;
      const a = pts[si], b = pts[(si + 1) % pts.length];
      const f = seg[si] > 0 ? (d - cum[si]) / seg[si] : 0;
      this.samples.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    }
    // 横、竖坐标分别做实信号傅里叶级数
    this.mx = this.samples.reduce((s, p) => s + p[0], 0) / SAMPLES;
    this.my = this.samples.reduce((s, p) => s + p[1], 0) / SAMPLES;
    this.harm = []; // {k, rx, px, ry, py}
    for (let k = 1; k <= KMAX; k++) {
      let ax = 0, bx = 0, ay = 0, by = 0;
      for (let j = 0; j < SAMPLES; j++) {
        const ang = TAU * k * j / SAMPLES, c = Math.cos(ang), s = Math.sin(ang);
        ax += this.samples[j][0] * c; bx += this.samples[j][0] * s;
        ay += this.samples[j][1] * c; by += this.samples[j][1] * s;
      }
      ax *= 2 / SAMPLES; bx *= 2 / SAMPLES; ay *= 2 / SAMPLES; by *= 2 / SAMPLES;
      // a·cos + b·sin = R·cos(kt − φ)，R=√(a²+b²), φ=atan2(b,a)
      this.harm.push({
        k,
        rx: Math.hypot(ax, bx), px: Math.atan2(bx, ax),
        ry: Math.hypot(ay, by), py: Math.atan2(by, ay)
      });
    }
  }
  /* 用前 n 个谐波在参数 t∈[0,2π) 处重构坐标（归一化坐标系） */
  pointAt(n, t, out) {
    let x = this.mx, y = this.my;
    const m = Math.min(n, this.harm.length);
    for (let i = 0; i < m; i++) {
      const h = this.harm[i];
      x += h.rx * Math.cos(h.k * t - h.px);
      y += h.ry * Math.cos(h.k * t - h.py);
    }
    out[0] = x; out[1] = y; return out;
  }
  /* 误差：重构点与原轮廓点的均方根误差 / 图形尺寸 ×100% */
  errorPct(n) {
    let se = 0; const p = [0, 0];
    for (let j = 0; j < SAMPLES; j++) {
      this.pointAt(n, TAU * j / SAMPLES, p);
      const dx = p[0] - this.samples[j][0], dy = p[1] - this.samples[j][1];
      se += dx * dx + dy * dy;
    }
    return Math.sqrt(se / SAMPLES) / this.size * 100;
  }
}

/* =========================================================
   双链可视化：上方圆链管 x，左方圆链管 y，投影虚线交点 = 笔尖
   x 链第 k 个圆的矢量角 = kt − φx，其尖端横坐标 = x(t)
   y 链第 k 个圆的矢量角 = π/2 − (kt − φy)，其尖端纵坐标 = y(t)
   ========================================================= */
class DualChainViz {
  constructor(cv, opts) {
    this.cv = cv; this.ctx = fitCanvas(cv); allCanvases.push(cv);
    this.shape = null; this.n = 25; this.t = 0; this.trail = [];
    this.period = (opts && opts.period) || 16; // 描一圈秒数
    this.onN = (opts && opts.onN) || null;
    this.drawing = null; // 正在手绘的点列（画布坐标）
  }
  setShape(shape) { this.shape = shape; this.trail = []; if (this.onN) this.onN(this.n, this.shape ? this.shape.errorPct(this.n) : null); }
  setN(n, keepTrail) { this.n = n; if (!keepTrail) this.trail = []; if (this.onN) this.onN(n, this.shape ? this.shape.errorPct(n) : null); }
  /* 按包围盒自动布局：每串链的全部圆都含在「原点 ± Σ半径」的圆盘内，
     图形含在其归一化包围盒内；取缩放使 链条带 + 图形 在两个方向都放得下，
     再算全场并集、必要时二次收缩并整体平移居中——保证任何 N、任何画布尺寸都不裁切。 */
  layout(W, H) {
    const S = this.shape, m = Math.min(this.n, S.harm.length);
    let Rx = 0, Ry = 0;
    for (let i = 0; i < m; i++) { Rx += S.harm[i].rx; Ry += S.harm[i].ry; }
    const bw = Math.max(S.bw || 2, 0.2), bh = Math.max(S.bh || 2, 0.2);
    const mgn = 8, gap = 12;
    let s = Math.min((H - 2 * mgn - gap) / (2 * Rx + bh), (W - 2 * mgn - gap) / (2 * Ry + bw), Math.min(W, H) * 0.50);
    s = Math.max(s, 4);
    const place = sc => ({
      Yx: mgn + Rx * sc,
      Xy: mgn + Ry * sc,
      Cx: mgn + 2 * Ry * sc + gap + bw / 2 * sc,
      Cy: mgn + 2 * Rx * sc + gap + bh / 2 * sc
    });
    const union = (P, sc) => {
      const xs = [P.Cx - bw / 2 * sc, P.Cx + bw / 2 * sc, P.Cx + S.mx * sc - Rx * sc, P.Cx + S.mx * sc + Rx * sc, P.Xy - Ry * sc, P.Xy + Ry * sc];
      const ys = [P.Cy - bh / 2 * sc, P.Cy + bh / 2 * sc, P.Yx - Rx * sc, P.Yx + Rx * sc, P.Cy + S.my * sc - Ry * sc, P.Cy + S.my * sc + Ry * sc];
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    };
    let P = place(s), u = union(P, s);
    // 并集仍越界就按比例收缩并重算（迭代至多 3 次，防 scale 放宽后裁切回退）
    for (let it = 0; it < 3 && (u[2] - u[0] > W - 2 * mgn || u[3] - u[1] > H - 2 * mgn); it++) {
      s *= Math.min((W - 2 * mgn) / (u[2] - u[0]), (H - 2 * mgn) / (u[3] - u[1]));
      P = place(s); u = union(P, s);
    }
    const dx = (W - (u[2] - u[0])) / 2 - u[0], dy = (H - (u[3] - u[1])) / 2 - u[1];
    P.Cx += dx; P.Xy += dx; P.Cy += dy; P.Yx += dy;
    return { s, Cx: P.Cx, Cy: P.Cy, Xy: P.Xy, Yx: P.Yx };
  }
  draw(dt) {
    const { ctx, cv } = this; const W = cv._w, H = cv._h;
    ctx.clearRect(0, 0, W, H);
    if (this.drawing && this.drawing.length) {
      ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2; ctx.beginPath();
      this.drawing.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.stroke();
      ctx.fillStyle = '#9aa7b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(tr('dcDrawHint'), W / 2, 28);
      return;
    }
    if (!this.shape) {
      ctx.fillStyle = '#9aa7b8'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(tr('dcEmpty1'), W / 2, H / 2 - 10);
      ctx.fillText(tr('dcEmpty2'), W / 2, H / 2 + 18);
      return;
    }
    this.t += dt * TAU / this.period;
    if (this.t >= TAU) { this.t -= TAU; this.trail = []; }
    const t = this.t, S = this.shape;
    const L = this.layout(W, H), scale = L.s;
    const toPx = (x, y) => [L.Cx + x * scale, L.Cy + y * scale];
    // 原轮廓（淡色参照）
    ctx.strokeStyle = 'rgba(154,167,184,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath();
    S.samples.forEach((p, i) => { const q = toPx(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
    ctx.closePath(); ctx.stroke();
    // —— x 链（上方）——
    const xOrg = [L.Cx + S.mx * scale, L.Yx];
    let tip = xOrg.slice();
    ctx.lineWidth = 1;
    const m = Math.min(this.n, S.harm.length);
    for (let i = 0; i < m; i++) {
      const h = S.harm[i], r = h.rx * scale, a = h.k * t - h.px;
      ctx.strokeStyle = 'rgba(110,231,255,0.40)';
      ctx.beginPath(); ctx.arc(tip[0], tip[1], Math.max(r, 0.4), 0, TAU); ctx.stroke();
      const nt = [tip[0] + r * Math.cos(a), tip[1] + r * Math.sin(a)];
      ctx.strokeStyle = 'rgba(110,231,255,0.85)';
      ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(nt[0], nt[1]); ctx.stroke();
      tip = nt;
    }
    const xTip = tip;
    // —— y 链（左方）——
    const yOrg = [L.Xy, L.Cy + S.my * scale];
    tip = yOrg.slice();
    for (let i = 0; i < m; i++) {
      const h = S.harm[i], r = h.ry * scale, a = Math.PI / 2 - (h.k * t - h.py);
      ctx.strokeStyle = 'rgba(255,122,147,0.40)';
      ctx.beginPath(); ctx.arc(tip[0], tip[1], Math.max(r, 0.4), 0, TAU); ctx.stroke();
      const nt = [tip[0] + r * Math.cos(a), tip[1] + r * Math.sin(a)];
      ctx.strokeStyle = 'rgba(255,122,147,0.85)';
      ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(nt[0], nt[1]); ctx.stroke();
      tip = nt;
    }
    const yTip = tip;
    // 笔尖 = (xTip.x, yTip.y)
    const pen = [xTip[0], yTip[1]];
    // 投影虚线
    ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(110,231,255,0.75)';
    ctx.beginPath(); ctx.moveTo(xTip[0], xTip[1]); ctx.lineTo(pen[0], pen[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,122,147,0.75)';
    ctx.beginPath(); ctx.moveTo(yTip[0], yTip[1]); ctx.lineTo(pen[0], pen[1]); ctx.stroke();
    ctx.setLineDash([]);
    // 轨迹
    this.trail.push(pen);
    if (this.trail.length > 4000) this.trail.splice(0, this.trail.length - 4000);
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.2; ctx.beginPath();
    this.trail.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.stroke();
    // 笔尖与链尖
    ctx.fillStyle = '#ffb454';
    ctx.beginPath(); ctx.arc(pen[0], pen[1], 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6ee7ff';
    ctx.beginPath(); ctx.arc(xTip[0], xTip[1], 3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ff7a93';
    ctx.beginPath(); ctx.arc(yTip[0], yTip[1], 3, 0, TAU); ctx.fill();
    // 标签：固定角落 + 半透明底，避免与圆弧重叠
    const label = (text, x, y, color, align) => {
      ctx.font = '13px sans-serif';
      const w = ctx.measureText(text).width, x0 = align === 'right' ? x - w : x;
      ctx.fillStyle = 'rgba(10,14,20,0.72)';
      ctx.fillRect(x0 - 6, y - 15, w + 12, 21);
      ctx.fillStyle = color; ctx.textAlign = align;
      ctx.fillText(text, x, y); ctx.textAlign = 'left';
    };
    label(tr('dcXLabel'), W - 12, 24, '#6ee7ff', 'right');
    label(tr('dcYLabel'), 12, H - 14, '#ff7a93', 'left');
  }
}

/* ---------- 预设图形（轮廓点集，y 向下） ---------- */
function heartPts() {
  const pts = [];
  for (let i = 0; i < 72; i++) {
    const t = i / 72 * TAU;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([x / 17, -y / 17]);
  }
  return pts;
}
function starPts() {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 === 0 ? 0.95 : 0.42;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}
function personPts() {
  // 姜饼小人式轮廓折线（x 右、y 下）
  return [
    [-0.07, -0.38], [-0.16, -0.48], [-0.19, -0.62], [-0.12, -0.75], [0, -0.79],
    [0.12, -0.75], [0.19, -0.62], [0.16, -0.48], [0.07, -0.38],
    [0.34, -0.30], [0.45, -0.13], [0.37, -0.02], [0.16, -0.12],
    [0.14, 0.28], [0.34, 0.72], [0.34, 0.85], [0.12, 0.85], [0.05, 0.38],
    [-0.05, 0.38], [-0.12, 0.85], [-0.34, 0.85], [-0.34, 0.72],
    [-0.14, 0.28], [-0.16, -0.12], [-0.37, -0.02], [-0.45, -0.13], [-0.34, -0.30]
  ];
}

/* ---------- 步骤 0：钩子（双链自动播放小人） ---------- */
(function step0() {
  const viz = new DualChainViz($('s0-canvas'), {
    period: 18,
    onN: (n, err) => { $('s0-n-readout').textContent = n; $('s0-error').textContent = err == null ? '—' : err.toFixed(2) + ' %'; }
  });
  viz.setShape(new FourierShape(personPts()));
  const slider = $('s0-n');
  // 用户操作前 N 自动缓慢递增循环（1→40→1，三角波节奏），复现原 demo 的震撼 ramp；一拖滑杆立即接管
  let auto = true, phase = 0, curN = 1;
  viz.setN(1);
  slider.value = 1; $('s0-n-val').textContent = '1';
  slider.addEventListener('input', e => { auto = false; $('s0-n-val').textContent = e.target.value; viz.setN(+e.target.value); });
  $('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));
  animate($('step0'), dt => {
    if (auto) {
      phase += dt;
      const T = 22, ph = (phase % T) / T;
      const tri = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      const n = 1 + Math.round(tri * 39);
      if (n !== curN) {
        const wrap = n === 1 && curN > 1;
        curN = n;
        slider.value = n; $('s0-n-val').textContent = String(n);
        viz.setN(n, true); // 递增期间保留笔尖轨迹，让轮廓随 N 增长逐渐浮现
        if (wrap) viz.trail = [];
      }
    }
    viz.draw(dt);
  });
})();

/* ---------- 步骤 1：单个正弦波 ---------- */
(function step1() {
  const cv = $('s1-canvas'), ctx = ctxOf('s1-canvas');
  const S = { f: 1, a: 1, p: 0, t: 0, frozen: false };
  const upd = () => {
    $('s1-freq-val').textContent = S.f.toFixed(1) + ' Hz';
    $('s1-amp-val').textContent = S.a.toFixed(2);
    $('s1-phase-val').textContent = S.p.toFixed(2) + ' rad';
    $('s1-eq').textContent = `y = ${S.a.toFixed(2)} · sin(2π · ${S.f.toFixed(1)} · t + ${S.p.toFixed(2)})`;
  };
  $('s1-freq').addEventListener('input', e => { S.f = +e.target.value; upd(); });
  $('s1-amp').addEventListener('input', e => { S.a = +e.target.value; upd(); });
  $('s1-phase').addEventListener('input', e => { S.p = +e.target.value; upd(); });
  upd();
  $('s1-freeze').addEventListener('click', () => {
    S.frozen = !S.frozen;
    $('s1-freeze').textContent = tr(S.frozen ? 's1unfreeze' : 's1freeze');
  });
  animate($('step1'), dt => {
    if (!S.frozen) S.t += dt;
    const W = cv._w, H = cv._h, mid = H / 2, unit = H * 0.38;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#2b3547'; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let px = 0; px <= W; px += 2) {
      const x = px / W * 4; // 显示 4 秒窗口
      const y = S.a * Math.sin(TAU * S.f * (x - S.t % (1 / S.f)) + S.p);
      const py = mid - y * unit;
      px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.lineWidth = 1;
    if (S.frozen) {
      // t=0 参考线：显示窗口内时间坐标为 0 的位置；该处点高 = A·sin(相位)，冻结后拖相位可看清整条波左右平移
      const off = (S.t % (1 / S.f)) / 4 * W;
      if (off > 2 && off < W - 2) {
        ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(232,237,244,0.45)';
        ctx.beginPath(); ctx.moveTo(off, 10); ctx.lineTo(off, H - 10); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#ffb454';
        ctx.beginPath(); ctx.arc(off, mid - S.a * Math.sin(S.p) * unit, 4.5, 0, TAU); ctx.fill();
        ctx.fillStyle = '#9aa7b8'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('t = 0', off + 6, 22);
      }
    }
  });
  // 声音：WebAudio
  let ac = null, osc = null, gain = null;
  $('s1-sound').addEventListener('click', () => {
    if (osc) { try { osc.stop(); } catch (e) {} osc = null; $('s1-sound').textContent = tr('s1sound'); return; }
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    osc = ac.createOscillator(); gain = ac.createGain();
    osc.type = 'sine'; osc.frequency.value = 220 * S.f;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.12 * S.a + 0.02, ac.currentTime + 0.05);
    osc.connect(gain); gain.connect(ac.destination); osc.start();
    $('s1-sound').textContent = tr('s1soundStop');
    const iv = setInterval(() => {
      if (!osc) { clearInterval(iv); return; }
      osc.frequency.value = 220 * S.f; gain.gain.value = 0.12 * S.a + 0.02;
    }, 120);
  });
  langRefreshers.push(() => {
    $('s1-freeze').textContent = tr(S.frozen ? 's1unfreeze' : 's1freeze');
    $('s1-sound').textContent = tr(osc ? 's1soundStop' : 's1sound');
  });
})();

/* ---------- 步骤 2：波叠加 ---------- */
(function step2() {
  const big = $('s2-canvas'), bctx = ctxOf('s2-canvas');
  const minis = [1, 2, 3].map(i => ({ cv: $('s2-mini' + i), ctx: ctxOf('s2-mini' + i) }));
  const colors = ['#6ee7ff', '#ffb454', '#ff7a93'];
  const comps = [
    { f: 1, a: 1 }, { f: 2, a: 0.5 }, { f: 3, a: 0.33 }
  ];
  let t = 0;
  function syncLabels() {
    comps.forEach((c, i) => {
      $('s2-f' + (i + 1) + '-val').textContent = c.f;
      $('s2-a' + (i + 1) + '-val').textContent = c.a.toFixed(2);
      $('s2-f' + (i + 1)).value = c.f; $('s2-a' + (i + 1)).value = c.a;
    });
  }
  comps.forEach((c, i) => {
    $('s2-f' + (i + 1)).addEventListener('input', e => { c.f = +e.target.value; syncLabels(); });
    $('s2-a' + (i + 1)).addEventListener('input', e => { c.a = +e.target.value; syncLabels(); });
  });
  $('s2-preset-square').addEventListener('click', () => {
    comps[0] = { f: 1, a: 1 }; comps[1] = { f: 3, a: 0.33 }; comps[2] = { f: 5, a: 0.2 }; syncLabels();
  });
  $('s2-preset-random').addEventListener('click', () => {
    comps.forEach(c => { c.f = 1 + Math.floor(Math.random() * 8); c.a = Math.round((0.15 + Math.random() * 0.85) * 20) / 20; });
    syncLabels();
  });
  syncLabels();
  function wavePath(ctx, W, H, fn, unit) {
    ctx.beginPath();
    for (let px = 0; px <= W; px += 2) {
      const x = px / W * TAU * 2;
      const py = H / 2 - fn(x) * unit;
      px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  animate($('step2'), dt => {
    t += dt;
    minis.forEach((m, i) => {
      const c = comps[i], W = m.cv._w, H = m.cv._h;
      m.ctx.clearRect(0, 0, W, H);
      m.ctx.strokeStyle = '#2b3547'; m.ctx.beginPath(); m.ctx.moveTo(0, H / 2); m.ctx.lineTo(W, H / 2); m.ctx.stroke();
      m.ctx.strokeStyle = colors[i]; m.ctx.lineWidth = 2;
      wavePath(m.ctx, W, H, x => c.a * Math.sin(c.f * (x - t * 1.2)), H * 0.36);
      m.ctx.lineWidth = 1;
    });
    const W = big._w, H = big._h;
    bctx.clearRect(0, 0, W, H);
    bctx.strokeStyle = '#2b3547'; bctx.beginPath(); bctx.moveTo(0, H / 2); bctx.lineTo(W, H / 2); bctx.stroke();
    // 分量与总和同一尺度：单位按总和可能达到的最大高度（Σ振幅）反推，
    // 任一点的总和高度恰等于三条分量高度之和，可直接量验（不再 ÷2 缩放）
    const sumA = comps.reduce((s, c) => s + c.a, 0);
    const unitB = (H * 0.5 - 10) / Math.max(sumA, 1);
    comps.forEach((c, i) => {
      bctx.strokeStyle = colors[i] + '55'; bctx.lineWidth = 1.4;
      wavePath(bctx, W, H, x => c.a * Math.sin(c.f * (x - t * 1.2)), unitB);
    });
    bctx.strokeStyle = '#ffffff'; bctx.lineWidth = 2.6;
    wavePath(bctx, W, H, x => comps.reduce((s, c) => s + c.a * Math.sin(c.f * (x - t * 1.2)), 0), unitB);
    bctx.lineWidth = 1;
  });
})();

/* ---------- 步骤 3：旋转的圆 ---------- */
(function step3() {
  const cv = $('s3-canvas'), ctx = ctxOf('s3-canvas');
  const S = { theta: 0, speed: 1, r: 1, playing: true };
  $('s3-speed').addEventListener('input', e => { S.speed = +e.target.value; $('s3-speed-val').textContent = S.speed.toFixed(1) + '×'; });
  $('s3-r').addEventListener('input', e => { S.r = +e.target.value; $('s3-r-val').textContent = S.r.toFixed(2); });
  $('s3-toggle').addEventListener('click', () => {
    S.playing = !S.playing;
    $('s3-toggle').textContent = tr(S.playing ? 's3pause' : 's3resume');
  });
  langRefreshers.push(() => { $('s3-toggle').textContent = tr(S.playing ? 's3pause' : 's3resume'); });
  animate($('step3'), dt => {
    const W = cv._w, H = cv._h;
    if (S.playing) S.theta += dt * TAU * 0.35 * S.speed;
    const th = S.theta;
    ctx.clearRect(0, 0, W, H);
    if (W >= 600) {
      /* —— 宽屏：圆在左、波在右（原布局）—— */
      const mid = H / 2;
      const R = Math.min(H * 0.40, 130) * S.r;
      const cx = Math.min(W * 0.22, 190), waveX = cx + Math.min(H * 0.40, 130) + 46;
      const tipX = cx + R * Math.cos(th), tipY = mid - R * Math.sin(th);
      // 圆与直径
      ctx.strokeStyle = '#3d4a61'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, mid, R, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, mid - R); ctx.lineTo(cx, mid + R); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R, mid); ctx.lineTo(cx + R, mid); ctx.stroke();
      // 半径矢量
      ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(cx, mid); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.fillStyle = '#6ee7ff'; ctx.beginPath(); ctx.arc(tipX, tipY, 4.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e8edf4'; ctx.beginPath(); ctx.arc(cx, mid, 3, 0, TAU); ctx.fill();
      // 纵轴投影点
      const projY = tipY;
      ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(cx, projY, 4, 0, TAU); ctx.fill();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,180,84,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(cx, projY); ctx.stroke();
      // 投影连线到波形
      ctx.strokeStyle = 'rgba(255,180,84,0.85)';
      ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(waveX, projY); ctx.stroke();
      ctx.setLineDash([]);
      // 波形：解析绘制 v = sin(θ − px·2π/周期像素)，与笔尖严格同相
      const per = 240;
      ctx.strokeStyle = '#2b3547'; ctx.beginPath(); ctx.moveTo(waveX, mid); ctx.lineTo(W - 6, mid); ctx.stroke();
      ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let px = 0; px <= W - waveX - 6; px += 2) {
        const v = Math.sin(th - px * TAU / per);
        const x = waveX + px, y = mid - v * R;
        px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      // 标签
      ctx.fillStyle = '#9aa7b8'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(tr('s3circleLabel'), cx - R, 20);
      ctx.fillText(tr('s3waveLabel'), waveX, 20);
    } else {
      /* —— 窄屏：圆在上、波在下，上下共用同一把高度标尺 ——
         圆按可用宽度反推半径并居中；波占满整宽。投影关系靠一条竖直虚线表达：
         圆心竖直直径上的投影点（橙）与波形上正对圆心的点同高对齐。 */
      const Rmax = Math.min(60, (H - 60) / 4, W / 2 - 16);
      const R = Rmax * S.r;
      const cx = W / 2, cy1 = 24 + Rmax;
      const waveX0 = 10, waveW = W - 20;
      const waveTop = cy1 + Rmax + 12, waveBottom = H - 24;
      const waveMid = (waveTop + waveBottom) / 2;
      const tipX = cx + R * Math.cos(th), tipY = cy1 - R * Math.sin(th);
      const projY = tipY; // 投影点在竖直直径上：(cx, tipY)
      const waveY = waveMid - R * Math.sin(th); // 波形在 x=cx 处的高度，与投影点同值
      // 圆与直径
      ctx.strokeStyle = '#3d4a61'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy1, R, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy1 - R); ctx.lineTo(cx, cy1 + R); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R, cy1); ctx.lineTo(cx + R, cy1); ctx.stroke();
      // 半径矢量
      ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(cx, cy1); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.fillStyle = '#6ee7ff'; ctx.beginPath(); ctx.arc(tipX, tipY, 4.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e8edf4'; ctx.beginPath(); ctx.arc(cx, cy1, 3, 0, TAU); ctx.fill();
      // 投影：笔尖 → 直径上的投影点（横虚线），投影点 → 波形同高点（竖虚线）
      ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(cx, projY, 4, 0, TAU); ctx.fill();
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,180,84,0.6)';
      ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(cx, projY); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,180,84,0.85)';
      ctx.beginPath(); ctx.moveTo(cx, projY); ctx.lineTo(cx, waveY); ctx.stroke();
      ctx.setLineDash([]);
      // 波形：x = cx 处恰好是当前时刻（v = sin θ），向两侧按相位展开
      const per = 220;
      ctx.strokeStyle = '#2b3547'; ctx.beginPath(); ctx.moveTo(waveX0, waveMid); ctx.lineTo(waveX0 + waveW, waveMid); ctx.stroke();
      ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let px = 0; px <= waveW; px += 2) {
        const v = Math.sin(th - (px - (cx - waveX0)) * TAU / per);
        const x = waveX0 + px, y = waveMid - v * R;
        px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(cx, waveY, 4, 0, TAU); ctx.fill();
      // 标签（顶部条与底部条，避开圆与波）
      ctx.fillStyle = '#9aa7b8'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(tr('s3circleLabel'), 10, 18);
      ctx.fillText(tr('s3waveLabel'), 10, H - 8);
    }
    // 读数
    $('s3-theta').textContent = (th % TAU).toFixed(2);
    $('s3-y').textContent = Math.sin(th).toFixed(2);
  });
})();

/* ---------- 步骤 4：epicycles 逼近方波 ---------- */
(function step4() {
  const cv = $('s4-canvas'), ctx = ctxOf('s4-canvas');
  let N = 3, t = 0;
  function overshootPct(n) {
    let mx = 0;
    for (let i = 0; i <= 4000; i++) {
      const x = i / 4000 * TAU; let s = 0;
      for (let j = 0; j < n; j++) { const k = 2 * j + 1; s += Math.sin(k * x) / k; }
      s *= 4 / Math.PI; if (s > mx) mx = s;
    }
    return (mx - 1) / 2 * 100; // 按跳变高度 2 计
  }
  function updN() {
    $('s4-n-val').textContent = N;
    $('s4-overshoot').textContent = tr('s4overText', { v: overshootPct(N).toFixed(1) });
  }
  $('s4-n').addEventListener('input', e => { N = +e.target.value; updN(); });
  updN();
  langRefreshers.push(updN);
  animate($('step4'), dt => {
    t += dt * 2.4;
    const W = cv._w, H = cv._h, mid = H / 2;
    // 半径（方波谐波：奇次、1/k，整体 4/π）
    const radii = [];
    let sumR = 0;
    for (let j = 0; j < N; j++) { const k = 2 * j + 1; const r = 4 / (Math.PI * k); radii.push({ k, r }); sumR += r; }
    /* 布局：先按宽屏公式（圆链左、波形右）算；波形区不足 170px 时改上下堆叠
       （圆链在上居中、波形占满整宽），保证窄屏下波形完整在画布内。 */
    let unit = Math.min(105, (W * 0.46) / sumR, H * 0.30);
    let ox = 24 + sumR * unit, oy = mid;
    let waveX = ox + sumR * unit + 26, waveMid = mid, waveRight = W - 6;
    let stacked = false;
    if (waveRight - waveX < 170) {
      stacked = true;
      const chainZone = H * 0.46;
      oy = 8 + chainZone / 2; ox = W / 2;
      const waveTop = oy + chainZone / 2 + 10, waveBottom = H - 26;
      waveMid = (waveTop + waveBottom) / 2;
      const discLim = Math.min(W / 2 - 12, chainZone / 2 - 6); // 链上所有圆含在原点 ±Σ半径的圆盘内
      const waveHalf = (waveBottom - waveTop) / 2;
      unit = Math.min(64, discLim / sumR, waveHalf / 1.25);
      waveX = 12; waveRight = W - 12;
    }
    const waveW = waveRight - waveX;
    let x = ox, y = oy;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#2b3547'; ctx.beginPath(); ctx.moveTo(waveX, waveMid); ctx.lineTo(waveRight, waveMid); ctx.stroke();
    for (const { k, r } of radii) {
      const rr = r * unit, a = k * t;
      ctx.strokeStyle = 'rgba(110,231,255,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke();
      const nx = x + rr * Math.cos(a), ny = y - rr * Math.sin(a);
      ctx.strokeStyle = 'rgba(110,231,255,0.9)';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
      x = nx; y = ny;
    }
    ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
    // 投影虚线：笔尖 → 波形区左端「当前时刻」点（两处高度同值；宽屏时 oy=waveMid，虚线自然水平）
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,180,84,0.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(waveX, waveMid - (oy - y)); ctx.stroke(); ctx.setLineDash([]);
    // 波形区：解析绘制——目标方波与实际部分和严格同相（相位 ph = t − px·2π/周期）
    const per = waveW / 2.2;
    ctx.strokeStyle = 'rgba(170,188,212,0.9)'; ctx.lineWidth = 1.3; ctx.setLineDash([7, 5]); ctx.beginPath();
    for (let px = 0; px <= waveW; px += 2) {
      const ph = t - px * TAU / per;
      const py = waveMid - (Math.sin(ph) >= 0 ? 1 : -1) * unit;
      px === 0 ? ctx.moveTo(waveX + px, py) : ctx.lineTo(waveX + px, py);
    }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let px = 0; px <= waveW; px += 2) {
      const ph = t - px * TAU / per;
      let s = 0;
      for (const { k } of radii) s += Math.sin(k * ph) / k;
      const py = waveMid - s * (4 / Math.PI) * unit;
      px === 0 ? ctx.moveTo(waveX + px, py) : ctx.lineTo(waveX + px, py);
    }
    ctx.stroke(); ctx.lineWidth = 1;
    if (stacked) {
      ctx.fillStyle = '#9aa7b8'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(tr('s4chainLabel'), 10, 20);
      ctx.fillText(tr('s4waveLabel'), 10, H - 10);
    }
  });
})();

/* ---------- 步骤 5：频谱（真 DFT） ---------- */
(function step5() {
  const tctx = ctxOf('s5-time'), sctx = ctxOf('s5-spec');
  const M = 512, KB = 20;
  const waves = {
    square: x => Math.sin(x) >= 0 ? 1 : -1,
    triangle: x => 2 / Math.PI * Math.asin(Math.sin(x)),
    saw: x => x / Math.PI - 1,
    ecg: x => {
      const u = x / TAU;
      const g = (c, w, a) => a * Math.exp(-((u - c) * (u - c)) / (w * w));
      return g(0.16, 0.028, 0.14) - g(0.285, 0.009, 0.20) + g(0.31, 0.0075, 1.0) - g(0.345, 0.011, 0.28) + g(0.55, 0.045, 0.30) - 0.06;
    }
  };
  let cur = 'square';
  function draw() {
    const fn = waves[cur];
    // 时域（画两个周期）
    const tc = $('s5-time'), W = tc._w, H = tc._h, mid = H / 2, unit = H * 0.36;
    tctx.clearRect(0, 0, W, H);
    tctx.strokeStyle = '#2b3547'; tctx.beginPath(); tctx.moveTo(0, mid); tctx.lineTo(W, mid); tctx.stroke();
    tctx.strokeStyle = '#6ee7ff'; tctx.lineWidth = 2.2; tctx.beginPath();
    for (let px = 0; px <= W; px += 1.5) {
      const x = px / W * TAU * 2;
      const py = mid - fn(x % TAU) * unit;
      px === 0 ? tctx.moveTo(px, py) : tctx.lineTo(px, py);
    }
    tctx.stroke(); tctx.lineWidth = 1;
    // 频域：对一个周期采样做 DFT
    const mags = [];
    for (let k = 1; k <= KB; k++) {
      let re = 0, im = 0;
      for (let j = 0; j < M; j++) {
        const v = fn(TAU * j / M), a = TAU * k * j / M;
        re += v * Math.cos(a); im -= v * Math.sin(a);
      }
      mags.push({ k, mag: 2 / M * Math.hypot(re, im) });
    }
    const sc = $('s5-spec'), W2 = sc._w, H2 = sc._h;
    const maxMag = Math.max(...mags.map(m => m.mag), 0.001);
    const base = H2 - 42, top = 14, bw = W2 / KB;
    sctx.clearRect(0, 0, W2, H2);
    sctx.strokeStyle = '#2b3547'; sctx.beginPath(); sctx.moveTo(0, base); sctx.lineTo(W2, base); sctx.stroke();
    mags.forEach((m, i) => {
      const h = m.mag / maxMag * (base - top);
      sctx.fillStyle = '#ffb454';
      sctx.fillRect(i * bw + bw * 0.22, base - h, bw * 0.56, h);
      sctx.fillStyle = '#9aa7b8'; sctx.font = '10.5px sans-serif'; sctx.textAlign = 'center';
      sctx.fillText(m.k, i * bw + bw / 2, base + 14);
    });
    sctx.fillStyle = '#9aa7b8'; sctx.font = '11.5px sans-serif'; sctx.textAlign = 'left';
    sctx.fillText(tr('s5axisNote'), 4, base + 32);
    const top3 = [...mags].sort((a, b) => b.mag - a.mag).slice(0, 3);
    $('s5-top').textContent = tr('s5topPrefix') + top3.map(m => tr('s5topItem', { k: m.k, m: m.mag.toFixed(2) })).join(tr('s5topJoiner'));
  }
  ['square', 'triangle', 'saw', 'ecg'].forEach(name => {
    $('s5-wave-' + name).addEventListener('click', () => {
      cur = name;
      document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
      $('s5-wave-' + name).classList.add('active');
      draw();
    });
  });
  draw();
  onRefit(draw); // 全局重适配（fitCanvas 会清空画布）后按新尺寸重绘
  langRefreshers.push(draw); // 语言切换后重绘轴注与读数
})();

/* ---------- 步骤 6：终章（双链 + 手绘） ---------- */
(function step6() {
  const status = $('s6-status');
  let statusKey = 's6statusHeart'; // 当前状态文案的字典键，语言切换时按键重贴
  const setStatus = k => { statusKey = k; status.textContent = tr(k); };
  const viz = new DualChainViz($('s6-canvas'), {
    period: 16,
    onN: (n, err) => { $('s6-n-readout').textContent = n; $('s6-error').textContent = err == null ? '—' : err.toFixed(2) + ' %'; }
  });
  viz.setShape(new FourierShape(heartPts()));
  viz.setN(25);
  setStatus('s6statusHeart'); // 首次渲染即按当前语言（字典版文案）
  $('s6-n').addEventListener('input', e => { $('s6-n-val').textContent = e.target.value; viz.setN(+e.target.value); });
  $('s6-heart').addEventListener('click', () => { viz.setShape(new FourierShape(heartPts())); setStatus('s6statusHeart'); });
  $('s6-star').addEventListener('click', () => { viz.setShape(new FourierShape(starPts())); setStatus('s6statusStar'); });
  $('s6-person').addEventListener('click', () => { viz.setShape(new FourierShape(personPts())); setStatus('s6statusPerson'); });
  $('s6-clear').addEventListener('click', () => { viz.setShape(null); setStatus('s6statusCleared'); });
  langRefreshers.push(() => setStatus(statusKey));
  // 手绘
  const cv = $('s6-canvas');
  let drawing = false;
  const pos = e => {
    const r = cv.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - r.left, src.clientY - r.top];
  };
  function start(e) { drawing = true; viz.drawing = [pos(e)]; e.preventDefault(); }
  function move(e) {
    if (!drawing) return;
    const p = pos(e), last = viz.drawing[viz.drawing.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 3) viz.drawing.push(p);
    e.preventDefault();
  }
  function end() {
    if (!drawing) return;
    drawing = false;
    const pts = viz.drawing; viz.drawing = null;
    if (pts && pts.length >= 10) {
      viz.setShape(new FourierShape(pts));
      setStatus('s6statusDrew');
    }
  }
  cv.addEventListener('pointerdown', start);
  cv.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  animate($('step6'), dt => viz.draw(dt));
})();

/* ---------- 尺寸变化时重适配全部画布 ---------- */
let rzTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(rzTimer);
  rzTimer = setTimeout(() => {
    allCanvases.forEach(cv => fitCanvas(cv));
    refitHooks.forEach(fn => { try { fn(); } catch (err) { console.error(err); } });
  }, 200);
});

requestAnimationFrame(loop);
