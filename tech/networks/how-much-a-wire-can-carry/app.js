/* How much a wire can carry: wiring, drawing, i18n, on-screen gating and time-sliced computation.
 * All visible text comes from copy.*.js; all numbers come from models.js. */
(() => {
'use strict';
const M = window.WireModels;
const CORPUS = window.WIRE_CORPUS;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', dim: '#6f7789', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

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
const textFns = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
  textFns.forEach(f => f());
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── number formats ───────── */
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
function sci(x, d = 1) { // 1.6×10⁻⁷
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x))), m = +(x / Math.pow(10, e)).toFixed(d);
  if (Math.abs(m) >= 10) { m /= 10; e++; }
  return e === 0 ? fmt(m, d) : fmt(m, d) + '×10' + sup(e);
}
const pct = (x, d = 0) => t('u.pct', { v: fmt(x * 100, d) });
const prob = x => x >= 0.01 ? pct(x, 1) : sci(x, 1); // probabilities: percent above 1 %, scientific below
const db = (x, d = 1) => t('u.db', { v: fmt(x, d) });
function pre(v) { // SI prefix
  const a = Math.abs(v);
  return a >= 1e12 ? [v / 1e12, 'T'] : a >= 1e9 ? [v / 1e9, 'G'] : a >= 1e6 ? [v / 1e6, 'M'] : a >= 1e3 ? [v / 1e3, 'k'] : [v, ''];
}
const sig = x => (Math.abs(x) < 10 ? 2 : Math.abs(x) < 100 ? 1 : 0);
function rate(v, d) { const [x, p] = pre(v); return t('u.rate', { v: fmt(x, d == null ? sig(x) : d), p }); }
function hz(v, d) { const [x, p] = pre(v); return t('u.hz', { v: fmt(x, d == null ? sig(x) : d), p }); }
const hex = v => v.toString(16).toUpperCase();

/* ───────── canvas + sim registry ───────── */
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

/* background work: generators that run a few milliseconds per frame, only while one of their owners is on screen */
const jobs = [];
function job(owners, gen, done) { const j = { owners: [].concat(owners), gen, done, dead: false }; jobs.push(j); return j; }
function runJobs(budget) {
  const t0 = performance.now();
  for (const j of jobs) {
    if (j.dead || !j.owners.some(s => s.vis)) continue;
    while (performance.now() - t0 < budget) { const r = j.gen.next(); if (r.done) { j.dead = true; j.done(r.value); break; } }
    if (performance.now() - t0 >= budget) break;
  }
  for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].dead) jobs.splice(i, 1);
}

/* plot helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab, opt = {}) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + (opt.xLabDy || 26)); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function niceTicks(lo, hi, maxN) {
  const span = hi - lo; let step = Infinity;
  for (let e = Math.floor(Math.log10(span / Math.max(1, maxN))) - 1; step === Infinity; e++) for (const m of [1, 2, 5]) { const st = m * Math.pow(10, e); if (span / st <= maxN) { step = st; break; } }
  const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toPrecision(12));
  return out;
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5, hollow) { c.beginPath(); c.arc(x, y, r, 0, 6.283); if (hollow) { c.strokeStyle = col; c.lineWidth = 1.6; c.stroke(); } else { c.fillStyle = col; c.fill(); } }
const lg = x => Math.log10(Math.max(x, 1e-300));
const ALPHA = M.ALPHA;

/* ═════════ 01 Shannon's guessing game + n-gram ladder ═════════ */
const split = M.corpusSplit(CORPUS);
const train = split.train, test = split.test;
const ng = { cache: new Map(), full: null, fullJob: null, job: null };
function ngWork(pct) {
  return (function* () {
    const tr = train.slice(0, Math.round(train.length * pct / 100));
    const m = yield* M.trainNgramGen(tr, 6);
    const xent = yield* M.crossEntropyAllGen(m, test);
    const plugin = []; for (let k = 0; k <= 6; k++) { plugin.push(M.pluginConditional(tr, k)); yield; }
    return { xent, plugin, n: tr.length, model: m };
  })();
}
(() => {
  // five passages from the held-out part of the book, each preceded by 40 letters of context
  const PASS = [200, 3000, 7000, 11000, 15000].map(s0 => { const s = test.indexOf(' ', s0) + 1, raw = test.slice(s, s + 80); return { text: raw.slice(0, raw.lastIndexOf(' ')), before: test.slice(Math.max(0, s - 40), s) }; });
  const st = { p: 0, pos: 0, tried: new Set(), marks: [], user: [], mach: null, machAll: null };
  const keysEl = $('#ggKeys'), keyBtns = [];
  for (let i = 0; i < 27; i++) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i;
    if (i === 26) b.className = 'space'; else b.textContent = ALPHA[i];
    b.addEventListener('click', () => guess(i)); keysEl.appendChild(b); keyBtns.push(b);
  }
  const cur = () => PASS[st.p];
  function guess(i) {
    const P = cur(); if (st.pos >= P.text.length || st.tried.has(i)) return;
    const want = ALPHA.indexOf(P.text[st.pos]);
    if (i === want) { const r = st.tried.size + 1; st.user.push(r); st.marks.push(r); st.pos++; st.tried.clear(); }
    else st.tried.add(i);
    sim.dirty = true; text();
  }
  $('#ggKeys').closest('figure').addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = (e.key || '').toLowerCase();
    if (/^[a-z]$/.test(k)) { e.preventDefault(); guess(k.charCodeAt(0) - 97); }
    else if (k === ' ' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); guess(26); }
  });
  on('#ggMachine', 'click', () => {
    if (!st.mach) return;
    const ranks = st.mach[st.p]; while (st.pos < cur().text.length) { st.marks.push(-ranks[st.pos]); st.pos++; }
    st.tried.clear(); sim.dirty = true; text();
  });
  on('#ggNext', 'click', () => { st.p = (st.p + 1) % PASS.length; st.pos = 0; st.marks = []; st.tried.clear(); sim.dirty = true; text(); });
  function machineReady(model) {
    const v = M.ngramView(model, 4);
    st.mach = PASS.map(P => M.machineRanks(v, P.text, P.before));
    st.machAll = M.shannonBounds([].concat(...st.mach));
    sim.dirty = true; text();
  }
  const bins = q => { const out = []; for (let i = 1; i <= 9; i++) out.push(q[i]); let r = 0; for (let i = 10; i < q.length; i++) r += q[i]; out.push(r); return out; };
  const sim = reg(ggCv(), {
    draw() {
      const { c, w, h } = fit($('#ggCv')), f = frame(w, h, [24, 10, 34, 44], 0, 10, 0, 1);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%');
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      const cw = (f.R - f.L) / 10, labs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
      c.fillStyle = C.mute; c.textAlign = 'center'; labs.forEach((l, i) => c.fillText(l, f.L + cw * (i + 0.5), f.B + 11));
      const sets = [];
      if (st.user.length) sets.push([bins(M.shannonBounds(st.user).q), C.gold]);
      if (st.machAll) sets.push([bins(st.machAll.q), C.violet]);
      const bw = Math.min(16, cw * 0.36);
      sets.forEach(([q, col], si) => { c.fillStyle = col; q.forEach((v, i) => { const x = f.L + cw * (i + 0.5) + (si === 0 && sets.length > 1 ? -bw - 1 : sets.length > 1 ? 1 : -bw / 2); c.fillRect(x, f.Y(v), bw, f.B - f.Y(v)); }); });
    }
  });
  function ggCv() { return $('#ggCv'); }
  function passageHTML() {
    const P = cur(), esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    let h = '<span class="pre">…' + esc(P.before.slice(-24)) + '</span>';
    for (let i = 0; i < st.pos; i++) {
      const r = st.marks[i], cls = r < 0 ? 'mach' : r === 1 ? 'k1' : r <= 3 ? 'k2' : r <= 9 ? 'k3' : 'k4';
      h += '<span class="' + cls + '">' + esc(P.text[i]) + '</span>';
    }
    if (st.pos < P.text.length) h += '<span class="cur">' + (reduce ? '_' : '&nbsp;') + '</span>';
    return h;
  }
  function text() {
    putHTML('#ggText', passageHTML());
    keyBtns.forEach((b, i) => { if (i === 26) b.textContent = t('ch1.key.space'); const off = st.tried.has(i) || st.pos >= cur().text.length; b.setAttribute('aria-disabled', String(off)); });
    const n = st.user.length, ub = n ? M.shannonBounds(st.user) : null, mb = st.machAll;
    put('#ggN', fmt(n)); put('#ggFirst', ub ? pct(ub.firstTry) : t('u.none'));
    put('#ggRange', n >= 20 ? fmt(ub.lower, 2) + '–' + fmt(ub.upper, 2) : t('u.none'));
    put('#ggMRange', mb ? fmt(mb.lower, 2) + '–' + fmt(mb.upper, 2) : t('u.wait'));
    let key;
    const done = st.pos >= cur().text.length;
    if (!mb) key = 'ch1.say.wait';
    else if (n === 0) key = 'ch1.say.start';
    else if (n < 20) key = 'ch1.say.few';
    else key = done ? 'ch1.say.done' : 'ch1.say.est';
    putHTML('#ggSay', t(key, { n: fmt(n), first: ub ? pct(ub.firstTry) : '', lo: ub ? fmt(ub.lower, 2) : '', up: ub ? fmt(ub.upper, 2) : '', mfirst: mb ? pct(mb.firstTry) : '', mlo: mb ? fmt(mb.lower, 2) : '', mup: mb ? fmt(mb.upper, 2) : '' }));
  }
  sim.text = text;
  ng.onFull = machineReady;
  text();
  ng.ggSim = sim;
  window.__wireGame = { rest: () => cur().text.slice(st.pos) }; // for the browser test: the letters still to guess
})();

