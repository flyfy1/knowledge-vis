/* What the yield curve says: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows investment/derivatives/a-fair-price-for-a-bet/app.js. */
(() => {
'use strict';
const M = window.CurveModels, D = M.DATA;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ───────── */
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
const fmt = (x, d) => M.fmt(x, d);
const pc = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 2 : d) });          // decimal → "4.56%"
const pcs = (x, d) => t('u.pct', { v: M.signed(x * 100, d == null ? 2 : d) });
const pts = (x, d) => t('u.pt', { v: M.signed(x * 100, d == null ? 2 : d) });       // decimal → "+0.52 个百分点"
const bp = x => t('u.bp', { v: M.signed(x * 1e4, 0) });
const bpu = x => t('u.bp', { v: fmt(x * 1e4, 0) });
const yrs = x => t('u.yr', { v: fmt(x, Number.isInteger(x) ? 0 : 2) });
const ym = (start, i) => { const o = M.mLabel(start, i); return t('u.ym', { y: o.y, m: effLang() === 'en' ? String(o.m).padStart(2, '0') : o.m }); };
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
const radios = name => $$(`input[name=${name}]`);
const DATES = { a: '2021-12-31', b: '2023-06-30', c: D.last };

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
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 1 || py > f.B + 1) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function nice(lo, hi, n) {
  const span = hi - lo || 1, raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, st = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, o = [];
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-9; v += st) o.push(Math.abs(v) < st * 1e-9 ? 0 : v);
  return { ticks: o, d: Math.max(0, -Math.floor(Math.log10(st) + 1e-9)) };
}
const tk = (lo, hi, n, f) => { const k = nice(lo, hi, n); return k.ticks.map(v => [v, f ? f(v, k.d) : fmt(v, k.d)]); };
function line(c, P, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of P) { if (y == null || !isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function clip(c, f, fn) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); fn(); c.restore(); }
function vline(c, f, x, col, dash) { c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash || [3, 3]); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function hzero(c, f) { if (f.y0 < 0 && f.y1 > 0) { c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke(); } }
const MARG = [28, 14, 40, 50];
const range = (arr) => { const v = arr.filter(x => x != null && isFinite(x)); return [Math.min(...v), Math.max(...v)]; };
const pad = ([lo, hi], p) => { const s = (hi - lo) || 1; return [lo - s * (p || 0.1), hi + s * (p || 0.1)]; };
const pctTick = (v, d) => fmt(v, d);
const yearTicks = (a, b, step) => { const o = []; for (let y = Math.ceil(a / step) * step; y <= b; y += step) o.push([y, String(y)]); return o; };

