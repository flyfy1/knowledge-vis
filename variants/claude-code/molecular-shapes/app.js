'use strict';
// Molecular shapes lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, angle, energy and arrow comes from window.MS_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MS_MODEL;
const t = (...a) => window.MS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', core: '#9fb4cc', lig: '#c9d5e3' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const sgn = (v, d = 1) => { const s = fmt(v, d); return s === '0' ? '0' : (v > 0 ? '+' : '−') + s.replace('-', ''); };
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = n => String(n).split('').map(c => SUB[+c]).join('');
const axe = (m, L) => 'AX' + (m > 1 ? sub(m) : '') + (L ? 'E' + (L > 1 ? sub(L) : '') : '');
const NAME = { BeCl2: 'BeCl₂', CO2: 'CO₂', BF3: 'BF₃', SO2: 'SO₂', CH4: 'CH₄', NH3: 'NH₃', H2O: 'H₂O', PCl5: 'PCl₅', ClF3: 'ClF₃', SF6: 'SF₆', XeF4: 'XeF₄' };
const angleList = (angles, tol = 0.5) => M.distinct(angles, tol).map(g => t('angleList', { v: fmt(g.deg), n: g.count })).join(t('sep'));

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
// Panel title on its own row; shrinks the font until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12; ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceTicks(lo, hi, maxN = 4) {
  const span = hi - lo, raw = span / maxN, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(f => f * mag).find(s => span / s <= maxN) || 10 * mag;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return { ticks: out, step };
}
// A plot panel: ticks left of / below the plot, title in its own row above.
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yt = niceTicks(o.yMin, o.yMax, o.yN || 4);
  for (const v of yt.ticks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits == null ? 2 : o.yDigits), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  const xn = Math.max(2, Math.floor((P.r - P.l) / (o.xMinPx || 46)));
  const xt = niceTicks(o.xMin, o.xMax, xn);
  ctx.textAlign = 'center';
  for (const v of xt.ticks) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v, 2) + (o.xUnit || ''), x(v), P.b + 15); }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, col, ring) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function curve(ctx, pts, col, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, col, lw = 3) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, h = Math.min(11, L * 0.45);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5); ctx.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- 3D view (orthographic, viewer slightly above) ---------- */
const PITCH = 20 / M.DEG;
function proj(v, yaw) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const x1 = v[0] * cy - v[1] * sy, y1 = v[0] * sy + v[1] * cy, z1 = v[2];
  return { x: x1, up: y1 * sp + z1 * cp, depth: -(y1 * cp - z1 * sp) };
}
// items: [{v, kind: 'dom' | 'bond' | 'lone', col}] ; opts: trails [[v...]...], arrows [{from, to, col, lw}] in unit vectors
function view3D(ctx, W, H, top, items, yawDeg, opts = {}) {
  const yaw = yawDeg / M.DEG, cx = W / 2, cy = top + (H - top) / 2, R = Math.min(W * 0.4, (H - top) * 0.4);
  const S = v => { const p = proj(v, yaw); return { X: cx + R * p.x, Y: cy - R * p.up, d: p.depth }; };
  ctx.save();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  ctx.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * 2 * Math.PI, s = S([Math.cos(a), Math.sin(a), 0]); if (i) ctx.lineTo(s.X, s.Y); else ctx.moveTo(s.X, s.Y); } ctx.stroke(); ctx.setLineDash([]);
  (opts.trails || []).forEach(tr => { if (tr.length < 2) return; ctx.strokeStyle = 'rgba(255,180,84,0.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); tr.forEach((v, i) => { const s = S(v); if (i) ctx.lineTo(s.X, s.Y); else ctx.moveTo(s.X, s.Y); }); ctx.stroke(); });
  const list = items.map(it => ({ ...it, s: S(it.v) })).sort((a, b) => a.s.d - b.s.d);
  const drawItem = it => {
    const { X, Y, d } = it.s, k = 1 + 0.18 * d;
    if (it.kind === 'lone') {
      const mx = cx + (X - cx) * 0.55, my = cy + (Y - cy) * 0.55, L = Math.hypot(X - cx, Y - cy), ang = Math.atan2(Y - cy, X - cx);
      ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); ctx.fillStyle = 'rgba(255,122,147,0.55)'; ctx.strokeStyle = 'rgba(255,122,147,0.95)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 0, Math.max(12, L * 0.36) * k, R * 0.2 * k, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
      return;
    }
    ctx.save(); ctx.strokeStyle = it.kind === 'dom' ? 'rgba(255,180,84,0.5)' : '#5d7088'; ctx.lineWidth = it.kind === 'dom' ? 1.5 : 4;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X, Y); ctx.stroke(); ctx.restore();
    const r = (it.kind === 'dom' ? 8 : 11) * k;
    dot(ctx, X, Y, r, it.col || C.cyan, true);
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(X - r * 0.3, Y - r * 0.3, r * 0.3, 0, 7); ctx.fill(); ctx.restore();
  };
  list.filter(it => it.s.d < 0).forEach(drawItem);
  dot(ctx, cx, cy, 13, C.core, true);
  list.filter(it => it.s.d >= 0).forEach(drawItem);
  (opts.arrows || []).forEach(a => { const p = S(a.from), q = S(a.to); arrow(ctx, cx + (p.X - cx) * a.scale, cy + (p.Y - cy) * a.scale, cx + (q.X - cx) * a.scale, cy + (q.Y - cy) * a.scale, a.col, a.lw || 3); });
  ctx.restore();
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

