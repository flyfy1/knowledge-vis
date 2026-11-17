'use strict';
// Kepler orbits lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout comes from window.KEPLER_MODEL (model.js). Canvas labels go through a small
// collision-aware placer (each label tries a few anchor offsets and is dropped rather than drawn on top of another).
(function () {

const $ = id => document.getElementById(id);
const M = window.KEPLER_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', star: '#ffd76a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const FONT = 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
// fixed decimals; trailing zeros are trimmed only after a decimal point
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const sig = v => (v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3));
const depthStr = d => (d < 1e-3 ? Math.round(d * 1e6) + ' ppm' : (d * 100).toFixed(2) + '%');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height, L: labeler(ctx, width, height) };
}

// Collision-aware labels. put() tries each candidate offset [dx, dy, align]; keeps labels inside the canvas.
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    block(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
    put(text, x, y, o = {}) {
      let size = o.size || 11.5;
      ctx.save(); ctx.font = `${o.weight || 500} ${size}px ${FONT}`;
      if (o.maxW) while (ctx.measureText(text).width > o.maxW && size > 8) { size -= 0.5; ctx.font = `${o.weight || 500} ${size}px ${FONT}`; }
      const m = ctx.measureText(text), w = m.width, asc = m.actualBoundingBoxAscent || size * 0.8, desc = m.actualBoundingBoxDescent || size * 0.25;
      for (const [dx, dy, al] of (o.cands || [[0, 0]])) {
        const align = al || o.align || 'center';
        let x0 = x + dx - (align === 'center' ? w / 2 : align === 'right' ? w : 0);
        x0 = Math.max(3, Math.min(W - 3 - w, x0));
        const by = Math.max(asc + 2, Math.min(H - desc - 2, y + dy));
        const b = { x0: x0 - 2, y0: by - asc - 2, x1: x0 + w + 2, y1: by + desc + 2 };
        if (!hit(b)) {
          if (o.bg) { ctx.fillStyle = 'rgba(13,22,33,0.82)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          ctx.fillStyle = o.color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x0, by);
          boxes.push(b); ctx.restore(); return b;
        }
      }
      ctx.restore(); return null;
    }
  };
}
const AROUND = (d = 10) => [[0, -d], [0, d + 10], [d, 4, 'left'], [-d, 4, 'right'], [d, -d, 'left'], [-d, -d, 'right'], [d, d + 8, 'left'], [-d, d + 8, 'right']];

// An equal-scale view of a region (model units) inside the canvas below the title row.
function view(W, H, top, xmin, xmax, ymin, ymax, pad = 18) {
  const s = Math.min((W - 2 * pad) / (xmax - xmin), (H - top - 2 * pad) / (ymax - ymin));
  const cx = W / 2 - s * (xmin + xmax) / 2, cy = top + (H - top) / 2 + s * (ymin + ymax) / 2;
  return { s, X: x => cx + s * x, Y: y => cy - s * y };
}

// A plot panel with ticks. o: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks [{v, s}], xTicks [{v, s}]
function panel(ctx, L, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  if (o.title) L.put(o.title, 8, P.t - 11, { align: 'left', weight: 600, size: 12, maxW: W - 16 });
  ctx.save(); ctx.lineWidth = 1;
  for (const tk of o.yTicks) {
    ctx.strokeStyle = tk.zero ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(tk.v)); ctx.lineTo(P.r, y(tk.v)); ctx.stroke();
    L.put(tk.s, P.l - 5, y(tk.v) + 4, { align: 'right', color: C.muted, size: 10.5 });
  }
  for (const tk of (o.xTicks || [])) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(tk.v), P.t); ctx.lineTo(x(tk.v), P.b + 4); ctx.stroke();
    L.put(tk.s, x(tk.v), P.b + 16, { color: C.muted, size: 10.5 });
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  return { x, y, P };
}
function title(L, W, text, y = 18) { L.put(text, 8, y, { align: 'left', weight: 600, size: 12, maxW: W - 16 }); }

