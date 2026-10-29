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
var COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff', '#ffd966', '#9fe6ff', '#ffb3c1', '#b6e388', '#e0b5ff'];
// hand-set logits for three prompts, 10 candidate words each (sorted high to low)
var LOGITS = [
  [3.0, 2.6, 2.2, 1.8, 1.7, 1.5, 0.9, 0.3, 0.0, -1.0],
  [3.2, 3.0, 2.2, 1.5, 1.2, 0.2, 0.1, -0.5, -1.5, -2.5],
  [6.0, 2.0, 1.5, 1.2, 1.0, 0.8, 0.3, -0.5, -0.2, -1.0]
];
function softmaxT(z, T) {
  var mx = -Infinity, i, e = [], s = 0; for (i = 0; i < z.length; i++) if (z[i] > mx) mx = z[i];
  for (i = 0; i < z.length; i++) { e[i] = Math.exp((z[i] - mx) / T); s += e[i]; }
  return e.map(function (v) { return v / s; });
}
function entropyBits(p) { var h = 0; p.forEach(function (v) { if (v > 0) h -= v * Math.log(v) / Math.LN2; }); return h; }
function order(p) { return p.map(function (v, i) { return i; }).sort(function (a, b) { return p[b] - p[a] || a - b; }); }
function renorm(p, keep) { var s = 0; p.forEach(function (v, i) { if (keep[i]) s += v; }); return p.map(function (v, i) { return keep[i] ? v / s : 0; }); }
// top-k then top-p (nucleus) on the renormalised result; returns {keep, q}
function filterDist(p, k, pc) {
  var ord = order(p), keep = p.map(function () { return false; }), i;
  for (i = 0; i < Math.min(k, p.length); i++) keep[ord[i]] = true;
  var q1 = renorm(p, keep), cum = 0, keep2 = p.map(function () { return false; });
  for (i = 0; i < ord.length; i++) { if (!keep[ord[i]]) continue; keep2[ord[i]] = true; cum += q1[ord[i]]; if (cum >= pc - 1e-12) break; }
  return { keep: keep2, q: renorm(p, keep2) };
}
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t0 = a; t0 = Math.imul(t0 ^ (t0 >>> 15), t0 | 1); t0 ^= t0 + Math.imul(t0 ^ (t0 >>> 7), t0 | 61); return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296; }; }
function draw(q, u) { var c = 0; for (var i = 0; i < q.length; i++) { c += q[i]; if (u < c) return i; } for (var j = q.length - 1; j >= 0; j--) if (q[j] > 0) return j; return 0; }
function tvDistance(freq, q) { var s = 0; for (var i = 0; i < q.length; i++) s += Math.abs(freq[i] - q[i]); return s / 2; }
// toy next-word model: tokens the cat dog sat ran on to mat park .
var TOK = ['the', 'cat', 'dog', 'sat', 'ran', 'on', 'to', 'mat', 'park', 'dot'], NEG = -6;
var TRANS = {
  the: { cat: 2.2, dog: 2.0, mat: 1.0, park: 1.0 }, cat: { sat: 2.5, ran: 1.5, dot: 0.5 }, dog: { ran: 2.5, sat: 1.2, dot: 0.5 }, sat: { on: 3.0, dot: 0.5 },
  ran: { to: 3.0, dot: 0.7 }, on: { the: 3.5 }, to: { the: 3.5 }, mat: { dot: 2.0 }, park: { dot: 2.0 }, dot: { the: 3.0 }
};
function nextLogits(w) { return TOK.map(function (x) { return TRANS[w][x] === undefined ? NEG : TRANS[w][x]; }); }
function nextDist(w, T) { return softmaxT(nextLogits(w), T); }
function generate(n, T, seed) {
  var r = rng(seed), seq = ['the'];
  for (var i = 0; i < n; i++) seq.push(TOK[draw(nextDist(seq[seq.length - 1], T), r())]);
  return seq;
}
function repeatRate(seq) {
  var seen = {}, rep = 0, tot = 0;
  for (var i = 0; i + 2 < seq.length; i++) { var k = seq[i] + '|' + seq[i + 1] + '|' + seq[i + 2]; tot++; if (seen[k]) rep++; seen[k] = 1; }
  return tot ? rep / tot : 0;
}
var M = { LOGITS: LOGITS, TOK: TOK, softmaxT: softmaxT, entropyBits: entropyBits, filterDist: filterDist, rng: rng, draw: draw, tvDistance: tvDistance, nextDist: nextDist, generate: generate, repeatRate: repeatRate };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
var st = { ctx: 0, counts: null, n: 0, rand: null, last: -1, notice: false, seq: ['the'], seed: 1, pick: -1 };
function cw(j) { return t('c' + st.ctx + 'w' + j); }
function pct(v) { return (v * 100).toFixed(1) + '%'; }
function bars(c, x, y, w, h, vals, o) {
  o = o || {}; var n = vals.length, bw = w / n, i;
  c.strokeStyle = C.grid; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  for (i = 0; i < n; i++) {
    var off = o.keep && !o.keep[i], gh = o.ghost ? o.ghost[i] * (h - 14) : 0, vh = vals[i] * (h - 14), bx = x + i * bw;
    if (o.ghost) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.setLineDash([3, 3]); c.strokeRect(bx + 4.5, y + h - gh + 0.5, bw - 9, gh); c.setLineDash([]); }
    c.fillStyle = off ? '#33414f' : COL[i]; c.globalAlpha = off ? 0.55 : 0.9; c.fillRect(bx + 5, y + h - vh, bw - 10, Math.max(vh, off ? 0 : 1)); c.globalAlpha = 1;
    txt(c, (vals[i] * 100).toFixed(vals[i] < 0.1 ? 1 : 0), bx + bw / 2, y + h - Math.max(vh, gh) - 3, off ? C.m : C.ink, 10, 'center');
    txt(c, o.label(i), bx + bw / 2, y + h + 12, off ? C.m : COL[i], 10, 'center');
  }
}
function syncCtx() { for (var s = 0; s < 4; s++) { var e = $('s' + s + '-ctx'); if (e) { if (!e.options.length) for (var i = 0; i < 3; i++) { var o = document.createElement('option'); o.value = String(i); e.appendChild(o); } for (var j = 0; j < 3; j++) e.options[j].textContent = t('c' + j + 'p'); e.value = String(st.ctx); } } }
function render0() {
  var z = LOGITS[st.ctx], p = softmaxT(z, 1), cv = $('s0-cv'), c = fit(cv), W = cv._w, o = order(p);
  txt(c, t('s0Prompt', { p: t('c' + st.ctx + 'p') }), 10, 16, C.ink, 13);
  txt(c, t('s0Log'), 10, 40, C.m, 11);
  var mn = -3, mx = 7, bw = (W - 20) / 10, i;
  for (i = 0; i < 10; i++) { var hh = (z[i] - mn) / (mx - mn) * 80; c.fillStyle = COL[i]; c.globalAlpha = 0.5; c.fillRect(10 + i * bw + 5, 130 - hh, bw - 10, hh); c.globalAlpha = 1; txt(c, z[i].toFixed(1), 10 + i * bw + bw / 2, 126 - hh, C.m, 10, 'center'); }
  txt(c, t('s0P'), 10, 156, C.m, 11); bars(c, 10, 166, W - 20, 150, p, { label: cw });
  setHTML('s0-ro', 's0ro', { top: cw(o[0]), p: pct(p[o[0]]), h: entropyBits(p).toFixed(2), n: Math.pow(2, entropyBits(p)).toFixed(1), s: p.reduce(function (a, b) { return a + b; }, 0).toFixed(3) });
}
function render1() {
  var T = +$('s1-T').value / 100; $('s1-T-v').textContent = T.toFixed(2);
  var z = LOGITS[st.ctx], p = softmaxT(z, T), p1 = softmaxT(z, 1), cv = $('s1-cv'), c = fit(cv), W = cv._w, o = order(p);
  txt(c, t('s1Cap', { T: T.toFixed(2) }), 10, 16, C.ink, 13); bars(c, 10, 28, W - 20, 230, p, { label: cw, ghost: p1 });
  wrapTxt(c, t('s1Leg'), 10, 288, W - 20, 14, C.m, 11);
  setHTML('s1-ro', 's1ro', { T: T.toFixed(2), top: cw(o[0]), p: pct(p[o[0]]), h: entropyBits(p).toFixed(2), n: Math.pow(2, entropyBits(p)).toFixed(1) });
}
function render2() {
  var T = +$('s2-T').value / 100, k = +$('s2-k').value, pc = +$('s2-p').value / 100; $('s2-T-v').textContent = T.toFixed(2); $('s2-k-v').textContent = String(k); $('s2-p-v').textContent = pc.toFixed(2);
  var p = softmaxT(LOGITS[st.ctx], T), f = filterDist(p, k, pc), cv = $('s2-cv'), c = fit(cv), W = cv._w, kept = f.keep.filter(Boolean).length, mass = 0;
  p.forEach(function (v, i) { if (f.keep[i]) mass += v; });
  txt(c, t('s2Cap'), 10, 16, C.ink, 13); bars(c, 10, 28, W - 20, 230, f.q, { label: cw, ghost: p, keep: f.keep });
  wrapTxt(c, t('s2Leg'), 10, 288, W - 20, 14, C.m, 11);
  setHTML('s2-ro', 's2ro', { kept: kept, mass: pct(mass), h: entropyBits(f.q).toFixed(2), T: T.toFixed(2), k: k, p: pc.toFixed(2) });
}
function s3dist() { var T = +$('s3-T').value / 100, pc = +$('s3-p').value / 100; return { T: T, pc: pc, f: filterDist(softmaxT(LOGITS[st.ctx], T), 10, pc) }; }
function render3() {
  var d = s3dist(); $('s3-T-v').textContent = d.T.toFixed(2); $('s3-p-v').textContent = d.pc.toFixed(2);
  if (!st.counts) { st.counts = new Array(10).fill(0); st.n = 0; st.rand = rng(2024); st.last = -1; }
  var freq = st.counts.map(function (v) { return st.n ? v / st.n : 0; }), ymax = Math.max(0.05, Math.max.apply(null, freq), Math.max.apply(null, d.f.q)), cv = $('s3-cv'), c = fit(cv), W = cv._w, bw = (W - 20) / 10, by = 28, bh = 230, i;
  txt(c, t('s3Cap', { n: st.n }), 10, 16, C.ink, 13); c.strokeStyle = C.grid; c.strokeRect(10.5, by + 0.5, W - 21, bh);
  for (i = 0; i < 10; i++) {
    var hh = freq[i] / ymax * (bh - 14), th = d.f.q[i] / ymax * (bh - 14), bx = 10 + i * bw;
    c.fillStyle = COL[i]; c.globalAlpha = 0.85; c.fillRect(bx + 5, by + bh - hh, bw - 10, Math.max(hh, 0)); c.globalAlpha = 1;
    c.fillStyle = '#fff'; c.fillRect(bx + 3, by + bh - th - 1, bw - 6, 2);
    if (i === st.last) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(bx + 4, by + 2, bw - 8, bh - 4); }
    txt(c, cw(i), bx + bw / 2, by + bh + 12, COL[i], 10, 'center');
  }
  wrapTxt(c, t('s3Leg', { m: pct(ymax) }), 10, by + bh + 30, W - 20, 14, C.m, 11);
  var tv = st.n ? tvDistance(freq, d.f.q) : null;
  setHTML('s3-ro', 's3ro', { n: st.n, tv: tv === null ? '—' : tv.toFixed(3), last: st.last >= 0 ? cw(st.last) : '—', note: st.notice ? t('s3Notice') : '' });
}
function drawN(n) {
  var d = s3dist();
  for (var i = 0; i < n; i++) { var j = draw(d.f.q, st.rand()); st.counts[j]++; st.n++; st.last = j; }
  st.notice = false; render3();
}
function clearCounts(notice) { var had = st.n > 0; st.counts = null; st.notice = !!(notice && had); render3(); }
function render4() {
  var T = +$('s4-T').value / 100; $('s4-T-v').textContent = T.toFixed(2);
  var last = st.seq[st.seq.length - 1], p = nextDist(last, T), cv = $('s4-cv'), c = fit(cv), W = cv._w;
  txt(c, t('s4Cap', { w: t('w_' + last), T: T.toFixed(2) }), 10, 16, C.ink, 13);
  bars(c, 10, 28, W - 20, 200, p, { label: function (i) { return t('w_' + TOK[i]); }, keep: p.map(function (v) { return v > 1e-4; }) });
  if (st.pick >= 0) { var bw = (W - 20) / 10; c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(10 + st.pick * bw + 3, 30, bw - 6, 196); }
  var chips = $('s4-chips'); chips.innerHTML = '';
  st.seq.forEach(function (w, i) { var s = document.createElement('span'); s.textContent = t('w_' + w); if (i === st.seq.length - 1) s.className = 'last'; chips.appendChild(s); });
  var distinct = {}; st.seq.forEach(function (w) { distinct[w] = 1; });
  setHTML('s4-ro', 's4ro', { len: st.seq.length, d: Object.keys(distinct).length, rep: pct(repeatRate(st.seq)), top: t('w_' + TOK[order(p)[0]]), tp: pct(Math.max.apply(null, p)), seed: st.seed });
}
function s4step(n) {
  var T = +$('s4-T').value / 100;
  for (var i = 0; i < n; i++) { var p = nextDist(st.seq[st.seq.length - 1], T); st.pick = draw(p, st.r4()); st.seq.push(TOK[st.pick]); }
  render4();
}
function s4reset(seed) { st.seq = ['the']; st.pick = -1; st.seed = seed; st.r4 = rng(seed); }
s4reset(1);

