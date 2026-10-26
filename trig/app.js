'use strict';
/* 三角函数 · 单位圆交互讲解 — 全部逻辑（无依赖，原生 Canvas 2D + Web Audio）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 所有波形都由点的真实投影逐帧采样连成：traceAdvance 以固定相位步长
      在点的真实相位 φ 处取 sin/cos，波头点画的正是此刻 θ 的投影值。
      页面状态挂 window.TRIG.steps（并提供 TRIG.set(step, θ) 供对账）。
   2. 内部一律弧度；角度/弧度只是读数显示之别。
   3. tan 只在规范90°/270°状态无定义；有限大值与绘图越界分开，三处共用tangentAt。
   4. 转速自洽：点转一圈 == 波一个周期；第 5 步声频 = 转速 × 220（读数明示）。 */
const TAU = Math.PI * 2;
const $ = id => document.getElementById(id);

/* ---------- 画布适配（DPR）：沿用傅里叶/采样页 fitCanvas 方案 ---------- */
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
function regCanvas(id) { const cv = $(id); allCanvases.push(cv); return cv; }
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
/* 自适应小数位：大数少给小数，避免「5731.000」式假精确 */
function afmt(v) {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v);
  if (a >= 100) return fmt(v, 1);
  if (a >= 10) return fmt(v, 2);
  return fmt(v, 3);
}
function norm(th) { th %= TAU; return th < 0 ? th + TAU : th; }
/* TANGENT-BEGIN: bounded lesson model, radians internally. */
function tangentAt(input){
  if(!Number.isFinite(input))return {mode:'invalid',theta:null,sin:null,cos:null,tan:null,cardinal:false};
  const theta=norm(input),cardinal=[0,Math.PI/2,Math.PI,3*Math.PI/2].includes(theta);
  let sin=Math.sin(theta),cos=Math.cos(theta);
  if(theta===0){sin=0;cos=1;}else if(theta===Math.PI/2){sin=1;cos=0;}else if(theta===Math.PI){sin=0;cos=-1;}else if(theta===3*Math.PI/2){sin=-1;cos=0;}
  return {theta,sin,cos,tan:cos===0?null:sin/cos,mode:cos===0?'undef':'num',cardinal};
}
function tangentNumber(value,exact=false){
  if(!Number.isFinite(value))return '—';
  const shown=Object.is(value,-0)?0:Number(value.toPrecision(6));
  return ((exact?'':'≈')+shown).replace(/-/g,'−');
}
function tangentStep(theta,degrees){
  if(!Number.isFinite(theta)||!Number.isFinite(degrees))return null;
  const tick=Math.round(theta*180/Math.PI*10);
  if(theta===(tick/10)*Math.PI/180){const next=((tick+Math.round(degrees*10))%3600+3600)%3600;return(next/10)*Math.PI/180;}
  return norm(theta+degrees*Math.PI/180);
}
/* TANGENT-END */
function degOf(th) { return th * 180 / Math.PI; }
function setRO(id, str) { const el = $(id); if (el && el._v !== str) { el._v = str; el.innerHTML = str; } }

/* ---------- 对账状态（供评审/自测抽帧核对） ---------- */
const TRIG = { steps: {} };
window.TRIG = TRIG;

/* ---------- 轨迹采样机：波 = 点的真实投影的历史 ----------
   以固定相位步长（每周期 160 个采样）在点的真实相位处采样，
   与帧率无关；采样值就是该相位处点的 sin/cos 本人。 */
const SAMPLES_PER_PERIOD = 160, TRACE_LEN = 210;
function newTrace() { return { items: [], lastPhi: null }; }
function traceReset(tr) { tr.items.length = 0; tr.lastPhi = null; }
function traceAdvance(tr, phi) {
  const dPhi = TAU / SAMPLES_PER_PERIOD;
  if (tr.lastPhi === null) {
    tr.lastPhi = phi;
    tr.items.push({ phi, s: Math.sin(phi), c: Math.cos(phi) });
    return;
  }
  let guard = 0;
  while (tr.lastPhi + dPhi <= phi && guard++ < 64) {
    tr.lastPhi += dPhi;
    tr.items.push({ phi: tr.lastPhi, s: Math.sin(tr.lastPhi), c: Math.cos(tr.lastPhi) });
  }
  if (tr.items.length > TRACE_LEN) tr.items.splice(0, tr.items.length - TRACE_LEN);
}

/* ---------- 造波机几何（第 0/2/3 步共用：左圆 + 右波） ---------- */
function machineGeom(cv, maxVal, maxR) {
  const w = cv._w, h = cv._h;
  const legendH = 24, botH = 18;
  const plotH = Math.max(80, h - legendH - botH);
  const midY = legendH + plotH / 2;
  let circleW = clamp(w * 0.36, 124, 300);
  if (w - circleW - 16 < 110) circleW = Math.max(96, w - 126);
  const headX = circleW + 10;
  const waveW = Math.max(60, w - headX - 8);
  let ppu = (plotH / 2) / maxVal;
  ppu = Math.min(ppu, (circleW / 2 - 8) / maxR, (plotH / 2 - 4) / maxR);
  return { w, h, midY, circleW, headX, waveW, ppu, cx: circleW / 2, cy: midY };
}
/* 圆 + 半径 + 角度弧 + 投影（proj: {sin, cos} 决定画哪种投影与引导线） */
function drawMachineCircle(ctx, g, theta, R, proj) {
  const { cx, cy, ppu } = g;
  const Rp = R * ppu;
  const px = cx + Math.cos(theta) * Rp, py = cy - Math.sin(theta) * Rp;
  /* 坐标轴 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, cy); ctx.lineTo(g.circleW - 4, cy);
  ctx.moveTo(cx, 26); ctx.lineTo(cx, g.h - 20);
  ctx.stroke();
  /* 单位刻度 */
  ctx.fillStyle = '#9aa7b8'; ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('1', cx + ppu, cy + 14);
  ctx.fillText('1', cx + 10, cy - ppu + 3);
  ctx.textAlign = 'left';
  /* 圆 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, TAU); ctx.stroke();
  /* θ 弧 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, Math.min(30, Rp * 0.34), -theta, 0, false); ctx.stroke();
  /* 投影 */
  if (proj.sin) {
    /* 竖直投影段（点→x 轴）= 身高 */
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
    /* 水平引导线（点→波头） */
    ctx.strokeStyle = 'rgba(110,231,255,.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(g.headX, py); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (proj.cos) {
    /* 水平投影段（点→y 轴）= 站位 */
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
    /* x 轴上的站位段（原点→垂足） */
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    /* 波头高度处的水平引导线 */
    const yv = cy - Math.cos(theta) * ppu;
    ctx.strokeStyle = 'rgba(255,180,84,.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(g.circleW - 2, yv); ctx.lineTo(g.headX, yv); ctx.stroke();
    ctx.setLineDash([]);
  }
  /* 半径与点 */
  ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, 5.5, 0, TAU);
  ctx.fillStyle = '#ffd166'; ctx.fill();
  ctx.lineWidth = 1.4; ctx.strokeStyle = '#0d1117'; ctx.stroke();
}
/* 波：从 trace 画折线，波头点 = 此刻的真实值 curVal（数据单位） */
function drawTraceWave(ctx, g, tr, getVal, curVal, color, lw, phiNow) {
  const sp = g.waveW / TRACE_LEN;
  const headY = g.midY - curVal * g.ppu;
  /* 零线与 ±1 参考线 */
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(g.headX - 4, g.midY); ctx.lineTo(g.headX + g.waveW + 4, g.midY); ctx.stroke();
  ctx.strokeStyle = '#1a2230'; ctx.setLineDash([3, 5]);
  for (const v of [1, -1]) {
    const y = g.midY - v * g.ppu;
    if (y > 24 && y < g.h - 16) { ctx.beginPath(); ctx.moveTo(g.headX - 4, y); ctx.lineTo(g.headX + g.waveW + 4, y); ctx.stroke(); }
  }
  ctx.setLineDash([]);
  /* 折线：最新采样在最左（紧挨波头），越往右越旧；
     相位跳变（打点定位 / TRIG.set）处轨迹不连续 —— 断线，不斜穿 */
  const n = tr.items.length;
  const dPhi = TAU / SAMPLES_PER_PERIOD;
  ctx.strokeStyle = color; ctx.lineWidth = lw || 2.2;
  ctx.beginPath();
  let prevPhi = (phiNow != null ? phiNow : null), pen = false;
  if (phiNow != null) { ctx.moveTo(g.headX, headY); pen = true; }
  for (let i = 0; i < n; i++) {
    const it = tr.items[n - 1 - i];
    const x = g.headX + (i + 1) * sp, y = g.midY - getVal(it) * g.ppu;
    if (!pen || (prevPhi != null && Math.abs(prevPhi - it.phi) > dPhi * 1.6)) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    pen = true; prevPhi = it.phi;
  }
  ctx.stroke();
  /* 波头点 */
  ctx.beginPath(); ctx.arc(g.headX, headY, 3.6, 0, TAU);
  ctx.fillStyle = color; ctx.fill();
}

