'use strict';
// DNA replication & translation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every sequence, band, fragment and class comes from window.DNA_MODEL (model.js). Canvas text is limited to
// panel titles, base letters inside their own cells, strand-end marks and axis ticks, all on fixed rows.
(function () {

const $ = id => document.getElementById(id);
const M = window.DNA_MODEL;
const t = (...a) => window.DNA_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', red: '#ff5d5d', yellow: '#ffe26a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (90 stays 90).
const fmt = (v, d = 1) => { const s = v.toFixed(d); return s.indexOf('.') >= 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const pct = v => fmt(v * 100, 1);

function fitCanvas(canvas, hOverride) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = hOverride || Number(canvas.dataset.h);
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title on its own row; the font shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function label(ctx, text, X, Y, align = 'center', color = C.muted, size = 11, weight = '') {
  ctx.save(); ctx.font = `${weight} ${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text, X, Y); ctx.restore();
}
// Letter in a rounded cell (used for bases and codons).
function cell(ctx, X, Y, w, h, letter, fill, txt = '#061118', stroke = null) {
  ctx.save(); ctx.fillStyle = fill; ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(X - w / 2, Y - h / 2, w, h, 3); else ctx.rect(X - w / 2, Y - h / 2, w, h);
  ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.font = `700 ${Math.min(13, Math.max(9, w * 0.62))}px ui-monospace,Menlo,monospace`; ctx.fillStyle = txt; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(letter, X, Y + 0.5); ctx.restore();
}
function arrow(ctx, x0, y, x1, color, lw = 3) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  const d = Math.sign(x1 - x0) || 1; ctx.beginPath(); ctx.moveTo(x1 + d * 6, y); ctx.lineTo(x1 - d * 2, y - 5); ctx.lineTo(x1 - d * 2, y + 5); ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: pairing ---------- */
const s0 = { top: M.DEFAULT_TOP, seed: 1, hist: new Set() };
function buildStrandEditor() {
  const box = $('strand0');
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'base-btn'; b.dataset.step = '0'; b.dataset.i = i;
    b.addEventListener('click', () => { const s = s0.top.split(''); s[i] = M.cycleBase(s[i]); s0.top = s.join(''); draw0(); });
    box.appendChild(b);
  }
}
function draw0() {
  const top = s0.top, bot = M.complement(top), hb = M.hbonds(top), gc = M.gcCount(top);
  s0.hist.add(gc);
  [...$('strand0').children].forEach((b, i) => { b.textContent = top[i]; b.dataset.b = top[i]; b.setAttribute('aria-label', t('baseBtn', { i: i + 1, b: top[i] })); });
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0top'), 8, 18, W - 16);
  const l = 30, r = W - 30, cw = (r - l) / 12, yT = 52, yB = 132, sz = Math.min(24, cw - 4);
  label(ctx, "5′", l - 14, yT); label(ctx, "3′", r + 14, yT); label(ctx, "3′", l - 14, yB); label(ctx, "5′", r + 14, yB);
  for (let i = 0; i < 12; i++) {
    const X = l + cw * (i + 0.5), n = M.HB[top[i]];
    ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
    for (let j = 0; j < n; j++) { const dx = (j - (n - 1) / 2) * Math.min(6, cw / 5); ctx.beginPath(); ctx.moveTo(X + dx, yT + sz / 2 + 4); ctx.lineTo(X + dx, yB - sz / 2 - 4); ctx.stroke(); }
    ctx.restore();
    cell(ctx, X, yT, sz, sz, top[i], C.cyan); cell(ctx, X, yB, sz, sz, bot[i], C.orange);
  }
  // backbones
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2;
  [yT - sz / 2 - 6, yB + sz / 2 + 6].forEach(Y => { ctx.beginPath(); ctx.moveTo(l, Y); ctx.lineTo(r, Y); ctx.stroke(); }); ctx.restore();
  // plot: hydrogen bonds vs G–C pairs
  const pT = 196, pB = H - 30, pl = 40, pr = W - 14;
  title(ctx, t('c0bot'), 8, pT - 14, W - 16);
  const x = v => pl + v / 12 * (pr - pl), y = v => pB - (v - 22) / (38 - 22) * (pB - pT);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [24, 30, 36].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pl, y(v)); ctx.lineTo(pr, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), pl - 6, y(v) + 4); });
  const step = (pr - pl) / 12 >= 24 ? 1 : (pr - pl) / 12 >= 12 ? 2 : 4;
  ctx.textAlign = 'center';
  for (let v = 0; v <= 12; v += step) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), pB); ctx.lineTo(x(v), pB + 4); ctx.stroke(); ctx.fillText(String(v), x(v), pB + 16); }
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(0), y(24)); ctx.lineTo(x(12), y(36)); ctx.stroke();
  [...s0.hist].forEach(g => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(x(g), y(24 + g), 3.5, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x(gc), y(hb), 6, 0, 7); ctx.fill();
  ctx.restore();
  $('r0').textContent = t('s0readout', { top, bot, at: 12 - gc, gc, hb, pct: pct(gc / 12) });
}

/* ---------- step 1: semi-conservative? ---------- */
const s1 = { hyp: 'semi' };
const HYP = { semi: 'hSemi', cons: 'hCons', disp: 'hDisp' };
function bandName(f) {
  if (f === 1) return t('bandHeavy'); if (f === 0.5) return t('bandHybrid'); if (f === 0) return t('bandLight');
  return t('bandMixed', { p: fmt(f * 100, 2) });
}
const bandList = bs => bs.map(b => t('bandItem', { name: bandName(b.f), share: fmt(b.share * 100, 2) })).join(' + ');
function firstMismatch(hyp) { for (let g = 0; g <= 4; g++) if (!M.sameBands(M.bands(hyp, g), M.observed(g))) return g; return null; }
function strandBar(ctx, X, Y0, Y1, w, f) {
  if (f === 1 || f === 0) { ctx.fillStyle = f ? C.orange : C.cyan; ctx.fillRect(X - w / 2, Y0, w, Y1 - Y0); return; }
  const seg = 16, h = (Y1 - Y0) / seg, every = Math.round(1 / f);
  for (let i = 0; i < seg; i++) { ctx.fillStyle = i % every === 0 ? C.orange : C.cyan; ctx.fillRect(X - w / 2, Y0 + i * h, w, h + 0.3); }
}
function draw1() {
  const g = num('g1'), hyp = s1.hyp;
  $('g1v').textContent = String(g);
  Object.keys(HYP).forEach(k => $(HYP[k]).setAttribute('aria-pressed', k === hyp ? 'true' : 'false'));
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 18, W - 16);
  const l = 40, r = W - 10, top = 34, rowH = (H - top - 10) / 5;
  let prev = null;
  for (let k = 0; k <= g; k++) {
    const mols = M.generation(hyp, k), n = mols.length, slot = (r - l) / n, Y0 = top + k * rowH + 6, Y1 = Y0 + rowH * 0.58;
    label(ctx, 'g = ' + k, 6, (Y0 + Y1) / 2, 'left');
    const bw = Math.max(2, Math.min(10, slot / 5)), gap = Math.max(1, Math.min(3, slot / 12));
    const xs = mols.map((_, i) => l + slot * (i + 0.5));
    if (prev) { ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; xs.forEach((X, i) => { ctx.beginPath(); ctx.moveTo(prev.xs[i >> 1], prev.Y1 + 2); ctx.lineTo(X, Y0 - 2); ctx.stroke(); }); ctx.restore(); }
    mols.forEach((m, i) => { strandBar(ctx, xs[i] - bw / 2 - gap / 2, Y0, Y1, bw, m[0]); strandBar(ctx, xs[i] + bw / 2 + gap / 2, Y0, Y1, bw, m[1]); });
    prev = { xs, Y1 };
  }
  ({ ctx, W, H } = fitCanvas($('c1b')));
  title(ctx, t('c1b'), 8, 18, W - 16);
  const tw = Math.min(56, W * 0.2), cx = [W * 0.38, W * 0.74], tT = 36, tB = H - 40;
  const yOf = f => tT + (0.25 + 0.5 * f) * (tB - tT);
  [[0, t('tubeLight')], [0.5, t('tubeMid')], [1, t('tubeHeavy')]].forEach(([f, s]) => {
    label(ctx, s, cx[0] - tw / 2 - 8, yOf(f), 'right');
    ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(cx[0] - tw / 2 - 4, yOf(f)); ctx.lineTo(cx[1] + tw / 2 + 4, yOf(f)); ctx.stroke(); ctx.restore();
  });
  [[M.bands(hyp, g), t('tubePred')], [M.observed(g), t('tubeObs')]].forEach(([bs, name], j) => {
    const X = cx[j];
    ctx.save(); ctx.strokeStyle = C.xs; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(X - tw / 2, tT); ctx.lineTo(X - tw / 2, tB - tw / 2); ctx.arc(X, tB - tw / 2, tw / 2, Math.PI, 0, true); ctx.lineTo(X + tw / 2, tT); ctx.stroke();
    bs.forEach(b => { ctx.globalAlpha = 0.3 + 0.7 * b.share; ctx.fillStyle = C.text; const th = 3 + 7 * b.share; ctx.fillRect(X - tw / 2 + 4, yOf(b.f) - th / 2, tw - 8, th); });
    ctx.restore();
    label(ctx, name, X, H - 16, 'center', C.text, 12);
  });
  const g0 = firstMismatch(hyp), ok = g0 === null || g < g0;
  const verdict = ok ? t('s1match') : (g === g0 ? t('s1fail', { g0 }) : t('s1failNow', { g0 }));
  $('r1').textContent = t('s1readout', { g, n: Math.pow(2, g), hyp: t(HYP[hyp]), pred: bandList(M.bands(hyp, g)), obs: bandList(M.observed(g)), verdict });
}

/* ---------- step 2: the fork ---------- */
function draw2() {
  const p = num('p2'), L = num('L2'), f = M.fork(p, L);
  $('p2v').textContent = String(p); $('L2v').textContent = String(L);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2'), 8, 18, W - 16);
  const l = 30, r = W - 30, x = v => l + v / M.FORK.maxProgress * (r - l - 22);
  const yT = 52, yLead = 76, yLag = 150, yB = 174, yD1 = 104, yD2 = 122, fx = x(p), fj = Math.min(fx + 22, r);
  // templates (old strands)
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(l, yT); ctx.lineTo(fx, yT); ctx.lineTo(fj, yD1); ctx.lineTo(r, yD1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(l, yB); ctx.lineTo(fx, yB); ctx.lineTo(fj, yD2); ctx.lineTo(r, yD2); ctx.stroke();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; for (let X = fj + 6; X < r; X += 8) { ctx.beginPath(); ctx.moveTo(X, yD1 + 3); ctx.lineTo(X, yD2 - 3); ctx.stroke(); }
  ctx.restore();
  label(ctx, "3′", l - 14, yT); label(ctx, "5′", l - 14, yLead); label(ctx, "3′", l - 14, yLag); label(ctx, "5′", l - 14, yB);
  label(ctx, "5′", r + 14, yD1 - 4); label(ctx, "3′", r + 14, yD2 + 4);
  // leading strand: continuous, toward the fork
  if (p > 0) { arrow(ctx, l, yLead, Math.max(l + 2, fx - 6), C.cyan); ctx.fillStyle = C.pink; ctx.fillRect(l, yLead - 4, 7, 8); }
  // lagging strand: fragments made away from the fork, each starting on its own primer (at the fork-side end)
  f.frags.forEach(fr => {
    const a = x(fr.from), b = x(fr.to);
    arrow(ctx, b - 1, yLag, a + 7, C.orange);
    ctx.fillStyle = C.pink; ctx.fillRect(b - 8, yLag - 4, 7, 8);
  });
  if (f.gap > 0) { ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.strokeRect(x(f.laggingDone) + 1, yLag - 7, Math.max(2, fx - x(f.laggingDone) - 2), 14); ctx.restore(); }
  // nt axis
  const aY = H - 30;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(l, aY); ctx.lineTo(x(3000), aY); ctx.stroke(); ctx.restore();
  const stepT = (x(3000) - l) / 6 >= 44 ? 500 : 1000;
  for (let v = 0; v <= 3000; v += stepT) { ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), aY); ctx.lineTo(x(v), aY + 4); ctx.stroke(); ctx.restore(); label(ctx, String(v), x(v), aY + 14); }
  $('r2').textContent = t('s2readout', { p, v: M.FORK.speed, s: fmt(f.seconds, 2), lead: f.leading, n: f.fragments, gap: f.gap, pr: f.primers });
  $('h2').textContent = t('s2hint', { min: Math.round(M.ecoliMinutes()) });
}

/* ---------- helper: lay a sequence out in blocks that fit the width ---------- */
function blocks(W, n, pad, minCell = 15, maxCell = 26) {
  for (const parts of [1, 2, 3]) {
    const per = Math.ceil(n / parts), cw = Math.min(maxCell, (W - 2 * pad) / per);
    if (cw >= minCell || parts === 3) return { parts, per, cw };
  }
}

/* ---------- step 3: transcription ---------- */
function draw3() {
  const n = num('n3'), coding = M.GENE, templ = M.templateOf(coding), mrna = M.transcribe(templ).slice(0, n);
  $('n3v').textContent = String(n);
  const c = $('c3'), Wc = Math.max(240, c.clientWidth || 600), pad = 26;
  const B = blocks(Wc, 30, pad), bh = 104, H = 34 + B.parts * bh;
  const { ctx, W } = fitCanvas(c, H);
  title(ctx, t('c3'), 8, 18, W - 16);
  const sz = B.cw - 3;
  for (let part = 0; part < B.parts; part++) {
    const y0 = 46 + part * bh, i0 = part * B.per, i1 = Math.min(30, i0 + B.per), X0 = (W - (i1 - i0) * B.cw) / 2;
    const yC = y0, yT = y0 + 28, yR = y0 + 62;
    label(ctx, part === 0 ? "5′" : '…', X0 - 12, yC); label(ctx, part === 0 ? "3′" : '…', X0 - 12, yT);
    if (part === B.parts - 1) { label(ctx, "3′", X0 + (i1 - i0) * B.cw + 12, yC); label(ctx, "5′", X0 + (i1 - i0) * B.cw + 12, yT); }
    if (part === 0 && n > 0) label(ctx, "5′", X0 - 12, yR);
    for (let i = i0; i < i1; i++) {
      const X = X0 + (i - i0 + 0.5) * B.cw;
      cell(ctx, X, yC, sz, 20, coding[i], C.xs);
      cell(ctx, X, yT, sz, 20, templ[i], i < n ? C.raw : '#3a4757', C.text);
      if (i < n) cell(ctx, X, yR, sz, 20, mrna[i], C.green);
      if (i === n) { // RNA polymerase sits on the next template base
        ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2.2; ctx.strokeRect(X - B.cw / 2 - 1, yT - 14, B.cw + 2, yR - yT + 28); ctx.restore();
      }
      if (i < n) { ctx.save(); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, yT + 11); ctx.lineTo(X, yR - 11); ctx.stroke(); ctx.restore(); }
    }
  }
  const cSeg = coding.slice(0, n), same = mrna === cSeg.replace(/T/g, 'U');
  $('r3').textContent = t('s3readout', { n, m: mrna || '–', c: cSeg || '–', same: t(same ? 'sameYes' : 'sameNo') });
}

/* ---------- step 4: translation ---------- */
const s4 = { frame: 0 };
const mRNA = M.transcribe(M.templateOf(M.GENE));
function aaLabel(a) { return a === '*' ? t('stopName') : M.THREE[a]; }
function buildCodonTable() {
  const tb = $('codonTable'), O = 'UCAG';
  let html = `<thead><tr><th class="corner"><span data-i18n="tableFirst"></span><br><span data-i18n="tableSecond"></span></th>${[...O].map(b => `<th>${b}</th>`).join('')}</tr></thead><tbody>`;
  for (const a of O) for (const c of O) {
    html += '<tr' + (c === 'U' ? ' class="grp"' : '') + '>';
    if (c === 'U') html += `<th rowspan="4">${a}</th>`;
    for (const b of O) { const cod = a + b + c, aa = M.aaOf(cod); html += `<td data-codon="${cod}" class="${aa === '*' ? 'stop' : ''}"><span class="cod">${cod}</span> <span class="aa" data-aa="${aa}"></span></td>`; }
    html += '</tr>';
  }
  tb.innerHTML = html + '</tbody>';
}
function draw4() {
  const f = s4.frame, all = M.translate(mRNA, f, true), maxK = all.length;
  const k = Math.min(num('k4'), maxK);
  $('k4v').textContent = String(k);
  ['frame0', 'frame1', 'frame2'].forEach((id, i) => $(id).setAttribute('aria-pressed', i === f ? 'true' : 'false'));
  const c = $('c4'), Wc = Math.max(240, c.clientWidth || 600), pad = 14;
  // groups: optional leading partial of f letters, then codons (the last partial too)
  const groups = []; if (f) groups.push({ from: 0, to: f, pre: true });
  for (let i = f; i < mRNA.length; i += 3) groups.push({ from: i, to: Math.min(mRNA.length, i + 3), idx: (i - f) / 3 });
  const cellW = Math.max(14, Math.min(24, (Wc - 2 * pad) / 36)), gap = cellW * 0.5;
  const rows = []; let cur = [], wsum = 0;
  groups.forEach(g => { const w = (g.to - g.from) * cellW + gap; if (wsum + w > Wc - 2 * pad && cur.length) { rows.push(cur); cur = []; wsum = 0; } cur.push(g); wsum += w; });
  if (cur.length) rows.push(cur);
  const rowH = 78, H = 34 + rows.length * rowH;
  const { ctx, W } = fitCanvas(c, H);
  title(ctx, t('c4'), 8, 18, W - 16);
  let prevBead = null;
  rows.forEach((row, ri) => {
    const rw = row.reduce((s, g) => s + (g.to - g.from) * cellW + gap, 0) - gap;
    let X = (W - rw) / 2; const yM = 46 + ri * rowH, yA = yM + 34;
    row.forEach(g => {
      const w = (g.to - g.from) * cellW, codon = g.idx !== undefined && g.idx < all.length ? all[g.idx] : null;
      const read = codon && g.idx < k, current = codon && g.idx === k - 1, stop = codon && codon.aa === '*';
      for (let i = g.from; i < g.to; i++) {
        const fill = g.pre || !codon ? '#3a4757' : stop && read ? C.pink : read ? C.green : C.xs;
        cell(ctx, X + (i - g.from + 0.5) * cellW, yM, cellW - 2, 20, mRNA[i], fill, g.pre || !codon ? C.text : '#061118');
      }
      if (current) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.strokeRect(X - 3, yM - 14, w + 2, 28); ctx.restore(); }
      if (read && !stop) {
        const bx = X + w / 2 - 1, r = Math.min(14, w / 2 - 2);
        if (prevBead && prevBead.row === ri) { ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(prevBead.x + r, yA); ctx.lineTo(bx - r, yA); ctx.stroke(); ctx.restore(); }
        ctx.save(); ctx.fillStyle = C.violet; ctx.beginPath(); ctx.arc(bx, yA, r, 0, 7); ctx.fill(); ctx.restore();
        label(ctx, M.THREE[codon.aa], bx, yA + 0.5, 'center', '#140b26', r >= 13 ? 10 : 9, '700');
        prevBead = { x: bx, row: ri };
      }
      X += w + gap;
    });
  });
  document.querySelectorAll('#codonTable td').forEach(td => td.classList.toggle('on', k > 0 && td.dataset.codon === all[k - 1].codon.replace(/T/g, 'U')));
  const frame = f ? t('s4frameOff', { d: f }) : t('s4frameOK');
  const chainArr = all.slice(0, k).filter(x => x.aa !== '*').map(x => M.THREE[x.aa]);
  const chain = chainArr.join('–') || '–';
  if (k === 0) $('r4').textContent = t('s4readout0', { frame });
  else if (all[k - 1].aa === '*') $('r4').textContent = t('s4readoutStop', { frame, k, codon: all[k - 1].codon.replace(/T/g, 'U'), len: chainArr.length, chain });
  else $('r4').textContent = t('s4readout', { frame, k, codon: all[k - 1].codon.replace(/T/g, 'U'), aa: aaLabel(all[k - 1].aa), len: chainArr.length, chain });
  const deg = M.degeneracy();
  $('h4').textContent = t('s4hint', { all: 64, sense: 64 - deg['*'], aa: Object.keys(deg).length - 1, stop: deg['*'], leu: deg.L });
}

/* ---------- step 5: mutations ---------- */
const s5 = { edit: null };
function currentMut() {
  if (!s5.edit) return M.GENE;
  return M.mutate(M.GENE, s5.edit.pos, s5.edit.kind, s5.edit.base);
}
function beadRow(ctx, prot, ref, X0, X1, Y, extra = 0) {
  const n = Math.max(prot.length + extra, 1), slot = Math.min(32, (X1 - X0) / n), r = Math.min(13, slot / 2 - 1.5);
  for (let i = 0; i < prot.length; i++) {
    const X = X0 + slot * (i + 0.5), changed = ref[i] !== prot[i];
    if (i > 0) { ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - slot + r, Y); ctx.lineTo(X - r, Y); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.fillStyle = changed ? C.pink : C.violet; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore();
    label(ctx, r >= 11 ? M.THREE[prot[i]] : prot[i], X, Y + 0.5, 'center', '#140b26', r >= 12.5 ? 10 : 9, '700');
  }
  return slot;
}
function draw5() {
  const pos = num('pos5'), seq = currentMut(), res = M.classify(M.GENE, seq), p0 = M.protein(M.GENE), p1 = M.protein(seq);
  $('pos5v').textContent = String(pos);
  const c = $('c5'), Wc = Math.max(240, c.clientWidth || 600), padL = 44, padR = 10;
  const B = blocks(Wc - padL - padR + 20, seq.length, 10, 17, 22);
  const dnaH = B.parts * 30, H = 40 + dnaH + 100;
  let { ctx, W } = fitCanvas(c, H);
  title(ctx, t('c5'), 8, 18, W - 16);
  const e = s5.edit;
  for (let part = 0; part < B.parts; part++) {
    const Y = 44 + part * 30, i0 = part * B.per, i1 = Math.min(seq.length, i0 + B.per);
    if (part === 0) label(ctx, t('c5rowDNA'), 6, Y, 'left');
    for (let i = i0; i < i1; i++) {
      const X = padL + (i - i0 + 0.5) * B.cw;
      const hit = e && ((e.kind === 'sub' && i === e.pos) || (e.kind === 'ins' && i === e.pos));
      const codonStart = i % 3 === 0 && i > i0;
      if (codonStart) { ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X - B.cw / 2, Y - 12); ctx.lineTo(X - B.cw / 2, Y + 12); ctx.stroke(); ctx.restore(); }
      cell(ctx, X, Y, B.cw - 3, 20, seq[i], hit ? C.pink : C.xs);
    }
    if (e && e.kind === 'del' && e.pos >= i0 && e.pos <= i1 && (e.pos < i1 || part === B.parts - 1)) {
      const X = padL + (e.pos - i0) * B.cw; ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, Y - 13); ctx.lineTo(X, Y + 13); ctx.stroke(); ctx.restore();
    }
    // position cursor
    const pi = pos - 1;
    if (!e && pi >= i0 && pi < i1) { const X = padL + (pi - i0 + 0.5) * B.cw; ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.strokeRect(X - B.cw / 2, Y - 13, B.cw, 26); ctx.restore(); }
  }
  const yO = 44 + dnaH + 24, yN = yO + 44;
  label(ctx, t('c5rowOld'), 6, yO, 'left'); label(ctx, t('c5rowNew'), 6, yN, 'left');
  beadRow(ctx, p0, p0, padL, W - padR, yO);
  const runOff = !res.stop && !!e; // no stop codon: the chain runs off the end of the sequence
  const slotN = beadRow(ctx, p1, p0, padL, W - padR, yN, runOff ? 1 : 0);
  if (runOff) label(ctx, '…', padL + slotN * (p1.length + 0.5), yN, 'center', C.pink, 14, '700');

  // tally chart
  const tal = M.substitutionTally(M.GENE);
  ({ ctx, W } = fitCanvas($('c5b')));
  const Hb = Number($('c5b').dataset.h);
  title(ctx, t('c5b'), 8, 18, W - 16);
  const pl = 34, pr = W - 10, pT = 40, pB = Hb - 34, y = v => pB - v / 27 * (pB - pT);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [0, 9, 18, 27].forEach(v => { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(pl, y(v)); ctx.lineTo(pr, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), pl - 6, y(v) + 4); });
  ctx.restore();
  const slot = (pr - pl) / 3, bw = Math.min(54, slot * 0.55), cp = e && e.kind === 'sub' ? e.pos % 3 : -1;
  tal.forEach((row, i) => {
    const X = pl + slot * (i + 0.5); let acc = 0;
    [['silent', C.green], ['missense', C.orange], ['nonsense', C.red]].forEach(([k, col]) => {
      ctx.fillStyle = col; ctx.fillRect(X - bw / 2, y(acc + row[k]), bw, y(acc) - y(acc + row[k])); acc += row[k];
    });
    if (i === cp) { ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2.2; ctx.strokeRect(X - bw / 2 - 4, y(27) - 4, bw + 8, y(0) - y(27) + 8); ctx.restore(); }
    label(ctx, t('c5pos', { i: i + 1 }), X, pB + 16, 'center', C.muted, 11);
  });
  $('stat5').textContent = t('s5stat', { s1: tal[0].silent, s2: tal[1].silent, s3: tal[2].silent });
  ['A', 'T', 'G', 'C'].forEach(b => { const btn = $('sub' + b); btn.textContent = t('sub5', { b }); btn.disabled = M.GENE[pos - 1] === b; });
  if (!e) { $('r5').textContent = t('s5none', { p0: p0.split('').map(a => M.THREE[a]).join('–'), n0: p0.length }); return; }
  const i = e.pos + 1, from = M.GENE[e.pos];
  let edit;
  if (e.kind === 'sub') { const cs = e.pos - e.pos % 3; edit = t('edSub', { i, from, to: e.base, cp: e.pos % 3 + 1, c0: M.GENE.slice(cs, cs + 3), c1: seq.slice(cs, cs + 3) }); }
  else if (e.kind === 'del') edit = t('edDel', { i, from });
  else edit = t('edIns', { i });
  const three = p => p.split('').map(a => M.THREE[a]).join('–') || '–';
  $('r5').textContent = t('s5readout', { edit, cls: t('cls_' + res.cls), p0: three(p0), n0: p0.length, p1: three(p1), n1: p1.length });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildStrandEditor(); buildCodonTable();
  $('rand0').addEventListener('click', () => { s0.seed++; s0.top = M.randomStrand(s0.seed); draw0(); });
  $('reset0').addEventListener('click', () => { s0.top = M.DEFAULT_TOP; s0.hist = new Set(); draw0(); });

  Object.keys(HYP).forEach(k => $(HYP[k]).addEventListener('click', () => { s1.hyp = k; draw1(); }));
  $('g1').addEventListener('input', draw1);

  $('p2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('L2').addEventListener('input', draw2);
  $('play2').addEventListener('click', () => animate('s2', 6000, p => { $('p2').value = Math.round(p * 3000 / 50) * 50; draw2(); }));

  $('n3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('all3').addEventListener('click', () => { const n0 = num('n3'); animate('s3', (30 - n0) * 160, p => { $('n3').value = Math.round(n0 + p * (30 - n0)); draw3(); }); });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); $('n3').value = 0; draw3(); });

  ['frame0', 'frame1', 'frame2'].forEach((id, i) => $(id).addEventListener('click', () => { s4.frame = i; draw4(); }));
  $('k4').addEventListener('input', draw4);

  $('pos5').addEventListener('input', () => { s5.edit = null; draw5(); });
  ['A', 'T', 'G', 'C'].forEach(b => $('sub' + b).addEventListener('click', () => { s5.edit = { pos: num('pos5') - 1, kind: 'sub', base: b }; draw5(); }));
  $('del5').addEventListener('click', () => { s5.edit = { pos: num('pos5') - 1, kind: 'del' }; draw5(); });
  $('ins5').addEventListener('click', () => { s5.edit = { pos: num('pos5') - 1, kind: 'ins', base: 'A' }; draw5(); });
  $('reset5').addEventListener('click', () => { s5.edit = null; draw5(); });

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshDNA = () => {
    document.querySelectorAll('#codonTable [data-aa]').forEach(s => { s.textContent = aaLabel(s.dataset.aa); });
    document.querySelectorAll('#codonTable [data-i18n]').forEach(s => { s.textContent = t(s.dataset.i18n); });
    refresh();
  };
  window.refreshDNA();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
