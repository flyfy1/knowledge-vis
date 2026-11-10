'use strict';
// Markov-chain lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, curve and readout comes from window.MC_MODEL (model.js). Canvas text is limited to
// panel titles, station names inside their circles and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MC_MODEL;
const t = (...a) => window.MC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const SC = [C.cyan, C.orange, C.green];        // station colours: metro, campus, park
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const pct = (v, d = 1) => fmt(100 * v, d) + '%';
const name = i => t('st' + i);
const vec = d => d.map((v, i) => `${name(i)} ${pct(v, 1)}`).join(t('sep'));

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
// One line of canvas text that shrinks (never squeezes) until it fits maxW.
function label(ctx, text, X, Y, maxW, { size = 12, color = C.text, weight = 600, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceTicks(lo, hi, maxN) {
  const span = hi - lo || 1, raw = span / Math.max(1, maxN), p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || 10 * p;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9 * step; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}
// A plot panel: title row above, y ticks left, x ticks below. xLog uses log10 positions.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const lx = v => (o.xLog ? Math.log10(v) : v), L0 = lx(o.xMin), L1 = lx(o.xMax);
  const x = v => P.l + (lx(v) - L0) / (L1 - L0) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yf = o.yFmt || (v => fmt(v));
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yf(v), P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks) {
    const xf = o.xFmt || (v => fmt(v)); ctx.textAlign = 'center';
    // drop ticks whose labels would touch the previous one
    let lastR = -Infinity;
    for (const v of o.xTicks) {
      const X = x(v), s = xf(v), w = ctx.measureText(s).width;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
      const cx = Math.min(Math.max(X, P.l - 4 + w / 2), W - 2 - w / 2);
      if (cx - w / 2 < lastR + 6) continue;
      ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
    }
  }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.4, alpha = 0.85) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) { vlineH(ctx, m.P.l, m.P.r, m.y(v), color, dash); }
function vlineH(ctx, x0, x1, Y, color, dash) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }
function tri(ctx, X, Y, s, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - s, Y + s * 1.5); ctx.lineTo(X + s, Y + s * 1.5); ctx.closePath(); ctx.fill(); ctx.restore(); }
/* ---------- shared animation runner (reduced motion, hidden pages) ---------- */
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

/* ---------- state diagram ---------- */
// Three stations on a triangle inside box; arrow width ∝ transition probability.
function stationPos(box) {
  const w = box.x1 - box.x0, h = box.y1 - box.y0, r = Math.max(20, Math.min(30, w / 11, h / 6));
  return { r, pts: [{ x: box.x0 + w * 0.17, y: box.y1 - r - 18 }, { x: box.x0 + w * 0.5, y: box.y0 + r + 18 }, { x: box.x0 + w * 0.83, y: box.y1 - r - 18 }] };
}
function arrowHead(ctx, x, y, ang, size, color) { ctx.save(); ctx.fillStyle = color; ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, size * 0.55); ctx.lineTo(-size, -size * 0.55); ctx.closePath(); ctx.fill(); ctx.restore(); }
function edge(ctx, a, b, r, p, color, bend = 26) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const sx = a.x + ux * r + nx * 7, sy = a.y + uy * r + ny * 7, ex = b.x - ux * (r + 2) + nx * 7, ey = b.y - uy * (r + 2) + ny * 7;
  const cx = (sx + ex) / 2 + nx * bend, cy = (sy + ey) / 2 + ny * bend, lw = 1 + 9 * p;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  const hx = ex - (ex - cx) / Math.hypot(ex - cx, ey - cy) * (6 + lw), hy = ey - (ey - cy) / Math.hypot(ex - cx, ey - cy) * (6 + lw);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, hx, hy); ctx.stroke(); ctx.restore();
  arrowHead(ctx, ex, ey, Math.atan2(ey - cy, ex - cx), 7 + lw, color);
}
function selfLoop(ctx, a, centre, r, p, color) {
  const dx = a.x - centre.x, dy = a.y - centre.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, lr = 11, lw = 1 + 9 * p;
  const cx = a.x + ux * (r + lr - 3), cy = a.y + uy * (r + lr - 3);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); const base = Math.atan2(-uy, -ux); ctx.arc(cx, cy, lr, base + 0.9, base + 2 * Math.PI - 0.9); ctx.stroke(); ctx.restore();
  const ea = base + 0.9, exx = cx + lr * Math.cos(ea), eyy = cy + lr * Math.sin(ea);
  arrowHead(ctx, exx, eyy, ea - Math.PI / 2 - 0.5, 6 + lw * 0.6, color);
}
function diagram(ctx, box, P, { active = -1, fill = null } = {}) {
  const { r, pts } = stationPos(box), centre = { x: (pts[0].x + pts[1].x + pts[2].x) / 3, y: (pts[0].y + pts[1].y + pts[2].y) / 3 };
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const p = P[i][j]; if (p <= 0) continue;
    const col = active < 0 ? 'rgba(154,170,189,0.75)' : i === active ? C.orange : 'rgba(85,101,122,0.45)';
    if (i === j) selfLoop(ctx, pts[i], centre, r, p, col); else edge(ctx, pts[i], pts[j], r, p, col);
  }
  pts.forEach((q, i) => {
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill();
    if (fill) { ctx.fillStyle = SC[i]; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.arc(q.x, q.y, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * fill[i]); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = SC[i]; ctx.lineWidth = i === active ? 4 : 2; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.stroke();
    label(ctx, name(i), q.x, q.y + 4, 2 * r - 8, { size: 12, align: 'center' });
  });
}

