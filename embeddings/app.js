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
var COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff', '#ffd966', '#9fe6ff', '#ffb3c1'];
var WORDS = ['man', 'woman', 'boy', 'girl', 'king', 'queen', 'apple', 'cat'];
// hand-set toy features: gender (-1 male .. +1 female), royalty, age (child 0 .. adult 1), human, alive
var VEC = {
  man: [-1, 0, 1, 1, 1], woman: [1, 0, 1, 1, 1], boy: [-1, 0, 0.2, 1, 1], girl: [1, 0, 0.2, 1, 1],
  king: [-1, 1, 1, 1, 1], queen: [1, 1, 1, 1, 1], apple: [0, 0, 0.5, 0, 0], cat: [0, 0, 0.3, 0, 1]
};
WORDS.push('prince', 'princess'); VEC.prince = [-1, 1, 0.3, 1, 1]; VEC.princess = [1, 1, 0.3, 1, 1];
var DIMS = 5, RANGE = [[-1.6, 1.6], [-0.3, 1.3], [-0.3, 1.3], [-0.3, 1.3], [-0.3, 1.3]];
function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
function norm(a) { return Math.sqrt(dot(a, a)); }
function cosine(a, b) { var d = norm(a) * norm(b); return d === 0 ? 0 : dot(a, b) / d; }
function euclid(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]); return Math.sqrt(s); }
function scaleV(a, k) { return a.map(function (v) { return v * k; }); }
function analogy(a, b, c, lam) { return VEC[a].map(function (v, i) { return v - lam * VEC[b][i] + lam * VEC[c][i]; }); }
function rank(vec, vocab, exclude) {
  return vocab.filter(function (w) { return exclude.indexOf(w) < 0; }).map(function (w) { return { w: w, c: cosine(vec, VEC[w]) }; }).sort(function (x, y) { return y.c - x.c || (x.w < y.w ? -1 : 1); });
}
var CORPUS = [['cat', 'eats', 'bread'], ['dog', 'eats', 'bread'], ['cat', 'runs', 'home'], ['dog', 'runs', 'home'], ['cat', 'purrs', 'softly'], ['dog', 'barks', 'loudly'], ['apple', 'tastes', 'sweet'], ['bread', 'tastes', 'fresh'], ['apple', 'tastes', 'fresh'], ['bread', 'tastes', 'sweet'], ['king', 'rules', 'land'], ['queen', 'rules', 'land'], ['king', 'wears', 'crown'], ['queen', 'wears', 'crown']];
var TARGETS = ['cat', 'dog', 'apple', 'bread', 'king', 'queen'];
var CTX = ['cat', 'dog', 'apple', 'bread', 'king', 'queen', 'eats', 'runs', 'home', 'tastes', 'sweet', 'fresh', 'rules', 'land', 'wears', 'crown', 'purrs', 'softly', 'barks', 'loudly'];
function cooc(k, win) {
  var C = {}; TARGETS.forEach(function (w) { C[w] = CTX.map(function () { return 0; }); });
  for (var s = 0; s < k; s++) {
    var sen = CORPUS[s];
    for (var i = 0; i < sen.length; i++) for (var j = 0; j < sen.length; j++) if (i !== j && Math.abs(i - j) <= win && C[sen[i]]) C[sen[i]][CTX.indexOf(sen[j])]++;
  }
  return C;
}
function simRank(target, k, win) {
  var C = cooc(k, win);
  return TARGETS.filter(function (w) { return w !== target; }).map(function (w) { return { w: w, c: cosine(C[target], C[w]) }; }).sort(function (x, y) { return y.c - x.c || (x.w < y.w ? -1 : 1); });
}
var M = { WORDS: WORDS, VEC: VEC, CORPUS: CORPUS, TARGETS: TARGETS, CTX: CTX, dot: dot, norm: norm, cosine: cosine, euclid: euclid, scaleV: scaleV, analogy: analogy, rank: rank, cooc: cooc, simRank: simRank };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
function wn(w) { return t('w_' + w); }
function fv(v) { return '(' + v.map(function (x) { return (+x.toFixed(2)); }).join(', ') + ')'; }
function colOf(w) { return COL[WORDS.indexOf(w) % COL.length]; }
function ptLabel(c, s, x, y, col, size, cw) { c.font = size + 'px system-ui,sans-serif'; var w = c.measureText(s).width; if (x + 9 + w > cw - 2) txt(c, s, x - 9, y, col, size, 'right'); else txt(c, s, x + 9, y, col, size, 'left'); }
function fillSelect(id, items, labelFn, cur) {
  var s = $(id); if (!s) return; var v = cur !== undefined ? cur : s.value; s.innerHTML = '';
  items.forEach(function (it, i) { var o = document.createElement('option'); o.value = String(it); o.textContent = labelFn(it, i); s.appendChild(o); });
  s.value = String(v);
}
var sel = { x: '0', y: '1', w: 'king', a: 'man', b: 'woman', ka: 'king', kb: 'man', kc: 'woman', tgt: 'cat' };
function fillAll() {
  var dims = [0, 1, 2, 3, 4], dn = function (d) { return t('dim' + d); };
  fillSelect('s0-x', dims, dn, sel.x); fillSelect('s0-y', dims, dn, sel.y);
  var wl = function (w) { return wn(w); };
  fillSelect('s0-w', WORDS, wl, sel.w); fillSelect('s1-a', WORDS, wl, sel.a); fillSelect('s1-b', WORDS, wl, sel.b);
  fillSelect('s2-a', WORDS, wl, sel.ka); fillSelect('s2-b', WORDS, wl, sel.kb); fillSelect('s2-c', WORDS, wl, sel.kc);
  fillSelect('s4-t', TARGETS, wl, sel.tgt);
  WORDS.forEach(function (w) { var e = $('s3-lab-' + w); if (e) e.textContent = wn(w); });
}
function render0() {
  sel.x = $('s0-x').value; sel.y = $('s0-y').value; sel.w = $('s0-w').value;
  var xd = +sel.x, yd = +sel.y, cv = $('s0-cv'), c = fit(cv), W = cv._w, H = cv._h, px0 = 44, py0 = 12, pw = W - px0 - 12, ph = H - py0 - 40;
  c.strokeStyle = C.grid; c.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, ph - 1);
  function X(v) { return px0 + (v - RANGE[xd][0]) / (RANGE[xd][1] - RANGE[xd][0]) * pw; } function Y(v) { return py0 + ph - (v - RANGE[yd][0]) / (RANGE[yd][1] - RANGE[yd][0]) * ph; }
  line(c, [[X(0), py0], [X(0), py0 + ph]], C.grid, 1, [3, 4]); line(c, [[px0, Y(0)], [px0 + pw, Y(0)]], C.grid, 1, [3, 4]);
  var seen = {};
  WORDS.forEach(function (w) {
    var v = VEC[w], key = v[xd] + ',' + v[yd], off = seen[key] || 0; seen[key] = off + 1;
    var x = X(v[xd]), y = Y(v[yd]); c.fillStyle = colOf(w); c.globalAlpha = w === sel.w ? 1 : 0.8; c.beginPath(); c.arc(x, y, w === sel.w ? 8 : 5, 0, 7); c.fill(); c.globalAlpha = 1;
    if (w === sel.w) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
    ptLabel(c, wn(w), x, y - 6 + off * 13, colOf(w), 12, W);
  });
  txt(c, t('dim' + xd), px0 + pw, py0 + ph + 16, C.m, 11, 'right'); txt(c, t('dim' + yd), 4, py0 + 10, C.m, 11);
  txt(c, t('s0Same'), px0 + 4, py0 + ph + 32, C.m, 10);
  var v = VEC[sel.w];
  setHTML('s0-ro', 's0ro', { w: wn(sel.w), v: fv(v), x: t('dim' + xd), y: t('dim' + yd), n: WORDS.filter(function (u) { return VEC[u][xd] === v[xd] && VEC[u][yd] === v[yd]; }).length });
}
function profile(c, x, y, w, h, v, col, label, vmin, vmax) {
  var n = v.length, bw = w / n, zero = y + h * (vmax / (vmax - vmin));
  c.strokeStyle = C.grid; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); line(c, [[x, zero], [x + w, zero]], C.m, 1);
  txt(c, label, x, y - 4, col, 11);
  for (var i = 0; i < n; i++) {
    var yy = y + h * (vmax - v[i]) / (vmax - vmin), top = Math.min(yy, zero), bh = Math.abs(yy - zero);
    c.fillStyle = col; c.globalAlpha = 0.85; c.fillRect(x + i * bw + 6, top, bw - 12, Math.max(1, bh)); c.globalAlpha = 1;
    txt(c, (+v[i].toFixed(2)).toString(), x + i * bw + bw / 2, v[i] >= 0 ? top - 3 : top + bh + 11, C.ink, 10, 'center');
  }
}
function render1() {
  sel.a = $('s1-a').value; sel.b = $('s1-b').value; var k = +$('s1-k').value / 10; $('s1-k-v').textContent = '×' + k.toFixed(1);
  var A = VEC[sel.a], B = scaleV(VEC[sel.b], k), cv = $('s1-cv'), c = fit(cv), W = cv._w, x = 10, w = W - 20;
  profile(c, x, 20, w, 62, A, colOf(sel.a), t('s1A', { w: wn(sel.a) }), -3, 3);
  profile(c, x, 108, w, 62, B, colOf(sel.b), t('s1B', { w: wn(sel.b), k: k.toFixed(1) }), -3, 3);
  var prod = A.map(function (v, i) { return v * B[i]; });
  profile(c, x, 196, w, 62, prod, C.g, t('s1P'), -3, 3);
  for (var i = 0; i < DIMS; i++) txt(c, t('dimS' + i), x + (i + 0.5) * w / DIMS, 272, C.m, 10, 'center');
  var rk = rank(A, WORDS, [sel.a]), by = 306, bw = w / rk.length; txt(c, t('s1Nn', { w: wn(sel.a) }), x, by - 6, C.ink, 12);
  c.strokeStyle = C.grid; c.strokeRect(x + 0.5, by + 0.5, w - 1, 80);
  rk.forEach(function (r, i) {
    var hh = Math.max(0, r.c) * 76; c.fillStyle = r.w === sel.b ? C.o : C.a; c.globalAlpha = 0.85; c.fillRect(x + i * bw + 4, by + 80 - hh, bw - 8, hh); c.globalAlpha = 1;
    txt(c, r.c.toFixed(2), x + i * bw + bw / 2, by + 76 - hh, C.ink, 9, 'center'); txt(c, wn(r.w), x + i * bw + bw / 2, by + 94, r.w === sel.b ? C.o : C.m, 9, 'center');
  });
  setHTML('s1-ro', 's1ro', { a: wn(sel.a), b: wn(sel.b), k: k.toFixed(1), dot: dot(A, B).toFixed(2), na: norm(A).toFixed(2), nb: norm(B).toFixed(2), cos: cosine(A, B).toFixed(3), d: euclid(A, B).toFixed(2) });
}
function render2() {
  sel.ka = $('s2-a').value; sel.kb = $('s2-b').value; sel.kc = $('s2-c').value; var lam = +$('s2-l').value / 100; $('s2-l-v').textContent = lam.toFixed(2);
  var r = analogy(sel.ka, sel.kb, sel.kc, lam), cv = $('s2-cv'), c = fit(cv), W = cv._w, H = cv._h, px0 = 40, py0 = 12, pw = W - px0 - 12, ph = 250;
  function X(v) { return px0 + (v - RANGE[0][0]) / (RANGE[0][1] - RANGE[0][0]) * pw; } function Y(v) { return py0 + ph - (v - RANGE[1][0]) / (RANGE[1][1] - RANGE[1][0]) * ph; }
  c.strokeStyle = C.grid; c.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, ph - 1);
  line(c, [[X(0), py0], [X(0), py0 + ph]], C.grid, 1, [3, 4]); line(c, [[px0, Y(0)], [px0 + pw, Y(0)]], C.grid, 1, [3, 4]);
  var seen = {};
  WORDS.forEach(function (w) { var v = VEC[w], key = v[0] + ',' + v[1], o = seen[key] || 0; seen[key] = o + 1; c.fillStyle = colOf(w); c.beginPath(); c.arc(X(v[0]), Y(v[1]), 5, 0, 7); c.fill(); ptLabel(c, wn(w), X(v[0]), Y(v[1]) - 6 + o * 12, colOf(w), 11, W); });
  var A = VEC[sel.ka], B = VEC[sel.kb], Cc = VEC[sel.kc];
  function arrow(x0, y0, x1, y1, col, wd, dash) { line(c, [[X(x0), Y(y0)], [X(x1), Y(y1)]], col, wd, dash); }
  arrow(B[0], B[1], A[0], A[1], C.o, 2.2); arrow(Cc[0], Cc[1], Cc[0] + (A[0] - B[0]), Cc[1] + (A[1] - B[1]), C.o, 2.2, [5, 4]);
  var rx = Math.max(RANGE[0][0], Math.min(RANGE[0][1], r[0])), ry = Math.max(RANGE[1][0], Math.min(RANGE[1][1], r[1])), off = rx !== r[0] || ry !== r[1];
  line(c, [[X(A[0]), Y(A[1])], [X(rx), Y(ry)]], '#ffffff', 1.4, [2, 4]);
  c.fillStyle = off ? '#0b121b' : '#fff'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(X(rx), Y(ry), 6, 0, 7); c.fill(); c.stroke(); ptLabel(c, t(off ? 's2ResOff' : 's2Res'), X(rx), Y(ry) + 14, '#fff', 11, W);
  txt(c, t('dim0'), px0 + pw, py0 + ph + 16, C.m, 11, 'right'); txt(c, t('dim1'), 4, py0 + 10, C.m, 11); txt(c, t('s2Cap'), px0 + 4, py0 + ph + 32, C.m, 10);
  var rk = rank(r, WORDS, [sel.ka, sel.kb, sel.kc]), top = rk[0];
  setHTML('s2-ro', 's2ro', { a: wn(sel.ka), b: wn(sel.kb), c: wn(sel.kc), l: lam.toFixed(2), v: fv(r), top: wn(top.w), cs: top.c.toFixed(3), second: rk[1] ? wn(rk[1].w) : '—' });
}
var vocab = {};
WORDS.forEach(function (w) { vocab[w] = true; });
function render3() {
  var inc = WORDS.filter(function (w) { return vocab[w]; }), r = analogy('king', 'man', 'woman', 1), cv = $('s3-cv'), c = fit(cv), W = cv._w, x = 10, w = W - 20;
  var rk = rank(r, inc, ['king', 'man', 'woman']);
  txt(c, t('s3Cap'), x, 14, C.ink, 12);
  var by = 24, bw = w / WORDS.length; c.strokeStyle = C.grid; c.strokeRect(x + 0.5, by + 0.5, w - 1, 150);
  WORDS.forEach(function (u, i) {
    var item = null; rk.forEach(function (q) { if (q.w === u) item = q; });
    var ex = ['king', 'man', 'woman'].indexOf(u) >= 0;
    var hh = item ? Math.max(0, item.c) * 140 : 0, xx = x + i * bw;
    c.fillStyle = (rk[0] && rk[0].w === u) ? C.o : C.a; c.globalAlpha = item ? 0.9 : 0.15; c.fillRect(xx + 3, by + 148 - hh, bw - 6, Math.max(2, hh)); c.globalAlpha = 1;
    txt(c, item ? item.c.toFixed(2) : (ex ? t('s3In') : t('s3Out')), xx + bw / 2, by + 144 - hh, C.ink, 9, 'center'); txt(c, wn(u), xx + bw / 2, by + 168, vocab[u] ? colOf(u) : C.m, 9, 'center');
  });
  var top = rk[0];
  txt(c, top ? t('s3Ans', { w: wn(top.w) }) : t('s3None'), x, 214, '#fff', 14);
  setHTML('s3-ro', 's3ro', { n: inc.length, top: top ? wn(top.w) : '—', cs: top ? top.c.toFixed(3) : '—', miss: vocab.queen ? t('s3Has') : t('s3Miss') });
}
var rd = { on: false, raf: 0, acc: 0, last: 0 };
function render4() {
  sel.tgt = $('s4-t').value; var k = +$('s4-k').value, win = +$('s4-win').value; $('s4-k-v').textContent = k + ' / ' + CORPUS.length; $('s4-win-v').textContent = String(win);
  var C0 = cooc(k, win), cv = $('s4-cv'), c = fit(cv), W = cv._w, x0 = 54, y0 = 70, cw = Math.min(22, (W - x0 - 8) / CTX.length), rh = 24, i, j;
  txt(c, t('s4Cap'), 8, 14, C.ink, 12);
  for (j = 0; j < CTX.length; j++) { c.save(); c.translate(x0 + j * cw + cw / 2 + 3, y0 - 4); c.rotate(-Math.PI / 3); txt(c, wn(CTX[j]), 0, 0, C.m, 10, 'left'); c.restore(); }
  var mx = 1; TARGETS.forEach(function (w) { C0[w].forEach(function (v) { if (v > mx) mx = v; }); });
  TARGETS.forEach(function (w, ri) {
    txt(c, wn(w), x0 - 4, y0 + ri * rh + 16, w === sel.tgt ? '#fff' : C.m, 11, 'right');
    for (j = 0; j < CTX.length; j++) { var v = C0[w][j]; c.fillStyle = v ? heat(0.25 + 0.75 * v / mx) : '#0e1a26'; c.fillRect(x0 + j * cw, y0 + ri * rh, cw - 1, rh - 2); if (v) txt(c, String(v), x0 + j * cw + cw / 2 - 0.5, y0 + ri * rh + 15, '#08131a', 10, 'center'); }
    if (w === sel.tgt) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x0 - 1, y0 + ri * rh - 1, CTX.length * cw + 1, rh); }
  });
  var by = y0 + TARGETS.length * rh + 34, rk = simRank(sel.tgt, k, win), bw = (W - 20) / rk.length; txt(c, t('s4Sim', { w: wn(sel.tgt) }), 8, by - 8, C.ink, 12);
  c.strokeStyle = C.grid; c.strokeRect(8.5, by + 0.5, W - 17, 90);
  rk.forEach(function (r, ii) { var hh = r.c * 84; c.fillStyle = ii === 0 && r.c > 0 ? C.o : C.a; c.globalAlpha = 0.85; c.fillRect(10 + ii * bw + 6, by + 88 - hh, bw - 12, Math.max(1, hh)); c.globalAlpha = 1; txt(c, r.c.toFixed(2), 10 + ii * bw + bw / 2, by + 84 - hh, C.ink, 10, 'center'); txt(c, wn(r.w), 10 + ii * bw + bw / 2, by + 104, C.m, 10, 'center'); });
  var best = rk[0];
  setHTML('s4-ro', 's4ro', { k: k, n: CORPUS.length, win: win, w: wn(sel.tgt), top: best.c > 0 ? wn(best.w) : '—', cs: best.c.toFixed(3) });
  $('s4-play').textContent = t(rd.on ? 's4pause' : 's4play');
}
function stopRead() { rd.on = false; cancelAnimationFrame(rd.raf); }
function tickRead(ts) {
  if (!rd.on) return; rd.acc += Math.min(0.1, (ts - rd.last) / 1000); rd.last = ts;
  var per = reduced() ? 0.8 : 0.35;
  if (rd.acc >= per) { rd.acc = 0; var k = +$('s4-k').value + 1; $('s4-k').value = k; if (k >= CORPUS.length) stopRead(); render4(); }
  if (rd.on) rd.raf = requestAnimationFrame(tickRead);
}

