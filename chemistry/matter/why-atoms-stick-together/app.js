/* Why atoms stick together: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html,
   written by tools/diagrams.cjs). The runtime head follows how-a-cpu-does-math/app.js. */
(() => {
'use strict';
const M = window.BondModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   content.en.md is a structural stub while the translation is pending: page.json declares "languages": {"en": "stub"},
   the build writes data-lang-en="stub" on <html>, and the page treats English as absent (falls back to Chinese and
   says so in <html lang>). specs/site-template.md §3a, §9a. */
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
const uEv = (x, d) => t('u.ev', { v: fmt(x, d == null ? 2 : d) });
const uKj = (x, d) => t('u.kj', { v: fmt(x, d == null ? 0 : d) });
const uBeta = (x, d) => t('u.beta', { v: fmt(x, d == null ? 2 : d) });
const uDeg = (x, d) => t('u.deg', { v: fmt(x, d == null ? 1 : d) });
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
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  for (const s of sims) if (s.vis) { if (s.step && !reduce && s.step(dt)) s.dirty = true; if (s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(loop);
}
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const sliderOut = (id, s) => put('#' + id + 'o', s);
const minus = s => String(s).replace('-', '−');

/* chart helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 30); }
}
function xTicks(c, f, items) { // items: [x, label]; skips labels that would collide
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function line(c, pts, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of pts) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function seg(c, x1, y1, x2, y2, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 1.5; c.setLineDash(dash || []); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r, hollow) { c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); if (hollow) { c.fillStyle = C.bg; c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.stroke(); } else { c.fillStyle = col; c.fill(); } }
function clipTo(c, f, fn) { c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip(); fn(); c.restore(); }

/* ═════════ ch1: particle in a box ═════════ */
(function ch1() {
  const cv = $('#bCv'); let L = 0.2;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 18, 52], 0, 1, Math.log10(0.05), Math.log10(500));
    axes(c, f, null, t('ch1.cv.e'));
    yTicks(c, f, [[-1, '0.1'], [0, '1'], [1, '10'], [2, '100']]);
    const cols = [[0.08, 0.44, 3, L, 'ch1.cv.narrow'], [0.56, 0.92, 6, 2 * L, 'ch1.cv.wide']];
    c.textAlign = 'center';
    cols.forEach(([a, b, nmax, width, key], k) => {
      c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; c.fillText(t(key), f.X((a + b) / 2), f.T + 2);
      for (let n = 1; n <= nmax; n++) {
        const y = f.Y(Math.log10(M.boxE(n, width))); if (y < f.T + 14 || y > f.B) continue;
        seg(c, f.X(a), y, f.X(b), y, n === 1 ? C.gold : C.mute, n === 1 ? 2.6 : 1.4);
        if (n <= (k ? 2 : 3)) { c.fillStyle = n === 1 ? C.gold : C.mute; if (w < 420) { if (y - 9 > f.T + 22) { c.textAlign = 'right'; c.fillText('n = ' + n, f.X(b), y - 9); } } else { c.textAlign = 'left'; c.fillText('n = ' + n, f.X(b) + 4, y); } }
      }
    });
    const y1 = f.Y(Math.log10(M.boxE(1, L))), y2 = f.Y(Math.log10(M.boxE(1, 2 * L)));
    seg(c, f.X(0.5), Math.max(y1, f.T + 14), f.X(0.5), Math.min(y2, f.B) - 5, C.green, 2);
    c.fillStyle = C.green; c.beginPath(); const ya = Math.min(y2, f.B); c.moveTo(f.X(0.5), ya); c.lineTo(f.X(0.5) - 5, ya - 9); c.lineTo(f.X(0.5) + 5, ya - 9); c.fill();
  } });
  function update() {
    L = +$('#bL').value; const r = M.boxMerge(L);
    sliderOut('bL', t('u.nm', { v: fmt(L, 2) }));
    put('#bE1', uEv(r.narrow)); put('#bE2', uEv(r.wide)); put('#bDrop', uEv(r.drop)); put('#bKj', uKj(r.dropKj));
    const v = { L: fmt(L, 2), e1: fmt(r.narrow, 2), e2: fmt(r.wide, 2), d: fmt(r.drop, 2), kj: fmt(r.dropKj, 0) };
    putHTML('#bSay', t(r.drop > 15 ? 'ch1.say.big' : r.drop >= 1 ? 'ch1.say.bond' : 'ch1.say.small', v));
    sim.dirty = true;
  }
  $('#bL').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch2: H2+ ═════════ */
