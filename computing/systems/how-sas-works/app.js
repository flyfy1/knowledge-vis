/* How SAS works: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SasModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '12px ui-monospace,Menlo,Consolas,monospace';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   copy.en.js may be a same-keys stub copied from zh while the translation is pending; it then sets
   window.ESSAY_COPY.enStub = true and the page treats English as absent (falls back to zh). */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
const SEP = () => (effLang() === 'zh' ? '' : ' ');
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
// a duration in seconds as text with its unit
function dur(sec, d) { const u = M.tunit(sec); return t('u.' + u.u, { v: fmt(u.v, d == null ? (Math.abs(u.v) >= 100 ? 0 : Math.abs(u.v) >= 10 ? 1 : 2) : d) }); }
// numbers quoted in the prose, computed from the models and formatted for the current language
let PROSE = null; // computed once (the CRC and FEC enumerations take a few tens of milliseconds)
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : kind === 'sci' ? M.sciText(v, effLang()) : fmt(v, d); return o; }
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
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
const clamp = M.clamp;
function spacedTicks(c, items, y) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x, s] of items) { const w = c.measureText(s).width; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align, font) { c.font = font || FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); c.font = FONT; return [x0 - 3, x0 + w + 3]; }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function labelFont(c, labels, cap) { c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap) }; }
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = e => '10' + String(e).split('').map(ch => SUP[ch]).join('');
const sci = x => M.sciText(x, effLang());
// bytes in decimal units; the unit names come from copy
function bytesText(x) { const u = t('u.bytesUnits').split('|'); let i = 0; while (x >= 1000 && i < u.length - 1) { x /= 1000; i++; } return fmt(x, x >= 100 ? 0 : x >= 10 ? 1 : 2) + ' ' + u[i]; }
const hex2 = v => v.toString(16).toUpperCase().padStart(2, '0');
const hex4 = v => '0x' + v.toString(16).toUpperCase().padStart(4, '0');
const hex8 = v => '0x' + v.toString(16).toUpperCase().padStart(8, '0');
const waitText = us => us < 0.005 ? t('u.us', { v: fmt(0, 0) }) : dur(us * 1e-6);
const enable = (els, on) => els.forEach(e => { e.disabled = !on; const l = e.closest('label'); if (l) l.style.opacity = on ? '' : '0.45'; });

