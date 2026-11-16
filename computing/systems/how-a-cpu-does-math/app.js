/* How a CPU does math: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated from
   content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows how-a-gpu-computes/app.js. */
(() => {
'use strict';
const M = window.CpuMathModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
const sci = (x, d) => M.sci(x, d);
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
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
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
function loop() { for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); } requestAnimationFrame(loop); }
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const FMTNAME = { fp64: 'FP64', fp32: 'FP32', tf32: 'TF32', fp16: 'FP16', bf16: 'BF16', e5m2: 'FP8 E5M2', e4m3: 'FP8 E4M3', e3m2: 'FP6 E3M2', e2m3: 'FP6 E2M3', e2m1: 'FP4 E2M1' };

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
function xTicks(c, f, items) { // items: [x, label]; skip labels that would collide
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14) continue; c.fillText(s, f.L - 6, py); lastY = py; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); }
}
function line(c, pts, f, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []); c.beginPath(); let first = true; for (const [x, y] of pts) { if (!isFinite(y)) { first = true; continue; } const px = f.X(x), py = f.Y(y); if (first) c.moveTo(px, py); else c.lineTo(px, py); first = false; } c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
// fit a label into width by shrinking (never below 10 px on canvas)
function fitText(c, s, maxW, base) { base = base || 12; let fs = base; c.font = FONT.replace('12px', fs + 'px'); while (c.measureText(s).width > maxW && fs > 10) { fs -= 0.5; c.font = FONT.replace('12px', fs + 'px'); } }
const sup = k => M.pow2s(k);

/* ═════════ ch1: encode a number ═════════ */
(function ch1() {
  const inp = $('#eIn'), bitsEl = $('#eBits');
  let code = null, fk = 'fp32', fromBits = false;
  function render() {
    fk = radioVal('eFmt');
    const F = M.FMT[fk];
    let d;
    if (fromBits && code != null) d = M.fromCode(code, fk);
    else { d = M.encode(inp.value, fk); if (!d.ok) { put('#eSay', t('ch1.say.bad')); return; } code = d.code; }
    // bits: buttons for ≤ 32-bit formats, read-only text for FP64
    const f = d.fields, all = f.sign + f.exp + f.man;
    if (F.bits <= 32) {
      if (bitsEl.children.length !== F.bits || bitsEl.dataset.fk !== fk || bitsEl.dataset.lang !== effLang()) {
        bitsEl.innerHTML = ''; bitsEl.dataset.fk = fk; bitsEl.dataset.lang = effLang();
        for (let i = 0; i < F.bits; i++) {
          const b = document.createElement('button'); b.type = 'button';
          b.className = i === 0 ? 's' : i <= F.eb ? 'e' : 'm';
          b.dataset.i = i;
          bitsEl.appendChild(b);
        }
      }
      [...bitsEl.children].forEach((b, i) => {
        const v = all[i]; if (b.textContent !== v) b.textContent = v; b.setAttribute('aria-pressed', String(v === '1'));
        const role = i === 0 ? t('ch1.bit.s') : i <= F.eb ? t('ch1.bit.e') : t('ch1.bit.m');
        b.setAttribute('aria-label', t('ch1.bit.aria', { i: F.bits - 1 - i, role, v }));
      });
    } else { bitsEl.innerHTML = `<p class="exact">${f.sign} <span style="color:var(--cyan)">${f.exp}</span> <span style="color:var(--gold)">${f.man}</span></p>`; bitsEl.dataset.fk = fk; }
    put('#eHex', d.hex);
    put('#eExp', d.cls === 'norm' ? t('ch1.read.expv', { E: d.expField, b: F.bias, k: String(d.unbiased).replace('-', '−') }) : d.cls === 'sub' || d.cls === 'zero' ? t('ch1.read.exp0') : t('ch1.read.expTop'));
    put('#eExact', d.exact);
    const name = FMTNAME[fk];
    if (fromBits) {
      put('#eErr', '—'); put('#eRel', '—');
      put('#eSay', d.cls === 'nan' ? t('ch1.say.nan') : d.cls === 'inf' ? t('ch1.say.infBits') : t('ch1.say.bits', { v: d.exact.length > 40 ? d.exact.slice(0, 40) + '…' : d.exact }));
      return;
    }
    const e = d.err, x = inp.value.trim();
    put('#eErr', d.cls === 'inf' ? '∞' : e.abs === 0 ? '0' : e.str);
    put('#eRel', d.cls === 'inf' ? '∞' : e.rel === 0 ? '0' : sci(e.rel, 2));
    let key, vars = { x: esc(x), fmt: name, v: d.exact.length > 30 ? d.exact.slice(0, 30) + '…' : d.exact, err: e.str, rel: sci(e.rel, 2), max: sci(F.max, 3) };
    if (d.cls === 'inf') key = 'ch1.say.inf';
    else if (d.cls === 'zero' && d.input.N !== 0n) key = 'ch1.say.zero';
    else if (e.abs === 0) key = 'ch1.say.exact';
    else if (d.cls === 'sub') key = 'ch1.say.sub';
    else key = 'ch1.say.norm';
    putHTML('#eSay', t(key, vars));
  }
  inp.addEventListener('input', () => { fromBits = false; render(); });
  onAll($$('input[name=eFmt]'), 'change', () => { if (fromBits && code != null) { fromBits = false; } render(); });
  bitsEl.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const F = M.FMT[fk], i = +b.dataset.i;
    code = BigInt(code) ^ (1n << BigInt(F.bits - 1 - i)); fromBits = true; render();
    const nb = bitsEl.children[i]; if (nb) nb.focus();
  });
  langHooks.push(render);
  render();
})();

