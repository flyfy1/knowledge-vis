/* Noise into pictures: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.NoiseModels;
const W8 = window.NOISE_WEIGHTS || {};
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#4a5266' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = M.SPIRAL;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const data = key => (COPY[lang] && COPY[lang][key]) || (COPY.zh && COPY.zh[key]) || [];
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const pow10 = e => '10' + String(e).split('').map(c => SUP[c]).join('');
const pct = (x, d = 0) => fmt(x * 100, d) + '%';
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === effLang())));
  renderFrontier();
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas, sim registry, background work ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '80px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

// world→pixel view with equal scale on both axes, centred
function view(w, h, x0, x1, y0, y1, pad = 10) {
  const sc = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
  const ox = (w - sc * (x1 - x0)) / 2, oy = (h - sc * (y1 - y0)) / 2;
  return { X: x => ox + sc * (x - x0), Y: y => h - oy - sc * (y - y0), sc, inv: (px, py) => [x0 + (px - ox) / sc, y0 + (h - oy - py) / sc] };
}
function frame(w, h, m, x0, x1, y0, y1, logx, logy) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  const fx = logx ? (x => (Math.log10(x) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0))) : (x => (x - x0) / (x1 - x0));
  const fy = logy ? (y => (Math.log10(Math.max(y, y0)) - Math.log10(y0)) / (Math.log10(y1) - Math.log10(y0))) : (y => (y - y0) / (y1 - y0));
  return { L, R, T, B, X: x => L + (R - L) * fx(x), Y: y => B - (B - T) * fy(y) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv) { c.fillStyle = C.mute; c.textAlign = 'center'; vals.forEach(v => { const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); }); }
function yTicks(c, f, vals, fmtv, right) { c.fillStyle = C.mute; c.textAlign = right ? 'left' : 'right'; vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), right ? f.R + 6 : f.L - 6, y); if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); } }); }
// log axis for the sliced-Wasserstein distance (0.01 … 4), so 1-step values (≈ 2.7) are drawn, not clipped
const YT_SW = [0.01, 0.03, 0.1, 0.3, 1, 3], fmtSW = v => fmt(v, v < 0.1 ? 2 : v < 1 ? 1 : 0);
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2) { if (pts.length < 2) { if (pts.length === 1) dot(c, X(pts[0][0]), Y(pts[0][1]), 3, col); return; } c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); pts.forEach(p => dot(c, X(p[0]), Y(p[1]), 2.2, col)); }
function dot(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function points(c, xs, v, col, r = 1.6, alpha = 0.85) { c.globalAlpha = alpha; c.fillStyle = col; for (let i = 0; i < xs.length; i += 2) { const x = v.X(xs[i]), y = v.Y(xs[i + 1]); c.fillRect(x - r, y - r, 2 * r, 2 * r); } c.globalAlpha = 1; }
function arrow(c, x0, y0, x1, y1, col, lw = 1.4) { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < 0.5) return; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); const ux = dx / L, uy = dy / L, hs = Math.min(6, L * 0.45); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - hs * ux + hs * 0.5 * uy, y1 - hs * uy - hs * 0.5 * ux); c.lineTo(x1 - hs * ux - hs * 0.5 * uy, y1 - hs * uy + hs * 0.5 * ux); c.closePath(); c.fill(); }
// faint density image of a mixture, cached per size
const densCache = new Map();
function density(c, m, v, w, h, col = [99, 199, 230], a = 0.22, extraVar = 0) {
  const key = m.K + ':' + m.mu[0] + ':' + Math.round(w) + 'x' + Math.round(h) + ':' + extraVar + ':' + col.join(',');
  let img = densCache.get(key);
  if (!img) {
    const step = 3, gw = Math.ceil(w / step), gh = Math.ceil(h / step), vals = new Float64Array(gw * gh); let mx = 0;
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const p = v.inv(i * step + 1.5, j * step + 1.5), d = Math.exp(M.logpMix(m, p[0], p[1], 1, extraVar)); vals[j * gw + i] = d; if (d > mx) mx = d; }
    const off = document.createElement('canvas'); off.width = gw; off.height = gh; const oc = off.getContext('2d'), id = oc.createImageData(gw, gh);
    for (let k = 0; k < gw * gh; k++) { const q = Math.pow(vals[k] / mx, 0.5); id.data[4 * k] = col[0]; id.data[4 * k + 1] = col[1]; id.data[4 * k + 2] = col[2]; id.data[4 * k + 3] = Math.round(255 * a * q); }
    oc.putImageData(id, 0, 0); img = { off, gw, gh, step }; densCache.set(key, img);
  }
  c.imageSmoothingEnabled = true; c.drawImage(img.off, 0, 0, img.gw * img.step, img.gh * img.step);
}
/* background job queue: long sampler runs are spread across frames, ~10 ms per frame */
const jobs = [];
function enqueue(job) { jobs.push(job); return job; }
function workJobs(budget) {
  const t0 = performance.now();
  while (jobs.length && performance.now() - t0 < budget) {
    const j = jobs[0];
    if (j.cancelled) { jobs.shift(); continue; }
    j.step();
    if (j.done) { jobs.shift(); if (j.finish) j.finish(); }
  }
}
// wrap a resumable sampler (samplerJob / fm.job) so it advances a few network calls at a time
function wrapSampler(sj, chunk, finish) { return { step() { sj.run(chunk); }, get done() { return sj.done; }, finish: () => finish(sj) }; }

/* ───────── networks ───────── */
const nets = {};
for (const k of Object.keys(W8)) nets[k] = M.loadNet(W8[k]);
const epsNet = nets.eps ? M.netFn(nets.eps, 'eps') : M.vp.epsFn(S);
const fmNet = nets.fm ? M.netFn(nets.fm, 'fm') : M.fm.velFn(S);
const reNet = nets.reflow ? M.netFn(nets.reflow, 'fm') : M.fm.velFn(S);
const exactEps = M.vp.epsFn(S);
const FLOOR = M.swFloor(S);