(() => {
  const cv = $('#ngCv'), sS = $('#ngSize');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = ng.cache.get(+sS.value);
      const f = frame(w, h, [26, 12, 36, 40], -0.5, 6.5, 0, 5);
      yTicks(c, f, [0, 1, 2, 3, 4, 5], v => fmt(v));
      axes(c, f, t('ch1.ng.cv.x'), t('ch1.ng.cv.y'));
      xTicks(c, f, [0, 1, 2, 3, 4, 5, 6], v => fmt(v));
      hline(c, f, Math.log2(27), C.mute);
      if (!r) return;
      const bw = Math.min(18, (f.R - f.L) / 7 * 0.34);
      for (let k = 0; k <= 6; k++) {
        const x = f.X(k);
        c.fillStyle = C.gold; c.fillRect(x - bw - 1, f.Y(r.xent[k]), bw, f.B - f.Y(r.xent[k]));
        c.fillStyle = C.cyan; c.fillRect(x + 1, f.Y(r.plugin[k]), bw, f.B - f.Y(r.plugin[k]));
      }
    }
  });
  function request() {
    const p = +sS.value;
    if (ng.cache.has(p) || p === 100) return;
    if (ng.job) ng.job.dead = true;
    ng.job = job(sim, ngWork(p), res => { ng.cache.set(p, res); res.model = null; sim.dirty = true; text(); });
  }
  ng.fullJob = job([sim, ng.ggSim], ngWork(100), res => { ng.cache.set(100, res); ng.onFull(res.model); res.model = null; sim.dirty = true; text(); });
  function text() {
    const p = +sS.value, n = Math.round(train.length * p / 100), r = ng.cache.get(p);
    put('#ngSizeo', t('ch1.ng.unit.size', { v: fmt(p), n: fmt(n) }));
    if (!r) { ['#ngBest', '#ngOrder', '#ngIn', '#ngSave'].forEach(s => put(s, t('u.wait'))); putHTML('#ngSay', t('ch1.ng.say.wait')); return; }
    let k = 0; for (let i = 1; i <= 6; i++) if (r.xent[i] < r.xent[k]) k = i;
    put('#ngBest', fmt(r.xent[k], 2)); put('#ngOrder', fmt(k)); put('#ngIn', fmt(r.plugin[k], 2)); put('#ngSave', pct(1 - r.xent[k] / Math.log2(27)));
    const v = { n: fmt(r.n), k: fmt(k), best: fmt(r.xent[k], 2), k2: fmt(6), worse: fmt(r.xent[6], 2) };
    putHTML('#ngSay', t(p === 100 ? 'ch1.ng.say.full' : 'ch1.ng.say.small', v)); // the best order is below 6 at every size (tests/models.cjs)
  }
  sim.text = text;
  sS.addEventListener('input', () => { request(); sim.dirty = true; text(); });
  text();
})();

/* ═════════ 02 Huffman on your text, and the biased coin ═════════ */
(() => {
  const cv = $('#hfCv'), ta = $('#hfText'), DEF = CORPUS.slice(0, CORPUS.indexOf(' ', 300));
  ta.value = DEF;
  let st = null, ar = null;
  const show = s => s === ' ' ? t('ch2.cv.space') : s === '\n' ? '↵' : s === '\t' ? '⇥' : s;
  function model() {
    const arr = Array.from(ta.value);
    if (!arr.length) { st = null; ar = null; return; }
    st = M.textStats(arr); ar = M.arithStatic(arr);
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!st) return;
      const N = Math.min(st.symbols.length, w < 500 ? 10 : 18);
      let yMax = 1; for (let i = 0; i < N; i++) yMax = Math.max(yMax, st.huffLengths[i], -Math.log2(st.counts[i] / st.n));
      yMax = Math.ceil(yMax);
      const f = frame(w, h, [26, 10, 30, 34], 0, N, 0, yMax), ys = []; for (let v = 0; v <= yMax; v += yMax > 8 ? 2 : 1) ys.push(v);
      yTicks(c, f, ys, v => fmt(v)); axes(c, f, '', t('ch2.cv.y'));
      const cw = (f.R - f.L) / N, bw = Math.min(14, cw * 0.36);
      for (let i = 0; i < N; i++) {
        const x = f.L + cw * (i + 0.5), id = -Math.log2(st.counts[i] / st.n), hl = st.huffLengths[i];
        c.fillStyle = C.cyan; c.fillRect(x - bw - 1, f.Y(id), bw, f.B - f.Y(id));
        c.fillStyle = C.gold; c.fillRect(x + 1, f.Y(hl), bw, f.B - f.Y(hl));
        c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(show(st.symbols[i]), x, f.B + 12);
      }
    }
  });
  function codes() {
    const box = $('#hfCodes'); box.textContent = '';
    if (!st) return;
    const N = Math.min(st.symbols.length, 24);
    for (let i = 0; i < N; i++) { const sp = document.createElement('span'), b = document.createElement('b'); b.textContent = show(st.symbols[i]); sp.appendChild(b); sp.appendChild(document.createTextNode(st.huffCodes[i])); box.appendChild(sp); }
  }
  function text() {
    if (!st) { ['#hfH', '#hfL', '#hfA', '#hfN'].forEach(s => put(s, t('u.none'))); putHTML('#hfSay', t('ch2.say.empty')); return; }
    put('#hfH', fmt(st.H, 3)); put('#hfL', fmt(st.huffAvg, 3)); put('#hfA', fmt(ar.perSymbol, 3));
    put('#hfN', t('ch2.unit.n', { n: fmt(st.n), d: fmt(st.symbols.length) }));
    const v = { h: fmt(st.H, 3), l: fmt(st.huffAvg, 3), gap: fmt(st.huffAvg - st.H, 3), bits: fmt(ar.bits), a: fmt(ar.perSymbol, 3), n: fmt(st.n) };
    const key = st.symbols.length === 1 ? 'ch2.say.one' : st.counts.every(x => x === 1) ? 'ch2.say.uniq' : 'ch2.say.ok';
    putHTML('#hfSay', t(key, v));
  }
  sim.text = () => { text(); codes(); };
  const redo = () => { model(); sim.dirty = true; text(); codes(); };
  ta.addEventListener('input', redo);
  on('#hfReset', 'click', () => { ta.value = DEF; redo(); });
  model(); text(); codes();
})();

(() => {
  const cv = $('#cnCv'), sP = $('#cnP'), sB = $('#cnB'), curves = new Map();
  const grid = []; for (let i = 1; i <= 50; i++) grid.push(i / 100);
  const curve = b => { if (!curves.has(b)) curves.set(b, grid.map(p => [p, M.coinHuffman(p, b)])); return curves.get(b); };
  let ar = null;
  const model = () => { ar = M.coinArith(+sP.value, 2000, M.SEEDS.coin); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 44], 0, 0.5, 0, 1.05), p = +sP.value, b = +sB.value;
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2)); axes(c, f, t('ch2.coin.cv.x'), t('ch2.coin.cv.y'));
      xTicks(c, f, [0, 0.1, 0.2, 0.3, 0.4, 0.5], v => fmt(v, 1), true);
      path(c, grid.map(q => [q, M.H2(q)]), f.X, f.Y, C.cyan);
      path(c, curve(b), f.X, f.Y, C.gold);
      vline(c, f, p, C.line, [3, 3]);
      dot(c, f.X(p), f.Y(ar.perSymbol), C.green);
    }
  });
  function text() {
    const p = +sP.value, b = +sB.value, H = M.H2(p), hf = M.coinHuffman(p, b);
    put('#cnPo', fmt(p, 2)); put('#cnBo', fmt(b));
    put('#cnH', fmt(H, 3)); put('#cnHf', fmt(hf, 3)); put('#cnAr', fmt(ar.perSymbol, 3)); put('#cnOk', t(ar.ok ? 'u.same' : 'u.diff'));
    const v = { p: fmt(p, 2), h: fmt(H, 3), waste: fmt(hf - H, 3), ar: fmt(ar.perSymbol, 3), b: fmt(b), hf: fmt(hf, 3), gap: fmt(hf - H, 3), size: fmt(Math.pow(2, b)) };
    putHTML('#cnSay', t(p >= 0.5 ? 'ch2.coin.say.fair' : b === 1 ? 'ch2.coin.say.one' : 'ch2.coin.say.block', v));
  }
  sim.text = text;
  sP.addEventListener('input', () => { model(); sim.dirty = true; text(); });
  sB.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ═════════ 03 prediction is compression; the counting argument ═════════ */