(function ch2() {
  const cv = $('#hCv'), ev = M.K.hartreeEv; let cache = {};
  const curve = opt => { if (cache[opt]) return cache[opt]; const b = [], a = []; for (let R = 0.6; R <= 8.001; R += 0.05) { const d = opt ? M.h2plusOpt(R) : M.h2plus(R, 1); b.push([R, d.bind * ev]); a.push([R, d.antiRel * ev]); } return (cache[opt] = { b, a, min: M.h2plusMin(opt) }); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), opt = $('#hOpt').checked ? 1 : 0, R = +$('#hR').value, cu = curve(opt);
    const f = frame(w, h, [26, 14, 40, 44], 0.6, 8, -3.4, 4.2);
    axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    yTicks(c, f, [[-2, '−2'], [0, '0'], [2, '2'], [4, '4']]);
    xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8].map(x => [x, String(x)]));
    seg(c, f.L, f.Y(0), f.R, f.Y(0), C.mute, 1, [4, 4]);
    clipTo(c, f, () => { line(c, cu.a, f, C.red, 2); line(c, cu.b, f, C.gold, 2.4); });
    const ex = M.H2P_EXACT, xx = f.X(ex.R), xy = f.Y(-ex.De * ev);
    c.strokeStyle = C.violet; c.lineWidth = 2; c.beginPath(); c.arc(xx, xy, 6, 0, 6.283); c.stroke();
    c.fillStyle = C.violet; c.textAlign = 'left'; c.font = FONT; c.fillText(t('ch2.cv.exact'), xx + 11, xy + 1);
    const d = opt ? M.h2plusOpt(R) : M.h2plus(R, 1);
    seg(c, f.X(R), f.T, f.X(R), f.B, C.line, 1);
    const yb = f.Y(d.bind * ev), ya = f.Y(d.antiRel * ev);
    if (yb >= f.T && yb <= f.B) dot(c, f.X(R), yb, C.gold, 5); if (ya >= f.T && ya <= f.B) dot(c, f.X(R), ya, C.red, 5);
  } });
  function update() {
    const opt = $('#hOpt').checked ? 1 : 0, R = +$('#hR').value, d = opt ? M.h2plusOpt(R) : M.h2plus(R, 1), mn = curve(opt).min;
    sliderOut('hR', t('u.a0', { v: fmt(R, 2) }));
    put('#hRv', t('u.pm', { v: fmt(R * M.K.bohrA * 100, 0) })); put('#hS', fmt(d.S, 3));
    put('#hE', uEv(d.bind * ev)); put('#hA', uEv(d.antiRel * ev)); put('#hZ', fmt(d.zeta, 3));
    const dT = (d.bond.T - 0.5) * ev, dV = (d.bond.V + 1) * ev;
    put('#hT', (dT > 0 ? '+' : '') + uEv(dT)); put('#hV', (dV > 0 ? '+' : '') + uEv(dV));
    const v = { R: fmt(R, 2), pm: fmt(R * M.K.bohrA * 100, 0), e: fmt(Math.abs(d.bind * ev), 2), a: fmt(d.antiRel * ev, 2), S: fmt(d.S, 3), rmin: fmt(mn.R, 2) };
    const key = d.bind >= 0 ? 'ch2.say.close' : R >= 6 ? 'ch2.say.far' : Math.abs(R - mn.R) <= 0.1 ? 'ch2.say.min' : 'ch2.say.mid';
    putHTML('#hSay', t(key, v));
    sim.dirty = true;
  }
  $('#hR').addEventListener('input', update); $('#hOpt').addEventListener('change', update); langHooks.push(update); update();
})();

