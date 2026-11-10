'use strict';
// Pressure lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every shape, bar and readout comes from window.PRESSURE_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and a few labels placed in reserved slots; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PRESSURE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', brick: '#c9714f', brickEdge: '#e3936f', sponge: '#d8c45a', spongeDark: '#8f8233', metal: '#8ea3b8', ghost: '#8696aa' };
const LQ = { alcohol: { key: 'lqAlcohol', color: C.violet }, water: { key: 'lqWater', color: C.cyan }, brine: { key: 'lqBrine', color: C.green } };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// Scientific notation for very large or very small values, plain digits otherwise.
function sci(v, d = 2) {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 0.01 && a < 1e5) return fmt(v, 2);
  const e = Math.floor(Math.log10(a) + 1e-9), m = v / Math.pow(10, e);
  return fmt(m, d) + ' × 10' + String(e).split('').map(c => SUP[c]).join('');
}

function fitCanvas(canvas, height) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
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
const widthOf = canvas => Math.max(240, canvas.clientWidth || 600);

// Text that shrinks until it fits maxW and is clamped inside [pad, W − pad].
function label(ctx, text, x, y, { align = 'left', maxW = 9999, size = 12, weight = 400, color = C.text, W = 9999 } = {}) {
  ctx.save(); ctx.fillStyle = color; let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  const w = ctx.measureText(text).width;
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(4, Math.min(W - 4 - w, x0));
  ctx.textAlign = 'left'; ctx.fillText(text, x0, y); ctx.restore();
  return { x0, x1: x0 + w };
}
const title = (ctx, text, x, y, maxW, W) => label(ctx, text, x, y, { maxW, size: 12, weight: 600, W });

function arrow(ctx, x0, y0, x1, y1, color, lw = 2.5, head = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 1) return;
  const hd = Math.min(head, len * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hd * 0.7 * Math.cos(a), y1 - hd * 0.7 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(a - 0.45), y1 - hd * Math.sin(a - 0.45)); ctx.lineTo(x1 - hd * Math.cos(a + 0.45), y1 - hd * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// A plot frame: ticks on the left and bottom, the title in its own row above.
function frame(ctx, o) {
  const x = v => o.l + (v - o.xMin) / (o.xMax - o.xMin) * (o.r - o.l);
  const y = v => o.b - (v - o.yMin) / (o.yMax - o.yMin) * (o.b - o.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(o.l, y(v)); ctx.lineTo(o.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), o.l - 5, y(v) + 4); }
  for (const v of o.xTicks) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), o.b); ctx.lineTo(x(v), o.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), o.b + 16); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(o.l, o.t); ctx.lineTo(o.l, o.b); ctx.lineTo(o.r, o.b); ctx.stroke();
  ctx.restore();
  return { x, y };
}