/* number helpers for the labs */
function nice(x, sig) {
  sig = sig || 6;
  if (x === 0) return '0';
  if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : 'NaN';
  const a = Math.abs(x);
  if (Number.isInteger(x) && a < 1e15) return fmt(x, 0);
  if (a >= 1e7 || a < 1e-3) return sci(x, Math.min(sig - 1, 3));
  const d = Math.max(0, sig - 1 - Math.floor(Math.log10(a)));
  let s = fmt(x, d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
const relS = r => (r === 0 ? '0' : !isFinite(r) ? '∞' : r >= 0.01 ? pct(r, r < 1 ? 1 : 0) : sci(r, 1));
const sliderOut = (id, s) => put('#' + id + 'o', s);
function rangeLab(sel, fn) { const e = $(sel); e.addEventListener('input', fn); return e; }
function hbars(c, w, h, rows, o) { // rows: [label, value, colour]; o: {x0, x1, log, ticks, unit}
  const L = Math.min(130, w * 0.36), R = w - 64, T = 10, rh = (h - T - 26) / rows.length;
  const X = v => L + (R - L) * Math.max(0, Math.min(1, ((o.log ? Math.log10(Math.max(v, o.x0)) : v) - (o.log ? Math.log10(o.x0) : o.x0)) / ((o.log ? Math.log10(o.x1) : o.x1) - (o.log ? Math.log10(o.x0) : o.x0))));
  let lastR = -Infinity;
  (o.ticks || []).forEach(([v, s]) => { const px = X(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(px, T); c.lineTo(px, h - 22); c.stroke(); c.font = FONT; const tw = c.measureText(s).width, cx = Math.min(Math.max(px, L + tw / 2), R); if (cx - tw / 2 < lastR + 8) return; c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(s, cx, h - 10); lastR = cx + tw / 2; });
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2;
    c.fillStyle = C.ink; c.textAlign = 'right'; fitText(c, lab, L - 10); c.fillText(lab, L - 8, y); c.font = FONT;
    c.fillStyle = col; const bw = Math.max(2, X(v) - L); c.fillRect(L, y - Math.min(9, rh * 0.32), bw, Math.min(18, rh * 0.64));
    c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, Math.min(L + bw + 6, R + 4), y);
  });
}