/* ============================================================
   第 0 步：钩子造波机（点转圈，身高描成波）
   ============================================================ */
const S0 = { phi: 0.8, theta: norm(0.8), speed: 1.2, playing: true, trace: newTrace() };
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const g = machineGeom(cv, 1.18, 1);
  drawMachineCircle(ctx, g, S0.theta, 1, { sin: true, cos: false });
  drawTraceWave(ctx, g, S0.trace, it => it.s, Math.sin(S0.theta), '#6ee7ff', 2.2, S0.phi);
  /* 图例 */
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#6ee7ff';
  ctx.fillText(t('cWave'), g.headX + 2, 14);
  ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cHeight'), 8, 14);
  TRIG.steps.s0 = { theta: S0.theta, sin: Math.sin(S0.theta), cos: Math.cos(S0.theta), waveTailSin: Math.sin(S0.theta) };
  setRO('s0-readout', t('s0ro', {
    deg: fmt(degOf(S0.theta), 1), rad: fmt(S0.theta, 2), sin: fmt(Math.sin(S0.theta), 3)
  }));
}
function s0ToggleLabel() {
  const b = $('s0-toggle'); if (b) b.textContent = S0.playing ? t('pause') : t('play');
}
function initS0() {
  regCanvas('s0-canvas');
  $('s0-speed').addEventListener('input', e => {
    S0.speed = +e.target.value; $('s0-speed-val').textContent = fmt(S0.speed, 1);
  });
  $('s0-toggle').addEventListener('click', () => { S0.playing = !S0.playing; s0ToggleLabel(); });
  $('s0-step').addEventListener('click', () => {
    S0.playing = false; s0ToggleLabel();
    S0.phi += Math.PI / 30; S0.theta = norm(S0.phi);
    traceAdvance(S0.trace, S0.phi);
    s0Draw();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  animate($('step0'), dt => {
    if (S0.playing) {
      S0.phi += S0.speed * dt;
      S0.theta = norm(S0.phi);
      traceAdvance(S0.trace, S0.phi);
    }
    s0Draw();
  });
  onLangRefresh(() => { s0ToggleLabel(); s0Draw(); });
  onRefit(s0Draw);
  s0ToggleLabel();
  traceAdvance(S0.trace, S0.phi);
  s0Draw();
}

/* ============================================================
   第 1 步：点的坐标（拖动；cos=站位，sin=身高；象限符号；勾股；特殊角）
   ============================================================ */
const EXACT = {
  0: ['0', '1', '0'], 30: ['1/2', '√3/2', '√3/3'], 45: ['√2/2', '√2/2', '1'],
  60: ['√3/2', '1/2', '√3'], 90: ['1', '0', null], 120: ['√3/2', '−1/2', '−√3'],
  135: ['√2/2', '−√2/2', '−1'], 150: ['1/2', '−√3/2', '−√3/3'], 180: ['0', '−1', '0'],
  210: ['−1/2', '−√3/2', '√3/3'], 225: ['−√2/2', '−√2/2', '1'], 240: ['−√3/2', '−1/2', '√3'],
  270: ['−1', '0', null], 300: ['−√3/2', '1/2', '−√3'], 315: ['−√2/2', '√2/2', '−1'],
  330: ['−1/2', '√3/2', '−√3/3']
};
const SPECIALS = Object.keys(EXACT).map(Number);
function tangentAngle(theta,unit='deg'){if(unit==='rad')return tangentNumber(theta,theta===0);const d=degOf(theta),exact=SPECIALS.find(sd=>theta===sd*Math.PI/180);return tangentNumber(exact===undefined?d:exact,exact!==undefined);}
const S1 = { theta: 50 * Math.PI / 180, unit: 'deg', dragging: false };
function s1Geom(cv) {
  const w = cv._w, h = cv._h;
  return { w, h, cx: w / 2, cy: h / 2 + 4, R: Math.min(w, h) * 0.355 };
}
function s1Snap(th) {
  const deg = degOf(th);
  for (const sd of SPECIALS) {
    let d = Math.abs(deg - sd);
    d = Math.min(d, 360 - d);
    if (d <= 1.2) return sd * Math.PI / 180;
  }
  return th;
}
function s1Draw() {
  const cv = $('s1-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const { w, h, cx, cy, R } = s1Geom(cv);
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const th=S1.theta, info=tangentAt(th), c=info.cos, s=info.sin;
  const px = cx + c * R, py = cy - s * R;
  /* 坐标轴 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - R - 30, cy); ctx.lineTo(cx + R + 30, cy);
  ctx.moveTo(cx, cy - R - 30); ctx.lineTo(cx, cy + R + 30);
  ctx.stroke();
  ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('x', cx + R + 34, cy + 4);
  ctx.fillText('y', cx + 6, cy - R - 34);
  /* 象限标号：点所在象限的标号若与水平投影虚线（y = py）贴近，
     沿远离 x 轴方向让开 16px，避免虚线穿字 */
  ctx.font = '13px Georgia, serif'; ctx.fillStyle = '#5b6b82';
  const qd = R * 0.74;
  const qPos = [
    [cx + qd * 0.7, cy - qd * 0.7 + 4],
    [cx - qd * 0.7 - 8, cy - qd * 0.7 + 4],
    [cx - qd * 0.7 - 11, cy + qd * 0.7 + 4],
    [cx + qd * 0.7 - 3, cy + qd * 0.7 + 4]
  ];
  const aq = (c > 0 && s > 0) ? 0 : (c < 0 && s > 0) ? 1 : (c < 0 && s < 0) ? 2 : (c > 0 && s < 0) ? 3 : -1;
  if (aq >= 0 && Math.abs(py - qPos[aq][1]) < 13) qPos[aq][1] += (qPos[aq][1] > cy ? 16 : -16);
  ['I', 'II', 'III', 'IV'].forEach((qn, i) => ctx.fillText(qn, qPos[i][0], qPos[i][1]));
  /* 单位圆 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  /* 到 y 轴的水平虚线（投影） */
  ctx.strokeStyle = 'rgba(155,170,190,.4)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(cx, py, 3, 0, TAU); ctx.fillStyle = '#6ee7ff'; ctx.fill();
  /* 直角三角形：cos 边（底，橙）、sin 边（高，青）、半径（斜边，白）——配色与全页约定一致（sin 青 / cos 橙） */
  ctx.beginPath();
  ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.lineTo(px, py); ctx.closePath();
  ctx.fillStyle = 'rgba(110,231,255,.07)'; ctx.fill();
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  /* θ 弧 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, 34, -th, 0, false); ctx.stroke();
  ctx.fillStyle = '#6ee7ff'; ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('θ', cx + 44 * Math.cos(th / 2) - 3, cy - 44 * Math.sin(th / 2) + 4);
  /* 边标签（颜色随边：cos 橙 / sin 青；位置贴三角形外侧，避免窄屏挤压——
     cos 标签在 x 轴背离三角形的一侧；sin 标签在竖边背离三角形的一侧，
     左侧空间不足（窄屏）时退回内侧，内侧时再按画布右界回收起始点防出界；
     sin 边贴轴的退化角度另有居中避让分支） */
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'center';
  ctx.fillText(t('cCosLab'), (cx + px) / 2, s < 0 ? cy - 10 : cy + 18);
  ctx.fillStyle = '#6ee7ff';
  const sinLab = t('cSinLab'), sinLabY = (cy + py) / 2 + 4, sinLabW = ctx.measureText(sinLab).width;
  if (Math.abs(s) * R < 15) {
    /* sin 边短到贴轴（θ≈0°/180°）：标签改到点上方（s≥0）/下方（s<0）居中放，避免压轴线与点 */
    ctx.textAlign = 'center';
    const stubX = Math.max(sinLabW / 2 + 4, Math.min(px, w - 4 - sinLabW / 2));
    ctx.fillText(sinLab, stubX, s < 0 ? cy + 26 : cy - 14);
  } else if (c <= -0.6 && px - 8 - sinLabW >= 4) {
    ctx.textAlign = 'right';
    ctx.fillText(sinLab, px - 8, sinLabY);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(sinLab, Math.min(px + 8, w - 4 - sinLabW), sinLabY);
  }
  ctx.textAlign = 'left';
  /* 点 */
  ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU);
  ctx.fillStyle = '#ffd166'; ctx.fill();
  ctx.lineWidth = 1.4; ctx.strokeStyle = '#0d1117'; ctx.stroke();
  TRIG.steps.s1 = { theta: th, sin: s, cos: c, tan: info.tan, tanMode:info.mode, unit: S1.unit };
}
function signSpan(v) {
  if (v===0) return '<span class="zero">0</span>';
  return v > 0 ? '<span class="pos">+</span>' : '<span class="neg">−</span>';
}
function s1Readouts() {
  const th=S1.theta, info=tangentAt(th), c=info.cos, s=info.sin;
  const deg = degOf(th);
  const ang=tangentAngle(th,S1.unit)+(S1.unit==='deg'?'°':' rad');
  const tanStr=info.mode==='undef'?t('undef'):tangentNumber(info.tan,info.cardinal);
  setRO('s1-readout', t('s1ro', { ang, cos:tangentNumber(c,info.cardinal),sin:tangentNumber(s,info.cardinal), tan: tanStr }));
  /* 象限行：边界角时点落在坐标轴上，不归入任何象限；
     且 90°/270° 处 tan 须显示「无定义」，与主读数一致（不能印 0） */
  if (info.mode==='undef') {
    setRO('s1-quad', t('s1axisY', { ss: signSpan(s), cs: signSpan(c), ts: t('undef') }));
  } else if(s===0) {
    setRO('s1-quad', t('s1axisX', { ss: signSpan(s), cs: signSpan(c), ts: signSpan(0) }));
  } else {
    const q=c>0?(s>0?1:4):(s>0?2:3);
    setRO('s1-quad', t('s1quad', {
      q, ss: signSpan(s), cs: signSpan(c), ts: signSpan(s / c)
    }));
  }
  setRO('s1-pyth', t('s1pyth', { c2:tangentNumber(c*c,info.cardinal),s2:tangentNumber(s*s,info.cardinal),sum:tangentNumber(c*c+s*s,false) }));
  /* 特殊角精确值卡片 */
  const body = $('s1-card-body');
  if (body) {
    const near = Math.round(deg);
    if (EXACT[near] && th===near*Math.PI/180) {
      const [es, ec, et] = EXACT[near];
      const html =
        '<span class="exact-line">sin θ = <b>' + es + '</b></span>' +
        '<span class="exact-line">cos θ = <b>' + ec + '</b></span>' +
        '<span class="exact-line">tan θ = <b>' + (et === null ? t('undef') : et) + '</b></span>';
      if (body._v !== html) { body._v = html; body.innerHTML = html; }
    } else if (body._v !== 'none') {
      body._v = 'none';
      body.textContent = t('s1exactNone');
    }
  }
}
function s1Set(th){if(!Number.isFinite(th))return false;S1.theta=norm(th);s1Draw();s1Readouts();queueTangentReading();return true;}
function initS1() {
  const cv = regCanvas('s1-canvas');
  const unitBtn = u => {
    S1.unit = u;
    $('s1-unit-deg').classList.toggle('active', u === 'deg');
    $('s1-unit-rad').classList.toggle('active', u === 'rad');
    for(const unit of ['deg','rad'])$('s1-unit-'+unit).setAttribute('aria-pressed',String(unit===u));
    s1Draw();s1Readouts();
  };
  $('s1-unit-deg').addEventListener('click', () => unitBtn('deg'));
  $('s1-unit-rad').addEventListener('click', () => unitBtn('rad'));
  document.querySelectorAll('[data-snap]').forEach(b => {
    b.addEventListener('click', () => s1Set(+b.dataset.snap * Math.PI / 180));
  });
  const angleFromEvent = e => {
    const rect = cv.getBoundingClientRect();
    const { cx, cy, R } = s1Geom({ _w: rect.width, _h: rect.height });
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dist = Math.hypot(x - cx, y - cy);
    return { th: norm(Math.atan2(-(y - cy), x - cx)), dist, R };
  };
  cv.addEventListener('pointerdown', e => {
    const a = angleFromEvent(e);
    if (a.dist <= a.R + 44) {
      S1.dragging = true;
      cv.setPointerCapture(e.pointerId);
      s1Set(s1Snap(a.th));
      e.preventDefault();
    }
  });
  cv.addEventListener('pointermove', e => {
    if (!S1.dragging) return;
    const a = angleFromEvent(e);
    s1Set(s1Snap(a.th));
  });
  const endDrag = () => { S1.dragging = false; };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('lostpointercapture',endDrag);
  cv.addEventListener('keydown',e=>tangentKeys(e,S1.theta,e.shiftKey?10:1,s1Set));
  onLangRefresh(() => { s1Draw(); s1Readouts(); });
  onRefit(() => { s1Draw(); });
  s1Draw(); s1Readouts();
}

/* ============================================================
   第 2 步：sin —— 身高摊开成波（振幅=半径，打点）
   ============================================================ */
const S2 = {
  phi: 2.2, theta: norm(2.2), R: 1, speed: 1.1, playing: true,
  trace: newTrace(), marks: [] /* [{deg(按下时标称), key(deg%360)}] */
};
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const g = machineGeom(cv, 2.25, 2);
  drawMachineCircle(ctx, g, S2.theta, S2.R, { sin: true, cos: false });
  drawTraceWave(ctx, g, S2.trace, it => it.s * S2.R, Math.sin(S2.theta) * S2.R, '#6ee7ff', 2.2, S2.phi);
  /* 打点标记：在 trace 采样里找相位角命中标记角的点 */
  if (S2.marks.length) {
    const sp = g.waveW / TRACE_LEN;
    const n = S2.trace.items.length;
    ctx.fillStyle = '#ffb454';
    for (let i = 0; i < n; i++) {
      const it = S2.trace.items[n - 1 - i];
      const d = degOf(norm(it.phi));
      for (const m of S2.marks) {
        let dd = Math.abs(d - m.key);
        dd = Math.min(dd, 360 - dd);
        if (dd <= TAU / SAMPLES_PER_PERIOD * 180 / Math.PI / 2 + 0.01) {
          ctx.beginPath();
          ctx.arc(g.headX + (i + 1) * sp, g.midY - it.s * S2.R * g.ppu, 4, 0, TAU);
          ctx.fill();
          break;
        }
      }
    }
  }
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = '#6ee7ff';
  ctx.fillText(t('cWave'), g.headX + 2, 14);
  ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cHeight'), 8, 14);
  TRIG.steps.s2 = {
    theta: S2.theta, sin: Math.sin(S2.theta), cos: Math.cos(S2.theta),
    radius: S2.R, waveTailSin: Math.sin(S2.theta) * S2.R
  };
  setRO('s2-readout', t('s2ro', {
    R: fmt(S2.R, 2), deg: fmt(degOf(S2.theta), 1), h: fmt(Math.sin(S2.theta) * S2.R, 3)
  }));
}
function s2MarksReadout() {
  if (!S2.marks.length) { setRO('s2-marks', t('s2marksNone')); return; }
  const list = S2.marks.slice().sort((a, b) => a.deg - b.deg)
    .map(m => t('s2markItem', { deg: m.deg, v: fmt(Math.sin(m.key * Math.PI / 180) * S2.R, 2) })).join(' · ');
  setRO('s2-marks', t('s2marks', { list }));
}
function s2ToggleLabel() {
  const b = $('s2-toggle'); if (b) b.textContent = S2.playing ? t('s2pause') : t('s2play');
}
function initS2() {
  regCanvas('s2-canvas');
  $('s2-r').addEventListener('input', e => {
    S2.R = +e.target.value;
    $('s2-r-val').textContent = fmt(S2.R, 2);
    traceReset(S2.trace);
    traceAdvance(S2.trace, S2.phi);
    s2MarksReadout();
    s2Draw();
  });
  document.querySelectorAll('[data-mark]').forEach(b => {
    b.addEventListener('click', () => {
      const deg = +b.dataset.mark;
      const base = (deg % 360) * Math.PI / 180;
      /* 跳转只向前转到下一个该角度：轨迹不清、已描波形与既有打点全保留，
         轨迹机顺着相位把中间一段补描出来（点到哪儿、波描到哪儿） */
      const k = Math.ceil((S2.phi - base) / TAU - 1e-9);
      S2.phi = base + k * TAU;
      S2.theta = norm(S2.phi);
      S2.playing = false; s2ToggleLabel();
      traceAdvance(S2.trace, S2.phi);
      /* 轨迹采样网格未必恰好落在目标角上：把此刻相位如实补记一笔，
         否则画布上找不到这一记打点（值就是此刻的 sin 本人） */
      if (Math.abs(S2.trace.lastPhi - S2.phi) > 1e-9) {
        S2.trace.items.push({ phi: S2.phi, s: Math.sin(S2.phi), c: Math.cos(S2.phi) });
        S2.trace.lastPhi = S2.phi;
        if (S2.trace.items.length > TRACE_LEN) S2.trace.items.splice(0, S2.trace.items.length - TRACE_LEN);
      }
      if (!S2.marks.some(m => m.key === deg % 360)) S2.marks.push({ deg, key: deg % 360 });
      document.querySelectorAll('[data-mark]').forEach(x =>
        x.classList.toggle('active', S2.marks.some(m => m.key === +x.dataset.mark % 360)));
      s2MarksReadout();
      s2Draw();
    });
  });
  $('s2-toggle').addEventListener('click', () => { S2.playing = !S2.playing; s2ToggleLabel(); });
  animate($('step2'), dt => {
    if (S2.playing) {
      S2.phi += S2.speed * dt;
      S2.theta = norm(S2.phi);
      traceAdvance(S2.trace, S2.phi);
    }
    s2Draw();
  });
  onLangRefresh(() => { s2ToggleLabel(); s2MarksReadout(); s2Draw(); });
  onRefit(s2Draw);
  s2ToggleLabel();
  traceAdvance(S2.trace, S2.phi);
  s2MarksReadout();
  s2Draw();
}

/* ============================================================
   第 3 步：cos —— 站位投影成波，与 sin 叠画（相位差 90°）
   ============================================================ */
const S3 = { phi: 0.6, theta: norm(0.6), mode: 'sin', playing: true, speed: 1.1, trace: newTrace() };
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const g = machineGeom(cv, 1.18, 1);
  const proj = { sin: S3.mode !== 'cos', cos: S3.mode !== 'sin' };
  drawMachineCircle(ctx, g, S3.theta, 1, proj);
  if (S3.mode === 'sin' || S3.mode === 'both') {
    drawTraceWave(ctx, g, S3.trace, it => it.s, Math.sin(S3.theta), '#6ee7ff', 2.2, S3.phi);
  }
  if (S3.mode === 'cos' || S3.mode === 'both') {
    drawTraceWave(ctx, g, S3.trace, it => it.c, Math.cos(S3.theta), '#ffb454', 2.2, S3.phi);
  }
  /* 图例 */
  ctx.font = '12.5px system-ui, sans-serif';
  let lx = g.headX + 2;
  if (S3.mode !== 'cos') {
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx, 13); ctx.lineTo(lx + 18, 13); ctx.stroke();
    ctx.fillStyle = '#6ee7ff'; ctx.fillText(t('cSinWave'), lx + 23, 14);
    lx += 23 + ctx.measureText(t('cSinWave')).width + 16;
  }
  if (S3.mode !== 'sin') {
    ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx, 13); ctx.lineTo(lx + 18, 13); ctx.stroke();
    ctx.fillStyle = '#ffb454'; ctx.fillText(t('cCosWave'), lx + 23, 14);
  }
  TRIG.steps.s3 = {
    theta: S3.theta, sin: Math.sin(S3.theta), cos: Math.cos(S3.theta),
    waveTailSin: Math.sin(S3.theta), waveTailCos: Math.cos(S3.theta), mode: S3.mode
  };
  setRO('s3-readout', t('s3ro', {
    deg: fmt(degOf(S3.theta), 1), sin: fmt(Math.sin(S3.theta), 3),
    cos: fmt(Math.cos(S3.theta), 3), shift: fmt(Math.sin(S3.theta + Math.PI / 2), 3)
  }));
}
function s3ToggleLabel() {
  const b = $('s3-toggle'); if (b) b.textContent = S3.playing ? t('pause') : t('play');
}
function initS3() {
  regCanvas('s3-canvas');
  const setMode = m => {
    S3.mode = m;
    $('s3-m-sin').classList.toggle('active', m === 'sin');
    $('s3-m-cos').classList.toggle('active', m === 'cos');
    $('s3-m-both').classList.toggle('active', m === 'both');
    s3Draw();
  };
  $('s3-m-sin').addEventListener('click', () => setMode('sin'));
  $('s3-m-cos').addEventListener('click', () => setMode('cos'));
  $('s3-m-both').addEventListener('click', () => setMode('both'));
  $('s3-toggle').addEventListener('click', () => { S3.playing = !S3.playing; s3ToggleLabel(); });
  animate($('step3'), dt => {
    if (S3.playing) {
      S3.phi += S3.speed * dt;
      S3.theta = norm(S3.phi);
      traceAdvance(S3.trace, S3.phi);
    }
    s3Draw();
  });
  onLangRefresh(() => { s3ToggleLabel(); s3Draw(); });
  onRefit(s3Draw);
  s3ToggleLabel();
  traceAdvance(S3.trace, S3.phi);
  s3Draw();
}

