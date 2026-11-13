/* How an Economy Is Measured: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.EconModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = {
  bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
  mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
  green: '#7ad6a0', violet: '#b39dfb', dimfill: '#556078'
};
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const FONT_SM = '11px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) {} }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const effLang = () => (COPY[lang] ? lang : 'zh');

function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (x == null || !isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
}
function fmtSigned(x, d = 1) {
  if (x == null || !isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return (v > 0 ? '+' : '') + fmt(v, d);
}

/* ───────── canvas + sim registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d');
  c.setTransform(d, 0, 0, d, 0, 0);
  c.font = r.width < 360 ? FONT_SM : FONT;
  c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height, narrow: r.width < 360 };
}

const sims = [];
const io = new IntersectionObserver(es => {
  es.forEach(e => {
    for (const s of sims) {
      if (s.cvs.includes(e.target)) {
        e.target.__vis = e.isIntersecting;
        s.vis = s.cvs.some(cv => cv.__vis);
        if (s.vis) s.dirty = true;
      }
    }
  });
}, { rootMargin: '80px' });

function reg(cvs, o) {
  o.cvs = [].concat(cvs);
  o.vis = false;
  o.dirty = true;
  sims.push(o);
  o.cvs.forEach(cv => io.observe(cv));
  return o;
}
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));

const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };

/* ───────── plot helpers ───────── */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab, opt = {}) {
  c.strokeStyle = C.line; c.lineWidth = 1;
  c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, Math.max(4, f.L + 2), Math.max(10, f.T - 12)); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + (opt.xLabDy || 26)); }
}
function xTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  let lastX = -1e9;
  vals.forEach(v => {
    const x = f.X(v);
    const lbl = fmtv(v);
    const tw = c.measureText(lbl).width;
    if (x - tw / 2 < 2 || x + tw / 2 > f.R + 8) return;
    if (x - tw / 2 < lastX + 8) return;
    c.fillText(lbl, x, f.B + 12);
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke();
    lastX = x + tw / 2;
  });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => {
    const y = f.Y(v);
    if (y < f.T - 2 || y > f.B + 2) return;
    c.fillText(fmtv(v), f.L - 6, y);
    c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke();
  });
}
function hline(c, f, y, col, dash = [5, 4]) {
  const py = f.Y(y);
  if (py < f.T - 2 || py > f.B + 2) return;
  c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash);
  c.beginPath(); c.moveTo(f.L, py); c.lineTo(f.R, py); c.stroke();
  c.setLineDash([]);
}
function path(c, pts, X, Y, col, lw = 2.2) {
  if (!pts.length) return;
  c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round';
  c.beginPath();
  pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])));
  c.stroke();
}
function drawSafeLabels(c, items, bounds) {
  // items: [{x, y, text, col, align, dx, dy}]
  const placed = [];
  for (const it of items) {
    const tw = c.measureText(it.text).width;
    const th = 13;
    const offsets = [
      [it.dx || 0, it.dy || -11],
      [it.dx || 0, 12],
      [8, 0],
      [-8, 0],
      [0, -22],
      [0, 22]
    ];
    let chosen = null;
    for (const [ox, oy] of offsets) {
      let cx = it.x + ox, cy = it.y + oy;
      let al = it.align || 'center';
      if (ox > 4 && al === 'center') al = 'left';
      if (ox < -4 && al === 'center') al = 'right';
      let x0 = al === 'left' ? cx : al === 'right' ? cx - tw : cx - tw / 2;
      let x1 = x0 + tw;
      if (x0 < bounds.L + 2) { const d = bounds.L + 2 - x0; cx += d; x0 += d; x1 += d; }
      if (x1 > bounds.R - 2) { const d = x1 - (bounds.R - 2); cx -= d; x0 -= d; x1 -= d; }
      cy = M.clamp(cy, bounds.T + 8, bounds.B - 8);
      const y0 = cy - th / 2, y1 = cy + th / 2;
      const hit = placed.some(b => Math.min(x1, b.x1) - Math.max(x0, b.x0) > -3 && Math.min(y1, b.y1) - Math.max(y0, b.y0) > -2);
      if (!hit) { chosen = { cx, cy, al, x0, x1, y0, y1 }; break; }
    }
    if (chosen) {
      placed.push(chosen);
      c.textAlign = chosen.al;
      c.save();
      c.lineJoin = 'round';
      c.lineWidth = 4;
      c.strokeStyle = '#0f1219';
      c.strokeText(it.text, chosen.cx, chosen.cy);
      c.restore();
      c.fillStyle = it.col || C.ink;
      c.fillText(it.text, chosen.cx, chosen.cy);
    }
  }
}

/* ───────── 01 GDP three ways ───────── */
(() => {
  const cv = $('#g1Cv');
  const sW = $('#g1Wheat'), sI = $('#g1Imports'), sH = $('#g1Home');
  const params = () => ({ wheat: +sW.value, imports: +sI.value, homeShift: +sH.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), r = M.gdp3.compute(params());
      const rightPad = 42;
      const maxV = Math.max(240, r.grossOutput, r.C + r.I, r.gdpProd + r.unpaidHome);
      const rows = [
        { lbl: t('ch1.cv.gross'), total: r.grossOutput, segs: [
          { v: r.wheat, col: '#9e534a', txt: t('ch1.cv.farm') },
          { v: r.flour, col: '#b8685c', txt: t('ch1.cv.mill') },
          { v: r.breadSales, col: C.red, txt: t('ch1.cv.bake') },
          { v: r.oven, col: '#c97e73', txt: t('ch1.cv.eq') }
        ] },
        { lbl: t('ch1.cv.prod'), total: r.gdpProd, segs: [
          { v: r.vaFarm, col: '#3d99b8', txt: t('ch1.cv.farm') },
          { v: r.vaMill, col: '#4fb0cf', txt: t('ch1.cv.mill') },
          { v: r.vaBakery, col: C.cyan, txt: t('ch1.cv.bake') },
          { v: r.vaEquip, col: '#8bd8ef', txt: t('ch1.cv.eq') }
        ] },
        { lbl: t('ch1.cv.exp'), total: r.gdpExp, segs: [
          { v: r.C, col: C.gold, txt: t('ch1.cv.c') },
          { v: r.I, col: '#c4962c', txt: t('ch1.cv.i') }
        ], nx: r.NX },
        { lbl: t('ch1.cv.inc'), total: r.gdpInc, segs: [
          { v: r.wages, col: C.green, txt: t('ch1.cv.w') },
          { v: r.profits, col: '#499e6c', txt: t('ch1.cv.p') }
        ] },
        { lbl: t('ch1.cv.home'), total: r.unpaidHome, segs: [
          { v: r.unpaidHome, col: C.dimfill, txt: '' }
        ] }
      ];
      const leftW = Math.max(narrow ? 74 : 96, Math.ceil(Math.max(...rows.map(rw => c.measureText(rw.lbl).width))) + 14);
      const scale = (w - leftW - rightPad) / maxV;
      const top = 26, rowH = Math.floor((h - top - 20) / rows.length), barH = Math.min(30, rowH - 16);
      rows.forEach((row, idx) => {
        const y = top + idx * rowH + barH / 2;
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(row.lbl, leftW - 8, y);
        let x = leftW;
        for (const sg of row.segs) {
          const bw = Math.max(0, sg.v * scale);
          if (bw <= 0) continue;
          c.fillStyle = sg.col;
          c.fillRect(x, y - barH / 2, bw, barH);
          if (sg.txt && bw >= c.measureText(sg.txt).width + 8) {
            c.fillStyle = '#0c0e13'; c.textAlign = 'center';
            c.fillText(sg.txt, x + bw / 2, y);
          }
          x += bw;
        }
        if (row.nx && row.nx < 0) {
          const nxw = Math.abs(row.nx) * scale;
          const nxX = leftW + row.total * scale;
          c.strokeStyle = C.red; c.lineWidth = 1.5; c.setLineDash([4, 3]);
          c.strokeRect(nxX, y - barH / 2, nxw, barH);
          c.setLineDash([]);
          c.fillStyle = C.red; c.textAlign = 'center';
          const lblTxt = t('ch1.cv.nx') + ' ' + fmt(row.nx);
          const lblHalf = c.measureText(lblTxt).width / 2;
          const nxCx = M.clamp(nxX + nxw / 2, leftW + lblHalf + 2, w - lblHalf - 8);
          c.fillText(lblTxt, nxCx, y - barH / 2 - 9);
        }
        const valX = leftW + (row.nx < 0 ? (row.total + Math.abs(row.nx)) : row.total) * scale + 6;
        c.fillStyle = idx === 0 ? C.red : idx === 4 ? C.mute : C.ink;
        c.textAlign = 'left';
        c.fillText(fmt(row.total), Math.min(w - 30, valX), y);
      });
    },
    text() {
      const P = params(), r = M.gdp3.compute(P);
      put('#g1Wheato', fmt(P.wheat));
      put('#g1Importso', fmt(P.imports));
      put('#g1Homeo', fmt(P.homeShift));
      put('#g1Gross', fmt(r.grossOutput));
      put('#g1Gdp', fmt(r.gdpProd));
      put('#g1Nx', fmt(r.NX));
      put('#g1Out', fmt(r.unpaidHome));
      let key = 'ch1.say.base';
      if (P.homeShift > 0) key = 'ch1.say.home';
      else if (P.imports > 0) key = 'ch1.say.import';
      else if (P.wheat !== 30) key = 'ch1.say.wheat';
      putHTML('#g1Say', t(key, {
        gross: fmt(r.grossOutput), dup: fmt(r.doubleCount), gdp: fmt(r.gdpProd),
        depr: fmt(r.depr), ndp: fmt(r.ndp), wheat: fmt(r.wheat), mill: fmt(r.vaMill),
        imp: fmt(r.imports), C: fmt(r.C), nx: fmt(r.NX), shift: fmt(r.homeShift), tot: fmt(r.totalBreadConsumed)
      }));
    }
  });
  [sW, sI, sH].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 02 Nominal vs Real: Price Indexes ───────── */
