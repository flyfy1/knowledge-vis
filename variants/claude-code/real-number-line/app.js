'use strict';
// Real numbers & the number line (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every digit, fraction and count shown comes from window.REAL_MODEL (model.js); decimals are exact (BigInt).
// Canvas text goes through a label placer that keeps labels inside the canvas and apart from each other.
(function () {

const $ = id => document.getElementById(id);
const M = window.REAL_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#f2e27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#7d8ca0', edge: '#c9d5e3' };
const PAL = [C.cyan, C.orange, C.green, C.violet, C.pink, C.yellow, '#8fb8ff', '#ffa0d0', '#a8e6cf', '#ffd3a0', '#c0a8ff', '#9ee6f9'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/\.?0+$/, ''); return s.replace('-', '−'); };
const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = p => p * p * (3 - 2 * p);

/* ---------- canvas kit: fitCanvas, label placer, primitives, animation runner ---------- */
function fitCanvas(canvas, hFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = Math.round(hFor ? hFor(width) : Number(canvas.getAttribute('height') || 300));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Label placer: each label tries its candidate anchors (and smaller sizes) until it fits inside the canvas
// without touching an earlier label; a label that fits nowhere is skipped rather than drawn over another.
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    put(text, cands, o = {}) {
      const size0 = o.size || 12, minSize = o.minSize || Math.min(size0, 9);
      for (let s = size0; s >= minSize; s -= 0.5) {
        ctx.font = `${o.weight || 600} ${s}px system-ui,"PingFang SC",sans-serif`;
        const w = ctx.measureText(text).width, asc = s * 0.92, desc = s * 0.28;
        for (const [ax, ay, align] of cands) {
          let x0 = align === 'center' ? ax - w / 2 : align === 'right' ? ax - w : ax;
          x0 = clamp(x0, 3, W - 3 - w);
          const y = clamp(ay, asc + 3, H - 3 - desc);
          const b = { x0: x0 - 2, y0: y - asc - 1, x1: x0 + w + 2, y1: y + desc + 1 };
          if (b.x0 < 0 || b.x1 > W || hit(b)) continue;
          boxes.push(b);
          ctx.save();
          if (o.bg !== false) { ctx.fillStyle = 'rgba(13,22,33,0.8)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          ctx.fillStyle = o.color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x0, y);
          ctx.restore();
          return b;
        }
      }
      return null;
    }
  };
}
// Panel title in its own row; shrinks until it fits.
function title(ctx, L, text, W) {
  let size = 13;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,"PingFang SC",sans-serif`; if (ctx.measureText(text).width <= W - 16) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, 8, 17, W - 16); ctx.restore();   // maxWidth is a last resort for very narrow canvases
  L.reserve(0, 0, W, 23);
}
// Map a model box (y up) into the canvas below the title row, keeping the aspect ratio.
function frame(W, H, box, top = 28, pad = 12) {
  const s = Math.min((W - 2 * pad) / (box.x1 - box.x0), (H - top - pad) / (box.y1 - box.y0));
  const ox = (W - s * (box.x1 - box.x0)) / 2, oy = top + (H - top - pad - s * (box.y1 - box.y0)) / 2;
  return { s, p: P => ({ x: ox + (P.x - box.x0) * s, y: oy + (box.y1 - P.y) * s }) };
}
function path(ctx, pts, { stroke = null, fill = null, w = 2, dash = null, alpha = 1, close = false } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); if (close) ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } ctx.restore();
}
function dot(ctx, q, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill(); ctx.restore(); }
// Wedge at screen point q, from math direction start (degrees, anticlockwise) through span degrees.
function wedge(ctx, q, r, start, span, color, alpha = 0.45, lw = 1.6) {
  if (Math.abs(span) < 1e-6 || r <= 0) return;
  const a0 = -start * DEG, a1 = -(start + span) * DEG, anti = span > 0;
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.arc(q.x, q.y, r, a0, a1, anti); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(q.x, q.y, r, a0, a1, anti); ctx.stroke(); ctx.restore();
}
const along = (q, deg, d) => ({ x: q.x + Math.cos(deg * DEG) * d, y: q.y - Math.sin(deg * DEG) * d });
// Candidate anchors fanned around a direction (math degrees) at several distances from q.
function fan(q, deg, dists, rots = [0, 18, -18, 36, -36]) {
  const out = [];
  for (const d of dists) for (const r of rots) { const a = along(q, deg + r, d); out.push([a.x, a.y + 4, 'center']); }
  return out;
}
function arrowHead(ctx, q, deg, size, color) {
  const tip = along(q, deg, size * 0.6), l = along(q, deg + 140, size * 0.6), r = along(q, deg - 140, size * 0.6);
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(l.x, l.y); ctx.lineTo(r.x, r.y); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

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

const twinH = W => (window.innerWidth > 640 ? 340 : clamp(W * 0.85, 260, 340));
const wideH = W => clamp(W * 0.5, 290, 380);
function setToggle(id, on) { $(id).setAttribute('aria-pressed', on ? 'true' : 'false'); }
function setKey(id, key) { const el = $(id); el.dataset.i18n = key; el.textContent = t(key); }

const sup = n => String(n).split('').map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+ch]).join('');
const minus = s => String(s).replace('-', '−');
const tickLabel = (L, text, x, y, align = 'center') => L.put(text, [[x, y, align]], { size: 11, weight: 400, color: C.muted, bg: false, minSize: 9 });

/* ---------- step 0: swing the diagonal down ---------- */
const s0 = { landed: new Set() };
function draw0() {
  const b = num('b0'), w = num('w0') / 100, n = 1 + b * b, len = M.diagLen(b), slope = M.diagSlope(b);
  $('b0v').textContent = String(b); $('w0v').textContent = Math.round(w * 100) + '%';
  if (w >= 1) s0.landed.add(b);
  const { ctx, W, H } = fitCanvas($('c0'), W => clamp(W * 0.45, 270, 380)), L = labeler(ctx, W, H);
  title(ctx, L, t('c0a'), W);
  const F = frame(W, H, { x0: -0.45, x1: 3.65, y0: -0.55, y1: b + 0.3 });
  const O = F.p({ x: 0, y: 0 }), lineL = F.p({ x: -0.4, y: 0 }), lineR = F.p({ x: 3.6, y: 0 });
  path(ctx, [F.p({ x: 0, y: 0 }), F.p({ x: 1, y: 0 }), F.p({ x: 1, y: b }), F.p({ x: 0, y: b })], { fill: '#18263a', stroke: C.ghost, w: 1.5, close: true });
  path(ctx, [lineL, lineR], { stroke: C.edge, w: 2 });
  for (let i = -4; i <= 36; i++) { const q = F.p({ x: i / 10, y: 0 }), big = i % 10 === 0; path(ctx, [{ x: q.x, y: q.y - (big ? 7 : 3) }, { x: q.x, y: q.y + (big ? 7 : 3) }], { stroke: big ? C.edge : C.ghost, w: big ? 1.6 : 1 }); }
  for (let i = 0; i <= 3; i++) { const q = F.p({ x: i, y: 0 }); L.reserve(q.x - 2, q.y - 8, q.x + 2, q.y + 8); tickLabel(L, String(i), q.x, q.y + 22); }
  const theta = slope * (1 - w), tip = M.tipAt(b, theta), T = F.p(tip), r = len * F.s;
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(O.x, O.y, r, -slope * DEG, 0, false); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(O.x, O.y, r, -slope * DEG, -theta * DEG, false); ctx.stroke(); ctx.restore();
  path(ctx, [O, T], { stroke: C.cyan, w: 3.5 });
  [...s0.landed].sort().forEach(bb => {
    const v = M.diagLen(bb), q = F.p({ x: v, y: 0 });
    dot(ctx, q, 5, C.orange);
    L.put('√' + (1 + bb * bb), [[q.x, q.y - 12, 'center'], [q.x, q.y - 28, 'center'], [q.x, q.y + 40, 'center']], { size: 13, color: C.orange });
  });
  dot(ctx, T, 5, C.text); dot(ctx, O, 4, C.text);
  const v = fmt(len, 4);
  $('r0').textContent = t('s0readout', { b, n, v, y: fmt(tip.y, 2) }) + (w >= 1 ? ' ' + t('s0landed', { v, n }) : '');
}

/* ---------- step 1: zoom in, one digit per row ---------- */
const NUMS1 = [{ name: '√2', kind: 'sqrt', n: 2 }, { name: '√3', kind: 'sqrt', n: 3 }, { name: '1/3', kind: 'frac', p: 1, q: 3 }, { name: '1/7', kind: 'frac', p: 1, q: 7 }, { name: '7/8', kind: 'frac', p: 7, q: 8 }];
const s1 = { i: 0 };
const ROWS = 8;
function rowEnds(int, digits, j) {
  const left = BigInt(int + digits.slice(0, j)), right = left + 1n;
  const f = x => { const s = x.toString().padStart(j + 1, '0'); return j ? s.slice(0, s.length - j) + '.' + s.slice(s.length - j) : s; };
  return [f(left), f(right)];
}
function draw1() {
  const num1 = NUMS1[s1.i], k = num('k1'), d = M.digitsOf(num1, 60);
  $('k1v').textContent = String(k);
  document.querySelectorAll('#pick1 .btn').forEach((bt, i) => bt.setAttribute('aria-pressed', i === s1.i ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c1'), () => 40 + ROWS * 46), L = labeler(ctx, W, H);
  title(ctx, L, t('c1a'), W);
  const x0 = 16, x1 = W - 16, X = u => x0 + u * (x1 - x0);
  for (let j = 0; j < k; j++) {
    const y = 52 + j * 46, digit = +d.digits[j], pos = Number('0.' + d.digits.slice(j, j + 14));
    ctx.save(); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.22; ctx.fillRect(X(digit / 10), y - 12, X((digit + 1) / 10) - X(digit / 10), 12); ctx.restore();
    path(ctx, [{ x: x0, y }, { x: x1, y }], { stroke: C.edge, w: 1.6 });
    for (let c = 0; c <= 10; c++) path(ctx, [{ x: X(c / 10), y: y - (c % 5 === 0 ? 7 : 4) }, { x: X(c / 10), y: y + (c % 5 === 0 ? 4 : 2) }], { stroke: c % 5 === 0 ? C.edge : C.ghost, w: 1 });
    if (j + 1 < k) {
      path(ctx, [{ x: X(digit / 10), y: y + 2 }, { x: x0, y: y + 46 - 8 }], { stroke: C.cyan, w: 1, alpha: 0.35 });
      path(ctx, [{ x: X((digit + 1) / 10), y: y + 2 }, { x: x1, y: y + 46 - 8 }], { stroke: C.cyan, w: 1, alpha: 0.35 });
    }
    dot(ctx, { x: X(pos), y }, 4.5, C.orange);
    L.reserve(X(pos) - 5, y - 5, X(pos) + 5, y + 5);
    L.put(String(digit), [[X((digit + 0.5) / 10), y - 15, 'center']], { size: 12, weight: 700, color: C.cyan, bg: false });
    const [le, ri] = rowEnds(d.int, d.digits, j);
    tickLabel(L, le, x0, y + 17, 'left'); tickLabel(L, ri, x1, y + 17, 'right');
  }
  const dec = d.int + '.' + d.digits.slice(0, k);
  let txt = t('s1read', { name: num1.name, dec, k });
  if (num1.kind === 'frac') {
    const f = M.fracDigits(num1.p, num1.q, 60);
    txt += ' ' + (f.terminates ? t('s1term', { k: f.digits.replace(/0+$/, '').length }) : t('s1rep', { block: f.digits.slice(f.repeatStart, f.repeatStart + f.period), s: f.repeatStart + 1, L: f.period }));
  } else txt += ' ' + t('s1irr', { k: 40 });
  $('r1').textContent = txt;
}

/* ---------- step 2: fractions near √2 ---------- */
function draw2() {
  const N = num('n2'), best = M.bestUpTo(N), recs = M.records(60);
  $('n2v').textContent = String(N);
  const { ctx, W, H } = fitCanvas($('c2'), W => clamp(W * 0.55, 380, 430)), L = labeler(ctx, W, H);
  title(ctx, L, t('c2a', { N }), W);
  const lo = 1.30, hi = 1.53, x0 = 16, x1 = W - 16, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0), yl = 128;
  for (let q = 1; q <= N; q++) for (let p = Math.ceil(lo * q); p <= Math.floor(hi * q); p++) {
    if (M.gcd(p, q) !== 1) continue;
    const h = 6 + 70 / q, isBest = p === best.p && q === best.q;
    path(ctx, [{ x: X(p / q), y: yl }, { x: X(p / q), y: yl - h }], { stroke: isBest ? C.cyan : C.ghost, w: isBest ? 2.5 : 1, alpha: isBest ? 1 : 0.8 });
  }
  path(ctx, [{ x: x0, y: yl }, { x: x1, y: yl }], { stroke: C.edge, w: 1.6 });
  path(ctx, [{ x: X(Math.SQRT2), y: yl + 6 }, { x: X(Math.SQRT2), y: 34 }], { stroke: C.orange, w: 2 });
  [1.3, 1.4, 1.5].forEach(v => { path(ctx, [{ x: X(v), y: yl }, { x: X(v), y: yl + 6 }], { stroke: C.edge, w: 1 }); tickLabel(L, v.toFixed(1), X(v), yl + 19, v === 1.3 ? 'left' : 'center'); });
  L.put(`${best.p}/${best.q}`, [[X(best.p / best.q) + (best.p / best.q > Math.SQRT2 ? 8 : -8), 48, best.p / best.q > Math.SQRT2 ? 'left' : 'right'], [X(best.p / best.q), yl + 34, 'center']], { size: 12, color: C.cyan });
  L.put('√2', [[X(Math.SQRT2) + (best.p / best.q > Math.SQRT2 ? -6 : 6), 48, best.p / best.q > Math.SQRT2 ? 'right' : 'left'], [X(Math.SQRT2), yl + 34, 'center']], { size: 12, color: C.orange });
  // bottom panel: error per denominator, log scale
  const top2 = yl + 52;
  L.reserve(0, top2 - 18, W, top2 + 4);
  ctx.save(); ctx.fillStyle = C.text; ctx.font = '600 12px system-ui,"PingFang SC",sans-serif'; ctx.fillText(t('c2b'), 8, top2 - 4, W - 16); ctx.restore();
  const P = { l: 54, r: W - 14, t: top2 + 10, b: H - 26 }, E0 = -4.5, E1 = 0;
  const xq = q => P.l + (q - 0.5) / 60 * (P.r - P.l), ye = e => P.b - (Math.log10(e) - E0) / (E1 - E0) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  [1, 0.1, 0.01, 0.001, 0.0001].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, ye(v)); ctx.lineTo(P.r, ye(v)); ctx.stroke(); });
  ctx.restore();
  [1, 0.1, 0.01, 0.001, 0.0001].forEach(v => tickLabel(L, String(v), P.l - 5, ye(v) + 4, 'right'));
  [1, 10, 20, 30, 40, 50, 60].forEach(q => tickLabel(L, String(q), xq(q), P.b + 16));
  const recSet = new Set(recs.map(r => r.q));
  for (let q = 1; q <= N; q++) {
    const bq = M.bestFor(q), e = Math.abs(bq.gap) / (q * (bq.p + q * Math.SQRT2));
    const isBest = q === best.q, rec = recSet.has(q);
    dot(ctx, { x: xq(q), y: ye(e) }, isBest ? 6 : rec ? 4.5 : 3, isBest ? C.cyan : rec ? C.green : C.ghost);
  }
  const e = best.errExact;
  $('r2').textContent = t('s2readout', { N, p: best.p, q: best.q, v: (best.p / best.q).toFixed(5), e: e.toPrecision(2), gap: minus(best.gap) });
}

/* ---------- step 3: pair up the factors of 2 ---------- */
function draw3() {
  const p = num('p3'), q = num('q3'), pp = p * p, qq = 2 * q * q, a = M.twos(pp), b = M.twos(qq);
  $('p3v').textContent = String(p); $('q3v').textContent = String(q);
  const { ctx, W, H } = fitCanvas($('c3'), () => 360), L = labeler(ctx, W, H);
  title(ctx, L, t('c3a'), W);
  const cols = [{ x: W * 0.27, n: a, head: `p² = ${pp}`, eq: `= 2${sup(a)} × ${pp / 2 ** a}` }, { x: W * 0.73, n: b, head: `2q² = ${qq}`, eq: `= 2${sup(b)} × ${qq / 2 ** b}` }];
  const bs = clamp(W / 16, 16, 22), base = H - 22;
  cols.forEach((c, ci) => {
    for (let i = 0; i < c.n; i++) {
      const row = Math.floor(i / 2), side = i % 2, alone = i === c.n - 1 && c.n % 2 === 1;
      const x = alone ? c.x - bs / 2 : c.x - bs - 2 + side * (bs + 4), y = base - (row + 1) * (bs + 4);
      ctx.save(); ctx.fillStyle = alone ? C.pink : (ci ? C.violet : C.cyan); ctx.globalAlpha = 0.85; ctx.fillRect(x, y, bs, bs); ctx.restore();
      L.reserve(x, y, x + bs, y + bs);
      ctx.save(); ctx.fillStyle = C.bg; ctx.font = `700 ${Math.round(bs * 0.6)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.fillText('2', x + bs / 2, y + bs * 0.75); ctx.restore();
      if (alone) L.put(t('aloneLbl'), [[x + bs + 8, y + bs * 0.72, 'left'], [x - 8, y + bs * 0.72, 'right'], [c.x, y - 8, 'center']], { size: 12, color: C.pink });
    }
    path(ctx, [{ x: c.x - 70, y: base }, { x: c.x + 70, y: base }], { stroke: C.ghost, w: 1 });
    L.put(c.head, [[c.x, 48, 'center']], { size: 15, weight: 700, color: ci ? C.violet : C.cyan });
    L.put(c.eq, [[c.x, 68, 'center']], { size: 13, weight: 400 });
    if (c.n % 2 === 0 && c.n > 0) L.put(t('pairLbl'), [[c.x + bs + 10, base - (bs + 4) / 2 + 4, 'left'], [c.x, base + 16, 'center']], { size: 12, color: C.muted });
  });
  const d = Math.abs(pp - qq);
  $('r3').textContent = t('s3readout', { pp, a, pr: pp / 2 ** a, qq, b, qr: qq / 2 ** b }) + ' ' + t('s3diff', { d });
}