/* ============================================================
   第 4 步：tan —— 过原点直线交 x=1 竖线的高度（诚实发散）
   ============================================================ */
const S4 = { theta: 35 * Math.PI / 180, dragging: false };
const S4_YRANGE=3.3;
function s4Geom(cv) {
  const w = cv._w, h = cv._h;
  return { w, h, ox: w * 0.40, oy: h / 2 + 8, scale: (h - 110) / 2 / S4_YRANGE };
}
function s4Mode(){return tangentAt(S4.theta).mode;}
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const { w, h, ox, oy, scale } = s4Geom(cv);
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const X = v => ox + v * scale, Y = v => oy - v * scale;
  const th=S4.theta, info=tangentAt(th), c=info.cos, s=info.sin, tv=info.tan;
  const mode = s4Mode();
  /* 网格 */
  ctx.strokeStyle = '#1a2230'; ctx.lineWidth = 1;
  for (const gx of [-2, -1, 1, 2, 3]) {
    if (X(gx) < 8 || X(gx) > w - 8) continue;
    ctx.beginPath(); ctx.moveTo(X(gx), 26); ctx.lineTo(X(gx), h - 22); ctx.stroke();
  }
  for (const gy of [-3, -2, -1, 1, 2, 3]) {
    ctx.beginPath(); ctx.moveTo(10, Y(gy)); ctx.lineTo(w - 10, Y(gy)); ctx.stroke();
  }
  /* 坐标轴 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(8, oy); ctx.lineTo(w - 8, oy);
  ctx.moveTo(ox, 24); ctx.lineTo(ox, h - 20);
  ctx.stroke();
  /* 刻度 */
  ctx.fillStyle = '#9aa7b8'; ctx.font = '11.5px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('1', X(1), oy + 15);
  ctx.fillText('−1', X(-1), oy + 15);
  ctx.fillText('O', ox - 9, oy + 14);
  ctx.textAlign = 'left';
  ctx.fillText('1', ox + 5, Y(1) + 4);
  /* x=1 的墙 */
  ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 2; ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(X(1), 26); ctx.lineTo(X(1), h - 22); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff7a93'; ctx.font = '12.5px system-ui, sans-serif';
  ctx.fillText(t('cWall'), X(1) + 7, 36);
  /* 单位圆 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(ox, oy, scale, 0, TAU); ctx.stroke();
  /* 过原点与点的直线（整条，含反向延长） */
  const L = 8;
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(X(-c * L), Y(-s * L)); ctx.lineTo(X(c * L), Y(s * L));
  ctx.stroke();
  /* tan 段：(1,0) → (1,tan) */
  if (mode !== 'undef') {
    const clipped = clamp(tv, -S4_YRANGE, S4_YRANGE);
    ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(X(1), Y(0)); ctx.lineTo(X(1), Y(clipped)); ctx.stroke();
    if (Math.abs(tv) <= S4_YRANGE) {
      ctx.beginPath(); ctx.arc(X(1), Y(tv), 5, 0, TAU);
      ctx.fillStyle = '#ff7a93'; ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = '#0d1117'; ctx.stroke();
      ctx.fillStyle = '#ff7a93'; ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(t('cTanLab'), X(1) + 9, Y(tv) + (tv >= 0 ? -8 : 16));
    } else {
      /* 箭头：指向冲出画面的方向 */
      const dir = tv > 0 ? -1 : 1;
      const ay = Y(clipped);
      ctx.fillStyle = '#ff7a93';
      ctx.beginPath();
      ctx.moveTo(X(1), ay + dir * 4);
      ctx.lineTo(X(1) - 6, ay - dir * 8);
      ctx.lineTo(X(1) + 6, ay - dir * 8);
      ctx.closePath(); ctx.fill();
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(t('cTanOutside'), X(1) + 9, ay + 4);
    }
  }
  /* 半径与点 */
  ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(c), Y(s)); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(c), Y(s), 6, 0, TAU);
  ctx.fillStyle = '#ffd166'; ctx.fill();
  ctx.lineWidth = 1.4; ctx.strokeStyle = '#0d1117'; ctx.stroke();
  TRIG.steps.s4 = { theta: th, sin: s, cos: c, tan: tv, tanMode: mode, wallY: tv };
}
function s4Readout(){
  const info=tangentAt(S4.theta),deg=tangentAngle(info.theta);
  if(info.mode==='undef')setRO('s4-readout',t('s4roUndef',{deg,sin:tangentNumber(info.sin,true)}));
  else{
    let str=t('s4ro',{deg,tan:tangentNumber(info.tan,info.cardinal),sin:tangentNumber(info.sin,info.cardinal),cos:tangentNumber(info.cos,info.cardinal),ratio:tangentNumber(info.tan,info.cardinal)});
    if(Math.abs(info.tan)>S4_YRANGE)str+=' '+t('s4roOff');setRO('s4-readout',str);
  }
  const pole=info.theta<Math.PI?Math.PI/2:3*Math.PI/2;
  $('s4-domain').textContent=t('s4domain',{delta:tangentNumber(info.theta-pole,info.theta===pole)});
}
function s4SyncSlider(){const sl=$('s4-th');if(sl)sl.value=String(degOf(S4.theta));const val=$('s4-th-val');if(val)val.textContent=tangentAngle(S4.theta);}
function s4Set(th){if(!Number.isFinite(th))return false;S4.theta=norm(th);s4Draw();s4Readout();s4SyncSlider();queueTangentReading();return true;}
function initS4() {
  const cv = regCanvas('s4-canvas');
  $('s4-th').addEventListener('input',e=>s4Set(Number(e.target.value)*Math.PI/180));
  $('s4-th').addEventListener('keydown',e=>tangentKeys(e,S4.theta,e.shiftKey?1:.1,s4Set));
  document.querySelectorAll('[data-tandeg]').forEach(b => {
    b.addEventListener('click', () => s4Set(+b.dataset.tandeg * Math.PI / 180));
  });
  const angleFromEvent = e => {
    const rect = cv.getBoundingClientRect();
    const { ox, oy, scale } = s4Geom({ _w: rect.width, _h: rect.height });
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    return { th: norm(Math.atan2(-(y - oy), x - ox)), dist: Math.hypot(x - ox, y - oy), scale };
  };
  cv.addEventListener('pointerdown', e => {
    const a = angleFromEvent(e);
    if (a.dist <= a.scale + 44) {
      S4.dragging = true;
      cv.setPointerCapture(e.pointerId);
      s4Set(a.th);
      e.preventDefault();
    }
  });
  cv.addEventListener('pointermove', e => { if (S4.dragging) s4Set(angleFromEvent(e).th); });
  const endDrag = () => { S4.dragging = false; };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('lostpointercapture',endDrag);
  cv.addEventListener('keydown',e=>tangentKeys(e,S4.theta,e.shiftKey?1:0.1,s4Set));
  onLangRefresh(() => { s4Draw(); s4Readout(); });
  onRefit(() => { s4Draw(); });
  s4Draw(); s4Readout(); s4SyncSlider();
}