/* ───────── 02 the CDB ───────── */
(() => {
  const cv = $('#cdCv'), sX = $('#cdX'), D = M.CDB;
  const OPS = ['r6', 'r10', 'r16'];
  const off = () => Math.pow(10, 6 + +sX.value / 10);
  const op = () => radioVal('cdOp'), bs = () => +radioVal('cdBs'), attr = () => radioVal('cdA');
  const LO = 6, HI = 22;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), labs = OPS.map(o => t('ch2.op.' + o));
      const lf = labelFont(c, labs, Math.min(110, w * 0.3));
      const L = lf.w, R = w - 14, T = 10, B = h - 36, rh = (B - T) / 3;
      const X = b => L + (R - L) * (Math.log10(b) - LO) / (HI - LO);
      const ticks = t('ch2.ticks').split('|'), items = [];
      ticks.forEach((s, i) => { const x = X(Math.pow(10, 6 + 3 * i)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); items.push([x, s]); });
      c.fillStyle = C.mute; spacedTicks(c, items, B + 11);
      c.textAlign = 'right'; c.fillText(t('ch2.cv.x'), R, B + 27);
      OPS.forEach((o, i) => {
        const y = T + i * rh, bh = rh * 0.5, sel = o === op();
        c.font = lf.font; c.textAlign = 'right'; c.fillStyle = sel ? C.gold : C.ink; c.fillText(labs[i], L - 8, y + rh / 2); c.font = FONT;
        c.fillStyle = sel ? C.cyan : C.dimfill; c.fillRect(L, y + (rh - bh) / 2, Math.max(1, Math.min(R, X(D.reach(o, bs()))) - L), bh);
      });
      const x = X(off()); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x, T - 2); c.lineTo(x, B); c.stroke(); c.lineWidth = 1;
    }
  });
  function bytesRow(arr, mark) { return arr.map((v, i) => { const k = mark(i); const s = hex2(v); return k ? `<span class="${k}">${s}</span>` : s; }).reduce((a, s, i) => a + (i && i % 16 === 0 ? '\n' : i && i % 4 === 0 ? '  ' : i ? ' ' : '') + s, ''); }
  function text() {
    const o = op(), b = bs(), x = off(), lba = Math.floor(x / b), n = b === 512 ? 8 : 1, a = attr();
    const r = D.build(o, lba, n), need = D.smallest(x, b);
    put('#cdXo', bytesText(x));
    put('#cdLba', fmt(lba, 0)); put('#cdReach', bytesText(D.reach(o, b))); put('#cdNeed', need ? t('ch2.op.' + need) : t('ch2.none'));
    put('#cdLen', t('u.bytes', { v: fmt(SPEC().cdb[o].len, 0) }));
    const inR = (i, f) => i >= f[0] && i <= f[1];
    const mk = (base) => i => { const j = i - base; if (j < 0 || j >= r.bytes.length) return ''; if (j === 0) return 'm'; if (inR(j, r.lbaField)) return 'g'; if (inR(j, r.lenField)) return 'c'; return ''; };
    let html;
    if (!r.fits) html = t('ch2.hex.bad', { op: t('ch2.op.' + o) });
    else {
      const ssp = D.sspIU(r.bytes, a), isc = D.iscsi(r.bytes, a, n * b);
      const sspMark = i => i === 9 ? 'r' : mk(12)(i), iscMark = i => i === 1 ? 'r' : mk(32)(i);
      html = `<span class="hexlab">${t('ch2.hex.cdb')}</span>${bytesRow(r.bytes, mk(0))}\n<span class="hexlab">${t('ch2.hex.ssp')}</span>${bytesRow(ssp, sspMark)}\n<span class="hexlab">${t('ch2.hex.iscsi')}</span>${bytesRow(isc, iscMark)}`;
    }
    putHTML('#cdHex', html);
    const s = M.say.cdb(o, x, b);
    putHTML('#cdSay', t(s.key, { op: t('ch2.op.' + o), need: s.v.need ? t('ch2.op.' + s.v.need) : t('ch2.none'), reach: bytesText(s.v.reach), bs: fmt(b, 0), lba: fmt(lba, 0), len: fmt(SPEC().cdb[o].len, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sX.addEventListener('input', go); ['cdOp', 'cdBs', 'cdA'].forEach(n => onAll(radios(n), 'change', go));
  text();
})();
function SPEC() { return M.SPEC; }

/* ───────── 03 one SSP read ───────── */
(() => {
  const cv = $('#spCv'), chk = $('#spP');
  const n = () => +radioVal('spN'), g = () => radioVal('spG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.SSP.read(n(), g(), null, chk.checked), lane = r.lane, f = r.f, oc = chk.checked ? 0 : M.SSP.ocUs;
      const L = 12, R = w - 12, gapW = (R - L) * 0.12, bh = Math.min(40, h - 80), T = Math.max(30, (h - bh) / 2 - 8);
      const segs = [['oc', oc], ['cmd', f.cmd / lane], ['oc', oc], ['gap', null], ['oc', oc], ['data', f.data / lane], ['resp', f.resp / lane], ['oc', oc]].filter(s => s[1] !== 0);
      const tot = segs.reduce((a, s) => a + (s[1] || 0), 0), k = (R - L - gapW) / tot;
      let x = L; const placed = [];
      const col = { oc: C.gold, cmd: C.cyan, data: C.cyan, resp: C.cyan };
      for (const [id, v] of segs) {
        const sw = id === 'gap' ? gapW : Math.max(1.5, v * k);
        if (id === 'gap') { c.strokeStyle = C.line; c.setLineDash([4, 4]); c.strokeRect(x + 2, T, sw - 4, bh); c.setLineDash([]); }
        else { c.fillStyle = col[id]; c.globalAlpha = id === 'data' ? 0.85 : 1; c.fillRect(x, T, sw - (id === 'oc' ? 0 : 1), bh); c.globalAlpha = 1; }
        if (id !== 'oc') placed.push([x + sw / 2, t('ch3.cv.' + id), sw]);
        x += sw;
      }
      // labels under the bar, skipping any that would collide
      c.font = FONT; let lastR = -Infinity; const y = T + bh + 16;
      for (const [cx, s] of placed) { const tw = c.measureText(s).width; let x0 = Math.min(Math.max(cx - tw / 2, L), R - tw); if (x0 < lastR + 6) continue; c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(s, x0, y); lastR = x0 + tw; }
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0', L, T - 12); c.textAlign = 'right'; c.fillText(dur(r.us * 1e-6), R, T - 12);
    }
  });
  function text() {
    const r = M.SSP.read(n(), g(), null, chk.checked);
    put('#spUs', dur(r.us * 1e-6)); put('#spEff', pct(r.eff)); put('#spIops', t('u.iops', { v: fmt(Math.round(r.iops / 100) * 100, 0) })); put('#spWire', t('u.bytes', { v: fmt(r.f.total, 0) }));
    const s = M.say.ssp(n(), g(), chk.checked), v = s.v;
    putHTML('#spSay', t(s.key, { eff: pct(v.eff), us: dur(v.us * 1e-6), ov: dur(v.ov * 1e-6), iops: fmt(Math.round(v.iops / 100) * 100, 0), MBps: t('u.MBps', { v: fmt(v.MBps, 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll(radios('spN'), 'change', go); onAll(radios('spG'), 'change', go); chk.addEventListener('change', go);
  text();
})();

/* ───────── 04 availability ───────── */
(() => {
  const cv = $('#avCv'), sM = $('#avM'), sR = $('#avR'), sF = $('#avF'), A = M.AVAIL;
  const PARTS = ['paths', 'drive', 'inter', 'failover'];
  const P = () => ({ ctrlMtbf: Math.pow(10, +sM.value / 10), mttr: +sR.value, failoverS: +sF.value });
  const d = () => radioVal('avD'), p = () => +radioVal('avP');
  const LO = -4, HI = 3;   // log10 minutes per year
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = A.run(d(), p(), P()), labs = PARTS.map(k => t('ch4.part.' + k));
      const lf = labelFont(c, labs, Math.min(120, w * 0.3));
      const L = lf.w, R = w - 16, T = 12, B = h - 38, rh = (B - T) / PARTS.length;
      const X = v => L + (R - L) * (clamp(Math.log10(v), LO, HI) - LO) / (HI - LO);
      const items = [];
      for (let e = LO; e <= HI; e++) { const x = X(Math.pow(10, e)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); items.push([x, pow10(e)]); }
      c.fillStyle = C.mute; spacedTicks(c, items, B + 11); c.textAlign = 'right'; c.fillText(t('ch4.cv.x'), R, B + 27);
      PARTS.forEach((k, i) => {
        const y = T + i * rh, bh = rh * 0.5, v = r.parts[k], top = k === r.top;
        c.font = lf.font; c.textAlign = 'right'; c.fillStyle = top ? C.gold : C.ink; c.fillText(labs[i], L - 8, y + rh / 2); c.font = FONT;
        if (v > 0) { c.fillStyle = top ? C.red : C.dimfill; c.fillRect(L, y + (rh - bh) / 2, Math.max(2, X(v) - L), bh); }
        const s = v > 0 ? dur(v * 60) : t('ch4.cv.zero'); c.font = FONT; const tw = c.measureText(s).width;
        const xe = v > 0 ? X(v) : L; let x0 = xe + 6; if (x0 + tw > R) x0 = xe - tw - 6;
        if (x0 < L + 2) x0 = L + 2;
        tag(c, s, x0, y + rh / 2, x0 < xe ? C.ink : C.mute, 'left');
      });
    }
  });
  function text() {
    const pp = P(), r = A.run(d(), p(), pp);
    put('#avMo', t('u.hours', { v: fmt(pp.ctrlMtbf, 0) })); put('#avRo', t('u.hours', { v: fmt(pp.mttr, 0) })); put('#avFo', t('u.sec', { v: fmt(pp.failoverS, 0) }));
    put('#avTot', t('u.minyr', { v: fmt(r.total, r.total >= 10 ? 0 : 1) })); put('#avNines', t('ch4.unit.n', { v: fmt(r.nines, 1) }));
    put('#avTop', t('ch4.part.' + r.top)); put('#avUse', t('ch4.unit.p', { v: r.usable }));
    const s = M.say.avail(d(), p(), pp), v = s.v;
    putHTML('#avSay', t(s.key, { total: dur(v.total * 60), nines: fmt(v.nines, 1), top: t('ch4.part.' + v.top) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sM, sR, sF].forEach(e => e.addEventListener('input', go)); onAll(radios('avD'), 'change', go); onAll(radios('avP'), 'change', go);
  text();
})();

/* ───────── 05 fan-out ───────── */
(() => {
  const cv = $('#fnCv'), sN = $('#fnN'), F = M.FAN;
  const k = () => radioVal('fnK'), wk = () => radioVal('fnW'), l = () => +radioVal('fnL'), g = () => radioVal('fnG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), pts = [];
      let top = 0, cap = 0;
      for (let N = 1; N <= 120; N++) { const r = F.run(N, k(), wk(), l(), g()); pts.push([N, r.doneMB]); top = Math.max(top, r.demandMB); cap = r.capMB; }
      const ymax = Math.max(cap * 1.25, Math.min(top, cap * 1.6)) || 1;
      const nice = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };
      const Y1 = nice(ymax), step = Y1 / 4;
      const f = frame(w, h, [30, 16, 38, 58], 0, 120, 0, Y1);
      yTicks(c, f, [0, step, 2 * step, 3 * step, 4 * step], v => fmt(v, 0)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      c.fillStyle = C.mute; spacedTicks(c, [0, 24, 48, 72, 96, 120].map(v => [f.X(v), fmt(v, 0)]), f.B + 11);
      c.strokeStyle = C.gold; c.setLineDash([5, 4]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(f.L, f.Y(cap)); c.lineTo(f.R, f.Y(cap)); c.stroke(); c.setLineDash([]);
      path(c, pts, f.X, f.Y, C.cyan);
      const N = +sN.value, r = F.run(N, k(), wk(), l(), g());
      dot(c, f.X(N), f.Y(r.doneMB), C.gold, 5);
      const lab = t('ch5.cv.cap'); c.font = FONT; const tw = c.measureText(lab).width;
      const capY = f.Y(cap), yl = capY - 12 < f.T + 4 ? capY + 12 : capY - 12;
      tag(c, lab, f.R - tw, yl, C.gold, 'left');
    }
  });
  function text() {
    const N = +sN.value, r = F.run(N, k(), wk(), l(), g());
    put('#fnNo', t('ch5.unit.n', { v: N }));
    put('#fnDone', t('u.MBps', { v: fmt(r.doneMB, 0) })); put('#fnCap', t('u.MBps', { v: fmt(r.capMB, 0) }));
    put('#fnRho', r.saturated ? pct(1) : pct(r.rho, r.rho < 0.1 ? 1 : 0)); put('#fnWait', isFinite(r.waitUs) ? dur(r.waitUs * 1e-6) : '∞');
    const s = M.say.fan(N, k(), wk(), l(), g()), v = s.v;
    putHTML('#fnSay', t(s.key, { done: t('u.MBps', { v: fmt(v.done, 0) }), demand: t('u.MBps', { v: fmt(v.demand, 0) }), cap: t('u.MBps', { v: fmt(v.cap, 0) }), rho: pct(v.rho, v.rho < 0.1 ? 1 : 0), wait: isFinite(v.wait) ? dur(v.wait * 1e-6) : '∞', satN: fmt(Math.floor(v.satN), 0), over: fmt(v.over, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); ['fnK', 'fnW', 'fnL', 'fnG'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 06 wide port ───────── */
(() => {
  const cv = $('#wdCv'), sK = $('#wdK'), btn = $('#wdPlay'), W = M.WIDE, LANES = 4;
  const PAL = [C.cyan, C.gold, C.green, C.violet, C.red, '#e98fd0', '#9fd36b', '#f0a35e'];
  const K = () => +sK.value, ty = () => radioVal('wdT'), sz = () => +radioVal('wdS'), g = () => radioVal('wdG');
  let S = null, meas = null, playing = !reduce, span = 0;
  function reset() {
    S = W.make(K(), ty(), sz(), LANES, g(), false);
    W.step(S, 3000);
    span = Math.max(40, Math.min(4000, S.hold * 24));
    if (reduce) W.step(S, span);
    meas = W.measure(K(), ty(), sz(), LANES, g(), false);
  }
  function draw() {
    const { c, w, h } = fit(cv), labs = []; for (let i = 0; i < LANES; i++) labs.push(t('ch6.cv.lane', { n: i + 1 }));
    const lf = labelFont(c, labs, Math.min(70, w * 0.2));
    const L = lf.w, R = w - 10, T = 8, B = h - 26, rh = (B - T) / LANES, t1 = S.t, t0 = t1 - span;
    const X = tt => L + (R - L) * (tt - t0) / span;
    S.lanes.forEach((ln, i) => {
      const y = T + i * rh;
      c.font = lf.font; c.textAlign = 'right'; c.fillStyle = C.ink; c.fillText(labs[i], L - 8, y + rh / 2); c.font = FONT;
      c.fillStyle = '#151a24'; c.fillRect(L, y + 3, R - L, rh - 6);
      const blocks = ln.log.slice(); if (ln.who >= 0) blocks.push([ln.from, Math.min(ln.until, t1), ln.who]);
      for (const [a, b, who] of blocks) { if (b < t0) continue; const xa = Math.max(L, X(a)), xb = Math.min(R, X(b)); if (xb <= xa) continue; c.fillStyle = PAL[who % PAL.length]; c.fillRect(xa, y + 5, Math.max(1, xb - xa - 1), rh - 10); }
    });
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch6.cv.t'), R, B + 14);
  }
  const sim = reg(cv, {
    draw,
    step(dt) { if (playing && !reduce) { W.step(S, dt * span / 4); draw(); } else if (this.dirty) { draw(); this.dirty = false; } }
  });
  function text() {
    put('#wdKo', t('ch5.unit.n', { v: K() }));
    put('#wdMB', t('u.MBps', { v: fmt(meas.MBps, 0) })); put('#wdPer', t('u.MBps', { v: fmt(meas.perDrive, 0) }));
    put('#wdUtil', pct(meas.util)); put('#wdWait', waitText(meas.waitUs));
    const s = M.say.wide(meas, K(), LANES), v = s.v;
    putHTML('#wdSay', t(s.key, { k: v.k, MBps: t('u.MBps', { v: fmt(v.MBps, 0) }), per: t('u.MBps', { v: fmt(v.per, 0) }), util: pct(v.util), wait: waitText(v.wait) }));
    btn.textContent = t(playing ? 'ch6.btn.pause' : 'ch6.btn.play'); btn.setAttribute('aria-pressed', String(!playing));
  }
  sim.text = text;
  const go = () => { reset(); sim.dirty = true; text(); };
  sK.addEventListener('input', go); ['wdT', 'wdS', 'wdG'].forEach(nm => onAll(radios(nm), 'change', go));
  btn.addEventListener('click', () => { playing = !playing; sim.dirty = true; text(); });
  if (reduce) { btn.disabled = true; btn.hidden = true; }
  reset(); text();
})();

/* ───────── 08 T10 PI ───────── */
(() => {
  const cv = $('#piCv'), chk = $('#piOn'), sB = $('#piB'), P = M.PI, LBA = 123456;
  const TRI = P.firstMissedTriple(4096);
  const data = P.block(LBA);
  const fault = () => radioVal('piF');
  const bits = () => { const m = radioVal('piN'), b = +sB.value; if (m === 'tri') return TRI; const o = [b]; if (m !== '1') o.push((b + 1000) % 4096); if (m === '3') o.push((b + 2001) % 4096); return o; };
  const flips = () => (fault() === 'link' || fault() === 'mem') ? bits() : [];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = 64, cell = Math.floor(Math.min(w - 8, h - 8) / n), x0 = Math.floor((w - cell * n) / 2), y0 = Math.floor((h - cell * n) / 2);
      const bad = new Set(flips());
      for (let i = 0; i < 4096; i++) {
        const on = (data[i >> 3] >> (7 - (i & 7))) & 1, x = x0 + (i % n) * cell, y = y0 + Math.floor(i / n) * cell;
        if (bad.has(i)) { c.fillStyle = C.red; c.fillRect(x - 1, y - 1, cell + 1, cell + 1); c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.arc(x + cell / 2, y + cell / 2, cell * 2.2, 0, 6.283); c.stroke(); c.lineWidth = 1; }
        else if (on) { c.fillStyle = '#3d4a63'; c.fillRect(x, y, cell - 1, cell - 1); }
      }
      c.strokeStyle = C.line; c.strokeRect(x0 - 0.5, y0 - 0.5, cell * n + 1, cell * n + 1);
    }
  });
  function text() {
    const f = fault(), on = chk.checked, r = P.run(f, flips(), LBA, on);
    enable([sB, ...radios('piN')], f === 'link' || f === 'mem');
    if (radioVal('piN') === 'tri') sB.disabled = true;
    put('#piBo', t('u.bit', { v: sB.value }));
    putHTML('#piChips', ['link', 'ecc', 'guard', 'ref'].map(k => `<div class="${r.ck[k]}"><b>${t('ch8.st.' + r.ck[k])}</b>${t('ch8.ck.' + k)}</div>`).join(''));
    put('#piGuard', on ? hex4(r.want.guard) : t('ch8.st.off')); put('#piSeen', hex4(r.guardSeen)); put('#piRef', on ? hex8(r.want.ref) : t('ch8.st.off'));
    put('#piOut', t('ch8.out.' + r.outcome));
    const s = M.say.pi(r, f, on);
    putHTML('#piSay', t(s.key, { guard: hex4(s.v.guard), seen: hex4(s.v.seen) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sB.addEventListener('input', go); chk.addEventListener('change', go); onAll(radios('piF'), 'change', go); onAll(radios('piN'), 'change', go);
  let gb = null;
  const gbText = () => { if (gb) put('#piGbOut', t('ch8.garbage', { n: fmt(gb.trials, 0), miss: fmt(gb.miss, 0) })); };
  $('#piGb').addEventListener('click', () => { gb = P.garbage(65536); gbText(); });
  const old = sim.text; sim.text = () => { old(); gbText(); };
  text();
})();

/* ───────── 09 FEC ───────── */
(() => {
  const cv = $('#fcCv'), sE = $('#fcE'), sB = $('#fcB'), F = M.FEC;
  const ber = () => Math.pow(10, +sE.value), b = () => +sB.value, k = () => +radioVal('fcI');
  const XL = -9, XH = -4, YL = -24, YH = 0;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [24, 16, 38, 48], XL, XH, YL, YH);
      const ly = v => clamp(Math.log10(Math.max(v, 1e-300)), YL, YH);
      yTicks(c, f, [-24, -18, -12, -6, 0], v => pow10(v)); axes(c, f, t('ch9.cv.x'), '');
      c.fillStyle = C.mute; spacedTicks(c, [-9, -8, -7, -6, -5, -4].map(v => [f.X(v), pow10(v)]), f.B + 11);
      const pts = [], np = [];
      for (let e = XL; e <= XH + 1e-9; e += 0.1) { const r = F.run(Math.pow(10, e), b(), k()); pts.push([e, ly(r.pCw)]); np.push([e, ly(r.noFec)]); }
      path(c, np, f.X, f.Y, C.mute, 1.5, [5, 4]);
      path(c, pts, f.X, f.Y, C.cyan);
      const r = F.run(ber(), b(), k()); dot(c, f.X(+sE.value), f.Y(ly(r.pCw)), C.gold, 5);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch9.cv.y'), f.L + 6, f.T - 12);
    }
  });
  function text() {
    const r = F.run(ber(), b(), k());
    put('#fcEo', sci(ber())); put('#fcBo', t('ch9.unit.b', { v: b() }));
    put('#fcP', sci(r.pCw)); put('#fcEvery', dur(r.everyS)); put('#fcOk', pct(r.singleOk)); put('#fcNo', dur(r.noFecEveryS));
    const s = M.say.fec(ber(), b(), k()), v = s.v;
    putHTML('#fcSay', t(s.key, { every: dur(v.every), ok: pct(v.ok), nofec: dur(v.nofec), p: sci(v.p) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sE.addEventListener('input', go); sB.addEventListener('input', go); onAll(radios('fcI'), 'change', go);
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
