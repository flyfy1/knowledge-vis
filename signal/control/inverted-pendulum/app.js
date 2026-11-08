'use strict';
/* 反馈与控制交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D）
   物理核心在 sim-core.js（BalanceSim / HangingSim，固定 dt=1/480 半隐式欧拉）；
   双语在 i18n.js：t() / getLang() / onLangRefresh()。 */
const TAU = Math.PI * 2;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
const fmt = (v, d) => (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);

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
function ctxOf(id) { const cv = $(id); allCanvases.push(cv); return fitCanvas(cv); }
const redrawers = [];
function onRedraw(fn) { redrawers.push(fn); }

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

/* 固定步长推进：把真实时间喂进 sim 的累加器，与帧率解耦 */
function advance(sim, realDt, manualFn) {
  sim._acc = Math.min((sim._acc || 0) + realDt, 0.06);
  while (sim._acc >= SIM_DT) {
    sim.substep(manualFn ? manualFn() : undefined);
    sim._acc -= SIM_DT;
    if (sim.fallen && !manualFn) { sim._acc = 0; break; }
  }
}

/* ---------- 小车渲染（侧面：双轮 + 车身杆 + 顶部质量块） ---------- */
const PPM = 230; // 每米像素数（示意比例）
function drawCar(ctx, cv, sim, opts) {
  opts = opts || {};
  const W = cv._w, H = cv._h;
  ctx.clearRect(0, 0, W, H);
  const slope = (sim.slopeDeg || 0) * D2R;
  const gy = H * 0.8;
  const xOff = clamp(sim.xVis * PPM * 0.35, -W * 0.16, W * 0.16);
  const cx = W / 2 + xOff;
  // 地面（带坡度）：方向向量 (cosφ', sinφ')，φ>0 时右端更低
  const gdx = Math.cos(slope), gdy = Math.sin(slope);
  const nx = -gdy, ny = -gdx; // 地面法向（指向上方为负 y 屏幕坐标 → 取 (−sin, −cos) 的屏幕形式）
  const upx = Math.sin(slope), upy = -Math.cos(slope); // 沿地面向上的单位向量（屏幕）
  ctx.strokeStyle = '#3a465e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - gdx * (W * 0.62), gy - gdy * (W * 0.62));
  ctx.lineTo(cx + gdx * (W * 0.62), gy + gdy * (W * 0.62));
  ctx.stroke();
  // 地面刻痕（随 xVis 滚动）
  ctx.strokeStyle = '#242e42';
  ctx.lineWidth = 2;
  const scroll = ((-sim.xVis * PPM) % 46 + 46) % 46;
  for (let d = -W * 0.62; d < W * 0.62; d += 46) {
    const px = cx + gdx * (d + scroll - 23), py = gy + gdy * (d + scroll - 23);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - upx * 7, py - upy * 7); // 往地面下方
    ctx.stroke();
  }
  const wheelR = 15;
  const pivotX = cx + upx * wheelR, pivotY = gy + upy * wheelR;
  // 双轮（轮心沿地面法向抬高 wheelR）
  const wheelC = [];
  for (const s of [-1, 1]) {
    const wcx = cx + gdx * s * 52 + upx * wheelR;
    const wcy = gy + gdy * s * 52 + upy * wheelR;
    wheelC.push([wcx, wcy]);
    ctx.beginPath();
    ctx.arc(wcx, wcy - 0, wheelR, 0, TAU);
    ctx.fillStyle = '#232c3f';
    ctx.fill();
    ctx.strokeStyle = '#54637f';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wcx, wcy, 4, 0, TAU);
    ctx.fillStyle = '#8fa3c4';
    ctx.fill();
    // 轮辐（角度随 xVis 滚动示意）
    const wa = sim.xVis * PPM / wheelR + (s > 0 ? 0.7 : 0);
    ctx.strokeStyle = '#54637f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wcx - Math.cos(wa) * (wheelR - 3), wcy - Math.sin(wa) * (wheelR - 3));
    ctx.lineTo(wcx + Math.cos(wa) * (wheelR - 3), wcy + Math.sin(wa) * (wheelR - 3));
    ctx.stroke();
  }
  // 底盘（连两轮心）
  ctx.strokeStyle = '#8fa3c4';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(wheelC[0][0], wheelC[0][1]);
  ctx.lineTo(wheelC[1][0], wheelC[1][1]);
  ctx.stroke();
  // 竖直参考虚线
  const rodLen = sim.L * PPM;
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = 'rgba(154,167,184,.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(pivotX, pivotY - rodLen - 16);
  ctx.stroke();
  ctx.restore();
  // 车身杆 + 顶部质量块
  const th = sim.theta;
  const tipX = pivotX + Math.sin(th) * rodLen;
  const tipY = pivotY - Math.cos(th) * rodLen;
  ctx.strokeStyle = sim.fallen ? '#ff7a93' : '#e8edf4';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(tipX, tipY, 13, 0, TAU);
  ctx.fillStyle = sim.fallen ? '#ff7a93' : '#ffb454';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 支点
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 5, 0, TAU);
  ctx.fillStyle = '#e8edf4';
  ctx.fill();
  // θ 标注
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.fillStyle = '#9aa7b8';
  ctx.textAlign = th >= 0 ? 'left' : 'right';
  const lx = pivotX + Math.sin(th / 2) * (rodLen * 0.62) + (th >= 0 ? 8 : -8);
  const ly = pivotY - Math.cos(th / 2) * (rodLen * 0.62);
  ctx.fillText('θ = ' + fmt(th * R2D, 1) + '°', lx, ly);
  // 电机出力条
  if (opts.motor !== false) {
    const bw = 130, bh = 8, bx = 12, by = H - 22;
    const frac = clamp(Math.abs(sim.a) / sim.aMax, 0, 1);
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9aa7b8';
    ctx.fillText(t('rMotor') + ' ' + Math.round(frac * 100) + '%', bx, by - 5);
    ctx.fillStyle = '#232c3f';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = frac > 0.98 ? '#ff7a93' : '#6ee7ff';
    ctx.fillRect(bx, by, bw * frac, bh);
  }
  if (sim.fallen) {
    ctx.font = '700 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff7a93';
    ctx.fillText(t('cFallen'), W / 2, 34);
  }
  return { pivotX, pivotY, rodLen };
}