(() => {
  const cv = $('#g2Cv');
  const sD = $('#g2Drop'), sS = $('#g2Sig'), sI = $('#g2Imp');
  const params = () => ({ techDrop: +sD.value, sigma: +sS.value, importShare: +sI.value / 100 });
  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), r = M.indexes.compute(params());
      const splitY = Math.round(h * 0.54);
      // Top panel: Price index trajectories t=0,1,2
      const vals = r.series.flatMap(s => [s.L, s.P, s.chainF, s.trueP]);
      const yMin = Math.floor(Math.min(70, ...vals) / 10) * 10;
      const yMax = Math.ceil(Math.max(115, ...vals) / 10) * 10;
      const f = frame(w, splitY, [26, 26, 28, narrow ? 38 : 44], 0, 2, yMin, yMax);
      yTicks(c, f, [yMin, (yMin + yMax) / 2, yMax], v => fmt(v, 0));
      axes(c, f, '', t('ch2.cv.top'));
      xTicks(c, f, [0, 1, 2], v => t('ch2.cv.y' + v));
      path(c, r.series.map(s => [s.t, s.L]), f.X, f.Y, C.red, 2.2);
      path(c, r.series.map(s => [s.t, s.P]), f.X, f.Y, C.cyan, 2.2);
      path(c, r.series.map(s => [s.t, s.chainF]), f.X, f.Y, C.gold, 2.4);
      c.setLineDash([4, 4]);
      path(c, r.series.map(s => [s.t, s.trueP]), f.X, f.Y, C.green, 1.8);
      c.setLineDash([]);
      const lbls = [
        { x: f.X(2), y: f.Y(r.pL2), text: fmt(r.pL2, 1), col: C.red, align: 'right', dx: -4, dy: -10 },
        { x: f.X(2), y: f.Y(r.pChain2), text: fmt(r.pChain2, 1), col: C.gold, align: 'right', dx: -4, dy: 0 },
        { x: f.X(2), y: f.Y(r.pP2), text: fmt(r.pP2, 1), col: C.cyan, align: 'right', dx: -4, dy: 11 }
      ];
      drawSafeLabels(c, lbls, f);

      // Bottom panel: 2-year Real GDP growth bars
      const bTop = splitY + 26, bH = h - bTop - 16;
      c.fillStyle = C.mute; c.textAlign = 'left';
      c.fillText(t('ch2.cv.bot'), 12, bTop - 10);
      const bars = [
        { lbl: t('ch2.cv.nom'), v: r.realGrowthNom, col: C.dimfill },
        { lbl: t('ch2.cv.las'), v: r.realGrowthL, col: C.red },
        { lbl: t('ch2.cv.fis'), v: r.realGrowthF, col: C.gold },
        { lbl: t('ch2.cv.tru'), v: (Math.pow(1.03, 2) - 1) * 100, col: C.green }
      ];
      const maxAbs = Math.max(10, ...bars.map(b => Math.abs(b.v) * 1.25));
      const leftW = Math.max(narrow ? 62 : 84, Math.ceil(Math.max(...bars.map(b => c.measureText(b.lbl).width))) + 14), rightPad = 48;
      const midX = leftW + (w - leftW - rightPad) * 0.35;
      const negScale = (midX - leftW) / maxAbs, posScale = (w - rightPad - midX) / maxAbs;
      const sc = Math.min(negScale, posScale);
      const rowH = Math.floor(bH / bars.length), bh = Math.min(18, rowH - 6);
      c.strokeStyle = C.line; c.lineWidth = 1;
      c.beginPath(); c.moveTo(midX, bTop); c.lineTo(midX, h - 12); c.stroke();
      bars.forEach((b, i) => {
        const y = bTop + i * rowH + rowH / 2;
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(b.lbl, leftW - 6, y);
        const bw = b.v * sc;
        c.fillStyle = b.col;
        c.fillRect(bw >= 0 ? midX : midX + bw, y - bh / 2, Math.max(1.5, Math.abs(bw)), bh);
        c.fillStyle = C.ink; c.textAlign = bw >= 0 ? 'left' : 'right';
        const tx = bw >= 0 ? Math.min(midX + bw + 5, w - 44) : Math.max(midX + bw - 5, leftW + 40);
        c.fillText(fmtSigned(b.v, 1) + '%', tx, y);
      });
    },
    text() {
      const P = params(), r = M.indexes.compute(P);
      put('#g2Dropo', t('common.pct', { v: fmt(P.techDrop) }));
      put('#g2Sigo', fmt(P.sigma, 1));
      put('#g2Impo', t('common.pct', { v: fmt(P.importShare * 100) }));
      put('#g2L', fmt(r.pL2, 1));
      put('#g2P', fmt(r.pP2, 1));
      put('#g2F', fmt(r.pChain2, 1));
      put('#g2Bias', fmtSigned(r.subBiasPP, 1));
      const key = P.importShare > 0.01 ? 'ch2.say.import' : (P.sigma < 0.05 ? 'ch2.say.nosub' : 'ch2.say.base');
      putHTML('#g2Say', t(key, {
        nomG: fmtSigned(r.realGrowthNom, 1), pL: fmt(r.pL2, 1), realL: fmtSigned(r.realGrowthL, 1),
        pC: fmt(r.pChain2, 1), realF: fmtSigned(r.realGrowthF, 1),
        imp: fmt(P.importShare * 100), cpi: fmt(r.cpiY2, 1), def: fmt(r.defY2, 1)
      }));
    }
  });
  [sD, sS, sI].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 03 CPI in practice ───────── */
