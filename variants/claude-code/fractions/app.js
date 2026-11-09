'use strict';
// Fractions lesson, Claude Code edition. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every shaded length, point, label and readout is computed by FRAC_MODEL with whole numbers;
// floating point is only used to turn an exact fraction into a pixel position.
(function () {

const $ = id => document.getElementById(id);
const M = window.FRAC_MODEL;
const I = window.FRAC_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', text: '#e8edf4', bg: '#0d1621', paper: '#1c2a3a', axis: '#7f93ab' };
const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif';
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Counted nouns (English needs singular/plural; Chinese uses the same measure word either way).
const cnt = (n, key) => t(key + (n === 1 ? '1' : 'N'), { n });

// Inline stacked fraction for readouts; whole numbers are shown as whole numbers.
const fr = (n, d, cls = '') => `<span class="fr ${cls}"><span>${n}</span><span>${d}</span></span>`;
const fv = (f, cls = '') => f.d === 1 ? `<span class="${cls}">${f.n}</span>` : fr(f.n, f.d, cls);
const mixedHtml = (q, r, d, cls = '') => r === 0 ? `<span class="${cls}">${q}</span>` : `<span class="mixed ${cls}">${q}${fr(r, d)}</span>`;

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  // CSS height is fixed once from the authored attribute; only the bitmap follows the DPR.
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height, L: labeller(ctx, width, height) };
}

// Label layout: every label is a box; a label is moved to an alternative spot (or, if optional,
// dropped) rather than drawn over another label or past the canvas edge.
function labeller(ctx, W, H) {
  const boxes = [];
  const hits = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  const font = (size, weight = '') => `${weight} ${size}px ${FONT}`;
  const width = (s, size, weight) => { ctx.font = font(size, weight); return ctx.measureText(String(s)).width; };
  // Block of width w centred on cx, spanning cy-up .. cy+down.
  function place(w, up, down, cx, cy, o, draw) {
    const alts = o.alts || [[0, 0]], pad = o.pad === undefined ? 3 : o.pad;
    let first = null;
    for (const [ax, ay] of alts) {
      let x = cx + ax, y = cy + ay;
      const b0 = { x0: x - w / 2, x1: x + w / 2, y0: y - up, y1: y + down };
      const dx = b0.x0 < 3 ? 3 - b0.x0 : b0.x1 > W - 3 ? W - 3 - b0.x1 : 0;
      const dy = b0.y0 < 2 ? 2 - b0.y0 : b0.y1 > H - 2 ? H - 2 - b0.y1 : 0;
      x += dx; y += dy;
      const b = { x0: b0.x0 + dx, x1: b0.x1 + dx, y0: b0.y0 + dy, y1: b0.y1 + dy };
      if (!first) first = { x, y, b };
      if (!hits({ x0: b.x0 - pad, x1: b.x1 + pad, y0: b.y0 - pad, y1: b.y1 + pad })) { draw(x, y); boxes.push(b); return b; }
    }
    if (o.optional) return null;
    draw(first.x, first.y); boxes.push(first.b); return first.b;
  }
  function text(s, x, y, o = {}) {
    const size = o.size || 12, weight = o.weight || '', w = width(s, size, weight), align = o.align || 'left';
    const cx = align === 'center' ? x : align === 'right' ? x - w / 2 : x + w / 2;
    return place(w, size * 0.92, size * 0.28, cx, y, o, (X, Y) => {
      ctx.font = font(size, weight); ctx.fillStyle = o.color || C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(String(s), X, Y);
    });
  }
  // Stacked fraction centred on (cx, cy) where cy is the fraction bar; optional prefix text to the left.
  function frac(n, d, cx, cy, o = {}) {
    const size = o.size || 13, weight = o.weight || '600', pre = o.prefix || '', ps = o.prefixSize || size;
    const fw = Math.max(width(n, size, weight), width(d, size, weight)) + 6, pw = pre ? width(pre, ps, '') + 4 : 0;
    const w = fw + pw, up = Math.max(3 + size * 0.92, ps * 0.6), down = 1 + size * 1.28;
    return place(w, up, down, cx - pw / 2, cy, o, (X, Y) => {
      const fx = X + pw / 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      if (pre) { ctx.font = font(ps, ''); ctx.fillStyle = o.prefixColor || o.color || C.text; ctx.textAlign = 'right'; ctx.fillText(pre, X - w / 2 + pw - 4, Y + ps * 0.36); ctx.textAlign = 'center'; }
      ctx.font = font(size, weight);
      ctx.fillStyle = o.numColor || o.color || C.text; ctx.fillText(String(n), fx, Y - 3);
      ctx.fillStyle = o.denColor || o.color || C.text; ctx.fillText(String(d), fx, Y + size + 1);
      ctx.strokeStyle = o.color || C.text; ctx.lineWidth = Math.max(1.2, size / 11); ctx.beginPath(); ctx.moveTo(fx - fw / 2 + 2, Y + 0.5); ctx.lineTo(fx + fw / 2 - 2, Y + 0.5); ctx.stroke();
    });
  }
  // Mixed number q r/d (falls back to a whole number or a plain fraction).
  function mixed(q, r, d, cx, cy, o = {}) {
    if (r === 0) return text(String(q), cx, cy + (o.size || 13) * 0.45, { ...o, align: 'center', size: Math.round((o.size || 13) * 1.35), weight: '700' });
    if (q === 0) return frac(r, d, cx, cy, o);
    return frac(r, d, cx, cy, { ...o, prefix: String(q), prefixSize: Math.round((o.size || 13) * 1.45), prefixColor: o.color });
  }
  // An exact value: whole numbers as text, anything else as a stacked fraction.
  function value(f, cx, cy, o = {}) {
    if (f.d !== 1) return frac(f.n, f.d, cx, cy, o);
    const size = o.size || 13;
    return text((o.prefix ? o.prefix + ' ' : '') + f.n, cx, cy + size * 0.4, { ...o, align: 'center', size: size + 2, weight: '700' });
  }
  return { text, frac, mixed, value, hits, reserve: b => boxes.push(b) };
}