(() => {
  const cv = $('#pcCv'), sK = $('#pcK'), cache = new Map(), SRC = { alice: () => test.slice(0, 10000), random: (() => { let r = null; return () => (r = r || M.randomLetters(10000, M.SEEDS.randomText)); })() };
  let jb = null;
  const key = (src, k, warm) => src + ':' + k + ':' + (warm ? 'w' : 'c');
  function* work() {
    for (;;) {
      const src = radioVal('pcSrc'), k0 = +sK.value;
      const order = [k0, 0, 1, 2, 3, 4, 5].filter((k, i, a) => a.indexOf(k) === i);
      const k = order.find(kk => !cache.has(key(src, kk, false)) || !cache.has(key(src, kk, true)));
      if (k == null) return;
      for (const warm of [false, true]) {
        const kk = key(src, k, warm); if (cache.has(kk)) continue;
        const r = yield* M.adaptiveCodeGen(SRC[src](), k, warm ? train : null);
        cache.set(kk, r); sim.dirty = true; text();
      }
    }
  }
  const ensure = () => { if (!jb || jb.dead) jb = job(sim, work(), () => {}); };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), src = radioVal('pcSrc');
      let mx = 5; for (let k = 0; k <= 5; k++) for (const wm of [false, true]) { const r = cache.get(key(src, k, wm)); if (r) mx = Math.max(mx, r.bpc); }
      const yMax = Math.ceil(mx), f = frame(w, h, [26, 12, 36, 40], -0.5, 5.5, 0, yMax), ys = []; for (let v = 0; v <= yMax; v += yMax > 6 ? 2 : 1) ys.push(v);
      yTicks(c, f, ys, v => fmt(v)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      xTicks(c, f, [0, 1, 2, 3, 4, 5], v => fmt(v));
      hline(c, f, Math.log2(27), C.mute);
      const bw = Math.min(20, (f.R - f.L) / 6 * 0.34), kNow = +sK.value;
      for (let k = 0; k <= 5; k++) {
        const x = f.X(k), a = cache.get(key(src, k, false)), b = cache.get(key(src, k, true));
        c.globalAlpha = k === kNow ? 1 : 0.55;
        if (a) { c.fillStyle = C.gold; c.fillRect(x - bw - 1, f.Y(a.bpc), bw, f.B - f.Y(a.bpc)); }
        if (b) { c.fillStyle = C.cyan; c.fillRect(x + 1, f.Y(b.bpc), bw, f.B - f.Y(b.bpc)); }
        c.globalAlpha = 1;
      }
    }
  });
  function text() {
    const src = radioVal('pcSrc'), k = +sK.value, a = cache.get(key(src, k, false)), b = cache.get(key(src, k, true));
    put('#pcKo', fmt(k));
    if (!a || !b) { ['#pcCold', '#pcWarm', '#pcBytes', '#pcOk'].forEach(s => put(s, t('u.wait'))); putHTML('#pcSay', t('ch3.say.wait')); return; }
    put('#pcCold', fmt(a.bpc, 3)); put('#pcWarm', fmt(b.bpc, 3));
    put('#pcBytes', t('ch3.unit.bytes', { v: fmt(Math.ceil(b.bits / 8)), raw: fmt(10000) }));
    put('#pcOk', t(a.ok && b.ok ? 'u.same' : 'u.diff'));
    const v = { k: fmt(k), cold: fmt(a.bpc, 3), warm: fmt(b.bpc, 3), pct: pct(1 - b.bpc / a.bpc) };
    putHTML('#pcSay', t(src === 'alice' ? 'ch3.say.alice' : k === 0 ? 'ch3.say.random0' : 'ch3.say.random', v));
  }
  sim.text = text;
  const changed = () => { ensure(); sim.dirty = true; text(); };
  sK.addEventListener('input', changed); radios('pcSrc').forEach(r => r.addEventListener('change', changed));
  ensure(); text();
})();

(() => {
  const sN = $('#ctN'), sK = $('#ctK');
  const big = x => x < 1e7 ? fmt(x) : sci(x, 2);
  function text() {
    sK.max = String(Math.min(16, +sN.value));
    const n = +sN.value, k = Math.min(+sK.value, n), r = M.counting(n, k);
    put('#ctNo', fmt(n)); put('#ctKo', fmt(k));
    const fr = r.frac >= 1 ? '≈100%' : r.frac >= 0.01 ? pct(r.frac, r.frac > 0.99 ? 3 : 1) : '1/' + fmt(Math.round(1 / r.frac));
    put('#ctTotal', big(r.total)); put('#ctShort', big(r.shorter)); put('#ctFrac', fr);
    $('#ctBar').style.width = (r.frac * 100).toFixed(2) + '%';
    putHTML('#ctSay', t('ch3.ct.say', { n: fmt(n), total: big(r.total), nk: fmt(n - k), short: big(r.shorter), frac: fr, k: fmt(k) }));
  }
  textFns.push(text);
  [sN, sK].forEach(e => e.addEventListener('input', text));
  text();
})();

/* ═════════ 04 binary symmetric channel ═════════ */
(() => {
  const cv = $('#bsCv'), sP = $('#bsP'), sQ = $('#bsQ'), NB = 64;
  let seed = M.SEEDS.bsc, sm = null;
  const model = () => { sm = M.bsc.simulate(NB, +sP.value, +sQ.value, seed); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = +sP.value, q = +sQ.value;
      // the two strips of bits
      const cols = w >= 560 ? 64 : 32, rows = NB / cols, lw = 44, cell = Math.min(13, (w - lw - 8) / cols), gap = 6;
      const strip = (y0, arr, lab, flips) => {
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(lab, 0, y0 + rows * cell / 2);
        for (let i = 0; i < NB; i++) {
          const x = lw + (i % cols) * cell, y = y0 + Math.floor(i / cols) * cell;
          c.fillStyle = arr[i] ? C.ink : C.dimfill; c.fillRect(x + 1, y + 1, cell - 2, cell - 2);
          if (flips && (sm.x[i] ^ sm.y[i])) { c.strokeStyle = C.red; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, cell - 2, cell - 2); }
        }
      };
      strip(4, sm.x, t('ch4.cv.sent'), false);
      const y2 = 4 + rows * cell + gap; strip(y2, sm.y, t('ch4.cv.recv'), true);
      const top = y2 + rows * cell + 34;
      // two plots: side by side when wide, stacked when narrow
      const side = w >= 520, ph = side ? h - top : (h - top - 34) / 2;
      const f1 = side ? frame(w / 2, h, [top, 16, 38, 40], 0, 1, 0, 1) : frame(w, top + ph, [top, 12, 30, 40], 0, 1, 0, 1);
      yTicks(c, f1, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f1, t('ch4.cv.q'), t('ch4.cv.y'), { xLabDy: side ? 26 : 24 });
      xTicks(c, f1, [0, 0.5, 1], v => fmt(v, 1), true);
      const qi = []; for (let i = 0; i <= 100; i++) qi.push([i / 100, M.bsc.mutualInfo(p, i / 100)]);
      path(c, qi, f1.X, f1.Y, C.cyan); dot(c, f1.X(q), f1.Y(M.bsc.mutualInfo(p, q)), C.cyan);
      const f2 = side ? frame(w, h, [top, 12, 38, w / 2 + 40], 0, 0.5, 0, 1) : frame(w, h, [top + ph + 34, 12, 38, 40], 0, 0.5, 0, 1);
      yTicks(c, f2, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f2, t('ch4.cv.p'), t('ch4.cv.y'));
      xTicks(c, f2, [0, 0.25, 0.5], v => fmt(v, 2), true);
      const pc = []; for (let i = 0; i <= 100; i++) pc.push([i / 200, M.bsc.capacity(i / 200)]);
      path(c, pc, f2.X, f2.Y, C.gold); dot(c, f2.X(p), f2.Y(M.bsc.capacity(p)), C.gold);
    }
  });
  function text() {
    const p = +sP.value, q = +sQ.value, I = M.bsc.mutualInfo(p, q), Cc = M.bsc.capacity(p);
    put('#bsPo', fmt(p, 2)); put('#bsQo', fmt(q, 2));
    put('#bsHY', fmt(M.H2(M.bsc.pY1(p, q)), 3)); put('#bsHp', fmt(M.H2(p), 3)); put('#bsI', fmt(I, 3)); put('#bsC', fmt(Cc, 3));
    const v = { i: fmt(I, 3), q: fmt(q, 2), c: fmt(Cc, 3), p: fmt(p, 2), lost: pct(1 - Cc), n: fmt(NB), flips: fmt(sm.flips) };
    const key = p === 0 ? 'ch4.say.zero' : p >= 0.5 ? 'ch4.say.half' : Math.abs(q - 0.5) < 0.05 ? 'ch4.say.max' : 'ch4.say.below';
    putHTML('#bsSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sP, sQ].forEach(e => e.addEventListener('input', redo));
  on('#bsSend', 'click', () => { seed++; redo(); });
  text();
})();

