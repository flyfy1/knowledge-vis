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
var D = Math.PI / 180, COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff', '#ffd966'], NT = 6, SCALE = 1 / Math.sqrt(2);
function pol(r, deg) { return [r * Math.cos(deg * D), r * Math.sin(deg * D)]; }
// hand-set toy vectors (not trained): token order The, cat, sat, on, the, mat
var KEYS = [pol(1.2, 120), pol(1.2, 30), pol(1.2, 330), pol(1.2, 250), pol(1.2, 150), pol(1.2, 200)];
var QUERIES = [pol(1.5, 130), pol(1.5, 40), pol(1.5, 20), pol(1.5, 320), pol(1.5, 150), pol(1.5, 260)];
var VALUES = [[-0.3, 0.6], [1, 0.8], [0.9, -0.7], [-0.8, -0.6], [-0.5, 0.4], [0.3, -1]];
function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
function rot(v, deg) { var c = Math.cos(deg * D), s = Math.sin(deg * D); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; }
function softmax(z, beta) {
  var b = beta === undefined ? 1 : beta, mx = -Infinity, i, e = [], s = 0;
  for (i = 0; i < z.length; i++) if (z[i] > mx) mx = z[i];
  for (i = 0; i < z.length; i++) { e[i] = Math.exp(b * (z[i] - mx)); s += e[i]; }
  return e.map(function (v) { return v / s; });
}
function entropyBits(p) { var h = 0; p.forEach(function (v) { if (v > 0) h -= v * Math.log(v) / Math.LN2; }); return h; }
function scores(q) { return KEYS.map(function (k) { return dot(q, k); }); }
function output(w) { var o = [0, 0]; for (var j = 0; j < NT; j++) { o[0] += w[j] * VALUES[j][0]; o[1] += w[j] * VALUES[j][1]; } return o; }
function argmax(a) { var m = 0; for (var i = 1; i < a.length; i++) if (a[i] > a[m]) m = i; return m; }
// attention matrix with optional causal mask; queries rotated by theta degrees
function attnMatrix(theta, causal) {
  return QUERIES.map(function (q, i) {
    var s = scores(rot(q, theta)).map(function (v, j) { return causal && j > i ? -Infinity : v; });
    var mx = -Infinity; s.forEach(function (v) { if (v > mx) mx = v; });
    var e = s.map(function (v) { return v === -Infinity ? 0 : Math.exp(SCALE * (v - mx)); }), z = e.reduce(function (a, b) { return a + b; }, 0);
    return e.map(function (v) { return v / z; });
  });
}
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); }
// random q, 8 random keys of dimension d: dot-product spread and softmax sharpness with and without 1/sqrt(d)
function scaleStudy(d) {
  var r = rng(1000 + d), T = 300, m = 8, raw = [], first = null, maxU = 0, maxS = 0;
  for (var t0 = 0; t0 < T; t0++) {
    var q = [], i, j, sc = [];
    for (i = 0; i < d; i++) q.push(gauss(r));
    for (j = 0; j < m; j++) { var k = []; for (i = 0; i < d; i++) k.push(gauss(r)); sc.push(dot(q, k)); }
    raw = raw.concat(sc);
    var wu = softmax(sc, 1), ws = softmax(sc, 1 / Math.sqrt(d));
    maxU += Math.max.apply(null, wu); maxS += Math.max.apply(null, ws);
    if (t0 === 0) first = { sc: sc, wu: wu, ws: ws };
  }
  var mean = raw.reduce(function (a, b) { return a + b; }, 0) / raw.length;
  var sd = Math.sqrt(raw.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / raw.length);
  return { sdRaw: sd, sdScaled: sd / Math.sqrt(d), meanMaxU: maxU / T, meanMaxS: maxS / T, raw: raw, first: first };
}
var M = { SCALE: SCALE, KEYS: KEYS, QUERIES: QUERIES, VALUES: VALUES, dot: dot, rot: rot, softmax: softmax, entropyBits: entropyBits, scores: scores, output: output, attnMatrix: attnMatrix, scaleStudy: scaleStudy };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
function tok(i) { return t('tok' + i); }
function arrow(c, x0, y0, x1, y1, col, w) {
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w || 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  var a = Math.atan2(y1 - y0, x1 - x0), L = 8; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - L * Math.cos(a - 0.4), y1 - L * Math.sin(a - 0.4)); c.lineTo(x1 - L * Math.cos(a + 0.4), y1 - L * Math.sin(a + 0.4)); c.closePath(); c.fill();
}
function plane(c, cx, cy, R, unit) {
  c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(cx - R, cy - R, 2 * R, 2 * R);
  line(c, [[cx - R, cy], [cx + R, cy]], C.grid, 1, [3, 4]); line(c, [[cx, cy - R], [cx, cy + R]], C.grid, 1, [3, 4]);
  c.beginPath(); c.arc(cx, cy, unit, 0, 7); c.strokeStyle = 'rgba(141,160,176,.25)'; c.stroke();
}
function bars(c, x, y, w, h, vals, vmin, vmax, cols, fmtf, hl) {
  var n = vals.length, bw = w / n, zero = y + h * (vmax / (vmax - vmin));
  c.strokeStyle = C.grid; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); line(c, [[x, zero], [x + w, zero]], C.m, 1);
  for (var i = 0; i < n; i++) {
    var v = vals[i], yy = y + h * (vmax - v) / (vmax - vmin), top = Math.min(yy, zero), bh = Math.abs(yy - zero);
    c.fillStyle = cols[i]; c.globalAlpha = hl === undefined || hl === i ? 0.9 : 0.35; c.fillRect(x + i * bw + 5, top, bw - 10, Math.max(1, bh)); c.globalAlpha = 1;
    txt(c, fmtf(v), x + i * bw + bw / 2, v >= 0 ? top - 3 : top + bh + 11, C.ink, 10, 'center');
    txt(c, tok(i), x + i * bw + bw / 2, y + h + 13, cols[i], 11, 'center');
  }
}
var st = { q: 2 };
function render0() {
  var rotd = +$('s0-rot').value, mul = +$('s0-mul').value / 10; $('s0-rot-v').textContent = rotd + '°'; $('s0-mul-v').textContent = '×' + mul.toFixed(1);
  var q = rot(QUERIES[st.q], rotd).map(function (v) { return v * mul; }), sc = scores(q), cv = $('s0-cv'), c = fit(cv), w = cv._w, R = 100, cx = w / 2, cy = 112, U = 50;
  plane(c, cx, cy, R, U); var j;
  for (j = 0; j < NT; j++) { var k = KEYS[j]; arrow(c, cx, cy, cx + k[0] * U, cy - k[1] * U, COL[j], 2); txt(c, tok(j), cx + k[0] * U * 1.18, cy - k[1] * U * 1.18 + 4, COL[j], 11, 'center'); }
  arrow(c, cx, cy, cx + q[0] * U * 0.9, cy - q[1] * U * 0.9, '#ffffff', 3.2); txt(c, t('s0Q', { w: tok(st.q) }), cx - R, 12, '#fff', 11);
  txt(c, t('s0Keys'), cx + R, 12, C.m, 11, 'right');
  var mx = Math.max(3, Math.max.apply(null, sc.map(Math.abs))) * 1.1;
  txt(c, t('s0Bars'), 10, 236, C.ink, 12); bars(c, 10, 244, w - 20, 120, sc, -mx, mx, COL, function (v) { return v.toFixed(2); }, argmax(sc));
  var b = argmax(sc);
  setHTML('s0-ro', 's0ro', { w: tok(st.q), top: tok(b), s: sc[b].toFixed(2), n: Math.hypot(q[0], q[1]).toFixed(2) });
}
function renderTokBtns(id, cur, fn) {
  var box = $(id); if (!box) return; box.innerHTML = '';
  for (var i = 0; i < NT; i++) (function (i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (i === cur ? ' active' : ''); b.textContent = tok(i); b.setAttribute('aria-pressed', i === cur ? 'true' : 'false'); b.style.borderColor = COL[i];
    b.addEventListener('click', function () { fn(i); }); box.appendChild(b);
  })(i);
}
function render1() {
  var beta = +$('s1-b').value / 100; $('s1-b-v').textContent = beta.toFixed(2);
  var sc = scores(QUERIES[2]), w = softmax(sc, beta), cv = $('s1-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s1Sc', { w: tok(2) }), 10, 14, C.ink, 12); bars(c, 10, 22, W - 20, 120, sc, -2.4, 2.4, COL, function (v) { return v.toFixed(2); });
  txt(c, t('s1W', { b: beta.toFixed(2) }), 10, 182, C.ink, 12); bars(c, 10, 190, W - 20, 120, w, 0, 1, COL, function (v) { return v.toFixed(2); }, argmax(w));
  var uy = 190 + 120 * (1 - 1 / NT); line(c, [[10, uy], [W - 10, uy]], C.m, 1, [4, 4]); txt(c, t('s1Uni'), W - 12, uy - 4, C.m, 10, 'right');
  setHTML('s1-ro', 's1ro', { b: beta.toFixed(2), top: tok(argmax(w)), m: Math.max.apply(null, w).toFixed(2), h: entropyBits(w).toFixed(2), hm: entropyBits(softmax([0, 0, 0, 0, 0, 0])).toFixed(2), sum: w.reduce(function (a, b2) { return a + b2; }, 0).toFixed(3) });
}
var play = { on: false, raf: 0, last: 0 };
function outAt(deg) { var q = pol(1.5, deg), w = softmax(scores(q), SCALE); return { q: q, w: w, o: output(w) }; }
function render2() {
  var deg = +$('s2-th').value; $('s2-th-v').textContent = deg + '°';
  var r = outAt(deg), cv = $('s2-cv'), c = fit(cv), W = cv._w, R = 100, cx = W / 2, cy = 112, U = 70, j, i;
  plane(c, cx, cy, R, U);
  var pts = []; for (i = 0; i <= 120; i++) { var o = outAt(i * 3).o; pts.push([cx + o[0] * U, cy - o[1] * U]); }
  line(c, pts, 'rgba(141,160,176,.45)', 1.5, [3, 3]); line(c, pts.slice(0, Math.round(deg / 3) + 1), C.g, 2.6);
  for (j = 0; j < NT; j++) { var v = VALUES[j]; arrow(c, cx, cy, cx + v[0] * U, cy - v[1] * U, COL[j], 1.2); txt(c, tok(j), cx + v[0] * U * 1.15, cy - v[1] * U * 1.15 + 4, COL[j], 10, 'center'); }
  var px = cx, py = cy;
  for (j = 0; j < NT; j++) { var v2 = VALUES[j], nx = px + r.w[j] * v2[0] * U, ny = py - r.w[j] * v2[1] * U; if (r.w[j] > 0.01) { arrow(c, px, py, nx, ny, COL[j], 3); } px = nx; py = ny; }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(px, py, 5, 0, 7); c.fill(); txt(c, t('s2Out'), px + 8, py - 6, '#fff', 11);
  txt(c, t('s2Cap'), cx - R, 12, C.m, 11);
  bars(c, 10, 250, W - 20, 70, r.w, 0, 1, COL, function (v) { return v.toFixed(2); }, argmax(r.w));
  txt(c, t('s2Wt'), 10, 242, C.ink, 12);
  setHTML('s2-ro', 's2ro', { d: deg, top: tok(argmax(r.w)), ox: r.o[0].toFixed(2), oy: r.o[1].toFixed(2), k: Math.round(deg / 3), n: 120 });
  $('s2-play').textContent = t(play.on ? 's2pause' : 's2play');
}
function stopPlay() { play.on = false; cancelAnimationFrame(play.raf); }
function tick(ts) {
  if (!play.on) return;
  var dt = Math.min(0.1, (ts - play.last) / 1000); play.last = ts;
  var v = +$('s2-th').value + (reduced() ? 0 : 60 * dt);
  if (reduced()) { play.acc = (play.acc || 0) + dt; if (play.acc >= 0.6) { play.acc = 0; v += 30; } }
  if (v >= 360) { v = 360; stopPlay(); }
  $('s2-th').value = Math.round(v); render2();
  if (play.on) play.raf = requestAnimationFrame(tick);
}
function togglePlay() {
  if (play.on) { stopPlay(); render2(); return; }
  if (+$('s2-th').value >= 360) $('s2-th').value = 0;
  play.on = true; play.last = performance.now(); play.raf = requestAnimationFrame(tick); render2();
}
var s3 = { causal: false, row: 2 };
function render3() {
  var th = +$('s3-th').value; $('s3-th-v').textContent = th + '°';
  var A = attnMatrix(th, s3.causal), cv = $('s3-cv'), c = fit(cv), W = cv._w, x0 = 70, y0 = 30, cs = Math.min((W - x0 - 10) / NT, 44), i, j;
  txt(c, t('s3Cols'), x0, 14, C.m, 11); txt(c, t('s3Rows'), 4, y0 + NT * cs + 14, C.m, 11);
  for (j = 0; j < NT; j++) txt(c, tok(j), x0 + j * cs + cs / 2, y0 - 4, COL[j], 11, 'center');
  for (i = 0; i < NT; i++) {
    txt(c, tok(i), x0 - 6, y0 + i * cs + cs / 2 + 4, COL[i], 11, 'right');
    for (j = 0; j < NT; j++) {
      var v = A[i][j]; c.fillStyle = heat(v); c.fillRect(x0 + j * cs, y0 + i * cs, cs - 1, cs - 1);
      txt(c, v.toFixed(2), x0 + j * cs + cs / 2, y0 + i * cs + cs / 2 + 4, v > 0.55 ? '#08131a' : '#eaf4f8', 10, 'center');
      if (s3.causal && j > i) { c.strokeStyle = 'rgba(255,122,147,.7)'; line(c, [[x0 + j * cs + 6, y0 + i * cs + 6], [x0 + j * cs + cs - 7, y0 + i * cs + cs - 7]], 'rgba(255,122,147,.7)', 1.2); }
    }
  }
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x0 - 1, y0 + s3.row * cs - 1, NT * cs + 1, cs + 1);
  var by = y0 + NT * cs + 40; txt(c, t('s3Row', { w: tok(s3.row) }), 10, by, C.ink, 12);
  bars(c, 10, by + 8, W - 20, 70, A[s3.row], 0, 1, COL, function (v2) { return v2.toFixed(2); }, argmax(A[s3.row]));
  var sums = A.map(function (r) { return r.reduce(function (a, b) { return a + b; }, 0); }), minS = Math.min.apply(null, sums), maxS = Math.max.apply(null, sums);
  var up = 0; for (i = 0; i < NT; i++) for (j = i + 1; j < NT; j++) up += A[i][j];
  setHTML('s3-ro', 's3ro', { th: th, mode: t(s3.causal ? 's3Mc' : 's3Mf'), lo: minS.toFixed(3), hi: maxS.toFixed(3), up: up.toFixed(3), w: tok(s3.row), top: tok(argmax(A[s3.row])), tv: Math.max.apply(null, A[s3.row]).toFixed(2) });
  var b = $('s3-mask'); b.textContent = t(s3.causal ? 's3MaskOn' : 's3MaskOff'); b.setAttribute('aria-pressed', s3.causal ? 'true' : 'false');
  renderTokBtns('s3-tok', s3.row, function (i2) { s3.row = i2; render3(); });
}
function render4() {
  var e = +$('s4-e').value, d = Math.pow(2, e); $('s4-e-v').textContent = 'd = ' + d;
  var r = scaleStudy(d), cv = $('s4-cv'), c = fit(cv), W = cv._w, i;
  function hist(y, label, sd, rng_, col) {
    var nb = 41, h = [], bw = (W - 20) / nb, mx = 1;
    for (i = 0; i < nb; i++) h.push(0);
    r.raw.forEach(function (v) { var b = Math.floor((v / sd * sd / rng_ + 1) / 2 * nb); if (b >= 0 && b < nb) h[b]++; });
    h.forEach(function (v) { if (v > mx) mx = v; });
    txt(c, label, 10, y - 5, col, 12); c.strokeStyle = C.grid; c.strokeRect(10.5, y + 0.5, W - 21, 70);
    h.forEach(function (v, b) { var hh = v / mx * 66; c.fillStyle = col; c.globalAlpha = 0.75; c.fillRect(10 + b * bw + 1, y + 69 - hh, bw - 1, hh); c.globalAlpha = 1; });
    line(c, [[W / 2, y], [W / 2, y + 70]], C.m, 1, [3, 3]);
    txt(c, '-' + rng_.toFixed(0), 12, y + 82, C.m, 10); txt(c, '+' + rng_.toFixed(0), W - 12, y + 82, C.m, 10, 'right'); txt(c, '0', W / 2, y + 82, C.m, 10, 'center');
  }
  var rngU = 64;
  hist(26, t('s4HU', { sd: r.sdRaw.toFixed(2) }), 1, rngU, C.o);
  var scaledRaw = r.raw; // same samples, rescaled by 1/sqrt(d) for the second histogram
  (function () {
    var y = 134, nb = 41, h = [], bw = (W - 20) / nb, mx = 1, rg = 4;
    for (i = 0; i < nb; i++) h.push(0);
    scaledRaw.forEach(function (v) { var b = Math.floor((v / Math.sqrt(d) / rg + 1) / 2 * nb); if (b >= 0 && b < nb) h[b]++; });
    h.forEach(function (v) { if (v > mx) mx = v; });
    txt(c, t('s4HS', { sd: r.sdScaled.toFixed(2) }), 10, y - 5, C.a, 12); c.strokeStyle = C.grid; c.strokeRect(10.5, y + 0.5, W - 21, 70);
    h.forEach(function (v, b) { var hh = v / mx * 66; c.fillStyle = C.a; c.globalAlpha = 0.75; c.fillRect(10 + b * bw + 1, y + 69 - hh, bw - 1, hh); c.globalAlpha = 1; });
    line(c, [[W / 2, y], [W / 2, y + 70]], C.m, 1, [3, 3]);
    txt(c, '-4', 12, y + 82, C.m, 10); txt(c, '+4', W - 12, y + 82, C.m, 10, 'right'); txt(c, '0', W / 2, y + 82, C.m, 10, 'center');
  })();
  var f = r.first, y3 = 262, bw3 = (W - 20) / 8; txt(c, t('s4Trial'), 10, y3 - 6, C.ink, 12);
  for (i = 0; i < 8; i++) {
    var x = 10 + i * bw3; c.fillStyle = C.o; c.fillRect(x + 4, y3 + 60 - f.wu[i] * 56, (bw3 - 8) / 2, f.wu[i] * 56); c.fillStyle = C.a; c.fillRect(x + 4 + (bw3 - 8) / 2, y3 + 60 - f.ws[i] * 56, (bw3 - 8) / 2, f.ws[i] * 56);
  }
  c.strokeStyle = C.grid; c.strokeRect(10.5, y3 + 0.5, W - 21, 60); txt(c, t('s4Leg'), 10, y3 + 76, C.m, 11);
  setHTML('s4-ro', 's4ro', { d: d, sr: r.sdRaw.toFixed(2), ts: Math.sqrt(d).toFixed(2), ss: r.sdScaled.toFixed(2), mu: r.meanMaxU.toFixed(2), ms: r.meanMaxS.toFixed(2) });
}

/* ---------------- wiring ---------------- */
function renderAll() { renderTokBtns('s0-tok', st.q, function (i) { st.q = i; renderAll(); }); render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  [['s0-rot', render0], ['s0-mul', render0], ['s1-b', render1], ['s3-th', render3], ['s4-e', render4]].forEach(function (p) { $(p[0]).addEventListener('input', p[1]); });
  $('s2-th').addEventListener('input', function () { stopPlay(); render2(); });
  $('s2-play').addEventListener('click', togglePlay);
  $('s3-mask').addEventListener('click', function () { s3.causal = !s3.causal; render3(); });
  var reset = {
    0: function () { st.q = 2; $('s0-rot').value = 0; $('s0-mul').value = 10; renderAll(); },
    1: function () { $('s1-b').value = 100; render1(); },
    2: function () { stopPlay(); $('s2-th').value = 20; render2(); },
    3: function () { s3.causal = false; s3.row = 2; $('s3-th').value = 0; render3(); },
    4: function () { $('s4-e').value = 4; render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopPlay(); render2(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
        if (e.target.id === 'step2' && !e.isIntersecting && play.on) { stopPlay(); render2(); }
      });
    }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
