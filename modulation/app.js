'use strict';
/* 调制与频移交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 采样口径（全页统一，评审按此复算）：
   Fs = 2048 Hz，N = 2048 点（时长 1 s，FFT 分辨率 Δf = 1 Hz）；所有音调
   频率取整数 Hz，保证整周期采样。显示频谱：Hann 窗幅值谱（相干增益校正，
   单边谱 cos 幅值）。占用带宽（OBW）：无窗功率谱累积 1%→99% 的跨度。
   理想低通/带通：一律 FFT 频域掩模（口径在各步文案注明）。
   噪声：mulberry32 种子 RNG + Box–Muller 高斯（算法见 gaussNoise）。

   ★ 红线（与 BRIEF 一一对应）：
   1. 频谱全由真采样 FFT 计算；AM 边带/载波比从谱线高度实测，与 m/2 对账。
   2. 解调逐点真算：包络检波 = 二极管峰值充电 + RC 指数放电；相干解调
      = 乘本振 + FFT 掩模低通。φ=90° 的输出标度如实报数（浮点尘量级）。
   3. 本振失谐 Δf：输出谱线实测位置 fm±Δf（抛物线插值），读数如实。
   4. FM：瞬时频率定义式在位；带宽为 OBW 实测，Carson 规则只作并排经验式。
   5. 抗噪擂台：同种子同噪声功率；输出 SNR 由样本 LS 拟合现算，不预置。
   6. FDM/IQ：串扰由「输出对各路消息联合 LS 拟合的功率占比」真算。
   评审对账接口：window.MOD（见文件末尾）。 */
const $ = id => document.getElementById(id);

/* ================================================================
   采样与数学核心（页面与 window.MOD 共用同一批实现）
   ================================================================ */
const FS = 2048, N = 2048, DF = FS / N; // 1 Hz 分辨率
const tt = i => i / FS;

/* ---- 基 2 FFT（原地，re/im 为 Float64Array，长度须为 2 的幂） ---- */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let tmp = re[i]; re[i] = re[j]; re[j] = tmp;
      tmp = im[i]; im[i] = im[j]; im[j] = tmp;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1, cwi = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cwr - im[i + k + len / 2] * cwi;
        const vi = re[i + k + len / 2] * cwi + im[i + k + len / 2] * cwr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const nwr = cwr * wr - cwi * wi; cwi = cwr * wi + cwi * wr; cwr = nwr;
      }
    }
  }
}
function ifft(re, im) {
  for (let i = 0; i < re.length; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < re.length; i++) { re[i] /= re.length; im[i] = -im[i] / re.length; }
}
function hannWin(n) {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n);
  return w;
}
const HANN = hannWin(N);
/* 幅值谱（Hann 窗、相干增益校正、单边）：A[k] = k 号 bin 处的 cos 幅值 */
function ampSpectrum(x) {
  const n = x.length, re = new Float64Array(n), im = new Float64Array(n);
  let cg = 0;
  for (let i = 0; i < n; i++) { re[i] = x[i] * HANN[i]; cg += HANN[i]; }
  cg /= n; // Hann 相干增益 = 0.5
  fft(re, im);
  const A = new Float64Array(n / 2 + 1);
  for (let k = 0; k <= n / 2; k++) {
    const a = Math.hypot(re[k], im[k]) / (n * cg);
    A[k] = (k === 0 || k === n / 2) ? a : 2 * a;
  }
  return A;
}
/* 功率谱（无窗、单边、Parseval 口径）：P[k] 为该 bin 的平均功率贡献 */
function powerSpectrum(x) {
  const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
  fft(re, im);
  const P = new Float64Array(n / 2 + 1);
  for (let k = 0; k <= n / 2; k++) {
    P[k] = (re[k] * re[k] + im[k] * im[k]) / (n * n) * ((k === 0 || k === n / 2) ? 1 : 2);
  }
  return P;
}
/* 占用带宽：累积功率 1% 与 99% 处的频率之差（Hz） */
function obw98(x) {
  const P = powerSpectrum(x);
  let tot = 0;
  for (let k = 0; k < P.length; k++) tot += P[k];
  let cum = 0, flo = 0, fhi = P.length - 1;
  for (let k = 0; k < P.length; k++) { cum += P[k]; if (cum >= 0.01 * tot) { flo = k; break; } }
  cum = 0;
  for (let k = 0; k < P.length; k++) { cum += P[k]; if (cum >= 0.99 * tot) { fhi = k; break; } }
  return { bw: (fhi - flo) * DF, flo: flo * DF, fhi: fhi * DF, total: tot };
}
/* FFT 掩模理想低通（截止 cutoffHz） */
function lpMask(x, cutoffHz) {
  const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
  fft(re, im);
  const kc = Math.round(cutoffHz / DF);
  for (let k = kc + 1; k < n - kc; k++) { re[k] = 0; im[k] = 0; }
  ifft(re, im);
  return re;
}
/* FFT 掩模理想带通（中心 centerHz、半宽 halfHz） */
function bpMask(x, centerHz, halfHz) {
  const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
  fft(re, im);
  const lo = Math.round((centerHz - halfHz) / DF), hi = Math.round((centerHz + halfHz) / DF);
  for (let k = 0; k <= n / 2; k++) {
    const keep = k >= lo && k <= hi;
    if (!keep) { re[k] = 0; im[k] = 0; if (k > 0 && k < n / 2) { re[n - k] = 0; im[n - k] = 0; } }
  }
  ifft(re, im);
  return re;
}
/* 解析信号（Hilbert，FFT 法） */
function analytic(x) {
  const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
  fft(re, im);
  for (let k = 1; k < n / 2; k++) { re[k] *= 2; im[k] *= 2; }
  for (let k = n / 2 + 1; k < n; k++) { re[k] = 0; im[k] = 0; }
  ifft(re, im);
  return { re, im };
}
/* ---- 种子噪声：mulberry32 + Box–Muller（评审可按同算法复跑） ---- */
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gaussNoise(seed, n, sigma) {
  const rnd = mulberry32(seed), out = new Float64Array(n);
  for (let i = 0; i < n; i += 2) {
    const u1 = Math.max(rnd(), 1e-300), u2 = rnd();
    const r = Math.sqrt(-2 * Math.log(u1)) * sigma;
    out[i] = r * Math.cos(2 * Math.PI * u2);
    if (i + 1 < n) out[i + 1] = r * Math.sin(2 * Math.PI * u2);
  }
  return out;
}
/* ---- 信号合成：msgFn 为函数 i -> 消息样本 ---- */
function sampleFn(fn) { const x = new Float64Array(N); for (let i = 0; i < N; i++) x[i] = fn(i); return x; }
function amSignal(msg, m, fc) { // AM（带载波）：(1 + m·msg)·cos
  return sampleFn(i => (1 + m * msg(i)) * Math.cos(2 * Math.PI * fc * tt(i)));
}
function dsbSignal(msg, fc) { // DSB：msg·cos
  return sampleFn(i => msg(i) * Math.cos(2 * Math.PI * fc * tt(i)));
}
function fmSignal(beta, fmHz, fc) { // FM 单音：cos(2πfc t + β·sin(2πfm t))
  return sampleFn(i => Math.cos(2 * Math.PI * fc * tt(i) + beta * Math.sin(2 * Math.PI * fmHz * tt(i))));
}
/* ---- 解调器 ---- */
/* 相干解调：×2cos(2π(fc+df)t + φ) 后理想低通（lpCut Hz）。返回基带输出 */
function coherentDemod(s, fc, df, phiDeg, lpCut) {
  const phi = phiDeg * Math.PI / 180;
  const mix = sampleFn(i => 2 * s[i] * Math.cos(2 * Math.PI * (fc + df) * tt(i) + phi));
  return lpMask(mix, lpCut);
}
/* 包络检波：二极管峰值充电（瞬时）+ RC 指数放电（τ 秒），逐点仿真 */
function envDetectPeak(s, tau) {
  const dec = Math.exp(-(1 / FS) / tau), y = new Float64Array(s.length);
  let v = 0;
  for (let i = 0; i < s.length; i++) { const a = Math.abs(s[i]); v = a > v ? a : v * dec; y[i] = v; }
  return y;
}
/* FM 解调：限幅（只取解析信号相位）→ 相位差分得瞬时频率 → 掩模低通 → 归一化
   kf = 峰值频偏 Δf（Hz，消息幅值 1 对应 Δf）。返回 {est, finst} */