/* ---------- step 4: sort numbers onto the line ---------- */
const NUMS4 = [
  { id: 'f34', kind: 'frac', p: 3, q: 4 }, { id: 'f13', kind: 'frac', p: 1, q: 3 }, { id: 'fm27', kind: 'frac', p: -2, q: 7 }, { id: 's9', kind: 'sqrt', n: 9 },
  { id: 's8', kind: 'sqrt', n: 8 }, { id: 'f227', kind: 'frac', p: 22, q: 7 }, { id: 'pi', kind: 'pi' }, { id: 'pat', kind: 'pattern' }];
const s4 = { placed: [], cur: -1 };
const rational = num4 => M.classify(num4) !== 'irrational';
function decOf(num4) {
  const d = M.digitsOf(num4, 12), cls = M.classify(num4);
  if (cls === 'integer') return d.int;
  if (cls === 'terminating') return minus(d.int + '.' + d.digits.replace(/0+$/, ''));
  return minus(d.int + '.' + d.digits);
}
function reason4(num4) {
  const name = t('n_' + num4.id), dec = decOf(num4), cls = M.classify(num4);
  if (cls === 'integer') return t('r_int', { name, dec });
  if (cls === 'terminating') return t('r_term', { name, dec, k: dec.split('.')[1].length });
  if (cls === 'repeating') { const f = M.fracDigits(Math.abs(num4.p), num4.q, 20); return t('r_rep', { name, dec, block: f.digits.slice(f.repeatStart, f.repeatStart + f.period), s: f.repeatStart + 1, L: f.period }); }
  return t(num4.kind === 'sqrt' ? 'r_s8' : num4.kind === 'pi' ? 'r_pi' : 'r_pat', { name, dec });
}
function draw4() {
  document.querySelectorAll('#pick4 .btn').forEach((bt, i) => { bt.textContent = t('n_' + NUMS4[i].id); bt.classList.toggle('placed', s4.placed.includes(i)); bt.classList.toggle('irr', !rational(NUMS4[i])); bt.setAttribute('aria-pressed', i === s4.cur ? 'true' : 'false'); });
  const { ctx, W, H } = fitCanvas($('c4'), () => 260), L = labeler(ctx, W, H);
  title(ctx, L, t('c4a'), W);
  const lo = -1.2, hi = 3.7, x0 = 16, x1 = W - 16, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0), yl = 170;
  path(ctx, [{ x: x0, y: yl }, { x: x1, y: yl }], { stroke: C.edge, w: 2 });
  for (let i = -1; i <= 3; i++) { path(ctx, [{ x: X(i), y: yl - 7 }, { x: X(i), y: yl + 7 }], { stroke: C.edge, w: 1.5 }); L.reserve(X(i) - 2, yl - 8, X(i) + 2, yl + 8); tickLabel(L, minus(i), X(i), yl + 24); }
  const order = s4.placed.slice().sort((i, j) => (i === s4.cur) - (j === s4.cur));
  order.reverse().forEach(i => {
    const n4 = NUMS4[i], v = M.valueOf(n4), col = rational(n4) ? C.green : C.orange, x = X(v), cur = i === s4.cur;
    dot(ctx, { x, y: yl }, cur ? 6.5 : 5, col);
    const cands = []; for (const hgt of [22, 46, 70, 94, 118]) cands.push([x, yl - hgt, 'center']); cands.push([x, yl + 46, 'center'], [x, yl + 66, 'center']);
    const box = L.put(t('n_' + n4.id), cands, { size: cur ? 14 : 12, weight: cur ? 700 : 600, color: col });
    if (box) { const yb = box.y1 < yl ? box.y1 : box.y0; path(ctx, [{ x, y: yl + (box.y1 < yl ? -6 : 6) }, { x: clamp(x, box.x0 + 2, box.x1 - 2), y: yb }], { stroke: col, w: 1, alpha: 0.6 }); }
  });
  const r = s4.placed.filter(i => rational(NUMS4[i])).length;
  $('r4').textContent = s4.cur < 0 ? t('s4none') : reason4(NUMS4[s4.cur]);
  $('r4b').textContent = s4.placed.length ? t('s4count', { k: s4.placed.length, r, i: s4.placed.length - r }) : '';
}

