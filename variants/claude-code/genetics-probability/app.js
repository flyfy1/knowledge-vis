'use strict';
// Genetics & probability lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every square, bar, curve and readout comes from window.GENE_MODEL (model.js). Canvas text is
// limited to panel titles, allele letters, fractions and axis ticks; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.GENE_MODEL;
const t = (...a) => window.GENE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', white: '#e8edf4', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', panel: '#152131', grey: '#7d8ca0', ink: '#0a0e14' };
const PHCOL = { AB: C.violet, Ab: C.pink, aB: C.cyan, ab: C.grey };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (toFixed(0) of 90 stays "90").
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (p, d = 1) => fmt(p * 100, d) + '%';
const fs = M.fstr;

function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = Math.round(heightFor ? heightFor(width) : Number(canvas.dataset.h));
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// One-line label that shrinks its font until it fits maxW (never overflows).
function label(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left', base = 'alphabetic' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function chip(ctx, X, Y, r, letter, { alpha = 1 } = {}) {
  const dom = letter === letter.toUpperCase();
  const col = 'Aa'.includes(letter) ? (dom ? C.violet : C.white) : (dom ? C.green : C.orange);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore();
  label(ctx, letter, X, Y + 0.5, r * 1.6, { size: Math.round(r * 1.15), weight: 700, color: C.ink, align: 'center', base: 'middle' });
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function axesY(ctx, P, ticks, yMax, fmtTick) {
  const y = v => P.b - v / yMax * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  ticks.forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmtTick(v), P.l - 6, y(v) + 4); });
  ctx.restore(); return y;
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }
const pressed = (ids, on) => ids.forEach(id => $(id).setAttribute('aria-pressed', id === on));