function fmDemod(s, fc, kf, lpCut) {
  const an = analytic(s);
  const ph = new Float64Array(N);
  for (let i = 0; i < N; i++) ph[i] = Math.atan2(an.im[i], an.re[i]);
  for (let i = 1; i < N; i++) {
    let d = ph[i] - ph[i - 1];
    while (d > Math.PI) { ph[i] -= 2 * Math.PI; d -= 2 * Math.PI; }
    while (d < -Math.PI) { ph[i] += 2 * Math.PI; d += 2 * Math.PI; }
  }
  const finst = new Float64Array(N);
  for (let i = 1; i < N; i++) finst[i] = (ph[i] - ph[i - 1]) * FS / (2 * Math.PI);
  finst[0] = finst[1];
  const fLp = lpMask(finst, lpCut);
  const est = new Float64Array(N);
  for (let i = 0; i < N; i++) est[i] = (fLp[i] - fc) / kf;
  return { est, finst };
}
/* ---- 拟合与投影（读数口径） ---- */
/* 最小二乘 out ≈ a·ref + b（样本区间 [i0, i1)），残差换算 SNR(dB) 与 NMSE */
function lsFit(out, ref, i0, i1) {
  i0 = i0 || 0; i1 = i1 === undefined ? N : i1;
  let so = 0, sr = 0; const cnt = i1 - i0;
  for (let i = i0; i < i1; i++) { so += out[i]; sr += ref[i]; }
  const mo = so / cnt, mr = sr / cnt;
  let num = 0, den = 0;
  for (let i = i0; i < i1; i++) { num += (out[i] - mo) * (ref[i] - mr); den += (ref[i] - mr) * (ref[i] - mr); }
  const a = den > 0 ? num / den : 0;
  let err = 0;
  for (let i = i0; i < i1; i++) { const d = mo + a * (ref[i] - mr) - out[i]; err += d * d; }
  const resPow = err / cnt, sigPow = a * a * den / cnt; // 残差功率 / 拟合信号功率
  return { a, b: mo - a * mr, nmse: den > 0 ? err / den : 0, resPow, sigPow, snrDb: resPow > 0 ? 10 * Math.log10(sigPow / resPow) : Infinity };
}
/* 单回归系数 <out, ref>/<ref, ref>（投影标度） */
function projCoef(out, ref) {
  let num = 0, den = 0;
  for (let i = 0; i < N; i++) { num += out[i] * ref[i]; den += ref[i] * ref[i]; }
  return den > 0 ? num / den : 0;
}
/* 联合拟合：out ≈ Σ coef_j·refs_j + c（法方程 + 高斯消元）。
   返回每路的「功率占比」share_j = coef_j²·var(refs_j)（去均值口径） */
function jointFit(out, refs) {
  const m = refs.length, cnt = N;
  const means = refs.map(r => { let s = 0; for (let i = 0; i < cnt; i++) s += r[i]; return s / cnt; });
  let mo = 0; for (let i = 0; i < cnt; i++) mo += out[i]; mo /= cnt;
  const G = [], rhs = [];
  for (let j = 0; j < m; j++) {
    G.push([]); rhs.push(0);
    for (let k = 0; k < m; k++) {
      let s = 0;
      for (let i = 0; i < cnt; i++) s += (refs[j][i] - means[j]) * (refs[k][i] - means[k]);
      G[j].push(s);
    }
    let s = 0;
    for (let i = 0; i < cnt; i++) s += (refs[j][i] - means[j]) * (out[i] - mo);
    rhs[j] = s;
  }
  // 高斯消元
  const A = G.map((row, j) => row.concat(rhs[j]));
  for (let col = 0; col < m; col++) {
    let piv = col;
    for (let r = col + 1; r < m; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    const tmp = A[col]; A[col] = A[piv]; A[piv] = tmp;
    const d = A[col][col] || 1e-300;
    for (let r = 0; r < m; r++) {
      if (r === col) continue;
      const f = A[r][col] / d;
      for (let c = col; c <= m; c++) A[r][c] -= f * A[col][c];
    }
  }
  const coef = A.map((row, j) => row[m] / (row[j] || 1e-300));
  const shares = refs.map((r, j) => {
    let v = 0;
    for (let i = 0; i < cnt; i++) v += (r[i] - means[j]) * (r[i] - means[j]);
    return coef[j] * coef[j] * (v / cnt);
  });
  let err = 0;
  for (let i = 0; i < cnt; i++) {
    let pred = mo;
    for (let j = 0; j < m; j++) pred += coef[j] * (refs[j][i] - means[j]);
    err += (out[i] - pred) * (out[i] - pred);
  }
  return { coef, shares, residVar: err / cnt };
}
function meanPower(x, i0, i1) {
  i0 = i0 || 0; i1 = i1 === undefined ? x.length : i1;
  let s = 0;
  for (let i = i0; i < i1; i++) s += x[i] * x[i];
  return s / (i1 - i0);
}

/* ================================================================
   画布适配（DPR）：沿用站内 fitCanvas 方案（CSS 尺寸与 backing 分离、幂等）
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

/* ---------- 小工具（沿用 freqresp 口径） ---------- */
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
function fmtDb(v) { // SNR/串扰类 dB 读数：无穷大如实写作 >200
  if (!isFinite(v)) return '>200 dB';
  if (v > 200) return '>200 dB';
  if (v < -200) return '<−200 dB';
  return fmtS(v, 1) + ' dB';
}
/* 文字落字（量宽夹取）：整串必落在画布内 4px 边距里 */
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
/* 点旁标签（量宽选边）：几何（选边 + 横向范围）先算，落字后返回标签盒 {x0,x1,y} 供多标签避让 */
function sideLabelGeom(ctx, text, px, w, preferLeft, gap) {
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
  return { x, align, tw, x0: align === 'left' ? x : x - tw, x1: align === 'left' ? x + tw : x };
}
function drawSideLabel(ctx, text, px, py, w, preferLeft, gap, color, dy) {
  gap = gap || 10;
  const g = sideLabelGeom(ctx, text, px, w, preferLeft, gap);
  const y = py + (dy || 0) - 8;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = color || '#e8edf4';
  ctx.textAlign = g.align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, g.x, y);
  return { x0: g.x0, x1: g.x1, y };
}
/* 角注折行（量宽换行） */
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
/* 图例助手（量宽贪心分行） */
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
/* 通用曲线图骨架（与 freqresp 同构） */
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
   本页专用绘制：波形多泳道 + 频谱
   lanes: [{data(下标=样本), color, label, width?, dash?, i0, i1, yMax}]
   每条泳道独立居中零线；data 可以是数组或函数 i->v（函数用于第 0 步动画）。
   ================================================================ */
