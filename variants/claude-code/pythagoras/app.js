'use strict';
// Pythagorean theorem lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every shape, number and verdict comes from window.PYTH_MODEL (model.js). Canvas labels go through a
// small placer that tries a few candidate spots, keeps every label inside the canvas and away from the
// labels already drawn, and shrinks (or leaves out) a label only when nothing fits; numbers stay in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PYTH_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', grid2: '#2c3b50', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', tri: '#5b6f8a', triEdge: '#c9d5e3', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
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

/* ---------- step 0: walk round the corner vs the straight line ---------- */
const s0 = { rows: [] };
function remember0(a, b) { s0.rows = [[a, b], ...s0.rows.filter(r => r[0] !== a || r[1] !== b)].slice(0, 8); }
function draw0() {
  const a = num('a0'), b = num('b0'), w = M.walk(a, b);
  $('a0v').textContent = a; $('b0v').textContent = b;
  const { ctx, W, H } = fitCanvas($('c0'), w => Math.min(340, (w - 56) / 9 * 8.4 + 70));
  const L = placer(ctx, W, H); title(L, t('c0title'));
  const u = Math.min((W - 56) / 9, (H - 64) / 8.4), ox = (W - 9 * u) / 2 + 4, oy = H - 34;
  const P = (x, y) => [ox + x * u, oy - y * u];
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let i = 0; i <= 9; i++) { ctx.beginPath(); ctx.moveTo(...P(i, 0)); ctx.lineTo(...P(i, 8)); ctx.stroke(); }
  for (let j = 0; j <= 8; j++) { ctx.beginPath(); ctx.moveTo(...P(0, j)); ctx.lineTo(...P(9, j)); ctx.stroke(); }
  ctx.restore();
  const O = P(0, 0), K = P(a, 0), E = P(a, b);
  line(ctx, ...O, ...K, C.orange, 3.5); line(ctx, ...K, ...E, C.orange, 3.5);
  corner(ctx, K, unit(K, O), unit(K, E), Math.min(12, u * 0.4), C.orange);
  line(ctx, ...O, ...E, C.cyan, 3.5);
  // ruler ticks: one per unit of length along c
  const d = unit(O, E), n = [-d[1], d[0]];
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.3;
  for (let k = 1; k < w.c; k++) { const X = O[0] + d[0] * k * u, Y = O[1] + d[1] * k * u; ctx.beginPath(); ctx.moveTo(X - n[0] * 5, Y - n[1] * 5); ctx.lineTo(X + n[0] * 5, Y + n[1] * 5); ctx.stroke(); }
  ctx.restore();
  dot(ctx, ...O, 4.5, C.text); dot(ctx, ...E, 4.5, C.text);
  L.reserve(O[0] - 6, O[1] - 6, O[0] + 6, O[1] + 6); L.reserve(E[0] - 6, E[1] - 6, E[0] + 6, E[1] + 6);
  L.put(`a = ${a}`, (O[0] + K[0]) / 2, O[1] + 16, { color: C.orange, cands: [[0, 0], [0, -16]] });
  L.put(`b = ${b}`, K[0] + 8, (K[1] + E[1]) / 2, { color: C.orange, align: 'left', cands: [[0, 0], [-60, 0]] });
  const mx = (O[0] + E[0]) / 2, my = (O[1] + E[1]) / 2, off = [n[0] * 18, n[1] * 18]; // n points up-left of O→E
  L.put(`c ≈ ${f2(w.c)}`, mx + off[0], my + off[1], { color: C.cyan, bg: C.bg, cands: [[0, 0], [n[0] * 12, n[1] * 12], [n[0] * 26, n[1] * 26], [-off[0] * 2, -off[1] * 2]] });
  $('r0').textContent = t('s0readout', { a, b, sum: w.around, c: f2(w.c), save: f2(w.saving), a2: w.a2, b2: w.b2, c2: f2(w.c2) });
  $('t0').querySelector('tbody').innerHTML = s0.rows.map(([p, q]) => {
    const r = M.walk(p, q), now = p === a && q === b;
    return `<tr${now ? ' class="now"' : ''}><td>${p}</td><td>${q}</td><td>${r.around}</td><td>${f2(r.c)}</td><td>${r.a2}</td><td>${r.b2}</td><td class="hl">${f2(r.c2)}</td></tr>`;
  }).join('');
}