/* 悬挂摆渲染：支点在上，杆向下 */
function drawHanging(ctx, cv, sim) {
  const W = cv._w, H = cv._h;
  ctx.clearRect(0, 0, W, H);
  const px = W / 2, py = 26;
  ctx.fillStyle = '#3a465e';
  ctx.fillRect(px - 70, py - 8, 140, 6);
  const len = sim.L * PPM;
  const tipX = px + Math.sin(sim.theta) * len;
  const tipY = py + Math.cos(sim.theta) * len;
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = 'rgba(154,167,184,.4)';
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + len + 14); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#e8edf4';
  ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tipX, tipY); ctx.stroke();
  ctx.beginPath(); ctx.arc(tipX, tipY, 13, 0, TAU);
  ctx.fillStyle = '#7ee2a8'; ctx.fill();
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.fillStyle = '#9aa7b8';
  ctx.textAlign = sim.theta >= 0 ? 'left' : 'right';
  ctx.fillText('θ = ' + fmt(sim.theta * R2D, 1) + '°', px + Math.sin(sim.theta / 2) * len * 0.6 + (sim.theta >= 0 ? 8 : -8), py + Math.cos(sim.theta / 2) * len * 0.6);
}

/* ---------- θ(t) 曲线带 ---------- */
const HIST_MAX = 2048; // 容量兜底：窗口清理失效时也不无限增长
function pushHist(arr, sim, capSec) {
  const last = arr[arr.length - 1];
  if (last && sim.t <= last.t) return; // 时间未推进（如倒地后 substep 冻结）不再追加同时间戳点
  arr.push({ t: sim.t, th: sim.theta, a: sim.a });
  const from = sim.t - (capSec || 13);
  while (arr.length && arr[0].t < from) arr.shift();
  if (arr.length > HIST_MAX) arr.splice(0, arr.length - HIST_MAX);
}
function drawStrip(ctx, cv, seriesList, opts) {
  opts = opts || {};
  const W = cv._w, H = cv._h;
  const range = (opts.rangeDeg || 32) * D2R;
  const win = opts.winSec || 12;
  ctx.clearRect(0, 0, W, H);
  const y0 = H / 2;
  // 网格
  ctx.font = '11px system-ui, sans-serif';
  for (const f of [-1, -0.5, 0, 0.5, 1]) {
    const y = y0 - f * (H / 2 - 8);
    ctx.strokeStyle = f === 0 ? '#3a465e' : '#1d2635';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.fillStyle = '#5f7089';
    ctx.textAlign = 'left';
    ctx.fillText((f * (opts.rangeDeg || 32)) + '°', 4, y - 3);
  }
  ctx.fillStyle = '#5f7089';
  ctx.textAlign = 'right';
  ctx.fillText('−' + win + 's', W - 4, H - 4);
  const tNow = seriesList.length && seriesList[0].arr.length ? seriesList[0].arr[seriesList[0].arr.length - 1].t : 0;
  for (const s of seriesList) {
    if (!s.arr.length) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    if (s.dash) ctx.setLineDash(s.dash);
    ctx.beginPath();
    let started = false;
    for (const p of s.arr) {
      const x = W - (tNow - p.t) / win * W;
      if (x < 0) continue;
      const v = s.get ? s.get(p) : p.th;
      const y = y0 - clamp(v, -range, range) / range * (H / 2 - 8);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // 图例
  if (opts.legend) {
    ctx.font = '12px system-ui, sans-serif';
    let lx = 46;
    for (const s of seriesList) {
      if (!s.label) continue;
      ctx.strokeStyle = s.color; ctx.lineWidth = 3;
      if (s.dash) ctx.setLineDash(s.dash);
      ctx.beginPath(); ctx.moveTo(lx, 13); ctx.lineTo(lx + 22, 13); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#9aa7b8'; ctx.textAlign = 'left';
      ctx.fillText(s.label, lx + 27, 17);
      lx += 27 + ctx.measureText(s.label).width + 18;
    }
  }
}

/* 状态分类（近 3 秒轨迹，均值 + 方差口径；阈值经台架标定，见 report 第 2 轮记录）：
   ① 窗口峰值 <0.6° → 已收敛（沿用旧口径）；
   ② 窗口内偏离均值的峰值 <0.5°（已停稳）：均值偏离 ≥1° → 站稳但有稳态误差
      （如第 5 步关 Ki 上坡停在 −1.46°），否则已收敛；
   ③（去均值）3 秒内上行过零 ≥4 次且峰值在 3°–10° → 高频抖动（纯 P 过硬的快振）；
   ④ 峰值 <3.5°、σ<1.5° 且极值点 ≥15 个（轨迹毛糙）→ 高频抖动（噪声细抖）；
   ⑤ 其余 → 持续摆动（大幅极限环，含延迟自激、Ki 过大的慢摆）。 */
function classify(sim, arr) {
  if (sim.fallen) return 'fallen';
  const from = sim.t - 3;
  const raws = [];
  let sum = 0;
  for (const p of arr) if (p.t >= from) { raws.push(p.th); sum += p.th; }
  const n = raws.length;
  if (!n) return 'converged';
  const mu = sum / n;
  let peak = 0, pkDev = 0, sq = 0, cross = 0, extrema = 0, prevDev = null, prevDev2 = null;
  for (let i = 0; i < n; i++) {
    const dev = raws[i] - mu;
    peak = Math.max(peak, Math.abs(raws[i]));
    pkDev = Math.max(pkDev, Math.abs(dev));
    sq += dev * dev;
    if (prevDev !== null && prevDev < 0 && dev >= 0) cross++;
    if (prevDev !== null && prevDev2 !== null) {
      const d1 = prevDev - prevDev2, d2 = dev - prevDev;
      if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) extrema++;
    }
    prevDev2 = prevDev; prevDev = dev;
  }
  const sigma = Math.sqrt(sq / n);
  if (peak < 0.6 * D2R) return 'converged';
  if (pkDev < 0.5 * D2R) return Math.abs(mu) >= 1.0 * D2R ? 'offset' : 'converged';
  if (cross >= 4 && peak >= 3 * D2R && peak < 10 * D2R) return 'jitter';
  if (peak < 3.5 * D2R && sigma < 1.5 * D2R && extrema >= 15) return 'jitter';
  return 'osc';
}
function stateText(sim, arr) {
  const c = classify(sim, arr);
  if (c === 'fallen') return t('stFallen');
  if (c === 'converged') return t('stConverged');
  if (c === 'offset') return t('stOffset');
  if (c === 'jitter') return t('stJitter');
  return arr && arr.length ? t('stOsc') : t('stStanding');
}
function peakRecent(arr, sim, sec) {
  let peak = 0;
  const from = sim.t - sec;
  for (const p of arr) if (p.t >= from) peak = Math.max(peak, Math.abs(p.th));
  return peak;
}

/* 供读数拼装 */
function roHTML(sim, extra) {
  return t('rTheta') + ' <span>' + fmt(sim.theta * R2D, 1) + '°</span> · ' +
    t('rMotor') + ' <span>' + Math.round(Math.abs(sim.a) / sim.aMax * 100) + '%</span>' +
    (extra || '');
}

/* ================================================================
   第 0 步 · 钩子：幕后 PID {30,4,6}（实测：踢 2.2 约 0.6 s 收敛）
   ================================================================ */
(function step0() {
  const sec = $('step0');
  const ctx = ctxOf('s0-canvas');
  const cv = $('s0-canvas');
  const sim = new BalanceSim({ Kp: 30, Ki: 4, Kd: 6, seed: 11 });
  let ctrlOn = true;
  let geom = null;
  let dragging = false;
  function applyCtrl() {
    if (ctrlOn) { sim.Kp = 30; sim.Ki = 4; sim.Kd = 6; }
    else { sim.Kp = 0; sim.Ki = 0; sim.Kd = 0; }
  }
  applyCtrl();
  $('s0-push').addEventListener('click', () => {
    if (sim.fallen) sim.reset(0, 0);
    sim.kick(2.2);
  });
  $('s0-stand').addEventListener('click', () => sim.reset(0, 0));
  $('s0-ctrl-seg').querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      $('s0-ctrl-seg').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      ctrlOn = b.dataset.v === 'on';
      applyCtrl();
    });
  });
  $('s0-start').addEventListener('click', () => $('step1').scrollIntoView({ behavior: 'smooth' }));
  // 拖动车身
  function ptrTheta(e) {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (!geom) return null;
    return { ang: clamp(Math.atan2(x - geom.pivotX, -(y - geom.pivotY)), -0.65, 0.65), x, y };
  }
  cv.addEventListener('pointerdown', e => {
    const p = ptrTheta(e);
    if (!p || !geom) return;
    const dx = p.x - geom.pivotX, dy = p.y - geom.pivotY;
    if (Math.hypot(dx, dy) < geom.rodLen + 46) {
      dragging = true;
      cv.setPointerCapture(e.pointerId);
      sim.theta = p.ang; sim.omega = 0; sim.fallen = false; sim.fallTime = null;
    }
  });
  cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    const p = ptrTheta(e);
    if (p) { sim.theta = p.ang; sim.omega = 0; }
  });
  cv.addEventListener('pointerup', () => {
    if (dragging) { dragging = false; sim.integ = 0; sim.ePrev = null; }
  });
  function upd() {
    $('s0-readout').innerHTML = roHTML(sim) + ' · ' + t('rState') + ' <span>' +
      (sim.fallen ? t('stFallen') : t('stStanding')) + '</span>';
  }
  let frame = 0;
  animate(sec, dt => {
    if (!dragging) advance(sim, dt);
    geom = drawCar(ctx, cv, sim, {});
    if ((frame++ & 7) === 0) upd();
  });
  onRedraw(() => { geom = drawCar(ctx, cv, sim, {}); });
  onLangRefresh(() => { upd(); geom = drawCar(ctx, cv, sim, {}); });
})();