/* ---------- step 0: segregation, one gamete at a time ---------- */
const CAP0 = 2000;
const s0 = { g: 'Aa', seq: [], rand: M.rng(11), slide: 1 };
function draw0() {
  const g = s0.g, n = s0.seq.length, nA = s0.seq.filter(a => a === 'A').length, theory = M.gameteProbs(g).A || 0;
  pressed(['g0AA', 'g0Aa', 'g0aa'], 'g0' + g);
  $('one0').disabled = $('fifty0').disabled = n >= CAP0;
  const { ctx, W, H } = fitCanvas($('c0'));
  label(ctx, t('c0top', { g }), 8, 18, W - 16);
  // parent cell with its two alleles
  ctx.save(); ctx.strokeStyle = C.axis; ctx.fillStyle = C.panel; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(48, 74, 34, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  chip(ctx, 34, 74, 12, g[0]); chip(ctx, 62, 74, 12, g[1]);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(88, 74); ctx.lineTo(102, 74); ctx.lineTo(97, 69); ctx.moveTo(102, 74); ctx.lineTo(97, 79); ctx.stroke(); ctx.restore();
  const x0 = 122, step = 26, slots = Math.max(1, Math.floor((W - x0 - 4) / step) + 1);
  if (!n) label(ctx, t('c0empty'), x0 - 10, 78, W - x0, { size: 12, weight: 400, color: C.muted });
  for (let i = 0; i < Math.min(slots, n); i++) {
    const a = s0.seq[n - 1 - i];
    const X = i === 0 ? 48 + (x0 - 48) * s0.slide : x0 + i * step;
    chip(ctx, X, 74, 11, a, { alpha: i === 0 ? 1 : Math.max(0.35, 1 - i * 0.04) });
  }
  // running share of A
  label(ctx, t('c0bot', { theory: pct(theory, 0) }), 8, 148, W - 16);
  const P = { l: 44, r: W - 12, t: 160, b: H - 30 };
  const y = axesY(ctx, P, [0, 0.25, 0.5, 0.75, 1], 1, v => Math.round(v * 100) + '%');
  const xMax = Math.max(20, n), x = v => P.l + v / xMax * (P.r - P.l);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const stepX = [5, 10, 20, 50, 100, 200, 500, 1000].find(s => s / xMax * (P.r - P.l) >= 44) || 1000;
  for (let v = 0; v <= xMax + 1e-9; v += stepX) ctx.fillText(String(v), x(v), P.b + 15);
  ctx.textAlign = 'right'; ctx.fillText(t('axGametes'), P.r, P.b + 28); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.white; ctx.globalAlpha = 0.7; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(P.l, y(theory)); ctx.lineTo(P.r, y(theory)); ctx.stroke(); ctx.restore();
  if (n) {
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); let cA = 0;
    s0.seq.forEach((a, i) => { if (a === 'A') cA++; const X = x(i + 1), Y = y(cA / (i + 1)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x(n), y(nA / n), 4.5, 0, 7); ctx.fill(); ctx.restore();
  }
  $('r0').textContent = n ? t('s0readout', { g, n, nA, na: n - nA, share: pct(nA / n), theory: pct(theory, 0) }) : t('s0readout0', { g, theory: pct(theory, 0), theoryA: pct(1 - theory, 0) });
}
function addGametes(k) {
  for (let i = 0; i < k && s0.seq.length < CAP0; i++) s0.seq.push(M.drawGamete(s0.g, s0.rand));
}

/* ---------- Punnett square helper ---------- */
// rows/cols: arrays of gamete strings; cell(i, j, x, y, w, h) draws the body; returns geometry.
function square(ctx, X, Y, size, rows, cols, cell) {
  const hb = Math.max(26, Math.min(44, size * 0.16)), cw = (size - hb) / cols.length, ch = (size - hb) / rows.length;
  const chipR = Math.min(11, hb * 0.3, cw / (cols[0].length * 2.6));
  const chips = (str, cx, cy) => { const n = str.length; [...str].forEach((a, q) => chip(ctx, cx + (q - (n - 1) / 2) * chipR * 2.2, cy, chipR, a)); };
  cols.forEach((g, j) => chips(g, X + hb + (j + 0.5) * cw, Y + hb / 2));
  rows.forEach((g, i) => chips(g, X + hb / 2, Y + hb + (i + 0.5) * ch));
  rows.forEach((_, i) => cols.forEach((__, j) => cell(i, j, X + hb + j * cw, Y + hb + i * ch, cw, ch)));
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
  for (let j = 0; j <= cols.length; j++) { ctx.beginPath(); ctx.moveTo(X + hb + j * cw, Y + hb); ctx.lineTo(X + hb + j * cw, Y + size); ctx.stroke(); }
  for (let i = 0; i <= rows.length; i++) { ctx.beginPath(); ctx.moveTo(X + hb, Y + hb + i * ch); ctx.lineTo(X + size, Y + hb + i * ch); ctx.stroke(); }
  ctx.restore();
  return { hb, cw, ch };
}

/* ---------- step 1: monohybrid Punnett square ---------- */
const s1 = { g1: 'Aa', g2: 'Aa' };
function layout1(W) {
  const wide = W >= 620, size = wide ? Math.min(300, W * 0.42) : Math.min(W - 24, 280);
  if (wide) return { wide, size, sx: 12, sy: 34, bx: 12 + size + 40, by: 34, bw: W - (12 + size + 40) - 14, H: Math.max(34 + size + 14, 290) };
  const by = 34 + size + 30;
  return { wide, size, sx: (W - size) / 2, sy: 34, bx: 12, by, bw: W - 26, H: by + 250 };
}
function hbars(ctx, X, Y, w, title, items) {
  label(ctx, title, X, Y, w);
  const lw = 54, vw = 40, bw = w - lw - vw - 8;
  items.forEach((it, q) => {
    const yy = Y + 14 + q * 34;
    label(ctx, it.name, X, yy + 16, lw - 6, { weight: 600, color: C.text, size: 12 });
    ctx.fillStyle = '#1b2a3b'; ctx.fillRect(X + lw, yy + 4, bw, 18);
    ctx.fillStyle = it.color; ctx.fillRect(X + lw, yy + 4, bw * it.v, 18);
    label(ctx, it.val, X + lw + bw + 8, yy + 17, vw, { weight: 700, size: 12 });
  });
}
function draw1() {
  pressed(['pa1AA', 'pa1Aa', 'pa1aa'], 'pa1' + s1.g1); pressed(['pb1AA', 'pb1Aa', 'pb1aa'], 'pb1' + s1.g2);
  const { ctx, W } = fitCanvas($('c1'), W => layout1(W).H), L = layout1(W);
  const P = M.punnett(s1.g1, s1.g2), X = M.cross(s1.g1, s1.g2);
  label(ctx, t('c1sq', { g1: s1.g1, g2: s1.g2 }), L.sx, 18, L.wide ? L.size : W - 2 * L.sx);
  square(ctx, L.sx, L.sy, L.size, P.rows, P.cols, (i, j, x, y, w, h) => {
    const g = P.cells[i * 2 + j].g, dom = M.dominantShown(g);
    ctx.fillStyle = dom ? 'rgba(183,156,255,0.32)' : 'rgba(232,237,244,0.16)'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    label(ctx, g, x + w / 2, y + h / 2 - 2, w - 8, { size: 18, weight: 700, color: dom ? C.violet : C.white, align: 'center' });
    label(ctx, '1/4', x + w / 2, y + h / 2 + 18, w - 8, { size: 11, weight: 400, color: C.muted, align: 'center' });
  });
  hbars(ctx, L.bx, L.by + 12, L.bw, t('c1geno'), X.keys.map(k => ({ name: k, v: X.geno[k].v, val: fs(X.geno[k]), color: M.dominantShown(k) ? C.violet : C.white })));
  hbars(ctx, L.bx, L.by + 150, L.bw, t('c1pheno'), [{ name: t('purple'), v: X.dom.v, val: fs(X.dom), color: C.violet }, { name: t('white'), v: X.rec.v, val: fs(X.rec), color: C.white }]);
  const q = k => Math.round(X.geno[k].v * 4);
  $('r1').textContent = t('s1readout', { g1: s1.g1, g2: s1.g2, gAA: fs(X.geno.AA), gAa: fs(X.geno.Aa), gaa: fs(X.geno.aa), dom: fs(X.dom), rec: fs(X.rec), cAA: q('AA'), cAa: q('Aa'), caa: q('aa'), cdom: Math.round(X.dom.v * 4), crec: Math.round(X.rec.v * 4) });
}

/* ---------- step 2: a small batch of offspring ---------- */
const s2 = { hist: [], rand: M.rng(2026) };
function draw2() {
  const n = num('n2'), pmf = M.binomPMF(n, 0.25);
  $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  label(ctx, t('c2title', { n }), 8, 18, W - 16);
  const f = s2.hist.length, sim = pmf.map((_, k) => (f ? s2.hist.filter(v => v === k).length / f : 0));
  const top = Math.max(...pmf, ...sim), yMax = [0.25, 0.5, 0.75, 1].find(v => v >= top + 0.04) || 1;
  const P = { l: 44, r: W - 12, t: 44, b: H - 44 };
  const y = axesY(ctx, P, [0, yMax / 2, yMax], yMax, v => Math.round(v * 100) + '%');
  const slot = (P.r - P.l) / (n + 1), bw = Math.min(46, slot * 0.66);
  pmf.forEach((p, k) => {
    const cx = P.l + slot * (k + 0.5);
    ctx.fillStyle = C.violet; ctx.globalAlpha = 0.85; ctx.fillRect(cx - bw / 2, y(p), bw, P.b - y(p)); ctx.globalAlpha = 1;
    label(ctx, String(k), cx, P.b + 16, slot, { size: 11, weight: 400, color: C.muted, align: 'center' });
    if (slot >= 40) label(ctx, pct(p), cx, Math.min(y(p), f ? y(sim[k]) - 6 : y(p)) - 6, slot - 2, { size: 11, weight: 600, align: 'center' });
    if (f) { ctx.fillStyle = C.orange; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, y(sim[k]), 5, 0, 7); ctx.fill(); ctx.stroke(); }
  });
  label(ctx, t('axK'), P.r, P.b + 32, W / 2, { size: 11, weight: 400, color: C.muted, align: 'right' });
  const mode = pmf.indexOf(Math.max(...pmf));
  const quarter = n % 4 === 0 ? t('s2quarter', { k: n / 4, pq: pct(pmf[n / 4]) }) : t('s2noQuarter', { n });
  const simTxt = f ? t('s2sim', { f, mean: fmt(s2.hist.reduce((a, b) => a + b, 0) / f, 2), th: fmt(n / 4, 2) }) : '';
  $('r2').textContent = t('s2readout', { n, mode, pm: pct(pmf[mode]), p0: pct(pmf[0]), quarter, sim: simTxt });
}

/* ---------- step 3: two genes, 16 cells and the product rule ---------- */
const s3 = { a: 0, b: 0 };
const parents3 = () => { const A = M.CROSSES_A[s3.a], B = M.CROSSES_B[s3.b]; return [{ A: A[0], B: B[0] }, { A: A[1], B: B[1] }]; };
const pname = p => p.A + p.B;
function draw3() {
  pressed(['xa0', 'xa1', 'xa2'], 'xa' + s3.a); pressed(['xb0', 'xb1', 'xb2'], 'xb' + s3.b);
  const [p1, p2] = parents3(), D = M.dihybrid(p1, p2), PR = M.productRule(p1, p2);
  const sizeFor = W => Math.min(W - 24, 440);
  let { ctx, W } = fitCanvas($('c3'), W => 30 + sizeFor(W) + 10);
  const size = sizeFor(W), sx = W >= 620 ? 12 : (W - size) / 2;
  label(ctx, t('c3sq', { p1: pname(p1), p2: pname(p2) }), sx, 18, W - 2 * sx);
  square(ctx, sx, 30, size, D.rows, D.cols, (i, j, x, y, w, h) => {
    const c = D.cells[i * 4 + j];
    ctx.fillStyle = PHCOL[c.ph]; ctx.globalAlpha = 0.24; ctx.fillRect(x + 1, y + 1, w - 2, h - 2); ctx.globalAlpha = 1;
    label(ctx, c.gA + c.gB, x + w / 2, y + h / 2 + 5, w - 6, { size: 14, weight: 700, color: C.text, align: 'center' });
  });
  $('lg3').innerHTML = M.PHENO.map(k => `<span class="lg"><span class="sw" style="background:${PHCOL[k]}"></span><span>${t('ph' + k)} · ${D.count[k]}/16</span></span>`).join('');

  // area model: x splits by colour, y by shape
  const aFor = W => Math.min(W - 96, 320);
  ({ ctx, W } = fitCanvas($('c3b'), W => 54 + aFor(W) + 14));
  const s = aFor(W), ax = W >= 620 ? 84 : Math.max(80, (W - s) / 2 + 30), ay = 54;
  label(ctx, t('c3area'), 8, 18, W - 16);
  const xa = M.cross(p1.A, p2.A), xb = M.cross(p1.B, p2.B);
  const cols = [['A', xa.dom], ['a', xa.rec]], rows = [['B', xb.dom], ['b', xb.rec]];
  let cx = ax;
  cols.forEach(([ca, fa]) => {
    const w = fa.v * s;
    if (w > 0) label(ctx, `${t(ca === 'A' ? 'purple' : 'white')} ${fs(fa)}`, cx + w / 2, ay - 8, w - 4, { size: 11, weight: 600, color: ca === 'A' ? C.violet : C.white, align: 'center' });
    let cy = ay;
    rows.forEach(([rb, fb]) => {
      const h = fb.v * s, k = ca + rb;
      if (w > 0 && h > 0) {
        ctx.fillStyle = PHCOL[k]; ctx.globalAlpha = 0.45; ctx.fillRect(cx, cy, w, h); ctx.globalAlpha = 1;
        ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.strokeRect(cx, cy, w, h);
        if (w > 24 && h > 18) label(ctx, fs(PR[k]), cx + w / 2, cy + h / 2 + 5, w - 6, { size: 14, weight: 700, align: 'center' });
      }
      cy += h;
    });
    cx += w;
  });
  let cy = ay;
  rows.forEach(([rb, fb]) => {
    const h = fb.v * s;
    if (h > 0) label(ctx, `${t(rb === 'B' ? 'round' : 'wrinkled')} ${fs(fb)}`, ax - 8, cy + h / 2 + 4, ax - 14, { size: 11, weight: 600, color: rb === 'B' ? C.green : C.orange, align: 'right' });
    cy += h;
  });
  const prod = M.PHENO.map(k => `${t('ph' + k)} ${fs(k[0] === 'A' ? xa.dom : xa.rec)} × ${fs(k[1] === 'B' ? xb.dom : xb.rec)} = ${fs(PR[k])}`).join(lang() === 'zh' ? '；' : '; ');
  $('r3').textContent = t('s3readout', { p1: pname(p1), p2: pname(p2), c: M.PHENO.map(k => D.count[k]).join(' : '), prod });
}
const lang = () => window.GENE_I18N.getLang();

/* ---------- step 4: linkage ---------- */
const s4 = { mode: 'tc', sim: null, rand: M.rng(404) };
function draw4() {
  const r = num('r4') / 100, tc = s4.mode === 'tc';
  pressed(['tc4', 'self4'], tc ? 'tc4' : 'self4');
  $('r4v').textContent = pct(r, 0); $('sim4').disabled = !tc;
  const { ctx, W, H } = fitCanvas($('c4'));
  label(ctx, t('c4chrom'), 8, 18, W - 16);
  const g = M.linkedGametes(r), order = ['AB', 'ab', 'Ab', 'aB'], slot = (W - 16) / 4;
  order.forEach((k, q) => {
    const x = 8 + q * slot, rec = k === 'Ab' || k === 'aB';
    ctx.save(); ctx.fillStyle = rec ? '#25303d' : C.panel; ctx.strokeStyle = rec ? C.grey : C.axis; ctx.lineWidth = 1;
    rrect(ctx, x + 4, 30, slot - 8, 92, 8); ctx.fill(); ctx.stroke(); ctx.restore();
    // chromosome: a rod carrying the two alleles
    const cxm = x + slot / 2;
    ctx.save(); ctx.fillStyle = '#56708f'; rrect(ctx, cxm - 6, 36, 12, 60, 6); ctx.fill(); ctx.restore();
    chip(ctx, cxm, 52, 9, k[0]); chip(ctx, cxm, 80, 9, k[1]);
    label(ctx, pct(g[k]), cxm, 114, slot - 12, { size: 12, weight: 700, color: rec ? C.muted : C.text, align: 'center' });
  });
  label(ctx, t('c4bars'), 8, 152, W - 16);
  const probs = tc ? M.testcross(r) : M.selfLinked(r), indep = tc ? M.testcross(0.5) : M.selfLinked(0.5);
  const yMax = tc ? 0.6 : 0.8, P = { l: 44, r: W - 12, t: 176, b: H - 34 };
  const y = axesY(ctx, P, tc ? [0, 0.25, 0.5] : [0, 0.25, 0.5, 0.75], yMax, v => Math.round(v * 100) + '%');
  const bs = (P.r - P.l) / 4, bw = Math.min(70, bs * 0.6), PH = ['AB', 'Ab', 'aB', 'ab'];
  const simTot = s4.sim ? Object.values(s4.sim).reduce((a, b) => a + b, 0) : 0;
  PH.forEach((k, q) => {
    const cx = P.l + bs * (q + 0.5), v = probs[k];
    ctx.fillStyle = PHCOL[k]; ctx.globalAlpha = 0.85; ctx.fillRect(cx - bw / 2, y(v), bw, P.b - y(v)); ctx.globalAlpha = 1;
    ctx.save(); ctx.strokeStyle = C.white; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - bw / 2 - 6, y(indep[k])); ctx.lineTo(cx + bw / 2 + 6, y(indep[k])); ctx.stroke(); ctx.restore();
    label(ctx, pct(v), cx, y(v) - 6, bs - 4, { size: 11, weight: 700, align: 'center' });
    label(ctx, t('ph' + k), cx, P.b + 16, bs - 4, { size: 11, weight: 400, color: C.muted, align: 'center' });
    if (s4.sim && tc) { ctx.fillStyle = C.orange; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx + bw / 2 + 8, y(s4.sim[k] / simTot), 5, 0, 7); ctx.fill(); ctx.stroke(); }
  });
  $('lg4').innerHTML = `<span class="lg"><span class="sw" style="background:${C.panel};border:1px solid ${C.axis}"></span><span>${t('lgParental')}</span></span><span class="lg"><span class="sw" style="background:#25303d;border:1px solid ${C.grey}"></span><span>${t('lgRecomb')}</span></span><span class="lg"><span class="sw sw-dash"></span><span>${t('lgIndep')}</span></span>` + (tc ? `<span class="lg"><span class="sw sw-dotorange"></span><span>${t('lgSimDot')}</span></span>` : '');
  let sim = '';
  if (!tc) sim = t('s4simSelf');
  else if (s4.sim) sim = t('s4sim', { n: simTot, obs: pct((s4.sim.Ab + s4.sim.aB) / simTot) });
  if (tc) $('rd4').textContent = t('s4readoutTC', { r: pct(r, 0), par: pct(g.AB), rec: pct(g.Ab), ratio: PH.map(k => pct(probs[k])).join(' : '), sim });
  else $('rd4').textContent = t('s4readoutSelf', { r: pct(r, 0), pAB: pct(probs.AB, 2), pAb: pct(probs.Ab, 2), paB: pct(probs.aB, 2), pab: pct(probs.ab, 2), sim });
}

