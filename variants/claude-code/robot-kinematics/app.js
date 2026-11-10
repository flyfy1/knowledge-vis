'use strict';
// Two-link robot arm lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every pose, curve and readout comes from window.ARM_MODEL (model.js). Canvas text is limited to panel
// titles (own row, shrunk to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ARM_MODEL;
const t = (...a) => window.ARM_I18N.t(...a);
const D = M.DEG;
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1f2c3b', axis: '#3d5068', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', band: 'rgba(103,215,249,0.10)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, trailing zeros trimmed only after a decimal point, −0 shown as 0, true minus sign.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const pow10 = e => (e === 0 ? '1' : '10' + String(e).split('').map(ch => SUP[ch]).join(''));
const sci = v => { if (v === 0) return '0'; const e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); if (e >= -2 && e <= 1) return fmt(v, 3 - Math.max(0, e)); return `${m.toFixed(1)}×${pow10(e)}`; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const maxH = Number(canvas.getAttribute('height')) || 300;
  // CSS height: the authored height, or width × aspect when that is smaller (square world views on phones).
  const height = canvas.dataset.aspect ? Math.min(maxH, Math.round(width * Number(canvas.dataset.aspect))) : maxH;
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

// Panel title in its own row; the font shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y, maxW); ctx.restore(); // last resort: squeeze rather than overflow
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Equal-aspect world view. The y range is fixed; the x range widens to fill the canvas (or the scale
// shrinks if the x range would not fit). Ticks sit left of and below the plot box.
function world(ctx, W, H, o) {
  const top = 32, bottom = H - 22, left = 34, right = W - 10;
  let s = (bottom - top) / (o.y1 - o.y0);
  if ((o.x1 - o.x0) * s > right - left) s = (right - left) / (o.x1 - o.x0);
  const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2, mx = (left + right) / 2, my = (top + bottom) / 2;
  const X = v => mx + (v - cx) * s, Y = v => my - (v - cy) * s;
  const xv0 = cx - (mx - left) / s, xv1 = cx + (right - mx) / s, yv0 = cy - (bottom - my) / s, yv1 = cy + (my - top) / s;
  const step = niceStep(1, s, 34, [0.25, 0.5, 1, 2]);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (let v = Math.ceil(xv0 / step) * step; v <= xv1 + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(v), Y(yv1)); ctx.lineTo(X(v), Y(yv0)); ctx.stroke();
    const lx = X(v); if (lx > left + 8 && lx < right - 8) { ctx.textAlign = 'center'; ctx.fillText(fmt(v), lx, bottom + 15); }
  }
  for (let v = Math.ceil(yv0 / step) * step; v <= yv1 + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(xv0), Y(v)); ctx.lineTo(X(xv1), Y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), left - 5, Y(v) + 4);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, top - 9, W - 16);
  return { X, Y, s, box: { l: left, r: right, t: top, b: bottom } };
}

// A plain plot panel (x and y scaled independently). yLog: y values are log10.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 10), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const tk of o.yTicks) {
    const v = typeof tk === 'object' ? tk.v : tk, lab = typeof tk === 'object' ? tk.label : fmt(v);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 5, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke();
      if (!o.noXLabels) ctx.fillText(fmt(v, 0), x(v), P.b + 15);
    }
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 8, W - 16);
  return { x, y, P };
}
const xTicksFor = (W, all, fine) => (W < 360 ? all : fine);

