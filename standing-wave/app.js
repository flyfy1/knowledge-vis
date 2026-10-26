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
// Spatial sign and amplitude share one floating-point-scale classification.
function spatialInfo(x,lam){
  if(![x,lam].every(Number.isFinite)||lam<=0)throw new RangeError('Invalid spatial point');
  const u=2*x/lam,h=Math.round(2*u),tol=32*Number.EPSILON*Math.max(1,Math.abs(2*u));
  let coefficient=2*AMP*Math.cos(Math.PI*u),kind='mid';
  if(Math.abs(2*u-h)<=tol){
    if(Math.abs(h%2)===1){coefficient=0;kind='node';}
    else{coefficient=(Math.abs((h/2)%2)===1?-2:2)*AMP;kind='anti';}
  }
  return{coefficient,amplitude:Math.abs(coefficient),kind,phase:kind==='node'?null:coefficient<0?Math.PI:0};
}
function ampRope(x, lam) { return spatialInfo(x,lam).amplitude; }
function classifyPt(x, lam) { return spatialInfo(x,lam).kind; }
/* 弦：入射 + 固定端反射（相位翻转 π → 取负） */
function yInc(tt, x, lam) { return AMP * Math.sin(omega() * tt - waveK(lam) * x); }
function yRefl(tt, x, lam) { return -AMP * Math.sin(omega() * tt + waveK(lam) * x); }
function yStr(tt, x, lam) { return yInc(tt, x, lam) + yRefl(tt, x, lam); }
function ampStr(x, lam) { return 2 * AMP * Math.abs(Math.sin(waveK(lam) * x)); }
/* Strict boundary compatibility; no physical near-mode acceptance band.
   Optional candidate range is UI reachability, not the mode condition. */