function ellipsePath(ctx, V, a, e, n = 180) {
  const b = a * Math.sqrt(1 - e * e);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const E = 2 * Math.PI * i / n, x = a * (Math.cos(E) - e), y = b * Math.sin(E); if (!i) ctx.moveTo(V.X(x), V.Y(y)); else ctx.lineTo(V.X(x), V.Y(y)); }
  ctx.closePath();
}
function dot(ctx, X, Y, r, fill, stroke) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 2 * Math.PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
function star(ctx, X, Y, r = 7) {
  const g = ctx.createRadialGradient(X, Y, 0, X, Y, r * 2.4); g.addColorStop(0, 'rgba(255,215,106,0.55)'); g.addColorStop(1, 'rgba(255,215,106,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, r * 2.4, 0, 7); ctx.fill(); dot(ctx, X, Y, r, C.star);
}
function seg(ctx, x0, y0, x1, y1, col, lw = 2, dash = null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, col, lw = 2.5) {
  const ang = Math.atan2(y1 - y0, x1 - x0), hd = 8;
  seg(ctx, x0, y0, x1, y1, col, lw);
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(ang - 0.45), y1 - hd * Math.sin(ang - 0.45)); ctx.lineTo(x1 - hd * Math.cos(ang + 0.45), y1 - hd * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

/* ---------- step 0: ellipse, foci, perihelion / aphelion ---------- */
function draw0() {
  const e = num('e0'), Ed = num('p0'), a = 1, S = M.shape(a, e), fd = M.focalDistances(a, e, Ed * Math.PI / 180);
  $('e0v').textContent = e.toFixed(3); $('p0v').textContent = Ed + '°';
  const { ctx, W, H, L } = fitCanvas($('c0'));
  title(L, W, t('c0'));
  const V = view(W, H, 28, -S.ra, S.rp, -S.b, S.b, 30);
  // major axis and centre
  seg(ctx, V.X(-S.ra - 0.05), V.Y(0), V.X(S.rp + 0.05), V.Y(0), C.axis, 1, [4, 4]);
  seg(ctx, V.X(-S.c), V.Y(0), V.X(0), V.Y(0), C.pink, 4);
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ellipsePath(ctx, V, a, e); ctx.stroke();
  seg(ctx, V.X(fd.x), V.Y(fd.y), V.X(0), V.Y(0), C.orange, 2.4);
  seg(ctx, V.X(fd.x), V.Y(fd.y), V.X(-2 * S.c), V.Y(0), C.green, 2.4);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(V.X(-S.c) - 4, V.Y(0) - 4); ctx.lineTo(V.X(-S.c) + 4, V.Y(0) + 4); ctx.moveTo(V.X(-S.c) + 4, V.Y(0) - 4); ctx.lineTo(V.X(-S.c) - 4, V.Y(0) + 4); ctx.stroke(); ctx.restore();
  dot(ctx, V.X(-2 * S.c), V.Y(0), 5, C.bg, C.green);
  star(ctx, V.X(0), V.Y(0), 6);
  dot(ctx, V.X(S.rp), V.Y(0), 4, C.cyan); dot(ctx, V.X(-S.ra), V.Y(0), 4, C.cyan);
  dot(ctx, V.X(fd.x), V.Y(fd.y), 6, C.text);
  // reserve marks before labels
  [[V.X(0), V.Y(0), 8], [V.X(-2 * S.c), V.Y(0), 6], [V.X(fd.x), V.Y(fd.y), 7], [V.X(S.rp), V.Y(0), 5], [V.X(-S.ra), V.Y(0), 5]].forEach(([X, Y, r]) => L.block(X - r, Y - r, X + r, Y + r));
  L.put('P', V.X(fd.x), V.Y(fd.y), { cands: AROUND(11), weight: 700 });
  L.put(t('lbStar'), V.X(0), V.Y(0), { cands: [[0, 22], [0, -14], [12, 18, 'left'], [-12, 18, 'right']], color: C.star });
  L.put(t('lbPeri'), V.X(S.rp), V.Y(0), { cands: [[0, -12], [0, 22], [-6, -12, 'right'], [-6, 22, 'right']], color: C.cyan });
  L.put(t('lbApo'), V.X(-S.ra), V.Y(0), { cands: [[0, -12], [0, 22], [6, -12, 'left'], [6, 22, 'left']], color: C.cyan });
  if (S.c > 0.04) L.put(t('lbEmpty'), V.X(-2 * S.c), V.Y(0), { cands: [[0, 22], [0, -12], [0, 36], [0, -26]], color: C.green });
  const mid = (x0, y0, x1, y1) => [V.X((x0 + x1) / 2), V.Y((y0 + y1) / 2)];
  const [m1x, m1y] = mid(fd.x, fd.y, 0, 0), [m2x, m2y] = mid(fd.x, fd.y, -2 * S.c, 0);
  L.put('r₁', m1x, m1y, { cands: AROUND(9), color: C.orange, weight: 700, bg: true });
  L.put('r₂', m2x, m2y, { cands: AROUND(9), color: C.green, weight: 700, bg: true });
  $('r0').textContent = t('s0readout', { e: e.toFixed(3), rp: S.rp.toFixed(3), ra: S.ra.toFixed(3), ratio: S.ratio.toFixed(3), b: S.b.toFixed(3), r1: fd.r1.toFixed(3), r2: fd.r2.toFixed(3), sum: (fd.r1 + fd.r2).toFixed(3) });
}

/* ---------- step 1: equal times, equal areas ---------- */
const s1 = { reveal: 12, p: null }; // p = running time fraction during the animation
function sectorPath(ctx, V, e, q0, q1) {
  ctx.beginPath(); ctx.moveTo(V.X(0), V.Y(0));
  for (let i = 0; i <= 40; i++) { const s = M.state(1, e, q0 + (q1 - q0) * i / 40); ctx.lineTo(V.X(s.x), V.Y(s.y)); }
  ctx.closePath();
}
function draw1() {
  const e = num('e1'), S = M.shape(1, e), N = 12;
  $('e1v').textContent = e.toFixed(2);
  const { ctx, W, H, L } = fitCanvas($('c1'));
  title(L, W, t('c1'));
  const V = view(W, H, 28, -S.ra, S.rp, -S.b, S.b, 22);
  const done = s1.p === null ? s1.reveal : Math.min(N, Math.floor(s1.p * N + 1e-9));
  for (let k = 0; k < done; k++) { sectorPath(ctx, V, e, k / N, (k + 1) / N); ctx.fillStyle = k % 2 ? 'rgba(255,180,84,0.38)' : 'rgba(103,215,249,0.38)'; ctx.fill(); ctx.strokeStyle = 'rgba(13,22,33,0.9)'; ctx.lineWidth = 1; ctx.stroke(); }
  if (s1.p !== null && done < N) { sectorPath(ctx, V, e, done / N, s1.p); ctx.fillStyle = done % 2 ? 'rgba(255,180,84,0.2)' : 'rgba(103,215,249,0.2)'; ctx.fill(); }
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ellipsePath(ctx, V, 1, e); ctx.stroke();
  star(ctx, V.X(0), V.Y(0), 6);
  for (let k = 0; k <= Math.min(done, N - 1); k++) { const s = M.state(1, e, k / N); dot(ctx, V.X(s.x), V.Y(s.y), 3.6, C.text); }
  const pq = s1.p === null ? 0 : s1.p, ps = M.state(1, e, pq);
  dot(ctx, V.X(ps.x), V.Y(ps.y), 6.5, C.cyan); seg(ctx, V.X(0), V.Y(0), V.X(ps.x), V.Y(ps.y), C.cyan, 1.4);
  L.block(V.X(0) - 8, V.Y(0) - 8, V.X(0) + 8, V.Y(0) + 8);
  L.put(t('lbStar'), V.X(0), V.Y(0), { cands: [[0, 22], [0, -14]], color: C.star, bg: true });
  const sl = M.slices(e, N);
  let share = 0; for (let k = 0; k < N; k++) share += M.sectorAreaNumeric(1, e, k / N, (k + 1) / N, 240) / sl.total;
  const prog = done < N ? t('s1progress', { c: done }) : '';
  $('r1').textContent = t('s1readout', { prog, e: e.toFixed(2), share: (share / N * 100).toFixed(2), arcRatio: (sl.longest / sl.shortest).toFixed(2) });
}

/* ---------- step 2: speed along the orbit ---------- */
const s2 = { seen: new Set([0]) };
const Q2 = 200; // slider steps
function draw2() {
  const e = num('e2'), q = num('q2'), a = 1, S = M.shape(a, e), st = M.state(a, e, q);
  $('e2v').textContent = e.toFixed(2); $('q2v').textContent = q.toFixed(3);
  const vp = M.speedAt(a, S.rp), va = M.speedAt(a, S.ra);
  let { ctx, W, H, L } = fitCanvas($('c2'));
  title(L, W, t('c2a'));
  const V = view(W, H, 28, -S.ra, S.rp, -S.b, S.b, 34);
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ellipsePath(ctx, V, a, e); ctx.stroke();
  star(ctx, V.X(0), V.Y(0), 6);
  seg(ctx, V.X(0), V.Y(0), V.X(st.x), V.Y(st.y), C.muted, 1, [3, 3]);
  const len = Math.min(V.s * 0.9, 90) * st.v / Math.max(vp, 1e-9);
  arrow(ctx, V.X(st.x), V.Y(st.y), V.X(st.x) + st.ux * len, V.Y(st.y) - st.uy * len, C.cyan);
  dot(ctx, V.X(st.x), V.Y(st.y), 6, C.cyan);
  L.block(V.X(0) - 8, V.Y(0) - 8, V.X(0) + 8, V.Y(0) + 8); L.block(V.X(st.x) - 7, V.Y(st.y) - 7, V.X(st.x) + 7, V.Y(st.y) + 7);
  L.put(t('lbPeri'), V.X(S.rp), V.Y(0), { cands: [[0, 22], [0, -12], [-4, 22, 'right']], color: C.muted });
  L.put(t('lbApo'), V.X(-S.ra), V.Y(0), { cands: [[0, 22], [0, -12], [4, 22, 'left']], color: C.muted });
  L.put(fmt(st.v, 1) + ' km/s', V.X(st.x) + st.ux * len, V.Y(st.y) - st.uy * len, { cands: AROUND(10), color: C.cyan, weight: 700, bg: true });

  ({ ctx, W, H, L } = fitCanvas($('c2b')));
  const top = Math.ceil(vp * 1.12 / 10) * 10, midT = Math.round(top / 20) * 10;
  const P = panel(ctx, L, W, { top: 30, bottom: H - 30, left: 40, xMin: 0, xMax: 1, yMin: 0, yMax: top, yTicks: [{ v: 0, s: '0', zero: true }, { v: midT, s: String(midT) }, { v: top, s: String(top) }], xTicks: [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, s: fmt(v) })), title: t('c2b') });
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i <= Q2; i++) { const s = M.state(a, e, i / Q2); if (!i) ctx.moveTo(P.x(i / Q2), P.y(s.v)); else ctx.lineTo(P.x(i / Q2), P.y(s.v)); }
  ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.6; let pen = false; ctx.beginPath();
  for (let i = 0; i <= Q2; i++) { if (!s2.seen.has(i)) { pen = false; continue; } const s = M.state(a, e, i / Q2), X = P.x(i / Q2), Y = P.y(s.v); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  seg(ctx, P.x(q), P.P.t, P.x(q), P.P.b, C.cyan, 1, [3, 3]);
  dot(ctx, P.x(q), P.y(st.v), 5.5, C.cyan);
  $('r2').textContent = t('s2readout', { q: q.toFixed(3), r: st.r.toFixed(3), v: st.v.toFixed(2), vp: vp.toFixed(2), va: va.toFixed(2), vr: (vp / va).toFixed(3), rr: (S.ra / S.rp).toFixed(3), vc: M.vCirc(a).toFixed(2) });
}
function markQ2(q) {
  const i = Math.round(q * Q2), j = s2.last === undefined ? i : s2.last;
  for (let k = Math.min(i, j); k <= Math.max(i, j); k++) s2.seen.add(k);
  s2.last = i;
}

