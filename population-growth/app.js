'use strict';
/* ============================================================
   种群增长 — 全部读数由纯函数/迭代实算（PURE 区），渲染只读状态
   ============================================================ */
function $(id) { return document.getElementById(id); }
function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
function fmtInt(x) { return Math.round(x).toLocaleString('en-US'); }
function fmt2(x) { return x.toFixed(2).replace(/-/g, '−'); }
function fmtSigned(x) { const s = fmt2(Math.abs(x)); return (x < 0 ? '−' : '+') + s; }

/* ---------------- PURE：模型 ---------------- */
function doublingValue(g) { return Math.pow(2, g); }                    // 第 0 步
function expCont(n0, r, tt) { return n0 * Math.exp(r * tt); }           // 第 1 步连续指数
function doublingTime(r) { return Math.LN2 / r; }                        // ln2 / r
function logisticStep(N, r, K) { return N + r * N * (1 - N / K); }       // 离散逻辑斯蒂一迭代
function effRate(r, N, K) { return r * (1 - N / K); }                    // 实际增长率
function logisticSeries(n0, r, K, gens) {
  const out = [n0]; let N = n0;
  for (let i = 0; i < gens; i++) { N = logisticStep(N, r, K); out.push(N); }
  return out;
}
function discreteExpValue(n0, r, g) { return n0 * Math.pow(1 + r, g); }  // 同一迭代去掉刹车项
function classifySeries(series, K) {
  for (let i = 0; i < series.length; i++) {
    if (!isFinite(series[i]) || series[i] <= 0) return { type: 'crash', gen: i };
  }
  const tail = series.slice(-6);
  const spread = Math.max.apply(null, tail) - Math.min.apply(null, tail);
  if (spread > 0.02 * K) return { type: 'osc', spread: spread };
  return { type: 'stable' };
}

/* ---------------- Canvas 基础设施（照站内惯例） ---------------- */
var _canvases = [], _refitFns = [];
function regCanvas(cv) { if (_canvases.indexOf(cv) < 0) _canvases.push(cv); return cv; }
function onRefit(fn) { _refitFns.push(fn); }
function fitCanvas(cv) {
  var w = cv.clientWidth || cv.parentElement.clientWidth || 640;
  var cssH = parseInt(cv.dataset.cssH || cv.getAttribute('height'), 10) || 320;
  cv.dataset.cssH = cssH;
  cv.style.height = cssH + 'px';
  var dpr = window.devicePixelRatio || 1;
  var bw = Math.round(w * dpr), bh = Math.round(cssH * dpr);
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  var ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, W: w, H: cssH };
}
(function () {
  var pending = false;
  window.addEventListener('resize', function () {
    if (pending) return; pending = true;
    requestAnimationFrame(function () { pending = false; _canvases.forEach(fitCanvas); _refitFns.forEach(function (f) { f(); }); });
  });
})();
/* 步骤导航高亮 */
(function () {
  var links = document.querySelectorAll('.nav-step');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var visible = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) visible[en.target.id] = en.boundingClientRect.top; else delete visible[en.target.id];
    });
    var ids = Object.keys(visible); if (!ids.length) return;
    ids.sort(function (a, b) { return Math.abs(visible[a]) - Math.abs(visible[b]); });
    links.forEach(function (a) { a.classList.remove('active'); });
    var cur = map[ids[0]]; if (cur) cur.classList.add('active');
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('section.step').forEach(function (s) { io.observe(s); });
})();