(() => {
  const cv = $('#g3Cv');
  const sSh = $('#g3Sh'), sEn = $('#g3En'), sSk = $('#g3Shock'), cHed = $('#g3Hed'), cOer = $('#g3Oer');
  const params = () => ({ wShelter: +sSh.value, wEnergy: +sEn.value, energyShock: +sSk.value, hedonic: cHed.checked, oerOn: cOer.checked });
  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), P = params();
      const r = M.cpi.compute(P);
      const rNoHed = M.cpi.compute(Object.assign({}, P, { hedonic: false }));
      const bars = [
        { lbl: t('ch3.cv.head'), v: r.offHeadline, col: C.cyan },
        { lbl: t('ch3.cv.core'), v: r.offCore, col: C.green },
        { lbl: t('ch3.cv.pers'), v: r.personal, col: C.gold },
        { lbl: t('ch3.cv.nohed'), v: rNoHed.offHeadline, col: C.red }
      ];
      const leftW = Math.max(narrow ? 70 : 94, Math.ceil(Math.max(...bars.map(b => c.measureText(b.lbl).width))) + 14), rightPad = 52;
      const minV = Math.min(0, ...bars.map(b => b.v)) - 0.5;
      const maxV = Math.max(6, ...bars.map(b => b.v)) + 0.8;
      const f = frame(w, h, [26, rightPad, 24, leftW], minV, maxV, 0, bars.length);
      c.strokeStyle = C.line; c.lineWidth = 1;
      c.beginPath(); c.moveTo(f.X(0), f.T); c.lineTo(f.X(0), f.B); c.stroke();
      const rowH = (f.B - f.T) / bars.length, bh = Math.min(30, rowH - 16);
      bars.forEach((b, i) => {
        const y = f.T + i * rowH + rowH / 2;
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(b.lbl, leftW - 8, y);
        const x0 = f.X(0), x1 = f.X(b.v);
        c.fillStyle = b.col;
        c.fillRect(Math.min(x0, x1), y - bh / 2, Math.max(2, Math.abs(x1 - x0)), bh);
        c.fillStyle = C.ink; c.textAlign = b.v >= 0 ? 'left' : 'right';
        const tx = b.v >= 0 ? Math.min(x1 + 6, w - 48) : Math.max(x1 - 6, leftW + 44);
        c.fillText(fmt(b.v, 2) + '%', tx, y);
      });
    },
    text() {
      const P = params(), r = M.cpi.compute(P);
      put('#g3Sho', t('common.pct', { v: fmt(P.wShelter) }));
      put('#g3Eno', t('common.pct', { v: fmt(P.wEnergy) }));
      put('#g3Shocko', fmtSigned(P.energyShock, 0) + '%');
      put('#g3Head', fmt(r.offHeadline, 2) + '%');
      put('#g3Core', fmt(r.offCore, 2) + '%');
      put('#g3Pers', fmt(r.personal, 2) + '%');
      put('#g3Bias', fmtSigned(r.gapPersonal, 2) + ' pp');
      let key = 'ch3.say.base';
      if (!P.hedonic) key = 'ch3.say.nohed';
      else if (Math.abs(r.gapPersonal) >= 0.05) key = 'ch3.say.diff';
      const dir = t(r.gapPersonal > 0 ? 'ch3.dir.high' : 'ch3.dir.low');
      putHTML('#g3Say', t(key, {
        head: fmt(r.offHeadline, 2), core: fmt(r.offCore, 2), pers: fmt(r.personal, 2),
        diff: fmtSigned(r.gapPersonal, 2), absdiff: fmt(Math.abs(r.gapPersonal), 2),
        dir, hdiff: fmt(r.hedonicDiffPP, 2)
      }));
    }
  });
  [sSh, sEn, sSk, cHed, cOer].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 04 Growth-rate traps ───────── */