/* ---------- drawing pieces ---------- */
// A strip from x to x+w; cuts are exact fractions 0..1 of the strip; parts [0, shaded) are coloured.
function strip(ctx, x, y, w, h, cuts, shaded, color, o = {}) {
  const X = f => x + M.value(f) * w;
  ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < cuts.length - 1; i++) {
    const lit = i < shaded, ghost = !lit && o.ghost !== undefined && i < o.ghost;
    if (!lit && !ghost) continue;
    ctx.globalAlpha = lit ? 0.9 : 0.28; ctx.fillStyle = color; ctx.fillRect(X(cuts[i]), y, X(cuts[i + 1]) - X(cuts[i]), h); ctx.globalAlpha = 1;
  }
  if (o.fine) { // thin lines for a finer common cut
    ctx.strokeStyle = 'rgba(10,14,20,.75)'; ctx.lineWidth = 1;
    for (let k = 1; k < o.fine; k++) { const px = x + k / o.fine * w; ctx.beginPath(); ctx.moveTo(px, y + 2); ctx.lineTo(px, y + h - 2); ctx.stroke(); }
  }
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.6;
  for (let i = 1; i < cuts.length - 1; i++) { const px = X(cuts[i]); ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke(); }
  ctx.strokeStyle = o.outline || C.axis; ctx.lineWidth = o.outline ? 2.2 : 1.4; ctx.strokeRect(x, y, w, h);
}
const evenCuts = n => Array.from({ length: n + 1 }, (_, i) => ({ n: i, d: n }));

// Number line from 0 to max between x0 and x1, ticks every 1/den. Returns value→x.
function numberLine(ctx, x0, x1, y, max, den, o = {}) {
  const X = v => x0 + v / max * (x1 - x0);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0 - 6, y); ctx.lineTo(x1 + 10, y); ctx.stroke();
  ctx.fillStyle = C.axis; ctx.beginPath(); ctx.moveTo(x1 + 14, y); ctx.lineTo(x1 + 6, y - 4); ctx.lineTo(x1 + 6, y + 4); ctx.closePath(); ctx.fill();
  if (o.fine && (x1 - x0) / (max * o.fine) >= 2.5) {
    ctx.strokeStyle = 'rgba(126,226,168,.55)'; ctx.lineWidth = 1;
    for (let k = 0; k <= max * o.fine; k++) { const px = X(k / o.fine); ctx.beginPath(); ctx.moveTo(px, y - 4); ctx.lineTo(px, y + 4); ctx.stroke(); }
  }
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.4;
  for (let k = 0; k <= max * den; k++) {
    const whole = k % den === 0, px = X(k / den);
    ctx.beginPath(); ctx.moveTo(px, y - (whole ? 9 : 6)); ctx.lineTo(px, y + (whole ? 9 : 6)); ctx.stroke();
  }
  return X;
}
// Integer labels (required) and 1/den tick labels (optional: dropped when they would collide).
function lineLabels(L, X, y, max, den, o = {}) {
  for (let i = 0; i <= max; i++) L.text(String(i), X(i), y + 24, { align: 'center', size: 14, weight: '700', color: C.muted, alts: o.intAlts || [[0, 0], [0, -32]] });
  if (o.tickLabels === false) return;
  for (let k = 1; k < max * den; k++) if (k % den) L.frac(k, den, X(k / den), y + 22, { size: 10, weight: '', color: C.muted, optional: true, pad: 4 });
}
function dot(ctx, x, y, color, r = 6, hollow = false) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (hollow) { ctx.lineWidth = 2.4; ctx.strokeStyle = color; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
}
function dashed(ctx, x0, y0, x1, y1, color, alpha = 0.7) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
function setMax(id, max, min) {
  const e = $(id); e.max = String(max); if (min !== undefined) e.min = String(min);
  if (Number(e.value) > max) e.value = String(max);
  if (min !== undefined && Number(e.value) < min) e.value = String(min);
}

