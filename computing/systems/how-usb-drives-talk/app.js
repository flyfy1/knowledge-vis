/* How USB drives talk: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.UsbModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   copy.en.js may be a same-keys stub copied from zh while the translation is pending; it then sets
   window.ESSAY_COPY.enStub = true and the page treats English as absent (falls back to zh). */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const hasLang = l => !!COPY[l] && !(l === 'en' && COPY.enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const fmt = (x, d) => M.fmt(x, d, effLang());
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
const mbps = (x, d) => t('u.MBps', { v: fmt(x, d == null ? (x < 100 ? 1 : 0) : d) });
const us = x => t('u.us', { v: fmt(x, x < 10 ? 1 : 0) });
function size(bytes) { return bytes >= 1048576 ? t('u.MiB', { v: fmt(bytes / 1048576, bytes % 1048576 ? 1 : 0) }) : t('u.KiB', { v: fmt(bytes / 1024, bytes % 1024 ? 1 : 0) }); }
const sec = s => s >= 60 ? t('u.min', { v: fmt(s / 60, 1) }) : t('u.s', { v: fmt(s, 0) });
// numbers quoted in the prose, computed from the models and formatted for the current language
let PROSE = null;
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
function applyLang() {
  const PV = proseVars();
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, PV); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('[data-hk]').forEach(e => { e.dataset.h = t(e.dataset.hk); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; const xw = c.measureText(xLab).width, f0 = c.font; if (xw > f.R - 4) c.font = FONT.replace('12px', (12 * Math.max(0.7, (f.R - 4) / xw)).toFixed(1) + 'px'); c.fillText(xLab, f.R, f.B + 26); c.font = f0; }
}
function spacedTicks(c, items, y, maxW) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x0, s] of items) { const w = c.measureText(s).width, x = maxW ? Math.min(Math.max(x0, w / 2 + 2), maxW - w / 2 - 2) : x0; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash || [5, 4]); c.beginPath(); c.moveTo(f.L, y); c.lineTo(f.R, y); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
// bar labels: a label too wide for the label column is split at the space nearest its middle (review 2026-11-14:
// English stage names at 320 px ran off the canvas), then the whole column shrinks to at most 70 % if still needed
function splitLabel(c, s, cap) {
  if (c.measureText(s).width + 14 <= cap || s.indexOf(' ') < 0) return [s];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
// horizontal bars: rows of [label, value, colour]; value text sits after the bar, or inside it when there is no room
function bars(c, w, h, rows, max, hiIdx) {
  const labs = rows.map(r => r[0]), lf = labelFont(c, labs, Math.min(170, w * 0.36));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(22, rh * 0.56);
    c.font = lf.font; c.textAlign = 'right'; c.fillStyle = i === hiIdx ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
    if (v > 0) { c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh); }
    if (txt) {
      let tw = c.measureText(txt).width; const xe = X(Math.max(v, 0));
      if (xe - L < tw + 10 && xe + 6 + tw > R) { const k = Math.max(0.6, (R - xe - 6) / tw); c.font = FONT.replace('12px', (12 * k).toFixed(1) + 'px'); tw = c.measureText(txt).width; }
      if (xe + 6 + tw <= R + 0.5) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); }
      else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, Math.max(L + tw + 4, xe - 6), y); }
    }
  });
}
const LINKS = { hs: M.SPEC.usb2.maxBps / 1e6, g1x1: M.SPEC.usb3.g1Eff, g2x1: M.SPEC.usb3.g2Eff, g2x2: M.MODES.g2x2.eff };
const DRIVE = M.SPEC.nvmeSeq;