/* ---------- step 1: the hinge ---------- */
const TH = { min: 30, max: 150 };
const s1 = { seen: new Uint8Array(TH.max - TH.min + 1), last: null };
function mark1(deg) {
  const i = deg - TH.min, j = s1.last === null ? i : s1.last;
  for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s1.seen[q] = 1;
  s1.last = i;
}
function clear1() { s1.seen.fill(0); s1.last = null; mark1(num('th1')); }
function draw1() {
  const a = num('a1'), b = num('b1'), deg = num('th1'), h = M.hinge(a, b, deg);
  $('a1v').textContent = a; $('b1v').textContent = b; $('th1v').textContent = deg + '°';
  let { ctx, W, H } = fitCanvas($('c1'));
  let L = placer(ctx, W, H); title(L, t('c1a'));
  const pts = [...h.sqA, ...h.sqB, ...h.sqC];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((W - 24) / (x1 - x0), (H - 40) / (y1 - y0));
  const cx = (W - (x1 - x0) * k) / 2, cy = 28 + (H - 36 - (y1 - y0) * k) / 2;
  const S = p => [cx + (p[0] - x0) * k, cy + (y1 - p[1]) * k];
  const sq = (Q, col) => poly(ctx, Q.map(S), col + '33', col, 2);
  sq(h.sqA, C.orange); sq(h.sqB, C.green); sq(h.sqC, C.cyan);
  poly(ctx, h.tri.map(S), 'rgba(232,237,244,0.10)', C.text, 2.2);
  // angle mark at C
  const Cp = S(h.tri[0]), r = Math.min(26, k * 0.6), th = deg * Math.PI / 180;
  ctx.save(); ctx.strokeStyle = deg === 90 ? C.text : C.pink; ctx.lineWidth = 2;
  if (deg === 90) corner(ctx, Cp, [1, 0], [0, -1], r * 0.6, C.text);
  else { ctx.beginPath(); ctx.arc(Cp[0], Cp[1], r, -th, 0); ctx.stroke(); }
  ctx.restore();
  const label = (Q, text, col) => {
    const c = Q.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]), P = S(c), half = Math.hypot(Q[1][0] - Q[0][0], Q[1][1] - Q[0][1]) * k * 0.36;
    L.put(text, P[0], P[1], { color: col, within: { x0: P[0] - half, x1: P[0] + half, y0: P[1] - half, y1: P[1] + half }, size: 13, min: 9 });
  };
  label(h.sqA, `a² = ${a * a}`, C.orange); label(h.sqB, `b² = ${b * b}`, C.green); label(h.sqC, `c² ≈ ${f2(h.c2)}`, C.cyan);
  const bis = [Math.cos(th / 2), -Math.sin(th / 2)];
  L.put('θ', Cp[0] + bis[0] * (r + 10), Cp[1] + bis[1] * (r + 10), { color: deg === 90 ? C.text : C.pink, cands: [[0, 0], [bis[0] * 8, bis[1] * 8]] });

  ({ ctx, W, H } = fitCanvas($('c1b')));
  L = placer(ctx, W, H); title(L, t('c1b'));
  const yMax = Math.ceil(M.c2At(a, b, TH.max) * 1.08 / 20) * 20;
  const P = { l: 40, r: W - 14, t: 34, b: H - 30 };
  const X = v => P.l + (v - TH.min) / (TH.max - TH.min) * (P.r - P.l), Y = v => P.b - v / yMax * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  const yStep = yMax > 120 ? 40 : 20;
  for (let v = 0; v <= yMax; v += yStep) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); L.put(String(v), P.l - 18, Y(v), { weight: 400, size: 11, color: C.muted }); }
  for (let v = 30; v <= 150; v += 30) { ctx.strokeStyle = v === 90 ? C.axis : C.grid; ctx.setLineDash(v === 90 ? [4, 4] : []); ctx.beginPath(); ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), P.b); ctx.stroke(); L.put(v + '°', X(v), P.b + 15, { weight: 400, size: 11, color: C.muted }); }
  ctx.restore();
  line(ctx, P.l, Y(h.sum), P.r, Y(h.sum), C.orange, 2.4);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.6; ctx.beginPath(); let pen = false;
  s1.seen.forEach((on, i) => { if (!on) { pen = false; return; } const v = TH.min + i, q = [X(v), Y(M.c2At(a, b, v))]; if (pen) ctx.lineTo(...q); else { ctx.moveTo(...q); pen = true; } });
  ctx.stroke(); ctx.restore();
  if (s1.seen[90 - TH.min]) dot(ctx, X(90), Y(h.sum), 6, null, C.text);
  dot(ctx, X(deg), Y(h.c2), 5.5, C.cyan);
  L.put(`a² + b² = ${h.sum}`, P.r - 4, Y(h.sum) - 12, { color: C.orange, cands: [[-50, 0], [-50, 26], [-(P.r - P.l) / 2, 0], [-(P.r - P.l) / 2, 26]] });
  const d = Math.abs(h.diff);
  const verdict = h.verdict === 'eq' ? t('s1eq') : t(h.verdict === 'gt' ? 's1gt' : 's1lt', { d: f2(d) });
  $('r1').textContent = t('s1readout', { deg, a2: a * a, b2: b * b, sum: h.sum, c: f2(h.c), c2: f2(h.c2), verdict });
}

