'use strict';
/* 凸透镜成像 · 蜡烛远近，像变样 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 成像几何只由透镜公式纯函数 imageOf 给出：1/v = 1/f − 1/u（带符号），
      像高 = −(v/u)·物高；读数、画布上的像、三条光线共用这一个来源。
   2. 三条特殊光线的折射段由 rayLines 给出（线 1 过远侧焦点、线 2 过光心、
      线 3 出射平行），三线交点与公式像点在数据坐标里恒重合（自查断言），
      线性映射到像素后偏差 ≤2px（浏览器实测断言）。
   3. 数值显示口径全页统一：fmtNum——两小数内精确则原样（整数优先），
      否则 ≈ + 六位有效数字；负号一律 U+2212。
   对账入口：window.LENS（imageOf / zoneOf / rayLines / intersect / geom / state）。 */
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ================= PURE-BEGIN ================= */
/* 透镜公式：f 焦距、u 物距（>0）、h 物高。
   约定：v>0 实像在透镜另一侧；v<0 虚像与物同侧（|v| 处）；
   像高 imgH = −(v/u)·h（实像为负=倒立，虚像为正=正立）。 */
function imageOf(f, u, h) {
  h = h === undefined ? 1 : h;
  const invalid={type:'invalid',v:null,m:null,mAbs:null,magnification:null,imgH:null};
  if (![f,u,h].every(Number.isFinite)||f<=0||u<=0) return invalid;
  if (u===f) return {type:'inf',v:Infinity,m:Infinity,mAbs:Infinity,magnification:null,imgH:null};
  const v=(f/(u-f))*u, m=v/u, magnification=-m, imgH=magnification*h;
  if (![v,m,imgH].every(Number.isFinite)) return invalid;
  return {type:v>0?'real':'virtual',v,m,mAbs:Math.abs(m),magnification,imgH};
}
/* Boundary labels use unrounded distances,not an angular/distance tolerance band. */
function zoneOf(f,u){
  if(!Number.isFinite(f)||!Number.isFinite(u)||f<=0||u<=0)return 'invalid';
  if(u===f)return 'eqf';if(u<f)return 'ltf';if(u===2*f)return 'eq2f';return u>2*f?'gt2f':'mid';
}
/* 三条特殊光线在透镜平面（x=0）右侧的折射线：{p:[x,y], d:[dx,dy]}（数据坐标，x 向右、y 向上，单位同 f/u/h）
   r1：从 (0,h) 出发、穿过远侧焦点 (f,0)；r2：从 (0,0) 出发、沿物点→光心方向直行；
   r3：从 (0,h3) 水平出射，h3 = h·f/(f−u)（u=f 时不存在，返回 null）。 */
function rayLines(f, u, h) {
  if (![f,u,h].every(Number.isFinite)||f<=0||u<=0)return {r1:null,r2:null,r3:null};
  return {
    r1: { p: [0, h], d: [f, -h] },
    r2: { p: [0, 0], d: [u, -h] },
    r3: (u === f) ? null : { p: [0, h * f / (f - u)], d: [1, 0] }
  };
}
/* 两条直线（点+方向）的交点；平行返回 null */
function lineIntersect(L1, L2) {
  const den = L1.d[0] * L2.d[1] - L1.d[1] * L2.d[0];
  if (den === 0) return null;
  const dx = L2.p[0] - L1.p[0], dy = L2.p[1] - L1.p[1];
  const s = (dx * L2.d[1] - dy * L2.d[0]) / den;
  return [L1.p[0] + L1.d[0] * s, L1.p[1] + L1.d[1] * s];
}
/* 数值显示：两小数内精确 → 原样（整数优先、0.5/1.25 这类精确小数不带 ≈）；
   否则 ≈ + 六位有效数字。负号统一 U+2212。 */
function fmtNum(x){
  if(x===Infinity)return '∞';if(x===-Infinity)return '−∞';if(!Number.isFinite(x))return '—';
  const exact=Math.round(x*100)/100;
  if(x===exact)return String(Object.is(x,-0)?0:x).replace(/-/g,'−');
  const rounded=Number(x.toPrecision(6));
  return ('≈'+rounded).replace(/-/g,'−');
}
/* ================= PURE-END ================= */

const F2 = 60;               /* 第 1–4 步共用焦距 */
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';

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
function regCanvas(id) { const cv = $(id); if (!allCanvases.includes(cv)) allCanvases.push(cv); return cv; }
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

