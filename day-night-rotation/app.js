'use strict';
const $ = id => document.getElementById(id);
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';

/* PURE-BEGIN —— 全页单一事实源的纯函数（BRIEF 写死口径，构建与自查共用） */
// 阳光方向 SUN_DIR 固定：自 +X 向 −X 平行照射；地轴竖直（+Y，北极朝上）；
// 标记点固定在赤道上；theta = 0 定义为标记点正对太阳（正午）。
function alphaOf(theta) { return ((theta % 360) + 360) % 360; }
// 标记点法线与阳光方向夹角的余弦：>0 朝阳、<0 背阳、=0 在晨昏线上
function sunDot(alpha) { return Math.cos(alpha * Math.PI / 180); }
// 转角 → 小人那里的时刻（小时，浮点）：alpha 0→12、90→18、180→0、270→6
function localTime(alpha) { return (12 + alpha / 15) % 24; }
// 昼夜状态：晨昏邻域半宽 W = 12°（BRIEF 授权构建自定，见 build-report）
const PHASE_W = 12;
function phaseOf(alpha) {
  if (alpha >= 90 - PHASE_W && alpha <= 90 + PHASE_W) return 'dusk';
  if (alpha >= 270 - PHASE_W && alpha <= 270 + PHASE_W) return 'dawn';
  return sunDot(alpha) > 0 ? 'day' : 'night';
}
// 第 3 步天空图：拱角 beta = alpha + 90；(cos, sin) 为太阳在天空图单位圆上的位置
function apparentSun(alpha) {
  const beta = alphaOf(alpha + 90);
  const r = beta * Math.PI / 180;
  return { beta: beta, x: Math.cos(r), y: Math.sin(r), below: Math.sin(r) < 0 };
}
function fmtTime(t) {
  let h = Math.floor(t) % 24, m = Math.round((t - Math.floor(t)) * 60);
  if (m === 60) { m = 0; h = (h + 1) % 24; }
  return h + ':' + String(m).padStart(2, '0');
}
/* PURE-END */

// 全页共享状态：任一步改时刻/方向/灯光，其余步的图与读数同步（BRIEF 写死）
const state = {
  theta: 0,        // 地球已转角（度，累积，可超出 360 / 为负）
  dir: 1,          // +1 正常（自西向东）/ −1 假想反转
  playing: false,
  light: true,     // 第 1 步的「灯」（关灯钮在该步）：只作用于第 1 步场景——BRIEF 把开关与读数都定在第 1 步；
                   // 其余各步的前提是阳光已开（第 0 步正文口径），其视觉与读数不随它变（评审 M1 定版）
  speedPct: 100,   // 动画速度百分比（100 = 15°/s）
  band: new Array(96).fill(null), // 24h 时间带：每段 3.75°，存 phaseOf 的键
  bandHours: 0
};
const subs = [];
function notify() { for (const fn of subs) fn(state); }

function alpha() { return alphaOf(state.theta); }
function phaseName(a) {
  const p = phaseOf(a);
  return t(p === 'day' ? 'phDay' : p === 'night' ? 'phNight' : p === 'dusk' ? 'phDuskL' : 'phDawnL');
}
function faceText(a) {
  const d = sunDot(a);
  return t(Math.abs(d) <= 0.05 ? 'roEdge' : d > 0 ? 'roFace' : 'roBack');
}
function faceShort(a) {
  const d = sunDot(a);
  return t(Math.abs(d) <= 0.05 ? 'faceEdgeS' : d > 0 ? 'faceDayS' : 'faceNightS');
}