function modeQ(L, lam) { return L / (lam / 2); }
function modeInfo(L,lam,lo=2,hi=14){
  if(![L,lam,lo,hi].every(Number.isFinite)||L<=0||lam<=0||lo<=0||hi<lo)throw new RangeError('Invalid boundary candidate');
  const q=modeQ(L,lam),integer=Math.round(q),tolerance=32*Number.EPSILON*Math.max(1,Math.abs(q));
  const mode=integer>=1&&Math.abs(q-integer)<=tolerance?integer:0;
  const first=Math.max(1,Math.ceil(2*L/hi-tolerance)),last=Math.floor(2*L/lo+tolerance);
  let candidate=null;
  if(last>=first){
    const clampN=n=>Math.max(first,Math.min(last,n));
    const ns=[...new Set([first,last,clampN(Math.floor(q)),clampN(Math.ceil(q))])].sort((a,b)=>a-b);
    for(const n of ns){const wavelength=2*L/n,distance=Math.abs(wavelength-lam);
      if(!candidate||distance<candidate.distance-32*Number.EPSILON*Math.max(1,L,lam))candidate={n,wavelength,distance,deviation:Math.abs(q-n)};
    }
  }
  return{q,mode,tolerance,candidate,endpointAmplitude:mode?0:ampStr(L,lam)};
}
function modeN(L, lam) { return modeInfo(L,lam).mode; }
function fmtBoundary(v){return v===0?'0':Math.abs(v)<1e-5?v.toExponential(3):Number(v.toPrecision(9)).toString().replace('-', '−');}
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
  s1: { lam: 2, px: 1, env: true, t: 0, playing: false, visible: false, hist: [] },
  s2: { L: 6, lam: 4, t: 0, playing: false, visible: false },
  s3: { n: 1, cmp: false, t: 0, playing: true, visible: false },
  s4: { f: 0.25, t: 0, playing: true, visible: false },
  s5: { picked: { q1: null, q2: null, q3: null, q4: null }, locked: { q1: false, q2: false, q3: false, q4: false } }
};
try{const q=history.state?.standingBoundary;if(q&&[q.L,q.lam,q.t].every(Number.isFinite)&&q.L>=3&&q.L<=8&&Math.abs(q.L*10-Math.round(q.L*10))<1e-9&&q.lam>=2&&q.lam<=14&&q.t>=0&&q.t<1e9)Object.assign(S.s2,{L:q.L,lam:q.lam,t:q.t,playing:false});}catch(_){}
function saveBoundaryReading(){try{const h=history.state;history.replaceState({...((h&&typeof h==='object')?h:{}),standingBoundary:{L:S.s2.L,lam:S.s2.lam,t:S.s2.t}},'',location.href);}catch(_){}}
try{const q=history.state?.standingPhase;if(q&&[q.lam,q.px,q.t].every(Number.isFinite)&&q.lam>=1.2&&q.lam<=3&&Math.abs(q.lam*10-Math.round(q.lam*10))<1e-9&&q.px>=-4&&q.px<=4&&typeof q.env==='boolean'&&q.t>=0&&q.t<1e9)Object.assign(S.s1,{lam:q.lam,px:q.px,env:q.env,t:q.t,playing:false});}catch(_){}
function savePhaseReading(){try{const h=history.state;const{lam,px,env,t}=S.s1;history.replaceState({...((h&&typeof h==='object')?h:{}),standingPhase:{lam,px,env,t}},'',location.href);}catch(_){}}
function phaseEdit(){S.s1.playing=false;playLabels();render1();readout1();}
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
  if(!opts.reference)textC(ctx, 'x', RX(st.px), 292, muted, 12);
  if(opts.reference){
    const yQ=ySumRope(st.t,0,st.lam);
    ctx.save();ctx.setLineDash([7,5]);line(ctx,[RX(0),55],[RX(0),282],cyan,1.3);ctx.restore();
    ctx.beginPath();ctx.arc(RX(0),RY(yQ),8,0,2*Math.PI);ctx.strokeStyle=cyan;ctx.lineWidth=2;ctx.stroke();
    textC(ctx,'Q',RX(0)-16,RY(yQ)-15,cyan,14);
  }
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
// Same axes and same clock; prediction for CURRENT parameters, not recorded data.
function drawPhaseTrace(st){
  const ctx=scene('s1-trace',640,220),X=tt=>40+(tt-(st.t-2*PERIOD))/(2*PERIOD)*578,Y=y=>115-y*37.5;
  textL(ctx,t('phaseTrace'),40,14,muted,12.5);
  for(const v of [-2,0,2]){line(ctx,[40,Y(v)],[618,Y(v)],lineCol,1);textL(ctx,v+'A',4,Y(v),muted,11);}
  ctx.save();ctx.beginPath();ctx.rect(40,36,580,157);ctx.clip();
  for(const ref of [true,false]){
    ctx.setLineDash(ref?[7,5]:[]);ctx.beginPath();
    st.hist.forEach((q,i)=>{const yy=ref?ySumRope(q.t,0,st.lam):q.y;i?ctx.lineTo(X(q.t),Y(yy)):ctx.moveTo(X(q.t),Y(yy));});
    ctx.strokeStyle=ref?cyan:orange;ctx.lineWidth=ref?2:2.5;ctx.stroke();
  }ctx.restore();
  ctx.beginPath();ctx.arc(618,Y(ySumRope(st.t,0,st.lam)),6,0,2*Math.PI);ctx.strokeStyle=cyan;ctx.lineWidth=2;ctx.stroke();dot(ctx,618,Y(ySumRope(st.t,st.px,st.lam)),orange,3);
  textL(ctx,t('phasePast'),40,207,muted,11);textC(ctx,t('phaseNow'),600,207,muted,11);ctx.restore();
}
function prefillHist(key) {
  const st = S[key];
  st.hist = [];
  if(key==='s1'){for(let i=0;i<=160;i++){const tt=st.t-2*PERIOD+i*(2*PERIOD/160);st.hist.push({t:tt,y:ySumRope(tt,st.px,st.lam)});}return;}
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
  drawRope('s1-canvas', st, { view: 'sum', marker: false, env: st.env, marks: true, reference:true });
  drawPhaseTrace(st);
}
function readout1() {
  const st=S.s1,info=spatialInfo(st.px,st.lam),cls=info.kind;
  ro('s1-readout',t('s1ro',{x:fmtBoundary(st.px),xr:fmtBoundary(st.px/st.lam),amp:fmtBoundary(info.amplitude),meas:fmtBoundary(measuredAmp('s1'))}));
  ro('s1-cls',t(cls==='node'?'clsNode':cls==='anti'?'clsAnti':'clsGen',{amp:fmtBoundary(info.amplitude)}));
  $('s1-cls').style.color=cls==='node'?pink:cls==='anti'?green:muted;
  ro('s1-phase',t(info.phase===null?'phaseNode':info.phase===0?'phaseSame':'phaseOpposite',{c:fmtBoundary(info.coefficient)}));
  ro('s1-now',t('phaseValues',{time:fmtBoundary(st.t),p:fmtBoundary(ySumRope(st.t,st.px,st.lam)),q:fmtBoundary(ySumRope(st.t,0,st.lam))}));
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
function currentBoundary(){const e=$('s2-lam');return modeInfo(S.s2.L,S.s2.lam,Number(e.min),Number(e.max));}
function render2() {
  const st=S.s2,info=currentBoundary(),cy=160,Y=y=>cy-y*48,ctx=scene('s2-canvas',640,300),ok=info.mode>0;
  line(ctx,[SX(0),Y(0)],[SX(st.L),Y(0)],lineCol,1);
  drawWalls(ctx,st.L,cy,105);
  ctx.save();ctx.setLineDash([6,5]);
  plotFn(ctx,x=>ampStr(x,st.lam),0,st.L,.03,SX,Y,'rgba(126,226,168,0.7)',1.5);
  plotFn(ctx,x=>-ampStr(x,st.lam),0,st.L,.03,SX,Y,'rgba(126,226,168,0.7)',1.5);ctx.restore();
  ctx.save();ctx.setLineDash(ok?[]:[4,4]);plotFn(ctx,x=>yStr(st.t,x,st.lam),0,st.L,.03,SX,Y,ok?green:cyan,2.8);ctx.restore();
  if(ok)for(let m=1;m<info.mode;m++)dot(ctx,SX(m*st.L/info.mode),Y(0),green,4);
  dot(ctx,SX(0),Y(0),white,5);dot(ctx,SX(st.L),Y(0),white,5);
  if(!ok){const end=info.endpointAmplitude,instant=yStr(st.t,st.L,st.lam);
    ctx.save();ctx.setLineDash([4,4]);line(ctx,[SX(st.L),Y(-end)],[SX(st.L),Y(end)],pink,2);ctx.restore();
    ctx.beginPath();ctx.arc(SX(st.L),Y(instant),7,0,2*Math.PI);ctx.strokeStyle=pink;ctx.lineWidth=2;ctx.stroke();
    textC(ctx,'±'+fmtBoundary(end)+'A',Math.min(580,SX(st.L)+8),Y(end)-18,pink,12.5);
  }else dot(ctx,SX(st.L),Y(0),green,5);
  textC(ctx,'0',SX(0),288,muted,12);textC(ctx,'L',SX(st.L),288,muted,12);ctx.restore();
}
function readout2(){
  const st=S.s2,info=currentBoundary(),c=info.candidate;
  ro('s2-readout',t('s2ro',{L:fmtBoundary(st.L),lam:fmtBoundary(st.lam),q:fmtBoundary(info.q),n:c.n,lamn:fmtBoundary(c.wavelength),dev:fmtBoundary(c.deviation)}));
  ro('s2-state',t(info.mode?'modeOk':'modeNo',{n:info.mode,lamn:fmtBoundary(info.mode?lamN(st.L,info.mode):c.wavelength),end:fmtBoundary(info.endpointAmplitude)}));
  ro('s2-endpoint',t('boundaryEndpoint',{time:fmtBoundary(st.t),instant:fmtBoundary(info.mode?0:yStr(st.t,st.L,st.lam)),end:fmtBoundary(info.endpointAmplitude)}));
  $('s2-state').style.color=info.mode?green:pink;$('s2-play').setAttribute('aria-pressed',String(st.playing));
  const label='λ ≈ '+fmtBoundary(st.lam);if($('s2-lam-value').textContent!==label)$('s2-lam-value').textContent=label;
}
function boundaryEdit(){S.s2.playing=false;render2();readout2();playLabels();}

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
  const nx = clamp(key==='s1'?x:Math.round(x * 20) / 20, -4, 4);
  if (nx !== st.px) { st.px = nx; prefillHist(key); }
  $(key + '-px').value = st.px;
  if(key==='s1')phaseEdit();else renderStep(key);
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
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(type, () => {if(pointer!==null&&key==='s1')savePhaseReading();pointer=null;});
}
function bind() {
  for (const key of ['s0', 's1']) {
    $(key + '-lam').oninput = e => { S[key].lam = Number(e.target.value); prefillHist(key); if(key==='s1')phaseEdit();else renderStep(key); };
    $(key + '-px').oninput = e => setP(key, Number(e.target.value));
    $(key + '-play').onclick = () => { S[key].playing = !S[key].playing; playLabels();if(key==='s1'){readout1();savePhaseReading();} };
    drag(key + '-canvas', key);
  }
  for (const v of ['sum', 'right', 'left']) $('s0-v' + v).onclick = () => { S.s0.view = v; render0(); };
  $('s1-lam').value=S.s1.lam;$('s1-px').value=S.s1.px;$('s1-env').checked=S.s1.env;
  $('s1-env').onchange=e=>{S.s1.env=e.target.checked;phaseEdit();savePhaseReading();};
  for(const[id,ratio]of [['node',.25],['anti',0],['same',.125],['opposite',.5]])$('s1-'+id).onclick=()=>{setP('s1',S.s1.lam*ratio);savePhaseReading();};
  $('s1-reset').onclick=()=>{Object.assign(S.s1,{lam:2,px:1,env:true,t:0,playing:false});$('s1-lam').value=2;$('s1-px').value=1;$('s1-env').checked=true;prefillHist('s1');phaseEdit();savePhaseReading();};
  $('s1-px').addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    const offsets={ArrowRight:.05,ArrowUp:.05,ArrowLeft:-.05,ArrowDown:-.05,PageUp:.5,PageDown:-.5};
    if(!(e.key in offsets)&&!['Home','End'].includes(e.key))return;
    e.preventDefault();setP('s1',e.key==='Home'?-4:e.key==='End'?4:S.s1.px+offsets[e.key]);
  });
  $('s1-px').addEventListener('keyup',e=>{if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))savePhaseReading();});
  for(const id of ['s1-px','s1-lam'])$(id).addEventListener('change',savePhaseReading);
  $('s2-len').value=S.s2.L;$('s2-lam').value=S.s2.lam;
  $('s2-len').oninput=e=>{S.s2.L=Number(e.target.value);boundaryEdit();};
  $('s2-lam').oninput=e=>{S.s2.lam=Number(e.target.value);boundaryEdit();};
  $('s2-lam').addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    const offsets={ArrowRight:.05,ArrowUp:.05,ArrowLeft:-.05,ArrowDown:-.05,PageUp:.5,PageDown:-.5};
    if(!(e.key in offsets)&&!['Home','End'].includes(e.key))return;
    e.preventDefault();const el=e.currentTarget;
    el.value=e.key==='Home'?el.min:e.key==='End'?el.max:clamp(Number(el.value)+offsets[e.key],Number(el.min),Number(el.max));
    el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  $('s2-lam').addEventListener('keyup',e=>{if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))saveBoundaryReading();});
  for(const id of ['s2-len','s2-lam'])$(id).addEventListener('change',saveBoundaryReading);
  $('s2-snap').onclick=()=>{const c=currentBoundary().candidate;S.s2.lam=c.wavelength;$('s2-lam').value=S.s2.lam;boundaryEdit();saveBoundaryReading();};
  $('s2-near').onclick=()=>{Object.assign(S.s2,{L:6,lam:6.05});$('s2-len').value=6;$('s2-lam').value=6.05;boundaryEdit();saveBoundaryReading();};
  $('s2-reset').onclick=()=>{Object.assign(S.s2,{L:6,lam:4,t:0});$('s2-len').value=6;$('s2-lam').value=4;boundaryEdit();saveBoundaryReading();};
  $('s2-play').onclick=()=>{S.s2.playing=!S.s2.playing;readout2();playLabels();saveBoundaryReading();};
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
        while (st.hist.length && st.t - st.hist[0].t > (key==='s1'?2*PERIOD:8.2)) st.hist.shift();
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
function pausePhase(){S.s1.playing=false;playLabels();savePhaseReading();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pausePhase();});window.addEventListener('pagehide',pausePhase);
function pauseBoundary(){S.s2.playing=false;playLabels();saveBoundaryReading();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseBoundary();});window.addEventListener('pagehide',pauseBoundary);
onLangRefresh(renderAll); bind(); applyLang(getLang());
prefillHist('s0'); prefillHist('s1');
requestAnimationFrame(tick);
// Read-only inspection surface for numerical review; UI remains the mutation path.
window.STANDING = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  yRight, yLeft, ySumRope, yAnalytic, ampRope, classifyPt, spatialInfo,
  yInc, yRefl, yStr, ampStr, modeQ, modeN, modeInfo, fmtBoundary, lamN, fN, f1, modeShape, respAmp, fmtNum
};
