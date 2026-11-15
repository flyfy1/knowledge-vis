/* How a computer is wired: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.WiredModels;
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
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  drawDiagrams();
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── static diagrams (STANDARD §4a) ─────────
   Each diagram is a list of panels 340 units wide. At a container of 600 px or more, panels sit two to a row in a
   720-unit viewBox; below that they stack in a 340-unit viewBox. Labels come from copy; a label wider than its box
   wraps to two lines and then shrinks, never below the size that renders at 11 px. */
const NS = 'http://www.w3.org/2000/svg';
const PW = 340, FS = 13.5;
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function fitText(node, s, maxW, minFs) {
  node.textContent = s;
  if (!maxW || node.getComputedTextLength() <= maxW) return;
  const x = node.getAttribute('x'), y = +node.getAttribute('y'), fs = +node.getAttribute('font-size');
  const cut = (() => {   // break at the space nearest the middle; CJK text breaks at the middle character
    const mid = s.length / 2; let best = -1;
    for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return best > 0 ? [s.slice(0, best), s.slice(best + 1)] : [s.slice(0, Math.ceil(mid)), s.slice(Math.ceil(mid))];
  })();
  node.textContent = '';
  const lh = fs * 1.18;
  cut.forEach((part, i) => { const sp = el('tspan', { x, dy: i ? lh : 0 }, node); sp.textContent = part; });
  node.setAttribute('y', y - lh / 2);
  let f = fs;
  while (node.getComputedTextLength() / 2 > maxW && f > minFs) {   // two tspans: length is the sum, approximately
    f = Math.max(minFs, f - 0.5); node.setAttribute('font-size', f);
    [...node.children].forEach((sp, i) => sp.setAttribute('dy', i ? f * 1.18 : 0));
    node.setAttribute('y', y - f * 1.18 / 2);
  }
  const w = Math.max(...[...node.children].map(sp => sp.getComputedTextLength()));
  if (w > maxW) { const k = Math.max(minFs / f, maxW / w); node.setAttribute('font-size', Math.max(minFs, f * k)); }
}
// panel drawing kit: shapes in panel coordinates; text items carry a copy key
function kit(g, PV, minFs) {
  const K = {
    g,
    box(x, y, w, h, cls, key, sub, subKey) {
      el('rect', { x, y, width: w, height: h, rx: 7, class: cls || 'b' }, g);
      if (key) K.text(x + w / 2, y + h / 2 + (subKey ? -5 : 4.5), key, { maxW: w - 8, cls: sub && sub.cls });
      if (subKey) K.text(x + w / 2, y + h / 2 + 15, subKey, { maxW: w - 8, cls: 't-mute', fs: 13.2 });
    },
    line(d, cls) { el('path', { d, class: cls || 'l' }, g); },
    text(x, y, key, o = {}) {
      const n = el('text', { x, y, 'text-anchor': o.anchor || 'middle', 'font-size': o.fs || FS, class: 'dl ' + (o.cls || '') }, g);
      fitText(n, o.raw != null ? o.raw : t(key, Object.assign({}, PV, o.vars || {})), o.maxW, Math.min(minFs, o.fs || FS));
      return n;
    }
  };
  return K;
}
const PANELS = {};
function drawDiagrams() {
  const PV = proseVars();
  for (const [id, spec] of Object.entries(PANELS)) {
    const fig = document.getElementById(id); if (!fig) continue;
    const box = fig.querySelector('.svgbox'), cw = box.clientWidth || 320, wide = cw >= 660;
    const panels = spec.panels, perRow = wide ? Math.min(2, panels.length) : 1, W = perRow === 2 ? 720 : PW;
    const rows = []; for (let i = 0; i < panels.length; i += perRow) rows.push(panels.slice(i, i + perRow));
    const H = rows.reduce((s, r) => s + Math.max(...r.map(p => p.h)) + 10, -10);
    box.textContent = '';
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': t(spec.aria), class: perRow === 1 ? 'one' : '' }, box);
    const scale = Math.min(perRow === 1 ? 460 : cw, cw) / W, minFs = Math.max(11.2 / scale, 9);
    let y0 = 0;
    rows.forEach(r => {
      r.forEach((p, i) => { const g = el('g', { transform: `translate(${i * 380},${y0})` }, svg); p.draw(kit(g, PV, Math.min(minFs, FS))); });
      y0 += Math.max(...r.map(p => p.h)) + 10;
    });
  }
}
let lastW = 0;
window.addEventListener('resize', () => { const w = document.documentElement.clientWidth; if (Math.abs(w - lastW) > 4) { lastW = w; drawDiagrams(); } });

// 01 shared bus vs point-to-point
const DEVX = [20, 100, 180, 260];
function devices(K, y) { ['dg1.d1', 'dg1.d2', 'dg1.d3', 'dg1.d4'].forEach((k, i) => K.box(DEVX[i], y, 64, 38, 'b-cyan', k)); }
PANELS.dg1 = { aria: 'dg1.aria', panels: [
  { h: 250, draw(K) {
    K.text(170, 22, 'dg1.a.title', { maxW: 320, cls: 't-mute' });
    K.box(105, 40, 130, 40, 'b-gold', 'dg1.host');
    K.line('M170 80 V112', 'l'); K.line('M18 112 H322', 'l-bus');
    DEVX.forEach(x => K.line(`M${x + 32} 112 V150`, 'l'));
    devices(K, 150);
    K.text(282, 102, 'dg1.bus', { maxW: 90, cls: 't-red', fs: 13.2 });
    K.text(170, 216, 'dg1.a.note', { maxW: 320, cls: 't-mute' });
  } },
  { h: 250, draw(K) {
    K.text(170, 22, 'dg1.b.title', { maxW: 320, cls: 't-mute' });
    K.box(105, 40, 130, 40, 'b-gold', 'dg1.root');
    DEVX.forEach((x, i) => K.line(`M${140 + i * 20} 80 C${140 + i * 20} 118 ${x + 32} 112 ${x + 32} 150`, 'l-cyan'));
    devices(K, 150);
    K.text(170, 216, 'dg1.b.note', { maxW: 320, cls: 't-mute' });
  } }] };