/* ---------- step 0: one bike, no memory ---------- */
const TODAY0 = 1; // conditional table is for bikes that are at the campus today
const s0 = { seed: 1, path: [1] };
function matrixHTML(P, active) {
  const head = `<tr><th>${t('fromTo')}</th>${[0, 1, 2].map(j => `<th>${name(j)}</th>`).join('')}</tr>`;
  return head + P.map((row, i) => `<tr${i === active ? ' class="on"' : ''}><th>${name(i)}</th>${row.map(v => `<td>${fmt(v, 2)}</td>`).join('')}</tr>`).join('');
}
function draw0() {
  const P = M.P0, path = s0.path, cur = path[path.length - 1];
  const { ctx, W, H } = fitCanvas($('c0'));
  label(ctx, t('c0title'), 8, 18, W - 16);
  diagram(ctx, { x0: 8, y0: 26, x1: W - 8, y1: H - 64 }, P, { active: cur });
  // history strip of the last days
  const last = path.slice(-40), cw = Math.min(18, (W - 16) / 40), y = H - 34;
  label(ctx, t('c0strip', { n: last.length }), 8, y - 8, W - 16, { size: 11, weight: 500, color: C.muted });
  last.forEach((s, i) => { ctx.fillStyle = SC[s]; ctx.fillRect(8 + i * cw, y, cw - 2, 18); });
  ['go0a', 'go0b', 'go0c'].forEach((id, i) => $(id).setAttribute('aria-pressed', cur === i && path.length === 1));
  $('mat0').innerHTML = matrixHTML(P, cur);
  const cnt = M.conditional(path, TODAY0);
  const rows = [0, 1, 2].map(y => { const n = cnt[y].reduce((a, b) => a + b, 0); return `<tr><th>${t('yest', { s: name(y) })}</th>${cnt[y].map(c => `<td>${n ? pct(c / n, 0) : '—'}</td>`).join('')}<td class="n">${n}</td></tr>`; }).join('');
  $('cond0').innerHTML = `<tr><th></th>${[0, 1, 2].map(j => `<th>${t('tomorrowAt', { s: name(j) })}</th>`).join('')}<th>${t('cases')}</th></tr>` + rows + `<tr class="truth"><th>${t('rowTruth')}</th>${P[TODAY0].map(v => `<td>${pct(v, 0)}</td>`).join('')}<td></td></tr>`;
  $('r0').textContent = t('s0readout', { days: path.length - 1, s: name(cur), row: P[cur].map((v, j) => `${name(j)} ${fmt(v, 2)}`).join(t('sep')) });
}
function walk0(n) { const r = s0.rnd; const out = M.walk(M.P0, s0.path[s0.path.length - 1], n, r); s0.path = s0.path.concat(out.slice(1)); if (s0.path.length > 20001) s0.path = s0.path.slice(-20001); draw0(); }

