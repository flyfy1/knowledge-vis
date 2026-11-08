'use strict';
/* 复数页 · 红线与范式照 fractions / exp-log 页：
   · 同源原则（BRIEF 写死）：一切读数（实部/虚部/模/辐角/和/积）只由 (a, b) 经 PURE 实算得出，
     图形（箭头、平行四边形、旋转弧）由同一组数值绘制；自测判定与正文共用同一 PURE。
   · 辐角主值 (−180°, 180°]：atan2 实算 + normAng 归一化；负实轴记 +180°；
     模 0（原点）辐角无定义，cArgDeg 返回 null，读数明示「原点没有辐角」。
   · 显示口径：分量与模保留 2 位小数去尾零；角度保留 1 位小数、恰为整数显示整数；
     负号一律 U+2212（fmtC / fmtAng / tickTxt 唯一出口）。
   · 状态一致性：拖点 × 答题 × 切语言全组合——切语言只换文案、底层 state 不变、读数按新语言重渲染。 */

/* ================= PURE-BEGIN ================= */
/* 复数以 [a, b] 表示（a 实部、b 虚部） */
function cAdd(z, w){ return [z[0] + w[0], z[1] + w[1]]; }
function cMul(z, w){ return [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]]; }
function cMulI(z){ return [-z[1], z[0]]; }              /* 乘 i：分量式 (a+bi)·i = −b + ai */
function cMod(z){ return Math.hypot(z[0], z[1]); }      /* 模：勾股实算 */
/* 辐角归一化到主值 (−180°, 180°]：−180° 一律记 +180° */
function normAng(d){
  var r = d % 360;
  if (r <= -180) r += 360;
  else if (r > 180) r -= 360;
  return r;
}
/* 辐角主值（度）：atan2 实算；原点无定义 → null */
function cArgDeg(z){
  if (z[0] === 0 && z[1] === 0) return null;
  return normAng(Math.atan2(z[1], z[0]) * 180 / Math.PI);
}
/* 极坐标路（与分量式互证用）：模相乘、角相加再换算回分量 */
function mulPolar(z, w){
  var m = cMod(z) * cMod(w);
  var az = cArgDeg(z), aw = cArgDeg(w);
  if (az === null || aw === null) return [0, 0];
  var th = normAng(az + aw) * Math.PI / 180;
  return [m * Math.cos(th), m * Math.sin(th)];
}
/* i 的 n 次幂：从 1 出发连乘 i 实算（周期 4） */
function ipow(n){
  var z = [1, 0];
  for (var k = 0; k < ((n % 4) + 4) % 4; k++) z = cMulI(z);
  return z;
}
/* ---- 显示口径（负号 U+2212；分量/模 2 位小数去尾零；角度 1 位小数、整数显示整数） ---- */
function trimDecStr(s){ if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; }
function fmtC(v){
  if (Math.abs(v) < 5e-13) v = 0;
  return trimDecStr(v.toFixed(2)).replace('-', '−');
}
function fmtAng(v){
  if (v === null || v === undefined) return null;
  var r = Math.round(v);
  if (Math.abs(v - r) < 1e-6) v = r;
  return trimDecStr(v.toFixed(1)).replace('-', '−') + '°';
}
/* z = a + bi 的规范写法：纯实数只写 a；纯虚数只写 bi（b=±1 省作 ±i）；b<0 写减号 */
function fmtZ(z){
  var a = z[0], b = z[1];
  if (Math.abs(a) < 5e-13) a = 0;
  if (Math.abs(b) < 5e-13) b = 0;
  if (b === 0) return fmtC(a);
  var bAbs = Math.abs(b), bStr = (bAbs === 1) ? 'i' : fmtC(bAbs) + 'i';
  if (a === 0) return (b < 0 ? '−' : '') + bStr;
  return fmtC(a) + (b < 0 ? ' − ' : ' + ') + bStr;
}
/* 代入式展示用：负数加括号，如 (−2)×1.5，避免 1.5×−0.5 式歧义 */
function fmtFac(v){ var s = fmtC(v); return v < 0 ? '(' + s + ')' : s; }
/* 自测真值（全部由 PURE 当场算出，不写常量答案表） */
function quizQ1Answer(){ return cMulI(cMulI([3, 2])); }         /* (3+2i)·i² = [−3, −2] */
var QUIZ = {
  q2a: [3, 4], q2b: [-4, 3],                                      /* 题 2 两点，模各 5 */
  q3z: [1, 1]                                                    /* 题 3 验算组 z₁ = z₂ = 1+i */
};
/* ================= PURE-END ================= */

/* ================= 画布基础设施（照 exp-log / derivative） ================= */
function fitCanvas(cv){
  var dpr = Math.min(window.devicePixelRatio || 1, 3);
  var w = cv.clientWidth;
  if (!w) return;
  var cssH = parseFloat(cv.dataset.cssH);
  if (!cssH){
    cssH = cv.clientHeight || parseInt(cv.getAttribute('height'), 10) || 320;
    cv.dataset.cssH = cssH;
  }
  cv.style.height = cssH + 'px';
  var bw = Math.round(w * dpr), bh = Math.round(cssH * dpr);
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
}
var _canvases = [], _refitFns = [];
function regCanvas(cv){ if (_canvases.indexOf(cv) < 0) _canvases.push(cv); return cv; }
function onRefit(fn){ _refitFns.push(fn); }
(function(){
  var pending = false;
  window.addEventListener('resize', function(){
    if (pending) return;
    pending = true;
    requestAnimationFrame(function(){
      pending = false;
      _canvases.forEach(fitCanvas);
      _refitFns.forEach(function(fn){ fn(); });
    });
  });
})();

