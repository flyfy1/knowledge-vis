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
var FS = 256, N = 256, W0 = 6, R2 = Math.SQRT2;
function smoothStep(x) { x = cl(x, 0, 1); return x * x * (3 - 2 * x); }
// tone of 12 Hz until about u0, then 40 Hz; cross-fade is 0.2 of the record wide
function toneSignal(u0) {
  var a = [];
  for (var i = 0; i < N; i++) {
    var u = i / N, wl = 1 - smoothStep((u - u0 + 0.1) / 0.2);
    a.push(wl * Math.sin(2 * Math.PI * 12 * i / FS) + (1 - wl) * Math.sin(2 * Math.PI * 40 * i / FS));
  }
  return a;
}
function reverse(a) { return a.slice().reverse(); }
function dftMag(x) {
  var n = x.length, out = [];
  for (var k = 0; k <= n / 2; k++) {
    var re = 0, im = 0;
    for (var j = 0; j < n; j++) { var ph = 2 * Math.PI * k * j / n; re += x[j] * Math.cos(ph); im -= x[j] * Math.sin(ph); }
    out.push(Math.hypot(re, im) * 2 / n);
  }
  return out;
}
function specDiff(a, b) { var m = 0; for (var i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; }
function rmsDiff(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]); return Math.sqrt(s / a.length); }
// Gaussian-windowed Fourier magnitude at frequency f (Hz), window length L samples, centred at sample c
function stftAt(x, f, L, c) {
  var sg = L / 6, re = 0, im = 0, gs = 0, half = Math.floor(L / 2);
  for (var j = -half; j < half; j++) {
    var g = Math.exp(-0.5 * (j / sg) * (j / sg)); gs += g;
    var idx = c + j; if (idx < 0 || idx >= x.length) continue;
    var ph = 2 * Math.PI * f * idx / FS; re += x[idx] * g * Math.cos(ph); im -= x[idx] * g * Math.sin(ph);
  }
  return 2 * Math.hypot(re, im) / gs;
}
// Morlet wavelet coefficient magnitude, amplitude-normalised so a unit sine at f gives about 1
function morletAt(x, f, tau, w0) {
  var s = w0 / (2 * Math.PI * f) * FS, half = Math.ceil(4 * s), re = 0, im = 0, es = 0;
  for (var m = -half; m <= half; m++) {
    var env = Math.exp(-0.5 * (m / s) * (m / s)); es += env;
    var idx = tau + m; if (idx < 0 || idx >= x.length) continue;
    var ph = w0 * m / s; re += x[idx] * env * Math.cos(ph); im += x[idx] * env * Math.sin(ph);
  }
  return 2 * Math.hypot(re, im) / es;
}
// 1-sigma widths of each analysis window's amplitude profile
function stftSigmas(L) { var st = L / 6 / FS; return { t: st, f: 1 / (2 * Math.PI * st) }; }
function cwtSigmas(f, w0) { var st = w0 / (2 * Math.PI * f); return { t: st, f: f / w0 }; }
function fwhm(arr, step) {
  var mx = 0, im = 0, i;
  for (i = 0; i < arr.length; i++) if (arr[i] > mx) { mx = arr[i]; im = i; }
  var h = mx / 2, lo = 0, hi = arr.length - 1;
  for (i = im; i > 0; i--) if (arr[i - 1] < h) { lo = i - 1 + (h - arr[i - 1]) / (arr[i] - arr[i - 1]); break; }
  for (i = im; i < arr.length - 1; i++) if (arr[i + 1] < h) { hi = i + (arr[i] - h) / (arr[i] - arr[i + 1]); break; }
  return (hi - lo) * step;
}
// frequency FWHM (Hz) of the 12 Hz ridge at t = 0.25 s for window length L
function ridgeWidth(L) {
  var x = toneSignal(0.5), arr = [];
  for (var f = 0; f <= 40; f += 0.5) arr.push(stftAt(x, f, L, 64));
  return fwhm(arr, 0.5);
}
function morletRow(x, f, w0) { var r = []; for (var i = 0; i < x.length; i += 2) r.push(morletAt(x, f, i, w0)); return r; }
// orthonormal Haar transform; layout [approx, level details coarse..fine]
function haarFwd(x) {
  var n = x.length, c = x.slice(), o = new Array(n), len = n, i;
  while (len > 1) {
    var h = len / 2, a = [];
    for (i = 0; i < h; i++) { a[i] = (c[2 * i] + c[2 * i + 1]) / R2; o[h + i] = (c[2 * i] - c[2 * i + 1]) / R2; }
    for (i = 0; i < h; i++) c[i] = a[i];
    len = h;
  }
  o[0] = c[0]; return o;
}
function haarInv(o) {
  var n = o.length, c = [o[0]], len = 1;
  while (len < n) {
    var nx = [];
    for (var i = 0; i < len; i++) { nx[2 * i] = (c[i] + o[len + i]) / R2; nx[2 * i + 1] = (c[i] - o[len + i]) / R2; }
    c = nx; len *= 2;
  }
  return c;
}
var BASIS = {};
function fourierBasis(n) {
  if (BASIS[n]) return BASIS[n];
  var B = [], k, j, r;
  r = []; for (j = 0; j < n; j++) r.push(1 / Math.sqrt(n)); B.push(r);
  for (k = 1; k < n / 2; k++) {
    var rc = [], rs = [];
    for (j = 0; j < n; j++) { rc.push(Math.sqrt(2 / n) * Math.cos(2 * Math.PI * k * j / n)); rs.push(Math.sqrt(2 / n) * Math.sin(2 * Math.PI * k * j / n)); }
    B.push(rc); B.push(rs);
  }
  r = []; for (j = 0; j < n; j++) r.push((j % 2 ? -1 : 1) / Math.sqrt(n)); B.push(r);
  BASIS[n] = B; return B;
}
function fourierFwd(x) { return fourierBasis(x.length).map(function (b) { var s = 0; for (var j = 0; j < x.length; j++) s += b[j] * x[j]; return s; }); }
function fourierInv(c) {
  var n = c.length, B = fourierBasis(n), y = new Array(n).fill(0);
  for (var r = 0; r < n; r++) if (c[r]) for (var j = 0; j < n; j++) y[j] += c[r] * B[r][j];
  return y;
}
function keepTop(c, K) {
  var idx = c.map(function (v, i) { return i; });
  idx.sort(function (a, b) { return Math.abs(c[b]) - Math.abs(c[a]) || a - b; });
  var out = new Array(c.length).fill(0);
  for (var i = 0; i < K && i < idx.length; i++) out[idx[i]] = c[idx[i]];
  return out;
}
var N4 = 128;
function cleanSignal() { var a = []; for (var i = 0; i < N4; i++) a.push(0.15 * Math.sin(2 * Math.PI * 2 * i / N4) + ((i >= 45 && i < 77) ? 0.8 : 0) + ((i >= 100 && i < 104) ? 0.56 : 0)); return a; }
var UNIT = null;
function unitNoise() {
  if (UNIT) return UNIT;
  var s = 12345; UNIT = [];
  function u() { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }
  for (var i = 0; i < N4; i++) { var g = -6; for (var k = 0; k < 12; k++) g += u(); UNIT.push(g); }
  return UNIT;
}
function compress(K, sd) {
  var cleanS = cleanSignal(), un = unitNoise(), x = cleanS.map(function (v, i) { return v + un[i] * sd; });
  var ch = haarFwd(x), kh = keepTop(ch, K), rh = haarInv(kh);
  var cf = fourierFwd(x), kf = keepTop(cf, K), rf = fourierInv(kf);
  return { clean: cleanS, x: x, rh: rh, rf: rf, rmseH: rmsDiff(rh, cleanS), rmseF: rmsDiff(rf, cleanS), rmseIn: rmsDiff(x, cleanS), ch: ch, kh: kh, cf: cf, kf: kf };
}
function eventSignal() {
  var a = [];
  function g(u, c, s) { return Math.exp(-0.5 * (u - c) * (u - c) / (s * s)); }
  for (var i = 0; i < N; i++) {
    var u = i / N;
    a.push(0.8 * g(u, 0.3, 0.09) * Math.sin(2 * Math.PI * 8 * u) + 0.9 * (g(u, 0.66, 0.012) + g(u, 0.74, 0.012)) * Math.sin(2 * Math.PI * 48 * u));
  }
  return a;
}
var FREQS3 = []; for (var jf = 0; jf < 28; jf++) FREQS3.push(4 * Math.pow(96 / 4, jf / 27));
var M = { FS: FS, N: N, W0: W0, toneSignal: toneSignal, reverse: reverse, dftMag: dftMag, specDiff: specDiff, rmsDiff: rmsDiff, stftAt: stftAt, morletAt: morletAt, stftSigmas: stftSigmas, cwtSigmas: cwtSigmas, ridgeWidth: ridgeWidth, haarFwd: haarFwd, haarInv: haarInv, fourierFwd: fourierFwd, fourierInv: fourierInv, keepTop: keepTop, compress: compress, eventSignal: eventSignal, cleanSignal: cleanSignal, morletRow: morletRow };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
function wave(c, x, y, w, h, arr, col, lw) {
  c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  line(c, [[x, y + h / 2], [x + w, y + h / 2]], C.grid, 1, [3, 4]);
  var pts = arr.map(function (v, i) { return [x + w * i / (arr.length - 1), y + h / 2 - cl(v, -1.15, 1.15) / 1.15 * (h / 2 - 3)]; });
  line(c, pts, col, lw || 1.6);
}
function axisLabelsT(c, x, y, w) {
  [0, 0.25, 0.5, 0.75, 1].forEach(function (u) { txt(c, (u).toFixed(2).replace(/0$/, ''), x + w * u, y, C.m, 10, u === 0 ? 'left' : (u === 1 ? 'right' : 'center')); });
}