function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 2.6) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hs = Math.min(10, L * 0.45);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hs * 0.7, y1 - uy * hs * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hs - uy * hs * 0.5, y1 - uy * hs + ux * hs * 0.5); ctx.lineTo(x1 - ux * hs + uy * hs * 0.5, y1 - uy * hs - ux * hs * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Draw the arm in world view V. opts: alpha, dashed, lw
function drawArm(ctx, V, t1, t2, L = M.ARM, o = {}) {
  const p = M.fk(t1, t2, L), a = o.alpha === undefined ? 1 : o.alpha, dash = o.dashed ? [7, 5] : null, lw = o.lw || 7;
  ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = a;
  const seg = (x0, y0, x1, y1, col) => { ctx.strokeStyle = col; ctx.lineWidth = dash ? 3 : lw; if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(V.X(x0), V.Y(y0)); ctx.lineTo(V.X(x1), V.Y(y1)); ctx.stroke(); };
  seg(0, 0, p.ex, p.ey, o.c1 || C.cyan); seg(p.ex, p.ey, p.x, p.y, o.c2 || C.orange);
  ctx.setLineDash([]);
  if (!o.noJoints) { dot(ctx, V.X(0), V.Y(0), 6.5, C.text); dot(ctx, V.X(p.ex), V.Y(p.ey), 5, C.text); dot(ctx, V.X(p.x), V.Y(p.y), 6, C.green); }
  ctx.restore();
  return p;
}
function circle(ctx, V, cx, cy, r, color, dash = [5, 5], lw = 1.4) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.arc(V.X(cx), V.Y(cy), Math.max(0, r * V.s), 0, 7); ctx.stroke(); ctx.restore();
}
function ring(ctx, V, rin, rout, fill) {
  ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), rout * V.s, 0, 2 * Math.PI); ctx.closePath(); ctx.moveTo(V.X(0) + rin * V.s, V.Y(0)); ctx.arc(V.X(0), V.Y(0), rin * V.s, 0, 2 * Math.PI, true); ctx.closePath(); ctx.fill('evenodd'); ctx.restore();
}

/* ---------- shared animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

const VIEW = { x0: -1.8, x1: 1.8, y0: -1.8, y1: 1.8 };

/* ---------- step 0: forward kinematics ---------- */
const s0 = { trail: [], last: null };
function draw0() {
  const a1 = num('t1'), a2 = num('t2'), t1 = a1 * D, t2 = a2 * D;
  $('t1v').textContent = a1 + '°'; $('t2v').textContent = a2 + '°';
  const p = M.fk(t1, t2), r = M.radiusOf(t2);
  // the hand passes through every pose between the previous and the new slider values (joint angles move linearly)
  const prev = s0.last || [a1, a2], n = Math.max(1, Math.ceil(Math.max(Math.abs(a1 - prev[0]), Math.abs(a2 - prev[1]))));
  for (let i = s0.last ? 1 : 0; i <= n; i++) { const q = M.fk((prev[0] + (a1 - prev[0]) * i / n) * D, (prev[1] + (a2 - prev[1]) * i / n) * D); s0.trail.push([q.x, q.y]); }
  s0.last = [a1, a2];
  if (s0.trail.length > 3000) s0.trail.splice(0, s0.trail.length - 3000);
  const { ctx, W, H } = fitCanvas($('c0'));
  const V = world(ctx, W, H, { ...VIEW, title: t('c0') });
  circle(ctx, V, 0, 0, r, C.ghost);
  circle(ctx, V, p.ex, p.ey, M.ARM.l2, C.orange, [5, 5], 1.2);
  ctx.save(); ctx.fillStyle = C.green; ctx.globalAlpha = 0.55;
  s0.trail.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(V.X(x), V.Y(y), 2, 0, 7); ctx.fill(); }); ctx.restore();
  // angle arcs: θ1 from the x axis at the base, θ2 from link 1's extension at the elbow
  ctx.save(); ctx.lineWidth = 2;
  ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), 26, 0, -t1, t1 > 0); ctx.stroke();
  line(ctx, [[V.X(p.ex), V.Y(p.ey)], [V.X(p.ex + 0.35 * Math.cos(t1)), V.Y(p.ey + 0.35 * Math.sin(t1))]], C.ghost, 1.2, [3, 3]);
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.arc(V.X(p.ex), V.Y(p.ey), 22, -t1, -(t1 + t2), t2 > 0); ctx.stroke();
  ctx.restore();
  drawArm(ctx, V, t1, t2);
  $('r0').textContent = t('s0readout', { t1: a1, t2: a2, ex: fmt(p.ex), ey: fmt(p.ey), x: fmt(p.x), y: fmt(p.y), r: fmt(r) });
}

