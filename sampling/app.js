'use strict';
/* 采样与混叠交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D + Web Audio）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh() / STR。

   ★ 红线：混叠频率公式全页唯一实现（aliasSigned / aliasFreq）。
   第 0 步轮子表观转速、第 2 步假波、第 3 步判据、第 4 步频谱峰位置、
   第 5 步音频 buffer 与轮子验算，全部调用这一处，不许各算各的。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 混叠公式（全页唯一口径） ----------
   k 取使 f − k·f_s 落入 [−f_s/2, f_s/2] 的整数（即 round(f/f_s)）；
   带符号结果 g 的绝对值就是 f_alias，符号表示折叠方向（负 = 相位/方向翻转）。 */
function aliasSigned(f, fs) {
  const k = Math.round(f / fs);
  return { k, g: f - k * fs };
}
function aliasFreq(f, fs) { return Math.abs(aliasSigned(f, fs).g); }
/* 供自测/评审在控制台对账 */
window.SAMPLING = { aliasSigned, aliasFreq };

/* ---------- 画布适配（DPR）：沿用傅里叶页 fitCanvas 方案 ---------- */
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
function fmt(v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
function dirKey(g) { return g > 1e-9 ? 'dirFwd' : (g < -1e-9 ? 'dirRev' : 'dirStill'); }
/* 轮子边界情形：|g| 恰为 f_s/2 时正/倒转不可分辨（第 3 步等号情形），读数加注 */
function edgeNote(g, fs) { return Math.abs(Math.abs(g) - fs / 2) < 1e-9 ? t('wNoteEdge') : ''; }

/* ---------- 共享波形场景渲染（第 1/2/3 步共用） ----------
   opts: { f, fs, win, phase(采样相位 rad), connect:'line'|'hold'|null,
           showAlias, reveal(0..1 已落下的采样点比例) }
   采样点坐标严格由 t_n = n / f_s 计算，值 = sin(2π f t_n + phase)；
   假波画 sin(2π g t + phase)，g 为带符号折叠频率 —— 它数学上穿过每个采样点。 */
function drawWaveScene(cv, o) {
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 12, padR = 12, padT = 30, padB = 26;
  const pw = w - padL - padR, ph = h - padT - padB;
  const X = tt => padL + (tt / o.win) * pw;
  const Y = v => padT + ph / 2 - v * (ph / 2) / 1.3;
  /* 图例 */
  ctx.font = '12.5px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  let lx = padL;
  const legend = [[t('cOrig'), '#8494ab']];
  if (o.connect) legend.push([t('cRecon'), '#6ee7ff']);
  if (o.showAlias) legend.push([t('cAlias'), '#ff7a93']);
  legend.push([t('cSamp'), '#ffd166']);
  for (const [txt, col] of legend) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx, 13); ctx.lineTo(lx + 20, 13); ctx.stroke();
    ctx.fillText(txt, lx + 25, 14);
    lx += 25 + ctx.measureText(txt).width + 18;
  }
  /* 网格与零线 */
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + pw, Y(0)); ctx.stroke();
  ctx.strokeStyle = '#1a2230';
  ctx.strokeRect(padL, padT, pw, ph);
  /* 时间轴刻度 */
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const tickDec = (o.win / 2) % 1 !== 0 ? 1 : 0;
  for (const tt of [0, o.win / 2, o.win]) {
    ctx.fillText(fmt(tt, tickDec) + 's', X(tt), padT + ph + 14);
  }
  ctx.textAlign = 'left';
  /* 原波 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i <= pw; i++) {
    const tt = (i / pw) * o.win;
    const v = Math.sin(TAU * o.f * tt);
    i ? ctx.lineTo(X(tt), Y(v)) : ctx.moveTo(X(tt), Y(v));
  }
  ctx.stroke();
  /* 采样点（真实采样时刻） */
  const total = Math.floor(o.fs * o.win) + 1;
  const shown = o.reveal === undefined ? total : Math.max(0, Math.min(total, Math.floor(o.reveal * total)));
  const pts = [];
  /* 采样相位 = 采样时刻整体平移 shift 秒；点画在偷看发生的瞬间，值取该瞬间原波的值 */
  const shift = (o.phase || 0) / (TAU * o.f);
  for (let n = 0; n < shown; n++) {
    const tn = n / o.fs;
    pts.push([tn + shift, Math.sin(TAU * o.f * tn + (o.phase || 0))]);
  }
  /* 假波（采样点不可分辨的那条波） */
  if (o.showAlias) {
    const g = aliasSigned(o.f, o.fs).g;
    ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= pw; i++) {
      const tt = (i / pw) * o.win;
      const v = Math.abs(g) < 1e-12
        ? Math.sin(o.phase || 0)
        : Math.sin(TAU * g * tt + (o.phase || 0));
      i ? ctx.lineTo(X(tt), Y(v)) : ctx.moveTo(X(tt), Y(v));
    }
    ctx.stroke();
  }
  /* 连点重建 */
  if (o.connect && pts.length > 1) {
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
    ctx.beginPath();
    if (o.connect === 'hold') {
      ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(X(pts[i][0]), Y(pts[i - 1][1]));
        ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
      }
    } else {
      pts.forEach((p, i) => { i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); });
    }
    ctx.stroke();
  }
  /* 采样点标记 */
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(X(p[0]), Y(p[1]), 4, 0, TAU);
    ctx.fillStyle = '#ffd166'; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = '#0d1117'; ctx.stroke();
  }
}