/* ---------- 画布脚手架（沿 pinhole-camera 的 fitCanvas / scene 口径） ---------- */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '300';
  cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.cssH);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cv._w = w; cv._h = h; return ctx;
}
function scene(id, w, h) {
  const cv = $(id), ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const scale = Math.min(cv._w / w, cv._h / h);
  const ox = (cv._w - w * scale) / 2, oy = (cv._h - h * scale) / 2;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale);
  cv._view = { w: w, h: h, scale: scale, ox: ox, oy: oy };
  return ctx;
}
function line(ctx, a, b, color, width, dash) {
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
  ctx.strokeStyle = color; ctx.lineWidth = width || 2;
  if (dash) ctx.setLineDash(dash);
  ctx.stroke(); ctx.setLineDash([]);
}
function arrowHead(ctx, p, v, color, s) {
  const l = Math.hypot(v[0], v[1]) || 1, ux = v[0] / l, uy = v[1] / l, px = -uy, py = ux;
  const sz = s || 9;
  line(ctx, p, [p[0] - sz * ux + sz * 0.45 * px, p[1] - sz * uy + sz * 0.45 * py], color, 2.2);
  line(ctx, p, [p[0] - sz * ux - sz * 0.45 * px, p[1] - sz * uy - sz * 0.45 * py], color, 2.2);
}
function hArrow(ctx, x0, x1, y, color) { // 水平向左的光线箭头
  line(ctx, [x0, y], [x1, y], color, 2);
  arrowHead(ctx, [x1, y], [-1, 0], color, 8);
}
function text(ctx, str, x, y, color, size, align) {
  ctx.font = (size || 13) + 'px system-ui,sans-serif';
  ctx.fillStyle = color || muted; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}
function dot(ctx, p, color, r) {
  ctx.beginPath(); ctx.arc(p[0], p[1], r || 6, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
}
function sunGlyph(ctx, x, y, r, dim) {
  ctx.save();
  if (!dim) { ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(255,217,122,.14)'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = dim ? '#6b5a33' : '#ffd97a'; ctx.fill();
  ctx.strokeStyle = dim ? '#6b5a33' : '#ffd97a'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    ctx.beginPath(); ctx.moveTo(x + c * r * 1.25, y + s * r * 1.25); ctx.lineTo(x + c * r * 1.6, y + s * r * 1.6); ctx.stroke();
  }
  ctx.restore();
}
function personFlag(ctx, x, y, faded) { // 小旗标记：杆 + 三角旗 + 点
  ctx.save(); if (faded) ctx.globalAlpha = 0.4;
  line(ctx, [x, y], [x, y - 16], orange, 2.2);
  ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x + 11, y - 12); ctx.lineTo(x, y - 8); ctx.closePath();
  ctx.fillStyle = orange; ctx.fill();
  dot(ctx, [x, y], orange, 3.5);
  ctx.restore();
}

/* ---------- 2D 图一：侧视图（太阳在右、光水平射来；晨昏线由 SUN_DIR 实算为过圆心竖线） ---------- */
function drawSide(id, lit) {
  const ctx = scene(id, 640, 250), cx = 296, cy = 125, r = 95, a = alpha(), sd = sunDot(a);
  // 地球：先整圆夜色，再叠朝阳半圆（右半）为昼色
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fillStyle = '#152238'; ctx.fill();
  if (lit) {
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2); ctx.closePath();
    ctx.fillStyle = '#2c6491'; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.strokeStyle = '#48617e'; ctx.lineWidth = 1.6; ctx.stroke();
  // 地轴：穿过南北极、伸出球面
  line(ctx, [cx, cy - r - 16], [cx, cy + r + 16], muted, 1.6);
  text(ctx, t('cvAxis'), cx + 10, cy - r - 8, muted, 12, 'left');
  if (lit) {
    // 晨昏线 = 过圆心、垂直于光线方向的直线（光自 +X 来 → 竖线），实算位置即圆心 x
    line(ctx, [cx, cy - r], [cx, cy + r], pink, 2, [6, 5]);
    text(ctx, t('cvTerm'), cx + 9, cy + r - 12, pink, 12, 'left');
    for (const y of [68, 125, 182]) hArrow(ctx, 548, 428, y, '#ffd97a');
    sunGlyph(ctx, 592, 125, 21, false);
    text(ctx, t('cvSun'), 592, 84, '#ffd97a', 13);
  } else {
    sunGlyph(ctx, 592, 125, 21, true);
    text(ctx, t('cvSun'), 592, 84, muted, 13);
  }
  // 标记点：赤道上，投影 x = cx + r·cos α；sin α>0 时在背面（半透明）
  const mx = cx + r * Math.cos(a * Math.PI / 180);
  personFlag(ctx, mx, cy, Math.sin(a * Math.PI / 180) > 0.001);
  text(ctx, t('cvPerson'), mx, cy + 24, orange, 12);
  ctx.restore();
}