/* ---------- step 1: workspace from a joint-space scan ---------- */
const N1 = 48;
const s1 = { rows: N1 };
const colorFor = (r, L) => { const R = M.reach(L), u = R.rout > R.rin ? (r - R.rin) / (R.rout - R.rin) : 1; return `hsl(${265 - 220 * u},${70 + 25 * u}%,${62 - 4 * Math.sin(Math.PI * u)}%)`; };
function probe(rho, L) {
  const c = (rho * rho - L.l1 * L.l1 - L.l2 * L.l2) / (2 * L.l1 * L.l2);
  if (c > 1 + 1e-9 || c < -1 - 1e-9) return { n: 0 };
  const a = Math.acos(Math.max(-1, Math.min(1, c))) / D;
  return (a < 1e-6 || a > 180 - 1e-6) ? { n: 1, a } : { n: 2, a };
}
function draw1() {
  const L = { l1: M.ARM.l1, l2: num('l2') }, rho = num('rho'), R = M.reach(L), pr = probe(rho, L);
  $('l2v').textContent = fmt(L.l2, 1) + ' m'; $('rhov').textContent = fmt(rho) + ' m';
  // joint space
  let { ctx, W, H } = fitCanvas($('c1a'));
  const ticks = [-180, -90, 0, 90, 180];
  const A = panel(ctx, W, { top: 32, bottom: H - 24, left: 40, xMin: -180, xMax: 180, yMin: -180, yMax: 180, yTicks: ticks, xTicks: ticks, title: t('c1a') });
  const cw = (A.P.r - A.P.l) / N1, ch = (A.P.b - A.P.t) / N1;
  for (let i = 0; i < s1.rows; i++) {
    const a2 = 180 - (i + 0.5) * 360 / N1, col = colorFor(M.radiusOf(a2 * D, L), L);
    ctx.fillStyle = col; ctx.fillRect(A.P.l, A.P.t + i * ch, A.P.r - A.P.l, ch + 0.5);
  }
  ctx.save(); ctx.strokeStyle = 'rgba(13,22,33,0.35)'; ctx.lineWidth = 1;
  for (let j = 1; j < N1; j += 1) { if (j % 4) continue; ctx.beginPath(); ctx.moveTo(A.P.l + j * cw, A.P.t); ctx.lineTo(A.P.l + j * cw, A.P.t + s1.rows * ch); ctx.stroke(); }
  ctx.restore();
  if (pr.n) for (const a of pr.n === 2 ? [pr.a, -pr.a] : [pr.a]) line(ctx, [[A.P.l, A.y(a)], [A.P.r, A.y(a)]], C.text, 2.4);
  if (pr.n === 1 && pr.a > 179) line(ctx, [[A.P.l, A.y(-180)], [A.P.r, A.y(-180)]], C.text, 2.4);
  // workspace
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const V = world(ctx, W, H, { x0: -2.05, x1: 2.05, y0: -2.05, y1: 2.05, title: t('c1b') });
  for (let i = 0; i < s1.rows; i++) {
    const a2 = 180 - (i + 0.5) * 360 / N1, col = colorFor(M.radiusOf(a2 * D, L), L);
    ctx.fillStyle = col;
    for (let j = 0; j < N1; j++) { const a1 = -180 + (j + 0.5) * 360 / N1, p = M.fk(a1 * D, a2 * D, L); ctx.beginPath(); ctx.arc(V.X(p.x), V.Y(p.y), 1.9, 0, 7); ctx.fill(); }
  }
  circle(ctx, V, 0, 0, R.rout, C.ghost, [3, 4], 1); if (R.rin > 0) circle(ctx, V, 0, 0, R.rin, C.ghost, [3, 4], 1);
  if (pr.n) circle(ctx, V, 0, 0, rho, C.text, null, 2.2);
  dot(ctx, V.X(0), V.Y(0), 4, C.text);
  const prog = s1.rows < N1 ? t('s1progress', { c: s1.rows, N: N1 }) : '';
  const sol = pr.n === 2 ? t('s1sol2', { a: fmt(pr.a, 1) }) : pr.n === 1 ? t('s1sol1', { a: fmt(pr.a, 0) }) : t('s1sol0');
  $('r1').textContent = t('s1readout', { prog, l2: fmt(L.l2, 1), rin: fmt(R.rin, 1), rout: fmt(R.rout, 1), rho: fmt(rho), sol });
}

