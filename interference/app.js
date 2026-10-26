'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';

/* ================= PURE-BEGIN ================= */
/* 计算层（唯一真值源）：所有读数、判定、包络分类都由这里实算。
   视觉层（俯视圆纹）只是示意：圆环半径满足同一相位条件 ωt − kr + φ = π/2 + 2πn，
   与源振动相位一致，但圆纹本身不参与任何读数。 */
const AMP = 1, PERIOD = 4;                 // 振幅 A、周期 T（秒）
const SRC1 = [-3, 0], SRC2 = [3, 0], DS = 3; // 两波源位置（单位长度）与半间距
function waveK(lam) { return 2 * Math.PI / lam; }
function omega() { return 2 * Math.PI / PERIOD; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
/* 单列波在距离 r 处的位移；phi 为该源的初相位 */
function yAt(tt, r, lam, phi) { return AMP * Math.sin(omega() * tt - waveK(lam) * r + (phi || 0)); }
/* 两列波在 P（到两源距离 r1、r2）的合成位移；源 2 带相位差 phi */
function ySum(tt, r1, r2, lam, phi) { return yAt(tt, r1, lam, 0) + yAt(tt, r2, lam, phi || 0); }
/* Directed d=r2-r1; one canonical phase result drives amplitude and classification.
   Snapping is machine-scale only, not a physical near-still tolerance. */
function phaseState(dr, lam, phi=0) {
  if (![dr,lam,phi].every(Number.isFinite) || lam <= 0) throw new RangeError('Invalid phase state');
  const n=dr/lam-phi/(2*Math.PI), twice=Math.round(2*n);
  const snapped=Math.abs(2*n-twice)<1e-12;
  const cls=snapped?(twice%2===0?'max':'min'):'mid';
  const amp=cls==='min'?0:cls==='max'?2*AMP:2*AMP*Math.abs(Math.cos(Math.PI*n));
  const wrapped=cls==='max'?0:cls==='min'?.5:((-n%1)+1)%1;
  return {delta:phi-waveK(lam)*dr,wrapped,amp,cls};
}
function ampOf(dr, lam, phi=0) { return phaseState(dr,lam,phi).amp; }
function classify(dr, lam, phi=0) { return phaseState(dr,lam,phi).cls; }
function fmtPhase(v) { return v.toFixed(3); }
function fmtAmp(v) { return v>0&&v<.005?v.toExponential(2):fmtNum(v); }
/* 包络线对应的 Δr（= r2 − r1）取值集合：加强线 kλ + φλ/2π，静线再偏半个 λ */
function envelopeLevels(lam, phi, maxDr) {
  const maxs = [], mins = [], f = (phi || 0) / (2 * Math.PI);
  for (let m = -10; m <= 10; m++) {
    const cMax = lam * (m + f), cMin = lam * (m + 0.5 + f);
    if (Math.abs(cMax) < maxDr) maxs.push(cMax);
    if (Math.abs(cMin) < maxDr) mins.push(cMin);
  }
  return { max: maxs, min: mins };
}
function fmtNum(v) {
  if (!isFinite(v)) return '∞';
  const r = Math.round(v * 100) / 100;
  const s = Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : r.toFixed(2);
  return s.replace('-', '−');
}
/* ================= PURE-END ================= */

const S = {
  s0: { lam: 2, px: 5, py: 0, t: 0, playing: true, visible: false, hist: [] },
  s1: { lam: 2, px: 0, py: 2.5, t: 0, playing: true, visible: false, hist: [] },
  s2: { lam: 2, px: 1.5, py: 1.5, env: true, t: 0, playing: true, visible: false },
  s3: { lam: 2, px: 0, py: 2.5, phi: 0, t: 0, playing: false, visible: false, hist: [] },
  s4: { lam: 2, picked: { q1: null, q2: null, q3: null }, locked: { q1: false, q2: false, q3: false } }
};
try {
  const q=history.state?.interferencePhase;
  if(q && [q.px,q.py,q.phi,q.t].every(Number.isFinite) && Math.abs(q.px)<=7.5 && Math.abs(q.py)<=4.5 && q.phi>=0 && q.phi<=2*Math.PI && q.t>=0 && q.t<1e9) {
    Object.assign(S.s3,{px:q.px,py:q.py,phi:q.phi,t:q.t,playing:false});
  }
}catch(_){}
function savePhaseReading(){try{const previous=history.state;history.replaceState({...((previous&&typeof previous==='object')?previous:{}),interferencePhase:{px:S.s3.px,py:S.s3.py,phi:S.s3.phi,t:S.s3.t}},'',location.href);}catch(_){}}
const QUIZ = { q1: 1, q2: 1, q3: 1 }; // 正确选项下标
function ro(id, text) { $(id).textContent = text; }
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '360';
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
/* 世界坐标（单位长度）→ 俯视图逻辑坐标：x∈[−8,8], y∈[−4.5,4.5] → 640×360 */
const UX = x => (x + 8) * 40, UY = y => (4.5 - y) * 40;

/* 圆纹视觉层：波峰圈（亮）半径满足 ωt − kr + φ = π/2 + 2πn，波谷圈（暗）偏半 λ */
function drawRings(ctx, sx, sy, lam, tt, phi, color) {
  const v = lam / PERIOD, shift = (phi || 0) * lam / (2 * Math.PI);
  const r0 = ((v * tt - lam / 4 + shift) % lam + lam) % lam;
  ctx.save();
  for (let r = r0; r < 12.2; r += lam) {
    if (r < 0.12) continue;
    ctx.beginPath(); ctx.arc(sx, sy, r * 40, 0, 2 * Math.PI);
    ctx.strokeStyle = color; ctx.globalAlpha = 0.75; ctx.lineWidth = 2; ctx.stroke();
  }
  for (let r = r0 + lam / 2; r < 12.2; r += lam) {
    if (r < 0.12) continue;
    ctx.beginPath(); ctx.arc(sx, sy, r * 40, 0, 2 * Math.PI);
    ctx.strokeStyle = color; ctx.globalAlpha = 0.28; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.restore();
}
/* 包络层：Δr = r2 − r1 = c 的点构成双曲线（焦点 = 两源）；c=0 为中垂线。
   加强线用黄绿色（与青色圆纹色相拉开）且更粗更亮，静线保持粉色虚线。 */
const ENV_MAX_COL = 'rgba(198,244,92,0.85)';
function drawHyperbola(ctx, c, color, dash, width) {
  ctx.save(); if (dash) ctx.setLineDash(dash);
  ctx.strokeStyle = color; ctx.lineWidth = width || 1.7;
  if (Math.abs(c) < 1e-9) { line(ctx, [UX(0), UY(-4.5)], [UX(0), UY(4.5)], color, width || 1.7); ctx.restore(); return; }
  const a = Math.abs(c) / 2, b = Math.sqrt(Math.max(DS * DS - a * a, 1e-6));
  const side = c > 0 ? -1 : 1; // r2 − r1 = c > 0 的点更靠近 S1（左侧）
  ctx.beginPath(); let started = false;
  for (let y = -4.5; y <= 4.501; y += 0.09) {
    const x = side * a * Math.sqrt(1 + (y * y) / (b * b));
    if (Math.abs(x) > 7.95) { started = false; continue; }
    const px = UX(x), py = UY(y);
    if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}
function drawEnvelope(ctx, lam, phi) {
  const lv = envelopeLevels(lam, phi, 2 * DS - 1e-6);
  lv.max.forEach(c => drawHyperbola(ctx, c, ENV_MAX_COL, null, 2.2));
  lv.min.forEach(c => drawHyperbola(ctx, c, 'rgba(255,122,147,0.6)', [6, 5]));
}
/* 俯视图：sources=[{x,y,phi,color,label}]；envPhi=null 不画包络；pY = P 当前合成位移（脉动半径用） */
function drawTop(cvId, o) {
  const ctx = scene(cvId, 640, 360);
  for (const s of o.sources) drawRings(ctx, UX(s.x), UY(s.y), o.lam, o.t, s.phi, s.color);
  if (o.envPhi !== null && o.envPhi !== undefined) drawEnvelope(ctx, o.lam, o.envPhi);
  for (const s of o.sources) {
    dot(ctx, UX(s.x), UY(s.y), s.color, 5);
    textC(ctx, s.label, UX(s.x), UY(s.y) - 16, s.color, 14);
  }
  if (o.P) {
    const cls = o.cls || 'mid';
    const col = cls === 'max' ? green : cls === 'min' ? pink : orange;
    const px = UX(o.P.x), py = UY(o.P.y);
    if (cls === 'min') {
      ctx.save(); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(px, py, 13, 0, 2 * Math.PI);
      ctx.strokeStyle = pink; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
      /* 「静」标记与 P 标签拉开：斜上 28/−18（原 24/−14 与 P 的 14/12 太挤）；近右缘镜像到左侧防裁切 */
      const mSide = px > 556 ? -1 : 1;
      textC(ctx, t('silentMark'), px + 28 * mSide, Math.max(12, py - 18), pink, 13);
    }
    dot(ctx, px, py, col, 6 + 2 * (o.pY || 0));
    textC(ctx, 'P', px + 15, py + 15, col, 14);
  }
  ctx.restore();
}
function pGeom(st, phi) {
  const r1 = dist(st.px, st.py, SRC1[0], SRC1[1]);
  const r2 = dist(st.px, st.py, SRC2[0], SRC2[1]);
  const signedDr=r2-r1,dr=Math.abs(signedDr),phase=phaseState(signedDr,st.lam,phi||0);
  return { r1,r2,dr,n:dr/st.lam,signedDr,signedN:signedDr/st.lam,...phase };
}
function clsSentence(cls) { return t(cls === 'max' ? 'clsMax' : cls === 'min' ? 'clsMin' : 'clsMid'); }
function clsWord(cls) { return t(cls === 'max' ? 'clsWordMax' : cls === 'min' ? 'clsWordMin' : 'clsWordMid'); }

/* ---------- 第 0 步 ---------- */
function render0() {
  const st = S.s0;
  const rP = dist(st.px, st.py, 0, 0);
  const yP = yAt(st.t, rP, st.lam, 0);
  drawTop('s0-canvas', {
    sources: [{ x: 0, y: 0, phi: 0, color: cyan, label: t('srcLab') }],
    lam: st.lam, t: st.t, P: { x: st.px, y: st.py }, pY: yP, cls: 'mid', envPhi: null
  });
  /* 侧面：左 = 波形剖面，右 = P 的位移—时间轨迹（历史实算采样） */
  const ctx = scene('s0-side', 640, 190);
  textL(ctx, t('profTitle'), 26, 14, muted, 12.5);
  textL(ctx, t('traceTitle'), 428, 14, muted, 12.5);
  line(ctx, [26, 100], [404, 100], '#2b3547', 1);
  ctx.beginPath();
  for (let r = 0; r <= 10.001; r += 0.1) {
    const x = 26 + r * 37.8, y = 100 - yAt(st.t, r, st.lam, 0) * 52;
    r === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = cyan; ctx.lineWidth = 2; ctx.stroke();
  /* λ 标尺：相邻两波峰之间 */
  const v = st.lam / PERIOD;
  let c1 = ((v * st.t - st.lam / 4) % st.lam + st.lam) % st.lam;
  if (c1 + st.lam <= 10) {
    const x1 = 26 + c1 * 37.8, x2 = 26 + (c1 + st.lam) * 37.8;
    line(ctx, [x1, 34], [x2, 34], orange, 1.6);
    line(ctx, [x1, 29], [x1, 39], orange, 1.6); line(ctx, [x2, 29], [x2, 39], orange, 1.6);
    textC(ctx, 'λ = ' + fmtNum(st.lam), (x1 + x2) / 2, 22, orange, 13);
  }
  if (rP <= 10) {
    const x = 26 + rP * 37.8;
    ctx.save(); ctx.setLineDash([4, 4]); line(ctx, [x, 44], [x, 168], orange, 1.2); ctx.restore();
    dot(ctx, x, 100 - yP * 52, orange, 5);
    textC(ctx, 'P', x, 182, orange, 12.5);
  }
  line(ctx, [428, 100], [618, 100], '#2b3547', 1);
  if (st.hist.length > 1) {
    ctx.beginPath();
    st.hist.forEach((s, i) => {
      const x = 618 - (st.t - s.t) * 23.75, y = 100 - s.y * 52;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = orange; ctx.lineWidth = 1.8; ctx.stroke();
  }
  ctx.restore();
}
function readout0() {
  const st = S.s0, rP = dist(st.px, st.py, 0, 0);
  ro('s0-readout', t('s0ro', { lam: fmtNum(st.lam), r: fmtNum(rP), y: fmtNum(yAt(st.t, rP, st.lam, 0)) }));
}

/* ---------- 第 1 / 3 步共用的时序三轨 ---------- */
function drawTraces(cvId, st) {
  const ctx = scene(cvId, 640, 190);
  const rows = [
    { key: 'a', label: t('y1Lab'), color: cyan, cy: 33 },
    { key: 'b', label: t('y2Lab'), color: orange, cy: 95 },
    { key: 's', label: t('sumLab'), color: green, cy: 157 }
  ];
  for (const row of rows) {
    textL(ctx, row.label, 8, row.cy, row.color, 12.5);
    line(ctx, [118, row.cy], [630, row.cy], '#2b3547', 1);
    if (st.hist.length > 1) {
      ctx.beginPath();
      st.hist.forEach((sm, i) => {
        const x = 630 - (st.t - sm.t) * 64, y = row.cy - sm[row.key] * (row.key === 's' ? 11 : 22);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = row.color; ctx.lineWidth = 1.8; ctx.stroke();
      if(cvId==='s3-trace'){const current=st.hist[st.hist.length-1];dot(ctx,630,row.cy-current[row.key]*(row.key==='s'?11:22),row.color,4);}
    }
  }
  ctx.restore();
}
function sampleHist(st, phi) {
  const g = pGeom(st, phi);
  st.hist.push({ t: st.t, a: yAt(st.t, g.r1, st.lam, 0), b: yAt(st.t, g.r2, st.lam, phi || 0), s: ySum(st.t, g.r1, g.r2, st.lam, phi || 0) });
  const span=st===S.s3?2*PERIOD:8.2;
  while (st.hist.length && st.t - st.hist[0].t > span) st.hist.shift();
}
/* 初载预填：按初始 P 的解析值把过去 8.2 秒的样本先算好，
   轨迹一打开就是完整的，不从空白慢慢长（样本与 tick 采样同源同式） */
function prefillHist() {
  for (const key of ['s0', 's1', 's3']) {
    const st = S[key], phi = key === 's3' ? st.phi : 0;
    const g = pGeom(st, phi), rP = dist(st.px, st.py, 0, 0);
    st.hist = [];
    for (let tt = -8.2; tt < -1e-9; tt += 0.05) {
      if (key === 's0') st.hist.push({ t: tt, y: yAt(tt, rP, st.lam, 0) });
      else st.hist.push({ t: tt, a: yAt(tt, g.r1, st.lam, 0), b: yAt(tt, g.r2, st.lam, phi), s: ySum(tt, g.r1, g.r2, st.lam, phi) });
    }
  }
}
/* Analytic prediction for the current parameters, not stored measurements. */
function refill3(){
  const st=S.s3,g=pGeom(st,st.phi);st.hist=[];
  for(let i=164;i>=0;i--){const tt=st.t-2*PERIOD*i/164;st.hist.push({t:tt,a:yAt(tt,g.r1,st.lam,0),b:yAt(tt,g.r2,st.lam,st.phi),s:ySum(tt,g.r1,g.r2,st.lam,st.phi)});}
}
function phaseEdit(phi){S.s3.phi=phi;S.s3.playing=false;refill3();render3();readout3();playLabels();}
function render1() {
  const st = S.s1, g = pGeom(st, 0);
  drawTop('s1-canvas', {
    sources: [
      { x: SRC1[0], y: SRC1[1], phi: 0, color: cyan, label: 'S₁' },
      { x: SRC2[0], y: SRC2[1], phi: 0, color: orange, label: 'S₂' }
    ],
    lam: st.lam, t: st.t, P: { x: st.px, y: st.py }, pY: ySum(st.t, g.r1, g.r2, st.lam, 0) / 2, cls: g.cls, envPhi: null
  });
  drawTraces('s1-trace', st);
}
function readout1() {
  const st = S.s1, g = pGeom(st, 0);
  ro('s1-readout', t('s1ro', { r1: fmtNum(g.r1), r2: fmtNum(g.r2), dr: fmtNum(g.dr), n: fmtNum(g.n), amp: fmtAmp(g.amp) }));
  ro('s1-cls', clsSentence(g.cls));
  $('s1-cls').style.color = g.cls === 'max' ? green : g.cls === 'min' ? pink : muted;
}

/* ---------- 第 2 步 ---------- */
function render2() {
  const st = S.s2, g = pGeom(st, 0);
  drawTop('s2-canvas', {
    sources: [
      { x: SRC1[0], y: SRC1[1], phi: 0, color: cyan, label: 'S₁' },
      { x: SRC2[0], y: SRC2[1], phi: 0, color: orange, label: 'S₂' }
    ],
    lam: st.lam, t: st.t, P: { x: st.px, y: st.py }, pY: ySum(st.t, g.r1, g.r2, st.lam, 0) / 2, cls: g.cls,
    envPhi: st.env ? 0 : null
  });
}
function readout2() {
  const st = S.s2, g = pGeom(st, 0);
  ro('s2-readout', t('s2ro', { dr: fmtNum(g.dr), n: fmtNum(g.n), lam: fmtNum(st.lam), amp: fmtAmp(g.amp) }));
  ro('s2-cls', clsSentence(g.cls));
  $('s2-cls').style.color = g.cls === 'max' ? green : g.cls === 'min' ? pink : muted;
}

/* ---------- 第 3 步 ---------- */
function render3() {
  const st = S.s3, g = pGeom(st, st.phi);
  drawTop('s3-canvas', {
    sources: [
      { x: SRC1[0], y: SRC1[1], phi: 0, color: cyan, label: 'S₁' },
      { x: SRC2[0], y: SRC2[1], phi: st.phi, color: orange, label: 'S₂' }
    ],
    lam: st.lam, t: st.t, P: { x: st.px, y: st.py }, pY: ySum(st.t, g.r1, g.r2, st.lam, st.phi) / 2, cls: g.cls,
    envPhi: st.phi
  });
  drawTraces('s3-trace', st);
}
function readout3() {
  const st=S.s3,g=pGeom(st,st.phi);
  ro('s3-readout',t('s3ro',{phi:fmtPhase(st.phi/Math.PI),d:fmtNum(g.signedDr),n:fmtNum(g.signedN),delta:fmtPhase(g.delta/Math.PI),amp:fmtAmp(g.amp)}));
  ro('s3-instant',t('s3instant',{time:fmtNum(st.t),x:fmtNum(st.px),y:fmtNum(st.py),a:fmtNum(yAt(st.t,g.r1,st.lam,0)),b:fmtNum(yAt(st.t,g.r2,st.lam,st.phi)),sum:fmtNum(ySum(st.t,g.r1,g.r2,st.lam,st.phi))}));
  ro('s3-cls',clsSentence(g.cls));$('s3-cls').style.color=g.cls==='max'?green:g.cls==='min'?pink:muted;
  $('s3-phase').value=st.phi/Math.PI;ro('s3-phase-value',fmtPhase(st.phi/Math.PI)+'π rad');
  for(const[id,v]of [['s3-phi0',0],['s3-phipi',Math.PI]]){const active=Math.abs(st.phi-v)<1e-12;$(id).setAttribute('aria-pressed',String(active));$(id).classList.toggle('active',active);}
  $('s3-play').setAttribute('aria-pressed',String(st.playing));
}

/* ---------- 第 4 步：自测 ---------- */
function render4() {
  const ctx = scene('s4-canvas', 640, 300);
  const uy = y => (3.75 - y) * 40;
  const lv = envelopeLevels(S.s4.lam, 0, 2 * DS - 1e-6);
  lv.max.forEach(c => drawHyperbolaQ(ctx, c, ENV_MAX_COL, null, uy, 2.2));
  lv.min.forEach(c => drawHyperbolaQ(ctx, c, 'rgba(255,122,147,0.6)', [6, 5], uy));
  dot(ctx, UX(SRC1[0]), uy(SRC1[1]), cyan, 5); textC(ctx, 'S₁', UX(SRC1[0]), uy(SRC1[1]) - 16, cyan, 14);
  dot(ctx, UX(SRC2[0]), uy(SRC2[1]), orange, 5); textC(ctx, 'S₂', UX(SRC2[0]), uy(SRC2[1]) - 16, orange, 14);
  const cls = classify(1, S.s4.lam, 0);
  const col = cls === 'max' ? green : cls === 'min' ? pink : orange;
  dot(ctx, UX(-0.5), uy(0), col, 7);
  textC(ctx, 'P', UX(-0.5) + 15, uy(0) + 15, col, 14);
  if (cls === 'min') textC(ctx, t('silentMark'), UX(-0.5) + 30, uy(0) - 18, pink, 13);
  ctx.restore();
}
/* s4 画布高 300：世界 y ∈ [−3.75, 3.75]，单独一份双曲线绘制（与 UY 口径区分） */
function drawHyperbolaQ(ctx, c, color, dash, uy, width) {
  ctx.save(); if (dash) ctx.setLineDash(dash);
  ctx.strokeStyle = color; ctx.lineWidth = width || 1.7;
  if (Math.abs(c) < 1e-9) { line(ctx, [UX(0), uy(-3.75)], [UX(0), uy(3.75)], color, width || 1.7); ctx.restore(); return; }
  const a = Math.abs(c) / 2, b = Math.sqrt(Math.max(DS * DS - a * a, 1e-6));
  const side = c > 0 ? -1 : 1;
  ctx.beginPath(); let started = false;
  for (let y = -3.75; y <= 3.751; y += 0.09) {
    const x = side * a * Math.sqrt(1 + (y * y) / (b * b));
    if (Math.abs(x) > 7.95) { started = false; continue; }
    const px = UX(x), py = uy(y);
    if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}
function readout4() {
  const lam = S.s4.lam, n = 1 / lam, cls = classify(1, lam, 0);
  ro('s4-q2demo', t('q2demo', { lam: fmtNum(lam), n: fmtNum(n), cls: clsWord(cls) }));
  for (const q of ['q1', 'q2', 'q3']) {
    const picked = S.s4.picked[q], locked = S.s4.locked[q];
    document.querySelectorAll(`[data-q="${q}"]`).forEach(b => {
      b.disabled = locked;
      b.setAttribute('aria-pressed', String(picked === Number(b.dataset.opt)));
    });
    ro('s4-' + q + '-ro', picked === null ? '' : t(picked === QUIZ[q] ? q + 'ok' : q + 'no'));
    $('s4-' + q + '-ro').style.color = picked === null ? muted : picked === QUIZ[q] ? green : pink;
  }
  const k = ['q1', 'q2', 'q3'].filter(q => S.s4.locked[q]).length;
  ro('s4-score', t('score', { k }));
}

/* ---------- 骨架 ---------- */
function badges() {
  for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'physics'], ['stageBadge', window.KNOWLEDGE_STAGES, 'senior']]) {
    const item = (arr || []).find(x => x.id === id);
    if (item) $(el).textContent = item.name[getLang()];
  }
}
function playLabels() {
  for (const key of ['s0', 's1', 's2', 's3']) $(key + '-play').textContent = t(S[key].playing ? 'pause' : 'play');
}
function renderStep(key) {
  if (key === 's0') render0(); else if (key === 's1') render1();
  else if (key === 's2') render2(); else if (key === 's3') render3();
}
function renderAll() {
  badges(); playLabels();
  render0(); render1(); render2(); render3(); render4();
  readout0(); readout1(); readout2(); readout3(); readout4();
}
function setP(key, x, y) {
  const st = S[key];
  const nx = clamp(Math.round(x * 10) / 10, -7.5, 7.5);
  const ny = clamp(Math.round(y * 10) / 10, -4.5, 4.5);
  /* P 位置跳变（预设钮 / 滑杆 / 拖拽落点突变）：旧位置的时序样本与新读数不是同一回事，
     清空该步 hist，轨迹从当前时刻重新累积（与第 3 步切 φ 清 hist 的既有做法一致） */
  if ((nx !== st.px || ny !== st.py) && st.hist) st.hist = [];
  st.px = nx; st.py = ny;
  $(key + '-px').value = st.px; $(key + '-py').value = st.py;
  if(key==='s3'){st.playing=false;refill3();readout3();playLabels();}
  renderStep(key);
}
function drag(id, fn) {
  const cv = $(id); cv.classList.add('dragc'); let pointer = null;
  function move(e) {
    if (e.pointerId !== pointer) return;
    const r = cv.getBoundingClientRect(), v = cv._view;
    fn((e.clientX - r.left - v.ox) / v.scale, (e.clientY - r.top - v.oy) / v.scale);
  }
  cv.addEventListener('pointerdown', e => { pointer = e.pointerId; cv.setPointerCapture(pointer); move(e); });
  cv.addEventListener('pointermove', move);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(type, () => { pointer=null;if(id==='s3-canvas')savePhaseReading(); });
}
function bind() {
  $('s0-lam').oninput = e => { S.s0.lam = Number(e.target.value); S.s0.hist = []; render0(); readout0(); };
  $('s2-lam').oninput = e => { S.s2.lam = Number(e.target.value); render2(); readout2(); };
  for (const key of ['s0', 's1', 's2', 's3']) {
    $(key + '-px').oninput = e => setP(key, Number(e.target.value), S[key].py);
    $(key + '-py').oninput = e => setP(key, S[key].px, Number(e.target.value));
    $(key + '-play').onclick = () => { S[key].playing = !S[key].playing; playLabels(); if(key==='s3'){readout3();savePhaseReading();} };
    drag(key + '-canvas', (lx, ly) => setP(key, lx / 40 - 8, 4.5 - ly / 40));
  }
  $('s1-max').onclick = () => setP('s1', 0, 2.5);
  $('s1-min').onclick = () => setP('s1', -0.5, 0);
  $('s2-env').onchange = e => { S.s2.env = e.target.checked; render2(); };
  $('s3-phi0').onclick=()=>{phaseEdit(0);savePhaseReading();};
  $('s3-phipi').onclick=()=>{phaseEdit(Math.PI);savePhaseReading();};
  $('s3-phase').oninput=e=>phaseEdit(Number(e.target.value)*Math.PI);
  $('s3-reset').onclick=()=>{Object.assign(S.s3,{lam:2,px:0,py:2.5,phi:0,t:0,playing:false});$('s3-px').value=0;$('s3-py').value=2.5;phaseEdit(0);savePhaseReading();};
  for(const id of ['s3-phase','s3-px','s3-py'])$(id).addEventListener('change',savePhaseReading);
  $('s3-px').value=S.s3.px;$('s3-py').value=S.s3.py;
  document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
    const q = b.dataset.q;
    if (S.s4.locked[q]) return;
    S.s4.picked[q] = Number(b.dataset.opt);
    if (S.s4.picked[q] === QUIZ[q]) S.s4.locked[q] = true;
    readout4();
  });
  $('s4-lamtoggle').onclick = () => { S.s4.lam = S.s4.lam === 2 ? 1 : 2; render4(); readout4(); };
  $('s4-reset').onclick = () => {
    S.s4 = { lam: 2, picked: { q1: null, q2: null, q3: null }, locked: { q1: false, q2: false, q3: false } };
    render4(); readout4();
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
/* 动画主循环：每步独立时钟；历史采样在 tick 中（与可见性无关），渲染只画可见步 */
let lastTs = 0, lastRO = 0;
function tick(ts) {
  const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0; lastTs = ts;
  for (const key of ['s0', 's1', 's2', 's3']) {
    const st = S[key];
    if (st.playing && dt > 0) {
      st.t += dt;
      if (key === 's0') {
        st.hist.push({ t: st.t, y: yAt(st.t, dist(st.px, st.py, 0, 0), st.lam, 0) });
        while (st.hist.length && st.t - st.hist[0].t > 8.2) st.hist.shift();
      } else if (key === 's1') sampleHist(st, 0);
      else if (key === 's3') sampleHist(st, st.phi);
    }
    if (st.visible) renderStep(key);
  }
  if (ts - lastRO > 220) {
    lastRO = ts;
    if (S.s0.visible) readout0();
    if (S.s1.visible) readout1();
    if (S.s2.visible) readout2();
    if (S.s3.visible) readout3();
  }
  requestAnimationFrame(tick);
}
function pausePhaseReading(){S.s3.playing=false;playLabels();savePhaseReading();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pausePhaseReading();});window.addEventListener('pagehide',pausePhaseReading);
onLangRefresh(renderAll); bind(); applyLang(getLang());
prefillHist();refill3();render3();readout3();
requestAnimationFrame(tick);
// Read-only inspection surface for numerical review; UI remains the mutation path.
window.INTERFERENCE = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  yAt, ySum, ampOf, classify, phaseState, envelopeLevels, pGeom, fmtNum, fmtAmp
};