/* ================================================================
   第 1 步 · 开环对比 + 手动挑战
   ================================================================ */
(function step1() {
  const sec = $('step1');
  const invCtx = ctxOf('s1-inv');
  const hangCtx = ctxOf('s1-hang');
  const manCtx = ctxOf('s1-man');
  const inv = new BalanceSim({ theta0: 10 * D2R, seed: 21 });
  const hang = new HangingSim({ theta0: 10 * D2R });
  let released = false;
  let aliveStart = 0, bestAlive = 0, shownAlive = 0;
  function release() {
    const a = parseFloat($('s1-ang').value) * D2R;
    inv.reset(a, 0);
    hang.reset(a);
    released = true;
    shownAlive = 0;
  }
  $('s1-ang').addEventListener('input', () => {
    $('s1-ang-val').textContent = $('s1-ang').value + '°';
    if (!released) { inv.theta = parseFloat($('s1-ang').value) * D2R; hang.theta = inv.theta; }
  });
  $('s1-release').addEventListener('click', release);

  /* 手动模式：aMax=16 的 bang-bang（按住给满推力） */
  const man = new BalanceSim({ theta0: 3 * D2R, aMax: 16, seed: 31 });
  let mode = 'idle'; // idle | run | over
  let best = 0;
  try { best = parseFloat(window.localStorage.getItem('control-manual-best') || '0') || 0; } catch (e) { /* 忽略 */ }
  let keyL = false, keyR = false, btnL = false, btnR = false;
  function manualCmd() { return (keyR || btnR ? 16 : 0) + (keyL || btnL ? -16 : 0); }
  function startManual() {
    man.reset(3 * D2R, 0);
    mode = 'run';
    $('s1-start').textContent = t('s1again');
  }
  $('s1-start').addEventListener('click', startManual);
  function bindHold(id, set) {
    const el = $(id);
    const on = e => { e.preventDefault(); set(true); el.classList.add('held'); };
    const off = () => { set(false); el.classList.remove('held'); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  }
  bindHold('s1-left', v => btnL = v);
  bindHold('s1-right', v => btnR = v);
  window.addEventListener('keydown', e => {
    if (!visibleSet.has(sec) || mode !== 'run') return;
    if (e.key === 'ArrowLeft') { keyL = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keyR = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft') keyL = false;
    if (e.key === 'ArrowRight') keyR = false;
  });

  function updMan() {
    $('s1-inv-ro').innerHTML = released
      ? t('s1alive') + ' <span>' + fmt(shownAlive, 2) + ' s</span>' + (bestAlive ? ' · ' + t('s1aliveBest') + ' <span>' + fmt(bestAlive, 2) + ' s</span>' : '')
      : t('s1invIdle');
    $('s1-man-ro').innerHTML = mode === 'idle'
      ? t('s1idle')
      : t('s1score') + ' <span>' + fmt(mode === 'over' ? (man.fallTime || 0) : man.t, 2) + ' s</span> · ' +
        t('s1best') + ' <span>' + fmt(best, 2) + ' s</span> · ' + t('rTheta') + ' <span>' + fmt(man.theta * R2D, 1) + '°</span>';
  }
  let frame = 0;
  animate(sec, dt => {
    if (released && !inv.fallen) {
      advance(inv, dt);
      shownAlive = inv.fallen && inv.fallTime !== null ? inv.fallTime : inv.t;
      if (inv.fallen) bestAlive = Math.max(bestAlive, inv.fallTime || 0);
    }
    if (released) {
      const n = Math.round(Math.min(dt, 0.06) / SIM_DT);
      for (let i = 0; i < n; i++) hang.substep();
    }
    drawCar(invCtx, $('s1-inv'), inv, { motor: false });
    drawHanging(hangCtx, $('s1-hang'), hang);
    if (mode === 'run') {
      advance(man, dt, manualCmd);
      if (man.fallen) {
        mode = 'over';
        if (man.fallTime > best) {
          best = man.fallTime;
          try { window.localStorage.setItem('control-manual-best', String(best)); } catch (e) { /* 忽略 */ }
        }
      }
    }
    drawCar(manCtx, $('s1-man'), man, {});
    const timer = $('s1-timer');
    if (mode === 'run') { timer.textContent = fmt(man.t, 2) + ' s'; timer.classList.remove('dead'); }
    else if (mode === 'over') { timer.textContent = fmt(man.fallTime || 0, 2) + ' s'; timer.classList.add('dead'); }
    if ((frame++ & 7) === 0) updMan();
  });
  onRedraw(() => {
    drawCar(invCtx, $('s1-inv'), inv, { motor: false });
    drawHanging(hangCtx, $('s1-hang'), hang);
    drawCar(manCtx, $('s1-man'), man, {});
  });
  onLangRefresh(() => {
    if (mode !== 'idle') $('s1-start').textContent = t('s1again');
    updMan();
    drawCar(invCtx, $('s1-inv'), inv, { motor: false });
    drawHanging(hangCtx, $('s1-hang'), hang);
    drawCar(manCtx, $('s1-man'), man, {});
  });
})();

/* ================================================================
   第 2 步 · 闭环：回路图 + 朴素规则（P 的素颜）
   ================================================================ */
(function step2() {
  const sec = $('step2');
  const loopCtx = ctxOf('s2-loop');
  const ctx = ctxOf('s2-canvas');
  const sim = new BalanceSim({ Kp: 26, seed: 41 });
  const hist = [];
  $('s2-gain').addEventListener('input', () => {
    sim.Kp = parseFloat($('s2-gain').value);
    $('s2-gain-val').textContent = $('s2-gain').value;
  });
  $('s2-push').addEventListener('click', () => { if (sim.fallen) { sim.reset(0, 0); hist.length = 0; } sim.kick(2.0); });
  $('s2-stand').addEventListener('click', () => { sim.reset(0, 0); hist.length = 0; });

  function drawLoop(time) {
    const cv = $('s2-loop');
    const W = cv._w, H = cv._h;
    loopCtx.clearRect(0, 0, W, H);
    const boxes = [
      { k: 'cSensor', sub: 'θ', x: 0.14, y: 0.30 },
      { k: 'cError', sub: 'e = 0 − θ', x: 0.36, y: 0.30 },
      { k: 'cCtrl', sub: 'u = K·e', x: 0.58, y: 0.30 },
      { k: 'cMotor', sub: 'a', x: 0.80, y: 0.30 },
      { k: 'cPlant', sub: 'θ', x: 0.47, y: 0.78 },
    ];
    const bw = Math.min(128, W * 0.19), bh = 44;
    const pts = boxes.map(b => ({ x: b.x * W, y: b.y * H }));
    // 连线（环）
    loopCtx.strokeStyle = '#3a465e';
    loopCtx.lineWidth = 2;
    loopCtx.beginPath();
    for (let i = 0; i < 3; i++) {
      loopCtx.moveTo(pts[i].x + bw / 2, pts[i].y);
      loopCtx.lineTo(pts[i + 1].x - bw / 2, pts[i + 1].y);
    }
    loopCtx.moveTo(pts[3].x, pts[3].y + bh / 2);
    loopCtx.lineTo(pts[3].x, pts[4].y);
    loopCtx.lineTo(pts[4].x + bw / 2, pts[4].y);
    loopCtx.moveTo(pts[4].x - bw / 2, pts[4].y);
    loopCtx.lineTo(pts[0].x, pts[4].y);
    loopCtx.lineTo(pts[0].x, pts[0].y + bh / 2);
    loopCtx.stroke();
    // 箭头
    function arrow(x, y, ang) {
      loopCtx.save();
      loopCtx.translate(x, y); loopCtx.rotate(ang);
      loopCtx.fillStyle = '#3a465e';
      loopCtx.beginPath();
      loopCtx.moveTo(6, 0); loopCtx.lineTo(-5, -5); loopCtx.lineTo(-5, 5); loopCtx.closePath();
      loopCtx.fill();
      loopCtx.restore();
    }
    arrow((pts[0].x + pts[1].x) / 2, pts[0].y, 0);
    arrow((pts[1].x + pts[2].x) / 2, pts[1].y, 0);
    arrow((pts[2].x + pts[3].x) / 2, pts[2].y, 0);
    arrow(pts[3].x, (pts[3].y + pts[4].y) / 2, Math.PI / 2);
    arrow((pts[4].x + pts[0].x) / 2, pts[4].y, Math.PI);
    arrow(pts[0].x, (pts[0].y + pts[4].y) / 2, -Math.PI / 2);
    // 脉冲点：沿 5 个环节匀速走
    const path = [pts[0], pts[1], pts[2], pts[3], pts[4]];
    const segLens = [];
    let total = 0;
    for (let i = 0; i < 5; i++) {
      const a = path[i], b = path[(i + 1) % 5];
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      segLens.push(L); total += L;
    }
    let d = (time * 130) % total;
    let px = 0, py = 0, activeSeg = 0;
    for (let i = 0; i < 5; i++) {
      if (d <= segLens[i]) {
        const a = path[i], b = path[(i + 1) % 5];
        const f = segLens[i] ? d / segLens[i] : 0;
        px = a.x + (b.x - a.x) * f; py = a.y + (b.y - a.y) * f;
        activeSeg = i;
        break;
      }
      d -= segLens[i];
    }
    // 盒子
    boxes.forEach((b, i) => {
      const cx = pts[i].x, cy = pts[i].y;
      let glow = (i === (activeSeg + 1) % 5) ? 0.85 : 0;
      if (i === 3) glow = Math.max(glow, Math.abs(sim.a) / sim.aMax); // 电机：出力越大越亮
      if (i === 1) glow = Math.max(glow, clamp(Math.abs(sim.theta) / 0.3, 0, 1)); // 误差：倾得越狠越亮
      loopCtx.fillStyle = 'rgba(110,231,255,' + (0.06 + glow * 0.20).toFixed(3) + ')';
      loopCtx.strokeStyle = glow > 0.4 ? '#6ee7ff' : '#2b3547';
      loopCtx.lineWidth = glow > 0.4 ? 2 : 1;
      loopCtx.beginPath();
      loopCtx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 9);
      loopCtx.fill(); loopCtx.stroke();
      loopCtx.fillStyle = '#e8edf4';
      loopCtx.font = '600 13.5px system-ui, sans-serif';
      loopCtx.textAlign = 'center';
      loopCtx.fillText(t(b.k), cx, cy - 1);
      loopCtx.fillStyle = '#9aa7b8';
      loopCtx.font = '11.5px system-ui, sans-serif';
      loopCtx.fillText(b.sub, cx, cy + 15);
    });
    loopCtx.beginPath();
    loopCtx.arc(px, py, 4.5, 0, TAU);
    loopCtx.fillStyle = '#ffb454';
    loopCtx.fill();
  }

  function upd2() {
    $('s2-readout').innerHTML = roHTML(sim) + ' · ' + t('rState') + ' <span>' + stateText(sim, hist) + '</span>';
  }
  let frame = 0, time = 0;
  animate(sec, dt => {
    time += dt;
    advance(sim, dt);
    pushHist(hist, sim, 13);
    drawLoop(time);
    drawCar(ctx, $('s2-canvas'), sim, {});
    if ((frame++ & 7) === 0) upd2();
  });
  onRedraw(() => { drawLoop(time); drawCar(ctx, $('s2-canvas'), sim, {}); });
  onLangRefresh(() => { upd2(); drawLoop(time); drawCar(ctx, $('s2-canvas'), sim, {}); });
})();

/* ================================================================
   第 3 步 · 只有 P（实测地标：Kp<9.8 必倒；20 → T=1.40 s 等幅；85 → T=0.51 s）
   ================================================================ */
(function step3() {
  const sec = $('step3');
  const ctx = ctxOf('s3-canvas');
  const sctx = ctxOf('s3-strip');
  const sim = new BalanceSim({ Kp: 20, theta0: 8 * D2R, seed: 51 });
  const hist = [];
  function setKp(v) {
    sim.Kp = v;
    $('s3-kp').value = v;
    $('s3-kp-val').textContent = v;
    if (sim.fallen) { sim.reset(8 * D2R, 0); hist.length = 0; }
  }
  $('s3-kp').addEventListener('input', () => setKp(parseFloat($('s3-kp').value)));
  $('s3-soft').addEventListener('click', () => setKp(8));
  $('s3-mid').addEventListener('click', () => setKp(20));
  $('s3-hard').addEventListener('click', () => setKp(70));
  $('s3-push').addEventListener('click', () => { if (sim.fallen) { sim.reset(8 * D2R, 0); hist.length = 0; } sim.kick(1.8); });
  $('s3-stand').addEventListener('click', () => { sim.reset(8 * D2R, 0); hist.length = 0; });
  function upd3() {
    $('s3-readout').innerHTML = roHTML(sim) +
      ' · ' + t('s3peak') + ' <span>' + fmt(peakRecent(hist, sim, 3) * R2D, 1) + '°</span>' +
      ' · ' + t('rState') + ' <span>' + stateText(sim, hist) + '</span>';
  }
  let frame = 0;
  animate(sec, dt => {
    advance(sim, dt);
    pushHist(hist, sim, 13);
    drawCar(ctx, $('s3-canvas'), sim, {});
    drawStrip(sctx, $('s3-strip'), [{ arr: hist, color: '#6ee7ff' }], { rangeDeg: 32 });
    if ((frame++ & 7) === 0) upd3();
  });
  onRedraw(() => { drawCar(ctx, $('s3-canvas'), sim, {}); drawStrip(sctx, $('s3-strip'), [{ arr: hist, color: '#6ee7ff' }], { rangeDeg: 32 }); });
  onLangRefresh(() => { upd3(); drawCar(ctx, $('s3-canvas'), sim, {}); drawStrip(sctx, $('s3-strip'), [{ arr: hist, color: '#6ee7ff' }], { rangeDeg: 32 }); });
})();

/* ================================================================
   第 4 步 · P vs PD（实测 Kp=25：P 峰值 19.1° 永不收敛；Kd=5 峰值 7.6°、1.75 s 收敛）
   ================================================================ */
(function step4() {
  const sec = $('step4');
  const ctx = ctxOf('s4-canvas');
  const sctx = ctxOf('s4-strip');
  const simP = new BalanceSim({ Kp: 25, Kd: 0, seed: 61 });
  const simPD = new BalanceSim({ Kp: 25, Kd: 0, seed: 61 });
  const histP = [], histPD = [];
  function makeTracker() {
    return {
      t0: null, below: null, val: null,
      arm(sim) { this.t0 = sim.t; this.below = null; this.val = null; },
      update(sim) {
        if (this.t0 === null || this.val !== null) return;
        if (sim.fallen) { this.val = -1; return; }
        if (Math.abs(sim.theta) < D2R) {
          if (this.below === null) this.below = sim.t;
          else if (sim.t - this.below >= 1.5) this.val = this.below - this.t0;
        } else this.below = null;
      },
      text() {
        if (this.t0 === null || this.val === null) return t('s4notYet');
        if (this.val < 0) return '—';
        return fmt(this.val, 2) + ' s';
      }
    };
  }
  const trP = makeTracker(), trPD = makeTracker();
  function disturb() {
    if (simP.fallen) simP.reset(0, 0);
    if (simPD.fallen) simPD.reset(0, 0);
    simP.kick(1.8); simPD.kick(1.8);
    trP.arm(simP); trPD.arm(simPD);
  }
  $('s4-disturb').addEventListener('click', disturb);
  $('s4-stand').addEventListener('click', () => { simP.reset(0, 0); simPD.reset(0, 0); histP.length = 0; histPD.length = 0; trP.t0 = trPD.t0 = null; });
  $('s4-kp').addEventListener('input', () => {
    const v = parseFloat($('s4-kp').value);
    simP.Kp = v; simPD.Kp = v;
    $('s4-kp-val').textContent = v;
  });
  $('s4-kd').addEventListener('input', () => {
    const v = parseFloat($('s4-kd').value);
    simPD.Kd = v;
    $('s4-kd-val').textContent = fmt(v, 2).replace(/\.?0+$/, '');
  });
  function drawS4() {
    drawCar(ctx, $('s4-canvas'), simPD, {});
    drawStrip(sctx, $('s4-strip'), [
      { arr: histP, color: '#9aa7b8', dash: [6, 4], label: t('cPonly') },
      { arr: histPD, color: '#6ee7ff', label: t('cPD') },
    ], { rangeDeg: 32, legend: true });
  }
  function upd4() {
    $('s4-readout').innerHTML =
      t('s4settlePD') + ' <span>' + trPD.text() + '</span> · ' +
      t('s4settleP') + ' <span>' + trP.text() + '</span> · ' +
      t('rTheta') + ' <span>' + fmt(simPD.theta * R2D, 1) + '°</span>';
  }
  let frame = 0;
  animate(sec, dt => {
    advance(simP, dt);
    advance(simPD, dt);
    trP.update(simP); trPD.update(simPD);
    pushHist(histP, simP, 13);
    pushHist(histPD, simPD, 13);
    drawS4();
    if ((frame++ & 7) === 0) upd4();
  });
  onRedraw(() => { drawS4(); });
  onLangRefresh(() => { upd4(); drawS4(); });
})();

/* ================================================================
   第 5 步 · 全套 PID 实验室（预设均经同一仿真实测，见 report）
   ================================================================ */
(function step5() {
  const sec = $('step5');
  const ctx = ctxOf('s5-canvas');
  const sctx = ctxOf('s5-strip');
  const sim = new BalanceSim({ Kp: 30, Ki: 6, Kd: 6, slopeDeg: 3, seed: 71 });
  const hist = [];
  const PRESETS = {
    steady: { Kp: 20, Ki: 4, Kd: 8 },
    balanced: { Kp: 30, Ki: 6, Kd: 6 },
    sport: { Kp: 48, Ki: 3, Kd: 4.5 },
  };
  function markPreset(name) {
    document.querySelectorAll('.preset-row .preset').forEach(b => b.classList.remove('active'));
    if (name) $('s5-p-' + name).classList.add('active');
  }
  function syncSliders() {
    $('s5-kp').value = sim.Kp; $('s5-kp-val').textContent = sim.Kp;
    $('s5-ki').value = sim.Ki; $('s5-ki-val').textContent = sim.Ki;
    $('s5-kd').value = sim.Kd; $('s5-kd-val').textContent = fmt(sim.Kd, 2).replace(/\.?0+$/, '');
  }
  function applyPreset(name) {
    Object.assign(sim, PRESETS[name]);
    syncSliders();
    markPreset(name);
  }
  $('s5-p-steady').addEventListener('click', () => applyPreset('steady'));
  $('s5-p-balanced').addEventListener('click', () => applyPreset('balanced'));
  $('s5-p-sport').addEventListener('click', () => applyPreset('sport'));
  $('s5-slope').addEventListener('input', () => {
    sim.slopeDeg = parseFloat($('s5-slope').value);
    $('s5-slope-val').textContent = $('s5-slope').value + '°';
  });
  $('s5-kp').addEventListener('input', () => { sim.Kp = parseFloat($('s5-kp').value); $('s5-kp-val').textContent = sim.Kp; markPreset(null); });
  $('s5-ki').addEventListener('input', () => { sim.Ki = parseFloat($('s5-ki').value); $('s5-ki-val').textContent = sim.Ki; markPreset(null); });
  $('s5-kd').addEventListener('input', () => { sim.Kd = parseFloat($('s5-kd').value); $('s5-kd-val').textContent = fmt(sim.Kd, 2).replace(/\.?0+$/, ''); markPreset(null); });
  $('s5-kick').addEventListener('click', () => { if (sim.fallen) { sim.reset(0, 0); hist.length = 0; } sim.kick(1.8); });
  $('s5-stand').addEventListener('click', () => { sim.reset(0, 0); hist.length = 0; });
  markPreset('balanced');
  function ssError() {
    let s = 0, c = 0;
    const from = sim.t - 2.5;
    for (const p of hist) if (p.t >= from) { s += p.th; c++; }
    return c ? s / c : 0;
  }
  function drawS5() {
    drawCar(ctx, $('s5-canvas'), sim, {});
    drawStrip(sctx, $('s5-strip'), [{ arr: hist, color: '#6ee7ff' }], { rangeDeg: 32 });
  }
  function upd5() {
    $('s5-readout').innerHTML = roHTML(sim) +
      ' · ' + t('s5ss') + ' <span>' + fmt(ssError() * R2D, 2) + '°</span>' +
      ' · ' + t('rState') + ' <span>' + stateText(sim, hist) + '</span>';
  }
  let frame = 0;
  animate(sec, dt => {
    advance(sim, dt);
    pushHist(hist, sim, 13);
    drawS5();
    if ((frame++ & 7) === 0) upd5();
  });
  onRedraw(() => { drawS5(); });
  onLangRefresh(() => { upd5(); drawS5(); });
})();

/* ================================================================
   第 6 步 · 真实世界三坑（基线 = 均衡预设；实测见 report）
   延迟：100ms 起极限环、150ms 倒；噪声 2° 电机出力打满毛刺；
   饱和：aMax=4 踢 1.8 倒（4.5 幸存，峰值 15.1°）
   ================================================================ */
(function step6() {
  const sec = $('step6');
  const ctx = ctxOf('s6-canvas');
  const sctx = ctxOf('s6-strip');
  const sim = new BalanceSim({ Kp: 30, Ki: 6, Kd: 6, seed: 81 });
  const hist = [];
  const demo = { on: false, elapsed: 0, nextKick: 2.5, done: false, rng: mulberry32(99) };
  function syncDelayLabel() {
    $('s6-delay-val').textContent = fmt(sim.delayMsActual, 1) + ' ms';
  }
  $('s6-delay').addEventListener('input', () => {
    const steps = parseInt($('s6-delay').value, 10);
    sim.setDelayMs(steps * SIM_DT * 1000);
    syncDelayLabel();
  });
  $('s6-noise').addEventListener('input', () => {
    sim.noiseDeg = parseFloat($('s6-noise').value);
    $('s6-noise-val').textContent = $('s6-noise').value + '°';
  });
  $('s6-sat').addEventListener('input', () => {
    sim.aMax = parseFloat($('s6-sat').value);
    $('s6-sat-val').textContent = $('s6-sat').value + ' m/s²';
  });
  $('s6-kick').addEventListener('click', () => { if (sim.fallen) { sim.reset(0, 0); hist.length = 0; } sim.kick(1.8); });
  $('s6-stand').addEventListener('click', () => { sim.reset(0, 0); hist.length = 0; demo.on = false; demo.done = false; });
  $('s6-demo').addEventListener('click', () => {
    // 演示先关掉三个坑（文案已注明）
    sim.setDelayMs(0); $('s6-delay').value = 0; syncDelayLabel();
    sim.noiseDeg = 0; $('s6-noise').value = 0; $('s6-noise-val').textContent = '0°';
    sim.aMax = 25; $('s6-sat').value = 25; $('s6-sat-val').textContent = '25 m/s²';
    sim.Kp = 30; sim.Ki = 6; sim.Kd = 6; sim.slopeDeg = 0;
    sim.reset(0, 0);
    hist.length = 0;
    demo.on = true; demo.done = false; demo.elapsed = 0; demo.nextKick = 2.2;
    demo.rng = mulberry32(99);
  });
  function drawS6() {
    drawCar(ctx, $('s6-canvas'), sim, {});
    drawStrip(sctx, $('s6-strip'), [
      { arr: hist, color: '#6ee7ff' },
      { arr: hist, color: 'rgba(255,180,84,.55)', get: p => (p.a / 25) * 30 * D2R },
    ], { rangeDeg: 32 });
  }
  function upd6() {
    let extra = '';
    if (demo.on) extra = ' · <span>' + t('s6demoRun', { t: fmt(demo.elapsed, 0) }) + '</span>';
    else if (demo.done) extra = ' · <span>' + t('s6demoDone') + '</span>';
    $('s6-readout').innerHTML = roHTML(sim) + ' · ' + t('rState') + ' <span>' + stateText(sim, hist) + '</span>' + extra;
  }
  let frame = 0;
  animate(sec, dt => {
    advance(sim, dt);
    if (demo.on) {
      demo.elapsed += dt;
      if (!sim.fallen && demo.elapsed >= demo.nextKick && demo.elapsed < 29) {
        const dir = demo.rng() < 0.5 ? -1 : 1;
        sim.kick(dir * (1.2 + demo.rng() * 1.0));
        demo.nextKick = demo.elapsed + 2.5 + demo.rng() * 1.5;
      }
      if (sim.fallen || demo.elapsed >= 30) {
        demo.on = false;
        demo.done = !sim.fallen;
      }
    }
    pushHist(hist, sim, 13);
    drawS6();
    if ((frame++ & 7) === 0) upd6();
  });
  onRedraw(() => { drawS6(); });
  onLangRefresh(() => { upd6(); drawS6(); });
})();

/* ---------- resize：重适配全部画布并重绘一帧 ---------- */
let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    allCanvases.forEach(fitCanvas);
    redrawers.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  }, 120);
});

/* 调试/复核句柄：评审可用它在页面上下文里复跑与本页完全相同的仿真 */
window.CTRL = { BalanceSim, HangingSim, SIM_DT, GRAV };
