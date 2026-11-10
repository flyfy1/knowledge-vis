'use strict';
// Atomic structure lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count and verdict comes from window.ATOM_MODEL (model.js). Canvas text sits in fixed rows
// (titles, notes, scale bar, tile labels, axis ticks); legends and long numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ATOM_MODEL;
const I = window.LESSON_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', proton: '#ff8a5c', neutron: '#8f9db0', ring: '#3b5068', cloud: '46,75,102' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const FONT = 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const trim = s => (s.includes('.') && !s.includes('e') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const fmt = (v, d = 2) => trim(v.toFixed(d));
// Significant figures for tiny and huge pixel sizes; thousands get separators.
function sig(v, n = 2) { if (v >= 1000) return Math.round(v).toLocaleString('en-US'); return String(Number(Number(v).toPrecision(n))); }
const SUPD = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sci(v, n = 2) { const e = Math.floor(Math.log10(v)); if (e >= -2) return trim(v.toFixed(Math.max(0, n - 1 - e))); const m = v / Math.pow(10, e); return trim(m.toFixed(n - 1)) + '×10' + String(e).split('').map(c => SUPD[c]).join(''); }
const pct = (v, n = 2) => sci(v * 100, n) + '%';
const lengthText = m => { const u = M.lengthUnit(m); return sig(u.v, 2) + ' ' + u.u; };
const nameOf = Z => M.element(Z)[I.getLang()];
const capName = Z => { const s = nameOf(Z); return I.getLang() === 'en' ? s[0].toUpperCase() + s.slice(1) : s; };

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