/* ============================================================
   第 5 步：旋转 ⇄ 往复（三联：摩天轮 / 曲柄活塞 / 声音，共用一个转速）
   活塞几何（诚实）：曲柄半径 r=1、连杆 L=2.5，
   活塞位置 x(θ) = cosθ + sqrt(L² − sin²θ) —— 有限连杆 ≠ 纯正弦。
   ============================================================ */
const ROD = 2.5;
function pistonX(th) { const s = Math.sin(th); return Math.cos(th) + Math.sqrt(ROD * ROD - s * s); }
function pistonNorm(th) { return pistonX(th) - ROD; }
function pistonDiff(th) { return pistonNorm(th) - Math.cos(th); }
const S5 = { phi: 0.4, theta: norm(0.4), rps: 0.8, trace: newTrace() };
/* 小波带（与 drawTraceWave 同口径：最新在左、波头=此刻真值） */
function drawStrip(ctx, x0, wdt, midY, ppu, tr, getVal, curVal, color, dashed) {
  const sp = wdt / TRACE_LEN;
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0 - 2, midY); ctx.lineTo(x0 + wdt + 2, midY); ctx.stroke();
  const n = tr.items.length;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x0, midY - curVal * ppu);
  for (let i = 0; i < n; i++) {
    const it = tr.items[n - 1 - i];
    ctx.lineTo(x0 + (i + 1) * sp, midY - getVal(it) * ppu);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(x0, midY - curVal * ppu, 3.2, 0, TAU);
  ctx.fillStyle = color; ctx.fill();
}
function s5DrawWheel() {
  const cv = $('s5-wheel'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = 82, R = Math.min(w * 0.30, 58);
  /* 支架与地面 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy); ctx.lineTo(cx - 26, 148);
  ctx.moveTo(cx, cy); ctx.lineTo(cx + 26, 148);
  ctx.moveTo(cx - 44, 148); ctx.lineTo(cx + 44, 148);
  ctx.stroke();
  /* 轮与座舱 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const a = S5.theta + k * Math.PI / 4;
    const px = cx + Math.cos(a) * R, py = cy - Math.sin(a) * R;
    ctx.strokeStyle = '#41506a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU);
    ctx.fillStyle = k === 0 ? '#ffb454' : '#1c2330'; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = k === 0 ? '#ffd166' : '#41506a'; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, TAU); ctx.fillStyle = '#9aa7b8'; ctx.fill();
  /* 高度波带 */
  ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cHeightWave'), 12, 164);
  drawStrip(ctx, 12, w - 24, 204, 27, S5.trace, it => it.s, Math.sin(S5.theta), '#6ee7ff', false);
}
function s5DrawPiston() {
  const cv = $('s5-piston'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const th = S5.theta;
  const cp = clamp((w - 150) / 3.6, 18, 38); /* 曲柄半径 px */
  const cx0 = cp + 18, cy0 = 66;
  const pinX = cx0 + Math.cos(th) * cp, pinY = cy0 - Math.sin(th) * cp;
  const pisX = cx0 + pistonX(th) * cp;
  /* 气缸导轨 */
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx0 + cp * 1.1, cy0 - 24); ctx.lineTo(w - 8, cy0 - 24);
  ctx.moveTo(cx0 + cp * 1.1, cy0 + 24); ctx.lineTo(w - 8, cy0 + 24);
  ctx.stroke();
  /* 曲柄盘 */
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx0, cy0, cp, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(pinX, pinY); ctx.stroke();
  /* 连杆 */
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(pinX, pinY); ctx.lineTo(pisX, cy0); ctx.stroke();
  /* 活塞块 */
  ctx.fillStyle = '#1c2330'; ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.fillRect(pisX, cy0 - 20, 28, 40);
  ctx.strokeRect(pisX, cy0 - 20, 28, 40);
  ctx.beginPath(); ctx.arc(pinX, pinY, 4.5, 0, TAU); ctx.fillStyle = '#ffd166'; ctx.fill();
  /* 叠画带：活塞（橙实） vs 纯正弦（青虚） */
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#ffb454'; ctx.fillText(t('cPiston'), 12, 138);
  ctx.fillStyle = '#6ee7ff';
  const pwTxt = t('cPure');
  ctx.fillText(pwTxt, 20 + ctx.measureText(t('cPiston')).width + 14, 138);
  drawStrip(ctx, 12, w - 24, 168, 20, S5.trace, it => Math.cos(it.phi), Math.cos(th), '#6ee7ff', true);
  drawStrip(ctx, 12, w - 24, 168, 20, S5.trace, it => pistonNorm(it.phi), pistonNorm(th), '#ffb454', false);
  /* 差异带（×3） */
  ctx.fillStyle = '#ff7a93';
  ctx.fillText(t('cDiff'), 12, 200);
  const dMid = 222, dPpu = 22;
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(10, dMid); ctx.lineTo(w - 10, dMid); ctx.stroke();
  const n = S5.trace.items.length, sp = (w - 24) / TRACE_LEN;
  ctx.beginPath();
  ctx.moveTo(12, dMid - pistonDiff(th) * 3 * dPpu);
  for (let i = 0; i < n; i++) {
    const it = S5.trace.items[n - 1 - i];
    ctx.lineTo(12 + (i + 1) * sp, dMid - pistonDiff(it.phi) * 3 * dPpu);
  }
  ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 1.8; ctx.stroke();
}
function s5DrawSound() {
  const cv = $('s5-sound'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const w = cv._w, h = cv._h;
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const padL = 12, padR = 10, padT = 28, padB = 22;
  const pw = w - padL - padR, midY = padT + (h - padT - padB) / 2, amp = (h - padT - padB) / 2 - 6;
  ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = '#9aa7b8';
  ctx.fillText(t('cSoundWave'), padL, 16);
  ctx.strokeStyle = '#232d3f'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + pw, midY); ctx.stroke();
  /* 高度波：y = sin(2π · rps · t)，t ∈ [0, 2] 秒 —— 就是转着的点的高度函数 */
  ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= pw; i++) {
    const tt = (i / pw) * 2;
    const v = Math.sin(TAU * S5.rps * tt);
    i ? ctx.lineTo(padL + i, midY - v * amp) : ctx.moveTo(padL + i, midY - v * amp);
  }
  ctx.stroke();
  /* 此刻的点：相位与摩天轮上的点同步 */
  const cyc = S5.rps * 2;
  const frac = cyc > 0 ? ((S5.phi / TAU) % cyc) / cyc : 0;
  const nx = padL + frac * pw, ny = midY - Math.sin(S5.phi) * amp;
  ctx.strokeStyle = 'rgba(255,180,84,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(nx, padT); ctx.lineTo(nx, h - padB); ctx.stroke();
  ctx.beginPath(); ctx.arc(nx, ny, 4, 0, TAU); ctx.fillStyle = '#ffb454'; ctx.fill();
  ctx.fillStyle = '#9aa7b8'; ctx.font = '11.5px system-ui, sans-serif';
  ctx.fillText('0', padL, h - 6);
  ctx.textAlign = 'right'; ctx.fillText('2 s', padL + pw, h - 6); ctx.textAlign = 'left';
}
function s5Readouts() {
  const th = S5.theta;
  setRO('s5-wheel-ro', t('s5wheelRo', { sin: fmt(Math.sin(th), 2), deg: fmt(degOf(th), 0) }));
  setRO('s5-piston-ro', t('s5pistonRo', {
    p: fmt(pistonNorm(th), 3), pure: fmt(Math.cos(th), 3), diff: fmt(pistonDiff(th), 3)
  }));
  setRO('s5-sound-ro', t('s5soundRo', { rps: fmt(S5.rps, 2), hz: Math.round(S5.rps * 220) }));
  TRIG.steps.s5 = {
    theta: th, sin: Math.sin(th), cos: Math.cos(th), rps: S5.rps,
    audioHz: S5.rps * 220, wheelHeight: Math.sin(th),
    piston: pistonNorm(th), pistonPure: Math.cos(th), pistonDiff: pistonDiff(th)
  };
}
function s5DrawAll() { s5DrawWheel(); s5DrawPiston(); s5DrawSound(); }
/* --- 声音：默认静默、点击才建 AudioContext、增益保守（沿用采样页礼仪） --- */
const S5AU = { ctx: null, osc: null, gain: null, on: false };
function s5AudioStop() {
  if (S5AU.osc && S5AU.ctx) {
    const o = S5AU.osc, g = S5AU.gain;
    try {
      g.gain.exponentialRampToValueAtTime(0.0001, S5AU.ctx.currentTime + 0.06);
      setTimeout(() => { try { o.stop(); } catch (e) { /* 已停 */ } }, 90);
    } catch (e) { /* 忽略 */ }
  }
  S5AU.osc = null; S5AU.on = false;
  const b = $('s5-play');
  if (b) { b.textContent = t('s5play'); b.classList.remove('active'); }
}
function s5AudioStart() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!S5AU.ctx) S5AU.ctx = new AC();
  if (S5AU.ctx.state === 'suspended') S5AU.ctx.resume();
  const ctx = S5AU.ctx;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = S5.rps * 220;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.08);
  osc.connect(g); g.connect(ctx.destination);
  osc.start();
  S5AU.osc = osc; S5AU.gain = g; S5AU.on = true;
  const b = $('s5-play');
  if (b) { b.textContent = t('s5stop'); b.classList.add('active'); }
}
function initS5() {
  regCanvas('s5-wheel'); regCanvas('s5-piston'); regCanvas('s5-sound');
  $('s5-speed').addEventListener('input', e => {
    S5.rps = +e.target.value;
    $('s5-speed-val').textContent = fmt(S5.rps, 2);
    if (S5AU.on && S5AU.osc) S5AU.osc.frequency.setTargetAtTime(S5.rps * 220, S5AU.ctx.currentTime, 0.03);
    s5DrawSound(); s5Readouts();
  });
  $('s5-play').addEventListener('click', () => { S5AU.on ? s5AudioStop() : s5AudioStart(); });
  const io5 = new IntersectionObserver(es => {
    es.forEach(e => { if (!e.isIntersecting && S5AU.on) s5AudioStop(); });
  }, { threshold: 0.05 });
  io5.observe($('step5'));
  animate($('step5'), dt => {
    S5.phi += TAU * S5.rps * dt;
    S5.theta = norm(S5.phi);
    traceAdvance(S5.trace, S5.phi);
    s5DrawAll(); s5Readouts();
  });
  onLangRefresh(() => {
    const b = $('s5-play');
    if (b) b.textContent = S5AU.on ? t('s5stop') : t('s5play');
    s5DrawAll(); s5Readouts();
  });
  onRefit(s5DrawAll);
  traceAdvance(S5.trace, S5.phi);
  s5DrawAll(); s5Readouts();
}