/* ============ 步骤导航高亮 ============ */
(function(){
  var links = document.querySelectorAll('.nav-step');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
  var visible = {};
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) visible[en.target.id] = en.boundingClientRect.top;
      else delete visible[en.target.id];
    });
    var ids = Object.keys(visible);
    if (!ids.length) return;
    ids.sort(function(a, b){ return Math.abs(visible[a]) - Math.abs(visible[b]); });
    links.forEach(function(a){ a.classList.remove('active'); });
    var cur = map[ids[0]];
    if (cur) cur.classList.add('active');
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('section.step').forEach(function(s){ io.observe(s); });
})();

function $(id){ return document.getElementById(id); }
function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
function tickTxt(v){ return String(v).replace(/-/g, '−'); }
function snap1(v){ return Math.round(v * 10) / 10; }

var _roCache = {};
function setRO(id, html){
  if (_roCache[id] === html) return;
  _roCache[id] = html;
  var el = $(id);
  if (el) el.innerHTML = html;
}

var COL = {
  cyan: '#6ee7ff', orange: '#ffb454', red: '#ff7a93', green: '#7ee2a8',
  ink: '#e8edf4', mut: '#9aa7b8', grid: 'rgba(57,70,94,.35)', axis: '#5b6b84', white: '#ffffff'
};