/* ---------- step 3: period depends on a only ---------- */
const s3 = { q: 0, laps: 0 };
function draw3() {
  const a = Math.pow(10, num('a3')), e = num('e3'), T = M.periodYears(a);
  $('a3v').textContent = sig(a) + ' AU'; $('e3v').textContent = e.toFixed(2);
  let { ctx, W, H, L } = fitCanvas($('c3'));
  title(L, W, t('c3a'));
  const S = M.shape(1, e);
  const V = view(W, H, 28, -Math.max(1, S.ra), 1, -1, 1, 22);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), V.s, 0, 7); ctx.stroke();
  ctx.strokeStyle = C.orange; ellipsePath(ctx, V, 1, e); ctx.stroke(); ctx.globalAlpha = 1;
  star(ctx, V.X(0), V.Y(0), 6);
  const pc = M.state(1, 0, s3.q), pe = M.state(1, e, s3.q);
  seg(ctx, V.X(0), V.Y(0), V.X(pc.x), V.Y(pc.y), C.cyan, 1, [3, 3]); seg(ctx, V.X(0), V.Y(0), V.X(pe.x), V.Y(pe.y), C.orange, 1, [3, 3]);
  dot(ctx, V.X(pc.x), V.Y(pc.y), 6.5, C.cyan); dot(ctx, V.X(pe.x), V.Y(pe.y), 6.5, C.orange);
  // lap counters as a small progress ring per planet (drawn, not text)
  L.put(t('s3laps', { c: s3.laps, e: s3.laps }), W - 8, H - 10, { align: 'right', color: C.muted, size: 11, maxW: W - 16 });

  ({ ctx, W, H, L } = fitCanvas($('c3b')));
  const lx = Math.log10, X0 = -0.7, X1 = 1.7, Y0 = -1, Y1 = 2.6;
  const P = panel(ctx, L, W, { top: 30, bottom: H - 30, left: 40, xMin: X0, xMax: X1, yMin: Y0, yMax: Y1,
    yTicks: [{ v: -1, s: '0.1' }, { v: 0, s: '1' }, { v: 1, s: '10' }, { v: 2, s: '100' }], xTicks: [{ v: -0.5, s: '0.3' }, { v: 0, s: '1' }, { v: 0.5, s: '3' }, { v: 1, s: '10' }, { v: 1.5, s: '30' }], title: t('c3b') });
  ctx.save(); ctx.beginPath(); ctx.rect(P.P.l, P.P.t, P.P.r - P.P.l, P.P.b - P.P.t); ctx.clip();
  seg(ctx, P.x(X0), P.y(1.5 * X0), P.x(X1), P.y(1.5 * X1), C.violet, 2);
  ctx.restore();
  const pts = M.BODIES.map(b => ({ b, X: P.x(lx(b.a)), Y: P.y(lx(b.T)) }));
  pts.forEach(p => { dot(ctx, p.X, p.Y, 4, C.text); L.block(p.X - 4, p.Y - 4, p.X + 4, p.Y + 4); });
  const cx = P.x(lx(a)), cy = P.y(lx(T)); dot(ctx, cx, cy, 8, null, C.text); L.block(cx - 9, cy - 9, cx + 9, cy + 9);
  pts.forEach(p => L.put(t('b_' + p.b.id), p.X, p.Y, { cands: [[7, 4, 'left'], [-7, 4, 'right'], [0, -9], [0, 17], [7, -7, 'left'], [7, 14, 'left'], [-7, 14, 'right'], [-7, -7, 'right']], color: p.b.id === 'halley' ? C.orange : C.muted, size: 10.5 }));
  const prog = s3.laps > 0 || anims.s3 ? t('s3lapProgress', { lap: s3.laps }) : '';
  $('r3').textContent = t('s3readout', { prog, a: sig(a), T: T >= 10 ? T.toFixed(1) : T.toFixed(3), d: Math.round(M.periodDays(a)).toLocaleString('en-US'), th: M.periodYears(17.83).toFixed(1) });
}