/* ---------- small tween runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }
const ease = p => 1 - Math.pow(1 - p, 3);

function setPressed(ids, on) { ids.forEach(id => $(id).setAttribute('aria-pressed', id === on ? 'true' : 'false')); }

/* ---------- step 0: one brick, three faces ---------- */
const FACE_IDS = { flat: 'faceFlat', side: 'faceSide', end: 'faceEnd' };
const FACE_SHORT = { flat: 'faceFlatS', side: 'faceSideS', end: 'faceEndS' };
const s0 = { face: 'flat', dent: M.brick('flat', 1).dentMM, tried: new Map() };
function draw0() {
  const n = num('n0'), B = M.brick(s0.face, n);
  $('n0v').textContent = String(n);
  setPressed(Object.values(FACE_IDS), FACE_IDS[s0.face]);
  const canvas = $('c0'), wide = widthOf(canvas) >= 600;
  const { ctx, W, H } = fitCanvas(canvas, wide ? 320 : 470);
  // regions
  const A = wide ? { x: 0, y: 0, w: W * 0.56, h: H } : { x: 0, y: 0, w: W, h: 270 };
  const R = wide ? { x: W * 0.56, y: 0, w: W * 0.44, h: H } : { x: 0, y: 270, w: W, h: H - 270 };
  title(ctx, t('c0a'), A.x + 10, A.y + 18, A.w - 20, W);
  title(ctx, t('c0b'), R.x + 10, R.y + 18, R.w - 20, W);
  if (!wide) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(10, R.y + 2); ctx.lineTo(W - 10, R.y + 2); ctx.stroke(); }

  // side view: brick scale s px/cm; the sponge is drawn with its own vertical scale (60 px = 50 mm)
  const spongeH = 60, mmPx = spongeH / 50, base = A.y + A.h - 24;
  // one scale per stack count (all three faces share it, so the brick keeps its size when you turn it)
  const maxStackCm = n * 20 + 2;
  const s = Math.min((A.w - 60) / 24, (A.h - 24 - spongeH - 64) / maxStackCm);
  const cx = A.x + A.w / 2, spW = Math.min(A.w - 30, 26 * s + 40), spTop = base - spongeH;
  const bw = B.w * s, dent = s0.dent * mmPx;
  // sponge with a dent exactly under the brick
  ctx.fillStyle = C.sponge; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.moveTo(cx - spW / 2, base); ctx.lineTo(cx - spW / 2, spTop);
  const x0 = cx - bw / 2, x1 = cx + bw / 2, rim = Math.min(18, dent * 2 + 4);
  ctx.lineTo(x0 - rim, spTop); ctx.quadraticCurveTo(x0, spTop, x0, spTop + dent); ctx.lineTo(x1, spTop + dent); ctx.quadraticCurveTo(x1, spTop, x1 + rim, spTop);
  ctx.lineTo(cx + spW / 2, spTop); ctx.lineTo(cx + spW / 2, base); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = C.spongeDark; for (let i = 0; i < 26; i++) { const px = cx - spW / 2 + 8 + ((i * 37) % (spW - 16)), py = spTop + dent + 8 + ((i * 23) % (spongeH - dent - 14 > 4 ? spongeH - dent - 14 : 4)); ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 7); ctx.fill(); }
  // the sponge's original surface, dashed
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0 - 6, spTop); ctx.lineTo(x1 + 6, spTop); ctx.stroke(); ctx.restore();
  // bricks
  const bh = B.h * s; let top = spTop + dent;
  for (let i = 0; i < n; i++) {
    top -= bh;
    ctx.fillStyle = C.brick; ctx.fillRect(x0, top, bw, bh);
    ctx.strokeStyle = C.brickEdge; ctx.lineWidth = 1.2; ctx.strokeRect(x0 + 0.5, top + 0.5, bw - 1, bh - 1);
  }
  // force arrow from above the stack, label to its right (or left when there is no room)
  const aTop = Math.max(A.y + 32, top - 46);
  arrow(ctx, cx, aTop, cx, top - 3, C.orange, 3, 9);
  const fl = t('forceLabel', { F: fmt(B.F) });
  ctx.font = '600 12px system-ui,sans-serif';
  const fw = ctx.measureText(fl).width, right = cx + 10 + fw < A.x + A.w - 4;
  label(ctx, fl, right ? cx + 10 : cx - 10, aTop + 12, { align: right ? 'left' : 'right', color: C.orange, weight: 600, W });

  // contact face grid, 1 cm² per cell, brightness = force per cell
  const cell = Math.min((R.w - 40) / 20, (R.h - 80) / 10, 16);
  const gw = B.w * cell, gd = B.d * cell, gx = R.x + (R.w - gw) / 2, gy = R.y + 34 + ((R.h - 80) - gd) / 2;
  const maxPer = M.brick('end', 3).perCm2, a = 0.22 + 0.78 * B.perCm2 / maxPer;
  for (let i = 0; i < B.w; i++) for (let j = 0; j < B.d; j++) {
    ctx.fillStyle = `rgba(103,215,249,${a.toFixed(3)})`; ctx.fillRect(gx + i * cell + 0.5, gy + j * cell + 0.5, cell - 1, cell - 1);
  }
  ctx.strokeStyle = C.brickEdge; ctx.lineWidth = 1.5; ctx.strokeRect(gx, gy, gw, gd);
  label(ctx, t('dimLabel', { w: B.w, d: B.d, S: B.Scm2 }), R.x + R.w / 2, gy + gd + 22, { align: 'center', maxW: R.w - 16, color: C.muted, W });

  const faceName = t(FACE_SHORT[s0.face]);
  $('r0').textContent = t('s0readout', { face: faceName, n, F: fmt(B.F), Scm2: B.Scm2, S: fmt(B.S, 4), p: fmt(B.p), per: fmt(B.perCm2) });
  s0.tried.set(s0.face + n, B);
  const rows = [...s0.tried.values()].sort((u, v) => u.p - v.p);
  $('t0').innerHTML = `<tr><th>${t('th0Face')}</th><th>${t('th0N')}</th><th>${t('th0F')}</th><th>${t('th0S')}</th><th>${t('th0P')}</th></tr>` +
    rows.map(r => `<tr class="${r === B || (r.face === B.face && r.n === B.n) ? 'on' : ''}"><td>${t(FACE_SHORT[r.face])}</td><td>${r.n}</td><td>${fmt(r.F)}</td><td>${r.Scm2}</td><td>${fmt(r.p)}</td></tr>`).join('');
}
function settle0() {
  const target = M.brick(s0.face, num('n0')).dentMM, from = s0.dent;
  animate('s0', 450, p => { s0.dent = from + (target - from) * ease(p); draw0(); });
}

