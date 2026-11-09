'use strict';
// Negative numbers lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, comparison and count comes from window.NEG_MODEL (model.js). Canvas labels go through
// a small layout helper that keeps them inside the canvas and apart from each other.
(function () {

const $ = id => document.getElementById(id);
const M = window.NEG_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#5a6f88', text: '#e8edf4', bg: '#0d1621', sea: '#123b55', seaLine: '#3f8fc0', sand: '#3a3326', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Display a whole number with a true minus sign (U+2212); 0 has no sign.
const fmt = v => (v < 0 ? '−' + Math.abs(v) : String(v));
const signCol = v => (v > 0 ? C.cyan : v < 0 ? C.orange : C.green);

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

// Label layout: every text box is measured, kept inside the canvas, and tried at a list of candidate
// offsets until it overlaps nothing placed earlier. A label that cannot fit at any candidate shrinks;
// if it still cannot fit it is skipped (the same number is always in the DOM readout).
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 + 3 && b.x1 > o.x0 - 3 && b.y0 < o.y1 + 2 && b.y1 > o.y0 - 2);
  const box = (text, X, Y, align) => {
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(text);
    return { x0: X - m.actualBoundingBoxLeft, x1: X + m.actualBoundingBoxRight, y0: Y - m.actualBoundingBoxAscent, y1: Y + m.actualBoundingBoxDescent };
  };
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
    put(text, x, y, o = {}) {
      const cands = o.cands || [[0, 0, o.align || 'center']];
      for (let size = o.size || 12; size >= (o.min || 9); size -= 1) {
        ctx.font = `${o.weight || 500} ${size}px system-ui,-apple-system,"PingFang SC",sans-serif`;
        for (const [dx, dy, al] of cands) {
          const align = al || o.align || 'center';
          let X = x + dx; const Y = y + dy;
          let b = box(text, X, Y, align);
          if (b.x1 - b.x0 > W - 6) continue;
          if (b.x0 < 3) { X += 3 - b.x0; b = box(text, X, Y, align); }
          if (b.x1 > W - 3) { X -= b.x1 - (W - 3); b = box(text, X, Y, align); }
          if (b.y0 < 2 || b.y1 > H - 2 || hit(b)) continue;
          if (o.bg) { ctx.save(); ctx.fillStyle = o.bg; ctx.globalAlpha = 0.86; ctx.fillRect(b.x0 - 3, b.y0 - 2, b.x1 - b.x0 + 6, b.y1 - b.y0 + 4); ctx.restore(); }
          ctx.fillStyle = o.color || C.text; ctx.fillText(text, X, Y);
          boxes.push(b); return b;
        }
      }
      return null;
    }
  };
}

// A horizontal number line from lo to hi. Tick labels thin out (every 1, 2, 4, 5 …) so they never touch.
function numberLine(ctx, L, o) {
  const { y, x0, x1, lo, hi } = o;
  const X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
  const unit = (x1 - x0) / (hi - lo);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x0 - 8, y); ctx.lineTo(x1 + 8, y); ctx.stroke();
  // arrow heads: the line keeps going both ways
  ctx.fillStyle = C.axis;
  ctx.beginPath(); ctx.moveTo(x1 + 12, y); ctx.lineTo(x1 + 4, y - 4); ctx.lineTo(x1 + 4, y + 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x0 - 12, y); ctx.lineTo(x0 - 4, y - 4); ctx.lineTo(x0 - 4, y + 4); ctx.fill();
  ctx.font = '500 11px system-ui,sans-serif';
  const wide = Math.max(ctx.measureText(fmt(lo)).width, ctx.measureText(fmt(hi)).width) + 8;
  const stride = [1, 2, 4, 5, 10].find(s => s * unit >= wide) || 10;
  for (let v = lo; v <= hi; v++) {
    const major = v % stride === 0;
    ctx.strokeStyle = v === 0 ? C.text : C.axis; ctx.lineWidth = v === 0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(X(v), y - (major ? 6 : 3)); ctx.lineTo(X(v), y + (major ? 6 : 3)); ctx.stroke();
  }
  ctx.restore();
  for (let v = lo; v <= hi; v++) if (v % stride === 0) L.put(fmt(v), X(v), y + 21, { size: 11, color: v === 0 ? C.text : C.muted, weight: v === 0 ? 700 : 500, min: 11 });
  L.reserve(x0 - 12, y - 7, x1 + 12, y + 7);
  return { X, unit, stride };
}