/* ───────── hero: points flowing from noise onto the spiral (decoration) ───────── */
(() => {
  const cv = $('#heroCv'), N = 260, STEPS = 60;
  const job = M.sample(M.vp.epsFn(S), N, STEPS, 0, 31, { trace: N });
  let ph = reduce ? 1 : 0, hold = 0;
  reg(cv, {
    step(dt) { if (reduce) return; if (ph >= 1) { hold += dt; if (hold > 2.5) { ph = 0; hold = 0; } } else ph = Math.min(1, ph + dt / 5); this.dirty = true; },
    draw() {
      const { c, w, h } = fit(cv), v = view(w, h, -2.2, 2.2, -1.9, 1.9, 0), e = ph * ph * (3 - 2 * ph), k = Math.min(STEPS, Math.floor(e * STEPS)), f = e * STEPS - k;
      const A = job.trace[k], B = job.trace[Math.min(STEPS, k + 1)];
      c.fillStyle = C.cyan; c.globalAlpha = 0.6;
      for (let i = 0; i < N; i++) { const x = A[2 * i] + (B[2 * i] - A[2 * i]) * f, y = A[2 * i + 1] + (B[2 * i + 1] - A[2 * i + 1]) * f; c.beginPath(); c.arc(v.X(x * 0.95 + 0.9), v.Y(y * 0.95), 1.8, 0, 6.283); c.fill(); }
      c.globalAlpha = 1;
    }
  });
})();

/* ───────── 01 rejection sampling ───────── */
const DIMS = [1, 2, 3, 8, 64, 784, 3072, 12288, 196608, 786432];
(() => {
  const cv = $('#rjCv'), sD = $('#rjD'), RATE = 250; // proposals per second
  let seed = 1, job = M.rejection.job(S, seed), acc = 0;
  const exact2 = M.rejection.acceptance2d(S);
  if (reduce) job.run(1500);
  const sim = reg(cv, {
    step(dt) { if (reduce) return; acc += dt * RATE; const k = Math.floor(acc); if (k > 0) { acc -= k; job.run(k); this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), v = view(w, h, -2, 2, -2, 2, 12);
      density(c, S, v, w, h);
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(v.X(-2), v.Y(2), v.X(2) - v.X(-2), v.Y(-2) - v.Y(2));
      const p = job.pts;
      for (let i = 0; i < p.length; i += 3) { c.fillStyle = p[i + 2] ? C.cyan : C.dim; const x = v.X(p[i]), y = v.Y(p[i + 1]), r = p[i + 2] ? 2 : 1.4; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    }
  });
  function text() {
    const d = DIMS[+sD.value], l10 = M.rejection.log10AcceptanceBlob(d);
    put('#rjDo', t('ch1.unit.dim', { d: fmt(d) }));
    put('#rjMeas', job.tried ? pct(job.kept / job.tried, 1) : '—');
    put('#rjExact', pct(exact2, 1));
    put('#rjHigh', l10 > -2 ? pct(Math.pow(10, l10), 1) : t('ch1.unit.approx', { p: pow10(Math.round(l10)) }));
    put('#rjTries', l10 > -6 ? fmt(Math.pow(10, -l10), l10 > -1 ? 1 : 0) : t('ch1.unit.approx', { p: pow10(Math.round(-l10)) }));
    const v = { d: fmt(d), tried: fmt(job.tried), kept: fmt(job.kept), meas: job.tried ? pct(job.kept / job.tried, 1) : '—', ex: pct(exact2, 1), tries: l10 > -6 ? fmt(Math.pow(10, -l10), 0) : pow10(Math.round(-l10)) };
    const key = d <= 2 ? 'ch1.say.low' : l10 > -6 ? 'ch1.say.mid' : 'ch1.say.high';
    putHTML('#rjSay', t(key, v));
  }
  sim.text = text;
  sD.addEventListener('input', text);
  on('#rjAgain', 'click', () => { seed++; job = M.rejection.job(S, seed); acc = 0; if (reduce) job.run(1500); sim.dirty = true; text(); });
  text();
})();

/* ───────── 02 forward process ───────── */
(() => {
  const cv = $('#fwCv'), cv2 = $('#fwCv2'), sT = $('#fwT'), N = 1000;
  const x0 = M.sampleMix(S, N, M.rng(21)), eps = new Float64Array(2 * N); { const r = M.rng(22); for (let i = 0; i < eps.length; i++) eps[i] = r.n(); }
  const G = M.mixture([0, 0], null, 1), GREF = M.swTruth(G, eps); // the pure-noise points themselves: the t → ∞ limit
  const var0 = M.totalVar(x0) / 2;
  let seq = null; // step-by-step replay state
  const pts = new Float64Array(2 * N);
  function closed(tt) { const a = Math.sqrt(M.alphabar[tt]), b = Math.sqrt(1 - M.alphabar[tt]); for (let i = 0; i < pts.length; i++) pts[i] = a * x0[i] + b * eps[i]; return pts; }
  function cur() { return seq ? seq.x : closed(+sT.value); }
  const sim = reg([cv, cv2], {
    step(dt) {
      if (!seq || seq.t >= M.T) return;
      const target = Math.min(M.T, seq.t + Math.max(1, Math.round(dt * 220)));
      while (seq.t < target) { seq.t++; M.vp.noiseStep(seq.x, seq.t, seq.r); }
      sT.value = String(Math.round(seq.t / 10) * 10); this.dirty = true; text();
    },
    draw() {
      { const { c, w, h } = fit(cv), v = view(w, h, -3.2, 3.2, -3.2, 3.2, 8); points(c, cur(), v, C.cyan, 1.4, 0.75); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [26, 16, 38, 40], 0, M.T, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        xTicks(c, f, [0, 250, 500, 750, 1000], v => fmt(v));
        const a = [], b = []; for (let k = 0; k <= M.T; k += 5) { a.push([k, Math.sqrt(M.alphabar[k])]); b.push([k, Math.sqrt(1 - M.alphabar[k])]); }
        const line = (pp, col) => { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); pp.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](f.X(p[0]), f.Y(p[1]))); c.stroke(); };
        line(a, C.gold); line(b, C.violet);
        const tt = seq ? seq.t : +sT.value; c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(tt), f.T); c.lineTo(f.X(tt), f.B); c.stroke();
        dot(c, f.X(tt), f.Y(Math.sqrt(M.alphabar[tt])), 4, C.gold); dot(c, f.X(tt), f.Y(Math.sqrt(1 - M.alphabar[tt])), 4, C.violet); }
    }
  });
  function text() {
    const tt = seq ? seq.t : +sT.value, ab = M.alphabar[tt], p = cur();
    put('#fwTo', fmt(tt));
    put('#fwSig', fmt(Math.sqrt(ab), 3)); put('#fwNoise', fmt(Math.sqrt(1 - ab), 3));
    const meas = M.totalVar(p) / 2, form = ab * var0 + 1 - ab;
    put('#fwVar', t('ch2.unit.var', { m: fmt(meas, 2), f: fmt(form, 2) }));
    const d = M.swTruth(G, p); put('#fwDist', t('ch2.unit.dist', { d: fmt(d, 3), f: fmt(GREF, 3) }));
    const v = { t: fmt(tt), sig: fmt(Math.sqrt(ab), 2), noise: fmt(Math.sqrt(1 - ab), 2), pct: pct(ab, ab < 0.01 ? 2 : 0), d: fmt(d, 3), f: fmt(GREF, 3), m: fmt(meas, 2), fm: fmt(form, 2) };
    let key = seq ? (seq.t >= M.T ? 'ch2.say.seqdone' : 'ch2.say.seq') : tt === 0 ? 'ch2.say.zero' : d <= 1.1 * GREF ? 'ch2.say.gauss' : ab > 0.5 ? 'ch2.say.early' : 'ch2.say.mid';
    putHTML('#fwSay', t(key, v));
  }
  sim.text = text;
  sT.addEventListener('input', () => { seq = null; sim.dirty = true; text(); });
  on('#fwPlay', 'click', () => {
    seq = { t: 0, x: Float64Array.from(x0), r: M.rng(23) };
    if (reduce) { while (seq.t < M.T) { seq.t++; M.vp.noiseStep(seq.x, seq.t, seq.r); } sT.value = String(M.T); }
    sim.dirty = true; text();
  });
  text();
})();