/* ---------- 视图与绘图原语 ---------- */
const VIEWS = {};
function makeView(cv, lensXFrac, div) {
  const w = cv._w, h = cv._h;
  const vw = {
    w: w, h: h,
    ppu: clamp(w / (div || 620), 0.6, 1.9),
    lensX: Math.round(w * lensXFrac),
    axisY: Math.round(h * 0.54)
  };
  if(['s1-canvas','s2-canvas'].includes(cv.id))vw.ppu=Math.min(vw.ppu,(vw.lensX-12)/215);
  vw.X = d => vw.lensX + d * vw.ppu;
  vw.Y = g => vw.axisY - g * vw.ppu;
  vw.xMax = (w - 6 - vw.lensX) / vw.ppu;
  vw.xMin = (6 - vw.lensX) / vw.ppu;
  VIEWS[cv.id] = vw;
  return vw;
}
function line(ctx, x1, y1, x2, y2, color, width, dash) {
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width || 1.6;
  ctx.setLineDash(dash || []);
  ctx.stroke();
  ctx.setLineDash([]);
}
function txt(ctx, str, x, y, color, align, size) {
  ctx.font = (size || 12.5) + 'px system-ui, sans-serif';
  ctx.fillStyle = color || muted;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
  ctx.textBaseline = 'alphabetic';
}
function dot(ctx, x, y, color, r) {
  ctx.beginPath(); ctx.arc(x, y, r || 4, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
}
function lensHalfPx(vw) { return Math.min(vw.axisY - 12, vw.h - vw.axisY - 12, 132); }
function drawLens(ctx, vw) {
  const x = vw.lensX, half = lensHalfPx(vw);
  const y0 = vw.axisY - half, y1 = vw.axisY + half;
  ctx.beginPath();
  ctx.ellipse(x, vw.axisY, 7, half, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(110,231,255,.07)';
  ctx.fill();
  line(ctx, x, y0, x, y1, 'rgba(110,231,255,.9)', 2.4);
  ctx.fillStyle = 'rgba(110,231,255,.9)';
  ctx.beginPath(); ctx.moveTo(x, y0 - 2); ctx.lineTo(x - 6, y0 + 11); ctx.lineTo(x + 6, y0 + 11); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y1 + 2); ctx.lineTo(x - 6, y1 - 11); ctx.lineTo(x + 6, y1 - 11); ctx.closePath(); ctx.fill();
}
/* 主光轴 + 两侧 F/2F 刻度（2F 超出画面则不画）；窄幅（<520）时标签字号收小、贴轴更近，避免透镜附近拥挤 */
function drawAxis(ctx, vw, f, axisLabel) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, vw.w, vw.h); ctx.clip();
  line(ctx, 2, vw.axisY, vw.w - 2, vw.axisY, 'rgba(154,167,184,.55)', 1.2, [7, 6]);
  const compact = vw.w < 520;
  const tickSize = compact ? 10 : 11.5, tickDy = compact ? 15 : 17;
  [-1, 1].forEach(s => {
    [[f, 'F'], [2 * f, '2F']].forEach(([d, lab]) => {
      const x = vw.X(s * d);
      if (x < 6 || x > vw.w - 6) return;
      line(ctx, x, vw.axisY - 5, x, vw.axisY + 5, muted, 1.4);
      txt(ctx, lab, x, vw.axisY + tickDy, muted, 'center', tickSize);
    });
  });
  txt(ctx, 'O', vw.lensX, vw.axisY + tickDy, muted, 'center', tickSize);
  if (axisLabel) txt(ctx, axisLabel, 8, vw.axisY - 13, muted, 'left', compact ? 11 : 12);
  ctx.restore();
}
function flame(ctx, x, yBase, yTip, color) {
  const dir = Math.sign(yBase - yTip) || 1;
  const hgt = Math.abs(yTip - yBase), wdt = Math.max(4.5, hgt * 0.36);
  ctx.beginPath();
  ctx.moveTo(x - wdt / 2, yBase);
  ctx.quadraticCurveTo(x - wdt / 2, yBase - dir * hgt * 0.5, x, yTip);
  ctx.quadraticCurveTo(x + wdt / 2, yBase - dir * hgt * 0.5, x + wdt / 2, yBase);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}
/* 蜡烛：hPx 为带符号像素高（正=正立、负=倒立）；dashed=虚像（只描边） */
function drawCandle(ctx, x, baseY, hPx, flameColor, dashed) {
  const bodyH = hPx * 0.52;
  ctx.save();
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.rect(x - 3.5, Math.min(baseY, baseY - bodyH), 7, Math.abs(bodyH));
  if (dashed) { ctx.strokeStyle = flameColor; ctx.lineWidth = 1.5; ctx.stroke(); }
  else { ctx.fillStyle = 'rgba(232,220,196,.92)'; ctx.fill(); }
  ctx.restore();
  if (dashed) {
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = flameColor; ctx.lineWidth = 1.5;
    const dir = Math.sign(hPx) || 1, yB = baseY - bodyH, yT = baseY - hPx;
    const hgt = Math.abs(yT - yB), wdt = Math.max(4.5, hgt * 0.36);
    ctx.beginPath();
    ctx.moveTo(x - wdt / 2, yB);
    ctx.quadraticCurveTo(x - wdt / 2, yB - dir * hgt * 0.5, x, yT);
    ctx.quadraticCurveTo(x + wdt / 2, yB - dir * hgt * 0.5, x + wdt / 2, yB);
    ctx.closePath(); ctx.stroke();
    ctx.restore();
  } else {
    flame(ctx, x, baseY - bodyH, baseY - hPx, flameColor);
  }
  dot(ctx, x, baseY, dashed ? flameColor : '#e8dcc4', 2.2);
}
/* 一条线段（数据坐标） */
function seg(ctx, vw, a, b, color, width, dash) {
  line(ctx, vw.X(a[0]), vw.Y(a[1]), vw.X(b[0]), vw.Y(b[1]), color, width, dash);
}
/* 沿直线 L 到 x=xEnd 的点 */
function atX(L, xEnd) {
  const s = (xEnd - L.p[0]) / L.d[0];
  return [xEnd, L.p[1] + L.d[1] * s];
}

