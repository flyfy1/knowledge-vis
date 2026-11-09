'use strict';
// Area-model multiplication lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every shape, number and verdict comes from window.AREA_MODEL (model.js). Canvas labels go through a
// small placer that tries a few candidate spots, keeps every label inside the canvas and away from the
// labels already drawn, and shrinks (or leaves out) a label only when nothing fits; numbers stay in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.AREA_MODEL;
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


/* ---------- step 0: one by one vs row by row ---------- */
const s0 = { mode: 'row', k: Infinity, uneven: false };
function grid0(W, H, r, c) { const s = Math.min((W - 96) / c, (H - 46) / r, 40); return { s, ox: (W - c * s) / 2 - 18, oy: 30 + (H - 36 - r * s) / 2 }; }
function draw0() {
  const r = num('r0'), c = num('c0n'), R = M.rows(r, c, s0.uneven);
  $('r0v').textContent = r; $('c0v').textContent = c;
  $('uneven0').setAttribute('aria-pressed', String(s0.uneven));
  const { ctx, W, H } = fitCanvas($('c0'));
  const L = placer(ctx, W, H); title(L, t('c0title'));
  const { s, ox, oy } = grid0(W, H, r, c);
  let idx = 0;
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const X = ox + (j + 0.5) * s, Y = oy + (i + 0.5) * s;
      if (j >= R.counts[i]) { dot(ctx, X, Y, s * 0.3, null, C.pink); idx++; continue; }
      const lit = s0.mode === 'one' ? idx < s0.k : i < s0.k;
      dot(ctx, X, Y, s * 0.32, lit ? C.orange : '#3a4a5e');
      idx++;
    }
    if (s0.mode === 'row' && i < s0.k) L.put(String(R.running[i]), ox + c * s + 10, oy + (i + 0.5) * s, { align: 'left', size: Math.min(13, s * 0.6), min: 8 });
  }
  const done = s0.mode === 'one' ? Math.min(s0.k, R.total) : Math.min(s0.k, r);
  const partial = s0.mode === 'one' ? done < R.total : done < r;
  const prog = partial ? (s0.mode === 'one' ? t('s0prog1', { k: done, N: R.total }) : t('s0progR', { k: done, r })) : '';
  $('rd0').textContent = R.even
    ? t('s0readout', { prog, r, c, N: R.total, list: R.running.join(', ') })
    : t('s0uneven', { prog, c1: c - 1, N: R.total, r, c, P: R.product });
  $('hint0').textContent = t('s0hint', { N: R.total });
}

/* ---------- step 1: tiles and the quarter turn ---------- */
const s1 = { tiles: true, turned: false, angle: 0 };
function draw1() {
  const a = num('a1'), b = num('b1'), N = M.area(a, b);
  $('a1v').textContent = a; $('b1v').textContent = b;
  $('tiles1').textContent = t(s1.tiles ? 'showDots' : 'showTiles');
  const { ctx, W, H } = fitCanvas($('c1'));
  const L = placer(ctx, W, H); title(L, t('c1title'));
  const big = Math.max(a, b), u = Math.min((W - 80) / big, (H - 76) / big, 34);
  const cx = W / 2, cy = 28 + (H - 28) / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-s1.angle * Math.PI / 180);
  for (let i = 0; i < b; i++) for (let j = 0; j < a; j++) {
    const x = (j - a / 2) * u, y = (i - b / 2) * u;
    const row = i === 0, col = j === 0, fill = row ? C.orange : col ? C.green : null;
    if (s1.tiles) {
      ctx.fillStyle = fill ? fill + '55' : '#1f3448'; ctx.fillRect(x + 1, y + 1, u - 2, u - 2);
      ctx.strokeStyle = fill || C.cyan; ctx.lineWidth = 1.2; ctx.strokeRect(x + 1, y + 1, u - 2, u - 2);
    } else dot(ctx, x + u / 2, y + u / 2, u * 0.3, fill || '#7f93ab');
  }
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(-a * u / 2, -b * u / 2, a * u, b * u);
  ctx.restore();
  if (s1.angle === 0 || s1.angle === 90) {
    const dw = s1.turned ? b : a, dh = s1.turned ? a : b;
    L.put(s1.turned ? `b = ${b}` : `a = ${a}`, cx, cy + dh * u / 2 + 16, { color: s1.turned ? C.green : C.orange, cands: [[0, 0], [0, 6]] });
    L.put(s1.turned ? `a = ${a}` : `b = ${b}`, cx - dw * u / 2 - 12, cy, { color: s1.turned ? C.orange : C.green, cands: [[-14, 0], [-22, 0]] });
  }
  $('rd1').textContent = t('s1readout', { a, b, N }) + (s1.turned ? ' ' + t('s1turned', { a, b, N }) : '');
  $('hint1').textContent = t('s1hint', { a, b });
}

