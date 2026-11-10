'use strict';
// Electric field lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, line, contour and readout comes from window.EF_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and the +/− signs inside charges; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EF_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', faint: '#3c5470' };
const num = id => Number($(id).value);
const nC = M.nC, cm = M.cm;
const fx = (v, d) => (isFinite(v) ? (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d) : '—');
const sgn = v => (v > 0 ? '+' : '') + fx(v, 1);
const fmtN = v => { const a = Math.abs(v); return a >= 1000 ? Math.round(v).toString() : a >= 10 ? v.toFixed(1) : v.toFixed(2); };

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const v of (o.yTicks || [])) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [0.1, 0.2, 0.5, 1, 2, 5, 10]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      const lab = Math.abs(v) < 1e-9 ? '0' : String(Math.round(v * 100) / 100);
      ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), o.xGrid ? P.t : P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(lab, x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, color, hollow) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 2, head = 8, alpha = 1) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, h = Math.min(head, L * 0.6);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5); ctx.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function charge(ctx, X, Y, q, r = 10) {
  const col = q > 0 ? C.orange : q < 0 ? C.violet : C.ghost;
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
  if (q !== 0) { ctx.fillStyle = '#081018'; ctx.font = `700 ${Math.round(r * 1.5)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(q > 0 ? '+' : '−', X, Y + 1); }
  ctx.restore();
}
// A scene in centimetres with equal scale on both axes, centred in the canvas below a title row.
function scene(W, H, xr, yr, top = 30) {
  const bw = W - 16, bh = H - top - 8, s = Math.min(bw / (2 * xr), bh / (2 * yr));
  const X0 = 8 + bw / 2, Y0 = top + bh / 2;
  return { s, X: x => X0 + x * s, Y: y => Y0 - y * s, inv: (px, py) => [(px - X0) / s, (Y0 - py) / s], box: { x: 8, y: top, w: bw, h: bh } };
}
function frame(ctx, b) { ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.restore(); }
function clipBox(ctx, b) { ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip(); }

/* ---------- step 0: force ∝ test charge; E = F/q ---------- */
const S0 = { Q: 2 * nC, tried: new Map() };
function draw0() {
  const q = num('q0'), r = num('r0'); $('q0v').textContent = sgn(q) + ' nC'; $('r0v').textContent = r + ' cm';
  if (!S0.tried.has(r)) S0.tried.set(r, new Set()); S0.tried.get(r).add(q.toFixed(1));
  const Ef = M.pointE(S0.Q, r * cm), F = q * nC * Ef; // signed: + = away from Q (to the right)
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 20, W - 16);
  const box = { x: 8, y: 30, w: W - 16, h: H - 38 }; frame(ctx, box);
  const s = (box.w - 40) / 11, X = x => box.x + 20 + x * s, Yc = box.y + box.h / 2;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(0), Yc); ctx.lineTo(X(10.5), Yc); ctx.stroke(); ctx.restore();
  // centimetre ticks under the axis
  ctx.save(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  for (let v = 0; v <= 10; v += 2) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), Yc + 34); ctx.lineTo(X(v), Yc + 40); ctx.stroke(); ctx.fillText(v + (v === 10 ? ' cm' : ''), X(v), Yc + 53); }
  ctx.restore();
  charge(ctx, X(0), Yc, 1, 12);
  // arrow length ∝ F (20 μN ↔ 30% of the box), clamped to the box
  const tipX = Math.max(box.x + 6, Math.min(box.x + box.w - 6, X(r) + F / 20e-6 * box.w * 0.3));
  if (q !== 0) arrow(ctx, X(r), Yc, tipX, Yc, C.green, 3.5, 11);
  dot(ctx, X(r), Yc, 7, C.cyan, q === 0);

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const G = panel(ctx, W, { top: 40, bottom: H - 28, xMin: -1, xMax: 1, yMin: -50, yMax: 50, yTicks: [-50, -25, 0, 25, 50], xTicks: true, xSteps: [0.5, 1], left: 36, xGrid: true, title: t('c0b') });
  ctx.save(); ctx.beginPath(); ctx.rect(G.P.l, G.P.t, G.P.r - G.P.l, G.P.b - G.P.t); ctx.clip();
  S0.tried.forEach((_, rr) => {
    const E = M.pointE(S0.Q, rr * cm), cur = rr === r;
    ctx.strokeStyle = cur ? C.text : C.ghost; ctx.globalAlpha = cur ? 1 : 0.45; ctx.lineWidth = cur ? 2 : 1.2;
    ctx.beginPath(); ctx.moveTo(G.x(-1), G.y(-1 * nC * E * 1e6)); ctx.lineTo(G.x(1), G.y(nC * E * 1e6)); ctx.stroke();
  });
  ctx.globalAlpha = 1; ctx.restore();
  S0.tried.get(r).forEach(k => { const qq = Number(k); dot(ctx, G.x(qq), G.y(qq * nC * Ef * 1e6), 3.5, C.green); });
  dot(ctx, G.x(q), G.y(F * 1e6), 6, C.cyan);
  $('ro0').textContent = q === 0 ? t('s0zero', { Ef: fmtN(Ef) }) : t('s0readout', { q: sgn(q), r, F: fx(Math.abs(F) * 1e6, 2), dir: t(F > 0 ? 'dirAway' : 'dirToward'), E: fmtN(F / (q * nC)), Ef: fmtN(Ef) });
}

/* ---------- step 1: one point charge ---------- */
const S1 = { Emin: M.pointE(0.5 * nC, 0.16), Emax: M.pointE(5 * nC, 0.012) };
function draw1() {
  const Q = num('Q1'), r = num('r1'); $('Q1v').textContent = sgn(Q) + ' nC'; $('r1v').textContent = r + ' cm';
  const ch = [{ q: Q * nC, x: 0, y: 0 }];
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 20, W - 16);
  const sc = scene(W, H, 11, 7); frame(ctx, sc.box);
  ctx.save(); clipBox(ctx, sc.box);
  ctx.strokeStyle = C.grid; ctx.setLineDash([4, 5]);
  [r, 2 * r].forEach(rr => { ctx.beginPath(); ctx.arc(sc.X(0), sc.Y(0), rr * sc.s, 0, 7); ctx.stroke(); });
  ctx.setLineDash([]);
  const step = Math.max(1.4, 30 / sc.s), lenPx = Math.min(16, step * sc.s * 0.42);
  const ni = Math.floor(11 / step), nj = Math.floor(7 / step);
  if (Q !== 0) for (let i = -ni; i <= ni; i++) for (let j = -nj; j <= nj; j++) {
    const xx = i * step, yy = j * step;
    if (Math.hypot(xx, yy) < 1.2) continue;
    const e = M.field(ch, xx * cm, yy * cm);
    const a = Math.max(0.12, Math.min(1, Math.log(e.E / S1.Emin) / Math.log(S1.Emax / S1.Emin)));
    const ux = e.Ex / e.E, uy = -e.Ey / e.E, X = sc.X(xx), Y = sc.Y(yy);
    arrow(ctx, X - ux * lenPx / 2, Y - uy * lenPx / 2, X + ux * lenPx / 2, Y + uy * lenPx / 2, C.text, 1.5, 6, a);
  }
  ctx.restore();
  charge(ctx, sc.X(0), sc.Y(0), Q, 11);
  const eP = M.field(ch, r * cm, 0);
  if (Q !== 0) arrow(ctx, sc.X(r), sc.Y(0), sc.X(r) + Math.sign(eP.Ex) * 34, sc.Y(0), C.cyan, 3, 10);
  dot(ctx, sc.X(r), sc.Y(0), 5, C.cyan);
  if (2 * r <= 11) dot(ctx, sc.X(2 * r), sc.Y(0), 5, C.orange);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const G = panel(ctx, W, { top: 40, bottom: H - 28, xMin: 2, xMax: 10, yMin: 0, yMax: 115, yTicks: [0, 25, 50, 75, 100], xTicks: true, xSteps: [1, 2, 4], left: 36, title: t('c1b') });
  ctx.save(); ctx.beginPath(); ctx.rect(G.P.l, G.P.t, G.P.r - G.P.l, G.P.b - G.P.t); ctx.clip();
  ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 160; i++) { const rr = 2 + 8 * i / 160, Y = G.y(M.pointE(Q * nC, rr * cm) / 1000); if (!i) ctx.moveTo(G.x(rr), Y); else ctx.lineTo(G.x(rr), Y); }
  ctx.stroke(); ctx.restore();
  const E = M.pointE(Q * nC, r * cm), E2 = M.pointE(Q * nC, 2 * r * cm);
  dot(ctx, G.x(r), G.y(E / 1000), 5.5, C.text);
  if (2 * r <= 10) dot(ctx, G.x(2 * r), G.y(E2 / 1000), 5.5, C.orange);
  if (Q === 0) { $('ro1').textContent = t('s1zero'); return; }
  const twice = 2 * r <= 10 ? t('s1twice', { r2: 2 * r, E2: fmtN(E2), ratio: '1/' + Math.round(E / E2) }) : t('s1far');
  $('ro1').textContent = t('s1readout', { Q: sgn(Q), r, E: fmtN(E), dir: t(Q > 0 ? 's1out' : 's1in'), twice });
}

/* ---------- step 2: superposition ---------- */
function draw2() {
  const Q2 = num('Q2'), px = num('px2'), py = num('py2');
  $('Q2v').textContent = sgn(Q2) + ' nC'; $('px2v').textContent = px + ' cm'; $('py2v').textContent = py + ' cm';
  const q1 = { q: 2 * nC, x: -3 * cm, y: 0 }, q2 = { q: Q2 * nC, x: 3 * cm, y: 0 };
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 20, W - 16);
  const sc = scene(W, H, 9.5, 6); S2.sc = sc; frame(ctx, sc.box);
  ctx.save(); clipBox(ctx, sc.box); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let g = -9; g <= 9; g++) { ctx.globalAlpha = g === 0 ? 0.9 : 0.35; ctx.beginPath(); ctx.moveTo(sc.X(g), sc.box.y); ctx.lineTo(sc.X(g), sc.box.y + sc.box.h); ctx.stroke(); }
  for (let g = -6; g <= 6; g++) { ctx.globalAlpha = g === 0 ? 0.9 : 0.35; ctx.beginPath(); ctx.moveTo(sc.box.x, sc.Y(g)); ctx.lineTo(sc.box.x + sc.box.w, sc.Y(g)); ctx.stroke(); }
  ctx.restore();
  charge(ctx, sc.X(-3), sc.Y(0), 2, 11); charge(ctx, sc.X(3), sc.Y(0), Q2, 11);
  const near = Math.hypot(px + 3, py) < 0.6 || (Q2 !== 0 && Math.hypot(px - 3, py) < 0.6);
  dot(ctx, sc.X(px), sc.Y(py), 5, C.text);
  if (near) { $('ro2').textContent = t('tooNear'); return; }
  const e1 = M.field([q1], px * cm, py * cm), e2 = M.field([q2], px * cm, py * cm), e = { Ex: e1.Ex + e2.Ex, Ey: e1.Ey + e2.Ey };
  const eM = Math.hypot(e.Ex, e.Ey), big = Math.max(e1.E, e2.E, eM), k = Math.min(90, sc.s * 4) / big;
  const P = [sc.X(px), sc.Y(py)], tip = v => [P[0] + v.Ex * k, P[1] - v.Ey * k];
  const t1 = tip(e1), t2 = tip(e2), te = tip(e);
  if (e2.E > 0 && e1.E > 0) {
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(t1[0], t1[1]); ctx.lineTo(te[0], te[1]); ctx.lineTo(t2[0], t2[1]); ctx.stroke(); ctx.restore();
  }
  arrow(ctx, P[0], P[1], t1[0], t1[1], C.orange, 2.4, 9);
  if (e2.E > 0) arrow(ctx, P[0], P[1], t2[0], t2[1], C.pink, 2.4, 9);
  arrow(ctx, P[0], P[1], te[0], te[1], C.cyan, 3.2, 11);
  dot(ctx, P[0], P[1], 5, C.text);
  const sum = e1.E + e2.E, frac = eM / sum;
  const note = eM < 1e-6 * sum ? t('s2null') : frac > 0.99999 ? t('s2same') : e2.E === 0 ? '' : t('s2sum', { s: fmtN(sum), p: fx(100 * frac, 1) });
  $('ro2').textContent = t('s2readout', { x: px, y: py, e1: fmtN(e1.E), e2: fmtN(e2.E), ex: fmtN(e.Ex), ey: fmtN(e.Ey), e: fmtN(eM), note });
}
const S2 = { sc: null };

/* ---------- step 3: field lines ---------- */
function drawLines(ctx, sc, res, color, alpha, arrows) {
  ctx.save(); clipBox(ctx, sc.box); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.6;
  res.lines.forEach(L => {
    ctx.beginPath(); L.pts.forEach((p, i) => { const X = sc.X(p[0] / cm), Y = sc.Y(p[1] / cm); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke();
  });
  ctx.restore();
  if (!arrows) return;
  // one arrowhead per line, about a third of the way along its visible part, pointing along E
  res.lines.forEach(L => {
    const vis = L.pts.filter(p => Math.abs(p[0] / cm) < 9 && Math.abs(p[1] / cm) < 5.6);
    if (vis.length < 6) return;
    const i = Math.floor(vis.length * 0.45), a = vis[i], b = vis[Math.min(vis.length - 1, i + 3)];
    const fwd = res.dirOf(L);
    const [p0, p1] = fwd > 0 ? [a, b] : [b, a];
    const X0 = sc.X(p0[0] / cm), Y0 = sc.Y(p0[1] / cm), X1 = sc.X(p1[0] / cm), Y1 = sc.Y(p1[1] / cm), L2 = Math.hypot(X1 - X0, Y1 - Y0) || 1;
    arrow(ctx, X1 - (X1 - X0) / L2 * 6, Y1 - (Y1 - Y0) / L2 * 6, X1 + (X1 - X0) / L2 * 8, Y1 + (Y1 - Y0) / L2 * 8, color, 1.6, 9, alpha);
  });
}
function linesFor(q1, q2) {
  const ch = [{ q: q1 * nC, x: -3 * cm, y: 0 }, { q: q2 * nC, x: 3 * cm, y: 0 }];
  const res = M.fieldLines(ch);
  res.dirOf = L => ((L.from === 0 ? q1 : q2) > 0 ? 1 : -1); // traced along +E from positive sources, against E from negative
  return res;
}
function draw3() {
  const q1 = num('Q31'), q2 = num('Q32'); $('Q31v').textContent = sgn(q1) + ' nC'; $('Q32v').textContent = sgn(q2) + ' nC';
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 20, W - 16);
  const sc = scene(W, H, 9, 5.6); frame(ctx, sc.box);
  const res = linesFor(q1, q2);
  drawLines(ctx, sc, res, C.cyan, 0.9, true);
  charge(ctx, sc.X(-3), sc.Y(0), q1, 10); charge(ctx, sc.X(3), sc.Y(0), q2, 10);
  let msg;
  if (!q1 && !q2) msg = t('s3none');
  else if (!q1 || !q2) { const q = q1 || q2; msg = t('s3single', { n: res.lines.length, dir: t(q > 0 ? 's3outw' : 's3inw') }); }
  else if (q1 * q2 > 0) msg = t('s3same', { n1: res.n[0] * 2, n2: res.n[1] * 2 });
  else {
    const bigI = res.sources[0], big = bigI === 0 ? q1 : q2, small = bigI === 0 ? q2 : q1;
    const outside = res.lines.filter(L => L.end !== -1 && L.pts.some(p => Math.abs(p[0] / cm) > 9 || Math.abs(p[1] / cm) > 5.6)).length;
    msg = Math.abs(big) === Math.abs(small) ? t('s3equal', { nb: res.lines.length, land: res.landed, esc: outside })
      : t('s3opp', { big: sgn(big), small: sgn(small), nb: res.lines.length, land: res.landed, esc: res.escaped });
  }
  $('ro3').textContent = msg;
}

/* ---------- step 4: equipotentials ---------- */
function contours(ctx, sc, fn, levels, colorOf, skip) {
  const b = sc.box, cell = 5, nx = Math.ceil(b.w / cell), ny = Math.ceil(b.h / cell);
  const vals = new Float64Array((nx + 1) * (ny + 1)), bad = new Uint8Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const [x, y] = sc.inv(b.x + i * cell, b.y + j * cell), k = j * (nx + 1) + i;
    vals[k] = fn(x, y); bad[k] = skip(x, y) ? 1 : 0;
  }
  ctx.save(); clipBox(ctx, b); ctx.lineWidth = 1.4;
  for (const L of levels) {
    ctx.strokeStyle = colorOf(L); ctx.beginPath();
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = j * (nx + 1) + i, ks = [k, k + 1, k + nx + 2, k + nx + 1];
      if (ks.some(q => bad[q])) continue;
      const v = ks.map(q => vals[q]), X = b.x + i * cell, Y = b.y + j * cell;
      const corners = [[X, Y], [X + cell, Y], [X + cell, Y + cell], [X, Y + cell]], pts = [];
      for (let e = 0; e < 4; e++) {
        const a = v[e], c = v[(e + 1) % 4];
        if ((a - L) * (c - L) < 0) { const f = (L - a) / (c - a), p = corners[e], q = corners[(e + 1) % 4]; pts.push([p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1])]); }
      }
      for (let m = 0; m + 1 < pts.length; m += 2) { ctx.moveTo(pts[m][0], pts[m][1]); ctx.lineTo(pts[m + 1][0], pts[m + 1][1]); }
    }
    ctx.stroke();
  }
  ctx.restore();
}
function draw4() {
  const q2 = num('Q4'), dV = num('dV4'), px = num('px4'), py = num('py4');
  $('Q4v').textContent = sgn(q2) + ' nC'; $('dV4v').textContent = dV + ' V'; $('px4v').textContent = px + ' cm'; $('py4v').textContent = py + ' cm';
  const ch = [{ q: 2 * nC, x: -3 * cm, y: 0 }, { q: q2 * nC, x: 3 * cm, y: 0 }];
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 20, W - 16);
  const sc = scene(W, H, 9, 5.6); frame(ctx, sc.box);
  drawLines(ctx, sc, linesFor(2, q2), C.faint, 0.9, false);
  const levels = []; for (let m = -30; m <= 30; m++) if (m !== 0 && Math.abs(m * dV) <= 1500) levels.push(m * dV);
  contours(ctx, sc, (x, y) => M.potential(ch, x * cm, y * cm), levels, L => (L > 0 ? C.orange : C.violet),
    (x, y) => Math.hypot(x + 3, y) < 0.35 || (q2 !== 0 && Math.hypot(x - 3, y) < 0.35));
  charge(ctx, sc.X(-3), sc.Y(0), 2, 10); charge(ctx, sc.X(3), sc.Y(0), q2, 10);
  const near = Math.hypot(px + 3, py) < 0.6 || (q2 !== 0 && Math.hypot(px - 3, py) < 0.6);
  dot(ctx, sc.X(px), sc.Y(py), 5, C.text);
  if (near) { $('ro4').textContent = t('tooNear'); return; }
  const x = px * cm, y = py * cm, e = M.field(ch, x, y), V = M.potential(ch, x, y);
  if (e.E > 0) {
    const ux = e.Ex / e.E, uy = e.Ey / e.E, P = [sc.X(px), sc.Y(py)];
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P[0] + uy * 16, P[1] + ux * 16); ctx.lineTo(P[0] - uy * 16, P[1] - ux * 16); ctx.stroke(); ctx.restore();
    arrow(ctx, P[0], P[1], P[0] + ux * 38, P[1] - uy * 38, C.cyan, 3, 10);
    dot(ctx, P[0], P[1], 5, C.text);
  }
  const g = gradCheck(ch, x, y);
  $('ro4').textContent = t('s4readout', { x: px, y: py, V: fmtN(V), E: fmtN(e.E), dv: fx(g.dv, 2), grad: fmtN(g.grad), dvt: fx(g.dvt, 3), W: fx(1e-9 * V * 1e6, 3) });
}
function gradCheck(ch, x, y) {
  const e = M.field(ch, x, y), ux = e.Ex / e.E, uy = e.Ey / e.E, h = 0.001;
  const dv = M.potential(ch, x - ux * h / 2, y - uy * h / 2) - M.potential(ch, x + ux * h / 2, y + uy * h / 2); // centred on P
  const dvt = Math.abs(M.potential(ch, x - uy * h / 2, y + ux * h / 2) - M.potential(ch, x + uy * h / 2, y - ux * h / 2));
  return { dv, grad: dv / h, dvt };
}

/* ---------- step 5: plates from point charges ---------- */
const S5 = { Q: 10 * nC, a: 0.06, gap: 0.04, cache: {} };
function heat(tv) { // 0..1 → dark blue → cyan → white
  const c0 = [13, 22, 33], c1 = [30, 90, 140], c2 = [103, 215, 249], c3 = [240, 250, 255];
  const seg = tv < 0.45 ? [c0, c1, tv / 0.45] : tv < 0.85 ? [c1, c2, (tv - 0.45) / 0.4] : [c2, c3, (tv - 0.85) / 0.15];
  const [a, b, f] = seg; return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, f)))).join(',')})`;
}
function draw5() {
  const N = num('N5'); $('N5v').textContent = N + ' × ' + N;
  const ch = M.plates(N, S5.Q, S5.a, S5.gap);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5a'), 8, 20, W - 16);
  const sc = scene(W, H, 9, 4.6); frame(ctx, sc.box);
  const b = sc.box, cell = 6, lo = Math.log10(2e3), hi = Math.log10(4e5);
  for (let Y = b.y; Y < b.y + b.h; Y += cell) for (let X = b.x; X < b.x + b.w; X += cell) {
    const [x, y] = sc.inv(X + cell / 2, Y + cell / 2), e = M.field(ch, x * cm, y * cm, 0);
    ctx.fillStyle = heat((Math.log10(Math.max(e.E, 1)) - lo) / (hi - lo)); ctx.fillRect(X, Y, Math.min(cell, b.x + b.w - X), Math.min(cell, b.y + b.h - Y));
  }
  const stepA = Math.max(1.5, 34 / sc.s);
  for (let gx = -8; gx <= 8.01; gx += stepA) for (let gy = -4; gy <= 4.01; gy += stepA) {
    if (Math.abs(Math.abs(gy) - 2) < 0.3) continue;
    const e = M.field(ch, gx * cm, gy * cm, 0), ux = e.Ex / e.E, uy = -e.Ey / e.E, X = sc.X(gx), Y = sc.Y(gy);
    arrow(ctx, X - ux * 7, Y - uy * 7, X + ux * 7, Y + uy * 7, '#0a0e14', 1.6, 6, 0.75);
  }
  ctx.save(); ctx.lineWidth = 4;
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(sc.X(-6), sc.Y(2)); ctx.lineTo(sc.X(6), sc.Y(2)); ctx.stroke();
  ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.moveTo(sc.X(-6), sc.Y(-2)); ctx.lineTo(sc.X(6), sc.Y(-2)); ctx.stroke();
  ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.strokeStyle = C.text; ctx.strokeRect(sc.X(-3), sc.Y(1), 6 * sc.s, 2 * sc.s); ctx.restore();
  for (let i = 0; i < N; i++) { const x = -6 + 12 * (i + 0.5) / N; dot(ctx, sc.X(x), sc.Y(2), 4, C.orange); dot(ctx, sc.X(x), sc.Y(-2), 4, C.violet); }
  const st = S5.cache[N] || (S5.cache[N] = M.plateStats(N, S5.Q, S5.a, S5.gap));
  $('ro5').textContent = t('s5readout', { n2: N * N, E0: fmtN(st.E0), dev: fx(100 * st.dev, 1), out: fmtN(st.outside), outp: fx(100 * st.outside / st.E0, 1), ideal: fmtN(st.ideal), ratio: fx(100 * st.ratio, 0) });
}

/* ---------- step 6: electron deflection ---------- */
const S6 = { d: 0.01, L: 0.04, D: 0.08, hist: [] };
function draw6() {
  const U = num('U6'), v0 = num('v6') * 1e7; $('U6v').textContent = U + ' V'; $('v6v').textContent = (v0 / 1e7).toFixed(1);
  const key = U + '|' + v0; if (!S6.hist.includes(key)) { S6.hist.push(key); if (S6.hist.length > 8) S6.hist.shift(); }
  const { ctx, W, H } = fitCanvas($('c6'));
  const G = panel(ctx, W, { top: 40, bottom: H - 28, xMin: -1, xMax: 12.6, yMin: -3, yMax: 3, yTicks: [-3, -2, -1, 0, 1, 2, 3], xTicks: true, xSteps: [1, 2, 4], left: 30, title: t('c6a') });
  const Xc = x => G.x(x / cm), Yc = y => G.y(y / cm);
  ctx.save(); ctx.lineWidth = 5;
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(Xc(0), Yc(S6.d / 2)); ctx.lineTo(Xc(S6.L), Yc(S6.d / 2)); ctx.stroke();
  ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.moveTo(Xc(0), Yc(-S6.d / 2)); ctx.lineTo(Xc(S6.L), Yc(-S6.d / 2)); ctx.stroke();
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(Xc(S6.L + S6.D), G.P.t + 4); ctx.lineTo(Xc(S6.L + S6.D), G.P.b - 4); ctx.stroke();
  ctx.restore();
  const path = (u, v, col, lw, a) => {
    const p = M.deflectPath(u, v, S6.d, S6.L, S6.D);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = a; ctx.beginPath();
    ctx.moveTo(Xc(-0.01), Yc(0)); p.pts.forEach(q => ctx.lineTo(Xc(q[0]), Yc(q[1]))); ctx.stroke(); ctx.restore();
    return p;
  };
  S6.hist.forEach(k => { if (k === key) return; const [u, v] = k.split('|').map(Number); path(u, v, '#4d6680', 1.6, 1); });
  const r = path(U, v0, C.cyan, 2.6, 1);
  if (r.hit) dot(ctx, Xc(r.xHit), Yc(S6.d / 2), 5, C.pink); else dot(ctx, Xc(S6.L + S6.D), Yc(r.Y), 6, C.green);
  const E = U / S6.d, a15 = fx(r.a / 1e15, 3);
  $('ro6').textContent = r.hit ? t('s6hit', { E: fmtN(E), a: a15, xh: fx(r.xHit / cm, 2), gap: fx((S6.L - r.xHit) / cm, 2) })
    : t('s6readout', { E: fmtN(E), a: a15, t: fx(r.tIn * 1e9, 2), y1: fx(r.y1 * 1000, 2), phi: fx(Math.atan(r.tanPhi) * 180 / Math.PI, 1), Y: fx(r.Y * 1000, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  ['q0', 'r0'].forEach(id => $(id).addEventListener('input', draw0));
  ['Q1', 'r1'].forEach(id => $(id).addEventListener('input', draw1));
  ['Q2', 'px2', 'py2'].forEach(id => $(id).addEventListener('input', draw2));
  const pick = ev => {
    if (!S2.sc) return; const c = $('c2'), rc = c.getBoundingClientRect();
    const [x, y] = S2.sc.inv(ev.clientX - rc.left, ev.clientY - rc.top);
    $('px2').value = Math.max(-8, Math.min(8, Math.round(x * 2) / 2)); $('py2').value = Math.max(-5, Math.min(5, Math.round(y * 2) / 2)); draw2();
  };
  $('c2').addEventListener('pointerdown', ev => { pick(ev); $('c2').setPointerCapture(ev.pointerId); });
  $('c2').addEventListener('pointermove', ev => { if (ev.buttons) pick(ev); });
  ['Q31', 'Q32'].forEach(id => $(id).addEventListener('input', draw3));
  ['Q4', 'dV4', 'px4', 'py4'].forEach(id => $(id).addEventListener('input', draw4));
  $('N5').addEventListener('input', draw5);
  ['U6', 'v6'].forEach(id => $(id).addEventListener('input', draw6));
  $('clear6').addEventListener('click', () => { S6.hist = []; draw6(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