/* ═════════ ch3: Hückel ═════════ */
(function ch3() {
  const cv = $('#kCv'); let H = null;
  const sim = reg(cv, { draw() {
    if (!H) return;
    const { c, w, h } = fit(cv), N = H.N, split = w * 0.46;
    // molecule
    const pts = [];
    if (H.ring) { const r = Math.min(split, h) * 0.34, cx = split / 2, cy = h / 2; for (let i = 0; i < N; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / N; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } }
    else { const dx = (split - 28) / Math.max(1, N - 1), amp = Math.min(16, dx * 0.6); for (let i = 0; i < N; i++) pts.push([14 + i * dx, h / 2 + (i % 2 ? -amp : amp)]); }
    H.bonds.forEach((p, i) => { const a = pts[i], b = pts[(i + 1) % N]; seg(c, a[0], a[1], b[0], b[1], C.gold, 1.2 + 5 * Math.max(0, p)); });
    pts.forEach(p => dot(c, p[0], p[1], C.cyan, N > 14 ? 3 : 4.5));
    // levels
    const f = frame(w, h, [22, 12, 22, split + 30], 0, 1, 2.3, -2.3);
    seg(c, f.L, f.Y(0), f.R, f.Y(0), C.line, 1, [4, 4]);
    c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; c.fillText(t('ch3.cv.alpha'), f.L - 6, f.Y(0));
    c.textAlign = 'left'; c.fillText(t('ch3.cv.up'), f.L - 22, f.T - 10); c.fillText(t('ch3.cv.down'), f.L - 22, f.B + 11);
    for (let i = 0; i < N;) {
      let j = i; while (j + 1 < N && Math.abs(H.x[j + 1] - H.x[i]) < 1e-6) j++;
      const k = j - i + 1, y = f.Y(H.x[i]), W = f.R - f.L, each = (W - (k - 1) * 10) / k;
      for (let q = 0; q < k; q++) {
        const x0 = f.L + q * (each + 10), occ = H.occ[i + q];
        seg(c, x0, y, x0 + each, y, occ > 0 ? C.gold : C.mute, occ > 0 ? 2.2 : 1.4);
        const ne = Math.round(occ); for (let e = 0; e < ne; e++) dot(c, x0 + each / 2 + (ne === 2 ? (e ? 6 : -6) : 0), y, C.ink, N > 14 ? 2.2 : 3.2);
      }
      i = j + 1;
    }
  } });
  function update() {
    const N = +$('#kN').value, ring = $('#kRing').checked; H = M.huckel(N, ring);
    sliderOut('kN', String(N));
    put('#kTot', t('ch3.tot.v', { n: N, x: fmt(H.total, 2) })); put('#kDel', uBeta(H.deloc)); put('#kGap', uBeta(H.gap));
    const lam = M.huckelLambda(N, ring), ex = !H.ring && M.POLYENE_LMAX.find(q => q.N === N);
    put('#kLam', !H.ring && isFinite(lam) && N % 2 === 0 ? t('u.nm', { v: fmt(lam, 0) }) : t('u.none')); put('#kExp', ex ? t('u.nm', { v: fmt(ex.nm, 0) }) : t('u.none'));
    const v = { N, k: Math.floor(N / 2), d: fmt(H.deloc, 2), g: fmt(H.gap, 2), b: fmt(H.bonds[0], 2), lam: fmt(lam, 0), exp: ex ? fmt(ex.nm, 0) : '', name: ex ? ex.name : '' };
    let key;
    if (N % 2) key = 'ch3.say.odd'; else if (H.ring) key = N % 4 === 2 ? 'ch3.say.arom' : 'ch3.say.anti'; else key = ex ? 'ch3.say.chainExp' : 'ch3.say.chain';
    putHTML('#kSay', t(key, v));
    sim.dirty = true;
  }
  $('#kN').addEventListener('input', update); $('#kRing').addEventListener('change', update); langHooks.push(update); update();
})();

/* ═════════ ch4: two sites ═════════ */
(function ch4() {
  const cv = $('#tCv');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), D = +$('#tD').value, B = +$('#tB').value, r = M.twoSite(D, B);
    const top = 16, bot = h * 0.62, Y = e => top + (bot - top) * (6.8 - e) / 13.6;
    const xa = [w * 0.08, w * 0.28], xm = [w * 0.4, w * 0.6], xb = [w * 0.72, w * 0.92];
    const ya = Y(D / 2), yb = Y(-D / 2), y1 = Y(r.eBond), y2 = Y(r.eAnti);
    [[xa[1], ya], [xb[0], yb]].forEach(([x, y]) => { seg(c, x, y, x === xa[1] ? xm[0] : xm[1], y1, C.line, 1, [3, 3]); seg(c, x, y, x === xa[1] ? xm[0] : xm[1], y2, C.line, 1, [3, 3]); });
    seg(c, xa[0], ya, xa[1], ya, C.cyan, 2.4); seg(c, xb[0], yb, xb[1], yb, C.cyan, 2.4);
    seg(c, xm[0], y1, xm[1], y1, C.gold, 2.6); seg(c, xm[0], y2, xm[1], y2, C.red, 2);
    dot(c, w / 2 - 6, y1, C.ink, 3.2); dot(c, w / 2 + 6, y1, C.ink, 3.2);
    c.font = FONT; c.textAlign = 'center'; c.fillStyle = C.cyan;
    c.fillText(t('ch4.cv.a'), (xa[0] + xa[1]) / 2, ya - 12); c.fillText(t('ch4.cv.b'), (xb[0] + xb[1]) / 2, yb - 12);
    c.fillStyle = C.gold; c.fillText(t('ch4.cv.bond'), w / 2, y1 + 13); c.fillStyle = C.red; c.fillText(t('ch4.cv.anti'), w / 2, y2 - 12);
    // the electron pair's share on each atom
    const cy = bot + (h - bot) / 2 + 4, rmax = Math.min((h - bot) / 2 - 6, w * 0.12);
    [[w * 0.32, r.wHigh], [w * 0.68, r.wLow]].forEach(([x, wt]) => { c.fillStyle = 'rgba(233,185,73,0.28)'; c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.arc(x, cy, 3 + rmax * Math.sqrt(wt), 0, 6.283); c.fill(); c.stroke(); dot(c, x, cy, C.cyan, 3.5); });
    seg(c, w * 0.32, cy, w * 0.68, cy, C.line, 1);
  } });
  function update() {
    const D = +$('#tD').value, B = +$('#tB').value, r = M.twoSite(D, B);
    sliderOut('tD', uEv(D, 1)); sliderOut('tB', uEv(B, 1));
    put('#tW', pct(r.wLow, 0)); put('#tQ', '−' + fmt(r.charge, 2) + ' e'); put('#tSplit', uEv(r.split)); put('#tSt', uEv(r.stabil));
    const v = { w: pct(r.wLow, 0), q: fmt(r.charge, 2), st: fmt(r.stabil, 2), r: fmt(D / B, 1) };
    putHTML('#tSay', t(r.charge < 0.1 ? 'ch4.say.cov' : r.charge < 0.5 ? 'ch4.say.polar' : r.charge < 0.9 ? 'ch4.say.mostly' : 'ch4.say.ion', v));
    sim.dirty = true;
  }
  $('#tD').addEventListener('input', update); $('#tB').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch4: Madelung sums ═════════ */