function dot(ctx, x, y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function ring(ctx, x, y, r, color, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.8; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function arrow(ctx, xa, ya, xb, yb, color, w = 2) {
  const a = Math.atan2(yb - ya, xb - xa);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb - 6 * Math.cos(a), yb - 6 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xb, yb); ctx.lineTo(xb - 10 * Math.cos(a - 0.4), yb - 10 * Math.sin(a - 0.4)); ctx.lineTo(xb - 10 * Math.cos(a + 0.4), yb - 10 * Math.sin(a + 0.4)); ctx.fill();
  ctx.restore();
}

// Simple creatures drawn with paths (no emoji glyphs, so nothing depends on fonts).
function bird(ctx, x, y, s, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s, y - s * 0.35); ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.75, x, y);
  ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.75, x + s, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function fish(ctx, x, y, s, col) {
  ctx.save(); ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.48, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - s * 0.8, y); ctx.lineTo(x - s * 1.5, y - s * 0.5); ctx.lineTo(x - s * 1.5, y + s * 0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x + s * 0.5, y - s * 0.1, s * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function buoy(ctx, x, y, s) {
  ctx.save(); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, y, s * 0.6, Math.PI, 0); ctx.fill();
  ctx.fillStyle = C.text; ctx.fillRect(x - 1, y - s * 1.3, 2, s * 0.8); ctx.restore();
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

/* ---------- vertical gauge shared by steps 0 and 1 (physical height −8..8 m) ---------- */
function gauge(ctx, W, top, bottom) {
  const [lo, hi] = M.SCENE.gauge;
  const Y = v => bottom - (v - lo) / (hi - lo) * (bottom - top);
  const px = Math.round(Math.max(58, Math.min(W * 0.26, 170)));
  // sea water below the surface, sand below the sea floor
  ctx.fillStyle = C.sea; ctx.globalAlpha = 0.55; ctx.fillRect(6, Y(0), W - 12, bottom + 6 - Y(0)); ctx.globalAlpha = 1;
  ctx.strokeStyle = C.seaLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, Y(0)); ctx.lineTo(W - 6, Y(0)); ctx.stroke();
  return { Y, px, lo, hi };
}
function gaugeTicks(ctx, L, G, labelOf) {
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(G.px, G.Y(G.hi) - 6); ctx.lineTo(G.px, G.Y(G.lo) + 6); ctx.stroke();
  for (let v = G.lo; v <= G.hi; v++) {
    const major = v % 2 === 0; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(G.px - (major ? 7 : 4), G.Y(v)); ctx.lineTo(G.px, G.Y(v)); ctx.stroke();
  }
  ctx.restore();
  L.reserve(G.px - 8, G.Y(G.hi) - 6, G.px + 2, G.Y(G.lo) + 6);
  for (let v = G.lo; v <= G.hi; v += 2) {
    const lab = labelOf(v);
    L.put(fmt(lab), G.px - 11, G.Y(v) + 4, { size: 11, align: 'right', color: lab === 0 ? C.green : C.muted, weight: lab === 0 ? 700 : 500, min: 10 });
  }
}

