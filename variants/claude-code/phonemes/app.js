'use strict';
// Speech sounds & phonemes lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every verdict, colour and count comes from window.PHON_MODEL (model.js). Canvas text is limited to panel
// titles, chart headers and IPA symbols laid out in fixed cells; explanations and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PHON_MODEL;
const t = (...a) => window.PHON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621',
  cell: '#1b2a3b', dim: '#131c27', word: '#2f6b52', single: '#3a5068', teal: '#2d7f8c', gap: '#8a6430', falls: '#6b3242', tract: '#8696aa', tongue: '#c86b7c' };
const IPA_FONT = '"Charis SIL","Doulos SIL","Gentium Plus","Noto Sans","Segoe UI",system-ui,sans-serif';
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cap = k => k.charAt(0).toUpperCase() + k.slice(1);
const placeName = p => t('pl' + cap(p));
const mannerName = m => t('mn' + cap(m));
const featName = f => t(f === 'place' ? 'ftPlace' : f === 'manner' ? 'ftManner' : 'ftVoicing');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Text that shrinks until it fits maxW (never overflows its slot).
function fitText(ctx, text, x, y, maxW, size, weight = '', family = 'system-ui,sans-serif', min = 7) {
  let s = size; do { ctx.font = `${weight} ${s}px ${family}`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > min);
  if (ctx.measureText(text).width > maxW) return false;
  ctx.fillText(text, x, y); return true;
}
function title(ctx, text, W) { ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; fitText(ctx, text, 8, 17, W - 16, 12, '600'); ctx.restore(); }

/* ---------- consonant chart (rows = place, columns = manner × voicing) ---------- */
// opts: top, extraRow (label) , cell(c, place, manner, voiced) → {fill, ring, outline, sub}
function chart(canvas, opts) {
  const { ctx, W, H } = fitCanvas(canvas);
  title(ctx, opts.title, W);
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const labW = Math.min(W * 0.3, Math.max(...M.PLACES.map(p => ctx.measureText(placeName(p)).width)) + 12);
  ctx.restore();
  const x0 = 8 + labW, colW = (W - 8 - x0) / 8, top = 30, headH = 22;
  const rows = M.PLACES.length + (opts.extraRow ? 1 : 0), rh = Math.min(44, (H - top - headH - 8) / rows);
  const rects = [];
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = C.muted;
  M.MANNERS.forEach((m, j) => fitText(ctx, mannerName(m), x0 + (j * 2 + 1) * colW, top + 14, 2 * colW - 4, 11, '600'));
  ctx.textAlign = 'right';
  M.PLACES.forEach((p, i) => fitText(ctx, placeName(p), x0 - 6, top + headH + i * rh + rh / 2 + 4, labW - 8, 11));
  M.PLACES.forEach((p, i) => M.MANNERS.forEach((m, j) => [false, true].forEach((v, k) => {
    const c = M.find(p, m, v), X = x0 + (j * 2 + k) * colW, Y = top + headH + i * rh, st = opts.cell(c, p, m, v);
    ctx.fillStyle = st.fill; ctx.fillRect(X + 1, Y + 1, colW - 2, rh - 2);
    if (k === 0) { ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X + colW, Y); ctx.lineTo(X + colW, Y + rh); ctx.stroke(); }
    if (st.outline) { ctx.strokeStyle = st.outline; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, colW - 4, rh - 4); }
    if (c) {
      ctx.fillStyle = st.textColor || C.text; ctx.textAlign = 'center';
      const hasSub = st.sub && colW >= 34 && rh >= 36;
      fitText(ctx, c.ipa, X + colW / 2, Y + (hasSub ? rh / 2 - 1 : rh / 2 + 5), colW - 4, 15, '', IPA_FONT);
      if (hasSub) { ctx.fillStyle = st.subColor || C.muted; fitText(ctx, st.sub, X + colW / 2, Y + rh / 2 + 13, colW - 4, 10, '', 'system-ui,sans-serif', 7); }
    }
    rects.push({ X, Y, w: colW, h: rh, place: p, manner: m, voiced: v, c });
  })));
  if (opts.extraRow) {
    const Y = top + headH + M.PLACES.length * rh, st = opts.extraRow;
    ctx.fillStyle = st.fill; ctx.fillRect(x0 + 1, Y + 3, 8 * colW - 2, rh - 4);
    if (st.outline) { ctx.strokeStyle = st.outline; ctx.lineWidth = 2; ctx.strokeRect(x0 + 2, Y + 4, 8 * colW - 4, rh - 6); }
    ctx.fillStyle = st.textColor || C.text; ctx.textAlign = 'center'; fitText(ctx, st.label, x0 + 4 * colW, Y + rh / 2 + 5, 8 * colW - 8, 12);
    rects.push({ X: x0, Y, w: 8 * colW, h: rh, extra: true });
  }
  ctx.restore();
  canvas._rects = rects;
}
function hit(canvas, ev) {
  const r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
  return (canvas._rects || []).find(q => x >= q.X && x <= q.X + q.w && y >= q.Y && y <= q.Y + q.h) || null;
}