/* ───────── 02 USB 2.0 microframe ───────── */
(() => {
  const cv = $('#mfCv'), sP = $('#mfP');
  const pay = () => Math.pow(2, +sP.value);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = pay(), r = M.USB2.pack(p), B = M.USB2.perMicroframe(), L = 10, R = w - 10, y0 = h * 0.38, bh = 30, X = v => L + (R - L) * v / B;
      let x = 0;
      for (let i = 0; i < r.n; i++) { c.fillStyle = C.gold; c.fillRect(X(x), y0, Math.max(0.6, X(x + p) - X(x)), bh); x += p; c.fillStyle = C.red; c.fillRect(X(x), y0, Math.max(0.6, X(x + 55) - X(x)), bh); x += 55; }
      c.fillStyle = C.dimfill; c.fillRect(X(x), y0, X(B) - X(x), bh);
      c.strokeStyle = C.line; c.strokeRect(L, y0, R - L, bh);
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(t('ch2.cv.n', { n: fmt(r.n, 0) }), L, y0 - 14);
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch2.cv.x'), R, y0 + bh + 18);
    }
  });
  function text() {
    const p = pay(), z = M.say.usb2(p), v = z.v;
    put('#mfPo', t('u.B', { v: fmt(p, 0) }));
    put('#mfN', fmt(v.n, 0)); put('#mfU', t('u.B', { v: fmt(v.useful, 0) })); put('#mfB', mbps(v.bps / 1e6, 1)); put('#mfE', pct(v.eff, 1));
    putHTML('#mfSay', t(z.key, { p: fmt(p, 0), n: fmt(v.n, 0), useful: fmt(v.useful, 0), left: fmt(v.remaining, 0), bw: mbps(v.bps / 1e6, 1), eff: pct(v.eff, 1) }));
  }
  sim.text = text;
  sP.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 label → wire ───────── */