/* ---------- 2D 图二：北极俯视图（右 = 朝阳方向；标记点逆时针走，与 3D 同一转角） ---------- */
function drawTop(id, lit) {
  const ctx = scene(id, 640, 270), cx = 312, cy = 135, r = 104, a = alpha();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fillStyle = '#152238'; ctx.fill();
  if (lit) {
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2); ctx.closePath();
    ctx.fillStyle = '#2c6491'; ctx.fill();
    line(ctx, [cx, cy - r], [cx, cy + r], pink, 2, [6, 5]);
    text(ctx, t('cvTerm'), cx + 9, cy - r + 12, pink, 12, 'left');
    for (const y of [88, 135, 182]) hArrow(ctx, 556, 452, y, '#ffd97a');
    sunGlyph(ctx, 598, 135, 18, false);
    text(ctx, t('cvSun'), 598, 100, '#ffd97a', 12);
  }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.strokeStyle = '#48617e'; ctx.lineWidth = 1.6; ctx.stroke();
  // 已转角 α 的弧（自正午位置逆时针）+ 角度标注
  if (a > 0.5) {
    ctx.beginPath(); ctx.arc(cx, cy, 64, 0, -a * Math.PI / 180, true);
    ctx.strokeStyle = cyan; ctx.lineWidth = 2.2; ctx.stroke();
    const mid = -a / 2 * Math.PI / 180;
    text(ctx, 'α = ' + Math.round(a) + '°', cx + 84 * Math.cos(mid), cy + 84 * Math.sin(mid), cyan, 13);
  }
  // 自转方向环形箭头（左下弧段；dir 反转时箭头反向）
  const phi = 140 * Math.PI / 180, R2 = r + 14;
  const tip = [cx + R2 * Math.cos(phi), cy + R2 * Math.sin(phi)];
  ctx.beginPath(); ctx.arc(cx, cy, R2, phi - 0.42, phi + 0.42);
  ctx.strokeStyle = green; ctx.lineWidth = 2.2; ctx.stroke();
  const vCCW = [Math.sin(phi), -Math.cos(phi)]; // 视觉逆时针的切向
  arrowHead(ctx, tip, state.dir > 0 ? vCCW : [-vCCW[0], -vCCW[1]], green, 9);
  // 标记点 + 小旗
  const mp = [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  personFlag(ctx, mp[0], mp[1], false);
  text(ctx, t('cvPerson'), mp[0], mp[1] + 26, orange, 12);
  dot(ctx, [cx, cy], '#e8edf4', 3);
  text(ctx, t('cvNorth'), cx, cy + 18, '#e8edf4', 12);
  ctx.restore();
}