/* ---------- step 0: cut and take ---------- */
function draw0() {
  const b = num('b0'); setMax('a0', b); const a = num('a0');
  const uneven = $('uneven0').checked && b > 1;
  $('b0v').textContent = b; $('a0v').textContent = a;
  const { ctx, W, L } = fitCanvas($('c0'));
  const u = M.unevenCuts(b), cuts = uneven ? u.cuts : evenCuts(b);
  const share = uneven ? M.unevenShare(a, b) : M.simplify({ n: a, d: b });
  const same = M.equal(share, { n: a, d: b });
  // the fraction and what its two numbers mean
  L.frac(a, b, 42, 60, { size: 30, weight: '700', numColor: C.orange, denColor: C.text, color: C.text });
  L.text('← ' + t('took', { a }), 76, 46, { size: 14, color: C.orange });
  L.text('← ' + t(uneven ? 'cutUneven' : 'cutInto', { b }), 76, 98, { size: 14, color: C.text });
  const x = 20, w = W - 40, y = 124, h = 54;
  L.text(t('whole1'), x + w, y - 8, { align: 'right', size: 12, color: C.muted, optional: true });
  strip(ctx, x, y, w, h, cuts, a, C.orange);
  // size of each part, written inside it when it fits
  for (let i = 0; i < b; i++) {
    const p = M.simplify({ n: cuts[i + 1].n - cuts[i].n, d: cuts[i].d });
    const px0 = x + M.value(cuts[i]) * w, px1 = x + M.value(cuts[i + 1]) * w;
    if (px1 - px0 >= 24) L.frac(p.n, p.d, (px0 + px1) / 2, y + h / 2 - 5, { size: 11, weight: '600', color: i < a ? '#1a1206' : C.muted, optional: true, pad: 1 });
  }
  // bracket under the shaded part with its true share of the whole
  const sx = x + M.value({ n: cuts[a].n, d: cuts[a].d }) * w, col = uneven && !same ? C.pink : C.orange;
  if (a > 0) {
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y + h + 6); ctx.lineTo(x, y + h + 12); ctx.lineTo(sx, y + h + 12); ctx.lineTo(sx, y + h + 6); ctx.stroke();
  }
  L.value(share, Math.max(x + 40, (x + sx) / 2), y + h + 36, { size: 14, color: col, prefix: t('shaded') + ' =', prefixSize: 13, prefixColor: col });
  const unit = fr(1, b), f = fr(a, b, 'o');
  let s;
  if ($('uneven0').checked && b === 1) s = t('s0one');
  else if (uneven) s = t('s0uneven', { b, a, share: fv(share, same ? 'o' : 'p'), verdict: same ? t('s0eq', { f }) : t('s0notEq', { f }) });
  else s = t('s0read', { b, unit, a, f, say: I.say(a, b) }) + (a === 0 ? ' ' + t('s0zero', { f }) : a === b ? ' ' + t('s0whole', { b, f }) : '');
  $('r0').innerHTML = s;
}