/* ============================================================
   第 6 步：终章总览台（拖 θ → 三读数 + 三条波同高亮；双圆链预演）
   三条波的轨迹由点扫过的角度逐桶描出（bucket = 该角度处投影真值）。
   ============================================================ */
const S6 = {
  theta: 0.9, playing: false, chain: false, N: 720,
  bSin: null, bCos: null, bTan: null, lastTheta: null, trail: []
};
function s6ResetBuckets() {
  S6.bSin = new Float32Array(S6.N).fill(NaN);
  S6.bCos = new Float32Array(S6.N).fill(NaN);
  S6.bTan = new Float32Array(S6.N).fill(NaN);
}
function s6Bucket(a) {
  const th = norm(a);
  const idx = Math.floor(th / TAU * S6.N) % S6.N;
  const info=tangentAt(th);S6.bSin[idx]=info.sin;S6.bCos[idx]=info.cos;
  S6.bTan[idx]=info.mode==='num'&&Math.abs(info.tan)<=3.4?info.tan:NaN;
}
function s6Paint(nt) {
  if (S6.lastTheta === null) { s6Bucket(nt); S6.lastTheta = nt; return; }
  let d = Math.atan2(Math.sin(nt - S6.lastTheta), Math.cos(nt - S6.lastTheta));
  const step = TAU / S6.N;
  if (Math.abs(d) > 1e-12) {
    const inc = Math.sign(d) * step;
    let a = S6.lastTheta;
    while (Math.abs(a - S6.lastTheta) < Math.abs(d)) { a += inc; s6Bucket(a); }
  }
  s6Bucket(nt);
  S6.lastTheta = nt;
}
function s6Geom(cv) {
  const w = cv._w, h = cv._h;
  if (w >= 640) {
    const czw = Math.floor(w * 0.44);
    return { stack: false, w, h, czx: 0, czw, czh: h, sx: czw + 10, sw: w - czw - 20 };
  }
  return { stack: true, w, h, czx: 0, czw: w, czh: Math.floor(h * 0.46), sx: 10, sw: w - 20 };
}
function s6Strip(ctx, x, y, wdt, hgt, label, color, buckets, range, curVal) {
  const midY = y + hgt / 2, ppu = (hgt / 2 - 8) / range;
  ctx.strokeStyle = '#1a2230'; ctx.lineWidth = 1;
  ctx.strokeRect(x, y, wdt, hgt);
  ctx.strokeStyle = '#232d3f';
  ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x + wdt, midY); ctx.stroke();
  ctx.font = '12.5px system-ui, sans-serif'; ctx.fillStyle = color;
  ctx.fillText(label, x + 6, y + 15);
  /* 已描出的轨迹（逐桶连线，NaN 处断开） */
  ctx.strokeStyle = color; ctx.lineWidth = 1.8;
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i < S6.N; i++) {
    const v = buckets[i];
    if (Number.isNaN(v)) { pen = false; continue; }
    const bx = x + (i + 0.5) / S6.N * wdt, by = midY - v * ppu;
    if (!pen) { ctx.moveTo(bx, by); pen = true; } else ctx.lineTo(bx, by);
  }
  ctx.stroke();
  /* 此刻位置 */
  const cxp = x + (S6.theta / TAU) * wdt;
  const over = Math.abs(curVal) > range;
  const cyv = midY - clamp(curVal, -range, range) * ppu;
  ctx.strokeStyle = 'rgba(232,237,244,.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cxp, y + 3); ctx.lineTo(cxp, y + hgt - 3); ctx.stroke();
  if(curVal===null||!Number.isFinite(curVal))return;
  if (over) {
    const dir = curVal > 0 ? -1 : 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cxp, cyv + dir * 2);
    ctx.lineTo(cxp - 5, cyv - dir * 7);
    ctx.lineTo(cxp + 5, cyv - dir * 7);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(cxp, cyv, 4, 0, TAU);
    ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#0d1117'; ctx.stroke();
  }
}
function s6Draw() {
  const cv = $('s6-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const { w, h } = { w: cv._w, h: cv._h };
  if (w < 10) return;
  ctx.clearRect(0, 0, w, h);
  const g = s6Geom(cv);
  const th=S6.theta, info=tangentAt(th), c=info.cos, s=info.sin;
  /* --- 圆区 --- */
  const ccx = g.czx + g.czw / 2, ccy = g.czh / 2, R = Math.min(g.czw, g.czh) * 0.40;
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ccx - R - 16, ccy); ctx.lineTo(ccx + R + 16, ccy);
  ctx.moveTo(ccx, ccy - R - 16); ctx.lineTo(ccx, ccy + R + 16);
  ctx.stroke();
  ctx.strokeStyle = '#8494ab'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, TAU); ctx.stroke();
  const p1x = ccx + c * R, p1y = ccy - s * R;
  /* 投影（两向，细） */
  ctx.strokeStyle = 'rgba(110,231,255,.5)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p1x, ccy); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,180,84,.5)';
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(ccx, p1y); ctx.stroke();
  ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(p1x, p1y); ctx.stroke();
  /* --- 双圆链 --- */
  if (S6.chain) {
    const r2 = R * 0.5;
    const tipx = p1x + Math.cos(2 * th) * r2, tipy = p1y - Math.sin(2 * th) * r2;
    /* 笔尖轨迹 */
    if (S6.trail.length > 1) {
      ctx.strokeStyle = 'rgba(255,122,147,.75)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      S6.trail.forEach((p, i) => {
        const X = ccx + p.x * R, Y = ccy - p.y * R;
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      });
      ctx.stroke();
    }
    ctx.strokeStyle = '#ff7a93'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(p1x, p1y, r2, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(tipx, tipy); ctx.stroke();
    ctx.beginPath(); ctx.arc(tipx, tipy, 4.5, 0, TAU);
    ctx.fillStyle = '#ff7a93'; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(p1x, p1y, 6, 0, TAU);
  ctx.fillStyle = '#ffd166'; ctx.fill();
  ctx.lineWidth = 1.4; ctx.strokeStyle = '#0d1117'; ctx.stroke();
  /* --- 三条波带 --- */
  const fns = [
    ['sin θ', '#6ee7ff', S6.bSin, 1.2, s],
    ['cos θ', '#ffb454', S6.bCos, 1.2, c],
    ['tan θ', '#ff7a93', S6.bTan, 3.4, info.tan]
  ];
  if (!g.stack) {
    const sh = (h - 24 - 16) / 3;
    fns.forEach((f, i) => s6Strip(ctx, g.sx, 12 + i * (sh + 8), g.sw, sh, f[0], f[1], f[2], f[3], f[4]));
  } else {
    const zoneY = g.czh + 8, sh = (h - zoneY - 16) / 3;
    fns.forEach((f, i) => s6Strip(ctx, g.sx, zoneY + i * (sh + 6), g.sw, sh, f[0], f[1], f[2], f[3], f[4]));
  }
  TRIG.steps.s6 = { theta: th, sin: s, cos: c, tan: info.tan, tanMode:info.mode, chain: S6.chain };
}
function s6TanStr(){const info=tangentAt(S6.theta);return info.mode==='undef'?t('undef'):tangentNumber(info.tan,info.cardinal);}
function s6Readout(){const info=tangentAt(S6.theta);setRO('s6-readout',t('s6ro',{deg:tangentAngle(S6.theta),rad:tangentAngle(S6.theta,'rad'),sin:tangentNumber(info.sin,info.cardinal),cos:tangentNumber(info.cos,info.cardinal),tan:s6TanStr()}));}
function s6Manual(nt){if(!Number.isFinite(nt))return false;S6.playing=false;s6Labels();s6Apply(nt);queueTangentReading();return true;}
function s6Apply(nt) {
  s6Paint(nt);
  S6.theta = norm(nt);
  if (S6.chain) {
    const tip = {
      x: Math.cos(S6.theta) + 0.5 * Math.cos(2 * S6.theta),
      y: Math.sin(S6.theta) + 0.5 * Math.sin(2 * S6.theta)
    };
    const last = S6.trail[S6.trail.length - 1];
    if (!last || Math.hypot(tip.x - last.x, tip.y - last.y) > 0.004) {
      S6.trail.push(tip);
      if (S6.trail.length > 600) S6.trail.shift();
    }
  }
  s6Draw(); s6Readout();
}
function s6Labels() {
  if($('s6-toggle')){$('s6-toggle').setAttribute('aria-pressed',String(S6.playing));$('s6-toggle').classList.toggle('active',S6.playing);}
  if($('s6-chain'))$('s6-chain').setAttribute('aria-pressed',String(S6.chain));
  const tb = $('s6-toggle'); if (tb) tb.textContent = S6.playing ? t('s6pause') : t('s6play');
  const cb = $('s6-chain'); if (cb) cb.textContent = S6.chain ? t('s6chainOff') : t('s6chain');
}
function initS6() {
  const cv = regCanvas('s6-canvas');
  s6ResetBuckets();
  let dragging = false;
  const angleFromEvent = e => {
    const rect = cv.getBoundingClientRect();
    const g = s6Geom({ _w: rect.width, _h: rect.height });
    const ccx = g.czx + g.czw / 2, ccy = g.czh / 2, R = Math.min(g.czw, g.czh) * 0.40;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    return { th: norm(Math.atan2(-(y - ccy), x - ccx)), dist: Math.hypot(x - ccx, y - ccy), R };
  };
  cv.addEventListener('pointerdown', e => {
    const a = angleFromEvent(e);
    if (a.dist <= a.R + 48) {
      dragging = true;
      cv.setPointerCapture(e.pointerId);
      s6Manual(a.th);
      e.preventDefault();
    }
  });
  cv.addEventListener('pointermove', e => { if (dragging) s6Manual(angleFromEvent(e).th); });
  const endDrag=()=>{dragging=false;queueTangentReading();};
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('lostpointercapture',endDrag);
  cv.addEventListener('keydown',e=>tangentKeys(e,S6.theta,e.shiftKey?10:1,s6Manual));
  $('s6-toggle').addEventListener('click', () => {
    S6.playing = !S6.playing;
    $('s6-toggle').classList.toggle('active', S6.playing);
    s6Labels();
  });
  $('s6-chain').addEventListener('click', () => {
    S6.chain = !S6.chain;
    if (!S6.chain) S6.trail = [];
    $('s6-chain').classList.toggle('active', S6.chain);
    s6Labels(); s6Draw();queueTangentReading();
  });
  $('s6-clear').addEventListener('click', () => {
    s6ResetBuckets();
    S6.trail = [];
    S6.lastTheta = null;
    s6Paint(S6.theta);
    s6Draw();
  });
  animate($('step6'), dt => {
    if (S6.playing) s6Apply(S6.theta + dt * 1.1);
  });
  onLangRefresh(() => { s6Labels(); s6Draw(); s6Readout(); });
  onRefit(s6Draw);
  s6Labels();
  s6Paint(S6.theta);
  s6Draw(); s6Readout();
}

