/* How PCIe works: wiring, drawing, static diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.PcieModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', card: '#141821', card2: '#1a1f2b', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
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
const gbps = (x, d) => t('u.GBps', { v: fmt(x, d == null ? (x < 10 ? 2 : 1) : d) });
const ns = (x, d) => t('u.ns', { v: fmt(x, d == null ? (x < 10 ? 2 : x < 100 ? 1 : 0) : d) });
const db = (x, d) => t('u.dB', { v: fmt(x, d == null ? 1 : d) });
const inch = x => t('u.in', { v: fmt(x, 1) });
const sci = (x, d) => M.sci(x, d);
function size(bytes) { return bytes >= M.MiB ? t('u.MiB', { v: fmt(bytes / M.MiB, bytes % M.MiB ? 2 : 0) }) : bytes >= 1024 ? t('u.KiB', { v: fmt(bytes / 1024, bytes % 1024 ? 1 : 0) }) : t('u.B', { v: fmt(bytes, 0) }); }
const hex32 = x => (x >>> 0).toString(16).toUpperCase().padStart(8, '0');
// numbers quoted in the prose, computed from the models and formatted for the current language
let PROSE = null;
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : kind === 'sci' ? sci(v, d) : fmt(v, d); return o; }
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
  renderDiagrams(true);
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
window.addEventListener('resize', () => { sims.forEach(s => { s.dirty = true; }); renderDiagrams(false); });
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
  c.fillStyle = C.mute; c.textAlign = 'right'; let lastY = Infinity;
  vals.forEach(v => { const y = f.Y(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); if (Math.abs(lastY - y) < 14) return; c.fillText(fmtv(v), f.L - 6, y); lastY = y; });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash || [5, 4]); c.beginPath(); c.moveTo(f.L, y); c.lineTo(f.R, y); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash || [5, 4]); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function splitLabel(c, s, cap) {
  if (c.measureText(s).width + 14 <= cap || s.indexOf(' ') < 0) return [s];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
function bars(c, w, h, rows, max, hiIdx) {
  const labs = rows.map(r => r[0]), lf = labelFont(c, labs, Math.min(150, w * 0.32));
  const L = lf.w, R = w - 10, T = 8, B = h - 8, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(16, rh * 0.62);
    c.font = lf.font; c.textAlign = 'right'; c.fillStyle = i === hiIdx ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
    if (v > 0) { c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh); }
    if (txt) {
      const tw = c.measureText(txt).width, xe = X(Math.max(v, 0));
      if (xe + 6 + tw <= R + 0.5) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); }
      else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, Math.max(L + tw + 4, xe - 6), y); }
    }
  });
}
// a seeded RNG (mulberry32) so drawn noise is the same on every visit
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * v); }
const logTicks = (c, f, e0, e1, y, w) => spacedTicks(c, Array.from({ length: e1 - e0 + 1 }, (_, i) => [f.X(e0 + i), sci(Math.pow(10, e0 + i), 0)]).filter((_, i) => (e0 + i) % 2 === 0 || e1 - e0 < 7), y, w);

/* ───────── static diagrams (STANDARD §4a) ─────────
   Each diagram is inline SVG built from a small layout function with two variants: wide (viewBox 900 units, used when
   the box is at least 700 px wide) and narrow (350 units). Text is 15 units in both, so it renders at 11.7 px or more
   on the wide variant and at 11.3 px or more on a 320 px phone. Labels come from copy; numbers from models.js. */