(function ch4m() {
  const cv = $('#mCv'), NMAX = 12, S = []; for (let n = 1; n <= NMAX; n++) S.push(M.madelungNaCl(n));
  const YM = Math.ceil(Math.max(...S.map(s => Math.abs(s.sphere))) + 0.6);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), n = +$('#mN').value, f = frame(w, h, [20, 16, 40, 40], 1, NMAX, -YM, YM);
    axes(c, f, t('ch4.mad.cv.x'), null);
    yTicks(c, f, [[-6, '−6'], [-3, '−3'], [0, '0'], [3, '3'], [6, '6']]);
    xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(x => [x, String(x)]));
    seg(c, f.L, f.Y(M.MADELUNG_NACL), f.R, f.Y(M.MADELUNG_NACL), C.mute, 1, [4, 4]);
    c.fillStyle = C.mute; c.textAlign = 'right'; c.font = FONT; c.fillText(t('ch4.mad.cv.ref'), f.R, f.Y(M.MADELUNG_NACL) - 11);
    [['sphere', C.red], ['cube', C.cyan], ['evjen', C.gold]].forEach(([k, col]) => {
      c.globalAlpha = 0.28; line(c, S.map((s, i) => [i + 1, s[k]]), f, col, 1.5); c.globalAlpha = 1;
      line(c, S.slice(0, n).map((s, i) => [i + 1, s[k]]), f, col, 2.2);
      dot(c, f.X(n), f.Y(S[n - 1][k]), col, 4.5);
    });
  } });
  function update() {
    const n = +$('#mN').value, s = S[n - 1];
    sliderOut('mN', String(n));
    put('#mSph', fmt(s.sphere, 3)); put('#mCube', fmt(s.cube, 3)); put('#mEv', fmt(s.evjen, 4)); put('#mChain', fmt(M.madelungChain(n), 3)); put('#mU', uKj(M.bornLande(s.evjen)));
    const v = { n, ev: fmt(s.evjen, 4), sph: fmt(s.sphere, 2), cube: fmt(s.cube, 3), d: fmt(Math.abs(s.evjen - M.MADELUNG_NACL), 4) };
    putHTML('#mSay', t(n === 1 ? 'ch4.mad.say.one' : 'ch4.mad.say.n', v));
    sim.dirty = true;
  }
  $('#mN').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch5: tight-binding chain ═════════ */