/* ═════════ 05 bandwidth and SNR; Voyager ═════════ */
(() => {
  const cv = $('#awCv'), sB = $('#awB'), sS = $('#awS');
  const BWS = []; for (let e = 3; e <= 8; e++) for (const m of [1, 2, 5]) BWS.push(m * Math.pow(10, e)); BWS.push(1e9);
  const B = () => BWS[+sB.value], snr = () => M.undB(+sS.value);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), s = +sS.value, S = snr(), mid = h * 0.5;
      const f1 = frame(w, mid, [26, 14, 30, 40], -20, 40, 0, 14);
      yTicks(c, f1, [0, 4, 8, 12], v => fmt(v)); axes(c, f1, t('ch5.cv.snr'), t('ch5.cv.eff'), { xLabDy: 24 });
      xTicks(c, f1, w < 480 ? [-20, 0, 20, 40] : [-20, -10, 0, 10, 20, 30, 40], v => fmt(v), true);
      const e = []; for (let x = -20; x <= 40; x += 0.5) e.push([x, Math.log2(1 + M.undB(x))]);
      path(c, e, f1.X, f1.Y, C.cyan); dot(c, f1.X(s), f1.Y(Math.log2(1 + S)), C.cyan);
      if (s + 3 <= 40) dot(c, f1.X(s + 3), f1.Y(Math.log2(1 + 2 * S)), C.red, 3.5, true);
      // fixed total power: C(kB) / C(B) = k log2(1 + S/k) / log2(1 + S)
      const lim = (S / Math.LN2) / Math.log2(1 + S), yMax = Math.max(1.5, lim * 1.12);
      const f2 = frame(w, h, [mid + 28, 14, 38, 40], -3, 6, 0, yMax);
      const yt = niceTicks(0, yMax, Math.max(3, Math.min(6, Math.floor((f2.B - f2.T) / 22))));
      yTicks(c, f2, yt, v => fmt(v, v % 1 ? 1 : 0)); axes(c, f2, t('ch5.cv.band'), t('ch5.cv.cap'));
      xTicks(c, f2, w < 480 ? [-2, 0, 2, 4, 6] : [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6], v => v < 0 ? '1/' + Math.pow(2, -v) : '×' + Math.pow(2, v), true);
      hline(c, f2, lim, C.red);
      const cb = []; for (let x = -3; x <= 6; x += 0.05) { const k = Math.pow(2, x); cb.push([x, k * Math.log2(1 + S / k) / Math.log2(1 + S)]); }
      path(c, cb, f2.X, f2.Y, C.gold); dot(c, f2.X(0), f2.Y(1), C.gold);
    }
  });
  function text() {
    const b = B(), S = snr(), s = +sS.value, wi = M.awgn.whatIf(b, S);
    put('#awBo', hz(b, 0)); put('#awSo', db(s, 0));
    put('#awC', rate(wi.base)); put('#awP2', rate(wi.power2)); put('#awB2', rate(wi.band2)); put('#awBoth', rate(wi.both2));
    const v = { snr: fmt(s), c: rate(wi.base), p2: rate(wi.power2), pp: pct(wi.power2 / wi.base - 1), b2: rate(wi.band2), bp: pct(wi.band2 / wi.base - 1), both: rate(wi.both2) };
    putHTML('#awSay', t(s >= 10 ? 'ch5.say.high' : s <= -3 ? 'ch5.say.low' : 'ch5.say.mid', v));
  }
  sim.text = text;
  [sB, sS].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

(() => {
  const cv = $('#vyCv'), sD = $('#vyD'), V = M.VOYAGER, D96 = V.d1996 / M.AU, LD = 299792458 * 86400 / M.AU;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), d = +sD.value;
      const f = frame(w, h, [26, 14, 38, 50], 0, Math.log10(200), 2, 8);
      yTicks(c, f, [2, 3, 4, 5, 6, 7, 8], v => ['100', '1k', '10k', '100k', '1M', '10M', '100M'][v - 2]);
      axes(c, f, t('ch5.vy.cv.x'), t('ch5.vy.cv.y'));
      xTicks(c, f, [0, 1, Math.log10(50), 2], v => fmt(Math.pow(10, v)));
      for (const r of V.rates) hline(c, f, Math.log10(r), C.mute, [3, 4]);
      const pts = []; for (let x = 0; x <= Math.log10(200) + 1e-9; x += 0.02) pts.push([x, Math.log10(M.voyagerLink(Math.pow(10, x) * M.AU).cInf)]);
      path(c, pts, f.X, f.Y, C.gold);
      // reference distances: the 1996 table and one light-day
      c.textAlign = 'center'; c.fillStyle = C.mute;
      for (const [x, key, ty] of [[D96, 'ch5.vy.cv.now', f.T + 8], [LD, 'ch5.vy.cv.v1', f.T + 24]]) {
        vline(c, f, Math.log10(x), C.line, [2, 3]);
        const tx = clamp(f.X(Math.log10(x)), f.L + 40, f.R - 40); c.fillStyle = C.mute; c.fillText(t(key), tx, ty);
      }
      dot(c, f.X(Math.log10(d)), f.Y(Math.log10(M.voyagerLink(d * M.AU).cInf)), C.gold);
    }
  });
  function text() {
    const d = +sD.value, L = M.voyagerLink(d * M.AU);
    put('#vyDo', t('ch5.vy.unit.d', { v: fmt(d) }));
    put('#vyPr', t('u.dbm', { v: fmt(L.pr, 1) })); put('#vyPN', t('u.dbhz', { v: fmt(L.prn0, 2) })); put('#vyC', rate(L.cInf)); put('#vyRatio', pct(160 / L.cInf, 160 / L.cInf < 0.1 ? 2 : 1));
    putHTML('#vySay', t('ch5.vy.say', { d: fmt(d), pr: t('u.dbm', { v: fmt(L.pr, 1) }), pn: t('u.dbhz', { v: fmt(L.prn0, 2) }), c: rate(L.cInf), pct: pct(160 / L.cInf, 160 / L.cInf < 0.1 ? 2 : 1) }));
  }
  sim.text = text;
  sD.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ═════════ 06 repetition vs capacity; the Eb/N0 floor ═════════ */
const shared = { ldpcX: null, convX: null, n: null, done: false, listeners: [] };
(() => {
  const cv = $('#rpCv'), sP = $('#rpP'), NS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25];
  let pts = null, want = true;
  const model = () => { const p = +sP.value; pts = NS.map(n => ({ n, rate: 1 / n, exact: M.repetition.errExact(n, p), sim: M.repetition.simulate(n, p, 20000, M.SEEDS.repetition + n) })); want = false; };
  const sim = reg(cv, {
    step() { if (want) { model(); this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv), p = +sP.value, Cc = M.bsc.capacity(p);
      const f = frame(w, h, [26, 14, 38, 50], 0, 1, -12, 0);
      c.fillStyle = 'rgba(122,214,160,.12)'; c.fillRect(f.L + 1, f.T, f.X(Cc) - f.L - 1, f.B - f.T);
      yTicks(c, f, [-12, -9, -6, -3, 0], v => v === 0 ? '1' : '10' + sup(v)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2), true);
      vline(c, f, Cc, C.green); c.fillStyle = C.green; c.textAlign = 'left'; c.fillText(t('ch6.cv.c'), Math.min(f.X(Cc) + 4, f.R - 40), f.T + 8);
      for (const q of pts) {
        if (q.exact > 1e-12) dot(c, f.X(q.rate), f.Y(lg(q.exact)), C.gold, 4);
        if (q.sim > 0) dot(c, f.X(q.rate), f.Y(lg(q.sim)), C.gold, 6.5, true);
      }
      const hb = M.hamming.bitError(p); if (hb > 1e-12) dot(c, f.X(4 / 7), f.Y(lg(hb)), C.violet, 5);
    }
  });
  function text() {
    const p = +sP.value, Cc = M.bsc.capacity(p), n = M.repetition.nFor(p, 1e-6);
    put('#rpPo', fmt(p, 3)); put('#rpC', fmt(Cc, 3)); put('#rpN', t('ch6.unit.times', { v: fmt(n) })); put('#rpRate', fmt(1 / n, 3)); put('#rpHam', prob(M.hamming.bitError(p)));
    putHTML('#rpSay', t('ch6.say', { p: fmt(p, 3), c: fmt(Cc, 3), n: fmt(n), r: fmt(1 / n, 3), share: pct((1 / n) / Cc), c2: fmt(0.9 * Cc, 3) }));
  }
  sim.text = text;
  sP.addEventListener('input', () => { want = true; sim.dirty = true; text(); });
  model(); text();
})();

(() => {
  const cv = $('#ebCv'), sE = $('#ebE'), UNC = [4, 16, 64, 256].map(m => [M.ebn0.ebn0ForBer(m, 1e-5), Math.log2(Math.log2(m))]); // y is log2 η, η = log2 M
  const eta = () => Math.pow(2, +sE.value);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 44], -3, 24, -4, 4);
      // impossible region: left of the bound
      const bd = []; for (let y = -4; y <= 4.001; y += 0.05) bd.push([M.dB(M.ebn0.min(Math.pow(2, y))), y]);
      c.fillStyle = 'rgba(240,122,109,.08)'; c.beginPath(); c.moveTo(f.L, f.T); bd.slice().reverse().forEach(q => c.lineTo(f.X(clamp(q[0], -3, 24)), f.Y(q[1]))); c.lineTo(f.L, f.B); c.closePath(); c.fill();
      yTicks(c, f, [-4, -2, 0, 2, 4], v => v < 0 ? '1/' + Math.pow(2, -v) : fmt(Math.pow(2, v)));
      axes(c, f, t('ch6.eb.cv.x'), t('ch6.eb.cv.y'));
      xTicks(c, f, [0, 5, 10, 15, 20], v => fmt(v));
      vline(c, f, M.ebn0.limitDb(), C.mute, [2, 3]);
      path(c, bd.filter(q => q[0] <= 24), f.X, f.Y, C.gold);
      for (const [x, y] of UNC) if (x <= 24) dot(c, f.X(x), f.Y(y), C.red);
      if (shared.ldpcX != null) dot(c, f.X(shared.ldpcX), f.Y(0), C.green);
      if (shared.convX != null) dot(c, f.X(shared.convX), f.Y(0), C.green, 4, true);
      const e = eta(); dot(c, f.X(M.dB(M.ebn0.min(e))), f.Y(Math.log2(e)), C.gold, 5.5); hline(c, f, Math.log2(e), C.line, [3, 3]);
    }
  });
  function text() {
    const e = eta(), mn = M.dB(M.ebn0.min(e));
    put('#ebEo', t('u.eff', { v: fmt(e, 2) }));
    put('#ebMin', db(mn, 2)); put('#ebLim', db(M.ebn0.limitDb(), 2)); put('#ebGap', db(M.ebn0.ebn0ForBer(4, 1e-5) - M.dB(M.ebn0.min(2)), 2));
    putHTML('#ebSay', t(e < 1 ? 'ch6.eb.say.low' : 'ch6.eb.say.high', { eta: fmt(e, 2), min: db(mn, 2), min2: db(M.dB(M.ebn0.min(e + 1)), 2) }));
  }
  sim.text = text;
  shared.listeners.push(() => { sim.dirty = true; });
  sE.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ═════════ 07 Hamming (7,4) ═════════ */
