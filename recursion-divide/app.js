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
// factorial call stack: step s in 0..2n; first n steps push calls fact(n)..fact(1), next n steps return values
function factState(n, s) {
  var frames = [], k;
  for (k = 0; k < Math.min(s, n); k++) frames.push({ arg: n - k, ret: null });
  if (s > n) { var val = 1, done = s - n; for (k = 0; k < done; k++) { var fr = frames[frames.length - 1 - k]; val = k === 0 ? 1 : val * fr.arg; fr.ret = val; } }
  return frames;
}
function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
function hanoiMoves(n, from, to, via, out) { out = out || []; if (n === 0) return out; hanoiMoves(n - 1, from, via, to, out); out.push([n, from, to]); hanoiMoves(n - 1, via, to, from, out); return out; }
function hanoiState(n, k) {
  var pegs = [[], [], []], i, mv = hanoiMoves(n, 0, 2, 1); for (i = n; i >= 1; i--) pegs[0].push(i);
  for (i = 0; i < k; i++) { var m = mv[i]; pegs[m[1]].pop(); pegs[m[2]].push(m[0]); }
  return { pegs: pegs, moves: mv };
}
// recursion tree statistics per level: nodes and total cost
function treeLevels(kind, m) {
  var lv = [], i;
  if (kind === 'hanoi') { for (i = 0; i < m; i++) lv.push({ nodes: Math.pow(2, i), size: m - i, cost: Math.pow(2, i) }); }
  else if (kind === 'binary') { var n = Math.pow(2, m); for (i = 0; i <= m; i++) lv.push({ nodes: 1, size: n / Math.pow(2, i), cost: 1 }); }
  else { var nn = Math.pow(2, m); for (i = 0; i < m; i++) lv.push({ nodes: Math.pow(2, i), size: nn / Math.pow(2, i), cost: nn }); lv.push({ nodes: nn, size: 1, cost: 0 }); }
  return lv;
}
function treeTotal(kind, m) { return treeLevels(kind, m).reduce(function (a, l) { return a + l.cost; }, 0); }
function nodesTotal(kind, m) { return treeLevels(kind, m).reduce(function (a, l) { return a + l.nodes; }, 0); }
function growth(n) { return { hanoi: Math.pow(2, n) - 1, merge: n * Math.log(n) / Math.LN2, binary: Math.log(n) / Math.LN2 + 1, linear: n }; }
function humanTime(sec) {
  var u = [['y', 31557600], ['d', 86400], ['h', 3600], ['min', 60], ['s', 1], ['ms', 1e-3], ['us', 1e-6], ['ns', 1e-9]];
  for (var i = 0; i < u.length; i++) if (sec >= u[i][1]) return { v: sec / u[i][1], u: u[i][0] };
  return { v: sec / 1e-9, u: 'ns' };
}
// merge sort with event log: split / merge events and the recursion stack at each event
function mergeSortEvents(a) {
  var arr = a.slice(), ev = [], stack = [], cmp = 0;
  function rec(lo, hi) {
    stack.push([lo, hi]);
    if (hi - lo > 1) {
      ev.push({ t: 'split', lo: lo, hi: hi, stack: stack.map(function (s) { return s.slice(); }), arr: arr.slice(), cmp: cmp });
      var mid = (lo + hi) >> 1; rec(lo, mid); rec(mid, hi);
      var l = arr.slice(lo, mid), r = arr.slice(mid, hi), i = 0, j = 0, k = lo, c0 = cmp;
      while (i < l.length && j < r.length) { cmp++; arr[k++] = l[i] <= r[j] ? l[i++] : r[j++]; }
      while (i < l.length) arr[k++] = l[i++]; while (j < r.length) arr[k++] = r[j++];
      ev.push({ t: 'merge', lo: lo, hi: hi, stack: stack.map(function (s) { return s.slice(); }), arr: arr.slice(), cmp: cmp, c: cmp - c0 });
    }
    stack.pop();
  }
  rec(0, arr.length); return { events: ev, sorted: arr, comparisons: cmp };
}
function randArr(seed, n) { var r = rng(seed), a = []; for (var i = 0; i < n; i++) a.push(1 + Math.floor(r() * 9)); return a; }
var M = { factState: factState, factorial: factorial, hanoiMoves: hanoiMoves, hanoiState: hanoiState, treeLevels: treeLevels, treeTotal: treeTotal, nodesTotal: nodesTotal, growth: growth, humanTime: humanTime, mergeSortEvents: mergeSortEvents, randArr: randArr };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
var COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff', '#ffd966', '#9fe6ff'];
function f1(v) { return (+v).toFixed(1); }
function fmtBig(v) { return v >= 1e6 ? v.toExponential(2) : String(Math.round(v * 100) / 100); }
var pl = { on: false, raf: 0, acc: 0, last: 0, key: '', max: 0, per: 0.5 };
function playStop() { pl.on = false; cancelAnimationFrame(pl.raf); }
function playTick(ts) {
  if (!pl.on) return; pl.acc += Math.min(0.1, (ts - pl.last) / 1000); var per = reduced() ? pl.per * 2 : pl.per; pl.last = ts;
  if (pl.acc >= per) { pl.acc = 0; var el = $(pl.key), v = +el.value + 1; el.value = Math.min(v, +el.max); if (v >= +el.max) playStop(); renderAll(); }
  if (pl.on) pl.raf = requestAnimationFrame(playTick);
}
function playToggle(key, per) {
  if (pl.on && pl.key === key) { playStop(); renderAll(); return; }
  playStop(); var el = $(key); if (+el.value >= +el.max) el.value = 0; pl.on = true; pl.key = key; pl.per = per; pl.acc = 0; pl.last = performance.now(); pl.raf = requestAnimationFrame(playTick); renderAll();
}
function render0() {
  var n = +$('s0-n').value; $('s0-k').max = String(2 * n); if (+$('s0-k').value > 2 * n) $('s0-k').value = 2 * n;
  var s = +$('s0-k').value; $('s0-n-v').textContent = String(n); $('s0-k-v').textContent = s + ' / ' + 2 * n;
  var fr = factState(n, s), cv = $('s0-cv'), c = fit(cv), W = cv._w, fh = 30, y0 = 28, i;
  txt(c, t('s0Cap', { n: n }), 10, 14, C.ink, 12);
  for (i = 0; i < n; i++) {
    var f = fr[i], y = y0 + i * (fh + 6); if (!f) { c.strokeStyle = C.grid; c.setLineDash([3, 4]); c.strokeRect(10.5, y + 0.5, W - 21, fh); c.setLineDash([]); continue; }
    var done = f.ret !== null; c.fillStyle = done ? 'rgba(116,223,170,.25)' : 'rgba(103,215,249,.18)'; c.fillRect(10, y, W - 20, fh); c.strokeStyle = done ? C.g : C.a; c.lineWidth = 1.5; c.strokeRect(10.5, y + 0.5, W - 21, fh - 1);
    var lab = done ? 'fact(' + f.arg + ') = ' + f.ret : (f.arg === 1 ? 'fact(1) = 1  ' + t('s0Base') : 'fact(' + f.arg + ') = ' + f.arg + ' × fact(' + (f.arg - 1) + ')  ' + t('s0Wait'));
    txt(c, lab, 18, y + 20, done ? C.g : C.ink, 13);
  }
  var top = s === 0 ? null : (s <= n ? fr[s - 1] : fr[2 * n - s]); // frame in action
  var msg = s === 0 ? t('s0Start') : (s < n ? t('s0Call', { a: n - s + 1, b: n - s }) : (s === n ? t('s0BaseHit') : t('s0Ret', { a: fr[2 * n - s] ? fr[2 * n - s].arg : '', v: fr[2 * n - s] ? fr[2 * n - s].ret : '' })));
  txt(c, t('s0Dir'), 10, y0 + n * (fh + 6) + 14, C.m, 11);
  setHTML('s0-ro', 's0ro', { n: n, s: s, tot: 2 * n, depth: Math.min(s, n), msg: msg, res: s === 2 * n ? t('s0Done', { n: n, v: factorial(n) }) : '' });
  $('s0-play').textContent = t(pl.on && pl.key === 's0-k' ? 's0pause' : 's0play'); void top;
}
function render1() {
  var n = +$('s1-n').value; $('s1-k').max = String(Math.pow(2, n) - 1); if (+$('s1-k').value > Math.pow(2, n) - 1) $('s1-k').value = Math.pow(2, n) - 1;
  var k = +$('s1-k').value, total = Math.pow(2, n) - 1; $('s1-n-v').textContent = String(n); $('s1-k-v').textContent = k + ' / ' + total;
  var st = hanoiState(n, k), cv = $('s1-cv'), c = fit(cv), W = cv._w, H = cv._h, pw = (W - 20) / 3, base = 190, dh = Math.min(22, 150 / n), maxw = pw - 16, p, i;
  txt(c, t('s1Cap', { n: n }), 10, 14, C.ink, 12);
  for (p = 0; p < 3; p++) {
    var cx = 10 + pw * p + pw / 2; c.fillStyle = '#2b3b4d'; c.fillRect(cx - 3, base - n * dh - 12, 6, n * dh + 12); c.fillRect(cx - pw / 2 + 8, base, pw - 16, 5);
    st.pegs[p].forEach(function (d, j) { var w = 24 + (maxw - 24) * d / n; c.fillStyle = COL[(d - 1) % COL.length]; c.globalAlpha = 0.92; c.fillRect(cx - w / 2, base - (j + 1) * dh, w, dh - 2); c.globalAlpha = 1; txt(c, String(d), cx, base - (j + 1) * dh + dh - 7, '#08131a', 11, 'center'); });
    txt(c, t('peg' + p), cx, base + 22, C.m, 11, 'center');
  }
  var mv = k > 0 ? st.moves[k - 1] : null, half = Math.pow(2, n - 1);
  var phase = k === 0 ? 'ph0' : (k < half ? 'ph1' : (k === half ? 'ph2' : 'ph3'));
  if (n === 1 && k > 0) phase = 'ph2';
  txt(c, t('s1Phase'), 10, base + 48, C.ink, 12); wrapTxt(c, t(phase, { n: n, m: n - 1 }), 10, base + 66, W - 20, 15, C.o, 12);
  setHTML('s1-ro', 's1ro', { n: n, tot: total, k: k, mv: mv ? t('s1Move', { d: mv[0], a: t('peg' + mv[1]), b: t('peg' + mv[2]) }) : t('s1NoMove'), rec: 'T(' + n + ') = 2·T(' + (n - 1) + ') + 1 = ' + total });
  $('s1-play').textContent = t(pl.on && pl.key === 's1-k' ? 's0pause' : 's0play');
}
var kind = 'hanoi';
function render2() {
  var m = +$('s2-m').value; $('s2-m-v').textContent = String(m);
  var lv = treeLevels(kind, m), cv = $('s2-cv'), c = fit(cv), W = cv._w, rowH = 34, y0 = 34, i, j;
  txt(c, t('s2Cap_' + kind, { m: m, n: Math.pow(2, m) }), 10, 14, C.ink, 12);
  var tw = W - 20;
  lv.forEach(function (l, d) {
    var y = y0 + d * rowH, nn = Math.min(l.nodes, 64), w = tw / nn;
    txt(c, t('s2Lv', { d: d, n: l.nodes, c: fmtBig(l.cost) }), 10, y + 9, C.m, 10);
    for (j = 0; j < nn; j++) { var x = 10 + j * w; c.fillStyle = COL[d % COL.length]; c.globalAlpha = 0.85; c.fillRect(x + 1, y + 13, Math.max(2, w - 2), 16); c.globalAlpha = 1; }
  });
  var by = y0 + lv.length * rowH + 24; txt(c, t('s2Cost'), 10, by - 8, C.ink, 12); var maxC = Math.max.apply(null, lv.map(function (l) { return l.cost; })) || 1;
  lv.forEach(function (l, d) { var bw = (W - 100) * l.cost / maxC; c.fillStyle = COL[d % COL.length]; c.globalAlpha = 0.85; c.fillRect(40, by + d * 16, Math.max(1, bw), 12); c.globalAlpha = 1; txt(c, 'L' + d, 8, by + d * 16 + 10, C.m, 10); });
  var total = treeTotal(kind, m), nodes = nodesTotal(kind, m), n = Math.pow(2, m);
  var formula = kind === 'hanoi' ? '2^' + m + ' − 1 = ' + (Math.pow(2, m) - 1) : (kind === 'binary' ? 'log₂' + n + ' + 1 = ' + (m + 1) : n + ' × log₂' + n + ' = ' + (n * m));
  setHTML('s2-ro', 's2ro', { kind: t('k_' + kind), lv: lv.length, nodes: nodes, total: fmtBig(total), formula: formula });
  ['hanoi', 'binary', 'merge'].forEach(function (k) { var b = $('s2-' + k); b.classList.toggle('active', k === kind); b.setAttribute('aria-pressed', k === kind ? 'true' : 'false'); });
}
function render3() {
  var n = +$('s3-n').value; $('s3-n-v').textContent = String(n);
  var cv = $('s3-cv'), c = fit(cv), W = cv._w, gx = 40, gy = 24, gw = W - gx - 12, gh = 220, LMAX = 20, i;
  txt(c, t('s3Cap'), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  function X(v) { return gx + gw * (v - 1) / 63; } function Y(v) { return gy + gh - Math.max(0, Math.min(LMAX, Math.log(Math.max(v, 1)) / Math.LN10)) / LMAX * gh; }
  [0, 5, 10, 15, 20].forEach(function (e) { var yy = gy + gh - e / LMAX * gh; line(c, [[gx, yy], [gx + gw, yy]], C.grid, 1, [3, 4]); txt(c, '1e' + e, gx - 4, yy + 4, C.m, 10, 'right'); });
  var ks = [['hanoi', C.p, 'g_hanoi'], ['merge', C.g, 'g_merge'], ['linear', C.m, 'g_linear'], ['binary', C.a, 'g_binary']];
  ks.forEach(function (q) { var pts = []; for (i = 1; i <= 64; i++) pts.push([X(i), Y(growth(i)[q[0]])]); line(c, pts, q[1], 2.2); });
  line(c, [[X(n), gy], [X(n), gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]); var g = growth(n); ks.forEach(function (q) { c.fillStyle = q[1]; c.beginPath(); c.arc(X(n), Y(g[q[0]]), 4, 0, 7); c.fill(); });
  var ly = gy + 14; ks.forEach(function (q) { txt(c, t(q[2]), gx + 6, ly, q[1], 11); ly += 14; });
  txt(c, t('s3Ax'), gx + gw, gy + gh + 14, C.m, 10, 'right'); [1, 16, 32, 48, 64].forEach(function (v) { txt(c, String(v), X(v), gy + gh + 14, C.m, 10, v === 1 ? 'left' : 'center'); });
  var ht = humanTime(g.hanoi / 1e9), hm = humanTime(g.merge / 1e9);
  setHTML('s3-ro', 's3ro', { n: n, h: fmtBig(g.hanoi), m: fmtBig(g.merge), b: fmtBig(g.binary), ht: fmtBig(ht.v) + ' ' + t('u_' + ht.u), hm: fmtBig(hm.v) + ' ' + t('u_' + hm.u) });
}
var arrSeed = 3;
function render4() {
  var a = randArr(arrSeed, 8), ms = mergeSortEvents(a), ev = ms.events, k = +$('s4-k').value; $('s4-k').max = String(ev.length); if (k > ev.length) $('s4-k').value = ev.length;
  k = +$('s4-k').value; $('s4-k-v').textContent = k + ' / ' + ev.length;
  var cur = k > 0 ? ev[k - 1] : null, arr = cur ? cur.arr : a, cv = $('s4-cv'), c = fit(cv), W = cv._w, bw = (W - 20) / 8, i;
  txt(c, t('s4Cap'), 10, 14, C.ink, 12);
  for (i = 0; i < 8; i++) {
    var hh = arr[i] * 16, inR = cur && i >= cur.lo && i < cur.hi, x = 10 + i * bw;
    c.fillStyle = inR ? (cur.t === 'merge' ? C.g : C.o) : '#3a566b'; c.globalAlpha = 0.9; c.fillRect(x + 5, 190 - hh, bw - 10, hh); c.globalAlpha = 1; txt(c, String(arr[i]), x + bw / 2, 190 - hh - 4, C.ink, 11, 'center');
  }
  if (cur) { var x0 = 10 + cur.lo * bw, x1 = 10 + cur.hi * bw; c.strokeStyle = cur.t === 'merge' ? C.g : C.o; c.lineWidth = 2; c.strokeRect(x0 + 1, 40, x1 - x0 - 2, 156); }
  txt(c, t('s4Stack'), 10, 224, C.ink, 12);
  var stk = cur ? cur.stack : []; stk.forEach(function (r, d) { var w = (W - 20) * (r[1] - r[0]) / 8; c.fillStyle = COL[d % COL.length]; c.globalAlpha = 0.8; c.fillRect(10, 232 + d * 20, w, 16); c.globalAlpha = 1; txt(c, '[' + r[0] + ', ' + r[1] + ')', 14, 232 + d * 20 + 12, '#08131a', 11); });
  var cmp = cur ? cur.cmp : 0, bound = 8 * 3;
  setHTML('s4-ro', 's4ro', { k: k, tot: ev.length, what: cur ? t(cur.t === 'split' ? 's4Split' : 's4Merge', { a: cur.lo, b: cur.hi, c: cur.c }) : t('s4Init'), cmp: cmp, bound: bound, depth: stk.length, orig: a.join(' '), fin: ms.sorted.join(' ') });
  $('s4-play').textContent = t(pl.on && pl.key === 's4-k' ? 's0pause' : 's0play');
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  $('s0-n').addEventListener('input', function () { playStop(); render0(); }); $('s0-k').addEventListener('input', function () { playStop(); render0(); }); $('s0-play').addEventListener('click', function () { playToggle('s0-k', 0.6); });
  $('s1-n').addEventListener('input', function () { playStop(); render1(); }); $('s1-k').addEventListener('input', function () { playStop(); render1(); }); $('s1-play').addEventListener('click', function () { playToggle('s1-k', 0.3); });
  ['hanoi', 'binary', 'merge'].forEach(function (k) { $('s2-' + k).addEventListener('click', function () { kind = k; render2(); }); }); $('s2-m').addEventListener('input', render2);
  $('s3-n').addEventListener('input', render3);
  $('s4-k').addEventListener('input', function () { playStop(); render4(); }); $('s4-play').addEventListener('click', function () { playToggle('s4-k', 0.6); });
  $('s4-new').addEventListener('click', function () { playStop(); arrSeed++; $('s4-k').value = 0; render4(); });
  var reset = {
    0: function () { playStop(); $('s0-n').value = 4; $('s0-k').value = 0; render0(); }, 1: function () { playStop(); $('s1-n').value = 3; $('s1-k').value = 0; render1(); },
    2: function () { kind = 'hanoi'; $('s2-m').value = 4; render2(); }, 3: function () { $('s3-n').value = 20; render3(); },
    4: function () { playStop(); arrSeed = 3; $('s4-k').value = 0; render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { playStop(); renderAll(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); else if (pl.on && ('step' + pl.key.charAt(1)) === e.target.id) { playStop(); renderAll(); } }); }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