/* ---------- step 2: one cut ---------- */
const s2 = { seen: new Set() };
function lay2(W) { const side = W >= 600; return { side, H: side ? 320 : 470 }; }
function draw2() {
  const R = num('r2'), K = num('k2');
  $('x2').max = K - 1; if (num('x2') > K - 1) $('x2').value = K - 1;
  const k = num('x2'), sp = M.split(R, K, k);
  s2.seen.add(k);
  $('r2v').textContent = R; $('k2v').textContent = K; $('x2v').textContent = k;
  const lay = lay2(Math.max(240, $('c2').clientWidth || 600));
  const { ctx, W, H } = fitCanvas($('c2'), w => lay2(w).H);
  const L = placer(ctx, W, H);
  const A = lay.side ? { x: 30, y: 52, w: W * 0.6 - 40, h: H - 90 } : { x: 30, y: 52, w: W - 44, h: 200 };
  const B = lay.side ? { x: W * 0.6 + 34, y: 52, w: W * 0.4 - 48, h: H - 96 } : { x: 40, y: 320, w: W - 56, h: H - 360 };
  L.put(t('c2a'), A.x - 22, 14, { align: 'left', size: 12.5, min: 8 });
  L.put(t('c2b'), lay.side ? B.x - 28 : 8, lay.side ? 14 : B.y - 34, { align: 'left', size: 12.5, min: 8 });
  const u = Math.min(A.w / K, A.h / R), x0 = A.x + (A.w - K * u) / 2, y0 = A.y;
  for (let i = 0; i < R; i++) for (let j = 0; j < K; j++) {
    const left = j < k; ctx.fillStyle = (left ? C.orange : C.green) + '44'; ctx.fillRect(x0 + j * u + 1, y0 + i * u + 1, u - 2, u - 2);
    ctx.strokeStyle = left ? C.orange : C.green; ctx.lineWidth = 1; ctx.strokeRect(x0 + j * u + 1, y0 + i * u + 1, u - 2, u - 2);
  }
  line(ctx, x0 + k * u, y0 - 8, x0 + k * u, y0 + R * u + 8, C.text, 2.5, [6, 4]);
  L.put(String(k), x0 + k * u / 2, y0 - 12, { color: C.orange });
  L.put(String(K - k), x0 + k * u + (K - k) * u / 2, y0 - 12, { color: C.green });
  L.put(String(R), x0 - 14, y0 + R * u / 2, { color: C.muted });
  const inside = (xa, xb, txt, col) => L.put(txt, (xa + xb) / 2, y0 + R * u / 2, { color: col, bg: C.bg, size: 13, min: 9, within: { x0: xa + 2, x1: xb - 2, y0: y0, y1: y0 + R * u } });
  inside(x0, x0 + k * u, `${R} × ${k} = ${sp.left}`, C.orange) || inside(x0, x0 + k * u, String(sp.left), C.orange);
  inside(x0 + k * u, x0 + K * u, `${R} × ${K - k} = ${sp.right}`, C.green) || inside(x0 + k * u, x0 + K * u, String(sp.right), C.green);
  // history: one stacked bar per cut tried, left block below, right block on top; all reach R × K
  const bw = B.w / (K - 1), Y = v => B.y + B.h - v / sp.whole * B.h;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(B.x, B.y + B.h); ctx.lineTo(B.x + B.w, B.y + B.h); ctx.stroke();
  ctx.strokeStyle = C.grid2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.x, Y(sp.whole)); ctx.lineTo(B.x + B.w, Y(sp.whole)); ctx.stroke(); ctx.restore();
  L.put(String(sp.whole), B.x - 4, Y(sp.whole), { align: 'left', weight: 400, size: 11, color: C.muted, cands: [[-30, 0], [-34, 0]] });
  L.put('0', B.x - 12, B.y + B.h, { weight: 400, size: 11, color: C.muted });
  for (let j = 1; j < K; j++) {
    const X = B.x + (j - 0.5) * bw;
    if (s2.seen.has(j)) {
      const q = M.split(R, K, j);
      ctx.fillStyle = C.orange; ctx.fillRect(X - bw * 0.35, Y(q.left), bw * 0.7, B.y + B.h - Y(q.left));
      ctx.fillStyle = C.green; ctx.fillRect(X - bw * 0.35, Y(q.total), bw * 0.7, Y(q.left) - Y(q.total));
      if (j === k) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(X - bw * 0.35, Y(q.total), bw * 0.7, B.y + B.h - Y(q.total)); }
    }
    const every = bw >= 18 ? 1 : bw >= 9 ? 3 : 6;
    if (j % every === 0 || j === 1) L.put(String(j), X, B.y + B.h + 13, { weight: 400, size: 10.5, min: 8, color: j === k ? C.text : C.muted });
  }
  $('rd2').textContent = t('s2readout', { k, r: R, k2: K - k, L: sp.left, R: sp.right, T: sp.total, c: K, note: k === 10 ? t('s2ten') : '' });
}