/* 核心光路：物点 P=(−u,h) 的三条特殊光线 + 像。
   opts: {rays:{r1,r2,r3}, rayColor, showImageCandle, objH(蜡烛物高,单位), tagFar} */
function drawOptics(ctx, vw, f, u, h, opts) {
  const img = imageOf(f, u, h);
  if(img.type==='invalid')return img;
  const rl = rayLines(f, u, h);
  const R = {...(opts.rays||{r1:true,r2:true,r3:true})};
  R.r3=!!R.r3&&!!rl.r3&&vw.Y(rl.r3.p[1])>=6&&vw.Y(rl.r3.p[1])<=vw.h-6;

  const rayCol = opts.rayColor || cyan;
  const P = [-u, h];
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, vw.w, vw.h); ctx.clip();
  /* 入射段 */
  if (R.r1) seg(ctx, vw, P, [0, h], rayCol, 1.8);
  if (R.r3 && rl.r3) {
    seg(ctx, vw, [-f, 0], P, 'rgba(110,231,255,.45)', 1.2, [4, 4]);   /* 过近侧 F 的来路（虚线示意） */
    seg(ctx, vw, P, rl.r3.p, rayCol, 1.8);
  }
  if (img.type === 'inf') {
    /* 折射光线互相平行（沿物点→光心方向） */
    const dirL = { p: [0, 0], d: [u, -h] };
    if (R.r2) seg(ctx, vw, P, atX(dirL, vw.xMax), rayCol, 1.8);
    if (R.r1) { const L1 = { p: [0, h], d: [u, -h] }; seg(ctx, vw, [0, h], atX(L1, vw.xMax), rayCol, 1.8); }
    // At u=f the third special ray has no finite lens-plane intercept; omit it.
  } else {
    const xEnd = img.type === 'real' ? Math.min(vw.xMax, img.v + 30) : vw.xMax;
    if (R.r1) seg(ctx, vw, rl.r1.p, atX(rl.r1, xEnd), rayCol, 1.8);
    if (R.r2) seg(ctx, vw, P, atX(rl.r2, xEnd), rayCol, 1.8);
    if (R.r3 && rl.r3) seg(ctx, vw, rl.r3.p, [xEnd, rl.r3.p[1]], rayCol, 1.8);
    if (img.type === 'virtual') {
      /* 反向延长线（虚线）交于虚像点 */
      const backX=Math.max(img.v,vw.xMin);
      if (R.r1) seg(ctx, vw, rl.r1.p, atX(rl.r1,backX), 'rgba(126,226,168,.65)', 1.3, [5, 4]);
      if (R.r2) seg(ctx, vw, rl.r2.p, atX(rl.r2,backX), 'rgba(126,226,168,.65)', 1.3, [5, 4]);
      if (R.r3 && rl.r3) seg(ctx, vw, rl.r3.p, atX(rl.r3,backX), 'rgba(126,226,168,.65)', 1.3, [5, 4]);
    }
  }
  ctx.restore();
  /* A clipped finite image is still an image; the adjacent text reports its side and values. */
  if(opts.showImageCandle&&img.type!=='inf'){
    if(imageInView(img,vw)){
      drawCandle(ctx,vw.X(img.v),vw.axisY,img.imgH*vw.ppu,img.type==='real'?pink:green,img.type==='virtual');
      dot(ctx,vw.X(img.v),vw.Y(img.imgH),img.type==='real'?pink:green,3.4);
    }else txt(ctx,t('cOutside'),vw.w-8,22,orange,'right',12);
  }
  /* 物点 */
  dot(ctx, vw.X(P[0]), vw.Y(P[1]), orange, 3.6);
  return img;
}

function imageInView(img,vw){
  if(!['real','virtual'].includes(img.type))return false;
  const height=img.imgH*vw.ppu,x=vw.X(img.v),y=vw.Y(img.imgH),half=Math.max(4,Math.abs(height)*.48*.36/2);
  return x-half>=6&&x+half<=vw.w-6&&Math.min(vw.axisY,y)>=6&&Math.max(vw.axisY,y)<=vw.h-6;
}
function imageViewNote(img,vw){return img.type==='inf'?t('viewInfinity'):imageInView(img,vw)?t('viewInside'):t('viewOutside');}
function ray3Note(f,u,h,vw){const r=rayLines(f,u,h).r3;return !r?t('ray3Focus'):vw.Y(r.p[1])<6||vw.Y(r.p[1])>vw.h-6?t('ray3Outside'):'';}
/* ---------- 状态 ---------- */
const S = {
  s0: { f: 60 },
  s1: { u: 120, h: 30, rays: { r1: true, r2: false, r3: false } },
  s2: { u: 180 },
  s3: { mode: 'real', p: 60 },
  s4: { picks: {}, wrong: {}, locked: {} }
};