(() => {
  const cv = $('#g4Cv');
  const sDip = $('#g4Dip'), sReb = $('#g4Reb'), sAmp = $('#g4Amp'), sSh = $('#g4Shift');
  const ctlR = $('#g4CtlRates'), ctlS = $('#g4CtlSeasonal');
  const params = () => ({ dip: +sDip.value, rebound: +sReb.value, seasonAmp: +sAmp.value, shiftQ4: +sSh.value });

  function syncModeUI() {
    const mode = radioVal('g4Mode');
    ctlR.classList.toggle('hidden', mode !== 'rates');
    ctlS.classList.toggle('hidden', mode !== 'seasonal');
  }

  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), mode = radioVal('g4Mode'), P = params();
      if (mode === 'rates') {
        const r = M.growthTraps.baseEffects(P);
        const ys = r.series.flatMap(s => [s.qqSAAR, s.yy]);
        const yMin = Math.floor(Math.min(-16, ...ys) / 5) * 5;
        const yMax = Math.ceil(Math.max(12, ...ys) / 5) * 5;
        const f = frame(w, h, [28, 18, 36, narrow ? 40 : 46], 1, 12, yMin, yMax);
        yTicks(c, f, [yMin, 0, yMax], v => fmt(v, 0) + '%');
        axes(c, f, 'Q1–Q12', '%');
        xTicks(c, f, [1, 3, 5, 7, 9, 11], q => 'Q' + q);
        hline(c, f, 0, C.line, [3, 3]);
        path(c, r.series.map(s => [s.q, s.qqSAAR]), f.X, f.Y, C.cyan, 2.2);
        path(c, r.series.map(s => [s.q, s.yy]), f.X, f.Y, C.gold, 2.4);
        const q5 = r.qShock, q9 = r.qEcho;
        drawSafeLabels(c, [
          { x: f.X(5), y: f.Y(q5.qqSAAR), text: t('ch4.cv.qq') + ' ' + fmt(q5.qqSAAR, 1) + '%', col: C.cyan, dy: q5.qqSAAR < 0 ? 14 : -12 },
          { x: f.X(9), y: f.Y(q9.yy), text: t('ch4.cv.yy') + ' ' + fmtSigned(q9.yy, 1) + '%', col: C.gold, dy: -12 }
        ], f);
      } else if (mode === 'seasonal') {
        const r = M.growthTraps.seasonal(P);
        const sub = r.pts.slice(3); // Y2Q1..Y5Q4 (16 pts)
        const ys = sub.flatMap(s => [s.nsaQQ, s.saQQ]);
        const yMin = Math.floor(Math.min(-40, ...ys) / 10) * 10;
        const yMax = Math.ceil(Math.max(40, ...ys) / 10) * 10;
        const f = frame(w, h, [28, 18, 36, narrow ? 40 : 46], 0, sub.length - 1, yMin, yMax);
        yTicks(c, f, [yMin, 0, yMax], v => fmt(v, 0) + '%');
        axes(c, f, 'Y2–Y5', '% SAAR');
        xTicks(c, f, [0, 4, 8, 12, 15], i => sub[i].label);
        hline(c, f, 0, C.line, [3, 3]);
        path(c, sub.map((s, i) => [i, s.nsaQQ]), f.X, f.Y, C.red, 1.8);
        path(c, sub.map((s, i) => [i, s.saQQ]), f.X, f.Y, C.green, 2.5);
        drawSafeLabels(c, [
          { x: f.X(8), y: f.Y(sub[8].nsaQQ), text: t('ch4.cv.nsa'), col: C.red, align: 'left', dx: 12, dy: 6 },
          { x: f.X(6), y: f.Y(sub[6].saQQ), text: t('ch4.cv.sa'), col: C.green, align: 'center', dx: 0, dy: -20 }
        ], f);
      } else {
        const rev = M.growthTraps.vintages();
        const items = [
          { lbl: '2008Q4', v0: rev.episodes['2008Q4'][0].val, v1: rev.episodes['2008Q4'][3].val },
          { lbl: '2020Q2', v0: rev.episodes['2020Q2'][0].val, v1: rev.episodes['2020Q2'][3].val },
          { lbl: '2022Q1', v0: rev.episodes['2022Q1_Q2'][0].q1, v1: rev.episodes['2022Q1_Q2'][2].q1 },
          { lbl: '2022Q2', v0: rev.episodes['2022Q1_Q2'][0].q2, v1: rev.episodes['2022Q1_Q2'][2].q2 }
        ];
        const legAdv = '● ' + t('ch4.cv.adv'), legLat = '● ' + t('ch4.cv.lat');
        const stackLeg = c.measureText(legAdv).width + c.measureText(legLat).width + 24 > w - 20;
        const leftW = Math.max(narrow ? 56 : 70, Math.ceil(Math.max(...items.map(it => c.measureText(it.lbl).width))) + 14), rightPad = 56;
        const f = frame(w, h, [stackLeg ? 44 : 32, rightPad, 24, leftW], -36, 6, 0, items.length);
        c.strokeStyle = C.line; c.lineWidth = 1;
        c.beginPath(); c.moveTo(f.X(0), f.T); c.lineTo(f.X(0), f.B); c.stroke();
        if (stackLeg) {
          c.fillStyle = C.red; c.textAlign = 'left'; c.fillText(legAdv, 12, 13);
          c.fillStyle = C.cyan; c.textAlign = 'left'; c.fillText(legLat, 12, 27);
        } else {
          c.fillStyle = C.red; c.textAlign = 'left'; c.fillText(legAdv, 12, 14);
          c.fillStyle = C.cyan; c.textAlign = 'right'; c.fillText(legLat, w - 10, 14);
        }
        const rowH = (f.B - f.T) / items.length, bh = 15;
        items.forEach((it, i) => {
          const yc = f.T + i * rowH + rowH / 2;
          c.fillStyle = C.ink; c.textAlign = 'right';
          c.fillText(it.lbl, leftW - 6, yc);
          const xZero = f.X(0), xA = f.X(it.v0), xB = f.X(it.v1);
          c.fillStyle = C.red; c.fillRect(Math.min(xZero, xA), yc - bh - 1, Math.max(2, Math.abs(xA - xZero)), bh);
          c.fillStyle = C.cyan; c.fillRect(Math.min(xZero, xB), yc + 2, Math.max(2, Math.abs(xB - xZero)), bh);
          c.fillStyle = it.v0 < -20 ? '#0c0e13' : C.red; c.textAlign = it.v0 < -20 ? 'left' : 'right';
          c.fillText(fmtSigned(it.v0, 2) + '%', it.v0 < -20 ? xA + 5 : xA - 4, yc - bh / 2 - 1);
          c.fillStyle = it.v1 < -20 ? '#0c0e13' : C.cyan; c.textAlign = (it.v1 >= 0 || it.v1 < -20) ? 'left' : 'right';
          c.fillText(fmtSigned(it.v1, 2) + '%', it.v1 >= 0 ? xB + 4 : (it.v1 < -20 ? xB + 5 : xB - 4), yc + bh / 2 + 2);
        });
      }
    },
    text() {
      syncModeUI();
      const mode = radioVal('g4Mode'), P = params();
      put('#g4Dipo', fmtSigned(P.dip, 1) + '%');
      put('#g4Rebo', fmtSigned(P.rebound, 1) + '%');
      put('#g4Ampo', t('common.pct', { v: fmt(P.seasonAmp) }));
      put('#g4Shifto', fmtSigned(P.shiftQ4, 1) + '%');
      if (mode === 'rates') {
        const r = M.growthTraps.baseEffects(P);
        put('#g4AL', t('ch4.ra.a')); put('#g4BL', t('ch4.ra.b')); put('#g4CL', t('ch4.ra.c')); put('#g4DL', t('ch4.ra.d'));
        put('#g4A', fmtSigned(r.steadySAAR, 2) + '%');
        put('#g4B', fmtSigned(r.qShock.qqSAAR, 2) + '%');
        put('#g4C', fmtSigned(r.qShock.yy, 2) + '%');
        put('#g4D', fmtSigned(r.qEcho.yy, 2) + '%');
        putHTML('#g4Say', t('ch4.say.rates', {
          dip: fmtSigned(P.dip, 1), dipS: fmtSigned(r.qShock.qqSAAR, 1),
          st: fmtSigned(r.steadySAAR, 2), echo: fmtSigned(r.qEcho.yy, 2)
        }));
      } else if (mode === 'seasonal') {
        const r = M.growthTraps.seasonal(P);
        put('#g4AL', t('ch4.se.a')); put('#g4BL', t('ch4.se.b')); put('#g4CL', t('ch4.se.c')); put('#g4DL', t('ch4.se.d'));
        put('#g4A', fmtSigned(r.pts[0].trueQQ, 2) + '%');
        put('#g4B', fmtSigned(r.y4q1NsaQQ, 2) + '%');
        put('#g4C', fmtSigned(r.y4q1SaQQ, 2) + '%');
        put('#g4D', fmtSigned(r.y5q4SaQQ, 2) + '%');
        const key = Math.abs(P.shiftQ4) > 0.1 ? 'ch4.say.shift' : 'ch4.say.seasonal';
        putHTML('#g4Say', t(key, {
          nsa: fmtSigned(r.y4q1NsaQQ, 2), sa: fmtSigned(r.y4q1SaQQ, 2),
          sh: fmt(Math.abs(P.shiftQ4), 1), sa5: fmtSigned(r.y5q4SaQQ, 2)
        }));
      } else {
        const rev = M.growthTraps.vintages();
        put('#g4AL', t('ch4.rv.a')); put('#g4BL', t('ch4.rv.b')); put('#g4CL', t('ch4.rv.c')); put('#g4DL', t('ch4.rv.d'));
        put('#g4A', fmtSigned(rev.episodes['2008Q4'][0].val, 2) + '%');
        put('#g4B', fmtSigned(rev.episodes['2008Q4'][3].val, 2) + '%');
        put('#g4C', fmtSigned(rev.episodes['2022Q1_Q2'][0].q2, 2) + '%');
        put('#g4D', fmtSigned(rev.episodes['2022Q1_Q2'][2].q2, 2) + '%');
        putHTML('#g4Say', t('ch4.say.rev'));
      }
    }
  });
  radios('g4Mode').forEach(r => r.addEventListener('change', () => { sim.dirty = true; sim.text(); }));
  [sDip, sReb, sAmp, sSh].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 05 Comparing countries & Lorenz/Gini ───────── */
