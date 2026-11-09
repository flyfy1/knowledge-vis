'use strict';
// Materials science lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.MAT_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and the bar labels of steps 3–4, each laid out in fixed rows/columns.
(function () {

const $ = id => document.getElementById(id);
const M = window.MAT_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const MCOL = { steel: C.cyan, al: C.violet, cu: C.orange, ceramic: C.green };
const MKEY = { steel: 'Steel', al: 'Al', cu: 'Cu', ceramic: 'Ceramic' };
const matName = k => t('mat' + MKEY[k]), shortName = k => t('sh' + MKEY[k]);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const pct = (e, d = 2) => fmt(e * 100, d);

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title in its own row; the font shrinks until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 9);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}

// A plot panel with explicit tick lists. tx/ty map data → axis coordinate (identity or log10).
function panel(ctx, W, o) {
  const tx = o.tx || (v => v), ty = o.ty || (v => v);
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (tx(v) - tx(o.xMin)) / (tx(o.xMax) - tx(o.xMin)) * (P.r - P.l);
  const y = v => P.b - (ty(v) - ty(o.yMin)) / (ty(o.yMax) - ty(o.yMin)) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.yFmt || String)(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  // x ticks: drop labels that would collide with the previous one (keeps 320 px readable)
  ctx.textAlign = 'center'; let lastR = -Infinity;
  for (const v of o.xTicks) {
    const X = x(v), s = (o.xFmt || String)(v), w = ctx.measureText(s).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b + 4); ctx.stroke();
    let cx = Math.min(Math.max(X, P.l + w / 2), W - 2 - w / 2);
    if (cx - w / 2 < lastR + 6) continue;
    ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clip(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
function path(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function cross(ctx, X, Y, color, r = 5) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath();
  ctx.moveTo(X - r, Y - r); ctx.lineTo(X + r, Y + r); ctx.moveTo(X + r, Y - r); ctx.lineTo(X - r, Y + r); ctx.stroke(); ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.orange, alpha = 0.55) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
// Strain grid for drawing a curve from 0 to e1: dense near the elastic kink, then uniform.
function strains(key, e1, ratio, n = 260) {
  const out = [0], ey = M.MATS[key].brittle ? e1 : Math.min(e1, 0.004);
  for (let i = 1; i <= 40; i++) out.push(ey * i / 40);
  for (let i = 1; i <= n; i++) out.push(ey + (e1 - ey) * i / n);
  return out.filter((v, i, a) => i === 0 || v > a[i - 1]);
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

/* ---------- material buttons ---------- */
const state = { 1: 'steel', 2: 'steel', 3: 'steel' };
const redraw = { 1: () => draw1(), 2: () => draw2(), 3: () => draw3() };
function buildMatButtons() {
  document.querySelectorAll('.mats').forEach(box => {
    const g = box.dataset.group;
    box.setAttribute('role', 'group');
    M.ORDER.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn toggle'; b.dataset.mat = k; b.dataset.step = g;
      b.addEventListener('click', () => { stopAnim('s' + g); state[g] = k; if (g === '3') { $('e3').value = '0'; } redraw[g](); });
      box.appendChild(b);
    });
  });
}
function syncMatButtons() {
  document.querySelectorAll('.mats').forEach(box => {
    box.setAttribute('aria-label', t('matGroup'));
    box.querySelectorAll('button').forEach(b => { b.textContent = matName(b.dataset.mat); b.setAttribute('aria-pressed', String(state[box.dataset.group] === b.dataset.mat)); });
  });
}

/* ---------- step 0: force/extension vs stress/strain ---------- */
const s0 = { trail: [] };
const S0 = (() => { // axis limits from the slider ranges, so the axes never jump
  let F = 0, dL = 0, ef = 0;
  for (let d = M.SPEC.dMin; d <= M.SPEC.dMax; d += 2) for (let L = M.SPEC.LMin; L <= M.SPEC.LMax; L += 10) {
    const q = M.specimen(d, L); F = Math.max(F, q.Fmax); dL = Math.max(dL, q.dLbreak); ef = Math.max(ef, q.ef);
  }
  return { F: Math.ceil(F / 20) * 20, dL: Math.ceil(dL / 5) * 5, ef: Math.ceil(ef * 10) / 10 };
})();
function addSpecimen() {
  const d = num('d0'), L = num('L0');
  s0.trail = s0.trail.filter(q => !(q.d === d && q.L === L));
  s0.trail.push({ d, L }); if (s0.trail.length > 7) s0.trail.shift();
}
function draw0() {
  const d = num('d0'), L = num('L0'), q = M.specimen(d, L);
  $('d0v').textContent = String(d); $('L0v').textContent = String(L);
  const { ctx, W, H } = fitCanvas($('c0'));
  const mid = Math.round(H / 2);
  const tk = (max, step) => { const a = []; for (let v = 0; v <= max + 1e-9; v += step) a.push(v); return a; };
  const A = panel(ctx, W, { top: 28, bottom: mid - 30, xMin: 0, xMax: S0.dL, yMin: 0, yMax: S0.F, yTicks: tk(S0.F, S0.F > 100 ? 40 : 20), xTicks: tk(S0.dL, 5), title: t('c0top') });
  const B = panel(ctx, W, { top: mid + 26, bottom: H - 26, xMin: 0, xMax: S0.ef, yMin: 0, yMax: 450, yTicks: [0, 100, 200, 300, 400], xTicks: tk(S0.ef, 0.1), xFmt: v => Math.round(v * 100), title: t('c0bot') });
  const nk = M.necking('steel');
  vguide(ctx, B.x(nk.eu), B.P.t, B.P.b, C.ghost, 0.9);
  s0.trail.forEach((sp, i) => {
    const cur = i === s0.trail.length - 1, r = M.specimen(sp.d, sp.L), col = cur ? C.cyan : C.raw, lw = cur ? 2.6 : 1.4;
    const es = strains('steel', r.ef, r.ratio, 200), pts = es.map(e => [e, M.response('steel', e, r.ratio).s]);
    clip(ctx, A); path(ctx, pts.map(([e, s]) => [A.x(e * sp.L), A.y(s * r.A0 / 1000)]), col, lw); ctx.restore();
    clip(ctx, B); path(ctx, pts.map(([e, s]) => [B.x(e), B.y(s)]), col, lw); ctx.restore();
    const sb = pts[pts.length - 1][1];
    if (cur) { cross(ctx, A.x(r.ef * sp.L), A.y(sb * r.A0 / 1000), C.text); cross(ctx, B.x(r.ef), B.y(sb), C.text); }
  });
  const std = q.isStd ? t('stdYes') : t('stdNo', { r: fmt(L / Math.sqrt(q.A0), 2) });
  $('r0').textContent = t('s0readout', { d, A: fmt(q.A0, 1), L, F: fmt(q.Fmax, 1), dL: fmt(q.dLbreak, 1), uts: fmt(q.uts, 0), ef: pct(q.ef, 1), std });
}

/* ---------- step 1: unloading reveals permanent strain ---------- */
const s1 = { trail: { steel: new Set(), al: new Set(), cu: new Set(), ceramic: new Set() } };
function draw1() {
  syncMatButtons();
  const key = state[1], m = M.MATS[key], e = num('e1') / 100, r = M.response(key, e);
  s1.trail[key].add(num('e1').toFixed(2));
  $('e1v').textContent = num('e1').toFixed(2) + '%';
  const { ctx, W, H } = fitCanvas($('c1'));
  const X1 = 0.022, xt = [0, 0.005, 0.01, 0.015, 0.02], xf = v => fmt(v * 100, v * 100 % 1 ? 1 : 0);
  const A = panel(ctx, W, { top: 28, bottom: 268, xMin: 0, xMax: X1, yMin: 0, yMax: 450, yTicks: [0, 100, 200, 300, 400], xTicks: xt, xFmt: xf, title: t('c1top') });
  const col = MCOL[key], ef = M.breakStrain(key);
  // offset line and Rp0.2
  const rp = M.rp02(key);
  clip(ctx, A);
  if (rp) path(ctx, [[A.x(M.OFFSET), A.y(0)], [A.x(M.OFFSET + 450 / m.E), A.y(450)]], C.orange, 1.5, [6, 5]);
  const es = strains(key, Math.min(X1, ef)), pts = es.map(v => [A.x(v), A.y(M.response(key, v).s)]);
  path(ctx, pts, col, 2.6);
  if (!r.broken) path(ctx, [[A.x(e), A.y(r.s)], [A.x(r.eres), A.y(0)]], C.text, 2);
  ctx.restore();
  if (rp) dot(ctx, A.x(rp.e), A.y(rp.s), C.orange, 5.5, true);
  if (m.brittle && ef < X1) cross(ctx, A.x(ef), A.y(m.sf), C.text);
  if (!r.broken) { dot(ctx, A.x(e), A.y(r.s), col, 5.5); dot(ctx, A.x(r.eres), A.y(0), C.text, 4); }
  const B = panel(ctx, W, { top: 322, bottom: H - 26, xMin: 0, xMax: X1, yMin: 0, yMax: 0.02, yTicks: [0, 0.01, 0.02], yFmt: v => fmt(v * 100, 0), xTicks: xt, xFmt: xf, title: t('c1bot') });
  [...s1.trail[key]].forEach(sv => { const v = Number(sv) / 100, q = M.response(key, v); if (!q.broken) dot(ctx, B.x(v), B.y(q.eres), C.text, 2.6); });
  if (!r.broken) dot(ctx, B.x(e), B.y(r.eres), col, 5);
  vguide(ctx, A.x(Math.min(e, X1)), A.P.t, B.P.b, col, 0.4);
  const E = fmt(m.E / 1000, 0);
  if (m.brittle) {
    $('r1').textContent = r.broken ? t('s1broken', { mat: matName(key), ef: pct(ef, 3), sf: m.sf })
      : t('s1brittle', { mat: matName(key), e: pct(e, 2), s: fmt(r.s, 0), E, ef: pct(ef, 3), sf: m.sf });
    return;
  }
  $('r1').textContent = t('s1readout', { mat: matName(key), e: pct(e, 2), s: fmt(r.s, 0), back: pct(e - r.eres, 3), perm: pct(r.eres, 3), E, sp: m.sp, rp: fmt(rp.s, 0), state: t(r.eres > 0 ? 's1plastic' : 's1elastic') });
}

/* ---------- step 2: true stress, hardening rate and necking ---------- */
function drawSpecimen(ctx, W, top, key, e) {
  const m = M.MATS[key], ef = M.breakStrain(key), nk = M.necking(key);
  const L0 = Math.min(W * 0.42, 340), t0 = 34, cx = W / 2, cy = top + 52;
  const broken = e > ef + 1e-12, eu = nk ? nk.eu : ef, eUse = Math.min(e, ef);
  const L = L0 * (1 + eUse), grip = Math.min(46, (W - L) / 2 - 10);
  // original outline (ghost)
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.strokeRect(cx - L0 / 2, cy - t0 / 2, L0, t0); ctx.restore();
  const tu = t0 / Math.sqrt(1 + Math.min(eUse, eu));
  const q = nk && eUse > eu ? (eUse - eu) / (ef - eu) : 0;
  const neckW = t0 * 1.6, depth = 0.55 * q; // schematic neck: Gaussian dip, depth grows with post-peak strain
  const half = xx => tu / 2 * (1 - depth * Math.exp(-Math.pow((xx - cx) / (neckW / 2), 2)));
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.28)'; ctx.strokeStyle = MCOL[key]; ctx.lineWidth = 2;
  const drawPiece = (x0, x1) => {
    ctx.beginPath(); ctx.moveTo(x0, cy - half(x0));
    for (let i = 1; i <= 80; i++) { const xx = x0 + (x1 - x0) * i / 80; ctx.lineTo(xx, cy - half(xx)); }
    for (let i = 80; i >= 0; i--) { const xx = x0 + (x1 - x0) * i / 80; ctx.lineTo(xx, cy + half(xx)); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  if (broken) { const gap = 8; drawPiece(cx - L / 2, cx - gap / 2); drawPiece(cx + gap / 2, cx + L / 2); } else drawPiece(cx - L / 2, cx + L / 2);
  ctx.restore();
  // grips
  ctx.save(); ctx.fillStyle = '#2a394c'; ctx.strokeStyle = C.axis;
  if (grip > 6) { ctx.fillRect(cx - L / 2 - grip, cy - t0 * 0.85, grip, t0 * 1.7); ctx.fillRect(cx + L / 2, cy - t0 * 0.85, grip, t0 * 1.7); }
  ctx.restore();
  if (m.brittle && broken) cross(ctx, cx, cy, C.text, 7);
}
function draw2() {
  syncMatButtons();
  const key = state[2], m = M.MATS[key], e = num('e2') / 100, r = M.response(key, e), ef = M.breakStrain(key), nk = M.necking(key);
  $('e2v').textContent = num('e2').toFixed(1) + '%';
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2spec'), 8, 19, W - 16);
  drawSpecimen(ctx, W, 26, key, e);
  const xt = [0, 0.1, 0.2, 0.3, 0.4, 0.5], X1 = 0.55;
  const A = panel(ctx, W, { top: 172, bottom: H - 26, xMin: 0, xMax: X1, yMin: 0, yMax: 700, yTicks: [0, 200, 400, 600], xTicks: xt, xFmt: v => Math.round(v * 100), title: t('c2plot') });
  clip(ctx, A);
  const es = strains(key, Math.min(X1, ef));
  path(ctx, es.map(v => [A.x(v), A.y(M.response(key, v).s)]), C.cyan, 2.6);
  if (nk) {
    const eu = nk.eu, ey = Math.exp(m.sp / m.E) - 1;
    const up = strains(key, eu).map(v => [A.x(v), A.y(M.trueUniform(key, v).st)]);
    path(ctx, up, C.orange, 2.2);
    const ext = []; for (let i = 0; i <= 120; i++) { const v = eu + (X1 - eu) * i / 120; ext.push([A.x(v), A.y(M.trueUniform(key, v).st)]); }
    path(ctx, ext, C.orange, 1.6, [6, 5]);
    const th = []; for (let i = 1; i <= 400; i++) { const v = ey + (X1 - ey) * Math.pow(i / 400, 2); const q = M.trueUniform(key, v); if (q.ep > 0) th.push([A.x(v), A.y(Math.min(2000, q.theta))]); }
    path(ctx, th, C.green, 2);
  }
  ctx.restore();
  if (nk) { dot(ctx, A.x(nk.eu), A.y(nk.st), C.orange, 6.5, true); vguide(ctx, A.x(nk.eu), A.P.t, A.P.b, C.ghost, 0.8); }
  if (r.broken) cross(ctx, A.x(Math.min(ef, X1)), A.y(M.response(key, ef - 1e-9).s), C.text);
  else dot(ctx, A.x(e), A.y(r.s), C.cyan, 5.5);
  vguide(ctx, A.x(Math.min(e, X1)), A.P.t, A.P.b, C.cyan, 0.45);
  const mat = matName(key);
  if (m.brittle) { $('r2').textContent = t('s2ceramic', { mat, ef: pct(ef, 3) }); return; }
  const eu = pct(nk.eu, 1), uts = fmt(nk.uts, 0);
  if (r.broken) $('r2').textContent = t('s2broken', { mat, ef: pct(ef, 1), eu, uts });
  else if (r.regime === 'elastic') $('r2').textContent = t('s2elastic', { mat, e: pct(e, 1), s: fmt(r.s, 0), E: fmt(m.E / 1000, 0) });
  else if (r.regime === 'plastic') { const q = M.trueUniform(key, e); $('r2').textContent = t('s2uniform', { mat, e: pct(e, 1), s: fmt(r.s, 0), st: fmt(q.st, 0), th: fmt(q.theta, 0), gap: pct(nk.eu - e, 1) }); }
  else $('r2').textContent = t('s2necked', { mat, e: pct(e, 1), s: fmt(r.s, 0), eu, uts });
}

/* ---------- step 3: area under the curve = toughness ---------- */
const s3 = { done: new Set() };
const TOUGH = Object.fromEntries(M.ORDER.map(k => [k, M.toughness(k)]));
function barRows(ctx, W, top, rowH, rows, axisMax, ticks, tickFmt) {
  // rows: [{label, value, color, valueText, pending, best}]
  ctx.save(); ctx.font = '12px system-ui,sans-serif';
  const labW = Math.max(...rows.map(r => ctx.measureText(r.label).width)) + 12;
  const valW = Math.max(...rows.map(r => ctx.measureText(r.valueText).width)) + 10;
  const x0 = 8 + labW, x1 = W - 8 - valW, bx = v => x0 + Math.min(1, v / axisMax) * (x1 - x0);
  ctx.strokeStyle = C.grid; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.font = '11px system-ui,sans-serif';
  const yb = top + rows.length * rowH; let lastR = -Infinity;
  for (const v of ticks) {
    const X = bx(v), s = tickFmt(v), w = ctx.measureText(s).width;
    ctx.beginPath(); ctx.moveTo(X, top - 4); ctx.lineTo(X, yb + 3); ctx.stroke();
    if (X - w / 2 > lastR + 6 && X + w / 2 <= W - 2) { ctx.fillText(s, X, yb + 16); lastR = X + w / 2; }
  }
  rows.forEach((r, i) => {
    const yc = top + i * rowH + rowH / 2;
    ctx.font = (r.best ? '700 ' : '') + '12px system-ui,sans-serif';
    ctx.textAlign = 'left'; ctx.fillStyle = r.best ? C.text : C.muted; ctx.fillText(r.label, 8, yc + 4);
    if (r.pending) { ctx.fillStyle = C.raw; ctx.font = '11px system-ui,sans-serif'; ctx.fillText(t('barPending'), x0 + 6, yc + 4); }
    else {
      const w = Math.max(2, bx(r.value) - x0);
      ctx.fillStyle = r.color; ctx.globalAlpha = 0.85; ctx.fillRect(x0, yc - rowH * 0.3, w, rowH * 0.6); ctx.globalAlpha = 1;
      if (r.value > axisMax) { ctx.fillStyle = C.bg; ctx.beginPath(); ctx.moveTo(x1 - 8, yc - rowH * 0.3); ctx.lineTo(x1, yc); ctx.lineTo(x1 - 8, yc + rowH * 0.3); ctx.closePath(); ctx.fill(); }
      if (r.best) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x0, yc - rowH * 0.3, w, rowH * 0.6); }
    }
    ctx.textAlign = 'right'; ctx.fillStyle = r.best ? C.text : C.muted; ctx.font = (r.best ? '700 ' : '') + '12px system-ui,sans-serif';
    ctx.fillText(r.valueText, W - 8, yc + 4);
  });
  ctx.restore();
}
function draw3() {
  syncMatButtons();
  const key = state[3], m = M.MATS[key], e = num('e3') / 100, r = M.response(key, e), ef = M.breakStrain(key);
  if (r.broken) s3.done.add(key);
  $('e3v').textContent = num('e3').toFixed(1) + '%';
  const { ctx, W, H } = fitCanvas($('c3'));
  const X1 = 0.55, col = MCOL[key];
  const A = panel(ctx, W, { top: 28, bottom: 292, xMin: 0, xMax: X1, yMin: 0, yMax: 450, yTicks: [0, 100, 200, 300, 400], xTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], xFmt: v => Math.round(v * 100), title: t('c3top') });
  const eTop = Math.min(e, ef);
  clip(ctx, A);
  if (eTop > 0) {
    const es = strains(key, eTop);
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.42; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(0));
    es.forEach(v => ctx.lineTo(A.x(v), A.y(M.response(key, v).s)));
    ctx.lineTo(A.x(eTop), A.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    if (!r.broken) { ctx.save(); ctx.fillStyle = C.text; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(A.x(r.eres), A.y(0)); ctx.lineTo(A.x(e), A.y(r.s)); ctx.lineTo(A.x(e), A.y(0)); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  path(ctx, strains(key, Math.min(X1, ef)).map(v => [A.x(v), A.y(M.response(key, v).s)]), col, 1.4, [3, 4]);
  if (eTop > 0) path(ctx, strains(key, eTop).map(v => [A.x(v), A.y(M.response(key, v).s)]), col, 2.6);
  ctx.restore();
  if (r.broken) cross(ctx, A.x(ef), A.y(M.response(key, ef - 1e-9).s), C.text); else dot(ctx, A.x(e), A.y(r.s), col, 5);
  title(ctx, t('c3bot'), 8, 346, W - 16);
  const rows = M.ORDER.map(k => ({ label: shortName(k), value: TOUGH[k], color: MCOL[k], pending: !s3.done.has(k), valueText: s3.done.has(k) ? fmt(TOUGH[k], TOUGH[k] < 1 ? 2 : 0) : '—', best: k === key }));
  barRows(ctx, W, 364, 30, rows, 120, [0, 40, 80, 120], v => String(v));
  const mat = matName(key), T = fmt(TOUGH[key], TOUGH[key] < 1 ? 3 : 1), res = fmt(M.resilience(key), 3);
  if (r.broken) { $('r3').textContent = t('s3broken', { mat, ef: pct(ef, ef < 0.01 ? 3 : 1), T, res }); return; }
  const U = M.energyTo(key, e), R = M.recoverable(key, e);
  $('r3').textContent = t('s3readout', { mat, e: pct(e, 1), U: fmt(U, U < 1 ? 3 : 1), R: fmt(R, 3), pct: U > 0 ? fmt(100 * R / U, 1) : '0', T, res });
}

/* ---------- step 4: material choice for a tie rod ---------- */
const s4 = { goal: 'mass' };
function draw4() {
  const F = num('F4'), dl = num('d4'), U = num('U4');
  $('F4v').textContent = String(F); $('d4v').textContent = dl.toFixed(1); $('U4v').textContent = String(U);
  $('goalMass').setAttribute('aria-pressed', String(s4.goal === 'mass')); $('goalThin').setAttribute('aria-pressed', String(s4.goal === 'thin'));
  const D = M.design(F, dl, U, s4.goal), val = r => (s4.goal === 'mass' ? r.mass : r.d);
  const bestVal = val(D.rows.find(r => r.key === D.best));
  const maxVal = Math.max(...D.rows.map(val));
  const raw = Math.min(maxVal, bestVal * 6), steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
  const step = steps.find(s => raw / s <= 4) || 500, axisMax = Math.ceil(raw / step) * step;
  const ticks = []; for (let v = 0; v <= axisMax + 1e-9; v += step) ticks.push(+v.toFixed(3));
  const { ctx, W } = fitCanvas($('c4'));
  title(ctx, t(s4.goal === 'mass' ? 'c4mass' : 'c4thin'), 8, 19, W - 16);
  const dg = v => (v < 1 ? 2 : v < 10 ? 2 : 1);
  barRows(ctx, W, 40, 52, D.rows.map(r => ({ label: shortName(r.key), value: val(r), color: MCOL[r.key], valueText: fmt(val(r), dg(val(r))), best: r.key === D.best })), axisMax, ticks, v => String(v));
  const bindName = b => t({ strength: 'bStrength', stiffness: 'bStiffness', energy: 'bEnergy' }[b]);
  $('t4').innerHTML = `<thead><tr><th>${t('thMat')}</th><th>${t('thBind')}</th><th>${t('thA')}</th><th>${t('thD')}</th><th>${t('thM')}</th></tr></thead><tbody>` +
    D.rows.map(r => `<tr class="${r.key === D.best ? 'best' : ''}"><td>${shortName(r.key)}</td><td class="bind">${bindName(r.binds)}</td><td>${fmt(r.A, 0)}</td><td>${fmt(r.d, 1)}</td><td>${fmt(r.mass, 2)}</td></tr>`).join('') + '</tbody>';
  const b = D.rows.find(r => r.key === D.best);
  $('r4').textContent = t('s4readout', { goal: t(s4.goal === 'mass' ? 'goalMassW' : 'goalThinW'), mat: matName(b.key), d: fmt(b.d, 1), m: fmt(b.mass, 2), bind: bindName(b.binds), note: b.key === 'ceramic' ? t('s4noteCeramic') : '' });
}

/* ---------- step 5: yield vs fracture with a crack ---------- */
function draw5() {
  const la = num('a5'), aMM = Math.pow(10, la), a = aMM / 1000;
  $('a5v').textContent = fmtA(aMM) + ' mm';
  $('lg5').innerHTML = M.ORDER.map(k => `<span class="lg"><span class="sw" style="background:${MCOL[k]}"></span><span>${shortName(k)}</span></span>`).join('') +
    `<span class="lg"><span>${t('s5lgSolid')}</span></span><span class="lg"><span>${t('s5lgDash')}</span></span>`;
  const { ctx, W, H } = fitCanvas($('c5'));
  const L10 = Math.log10;
  const A = panel(ctx, W, { top: 36, bottom: H - 26, xMin: 0.01, xMax: 1000, yMin: 10, yMax: 1000, tx: L10, ty: L10, yTicks: [10, 30, 100, 300, 1000], xTicks: [0.01, 0.1, 1, 10, 100, 1000], xFmt: v => String(v), title: t('c5title') });
  clip(ctx, A);
  for (const k of M.ORDER) {
    const sy = M.strength(k), col = MCOL[k], at = M.transitionCrack(k) * 1000;
    const solid = [], dashY = [], dashC = [];
    for (let i = 0; i <= 200; i++) {
      const xm = Math.pow(10, -2 + 5 * i / 200), sc = M.fractureStress(k, xm / 1000), f = Math.min(sy, sc);
      solid.push([A.x(xm), A.y(f)]);
      if (xm >= at) dashY.push([A.x(xm), A.y(sy)]); else dashC.push([A.x(xm), A.y(sc)]);
    }
    path(ctx, dashY, col, 1.2, [4, 5]); path(ctx, dashC, col, 1.2, [4, 5]); path(ctx, solid, col, 2.6);
    if (at > 0.01 && at < 1000) dot(ctx, A.x(at), A.y(sy), col, 4.5, true);
  }
  ctx.restore();
  vguide(ctx, A.x(aMM), A.P.t, A.P.b, C.text, 0.6);
  M.ORDER.forEach(k => { const f = M.failure(k, a); dot(ctx, A.x(aMM), A.y(f.s), MCOL[k], 5.5); });
  const list = M.ORDER.map(k => {
    const f = M.failure(k, a), mode = f.mode === 'brittle' ? 'modeBrittle' : f.mode === 'yield' ? 'modeYield' : 'modeFracture';
    return t('s5item', { mat: shortName(k), s: fmt(f.s, 0), mode: t(mode), at: fmtA(M.transitionCrack(k) * 1000) });
  }).join(t('listSep'));
  $('r5').textContent = t('s5readout', { a: fmtA(aMM), list });
}
function fmtA(v) { return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v >= 0.1 ? v.toFixed(3) : v.toFixed(4); }

function refresh() { syncMatButtons(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildMatButtons();
  addSpecimen();
  ['d0', 'L0'].forEach(id => $(id).addEventListener('input', () => { addSpecimen(); draw0(); }));
  $('std0').addEventListener('click', () => {
    // L0 = 5.65·√A0 = 5.007·d lands on the 10 mm slider grid for every diameter on the 2 mm grid
    $('L0').value = String(Math.round(5.65 * Math.sqrt(Math.PI * num('d0') ** 2 / 4) / 10) * 10);
    addSpecimen(); draw0();
  });
  $('clear0').addEventListener('click', () => { s0.trail = []; addSpecimen(); draw0(); });

  $('e1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('sweep1').addEventListener('click', () => {
    animate('s1', 3500, p => { const v = Math.round(p * 200) / 100; for (let q = 0; q <= v + 1e-9; q += 0.01) s1.trail[state[1]].add(q.toFixed(2)); $('e1').value = v.toFixed(2); draw1(); });
  });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.trail[state[1]].clear(); draw1(); });

  $('e2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('sweep2').addEventListener('click', () => {
    const end = Math.min(55, Math.ceil(M.breakStrain(state[2]) * 200 + 1) / 2);
    animate('s2', 5000, p => { $('e2').value = (Math.round(p * end * 2) / 2).toFixed(1); draw2(); });
  });

  $('e3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('sweep3').addEventListener('click', () => {
    const end = Math.min(55, Math.ceil(M.breakStrain(state[3]) * 200 + 1) / 2);
    animate('s3', 4500, p => { $('e3').value = (Math.round(p * end * 2) / 2).toFixed(1); draw3(); });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.done.clear(); $('e3').value = '0'; draw3(); });

  ['F4', 'd4', 'U4'].forEach(id => $(id).addEventListener('input', draw4));
  $('goalMass').addEventListener('click', () => { s4.goal = 'mass'; draw4(); });
  $('goalThin').addEventListener('click', () => { s4.goal = 'thin'; draw4(); });

  $('a5').addEventListener('input', draw5);

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