/* ---------- step 2: the two layouts ---------- */
const ORDER = [0, 2, 3]; // T1, T3, T4 slide; T2 stays
const s2 = { k: 0, p: 0 };
function frameLayout(W) {
  const side = W >= 560;
  const F = side ? Math.min((W - 3 * 34) / 2, 300) : Math.min(W - 56, 300);
  return { side, F, H: side ? F + 70 : 2 * F + 132 };
}
function draw2() {
  const a = num('a2'), b = num('b2'), fr = M.frame(a, b);
  $('a2v').textContent = fmt(a, 1); $('b2v').textContent = fmt(b, 1);
  const lay = frameLayout(Math.max(240, $('c2').clientWidth || 600));
  const { ctx, W, H } = fitCanvas($('c2'), w => frameLayout(w).H);
  const L = placer(ctx, W, H);
  const k = lay.F / fr.s;
  const boxes = lay.side
    ? [{ x: (W - 2 * lay.F - 34) / 2 + 10, y: 36 }, { x: (W - 2 * lay.F - 34) / 2 + lay.F + 44, y: 36 }]
    : [{ x: (W - lay.F) / 2 + 8, y: 36 }, { x: (W - lay.F) / 2 + 8, y: lay.F + 36 + 66 }];
  const titles = [t('c2a'), t('c2b')];
  const done = s2.k === 3;
  boxes.forEach((B, idx) => {
    const S = p => [B.x + p[0] * k, B.y + (fr.s - p[1]) * k];
    L.put(titles[idx], B.x + lay.F / 2, B.y - 14, { size: 12.5, min: 8 });
    ctx.fillStyle = '#0a1018'; ctx.fillRect(B.x, B.y, lay.F, lay.F);
    if (idx === 0) poly(ctx, fr.holeA.map(S), C.cyan + '55', C.cyan, 2);
    // progress of each triangle in the right frame (1 = already moved); ghosts of moved ones stay as history
    const prog = i => { const order = idx === 1 ? ORDER.indexOf(i) : -1; return order < 0 ? 0 : order < s2.k ? 1 : order === s2.k ? s2.p : 0; };
    if (idx === 1) fr.A.forEach((T, i) => { if (prog(i) > 0) poly(ctx, T.map(S), null, C.ghost, 1.3, [4, 4]); });
    if (idx === 1 && done) { poly(ctx, fr.holesB[0].map(S), C.orange + '66', C.orange, 2); poly(ctx, fr.holesB[1].map(S), C.green + '66', C.green, 2); }
    fr.A.forEach((T, i) => poly(ctx, M.lerpPos(T, fr.moves[i], prog(i)).map(S), C.tri, C.triEdge, 1.5));
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(B.x, B.y, lay.F, lay.F); ctx.restore();
    // leg marks under the bottom edge and left of the left edge (same for both layouts: a then b)
    const by = B.y + lay.F;
    const tick = (x0, x1, txt) => { line(ctx, x0 + 2, by + 7, x1 - 2, by + 7, C.muted, 1.2); L.put(txt, (x0 + x1) / 2, by + 20, { color: C.muted, size: 12, min: 9 }); };
    tick(B.x, B.x + a * k, 'a'); tick(B.x + a * k, B.x + fr.s * k, 'b');
    const vt = (y0, y1, txt) => { line(ctx, B.x - 7, y0 + 2, B.x - 7, y1 - 2, C.muted, 1.2); L.put(txt, B.x - 17, (y0 + y1) / 2, { color: C.muted, size: 12, min: 9 }); };
    if (idx === 0) { vt(by - b * k, by, 'b'); vt(B.y, by - b * k, 'a'); } else { vt(by - a * k, by, 'a'); vt(B.y, by - a * k, 'b'); }
    const inBox = (P, half) => ({ x0: P[0] - half, x1: P[0] + half, y0: P[1] - half, y1: P[1] + half });
    if (idx === 0) { const P = S([fr.s / 2, fr.s / 2]); L.put(`c² = ${fmt(fr.holeAArea)}`, P[0], P[1], { color: C.cyan, within: inBox(P, fr.c * k * 0.36), size: 13 }); }
    if (idx === 1 && done) {
      const Pa = S([a / 2, a / 2]), Pb = S([a + b / 2, a + b / 2]);
      L.put(`a² = ${fmt(a * a)}`, Pa[0], Pa[1], { color: C.orange, within: inBox(Pa, a * k * 0.48), size: 13 });
      L.put(`b² = ${fmt(b * b)}`, Pb[0], Pb[1], { color: C.green, within: inBox(Pb, b * k * 0.48), size: 13 });
    }
  });
  if (!lay.side) line(ctx, 12, lay.F + 36 + 30, W - 12, lay.F + 36 + 30, C.grid2, 1);
  $('move2').disabled = s2.k >= 3;
  const prog = s2.k < 3 ? t('s2progress', { k: s2.k }) : '';
  $('r2').textContent = t('s2readout', { prog, frame: fmt(fr.frameArea), a: fmt(a, 1), b: fmt(b, 1), tris: fmt(4 * fr.triArea), hA: fmt(fr.holeAArea), c: f2(fr.c), a2: fmt(a * a), b2: fmt(b * b), hB: fmt(a * a + b * b) });
}