(() => {
  const cv = $('#g5Cv');
  const sAT = $('#g5AT'), sAN = $('#g5AN'), sTop = $('#g5Top'), sGrow = $('#g5Grow'), cSkew = $('#g5Skew');
  const ctlP = $('#g5CtlPpp'), ctlL = $('#g5CtlLor');
  const params = () => ({ aT: +sAT.value, aN: +sAN.value, topShare: +sTop.value, growth: +sGrow.value, topHeavy: cSkew.checked });

  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), mode = radioVal('g5Mode'), P = params();
      if (mode === 'ppp') {
        const r = M.compare.ppp(P);
        // Top half: Model FX vs PPP (Benchmark = 100); Bottom half: IMF 2026 US / CN / IN
        const splitY = Math.round(h * 0.44);
        const mBars = [
          { lbl: t('ch5.cv.fx'), v: r.gdpFX, col: C.cyan },
          { lbl: t('ch5.cv.ppp'), v: r.gdpPPP, col: C.gold }
        ];
        const imf = M.compare.IMF2026;
        const leftW = Math.ceil(Math.max(
          ...mBars.map(b => c.measureText(b.lbl).width),
          ...imf.map(row => c.measureText(t('ch10.eco.' + row.code.toLowerCase())).width)
        )) + 16, rightPad = 56;
        const maxModel = Math.max(110, r.gdpFX, r.gdpPPP);
        const sc1 = (w - leftW - rightPad) / maxModel;
        mBars.forEach((b, i) => {
          const y = 34 + i * 44;
          c.fillStyle = C.mute; c.textAlign = 'right';
          c.fillText(b.lbl, leftW - 8, y);
          c.fillStyle = b.col;
          c.fillRect(leftW, y - 13, Math.max(2, b.v * sc1), 26);
          c.fillStyle = C.ink; c.textAlign = 'left';
          c.fillText(fmt(b.v, 1), leftW + b.v * sc1 + 6, y);
        });
        c.fillStyle = C.mute; c.textAlign = 'left';
        c.fillText(t('ch5.cv.imf'), 12, splitY + 8);
        const sc2 = (w - leftW - rightPad) / 50;
        const rowH = Math.floor((h - splitY - 30) / imf.length);
        imf.forEach((row, i) => {
          const yc = splitY + 30 + i * rowH + rowH / 2;
          c.fillStyle = C.ink; c.textAlign = 'right';
          c.fillText(t('ch10.eco.' + row.code.toLowerCase()), leftW - 8, yc);
          c.fillStyle = C.cyan; c.fillRect(leftW, yc - 11, row.nomT * sc2, 10);
          c.fillStyle = C.gold; c.fillRect(leftW, yc + 1, row.pppT * sc2, 10);
          c.fillStyle = C.cyan; c.textAlign = 'left';
          c.fillText(fmt(row.nomT, 2), leftW + row.nomT * sc2 + 5, yc - 6);
          c.fillStyle = C.gold;
          c.fillText(fmt(row.pppT, 2), leftW + row.pppT * sc2 + 5, yc + 6);
        });
      } else {
        const r = M.compare.lorenz(P);
        const f = frame(w, h, [28, 20, 36, narrow ? 40 : 46], 0, 1, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%');
        xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100) + '%');
        axes(c, f, t('ch5.cv.axX'), t('ch5.cv.axY'));
        c.setLineDash([4, 4]);
        path(c, [[0, 0], [1, 1]], f.X, f.Y, C.mute, 1.4);
        c.setLineDash([]);
        path(c, r.before.pts, f.X, f.Y, C.cyan, 2.2);
        path(c, r.after.pts, f.X, f.Y, C.gold, 2.5);
        drawSafeLabels(c, [
          { x: f.X(0.45), y: f.Y(0.45), text: t('ch5.cv.eqline'), col: C.mute, align: 'right', dx: -8, dy: -16 },
          { x: f.X(0.65), y: f.Y(r.before.pts[7][1]), text: t('ch5.cv.bef') + ' G=' + fmt(r.before.gini, 3), col: C.cyan, align: 'right', dx: -10, dy: -18 },
          { x: f.X(0.82), y: f.Y(r.after.pts[8][1]), text: t('ch5.cv.aft') + ' G=' + fmt(r.after.gini, 3), col: C.gold, align: 'left', dx: 10, dy: 18 }
        ], f);
      }
    },
    text() {
      const mode = radioVal('g5Mode'), P = params();
      ctlP.classList.toggle('hidden', mode !== 'ppp');
      ctlL.classList.toggle('hidden', mode !== 'lorenz');
      put('#g5ATo', fmt(P.aT, 2)); put('#g5ANo', fmt(P.aN, 2));
      put('#g5Topo', t('common.pct', { v: fmt(P.topShare) }));
      put('#g5Growo', t('common.pct', { v: fmt(P.growth) }));
      if (mode === 'ppp') {
        const r = M.compare.ppp(P);
        put('#g5AL', t('ch5.pp.a')); put('#g5BL', t('ch5.pp.b')); put('#g5CL', t('ch5.pp.c')); put('#g5DL', t('ch5.pp.d'));
        put('#g5A', fmt(r.gdpFX, 1)); put('#g5B', fmt(r.gdpPPP, 1));
        put('#g5C', fmt(r.priceLevel, 2)); put('#g5D', fmt(r.pppBoost, 2) + '×');
        putHTML('#g5Say', t('ch5.say.ppp', {
          at: fmt(r.aT, 2), an: fmt(r.aN, 2), pN: fmt(r.pN, 2), P: fmt(r.priceLevel, 2),
          fx: fmt(r.gdpFX, 1), ppp: fmt(r.gdpPPP, 1), mult: fmt(r.pppBoost, 2)
        }));
      } else {
        const r = M.compare.lorenz(P);
        put('#g5AL', t('ch5.lo.a')); put('#g5BL', t('ch5.lo.b')); put('#g5CL', t('ch5.lo.c')); put('#g5DL', t('ch5.lo.d'));
        put('#g5A', fmtSigned(r.meanPct, 1) + '%'); put('#g5B', fmtSigned(r.medianPct, 1) + '%');
        put('#g5C', fmt(r.before.gini, 3)); put('#g5D', fmt(r.after.gini, 3));
        putHTML('#g5Say', t(P.topHeavy ? 'ch5.say.lorSkew' : 'ch5.say.lorEven', {
          mean: fmt(r.meanPct, 1), med: fmt(r.medianPct, 1),
          g0: fmt(r.before.gini, 3), g1: fmt(r.after.gini, 3)
        }));
      }
    }
  });
  radios('g5Mode').forEach(r => r.addEventListener('change', () => { sim.dirty = true; sim.text(); }));
  [sAT, sAN, sTop, sGrow, cSkew].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 06 Labour market ───────── */
