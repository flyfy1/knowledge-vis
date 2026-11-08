'use strict';
/* derivative 页 · 红线与范式照 parabola 页：
   · 全部数值由函数值实算：平均速度 = (b²−a²)/(b−a) 有理数精确；割线斜率 = ((x+Δx)²−x²)/Δx
     精确等于 2x+Δx（有理数）；导数页的「实测」用数值差商 ((x+Δ)²−x²)/Δ（Δ=0.001）浮点实算，
     读数一律「测得 ≈」口径并与解析值 2x 对账，绝不把数值逼近写成精确等号；
     x³ 自测题斜率 ((1+Δx)³−1)/Δx 浮点实算（Δx=0.01 → 3.0301）。
   · 几何（割线/切线端点、三角形投影）全部由函数值算出，读数与画布同源。
   · 状态一致性：动画中改参立即停动画并按新状态重算；答题后改 Δx 档只刷新读数、
     不清判定；切语言只换文案、底层 state 对象不变。 */

/* ================= PURE-BEGIN ================= */
function igcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var m = a % b; a = b; b = m; } return a || 1; }
function rat(n, d){
  if (d === undefined) d = 1;
  if (d < 0){ n = -n; d = -d; }
  var g = igcd(n, d);
  return { n: n / g, d: d / g };
}
function rAdd(a, b){ return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
function rSub(a, b){ return rat(a.n * b.d - b.n * a.d, a.d * b.d); }
function rMul(a, b){ return rat(a.n * b.n, a.d * b.d); }
function rDiv(a, b){ return rat(a.n * b.d, a.d * b.n); }
function rEq(a, b){ return a.n === b.n && a.d === b.d; }
function rVal(r){ return r.n / r.d; }
function fmtInt(n){ return n < 0 ? '−' + Math.abs(n) : String(n); }
function fmtRat(r){
  if (r.d === 1) return fmtInt(r.n);
  var sign = r.n < 0 ? '−' : '';
  var an = Math.abs(r.n);
  var whole = Math.floor(an / r.d), rem = an % r.d;
  var frac = '';
  if (rem === 1 && r.d === 2) frac = '½';
  else if (rem === 1 && r.d === 4) frac = '¼';
  else if (rem === 3 && r.d === 4) frac = '¾';
  else return sign + an + '/' + r.d;
  return whole > 0 ? sign + whole + frac : sign + frac;
}
function fmtDec(r){
  /* 分母整除 10^k（k ≤ 4）的有理数 → 精确小数：全页坐标/读数统一小数口径，
     不再出现「0.99 与 9801/10000」这类小数/分数混排；其余分母才退回分数 */
  var pows = [1, 10, 100, 1000, 10000];
  for (var k = 0; k < pows.length; k++){
    if (pows[k] % r.d !== 0) continue;
    var scaled = r.n * (pows[k] / r.d);
    var sign = scaled < 0 ? '−' : '';
    var a = Math.abs(scaled), p = pows[k];
    var intPart = Math.floor(a / p), fracPart = a % p;
    if (fracPart === 0) return sign + intPart;
    var fs = String(fracPart);
    while (fs.length < k) fs = '0' + fs;
    fs = fs.replace(/0+$/, '');
    return sign + intPart + '.' + fs;
  }
  return fmtRat(r);
}
function fmtMeas(v){ /* 数值实测读数：3 位小数（尾数是 Δ 的尾巴，原样显示） */
  var s = Math.abs(v).toFixed(3);
  return (v < 0 ? '−' : '') + s;
}
function fmtTrim4(v){ /* 浮点量 → 至多 4 位小数、去尾零 */
  var s = v.toFixed(4);
  if (s.indexOf('.') >= 0){ s = s.replace(/0+$/, '').replace(/\.$/, ''); }
  return (v < 0 && s.charAt(0) !== '-' ? '−' + s : s.replace('-', '−'));
}
/* s = t²：区间 [a, b] 上的平均变化率（平均速度），有理数精确 */
function sqRat(x){ return rMul(x, x); }
function avgRateSq(a, b){ return rDiv(rSub(sqRat(b), sqRat(a)), rSub(b, a)); }
/* y = x² 在 x 处、步长 dx 的割线斜率，精确 = 2x + dx */
function secantSq(x, dx){ return rDiv(rSub(sqRat(rAdd(x, dx)), sqRat(x)), dx); }
function derivSq(x){ return rMul(rat(2, 1), x); }
/* 数值差商（浮点实测）：((x+Δ)²−x²)/Δ */
function numericDerivSq(x, delta){
  var xp = x + delta;
  return (xp * xp - x * x) / delta;
}
/* y = x³ 在 x = 1 处、步长 dx 的割线斜率（浮点实测） */
function cubeSlopeAt1(dx){
  var xp = 1 + dx;
  return (xp * xp * xp - 1) / dx;
}
/* ================= PURE-END ================= */

/* ================= 画布基础设施（照 parabola） ================= */
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
function regCanvas(cv){ _canvases.push(cv); return cv; }
function allCanvases(){ return _canvases; }
function onRefit(fn){ _refitFns.push(fn); }
(function(){
  var pending = false;
  window.addEventListener('resize', function(){
    if (pending) return;
    pending = true;
    requestAnimationFrame(function(){
      pending = false;
      allCanvases().forEach(fitCanvas);
      _refitFns.forEach(function(fn){ fn(); });
    });
  });
})();

/* ============ 步骤导航高亮（照 parabola） ============ */
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

/* 读数去重：值没变不写 DOM（照 parabola） */
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

function plotGeom(cv, xr, yr, equal){
  var W = cv.width, H = cv.height;
  var left, right, top, bottom, X, Y;
  if (equal){
    var m = 6;
    var u = Math.min((W - 2 * m) / (xr[1] - xr[0]), (H - 2 * m) / (yr[1] - yr[0]));
    var pw = (xr[1] - xr[0]) * u, ph = (yr[1] - yr[0]) * u;
    var ox = (W - pw) / 2, oy = (H - ph) / 2;
    X = function(x){ return ox + (x - xr[0]) * u; };
    Y = function(y){ return oy + (yr[1] - y) * u; };
  } else {
    left = 42; right = W - 12; top = 12; bottom = H - 28;
    X = function(x){ return left + (x - xr[0]) / (xr[1] - xr[0]) * (right - left); };
    Y = function(y){ return bottom - (y - yr[0]) / (yr[1] - yr[0]) * (bottom - top); };
  }
  var xBasePx = X(xr[0]), xUnitPx = X(1) - X(0);
  return { W: W, H: H, xr: xr, yr: yr, X: X, Y: Y, u: equal ? u : null,
           invX: function(px){ return xr[0] + (px - xBasePx) / xUnitPx; } };
}
function drawGrid(ctx, g, opt){
  opt = opt || {};
  ctx.lineWidth = 1;
  var x, y;
  if (opt.gx) for (x = Math.ceil(g.xr[0] / opt.gx) * opt.gx; x <= g.xr[1]; x += opt.gx){
    if (Math.abs(x) < 1e-9) continue;
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(g.X(x), g.Y(g.yr[0])); ctx.lineTo(g.X(x), g.Y(g.yr[1])); ctx.stroke();
  }
  if (opt.gy) for (y = Math.ceil(g.yr[0] / opt.gy) * opt.gy; y <= g.yr[1]; y += opt.gy){
    if (Math.abs(y) < 1e-9) continue;
    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(g.X(g.xr[0]), g.Y(y)); ctx.lineTo(g.X(g.xr[1]), g.Y(y)); ctx.stroke();
  }
  ctx.strokeStyle = COL.axis; ctx.lineWidth = 1.4;
  if (g.yr[0] < 0 && g.yr[1] > 0){ ctx.beginPath(); ctx.moveTo(g.X(g.xr[0]), g.Y(0)); ctx.lineTo(g.X(g.xr[1]), g.Y(0)); ctx.stroke(); }
  if (g.xr[0] < 0 && g.xr[1] > 0){ ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(g.yr[0])); ctx.lineTo(g.X(0), g.Y(g.yr[1])); ctx.stroke(); }
  ctx.fillStyle = COL.mut; ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  if (opt.lx) for (x = Math.ceil(g.xr[0] / opt.lx) * opt.lx; x <= g.xr[1]; x += opt.lx){
    if (Math.abs(x) < 1e-9) continue;
    ctx.fillText(tickTxt((Math.round(x * 100) / 100).toString()), g.X(x), g.Y(0) + 5);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (opt.ly) for (y = Math.ceil(g.yr[0] / opt.ly) * opt.ly; y <= g.yr[1]; y += opt.ly){
    if (Math.abs(y) < 1e-9) continue;
    ctx.fillText(tickTxt((Math.round(y * 100) / 100).toString()), g.X(g.xr[0]) + 4, g.Y(y));
  }
  if (opt.xName){ ctx.textAlign = 'right'; ctx.fillStyle = COL.mut; ctx.fillText(opt.xName, g.X(g.xr[1]) - 2, g.Y(0) - 10); }
  if (opt.yName){ ctx.textAlign = 'left'; ctx.fillStyle = COL.mut; var yTop = (g.yr[1] > 0 && g.yr[0] < 0) ? g.Y(g.yr[1]) + 8 : g.Y(g.yr[1] - (g.yr[1] - g.yr[0]) * 0.06); ctx.fillText(opt.yName, g.X(0) + 6, yTop); }
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
/* 过 (px,py)、斜率 m 的直线段：延伸到绘图区边界 */
function drawSlopeLine(ctx, g, px, py, m, color, width, dash){
  var xa = g.xr[0], xb = g.xr[1];
  drawLine2(ctx, g, xa, py + m * (xa - px), xb, py + m * (xb - px), color, width, dash);
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

/* ================= 状态 ================= */
var geoms = {};
var INTERVALS = [ [rat(1, 1), rat(3, 1)], [rat(1, 1), rat(2, 1)], [rat(1, 1), rat(3, 2)] ];
var S0 = { tp: 10, interval: 0, playing: false };
var S1 = { dx: rat(1, 1), tanSeen: false, lastSign: 1 };
var S2 = { xi: 10, pts: {} };
var S3 = { mode: 'inc', xi: 10, ti: 20 };
var Q1 = { dx: rat(1, 1), picked: [], done: false };
var Q1_OPTS = ['7', '6.1', '6.01', '6'], Q1_ANS = '6';
var Q2 = { dx: 1, picked: [], done: false };
var Q2_OPTS = ['1', '2', '3', '4'], Q2_ANS = '3';
var Q3 = { picked: null, done: false };
var S0_INT_KEYS = ['s0roA', 's0roB', 's0roC'];

/* ================= 第 0 步：s = t² 平均速度 ================= */
var s0Timer = null, s0Token = 0;
function s0StopPlay(){
  s0Token++;
  if (s0Timer){ clearInterval(s0Timer); s0Timer = null; }
  S0.playing = false;
}
function s0SyncPlayBtn(){
  var b = $('s0-play');
  b.textContent = S0.playing ? t('s0pause') : (S0.tp >= 30 ? t('s0replay') : t('s0play'));
  b.classList.toggle('primary', !S0.playing);
}
function renderS0(){
  var cv = regCanvas($('s0-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-0.25, 3.35], [-0.7, 10.2], false);
  geoms.s0 = g;
  drawGrid(ctx, g, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: t('cT'), yName: t('cS') });
  drawCurve(ctx, g, function(x){ return x * x; }, 0, 3, COL.cyan, 2.6);
  /* 区间割线与端点 */
  var iv = INTERVALS[S0.interval], a = iv[0], b = iv[1];
  var av = rVal(a), bv = rVal(b), sa = av * av, sb = bv * bv;
  drawSlopeLine(ctx, g, av, sa, rVal(avgRateSq(a, b)), COL.orange, 2.2, null);
  /* Δt / Δs 虚线投影 */
  drawLine2(ctx, g, av, sa, av, 0, COL.mut, 1.2, [4, 4]);
  drawLine2(ctx, g, bv, sb, bv, 0, COL.mut, 1.2, [4, 4]);
  drawLine2(ctx, g, av, sa, bv, sa, COL.mut, 1.2, [4, 4]);
  cText(ctx, 'Δt = ' + fmtDec(rSub(b, a)), (g.X(av) + g.X(bv)) / 2, g.Y(sa) + 14, COL.mut, 12, 'center');
  cText(ctx, 'Δs', g.X(bv) + 8, (g.Y(sa) + g.Y(sb)) / 2, COL.mut, 12, 'left');
  drawDot(ctx, g, av, sa, COL.orange, 6, true);
  drawDot(ctx, g, bv, sb, COL.orange, 6, true);
  cTextTag(ctx, '(' + fmtDec(a) + ', ' + fmtDec(sqRat(a)) + ')', g.X(av) + 8, g.Y(sa) - 14, COL.orange);
  cTextTag(ctx, '(' + fmtDec(b) + ', ' + fmtDec(sqRat(b)) + ')', g.X(bv) - 64, g.Y(sb) - 14, COL.orange);
  /* 时刻探针 */
  var tp = S0.tp / 10, sp = tp * tp;
  drawLine2(ctx, g, tp, sp, tp, 0, COL.green, 1.2, [4, 4]);
  drawLine2(ctx, g, tp, sp, 0, sp, COL.green, 1.2, [4, 4]);
  drawDot(ctx, g, tp, sp, COL.green, 6.5, true);
  /* 控件与读数 */
  $('s0-t').value = S0.tp;
  $('s0-t-val').textContent = 't = ' + fmtDec(rat(S0.tp, 10)) + ' s';
  ['s0-i0', 's0-i1', 's0-i2'].forEach(function(id, i){ $(id).classList.toggle('active', S0.interval === i); });
  s0SyncPlayBtn();
  var progKey = S0.playing ? 's0prog' : (S0.tp >= 30 ? 's0progDone' : 's0progIdle');
  $('s0-prog').textContent = t(progKey, { t: fmtDec(rat(S0.tp, 10)), n: S0.tp });
  setRO('s0-probe', t('s0probe', { t: fmtDec(rat(S0.tp, 10)), s: fmtDec(rat(S0.tp * S0.tp, 100)) }));
  setRO('s0-ro', t(S0_INT_KEYS[S0.interval], {
    sa: fmtDec(sqRat(a)), sb: fmtDec(sqRat(b)), ds: fmtDec(rSub(sqRat(b), sqRat(a))),
    dt: fmtDec(rSub(b, a)), v: fmtDec(avgRateSq(a, b))
  }));
}
function s0TogglePlay(){
  if (S0.playing){ s0StopPlay(); renderS0(); return; }
  if (S0.tp >= 30) S0.tp = 0;
  S0.playing = true;
  var tk = ++s0Token;
  renderS0();
  s0Timer = setInterval(function(){
    if (tk !== s0Token){ clearInterval(s0Timer); return; }
    S0.tp += 1;
    if (S0.tp >= 30){ S0.tp = 30; s0StopPlay(); }
    renderS0();
  }, 110);
}

/* ================= 第 1 步：割线逼近切线 ================= */
function s1SetDx(r){
  S1.dx = r;
  if (r.n > 0) S1.lastSign = 1; else if (r.n < 0) S1.lastSign = -1;
  if (Math.abs(rVal(r)) <= 0.1 + 1e-12) S1.tanSeen = true;
  var sl = $('s1-dx');
  if (sl) sl.value = Math.round(rVal(r) * 100);
}
function renderS1(){
  var cv = regCanvas($('s1-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-1.1, 2.9], [-1.3, 7.3], false);
  geoms.s1 = g;
  drawGrid(ctx, g, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: 'x', yName: 'y' });
  drawCurve(ctx, g, function(x){ return x * x; }, -1.05, 2.68, COL.cyan, 2.6);
  var dx = S1.dx, qx = rAdd(rat(1, 1), dx), qy = sqRat(qx);
  var qxv = rVal(qx), qyv = rVal(qy), slope = secantSq(rat(1, 1), dx);
  /* 切线（点亮后保持）：y = 2(x−1) + 1 */
  if (S1.tanSeen){
    drawSlopeLine(ctx, g, 1, 1, 2, COL.orange, 2.4, null);
    cTextTag(ctx, t('cTan') + ' y = 2x − 1', g.X(2.45), g.Y(2 * 2.45 - 1) - 14, COL.orange);
  }
  /* 割线（整条直线）与 Δx/Δy 三角 */
  drawSlopeLine(ctx, g, 1, 1, rVal(slope), COL.white, 1.6, null);
  drawLine2(ctx, g, 1, 1, qxv, 1, COL.mut, 1.2, [4, 4]);
  drawLine2(ctx, g, qxv, 1, qxv, qyv, COL.mut, 1.2, [4, 4]);
  cText(ctx, 'Δx', (g.X(1) + g.X(qxv)) / 2, g.Y(1) + 15, COL.mut, 12, 'center');
  cText(ctx, 'Δy', g.X(qxv) + (qxv >= 1 ? 8 : -8), (g.Y(1) + g.Y(qyv)) / 2, COL.mut, 12, qxv >= 1 ? 'left' : 'right');
  cTextTag(ctx, t('cSec'), (g.X(1) + g.X(qxv)) / 2 - 16, g.Y((1 + qyv) / 2) - 16, COL.white);
  drawDot(ctx, g, 1, 1, COL.orange, 6.5, true);
  drawDot(ctx, g, qxv, qyv, COL.cyan, 6.5, true);
  cTextTag(ctx, 'P (1, 1)', g.X(1) - 62, g.Y(1) + 22, COL.orange);
  cTextTag(ctx, 'Q (' + fmtDec(qx) + ', ' + fmtDec(qy) + ')', g.X(qxv) + 8, g.Y(qyv) - 4, COL.cyan);
  /* 控件与读数 */
  $('s1-dx-val').textContent = 'Δx = ' + fmtDec(dx);
  document.querySelectorAll('.dxp').forEach(function(btn){
    var h = Math.round(parseFloat(btn.getAttribute('data-dx')) * 100);
    btn.classList.toggle('active', rEq(dx, rat(h, 100)));
  });
  setRO('s1-ro', t('s1ro', {
    qx: fmtDec(qx), qy: fmtDec(qy), dx: fmtDec(dx),
    dy: fmtDec(rSub(qy, rat(1, 1))), slope: fmtDec(slope)
  }));
  setRO('s1-ro2', S1.tanSeen ? t('s1ro2') : t('s1roIdle'));
}

/* ================= 第 2 步：每点一个导数 ================= */
function s2SetX(xi){
  S2.xi = xi;
  S2.pts[xi] = numericDerivSq(xi / 10, 0.001);
}
function renderS2(){
  var cv = regCanvas($('s2-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-2.4, 2.4], [-0.6, 4.9], false);
  geoms.s2 = g;
  drawGrid(ctx, g, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: 'x', yName: 'y' });
  drawCurve(ctx, g, function(x){ return x * x; }, -2.2, 2.2, COL.cyan, 2.6);
  var xr_ = rat(S2.xi, 10), x = S2.xi / 10, y = x * x, m = 2 * x;
  drawSlopeLine(ctx, g, x, y, m, COL.orange, 2.2, null);
  drawDot(ctx, g, x, y, COL.orange, 6.5, true);
  cTextTag(ctx, 'P (' + fmtDec(xr_) + ', ' + fmtDec(sqRat(xr_)) + ')', g.X(x) + 8, g.Y(y) - 14, COL.orange);
  $('s2-x').value = S2.xi;
  $('s2-x-val').textContent = 'x = ' + fmtDec(xr_);
  var exact = derivSq(xr_);
  setRO('s2-ro', t('s2ro', { x: fmtDec(xr_), meas: fmtMeas(S2.pts[S2.xi]), exact: fmtDec(exact) }));
  /* 收集图 */
  var cv2 = regCanvas($('s2d-canvas')); fitCanvas(cv2);
  var ctx2 = cv2.getContext('2d'); ctx2.clearRect(0, 0, cv2.width, cv2.height);
  var g2 = plotGeom(cv2, [-2.4, 2.4], [-4.9, 4.9], false);
  geoms.s2d = g2;
  drawGrid(ctx2, g2, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: 'x', yName: t('cDerivY') });
  var keys = Object.keys(S2.pts), n = keys.length;
  if (n >= 8){
    drawSlopeLine(ctx2, g2, 0, 0, 2, COL.green, 1.6, [6, 5]);
    /* 标签沿对账线选一端：当前点在右半（正斜率端）时放左下端、否则放右上端，
       避免当前点（橙点）压住标签一角；右上锚点略内收，保证 390 宽下标签不溢出画布 */
    if (x > 0) cTextTag(ctx2, 'y = 2x', g2.X(-1.9), g2.Y(-3.8) - 14, COL.green);
    else cTextTag(ctx2, 'y = 2x', g2.X(1.62), g2.Y(3.24) - 12, COL.green);
  }
  keys.forEach(function(k){
    var xi = parseInt(k, 10);
    drawDot(ctx2, g2, xi / 10, S2.pts[k], COL.cyan, 5, false);
  });
  drawDot(ctx2, g2, x, S2.pts[S2.xi], COL.orange, 6.5, true);
  cText(ctx2, t('cCollT'), g2.X(-2.35), g2.Y(4.55), COL.mut, 12, 'left');
  $('s2-count').textContent = t('s2count', { n: n });
  setRO('s2-ro2', n >= 8 ? t('s2ro2b', { n: n }) : t('s2ro2a'));
}

/* ================= 第 3 步：导数在说什么 ================= */
function renderS3(){
  var cv = regCanvas($('s3-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  ['s3-m1', 's3-m2', 's3-m3'].forEach(function(id, i){
    $(id).classList.toggle('active', S3.mode === ['inc', 'steep', 'vel'][i]);
  });
  $('s3-ctl-x').style.display = S3.mode === 'vel' ? 'none' : '';
  $('s3-ctl-t').style.display = S3.mode === 'vel' ? '' : 'none';
  if (S3.mode === 'vel'){
    var g = plotGeom(cv, [-0.25, 3.35], [-0.7, 10.2], false);
    geoms.s3 = g;
    drawGrid(ctx, g, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: t('cT'), yName: t('cS') });
    drawCurve(ctx, g, function(x){ return x * x; }, 0, 3, COL.cyan, 2.6);
    var tr = rat(S3.ti, 10), tv = S3.ti / 10, sv = tv * tv;
    drawSlopeLine(ctx, g, tv, sv, 2 * tv, COL.orange, 2.2, null);
    drawDot(ctx, g, tv, sv, COL.green, 6.5, true);
    cTextTag(ctx, '(' + fmtDec(tr) + ', ' + fmtDec(sqRat(tr)) + ')', g.X(tv) + 8, g.Y(sv) - 14, COL.green);
    $('s3-t').value = S3.ti;
    $('s3-t-val').textContent = 't = ' + fmtDec(tr) + ' s';
    setRO('s3-ro', t('s3roVel', { t: fmtDec(tr), v: fmtDec(derivSq(tr)) }));
    return;
  }
  var g2 = plotGeom(cv, [-2.6, 2.6], [-0.8, 7.0], false);
  geoms.s3 = g2;
  drawGrid(ctx, g2, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: 'x', yName: 'y' });
  var xr_ = rat(S3.xi, 10), xp = S3.xi / 10, yp = xp * xp, dv = derivSq(xr_);
  if (S3.mode === 'inc'){
    drawCurve(ctx, g2, function(x){ return x * x; }, -2.55, 0, COL.red, 2.6);
    drawCurve(ctx, g2, function(x){ return x * x; }, 0, 2.55, COL.green, 2.6);
    drawDot(ctx, g2, 0, 0, COL.orange, 6, true);
    cTextTag(ctx, '(0, 0)', g2.X(0) + 8, g2.Y(0) + 16, COL.orange);
  } else {
    drawCurve(ctx, g2, function(x){ return x * x; }, -2.55, 2.55, COL.cyan, 2.6);
  }
  drawSlopeLine(ctx, g2, xp, yp, 2 * xp, COL.orange, 2, null);
  if (S3.mode === 'steep'){
    var x2v = xp + (xp <= 1.4 ? 1 : -1);
    var dirSign = xp <= 1.4 ? 1 : -1;
    drawLine2(ctx, g2, xp, yp, xp + dirSign, yp, COL.white, 1.4, [5, 4]);
    drawLine2(ctx, g2, xp + dirSign, yp, xp + dirSign, yp + 2 * xp * dirSign, COL.white, 1.4, [5, 4]);
    cText(ctx, '1', g2.X(xp + dirSign / 2), g2.Y(yp) + 14, COL.white, 12, 'center');
    cText(ctx, fmtDec(dv), g2.X(xp + dirSign) + (dirSign > 0 ? 7 : -7), g2.Y(yp + xp * dirSign), COL.white, 12, dirSign > 0 ? 'left' : 'right');
    void x2v;
  }
  drawDot(ctx, g2, xp, yp, COL.cyan, 6.5, true);
  cTextTag(ctx, 'P (' + fmtDec(xr_) + ', ' + fmtDec(sqRat(xr_)) + ')', g2.X(xp) + 8, g2.Y(yp) - 14, COL.cyan);
  $('s3-x').value = S3.xi;
  $('s3-x-val').textContent = 'x = ' + fmtDec(xr_);
  if (S3.mode === 'inc'){
    var key = S3.xi > 0 ? 's3roIncPos' : (S3.xi < 0 ? 's3roIncNeg' : 's3roIncZero');
    setRO('s3-ro', t(key, { x: fmtDec(xr_), d: fmtDec(dv) }));
  } else {
    setRO('s3-ro', t('s3roSteep', { x: fmtDec(xr_), abs: fmtDec(rVal(dv) < 0 ? rat(-dv.n, dv.d) : dv) }));
  }
}

/* ================= 第 4 步：自测 ================= */
/* 三题全部答对后才渲染收口提示（内含三题答案，未全对时 DOM 里不出现该段，防答案泄露） */
function renderS4Hint(){
  setRO('s4-hint', (Q1.done && Q2.done && Q3.done) ? t('s4hint') : '');
}
function renderQ1(){
  document.querySelectorAll('.q1dx').forEach(function(btn){
    var h = Math.round(parseFloat(btn.getAttribute('data-dx')) * 100);
    btn.classList.toggle('active', rEq(Q1.dx, rat(h, 100)));
  });
  setRO('s4q1-ro', t('q1ro', { dx: fmtDec(Q1.dx), slope: fmtDec(secantSq(rat(3, 1), Q1.dx)) }));
  Q1_OPTS.forEach(function(v, i){
    var b = $('s4q1-o' + i);
    b.classList.toggle('correct', Q1.done && v === Q1_ANS);
    b.classList.toggle('wrong', Q1.picked.indexOf(v) >= 0);
    b.disabled = Q1.done || Q1.picked.indexOf(v) >= 0;
  });
  if (Q1.done) setRO('s4q1-fb', t('q1ok'));
  else if (Q1.picked.length) setRO('s4q1-fb', t('q1no', { v: Q1.picked[Q1.picked.length - 1] }));
  else setRO('s4q1-fb', '');
  renderS4Hint();
}
function renderQ2(){
  var cv = regCanvas($('s4q2-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-0.15, 2.3], [-0.7, 9.6], false);
  geoms.q2 = g;
  drawGrid(ctx, g, { gx: 0.5, gy: 1, lx: 0.5, ly: 1, xName: 'x', yName: 'y' });
  drawCurve(ctx, g, function(x){ return x * x * x; }, 0, 2.12, COL.cyan, 2.6);
  var qx = 1 + Q2.dx, qy = qx * qx * qx;
  drawSlopeLine(ctx, g, 1, 1, cubeSlopeAt1(Q2.dx), COL.white, 1.6, null);
  drawDot(ctx, g, 1, 1, COL.orange, 6.5, true);
  drawDot(ctx, g, qx, qy, COL.cyan, 6.5, true);
  cTextTag(ctx, 'P (1, 1)', g.X(1) - 62, g.Y(1) + 22, COL.orange);
  cTextTag(ctx, 'Q (' + fmtTrim4(qx) + ', ' + fmtTrim4(qy) + ')', g.X(qx) + 8, g.Y(qy) - 4, COL.cyan);
  document.querySelectorAll('.q2dx').forEach(function(btn){
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-dx')) === Q2.dx);
  });
  setRO('s4q2-ro', t('q2ro', { dx: fmtTrim4(Q2.dx), slope: fmtTrim4(cubeSlopeAt1(Q2.dx)) }));
  Q2_OPTS.forEach(function(v, i){
    var b = $('s4q2-o' + i);
    b.classList.toggle('correct', Q2.done && v === Q2_ANS);
    b.classList.toggle('wrong', Q2.picked.indexOf(v) >= 0);
    b.disabled = Q2.done || Q2.picked.indexOf(v) >= 0;
  });
  if (Q2.done) setRO('s4q2-fb', t('q2ok'));
  else if (Q2.picked.length) setRO('s4q2-fb', t('q2no'));
  else setRO('s4q2-fb', '');
  renderS4Hint();
}
function renderQ3(){
  var bt = $('s4q3-true'), bf = $('s4q3-false');
  bt.classList.toggle('wrong', Q3.picked === 'true');
  bt.disabled = Q3.done || Q3.picked === 'true';
  bf.classList.toggle('correct', Q3.done);
  bf.disabled = Q3.done;
  if (Q3.done) setRO('s4q3-fb', t('q3ok'));
  else if (Q3.picked === 'true') setRO('s4q3-fb', t('q3no'));
  else setRO('s4q3-fb', '');
  renderS4Hint();
}

function renderAll(){ renderS0(); renderS1(); renderS2(); renderS3(); renderQ1(); renderQ2(); renderQ3(); }

/* ================= 事件 ================= */
function dragOn(cvId, geomKey, cb){
  var cv = $(cvId), drag = false;
  function pos(e){
    var r = cv.getBoundingClientRect();
    var g = geoms[geomKey];
    if (!g) return null;
    return g.invX((e.clientX - r.left) * cv.width / r.width);
  }
  cv.addEventListener('pointerdown', function(e){
    var x = pos(e); if (x === null) return;
    drag = true;
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件无活动指针，忽略 */ }
    cb(x);
  });
  cv.addEventListener('pointermove', function(e){ if (drag) { var x = pos(e); if (x !== null) cb(x); } });
  cv.addEventListener('pointerup', function(){ drag = false; });
  cv.addEventListener('pointercancel', function(){ drag = false; });
}
function init(){
  /* 第 0 步 */
  $('s0-play').addEventListener('click', s0TogglePlay);
  $('s0-t').addEventListener('input', function(e){
    s0StopPlay(); S0.tp = +e.target.value; renderS0();
  });
  ['s0-i0', 's0-i1', 's0-i2'].forEach(function(id, i){
    $(id).addEventListener('click', function(){ s0StopPlay(); S0.interval = i; renderS0(); });
  });
  $('s0-start').addEventListener('click', function(){
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  /* 第 1 步 */
  $('s1-dx').addEventListener('input', function(e){
    var v = +e.target.value;
    if (v === 0){ v = S1.lastSign; e.target.value = v; }
    s1SetDx(rat(v, 100)); renderS1();
  });
  document.querySelectorAll('.dxp').forEach(function(btn){
    btn.addEventListener('click', function(){
      var h = Math.round(parseFloat(btn.getAttribute('data-dx')) * 100);
      s1SetDx(rat(h, 100)); renderS1();
    });
  });
  dragOn('s1-canvas', 's1', function(x){
    var h = clamp(Math.round((x - 1) * 100), -150, 150);
    if (h === 0) h = S1.lastSign;
    s1SetDx(rat(h, 100)); renderS1();
  });
  /* 第 2 步 */
  $('s2-x').addEventListener('input', function(e){ s2SetX(+e.target.value); renderS2(); });
  $('s2-reset').addEventListener('click', function(){
    S2.pts = {}; s2SetX(S2.xi); renderS2();
  });
  dragOn('s2-canvas', 's2', function(x){
    s2SetX(clamp(Math.round(x * 10), -20, 20)); renderS2();
  });
  /* 第 3 步 */
  [['s3-m1', 'inc'], ['s3-m2', 'steep'], ['s3-m3', 'vel']].forEach(function(pair){
    $(pair[0]).addEventListener('click', function(){ S3.mode = pair[1]; renderS3(); });
  });
  $('s3-x').addEventListener('input', function(e){ S3.xi = +e.target.value; renderS3(); });
  $('s3-t').addEventListener('input', function(e){ S3.ti = +e.target.value; renderS3(); });
  /* 第 4 步 */
  document.querySelectorAll('.q1dx').forEach(function(btn){
    btn.addEventListener('click', function(){
      var h = Math.round(parseFloat(btn.getAttribute('data-dx')) * 100);
      Q1.dx = rat(h, 100); renderQ1();
    });
  });
  Q1_OPTS.forEach(function(v, i){
    $('s4q1-o' + i).addEventListener('click', function(){
      if (Q1.done || Q1.picked.indexOf(v) >= 0) return;
      if (v === Q1_ANS) Q1.done = true; else Q1.picked.push(v);
      renderQ1();
    });
  });
  document.querySelectorAll('.q2dx').forEach(function(btn){
    btn.addEventListener('click', function(){ Q2.dx = parseFloat(btn.getAttribute('data-dx')); renderQ2(); });
  });
  Q2_OPTS.forEach(function(v, i){
    $('s4q2-o' + i).addEventListener('click', function(){
      if (Q2.done || Q2.picked.indexOf(v) >= 0) return;
      if (v === Q2_ANS) Q2.done = true; else Q2.picked.push(v);
      renderQ2();
    });
  });
  $('s4q3-true').addEventListener('click', function(){
    if (Q3.done || Q3.picked === 'true') return;
    Q3.picked = 'true'; renderQ3();
  });
  $('s4q3-false').addEventListener('click', function(){
    if (Q3.done) return;
    Q3.done = true; renderQ3();
  });
  /* 初始收集当前点 */
  s2SetX(10);
  renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);

/* 供自查 / 评审对账：纯函数 + 实时状态 + 画布几何 */
window.DERIV = {
  igcd: igcd, rat: rat, rAdd: rAdd, rSub: rSub, rMul: rMul, rDiv: rDiv, rEq: rEq, rVal: rVal,
  fmtInt: fmtInt, fmtRat: fmtRat, fmtDec: fmtDec, fmtMeas: fmtMeas, fmtTrim4: fmtTrim4,
  sqRat: sqRat, avgRateSq: avgRateSq, secantSq: secantSq, derivSq: derivSq,
  numericDerivSq: numericDerivSq, cubeSlopeAt1: cubeSlopeAt1,
  state: { S0: S0, S1: S1, S2: S2, S3: S3, Q1: Q1, Q2: Q2, Q3: Q3 },
  geoms: geoms
};