/* ---------- step 3: distance on a grid ---------- */
const AX = 2, AY = 1, GX = 10, GY = 7;
const s3 = { trail: new Map() };
const FIVE = []; for (let x = 0; x <= GX; x++) for (let y = 0; y <= GY; y++) if (M.distance(AX, AY, x, y).d2 === 25) FIVE.push(x + ',' + y);
function grid3(W, H) { const u = Math.min((W - 52) / GX, (H - 58) / GY); return { u, ox: (W - GX * u) / 2 + 10, oy: H - 30 }; }
function draw3() {
  const x = num('bx3'), y = num('by3'), r = M.distance(AX, AY, x, y);
  $('bx3v').textContent = x; $('by3v').textContent = y;
  s3.trail.set(x + ',' + y, r);
  const { ctx, W, H } = fitCanvas($('c3'), w => Math.min(360, (w - 52) / GX * GY + 64));
  const L = placer(ctx, W, H); title(L, t('c3title'));
  const { u, ox, oy } = grid3(W, H), P = (i, j) => [ox + i * u, oy - j * u];
  ctx.save(); ctx.lineWidth = 1;
  const every = u >= 24 ? 1 : 2;
  for (let i = 0; i <= GX; i++) { ctx.strokeStyle = i ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(...P(i, 0)); ctx.lineTo(...P(i, GY)); ctx.stroke(); if (i % every === 0) L.put(String(i), P(i, 0)[0], oy + 15, { weight: 400, size: 11, color: C.muted }); }
  for (let j = 0; j <= GY; j++) { ctx.strokeStyle = j ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(...P(0, j)); ctx.lineTo(...P(GX, j)); ctx.stroke(); if (j % every === 0 && j) L.put(String(j), ox - 13, P(0, j)[1], { weight: 400, size: 11, color: C.muted }); }
  ctx.restore();
  s3.trail.forEach((q, key) => { const [i, j] = key.split(',').map(Number); if (i === x && j === y) return; const Q = P(i, j); if (q.whole && q.d > 0) dot(ctx, ...Q, 4, C.cyan); else dot(ctx, ...Q, 3.2, null, C.ghost); });
  const A = P(AX, AY), K = P(x, AY), B = P(x, y);
  if (r.d > 0) {
    if (r.dx) line(ctx, ...A, ...K, C.green, 3);
    if (r.dy) line(ctx, ...K, ...B, C.green, 3);
    if (r.dx && r.dy) corner(ctx, K, unit(K, A), unit(K, B), Math.min(10, u * 0.35), C.green);
    line(ctx, ...A, ...B, C.cyan, 3);
  }
  dot(ctx, ...A, 6, C.text); dot(ctx, ...B, 6, C.orange);
  [A, B].forEach(Q => L.reserve(Q[0] - 7, Q[1] - 7, Q[0] + 7, Q[1] + 7));
  // letters sit on the far side of each point from the other point, so they never sit on the segment
  const away = (P0, P1) => { const d = r.d > 0 ? unit(P1, P0) : [-0.7, 0.7]; return [[d[0] * 16, d[1] * 16], [d[0] * 16 - d[1] * 12, d[1] * 16 + d[0] * 12], [d[0] * 16 + d[1] * 12, d[1] * 16 - d[0] * 12], [-14, -14], [14, -14]]; };
  L.put('A', A[0], A[1], { cands: away(A, B), size: 13 });
  L.put('B', B[0], B[1], { color: C.orange, cands: r.d > 0 ? away(B, A) : [[14, -14], [14, 14]], size: 13 });
  if (r.d > 0) {
    const below = y >= AY ? 1 : -1;
    if (r.dx) L.put(`Δx = ${r.dx}`, (A[0] + K[0]) / 2, A[1], { color: C.green, bg: C.bg, cands: [[0, 16 * below], [0, -16 * below], [0, 30 * below]] });
    const rightSide = x >= AX ? 1 : -1;
    if (r.dy) L.put(`Δy = ${r.dy}`, K[0], (K[1] + B[1]) / 2, { color: C.green, bg: C.bg, cands: [[34 * rightSide, 0], [-34 * rightSide, 0], [50 * rightSide, 0], [0, 0]] });
    const n = unit(A, B), nn = [n[1], -n[0]], s = (nn[0] * (K[0] - A[0]) + nn[1] * (K[1] - A[1])) > 0 ? -1 : 1; // away from the corner
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, txt = r.whole ? `d = ${Math.round(r.d)}` : `d ≈ ${f2(r.d)}`;
    L.put(txt, mx, my, { color: C.cyan, bg: C.bg, size: 13, cands: [[nn[0] * 16 * s, nn[1] * 16 * s], [nn[0] * 30 * s, nn[1] * 30 * s], [nn[0] * 46 * s, nn[1] * 46 * s], [-nn[0] * 18 * s, -nn[1] * 18 * s], [0, 0]] });
  }
  const dv = r.whole ? t('s3whole', { d: Math.round(r.d) }) : t('s3approx', { d: f2(r.d) });
  $('r3').textContent = r.d === 0 ? t('s3same') : t('s3readout', { x, y, dx: r.dx, dy: r.dy, d2: r.d2, dv });
  const found = FIVE.filter(k => s3.trail.has(k)).length;
  $('r3b').textContent = t('s3five', { k: found, n: FIVE.length });
}

