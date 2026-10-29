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
function truth(x, y) { return ((x > 0.5 && y < 0.55) || (x < 0.25 && y > 0.65)) ? 1 : 0; }
// points are fixed per seed; label flips are nested across noise levels
function makeData(n, seed, noise) {
  var r = rng(seed), d = [];
  for (var i = 0; i < n; i++) { var x = r(), y = r(), u = r(), lab = truth(x, y); if (u < noise) lab = 1 - lab; d.push({ x: x, y: y, c: lab, t: truth(x, y) }); }
  return d;
}
function ent(n0, n1) { var n = n0 + n1; if (!n || !n0 || !n1) return 0; var p = n0 / n, q = n1 / n; return -(p * Math.log(p) + q * Math.log(q)) / Math.LN2; }
function gini(n0, n1) { var n = n0 + n1; if (!n) return 0; var p = n0 / n; return 2 * p * (1 - p); }
function counts(idx, d) { var a = 0, b = 0; idx.forEach(function (i) { if (d[i].c) b++; else a++; }); return [a, b]; }
function gainAt(idx, d, f, thr) {
  var l = [0, 0], r = [0, 0]; idx.forEach(function (i) { (d[i][f] < thr ? l : r)[d[i].c]++; });
  var n = idx.length, tot = [l[0] + r[0], l[1] + r[1]];
  return ent(tot[0], tot[1]) - (l[0] + l[1]) / n * ent(l[0], l[1]) - (r[0] + r[1]) / n * ent(r[0], r[1]);
}
function bestSplit(idx, d) {
  var best = { gain: 0, f: null, thr: 0 };
  ['x', 'y'].forEach(function (f) {
    var s = idx.slice().sort(function (a, b) { return d[a][f] - d[b][f] || a - b; });
    for (var k = 1; k < s.length; k++) {
      if (d[s[k]][f] === d[s[k - 1]][f]) continue;
      var thr = (d[s[k]][f] + d[s[k - 1]][f]) / 2, g = gainAt(idx, d, f, thr);
      if (g > best.gain + 1e-12) best = { gain: g, f: f, thr: thr };
    }
  });
  return best;
}
var NID = 0;
function mkNode(idx, d, depth, box) { var c = counts(idx, d); return { id: NID++, idx: idx, depth: depth, c: c, box: box, leaf: true, cls: c[1] > c[0] ? 1 : 0, split: null }; }
function doSplit(nd, d, sp) {
  var li = [], ri = []; nd.idx.forEach(function (i) { (d[i][sp.f] < sp.thr ? li : ri).push(i); });
  var bl = nd.box.slice(), br = nd.box.slice(), k = sp.f === 'x' ? 0 : 1; bl[k + 2] = sp.thr; br[k] = sp.thr;
  nd.leaf = false; nd.split = sp; nd.l = mkNode(li, d, nd.depth + 1, bl); nd.r = mkNode(ri, d, nd.depth + 1, br);
}
// best-first growth: at each step split the leaf with the largest weighted gain
function growBestFirst(d, nSplits) {
  NID = 0; var all = d.map(function (v, i) { return i; }), root = mkNode(all, d, 0, [0, 0, 1, 1]), leaves = [root], hist = [];
  for (var s = 0; s < nSplits; s++) {
    var pick = null, pg = 0, psp = null;
    leaves.forEach(function (lf) { var sp = bestSplit(lf.idx, d), w = sp.gain * lf.idx.length / d.length; if (sp.f && w > pg + 1e-12) { pick = lf; pg = w; psp = sp; } });
    if (!pick) break;
    doSplit(pick, d, psp); hist.push({ f: psp.f, thr: psp.thr, gain: psp.gain, n: pick.idx.length });
    leaves.splice(leaves.indexOf(pick), 1, pick.l, pick.r);
  }
  return { root: root, leaves: leaves, hist: hist };
}
function growDepth(d, maxDepth) {
  NID = 0; var all = d.map(function (v, i) { return i; }), root = mkNode(all, d, 0, [0, 0, 1, 1]), leaves = [];
  (function rec(nd) {
    var sp = nd.depth < maxDepth && nd.c[0] && nd.c[1] ? bestSplit(nd.idx, d) : { f: null };
    if (!sp.f) { leaves.push(nd); return; }
    doSplit(nd, d, sp); rec(nd.l); rec(nd.r);
  })(root);
  return { root: root, leaves: leaves };
}
function predict(root, x, y) { var nd = root, path = [root]; while (!nd.leaf) { nd = (nd.split.f === 'x' ? x : y) < nd.split.thr ? nd.l : nd.r; path.push(nd); } return { leaf: nd, path: path }; }
function accuracy(root, pts, key) { var ok = 0; pts.forEach(function (p) { if (predict(root, p.x, p.y).leaf.cls === p[key || 'c']) ok++; }); return ok / pts.length; }
var TRAIN_SEED = 7, TEST_SEED = 99, NTRAIN = 80, NTEST = 600, NOISE0 = 0.08;
var M = { truth: truth, makeData: makeData, ent: ent, gini: gini, gainAt: gainAt, bestSplit: bestSplit, growBestFirst: growBestFirst, growDepth: growDepth, predict: predict, accuracy: accuracy, TRAIN_SEED: TRAIN_SEED, TEST_SEED: TEST_SEED, NTRAIN: NTRAIN, NTEST: NTEST, NOISE0: NOISE0 };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
var K0 = '#67d7f9', K1 = '#f6a45b';
function f2(v) { return (+v).toFixed(2); } function f3(v) { return (+v).toFixed(3); } function pc(v) { return (v * 100).toFixed(1) + '%'; }
function fname(f) { return t(f === 'x' ? 'featX' : 'featY'); }
function mark(c, x, y, cls, r, ring) {
  c.fillStyle = cls ? K1 : K0; c.strokeStyle = '#08131a'; c.lineWidth = 1;
  if (cls) { c.fillRect(x - r, y - r, 2 * r, 2 * r); c.strokeRect(x - r, y - r, 2 * r, 2 * r); } else { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); }
  if (ring) { c.strokeStyle = '#ff7a93'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 3.5, 0, 7); c.stroke(); }
}
function scatter(c, x0, y0, s, d, root, opt) {
  opt = opt || {};
  if (root) (function rec(nd) {
    if (nd.leaf) { c.fillStyle = nd.cls ? 'rgba(246,164,91,.2)' : 'rgba(103,215,249,.16)'; c.fillRect(x0 + nd.box[0] * s, y0 + (1 - nd.box[3]) * s, (nd.box[2] - nd.box[0]) * s, (nd.box[3] - nd.box[1]) * s); } else { rec(nd.l); rec(nd.r); }
  })(root);
  if (root) (function rec(nd) {
    if (nd.leaf) return; var sp = nd.split, b = nd.box;
    if (sp.f === 'x') line(c, [[x0 + sp.thr * s, y0 + (1 - b[3]) * s], [x0 + sp.thr * s, y0 + (1 - b[1]) * s]], '#fff', 1.4); else line(c, [[x0 + b[0] * s, y0 + (1 - sp.thr) * s], [x0 + b[2] * s, y0 + (1 - sp.thr) * s]], '#fff', 1.4);
    rec(nd.l); rec(nd.r);
  })(root);
  c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(x0 + 0.5, y0 + 0.5, s - 1, s - 1);
  d.forEach(function (p) { mark(c, x0 + p.x * s, y0 + (1 - p.y) * s, p.c, 3.6, root && opt.wrong && predict(root, p.x, p.y).leaf.cls !== p.c); });
}
function layout(root) {
  var nl = 0; (function rec(nd) { if (nd.leaf) { nd.px = nl++; } else { rec(nd.l); rec(nd.r); nd.px = (nd.l.px + nd.r.px) / 2; } })(root); return nl;
}
function drawTree(c, root, x0, y0, w, h, hl) {
  var nl = layout(root), maxd = 0; (function rec(nd) { if (nd.depth > maxd) maxd = nd.depth; if (!nd.leaf) { rec(nd.l); rec(nd.r); } })(root);
  var dx = w / Math.max(nl, 1), dy = maxd ? Math.min(54, (h - 16) / maxd) : 0, R = Math.max(4, Math.min(10, dx / 2 - 1));
  function P(nd) { return [x0 + (nd.px + 0.5) * dx, y0 + 10 + nd.depth * dy]; }
  (function rec(nd) {
    if (nd.leaf) return; var a = P(nd);
    [nd.l, nd.r].forEach(function (ch) { var b = P(ch), on = hl && hl.indexOf(nd) >= 0 && hl.indexOf(ch) >= 0; line(c, [a, b], on ? '#fff' : C.grid, on ? 2.6 : 1.2); rec(ch); });
  })(root);
  (function rec(nd) {
    var p = P(nd), on = hl && hl.indexOf(nd) >= 0, tot = nd.c[0] + nd.c[1], frac = tot ? nd.c[1] / tot : 0;
    c.fillStyle = '#10202e'; c.beginPath(); c.arc(p[0], p[1], R, 0, 7); c.fill();
    c.fillStyle = K1; c.beginPath(); c.moveTo(p[0], p[1]); c.arc(p[0], p[1], R, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * frac); c.closePath(); c.fill();
    c.strokeStyle = on ? '#fff' : '#36536a'; c.lineWidth = on ? 2.6 : 1.2; c.beginPath(); c.arc(p[0], p[1], R, 0, 7); c.stroke();
    if (!nd.leaf) { if (nd.depth <= 1 && R >= 6) txt(c, (nd.split.f === 'x' ? 'x' : 'y') + '<' + f2(nd.split.thr), p[0], p[1] - R - 3, C.m, 9, 'center'); rec(nd.l); rec(nd.r); }
  })(root);
}
var s1 = { f: 'x' };
function render0() {
  var k = +$('s0-k').value, n = 40, p = k / n; $('s0-k-v').textContent = k + ' / ' + n;
  var cv = $('s0-cv'), c = fit(cv), W = cv._w, i;
  txt(c, t('s0Dots'), 10, 16, C.ink, 12);
  var cols = 10, cs = Math.min(26, (W - 20) / cols);
  for (i = 0; i < n; i++) mark(c, 14 + (i % cols) * cs + cs / 2, 34 + Math.floor(i / cols) * cs, i < k ? 1 : 0, 7);
  var gx = 20, gy = 150, gw = W - 40, gh = 130;
  txt(c, t('s0Curve'), 10, gy - 10, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  var he = [], gi = [];
  for (i = 0; i <= 100; i++) { var q = i / 100; he.push([gx + gw * q, gy + gh - ent(100 - i, i) * (gh - 6) - 3]); gi.push([gx + gw * q, gy + gh - 2 * q * (1 - q) * (gh - 6) - 3]); }
  line(c, he, C.a, 2.2); line(c, gi, C.g, 2.2);
  line(c, [[gx + gw * p, gy], [gx + gw * p, gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]);
  c.fillStyle = C.a; c.beginPath(); c.arc(gx + gw * p, gy + gh - ent(n - k, k) * (gh - 6) - 3, 5, 0, 7); c.fill(); c.fillStyle = C.g; c.beginPath(); c.arc(gx + gw * p, gy + gh - gini(n - k, k) * 2 * (gh - 6) - 3, 5, 0, 7); c.fill();
  txt(c, t('s0Ax'), gx + gw, gy + gh + 14, C.m, 10, 'right'); txt(c, t('s0LegE'), gx + 6, gy + 14, C.a, 11); txt(c, t('s0LegG'), gx + 6, gy + 28, C.g, 11);
  setHTML('s0-ro', 's0ro', { k: k, n: n, p: f2(p), h: f3(ent(n - k, k)), g: f3(gini(n - k, k)) });
}
function ds8() { return makeData(NTRAIN, TRAIN_SEED, NOISE0); }
function render1() {
  var f = s1.f, thr = +$('s1-t').value / 100; $('s1-t-v').textContent = thr.toFixed(2);
  var d = ds8(), idx = d.map(function (v, i) { return i; }), cv = $('s1-cv'), c = fit(cv), W = cv._w, s = Math.min(W - 20, 250), x0 = (W - s) / 2, y0 = 22;
  txt(c, t('s1Scat'), 10, 14, C.ink, 12);
  c.fillStyle = 'rgba(103,215,249,.07)'; c.fillRect(x0, y0, s, s);
  if (f === 'x') { line(c, [[x0 + thr * s, y0], [x0 + thr * s, y0 + s]], '#fff', 2); } else { line(c, [[x0, y0 + (1 - thr) * s], [x0 + s, y0 + (1 - thr) * s]], '#fff', 2); }
  scatter(c, x0, y0, s, d, null);
  if (f === 'x') line(c, [[x0 + thr * s, y0], [x0 + thr * s, y0 + s]], '#fff', 2); else line(c, [[x0, y0 + (1 - thr) * s], [x0 + s, y0 + (1 - thr) * s]], '#fff', 2);
  var gy = y0 + s + 36, gh = 80, gx = 20, gw = W - 40, curve = [], best = { g: -1, t: 0 }, i;
  for (i = 0; i <= 100; i++) { var th = i / 100, g = gainAt(idx, d, f, th); curve.push([gx + gw * th, gy + gh - g * (gh - 6) / 0.8 - 3]); if (g > best.g) best = { g: g, t: th }; }
  txt(c, t('s1Gain', { f: fname(f) }), 10, gy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  line(c, curve, C.g, 2); line(c, [[gx + gw * thr, gy], [gx + gw * thr, gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]);
  var cg = gainAt(idx, d, f, thr); c.fillStyle = C.o; c.beginPath(); c.arc(gx + gw * thr, gy + gh - cg * (gh - 6) / 0.8 - 3, 5, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(gx + gw * best.t, gy + gh - best.g * (gh - 6) / 0.8 - 3, 4, 0, 7); c.fill(); txt(c, t('s1Best'), gx + gw * best.t + 7, gy + 14, '#fff', 10, best.t > 0.7 ? 'right' : 'left');
  var l = [0, 0], r = [0, 0]; idx.forEach(function (j) { (d[j][f] < thr ? l : r)[d[j].c]++; });
  var tot = [l[0] + r[0], l[1] + r[1]], hp = ent(tot[0], tot[1]), ha = (l[0] + l[1]) / idx.length * ent(l[0], l[1]) + (r[0] + r[1]) / idx.length * ent(r[0], r[1]);
  setHTML('s1-ro', 's1ro', { f: fname(f), t: f2(thr), l0: l[0], l1: l[1], r0: r[0], r1: r[1], hp: f3(hp), ha: f3(ha), g: f3(cg), bt: f2(best.t), bg: f3(best.g) });
  ['x', 'y'].forEach(function (ff) { var b = $('s1-f' + ff); b.classList.toggle('active', ff === f); b.setAttribute('aria-pressed', ff === f ? 'true' : 'false'); });
}
var pl = { on: false, raf: 0, acc: 0, last: 0 };
function render2() {
  var n = +$('s2-n').value; $('s2-n-v').textContent = String(n);
  var d = ds8(), tr = growBestFirst(d, n), cv = $('s2-cv'), c = fit(cv), W = cv._w, s = Math.min(W - 20, 240), x0 = (W - s) / 2, y0 = 22;
  txt(c, t('s2Scat'), 10, 14, C.ink, 12); scatter(c, x0, y0, s, d, tr.root, { wrong: true });
  txt(c, t('s2Tree'), 10, y0 + s + 22, C.ink, 12); drawTree(c, tr.root, 10, y0 + s + 28, W - 20, 120, null);
  var acc = accuracy(tr.root, d), wrong = Math.round((1 - acc) * d.length), last = tr.hist[tr.hist.length - 1];
  setHTML('s2-ro', 's2ro', { n: n, got: tr.hist.length, leaves: tr.leaves.length, acc: pc(acc), wrong: wrong, last: last ? t('s2Last', { f: fname(last.f), t: f2(last.thr), g: f3(last.gain), m: last.n }) : t('s2None') });
  $('s2-play').textContent = t(pl.on ? 's2pause' : 's2play');
}
function stopPlay() { pl.on = false; cancelAnimationFrame(pl.raf); }
function tickPlay(ts) {
  if (!pl.on) return; pl.acc += Math.min(0.1, (ts - pl.last) / 1000); pl.last = ts;
  if (pl.acc >= (reduced() ? 0.9 : 0.55)) { pl.acc = 0; var v = +$('s2-n').value + 1; $('s2-n').value = v; if (v >= +$('s2-n').max) stopPlay(); render2(); }
  if (pl.on) pl.raf = requestAnimationFrame(tickPlay);
}
function render3() {
  var dep = +$('s3-d').value, nz = +$('s3-z').value / 100; $('s3-d-v').textContent = String(dep); $('s3-z-v').textContent = Math.round(nz * 100) + '%';
  var d = makeData(NTRAIN, TRAIN_SEED, nz), te = makeData(NTEST, TEST_SEED, 0), cv = $('s3-cv'), c = fit(cv), W = cv._w, gx = 36, gy = 24, gw = W - gx - 14, gh = 220, i;
  var trA = [], teA = [], leaves = [];
  for (i = 1; i <= 10; i++) { var tr = growDepth(d, i); trA.push(accuracy(tr.root, d)); teA.push(accuracy(tr.root, te, 't')); leaves.push(tr.leaves.length); }
  txt(c, t('s3Cap'), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  function X(k) { return gx + gw * (k - 1) / 9; } function Y(a) { return gy + gh - (a - 0.5) / 0.5 * (gh - 8) - 4; }
  [0.5, 0.75, 1].forEach(function (a) { line(c, [[gx, Y(a)], [gx + gw, Y(a)]], C.grid, 1, [3, 4]); txt(c, Math.round(a * 100) + '%', gx - 4, Y(a) + 4, C.m, 10, 'right'); });
  line(c, trA.map(function (a, k) { return [X(k + 1), Y(a)]; }), K1, 2.4); line(c, teA.map(function (a, k) { return [X(k + 1), Y(a)]; }), K0, 2.4);
  for (i = 1; i <= 10; i++) { txt(c, String(i), X(i), gy + gh + 14, C.m, 10, 'center'); }
  line(c, [[X(dep), gy], [X(dep), gy + gh]], 'rgba(255,255,255,.5)', 1, [3, 3]);
  c.fillStyle = K1; c.beginPath(); c.arc(X(dep), Y(trA[dep - 1]), 5, 0, 7); c.fill(); c.fillStyle = K0; c.beginPath(); c.arc(X(dep), Y(teA[dep - 1]), 5, 0, 7); c.fill();
  txt(c, t('s3Ax'), gx + gw, gy + gh + 28, C.m, 10, 'right'); txt(c, t('s3LegTr'), gx + 6, gy + 14, K1, 11); txt(c, t('s3LegTe'), gx + 6, gy + 28, K0, 11);
  var bestK = 1; teA.forEach(function (a, k) { if (a > teA[bestK - 1] + 1e-12) bestK = k + 1; });
  setHTML('s3-ro', 's3ro', { d: dep, z: Math.round(nz * 100), leaves: leaves[dep - 1], tr: pc(trA[dep - 1]), te: pc(teA[dep - 1]), bk: bestK, bt: pc(teA[bestK - 1]) });
}
function render4() {
  var dep = +$('s4-d').value, qx = +$('s4-x').value / 100, qy = +$('s4-y').value / 100; $('s4-d-v').textContent = String(dep); $('s4-x-v').textContent = f2(qx); $('s4-y-v').textContent = f2(qy);
  var d = ds8(), tr = growDepth(d, dep), pr = predict(tr.root, qx, qy), cv = $('s4-cv'), c = fit(cv), W = cv._w, s = Math.min(W - 20, 240), x0 = (W - s) / 2, y0 = 22;
  txt(c, t('s4Scat'), 10, 14, C.ink, 12); scatter(c, x0, y0, s, d, tr.root);
  var L = pr.leaf, b = L.box; c.strokeStyle = '#fff'; c.lineWidth = 2.4; c.strokeRect(x0 + b[0] * s, y0 + (1 - b[3]) * s, (b[2] - b[0]) * s, (b[3] - b[1]) * s);
  var qx0 = x0 + qx * s, qy0 = y0 + (1 - qy) * s; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(qx0 - 8, qy0); c.lineTo(qx0 + 8, qy0); c.moveTo(qx0, qy0 - 8); c.lineTo(qx0, qy0 + 8); c.stroke();
  txt(c, t('s4Tree'), 10, y0 + s + 22, C.ink, 12); drawTree(c, tr.root, 10, y0 + s + 28, W - 20, 130, pr.path);
  var tot = L.c[0] + L.c[1];
  var q = pr.path.slice(0, -1).map(function (nd) { return fname(nd.split.f) + (((nd.split.f === 'x' ? qx : qy) < nd.split.thr) ? ' < ' : ' ≥ ') + f2(nd.split.thr); }).join('; ');
  setHTML('s4-ro', 's4ro', { x: f2(qx), y: f2(qy), cls: t(L.cls ? 'cls1' : 'cls0'), c0: L.c[0], c1: L.c[1], conf: tot ? pc(Math.max(L.c[0], L.c[1]) / tot) : '—', k: pr.path.length - 1, q: q || t('s4NoQ') });
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  $('s0-k').addEventListener('input', render0); $('s1-t').addEventListener('input', render1);
  $('s1-fx').addEventListener('click', function () { s1.f = 'x'; render1(); }); $('s1-fy').addEventListener('click', function () { s1.f = 'y'; render1(); });
  $('s2-n').addEventListener('input', function () { stopPlay(); render2(); });
  $('s2-play').addEventListener('click', function () { if (pl.on) { stopPlay(); render2(); return; } if (+$('s2-n').value >= +$('s2-n').max) $('s2-n').value = 0; pl.on = true; pl.acc = 0; pl.last = performance.now(); pl.raf = requestAnimationFrame(tickPlay); render2(); });
  ['s3-d', 's3-z'].forEach(function (id) { $(id).addEventListener('input', render3); });
  ['s4-d', 's4-x', 's4-y'].forEach(function (id) { $(id).addEventListener('input', render4); });
  var reset = {
    0: function () { $('s0-k').value = 20; render0(); },
    1: function () { s1.f = 'x'; $('s1-t').value = 50; render1(); },
    2: function () { stopPlay(); $('s2-n').value = 0; render2(); },
    3: function () { $('s3-d').value = 3; $('s3-z').value = 8; render3(); },
    4: function () { $('s4-d').value = 3; $('s4-x').value = 70; $('s4-y').value = 30; render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopPlay(); render2(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); if (!e.isIntersecting && e.target.id === 'step2' && pl.on) { stopPlay(); render2(); } }); }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