/* ---------- step 3: four blocks ---------- */
const s3 = { k: 4 };
const BCOL = { tt: C.cyan, to: C.orange, ot: C.green, oo: C.pink };
function draw3() {
  const m = num('m3'), n = num('n3'), F = M.fourBlocks(m, n);
  $('m3v').textContent = m; $('n3v').textContent = n;
  const { ctx, W, H } = fitCanvas($('c3'), w => Math.min(380, Math.max(300, w * 0.75 + 70)));
  const L = placer(ctx, W, H); title(L, t('c3title', { m, n }));
  const u = Math.min((W - 76) / n, (H - 84) / m), x0 = (W - n * u) / 2 + 12, y0 = 54;
  const pos = { tt: [0, 0], to: [F.B.tens, 0], ot: [0, F.A.tens], oo: [F.B.tens, F.A.tens] };
  F.blocks.forEach((bk, i) => {
    if (!bk.area) return;
    const [cx, cy] = pos[bk.key], X = x0 + cx * u, Y = y0 + cy * u, w = bk.w * u, h = bk.h * u, lit = i < s3.k;
    ctx.fillStyle = lit ? BCOL[bk.key] + '55' : '#141e2a'; ctx.fillRect(X, Y, w, h);
    if (u >= 6) {
      ctx.save(); ctx.strokeStyle = lit ? BCOL[bk.key] + '66' : C.grid; ctx.lineWidth = 0.8; ctx.beginPath();
      for (let q = 1; q < bk.w; q++) { ctx.moveTo(X + q * u, Y); ctx.lineTo(X + q * u, Y + h); }
      for (let q = 1; q < bk.h; q++) { ctx.moveTo(X, Y + q * u); ctx.lineTo(X + w, Y + q * u); }
      ctx.stroke(); ctx.restore();
    }
    ctx.strokeStyle = lit ? BCOL[bk.key] : C.ghost; ctx.lineWidth = 2; ctx.strokeRect(X, Y, w, h);
    if (lit) L.put(String(bk.area), X + w / 2, Y + h / 2, { color: C.text, bg: C.bg, size: 14, min: 9, within: { x0: X + 1, x1: X + w - 1, y0: Y + 1, y1: Y + h - 1 } });
  });
  // side lengths: tens and ones of n across the top, of m down the left
  const top = (a, b, txt) => { if (b > a) L.put(txt, (a + b) / 2, y0 - 12, { color: C.muted, size: 12, min: 8 }); };
  top(x0, x0 + F.B.tens * u, String(F.B.tens)); top(x0 + F.B.tens * u, x0 + n * u, String(F.B.ones));
  const side = (a, b, txt) => { if (b > a) L.put(txt, x0 - 14, (a + b) / 2, { color: C.muted, size: 12, min: 8, cands: [[0, 0], [-6, 0]] }); };
  side(y0, y0 + F.A.tens * u, String(F.A.tens)); side(y0 + F.A.tens * u, y0 + m * u, String(F.A.ones));
  const lit = F.blocks.slice(0, s3.k).filter(b => b.area);
  const sum = lit.reduce((s, b) => s + b.area, 0);
  const base = { m, n, mt: F.A.tens, mo: F.A.ones, nt: F.B.tens, no: F.B.ones };
  $('rd3').textContent = s3.k >= 4
    ? t('s3readoutAll', { ...base, parts: F.blocks.filter(b => b.area).map(b => b.area).join(' + '), sum: F.total, prod: F.product })
    : t('s3readout', { ...base, prog: t('s3prog', { k: s3.k }), parts: lit.length ? lit.map(b => b.area).join(' + ') : '0', sum });
  const bA = Object.fromEntries(F.blocks.map(b => [b.key, b.area]));
  const pad = String(F.product).length + 2;
  const row = (numTxt, note, cls = '') => `<span class="num ${cls}">${numTxt.padStart(pad, ' ')}</span><span class="note">${note}</span>`;
  $('vert3').innerHTML = row(String(m), '') + row('× ' + n, '') + '<span class="rule"></span><span class="blank"></span>'
    + row(String(F.line1), `<span class="c-to">${t('vertL1', { m, no: F.B.ones, a: bA.to, b: bA.oo })}</span>`)
    + row(String(F.line2), `<span class="c-tt">${t('vertL2', { m, nt: F.B.tens, a: bA.tt, b: bA.ot })}</span>`)
    + '<span class="rule"></span><span class="blank"></span>' + row(String(F.line1 + F.line2), t('vertSum'));
}