/* ---------- step 1: a fleet of 300 bikes ---------- */
const FLEET = 300, T1 = 20;
const s1 = { start: [1, 0, 0] };
const STARTS = { m: [1, 0, 0], u: [0, 1, 0], p: [0, 0, 1], even: [1 / 3, 1 / 3, 1 / 3] };
function draw1() {
  const day = num('t1'), tr = M.evolve(s1.start, M.P0, T1), pi = M.stationary(M.P0), d = tr[day];
  $('t1v').textContent = String(day);
  Object.keys(STARTS).forEach(k => $('st1_' + k).setAttribute('aria-pressed', STARTS[k] === s1.start));
  const { ctx, W, H } = fitCanvas($('c1'));
  // top: bikes at each station on the chosen day
  label(ctx, t('c1a', { day }), 8, 18, W - 16);
  const lw = 52, bx = 8 + lw, bw = W - bx - 16;
  d.forEach((v, i) => {
    const y = 30 + i * 30;
    label(ctx, name(i), 8, y + 15, lw - 8, { size: 12, weight: 500, color: C.muted });
    ctx.fillStyle = 'rgba(85,101,122,0.35)'; ctx.fillRect(bx, y + 3, bw, 16);
    ctx.fillStyle = SC[i]; ctx.fillRect(bx, y + 3, bw * v, 16);
    ctx.fillStyle = C.text; ctx.fillRect(bx + bw * pi[i] - 1, y, 2, 22);
  });
  const A = panel(ctx, W, { top: 162, bottom: H - 28, left: 40, xMin: 0, xMax: T1, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: niceTicks(0, T1, Math.max(4, Math.floor(W / 60))), title: t('c1b') });
  pi.forEach((v, i) => hline(ctx, A, v, SC[i], [3, 4]));
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.strokeStyle = SC[i]; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let k = 0; k <= day; k++) { const X = A.x(k), Y = A.y(tr[k][i]); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke(); ctx.fillStyle = SC[i]; ctx.beginPath(); ctx.arc(A.x(day), A.y(d[i]), 4.5, 0, 7); ctx.fill(); ctx.restore();
  }
  const counts = d.map(v => Math.round(v * FLEET));
  $('r1').textContent = t('s1readout', { day, now: vec(d), bikes: counts.map((c, i) => `${name(i)} ${c}`).join(t('sep')), pi: vec(pi), gap: fmt(M.tv(d, pi), 4) });
}

/* ---------- step 2: the steady state is a balance ---------- */
const s2 = { d: [0.6, 0.2, 0.2] };
function sync2() { $('a2').value = String(Math.round(s2.d[0] * 1000) / 10); $('b2').value = String(Math.round(s2.d[1] * 1000) / 10); }
function draw2() {
  const d = s2.d, f = M.flows(d, M.P0), nx = M.step(d, M.P0), gap = M.tv(nx, d) * 2;
  $('a2v').textContent = pct(d[0], 1); $('b2v').textContent = pct(d[1], 1); $('c2v').textContent = pct(d[2], 1);
  const { ctx, W, H } = fitCanvas($('c2'));
  const top = 0.45;
  const A = panel(ctx, W, { top: 36, bottom: H - 28, left: 44, xMin: -0.5, xMax: 2.5, yMin: 0, yMax: top, yTicks: [0, 0.1, 0.2, 0.3, 0.4], yFmt: v => pct(v, 0), xTicks: [0, 1, 2], xFmt: i => name(i), title: t('c2title') });
  const bw = Math.min(46, (A.x(1) - A.x(0)) * 0.3);
  f.forEach((q, i) => {
    ctx.fillStyle = C.pink; ctx.fillRect(A.x(i) - bw - 2, A.y(Math.min(top, q.out)), bw, A.y(0) - A.y(Math.min(top, q.out)));
    ctx.fillStyle = C.green; ctx.fillRect(A.x(i) + 2, A.y(Math.min(top, q.inn)), bw, A.y(0) - A.y(Math.min(top, q.inn)));
  });
  const st = gap < 1e-9 ? t('s2steady') : t('s2moving');
  $('r2').textContent = t('s2readout', { now: vec(d), next: vec(nx), flows: f.map((q, i) => t('flowItem', { s: name(i), o: pct(q.out, 1), i: pct(q.inn, 1) })).join(t('sep')), gap: pct(gap / 2, 2), st });
}

