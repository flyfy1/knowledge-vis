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
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t0 = a; t0 = Math.imul(t0 ^ (t0 >>> 15), t0 | 1); t0 ^= t0 + Math.imul(t0 ^ (t0 >>> 7), t0 | 61); return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); }
function f(x) { return Math.sin(2 * Math.PI * x); }
function makeSet(n, seed, sigma) { var r = rng(seed), xs = [], ys = []; for (var i = 0; i < n; i++) { var x = (i + 0.1 + 0.8 * r()) / n; xs.push(x); ys.push(f(x) + sigma * gauss(r)); } return { xs: xs, ys: ys }; }
// polynomial in t = 2x - 1 written in the Chebyshev basis (well conditioned); ridge penalty lam on all coefficients
function basis(t, m) { var b = [1, t], j; for (j = 2; j < m; j++) b.push(2 * t * b[j - 1] - b[j - 2]); return b.slice(0, m); }
function solve(A, b) {
  var n = b.length, i, j, k;
  for (i = 0; i < n; i++) {
    var p = i; for (j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
    var tr = A[i]; A[i] = A[p]; A[p] = tr; var tb = b[i]; b[i] = b[p]; b[p] = tb;
    for (j = i + 1; j < n; j++) { var m = A[j][i] / A[i][i]; for (k = i; k < n; k++) A[j][k] -= m * A[i][k]; b[j] -= m * b[i]; }
  }
  var w = new Array(n).fill(0);
  for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * w[j]; w[i] = s / A[i][i]; }
  return w;
}
function polyFit(xs, ys, d, lam) {
  var m = d + 1, A = [], b = [], i, j, k;
  for (i = 0; i < m; i++) { A.push(new Array(m).fill(0)); b.push(0); }
  xs.forEach(function (x, idx) { var pw = basis(2 * x - 1, m); for (i = 0; i < m; i++) { b[i] += pw[i] * ys[idx]; for (k = 0; k < m; k++) A[i][k] += pw[i] * pw[k]; } });
  for (i = 0; i < m; i++) A[i][i] += lam;
  return solve(A, b);
}
function polyEval(w, x) { var b = basis(2 * x - 1, w.length), s = 0; for (var j = 0; j < w.length; j++) s += w[j] * b[j]; return s; }
function rmse(w, set) { var s = 0; set.xs.forEach(function (x, i) { var e = polyEval(w, x) - set.ys[i]; s += e * e; }); return Math.sqrt(s / set.xs.length); }
var LAM0 = 1e-9, NTEST = 300, TEST_SEED = 4242, TRAIN_SEED = 11;
function errors(n, sigma, d, lam) { var tr = makeSet(n, TRAIN_SEED, sigma), te = makeSet(NTEST, TEST_SEED, sigma), w = polyFit(tr.xs, tr.ys, d, lam === undefined ? LAM0 : lam); return { w: w, tr: rmse(w, tr), te: rmse(w, te), train: tr }; }
// spread across resampled fits on a grid
function resampleStats(d, m, sigma, n) {
  var fits = [], gridN = 41, i, k;
  for (k = 0; k < m; k++) { var s = makeSet(n, 500 + k, sigma); fits.push(polyFit(s.xs, s.ys, d, LAM0)); }
  var mean = [], vr = 0, bias = 0;
  for (i = 0; i < gridN; i++) { var x = i / (gridN - 1), vals = fits.map(function (w) { return polyEval(w, x); }), mu = vals.reduce(function (a, b) { return a + b; }, 0) / m; mean.push(mu); vr += vals.reduce(function (a, v) { return a + (v - mu) * (v - mu); }, 0) / m; bias += (mu - f(x)) * (mu - f(x)); }
  return { fits: fits, mean: mean, variance: vr / gridN, bias2: bias / gridN };
}
var M = { f: f, makeSet: makeSet, polyFit: polyFit, polyEval: polyEval, rmse: rmse, errors: errors, resampleStats: resampleStats, NTEST: NTEST, TRAIN_SEED: TRAIN_SEED, TEST_SEED: TEST_SEED };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
function f2(v) { return (+v).toFixed(2); } function f3(v) { return (+v).toFixed(3); }
function frame(c, x, y, w, h, yr) { c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); var yy = function (v) { return y + h - (v - yr[0]) / (yr[1] - yr[0]) * h; }; line(c, [[x, yy(0)], [x + w, yy(0)]], C.grid, 1, [3, 4]); return { X: function (v) { return x + v * w; }, Y: yy, x: x, y: y, w: w, h: h }; }
function clipCurve(c, P, fn, col, lw, dash, yr) {
  c.save(); c.beginPath(); c.rect(P.x, P.y, P.w, P.h); c.clip(); var pts = []; for (var i = 0; i <= 120; i++) { var x = i / 120; pts.push([P.X(x), P.Y(fn(x))]); } line(c, pts, col, lw, dash); c.restore();
}
function dots(c, P, set, col) { set.xs.forEach(function (x, i) { c.fillStyle = col; c.strokeStyle = '#08131a'; c.lineWidth = 1; c.beginPath(); c.arc(P.X(x), P.Y(set.ys[i]), 4, 0, 7); c.fill(); c.stroke(); }); }
var YR = [-1.8, 1.8];
function render0() {
  var d = +$('s0-d').value; $('s0-d-v').textContent = String(d);
  var e = errors(12, 0.25, d), cv = $('s0-cv'), c = fit(cv), W = cv._w, P = frame(c, 10, 22, W - 20, 270, YR);
  txt(c, t('s0Cap'), 10, 14, C.ink, 12);
  clipCurve(c, P, f, 'rgba(255,255,255,.6)', 1.6, [5, 4]); clipCurve(c, P, function (x) { return polyEval(e.w, x); }, C.o, 2.8); dots(c, P, e.train, C.a);
  wrapTxt(c, t('s0Leg'), 10, 310, W - 20, 14, C.m, 11);
  var verdict = d <= 1 ? 'v0' : (d <= 4 ? 'v1' : 'v2');
  setHTML('s0-ro', 's0ro', { d: d, p: d + 1, tr: f3(e.tr), v: t('s0' + verdict) });
}
function render1() {
  var d = +$('s1-d').value, sg = +$('s1-z').value / 100; $('s1-d-v').textContent = String(d); $('s1-z-v').textContent = f2(sg);
  var cv = $('s1-cv'), c = fit(cv), W = cv._w, gx = 40, gy = 24, gw = W - gx - 12, gh = 210, trs = [], tes = [], k, mx = 0.6;
  for (k = 0; k <= 11; k++) { var e = errors(12, sg, k); trs.push(e.tr); tes.push(e.te); }
  txt(c, t('s1Cap'), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  function X(kk) { return gx + gw * kk / 11; } function Y(v) { return gy + gh - Math.min(v, mx) / mx * (gh - 6) - 3; }
  [0, 0.2, 0.4, 0.6].forEach(function (v) { line(c, [[gx, Y(v)], [gx + gw, Y(v)]], C.grid, 1, [3, 4]); txt(c, v.toFixed(1), gx - 4, Y(v) + 4, C.m, 10, 'right'); });
  line(c, [[gx, Y(sg)], [gx + gw, Y(sg)]], C.g, 1.4, [6, 4]);
  line(c, trs.map(function (v, i) { return [X(i), Y(v)]; }), C.a, 2.4); line(c, tes.map(function (v, i) { return [X(i), Y(v)]; }), C.o, 2.4);
  for (k = 0; k <= 11; k++) txt(c, String(k), X(k), gy + gh + 14, C.m, 10, 'center');
  line(c, [[X(d), gy], [X(d), gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]); c.fillStyle = C.a; c.beginPath(); c.arc(X(d), Y(trs[d]), 5, 0, 7); c.fill(); c.fillStyle = C.o; c.beginPath(); c.arc(X(d), Y(tes[d]), 5, 0, 7); c.fill();
  txt(c, t('s1Ax'), gx + gw, gy + gh + 28, C.m, 10, 'right'); txt(c, t('s1LegTr'), gx + 6, gy + gh - 30, C.a, 11); txt(c, t('s1LegTe'), gx + 6, gy + gh - 16, C.o, 11); txt(c, t('s1LegN'), gx + gw - 4, Y(sg) - 5, C.g, 10, 'right');
  var best = 0; tes.forEach(function (v, i) { if (v < tes[best]) best = i; });
  setHTML('s1-ro', 's1ro', { d: d, sg: f2(sg), tr: f3(trs[d]), te: f3(tes[d]), b: best, bt: f3(tes[best]) });
}
function render2() {
  var n = +$('s2-n').value; $('s2-n-v').textContent = String(n);
  var d = 9, sg = 0.25, e = errors(n, sg, d), cv = $('s2-cv'), c = fit(cv), W = cv._w, P = frame(c, 10, 22, W - 20, 190, YR);
  txt(c, t('s2Cap', { n: n, d: d }), 10, 14, C.ink, 12);
  clipCurve(c, P, f, 'rgba(255,255,255,.6)', 1.6, [5, 4]); clipCurve(c, P, function (x) { return polyEval(e.w, x); }, C.o, 2.6); dots(c, P, e.train, C.a);
  var gy = 252, gh = 100, gx = 40, gw = W - gx - 12, ns = [], trs = [], tes = [], mx = 1.2, k;
  for (k = 10; k <= 80; k += 5) { var q = errors(k, sg, d); ns.push(k); trs.push(q.tr); tes.push(q.te); }
  txt(c, t('s2Lc'), 10, gy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  function X(v) { return gx + gw * (v - 10) / 70; } function Y(v) { return gy + gh - Math.min(v, mx) / mx * (gh - 6) - 3; }
  line(c, [[gx, Y(sg)], [gx + gw, Y(sg)]], C.g, 1.4, [6, 4]); line(c, trs.map(function (v, i) { return [X(ns[i]), Y(v)]; }), C.a, 2.2); line(c, tes.map(function (v, i) { return [X(ns[i]), Y(v)]; }), C.o, 2.2);
  line(c, [[X(n), gy], [X(n), gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]); [10, 30, 50, 80].forEach(function (v) { txt(c, String(v), X(v), gy + gh + 13, C.m, 10, 'center'); });
  txt(c, t('s2Ax'), gx + gw, gy + gh + 27, C.m, 10, 'right'); txt(c, t('s2Leg'), gx + 6, gy + 14, C.m, 10);
  setHTML('s2-ro', 's2ro', { n: n, d: d, tr: f3(e.tr), te: f3(e.te), gap: f3(e.te - e.tr) });
}
var st3 = { m: 0 };
function render3() {
  var d = +$('s3-d').value; $('s3-d-v').textContent = String(d); $('s3-m-v').textContent = st3.m + ' / 20';
  var cv = $('s3-cv'), c = fit(cv), W = cv._w, P = frame(c, 10, 22, W - 20, 280, YR), sg = 0.25;
  txt(c, t('s3Cap', { d: d }), 10, 14, C.ink, 12);
  var rs = st3.m >= 1 ? resampleStats(d, st3.m, sg, 12) : null;
  if (rs) { rs.fits.forEach(function (w) { clipCurve(c, P, function (x) { return polyEval(w, x); }, 'rgba(246,164,91,.35)', 1.4); }); clipCurve(c, P, function (x) { return rs.mean[Math.round(x * 40)]; }, C.g, 2.8); }
  clipCurve(c, P, f, '#ffffff', 1.6, [5, 4]);
  wrapTxt(c, t('s3Leg'), 10, 318, W - 20, 14, C.m, 11);
  setHTML('s3-ro', 's3ro', { m: st3.m, d: d, b: rs && st3.m >= 2 ? f3(rs.bias2) : '—', v: rs && st3.m >= 2 ? f3(rs.variance) : '—' });
}
function render4() {
  var lg = +$('s4-l').value / 10, lam = Math.pow(10, lg); $('s4-l-v').textContent = '10^' + lg.toFixed(1);
  var n = 12, d = 11, sg = 0.25, e = errors(n, sg, d, lam), cv = $('s4-cv'), c = fit(cv), W = cv._w, P = frame(c, 10, 22, W - 20, 190, YR);
  txt(c, t('s4Cap', { d: d }), 10, 14, C.ink, 12);
  clipCurve(c, P, f, 'rgba(255,255,255,.6)', 1.6, [5, 4]); clipCurve(c, P, function (x) { return polyEval(e.w, x); }, C.o, 2.6); dots(c, P, e.train, C.a);
  var gy = 252, gh = 100, gx = 40, gw = W - gx - 12, trs = [], tes = [], mx = 1.0, k, best = { v: 9, l: 0 };
  for (k = -90; k <= 10; k += 5) { var q = errors(n, sg, d, Math.pow(10, k / 10)); trs.push(q.tr); tes.push(q.te); if (q.te < best.v) best = { v: q.te, l: k / 10 }; }
  txt(c, t('s4Lc'), 10, gy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  function X(l) { return gx + gw * (l + 9) / 10; } function Y(v) { return gy + gh - Math.min(v, mx) / mx * (gh - 6) - 3; }
  line(c, [[gx, Y(sg)], [gx + gw, Y(sg)]], C.g, 1.4, [6, 4]); line(c, trs.map(function (v, i) { return [X(-9 + i / 2), Y(v)]; }), C.a, 2.2); line(c, tes.map(function (v, i) { return [X(-9 + i / 2), Y(v)]; }), C.o, 2.2);
  line(c, [[X(lg), gy], [X(lg), gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]); c.fillStyle = '#fff'; c.beginPath(); c.arc(X(best.l), Y(best.v), 4, 0, 7); c.fill();
  [-9, -6, -3, 0].forEach(function (v) { txt(c, '1e' + v, X(v), gy + gh + 13, C.m, 10, 'center'); }); txt(c, t('s4Ax'), gx + gw, gy + gh + 27, C.m, 10, 'right'); txt(c, t('s4Leg'), gx + 6, gy + 14, C.m, 10);
  setHTML('s4-ro', 's4ro', { l: lg.toFixed(1), tr: f3(e.tr), te: f3(e.te), bl: best.l.toFixed(1), bt: f3(best.v) });
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  ['s0-d'].forEach(function (id) { $(id).addEventListener('input', render0); });
  ['s1-d', 's1-z'].forEach(function (id) { $(id).addEventListener('input', render1); });
  $('s2-n').addEventListener('input', render2);
  $('s3-d').addEventListener('input', render3);
  $('s3-add').addEventListener('click', function () { if (st3.m < 20) st3.m++; render3(); });
  $('s3-add5').addEventListener('click', function () { st3.m = Math.min(20, st3.m + 5); render3(); });
  $('s4-l').addEventListener('input', render4);
  var reset = {
    0: function () { $('s0-d').value = 3; render0(); },
    1: function () { $('s1-d').value = 3; $('s1-z').value = 25; render1(); },
    2: function () { $('s2-n').value = 12; render2(); },
    3: function () { st3.m = 0; $('s3-d').value = 9; render3(); },
    4: function () { $('s4-l').value = -90; render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