/* ---------- step 0: below the sea ---------- */
const s0 = { trail: new Set([-3]) };
function draw0() {
  const h = num('h0'), d = M.describe(h);
  $('h0v').textContent = fmt(h);
  const { ctx, W, H } = fitCanvas($('c0')); const L = labeler(ctx, W, H);
  L.put(t('c0gauge'), 10, 18, { align: 'left', size: 12, weight: 600 });
  const G = gauge(ctx, W, 40, 250);
  gaugeTicks(ctx, L, G, v => v);
  L.put(t('c0sea'), W - 10, G.Y(0) - 7, { align: 'right', size: 11, color: C.seaLine, cands: [[0, 0, 'right'], [0, 17, 'right']] });
  // the creature at height h, joined to its mark on the ruler
  const ox = Math.min(W - 40, G.px + Math.max(70, (W - G.px) * 0.38)), oy = G.Y(h);
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = signCol(h); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(G.px, oy); ctx.lineTo(ox - 20, oy); ctx.stroke(); ctx.restore();
  if (h > 0) bird(ctx, ox, oy + 4, 14, C.cyan); else if (h < 0) fish(ctx, ox, oy, 13, C.orange); else buoy(ctx, ox, oy, 14);
  dot(ctx, G.px, oy, 5.5, signCol(h));
  if (h !== 0) ring(ctx, G.px, G.Y(-h), 6, C.ghost, [3, 3]);
  L.reserve(ox - 22, oy - 12, ox + 16, oy + 10);
  L.put(fmt(h) + ' m', ox + 22, oy + 4, { align: 'left', size: 13, weight: 700, color: signCol(h), cands: [[0, 0, 'left'], [0, -16, 'left'], [0, 18, 'left'], [-44, -18, 'center']] });

  // the same ruler tipped over
  const yl = 340;
  L.put(t('c0line'), 10, 290, { align: 'left', size: 12, weight: 600 });
  const N = numberLine(ctx, L, { y: yl, x0: 22, x1: W - 22, lo: -8, hi: 8 });
  [...s0.trail].forEach(v => { if (v !== h) dot(ctx, N.X(v), yl, 3.5, C.text); });
  if (h !== 0) {
    // the twin on the other side and an arc showing "as far from 0"
    ring(ctx, N.X(-h), yl, 7, C.ghost, [3, 3]);
    ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2;
    const r = Math.abs(N.X(h) - N.X(0)), rv = Math.min(r, 30);
    ctx.beginPath(); ctx.ellipse(N.X(0), yl, r, rv, 0, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.restore();
  }
  dot(ctx, N.X(h), yl, 7, signCol(h), C.bg);
  L.put(fmt(h), N.X(h) + (h > 0 ? 12 : h < 0 ? -12 : 0), yl - 12, { size: 13, weight: 700, color: signCol(h), bg: C.bg, align: h > 0 ? 'left' : h < 0 ? 'right' : 'center', cands: [[0, 0], [0, -16], [0, -32]] });
  const key = d.side === 'pos' ? 's0above' : d.side === 'neg' ? 's0below' : 's0zero';
  $('r0').textContent = t(key, { d: d.dist, v: fmt(h), t: fmt(d.twin) });
}

/* ---------- step 1: choose the zero ---------- */
function zeroName(r) {
  if (r === 0) return t('s1zSea'); if (r === M.SCENE.deck) return t('s1zDeck'); if (r === M.SCENE.seabed) return t('s1zBed');
  return r > 0 ? t('s1zUp', { r }) : t('s1zDown', { r: -r });
}
function draw1() {
  const r = num('r1s'), S = M.SCENE;
  $('r1v').textContent = fmt(r);
  $('zeroSea').setAttribute('aria-pressed', r === 0); $('zeroDeck').setAttribute('aria-pressed', r === S.deck); $('zeroBed').setAttribute('aria-pressed', r === S.seabed);
  const { ctx, W, H } = fitCanvas($('c1')); const L = labeler(ctx, W, H);
  L.put(t('c1title'), 10, 18, { align: 'left', size: 12, weight: 600 });
  const G = gauge(ctx, W, 44, 372);
  // sea floor at −6 m
  ctx.fillStyle = C.sand; ctx.fillRect(6, G.Y(S.seabed), W - 12, G.Y(G.lo) + 6 - G.Y(S.seabed));
  // the boat: hull from the surface up to the deck
  const bx0 = G.px + 26, bx1 = Math.min(W - 70, G.px + 26 + Math.max(70, (W - G.px) * 0.3));
  ctx.fillStyle = '#5b6b80'; ctx.beginPath(); ctx.moveTo(bx0, G.Y(S.deck)); ctx.lineTo(bx1, G.Y(S.deck)); ctx.lineTo(bx1 - 12, G.Y(0)); ctx.lineTo(bx0 + 12, G.Y(0)); ctx.closePath(); ctx.fill();
  // the chosen zero
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(G.px, G.Y(r)); ctx.lineTo(W - 6, G.Y(r)); ctx.stroke(); ctx.restore();
  gaugeTicks(ctx, L, G, v => M.relabel(v, r));
  // gull above the boat, fish below it
  const cx = (bx0 + bx1) / 2, bY = G.Y(S.bird), fY = G.Y(S.fish);
  bird(ctx, cx, bY + 4, 14, C.cyan); fish(ctx, cx + 6, fY, 13, C.orange);
  L.reserve(cx - 16, bY - 12, cx + 16, bY + 6); L.reserve(cx - 16, fY - 8, cx + 20, fY + 8);
  L.reserve(bx0, G.Y(S.deck), bx1, G.Y(0));
  const vb = M.relabel(S.bird, r), vf = M.relabel(S.fish, r), gap = vb - vf;
  // bracket on the right showing the fixed distance
  const gx = W - 18;
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath();
  ctx.moveTo(gx - 6, bY); ctx.lineTo(gx, bY); ctx.lineTo(gx, fY); ctx.lineTo(gx - 6, fY); ctx.stroke(); ctx.restore();
  L.reserve(gx - 7, bY, gx + 1, fY);
  L.put(t('c1bird', { v: fmt(vb) }), cx + 22, bY + 4, { align: 'left', size: 12, weight: 700, color: signCol(vb), bg: C.bg, cands: [[0, 0, 'left'], [0, -16, 'left'], [-44, -16, 'left']] });
  L.put(t('c1fish', { v: fmt(vf) }), cx + 26, fY + 4, { align: 'left', size: 12, weight: 700, color: signCol(vf), bg: C.bg, cands: [[0, 0, 'left'], [0, 18, 'left'], [-48, 20, 'left']] });
  L.put(t('c1zero'), W - 30, G.Y(r) - 6, { align: 'right', size: 11, weight: 700, color: C.green, bg: C.bg, cands: [[0, 0, 'right'], [0, 17, 'right'], [-60, 0, 'right'], [-60, 17, 'right']] });
  L.put(t('c1gap', { g: gap }), gx - 10, (bY + fY) / 2 + 4, { align: 'right', size: 11, color: C.text, bg: C.bg, cands: [[0, 0, 'right'], [0, 22, 'right'], [0, -22, 'right']] });
  $('r1').textContent = t('s1readout', { zero: zeroName(r), bird: fmt(vb), fish: fmt(vf), g: gap });
}

/* ---------- step 2: comparing ---------- */
const s2 = { p: 0 }; // card placement progress 0..1
function draw2() {
  const a = num('a2'), b = num('b2');
  $('a2v').textContent = fmt(a); $('b2v').textContent = fmt(b);
  const { ctx, W, H } = fitCanvas($('c2')); const L = labeler(ctx, W, H);
  const yl = 168;
  L.put(t('c2title'), 10, 18, { align: 'left', size: 12, weight: 600 });
  const N = numberLine(ctx, L, { y: yl, x0: 24, x1: W - 24, lo: -10, hi: 10 });
  // cards: start in a row (given order), fall to their own mark (alternate rows so neighbours never touch)
  const order = M.sorted(M.CARDS), rowY = [130, 104], startY = 48;
  const n = M.CARDS.length, placed = Math.round(s2.p * n * 100) / 100;
  if (s2.p === 0) L.put(t('c2cards'), W - 10, 18, { align: 'right', size: 11, color: C.muted, cands: [[0, 0, 'right'], [0, 14, 'right']] });
  M.CARDS.forEach((v, i) => {
    const k = order.indexOf(v);
    const sx = 24 + (i + 0.5) * (W - 48) / n, tx = N.X(v), ty = rowY[k % 2];
    const local = Math.max(0, Math.min(1, placed - k)); // cards fall one after another, smallest first
    const e = local * local * (3 - 2 * local);
    const x = sx + (tx - sx) * e, y = startY + (ty - startY) * e;
    if (local >= 1) { ctx.save(); ctx.strokeStyle = C.violet; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(tx, y + 11); ctx.lineTo(tx, yl - 6); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.fillStyle = '#231d3a'; ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5;
    const w = 32, hgt = 22; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - hgt / 2, w, hgt, 5) : ctx.rect(x - w / 2, y - hgt / 2, w, hgt); ctx.fill(); ctx.stroke(); ctx.restore();
    L.put(fmt(v), x, y + 4.5, { size: 12, weight: 700, color: C.violet, min: 10 });
  });
  // A and B below the line
  const tri = (x, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, yl + 30); ctx.lineTo(x - 6, yl + 40); ctx.lineTo(x + 6, yl + 40); ctx.fill(); };
  tri(N.X(a), C.orange); tri(N.X(b), C.cyan);
  dot(ctx, N.X(a), yl, 5.5, C.orange); dot(ctx, N.X(b), yl, a === b ? 3 : 5.5, C.cyan);
  L.put('A ' + fmt(a), N.X(a), yl + 56, { size: 12, weight: 700, color: C.orange, cands: [[0, 0], [0, 16], [-24, 0], [24, 0]] });
  L.put('B ' + fmt(b), N.X(b), yl + 56, { size: 12, weight: 700, color: C.cyan, cands: [[0, 0], [0, 16], [24, 0], [-24, 0]] });
  const lo = Math.min(a, b), hi = Math.max(a, b), ya = H - 22;
  if (lo !== hi) {
    arrow(ctx, N.X(lo), ya, N.X(hi), ya, C.text, 1.8);
    L.reserve(N.X(lo), ya - 6, N.X(hi), ya + 6);
    L.put('A ' + fmt(a) + (a < b ? '  <  ' : '  >  ') + 'B ' + fmt(b), (N.X(lo) + N.X(hi)) / 2, ya - 9, { size: 12, weight: 700, cands: [[0, 0], [0, 17]] });
  }
  if (a === b) $('r2').textContent = t('s2equal', { a: fmt(a) });
  else {
    let txt = t('s2less', { a: fmt(lo), b: fmt(hi), d: hi - lo });
    // the digits-only rule disagrees with position: point that out
    if (M.digitRule(lo, hi) > 0) txt += ' ' + t('s2trap', { x: Math.abs(lo), y: Math.abs(hi) });
    $('r2').textContent = txt;
  }
  const done = Math.min(n, Math.floor(placed + 1e-9));
  $('r2b').textContent = s2.p === 0 ? t('s2cardsIdle') : done < n ? t('s2progress', { k: done, N: n }) : t('s2sorted', { list: order.map(fmt).join(' < ') });
}