/* ───────── 03 score and Langevin ───────── */
(() => {
  const cv = $('#lgCv'), N = 600, RATE = 110; // Langevin steps per second
  let job = null, acc = 0, seed = 77;
  const fresh = () => { job = M.langevinJob(M.SE, N, radioVal('lgMode') === 'anneal', seed); acc = 0; if (reduce) job.run(); };
  fresh();
  const R = new Float64Array(2);
  const sim = reg(cv, {
    step(dt) { if (job.done || reduce) return; acc += dt * RATE; const k = Math.floor(acc); if (k > 0) { acc -= k; job.run(k); this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), v = view(w, h, -10, 10, -10, 10, 8), sig = job.sigma;
      // arrow field of the score at the current noise level
      const G = 15, cell = 20 / G;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const x = -10 + (i + 0.5) * cell, y = -10 + (j + 0.5) * cell, s = M.scoreSigma(M.SE, x, y, sig, R), L = Math.hypot(s[0], s[1]);
        if (L < 1e-9) continue; const len = Math.min(1, 0.25 + 0.25 * Math.log1p(L)) * cell * 0.85;
        arrow(c, v.X(x), v.Y(y), v.X(x + s[0] / L * len), v.Y(y + s[1] / L * len), 'rgba(233,185,73,.55)', 1.2);
      }
      for (const [mx, my] of [[-5, -5], [5, 5]]) { c.strokeStyle = C.mute; c.lineWidth = 1.2; c.beginPath(); c.arc(v.X(mx), v.Y(my), 2 * v.sc, 0, 6.283); c.stroke(); }
      points(c, job.xs, v, C.cyan, 1.7, 0.9);
    }
  });
  function text() {
    const share = M.shareBelow(job.xs), annealed = radioVal('lgMode') === 'anneal';
    put('#lgSig', annealed ? fmt(job.sigma, job.sigma < 2 ? 2 : 1) : t('ch3.unit.none'));
    put('#lgStep', t('ch3.unit.step', { k: fmt(job.step), n: fmt(job.total) }));
    put('#lgShare', pct(share)); put('#lgTrue', pct(0.2));
    const key = !job.done ? 'ch3.say.running' : annealed ? (Math.abs(share - 0.2) < 0.06 ? 'ch3.say.anneal' : 'ch3.say.annealoff') : 'ch3.say.plain';
    putHTML('#lgSay', t(key, { share: pct(share), sig: fmt(job.sigma, 1) }));
  }
  sim.text = text;
  radios('lgMode').forEach(r => r.addEventListener('change', () => { fresh(); sim.dirty = true; text(); }));
  on('#lgAgain', 'click', () => { seed++; fresh(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 04a posterior mean and Tweedie ───────── */
(() => {
  const cv = $('#twCv'), sT = $('#twT'), R = new Float64Array(S.K);
  let x = [0.35, 0.55], seed = 41;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), v = view(w, h, -2, 2, -2, 2, 10), tt = +sT.value, ab = M.alphabar[tt];
      density(c, S, v, w, h, [99, 199, 230], 0.18);
      const a = Math.sqrt(ab); M.vp.score(S, x[0], x[1], ab, R);
      c.strokeStyle = C.gold; c.lineWidth = 1.5;
      for (let k = 0; k < S.K; k++) { if (R[k] < 0.004) continue; c.globalAlpha = 0.35 + 0.65 * Math.min(1, R[k] * 3); c.beginPath(); c.arc(v.X(S.mu[2 * k]), v.Y(S.mu[2 * k + 1]), 3 + 22 * Math.sqrt(R[k]), 0, 6.283); c.stroke(); }
      c.globalAlpha = 1;
      const s = M.vp.score(S, x[0], x[1], ab), tip = [x[0] + (1 - ab) * s[0], x[1] + (1 - ab) * s[1]], m = M.vp.posteriorMean(S, x[0], x[1], ab);
      arrow(c, v.X(x[0]), v.Y(x[1]), v.X(tip[0]), v.Y(tip[1]), C.cyan, 2);
      c.strokeStyle = 'rgba(163,170,184,.6)'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(v.X(tip[0]), v.Y(tip[1])); c.lineTo(v.X(m[0]), v.Y(m[1])); c.stroke(); c.setLineDash([]);
      dot(c, v.X(x[0]), v.Y(x[1]), 5, C.red); dot(c, v.X(m[0]), v.Y(m[1]), 5.5, C.gold);
      this.v = v; void a;
    }
  });
  function text() {
    const tt = +sT.value, ab = M.alphabar[tt];
    const m = M.vp.posteriorMean(S, x[0], x[1], ab, R), tw = M.vp.tweedie(S, x[0], x[1], ab);
    let top = 0, s2 = 0; for (let k = 0; k < S.K; k++) { if (R[k] > top) top = R[k]; s2 += R[k] * R[k]; }
    const eff = 1 / s2;
    // posterior spread: sqrt(E‖x₀ − E[x₀|x]‖²)
    const vv = ab * S.s * S.s + 1 - ab, g = Math.sqrt(ab) * S.s * S.s / vv, pv = S.s * S.s * (1 - ab * S.s * S.s / vv);
    let e2 = 0; for (let k = 0; k < S.K; k++) { const mx = S.mu[2 * k] + g * (x[0] - Math.sqrt(ab) * S.mu[2 * k]), my = S.mu[2 * k + 1] + g * (x[1] - Math.sqrt(ab) * S.mu[2 * k + 1]); e2 += R[k] * ((mx - m[0]) ** 2 + (my - m[1]) ** 2 + 2 * pv); }
    put('#twTo', t('ch4.unit.t', { t: fmt(tt), s: fmt(Math.sqrt(1 - ab), 2) }));
    put('#twMean', '(' + fmt(m[0], 3) + ', ' + fmt(m[1], 3) + ')'); put('#twTw', '(' + fmt(tw[0], 3) + ', ' + fmt(tw[1], 3) + ')');
    put('#twTop', pct(top)); put('#twSpread', fmt(Math.sqrt(e2), 2));
    const v = { top: pct(top), eff: fmt(eff, 1), sp: fmt(Math.sqrt(e2), 2), diff: fmt(Math.hypot(m[0] - tw[0], m[1] - tw[1]) < 1e-9 ? 0 : Math.hypot(m[0] - tw[0], m[1] - tw[1]), 3) };
    putHTML('#twSay', t(top > 0.9 ? 'ch4.say.sure' : eff < 3 ? 'ch4.say.few' : 'ch4.say.blur', v));
  }
  sim.text = text;
  const moved = () => { sim.dirty = true; text(); };
  sT.addEventListener('input', moved);
  on('#twNew', 'click', () => { const r = M.rng(++seed), p = M.sampleMix(S, 1, r), ab = M.alphabar[+sT.value]; x = [Math.sqrt(ab) * p[0] + Math.sqrt(1 - ab) * r.n(), Math.sqrt(ab) * p[1] + Math.sqrt(1 - ab) * r.n()]; moved(); });
  const setFrom = ev => { if (!sim.v) return; const r = cv.getBoundingClientRect(), p = sim.v.inv(ev.clientX - r.left, ev.clientY - r.top); x = [Math.max(-2.5, Math.min(2.5, p[0])), Math.max(-2.5, Math.min(2.5, p[1]))]; moved(); };
  let drag = false;
  cv.addEventListener('pointerdown', e => { drag = true; setFrom(e); });
  cv.addEventListener('pointermove', e => { if (drag) setFrom(e); });
  window.addEventListener('pointerup', () => { drag = false; });
  cv.addEventListener('keydown', e => { const d = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] }[e.key]; if (d) { e.preventDefault(); x = [Math.max(-2.5, Math.min(2.5, x[0] + d[0])), Math.max(-2.5, Math.min(2.5, x[1] + d[1]))]; moved(); } });
  text();
})();