/* ---------- step 0: the vocal tract ---------- */
const s0 = { place: 'bilabial', manner: 'stop', voiced: false };
const TONGUE = {
  bilabial: [[140, 150], [205, 146], [250, 156]], labiodental: [[140, 150], [205, 146], [250, 156]],
  dental: [[142, 152], [212, 142], [262, 139]], alveolar: [[140, 152], [205, 136], [248, 118]],
  postalveolar: [[142, 146], [224, 114], [246, 128]], velar: [[132, 114], [195, 142], [250, 158]],
};
const CONTACT = { bilabial: [304, 142], labiodental: [266, 140], dental: [262, 139], alveolar: [250, 117], postalveolar: [226, 113], velar: [134, 112] };
const ORAL = [[104, 248], [104, 180], [108, 136], [140, 124], [200, 124], [244, 128], [276, 140], [304, 143], [326, 143]];
const NASAL = [[104, 248], [104, 180], [100, 110], [112, 88], [200, 84], [270, 90], [304, 104], [326, 106]];
function along(path, s) {
  const L = []; let tot = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); L.push(d); tot += d; }
  let target = s * tot; for (let i = 0; i < L.length; i++) { if (target <= L[i]) { const f = target / L[i]; return [path[i][0] + f * (path[i + 1][0] - path[i][0]), path[i][1] + f * (path[i + 1][1] - path[i][1])]; } target -= L[i]; }
  return path[path.length - 1];
}
function nearestS(path, pt) { let best = 0, bd = Infinity; for (let i = 0; i <= 200; i++) { const q = along(path, i / 200), d = Math.hypot(q[0] - pt[0], q[1] - pt[1]); if (d < bd) { bd = d; best = i / 200; } } return best; }
// smooth curve through points (Catmull–Rom → Bézier)
function spline(ctx, pts) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
function drawMouth(time) {
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('cMouth'), W);
  const sc = Math.min((W - 16) / 330, (H - 34) / 272), ox = (W - 330 * sc) / 2, oy = 28;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(sc, sc); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const { place, manner, voiced } = s0, nasal = manner === 'nasal';
  const cyc = (time % 1.6) / 1.6, closedPhase = (manner === 'stop' || manner === 'affricate') && cyc < 0.55;
  const fricGap = manner === 'fricative' || (manner === 'affricate' && !closedPhase);
  // head silhouette, then the air spaces (nasal cavity, mouth, pharynx) cut out of it
  ctx.fillStyle = '#1d2b3b'; ctx.beginPath();
  [[50, 40], [250, 28], [286, 56], [320, 94], [304, 106], [312, 120], [308, 140], [312, 156], [306, 196], [244, 222], [206, 238], [200, 272], [40, 272]].forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#070b11'; ctx.beginPath();
  [[88, 256], [88, 94], [102, 76], [250, 70], [292, 88], [306, 104], [290, 99], [240, 97], [150, 97], [126, 103], [150, 113], [240, 113], [251, 119], [262, 124], [304, 134], [304, 150], [262, 158], [240, 170], [170, 200], [126, 240], [120, 256]].forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
  ctx.closePath(); ctx.fill();
  // upper and lower teeth
  ctx.fillStyle = '#d9e2ec'; ctx.fillRect(257, 121, 9, 17); ctx.fillRect(257, 152, 9, 12);
  // lips: closed for bilabial stop/nasal, lower lip tucked under the upper teeth for labiodental
  ctx.fillStyle = '#1d2b3b';
  if (place === 'bilabial') ctx.fillRect(268, 133, 40, fricGap ? 5 : 18);
  if (place === 'labiodental') { ctx.beginPath(); ctx.moveTo(304, 150); ctx.quadraticCurveTo(286, 136, 263, 139); ctx.lineTo(262, 156); ctx.closePath(); ctx.fill(); }
  // velum (soft palate): raised closes the way to the nose, lowered opens it
  ctx.strokeStyle = '#2c4157'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(156, 105);
  if (nasal) ctx.quadraticCurveTo(130, 110, 118, 140); else ctx.quadraticCurveTo(116, 104, 93, 118); ctx.stroke();
  // tongue
  const [B, F, T] = TONGUE[place].map(p => p.slice());
  if (fricGap && place !== 'bilabial' && place !== 'labiodental') { const tgt = place === 'velar' ? B : (place === 'postalveolar' ? F : T); tgt[1] += 5; }
  ctx.fillStyle = C.tongue; ctx.globalAlpha = 0.85; ctx.beginPath();
  spline(ctx, [[110, 236], [112, 186], B, F, T]); ctx.quadraticCurveTo(T[0] + 6, T[1] + 22, 248, 186); ctx.quadraticCurveTo(190, 214, 120, 246); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  // vocal folds and voicing wave
  const buzz = voiced ? Math.sin(time * 60) * 3 : 0;
  ctx.strokeStyle = voiced ? C.violet : C.tract; ctx.lineWidth = 3;
  const gap = voiced ? 2 + buzz * 0.6 : 8;
  ctx.beginPath(); ctx.moveTo(90, 252); ctx.lineTo(104 - gap / 2, 252); ctx.moveTo(104 + gap / 2, 252); ctx.lineTo(118, 252); ctx.stroke();
  if (voiced) { ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 30; x <= 84; x++) { const y = 262 + 6 * Math.sin((x - time * 90) / 4); if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
  // airflow particles
  const cs = nearestS(ORAL, CONTACT[place]);
  for (let i = 0; i < 30; i++) {
    let s = (hash(i) + time * 0.45) % 1;
    let path = ORAL;
    if (nasal) { path = NASAL; }
    else if (closedPhase) s = Math.min(s, cs - 0.015 - 0.04 * hash(i + 7));
    const [x, y] = along(path, s);
    ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill();
  }
  if (nasal) for (let i = 0; i < 8; i++) { const [x, y] = along(ORAL, cs * (0.55 + 0.4 * hash(i + 3))); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (fricGap) { const [cx, cy] = CONTACT[place]; for (let i = 0; i < 14; i++) { const a = hash(i + Math.floor(time * 20)) * 6.28, r = 3 + 9 * hash(i * 3 + Math.floor(time * 20)); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.85; ctx.fillRect(cx + 4 + Math.abs(Math.cos(a)) * r, cy + Math.sin(a) * r * 0.6, 2.4, 2.4); } ctx.globalAlpha = 1; }
  // constriction ring
  const [cx, cy] = CONTACT[place]; ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.stroke();
  // leader lines for the part labels
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(78, 108); ctx.lineTo(100, 114); ctx.moveTo(78, 246); ctx.lineTo(92, 251); ctx.stroke();
  ctx.restore();
  // part labels, placed in fixed spots (canvas pixels, not scaled glyphs)
  const P = (x, y) => [ox + x * sc, oy + y * sc];
  ctx.save(); ctx.fillStyle = C.muted;
  const lab = (key, x, y, align, maxW) => { const [X, Y] = P(x, y); ctx.textAlign = align; fitText(ctx, t(key), X, Y, maxW * sc, 11, '', 'system-ui,sans-serif', 7); };
  lab('mNose', 190, 88, 'center', 110); lab('mTongue', 180, 182, 'center', 70); lab('mVelum', 76, 111, 'right', 66); lab('mFolds', 76, 248, 'right', 66);
  ctx.restore();
}
function noteFor(p, m, v) { if (m === 'nasal') return 'nNasal'; if (m === 'fricative' && p === 'velar') return 'nX'; if (m === 'fricative' && p === 'bilabial') return 'nPhi'; return 'nGeneric'; }
function draw0Chart() {
  chart($('c0b'), { title: t('cChart'), cell: (c, p, m, v) => {
    const sel = p === s0.place && m === s0.manner && v === s0.voiced;
    return { fill: c ? C.cell : C.dim, outline: sel ? C.orange : null, sub: c ? c.ex : '' };
  } });
}
function readout0() {
  const c = M.find(s0.place, s0.manner, s0.voiced);
  const result = c ? t('resYes', { ipa: c.ipa, ex: c.ex }) : t('resNo', { note: t(noteFor(s0.place, s0.manner, s0.voiced)) });
  $('r0').textContent = t('s0readout', { place: placeName(s0.place), manner: mannerName(s0.manner), voice: t(s0.voiced ? 'vcOn' : 'vcOff'), result });
  document.querySelectorAll('#placeBtns .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === s0.place)));
  document.querySelectorAll('#mannerBtns .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === s0.manner)));
  document.querySelectorAll('#voiceBtns .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(s0.voiced))));
  document.querySelectorAll('#placeBtns .chip').forEach(b => { b.textContent = placeName(b.dataset.v); });
  document.querySelectorAll('#mannerBtns .chip').forEach(b => { b.textContent = mannerName(b.dataset.v); });
  document.querySelectorAll('#voiceBtns .chip').forEach(b => { b.textContent = t(b.dataset.v === 'true' ? 'vcShortOn' : 'vcShortOff'); });
}
function draw0() { draw0Chart(); readout0(); drawMouth(loop.time); }
const loop = { time: 0.9, id: null, last: null, visible: false };
function tick(now) {
  if (loop.last !== null) loop.time += Math.min(0.05, (now - loop.last) / 1000);
  loop.last = now; drawMouth(loop.time); loop.id = requestAnimationFrame(tick);
}
function updateLoop() {
  const run = loop.visible && !document.hidden && !reduceMotion();
  if (run && loop.id === null) { loop.last = null; loop.id = requestAnimationFrame(tick); }
  if (!run && loop.id !== null) { cancelAnimationFrame(loop.id); loop.id = null; if (reduceMotion()) loop.time = 0.9; drawMouth(loop.time); }
}

/* ---------- step 1: minimal pairs in a frame ---------- */
const s1 = { frame: 'ie', cons: 'θ' };
function draw1() {
  const F = M.FRAMES[s1.frame], sel = M.byIpa[s1.cons], nbs = M.neighbours(sel), nbSet = new Set(nbs.map(n => n.c.ipa));
  document.querySelectorAll('#frameBtns .chip').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.v === s1.frame)); b.textContent = t('fr' + cap(b.dataset.v)); });
  chart($('c1'), { title: t('fr' + cap(s1.frame)) + ' · ' + t('lgWord'), cell: c => {
    if (!c) return { fill: C.dim };
    const w = F.words[c.ipa];
    return { fill: w ? C.word : C.cell, outline: c === sel ? C.orange : (nbSet.has(c.ipa) ? C.cyan : null), sub: w || '', textColor: w ? C.text : C.muted };
  } });
  const cw = F.words[sel.ipa];
  const cur = cw ? t('curWord', { ipa: sel.ipa, rest: F.rest, w: cw }) : t('curNone', { ipa: sel.ipa, rest: F.rest });
  const list = nbs.length ? nbs.map(n => t('nbItem', { ipa: n.c.ipa, feat: featName(n.feature), w: F.words[n.c.ipa] || t('noWord') })).join(t('listSep')) : t('nbNone');
  const P = M.framePairs(s1.frame);
  const count = t('s1count', { n: P.words, all: P.all, one: P.one.length, pl: P.byFeature.place, mn: P.byFeature.manner, vc: P.byFeature.voicing });
  $('r1').textContent = t('s1readout', { cur, nbs: list, count });
  $('cons1').value = s1.cons;
}