/* ================= 第 0 步：平行光会聚 ================= */
function render0() {
  const cv = regCanvas('s0-canvas');
  const ctx = fitCanvas(cv);
  const vw = makeView(cv, 0.34, 620);
  const f = S.s0.f;
  ctx.clearRect(0, 0, vw.w, vw.h);
  drawAxis(ctx, vw, f, t('cAxis'));
  drawLens(ctx, vw);
  /* 平行光束：入射水平、折射后过焦点再散开 */
  const Fp = [vw.X(f), vw.axisY];
  [-40, -20, 0, 20, 40].forEach(hu => {
    const y = vw.Y(hu);
    if (hu === 0) return; /* 与主光轴重合的一条不另画 */
    line(ctx, 6, y, vw.lensX, y, cyan, 1.7);
    const tEnd = (vw.w - 8 - vw.lensX) / (f * vw.ppu);
    const eY = y + (Fp[1] - y) * tEnd;
    line(ctx, vw.lensX, y, Fp[0], Fp[1], cyan, 1.7);
    line(ctx, Fp[0], Fp[1], vw.w - 8, eY, 'rgba(110,231,255,.55)', 1.4);
  });
  line(ctx, 6, vw.axisY, vw.w - 8, vw.axisY, 'rgba(110,231,255,.35)', 1.1, [3, 5]);
  dot(ctx, Fp[0], Fp[1], orange, 5);
  txt(ctx, t('cFocusTag'), Fp[0], Fp[1] - 20, orange, 'center', vw.w < 520 ? 11 : 12.5);
  $('s0-f-val').textContent = f;
  const judge = f <= 50 ? t('s0judgeShort') : f <= 70 ? t('s0judgeMid') : t('s0judgeLong');
  $('s0-readout').innerHTML = t('s0ro', { f: fmtNum(f), f2: fmtNum(2 * f), judge: judge });
}

/* ================= 第 1 步：三条特殊光线 ================= */
function render1() {
  const cv = regCanvas('s1-canvas');
  const ctx = fitCanvas(cv);
  const vw = makeView(cv, 0.42, 680);
  const st = S.s1, f = F2;
  ctx.clearRect(0, 0, vw.w, vw.h);
  drawAxis(ctx, vw, f, null);
  drawLens(ctx, vw);
  const anyRay = st.rays.r1 || st.rays.r2 || st.rays.r3;
  drawCandle(ctx, vw.X(-st.u), vw.axisY, st.h * vw.ppu, orange, false);
  txt(ctx, t('cObjTip'), vw.X(-st.u), vw.Y(st.h) - 14, orange, 'center', 11.5);
  const img = drawOptics(ctx, vw, f, st.u, st.h, { rays: st.rays, showImageCandle: anyRay });
  $('s1-u-val').textContent = fmtNum(st.u);
  $('s1-h-val').textContent = fmtNum(st.h);
  ['r1', 'r2', 'r3'].forEach(r => {
    const b = $('s1-' + r);
    b.classList.toggle('active', st.rays[r]);
    b.setAttribute('aria-pressed', String(st.rays[r]));
  });
  const rules = [];
  if (st.rays.r1) rules.push(t('s1rule1'));
  if (st.rays.r2) rules.push(t('s1rule2'));
  if (st.rays.r3) rules.push(t(st.u===f?'ray3Focus':st.u<f?'s1rule3Virtual':'s1rule3'));
  if(st.rays.r3&&st.u!==f&&ray3Note(f,st.u,st.h,vw))rules.push(ray3Note(f,st.u,st.h,vw));
  $('s1-rule').textContent = rules.length ? rules.join('\n') : t('s1roIdle');
  const ro = $('s1-readout');
  $('s1-view').textContent=anyRay?imageViewNote(img,vw):t('viewRaysOff');
  if (!anyRay) { ro.innerHTML = ''; return; }
  if (img.type === 'inf') ro.innerHTML = t('s1roInf', { u: fmtNum(st.u) });
  else if (img.type === 'real') ro.innerHTML = t('s1ro', {
    u: fmtNum(st.u), v: fmtNum(img.v), ih: fmtNum(Math.abs(img.imgH)), oh: fmtNum(st.h), m: fmtNum(img.mAbs)
  });
  else ro.innerHTML = t('s1roVirt', {
    u: fmtNum(st.u), v: fmtNum(Math.abs(img.v)), ih: fmtNum(Math.abs(img.imgH)), oh: fmtNum(st.h), m: fmtNum(img.mAbs)
  });
}