/* ═════════ ch1: a coupon bond as a bundle of zeros ═════════ */
(function ch1() {
  const cv = $('#c1Cv'), bv = $('#c1Bv'); let S = {};
  function update() {
    const d = DATES[radioVal('c1D')], T = val('c1T'), c = val('c1C') / 100, cvv = M.realCurve(d), b = M.bundle(cvv, T, c);
    S = { d, T, c, cvv, b };
    out('c1T', yrs(T)); out('c1C', pc(c, 1));
    put('#c1P', fmt(b.P, 2)); put('#c1Y', pc(b.y)); put('#c1Z', pc(b.zT)); put('#c1G', bp(b.gap));
    const k = Math.abs(b.gap) < 0.00005 ? 'zero' : b.gap < 0 ? 'below' : 'above';
    putHTML('#c1Say', t('ch1.say.' + k, { y: pc(b.y), z: pc(b.zT), g: bpu(Math.abs(b.gap)), T: T, w: pc(b.flows[b.flows.length - 1].w, 0) }));
    sim.dirty = true;
  }
  const sim = reg([cv, bv], { draw() {
    { const { c, w, h } = fit(cv), z = S.cvv.nodes, [lo, hi] = pad(range(z.concat([S.b.y])), 0.15), f = frame(w, h, MARG, 0, 10.5, lo * 100, hi * 100);
      xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x, String(x)])); yTicks(c, f, tk(lo * 100, hi * 100, 5));
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      line(c, z.map((v, i) => [i + 1, v * 100]), f, C.cyan, 2.2);
      line(c, [[0.5, S.b.y * 100], [10.5, S.b.y * 100]], f, C.gold, 1.6, [6, 4]);
      S.b.flows.forEach(fl => dot(c, f.X(fl.t), f.Y(fl.z * 100), C.cyan, fl.t === S.T ? 6 : 3.5));
    }
    { const { c, w, h } = fit(bv), f = frame(w, h, [22, 14, 34, 50], 0, 10.5, 0, 100);
      xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x, String(x)])); yTicks(c, f, [[0, '0'], [50, '50%'], [100, '100%']]);
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y2'));
      const bw = Math.max(6, (f.X(1) - f.X(0)) * 0.55);
      S.b.flows.forEach(fl => { c.fillStyle = C.gold; const y = f.Y(fl.w * 100); c.fillRect(f.X(fl.t) - bw / 2, y, bw, f.B - y); });
    }
  } });
  onAll([...radios('c1D'), $('#c1T'), $('#c1C')], 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch2: forward rates and the lock-in ═════════ */
(function ch2() {
  const cv = $('#c2Cv'); let S = {};
  function update(e) {
    let a = val('c2A'), b = val('c2B');
    if (a >= b) { if (e && e.target && e.target.id === 'c2A') { b = a + 1; $('#c2B').value = b; } else { a = b - 1; $('#c2A').value = a; } }
    const d = DATES[radioVal('c2D')], cvv = M.realCurve(d), fw = M.forward(cvv, a, b), q = val('c2Q') / 100, arb = M.forwardArb(cvv, a, b, q, 100);
    S = { a, b, cvv, fw, q, fc: M.fwdCurve(cvv) };
    out('c2A', yrs(a)); out('c2B', yrs(b)); out('c2Q', pc(q));
    put('#c2Z1', pc(cvv.z(a))); put('#c2Z2', pc(cvv.z(b))); put('#c2F', pc(fw.f)); put('#c2U', fmt(fw.units, 4)); put('#c2Pr', fmt(arb.profit, 2));
    putHTML('#c2Say', t('ch2.say.' + arb.side, { a, b, f: pc(fw.f), q: pc(q), p: fmt(arb.profit, 2), u: fmt(fw.units * 100, 2) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), all = S.cvv.nodes.concat(S.fc, [S.q]), [lo, hi] = pad(range(all), 0.12), f = frame(w, h, MARG, 0, 10.5, lo * 100, hi * 100);
    xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x, String(x)])); yTicks(c, f, tk(lo * 100, hi * 100, 5));
    axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    // one-year forwards as steps
    const st = []; S.fc.forEach((v, i) => { st.push([i, v * 100]); st.push([i + 1, v * 100]); }); line(c, st, f, C.gold, 1.8);
    line(c, S.cvv.nodes.map((v, i) => [i + 1, v * 100]), f, C.cyan, 2.2);
    c.fillStyle = 'rgba(179,157,251,.18)'; c.fillRect(f.X(S.a), f.T, f.X(S.b) - f.X(S.a), f.B - f.T);
    line(c, [[S.a, S.fw.f * 100], [S.b, S.fw.f * 100]], f, C.violet, 3);
    clip(c, f, () => line(c, [[S.a, S.q * 100], [S.b, S.q * 100]], f, C.ink, 1.4, [4, 3]));
    dot(c, f.X(S.a), f.Y(S.cvv.z(S.a) * 100), C.cyan, 5); dot(c, f.X(S.b), f.Y(S.cvv.z(S.b) * 100), C.cyan, 5);
  } });
  onAll([...radios('c2D'), $('#c2A'), $('#c2B'), $('#c2Q')], 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch3: curve builder ═════════ */
(function ch3() {
  const cv = $('#c3Cv'), bv = $('#c3Bv'); let path = M.PATHS.cuts.slice(), S = {};
  const kEl = $('#c3K'), vEl = $('#c3V');
  function syncV() { vEl.value = path[val('c3K') - 1]; }
  function update() {
    const tp = val('c3T') / 100, tpB = val('c3B') / 100, P = path.map(v => v / 100), B = M.build(P, tp), pB = M.impliedPath(B.y, tpB);
    S = { P, B, pB, tp, tpB };
    out('c3K', t('ch3.u.year', { a: val('c3K') - 1, b: val('c3K') })); out('c3V', pc(val('c3V') / 100)); out('c3T', pcs(tp)); out('c3B', pcs(tpB));
    const s = B.y[9] - B.y[0];
    put('#c3Y1', pc(B.y[0])); put('#c3Y10', pc(B.y[9])); put('#c3S', pts(s)); put('#c3TP', pts(B.tp[9]));
    const cls = s < -0.0005 ? 'inv' : s > 0.0005 ? 'up' : 'flat';
    const cutPart = B.exp[9] - B.exp[0];
    putHTML('#c3Say', t('ch3.say.' + cls, { s: pts(s), e: pts(cutPart), tp: pts(B.tp[9] - B.tp[0]) }));
    put('#c3BA', pc(P[9])); put('#c3BB', pc(pB[9])); put('#c3BD', pc(B.y[9]));
    const gap = pB[9] - P[9];
    putHTML('#c3SayB', t(Math.abs(gap) < 0.0005 ? 'ch3.sayB.same' : 'ch3.sayB.diff', { a: pcs(S.tp), b: pcs(S.tpB), g: pts(gap), y: pc(B.y[9]) }));
    sim.dirty = true;
  }
  const geo = {};
  const sim = reg([cv, bv], { draw() {
    { const { c, w, h } = fit(cv), all = S.P.concat(S.B.y, S.B.exp), [lo, hi] = pad(range(all.concat([0])), 0.1), f = frame(w, h, MARG, 0, 10.5, lo * 100, hi * 100);
      geo.f = f;
      xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x, String(x)])); yTicks(c, f, tk(lo * 100, hi * 100, 5)); hzero(c, f);
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      const st = []; S.P.forEach((v, i) => { st.push([i, v * 100]); st.push([i + 1, v * 100]); }); line(c, st, f, C.violet, 2);
      S.P.forEach((v, i) => dot(c, f.X(i + 0.5), f.Y(v * 100), C.violet, i === val('c3K') - 1 ? 7 : 4));
      line(c, S.B.exp.map((v, i) => [i + 1, v * 100]), f, C.cyan, 1.8, [5, 4]);
      line(c, S.B.y.map((v, i) => [i + 1, v * 100]), f, C.gold, 2.6);
    }
    { const { c, w, h } = fit(bv), all = S.P.concat(S.pB), [lo, hi] = pad(range(all.concat([0])), 0.1), f = frame(w, h, [22, 14, 34, 50], 0, 10.5, lo * 100, hi * 100);
      xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x, String(x)])); yTicks(c, f, tk(lo * 100, hi * 100, 4)); hzero(c, f);
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      const st = (arr) => { const o = []; arr.forEach((v, i) => { o.push([i, v * 100]); o.push([i + 1, v * 100]); }); return o; };
      line(c, st(S.P), f, C.violet, 2); line(c, st(S.pB), f, C.green, 2, [6, 3]);
    }
  } });
  // pointer drag on the main canvas sets the nearest year's expected rate
  let drag = false;
  function setFrom(ev) {
    const f = geo.f; if (!f) return; const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    const k = Math.max(0, Math.min(9, Math.floor((x - f.L) / (f.R - f.L) * 10.5))), v = f.y0 + (f.B - y) / (f.B - f.T) * (f.y1 - f.y0);
    path[k] = Math.max(0, Math.min(8, Math.round(v / 0.05) * 0.05)); kEl.value = k + 1; syncV(); update();
  }
  cv.addEventListener('pointerdown', ev => { drag = true; cv.setPointerCapture(ev.pointerId); setFrom(ev); });
  cv.addEventListener('pointermove', ev => { if (drag) setFrom(ev); });
  cv.addEventListener('pointerup', () => { drag = false; });
  kEl.addEventListener('input', () => { syncV(); update(); });
  vEl.addEventListener('input', () => { path[val('c3K') - 1] = val('c3V'); update(); });
  onAll([$('#c3T'), $('#c3B')], 'input', update);
  $$('#lab3 button[data-p]').forEach(b => b.addEventListener('click', () => { path = M.PATHS[b.dataset.p].slice(); syncV(); update(); }));
  syncV(); langHooks.push(update); update();
})();