function render0() {
  var u0 = +$('s0-u').value / 100, A = toneSignal(u0), B = reverse(A);
  $('s0-u-v').textContent = u0.toFixed(2);
  var cv = $('s0-cv'), c = fit(cv), w = cv._w, px = 10, pw = w - 20;
  txt(c, t('s0A'), px, 14, C.a, 12); wave(c, px, 20, pw, 66, A, C.a);
  txt(c, t('s0B'), px, 108, C.o, 12); wave(c, px, 114, pw, 66, B, C.o);
  txt(c, t('timeAxis'), px + pw, 198, C.m, 10, 'right');
  var MA = dftMag(A), MB = dftMag(B), sy = 232, sh = 116, bw = pw / 65;
  txt(c, t('s0Spec'), px, 222, C.ink, 12);
  c.strokeStyle = C.grid; c.strokeRect(px + 0.5, sy + 0.5, pw - 1, sh - 1);
  for (var k = 0; k <= 64; k++) {
    var hh = MA[k] * (sh - 8), bx = px + k * bw;
    c.fillStyle = 'rgba(103,215,249,.55)'; c.fillRect(bx, sy + sh - hh, Math.max(1, bw - 1), hh);
    c.fillStyle = C.o; c.beginPath(); c.arc(bx + bw / 2, sy + sh - MB[k] * (sh - 8), 2.2, 0, 7); c.fill();
  }
  [0, 16, 32, 48, 64].forEach(function (f) { txt(c, String(f), px + f * bw + bw / 2, sy + sh + 13, C.m, 10, 'center'); });
  txt(c, t('freqAxis'), px + pw, sy + sh + 27, C.m, 10, 'right');
  txt(c, t('s0LegA'), px + 4, sy + 14, C.a, 11); txt(c, t('s0LegB'), px + 4, sy + 28, C.o, 11);
  setHTML('s0-ro', 's0ro', { u: u0.toFixed(2), lo: MA[12].toFixed(2), hi: MA[40].toFixed(2), d: specDiff(MA, MB).toExponential(1), r: rmsDiff(A, B).toFixed(2) });
}