/* ---------- step 2: voice onset time ---------- */
const VMIN = -160, VMAX = 120;
function draw2() {
  const v = Number($('vot2').value); $('vot2v').textContent = String(v);
  const { ctx, W, H } = fitCanvas($('c2'));
  const L = 40, R = W - 12, x = ms => L + (ms - VMIN) / (VMAX - VMIN) * (R - L);
  title(ctx, t('cWave'), W);
  const top = 30, bot = 140, mid = (top + bot) / 2, amp = (bot - top) / 2 - 4;
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(L, top, R - L, bot - top);
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(L, mid); ctx.lineTo(R, mid); ctx.stroke();
  // waveform samples, coloured by what produces them
  for (let ms = VMIN; ms <= VMAX; ms += 0.5) {
    let val = 0, col = null;
    if (v < 0 && ms >= v && ms < 0) { val = 0.3 * Math.sin(2 * Math.PI * ms / 8); col = C.violet; }
    if (ms >= 0 && ms < 2.5) { val = (hash(ms * 10) * 2 - 1) * (1 - ms / 2.5) + 0.6; col = C.text; }
    else if (v > 0 && ms >= 2.5 && ms < v) { val = (hash(ms * 7) * 2 - 1) * 0.32; col = C.orange; }
    else if (ms >= Math.max(v, 2.5)) { const on = ms - Math.max(v, 0); val = 0.85 * Math.sin(2 * Math.PI * ms / 8) * (1 - Math.exp(-on / 6)); col = C.cyan; }
    if (col) { ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x(ms), mid); ctx.lineTo(x(ms), mid - val * amp); ctx.stroke(); }
  }
  // VOT bracket from 0 to v
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x(0), bot + 4); ctx.lineTo(x(0), bot + 10); ctx.lineTo(x(v), bot + 10); ctx.lineTo(x(v), bot + 4); ctx.stroke();
  // ticks
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  const ticks = W < 420 ? [-150, -100, -50, 0, 50, 100] : [-150, -100, -50, 0, 25, 50, 75, 100];
  ticks.forEach(ms => ctx.fillText(String(ms), x(ms), bot + 24));
  // language strips
  [['en', 'langEn'], ['es', 'langEs'], ['th', 'langTh']].forEach(([key, name], i) => {
    const y0 = 190 + i * 76, h = 28;
    ctx.fillStyle = C.text; ctx.textAlign = 'left'; fitText(ctx, t(name), L, y0 - 8, R - L, 12, '600');
    const bs = [VMIN, ...M.boundaries(key), VMAX], cats = M.VOT[key];
    const cur = M.classify(key, v);
    cats.forEach((c, j) => {
      const a = x(bs[j]), b = x(bs[j + 1]);
      ctx.fillStyle = [C.violet, C.cyan, C.orange][c.cat === 'b' ? 0 : c.cat === 'p' ? 1 : 2]; ctx.globalAlpha = c.cat === cur ? 0.55 : 0.2; ctx.fillRect(a, y0, b - a, h); ctx.globalAlpha = 1;
      ctx.fillStyle = C.text; ctx.textAlign = 'center';
      const lab = '/' + c.cat + '/', lx = (a + b) / 2, mx = x(c.mean);
      // keep the label clear of the mean marker
      const lw = (ctx.font = `600 13px ${IPA_FONT}`, ctx.measureText(lab).width), place = Math.abs(lx - mx) < lw / 2 + 12 ? (mx - a > b - mx ? (a + mx) / 2 - 4 : (mx + b) / 2 + 4) : lx;
      if (b - a > lw + 30) fitText(ctx, lab, place, y0 + h / 2 + 5, lw + 2, 13, '600', IPA_FONT);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, y0 + h / 2, 6, 0, 7); ctx.stroke();
    });
    ctx.strokeStyle = C.bg; ctx.lineWidth = 2; M.boundaries(key).forEach(b => { ctx.beginPath(); ctx.moveTo(x(b), y0); ctx.lineTo(x(b), y0 + h); ctx.stroke(); });
  });
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ticks.forEach(ms => ctx.fillText(String(ms), x(ms), 190 + 2 * 76 + 28 + 16));
  // cursor through everything
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x(v), top); ctx.lineTo(x(v), 190 + 2 * 76 + 28); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  const kind = v < 0 ? t('kPre', { a: -v }) : v === 0 ? t('kZero') : t('kLag', { a: v });
  $('r2').textContent = t('s2readout', { v, kind, en: M.classify('en', v), es: M.classify('es', v), th: M.classify('th', v) });
}