// 02 a loaded line and the reflected wave (bounce diagram values from the ch2 model defaults)
PANELS.dg2 = { aria: 'dg2.aria', panels: [
  { h: 230, draw(K) {
    K.text(170, 22, 'dg2.a.title', { maxW: 320, cls: 't-mute' });
    K.box(10, 72, 64, 40, 'b-gold', 'dg2.drv');
    K.line('M74 92 H326', 'l-bus');
    [110, 160, 210, 260, 310].forEach(x => { K.line(`M${x} 92 V128`, 'l'); el('rect', { x: x - 9, y: 128, width: 18, height: 14, rx: 3, class: 'b-cyan' }, K.g); });
    K.text(326, 62, 'dg2.a.end', { anchor: 'end', maxW: 230, cls: 't-red', fs: 13.2 });
    K.text(200, 172, 'dg2.a.load', { maxW: 260, cls: 't-mute' });
    K.text(170, 206, 'dg2.a.spec', { maxW: 320, cls: 't-mute', fs: 13.2 });
  } },
  { h: 244, draw(K) {
    K.text(170, 22, 'dg2.b.title', { maxW: 320, cls: 't-mute' });
    const tr = M.LINE.trips(M.LINE.defaultLoad()), v1 = tr.v1, v2 = tr.after1, X = t => 50 + t * 70, Y = v => 196 - v * 110;
    K.line(`M50 84 V196 H${X(3.9)}`, 'l');
    K.line(`M50 ${Y(0.5)} H${X(3.9)}`, 'l-dash');
    K.line(`M50 ${Y(0)} H${X(0.02)} V${Y(v1)} H${X(2)} V${Y(v2 + v1 * tr.g)} H${X(3.9)}`, 'l-cyan');
    K.line(`M50 ${Y(0) - 2} H${X(1)} V${Y(v2)} H${X(3.9)}`, 'l-gold');
    K.text(X(1), 212, '', { raw: 'τ', cls: 't-mute' }); K.text(X(2), 212, '', { raw: '2τ', cls: 't-mute' });
    K.text(X(3.9), Y(0.5) + 17, 'dg2.b.vih', { anchor: 'end', maxW: 100, cls: 't-mute', fs: 13.2 });
    K.text(56, 48, 'dg2.b.near', { anchor: 'start', maxW: 280, cls: 't-cyan', fs: 13.2 });
    K.text(56, 68, 'dg2.b.far', { anchor: 'start', maxW: 280, cls: 't-gold', fs: 13.2 });
    K.text(205, 232, 'dg2.b.x', { maxW: 270, cls: 't-mute', fs: 13.2 });
  } }] };

// 03 the 875P machine (Intel datasheet 252525-002, Figure 1)
PANELS.dg3 = { aria: 'dg3.aria', panels: [{ h: 440, draw(K) {
  K.box(95, 8, 150, 40, 'b-gold', 'dg3.cpu');
  K.line('M170 48 V96', 'l-thick'); K.text(180, 78, 'dg3.fsb', { anchor: 'start', maxW: 150, cls: 't-mute', fs: 13.2 });
  K.box(6, 102, 74, 34, 'b-violet', 'dg3.memA'); K.box(260, 102, 74, 34, 'b-violet', 'dg3.memB');
  K.line('M80 119 H95', 'l-violet'); K.line('M245 119 H260', 'l-violet');
  K.box(95, 96, 150, 52, 'b-green', 'dg3.mch', null, 'dg3.mch.sub');
  K.text(170, 172, 'dg3.mem', { maxW: 200, cls: 't-violet', fs: 13.2 });
  K.line('M95 142 H58 V196', 'l'); K.line('M245 142 H282 V196', 'l'); K.line('M170 148 V154 M170 186 V300', 'l');
  K.box(8, 196, 100, 40, 'b-cyan', 'dg3.gpu'); K.box(232, 196, 100, 40, 'b-cyan', 'dg3.gbe');
  K.text(58, 256, 'dg3.agp', { maxW: 112, cls: 't-mute', fs: 13.2 }); K.text(282, 256, 'dg3.csa', { maxW: 112, cls: 't-mute', fs: 13.2 });
  K.text(176, 284, 'dg3.hi', { anchor: 'start', maxW: 160, cls: 't-mute', fs: 13.2 });
  K.box(95, 300, 150, 46, 'b-green', 'dg3.ich', null, 'dg3.ich.sub');
  [44, 128, 212, 296].forEach(x => K.line(`M${Math.min(Math.max(x, 110), 230)} 346 L${x} 388`, 'l'));
  ['dg3.sata', 'dg3.usb', 'dg3.pci', 'dg3.bios'].forEach((k, i) => K.box(6 + i * 84, 388, 76, 40, 'b-cyan', k));
} }] };

