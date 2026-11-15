/* How Thunderbolt works: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.TbModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', card: '#141821', card2: '#1a1f2b', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', body: '#d5d7de', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const SANS = '-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",system-ui,sans-serif';
const MONO = 'ui-monospace,Menlo,Consolas,monospace';
const FONT = '12px ' + SANS;
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
const gb = (x, d) => t('u.Gbps', { v: fmt(x, d == null ? (x < 10 ? 2 : 1) : d) });
const mbps = x => t('u.MBps', { v: fmt(x, 0) });
const volt = (x, d) => t('u.V', { v: fmt(x, d == null ? 2 : d) });
const kib = x => t('u.KiB', { v: fmt(x / 1024, 0) });
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
  drawDiagrams();
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── text measurement (shared by diagrams and canvases) ───────── */
const mctx = document.createElement('canvas').getContext('2d');
function tw(s, size, mono, weight) { mctx.font = (weight ? weight + ' ' : '') + size + 'px ' + (mono ? MONO : SANS); return mctx.measureText(s).width; }
// split a label into lines no wider than maxW: words for Latin text, characters for CJK (Latin runs kept whole)
function wrap(s, maxW, size, mono) {
  if (tw(s, size, mono) <= maxW) return [s];
  const toks = s.match(/[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+|\s+/g) || [s];
  const lines = []; let cur = '';
  for (const tk of toks) {
    const nx = cur + tk;
    // a closing mark never starts a line: it stays with the text before it
    if (cur && tw(nx.trim(), size, mono) > maxW && tk.trim() && !/^[）)，。、：；」》]$/.test(tk)) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; }
    else cur = nx;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

/* ───────── SVG diagrams ─────────
   Each diagram is laid out for the width it is drawn at (viewBox = CSS pixels), so 12 px text stays 12 px on every screen;
   narrow screens get a portrait arrangement. Every visible word is a copy key. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const S = {
  rect: (x, y, w, h, o = {}) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.fill || 'none'}" stroke="${o.stroke || 'none'}" stroke-width="${o.sw || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` fill-opacity="${o.op}"` : ''}/>`,
  text: (x, y, s, o = {}) => `<text class="lb${o.mono ? ' mono' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.size || 12}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central" fill="${o.fill || C.ink}"${o.weight ? ` font-weight="${o.weight}"` : ''}${o.halo ? ` stroke="${C.bg}" stroke-width="5" stroke-linejoin="round" paint-order="stroke"` : ''}>${esc(s)}</text>`,
  line: (x1, y1, x2, y2, o = {}) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${o.stroke || C.mute}" stroke-width="${o.sw || 1.4}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${o.arrow})"` : ''}/>`
};
const ARROWS = ['mute', 'gold', 'cyan', 'violet', 'red', 'green', 'ink'];
const defs = () => '<defs>' + ARROWS.map(k => `<marker id="ar-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C[k]}"/></marker>`).join('') + '</defs>';
// a box with a wrapped, centred label; returns { svg, h }
function box(x, y, w, label, o = {}) {
  const size = o.size || 12, lh = size * 1.35, pad = o.pad == null ? 7 : o.pad, lines = wrap(label, w - 2 * pad, size, o.mono);
  const h = Math.max(o.minH || 0, lines.length * lh + 2 * pad);
  let s = S.rect(x, y, w, h, { fill: o.fill || C.card2, stroke: o.stroke || C.line, sw: o.sw, op: o.op });
  const y0 = y + h / 2 - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => { s += S.text(x + w / 2, y0 + i * lh, l, { size, fill: o.color || C.ink, mono: o.mono, weight: o.weight }); });
  return { svg: s, h, lines: lines.length };
}
const boxH = (w, label, o = {}) => { const size = o.size || 12, pad = o.pad == null ? 7 : o.pad; return Math.max(o.minH || 0, wrap(label, w - 2 * pad, size, o.mono).length * size * 1.35 + 2 * pad); };
// a legend that wraps: items [colour, key]; returns { svg, h }
function legend(x, y, maxW, items) {
  let cx = x, cy = y, s = '';
  for (const [col, key] of items) {
    const lab = t(key), w = 16 + tw(lab, 12) + 18;
    if (cx > x && cx + w > x + maxW) { cx = x; cy += 22; }
    s += S.rect(cx, cy - 5, 11, 11, { fill: col, rx: 2 }) + S.text(cx + 16, cy, lab, { anchor: 'start', fill: C.mute });
    cx += w;
  }
  return { svg: s, h: cy - y + 16 };
}
const PIN_COL = { hs: C.cyan, usb2: C.green, cc: C.gold, sbu: C.violet, pwr: C.red, gnd: C.dimfill };
const PIN_INK = { hs: C.bg, usb2: C.bg, cc: C.bg, sbu: C.bg, pwr: C.bg, gnd: C.ink };
const PROTO = { dp: C.violet, usb: C.cyan, pcie: C.gold, usb4: C.ink, usb2: C.green };

const DIAGRAMS = {
  // 01 the receptacle (Type-C R2.5 Table 3-4). Row A left to right A1…A12; row B, facing it, B12…B1.
  dgPin(W) {
    const P = M.SPEC.pins, A = P.slice(0, 12), B = P.slice(12).reverse();
    let s = '', y = 10;
    if (W >= 560) {
      const m = 8, cw = (W - 2 * m) / 12, ch = 34;
      s += S.text(m, y, t('dg1.rowA'), { anchor: 'start', fill: C.mute, size: 12 }); y += 16;
      A.forEach((p, i) => { s += S.text(m + cw * i + cw / 2, y, p[0], { mono: true, size: 11, fill: C.mute }); }); y += 12;
      A.forEach((p, i) => { s += S.rect(m + cw * i + 2, y, cw - 4, ch, { fill: PIN_COL[p[2]], rx: 4 }) + S.text(m + cw * i + cw / 2, y + ch / 2, p[1], { size: 12, fill: PIN_INK[p[2]], mono: true }); });
      y += ch + 10;
      B.forEach((p, i) => { s += S.rect(m + cw * i + 2, y, cw - 4, ch, { fill: PIN_COL[p[2]], rx: 4 }) + S.text(m + cw * i + cw / 2, y + ch / 2, p[1], { size: 12, fill: PIN_INK[p[2]], mono: true }); });
      y += ch + 12;
      B.forEach((p, i) => { s += S.text(m + cw * i + cw / 2, y, p[0], { mono: true, size: 11, fill: C.mute }); }); y += 18;
      s += S.text(m, y, t('dg1.rowB'), { anchor: 'start', fill: C.mute, size: 12 }); y += 26;
      const lg = legend(m, y, W - 2 * m, [[PIN_COL.hs, 'dg1.hs'], [PIN_COL.usb2, 'dg1.usb2'], [PIN_COL.cc, 'dg1.cc'], [PIN_COL.sbu, 'dg1.sbu'], [PIN_COL.pwr, 'dg1.pwr'], [PIN_COL.gnd, 'dg1.gnd']]);
      return { h: y + lg.h, svg: s + lg.svg };
    }
    // portrait: two columns, A1…A12 down the left, the B pin facing each one on the right
    const idW = 34, cellW = 78, gap = 20, tot = 2 * (idW + cellW) + gap, x0 = (W - tot) / 2, rh = 27;
    const hA = wrap(t('dg1.rowA'), cellW + gap - 10, 12), hB = wrap(t('dg1.rowB'), cellW + gap - 10, 12);
    hA.forEach((l, i) => { s += S.text(x0 + idW + cellW / 2, y + i * 16, l, { fill: C.mute }); });
    hB.forEach((l, i) => { s += S.text(x0 + idW + cellW + gap + cellW / 2, y + i * 16, l, { fill: C.mute }); });
    y += Math.max(hA.length, hB.length) * 16 + 4;
    for (let i = 0; i < 12; i++) {
      const a = A[i], b = B[i], yy = y + i * rh;
      s += S.text(x0 + idW - 6, yy + rh / 2 - 1, a[0], { anchor: 'end', mono: true, size: 11, fill: C.mute });
      s += S.rect(x0 + idW, yy + 2, cellW, rh - 5, { fill: PIN_COL[a[2]], rx: 4 }) + S.text(x0 + idW + cellW / 2, yy + rh / 2 - 1, a[1], { mono: true, fill: PIN_INK[a[2]] });
      const xb = x0 + idW + cellW + gap;
      s += S.rect(xb, yy + 2, cellW, rh - 5, { fill: PIN_COL[b[2]], rx: 4 }) + S.text(xb + cellW / 2, yy + rh / 2 - 1, b[1], { mono: true, fill: PIN_INK[b[2]] });
      s += S.text(xb + cellW + 6, yy + rh / 2 - 1, b[0], { anchor: 'start', mono: true, size: 11, fill: C.mute });
    }
    y += 12 * rh + 16;
    const lg = legend(8, y, W - 16, [[PIN_COL.hs, 'dg1.hs'], [PIN_COL.usb2, 'dg1.usb2'], [PIN_COL.cc, 'dg1.cc'], [PIN_COL.sbu, 'dg1.sbu'], [PIN_COL.pwr, 'dg1.pwr'], [PIN_COL.gnd, 'dg1.gnd']]);
    return { h: y + lg.h, svg: s + lg.svg };
  },

  // 02a a host router and a device router, three tunnels through one link
  dgRouter(W) {
    const m = 6, g = 8, cw = (W - 2 * m - 2 * g - 16) / 3, cols = [0, 1, 2].map(i => m + 8 + i * (cw + g)), colC = [PROTO.dp, PROTO.usb, PROTO.pcie];
    const row = (keys, o) => { const hs = keys.map(k => boxH(cw, t(k), o)); return Math.max(...hs); };
    let s = '', y = 6;
    const k0 = ['dg2.src.dp', 'dg2.src.usb', 'dg2.src.pcie'], k1 = ['dg2.ad.dpin', 'dg2.ad.usb3', 'dg2.ad.pcie'], k3 = ['dg2.ad.dpout', 'dg2.ad.usb3', 'dg2.ad.pcie'], k4 = ['dg2.snk.dp', 'dg2.snk.usb', 'dg2.snk.pcie'];
    const h0 = row(k0), h1 = row(k1, { size: 12 }), h3 = row(k3), h4 = row(k4);
    const lines = []; // [x, y1, y2, colour]
    // sources
    k0.forEach((k, i) => { s += box(cols[i], y, cw, t(k), { minH: h0 }).svg; }); const ySrcB = y + h0; y += h0 + 18;
    // host router
    const tHost = wrap(t('dg2.host'), W - 2 * m - 16, 12), hostTop = y, bandH = boxH(W - 2 * m - 16, t('dg2.transport'), { size: 12 }), laneH = boxH(W - 2 * m - 16, t('dg2.lanes'), { size: 12 });
    const hostH = 10 + tHost.length * 16 + 6 + h1 + 10 + bandH + 8 + laneH + 10;
    let fr = S.rect(m, hostTop, W - 2 * m, hostH, { fill: C.card, stroke: C.mute, sw: 1.2 });
    tHost.forEach((l, i) => { s += S.text(m + 10, hostTop + 14 + i * 16, l, { anchor: 'start', fill: C.mute }); });
    let yy = hostTop + 10 + tHost.length * 16 + 6;
    k1.forEach((k, i) => { s += box(cols[i], yy, cw, t(k), { minH: h1, stroke: colC[i] }).svg; });
    lines.push(...cols.map((x, i) => [x + cw / 2, ySrcB, hostTop, colC[i]]));
    const yAdB = yy + h1; yy += h1 + 10;
    s += box(m + 8, yy, W - 2 * m - 16, t('dg2.transport'), { fill: C.card2 }).svg; const yBand = yy; yy += bandH + 8;
    s += box(m + 8, yy, W - 2 * m - 16, t('dg2.lanes'), { fill: C.card2 }).svg; const yLane = yy;
    lines.push(...cols.map((x, i) => [x + cw / 2, yAdB, yBand, colC[i]]));
    y = hostTop + hostH;
    // the link
    const linkLab = t('dg2.link'), linkLines = wrap(linkLab, W - 2 * m - W * 0.24 - 16, 12), linkH = 22 + linkLines.length * 16;
    const linkBg = S.rect(m + W * 0.12, y + 6, W - 2 * m - W * 0.24, linkH - 12, { fill: '#10141c', stroke: C.line, rx: 10 });
    const xs = [0.3, 0.5, 0.7].map(f => m + (W - 2 * m) * f);
    let linkTx = ''; linkLines.forEach((l, i) => { linkTx += S.text(W / 2, y + linkH / 2 + (i - (linkLines.length - 1) / 2) * 16, l, { fill: C.body, halo: true }); });
    const yLinkT = y, yLinkB = y + linkH; y += linkH;
    // device router
    const tDev = wrap(t('dg2.dev'), W - 2 * m - 16, 12), devTop = y, devH = 10 + bandH + 10 + h3 + 8 + tDev.length * 16 + 8;
    fr += S.rect(m, devTop, W - 2 * m, devH, { fill: C.card, stroke: C.gold, sw: 1.2 });
    yy = devTop + 10; s += box(m + 8, yy, W - 2 * m - 16, t('dg2.transport2'), { fill: C.card2 }).svg; const yBand2 = yy + boxH(W - 2 * m - 16, t('dg2.transport2'));
    yy += boxH(W - 2 * m - 16, t('dg2.transport2')) + 10;
    k3.forEach((k, i) => { s += box(cols[i], yy, cw, t(k), { minH: h3, stroke: colC[i] }).svg; }); const yAd2 = yy, yAd2B = yy + h3;
    yy += h3 + 8; tDev.forEach((l, i) => { s += S.text(m + 10, yy + 8 + i * 16, l, { anchor: 'start', fill: C.mute }); });
    y = devTop + devH + 18;
    k4.forEach((k, i) => { s += box(cols[i], y, cw, t(k), { minH: h4 }).svg; });
    lines.push(...cols.map((x, i) => [x + cw / 2, devTop + devH, y, colC[i]]));
    // tunnels: from the transport band through the lane adapters, the link and down into the device router
    let pth = '';
    cols.forEach((x, i) => {
      const cx = x + cw / 2, lx = xs[i];
      pth += `<path d="M${cx} ${yLane - 8} C ${cx} ${yLane + 30}, ${lx} ${yLinkT - 10}, ${lx} ${yLinkT + 6} L ${lx} ${yLinkB - 6} C ${lx} ${yLinkB + 10}, ${cx} ${yBand2 - 20}, ${cx} ${yAd2}" fill="none" stroke="${colC[i]}" stroke-width="2.4" stroke-opacity=".9"/>`;
    });
    const ln = lines.map(([x, a, b, c]) => S.line(x, a, x, b, { stroke: c, sw: 2.4 })).join('');
    return { h: y + h4 + 6, svg: fr + ln + linkBg + pth + s + linkTx };
  },

  // 02b the 4-byte header (Table 5-2) in two 16-bit rows, then the payload
  dgHdr(W) {
    const m = 10, bw = (W - 2 * m) / 16, rh = 40;
    let s = '', y = 8;
    const F1 = [['dg3.pdf', 4, C.violet], ['dg3.supp', 1, C.dimfill], ['dg3.rsvd', 4, C.dimfill], ['dg3.hop', 7, C.gold]], F2 = [['dg3.len', 8, C.cyan], ['dg3.hec', 8, C.green]];
    const rowF = (F, hiBit, yy) => {
      s += S.text(m, yy, String(hiBit), { anchor: 'start', mono: true, size: 11, fill: C.mute }) + S.text(W - m, yy, String(hiBit - 15), { anchor: 'end', mono: true, size: 11, fill: C.mute });
      let x = m; yy += 12;
      for (const [k, n, col] of F) {
        const w = n * bw, lab = t(k), dark = col !== C.dimfill;
        s += S.rect(x + 1, yy, w - 2, rh, { fill: col, rx: 4, op: dark ? 0.9 : 1 });
        const ls = wrap(lab, w - 6, 12);
        ls.forEach((l, i) => { s += S.text(x + w / 2, yy + rh / 2 + (i - (ls.length - 1) / 2) * 15, l, { fill: dark ? C.bg : C.ink, weight: 600 }); });
        x += w;
      }
      return yy + rh;
    };
    y = rowF(F1, 31, y) + 14; y = rowF(F2, 15, y) + 16;
    // payload
    const pw = (W - 2 * m) * 0.8;
    const pl = box(m, y, pw - 4, t('dg3.payload'), { fill: C.card2, stroke: C.mute, minH: 40 });
    const pd = box(m + pw, y, W - 2 * m - pw, t('dg3.padding'), { fill: C.card2, stroke: C.line, minH: pl.h, size: 11 });
    s += pl.svg + pd.svg; y += Math.max(pl.h, pd.h) + 14;
    const notes = wrap(t('dg3.note'), W - 2 * m, 12); notes.forEach((l, i) => { s += S.text(m, y + i * 17, l, { anchor: 'start', fill: C.mute }); });
    return { h: y + notes.length * 17, svg: s };
  },

  // 03 what is inside a dock (schematic; a USB4 hub per USB4 §2.2.10 and §11)
  dgDock(W) {
    const m = 6, g = 6;
    let s = '', y = 6;
    const top = box(W * 0.2, y, W * 0.6, t('dg4.host'), { stroke: C.mute });
    s += top.svg; const yTopB = y + top.h; y += top.h + 26;
    s += S.line(W / 2, yTopB, W / 2, y - 2, { stroke: C.ink, sw: 2.4 });
    const cableLab = t('dg4.cable'); s += S.text(W / 2 + 8, yTopB + 13, cableLab, { anchor: 'start', fill: C.mute, size: 11 });
    const dockTop = y, ttl = wrap(t('dg4.dock'), W - 2 * m - 16, 12);
    const rW = W - 2 * m - 16, rt = boxH(rW, t('dg4.router'));
    const cols = 4, cw = (W - 2 * m - 16 - (cols - 1) * g) / cols, cx = i => m + 8 + i * (cw + g);
    const L1 = ['dg4.ad.pcie', 'dg4.ad.usb3', 'dg4.ad.dp', 'dg4.ad.usb4'], L2 = ['dg4.pcieSw', 'dg4.usbHub', 'dg4.dpPorts', 'dg4.down'], L3 = ['dg4.nic', 'dg4.usbA', null, null];
    const col = [PROTO.pcie, PROTO.usb, PROTO.dp, PROTO.usb4];
    const hRow = keys => Math.max(...keys.map(k => k ? boxH(cw, t(k), { size: 12 }) : 0));
    const h1 = hRow(L1), h2 = hRow(L2), h3 = hRow(L3), u2 = boxH(rW, t('dg4.usb2'), { size: 12 });
    const dockH = 10 + ttl.length * 16 + 6 + rt + 14 + h1 + 14 + h2 + 14 + h3 + 14 + u2 + 10;
    const fr = S.rect(m, dockTop, W - 2 * m, dockH, { fill: C.card, stroke: C.gold, sw: 1.2 });
    ttl.forEach((l, i) => { s += S.text(m + 10, dockTop + 14 + i * 16, l, { anchor: 'start', fill: C.mute }); });
    let yy = dockTop + 10 + ttl.length * 16 + 6;
    s += box(m + 8, yy, rW, t('dg4.router'), { fill: C.card2 }).svg; const yR = yy + rt; yy += rt + 14;
    const conn = [];
    L1.forEach((k, i) => { s += box(cx(i), yy, cw, t(k), { minH: h1, stroke: col[i] }).svg; conn.push([cx(i) + cw / 2, yR, yy, col[i]]); }); const y1B = yy + h1; yy += h1 + 14;
    L2.forEach((k, i) => { s += box(cx(i), yy, cw, t(k), { minH: h2, stroke: col[i] }).svg; conn.push([cx(i) + cw / 2, y1B, yy, col[i]]); }); const y2B = yy + h2; yy += h2 + 14;
    L3.forEach((k, i) => { if (k) { s += box(cx(i), yy, cw, t(k), { minH: h3 }).svg; conn.push([cx(i) + cw / 2, y2B, yy, col[i]]); } }); yy += h3 + 14;
    s += box(m + 8, yy, rW, t('dg4.usb2'), { fill: C.card2, stroke: C.green }).svg;
    const ln = conn.map(([x, a, b, c]) => S.line(x, a, x, b, { stroke: c, sw: 2 })).join('');
    return { h: dockTop + dockH + 4, svg: fr + ln + s };
  },

  // 04 a daisy chain: each link carries everything below it
  dgChain(W) {
    const nodes = ['dg5.host', 'dg5.dock', 'dg5.driveA', 'dg5.driveB', 'dg5.mon'], links = ['dg5.l1', 'dg5.l2', 'dg5.l3', 'dg5.l4'];
    let s = '', y = 8;
    if (W >= 640) {
      const n = nodes.length, gap = 34, bw = (W - 16 - (n - 1) * gap) / n, hB = Math.max(...nodes.map(k => boxH(bw, t(k))));
      const dep = i => t('dg5.depth', { d: i });
      nodes.forEach((k, i) => { const x = 8 + i * (bw + gap); s += S.text(x + bw / 2, y + 6, dep(i), { fill: C.mute, size: 11 }); s += box(x, y + 16, bw, t(k), { minH: hB, stroke: i ? C.gold : C.mute }).svg; });
      const yl = y + 16 + hB / 2;
      for (let i = 0; i < n - 1; i++) { const x1 = 8 + i * (bw + gap) + bw, x2 = x1 + gap; s += S.line(x1 + 2, yl, x2 - 2, yl, { stroke: C.ink, sw: 2.4 }); }
      y += 16 + hB + 16;
      // the link loads, listed beneath
      const lw = W - 16;
      links.forEach((k, i) => { const ls = wrap(t(k), lw - 20, 12); ls.forEach((l, j) => { s += S.text(8, y + j * 16, l, { anchor: 'start', fill: i === 0 ? C.gold : C.body }); }); y += ls.length * 16 + 4; });
      const ns = wrap(t('dg5.note'), lw, 12); ns.forEach((l, j) => { s += S.text(8, y + 6 + j * 16, l, { anchor: 'start', fill: C.mute }); });
      return { h: y + 6 + ns.length * 16, svg: s };
    }
    const bw = Math.min(W - 16, 260), x = (W - bw) / 2;
    nodes.forEach((k, i) => {
      const b = box(x, y, bw, t(k) + ' · ' + t('dg5.depth', { d: i }), { stroke: i ? C.gold : C.mute }); s += b.svg; y += b.h;
      if (i < links.length) { const ls = wrap(t(links[i]), W / 2 - 18, 11); const lh = ls.length * 15 + 12; s += S.line(W / 2, y, W / 2, y + lh, { stroke: C.ink, sw: 2.4 }); ls.forEach((l, j) => { s += S.text(W / 2 + 10, y + 12 + j * 15, l, { anchor: 'start', size: 11, fill: i === 0 ? C.gold : C.body }); }); y += lh; }
    });
    const ns = wrap(t('dg5.note'), W - 16, 12); ns.forEach((l, j) => { s += S.text(8, y + 16 + j * 16, l, { anchor: 'start', fill: C.mute }); });
    return { h: y + 16 + ns.length * 16, svg: s };
  },

  // 05 symmetric 2 + 2 against asymmetric 3 + 1 (USB4 Figures 2-3 and 2-4)
  dgLanes(W) {
    const side = W >= 600, pw = side ? (W - 30) / 2 : W - 16, per = M.SPEC.usb4.gen3 * 2;      // "Gen 4 refers to a speed of 40 Gbps" per lane
    const panel = (x0, y0, tx, rx, key, vars) => {
      let s = ''; const ttl = wrap(t(key, vars), pw - 8, 12);
      ttl.forEach((l, i) => { s += S.text(x0 + 4, y0 + 8 + i * 16, l, { anchor: 'start', fill: C.ink, weight: 600 }); });
      let y = y0 + ttl.length * 16 + 12; const bw = Math.min(84, pw * 0.26);
      const hb = 4 * 30 + 10, h = box(x0, y, bw, t('dg6.host'), { minH: hb, stroke: C.mute }), d = box(x0 + pw - bw, y, bw, t('dg6.dev'), { minH: hb, stroke: C.gold });
      s += h.svg + d.svg;
      for (let i = 0; i < 4; i++) {
        const yy = y + 20 + i * 30, down = i < tx, x1 = x0 + bw + 4, x2 = x0 + pw - bw - 4, col = down ? C.cyan : C.green;
        s += down ? S.line(x1, yy, x2, yy, { stroke: col, sw: 2.2, arrow: 'cyan' }) : S.line(x2, yy, x1, yy, { stroke: col, sw: 2.2, arrow: 'green' });
        s += S.text((x1 + x2) / 2, yy - 9, t('u.Gbps', { v: fmt(per, 0) }), { size: 11, fill: col, mono: true });
      }
      return { svg: s, h: y + hb - y0 };
    };
    const G = v => t('u.Gbps', { v: fmt(v, 0) });
    const a = panel(8, 6, 2, 2, 'dg6.sym', { d: G(per * 2), u: G(per * 2) });
    const b = side ? panel(22 + pw, 6, 3, 1, 'dg6.asym', { d: G(per * 3), u: G(per) }) : null;
    if (side) {
      const lg = legend(8, Math.max(a.h, b.h) + 22, W - 16, [[C.cyan, 'dg6.down'], [C.green, 'dg6.up']]);
      return { h: Math.max(a.h, b.h) + 22 + lg.h, svg: a.svg + b.svg + lg.svg };
    }
    const b2 = panel(8, a.h + 26, 3, 1, 'dg6.asym', { d: G(per * 3), u: G(per) });
    const lg = legend(8, a.h + 26 + b2.h + 20, W - 16, [[C.cyan, 'dg6.down'], [C.green, 'dg6.up']]);
    return { h: a.h + 26 + b2.h + 20 + lg.h, svg: a.svg + b2.svg + lg.svg };
  },

  // 06 who gets the four high-speed pairs: DP Alt Mode pin assignment C and D, and a USB4 link
  dgAlt(W) {
    const m = 8, rows = [['dg7.c', ['dp', 'dp', 'dp', 'dp'], 'dg7.aux'], ['dg7.d', ['usb', 'usb', 'dp', 'dp'], 'dg7.aux'], ['dg7.u', ['usb4', 'usb4', 'usb4', 'usb4'], 'dg7.sb']];
    const names = ['TX1', 'RX1', 'TX2', 'RX2'], lab = { dp: 'dg7.dp', usb: 'dg7.usb3', usb4: 'dg7.usb4' }, fill = { dp: C.violet, usb: C.cyan, usb4: C.ink };
    let s = '', y = 6;
    const sbuW = Math.max(56, Math.min(90, (W - 2 * m) * 0.2)), cw = (W - 2 * m - sbuW - 10) / 4;
    for (const [key, slots, sbu] of rows) {
      const ls = wrap(t(key), W - 2 * m, 12); ls.forEach((l, i) => { s += S.text(m, y + 8 + i * 16, l, { anchor: 'start', weight: 600 }); }); y += ls.length * 16 + 8;
      const hS = Math.max(...slots.map(k => boxH(cw - 4, t(lab[k]), { size: 12 })), boxH(sbuW, t(sbu), { size: 11 }));
      slots.forEach((k, i) => { s += box(m + i * cw + 2, y, cw - 4, t(lab[k]), { fill: fill[k], stroke: fill[k], color: C.bg, minH: hS, weight: 600 }).svg; });
      s += box(W - m - sbuW, y, sbuW, t(sbu), { fill: C.card2, stroke: C.violet, minH: hS, size: 11 }).svg;
      y += hS + 13;
      names.forEach((n, i) => { s += S.text(m + i * cw + cw / 2, y, n, { mono: true, size: 11, fill: C.mute }); });
      s += S.text(W - m - sbuW / 2, y, 'SBU1/2', { mono: true, size: 11, fill: C.mute });
      y += 22;
    }
    return { h: y, svg: s };
  },

  // 07 the EPR negotiation (USB PD r3.3 §7.30.1, Figure 7.3); each message is answered by a GoodCRC, not drawn
  dgPd(W) {
    const m = 8, heads = ['dg8.cable', 'dg8.src', 'dg8.snk'];
    let s = '', y = 6;
    const hw = Math.min(120, (W - 2 * m) / 3 - 6), side = Math.max((W - 2 * m) * 0.12, hw / 2 + 1), xs = [m + side, W / 2, W - m - side], hh = Math.max(...heads.map(k => boxH(hw, t(k), { size: 12 })));
    heads.forEach((k, i) => { s += box(xs[i] - hw / 2, y, hw, t(k), { minH: hh, stroke: i === 1 ? C.red : i === 2 ? C.cyan : C.violet }).svg; });
    y += hh + 16; const top = y;
    const seq = [[1, 2, 'Source_Capabilities'], [2, 1, 'Request'], [1, 2, 'Accept'], [1, 2, 'PS_RDY'], ['div', 'dg8.spr'],
      [2, 1, 'EPR_Mode (Enter)'], [1, 2, 'EPR_Mode (Enter Acknowledged)'], [1, 0, 'Discover Identity (SOP′)'], [0, 1, 'dg8.emark'], [1, 2, 'EPR_Mode (Enter Succeeded)'],
      [1, 2, 'EPR_Source_Capabilities'], [2, 1, 'EPR_Request'], [1, 2, 'Accept'], [1, 2, 'PS_RDY'], ['div', 'dg8.epr']];
    let body = '';
    for (const e of seq) {
      if (e[0] === 'div') { const ls = wrap(t(e[1]), W - 2 * m - 8, 12); body += S.rect(m, y - 2, W - 2 * m, ls.length * 16 + 10, { fill: 'rgba(233,185,73,.10)', stroke: 'none', rx: 4 }); ls.forEach((l, i) => { body += S.text(W / 2, y + 6 + i * 16, l, { fill: C.gold }); }); y += ls.length * 16 + 18; continue; }
      const [a, b, msg] = e, lab = /^dg8\./.test(msg) ? t(msg) : msg, x1 = xs[a], x2 = xs[b], mid = (x1 + x2) / 2;
      const size = tw(lab, 12, true) > W - 2 * m - 4 ? 11 : 12;
      const ls = wrap(lab, W - 2 * m - 4, size, true);
      ls.forEach((l, i) => { const w = tw(l, size, true); const cx = Math.min(Math.max(mid, m + w / 2 + 2), W - m - w / 2 - 2); body += S.text(cx, y + i * 15, l, { mono: true, size, fill: C.body, halo: true }); });
      y += ls.length * 15 + 2;
      const col = a === 0 || b === 0 ? 'violet' : 'mute';
      body += S.line(x1 + (x2 > x1 ? 3 : -3), y, x2 + (x2 > x1 ? -3 : 3), y, { stroke: C[col], sw: 1.6, arrow: col });
      y += 16;
    }
    xs.forEach(x => { s += S.line(x, top - 8, x, y, { stroke: C.line, sw: 1.2, dash: '4 4' }); });
    return { h: y + 4, svg: s + body };
  },

  // 08 the IOMMU maps whole pages (schematic: six pages of three slots)
  dgIommu(W) {
    const m = 8;
    let s = '', y = 6;
    const bw = Math.min(W - 2 * m, 300), x = (W - bw) / 2;
    const d = box(x, y, bw, t('dg9.dev'), { stroke: C.gold }); s += d.svg; y += d.h;
    s += S.line(W / 2, y, W / 2, y + 22, { stroke: C.gold, sw: 2, arrow: 'gold' }); s += S.text(W / 2 + 8, y + 11, t('dg9.req'), { anchor: 'start', size: 11, fill: C.mute }); y += 24;
    const io = box(x, y, bw, t('dg9.iommu'), { stroke: C.cyan }); s += io.svg; y += io.h;
    const pages = 6, g = 6, pw = (W - 2 * m - (pages - 1) * g) / pages, map = [1, 0, 1, 0, 0, 1], slot = [['me', 'ot', 'ot'], ['ot', 'ot', 'ot'], ['ot', 'me', 'ot'], ['ot', 'ot', 'ot'], ['ot', 'ot', 'ot'], ['me', 'me', 'ot']];
    const yP = y + 40;
    for (let i = 0; i < pages; i++) {
      const px = m + i * (pw + g), cx = px + pw / 2;
      s += S.line(W / 2, y, cx, yP - 16, { stroke: map[i] ? C.cyan : C.red, sw: 1.6, dash: map[i] ? '' : '4 3', arrow: map[i] ? 'cyan' : 'red' });
      if (!map[i]) s += S.text(cx, yP - 6, '×', { fill: C.red, size: 14, weight: 700 });
      s += S.rect(px, yP, pw, 3 * 26 + 8, { fill: C.card, stroke: map[i] ? C.cyan : C.line });
      for (let j = 0; j < 3; j++) { const k = slot[i][j], col = k === 'me' ? C.gold : map[i] ? C.red : C.dimfill; s += S.rect(px + 4, yP + 4 + j * 26, pw - 8, 22, { fill: col, rx: 3, op: k === 'me' || map[i] ? 0.9 : 1 }); }
      s += S.text(cx, yP + 3 * 26 + 20, t('dg9.page', { i }), { size: 11, fill: C.mute });
    }
    y = yP + 3 * 26 + 38;
    const lg = legend(m, y, W - 2 * m, [[C.gold, 'dg9.mine'], [C.red, 'dg9.exposed'], [C.dimfill, 'dg9.hidden']]);
    return { h: y + lg.h, svg: s + lg.svg };
  }
};
const DG_ARIA = { dgPin: 'dg1.aria', dgRouter: 'dg2.aria', dgHdr: 'dg3.aria', dgDock: 'dg4.aria', dgChain: 'dg5.aria', dgLanes: 'dg6.aria', dgAlt: 'dg7.aria', dgPd: 'dg8.aria', dgIommu: 'dg9.aria' };
function drawDiagrams() {
  for (const id of Object.keys(DIAGRAMS)) {
    const fig = document.getElementById(id); if (!fig) continue;
    const host = fig.querySelector('.svgbox'), W = Math.max(240, Math.floor(host.clientWidth || fig.clientWidth || 300));
    const r = DIAGRAMS[id](W), H = Math.ceil(r.h + 4);
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(t(DG_ARIA[id]))}">${defs()}${r.svg}</svg>`;
    host.dataset.w = W;
  }
}
let dgTimer = null, dgW = window.innerWidth;
window.addEventListener('resize', () => { if (window.innerWidth === dgW) return; dgW = window.innerWidth; clearTimeout(dgTimer); dgTimer = setTimeout(drawDiagrams, 120); });

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
function fitFont(c, s, maxW, base) { let k = 1; c.font = FONT; const w = c.measureText(s).width; if (w > maxW) k = Math.max(0.75, maxW / w); c.font = ((base || 12) * k).toFixed(1) + 'px ' + SANS; return k; }

// stacked horizontal bars: rows [{ label, total, segs: [[value, colour, text?]] }], all on one scale `max`
function stacked(c, w, h, rows, max) {
  c.font = FONT; let lw = 0; const empty = r => !r.total && !r.segs.length; rows.forEach(r => { if (!empty(r)) lw = Math.max(lw, c.measureText(r.label).width); });
  const L = Math.min(lw + 16, w * 0.34), R = w - 10, T = 12, B = h - 22, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  rows.forEach((r, i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(26, rh * 0.55);
    // a row with no bar (a device that was not enumerated) writes its label into the empty bar area instead
    if (empty(r)) { fitFont(c, r.label, R - L); c.fillStyle = C.gold; c.textAlign = 'left'; c.fillText(r.label, L, y); c.font = FONT; return; }
    fitFont(c, r.label, L - 10); c.fillStyle = r.hi ? C.gold : C.ink; c.textAlign = 'right'; c.fillText(r.label, L - 8, y); c.font = FONT;
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, X(r.total) - L, bh);
    let x = L;
    for (const [v, col] of r.segs) { if (v <= 0) continue; const x2 = X(Math.min(max, (x - L) / (R - L) * max + v)); c.fillStyle = col; c.fillRect(x, y - bh / 2, Math.max(1, x2 - x), bh); x = x2; }
    c.strokeStyle = C.line; c.strokeRect(L, y - bh / 2, X(r.total) - L, bh);
    if (r.note) { c.fillStyle = C.mute; c.textAlign = 'right'; fitFont(c, r.note, R - L, 11); c.fillText(r.note, R, y + bh / 2 + 10); c.font = FONT; }
  });
  c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(fmt(0, 0), L, h - 8); c.textAlign = 'right'; c.fillText(t('u.Gbps', { v: fmt(max, 0) }), R, h - 8);
}

/* ───────── 01 CC ───────── */
(() => {
  const cv = $('#ccCv'), E = $('#ccE');
  const st = () => ({ rp: radioVal('ccRp'), f: radioVal('ccO') === 'f', em: E.checked, k: radioVal('ccK') });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), o = st(), a = M.CC.attach(o.rp, o.f, o.em, o.k), W8 = M.SPEC.cc.win, L = 12, R = w - 12, Vmax = 2.5, X = v => L + (R - L) * v / Vmax, y0 = h * 0.36, bh = 26;
      c.fillStyle = C.dimfill; c.fillRect(L, y0, R - L, bh);
      const cols = { usb: 'rgba(122,214,160,.55)', a15: 'rgba(99,199,230,.55)', a30: 'rgba(233,185,73,.55)' };
      const labs = [];
      for (const k of ['usb', 'a15', 'a30']) { c.fillStyle = cols[k]; c.fillRect(X(W8[k][0]), y0, X(W8[k][1]) - X(W8[k][0]), bh); labs.push([X((W8[k][0] + W8[k][1]) / 2), t('ch1.cv.' + k)]); }
      c.fillStyle = C.ink; c.textAlign = 'center'; let last = -Infinity;
      for (const [x, s] of labs) { const k = fitFont(c, s, 1e9, 11.5), tw2 = c.measureText(s).width; const xx = Math.max(Math.min(x, R - tw2 / 2), L + tw2 / 2); if (xx - tw2 / 2 > last + 4) { c.fillText(s, xx, y0 - 12); last = xx + tw2 / 2; } c.font = FONT; void k; }
      const lo = M.CC.v(o.rp, 'lo'), hi = M.CC.v(o.rp, 'hi');
      c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(X(lo), y0 + bh + 10); c.lineTo(X(hi), y0 + bh + 10); c.stroke();
      c.fillStyle = C.red; c.beginPath(); c.moveTo(X(a.v), y0 + bh + 4); c.lineTo(X(a.v) - 6, y0 + bh + 16); c.lineTo(X(a.v) + 6, y0 + bh + 16); c.fill();
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(volt(0, 0), L, h - 10); c.textAlign = 'right'; c.fillText(volt(Vmax, 1), R, h - 10);
      c.textAlign = 'center'; const s2 = t('ch1.cv.range'); fitFont(c, s2, R - L); c.fillText(s2, (L + R) / 2, h - 10); c.font = FONT;
    }
  });
  function text() {
    const o = st(), z = M.say.cc(o.rp, o.f, o.em, o.k), a = z.v;
    const vOn = volt(a.v), vOff = a.otherV == null ? t('ch1.open') : volt(a.otherV);
    put('#ccV1', o.f ? vOff : vOn); put('#ccV2', o.f ? vOn : vOff);
    put('#ccA', a.cls === 'gap' || a.cls === 'none' ? t('u.none') : t('ch1.amps.' + a.cls)); put('#ccP', a.pairs.join(' / '));
    putHTML('#ccSay', t(z.key, { v: volt(a.v), pin: a.ccPin, other: a.otherPin, amps: t('ch1.amps.' + (a.cls === 'gap' || a.cls === 'none' ? 'usb' : a.cls)), tx: a.pairs[0], rx: a.pairs[1], vconn: a.vconn ? t('ch1.say.vconn', { other: a.otherPin }) : t('ch1.say.novconn') }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['ccRp', 'ccO', 'ccK'].forEach(n => onAll(radios(n), 'change', go)); E.addEventListener('change', go);
  text();
})();

/* ───────── 02 the transport-layer header ───────── */
(() => {
  const cv = $('#pkCv'), sP = $('#pkPdf'), sH = $('#pkHop'), sL = $('#pkLen'), sE = $('#pkErr'), K = M.PKT;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 44, R = w - 12, T = 16, B = h - 26, X = n => L + (R - L) * (n - 1) / 255, Y = e => B - (B - T) * e;
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
      c.fillStyle = C.mute; c.textAlign = 'right'; [0.5, 1].forEach(v => { c.fillText(pct(v), L - 6, Y(v)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L + 1, Y(v)); c.lineTo(R, Y(v)); c.stroke(); });
      c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); for (let n = 1; n <= 256; n++) { const x = X(n), y = Y(K.eff(n)); n === 1 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.lineWidth = 1;
      const n = +sL.value; c.fillStyle = C.gold; c.beginPath(); c.arc(X(n), Y(K.eff(n)), 5, 0, 6.283); c.fill();
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('u.B', { v: 1 }), L, h - 10); c.textAlign = 'right'; c.fillText(t('u.B', { v: 256 }), R, h - 10);
      c.textAlign = 'center'; const s2 = t('ch2.cv.x'); fitFont(c, s2, (R - L) * 0.6); c.fillText(s2, (L + R) / 2, h - 10); c.font = FONT;
    }
  });
  function text() {
    const pdf = +sP.value, hop = +sH.value, n = +sL.value, eb = +sE.value, hd = K.header(pdf, hop, K.lengthField(n)), w = K.word(hd), hx = hd.map(M.hex2);
    put('#pkPdfo', fmt(pdf, 0)); put('#pkHopo', fmt(hop, 0)); put('#pkLeno', t('u.B', { v: fmt(n, 0) })); put('#pkErro', eb ? t('ch2.err.bit', { b: eb - 1 }) : t('ch2.err.none'));
    put('#pkH', hx.join(' ')); put('#pkC', M.hex2(hd[3]) + 'h'); put('#pkPad', t('u.B', { v: fmt(K.pad(n), 0) })); put('#pkE', pct(K.eff(n), 1));
    const nl = '\n', bin = (v, b) => v.toString(2).padStart(b, '0');
    let s = `<span class="m">${t('ch2.hex.fields')}</span>${nl}`;
    s += `<span class="v">PDF ${bin(pdf, 4)}</span> <span class="m">S 0 · Rsvd 0000</span> <span class="g">HopID ${bin(hop, 7)}</span> <span class="c">Len ${bin(K.lengthField(n), 8)}</span> <span class="n">HEC ${bin(hd[3], 8)}</span>${nl}`;
    s += `<span class="m">${t('ch2.hex.sent')}</span> ${hx.join(' ')}${nl}`;
    if (eb) {
      const bad = (w ^ (1 << (eb - 1))) >>> 0, syn = K.syndrome(bad), fix = K.correct(bad);
      s += `<span class="m">${t('ch2.hex.recv')}</span> <span class="r">${K.bytesOf(bad).map(M.hex2).join(' ')}</span>${nl}`;
      s += `<span class="m">${t('ch2.hex.syn', { s: M.hex2(syn) + 'h', b: fix.bit })}</span>`;
    } else s += `<span class="m">${t('ch2.hex.clean')}</span>`;
    putHTML('#pkHex', s);
    const z = M.say.pkt(n, eb ? eb - 1 : null);
    putHTML('#pkSay', t(z.key, { n: fmt(n, 0), pad: fmt(z.v.pad, 0), tot: fmt(4 + n + z.v.pad, 0), eff: pct(z.v.eff, 1), b: eb - 1, field: eb ? t('ch2.field.' + fieldOf(eb - 1)) : '' }));
  }
  const fieldOf = b => b < 8 ? 'hec' : b < 16 ? 'len' : b < 23 ? 'hop' : b < 27 ? 'rsvd' : b < 28 ? 'supp' : 'pdf';
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sP, sH, sL, sE].forEach(e => e.addEventListener('input', go));
  text();
})();

