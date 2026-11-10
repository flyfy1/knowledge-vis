'use strict';
// Gravity and orbits lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every path, chart and readout comes from window.ORBIT_MODEL (model.js). Canvas text is limited to panel
// titles and axis ticks in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ORBIT_MODEL;
const t = (...a) => window.ORBIT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', star: '#ffd27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', earth: '#2f6fa8' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point; −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// Significant figures without exponent notation for 0.001 ≤ |v| < 10000, else a × 10ⁿ.
function sig(v, n = 3) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e4) { const d = Math.max(0, n - 1 - Math.floor(Math.log10(a))); return fmt(v, d); }
  let e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(n - 1))) >= 10) { e += 1; m /= 10; }
  return fmt(m, n - 1) + '×10' + String(e).split('').map(ch => SUP[ch]).join('');
}

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  let height = Number(canvas.dataset.h);
  // square top views: no taller than the width needs (narrow screens would otherwise leave a blank band)
  if (canvas.dataset.square) { height = Math.min(height, Math.round(width) + 44); canvas.style.height = height + 'px'; }
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height, dpr };
}

// Panel title: shrinks the font until it fits (never overflows, never squeezes glyphs).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, target) {
  const raw = span / Math.max(1, target), p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}
function ticks(lo, hi, target) { const s = niceStep(hi - lo, target), out = []; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9 * s; v += s) out.push(Math.abs(v) < 1e-12 ? 0 : v); return out; }
const tickLabel = v => { const a = Math.abs(v); if (a === 0) return '0'; if (a >= 1e4) return sig(v, 2); return fmt(v, a >= 10 ? 0 : a >= 1 ? 1 : 2); };

// A plot panel: title in its own row above; y ticks left; x ticks below.
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yT = o.yTicks || ticks(o.yMin, o.yMax, 4);
  const yL = o.yLabel || tickLabel, xL = o.xLabel || tickLabel;
  const left = o.left || Math.max(30, ...yT.map(v => ctx.measureText(yL(v)).width + 12));
  ctx.restore();
  const P = { l: left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of yT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yL(v), P.l - 6, y(v) + 4);
  }
  const xT = o.xTicks || ticks(o.xMin, o.xMax, Math.max(2, Math.floor((P.r - P.l) / 46)));
  ctx.textAlign = 'center';
  for (const v of xT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(xL(v), x(v), P.b + 15);
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
// A square top view centred on the Earth: ±ext in Earth radii, ticks at whole radii along the bottom.
function skyView(ctx, W, H, ext, ttl, yOff = 0) {
  const top = 26, bottom = H - 24, size = Math.min(W - 24, bottom - top), cx = W / 2, cy = top + size / 2, s = size / (2 * ext);
  const P = { l: cx - size / 2, r: cx + size / 2, t: top, b: top + size };
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(P.l, P.t, size, size);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const st = ext > 8 ? 4 : ext > 4 ? 2 : 1;
  for (let v = -Math.floor(ext / st) * st; v <= ext; v += st) { const X = cx + v * s; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke(); ctx.fillText(String(v).replace('-', '−'), X, P.b + 15); }
  ctx.restore();
  title(ctx, ttl, 8, top - 9, W - 16);
  return { X: v => cx + v * s, Y: v => cy - (v - yOff) * s, s, P, cx, cy };
}
function disc(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }

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

const R = M.R, km = m => m / 1e3;
function earth(ctx, V) { ctx.save(); const g = ctx.createRadialGradient(V.X(-0.3), V.Y(0.3), 0, V.X(0), V.Y(0), V.s); g.addColorStop(0, '#4f93cf'); g.addColorStop(1, '#1d4a74'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), V.s, 0, 7); ctx.fill(); ctx.restore(); }
function polyline(ctx, V, pts, n, color, lw, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i < Math.min(n, pts.length); i++) { const X = V.X(pts[i].x / R), Y = V.Y(pts[i].y / R); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
const periodText = s => s < 7200 ? t('hMin', { m: fmt(s / 60, 1) }) : s < 172800 ? t('hHour', { h: fmt(s / 3600, 2) }) : t('hDay', { d: fmt(s / 86400, 2) });
const pow10Label = v => { const e = Math.round(v); if (Math.abs(v - e) > 1e-6) return fmt(Math.pow(10, v), 0); return e <= 3 ? String(Math.pow(10, e)) : '10' + String(e).split('').map(ch => SUP[ch]).join(''); };

/* ---------- step 0: inverse square and the Moon test ---------- */
function draw0() {
  const r = num('r0'), g = M.gAt(r);
  $('r0v').textContent = fmt(r, 1);
  const { ctx, W, H } = fitCanvas($('c0'));
  const lg = v => Math.log10(v);
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 64, yMin: -3.4, yMax: 1.3, yTicks: [-3, -2, -1, 0, 1], yLabel: v => fmt(Math.pow(10, v), 3), title: t('c0a') });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= 400; i++) { const rr = 1 + 63 * i / 400, Y = P.y(lg(M.gAt(rr))); if (!i) ctx.moveTo(P.x(rr), Y); else ctx.lineTo(P.x(rr), Y); }
  ctx.stroke(); ctx.restore();
  // the Moon's measured centripetal acceleration
  const mr = M.MOON.a / R, ma = M.moonAccel(), X = P.x(mr), Y = P.y(lg(ma)), rr = 7;
  ctx.save(); ctx.strokeStyle = C.star; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X - rr - 3, Y); ctx.lineTo(X + rr + 3, Y); ctx.moveTo(X, Y - rr - 3); ctx.lineTo(X, Y + rr + 3); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(P.x(r), P.P.t); ctx.lineTo(P.x(r), P.P.b); ctx.stroke(); ctx.restore();
  disc(ctx, P.x(r), P.y(lg(g)), 5.5, C.orange);
  let txt = t('s0readout', { r: fmt(r, 1), alt: Math.round((r - 1) * R / 1e3), g: sig(g, 3), r2: sig(r * r, 4), pct: sig(100 / (r * r), 3) });
  if (Math.abs(r - mr) < 0.06) txt += ' ' + t('s0moon', { g: fmt(M.gAt(mr), 5), a: fmt(ma, 5), d: fmt(Math.abs(ma / M.gAt(mr) - 1) * 100, 1) });
  $('rd0').textContent = txt;
}