/* ---------- step 0: identical domains relax ---------- */
const s0 = { seed: 1, trace: null, key: '' };
function trace0() { const N = num('n0'), key = N + ':' + s0.seed; if (s0.key !== key) { s0.trace = M.relaxTrace(N, s0.seed); s0.key = key; } return s0.trace; }
function draw0() {
  const N = num('n0'), yaw = num('y0'), tr = trace0(), K = tr.K;
  if (Number($('k0').max) !== K) $('k0').max = K;
  const k = Math.min(num('k0'), K), P = tr.frames[k];
  $('n0v').textContent = String(N); $('k0v').textContent = k + '/' + K; $('y0v').textContent = yaw + '°';
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 18, W - 16);
  const trails = P.map((_, i) => { const out = []; for (let j = 0; j <= k; j += 3) out.push(tr.frames[j][i]); out.push(P[i]); return out; });
  view3D(ctx, W, H, 26, P.map(v => ({ v, kind: 'dom', col: C.orange })), yaw, { trails });
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const Emin = tr.E[K], Emax = tr.E[0], pad = Math.max(0.02, (Emax - Emin) * 0.08);
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: K, yMin: Emin - pad, yMax: Emax + pad, yDigits: 2, title: t('c0b') });
  const pts = []; for (let j = 0; j <= K; j += 2) pts.push([A.x(j), A.y(tr.E[j])]);
  curve(ctx, pts, 'rgba(183,156,255,0.25)', 1.5);
  const done = []; for (let j = 0; j <= k; j += 2) done.push([A.x(j), A.y(tr.E[j])]); done.push([A.x(k), A.y(tr.E[k])]);
  curve(ctx, done, C.violet, 2.2);
  dot(ctx, A.x(k), A.y(tr.E[k]), 5, C.cyan, true);
  const settled = k === K;
  const angles = settled ? angleList(M.pairAngles(P)) : t('s0min', { m: fmt(M.pairAngles(P)[0]) });
  $('r0').textContent = t('s0readout', { k, K, E: tr.E[k].toFixed(3), angles, done: settled ? t('s0done') : '' });
}

/* ---------- step 1: tetrahedron vs flat cross ---------- */
const s1 = { hist: new Set() };
const E1 = (() => { const out = []; for (let th = 60; th <= 180.001; th += 0.5) out.push([th, M.fourStats(th).E]); return out; })();
const E1min = Math.min(...E1.map(q => q[1]));
function draw1() {
  const th = num('t1'), yaw = num('y1'), st = M.fourStats(th);
  s1.hist.add(th);
  $('t1v').textContent = fmt(th) + '°'; $('y1v').textContent = yaw + '°';
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 18, W - 16);
  view3D(ctx, W, H, 26, st.P.map((v, i) => ({ v, kind: 'dom', col: i < 2 ? C.orange : C.green })), yaw);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const Emax = Math.max(...E1.map(q => q[1]));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 60, xMax: 180, yMin: E1min - 0.1, yMax: Emax + 0.1, yDigits: 1, xUnit: '°', title: t('c1b') });
  ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(A.x(M.TETRA), A.P.t); ctx.lineTo(A.x(M.TETRA), A.P.b); ctx.stroke(); ctx.restore();
  curve(ctx, E1.map(([a, e]) => [A.x(a), A.y(e)]), C.violet, 2);
  [...s1.hist].forEach(v => { if (v !== th) dot(ctx, A.x(v), A.y(M.fourStats(v).E), 3, C.text); });
  dot(ctx, A.x(th), A.y(st.E), 5.5, C.cyan, true);
  $('r1').textContent = t('s1readout', { t: fmt(th), a: fmt(st.across, 2), m: fmt(st.min, 2), E: st.E.toFixed(3), d: (st.E - E1min).toFixed(3) });
}