/* ───────── 03 sharing one link ───────── */
(() => {
  const cv = $('#shCv'), U = $('#shU');
  const opts = () => ({ link: radioVal('shL'), display: radioVal('shD'), drive: radioVal('shR'), usb: U.checked });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.SHARE.run(opts()), D = r.dirs, max = Math.max(D.down.cap, D.up.cap) * 1.02;
      const row = (d, key) => ({ label: t(key), total: d.cap, segs: [[d.dpUse, C.violet], [d.usb, C.cyan], [d.pcie, C.gold]], note: t('ch3.cv.cap', { v: gb(d.cap, 1) }) });
      stacked(c, w, h, [row(D.down, 'ch3.cv.down'), row(D.up, 'ch3.cv.up')], max);
    }
  });
  function text() {
    const o = opts(), z = M.say.share(o), r = z.v, D = r.dirs, dd = o.drive === 'write' ? D.down : D.up;
    const pw = D.down.cm.paths.find(p => p.id === 'pcie'), uw = D.down.cm.paths.find(p => p.id === 'usb');
    put('#shX', mbps(r.driveMBps)); put('#shDp', gb(D.down.dpUse, 1)); put('#shUs', o.usb ? gb(dd.usb, 1) : t('u.none')); put('#shW', t('ch3.wfmt', { u: fmt(uw.weight, 0), p: fmt(pw.weight, 0) }));
    putHTML('#shSay', t(z.key, { X: mbps(r.driveMBps), dp: gb(D.down.dpUse, 1), cap: gb(dd.cap, 1), pcie: gb(r.pcieCap, 0), usb: gb(dd.usb, 1), stream: gb(r.streamCap, 2), need: gb(Math.max(0, ...r.dpNeeds), 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['shL', 'shD', 'shR'].forEach(n => onAll(radios(n), 'change', go)); U.addEventListener('change', go);
  text();
})();

/* ───────── 04 the chain ───────── */
(() => {
  const cv = $('#chCv'), sN = $('#chN'), sT = $('#chT'), Dp = $('#chDp');
  const opts = () => ({ n: +sN.value, tHop: +sT.value, link: radioVal('chL'), depth: radioVal('chM'), display: Dp.checked });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.CHAIN.run(opts()), max = (r.links[0] ? r.links[0].cap : 40) * 1.02;
      const rows = r.links.map(l => ({ label: t('ch4.cv.link', { k: l.k }), total: l.cap, hi: l.k === 1, segs: [[r.dpNeed, C.violet], [l.load - r.dpNeed, C.gold]] }));
      for (let i = 0; i < r.dropped; i++) rows.push({ label: t('ch4.cv.none', { k: r.live + i + 1 }), total: 0, segs: [] });
      stacked(c, w, h, rows.slice(0, 7), max);
    }
  });
  function text() {
    const o = opts(), z = M.say.chain(o), r = z.v;
    put('#chNo', fmt(o.n, 0)); put('#chTo', t('u.us', { v: fmt(o.tHop, 2) }));
    put('#chE', mbps(r.eachMBps)); put('#chLv', t('ch4.livefmt', { a: fmt(r.live, 0), b: fmt(o.n, 0) })); put('#chR', t('u.us', { v: fmt(r.rtt, 1) })); put('#chS', pct(r.rttShare));
    putHTML('#chSay', t(z.key, { n: fmt(o.n, 0), live: fmt(r.live, 0), max: fmt(r.maxDepth, 0), drop: fmt(r.dropped, 0), X: mbps(r.eachMBps), tot: gb(r.pcieTotal, 1), rtt: t('u.us', { v: fmt(r.rtt, 1) }), share: pct(r.rttShare) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sN, sT].forEach(e => e.addEventListener('input', go)); ['chL', 'chM'].forEach(n => onAll(radios(n), 'change', go)); Dp.addEventListener('change', go);
  text();
})();

/* ───────── 05 lanes ───────── */
(() => {
  const cv = $('#lnCv');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), m = radioVal('lnM'), d = M.LANES.dir(m, 'down'), u = M.LANES.dir(m, 'up'), max = 125;
      const row = (x, key) => ({ label: t(key), total: x.line, segs: [[x.coded, C.cyan]], note: t('ch5.cv.cm', { v: gb(x.cm, 0) }) });
      stacked(c, w, h, [row(d, 'ch3.cv.down'), row(u, 'ch3.cv.up')], max);
      // the Connection Manager's raw figure as a gold tick on each bar
      const L0 = (() => { c.font = FONT; return Math.min(Math.max(c.measureText(t('ch3.cv.down')).width, c.measureText(t('ch3.cv.up')).width) + 16, w * 0.34); })(), R = w - 10, T = 12, B = h - 22, rh = (B - T) / 2;
      [d, u].forEach((x, i) => { const xx = L0 + (R - L0) * x.cm / max, y = T + i * rh + rh / 2; c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(xx, y - 17); c.lineTo(xx, y + 17); c.stroke(); c.lineWidth = 1; });
    }
  });
  function text() {
    const m = radioVal('lnM'), d = M.LANES.dir(m, 'down'), u = M.LANES.dir(m, 'up'), o = M.LANES.modes[m], z = M.say.lanes(m);
    put('#lnD', gb(d.coded, 1)); put('#lnU', gb(u.coded, 1)); put('#lnN', t('u.GHz', { v: fmt(M.LANES.nyquist(m), 2) })); put('#lnC', t('u.m', { v: fmt(M.SPEC.cables[o.cable], 1) }));
    putHTML('#lnSay', t(z.key, { line: gb(d.line, 1), coded: gb(d.coded, 1), up: gb(u.coded, 1), cm: gb(d.cm, 0), cmu: gb(u.cm, 0), lanes: fmt(o.lanes[0] + o.lanes[1], 0), len: t('u.m', { v: fmt(M.SPEC.cables[o.cable], 1) }) }));
  }
  sim.text = text;
  onAll(radios('lnM'), 'change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 06 displays ───────── */
(() => {
  const cv = $('#scCv');
  const opts = () => ({ mode: radioVal('scM'), count: +radioVal('scN'), bpp: +radioVal('scB'), conn: radioVal('scC'), method: radioVal('scT') });
  const methodGroup = () => radios('scT')[0].closest('.seg');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.SCREEN.run(opts()), max = Math.max(r.cap, ...r.rows.map(x => Math.max(x.need, x.res || 0))) * 1.05;
      const rows = r.rows.map((x, i) => ({ label: t('ch6.cv.disp', { i: i + 1 }), total: r.kind === 'tun' ? Math.max(x.res, x.need) : x.need, segs: r.kind === 'tun' ? [[Math.min(x.need, x.res), C.gold], [Math.max(0, x.res - x.need), C.violet]] : [[x.ok ? x.need : 0, C.gold]], hi: !x.ok, note: x.ok ? '' : t('ch6.cv.nofit') }));
      rows.push({ label: t('ch6.cv.cap'), total: r.cap, segs: [[r.used, C.gold]], note: t('ch6.cv.capnote', { v: gb(r.cap, 2) }) });
      stacked(c, w, h, rows, max);
    }
  });
  function text() {
    const o = opts(), z = M.say.screen(o), r = z.v, tun = r.kind === 'tun';
    methodGroup().querySelectorAll('input').forEach(i => { i.disabled = !tun; }); methodGroup().style.opacity = tun ? '' : '.45';
    put('#scNd', gb(r.need, 2)); put('#scF', t('ch6.fitfmt', { a: fmt(r.fit, 0), b: fmt(o.count, 0) })); put('#scU', t('ch6.usedfmt', { u: fmt(r.used, 1), c: fmt(r.cap, 1) }));
    const bppMax = M.VIDEO.bppFor(o.mode, tun ? Math.min(r.cap, M.SCREEN.conn[o.conn].stream) : r.cap);
    put('#scD', bppMax >= o.bpp ? t('ch6.nodsc') : t('ch6.bppfmt', { v: fmt(bppMax, 1) }));
    const second = r.rows[1];
    putHTML('#scSay', t(z.key, { need: gb(r.need, 2), fit: fmt(r.fit, 0), n: fmt(o.count, 0), cap: gb(r.cap, 2), res2: second && second.cfg ? t('ch6.cfgfmt', { rate: second.cfg.rate, l: second.cfg.lanes, bw: gb(second.cfg.bw, 2) }) : '' }));
  }
  sim.text = text;
  ['scM', 'scN', 'scB', 'scC', 'scT'].forEach(n => onAll(radios(n), 'change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 07 power delivery ───────── */
(() => {
  const SINK = { phone: [25, false], l65: [65, false], l100: [100, false], l140: [140, true], l240: [240, true] };
  const MSG = { src_caps: 'Source_Capabilities', request: 'Request', accept: 'Accept', ps_rdy: 'PS_RDY', epr_enter: 'EPR_Mode (Enter)', epr_ack: 'EPR_Mode (Enter Acknowledged)', cable_id: 'Discover Identity (SOP′)', epr_ok: 'EPR_Mode (Enter Succeeded)', epr_caps: 'EPR_Source_Capabilities', epr_request: 'EPR_Request' };
  function text() {
    const pdp = +radioVal('pdC'), cable = radioVal('pdK'), [need, epr] = SINK[radioVal('pdS')], z = M.say.pd(pdp, cable, need, epr), r = z.v;
    const rows = r.spr.map(p => [p, false]).concat(r.epr.map(p => [p, true]));
    putHTML('#pdT tbody', rows.map(([[v, a], e]) => `<tr class="${(r.pick.v === v ? 'pick ' : '') + (e ? 'epr' : '')}"><td>${t('u.V', { v: fmt(v, 0) })}</td><td>${t('u.A', { v: fmt(a, 2) })}</td><td>${t('u.W', { v: fmt(v * a, 0) })}</td></tr>`).join(''));
    let past = false;
    putHTML('#pdM', r.msgs.map(m => { if (m === 'epr_enter') past = true; return `<li class="${past ? 'epr' : ''}">${MSG[m]}</li>`; }).join(''));
    put('#pdW', t('u.W', { v: fmt(r.pick.w, 0) })); put('#pdV', t('ch7.vafmt', { v: fmt(r.pick.v, 0), a: fmt(r.pick.a, 2) })); put('#pdP', t('u.W', { v: fmt(r.present, 0) })); put('#pdMs', t('u.ms', { v: fmt(r.wire, 1) }));
    putHTML('#pdSay', t(z.key, { w: t('u.W', { v: fmt(r.pick.w, 0) }), v: fmt(r.pick.v, 0), a: fmt(r.pick.a, 2), need: t('u.W', { v: fmt(need, 0) }), pdp: t('u.W', { v: fmt(pdp, 0) }), present: t('u.W', { v: fmt(r.present, 0) }) }));
  }
  reg([], { draw() {}, text });
  ['pdC', 'pdK', 'pdS'].forEach(n => onAll(radios(n), 'change', text));
  text();
})();

/* ───────── 08 IOMMU pages ───────── */
(() => {
  const cv = $('#ioCv'), sN = $('#ioN'), bR = $('#ioR'); let seed = 7;
  const opts = () => ({ s: +radioVal('ioS'), N: +sN.value, mode: radioVal('ioM') });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), o = opts(), r = M.IOMMU.run(o.s, o.N, o.mode, seed), lay = r.lay, P = lay.P, m = lay.m;
      // the note under the grid wraps on narrow screens; the grid gives up the room it needs
      const s2 = t(o.mode === 'bounce' ? 'ch8.cv.bounce' : 'ch8.cv.note', { p: fmt(P, 0) }), ls = wrap(s2, w - 16, 12);
      const cols = w >= 560 ? 16 : 8, rowsN = Math.ceil(P / cols), g = 4, pw = (w - 16 - (cols - 1) * g) / cols, ph = (h - 30 - 15 * (ls.length - 1) - (rowsN - 1) * g) / rowsN;
      for (let p = 0; p < P; p++) {
        const x = 8 + (p % cols) * (pw + g), y = 8 + Math.floor(p / cols) * (ph + g), mapped = o.mode === 'off' ? true : o.mode === 'bounce' ? false : lay.pages.has(p);
        c.fillStyle = C.card2; c.fillRect(x, y, pw, ph);
        for (let j = 0; j < m; j++) {
          const id = p * m + j, mine = lay.mine.has(id), sh = (ph - 4) / m;
          c.fillStyle = o.mode === 'bounce' ? (mine ? C.dimfill : C.dimfill) : mine ? C.gold : mapped ? C.red : C.dimfill;
          c.fillRect(x + 2, y + 2 + j * sh, pw - 4, Math.max(1, sh - 1.5));
        }
        if (mapped) { c.strokeStyle = C.cyan; c.lineWidth = 1.4; c.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1); c.lineWidth = 1; }
      }
      c.fillStyle = C.mute; c.textAlign = 'center'; c.font = FONT; ls.forEach((l, i) => c.fillText(l, w / 2, h - 10 - (ls.length - 1 - i) * 15));
    }
  });
  function text() {
    const o = opts(), z = M.say.iommu(o.s, o.N, o.mode), r = M.IOMMU.run(o.s, o.N, o.mode, seed);
    put('#ioNo', fmt(o.N, 0));
    put('#ioB', kib(r.bufBytes)); put('#ioMp', kib(r.mapped)); put('#ioX', kib(r.exposed));
    put('#ioEx', o.mode === 'iommu' ? t('ch8.expfmt', { a: fmt(r.lay.pages.size, 0), e: fmt(M.IOMMU.expectedPages(o.s, o.N), 1) }) : t('u.none'));
    putHTML('#ioSay', t(z.key, { buf: kib(r.bufBytes), mapped: kib(r.mapped), exposed: kib(r.exposed), pages: fmt(r.lay.pages.size, 0), s: fmt(o.s, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); ['ioS', 'ioM'].forEach(n => onAll(radios(n), 'change', go));
  bR.addEventListener('click', () => { seed = (seed * 48271) % 2147483647; go(); });
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) { if (!s.vis) continue; if (s.step) s.step(dt); else if (s.dirty) { s.draw(); s.dirty = false; } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