function render1() {
  var L = +$('s1-L').value; $('s1-L-v').textContent = L + ' ' + t('unitSamp');
  var cv = $('s1-cv'), c = fit(cv), w = cv._w, x0 = 40, pw = w - x0 - 10, y0 = 8, ph = 236, x = toneSignal(0.5);
  var cols = 64, rows = 64, cw = pw / cols, rh = ph / rows, r, k;
  for (k = 0; k < cols; k++) for (r = 1; r <= rows; r++) {
    c.fillStyle = heat(stftAt(x, r, L, k * 4 + 2)); c.fillRect(x0 + k * cw, y0 + ph - r * rh, cw + 0.6, rh + 0.6);
  }
  c.strokeStyle = C.grid; c.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
  [12, 40].forEach(function (f) { line(c, [[x0, y0 + ph - f * rh], [x0 + pw, y0 + ph - f * rh]], 'rgba(255,255,255,.35)', 1, [2, 5]); });
  line(c, [[x0 + pw / 2, y0], [x0 + pw / 2, y0 + ph]], 'rgba(255,255,255,.35)', 1, [2, 5]);
  [0, 16, 32, 48, 64].forEach(function (f) { txt(c, String(f), x0 - 5, y0 + ph - f * rh + 4, C.m, 10, 'right'); });
  txt(c, t('freqAxis'), 4, y0 + 8, C.m, 10);
  axisLabelsT(c, x0, y0 + ph + 14, pw); txt(c, t('timeAxis'), x0 + pw, y0 + ph + 28, C.m, 10, 'right');
  txt(c, t('s1Guide'), x0 + 6, y0 + 14, '#fff', 11);
  // the analysis window drawn to scale on the time axis
  var wy = y0 + ph + 34, wh = 30, wpx = pw * L / N, cx = x0 + pw / 2, pts = [];
  for (var i = -50; i <= 50; i++) { var fr = i / 50; pts.push([cx + fr * wpx / 2, wy + wh - wh * Math.exp(-0.5 * (fr * 3) * (fr * 3))]); }
  line(c, pts, C.o, 1.8); txt(c, t('s1Win'), x0, wy + 12, C.o, 11);
  var rw = ridgeWidth(L), sg = stftSigmas(L);
  setHTML('s1-ro', 's1ro', { T: (L / FS * 1000).toFixed(0), w: rw.toFixed(1), st: (sg.t * 1000).toFixed(0) });
}