/* ---------- 2D 图三：小人天空图（太阳位置走 apparentSun 纯函数） ---------- */
function drawSky(id) {
  const ctx = scene(id, 640, 260), cx = 320, hy = 172, R = 116, a = alpha(), sun = apparentSun(a), sd = sunDot(a);
  // 天空（亮度随 sunDot 在昼/夜两套色之间取）与地面
  const dayTop = [42, 95, 143], dayBot = [127, 178, 217], nightTop = [5, 8, 18], nightBot = [13, 22, 38];
  const mix = Math.max(0, Math.min(1, (sd + 0.25) / 0.9));
  const cTop = dayTop.map((v, i) => Math.round(nightTop[i] + (v - nightTop[i]) * mix));
  const cBot = dayBot.map((v, i) => Math.round(nightBot[i] + (v - nightBot[i]) * mix));
  const g = ctx.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, 'rgb(' + cTop.join(',') + ')'); g.addColorStop(1, 'rgb(' + cBot.join(',') + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 640, hy);
  ctx.fillStyle = sd < -0.05 ? '#131c12' : '#1e2c1b'; ctx.fillRect(0, hy, 640, 260 - hy);
  if (sd < 0.02) { // 夜里画星星（位置写死数组，不随帧乱跳）
    ctx.fillStyle = 'rgba(232,237,244,' + Math.min(0.9, -sd + 0.25) + ')';
    const stars = [[60, 30], [140, 62], [210, 24], [300, 48], [388, 20], [470, 58], [545, 30], [590, 76], [96, 96], [520, 104], [250, 84], [430, 92]];
    for (const [sx, sy] of stars) ctx.fillRect(sx, sy, 2, 2);
  }
  // 太阳的拱形轨迹（地平线以上实线、地平线以下淡虚线）
  ctx.beginPath(); ctx.arc(cx, hy, R, Math.PI, 2 * Math.PI); ctx.strokeStyle = 'rgba(255,217,122,.5)'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(cx, hy, R, 0, Math.PI); ctx.strokeStyle = 'rgba(255,217,122,.16)'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);
  // 地平线与方位标签
  line(ctx, [8, hy], [632, hy], '#8aa1b8', 2);
  text(ctx, t('cvHorizon'), 14, hy - 14, '#c9d4e2', 12, 'left');
  text(ctx, t('cvEast'), cx + R + 18, hy - 12, '#ffd97a', 14);
  text(ctx, t('cvWest'), cx - R - 18, hy - 12, '#ffd97a', 14);
  // 小人（站在地平线中间）
  dot(ctx, [cx, hy - 20], orange, 6);
  line(ctx, [cx, hy - 14], [cx, hy], orange, 3);
  text(ctx, t('cvPerson'), cx + 14, hy - 12, orange, 12, 'left');
  // 太阳点：位置由 apparentSun 实算
  const sp = [cx + R * sun.x, hy - R * sun.y];
  if (sun.below) {
    dot(ctx, sp, '#a4834f', 10);
    text(ctx, t('cvBelow'), sp[0], sp[1] + 24, muted, 12);
  } else {
    sunGlyph(ctx, sp[0], sp[1], 13, false);
  }
  ctx.restore();
}

/* ---------- 24 小时时间带（颜色由 phaseOf 给；进度即已涂段数对应的小时） ---------- */
const BAND_COLORS = { day: '#f5b942', dawn: '#e5989b', dusk: '#e76f51', night: '#2b4a7f' };
function drawBand() {
  const ctx = scene('s2-band', 640, 34);
  const w = 640 / 96;
  for (let i = 0; i < 96; i++) {
    ctx.fillStyle = state.band[i] ? BAND_COLORS[state.band[i]] : '#141c28';
    ctx.fillRect(i * w + 0.5, 2, w - 1, 18);
  }
  ctx.fillStyle = muted; ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [h, lab] of [[0, '0'], [6, '6'], [12, '12'], [18, '18'], [24, '24']]) {
    ctx.fillText(lab, Math.min(634, Math.max(6, h / 24 * 640)), 29);
  }
  ctx.restore();
}
function paintBand(from, to) {
  const dist = to - from;
  if (Math.abs(dist) > 180) return; // 大幅跳变（重置等）不涂，由调用方清带
  const steps = Math.max(1, Math.ceil(Math.abs(dist) / 2));
  for (let i = 1; i <= steps; i++) {
    const a = alphaOf(from + dist * i / steps);
    state.band[Math.floor(a / 3.75) % 96] = phaseOf(a);
  }
  state.bandHours = Math.min(24, state.bandHours + Math.abs(dist) / 15);
}