/* ---------- step 4: factor pairs ---------- */
const s4 = { N: null, found: new Set() };
function draw4() {
  const N = num('n4'), w = num('w4'), T = M.tiling(N, w), pairs = M.factorPairs(N);
  if (s4.N !== N) { s4.N = N; s4.found = new Set(); }
  if (T.exact) s4.found.add(M.pairKey(N, w));
  $('n4v').textContent = N; $('w4v').textContent = w;
  const { ctx, W, H } = fitCanvas($('c4'));
  const L = placer(ctx, W, H); title(L, t('c4title'));
  const u = Math.min((W - 64) / Math.max(T.cols, 1), (H - 70) / w, 36), x0 = (W - T.cols * u) / 2 + 10, y0 = 34 + (H - 54 - w * u) / 2;
  for (let col = 0; col < T.cols; col++) for (let i = 0; i < w; i++) {
    const X = x0 + col * u, Y = y0 + (w - 1 - i) * u, idx = col * w + i;
    if (idx < N) { const part = !T.exact && col === T.cols - 1; ctx.fillStyle = (part ? C.orange : C.cyan) + '55'; ctx.fillRect(X + 1, Y + 1, u - 2, u - 2); ctx.strokeStyle = part ? C.orange : C.cyan; ctx.lineWidth = 1.2; ctx.strokeRect(X + 1, Y + 1, u - 2, u - 2); }
    else { ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.2; ctx.strokeRect(X + 2, Y + 2, u - 4, u - 4); ctx.restore(); }
  }
  L.put(`w = ${w}`, x0 - 8, y0 + w * u / 2, { color: C.muted, size: 12, min: 8, cands: [[-22, 0], [-30, 0]] });
  $('rd4').textContent = T.exact ? t('s4exact', { N, w, q: T.q }) : t('s4left', { N, w, q: T.q, r: T.r, miss: T.missing });
  const list = pairs.filter(([p, q]) => s4.found.has(p + '×' + q)).map(([p, q]) => `<span class="chip">${p} × ${q}</span>`).join('');
  let html = t('s4found', { k: s4.found.size, n: pairs.length, list: list || t('none') });
  if (N > 1 && pairs.length === 1 && s4.found.size === 1) html += ' ' + t('s4prime', { N });
  $('rd4b').innerHTML = html;
}