/* ---------- step 3: walking ---------- */
const s3 = { dir: -1, k: null, frac: 0 }; // k = hops completed (null = not walked yet)
function resetWalk() { stopAnim('s3'); s3.k = null; s3.frac = 0; }
function draw3() {
  const s = num('s3'), n = num('n3'), w = M.walk(s, s3.dir, n);
  $('s3v').textContent = fmt(s); $('n3v').textContent = String(n);
  $('dirRight').setAttribute('aria-pressed', s3.dir === 1); $('dirLeft').setAttribute('aria-pressed', s3.dir === -1);
  const { ctx, W, H } = fitCanvas($('c3')); const L = labeler(ctx, W, H);
  const yl = 136, [lo, hi] = M.axisFor(s, w.end);
  L.put(t('c3title'), 10, 18, { align: 'left', size: 12, weight: 600 });
  const N = numberLine(ctx, L, { y: yl, x0: 20, x1: W - 20, lo, hi });
  const col = s3.dir > 0 ? C.cyan : C.orange, hop = Math.min(34, Math.max(14, N.unit * 1.4));
  const arc = (from, to, frac, alpha, dashed) => {
    const xa = N.X(from), xb = N.X(to), mx = (xa + xb) / 2, r = Math.abs(xb - xa) / 2;
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 2; if (dashed) ctx.setLineDash([3, 3]);
    ctx.beginPath();
    const steps = 16;
    for (let i = 0; i <= steps * frac; i++) { const u = i / steps, x = xa + (xb - xa) * u, y = yl - 4 - Math.sin(Math.PI * u) * hop; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore(); return { mx, r };
  };
  const walked = s3.k === null ? 0 : s3.k;
  // planned route (faint), walked hops (solid), the hop in progress
  for (let i = 1; i <= n; i++) {
    if (i <= walked) arc(w.path[i - 1], w.path[i], 1, 1, false);
  }
  let here = w.path[walked];
  if (s3.k !== null && walked < n && s3.frac > 0) { arc(w.path[walked], w.path[walked + 1], s3.frac, 1, false); }
  const zeroHit = w.zeroAt !== null && walked >= w.zeroAt;
  if (zeroHit) ring(ctx, N.X(0), yl, 9, C.green);
  dot(ctx, N.X(s), yl, 6, C.text, C.bg);
  const atEnd = s3.k !== null && walked === n;
  if (atEnd) { dot(ctx, N.X(w.end), yl, 7, C.green, C.bg); ctx.fillStyle = C.green; ctx.fillRect(N.X(w.end) - 1, yl - 46, 2, 40); ctx.beginPath(); ctx.moveTo(N.X(w.end) + 1, yl - 46); ctx.lineTo(N.X(w.end) + 14, yl - 40); ctx.lineTo(N.X(w.end) + 1, yl - 34); ctx.fill(); }
  else if (s3.k !== null) { const u = s3.frac, xa = N.X(here), xb = N.X(w.path[Math.min(n, walked + 1)]); dot(ctx, xa + (xb - xa) * u, yl - 4 - Math.sin(Math.PI * u) * hop, 6, col, C.bg); }
  L.reserve(N.X(Math.min(s, w.end)) - 4, yl - 4 - hop, N.X(Math.max(s, w.end)) + 4, yl - 2);
  if (atEnd) L.reserve(N.X(w.end) - 2, yl - 48, N.X(w.end) + 15, yl - 30);
  L.put(t('c3start', { v: fmt(s) }), N.X(s), yl - hop - 16, { size: 12, weight: 700, cands: [[0, 0], [0, -18], [0, -36]] });
  if (atEnd) L.put(t('c3end', { v: fmt(w.end) }), N.X(w.end), yl - hop - 16, { size: 12, weight: 700, color: C.green, cands: [[0, -18], [0, 0], [0, -36], [0, -54]] });
  if (zeroHit) L.put(t('c3zero'), N.X(0), yl + 42, { size: 11, color: C.green, cands: [[0, 0], [0, 16]] });
  const dirw = t(s3.dir > 0 ? 's3dirR' : 's3dirL');
  if (s3.k === null) { $('r3').textContent = t('s3plan', { s: fmt(s), n, dirw }); return; }
  if (!atEnd) { $('r3').textContent = t('s3progress', { k: walked, n, v: fmt(here) }); return; }
  const eq = (n === 0 ? `${fmt(s)} = ${fmt(s)}` : `${fmt(s)} ${s3.dir > 0 ? '+' : '\u2212'} ${n} = ${fmt(w.end)}`).replace(/ /g, '\u00a0');
  const cross = w.zeroAt === null ? t('s3crossNo') : w.end === 0 ? t('s3zeroStop', { k: w.zeroAt }) : t('s3crossYes', { k: w.zeroAt });
  $('r3').textContent = t('s3readout', { s: fmt(s), n, dirw, e: fmt(w.end), eq, cross });
}

/* ---------- step 4: how many degrees ---------- */
const s4 = { k: null, frac: 0 }; // degrees counted (null = show the finished count)
function draw4() {
  const m = num('m4'), n = num('n4'), c = M.change(m, n);
  $('m4v').textContent = fmt(m) + '℃'; $('n4v').textContent = fmt(n) + '℃';
  const { ctx, W, H } = fitCanvas($('c4')); const L = labeler(ctx, W, H);
  L.put(t('c4title'), 10, 18, { align: 'left', size: 12, weight: 600 });
  const top = 50, bottom = H - 48, Y = v => bottom - (v + 10) / 20 * (bottom - top);
  const tx = Math.round(Math.max(64, Math.min(W * 0.3, 200)));
  // tube and bulb
  ctx.save(); ctx.fillStyle = '#1b2633'; ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(tx - 8, top - 14, 16, bottom - top + 20, 8) : ctx.rect(tx - 8, top - 14, 16, bottom - top + 20); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(tx, bottom + 18, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  // liquid up to the current reading: n when finished, part-way while counting
  const total = c.size, counted = s4.k === null ? total : s4.k + s4.frac;
  const cur = m + Math.sign(n - m) * counted;
  ctx.fillStyle = '#e0566f'; ctx.beginPath(); ctx.arc(tx, bottom + 18, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(tx - 4, Y(cur), 8, bottom + 10 - Y(cur));
  // ticks every degree, labels every 2
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
  for (let v = -10; v <= 10; v++) { const major = v % 2 === 0; ctx.beginPath(); ctx.moveTo(tx - 10 - (major ? 7 : 3), Y(v)); ctx.lineTo(tx - 10, Y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx - 22, Y(0)); ctx.lineTo(tx + 12, Y(0)); ctx.stroke(); ctx.restore();
  L.reserve(tx - 12, top - 14, tx + 12, bottom + 32);
  for (let v = -10; v <= 10; v += 2) L.put(fmt(v), tx - 22, Y(v) + 4, { align: 'right', size: 11, color: v === 0 ? C.text : C.muted, weight: v === 0 ? 700 : 500, min: 10 });
  // morning / noon pointers
  const mark = (v, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tx + 10, Y(v)); ctx.lineTo(tx + 20, Y(v) - 6); ctx.lineTo(tx + 20, Y(v) + 6); ctx.fill(); };
  mark(m, C.violet); mark(n, C.pink);
  // the counted path, split at 0
  const bx = Math.min(W - 50, tx + 150);
  const seg = (a, b, col) => { if (a === b) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx, Y(a)); ctx.lineTo(bx, Y(b)); ctx.stroke(); ctx.restore(); };
  const lo = Math.min(m, n), hi = Math.max(m, n);
  if (lo < 0) seg(lo, Math.min(hi, 0), C.orange);
  if (hi > 0) seg(Math.max(lo, 0), hi, C.cyan);
  // one dot per counted degree, from m towards n
  const dir = Math.sign(n - m), whole = Math.floor(counted + 1e-9);
  for (let i = 1; i <= whole; i++) { const v = m + dir * i, mid = v - dir * 0.5; dot(ctx, bx, Y(mid), 3.2, mid < 0 ? C.orange : C.cyan, C.bg); }
  L.reserve(bx - 6, Y(hi) - 3, bx + 6, Y(lo) + 3);
  L.reserve(tx + 8, Y(m) - 7, tx + 22, Y(m) + 7); L.reserve(tx + 8, Y(n) - 7, tx + 22, Y(n) + 7);
  // segment counts beside the bar
  if (c.below > 0) L.put(t('c4seg', { d: c.below }), bx + 12, Y((Math.min(hi, 0) + lo) / 2) + 4, { align: 'left', size: 12, weight: 700, color: C.orange, cands: [[0, 0, 'left'], [0, 16, 'left'], [0, -16, 'left']] });
  if (c.above > 0) L.put(t('c4seg', { d: c.above }), bx + 12, Y((Math.max(lo, 0) + hi) / 2) + 4, { align: 'left', size: 12, weight: 700, color: C.cyan, cands: [[0, 0, 'left'], [0, -16, 'left'], [0, 16, 'left']] });
  const up = n >= m;
  L.put(t('c4n', { v: fmt(n) }), tx + 26, Y(n) + 4, { align: 'left', size: 12, weight: 700, color: C.pink, cands: up ? [[0, 0], [0, -14], [0, -28]] : [[0, 0], [0, 14], [0, 28]] });
  L.put(t('c4m', { v: fmt(m) }), tx + 26, Y(m) + 4, { align: 'left', size: 12, weight: 700, color: C.violet, cands: up ? [[0, 0], [0, 14], [0, 28]] : [[0, 0], [0, -14], [0, -28]] });
  const verb = t(c.delta >= 0 ? 's4up' : 's4down');
  if (s4.k !== null && s4.k < total) { $('r4').textContent = t('s4progress', { k: s4.k, N: total }); return; }
  if (c.size === 0) $('r4').textContent = t('s4flat', { m: fmt(m) });
  else if (c.crosses) $('r4').textContent = t('s4cross', { m: fmt(m), n: fmt(n), below: c.below, above: c.above, size: c.size, verb });
  else $('r4').textContent = t('s4same', { m: fmt(m), n: fmt(n), size: c.size, verb });
}

/* ---------- step 5: quiz ---------- */
const quiz = { q1: { locked: false, fb: null }, q2: { locked: false, fb: null }, q3: { locked: false, fb: null } };
function buildQuiz() {
  ['q1', 'q2', 'q3'].forEach(q => {
    const box = $(q + 'opts');
    box.innerHTML = M.QUIZ[q].options.map(v => `<label><input type="radio" name="${q}" value="${v}"><span>${fmt(Number(v))}</span></label>`).join('');
  });
  document.querySelectorAll('[data-quiz]').forEach(btn => btn.addEventListener('click', () => {
    const q = btn.dataset.quiz, st = quiz[q];
    if (st.locked) return;
    const choice = document.querySelector(`input[name="${q}"]:checked`);
    if (!choice) { st.fb = 'noChoice'; }
    else if (choice.value === M.QUIZ[q].answer) { st.fb = 'correct' + q.slice(1); st.locked = true; }
    else st.fb = 'wrong' + q.slice(1);
    drawQuiz();
  }));
}
function drawQuiz() {
  let c = 0;
  ['q1', 'q2', 'q3'].forEach(q => {
    const st = quiz[q], fb = $(q + 'fb');
    fb.textContent = st.fb ? t(st.fb) : '';
    fb.style.color = st.locked ? C.green : C.orange;
    $('quiz' + q.slice(1)).dataset.locked = st.locked ? 'true' : 'false';
    document.querySelectorAll(`input[name="${q}"]`).forEach(inp => { inp.disabled = st.locked; inp.closest('label').classList.toggle('right', st.locked && inp.value === M.QUIZ[q].answer); });
    document.querySelector(`[data-quiz="${q}"]`).disabled = st.locked;
    if (st.locked) c++;
  });
  $('r5').textContent = t('s5score', { c });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); drawQuiz(); }

function setup() {
  $('h0').addEventListener('input', () => { s0.trail.add(num('h0')); draw0(); });
  $('clear0').addEventListener('click', () => { s0.trail = new Set([num('h0')]); draw0(); });

  $('r1s').addEventListener('input', draw1);
  const setZero = v => { $('r1s').value = v; draw1(); };
  $('zeroSea').addEventListener('click', () => setZero(0));
  $('zeroDeck').addEventListener('click', () => setZero(M.SCENE.deck));
  $('zeroBed').addEventListener('click', () => setZero(M.SCENE.seabed));

  ['a2', 'b2'].forEach(id => $(id).addEventListener('input', draw2));
  $('sort2').addEventListener('click', () => {
    s2.p = 0; draw2();
    animate('s2', M.CARDS.length * 600, p => { s2.p = p; draw2(); });
  });
  $('unsort2').addEventListener('click', () => { stopAnim('s2'); s2.p = 0; draw2(); });

  ['s3', 'n3'].forEach(id => $(id).addEventListener('input', () => { resetWalk(); draw3(); }));
  $('dirRight').addEventListener('click', () => { s3.dir = 1; resetWalk(); draw3(); });
  $('dirLeft').addEventListener('click', () => { s3.dir = -1; resetWalk(); draw3(); });
  $('go3').addEventListener('click', () => {
    const n = num('n3'); resetWalk(); s3.k = 0;
    if (n === 0) { draw3(); return; }
    animate('s3', n * 520, p => { const q = p * n; s3.k = Math.min(n, Math.floor(q + 1e-9)); s3.frac = s3.k < n ? q - s3.k : 0; draw3(); });
  });

  const reset4 = () => { stopAnim('s4'); s4.k = null; s4.frac = 0; draw4(); };
  ['m4', 'n4'].forEach(id => $(id).addEventListener('input', reset4));
  $('count4').addEventListener('click', () => {
    const N = M.change(num('m4'), num('n4')).size; stopAnim('s4');
    if (N === 0) { s4.k = null; draw4(); return; }
    s4.k = 0; s4.frac = 0; draw4();
    animate('s4', N * 380, p => { const q = p * N; s4.k = Math.min(N, Math.floor(q + 1e-9)); s4.frac = s4.k < N ? q - s4.k : 0; draw4(); }, () => { s4.k = null; s4.frac = 0; draw4(); });
  });

  buildQuiz();

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
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