(() => {
  const cv = $('#g6Cv');
  const sDisc = $('#g6Disc'), sPt = $('#g6Pt'), sMatch = $('#g6Match');
  const ctlD = $('#g6CtlDefs'), ctlB = $('#g6CtlBev'), ctlO = $('#g6CtlOkun');
  const params = () => ({ discouraged: +sDisc.value, partTime: +sPt.value, matchEff: +sMatch.value, era: radioVal('g6Era') });

  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), mode = radioVal('g6Mode'), P = params();
      if (mode === 'defs') {
        const r = M.labour.defs(P);
        // Top stacked bar for Pop = 1000; Bottom bars for U-3, U-6, LFPR, E/Pop
        c.fillStyle = C.mute; c.textAlign = 'left';
        c.fillText(t('ch6.cv.pop'), 14, 18);
        const bx = 14, bw = w - 28, by = 32, bh = 32;
        const segs = [
          { v: r.E - r.PT, col: C.green, lbl: 'E' },
          { v: r.PT, col: C.gold, lbl: 'PT' },
          { v: r.U, col: C.red, lbl: 'U' },
          { v: r.M, col: C.violet, lbl: 'M' },
          { v: r.N - r.M, col: C.dimfill, lbl: 'N' }
        ];
        let x = bx;
        for (const sg of segs) {
          const sw = bw * sg.v / r.pop;
          c.fillStyle = sg.col; c.fillRect(x, by, sw, bh);
          if (sw > 18) { c.fillStyle = '#0c0e13'; c.textAlign = 'center'; c.fillText(sg.lbl, x + sw / 2, by + bh / 2); }
          x += sw;
        }
        c.fillStyle = C.mute; c.textAlign = 'left';
        c.fillText(t('ch6.cv.rates'), 14, 92);
        const bars = [
          { lbl: 'U-3', v: r.u3, col: C.cyan },
          { lbl: 'U-6', v: r.u6, col: C.red },
          { lbl: 'LFPR', v: r.lfpr, col: C.gold },
          { lbl: 'E/Pop', v: r.epop, col: C.green }
        ];
        const leftW = narrow ? 54 : 68, rightPad = 56;
        const sc = (w - leftW - rightPad) / 75;
        const topY = 112, rowH = Math.floor((h - topY - 12) / 4), rbh = Math.min(26, rowH - 12);
        bars.forEach((b, i) => {
          const yc = topY + i * rowH + rowH / 2;
          c.fillStyle = C.mute; c.textAlign = 'right';
          c.fillText(b.lbl, leftW - 8, yc);
          c.fillStyle = b.col; c.fillRect(leftW, yc - rbh / 2, Math.max(2, b.v * sc), rbh);
          c.fillStyle = C.ink; c.textAlign = 'left';
          c.fillText(fmt(b.v, 2) + '%', leftW + b.v * sc + 6, yc);
        });
      } else if (mode === 'beveridge') {
        const r = M.labour.beveridge(P);
        const f = frame(w, h, [28, 18, 38, narrow ? 40 : 46], 2, 16, 1, 8.5);
        yTicks(c, f, [2, 4, 6, 8], v => fmt(v) + '%');
        xTicks(c, f, [3, 6, 9, 12, 15], v => fmt(v) + '%');
        axes(c, f, t('ch6.cv.u'), t('ch6.cv.v'));
        // Theoretical curve
        c.setLineDash([5, 4]);
        path(c, r.curve.filter(pt => pt[1] <= 8.5), f.X, f.Y, C.violet, 1.8);
        c.setLineDash([]);
        // Real data path split by era
        const pre = r.data.filter(d => d[0] <= '2019-12');
        const cov = r.data.filter(d => d[0] >= '2019-12' && d[0] <= '2022-03');
        const post = r.data.filter(d => d[0] >= '2022-03');
        path(c, pre.map(d => [d[1], d[2]]), f.X, f.Y, C.dimfill, 1.6);
        path(c, cov.map(d => [d[1], d[2]]), f.X, f.Y, C.gold, 2.0);
        path(c, post.map(d => [d[1], d[2]]), f.X, f.Y, C.cyan, 2.4);
        const pts = {};
        for (const row of r.data) if (['2019-12', '2020-04', '2022-03', '2026-09'].includes(row[0])) pts[row[0]] = row;
        const marks = [
          { d: pts['2019-12'], col: C.mute, dx: 0, dy: 12 },
          { d: pts['2020-04'], col: C.red, dx: 0, dy: -12 },
          { d: pts['2022-03'], col: C.gold, dx: 0, dy: -12 },
          { d: pts['2026-09'], col: C.cyan, align: 'left', dx: 10, dy: 2 }
        ].filter(m => m.d);
        marks.forEach(m => {
          c.fillStyle = m.col; c.beginPath(); c.arc(f.X(m.d[1]), f.Y(m.d[2]), 4.5, 0, 6.283); c.fill();
        });
        drawSafeLabels(c, marks.map(m => ({ x: f.X(m.d[1]), y: f.Y(m.d[2]), text: m.d[0], col: m.col, align: m.align, dx: m.dx, dy: m.dy })), f);
      } else {
        const r = M.labour.okun(P);
        const f = frame(w, h, [28, 18, 38, narrow ? 42 : 48], -6, 10, -4, 6);
        yTicks(c, f, [-4, -2, 0, 2, 4, 6], v => fmt(v) + 'pp');
        xTicks(c, f, [-4, 0, 4, 8], v => fmt(v) + '%');
        axes(c, f, t('ch6.cv.gy'), t('ch6.cv.du'));
        hline(c, f, 0, C.line, [3, 3]);
        const gx0 = f.X(0); c.strokeStyle = C.line; c.beginPath(); c.moveTo(gx0, f.T); c.lineTo(gx0, f.B); c.stroke();
        // Faint all points, bright active points
        const all = M.data ? M.data.okun : [];
        c.fillStyle = 'rgba(163,170,184,0.22)';
        for (const [, gx, du] of all) {
          if (gx < -6 || gx > 10 || du < -4 || du > 6) continue;
          c.beginPath(); c.arc(f.X(gx), f.Y(du), 2.3, 0, 6.283); c.fill();
        }
        c.fillStyle = C.cyan;
        for (const [, gx, du] of r.pts) {
          if (gx < -6 || gx > 10 || du < -4 || du > 6) continue;
          c.beginPath(); c.arc(f.X(gx), f.Y(du), 3.0, 0, 6.283); c.fill();
        }
        const yAt = x => M.clamp(r.intercept + r.slope * x, -4, 6);
        path(c, [[-5, yAt(-5)], [9, yAt(9)]], f.X, f.Y, C.gold, 2.5);
        drawSafeLabels(c, [
          { x: f.R - 10, y: f.T + 14, text: 'β=' + fmt(r.slope, 2) + '  R²=' + fmt(r.r2, 2), col: C.gold, align: 'right', dx: 0, dy: 0 }
        ], f);
      }
    },
    text() {
      const mode = radioVal('g6Mode'), P = params();
      ctlD.classList.toggle('hidden', mode !== 'defs');
      ctlB.classList.toggle('hidden', mode !== 'beveridge');
      ctlO.classList.toggle('hidden', mode !== 'okun');
      put('#g6Disco', fmt(P.discouraged)); put('#g6Pto', fmt(P.partTime)); put('#g6Matcho', fmt(P.matchEff, 2));
      if (mode === 'defs') {
        const r = M.labour.defs(P);
        put('#g6AL', t('ch6.df.a')); put('#g6BL', t('ch6.df.b')); put('#g6CL', t('ch6.df.c')); put('#g6DL', t('ch6.df.d'));
        put('#g6A', fmt(r.u3, 2) + '%'); put('#g6B', fmt(r.u6, 2) + '%');
        put('#g6C', fmt(r.lfpr, 2) + '%'); put('#g6D', fmt(r.epop, 2) + '%');
        const key = P.discouraged > 0 ? 'ch6.say.defsDisc' : (P.partTime > 0 ? 'ch6.say.defsPt' : 'ch6.say.defsBase');
        putHTML('#g6Say', t(key, {
          disc: fmt(P.discouraged), pt: fmt(P.partTime),
          u3: fmt(r.u3, 2), u6: fmt(r.u6, 2), lfpr: fmt(r.lfpr, 2), epop: fmt(r.epop, 2)
        }));
      } else if (mode === 'beveridge') {
        const r = M.labour.beveridge(P);
        put('#g6AL', t('ch6.bv.a')); put('#g6BL', t('ch6.bv.b')); put('#g6CL', t('ch6.bv.c')); put('#g6DL', t('ch6.bv.d'));
        const last = r.data[r.data.length - 1] || ['—', 4.2, 4.5];
        put('#g6A', fmt(last[1], 1) + '%'); put('#g6B', fmt(last[2], 1) + '%');
        put('#g6C', '7.5%'); put('#g6D', fmt(r.vAt4, 2) + '%');
        putHTML('#g6Say', t('ch6.say.bev'));
      } else {
        const r = M.labour.okun(P);
        put('#g6AL', t('ch6.ok.a')); put('#g6BL', t('ch6.ok.b')); put('#g6CL', t('ch6.ok.c')); put('#g6DL', t('ch6.ok.d'));
        put('#g6A', fmt(r.slope, 2)); put('#g6B', fmt(r.zeroGrowth, 2) + '%');
        put('#g6C', fmt(r.r2, 2)); put('#g6D', fmt(r.n));
        putHTML('#g6Say', t('ch6.say.okun', {
          era: t('ch6.era.' + P.era), n: fmt(r.n), absb: fmt(Math.abs(r.slope), 2),
          zg: fmt(r.zeroGrowth, 2), r2: fmt(r.r2, 2)
        }));
      }
    }
  });
  radios('g6Mode').forEach(r => r.addEventListener('change', () => { sim.dirty = true; sim.text(); }));
  radios('g6Era').forEach(r => r.addEventListener('change', () => { sim.dirty = true; sim.text(); }));
  [sDisc, sPt, sMatch].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 07 Business cycle & Sahm rule ───────── */