/* ═════════ ch4: one year of holding a zero ═════════ */
(function ch4() {
  const cv = $('#c4Cv'); let S = {};
  function update() {
    const d = DATES[radioVal('c4D')], n = val('c4N'), sc = radioVal('c4S'), x = val('c4X') / 100, cvv = M.realCurve(d), hd = M.hold(cvv, n, sc, x);
    $('#c4X').disabled = sc !== 'shift';
    S = { cvv, n, sc, x, hd };
    out('c4N', yrs(n)); out('c4X', pcs(x));
    put('#c4R', pc(hd.ret)); put('#c4R1', pc(hd.r1)); put('#c4E', pts(hd.excess)); put('#c4BE', bp(hd.breakeven));
    putHTML('#c4Say', t('ch4.say.' + sc, { n, n1: n - 1, r: pc(hd.ret), r1: pc(hd.r1), e: pts(hd.excess), be: bp(hd.breakeven), roll: pts(hd.roll) }));
    sim.dirty = true;
  }
  const next = m => (S.sc === 'fwd' ? ((m + 1) * S.cvv.z(m + 1) - S.cvv.z(1)) / m : S.cvv.z(m) + (S.sc === 'shift' ? S.x : 0));
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), now = S.cvv.nodes, nx = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(next), [lo, hi] = pad(range(now.concat(nx)), 0.15), f = frame(w, h, MARG, 0, 10.5, lo * 100, hi * 100);
    xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x, String(x)])); yTicks(c, f, tk(lo * 100, hi * 100, 5));
    axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    line(c, now.map((v, i) => [i + 1, v * 100]), f, C.cyan, 2.2);
    line(c, nx.map((v, i) => [i + 1, v * 100]), f, C.gold, 2, [6, 4]);
    const x0 = f.X(S.n), y0 = f.Y(S.cvv.z(S.n) * 100), x1 = f.X(S.n - 1), y1 = f.Y(next(S.n - 1) * 100);
    c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    dot(c, x0, y0, C.cyan, 6); dot(c, x1, y1, C.gold, 6);
  } });
  onAll([...radios('c4D'), ...radios('c4S'), $('#c4N'), $('#c4X')], 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch4b: realised excess returns of the 10-year zero ═════════ */
(function ch4x() {
  const cv = $('#c4Xv'); let S = {};
  function update() {
    const y = +radioVal('c4P'), s = M.rxStats(y); S = { y, s };
    put('#c4XM', pts(s.mean / 100)); put('#c4XS', t('u.pt', { v: fmt(s.sd, 2) })); put('#c4XP', pc(s.pos, 0)); put('#c4XW', t('ch4.rx.worstv', { v: pts(s.worst / 100), y: s.worstYear }));
    putHTML('#c4XSay', t('ch4.rx.say', { a: s.from, b: s.to, n: s.n, m: pts(s.mean / 100), sd: fmt(s.sd, 1), p: pc(s.pos, 0) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), R = D.rx, y0 = R.seriesStart, y1 = y0 + R.series.length - 1, f = frame(w, h, MARG, y0 - 0.8, y1 + 0.8, -25, 35);
    xTicks(c, f, yearTicks(y0, y1, 10)); yTicks(c, f, tk(-25, 35, 6)); hzero(c, f);
    axes(c, f, t('ch4.rx.x'), t('ch4.rx.y'));
    const bw = Math.max(1.5, (f.X(1) - f.X(0)) * 0.7);
    R.series.forEach((v, i) => { const yr = y0 + i; c.globalAlpha = yr >= S.y ? 1 : 0.3; c.fillStyle = v >= 0 ? C.green : C.red; const a = f.Y(Math.max(0, v)), b = f.Y(Math.min(0, v)); c.fillRect(f.X(yr) - bw / 2, a, bw, b - a); });
    c.globalAlpha = 1;
    line(c, [[S.y - 0.5, S.s.mean], [y1 + 0.5, S.s.mean]], f, C.gold, 2);
  } });
  onAll(radios('c4P'), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch5: the 10-year split into expectations and term premium (ACM), with Kim–Wright ═════════ */
(function ch5() {
  const cv = $('#c5Cv'), A = D.acmM, K = D.kwM, n = A.y10.length, sl = $('#c5M'); let i = n - 1;
  sl.max = n - 1; sl.value = n - 1;
  function update() {
    i = val('c5M'); const kwI = M.mIndex(K.start, A.start) + i, kw = K.v[kwI];
    out('c5M', ym(A.start, i));
    const y = A.y10[i], tp = A.tp10[i];
    put('#c5Y', pc(y / 100)); put('#c5E', pc((y - tp) / 100)); put('#c5A', pts(tp / 100)); put('#c5K', kw == null ? '—' : pts(kw / 100));
    putHTML('#c5Say', t(tp < 0 ? 'ch5.say.neg' : 'ch5.say.pos', { d: ym(A.start, i), y: pc(y / 100), e: pc((y - tp) / 100), a: pts(tp / 100), k: kw == null ? '—' : pts(kw / 100), g: kw == null ? '—' : t('u.pt', { v: fmt(Math.abs(tp - kw), 2) }) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), x0 = 1990, x1 = 1990 + (n - 1) / 12, f = frame(w, h, MARG, x0, x1, -2, 10);
    xTicks(c, f, yearTicks(1990, 2026, 5)); yTicks(c, f, tk(-2, 10, 6)); hzero(c, f);
    axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
    const X = k => 1990 + k / 12;
    line(c, A.y10.map((v, k) => [X(k), v]), f, C.gold, 1.8);
    line(c, A.y10.map((v, k) => [X(k), v - A.tp10[k]]), f, C.cyan, 1.6);
    line(c, A.tp10.map((v, k) => [X(k), v]), f, C.violet, 1.8);
    const off = M.mIndex(K.start, A.start); line(c, A.y10.map((v, k) => [X(k), K.v[off + k]]), f, C.green, 1.4, [4, 3]);
    vline(c, f, X(i), C.ink);
  } });
  sl.addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch6: duration, convexity and a rate shock ═════════ */
(function ch6() {
  const cv = $('#c6Cv'); let S = {};
  function update() {
    const c = val('c6C') / 100, T = val('c6T'), y = val('c6Y') / 100, dy = val('c6S') / 100, s = M.shock(c, T, y, dy);
    S = { c, T, y, dy, s };
    out('c6C', pc(c, 1)); out('c6T', yrs(T)); out('c6Y', pc(y)); out('c6S', pcs(dy));
    put('#c6P', fmt(s.b0.P, 2)); put('#c6Mac', yrs(+s.b0.mac.toFixed(2))); put('#c6Mod', fmt(s.b0.mod, 2)); put('#c6Cx', fmt(s.b0.conv, 1)); put('#c6DV', fmt(s.b0.dv01, 4));
    put('#c6Ex', pcs(s.exact)); put('#c6Du', pcs(s.dur)); put('#c6DC', pcs(s.durConv));
    const big = Math.abs(s.errDur) > 0.01;
    putHTML('#c6Say', t(big ? 'ch6.say.big' : 'ch6.say.small', { ex: pcs(s.exact), du: pcs(s.dur), dc: pcs(s.durConv), e1: pts(s.errDur), e2: pts(s.errDC), m: fmt(s.b0.mod, 2) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), b0 = S.s.b0, xs = []; for (let k = -60; k <= 60; k++) xs.push(k * 0.05);
    const ex = xs.map(d => [d, (M.bond(S.c, S.T, Math.max(-0.009, S.y + d / 100)).P / b0.P - 1) * 100]);
    const du = xs.map(d => [d, -b0.mod * d]), dc = xs.map(d => [d, -b0.mod * d + 0.5 * b0.conv * d * d / 100]);
    const [lo, hi] = pad(range(ex.map(p => p[1]).concat(du.map(p => p[1]))), 0.05), f = frame(w, h, MARG, -3, 3, lo, hi);
    xTicks(c, f, [-3, -2, -1, 0, 1, 2, 3].map(x => [x, M.signed(x, 0)])); yTicks(c, f, tk(lo, hi, 6)); hzero(c, f);
    axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    clip(c, f, () => { line(c, du, f, C.cyan, 1.6); line(c, dc, f, C.violet, 1.6, [5, 4]); line(c, ex, f, C.gold, 2.4); });
    vline(c, f, S.dy * 100, C.mute);
    dot(c, f.X(S.dy * 100), f.Y(S.s.exact * 100), C.gold, 5.5);
  } });
  onAll(['c6C', 'c6T', 'c6Y', 'c6S'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch7: immunisation, bullet against barbell ═════════ */
(function ch7() {
  const cv = $('#c7Cv'), H = 7, Y0 = 0.045; let S = {};
  function update() {
    const sM = val('c7S'), lM = val('c7L'), dp = val('c7P') / 100, tw = val('c7W') / 100, pf = M.immunise(H, 100, sM, lM, Y0), su = M.surplus(pf, H, Y0, dp, tw);
    S = { sM, lM, dp, tw, pf, su };
    out('c7S', yrs(sM)); out('c7L', yrs(lM)); out('c7P', pcs(dp)); out('c7W', pcs(tw));
    put('#c7Wt', t('ch7.u.w', { a: pc(pf.w, 0), b: pc(1 - pf.w, 0) })); put('#c7Bu', M.signed(su.bullet, 2)); put('#c7Ba', M.signed(su.barbell, 2)); put('#c7Di', fmt(M.dispersion(pf.barbell, H), 1));
    const k = Math.abs(tw) > 0.0001 ? (su.barbell < 0 ? 'twistLose' : 'twistWin') : (Math.abs(dp) < 0.0001 ? 'none' : 'par');
    putHTML('#c7Say', t('ch7.say.' + k, { b: M.signed(su.barbell, 2), u: M.signed(su.bullet, 2), L: fmt(pf.PVL, 2) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), xs = []; for (let k = -60; k <= 60; k++) xs.push(k * 0.05);
    const bu = xs.map(d => [d, M.surplus(S.pf, H, Y0, d / 100, S.tw).bullet]), ba = xs.map(d => [d, M.surplus(S.pf, H, Y0, d / 100, S.tw).barbell]);
    const [lo, hi] = pad(range(bu.concat(ba).map(p => p[1]).concat([0, 1])), 0.1), f = frame(w, h, MARG, -3, 3, lo, hi);
    xTicks(c, f, [-3, -2, -1, 0, 1, 2, 3].map(x => [x, M.signed(x, 0)])); yTicks(c, f, tk(lo, hi, 5)); hzero(c, f);
    axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
    line(c, bu, f, C.cyan, 2.2); line(c, ba, f, C.gold, 2.4);
    vline(c, f, S.dp * 100, C.mute);
    dot(c, f.X(S.dp * 100), f.Y(S.su.barbell), C.gold, 5.5); dot(c, f.X(S.dp * 100), f.Y(S.su.bullet), C.cyan, 4.5);
  } });
  onAll(['c7S', 'c7L', 'c7P', 'c7W'].map(i => $('#' + i)), 'input', update); langHooks.push(update); update();
})();

/* ═════════ ch8: three numbers for a whole curve (Nelson–Siegel) ═════════ */
(function ch8() {
  const cv = $('#c8Cv'); let S = {};
  const T = D.parMat;
  function refit() { const d = DATES[radioVal('c8D')], f = M.nsFit(T, D.curves[d].par); $('#c8A').value = f.b[0].toFixed(2); $('#c8B').value = f.b[1].toFixed(2); $('#c8C').value = f.b[2].toFixed(2); update(); }
  function update() {
    const d = DATES[radioVal('c8D')], ys = D.curves[d].par, b = [val('c8A'), val('c8B'), val('c8C')], e = M.rmse(b, T, ys);
    S = { d, ys, b };
    out('c8A', fmt(b[0], 2)); out('c8B', M.signed(b[1], 2)); out('c8C', M.signed(b[2], 2));
    put('#c8R', t('u.bp', { v: fmt(e * 100, 0) })); put('#c8L', pc(b[0] / 100)); put('#c8Sl', pts(-b[1] / 100)); put('#c8Cu', M.signed(b[2], 2));
    putHTML('#c8Say', t(e * 100 <= 20 ? 'ch8.say.good' : 'ch8.say.bad', { e: fmt(e * 100, 0), l: pc(b[0] / 100), s: pts(-b[1] / 100) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), xs = []; for (let k = 1; k <= 120; k++) xs.push(k * 0.25);
    const fitv = xs.map(x => [x, M.ns(S.b, x)]), parts = [0, 1, 2].map(j => xs.map(x => [x, S.b[j] * M.nsLoad(x, M.LAMBDA)[j]]));
    const [lo, hi] = pad(range(fitv.map(p => p[1]).concat(S.ys, [0])), 0.1), f = frame(w, h, MARG, 0, 30.5, lo, hi);
    xTicks(c, f, [0.25, 2, 5, 10, 20, 30].map(x => [x, x === 0.25 ? '¼' : String(x)])); yTicks(c, f, tk(lo, hi, 5)); hzero(c, f);
    axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    clip(c, f, () => { parts.forEach(p => line(c, p, f, C.mute, 1, [3, 4])); line(c, fitv, f, C.gold, 2.4); });
    T.forEach((x, k) => dot(c, f.X(x), f.Y(S.ys[k]), C.ink, 4.5));
  } });
  onAll(['c8A', 'c8B', 'c8C'].map(i => $('#' + i)), 'input', update);
  onAll(radios('c8D'), 'input', refit); $('#c8Fit').addEventListener('click', refit);
  langHooks.push(update); refit();
})();

/* ═════════ ch9: an inversion, split into expectations and term premium ═════════ */
(function ch9() {
  const cv = $('#c9Cv'), A = D.acmM, i0 = M.mIndex(A.start, '2000-01'), n = A.y10.length - i0, sl = $('#c9M'), SL = D.slope;
  sl.max = n - 1; sl.value = M.mIndex(A.start, '2023-06') - i0;
  let S = {};
  function update() {
    const k = val('c9M'), i = i0 + k, s = M.split(i), s3 = SL.s3m[M.mIndex(SL.start, A.start) + i];
    S = { k };
    out('c9M', ym(A.start, i));
    put('#c9S', pts(s.s / 100)); put('#c9E', pts(s.exp / 100)); put('#c9T', pts(s.tp / 100)); put('#c9S3', s3 == null ? '—' : pts(s3 / 100));
    const inv = s.s < 0, mostly = Math.abs(s.exp) >= Math.abs(s.tp) ? 'exp' : 'tp';
    putHTML('#c9Say', t('ch9.say.' + (inv ? 'inv' : 'up') + '.' + mostly, { d: ym(A.start, i), s: pts(s.s / 100), e: pts(s.exp / 100), tp: pts(s.tp / 100) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), X = k => 2000 + k / 12, f = frame(w, h, MARG, 2000, X(n - 1), -3, 4);
    xTicks(c, f, yearTicks(2000, 2026, 5)); yTicks(c, f, tk(-3, 4, 7)); hzero(c, f);
    axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
    const sp = [], ex = [], tp = []; for (let k = 0; k < n; k++) { const s = M.split(i0 + k); sp.push([X(k), s.s]); ex.push([X(k), s.exp]); tp.push([X(k), s.tp]); }
    c.fillStyle = 'rgba(240,122,109,.13)'; sp.forEach(([x, v]) => { if (v < 0) c.fillRect(f.X(x) - 1, f.T, Math.max(1.5, f.X(x + 1 / 12) - f.X(x) + 1), f.B - f.T); });
    line(c, ex, f, C.cyan, 1.5); line(c, tp, f, C.violet, 1.5); line(c, sp, f, C.gold, 2.4);
    vline(c, f, X(S.k), C.ink);
  } });
  sl.addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch10: default probability → spread ═════════ */
(function ch10() {
  const cv = $('#c10Cv'), r = 0.045; let S = {};
  const OAS = { BBB: 'bbb', BB: 'bb', B: 'b', CCC: 'ccc' };
  let pExact = null; // the preset's exact annual rate, used until the reader moves the slider
  function preset() { const g = radioVal('c10G'); pExact = M.annualFromCum(D.spg.cum[g][1] / 100, 5); $('#c10P').value = Math.min(20, pExact * 100).toFixed(2); $('#c10R').value = 40; $('#c10K').value = 1; $('#c10T').value = 5; update(); }
  function update(e) {
    if (e && e.target && e.target.id === 'c10P') pExact = null;
    const g = radioVal('c10G'), p = pExact != null ? pExact : val('c10P') / 100, R = val('c10R') / 100, k = val('c10K'), T = val('c10T'), cr = M.credit({ r, T, p, R, k }), oas = D.oas[OAS[g]].v / 100;
    S = { p, R, k, T, cr, oas, g };
    out('c10P', pc(p)); out('c10R', pc(R, 0)); out('c10K', t('u.x', { v: fmt(k, 2) })); out('c10T', yrs(T));
    put('#c10S', bpu(cr.s)); put('#c10Tr', bpu(cr.tri)); put('#c10E', bpu(cr.el)); put('#c10Pm', bpu(cr.prem)); put('#c10C', pc(cr.cumP, 1)); put('#c10O', bpu(oas));
    const share = cr.el / oas;
    putHTML('#c10Say', t(k > 1.0001 ? 'ch10.say.k' : 'ch10.say.el', { g, el: bpu(cr.el), o: bpu(oas), sh: pc(share, 0), s: bpu(cr.s), pr: bpu(cr.prem), d: D.oas.hy.d }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), xs = []; for (let k = 0; k <= 100; k++) xs.push(k * 0.2);
    const sv = xs.map(x => [x, M.credit({ r, T: S.T, p: x / 100, R: S.R, k: S.k }).s * 1e4]), ev = xs.map(x => [x, M.credit({ r, T: S.T, p: x / 100, R: S.R, k: 1 }).s * 1e4]);
    const hi = Math.max(S.oas * 1e4, ...sv.map(p => p[1])) * 1.08, f = frame(w, h, [28, 14, 40, 56], 0, 20, 0, hi);
    xTicks(c, f, [0, 5, 10, 15, 20].map(x => [x, x + '%'])); yTicks(c, f, tk(0, hi, 5));
    axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
    clip(c, f, () => { line(c, ev, f, C.cyan, 1.6, [5, 4]); line(c, sv, f, C.gold, 2.4); line(c, [[0, S.oas * 1e4], [20, S.oas * 1e4]], f, C.red, 1.4, [3, 3]); });
    dot(c, f.X(Math.min(20, S.p * 100)), f.Y(S.cr.s * 1e4), C.gold, 6);
  } });
  onAll(radios('c10G'), 'input', preset); onAll(['c10P', 'c10R', 'c10K', 'c10T'].map(i => $('#' + i)), 'input', update);
  langHooks.push(update); preset();
})();

/* ═════════ ch11: correlated defaults (Vasicek one-factor), simulated year by year ═════════ */
(function ch11() {
  const cv = $('#c11Cv'), YEARS = 2000, LGD = 0.6, SPREAD = 0.036, real = D.spg.sg.map(v => v / 100), rs = M.stats(real);
  let S = { xs: [], gen: null };
  function restart() {
    const p = val('c11P') / 100, rho = val('c11Rho'), N = +radioVal('c11N');
    S = { p, rho, N, xs: [], R: M.rng(20261125), th: M.ninv(p) };
    out('c11P', pc(p, 1)); out('c11Rho', fmt(rho, 2));
    if (reduce) { while (S.xs.length < YEARS) stepYears(YEARS); }
    readouts(); sim.dirty = true;
  }
  function stepYears(k) {
    const a = Math.sqrt(S.rho), b = Math.sqrt(1 - S.rho);
    for (let j = 0; j < k && S.xs.length < YEARS; j++) { const Z = M.gauss(S.R); let d = 0; for (let i = 0; i < S.N; i++) if (a * Z + b * M.gauss(S.R) < S.th) d++; S.xs.push(d / S.N); }
  }
  function readouts() {
    put('#c11Y', String(S.xs.length)); put('#c11RS', t('u.pt', { v: fmt(rs.sd * 100, 2) })); put('#c11RW', pc(rs.max, 2));
    if (S.xs.length < 20) { ['#c11Sd', '#c11Q', '#c11W', '#c11L'].forEach(s => put(s, '—')); putHTML('#c11Say', t('ch11.say.run')); return; }
    const st = M.stats(S.xs), ly = M.lossYears(S.xs, LGD, SPREAD);
    put('#c11Sd', t('u.pt', { v: fmt(st.sd * 100, 2) })); put('#c11Q', pc(st.q99, 1)); put('#c11W', pc(st.max, 1)); put('#c11L', pc(ly, 1));
    const k = st.max < rs.max ? 'thin' : 'fat';
    putHTML('#c11Say', t('ch11.say.' + k, { n: S.xs.length, w: pc(st.max, 1), rw: pc(rs.max, 2), sd: fmt(st.sd * 100, 2), rsd: fmt(rs.sd * 100, 2), l: pc(ly, 1) }));
  }
  const sim = reg(cv, {
    step(dt) { if (S.xs.length >= YEARS) return false; stepYears(Math.max(1, Math.round(dt * 600))); readouts(); return true; },
    draw() {
      const { c, w, h } = fit(cv), bins = 30, top = 0.15, f = frame(w, h, MARG, 0, top * 100, 0, 1);
      const hist = arr => { const o = Array(bins).fill(0); arr.forEach(x => { o[Math.min(bins - 1, Math.floor(x / top * bins))]++; }); return o.map(v => v / Math.max(1, arr.length)); };
      const hs = hist(S.xs), hr = hist(real), mx = Math.max(0.05, ...hs, ...hr) * 1.1; f.y1 = mx;
      xTicks(c, f, [0, 3, 6, 9, 12, 15].map(x => [x, x + '%'])); yTicks(c, f, tk(0, mx, 4, (v, d) => fmt(v * 100, Math.max(0, d - 2)) + '%'));
      axes(c, f, t('ch11.cv.x'), t('ch11.cv.y'));
      const bw = (f.R - f.L) / bins;
      hs.forEach((v, k) => { c.fillStyle = 'rgba(233,185,73,.75)'; const y = f.Y(v); c.fillRect(f.L + k * bw + 1, y, bw - 2, f.B - y); });
      c.strokeStyle = C.cyan; c.lineWidth = 2; hr.forEach((v, k) => { if (!v) return; const y = f.Y(v); c.strokeRect(f.L + k * bw + 2, y, bw - 4, f.B - y); });
    }
  });
  onAll(['c11P', 'c11Rho'].map(i => $('#' + i)), 'input', restart); onAll(radios('c11N'), 'input', restart); $('#c11Go').addEventListener('click', restart);
  langHooks.push(() => { out('c11P', pc(S.p, 1)); readouts(); }); restart();
})();

applyLang();
requestAnimationFrame(loop);
})();
