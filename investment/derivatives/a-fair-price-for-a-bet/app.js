/* A fair price for a bet: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows computing/systems/how-a-cpu-does-math/app.js. */
(() => {
'use strict';
const M = window.FairBetModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EX = M.EX, B = EX.base;

/* ───────── language ─────────
   content.en.md may be a structural stub while the translation is pending. page.json then declares
   "languages": {"en": "stub"}, the build writes data-lang-en="stub" on <html>, and the page treats English as absent
   (falls back to Chinese and says so in <html lang>). specs/site-template.md §3a, §9a. */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const fmt = (x, d) => M.fmt(x, d, effLang());
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
const yuan = (x, d) => t('u.money', { v: fmt(x, d == null ? 2 : d) });
const syuan = (x, d) => t('u.money', { v: M.signed(x, d == null ? 2 : d, effLang()) });
const times = (x, d) => t('u.x', { v: fmt(x, d == null ? 1 : d) });
const years = (x, d) => t('u.yr', { v: fmt(x, d == null ? 2 : d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') });
const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + on-screen registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
let lastT = 0;
function loop(now) {
  const dt = Math.min(0.1, lastT ? (now - lastT) / 1000 : 0); lastT = now;
  for (const s of sims) if (s.vis) { if (s.step && s.step(dt)) s.dirty = true; if (s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(loop);
}
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const val = id => +$('#' + id).value;
const out = (id, s) => put('#' + id + 'o', s);

/* chart helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], Bt = h - m[2];
  return { L, R, T, B: Bt, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => Bt - (Bt - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 30); }
}
function xTicks(c, f, items) { // items: [x, label]; labels that would collide are skipped
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 1 || py > f.B + 1) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function nice(lo, hi, n) { // about n round tick values covering [lo, hi]
  const span = hi - lo || 1, raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, st = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, o = [];
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-9; v += st) o.push(Math.abs(v) < st * 1e-9 ? 0 : v);
  return { ticks: o, d: Math.max(0, -Math.floor(Math.log10(st) + 1e-9)) };
}
const tk = (lo, hi, n, f) => { const k = nice(lo, hi, n); return k.ticks.map(v => [v, f ? f(v, k.d) : fmt(v, k.d)]); };
function line(c, pts, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of pts) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function clip(c, f, fn) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); fn(); c.restore(); }
const MARG = [28, 14, 40, 50];
const narrow = w => w < 420;

/* ═════════ ch1: a forward and its arbitrage ═════════ */
(function ch1() {
  const cv = $('#c1Cv'); let S = {};
  function update() {
    const r = val('c1R') / 100, q = val('c1Q') / 100, T = val('c1T'), Fq = val('c1F'), a = M.forwardArb(100, r, q, T, Fq);
    S = { r, q, T, Fq, a };
    out('c1R', pct(r, 2)); out('c1Q', pct(q, 2)); out('c1T', years(T)); out('c1F', yuan(Fq));
    put('#c1Fair', yuan(a.fair)); put('#c1Quo', yuan(Fq)); put('#c1Gap', syuan(a.gap)); put('#c1Pro', yuan(a.kind === 'none' ? 0 : a.profit));
    const v = { gap: fmt(a.profit, 2), loan: fmt(a.loan, 2), units: fmt(a.units, 3), fq: fmt(Fq, 2), repay: fmt(a.repay, 2) };
    putHTML('#c1Say', t(a.kind === 'carry' ? 'ch1.say.carry' : a.kind === 'reverse' ? 'ch1.say.reverse' : 'ch1.say.none', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 0, 3, 70, 140);
    xTicks(c, f, [0, 0.5, 1, 1.5, 2, 2.5, 3].map(x => [x, fmt(x, 1)])); yTicks(c, f, tk(70, 140, 7));
    axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
    line(c, [[0, 100], [3, 100]], f, C.mute, 1.2, [4, 4]);
    const pts = []; for (let i = 0; i <= 60; i++) { const x = i / 20; pts.push([x, M.forward(100, S.r, S.q, x)]); }
    clip(c, f, () => line(c, pts, f, C.cyan, 2.2));
    const px = f.X(S.T), py = f.Y(S.Fq), fy = f.Y(S.a.fair);
    if (S.a.kind !== 'none') { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(px, py); c.lineTo(px, fy); c.stroke(); c.setLineDash([]); }
    dot(c, px, fy, C.cyan, 4); dot(c, px, py, C.gold, 6);
  } });
  onAll(['c1R', 'c1Q', 'c1T', 'c1F'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch2: payoffs added up; parity ═════════ */
(function ch2() {
  const cv = $('#c2Cv'); let S = {};
  const LEGCOL = { call: C.violet, put: C.red, stock: C.cyan, bond: C.green };
  function update() {
    const key = radioVal('c2St'), K = val('c2K'), legs = M.strat(key, K);
    const cost = M.legsValue(legs, B.S, B.r, 0, B.sigma, B.T), Cc = M.bs(Object.assign({}, B, { K })).price, Pp = M.bs(Object.assign({}, B, { K, type: 'put' })).price;
    const v0 = M.payoff(legs, 0), vK = M.payoff(legs, K), slope = legs.reduce((s, l) => s + (l.kind === 'call' || l.kind === 'stock' ? l.n : 0), 0);
    S = { key, K, legs };
    out('c2K', yuan(K, 0));
    put('#c2Cost', yuan(cost)); put('#c2Min', yuan(Math.min(v0, vK), 0)); put('#c2Max', slope > 0 ? t('ch2.max.inf') : yuan(Math.max(v0, vK), 0));
    put('#c2C', yuan(Cc)); put('#c2P', yuan(Pp)); put('#c2CP', yuan(Cc - Pp)); put('#c2Rhs', yuan(B.S - K * Math.exp(-B.r * B.T)));
    putHTML('#c2Say', t('ch2.say.' + key, { cost: fmt(cost, 2), k: fmt(K, 0) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), xs = []; for (let s = 40; s <= 160; s += 2) xs.push(s);
    let lo = 0, hi = 10; const tot = xs.map(s => [s, M.payoff(S.legs, s)]);
    const legPts = S.legs.map(l => xs.map(s => [s, M.payoff([l], s)]));
    for (const a of [tot, ...legPts]) for (const [, y] of a) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    const pad = (hi - lo) * 0.08, f = frame(w, h, MARG, 40, 160, lo - pad, hi + pad);
    xTicks(c, f, [40, 60, 80, 100, 120, 140, 160].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(lo, hi, 6));
    axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    line(c, [[40, 0], [160, 0]], f, C.line, 1);
    if (S.legs.length > 1) S.legs.forEach((l, i) => line(c, legPts[i], f, LEGCOL[l.kind], 1.4, [5, 4]));
    line(c, tot, f, C.gold, 3);
    c.strokeStyle = C.mute; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(f.X(S.K), f.T); c.lineTo(f.X(S.K), f.B); c.stroke(); c.setLineDash([]);
  } });
  onAll($$('input[name=c2St]'), 'change', update); $('#c2K').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch3: one step ═════════ */
(function ch3() {
  const cv = $('#c3Cv'); let S = {};
  function update() {
    const p = val('c3P') / 100, u = val('c3U') / 100, d = val('c3D') / 100, K = val('c3K');
    const o = M.oneStep({ S: 100, u, d, r: EX.one.r, T: 1, K, type: 'call' }), naive = o.naive(p), gap = naive - o.price;
    S = { p, o };
    out('c3P', pct(p)); out('c3U', yuan(u * 100, 0)); out('c3D', yuan(d * 100, 0)); out('c3K', yuan(K, 0));
    put('#c3Del', t('u.shares', { v: fmt(o.delta, 3) })); put('#c3B', yuan(-o.B)); put('#c3Pr', yuan(o.price)); put('#c3Na', yuan(naive)); put('#c3Q', pct(o.q, 1)); put('#c3Ret', pct(o.stockReturn(p), 1));
    const v = { p: pct(p), naive: fmt(naive, 2), price: fmt(o.price, 2), gap: fmt(Math.abs(gap), 2), k: fmt(K, 0) };
    putHTML('#c3Say', t(o.fu === 0 ? 'ch3.say.zero' : Math.abs(gap) < 0.005 ? 'ch3.say.eq' : gap > 0 ? 'ch3.say.hi' : 'ch3.say.lo', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = S.o, top = Math.max(5, o.naive(1) * 1.08), f = frame(w, h, MARG, 0, 1, 0, top);
    xTicks(c, f, [0, 0.2, 0.4, 0.6, 0.8, 1].map(x => [x, pct(x)])); yTicks(c, f, tk(0, top, 6));
    axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    line(c, [[0, o.naive(0)], [1, o.naive(1)]], f, C.violet, 2);
    line(c, [[0, o.price], [1, o.price]], f, C.gold, 2.6);
    if (o.fu > 0) { c.strokeStyle = C.mute; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(f.X(o.q), f.Y(o.price)); c.lineTo(f.X(o.q), f.B); c.stroke(); c.setLineDash([]); dot(c, f.X(o.q), f.Y(o.price), C.ink, 3.5); }
    dot(c, f.X(S.p), f.Y(o.naive(S.p)), C.violet, 6);
  } });
  onAll(['c3P', 'c3U', 'c3D', 'c3K'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch4: the tree converging ═════════ */
(function ch4() {
  const cv = $('#c4Cv'), NMAX = 150; let S = {}, cache = {};
  function series(type, am, K) {
    const k = type + am + K; if (cache[k]) return cache[k];
    const a = []; for (let N = 1; N <= NMAX; N++) a.push(M.crr(Object.assign({}, B, { K, N, type, american: am })).price);
    return (cache[k] = a);
  }
  function update() {
    const type = radioVal('c4Ty'), am = $('#c4Am').checked, K = val('c4K'), N = val('c4N');
    const ser = series(type, am, K), eu = am ? series(type, false, K) : ser, bsP = M.bs(Object.assign({}, B, { K, type })).price, tree = ser[N - 1];
    S = { ser, bsP, N };
    out('c4N', t('u.steps', { v: N })); out('c4K', yuan(K, 0));
    put('#c4Tree', yuan(tree, 3)); put('#c4Bs', yuan(bsP, 3)); put('#c4Diff', syuan(tree - bsP, 3)); put('#c4Early', am ? yuan(tree - eu[N - 1], 3) : '—');
    const v = { n: N, tree: fmt(tree, 3), bs: fmt(bsP, 3), diff: fmt(Math.abs(tree - bsP), 3), early: fmt(tree - eu[N - 1], 3) };
    putHTML('#c4Say', t(!am ? 'ch4.say.eu' : type === 'put' ? 'ch4.say.amPut' : 'ch4.say.amCall', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), ser = S.ser;
    let lo = Math.min(S.bsP, ...ser.slice(2)), hi = Math.max(S.bsP, ...ser.slice(2)); const pad = Math.max(0.05, (hi - lo) * 0.15); lo -= pad; hi += pad;
    const f = frame(w, h, MARG, 1, NMAX, lo, hi);
    xTicks(c, f, [1, 25, 50, 75, 100, 125, 150].map(x => [x, String(x)])); yTicks(c, f, tk(lo, hi, 5));
    axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    line(c, [[1, S.bsP], [NMAX, S.bsP]], f, C.cyan, 1.6);
    clip(c, f, () => line(c, ser.map((y, i) => [i + 1, y]), f, C.gold, 1.5));
    const y = Math.min(hi, Math.max(lo, ser[S.N - 1])); dot(c, f.X(S.N), f.Y(y), C.gold, 6);
  } });
  onAll($$('input[name=c4Ty]'), 'change', update); onAll(['c4Am', 'c4N', 'c4K'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch5: geometric Brownian motion ═════════ */
(function ch5() {
  const cv = $('#c5Cv'), hv = $('#c5Hv'); let S = {}, seed = 1, prog = 1;
  function update() {
    const mu = val('c5Mu') / 100, sigma = val('c5Sig') / 100, T = val('c5T'), st = M.gbmStats(100, mu, sigma, T);
    S = { mu, sigma, T, st, paths: M.gbmPaths({ S: 100, mu, sigma, T, steps: 120, paths: 30, seed }), term: M.gbmTerminal({ mu, sigma, T, paths: 4000, seed: seed + 77 }) };
    out('c5Mu', pct(mu)); out('c5Sig', pct(sigma)); out('c5T', years(T));
    put('#c5Band', fmt(st.lo, 0) + ' – ' + fmt(st.hi, 0)); put('#c5Med', yuan(st.median, 1)); put('#c5Mean', yuan(st.mean, 1)); put('#c5Below', pct(st.pBelow));
    const v = { t: years(T), lo: fmt(st.lo, 0), hi: fmt(st.hi, 0), median: fmt(st.median, 1), mean: fmt(st.mean, 1), below: pct(st.pBelow) };
    putHTML('#c5Say', t(st.median >= 100 ? 'ch5.say.up' : st.mean > 100 ? 'ch5.say.drag' : 'ch5.say.down', v));
    sim.dirty = true;
  }
  const sim = reg([cv, hv], {
    step(dt) { if (prog >= 1) return false; prog = Math.min(1, prog + dt / 1.4); return true; },
    draw() {
      { const { c, w, h } = fit(cv), st = S.st, top = Math.min(600, Math.max(160, 100 * Math.exp(st.logMean + 2.3 * st.logSd)));
        const bot = Math.max(0, Math.floor(100 * Math.exp(st.logMean - 2.6 * st.logSd) / 20) * 20), f = frame(w, h, MARG, 0, S.T, bot, top);
        xTicks(c, f, tk(0, S.T, 5)); yTicks(c, f, tk(bot, top, 5)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
        const band = [], lowr = [], med = [];
        for (let i = 0; i <= 60; i++) { const x = S.T * i / 60, g = M.gbmStats(100, S.mu, S.sigma, Math.max(x, 1e-9)); band.push([x, g.hi]); lowr.push([x, g.lo]); med.push([x, g.median]); }
        clip(c, f, () => {
          c.fillStyle = 'rgba(99,199,230,.22)'; c.beginPath(); band.forEach(([x, y], i) => (i ? c.lineTo(f.X(x), f.Y(y)) : c.moveTo(f.X(x), f.Y(y)))); lowr.slice().reverse().forEach(([x, y]) => c.lineTo(f.X(x), f.Y(y))); c.closePath(); c.fill();
          const n = Math.max(1, Math.round(120 * prog));
          for (const p of S.paths) { const pts = []; for (let i = 0; i <= n; i++) pts.push([S.T * i / 120, p[i]]); line(c, pts, f, 'rgba(233,185,73,.55)', 1); }
          line(c, band, f, C.cyan, 2); line(c, lowr, f, C.cyan, 2); line(c, med, f, C.cyan, 1.8, [5, 4]);
        });
      }
      { const { c, w, h } = fit(hv), st = S.st, x0 = st.logMean - 4 * st.logSd, x1 = st.logMean + 4 * st.logSd, NB = 40, bw = (x1 - x0) / NB, cnt = new Array(NB).fill(0);
        for (const x of S.term) { const i = Math.floor((x - x0) / bw); if (i >= 0 && i < NB) cnt[i]++; }
        const top = Math.max(...cnt, 4000 * bw * M.pdf(0) / st.logSd) * 1.1, f = frame(w, h, [26, 14, 40, 50], x0, x1, 0, top);
        xTicks(c, f, [-3, -2, -1, 0, 1, 2, 3].map(k => [st.logMean + k * st.logSd, pct(st.logMean + k * st.logSd)])); yTicks(c, f, tk(0, top, 3)); axes(c, f, t('ch5.cv.hx'), t('ch5.cv.hy'));
        c.fillStyle = 'rgba(233,185,73,.55)'; cnt.forEach((n, i) => { const x = f.X(x0 + i * bw), y = f.Y(n); c.fillRect(x + 0.5, y, Math.max(1, f.X(x0 + (i + 1) * bw) - x - 1), f.B - y); });
        const pts = []; for (let i = 0; i <= 80; i++) { const x = x0 + (x1 - x0) * i / 80; pts.push([x, 4000 * bw * M.pdf((x - st.logMean) / st.logSd) / st.logSd]); }
        line(c, pts, f, C.cyan, 2);
      }
    } });
  onAll(['c5Mu', 'c5Sig', 'c5T'].map(i => $('#' + i)), 'input', update);
  $('#c5New').addEventListener('click', () => { seed++; prog = reduce ? 1 : 0; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch6: the PDE by finite differences ═════════ */
(function ch6() {
  const cv = $('#c6Cv'); let S = {};
  function update() {
    const scheme = radioVal('c6Sc'), Mg = +radioVal('c6M'), Nt = val('c6Nt'), frac = val('c6Tau'), sigma = val('c6Sig') / 100;
    const stopAt = Math.round(frac * Nt), res = M.pde({ K: 100, r: B.r, sigma, T: 1, M: Mg, Nt, scheme, stopAt }), tau = res.tau;
    const bsP = M.bs({ S: 100, K: 100, r: B.r, sigma, T: tau }).price, v100 = res.at(100), bad = scheme === 'explicit' && Nt < res.stableNt, okNum = isFinite(v100) && Math.abs(v100) < 1e5;
    S = { res, tau, sigma, Mg };
    out('c6Tau', years(tau)); out('c6Nt', t('u.steps', { v: Nt })); out('c6Sig', pct(sigma));
    put('#c6Pde', okNum ? yuan(v100, 3) : '—'); put('#c6Bs', yuan(bsP, 3)); put('#c6Diff', okNum ? syuan(v100 - bsP, 3) : '—'); put('#c6Need', t('u.steps', { v: fmt(res.stableNt, 0) }));
    const v = { tau: years(tau), pde: okNum ? fmt(v100, 3) : '—', bs: fmt(bsP, 3), diff: okNum ? fmt(Math.abs(v100 - bsP), 3) : '—', nt: Nt, need: fmt(res.stableNt, 0) };
    putHTML('#c6Say', t(stopAt === 0 ? 'ch6.say.zero' : bad ? 'ch6.say.bad' : scheme === 'explicit' ? 'ch6.say.exok' : 'ch6.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, MARG, 40, 160, 0, 70), res = S.res;
    xTicks(c, f, [40, 60, 80, 100, 120, 140, 160].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(0, 70, 7)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    line(c, [[40, 0], [100, 0], [160, 60]], f, C.mute, 1.4);
    const pts = []; for (let s = 40; s <= 160; s += 2) pts.push([s, M.bs({ S: s, K: 100, r: B.r, sigma: S.sigma, T: S.tau }).price]);
    line(c, pts, f, C.cyan, 2);
    clip(c, f, () => {
      const pp = []; for (let i = 0; i <= res.M; i++) { const s = i * res.dS; if (s < 40 || s > 160) continue; const y = res.V[i]; pp.push([s, isFinite(y) ? Math.max(-50, Math.min(150, y)) : NaN]); }
      line(c, pp, f, C.gold, 1.6);
      if (S.Mg <= 60) for (const [x, y] of pp) if (isFinite(y)) dot(c, f.X(x), f.Y(y), C.gold, 2.6);
    });
  } });
  onAll([...$$('input[name=c6Sc]'), ...$$('input[name=c6M]')], 'change', update); onAll(['c6Nt', 'c6Tau', 'c6Sig'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch7: the Greeks ═════════ */
(function ch7() {
  const cv = $('#c7Cv'); let S = {};
  const G = { delta: g => g.delta, gamma: g => g.gamma, vega: g => g.vega / 100, theta: g => g.theta / 365 }, DEC = { delta: 3, gamma: 4, vega: 3, theta: 3 };
  function update() {
    const k = radioVal('c7G'), s = val('c7S'), T = val('c7T') / 52, g = M.bs(Object.assign({}, B, { S: s, T }));
    S = { k, s, T };
    out('c7S', yuan(s, 0)); out('c7T', years(T));
    put('#c7Pr', yuan(g.price)); put('#c7De', fmt(g.delta, 3)); put('#c7Ga', fmt(g.gamma, 4)); put('#c7Ve', yuan(g.vega / 100, 3)); put('#c7Th', yuan(g.theta / 365, 3));
    putHTML('#c7Say', t('ch7.say.' + k, { s: fmt(s, 0), t: years(T), v: fmt(Math.abs(G[k](g)), DEC[k]) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), pts = [], fn = G[S.k];
    for (let s = 60; s <= 140; s += 0.5) pts.push([s, fn(M.bs(Object.assign({}, B, { S: s, T: S.T })))]);
    let lo = Math.min(0, ...pts.map(p => p[1])), hi = Math.max(0, ...pts.map(p => p[1])); if (hi - lo < 1e-9) hi = lo + 1; const pad = (hi - lo) * 0.08; if (lo < 0) lo -= pad; hi += hi > 0 ? pad : 0;
    const f = frame(w, h, MARG, 60, 140, lo, hi);
    xTicks(c, f, [60, 80, 100, 120, 140].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(lo, hi, 5)); axes(c, f, t('ch7.cv.x'), t('ch7.cv.y.' + S.k));
    c.strokeStyle = C.mute; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(f.X(100), f.T); c.lineTo(f.X(100), f.B); c.stroke(); c.setLineDash([]);
    line(c, pts, f, C.cyan, 2.2);
    dot(c, f.X(S.s), f.Y(fn(M.bs(Object.assign({}, B, { S: S.s, T: S.T })))), C.gold, 6);
  } });
  onAll($$('input[name=c7G]'), 'change', update); onAll(['c7S', 'c7T'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch7: delta hedging, many times ═════════ */
(function ch7h() {
  const cv = $('#c7hCv'); let S = {}, seed = EX.hedge.seed; const cache = {}, th = {};
  function update() {
    const n = EX.hedge.NS[val('c7hN')], sr = val('c7hR') / 100, key = n + '|' + sr + '|' + seed;
    const r = cache[key] || (cache[key] = M.hedgeSim(Object.assign({}, B, { sigmaImp: B.sigma, sigmaReal: sr, n, paths: EX.hedge.paths, seed })));
    const theory = th[sr] != null ? th[sr] : (th[sr] = M.hedgeMeanTheory(B.S, B.K, B.r, B.T, B.sigma, sr));
    S = { r };
    out('c7hN', t('u.times', { v: n })); out('c7hR', pct(sr));
    put('#c7hPrem', yuan(r.prem)); put('#c7hMean', syuan(r.mean)); put('#c7hTh', syuan(theory)); put('#c7hSd', yuan(r.sd)); put('#c7hRel', pct(r.sd / r.prem, 1));
    const v = { n, r: pct(sr), mean: M.signed(r.mean, 2, effLang()), se: fmt(r.se, 2), sd: fmt(r.sd, 2), rel: pct(r.sd / r.prem, 1), theory: M.signed(theory, 2, effLang()), loss: fmt(-r.mean, 2) };
    if (sr < B.sigma - 0.005) v.mean = fmt(r.mean, 2);
    putHTML('#c7hSay', t(Math.abs(sr - B.sigma) < 0.005 ? 'ch7.h.say.fair' : sr < B.sigma ? 'ch7.h.say.calm' : 'ch7.h.say.wild', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), X0 = -20, X1 = 20, NB = 80, bw = (X1 - X0) / NB, cnt = new Array(NB).fill(0);
    for (const x of S.r.pnl) cnt[Math.max(0, Math.min(NB - 1, Math.floor((x - X0) / bw)))]++;
    const top = Math.max(...cnt) * 1.1, f = frame(w, h, MARG, X0, X1, 0, top);
    xTicks(c, f, [-20, -15, -10, -5, 0, 5, 10, 15, 20].map(x => [x, M.signed(x, 0, effLang())])); yTicks(c, f, tk(0, top, 4)); axes(c, f, t('ch7.h.cv.x'), t('ch7.h.cv.y'));
    c.fillStyle = 'rgba(233,185,73,.6)'; cnt.forEach((n, i) => { const x = f.X(X0 + i * bw), y = f.Y(n); c.fillRect(x + 0.5, y, Math.max(1, f.X(X0 + (i + 1) * bw) - x - 1), f.B - y); });
    c.strokeStyle = C.mute; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(f.X(0), f.T); c.lineTo(f.X(0), f.B); c.stroke(); c.setLineDash([]);
    const mx = f.X(Math.max(X0, Math.min(X1, S.r.mean))); c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, f.T); c.lineTo(mx, f.B); c.stroke();
  } });
  onAll(['c7hN', 'c7hR'].map(i => $('#' + i)), 'input', update); $('#c7hNew').addEventListener('click', () => { seed++; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch8: the smile from the shipped snapshot ═════════ */
(function ch8() {
  const cv = $('#c8Cv'); let S = {}; const cache = {};
  function update() {
    const e = radioVal('c8E'), sm = cache[e] || (cache[e] = M.smile(e)), i = val('c8K'), p = sm.pts[i];
    const flat = M.black76(sm.F, p.K, sm.D, sm.atm.iv, sm.T, p.type), ratio = p.mid / flat;
    S = { sm, i };
    out('c8K', fmt(p.K, 0));
    put('#c8F', fmt(sm.F, 0)); put('#c8Atm', pct(sm.atm.iv, 1)); put('#c8Iv', pct(p.iv, 1)); put('#c8Mkt', fmt(p.mid, 2)); put('#c8Flat', fmt(flat, 2));
    const v = { k: fmt(p.K, 0), off: pct(Math.abs(p.m - 1), 1), opt: t('opt.' + p.type), mkt: fmt(p.mid, 2), iv: pct(p.iv, 1), atm: pct(sm.atm.iv, 1), flat: fmt(flat, 2), ratio: times(ratio, ratio >= 10 ? 0 : 1) };
    putHTML('#c8Say', t(p === sm.atm ? 'ch8.say.atm' : p.m < 1 ? 'ch8.say.below' : 'ch8.say.above', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), sm = S.sm, ivs = sm.pts.flatMap(p => [p.iv, p.ivB, p.ivA]).filter(isFinite);
    const lo = Math.max(0, Math.min(...ivs) - 0.03), hi = Math.max(...ivs) + 0.03, f = frame(w, h, MARG, 0.66, 1.18, lo, hi);
    xTicks(c, f, [0.7, 0.8, 0.9, 1, 1.1].map(x => [x, fmt(x, 1)])); yTicks(c, f, tk(lo, hi, 5, v => pct(v))); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    line(c, [[0.66, sm.atm.iv], [1.18, sm.atm.iv]], f, C.violet, 1.6, [6, 4]);
    c.strokeStyle = C.mute; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(f.X(1), f.T); c.lineTo(f.X(1), f.B); c.stroke(); c.setLineDash([]);
    clip(c, f, () => { sm.pts.forEach((p, i) => {
      const x = f.X(p.m); if (isFinite(p.ivB) && isFinite(p.ivA)) { c.strokeStyle = 'rgba(233,185,73,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, f.Y(p.ivB)); c.lineTo(x, f.Y(p.ivA)); c.stroke(); }
      if (i === S.i) { c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(x, f.Y(p.iv), 8, 0, 6.283); c.stroke(); }
      dot(c, x, f.Y(p.iv), C.gold, 4);
    }); });
  } });
  onAll($$('input[name=c8E]'), 'change', update); $('#c8K').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch8: fat tails and clustering ═════════ */
(function ch8t() {
  const cv = $('#c8tCv'), av = $('#c8tAv'), R = M.DATA.RETURNS; let S = {};
  const span = R.n / R.perYear;
  const cnt = x => (x >= 100 ? fmt(x, 0) : x >= 1 ? fmt(x, 1) : x >= 0.001 ? fmt(x, 3) : M.sci(x, 1));
  const ratioStr = x => (x >= 1e6 ? t('u.x', { v: M.sci(x, 1) }) : times(x, x >= 100 ? 0 : 1));
  function update() {
    const k = val('c8tK'), r = M.tails(k);
    S = { k };
    out('c8tK', fmt(k, 1));
    const freq = r.yearsNormal > 1.38e10 ? t('u.never') : r.yearsNormal < 1 ? t('u.everyDays', { v: fmt(r.yearsNormal * R.perYear, 0) }) : t('u.every', { v: r.yearsNormal >= 1e6 ? M.sci(r.yearsNormal, 1) : fmt(r.yearsNormal, r.yearsNormal < 10 ? 1 : 0) });
    put('#c8tPct', pct(r.pct, 2)); put('#c8tObs', t('u.day', { v: fmt(r.obs, 0) })); put('#c8tExp', t('u.day', { v: cnt(r.exp) })); put('#c8tRat', ratioStr(r.ratio)); put('#c8tFr', freq);
    const v = { k: fmt(k, 1), pct: pct(r.pct, 2), exp: cnt(r.exp), obs: fmt(r.obs, 0), ratio: ratioStr(r.ratio), freq, yrs: fmt(span, 0) };
    putHTML('#c8tSay', t(r.exp >= 1 ? 'ch8.t.say.some' : 'ch8.t.say.none', v));
    sim.dirty = true;
  }
  const sim = reg([cv, av], { draw() {
    { const { c, w, h } = fit(cv), f = frame(w, h, MARG, -12, 12, -0.5, 4);
      xTicks(c, f, [-12, -9, -6, -3, 0, 3, 6, 9, 12].map(x => [x, M.signed(x, 0, effLang())])); yTicks(c, f, [0, 1, 2, 3].map(e => [e, fmt(Math.pow(10, e), 0)])); axes(c, f, t('ch8.t.cv.x'), t('ch8.t.cv.y'));
      c.fillStyle = 'rgba(240,122,109,.10)'; c.fillRect(f.L, f.T, f.X(-S.k) - f.L, f.B - f.T); c.fillRect(f.X(S.k), f.T, f.R - f.X(S.k), f.B - f.T);
      c.fillStyle = 'rgba(233,185,73,.7)'; R.hist.forEach((n, i) => { if (!n) return; const a = R.binLo + i * R.binW, x = f.X(a), y = f.Y(Math.log10(n)); c.fillRect(x + 0.5, y, Math.max(1, f.X(a + R.binW) - x - 1), f.B - y); });
      const pts = []; for (let x = -6; x <= 6.001; x += 0.1) { const e = R.n * R.binW * M.pdf(x); pts.push([x, Math.log10(e)]); }
      clip(c, f, () => line(c, pts, f, C.cyan, 2));
      c.strokeStyle = C.red; c.lineWidth = 1.3; c.setLineDash([4, 3]); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(f.X(s * S.k), f.T); c.lineTo(f.X(s * S.k), f.B); c.stroke(); } c.setLineDash([]);
    }
    { const { c, w, h } = fit(av), f = frame(w, h, [26, 14, 40, 50], 0, 60, -0.1, 0.4);
      xTicks(c, f, [1, 10, 20, 30, 40, 50, 60].map(x => [x, String(x)])); yTicks(c, f, [-0.1, 0, 0.1, 0.2, 0.3, 0.4].map(y => [y, fmt(y, 1)])); axes(c, f, t('ch8.t.cv.ax'), t('ch8.t.cv.ay'));
      line(c, [[0, 0], [60, 0]], f, C.line, 1);
      line(c, R.acfRaw.map((y, i) => [i + 1, y]), f, C.cyan, 1.8); line(c, R.acfAbs.map((y, i) => [i + 1, y]), f, C.gold, 2.2);
    }
  } });
  $('#c8tK').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch9: Heston by Monte Carlo ═════════ */
(function ch9() {
  const cv = $('#c9Cv'); let S = {}, seed = EX.heston.seed; const cache = {};
  function update() {
    const rho = val('c9Rho'), xi = val('c9Xi'), key = rho + '|' + xi + '|' + seed;
    const r = cache[key] || (cache[key] = M.hestonMC(Object.assign({}, EX.heston, { rho, xi, seed })));
    const iv = K => r.pts.find(p => p.K === K).iv, lo = iv(80), at = iv(100), hi = iv(120), skew = lo - hi, P = x => (isFinite(x) ? pct(x, 1) : '—');
    S = { r };
    out('c9Rho', M.signed(rho, 1, effLang())); out('c9Xi', fmt(xi, 2));
    put('#c9Lo', P(lo)); put('#c9Atm', P(at)); put('#c9Hi', P(hi)); put('#c9Sk', isFinite(skew) ? t('u.pt', { v: M.signed(skew * 100, 1, effLang()) }) : '—');
    const v = { rho: M.signed(rho, 1, effLang()), lo: P(lo), hi: P(hi), atm: P(at), skew: t('u.pt', { v: fmt(Math.abs(skew) * 100, 1) }) };
    putHTML('#c9Say', t(xi <= 0.1 ? 'ch9.say.flat' : (lo > at + 0.003 && hi > at + 0.003) || !(Math.abs(skew) >= 0.01) ? 'ch9.say.sym' : skew > 0 ? 'ch9.say.left' : 'ch9.say.right', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = S.r, f = frame(w, h, MARG, 65, 135, 0.05, 0.4);
    xTicks(c, f, [70, 80, 90, 100, 110, 120, 130].map(x => [x, fmt(x, 0)])); yTicks(c, f, [0.1, 0.2, 0.3, 0.4].map(y => [y, pct(y)])); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
    line(c, [[65, 0.2], [135, 0.2]], f, C.mute, 1.4, [6, 4]);
    clip(c, f, () => {
      line(c, r.pts.map(p => [p.K, p.iv]), f, 'rgba(233,185,73,.45)', 1.2);
      for (const p of r.pts) {
        if (!isFinite(p.iv)) continue; const x = f.X(p.K), bl = s => M.black76(r.F, p.K, r.D, s, EX.heston.T, p.type);
        const a = M.impliedVol(Math.max(p.price - 2 * p.se, 1e-9), bl), b = M.impliedVol(p.price + 2 * p.se, bl);
        if (isFinite(b)) { c.strokeStyle = 'rgba(233,185,73,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, f.Y(isFinite(a) ? a : 0.05)); c.lineTo(x, f.Y(b)); c.stroke(); }
        dot(c, x, f.Y(p.iv), C.gold, 4);
      }
    });
  } });
  onAll(['c9Rho', 'c9Xi'].map(i => $('#' + i)), 'input', update); $('#c9New').addEventListener('click', () => { seed++; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch9: a margin account ═════════ */
(function ch9m() {
  const cv = $('#c9mCv'); let S = {}, seed = EX.margin.seed; const statCache = {};
  function update() {
    const im = val('c9mIm') / 100, sigma = val('c9mSig') / 100, res = $('#c9mRes').checked ? 1 : 0, o = { im, mm: im * EX.margin.mmFrac, sigma, days: EX.margin.days, seed, reserve: res };
    const r = M.marginSim(o), sk = im + '|' + sigma + '|' + res + '|' + seed, st = statCache[sk] || (statCache[sk] = M.marginStats(o, EX.margin.runs));
    S = { r, im };
    out('c9mIm', pct(im)); out('c9mSig', pct(sigma));
    put('#c9mLev', times(r.leverage, 1)); put('#c9mCalls', t('u.times', { v: r.calls + (r.closed >= 0 ? 1 : 0) })); put('#c9mOut', syuan(r.outcome)); put('#c9mRaw', syuan(r.unlevered)); put('#c9mStat', pct(st.closed));
    const imA = im * 100, L = effLang();
    if (r.closed >= 0) putHTML('#c9mSay', t('ch9.m.say.closed', { d: r.closed, loss: fmt(-r.outcome, 2), im: fmt(imA, 0), frac: pct(-r.outcome / imA), end: fmt(r.finalPrice, 2), after: t(r.unlevered > 0 ? 'ch9.m.after.up' : 'ch9.m.after.down') }));
    else if (r.calls > 0) putHTML('#c9mSay', t('ch9.m.say.calls', { n: r.calls, paid: fmt(r.paid, 2), out: M.signed(r.outcome, 2, L), raw: M.signed(r.unlevered, 2, L) }));
    else putHTML('#c9mSay', t('ch9.m.say.quiet', { raw: M.signed(r.unlevered, 2, L), im: fmt(imA, 0), frac: M.signed(r.outcome / imA * 100, 0, L) + '%' }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rows = S.r.rows, pr = rows.map(x => [x.d, x.price - 100]), eq = rows.filter(x => x.eq != null).map(x => [x.d, x.eq]);
    let lo = Math.min(0, ...pr.map(p => p[1]), ...eq.map(p => p[1])), hi = Math.max(S.im * 100, ...pr.map(p => p[1]), ...eq.map(p => p[1])); const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const f = frame(w, h, MARG, 0, EX.margin.days, lo, hi);
    xTicks(c, f, [0, 20, 40, 60, 80, 100, 120].map(x => [x, String(x)])); yTicks(c, f, tk(lo, hi, 5, (v, d) => M.signed(v, d, effLang()))); axes(c, f, t('ch9.m.cv.x'), t('ch9.m.cv.y'));
    line(c, [[0, 0], [EX.margin.days, 0]], f, C.line, 1);
    line(c, [[0, S.im * 100 * EX.margin.mmFrac], [EX.margin.days, S.im * 100 * EX.margin.mmFrac]], f, 'rgba(240,122,109,.5)', 1, [3, 4]);
    line(c, pr, f, C.cyan, 1.6); line(c, eq, f, C.gold, 2.2);
    for (const x of rows) if (x.call) { const y = x.eq != null ? x.eq : S.im * 100 * EX.margin.mmFrac; dot(c, f.X(x.d), f.Y(Math.max(lo, Math.min(hi, y))), C.red, S.r.closed === x.d ? 7 : 4.5); }
  } });
  onAll(['c9mIm', 'c9mSig', 'c9mRes'].map(i => $('#' + i)), 'input', update); $('#c9mNew').addEventListener('click', () => { seed++; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch10: the minimum-variance hedge ═════════ */
(function ch10() {
  const cv = $('#c10Cv'), sv = $('#c10Sv'), F = EX.farm; let S = {};
  function update() {
    const h = val('c10H'), rho = val('c10Rho'), r = M.minVar({ sigS: F.sigS, sigF: F.sigF, rho, h });
    S = { h, rho, r, smp: M.hedgeSample({ sigS: F.sigS, sigF: F.sigF, rho, h, n: F.n, seed: F.seed }) };
    out('c10H', pct(h)); out('c10Rho', fmt(rho, 2));
    put('#c10Sd0', yuan(r.sd0, 1)); put('#c10Sd', yuan(r.sd, 1)); put('#c10Cut', pct(r.cut)); put('#c10Hs', pct(r.hStar)); put('#c10Best', pct(r.cutStar));
    const v = { h: pct(h), sd0: fmt(r.sd0, 1), sd: fmt(r.sd, 1), cut: pct(r.cut), hs: pct(r.hStar), best: pct(r.cutStar) };
    putHTML('#c10Say', t(r.sd > r.sd0 + 0.005 ? 'ch10.say.spec' : h > r.hStar + 0.101 ? 'ch10.say.over' : h < r.hStar - 0.101 ? 'ch10.say.under' : 'ch10.say.best', v));
    sim.dirty = true;
  }
  const sim = reg([cv, sv], { draw() {
    { const { c, w, h } = fit(cv), X0 = 40, X1 = 160, NB = 48, bw = (X1 - X0) / NB, bin = a => { const n = new Array(NB).fill(0); for (const x of a) n[Math.max(0, Math.min(NB - 1, Math.floor((x - X0) / bw)))]++; return n; };
      const a = bin(S.smp.raw), b = bin(S.smp.hedged), top = Math.max(...a, ...b) * 1.1, f = frame(w, h, MARG, X0, X1, 0, top);
      xTicks(c, f, [40, 60, 80, 100, 120, 140, 160].map(x => [x, fmt(x, 0)])); yTicks(c, f, tk(0, top, 4)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
      const bars = (n, col) => { c.fillStyle = col; n.forEach((v, i) => { const x = f.X(X0 + i * bw), y = f.Y(v); c.fillRect(x + 0.5, y, Math.max(1, f.X(X0 + (i + 1) * bw) - x - 1), f.B - y); }); };
      bars(a, 'rgba(163,170,184,.45)'); bars(b, 'rgba(233,185,73,.7)');
    }
    { const { c, w, h } = fit(sv), f = frame(w, h, [26, 14, 40, 50], 0, 2, 0, 34), pts = [];
      for (let x = 0; x <= 2.0001; x += 0.02) pts.push([x, M.minVar({ sigS: F.sigS, sigF: F.sigF, rho: S.rho, h: x }).sd]);
      xTicks(c, f, [0, 0.5, 1, 1.5, 2].map(x => [x, pct(x)])); yTicks(c, f, [0, 10, 20, 30].map(y => [y, String(y)])); axes(c, f, t('ch10.cv.cx'), t('ch10.cv.cy'));
      line(c, [[0, S.r.sd0], [2, S.r.sd0]], f, C.mute, 1.2, [4, 4]); line(c, pts, f, C.cyan, 2);
      c.strokeStyle = C.cyan; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(f.X(S.r.hStar), f.Y(S.r.sdStar)); c.lineTo(f.X(S.r.hStar), f.B); c.stroke(); c.setLineDash([]);
      dot(c, f.X(S.h), f.Y(S.r.sd), C.gold, 6);
    }
  } });
  onAll(['c10H', 'c10Rho'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