/* ═════════ ch2: spacing ═════════ */
(function ch2() {
  const cv = $('#c2Cv'), sl = $('#c2X');
  let S = {};
  function update() {
    const fk = radioVal('c2Fmt'), F = M.FMT[fk];
    const kmax = Math.min(40, Math.floor(Math.log2(F.max) * 4) / 4), kmin = Math.max(-16, Math.ceil(Math.log2(F.minSub)));
    sl.min = kmin; sl.max = kmax; if (+sl.value > kmax) sl.value = kmax; if (+sl.value < kmin) sl.value = kmin;
    const k = +sl.value, x = Math.pow(2, k), p = M.plusOne(x, fk), ulp = p.ulp, rel = ulp / p.xs;
    S = { fk, F, k, kmin, kmax, rel };
    sliderOut('c2X', sup(Math.floor(k)) + (k % 1 ? ' × ' + fmt(Math.pow(2, k % 1), 2) : ''));
    put('#c2V', nice(p.xs, 9)); put('#c2Ulp', nice(ulp, 4)); put('#c2Rel', sci(rel, 2)); put('#c2Plus', nice(p.sum, 9));
    let s;
    const v = { x: nice(p.xs, 9), ulp: nice(ulp, 4), s: nice(p.sum, 9) };
    if (p.sum !== p.xs) s = t('ch2.say.ok', v); else if (ulp === 2) s = t('ch2.say.half', v); else s = t('ch2.say.lost', v);
    if (p.xs >= 60) s += ' ' + t('ch2.say.clock', { h: nice(p.xs / 3600, 3), ms: nice(ulp * 1000, 4) });
    putHTML('#c2Say', s);
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), F = S.F;
    const yLo = -F.mb - 2, yHi = Math.max(-F.mb + 2, Math.min(0, Math.ceil(Math.log2(F.minSub / Math.pow(2, S.kmin))) + 1));
    const f = frame(w, h, [26, 14, 40, 48], S.kmin, S.kmax, yLo, yHi);
    const step = (S.kmax - S.kmin) > 30 ? 8 : 4, ticks = [];
    for (let k = Math.ceil(S.kmin / step) * step; k <= S.kmax; k += step) ticks.push([k, sup(k)]);
    xTicks(c, f, ticks);
    const yt = []; for (let y = Math.ceil(yLo); y <= yHi; y += 2) yt.push([y, sup(y)]);
    yTicks(c, f, yt);
    axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    const lon = Math.log2(F.minNormal);
    if (lon > S.kmin) { c.fillStyle = 'rgba(179,157,251,.10)'; c.fillRect(f.L, f.T, f.X(lon) - f.L, f.B - f.T); c.fillStyle = C.violet; c.textAlign = 'left'; if (f.X(lon) - f.L > c.measureText(t('ch2.cv.sub')).width + 8) c.fillText(t('ch2.cv.sub'), f.L + 4, f.T + 10); }
    // exact sawtooth: inside binade k, log2(ulp/x) = k − mb − log2 x, a straight line; below the normal range ulp = minSub
    const lsub = Math.log2(F.minSub), pts = [];
    if (lon > S.kmin) pts.push([S.kmin, lsub - S.kmin], [lon, lsub - lon]);
    for (let k = Math.max(Math.floor(S.kmin), lon); k < S.kmax; k++) { const a = Math.max(k, S.kmin), b = Math.min(k + 1, S.kmax); pts.push([a, k - F.mb - a], [b - 1e-9, k - F.mb - b]); }
    line(c, pts, f, C.cyan, 1.6);
    dot(c, f.X(S.k), f.Y(Math.log2(S.rel)), C.gold, 5);
  } });
  rangeLab('#c2X', update); onAll($$('input[name=c2Fmt]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch3: rounding modes ═════════ */
(function ch3() {
  const cv = $('#c3Cv'), NS = [100, 300, 1000, 3000, 10000, 30000, 100000];
  const COL = { rne: C.gold, rtz: C.cyan, ru: C.red, rd: C.violet, sr: C.green };
  let S = {};
  function update() {
    const fk = radioVal('c3Fmt'), d = +radioVal('c3D'), N = NS[+$('#c3N').value];
    sliderOut('c3N', fmt(N, 0));
    const R = {}; M.MODES.forEach(m => { R[m] = M.accumulate(fk, d, N, m, 7, 240); });
    const ex = R.rne.exact;
    S = { R, ex, N };
    M.MODES.forEach(m => put('#c3' + m, nice(R[m].final, 7))); put('#c3ex', nice(ex, 7));
    const st = M.stallPoint(fk, d, N), v = { rne: nice(R.rne.final, 7), rtz: nice(R.rtz.final, 7), ru: nice(R.ru.final, 7), sr: nice(R.sr.final, 7), ex: nice(ex, 7) };
    let s;
    if (st) s = t('ch3.say.stall', Object.assign(v, { i: fmt(st.step - 1, 0), v: nice(st.value, 7), gap: nice(M.ulpAt(st.value, fk), 4) }));
    else s = t('ch3.say.noStall', Object.assign(v, { rel: relS(Math.abs(R.rne.final - ex) / ex) }));
    if (R.ru.final / ex > 1.5) s += ' ' + t('ch3.say.ru', { ru: v.ru, x: fmt(R.ru.final / ex, 1) });
    putHTML('#c3Say', s); sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv);
    const ymax = Math.max(S.ex, ...M.MODES.map(m => S.R[m].final).filter(isFinite)) * 1.05;
    const yt = [0, 0.25, 0.5, 0.75, 1].map(q => [q * ymax / 1.05, nice(q * ymax / 1.05, 3)]);
    c.font = FONT; const lw = Math.max(...yt.map(([, s]) => c.measureText(s).width)); // left margin fits the widest tick label
    const f = frame(w, h, [26, 14, 40, Math.max(44, lw + 14)], 0, S.N, 0, ymax);
    const xt = [0, 0.25, 0.5, 0.75, 1].map(q => [q * S.N, fmt(q * S.N, 0)]); xTicks(c, f, xt);
    yTicks(c, f, yt);
    axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    line(c, [[0, 0], [S.N, S.ex]], f, C.ink, 1.4, [5, 4]);
    ['rd', 'rtz', 'sr', 'ru', 'rne'].forEach(m => line(c, S.R[m].pts, f, COL[m], m === 'rne' ? 2.4 : 1.8));
  } });
  rangeLab('#c3N', update); onAll($$('input[name=c3Fmt],input[name=c3D]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch4: toward zero ═════════ */
(function ch4() {
  const strip = $('#c4Strip');
  for (let i = 0; i < 24; i++) strip.appendChild(document.createElement('span'));
  function update() {
    const k = +$('#c4K').value, ftz = $('#c4Ftz').checked, r = M.towardZero(k, ftz), r0 = M.towardZero(k, false);
    sliderOut('c4K', String(k));
    [...strip.children].forEach((e, i) => { e.className = i < r.sig ? 'on' : r.cls === 'flushed' && i < r0.sig ? 'pad' : 'off'; });
    put('#c4V', r.value === 0 ? '0' : sci(r.value, 4)); put('#c4Cls', t('ch4.cls.' + r.cls)); put('#c4Sig', t('u.bits', { v: r.sig })); put('#c4Rel', relS(r.rel));
    const v = { k, rel: relS(r.rel), sig: r.cls === 'flushed' ? r0.sig : r.sig };
    putHTML('#c4Say', t('ch4.say.' + r.cls, v));
  }
  rangeLab('#c4K', update); $('#c4Ftz').addEventListener('change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch5a: variance three ways ═════════ */
(function ch5var() {
  const cv = $('#c5vCv'), OFF = [0, 10, 100, 300, 1000, 3000, 10000, 30000];
  let S = {};
  function update() {
    const o = OFF[+$('#c5O').value], V = M.variance(o, 1000);
    sliderOut('c5O', fmt(o, 0));
    const r = x => Math.abs(x - V.exact) / V.exact;
    S = { V, r1: r(V.one), r2: r(V.two), r3: r(V.wel) };
    put('#c5Ex', nice(V.exact, 5)); put('#c5One', nice(V.one, 5)); put('#c5Two', nice(V.two, 5)); put('#c5Wel', nice(V.wel, 5));
    const v = { o: fmt(o, 0), r1: relS(S.r1), r2: relS(S.r2), one: nice(V.one, 4), ex: nice(V.exact, 5) };
    putHTML('#c5vSay', t(V.one < 0 ? 'ch5.var.say.neg' : S.r1 > 0.05 ? 'ch5.var.say.bad' : 'ch5.var.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv);
    hbars(c, w, h, [[t('ch5.var.read.one'), S.r1, C.red, relS(S.r1)], [t('ch5.var.read.two'), S.r2, C.green, relS(S.r2)], [t('ch5.var.read.wel'), S.r3, C.cyan, relS(S.r3)]],
      { x0: 1e-8, x1: 1e3, log: true, ticks: [[1e-8, '10⁻⁸'], [1e-5, '10⁻⁵'], [1e-2, '1%'], [1, '100%']] });
  } });
  rangeLab('#c5O', update); langHooks.push(update); update();
})();

/* ═════════ ch5b: three ways to sum ═════════ */
(function ch5sum() {
  const cv = $('#c5sCv'), NS = [100, 300, 1000, 3000, 10000, 30000, 100000], cache = {};
  let S = {};
  const all = fk => cache[fk] || (cache[fk] = NS.map(N => M.sums(fk, N)));
  function update() {
    const fk = radioVal('c5Fmt'), i = +$('#c5N').value, N = NS[i], r = all(fk)[i];
    sliderOut('c5N', fmt(N, 0));
    S = { fk, i };
    put('#c5sEx', nice(r.exact, 7)); put('#c5sNa', nice(r.naive, 7)); put('#c5sPa', nice(r.pair, 7)); put('#c5sKa', nice(r.kahan, 7));
    const v = { naive: nice(r.naive, 7), pair: nice(r.pair, 7), kahan: nice(r.kahan, 7), ex: nice(r.exact, 7), rn: relS(r.rn), rp: relS(r.rp), rk: relS(r.rk) };
    putHTML('#c5sSay', t(r.rn > 0.05 ? 'ch5.sum.say.stall' : 'ch5.sum.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), R = all(S.fk), lg = v => Math.log10(Math.max(v, 1e-10));
    const f = frame(w, h, [26, 14, 40, 52], 2, 5, -10, 0);
    xTicks(c, f, [[2, '100'], [3, '1,000'], [4, '10⁴'], [5, '10⁵']]);
    yTicks(c, f, [[-10, '≤10⁻¹⁰'], [-8, '10⁻⁸'], [-6, '10⁻⁶'], [-4, '10⁻⁴'], [-2, '1%'], [0, '100%']]);
    axes(c, f, t('ch5.sum.cv.x'), t('ch5.sum.cv.y'));
    const X = NS.map(n => Math.log10(n));
    c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.X(X[S.i]), f.T); c.lineTo(f.X(X[S.i]), f.B); c.stroke();
    [['rn', C.red], ['rp', C.cyan], ['rk', C.green]].forEach(([k, col]) => { const pts = R.map((r, j) => [X[j], lg(r[k])]); line(c, pts, f, col, 2, k === 'rk' ? [6, 4] : null); pts.forEach(([x, y]) => dot(c, f.X(x), f.Y(y), col, 3)); });
  } });
  rangeLab('#c5N', update); onAll($$('input[name=c5Fmt]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch6: FMA ═════════ */
(function ch6() {
  const NS = [10, 100, 1000, 10000];
  const exactStr = x => { const d = M.dyFromDouble(x); return (x < 0 ? '−' : '') + M.dyDecimal(d.m, d.e); };
  function update() {
    const x = +$('#c6X').value, N = NS[+$('#c6N').value], q = M.squareDiff(x), d = M.dot(N, 3);
    sliderOut('c6X', fmt(x, 3)); sliderOut('c6N', fmt(N, 0));
    put('#c6Xs', exactStr(q.x)); put('#c6P', exactStr(q.p)); put('#c6Sep', String(q.sep));
    put('#c6Fma', q.fused === 0 ? '0' : sci(q.fused, 3)); put('#c6Sq', q.fused < 0 ? 'NaN' : q.fused === 0 ? '0' : sci(q.sqrtFused, 3));
    put('#c6Ds', sci(d.eSep, 2)); put('#c6Df', sci(d.eFused, 2));
    const v = { e: sci(q.fused, 3), sq: sci(q.sqrtFused, 3), ok: t(q.exactOk ? 'ch6.say.yes' : 'ch6.say.no') };
    putHTML('#c6Say', t(q.fused === 0 ? 'ch6.say.zero' : q.fused > 0 ? 'ch6.say.pos' : 'ch6.say.neg', v));
  }
  rangeLab('#c6X', update); rangeLab('#c6N', update); langHooks.push(update); update();
})();

/* ═════════ ch7: a Gaussian into a format ═════════ */
(function ch7() {
  const cv = $('#c7Cv'); let S = {};
  function update() {
    const fk = radioVal('c7Fmt'), s = +$('#c7S').value, sig = Math.pow(10, s), q = M.quantDist(fk, sig);
    const sS = sci(sig, s % 1 ? 1 : 0);
    sliderOut('c7S', sS);
    S = { q };
    put('#c7Z', pct(q.zero, 1)); put('#c7Sub', pct(q.sub, 1)); put('#c7O', pct(q.over, 1)); put('#c7Med', relS(q.med));
    const v = { s: sS, f: FMTNAME[fk], z: pct(q.zero, 1), sub: pct(q.sub, 1), o: pct(q.over, 1), med: relS(q.med) };
    putHTML('#c7Say', t(q.over > 0.01 ? 'ch7.say.over' : q.zero + q.sub > 0.05 ? 'ch7.say.under' : 'ch7.say.ok', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), q = S.q, x0 = q.H0, x1 = q.H0 + 64;
    const mx = Math.max(...q.hist, 1);
    const f = frame(w, h, [30, 14, 40, 16], x0, x1, 0, mx * 1.1);
    const band = (a, b, col) => { a = Math.max(a, x0); b = Math.min(b, x1); if (b > a) { c.fillStyle = col; c.fillRect(f.X(a), f.T, f.X(b) - f.X(a), f.B - f.T); } return b > a ? [f.X(a), f.X(b)] : null; };
    const bs = band(q.lo, q.lon, 'rgba(179,157,251,.16)'), bn = band(q.lon, q.hi, 'rgba(255,255,255,.06)');
    const xt = []; for (let k = -40; k <= 24; k += 8) xt.push([k, sup(k)]); xTicks(c, f, xt);
    axes(c, f, t('ch7.cv.x'), null);
    c.fillStyle = C.gold; q.hist.forEach((n, i) => { if (n) { const xa = f.X(x0 + i), xb = f.X(x0 + i + 1); c.fillRect(xa + 0.5, f.Y(n), Math.max(1, xb - xa - 1), f.B - f.Y(n)); } });
    if (q.hi < x1) { c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(f.X(q.hi), f.T); c.lineTo(f.X(q.hi), f.B); c.stroke(); }
    c.textAlign = 'left'; c.font = FONT;
    const lab = (s, span, col) => { if (span && span[1] - span[0] > c.measureText(s).width + 8) { c.fillStyle = col; c.fillText(s, span[0] + 4, f.T - 12); } };
    lab(t('ch7.cv.sub'), bs, C.violet); lab(t('ch7.cv.norm'), bn, C.mute);
    if (q.hi < x1) { const s = t('ch7.cv.over'), wd = c.measureText(s).width; if (f.R - f.X(q.hi) > wd + 8) { c.fillStyle = C.red; c.fillText(s, f.X(q.hi) + 4, f.T - 12); } }
  } });
  rangeLab('#c7S', update); onAll($$('input[name=c7Fmt]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch8: block scaling with outliers ═════════ */
(function ch8() {
  const cv = $('#c8Cv'), AS = [1, 3, 10, 30, 100, 300, 1000]; let S = {};
  function update() {
    const A = AS[+$('#c8A').value], sc = radioVal('c8S'), all = M.scaleAll(A), r = all.find(x => x.scheme === sc);
    sliderOut('c8A', fmt(A, 0));
    S = { all, sc };
    const sq = isFinite(r.sqnr) ? t('u.db', { v: fmt(r.sqnr, 1) }) : '∞';
    put('#c8Bpe', t('u.bits', { v: fmt(r.bpe, 2) })); put('#c8Sq', sq); put('#c8Z', pct(r.zeros, 1)); put('#c8Out', relS(r.outRel));
    putHTML('#c8Say', t(r.sqnr >= 25 ? 'ch8.say.good' : 'ch8.say.bad', { s: t('ch8.s.' + sc), sq, z: pct(r.zeros, 1), a: fmt(A, 0) }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv);
    hbars(c, w, h, S.all.map(r => [t('ch8.s.' + r.scheme), Math.max(0, r.sqnr), r.scheme === S.sc ? C.gold : 'rgba(99,199,230,.6)', fmt(r.sqnr, 1)]),
      { x0: 0, x1: 50, ticks: [[0, '0'], [20, '20'], [40, '40 dB']] });
  } });
  rangeLab('#c8A', update); onAll($$('input[name=c8S]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch9: lanes and masks ═════════ */
(function ch9() {
  const grid = $('#c9Lanes');
  function update() {
    const W = +radioVal('c9W'), ty = radioVal('c9T'), thr = +$('#c9Thr').value, N = +$('#c9N').value, r = M.simd(W, ty, N, thr);
    sliderOut('c9Thr', fmt(thr, 2)); sliderOut('c9N', fmt(N, 0));
    const per = Math.min(r.lanes, 16), showV = grid.clientWidth / per >= 40;
    grid.style.gridTemplateColumns = `repeat(${per},1fr)`;
    if (grid.children.length !== r.lanes) { grid.innerHTML = ''; for (let i = 0; i < r.lanes; i++) grid.appendChild(document.createElement('span')); }
    [...grid.children].forEach((e, i) => { e.className = r.mask[i] ? 'on' : ''; const s = showV ? fmt(r.vals[i], 2) : ''; if (e.textContent !== s) e.textContent = s; });
    put('#c9L', String(r.lanes)); put('#c9M', r.maskHex); put('#c9V', fmt(r.vecs, 0)); put('#c9Tm', r.tail ? (W === 512 ? r.tailMaskHex : '—') : '—');
    let s = t('ch9.say.mask', { n: r.lanes, on: r.on, mask: r.maskHex, N: fmt(N, 0), vecs: fmt(r.vecs, 0) });
    s += ' ' + (r.tail === 0 ? t('ch9.say.full') : W === 512 ? t('ch9.say.tail', { tail: r.tail, tm: r.tailMaskHex }) : t('ch9.say.tailOld', { tail: r.tail }));
    putHTML('#c9Say', s);
  }
  rangeLab('#c9Thr', update); rangeLab('#c9N', update); onAll($$('input[name=c9W],input[name=c9T]'), 'change', update);
  window.addEventListener('resize', update);
  langHooks.push(update); update();
})();

/* ═════════ ch10: lanes in a reduction ═════════ */
(function ch10() {
  const cv = $('#c10Cv'), NS = [1024, 4096, 16384, 65536], cache = {}; let S = {};
  function update() {
    const fk = radioVal('c10Fmt'), N = NS[+$('#c10N').value], L = +radioVal('c10L');
    sliderOut('c10N', fmt(N, 0));
    const key = fk + N, R = cache[key] || (cache[key] = M.laneSweep(fk, N)), r = R.find(x => x.L === L), r1 = R[0];
    S = { R, L };
    put('#c10V', nice(r.v, 8)); put('#c10Ex', nice(r.exact, 8)); put('#c10E', relS(r.rel));
    const v = { L, v: nice(r.v, 8), v1: nice(r1.v, 8), ex: nice(r.exact, 8), same: t(r.v === r1.v ? 'ch10.say.eq' : 'ch10.say.ne') };
    putHTML('#c10Say', t(L === 1 || r.v === r1.v ? 'ch10.say.same' : 'ch10.say.diff', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), n = S.R.length;
    const f = frame(w, h, [26, 14, 40, 52], 0, n, -10, 0);
    yTicks(c, f, [[-10, '≤10⁻¹⁰'], [-8, '10⁻⁸'], [-6, '10⁻⁶'], [-4, '10⁻⁴'], [-2, '1%'], [0, '100%']]);
    axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
    S.R.forEach((r, i) => {
      const y = Math.log10(Math.max(r.rel, 1e-10)), xa = f.X(i + 0.18), xb = f.X(i + 0.82);
      c.fillStyle = r.L === S.L ? C.gold : 'rgba(99,199,230,.6)'; c.fillRect(xa, f.Y(y), xb - xa, f.B - f.Y(y));
      c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(String(r.L), (xa + xb) / 2, f.B + 13);
    });
  } });
  rangeLab('#c10N', update); onAll($$('input[name=c10Fmt],input[name=c10L]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch11a: accumulators and the FMA pipeline ═════════ */
(function ch11fma() {
  const cv = $('#c11Cv'), lat = M.SRC.fma.lat; let S = {};
  function update() {
    const k = +$('#c11K').value, units = radioVal('c11Core') === 'zen5' ? M.SRC.fma.perCycle : M.SRC.fma.zen4zmmPerCycle, lpf = radioVal('c11Ker') === 'dot' ? 2 : 1;
    const r = M.fmaSim(k, lat, units, 2, lpf), tr = M.fmaTrace(k, lat, units, 2, lpf, 24);
    sliderOut('c11K', String(k));
    S = { tr, units };
    put('#c11R', fmt(r.rate, 2)); put('#c11P', pct(r.rate / units, 1)); put('#c11Lim', t('ch11.fma.lim.' + r.lim));
    put('#c11G', t('u.gf', { v: fmt(r.rate * 16 * 2 * M.SRC.zen5.scalar, 1) }));
    putHTML('#c11Say', t('ch11.fma.say.' + r.lim, { k, r: fmt(r.rate, 2), p: pct(r.rate / units, 1), need: lat * units }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), n = 24, L = 8, cw = (w - L - 8) / n, rh = Math.min(40, (h - 40) / S.units);
    for (let u = 0; u < S.units; u++) for (let tt = 0; tt < n; tt++) {
      const j = S.tr[tt][u], x = L + tt * cw, y = 14 + u * (rh + 6);
      c.fillStyle = j == null ? C.card2 : 'rgba(233,185,73,' + (0.35 + 0.08 * (j % 8)) + ')'; c.fillRect(x + 1, y, cw - 2, rh);
      if (j != null && cw >= 16) { c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(String(j), x + cw / 2, y + rh / 2); }
    }
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0', L, h - 12); c.textAlign = 'right'; c.fillText('24', w - 8, h - 12);
  } });
  rangeLab('#c11K', update); onAll($$('input[name=c11Core],input[name=c11Ker]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch11b: frequency licences ═════════ */
(function ch11lic() {
  const cv = $('#c11lCv'); let S = {};
  function update() {
    const b = +$('#c11B').value, p = radioVal('c11Pr'), r = M.licenseSim(b, 1000, p);
    sliderOut('c11B', t('u.us', { v: fmt(b, 0) }));
    S = { seg: M.licenseTrace(b, 1000, p, 3000) };
    put('#c11Sp', t('u.x', { v: fmt(r.speedup, 2) })); put('#c11Sh', pct(b / 1000, 1));
    const v = { sh: pct(b / 1000, 1), sp: fmt(r.speedup, 2) };
    putHTML('#c11lSay', t(p === 'none' ? 'ch11.lic.say.none' : r.speedup < 1 ? 'ch11.lic.say.slow' : 'ch11.lic.say.fast', v));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [26, 14, 40, 44], 0, 3000, 0, 3.6);
    xTicks(c, f, [[0, '0'], [1000, '1,000'], [2000, '2,000'], [3000, '3,000']]);
    yTicks(c, f, [[0, '0'], [1, '1'], [2, '2'], [3, '3']]);
    axes(c, f, t('ch11.lic.cv.x'), t('ch11.lic.cv.y'));
    const pts = [];
    for (const [a, b, g, k] of S.seg) {
      if (a > 3000) break;
      const bb = Math.min(b, 3000);
      if (k === 'v') { c.fillStyle = 'rgba(233,185,73,.25)'; c.fillRect(f.X(a), f.T, Math.max(2, f.X(bb) - f.X(a)), f.B - f.T); }
      if (k === 'h') { c.fillStyle = 'rgba(240,122,109,.35)'; c.fillRect(f.X(a), f.T, Math.max(2, f.X(bb) - f.X(a)), f.B - f.T); }
      pts.push([a, g], [bb, g]);
    }
    line(c, pts, f, C.cyan, 2);
  } });
  rangeLab('#c11B', update); onAll($$('input[name=c11Pr]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch12: vector-length agnostic loops ═════════ */
(function ch12() {
  const VL = [128, 256, 512, 1024, 2048], pred = $('#c12Pred'), MAXR = 12;
  function update() {
    const vl = VL[+$('#c12VL').value], N = +$('#c12N').value, r = M.vla(vl, N), o = M.outer(vl);
    sliderOut('c12VL', t('u.bits', { v: vl })); sliderOut('c12N', String(N));
    const rows = r.rows.slice(0, MAXR);
    pred.innerHTML = rows.map(a => `<div style="grid-template-columns:repeat(${r.lanes},1fr)">${Array.from({ length: r.lanes }, (_, i) => `<span${i < a ? '' : ' class="x"'}></span>`).join('')}</div>`).join('');
    put('#c12More', r.rows.length > MAXR ? t('ch12.pred.more', { n: r.rows.length - MAXR }) : '');
    put('#c12L', String(r.lanes)); put('#c12T', String(r.trips)); put('#c12La', String(r.last)); put('#c12U', pct(r.util, 0));
    put('#c12F', fmt(o.fmla, 0)); put('#c12O', fmt(o.fmopa, 0)); put('#c12Pe', fmt(o.perLoadFmla, 1) + ' / ' + fmt(o.perLoadFmopa, 0));
    putHTML('#c12Say', t('ch12.say', { vl, N, trips: r.trips, last: r.last, u: pct(r.util, 0), mo: fmt(o.fmopa, 0), x: fmt(o.fmopa / o.fmla, 0) }));
  }
  rangeLab('#c12VL', update); rangeLab('#c12N', update); langHooks.push(update); update();
})();


applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