(function ch5() {
  const cv = $('#gCv'); let T = null;
  const sim = reg(cv, { draw() {
    if (!T) return;
    const { c, w, h } = fit(cv), f = frame(w, h, [26, 76, 16, 40], 0, 1, -3.1, 3.1);
    axes(c, f, null, t('ch5.cv.e'));
    yTicks(c, f, [[-2, '−2'], [0, '0'], [2, '2']]);
    T.E.forEach((E, i) => seg(c, f.L + 6, f.Y(E), f.R, f.Y(E), i < T.nOcc ? C.gold : C.mute, i < T.nOcc ? 1.8 : 1.2));
    const y1 = f.Y(T.homo), y2 = f.Y(T.lumo);
    if (y1 - y2 >= 16) {
      const x = f.R + 10; seg(c, x, y1, x, y2, C.cyan, 1.5); seg(c, x - 4, y1, x + 4, y1, C.cyan, 1.5); seg(c, x - 4, y2, x + 4, y2, C.cyan, 1.5);
      c.fillStyle = C.cyan; c.textAlign = 'left'; c.font = FONT; c.fillText(t('ch5.cv.gap'), x + 8, (y1 + y2) / 2);
    }
  } });
  function update() {
    const N = +$('#gN').value, D = +$('#gD').value; T = M.tbChain(N, D);
    sliderOut('gN', String(N)); sliderOut('gD', uBeta(D, 1));
    const gev = T.gap * M.TB_BETA_EV, car = M.carrierFactor(gev, 300), carS = car > 0.001 ? pct(car, 1) : M.sci(car, 0);
    put('#gW', uBeta(T.width)); put('#gGap', uBeta(T.gap, 3)); put('#gEv', uEv(gev)); put('#gCar', carS);
    const v = { N, g: fmt(T.gap, 3), D: fmt(D, 1), b: String(M.TB_BETA_EV), ev: fmt(gev, 2), car: carS };
    putHTML('#gSay', t(D === 0 ? 'ch5.say.metal' : gev <= 3 ? 'ch5.say.semi' : 'ch5.say.ins', v));
    sim.dirty = true;
  }
  $('#gN').addEventListener('input', update); $('#gD').addEventListener('input', update); langHooks.push(update); update();
})();

/* ═════════ ch6: electron pairs on a sphere; hybrid angle ═════════ */
(function ch6() {
  const cv = $('#vCv'); let P = null, n = 4, seed = 1, settled = false, phi = 0.6, lastKey = '';
  function start() { n = +radioVal('vN'); P = M.thomsonInit(n, seed); settled = false; if (reduce) { for (let i = 0; i < 20000; i++) if (M.thomsonStep(P, 0.05) < 1e-10) break; settled = true; } text(); sim.dirty = true; }
  function text() {
    const name = t('ch6.shape.' + ('n' + n));
    put('#vName', name); put('#vE', fmt(M.thomsonEnergy(P), 4));
    if (settled) {
      const a = M.thomsonAngles(P).map(q => uDeg(q.deg, 1)).join(' / ');
      put('#vAng', a); putHTML('#vSay', t('ch6.say', { n, name, a }));
    } else { put('#vAng', t('u.none')); putHTML('#vSay', t('ch6.say.run', { n })); }
  }
  const sim = reg(cv, {
    step(dt) {
      phi += dt * 0.5;
      if (!settled) { let mx = 0; const k = Math.max(1, Math.round(dt * 500)); for (let i = 0; i < k; i++) mx = M.thomsonStep(P, 0.05); if (mx < 2e-5) { for (let i = 0; i < 20000; i++) if (M.thomsonStep(P, 0.05) < 1e-10) break; settled = true; } const key = settled + '|' + fmt(M.thomsonEnergy(P), 2); if (key !== lastKey) { lastKey = key; text(); } }
      return true;
    },
    draw() {
      const { c, w, h } = fit(cv), cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38, tilt = 0.35;
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke();
      const pr = P.map(p => { const x = p[0] * Math.cos(phi) + p[2] * Math.sin(phi), z0 = -p[0] * Math.sin(phi) + p[2] * Math.cos(phi), y = p[1] * Math.cos(tilt) - z0 * Math.sin(tilt), z = p[1] * Math.sin(tilt) + z0 * Math.cos(tilt); return [cx + R * x, cy - R * y, z]; }).sort((a, b) => a[2] - b[2]);
      let center = false;
      const nucleus = () => { dot(c, cx, cy, C.cyan, 7); center = true; };
      pr.forEach(p => { if (!center && p[2] > 0) nucleus(); const k = 0.55 + 0.45 * (p[2] + 1) / 2; c.globalAlpha = k; seg(c, cx, cy, p[0], p[1], C.gold, 2 + 3 * k); dot(c, p[0], p[1], C.gold, 6 + 6 * k); c.globalAlpha = 1; });
      if (!center) nucleus();
    }
  });
  function hyb() {
    const a = +$('#vA').value, r = M.hybridFromAngle(a);
    sliderOut('vA', uDeg(a, 1));
    if (a <= 90.4 || !isFinite(r.n)) { putHTML('#vHyb', t('ch6.hyb.p')); putHTML('#vSay2', t('ch6.say2.p', { a: uDeg(a, 1) })); }
    else { const v = { n: fmt(r.n, r.n >= 10 ? 0 : 2), s: pct(r.s, 1), a: uDeg(a, 1) }; putHTML('#vHyb', t('ch6.hyb.v', v)); putHTML('#vSay2', t('ch6.say2.h', v)); }
  }
  onAll($$('input[name=vN]'), 'change', () => { seed++; start(); });
  $('#vShake').addEventListener('click', () => { seed++; start(); });
  $('#vA').addEventListener('input', hyb);
  langHooks.push(() => { text(); hyb(); }); start(); hyb();
})();