(() => {
  const cv = $('#g7Cv');
  const sTh = $('#g7Thresh'), cZm = $('#g7Zoom'), ctlS = $('#g7CtlSahm');
  const params = () => ({ thresh: +sTh.value, window: cZm.checked ? 'recent' : 'all' });

  const sim = reg(cv, {
    draw() {
      const { c, w, h, narrow } = fit(cv), mode = radioVal('g7Mode'), P = params();
      if (mode === 'sahm') {
        const r = M.cycle.sahm(P);
        const s = r.series;
        const yMax = Math.ceil(Math.max(4.0, ...s.map(x => x.sahm)) * 1.05);
        const f = frame(w, h, [28, 18, 36, narrow ? 38 : 44], 0, s.length - 1, -0.4, yMax);
        // Recession bands
        c.fillStyle = 'rgba(240,122,109,0.16)';
        let inR = false, r0 = 0;
        for (let i = 0; i < s.length; i++) {
          if (s[i].rec === 1 && !inR) { inR = true; r0 = i; }
          if ((s[i].rec === 0 || i === s.length - 1) && inR) {
            inR = false;
            c.fillRect(f.X(r0), f.T, Math.max(2, f.X(i) - f.X(r0)), f.B - f.T);
          }
        }
        yTicks(c, f, yMax > 6 ? [0, 2, 5, 8, 10] : [0, 1, 2, 3, 4], v => fmt(v, 0));
        const step = Math.max(1, Math.floor(s.length / 5));
        const ticks = []; for (let i = 0; i < s.length; i += step) ticks.push(i);
        xTicks(c, f, ticks, i => s[i].date.slice(0, 4));
        axes(c, f, '', t('ch7.cv.sahm'));
        hline(c, f, P.thresh, C.gold, [5, 4]);
        path(c, s.map((pt, i) => [i, pt.sahm]), f.X, f.Y, C.cyan, 1.9);
        // Highlight false positives visible in view
        const fpItems = [{ x: f.R - 6, y: f.Y(P.thresh), text: fmt(P.thresh, 2), col: C.gold, align: 'right', dx: 0, dy: -10 }];
        for (const fp of r.falsePositives) {
          const idx = s.findIndex(pt => pt.date === fp.date);
          if (idx >= 0) {
            c.fillStyle = C.red; c.beginPath(); c.arc(f.X(idx), f.Y(s[idx].sahm), 4, 0, 6.283); c.fill();
            fpItems.push({ x: f.X(idx), y: f.Y(s[idx].sahm), text: fp.date, col: C.red, align: fp.date > '2020' ? 'right' : 'center', dx: fp.date > '2020' ? -4 : 0, dy: -16 });
          }
        }
        drawSafeLabels(c, fpItems, f);
      } else {
        const g = M.cycle.gap();
        const pts = g.pts;
        const ys = pts.flatMap(p => [p.act, p.pot26, p.pot19].filter(v => v != null));
        const yMin = Math.floor(Math.min(...ys) / 1000) * 1000;
        const yMax = Math.ceil(Math.max(...ys) / 1000) * 1000;
        const f = frame(w, h, [28, 18, 36, narrow ? 44 : 52], 0, pts.length - 1, yMin, yMax);
        yTicks(c, f, [yMin, (yMin + yMax) / 2, yMax], v => fmt(v / 1000, 0) + 'T');
        const ticks = []; for (let i = 0; i < pts.length; i += 16) ticks.push(i);
        xTicks(c, f, ticks, i => pts[i].q.slice(0, 4));
        axes(c, f, '2007–2026', t('ch7.cv.yunit'));
        path(c, pts.map((p, i) => [i, p.act]), f.X, f.Y, C.cyan, 2.3);
        path(c, pts.map((p, i) => [i, p.pot26]), f.X, f.Y, C.gold, 2.0);
        c.setLineDash([4, 4]);
        const p19Pts = pts.map((p, i) => p.pot19 ? [i, p.pot19] : null).filter(Boolean);
        path(c, p19Pts, f.X, f.Y, C.red, 2.0);
        c.setLineDash([]);
        const lastIdx = pts.length - 1;
        const i15 = pts.findIndex(p => p.q === '2015Q1');
        const i23 = pts.findIndex(p => p.q === '2023Q1');
        drawSafeLabels(c, [
          { x: f.X(lastIdx), y: f.Y(pts[lastIdx].act), text: t('ch7.cv.act'), col: C.cyan, align: 'right', dx: -4, dy: -16 },
          { x: f.X(i15), y: f.Y(pts[i15].pot26), text: t('ch7.cv.p26'), col: C.gold, align: 'right', dx: -4, dy: -16 },
          { x: f.X(lastIdx), y: f.Y(pts[lastIdx].pot19), text: t('ch7.cv.p19'), col: C.red, align: 'right', dx: -4, dy: 18 }
        ], f);
      }
    },
    text() {
      const mode = radioVal('g7Mode'), P = params();
      ctlS.classList.toggle('hidden', mode !== 'sahm');
      put('#g7Thresho', fmt(P.thresh, 2) + ' pp');
      if (mode === 'sahm') {
        const r = M.cycle.sahm(P);
        const hitRec = r.triggers.filter(x => x.inRec).length;
        put('#g7AL', t('ch7.sm.a')); put('#g7BL', t('ch7.sm.b')); put('#g7CL', t('ch7.sm.c')); put('#g7DL', t('ch7.sm.d'));
        put('#g7A', fmt(r.triggers.length)); put('#g7B', fmt(hitRec));
        put('#g7C', fmt(r.falsePositives.length)); put('#g7D', fmt(r.latest.sahm, 2) + ' pp');
        const fpList = r.falsePositives.length ? r.falsePositives.map(x => x.date).join(', ') : t('ch7.say.none');
        putHTML('#g7Say', t('ch7.say.sahm', {
          th: fmt(P.thresh, 2), tot: fmt(r.triggers.length), hit: fmt(hitRec),
          fp: fmt(r.falsePositives.length), fpList, latestDate: r.latest.date, cur: fmt(r.latest.sahm, 2)
        }));
      } else {
        const g = M.cycle.gap(), L = g.latest;
        put('#g7AL', t('ch7.gp.a')); put('#g7BL', t('ch7.gp.b')); put('#g7CL', t('ch7.gp.c')); put('#g7DL', t('ch7.gp.d'));
        put('#g7A', fmt(L.act, 1)); put('#g7B', fmt(L.pot26, 1));
        put('#g7C', fmtSigned(L.gap26, 2) + '%'); put('#g7D', fmtSigned(L.gap19, 2) + '%');
        putHTML('#g7Say', t('ch7.say.gap', {
          q19Raw: fmt(g.q19.pot19Raw, 0), q19Reb: fmt(g.q19.pot19, 0), q19New: fmt(g.q19.pot26, 0),
          g26: fmt(L.gap26, 2), g19: fmt(L.gap19, 2)
        }));
      }
    }
  });
  radios('g7Mode').forEach(r => r.addEventListener('change', () => { sim.dirty = true; sim.text(); }));
  [sTh, cZm].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 08 Solow growth accounting ───────── */
(() => {
  const cv = $('#g8Cv');
  const sA = $('#g8Alpha'), cAuto = $('#g8AutoA'), cHC = $('#g8HC');
  const params = () => {
    const [y0, y1] = radioVal('g8Per').split('-').map(Number);
    return { y0, y1, alphaMode: cAuto.checked ? 'auto' : 'manual', alpha: +sA.value, adjustHC: cHC.checked };
  };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.solow.compute(params());
      const bars = [
        { lbl: t('ch8.cv.gy'), v: r.gY, col: C.cyan },
        { lbl: t('ch8.cv.cap'), v: r.capContrib, col: C.gold },
        { lbl: t('ch8.cv.lab'), v: r.labContrib, col: C.green },
        ...(r.hcContrib > 0 ? [{ lbl: t('ch8.cv.hc'), v: r.hcContrib, col: '#5588aa' }] : []),
        { lbl: t('ch8.cv.tfp'), v: r.tfpShown, col: C.violet }
      ];
      const leftW = Math.ceil(Math.max(...bars.map(b => c.measureText(b.lbl).width))) + 16, rightPad = 56;
      const maxV = Math.max(4.8, ...bars.map(b => b.v + 0.5));
      const f = frame(w, h, [22, rightPad, 22, leftW], 0, maxV, 0, bars.length);
      const rowH = (f.B - f.T) / bars.length, bh = Math.min(28, rowH - 14);
      bars.forEach((b, i) => {
        const yc = f.T + i * rowH + rowH / 2;
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(b.lbl, leftW - 8, yc);
        const bw = Math.max(2, f.X(Math.max(0, b.v)) - f.X(0));
        c.fillStyle = b.col; c.fillRect(f.X(0), yc - bh / 2, bw, bh);
        c.fillStyle = C.ink; c.textAlign = 'left';
        c.fillText(fmt(b.v, 2) + '%', f.X(0) + bw + 6, yc);
      });
    },
    text() {
      const P = params(), r = M.solow.compute(P);
      if (cAuto.checked) sA.value = r.autoAlpha.toFixed(2);
      sA.disabled = cAuto.checked;
      put('#g8Alphao', fmt(r.alpha, 2));
      put('#g8Gy', fmt(r.gY, 2) + '%');
      put('#g8Cap', fmt(r.capContrib, 2) + '%');
      put('#g8Lab', fmt(r.labContrib, 2) + '%');
      put('#g8Tfp', fmt(r.tfpShown, 2) + '%');
      const perLbl = `${r.y0}–${r.y1}`;
      const key = P.adjustHC ? 'ch8.say.hc' : 'ch8.say.base';
      putHTML('#g8Say', t(key, {
        per: perLbl, gy: fmt(r.gY, 2), kl: fmt(r.capContrib + r.labContrib, 2),
        tfp: fmt(r.tfpShown, 2), sh: fmt(r.tfpSharePct, 0), lp: fmt(r.gLP, 2),
        hc: fmt(r.hcContrib, 2), raw: fmt(r.rawTFP, 2)
      }));
    }
  });
  radios('g8Per').forEach(r => r.addEventListener('change', () => { sim.dirty = true; sim.text(); }));
  [sA, cAuto, cHC].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 09 What GDP leaves out ───────── */
(() => {
  const cv = $('#g9Cv');
  const sH = $('#g9Home'), sD = $('#g9Dis'), cDep = $('#g9Depr'), cEnv = $('#g9Env');
  const params = () => ({ marketize: +sH.value, disaster: +sD.value, showDepr: cDep.checked, showEnv: cEnv.checked });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.beyond.compute(params());
      const bars = [
        { lbl: t('ch9.cv.gdp'), v: r.gdp, col: C.cyan },
        { lbl: t('ch9.cv.svc'), v: r.totalServices, col: C.gold },
        { lbl: t('ch9.cv.adj'), v: r.adjusted, col: C.green }
      ];
      const leftW = Math.ceil(Math.max(...bars.map(b => c.measureText(b.lbl).width))) + 16, rightPad = 48;
      const maxV = Math.max(145, ...bars.map(b => b.v + 12));
      const f = frame(w, h, [26, rightPad, 24, leftW], 0, maxV, 0, bars.length);
      const rowH = (f.B - f.T) / bars.length, bh = Math.min(34, rowH - 18);
      bars.forEach((b, i) => {
        const yc = f.T + i * rowH + rowH / 2;
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(b.lbl, leftW - 8, yc);
        const bw = Math.max(2, f.X(b.v) - f.X(0));
        c.fillStyle = b.col; c.fillRect(f.X(0), yc - bh / 2, bw, bh);
        c.fillStyle = C.ink; c.textAlign = 'left';
        c.fillText(fmt(b.v, 1), f.X(0) + bw + 6, yc);
      });
    },
    text() {
      const P = params(), r = M.beyond.compute(P);
      put('#g9Homeo', fmt(P.marketize)); put('#g9Diso', fmt(P.disaster));
      put('#g9Gdp', fmt(r.gdp, 1)); put('#g9Svc', fmt(r.totalServices, 1));
      put('#g9Adj', fmt(r.adjusted, 1)); put('#g9Wealth', fmtSigned(r.netWealthDelta, 1));
      let key = 'ch9.say.base';
      if (P.disaster > 0) key = 'ch9.say.dis';
      else if (P.marketize > 0) key = 'ch9.say.home';
      else if (P.showDepr || P.showEnv) key = 'ch9.say.ded';
      const ded = (P.showDepr ? r.deprTotal : 0) + r.envCost;
      putHTML('#g9Say', t(key, {
        home: fmt(P.marketize), unpaid: fmt(r.unpaidHome, 0), gdp: fmt(r.gdp, 1), svc: fmt(r.totalServices, 1),
        dis: fmt(P.disaster), reb: fmt(r.rebuild, 1), loss: fmt(Math.abs(r.netWealthDelta), 1),
        ded: fmt(ded, 1), adj: fmt(r.adjusted, 1)
      }));
    }
  });
  [sH, sD, cDep, cEnv].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