/* ---------- step 2: lone pairs and the weight λ ---------- */
const LMAX = { 3: 1, 4: 2, 5: 3, 6: 2 };
const REF = { '3:1': 'SO2', '4:1': 'NH3', '4:2': 'H2O', '5:2': 'ClF3' };
const LAMS = Array.from({ length: 21 }, (_, i) => 1 + i * 0.05);
function lamCurve(N, L) { return LAMS.map(l => [l, M.arrange(N, L, l).minBond]); }
function domItems(a, col = C.cyan) { return M.orient(a.P, a.L).map((v, i) => ({ v, kind: i < a.L ? 'lone' : 'bond', col })); }
function draw2() {
  const N = num('n2'); const lmax = LMAX[N]; $('l2').max = lmax; if (num('l2') > lmax) $('l2').value = lmax;
  const L = num('l2'), lam = num('m2'), yaw = num('y2'), a = M.arrange(N, L, lam);
  $('n2v').textContent = String(N); $('l2v').textContent = String(L); $('m2v').textContent = lam.toFixed(2); $('y2v').textContent = yaw + '°';
  const refId = REF[N + ':' + L], ref = refId ? M.MOLECULES.find(m => m.id === refId) : null, refV = ref ? Math.min(...ref.exp) : null;
  $('lg2').innerHTML = `<span class="lg"><span class="sw sw-cyan-dot"></span><span>${t('s2lgBond')}</span></span><span class="lg"><span class="sw sw-pink-dot"></span><span>${t('s2lgLone')}</span></span><span class="lg"><span class="sw sw-violet"></span><span>${t('s2lgCurve')}</span></span>` +
    (ref ? `<span class="lg"><span class="sw sw-ref"></span><span>${t('s2ref', { mol: NAME[refId], v: fmt(refV) })}</span></span>` : '');
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 18, W - 16);
  view3D(ctx, W, H, 26, domItems(a), yaw);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const cv = lamCurve(N, L), ys = cv.map(q => q[1]).concat(refV == null ? [] : [refV]);
  let lo = Math.min(...ys), hi = Math.max(...ys); if (hi - lo < 4) { const m = (hi + lo) / 2; lo = m - 2; hi = m + 2; }
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 1, xMax: 2, yMin: lo - 1.5, yMax: hi + 1.5, yDigits: 1, title: t('c2b') });
  if (ref) curve(ctx, [[A.P.l, A.y(refV)], [A.P.r, A.y(refV)]], C.orange, 1.5, [6, 5]);
  curve(ctx, cv.map(([l, v]) => [A.x(l), A.y(v)]), C.violet, 2);
  dot(ctx, A.x(lam), A.y(a.minBond), 5.5, C.cyan, true);
  const extra = [];
  if (L === 0) extra.push(t('s2noLone'));
  if (N === 5 && L > 0) extra.push(lam === 1 ? t('s2eqTie') : t('s2eq'));
  if (N === 6 && L === 2) extra.push(t('s2fail', { v: fmt(a.loneAngle) }));
  else if (L === 2) extra.push(t('s2ll', { v: fmt(a.loneAngle) }));
  if (ref && L > 0) extra.push(t('s2fit', { mol: NAME[refId], d: sgn(a.minBond - refV) }));
  $('r2').textContent = t('s2readout', { N, L, axe: axe(N - L, L), shape: t('shapeOf', { s: t('shape_' + M.shapeKey(N, L)) }), angles: angleList(a.bondAngles), extra: extra.join(' ') });
}

