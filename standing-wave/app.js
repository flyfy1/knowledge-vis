'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';
const white = '#e8edf4', lineCol = '#2b3547';

/* ================= PURE-BEGIN ================= */
/* 计算层（唯一真值源）：合位移一律由两列波方程实算，
   y = A·sin(ωt − kx) + A·sin(ωt + kx)；解析式 2A·cos(kx)·sin(ωt) 只作对照。
   弦（两端固定）的两列波是入射波与固定端翻转 π 的反射波：
   y = A·sin(ωt − kx) − A·sin(ωt + kx)，包络 2A·|sin(kx)|。
   视觉层与计算层同源：画布上每一点都由这些函数逐点实算，无预录帧、无独立视觉层。 */
const AMP = 1, PERIOD = 4;                    // 振幅 A、周期 T（秒），与干涉页同口径
const STR_L = 6, STR_V = 3;                   // 第 3/4 步定长弦：L、v（模拟设定）
function waveK(lam) { return 2 * Math.PI / lam; }
function omega() { return 2 * Math.PI / PERIOD; }
/* 自由绳：第 0/1 步 */
function yRight(tt, x, lam) { return AMP * Math.sin(omega() * tt - waveK(lam) * x); }
function yLeft(tt, x, lam) { return AMP * Math.sin(omega() * tt + waveK(lam) * x); }
function ySumRope(tt, x, lam) { return yRight(tt, x, lam) + yLeft(tt, x, lam); }
function yAnalytic(tt, x, lam) { return 2 * AMP * Math.cos(waveK(lam) * x) * Math.sin(omega() * tt); }
function ampRope(x, lam) { return 2 * AMP * Math.abs(Math.cos(waveK(lam) * x)); }
function classifyPt(x, lam) {
  const a = ampRope(x, lam);
  if (a < 1e-9) return 'node';
  if (Math.abs(a - 2 * AMP) < 1e-9) return 'anti';
  return 'mid';
}
/* 弦：入射 + 固定端反射（相位翻转 π → 取负） */
function yInc(tt, x, lam) { return AMP * Math.sin(omega() * tt - waveK(lam) * x); }
function yRefl(tt, x, lam) { return -AMP * Math.sin(omega() * tt + waveK(lam) * x); }
function yStr(tt, x, lam) { return yInc(tt, x, lam) + yRefl(tt, x, lam); }
function ampStr(x, lam) { return 2 * AMP * Math.abs(Math.sin(waveK(lam) * x)); }
/* 模式判定：q = L/(λ/2)；|q − round(q)| ≤ 0.02 且 round(q) ≥ 1 → 成立 */
function modeQ(L, lam) { return L / (lam / 2); }
function modeN(L, lam) {
  const q = modeQ(L, lam), n = Math.round(q);
  return (n >= 1 && Math.abs(q - n) <= 0.02) ? n : 0;
}
function lamN(L, n) { return 2 * L / n; }
function fN(v, L, n) { return v / lamN(L, n); }
function f1(v, L) { return v / (2 * L); }
function modeShape(x, n, L) { return Math.sin(n * Math.PI * x / L); }
/* 共振响应（示意模型）：峰位 = 实算 f_n；峰高 H、峰宽 W 是示意参数（小阻尼定值），非实测 */
const RESP_H = [1, 0.8, 0.65, 0.55, 0.48], RESP_W = 0.03, RESP_BASE = 0.03;
function respAmp(f) {
  let a = RESP_BASE;
  for (let n = 1; n <= 5; n++) {
    const fn = fN(STR_V, STR_L, n), d = (f - fn) / RESP_W;
    a += RESP_H[n - 1] / (1 + d * d);
  }
  return a;
}
function respMode(f) { // 贡献最大的模式与其峰值贡献
  let best = 1, bestV = -1;
  for (let n = 1; n <= 5; n++) {
    const fn = fN(STR_V, STR_L, n), d = (f - fn) / RESP_W;
    const v = RESP_H[n - 1] / (1 + d * d);
    if (v > bestV) { bestV = v; best = n; }
  }
  return { n: best, peak: bestV };
}
function nearestNat(f) {
  let best = 1, bd = Infinity;
  for (let n = 1; n <= 5; n++) { const d = Math.abs(f - fN(STR_V, STR_L, n)); if (d < bd) { bd = d; best = n; } }
  return best;
}
function fmtNum(v) {
  if (!isFinite(v)) return '∞';
  const r = Math.round(v * 100) / 100;
  const s = Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : r.toFixed(2);
  return s.replace('-', '−');
}
function fmtHz(v) {
  const r = Math.round(v * 1000) / 1000;
  let s = r.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('-', '−');
}
/* ================= PURE-END ================= */

