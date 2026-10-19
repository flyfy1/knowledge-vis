'use strict';
/* exp-log 页 · 红线与范式照 fractions / derivative 页：
   · 全部数值由 Math.pow / Math.log 当场实算：指数值 powB(b,x)=Math.pow(b,x)，
     对数 logB(b,y)（底数 2/10 走 Math.log2/Math.log10，其余 Math.log 商）。
   · 显示口径：整数（1e-9 内吸附）与 3 位内可写尽的小数是精确值、原样显示；
     写不尽的一律「≈ + 3 位小数」，绝不把近似写成等号——fmtShow 是唯一出口。
   · 几何（曲线、目标线交点、探针点）全部由函数值算出，读数与画布同源。
   · 状态一致性：动画中拖探针立即停动画；底数跨越 1 时结论句与图形同帧翻转；
     答题后改任何参数不清判定；切语言只换文案、底层 state 对象不变。 */

/* ================= PURE-BEGIN ================= */
function powB(b, x){ return Math.pow(b, x); }
function logB(b, y){ return b === 2 ? Math.log2(y) : (b === 10 ? Math.log10(y) : Math.log(y) / Math.log(b)); }
/* 整数吸附：距最近整数 < 1e-9 视为精确整数（吸收 Math.log 的浮点尾巴） */
function snapInt(v){ var r = Math.round(v); return Math.abs(v - r) < 1e-9 ? r : null; }
function fmtInt(n){ return n < 0 ? '−' + Math.abs(n) : String(n); }
function trimDecStr(s){ if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; }
function fmtPlain(v, dec){ /* 无 ≈ 口径：固定小数位后去尾零，负号用 U+2212 */
  var s = trimDecStr(v.toFixed(dec === undefined ? 3 : dec));
  return s.replace('-', '−');
}
function isExactVal(v){ /* 整数或 3 位内可写尽的小数 → 精确 */
  if (snapInt(v) !== null) return true;
  return Math.abs(v - Math.round(v * 1000) / 1000) < 1e-9;
}
function fmtShow(v){ /* 唯一显示出口：精确值原样，写不尽的一律 ≈ */
  var si = snapInt(v);
  if (si !== null) return fmtInt(si);
  if (isExactVal(v)) return fmtPlain(v);
  return '≈ ' + fmtPlain(v);
}
/* 第 0 步两列：翻倍 2^t 与直线 1 + 2t */
function dblAt(t){ return powB(2, t); }
function linAt(t){ return 1 + 2 * t; }
/* 第 2 步问答表四组（问句 → 答案），答案由 logB 实算 */
var QA_ROWS = [ [2, 8], [2, 32], [10, 1000], [3, 81] ];
function qaAnswer(b, y){ return logB(b, y); }
/* 第 3 步三把尺子的对账量（全部实算） */
function ruleVals(){
  return {
    l8: logB(2, 8), l4: logB(2, 4), l32: logB(2, 32), l64: logB(2, 64),
    pow43: powB(4, 3), p3: 3 * logB(2, 4),
    l32b10: logB(10, 32)
  };
}
/* 自测答案（实算口径） */
var QUIZ = {
  q1Answer: logB(2, 1 / 8),   /* −3 */
  q2Answer: logB(3, 81),      /* 4 */
  q3Diff: logB(2, 32) - logB(2, 8) /* 2，不是 24 */
};
/* ================= PURE-END ================= */

/* ================= 画布基础设施（照 derivative） ================= */
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