/* ---------- step 2: inverse kinematics ---------- */
function draw2() {
  const x = num('tx'), y = num('ty'), sol = M.ik(x, y), R = M.reach();
  $('txv').textContent = fmt(x) + ' m'; $('tyv').textContent = fmt(y) + ' m';
  const { ctx, W, H } = fitCanvas($('c2'));
  const V = world(ctx, W, H, { ...VIEW, title: t('c2') });
  s2.view = V;
  ring(ctx, V, R.rin, R.rout, C.band);
  circle(ctx, V, 0, 0, R.rout, C.ghost, [3, 4], 1); circle(ctx, V, 0, 0, R.rin, C.ghost, [3, 4], 1);
  line(ctx, [[V.X(0), V.Y(0)], [V.X(x), V.Y(y)]], C.ghost, 1, [2, 4]);
  if (sol.reachable) {
    drawArm(ctx, V, sol.sols[1].t1, sol.sols[1].t2, M.ARM, { dashed: true, noJoints: true, alpha: 0.9 });
    const pB = M.fk(sol.sols[1].t1, sol.sols[1].t2); dot(ctx, V.X(pB.ex), V.Y(pB.ey), 4, C.ghost);
    drawArm(ctx, V, sol.sols[0].t1, sol.sols[0].t2);
  } else {
    // show the arm stretched (or folded) toward the target to make the miss visible
    const ang = Math.atan2(y, x), far = Math.hypot(x, y) > R.rout;
    drawArm(ctx, V, ang, far ? 0 : Math.PI, M.ARM, { alpha: 0.45 });
  }
  dot(ctx, V.X(x), V.Y(y), 11, C.pink, true);
  const r = Math.hypot(x, y);
  if (!sol.reachable) { $('r2').textContent = t('s2none', { x: fmt(x), y: fmt(y), r: fmt(r), c: fmt(sol.c2, 3), why: t(r > R.rout ? 's2far' : 's2near') }); return; }
  const err = Math.max(...sol.sols.map(q => { const p = M.fk(q.t1, q.t2); return Math.hypot(p.x - x, p.y - y); }));
  const same = Math.abs(sol.sols[0].t2 - sol.sols[1].t2) < 1e-6 || Math.abs(Math.abs(sol.c2) - 1) < 1e-9;
  $('r2').textContent = t('s2readout', { x: fmt(x), y: fmt(y), r: fmt(r, 3), c: fmt(sol.c2, 3), a1: fmt(sol.sols[0].t1 / D, 1), a2: fmt(sol.sols[0].t2 / D, 1), b1: fmt(sol.sols[1].t1 / D, 1), b2: fmt(sol.sols[1].t2 / D, 1), err: sci(Math.max(err, 1e-16)), note: same ? t('s2same') : '' });
}
const s2 = { view: null, drag: false };
function setupDrag2() {
  const cv = $('c2');
  const toWorld = e => { const b = cv.getBoundingClientRect(), V = s2.view; return [(e.clientX - b.left - V.X(0)) / V.s, -(e.clientY - b.top - V.Y(0)) / V.s]; };
  const setT = ([x, y]) => { const q = v => Math.max(-1.8, Math.min(1.8, Math.round(v / 0.02) * 0.02)); $('tx').value = q(x); $('ty').value = q(y); draw2(); };
  cv.addEventListener('pointerdown', e => {
    if (!s2.view) return; const [x, y] = toWorld(e), tx = num('tx'), ty = num('ty');
    if (Math.hypot(x - tx, y - ty) * s2.view.s > 34) return; // grab only near the target ring
    s2.drag = true; cv.setPointerCapture(e.pointerId); e.preventDefault();
  });
  cv.addEventListener('pointermove', e => { if (s2.drag) setT(toWorld(e)); });
  const end = () => { s2.drag = false; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}

/* ---------- step 3: Jacobian ---------- */
function draw3() {
  const a1 = num('t13'), a2 = num('t23'), w1 = num('w1'), w2 = num('w2'), dt = num('dt');
  $('t13v').textContent = a1 + '°'; $('t23v').textContent = a2 + '°'; $('w1v').textContent = fmt(w1, 1); $('w2v').textContent = fmt(w2, 1); $('dtv').textContent = fmt(dt) + ' s';
  const t1 = a1 * D, t2 = a2 * D, J = M.jac(t1, t2), v = M.mulv(J, [w1, w2]), p = M.fk(t1, t2);
  const { ctx, W, H } = fitCanvas($('c3'));
  const V = world(ctx, W, H, { ...VIEW, title: t('c3') });
  const path = M.sweepPath(t1, t2, w1, w2, dt, 48);
  // ghost of the arm at the end of Δt
  const pe = M.fk(t1 + w1 * dt, t2 + w2 * dt);
  drawArm(ctx, V, t1 + w1 * dt, t2 + w2 * dt, M.ARM, { alpha: 0.16, noJoints: true, lw: 5, c1: C.text, c2: C.text });
  line(ctx, [[V.X(0), V.Y(0)], [V.X(p.x), V.Y(p.y)]], C.ghost, 1, [2, 4]);
  drawArm(ctx, V, t1, t2);
  line(ctx, path.map(([x, y]) => [V.X(x), V.Y(y)]), C.green, 2.2, [6, 4]);
  dot(ctx, V.X(pe.x), V.Y(pe.y), 5, C.green);
  const X0 = V.X(p.x), Y0 = V.Y(p.y);
  // arrows: velocities drawn as the distance covered in 1 s; ring: straight-line prediction after Δt
  const c1 = [J[0][0] * w1, J[1][0] * w1], c2 = [J[0][1] * w2, J[1][1] * w2];
  line(ctx, [[X0 + c1[0] * V.s, Y0 - c1[1] * V.s], [X0 + v[0] * V.s, Y0 - v[1] * V.s], [X0 + c2[0] * V.s, Y0 - c2[1] * V.s]], C.ghost, 1, [3, 3]);
  arrow(ctx, X0, Y0, X0 + c1[0] * V.s, Y0 - c1[1] * V.s, C.cyan, 2.4);
  arrow(ctx, X0, Y0, X0 + c2[0] * V.s, Y0 - c2[1] * V.s, C.orange, 2.4);
  arrow(ctx, X0, Y0, X0 + v[0] * V.s, Y0 - v[1] * V.s, C.text, 2.8);
  dot(ctx, X0 + v[0] * dt * V.s, Y0 - v[1] * dt * V.s, 6, C.text, true);
  const gap = Math.hypot(pe.x - p.x - v[0] * dt, pe.y - p.y - v[1] * dt);
  const f2 = q => (Math.abs(q) < 0.005 ? 0 : q).toFixed(2).replace('-', '−');
  $('r3').textContent = t('s3readout', { a: f2(J[0][0]), b: f2(J[0][1]), c: f2(J[1][0]), d: f2(J[1][1]), w1: fmt(w1, 1), w2: fmt(w2, 1), vx: fmt(v[0]), vy: fmt(v[1]), sp: fmt(Math.hypot(v[0], v[1])), dt: fmt(dt), gap: fmt(gap, 4) });
}

/* ---------- step 4: singularities ---------- */
const T1_4 = 30 * D, VR = 0.2, ELL = 0.3; // fixed θ1, requested radial speed (m/s), ellipse drawing scale (m per m/s)
const s4 = { seen: new Set([90]) };
const radialSpeed = a2 => { const t2 = a2 * D, u = M.radialDir(T1_4, t2); return M.jointSpeedFor(T1_4, t2, [VR * u[0], VR * u[1]]); };
const isSingular = a2 => Math.abs(Math.sin(a2 * D)) < 1e-9;
function draw4() {
  const a2 = num('t24'), t2 = a2 * D, J = M.jac(T1_4, t2), sv = M.svd2(J), p = M.fk(T1_4, t2);
  $('t24v').textContent = a2 + '°';
  let { ctx, W, H } = fitCanvas($('c4a'));
  const V = world(ctx, W, H, { x0: -1.2, x1: 2.0, y0: -0.9, y1: 1.7, title: t('c4a') });
  line(ctx, [[V.X(-p.x * 0.4), V.Y(-p.y * 0.4)], [V.X(p.x * 1.6), V.Y(p.y * 1.6)]], C.ghost, 1, [2, 4]);
  drawArm(ctx, V, T1_4, t2);
  // ellipse = { J ω : |ω| = 1 } scaled by ELL
  const pts = [];
  for (let i = 0; i <= 96; i++) { const a = 2 * Math.PI * i / 96, v = M.mulv(J, [Math.cos(a), Math.sin(a)]); pts.push([V.X(p.x + ELL * v[0]), V.Y(p.y + ELL * v[1])]); }
  ctx.save(); ctx.fillStyle = 'rgba(183,156,255,0.18)'; ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fill(); ctx.restore();
  line(ctx, pts, C.violet, 2.2);
  const ax = [Math.cos(sv.ang), Math.sin(sv.ang)], bx = [-ax[1], ax[0]];
  line(ctx, [[V.X(p.x - ELL * sv.s1 * ax[0]), V.Y(p.y - ELL * sv.s1 * ax[1])], [V.X(p.x + ELL * sv.s1 * ax[0]), V.Y(p.y + ELL * sv.s1 * ax[1])]], C.cyan, 2);
  line(ctx, [[V.X(p.x - ELL * sv.s2 * bx[0]), V.Y(p.y - ELL * sv.s2 * bx[1])], [V.X(p.x + ELL * sv.s2 * bx[0]), V.Y(p.y + ELL * sv.s2 * bx[1])]], C.orange, 2.6);
  dot(ctx, V.X(p.x), V.Y(p.y), 5, C.green);

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const xt = W < 360 ? [-180, 0, 180] : [-180, -90, 0, 90, 180];
  const mid = Math.round(H * 0.47);
  const A = panel(ctx, W, { top: 32, bottom: mid - 22, left: 42, xMin: -180, xMax: 180, yMin: 0, yMax: 1.8, yTicks: [0, 0.9, 1.8], xTicks: xt, title: t('c4b') });
  const s1p = [], s2p = [], wp = [];
  for (let a = -180; a <= 180; a += 1) { const q = M.svd2(M.jac(T1_4, a * D)); s1p.push([A.x(a), A.y(q.s1)]); s2p.push([A.x(a), A.y(q.s2)]); }
  line(ctx, s1p, C.cyan, 2); line(ctx, s2p, C.orange, 2);
  const B = panel(ctx, W, { top: mid + 26, bottom: H - 22, left: 42, xMin: -180, xMax: 180, yMin: -1, yMax: 2, yTicks: [{ v: -1, label: '0.1' }, { v: 0, label: '1' }, { v: 1, label: '10' }, { v: 2, label: '100' }], xTicks: xt, title: t('c4c') });
  const lw = a => { const w = radialSpeed(a); return w ? Math.log10(Math.hypot(w[0], w[1])) : Infinity; };
  ctx.save(); ctx.beginPath(); ctx.rect(B.P.l, B.P.t, B.P.r - B.P.l, B.P.b - B.P.t); ctx.clip();
  let seg = [];
  for (let a = -180; a <= 180; a += 0.5) { const v = lw(a); if (!isFinite(v) || v > 2.3) { if (seg.length) line(ctx, seg, C.pink, 2); seg = []; continue; } seg.push([B.x(a), B.y(v)]); }
  if (seg.length) line(ctx, seg, C.pink, 2);
  ctx.restore();
  // visited θ2 values and the current one
  [...s4.seen].forEach(a => { if (a === a2) return; const q = M.svd2(M.jac(T1_4, a * D)); dot(ctx, A.x(a), A.y(q.s2), 3, C.text); const v = lw(a); if (isFinite(v) && v <= 2) dot(ctx, B.x(a), B.y(v), 3, C.text); });
  line(ctx, [[A.x(a2), A.P.t], [A.x(a2), B.P.b]], C.text, 1, [3, 3], 0.5);
  dot(ctx, A.x(a2), A.y(sv.s1), 5, C.cyan); dot(ctx, A.x(a2), A.y(sv.s2), 5, C.orange);
  const wv = radialSpeed(a2), lv = lw(a2);
  if (isFinite(lv) && lv <= 2) dot(ctx, B.x(a2), B.y(lv), 5, C.pink);
  if (isSingular(a2) || !wv) { $('r4').textContent = t('s4sing', { t2: a2, s1: fmt(sv.s1, 3) }); return; }
  $('r4').textContent = t('s4readout', { t2: a2, s1: fmt(sv.s1, 3), s2: fmt(sv.s2, 3), det: fmt(M.det(J), 3), w1: fmt(wv[0]), w2: fmt(wv[1]), w: fmt(Math.hypot(wv[0], wv[1])) });
}
function hint4() { const w = a => { const q = radialSpeed(a); return fmt(Math.hypot(q[0], q[1]), 1); }; $('h4').textContent = t('s4hint', { w10: w(10), w2: w(2) }); }

/* ---------- step 5: iterative IK ---------- */
const GUESS = [0, 30 * D], K5 = 15;
const s5 = { hist: null, k: 0 };
function recompute5() { stopAnim('s5'); s5.hist = M.ikRun(GUESS, [num('tx5'), num('ty5')], num('lam'), K5); s5.k = 0; }
function draw5() {
  const tx = num('tx5'), ty = num('ty5'), lam = num('lam');
  $('tx5v').textContent = fmt(tx) + ' m'; $('ty5v').textContent = fmt(ty) + ' m'; $('lamv').textContent = fmt(lam) + ' m';
  const h = s5.hist, k = s5.k, R = M.reach();
  let { ctx, W, H } = fitCanvas($('c5a'));
  const V = world(ctx, W, H, { x0: -1.85, x1: 1.85, y0: -1.85, y1: 1.85, title: t('c5a') });
  ring(ctx, V, R.rin, R.rout, C.band);
  for (let i = 0; i < k; i++) drawArm(ctx, V, h[i].t1, h[i].t2, M.ARM, { alpha: 0.12 + 0.3 * (i + 1) / (k + 1), noJoints: true, lw: 4, c1: C.text, c2: C.text });
  ctx.save(); ctx.fillStyle = C.green; for (let i = 0; i <= k; i++) { ctx.globalAlpha = 0.35 + 0.65 * (i + 1) / (k + 1); ctx.beginPath(); ctx.arc(V.X(h[i].x), V.Y(h[i].y), 2.6, 0, 7); ctx.fill(); } ctx.restore();
  drawArm(ctx, V, h[k].t1, h[k].t2);
  dot(ctx, V.X(tx), V.Y(ty), 11, C.pink, true);

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const xt = W < 360 ? [0, 5, 10, 15] : [0, 3, 6, 9, 12, 15];
  const yt = [1, -2, -5, -8, -11].map(e => ({ v: e, label: pow10(e) }));
  const B = panel(ctx, W, { top: 32, bottom: H - 22, left: 46, xMin: -0.5, xMax: K5 + 0.5, yMin: -12.5, yMax: 1.5, yTicks: yt, xTicks: xt, title: t('c5b') });
  const ly = v => B.y(Math.max(-12.3, Math.log10(Math.max(v, 1e-300))));
  line(ctx, h.slice(0, k + 1).map((q, i) => [B.x(i), ly(q.err)]), C.green, 1.6, null, 0.7);
  for (let i = 0; i <= k; i++) dot(ctx, B.x(i), ly(h[i].err), i === k ? 5.5 : 3.6, i === k ? C.text : C.green);
  const r = Math.hypot(tx, ty), out = r > R.rout || r < R.rin, k0 = M.firstBelow(h, 1e-6);
  const note = out ? t('s5out', { r: fmt(r, 3), gap: fmt(r > R.rout ? r - R.rout : R.rin - r, 3) }) : (k0 >= 0 && k0 <= k ? t('s5conv', { k0 }) : '');
  $('r5').textContent = t('s5readout', { it: k === 0 ? t('s5it0') : t('s5itk', { k, N: K5 }), x: fmt(h[k].x, 3), y: fmt(h[k].y, 3), err: sci(h[k].err), t1: fmt(M.wrap(h[k].t1) / D, 1), t2: fmt(M.wrap(h[k].t2) / D, 1), note });
  $('step5b').disabled = k >= K5;
}
function hint5() {
  const a = M.ikRun(GUESS, [0.9, 0.9], 0, K5), b = M.ikRun(GUESS, [1.5, 1.0], 0.3, K5);
  $('h5').textContent = t('s5hint', { e5: sci(a[5].err), e6: sci(a[6].err), e7: sci(a[7].err), gapOut: b[K5].err.toFixed(2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); hint4(); hint5(); }

function setup() {
  ['t1', 't2'].forEach(id => $(id).addEventListener('input', draw0));
  $('clear0').addEventListener('click', () => { s0.trail = []; s0.last = null; draw0(); });

  ['l2', 'rho'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); s1.rows = N1; draw1(); }));
  $('scan1').addEventListener('click', () => { s1.rows = 0; draw1(); animate('s1', 3200, p => { s1.rows = Math.round(p * N1); draw1(); }); });

  ['tx', 'ty'].forEach(id => $(id).addEventListener('input', draw2));
  setupDrag2();
  ['t13', 't23', 'w1', 'w2', 'dt'].forEach(id => $(id).addEventListener('input', draw3));

  $('t24').addEventListener('input', () => { stopAnim('s4'); s4.seen.add(num('t24')); draw4(); });
  $('sweep4').addEventListener('click', () => {
    animate('s4', 4200, p => { const a = Math.round(90 - 89 * p); for (let q = 90; q >= a; q--) s4.seen.add(q); $('t24').value = a; draw4(); });
  });

  ['tx5', 'ty5', 'lam'].forEach(id => $(id).addEventListener('input', () => { recompute5(); draw5(); }));
  $('preIn').addEventListener('click', () => { $('tx5').value = 0.9; $('ty5').value = 0.9; recompute5(); draw5(); });
  $('preOut').addEventListener('click', () => { $('tx5').value = 1.5; $('ty5').value = 1.0; recompute5(); draw5(); });
  $('step5b').addEventListener('click', () => { stopAnim('s5'); s5.k = Math.min(K5, s5.k + 1); draw5(); });
  $('reset5').addEventListener('click', () => { stopAnim('s5'); s5.k = 0; draw5(); });
  $('run5').addEventListener('click', () => {
    if (s5.k >= K5) s5.k = 0;
    const from = s5.k;
    animate('s5', (K5 - from) * 380, p => { s5.k = from + Math.round(p * (K5 - from)); draw5(); });
  });
  recompute5();

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
  window.refreshArm = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