/* ================= 第 2 步：远近变像 ================= */
function render2() {
  const cv = regCanvas('s2-canvas');
  const ctx = fitCanvas(cv);
  const vw = makeView(cv, 0.46, 700);
  const f = F2, u = S.s2.u, H = 26;
  ctx.clearRect(0, 0, vw.w, vw.h);
  /* 区域带（轴下、物侧）：三段以 F、2F 为界，当前段点亮 */
  const zone = zoneOf(f, u);
  const bandY0 = vw.axisY + 30, bandY1 = vw.axisY + 44;
  const segs = [
    { a: -215, b: -2 * f, col: '110,231,255', on: zone === 'gt2f' || zone === 'eq2f' },
    { a: -2 * f, b: -f, col: '255,180,84', on: zone === 'mid' || zone === 'eq2f' },
    { a: -f, b: 0, col: '126,226,168', on: zone === 'ltf' || zone === 'eqf' }
  ];
  segs.forEach(sg => {
    ctx.fillStyle = 'rgba(' + sg.col + ',' + (sg.on ? 0.42 : 0.15) + ')';
    ctx.fillRect(vw.X(sg.a), bandY0, vw.X(sg.b) - vw.X(sg.a), bandY1 - bandY0);
    if (sg.on) { ctx.strokeStyle = 'rgba(' + sg.col + ',.9)'; ctx.lineWidth = 1.4; ctx.strokeRect(vw.X(sg.a), bandY0, vw.X(sg.b) - vw.X(sg.a), bandY1 - bandY0); }
  });
  drawAxis(ctx, vw, f, null);
  drawLens(ctx, vw);
  drawCandle(ctx, vw.X(-u), vw.axisY, H * vw.ppu, orange, false);
  const img = drawOptics(ctx, vw, f, u, H, { rays: { r1: true, r2: true, r3: true }, showImageCandle: true, tagFar: t('cFarTag') });
  $('s2-u-val').textContent = fmtNum(u);
  const ro = $('s2-readout');
  const base = { u: fmtNum(u), v: fmtNum(Math.abs(img.v)), m: fmtNum(img.mAbs) };
  if (zone === 'gt2f') ro.innerHTML = t('s2roGt', base);
  else if (zone === 'eq2f') ro.innerHTML = t('s2roEq2', { u: fmtNum(u), v: base.v, m: base.m });
  else if (zone === 'mid') ro.innerHTML = t('s2roMid', base);
  else if (zone === 'eqf') ro.innerHTML = t('s2roEqF', { u: fmtNum(u) });
  else ro.innerHTML = t('s2roLt', base);
  $('s2-view').textContent=imageViewNote(img,vw)+' '+ray3Note(f,u,H,vw);
  $('s2-formula').textContent=img.type==='inf'?t('formulaFocus'):t('formulaFinite',{delta:fmtNum(u-f),v:fmtNum(img.v),M:fmtNum(img.magnification),h:fmtNum(img.imgH)});
}