/* ---------- step 1: hops along the number line ---------- */
const s1 = { k: null, anim: null, paused: false, last: 0 };
function draw1() {
  const b = num('b1'); setMax('a1', b); const a = num('a1');
  $('b1v').textContent = b; $('a1v').textContent = a;
  const { ctx, W, L } = fitCanvas($('c1'));
  const x0 = 30, x1 = W - 34, y = 172, by = 34, bh = 38;
  const shown = s1.k === null ? a : Math.min(a, s1.k), done = Math.floor(shown);
  L.text(t('bar1'), x0, by - 9, { size: 12, color: C.muted, optional: true });
  strip(ctx, x0, by, x1 - x0, bh, evenCuts(b), done, C.orange, { ghost: a });
  dashed(ctx, x0, by + bh, x0, y, C.muted, 0.5); dashed(ctx, x1, by + bh, x1, y, C.muted, 0.5);
  const X = numberLine(ctx, x0, x1, y, 1, b);
  // hop arcs: completed ones stay on the line, the current one is drawn part-way
  const hw = X(1 / b) - X(0), ah = Math.min(46, hw * 0.55 + 10);
  for (let i = 0; i < Math.ceil(shown); i++) {
    const frac = Math.min(1, shown - i), xa = X(i / b), xb = X((i + 1) / b), cx = (xa + xb) / 2;
    ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.globalAlpha = i < done ? 0.85 : 1;
    ctx.beginPath();
    for (let s = 0; s <= 24 * frac; s++) { const u = s / 24, px = xa + (xb - xa) * u, py = y - 4 * ah * u * (1 - u); if (s) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke(); ctx.globalAlpha = 1;
    if (i < done) L.text(String(i + 1), cx, y - ah - 4, { align: 'center', size: 10, color: C.orange, optional: true, pad: 1 });
  }
  const px = X(shown / b);
  dot(ctx, px, y, C.orange, s1.k === null ? 7 : 6);
  if (s1.k === null || done === a) L.frac(a, b, X(a / b), y + 44, { size: 15, weight: '700', color: C.orange, alts: [[0, 0], [0, 40]] });
  else L.frac(done, b, X(done / b), y + 44, { size: 15, weight: '700', color: C.orange });
  lineLabels(L, X, y, 1, b, { intAlts: [[0, 0], [0, 44]] });
  const unit = fr(1, b), f = fr(a, b, 'o');
  let s;
  if (s1.k !== null && done < a) s = t('s1prog', { k: done, a, unit, pos: fv({ n: done, d: done ? b : 1 }, 'o') });
  else if (a === 0) s = t('s1zero', { f });
  else if (a === b) s = t('s1one', { b, f });
  else s = t('s1done', { hops: cnt(a, 'cHop'), unit, f, aParts: cnt(a, 'cPart'), restParts: cnt(b - a, 'cPart'), restF: fr(b - a, b) });
  $('r1').innerHTML = s;
  $('pause1').disabled = s1.k === null;
  $('pause1').textContent = t(s1.paused ? 'resume' : 'pause');
}
function stop1(finish) { if (s1.anim) cancelAnimationFrame(s1.anim); s1.anim = null; s1.paused = false; if (finish) s1.k = null; }
function run1() {
  const a = num('a1');
  if (reduceMotion() || a === 0) { stop1(true); draw1(); return; }
  s1.last = performance.now();
  const tick = now => {
    s1.k += (now - s1.last) / 550; s1.last = now; // one hop every 0.55 s (teaching slow motion)
    if (s1.k >= a) { stop1(true); draw1(); return; }
    draw1(); s1.anim = requestAnimationFrame(tick);
  };
  s1.anim = requestAnimationFrame(tick);
}

/* ---------- step 2: equivalent fractions ---------- */
function draw2() {
  const b = num('b2'); setMax('a2', b); const a = num('a2'), m = num('m2');
  $('b2v').textContent = b; $('a2v').textContent = a; $('m2v').textContent = m;
  const { ctx, W, L } = fitCanvas($('c2'));
  const x0 = 64, x1 = W - 22, pitch = 44, top = 12, rh = 26, y = top + 5 * pitch + 20;
  const edge = x0 + (x1 - x0) * a / b;
  for (let r = 1; r <= m; r++) {
    const ry = top + (r - 1) * pitch, f = M.scale({ n: a, d: b }, r);
    strip(ctx, x0, ry, x1 - x0, rh, evenCuts(f.d), f.n, C.orange, { outline: r === m ? C.cyan : null });
    L.frac(f.n, f.d, 30, ry + rh / 2 - 2, { size: 12, color: r === m ? C.cyan : C.text });
  }
  dashed(ctx, edge, top - 6, edge, y, C.cyan, 0.9);
  const X = numberLine(ctx, x0, x1, y, 1, b, { fine: b * m });
  dot(ctx, X(a / b), y, C.orange, 7);
  const g = M.simplify({ n: a, d: b });
  L.frac(a, b, X(a / b), y + 44, { size: 15, weight: '700', color: C.orange, alts: [[0, 0], [0, 6]] });
  lineLabels(L, X, y, 1, b, { intAlts: [[0, 0], [0, 44]] });
  const chain = Array.from({ length: m }, (_, i) => fr(a * (i + 1), b * (i + 1), i === m - 1 ? 'c' : '')).join(' = ');
  const f = fr(a, b);
  $('r2').innerHTML = (m === 1 ? '' : t('s2read', { chain, m }) + ' ') + (g.g > 1 ? t('s2simp', { f, g: g.g, s: fv(g, 'g') }) : t('s2simplest', { f }));
}

/* ---------- step 3: comparing ---------- */
const s3 = { common: false };
function draw3() {
  const b1 = num('b3'); setMax('a3', b1); const a1 = num('a3');
  const b2 = num('d3'); setMax('c3n', b2); const a2 = num('c3n');
  $('a3v').textContent = a1; $('b3v').textContent = b1; $('c3v').textContent = a2; $('d3v').textContent = b2;
  const f1 = { n: a1, d: b1 }, f2 = { n: a2, d: b2 }, c = M.common(f1, f2), cmp = M.compare(f1, f2);
  const { ctx, W, L } = fitCanvas($('c3'));
  const x0 = 66, x1 = W - 22, rows = [[f1, C.orange, c.f, 20], [f2, C.cyan, c.g, 98]];
  for (const [f, col, g, ry] of rows) {
    strip(ctx, x0, ry, x1 - x0, 32, evenCuts(f.d), f.n, col, { fine: s3.common ? c.L : 0 });
    L.frac(f.n, f.d, 32, ry + 14, { size: 15, weight: '700', color: col });
    L.text(s3.common ? t('nowIs', { g: g.n + '/' + g.d }) : t('eachPart', { u: '1/' + f.d }), x0, ry + 52, { size: 13, color: col });
  }
  const y = 206, X = numberLine(ctx, x0, x1, y, 1, 1, { fine: s3.common ? c.L : 0 });
  dot(ctx, X(M.value(f1)), y - 1, C.orange, 7); dot(ctx, X(M.value(f2)), y + 1, C.cyan, 5);
  dashed(ctx, x0 + (x1 - x0) * M.value(f1), 52, X(M.value(f1)), y, C.orange, 0.5);
  dashed(ctx, x0 + (x1 - x0) * M.value(f2), 130, X(M.value(f2)), y, C.cyan, 0.5);
  L.frac(a1, b1, X(M.value(f1)), y - 30, { size: 13, color: C.orange, alts: [[0, 0], [-26, 0], [26, 0]] });
  L.frac(a2, b2, X(M.value(f2)), y + 50, { size: 13, color: C.cyan, alts: [[0, 0], [-26, 0], [26, 0]] });
  lineLabels(L, X, y, 1, 1, { intAlts: [[0, 0]], tickLabels: false });
  const F1 = fr(a1, b1, 'o'), F2 = fr(a2, b2, 'c'), diff = M.sub(cmp >= 0 ? f1 : f2, cmp >= 0 ? f2 : f1);
  const cmpText = t(cmp > 0 ? 's3gt' : cmp < 0 ? 's3lt' : 's3eq', { p1: cnt(c.f.n, 'cPiece'), p2: cnt(c.g.n, 'cPiece'), f1: F1, f2: F2, diff: fv(diff) });
  let s;
  if (b1 === b2) s = t('s3beforeSame', { cmp: cmpText });
  else if (!s3.common) s = t('s3before', { f1: F1, u1: fr(1, b1), f2: F2, u2: fr(1, b2) });
  else s = t('s3after', { L: c.L, b1, b2, f1: F1, g1: fr(c.f.n, c.L, 'o'), f2: F2, g2: fr(c.g.n, c.L, 'c'), cmp: cmpText });
  $('r3').innerHTML = s;
  $('common3').textContent = t(s3.common ? 'uncommon' : 'common');
  $('common3').setAttribute('aria-pressed', String(s3.common));
}

/* ---------- step 4: adding ---------- */
function draw4() {
  const b1 = num('b4'); setMax('a4', b1); const a1 = num('a4');
  const b2 = num('d4'); setMax('c4n', b2); const a2 = num('c4n');
  $('a4v').textContent = a1; $('b4v').textContent = b1; $('c4v').textContent = a2; $('d4v').textContent = b2;
  const f1 = { n: a1, d: b1 }, f2 = { n: a2, d: b2 }, sum = M.add(f1, f2), wrong = M.mediant(f1, f2);
  const grid = $('grid4').checked, showWrong = $('wrong4').checked;
  const { ctx, W, L } = fitCanvas($('c4'));
  const x0 = 26, x1 = W - 30, y = 142;
  const X = numberLine(ctx, x0, x1, y, 2, 1, { fine: grid ? sum.L : 0 });
  const by = 100, bh = 22, xa = X(M.value(f1)), xs = X(M.value(sum.raw));
  ctx.globalAlpha = 0.9; ctx.fillStyle = C.orange; ctx.fillRect(X(0), by, xa - X(0), bh); ctx.fillStyle = C.cyan; ctx.fillRect(xa, by, xs - xa, bh); ctx.globalAlpha = 1;
  if (grid && (x1 - x0) / (2 * sum.L) >= 2.5) {
    ctx.strokeStyle = 'rgba(10,14,20,.8)'; ctx.lineWidth = 1;
    for (let k = 1; k < sum.raw.n; k++) { const px = X(k / sum.L); ctx.beginPath(); ctx.moveTo(px, by + 2); ctx.lineTo(px, by + bh - 2); ctx.stroke(); }
  }
  ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, by); ctx.lineTo(xa, by + bh); ctx.stroke();
  dashed(ctx, xs, by + bh, xs, y, C.green, 0.8);
  L.frac(a1, b1, (X(0) + xa) / 2, by - 30, { size: 13, color: C.orange, alts: [[0, 0], [0, -36], [-20, -36]] });
  L.frac(a2, b2, (xa + xs) / 2, by - 30, { size: 13, color: C.cyan, alts: [[0, 0], [0, -36], [20, -36], [30, 0]] });
  // the true sum (green) and the slip (a+c)/(b+d) (pink)
  dot(ctx, xs, y, C.green, 7);
  const ss = sum.simplest;
  L.value(ss, xs, y + 46, { size: 14, weight: '700', color: C.green, prefix: t('sumLbl'), prefixSize: 13, alts: [[0, 0], [0, 44]] });
  if (showWrong) {
    const xw = X(M.value(wrong));
    dot(ctx, xw, y, C.pink, 6, true);
    const b = L.frac(wrong.n, wrong.d, xw, y + 46, { size: 13, color: C.pink, prefix: t('wrongLbl') + ' ✗', prefixSize: 12, alts: [[0, 0], [0, 44], [-40, 44], [40, 44]] });
    if (b) dashed(ctx, xw, y + 7, xw, b.y0 - 2, C.pink, 0.7);
  }
  lineLabels(L, X, y, 2, 1, { intAlts: [[0, 0], [0, 88]], tickLabels: false });
  const F1 = fr(a1, b1, 'o'), F2 = fr(a2, b2, 'c');
  const mx = M.toMixed(ss);
  let s = t('s4read', {
    f1: F1, f2: F2, L: sum.L, g1: fr(sum.f.n, sum.L, 'o'), g2: fr(sum.g.n, sum.L, 'c'), raw: fr(sum.raw.n, sum.raw.d, 'g'),
    simp: ss.g > 1 ? t('s4simp', { s: fv(ss, 'g') }) : '',
    mixed: M.kind(ss) === 'improper' ? t('s4mixed', { m: mixedHtml(mx.q, mx.r, mx.d, 'g') }) : ''
  });
  if (showWrong) {
    const gap = M.sub(sum.raw, wrong), lo = M.compare(f1, f2) <= 0 ? F1 : F2, hi = M.compare(f1, f2) <= 0 ? F2 : F1;
    s += ' ' + t(M.equal(f1, f2) ? 's4wrongEq' : 's4wrong', { w: fr(wrong.n, wrong.d, 'p'), lo, hi, gap: fv(gap), f1: F1 });
  }
  $('r4').innerHTML = s;
}