/* ---------- step 1: Newton's cannon ---------- */
const R0 = R + M.TOWER;
const s1 = { v: 5000, run: null, shown: 0, old: [], fired: false };
function keep1() { if (s1.run && s1.fired && !s1.old.some(o => o.v === s1.run.v)) { s1.old.push(s1.run); if (s1.old.length > 6) s1.old.shift(); } s1.fired = false; }
function launch1() { s1.run = M.fly(R0, s1.v, { rMax: M.FRAME1 }); return s1.run; }
function view1(run) {
  const paths = [run, ...s1.old];
  let ext = 1.25 * R0 / R;
  if (run.outcome === 'escape') ext = M.FRAME1 / R * 1.04;
  else ext = Math.max(ext, run.rmax / R * 1.1);
  return { ext, paths };
}
function draw1() {
  const run = s1.run || launch1(), vk = s1.v / 1e3;
  $('v1v').textContent = fmt(vk, 3);
  const { ctx, W, H } = fitCanvas($('c1'));
  const { ext } = view1(run);
  const V = skyView(ctx, W, H, ext, t('c1a') + t('unitR'));
  ctx.save(); ctx.beginPath(); ctx.rect(V.P.l, V.P.t, V.P.r - V.P.l, V.P.b - V.P.t); ctx.clip();
  earth(ctx, V);
  s1.old.forEach(o => polyline(ctx, V, o.pts, o.pts.length, C.raw, 1.6, 0.9));
  const n = Math.max(2, Math.round(s1.shown * run.pts.length));
  polyline(ctx, V, run.pts, n, C.orange, 2.6);
  const tip = run.pts[Math.min(run.pts.length, n) - 1];
  disc(ctx, V.X(tip.x / R), V.Y(tip.y / R), 4.5, C.orange);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(V.X(0), V.Y(1)); ctx.lineTo(V.X(0), V.Y(R0 / R)); ctx.stroke(); ctx.restore();
  disc(ctx, V.X(0), V.Y(R0 / R), 4, C.text);
  const v = s1.v, ha = run.rmax - R, hp = run.rmin - R, prog = s1.shown < 1 ? t('s1prog', { c: n - 1, N: run.pts.length - 1 }) : '';
  let txt;
  if (run.outcome === 'ground') txt = t('s1ground', { v: fmt(vk, 3), min: fmt(run.tEnd / 60, 1), km: Math.round(run.groundKm) });
  else if (run.outcome === 'escape' && v < M.vEsc(R0)) { const ra = M.otherTurn(R0, v); txt = t('s1far', { v: fmt(vk, 3), ve: fmt(M.vEsc(R0) / 1e3, 2), ha: Math.round(km(ra - R)), h: fmt(M.periodOf((R0 + ra) / 2) / 3600, 1) }); }
  else if (run.outcome === 'escape') txt = t('s1esc', { v: fmt(vk, 3), ve: fmt(M.vEsc(R0) / 1e3, 2), rk: Math.round(km(M.FRAME1)), vend: fmt(run.vEnd / 1e3, 2) });
  else if (Math.abs(v - M.vCirc(R0)) < 1) txt = t('s1circ', { v: fmt(vk, 3), ha: Math.round(km(ha)), min: fmt(run.T / 60, 1) });
  else txt = t(v < M.vCirc(R0) ? 's1ellA' : 's1ellP', { v: fmt(vk, 3), ha: Math.round(km(ha)), hp: Math.round(km(hp)), min: fmt(run.T / 60, 1) });
  $('rd1').textContent = txt + (prog ? ' ' + prog : '');
}
function fire1() {
  keep1(); launch1(); s1.shown = 0; s1.fired = true;
  animate('s1', 2600, p => { s1.shown = p; draw1(); });
}