// 04 two sockets, four dies each (EPYC 7001; latencies from ISSCC 2018)
PANELS.dg4 = { aria: 'dg4.aria', panels: [{ h: 330, draw(K) {
  K.text(170, 18, 'dg4.link', { maxW: 200, cls: 't-red', fs: 13.2 });
  [10, 180].forEach((x0, s) => {
    K.box(x0, 30, 150, 186, 'b-dim'); K.text(x0 + 75, 50, s ? 'dg4.s1' : 'dg4.s0', { maxW: 140, cls: 't-mute' });
    const pos = [[x0 + 12, 64], [x0 + 82, 64], [x0 + 12, 142], [x0 + 82, 142]];
    K.line(`M${x0 + 68} 89 H${x0 + 82} M${x0 + 68} 167 H${x0 + 82} M${x0 + 40} 114 V142 M${x0 + 110} 114 V142 M${x0 + 68} 114 L${x0 + 82} 142`, 'l-green');
    pos.forEach(([x, y]) => K.box(x, y, 56, 50, 'b-gold', 'dg4.die'));
    K.box(x0, 228, 150, 34, 'b-violet', 'dg4.mem');
    K.line(`M${x0 + 40} 216 V228 M${x0 + 110} 216 V228`, 'l-violet');
  });
  K.line('M160 120 H180', 'l-red'); K.line('M170 26 V120', 'l-dash');
  K.text(170, 284, 'dg4.lat1', { maxW: 320, cls: 't-mute', fs: 13.2 });
  K.text(170, 308, 'dg4.lat2', { maxW: 320, cls: 't-mute', fs: 13.2 });
} }] };

// 05 a 2026 desktop board: Intel Core Ultra 200S + Z890 (Intel ARK and 800 Series chipset brief)
PANELS.dg5 = { aria: 'dg5.aria', panels: [{ h: 486, draw(K) {
  K.box(6, 14, 82, 44, 'b-violet', 'dg5.mem');
  K.line('M88 36 H104', 'l-violet');
  K.box(104, 8, 140, 58, 'b-gold', 'dg5.cpu', null, 'dg5.cpu.sub');
  K.line('M134 66 V120 H112', 'l-gold'); K.line('M118 66 V178 H112', 'l-gold'); K.line('M226 66 V120 H234', 'l-cyan');
  K.box(6, 98, 106, 44, 'b-cyan', 'dg5.gpu', null, 'dg5.gpu.sub');
  K.box(6, 156, 106, 44, 'b-cyan', 'dg5.m2a', null, 'dg5.m2a.sub');
  K.box(234, 98, 100, 44, 'b-cyan', 'dg5.m2b', null, 'dg5.m2b.sub');
  K.line('M174 66 V234', 'l-green');
  K.text(182, 176, 'dg5.dmi', { anchor: 'start', maxW: 150, cls: 't-green', fs: 13.2 });
  K.text(182, 196, 'dg5.dmi.bw', { anchor: 'start', maxW: 150, cls: 't-mute', fs: 13.2 });
  K.box(96, 234, 156, 50, 'b-green', 'dg5.pch', null, 'dg5.pch.sub');
  const cols = [6, 120, 234];
  K.line('M96 270 H56 V324 M170 284 V324 M252 270 H284 V324', 'l');
  K.line('M113 284 V376 H56 V384 M113 376 H170 V384 M227 284 V376 H284 V384', 'l');
  ['dg5.c1', 'dg5.c2', 'dg5.c3'].forEach((k, i) => K.box(cols[i], 324, 100, 44, 'b-cyan', k, null, k + '.sub'));
  ['dg5.c4', 'dg5.c5', 'dg5.c6'].forEach((k, i) => K.box(cols[i], 384, 100, 44, 'b-cyan', k, null, k + '.sub'));
  K.text(170, 458, 'dg5.hsio', { maxW: 320, cls: 't-mute', fs: 13.2 });
} }] };

// 06 ring vs mesh
PANELS.dg6 = { aria: 'dg6.aria', panels: [
  { h: 270, draw(K) {
    K.text(170, 20, 'dg6.a.title', { maxW: 320, cls: 't-mute' });
    const pts = [...Array(8)].map((_, i) => [170 + 98 * Math.cos(i * Math.PI / 4 - Math.PI / 2), 138 + 86 * Math.sin(i * Math.PI / 4 - Math.PI / 2)]);
    el('ellipse', { cx: 170, cy: 138, rx: 98, ry: 86, class: 'l-gold' }, K.g);
    pts.forEach(([x, y], i) => { el('rect', { x: x - 19, y: y - 13, width: 38, height: 26, rx: 6, class: 'b-under' }, K.g); K.box(x - 19, y - 13, 38, 26, 'b-gold'); K.text(x, y + 4.5, 'dg6.core', { vars: { n: i }, maxW: 34 }); });
    K.text(170, 258, 'dg6.a.note', { maxW: 320, cls: 't-mute', fs: 13.2 });
  } },
  { h: 270, draw(K) {
    K.text(170, 20, 'dg6.b.title', { maxW: 320, cls: 't-mute' });
    const X = i => 50 + i * 80, Y = j => 52 + j * 54;
    for (let i = 0; i < 4; i++) { K.line(`M${X(0)} ${Y(i)} H${X(3)}`, 'l-cyan'); K.line(`M${X(i)} ${Y(0)} V${Y(3)}`, 'l-cyan'); }
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { el('rect', { x: X(i) - 19, y: Y(j) - 13, width: 38, height: 26, rx: 6, class: 'b-under' }, K.g); el('rect', { x: X(i) - 19, y: Y(j) - 13, width: 38, height: 26, rx: 6, class: 'b-cyan' }, K.g); K.text(X(i), Y(j) + 4.5, 'dg6.core', { vars: { n: j * 4 + i }, maxW: 34 }); }
    K.text(170, 258, 'dg6.b.note', { maxW: 320, cls: 't-mute', fs: 13.2 });
  } }] };