/* ---------- 状态变更与读数 ---------- */
function setTheta(v, paint) {
  const old = state.theta;
  if (paint) paintBand(old, v);
  state.theta = v;
  renderAll();
  notify();
}
function renderAll() {
  // 灯光作用域（评审 M1 定版）：只有第 1 步的侧视图跟 state.light 走；
  // 第 2/3/4 步的图前提是阳光已开，恒按有光画，与其读数（白天/太阳在天上）同口径。
  drawSide('s1-side', state.light); drawTop('s2-top', true); drawBand();
  drawSide('s3-side', true); drawSky('s3-sky');
  drawTop('s4-top', true); drawSky('s4-sky');
  readouts();
}
function readouts() {
  const a = alpha(), time = fmtTime(localTime(a));
  $('s0-ro').textContent = t('s0roT', { phase: phaseName(a), face: faceText(a) });
  $('s1-ro').textContent = t(state.light ? 's1roOn' : 's1roOff');
  $('s2-ro').textContent = t('s2roT', { time: time, phase: phaseName(a) });
  $('s2-progress').textContent = state.bandHours >= 23.95
    ? t('progressFull')
    : t('progressT', { h: String(Math.round(state.bandHours * 10) / 10) });
  $('s3-ro').textContent = t('s3roT', { time: time, face: faceShort(a), sun: sunText(a) });
  $('s4-ro').textContent = t(state.dir > 0 ? 's4roNorm' : 's4roRev');
  if (!sliderActive) $('s2-time').value = String((720 + Math.round(a * 4)) % 1440);
  $('time-val').textContent = time;
  $('speed-val').textContent = fmtSpeed(state.speedPct);
  $('speed4-val').textContent = fmtSpeed(state.speedPct);
}
function sunText(a) {
  const s = apparentSun(a);
  if (s.below) return t('sunBelow');
  if (s.beta <= 45 || s.beta >= 315) return t('sunRise');
  if (s.beta >= 135 && s.beta <= 225) return t('sunSet');
  return t('sunHigh');
}
function fmtSpeed(p) { return String(p / 100) + '×'; }

/* ---------- 播放（全页共用一份 playing；rAF 只在播放时跑） ---------- */
let rafId = 0, lastTs = 0;
function tick(ts) {
  if (!state.playing) { rafId = 0; return; }
  if (ts - lastTs < 30) { rafId = requestAnimationFrame(tick); return; } // 约 30fps，2D 七张图一起重绘不卡
  const dt = Math.min((ts - lastTs) / 1000, 0.05); lastTs = ts;
  setTheta(state.theta + 15 * (state.speedPct / 100) * state.dir * dt, true);
  rafId = requestAnimationFrame(tick);
}
function setPlaying(p) {
  state.playing = p;
  syncPlayLabels();
  if (p) { lastTs = performance.now(); if (!rafId) rafId = requestAnimationFrame(tick); }
  else if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  notify();
}
function syncPlayLabels() {
  for (const id of ['s2-play', 's3-play', 's4-play']) $(id).textContent = t(state.playing ? 'pause' : 'play');
}
function syncDirUI() {
  $('s4-rev').textContent = t(state.dir > 0 ? 'revBtn' : 'revBackBtn');
  $('s4-rev').classList.toggle('active', state.dir < 0);
}
function syncLightUI() { $('s1-light').textContent = t(state.light ? 'lightOffBtn' : 'lightOnBtn'); }

/* ---------- 自测（答案全部能由纯函数/正文结论回算；答对锁定，答错点名错觉） ---------- */
const QANS = { q1: 0, q2: 1, q3: 1, q4: 1 };
const quiz = { q1: { done: false }, q2: { done: false }, q3: { done: false }, q4: { done: false } };
function quizCount() { return Object.values(quiz).filter(q => q.done).length; }
function quizUI() {
  const n = quizCount();
  $('q-score').textContent = t('quizScore', { n: n });
  $('quiz-gate').textContent = n === 4 ? t('quizGateDone') : t('quizGateTodo', { n: 4 - n });
  $('fin-gate').textContent = n === 4 ? t('finGateDone') : t('finGateTodo');
}
function onQuiz(btn) {
  const q = btn.dataset.q, opt = Number(btn.dataset.opt);
  if (quiz[q].done) return;
  const row = btn.parentNode;
  if (opt === QANS[q]) {
    quiz[q].done = true;
    $(q + '-ro').textContent = t(q + 'ok');
    row.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.toggle('active', b === btn); });
  } else {
    $(q + '-ro').textContent = t(q + 'w' + opt);
    btn.classList.add('wrong-pick');
  }
  quizUI();
}

