'use strict';
// Mass conservation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, mass and reading comes from window.MASS_MODEL (model.js). Canvas text sits in fixed rows
// (titles, balance displays, axis ticks, pan labels); legends and long numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MASS_MODEL;
const I = window.LESSON_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', glass: '#9fc3e0', liquid: 'rgba(47,111,159,0.55)' };
const SUB = { CaCO3: '#8f9db0', HCl: '#ffd166', water: '#2f6f9f', CaCl2: '#7ee2a8', CO2: '#67d7f9' };
const EL = { H: '#e8edf4', C: '#6b7a8c', O: '#ff6b6b', Ca: '#7ee2a8', Cl: '#c6e86b', Mg: '#b79cff' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const FONT = 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
// Trim trailing zeros only when there is a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const g1 = v => (Math.abs(v) < 0.05 ? 0 : v).toFixed(1); // balance displays: one fixed decimal, like a real scale

function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = heightFor ? heightFor(width) : Number(canvas.getAttribute('height')) || 300;
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
// A text line that never leaves maxW: shrinks to 10px, then wraps. Returns the y of the next free row.
function textRow(ctx, text, x, y, maxW, { size = 12, weight = 600, color = C.text, lh = 1.35 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let s = size; const font = v => `${weight} ${v}px ${FONT}`; ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 10) { s -= 0.5; ctx.font = font(s); }
  const lines = [];
  if (ctx.measureText(text).width <= maxW) lines.push(text);
  else {
    const tokens = /\s/.test(text) ? text.split(/(\s+)/) : [...text]; let cur = '';
    for (const tok of tokens) { const next = cur + tok; if (cur && ctx.measureText(next.trimEnd()).width > maxW) { lines.push(cur.trimEnd()); cur = tok.trimStart(); } else cur = next; }
    if (cur.trim()) lines.push(cur.trimEnd());
  }
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * s * lh));
  ctx.restore();
  return y + lines.length * s * lh;
}
function label(ctx, text, x, y, { size = 11, color = C.muted, align = 'left', weight = 400, base = 'alphabetic', mono = false } = {}) {
  ctx.save(); ctx.font = `${weight} ${size}px ${mono ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(text, x, y); ctx.restore();
}
function dot(ctx, x, y, r, color, { alpha = 1, stroke = null } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } ctx.restore();
}
// Plot frame with y ticks on the left and x ticks (labels given) below. Returns scale functions.
function frame(ctx, P, o) {
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.font = `400 11px ${FONT}`; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : String(v), P.l - 6, y(v) + 4); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  for (const v of o.xTicks || []) { ctx.textAlign = v === o.xMin ? 'left' : v === o.xMax ? 'right' : 'center'; ctx.fillText(o.xFmt ? o.xFmt(v) : String(v), x(v), P.b + 15); }
  ctx.restore();
  return { x, y };
}
// Seeded positions so the pictures do not jitter between redraws.
function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

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
// Drive a 0–100 slider from 0 to 100, recording every integer it passes (reduced motion: record all at once).
function sweep(name, sliderId, ms, onStep) {
  $(sliderId).value = 0; onStep(0, true);
  animate(name, ms, p => { const v = Math.round(p * 100); const from = Number($(sliderId).value); $(sliderId).value = v; for (let k = from; k <= v; k++) onStep(k, k === v); });
}

/* ---------- shared scene: balance + flask / crucible ---------- */
function drawScale(ctx, cx, top, w, reading) {
  ctx.save(); ctx.fillStyle = '#1c2a3a'; ctx.strokeStyle = '#3b5068'; ctx.lineWidth = 1.2;
  ctx.fillRect(cx - w / 2, top, w, 8); ctx.strokeRect(cx - w / 2, top, w, 8);
  ctx.fillRect(cx - w / 2 + 8, top + 8, w - 16, 40); ctx.strokeRect(cx - w / 2 + 8, top + 8, w - 16, 40);
  ctx.fillStyle = '#07131a'; ctx.fillRect(cx - 50, top + 16, 100, 24); ctx.restore();
  label(ctx, reading + ' g', cx, top + 33, { size: 15, color: C.green, align: 'center', weight: 700, mono: true });
}
// Conical flask standing on y = base, height h. CO₂ dots: sealed → trapped in the flask; open → rising away above it.
function drawFlask(ctx, cx, base, h, p, open) {
  const neckW = h * 0.24, bodyW = h * 0.86, neckH = h * 0.26, mouthY = base - h;
  const shape = () => { ctx.beginPath(); ctx.moveTo(cx - neckW / 2, mouthY); ctx.lineTo(cx - neckW / 2, mouthY + neckH); ctx.lineTo(cx - bodyW / 2, base); ctx.lineTo(cx + bodyW / 2, base); ctx.lineTo(cx + neckW / 2, mouthY + neckH); ctx.lineTo(cx + neckW / 2, mouthY); };
  // liquid: bottom 42% of the height
  const lq = base - h * 0.42, half = y => neckW / 2 + (bodyW - neckW) / 2 * (y - (mouthY + neckH)) / (base - (mouthY + neckH));
  ctx.save(); ctx.fillStyle = C.liquid; ctx.beginPath(); ctx.moveTo(cx - half(lq), lq); ctx.lineTo(cx + half(lq), lq); ctx.lineTo(cx + bodyW / 2, base); ctx.lineTo(cx - bodyW / 2, base); ctx.closePath(); ctx.fill(); ctx.restore();
  // marble chips: one per gram of CaCO₃ left
  const chips = Math.ceil(M.marbleContents(p).CaCO3 - 1e-9), r = rand(7);
  for (let k = 0; k < 10; k++) { const x = cx - bodyW * 0.36 + r() * bodyW * 0.72, y = base - 6 - r() * 8; if (k < chips) { ctx.save(); ctx.fillStyle = SUB.CaCO3; ctx.beginPath(); ctx.ellipse(x, y, 7, 4.5, r() * 3, 0, 7); ctx.fill(); ctx.restore(); } else r(); }
  // CO₂: 20 dots at 100 %
  const n = Math.round(p * 20), q = rand(11);
  for (let k = 0; k < n; k++) {
    const u = q(), v = q();
    if (open) dot(ctx, cx + (u - 0.5) * (neckW + k * 5), mouthY - 10 - v * Math.min(70, mouthY - 30) * (0.3 + k / 20), 3, C.cyan, { alpha: 0.8 });
    else { const y = mouthY + 8 + v * (lq - mouthY - 16); dot(ctx, cx + (u - 0.5) * 1.6 * (half(Math.max(y, mouthY + neckH)) - 4), y, 3, C.cyan, { alpha: 0.85 }); }
  }
  ctx.save(); ctx.strokeStyle = C.glass; ctx.lineWidth = 2; shape(); ctx.stroke(); ctx.restore();
  if (!open) { ctx.save(); ctx.fillStyle = '#a8763e'; ctx.fillRect(cx - neckW / 2 - 2, mouthY - 10, neckW + 4, 12); ctx.restore(); }
}

/* ---------- step 0: sealed flask + stacked bar ---------- */
const s0 = { bet: null };
const BET_KEYS = { up: 'betUp', down: 'betDown', same: 'betSame' };
function sceneLayout(W, H, titleBottom) {
  const wide = W >= 600, sceneW = wide ? W * 0.56 : W, sceneH = wide ? H : 230;
  return { wide, sceneW, sceneH, cx: sceneW / 2, scaleTop: (wide ? H : sceneH) - 56, sideX: wide ? sceneW : 0, sideY: wide ? titleBottom : sceneH + 6 };
}
function draw0() {
  const p = num('p0') / 100, c = M.marbleContents(p), reading = M.marbleReading(p, false), r0 = M.marbleReading(0, false);
  $('p0v').textContent = num('p0') + '%';
  const { ctx, W, H } = fitCanvas($('c0'), w => (w >= 600 ? 340 : 470));
  const y0 = textRow(ctx, t('c0scene', { p: num('p0') }), 10, 20, (W >= 600 ? W * 0.56 : W) - 20, { size: 13 });
  const L = sceneLayout(W, H, 0);
  const fh = Math.min(170, L.scaleTop - y0 - 24);
  drawFlask(ctx, L.cx, L.scaleTop - 2, fh, p, false);
  drawScale(ctx, L.cx, L.scaleTop, Math.min(220, L.sceneW - 30), g1(reading));
  // stacked bar of contents
  const bx = L.wide ? L.sideX + 10 : 10, bw = L.wide ? W - L.sideX - 20 : W - 20, by = L.wide ? 20 : L.sideY + 14;
  const yb = textRow(ctx, t('c0bar'), bx, by, bw, { size: 13 });
  const P = { l: bx + 38, r: bx + Math.min(bw, 260), t: yb + 8, b: H - 22 };
  const f = frame(ctx, P, { xMin: 0, xMax: 1, yMin: 0, yMax: 120, yTicks: [0, 40, 80, 120] });
  const order = [['water', c.water], ['HCl', c.HCl], ['CaCO3', c.CaCO3], ['CaCl2', c.CaCl2], ['CO2', c.CO2]];
  let acc = 0; const barL = f.x(0.12), barW = f.x(0.62) - f.x(0.12);
  for (const [k, v] of order) { if (v <= 0) continue; ctx.fillStyle = SUB[k]; ctx.fillRect(barL, f.y(acc + v), barW, f.y(acc) - f.y(acc + v)); acc += v; }
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(barL - 6, f.y(acc)); ctx.lineTo(barL + barW + 6, f.y(acc)); ctx.stroke(); ctx.restore();
  label(ctx, fmt(acc) + ' g', barL + barW + 10, f.y(acc) + 4, { size: 12, color: C.text, weight: 600 });
  $('r0').textContent = t('s0readout', { p: num('p0'), caco3: fmt(c.CaCO3), hcl: fmt(c.HCl), water: fmt(c.water), cacl2: fmt(c.CaCl2), co2: fmt(c.CO2), sum: fmt(M.sum(c)), reading: g1(reading), r0: g1(r0) });
  $('v0').textContent = num('p0') === 100 ? t('s0verdict', { bet: s0.bet ? t(BET_KEYS[s0.bet]) : t('betNone'), r0: g1(r0) }) : '';
  const fb = $('betFeedback'); fb.textContent = s0.bet ? t('betDone', { bet: t(BET_KEYS[s0.bet]) }) : fb.dataset.pick ? t('betPick') : '';
}

/* ---------- step 1: atoms regroup ---------- */
const s1 = { rx: 'hydrogen' };
const eqText = terms => terms.map(([sp, k]) => (k > 1 ? k : '') + M.SPECIES[sp].f).join(' + ');
function layoutRow(terms, W, r, cy) {
  // molecules left to right with gaps; '+' between species groups. Returns atom positions and plus marks.
  const groups = []; let width = 0;
  terms.forEach(([sp, k], gi) => {
    const xs = M.SPECIES[sp].atoms.map(([el, x]) => [x - M.RADIUS[el], x + M.RADIUS[el]]), lo = Math.min(...xs.map(a => a[0])), hi = Math.max(...xs.map(a => a[1]));
    for (let i = 0; i < k; i++) { groups.push({ sp, lo, hi }); width += hi - lo; if (i < k - 1) width += 0.9; }
    if (gi < terms.length - 1) width += 3;
  });
  const scale = Math.min(r, (W - 24) / width), out = [], plus = [];
  let x = (W - width * scale) / 2, idx = 0;
  terms.forEach(([sp, k], gi) => {
    for (let i = 0; i < k; i++) {
      const g = groups[idx++], cx = x - g.lo * scale;
      M.SPECIES[sp].atoms.forEach(([el, ax, ay]) => out.push({ el, x: cx + ax * scale, y: cy + ay * scale, r: M.RADIUS[el] * scale * 0.95 }));
      x += (g.hi - g.lo) * scale; if (i < k - 1) x += 0.9 * scale;
    }
    if (gi < terms.length - 1) { plus.push(x + 1.5 * scale); x += 3 * scale; }
  });
  return { atoms: out, plus, scale };
}
function draw1() {
  const rx = M.REACTIONS[s1.rx], g = num('g1') / 100, e = g < 0.5 ? 2 * g * g : 1 - Math.pow(-2 * g + 2, 2) / 2;
  $('g1v').textContent = num('g1') + '%';
  document.querySelectorAll('[data-rx][data-step="1"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rx === s1.rx ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c1'), w => (w >= 600 ? 320 : 300));
  const yA = textRow(ctx, t('c1top', { eq: eqText(rx.left) }), 10, 20, W - 20, { size: 13 });
  // titles sit at the very top and bottom so atoms in transit never cross them
  ctx.save(); ctx.font = `600 13px ${FONT}`; const botLines = ctx.measureText(t('c1bot', { eq: eqText(rx.right) })).width > W - 20 ? 2 : 1; ctx.restore();
  const botTitleY = H - 12 - (botLines - 1) * 17;
  textRow(ctx, t('c1bot', { eq: eqText(rx.right) }), 10, botTitleY, W - 20, { size: 13 });
  const span = botTitleY - 18 - yA;
  const topRow = layoutRow(rx.left, W, 18, yA + span * 0.27);
  const botRow = layoutRow(rx.right, W, 18, yA + span * 0.8);
  // ghosts at both rows
  [topRow, botRow].forEach(row => row.atoms.forEach(a => dot(ctx, a.x, a.y, a.r, EL[a.el], { alpha: 0.14 })));
  [topRow, botRow].forEach(row => row.plus.forEach(x => label(ctx, '+', x, row.atoms[0].y + 5, { size: 16, color: C.muted, align: 'center' })));
  const pair = M.pairing(rx);
  topRow.atoms.forEach((a, i) => { const b = botRow.atoms[pair[i]]; dot(ctx, a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e, a.r + (b.r - a.r) * e, EL[a.el], { stroke: '#0d1621' }); });
  const L = M.count(rx.left), R = M.count(rx.right), els = M.elementsOf(rx);
  $('lg1').innerHTML = els.map(el => `<span class="lg"><span class="sw sw-atom" style="background:${EL[el]}"></span><span>${t('el' + el)}</span></span>`).join('');
  const rows = els.map(el => t('row', { el: t('el' + el), l: L[el], r: R[el], mark: L[el] === R[el] ? ' ✓' : ' ✗' })).join(I.getLang() === 'zh' ? '；' : '; ');
  $('r1').textContent = t('s1readout', { eq: eqText(rx.left) + ' → ' + eqText(rx.right), rows });
}

/* ---------- step 2: coefficients, atom bars and the balance ---------- */
const S2RX = { hydrogen: { left: ['H2', 'O2'], right: ['H2O'] }, methane: { left: ['CH4', 'O2'], right: ['CO2', 'H2O'] } };
const s2 = { rx: 'hydrogen', k: [1, 1, 1, 1] };
function buildCoefs() {
  const def = S2RX[s2.rx], all = [...def.left, ...def.right], box = $('coefs'); box.innerHTML = '';
  all.forEach((sp, i) => {
    const lab = document.createElement('label');
    lab.innerHTML = `<span class="coef-name"></span><output id="k${i}v"></output><input id="k${i}" data-step="2" type="range" min="1" max="4" step="1" value="${s2.k[i]}">`;
    box.appendChild(lab);
    lab.querySelector('input').addEventListener('input', ev => { s2.k[i] = Number(ev.target.value); draw2(); });
  });
}
function terms2() { const def = S2RX[s2.rx]; return { left: def.left.map((sp, i) => [sp, s2.k[i]]), right: def.right.map((sp, i) => [sp, s2.k[def.left.length + i]]) }; }
function draw2() {
  const def = S2RX[s2.rx], all = [...def.left, ...def.right];
  document.querySelectorAll('[data-rx][data-step="2"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rx === s2.rx ? 'true' : 'false'));
  all.forEach((sp, i) => { $('k' + i + 'v').textContent = String(s2.k[i]); $('k' + i).closest('label').querySelector('.coef-name').textContent = t('coef', { sp: M.SPECIES[sp].f }); });
  const { left, right } = terms2(), Ld = M.ledger(left, right);
  const { ctx, W, H } = fitCanvas($('c2'), w => (w >= 600 ? 400 : 430));
  // bars
  const yT = textRow(ctx, t('c2bars'), 10, 20, W - 20, { size: 13 });
  const maxC = Math.max(4, ...Ld.rows.map(r => Math.max(r.left, r.right))), yMax = Math.ceil(maxC / 4) * 4;
  const P = { l: 34, r: W - 12, t: yT + 18, b: H * 0.5 };
  const f = frame(ctx, P, { xMin: 0, xMax: Ld.rows.length, yMin: 0, yMax, yTicks: [0, yMax / 2, yMax] });
  const slot = (P.r - P.l) / Ld.rows.length, bw = Math.min(34, slot * 0.28);
  Ld.rows.forEach((row, i) => {
    const mid = P.l + slot * (i + 0.5);
    [[row.left, C.cyan, -1], [row.right, C.orange, 1]].forEach(([v, col, sgn]) => {
      const x = mid + sgn * (bw / 2 + 3) - bw / 2;
      ctx.fillStyle = col; ctx.fillRect(x, f.y(v), bw, P.b - f.y(v));
      label(ctx, String(v), x + bw / 2, f.y(v) - 4, { size: 11, color: C.text, align: 'center' });
    });
    label(ctx, row.el + (row.ok ? ' ✓' : ' ✗'), mid, P.b + 15, { size: 12, color: row.ok ? C.green : C.pink, align: 'center', weight: 700 });
  });
  // balance beam
  const yB = textRow(ctx, t('c2beam'), 10, P.b + 42, W - 20, { size: 13 });
  const cx = W / 2, pivot = yB + 40, Lh = Math.min(W * 0.3, 180), th = M.tilt(Ld.mL, Ld.mR);
  const ex = Lh * Math.cos(th), ey = Lh * Math.sin(th);
  ctx.save(); ctx.fillStyle = '#3b5068'; ctx.beginPath(); ctx.moveTo(cx, pivot); ctx.lineTo(cx - 14, pivot + 56); ctx.lineTo(cx + 14, pivot + 56); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - ex, pivot - ey); ctx.lineTo(cx + ex, pivot + ey); ctx.stroke();
  const pan = (x, y, col) => { ctx.strokeStyle = '#8696aa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 26); ctx.moveTo(x, y); ctx.lineTo(x + 18, y + 26); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 24, y + 26); ctx.lineTo(x + 24, y + 26); ctx.stroke(); };
  pan(cx - ex, pivot - ey, C.cyan); pan(cx + ex, pivot + ey, C.orange); ctx.restore();
  label(ctx, t('panL', { m: fmt(Ld.mL) }), cx - ex, pivot - ey + 42, { size: 12, color: C.cyan, align: 'center', weight: 600 });
  label(ctx, t('panR', { m: fmt(Ld.mR) }), cx + ex, pivot + ey + 42, { size: 12, color: C.orange, align: 'center', weight: 600 });
  const sep = I.getLang() === 'zh' ? '；' : '; ';
  const rows = Ld.rows.map(r => t('row', { el: t('el' + r.el), l: r.left, r: r.right, mark: r.ok ? ' ✓' : ' ✗' })).join(sep);
  const bad = Ld.rows.filter(r => !r.ok).map(r => r.el).join(I.getLang() === 'zh' ? '、' : ', ');
  const verdict = Ld.balanced ? t('vBalanced') : Ld.massEqual ? t('vMassOnly', { bad }) : t('vNot', { bad });
  $('r2').textContent = t('s2readout', { eq: eqText(left) + ' → ' + eqText(right), rows, mL: fmt(Ld.mL), mR: fmt(Ld.mR), verdict });
}

/* ---------- step 3: sealed vs open ---------- */
const s3 = { mode: 'open', trail: { sealed: new Map(), open: new Map() } };
function draw3() {
  const p = num('p3') / 100, open = s3.mode === 'open', reading = M.marbleReading(p, open), r0 = M.marbleReading(0, false), co2 = M.marbleContents(p).CO2;
  s3.trail[s3.mode].set(num('p3'), reading);
  $('p3v').textContent = num('p3') + '%';
  ['sealed', 'open'].forEach(m => $('mode3' + m).setAttribute('aria-pressed', s3.mode === m ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c3'), w => (w >= 600 ? 340 : 480));
  const wide = W >= 600, sceneW = wide ? W * 0.45 : W;
  const y0 = textRow(ctx, t('c3scene', { mode: t(open ? 'modeOpen' : 'modeSealed'), p: num('p3') }), 10, 20, sceneW - 20, { size: 13 });
  const scaleTop = (wide ? H : 240) - 56, fh = Math.min(160, scaleTop - y0 - 50);
  drawFlask(ctx, sceneW / 2, scaleTop - 2, fh, p, open);
  drawScale(ctx, sceneW / 2, scaleTop, Math.min(220, sceneW - 30), g1(reading));
  const px = wide ? sceneW + 10 : 10, pw = wide ? W - sceneW - 20 : W - 20, py = wide ? 20 : 262;
  const yp = textRow(ctx, t('c3plot'), px, py, pw, { size: 13 });
  const P = { l: px + 40, r: px + pw - 8, t: yp + 10, b: H - 24 };
  const f = frame(ctx, P, { xMin: 0, xMax: 100, yMin: 254, yMax: 261, yTicks: [255, 257, 259, 261], xTicks: [0, 50, 100], xFmt: v => v + '%' });
  for (const [m, col] of [['sealed', C.cyan], ['open', C.orange]]) {
    const pts = [...s3.trail[m].entries()].sort((a, b) => a[0] - b[0]);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath();
    pts.forEach(([x, v], i) => { const X = f.x(x), Y = f.y(v); if (i && x - pts[i - 1][0] > 1) ctx.moveTo(X, Y); else if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.stroke(); ctx.restore();
  }
  dot(ctx, f.x(num('p3')), f.y(reading), 5, open ? C.orange : C.cyan, { stroke: C.text });
  $('r3').textContent = open ? t('s3readoutOpen', { p: num('p3'), r: fmt(reading), drop: fmt(r0 - reading), co2: fmt(co2), r0: fmt(r0) }) : t('s3readoutSealed', { p: num('p3'), r: fmt(reading), co2: fmt(co2) });
  $('s3hint').textContent = t('s3hint', { gap: fmt(M.marbleReading(1, false) - M.marbleReading(1, true)) });
}

/* ---------- step 4: magnesium burns ---------- */
const s4 = { trail: new Map() };
function draw4() {
  const p = num('p4') / 100, q = M.magnesium(p), q1 = M.magnesium(1), q0 = M.magnesium(0);
  s4.trail.set(num('p4'), q.solid);
  $('p4v').textContent = num('p4') + '%';
  const { ctx, W, H } = fitCanvas($('c4'), w => (w >= 600 ? 340 : 480));
  const wide = W >= 600, sceneW = wide ? W * 0.45 : W;
  const y0 = textRow(ctx, t('c4scene', { p: num('p4') }), 10, 20, sceneW - 20, { size: 13 });
  const scaleTop = (wide ? H : 240) - 56, cx = sceneW / 2;
  // crucible
  const cw = 92, ch = 44, cTop = scaleTop - ch;
  ctx.save(); ctx.fillStyle = '#2a3646'; ctx.strokeStyle = C.glass; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - cw / 2, cTop); ctx.lineTo(cx - cw / 2 + 12, scaleTop); ctx.lineTo(cx + cw / 2 - 12, scaleTop); ctx.lineTo(cx + cw / 2, cTop); ctx.stroke(); ctx.restore();
  // white MgO powder pile grows, grey ribbon zig-zag shrinks
  const pile = q.MgO / q1.MgO;
  if (pile > 0) { ctx.save(); ctx.fillStyle = '#f2f4f7'; ctx.beginPath(); ctx.ellipse(cx, scaleTop - 4, 34 * Math.sqrt(pile) + 2, 16 * pile + 2, 0, Math.PI, 0); ctx.fill(); ctx.restore(); }
  const segs = Math.round(8 * (1 - p));
  ctx.save(); ctx.strokeStyle = '#b8c2cc'; ctx.lineWidth = 3; ctx.beginPath();
  for (let k = 0; k <= segs; k++) { const x = cx - 30 + k * 7.5, y = cTop - 8 - (k % 2) * 14; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  if (segs > 0) ctx.stroke(); ctx.restore();
  // O₂ molecules still in the air that will react (8 pairs at the start), drifting toward the crucible
  const left = Math.round(8 * (1 - p)), r = rand(5), skyTop = y0 + 8, skyBot = cTop - 30;
  for (let k = 0; k < 8; k++) { const x = cx - sceneW * 0.38 + r() * sceneW * 0.76, y = skyTop + r() * Math.max(10, skyBot - skyTop); if (k < left) { dot(ctx, x - 4, y, 4, '#ff6b6b'); dot(ctx, x + 4, y, 4, '#ff6b6b'); } }
  drawScale(ctx, cx, scaleTop, Math.min(220, sceneW - 30), g1(q.reading));
  // plot
  const px = wide ? sceneW + 10 : 10, pw = wide ? W - sceneW - 20 : W - 20, py = wide ? 20 : 262;
  const yp = textRow(ctx, t('c4plot'), px, py, pw, { size: 13 });
  const P = { l: px + 34, r: px + pw - 8, t: yp + 10, b: H - 24 };
  const f = frame(ctx, P, { xMin: 0, xMax: 100, yMin: 2, yMax: 4.5, yTicks: [2, 3, 4], xTicks: [0, 50, 100], xFmt: v => v + '%' });
  // gap = oxygen not yet in
  ctx.save(); ctx.fillStyle = 'rgba(255,107,107,0.18)'; ctx.beginPath(); ctx.moveTo(f.x(num('p4')), f.y(q.solid)); ctx.lineTo(f.x(num('p4')), f.y(q.solid + (q.O2total - q.O2in))); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,107,107,0.55)'; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x(0), f.y(q0.solid + q0.O2total)); ctx.lineTo(f.x(100), f.y(q1.solid)); ctx.stroke(); ctx.restore();
  const pts = [...s4.trail.entries()].sort((a, b) => a[0] - b[0]);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath();
  pts.forEach(([x, v], i) => { const X = f.x(x), Y = f.y(v); if (i && x - pts[i - 1][0] > 1) ctx.moveTo(X, Y); else if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
  ctx.stroke(); ctx.restore();
  dot(ctx, f.x(num('p4')), f.y(q.solid), 5, C.orange, { stroke: C.text });
  $('r4').textContent = t('s4readout', { p: num('p4'), solid: fmt(q.solid), mg: fmt(q.Mg), mgo: fmt(q.MgO), o2: fmt(q.O2in), reading: g1(q.reading), mg0: fmt(q.solid - q.O2in) });
  $('s4hint').textContent = t('s4hint', { total: fmt(q0.solid + q0.O2total) });
  const r0 = M.marbleReading(0, false);
  $('v4').textContent = num('p4') === 100 ? t('s4bet', { bet: s0.bet ? t(BET_KEYS[s0.bet]) : t('betNone'), r0: g1(r0), drop: fmt(r0 - M.marbleReading(1, true)), gain: fmt(q1.solid - q0.solid) }) : '';
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('p0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('run0').addEventListener('click', () => sweep('s0', 'p0', 3000, (k, last) => { if (last) draw0(); }));
  $('reset0').addEventListener('click', () => { stopAnim('s0'); $('p0').value = 0; draw0(); });
  $('betBtn').addEventListener('click', () => {
    const c = document.querySelector('input[name="bet"]:checked');
    if (!c) { $('betFeedback').dataset.pick = '1'; s0.bet = null; } else { delete $('betFeedback').dataset.pick; s0.bet = c.value; }
    draw0(); draw4();
  });

  document.querySelectorAll('[data-rx][data-step="1"]').forEach(b => b.addEventListener('click', () => { stopAnim('s1'); s1.rx = b.dataset.rx; $('g1').value = 0; draw1(); }));
  $('g1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('play1').addEventListener('click', () => { $('g1').value = 0; animate('s1', 2400, p => { $('g1').value = Math.round(p * 100); draw1(); }); });

  document.querySelectorAll('[data-rx][data-step="2"]').forEach(b => b.addEventListener('click', () => { s2.rx = b.dataset.rx; s2.k = [1, 1, 1, 1]; buildCoefs(); draw2(); }));
  buildCoefs();

  ['sealed', 'open'].forEach(m => $('mode3' + m).addEventListener('click', () => { stopAnim('s3'); s3.mode = m; draw3(); }));
  $('p3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('run3').addEventListener('click', () => { s3.trail[s3.mode].clear(); sweep('s3', 'p3', 3000, (k, last) => { s3.trail[s3.mode].set(k, M.marbleReading(k / 100, s3.mode === 'open')); if (last) draw3(); }); });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.trail.sealed.clear(); s3.trail.open.clear(); $('p3').value = 0; draw3(); });

  $('p4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('run4').addEventListener('click', () => { s4.trail.clear(); sweep('s4', 'p4', 3000, (k, last) => { s4.trail.set(k, M.magnesium(k / 100).solid); if (last) draw4(); }); });
  $('reset4').addEventListener('click', () => { stopAnim('s4'); s4.trail.clear(); $('p4').value = 0; draw4(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