/* ---------- step 2: straight up ---------- */
function draw2() {
  const vk = num('v2'), v = vk * 1e3, E = v * v / 2 - M.GM / R, top = M.riseTrue(v), flat = M.riseFlat(v);
  $('v2v').textContent = fmt(vk, 2);
  let { ctx, W, H } = fitCanvas($('c2'));
  const MJ = 1e6, A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: 8, yMin: -66, yMax: 10, yTicks: [-60, -40, -20, 0], xTicks: [1, 2, 4, 6, 8], title: t('c2a') });
  ctx.save(); ctx.beginPath(); ctx.rect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t); ctx.clip();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const rr = 1 + 7 * i / 200, Y = A.y(M.U(rr * R) / MJ); if (!i) ctx.moveTo(A.x(rr), Y); else ctx.lineTo(A.x(rr), Y); }
  ctx.stroke();
  ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.x(1), A.y(M.Uflat(R) / MJ)); ctx.lineTo(A.x(8), A.y(M.Uflat(8 * R) / MJ)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(1), A.y(E / MJ)); ctx.lineTo(A.P.r, A.y(E / MJ)); ctx.stroke();
  ctx.restore();
  if (v > 0) {
    if (isFinite(top) && (R + top) / R <= 8) disc(ctx, A.x((R + top) / R), A.y(E / MJ), 5.5, C.green);
    if ((R + flat) / R <= 8) disc(ctx, A.x((R + flat) / R), A.y(E / MJ), 5, C.violet);
  }
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 12, yMin: 0, yMax: 40, yTicks: [0, 10, 20, 30, 40], xTicks: [0, 3, 6, 9, 12], title: t('c2b') });
  const ve = M.vEsc(R) / 1e3;
  ctx.save(); ctx.beginPath(); ctx.rect(B.P.l, B.P.t, B.P.r - B.P.l, B.P.b - B.P.t); ctx.clip();
  ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.x(ve), B.P.t); ctx.lineTo(B.x(ve), B.P.b); ctx.stroke(); ctx.setLineDash([]);
  const curve = (f, color, lim) => { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath(); let first = true; for (let i = 0; i <= 400; i++) { const q = lim * i / 400, h = f(q * 1e3) / 1e6; if (!isFinite(h) || h > 45) break; if (first) { ctx.moveTo(B.x(q), B.y(h)); first = false; } else ctx.lineTo(B.x(q), B.y(h)); } ctx.stroke(); };
  curve(M.riseTrue, C.green, 12); curve(M.riseFlat, C.violet, 12);
  ctx.restore();
  if (isFinite(top) && top / 1e6 <= 40) disc(ctx, B.x(vk), B.y(top / 1e6), 5.5, C.green);
  else { ctx.save(); ctx.fillStyle = C.green; const X = B.x(Math.min(12, vk)); ctx.beginPath(); ctx.moveTo(X, B.P.t + 1); ctx.lineTo(X - 7, B.P.t + 13); ctx.lineTo(X + 7, B.P.t + 13); ctx.closePath(); ctx.fill(); ctx.restore(); }
  disc(ctx, B.x(vk), B.y(flat / 1e6), 5, C.violet);
  $('rd2').textContent = E >= 0 ? t('s2esc', { v: fmt(vk, 2), E: fmt(E / MJ, 2), ve: fmt(ve, 2), hf: Math.round(flat / 1e3) })
    : t('s2readout', { v: fmt(vk, 2), E: fmt(E / MJ, 2), h: Math.round(top / 1e3), hf: Math.round(flat / 1e3), k: v > 0 ? fmt(top / flat, 2) : '1' });
}