/* ---------- step 5: quiz ---------- */
const s5 = { i: 0, pick: null, score: 0 };
function renderQuiz() {
  const Q = M.QUIZ[s5.i];
  $('quizProg').textContent = t('qProgress', { i: s5.i + 1, n: M.QUIZ.length, k: s5.score });
  $('quizQ').textContent = t(Q.id);
  const box = $('quizOpts');
  if (box.dataset.q !== String(s5.i)) {
    box.dataset.q = String(s5.i);
    box.innerHTML = Q.options.map((o, j) => `<button class="btn" type="button" data-step="5" data-opt="${j}">${o}</button>`).join('');
    box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick5(Number(b.dataset.opt))));
  }
  box.querySelectorAll('button').forEach(b => { const j = Number(b.dataset.opt); b.disabled = s5.pick !== null; b.classList.toggle('picked', s5.pick === j); });
  const fb = $('quizFeedback');
  if (s5.pick === null) { fb.textContent = ''; fb.className = 'quiz-feedback'; }
  else { const ok = s5.pick === Q.answer; fb.textContent = t(ok ? 'qOk' : 'qNo', { why: t(Q.id + 'why') }); fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'no'); }
  $('qNext').disabled = s5.pick === null;
  $('qNext').textContent = t(s5.i === M.QUIZ.length - 1 && s5.pick !== null ? 'qRestart' : 'qNext');
}
function pick5(j) { if (s5.pick !== null) return; s5.pick = j; if (j === M.QUIZ[s5.i].answer) s5.score++; renderQuiz(); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); renderQuiz(); }

function setup() {
  ['r0', 'c0n'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); s0.mode = 'row'; s0.k = Infinity; draw0(); }));
  $('count1').addEventListener('click', () => {
    const N = M.rows(num('r0'), num('c0n'), s0.uneven).total; s0.mode = 'one'; s0.k = 0;
    animate('s0', Math.min(7000, N * 110), p => { s0.k = Math.floor(p * N); draw0(); });
  });
  $('countRow').addEventListener('click', () => {
    const r = num('r0'); s0.mode = 'row'; s0.k = 0;
    animate('s0', r * 550, p => { s0.k = Math.floor(p * r); draw0(); });
  });
  $('uneven0').addEventListener('click', () => { stopAnim('s0'); s0.uneven = !s0.uneven; s0.mode = 'row'; s0.k = Infinity; draw0(); });

  ['a1', 'b1'].forEach(id => $(id).addEventListener('input', draw1));
  $('tiles1').addEventListener('click', () => { s1.tiles = !s1.tiles; draw1(); });
  $('rotate1').addEventListener('click', () => {
    if (anims.s1) return;
    const from = s1.turned ? 90 : 0, to = 90 - from;
    animate('s1', 900, p => { s1.angle = from + (to - from) * p; draw1(); }, () => { s1.angle = to; s1.turned = to === 90; draw1(); });
  });

  ['r2', 'k2'].forEach(id => $(id).addEventListener('input', () => { s2.seen = new Set(); draw2(); }));
  $('x2').addEventListener('input', draw2);

  ['m3', 'n3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); s3.k = 4; draw3(); }));
  $('light3').addEventListener('click', () => { s3.k = 0; draw3(); animate('s3', 4 * 800, p => { const k = Math.min(4, Math.floor(p * 4.999)); if (k !== s3.k || p === 1) { s3.k = p === 1 ? 4 : k; draw3(); } }); });
  $('all3').addEventListener('click', () => { stopAnim('s3'); s3.k = 4; draw3(); });

  ['n4', 'w4'].forEach(id => $(id).addEventListener('input', draw4));

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