/* ---------------- wiring ---------------- */
function renderAll() { syncCtx(); render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function init() {
  initLang();
  [0, 1, 2, 3].forEach(function (s) { $('s' + s + '-ctx').addEventListener('change', function (e) { st.ctx = +e.target.value; clearCounts(true); renderAll(); }); });
  $('s1-T').addEventListener('input', render1);
  ['s2-T', 's2-k', 's2-p'].forEach(function (id) { $(id).addEventListener('input', render2); });
  ['s3-T', 's3-p'].forEach(function (id) { $(id).addEventListener('input', function () { clearCounts(true); }); });
  $('s3-d1').addEventListener('click', function () { drawN(1); }); $('s3-d100').addEventListener('click', function () { drawN(100); }); $('s3-d1000').addEventListener('click', function () { drawN(1000); });
  $('s4-T').addEventListener('input', render4);
  $('s4-next').addEventListener('click', function () { s4step(1); }); $('s4-gen').addEventListener('click', function () { s4step(12); });
  $('s4-seed').addEventListener('click', function () { s4reset(st.seed + 1); render4(); });
  var reset = {
    0: function () { st.ctx = 0; renderAll(); },
    1: function () { $('s1-T').value = 100; render1(); },
    2: function () { $('s2-T').value = 100; $('s2-k').value = 10; $('s2-p').value = 100; render2(); },
    3: function () { $('s3-T').value = 100; $('s3-p').value = 100; st.counts = null; st.notice = false; render3(); },
    4: function () { $('s4-T').value = 100; s4reset(1); render4(); }
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