/* ---------- step 4: transit depth and duration ---------- */
const s4 = { seen: new Set(), last: undefined };
const X4 = { min: -1.6, max: 1.6, d: 0.01 };
const xi = v => Math.round((v - X4.min) / X4.d);
function mark4(v) { const i = xi(v), j = s4.last === undefined ? i : s4.last; for (let k = Math.min(i, j); k <= Math.max(i, j); k++) s4.seen.add(k); s4.last = i; }
function draw4() {
  const rp = num('rp4'), a = Math.pow(10, num('a4')), x = num('x4'), tr = M.transit(rp, a, 90), k = tr.k;
  $('rp4v').textContent = rp.toFixed(1) + ' R⊕'; $('a4v').textContent = sig(a) + ' AU'; $('x4v').textContent = x.toFixed(2);
  const { ctx, W, H, L } = fitCanvas($('c4'));
  title(L, W, t('c4a'));
  // disc view: ±1.75 star radii across, centred
  const Rs = Math.min(64, (W - 24) / 3.6), cx = W / 2, cy = 34 + Rs + 6;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rs); g.addColorStop(0, '#fff3c4'); g.addColorStop(1, '#ffc955');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rs, 0, 7); ctx.fill();
  seg(ctx, cx - 1.75 * Rs, cy, cx + 1.75 * Rs, cy, C.muted, 1, [3, 4]);
  const px = cx + x * Rs, pr = Math.max(0.9, k * Rs);
  dot(ctx, px, cy, pr, '#05080c');
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, cy, pr + 6, 0, 7); ctx.stroke();
  // light curve
  const hMax = M.hoursAtX(a, X4.max), depth = tr.maxDepth, lo = -depth * 1.3, hi = depth * 0.25;
  const tickH = hMax > 8 ? (hMax > 16 ? 8 : 4) : hMax > 3 ? 2 : hMax > 1.2 ? 1 : 0.5, xt = [];
  for (let v = -Math.floor(hMax / tickH) * tickH; v <= hMax + 1e-9; v += tickH) xt.push({ v, s: fmt(v, 1) });
  const P = panel(ctx, L, W, { top: cy + Rs + 46, bottom: H - 30, left: 64, xMin: -hMax, xMax: hMax, yMin: lo, yMax: hi,
    yTicks: [{ v: 0, s: '0', zero: true }, { v: -depth, s: '−' + depthStr(depth) }], xTicks: xt, title: t('c4b') });
  const yOf = xx => -(1 - M.flux(Math.abs(xx), k));
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= 320; i++) { const xx = X4.min + i * X4.d, X = P.x(M.hoursAtX(a, xx)), Y = P.y(yOf(xx)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.6; ctx.beginPath(); let pen = false;
  for (let i = 0; i <= 320; i++) { if (!s4.seen.has(i)) { pen = false; continue; } const xx = X4.min + i * X4.d, X = P.x(M.hoursAtX(a, xx)), Y = P.y(yOf(xx)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  const hNow = M.hoursAtX(a, x);
  dot(ctx, P.x(hNow), P.y(yOf(x)), 5, C.orange);
  L.put(t('s4axis'), P.P.r - 4, P.P.b - 6, { align: 'right', color: C.muted, size: 10, maxW: (P.P.r - P.P.l) * 0.7 });
  const drop = 1 - M.flux(Math.abs(x), k);
  $('r4').textContent = t('s4readout', { rp: rp.toFixed(1), a: sig(a), P: fmt(M.periodDays(a), 1), depth: depthStr(depth), dur: tr.durH.toFixed(1), dt: (hNow >= 0 ? '+' : '−') + Math.abs(hNow).toFixed(1), f: drop < 1e-9 ? '0' : depthStr(drop) });
}

/* ---------- step 5: alignment window and random orientations ---------- */
const RP5 = 11.2, s5 = { cosI: [], drawn: 0 };
function draw5() {
  const iDeg = num('i5'), a = Math.pow(10, num('a5')), tr = M.transit(RP5, a, iDeg), k = tr.k;
  $('i5v').textContent = iDeg.toFixed(2) + '°'; $('a5v').textContent = sig(a) + ' AU';
  let { ctx, W, H, L } = fitCanvas($('c5'));
  title(L, W, t('c5a'));
  const Rs = Math.min(70, (W - 30) / 4.2, (H - 60) / 5.2), cx = W / 2, cy = 30 + (H - 30) / 2;
  // transit band |y| < 1 + k
  ctx.fillStyle = 'rgba(255,180,84,0.10)'; ctx.fillRect(10, cy - (1 + k) * Rs, W - 20, 2 * (1 + k) * Rs);
  seg(ctx, 10, cy - (1 + k) * Rs, W - 10, cy - (1 + k) * Rs, C.orange, 1, [4, 4]);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rs); g.addColorStop(0, '#fff3c4'); g.addColorStop(1, '#ffc955');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rs, 0, 7); ctx.fill();
  const maxB = (H - 30) / 2 / Rs - 0.4, shown = Math.min(tr.b, maxB), yb = cy - shown * Rs;
  seg(ctx, 10, yb, W - 10, yb, tr.hits ? C.cyan : C.raw, 2.2);
  if (tr.b > maxB) { arrow(ctx, cx, yb + 14, cx, yb - 2, C.raw, 2); }
  dot(ctx, cx + 1.3 * Rs, yb, Math.max(1.2, k * Rs), '#0b1018', tr.hits ? C.cyan : C.raw);
  L.block(cx - Rs, cy - Rs, cx + Rs, cy + Rs);
  L.put('b = ' + tr.b.toFixed(2) + (tr.b > maxB ? ' ↑' : ''), 14, yb - 7, { align: 'left', color: tr.hits ? C.cyan : C.muted, weight: 700, bg: true, cands: [[0, 0], [0, 18]] });

  ({ ctx, W, H, L } = fitCanvas($('c5b')));
  const n = s5.cosI.length, hits = s5.cosI.filter(c => c * tr.A < 1 + k).length;
  const A = panel(ctx, L, W, { top: 30, bottom: 120, left: 14, right: 14, xMin: 0, xMax: 1, yMin: 0, yMax: 1, yTicks: [], xTicks: [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, s: fmt(v) })), title: t('c5b') });
  const pw = Math.max(2, A.x(Math.min(1, tr.prob)) - A.x(0));
  ctx.fillStyle = 'rgba(255,180,84,0.35)'; ctx.fillRect(A.x(0), A.P.t, pw, A.P.b - A.P.t);
  const u = M.rng(77);
  s5.cosI.forEach(c => { const yy = A.P.t + 6 + u() * (A.P.b - A.P.t - 12); const hit = c * tr.A < 1 + k; ctx.fillStyle = hit ? C.green : 'rgba(85,101,122,0.8)'; ctx.fillRect(A.x(c) - (hit ? 2 : 1), yy - (hit ? 2 : 1), hit ? 4 : 2, hit ? 4 : 2); });
  // running fraction vs number placed
  const top = Math.max(0.02, Math.min(1, Math.ceil(tr.prob * 2.2 * 100) / 100)), Nmax = Math.max(500, Math.ceil(n / 500) * 500);
  const B = panel(ctx, L, W, { top: 172, bottom: H - 30, left: 44, xMin: 0, xMax: Nmax, yMin: 0, yMax: top, yTicks: [{ v: 0, s: '0%', zero: true }, { v: top, s: fmt(top * 100, 1) + '%' }], xTicks: [{ v: 0, s: '0' }, { v: Nmax, s: String(Nmax) }], title: t('s5lgHit') + ' %' });
  seg(ctx, B.x(0), B.y(tr.prob), B.x(Nmax), B.y(tr.prob), C.orange, 1.6, [5, 4]);
  if (n) {
    ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); let h = 0;
    for (let j = 0; j < n; j++) { if (s5.cosI[j] * tr.A < 1 + k) h++; if (j >= 19 && ((j + 1) % 10 === 0 || j === n - 1)) { const X = B.x(j + 1), Y = B.y(Math.min(top, h / (j + 1))); if (j < 20) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } }
    ctx.stroke(); ctx.restore();
  }
  const sim = n ? t('s5sim', { n, h: hits, f: (hits / n * 100).toFixed(1) }) : t('s5nosim');
  $('r5').textContent = t('s5readout', { a: sig(a), i: iDeg.toFixed(2), b: tr.b.toFixed(2), verdict: t(tr.hits ? 's5yes' : 's5no'), imin: tr.iMin.toFixed(2), p: (tr.prob * 100).toFixed(2), sim });
  $('h5').textContent = t('s5hint', { imin0: M.transit(RP5, 0.05, 90).iMin.toFixed(1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['e0', 'p0'].forEach(id => $(id).addEventListener('input', draw0));
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => { $('e0').value = b.dataset.preset; draw0(); }));

  $('e1').addEventListener('input', () => { stopAnim('s1'); s1.p = null; s1.reveal = 12; draw1(); });
  $('play1').addEventListener('click', () => { s1.p = 0; animate('s1', 9000, p => { s1.p = p; draw1(); }, () => { s1.p = null; s1.reveal = 12; draw1(); }); });
  $('all1').addEventListener('click', () => { stopAnim('s1'); s1.p = null; s1.reveal = 12; draw1(); });

  $('e2').addEventListener('input', () => { s2.seen = new Set(); s2.last = undefined; markQ2(num('q2')); draw2(); });
  $('q2').addEventListener('input', () => { stopAnim('s2'); markQ2(num('q2')); draw2(); });
  $('play2').addEventListener('click', () => {
    s2.seen = new Set(); s2.last = 0;
    animate('s2', 7000, p => { $('q2').value = (Math.round(p * Q2) / Q2).toFixed(3); markQ2(num('q2')); draw2(); });
  });
  markQ2(num('q2'));

  const stop3 = () => { stopAnim('s3'); $('play3').textContent = t('playLaps'); $('play3').dataset.i18n = 'playLaps'; };
  ['a3', 'e3'].forEach(id => $(id).addEventListener('input', () => { stop3(); s3.q = 0; s3.laps = 0; draw3(); }));
  $('play3').addEventListener('click', () => {
    if (anims.s3) { stop3(); draw3(); return; }
    s3.q = 0; s3.laps = 0; $('play3').dataset.i18n = 'pause'; $('play3').textContent = t('pause');
    animate('s3', 12000, p => { const tq = p * 2; s3.laps = Math.min(2, Math.floor(tq + 1e-9)); s3.q = p >= 1 ? 0 : tq - Math.floor(tq); draw3(); }, () => { $('play3').dataset.i18n = 'playLaps'; $('play3').textContent = t('playLaps'); draw3(); });
  });

  ['rp4', 'a4'].forEach(id => $(id).addEventListener('input', draw4));
  $('x4').addEventListener('input', () => { stopAnim('s4'); mark4(num('x4')); draw4(); });
  $('sweep4').addEventListener('click', () => {
    s4.seen = new Set(); s4.last = xi(X4.min);
    animate('s4', 5000, p => { $('x4').value = (X4.min + Math.round(p * 320) * X4.d).toFixed(2); mark4(num('x4')); draw4(); });
  });
  mark4(num('x4'));

  ['i5'].forEach(id => $(id).addEventListener('input', draw5));
  $('a5').addEventListener('input', () => { stopAnim('s5'); s5.cosI = []; s5.drawn = 0; draw5(); });
  $('many5').addEventListener('click', () => {
    const start = s5.cosI.length, batch = M.orientations(start + 500, 2026).slice(start);
    animate('s5', 1200, p => { const want = start + Math.round(p * 500); while (s5.cosI.length < want) s5.cosI.push(batch[s5.cosI.length - start]); draw5(); });
  });
  $('clear5').addEventListener('click', () => { stopAnim('s5'); s5.cosI = []; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(en.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = () => { if ($('play3').dataset.i18n) $('play3').textContent = t($('play3').dataset.i18n); refresh(); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