/* ---------- 轮子渲染（第 0 步与第 5 步共用） ----------
   angle = 摄像机当前帧定格的角度（采样保持）；trueAngle = 此刻真角度（画橙点）。 */
function drawWheel(cv, angle, spokes, trueAngle, flash) {
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2 - 6, R = Math.min(w, h) * 0.38;
  /* 地面与支架 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - R - 26, cy + R + 16); ctx.lineTo(cx + R + 26, cy + R + 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 16, cy + R + 16); ctx.moveTo(cx, cy); ctx.lineTo(cx + 16, cy + R + 16); ctx.stroke();
  /* 轮胎 */
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
  ctx.strokeStyle = '#9aa7b8'; ctx.lineWidth = Math.max(6, R * 0.09); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.86, 0, TAU);
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1.5; ctx.stroke();
  /* 辐条 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = Math.max(3, R * 0.045); ctx.lineCap = 'round';
  for (let i = 0; i < spokes; i++) {
    const a = angle + i * TAU / spokes;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * 0.84 * Math.cos(a), cy + R * 0.84 * Math.sin(a));
    ctx.stroke();
  }
  /* 轮毂 */
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.11, 0, TAU);
  ctx.fillStyle = '#e8edf4'; ctx.fill();
  /* 真实位置点（橙） */
  if (trueAngle !== null && trueAngle !== undefined) {
    const tx = cx + R * Math.cos(trueAngle), ty = cy + R * Math.sin(trueAngle);
    ctx.beginPath(); ctx.arc(tx, ty, 6.5, 0, TAU);
    ctx.fillStyle = '#ffb454'; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#0d1117'; ctx.stroke();
    ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#ffb454';
    ctx.textAlign = tx > cx ? 'left' : 'right';
    ctx.fillText(t('cRealPos'), tx + (tx > cx ? 10 : -10), ty - 12);
    ctx.textAlign = 'left';
  }
  /* 左上角标注 + 抓拍闪光 */
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cSeen'), 12, 18);
  if (flash > 0.02) {
    ctx.strokeStyle = 'rgba(232,237,244,' + (flash * 0.55).toFixed(3) + ')';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, w - 6, h - 6);
  }
}

/* ============================================================
   第 0 步：轮子钩子（真转速恒定，摄像机采样保持）
   辐条通过频率 = N × rev = 6 × 2.5 = 15 Hz；表观转速 = aliasSigned(15, fps).g / 6
   ============================================================ */