/* 通用折线图：series=[{pts:[[x,y],...], color, dash, width}], opts={xMax,yMax,kLine:{y,label},yLabel} */
function drawChart(cv, series, opts) {
  var f = fitCanvas(cv), ctx = f.ctx, W = f.W, H = f.H;
  ctx.clearRect(0, 0, W, H);
  var L = 52, R = 12, T = 26, B = 26;
  var iw = W - L - R, ih = H - T - B;
  function X(x) { return L + (x / opts.xMax) * iw; }
  function Y(y) { return T + ih - (y / opts.yMax) * ih; }
  ctx.strokeStyle = '#2b3547'; ctx.fillStyle = '#9aa7b8'; ctx.lineWidth = 1; ctx.font = '11px system-ui, sans-serif';
  for (var i = 0; i <= 4; i++) {
    var yv = opts.yMax * i / 4, yy = Y(yv);
    ctx.beginPath(); ctx.moveTo(L, yy); ctx.lineTo(W - R, yy); ctx.stroke();
    ctx.fillText(fmtInt(yv), 6, yy + 4);
  }
  ctx.fillText(opts.yLabel || '', 6, 14);
  for (var j = 0; j <= 4; j++) {
    var xv = opts.xMax * j / 4;
    ctx.fillText(fmtInt(xv), X(xv) - 6, H - 8);
  }
  if (opts.kLine) {
    ctx.strokeStyle = '#ffb454'; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(L, Y(opts.kLine.y)); ctx.lineTo(W - R, Y(opts.kLine.y)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb454'; ctx.fillText(opts.kLine.label, W - R - 64, Y(opts.kLine.y) - 6);
  }
  series.forEach(function (s) {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2;
    ctx.setLineDash(s.dash || []);
    ctx.beginPath();
    var started = false;
    s.pts.forEach(function (p) {
      if (p[1] > opts.yMax * 1.02) { started = false; return; }
      var px = X(p[0]), py = Y(Math.max(p[1], 0));
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    });
    ctx.stroke(); ctx.setLineDash([]);
  });
  /* 图例 */
  var lx = L + 6;
  series.forEach(function (s) {
    if (!s.label) return;
    ctx.strokeStyle = s.color; ctx.lineWidth = 3; ctx.setLineDash(s.dash || []);
    ctx.beginPath(); ctx.moveTo(lx, 14); ctx.lineTo(lx + 22, 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#e8edf4'; ctx.fillText(s.label, lx + 27, 18);
    lx += 27 + ctx.measureText(s.label).width + 18;
  });
  return f;
}

/* ---------------- 第 0 步：翻倍 ---------------- */
var s0 = { gen: 0, MAX: 14 };
function drawS0() {
  var cv = regCanvas($('s0-canvas')); var f = fitCanvas(cv), ctx = f.ctx, W = f.W, H = f.H;
  ctx.clearRect(0, 0, W, H);
  var L = 44, B = 26, T = 16, iw = W - L - 10, ih = H - T - B;
  var yMax = doublingValue(s0.MAX);
  ctx.strokeStyle = '#2b3547'; ctx.fillStyle = '#9aa7b8'; ctx.font = '11px system-ui, sans-serif';
  [0, 0.25, 0.5, 0.75, 1].forEach(function (fr) {
    var yv = yMax * fr, yy = T + ih - fr * ih;
    ctx.beginPath(); ctx.moveTo(L, yy); ctx.lineTo(W - 10, yy); ctx.stroke();
    ctx.fillText(fmtInt(yv), 4, yy + 4);
  });
  ctx.fillText(t('s0count'), 4, 12);
  var n = s0.gen + 1, bw = iw / s0.MAX;
  for (var g = 0; g <= s0.gen; g++) {
    var v = doublingValue(g), bh = (v / yMax) * ih;
    ctx.fillStyle = g === s0.gen ? '#6ee7ff' : '#2c5f78';
    ctx.fillRect(L + g * bw + 3, T + ih - bh, bw - 6, bh);
    ctx.fillStyle = '#9aa7b8';
    ctx.fillText(String(g), L + g * bw + bw / 2 - 3, H - 8);
  }
  var ro = t('s0ro', { g: s0.gen, n: fmtInt(doublingValue(s0.gen)) });
  if (s0.gen >= 10) ro += '<br>' + t('s0ro10');
  $('s0-ro').innerHTML = ro;
  $('s0-next').disabled = s0.gen >= s0.MAX;
}
$('s0-next').addEventListener('click', function () { if (s0.gen < s0.MAX) s0.gen++; drawS0(); });
$('s0-reset').addEventListener('click', function () { s0.gen = 0; drawS0(); });

/* ---------------- 第 1 步：连续指数与 r ---------------- */
var s1 = { r: 0.30, T: 10, n0: 10 };
function drawS1() {
  var cv = regCanvas($('s1-canvas'));
  var pts = []; for (var tt = 0; tt <= s1.T; tt += 0.1) pts.push([tt, expCont(s1.n0, s1.r, tt)]);
  var yMax = expCont(s1.n0, s1.r, s1.T) * 1.08;
  drawChart(cv, [{ pts: pts, color: '#6ee7ff', label: 'N = 10·e^(rt)' }], { xMax: s1.T, yMax: yMax, yLabel: 'N' });
  $('s1-r-val').textContent = 'r = ' + fmt2(s1.r);
  $('s1-ro').innerHTML = t('s1ro', { r: fmt2(s1.r), td: fmt2(doublingTime(s1.r)), T: s1.T, n: fmtInt(expCont(s1.n0, s1.r, s1.T)) });
}
$('s1-r').addEventListener('input', function () { s1.r = parseInt(this.value, 10) / 100; drawS1(); });

/* ---------------- 第 2 步：逻辑斯蒂 vs 指数 ---------------- */
var s2 = { r: 0.60, K: 1000, n0: 20, gen: 0, MAXG: 40 };
function drawS2() {
  var cv = regCanvas($('s2-canvas'));
  var log = logisticSeries(s2.n0, s2.r, s2.K, s2.gen);
  var logPts = log.map(function (v, i) { return [i, v]; });
  var expPts = []; for (var g = 0; g <= s2.MAXG; g++) expPts.push([g, discreteExpValue(s2.n0, s2.r, g)]);
  var yMax = s2.K * 1.2;
  drawChart(cv, [
    { pts: expPts, color: '#3d7f96', dash: [4, 4], label: t('s2exp') },
    { pts: logPts, color: '#ffb454', width: 2.5, label: t('s2log') }
  ], { xMax: s2.MAXG, yMax: yMax, yLabel: 'N', kLine: { y: s2.K, label: 'K = ' + fmtInt(s2.K) } });
  var N = log[s2.gen];
  $('s2-r-val').textContent = 'r = ' + fmt2(s2.r);
  $('s2-k-val').textContent = 'K = ' + fmtInt(s2.K);
  $('s2-ro').innerHTML = t('s2ro', {
    g: s2.gen, ne: fmtInt(discreteExpValue(s2.n0, s2.r, s2.gen)), nl: fmtInt(N),
    eff: fmt2(effRate(s2.r, N, s2.K)), r: fmt2(s2.r)
  });
  $('s2-play').disabled = s2.gen >= s2.MAXG;
}
$('s2-r').addEventListener('input', function () { s2.r = parseInt(this.value, 10) / 100; drawS2(); });
$('s2-k').addEventListener('input', function () { s2.K = parseInt(this.value, 10); drawS2(); });
$('s2-play').addEventListener('click', function () { if (s2.gen < s2.MAXG) s2.gen++; drawS2(); });
$('s2-reset').addEventListener('click', function () { s2.gen = 0; drawS2(); });

/* ---------------- 第 3 步：K 是吸引子 ---------------- */
var s3 = { n0: 1800, K: 1000, r: 0.6, gen: 0, MAXG: 40, series: null };
function s3Reset() { s3.gen = 0; s3.series = [s3.n0]; }
function drawS3() {
  if (!s3.series) s3Reset();
  var cv = regCanvas($('s3-canvas'));
  var pts = s3.series.map(function (v, i) { return [i, v]; });
  var yMax = Math.max(s3.n0, s3.K) * 1.15;
  drawChart(cv, [{ pts: pts, color: '#7ee2a8', width: 2.5, label: 'N' }],
    { xMax: s3.MAXG, yMax: yMax, yLabel: 'N', kLine: { y: s3.K, label: 'K = ' + fmtInt(s3.K) } });
  var N = s3.series[s3.gen];
  $('s3-n0-val').textContent = 'N₀ = ' + fmtInt(s3.n0);
  $('s3-k-val').textContent = 'K = ' + fmtInt(s3.K);
  $('s3-ro').innerHTML = t('s3ro', { g: s3.gen, n: fmtInt(N), d: fmtInt(Math.abs(N - s3.K)), eff: fmtSigned(effRate(s3.r, N, s3.K)) });
  $('s3-next').disabled = s3.gen >= s3.MAXG;
}
$('s3-n0').addEventListener('input', function () { s3.n0 = parseInt(this.value, 10); s3Reset(); drawS3(); });
$('s3-k').addEventListener('input', function () { s3.K = parseInt(this.value, 10); s3Reset(); drawS3(); });
$('s3-next').addEventListener('click', function () {
  if (s3.gen < s3.MAXG) { s3.series.push(logisticStep(s3.series[s3.gen], s3.r, s3.K)); s3.gen++; }
  drawS3();
});
$('s3-reset').addEventListener('click', function () { s3Reset(); drawS3(); });

/* ---------------- 第 4 步：越界实验 ---------------- */
var s4 = { r: 2.30, n0: 50, K: 1000, GENS: 60 };
function drawS4() {
  var cv = regCanvas($('s4-canvas'));
  var series = logisticSeries(s4.n0, s4.r, s4.K, s4.GENS);
  var cls = classifySeries(series, s4.K);
  var draw = cls.type === 'crash' ? series.slice(0, cls.gen + 1) : series;
  var pts = draw.map(function (v, i) { return [i, Math.max(v, 0)]; });
  var peak = Math.max.apply(null, draw.concat([s4.K]));
  var yMax = Math.min(peak * 1.15, 3000);
  drawChart(cv, [{ pts: pts, color: '#ff7a93', width: 2, label: 'N' }],
    { xMax: s4.GENS, yMax: yMax, yLabel: 'N', kLine: { y: s4.K, label: 'K = ' + fmtInt(s4.K) } });
  $('s4-r-val').textContent = 'r = ' + fmt2(s4.r);
  var key = cls.type === 'crash' ? 's4crash' : (cls.type === 'osc' ? 's4osc' : 's4stable');
  $('s4-ro').innerHTML = t(key, { g: cls.gen || 0, spread: fmtInt(cls.spread || 0) });
}
$('s4-r').addEventListener('input', function () { s4.r = parseInt(this.value, 10) / 100; drawS4(); });

/* ---------------- 初始化 ---------------- */
function drawAll() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); }
onRefit(drawAll);
onLangRefresh(drawAll);
document.addEventListener('DOMContentLoaded', drawAll);