// 07 chiplets on a package: organic substrate vs silicon bridge / interposer
PANELS.dg7 = { aria: 'dg7.aria', panels: [
  { h: 250, draw(K) {
    K.text(170, 20, 'dg7.a.title', { maxW: 320, cls: 't-mute' });
    K.box(8, 40, 324, 150, 'b-dim'); K.text(170, 180, 'dg7.a.sub', { maxW: 300, cls: 't-mute', fs: 13.2 });
    K.box(22, 70, 78, 80, 'b-gold', 'dg7.ccd'); K.box(240, 70, 78, 80, 'b-gold', 'dg7.ccd');
    K.box(124, 70, 92, 80, 'b-green', 'dg7.iod');
    K.line('M100 96 H124 M100 124 H124 M216 96 H240 M216 124 H240', 'l-green');
    K.text(170, 216, 'dg7.a.link', { maxW: 320, cls: 't-green', fs: 13.2 });
    K.text(170, 238, 'dg7.a.reach', { maxW: 320, cls: 't-mute', fs: 13.2 });
  } },
  { h: 250, draw(K) {
    K.text(170, 20, 'dg7.b.title', { maxW: 320, cls: 't-mute' });
    K.box(8, 150, 324, 36, 'b-dim'); K.text(170, 173, 'dg7.b.sub', { maxW: 300, cls: 't-mute', fs: 13.2 });
    K.box(60, 122, 220, 24, 'b-cyan'); K.text(170, 139, 'dg7.b.bridge', { maxW: 210, fs: 13.2 });
    K.box(26, 46, 128, 70, 'b-gold', 'dg7.die1'); K.box(186, 46, 128, 70, 'b-violet', 'dg7.die2');
    K.line('M120 116 V122 M150 116 V122 M190 116 V122 M220 116 V122', 'l');
    K.text(170, 216, 'dg7.b.link', { maxW: 320, cls: 't-cyan', fs: 13.2 });
    K.text(170, 238, 'dg7.b.reach', { maxW: 320, cls: 't-mute', fs: 13.2 });
  } }] };

// 08 an I²C bus: two open-drain lines, two pull-ups, every device can only pull low (UM10204 Figure 3)
PANELS.dg8 = { aria: 'dg8.aria', panels: [{ h: 300, draw(K) {
  K.line('M20 40 H330', 'l'); K.text(22, 30, 'dg8.vdd', { anchor: 'start', maxW: 120, cls: 't-mute', fs: 13.2 });
  const res = x => `M${x} 40 V52 l7 4 l-14 8 l14 8 l-14 8 l14 8 l-7 4 V`;
  K.line(res(262) + '110', 'l'); K.line(res(304) + '150', 'l');
  K.text(232, 76, 'dg8.rp', { anchor: 'end', maxW: 80, cls: 't-mute', fs: 13.2 });
  K.line('M20 110 H330', 'l-cyan'); K.line('M20 150 H330', 'l-gold');
  K.text(22, 102, 'dg8.sda', { anchor: 'start', maxW: 150, cls: 't-cyan', fs: 13.2 });
  K.text(22, 142, 'dg8.scl', { anchor: 'start', maxW: 150, cls: 't-gold', fs: 13.2 });
  [[20, 'b-gold', 'dg8.ctl'], [126, 'b-cyan', 'dg8.t1'], [232, 'b-cyan', 'dg8.t2']].forEach(([x, cls, k]) => {
    K.line(`M${x + 28} 110 V196 M${x + 62} 150 V196`, 'l'); K.box(x, 196, 90, 44, cls, k);
  });
  K.text(222, 132, 'dg8.cb', { maxW: 64, cls: 't-mute', fs: 13.2 });
  K.text(170, 266, 'dg8.note1', { maxW: 320, cls: 't-mute', fs: 13.2 });
  K.text(170, 288, 'dg8.note2', { maxW: 320, cls: 't-mute', fs: 13.2 });
} }] };

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
function fitFont(c, s, maxW) { c.font = FONT; const w = c.measureText(s).width; if (w > maxW) c.font = FONT.replace('12px', (12 * Math.max(0.72, maxW / w)).toFixed(1) + 'px'); }
function axes(c, f, w, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute;
  if (yLab) { c.textAlign = 'left'; fitFont(c, yLab, w - f.L - 12); c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; fitFont(c, xLab, f.R - 4); c.fillText(xLab, f.R, f.B + 26); }
  c.font = FONT;
}
function spacedTicks(c, items, y, maxW) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x0, s] of items) { const w = c.measureText(s).width, x = maxW ? Math.min(Math.max(x0, w / 2 + 2), maxW - w / 2 - 2) : x0; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function splitLabel(c, s, cap) {
  if (c.measureText(s).width + 14 <= cap || s.indexOf(' ') < 0) return [s];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
// horizontal bars: rows of [label, value, colour, text, ghost]; ghost draws the wanted value behind the bar
function bars(c, w, h, rows, max, hiIdx) {
  const lf = labelFont(c, rows.map(r => r[0]), Math.min(170, w * 0.36));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  rows.forEach(([lab, v, col, txt, ghost], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(22, rh * 0.56);
    c.font = lf.font; c.textAlign = 'right'; c.fillStyle = i === hiIdx ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
    c.fillStyle = C.grid; c.fillRect(L, y - bh / 2, R - L, bh);
    if (ghost > 0) { c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, Math.max(1.5, X(ghost) - L), bh); }
    if (v > 0) { c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh); }
    if (txt) {
      let tw = c.measureText(txt).width; const xe = X(Math.max(v, ghost || 0, 0));
      if (xe - L < tw + 10 && xe + 6 + tw > R) { const k = Math.max(0.6, (R - xe - 6) / tw); c.font = FONT.replace('12px', (12 * k).toFixed(1) + 'px'); tw = c.measureText(txt).width; }
      if (xe + 6 + tw <= R + 0.5) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); }
      else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, Math.max(L + tw + 4, X(Math.max(v, 0)) - 6), y); }
      c.font = FONT;
    }
  });
}
const gbps = (x, d) => t('u.GBps', { v: fmt(x, d == null ? (x < 10 ? 2 : 1) : d) });
const mbps = (x, d) => t('u.MBps', { v: fmt(x, d == null ? (x < 100 ? 1 : 0) : d) });
const ns = (x, d) => t('u.ns', { v: fmt(x, d == null ? (x < 10 ? 1 : 0) : d) });