/* ═════════ ch7: Lennard-Jones molecular dynamics ═════════ */
(function ch7() {
  const cv = $('#jCv'), DT = 0.01; let S = M.mdInit({ T: 0.2 }), avg = null, sayClock = 1, lastSay = '';
  const target = () => ($('#jThermo').checked ? +$('#jT').value : null);
  function sample(reset) { const o = M.mdOrder(S), a = reset || !avg ? 1 : 0.06; if (reset || !avg) avg = { mean: o.mean, free: o.free, psi6: o.psi6, core: o.core, T: S.T }; else for (const k of ['mean', 'free', 'psi6', 'core']) avg[k] += a * (o[k] - avg[k]); avg.T += a * (S.T - avg.T); return o; }
  function forward(n) { M.mdRun(S, n, DT, target()); avg = null; const acc = { mean: 0, free: 0, psi6: 0, core: 0, T: 0 }; for (let i = 0; i < 10; i++) { M.mdRun(S, 30, DT, target()); const o = M.mdOrder(S); acc.mean += o.mean / 10; acc.free += o.free / 10; acc.psi6 += o.psi6 / 10; acc.core += o.core / 10; acc.T += S.T / 10; } avg = acc; }
  function text(force) {
    if (!avg) sample(true);
    put('#jTm', fmt(avg.T, 2) + ' ε/k'); put('#jAr', t('u.k', { v: fmt(avg.T * M.LJ.argonEpsK, 0) }));
    put('#jPe', minus(fmt(S.pe / S.N, 2)) + ' ε'); put('#jNb', fmt(avg.mean, 1)); put('#jFree', pct(avg.free, 0)); put('#jE', fmt((S.pe + S.ke) / S.N, 3) + ' ε');
    const ph = M.mdPhase(avg), s = t('ch7.say.' + ph, { T: fmt(avg.T, 2), nb: fmt(avg.mean, 1), free: pct(avg.free, 0) });
    if (force || sayClock <= 0 || !lastSay) { if (s !== lastSay) { putHTML('#jSay', s); lastSay = s; } sayClock = 0.6; }
  }
  const sim = reg(cv, {
    step(dt) { const k = Math.min(30, Math.max(1, Math.round(dt * 500))); M.mdRun(S, k, DT, target()); sample(false); sayClock -= dt; text(false); return true; },
    draw() {
      const { c, w, h } = fit(cv), sc = Math.min((w - 16) / S.W, (h - 16) / S.H), ox = (w - S.W * sc) / 2, oy = (h - S.H * sc) / 2, o = M.mdOrder(S);
      c.strokeStyle = C.line; c.lineWidth = 1.5; c.strokeRect(ox, oy, S.W * sc, S.H * sc);
      const r = Math.max(2.5, sc * 0.5);
      for (let i = 0; i < S.N; i++) { const nb = o.nb[i]; c.fillStyle = nb >= 5 ? C.gold : nb >= 2 ? C.cyan : C.mute; c.beginPath(); c.arc(ox + S.x[i] * sc, oy + S.y[i] * sc, r, 0, 6.283); c.fill(); }
    }
  });
  function retarget() { sliderOut('jT', fmt(+$('#jT').value, 2) + ' ε/k'); }
  $('#jT').addEventListener('input', () => { $('#jThermo').checked = true; retarget(); forward(reduce ? 6000 : 1500); text(true); sim.dirty = true; });
  $('#jThermo').addEventListener('change', () => { text(true); });
  $('#jReset').addEventListener('click', () => { S = M.mdInit({ T: Math.min(0.2, +$('#jT').value) }); forward(reduce ? 6000 : 300); text(true); sim.dirty = true; });
  const stepBtn = $('#jStep'); if (reduce) stepBtn.hidden = false;
  stepBtn.addEventListener('click', () => { forward(500); text(true); sim.dirty = true; });
  langHooks.push(() => { retarget(); lastSay = ''; text(true); });
  retarget(); forward(reduce ? 12000 : 6000); text(true);
})();