/* ---------------- wiring ---------------- */
function renderAll() { fillAll(); render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  ['s0-x', 's0-y', 's0-w'].forEach(function (id) { $(id).addEventListener('change', render0); });
  ['s1-a', 's1-b'].forEach(function (id) { $(id).addEventListener('change', render1); }); $('s1-k').addEventListener('input', render1);
  ['s2-a', 's2-b', 's2-c'].forEach(function (id) { $(id).addEventListener('change', render2); }); $('s2-l').addEventListener('input', render2);
  WORDS.forEach(function (w) { var e = $('s3-' + w); e.addEventListener('change', function () { vocab[w] = e.checked; render3(); }); });
  $('s4-t').addEventListener('change', render4); $('s4-win').addEventListener('input', render4);
  $('s4-k').addEventListener('input', function () { stopRead(); render4(); });
  $('s4-play').addEventListener('click', function () { if (rd.on) { stopRead(); render4(); return; } $('s4-k').value = 0; rd.on = true; rd.acc = 0; rd.last = performance.now(); rd.raf = requestAnimationFrame(tickRead); render4(); });
  var reset = {
    0: function () { sel.x = '0'; sel.y = '1'; sel.w = 'king'; fillAll(); render0(); },
    1: function () { sel.a = 'man'; sel.b = 'woman'; $('s1-k').value = 10; fillAll(); render1(); },
    2: function () { sel.ka = 'king'; sel.kb = 'man'; sel.kc = 'woman'; $('s2-l').value = 100; fillAll(); render2(); },
    3: function () { WORDS.forEach(function (w) { vocab[w] = true; $('s3-' + w).checked = true; }); render3(); },
    4: function () { stopRead(); sel.tgt = 'cat'; $('s4-k').value = CORPUS.length; $('s4-win').value = 2; fillAll(); render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopRead(); render4(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
        if (!e.isIntersecting && e.target.id === 'step4' && rd.on) { stopRead(); render4(); }
      });
    }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