/* ---------- step 4: classify from three sides ---------- */
const s4 = { i: 0, answer: null, n: 0, k: 0 };
function draw4() {
  const p = num('p4'), q = num('q4'), s = num('s4'), r = M.classify(p, q, s);
  $('p4v').textContent = p; $('q4v').textContent = q; $('s4v').textContent = s;
  const { ctx, W, H } = fitCanvas($('c4'));
  const L = placer(ctx, W, H); title(L, t('c4title'));
  if (!r.ok) {
    const k = Math.min((W - 60) / r.c, 40), x0 = (W - r.c * k) / 2, y0 = H - 70;
    line(ctx, x0, y0, x0 + r.c * k, y0, C.cyan, 3);
    line(ctx, x0, y0 - 26, x0 + r.a * k, y0 - 26, C.cyan, 3);
    line(ctx, x0 + r.c * k, y0 - 44, x0 + r.c * k - r.b * k, y0 - 44, C.cyan, 3);
    if (r.gap > 0) { ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.25)'; ctx.fillRect(x0 + r.a * k, y0 - 50, r.gap * k, 30); ctx.restore(); }
    L.put(`c = ${r.c}`, x0 + r.c * k / 2, y0 + 18, { color: C.cyan });
    L.put(`${r.a}`, x0 + r.a * k / 2, y0 - 38, { color: C.cyan, cands: [[0, 0], [0, 8]] });
    L.put(`${r.b}`, x0 + r.c * k - r.b * k / 2, y0 - 56, { color: C.cyan, cands: [[0, 0], [0, -8]] });
    $('r4').textContent = t('s4bad', { a: r.a, b: r.b, s: r.a + r.b, c: r.c });
    return;
  }
  const T = M.layout(r.a, r.b, r.c);
  const k = Math.min((W - 90) / r.c, (H - 96) / Math.max(T[2][1], 0.5));
  const ox = (W - r.c * k) / 2, oy = H - 42;
  const S = pt => [ox + pt[0] * k, oy - pt[1] * k];
  const A = S(T[0]), B = S(T[1]), Ap = S(T[2]);
  poly(ctx, [A, B, Ap], 'rgba(103,215,249,0.10)', C.cyan, 3);
  const u1 = unit(Ap, A), u2 = unit(Ap, B), rad = Math.min(30, Math.hypot(Ap[0] - A[0], Ap[1] - A[1]) * 0.3, Math.hypot(Ap[0] - B[0], Ap[1] - B[1]) * 0.3);
  // angle at the apex (orange arc) and a 90° reference centred on the same bisector (dashed)
  const g1 = Math.atan2(u1[1], u1[0]), g2 = Math.atan2(u2[1], u2[0]);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(Ap[0], Ap[1], rad, Math.min(g1, g2), Math.max(g1, g2)); ctx.stroke(); ctx.restore();
  const mid = (g1 + g2) / 2, ref = rad * 1.6;
  if (r.kind !== 'right') { [mid - Math.PI / 4, mid + Math.PI / 4].forEach(g => line(ctx, Ap[0], Ap[1], Ap[0] + Math.cos(g) * ref, Ap[1] + Math.sin(g) * ref, C.ghost, 1.4, [4, 4])); }
  else corner(ctx, Ap, u1, u2, Math.min(14, rad * 0.6), C.orange);
  dot(ctx, ...A, 3.5, C.cyan); dot(ctx, ...B, 3.5, C.cyan); dot(ctx, ...Ap, 3.5, C.cyan);
  L.put(`c = ${r.c}`, (A[0] + B[0]) / 2, oy + 17, { color: C.cyan, cands: [[0, 0], [0, 8]] });
  const outward = (P0, P1) => { const m = [(P0[0] + P1[0]) / 2, (P0[1] + P1[1]) / 2], d = unit(P0, P1); let nrm = [d[1], -d[0]]; const cen = [(A[0] + B[0] + Ap[0]) / 3, (A[1] + B[1] + Ap[1]) / 3]; if ((cen[0] - m[0]) * nrm[0] + (cen[1] - m[1]) * nrm[1] > 0) nrm = [-nrm[0], -nrm[1]]; return { m, nrm }; };
  const sb = outward(A, Ap), sa = outward(Ap, B);
  L.put(`b = ${r.b}`, sb.m[0], sb.m[1], { color: C.cyan, cands: [18, 30, 44].map(d => [sb.nrm[0] * d, sb.nrm[1] * d]) });
  L.put(`a = ${r.a}`, sa.m[0], sa.m[1], { color: C.cyan, cands: [18, 30, 44].map(d => [sa.nrm[0] * d, sa.nrm[1] * d]) });
  const into = [Math.cos(mid), Math.sin(mid)];
  L.put(`≈ ${r.maxAngle.toFixed(1)}°`, Ap[0] + into[0] * (rad + 16), Ap[1] + into[1] * (rad + 16), { color: C.orange, bg: C.bg, cands: [[0, 0], [into[0] * 14, into[1] * 14], [0, -2 * rad - 30], [into[0] * 30, into[1] * 30]] });
  const cmp = r.kind === 'right' ? t('cmpEq') : t(r.kind === 'obtuse' ? 'cmpGt' : 'cmpLt', { d: Math.abs(r.diff) });
  const kind = t({ right: 'kindRight', acute: 'kindAcute', obtuse: 'kindObtuse' }[r.kind]);
  $('r4').textContent = t('s4readout', { c: r.c, c2: r.c2, a: r.a, b: r.b, sum: r.sum, cmp, kind, ang: r.maxAngle.toFixed(1) });
}
function renderQuiz() {
  const Q = M.QUIZ[s4.i], r = M.classify(...Q);
  $('quizQ').textContent = t('quizQ', { i: s4.i + 1, n: M.QUIZ.length, a: Q[0], b: Q[1], c: Q[2] });
  const ids = { right: 'qRight', acute: 'qAcute', obtuse: 'qObtuse' };
  Object.entries(ids).forEach(([kind, id]) => { $(id).disabled = s4.answer !== null; $(id).classList.toggle('picked', s4.answer === kind); });
  const fb = $('quizFeedback');
  if (s4.answer === null) { fb.textContent = ''; fb.className = 'quiz-feedback'; }
  else {
    const why = t('qWhy', { c: r.c, c2: r.c2, a: r.a, b: r.b, sum: r.sum });
    const ok = s4.answer === r.kind;
    fb.textContent = ok ? t('qOk', { why }) : t('qNo', { kind: t({ right: 'kindRight', acute: 'kindAcute', obtuse: 'kindObtuse' }[r.kind]), why });
    fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'no');
  }
  const last = s4.i === M.QUIZ.length - 1;
  $('qNext').textContent = t(last && s4.answer !== null ? 'qRestart' : 'qNext');
  $('qNext').disabled = s4.answer === null;
  $('quizScore').textContent = t('qScore', { n: s4.n, k: s4.k });
}
function answer4(kind) {
  if (s4.answer !== null) return;
  const Q = M.QUIZ[s4.i], r = M.classify(...Q);
  s4.answer = kind; s4.n++; if (kind === r.kind) s4.k++;
  $('p4').value = Q[0]; $('q4').value = Q[1]; $('s4').value = Q[2];
  draw4(); renderQuiz();
}