/* ---------- step 5: conditional probability and the next generation ---------- */
const s5 = { ev: 'dom', target: 'Aa', partner: 'aa' };
const EV = { none: 'ev0', dom: 'ev1', rec: 'ev2' }, EVKEY = { none: 'evNone', dom: 'evDom', rec: 'evRec' };
function draw5() {
  pressed(['ev0', 'ev1', 'ev2'], EV[s5.ev]); pressed(['tgAA', 'tgAa', 'tgaa'], 'tg' + s5.target); pressed(['ptaa', 'ptAa'], 'pt' + s5.partner);
  const R = M.conditional(s5.ev, s5.target), P = M.punnett('Aa', 'Aa');
  const sizeFor = W => Math.min(W - 24, 280);
  let { ctx, W, H } = fitCanvas($('c5'), W => 30 + sizeFor(W) + 10);
  const size = sizeFor(W), sx = W >= 620 ? 12 : (W - size) / 2;
  label(ctx, t('c5sq'), sx, 18, W - 2 * sx);
  square(ctx, sx, 30, size, P.rows, P.cols, (i, j, x, y, w, h) => {
    const c = R.cells[i * 2 + j], dom = M.dominantShown(c.g), hit = c.kept && c.g === s5.target;
    ctx.globalAlpha = c.kept ? 1 : 0.25;
    ctx.fillStyle = dom ? 'rgba(183,156,255,0.32)' : 'rgba(232,237,244,0.16)'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    label(ctx, c.g, x + w / 2, y + h / 2 + 6, w - 8, { size: 18, weight: 700, color: dom ? C.violet : C.white, align: 'center' });
    ctx.globalAlpha = 1;
    if (!c.kept) { ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, y + 10); ctx.lineTo(x + w - 10, y + h - 10); ctx.moveTo(x + w - 10, y + 10); ctx.lineTo(x + 10, y + h - 10); ctx.stroke(); ctx.restore(); }
    if (hit) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8); ctx.restore(); }
  });
  $('r5').textContent = s5.ev === 'none'
    ? t('s5readoutNone', { target: s5.target, hit: R.hit, p: fs(R.p) })
    : t('s5readout', { ev: t(EVKEY[s5.ev]), kept: R.kept, target: s5.target, hit: R.hit, p: fs(R.p) });

  // probability tree for the next generation (always starts from a purple offspring)
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const NG = M.nextGeneration(s5.partner), partnerName = t(s5.partner === 'aa' ? 'pnAa0' : 'pnAa1');
  label(ctx, t('c5tree', { partner: partnerName }), 8, 18, W - 16);
  const rootX = 8, rootW = Math.min(96, W * 0.24), midX = W * 0.36, midW = Math.min(64, W * 0.17), leafX = W * 0.6, leafW = Math.min(110, W * 0.2), prodX = W - 8;
  const rootY = 140, ys = [86, 196];
  const box = (x, yy, w, text, col) => { ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = col; ctx.lineWidth = 1.5; rrect(ctx, x, yy - 16, w, 32, 8); ctx.fill(); ctx.stroke(); ctx.restore(); label(ctx, text, x + w / 2, yy + 4, w - 8, { size: 12, weight: 700, color: col, align: 'center' }); };
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
  ys.forEach(yy => { ctx.beginPath(); ctx.moveTo(rootX + rootW, rootY); ctx.lineTo(midX, yy); ctx.moveTo(midX + midW, yy); ctx.lineTo(leafX, yy); ctx.stroke(); });
  ctx.restore();
  box(rootX, rootY, rootW, t('treeRoot'), C.violet);
  NG.branches.forEach((b, q) => {
    const yy = ys[q];
    box(midX, yy, midW, b.g, C.violet);
    label(ctx, fs(b.w), (rootX + rootW + midX) / 2, (rootY + yy) / 2 + (q ? 18 : -8), midX - rootX - rootW - 4, { size: 12, weight: 700, color: C.orange, align: 'center' });
    box(leafX, yy, leafW, `${t('white')} ${fs(b.white)}`, C.white);
    label(ctx, `= ${fs(b.path)}`, prodX, yy + 4, W - leafX - leafW - 14, { size: 13, weight: 700, color: C.cyan, align: 'right' });
  });
  const wAA = fs(NG.branches[0].white), wAa = fs(NG.branches[1].white);
  $('r5b').textContent = t('s5readoutB', { partner: partnerName, wAA, wAa, total: fs(NG.sum) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['AA', 'Aa', 'aa'].forEach(g => $('g0' + g).addEventListener('click', () => { stopAnim('s0'); s0.g = g; s0.seq = []; s0.slide = 1; draw0(); }));
  $('one0').addEventListener('click', () => { addGametes(1); s0.slide = 0; draw0(); animate('s0', 450, p => { s0.slide = p; draw0(); }); });
  $('fifty0').addEventListener('click', () => {
    const start = s0.seq.length, extra = [];
    for (let i = 0; i < 50 && start + i < CAP0; i++) extra.push(M.drawGamete(s0.g, s0.rand));
    s0.slide = 1;
    animate('s0', 1500, p => { const want = start + Math.round(p * extra.length); while (s0.seq.length < want) s0.seq.push(extra[s0.seq.length - start]); draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.seq = []; s0.slide = 1; draw0(); });

  ['AA', 'Aa', 'aa'].forEach(g => {
    $('pa1' + g).addEventListener('click', () => { s1.g1 = g; draw1(); });
    $('pb1' + g).addEventListener('click', () => { s1.g2 = g; draw1(); });
  });

  $('n2').addEventListener('input', () => { s2.hist = []; draw2(); });
  $('sim2').addEventListener('click', () => {
    const n = num('n2'), batch = Array.from({ length: 100 }, () => M.family(n, s2.rand)), start = s2.hist.length;
    animate('s2', 1200, p => { const want = start + Math.round(p * 100); while (s2.hist.length < want) s2.hist.push(batch[s2.hist.length - start]); draw2(); });
  });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.hist = []; draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b', pm = M.binomPMF(4, 0.25);
    $('quizFeedback').textContent = ok ? t('correct', { p1: pct(pm[1]), p0: pct(pm[0]) }) : t('wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  [0, 1, 2].forEach(i => { $('xa' + i).addEventListener('click', () => { s3.a = i; draw3(); }); $('xb' + i).addEventListener('click', () => { s3.b = i; draw3(); }); });

  $('r4').addEventListener('input', () => { s4.sim = null; draw4(); });
  $('tc4').addEventListener('click', () => { s4.mode = 'tc'; s4.sim = null; draw4(); });
  $('self4').addEventListener('click', () => { s4.mode = 'self'; s4.sim = null; draw4(); });
  $('sim4').addEventListener('click', () => {
    if (s4.mode !== 'tc') return;
    const add = M.simulateTestcross(num('r4') / 100, 200, s4.rand);
    s4.sim = s4.sim || { AB: 0, Ab: 0, aB: 0, ab: 0 }; Object.keys(add).forEach(k => { s4.sim[k] += add[k]; }); draw4();
  });
  $('clear4').addEventListener('click', () => { s4.sim = null; draw4(); });

  ['none', 'dom', 'rec'].forEach(e => $(EV[e]).addEventListener('click', () => { s5.ev = e; draw5(); }));
  ['AA', 'Aa', 'aa'].forEach(g => $('tg' + g).addEventListener('click', () => { s5.target = g; draw5(); }));
  $('ptaa').addEventListener('click', () => { s5.partner = 'aa'; draw5(); });
  $('ptAa').addEventListener('click', () => { s5.partner = 'Aa'; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshGenetics = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