/* ================= 第 3 步：光屏与眼睛 ================= */
const S3F = 60, S3REAL = { u: 150, h: 26 }, S3VIRT = { u: 30, h: 26 };
function drawScreen(ctx, vw, p, ghost) {
  const x = vw.X(p), y0 = vw.axisY - 96, y1 = vw.axisY + 96;
  ctx.save();
  if (ghost) ctx.globalAlpha = 0.45;
  ctx.fillStyle = 'rgba(200,210,224,.85)';
  ctx.fillRect(x - 3, y0, 6, y1 - y0);
  ctx.fillStyle = 'rgba(200,210,224,.5)';
  ctx.fillRect(x - 14, y1, 28, 5);
  ctx.restore();
  txt(ctx, t('cScreen'), x, y0 - 12, muted, 'center', 12);
  return x;
}
function render3() {
  const cv = regCanvas('s3-canvas');
  const ctx = fitCanvas(cv);
  const vw = makeView(cv, 0.42, 680);
  const st = S.s3;
  ctx.clearRect(0, 0, vw.w, vw.h);
  drawAxis(ctx, vw, S3F, null);
  drawLens(ctx, vw);
  $('s3-m-real').classList.toggle('active', st.mode === 'real');
  $('s3-m-virt').classList.toggle('active', st.mode === 'virt');
  $('s3-p-val').textContent = fmtNum(st.p);
  const ro = $('s3-readout');
  if (st.mode === 'real') {
    const { u, h } = S3REAL;
    const img = imageOf(S3F, u, h);
    drawCandle(ctx, vw.X(-u), vw.axisY, h * vw.ppu, orange, false);
    /* 光线只画到光屏为止（屏挡住后面的光） */
    const rl = rayLines(S3F, u, h);
    const P = [-u, h];
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, vw.X(st.p) - 3, vw.h); ctx.clip();
    seg(ctx, vw, P, [0, h], cyan, 1.7);
    seg(ctx, vw, rl.r1.p, atX(rl.r1, vw.xMax), cyan, 1.7);
    seg(ctx, vw, P, atX(rl.r2, vw.xMax), cyan, 1.7);
    if (rl.r3) { seg(ctx, vw, P, rl.r3.p, cyan, 1.7); seg(ctx, vw, rl.r3.p, [vw.xMax, rl.r3.p[1]], cyan, 1.7); }
    ctx.restore();
    dot(ctx, vw.X(P[0]), vw.Y(P[1]), orange, 3.4);
    const sx = drawScreen(ctx, vw, st.p, false);
    /* 屏面光斑：三条光线在屏面处的落点跨度——光被屏截住的可见证据。
       落点由同一组光线实算（atX），柔光晕开为示意；像越清晰跨度越收拢、恰与屏上像重合。 */
    const landYs = [rl.r1, rl.r2, rl.r3].filter(Boolean).map(L => vw.Y(atX(L, st.p)[1]));
    const patchY0 = clamp(Math.min(...landYs), vw.axisY - 96, vw.axisY + 96);
    const patchY1 = clamp(Math.max(...landYs), vw.axisY - 96, vw.axisY + 96);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, sx + 3, vw.h); ctx.clip();   /* 晕光不得越过屏的右面：屏后无光 */
    ctx.shadowColor = 'rgba(170,242,255,.85)';
    ctx.shadowBlur = 5 + Math.abs(st.p - img.v) * 0.22;
    ctx.fillStyle = 'rgba(196,246,255,.30)';
    ctx.fillRect(sx - 2, patchY0, 4, Math.max(2.5, patchY1 - patchY0));
    ctx.restore();
    /* 屏上的像：中心高由过心线在屏面处的位置定，大小按 p/u 缩放，模糊按离焦（示意） */
    const imgHScreen = -(st.p / u) * h;
    const blur = clamp(Math.abs(st.p - img.v) * 0.22, 0, 10);
    ctx.save();
    try { ctx.filter = 'blur(' + blur.toFixed(1) + 'px)'; } catch (e) { /* 不支持则以半透明示意 */ }
    if (blur > 5) ctx.globalAlpha = 0.75;
    drawCandle(ctx, sx, vw.axisY, imgHScreen * vw.ppu, pink, false);
    ctx.restore();
    txt(ctx, t('cOnScreen'), sx, vw.axisY + 118, pink, 'center', 11.5);
    const d = Math.abs(st.p - img.v);
    if (st.p === img.v) ro.innerHTML = t('s3roSharp', { p: fmtNum(st.p), v: fmtNum(img.v) });
    else ro.innerHTML = t('s3roBlur', { p: fmtNum(st.p), v: fmtNum(img.v), d: fmtNum(d) });
  } else {
    const { u, h } = S3VIRT;
    const img = imageOf(S3F, u, h);
    drawCandle(ctx, vw.X(-u), vw.axisY, h * vw.ppu, orange, false);
    drawOptics(ctx, vw, S3F, u, h, { rays: { r1: true, r2: true, r3: true }, showImageCandle: false });
    if (img.v >= vw.xMin) drawCandle(ctx, vw.X(img.v), vw.axisY, img.imgH * vw.ppu, green, true);
    drawScreen(ctx, vw, st.p, true);
    txt(ctx, t('cNothing'), vw.X(st.p), vw.axisY + 118, muted, 'center', 11.5);
    /* 眼睛：右侧看向透镜；视线（反向延长）落向虚像点 */
    const ex = vw.w - 52, ey = vw.axisY - 64;
    ctx.beginPath(); ctx.arc(ex, ey, 13, 0, Math.PI * 2);
    ctx.strokeStyle = cyan; ctx.lineWidth = 1.8; ctx.stroke();
    dot(ctx, ex, ey, cyan, 4.5);
    txt(ctx, t('cEye'), ex, ey - 22, cyan, 'center', 12);
    if (img.v >= vw.xMin) {
      line(ctx, ex, ey, vw.X(img.v), vw.Y(img.imgH), 'rgba(126,226,168,.5)', 1.2, [4, 4]);
      line(ctx, ex, ey, vw.X(img.v), vw.axisY, 'rgba(126,226,168,.35)', 1.2, [4, 4]);
    }
    ro.innerHTML = t('s3roVirt', { p: fmtNum(st.p) });
  }
}

/* ================= 第 4 步：自测参考带图 ================= */
function render4band() {
  const cv = regCanvas('s4-canvas');
  const ctx = fitCanvas(cv);
  const vw = makeView(cv, 0.68, 700);
  const f = F2;
  ctx.clearRect(0, 0, vw.w, vw.h);
  const bandY0 = vw.axisY + 16, bandY1 = vw.axisY + 32;
  const compact = vw.w < 520;
  const segs = [
    { a: -215, b: -2 * f, col: '110,231,255', lab: compact ? 'u>2f' : t('s4zGt') },
    { a: -2 * f, b: -f, col: '255,180,84', lab: compact ? 'f<u<2f' : t('s4zMid') },
    { a: -f, b: 0, col: '126,226,168', lab: compact ? 'u<f' : t('s4zLt') }
  ];
  segs.forEach(sg => {
    ctx.fillStyle = 'rgba(' + sg.col + ',.28)';
    ctx.fillRect(vw.X(sg.a), bandY0, vw.X(sg.b) - vw.X(sg.a), bandY1 - bandY0);
    txt(ctx, sg.lab, (vw.X(sg.a) + vw.X(sg.b)) / 2, bandY1 + 16, 'rgba(' + sg.col + ',1)', 'center', 12);
  });
  drawAxis(ctx, vw, f, null);
  drawLens(ctx, vw);
  drawCandle(ctx, vw.X(-150), vw.axisY, 22 * vw.ppu, orange, false);
}

