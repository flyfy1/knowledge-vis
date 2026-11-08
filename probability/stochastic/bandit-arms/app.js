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
var COL = ['#67d7f9', '#f6a45b', '#74dfaa', '#ff7a93', '#c3a6ff'], LET = ['A', 'B', 'C', 'D', 'E'];
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t0 = a; t0 = Math.imul(t0 ^ (t0 >>> 15), t0 | 1); t0 ^= t0 + Math.imul(t0 ^ (t0 >>> 7), t0 | 61); return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); }
function gammaSample(a, r) {
  if (a < 1) { var u0 = r(); return gammaSample(a + 1, r) * Math.pow(u0, 1 / a); }
  var d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) { var x = gauss(r), v = 1 + c * x; if (v <= 0) continue; v = v * v * v; var u = r(); if (Math.log(1 - u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v; }
}
function betaSample(a, b, r) { var x = gammaSample(a, r), y = gammaSample(b, r); return x / (x + y); }
function lgamma(z) {
  var g = 7, co = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1; var x = co[0]; for (var i = 1; i < g + 2; i++) x += co[i] / (z + i); var t0 = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t0) - t0 + Math.log(x);
}
function betaPdf(x, a, b) { if (x <= 0 || x >= 1) return 0; return Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)); }
function ucbBonus(t, n, c) { return (c === undefined ? 1 : c) * Math.sqrt(2 * Math.log(t) / n); }
function argmaxTie(a) { var m = 0; for (var i = 1; i < a.length; i++) if (a[i] > a[m]) m = i; return m; }
function chooseArm(strategy, param, n, w, t, r) {
  var K = n.length, i, means = [];
  if (strategy !== 'ts' && t <= K) return t - 1;
  if (strategy === 'ts') { var s = []; for (i = 0; i < K; i++) s.push(betaSample(1 + w[i], 1 + n[i] - w[i], r)); return argmaxTie(s); }
  for (i = 0; i < K; i++) means.push(n[i] ? w[i] / n[i] : 0);
  if (strategy === 'greedy') return argmaxTie(means);
  if (strategy === 'eps') { if (r() < param) return Math.floor(r() * K); return argmaxTie(means); }
  var u = []; for (i = 0; i < K; i++) u.push(means[i] + ucbBonus(t, n[i], param)); return argmaxTie(u);
}
function runBandit(strategy, param, probs, T, seed) {
  var r = rng(seed), K = probs.length, n = new Array(K).fill(0), w = new Array(K).fill(0), pbest = Math.max.apply(null, probs), cum = 0, arms = [], rew = [], reg = [];
  for (var t = 1; t <= T; t++) {
    var a = chooseArm(strategy, param, n, w, t, r), x = r() < probs[a] ? 1 : 0;
    n[a]++; w[a] += x; cum += pbest - probs[a]; arms.push(a); rew.push(x); reg.push(cum);
  }
  return { arms: arms, rew: rew, reg: reg, n: n, w: w };
}
function stateAt(run, t, K) { var n = new Array(K).fill(0), w = new Array(K).fill(0); for (var i = 0; i < t; i++) { n[run.arms[i]]++; w[run.arms[i]] += run.rew[i]; } return { n: n, w: w }; }
var avgCache = {};
function avgRegret(strategy, param, probs, T, runs) {
  var key = [strategy, param, probs.join(','), T, runs].join('|'); if (avgCache[key]) return avgCache[key];
  var out = new Array(T).fill(0);
  for (var k = 0; k < runs; k++) { var rr = runBandit(strategy, param, probs, T, 9000 + k).reg; for (var i = 0; i < T; i++) out[i] += rr[i] / runs; }
  avgCache[key] = out; return out;
}
var PROBS = [0.25, 0.4, 0.5, 0.62, 0.45];
function gameProbs(seed) { var r = rng(seed), p = []; for (var i = 0; i < 5; i++) p.push(Math.round((0.2 + 0.6 * r()) * 100) / 100); return p; }
var M = { PROBS: PROBS, rng: rng, betaSample: betaSample, betaPdf: betaPdf, lgamma: lgamma, ucbBonus: ucbBonus, runBandit: runBandit, stateAt: stateAt, avgRegret: avgRegret, gameProbs: gameProbs };
if (typeof module !== 'undefined' && module.exports) module.exports = M;
if (typeof document === 'undefined') return;