/* ───────── 04b train a small ε-network in the page ───────── */
const LIVE = { steps: 3000, batch: 128, seed: 5, lr: 3e-3, lrEnd: 1e-4 };
(() => {
  const cv = $('#trCv'), cv2 = $('#trCv2'), bGo = $('#trGo');
  const floor = M.epsLossFloor(S, 20000);
  const dataFn = (r, pt) => { const s = M.sampleMix(S, 1, r); pt[0] = s[0]; pt[1] = s[1]; };
  let tr, hist, running, samples, dist, gen;
  function reset() { tr = M.trainer('eps', Object.assign({ data: dataFn }, LIVE)); hist = []; running = false; samples = null; dist = null; if (gen) gen.cancelled = true; gen = null; }
  reset();
  function regenerate() {
    if (gen) gen.cancelled = true;
    const p = { W1: Float64Array.from(tr.params.W1), b1: Float64Array.from(tr.params.b1), W2: Float64Array.from(tr.params.W2), b2: Float64Array.from(tr.params.b2), W3: Float64Array.from(tr.params.W3), b3: Float64Array.from(tr.params.b3) };
    gen = enqueue(wrapSampler(M.samplerJob(M.netFn(p, 'eps'), 400, 50, 0, M.SEED_GEN), 5, sj => { samples = sj.xs; dist = M.swTruth(S, sj.xs); gen = null; sim.dirty = true; text(); }));
  }
  const sim = reg([cv, cv2], {
    step() {
      if (!running) return;
      const t0 = performance.now();
      while (!tr.done && performance.now() - t0 < 9) { tr.run(5); if (tr.step % 25 === 0) hist.push([tr.step, tr.ema]); if (tr.step % 500 === 0) regenerate(); }
      if (tr.done) { running = false; regenerate(); }
      this.dirty = true; text();
    },
    draw() {
      { const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 44], 0, LIVE.steps, 0.3, 1.2);
        yTicks(c, f, [0.4, 0.6, 0.8, 1.0, 1.2], v => fmt(v, 1)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, [0, 1000, 2000, 3000], v => fmt(v));
        hline(c, f, floor, C.gold);
        const pp = hist.map(q => [q[0], Math.min(1.2, q[1])]); c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); pp.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](f.X(p[0]), f.Y(p[1]))); c.stroke(); }
      { const { c, w, h } = fit(cv2), v = view(w, h, -2, 2, -2, 2, 10); density(c, S, v, w, h, [99, 199, 230], 0.12);
        if (samples) points(c, samples, v, C.gold, 1.6, 0.85);
        else { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch4.cv.nosamples'), w / 2, h / 2); } }
    }
  });
  function text() {
    put('#trStep', t('ch4.unit.steps', { k: fmt(tr.step), n: fmt(LIVE.steps) }));
    put('#trLoss', tr.ema == null ? '—' : fmt(tr.ema, 3)); put('#trFloor', fmt(floor, 3));
    put('#trDist', dist == null ? '—' : t('ch4.unit.dist', { d: fmt(dist, 3), f: fmt(FLOOR, 3) }));
    bGo.textContent = t(running ? 'ch4.btn.pause' : tr.done ? 'ch4.btn.done' : tr.step ? 'ch4.btn.resume' : 'ch4.btn.train');
    bGo.disabled = tr.done; bGo.setAttribute('aria-pressed', String(running));
    const v = { k: fmt(tr.step), loss: tr.ema == null ? '—' : fmt(tr.ema, 3), floor: fmt(floor, 3), gap: tr.ema == null ? '—' : fmt(tr.ema - floor, 3), d: dist == null ? '—' : fmt(dist, 3), f: fmt(FLOOR, 3) };
    putHTML('#trSay', t(tr.step === 0 ? 'ch4.say.idle' : tr.done ? 'ch4.say.done' : running ? 'ch4.say.run' : 'ch4.say.paused', v));
  }
  sim.text = text;
  bGo.addEventListener('click', () => { running = !running; sim.dirty = true; text(); });
  on('#trReset', 'click', () => { reset(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 DDPM vs DDIM ───────── */
// results cache shared by ch5 and ch6: key → { xs, sw }
const RES = new Map();
function requestRun(key, make, cb) {
  if (RES.has(key)) { const r = RES.get(key); if (r.xs) { cb && cb(r); return r; } r.cbs.push(cb); return r; }
  const r = { xs: null, sw: null, cbs: [cb] }; RES.set(key, r);
  enqueue(wrapSampler(make(), 4, sj => { r.xs = sj.xs; r.sw = M.swTruth(S, sj.xs); r.cbs.forEach(f => f && f(r)); r.cbs = []; }));
  return r;
}
const ddimRun = (fn, eta, nfe) => () => M.samplerJob(fn, M.N_EVAL, nfe, eta, M.SEED_GEN);
const fmRun = (fn, nfe) => () => M.fm.job(fn, M.N_EVAL, nfe, M.SEED_GEN);
(() => {
  const cv = $('#smCv'), cv2 = $('#smCv2'), sS = $('#smS');
  const model = () => radioVal('smModel'), eta = () => +radioVal('smKind'), nfe = () => M.NFE_LIST[+sS.value];
  const fnOf = m => m === 'net' ? epsNet : exactEps;
  const key = (m, e, n) => `vp|${m}|${e}|${n}`;
  let started = false;
  function ensure() {
    const m = model(); started = true;
    requestRun(key(m, eta(), nfe()), ddimRun(fnOf(m), eta(), nfe()), () => { sim.dirty = true; text(); });
    for (const n of M.NFE_LIST) for (const e of [0, 1]) requestRun(key(m, e, n), ddimRun(fnOf(m), e, n), () => { sim.dirty = true; text(); });
  }
  const sim = reg([cv, cv2], {
    step() { if (!started) ensure(); },
    draw() {
      const m = model(), cur = RES.get(key(m, eta(), nfe()));
      { const { c, w, h } = fit(cv), v = view(w, h, -2, 2, -2, 2, 10); density(c, S, v, w, h, [99, 199, 230], 0.12);
        if (cur && cur.xs) points(c, cur.xs, v, eta() ? C.red : C.cyan, 1.4, 0.8);
        else { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('common.computing'), w / 2, h / 2); } }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [28, 16, 38, 44], 1, 1000, 0.01, 4, true, true);
        yTicks(c, f, YT_SW, fmtSW); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
        xTicks(c, f, [1, 10, 100, 1000], v => fmt(v));
        hline(c, f, FLOOR, C.gold);
        for (const [e, col] of [[1, C.red], [0, C.cyan]]) { const pp = []; for (const n of M.NFE_LIST) { const r = RES.get(key(m, e, n)); if (r && r.sw != null) pp.push([n, r.sw]); } path(c, pp, f.X, f.Y, col); }
        if (cur && cur.sw != null) { c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(f.X(nfe()), f.Y(cur.sw), 6, 0, 6.283); c.stroke(); } }
    }
  });
  function text() {
    const m = model(), e = eta(), n = nfe(), cur = RES.get(key(m, e, n)), oth = RES.get(key(m, 1 - e, n));
    put('#smSo', fmt(n)); put('#smNfe', fmt(n));
    put('#smDist', cur && cur.sw != null ? fmt(cur.sw, 3) : '…'); put('#smFloor', fmt(FLOOR, 3));
    put('#smOther', oth && oth.sw != null ? fmt(oth.sw, 3) : '…');
    if (!cur || cur.sw == null) { putHTML('#smSay', t('ch5.say.wait')); return; }
    const v = { n: fmt(n), d: fmt(cur.sw, 3), f: fmt(FLOOR, 3), o: oth && oth.sw != null ? fmt(oth.sw, 3) : '…', me: t(e ? 'ch5.kind.ddpm' : 'ch5.kind.ddim'), other: t(e ? 'ch5.kind.ddim' : 'ch5.kind.ddpm'), ratio: fmt(cur.sw / FLOOR, 1) };
    let k;
    if (n === 1) k = 'ch5.say.one';
    else if (cur.sw <= 1.5 * FLOOR) k = m === 'net' ? 'ch5.say.goodnet' : 'ch5.say.good';
    else if (oth && oth.sw != null && oth.sw < cur.sw * 0.85) k = 'ch5.say.worse';
    else if (oth && oth.sw != null && cur.sw < oth.sw * 0.85) k = 'ch5.say.better';
    else k = 'ch5.say.similar';
    putHTML('#smSay', t(k, v));
  }
  sim.text = text;
  const changed = () => { ensure(); sim.dirty = true; text(); };
  sS.addEventListener('input', changed); radios('smKind').forEach(r => r.addEventListener('change', changed)); radios('smModel').forEach(r => r.addEventListener('change', changed));
  text();
})();