(() => {
  const cv = $('#lbCv');
  const id = () => radioVal('lbL'), mode = () => M.LABELS.find(x => x[0] === id())[1];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), m = mode(), L = M.LINE, line = L.lineGbps(m) * 1000 / 8, raw = L.rawMBps(m), fr = L.framedMBps(m), sp = L.specMBps(m);
      const na = t('ch3.bar.na');
      const rows = [[t('ch3.bar.line'), line, C.mute, mbps(line, 0)], [t('ch3.bar.enc'), raw, C.cyan, mbps(raw, 0)],
        [t('ch3.bar.pkt'), fr || 0, C.violet, fr ? mbps(fr, 0) : na], [t('ch3.bar.spec'), sp || 0, C.green, sp ? mbps(sp, 0) : na]];
      bars(c, w, h, rows, line * 1.02, -1);
    }
  });
  function text() {
    const z = M.say.label(id()), v = z.v;
    put('#lbMode', t('ch3.mode.' + v.mode)); put('#lbLine', t('u.Gbps', { v: fmt(v.line, v.line < 1 || v.line % 1 ? 2 : 0) }));
    put('#lbRaw', mbps(v.raw, 0)); put('#lbSpec', v.spec ? mbps(v.spec, v.spec < 100 ? 1 : 0) : t('u.none'));
    putHTML('#lbSay', t(z.key, { mode: t('ch3.modefmt', { name: t('ch3.mode.' + v.mode), enc: t('ch3.enc.' + v.mode) }), line: t('u.Gbps', { v: fmt(v.line, v.line % 1 ? 2 : 0) }), raw: mbps(v.raw, 0), framed: v.framed ? mbps(v.framed, 0) : '', spec: v.spec ? mbps(v.spec, v.spec < 100 ? 1 : 0) : '', market: v.market == null ? '' : fmt(v.market, 0) }));
  }
  sim.text = text;
  onAll(radios('lbL'), 'change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 04a CBW / CSW bytes ───────── */
(() => {
  const sL = $('#cwL'), W = M.WRAP, TAG = 0x2A;
  function text() {
    let op = radioVal('cwOp'); const blocks = +radioVal('cwN'), lba = Math.round(Math.pow(2, +sL.value)) - 1;
    const over = op === 'read10' && lba > W.maxLba('read10');
    if (over) op = 'read16';
    const cb = W.cbw(TAG, lba, blocks, op), hx = W.hex(cb.bytes), cs = W.hex(W.csw(TAG, 0, 0));
    put('#cwLo', fmt(lba, 0));
    const n = '\n', seg = (a, b, cls, k) => `<span class="${cls}">${hx.slice(a, b).join(' ')}</span>  <span class="m">${t(k)}</span>` + n;
    let s = `<span class="m">${t('ch4.hex.cbw')}</span>` + n;
    s += seg(0, 4, 'g', 'ch4.hex.sig') + seg(4, 8, 'c', 'ch4.hex.tag') + seg(8, 12, 'v', 'ch4.hex.len') + seg(12, 13, '', 'ch4.hex.flags') + seg(13, 14, '', 'ch4.hex.lun') + seg(14, 15, '', 'ch4.hex.cblen') + seg(15, 31, 'r', 'ch4.hex.cdb');
    s += n + `<span class="m">${t('ch4.hex.data', { len: fmt(cb.len, 0) })}</span>` + n + n;
    s += `<span class="m">${t('ch4.hex.csw')}</span>` + n;
    s += `<span class="g">${cs.slice(0, 4).join(' ')}</span>  <span class="m">${t('ch4.hex.sig2')}</span>` + n + `<span class="c">${cs.slice(4, 8).join(' ')}</span>  <span class="m">${t('ch4.hex.tag')}</span>` + n +
      `<span class="v">${cs.slice(8, 12).join(' ')}</span>  <span class="m">${t('ch4.hex.res')}</span>` + n + `<span class="n">${cs[12]}</span>  <span class="m">${t('ch4.hex.st')}</span>`;
    putHTML('#cwHex', s);
    putHTML('#cwSay', over ? t('ch4.say.over') : t('ch4.say.fit', { op: t('ch4.op.' + op), lba: fmt(lba, 0), blocks: fmt(blocks, 0), len: fmt(cb.len, 0) }));
  }
  const s = reg([], { draw() {}, text });
  sL.addEventListener('input', text); onAll(radios('cwOp'), 'change', text); onAll(radios('cwN'), 'change', text);
  text();
})();

/* ───────── 04b and 05: throughput against block size ───────── */
function curvePlot(c, w, h, link, series, Smark) {
  const max = link * 1.12, f = frame(w, h, [26, 14, 36, 56], 12, 22, 0, max);
  const step = max > 1500 ? 500 : max > 600 ? 250 : max > 200 ? 100 : 10, ys = []; for (let v = 0; v <= max; v += step) ys.push(v);
  yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
  c.fillStyle = C.mute; spacedTicks(c, [12, 14, 16, 18, 20, 22].map(e => [f.X(e), size(Math.pow(2, e))]), f.B + 11, w);
  hline(c, f, f.Y(link), C.red);
  for (const s of series) { const pts = []; for (let e = 12; e <= 22.001; e += 0.1) pts.push([e, s.fn(Math.pow(2, e))]); path(c, pts, f.X, f.Y, s.col, s.lw); dot(c, f.X(Smark), f.Y(s.fn(Math.pow(2, Smark))), s.col, 5); }
}
(() => {
  const cv = $('#boCv'), sS = $('#boS'), sT = $('#boT');
  const link = () => LINKS[radioVal('boK')];
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), L = link(), tc = +sT.value; curvePlot(c, w, h, L, [{ fn: S => M.Q.bot(S, L, DRIVE, { tCmd: tc }).X, col: C.gold, lw: 2.6 }], +sS.value); } });
  function text() {
    const S = Math.round(Math.pow(2, +sS.value)), L = link(), tc = +sT.value, z = M.say.bot(S, L, DRIVE, tc), v = z.v;
    put('#boSo', size(S)); put('#boTo', us(tc));
    put('#boX', mbps(v.X)); put('#boI', t('u.iops', { v: fmt(v.iops, 0) })); put('#boU', pct(v.share)); put('#boW', us(v.wait));
    putHTML('#boSay', t(z.key, { size: size(S), tData: us(v.tData), wait: us(v.wait), X: mbps(v.X), share: pct(v.share) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); sT.addEventListener('input', go); onAll(radios('boK'), 'change', go);
  text();
})();
(() => {
  const cv = $('#uaCv'), sS = $('#uaS');
  const link = () => LINKS[radioVal('uaK')], N = () => +radioVal('uaN');
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), L = link(), n = N(); curvePlot(c, w, h, L, [{ fn: S => M.Q.bot(S, L, DRIVE).X, col: C.mute, lw: 1.8 }, { fn: S => M.Q.uas(S, L, DRIVE, n).X, col: C.gold, lw: 2.8 }], +sS.value); } });
  function text() {
    const S = Math.round(Math.pow(2, +sS.value)), L = link(), n = N(), z = M.say.uas(S, L, DRIVE, n), v = z.v;
    put('#uaSo', size(S));
    put('#uaB', mbps(v.bot)); put('#uaU', mbps(v.X)); put('#uaG', t('u.x', { v: fmt(v.gain, 2) })); put('#uaKn', fmt(Math.ceil(v.knee - 1e-9), 0));
    putHTML('#uaSay', t(z.key, { n: fmt(n, 0), X: mbps(v.X), gain: fmt(v.gain, 1), knee: fmt(Math.ceil(v.knee - 1e-9), 0), iops: fmt(v.iops, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); onAll(radios('uaK'), 'change', go); onAll(radios('uaN'), 'change', go);
  text();
})();

/* ───────── 06 the chain ───────── */
const STAGE_COL = { drive: C.violet, bridge: C.cyan, usb: C.green, tunnel: C.green };
function chainBars(c, w, h, stages, X, neck, fits) {
  const rows = stages.map(([k, v]) => [t('ch6.st.' + k), v, STAGE_COL[k], mbps(v, 0)]);
  rows.push([t('ch6.st.final'), fits ? X : 0, C.gold, fits ? mbps(X, 0) : t('ch6.cv.nofit')]);
  bars(c, w, h, rows, 7600, stages.findIndex(s => s[0] === neck));
}
(() => {
  const cv = $('#chCv');
  const opts = () => ({ drive: radioVal('chD'), bridge: radioVal('chB'), box: radioVal('chX'), host: radioVal('chH'), proto: radioVal('chP') });
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), r = M.CHAIN.usb(opts()); chainBars(c, w, h, r.stages, r.X, r.neck, r.fits); } });
  function text() {
    const o = opts(), r = M.CHAIN.usb(o), z = M.say.chain(o), v = z.v;
    put('#chR', r.fits ? mbps(r.X, 0) : t('u.none')); put('#chN', r.fits ? t('ch6.st.' + r.neck) : t('u.none')); put('#chM', t('ch3.mode.' + r.mode)); put('#chS', r.fits ? pct(r.X / M.CHAIN.drive(o.drive)) : t('u.none'));
    putHTML('#chSay', t(z.key, { X: mbps(v.X, 0), cap: mbps(v.cap, 0), mode: t('ch3.mode.' + v.mode), share: pct(r.X / M.CHAIN.drive(o.drive)) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['chD', 'chB', 'chX', 'chH', 'chP'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 07 heat ───────── */
(() => {
  const cv = $('#htCv'), sA = $('#htA'), bPlay = $('#htPlay'), bReset = $('#htReset'), H = M.HEAT;
  let run = null, prog = 1, playing = false;
  const key = () => radioVal('htX') + radioVal('htS') + sA.value;
  function compute() { const k = key(); if (!run || run.k !== k) { const rate = H.rate(radioVal('htX')); run = Object.assign(H.sim(rate, H.Rbox[radioVal('htS')], +sA.value), { k, rate }); } return run; }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = compute(), D = H.dur, mid = h * 0.54;
      const fT = frame(w, mid, [24, 14, 22, 50], 0, D, 0, 130), fR = frame(w, h, [mid + 26, 14, 34, 50], 0, D, 0, 7500);
      yTicks(c, fT, [0, 40, 80, 120], v => fmt(v, 0)); axes(c, fT, '', t('ch7.cv.t'));
      hline(c, fT, fT.Y(H.thr), C.red, [4, 4]);
      c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(t('ch7.cv.thr', { v: fmt(H.thr, 0) }), fT.R, fT.Y(H.thr) - 9);
      yTicks(c, fR, [0, 2500, 5000, 7500], v => fmt(v, 0)); axes(c, fR, t('ch7.cv.x'), t('ch7.cv.r'));
      c.fillStyle = C.mute; spacedTicks(c, [0, 3, 6, 9, 12, 15].map(m => [fR.X(m * 60), fmt(m, 0)]), fR.B + 11, w);
      const upto = prog * D, pts = r.tr.filter(p => p[0] <= upto + 1e-9);
      if (pts.length > 1) { path(c, pts.map(p => [p[0], p[1]]), fT.X, fT.Y, C.red, 2.2); path(c, pts.map(p => [p[0], p[2]]), fR.X, fR.Y, C.gold, 2); const l = pts[pts.length - 1]; dot(c, fT.X(l[0]), fT.Y(l[1]), C.red); dot(c, fR.X(l[0]), fR.Y(l[2]), C.gold); }
    },
    step(dt) { if (playing) { prog = Math.min(1, prog + dt / 30); if (prog >= 1) setPlay(false); this.draw(); } else if (this.dirty) { this.draw(); this.dirty = false; } }
  });
  function setPlay(p) { playing = p && !reduce; bPlay.setAttribute('aria-pressed', String(playing)); bPlay.textContent = t(playing ? 'ch7.btn.pause' : 'ch7.btn.play'); }
  function text() {
    const r = compute(), z = M.say.heat(radioVal('htX'), radioVal('htS'), +sA.value), v = z.v;
    put('#htAo', t('u.C', { v: fmt(+sA.value, 0) }));
    put('#htT', t('u.C', { v: fmt(v.Tinf, 0) })); put('#htF', v.tFirst == null ? t('ch7.never') : sec(v.tFirst)); put('#htV', mbps(v.avg, 0)); put('#htL', pct(v.slow));
    putHTML('#htSay', t(z.key, { Tinf: t('u.C', { v: fmt(v.Tinf, 0) }), thr: t('u.C', { v: fmt(v.thr, 0) }), rate: mbps(v.rate, 0), tFirst: v.tFirst == null ? '' : sec(v.tFirst), avg: mbps(v.avg, 0), slow: pct(v.slow) }));
    bPlay.textContent = t(playing ? 'ch7.btn.pause' : 'ch7.btn.play');
  }
  sim.text = text;
  const go = () => { prog = 1; setPlay(false); sim.dirty = true; text(); };
  onAll(radios('htX'), 'change', go); onAll(radios('htS'), 'change', go); sA.addEventListener('input', go);
  bPlay.addEventListener('click', () => { if (reduce) { prog = 1; sim.dirty = true; return; } if (!playing && prog >= 1) prog = 0; setPlay(!playing); sim.dirty = true; });
  bReset.addEventListener('click', () => { prog = reduce ? 1 : 0; setPlay(false); sim.dirty = true; });
  if (reduce) bPlay.disabled = true;
  text();
})();

/* ───────── 08 PCIe tunnel ───────── */
(() => {
  const cv = $('#tnCv'), sE = $('#tnE');
  const host = () => radioVal('tnH');
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), r = M.CHAIN.tunnel({ host: host(), eta: +sE.value }); chainBars(c, w, h, r.stages, r.X, r.neck, true); } });
  function text() {
    const hh = host(), eta = +sE.value, r = M.CHAIN.tunnel({ host: hh, eta }), z = M.say.tunnel(hh), F = M.FRONTIER;
    put('#tnEo', fmt(eta, 2));
    put('#tnX', mbps(r.X, 0)); put('#tnN', t('ch6.st.' + r.neck));
    put('#tnR', hh === 'tb5' ? t('u.MBps', { v: fmt(F.tb5Reported[0], 0) + '–' + fmt(F.tb5Reported[1], 0) }) : hh === 'tb4' ? t('u.MBps', { v: fmt(F.tb34Reported, 0) }) : t('ch8.rep.none'));
    putHTML('#tnSay', t(z.key, { X: mbps(r.X, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sE.addEventListener('input', go); onAll(radios('tnH'), 'change', go);
  text();
})();

/* ───────── 09 flash drive / card ───────── */
(() => {
  const cv = $('#skCv'), sW = $('#skW');
  const st = () => M.STICK.write(+radioVal('skD'), +sW.value, radioVal('skB'));
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), r = st(); bars(c, w, h, [[t('ch9.st.flash'), r.flash, C.violet, mbps(r.flash, 0)], [t('ch9.st.bus'), r.bus, C.cyan, mbps(r.bus, 0)]], 1000, r.neck === 'flash' ? 0 : 1); } });
  function text() {
    const r = st(), z = M.say.stick(+radioVal('skD'), +sW.value, radioVal('skB')), v = z.v;
    put('#skWo', mbps(+sW.value, 0));
    put('#skX', mbps(r.X, 0)); put('#skF', mbps(r.flash, 0)); put('#skU', mbps(r.bus, 0)); put('#skN', fmt(r.diesToFill, 1));
    putHTML('#skSay', t(z.key, { X: mbps(v.X, 0), flash: mbps(v.flash, 0), bus: mbps(v.bus, 0), need: fmt(v.need, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); onAll(radios('skD'), 'change', go); onAll(radios('skB'), 'change', go);
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    else if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
