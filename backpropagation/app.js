(function () {
'use strict';
/*H*/
var $ = function (id) { return document.getElementById(id); };
var C = { a: '#67d7f9', o: '#f6a45b', g: '#74dfaa', p: '#ff7a93', m: '#8da0b0', grid: '#223446', ink: '#eaf4f8' };
function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
function fit(cv) {
  var d = Math.min(window.devicePixelRatio || 1, 3);
  if (!cv.dataset.h) cv.dataset.h = cv.getAttribute('height') || '300';
  cv.style.height = cv.dataset.h + 'px';
  var w = cv.clientWidth, h = +cv.dataset.h;
  var bw = Math.max(2, Math.round(w * d)), bh = Math.max(2, Math.round(h * d));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  var c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
  cv._w = w; cv._h = h; return c;
}
function txt(c, s, x, y, col, size, al) { c.fillStyle = col; c.font = (size || 12) + 'px system-ui,sans-serif'; c.textAlign = al || 'left'; c.fillText(s, x, y); }
function wrapTxt(c, s, x, y, mw, lh, col, size) {
  c.font = (size || 11) + 'px system-ui,sans-serif'; c.fillStyle = col; c.textAlign = 'left';
  var toks = String(s).match(/[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+\s*|\s+/g) || [String(s)], ln = '', n = 0;
  toks.forEach(function (tk) { var test = ln + tk; if (c.measureText(test).width > mw && ln) { c.fillText(ln, x, y + n * lh); n++; ln = tk.replace(/^\s+/, ''); } else ln = test; });
  if (ln) { c.fillText(ln, x, y + n * lh); n++; }
  return n;
}
function line(c, pts, col, w, dash) {
  c.beginPath(); for (var i = 0; i < pts.length; i++) { if (i) c.lineTo(pts[i][0], pts[i][1]); else c.moveTo(pts[i][0], pts[i][1]); }
  c.strokeStyle = col; c.lineWidth = w || 1.5; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
}
var STOPS = [[11, 18, 27], [27, 58, 107], [42, 143, 189], [103, 215, 249], [246, 226, 122], [255, 255, 255]];
function heat(v) {
  v = cl(v, 0, 1) * (STOPS.length - 1); var i = Math.min(Math.floor(v), STOPS.length - 2), f = v - i, a = STOPS[i], b = STOPS[i + 1];
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')';
}
function setText(id, key, vars) { var e = $(id); if (e) e.textContent = t(key, vars); }
function setHTML(id, key, vars) { var e = $(id); if (e) e.innerHTML = t(key, vars); }
var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
/*/H*/

/* ---------------- model (pure) ---------------- */
var X = 1, T = 1.2, LO = -3, HI = 3, W1_0 = -1, W2_0 = 0.8;
function sig(a) { return 1 / (1 + Math.exp(-a)); }
function forward(w1, w2) { var a = w1 * X, h = sig(a), y = w2 * h; return { a: a, h: h, y: y, L: 0.5 * (y - T) * (y - T) }; }
function grads(w1, w2) {
  var f = forward(w1, w2), dy = f.y - T, dw2 = dy * f.h, dh = dy * w2, da = dh * f.h * (1 - f.h), dw1 = da * X;
  return { f: f, dy: dy, dw2: dw2, dh: dh, da: da, dw1: dw1 };
}
function lossAt(w1, w2) { return forward(w1, w2).L; }
function fwdDiff(w1, w2, which, eps) { var l0 = lossAt(w1, w2), l1 = which === 0 ? lossAt(w1 + eps, w2) : lossAt(w1, w2 + eps); return (l1 - l0) / eps; }
function ctrDiff(w1, w2, which, eps) { var a = which === 0 ? lossAt(w1 + eps, w2) : lossAt(w1, w2 + eps), b = which === 0 ? lossAt(w1 - eps, w2) : lossAt(w1, w2 - eps); return (a - b) / (2 * eps); }
function descend(w1, w2, eta) { var g = grads(w1, w2); return [w1 - eta * g.dw1, w2 - eta * g.dw2]; }
var ACT = {
  sigmoid: { f: sig, d: function (a) { var s = sig(a); return s * (1 - s); } },
  tanh: { f: Math.tanh, d: function (a) { var s = Math.tanh(a); return 1 - s * s; } },
  relu: { f: function (a) { return a > 0 ? a : 0; }, d: function (a) { return a > 0 ? 1 : 0; } }
};
// chain of n single-neuron layers, h0 = 1, a_k = w h_{k-1}, h_k = act(a_k), loss = 0.5 (h_n - 0.5)^2
function chain(n, w, act) {
  var A = ACT[act], h = [1], a = [], k;
  for (k = 1; k <= n; k++) { a[k] = w * h[k - 1]; h[k] = A.f(a[k]); }
  var dh = h[n] - 0.5, g = [];
  for (k = n; k >= 1; k--) { var da = dh * A.d(a[k]); g[k] = da * h[k - 1]; dh = da * w; }
  return { h: h, a: a, g: g.slice(1), yhat: h[n], loss: 0.5 * (h[n] - 0.5) * (h[n] - 0.5) };
}
var M = { X: X, T: T, sig: sig, forward: forward, grads: grads, lossAt: lossAt, fwdDiff: fwdDiff, ctrDiff: ctrDiff, descend: descend, chain: chain };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
function f2(v) { return (+v).toFixed(2); }
function f3(v) { return (+v).toFixed(3); }
function sci(v) { var a = Math.abs(v); return a === 0 ? '0' : (a < 0.001 || a >= 1000 ? v.toExponential(1) : v.toFixed(3)); }
function arrowH(c, x0, y0, x1, y1, col, w) {
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w || 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  var a = Math.atan2(y1 - y0, x1 - x0); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - 8 * Math.cos(a - 0.4), y1 - 8 * Math.sin(a - 0.4)); c.lineTo(x1 - 8 * Math.cos(a + 0.4), y1 - 8 * Math.sin(a + 0.4)); c.closePath(); c.fill();
}
function node(c, x, y, label, col) { c.fillStyle = '#10202e'; c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 17, 0, 7); c.fill(); c.stroke(); txt(c, label, x, y + 4, col, 12, 'center'); }
function landscape(c, x0, y0, w, h, marks, trail) {
  var n = 36, cw = w / n, ch = h / n, i, j;
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
    var w1 = LO + (i + 0.5) / n * (HI - LO), w2 = LO + (j + 0.5) / n * (HI - LO);
    c.fillStyle = heat(1 - Math.min(1, Math.sqrt(lossAt(w1, w2)) / 2)); c.fillRect(x0 + i * cw, y0 + h - (j + 1) * ch, cw + 0.6, ch + 0.6);
  }
  c.strokeStyle = C.grid; c.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
  function px(a) { return x0 + (a - LO) / (HI - LO) * w; } function py(b) { return y0 + h - (b - LO) / (HI - LO) * h; }
  if (trail && trail.length > 1) line(c, trail.map(function (p) { return [px(Math.max(LO, Math.min(HI, p[0]))), py(Math.max(LO, Math.min(HI, p[1])))]; }), '#ffffff', 2);
  marks.forEach(function (m) { c.fillStyle = m.col; c.strokeStyle = '#08131a'; c.lineWidth = 2; c.beginPath(); c.arc(px(m.w1), py(m.w2), 6, 0, 7); c.fill(); c.stroke(); });
  txt(c, 'w1', x0 + w - 4, y0 + h - 4, '#fff', 11, 'right'); txt(c, 'w2', x0 + 4, y0 + 12, '#fff', 11);
  return { x0: x0, y0: y0, w: w, h: h };
}
var lay0 = null, lay3 = null;
function render0() {
  var w1 = +$('s0-w1').value / 20, w2 = +$('s0-w2').value / 20; $('s0-w1-v').textContent = f2(w1); $('s0-w2-v').textContent = f2(w2);
  var f = forward(w1, w2), cv = $('s0-cv'), c = fit(cv), W = cv._w, xs = [], i;
  for (i = 0; i < 5; i++) xs.push(34 + i * (W - 68) / 4);
  var ny = 52, labs = ['x', 'a', 'h', 'ŷ', 'L'], vals = [X, f.a, f.h, f.y, f.L], cols = [C.m, C.a, C.a, C.g, C.p];
  for (i = 0; i < 4; i++) arrowH(c, xs[i] + 19, ny, xs[i + 1] - 19, ny, C.m, 1.6);
  txt(c, '×w1=' + f2(w1), (xs[0] + xs[1]) / 2, ny - 10, C.o, 11, 'center'); txt(c, 'σ', (xs[1] + xs[2]) / 2, ny - 10, C.o, 12, 'center');
  txt(c, '×w2=' + f2(w2), (xs[2] + xs[3]) / 2, ny - 10, C.o, 11, 'center'); txt(c, '½(ŷ−' + T + ')²', (xs[3] + xs[4]) / 2, ny - 10, C.o, 10, 'center');
  for (i = 0; i < 5; i++) { node(c, xs[i], ny, labs[i], cols[i]); txt(c, f3(vals[i]), xs[i], ny + 34, cols[i], 11, 'center'); }
  txt(c, t('s0Fwd'), 10, 14, C.m, 11);
  txt(c, t('s0Land', { T: T }), 10, 120, C.ink, 12);
  lay0 = landscape(c, 10, 128, W - 20, 230, [{ w1: w1, w2: w2, col: C.o }], null);
  setHTML('s0-ro', 's0ro', { a: f3(f.a), h: f3(f.h), y: f3(f.y), T: T, L: f3(f.L) });
}
function render1() {
  var which = st1.which, pos = +$('s1-p').value / 20, le = +$('s1-e').value / 10, eps = Math.pow(10, le);
  $('s1-p-v').textContent = f2(pos); $('s1-e-v').textContent = '10^' + le.toFixed(1) + ' = ' + (eps >= 0.01 ? eps.toFixed(3) : eps.toExponential(1));
  var w1 = which === 0 ? pos : W1_0, w2 = which === 1 ? pos : W2_0, cv = $('s1-cv'), c = fit(cv), W = cv._w, x0 = 36, pw = W - x0 - 10, y0 = 18, ph = 250;
  var ymax = 3; function px(v) { return x0 + (v - LO) / (HI - LO) * pw; } function py(L) { return y0 + ph - Math.min(L, ymax) / ymax * ph; }
  c.strokeStyle = C.grid; c.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
  var pts = [], k; for (k = 0; k <= 120; k++) { var v = LO + (HI - LO) * k / 120; pts.push([px(v), py(which === 0 ? lossAt(v, w2) : lossAt(w1, v))]); }
  line(c, pts, C.a, 2.4);
  var cur = which === 0 ? w1 : w2, L0 = lossAt(w1, w2), ex = which === 0 ? grads(w1, w2).dw1 : grads(w1, w2).dw2, sec = fwdDiff(w1, w2, which, eps);
  function lineAt(slope, col, dash, wd) { var xa = cur - 1.2, xb = cur + 1.2; line(c, [[px(xa), py(L0 + slope * (xa - cur))], [px(xb), py(L0 + slope * (xb - cur))]], col, wd, dash); }
  lineAt(ex, '#ffffff', [5, 4], 1.5); lineAt(sec, C.o, null, 2.2);
  c.fillStyle = C.o; c.beginPath(); c.arc(px(cur), py(L0), 5, 0, 7); c.fill();
  c.fillStyle = C.p; c.beginPath(); c.arc(px(cur + eps), py(which === 0 ? lossAt(w1 + eps, w2) : lossAt(w1, w2 + eps)), 4, 0, 7); c.fill();
  txt(c, t('s1Ax', { w: which === 0 ? 'w1' : 'w2' }), x0, y0 + ph + 16, C.m, 11); txt(c, 'L', 12, y0 + 10, C.m, 11);
  txt(c, t('s1Leg'), x0 + pw - 4, y0 + 14, C.o, 11, 'right'); txt(c, t('s1Leg2'), x0 + pw - 4, y0 + 28, '#fff', 11, 'right');
  setHTML('s1-ro', 's1ro', { w: which === 0 ? 'w1' : 'w2', sec: sci(sec), ex: sci(ex), d: sci(Math.abs(sec - ex)) });
  ['s1-w1', 's1-w2'].forEach(function (id, i) { var b = $(id); b.classList.toggle('active', i === which); b.setAttribute('aria-pressed', i === which ? 'true' : 'false'); });
}
var st1 = { which: 0 };
var play2 = { on: false, raf: 0, acc: 0, last: 0 };
function render2() {
  var w1 = +$('s2-w1').value / 20, w2 = +$('s2-w2').value / 20, sg = +$('s2-st').value; $('s2-w1-v').textContent = f2(w1); $('s2-w2-v').textContent = f2(w2); $('s2-st-v').textContent = sg + ' / 4';
  var g = grads(w1, w2), cv = $('s2-cv'), c = fit(cv), W = cv._w, xs = [], i;
  for (i = 0; i < 5; i++) xs.push(34 + i * (W - 68) / 4);
  var ny = 70, labs = ['x', 'a', 'h', 'ŷ', 'L'], fv = [X, g.f.a, g.f.h, g.f.y, g.f.L];
  txt(c, t('s2Fwd'), 10, 14, C.m, 11);
  for (i = 0; i < 4; i++) arrowH(c, xs[i] + 19, ny, xs[i + 1] - 19, ny, C.m, 1.4);
  for (i = 0; i < 5; i++) { node(c, xs[i], ny, labs[i], i < 3 ? C.a : (i === 3 ? C.g : C.p)); txt(c, f3(fv[i]), xs[i], ny - 26, C.m, 10, 'center'); }
  // backward ledger
  var rows = [
    { s: 1, f: 'dL/dŷ = ŷ − ' + T, v: g.dy, col: C.p, x: xs[3] },
    { s: 2, f: 'dL/dw2 = dL/dŷ · h', v: g.dw2, col: C.g, x: (xs[2] + xs[3]) / 2 },
    { s: 2, f: 'dL/dh = dL/dŷ · w2', v: g.dh, col: C.a, x: xs[2] },
    { s: 3, f: 'dL/da = dL/dh · h(1−h)', v: g.da, col: C.a, x: xs[1] },
    { s: 4, f: 'dL/dw1 = dL/da · x', v: g.dw1, col: C.o, x: (xs[0] + xs[1]) / 2 }
  ];
  var by = 150; txt(c, t('s2Bwd'), 10, by - 12, C.m, 11);
  rows.forEach(function (r, k) {
    var on = sg >= r.s, y = by + 14 + k * 38;
    c.globalAlpha = on ? 1 : 0.28; txt(c, r.f, 10, y, r.col, 12); txt(c, on ? '= ' + sci(r.v) : '= ?', W - 10, y, r.col, 13, 'right');
    c.fillStyle = r.col; c.fillRect(10, y + 6, on ? Math.min(W - 20, Math.abs(r.v) * 160 + 3) : 3, 5); c.globalAlpha = 1;
    if (on) { arrowH(c, r.x, ny + 36, r.x, ny + 22, r.col, 2.4); }
  });
  var nd = ctrDiff(w1, w2, 0, 1e-5), nd2 = ctrDiff(w1, w2, 1, 1e-5);
  setHTML('s2-ro', 's2ro', { st: sg, w1: sg >= 4 ? sci(g.dw1) : '—', w2: sg >= 2 ? sci(g.dw2) : '—', n1: sci(nd), n2: sci(nd2), e: Math.max(Math.abs(nd - g.dw1), Math.abs(nd2 - g.dw2)).toExponential(1) });
  $('s2-play').textContent = t(play2.on ? 's2pause' : 's2play');
}
function stopPlay2() { play2.on = false; cancelAnimationFrame(play2.raf); }
function tick2(ts) {
  if (!play2.on) return; play2.acc += Math.min(0.1, (ts - play2.last) / 1000); play2.last = ts;
  if (play2.acc >= 0.9) { play2.acc = 0; var v = +$('s2-st').value + 1; $('s2-st').value = v; if (v >= 4) stopPlay2(); render2(); }
  if (play2.on) play2.raf = requestAnimationFrame(tick2);
}
var tr = { path: [], on: false, raf: 0, acc: 0, last: 0, stopped: '' };
function trStart() { return [+$('s3-w1').value / 20, +$('s3-w2').value / 20]; }
function trReset() { var s = trStart(); tr.path = [s]; tr.stopped = ''; }
function trStep() {
  var p = tr.path[tr.path.length - 1], eta = +$('s3-eta').value / 100, q = descend(p[0], p[1], eta);
  tr.path.push(q);
  var L = lossAt(q[0], q[1]);
  if (!isFinite(L) || Math.abs(q[0]) > 8 || Math.abs(q[1]) > 8) { tr.stopped = 'out'; stopRun(); }
  else if (L < 1e-6) { tr.stopped = 'done'; stopRun(); }
  else if (tr.path.length > 400) { tr.stopped = 'max'; stopRun(); }
}
function stopRun() { tr.on = false; cancelAnimationFrame(tr.raf); }
function tick3(ts) {
  if (!tr.on) return; tr.acc += Math.min(0.1, (ts - tr.last) / 1000); tr.last = ts;
  var per = reduced() ? 0.6 : 0.05;
  while (tr.acc >= per && tr.on) { tr.acc -= per; for (var k = 0; k < (reduced() ? 10 : 1) && tr.on; k++) trStep(); }
  render3();
  if (tr.on) tr.raf = requestAnimationFrame(tick3);
}
function render3() {
  var eta = +$('s3-eta').value / 100, s = trStart(); $('s3-eta-v').textContent = eta.toFixed(2); $('s3-w1-v').textContent = f2(s[0]); $('s3-w2-v').textContent = f2(s[1]);
  if (!tr.path.length) trReset();
  var cv = $('s3-cv'), c = fit(cv), W = cv._w, p = tr.path[tr.path.length - 1];
  txt(c, t('s3Land'), 10, 14, C.ink, 12);
  lay3 = landscape(c, 10, 22, W - 20, 230, [{ w1: tr.path[0][0], w2: tr.path[0][1], col: C.g }, { w1: p[0], w2: p[1], col: C.o }], tr.path);
  var cy = 286, ch = 70, losses = tr.path.map(function (q) { return lossAt(q[0], q[1]); }), lm = Math.max(0.05, Math.min(losses[0], 5));
  txt(c, t('s3Curve'), 10, cy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(10.5, cy + 0.5, W - 21, ch);
  var nmax = Math.max(40, losses.length - 1);
  line(c, losses.map(function (L, i) { return [10 + (W - 20) * i / nmax, cy + ch - Math.min(1, L / lm) * (ch - 4)]; }), C.o, 2);
  txt(c, '0', 12, cy + ch + 14, C.m, 10); txt(c, String(nmax), W - 12, cy + ch + 14, C.m, 10, 'right');
  var L = lossAt(p[0], p[1]), g = grads(p[0], p[1]);
  setHTML('s3-ro', 's3ro', { k: tr.path.length - 1, w1: f3(p[0]), w2: f3(p[1]), L: sci(L), g: Math.hypot(g.dw1, g.dw2).toFixed(3), eta: eta.toFixed(2), note: tr.stopped ? t('s3n_' + tr.stopped) : (tr.on ? t('s3n_run') : t('s3n_idle')) });
  $('s3-run').textContent = t(tr.on ? 's3pause' : 's3run');
}
var st4 = { act: 'sigmoid' };
function render4() {
  var n = +$('s4-n').value, w = +$('s4-w').value / 10; $('s4-n-v').textContent = String(n); $('s4-w-v').textContent = w.toFixed(1);
  var r = chain(n, w, st4.act), cv = $('s4-cv'), c = fit(cv), W = cv._w, x0 = 40, pw = W - x0 - 10, y0 = 24, ph = 230, k;
  txt(c, t('s4Cap'), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
  var lo = -12, hi = 1, bw = pw / 12;
  for (var e = lo; e <= hi; e += 3) { var yy = y0 + ph - (e - lo) / (hi - lo) * ph; line(c, [[x0, yy], [x0 + pw, yy]], C.grid, 1, [3, 4]); txt(c, '1e' + e, x0 - 4, yy + 4, C.m, 10, 'right'); }
  for (k = 1; k <= n; k++) {
    var g = Math.abs(r.g[k - 1]), v = g > 0 ? Math.log10(g) : lo, hh = (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * ph;
    c.fillStyle = k === 1 ? C.o : C.a; c.globalAlpha = 0.85; c.fillRect(x0 + (k - 1) * bw + 4, y0 + ph - hh, bw - 8, Math.max(2, hh)); c.globalAlpha = 1;
    txt(c, String(k), x0 + (k - 1) * bw + bw / 2, y0 + ph + 14, C.m, 10, 'center');
  }
  txt(c, t('s4Ax'), x0 + pw, y0 + ph + 28, C.m, 10, 'right');
  var g1 = Math.abs(r.g[0]), gn = Math.abs(r.g[n - 1]);
  setHTML('s4-ro', 's4ro', { n: n, w: w.toFixed(1), act: t('act_' + st4.act), y: f3(r.yhat), g1: sci(r.g[0]), gn: sci(r.g[n - 1]), ratio: g1 > 0 ? (gn / g1).toExponential(1) : '—', fac: (w * ACT[st4.act].d(r.a[1])).toFixed(3) });
  ['sigmoid', 'tanh', 'relu'].forEach(function (a) { var b = $('s4-' + a); b.classList.toggle('active', a === st4.act); b.setAttribute('aria-pressed', a === st4.act ? 'true' : 'false'); });
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function canvasPick(cv, lay, fn) {
  cv.addEventListener('click', function (e) {
    if (!lay()) return; var L = lay(), r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < L.x0 || x > L.x0 + L.w || y < L.y0 || y > L.y0 + L.h) return;
    fn(LO + (x - L.x0) / L.w * (HI - LO), LO + (L.y0 + L.h - y) / L.h * (HI - LO));
  });
}
function init() {
  initLang();
  ['s0-w1', 's0-w2'].forEach(function (id) { $(id).addEventListener('input', render0); });
  ['s1-p', 's1-e'].forEach(function (id) { $(id).addEventListener('input', render1); });
  ['s2-w1', 's2-w2', 's2-st'].forEach(function (id) { $(id).addEventListener('input', function () { stopPlay2(); render2(); }); });
  ['s3-w1', 's3-w2'].forEach(function (id) { $(id).addEventListener('input', function () { stopRun(); trReset(); render3(); }); });
  $('s3-eta').addEventListener('input', render3);
  ['s4-n', 's4-w'].forEach(function (id) { $(id).addEventListener('input', render4); });
  $('s1-w1').addEventListener('click', function () { st1.which = 0; $('s1-p').value = W1_0 * 20; render1(); });
  $('s1-w2').addEventListener('click', function () { st1.which = 1; $('s1-p').value = W2_0 * 20; render1(); });
  $('s2-play').addEventListener('click', function () { if (play2.on) { stopPlay2(); render2(); return; } if (+$('s2-st').value >= 4) $('s2-st').value = 0; play2.on = true; play2.acc = 0; play2.last = performance.now(); play2.raf = requestAnimationFrame(tick2); render2(); });
  $('s3-step').addEventListener('click', function () { stopRun(); trStep(); render3(); });
  $('s3-run').addEventListener('click', function () { if (tr.on) { stopRun(); render3(); return; } if (tr.stopped) trReset(); tr.on = true; tr.acc = 0; tr.last = performance.now(); tr.raf = requestAnimationFrame(tick3); render3(); });
  ['sigmoid', 'tanh', 'relu'].forEach(function (a) { $('s4-' + a).addEventListener('click', function () { st4.act = a; render4(); }); });
  canvasPick($('s0-cv'), function () { return lay0; }, function (a, b) { $('s0-w1').value = Math.round(a * 20); $('s0-w2').value = Math.round(b * 20); render0(); });
  canvasPick($('s3-cv'), function () { return lay3; }, function (a, b) { stopRun(); $('s3-w1').value = Math.round(a * 20); $('s3-w2').value = Math.round(b * 20); trReset(); render3(); });
  var reset = {
    0: function () { $('s0-w1').value = W1_0 * 20; $('s0-w2').value = W2_0 * 20; render0(); },
    1: function () { st1.which = 0; $('s1-p').value = W1_0 * 20; $('s1-e').value = -10; render1(); },
    2: function () { stopPlay2(); $('s2-w1').value = W1_0 * 20; $('s2-w2').value = W2_0 * 20; $('s2-st').value = 0; render2(); },
    3: function () { stopRun(); $('s3-w1').value = W1_0 * 20; $('s3-w2').value = W2_0 * 20; $('s3-eta').value = 20; trReset(); render3(); },
    4: function () { st4.act = 'sigmoid'; $('s4-n').value = 8; $('s4-w').value = 10; render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopPlay2(); stopRun(); renderAll(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
        if (!e.isIntersecting && e.target.id === 'step2' && play2.on) { stopPlay2(); render2(); }
        if (!e.isIntersecting && e.target.id === 'step3' && tr.on) { stopRun(); render3(); }
      });
    }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