/* ───────── 05b published FID vs steps (DDIM paper, Table 1, CIFAR-10) ───────── */
const PUB_DDIM = { S: [10, 20, 50, 100, 1000], eta0: [13.36, 6.84, 4.67, 4.16, 4.04], eta1: [41.07, 18.36, 8.01, 5.78, 4.73] };
(() => {
  const cv = $('#pubCv');
  reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [26, 16, 38, 44], 8, 1000, 0, 45, true);
    yTicks(c, f, [0, 15, 30, 45], v => fmt(v)); axes(c, f, t('ch5.pub.x'), t('ch5.pub.y'));
    xTicks(c, f, [10, 100, 1000], v => fmt(v));
    path(c, PUB_DDIM.S.map((s, i) => [s, PUB_DDIM.eta1[i]]), f.X, f.Y, C.red);
    path(c, PUB_DDIM.S.map((s, i) => [s, PUB_DDIM.eta0[i]]), f.X, f.Y, C.cyan);
  } });
})();

/* ───────── 06 paths and the quality-vs-steps chart ───────── */
(() => {
  const cv = $('#pathCv'), NP = 40, STEPS = 100;
  const traces = {}, ones = {};
  function compute(kind) {
    if (traces[kind]) return;
    if (kind === 'sde' || kind === 'ode') {
      const e = kind === 'sde' ? 1 : 0;
      traces[kind] = M.sample(epsNet, NP, STEPS, e, M.SEED_GEN, { trace: NP }).trace;
      if (e === 0) { const a = M.sample(epsNet, NP, 1, 0, M.SEED_GEN).xs; ones[kind] = a; }
    } else {
      const fn = kind === 'fm' ? fmNet : reNet;
      traces[kind] = M.fmSample(fn, NP, STEPS, M.SEED_GEN, { trace: NP }).trace;
      ones[kind] = M.fmSample(fn, NP, 1, M.SEED_GEN).xs;
    }
  }
  const kind = () => radioVal('pathKind');
  const sim = reg(cv, {
    draw() {
      const k = kind(); compute(k);
      const { c, w, h } = fit(cv), v = view(w, h, -3, 3, -2.6, 2.6, 10); density(c, S, v, w, h, [99, 199, 230], 0.14);
      const tr = traces[k];
      c.lineWidth = 1; c.strokeStyle = 'rgba(99,199,230,.7)';
      for (let i = 0; i < NP; i++) { c.beginPath(); for (let s = 0; s < tr.length; s++) { const x = v.X(tr[s][2 * i]), y = v.Y(tr[s][2 * i + 1]); s ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      for (let i = 0; i < NP; i++) dot(c, v.X(tr[0][2 * i]), v.Y(tr[0][2 * i + 1]), 2.6, C.violet);
      if (ones[k]) for (let i = 0; i < NP; i++) dot(c, v.X(ones[k][2 * i]), v.Y(ones[k][2 * i + 1]), 3, C.gold);
    }
  });
  function oneStepGap(k) { const tr = traces[k], o = ones[k]; if (!o) return null; const end = tr[tr.length - 1]; let s = 0; for (let i = 0; i < NP; i++) s += Math.hypot(o[2 * i] - end[2 * i], o[2 * i + 1] - end[2 * i + 1]); return s / NP; }
  function text() {
    const k = kind(); compute(k);
    const g = oneStepGap(k);
    const runKey = n => k === 'sde' ? `vp|net|1|${n}` : k === 'ode' ? `vp|net|0|${n}` : `${k}|${n}`;
    const o = FOM.find(q => q.id === { sde: 'ddpm', ode: 'ddim', fm: 'fm', reflow: 'reflow' }[k]);
    for (const n of [1, 10]) if (!RES.has(o.key(n))) requestRun(o.key(n), o.make(n), () => { sim.dirty = true; text(); });
    const r1 = RES.get(runKey(1)), r10 = RES.get(runKey(10));
    put('#pathOne', g == null ? '—' : fmt(g, 2)); put('#pathOneDist', r1 && r1.sw != null ? fmt(r1.sw, 3) : '…'); put('#pathTen', r10 && r10.sw != null ? fmt(r10.sw, 3) : '…');
    putHTML('#pathSay', t('ch6.say.' + k, { g: g == null ? '—' : fmt(g, 2), d1: r1 && r1.sw != null ? fmt(r1.sw, 3) : '…', d10: r10 && r10.sw != null ? fmt(r10.sw, 3) : '…' }));
  }
  sim.text = text;
  sim.step = () => { if (!sim.started) { sim.started = true; text(); } };
  radios('pathKind').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  window.__pathText = text;
})();
const FOM = [
  { id: 'ddpm', col: C.red, list: M.NFE_LIST, key: n => `vp|net|1|${n}`, make: n => ddimRun(epsNet, 1, n) },
  { id: 'ddim', col: C.cyan, list: M.NFE_LIST, key: n => `vp|net|0|${n}`, make: n => ddimRun(epsNet, 0, n) },
  { id: 'fm', col: C.violet, list: M.FM_NFE_LIST, key: n => `fm|${n}`, make: n => fmRun(fmNet, n) },
  { id: 'reflow', col: C.green, list: M.FM_NFE_LIST, key: n => `reflow|${n}`, make: n => fmRun(reNet, n) }
];
const NEED = 1.5; // "good enough": within 1.5 × the floor (a threshold chosen for this page)
function stepsNeeded(o) { for (const n of o.list) { const r = RES.get(o.key(n)); if (!r || r.sw == null) return undefined; if (r.sw <= NEED * FLOOR) return n; } return null; }
(() => {
  const cv = $('#fomCv'); let started = false;
  const refresh = () => { sim.dirty = true; text(); if (window.__pathText) window.__pathText(); };
  const sim = reg(cv, {
    step() { if (started) return; started = true; for (const n of [1, 2, 5, 10, 20, 50, 100, 200, 1000]) for (const o of FOM) if (o.list.includes(n)) requestRun(o.key(n), o.make(n), refresh); },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [28, 16, 38, 44], 1, 1000, 0.01, 4, true, true);
      yTicks(c, f, YT_SW, fmtSW); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, f, [1, 10, 100, 1000], v => fmt(v)); hline(c, f, FLOOR, C.gold);
      for (const o of FOM) { const pp = []; for (const n of o.list) { const r = RES.get(o.key(n)); if (r && r.sw != null) pp.push([n, r.sw]); } path(c, pp, f.X, f.Y, o.col); }
    }
  });
  function text() {
    const vals = {}; let all = true;
    for (const o of FOM) { const s = stepsNeeded(o); vals[o.id] = s; if (s === undefined) all = false; put('#fom' + { ddpm: 'Ddpm', ddim: 'Ddim', fm: 'Fm', reflow: 'Re' }[o.id], s === undefined ? '…' : s === null ? t('ch6.unit.never', { n: fmt(o.list[o.list.length - 1]) }) : t('ch6.unit.steps', { n: fmt(s) })); }
    if (!all) { putHTML('#fomSay', t('ch6.say.wait')); return; }
    const v = {}; for (const k in vals) v[k] = vals[k] == null ? '—' : fmt(vals[k]);
    putHTML('#fomSay', t('ch6.say.done', v));
  }
  sim.text = text;
  text();
})();