/* ---------- 徽标（earth 未注册：分类徽标优雅隐藏，不报错、不写死分类名） ---------- */
function badges() {
  for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'earth'], ['stageBadge', window.KNOWLEDGE_STAGES, 'primary']]) {
    const item = (arr || []).find(x => x.id === id), node = $(el);
    if (item) { node.textContent = item.name[getLang()]; node.style.display = ''; }
    else node.style.display = 'none';
  }
}

/* ---------- 第 3 步视角模式 ---------- */
let s3Mode = 'both';
function syncViewMode() {
  $('s3-half-space').style.display = s3Mode === 'ground' ? 'none' : '';
  $('s3-half-ground').style.display = s3Mode === 'space' ? 'none' : '';
  for (const [id, m] of [['s3-vboth', 'both'], ['s3-vspace', 'space'], ['s3-vground', 'ground']])
    $(id).classList.toggle('active', s3Mode === m);
  renderAll();
}

/* ---------- 事件绑定 ---------- */
let sliderActive = false;
function bind() {
  document.querySelectorAll('[data-lang]').forEach(el => el.onclick = () => applyLang(el.dataset.lang));
  for (const id of ['s2-play', 's3-play', 's4-play']) $(id).onclick = () => setPlaying(!state.playing);
  $('s2-restart').onclick = () => {
    state.band.fill(null); state.bandHours = 0;
    state.theta = 0; renderAll(); notify();
    setPlaying(true);
  };
  $('s1-light').onclick = () => { state.light = !state.light; syncLightUI(); renderAll(); notify(); };
  for (const id of ['s0-view', 's1-view']) $(id).onclick = () => { if (window.DN3D) window.DN3D.resetView(id === 's0-view' ? 0 : 1); };
  const timeSlider = $('s2-time');
  timeSlider.addEventListener('pointerdown', () => sliderActive = true);
  window.addEventListener('pointerup', () => sliderActive = false);
  timeSlider.addEventListener('input', e => setTheta(((Number(e.target.value) + 720) % 1440) / 4, true));
  const onSpeed = e => {
    state.speedPct = Number(e.target.value);
    $('s2-speed').value = String(state.speedPct); $('s4-speed').value = String(state.speedPct);
    readouts();
  };
  $('s2-speed').addEventListener('input', onSpeed);
  $('s4-speed').addEventListener('input', onSpeed);
  $('s4-rev').onclick = () => {
    state.dir *= -1;
    state.band.fill(null); state.bandHours = 0; // 方向一反，时间带按新方向从头累计（口径见 build-report）
    syncDirUI(); renderAll(); notify();
  };
  for (const [id, m] of [['s3-vboth', 'both'], ['s3-vspace', 'space'], ['s3-vground', 'ground']])
    $(id).onclick = () => { s3Mode = m; syncViewMode(); };
  document.querySelectorAll('[data-q]').forEach(btn => btn.onclick = () => onQuiz(btn));
  window.addEventListener('resize', renderAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.playing) setPlaying(false); });
}
function updateNav() {
  const sections = [...document.querySelectorAll('.step')];
  if (!sections.length) return;
  const current = sections.reduce((best, el) => Math.abs(el.getBoundingClientRect().top - 100) < Math.abs(best.getBoundingClientRect().top - 100) ? el : best);
  document.querySelectorAll('[data-nav]').forEach(el => {
    const active = el.dataset.nav === current.dataset.step;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateNav, { passive: true });

window.refreshLanguage = () => { badges(); syncPlayLabels(); syncDirUI(); syncLightUI(); renderAll(); if (window.DN3D) window.DN3D.refreshLanguage(); };
/* 给 3D 模块（app3d.js）的只读接口：状态订阅 + 纯函数 + 证据面 */
window.DN = {
  state: state,
  alphaOf: alphaOf, sunDot: sunDot, localTime: localTime, phaseOf: phaseOf, apparentSun: apparentSun, fmtTime: fmtTime,
  subscribe: fn => subs.push(fn),
  setPlaying: setPlaying,
  setTheta: (v, paint) => setTheta(v, !!paint)
};
bind();
badges(); syncPlayLabels(); syncDirUI(); syncLightUI(); quizUI(); updateNav();
renderAll();