/* ---------- step 3: how fast the start is forgotten ---------- */
const T3 = 80;
function draw3() {
  const s = num('s3'), P = M.sticky(M.P0, s), pi = M.stationary(P), e = M.eigOthers(P), lam = e.mod;
  $('s3v').textContent = fmt(s, 2);
  const { ctx, W, H } = fitCanvas($('c3'));
  const lo = -4, A = panel(ctx, W, { top: 36, bottom: H - 28, left: 50, xMin: 0, xMax: T3, yMin: lo, yMax: 0, yTicks: [0, -1, -2, -3, -4], yFmt: v => (v === 0 ? '1' : fmt(Math.pow(10, v), 4)), xTicks: niceTicks(0, T3, Math.max(4, Math.floor(W / 60))), title: t('c3title') });
  const L = v => Math.max(lo, Math.log10(Math.max(v, 1e-12)));
  let worst0 = 0;
  for (let i = 0; i < 3; i++) {
    const tr = M.evolve(M.unit(i), P, T3); worst0 = Math.max(worst0, M.tv(tr[0], pi));
    ctx.save(); ctx.strokeStyle = SC[i]; ctx.lineWidth = 2; ctx.beginPath(); let pen = false;
    tr.forEach((d, k) => { const v = M.tv(d, pi); if (Math.log10(Math.max(v, 1e-12)) < lo) { pen = false; return; } const X = A.x(k), Y = A.y(L(v)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); let pen = false;
  for (let k = 0; k <= T3; k++) { const v = worst0 * Math.pow(lam, k); if (Math.log10(v) < lo) break; const X = A.x(k), Y = A.y(L(v)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  hline(ctx, A, -2, C.ghost, [2, 4]);
  const days = M.mixDays(P, 0.01);
  $('r3').textContent = t('s3readout', { s: fmt(s, 2), lam: fmt(lam, 3), l1: fmt(e.re[0], 3), l2: fmt(e.re[1], 3), days, pi: vec(pi) });
}

/* ---------- step 4: when there is no single steady state ---------- */
const T4 = 30;
const s4 = { preset: 'normal' };
function draw4() {
  const P = M.PRESETS[s4.preset];
  ['normal', 'cycle', 'split'].forEach(k => $('pr_' + k).setAttribute('aria-pressed', s4.preset === k));
  const { ctx, W, H } = fitCanvas($('c4'));
  label(ctx, t('c4a'), 8, 18, W - 16);
  diagram(ctx, { x0: 8, y0: 24, x1: W - 8, y1: 190 }, P);
  const A = panel(ctx, W, { top: 236, bottom: H - 28, left: 40, xMin: 0, xMax: T4, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: niceTicks(0, T4, Math.max(4, Math.floor(W / 60))), title: t('c4b') });
  const ta = M.evolve(M.unit(0), P, T4), tb = M.evolve(M.unit(2), P, T4);
  for (let i = 0; i < 3; i++) [[ta, []], [tb, [5, 4]]].forEach(([tr, dash]) => {
    ctx.save(); ctx.strokeStyle = SC[i]; ctx.lineWidth = dash.length ? 1.6 : 2.2; ctx.setLineDash(dash); ctx.beginPath();
    tr.forEach((d, k) => { const X = A.x(k), Y = A.y(d[i]) + (dash.length ? 0 : 0); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
  });
  const endA = ta[T4], endB = tb[T4], endA1 = ta[T4 - 1];
  const e = M.eigOthers(P);
  $('r4').textContent = t('s4readout_' + s4.preset, { a: vec(endA), b: vec(endB), a1: vec(endA1), lam: fmt(e.mod, 3) });
}

/* ---------- step 5: waiting for a pattern ---------- */
const PATS = ['HH', 'HT', 'HHH', 'HTH'], TB = 40, MAX5 = 20000;
const s5 = { pat: 'HH', seed: 7, waits: [] };
function reset5() { s5.rnd = M.rng(s5.seed); s5.waits = []; }
function drawAutomaton(ctx, box, pat) {
  const L = pat.length, tr = M.automaton(pat), n = L + 1, w = box.x1 - box.x0;
  const r = Math.max(15, Math.min(22, w / (n * 3.4))), gap = (w - 2 * r) / (n - 1), cy = (box.y0 + box.y1) / 2;
  const X = s => box.x0 + r + s * gap;
  const ecol = { H: C.orange, T: C.cyan };
  for (let s = 0; s < L; s++) for (const ch of ['H', 'T']) {
    const k = tr[s][ch], col = ecol[ch], up = ch === 'H' ? -1 : 1;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2;
    if (k === s + 1) { // forward step along the row
      const x0 = X(s) + r, x1 = X(k) - r - 2, yy = cy + (ch === 'H' ? 0 : 0);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1 - 6, yy); ctx.stroke(); ctx.restore(); arrowHead(ctx, x1, yy, 0, 9, col);
    } else if (k === s) { // stays: a small loop above (H) or below (T)
      // a loop that starts and ends on the rim, bulging away from the row
      const cyl = cy + up * (r + 6), lr = 10, a0 = up < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, a1 = a0 + Math.PI * 1.5;
      ctx.beginPath(); ctx.arc(X(s), cyl, lr, a0, a1); ctx.stroke(); ctx.restore(); // clockwise, the far side of the loop
      const ex = X(s) + lr * Math.cos(a1), ey = cyl + lr * Math.sin(a1);
      arrowHead(ctx, ex, ey, a1 + Math.PI / 2, 7, col);
    } else { // falls back to an earlier state: an arc above (H) or below (T)
      // leave and enter each circle just outside its rim so the arrowhead is not hidden under the node
      const xa = X(s), xb = X(k), hgt = Math.min(box.y1 - cy - 4, 18 + (s - k) * 9), o = r * 0.78;
      const sx = xa - o, sy = cy + up * o, ex = xb + o, ey = cy + up * o, cx = (sx + ex) / 2, cyc = cy + up * (hgt + r);
      const ang = Math.atan2(ey - cyc, ex - cx), hx = ex - Math.cos(ang) * 7, hy = ey - Math.sin(ang) * 7;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cyc, hx, hy); ctx.stroke(); ctx.restore();
      arrowHead(ctx, ex, ey, ang, 8, col);
    }
  }
  for (let s = 0; s <= L; s++) {
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(X(s), cy, r, 0, 7); ctx.fill();
    ctx.strokeStyle = s === L ? C.green : C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s), cy, r, 0, 7); ctx.stroke();
    if (s === L) { ctx.beginPath(); ctx.arc(X(s), cy, r - 4, 0, 7); ctx.stroke(); }
    label(ctx, s === 0 ? '∅' : pat.slice(0, s), X(s), cy + 4, 2 * r - 8, { size: 12, align: 'center' });
  }
}
function draw5() {
  const pat = s5.pat, E = M.expectedWait(pat), pmf = M.waitPmf(pat, TB), n = s5.waits.length;
  PATS.forEach(p => $('pt_' + p).setAttribute('aria-pressed', s5.pat === p));
  const { ctx, W, H } = fitCanvas($('c5'));
  label(ctx, t('c5a', { pat }), 8, 18, W - 16);
  drawAutomaton(ctx, { x0: 16, y0: 30, x1: W - 16, y1: 140 }, pat);
  // exact tail beyond TB lumped into the last bin
  const exact = pmf.slice(); exact[TB] = 1 - pmf.slice(0, TB).reduce((a, b) => a + b, 0);
  const counts = new Array(TB + 1).fill(0); s5.waits.forEach(w => { counts[Math.min(TB, w)]++; });
  const shares = counts.map(c => (n ? c / n : 0));
  const top = Math.max(...exact.slice(1), ...shares.slice(1)) * 1.15;
  const A = panel(ctx, W, { top: 186, bottom: H - 28, left: 44, xMin: 0.5, xMax: TB + 0.5, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 3), yFmt: v => fmt(v, 2), xTicks: [1, 10, 20, 30, 40], xFmt: v => (v === TB ? TB + '+' : String(v)), title: t('c5b') });
  const bw = Math.max(2, (A.x(1) - A.x(0)) * 0.72);
  for (let k = 1; k <= TB; k++) {
    if (n) { ctx.fillStyle = C.violet; ctx.fillRect(A.x(k) - bw / 2, A.y(shares[k]), bw, A.y(0) - A.y(shares[k])); }
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(A.x(k) - bw / 2 - 1, A.y(exact[k])); ctx.lineTo(A.x(k) + bw / 2 + 1, A.y(exact[k])); ctx.stroke(); ctx.restore();
  }
  vline(ctx, A.x(E), A.P.t, A.P.b, C.green, [5, 4], 1.6, 1);
  ['run5a', 'run5b'].forEach((id, i) => { $(id).disabled = n + [100, 1000][i] > MAX5; });
  const others = PATS.map(p => `${p} ${fmt(M.expectedWait(p), 1)}`).join(t('sep'));
  if (!n) { $('r5').textContent = t('s5empty', { pat, E: fmt(E, 2), others }); return; }
  const mean = s5.waits.reduce((a, b) => a + b, 0) / n;
  $('r5').textContent = t('s5readout', { pat, n: n.toLocaleString('en-US'), mean: fmt(mean, 2), E: fmt(E, 2), others });
}
function run5(m) {
  const start = s5.waits.length, target = Math.min(MAX5, start + m);
  animate('s5', m >= 1000 ? 1400 : 700, pr => { const want = Math.round(start + (target - start) * pr); while (s5.waits.length < want) s5.waits.push(M.waitSample(s5.pat, s5.rnd)); draw5(); });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  s0.rnd = M.rng(s0.seed);
  ['go0a', 'go0b', 'go0c'].forEach((id, i) => $(id).addEventListener('click', () => { s0.path = [i]; draw0(); }));
  $('day0').addEventListener('click', () => walk0(1));
  $('days0').addEventListener('click', () => walk0(1000));
  $('clear0').addEventListener('click', () => { s0.path = [s0.path[s0.path.length - 1]]; draw0(); });

  Object.keys(STARTS).forEach(k => $('st1_' + k).addEventListener('click', () => { stopAnim('s1'); s1.start = STARTS[k]; $('t1').value = '0'; draw1(); }));
  $('t1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('play1').addEventListener('click', () => { animate('s1', 4000, p => { $('t1').value = String(Math.round(p * T1)); draw1(); }); });

  $('a2').addEventListener('input', () => { let a = num('a2') / 100, b = s2.d[1]; if (a + b > 1) b = 1 - a; s2.d = [a, b, Math.max(0, 1 - a - b)]; sync2(); draw2(); });
  $('b2').addEventListener('input', () => { let b = num('b2') / 100, a = s2.d[0]; if (a + b > 1) a = 1 - b; s2.d = [a, b, Math.max(0, 1 - a - b)]; sync2(); draw2(); });
  $('stepBtn2').addEventListener('click', () => { s2.d = M.step(s2.d, M.P0); sync2(); draw2(); });
  $('solve2').addEventListener('click', () => { s2.d = M.stationary(M.P0); sync2(); draw2(); });
  sync2();

  $('s3').addEventListener('input', draw3);
  ['normal', 'cycle', 'split'].forEach(k => $('pr_' + k).addEventListener('click', () => { s4.preset = k; draw4(); }));

  reset5();
  PATS.forEach(p => $('pt_' + p).addEventListener('click', () => { stopAnim('s5'); s5.pat = p; reset5(); draw5(); }));
  $('run5a').addEventListener('click', () => run5(100));
  $('run5b').addEventListener('click', () => run5(1000));
  $('reset5').addEventListener('click', () => { stopAnim('s5'); s5.seed++; reset5(); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshMarkov = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