(() => {
  const H = M.hamming, st = { d: [1, 0, 1, 1], flips: [0, 0, 0, 0, 0, 0, 0] };
  const r2 = M.rng(77);
  const mk = (parent, cls, label, onClick) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tile ' + cls; b.setAttribute('aria-label', label); if (onClick) b.addEventListener('click', onClick); parent.appendChild(b); return b; };
  function render() {
    const c = H.encode(st.d), r = c.map((v, i) => v ^ st.flips[i]), dec = H.decode(r), s = dec.s;
    const dEl = $('#hmData'); dEl.textContent = '';
    st.d.forEach((v, i) => { const b = mk(dEl, '', t('ch7.tile.data', { i: i + 1, v }), () => { st.d[i] ^= 1; render(); }); b.innerHTML = v + '<small>d' + (i + 1) + '</small>'; });
    const rEl = $('#hmRecv'); rEl.textContent = '';
    r.forEach((v, j) => { const b = mk(rEl, ([0, 1, 3].includes(j) ? 'p' : '') + (st.flips[j] ? ' flip' : ''), t('ch7.tile.recv', { i: j + 1, v }), () => { st.flips[j] ^= 1; render(); }); b.innerHTML = v + '<small>' + (j + 1) + '</small>'; });
    // parity-check matrix: column j is j in binary; lit columns are the received 1s
    let m = '<span class="hd">' + t('ch7.mat.pos') + '</span>'; for (let j = 1; j <= 7; j++) m += '<span class="hd">' + j + '</span>';
    for (const bit of [4, 2, 1]) { m += '<span class="hd">' + bit + '</span>'; for (let j = 1; j <= 7; j++) m += '<span class="' + (r[j - 1] ? 'on' : '') + '">' + ((j & bit) ? 1 : 0) + '</span>'; }
    putHTML('#hmMat', m);
    const oEl = $('#hmOut'); oEl.textContent = '';
    dec.d.forEach((v, i) => { const sp = document.createElement('span'); sp.className = 'tile static' + (v !== st.d[i] ? ' bad' : ' fix'); sp.textContent = v; oEl.appendChild(sp); });
    const k = st.flips.reduce((a, b) => a + b, 0), bad = dec.d.reduce((a, v, i) => a + (v !== st.d[i] ? 1 : 0), 0), sb = s.toString(2).padStart(3, '0');
    put('#hmS', s ? t('ch7.unit.s', { s: sb, pos: s }) : t('ch7.unit.s0')); put('#hmFlips', fmt(k)); put('#hmD', fmt(H.minDistance()));
    put('#hmOk', bad ? t('ch7.unit.bad', { v: bad }) : t('ch7.unit.ok'));
    const key = k === 0 ? 'ch7.say.clean' : k === 1 ? 'ch7.say.one' : s === 0 ? 'ch7.say.miss' : 'ch7.say.two';
    putHTML('#hmSay', t(key, { d: fmt(H.minDistance()), pos: s || st.flips.indexOf(1) + 1, s: sb, k: fmt(k), bad: fmt(bad) }));
  }
  on('#hmClear', 'click', () => { st.flips.fill(0); render(); });
  on('#hmTwo', 'click', () => { st.flips.fill(0); const a = r2.int(7); let b = r2.int(6); if (b >= a) b++; st.flips[a] = 1; st.flips[b] = 1; render(); });
  textFns.push(render);
  render();
})();

/* ═════════ 08 GF(16) and Reed–Solomon (15, 9) ═════════ */
(() => {
  const RS = M.RS, gf = M.gf, st = { msg: [1, 2, 3, 4, 5, 6, 7, 8, 9], state: new Array(15).fill(0), delta: new Array(15).fill(0) };
  const r = M.rng(15);
  function gfRow() { let s = t('ch8.gf.label') + ' '; for (let i = 0; i < 15; i++) s += 'α' + sup(i) + '=<b>' + hex(gf.exp[i]) + '</b>' + (i < 14 ? '　' : ''); putHTML('#gfRow', s); }
  const tile = (parent, cls, txt, label, onClick) => { const b = document.createElement(onClick ? 'button' : 'span'); if (onClick) { b.type = 'button'; b.addEventListener('click', onClick); } b.className = 'tile ' + cls; b.textContent = txt; if (label) b.setAttribute('aria-label', label); parent.appendChild(b); return b; };
  function setErr(i) { st.state[i] = 2; st.delta[i] = 1 + r.int(15); }
  function render() {
    gfRow();
    const cw = RS.encode(st.msg), recv = cw.map((v, i) => st.state[i] === 1 ? null : st.state[i] === 2 ? v ^ st.delta[i] : v);
    const mEl = $('#rsMsg'); mEl.textContent = '';
    st.msg.forEach((v, i) => tile(mEl, '', hex(v), t('ch8.tile.msg', { i: i + 1, v: hex(v) }), () => { st.msg[i] = (v + 1) % 16; render(); }));
    const cEl = $('#rsCw'); cEl.textContent = '';
    recv.forEach((v, i) => {
      const s = st.state[i], label = t('ch8.tile.cw', { i: i + 1, state: s === 0 ? t('ch8.state.ok', { v: hex(v) }) : s === 1 ? t('ch8.state.gone') : t('ch8.state.bad', { v: hex(v) }) });
      const b = tile(cEl, s === 1 ? 'gone' : s === 2 ? 'bad' : '', s === 1 ? '?' : hex(v), label, () => { if (st.state[i] === 0) st.state[i] = 1; else if (st.state[i] === 1) setErr(i); else st.state[i] = 0; render(); });
      b.innerHTML = (s === 1 ? '?' : hex(v)) + '<small>α' + sup(i) + '</small>';
    });
    const dec = RS.decode(recv), sN = st.state.filter(x => x === 1).length, eN = st.state.filter(x => x === 2).length, b = 2 * eN + sN;
    const right = dec.ok && dec.msg.every((v, i) => v === st.msg[i]);
    const oEl = $('#rsOut'); oEl.textContent = '';
    st.msg.forEach((v, i) => { if (dec.ok) tile(oEl, 'static ' + (dec.msg[i] === v ? 'fix' : 'bad'), hex(dec.msg[i])); else tile(oEl, 'static gone', '?'); });
    put('#rsS', fmt(sN)); put('#rsE', fmt(eN)); put('#rsBudget', fmt(b));
    put('#rsOk', t(right ? 'ch8.unit.ok' : dec.ok ? 'ch8.unit.wrong' : 'ch8.unit.fail'));
    let key;
    if (sN === 0 && eN === 0) key = 'ch8.say.clean';
    else if (right && eN === 0) key = 'ch8.say.erase';
    else if (right) key = 'ch8.say.fixed';
    else key = dec.ok ? 'ch8.say.wrong' : 'ch8.say.fail';
    const pos = st.state.map((x, i) => x === 2 ? i + 1 : 0).filter(Boolean).join(', ');
    putHTML('#rsSay', t(key, { s: fmt(sN), e: fmt(eN), b: fmt(b), left: fmt(15 - sN), pos }));
  }
  on('#rsErase', 'click', () => { const ok = []; st.state.forEach((x, i) => { if (!x) ok.push(i); }); for (let j = 0; j < 3 && ok.length; j++) st.state[ok.splice(r.int(ok.length), 1)[0]] = 1; render(); });
  on('#rsErr', 'click', () => { const ok = []; st.state.forEach((x, i) => { if (!x) ok.push(i); }); if (ok.length) setErr(ok[r.int(ok.length)]); render(); });
  on('#rsClear', 'click', () => { st.state.fill(0); render(); });
  textFns.push(render);
  render();
})();