/* ---------- step 5: whole-number hypotenuses ---------- */
const N5 = 20, LIT = M.wholeGrid(N5);
const s5 = { rays: false };
function grid5(W, H) { const u = Math.min((W - 54) / N5, (H - 62) / N5); return { u, ox: (W - N5 * u) / 2 + 12, oy: H - 30 }; }
function draw5() {
  const a = num('a5'), b = num('b5'), s = a * a + b * b, c = Math.sqrt(s);
  $('a5v').textContent = a; $('b5v').textContent = b;
  const { ctx, W, H } = fitCanvas($('c5'), w => Math.min(460, Math.max(300, w * 0.62 + 120)));
  const L = placer(ctx, W, H); title(L, t('c5title'));
  const { u, ox, oy } = grid5(W, H), P = (i, j) => [ox + i * u, oy - j * u];
  ctx.save(); ctx.lineWidth = 1;
  for (let i = 0; i <= N5; i += 5) {
    ctx.strokeStyle = i ? C.grid : C.axis;
    ctx.beginPath(); ctx.moveTo(...P(i, 0)); ctx.lineTo(...P(i, N5)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(...P(0, i)); ctx.lineTo(...P(N5, i)); ctx.stroke();
    L.put(String(i), P(i, 0)[0], oy + 15, { weight: 400, size: 11, color: C.muted });
    if (i) L.put(String(i), ox - 14, P(0, i)[1], { weight: 400, size: 11, color: C.muted });
  }
  ctx.restore();
  L.put('a →', P(N5, 0)[0] - 4, oy + 15, { size: 11, color: C.muted, cands: [[-30, 0], [-50, 0]] });
  if (s5.rays) {
    const prims = LIT.filter(([p, q]) => M.gcd(p, q) === 1);
    prims.forEach(([p, q]) => { const f = N5 / Math.max(p, q); line(ctx, ...P(0, 0), ...P(p * f, q * f), C.orange, 1.6); });
  }
  const litSet = new Set(LIT.map(([p, q]) => p + ',' + q));
  for (let i = 1; i <= N5; i++) for (let j = 1; j <= N5; j++) {
    if (litSet.has(i + ',' + j)) dot(ctx, ...P(i, j), Math.max(3, u * 0.3), C.cyan);
    else dot(ctx, ...P(i, j), Math.max(1.2, u * 0.08), '#3a4a5e');
  }
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(...P(a, b), Math.max(6, u * 0.48), 0, 7); ctx.stroke(); ctx.restore();
  let res;
  if (M.isSquare(s)) {
    const [pa, pb, g] = M.primitive(a, b);
    res = g > 1 ? t('s5whole', { s, c: Math.round(c), pa, pb, pc: Math.round(c) / g, k: g }) : t('s5wholePrim', { s, c: Math.round(c), a, b });
  } else res = t('s5not', { s, c: c.toFixed(3) });
  $('r5').textContent = t('s5readout', { a, b, s, res, n: LIT.length });
  const q = num('q5'), fr = M.sqrt2Fractions(12)[q - 1];
  $('q5v').textContent = q;
  $('r5b').textContent = t('s5sqrt2', { q, p: fr.p, p2: fr.p * fr.p, tq2: 2 * q * q, miss: Math.abs(fr.miss) });
}
function tapGrid(canvas, gridOf, nx, ny, minX, minY, setXY) {
  canvas.classList.add('tappable');
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect(), W = rect.width, H = rect.height, g = gridOf(W, H);
    const i = Math.round((e.clientX - rect.left - g.ox) / g.u), j = Math.round((g.oy - (e.clientY - rect.top)) / g.u);
    if (i >= minX && i <= nx && j >= minY && j <= ny) setXY(i, j);
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); renderQuiz(); draw5(); }