// A text line that never leaves maxW: shrinks to 10px, then wraps (words in English, characters in Chinese).
// Returns the y of the next free row.
function textRow(ctx, text, x, y, maxW, { size = 12, weight = 600, color = C.text, lh = 1.35 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let s = size;
  const font = v => `${weight} ${v}px ${FONT}`;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 10) { s -= 0.5; ctx.font = font(s); }
  const lines = [];
  if (ctx.measureText(text).width <= maxW) lines.push(text);
  else {
    const tokens = /\s/.test(text) ? text.split(/(\s+)/) : [...text];
    let cur = '';
    for (const tok of tokens) {
      const next = cur + tok;
      if (cur && ctx.measureText(next.trimEnd()).width > maxW) { lines.push(cur.trimEnd()); cur = tok.trimStart(); } else cur = next;
    }
    if (cur.trim()) lines.push(cur.trimEnd());
  }
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * s * lh));
  ctx.restore();
  return y + lines.length * s * lh;
}
function label(ctx, text, x, y, { size = 11, color = C.muted, align = 'left', weight = 400, base = 'alphabetic' } = {}) {
  ctx.save(); ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(text, x, y); ctx.restore();
}
function dot(ctx, x, y, r, color, { hollow = false, alpha = 1, dash = null } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (hollow) { ctx.strokeStyle = color; ctx.lineWidth = 1.6; if (dash) ctx.setLineDash(dash); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
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

/* ---------- shell diagram shared by steps 2–4 ---------- */
// Positions of electrons on ring i (n of them), evenly spaced, each ring rotated a little.
function ringPositions(cx, cy, r, n, i) {
  const out = []; const off = -Math.PI / 2 + i * 0.35;
  for (let k = 0; k < n; k++) { const a = off + k * 2 * Math.PI / Math.max(1, n); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return out;
}
// Draws nucleus (+Z) and the rings; `shells` is the arrangement shown, `colorOf(i, k, globalIndex)` picks each electron colour.
function drawShells(ctx, cx, cy, R, Z, shells, { highlight = -1, colorOf = null, rings = 4 } = {}) {
  const rn = Math.max(13, Math.min(20, R * 0.17)), gap = (R - rn - 6) / rings;
  const radii = [];
  for (let i = 0; i < rings; i++) {
    const r = rn + 8 + gap * (i + 0.6); radii.push(r);
    ctx.save(); ctx.strokeStyle = i === highlight ? C.cyan : C.ring; ctx.lineWidth = i === highlight ? 2.2 : 1.1;
    ctx.globalAlpha = i < shells.length || i === highlight ? 1 : 0.4; ctx.setLineDash(i < shells.length ? [] : [3, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  dot(ctx, cx, cy, rn, C.proton);
  label(ctx, '+' + Z, cx, cy + 1, { size: rn > 15 ? 12 : 11, color: '#1a0d06', align: 'center', weight: 700, base: 'middle' });
  let g = 0; const pos = [];
  shells.forEach((n, i) => ringPositions(cx, cy, radii[i], n, i).forEach(([x, y], k) => { const col = colorOf ? colorOf(i, k, g) : C.cyan; dot(ctx, x, y, Math.max(3.5, Math.min(5.5, gap * 0.22)), col); pos.push([x, y]); g++; }));
  return { radii, pos };
}

/* ---------- step 0: zoom to true scale ---------- */
function draw0() {
  const s = num('z0'), view = M.viewWidth(s);
  $('z0v').textContent = lengthText(view);
  const { ctx, W, H } = fitCanvas($('c0'), w => (w >= 600 ? 380 : 330));
  const q = M.shares(6, 6), px = M.pixels(view, W);
  const top = 8;
  let y = textRow(ctx, t('c0title', { view: lengthText(view) }), 10, top + 14, W - 20, { size: 13 });
  const tiny = px.nucleus < 2;
  y = textRow(ctx, t(tiny ? 'c0tiny' : 'c0seen', { d: sig(px.nucleus, 2) }), 10, y + 2, W - 20, { size: 12, weight: 400, color: C.orange });
  const atomFits = px.atom < Math.max(W, H) * 1.6;
  y = textRow(ctx, t(atomFits ? 'c0edge' : 'c0inside'), 10, y + 2, W - 20, { size: 12, weight: 400, color: '#9fc3e0' });
  const cx = W / 2, area0 = y + 4, area1 = H - 34, cy = (area0 + area1) / 2;
  // cloud (pale): to scale; once the atom is much larger than the frame it fills the frame.
  const rA = px.atom / 2, rN = px.nucleus / 2;
  ctx.save(); ctx.beginPath(); ctx.rect(0, area0, W, area1 - area0); ctx.clip();
  if (rA > Math.max(W, H) * 3) { ctx.fillStyle = `rgba(${C.cloud},0.55)`; ctx.fillRect(0, area0, W, area1 - area0); }
  else {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rA);
    g.addColorStop(0, `rgba(${C.cloud},0.85)`); g.addColorStop(0.7, `rgba(${C.cloud},0.55)`); g.addColorStop(1, `rgba(${C.cloud},0.15)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rA, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9fc3e0'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, rA, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  if (tiny) {
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5;
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(cx + dx * 5, cy + dy * 5); ctx.lineTo(cx + dx * 16, cy + dy * 16); ctx.stroke(); });
    dot(ctx, cx, cy, Math.max(0.6, rN), C.orange);
  } else {
    dot(ctx, cx, cy, rN, C.orange);
    if (rN > 22) { // sketch of the 12 nucleons inside (6 protons, 6 neutrons)
      const rb = rN * 0.3;
      for (let i = 0; i < 12; i++) { const r = rb * 1.05 * Math.sqrt(i + 0.5), a = i * 2.39996; dot(ctx, cx + r * Math.cos(a), cy + r * Math.sin(a), rb * 0.95, i % 2 ? C.neutron : C.proton); }
    }
  }
  ctx.restore();
  // scale bar
  const len = M.niceLength(view * 0.3), barPx = len / view * W, by = H - 14;
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, by); ctx.lineTo(12 + barPx, by); ctx.moveTo(12, by - 5); ctx.lineTo(12, by + 5); ctx.moveTo(12 + barPx, by - 5); ctx.lineTo(12 + barPx, by + 5); ctx.stroke(); ctx.restore();
  label(ctx, lengthText(len), 20 + barPx, by + 4, { size: 12, color: C.text });
  $('r0').textContent = t('s0readout', { view: lengthText(view), atom: sig(px.atom, 3), nuc: sig(px.nucleus, 2), ratio: (Math.round(q.ratio / 1000) * 1000).toLocaleString('en-US') });
  $('barMassN').style.width = (q.massNuc * 100) + '%'; $('barMassE').style.width = (q.massEl * 100) + '%';
  $('barVolN').style.width = (q.volNuc * 100) + '%'; $('barVolE').style.width = ((1 - q.volNuc) * 100) + '%';
  $('r0b').textContent = t('s0share', { mN: pct(q.massNuc, 4), mE: pct(q.massEl, 2), vN: pct(q.volNuc, 2) });
}

/* ---------- step 1: protons decide identity ---------- */
const s1 = { Z: 6, N: 6, seen: new Set([6]), note: '' };
function nRange(Z) { const N0 = M.element(Z).N; return [Math.max(0, N0 - 1), N0 + 2]; }
function draw1() {
  const { Z, N } = s1, el = M.element(Z), A = Z + N;
  $('s1e').innerHTML = t('s1e', { ppe: Math.round(M.PROTON_PER_ELECTRON) });
  const { ctx, W, H } = fitCanvas($('c1'), w => (w >= 600 ? 400 : 380));
  let y = textRow(ctx, t('c1nuc'), 10, 22, W - 20, { size: 13 });
  label(ctx, t('c1p', { Z }), 10, y + 4, { size: 12, color: C.proton, weight: 600 });
  ctx.save(); ctx.font = `600 12px ${FONT}`; const wp = ctx.measureText(t('c1p', { Z })).width; ctx.restore();
  label(ctx, t('c1n', { N }), 10 + wp + 18, y + 4, { size: 12, color: C.neutron, weight: 600 });
  y += 10;
  // strip geometry first (bottom), nucleus fills the rest
  const cols = 10, tileW = (W - 20) / cols, tileH = Math.max(36, Math.min(54, tileW * 0.8));
  const stripTop = H - 2 * tileH - 10, stripTitleY = stripTop - 10;
  const n0 = y + 6, n1 = stripTitleY - 22, cx = W / 2, cy = (n0 + n1) / 2, Rmax = (n1 - n0) / 2;
  const T = Z + N, rb = Math.min(W >= 600 ? 18 : 13, Rmax / (1.15 * Math.sqrt(T) + 0.6));
  for (let i = 0; i < T; i++) {
    const r = rb * 1.9 * Math.sqrt(i + 0.5) * 0.55, a = i * 2.39996;
    const isP = Math.floor((i + 1) * Z / T) > Math.floor(i * Z / T);
    dot(ctx, cx + r * Math.cos(a), cy + r * Math.sin(a), rb, isP ? C.proton : C.neutron);
    ctx.save(); ctx.strokeStyle = '#0d1621'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), rb, 0, 7); ctx.stroke(); ctx.restore();
  }
  textRow(ctx, t('c1strip'), 10, stripTitleY, W - 20, { size: 12, weight: 600, color: C.muted });
  for (let z = 1; z <= 20; z++) {
    const col = (z - 1) % cols, row = Math.floor((z - 1) / cols), x = 10 + col * tileW, ty = stripTop + row * tileH;
    const now = z === Z, seen = s1.seen.has(z);
    ctx.save(); ctx.fillStyle = now ? '#1f3a4d' : '#141f2c'; ctx.fillRect(x + 1.5, ty + 1.5, tileW - 3, tileH - 3);
    ctx.strokeStyle = now ? C.cyan : seen ? C.orange : '#25344a'; ctx.lineWidth = now ? 2.4 : seen ? 1.6 : 1; ctx.strokeRect(x + 1.5, ty + 1.5, tileW - 3, tileH - 3); ctx.restore();
    label(ctx, String(z), x + 4, ty + 12, { size: 9, color: now ? C.cyan : C.muted });
    label(ctx, M.element(z).sym, x + tileW / 2, ty + tileH * 0.5 + 9, { size: tileW > 40 ? 16 : 13, color: now ? C.text : '#c9d5e3', align: 'center', weight: 700 });
  }
  const [lo, hi] = nRange(Z), N0 = el.N;
  const iso = N === N0 ? t('isoCommon', { name: nameOf(Z) }) : t(N > N0 ? 'isoMore' : 'isoLess', { name: nameOf(Z), d: Math.abs(N - N0), A });
  $('r1').textContent = t('s1readout', { Z, name: nameOf(Z), sym: el.sym, N, A, iso }) + (s1.note ? ' ' + t(s1.note) : '');
  $('pPlus').disabled = Z >= M.ZMAX; $('pMinus').disabled = Z <= 1; $('nPlus').disabled = N >= hi; $('nMinus').disabled = N <= lo; $('nReset').disabled = N === N0;
}
function setZ1(Z) {
  s1.note = Z > M.ZMAX ? 'zMax' : Z < 1 ? 'zMin' : '';
  Z = Math.max(1, Math.min(M.ZMAX, Z));
  s1.Z = Z; s1.N = M.element(Z).N; s1.seen.add(Z); draw1();
}

/* ---------- step 2: shells fill in order ---------- */
const s2 = { shown: 11 };
function arrText(arr) { return arr.length ? arr.join(', ') : '0'; }
function draw2() {
  const Z = num('z2'), c = Math.min(s2.shown, Z), full = M.shells(Z), part = M.shells(c);
  $('z2v').textContent = `${Z} · ${M.element(Z).sym}`;
  const { ctx, W, H } = fitCanvas($('c2'), w => (w >= 600 ? 330 : 500));
  const wide = W >= 600, dW = wide ? W * 0.5 : W, dH = wide ? H : 270;
  const y0 = textRow(ctx, t('c2atom', { sym: M.element(Z).sym }), 10, 20, dW - 20, { size: 13 });
  const R = Math.min(dW / 2 - 14, (dH - y0 - 12) / 2), cx = dW / 2, cy = y0 + 6 + R;
  drawShells(ctx, cx, cy, R, Z, part);
  // seat table
  const tx = wide ? W * 0.5 + 10 : 10, tW = wide ? W * 0.5 - 20 : W - 20, ty0 = wide ? 20 : dH + 18;
  const ty = textRow(ctx, t('c2table'), tx, ty0, tW, { size: 13 });
  const rowH = wide ? Math.min(52, (H - ty - 10) / 4) : 42;
  ctx.save(); ctx.font = `400 12px ${FONT}`;
  const labW = Math.max(...[0, 1, 2, 3].map(i => ctx.measureText(t('c2row', { L: i + 1, n: 8, cap: 8 })).width)) + 14; ctx.restore();
  for (let i = 0; i < 4; i++) {
    const cap = i === 0 ? 2 : 8, have = part[i] || 0, rowY = ty + 8 + i * rowH + rowH / 2;
    const active = i < full.length;
    label(ctx, t('c2row', { L: i + 1, n: have, cap }), tx, rowY + 4, { size: 12, color: active ? C.text : C.muted });
    const sp = Math.min(24, (tW - labW) / 8), r = Math.min(7, sp * 0.36);
    for (let k = 0; k < cap; k++) {
      const x = tx + labW + sp * (k + 0.5);
      if (k < have) dot(ctx, x, rowY, r, C.cyan); else dot(ctx, x, rowY, r, '#4a5f78', { hollow: true });
    }
  }
  const prog = c < Z ? t('s2progress', { c, Z }) : '';
  $('r2').textContent = t('s2readout', { name: capName(Z), sym: M.element(Z).sym, Z, e: Z, arr: arrText(full), prog });
}

/* ---------- step 3: the outer shell ---------- */
const TCOL = { stable: C.cyan, lose: C.orange, gain: C.pink, share: C.green };
function draw3() {
  const Z = num('z3'), tend = M.tendency(Z), o = tend.o, sh = M.shells(Z);
  $('z3v').textContent = `${Z} · ${M.element(Z).sym}`;
  const { ctx, W, H } = fitCanvas($('c3'), w => (w >= 600 ? 520 : 470));
  const wide = W >= 600;
  // chart
  const cy0 = textRow(ctx, t('c3chart'), 10, 20, W - 20, { size: 13 });
  const P = { l: 34, r: W - 12, t: cy0 + 14, b: wide ? 228 : 236 };
  const x = z => P.l + (z - 0.5) / 20 * (P.r - P.l), y = v => P.b - v / 8 * (P.b - P.t), bw = (P.r - P.l) / 20 * 0.66;
  ctx.save(); ctx.font = `400 11px ${FONT}`; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  for (const v of [0, 2, 4, 6, 8]) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  ctx.textAlign = 'center';
  const every = (P.r - P.l) / 20 >= 22 ? 1 : 2;
  for (let z = 1; z <= 20; z++) if (z % every === 0 || every === 1) ctx.fillText(String(z), x(z), P.b + 15);
  ctx.restore();
  for (let z = 1; z <= 20; z++) {
    const tz = M.tendency(z), h = tz.o.count;
    ctx.save(); ctx.globalAlpha = z === Z ? 1 : 0.55; ctx.fillStyle = TCOL[tz.kind]; ctx.fillRect(x(z) - bw / 2, y(h), bw, P.b - y(h)); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x(Z) - bw / 2 - 2, y(o.count) - 2, bw + 4, P.b - y(o.count) + 2); ctx.restore();
  label(ctx, M.element(Z).sym, x(Z), y(o.count) - 6, { size: 12, color: C.text, align: 'center', weight: 700 });
  // atom
  const aTop = P.b + 30;
  const ay = textRow(ctx, t('c3atom', { sym: M.element(Z).sym, c: o.count, cap: o.cap }), 10, aTop + 12, W - 20, { size: 13 });
  const R = Math.min(W / 2 - 14, (H - ay - 10) / 2);
  drawShells(ctx, W / 2, ay + 4 + R, R, Z, sh, { highlight: o.index, colorOf: i => (i === o.index ? TCOL[tend.kind] : C.cyan) });
  const verdict = t({ stable: 'vStable', lose: 'vLose', gain: 'vGain', share: 'vShare' }[tend.kind], { n: tend.n });
  $('r3').textContent = t('s3readout', { name: capName(Z), arr: arrText(sh), L: o.index + 1, c: o.count, cap: o.cap, verdict });
}

/* ---------- step 4: ions ---------- */
const s4 = { e: 11, made: [], fly: null };
const eRange = Z => M.eRange(Z);
function draw4() {
  const Z = num('z4'), e = s4.e, io = M.ion(Z, e), o = io.outer;
  $('z4v').textContent = `${Z} · ${M.element(Z).sym}`;
  const { ctx, W, H } = fitCanvas($('c4'), w => (w >= 600 ? 340 : 420));
  const wide = W >= 600, dW = wide ? W * 0.62 : W;
  const y0 = textRow(ctx, t('c4atom', { label: io.label, Z, e }), 10, 20, W - 20, { size: 13 });
  const trayH = wide ? 0 : 74;
  const R = Math.min(dW / 2 - 14, (H - y0 - 14 - trayH) / 2), cx = dW / 2, cy = y0 + 6 + R;
  const own = Math.min(e, Z);
  const res = drawShells(ctx, cx, cy, R, Z, io.shells, { highlight: o.index, colorOf: (i, k, g) => (g >= own ? C.orange : C.cyan) });
  // tray of removed electrons
  const gone = Math.max(0, Z - e);
  const tx = wide ? dW + 6 : 10, tW = wide ? W - dW - 16 : W - 20, tTop = wide ? cy - 40 : H - trayH + 8;
  const ly = textRow(ctx, t('c4out'), tx, tTop + 12, tW, { size: 12, weight: 400, color: C.muted });
  ctx.save(); ctx.strokeStyle = '#2c3b50'; ctx.setLineDash([4, 4]); ctx.strokeRect(tx, ly - 4, Math.min(tW, 150), 34); ctx.restore();
  for (let k = 0; k < gone; k++) {
    const fx = tx + 22 + k * 30, fy = ly + 13;
    if (s4.fly && k === gone - 1 && s4.fly.p < 1) {
      const [sx, sy] = s4.fly.from, p = s4.fly.p;
      dot(ctx, sx + (fx - sx) * p, sy + (fy - sy) * p, 5, C.cyan);
    } else dot(ctx, fx, fy, 5.5, C.cyan, { hollow: true, dash: [2, 2] });
  }
  s4.lastPos = res.pos;
  const nobleName = io.noble ? nameOf(io.noble) : '';
  const full = o.full ? t('fullYes', { noble: nobleName }) : t('fullNo');
  const q = io.charge > 0 ? '+' + io.charge : io.charge < 0 ? '−' + Math.abs(io.charge) : '0';
  $('r4').textContent = t('s4readout', { Z, name: nameOf(Z), e, q, label: io.label, arr: arrText(io.shells), c: o.count, cap: o.cap, full }) + (s4.limit ? ' ' + t('eLimit') : '');
  if (o.full && !s4.made.includes(io.label)) s4.made.push(io.label);
  $('made4').textContent = s4.made.length ? s4.made.join('  ') : t('madeNone');
  const [lo, hi] = eRange(Z);
  $('take4').disabled = e <= lo; $('add4').disabled = e >= hi; $('neutral4').disabled = e === Z;
}
function changeE(d) {
  const Z = num('z4'), [lo, hi] = eRange(Z), next = s4.e + d;
  s4.limit = next < lo || next > hi;
  if (s4.limit) { draw4(); return; }
  if (d < 0) {
    const from = s4.lastPos && s4.lastPos[s4.lastPos.length - 1];
    s4.e = next; s4.fly = from ? { from, p: 0 } : null;
    animate('s4', 600, p => { if (s4.fly) s4.fly.p = p; draw4(); }, () => { s4.fly = null; draw4(); });
  } else { stopAnim('s4'); s4.fly = null; s4.e = next; draw4(); }
}

/* ---------- quizzes ---------- */
function quiz(name, right, fbId, okKey, badKey) {
  const choice = document.querySelector(`input[name="${name}"]:checked`);
  const fb = $(fbId);
  if (!choice) { fb.textContent = t('pick'); fb.style.color = C.muted; fb.dataset.key = 'pick'; return; }
  const ok = choice.value === right;
  fb.dataset.key = ok ? okKey : badKey; fb.textContent = t(fb.dataset.key); fb.style.color = ok ? C.green : C.orange;
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  ['quizFeedback', 'quizFeedback2'].forEach(id => { const fb = $(id); if (fb.dataset.key) fb.textContent = t(fb.dataset.key); });
}

function setup() {
  $('z0').addEventListener('input', draw0);
  $('pPlus').addEventListener('click', () => setZ1(s1.Z + 1));
  $('pMinus').addEventListener('click', () => setZ1(s1.Z - 1));
  $('nPlus').addEventListener('click', () => { const [, hi] = nRange(s1.Z); s1.note = ''; s1.N = Math.min(hi, s1.N + 1); draw1(); });
  $('nMinus').addEventListener('click', () => { const [lo] = nRange(s1.Z); s1.note = ''; s1.N = Math.max(lo, s1.N - 1); draw1(); });
  $('nReset').addEventListener('click', () => { s1.note = ''; s1.N = M.element(s1.Z).N; draw1(); });

  $('z2').addEventListener('input', () => { stopAnim('s2'); s2.shown = num('z2'); draw2(); });
  $('fill2').addEventListener('click', () => {
    const Z = num('z2'); s2.shown = 0; draw2();
    animate('s2', (Z + 1) * 420, p => { s2.shown = Math.min(Z, Math.floor(p * (Z + 1))); draw2(); });
  });
  $('all2').addEventListener('click', () => { stopAnim('s2'); s2.shown = num('z2'); draw2(); });
  $('checkQuiz').addEventListener('click', () => quiz('quiz', 'a', 'quizFeedback', 'correct', 'wrong'));

  $('z3').addEventListener('input', draw3);

  $('z4').addEventListener('input', () => { stopAnim('s4'); s4.fly = null; s4.limit = false; s4.e = num('z4'); draw4(); });
  $('take4').addEventListener('click', () => changeE(-1));
  $('add4').addEventListener('click', () => changeE(1));
  $('neutral4').addEventListener('click', () => { stopAnim('s4'); s4.fly = null; s4.limit = false; s4.e = num('z4'); draw4(); });
  $('checkQuiz2').addEventListener('click', () => quiz('quiz2', 'a', 'quizFeedback2', 'correct2', 'wrong2'));

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
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