/* ---------- 对账入口：TRIG.set(stepKey, θ弧度) ---------- */
TRIG.set = function (key, thetaRad) {
  if(!Number.isFinite(thetaRad)||!['s0','s1','s2','s3','s4','s5','s6'].includes(key))return false;
  const th = norm(thetaRad);
  if (key === 's0') {
    S0.phi = th; S0.theta = th;
    traceReset(S0.trace); traceAdvance(S0.trace, th); s0Draw();
  } else if (key === 's1') {
    s1Set(th);
  } else if (key === 's2') {
    const k = Math.round((S2.phi - th) / TAU);
    S2.phi = th + k * TAU; S2.theta = th; s2Draw();
  } else if (key === 's3') {
    const k = Math.round((S3.phi - th) / TAU);
    S3.phi = th + k * TAU; S3.theta = th; s3Draw();
  } else if (key === 's4') {
    s4Set(th);
  } else if (key === 's5') {
    S5.phi = th; S5.theta = th;
    traceReset(S5.trace); traceAdvance(S5.trace, th);
    s5DrawAll(); s5Readouts();
  } else if (key === 's6') {
    s6Manual(th);
  }
  return true;
};

/* Reading context only: no trace/quiz/profile or autoplay restoration. */
let tangentReadingTimer=null;
function queueTangentReading(){clearTimeout(tangentReadingTimer);tangentReadingTimer=setTimeout(saveTangentReading,180);}
function validTangentReading(v){return !!v&&typeof v==='object'&&!Array.isArray(v)&&v.version===1&&v.lesson==='trig'&&[v.s1,v.s4,v.s6].every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&Number.isFinite(x.theta)&&x.theta>=0&&x.theta<TAU)&&['deg','rad'].includes(v.s1.unit)&&typeof v.s6.chain==='boolean';}
function restoreTangentReading(){try{const v=history.state&&history.state.knowledgeGeometryReading;if(validTangentReading(v)){S1.theta=v.s1.theta;S1.unit=v.s1.unit;S4.theta=v.s4.theta;S6.theta=v.s6.theta;S6.chain=v.s6.chain;S6.playing=false;}}catch(_){}}
function saveTangentReading(){clearTimeout(tangentReadingTimer);tangentReadingTimer=null;try{const prior=history.state;history.replaceState({...((prior&&typeof prior==='object'&&!Array.isArray(prior))?prior:{}),knowledgeGeometryReading:{version:1,lesson:'trig',s1:{theta:S1.theta,unit:S1.unit},s4:{theta:S4.theta},s6:{theta:S6.theta,chain:S6.chain}}},'');}catch(_){}}
function syncTangentControls(){s4SyncSlider();for(const unit of ['deg','rad']){const b=$('s1-unit-'+unit);b.classList.toggle('active',S1.unit===unit);b.setAttribute('aria-pressed',String(S1.unit===unit));}S6.playing=false;s6Labels();$('s6-toggle').classList.remove('active');$('s6-chain').classList.toggle('active',S6.chain);}
function tangentKeys(e,theta,degrees,apply){const d={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();apply(tangentStep(theta,d*degrees));}else if(e.key==='Home'||e.key==='End'){e.preventDefault();apply(0);}}
TRIG.tangentAt=tangentAt;TRIG.tangentStep=tangentStep;
/* ---------- 启动（i18n 的 applyLang 已先行运行） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  restoreTangentReading();initS0(); initS1(); initS2(); initS3(); initS4(); initS5(); initS6();syncTangentControls();
  // Persist completed native edits before a possible immediate reload; previews stay debounced.
  for(const id of ['s1-canvas','s4-canvas','s6-canvas'])for(const event of ['pointerup','pointercancel','lostpointercapture'])$(id).addEventListener(event,saveTangentReading);
  for(const id of ['s1-canvas','s4-canvas','s6-canvas','s4-th'])$(id).addEventListener('keyup',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key))saveTangentReading();});
  $('s4-th').addEventListener('change',saveTangentReading);
  document.querySelectorAll('[data-snap],[data-tandeg],#s1-unit-deg,#s1-unit-rad,#s6-chain,#s6-toggle').forEach(el=>el.addEventListener('click',saveTangentReading));
  document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',()=>{if(!a.getAttribute('href').startsWith('#'))saveTangentReading();}));
  window.addEventListener('pagehide',()=>{S6.playing=false;saveTangentReading();});
  window.addEventListener('pageshow',()=>requestAnimationFrame(()=>{syncTangentControls();s1Draw();s1Readouts();s4Draw();s4Readout();s6Draw();s6Readout();}));
});