/* ---------- 自测判定 ---------- */
const QUIZ = {
  q1: { answer: 0, why: 's4q1why' },
  q2: { answer: 1, why: 's4q2why' },
  q3a: { answer: 1, why: 's4q3awhy' },
  q3b: { answer: 2, why: 's4q3bwhy' }
};
function renderQuiz() {
  Object.keys(QUIZ).forEach(q => {
    const st = S.s4;
    document.querySelectorAll('button[data-q="' + q + '"]').forEach(b => {
      const opt = Number(b.dataset.opt);
      b.classList.toggle('opt-correct', !!st.locked[q] && opt === QUIZ[q].answer);
      b.classList.toggle('opt-wrong', (st.wrong[q] || []).includes(opt));
      b.disabled = !!st.locked[q] && opt !== QUIZ[q].answer;
    });
    const ro = $('s4-' + q + '-ro');
    if (!ro) return;
    if (st.locked[q]) ro.innerHTML = '<span class="pos">' + t('s4ok') + '</span>' + t(QUIZ[q].why);
    else if (st.picks[q] !== undefined) ro.innerHTML = '<span class="neg">' + t('s4no') + '</span>' + t(QUIZ[q].why);
    else ro.innerHTML = t('s4idle');
  });
}
function answer(q, opt) {
  const st = S.s4;
  if (st.locked[q]) return;
  st.picks[q] = opt;
  if (opt === QUIZ[q].answer) st.locked[q] = true;
  else { st.wrong[q] = st.wrong[q] || []; if (!st.wrong[q].includes(opt)) st.wrong[q].push(opt); }
  renderQuiz();
}

/* ---------- 渲染总入口 ---------- */
function renderAll() { render0(); render1(); render2(); render3(); render4band(); renderQuiz(); badges(); }
function badges() {
  try {
    const c = (window.KNOWLEDGE_CATEGORIES || []).find(x => x.id === 'physics');
    const s = (window.KNOWLEDGE_STAGES || []).find(x => x.id === 'junior');
    if (c) $('categoryBadge').textContent = c.name[getLang()];
    if (s) $('stageBadge').textContent = s.name[getLang()];
  } catch (e) { /* 配置缺失时徽标留空，不报错 */ }
}

let lensReadingTimer=null;
function queueLensReading(){clearTimeout(lensReadingTimer);lensReadingTimer=setTimeout(saveLensReading,180);}
function validLensReading(v){return !!v&&typeof v==='object'&&!Array.isArray(v)&&v.version===1&&v.lesson==='lens'&&v.s0&&v.s1&&v.s2&&v.s3&&[v.s0,v.s1,v.s2,v.s3,v.s1.rays].every(x=>x&&typeof x==='object'&&!Array.isArray(x))&&Number.isFinite(v.s0.f)&&v.s0.f>=40&&v.s0.f<=90&&v.s0.f%5===0&&Number.isFinite(v.s1.u)&&v.s1.u>=28&&v.s1.u<=215&&Number.isFinite(v.s1.h)&&v.s1.h>=10&&v.s1.h<=46&&v.s1.rays&&['r1','r2','r3'].every(k=>typeof v.s1.rays[k]==='boolean')&&Number.isFinite(v.s2.u)&&v.s2.u>=25&&v.s2.u<=200&&['real','virt'].includes(v.s3.mode)&&Number.isFinite(v.s3.p)&&v.s3.p>=35&&v.s3.p<=230;}
function saveLensReading(){clearTimeout(lensReadingTimer);lensReadingTimer=null;try{const prior=history.state;history.replaceState({...((prior&&typeof prior==='object'&&!Array.isArray(prior))?prior:{}),knowledgeGeometryReading:{version:1,lesson:'lens',s0:{...S.s0},s1:{u:S.s1.u,h:S.s1.h,rays:{...S.s1.rays}},s2:{...S.s2},s3:{...S.s3}}},'');}catch(_){}}
function restoreLensReading(){try{const v=history.state&&history.state.knowledgeGeometryReading;if(validLensReading(v)){S.s0.f=v.s0.f;S.s1.u=v.s1.u;S.s1.h=v.s1.h;for(const k of ['r1','r2','r3'])S.s1.rays[k]=v.s1.rays[k];S.s2.u=v.s2.u;S.s3.mode=v.s3.mode;S.s3.p=v.s3.p;}}catch(_){}}
function syncLensControls(){for(const[id,v]of [['s0-f',S.s0.f],['s1-u',S.s1.u],['s1-h',S.s1.h],['s2-u',S.s2.u],['s3-p',S.s3.p]])$(id).value=v;}
function continuousKeys(id,step,min,max){$(id).addEventListener('keydown',e=>{const d={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();$(id).value=clamp(Number($(id).value)+d*step,min,max);$(id).dispatchEvent(new Event('input',{bubbles:true}));}});}
/* ---------- 拖拽 ---------- */
function bindDrag(cv, fn) {
  cv.classList.add('dragc');
  let pointer = null;
  function move(e) {
    if (e.pointerId !== pointer) return;
    const r = cv.getBoundingClientRect();
    fn(e.clientX - r.left, e.clientY - r.top);
    queueLensReading();
  }
  cv.addEventListener('pointerdown', e => { pointer = e.pointerId; try { cv.setPointerCapture(pointer); } catch (err) {} move(e); });
  cv.addEventListener('pointermove', move);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => cv.addEventListener(ev, () => { pointer = null; }));
}