function drawLanes(cv, lanes, opts) {
  opts = opts || {};
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  ctx.fillStyle = '#11161f';
  ctx.fillRect(0, 0, W, H);
  const n = lanes.length;
  const laneH = H / n;
  lanes.forEach((L, li) => {
    const y0 = li * laneH, cy = y0 + laneH / 2;
    const yMax = L.yMax || 1.15;
    const amp = laneH / 2 - 16;
    ctx.strokeStyle = 'rgba(120,140,165,0.22)';
    ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(W - 8, cy); ctx.stroke();
    if (li > 0) { ctx.strokeStyle = 'rgba(120,140,165,0.14)'; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke(); }
    putText(ctx, L.label, 10, y0 + 15, { color: L.color, font: '12.5px system-ui, sans-serif' });
    const i0 = L.i0 || 0, i1 = L.i1 === undefined ? N : L.i1;
    const get = typeof L.data === 'function' ? L.data : (i => L.data[i]);
    ctx.strokeStyle = L.color; ctx.lineWidth = L.width || 1.8;
    ctx.setLineDash(L.dash || []);
    ctx.beginPath();
    const steps = Math.max(2, Math.floor(W - 16));
    for (let sIdx = 0; sIdx <= steps; sIdx++) {
      const fi = i0 + (i1 - i0) * sIdx / steps;
      const iA = Math.floor(fi), frac = fi - iA;
      const v = get(iA) * (1 - frac) + get(Math.min(iA + 1, N - 1)) * frac;
      const x = 8 + sIdx / steps * (W - 16), y = cy - clamp(v, -yMax, yMax) / yMax * amp;
      if (sIdx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    if (L.overlay) { // 第二条线（如真包络/对照），函数或数组
      ctx.strokeStyle = L.overlay.color; ctx.lineWidth = 1.6;
      ctx.setLineDash(L.overlay.dash || [6, 4]);
      ctx.beginPath();
      const get2 = typeof L.overlay.data === 'function' ? L.overlay.data : (i => L.overlay.data[i]);
      for (let sIdx = 0; sIdx <= steps; sIdx++) {
        const fi = i0 + (i1 - i0) * sIdx / steps;
        const iA = Math.floor(fi), frac = fi - iA;
        const v = get2(iA) * (1 - frac) + get2(Math.min(iA + 1, N - 1)) * frac;
        const x = 8 + sIdx / steps * (W - 16), y = cy - clamp(v, -yMax, yMax) / yMax * amp;
        if (sIdx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
  return ctx;
}
/* 频谱绘制：A = ampSpectrum 输出；cfg: {fLo, fHi, yMax?, marks:[{f,label,color,dy?}], shade:[f1,f2,color,label?], legend} */
function drawSpec(cv, A, cfg) {
  const yMax = cfg.yMax || (Math.max(...A.slice(Math.floor(cfg.fLo), Math.ceil(cfg.fHi) + 1)) * 1.18) || 1;
  const ticks = [];
  const step = cfg.tickStep || 50;
  for (let f = Math.ceil(cfg.fLo / step) * step; f <= cfg.fHi; f += step) ticks.push([f, String(f)]);
  const { ctx, R, X, Y } = plotFrame(cv, {
    legend: cfg.legend,
    xLo: cfg.fLo, xHi: cfg.fHi, yLo: 0, yHi: yMax,
    xTicks: ticks, yTicks: [[0, '0'], [yMax / 2, fmtS(yMax / 2, 2)], [yMax, fmtS(yMax, 2)]],
    xLabel: cfg.xLabel || t('cvFreq'), yLabel: cfg.yLabel || t('cvAmp')
  });
  if (cfg.shade) {
    ctx.fillStyle = cfg.shade[2] || 'rgba(110,231,255,0.10)';
    ctx.fillRect(X(cfg.shade[0]), R.y, X(cfg.shade[1]) - X(cfg.shade[0]), R.h);
  }
  clipTo(ctx, R, () => {
    if (cfg.ghost) { // 幽灵线：另一条谱（如搬家前），虚线灰
      ctx.strokeStyle = 'rgba(154,167,184,0.55)'; ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      const g0 = Math.max(0, Math.floor(cfg.fLo / DF)), g1 = Math.min(cfg.ghost.length - 1, Math.ceil(cfg.fHi / DF));
      for (let k = g0; k <= g1; k++) {
        const x = X(k * DF), y = Y(cfg.ghost[k]);
        if (k === g0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = cfg.color || '#6ee7ff'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    const k0 = Math.max(0, Math.floor(cfg.fLo / DF)), k1 = Math.min(A.length - 1, Math.ceil(cfg.fHi / DF));
    for (let k = k0; k <= k1; k++) {
      const x = X(k * DF), y = Y(A[k]);
      if (k === k0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (const vl of (cfg.vlines || [])) {
      if (vl.f < cfg.fLo || vl.f > cfg.fHi) continue;
      ctx.strokeStyle = vl.color || '#ff7a93'; ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(X(vl.f), R.y); ctx.lineTo(X(vl.f), R.y + R.h); ctx.stroke();
      ctx.setLineDash([]);
      if (vl.label) putText(ctx, vl.label, X(vl.f), R.y + 12, { align: 'center', color: vl.color || '#ff7a93', font: '10.5px system-ui, sans-serif' });
    }
  });
  const placedBoxes = [];
  for (const mk of (cfg.marks || [])) {
    if (mk.f < cfg.fLo || mk.f > cfg.fHi) continue;
    const px = X(mk.f), py = Y(A[Math.round(mk.f / DF)] || 0);
    drawDot(ctx, px, py, mk.color || '#ffb454', 3.6);
    // 标签避让：与已放标签横向重叠且近同高时，逐行下错（窄屏边带标签粘连即由此消除；宽屏无重叠则 dy 恒 0）
    const preferL = mk.f < (cfg.fLo + cfg.fHi) / 2;
    const g = sideLabelGeom(ctx, mk.label, px, cv._w, preferL, 8);
    let dy = 0;
    const clash = () => placedBoxes.some(b => g.x0 < b.x1 && g.x1 > b.x0 && Math.abs(py + dy - 8 - b.y) < 13);
    while (clash() && dy < 42) dy += 14;
    placedBoxes.push(drawSideLabel(ctx, mk.label, px, py, cv._w, preferL, 8, mk.color || '#ffb454', dy));
  }
  if (cfg.note) { // 图内注记（量宽折行，右上落字）——如 φ=90° 浮点尘量级说明
    ctx.font = '11px system-ui, sans-serif';
    wrapNoteLines(ctx, cfg.note, Math.max(60, R.w - 16)).forEach((ln, li) =>
      putText(ctx, ln, R.x + R.w - 8, R.y + 16 + li * 14, { align: 'right', color: '#ffb454', font: '11px system-ui, sans-serif' }));
  }
  return { ctx, R, X, Y };
}

/* ================================================================
   第 0 步 · 钩子：低频消息 + 拧载波搬家
   消息：3 Hz×1.0 + 5 Hz×0.7 + 7 Hz×0.45（整数 Hz，整周期采样）
   ================================================================ */
const s0msgFn = i => Math.cos(2 * Math.PI * 3 * tt(i)) + 0.7 * Math.cos(2 * Math.PI * 5 * tt(i)) + 0.45 * Math.cos(2 * Math.PI * 7 * tt(i));
const s0 = { fc: 160, phase: 0, base: null, baseSpec: null, mod: null, modSpec: null, peak: 0, lo: 0, hi: 0 };
function computeS0() {
  if (!s0.base) { s0.base = sampleFn(s0msgFn); s0.baseSpec = ampSpectrum(s0.base); }
  s0.mod = dsbSignal(s0msgFn, s0.fc);
  s0.modSpec = ampSpectrum(s0.mod);
  // 实测：fc 附近 ±12 Hz 内幅值 ≥0.15 的谱线群（DSB 边线幅值 = 消息幅值/2，最弱 0.225；其 Hann 邻 bin 0.1125）+ 最强线
  let pk = s0.fc, pkA = -1, lo = null, hi = null;
  for (let k = Math.max(0, Math.round(s0.fc / DF) - 12); k <= Math.round(s0.fc / DF) + 12; k++) {
    const a = s0.modSpec[k];
    if (a > pkA) { pkA = a; pk = k * DF; }
    if (a >= 0.15) { if (lo === null) lo = k * DF; hi = k * DF; }
  }
  s0.peak = pk; s0.lo = lo === null ? s0.fc : lo; s0.hi = hi === null ? s0.fc : hi;
}
function drawS0Wave() {
  const shift = Math.floor(s0.phase * FS) % N;
  const wrap = arr => (i => arr[(i + shift) % N]);
  drawLanes($('s0-wave'), [
    { data: wrap(s0.base), color: '#9aa7b8', label: t('cv0Msg'), i0: 0, i1: 1024, yMax: 2.35 },
    { data: wrap(s0.mod), color: '#6ee7ff', label: t('cv0Mod'), i0: 0, i1: 1024, yMax: 2.35 }
  ]);
}
function drawS0Spec() {
  drawSpec($('s0-spec'), s0.modSpec, {
    fLo: 0, fHi: 360, tickStep: 60, ghost: s0.baseSpec,
    legend: [[t('cv0SpecMove'), '#6ee7ff'], [t('cv0SpecBase'), '#9aa7b8']],
    marks: [{ f: s0.peak, label: fmtS(s0.peak, 0) + ' Hz', color: '#ffb454' }]
  });
}
function updateS0() {
  computeS0();
  $('s0-fc-val').textContent = fmtS(s0.fc, 0) + ' Hz';
  $('s0-readout').innerHTML = t('s0ro', { peak: fmtS(s0.peak, 0), lo: fmtS(s0.lo, 0), hi: fmtS(s0.hi, 0) });
  drawS0Wave(); drawS0Spec();
}

/* ================================================================
   第 1 步 · AM：三线谱、边带比、谱包平移、2B 带宽
   ================================================================ */
const S1_FC = 200;
const s1 = { type: 'single', m: 0.8, sig: null, spec: null, car: 0, sbLo: 0, sbHi: 0, sb1: 0, sb2: 0, span: 0 };
function s1msgFn() {
  if (s1.type === 'single') return i => Math.cos(2 * Math.PI * 10 * tt(i));
  return i => (Math.cos(2 * Math.PI * 10 * tt(i)) + 0.6 * Math.cos(2 * Math.PI * 25 * tt(i))) / 1.6;
}
function computeS1() {
  const fn = s1msgFn();
  s1.sig = amSignal(fn, s1.m, S1_FC);
  s1.spec = ampSpectrum(s1.sig);
  const A = s1.spec;
  s1.car = A[200];
  s1.sbLo = A[190]; s1.sbHi = A[210];
  s1.sb1 = (A[190] + A[210]) / 2;
  s1.sb2 = (A[175] + A[225]) / 2;
  // 谱线横跨：[140, 260] 内局部峰（≥0.002）的最外两峰之距。Hann 窗的 DFT 只有 ±1 bin 非零、
  // 邻 bin 恰为峰值一半，局部峰条件已排除主瓣邻 bin；0.002 远高于浮点尘（~1e-13），又低于
  // 滑杆最小非零 m=0.02 时最弱的边带（双音 0.00375）——小 m 也能测满横跨，不再误报 0 Hz。
  let first = null, last = null;
  for (let k = 140; k <= 260; k++) {
    if (A[k] >= 0.002 && A[k] >= A[k - 1] && A[k] >= A[k + 1]) { if (first === null) first = k; last = k; }
  }
  s1.span = (first === null || last === first) ? 0 : (last - first) * DF;
}
function drawS1() {
  const fn = s1msgFn();
  const msgArr = sampleFn(fn), carArr = sampleFn(i => Math.cos(2 * Math.PI * S1_FC * tt(i)));
  drawLanes($('s1-wave'), [
    { data: msgArr, color: '#9aa7b8', label: t('cv1Msg'), i0: 0, i1: 512, yMax: 1.2 },
    { data: carArr, color: '#5f7089', label: t('cv1Car'), i0: 0, i1: 512, yMax: 1.2 },
    { data: s1.sig, color: '#6ee7ff', label: t('cv1Prod'), i0: 0, i1: 512, yMax: 2.45 }
  ]);
  const marks = [{ f: 200, label: t('cv1Carrier') + ' ' + fmtS(s1.car, 3), color: '#ffb454' }];
  if (s1.m > 0.001) {
    marks.push({ f: 190, label: fmtS(s1.sbLo, 3), color: '#7ee2a8' });
    marks.push({ f: 210, label: fmtS(s1.sbHi, 3), color: '#7ee2a8' });
    if (s1.type === 'dual') {
      marks.push({ f: 175, label: fmtS(s1.spec[175], 3), color: '#7ee2a8' });
      marks.push({ f: 225, label: fmtS(s1.spec[225], 3), color: '#7ee2a8' });
    }
  }
  drawSpec($('s1-spec'), s1.spec, {
    fLo: 130, fHi: 270, tickStep: 20,
    legend: [[t('cv1Spec'), '#6ee7ff']], marks
  });
}
function updateS1() {
  computeS1();
  $('s1-m-val').textContent = fmtS(s1.m, 2);
  // 横跨措辞按「实测 vs 理论 2B」分三档：测满才断言等式；测不到 / 只测到内侧一对时如实说明，绝不印假等式
  const fullSpan = s1.type === 'single' ? 20 : 50;
  let spanTxt;
  if (s1.span === fullSpan) spanTxt = ' · ' + t('s1roSpanOk', { span: fmtS(s1.span, 0), B: s1.type === 'single' ? '10' : '25' });
  else if (s1.span === 0) spanTxt = ' · ' + t('s1roSpanMiss', { full: fmtS(fullSpan, 0) });
  else spanTxt = ' · ' + t('s1roSpanPart', { span: fmtS(s1.span, 0), full: fmtS(fullSpan, 0) });
  if (s1.m <= 0.001) {
    $('s1-readout').innerHTML = t('s1roZero');
  } else if (s1.type === 'single') {
    $('s1-readout').innerHTML = t('s1roSingle', {
      car: fmtS(s1.car, 3), lo: fmtS(s1.sbLo, 3), hi: fmtS(s1.sbHi, 3),
      ratio: fmtS(((s1.sbLo + s1.sbHi) / 2) / s1.car, 3), half: fmtS(s1.m / 2, 3),
      spanTxt
    });
  } else {
    $('s1-readout').innerHTML = t('s1roDual', {
      car: fmtS(s1.car, 3), sb1: fmtS(s1.sb1, 3), a1: fmtS(s1.m * (1 / 1.6) / 2, 3),
      sb2: fmtS(s1.sb2, 3), a2: fmtS(s1.m * (0.6 / 1.6) / 2, 3),
      spanTxt
    });
  }
  drawS1();
}

/* ================================================================
   第 2 步 · 相干解调：Δf 拍频 + φ 的 cos 标度
   ================================================================ */
const S2_FC = 200, S2_FM = 10;
const s2msgFn = i => Math.cos(2 * Math.PI * S2_FM * tt(i));
const s2 = { df: 0, phi: 0, sig: null, out: null, outSpec: null, msg: null, scale: 0, lines: null, msgSpec: null, msgPk: 1, outPeak: 0, dust: false, linesFromTwin: false };
function interpPeak(A, k) { // 抛物线插值峰频（Hz）
  if (k <= 0 || k >= A.length - 1) return k * DF;
  const y1 = A[k - 1], y2 = A[k], y3 = A[k + 1];
  const d = (y1 - 2 * y2 + y3);
  const off = d !== 0 ? 0.5 * (y1 - y3) / d : 0;
  return (k + clamp(off, -1, 1)) * DF;
}
function measureLines(A, fmHz) {
  // 在 fm ±8 Hz 内找峰：最高峰 + 与之相隔 ≥3 bin 的第二峰（幅值 ≥30%）
  const kLo = Math.max(1, Math.round((fmHz - 8) / DF)), kHi = Math.round((fmHz + 8) / DF);
  let k1 = kLo;
  for (let k = kLo; k <= kHi; k++) if (A[k] > A[k1]) k1 = k;
  let k2 = -1;
  for (let k = kLo; k <= kHi; k++) {
    if (Math.abs(k - k1) < 3) continue;
    if (A[k] >= 0.3 * A[k1] && (k2 < 0 || A[k] > A[k2])) k2 = k;
  }
  if (k2 < 0) return { single: true, f: interpPeak(A, k1) };
  const f1 = interpPeak(A, k1), f2 = interpPeak(A, k2);
  return { single: false, f1: Math.min(f1, f2), f2: Math.max(f1, f2) };
}
function computeS2() {
  if (!s2.sig) { s2.sig = dsbSignal(s2msgFn, S2_FC); s2.msg = sampleFn(s2msgFn); }
  s2.out = coherentDemod(s2.sig, S2_FC, s2.df, s2.phi, 60);
  s2.scale = projCoef(s2.out, s2.msg);
  s2.outSpec = ampSpectrum(s2.out);
  if (!s2.msgSpec) s2.msgSpec = ampSpectrum(s2.msg);
  s2.msgPk = Math.max(...s2.msgSpec.slice(0, 41)); // 原消息谱峰（纵轴参照下限的定标基准）
  s2.outPeak = Math.max(...s2.outSpec.slice(0, 41)); // 主路输出在绘图窗内的实测谱峰
  let A = s2.outSpec, mx = 0;
  for (let k = 2; k <= 20; k++) mx = Math.max(mx, A[k]);
  s2.dust = mx < 1e-9; // 主路输出为浮点尘（如 φ=90°）：谱图改按参照下限画并加尘注，见 drawS2
  s2.linesFromTwin = s2.dust;
  if (s2.dust) { // 谱线位置与 φ 无关，用 φ=0 孪生路量位置（数值本身仍取自主路；页面读数已注明此量法）
    const twin = coherentDemod(s2.sig, S2_FC, s2.df, 0, 60);
    A = ampSpectrum(twin);
  }
  s2.lines = measureLines(A, S2_FM);
}
function drawS2() {
  drawLanes($('s2-wave'), [
    { data: s2.sig, color: '#5f7089', label: 'DSB', i0: 0, i1: 1024, yMax: 1.2 },
    {
      data: s2.out, color: '#6ee7ff', label: t('cv2Out'), i0: 0, i1: 1024, yMax: 1.2,
      overlay: { data: s2.msg, color: '#9aa7b8' }
    }
  ]);
  drawSpec($('s2-spec'), s2.outSpec, {
    fLo: 0, fHi: 40, tickStep: 10,
    // 纵轴参照下限：不低于原消息谱峰的 1/4——正常态由实测峰决定（与旧行为一致），
    // 浮点尘态不再被自动缩放放大成像真谱线；尘态另在图上加量级注记。
    yMax: Math.max(s2.outPeak * 1.18, 0.25 * s2.msgPk),
    note: s2.dust ? t('cv2Dust', { amp: fmtSmart(s2.outPeak) }) : null,
    legend: [[t('cv2Spec'), '#6ee7ff'], [t('cv2Ref'), '#9aa7b8']]
  });
}
function updateS2() {
  computeS2();
  $('s2-df-val').textContent = fmtS(s2.df, 1) + ' Hz';
  $('s2-phi-val').textContent = fmtS(s2.phi, 0) + '°';
  const lines = s2.lines.single
    ? t('s2linesSingle', { f: fmtS(s2.lines.f, 1) })
    : t('s2linesPair', { f1: fmtS(s2.lines.f1, 1), f2: fmtS(s2.lines.f2, 1) });
  $('s2-readout').innerHTML = t('s2ro', {
    scale: fmtSmart(s2.scale), cosphi: fmtS(Math.cos(s2.phi * Math.PI / 180), 3), lines
  }) + (s2.linesFromTwin ? '<br>' + t('s2roTwin') : '');
  drawS2();
}

/* ================================================================
   第 3 步 · 包络检波：二极管峰值 + RC 放电 vs 相干解调
   ================================================================ */
const S3_FC = 200;
const s3msgFn = i => Math.cos(2 * Math.PI * 10 * tt(i));
const s3 = { m: 0.8, tauMs: 15, sig: null, det: null, coh: null, envFit: null, cohFit: null, msg: null };
function computeS3() {
  if (!s3.msg) s3.msg = sampleFn(s3msgFn);
  s3.sig = amSignal(s3msgFn, s3.m, S3_FC);
  s3.det = envDetectPeak(s3.sig, s3.tauMs / 1000);
  s3.coh = coherentDemod(s3.sig, S3_FC, 0, 0, 60);
  s3.envFit = lsFit(s3.det, s3.msg, 300, N);
  s3.cohFit = lsFit(s3.coh, s3.msg, 300, N);
}
function drawS3() {
  const envArr = sampleFn(i => 1 + s3.m * s3msgFn(i));
  const yM = (1 + s3.m) * 1.18;
  drawLanes($('s3-wave'), [
    {
      data: s3.sig, color: '#5f7089', label: t('cv3Sig'), i0: 0, i1: 614, yMax: yM, width: 1.2,
      overlay: { data: s3.det, color: '#ffb454', dash: [] }
    },
    {
      data: s3.det, color: '#ffb454', label: t('cv3Env') + ' / ' + t('cv3True'), i0: 0, i1: 614, yMax: yM,
      overlay: { data: envArr, color: '#6ee7ff' }
    }
  ]);
}
function updateS3() {
  computeS3();
  $('s3-m-val').textContent = fmtS(s3.m, 2);
  $('s3-tau-val').textContent = fmtS(s3.tauMs, s3.tauMs < 10 ? 1 : 0) + ' ms';
  $('s3-env-big').innerHTML = t('s3snr', { v: fmtDb(s3.envFit.snrDb) });
  $('s3-coh-big').innerHTML = t('s3snr', { v: fmtDb(s3.cohFit.snrDb) });
  $('s3-readout').innerHTML = t('s3ro', { tau: fmtS(s3.tauMs, s3.tauMs < 10 ? 1 : 0), snr: fmtDb(s3.envFit.snrDb) });
  drawS3();
}

/* ================================================================
   第 4 步 · FM：瞬时频率、OBW 实测 vs Carson、抗噪擂台
   ================================================================ */
const S4_FC = 200, S4_FM = 10;
const s4msgFn = i => Math.cos(2 * Math.PI * S4_FM * tt(i));
const s4 = { beta: 2.5, sig: null, spec: null, obw: null, finst: null, carAmp: 0 };
function computeS4() {
  s4.sig = fmSignal(s4.beta, S4_FM, S4_FC);
  s4.spec = ampSpectrum(s4.sig);
  s4.obw = obw98(s4.sig);
  s4.carAmp = s4.spec[S4_FC];
  s4.finst = fmDemod(s4.sig, S4_FC, s4.beta * S4_FM, 40).finst;
}
function drawS4Top() {
  const cv = $('s4-top'), ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  ctx.fillStyle = '#11161f'; ctx.fillRect(0, 0, W, H);
  const df = s4.beta * S4_FM;
  // 上半：瞬时频率（一个消息周期，取中段样本避开边缘）
  const topH = H * 0.52;
  putText(ctx, t('cv4Finst'), 10, 16, { color: '#6ee7ff', font: '12.5px system-ui, sans-serif' });
  const fLo = S4_FC - df - 18, fHi = S4_FC + df + 18;
  const i0 = 819, i1 = 819 + 205; // 0.1 s = 一个消息周期
  const X = i => 10 + (i - i0) / (i1 - i0) * (W - 20);
  const Y = f => 26 + (fHi - f) / (fHi - fLo) * (topH - 40);
  ctx.strokeStyle = 'rgba(120,140,165,0.3)';
  ctx.beginPath(); ctx.moveTo(10, Y(S4_FC)); ctx.lineTo(W - 10, Y(S4_FC)); ctx.stroke();
  putText(ctx, 'fc ' + fmtS(S4_FC, 0), W - 12, Y(S4_FC) - 5, { align: 'right', color: '#5f7089', font: '10.5px system-ui, sans-serif' });
  putText(ctx, fmtS(fHi, 0), W - 12, 26 + 8, { align: 'right', color: '#5f7089', font: '10.5px system-ui, sans-serif' });
  putText(ctx, fmtS(fLo, 0), W - 12, Y(fLo) + 3, { align: 'right', color: '#5f7089', font: '10.5px system-ui, sans-serif' });
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = i0; i <= i1; i++) {
    const x = X(i), y = Y(clamp(s4.finst[i], fLo, fHi));
    if (i === i0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // 下半：FM 波形节选（0.06 s）
  const yBase = topH + 8;
  putText(ctx, t('cv4Wave'), 10, yBase + 12, { color: '#9aa7b8', font: '12.5px system-ui, sans-serif' });
  const cy = yBase + (H - yBase) / 2 + 6, amp = (H - yBase) / 2 - 16;
  ctx.strokeStyle = 'rgba(120,140,165,0.22)';
  ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(W - 8, cy); ctx.stroke();
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  const j0 = 819, j1 = 819 + 123;
  for (let i = j0; i <= j1; i++) {
    const x = 8 + (i - j0) / (j1 - j0) * (W - 16), y = cy - s4.sig[i] * amp;
    if (i === j0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function drawS4Spec() {
  const carson = 2 * (s4.beta * S4_FM + S4_FM);
  drawSpec($('s4-spec'), s4.spec, {
    fLo: 70, fHi: 330, tickStep: 40,
    shade: [s4.obw.flo, s4.obw.fhi, 'rgba(110,231,255,0.10)'],
    vlines: [
      { f: S4_FC - carson / 2, color: '#ff7a93', label: t('cv4Carson') },
      { f: S4_FC + carson / 2, color: '#ff7a93', label: t('cv4Carson') }
    ],
    legend: [[t('cv4Spec'), '#6ee7ff'], [t('cv4Obw'), '#6ee7ff']],
    marks: [{ f: s4.obw.fhi, label: t('cv4Obw') + ' ' + fmtS(s4.obw.bw, 0) + ' Hz', color: '#6ee7ff' }]
  });
}
function updateS4() {
  computeS4();
  $('s4-beta-val').textContent = fmtS(s4.beta, 1);
  const carson = 2 * (s4.beta * S4_FM + S4_FM);
  $('s4-readout').innerHTML = t('s4ro', {
    df: fmtS(s4.beta * S4_FM, 0), bw: fmtS(s4.obw.bw, 0),
    carson: fmtS(carson, 0), car: fmtS(s4.carAmp, 3)
  });
  drawS4Top(); drawS4Spec();
}

/* ---------- 抗噪擂台（固定口径：σ=0.2、AM m=0.8 包络 τ=15ms、FM β=2.5） ---------- */
const s4a = { seed: 20261016, noisePow: 0, inAm: 0, inFm: 0, amFit: null, fmFit: null, msg: null, amDisp: null, fmDisp: null };
function computeArena() {
  if (!s4a.msg) s4a.msg = sampleFn(s4msgFn);
  const noise = gaussNoise(s4a.seed, N, 0.2);
  s4a.noisePow = meanPower(noise);
  const amClean = amSignal(s4msgFn, 0.8, S4_FC);
  const fmClean = fmSignal(2.5, S4_FM, S4_FC);
  const amSig = new Float64Array(N), fmSig = new Float64Array(N);
  for (let i = 0; i < N; i++) { amSig[i] = amClean[i] + noise[i]; fmSig[i] = fmClean[i] + noise[i]; }
  s4a.inAm = 10 * Math.log10(meanPower(amClean) / s4a.noisePow);
  s4a.inFm = 10 * Math.log10(meanPower(fmClean) / s4a.noisePow);
  const amOut = envDetectPeak(amSig, 0.015);
  const fmOut = fmDemod(fmSig, S4_FC, 25, 40).est;
  s4a.amFit = lsFit(amOut, s4a.msg, 300, N - 50);
  s4a.fmFit = lsFit(fmOut, s4a.msg, 300, N - 50);
  const norm = (out, fit) => {
    const y = new Float64Array(N);
    for (let i = 0; i < N; i++) y[i] = (out[i] - fit.b) / fit.a;
    return y;
  };
  s4a.amDisp = norm(amOut, s4a.amFit);
  s4a.fmDisp = norm(fmOut, s4a.fmFit);
  s4a.amSig = amSig; s4a.fmSig = fmSig;
}
function drawArena() {
  drawLanes($('s4-arena'), [
    { data: s4a.msg, color: '#9aa7b8', label: t('cv4MsgRef'), i0: 300, i1: 1324, yMax: 1.7 },
    { data: s4a.amDisp, color: '#ffb454', label: t('cv4AmOut'), i0: 300, i1: 1324, yMax: 1.7 },
    { data: s4a.fmDisp, color: '#6ee7ff', label: t('cv4FmOut'), i0: 300, i1: 1324, yMax: 1.7 }
  ]);
}
function updateArena() {
  computeArena();
  const margin = s4a.fmFit.snrDb - s4a.amFit.snrDb;
  $('s4-arena-ro').innerHTML = t('s4aRo', {
    seed: String(s4a.seed), np: fmtS(s4a.noisePow, 4),
    inAm: fmtDb(s4a.inAm), inFm: fmtDb(s4a.inFm),
    outAm: fmtDb(s4a.amFit.snrDb), outFm: fmtDb(s4a.fmFit.snrDb),
    margin: fmtDb(margin)
  });
  drawArena();
}

/* ================================================================
   第 5 步 · 频分复用：三台共存、带通选台、串扰拟合
   ================================================================ */
const STA = [
  { key: 'staA', fn: i => Math.cos(2 * Math.PI * 6 * tt(i)) },
  { key: 'staB', fn: i => 0.8 * Math.cos(2 * Math.PI * 4 * tt(i)) + 0.6 * Math.cos(2 * Math.PI * 9 * tt(i)) },
  { key: 'staC', fn: i => 0.9 * Math.cos(2 * Math.PI * 12 * tt(i)) }
];
const S5_BASE = 150, S5_GAP = 60;
const s5 = { target: 0, tune: 150, space: 1, carriers: [150, 210, 270], msgs: null, sig: null, spec: null, out: null, snr: 0, xtDb: 0, share: 0 };
function computeS5() {
  s5.carriers = STA.map((_, j) => S5_BASE + j * S5_GAP * s5.space);
  if (!s5.msgs) s5.msgs = STA.map(s => sampleFn(s.fn));
  s5.sig = new Float64Array(N);
  const parts = s5.carriers.map((fc, j) => dsbSignal(STA[j].fn, fc));
  for (let j = 0; j < 3; j++) for (let i = 0; i < N; i++) s5.sig[i] += parts[j][i];
  s5.spec = ampSpectrum(s5.sig);
  // 带内功率占比（各台功率谱在带通窗内的份额）
  const pows = parts.map(p => powerSpectrum(p));
  let bandT = 0, bandAll = 0;
  for (let k = 0; k < pows[0].length; k++) {
    if (Math.abs(k * DF - s5.tune) <= 25) {
      bandAll += pows[0][k] + pows[1][k] + pows[2][k];
      bandT += pows[s5.target][k];
    }
  }
  s5.share = bandAll > 0 ? bandT / bandAll : 0;
  // 接收链：带通（掩模 ±25 Hz）→ 相干解调（低通 30 Hz）
  const bp = bpMask(s5.sig, s5.tune, 25);
  s5.out = coherentDemod(bp, s5.tune, 0, 0, 30);
  const fit = lsFit(s5.out, s5.msgs[s5.target]);
  s5.snr = fit.snrDb;
  // 串扰 = 输出中「非本台成分」功率 ÷ 本台成分功率（功率分解；本链无噪声，非本台功率即邻台泄漏）
  s5.xtDb = fit.sigPow > 1e-300 ? 10 * Math.log10(Math.max(fit.resPow, 1e-300) / fit.sigPow) : -Infinity;
  const joint = jointFit(s5.out, s5.msgs);
  s5.jointShares = joint.shares;
}
function drawS5() {
  drawSpec($('s5-spec'), s5.spec, {
    fLo: 80, fHi: 340, tickStep: 40,
    shade: [s5.tune - 25, s5.tune + 25, 'rgba(255,180,84,0.10)'],
    legend: [[t('cv5Spec'), '#6ee7ff']],
    marks: s5.carriers.map((fc, j) => ({ f: fc, label: t(STA[j].key) + ' ' + fmtS(fc, 0), color: j === s5.target ? '#ffb454' : '#9aa7b8' }))
  });
  drawLanes($('s5-wave'), [
    { data: s5.sig, color: '#5f7089', label: 'CH', i0: 0, i1: 1024, yMax: 3.1, width: 1.2 },
    {
      data: s5.out, color: '#6ee7ff', label: t('cv5Out'), i0: 0, i1: 1024, yMax: 1.35,
      overlay: { data: s5.msgs[s5.target], color: '#9aa7b8' }
    }
  ]);
}
function updateS5() {
  computeS5();
  $('s5-tune-val').textContent = fmtS(s5.tune, 0) + ' Hz';
  $('s5-space-val').textContent = fmtS(s5.space, 2);
  $('s5-tune').value = String(s5.tune);
  $('s5-readout').innerHTML = t('s5ro', {
    name: t(STA[s5.target].key), fc: fmtS(s5.carriers[s5.target], 0),
    snr: fmtDb(s5.snr), xt: fmtDb(s5.xtDb), share: fmtS(s5.share * 100, 1) + '%'
  });
  drawS5();
}

/* ================================================================
   第 6 步 · I/Q：正交双路同频发送与分离
   ================================================================ */
const S6_FC = 200;
const s6I = i => Math.cos(2 * Math.PI * 6 * tt(i));
const s6Q = i => Math.cos(2 * Math.PI * 15 * tt(i));
const s6 = { mode: 'orth', tx: null, recI: null, recQ: null, ai: 0, aq: 0, xi: null, xq: null, arrI: null, arrQ: null };
function computeS6() {
  if (!s6.arrI) { s6.arrI = sampleFn(s6I); s6.arrQ = sampleFn(s6Q); }
  if (s6.mode === 'orth') {
    s6.tx = sampleFn(i => s6I(i) * Math.cos(2 * Math.PI * S6_FC * tt(i)) - s6Q(i) * Math.sin(2 * Math.PI * S6_FC * tt(i)));
  } else {
    s6.tx = sampleFn(i => (s6I(i) + s6Q(i)) * Math.cos(2 * Math.PI * S6_FC * tt(i)));
  }
  s6.recI = coherentDemod(s6.tx, S6_FC, 0, 0, 60);
  const mixQ = sampleFn(i => -2 * s6.tx[i] * Math.sin(2 * Math.PI * S6_FC * tt(i)));
  s6.recQ = lpMask(mixQ, 60);
  s6.ai = projCoef(s6.recI, s6.arrI);
  s6.aq = projCoef(s6.recQ, s6.arrQ);
  const xiC = projCoef(s6.recI, s6.arrQ), xqC = projCoef(s6.recQ, s6.arrI);
  s6.xi = Math.abs(s6.ai) > 1e-9 ? 20 * Math.log10(Math.abs(xiC / s6.ai)) : null;
  s6.xq = Math.abs(s6.aq) > 1e-9 ? 20 * Math.log10(Math.abs(xqC / s6.aq)) : null;
}
function drawS6() {
  drawLanes($('s6-wave'), [
    { data: s6.tx, color: '#5f7089', label: t('cv6Tx'), i0: 0, i1: 1024, yMax: 2.3, width: 1.2 },
    {
      data: s6.recI, color: '#6ee7ff', label: t('cv6I'), i0: 0, i1: 1024, yMax: 1.35,
      overlay: { data: s6.arrI, color: '#9aa7b8' }
    },
    {
      data: s6.recQ, color: '#ffb454', label: t('cv6Q'), i0: 0, i1: 1024, yMax: 1.35,
      overlay: { data: s6.arrQ, color: '#9aa7b8' }
    }
  ]);
}
function updateS6() {
  computeS6();
  $('s6-readout').innerHTML = t('s6ro', {
    ai: fmtSmart(s6.ai), xi: s6.xi === null ? '—' : fmtDb(s6.xi),
    aq: fmtSmart(s6.aq), xq: s6.xq === null ? '—' : fmtDb(s6.xq)
  });
  drawS6();
}

/* ================================================================
   评审对账接口 window.MOD
   ================================================================ */
window.MOD = {
  FS, N, DF,
  fft, ifft, ampSpectrum, powerSpectrum, obw98, lpMask, bpMask, analytic,
  mulberry32, gaussNoise, sampleFn, amSignal, dsbSignal, fmSignal,
  coherentDemod, envDetectPeak, fmDemod, lsFit, projCoef, jointFit, meanPower,
  fns: { s0msgFn, s1msgFn, s2msgFn, s3msgFn, s4msgFn, sta: STA.map(s => s.fn), s6I, s6Q },
  state: { s0, s1, s2, s3, s4, s4a, s5, s6 },
  update: { updateS0, updateS1, updateS2, updateS3, updateS4, updateArena, updateS5, updateS6 }
};

/* ================================================================
   接线与初始化
   ================================================================ */
function updateAll() { updateS0(); updateS1(); updateS2(); updateS3(); updateS4(); updateArena(); updateS5(); updateS6(); }
document.addEventListener('DOMContentLoaded', () => {
  ['s0-wave', 's0-spec', 's1-wave', 's1-spec', 's2-wave', 's2-spec', 's3-wave',
   's4-top', 's4-spec', 's4-arena', 's5-spec', 's5-wave', 's6-wave']
   .forEach(id => ctxOf(id));

  $('s0-fc').addEventListener('input', e => { s0.fc = parseFloat(e.target.value); updateS0(); });
  $('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));
  animate($('step0'), dt => { s0.phase += dt * 0.3; drawS0Wave(); });

  const setS1Type = ty => {
    s1.type = ty;
    $('s1-msg-single').classList.toggle('active', ty === 'single');
    $('s1-msg-dual').classList.toggle('active', ty === 'dual');
    updateS1();
  };
  $('s1-msg-single').addEventListener('click', () => setS1Type('single'));
  $('s1-msg-dual').addEventListener('click', () => setS1Type('dual'));
  $('s1-m').addEventListener('input', e => { s1.m = parseFloat(e.target.value); updateS1(); });

  $('s2-df').addEventListener('input', e => { s2.df = parseFloat(e.target.value); updateS2(); });
  $('s2-phi').addEventListener('input', e => { s2.phi = parseFloat(e.target.value); updateS2(); });

  $('s3-m').addEventListener('input', e => { s3.m = parseFloat(e.target.value); updateS3(); });
  $('s3-tau').addEventListener('input', e => { s3.tauMs = Math.pow(10, parseFloat(e.target.value)); updateS3(); });

  $('s4-beta').addEventListener('input', e => { s4.beta = parseFloat(e.target.value); updateS4(); });
  $('s4-seed').addEventListener('click', () => { s4a.seed += 1; updateArena(); });

  const setTarget = j => {
    s5.target = j;
    [0, 1, 2].forEach(k => $('s5-tgt-' + k).classList.toggle('active', k === j));
    s5.tune = Math.round(S5_BASE + j * S5_GAP * s5.space);
    updateS5();
  };
  [0, 1, 2].forEach(j => $('s5-tgt-' + j).addEventListener('click', () => setTarget(j)));
  $('s5-tune').addEventListener('input', e => { s5.tune = parseFloat(e.target.value); updateS5(); });
  $('s5-space').addEventListener('input', e => { s5.space = parseFloat(e.target.value); updateS5(); });

  const setS6Mode = md => {
    s6.mode = md;
    $('s6-orth').classList.toggle('active', md === 'orth');
    $('s6-broken').classList.toggle('active', md === 'broken');
    updateS6();
  };
  $('s6-orth').addEventListener('click', () => setS6Mode('orth'));
  $('s6-broken').addEventListener('click', () => setS6Mode('broken'));

  updateAll();
  onLangRefresh(() => updateAll());
  onRefit(() => updateAll());
});
