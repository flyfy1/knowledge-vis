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
var NAMES = ['A', 'B', 'C', 'X', 'Y', 'D', 'E', 'F'], N = NAMES.length;
var POS = [[0.5, 0.24], [0.84, 0.5], [0.52, 0.8], [0.2, 0.3], [0.2, 0.7], [0.04, 0.08], [0.04, 0.5], [0.36, 0.06]];
var EDGES = [[0, 1], [1, 2], [2, 0], [2, 4], [4, 0], [3, 0], [5, 3], [6, 3], [7, 3]];
// candidate edits for step 4
var EXTRA = [[0, 3], [5, 4], [6, 4], [7, 4], [3, 2]];
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t0 = a; t0 = Math.imul(t0 ^ (t0 >>> 15), t0 | 1); t0 ^= t0 + Math.imul(t0 ^ (t0 >>> 7), t0 | 61); return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296; }; }
function outLinks(edges) { var o = []; for (var i = 0; i < N; i++) o.push([]); edges.forEach(function (e) { o[e[0]].push(e[1]); }); return o; }
function inDeg(edges) { var d = new Array(N).fill(0); edges.forEach(function (e) { d[e[1]]++; }); return d; }
// one power-iteration step: r' = (1-d)/N + d * sum over in-links r_j/outdeg_j (dangling nodes spread their rank evenly)
function prStep(r, edges, d) {
  var o = outLinks(edges), nr = new Array(N).fill((1 - d) / N), dang = 0, i, j;
  for (i = 0; i < N; i++) { if (!o[i].length) dang += r[i]; else o[i].forEach(function (t) { nr[t] += d * r[i] / o[i].length; }); }
  for (j = 0; j < N; j++) nr[j] += d * dang / N;
  return nr;
}
function l1(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s; }
function prRun(edges, d, k) { var r = new Array(N).fill(1 / N); for (var i = 0; i < k; i++) r = prStep(r, edges, d); return r; }
function prConverged(edges, d, tol) { var r = new Array(N).fill(1 / N), it = 0, nx; for (;;) { nx = prStep(r, edges, d); it++; var df = l1(nx, r); r = nx; if (df < tol || it > 5000) break; } return { r: r, iters: it }; }
function rankOrder(v) { return v.map(function (x, i) { return i; }).sort(function (a, b) { return v[b] - v[a] || a - b; }); }
function surferStep(pos, edges, d, r) { var o = outLinks(edges)[pos]; if (r() < d && o.length) return o[Math.floor(r() * o.length)]; return Math.floor(r() * N); }
var M = { NAMES: NAMES, EDGES: EDGES, EXTRA: EXTRA, N: N, inDeg: inDeg, prStep: prStep, prRun: prRun, prConverged: prConverged, rankOrder: rankOrder, surferStep: surferStep, rng: rng, l1: l1 };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
var COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff', '#ffd966', '#9fe6ff', '#b6e388'];
function f3(v) { return (+v).toFixed(3); } function f2(v) { return (+v).toFixed(2); } function pc(v) { return (v * 100).toFixed(1) + '%'; }
function orderStr(v) { return rankOrder(v).map(function (i) { return NAMES[i]; }).join(' > '); }
function arrow(c, x0, y0, x1, y1, col, wd) {
  var a = Math.atan2(y1 - y0, x1 - x0), L = 8; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = wd || 1.6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - L * Math.cos(a - 0.4), y1 - L * Math.sin(a - 0.4)); c.lineTo(x1 - L * Math.cos(a + 0.4), y1 - L * Math.sin(a + 0.4)); c.closePath(); c.fill();
}
// draw graph; vals sizes the nodes; hl = highlighted node
function drawGraph(c, x, y, w, h, edges, vals, o) {
  o = o || {}; var P = function (i) { return [x + 20 + POS[i][0] * (w - 40), y + 14 + POS[i][1] * (h - 28)]; }, mx = Math.max.apply(null, vals), i;
  var R = function (i2) { return 9 + vals[i2] / mx * 13; };
  edges.forEach(function (e) {
    var a = P(e[0]), b = P(e[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), isExtra = o.extra && o.extra.indexOf(e) >= 0;
    arrow(c, a[0] + Math.cos(ang) * R(e[0]), a[1] + Math.sin(ang) * R(e[0]), b[0] - Math.cos(ang) * (R(e[1]) + 2), b[1] - Math.sin(ang) * (R(e[1]) + 2), isExtra ? '#ffffff' : '#4a647a', isExtra ? 2.4 : 1.5);
  });
  for (i = 0; i < N; i++) {
    var p = P(i); c.fillStyle = COL[i]; c.globalAlpha = 0.9; c.beginPath(); c.arc(p[0], p[1], R(i), 0, 7); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = o.hl === i ? '#fff' : '#08131a'; c.lineWidth = o.hl === i ? 3 : 1.5; c.stroke();
    if (o.guess === i) { c.strokeStyle = '#ffffff'; c.setLineDash([3, 3]); c.beginPath(); c.arc(p[0], p[1], R(i) + 6, 0, 7); c.stroke(); c.setLineDash([]); }
    txt(c, NAMES[i], p[0], p[1] + 4, '#08131a', 12, 'center');
  }
}
function barsN(c, x, y, w, h, vals, o) {
  o = o || {}; var n = vals.length, bw = w / n, mx = o.max || Math.max.apply(null, vals.concat(o.ghost || [])) * 1.1, i;
  c.strokeStyle = C.grid; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  for (i = 0; i < n; i++) {
    var hh = vals[i] / mx * (h - 14); c.fillStyle = COL[i]; c.globalAlpha = 0.85; c.fillRect(x + i * bw + 5, y + h - hh, bw - 10, hh); c.globalAlpha = 1;
    if (o.ghost) { var gy = y + h - o.ghost[i] / mx * (h - 14); line(c, [[x + i * bw + 2, gy], [x + i * bw + bw - 2, gy]], '#fff', 2.2); }
    txt(c, o.fmt ? o.fmt(vals[i]) : f3(vals[i]), x + i * bw + bw / 2, y + h - hh - 3, C.ink, 10, 'center'); txt(c, NAMES[i], x + i * bw + bw / 2, y + h + 13, COL[i], 11, 'center');
  }
}
var s0 = { guess: -1, reveal: false };
function render0() {
  var ind = inDeg(EDGES), pr = prConverged(EDGES, 0.85, 1e-10).r, cv = $('s0-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s0Cap'), 10, 14, C.ink, 12); drawGraph(c, 0, 20, W, 200, EDGES, s0.reveal ? pr : ind.map(function (v) { return v + 1; }), { guess: s0.guess });
  txt(c, t('s0In'), 10, 244, C.ink, 12); barsN(c, 10, 252, W - 20, 70, ind, { fmt: function (v) { return String(v); }, max: 4 });
  if (s0.reveal) { txt(c, t('s0Pr'), 10, 352, C.ink, 12); barsN(c, 10, 360, W - 20, 70, pr, { fmt: pc }); }
  var topIn = rankOrder(ind).filter(function (i) { return ind[i] === Math.max.apply(null, ind); }).map(function (i) { return NAMES[i]; }).join(', ');
  var rk = rankOrder(pr), g = s0.guess;
  setHTML('s0-ro', 's0ro', { top: topIn, mx: Math.max.apply(null, ind), g: g >= 0 ? NAMES[g] : '—', gin: g >= 0 ? ind[g] : '—', res: s0.reveal ? t('s0Res', { best: NAMES[rk[0]], pbest: pc(pr[rk[0]]), gr: g >= 0 ? (rk.indexOf(g) + 1) : '—', gp: g >= 0 ? pc(pr[g]) : '—' }) : t('s0Hid') });
  $('s0-reveal').textContent = t(s0.reveal ? 's0Hide' : 's0Reveal'); $('s0-reveal').setAttribute('aria-pressed', s0.reveal ? 'true' : 'false');
  for (var i = 0; i < N; i++) { var b = $('s0-g' + i); b.classList.toggle('active', i === g); b.setAttribute('aria-pressed', i === g ? 'true' : 'false'); }
}
var sf = { pos: 0, counts: new Array(8).fill(0), n: 0, r: rng(77), trail: [], on: false, raf: 0, acc: 0, last: 0, notice: false };
function sfReset() { sf.pos = 0; sf.counts = new Array(8).fill(0); sf.n = 0; sf.r = rng(77); sf.trail = []; }
function sfStep(k) { var d = +$('s1-d').value / 100; for (var i = 0; i < k; i++) { sf.pos = surferStep(sf.pos, EDGES, d, sf.r); sf.counts[sf.pos]++; sf.n++; sf.trail.push(sf.pos); if (sf.trail.length > 8) sf.trail.shift(); } sf.notice = false; render1(); }
function render1() {
  var d = +$('s1-d').value / 100; $('s1-d-v').textContent = f2(d);
  var pr = prConverged(EDGES, d, 1e-10).r, freq = sf.counts.map(function (v) { return sf.n ? v / sf.n : 0; }), cv = $('s1-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s1Cap'), 10, 14, C.ink, 12); drawGraph(c, 0, 20, W, 200, EDGES, freq.map(function (v) { return v + 0.02; }), { hl: sf.n ? sf.pos : -1 });
  txt(c, t('s1Bars', { n: sf.n }), 10, 244, C.ink, 12); barsN(c, 10, 252, W - 20, 100, freq, { ghost: pr, fmt: pc });
  txt(c, t('s1Leg'), 10, 382, C.m, 11);
  setHTML('s1-ro', 's1ro', { n: sf.n, cur: sf.n ? NAMES[sf.pos] : '—', d: f2(d), dist: sf.n ? f3(l1(freq, pr) / 2) : '—', note: sf.notice ? t('s1Notice') : '' });
  $('s1-auto').textContent = t(sf.on ? 's2pause' : 's1Auto');
}
function sfStop() { sf.on = false; cancelAnimationFrame(sf.raf); }
function sfTick(ts) { if (!sf.on) return; sf.acc += Math.min(0.1, (ts - sf.last) / 1000); sf.last = ts; var per = reduced() ? 0.5 : 0.05; if (sf.acc >= per) { sf.acc = 0; sfStep(reduced() ? 5 : 3); if (sf.n >= 20000) sfStop(); } if (sf.on) sf.raf = requestAnimationFrame(sfTick); }
var it2 = { on: false, raf: 0, acc: 0, last: 0 };
function render2() {
  var k = +$('s2-k').value; $('s2-k-v').textContent = String(k);
  var fin = prConverged(EDGES, 0.85, 1e-12).r, rk = prRun(EDGES, 0.85, k), prev = k ? prRun(EDGES, 0.85, k - 1) : null, cv = $('s2-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s2Cap', { k: k }), 10, 14, C.ink, 12); drawGraph(c, 0, 20, W, 200, EDGES, rk, {});
  txt(c, t('s2Bars'), 10, 244, C.ink, 12); barsN(c, 10, 252, W - 20, 100, rk, { ghost: fin, fmt: pc, max: 0.4 });
  wrapTxt(c, t('s2Leg'), 10, 382, W - 20, 14, C.m, 11);
  setHTML('s2-ro', 's2ro', { k: k, ch: prev ? l1(rk, prev).toExponential(1) : '—', err: l1(rk, fin).toExponential(1), sum: rk.reduce(function (a, b) { return a + b; }, 0).toFixed(3), ord: orderStr(rk) });
  $('s2-play').textContent = t(it2.on ? 's2pause' : 's2play');
}
function itStop() { it2.on = false; cancelAnimationFrame(it2.raf); }
function itTick(ts) { if (!it2.on) return; it2.acc += Math.min(0.1, (ts - it2.last) / 1000); it2.last = ts; if (it2.acc >= (reduced() ? 0.9 : 0.45)) { it2.acc = 0; var v = +$('s2-k').value + 1; $('s2-k').value = v; if (v >= +$('s2-k').max) itStop(); render2(); } if (it2.on) it2.raf = requestAnimationFrame(itTick); }
function render3() {
  var d = +$('s3-d').value / 100; $('s3-d-v').textContent = f2(d);
  var cur = prConverged(EDGES, d, 1e-8), base = prConverged(EDGES, 0.85, 1e-8).r, cv = $('s3-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s3Cap', { d: f2(d) }), 10, 14, C.ink, 12); drawGraph(c, 0, 20, W, 200, EDGES, cur.r, {});
  barsN(c, 10, 252, W - 20, 90, cur.r, { ghost: base, fmt: pc, max: 0.4 }); txt(c, t('s3Bars'), 10, 244, C.ink, 12);
  var gx = 40, gy = 376, gw = W - gx - 12, gh = 90, pts = [], di, mxIt = 1;
  for (di = 5; di <= 99; di += 2) { var q = prConverged(EDGES, di / 100, 1e-8).iters; if (q > mxIt) mxIt = q; pts.push([di, q]); }
  txt(c, t('s3It'), 10, gy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  line(c, pts.map(function (p) { return [gx + gw * (p[0] - 5) / 94, gy + gh - p[1] / mxIt * (gh - 6) - 3]; }), C.a, 2.2);
  line(c, [[gx + gw * (d * 100 - 5) / 94, gy], [gx + gw * (d * 100 - 5) / 94, gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]); c.fillStyle = C.o; c.beginPath(); c.arc(gx + gw * (d * 100 - 5) / 94, gy + gh - cur.iters / mxIt * (gh - 6) - 3, 5, 0, 7); c.fill();
  txt(c, String(mxIt), gx - 4, gy + 10, C.m, 10, 'right'); txt(c, '0', gx - 4, gy + gh, C.m, 10, 'right'); txt(c, '0.05', gx, gy + gh + 13, C.m, 10, 'left'); txt(c, '0.99', gx + gw, gy + gh + 13, C.m, 10, 'right'); txt(c, t('s3Ax'), gx + gw / 2, gy + gh + 13, C.m, 10, 'center');
  setHTML('s3-ro', 's3ro', { d: f2(d), it: cur.iters, ord: orderStr(cur.r), top: pc(Math.max.apply(null, cur.r)) });
}
var chk = [false, false, false, false, false];
function render4() {
  var extra = EXTRA.filter(function (e, i) { return chk[i]; }), edges = EDGES.concat(extra);
  var before = prConverged(EDGES, 0.85, 1e-10).r, after = prConverged(edges, 0.85, 1e-10).r, cv = $('s4-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s4Cap'), 10, 14, C.ink, 12); drawGraph(c, 0, 20, W, 200, edges, after, { extra: extra });
  txt(c, t('s4Bars'), 10, 244, C.ink, 12); barsN(c, 10, 252, W - 20, 100, after, { ghost: before, fmt: pc, max: 0.4 });
  wrapTxt(c, t('s4Leg'), 10, 382, W - 20, 14, C.m, 11);
  var d0 = rankOrder(before), d1 = rankOrder(after), mv = [];
  for (var i = 0; i < N; i++) { var a = d0.indexOf(i), b = d1.indexOf(i); if (a !== b) mv.push(NAMES[i] + ' #' + (a + 1) + '→#' + (b + 1)); }
  setHTML('s4-ro', 's4ro', { k: extra.length, b: orderStr(before), a: orderStr(after), mv: mv.length ? mv.join('; ') : t('s4NoMove'), ch: pc(l1(before, after) / 2) });
  for (var j = 0; j < EXTRA.length; j++) { var e = EXTRA[j], cb = $('s4-e' + j); if (cb) $('s4-el' + j).textContent = t('s4Edge', { a: NAMES[e[0]], b: NAMES[e[1]] }); }
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  var gb = $('s0-guess'); for (var i = 0; i < N; i++) (function (i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.id = 's0-g' + i; b.dataset.step = '0'; b.textContent = NAMES[i]; b.style.borderColor = COL[i]; b.addEventListener('click', function () { s0.guess = i; render0(); }); gb.appendChild(b); })(i);
  $('s0-reveal').addEventListener('click', function () { s0.reveal = !s0.reveal; render0(); });
  $('s1-d').addEventListener('input', function () { var had = sf.n > 0; sfStop(); sfReset(); sf.notice = had; render1(); });
  $('s1-b1').addEventListener('click', function () { sfStop(); sfStep(1); }); $('s1-b100').addEventListener('click', function () { sfStop(); sfStep(100); }); $('s1-b1000').addEventListener('click', function () { sfStop(); sfStep(1000); });
  $('s1-auto').addEventListener('click', function () { if (sf.on) { sfStop(); render1(); return; } sf.on = true; sf.acc = 0; sf.last = performance.now(); sf.raf = requestAnimationFrame(sfTick); render1(); });
  $('s2-k').addEventListener('input', function () { itStop(); render2(); });
  $('s2-play').addEventListener('click', function () { if (it2.on) { itStop(); render2(); return; } if (+$('s2-k').value >= +$('s2-k').max) $('s2-k').value = 0; it2.on = true; it2.acc = 0; it2.last = performance.now(); it2.raf = requestAnimationFrame(itTick); render2(); });
  $('s3-d').addEventListener('input', render3);
  var eb = $('s4-edges'); EXTRA.forEach(function (e, j) { var lab = document.createElement('label'), cb = document.createElement('input'), sp = document.createElement('span'); cb.type = 'checkbox'; cb.id = 's4-e' + j; cb.dataset.step = '4'; sp.id = 's4-el' + j; cb.addEventListener('change', function () { chk[j] = cb.checked; render4(); }); lab.appendChild(cb); lab.appendChild(sp); eb.appendChild(lab); });
  var reset = {
    0: function () { s0.guess = -1; s0.reveal = false; render0(); },
    1: function () { sfStop(); $('s1-d').value = 85; sfReset(); sf.notice = false; render1(); },
    2: function () { itStop(); $('s2-k').value = 0; render2(); },
    3: function () { $('s3-d').value = 85; render3(); },
    4: function () { chk = [false, false, false, false, false]; EXTRA.forEach(function (e, j) { $('s4-e' + j).checked = false; }); render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { sfStop(); itStop(); render1(); render2(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); if (!e.isIntersecting && e.target.id === 'step1' && sf.on) { sfStop(); render1(); } if (!e.isIntersecting && e.target.id === 'step2' && it2.on) { itStop(); render2(); } }); }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