/* ---------- step 5: more than one whole ---------- */
const s5 = { k: null, anim: null, paused: false, last: 0 };
function draw5() {
  const b = num('b5'); setMax('a5', 3 * b); const a = num('a5');
  $('b5v').textContent = b; $('a5v').textContent = a;
  const { ctx, W, L } = fitCanvas($('c5'));
  const shown = s5.k === null ? a : Math.min(a, Math.floor(s5.k));
  const x0 = 60, x1 = W - 22, pitch = 42, rh = 28, top = 12;
  for (let r = 0; r < 3; r++) {
    const ry = top + r * pitch, inRow = Math.max(0, Math.min(b, shown - r * b)), ghost = Math.max(0, Math.min(b, a - r * b));
    strip(ctx, x0, ry, x1 - x0, rh, evenCuts(b), inRow, C.orange, { ghost, outline: ghost ? null : '#2c3b50' });
    if (inRow === b) L.text('1', 30, ry + rh / 2 + 6, { align: 'center', size: 17, weight: '700', color: C.orange });
    else if (inRow > 0) L.frac(inRow, b, 30, ry + rh / 2 - 2, { size: 12, color: C.orange });
  }
  const y = 206, X = numberLine(ctx, x0, x1, y, 3, b);
  const mx = M.toMixed({ n: shown, d: b });
  dot(ctx, X(shown / b), y, C.orange, 7);
  L.frac(shown, b, X(shown / b), y - 28, { size: 13, color: C.orange, alts: [[0, 0], [-24, 0], [24, 0]] });
  if (shown > 0) L.mixed(mx.q, mx.r, b, X(shown / b), y + 46, { size: 13, weight: '700', color: C.green, alts: [[0, 0], [0, 6]] });
  lineLabels(L, X, y, 3, b, { intAlts: [[0, 0]], tickLabels: false });
  const full = M.toMixed({ n: a, d: b }), kind = M.kind({ n: a, d: b });
  let s;
  if (s5.k !== null && shown < a) s = t('s5prog', { k: shown, a, strips: cnt(mx.q, 'cStrip'), parts: cnt(mx.r, 'cPart'), next: mx.q + 1 });
  else if (full.r === 0) s = t('s5readWhole', { f: fr(a, b, 'o'), a, b, q: full.q, strips: cnt(full.q, 'cStrip'), kind: t('k_' + kind, { q: full.q }) });
  else s = t('s5read', { f: fr(a, b, 'o'), a, b, q: full.q, r: full.r, strips: cnt(full.q, 'cStrip'), parts: cnt(full.r, 'cPart'), mixed: mixedHtml(full.q, full.r, b, 'g'), say: full.q ? I.sayMixed(full.q, full.r, b) : I.say(full.r, b), kind: t('k_' + kind, { q: full.q }) });
  $('r5').innerHTML = s;
  $('pause5').disabled = s5.k === null;
  $('pause5').textContent = t(s5.paused ? 'resume' : 'pause');
}
function stop5(finish) { if (s5.anim) cancelAnimationFrame(s5.anim); s5.anim = null; s5.paused = false; if (finish) s5.k = null; }
function run5() {
  const a = num('a5');
  if (reduceMotion()) { stop5(true); draw5(); return; }
  s5.last = performance.now();
  const tick = now => {
    s5.k += (now - s5.last) / 320; s5.last = now; // one part every 0.32 s
    if (s5.k >= a) { stop5(true); draw5(); return; }
    draw5(); s5.anim = requestAnimationFrame(tick);
  };
  s5.anim = requestAnimationFrame(tick);
}