/* ═════════ 09 belief propagation, step by step ═════════ */
(() => {
  const tg = $('#tgCv'), bp = $('#bpCv'), sE = $('#bpE');
  const small = M.ldpcBuild(16), big = M.ldpcBuild(512);
  let seed = M.SEEDS.bpFrame, st = null;
  function frameOf(code, eb, sd) {
    const r = M.rng(sd), s = M.ber.sigma(eb, code.rate), u = new Uint8Array(code.k);
    for (let i = 0; i < code.k; i++) u[i] = r() < 0.5 ? 1 : 0;
    const c = M.ldpcEncode(code, u), llr = new Float64Array(code.n);
    for (let v = 0; v < code.n; v++) { const y = (c[v] ? -1 : 1) + s * r.gauss(); llr[v] = 2 * y / (s * s); }
    return { c, d: M.ldpcDecode(code, llr, 50, c, true) };
  }
  function model() { const eb = +sE.value; st = { it: 0, s: frameOf(small, eb, seed), b: frameOf(big, eb, 1000 + seed) }; }
  const unsat = it => { const post = st.s.d.posts[it]; let u = 0; for (const vs of small.chk) { let x = 0; for (const v of vs) x ^= post[v] < 0 ? 1 : 0; u += x; } return u; };
  const wrong = it => { const post = st.s.d.posts[it]; let w = 0; for (let v = 0; v < small.n; v++) w += (post[v] < 0 ? 1 : 0) ^ st.s.c[v]; return w; };
  model();
  const sim = reg([tg, bp], {
    draw() {
      { // Tanner graph
        const { c, w, h } = fit(tg), post = st.s.d.posts[st.it], n = small.n, m = small.m;
        const bx = v => 12 + (w - 24) * (v + 0.5) / n, cx = j => 12 + (w - 24) * (j + 0.5) / m, by = 22, cy = h - 22;
        const unsatC = small.chk.map(vs => vs.reduce((x, v) => x ^ (post[v] < 0 ? 1 : 0), 0));
        c.lineWidth = 1;
        small.chk.forEach((vs, j) => { c.strokeStyle = unsatC[j] ? 'rgba(233,185,73,.55)' : 'rgba(163,170,184,.22)'; for (const v of vs) { c.beginPath(); c.moveTo(bx(v), by); c.lineTo(cx(j), cy); c.stroke(); } });
        const r = Math.max(3, Math.min(7, (w - 24) / n * 0.36));
        for (let v = 0; v < n; v++) { const ok = ((post[v] < 0 ? 1 : 0) === st.s.c[v]); c.globalAlpha = 0.3 + 0.7 * Math.min(1, Math.abs(post[v]) / 8); dot(c, bx(v), by, ok ? C.green : C.red, r); }
        c.globalAlpha = 1;
        const q = Math.max(6, Math.min(12, (w - 24) / m * 0.5));
        small.chk.forEach((vs, j) => { if (unsatC[j]) { c.fillStyle = C.gold; c.fillRect(cx(j) - q / 2, cy - q / 2, q, q); } else { c.strokeStyle = C.mute; c.lineWidth = 1.4; c.strokeRect(cx(j) - q / 2, cy - q / 2, q, q); } });
      }
      { // the 1024-bit code: wrong bits after each iteration
        const { c, w, h } = fit(bp), tr = st.b.d.trace, n = Math.max(5, tr.length - 1), yMax = Math.max(10, Math.ceil(Math.max(...tr) / 10) * 10);
        const f = frame(w, h, [22, 12, 32, 44], 0, n, 0, yMax);
        yTicks(c, f, [0, yMax / 2, yMax], v => fmt(v)); axes(c, f, t('ch9.bp.cv.x'), t('ch9.bp.cv.y'), { xLabDy: 24 });
        xTicks(c, f, [0, n], v => fmt(v));
        path(c, tr.map((y, i) => [i, y]), f.X, f.Y, C.violet, 1.8);
        const it = Math.min(st.it, tr.length - 1); dot(c, f.X(it), f.Y(tr[it]), C.violet, 4);
      }
    }
  });
  function text() {
    const it = st.it, w = wrong(it), u = unsat(it), last = it === st.s.d.posts.length - 1, tr = st.b.d.trace;
    put('#bpEo', db(+sE.value, 2)); put('#bpIt', fmt(it)); put('#bpWrong', fmt(w)); put('#bpUnsat', fmt(u));
    put('#bpBig', t('ch9.bp.unit.big', { a: fmt(tr[0]), b: fmt(tr[tr.length - 1]), it: fmt(st.b.d.iters) }));
    let key;
    if (u === 0) key = w === 0 ? (it === 0 ? 'ch9.bp.say.okstart' : 'ch9.bp.say.ok') : 'ch9.bp.say.wrongcw';
    else if (it === 0) key = 'ch9.bp.say.start';
    else key = last ? 'ch9.bp.say.stuck' : 'ch9.bp.say.running';
    putHTML('#bpSay', t(key, { it: fmt(it), w: fmt(w), u: fmt(u) }));
    $('#bpStep').setAttribute('aria-disabled', String(last));
  }
  sim.text = text;
  on('#bpStep', 'click', () => { if (st.it < st.s.d.posts.length - 1) st.it++; sim.dirty = true; text(); });
  on('#bpNew', 'click', () => { seed++; model(); sim.dirty = true; text(); });
  sE.addEventListener('input', () => { model(); sim.dirty = true; text(); });
  text();
})();

/* ═════════ 09 the BER waterfall: seeded Monte Carlo, time-sliced, only while on screen ═════════ */
const BER = M.berPlan;
(() => {
  const cv = $('#brCv'), sIt = $('#brIt'), bRun = $('#brRun'), codes = new Map(), LIM = M.biawgnLimitDb(0.5), UNC = M.ebn0.bpskForBer(BER.TARGET);
  const code = k => { if (!codes.has(k)) codes.set(k, M.ldpcBuild(k)); return codes.get(k); };
  const st = { res: { uncoded: [], ldpc: [], conv: [] }, queue: [], run: null, cur: null, running: true, stopped: {} };
  const k = () => +radioVal('brN');
  function queueScheme(s) { st.res[s] = []; st.stopped[s] = false; st.queue = st.queue.filter(q => q.s !== s); BER.PTS[s].forEach((x, i) => st.queue.push({ s, i })); }
  function reset(all) {
    if (all) { st.queue = []; ['uncoded', 'ldpc', 'conv'].forEach(queueScheme); }
    else { queueScheme('ldpc'); st.queue.sort((a, b) => ['uncoded', 'ldpc', 'conv'].indexOf(a.s) - ['uncoded', 'ldpc', 'conv'].indexOf(b.s)); }
    if (st.cur && (all || st.cur.s === 'ldpc')) { st.run = null; st.cur = null; }
    shared.done = false; shared.ldpcX = null; shared.convX = null; shared.listeners.forEach(f => f());
  }
  reset(true);
  const done = () => !st.run && !st.queue.length;
  function finish() {
    shared.done = true; shared.n = code(k()).n;
    shared.ldpcX = BER.cross(st.res.ldpc); shared.convX = BER.cross(st.res.conv); shared.uncX = UNC; shared.lim = LIM;
    shared.listeners.forEach(f => f());
  }
  function work(budget) {
    const t0 = performance.now();
    while (performance.now() - t0 < budget) {
      if (!st.run) {
        let q; do { q = st.queue.shift(); } while (q && st.stopped[q.s]);
        if (!q) { finish(); return; }
        st.cur = q; st.run = BER.makeRun(q.s, q.i, q.s === 'ldpc' ? code(k()) : null, +sIt.value);
      }
      M.ber.stepRun(st.run, 1);
      if (st.run.done) { const r = M.ber.result(st.run); st.res[st.cur.s].push(r); if (!r.errs) st.stopped[st.cur.s] = true; st.run = null; st.cur = null; sim.dirty = true; if (done()) { finish(); return; } }
    }
  }
  const sim = reg(cv, {
    step() { if (st.running && !done()) { work(11); this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 38, 48], -1, 10, -6, 0);
      yTicks(c, f, [-6, -5, -4, -3, -2, -1, 0], v => v === 0 ? '1' : '10' + sup(v)); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
      xTicks(c, f, [0, 2, 4, 6, 8, 10], v => fmt(v), true);
      hline(c, f, -4, C.line, [2, 3]);
      vline(c, f, LIM, C.red);
      const th = []; for (let x = -1; x <= 10; x += 0.1) { const b = M.ebn0.bpskBer(M.undB(x)); if (b > 1e-6) th.push([x, lg(b)]); }
      path(c, th, f.X, f.Y, C.mute, 1.6);
      const draw = (res, col, line) => {
        const pts = res.filter(r => r.errs).map(r => [r.ebn0dB, lg(r.ber)]);
        if (line && pts.length > 1) { c.globalAlpha = 0.6; path(c, pts, f.X, f.Y, col, 1.4); c.globalAlpha = 1; }
        for (const r of res) {
          if (r.errs) { c.globalAlpha = r.fe < 10 ? 0.45 : 1; dot(c, f.X(r.ebn0dB), f.Y(lg(r.ber)), col, 4.5); c.globalAlpha = 1; }
          else { const x = f.X(r.ebn0dB), y = f.Y(Math.max(-6, lg(1 / r.bits))); c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 5, y - 4); c.lineTo(x + 5, y - 4); c.lineTo(x, y + 5); c.closePath(); c.stroke(); }
        }
      };
      draw(st.res.uncoded, C.ink, false); draw(st.res.conv, C.cyan, true); draw(st.res.ldpc, C.gold, true);
    }
  });
  function text() {
    const n = code(k()).n, tot = BER.PTS.uncoded.length + BER.PTS.ldpc.length + BER.PTS.conv.length;
    let pts = 0, bits = 0; for (const s in st.res) { pts += st.res[s].length; for (const r of st.res[s]) bits += r.bits; }
    for (const s in st.stopped) if (st.stopped[s]) pts += BER.PTS[s].length - st.res[s].length;
    put('#brIto', fmt(+sIt.value));
    bRun.setAttribute('aria-pressed', String(st.running)); bRun.textContent = t(st.running ? 'ch9.btn.pause' : 'ch9.btn.resume');
    const L = done() ? BER.cross(st.res.ldpc) : null, Cv = BER.cross(st.res.conv), convDone = !st.queue.some(q => q.s === 'conv') && !(st.cur && st.cur.s === 'conv');
    put('#brL', done() ? (L == null ? t('u.none') : db(L, 2)) : t('u.wait'));
    put('#brCv4', convDone ? (Cv == null ? t('u.none') : db(Cv, 2)) : t('u.wait'));
    put('#brU', db(UNC, 2));
    put('#brGap', done() && L != null ? db(L - LIM, 2) : done() ? t('u.none') : t('u.wait'));
    let key;
    if (!done()) key = st.running ? 'ch9.say.running' : 'ch9.say.paused';
    else key = L != null ? 'ch9.say.done' : 'ch9.say.nocross';
    putHTML('#brSay', t(key, { pts: fmt(pts), tot: fmt(tot), bits: fmt(bits), n: fmt(n), l: L == null ? '' : db(L, 2), c: Cv == null ? t('u.none') : db(Cv, 2), u: db(UNC, 2), gap: L == null ? '' : db(L - LIM, 2), it: fmt(+sIt.value) }));
  }
  sim.text = text;
  radios('brN').forEach(r => r.addEventListener('change', () => { reset(false); sim.dirty = true; text(); }));
  sIt.addEventListener('change', () => { reset(false); sim.dirty = true; text(); });
  sIt.addEventListener('input', () => put('#brIto', fmt(+sIt.value)));
  bRun.addEventListener('click', () => { st.running = !st.running; text(); });
  window.__wireBER = { state: st, done, cross: BER.cross };
  text();
})();