function plotGeom(cv, xr, yr){
  var W = cv.width, H = cv.height;
  var left = 46, right = W - 12, top = 12, bottom = H - 28;
  var X = function(x){ return left + (x - xr[0]) / (xr[1] - xr[0]) * (right - left); };
  var Y = function(y){ return bottom - (y - yr[0]) / (yr[1] - yr[0]) * (bottom - top); };
  return { W: W, H: H, xr: xr, yr: yr, X: X, Y: Y,
    invX: function(px){ return xr[0] + (px - left) / (right - left) * (xr[1] - xr[0]); },
    invY: function(py){ return yr[0] + (bottom - py) / (bottom - top) * (yr[1] - yr[0]); } };
}
function drawGrid(ctx, g, opt){
  opt = opt || {};
  ctx.lineWidth = 1;
  var x, y;
  if (opt.gx) for (x = Math.ceil(g.xr[0] / opt.gx) * opt.gx; x <= g.xr[1] + 1e-9; x += opt.gx){
    if (Math.abs(x) < 1e-9) continue;
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(g.X(x), g.Y(g.yr[0])); ctx.lineTo(g.X(x), g.Y(g.yr[1])); ctx.stroke();
  }
  if (opt.gy) for (y = Math.ceil(g.yr[0] / opt.gy) * opt.gy; y <= g.yr[1] + 1e-9; y += opt.gy){
    if (Math.abs(y) < 1e-9) continue;
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(g.X(g.xr[0]), g.Y(y)); ctx.lineTo(g.X(g.xr[1]), g.Y(y)); ctx.stroke();
  }
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.4;
  if (g.yr[0] < 0 && g.yr[1] > 0){ ctx.beginPath(); ctx.moveTo(g.X(g.xr[0]), g.Y(0)); ctx.lineTo(g.X(g.xr[1]), g.Y(0)); ctx.stroke(); }
  if (g.xr[0] < 0 && g.xr[1] > 0){ ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(g.yr[0])); ctx.lineTo(g.X(0), g.Y(g.yr[1])); ctx.stroke(); }
  ctx.fillStyle = COL.mut; ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  if (opt.lx) for (x = Math.ceil(g.xr[0] / opt.lx) * opt.lx; x <= g.xr[1] + 1e-9; x += opt.lx){
    if (Math.abs(x) < 1e-9) continue;
    ctx.fillText(tickTxt(fmtC(Math.round(x * 100) / 100)), g.X(x), g.Y(0) + 5);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (opt.ly) for (y = Math.ceil(g.yr[0] / opt.ly) * opt.ly; y <= g.yr[1] + 1e-9; y += opt.ly){
    if (Math.abs(y) < 1e-9) continue;
    ctx.fillText(tickTxt(fmtC(Math.round(y * 100) / 100)), g.X(g.xr[0]) + 4, g.Y(y));
  }
  if (opt.xName){ ctx.textAlign = 'right'; ctx.fillStyle = COL.mut; ctx.fillText(opt.xName, g.X(g.xr[1]) - 2, g.Y(0) - 10); }
  if (opt.yName){ ctx.textAlign = 'left'; ctx.fillStyle = COL.mut; ctx.fillText(opt.yName, g.X(0) + 6, g.Y(g.yr[1]) + 8); }
}
function drawCurve(ctx, g, fn, xa, xb, color, width){
  ctx.strokeStyle = color; ctx.lineWidth = width || 2.4; ctx.beginPath();
  var N = 220, started = false;
  for (var i = 0; i <= N; i++){
    var x = xa + (xb - xa) * i / N, y = fn(x);
    if (!isFinite(y)){ started = false; continue; }
    var px = g.X(x), py = g.Y(clamp(y, g.yr[0] - 2, g.yr[1] + 2));
    if (!started){ ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
  }
  ctx.stroke();
}
function drawLine2(ctx, g, x1, y1, x2, y2, color, width, dash){
  ctx.strokeStyle = color; ctx.lineWidth = width || 2; ctx.setLineDash(dash || []);
  ctx.beginPath(); ctx.moveTo(g.X(x1), g.Y(y1)); ctx.lineTo(g.X(x2), g.Y(y2)); ctx.stroke();
  ctx.setLineDash([]);
}
function drawDot(ctx, g, x, y, color, r, ring){
  ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), r || 6, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  if (ring){ ctx.strokeStyle = COL.white; ctx.lineWidth = 1.6; ctx.stroke(); }
}
function cText(ctx, txt, px, py, color, size, align, bold){
  ctx.fillStyle = color; ctx.font = (bold ? '700 ' : '') + (size || 13) + 'px system-ui, sans-serif';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, px, py);
}
function cTextTag(ctx, txt, px, py, color){
  ctx.font = '700 12.5px system-ui, sans-serif';
  var w = ctx.measureText(txt).width + 12;
  ctx.fillStyle = 'rgba(13,17,23,.82)';
  ctx.fillRect(px - 2, py - 10, w, 20);
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, px + 4, py);
}
/* 箭头：由同一组 (a, b) 数值绘制，箭头方向/长度即读数本身 */
function drawArrow(ctx, g, z, color, width){
  var x2 = g.X(z[0]), y2 = g.Y(z[1]), x1 = g.X(0), y1 = g.Y(0);
  ctx.strokeStyle = color; ctx.lineWidth = width || 2.6;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  var ang = Math.atan2(y2 - y1, x2 - x1), hs = 11;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(ang - 0.42), y2 - hs * Math.sin(ang - 0.42));
  ctx.lineTo(x2 - hs * Math.cos(ang + 0.42), y2 - hs * Math.sin(ang + 0.42));
  ctx.closePath(); ctx.fill();
}
/* 圆弧折线（按数据坐标采样后映射，x/y 尺度不一致也不会变形） */
function drawArcPoly(ctx, g, r, a0deg, a1deg, color, width, dash){
  if (r <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = width || 2; ctx.setLineDash(dash || []);
  ctx.beginPath();
  var N = 40;
  for (var i = 0; i <= N; i++){
    var th = (a0deg + (a1deg - a0deg) * i / N) * Math.PI / 180;
    var px = g.X(r * Math.cos(th)), py = g.Y(r * Math.sin(th));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.setLineDash([]);
}
function drawUnitCircle(ctx, g){
  drawArcPoly(ctx, g, 1, 0, 360, 'rgba(154,167,184,.4)', 1.2, [4, 5]);
  cText(ctx, t('cUnit'), g.X(0.72), g.Y(0.78), COL.mut, 11, 'left');
}

/* ================= 状态 ================= */
var geoms = {};
var S0 = { xi: 10, open: false, fade: 0 };              /* xi：探针 x×10 */
var S1 = { z: [3, 4] };
var S1_PRESETS = [ [3, 4], [-4, 0], [0, 3],
  [Math.cos(50 * Math.PI / 180), Math.sin(50 * Math.PI / 180)] ];
var S2 = { z1: [2, 1], z2: [1, 2] };
var S3 = { start: [1, 0], cur: [1, 0], trail: [[1, 0]], k: 0 };
var S3_STARTS = [ [1, 0], [3, 2] ];
var S4 = { z1: [2, 1], z2: [1, 1] };
var S4_PRESETS = [ [2, 0],
  [Math.cos(60 * Math.PI / 180), Math.sin(60 * Math.PI / 180)], [1, 1] ];
var Q1_OPTS = [ [-3, -2], [-3, 2], [3, -2], [3, 2] ];   /* 正解由 quizQ1Answer() 实算比对 */
/* S2：选项顺序在加载时随机洗牌一次，防「正解恒居首位」的位置规律；判定与诊断均按坐标比对、与位置无关 */
for (var qi = Q1_OPTS.length - 1; qi > 0; qi--){
  var qj = Math.floor(Math.random() * (qi + 1)), qt = Q1_OPTS[qi];
  Q1_OPTS[qi] = Q1_OPTS[qj]; Q1_OPTS[qj] = qt;
}
var Q1 = { picked: [], done: false };
var Q2 = { picked: [], done: false };                    /* 正解 = 两模相等（实算比对） */
var Q3 = { picked: null, done: false };                  /* 正解 = 「错」（模之积，实算验） */

/* ================= 第 0 步：数轴不够用 ================= */
var s0Anim = null;
function renderS0(){
  var cv = regCanvas($('s0-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var x = S0.xi / 10;
  $('s0-x-val').textContent = 'x = ' + fmtC(x);
  if (!S0.open){
    var g = plotGeom(cv, [-4.4, 4.4], [-2.6, 10.4]);
    geoms.s0 = g;
    drawGrid(ctx, g, { lx: 1, xName: t('cAxisX') });
    drawLine2(ctx, g, -4.3, -1, 4.3, -1, COL.red, 1.6, [7, 5]);
    cText(ctx, t('cNeg'), g.X(4.3), g.Y(-1) - 13, COL.red, 12, 'right');
    drawCurve(ctx, g, function(v){ return v * v; }, -3.18, 3.18, COL.cyan, 2.6);
    cText(ctx, t('cSq'), g.X(-3.18), g.Y(10.1) + 2, COL.cyan, 12.5, 'left');
    drawLine2(ctx, g, x, 0, x, x * x, COL.orange, 1.6, [4, 4]);
    drawDot(ctx, g, x, 0, COL.orange, 6.5, true);
    drawDot(ctx, g, x, x * x, COL.orange, 6, false);
    setRO('s0-ro', t('s0ro', { x: fmtC(x), sq: fmtC(x * x) }));
  } else {
    var g2 = plotGeom(cv, [-4.4, 4.4], [-4.4, 4.4]);
    geoms.s0 = g2;
    drawGrid(ctx, g2, { gx: 1, gy: 1, lx: 1, ly: 1 });
    ctx.save(); ctx.globalAlpha = Math.max(0.15, S0.fade);
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(g2.X(0), g2.Y(g2.yr[0])); ctx.lineTo(g2.X(0), g2.Y(g2.yr[1])); ctx.stroke();
    drawDot(ctx, g2, 0, 1, COL.orange, 8, true);
    cTextTag(ctx, t('cClaim'), g2.X(0) + 12, g2.Y(1) - 16, COL.orange);
    cText(ctx, 'i', g2.X(0) + 10, g2.Y(1) + 14, COL.orange, 14, 'left', true);
    ctx.restore();
    drawDot(ctx, g2, 1, 0, COL.cyan, 5.5, false);
    cText(ctx, '1', g2.X(1), g2.Y(0) + 16, COL.cyan, 12.5, 'center');
    cText(ctx, t('cRe'), g2.X(4.35), g2.Y(0) - 12, COL.mut, 12, 'right');
    cText(ctx, t('cIm'), g2.X(0) + 8, g2.Y(4.35), COL.orange, 12, 'left');
    setRO('s0-ro', t('s0roB'));
  }
  var b = $('s0-open');
  var want = S0.open ? t('s0close') : t('s0open');
  if (b.textContent !== want) b.textContent = want;
  b.classList.toggle('primary', !S0.open);
}
function s0ToggleOpen(){
  S0.open = !S0.open;
  if (s0Anim){ clearInterval(s0Anim); s0Anim = null; }
  if (S0.open && S0.fade < 1){
    s0Anim = setInterval(function(){
      S0.fade = Math.min(1, S0.fade + 0.12);
      renderS0();
      if (S0.fade >= 1){ clearInterval(s0Anim); s0Anim = null; }
    }, 40);
  }
  renderS0();
}

/* ================= 第 1 步：复数是平面上的点 ================= */
function renderS1(){
  var cv = regCanvas($('s1-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-5.3, 5.3], [-5.3, 5.3]);
  geoms.s1 = g;
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1, xName: t('cRe'), yName: t('cIm') });
  drawUnitCircle(ctx, g);
  var z = S1.z, a = z[0], b = z[1];
  var m = cMod(z), ang = cArgDeg(z);
  if (m > 0.01){
    drawLine2(ctx, g, 0, 0, a, 0, COL.mut, 1.4, [4, 4]);
    drawLine2(ctx, g, a, 0, a, b, COL.mut, 1.4, [4, 4]);
    if (ang !== null && Math.abs(ang) > 0.5 && Math.abs(ang) < 179.5){
      var rA = clamp(m * 0.38, 0.35, 1.25);
      drawArcPoly(ctx, g, rA, 0, ang, COL.orange, 2);
      var mid = ang / 2 * Math.PI / 180;
      cText(ctx, 'θ', g.X((rA + 0.42) * Math.cos(mid)), g.Y((rA + 0.42) * Math.sin(mid)), COL.orange, 13.5, 'center', true);
    }
  }
  drawArrow(ctx, g, z, COL.cyan, 2.8);
  drawDot(ctx, g, a, b, COL.cyan, 7, true);
  cTextTag(ctx, 'z = ' + fmtZ(z), g.X(a) + (a >= 0 ? 10 : -10), g.Y(b) - 16, COL.cyan);
  document.querySelectorAll('.s1pre').forEach(function(btn, i){
    var p = S1_PRESETS[i];
    btn.classList.toggle('active', Math.abs(p[0] - a) < 1e-9 && Math.abs(p[1] - b) < 1e-9);
  });
  if (ang === null){
    setRO('s1-ro', t('s1roOrigin'));
  } else {
    setRO('s1-ro', t('s1ro', { z: fmtZ(z), a: fmtC(a), b: fmtC(b), m: fmtC(m), ang: fmtAng(ang) }));
  }
  syncCoordinateEditor('s1');
}

/* ================= 第 2 步：加法 = 平移 ================= */
function renderS2(){
  var cv = regCanvas($('s2-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-8.6, 8.6], [-8.6, 8.6]);
  geoms.s2 = g;
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 2, ly: 2, xName: t('cRe'), yName: t('cIm') });
  var z1 = S2.z1, z2 = S2.z2, sum = cAdd(z1, z2);
  /* 平行四边形：z1→sum 与 z2→sum 两边虚线 */
  drawLine2(ctx, g, z1[0], z1[1], sum[0], sum[1], COL.mut, 1.5, [5, 4]);
  drawLine2(ctx, g, z2[0], z2[1], sum[0], sum[1], COL.mut, 1.5, [5, 4]);
  drawArrow(ctx, g, z1, COL.cyan, 2.4);
  drawArrow(ctx, g, z2, COL.orange, 2.4);
  drawArrow(ctx, g, sum, COL.green, 3);
  drawDot(ctx, g, z1[0], z1[1], COL.cyan, 6.5, true);
  drawDot(ctx, g, z2[0], z2[1], COL.orange, 6.5, true);
  drawDot(ctx, g, sum[0], sum[1], COL.green, 7, true);
  cTextTag(ctx, 'z₁', g.X(z1[0]) + 8, g.Y(z1[1]) - 14, COL.cyan);
  cTextTag(ctx, 'z₂', g.X(z2[0]) + 8, g.Y(z2[1]) - 14, COL.orange);
  cTextTag(ctx, 'z₁ + z₂', g.X(sum[0]) + 8, g.Y(sum[1]) - 14, COL.green);
  setRO('s2-ro-sum', t('s2roSum', { z1: fmtZ(z1), z2: fmtZ(z2), sum: fmtZ(sum) }));
  setRO('s2-ro-re', t('s2roRe', { a1: fmtC(z1[0]), a2: fmtC(z2[0]), s: fmtC(sum[0]) }));
  setRO('s2-ro-im', t('s2roIm', { b1: fmtC(z1[1]), b2: fmtC(z2[1]), s: fmtC(sum[1]) }));
  syncCoordinateEditor('s2');
}

/* ================= 第 3 步：乘 i：转 90° ================= */
function renderS3(){
  var cv = regCanvas($('s3-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-4.7, 4.7], [-4.7, 4.7]);
  geoms.s3 = g;
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 1, ly: 1, xName: t('cRe'), yName: t('cIm') });
  drawUnitCircle(ctx, g);
  var cur = S3.cur, m = cMod(cur), ang = cArgDeg(cur);
  /* 轨迹弧：每一段乘 i 的 90° 圆弧（同源：半径 = 当前模、角度由各落点辐角实算） */
  for (var i = 0; i + 1 < S3.trail.length; i++){
    var p0 = S3.trail[i], p1 = S3.trail[i + 1];
    var a0 = cArgDeg(p0), r = cMod(p0);
    if (a0 === null || r < 0.01) continue;
    drawArcPoly(ctx, g, r, a0, a0 + 90, COL.orange, 2);
    drawDot(ctx, g, p1[0], p1[1], COL.orange, 5.5, false);
  }
  /* 落点编号：每个位置标最近一次落点的序号（0 = 起点） */
  var seen = {};
  S3.trail.forEach(function(p, idx){ seen[p[0].toFixed(3) + ',' + p[1].toFixed(3)] = idx; });
  Object.keys(seen).forEach(function(key){
    var parts = key.split(','), px = parseFloat(parts[0]), py = parseFloat(parts[1]);
    if (Math.hypot(px - cur[0], py - cur[1]) < 1e-9) return;   /* 当前点单独画 */
    cText(ctx, String(seen[key]), g.X(px) + 9, g.Y(py) + 12, COL.mut, 12, 'left', true);
  });
  if (S3.trail.length > 1) drawDot(ctx, g, S3.start[0], S3.start[1], COL.mut, 5.5, false);
  drawArrow(ctx, g, cur, COL.cyan, 2.8);
  drawDot(ctx, g, cur[0], cur[1], COL.cyan, 7, true);
  cTextTag(ctx, 'z = ' + fmtZ(cur), g.X(cur[0]) + 10, g.Y(cur[1]) - 16, COL.cyan);
  cText(ctx, String(S3.k), g.X(cur[0]) + 9, g.Y(cur[1]) + 14, COL.ink, 12.5, 'left', true);
  document.querySelectorAll('.s3pre').forEach(function(btn, i){
    var p = S3_STARTS[i];
    btn.classList.toggle('active', p[0] === S3.start[0] && p[1] === S3.start[1]);
  });
  $('s3-prog').textContent = t('s3prog', { k: S3.k });
  setRO('s3-ro', t('s3ro', { z: fmtZ(cur), m: fmtC(m), ang: fmtAng(ang) }));
  setRO('s3-note', (S3.k > 0 && S3.k % 4 === 0) ? t('s3back') : '');
  setRO('s3-pow', t('s3pow', {
    p1: fmtZ(ipow(1)), p2: fmtZ(ipow(2)), p3: fmtZ(ipow(3)), p4: fmtZ(ipow(4))
  }));
}
function s3Reset(start){
  S3.start = [start[0], start[1]];
  S3.cur = [start[0], start[1]];
  S3.trail = [[start[0], start[1]]];
  S3.k = 0;
}

/* ================= 第 4 步：一般乘法对账台 ================= */
function renderS4(){
  var cv = regCanvas($('s4-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-7.4, 7.4], [-7.4, 7.4]);
  geoms.s4 = g;
  drawGrid(ctx, g, { gx: 1, gy: 1, lx: 2, ly: 2, xName: t('cRe'), yName: t('cIm') });
  drawUnitCircle(ctx, g);
  var z1 = S4.z1, z2 = S4.z2, prod = cMul(z1, z2);
  drawArrow(ctx, g, z1, COL.cyan, 2.4);
  drawArrow(ctx, g, z2, COL.orange, 2.4);
  drawArrow(ctx, g, prod, COL.green, 3);
  drawDot(ctx, g, z1[0], z1[1], COL.cyan, 6.5, true);
  drawDot(ctx, g, z2[0], z2[1], COL.orange, 6.5, true);
  drawDot(ctx, g, prod[0], prod[1], COL.green, 7, true);
  cTextTag(ctx, 'z₁', g.X(z1[0]) + 8, g.Y(z1[1]) - 14, COL.cyan);
  cTextTag(ctx, 'z₂', g.X(z2[0]) + 8, g.Y(z2[1]) + 16, COL.orange);
  cTextTag(ctx, 'z₁·z₂', g.X(prod[0]) + 8, g.Y(prod[1]) - 14, COL.green);
  document.querySelectorAll('.s4pre').forEach(function(btn, i){
    var p = S4_PRESETS[i];
    btn.classList.toggle('active', Math.abs(p[0] - z2[0]) < 1e-9 && Math.abs(p[1] - z2[1]) < 1e-9);
  });
  var m1 = cMod(z1), m2 = cMod(z2), mp = cMod(prod);
  var a1 = cArgDeg(z1), a2 = cArgDeg(z2), ap = cArgDeg(prod);
  setRO('s4-ro-prod', t('s4roProd', { z1: fmtZ(z1), z2: fmtZ(z2), prod: fmtZ(prod) }));
  setRO('s4-ro-mod', t('s4roMod', { a: fmtC(m1), b: fmtC(m2), p: fmtC(m1 * m2), q: fmtC(mp) }));
  if (a1 === null || a2 === null || ap === null){
    setRO('s4-ro-arg', t('s4roArgOrigin'));
  } else {
    setRO('s4-ro-arg', t('s4roArg', {
      a: fmtAng(a1), b: fmtAng(a2), s: fmtAng(normAng(a1 + a2)), t: fmtAng(ap)
    }));
  }
  setRO('s4-ro-alg', t('s4roAlg', {
    a1: fmtFac(z1[0]), b1: fmtFac(z1[1]), a2: fmtFac(z2[0]), b2: fmtFac(z2[1]),
    alg: fmtZ(prod)
  }));
  syncCoordinateEditor('s4');
}

/* ================= 第 5 步：自测 ================= */
function q3Nums(){
  var z = QUIZ.q3z;
  var prod = cMod(z) * cMod(z);          /* 两模之积 */
  var val = cMod(cMul(z, z));            /* 乘积的模 |(1+i)²| = |2i| */
  var sum = cMod(z) + cMod(z);           /* 两模之和（错误说法的值） */
  return { prod: fmtC(prod), val: fmtC(val), sum: fmtC(sum) };
}
function renderQ1(){
  var ans = quizQ1Answer();
  Q1_OPTS.forEach(function(v, i){
    var b = $('s5q1-o' + i);
    b.textContent = fmtZ(v);
    var isAns = v[0] === ans[0] && v[1] === ans[1];
    b.classList.toggle('correct', Q1.done && isAns);
    b.classList.toggle('wrong', Q1.picked.indexOf(i) >= 0);
    b.disabled = Q1.done || Q1.picked.indexOf(i) >= 0;
  });
  if (Q1.done) setRO('s5q1-fb', t('q1ok', { z: fmtZ(ans) }));
  else if (Q1.picked.length){
    var last = Q1.picked[Q1.picked.length - 1], v = Q1_OPTS[last];
    var key = (v[0] === -3 && v[1] === 2) ? 'q1noA' : (v[0] === 3 && v[1] === -2) ? 'q1noB' : 'q1noC';
    setRO('s5q1-fb', t(key));
  } else setRO('s5q1-fb', '');
}
function renderQ2(){
  var ma = cMod(QUIZ.q2a), mb = cMod(QUIZ.q2b), equal = Math.abs(ma - mb) < 1e-12;
  [0, 1, 2].forEach(function(i){
    var b = $('s5q2-o' + i);
    b.classList.toggle('correct', Q2.done && i === 2 && equal);
    b.classList.toggle('wrong', Q2.picked.indexOf(i) >= 0);
    b.disabled = Q2.done || Q2.picked.indexOf(i) >= 0;
  });
  if (Q2.done) setRO('s5q2-fb', t('q2ok', { a: fmtC(ma), b: fmtC(mb) }));
  else if (Q2.picked.length) setRO('s5q2-fb', t('q2no', { a: fmtC(ma), b: fmtC(mb) }));
  else setRO('s5q2-fb', '');
}
function renderQ3(){
  var bt = $('s5q3-true'), bf = $('s5q3-false');
  bt.classList.toggle('wrong', Q3.picked === 'true');
  bt.disabled = Q3.done || Q3.picked === 'true';
  bf.classList.toggle('correct', Q3.done);
  bf.disabled = Q3.done;
  var n = q3Nums();
  if (Q3.done) setRO('s5q3-fb', t('q3ok', n));
  else if (Q3.picked === 'true') setRO('s5q3-fb', t('q3no', n));
  else setRO('s5q3-fb', '');
}
function renderQHint(){
  /* 门控：三题全对前不把收口提示渲染进 DOM（不是 CSS 隐藏） */
  var all = Q1.done && Q2.done && Q3.done;
  setRO('s5-hint', all ? t('s5hint') : '');
}

function renderAll(){
  renderS0(); renderS1(); renderS2(); renderS3(); renderS4();
  renderQ1(); renderQ2(); renderQ3(); renderQHint();
}

/* ================= 事件 ================= */
function dragXY(cvId, geomKey, cb){
  var cv = $(cvId), drag = false;
  function pos(e){
    var r = cv.getBoundingClientRect();
    var g = geoms[geomKey];
    if (!g) return null;
    return [g.invX((e.clientX - r.left) * cv.width / r.width),
            g.invY((e.clientY - r.top) * cv.height / r.height)];
  }
  cv.addEventListener('pointerdown', function(e){
    var v = pos(e); if (v === null) return;
    drag = true;
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件无活动指针，忽略 */ }
    cb(v);
  });
  cv.addEventListener('pointermove', function(e){ if (drag) { var v = pos(e); if (v !== null) cb(v); } });
  cv.addEventListener('pointerup', function(){ drag = false; });
  cv.addEventListener('pointercancel', function(){ drag = false; });
}
/* 双点画布：按下时抓取离指针更近的那一个点 */
function dragTwo(cvId, geomKey, getA, getB, cb){
  var which = null;
  dragXY(cvId, geomKey, function(v){
    if (which === null){
      var a = getA(), b = getB();
      var da = Math.hypot(v[0] - a[0], v[1] - a[1]);
      var db = Math.hypot(v[0] - b[0], v[1] - b[1]);
      which = da <= db ? 'a' : 'b';
    }
    cb(which, v);
  });
  var cv = $(cvId);
  ['pointerup', 'pointercancel'].forEach(function(ev){
    cv.addEventListener(ev, function(){ which = null; });
  });
}
function clampBox(v, lim){
  return [clamp(snap1(v[0]), -lim, lim), clamp(snap1(v[1]), -lim, lim)];
}
function clampDisc(v, rMax){
  var z = [snap1(v[0]), snap1(v[1])], m = cMod(z);
  if (m > rMax){ var s = rMax / m; z = [z[0] * s, z[1] * s]; }
  return z;
}

/* Coordinate entry adapts the existing point states and drag constraints. */
function prepareCoordinate(v, current, limit, disk){
  var bad = [0,1].filter(function(i){ return !Number.isFinite(v[i]); });
  if (bad.length) return {ok:false, key:'editFinite', bad:bad};
  bad = [0,1].filter(function(i){ return !Number.isFinite(v[i] * 10); });
  if (bad.length || !Number.isFinite(Math.hypot(v[0],v[1])))
    return {ok:false, key:'editRange', bad:bad.length ? bad : [0,1]};
  // Exact presets and existing projected points must survive a no-op Apply.
  if (v[0] === current[0] && v[1] === current[1])
    return {ok:true, value:current.slice(), key:'editUnchanged'};
  var z = disk ? clampDisc(v,limit) : clampBox(v,limit);
  return {ok:true, value:z, key:(z[0] !== v[0] || z[1] !== v[1]) ? 'editAdjusted' : 'editApplied'};
}
var coordinateEditors = {
  s1:{state:S1,limit:5,disk:false,render:renderS1},
  s2:{state:S2,limit:4.2,disk:false,render:renderS2},
  s4:{state:S4,limit:2.6,disk:true,render:renderS4}
};
// Transient validation copy only; drafts stay in existing DOM, never storage.
var coordinateFeedback = {s1:null,s2:null,s4:null};
function coordinateKey(stage){ return $(stage+'-editor').dataset.coordinateTarget || 'z'; }
function coordinateName(key){ return key==='z1' ? 'z₁' : key==='z2' ? 'z₂' : 'z'; }
function coordinateStatus(stage){
  var box=$(stage+'-edit-status'), feedback=coordinateFeedback[stage];
  if(box) box.textContent=feedback ? t(feedback.key,feedback.params) : '';
}
function resetCoordinateEditor(stage,target){
  var form=$(stage+'-editor'); if(!form)return;
  if(target)form.dataset.coordinateTarget=target;
  delete form.dataset.dirty;
  coordinateFeedback[stage]=null;
  [stage+'-real',stage+'-imag'].forEach(function(id){ $(id).removeAttribute('aria-invalid'); });
}
function syncCoordinateEditor(stage){
  var form=$(stage+'-editor');if(!form)return;
  var key=coordinateKey(stage),point=coordinateEditors[stage].state[key];
  form.querySelectorAll('[data-coordinate-key]').forEach(function(button){var active=button.dataset.coordinateKey===key;button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);});
  form.querySelectorAll('[data-edit-target-name]').forEach(function(el){el.textContent=coordinateName(key);});
  if(!form.dataset.dirty){$(stage+'-real').value=String(point[0]);$(stage+'-imag').value=String(point[1]);}
  coordinateStatus(stage);
}
function initCoordinateEditors(){
  Object.keys(coordinateEditors).forEach(function(stage){
    var form=$(stage+'-editor'), fields=[$(stage+'-real'),$(stage+'-imag')];
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var config=coordinateEditors[stage],key=coordinateKey(stage);
      var result=prepareCoordinate(fields.map(function(input){return input.valueAsNumber;}),config.state[key],config.limit,config.disk);
      if(!result.ok){
        fields.forEach(function(input,i){input.setAttribute('aria-invalid',result.bad.indexOf(i)>=0 ? 'true' : 'false');});
        coordinateFeedback[stage]={key:result.key};coordinateStatus(stage);fields[result.bad[0]].focus();return;
      }
      resetCoordinateEditor(stage);
      config.state[key]=result.value;
      coordinateFeedback[stage]={key:result.key,params:{target:coordinateName(key),z:fmtZ(result.value)}};
      config.render();
    });
    fields.forEach(function(input){
      function edited(){
        form.dataset.dirty='true';
        fields.forEach(function(field){field.removeAttribute('aria-invalid');});
        coordinateFeedback[stage]=null;coordinateStatus(stage);
      }
      input.addEventListener('input',edited);
      input.addEventListener('keydown',function(e){
        if(e.key!=='ArrowUp' && e.key!=='ArrowDown')return;
        e.preventDefault();
        var n=input.valueAsNumber, next=n+(e.key==='ArrowUp' ? 0.1 : -0.1);
        var rounded=Number.isFinite(next) ? Number(next.toPrecision(15)) : NaN;
        var key=!Number.isFinite(n) ? 'editFinite' : (!Number.isFinite(rounded)||Math.abs((rounded-n)-(e.key==='ArrowUp' ? 0.1 : -0.1))>1e-9) ? 'editStepRange' : null;
        if(key){
          input.setAttribute('aria-invalid','true');coordinateFeedback[stage]={key:key};coordinateStatus(stage);return;
        }
        input.value=String(rounded);edited();
      });
    });
    form.querySelectorAll('[data-coordinate-key]').forEach(function(button){
      button.addEventListener('click',function(){if(coordinateKey(stage)===button.dataset.coordinateKey)return;resetCoordinateEditor(stage,button.dataset.coordinateKey);syncCoordinateEditor(stage);});
    });
  });
}

function init(){
  initCoordinateEditors();
  /* 第 0 步 */
  $('s0-x').addEventListener('input', function(e){ S0.xi = +e.target.value; renderS0(); });
  $('s0-open').addEventListener('click', s0ToggleOpen);
  $('s0-start').addEventListener('click', function(){
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  /* 第 1 步 */
  document.querySelectorAll('.s1pre').forEach(function(btn){
    btn.addEventListener('click', function(){
      var p = S1_PRESETS[+btn.getAttribute('data-pre')];
      resetCoordinateEditor('s1');
      S1.z = [p[0], p[1]];
      renderS1();
    });
  });
  dragXY('s1-canvas', 's1', function(v){
    resetCoordinateEditor('s1');
    S1.z = clampBox(v, 5);
    renderS1();
  });
  /* 第 2 步 */
  dragTwo('s2-canvas', 's2',
    function(){ return S2.z1; }, function(){ return S2.z2; },
    function(which, v){
      resetCoordinateEditor('s2',which==='a' ? 'z1' : 'z2');
      var z = clampBox(v, 4.2);
      if (which === 'a') S2.z1 = z; else S2.z2 = z;
      renderS2();
    });
  /* 第 3 步 */
  document.querySelectorAll('.s3pre').forEach(function(btn){
    btn.addEventListener('click', function(){
      s3Reset(S3_STARTS[+btn.getAttribute('data-pre')]);
      renderS3();
    });
  });
  $('s3-mul').addEventListener('click', function(){
    S3.cur = cMulI(S3.cur);
    S3.trail.push([S3.cur[0], S3.cur[1]]);
    S3.k++;
    renderS3();
  });
  $('s3-reset').addEventListener('click', function(){
    s3Reset(S3.start);
    renderS3();
  });
  /* 第 4 步 */
  document.querySelectorAll('.s4pre').forEach(function(btn){
    btn.addEventListener('click', function(){
      var p = S4_PRESETS[+btn.getAttribute('data-pre')];
      resetCoordinateEditor('s4','z2');
      S4.z2 = [p[0], p[1]];
      renderS4();
    });
  });
  dragTwo('s4-canvas', 's4',
    function(){ return S4.z1; }, function(){ return S4.z2; },
    function(which, v){
      resetCoordinateEditor('s4',which==='a' ? 'z1' : 'z2');
      var z = clampDisc(v, 2.6);
      if (which === 'a') S4.z1 = z; else S4.z2 = z;
      renderS4();
    });
  /* 第 5 步 */
  Q1_OPTS.forEach(function(v, i){
    $('s5q1-o' + i).addEventListener('click', function(){
      if (Q1.done || Q1.picked.indexOf(i) >= 0) return;
      var ans = quizQ1Answer();
      if (v[0] === ans[0] && v[1] === ans[1]) Q1.done = true; else Q1.picked.push(i);
      renderQ1(); renderQHint();
    });
  });
  [0, 1, 2].forEach(function(i){
    $('s5q2-o' + i).addEventListener('click', function(){
      if (Q2.done || Q2.picked.indexOf(i) >= 0) return;
      var equal = Math.abs(cMod(QUIZ.q2a) - cMod(QUIZ.q2b)) < 1e-12;
      if (i === 2 && equal) Q2.done = true; else Q2.picked.push(i);
      renderQ2(); renderQHint();
    });
  });
  $('s5q3-true').addEventListener('click', function(){
    if (Q3.done || Q3.picked === 'true') return;
    Q3.picked = 'true'; renderQ3(); renderQHint();
  });
  $('s5q3-false').addEventListener('click', function(){
    if (Q3.done) return;
    Q3.done = true; renderQ3(); renderQHint();
  });
  renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);

/* 供自查 / 评审对账：纯函数 + 实时状态 + 画布几何 */
window.CPLX = {
  cAdd: cAdd, cMul: cMul, cMulI: cMulI, cMod: cMod, cArgDeg: cArgDeg, normAng: normAng,
  mulPolar: mulPolar, ipow: ipow, fmtC: fmtC, fmtAng: fmtAng, fmtZ: fmtZ,
  quizQ1Answer: quizQ1Answer, QUIZ: QUIZ,
  state: { S0: S0, S1: S1, S2: S2, S3: S3, S4: S4, Q1: Q1, Q2: Q2, Q3: Q3 },
  geoms: geoms
};