/* ═════════ ch8: freely jointed chain ═════════ */
(function ch8() {
  const cv = $('#pCv'); let ch = null, seed = 3;
  const Nof = () => Math.round(Math.pow(10, 1 + 2.4771 * (+$('#pN').value) / 100));
  const sim = reg(cv, { draw() {
    if (!ch) return;
    const { c, w, h } = fit(cv); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i <= ch.N; i++) { x0 = Math.min(x0, ch.x[i]); x1 = Math.max(x1, ch.x[i]); y0 = Math.min(y0, ch.y[i]); y1 = Math.max(y1, ch.y[i]); }
    const sc = Math.min((w - 30) / Math.max(1, x1 - x0), (h - 30) / Math.max(1, y1 - y0)), X = x => w / 2 + (x - (x0 + x1) / 2) * sc, Y = y => h / 2 + (y - (y0 + y1) / 2) * sc;
    c.strokeStyle = C.gold; c.lineWidth = ch.N > 400 ? 1 : 1.6; c.lineJoin = 'round'; c.beginPath(); c.moveTo(X(ch.x[0]), Y(ch.y[0])); for (let i = 1; i <= ch.N; i++) c.lineTo(X(ch.x[i]), Y(ch.y[i])); c.stroke();
    seg(c, X(ch.x[0]), Y(ch.y[0]), X(ch.x[ch.N]), Y(ch.y[ch.N]), C.red, 2, [5, 4]);
    dot(c, X(ch.x[0]), Y(ch.y[0]), C.red, 4.5); dot(c, X(ch.x[ch.N]), Y(ch.y[ch.N]), C.red, 4.5);
  } });
  function update() {
    const N = Nof(); ch = M.chain(N, seed); const rms = M.chainRms(N, 400, 11);
    sliderOut('pN', fmt(N, 0));
    put('#pLen', fmt(N, 0)); put('#pR', fmt(ch.R, 1)); put('#pRms', fmt(rms, 1)); put('#pSq', fmt(Math.sqrt(N), 1));
    putHTML('#pSay', t('ch8.say', { N: fmt(N, 0), rms: fmt(rms, 1), sq: fmt(Math.sqrt(N), 1), x: fmt(N / rms, 1) }));
    sim.dirty = true;
  }
  $('#pN').addEventListener('input', update); $('#pNew').addEventListener('click', () => { seed++; update(); }); langHooks.push(update); update();
})();

/* ═════════ ch9: HP lattice model ═════════ */
(function ch9() {
  const cv = $('#fCv'); let key = 's12', dirs = M.HP_START.s12, blocked = false, shown = false;
  const seq = () => M.HP_SEQS[key];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = seq(), f = M.hpFold(s, dirs), xs = f.pts.map(p => p[0]), ys = f.pts.map(p => p[1]);
    const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
    const sc = Math.min(46, (w - 24) / (x1 - x0), (h - 24) / (y1 - y0)), X = x => w / 2 + (x - (x0 + x1) / 2) * sc, Y = y => h / 2 - (y - (y0 + y1) / 2) * sc;
    for (let i = Math.ceil(x0); i <= x1; i++) for (let j = Math.ceil(y0); j <= y1; j++) dot(c, X(i), Y(j), C.grid, 2);
    f.contacts.forEach(([i, j]) => seg(c, X(f.pts[i][0]), Y(f.pts[i][1]), X(f.pts[j][0]), Y(f.pts[j][1]), C.red, 2.4, [3, 4]));
    for (let i = 1; i < f.pts.length; i++) seg(c, X(f.pts[i - 1][0]), Y(f.pts[i - 1][1]), X(f.pts[i][0]), Y(f.pts[i][1]), C.mute, 3);
    const r = Math.max(4, Math.min(11, sc * 0.3));
    f.pts.forEach((p, i) => dot(c, X(p[0]), Y(p[1]), s[i] === 'H' ? C.gold : C.cyan, r, s[i] !== 'H'));
    if (!f.done) { const p = f.pts[f.pts.length - 1]; c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.arc(X(p[0]), Y(p[1]), r + 4, 0, 6.283); c.stroke(); }
  } });
  function update() {
    const s = seq(), f = M.hpFold(s, dirs), best = M.hpBest(s), n = s.length, i = f.pts.length;
    put('#fPlaced', t('ch9.placed.v', { i, n })); put('#fE', t('ch9.e.v', { v: f.contacts.length })); put('#fBestE', t('ch9.e.v', { v: -best.energy }));
    put('#fCount', fmt(best.count, 0)); put('#fDeg', t('ch9.deg.v', { v: best.degeneracy }));
    const last = f.pts[i - 1], occ = new Set(f.pts.map(p => p[0] + ',' + p[1]));
    const stuck = !f.done && Object.values(M.DIRS).every(d => occ.has((last[0] + d[0]) + ',' + (last[1] + d[1])));
    const v = { i, n, left: n - i, e: f.contacts.length, best: -best.energy, count: fmt(best.count, 0), deg: best.degeneracy };
    let k;
    if (blocked) k = 'ch9.say.blocked'; else if (shown) k = 'ch9.say.shown'; else if (f.done) k = f.energy === best.energy ? 'ch9.say.doneBest' : 'ch9.say.done'; else if (stuck) k = 'ch9.say.stuck'; else if (i === 1) k = 'ch9.say.start'; else k = 'ch9.say.going';
    putHTML('#fSay', t(k, v));
    sim.dirty = true;
  }
  function move(d) {
    const s = seq(); shown = false;
    if (dirs.length >= s.length - 1) { blocked = false; update(); return; }
    const f = M.hpFold(s, dirs + d); blocked = !f.valid; if (f.valid) dirs += d; update();
  }
  ['U', 'D', 'L', 'R'].forEach(d => $('#f' + d).addEventListener('click', () => move(d)));
  $('#fUndo').addEventListener('click', () => { dirs = dirs.slice(0, -1); blocked = false; shown = false; update(); });
  $('#fReset').addEventListener('click', () => { dirs = ''; blocked = false; shown = false; update(); });
  $('#fBest').addEventListener('click', () => { dirs = M.hpBest(seq()).dirs; blocked = false; shown = true; update(); });
  onAll($$('input[name=fSeq]'), 'change', () => { key = radioVal('fSeq'); dirs = M.HP_START[key]; blocked = false; shown = false; update(); });
  langHooks.push(update); update();
})();