const FS = 15;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const CJK = /[⺀-鿿豈-﫿︰-﹏＀-￯　-〿]/;
const PUNCT = /[，。、；：？！）」』》,.;:!?)\]]/;
function estW(s, fs) {
  let w = 0;
  for (const ch of String(s)) w += CJK.test(ch) ? 1 : /[A-Z0-9#%&]/.test(ch) ? 0.66 : /[mwMW]/.test(ch) ? 0.85 : ch === ' ' ? 0.3 : /[.,:;'|!il·()\[\]\/\-]/.test(ch) ? 0.34 : 0.56;
  return w * (fs || FS);
}
function wrap(s, maxw, fs) {
  const out = [];
  maxw *= 0.95;   // estW is an estimate; keep a margin so real glyphs stay inside the box
  for (const part of String(s).split('\n')) {
    let rest = part;
    while (rest.length > 1 && estW(rest, fs) > maxw) {
      let best = -1;
      for (let i = 1; i < rest.length; i++) {
        const ok = rest[i] === ' ' || ((CJK.test(rest[i]) || CJK.test(rest[i - 1])) && !PUNCT.test(rest[i]));
        if (!ok) continue;
        if (estW(rest.slice(0, i), fs) <= maxw) best = i; else break;
      }
      if (best < 0) break;
      out.push(rest.slice(0, best).trimEnd()); rest = rest.slice(best).trimStart();
    }
    out.push(rest);
  }
  return out;
}
function tx(x, y, s, o = {}) {
  const fs = o.s || FS;
  return `<text x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" font-size="${fs}" text-anchor="${o.a || 'middle'}" dominant-baseline="central"${o.c ? ` class="${o.c}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}>${esc(s)}</text>`;
}
// a label wrapped to maxw, centred on y (or starting at y with o.top)
function lb(x, y, s, maxw, o = {}) {
  const fs = o.s || FS, lh = o.lh || Math.round(fs * 1.28), lines = wrap(s, maxw, fs), y0 = o.top ? y : y - (lines.length - 1) * lh / 2;
  return lines.map((l, i) => tx(x, y0 + i * lh, l, o)).join('');
}
const nLines = (s, maxw, fs) => wrap(s, maxw, fs).length;
const COLS = { cyan: C.cyan, gold: C.gold, red: C.red, green: C.green, violet: C.violet, mute: C.mute, line: C.line, ink: C.ink };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function box(x, y, w, h, col, o = {}) {
  const c = COLS[col] || col;
  return `<rect x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" width="${+w.toFixed(1)}" height="${+h.toFixed(1)}" rx="${o.rx == null ? 7 : o.rx}" fill="${o.fill || rgba(c, o.a == null ? 0.12 : o.a)}" stroke="${c}" stroke-width="${o.sw || 1.5}"${o.dash ? ' stroke-dasharray="6 4"' : ''}/>`;
}
const ln = (x1, y1, x2, y2, col, o = {}) => `<line x1="${+x1.toFixed(1)}" y1="${+y1.toFixed(1)}" x2="${+x2.toFixed(1)}" y2="${+y2.toFixed(1)}" stroke="${COLS[col] || col}" stroke-width="${o.sw || 1.6}"${o.dash ? ' stroke-dasharray="5 4"' : ''}${o.arrow ? ` marker-end="url(#${o.arrow}-${col})"` : ''}/>`;
const defs = (id, cols) => '<defs>' + cols.map(c => `<marker id="${id}-${c}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COLS[c]}"/></marker>`).join('') + '</defs>';
const pathEl = (d, col, o = {}) => `<path d="${d}" fill="${o.fill || 'none'}" stroke="${COLS[col] || col}" stroke-width="${o.sw || 1.6}"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`;

const DIAG = {};

/* d1 · the tree: root complex, switch, endpoints; every line a link of its own */
DIAG.d1 = (W, n) => {
  let b = '';
  if (!n) {
    b += box(330, 14, 200, 44, 'cyan') + lb(430, 36, t('d1.cpu'), 190);
    b += box(600, 14, 180, 44, 'green') + lb(690, 36, t('d1.mem'), 170) + ln(530, 36, 600, 36, 'green');
    b += box(230, 92, 400, 50, 'cyan', { a: 0.22 }) + lb(430, 117, t('d1.rc'), 390) + ln(430, 58, 430, 92, 'cyan');
    const kids = [[150, 'gpu', 'gold', '×16', 300], [430, 'sw', 'violet', '×4', 430], [760, 'usb', 'gold', '×1', 560]];
    for (const [cx, k, col, wlab, sx] of kids) {
      b += ln(sx, 142, cx, 212, 'ink') + box(cx - 95, 212, 190, 46, col) + lb(cx, 235, t('d1.' + k), 180);
      const mx = (sx + cx) / 2, my = 177;
      b += tx(sx === cx ? mx + 12 : mx + (cx < sx ? -12 : 12), my, wlab, { a: sx === cx || cx > sx ? 'start' : 'end', c: 'g' });
    }
    const leaves = [[285, 'ssd', '×4'], [430, 'nic', '×4'], [575, 'slot', '×1']];
    for (const [cx, k, wlab] of leaves) {
      b += ln(430, 258, cx, 322, 'ink') + box(cx - 66, 322, 132, 46, k === 'slot' ? 'mute' : 'gold', { dash: k === 'slot' }) + lb(cx, 345, t('d1.' + k), 124);
      b += tx(cx === 430 ? 442 : cx < 430 ? 350 : 510, 292, wlab, { a: cx < 430 ? 'end' : 'start', c: 'g' });
    }
    b += lb(450, 400, t('d1.note'), 860, { c: 'm' });
    return { h: 422, body: b };
  }
  // narrow: an indented tree
  b += box(10, 10, 160, 40, 'cyan') + lb(90, 30, t('d1.cpu'), 150) + box(190, 10, 150, 40, 'green') + lb(265, 30, t('d1.mem'), 140) + ln(170, 30, 190, 30, 'green');
  b += box(10, 70, 330, 42, 'cyan', { a: 0.22 }) + lb(175, 91, t('d1.rc'), 320) + ln(90, 50, 90, 70, 'cyan');
  const row = (y, x0, bx, k, col, wlab, dash) => ln(x0, y + 20, bx, y + 20, 'ink') + tx((x0 + bx) / 2, y + 8, wlab, { c: 'g' }) + box(bx, y, 340 - bx, 40, col, { dash }) + lb(bx + (340 - bx) / 2, y + 20, t('d1.' + k), 340 - bx - 10);
  b += ln(30, 112, 30, 448, 'ink');
  b += row(130, 30, 100, 'gpu', 'gold', '×16') + row(188, 30, 100, 'sw', 'violet', '×4');
  b += ln(120, 228, 120, 390, 'ink');
  b += row(246, 120, 180, 'ssd', 'gold', '×4') + row(300, 120, 180, 'nic', 'gold', '×4') + row(354, 120, 180, 'slot', 'mute', '×1', true);
  b += row(412, 30, 100, 'usb', 'gold', '×1');
  const nl = nLines(t('d1.note'), 330); b += lb(10, 474, t('d1.note'), 330, { a: 'start', c: 'm', top: true });
  return { h: 474 + nl * 19 + 6, body: b };
};

/* d2 · one lane: two differential pairs, one per direction; the clock rides in the data */
DIAG.d2 = (W, n) => {
  let b = defs('d2a', ['cyan', 'gold']);
  const cap = (x, y) => `<rect x="${x - 5}" y="${y - 4}" width="10" height="8" fill="${C.card}" stroke="none"/>` + ln(x - 4, y - 7, x - 4, y + 7, 'mute', { sw: 2 }) + ln(x + 4, y - 7, x + 4, y + 7, 'mute', { sw: 2 });
  const capV = (x, y) => `<rect x="${x - 4}" y="${y - 5}" width="8" height="10" fill="${C.card}" stroke="none"/>` + ln(x - 7, y - 4, x + 7, y - 4, 'mute', { sw: 2 }) + ln(x - 7, y + 4, x + 7, y + 4, 'mute', { sw: 2 });
  if (!n) {
    b += tx(120, 22, t('d2.a'), { c: 'c', w: 600 }) + tx(780, 22, t('d2.b'), { c: 'g', w: 600 });
    b += box(20, 40, 200, 170, 'cyan') + box(680, 40, 200, 170, 'gold');
    b += lb(120, 87, t('d2.tx'), 186) + lb(120, 167, t('d2.rx'), 186) + lb(780, 87, t('d2.rx'), 186) + lb(780, 167, t('d2.tx'), 186);
    for (const y of [79, 95]) b += ln(220, y, 676, y, 'cyan', { arrow: 'd2a' });
    for (const y of [159, 175]) b += ln(680, y, 224, y, 'gold', { arrow: 'd2a' });
    for (const y of [79, 95, 159, 175]) b += cap(y < 120 ? 300 : 600, y);
    b += lb(450, 60, t('d2.pair'), 440) + lb(450, 127, t('d2.ac'), 440, { c: 'm' }) + lb(450, 196, t('d2.pair2'), 440);
    b += lb(450, 240, t('d2.lane'), 860, { c: 'm' });
    return { h: 262, body: b };
  }
  b += tx(175, 16, t('d2.a'), { c: 'c', w: 600 }) + box(10, 30, 330, 92, 'cyan');
  b += lb(175, 56, t('d2.tx'), 310) + lb(175, 96, t('d2.rx'), 310);
  b += box(10, 392, 330, 92, 'gold') + lb(175, 418, t('d2.rx'), 310) + lb(175, 458, t('d2.tx'), 310) + tx(175, 500, t('d2.b'), { c: 'g', w: 600 });
  for (const x of [36, 54]) b += ln(x, 122, x, 388, 'cyan', { arrow: 'd2a' });
  for (const x of [86, 104]) b += ln(x, 392, x, 126, 'gold', { arrow: 'd2a' });
  for (const x of [36, 54, 86, 104]) b += capV(x, 250);
  b += lb(122, 160, t('d2.pair'), 218, { a: 'start', top: true }) + lb(122, 238, t('d2.ac'), 218, { a: 'start', c: 'm', top: true }) + lb(122, 300, t('d2.pair2'), 218, { a: 'start', top: true });
  const nl = nLines(t('d2.lane'), 330); b += lb(10, 528, t('d2.lane'), 330, { a: 'start', c: 'm', top: true });
  return { h: 528 + nl * 19 + 4, body: b };
};

/* d3 · what each encoding spends: the red share of each bar is the overhead, drawn to scale */
DIAG.d3 = (W, n) => {
  const rows = [['r1', [[0.8, 'green', 'd3.data'], [0.2, 'red', 'd3.oh1']]], ['r2', [[2 / 130, 'red', 'd3.oh2'], [128 / 130, 'green', 'd3.data']]],
    ['r3', [[M.FLIT.tlp / 256, 'green', 'd3.data'], [M.FLIT.dlp / 256, 'cyan', ''], [M.FLIT.crc / 256, 'violet', ''], [M.FLIT.fec / 256, 'red', 'd3.oh3']]]];
  let b = '';
  const X0 = n ? 10 : 230, X1 = n ? 340 : 880, BW = X1 - X0;
  rows.forEach(([k, segs], i) => {
    const y = n ? 14 + i * 104 : 30 + i * 74, by = n ? y + 26 : y;
    b += n ? lb(10, y, t('d3.' + k), 330, { a: 'start' }) : lb(220, y + 15, t('d3.' + k), 210, { a: 'end' });
    let x = X0;
    for (const [f, col, key] of segs) { b += box(x, by, BW * f, 30, col, { rx: 2, a: col === 'green' ? 0.3 : 0.75, sw: 1 }); x += BW * f; }
    const oh = segs.filter(s => s[1] !== 'green').reduce((a, s) => a + s[0], 0);
    b += tx(X0 + 10, by + 15, t('d3.data'), { a: 'start', c: 'n' });
    b += n ? tx(X1, by + 48, t('d3.ohfmt', { v: pct(oh, oh < 0.05 ? 2 : 1) }) + ' · ' + t('d3.' + segs.find(s => s[2] && s[2] !== 'd3.data')[2].slice(3)), { a: 'end', c: 'r' })
      : tx(X1, by + 46, t('d3.ohfmt', { v: pct(oh, oh < 0.05 ? 2 : 1) }) + ' · ' + t('d3.' + segs.find(s => s[2] && s[2] !== 'd3.data')[2].slice(3)), { a: 'end', c: 'r' });
  });
  return { h: n ? 330 : 246, body: b };
};

/* d4 · what each layer adds around a TLP (schematic widths) */
DIAG.d4 = (W, n) => {
  const cells = [['stp', 'violet'], ['seq', 'gold'], ['hdr', 'cyan'], ['data', 'cyan'], ['ecrc', 'cyan'], ['lcrc', 'gold'], ['end', 'violet']];
  const wide = [58, 70, 112, 250, 90, 84, 58];
  let b = '';
  if (!n) {
    let x = 90;
    cells.forEach(([k, col], i) => { b += box(x, 20, wide[i], 60, col, { rx: 3, a: 0.16 }) + lb(x + wide[i] / 2, 50, t('d4.' + k), wide[i] - 8); x += wide[i]; });
    const leg = [['cyan', 'tl'], ['gold', 'dll'], ['violet', 'phy']];
    leg.forEach(([col, k], i) => { const lx = 90 + i * 260; b += box(lx, 110, 22, 22, col, { rx: 3, a: 0.4 }) + lb(lx + 32, 121, t('d4.' + k), 220, { a: 'start' }); });
    b += lb(450, 172, t('d4.note'), 860, { c: 'm' });
    return { h: 200, body: b };
  }
  cells.forEach(([k, col], i) => { b += box(80, 10 + i * 46, 190, 42, col, { rx: 3, a: 0.16 }) + lb(175, 31 + i * 46, t('d4.' + k), 180); });
  const leg = [['cyan', 'tl'], ['gold', 'dll'], ['violet', 'phy']];
  let y = 346; leg.forEach(([col, k]) => { b += box(10, y, 20, 20, col, { rx: 3, a: 0.4 }) + lb(40, y + 10, t('d4.' + k), 300, { a: 'start' }); y += 30 + (nLines(t('d4.' + k), 300) - 1) * 19; });
  const nl = nLines(t('d4.note'), 330); b += lb(10, y + 8, t('d4.note'), 330, { a: 'start', c: 'm', top: true });
  return { h: y + 8 + nl * 19 + 4, body: b };
};

/* d5 · TLP header fields, widths drawn to scale (1 bit = 1/32 of the row) */
DIAG.d5 = (W, n) => {
  const T = M.TLP, LAB = { attr2: 'A2', ln: 'LN', th: 'TH', td: 'TD', ep: 'EP', t9: 'T9', t8: 'T8', at: 'AT', bcm: 'M', r: 'R', ph: 'PH' };
  const COL = { fmt: 'cyan', type: 'cyan', len: 'gold', rid: 'violet', cid: 'violet', tag: 'green', addrhi: 'mute', addrlo: 'mute', bc: 'gold', la: 'mute', st: 'red' };
  const groups = [['d5.t1', [['DW0', T.DW0], ['DW1', T.REQ1], ['DW2', T.ADDR64HI], ['DW3', T.ADDRLO]]], ['d5.t2', [['DW1', T.CPL1], ['DW2', T.CPL2]]]];
  const label = k => LAB[k] || t('d5.f.' + k);
  let b = '', y = 8;
  const cell = (x, yy, w, h, k) => box(x, yy, w, h, COL[k] || 'line', { rx: 2, a: COL[k] ? 0.18 : 0.06, sw: 1 }) + (w >= 17 ? lb(x + w / 2, yy + h / 2, label(k), w - 3) : '');
  if (!n) {
    const X0 = 70, BW = 816, bit = BW / 32;
    b += ['+0', '+1', '+2', '+3'].map((s, i) => tx(X0 + bit * (4 + 8 * i), y + 10, s, { c: 'm' })).join(''); y += 26;
    for (const [tk, dws] of groups) {
      b += lb(X0, y + 10, t(tk), 820, { a: 'start', c: 'g' }); y += 26;
      for (const [name, lay] of dws) {
        b += tx(X0 - 10, y + 20, name, { a: 'end', c: 'm' });
        let x = X0; for (const [k, bits] of lay) { b += cell(x, y, bits * bit, 40, k); x += bits * bit; }
        y += 46;
      }
      y += 8;
    }
    const nl = nLines(t('d5.note'), 860); b += lb(20, y + 4, t('d5.note'), 860, { a: 'start', c: 'm', top: true });
    return { h: y + 4 + nl * 19 + 6, body: b };
  }
  const X0 = 10, BW = 330, bit = BW / 16;
  for (const [tk, dws] of groups) {
    const nl = nLines(t(tk), 330); b += lb(X0, y + 10, t(tk), 330, { a: 'start', c: 'g', top: true }); y += 10 + nl * 19 + 4;
    for (const [name, lay] of dws) {
      b += tx(X0, y + 9, name + ' · ' + t('d5.bits.hi'), { a: 'start', c: 'm' }); y += 22;
      // split the DW's fields at bit 16 into an upper and a lower row
      let acc = 0; const rowsF = [[], []];
      for (const [k, bits] of lay) { let left = bits; while (left > 0) { const r = acc < 16 ? 0 : 1, room = (r + 1) * 16 - acc, take = Math.min(left, room); rowsF[r].push([k, take]); acc += take; left -= take; } }
      rowsF.forEach((fs, r) => { let x = X0; for (const [k, bits] of fs) { b += cell(x, y, bits * bit, 34, k); x += bits * bit; } y += 38; });
      y += 6;
    }
    y += 4;
  }
  const nl = nLines(t('d5.note'), 330); b += lb(X0, y + 4, t('d5.note'), 330, { a: 'start', c: 'm', top: true });
  return { h: y + 4 + nl * 19 + 6, body: b };
};

/* d6 · the credit loop */
DIAG.d6 = (W, n) => {
  let b = defs('d6a', ['cyan', 'gold']);
  const grid = (x, y, cw, rh) => {
    let s = ''; const cols = ['P', 'NP', 'Cpl'];
    cols.forEach((c, i) => { s += tx(x + 64 + cw * i + cw / 2, y, c, { c: 'g' }); });
    [['d6.hdr', rh], ['d6.data', rh * 1.4]].forEach(([k, h], r) => {
      const yy = y + 14 + (r ? rh + 6 : 0);
      s += lb(x + 30, yy + h / 2, t(k), 60);
      cols.forEach((c, i) => { s += box(x + 64 + cw * i + 3, yy, cw - 6, h, 'gold', { rx: 3, a: 0.08, sw: 1 }); });
    });
    return s;
  };
  if (!n) {
    b += box(20, 30, 300, 210, 'cyan') + tx(170, 52, t('d6.tx'), { c: 'c', w: 600 });
    b += lb(170, 98, t('d6.cl'), 280) + lb(170, 146, t('d6.cc'), 280) + lb(170, 200, t('d6.rule'), 280, { c: 'g' });
    b += box(580, 30, 300, 210, 'gold') + tx(730, 52, t('d6.rx'), { c: 'g', w: 600 }) + grid(590, 82, 72, 40);
    b += lb(730, 222, t('d6.unit', { d: fmt(M.FC.dataUnit, 0) }), 280, { c: 'm' });
    b += ln(320, 100, 576, 100, 'cyan', { arrow: 'd6a' }) + lb(450, 70, t('d6.tlp'), 240);
    b += ln(580, 180, 324, 180, 'gold', { arrow: 'd6a' }) + lb(450, 210, t('d6.upd'), 240);
    return { h: 256, body: b };
  }
  b += box(10, 10, 330, 150, 'cyan') + tx(175, 30, t('d6.tx'), { c: 'c', w: 600 });
  b += lb(175, 66, t('d6.cl'), 310) + lb(175, 104, t('d6.cc'), 310) + lb(175, 140, t('d6.rule'), 310, { c: 'g' });
  b += ln(40, 160, 40, 326, 'cyan', { arrow: 'd6a' }) + ln(310, 330, 310, 164, 'gold', { arrow: 'd6a' });
  b += lb(60, 186, t('d6.tlp'), 230, { a: 'start', top: true }) + lb(60, 262, t('d6.upd'), 230, { a: 'start', top: true });
  b += box(10, 330, 330, 196, 'gold') + tx(175, 350, t('d6.rx'), { c: 'g', w: 600 }) + grid(20, 378, 84, 38);
  b += lb(175, 508, t('d6.unit', { d: fmt(M.FC.dataUnit, 0) }), 310, { c: 'm' });
  return { h: 534, body: b };
};

/* d7 · ACK/NAK and replay: TLP 8 arrives damaged, 9 is dropped, both are sent again */
DIAG.d7 = (W, n) => {
  let b = defs('d7a', ['cyan', 'red', 'gold', 'mute']);
  const msgs = [['m7', 'tx', 'cyan', 'ok'], ['m8', 'tx', 'red', 'bad'], ['m9', 'tx', 'mute', 'drop'], ['nak', 'rx', 'gold', 'nakn'], ['r8', 'tx', 'cyan', 'ok8'], ['r9', 'tx', 'cyan', 'ok9'], ['ack', 'rx', 'gold', 'ackn']];
  const XT = n ? 30 : 170, XR = n ? 320 : 730, top = n ? 62 : 56, step = n ? 62 : 46, drop = n ? 30 : 34;
  b += tx(XT, 20, t('d7.tx'), { c: 'c', w: 600, a: n ? 'start' : 'middle' }) + tx(XR, 20, t('d7.rx'), { c: 'g', w: 600, a: n ? 'end' : 'middle' });
  const H = top + msgs.length * step + 20;
  b += ln(XT, 34, XT, H - 6, 'mute', { sw: 1 }) + ln(XR, 34, XR, H - 6, 'mute', { sw: 1 });
  msgs.forEach(([k, from, col, note], i) => {
    const y0 = top + i * step, y1 = y0 + drop, x0 = from === 'tx' ? XT : XR, x1 = from === 'tx' ? XR : XT;
    b += ln(x0, y0, x1 + (x1 > x0 ? -4 : 4), y1, col, { arrow: 'd7a', dash: col === 'mute' });
    const mx = (XT + XR) / 2;
    if (!n) {
      b += tx(mx, (y0 + y1) / 2 - 12, t('d7.' + k), { c: col === 'mute' ? 'm' : col === 'red' ? 'r' : col === 'gold' ? 'g' : '' });
      const side = from === 'tx' ? [XR + 14, 'start'] : [XT - 14, 'end'];
      b += lb(side[0], from === 'tx' ? y1 : y1, t('d7.n.' + note), 150, { a: side[1], c: col === 'red' ? 'r' : 'm' });
    } else {
      b += tx(mx, y0 - 11, t('d7.' + k) + ' · ' + t('d7.n.' + note), { c: col === 'red' ? 'r' : col === 'gold' ? 'g' : col === 'mute' ? 'm' : '' });
    }
  });
  return { h: H, body: b };
};

/* d8 · the 64-byte type 0 configuration header and the ECAM address */
DIAG.d8 = (W, n) => {
  const rows = [[['did', 2], ['vid', 2]], [['sts', 2], ['cmd', 2]], [['class', 3], ['rev', 1]], [['bist', 1], ['htype', 1], ['lat', 1], ['cls', 1]],
    [['bar0', 4]], [['bar1', 4]], [['bar2', 4]], [['bar3', 4]], [['bar4', 4]], [['bar5', 4]], [['cis', 4]], [['sid', 2], ['svid', 2]], [['rom', 4]], [['rsv', 3], ['cap', 1]], [['rsv', 4]], [['maxlat', 1], ['mingnt', 1], ['ipin', 1], ['iline', 1]]];
  const COL = { bar0: 'gold', bar1: 'gold', bar2: 'gold', bar3: 'gold', bar4: 'gold', bar5: 'gold', vid: 'cyan', did: 'cyan', class: 'cyan', cmd: 'violet', htype: 'violet', cap: 'green' };
  const X0 = n ? 52 : 70, CW = n ? 72 : 118, RH = 26;
  let b = ['+3', '+2', '+1', '+0'].map((s, i) => tx(X0 + CW * i + CW / 2, 12, s, { c: 'm' })).join('');
  rows.forEach((r, i) => {
    const y = 26 + i * RH; let x = X0;
    b += tx(X0 - 8, y + RH / 2, (i * 4).toString(16).toUpperCase().padStart(2, '0') + 'h', { a: 'end', c: 'm' });
    for (const [k, bytes] of r) { const w = bytes * CW; b += box(x, y, w, RH, COL[k] || 'line', { rx: 1, a: COL[k] ? 0.16 : 0.05, sw: 1 }) + lb(x + w / 2, y + RH / 2, t('d8.f.' + k), w - 6); x += w; }
  });
  const gy = 26 + 16 * RH;
  // ECAM: bus 8 | dev 5 | fn 3 | reg 12 bits, to scale
  const ex = n ? 10 : 590, ew = n ? 330 : 296, ey = n ? gy + 30 : 40, bit = ew / 28;
  b += lb(ex, ey, t('d8.ecam'), ew, { a: 'start', c: 'g', top: true });
  const ey2 = ey + nLines(t('d8.ecam'), ew) * 19 + 10;
  let x = ex; const ECOL = { bus: 'cyan', dev: 'violet', fn: 'green', reg: 'gold' };
  for (const [k, bits] of M.CFG.ECAM_BITS) { b += box(x, ey2, bits * bit, 32, ECOL[k], { rx: 2, a: 0.2, sw: 1 }) + lb(x + bits * bit / 2, ey2 + 16, t('d8.e.' + k), bits * bit - 4); x += bits * bit; }
  let yy = ey2 + 50;
  for (const k of ['l1', 'l2', 'l3', 'l4', 'ex']) {
    const s = t('d8.' + k, { addr: '0x' + M.CFG.ecam(4, 0, 0, 0x10).toString(16).toUpperCase() });
    b += lb(ex, yy, s, ew, { a: 'start', top: true, c: k === 'ex' ? 'g' : '' }); yy += nLines(s, ew) * 19 + 8;
  }
  return { h: Math.max(gy + 8, yy + 4), body: b };
};

/* d9 · a device doing work: doorbell, DMA through the IOMMU, and the interrupt as a memory write */
DIAG.d9 = (W, n) => {
  let b = defs('d9a', ['cyan', 'gold', 'green', 'violet']);
  const steps = ['s1', 's2', 's3', 's4', 's5'];
  if (!n) {
    b += box(20, 20, 200, 56, 'cyan') + lb(120, 48, t('d9.cpu'), 190);
    b += box(20, 150, 200, 56, 'cyan', { a: 0.06 }) + lb(120, 178, t('d9.apic'), 190);
    b += box(330, 92, 250, 116, 'cyan', { a: 0.18 }) + lb(455, 116, t('d9.rc'), 240) + box(360, 140, 190, 50, 'violet') + lb(455, 165, t('d9.iommu'), 180);
    b += box(690, 20, 190, 56, 'green') + lb(785, 48, t('d9.mem'), 180);
    b += box(690, 214, 190, 56, 'gold') + lb(785, 242, t('d9.dev'), 180);
    b += ln(220, 40, 686, 40, 'cyan', { arrow: 'd9a' }) + tx(450, 26, '①', { c: 'c' });
    b += ln(220, 64, 330, 104, 'cyan', { arrow: 'd9a' }) + ln(580, 150, 686, 226, 'cyan', { arrow: 'd9a' }) + tx(640, 176, '②', { c: 'c' });
    b += ln(690, 252, 552, 180, 'gold', { arrow: 'd9a' }) + ln(552, 152, 690, 66, 'green', { arrow: 'd9a' }) + tx(632, 108, '③', { c: 'n' });
    b += ln(690, 262, 330, 196, 'violet', { arrow: 'd9a', dash: true }) + ln(330, 180, 224, 180, 'violet', { arrow: 'd9a' }) + tx(510, 244, '④', { c: 'v' });
    b += ln(120, 150, 120, 80, 'violet', { arrow: 'd9a' }) + tx(132, 114, '⑤', { a: 'start', c: 'v' });
    let y = 300; for (const k of steps) { b += lb(20, y, t('d9.' + k), 860, { a: 'start', top: true }); y += nLines(t('d9.' + k), 860) * 19 + 6; }
    return { h: y + 4, body: b };
  }
  b += box(10, 10, 155, 50, 'cyan') + lb(87, 35, t('d9.cpu'), 145) + box(185, 10, 155, 50, 'green') + lb(262, 35, t('d9.mem'), 145);
  b += box(10, 100, 155, 50, 'cyan', { a: 0.06 }) + lb(87, 125, t('d9.apic'), 145);
  b += box(10, 190, 330, 100, 'cyan', { a: 0.18 }) + lb(175, 212, t('d9.rc'), 320) + box(60, 234, 230, 44, 'violet') + lb(175, 256, t('d9.iommu'), 220);
  b += box(10, 340, 330, 50, 'gold') + lb(175, 365, t('d9.dev'), 320);
  b += ln(165, 28, 181, 28, 'cyan', { arrow: 'd9a' }) + tx(173, 74, '①', { c: 'c' });
  b += ln(40, 60, 40, 186, 'cyan', { arrow: 'd9a' }) + ln(40, 290, 40, 336, 'cyan', { arrow: 'd9a' }) + tx(52, 316, '②', { a: 'start', c: 'c' });
  b += ln(300, 336, 300, 294, 'gold', { arrow: 'd9a' }) + ln(300, 190, 300, 64, 'green', { arrow: 'd9a' }) + tx(312, 316, '③', { a: 'start', c: 'n' });
  b += ln(200, 336, 200, 294, 'violet', { arrow: 'd9a', dash: true }) + ln(120, 190, 120, 154, 'violet', { arrow: 'd9a' }) + tx(212, 316, '④', { a: 'start', c: 'v' });
  b += ln(87, 100, 87, 64, 'violet', { arrow: 'd9a' }) + tx(99, 82, '⑤', { a: 'start', c: 'v' });
  let y = 410; for (const k of steps) { b += lb(10, y, t('d9.' + k), 330, { a: 'start', top: true }); y += nLines(t('d9.' + k), 330) * 19 + 6; }
  return { h: y + 4, body: b };
};

/* d10 · the channel and how Gen5's 36 dB at 16 GHz is shared out (bar to scale) */
DIAG.d10 = (W, n) => {
  const G = M.LOSS.GEN[5], segs = [['pkg', G.pkg, 'cyan'], ['board', G.budget - M.LOSS.fixed(5), 'gold'], ['conn', G.conn, 'violet'], ['card', G.card, 'green']];
  let b = '';
  if (!n) {
    b += box(20, 20, 140, 50, 'cyan') + lb(90, 45, t('d10.cpu'), 130);
    b += ln(160, 45, 300, 45, 'gold', { sw: 3 }) + box(300, 22, 130, 46, 'violet', { dash: true, a: 0.05 }) + lb(365, 45, t('d10.ret'), 122) + ln(430, 45, 540, 45, 'gold', { sw: 3 });
    b += box(540, 14, 64, 62, 'violet') + lb(572, 45, t('d10.conn'), 60);
    b += ln(604, 45, 720, 45, 'green', { sw: 3 }) + box(720, 20, 160, 50, 'green') + lb(800, 45, t('d10.dev'), 150);
    b += lb(230, 90, t('d10.board'), 140, { c: 'm' }) + lb(662, 90, t('d10.cardt'), 110, { c: 'm' });
    b += lb(20, 128, t('d10.bar', { b: fmt(G.budget, 0), f: fmt(G.f, 0) }), 860, { a: 'start', c: 'g' });
    let x = 20; const k = 860 / G.budget;
    for (const [key, v, col] of segs) { b += box(x, 148, v * k, 40, col, { rx: 2, a: 0.3, sw: 1 }) + (v * k > 40 ? lb(x + v * k / 2, 168, t('d10.s.' + key, { v: fmt(v, 1) }), v * k - 6) : ''); x += v * k; }
    for (const d of [0, 9, 18, 27, 36]) b += tx(20 + d * k, 204, fmt(d, 0), { c: 'm', a: d === 0 ? 'start' : d === 36 ? 'end' : 'middle' });
    b += lb(20, 232, t('d10.connlab', { v: fmt(G.conn, 1) }), 860, { a: 'start', c: 'm', top: true });
    return { h: 232 + nLines(t('d10.connlab', { v: '1.5' }), 860) * 19 + 4, body: b };
  }
  const chain = [['cpu', 'cyan', false], ['board', 'gold', 'line'], ['ret', 'violet', 'dash'], ['board2', 'gold', 'line'], ['conn', 'violet', false], ['cardt', 'green', 'line'], ['dev', 'green', false]];
  let y = 10;
  for (const [k, col, kind] of chain) {
    if (kind === 'line') { b += ln(60, y, 60, y + 32, col, { sw: 3 }) + lb(80, y + 16, t('d10.' + (k === 'board2' ? 'board' : k)), 260, { a: 'start', c: 'm' }); y += 32; }
    else { b += box(10, y, 330, 38, col, { dash: kind === 'dash', a: kind === 'dash' ? 0.05 : 0.12 }) + lb(175, y + 19, t('d10.' + k), 320); y += 38; }
  }
  y += 14; b += lb(10, y, t('d10.bar', { b: fmt(G.budget, 0), f: fmt(G.f, 0) }), 330, { a: 'start', c: 'g', top: true }); y += nLines(t('d10.bar', { b: '36', f: '16' }), 330) * 19 + 8;
  let x = 10; const k = 330 / G.budget;
  for (const [, v, col] of segs) { b += box(x, y, v * k, 30, col, { rx: 2, a: 0.3, sw: 1 }); x += v * k; }
  y += 44;
  for (const [key, v, col] of segs) { b += box(10, y, 18, 18, col, { rx: 2, a: 0.4, sw: 1 }) + lb(38, y + 9, t('d10.s.' + key, { v: fmt(v, 1) }), 300, { a: 'start' }); y += 26; }
  return { h: y + 4, body: b };
};

/* d11 · NRZ and PAM4 eyes at the same swing: PAM4's three eyes are each one third as tall */
DIAG.d11 = (W, n) => {
  const eye = (x1, x2, yt, yb, col) => { const xm = (x1 + x2) / 2, yc = (yt + yb) / 2, h = (yb - yt) / 2; return pathEl(`M${x1},${yc} Q${xm},${yc - 2 * h} ${x2},${yc} Q${xm},${yc + 2 * h} ${x1},${yc} Z`, col, { fill: rgba(COLS[col], 0.12), sw: 1.6 }); };
  const panel = (x, y, w, h, levels, labs, title, foot, col) => {
    let s = tx(x + w / 2, y, title, { c: col === 'cyan' ? 'c' : 'g', w: 600 });
    const top = y + 24, bot = y + 24 + h, X1 = x + 46, X2 = x + w - 20;
    levels.forEach((f, i) => { const yy = top + (bot - top) * f; s += ln(X1 - 6, yy, X2, yy, 'mute', { sw: 1, dash: true }) + tx(x + 38, yy, labs[i], { a: 'end', c: 'm' }); });
    for (let i = 0; i < levels.length - 1; i++) { const ya = top + (bot - top) * levels[i], yb = top + (bot - top) * levels[i + 1]; s += eye(X1 + 6, X2 - 6, ya + 4, yb - 4, col); }
    s += lb(x + w / 2, bot + 24, foot, w - 10, { c: 'm' });
    return s;
  };
  const nrzT = t('d11.nrz'), pamT = t('d11.pam');
  if (!n) {
    let b = panel(20, 16, 410, 190, [0, 1], ['1', '0'], nrzT, t('d11.nrzf'), 'cyan');
    b += panel(470, 16, 410, 190, [0, 1 / 3, 2 / 3, 1], ['10', '11', '01', '00'], pamT, t('d11.pamf', { db: fmt(M.EYE.penaltyDb, 1) }), 'gold');
    const nl = Math.max(nLines(t('d11.nrzf'), 400), nLines(t('d11.pamf', { db: '9.5' }), 400));
    return { h: 254 + (nl - 1) * 10 + 22, body: b };
  }
  let b = panel(10, 14, 330, 150, [0, 1], ['1', '0'], nrzT, t('d11.nrzf'), 'cyan');
  b += panel(10, 270, 330, 150, [0, 1 / 3, 2 / 3, 1], ['10', '11', '01', '00'], pamT, t('d11.pamf', { db: fmt(M.EYE.penaltyDb, 1) }), 'gold');
  return { h: 270 + 24 + 150 + 24 + nLines(t('d11.pamf', { db: '9.5' }), 320) * 19 + 10, body: b };
};

/* d12 · the 256-byte FLIT, one cell per byte; the dot shade shows which of the three FEC interleaves a byte belongs to */
DIAG.d12 = (W, n) => {
  const F = M.FLIT, cols = n ? 16 : 32, cell = n ? 19 : 26, X0 = n ? 40 : 46, Y0 = 10;
  const reg = i => i < F.tlp ? 'green' : i < F.tlp + F.dlp ? 'cyan' : i < F.tlp + F.dlp + F.crc ? 'violet' : 'red';
  const dotc = [C.ink, C.mute, '#5a6274'];
  let b = '';
  for (let i = 0; i < F.bytes; i++) {
    const r = Math.floor(i / cols), c = i % cols, x = X0 + c * cell, y = Y0 + r * cell, col = reg(i);
    b += `<rect x="${x + 1}" y="${y + 1}" width="${cell - 2}" height="${cell - 2}" rx="2" fill="${rgba(COLS[col], col === 'green' ? 0.22 : 0.6)}"/>` + `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="2.4" fill="${dotc[i % 3]}"/>`;
    if (c === 0) b += tx(X0 - 6, y + cell / 2, String(i), { a: 'end', c: 'm' });
  }
  let y = Y0 + (F.bytes / cols) * cell + 22;
  const leg = [['green', 'tlp', F.tlp], ['cyan', 'dlp', F.dlp], ['violet', 'crc', F.crc], ['red', 'fec', F.fec]];
  if (!n) { leg.forEach(([col, k, v], i) => { const lx = 46 + i * 212; b += box(lx, y - 9, 18, 18, col, { rx: 2, a: 0.6, sw: 1 }) + lb(lx + 26, y, t('d12.' + k, { v: fmt(v, 0) }), 180, { a: 'start' }); }); y += 30; }
  else { for (const [col, k, v] of leg) { b += box(10, y - 9, 18, 18, col, { rx: 2, a: 0.6, sw: 1 }) + lb(36, y, t('d12.' + k, { v: fmt(v, 0) }), 300, { a: 'start' }); y += 26; } }
  const w = n ? 330 : 830; b += lb(n ? 10 : 46, y, t('d12.il'), w, { a: 'start', c: 'm', top: true });
  return { h: y + nLines(t('d12.il'), w) * 19 + 6, body: b };
};

function renderDiagrams(force) {
  document.querySelectorAll('.svgbox[data-diagram]').forEach(box => {
    const name = box.dataset.diagram, cw = box.clientWidth;
    if (!cw || !DIAG[name]) return;
    const narrow = cw < 700;
    if (!force && box.__mode === narrow) return;
    box.__mode = narrow;
    const W = narrow ? 350 : 900, r = DIAG[name](W, narrow);
    box.innerHTML = `<svg class="dg" viewBox="0 0 ${W} ${Math.ceil(r.h)}" role="img" aria-label="${esc(t(name + '.aria'))}">${r.body}</svg>`;
  });
}

const L5 = M.LINK5x16();
// a utilisation near 1: three decimals, and never a rounded-up 100.000%
const upct = u => u >= 0.999995 ? t('u.pct', { v: '≈ 100' }) : pct(u, u > 0.999 ? 3 : 1);

/* ───────── 02 link width and generation ───────── */
(() => {
  const cv = $('#lnCv');
  const card = () => ({ g: +radioVal('lnCg'), w: +radioVal('lnCw') }), slot = () => ({ g: +radioVal('lnSg'), w: +radioVal('lnSw') });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.LANE.negotiate(card(), slot()), rows = [];
      rows.push([t('ch2.bar.card'), r.full, C.mute, gbps(r.full)]);
      rows.push([t('ch2.bar.link'), r.GBps, C.gold, gbps(r.GBps)]);
      bars(c, w, h, rows, Math.max(r.full, 1e-9) * 1.02, 1);
    }
  });
  function text() {
    const z = M.say.lane(card(), slot()), v = z.v, lk = t('ch2.linkfmt', { g: v.g, w: v.w });
    // the narrowest same-bandwidth link one generation older, if there is one
    const eq = v.g > 1 && v.w < 16 ? t('ch2.linkfmt', { g: v.g - 1, w: v.w * 2 }) : t('u.none');
    put('#lnLink', lk); put('#lnBw', gbps(v.GBps)); put('#lnShare', pct(v.share)); put('#lnEq', eq);
    putHTML('#lnSay', t(z.key, { link: lk, bw: gbps(v.GBps), full: gbps(v.full), share: pct(v.share), eq }));
  }
  sim.text = text;
  ['lnCg', 'lnCw', 'lnSg', 'lnSw'].forEach(nm => onAll(radios(nm), 'change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 03 TLP bytes and efficiency ───────── */
(() => {
  const cv = $('#tlCv'), sS = $('#tlS');
  const o = () => ({ op: radioVal('tlOp'), S: Math.pow(2, +sS.value), mps: +radioVal('tlM'), mrrs: +radioVal('tlR'), cpl: radioVal('tlC') === 'mps' ? +radioVal('tlM') : 64 });
  const eff = (p, S) => p.op === 'wr' ? M.TLP.write(S, p.mps, true).eff : M.TLP.read(S, p.mrrs, p.cpl, true).eff;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = o(), f = frame(w, h, [26, 14, 38, 46], 6, 16, 0, 1);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100, 0)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      c.fillStyle = C.mute; spacedTicks(c, [6, 8, 10, 12, 14, 16].map(e => [f.X(e), size(Math.pow(2, e))]), f.B + 12, w);
      const curve = (q, col, lw) => { const pts = []; for (let e = 6; e <= 16.001; e += 0.05) pts.push([e, eff(q, Math.pow(2, e))]); path(c, pts, f.X, f.Y, col, lw); };
      for (const m of [128, 256, 512]) if (m !== p.mps) curve(Object.assign({}, p, { mps: m, cpl: p.cpl === 64 ? 64 : m }), C.dimfill, 1.6);
      curve(p, C.gold, 2.6); dot(c, f.X(+sS.value), f.Y(eff(p, p.S)), C.gold, 5);
    }
  });
  function text() {
    const p = o(), z = M.say.tlp(p.op, p.S, p.mps, p.mrrs, p.cpl), v = z.v, T = M.TLP, rid = 0x0400, tag = 0x2A, addr = 0x1000000000;
    put('#tlSo', size(p.S));
    put('#tlN', p.op === 'wr' ? t('ch3.n.wr', { n: fmt(v.n, 0) }) : t('ch3.n.rd', { q: fmt(v.nreq, 0), c: fmt(v.ncpl, 0) }));
    put('#tlW', size(v.wire)); put('#tlE', pct(v.eff, 1)); put('#tlX', gbps(v.X, 1));
    const hx = a => T.hex(a).join(' '), first = Math.min(p.S, p.op === 'wr' ? p.mps : p.mrrs);
    const h = T.mem(p.op, addr, first, rid, tag), dws = h.dws.map(d => hx(d));
    const name = p.op === 'wr' ? 'ch3.hex.mwr' : 'ch3.hex.mrd', nl = '\n';
    let s = `<span class="m">${t(name, { len: fmt(first, 0) })}</span>` + nl;
    s += `<span class="c">${dws[0]}</span>  <span class="m">${t('ch3.hex.dw0', { fmt: h.v.fmt.toString(2).padStart(3, '0'), len: fmt(h.v.len || 1024, 0) })}</span>` + nl;
    s += `<span class="v">${dws[1]}</span>  <span class="m">${t('ch3.hex.dw1')}</span>` + nl;
    s += `<span class="g">${dws.slice(2).join(' ')}</span>  <span class="m">${t('ch3.hex.addr')}</span>`;
    if (p.op === 'rd') {
      const cb = Math.min(p.cpl, first), c1 = T.cpl(cb, first, 0x0000, rid, tag, addr % 128), cd = c1.dws.map(d => hx(d));
      s += nl + nl + `<span class="m">${t('ch3.hex.cpld', { len: fmt(cb, 0) })}</span>` + nl;
      s += `<span class="c">${cd[0]}</span>  <span class="m">${t('ch3.hex.cdw0')}</span>` + nl;
      s += `<span class="v">${cd[1]}</span>  <span class="m">${t('ch3.hex.cdw1', { bc: fmt(first, 0) })}</span>` + nl;
      s += `<span class="g">${cd[2]}</span>  <span class="m">${t('ch3.hex.cdw2')}</span>`;
    }
    putHTML('#tlHex', s);
    putHTML('#tlSay', t(z.key, { size: size(p.S), eff: pct(v.eff, 1), X: gbps(v.X, 1), oh: size(v.oh), q: fmt(v.nreq || 0, 0), c: fmt(v.ncpl || v.n || 0, 0), mps: fmt(p.mps, 0), cpl: fmt(p.cpl, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); ['tlOp', 'tlM', 'tlR', 'tlC'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 04 credits ───────── */
(() => {
  const cv = $('#fcCv'), sB = $('#fcB'), sR = $('#fcR'), cS = $('#fcS');
  const o = () => { const sc = cS.checked; return { payload: +radioVal('fcP'), hdr: sc ? 4096 : M.FC.maxHdr, data: +sB.value, rtt: +sR.value, scaled: sc }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = o(), T = 3000, r = M.FC.sim(p, T), max = Math.max(p.data, 64);
      const f = frame(w, h, [26, 14, 38, 56], 0, T, 0, max * 1.08);
      const ys = [0, max / 2, max].map(Math.round);
      yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      c.fillStyle = C.mute; spacedTicks(c, [0, 500, 1000, 1500, 2000, 2500, 3000].map(x => [f.X(x), fmt(x, 0)]), f.B + 12, w);
      // credits available (step trace)
      const pts = []; let last = r.trace[0][1];
      for (const [x, v] of r.trace) { if (x > T) break; pts.push([x, last]); pts.push([x, v]); last = v; }
      pts.push([T, last]); path(c, pts, f.X, f.Y, C.cyan, 1.8);
      // a tick per TLP sent, along the bottom
      c.fillStyle = C.gold; for (const s of r.sends) { if (s > T) break; c.fillRect(f.X(s), f.B - 9, Math.max(1, f.X(s + r.tau) - f.X(s) - 0.4), 8); }
    }
  });
  function text() {
    const p = o(), z = M.say.fc(p), v = z.v;
    put('#fcBo', fmt(p.data, 0)); put('#fcRo', ns(p.rtt, 0));
    put('#fcU', pct(v.util)); put('#fcX', gbps(v.X, 1)); put('#fcW', fmt(v.W, 0)); put('#fcN', fmt(v.needData, 0));
    putHTML('#fcSay', t(z.key, { u: pct(v.util), X: gbps(v.X, 1), W: fmt(v.W, 0), need: fmt(v.needData, 0), needH: fmt(v.needHdr, 0), buf: fmt(p.data, 0), kb: fmt(v.needData * 16 / 1000, 1) }));
  }
  sim.text = text;
  const go = () => { sB.max = cS.checked ? 8192 : M.FC.maxData; if (+sB.value > +sB.max) sB.value = sB.max; sim.dirty = true; text(); };
  sB.addEventListener('input', go); sR.addEventListener('input', go); cS.addEventListener('change', go); onAll(radios('fcP'), 'change', go);
  text();
})();

/* ───────── 05 replay under a bit-error rate ───────── */
(() => {
  const cv = $('#arCv'), sB = $('#arB'), sR = $('#arR');
  const o = () => ({ payload: +radioVal('arP'), ber: Math.pow(10, +sB.value), rtt: +sR.value });
  const U = (p, r) => radioVal('arM') === 'sr' ? r.Usr : r.U;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = o(), f = frame(w, h, [26, 14, 38, 46], -15, -4, 0, 1);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100, 0)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      c.fillStyle = C.mute; logTicks(c, f, -15, -4, f.B + 12, w);
      vline(c, f, f.X(-12), C.cyan, [3, 4]);
      const curve = (q, col, lw) => { const pts = []; for (let e = -15; e <= -4.001; e += 0.05) pts.push([e, U(q, M.ARQ.tlp(Object.assign({}, q, { ber: Math.pow(10, e) })))]); path(c, pts, f.X, f.Y, col, lw); };
      for (const pl of [128, 256, 1024, 4096]) if (pl !== p.payload) curve(Object.assign({}, p, { payload: pl }), C.dimfill, 1.6);
      curve(p, C.gold, 2.6); dot(c, f.X(+sB.value), f.Y(U(p, M.ARQ.tlp(p))), C.gold, 5);
      c.fillStyle = C.cyan; c.textAlign = 'left'; c.fillText(t('ch5.cv.spec'), f.X(-12) + 6, f.T + 8);
    }
  });
  function text() {
    const p = o(), z = M.say.arq(p), v = z.v, u = U(p, v);
    put('#arBo', sci(p.ber)); put('#arRo', ns(p.rtt, 0));
    put('#arPe', sci(v.p)); put('#arE', t('ch5.persec', { v: sci(v.errPerSec, 1) })); put('#arU', upct(u));
    const yrs = v.retrainPerSec > 0 ? 1 / v.retrainPerSec / 31557600 : Infinity;
    put('#arT', v.retrainPerSec > 1 ? t('ch5.persec', { v: sci(v.retrainPerSec, 1) }) : yrs > 1e6 ? t('ch5.never') : t('ch5.years', { v: sci(yrs, 1) }));
    const key = u > 0.9999 ? 'ch5.say.clean' : u > 0.9 ? 'ch5.say.some' : 'ch5.say.bad';   // same thresholds as M.say.arq, applied to the chosen scheme
    putHTML('#arSay', t(key, { p: sci(v.p), u: upct(u), err: sci(v.errPerSec, 1), ratio: fmt(v.ratio, 0), buf: size(Math.round(v.bufBytes)) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sB.addEventListener('input', go); sR.addEventListener('input', go); onAll(radios('arP'), 'change', go); onAll(radios('arM'), 'change', go);
  text();
})();

/* ───────── 06 enumeration ───────── */
(() => {
  const cv = $('#enCv'), sBar = $('#enBar'), cCard = $('#enCard'), bStep = $('#enStep'), bAll = $('#enAll'), bReset = $('#enReset');
  let stepN = null;   // null = finished
  const o = () => ({ card: cCard.checked, cardBar: Math.pow(2, +sBar.value) });
  const bdf = d => d.bus.toString(16).padStart(2, '0') + ':' + d.dev.toString(16).padStart(2, '0') + '.' + d.fn;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.ENUM.run(o()), done = stepN == null || stepN >= r.steps.length;
      // two rows on one true scale each: the whole map, then a zoom on the second root port (the switch and its three slots)
      const rp2 = r.bridges.find(b => b.kind === 'rp' && b.dev === 2);
      const row = (y0, lo, hi, title) => {
        const X = a => 10 + (w - 20) * (a - lo) / (hi - lo), cl = (a, b) => [Math.max(X(a), 10), Math.min(X(b), w - 10)];
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(title, 10, y0);
        c.fillStyle = C.dimfill; c.fillRect(10, y0 + 22, w - 20, 26);
        if (done) {
          for (const b of r.bridges) if (b.need && b.kind !== 'sw' && b.limit >= lo && b.base < hi) {
            const [x0, x1] = cl(b.base, b.limit + 1), inset = b.kind === 'rp' ? 0 : 3;
            c.strokeStyle = C.violet; c.lineWidth = 1.2; c.strokeRect(x0 + 0.5, y0 + 16 + inset, Math.max(1, x1 - x0 - 1), 38 - 2 * inset);
          }
          for (const d of r.devs) d.bars.forEach((sz, i) => { const a = d.addr[i]; if (a + sz <= lo || a >= hi) return; const [x0, x1] = cl(a, a + sz); c.fillStyle = C.gold; c.fillRect(x0, y0 + 26, Math.max(1.5, x1 - x0 - 0.6), 18); });
        }
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0x' + hex32(lo), 10, y0 + 68);
        c.textAlign = 'right'; c.fillText(done ? '0x' + hex32(hi) : '…', w - 10, y0 + 68);
      };
      row(16, M.ENUM.base, M.ENUM.base + Math.max(r.used, M.MiB), t('ch6.cv.map'));
      if (h > 200) row(h / 2 + 22, rp2.base || M.ENUM.base, (rp2.limit || M.ENUM.base) + 1, t('ch6.cv.zoom'));
    }
  });
  function text() {
    const p = o(), r = M.ENUM.run(p), done = stepN == null || stepN >= r.steps.length, shown = done ? r.steps.length : stepN;
    put('#enBaro', size(p.cardBar));
    // table: everything discovered so far
    const seen = new Set(r.steps.slice(0, shown).map(s => bdf(s.bdf) + (s.k === 'close' ? 'c' : '')));
    const rows = [];
    const walk = (node, depth) => {
      for (const k of node.kids) {
        const id = bdf(k.bdf); if (!seen.has(id)) continue;
        const name = k.kind === 'ep' ? t('ch6.dev.' + k.id) : t('ch6.br.' + k.kind);
        let bus = '—', mem;
        if (k.kind === 'ep') mem = done ? k.bars.map((s, i) => '0x' + hex32(k.addr[i]) + ' · ' + size(s)).join('<br>') : k.bars.map(s => size(s)).join(' + ');
        else { const closed = seen.has(id + 'c'); bus = t('ch6.busfmt', { p: k.pri, s: k.sec, u: closed ? k.sub : '?' }); mem = done ? (k.need ? '0x' + hex32(k.base) + '–0x' + hex32(k.limit) : t('ch6.nowin')) : '…'; }
        rows.push(`<tr${k.id === 'card' || (k.kind === 'dp' && k.dev === 2) ? ' class="hi"' : ''}><td style="padding-left:${8 + depth * 14}px">${name}</td><td data-h="${t('ch6.th.bdf')}">${id}</td><td data-h="${t('ch6.th.bus')}">${bus}</td><td data-h="${t('ch6.th.mem')}">${mem}</td></tr>`);
        if (k.kind !== 'ep') walk(k.kind === 'sw' ? { kids: k.kids } : k, depth + 1);
      }
    };
    walk(r.root, 0);
    putHTML('#enTab tbody', rows.join(''));
    const s = done ? null : r.steps[Math.max(0, shown - 1)];
    putHTML('#enLog', shown === 0 ? t('ch6.log.start') : s ? t('ch6.log.' + s.k, { bdf: bdf(s.bdf), sec: s.sec, sub: s.sub, kind: t('ch6.br.' + (s.kind || 'rp')), dev: s.id ? t('ch6.dev.' + s.id) : '' }) : t('ch6.log.done', { n: r.steps.length }));
    put('#enBus', done ? fmt(r.buses, 0) : '…'); put('#enUsed', done ? size(r.used) : '…'); put('#enWaste', done ? size(r.waste) : '…');
    const probe = M.CFG.barProbe(p.cardBar); put('#enProbe', hex32(probe) + 'h');
    const card = r.bridges.find(b => b.kind === 'dp' && b.dev === 2);
    const z = M.say.enumr(p, stepN);
    putHTML('#enSay', t(z.key, { buses: fmt(r.buses, 0), used: size(r.used), sum: size(r.barSum), waste: size(r.waste), bar: size(p.cardBar), win: card && card.need ? size(card.need) : '—', probe: hex32(probe), n: fmt(shown, 0), total: fmt(r.steps.length, 0) }));
    bStep.disabled = done;
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  bStep.addEventListener('click', () => { const r = M.ENUM.run(o()); stepN = stepN == null ? r.steps.length : Math.min(r.steps.length, stepN + 1); if (stepN >= r.steps.length) stepN = null; go(); });
  bAll.addEventListener('click', () => { stepN = null; go(); });
  bReset.addEventListener('click', () => { stepN = 0; go(); bStep.focus(); });
  cCard.addEventListener('change', () => { stepN = null; go(); }); sBar.addEventListener('input', () => { stepN = null; go(); });
  text();
})();

/* ───────── 07 an interrupt is a memory write ───────── */
(() => {
  const sD = $('#msD'), sV = $('#msV');
  function text() {
    const real = radioVal('msPre') === 'real', A = M.MSI, T = M.TLP;
    sD.disabled = real; sV.disabled = real;
    const a = real ? A.billauer.addr : A.addr(+sD.value, 0, 0), d = real ? A.billauer.data : A.data(+sV.value, 0, 0, 0), k = A.decode(a, d);
    put('#msDo', fmt(+sD.value, 0)); put('#msVo', '0x' + (+sV.value).toString(16).toUpperCase());
    const e = A.entry(a, d, false), hx = x => T.hex(x).join(' '), tl = A.tlp(a, d, 0x0400, 0), nl = '\n';
    let s = `<span class="m">${t('ch7.hex.entry')}</span>` + nl;
    s += `<span class="g">${hx(e.slice(0, 4))}</span>  <span class="m">${t('ch7.hex.alo', { a: hex32(a) })}</span>` + nl;
    s += `<span class="m">${hx(e.slice(4, 8))}</span>  <span class="m">${t('ch7.hex.ahi')}</span>` + nl;
    s += `<span class="c">${hx(e.slice(8, 12))}</span>  <span class="m">${t('ch7.hex.data', { d: hex32(d).slice(4) })}</span>` + nl;
    s += `<span class="m">${hx(e.slice(12, 16))}</span>  <span class="m">${t('ch7.hex.ctl')}</span>` + nl + nl;
    s += `<span class="m">${t('ch7.hex.tlp')}</span>` + nl;
    s += `<span class="c">${hx(tl.hdr.dws[0])}</span>  <span class="m">${t('ch7.hex.dw0')}</span>` + nl;
    s += `<span class="v">${hx(tl.hdr.dws[1])}</span>  <span class="m">${t('ch7.hex.dw1')}</span>` + nl;
    s += `<span class="g">${hx(tl.hdr.dws[2])}</span>  <span class="m">${t('ch7.hex.dw2')}</span>` + nl;
    s += `<span class="r">${hx(tl.data)}</span>  <span class="m">${t('ch7.hex.pay')}</span>`;
    putHTML('#msHex', s);
    const mode = t('ch7.mode.' + k.mode);
    putHTML('#msSay', t(real ? 'ch7.say.real' : 'ch7.say.own', { a: hex32(a), d: hex32(d).slice(4), dest: fmt(k.dest, 0), vec: '0x' + k.vector.toString(16).toUpperCase(), mode, rh: k.rh, dm: k.dm }));
  }
  reg([], { draw() {}, text });
  sD.addEventListener('input', text); sV.addEventListener('input', text); onAll(radios('msPre'), 'change', text);
  text();
})();

/* ───────── 08 channel loss against the budget ───────── */
(() => {
  const cv = $('#lsCv'), sL = $('#lsL');
  const o = () => ({ g: +radioVal('lsG'), m: radioVal('lsM'), len: +sL.value, k: +radioVal('lsK') });
  const MCOL = { fr4: C.red, mid: C.gold, low: C.green };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = o(), G = M.LOSS.GEN[p.g], fx = M.LOSS.fixed(p.g), maxL = 30, maxY = 110;
      const f = frame(w, h, [26, 14, 38, 46], 0, maxL, 0, maxY);
      yTicks(c, f, [0, 25, 50, 75, 100], v => fmt(v, 0)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y', { f: fmt(G.f, 0) }));
      c.fillStyle = C.mute; spacedTicks(c, [0, 5, 10, 15, 20, 25, 30].map(x => [f.X(x), fmt(x, 0)]), f.B + 12, w);
      // allowed total loss for this many retimers: each of the k+1 channels may use the budget
      const allow = (p.k + 1) * G.budget;
      hline(c, f, f.Y(Math.min(allow, maxY)), C.cyan);
      for (const m of ['fr4', 'mid', 'low']) {
        const pts = []; for (let x = 0; x <= maxL + 1e-9; x += 0.5) pts.push([x, Math.min(maxY, (p.k + 1) * fx + x * M.LOSS.alpha(m, G.f))]);
        path(c, pts, f.X, f.Y, MCOL[m], m === p.m ? 2.8 : 1.4, m === p.m ? null : [4, 4]);
      }
      const tot = (p.k + 1) * fx + p.len * M.LOSS.alpha(p.m, G.f);
      dot(c, f.X(p.len), f.Y(Math.min(maxY, tot)), MCOL[p.m], 5);
      c.fillStyle = C.cyan; c.textAlign = 'right'; c.fillText(t('ch8.cv.bud', { v: fmt(allow, 0) }), f.R, f.Y(Math.min(allow, maxY)) - 10);
    }
  });
  function text() {
    const p = o(), z = M.say.loss(p.g, p.m, p.len, p.k), v = z.v;
    put('#lsLo', inch(p.len));
    put('#lsA', t('u.dBin', { v: fmt(v.a, 2) })); put('#lsT', db(v.each)); put('#lsMg', db(v.margin)); put('#lsR', inch(v.reach));
    putHTML('#lsSay', t(z.key, { each: db(v.each), bud: db(v.budget, 0), m: db(Math.abs(v.margin)), reach: inch(v.reach), seg: inch(v.seg), f: fmt(v.f, 0), k: fmt(p.k, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sL.addEventListener('input', go); ['lsG', 'lsM', 'lsK'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 09 NRZ and PAM4 eyes under noise ───────── */
(() => {
  const cv = $('#eyCv'), sS = $('#eyS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), dbv = +sS.value, sigma = 1 / M.EYE.snr(dbv), narrow = w < 560;
      const panels = narrow ? [[0, 0, w, h / 2, 2, 'nrz', C.cyan], [0, h / 2, w, h / 2, 4, 'pam', C.gold]] : [[0, 0, w / 2, h, 2, 'nrz', C.cyan], [w / 2, 0, w / 2, h, 4, 'pam', C.gold]];
      for (const [x0, y0, pw, ph, M4, k, col] of panels) {
        const top = y0 + 30, bot = y0 + ph - 16, L = x0 + 14, R = x0 + pw - 14, Y = v => bot - (bot - top) * (v + 0.5);   // swing −0.5…+0.5
        c.fillStyle = col; c.textAlign = 'left'; c.fillText(t('ch9.cv.' + k), L, y0 + 14);
        const r = rng(k === 'nrz' ? 7 : 11), lev = i => -0.5 + i / (M4 - 1);
        c.strokeStyle = col; c.globalAlpha = 0.22; c.lineWidth = 1;
        let prev = Math.floor(r() * M4);
        for (let n = 0; n < 160; n++) {
          const next = Math.floor(r() * M4), a = lev(prev) + sigma * gauss(r), b = lev(next) + sigma * gauss(r);
          c.beginPath();
          for (let i = 0; i <= 24; i++) { const u = i / 24, s = (1 - Math.cos(Math.PI * u)) / 2; c[i ? 'lineTo' : 'moveTo'](L + (R - L) * u, Y(a + (b - a) * s)); }
          c.stroke(); prev = next;
        }
        c.globalAlpha = 1;
      }
    }
  });
  function text() {
    const dbv = +sS.value, z = M.say.eye(dbv), v = z.v;
    put('#eySo', db(dbv)); put('#eyN', sci(v.n)); put('#eyP', sci(v.p));
    put('#eyNn', db(M.EYE.need('nrz', 1e-12))); put('#eyNp', db(M.EYE.need('pam4', 1e-6)));
    putHTML('#eySay', t(z.key, { snr: db(dbv), n: sci(v.n), p: sci(v.p) }));
  }
  sim.text = text;
  sS.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 10a FEC, retry and goodput at 64 GT/s ───────── */
(() => {
  const cv = $('#feCv'), sB = $('#feB'), cF = $('#feF');
  const o = () => ({ ber: Math.pow(10, +sB.value), fec: cF.checked, mode: radioVal('feM'), rtt: 1000 });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = o(), f = frame(w, h, [26, 14, 38, 46], -9, -4, 0, 1);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100, 0)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
      c.fillStyle = C.mute; logTicks(c, f, -9, -4, f.B + 12, w);
      vline(c, f, f.X(-6), C.cyan, [3, 4]);
      const set = [[{ fec: false, mode: 'gbn' }, C.red], [{ fec: false, mode: 'sr' }, C.violet], [{ fec: true, mode: p.mode }, C.green]];
      for (const [q, col] of set) {
        const on = q.fec === p.fec && (q.fec || q.mode === p.mode), pts = [];
        for (let e = -9; e <= -4.001; e += 0.04) pts.push([e, M.FEC.goodput(Object.assign({ rtt: 1000, ber: Math.pow(10, e) }, q)).U]);
        path(c, pts, f.X, f.Y, col, on ? 2.8 : 1.4, on ? null : [4, 4]);
      }
      const cur = M.FEC.goodput(p); dot(c, f.X(+sB.value), f.Y(cur.U), p.fec ? C.green : p.mode === 'sr' ? C.violet : C.red, 5);
      c.fillStyle = C.cyan; c.textAlign = 'left'; c.fillText(t('ch10.cv.fber'), f.X(-6) + 6, f.B - 14);
    }
  });
  function text() {
    const p = o(), z = M.say.fec(p), v = z.v;
    put('#feBo', sci(p.ber)); put('#feP', sci(v.p)); put('#feU', upct(v.U)); put('#feX', gbps(v.X, 1)); put('#feT', ns(v.tau, 0));
    putHTML('#feSay', t(z.key, { p: sci(v.p), u: upct(v.U), X: gbps(v.X, 1), ratio: fmt(v.ratio, 0), mode: t(p.mode === 'sr' ? 'ch10.mode.sr' : 'ch5.mode.gbn') }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sB.addEventListener('input', go); cF.addEventListener('change', go); onAll(radios('feM'), 'change', go);
  text();
})();

/* ───────── 10b FLIT against 128b/130b: latency and bandwidth by TLP size (Das Sharma 2022, slide 13) ───────── */
(() => {
  const cv = $('#flCv'), sD = $('#flD');
  const dw = () => Math.pow(2, +sD.value), lanes = () => +radioVal('flW');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), Ln = lanes(), maxY = M.FEC.lat130(1024, Ln) * 1.08, f = frame(w, h, [26, 14, 38, 50], 0, 10, 0, maxY);
      const step = maxY > 600 ? 250 : maxY > 60 ? 20 : 10, ys = []; for (let v = 0; v <= maxY; v += step) ys.push(v);
      yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch10.cv2.x'), t('ch10.cv2.y'));
      c.fillStyle = C.mute; spacedTicks(c, [0, 2, 4, 6, 8, 10].map(e => [f.X(e), fmt(Math.pow(2, e), 0)]), f.B + 12, w);
      const pa = [], pb = []; for (let e = 0; e <= 10.001; e += 0.05) { const d = Math.pow(2, e); pa.push([e, M.FEC.lat130(d, Ln)]); pb.push([e, M.FEC.latFlit(d, Ln)]); }
      path(c, pa, f.X, f.Y, C.cyan, 2.2); path(c, pb, f.X, f.Y, C.gold, 2.6);
      dot(c, f.X(+sD.value), f.Y(M.FEC.lat130(dw(), Ln)), C.cyan, 4.5); dot(c, f.X(+sD.value), f.Y(M.FEC.latFlit(dw(), Ln)), C.gold, 5);
    }
  });
  function text() {
    const d = dw(), Ln = lanes(), z = M.say.flit(d, Ln), v = z.v;
    put('#flDo', t('ch10.dwfmt', { v: fmt(d, 0), b: fmt(d * 4, 0) }));
    put('#flA', ns(v.a)); put('#flB', ns(v.b)); put('#flS', t('u.x', { v: fmt(v.s, 2) }));
    putHTML('#flSay', t(z.key, { a: ns(v.a), b: ns(v.b), d: ns(Math.abs(v.a - v.b)), s: fmt(v.s, 2), dw: fmt(d, 0), w: fmt(Ln, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sD.addEventListener('input', go); onAll(radios('flW'), 'change', go);
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
// diagrams need layout widths; redo once fonts and layout settle
requestAnimationFrame(() => renderDiagrams(true));
window.__essayReady = true;
})();