/* ---------- step 3: onsets and sonority ---------- */
const s3 = { c1: 'b', c2: 'l' };
const VCOL = { single: C.single, english: C.word, sExc: C.teal, gap: C.gap, falls: C.falls };
function draw3() {
  const o = M.onset(s3.c1, s3.c2);
  $('c1sel').value = s3.c1; $('c2sel').value = s3.c2;
  // matrix
  let { ctx, W, H } = fitCanvas($('c3'));
  const cv = $('c3'); title(ctx, t('cMatrix'), W);
  const lab = 24, x0 = 8 + lab, top = 30, headH = 20, cw = (W - 8 - x0) / M.ONSET2.length, rh = (H - top - headH - 6) / M.ONSET1.length;
  const rects = [];
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = C.muted;
  M.ONSET2.forEach((b, j) => fitText(ctx, b || '—', x0 + (j + 0.5) * cw, top + 14, cw - 2, 13, '', IPA_FONT));
  M.ONSET1.forEach((a, i) => {
    const Y = top + headH + i * rh; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; fitText(ctx, a, 8 + lab / 2, Y + rh / 2 + 5, lab - 2, 13, '', IPA_FONT);
    M.ONSET2.forEach((b, j) => {
      const q = M.onset(a, b), X = x0 + j * cw;
      ctx.fillStyle = VCOL[q.verdict]; ctx.fillRect(X + 1, Y + 1, cw - 2, rh - 2);
      if (q.word) { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X + cw / 2, Y + rh / 2, Math.min(3.5, rh / 5), 0, 7); ctx.fill(); }
      if (a === s3.c1 && b === s3.c2) { ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.strokeRect(X + 1.5, Y + 1.5, cw - 3, rh - 3); }
      rects.push({ X, Y, w: cw, h: rh, a, b });
    });
  });
  ctx.restore(); cv._rects = rects;
  // sonority profile
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const segs = [...o.segs, 'ɪ', 'p'], son = [...o.son, 1], slots = [...o.segs.map(() => 'slotO'), 'slotN', 'slotC'];
  title(ctx, t('cSon', { syl: o.segs.join('') + 'ɪp' }), W);
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const ticks = ['sStop', 'sFric', 'sNasal', 'sLiq', 'sGlide', 'sVowel'];
  const tl = Math.min(W * 0.32, Math.max(...ticks.map(k => ctx.measureText(t(k)).width)) + 10);
  const L = 8 + tl, R = W - 12, T = 34, Bm = H - 50, y = s => Bm - s / 6.4 * (Bm - T);
  ticks.forEach((k, i) => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(L, y(i + 1)); ctx.lineTo(R, y(i + 1)); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; fitText(ctx, t(k), L - 5, y(i + 1) + 4, tl - 6, 11); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(L, Bm); ctx.lineTo(R, Bm); ctx.stroke();
  const bw = (R - L) / segs.length, bx = i => L + (i + 0.5) * bw;
  segs.forEach((sg, i) => {
    ctx.fillStyle = slots[i] === 'slotN' ? C.orange : slots[i] === 'slotO' ? C.cyan : C.violet; ctx.globalAlpha = 0.75;
    ctx.fillRect(bx(i) - bw * 0.3, y(son[i]), bw * 0.6, Bm - y(son[i])); ctx.globalAlpha = 1;
    ctx.fillStyle = C.text; ctx.textAlign = 'center'; fitText(ctx, sg, bx(i), Bm + 18, bw - 4, 15, '', IPA_FONT);
    ctx.fillStyle = C.muted; fitText(ctx, t(slots[i]), bx(i), Bm + 36, bw - 4, 11);
  });
  // connecting line: green where it moves the expected way (up before the nucleus, down after), pink otherwise
  const nuc = o.segs.length;
  for (let i = 1; i < segs.length; i++) {
    const good = i <= nuc ? son[i] > son[i - 1] : son[i] < son[i - 1];
    ctx.strokeStyle = good ? C.green : C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx(i - 1), y(son[i - 1])); ctx.lineTo(bx(i), y(son[i])); ctx.stroke();
  }
  segs.forEach((_, i) => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(bx(i), y(son[i]), 4, 0, 7); ctx.fill(); });
  ctx.restore();
  // readout with whole-chart counts
  const cnt = { english: 0, sExc: 0, gap: 0, falls: 0 }; let n = 0;
  M.ONSET1.forEach(a => M.ONSET2.forEach(b => { if (!b) return; n++; cnt[M.onset(a, b).verdict]++; }));
  const verdict = t('v' + cap(o.verdict), { son: o.son.join(' → ') });
  $('r3').textContent = t('s3readout', { syl: o.segs.join('') + 'ɪp', verdict, word: o.word ? t('wordYes', { w: o.word }) : '', count: t('s3count', { n, eng: cnt.english + cnt.sExc, sx: cnt.sExc, gap: cnt.gap, falls: cnt.falls }) });
}