/* ---------- step 3: count, predict, compare ---------- */
const s3 = { id: 'NH3' };
const IDS3 = M.MOLECULES.map(m => m.id);
function buildMolButtons(boxId, ids, state, draw) {
  const box = $(boxId);
  ids.forEach(id => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.textContent = NAME[id]; b.dataset.mol = id; b.dataset.step = boxId === 'mols3' ? '3' : '4';
    b.addEventListener('click', () => { state.id = id; draw(); });
    box.appendChild(b);
  });
}
function noteFor(id, cmp) {
  if (id === 'SO2') return t('noteSO2');
  if (id === 'XeF4') return t('noteXeF4');
  if (id === 'ClF3') { const d = cmp.map(c => Math.abs(c.diff)); return t('noteClF3', { a: fmt(Math.min(...d)), b: fmt(Math.max(...d)) }); }
  return t('noteGood', { d: fmt(Math.max(0.1, ...cmp.map(c => Math.abs(c.diff)))) });
}
function buildTable() {
  const body = $('tab3').querySelector('tbody');
  IDS3.forEach(id => {
    const q = M.molecule(id), cmp = M.compare(id), worst = cmp.reduce((w, c) => (Math.abs(c.diff) > Math.abs(w.diff) ? c : w), cmp[0]);
    const tr = document.createElement('tr'); tr.dataset.mol = id;
    tr.innerHTML = `<td>${NAME[id]}</td><td>${axe(q.X, q.L)}</td><td>${cmp.map(c => fmt(c.model)).join(' / ')}</td><td>${q.exp.map(v => fmt(v)).join(' / ')}</td><td class="${Math.abs(worst.diff) > 5 ? 'bad' : ''}">${sgn(worst.diff)}</td>`;
    tr.addEventListener('click', () => { s3.id = id; draw3(); });
    body.appendChild(tr);
  });
}
function draw3() {
  const id = s3.id, q = M.molecule(id), cmp = M.compare(id), yaw = num('y3');
  $('y3v').textContent = yaw + '°';
  document.querySelectorAll('#mols3 .btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.mol === id));
  document.querySelectorAll('#tab3 tbody tr').forEach(r => r.classList.toggle('sel', r.dataset.mol === id));
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a') + ' · ' + NAME[id], 8, 18, W - 16);
  view3D(ctx, W, H, 26, domItems(q.arr), yaw);
  $('r3').textContent = t('s3readout', { mol: NAME[id], c: q.c, v: q.valence, X: q.X, x: q.x, used: q.used, left: q.left, L: q.L, N: q.N, axe: axe(q.X, q.L), shape: t('shape_' + q.shape),
    model: cmp.map(c => fmt(c.model) + '°').join(t('orSep')), exp: q.exp.map(v => fmt(v) + '°').join(t('orSep')), note: noteFor(id, cmp) });
}

/* ---------- step 4: bond dipoles add as arrows ---------- */
const OH = M.EN.O - M.EN.H; // 1.24
const s4 = { hist: new Set(), id: 'CO2' };
const IDS4 = IDS3.filter(id => id !== 'XeF4'); // the model's XeF4 shape is wrong (step 3), so it is left out here
function draw4() {
  const th = num('t4'); s4.hist.add(th);
  $('t4v').textContent = fmt(th) + '°';
  let { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 18, W - 16);
  const cx = W / 2, cy = 26 + (H - 26) * 0.42, Lb = Math.min(W * 0.36, (H - 26) * 0.5), h = th / 2 / M.DEG;
  const ends = [[cx - Lb * Math.sin(h), cy + Lb * Math.cos(h)], [cx + Lb * Math.sin(h), cy + Lb * Math.cos(h)]];
  ctx.save(); ctx.strokeStyle = '#5d7088'; ctx.lineWidth = 4; ends.forEach(([X, Y]) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X, Y); ctx.stroke(); });
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, 26, Math.PI / 2 - h, Math.PI / 2 + h); ctx.stroke(); ctx.restore();
  ends.forEach(([X, Y]) => dot(ctx, X, Y, 11, C.lig, true));
  dot(ctx, cx, cy, 15, C.core, true);
  const s = Lb * 0.42; // px per unit ΔEN
  // O–H style: the shared electrons lean to the centre, so each bond dipole points inward along its bond
  ends.forEach(([X, Y]) => { const ux = (cx - X) / Lb, uy = (cy - Y) / Lb, x0 = X + ux * 16, y0 = Y + uy * 16; arrow(ctx, x0, y0, x0 + ux * s * OH, y0 + uy * s * OH, C.cyan, 3); });
  const net = M.bentNet(OH, th);
  if (net > 1e-6) arrow(ctx, cx, cy - 18, cx, cy - 18 - s * net, C.orange, 4);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 90, xMax: 180, yMin: 0, yMax: 2, yDigits: 1, xUnit: '°', title: t('c4b') });
  const pts = []; for (let a = 90; a <= 180.001; a += 1) pts.push([A.x(a), A.y(M.bentNet(OH, a))]);
  curve(ctx, pts, C.violet, 2);
  [...s4.hist].forEach(v => { if (v !== th) dot(ctx, A.x(v), A.y(M.bentNet(OH, v)), 3, C.text); });
  dot(ctx, A.x(th), A.y(net), 5.5, C.cyan, true);
  $('r4').textContent = t('s4readoutA', { t: fmt(th), h: fmt(th / 2, 2), n: net.toFixed(2), z: net < 5e-3 ? t('s4zero') : '' });
  draw4b();
}
function draw4b() {
  const id = s4.id, q = M.molecule(id), nd = M.netDipole(id), yaw = num('y4');
  $('y4v').textContent = yaw + '°';
  document.querySelectorAll('#mols4 .btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.mol === id));
  const { ctx, W, H } = fitCanvas($('c4c'));
  title(ctx, t('c4c') + ' · ' + NAME[id], 8, 18, W - 16);
  const items = domItems(q.arr, C.lig), Q = items.map(it => it.v), net = [0, 0, 0];
  const sc = 0.42, arrows = [];
  for (let i = q.L; i < q.N; i++) {
    const u = Q[i], d = nd.bond; for (let k = 0; k < 3; k++) net[k] += d * u[k];
    const from = d > 0 ? u.map(c => c * 0.12 / sc) : u.map(c => c * 0.95 / sc), to = from.map((c, k) => c + u[k] * d);
    arrows.push({ from, to, col: C.cyan, lw: 2.6, scale: sc });
  }
  if (nd.mag > 1e-3) arrows.push({ from: [0, 0, 0], to: net, col: C.orange, lw: 4, scale: sc });
  view3D(ctx, W, H, 26, items, yaw, { arrows });
  const polar = nd.mag > 1e-3;
  $('r4b').textContent = t('s4readoutB', { mol: NAME[id], c: q.c, x: q.x, d: fmt(Math.abs(nd.bond), 2), dir: nd.bond > 0 ? t('dirOut', { x: q.x }) : t('dirIn', { c: q.c }), k: q.X, n: nd.mag.toFixed(2), verdict: t(polar ? 'polar' : 'nonpolar'), D: fmt(q.dipole, 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function dragYaw(canvasId, sliderId, draw) {
  const cv = $(canvasId); let x0 = null, v0 = 0;
  cv.addEventListener('pointerdown', e => { x0 = e.clientX; v0 = num(sliderId); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (x0 === null) return; let v = Math.round((v0 + (e.clientX - x0) * 0.8) / 5) * 5; v = ((v % 360) + 360) % 360; if (v !== num(sliderId)) { $(sliderId).value = v; draw(); } });
  const end = () => { x0 = null; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}

function setup() {
  $('n0').addEventListener('input', () => { stopAnim('s0'); const K = trace0().K; $('k0').max = K; $('k0').value = K; draw0(); });
  $('k0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('y0').addEventListener('input', draw0);
  const play = () => { $('k0').value = 0; draw0(); const K = trace0().K; animate('s0', 1500 + K * 8, p => { $('k0').value = Math.round(p * K); draw0(); }); };
  $('play0').addEventListener('click', play);
  $('reseed0').addEventListener('click', () => { s0.seed = s0.seed % 97 + 1; play(); });

  $('t1').addEventListener('input', draw1); $('y1').addEventListener('input', draw1);
  $('flat1').addEventListener('click', () => { $('t1').value = 180; draw1(); });
  $('clear1').addEventListener('click', () => { s1.hist.clear(); draw1(); });

  ['n2', 'l2', 'm2', 'y2'].forEach(id => $(id).addEventListener('input', draw2));

  buildMolButtons('mols3', IDS3, s3, draw3); buildTable();
  $('y3').addEventListener('input', draw3);

  buildMolButtons('mols4', IDS4, s4, draw4b);
  $('t4').addEventListener('input', draw4); $('y4').addEventListener('input', draw4b);
  $('clear4').addEventListener('click', () => { s4.hist.clear(); draw4(); });

  dragYaw('c0', 'y0', draw0); dragYaw('c1', 'y1', draw1); dragYaw('c2', 'y2', draw2); dragYaw('c3', 'y3', draw3); dragYaw('c4c', 'y4', draw4b);

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshShapes = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