function setup() {
  remember0(3, 4);
  ['a0', 'b0'].forEach(id => $(id).addEventListener('input', () => { remember0(num('a0'), num('b0')); draw0(); }));
  $('clear0').addEventListener('click', () => { s0.rows = []; remember0(num('a0'), num('b0')); draw0(); });

  mark1(num('th1'));
  $('th1').addEventListener('input', () => { stopAnim('s1'); mark1(num('th1')); draw1(); });
  ['a1', 'b1'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); clear1(); draw1(); }));
  $('snap1').addEventListener('click', () => {
    const from = num('th1');
    animate('s1', Math.abs(90 - from) * 12, p => { $('th1').value = Math.round(from + (90 - from) * p); mark1(num('th1')); draw1(); });
  });

  $('move2').addEventListener('click', () => {
    if (s2.k >= 3 || anims.s2) return;
    animate('s2', 900, p => { s2.p = p; draw2(); }, () => { s2.k++; s2.p = 0; draw2(); });
  });
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.k = 0; s2.p = 0; draw2(); });
  ['a2', 'b2'].forEach(id => $(id).addEventListener('input', draw2));

  ['bx3', 'by3'].forEach(id => $(id).addEventListener('input', draw3));
  tapGrid($('c3'), grid3, GX, GY, 0, 0, (i, j) => { $('bx3').value = i; $('by3').value = j; draw3(); });

  ['p4', 'q4', 's4'].forEach(id => $(id).addEventListener('input', draw4));
  $('qRight').addEventListener('click', () => answer4('right'));
  $('qAcute').addEventListener('click', () => answer4('acute'));
  $('qObtuse').addEventListener('click', () => answer4('obtuse'));
  $('qNext').addEventListener('click', () => {
    if (s4.answer === null) return;
    if (s4.i === M.QUIZ.length - 1) { s4.i = 0; s4.n = 0; s4.k = 0; } else s4.i++;
    s4.answer = null; renderQuiz();
  });

  ['a5', 'b5', 'q5'].forEach(id => $(id).addEventListener('input', draw5));
  $('rays5').addEventListener('click', () => { s5.rays = !s5.rays; $('rays5').setAttribute('aria-pressed', String(s5.rays)); draw5(); });
  tapGrid($('c5'), grid5, N5, N5, 1, 1, (i, j) => { $('a5').value = i; $('b5').value = j; draw5(); });

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