/* ───────── 07 classifier-free guidance ───────── */
(() => {
  const cv = $('#gdCv'), cv2 = $('#gdCv2'), sW = $('#gdW');
  const WS = []; for (let w = 0; w <= 8 + 1e-9; w += 0.5) WS.push(+w.toFixed(1));
  const res = new Map(), trueFid = M.trueFidelity(), other = M.sampleMix(M.MOONS.B, 500, M.rng(61));
  let started = false;
  function want(w) { if (res.has(w)) return; res.set(w, null); enqueue({ done: false, step() { res.set(w, M.guidance(w)); this.done = true; }, finish() { sim.dirty = true; text(); } }); }
  const sim = reg([cv, cv2], {
    step() { if (started) return; started = true; want(+sW.value); WS.forEach(want); },
    draw() {
      const w = +sW.value, r = res.get(w);
      { const { c, w: W, h } = fit(cv), v = view(W, h, -2.2, 2.2, -1.8, 1.8, 10);
        points(c, other, v, '#5b4a4a', 1.3, 0.8);
        if (r) points(c, r.xs, v, C.cyan, 1.4, 0.85); else { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('common.computing'), W / 2, h / 2); } }
      { const { c, w: W, h } = fit(cv2), f = frame(W, h, [26, 16, 38, 40], 0, 8, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch7.cv.x'), ''); xTicks(c, f, [0, 2, 4, 6, 8], v => fmt(v));
        const a = [], b = []; for (const x of WS) { const q = res.get(x); if (q) { a.push([x, q.fidelity]); b.push([x, Math.min(1, q.spread)]); } }
        path(c, a, f.X, f.Y, C.gold); path(c, b, f.X, f.Y, C.violet);
        c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(w), f.T); c.lineTo(f.X(w), f.B); c.stroke(); }
    }
  });
  function text() {
    const w = +sW.value, r = res.get(w);
    put('#gdWo', fmt(w, 1)); put('#gdTrue', pct(trueFid, 1));
    put('#gdFid', r ? pct(r.fidelity, 1) : '…'); put('#gdSpread', r ? t('ch7.unit.x', { v: fmt(r.spread, 2) }) : '…'); put('#gdDist', r ? fmt(r.sw, 3) : '…');
    if (!r) { putHTML('#gdSay', t('ch5.say.wait')); return; }
    const v = { w: fmt(w, 1), fid: pct(r.fidelity, 1), tf: pct(trueFid, 1), sp: fmt(r.spread, 2), d: fmt(r.sw, 3) };
    putHTML('#gdSay', t(w === 0 ? 'ch7.say.zero' : w <= 1 ? 'ch7.say.low' : 'ch7.say.high', v));
  }
  sim.text = text;
  sW.addEventListener('input', () => { want(+sW.value); sim.dirty = true; text(); });
  text();
})();
const PUB_CFG = { w: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4], fid: [1.8, 1.55, 2.04, 3.03, 4.3, 5.74, 7.19, 8.62, 10.08, 11.41, 12.6, 21.03, 24.83, 26.22], is: [53.71, 66.11, 78.91, 92.8, 106.2, 119.3, 131.1, 141.8, 151.6, 161, 170.1, 225.5, 250.4, 260.2] };
(() => {
  const cv = $('#pub2Cv');
  reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [26, 44, 38, 40], 0, 4, 0, 30), Yis = v => f.B - (f.B - f.T) * v / 300;
    yTicks(c, f, [0, 10, 20, 30], v => fmt(v)); axes(c, f, t('ch7.pub.x'), t('ch7.pub.y'));
    c.fillStyle = C.gold; c.textAlign = 'left'; [0, 100, 200, 300].forEach(v => c.fillText(fmt(v), f.R + 6, Yis(v)));
    c.textAlign = 'right'; c.fillText(t('ch7.pub.y2'), f.R + 40, f.T - 12);
    xTicks(c, f, [0, 1, 2, 3, 4], v => fmt(v));
    path(c, PUB_CFG.w.map((x, i) => [x, PUB_CFG.fid[i]]), f.X, f.Y, C.red);
    path(c, PUB_CFG.w.map((x, i) => [x, PUB_CFG.is[i]]), f.X, Yis, C.gold);
  } });
})();

