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
function bytesOf(s) { if (typeof TextEncoder !== 'undefined') return Array.prototype.slice.call(new TextEncoder().encode(s)); var b = []; for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 255); return b; }
function fnv1a(bytes) { var h = 0x811c9dc5; for (var i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193); } return h >>> 0; }
function fmix(h) { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
function hashBytes(b) { return fmix(fnv1a(b)); }
function hash32(s) { return hashBytes(bytesOf(s)); }
function popcount(x) { var c = 0; x >>>= 0; while (x) { c += x & 1; x >>>= 1; } return c; }
function hex8(x) { var s = (x >>> 0).toString(16); while (s.length < 8) s = '0' + s; return s; }
function keyName(i) { return 'key-' + (i < 10 ? '00' : (i < 100 ? '0' : '')) + i; }
function bucketsFor(n, m) { var b = []; for (var i = 0; i < m; i++) b.push([]); for (var k = 1; k <= n; k++) b[hash32(keyName(k)) % m].push(k); return b; }
function expectedOccupied(n, m) { return m * (1 - Math.pow(1 - 1 / m, n)); }
// P(at least one collision) among n items in m equally likely bins (exact birthday product)
function birthdayExact(n, m) { var p = 1; for (var i = 0; i < n; i++) p *= Math.max(0, 1 - i / m); return 1 - p; }
function collisionProb(n, bits) { var lam = n * (n - 1) / Math.pow(2, bits + 1); return lam >= 1e-8 ? -Math.expm1(-lam) : lam; }
function trialCollision(n, m, r) { var seen = {}; for (var i = 0; i < n; i++) { var v = Math.floor(r() * m); if (seen[v]) return true; seen[v] = true; } return false; }
function randMsg(seed, n) { var r = rng(seed), b = []; for (var i = 0; i < n; i++) b.push(Math.floor(r() * 256)); return b; }
function flipBit(b, pos) { var c = b.slice(); c[pos >> 3] ^= 1 << (pos & 7); return c; }
function avalancheCount(b, pos) { return popcount(hashBytes(b) ^ hashBytes(flipBit(b, pos))); }
var M = { fnv1a: fnv1a, fmix: fmix, hash32: hash32, hashBytes: hashBytes, bytesOf: bytesOf, popcount: popcount, hex8: hex8, keyName: keyName, bucketsFor: bucketsFor, expectedOccupied: expectedOccupied, birthdayExact: birthdayExact, collisionProb: collisionProb, trialCollision: trialCollision, randMsg: randMsg, flipBit: flipBit, avalancheCount: avalancheCount, rng: rng };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
var COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff', '#ffd966'];
function f1(v) { return (+v).toFixed(1); } function f3(v) { return (+v).toFixed(3); } function pc(v) { return v < 0.001 ? v.toExponential(1) : (v * 100).toFixed(1) + '%'; }
function bitGrid(c, x, y, w, val, cols, opts) {
  opts = opts || {}; var cs = Math.min(26, (w) / cols), i; for (i = 0; i < 32; i++) {
    var b = (val >>> (31 - i)) & 1, cx = x + (i % cols) * cs, cy = y + Math.floor(i / cols) * cs, diff = opts.diff ? ((opts.diff >>> (31 - i)) & 1) : 0, low = opts.k && i >= 32 - opts.k;
    c.fillStyle = diff ? C.o : (b ? C.a : '#12202e'); c.globalAlpha = (opts.k && !low) ? 0.35 : 1; c.fillRect(cx + 1, cy + 1, cs - 3, cs - 3); c.globalAlpha = 1;
    if (diff) { c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.strokeRect(cx + 1, cy + 1, cs - 3, cs - 3); }
    txt(c, String(b), cx + cs / 2 - 1, cy + cs / 2 + 3, b || diff ? '#08131a' : C.m, 10, 'center');
  }
  return cs;
}
function render0() {
  var s = $('s0-text').value, k = +$('s0-k').value; $('s0-k-v').textContent = k + ' bit';
  var h = hash32(s), cv = $('s0-cv'), c = fit(cv), W = cv._w, cols = W > 420 ? 16 : 8;
  txt(c, t('s0Cap', { n: bytesOf(s).length }), 10, 14, C.ink, 12); var cs = bitGrid(c, 10, 24, W - 20, h, cols, { k: k });
  var rows = 32 / cols, gy = 24 + rows * cs + 20;
  txt(c, t('s0Hex', { h: hex8(h) }), 10, gy, C.o, 14); var low = k === 32 ? h : (h & ((Math.pow(2, k)) - 1)) >>> 0; if (k === 32) low = h; else low = h % Math.pow(2, k);
  txt(c, t('s0Low', { k: k, v: low }), 10, gy + 20, C.a, 13); txt(c, t('s0Dir'), 10, gy + 42, C.m, 11);
  setHTML('s0-ro', 's0ro', { n: bytesOf(s).length, h: hex8(h), d: h, ones: popcount(h), k: k, v: low, m: Math.pow(2, k).toLocaleString('en-US') });
}
var av = { msg: randMsg(1, 8), seed: 1, hist: new Array(33).fill(0), n: 0, sum: 0 };
function avRun() { for (var m = 0; m < 20; m++) { av.seed++; var b = randMsg(av.seed, 8); for (var p = 0; p < 64; p++) { var c = avalancheCount(b, p); av.hist[c]++; av.n++; av.sum += c; } } render1(); }
function render1() {
  var pos = +$('s1-p').value; $('s1-p-v').textContent = String(pos);
  var b = av.msg, b2 = flipBit(b, pos), h1 = hashBytes(b), h2 = hashBytes(b2), diff = (h1 ^ h2) >>> 0, cv = $('s1-cv'), c = fit(cv), W = cv._w, cols = W > 420 ? 16 : 8;
  txt(c, t('s1A', { h: hex8(h1) }), 10, 14, C.a, 12); var cs = bitGrid(c, 10, 22, W - 20, h1, cols, {}); var rows = 32 / cols, y2 = 22 + rows * cs + 20;
  txt(c, t('s1B', { h: hex8(h2), p: pos }), 10, y2 - 6, C.o, 12); bitGrid(c, 10, y2 + 2, W - 20, h2, cols, { diff: diff });
  var hy = y2 + 2 + rows * cs + 40, hh = 100, bw = (W - 20) / 33; txt(c, t('s1Hist', { n: av.n }), 10, hy - 10, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(10.5, hy + 0.5, W - 21, hh);
  var mx = Math.max(1, Math.max.apply(null, av.hist)); for (var i = 0; i <= 32; i++) { var v = av.hist[i] / mx * (hh - 6); c.fillStyle = C.a; c.globalAlpha = 0.85; c.fillRect(10 + i * bw + 1, hy + hh - v, Math.max(1, bw - 2), v); c.globalAlpha = 1; }
  var cur = popcount(diff); line(c, [[10 + cur * bw + bw / 2, hy], [10 + cur * bw + bw / 2, hy + hh]], C.o, 2, [3, 3]);
  txt(c, '0', 12, hy + hh + 13, C.m, 10); txt(c, '16', 10 + 16 * bw + bw / 2, hy + hh + 13, C.m, 10, 'center'); txt(c, '32', W - 12, hy + hh + 13, C.m, 10, 'right'); txt(c, t('s1Ax'), W / 2 + 40, hy + hh + 13, C.m, 10);
  var mean = av.n ? av.sum / av.n : 0, sd = 0; if (av.n) { var ss = 0; av.hist.forEach(function (cnt, v) { ss += cnt * (v - mean) * (v - mean); }); sd = Math.sqrt(ss / av.n); }
  setHTML('s1-ro', 's1ro', { p: pos, cur: cur, n: av.n, mean: av.n ? mean.toFixed(2) : '—', sd: av.n ? sd.toFixed(2) : '—' });
}
function render2() {
  var n = +$('s2-n').value, m = +$('s2-m').value; $('s2-n-v').textContent = String(n); $('s2-m-v').textContent = String(m);
  var bk = bucketsFor(n, m), cv = $('s2-cv'), c = fit(cv), W = cv._w, bw = (W - 20) / m, maxLen = Math.max(1, Math.max.apply(null, bk.map(function (a) { return a.length; }))), unit = Math.min(22, 200 / maxLen);
  txt(c, t('s2Cap', { n: n, m: m }), 10, 14, C.ink, 12);
  bk.forEach(function (a, i) { var x = 10 + i * bw; c.strokeStyle = C.grid; c.strokeRect(x + 1.5, 230 - maxLen * unit - 2.5, bw - 3, maxLen * unit + 3); a.forEach(function (k, j) { c.fillStyle = a.length > 1 ? C.o : C.a; c.globalAlpha = 0.9; c.fillRect(x + 3, 230 - (j + 1) * unit, bw - 6, unit - 2); c.globalAlpha = 1; if (bw > 14 && unit > 12) txt(c, String(k), x + bw / 2, 230 - (j + 1) * unit + unit - 6, '#08131a', 9, 'center'); }); if (m <= 16) txt(c, String(i), x + bw / 2, 244, C.m, 10, 'center'); });
  txt(c, t('s2Ax'), 10, 262, C.m, 11);
  var occ = bk.filter(function (a) { return a.length > 0; }).length, coll = n - occ;
  setHTML('s2-ro', 's2ro', { n: n, m: m, a: (n / m).toFixed(2), occ: occ, eo: expectedOccupied(n, m).toFixed(1), coll: coll, mx: maxLen });
}
var bd = { m: 365, trials: 0, hits: 0, r: rng(2024), hist: [] };
function bdReset() { bd.trials = 0; bd.hits = 0; bd.r = rng(2024); bd.hist = []; }
function bdRun(k) { var n = +$('s3-n').value; for (var i = 0; i < k; i++) { bd.trials++; if (trialCollision(n, bd.m, bd.r)) bd.hits++; bd.hist.push(bd.hits / bd.trials); } render3(); }
function render3() {
  var n = +$('s3-n').value; $('s3-n-v').textContent = String(n);
  var exact = birthdayExact(n, bd.m), cv = $('s3-cv'), c = fit(cv), W = cv._w, gx = 40, gy = 24, gw = W - gx - 12, gh = 150;
  txt(c, t('s3Cap', { n: n, m: bd.m.toLocaleString('en-US') }), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  [0, 0.5, 1].forEach(function (v) { line(c, [[gx, gy + gh - v * gh], [gx + gw, gy + gh - v * gh]], C.grid, 1, [3, 4]); txt(c, Math.round(v * 100) + '%', gx - 4, gy + gh - v * gh + 4, C.m, 10, 'right'); });
  line(c, [[gx, gy + gh - exact * gh], [gx + gw, gy + gh - exact * gh]], C.g, 1.8, [6, 4]);
  var N = Math.max(50, bd.trials); line(c, bd.hist.map(function (v, i) { return [gx + gw * (i + 1) / N, gy + gh - v * gh]; }), C.o, 2.2);
  txt(c, t('s3Ax', { n: N }), gx + gw, gy + gh + 14, C.m, 10, 'right'); txt(c, t('s3Leg'), gx + 6, gy + 14, C.m, 11);
  var emp = bd.trials ? bd.hits / bd.trials : null, se = bd.trials ? Math.sqrt(exact * (1 - exact) / bd.trials) : null;
  // curve of exact probability versus n for the chosen m
  var cy = gy + gh + 40, ch = 80; txt(c, t('s3Curve'), 10, cy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, cy + 0.5, gw - 1, ch);
  var nmax = Math.min(100, bd.m <= 365 ? 100 : 100), pts = []; for (var i = 1; i <= nmax; i++) pts.push([gx + gw * i / nmax, cy + ch - birthdayExact(i, bd.m) * ch]); line(c, pts, C.a, 2);
  line(c, [[gx + gw * n / nmax, cy], [gx + gw * n / nmax, cy + ch]], 'rgba(255,255,255,.5)', 1, [3, 3]); c.fillStyle = C.o; c.beginPath(); c.arc(gx + gw * n / nmax, cy + ch - exact * ch, 4, 0, 7); c.fill();
  txt(c, '0', gx, cy + ch + 13, C.m, 10, 'left'); txt(c, '100', gx + gw, cy + ch + 13, C.m, 10, 'right');
  var n50 = 1.1774 * Math.sqrt(bd.m);
  setHTML('s3-ro', 's3ro', { n: n, m: bd.m.toLocaleString('en-US'), ex: pc(exact), trials: bd.trials, emp: emp === null ? '—' : pc(emp), se: se === null ? '—' : pc(se), n50: n50 >= 1000 ? Math.round(n50).toLocaleString('en-US') : n50.toFixed(1) });
  [365, 65536, 4294967296].forEach(function (mm, i) { var b = $('s3-m' + i); b.classList.toggle('active', bd.m === mm); b.setAttribute('aria-pressed', bd.m === mm ? 'true' : 'false'); });
}
function render4() {
  var x = +$('s4-x').value / 10, n = Math.pow(10, x), k = +$('s4-k').value; $('s4-x-v').textContent = '10^' + x.toFixed(1); $('s4-k-v').textContent = k + ' bit';
  var cv = $('s4-cv'), c = fit(cv), W = cv._w, gx = 44, gy = 24, gw = W - gx - 12, gh = 220, LO = -30;
  txt(c, t('s4Cap', { x: x.toFixed(1) }), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  function X(b) { return gx + gw * (b - 8) / 120; } function Y(p) { var l = Math.log(Math.max(p, 1e-300)) / Math.LN10; return gy + (0 - Math.max(LO, Math.min(0, l))) / (-LO) * gh; }
  [0, -6, -12, -18, -24, -30].forEach(function (e) { var yy = gy + (-e) / (-LO) * gh; line(c, [[gx, yy], [gx + gw, yy]], C.grid, 1, [3, 4]); txt(c, '1e' + e, gx - 4, yy + 4, C.m, 10, 'right'); });
  var pts = []; for (var b = 8; b <= 128; b += 2) pts.push([X(b), Y(collisionProb(n, b))]); line(c, pts, C.a, 2.4);
  var p = collisionProb(n, k); line(c, [[X(k), gy], [X(k), gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]); c.fillStyle = C.o; c.beginPath(); c.arc(X(k), Y(p), 5, 0, 7); c.fill();
  [8, 32, 64, 96, 128].forEach(function (b) { txt(c, String(b), X(b), gy + gh + 14, C.m, 10, b === 8 ? 'left' : (b === 128 ? 'right' : 'center')); });
  txt(c, t('s4Ax'), gx + gw / 2, gy + gh + 28, C.m, 10, 'center'); txt(c, t('s4Leg'), gx + 6, gy + 14, C.m, 11);
  var need = Math.ceil(Math.log(n * (n - 1) / 2 / 1e-6) / Math.LN2);
  setHTML('s4-ro', 's4ro', { n: n >= 1e6 ? n.toExponential(1) : Math.round(n).toLocaleString('en-US'), k: k, p: p >= 0.001 ? (p * 100).toFixed(2) + '%' : p.toExponential(1), need: need > 8 ? need : 8 });
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  $('s0-text').addEventListener('input', render0); $('s0-k').addEventListener('input', render0);
  [['s0-p1', 'abc'], ['s0-p2', 'abd'], ['s0-p3', 'Abc'], ['s0-p4', '']].forEach(function (p) { $(p[0]).addEventListener('click', function () { $('s0-text').value = p[1]; render0(); }); });
  $('s1-p').addEventListener('input', render1);
  $('s1-new').addEventListener('click', function () { av.seed += 100; av.msg = randMsg(av.seed, 8); render1(); });
  $('s1-run').addEventListener('click', avRun);
  $('s2-n').addEventListener('input', render2); $('s2-m').addEventListener('input', render2);
  $('s3-n').addEventListener('input', function () { var had = bd.trials > 0; bdReset(); render3(); void had; });
  [365, 65536, 4294967296].forEach(function (mm, i) { $('s3-m' + i).addEventListener('click', function () { bd.m = mm; bdReset(); render3(); }); });
  $('s3-r1').addEventListener('click', function () { bdRun(1); }); $('s3-r100').addEventListener('click', function () { bdRun(100); }); $('s3-r1000').addEventListener('click', function () { bdRun(1000); });
  $('s4-x').addEventListener('input', render4); $('s4-k').addEventListener('input', render4);
  var reset = {
    0: function () { $('s0-text').value = 'abc'; $('s0-k').value = 32; render0(); },
    1: function () { av = { msg: randMsg(1, 8), seed: 1, hist: new Array(33).fill(0), n: 0, sum: 0 }; $('s1-p').value = 0; render1(); },
    2: function () { $('s2-n').value = 12; $('s2-m').value = 16; render2(); },
    3: function () { bd.m = 365; bdReset(); $('s3-n').value = 23; render3(); },
    4: function () { $('s4-x').value = 60; $('s4-k').value = 32; render4(); }
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