/* ═════════ 10 polarisation ═════════ */
(() => {
  const cv = $('#plCv'), sE = $('#plE'), sN = $('#plN'), cache = new Map();
  function curve(eps, n) { // sorted erasure probabilities, sampled at 400 quantiles
    const key = eps + ':' + n; if (cache.has(key)) return cache.get(key);
    const z = Float64Array.from(M.polarBEC(eps, n)).sort(), N = z.length, out = [];
    const S = Math.min(N, 400); for (let i = 0; i < S; i++) { const j = Math.min(N - 1, Math.floor((i + 0.5) * N / S)); out.push([(j + 0.5) / N, z[j]]); }
    if (N <= 400) { out.length = 0; for (let j = 0; j < N; j++) out.push([j / N, z[j]], [(j + 1) / N, z[j]]); }
    if (cache.size > 40) cache.clear(); cache.set(key, out); return out;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), eps = +sE.value, n = +sN.value, f = frame(w, h, [26, 14, 38, 44], 0, 1, 0, 1);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
      xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100) + '%', true);
      for (const l of [1, 2, 4, 8, 12, 16]) if (l < n) path(c, curve(eps, l), f.X, f.Y, '#4a5266', 1.3);
      vline(c, f, 1 - eps, C.green);
      path(c, curve(eps, n), f.X, f.Y, C.gold);
    }
  });
  function text() {
    const eps = +sE.value, n = +sN.value, s = M.polarStats(eps, n);
    put('#plEo', fmt(eps, 2)); put('#plNo', t('ch10.unit.n', { n: fmt(n), N: fmt(s.N) }));
    put('#plGood', pct(s.good, 1)); put('#plBad', pct(s.bad, 1)); put('#plMid', pct(s.mid, 1)); put('#plCap', pct(s.capacity, 0));
    const v = { N: fmt(s.N), good: pct(s.good, 1), bad: pct(s.bad, 1), mid: pct(s.mid, 1), cap: pct(s.capacity, 0), z1: fmt(2 * eps - eps * eps, 4), z0: fmt(eps * eps, 4) };
    putHTML('#plSay', t(n === 1 ? 'ch10.say.one' : 'ch10.say', v));
  }
  sim.text = text;
  [sE, sN].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ═════════ 11 QAM constellations; adaptive modulation ═════════ */
(() => {
  const cv = $('#qmCv'), sS = $('#qmS'), NS = 2000;
  let sm = null;
  const Mv = () => +radioVal('qmM');
  const model = () => { sm = M.qam.simulate(Mv(), +sS.value, NS, M.SEEDS.qam); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), Mq = Mv(), m = Math.sqrt(Mq), a = M.qam.scale(Mq), side = Math.min(w, h) - 16, ox = (w - side) / 2, oy = (h - side) / 2, R = 1.75;
      const X = v => ox + side * (v + R) / (2 * R), Y = v => oy + side * (R - v) / (2 * R);
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(ox, oy, side, side);
      c.beginPath(); c.moveTo(X(0), oy); c.lineTo(X(0), oy + side); c.moveTo(ox, Y(0)); c.lineTo(ox + side, Y(0)); c.stroke();
      const pr = Mq >= 1024 ? 0.9 : 1.6;
      for (let i = 0; i < NS; i++) {
        const xi = sm.pts[4 * i], xq = sm.pts[4 * i + 1], yi = sm.pts[4 * i + 2], yq = sm.pts[4 * i + 3];
        const sl = v => clamp(2 * Math.round((v / a - 1) / 2) + 1, -(m - 1), m - 1) * a, bad = Math.abs(sl(yi) - xi) > a / 2 || Math.abs(sl(yq) - xq) > a / 2; // points are stored as float32
        c.fillStyle = bad ? C.red : 'rgba(99,199,230,.55)'; c.fillRect(X(yi) - pr / 2 - 0.4, Y(yq) - pr / 2 - 0.4, pr + 0.8, pr + 0.8);
      }
      c.fillStyle = C.ink; const ir = Mq >= 1024 ? 0.7 : Mq >= 256 ? 1.2 : 2.4;
      for (let p = 0; p < m; p++) for (let q = 0; q < m; q++) { const x = (2 * p - (m - 1)) * a, y = (2 * q - (m - 1)) * a; c.fillRect(X(x) - ir, Y(y) - ir, 2 * ir, 2 * ir); }
    }
  });
  function text() {
    const Mq = Mv(), s = +sS.value, ex = M.qam.serExact(Mq, M.undB(s)), need = M.qam.snrFor(Mq, 1e-3);
    put('#qmSo', db(s, 0)); put('#qmBits', fmt(Math.log2(Mq))); put('#qmSer', prob(sm.ser)); put('#qmExact', prob(ex)); put('#qmNeed', db(need, 1));
    const v = { M: fmt(Mq), snr: fmt(s), e: fmt(sm.errors), ex: prob(ex), ser: prob(sm.ser), need: db(need, 1) };
    putHTML('#qmSay', t(ex <= 1e-3 ? 'ch11.say.ok' : 'ch11.say.bad', v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  sS.addEventListener('input', redo); radios('qmM').forEach(r => r.addEventListener('change', redo));
  text();
})();

(() => {
  const cv = $('#amCv'), sS = $('#amS'), sV = $('#amV'), sD = $('#amD'), cO = $('#amO'), SLOT = 0.5;
  let res = null;
  const model = () => { res = M.amc.run(+sS.value, +sV.value, +sD.value, 2, M.SEEDS.amc, cO.checked); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), N = res.snrDb.length, f = frame(w, h, [26, 14, 38, 40], 0, N * SLOT, -10, 45);
      yTicks(c, f, [-10, 0, 10, 20, 30, 40], v => fmt(v)); axes(c, f, t('ch11.am.cv.x'), t('ch11.am.cv.y'));
      xTicks(c, f, [0, 250, 500, 750, 1000], v => fmt(v), true);
      const step = Math.max(1, Math.floor(N / Math.max(200, f.R - f.L)));
      const sp = []; for (let i = 0; i < N; i += step) sp.push([i * SLOT, clamp(res.snrDb[i], -10, 45)]);
      path(c, sp, f.X, f.Y, C.cyan, 1.3);
      c.strokeStyle = C.gold; c.lineWidth = 1.6; c.beginPath(); let pen = false;
      for (let i = 0; i < N; i++) { const q = res.pick[i]; if (q < 0) { pen = false; continue; } const y = f.Y(res.req[q]); if (!pen) { c.moveTo(f.X(i * SLOT), y); pen = true; } else c.lineTo(f.X(i * SLOT), y); c.lineTo(f.X((i + 1) * SLOT), y); }
      c.stroke();
      c.fillStyle = C.red; for (let i = 0; i < N; i++) if (res.pick[i] >= 0 && !res.ok[i]) c.fillRect(f.X(i * SLOT) - 1, f.B - 7, 2, 6);
    }
  });
  function text() {
    const v = +sV.value, d = +sD.value, N = res.pick.length;
    let top = 0; for (const q of res.pick) if (q >= 9) top++;
    const off = res.offs.reduce((a, b) => a + b, 0) / N;
    put('#amSo', db(+sS.value, 0)); put('#amVo', t('ch11.am.unit.v', { v: fmt(v) })); put('#amDo', t('ch11.am.unit.d', { v: fmt(d), ms: fmt(d * SLOT, 1) }));
    put('#amT', fmt(res.throughput, 2)); put('#amSh', fmt(res.shannon, 2)); put('#amBl', pct(res.bler, 1)); put('#amTop', pct(top / N, 0));
    const vars = { v: fmt(v), ms: fmt(d * SLOT, 1), t: fmt(res.throughput, 2), sh: fmt(res.shannon, 2), pct: pct(res.throughput / res.shannon), bl: pct(res.bler, 1), off: db(Math.abs(off), 2) };
    putHTML('#amSay', t(!cO.checked ? 'ch11.am.say.noolla' : off > 0 ? 'ch11.am.say.olla' : 'ch11.am.say.ollaless', vars));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sS, sV, sD].forEach(e => e.addEventListener('input', redo)); cO.addEventListener('change', redo);
  text();
})();