/* ---------- step 6: long division on a ring of remainders ---------- */
const s6 = { k: 0, key: '' };
function draw6() {
  const b = num('b6'); setMax('a6', b - 1); const a = num('a6');
  $('a6v').textContent = a; $('b6v').textContent = b;
  const key = a + '/' + b; if (key !== s6.key) { s6.key = key; s6.k = 0; }
  const ld = M.longDivision(a, b), n = ld.steps.length, k = Math.min(s6.k, n), finished = k === n;
  const { ctx, W, H, L } = fitCanvas($('c6'));
  // the decimal written so far
  const ds = ld.steps.slice(0, k).map(s => s.digit).join('');
  const line = `${a} ÷ ${b} = ` + (k === 0 ? '?' : `0.${ds}${finished && ld.terminates ? '' : '…'}`);
  let size = 22; ctx.font = `700 ${size}px ${FONT}`;
  while (size > 13 && ctx.measureText(line).width > W - 24) { size--; ctx.font = `700 ${size}px ${FONT}`; }
  L.text(line, W / 2, 32, { align: 'center', size, weight: '700', color: finished ? (ld.terminates ? C.green : C.pink) : C.text });
  // ring of remainders 0 .. b-1, 0 at the top
  const R = Math.min(106, (W - 92) / 2, (H - 140) / 2), cx = W / 2, cy = 76 + R + 24, nr = 14;
  const pos = r => { const ang = -Math.PI / 2 + 2 * Math.PI * r / b; return [cx + R * Math.cos(ang), cy + R * Math.sin(ang), ang]; };
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  const visited = new Set([a]); ld.steps.slice(0, k).forEach(s => visited.add(s.next));
  const cur = k === 0 ? a : ld.steps[k - 1].next;
  // arrows for the steps taken
  for (let i = 0; i < k; i++) {
    const st = ld.steps[i], closing = finished && !ld.terminates && i === n - 1, col = closing ? C.pink : st.next === 0 ? C.green : C.cyan;
    const [ax, ay, aang] = pos(st.r), [bx, by] = pos(st.next);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.45 + 0.55 * (i + 1) / k;
    if (st.r === st.next) { // a remainder that maps to itself: small loop outside the ring
      const lx = cx + (R + nr + 9) * Math.cos(aang), ly = cy + (R + nr + 9) * Math.sin(aang);
      ctx.beginPath(); ctx.arc(lx, ly, 10, 0, Math.PI * 2); ctx.stroke();
    } else {
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const sx = ax + ux * (nr + 2), sy = ay + uy * (nr + 2), ex = bx - ux * (nr + 3), ey = by - uy * (nr + 3);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * 9 - uy * 5, ey - uy * 9 + ux * 5); ctx.lineTo(ex - ux * 9 + uy * 5, ey - uy * 9 - ux * 5); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // remainder nodes
  for (let r = 0; r < b; r++) {
    const [x, y] = pos(r), on = visited.has(r);
    ctx.beginPath(); ctx.arc(x, y, nr, 0, Math.PI * 2);
    ctx.fillStyle = on ? (r === 0 ? '#1f4a34' : '#173447') : C.paper; ctx.fill();
    ctx.lineWidth = r === cur ? 3 : 1.4; ctx.strokeStyle = r === cur ? C.orange : r === 0 ? C.green : C.axis; ctx.stroke();
    L.reserve({ x0: x - nr, x1: x + nr, y0: y - nr, y1: y + nr });
  }
  for (let r = 0; r < b; r++) { const [x, y] = pos(r); ctx.font = `700 13px ${FONT}`; ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.fillText(String(r), x, y + 4.5); }
  // side labels: start, done, and the ring caption
  const side = (r, s, col) => { const [, , ang] = pos(r), rr = R + nr + 26; L.text(s, cx + rr * Math.cos(ang), cy + rr * Math.sin(ang) + 4, { align: 'center', size: 12, color: col, optional: true, alts: [[0, 0], [0, -16], [0, 16], [34, 0], [-34, 0]] }); };
  side(a, t('startLbl'), C.orange); side(0, t('doneLbl'), C.green);
  if (k === 0) L.text(t('remRing'), cx, cy + 4, { align: 'center', size: 12, color: C.muted, optional: true });
  // readout
  const f = fr(a, b);
  let s;
  if (k === 0) s = t('s6start', { a, b });
  else {
    const st = ld.steps[k - 1];
    s = t('s6step', { k, r: st.r, r10: st.r10, b, d: st.digit, nr: st.next, sofar: '0.' + ds + (finished && ld.terminates ? '' : '…') });
    if (finished) s += ' ' + (ld.terminates ? t('s6term', { f, dec: M.decimalText(ld) }) : t('s6rep', { r: ld.repeatRem, f, dec: M.decimalText(ld), cyc: ld.cycle, approx: M.rounded(a, b, 4) }));
  }
  $('r6').innerHTML = s;
  $('next6').disabled = finished; $('end6').disabled = finished; $('restart6').disabled = k === 0;
}

/* ---------- quiz ---------- */
function quizFeedback() {
  const choice = document.querySelector('input[name="quiz"]:checked'), fb = $('quizFeedback');
  if (!fb.dataset.shown) return;
  if (!choice) { fb.textContent = t('noPick'); fb.style.color = C.orange; return; }
  const ok = choice.value === 'b';
  const sum = M.add({ n: 1, d: 3 }, { n: 1, d: 4 }).simplest, dec = M.decimalText(M.longDivision(1, 6));
  fb.innerHTML = ok ? t('correct', { sum: fr(sum.n, sum.d), dec }) : t('wrong');
  fb.style.color = ok ? C.green : C.orange;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); quizFeedback(); }