/* ============ 步骤导航高亮（照 derivative） ============ */
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
    ctx.fillText(tickTxt(fmtPlain(Math.round(x * 100) / 100, 2)), g.X(x), g.Y(0) + 5);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (opt.ly) for (y = Math.ceil(g.yr[0] / opt.ly) * opt.ly; y <= g.yr[1] + 1e-9; y += opt.ly){
    if (Math.abs(y) < 1e-9) continue;
    ctx.fillText(tickTxt(fmtPlain(Math.round(y * 100) / 100, 2)), g.X(g.xr[0]) + 4, g.Y(y));
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

/* ================= 状态 ================= */
var geoms = {};
var S0 = { tp: 0, playing: false };          /* tp：0..100（÷10 = 小时） */
var S1 = { ai: 200, xi: 10 };                /* ai：底数×100；xi：探针 x×10 */
var S2 = { base: 2, tgt: 8 };
var S3 = { rule: 1 };
var Q1 = { picked: [], done: false };
var Q1_OPTS = ['3', '−3', '8', '−1/3'], Q1_ANS = '−3';
var Q2 = { picked: [], done: false };
var Q2_OPTS = ['3', '4', '9', '27'], Q2_ANS = '4';
var Q3 = { picked: null, done: false };

var S2CFG = {
  2:  { xr: [-3.6, 5.7], yr: [-1.5, 35],   presets: [0.5, 1, 2, 4, 6, 8, 16, 32], def: 8,    min: 0.1, gx: 1,   gy: 4,   lx: 1,   ly: 4 },
  3:  { xr: [-2.6, 4.7], yr: [-4, 96],     presets: [1, 3, 9, 27, 30, 81],        def: 81,   min: 0.1, gx: 1,   gy: 12,  lx: 1,   ly: 12 },
  10: { xr: [-0.7, 3.5], yr: [-45, 1130],  presets: [1, 10, 100, 500, 1000],      def: 1000, min: 1,   gx: 0.5, gy: 150, lx: 0.5, ly: 150 }
};

/* ================= 第 0 步：翻倍的世界 ================= */
var s0Timer = null, s0Token = 0;
function s0StopPlay(){
  s0Token++;
  if (s0Timer){ clearInterval(s0Timer); s0Timer = null; }
  S0.playing = false;
}
function s0SyncPlayBtn(){
  var b = $('s0-play');
  b.textContent = S0.playing ? t('s0pause') : (S0.tp >= 100 ? t('s0replay') : t('s0play'));
  b.classList.toggle('primary', !S0.playing);
}
function renderS0(){
  var cv = regCanvas($('s0-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-0.4, 10.6], [-70, 1150]);
  geoms.s0 = g;
  drawGrid(ctx, g, { gx: 1, gy: 200, lx: 1, ly: 200, xName: 't', yName: t('cNum') });
  drawCurve(ctx, g, function(x){ return linAt(x); }, 0, 10.2, COL.orange, 2.2);
  drawCurve(ctx, g, function(x){ return dblAt(x); }, 0, 10.15, COL.cyan, 2.6);
  for (var k = 0; k <= 10; k++){
    drawDot(ctx, g, k, dblAt(k), COL.cyan, 4.5, false);
    drawDot(ctx, g, k, linAt(k), COL.orange, 4, false);
  }
  cTextTag(ctx, t('cDbl'), g.X(7.55), g.Y(470), COL.cyan);
  cTextTag(ctx, t('cLin'), g.X(7.3), g.Y(120), COL.orange);
  /* 探针 */
  var tp = S0.tp / 10, dv = dblAt(tp), lv = linAt(tp);
  drawLine2(ctx, g, tp, dv, tp, 0, COL.green, 1.2, [4, 4]);
  drawDot(ctx, g, tp, dv, COL.green, 6.5, true);
  drawDot(ctx, g, tp, lv, COL.green, 5.5, true);
  cTextTag(ctx, '2^' + fmtPlain(tp, 1) + ' = ' + fmtShow(dv), g.X(tp) + 8, g.Y(dv) - 14, COL.green);
  /* 控件与读数 */
  $('s0-t').value = S0.tp;
  $('s0-t-val').textContent = 't = ' + fmtPlain(tp, 1) + ' h';
  s0SyncPlayBtn();
  $('s0-prog').textContent = (S0.playing || S0.tp > 0) ? t('s0prog', { n: S0.tp }) : '';
  setRO('s0-probe', t('s0probe', { t: fmtPlain(tp, 1), d: fmtShow(dv), l: fmtShow(lv) }));
  /* 数表 t = 0..6（两列同出，值全由 PURE 实算） */
  var html = '<tr><th>' + t('s0thT') + '</th><th>' + t('s0thDbl') + '</th><th>' + t('s0thLin') + '</th></tr>';
  for (var r = 0; r <= 6; r++){
    html += '<tr><td>' + r + '</td><td class="hl">' + fmtInt(Math.round(dblAt(r))) + '</td><td class="hl2">' + fmtInt(Math.round(linAt(r))) + '</td></tr>';
  }
  var tbl = $('s0-table');
  if (tbl._h !== html){ tbl._h = html; tbl.innerHTML = html; }
}
function s0TogglePlay(){
  if (S0.playing){ s0StopPlay(); renderS0(); return; }
  if (S0.tp >= 100) S0.tp = 0;
  S0.playing = true;
  var tk = ++s0Token;
  renderS0();
  s0Timer = setInterval(function(){
    if (tk !== s0Token){ clearInterval(s0Timer); return; }
    S0.tp += 1;
    if (S0.tp >= 100){ S0.tp = 100; s0StopPlay(); }
    renderS0();
  }, 55);
}

/* ================= 第 1 步：指数函数与底数 ================= */
function renderS1(){
  var cv = regCanvas($('s1-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-3.3, 3.3], [-0.8, 11]);
  geoms.s1 = g;
  drawGrid(ctx, g, { gx: 0.5, gy: 2, lx: 1, ly: 2, xName: 'x', yName: 'y' });
  var a = S1.ai / 100;
  if (a === 1){
    drawLine2(ctx, g, -3.25, 1, 3.25, 1, COL.cyan, 2.6, null);
  } else {
    var xTop = Math.log(10.7) / Math.log(a); /* a^x = 10.7 处的 x（a<1 时为负） */
    var xa = a > 1 ? -3.25 : Math.max(-3.25, xTop);
    var xb = a > 1 ? Math.min(3.25, xTop) : 3.25;
    drawCurve(ctx, g, function(x){ return powB(a, x); }, xa, xb, COL.cyan, 2.6);
  }
  /* (0,1) 锚点：所有 a^x 都过 */
  drawDot(ctx, g, 0, 1, COL.orange, 6.5, true);
  cTextTag(ctx, t('cOrigin'), g.X(0) + 8, g.Y(1) + 16, COL.orange);
  /* 探针：v 出图幅（>11）时点位钳在图顶——钳位点画空心 + 朝图外的箭头示意出界，
     坐标标签翻入画布内完整显示并附「↑ 图外」；真值仍由下方读数给出 */
  var x = S1.xi / 10, v = powB(a, x);
  var offTop = v > 11;
  var yShown = offTop ? 11 : v;
  drawLine2(ctx, g, x, yShown, x, 0, COL.green, 1.2, [4, 4]);
  if (!offTop) drawLine2(ctx, g, x, v, 0, v, COL.green, 1.2, [4, 4]);
  var dotPx = g.X(x), dotPy = g.Y(yShown);
  if (offTop){
    ctx.beginPath(); ctx.arc(dotPx, dotPy, 6.5, 0, Math.PI * 2);
    ctx.strokeStyle = COL.green; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dotPx, dotPy - 10); ctx.lineTo(dotPx, 5);
    ctx.moveTo(dotPx - 4.5, 10); ctx.lineTo(dotPx, 3.5); ctx.lineTo(dotPx + 4.5, 10);
    ctx.stroke();
  } else {
    drawDot(ctx, g, x, v, COL.green, 6.5, true);
  }
  var probeLab = '(' + fmtPlain(x, 1) + ', ' + fmtShow(v) + ')' + (offTop ? ' ' + t('cOff') : '');
  ctx.font = '700 12.5px system-ui, sans-serif';
  var labW = ctx.measureText(probeLab).width + 12;
  var tagX = dotPx + 8;
  if (tagX + labW > g.W - 2) tagX = dotPx - 10 - labW;
  if (tagX < 2) tagX = 2;
  cTextTag(ctx, probeLab, tagX, offTop ? dotPy + 20 : dotPy - 14, COL.green);
  /* 控件与读数：底数跨 1，结论句同帧翻转 */
  $('s1-a').value = S1.ai;
  $('s1-a-val').textContent = 'a = ' + fmtPlain(a, 2);
  $('s1-x').value = S1.xi;
  $('s1-x-val').textContent = 'x = ' + fmtPlain(x, 1);
  var aTxt = fmtPlain(a, 2);
  setRO('s1-ro', a > 1 ? t('s1roGrow', { a: aTxt }) : (a === 1 ? t('s1roFlat') : t('s1roDecay', { a: aTxt })));
  setRO('s1-probe', t('s1probe', { x: fmtPlain(x, 1), a: aTxt, v: fmtShow(v) }));
}

/* ================= 第 2 步：对数登场 ================= */
function s2Sol(){
  return logB(S2.base, S2.tgt);
}
function renderS2(){
  var cfg = S2CFG[S2.base];
  var cv = regCanvas($('s2-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, cfg.xr, cfg.yr);
  geoms.s2 = g;
  drawGrid(ctx, g, { gx: cfg.gx, gy: cfg.gy, lx: cfg.lx, ly: cfg.ly, xName: 'x', yName: 'y' });
  drawCurve(ctx, g, function(x){ return powB(S2.base, x); }, cfg.xr[0] + 0.05, cfg.xr[1] - 0.05, COL.cyan, 2.6);
  /* 目标线与交点 */
  var sol = s2Sol();
  drawLine2(ctx, g, cfg.xr[0], S2.tgt, cfg.xr[1], S2.tgt, COL.orange, 1.8, [7, 5]);
  drawLine2(ctx, g, sol, S2.tgt, sol, 0, COL.green, 1.2, [4, 4]);
  drawLine2(ctx, g, sol, S2.tgt, 0, S2.tgt, COL.green, 1.2, [4, 4]);
  drawDot(ctx, g, sol, S2.tgt, COL.green, 7, true);
  cTextTag(ctx, t('cTarget') + ' = ' + fmtPlain(S2.tgt, 2), g.X(cfg.xr[0]) + 6, g.Y(S2.tgt) - 16, COL.orange);
  cTextTag(ctx, 'x ' + (snapInt(sol) !== null ? '= ' + fmtInt(snapInt(sol)) : fmtShow(sol)), g.X(sol) + 8, g.Y(S2.tgt) + 16, COL.green);
  /* 底数按钮与预设按钮 */
  document.querySelectorAll('.s2base').forEach(function(b){
    b.classList.toggle('active', parseFloat(b.getAttribute('data-base')) === S2.base);
  });
  var box = $('s2-presets');
  if (box.dataset.base !== String(S2.base)){
    box.dataset.base = String(S2.base);
    box.innerHTML = '';
    cfg.presets.forEach(function(p){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn mode tgtp';
      btn.setAttribute('data-y', String(p));
      btn.textContent = fmtPlain(p, 2);
      btn.addEventListener('click', function(){ S2.tgt = p; renderS2(); });
      box.appendChild(btn);
    });
  }
  document.querySelectorAll('.tgtp').forEach(function(b){
    b.classList.toggle('active', Math.abs(parseFloat(b.getAttribute('data-y')) - S2.tgt) < 1e-12);
  });
  /* 读数：精确整数用等号，写不尽用 ≈ 并亮出它的准确名字 */
  var si = snapInt(sol);
  setRO('s2-ro', t('s2ro', {
    tgt: fmtPlain(S2.tgt, 2), base: S2.base,
    sol: si !== null ? '= ' + fmtInt(si) : fmtShow(sol)
  }));
  setRO('s2-approx', si !== null ? '' : t('s2roApprox', { base: S2.base, tgt: fmtPlain(S2.tgt, 2), sol: fmtShow(sol) }));
  /* 问答表（四组全由 logB 实算） */
  var html = '<tr><th>' + t('s2qaH1') + '</th><th>' + t('s2qaH2') + '</th><th>' + t('s2qaH3') + '</th></tr>';
  QA_ROWS.forEach(function(pair){
    var b = pair[0], y = pair[1], ans = snapInt(qaAnswer(b, y));
    html += '<tr><td>' + b + '<sup>?</sup> = ' + y + '</td><td class="hl">' + (ans !== null ? fmtInt(ans) : fmtShow(qaAnswer(b, y))) +
      '</td><td class="hl2">log<sub>' + b + '</sub>' + y + ' = ' + (ans !== null ? fmtInt(ans) : fmtShow(qaAnswer(b, y))) + '</td></tr>';
  });
  var tbl = $('s2-table');
  if (tbl._h !== html){ tbl._h = html; tbl.innerHTML = html; }
}

/* ================= 第 3 步：三把尺子 ================= */
var S3_HILITE = { 1: [2, 3, 5], 2: [2, 6], 3: [5] }; /* 各尺子点亮的 x（点是 (x, 2^x)） */
function renderS3(){
  var cv = regCanvas($('s3-canvas')); fitCanvas(cv);
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
  var g = plotGeom(cv, [-0.35, 6.35], [-2.5, 70]);
  geoms.s3 = g;
  drawGrid(ctx, g, { gx: 1, gy: 8, lx: 1, ly: 8, xName: 'x', yName: 'y' });
  drawCurve(ctx, g, function(x){ return powB(2, x); }, -0.3, 6.15, COL.cyan, 2.6);
  [2, 3, 5, 6].forEach(function(px){
    var py = powB(2, px);
    var on = S3_HILITE[S3.rule].indexOf(px) >= 0;
    drawDot(ctx, g, px, py, on ? COL.orange : COL.mut, on ? 7 : 5, on);
    if (on) cTextTag(ctx, '(' + px + ', ' + fmtInt(Math.round(py)) + ')', g.X(px) + 8, g.Y(py) - 14, COL.orange);
  });
  ['s3-r1', 's3-r2', 's3-r3'].forEach(function(id, i){
    $(id).classList.toggle('active', S3.rule === i + 1);
  });
  var rv = ruleVals();
  if (S3.rule === 1){
    setRO('s3-ro', t('s3ro1', { l8: fmtShow(rv.l8), l4: fmtShow(rv.l4), l32: fmtShow(rv.l32) }));
  } else if (S3.rule === 2){
    setRO('s3-ro', t('s3ro2', { l64: fmtShow(rv.l64), l4: fmtShow(rv.l4), p: fmtShow(rv.p3) }));
  } else {
    setRO('s3-ro', t('s3ro3', { a: fmtShow(rv.l32), b: fmtShow(rv.l32b10) }));
  }
}

/* ================= 第 4 步：自测 ================= */
function renderQ1(){
  Q1_OPTS.forEach(function(v, i){
    var b = $('s4q1-o' + i);
    b.classList.toggle('correct', Q1.done && v === Q1_ANS);
    b.classList.toggle('wrong', Q1.picked.indexOf(v) >= 0);
    b.disabled = Q1.done || Q1.picked.indexOf(v) >= 0;
  });
  if (Q1.done) setRO('s4q1-fb', t('q1ok'));
  else if (Q1.picked.length) setRO('s4q1-fb', t('q1no'));
  else setRO('s4q1-fb', '');
}
function renderQ2(){
  Q2_OPTS.forEach(function(v, i){
    var b = $('s4q2-o' + i);
    b.classList.toggle('correct', Q2.done && v === Q2_ANS);
    b.classList.toggle('wrong', Q2.picked.indexOf(v) >= 0);
    b.disabled = Q2.done || Q2.picked.indexOf(v) >= 0;
  });
  if (Q2.done) setRO('s4q2-fb', t('q2ok'));
  else if (Q2.picked.length) setRO('s4q2-fb', t('q2no'));
  else setRO('s4q2-fb', '');
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
}

function renderAll(){ renderS0(); renderS1(); renderS2(); renderS3(); renderQ1(); renderQ2(); renderQ3(); }

/* ================= 事件 ================= */
function dragOn(cvId, geomKey, axis, cb){
  var cv = $(cvId), drag = false;
  function pos(e){
    var r = cv.getBoundingClientRect();
    var g = geoms[geomKey];
    if (!g) return null;
    if (axis === 'x') return g.invX((e.clientX - r.left) * cv.width / r.width);
    return g.invY((e.clientY - r.top) * cv.height / r.height);
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
function init(){
  /* 第 0 步 */
  $('s0-play').addEventListener('click', s0TogglePlay);
  $('s0-t').addEventListener('input', function(e){
    s0StopPlay(); S0.tp = +e.target.value; renderS0();
  });
  $('s0-start').addEventListener('click', function(){
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  /* 第 1 步 */
  $('s1-a').addEventListener('input', function(e){ S1.ai = +e.target.value; renderS1(); });
  $('s1-x').addEventListener('input', function(e){ S1.xi = +e.target.value; renderS1(); });
  dragOn('s1-canvas', 's1', 'x', function(x){
    S1.xi = clamp(Math.round(x * 10), -30, 30); renderS1();
  });
  /* 第 2 步 */
  document.querySelectorAll('.s2base').forEach(function(btn){
    btn.addEventListener('click', function(){
      var b = parseFloat(btn.getAttribute('data-base'));
      if (S2.base !== b){ S2.base = b; S2.tgt = S2CFG[b].def; }
      renderS2();
    });
  });
  dragOn('s2-canvas', 's2', 'y', function(y){
    var cfg = S2CFG[S2.base];
    var v = clamp(y, cfg.min, cfg.yr[1] * 0.97);
    cfg.presets.forEach(function(p){
      if (Math.abs(v - p) <= Math.max(0.03, 0.025 * p)) v = p;
    });
    S2.tgt = v;
    renderS2();
  });
  /* 第 3 步 */
  [['s3-r1', 1], ['s3-r2', 2], ['s3-r3', 3]].forEach(function(pair){
    $(pair[0]).addEventListener('click', function(){ S3.rule = pair[1]; renderS3(); });
  });
  /* 第 4 步 */
  Q1_OPTS.forEach(function(v, i){
    $('s4q1-o' + i).addEventListener('click', function(){
      if (Q1.done || Q1.picked.indexOf(v) >= 0) return;
      if (v === Q1_ANS) Q1.done = true; else Q1.picked.push(v);
      renderQ1();
    });
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
  renderAll();
  onLangRefresh(renderAll);
  onRefit(renderAll);
}
document.addEventListener('DOMContentLoaded', init);

/* 供自查 / 评审对账：纯函数 + 实时状态 + 画布几何 */
window.EXPLOG = {
  powB: powB, logB: logB, snapInt: snapInt, fmtInt: fmtInt, fmtPlain: fmtPlain,
  fmtShow: fmtShow, isExactVal: isExactVal, dblAt: dblAt, linAt: linAt,
  QA_ROWS: QA_ROWS, qaAnswer: qaAnswer, ruleVals: ruleVals, QUIZ: QUIZ, S2CFG: S2CFG,
  state: { S0: S0, S1: S1, S2: S2, S3: S3, Q1: Q1, Q2: Q2, Q3: Q3 },
  geoms: geoms
};