/* ---------------- drawing ---------------- */
function f2(v) { return (+v).toFixed(2); } function f1(v) { return (+v).toFixed(1); }
function armName(i) { return t('arm', { a: LET[i] }); }
var game = { seed: 1, probs: null, n: [0, 0, 0, 0, 0], w: [0, 0, 0, 0, 0], hist: [], r: null, reveal: false };
function newGame(seed) { game.seed = seed; game.probs = gameProbs(seed); game.n = [0, 0, 0, 0, 0]; game.w = [0, 0, 0, 0, 0]; game.hist = [0]; game.r = rng(seed + 1000); game.reveal = false; }
newGame(1);
function pull(i) { var x = game.r() < game.probs[i] ? 1 : 0; game.n[i]++; game.w[i] += x; game.hist.push(game.hist[game.hist.length - 1] + x); render0(); }
function estBars(c, x, y, w, h, n, wv, probs, extra) {
  var K = n.length, bw = w / K, i; c.strokeStyle = C.grid; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  [0.25, 0.5, 0.75].forEach(function (v) { line(c, [[x, y + h - v * h], [x + w, y + h - v * h]], C.grid, 1, [3, 4]); });
  for (i = 0; i < K; i++) {
    var m = n[i] ? wv[i] / n[i] : 0, bx = x + i * bw, hh = m * h; c.fillStyle = COL[i]; c.globalAlpha = 0.85; c.fillRect(bx + 8, y + h - hh, bw - 16, hh); c.globalAlpha = 1;
    if (n[i] > 0) { var se = Math.sqrt(Math.max(m * (1 - m), 0.02) / n[i]) * 1.96, lo = Math.max(0, m - se), hi = Math.min(1, m + se); line(c, [[bx + bw / 2, y + h - hi * h], [bx + bw / 2, y + h - lo * h]], '#fff', 2); }
    if (extra && extra.bonus) { var ub = Math.min(1, m + extra.bonus[i]); line(c, [[bx + 6, y + h - ub * h], [bx + bw - 6, y + h - ub * h]], '#fff', 2.4); }
    if (probs) { line(c, [[bx + 3, y + h - probs[i] * h], [bx + bw - 3, y + h - probs[i] * h]], '#ff7a93', 2.4); }
    if (extra && extra.pick === i) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(bx + 4, y + 2, bw - 8, h - 4); }
    txt(c, armName(i), bx + bw / 2, y + h + 14, COL[i], 11, 'center'); txt(c, 'n=' + n[i], bx + bw / 2, y + h + 27, C.m, 10, 'center'); txt(c, n[i] ? f2(m) : '—', bx + bw / 2, y + h - hh - 4 < y + 10 ? y + 12 : y + h - hh - 4, C.ink, 10, 'center');
  }
}
function render0() {
  var cv = $('s0-cv'), c = fit(cv), W = cv._w, tot = game.n.reduce(function (a, b) { return a + b; }, 0), wins = game.w.reduce(function (a, b) { return a + b; }, 0);
  txt(c, t('s0Est'), 10, 14, C.ink, 12); estBars(c, 10, 22, W - 20, 150, game.n, game.w, game.reveal ? game.probs : null);
  var gy = 228, gh = 100, nmax = Math.max(30, tot);
  txt(c, t('s0Cum'), 10, gy - 8, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(10.5, gy + 0.5, W - 21, gh);
  var ymax = Math.max(10, Math.max.apply(null, game.hist) + 2);
  if (game.reveal) { var pb = Math.max.apply(null, game.probs); ymax = Math.max(ymax, pb * nmax + 2); line(c, [[10, gy + gh], [10 + (W - 20), gy + gh - pb * nmax / ymax * gh]], C.g, 1.6, [5, 4]); }
  line(c, game.hist.map(function (v, i) { return [10 + (W - 20) * i / nmax, gy + gh - v / ymax * gh]; }), C.o, 2.4);
  txt(c, t('s0Ax', { n: nmax }), W - 10, gy + gh + 14, C.m, 10, 'right'); if (game.reveal) txt(c, t('s0Ideal'), 16, gy + 14, C.g, 10);
  var bestSeen = -1, bm = -1; game.n.forEach(function (n, i) { if (n && game.w[i] / n > bm) { bm = game.w[i] / n; bestSeen = i; } });
  var reg = null; if (game.reveal) { var pbb = Math.max.apply(null, game.probs); reg = 0; game.n.forEach(function (n, i) { reg += n * (pbb - game.probs[i]); }); }
  setHTML('s0-ro', 's0ro', { tot: tot, wins: wins, rate: tot ? f2(wins / tot) : '—', seen: bestSeen >= 0 ? armName(bestSeen) : '—', reg: reg === null ? t('s0Hidden') : f2(reg), rv: game.reveal ? t('s0Truth', { v: game.probs.map(function (p, i) { return LET[i] + ' ' + f2(p); }).join(' · ') }) : '' });
  $('s0-reveal').textContent = t(game.reveal ? 's0Hide' : 's0Reveal'); $('s0-reveal').setAttribute('aria-pressed', game.reveal ? 'true' : 'false');
  for (var i = 0; i < 5; i++) { var b = $('s0-pull' + i); b.textContent = t('pull', { a: LET[i] }); b.style.borderColor = COL[i]; }
}
function render1() {
  var eps = +$('s1-e').value / 100; $('s1-e-v').textContent = f2(eps);
  var T = 500, runs = 80, cv = $('s1-cv'), c = fit(cv), W = cv._w, gx = 40, gy = 24, gw = W - gx - 12, gh = 230;
  var cs = [{ s: 'greedy', p: 0, col: C.m, dash: [5, 4], lab: 's1G' }, { s: 'eps', p: 0.1, col: C.a, dash: [5, 4], lab: 's1E10' }, { s: 'eps', p: eps, col: C.o, dash: null, lab: 's1Cur' }];
  var curves = cs.map(function (q) { return avgRegret(q.s, q.p, PROBS, T, runs); }), ymax = Math.max(20, Math.max.apply(null, curves.map(function (a) { return a[T - 1]; })) * 1.05);
  txt(c, t('s1Cap'), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  [0.25, 0.5, 0.75, 1].forEach(function (v) { line(c, [[gx, gy + gh - v * gh], [gx + gw, gy + gh - v * gh]], C.grid, 1, [3, 4]); txt(c, Math.round(ymax * v) + '', gx - 4, gy + gh - v * gh + 4, C.m, 10, 'right'); });
  cs.forEach(function (q, k) { line(c, curves[k].map(function (v, i) { return [gx + gw * i / (T - 1), gy + gh - v / ymax * gh]; }), q.col, q.dash ? 1.8 : 2.8, q.dash); });
  txt(c, t('s1Ax', { T: T }), gx + gw, gy + gh + 14, C.m, 10, 'right'); var ly = gy + 14; cs.forEach(function (q) { txt(c, t(q.lab, { e: f2(eps) }), gx + 6, ly, q.col, 11); ly += 14; });
  setHTML('s1-ro', 's1ro', { e: f2(eps), g: f1(curves[0][T - 1]), t10: f1(curves[1][T - 1]), cur: f1(curves[2][T - 1]), T: T, runs: runs, pb: f2(Math.max.apply(null, PROBS)) });
}
var pl = { on: false, raf: 0, acc: 0, last: 0, key: '' };
function runFor(strategy, param) { var k = 'run|' + strategy + '|' + param; if (!runFor.c) runFor.c = {}; if (!runFor.c[k]) runFor.c[k] = runBandit(strategy, param, PROBS, 300, 5); return runFor.c[k]; }
function render2() {
  var tt = +$('s2-t').value, cc = +$('s2-c').value / 100; $('s2-t-v').textContent = tt + ' / 300'; $('s2-c-v').textContent = f2(cc);
  var run = runFor('ucb', cc), st = stateAt(run, tt, 5), cv = $('s2-cv'), c = fit(cv), W = cv._w;
  var bonus = st.n.map(function (n) { return n ? ucbBonus(tt, n, cc) : 1; }), pick = tt < 300 ? run.arms[tt] : -1;
  txt(c, t('s2Cap', { t: tt }), 10, 14, C.ink, 12); estBars(c, 10, 22, W - 20, 170, st.n, st.w, PROBS, { bonus: bonus, pick: pick });
  wrapTxt(c, t('s2Leg'), 10, 232, W - 20, 14, C.m, 11);
  var ub = st.n.map(function (n, i) { return (n ? st.w[i] / n : 0) + bonus[i]; });
  setHTML('s2-ro', 's2ro', { c: f2(cc), t: tt, next: pick >= 0 ? armName(pick) : '—', ub: f2(Math.max.apply(null, ub)), n: st.n.join(' / '), reg: f1(run.reg[tt - 1]) });
  $('s2-play').textContent = t(pl.on ? 's2pause' : 's2play');
}
function stopPlay() { pl.on = false; cancelAnimationFrame(pl.raf); }
function tickPlay(ts) {
  if (!pl.on) return; pl.acc += Math.min(0.1, (ts - pl.last) / 1000); pl.last = ts;
  var per = reduced() ? 0.5 : 0.04; if (pl.acc >= per) { var steps = Math.floor(pl.acc / per); pl.acc -= steps * per; var v = Math.min(300, +$(pl.key).value + (reduced() ? 10 : steps)); $(pl.key).value = v; if (v >= 300) stopPlay(); (pl.key === 's2-t' ? render2 : render3)(); }
  if (pl.on) pl.raf = requestAnimationFrame(tickPlay);
}
function togglePlay(key) {
  if (pl.on && pl.key === key) { stopPlay(); render2(); render3(); return; }
  stopPlay(); if (+$(key).value >= 300) $(key).value = 1; pl.on = true; pl.key = key; pl.acc = 0; pl.last = performance.now(); pl.raf = requestAnimationFrame(tickPlay); render2(); render3();
}
function render3() {
  var tt = +$('s3-t').value; $('s3-t-v').textContent = tt + ' / 300';
  var run = runFor('ts', 0), st = stateAt(run, tt, 5), cv = $('s3-cv'), c = fit(cv), W = cv._w, gx = 14, gy = 24, gw = W - 28, gh = 230, i, k;
  txt(c, t('s3Cap', { t: tt }), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  var dens = [], mx = 1;
  for (i = 0; i < 5; i++) { var a = 1 + st.w[i], b = 1 + st.n[i] - st.w[i], d = []; for (k = 1; k < 200; k++) { var v = betaPdf(k / 200, a, b); d.push(v); if (v > mx) mx = v; } dens.push(d); }
  for (i = 0; i < 5; i++) {
    var pts = dens[i].map(function (v, kk) { return [gx + gw * (kk + 1) / 200, gy + gh - 4 - v / mx * (gh - 20)]; }); line(c, pts, COL[i], 2.2);
    line(c, [[gx + gw * PROBS[i], gy + gh], [gx + gw * PROBS[i], gy + gh - 12]], COL[i], 3);
  }
  [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(c, f2(v), gx + gw * v, gy + gh + 14, C.m, 10, v === 0 ? 'left' : (v === 1 ? 'right' : 'center')); });
  txt(c, t('s3Ax'), gx + gw, gy + gh + 28, C.m, 10, 'right'); wrapTxt(c, t('s3Leg'), 10, gy + gh + 44, W - 20, 14, C.m, 11);
  var arms = ''; for (i = 0; i < 5; i++) arms += LET[i] + ' ' + (1 + st.w[i]) + '/' + (1 + st.n[i] - st.w[i]) + (i < 4 ? ' · ' : '');
  setHTML('s3-ro', 's3ro', { t: tt, ab: arms, n: st.n.join(' / '), reg: f1(run.reg[tt - 1]) });
  $('s3-play').textContent = t(pl.on && pl.key === 's3-t' ? 's2pause' : 's2play');
}
var pend4 = 0;
function render4() {
  var gap = +$('s4-g').value / 100, T = +$('s4-h').value; $('s4-g-v').textContent = f2(gap); $('s4-h-v').textContent = String(T);
  var probs = [0.5 + gap, 0.5, 0.5, 0.5, 0.5], runs = 60, cv = $('s4-cv'), c = fit(cv), W = cv._w, gx = 40, gy = 24, gw = W - gx - 12, gh = 230;
  var cs = [{ s: 'greedy', p: 0, col: C.m, lab: 's4G' }, { s: 'eps', p: 0.1, col: C.a, lab: 's4E' }, { s: 'ucb', p: 1, col: C.g, lab: 's4U' }, { s: 'ucb', p: 0.3, col: '#c3a6ff', lab: 's4U3' }, { s: 'ts', p: 0, col: C.o, lab: 's4T' }];
  var curves = cs.map(function (q) { return avgRegret(q.s, q.p, probs, T, runs); }), ymax = Math.max(5, Math.max.apply(null, curves.map(function (a) { return a[T - 1]; })) * 1.05);
  txt(c, t('s4Cap', { g: f2(gap) }), 10, 14, C.ink, 12); c.strokeStyle = C.grid; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
  [0.25, 0.5, 0.75, 1].forEach(function (v) { line(c, [[gx, gy + gh - v * gh], [gx + gw, gy + gh - v * gh]], C.grid, 1, [3, 4]); txt(c, Math.round(ymax * v) + '', gx - 4, gy + gh - v * gh + 4, C.m, 10, 'right'); });
  cs.forEach(function (q, k) { line(c, curves[k].map(function (v, i) { return [gx + gw * i / (T - 1), gy + gh - v / ymax * gh]; }), q.col, 2.4); });
  txt(c, t('s4Ax', { T: T }), gx + gw, gy + gh + 14, C.m, 10, 'right'); var ly = gy + 14; cs.forEach(function (q) { txt(c, t(q.lab), gx + 6, ly, q.col, 11); ly += 14; });
  setHTML('s4-ro', 's4ro', { g: f2(gap), T: T, runs: runs, a: f1(curves[0][T - 1]), b: f1(curves[1][T - 1]), u: f1(curves[2][T - 1]), u3: f1(curves[3][T - 1]), th: f1(curves[4][T - 1]) });
}

/* ---------------- wiring ---------------- */
function renderAll() { render0(); render1(); render2(); render3(); render4(); }
var pend = 0;
function sched() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; renderAll(); }); }
function debounced(fn) { var h = 0; return function () { clearTimeout(h); h = setTimeout(fn, 60); }; }
function init() {
  initLang();
  var box = $('s0-arms'); for (var i = 0; i < 5; i++) (function (i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn primary'; b.id = 's0-pull' + i; b.dataset.step = '0'; b.addEventListener('click', function () { pull(i); }); box.appendChild(b); })(i);
  $('s0-reveal').addEventListener('click', function () { game.reveal = !game.reveal; render0(); });
  $('s0-new').addEventListener('click', function () { newGame(game.seed + 1); render0(); });
  $('s1-e').addEventListener('input', debounced(render1));
  $('s2-t').addEventListener('input', function () { stopPlay(); render2(); render3(); }); $('s2-c').addEventListener('input', function () { render2(); }); $('s2-play').addEventListener('click', function () { togglePlay('s2-t'); });
  $('s3-t').addEventListener('input', function () { stopPlay(); render2(); render3(); }); $('s3-play').addEventListener('click', function () { togglePlay('s3-t'); });
  var d4 = debounced(render4); $('s4-g').addEventListener('input', d4); $('s4-h').addEventListener('input', d4);
  var reset = {
    0: function () { newGame(1); render0(); }, 1: function () { $('s1-e').value = 30; render1(); },
    2: function () { stopPlay(); $('s2-t').value = 30; $('s2-c').value = 100; render2(); render3(); }, 3: function () { stopPlay(); $('s3-t').value = 30; render2(); render3(); },
    4: function () { $('s4-g').value = 12; $('s4-h').value = 400; render4(); }
  };
  Object.keys(reset).forEach(function (k) { $('s' + k + '-reset').addEventListener('click', reset[k]); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  window.addEventListener('langchange', renderAll);
  window.addEventListener('resize', sched);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopPlay(); render2(); render3(); } });
  var links = [].slice.call(document.querySelectorAll('.step-nav a')), steps = [].slice.call(document.querySelectorAll('.step'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); if (!e.isIntersecting && (e.target.id === 'step2' || e.target.id === 'step3') && pl.on) { stopPlay(); render2(); render3(); } }); }, { rootMargin: '-30% 0px -60%' });
    steps.forEach(function (s) { io.observe(s); });
  }
  renderAll();
}
init();
})();