/* ───────── 08 memorisation ───────── */
(() => {
  const cv = $('#mmCv'), res = new Map(), sets = {};
  for (const n of M.MEMO.sizes) sets[n] = M.trainingSet(n, M.MEMO.seed);
  const n = () => +radioVal('mmN'), model = () => radioVal('mmModel');
  const base = {}, baseMed = {}; { const tru = M.sampleMix(S, M.N_EVAL, M.rng(M.MEMO.seed + 1)); for (const k of M.MEMO.sizes) { base[k] = M.copyShare(tru, sets[k], M.MEMO.delta); baseMed[k] = M.nnMedian(tru, sets[k]); } }
  let started = false;
  function want(k, m) {
    const key = k + '|' + m; if (res.has(key)) return; res.set(key, null);
    const fn = m === 'exact' ? M.vp.epsFn(M.empirical(sets[k])) : (nets['memo' + k] ? M.netFn(nets['memo' + k], 'eps') : M.vp.epsFn(M.empirical(sets[k])));
    enqueue(wrapSampler(M.samplerJob(fn, M.N_EVAL, M.MEMO.steps, 0, M.SEED_GEN), m === 'exact' ? Math.max(1, Math.round(64 / k)) : 3, sj => { res.set(key, { xs: sj.xs, copy: M.copyShare(sj.xs, sets[k], M.MEMO.delta), med: M.nnMedian(sj.xs, sets[k]), sw: M.swTruth(S, sj.xs) }); sim.dirty = true; text(); }));
  }
  const sim = reg(cv, {
    step() { if (started) return; started = true; want(n(), model()); for (const k of M.MEMO.sizes) for (const m of ['exact', 'net']) want(k, m); },
    draw() {
      const { c, w, h } = fit(cv), v = view(w, h, -2, 2, -2, 2, 10), r = res.get(n() + '|' + model()), tr = sets[n()];
      density(c, S, v, w, h, [99, 199, 230], 0.1);
      if (r) points(c, r.xs, v, C.cyan, 1.4, 0.8); else { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('common.computing'), w / 2, h / 2); }
      c.strokeStyle = C.gold; c.lineWidth = 1.3; const rr = n() > 200 ? 2.2 : 4;
      for (let i = 0; i < tr.length; i += 2) { c.beginPath(); c.arc(v.X(tr[i]), v.Y(tr[i + 1]), rr, 0, 6.283); c.stroke(); }
    }
  });
  function text() {
    const k = n(), m = model(), r = res.get(k + '|' + m);
    put('#mmBase', pct(base[k], 1)); put('#mmCopy', r ? pct(r.copy, 1) : '…');
    put('#mmMed', r ? t('ch8.unit.med', { g: fmt(r.med, 3), b: fmt(baseMed[k], 3) }) : '…');
    put('#mmDist', r ? t('ch4.unit.dist', { d: fmt(r.sw, 3), f: fmt(FLOOR, 3) }) : '…');
    if (!r) { putHTML('#mmSay', t('ch5.say.wait')); return; }
    const v = { n: fmt(k), copy: pct(r.copy, 1), base: pct(base[k], 1), g: fmt(r.med, 3), b: fmt(baseMed[k], 3), d: fmt(r.sw, 3), f: fmt(FLOOR, 3), x: fmt(baseMed[k] / Math.max(r.med, 1e-9), 1) };
    putHTML('#mmSay', t(m === 'exact' ? 'ch8.say.exact' : r.med < 0.5 * baseMed[k] ? 'ch8.say.netcopy' : 'ch8.say.netgen', v));
  }
  sim.text = text;
  radios('mmN').concat(radios('mmModel')).forEach(r => r.addEventListener('change', () => { want(n(), model()); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 09 latent-space arithmetic ───────── */
const LD_CH = 4; // latent channels of Stable Diffusion v1 (model card)
function ldText() {
  const res = +radioVal('ldRes'), f = +radioVal('ldF'), p = +radioVal('ldP'), q = M.latentCost(res, f, LD_CH, p);
  const big = x => x >= 1e6 ? t('ch9.unit.m', { v: fmt(x / 1e6, x >= 1e8 ? 0 : 1) }) : fmt(x);
  const bigE = x => { if (x < 1e6) return fmt(x); const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); return t('ch9.unit.sci', { m: fmt(m, 1), e: pow10(e) }); };
  put('#ldPix', big(q.pixels)); put('#ldLat', t('ch9.unit.lat', { v: big(q.latent), s: fmt(q.side), c: fmt(LD_CH) }));
  put('#ldTok', fmt(q.tokens)); put('#ldPairs', bigE(q.pairs));
  putHTML('#ldSay', t(f === 1 ? 'ch9.say.pixel' : 'ch9.say.latent', { res: fmt(res), f: fmt(f), r: fmt(q.ratio, 0), tok: fmt(q.tokens), pairs: bigE(q.pairs), ptok: fmt(q.pixelTokens), ppairs: bigE(q.pixelPairs), x: fmt(q.pixelPairs / q.pairs, 0) }));
}
['ldRes', 'ldF', 'ldP'].forEach(nm => radios(nm).forEach(r => r.addEventListener('change', ldText)));
sims.push({ cvs: [], vis: false, dirty: false, text: ldText });

/* ───────── 10 frontier: rendered from the data block in copy ───────── */
function renderFrontier() {
  const tierName = k => t('ch10.tier.' + k);
  const li = it => `<li><span class="when">${it.when}</span><span class="tag ${it.tier}">${tierName(it.tier)}</span>${it.text} <span class="who">${it.who || ''}</span></li>`;
  const items = data('frontier');
  const arch = $('#frArch'), open = $('#frOpen'), recs = $('#frRecs tbody');
  if (arch) arch.innerHTML = items.filter(i => i.group === 'arch').map(li).join('');
  if (open) open.innerHTML = items.filter(i => i.group === 'open').map(li).join('');
  if (recs) recs.innerHTML = data('records').map(r => `<tr><td>${r.what}</td><td class="n">${r.nfe}</td><td class="n">${r.fid}</td><td>${r.when}</td></tr>`).join('');
}

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  workJobs(10);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
window.__essay = { RES, jobs, FLOOR };
})();