var play = { on: false, raf: 0, last: 0, acc: 0 };
function render2() {
  var f = +$('s2-f').value, tp = +$('s2-tau').value, tau = Math.round(tp / 100 * (N - 1));
  $('s2-f-v').textContent = f + ' Hz'; $('s2-tau-v').textContent = (tau / FS).toFixed(2) + ' s';
  var x = toneSignal(0.5), cv = $('s2-cv'), c = fit(cv), w = cv._w, px = 10, pw = w - 20, i;
  txt(c, t('s2Sig'), px, 14, C.a, 12); wave(c, px, 20, pw, 120, x, C.a, 1.3);
  var s = W0 / (2 * Math.PI * f) * FS, half = Math.ceil(3.5 * s), pts = [], env = [], env2 = [];
  for (var m = -half; m <= half; m++) {
    var e = Math.exp(-0.5 * (m / s) * (m / s)), px_ = px + pw * (tau + m) / (N - 1);
    pts.push([px_, 80 - Math.cos(W0 * m / s) * e * 52]); env.push([px_, 80 - e * 52]); env2.push([px_, 80 + e * 52]);
  }
  line(c, env, 'rgba(246,164,91,.5)', 1, [3, 3]); line(c, env2, 'rgba(246,164,91,.5)', 1, [3, 3]); line(c, pts, C.o, 2);
  var ex = px + pw * tau / (N - 1); line(c, [[ex, 20], [ex, 140]], 'rgba(246,164,91,.4)', 1);
  txt(c, t('s2Wav'), px + pw, 14, C.o, 12, 'right');
  var row = morletRow(x, f, W0), by = 168, bh = 118, n = row.length;
  txt(c, t('s2Coef'), px, 160, C.ink, 12);
  c.strokeStyle = C.grid; c.strokeRect(px + 0.5, by + 0.5, pw - 1, bh - 1);
  var hi = [], lo = [];
  for (i = 0; i < n; i++) { var pt = [px + pw * (i * 2) / (N - 1), by + bh - 6 - row[i] * (bh - 14)]; if (i * 2 <= tau) hi.push(pt); if (i * 2 >= tau - 2) lo.push(pt); }
  line(c, lo, 'rgba(103,215,249,.28)', 1.6, [3, 3]); line(c, hi, C.a, 2.4);
  var cur = morletAt(x, f, tau, W0);
  c.fillStyle = C.o; c.beginPath(); c.arc(ex, by + bh - 6 - cur * (bh - 14), 4, 0, 7); c.fill();
  axisLabelsT(c, px, by + bh + 14, pw); txt(c, t('timeAxis'), px + pw, by + bh + 28, C.m, 10, 'right');
  var sg = cwtSigmas(f, W0);
  setHTML('s2-ro', 's2ro', { f: f, s: (sg.t * 1000).toFixed(0), d: (2 * sg.t * 1000).toFixed(0), c: cur.toFixed(2), k: tau + 1, n: N });
  $('s2-play').textContent = t(play.on ? 's2pause' : 's2play');
}
function stopPlay() { play.on = false; cancelAnimationFrame(play.raf); }
function tick(ts) {
  if (!play.on) return;
  var dt = Math.min(0.1, (ts - play.last) / 1000); play.last = ts;
  var inc = reduced() ? 0 : 12.5 * dt;
  if (reduced()) { play.acc += dt; if (play.acc >= 0.6) { play.acc = 0; inc = 10; } }
  if (inc) {
    var v = +$('s2-tau').value + inc;
    if (v >= 100) { v = 100; stopPlay(); }
    $('s2-tau').value = v;
    render2();
  }
  if (play.on) play.raf = requestAnimationFrame(tick);
}
function togglePlay() {
  if (play.on) { stopPlay(); render2(); return; }
  if (+$('s2-tau').value >= 100) $('s2-tau').value = 0;
  play.on = true; play.last = performance.now(); play.acc = 0; play.raf = requestAnimationFrame(tick); render2();
}