/* ---------- step 3: equal areas ---------- */
const s3 = { w: null, v: null, p: 1 };
function wedges3() { const v = num('v3') * 1e3; if (s3.v !== v) { s3.w = M.wedges(R0, v); s3.v = v; } return s3.w; }
function posAt(pts, tt) { // linear interpolation along the sampled path
  let i = 1; while (i < pts.length - 1 && pts[i].t < tt) i++;
  const a = pts[i - 1], b = pts[i], f = b.t === a.t ? 0 : Math.max(0, Math.min(1, (tt - a.t) / (b.t - a.t)));
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
function draw3() {
  const w = wedges3(), pts = w.fly.pts, T = w.T, tNow = s3.p * T;
  $('v3v').textContent = fmt(num('v3'), 2);
  let { ctx, W, H } = fitCanvas($('c3'));
  const ext = (w.ra + w.rp) / 2 / R * 1.08, V = skyView(ctx, W, H, ext, t('c3a') + t('unitR'), -(w.ra - w.rp) / 2 / R);
  earth(ctx, V);
  const done = Math.floor(s3.p * 12 + 1e-9);
  for (let k = 0; k < 12; k++) {
    const t0 = k * T / 12, t1 = Math.min(tNow, (k + 1) * T / 12);
    if (t1 <= t0) break;
    ctx.save(); ctx.fillStyle = k % 2 ? 'rgba(183,156,255,0.45)' : 'rgba(103,215,249,0.45)'; ctx.strokeStyle = C.bg; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(V.X(0), V.Y(0));
    const a = posAt(pts, t0); ctx.lineTo(V.X(a.x / R), V.Y(a.y / R));
    for (const q of pts) if (q.t > t0 && q.t < t1) ctx.lineTo(V.X(q.x / R), V.Y(q.y / R));
    const b = posAt(pts, t1); ctx.lineTo(V.X(b.x / R), V.Y(b.y / R)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  polyline(ctx, V, pts, pts.length, C.ghost, 1.2, 0.8);
  earth(ctx, V);
  const sat = posAt(pts, tNow); disc(ctx, V.X(sat.x / R), V.Y(sat.y / R), 5, C.text);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const yMax = Math.max(2, Math.ceil(Math.max(...w.lens) / w.meanL * 2) / 2);
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 12, yMin: 0, yMax, yTicks: ticks(0, yMax, 3), xTicks: [], title: t('c3b') });
  const bw = (B.x(1) - B.x(0)) * 0.34;
  for (let k = 0; k < Math.min(12, done); k++) {
    const xc = B.x(k + 0.5);
    ctx.fillStyle = C.cyan; ctx.fillRect(xc - bw - 1, B.y(w.areas[k] / w.mean), bw, B.y(0) - B.y(w.areas[k] / w.mean));
    ctx.fillStyle = C.orange; ctx.fillRect(xc + 1, B.y(w.lens[k] / w.meanL), bw, B.y(0) - B.y(w.lens[k] / w.meanL));
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.P.l, B.y(1)); ctx.lineTo(B.P.r, B.y(1)); ctx.stroke(); ctx.restore();
  $('rd3').textContent = t('s3readout', { v: fmt(num('v3'), 2), rp: Math.round(km(w.rp)), ra: Math.round(km(w.ra)), T: fmt(T / 3600, 2), spread: fmt(w.spread * 100, 3), lr: fmt(w.lenRatio, 2), vr: fmt(w.vp / w.va, 3), rr: fmt(w.ra / w.rp, 3), prog: done < 12 ? t('s3prog', { c: done }) : '' });
}

/* ---------- step 4: T² ∝ a³ from simulated orbits ---------- */
const s4 = { list: [], last: null };
function draw4() {
  const h = num('h4'), q = num('q4');
  $('h4v').textContent = String(h); $('q4v').textContent = fmt(q, 2);
  let { ctx, W, H } = fitCanvas($('c4'));
  const ok = s4.list.filter(m => m.ok);
  const ext = Math.max(2, ...ok.map(m => m.f.rmax / R)) * 1.06;
  const V = skyView(ctx, W, H, ext, t('c4a') + t('unitR'));
  ctx.save(); ctx.beginPath(); ctx.rect(V.P.l, V.P.t, V.P.r - V.P.l, V.P.b - V.P.t); ctx.clip();
  ok.forEach(m => { if (m !== s4.last) polyline(ctx, V, m.f.pts, m.f.pts.length, C.ghost, 1.4, 0.85); });
  if (s4.last && s4.last.ok) polyline(ctx, V, s4.last.f.pts, s4.last.f.pts.length, C.orange, 2.4);
  if (s4.last && !s4.last.ok) polyline(ctx, V, s4.last.f.pts, s4.last.f.pts.length, C.pink, 2, 0.9);
  earth(ctx, V); ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const xs = [10, 20, 50, 100, 200].map(Math.log10), ys = [1, 2, 5, 10, 20, 50, 100, 200].map(Math.log10);
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.75, xMax: 2.4, yMin: -0.05, yMax: 2.6, xTicks: xs, yTicks: ys, xLabel: v => fmt(Math.pow(10, v), 0), yLabel: v => fmt(Math.pow(10, v), 0), title: t('c4b') });
  ctx.save(); ctx.beginPath(); ctx.rect(B.P.l, B.P.t, B.P.r - B.P.l, B.P.b - B.P.t); ctx.clip(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
  const law = la => Math.log10(M.periodOf(Math.pow(10, la) * 1e6) / 3600);
  ctx.moveTo(B.x(0.75), B.y(law(0.75))); ctx.lineTo(B.x(2.4), B.y(law(2.4))); ctx.stroke(); ctx.restore();
  ok.forEach(m => disc(ctx, B.x(Math.log10(m.a / 1e6)), B.y(Math.log10(m.T / 3600)), m === s4.last ? 6 : 4, m === s4.last ? C.orange : C.text));
  if (!s4.last) $('rd4').textContent = t('s4none');
  else if (!s4.last.ok) $('rd4').textContent = t('s4crash', { h: s4.last.h, q: fmt(s4.last.q, 2) });
  else $('rd4').textContent = t('s4readout', { h: s4.last.h, q: fmt(s4.last.q, 2), T: fmt(s4.last.T / 3600, 3), a: Math.round(km(s4.last.a)), ratio: (s4.last.ratio / s4.last.law).toFixed(7), n: ok.length });
}
function add4() {
  const h = num('h4'), q = num('q4'), m = M.measureOrbit(h, q); m.h = h; m.q = q;
  s4.last = m; if (m.ok) { s4.list.push(m); if (s4.list.length > 14) s4.list.shift(); }
  draw4();
}