/* ═════════ ch10: cost scaling ═════════ */
(function ch10() {
  const cv = $('#sCv'), YEAR = 525960;
  const XS = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50, 60, 80, 100];
  const xOf = () => XS[+$('#sX').value];
  const nice = (v, lim) => fmt(v, v < lim && Math.abs(v - Math.round(v)) > 0.04 ? 1 : 0);
  function dur(min, short) {
    if (min < 1) return t('u.sec', { v: fmt(min * 60, 0) });
    if (min < 60) return t('u.min', { v: nice(min, 10) });
    if (min < 1440) return t('u.hour', { v: nice(min / 60, 10) });
    if (min < YEAR) return t('u.day', { v: nice(min / 1440, 10) });
    const y = min / YEAR; return t('u.year', { v: y < 1e4 ? nice(y, 10) : M.sci(y, short ? 0 : 1) });
  }
  const ROWS = [['mlip', null], ['dft', 'DFT'], ['hf', 'HF'], ['ccsd', 'CCSD'], ['ccsdt', 'CCSD(T)']];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), x = xOf(), L = Math.min(96, w * 0.3), f = frame(w, h, [8, 14, 26, L], 0, 14.3, 0, 1), rh = (f.B - f.T) / ROWS.length;
    xTicks(c, f, [[0, dur(1)], [Math.log10(60), dur(60)], [Math.log10(1440), dur(1440)], [Math.log10(YEAR), dur(YEAR)], [Math.log10(YEAR * 1e3), dur(YEAR * 1e3)], [Math.log10(YEAR * 1e6), dur(YEAR * 1e6, true)]]);
    ROWS.forEach(([m, name], i) => {
      const y = f.T + i * rh + rh / 2, v = Math.log10(M.costFactor(m, x));
      c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; c.fillText(name || t('ch10.cv.mlip'), f.L - 8, y);
      c.fillStyle = C.card2; c.fillRect(f.L, y - 7, f.R - f.L, 14);
      c.fillStyle = m === 'ccsdt' ? C.red : m === 'mlip' ? C.green : m === 'dft' ? C.cyan : C.mute; c.fillRect(f.L, y - 7, Math.max(2, f.X(v) - f.L), 14);
    });
  } });
  function update() {
    const x = xOf();
    sliderOut('sX', t('u.x', { v: nice(x, 10) }));
    put('#sMl', dur(M.costFactor('mlip', x))); put('#sDft', dur(M.costFactor('dft', x))); put('#sHf', dur(M.costFactor('hf', x))); put('#sCc', dur(M.costFactor('ccsdt', x)));
    putHTML('#sSay', x <= 1.0001 ? t('ch10.say.one') : t('ch10.say.x', { x: nice(x, 10), dft: dur(M.costFactor('dft', x)), cc: dur(M.costFactor('ccsdt', x)), g: fmt(M.sizeForBudget('ccsdt', 1000), 1) }));
    sim.dirty = true;
  }
  $('#sX').addEventListener('input', update); langHooks.push(update); update();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