function render3() {
  var L = +$('s3-L').value, w0 = +$('s3-w0').value;
  $('s3-L-v').textContent = L + ' ' + t('unitSamp'); $('s3-w0-v').textContent = String(w0);
  var x = eventSignal(), cv = $('s3-cv'), c = fit(cv), w = cv._w, x0 = 40, pw = w - x0 - 10, ph = 140, cols = 64, rows = FREQS3.length, cw = pw / cols, rh = ph / rows;
  function panel(y0, label, fn) {
    var vals = [], mx = 1e-9, r, k;
    for (r = 0; r < rows; r++) { vals[r] = []; for (k = 0; k < cols; k++) { var v = fn(FREQS3[r], k * 4 + 2); vals[r][k] = v; if (v > mx) mx = v; } }
    for (r = 0; r < rows; r++) for (k = 0; k < cols; k++) { c.fillStyle = heat(vals[r][k] / mx); c.fillRect(x0 + k * cw, y0 + ph - (r + 1) * rh, cw + 0.6, rh + 0.6); }
    c.strokeStyle = C.grid; c.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
    [8, 48].forEach(function (f) { var yy = y0 + ph - (Math.log(f / 4) / Math.log(24) * 27 + 0.5) * rh; txt(c, String(f), x0 - 5, yy + 4, C.m, 10, 'right'); line(c, [[x0, yy], [x0 + pw, yy]], 'rgba(255,255,255,.22)', 1, [2, 5]); });
    txt(c, label, x0 + 6, y0 + 14, '#fff', 11);
  }
  panel(6, t('s3Stft'), function (f, cc) { return stftAt(x, f, L, cc); });
  panel(172, t('s3Cwt'), function (f, cc) { return morletAt(x, f, cc, w0); });
  txt(c, t('freqAxis'), 4, 14, C.m, 10); axisLabelsT(c, x0, 332, pw); txt(c, t('timeAxis'), x0 + pw, 346, C.m, 10, 'right');
  var sS = stftSigmas(L), a1 = cwtSigmas(8, w0), a2 = cwtSigmas(48, w0);
  setHTML('s3-ro', 's3ro', {
    st: (sS.t * 1000).toFixed(0), sf: sS.f.toFixed(1),
    t1: (a1.t * 1000).toFixed(0), f1: a1.f.toFixed(1), t2: (a2.t * 1000).toFixed(0), f2: a2.f.toFixed(1)
  });
}

