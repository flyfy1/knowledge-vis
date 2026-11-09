'use strict';
// Perimeter vs area lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every shape, number and verdict comes from window.PA_MODEL (model.js). Canvas labels go through a
// small placer that tries a few candidate spots, keeps every label inside the canvas and away from the
// labels already drawn, and shrinks (or leaves out) a label only when nothing fits; numbers stay in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PA_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', grid2: '#2c3b50', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', tri: '#5b6f8a', triEdge: '#c9d5e3', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/\.?0+$/, '') || '0'; };
const f2 = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

function fitCanvas(canvas, heightOf) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h0) canvas.dataset.h0 = canvas.getAttribute('height') || 300;
  const height = Math.round(heightOf ? heightOf(width) : Number(canvas.dataset.h0));
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

// Label placer. put(text, x, y, opts): x, y is the wanted centre (or left edge with align:'left').
// opts.cands: offsets to try in order; opts.within: a box the label must stay inside; opts.bg: plate colour.
function placer(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(p => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    put(text, x, y, o = {}) {
      const cands = o.cands || [[0, 0]], pad = o.pad === undefined ? 2 : o.pad, left = o.align === 'left';
      for (let size = o.size || 12; size >= (o.min || 9); size -= 0.5) {
        ctx.font = `${o.weight || 600} ${size}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        const m = ctx.measureText(text), w = m.width, asc = m.actualBoundingBoxAscent || size * 0.75, desc = m.actualBoundingBoxDescent || size * 0.2;
        if (w + 10 > W) continue;
        for (const [dx, dy] of cands) {
          let cx = x + dx + (left ? w / 2 : 0), cy = y + dy;
          cx = Math.max(w / 2 + 5, Math.min(W - w / 2 - 5, cx));
          cy = Math.max((asc + desc) / 2 + 5, Math.min(H - (asc + desc) / 2 - 5, cy));
          const base = cy + (asc - desc) / 2;
          const b = { x0: cx - w / 2 - pad, x1: cx + w / 2 + pad, y0: base - asc - pad, y1: base + desc + pad };
          if (o.within && (b.x0 < o.within.x0 || b.x1 > o.within.x1 || b.y0 < o.within.y0 || b.y1 > o.within.y1)) continue;
          if (hit(b)) continue;
          if (o.bg) { ctx.save(); ctx.globalAlpha = 0.82; ctx.fillStyle = o.bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 3) : ctx.rect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.fill(); ctx.restore(); }
          ctx.fillStyle = o.color || C.text; ctx.fillText(text, cx, base);
          boxes.push(b); return true;
        }
      }
      return false;
    }
  };
}
const title = (L, text) => L.put(text, 8, 14, { align: 'left', size: 12.5, min: 8 });

const poly = (ctx, pts, fill, stroke, lw = 1.5, dash = null) => {
  ctx.save(); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
  ctx.restore();
};
const line = (ctx, x0, y0, x1, y1, color, lw = 2, dash = null) => {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
};
const dot = (ctx, x, y, r, fill, stroke) => {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
};
// right-angle marker at corner P between unit directions u and v (screen px)
const corner = (ctx, P, u, v, s, color) => {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.beginPath();
  ctx.moveTo(P[0] + u[0] * s, P[1] + u[1] * s); ctx.lineTo(P[0] + (u[0] + v[0]) * s, P[1] + (u[1] + v[1]) * s); ctx.lineTo(P[0] + v[0] * s, P[1] + v[1] * s);
  ctx.stroke(); ctx.restore();
};
const unit = (P, Q) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };

/* ---------- animation runner: respects reduced motion; hidden pages finish at once ---------- */
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

const unitM = v => t('unitM', { v });
const signed = v => (v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '0');
// thick rope along every edge between a filled cell and an empty one; P(x, y) maps a grid corner to px (y up)
function rope(ctx, cells, P, color = C.orange, lw = 3.2) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  cells.forEach(k => {
    const [x, y] = k.split(',').map(Number), has = (i, j) => cells.has(M.key(i, j));
    if (!has(x, y - 1)) { ctx.moveTo(...P(x, y)); ctx.lineTo(...P(x + 1, y)); }
    if (!has(x, y + 1)) { ctx.moveTo(...P(x, y + 1)); ctx.lineTo(...P(x + 1, y + 1)); }
    if (!has(x - 1, y)) { ctx.moveTo(...P(x, y)); ctx.lineTo(...P(x, y + 1)); }
    if (!has(x + 1, y)) { ctx.moveTo(...P(x + 1, y)); ctx.lineTo(...P(x + 1, y + 1)); }
  });
  ctx.stroke(); ctx.restore();
}
function tile(ctx, X, Y, u, color = C.cyan) { ctx.fillStyle = color + '40'; ctx.fillRect(X + 1, Y + 1, u - 2, u - 2); ctx.strokeStyle = color + 'aa'; ctx.lineWidth = 1; ctx.strokeRect(X + 1.5, Y + 1.5, u - 3, u - 3); }

/* ---------- step 0: add a tile, read both ledgers ---------- */
const COLS = 8, ROWS = 6;
const s0 = { cells: M.placed('ell', 2, 1), last: null, log: [] };
function grid0(W, H) { const u = Math.min((W - 40) / COLS, (H - 50) / ROWS, 46); return { u, ox: (W - COLS * u) / 2, oy: 32 + (H - 40 - ROWS * u) / 2 + ROWS * u }; }
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'), w => Math.min(320, Math.min((w - 40) / COLS, 46) * ROWS + 66));
  const L = placer(ctx, W, H); title(L, t('c0title'));
  const { u, ox, oy } = grid0(W, H), P = (x, y) => [ox + x * u, oy - y * u];
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(...P(i, 0)); ctx.lineTo(...P(i, ROWS)); ctx.stroke(); }
  for (let j = 0; j <= ROWS; j++) { ctx.beginPath(); ctx.moveTo(...P(0, j)); ctx.lineTo(...P(COLS, j)); ctx.stroke(); }
  ctx.restore();
  s0.cells.forEach(k => { const [x, y] = k.split(',').map(Number); const [X, Y] = P(x, y + 1); tile(ctx, X, Y, u); });
  rope(ctx, s0.cells, P);
  if (s0.last) { const [X, Y] = P(s0.last.x, s0.last.y + 1); ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(X + 4, Y + 4, u - 8, u - 8); ctx.restore(); }
  const st = M.stats(s0.cells, COLS, ROWS);
  const parts = [];
  if (s0.last) parts.push(t(s0.last.added ? 's0add' : 's0del', { s: s0.last.shared, dP: signed(s0.last.dP) }));
  if (st.holeCells) parts.push(t('s0holes', { h: st.holeCells }));
  if (st.pieces > 1) parts.push(t('s0pieces', { n: st.pieces }));
  $('rd0').textContent = st.area ? t('s0readout', { A: st.area, P: st.perimeter }) : t('s0empty');
  $('rd0b').textContent = parts.join(' ');
  $('log0').innerHTML = s0.log.map(e => `<li>${t('logRow', { op: t(e.added ? 'opAdd' : 'opDel'), dA: signed(e.dA), dP: signed(e.dP), A: e.A, P: e.P })}</li>`).join('');
}
function setShape0(cells) { s0.cells = cells; s0.last = null; s0.log = []; draw0(); }

/* ---------- step 1: one 24 m rope ---------- */
const s1 = { seen: new Set() };
function draw1() {
  const Lh = num('L1'), r = M.rect(Lh, M.ROPE / 2 - Lh);
  s1.seen.add(Lh);
  $('L1v').textContent = Lh;
  let { ctx, W, H } = fitCanvas($('c1'));
  let Lb = placer(ctx, W, H); title(Lb, t('c1a'));
  const u = Math.min((W - 64) / 11, (H - 70) / 11), ox = (W - r.L * u) / 2 + 8, oy = 34 + (H - 62 + r.W * u) / 2;
  const P = (x, y) => [ox + x * u, oy - y * u];
  const cells = new Set(); for (let x = 0; x < r.L; x++) for (let y = 0; y < r.W; y++) cells.add(M.key(x, y));
  cells.forEach(k => { const [x, y] = k.split(',').map(Number); const [X, Y] = P(x, y + 1); tile(ctx, X, Y, u); });
  rope(ctx, cells, P);
  Lb.put(unitM(r.L), ox + r.L * u / 2, oy + 15, { color: C.orange, size: 12, min: 8 });
  Lb.put(unitM(r.W), ox - 8, oy - r.W * u / 2, { color: C.orange, size: 12, min: 8, cands: [[-16, 0], [-24, 0]] });

  ({ ctx, W, H } = fitCanvas($('c1b')));
  Lb = placer(ctx, W, H); title(Lb, t('c1b'));
  const Pl = { l: 36, r: W - 14, t: 34, b: H - 28 };
  const X = v => Pl.l + v / 12 * (Pl.r - Pl.l), Y = v => Pl.b - v / 40 * (Pl.b - Pl.t);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of [0, 10, 20, 30, 40]) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(Pl.l, Y(v)); ctx.lineTo(Pl.r, Y(v)); ctx.stroke(); Lb.put(String(v), Pl.l - 15, Y(v), { weight: 400, size: 11, color: C.muted }); }
  const every = (Pl.r - Pl.l) / 12 >= 22 ? 1 : 2;
  for (let v = 1; v <= 11; v++) if (v % every === 1 % every || v === 6) Lb.put(String(v), X(v), Pl.b + 14, { weight: 400, size: 11, color: v === Lh ? C.text : C.muted });
  ctx.restore();
  const pts = [...s1.seen].sort((a, b) => a - b);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath();
  pts.forEach((v, i) => { const q = [X(v), Y(M.rect(v, 12 - v).area)]; if (i && v - pts[i - 1] === 1) ctx.lineTo(...q); else ctx.moveTo(...q); });
  ctx.stroke(); ctx.restore();
  pts.forEach(v => { if (v !== Lh) dot(ctx, X(v), Y(M.rect(v, 12 - v).area), 4, C.text); });
  dot(ctx, X(Lh), Y(r.area), 6.5, C.cyan);
  Lb.put(String(r.area), X(Lh), Y(r.area) - 14, { color: C.cyan, size: 12, cands: [[0, 0], [16, 0], [-16, 0], [0, 26]] });
  $('rd1').textContent = t('s1readout', { L: r.L, W: r.W, P: r.perimeter, A: r.area }) + (r.L === 6 ? ' ' + t('s1best') : '');
  $('rd1b').textContent = t('s1tried', { k: s1.seen.size, list: pts.map(v => `${v} × ${12 - v} = ${M.rect(v, 12 - v).area}`).join(window.LESSON_I18N.getLang() === 'zh' ? '，' : ', ') });
}

/* ---------- step 2: why the square wins ---------- */
const s2 = { p: 0 };
function draw2() {
  const d = num('d2'), S = M.stretch(d);
  $('d2v').textContent = d;
  const { ctx, W, H } = fitCanvas($('c2'));
  const L = placer(ctx, W, H); title(L, t('c2title', { L: S.L, W: S.W }));
  const u = Math.min((W - 70) / 11, (H - 76) / 6), ox = (W - 11 * u) / 2 + 10, oy = H - 34;
  const P = (x, y) => [ox + x * u, oy - y * u];
  const box = (x0, y0, x1, y1, fill, stroke, dash) => { const [a, b] = P(x0, y1), [c, e] = P(x1, y0); if (fill) { ctx.fillStyle = fill; ctx.fillRect(a, b, c - a, e - b); } if (stroke) { ctx.save(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; if (dash) ctx.setLineDash(dash); ctx.strokeRect(a, b, c - a, e - b); ctx.restore(); } };
  // the rectangle's own tiles (the part shared with the square)
  for (let x = 0; x < 6; x++) for (let y = 0; y < S.W; y++) { const [X, Y] = P(x, y + 1); tile(ctx, X, Y, u); }
  if (d > 0) {
    box(0, S.W, 6, 6, C.pink + '38', C.pink, [5, 4]); // lost strip (outside the rectangle now)
    // gained strip: from [6, 6+d]×[0, W] rotate 90° onto [0, W]×[W, 6]
    const p = s2.p, c0 = [6 + d / 2, S.W / 2], c1 = [S.W / 2, S.W + d / 2], cx = c0[0] + (c1[0] - c0[0]) * p, cy = c0[1] + (c1[1] - c0[1]) * p;
    const [Cx, Cy] = P(cx, cy);
    ctx.save(); ctx.translate(Cx, Cy); ctx.rotate(-p * Math.PI / 2);
    for (let i = 0; i < d; i++) for (let j = 0; j < S.W; j++) { const X = (i - d / 2) * u, Y = (S.W / 2 - j - 1) * u; ctx.fillStyle = C.green + '55'; ctx.fillRect(X + 1, Y + 1, u - 2, u - 2); ctx.strokeStyle = C.green; ctx.lineWidth = 1; ctx.strokeRect(X + 1.5, Y + 1.5, u - 3, u - 3); }
    ctx.restore();
    if (p >= 1) box(S.W, S.W, 6, 6, '#ff5d7333', '#ff5d73');
  }
  box(0, 0, 6, 6, null, C.text, [6, 5]);
  if (d > 0 && s2.p === 0) box(0, 0, S.L, S.W, null, C.cyan);
  L.put(unitM(S.L), ox + S.L * u / 2, oy + 16, { color: C.cyan, size: 12, min: 8 });
  L.put(unitM(S.W), ox - 8, oy - S.W * u / 2, { color: C.cyan, size: 12, min: 8, cands: [[-16, 0], [-24, 0]] });
  if (d > 0 && s2.p >= 1) { const [X, Y] = P(S.W + d / 2, S.W + d / 2); L.put(`${d} × ${d}`, X, Y, { color: '#ff8a9b', size: 12, min: 8, bg: C.bg, within: { x0: X - d * u / 2, x1: X + d * u / 2, y0: Y - d * u / 2, y1: Y + d * u / 2 }, cands: [[0, 0]] }) || L.put(`${d} × ${d}`, X, Y - d * u / 2 - 10, { color: '#ff8a9b', size: 12, min: 8 }); }
  $('move2').disabled = d === 0 || s2.p >= 1;
  $('rd2').textContent = d === 0 ? t('s2zero') : t('s2readout', { d, L: S.L, W: S.W, lost: S.lost, gained: S.gained, corner: S.corner, A: S.area }) + (s2.p >= 1 ? ' ' + t('s2moved', { d }) : '');
}

/* ---------- step 3: fixed area, different ropes ---------- */
const s3 = { A: 24, seen: { 24: new Set(), 36: new Set() } };
function pairs3() { return M.fixedArea(s3.A); }
function draw3() {
  const list = pairs3(), i = Math.min(num('i3'), list.length - 1), r = list[i];
  $('i3').max = list.length - 1;
  s3.seen[s3.A].add(i);
  $('i3v').textContent = `${r.L} × ${r.W}`;
  $('area3').textContent = t(s3.A === 24 ? 'area36' : 'area24'); $('area3').setAttribute('aria-pressed', String(s3.A === 36));
  let { ctx, W, H } = fitCanvas($('c3'));
  let Lb = placer(ctx, W, H); title(Lb, t('c3a', { A: s3.A }));
  const u = Math.min((W - 60) / r.L, (H - 72) / Math.max(r.W, 6), 30), ox = (W - r.L * u) / 2 + 8, oy = 34 + (H - 64 + r.W * u) / 2;
  const P = (x, y) => [ox + x * u, oy - y * u];
  const cells = new Set(); for (let x = 0; x < r.L; x++) for (let y = 0; y < r.W; y++) cells.add(M.key(x, y));
  cells.forEach(k => { const [x, y] = k.split(',').map(Number); const [X, Y] = P(x, y + 1); tile(ctx, X, Y, u); });
  rope(ctx, cells, P);
  Lb.put(unitM(r.L), ox + r.L * u / 2, oy + 15, { color: C.orange, size: 12, min: 8 });
  Lb.put(unitM(r.W), ox - 8, oy - r.W * u / 2, { color: C.orange, size: 12, min: 8, cands: [[-16, 0], [-24, 0], [0, -r.W * u / 2 - 12]] });

  ({ ctx, W, H } = fitCanvas($('c3b')));
  Lb = placer(ctx, W, H); title(Lb, t('c3b'));
  const maxP = list[0].perimeter, x0 = 70, x1 = W - 40, rowH = Math.min(40, (H - 50) / list.length);
  list.forEach((q, j) => {
    const yc = 40 + (j + 0.5) * rowH;
    Lb.put(`${q.L} × ${q.W}`, x0 - 8, yc, { align: 'left', size: 12, min: 8, color: j === i ? C.text : C.muted, cands: [[-56, 0], [-60, 0]] });
    ctx.fillStyle = '#16212e'; ctx.fillRect(x0, yc - rowH * 0.3, x1 - x0, rowH * 0.6);
    if (s3.seen[s3.A].has(j)) {
      const w = q.perimeter / maxP * (x1 - x0);
      ctx.fillStyle = j === i ? C.orange : C.orange + '88'; ctx.fillRect(x0, yc - rowH * 0.3, w, rowH * 0.6);
      Lb.put(String(q.perimeter), x0 + w + 6, yc, { align: 'left', size: 12, min: 8, color: C.orange, cands: [[0, 0], [-34, 0]] });
    }
  });
  const note = i === list.length - 1 ? t('s3min') : i === 0 ? t('s3max') : '';
  $('rd3').textContent = t('s3readout', { L: r.L, W: r.W, A: s3.A, P: r.perimeter, note });
  $('hint3').textContent = t('s3hint', { A: s3.A });
}

/* ---------- step 4: scale up ---------- */
const s4 = { shape: 'rect', seen: { rect: new Set([1]), ell: new Set([1]) } };
function draw4() {
  const k = num('k4'), S = M.scaled(s4.shape, k), base = M.scaled(s4.shape, 1);
  s4.seen[s4.shape].add(k);
  $('k4v').textContent = k;
  $('shapeRect').setAttribute('aria-pressed', String(s4.shape === 'rect')); $('shapeEll').setAttribute('aria-pressed', String(s4.shape === 'ell'));
  const { ctx, W, H } = fitCanvas($('c4'));
  const L = placer(ctx, W, H); title(L, t('c4title', { k }));
  const u = Math.min((W - 50) / 12, (H - 56) / 12), ox = (W - 12 * u) / 2, oy = H - 14;
  const P = (x, y) => [ox + x * u, oy - y * u];
  S.cells.forEach(q => { const [x, y] = q.split(',').map(Number); const [X, Y] = P(x, y + 1); const first = x < k && y < k; tile(ctx, X, Y, u, first ? C.orange : C.cyan); });
  rope(ctx, S.cells, P);
  rope(ctx, base.cells, P, C.text, 1.4);
  ctx.save(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); rope(ctx, base.cells, P, C.bg, 1.4); ctx.restore();
  const ratioP = S.perimeter / base.perimeter, ratioA = S.area / base.area;
  $('rd4').textContent = t('s4readout', { k, P1: base.perimeter, P: S.perimeter, pk: ratioP, A1: base.area, A: S.area, ak: ratioA });
  $('t4').querySelector('tbody').innerHTML = [...s4.seen[s4.shape]].sort((a, b) => a - b).map(q => {
    const Q = M.scaled(s4.shape, q);
    return `<tr${q === k ? ' class="now"' : ''}><td>${q}</td><td>${Q.perimeter}</td><td>${Q.area}</td><td>${Q.perimeter / base.perimeter}</td><td class="hl">${Q.area / base.area}</td></tr>`;
  }).join('');
}

/* ---------- step 5: quiz ---------- */
const s5 = { i: 0, pick: null, score: 0 };
const optText = o => (o[0] === '@' ? t(o.slice(1)) : o);
function renderQuiz() {
  const Q = M.QUIZ[s5.i];
  $('quizProg').textContent = t('qProgress', { i: s5.i + 1, n: M.QUIZ.length, k: s5.score });
  $('quizQ').textContent = t(Q.id);
  const box = $('quizOpts');
  if (box.dataset.q !== String(s5.i)) {
    box.dataset.q = String(s5.i);
    box.innerHTML = Q.options.map((o, j) => `<button class="btn" type="button" data-step="5" data-opt="${j}"></button>`).join('');
    box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick5(Number(b.dataset.opt))));
  }
  box.querySelectorAll('button').forEach(b => { const j = Number(b.dataset.opt); b.textContent = optText(Q.options[j]); b.disabled = s5.pick !== null; b.classList.toggle('picked', s5.pick === j); });
  const fb = $('quizFeedback');
  if (s5.pick === null) { fb.textContent = ''; fb.className = 'quiz-feedback'; }
  else { const ok = s5.pick === Q.answer; fb.textContent = t(ok ? 'qOk' : 'qNo', { why: t(Q.id + 'why') }); fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'no'); }
  $('qNext').disabled = s5.pick === null;
  $('qNext').textContent = t(s5.i === M.QUIZ.length - 1 && s5.pick !== null ? 'qRestart' : 'qNext');
}
function pick5(j) { if (s5.pick !== null) return; s5.pick = j; if (j === M.QUIZ[s5.i].answer) s5.score++; renderQuiz(); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); renderQuiz(); }

function setup() {
  const c0 = $('c0'); c0.classList.add('tappable');
  c0.addEventListener('click', e => {
    const rect = c0.getBoundingClientRect(), g = grid0(rect.width, rect.height);
    const x = Math.floor((e.clientX - rect.left - g.ox) / g.u), y = Math.floor((g.oy - (e.clientY - rect.top)) / g.u);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    const r = M.toggle(s0.cells, x, y);
    s0.cells = r.cells; s0.last = { x, y, ...r };
    const st = M.stats(s0.cells, COLS, ROWS);
    s0.log = [{ added: r.added, dA: r.dA, dP: r.dP, A: st.area, P: st.perimeter }, ...s0.log].slice(0, 5);
    draw0();
  });
  $('pLine').addEventListener('click', () => setShape0(M.placed('line', 1, 2)));
  $('pBlock').addEventListener('click', () => setShape0(M.placed('block', 2, 2)));
  $('pEll').addEventListener('click', () => setShape0(M.placed('ell', 2, 1)));
  $('pRing').addEventListener('click', () => setShape0(M.placed('ring', 2, 1)));
  $('clear0').addEventListener('click', () => setShape0(new Set()));

  $('L1').addEventListener('input', draw1);

  $('d2').addEventListener('input', () => { stopAnim('s2'); s2.p = 0; draw2(); });
  $('move2').addEventListener('click', () => { if (num('d2') === 0 || s2.p >= 1 || anims.s2) return; animate('s2', 1100, p => { s2.p = p; draw2(); }); });
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.p = 0; draw2(); });

  $('i3').addEventListener('input', draw3);
  $('area3').addEventListener('click', () => { s3.A = s3.A === 24 ? 36 : 24; $('i3').max = pairs3().length - 1; $('i3').value = 0; draw3(); });

  $('k4').addEventListener('input', draw4);
  $('shapeRect').addEventListener('click', () => { s4.shape = 'rect'; draw4(); });
  $('shapeEll').addEventListener('click', () => { s4.shape = 'ell'; draw4(); });

  $('qNext').addEventListener('click', () => {
    if (s5.pick === null) return;
    if (s5.i === M.QUIZ.length - 1) { s5.i = 0; s5.score = 0; } else s5.i++;
    s5.pick = null; renderQuiz();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