const S0 = { rev: 2.5, spokes: 6, fps: 14, t: 0, held: 0, nextCap: 0, flash: 0 };
function s0Readout() {
  const sp = S0.spokes * S0.rev;
  const { g } = aliasSigned(sp, S0.fps);
  const app = g / S0.spokes;
  $('s0-readout').innerHTML = t('s0ro', {
    rev: fmt(S0.rev, 1), sp: fmt(sp, 0), fps: S0.fps,
    app: fmt(app, 2), dir: t(dirKey(g)), note: edgeNote(g, S0.fps)
  });
}
function initS0() {
  const sec = $('step0'), cv = $('s0-canvas');
  $('s0-fps').addEventListener('input', e => {
    S0.fps = +e.target.value;
    $('s0-fps-val').textContent = S0.fps;
    S0.nextCap = S0.t; /* 帧率变了：从此刻重新计抓拍，避免补帧爆发 */
    S0.held = TAU * S0.rev * S0.t;
    s0Readout();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  animate(sec, dt => {
    S0.t += dt;
    const interval = 1 / S0.fps;
    while (S0.t >= S0.nextCap) {
      S0.held = TAU * S0.rev * S0.nextCap;
      S0.nextCap += interval;
      S0.flash = 1;
    }
    S0.flash = Math.max(0, S0.flash - dt * 5);
    drawWheel(cv, S0.held, S0.spokes, TAU * S0.rev * S0.t, S0.flash);
  });
  onLangRefresh(s0Readout);
  onRefit(() => {});
  s0Readout();
}

/* ============================================================
   第 1 步：采样是偷看（点逐个落下；点位严格 t_n = n/f_s）
   ============================================================ */
const S1 = { f: 3, fs: 11, mode: 'line', animT: 0 };
function s1Readout() {
  $('s1-readout').innerHTML = t('s1ro', {
    f: fmt(S1.f, 1), fs: S1.fs, spp: fmt(S1.fs / S1.f, 1)
  });
}
function initS1() {
  const sec = $('step1'), cv = $('s1-canvas');
  $('s1-f').addEventListener('input', e => {
    S1.f = +e.target.value; $('s1-f-val').textContent = fmt(S1.f, 1);
    S1.animT = 0; s1Readout();
  });
  $('s1-fs').addEventListener('input', e => {
    S1.fs = +e.target.value; $('s1-fs-val').textContent = S1.fs;
    S1.animT = 0; s1Readout();
  });
  const setMode = m => {
    S1.mode = m;
    $('s1-mode-line').classList.toggle('active', m === 'line');
    $('s1-mode-hold').classList.toggle('active', m === 'hold');
  };
  $('s1-mode-line').addEventListener('click', () => setMode('line'));
  $('s1-mode-hold').addEventListener('click', () => setMode('hold'));
  animate(sec, dt => {
    S1.animT += dt;
    const total = Math.floor(S1.fs * 1) + 1;
    const dropTime = total / 14;          /* 每秒落约 14 个点 */
    const cycle = dropTime + 1.3;         /* 落完停一会儿再重来 */
    const lt = S1.animT % cycle;
    const reveal = clamp(lt / dropTime, 0, 1);
    drawWaveScene(cv, { f: S1.f, fs: S1.fs, win: 1, connect: S1.mode, reveal });
  });
  onLangRefresh(() => { s1Readout(); });
  s1Readout();
}

/* ============================================================
   第 2 步：假波诞生（假波与采样点严丝合缝；读数走唯一公式）
   ============================================================ */
const S2 = { f: 9, fs: 10 };
function s2Draw() {
  drawWaveScene($('s2-canvas'), { f: S2.f, fs: S2.fs, win: 2, connect: null, showAlias: true });
}
function s2Readout() {
  const { k, g } = aliasSigned(S2.f, S2.fs);
  const alias = Math.abs(g);
  let note = '';
  if (alias < 1e-12) note = t('s2noteDC');
  else if (Math.abs(alias - S2.f) < 1e-12) note = t('s2noteSame');
  else note = t('s2noteAlias');
  $('s2-readout').innerHTML = t('s2ro', {
    f: fmt(S2.f, 1), fs: fmt(S2.fs, 1), k, alias: fmt(alias, 1), note
  });
}
function s2Sync() { s2Draw(); s2Readout(); }
function initS2() {
  $('s2-f').addEventListener('input', e => {
    S2.f = +e.target.value; $('s2-f-val').textContent = fmt(S2.f, 1); s2Sync();
  });
  $('s2-fs').addEventListener('input', e => {
    S2.fs = +e.target.value; $('s2-fs-val').textContent = fmt(S2.fs, 1); s2Sync();
  });
  const preset = (f, fs) => () => {
    S2.f = f; S2.fs = fs;
    $('s2-f').value = f; $('s2-fs').value = fs;
    $('s2-f-val').textContent = fmt(f, 1); $('s2-fs-val').textContent = fmt(fs, 1);
    s2Sync();
  };
  $('s2-p-slow').addEventListener('click', preset(9, 10));
  $('s2-p-dc').addEventListener('click', preset(10, 10));
  $('s2-p-fold').addEventListener('click', preset(14, 20));
  $('s2-p-clean').addEventListener('click', preset(3, 25));
  onLangRefresh(s2Sync);
  onRefit(s2Draw);
  s2Sync();
}

/* ============================================================
   第 3 步：奈奎斯特线（恰好 2f 时相位决定一切）
   ============================================================ */
const S3 = { f: 4, fs: 10, phaseDeg: 90 };
function s3AtLine() { return Math.abs(S3.fs - 2 * S3.f) < 0.001; }
function s3PhaseRad() { return s3AtLine() ? S3.phaseDeg * Math.PI / 180 : 0; }
function s3Draw() {
  drawWaveScene($('s3-canvas'), {
    f: S3.f, fs: S3.fs, win: 1, connect: 'line',
    showAlias: S3.fs < 2 * S3.f - 0.001, phase: s3PhaseRad()
  });
}
function s3Readout() {
  const two = 2 * S3.f;
  if (s3AtLine()) {
    $('s3-readout').innerHTML = t('s3roAt', {
      two: fmt(two, 1), amp: fmt(Math.abs(Math.sin(s3PhaseRad())), 2)
    });
  } else if (S3.fs > two) {
    $('s3-readout').innerHTML = t('s3roAbove', { fs: fmt(S3.fs, 1), two: fmt(two, 1) });
  } else {
    $('s3-readout').innerHTML = t('s3roBelow', {
      fs: fmt(S3.fs, 1), two: fmt(two, 1), alias: fmt(aliasFreq(S3.f, S3.fs), 1)
    });
  }
  $('s3-phase').disabled = !s3AtLine();
}
function s3Sync() { s3Draw(); s3Readout(); }
function initS3() {
  $('s3-f').addEventListener('input', e => {
    S3.f = +e.target.value; $('s3-f-val').textContent = fmt(S3.f, 1); s3Sync();
  });
  $('s3-fs').addEventListener('input', e => {
    S3.fs = +e.target.value; $('s3-fs-val').textContent = fmt(S3.fs, 1); s3Sync();
  });
  $('s3-phase').addEventListener('input', e => {
    S3.phaseDeg = +e.target.value; $('s3-phase-val').textContent = S3.phaseDeg; s3Sync();
  });
  $('s3-snap').addEventListener('click', () => {
    S3.fs = 2 * S3.f;
    $('s3-fs').value = S3.fs; $('s3-fs-val').textContent = fmt(S3.fs, 1);
    s3Sync();
  });
  onLangRefresh(s3Sync);
  onRefit(s3Draw);
  s3Sync();
}

/* ============================================================
   第 4 步：频域看混叠（频谱以 f_s 为周期复制；峰位走唯一公式）
   ============================================================ */
const S4 = { f: 13, fs: 10 };
function s4Draw() {
  const cv = $('s4-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const { f, fs } = S4;
  const padL = 14, padR = 14, padT = 34, padB = 30;
  const pw = w - padL - padR, ph = h - padT - padB;
  const fmax = Math.ceil(Math.max(2.6 * fs, f + 0.9 * fs) / 5) * 5;
  const X = v => padL + (v / fmax) * pw;
  const base = padT + ph;
  /* 基带 [0, fs/2] */
  ctx.fillStyle = 'rgba(110,231,255,0.07)';
  ctx.fillRect(padL, padT - 8, X(fs / 2) - padL, ph + 8);
  ctx.strokeStyle = 'rgba(110,231,255,0.35)';
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(padL, padT - 8, X(fs / 2) - padL, ph + 8);
  ctx.setLineDash([]);
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#6ee7ff';
  ctx.fillText(t('cBase'), padL + 4, padT - 14);
  /* 复制中心虚线（每 fs 一条） */
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  for (let m = 1; m * fs < fmax; m++) {
    ctx.beginPath(); ctx.moveTo(X(m * fs), padT - 6); ctx.lineTo(X(m * fs), base); ctx.stroke();
  }
  /* 轴线与刻度 */
  ctx.strokeStyle = '#2b3547';
  ctx.beginPath(); ctx.moveTo(padL, base); ctx.lineTo(padL + pw, base); ctx.stroke();
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center';
  const tick = fmax > 60 ? 20 : 10;
  for (let v = 0; v <= fmax; v += tick) ctx.fillText(v + '', X(v), base + 16);
  ctx.textAlign = 'right';
  ctx.fillText('Hz', padL + pw, padT - 14);
  ctx.textAlign = 'left';
  /* 峰集合：|m·f_s ± f|，等高（纯音副本高度相同，示意自洽）
     f 恰为 f_s 整数倍时有一根峰折到 0（直流）：纳入集合，绘制时画贴左轴的半峰 */
  const pos = new Set();
  for (let m = 0; m * fs <= fmax + f; m++) {
    for (const s of [f, -f]) {
      const p = Math.abs(m * fs + s);
      if (p > 0.01 && p < fmax) pos.add(Math.round(p * 1000) / 1000);
      else if (p <= 0.01 && m >= 1) pos.add(0);
    }
  }
  const halfW = Math.max(0.45, fmax * 0.011);
  const peakH = ph * 0.66;
  const alias = aliasFreq(f, fs);
  let copyLabeled = false;
  [...pos].sort((a, b) => a - b).forEach(p => {
    const isOrig = Math.abs(p - f) < 1e-9;
    const isAlias = !isOrig && p <= fs / 2 + 1e-9 && Math.abs(p - alias) < 1e-9;
    const col = isOrig ? '#6ee7ff' : isAlias ? '#ff7a93' : '#8494ab';
    ctx.beginPath();
    if (p === 0) {
      /* 直流折叠峰：中心在 0，只画右半个三角，贴住左轴 */
      ctx.moveTo(X(0), base);
      ctx.lineTo(X(0), base - peakH);
      ctx.lineTo(X(halfW), base);
    } else {
      ctx.moveTo(X(p - halfW), base);
      ctx.lineTo(X(p), base - peakH);
      ctx.lineTo(X(p + halfW), base);
    }
    ctx.closePath();
    ctx.fillStyle = col; ctx.globalAlpha = isOrig || isAlias ? 0.95 : 0.55;
    ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'center';
    if (isOrig) ctx.fillText(t('cPeak') + ' = ' + fmt(f, 1), X(p), base - peakH - 10);
    else if (isAlias && p === 0) {
      /* 0 Hz 峰的标签居中会溢出左缘：靠左轴左对齐 */
      ctx.textAlign = 'left';
      ctx.fillText(t('cAliasPeak') + ' = ' + fmt(p, 1), X(0) + 5, base - peakH - 10);
      ctx.textAlign = 'center';
    }
    else if (isAlias) ctx.fillText(t('cAliasPeak') + ' = ' + fmt(p, 1), X(p), base - peakH - 10);
    else if (!copyLabeled && p > fs / 2) { ctx.fillText(t('cCopy'), X(p), base - peakH - 10); copyLabeled = true; }
    ctx.fillText(fmt(p, 0), X(p), base - 16);
    ctx.textAlign = 'left';
  });
}
function s4Readout() {
  const { f, fs } = S4;
  if (f > fs / 2) {
    $('s4-readout').innerHTML = t('s4ro', { fs, half: fmt(fs / 2, 1), alias: fmt(aliasFreq(f, fs), 1) });
  } else {
    $('s4-readout').innerHTML = t('s4roClean', { fs, half: fmt(fs / 2, 1) });
  }
}
function s4Sync() { s4Draw(); s4Readout(); }
function initS4() {
  $('s4-f').addEventListener('input', e => {
    S4.f = +e.target.value; $('s4-f-val').textContent = fmt(S4.f, 1); s4Sync();
  });
  $('s4-fs').addEventListener('input', e => {
    S4.fs = +e.target.value; $('s4-fs-val').textContent = S4.fs; s4Sync();
  });
  onLangRefresh(s4Sync);
  onRefit(s4Draw);
  s4Sync();
}

/* ============================================================
   图像管线工具（第 5、6 步共用同一条管线，只差预滤波一步）
   灰度图以 Float32Array 存（行主序）；抽取 = 最近邻取点。
   ============================================================ */
function makeGray(W, H, fn) {
  const g = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = fn(x, y);
  return g;
}
function grayToCanvas(gray, W, H) {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = clamp(Math.round(gray[i]), 0, 255);
    img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
function decimate(gray, W, H, stride) {
  const w2 = Math.ceil(W / stride), h2 = Math.ceil(H / stride);
  const out = new Float32Array(w2 * h2);
  for (let j = 0; j < h2; j++) for (let i = 0; i < w2; i++) {
    out[j * w2 + i] = gray[(j * stride) * W + i * stride];
  }
  return { gray: out, w: w2, h: h2 };
}
function boxBlur(gray, W, H, r) {
  if (r < 1) return gray;
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  const win = 2 * r + 1;
  for (let y = 0; y < H; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += gray[y * W + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = acc / win;
      acc += gray[y * W + clamp(x + r + 1, 0, W - 1)] - gray[y * W + clamp(x - r, 0, W - 1)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = acc / win;
      acc += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x];
    }
  }
  return out;
}
function drawGrayInto(cv, srcCanvas, pixelated) {
  const ctx = fitCanvas(cv);
  if (cv._w < 10) return;
  ctx.clearRect(0, 0, cv._w, cv._h);
  ctx.imageSmoothingEnabled = !pixelated;
  ctx.drawImage(srcCanvas, 0, 0, cv._w, cv._h);
}

/* ============================================================
   第 5 步 ①：音频——高频正弦按标称采样率逐点采样成 buffer
   buffer 第 n 个样本 = sin(2π f · n/f_s)，即采样时刻 t = n/f_s 的真值。
   播放时浏览器按 buffer 的 sampleRate 播出这些点，听到的音高 = f_alias。
   ============================================================ */
const S5A = { f: 6000, fs: 8000, data: null, zcrHz: 0, ctx: null, srcNode: null, oscNode: null };
function s5aBuild() {
  const dur = 2;
  const len = Math.round(dur * S5A.fs);
  const data = new Float32Array(len);
  for (let n = 0; n < len; n++) data[n] = Math.sin(TAU * S5A.f * n / S5A.fs);
  S5A.data = data;
  /* 过零率（带死区，避开浮点尘埃误计数）：显著符号翻转次数 / 2 / 时长 */
  let last = 0, flips = 0;
  for (let n = 0; n < len; n++) {
    const v = data[n];
    if (Math.abs(v) < 1e-3) continue;
    const s = v > 0 ? 1 : -1;
    if (last && s !== last) flips++;
    last = s;
  }
  S5A.zcrHz = flips / 2 / dur;
}
function s5aDraw() {
  const cv = $('s5a-canvas');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10 || !S5A.data) return;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cBuf'), 12, 18);
  const midY = h / 2 + 12, amp = (h - 50) / 2;
  ctx.strokeStyle = '#232d3f';
  ctx.beginPath(); ctx.moveTo(10, midY); ctx.lineTo(w - 10, midY); ctx.stroke();
  const N = Math.min(240, S5A.data.length);
  ctx.strokeStyle = '#6ee7ff'; ctx.fillStyle = '#ffd166'; ctx.lineWidth = 1;
  for (let n = 0; n < N; n++) {
    const x = 12 + (n / (N - 1)) * (w - 24);
    const v = S5A.data[n];
    ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x, midY - v * amp); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, midY - v * amp, 1.8, 0, TAU); ctx.fill();
  }
}
function s5aReadout() {
  const { k } = aliasSigned(S5A.f, S5A.fs);
  $('s5a-readout').innerHTML = t('s5aro', {
    f: S5A.f, fs: S5A.fs, k,
    alias: fmt(aliasFreq(S5A.f, S5A.fs), 0), zcr: fmt(S5A.zcrHz, 0)
  });
}
function s5aSync() { s5aBuild(); s5aDraw(); s5aReadout(); }
function s5aCtx() {
  if (!S5A.ctx) S5A.ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (S5A.ctx.state === 'suspended') S5A.ctx.resume();
  return S5A.ctx;
}
function initS5Audio() {
  $('s5a-f').addEventListener('input', e => {
    S5A.f = +e.target.value; $('s5a-f-val').textContent = S5A.f; s5aSync();
  });
  $('s5a-fs-row').querySelectorAll('button[data-fs]').forEach(b => {
    b.addEventListener('click', () => {
      $('s5a-fs-row').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      S5A.fs = +b.dataset.fs;
      s5aSync();
    });
  });
  $('s5a-play-alias').addEventListener('click', () => {
    const ctx = s5aCtx();
    if (S5A.srcNode) { try { S5A.srcNode.stop(); } catch (e) {} }
    const buf = new AudioBuffer({ length: S5A.data.length, numberOfChannels: 1, sampleRate: S5A.fs });
    buf.copyToChannel(S5A.data, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
    S5A.srcNode = src;
  });
  $('s5a-play-orig').addEventListener('click', () => {
    const ctx = s5aCtx();
    if (S5A.oscNode) { try { S5A.oscNode.stop(); } catch (e) {} }
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = S5A.f;
    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(t0 + 1.55);
    S5A.oscNode = osc;
  });
  onLangRefresh(() => { s5aDraw(); s5aReadout(); });
  onRefit(s5aDraw);
  s5aSync();
}

/* ============================================================
   第 5 步 ②：图像摩尔纹（真实最近邻抽取，无画纹代码）
   ============================================================ */
const S5I = { W: 480, H: 300, pattern: 'stripes', stride: 5, srcGray: null, srcCv: null };
function s5iBuildSrc() {
  const { W, H } = S5I;
  S5I.srcGray = S5I.pattern === 'stripes'
    ? makeGray(W, H, x => (Math.floor(x / 2) % 2 ? 235 : 25))
    : makeGray(W, H, (x, y) => ((Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? 235 : 25));
  S5I.srcCv = grayToCanvas(S5I.srcGray, W, H);
}
function s5iDraw() {
  if (!S5I.srcCv) return;
  drawGrayInto($('s5i-src'), S5I.srcCv, false);
  const d = decimate(S5I.srcGray, S5I.W, S5I.H, S5I.stride);
  drawGrayInto($('s5i-out'), grayToCanvas(d.gray, d.w, d.h), true);
  $('s5i-readout').innerHTML = t('s5iro', {
    w: S5I.W, h: S5I.H, m: S5I.stride, w2: d.w, h2: d.h
  });
}
function initS5Image() {
  $('s5i-stride').addEventListener('input', e => {
    S5I.stride = +e.target.value; $('s5i-stride-val').textContent = S5I.stride;
    s5iDraw();
    /* hint 里带步长数字，切语言/改步长都要刷新：直接重写 hint 文案 */
    const hintEl = document.querySelector('[data-i18n-html="s5iHint"]');
    if (hintEl) hintEl.innerHTML = t('s5iHint', { m: S5I.stride });
  });
  const setPat = p => {
    S5I.pattern = p;
    $('s5i-p-stripes').classList.toggle('active', p === 'stripes');
    $('s5i-p-grid').classList.toggle('active', p === 'grid');
    s5iBuildSrc(); s5iDraw();
  };
  $('s5i-p-stripes').addEventListener('click', () => setPat('stripes'));
  $('s5i-p-grid').addEventListener('click', () => setPat('grid'));
  onLangRefresh(() => {
    s5iDraw();
    const hintEl = document.querySelector('[data-i18n-html="s5iHint"]');
    if (hintEl) hintEl.innerHTML = t('s5iHint', { m: S5I.stride });
  });
  onRefit(() => { if (!$('s5-panel-image').classList.contains('hidden')) s5iDraw(); });
  s5iBuildSrc(); s5iDraw();
  const hintEl0 = document.querySelector('[data-i18n-html="s5iHint"]');
  if (hintEl0) hintEl0.innerHTML = t('s5iHint', { m: S5I.stride });
}

/* ============================================================
   第 5 步 ③：轮子验算（与第 0 步同一 drawWheel + 同一公式）
   ============================================================ */
const S5W = { n: 6, rev: 2.5, fps: 14, t: 0, held: 0, nextCap: 0, flash: 0 };
function s5wReadout() {
  const sp = S5W.n * S5W.rev;
  const { k, g } = aliasSigned(sp, S5W.fps);
  $('s5w-readout').innerHTML = t('s5wro', {
    n: S5W.n, rev: fmt(S5W.rev, 2), sp: fmt(sp, 1), k,
    app: fmt(g / S5W.n, 2), dir: t(dirKey(g)), note: edgeNote(g, S5W.fps)
  });
}
function initS5Wheel() {
  const cv = $('s5w-canvas');
  const bind = (id, valId, key, fmtD) => {
    $(id).addEventListener('input', e => {
      S5W[key] = +e.target.value;
      $(valId).textContent = fmt(S5W[key], fmtD);
      S5W.nextCap = S5W.t; S5W.held = TAU * S5W.rev * S5W.t;
      s5wReadout();
    });
  };
  bind('s5w-n', 's5w-n-val', 'n', 0);
  bind('s5w-rev', 's5w-rev-val', 'rev', 2);
  bind('s5w-fps', 's5w-fps-val', 'fps', 0);
  animate($('step5'), dt => {
    if ($('s5-panel-wheel').classList.contains('hidden')) return;
    S5W.t += dt;
    const interval = 1 / S5W.fps;
    while (S5W.t >= S5W.nextCap) {
      S5W.held = TAU * S5W.rev * S5W.nextCap;
      S5W.nextCap += interval;
      S5W.flash = 1;
    }
    S5W.flash = Math.max(0, S5W.flash - dt * 5);
    drawWheel(cv, S5W.held, S5W.n, TAU * S5W.rev * S5W.t, S5W.flash);
  });
  onLangRefresh(s5wReadout);
  s5wReadout();
}

/* ---------- 第 5 步页签 ---------- */
function initS5Tabs() {
  const tabs = { audio: $('s5-tab-audio'), image: $('s5-tab-image'), wheel: $('s5-tab-wheel') };
  const panels = { audio: $('s5-panel-audio'), image: $('s5-panel-image'), wheel: $('s5-panel-wheel') };
  const show = name => {
    for (const k in tabs) {
      tabs[k].classList.toggle('active', k === name);
      panels[k].classList.toggle('hidden', k !== name);
    }
    /* 面板刚变可见时画布 clientWidth 才有效：重新适配并重绘 */
    requestAnimationFrame(() => {
      allCanvases.forEach(fitCanvas);
      if (name === 'audio') s5aDraw();
      if (name === 'image') s5iDraw();
    });
  };
  tabs.audio.addEventListener('click', () => show('audio'));
  tabs.image.addEventListener('click', () => show('image'));
  tabs.wheel.addEventListener('click', () => show('wheel'));
}

/* ============================================================
   第 6 步：终章——抗混叠（同管线，只差预滤波一步）
   ============================================================ */
const S6 = { W: 440, H: 280, pattern: 'scene', stride: 6, srcGray: null };
function s6BuildSrc() {
  const { W, H } = S6;
  if (S6.pattern === 'scene') {
    /* 粗结构（太阳 + 天空渐变）叠加细条纹：模糊后粗结构应存活、细条纹应消失 */
    const sx = W * 0.68, sy = H * 0.36;
    S6.srcGray = makeGray(W, H, (x, y) => {
      const base = clamp(215 - Math.hypot(x - sx, y - sy) * 0.62 + (y / H) * 46 - 30, 20, 245);
      return base + (Math.floor(x / 2) % 2 ? 40 : -40);
    });
  } else {
    S6.srcGray = makeGray(W, H, x => (Math.floor(x / 2) % 2 ? 235 : 25));
  }
}
function s6Draw() {
  if (!S6.srcGray) return;
  const { W, H, stride } = S6;
  const d1 = decimate(S6.srcGray, W, H, stride);
  drawGrayInto($('s6-left'), grayToCanvas(d1.gray, d1.w, d1.h), true);
  const r = Math.max(2, Math.round(stride / 2));
  const blurred = boxBlur(boxBlur(S6.srcGray, W, H, r), W, H, r);
  const d2 = decimate(blurred, W, H, stride);
  drawGrayInto($('s6-right'), grayToCanvas(d2.gray, d2.w, d2.h), true);
  $('s6-readout').innerHTML = t('s6ro', { m: stride, r, w2: d1.w, h2: d1.h });
}
function s6SpecDraw() {
  const cv = $('s6-spec');
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 14, padR = 14, padT = 30, padB = 28;
  const pw = w - padL - padR, ph = h - padT - padB;
  const X = khz => padL + (khz / 48) * pw;
  const base = padT + ph;
  /* 信号带 0–20k */
  ctx.fillStyle = 'rgba(110,231,255,0.20)';
  ctx.fillRect(padL, base - ph * 0.62, X(20) - padL, ph * 0.62);
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#6ee7ff';
  ctx.fillText(t('cEar'), padL + 5, base - ph * 0.62 - 8);
  /* 滤波器滚降曲线：20k 前平坦，之后滚降到 24k 近零 */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= pw; i++) {
    const khz = (i / pw) * 48;
    let resp;
    if (khz <= 20) resp = 1;
    else if (khz >= 24) resp = 0.02;
    else { const u = (khz - 20) / 4; resp = 0.02 + 0.98 * (0.5 + 0.5 * Math.cos(Math.PI * u)); }
    const y = base - resp * ph * 0.62;
    i ? ctx.lineTo(padL + i, y) : ctx.moveTo(padL + i, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffb454';
  ctx.fillText(t('cLpf'), X(24.5), base - ph * 0.30);
  /* fs/2 与 fs 虚线 */
  ctx.strokeStyle = '#ff7a93'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(X(22.05), padT - 8); ctx.lineTo(X(22.05), base); ctx.stroke();
  ctx.strokeStyle = '#7ee2a8';
  ctx.beginPath(); ctx.moveTo(X(44.1), padT - 8); ctx.lineTo(X(44.1), base); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff7a93'; ctx.fillText(t('cHalfFs'), X(22.05) - 46, padT - 14);
  ctx.fillStyle = '#7ee2a8'; ctx.fillText(t('cCD'), X(44.1) - 40, padT - 14);
  /* 轴 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, base); ctx.lineTo(padL + pw, base); ctx.stroke();
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center';
  for (const v of [0, 10, 20, 30, 40]) ctx.fillText(v + '', X(v), base + 16);
  /* 末刻度与单位合成一枚右对齐标，避免「kHz」与「48」在右缘重叠 */
  ctx.textAlign = 'right';
  ctx.fillText('48 kHz', padL + pw, base + 16);
  ctx.textAlign = 'left';
}
function initS6() {
  $('s6-stride').addEventListener('input', e => {
    S6.stride = +e.target.value; $('s6-stride-val').textContent = S6.stride; s6Draw();
  });
  const setPat = p => {
    S6.pattern = p;
    $('s6-p-rings').classList.toggle('active', p === 'scene');
    $('s6-p-stripes').classList.toggle('active', p === 'stripes');
    s6BuildSrc(); s6Draw();
  };
  $('s6-p-rings').addEventListener('click', () => setPat('scene'));
  $('s6-p-stripes').addEventListener('click', () => setPat('stripes'));
  onLangRefresh(() => { s6Draw(); s6SpecDraw(); });
  onRefit(() => { s6Draw(); s6SpecDraw(); });
  s6BuildSrc(); s6Draw(); s6SpecDraw();
}

/* ---------- 启动（i18n 的 applyLang 已先行运行，各步 init 末尾各自首绘） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initS0(); initS1(); initS2(); initS3(); initS4();
  initS5Tabs(); initS5Audio(); initS5Image(); initS5Wheel();
  initS6();
});