function render4() {
  var K = +$('s4-K').value, sd = +$('s4-n').value / 100;
  $('s4-K-v').textContent = K + ' / ' + N4; $('s4-n-v').textContent = sd.toFixed(2);
  var r = compress(K, sd), cv = $('s4-cv'), c = fit(cv), w = cv._w, px = 10, pw = w - 20;
  txt(c, t('s4In'), px, 13, C.m, 12); wave(c, px, 18, pw, 78, r.x, C.m, 1.2); wave(c, px, 18, pw, 78, r.clean, C.g, 1.6);
  txt(c, t('s4H', { e: r.rmseH.toFixed(3) }), px, 116, C.o, 12); wave(c, px, 121, pw, 78, r.clean, 'rgba(116,223,170,.45)', 1.2); wave(c, px, 121, pw, 78, r.rh, C.o, 1.8);
  txt(c, t('s4F', { e: r.rmseF.toFixed(3) }), px, 219, C.a, 12); wave(c, px, 224, pw, 78, r.clean, 'rgba(116,223,170,.45)', 1.2); wave(c, px, 224, pw, 78, r.rf, C.a, 1.8);
  wrapTxt(c, t('s4Leg'), px, 322, pw, 14, C.m, 11);
  var better = r.rmseH < r.rmseF ? 'h' : (r.rmseH > r.rmseF ? 'f' : 'e');
  setHTML('s4-ro', 's4ro', { K: K, n: N4, sd: sd.toFixed(2), ri: r.rmseIn.toFixed(3), rh: r.rmseH.toFixed(3), rf: r.rmseF.toFixed(3), who: t('s4w_' + better) });
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function bind(id, fn) { var e = $(id); e.addEventListener('input', fn); }
function init() {
  initLang();
  bind('s0-u', render0); bind('s1-L', render1); bind('s2-f', render2); bind('s2-tau', function () { stopPlay(); render2(); });
  bind('s3-L', render3); bind('s3-w0', render3); bind('s4-K', render4); bind('s4-n', render4);
  $('s2-play').addEventListener('click', togglePlay);
  var reset = {
    0: function () { $('s0-u').value = 50; render0(); },
    1: function () { $('s1-L').value = 64; render1(); },
    2: function () { stopPlay(); $('s2-f').value = 12; $('s2-tau').value = 25; render2(); },
    3: function () { $('s3-L').value = 64; $('s3-w0').value = 6; render3(); },
    4: function () { $('s4-K').value = 16; $('s4-n').value = 0; render4(); }
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