/* ───────── 01 one PCI bus ───────── */
(() => {
  const cv = $('#busCv'), sN = $('#busN'), sD = $('#busD'), sB = $('#busB');
  const D = () => Math.pow(2, +sB.value), N = () => +sN.value, d = () => +sD.value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = N(), Dp = D(), dem = d(), P = M.SPEC.pci, Lc = P.initLat;
      const slot = P.sliceUs * 1000 / P.tclkNs;                                    // clocks in a 10 µs slice
      const txPer = Math.ceil(dem * P.sliceUs / (Dp * P.widthBytes));             // transactions each device needs per slice
      const L = 12, R = w - 12, X = v => L + (R - L) * v / slot;
      c.fillStyle = C.mute; c.textAlign = 'left'; fitFont(c, t('ch1.cv.shared'), R - L); c.fillText(t('ch1.cv.shared'), L, 16); c.font = FONT;
      const y0 = 30, bh = 30; let clk = 0, done = 0, need = n * txPer;
      c.fillStyle = C.dimfill; c.fillRect(L, y0, R - L, bh);
      outer: for (let r = 0; r < txPer; r++) for (let i = 0; i < n; i++) {
        if (clk + Lc + Dp > slot) break outer;
        c.fillStyle = C.red; c.fillRect(X(clk), y0, Math.max(0.5, X(clk + Lc) - X(clk)), bh); clk += Lc;
        c.fillStyle = i % 2 ? C.cyan : '#4aa3bd'; c.fillRect(X(clk), y0, Math.max(0.5, X(clk + Dp) - X(clk)), bh); clk += Dp; done++;
      }
      c.strokeStyle = C.line; c.strokeRect(L, y0, R - L, bh);
      c.fillStyle = done < need ? C.red : C.ink; c.textAlign = 'left';
      const msg = done < need ? t('ch1.cv.missed', { n: fmt(need - done, 0), all: fmt(need, 0) }) : t('ch1.cv.allin', { n: fmt(need, 0) });
      fitFont(c, msg, R - L); c.fillText(msg, L, y0 + bh + 16); c.font = FONT;
      const y1 = y0 + bh + 44; c.fillStyle = C.mute; fitFont(c, t('ch1.cv.p2p'), R - L); c.fillText(t('ch1.cv.p2p'), L, y1); c.font = FONT;
      const lh = Math.max(4, Math.min(14, (h - y1 - 30) / n - 3));
      for (let i = 0; i < n; i++) {
        const y = y1 + 12 + i * (lh + 3); c.fillStyle = C.dimfill; c.fillRect(L, y, R - L, lh);
        let k = 0; for (let r = 0; r < txPer; r++) { if (k + Lc + Dp > slot) break; c.fillStyle = C.red; c.fillRect(X(k), y, Math.max(0.5, X(k + Lc) - X(k)), lh); k += Lc; c.fillStyle = C.cyan; c.fillRect(X(k), y, Math.max(0.5, X(k + Dp) - X(k)), lh); k += Dp; }
      }
      c.fillStyle = C.mute; c.textAlign = 'right'; fitFont(c, t('ch1.cv.x'), R - L); c.fillText(t('ch1.cv.x'), R, h - 10); c.font = FONT;
    }
  });
  function text() {
    const z = M.say.bus(N(), d(), D()), v = z.v;
    put('#busNo', fmt(N(), 0)); put('#busDo', mbps(d(), 0)); put('#busBo', t('ch1.u.phases', { v: fmt(D(), 0) }));
    put('#busE', mbps(v.eff, 0)); put('#busEach', mbps(v.each, 1)); put('#busP', mbps(v.p2pEach, 0)); put('#busW', t('u.us', { v: fmt(v.waitUs, 1) }));
    putHTML('#busSay', t(z.key, { n: fmt(N(), 0), d: mbps(d(), 0), eff: mbps(v.eff, 0), each: mbps(v.each, 1), u: pct(v.U), p2p: mbps(v.p2pEach, 0), tot: mbps(v.p2pTotal, 0), wait: t('u.us', { v: fmt(v.waitUs, 1) }), D: fmt(D(), 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sN, sD, sB].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 02 loads and clock ───────── */
(() => {
  const cv = $('#lnCv'), sF = $('#lnF'), sN = $('#lnN'), sL = $('#lnL'), L = M.LINE;
  const comp = () => radioVal('lnC'), f = () => ({ 33: 100 / 3, 66: 200 / 3 })[sF.value] || +sF.value,   // the 33 and 66 stops are PCI's nominal 33.33 / 66.67 MHz
    N = () => +sN.value, Cl = () => +sL.value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), cp = comp(), n = N(), C0 = Cl(), need = L.needNs(n, C0), ymax = 40;
      const fr = frame(w, h, [28, 14, 40, 46], 20, 100, 0, ymax);
      yTicks(c, fr, [0, 10, 20, 30, 40], v => fmt(v, 0)); axes(c, fr, w, t('ch2.cv.x'), t('ch2.cv.y'));
      c.fillStyle = C.mute; spacedTicks(c, [20, 33, 50, 66, 80, 100].map(x => [fr.X(x), fmt(x, 0)]), fr.B + 11, w);
      const pts = []; for (let x = 20; x <= 100.001; x += 0.5) pts.push([x, Math.max(0, Math.min(ymax, L.tpropBudget(x, cp)))]);
      path(c, pts, fr.X, fr.Y, C.red, 2.4);
      path(c, [[20, Math.min(need, ymax)], [100, Math.min(need, ymax)]], fr.X, fr.Y, C.gold, 2.2, [6, 4]);
      const fm = L.fmax(n, cp, C0);
      if (fm >= 20 && fm <= 100) { c.strokeStyle = C.mute; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(fr.X(fm), fr.T); c.lineTo(fr.X(fm), fr.B); c.stroke(); c.setLineDash([]);
        const s = t('ch2.cv.fmax', { f: fmt(fm, 0) }); c.font = FONT; const sw = c.measureText(s).width; c.fillStyle = C.ink; c.textAlign = fr.X(fm) + 6 + sw > fr.R ? 'right' : 'left'; c.fillText(s, fr.X(fm) + (c.textAlign === 'right' ? -6 : 6), fr.T + 8); }
      dot(c, fr.X(f()), fr.Y(Math.max(0, Math.min(ymax, L.tpropBudget(f(), cp)))), need <= L.tpropBudget(f(), cp) ? C.green : C.red, 5.5);
    }
  });
  function text() {
    const cp = comp(), z = M.say.line(N(), f(), cp, Cl()), v = z.v, tr = L.trips(Cl());
    put('#lnFo', t('u.MHz', { v: fmt(f(), 0) })); put('#lnNo', fmt(N(), 0)); put('#lnLo', t('u.pF', { v: fmt(Cl(), 2) }));
    put('#lnT', ns(Math.max(0, v.T), 1)); put('#lnR', ns(v.need, 1)); put('#lnM', fmt(v.nmax, 0)); put('#lnV', pct(tr.after1));
    putHTML('#lnSay', t(z.key, { T: ns(Math.max(0, v.T), 1), need: ns(v.need, 1), k: fmt(v.k, 0), nmax: fmt(v.nmax, 0), n: fmt(N(), 0), f: fmt(f(), 0), fmax: fmt(v.fmax, 0), step: pct(tr.after1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sF, sN, sL].forEach(s => s.addEventListener('input', go)); onAll(radios('lnC'), 'change', go);
  text();
})();

/* ───────── 03 the northbridge ───────── */
(() => {
  const cv = $('#nbCv'), sC = $('#nbC'), sG = $('#nbG'), sS = $('#nbS'), cE = $('#nbE'), S = M.SPEC.i875;
  const dem = () => ({ cpu: +sC.value, gpu: +sG.value, sb: +sS.value, gbe: cE.checked ? M.NB.gbe : 0 });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.NB.run(dem()), L = M.NB.links();
    const rows = ['fsb', 'mem', 'agp', 'hi', 'csa'].map(k => { const u = r.load[k] / L[k]; return [t('ch3.bar.' + k), u, u > 0.999 ? C.red : k === 'mem' ? C.violet : C.green, t('ch3.bar.fmt', { u: pct(u), cap: L[k] >= 1 ? gbps(L[k], 1) : mbps(L[k] * 1000, 0) }), Math.min(1, (r.want[k] || 0) / L[k])]; });
    bars(c, w, h, rows, 1, 1);
  } });
  function text() {
    const d = dem(), r = M.NB.run(d), z = M.say.nb(d), v = z.v;
    put('#nbCo', gbps(+sC.value, 1)); put('#nbGo', gbps(+sG.value, 1)); put('#nbSo', mbps(+sS.value * 1000, 0));
    put('#nbCpu', gbps(r.rate.cpu || 0, 1)); put('#nbGpu', gbps(r.rate.gpu || 0, 1)); put('#nbSb', mbps((r.rate.sb || 0) * 1000, 0)); put('#nbMem', pct(r.load.mem / S.mem));
    putHTML('#nbSay', t(z.key, { cpu: gbps(v.cpu, 1), want: gbps(v.want, 1), mem: gbps(v.mem, 1), cap: gbps(S.mem, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sC, sG, sS].forEach(s => s.addEventListener('input', go)); cE.addEventListener('change', go);
  text();
})();

/* ───────── 04 NUMA ───────── */
(() => {
  const cv = $('#nmCv'), sP = $('#nmP'), sR = $('#nmR'), sM = $('#nmM'), Z = M.SPEC.zep;
  const p = () => ({ pkg: +sP.value / 100, remote: +sR.value / 100 }), m = () => +sM.value;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = M.NUMA.shares(p()), lat = M.NUMA.lat(p());
    const rows = [[t('ch4.bar.local'), Z.local, C.green, t('ch4.bar.fmt', { lat: ns(Z.local), s: pct(s.local) })],
      [t('ch4.bar.pkg'), Z.pkg, C.cyan, t('ch4.bar.fmt', { lat: ns(Z.pkg), s: pct(s.pkg) })],
      [t('ch4.bar.remote'), Z.remote, C.red, t('ch4.bar.fmt', { lat: ns(Z.remote), s: pct(s.remote) })],
      [t('ch4.bar.avg'), lat, C.gold, ns(lat, 1)]];
    bars(c, w, h, rows, 220, 3);
  } });
  function clampR() { const mx = 100 - +sP.value; if (+sR.value > mx) sR.value = mx; }
  function text() {
    clampR(); const z = M.say.numa(p(), m()), v = z.v;
    put('#nmPo', pct(+sP.value / 100, 1)); put('#nmRo', pct(+sR.value / 100, 1)); put('#nmMo', fmt(m(), 0));
    put('#nmLat', ns(v.lat, 1)); put('#nmX', t('u.x', { v: fmt(v.x, 2) })); put('#nmBw', gbps(v.bw, 1)); put('#nmL', pct(v.s.local, 1));
    putHTML('#nmSay', t(z.key, { lat: ns(v.lat, 1), x: fmt(v.x, 2), bw: gbps(v.bw, 1), local: pct(v.s.local, 1), remote: pct(v.s.remote, 1), m: fmt(m(), 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sP, sR, sM].forEach(s => s.addEventListener('input', go));
  const preset = (a, b) => () => { sP.value = a; sR.value = b; go(); };
  const il = M.NUMA.interleave();
  $('#nmLocal').addEventListener('click', preset(0, 0)); $('#nmIl').addEventListener('click', preset(il.pkg * 100, il.remote * 100)); $('#nmFar').addEventListener('click', preset(0, 100));
  text();
})();

/* ───────── 05 the chipset uplink ───────── */
(() => {
  const cv = $('#bdCv'), cU = $('#bdU'), cS = $('#bdS'), cC = $('#bdC');
  const o = () => ({ plat: radioVal('bdP'), ssd1: radioVal('bdA'), ssd2: radioVal('bdB'), usb: cU.checked, sata: cS.checked, cpuSsd: cC.checked });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.BOARD.run(o());
    const rows = [[t('ch5.bar.up'), r.load.up, r.want.up > r.U + 1e-9 ? C.red : C.green, t('ch5.bar.fmt', { v: gbps(r.load.up), cap: gbps(r.U) }), r.want.up],
      [t('ch5.bar.dn'), r.load.dn, r.want.dn > r.U + 1e-9 ? C.red : C.green, t('ch5.bar.fmt', { v: gbps(r.load.dn), cap: gbps(r.U) }), r.want.dn]];
    r.flows.forEach(f => rows.push([t('ch5.dev.' + f.id), r.rate[f.id], f.path[0] === 'cpu' ? C.gold : C.cyan, gbps(r.rate[f.id]), f.demand]));
    if (r.flows.length === 0) rows.push([t('ch5.dev.none'), 0, C.cyan, '', 0]);
    bars(c, w, h, rows, 17, -1);
  } });
  function text() {
    const z = M.say.board(o()), v = z.v, r = M.BOARD.run(o());
    put('#bdUp', gbps(r.load.up)); put('#bdDn', gbps(r.load.dn)); put('#bdO', t('u.x', { v: fmt(r.over, 2) })); put('#bdW', pct(r.slowest));
    putHTML('#bdSay', t(z.key, { up: gbps(v.up), dn: gbps(v.dn), U: gbps(v.U), slow: pct(v.slow), over: fmt(v.over, 2) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['bdP', 'bdA', 'bdB'].forEach(nm => onAll(radios(nm), 'change', go)); [cU, cS, cC].forEach(x => x.addEventListener('change', go));
  text();
})();

/* ───────── 06 ring vs mesh ───────── */
(() => {
  const cv = $('#ncCv'), Ns = [4, 8, 12, 16, 24, 36, 64];
  const N = () => +radioVal('ncN');
  const curve = Ns.map(n => [n, M.NOC.ring(n).avg, M.NOC.mesh(n).avg]);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [28, 14, 40, 40], 0, 64, 0, 18);
    yTicks(c, f, [0, 4, 8, 12, 16], v => fmt(v, 0)); axes(c, f, w, t('ch6.cv.x'), t('ch6.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [4, 16, 36, 64].map(x => [f.X(x), fmt(x, 0)]), f.B + 11, w);
    path(c, curve.map(p => [p[0], p[1]]), f.X, f.Y, C.gold, 2.4); path(c, curve.map(p => [p[0], p[2]]), f.X, f.Y, C.cyan, 2.4);
    const n = N(); dot(c, f.X(n), f.Y(M.NOC.ring(n).avg), C.gold, 5.5); dot(c, f.X(n), f.Y(M.NOC.mesh(n).avg), C.cyan, 5.5);
  } });
  function text() {
    const n = N(), r = M.NOC.ring(n), m = M.NOC.mesh(n), z = M.say.noc(n), v = z.v;
    put('#ncR', fmt(r.avg, 2)); put('#ncM', t('ch6.meshfmt', { v: fmt(m.avg, 2), a: fmt(m.a, 0), b: fmt(m.b, 0) })); put('#ncMax', t('ch6.maxfmt', { r: fmt(r.max, 0), m: fmt(m.max, 0) })); put('#ncT', t('u.x', { v: fmt(r.gamma / m.gamma, 2) }));
    putHTML('#ncSay', t(z.key, { n: fmt(n, 0), r: fmt(v.r, 2), m: fmt(v.m, 2), a: fmt(v.a, 0), b: fmt(v.b, 0), ratio: fmt(v.ratio, 2) }));
  }
  sim.text = text;
  onAll(radios('ncN'), 'change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 die-to-die energy ───────── */
(() => {
  const cv = $('#ddCv'), sB = $('#ddB'), D = M.D2D;
  const bw = () => Math.pow(10, +sB.value), k = () => radioVal('ddK');
  const W = x => x < 1 ? t('u.mW', { v: fmt(x * 1000, 0) }) : t('u.W', { v: fmt(x, x < 10 ? 1 : 0) });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), B = bw(), sel = k(), rows = D.kinds.map(kk => [t('ch7.k.' + kk), D.watts(B, kk), kk === sel ? C.gold : C.cyan, W(D.watts(B, kk))]);
    bars(c, w, h, rows, D.watts(B, 'lp5') * 1.05, D.kinds.indexOf(sel));
  } });
  function text() {
    const B = bw(), z = M.say.d2d(B, k()), v = z.v;
    put('#ddBo', B >= 1000 ? t('u.TBps', { v: fmt(B / 1000, B >= 10000 ? 0 : 1) }) : gbps(B, 0));
    put('#ddW', W(v.w)); put('#ddE', v.edge == null ? t('u.none') : t('u.mm', { v: fmt(v.edge, v.edge < 1 ? 2 : 1) })); put('#ddP', t('u.pj', { v: fmt(v.pj, 2) }));
    putHTML('#ddSay', t(z.key, { k: t('ch7.k.' + k()), bw: $('#ddBo').textContent, w: W(v.w), edge: v.edge == null ? '' : t('u.mm', { v: fmt(v.edge, v.edge < 1 ? 2 : 1) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sB.addEventListener('input', go); onAll(radios('ddK'), 'change', go);
  text();
})();

/* ───────── 08 I²C rise time ───────── */
const E12 = [0.47, 0.56, 0.68, 0.82, 1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2, 10, 12, 15, 18, 22];
(() => {
  const cv = $('#icCv'), sC = $('#icC'), sR = $('#icR'), I = M.I2C;
  const mode = () => radioVal('icM'), vdd = () => +radioVal('icV'), Cb = () => +sC.value, Rk = () => E12[+sR.value];
  const kohm = x => x < 1 ? t('u.ohm', { v: fmt(x * 1000, 0) }) : t('u.kohm', { v: fmt(x, x < 10 ? 2 : 1) });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = I.check(mode(), vdd(), Rk(), Cb()), tau = Rk() * Cb(), tmax = Math.max(2500, r.tr * 1.6);
    const f = frame(w, h, [28, 14, 40, 46], 0, tmax, 0, 1.05);
    yTicks(c, f, [0, 0.3, 0.7, 1], v => fmt(v * 100, 0) + '%'); axes(c, f, w, t('ch8.cv.x'), t('ch8.cv.y'));
    const tk = []; for (let x = 0; x <= tmax; x += tmax > 5000 ? 2000 : 500) tk.push([f.X(x), fmt(x, 0)]); c.fillStyle = C.mute; spacedTicks(c, tk, f.B + 11, w);
    [0.3, 0.7].forEach(v => { c.strokeStyle = C.mute; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.L, f.Y(v)); c.lineTo(f.R, f.Y(v)); c.stroke(); c.setLineDash([]); });
    const pts = []; for (let x = 0; x <= tmax; x += tmax / 200) pts.push([x, 1 - Math.exp(-x / tau)]); path(c, pts, f.X, f.Y, C.gold, 2.4);
    const t1 = tau * Math.log(1 / 0.7), t2 = tau * Math.log(1 / 0.3);
    c.fillStyle = r.slow ? 'rgba(240,122,109,.25)' : 'rgba(122,214,160,.2)'; c.fillRect(f.X(t1), f.Y(0.7), f.X(t2) - f.X(t1), f.Y(0.3) - f.Y(0.7));
    const xm = f.X(Math.min(tmax, t1 + r.trMax)); c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(xm, f.T); c.lineTo(xm, f.B); c.stroke();
  } });
  function text() {
    const r = I.check(mode(), vdd(), Rk(), Cb()), z = M.say.i2c(mode(), vdd(), Rk(), Cb());
    put('#icCo', t('u.pF', { v: fmt(Cb(), 0) })); put('#icRo', kohm(Rk()));
    put('#icT', ns(r.tr, 0)); put('#icX', ns(r.trMax, 0)); put('#icW', r.window ? t('ch8.winfmt', { lo: kohm(r.lo), hi: kohm(r.hi) }) : t('u.none')); put('#icD', fmt(r.devices, 0));
    putHTML('#icSay', t(z.key, { tr: ns(r.tr, 0), max: ns(r.trMax, 0), lo: kohm(r.lo), hi: kohm(r.hi), rp: kohm(Rk()), cb: t('u.pF', { v: fmt(Cb(), 0) }), cbmax: t('u.pF', { v: fmt(M.SPEC.i2c.modes[mode()].cb, 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sC, sR].forEach(s => s.addEventListener('input', go)); ['icM', 'icV'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── loop ───────── */
lastW = document.documentElement.clientWidth;
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