/* ---------- step 5: circular orbits and the one-day height ---------- */
const SATCOL = [C.green, C.violet, C.pink, C.text];
const s5 = { la: 2.62 };
function draw5() {
  const la = s5.la, alt = Math.pow(10, la) * 1e3, c = M.circular(alt);
  $('alt5v').textContent = sig(alt / 1e3, 4);
  const { ctx, W, H } = fitCanvas($('c5'));
  const lgT = s => Math.log10(s / 3600);
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 2.3, xMax: 5.6, yMin: -0.1, yMax: 3, xTicks: [3, 4, 5], yTicks: [1, 10, 100, 1000].map(Math.log10), xLabel: pow10Label, yLabel: v => fmt(Math.pow(10, v), 0), title: t('c5a') });
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(B.P.l, B.y(lgT(M.SIDEREAL_DAY))); ctx.lineTo(B.P.r, B.y(lgT(M.SIDEREAL_DAY))); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const x = 2.3 + 3.3 * i / 200, Y = B.y(lgT(M.circular(Math.pow(10, x) * 1e3).T)); if (!i) ctx.moveTo(B.x(x), Y); else ctx.lineTo(B.x(x), Y); }
  ctx.stroke(); ctx.restore();
  M.SATS.forEach((s, i) => disc(ctx, B.x(Math.log10(s.alt / 1e3)), B.y(lgT(M.circular(s.alt).T)), 5, SATCOL[i]));
  disc(ctx, B.x(la), B.y(lgT(c.T)), 6.5, C.orange);
  let txt = t('s5readout', { alt: sig(alt / 1e3, 4), a: sig(c.a / 1e3, 4), v: fmt(c.v / 1e3, 2), T: periodText(c.T) });
  if (Math.abs(c.T - M.SIDEREAL_DAY) < 60) txt += ' ' + t('s5geo', { alt: Math.round((M.aForPeriod(M.SIDEREAL_DAY) - R) / 1e4) * 10 });
  if (la >= 5.575) txt += ' ' + t('s5moon', { d: fmt(M.circular(M.MOON.a - R).T / 86400, 2) });
  $('rd5').textContent = txt;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('r0').addEventListener('input', draw0);
  $('moon0').addEventListener('click', () => { $('r0').value = (M.MOON.a / R).toFixed(1); draw0(); });

  $('v1').addEventListener('input', () => { stopAnim('s1'); s1.v = num('v1') * 1e3; keep1(); launch1(); s1.shown = 1; draw1(); });
  $('fire1').addEventListener('click', fire1);
  $('circ1').addEventListener('click', () => { s1.v = M.vCirc(R0); $('v1').value = (s1.v / 1e3).toFixed(2); fire1(); });
  $('esc1').addEventListener('click', () => { s1.v = M.vEsc(R0); $('v1').value = (s1.v / 1e3).toFixed(2); fire1(); });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.old = []; s1.shown = 1; draw1(); });

  $('v2').addEventListener('input', draw2);
  $('v3').addEventListener('input', () => { stopAnim('s3'); s3.p = 1; draw3(); });
  $('play3').addEventListener('click', () => { s3.p = 0; animate('s3', 6000, p => { s3.p = p; draw3(); }); });

  $('h4').addEventListener('input', draw4); $('q4').addEventListener('input', draw4);
  $('add4').addEventListener('click', add4);
  $('clear4').addEventListener('click', () => { s4.list = []; s4.last = null; draw4(); });

  $('alt5').addEventListener('input', () => { s5.la = num('alt5'); draw5(); });
  $('geo5').addEventListener('click', () => { s5.la = Math.log10((M.aForPeriod(M.SIDEREAL_DAY) - R) / 1e3); $('alt5').value = s5.la; draw5(); });

  s1.v = num('v1') * 1e3; launch1(); s1.shown = 1;
  add4(); // one measurement at the default settings, so the chart starts with a point to compare against

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
  window.refreshOrbits = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