/* ---------- step 5: √n on y = x² ---------- */
const s5 = { seen: new Set() };
function draw5() {
  const n = num('n5'), info = M.rootInfo(n), v = Math.sqrt(n);
  $('n5v').textContent = String(n); s5.seen.add(n);
  const { ctx, W, H } = fitCanvas($('c5'), W => clamp(W * 0.55, 330, 420)), L = labeler(ctx, W, H);
  title(ctx, L, t('c5a'), W);
  const P = { l: 40, r: W - 14, t: 34, b: H - 28 };
  const X = x => P.l + x / 7.6 * (P.r - P.l), Y = y => P.b - y / 54 * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
  for (let y = 10; y <= 50; y += 10) { ctx.beginPath(); ctx.moveTo(P.l, Y(y)); ctx.lineTo(P.r, Y(y)); ctx.stroke(); }
  for (let x = 1; x <= 7; x++) { ctx.beginPath(); ctx.moveTo(X(x), P.t); ctx.lineTo(X(x), P.b); ctx.stroke(); }
  ctx.restore();
  path(ctx, [{ x: P.l, y: P.b }, { x: P.r, y: P.b }], { stroke: C.axis, w: 1.5 }); path(ctx, [{ x: P.l, y: P.b }, { x: P.l, y: P.t }], { stroke: C.axis, w: 1.5 });
  for (let x = 0; x <= 7; x++) tickLabel(L, String(x), X(x), P.b + 16);
  for (let y = 0; y <= 50; y += 10) tickLabel(L, String(y), P.l - 6, Y(y) + 4, 'right');
  const curve = []; for (let x = 0; x <= Math.sqrt(54); x += 0.02) curve.push({ x: X(x), y: Y(x * x) });
  path(ctx, curve, { stroke: C.cyan, w: 2.5 });
  const col = info.square ? C.green : C.orange;
  path(ctx, [{ x: X(0), y: Y(n) }, { x: X(v), y: Y(n) }, { x: X(v), y: Y(0) }], { stroke: col, w: 2, dash: [6, 4] });
  [...s5.seen].forEach(m => dot(ctx, { x: X(Math.sqrt(m)), y: P.b }, m === n ? 5.5 : 3.5, M.isSquare(m) ? C.green : C.orange));
  dot(ctx, { x: X(v), y: Y(n) }, 5, C.text);
  L.put(`n = ${n}`, [[X(0) + 8, Y(n) - 8, 'left'], [X(0) + 8, Y(n) + 18, 'left']], { size: 12, color: col });
  L.put(info.square ? `√${n} = ${info.lo}` : `√${n} ≈ ${fmt(v, 3)}`, [[X(v) + 8, P.b - 10, 'left'], [X(v) - 8, P.b - 10, 'right'], [X(v) + 8, P.b - 30, 'left'], [X(v) - 8, P.b - 30, 'right']], { size: 12, color: col });
  const sq = [...s5.seen].filter(m => M.isSquare(m)).length;
  const main = info.square ? t('s5sq', { n, r: info.lo }) : t('s5irr', { n, dec: info.d.int + '.' + info.d.digits, lo: info.lo, hi: info.hi, lo2: info.lo * info.lo, hi2: info.hi * info.hi });
  $('r5').textContent = main + ' ' + t('s5count', { k: s5.seen.size, s: sq });
}