window.refreshFractions = refresh;

function setup() {
  ['b0', 'a0', 'uneven0'].forEach(id => $(id).addEventListener('input', draw0));
  $('uneven0').addEventListener('change', draw0);
  ['b1', 'a1'].forEach(id => $(id).addEventListener('input', () => { stop1(true); draw1(); }));
  $('hop1').addEventListener('click', () => { stop1(false); s1.k = 0; draw1(); run1(); });
  $('pause1').addEventListener('click', () => {
    if (s1.anim) { cancelAnimationFrame(s1.anim); s1.anim = null; s1.paused = true; draw1(); }
    else if (s1.paused) { s1.paused = false; run1(); draw1(); }
  });
  ['b2', 'a2', 'm2'].forEach(id => $(id).addEventListener('input', draw2));
  ['a3', 'b3', 'c3n', 'd3'].forEach(id => $(id).addEventListener('input', draw3));
  $('common3').addEventListener('click', () => { s3.common = !s3.common; draw3(); });
  ['a4', 'b4', 'c4n', 'd4'].forEach(id => $(id).addEventListener('input', draw4));
  ['grid4', 'wrong4'].forEach(id => $(id).addEventListener('change', draw4));
  ['b5', 'a5'].forEach(id => $(id).addEventListener('input', () => { stop5(true); draw5(); }));
  $('fill5').addEventListener('click', () => { stop5(false); s5.k = 0; draw5(); run5(); });
  $('pause5').addEventListener('click', () => {
    if (s5.anim) { cancelAnimationFrame(s5.anim); s5.anim = null; s5.paused = true; draw5(); }
    else if (s5.paused) { s5.paused = false; run5(); draw5(); }
  });
  ['a6', 'b6'].forEach(id => $(id).addEventListener('input', draw6));
  $('next6').addEventListener('click', () => { s6.k++; draw6(); });
  $('end6').addEventListener('click', () => { s6.k = Infinity; draw6(); });
  $('restart6').addEventListener('click', () => { s6.k = 0; draw6(); });
  $('checkQuiz').addEventListener('click', () => { $('quizFeedback').dataset.shown = '1'; quizFeedback(); });
  document.querySelectorAll('input[name="quiz"]').forEach(r => r.addEventListener('change', () => { delete $('quizFeedback').dataset.shown; $('quizFeedback').textContent = ''; }));
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  // A hidden page keeps no animation loop running: finish any playback and draw the end state.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (s1.anim || s1.paused) { stop1(true); draw1(); }
    if (s5.anim || s5.paused) { stop5(true); draw5(); }
  });
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