/* ---------- step 4: suffix assimilation ---------- */
const s4 = { suf: 'plural', stem: 0, cell: null };
const SCOL = { sibilant: C.pink, alveolarStop: C.pink, voiceless: C.cyan, voiced: C.violet };
function rule4(seg) { return s4.suf === 'plural' ? M.plural(seg) : M.past(seg); }
function buildStems() {
  const box = $('stemBtns'); box.innerHTML = '';
  M.STEMS[s4.suf].forEach((st, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.step = '4'; b.textContent = st[0]; b.addEventListener('click', () => { s4.stem = i; s4.cell = null; draw4(); }); box.appendChild(b); });
}
function draw4() {
  const stem = s4.cell === null ? M.STEMS[s4.suf][s4.stem] : null, last = stem ? stem[2] : s4.cell;
  $('sufPl').setAttribute('aria-pressed', String(s4.suf === 'plural')); $('sufPa').setAttribute('aria-pressed', String(s4.suf === 'past'));
  document.querySelectorAll('#stemBtns .chip').forEach((b, i) => b.setAttribute('aria-pressed', String(stem !== null && i === s4.stem)));
  const vowelRes = rule4('V');
  chart($('c4'), { title: t('cRule', { suf: t(s4.suf === 'plural' ? 'sufPl' : 'sufPa') }), extraRow: { fill: SCOL[vowelRes.rule], label: t('rowVowel') + ' → [' + vowelRes.form + ']', outline: last === 'V' ? '#08131c' : null, textColor: '#08131c' },
    cell: c => {
      if (!c) return { fill: C.dim };
      const r = rule4(c.ipa); return { fill: SCOL[r.rule], outline: c.ipa === last ? '#08131c' : null, sub: '[' + r.form + ']', textColor: '#08131c', subColor: '#08131c' };
    } });
  const keys = s4.suf === 'plural' ? ['lgIz', 'lgS', 'lgZ'] : ['lgId', 'lgT', 'lgD'], cols = [C.pink, C.cyan, C.violet];
  $('lg4').innerHTML = keys.map((k, i) => `<span class="lg"><span class="sw" style="background:${cols[i]}"></span><span class="ipa">${t(k)}</span></span>`).join('') + `<span class="lg"><span class="sw" style="background:#9aaabd;box-shadow:inset 0 0 0 2px #08131c"></span><span>${t('lgSel')}</span></span>`;
  const r = rule4(last), u = s4.suf === 'plural' ? 'z' : 'd';
  const featKey = last === 'V' ? 'fVowel' : s4.suf === 'plural' ? (r.rule === 'sibilant' ? 'fSib' : r.rule === 'voiceless' ? 'fVl' : 'fVd') : (r.rule === 'alveolarStop' ? 'fAlv' : r.rule === 'voiceless' ? 'fVlP' : 'fVdP');
  const ruleKey = r.rule === 'sibilant' || r.rule === 'alveolarStop' ? 'rIns' : r.rule === 'voiceless' ? 'rVl' : 'rVd';
  const lastSym = last === 'V' ? (stem ? stem[1].slice(-2) : 'V') : last;
  const lines = [];
  if (stem) {
    lines.push(t('d1', { stem: stem[0], ipa: stem[1], last: '/' + lastSym + '/', feat: t(featKey) }));
    lines.push(t('d2', { ipa: stem[1], u })); lines.push(t('d3', { rule: t(ruleKey) })); lines.push(t('d4', { surface: stem[1] + r.form }));
    if (stem[0] === 'wug' || stem[0] === 'plip') lines.push(t('dNonce', { w: stem[0] }));
  } else {
    lines.push(t('d1cell', { last: '/' + lastSym + '/', feat: t(featKey) }));
    lines.push(t('d2', { ipa: '…' + lastSym, u })); lines.push(t('d3', { rule: t(ruleKey) })); lines.push(t('d4', { surface: '…' + lastSym + r.form }));
  }
  $('deriv4').innerHTML = lines.map(s => `<li class="ipa"></li>`).join('');
  [...$('deriv4').children].forEach((li, i) => { li.textContent = lines[i]; });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function chipGroup(boxId, values, onPick) {
  const box = $(boxId);
  values.forEach(v => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.v = String(v); b.dataset.step = boxId === 'frameBtns' ? '1' : '0'; b.addEventListener('click', () => onPick(v)); box.appendChild(b); });
}
function setup() {
  chipGroup('placeBtns', M.PLACES, v => { s0.place = v; draw0(); });
  chipGroup('mannerBtns', M.MANNERS, v => { s0.manner = v; draw0(); });
  chipGroup('voiceBtns', [false, true], v => { s0.voiced = v; draw0(); });
  $('c0b').addEventListener('click', e => { const q = hit($('c0b'), e); if (q && !q.extra) { s0.place = q.place; s0.manner = q.manner; s0.voiced = q.voiced; draw0(); } });

  chipGroup('frameBtns', ['at', 'ip', 'ie'], v => { s1.frame = v; draw1(); });
  M.CONS.forEach(c => { const o = document.createElement('option'); o.value = c.ipa; o.textContent = '/' + c.ipa + '/'; $('cons1').appendChild(o); });
  $('cons1').addEventListener('change', () => { s1.cons = $('cons1').value; draw1(); });
  $('c1').addEventListener('click', e => { const q = hit($('c1'), e); if (q && q.c) { s1.cons = q.c.ipa; draw1(); } });

  $('vot2').addEventListener('input', draw2);
  let sweepId = null;
  $('sweep2').addEventListener('click', () => {
    if (sweepId) cancelAnimationFrame(sweepId);
    const from = -150, to = 110;
    if (reduceMotion()) { $('vot2').value = to; draw2(); return; }
    const start = performance.now();
    const step = now => { const p = Math.min(1, (now - start) / 5200); $('vot2').value = Math.round((from + p * (to - from)) / 5) * 5; draw2(); sweepId = p < 1 && !document.hidden ? requestAnimationFrame(step) : null; };
    sweepId = requestAnimationFrame(step);
  });
  $('vot2').addEventListener('pointerdown', () => { if (sweepId) { cancelAnimationFrame(sweepId); sweepId = null; } });

  M.ONSET1.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; $('c1sel').appendChild(o); });
  M.ONSET2.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b || '—'; $('c2sel').appendChild(o); });
  $('c1sel').addEventListener('change', () => { s3.c1 = $('c1sel').value; draw3(); });
  $('c2sel').addEventListener('change', () => { s3.c2 = $('c2sel').value; draw3(); });
  $('c3').addEventListener('click', e => { const q = hit($('c3'), e); if (q) { s3.c1 = q.a; s3.c2 = q.b; draw3(); } });

  $('sufPl').addEventListener('click', () => { s4.suf = 'plural'; s4.stem = 0; s4.cell = null; buildStems(); draw4(); });
  $('sufPa').addEventListener('click', () => { s4.suf = 'past'; s4.stem = 0; s4.cell = null; buildStems(); draw4(); });
  $('c4').addEventListener('click', e => { const q = hit($('c4'), e); if (!q) return; if (q.extra) s4.cell = 'V'; else if (q.c) s4.cell = q.c.ipa; else return; draw4(); });
  buildStems();
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    new IntersectionObserver(es => { loop.visible = es[0].isIntersecting; updateLoop(); }).observe($('c0'));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', updateLoop);
  if (window.matchMedia) { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); if (mq.addEventListener) mq.addEventListener('change', updateLoop); }
  window.refreshPhonemes = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