const S = {
  s0: { lam: 2, px: 1, view: 'sum', t: 0, playing: true, visible: false, hist: [] },
  s1: { lam: 2, px: 1, env: true, t: 0, playing: true, visible: false, hist: [] },
  s2: { L: 6, lam: 4, t: 0, playing: true, visible: false },
  s3: { n: 1, cmp: false, t: 0, playing: true, visible: false },
  s4: { f: 0.25, t: 0, playing: true, visible: false },
  s5: { picked: { q1: null, q2: null, q3: null, q4: null }, locked: { q1: false, q2: false, q3: false, q4: false } }
};
/* 自测正确选项：一律借 PURE 实算判定，不写死 */
const QUIZ = (() => {
  const kinds = ['node', 'anti', 'mid'];
  const q1 = kinds.indexOf(classifyPt(1, 4));                       // λ=4, x=1 → 波节
  const lamOpts = [lamN(6, 1), 6, 3];
  const q2 = lamOpts.indexOf(lamN(6, 1));                           // 最长波长 λ₁=2L=12
  let nodeStill = true, compAlive = 0;                              // 题 3：波节处合位移恒 0 而分量不为 0 → 「没波到」为假
  for (let tt = 0; tt <= 8; tt += 0.05) {
    if (Math.abs(ySumRope(tt, 0.5, 2)) > 1e-9) nodeStill = false;  // λ=2 时 x=λ/4=0.5 是波节
    compAlive = Math.max(compAlive, Math.abs(yRight(tt, 0.5, 2)));
  }
  const q3 = (nodeStill && compAlive > 0.5) ? 1 : 0;                // 选项 0=对、1=错
  const ratioOpts = [2, 1, 0.5];
  const q4 = ratioOpts.indexOf(f1(STR_V, STR_L / 2) / f1(STR_V, STR_L)); // L 减半 → 2 倍
  return { q1, q2, q3, q4 };
})();
function ro(id, text) { $(id).textContent = text; }
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '300';
  cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.cssH);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw; if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cv._w = w; cv._h = h; return ctx;
}
function scene(id, w, h) {
  const cv = $(id), ctx = fitCanvas(cv); ctx.clearRect(0, 0, cv._w, cv._h);
  const scale = Math.min(cv._w / w, cv._h / h);
  const ox = (cv._w - w * scale) / 2, oy = (cv._h - h * scale) / 2;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale); cv._view = { w, h, scale, ox, oy }; return ctx;
}
function textC(ctx, str, x, y, color, size) {
  ctx.font = `${size || 13}px system-ui,sans-serif`; ctx.fillStyle = color || muted;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function textL(ctx, str, x, y, color, size) {
  ctx.font = `${size || 13}px system-ui,sans-serif`; ctx.fillStyle = color || muted;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function dot(ctx, x, y, color, r) { ctx.beginPath(); ctx.arc(x, y, r || 6, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill(); }
function line(ctx, a, b, color, width) {
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
  ctx.strokeStyle = color; ctx.lineWidth = width || 1.5; ctx.stroke();
}
function plotFn(ctx, fn, x0, x1, step, X, Y, color, width, alpha) {
  ctx.save(); if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let x = x0; x <= x1 + 1e-9; x += step) {
    const px = X(x), py = Y(fn(x));
    x === x0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.restore();
}

/* ---------- 绳图（第 0/1 步共用）：世界 x∈[−4,4] → 640；位移 → 300 高 ---------- */
const RX = x => (x + 4) * 80, RY = y => 168 - y * 55;
function drawRope(cvId, st, opts) {
  const ctx = scene(cvId, 640, 300);
  line(ctx, [8, RY(0)], [632, RY(0)], lineCol, 1);
  for (let gx = -4; gx <= 4; gx++) line(ctx, [RX(gx), RY(0) - 4], [RX(gx), RY(0) + 4], lineCol, 1);
  if (opts.env) { // 包络 ±2A·cos(kx)，虚线，纹丝不动
    ctx.save(); ctx.setLineDash([6, 5]);
    plotFn(ctx, x => ampRope(x, st.lam), -4, 4, 0.04, RX, RY, 'rgba(126,226,168,0.75)', 1.6);
    plotFn(ctx, x => -ampRope(x, st.lam), -4, 4, 0.04, RX, RY, 'rgba(126,226,168,0.75)', 1.6);
    ctx.restore();
  }
  if (opts.marker) { // 波峰标记线：守在 x=0（波腹）处，看波峰只升降不迁移
    ctx.save(); ctx.setLineDash([5, 5]);
    line(ctx, [RX(0), 26], [RX(0), 282], orange, 1.4); ctx.restore();
    textC(ctx, t('crestMark'), RX(0), 14, orange, 12);
    const yc = ySumRope(st.t, 0, st.lam);
    dot(ctx, RX(0), RY(yc), orange, 5);
  }
  if (opts.marks) { // 波节/波腹标记与间距（第 1 步）
    const lam = st.lam;
    for (let m = -8; m <= 8; m++) {
      const xn = (2 * m + 1) * lam / 4;
      if (xn >= -4 && xn <= 4) dot(ctx, RX(xn), RY(0), pink, 4);
      const xa = m * lam / 2;
      if (xa >= -4 && xa <= 4) dot(ctx, RX(xa), RY(0), green, 4);
    }
    textC(ctx, t('nodeMark'), RX(lam / 4), 292, pink, 11.5);
    textC(ctx, t('antiMark'), RX(0), 292, green, 11.5);
    textC(ctx, 'λ/4', RX(lam / 8), 34, muted, 12);
    line(ctx, [RX(0), 44], [RX(lam / 4), 44], muted, 1.2);
    textC(ctx, 'λ/2', RX(lam / 2), 34, muted, 12);
    line(ctx, [RX(lam / 4), 44], [RX(3 * lam / 4), 44], muted, 1.2);
  }
  const showR = opts.view !== 'left', showL = opts.view !== 'right';
  if (showR) plotFn(ctx, x => yRight(st.t, x, st.lam), -4, 4, 0.04, RX, RY, cyan, opts.view === 'right' ? 2.8 : 1.8, opts.view === 'sum' ? 0.65 : 1);
  if (showL) plotFn(ctx, x => yLeft(st.t, x, st.lam), -4, 4, 0.04, RX, RY, orange, opts.view === 'left' ? 2.8 : 1.8, opts.view === 'sum' ? 0.65 : 1);
  if (opts.view === 'sum') plotFn(ctx, x => ySumRope(st.t, x, st.lam), -4, 4, 0.04, RX, RY, white, 2.8);
  // P
  const yP = ySumRope(st.t, st.px, st.lam);
  ctx.save(); ctx.setLineDash([4, 4]); line(ctx, [RX(st.px), 30], [RX(st.px), 282], 'rgba(255,180,84,0.5)', 1.1); ctx.restore();
  dot(ctx, RX(st.px), RY(yP), orange, 6.5);
  textC(ctx, 'P', RX(st.px) + 15, RY(yP) + 14, orange, 14);
  textC(ctx, 'x', RX(st.px), 292, muted, 12);
  ctx.restore();
}
/* P 的位移—时间小图（历史实算采样，窗口 8.2 秒） */
function drawTrace(cvId, st) {
  const ctx = scene(cvId, 640, 170);
  textL(ctx, t('traceTitle'), 26, 14, muted, 12.5);
  line(ctx, [26, 95], [618, 95], lineCol, 1);
  if (st.hist.length > 1) {
    ctx.beginPath();
    st.hist.forEach((s, i) => {
      const x = 618 - (st.t - s.t) * 72, y = 95 - s.y * 40;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = orange; ctx.lineWidth = 1.8; ctx.stroke();
  }
  const yNow = ySumRope(st.t, st.px, st.lam);
  dot(ctx, 618, 95 - yNow * 40, orange, 4.5);
  ctx.restore();
}
function prefillHist(key) {
  const st = S[key];
  st.hist = [];
  for (let tt = -8.2; tt < -1e-9; tt += 0.05) st.hist.push({ t: tt, y: ySumRope(tt, st.px, st.lam) });
}
function measuredAmp(key) {
  const st = S[key];
  let m = 0;
  for (const s of st.hist) m = Math.max(m, Math.abs(s.y));
  return m;
}

/* ---------- 第 0 步 ---------- */
function render0() {
  const st = S.s0;
  drawRope('s0-canvas', st, { view: st.view, marker: true, env: false, marks: false });
  drawTrace('s0-trace', st);
  for (const v of ['sum', 'right', 'left']) {
    const b = $('s0-v' + v);
    b.classList.toggle('active', st.view === v);
    b.setAttribute('aria-pressed', String(st.view === v));
  }
}
function readout0() {
  const st = S.s0;
  ro('s0-readout', t('s0ro', {
    x: fmtNum(st.px), y1: fmtNum(yRight(st.t, st.px, st.lam)),
    y2: fmtNum(yLeft(st.t, st.px, st.lam)), ys: fmtNum(ySumRope(st.t, st.px, st.lam))
  }));
}

/* ---------- 第 1 步 ---------- */
function render1() {
  const st = S.s1;
  drawRope('s1-canvas', st, { view: 'sum', marker: false, env: st.env, marks: true });
  drawTrace('s1-trace', st);
}
function readout1() {
  const st = S.s1, cls = classifyPt(st.px, st.lam);
  ro('s1-readout', t('s1ro', {
    x: fmtNum(st.px), xr: fmtNum(st.px / st.lam),
    amp: fmtNum(ampRope(st.px, st.lam)), meas: fmtNum(measuredAmp('s1'))
  }));
  ro('s1-cls', t(cls === 'node' ? 'clsNode' : cls === 'anti' ? 'clsAnti' : 'clsGen', { amp: fmtNum(ampRope(st.px, st.lam)) }));
  $('s1-cls').style.color = cls === 'node' ? pink : cls === 'anti' ? green : muted;
}

/* ---------- 弦图（第 2/3/4 步共用框）：世界 x∈[0,8] → 640 ---------- */
const SX = x => 40 + x * 70;
function drawWalls(ctx, L, cy, halfH) {
  for (const wx of [0, L]) {
    line(ctx, [SX(wx), cy - halfH], [SX(wx), cy + halfH], white, 3);
    ctx.save(); ctx.strokeStyle = muted; ctx.lineWidth = 1.2;
    for (let d = -halfH; d < halfH; d += 12) {
      ctx.beginPath();
      ctx.moveTo(SX(wx), cy + d); ctx.lineTo(SX(wx) + (wx === 0 ? -9 : 9), cy + d + 8); ctx.stroke();
    }
    ctx.restore();
  }
}

/* ---------- 第 2 步 ---------- */
function render2() {
  const st = S.s2, cy = 160, Y = y => cy - y * 48;
  const ctx = scene('s2-canvas', 640, 300);
  const n = modeN(st.L, st.lam), ok = n >= 1;
  line(ctx, [SX(0), Y(0)], [SX(st.L), Y(0)], lineCol, 1);
  ctx.save(); ctx.setLineDash([6, 5]); // 包络 ±2A·|sin(kx)|
  plotFn(ctx, x => ampStr(x, st.lam), 0, st.L, 0.03, SX, Y, 'rgba(126,226,168,0.7)', 1.5);
  plotFn(ctx, x => -ampStr(x, st.lam), 0, st.L, 0.03, SX, Y, 'rgba(126,226,168,0.7)', 1.5);
  ctx.restore();
  plotFn(ctx, x => yStr(st.t, x, st.lam), 0, st.L, 0.03, SX, Y, ok ? green : cyan, 2.8);
  // 内部波节标记（成立时）
  if (ok) for (let m = 1; m < n; m++) dot(ctx, SX(m * st.L / n), Y(0), green, 4);
  // 右端：包络要求的位移如实画出（离台阶时非零，标红）
  const endEnv = ampStr(st.L, st.lam), endY = yStr(st.t, st.L, st.lam);
  if (!ok) {
    ctx.save(); ctx.setLineDash([4, 4]);
    line(ctx, [SX(st.L), Y(0)], [SX(st.L), Y(endEnv)], pink, 1.6);
    line(ctx, [SX(st.L), Y(0)], [SX(st.L), Y(-endEnv)], pink, 1.6);
    ctx.restore();
    dot(ctx, SX(st.L), Y(endY), pink, 6);
    textC(ctx, fmtNum(endEnv), SX(st.L) + 4, Y(endEnv) - 16, pink, 12.5);
  } else {
    dot(ctx, SX(st.L), Y(0), green, 5);
  }
  dot(ctx, SX(0), Y(0), white, 5);
  drawWalls(ctx, st.L, cy, 105);
  textC(ctx, '0', SX(0), 288, muted, 12);
  textC(ctx, 'L', SX(st.L), 288, muted, 12);
  ctx.restore();
}
function readout2() {
  /* n 与 dev 必须同源：先把 n 钳到 ≥1（q<0.5 时最近的有效台阶是 n=1），dev 再对这个显示出来的 n 算，
     否则 q<0.5 时会出现「n = 1，偏差 |q − n| = |q − 0|」的同屏自相矛盾（评审 M1）。
     命中与否仍只由 modeN 判定（round(q)=0 拒绝），读数不另立口径。 */
  const st = S.s2, q = modeQ(st.L, st.lam), n = Math.max(1, Math.round(q)), ok = modeN(st.L, st.lam) >= 1;
  ro('s2-readout', t('s2ro', {
    L: fmtNum(st.L), lam: fmtNum(st.lam), q: fmtNum(q), n, dev: fmtNum(Math.abs(q - n))
  }));
  if (ok) {
    ro('s2-state', t('modeOk', { n: modeN(st.L, st.lam), lamn: fmtNum(lamN(st.L, modeN(st.L, st.lam))) }));
    $('s2-state').style.color = green;
  } else {
    ro('s2-state', t('modeNo', { end: fmtNum(ampStr(st.L, st.lam)) }));
    $('s2-state').style.color = pink;
  }
}

/* ---------- 第 3 步 ---------- */
function render3() {
  const st = S.s3, cy = 160, Y = y => cy - y * 48;
  const ctx = scene('s3-canvas', 640, 300);
  line(ctx, [SX(0), Y(0)], [SX(STR_L), Y(0)], lineCol, 1);
  ctx.save(); ctx.setLineDash([6, 5]); // 当前模式包络 ±|sin(nπx/L)|
  plotFn(ctx, x => Math.abs(modeShape(x, st.n, STR_L)), 0, STR_L, 0.03, SX, Y, 'rgba(126,226,168,0.55)', 1.4);
  plotFn(ctx, x => -Math.abs(modeShape(x, st.n, STR_L)), 0, STR_L, 0.03, SX, Y, 'rgba(126,226,168,0.55)', 1.4);
  ctx.restore();
  if (st.cmp && st.n !== 1) { // 基频对比：按它自己的 f₁ 相位实算
    const ph1 = Math.sin(2 * Math.PI * fN(STR_V, STR_L, 1) * st.t);
    plotFn(ctx, x => modeShape(x, 1, STR_L) * ph1, 0, STR_L, 0.03, SX, Y, orange, 1.8, 0.75);
  }
  const ph = Math.sin(2 * Math.PI * fN(STR_V, STR_L, st.n) * st.t);
  plotFn(ctx, x => modeShape(x, st.n, STR_L) * ph, 0, STR_L, 0.03, SX, Y, cyan, 2.8);
  for (let m = 0; m <= st.n; m++) dot(ctx, SX(m * STR_L / st.n), Y(0), m === 0 || m === st.n ? white : pink, 4.5);
  drawWalls(ctx, STR_L, cy, 105);
  textC(ctx, '0', SX(0), 288, muted, 12);
  textC(ctx, 'L = 6', SX(STR_L), 288, muted, 12);
  ctx.restore();
}
function readout3() {
  const st = S.s3;
  ro('s3-readout', t('s3ro', {
    n: st.n, lamn: fmtNum(lamN(STR_L, st.n)), fn: fmtHz(fN(STR_V, STR_L, st.n)),
    ratio: fmtNum(fN(STR_V, STR_L, st.n) / f1(STR_V, STR_L)), nodes: st.n + 1, anti: st.n
  }));
  document.querySelectorAll('[data-n]').forEach(b => {
    const on = Number(b.dataset.n) === st.n;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

/* ---------- 第 4 步 ---------- */
function render4() {
  const st = S.s4, resp = respAmp(st.f), rm = respMode(st.f);
  const cy = 140, Y = y => cy - y * 55;
  const ctx = scene('s4-canvas', 640, 260);
  line(ctx, [SX(0), Y(0)], [SX(STR_L), Y(0)], lineCol, 1);
  const ph = Math.sin(2 * Math.PI * st.f * st.t);
  plotFn(ctx, x => modeShape(x, rm.n, STR_L) * resp * ph, 0, STR_L, 0.03, SX, Y, resp >= 0.45 ? green : cyan, 2.8);
  for (let m = 0; m <= rm.n; m++) dot(ctx, SX(m * STR_L / rm.n), Y(0), m === 0 || m === rm.n ? white : pink, 4);
  drawWalls(ctx, STR_L, cy, 88);
  textC(ctx, 'L = 6', SX(STR_L), 246, muted, 12);
  ctx.restore();
  // 响应曲线：峰位实算 f_n，峰高/宽为示意参数
  const c2 = scene('s4-curve', 640, 200);
  textL(c2, t('respTitle'), 60, 14, muted, 12.5);
  const CX = f => 60 + f / 1.5 * 560, CY = a => 172 - a * 128;
  line(c2, [60, CY(0)], [620, CY(0)], lineCol, 1);
  plotFn(c2, f => respAmp(f), 0, 1.5, 0.005, CX, CY, cyan, 2.2);
  for (let n = 1; n <= 5; n++) {
    const fn = fN(STR_V, STR_L, n);
    dot(c2, CX(fn), CY(respAmp(fn)), orange, 4);
    textC(c2, 'f' + '₁₂₃₄₅'[n - 1], CX(fn), CY(respAmp(fn)) - 14, orange, 12.5);
  }
  c2.save(); c2.setLineDash([4, 4]); line(c2, [CX(st.f), 26], [CX(st.f), CY(0)], orange, 1.3); c2.restore();
  dot(c2, CX(st.f), CY(resp), orange, 6);
  textC(c2, 'f', CX(1.5), CY(0) + 16, muted, 12.5);
  c2.restore();
}
function readout4() {
  const st = S.s4, nn = nearestNat(st.f), rm = respMode(st.f), resp = respAmp(st.f);
  ro('s4-readout', t('s4ro', { f: fmtHz(st.f), n: nn, fn: fmtHz(fN(STR_V, STR_L, nn)), amp: fmtNum(resp) }));
  const lit = resp >= 0.45;
  ro('s4-state', t(lit ? 'resLit' : 'resOff', { n: rm.n }));
  $('s4-state').style.color = lit ? green : muted;
}

/* ---------- 第 5 步：自测 ---------- */
function readout5() {
  for (const q of ['q1', 'q2', 'q3', 'q4']) {
    const picked = S.s5.picked[q], locked = S.s5.locked[q];
    document.querySelectorAll(`[data-q="${q}"]`).forEach(b => {
      b.disabled = locked;
      b.setAttribute('aria-pressed', String(picked === Number(b.dataset.opt)));
    });
    ro('s5-' + q + '-ro', picked === null ? '' : t(picked === QUIZ[q] ? q + 'ok' : q + 'no'));
    $('s5-' + q + '-ro').style.color = picked === null ? muted : picked === QUIZ[q] ? green : pink;
  }
  const k = ['q1', 'q2', 'q3', 'q4'].filter(q => S.s5.locked[q]).length;
  ro('s5-score', t('score', { k }));
  /* 提示门控：四题全对前 DOM 里不渲染（textContent 恒为空，不是隐藏） */
  $('s5-hint').textContent = k === 4 ? t('s5hintAll') : '';
}

/* ---------- 骨架 ---------- */
function badges() {
  for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'physics'], ['stageBadge', window.KNOWLEDGE_STAGES, 'senior']]) {
    const item = (arr || []).find(x => x.id === id);
    if (item) $(el).textContent = item.name[getLang()];
  }
}
function playLabels() {
  for (const key of ['s0', 's1', 's2', 's3', 's4']) $(key + '-play').textContent = t(S[key].playing ? 'pause' : 'play');
}
function renderStep(key) {
  if (key === 's0') render0(); else if (key === 's1') render1();
  else if (key === 's2') render2(); else if (key === 's3') render3();
  else if (key === 's4') render4();
}
function renderAll() {
  badges(); playLabels();
  render0(); render1(); render2(); render3(); render4();
  readout0(); readout1(); readout2(); readout3(); readout4(); readout5();
}
function setP(key, x) {
  const st = S[key];
  const nx = clamp(Math.round(x * 20) / 20, -4, 4);
  if (nx !== st.px) { st.px = nx; prefillHist(key); }
  $(key + '-px').value = st.px;
  renderStep(key);
}
function drag(id, key) {
  const cv = $(id); cv.classList.add('dragc'); let pointer = null;
  function move(e) {
    if (e.pointerId !== pointer) return;
    const r = cv.getBoundingClientRect(), v = cv._view;
    setP(key, (e.clientX - r.left - v.ox) / v.scale / 80 - 4);
  }
  cv.addEventListener('pointerdown', e => { pointer = e.pointerId; cv.setPointerCapture(pointer); move(e); });
  cv.addEventListener('pointermove', move);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(type, () => pointer = null);
}
function bind() {
  for (const key of ['s0', 's1']) {
    $(key + '-lam').oninput = e => { S[key].lam = Number(e.target.value); prefillHist(key); renderStep(key); };
    $(key + '-px').oninput = e => setP(key, Number(e.target.value));
    $(key + '-play').onclick = () => { S[key].playing = !S[key].playing; playLabels(); };
    drag(key + '-canvas', key);
  }
  for (const v of ['sum', 'right', 'left']) $('s0-v' + v).onclick = () => { S.s0.view = v; render0(); };
  $('s1-env').onchange = e => { S.s1.env = e.target.checked; render1(); };
  $('s1-node').onclick = () => setP('s1', S.s1.lam / 4);
  $('s1-anti').onclick = () => setP('s1', 0);
  $('s2-len').oninput = e => { S.s2.L = Number(e.target.value); render2(); readout2(); };
  $('s2-lam').oninput = e => { S.s2.lam = Number(e.target.value); render2(); readout2(); };
  $('s2-snap').onclick = () => {
    /* 吸附只许落在 λ 滑杆量程内的台阶：逐 n 枚举台阶 λ=2L/n，量程外的跳过
       （如 L=8 时 n=1 的 λ=16 超过滑杆 max=14，旧写法会把状态推到滑杆够不着的值、滑杆与状态脱钩——评审 S1），
       取量程内离当前 λ 最近的可达台阶。λ 随 n 单调减小，越过量程下限即停。 */
    const lamEl = $('s2-lam'), lo = Number(lamEl.min), hi = Number(lamEl.max);
    let best = null, bestD = Infinity;
    for (let n = 1; ; n++) {
      const lam = lamN(S.s2.L, n);
      if (lam < lo - 1e-9) break;
      if (lam > hi + 1e-9) continue;
      const d = Math.abs(lam - S.s2.lam);
      if (d < bestD - 1e-12) { bestD = d; best = lam; }
    }
    if (best !== null) { S.s2.lam = best; lamEl.value = best; }
    render2(); readout2();
  };
  $('s2-play').onclick = () => { S.s2.playing = !S.s2.playing; playLabels(); };
  document.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { S.s3.n = Number(b.dataset.n); render3(); readout3(); });
  $('s3-cmp').onchange = e => { S.s3.cmp = e.target.checked; render3(); };
  $('s3-play').onclick = () => { S.s3.playing = !S.s3.playing; playLabels(); };
  $('s4-freq').oninput = e => { S.s4.f = Number(e.target.value); render4(); readout4(); };
  $('s4-play').onclick = () => { S.s4.playing = !S.s4.playing; playLabels(); };
  document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
    const q = b.dataset.q;
    if (S.s5.locked[q]) return;
    S.s5.picked[q] = Number(b.dataset.opt);
    if (S.s5.picked[q] === QUIZ[q]) S.s5.locked[q] = true;
    readout5();
  });
  $('s5-reset').onclick = () => {
    S.s5 = { picked: { q1: null, q2: null, q3: null, q4: null }, locked: { q1: false, q2: false, q3: false, q4: false } };
    readout5();
  };
  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(a => {
      const active = a.dataset.nav === e.target.dataset.step;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    const key = 's' + e.target.dataset.step;
    if (S[key]) S[key].visible = e.isIntersecting;
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));
  let queued = false;
  window.addEventListener('resize', () => {
    if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; renderAll(); }); }
  });
}
/* 动画主循环：每步独立时钟；历史采样在 tick 中，渲染只画可见步 */
let lastTs = 0, lastRO = 0;
function tick(ts) {
  const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0; lastTs = ts;
  for (const key of ['s0', 's1', 's2', 's3', 's4']) {
    const st = S[key];
    if (st.playing && dt > 0) {
      st.t += dt;
      if (key === 's0' || key === 's1') {
        st.hist.push({ t: st.t, y: ySumRope(st.t, st.px, st.lam) });
        while (st.hist.length && st.t - st.hist[0].t > 8.2) st.hist.shift();
      }
    }
    if (st.visible) renderStep(key);
  }
  if (ts - lastRO > 220) {
    lastRO = ts;
    if (S.s0.visible) readout0();
    if (S.s1.visible) readout1();
    if (S.s2.visible) readout2();
    if (S.s4.visible) readout4();
  }
  requestAnimationFrame(tick);
}
onLangRefresh(renderAll); bind(); applyLang(getLang());
prefillHist('s0'); prefillHist('s1');
requestAnimationFrame(tick);
// Read-only inspection surface for numerical review; UI remains the mutation path.
window.STANDING = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  yRight, yLeft, ySumRope, yAnalytic, ampRope, classifyPt,
  yInc, yRefl, yStr, ampStr, modeQ, modeN, lamN, fN, f1, modeShape, respAmp, fmtNum
};