/* ═════════ 12 MIMO ═════════ */
(() => {
  const cv = $('#mmCv'), sT = $('#mmT'), sR = $('#mmR'), sS = $('#mmS'), sets = new Map();
  let draw = 0;
  const set = (nt, nr) => { const k = nt + 'x' + nr; if (!sets.has(k)) sets.set(k, M.mimo.gainSet(nt, nr, 200, M.SEEDS.mimo)); return sets.get(k); };
  const cap = (nt, nr, s) => M.mimo.capOfSet(set(nt, nr), nt, s);
  const sample = () => { const nt = +sT.value, nr = +sR.value; return draw === 0 ? set(nt, nr)[0] : M.mimo.gains(M.mimo.channel(nr, nt, M.rng(300 + draw))); };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), nt = +sT.value, nr = +sR.value, s = +sS.value, split = h * 0.62;
      const yMax = Math.max(10, Math.ceil(cap(nt, nr, 30) / 10) * 10);
      const f = frame(w, split, [26, 14, 30, 40], 0, 30, 0, yMax);
      yTicks(c, f, [0, yMax / 2, yMax], v => fmt(v)); axes(c, f, t('ch12.cv.x'), t('ch12.cv.y'), { xLabDy: 24 });
      xTicks(c, f, [0, 10, 20, 30], v => fmt(v), true);
      const cu = (a, b) => { const p = []; for (let x = 0; x <= 30; x += 1) p.push([x, cap(a, b, x)]); return p; };
      path(c, cu(1, 1), f.X, f.Y, C.mute, 1.6); path(c, cu(nt, nr), f.X, f.Y, C.gold);
      dot(c, f.X(s), f.Y(cap(nt, nr, s)), C.gold);
      const g = sample().slice().sort((a, b) => b - a), gm = Math.max(1, ...g) * 1.2;
      const f2 = frame(w, h, [split + 28, 14, 12, 40], 0, g.length, 0, gm);
      axes(c, f2, '', t('ch12.cv.g'));
      const bw = Math.min(40, (f2.R - f2.L) / g.length * 0.6);
      g.forEach((v, i) => { const x = f2.L + (f2.R - f2.L) * (i + 0.5) / g.length; c.fillStyle = C.cyan; c.fillRect(x - bw / 2, f2.Y(v), bw, f2.B - f2.Y(v)); c.fillStyle = C.mute; c.textAlign = 'center'; if (f2.Y(v) - 8 > f2.T - 6) c.fillText(fmt(v, 1), x, f2.Y(v) - 8); });
    }
  });
  function text() {
    const nt = +sT.value, nr = +sR.value, s = +sS.value, Cc = cap(nt, nr, s), Cs = cap(1, 1, s), slope = cap(nt, nr, s + 3) - Cc, m = Math.min(nt, nr);
    put('#mmTo', fmt(nt)); put('#mmRo', fmt(nr)); put('#mmSo', db(s, 0));
    put('#mmC', fmt(Cc, 2)); put('#mmSiso', fmt(Cs, 2)); put('#mmX', t('u.x', { v: fmt(Cc / Cs, 2) })); put('#mmSlope', fmt(slope, 2));
    const v = { nt: fmt(nt), nr: fmt(nr), snr: fmt(s), c: fmt(Cc, 2), x: t('u.x', { v: fmt(Cc / Cs, 2) }), slope: fmt(slope, 2), m: fmt(m) };
    putHTML('#mmSay', t(m === 1 ? 'ch12.say.one' : 'ch12.say', v));
  }
  sim.text = text;
  [sT, sR, sS].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  on('#mmNew', 'click', () => { draw++; sim.dirty = true; });
  [sT, sR].forEach(e => e.addEventListener('input', () => { draw = 0; }));
  text();
})();

/* ═════════ 13 frontier ═════════ */
(() => {
  const cv = $('#frCv'), LIM = M.biawgnLimitDb(0.5);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const rows = [['ch13.bar.chung', 0.0045, C.green], ['ch13.bar.chungsim', 0.04, C.green], ['ch13.bar.turbo', 0.7 - LIM, C.cyan]];
      if (shared.done && shared.ldpcX != null) rows.push([t('ch13.bar.ldpc', { n: fmt(shared.n) }), shared.ldpcX - LIM, C.gold, true]);
      if (shared.done && shared.convX != null) rows.push(['ch13.bar.conv', shared.convX - LIM, C.gold]);
      const mx = Math.max(3.5, ...rows.map(r => r[1] + 0.3)), f = frame(w, h, [10, 56, 34, 12], 0, mx, 0, 1);
      const xt = []; for (let v = 0; v <= mx; v += mx > 6 ? 2 : 1) xt.push(v);
      xTicks(c, f, xt, v => fmt(v)); axes(c, f, t('ch13.cv.x'), '');
      const rh = Math.min(64, (f.B - f.T) / 5);
      rows.forEach(([key, v, col, raw], i) => {
        const y = f.T + rh * i + 4;
        c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(raw ? key : t(key), f.L + 2, y + 8);
        c.fillStyle = col; const bw = Math.max(2, f.X(v) - f.L); c.fillRect(f.L, y + 18, bw, 14);
        c.fillStyle = C.mute; c.fillText(db(v, v < 0.1 ? 4 : 2), f.L + bw + 6, y + 25);
      });
    }
  });
  function text() {
    putHTML('#frSay', shared.done && shared.ldpcX != null ? t('ch13.say.done', { n: fmt(shared.n), gap: db(shared.ldpcX - LIM, 2), cgap: shared.convX != null ? db(shared.convX - LIM, 2) : t('u.none') }) : t('ch13.say.pending'));
  }
  sim.text = text;
  shared.listeners.push(() => { sim.dirty = true; text(); });
  function facts() {
    const data = (COPY[lang] && COPY[lang].frontier) || COPY.zh.frontier;
    const lists = { std: $('#frStd'), fibre: $('#frFibre'), next: $('#frNext'), comp: $('#frComp') };
    Object.values(lists).forEach(l => { l.textContent = ''; });
    for (const f of data) {
      const li = document.createElement('li'), tag = document.createElement('span'), when = document.createElement('span');
      tag.className = 'tag ' + f.tag; tag.textContent = t('ch13.tag.' + f.tag);
      when.className = 'when'; when.textContent = f.when;
      li.appendChild(tag); li.appendChild(document.createTextNode(f.text)); li.appendChild(when);
      lists[f.group].appendChild(li);
    }
  }
  textFns.push(facts);
  facts(); text();
})();

/* ═════════ 14 spec-sheet checker ═════════ */
(() => {
  const sB = $('#scB'), sN = $('#scN'), sS = $('#scS'), sC = $('#scC');
  const BW = [1, 2, 5, 10, 20, 40, 80, 100, 160, 200, 320, 400, 800, 1000, 2000].map(x => x * 1e6);
  let exact = M.wifi7.phyRate(16); // a preset's exact claim; cleared when the reader moves the claim slider
  const claim = () => exact != null ? exact : Math.pow(10, +sC.value) * 1e9;
  const PRESET = {
    scWifi: { b: 10, n: 16, s: 38, c: M.wifi7.phyRate(16) },
    sc5g: { b: 7, n: 4, s: 30, c: 4 * 100e6 * M.CQI4[14].eff },
    scAd: { b: 4, n: 1, s: 30, c: 1e9 }
  };
  function text() {
    const B = BW[+sB.value], n = +sN.value, s = +sS.value, cl = claim(), bound = M.spec.bound(B, n, s), need = M.spec.snrNeeded(cl, B, n), share = cl / bound;
    put('#scBo', hz(B, 0)); put('#scNo', fmt(n)); put('#scSo', db(s, 0)); put('#scCo', rate(cl));
    put('#scBound', rate(bound)); put('#scClaim', t('u.eff', { v: fmt(cl / (n * B), 2) })); put('#scNeed', db(need, 1)); put('#scShare', pct(share, 0));
    const v = { claim: rate(cl), n: fmt(n), b: hz(B, 0), eta: fmt(cl / (n * B), 2), need: db(need, 1), snr: fmt(s), bound: rate(bound), share: pct(share, 0) };
    putHTML('#scSay', t(share > 1 ? 'ch14.say.over' : share > 0.8 ? 'ch14.say.tight' : 'ch14.say.ok', v));
  }
  for (const id in PRESET) on('#' + id, 'click', () => { const p = PRESET[id]; sB.value = p.b; sN.value = p.n; sS.value = p.s; exact = p.c; sC.value = Math.log10(p.c / 1e9).toFixed(2); text(); });
  [sB, sN, sS].forEach(e => e.addEventListener('input', text));
  sC.addEventListener('input', () => { exact = null; text(); });
  textFns.push(text);
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  runJobs(10);
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