/* ---------- wiring ---------- */
function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('b0').addEventListener('input', () => { stopAnim('s0'); $('w0').value = 0; draw0(); });
  $('w0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('go0').addEventListener('click', () => {
    const from = num('w0') >= 100 ? 0 : num('w0');
    animate('s0', 1800 * (1 - from / 100) + 200, p => { $('w0').value = Math.round(from + (100 - from) * ease(p)); draw0(); });
  });

  const pick1 = $('pick1');
  NUMS1.forEach((n1, i) => {
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn toggle'; bt.textContent = n1.name; bt.dataset.step = '1';
    bt.addEventListener('click', () => { s1.i = i; draw1(); }); pick1.appendChild(bt);
  });
  $('k1').addEventListener('input', draw1);

  $('n2').addEventListener('input', draw2);
  $('p3').addEventListener('input', draw3); $('q3').addEventListener('input', draw3);
  $('near3').addEventListener('click', () => { $('p3').value = clamp(Math.round(num('q3') * Math.SQRT2), 1, 99); draw3(); });

  const pick4 = $('pick4');
  NUMS4.forEach((n4, i) => {
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn toggle'; bt.dataset.step = '4';
    bt.addEventListener('click', () => { if (!s4.placed.includes(i)) s4.placed.push(i); s4.cur = i; draw4(); }); pick4.appendChild(bt);
  });

  $('n5').addEventListener('input', draw5);

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