/* ---------- step 1: the ladder ---------- */
const s1 = { sel: 'stand' };
function buildCases() {
  $('caseButtons').innerHTML = M.CASES.map((c, i) => `<button class="btn toggle" type="button" data-step="1" data-case="${c.id}" id="case_${c.id}"><span class="case-num">${i + 1}</span> <span class="case-name"></span></button>`).join('');
  $('caseButtons').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { s1.sel = b.dataset.case; draw1(); }));
}
function draw1() {
  const canvas = $('c1'), { ctx, W, H } = fitCanvas(canvas, 330);
  title(ctx, t('c1'), 10, 18, W - 20, W);
  const l = 34, r = W - 16, top = 36, bot = H - 30, e0 = 3, e1 = 9;
  const X = p => l + (Math.log10(p) - e0) / (e1 - e0) * (r - l);
  ctx.font = '11px system-ui,sans-serif';
  for (let e = e0; e <= e1; e++) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(Math.pow(10, e)), top - 4); ctx.lineTo(X(Math.pow(10, e)), bot); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText('10' + String(e).split('').map(c => SUP[c]).join(''), X(Math.pow(10, e)), bot + 17);
  }
  const rowH = (bot - top) / M.CASES.length;
  M.CASES.forEach((c, i) => {
    const y = top + rowH * (i + 0.5), on = c.id === s1.sel, col = on ? C.orange : C.cyan;
    ctx.fillStyle = on ? 'rgba(255,180,84,.10)' : 'transparent'; ctx.fillRect(l, y - rowH / 2 + 2, r - l, rowH - 4);
    ctx.fillStyle = col; ctx.globalAlpha = on ? 0.9 : 0.45; ctx.fillRect(l, y - 4, X(c.p) - l, 8); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(c.p), y, on ? 6.5 : 5, 0, 7); ctx.fill();
    ctx.fillStyle = on ? C.orange : C.muted; ctx.font = `${on ? 700 : 500} 12px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), 14, y + 4);
    if (on) {
      const txt = sci(c.p) + ' Pa', leftSide = X(c.p) > (l + r) / 2;
      label(ctx, txt, leftSide ? X(c.p) - 12 : X(c.p) + 12, y - 8, { align: leftSide ? 'right' : 'left', color: C.orange, weight: 600, size: 12, W });
    }
  });
  M.CASES.forEach(c => { const b = $('case_' + c.id); b.setAttribute('aria-pressed', c.id === s1.sel ? 'true' : 'false'); b.querySelector('.case-name').textContent = t('case_' + c.id); });
  const c = M.caseById(s1.sel), i = M.CASES.indexOf(c) + 1, rr = M.ratio(c.id, 'stand');
  $('r1').textContent = t('s1readout', { i, name: t('case_' + c.id), detail: t('det_' + c.id), F: sci(c.F), S: sci(c.S), p: sci(c.p), r: fmt(rr, rr >= 100 ? 0 : 1) });
  const tank = M.caseById('tank'), stand = M.caseById('stand');
  $('h1').textContent = t('s1hint', { tankW: Math.round(tank.F / stand.F), tankP: fmt(M.ratio('tank', 'stand'), 1), gap: fmt(Math.log10(M.ratio('tip', 'thumb')), 1) });
}

/* ---------- step 2: pressure under water ---------- */
const DIR_IDS = { up: 'dirUp', side: 'dirSide', down: 'dirDown' };
const s2 = { liquid: 'water', dir: 'up', dots: [] };
function addDot2() { const h = num('h2'); if (!s2.dots.some(d => d.l === s2.liquid && d.h === h)) s2.dots.push({ l: s2.liquid, h }); }
function draw2() {
  const hCm = num('h2'), rho = M.LIQUIDS[s2.liquid], p = M.liquidP(rho, hCm / 100), dh = M.gaugeRise(p) * 100;
  $('h2v').textContent = hCm + ' cm';
  setPressed(['lqAlcohol', 'lqWater', 'lqBrine'], LQ[s2.liquid].key); setPressed(Object.values(DIR_IDS), DIR_IDS[s2.dir]);
  const canvas = $('c2'), wide = widthOf(canvas) >= 600;
  const { ctx, W, H } = fitCanvas(canvas, wide ? 340 : 600);
  const A = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: 320 };
  const R = wide ? { x: W * 0.5, y: 0, w: W * 0.5, h: H } : { x: 0, y: 320, w: W, h: H - 320 };
  title(ctx, t('c2a'), A.x + 10, A.y + 18, A.w - 20, W);
  title(ctx, t('c2b'), R.x + 10, R.y + 18, R.w - 20, W);
  // tank: 30 cm of liquid + 4 cm headroom; U-tube: 44 cm tall, rest level at its middle
  const s = Math.min((A.h - 60) / 44, (A.w - 40) / 46);
  const tankW = 18 * s, tx = A.x + 16, tBot = A.y + A.h - 18, tTop = tBot - 34 * s, surf = tBot - 30 * s;
  ctx.fillStyle = LQ[s2.liquid].color; ctx.globalAlpha = 0.22; ctx.fillRect(tx, surf, tankW, tBot - surf); ctx.globalAlpha = 1;
  ctx.strokeStyle = LQ[s2.liquid].color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx, surf); ctx.lineTo(tx + tankW, surf); ctx.stroke();
  ctx.strokeStyle = C.metal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, tTop); ctx.lineTo(tx, tBot); ctx.lineTo(tx + tankW, tBot); ctx.lineTo(tx + tankW, tTop); ctx.stroke();
  // probe
  const px = tx + tankW * 0.55, py = surf + hCm * s, pr = Math.max(5, 1.3 * s);
  ctx.fillStyle = '#2b3a4c'; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
  const dirAng = { up: -Math.PI / 2, side: Math.PI, down: Math.PI / 2 }[s2.dir];
  ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, pr, dirAng - 0.9, dirAng + 0.9); ctx.stroke();
  // hose: probe → over the rim → U-tube left arm
  const uL = tx + tankW + Math.max(26, 6 * s), uR = uL + Math.max(22, 6 * s), uBot = tBot - 2, uTop = uBot - 44 * s, rest = uBot - 22 * s;
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py - pr); ctx.lineTo(px, tTop - 10); ctx.lineTo(uL, tTop - 10); ctx.lineTo(uL, uTop); ctx.stroke();
  // U-tube: left level pushed down by dh/2, right level up by dh/2 (same px/cm as the tank)
  const lv = rest + dh / 2 * s, rv = rest - dh / 2 * s, tw = 7;
  ctx.fillStyle = 'rgba(103,215,249,.55)';
  ctx.fillRect(uL - tw / 2, lv, tw, uBot - lv); ctx.fillRect(uR - tw / 2, rv, tw, uBot - rv); ctx.fillRect(uL - tw / 2, uBot - tw, uR - uL + tw, tw);
  ctx.strokeStyle = C.metal; ctx.lineWidth = 1.2; ctx.strokeRect(uL - tw / 2, uTop, tw, uBot - uTop); ctx.strokeRect(uR - tw / 2, uTop, tw, uBot - uTop);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(uL - 8, lv); ctx.lineTo(uR + 8, lv); ctx.moveTo(uR - 8, rv); ctx.lineTo(uR + 8, rv); ctx.stroke(); ctx.restore();
  // labels: depth bracket inside the tank's left edge, gauge gap right of the U-tube
  ctx.strokeStyle = C.text; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx + 6, surf); ctx.lineTo(tx + 6, py); ctx.stroke();
  if (hCm > 0) label(ctx, t('hLabel', { h: hCm }), tx + 10, Math.max(surf + 14, (surf + py) / 2 + 4), { maxW: px - pr - tx - 14, size: 11, W });
  arrow(ctx, uR + 14, lv, uR + 14, rv, C.orange, 1.5, 5);
  label(ctx, t('dhLabel', { dh: fmt(dh, 1) }), uR + 20, (lv + rv) / 2 + 4, { maxW: A.x + A.w - uR - 24, size: 11, color: C.orange, W });

  // chart p vs h
  const P = { l: R.x + 50, r: R.x + R.w - 14, t: R.y + 36, b: R.y + R.h - 30 };
  const f = frame(ctx, { ...P, xMin: 0, xMax: 30, yMin: 0, yMax: 4000, xTicks: [0, 10, 20, 30], yTicks: [0, 1000, 2000, 3000, 4000] });
  Object.keys(M.LIQUIDS).forEach(k => {
    ctx.strokeStyle = LQ[k].color; ctx.lineWidth = k === s2.liquid ? 2.4 : 1.2; ctx.globalAlpha = k === s2.liquid ? 1 : 0.5;
    ctx.beginPath(); ctx.moveTo(f.x(0), f.y(0)); ctx.lineTo(f.x(30), f.y(M.liquidP(M.LIQUIDS[k], 0.3))); ctx.stroke(); ctx.globalAlpha = 1;
  });
  s2.dots.forEach(d => { ctx.fillStyle = C.text; ctx.strokeStyle = LQ[d.l].color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(f.x(d.h), f.y(M.liquidP(M.LIQUIDS[d.l], d.h / 100)), 3.2, 0, 7); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(f.x(hCm), f.y(p), 6, 0, 7); ctx.fill();

  $('r2').textContent = t('s2readout', { liquid: t(LQ[s2.liquid].key + 'S'), h: hCm, dir: t(DIR_IDS[s2.dir]), rho, hm: fmt(hCm / 100), p: fmt(p), dh: fmt(dh, 1) });
}

/* ---------- step 3: three containers ---------- */
const SH = ['straight', 'flared', 'narrow'], SH_KEY = { straight: 'shA', flared: 'shB', narrow: 'shC' }, SH_LETTER = { straight: 'A', flared: 'B', narrow: 'C' };
function draw3() {
  const h = num('h3'); $('h3v').textContent = h + ' cm';
  const canvas = $('c3'), { ctx, W, H } = fitCanvas(canvas, 420);
  title(ctx, t('c3a'), 10, 18, W - 20, W);
  // containers sit right of the bar chart's tick labels (x ≥ 46) so the bars below never cover them
  const gapCm = 5, totalCm = 30 + 10 + 10 + 2 * gapCm, avail = W - 46 - 10, s = Math.min(avail / totalCm, 7.5);
  const base = 36 + 22 * s; let xc = 46 + (avail - totalCm * s) / 2;
  const cents = {};
  SH.forEach(k => {
    const top = M.SHAPES[k].top, wmax = Math.max(10, top), cx = xc + wmax * s / 2; cents[k] = cx;
    const half = y => M.SHAPES[k].width(y) / 2 * s, Y = y => base - y * s;
    // water to depth h (polygon follows the walls)
    if (h > 0) { ctx.fillStyle = 'rgba(103,215,249,.35)'; ctx.beginPath(); ctx.moveTo(cx - half(0), Y(0)); ctx.lineTo(cx - half(h), Y(h)); ctx.lineTo(cx + half(h), Y(h)); ctx.lineTo(cx + half(0), Y(0)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - half(h), Y(h)); ctx.lineTo(cx + half(h), Y(h)); ctx.stroke(); }
    ctx.strokeStyle = C.metal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - half(M.H_MAX), Y(M.H_MAX)); ctx.lineTo(cx - half(0), Y(0)); ctx.lineTo(cx + half(0), Y(0)); ctx.lineTo(cx + half(M.H_MAX), Y(M.H_MAX)); ctx.stroke();
    label(ctx, SH_LETTER[k], cx, base + 16, { align: 'center', weight: 700, W });
    xc += wmax * s + gapCm * s;
  });
  // bars: weight (cyan) and force on base (orange) under each container
  const bTop = base + 50, bBot = H - 26, rows = SH.map(k => M.container(k, h));
  title(ctx, t('c3b'), 10, bTop - 12, W - 20, W);
  const f = frame(ctx, { l: 34, r: W - 10, t: bTop + 6, b: bBot, xMin: 0, xMax: 1, yMin: 0, yMax: 40, xTicks: [], yTicks: [0, 10, 20, 30, 40] });
  const bw = Math.min(22, s * 3.2);
  rows.forEach(rw => {
    const cx = cents[rw.shape];
    ctx.fillStyle = C.cyan; ctx.fillRect(cx - bw - 2, f.y(rw.weight), bw, bBot - f.y(rw.weight));
    ctx.fillStyle = C.orange; ctx.fillRect(cx + 2, f.y(rw.Fb), bw, bBot - f.y(rw.Fb));
    label(ctx, SH_LETTER[rw.shape], cx, bBot + 16, { align: 'center', weight: 700, color: C.muted, W });
  });
  const r0 = rows[0];
  $('r3').textContent = t('s3readout', { h, p: fmt(r0.p), S: fmt(r0.Sb), F: fmt(r0.Fb) });
  const wall = rw => Math.abs(rw.wall) < 1e-9 ? t('wallNone') : rw.wall > 0 ? t('wallUp', { v: fmt(rw.wall) }) : t('wallDown', { v: fmt(-rw.wall) });
  $('t3').innerHTML = `<tr><th>${t('th3C')}</th><th>${t('th3Shape')}</th><th>${t('th3V')}</th><th>${t('th3W')}</th><th>${t('th3F')}</th><th>${t('th3Wall')}</th></tr>` +
    rows.map(rw => `<tr><td>${t(SH_KEY[rw.shape])}</td><td class="wrap">${t(SH_KEY[rw.shape] + 'd')}</td><td>${fmt(rw.V, 0)}</td><td>${fmt(rw.weight)}</td><td>${fmt(rw.Fb)}</td><td>${wall(rw)}</td></tr>`).join('');
  const full = SH.map(k => M.container(k, M.H_MAX));
  $('hint3').textContent = t('s3hint', { h: M.H_MAX, wB: fmt(full[1].weight), wC: fmt(full[2].weight), F: fmt(full[0].Fb) });
}

/* ---------- step 4: hemispheres ---------- */
// Fixed pseudo-random positions for the air dots (illustration only).
const DOTS = (() => { let a = 12345; const rnd = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; }; const out = []; while (out.length < 80) { const u = rnd() * 2 - 1, v = rnd() * 2 - 1; if (u * u + v * v < 0.9) out.push([u, v]); } return out; })();
function draw4() {
  const frac = num('f4') / 100, D = num('d4'), Hm = M.hemispheres(D, frac), Fmax = M.hemispheres(40, 0.95).F;
  $('f4v').textContent = Math.round(frac * 100) + '%'; $('d4v').textContent = D + ' cm';
  const canvas = $('c4'), { ctx, W, H } = fitCanvas(canvas, 320);
  title(ctx, t('c4'), 10, 18, W - 20, W);
  const cx = W / 2, cy = 34 + (H - 34) / 2, Rmax = Math.min((H - 34) / 2 - 40, W / 2 - 62), R = Rmax * (0.4 + 0.6 * (D - 10) / 30);
  const LpMax = Math.max(16, Math.min(64, W / 2 - Rmax - 34)); // longest pull arrow that still fits beside the largest sphere
  const gap = Hm.F < 1e-9 ? 10 : 2;
  // shells
  [-1, 1].forEach(side => {
    ctx.save(); ctx.translate(cx + side * gap / 2, cy);
    ctx.fillStyle = '#1f2b3a'; ctx.strokeStyle = C.metal; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, R, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? Math.PI * 1.5 : Math.PI / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    // handle ring
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(side * (R + 14), 0, 9, 0, 7); ctx.stroke();
    ctx.restore();
  });
  // air left inside
  const nDots = Math.round(DOTS.length * (1 - frac));
  ctx.fillStyle = C.pink; DOTS.slice(0, nDots).forEach(([u, v]) => { ctx.beginPath(); ctx.arc(cx + u * (R - 8), cy + v * (R - 8), 2, 0, 7); ctx.fill(); });
  // arrows: outside air pushes in (fixed length), inside air pushes out (length ∝ p_in)
  const Lout = Math.min(28, R * 0.5), Lin = Lout * Hm.pin / M.P0;
  for (let i = 0; i < 12; i++) {
    const a = (i + 0.5) / 12 * 2 * Math.PI, ux = Math.cos(a), uy = Math.sin(a);
    if (Math.abs(ux) > 0.93) continue; // leave room for the handles
    arrow(ctx, cx + ux * (R + 6 + Lout), cy + uy * (R + 6 + Lout), cx + ux * (R + 5), cy + uy * (R + 5), C.cyan, 2, 6);
    if (Lin > 1.5) arrow(ctx, cx + ux * (R - 6 - Lin), cy + uy * (R - 6 - Lin), cx + ux * (R - 5), cy + uy * (R - 5), C.pink, 2, 6);
  }
  // pulls on the handles, length ∝ F
  const Lp = LpMax * Hm.F / Fmax;
  if (Lp > 1) { arrow(ctx, cx - R - 24, cy, cx - R - 24 - Lp, cy, C.orange, 3.5, 9); arrow(ctx, cx + R + 24, cy, cx + R + 24 + Lp, cy, C.orange, 3.5, 9); }
  $('r4').textContent = Hm.F < 1e-9 ? t('s4zero', { p0: sci(M.P0, 3), pin: sci(Hm.pin, 3) }) : t('s4readout', { p0: sci(M.P0, 3), pin: sci(Hm.pin, 3), A: fmt(Hm.A, 4), F: Math.round(Hm.F), kg: Math.round(Hm.kg) });
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  $('e4').innerHTML = t('s4e', { perCm2: fmt(M.P0 * 1e-4, 1) });
  $('r4b').textContent = t('s4col', { col: fmt(M.waterColumn(M.G), 1), col98: fmt(M.waterColumn(M.G_TRUE), 1) });
  ['1', '2'].forEach(q => { const fb = $('fb' + q); if (fb.dataset.state) fb.textContent = quizText(q, fb.dataset.state === 'correct'); });
}
function quizText(q, ok) {
  if (q === '1') return t(ok ? 'correct1' : 'wrong1', { r: Math.round(M.ratio('tip', 'thumb')) });
  return t(ok ? 'correct2' : 'wrong2', { p: sci(M.diverP) });
}
function wireQuiz(q, answer) {
  $('check' + q).addEventListener('click', () => {
    const choice = document.querySelector(`input[name="quiz${q}"]:checked`), ok = !!choice && choice.value === answer, fb = $('fb' + q);
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.textContent = quizText(q, ok); fb.style.color = ok ? C.green : C.orange;
  });
}

function setup() {
  buildCases();
  Object.entries(FACE_IDS).forEach(([face, id]) => $(id).addEventListener('click', () => { s0.face = face; settle0(); }));
  $('n0').addEventListener('input', settle0);
  [['lqAlcohol', 'alcohol'], ['lqWater', 'water'], ['lqBrine', 'brine']].forEach(([id, k]) => $(id).addEventListener('click', () => { s2.liquid = k; addDot2(); draw2(); }));
  Object.entries(DIR_IDS).forEach(([d, id]) => $(id).addEventListener('click', () => { s2.dir = d; draw2(); }));
  $('h2').addEventListener('input', () => { addDot2(); draw2(); });
  $('clear2').addEventListener('click', () => { s2.dots = []; addDot2(); draw2(); });
  $('h3').addEventListener('input', draw3);
  ['f4', 'd4'].forEach(id => $(id).addEventListener('input', draw4));
  wireQuiz('1', 'c'); wireQuiz('2', 'c');
  addDot2();

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