function init() {
  restoreLensReading();
  ['s0-canvas', 's1-canvas', 's2-canvas', 's3-canvas', 's4-canvas'].forEach(regCanvas);
  /* 第 0 步 */
  $('s0-f').addEventListener('input', e => { S.s0.f = Number(e.target.value); render0(); });
  $('s0-start').addEventListener('click', () => document.getElementById('step1').scrollIntoView({ behavior: 'smooth' }));
  /* 第 1 步 */
  ['r1', 'r2', 'r3'].forEach(r => $('s1-' + r).addEventListener('click', () => { S.s1.rays[r] = !S.s1.rays[r]; render1(); }));
  $('s1-u').addEventListener('input', e => { S.s1.u = Number(e.target.value); render1(); });
  $('s1-h').addEventListener('input', e => { S.s1.h = Number(e.target.value); render1(); });
  bindDrag($('s1-canvas'), (x, y) => {
    const vw = VIEWS['s1-canvas']; if (!vw) return;
    S.s1.u = clamp((vw.lensX - x) / vw.ppu, 28, 215);
    S.s1.h = clamp((vw.axisY - y) / vw.ppu, 10, 46);
    $('s1-u').value = S.s1.u;
    $('s1-h').value = S.s1.h;
    render1();
  });
  /* 第 2 步 */
  $('s2-u').addEventListener('input', e => { S.s2.u = Number(e.target.value); render2(); });
  const preset = (id, u) => $(id).addEventListener('click', () => { S.s2.u = u; $('s2-u').value = u; render2(); });
  preset('s2-p-far', 180); preset('s2-p-2f', 120); preset('s2-p-mid', 90); preset('s2-p-f', 60); preset('s2-p-near', 30);
  bindDrag($('s2-canvas'), x => {
    const vw = VIEWS['s2-canvas']; if (!vw) return;
    S.s2.u = clamp((vw.lensX - x) / vw.ppu, 25, 200);
    $('s2-u').value = S.s2.u;
    render2();
  });
  /* 第 3 步 */
  $('s3-m-real').addEventListener('click', () => { S.s3.mode = 'real'; render3(); });
  $('s3-m-virt').addEventListener('click', () => { S.s3.mode = 'virt'; render3(); });
  $('s3-p').addEventListener('input', e => { S.s3.p = Number(e.target.value); render3(); });
  bindDrag($('s3-canvas'), x => {
    const vw = VIEWS['s3-canvas']; if (!vw) return;
    S.s3.p = clamp((x - vw.lensX) / vw.ppu, 35, 230);
    $('s3-p').value = S.s3.p;
    render3();
  });
  /* 第 4 步 */
  document.querySelectorAll('button[data-q]').forEach(b => {
    b.addEventListener('click', () => answer(b.dataset.q, Number(b.dataset.opt)));
  });
  /* 步骤导航高亮 */
  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(a => {
      const active = a.dataset.nav === e.target.dataset.step;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));

  continuousKeys('s1-u',1,28,215);continuousKeys('s1-h',1,10,46);continuousKeys('s2-u',.1,25,200);continuousKeys('s3-p',1,35,230);
  document.querySelectorAll('input').forEach(e=>e.addEventListener('input',queueLensReading));
  document.querySelectorAll('button:not([data-q]):not([data-lang])').forEach(e=>e.addEventListener('click',queueLensReading));
  document.querySelectorAll('a[href]').forEach(e=>e.addEventListener('click',()=>{if(!e.getAttribute('href').startsWith('#'))saveLensReading();}));
  window.addEventListener('pagehide',saveLensReading);window.addEventListener('pageshow',()=>requestAnimationFrame(()=>{syncLensControls();renderAll();}));
  syncLensControls();renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);

/* 只读对账面：评审/自查用，UI 仍是唯一的修改路径 */
window.LENS = {
  imageOf: imageOf, zoneOf: zoneOf, rayLines: rayLines, lineIntersect: lineIntersect, fmtNum: fmtNum,
  geom: id => VIEWS[id] || null,
  get state() { return JSON.parse(JSON.stringify(S)); }
};