/* ───────── 10 Frontier: Survey Nonresponse + Table ───────── */
(() => {
  const cv = $('#g10Cv');
  const sResp = $('#g10Resp'), sBias = $('#g10Bias');
  const params = () => ({ respRate: +sResp.value, nonrespBias: +sBias.value });

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), P = params();
      const r = M.frontierModel.surveyError(P);
      const bars = [
        { lbl: t('ch10.cv.se'), v: r.se, col: C.cyan },
        { lbl: t('ch10.cv.bias'), v: r.bias, col: C.gold },
        { lbl: t('ch10.cv.rmse'), v: r.rmse, col: C.red }
      ];
      const leftW = Math.ceil(Math.max(...bars.map(b => c.measureText(b.lbl).width))) + 16, rightPad = 56;
      const maxV = Math.max(3.6, ...bars.map(b => b.v + 0.5));
      const f = frame(w, h, [26, rightPad, 24, leftW], 0, maxV, 0, 3);
      const rowH = (f.B - f.T) / 3, bh = Math.min(28, rowH - 16);
      bars.forEach((b, i) => {
        const yc = f.T + i * rowH + rowH / 2;
        c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(b.lbl, leftW - 8, yc);
        const bw = Math.max(2, f.X(b.v) - f.X(0));
        c.fillStyle = b.col; c.fillRect(f.X(0), yc - bh / 2, bw, bh);
        c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(fmt(b.v, 2) + ' pp', f.X(0) + bw + 6, yc);
      });
    },
    text() {
      const P = params(), r = M.frontierModel.surveyError(P);
      put('#g10Respo', t('common.pct', { v: fmt(P.respRate) }));
      put('#g10Biaso', t('common.pp', { v: fmt(P.nonrespBias, 1) }));
      put('#g10A', fmt(r.nActual, 0)); put('#g10B', fmt(r.se, 2) + ' pp');
      put('#g10C', fmt(r.bias, 2) + ' pp'); put('#g10D', fmt(r.rmse, 2) + ' pp');
      putHTML('#g10Say', t('ch10.say.survey', {
        resp: fmt(r.respPct, 0), n: fmt(r.nActual, 0), se: fmt(r.se, 2),
        b0: fmt(P.nonrespBias, 1), bias: fmt(r.bias, 2), rmse: fmt(r.rmse, 2)
      }));
    }
  });
  [sResp, sBias].forEach(el => el.addEventListener('input', () => { sim.dirty = true; sim.text(); }));
  sim.text();
})();

function renderFrontierTable() {
  const wrap = $('#frTableWrap');
  if (!wrap || !M.FRONTIER) return;
  const rows = M.FRONTIER.economies.map(e => {
    const gdpNote = t('ch10.note.' + e.gdpNote);
    const inflIdx = t('ch10.infl.' + e.inflIdx);
    const inflAlt = e.inflAlt != null ? `<small>${t('ch10.inflAlt.' + e.id)}</small>` : '';
    const uDef = t('ch10.uDef.' + e.uDef);
    const prod = e.prod != null ? t('ch10.prod.us') : t('ch10.prod.none');
    return `<tr>
      <td><strong>${t('ch10.eco.' + e.id)}</strong><small>${M.FRONTIER.asOf}</small></td>
      <td class="n">${fmtSigned(e.gdpGrowth, e.id === 'us' ? 2 : 1)}%<small>${e.gdpDate} · ${gdpNote}</small></td>
      <td class="n">${fmt(e.infl, e.id === 'us' || e.id === 'in' ? 2 : 1)}%<small>${e.inflDate} · ${inflIdx}</small>${inflAlt}</td>
      <td class="n">${fmt(e.u, 1)}%<small>${e.uDate} · ${uDef}</small></td>
      <td>${prod}</td>
    </tr>`;
  }).join('');
  wrap.innerHTML = `<table id="frTable"><thead><tr>
    <th>${t('ch10.tbl.h1')}</th><th>${t('ch10.tbl.h2')}</th><th>${t('ch10.tbl.h3')}</th><th>${t('ch10.tbl.h4')}</th><th>${t('ch10.tbl.h5')}</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
}

/* ───────── apply language & loop ───────── */
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  renderFrontierTable();
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}

document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  writeLang(lang);
  applyLang();
}));

function tick() {
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}

applyLang();
requestAnimationFrame(tick);
window.__essayReady = true;
})();
