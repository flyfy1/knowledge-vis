'use strict';
// Exponentials & logarithms lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.EXPLOG_MODEL (model.js). Canvas text goes through a
// small label placer that tries several spots, keeps every label inside the canvas and never lets two overlap.
(function () {

const $ = id => document.getElementById(id);
const M = window.EXPLOG_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const lang = () => window.LESSON_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#7d8ca0', white: '#e8edf4' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros; show −0 as 0; use the true minus sign.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s.replace('-', '−'); };
const big = v => (Math.abs(v) >= 1e4 ? Math.round(v).toLocaleString('en-US') : fmt(v, Math.abs(v) >= 100 ? 1 : 3));
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
const logName = b => 'log' + String(b).split('').map(c => SUB[c] || c).join('');
// b raised to e: superscript digits for whole exponents, a caret for decimals (Unicode has no superscript point).
const pw = (b, e) => (Number.isInteger(e) ? b + sup(e) : b + '^' + fmt(e, 4));
// Compact tick labels: 万 / 亿 in Chinese, k / M / B in English.
function compact(v) {
  const r3 = x => String(Number(x.toPrecision(3)));
  if (lang() === 'zh') { if (v >= 1e8) return r3(v / 1e8) + '亿'; if (v >= 1e4) return r3(v / 1e4) + '万'; return r3(v); }
  if (v >= 1e9) return r3(v / 1e9) + 'B'; if (v >= 1e6) return r3(v / 1e6) + 'M'; if (v >= 1e4) return r3(v / 1e3) + 'k'; return r3(v);
}

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
  return { ctx, W: width, H: height };
}

// Label placer: each label tries its candidate anchors (and smaller sizes) until it fits inside the canvas
// without touching an earlier label; a label that fits nowhere is skipped rather than drawn on top of another.
function labeler(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    reserve(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    put(text, cands, o = {}) {
      const size0 = o.size || 11, minSize = o.minSize || Math.min(size0, 9);
      for (let s = size0; s >= minSize; s -= 0.5) {
        ctx.font = `${o.weight || ''} ${s}px system-ui,"PingFang SC",sans-serif`;
        const w = ctx.measureText(text).width, asc = s * 0.92, desc = s * 0.28;
        for (const [ax, ay, align] of cands) {
          let x0 = align === 'center' ? ax - w / 2 : align === 'right' ? ax - w : ax;
          if (o.clamp !== false) x0 = Math.max(3, Math.min(W - 3 - w, x0));
          const y = Math.max(asc + 3, Math.min(H - 3 - desc, ay));
          const b = { x0: x0 - 2, y0: y - asc - 1, x1: x0 + w + 2, y1: y + desc + 1 };
          if (b.x0 < 0 || b.x1 > W || hit(b)) continue;
          boxes.push(b);
          ctx.save();
          if (o.bg !== false) { ctx.fillStyle = 'rgba(13,22,33,0.82)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
          ctx.fillStyle = o.color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x0, y);
          ctx.restore();
          return b;
        }
      }
      return null;
    }
  };
}

function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p; }
function niceTicks(max, n) { const s = niceStep(max / n); const out = []; for (let v = 0; v <= max + s * 0.999; v += s) out.push(v); return out; }

function line(ctx, pts, color, w = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, r, color, ring) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, w = 2.5) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), hd = Math.min(9, L * 0.5);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hd * 0.7, y1 - Math.sin(a) * hd * 0.7); ctx.stroke();
  if (L > 2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(a - 0.45), y1 - hd * Math.sin(a - 0.45)); ctx.lineTo(x1 - hd * Math.cos(a + 0.45), y1 - hd * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function clipRect(ctx, P) { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); }

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

/* ---------- step 0: +3 per hour vs ×2 per hour ---------- */
const s0 = { playing: false };
function draw0() {
  const T = num('t0');
  $('t0v').textContent = String(T);
  const { ctx, W, H } = fitCanvas($('c0')), L = labeler(ctx, W, H);
  const P = { l: 58, r: W - 12, t: 34, b: H - 30 };
  const xMax = Math.max(T, 6) + 0.5, unit = (P.r - P.l) / (xMax + 0.5);
  const x = h => P.l + (h + 0.5) * unit;
  const ticks = niceTicks(Math.max(M.addPlan(T), M.doublePlan(T)), 4), yMax = ticks[ticks.length - 1];
  const y = v => P.b - v / yMax * (P.b - P.t);
  L.put(t('c0title'), [[8, 18]], { size: 12, weight: 600, bg: false });
  ctx.save(); ctx.lineWidth = 1;
  for (const v of ticks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.restore();
  for (const v of ticks) L.put(compact(v), [[P.l - 6, y(v) + 4, 'right']], { color: C.muted, bg: false });
  const xs = [1, 2, 4, 6].find(s => s * unit >= 24) || 6;
  for (let h = 0; h <= T; h += xs) L.put(String(h), [[x(h), P.b + 16, 'center']], { color: C.muted, bg: false });
  const bw = Math.max(1.5, Math.min(16, unit * 0.36));
  for (let h = 0; h <= T; h++) {
    const a = M.addPlan(h), b = M.doublePlan(h);
    ctx.fillStyle = C.orange; ctx.fillRect(x(h) - bw - 1, y(a), bw, Math.max(1, P.b - y(a)));
    ctx.fillStyle = C.cyan; ctx.fillRect(x(h) + 1, y(b), bw, Math.max(1, P.b - y(b)));
    // labels must not sit on any bar
    L.reserve(x(h) - bw - 1, Math.min(y(a), P.b - 1), x(h) - 1, P.b); L.reserve(x(h) + 1, Math.min(y(b), P.b - 1), x(h) + 1 + bw, P.b);
  }
  const over = M.overtakeHour();
  if (T >= over) {
    const X = x(over) + 1 + bw / 2, Y = y(M.doublePlan(over)) - 4;
    ctx.save(); ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - 5, Y - 8); ctx.lineTo(X + 5, Y - 8); ctx.closePath(); ctx.fill(); ctx.restore();
    L.reserve(X - 6, Y - 9, X + 6, Y);
    L.put(t('c0over'), [[X, Y - 12, 'center'], [X + 8, Y - 2], [X, Y - 26, 'center']], { color: C.green });
  }
  const aTop = y(M.addPlan(T)), bTop = y(M.doublePlan(T)), xa = x(T) - bw - 1, xb = x(T) + 1 + bw;
  L.put(t('c0B'), [[xb - bw / 2, bTop - 6, 'center'], [xb - bw - 4, bTop + 14, 'right'], [xb + 4, bTop + 12], [P.l + 8, P.t + 14]], { color: C.cyan, weight: 600 });
  L.put(t('c0A'), [[xa + bw / 2, aTop - 6, 'center'], [xa - 4, aTop - 6, 'right'], [xa - 4, aTop - 22, 'right'], [P.l + 8, P.t + 30], [P.l + 8, P.t + 46]], { color: C.orange, weight: 600 });
  // ledger: the last four hours, one column per hour
  const hs = []; for (let h = Math.max(0, T - (W < 360 ? 1 : W < 420 ? 2 : 3)); h <= T; h++) hs.push(h);
  const row = (head, cls, f) => `<tr><th>${head}</th>${hs.map(h => `<td class="${cls}">${f(h)}</td>`).join('')}</tr>`;
  $('tab0').innerHTML = row(t('thHour'), '', h => h) +
    row(t('thA'), 'a', h => big(M.addPlan(h))) + row(t('thdA'), 'chg', h => (h ? '+' + fmt(M.stepChange(h).dA) : '—')) +
    row(t('thB'), 'b', h => big(M.doublePlan(h))) + row(t('thrB'), 'chg', h => (h ? '×' + fmt(M.stepChange(h).rB) : '—'));
  const A = M.addPlan(T), B = M.doublePlan(T);
  const lead = A > B ? t('leadA', { d: big(A - B) }) : A === B ? t('leadTie') : t('leadB', { ratio: B / A >= 100 ? big(B / A) : fmt(B / A, 2), over });
  $('r0').textContent = (s0.playing ? t('playing', { t: T }) + ' ' : '') + t('s0readout', { t: T, A: big(A), B: big(B), Bx: pw(2, T), lead });
}

/* ---------- step 1: y = a^x ---------- */
const s1 = { ghosts: [] };
const X1 = { min: -3.2, max: 3.2 }, Y1 = { max: 8 };
function recordGhost(a) { if (!s1.ghosts.some(g => Math.abs(g - a) < 1e-9)) { s1.ghosts.push(a); if (s1.ghosts.length > 8) s1.ghosts.shift(); } }
function draw1() {
  const a = num('a1'), x0 = num('x1');
  $('a1v').textContent = fmt(a); $('x1v').textContent = fmt(x0, 1);
  const { ctx, W, H } = fitCanvas($('c1')), L = labeler(ctx, W, H);
  const P = { l: 36, r: W - 12, t: 32, b: H - 28 };
  const X = v => P.l + (v - X1.min) / (X1.max - X1.min) * (P.r - P.l), Y = v => P.b - v / Y1.max * (P.b - P.t);
  L.put(t('c1title'), [[8, 18]], { size: 12, weight: 600, bg: false });
  ctx.save(); ctx.lineWidth = 1;
  for (let v = 0; v <= Y1.max; v += 2) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X(0), P.t); ctx.lineTo(X(0), P.b); ctx.stroke(); ctx.restore();
  for (let v = 0; v <= Y1.max; v += 2) L.put(String(v), [[P.l - 6, Y(v) + 4, 'right']], { color: C.muted, bg: false });
  for (let v = -3; v <= 3; v++) L.put(fmt(v), [[X(v), P.b + 16, 'center']], { color: C.muted, bg: false });
  const curve = b => { const pts = []; for (let i = 0; i <= 240; i++) { const v = X1.min + i / 240 * (X1.max - X1.min); pts.push([X(v), Y(Math.min(M.pow(b, v), Y1.max * 1.5))]); } return pts; };
  clipRect(ctx, P);
  s1.ghosts.filter(g => Math.abs(g - a) > 1e-9).forEach(g => line(ctx, curve(g), C.ghost, 1.3, [5, 4], 0.75));
  line(ctx, curve(a), C.cyan, 2.6);
  const y0 = M.pow(a, x0), y1 = M.pow(a, x0 + 1);
  line(ctx, [[X(x0), Y(0)], [X(x0), Y(y0)]], C.cyan, 1.2, [3, 4], 0.7);
  line(ctx, [[X(x0), Y(y0)], [X(x0 + 1), Y(y0)], [X(x0 + 1), Y(y1)]], C.orange, 2.4);
  ctx.restore();
  dot(ctx, X(0), Y(1), 4.5, C.white);
  if (y0 <= Y1.max) dot(ctx, X(x0), Y(y0), 5.5, C.cyan, C.white);
  if (y1 <= Y1.max) dot(ctx, X(x0 + 1), Y(y1), 4.5, C.orange);
  // labels: the fixed point, the probe and the step factor
  const yy0 = Math.max(P.t + 10, Y(Math.min(y0, Y1.max))), yy1 = Math.max(P.t + 10, Y(Math.min(y1, Y1.max)));
  L.put('(0, 1)', [[X(0) + 8, Y(1) + 16], [X(0) - 8, Y(1) + 16, 'right'], [X(0) + 8, Y(1) - 8], [X(0) - 8, Y(1) - 8, 'right']], { color: C.white });
  L.put(`×${fmt(a)}`, [[X(x0 + 1) + 7, (yy0 + yy1) / 2 + 4], [X(x0 + 1) - 7, (yy0 + yy1) / 2 + 4, 'right'], [X(x0 + 1) + 7, yy1 + 16]], { color: C.orange, weight: 600 });
  L.put(`${fmt(a)}^${fmt(x0, 1)} ≈ ${fmt(y0, 3)}`, [[X(x0) - 8, yy0 - 8, 'right'], [X(x0) + 8, yy0 - 10], [X(x0) - 8, yy0 + 18, 'right'], [X(x0) + 8, yy0 + 18]], { color: C.cyan });
  const tr = M.trend(a);
  $('r1').textContent = t('s1readout', { a: fmt(a), x: fmt(x0, 1), p0: fmt(a) + '^' + fmt(x0, 1), p1: fmt(a) + '^' + fmt(x0 + 1, 1), y: fmt(y0, 3), y1: fmt(y1, 3), ratio: fmt(M.unitRatio(a, x0), 3), trend: t(tr === 'up' ? 'trendUp' : tr === 'down' ? 'trendDown' : 'trendFlat') });
}

/* ---------- step 2: the reverse question ---------- */
const s2 = { base: 2, y: 6, shown: -1 };   // shown: how many bracket rows are visible (−1 = none yet)
const HALVINGS = 8;
function draw2() {
  const b = s2.base, yT = s2.y, xs = M.log(b, yT), exact = M.isWhole(xs);
  $('y2v').textContent = fmt(yT, 3);
  ['b2', 'b3', 'b10'].forEach(id => $(id).setAttribute('aria-pressed', String(Number(id.slice(1)) === b)));
  const { ctx, W, H } = fitCanvas($('c2')), L = labeler(ctx, W, H);
  const P = { l: 40, r: W - 14, t: 32, b: H - 30 };
  const xMin = Math.min(-1, Math.floor(xs) - 1), xMax = Math.max(4, Math.ceil(xs) + 1);
  const yTicks = niceTicks(Math.max(2, yT * 1.5), 4), yMax = yTicks[yTicks.length - 1];
  const X = v => P.l + (v - xMin) / (xMax - xMin) * (P.r - P.l), Y = v => P.b - v / yMax * (P.b - P.t);
  L.put(t('c2title'), [[8, 18]], { size: 12, weight: 600, bg: false });
  ctx.save(); ctx.lineWidth = 1;
  for (const v of yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); }
  if (xMin < 0) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X(0), P.t); ctx.lineTo(X(0), P.b); ctx.stroke(); }
  ctx.restore();
  // bracket band and the x values tried so far
  const br = M.bracket(b, yT, HALVINGS);
  if (!exact && s2.shown >= 0) {
    const rows = br.rows.slice(0, s2.shown + 1), cur = rows[rows.length - 1];
    const lo = cur.mid === null ? cur.lo : (cur.big ? cur.lo : cur.mid), hi = cur.mid === null ? cur.hi : (cur.big ? cur.mid : cur.hi);
    ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.2)'; ctx.fillRect(X(lo), P.t, Math.max(1.5, X(hi) - X(lo)), P.b - P.t);
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1; ctx.strokeRect(X(lo), P.t, Math.max(1.5, X(hi) - X(lo)), P.b - P.t); ctx.restore();
    rows.forEach(r => { if (r.mid !== null) line(ctx, [[X(r.mid), P.b - 9], [X(r.mid), P.b]], r.big ? C.pink : C.green, 2); });
  }
  for (const v of yTicks) L.put(compact(v), [[P.l - 6, Y(v) + 4, 'right']], { color: C.muted, bg: false });
  for (let v = xMin; v <= xMax; v++) L.put(fmt(v), [[X(v), P.b + 16, 'center']], { color: C.muted, bg: false });
  const pts = []; for (let i = 0; i <= 300; i++) { const v = xMin + i / 300 * (xMax - xMin); pts.push([X(v), Y(Math.min(M.pow(b, v), yMax * 1.5))]); }
  clipRect(ctx, P); line(ctx, pts, C.cyan, 2.6);
  line(ctx, [[P.l, Y(yT)], [P.r, Y(yT)]], C.orange, 1.6, [6, 4]);
  line(ctx, [[X(xs), Y(yT)], [X(xs), P.b]], C.orange, 1.6, [3, 3]);
  ctx.restore();
  dot(ctx, X(xs), Y(yT), 5.5, C.orange, C.white);
  dot(ctx, X(xs), P.b, 4, C.orange);
  const xTxt = exact ? fmt(xs, 0) : '≈ ' + fmt(xs, 3);
  L.put(`y = ${fmt(yT, 3)}`, [[P.r - 4, Y(yT) - 7, 'right'], [P.l + 6, Y(yT) - 7], [P.r - 4, Y(yT) + 16, 'right']], { color: C.orange });
  L.put(`x ${exact ? '= ' : ''}${xTxt}`, [[X(xs) + 7, P.b - 12], [X(xs) - 7, P.b - 12, 'right'], [X(xs) + 7, P.b - 28], [X(xs) - 7, P.b - 28, 'right']], { color: C.orange, weight: 600 });
  L.put(`${logName(b)} ${fmt(yT, 3)}`, [[X(xs) + 8, Y(yT) - 9], [X(xs) - 8, Y(yT) - 9, 'right'], [X(xs) + 8, Y(yT) + 18], [X(xs) - 8, Y(yT) + 18, 'right']], { color: C.text });
  // readouts
  const P2 = { a: b, y: fmt(yT, 3), L: logName(b) };
  let txt;
  if (exact) txt = xs < 0 ? t('s2readoutExactNeg', { ...P2, x: fmt(xs, 0), pabs: pw(b, Math.round(-xs)) }) : t('s2readoutExact', { ...P2, x: fmt(xs, 0) });
  else { const lo = Math.floor(xs), hi = lo + 1; txt = t('s2readout', { ...P2, x: fmt(xs, 3), lo: fmt(lo), hi: fmt(hi), Plo: pw(b, lo), Phi: pw(b, hi), plo: fmt(M.pow(b, lo), 3), phi: fmt(M.pow(b, hi), 3) }); }
  const list = $('guesses2'); list.innerHTML = '';
  if (s2.shown >= 0) {
    if (exact) { const li = document.createElement('li'); li.textContent = t('guessExact', P2); list.appendChild(li); }
    else br.rows.slice(0, s2.shown + 1).forEach((r, i, arr) => {
      const li = document.createElement('li');
      if (i === 0) li.textContent = t('guess0', { ...P2, lo: fmt(r.lo), hi: fmt(r.hi), Plo: pw(b, r.lo), Phi: pw(b, r.hi), plo: fmt(M.pow(b, r.lo), 3), phi: fmt(M.pow(b, r.hi), 3) });
      else if (r.mid === null) li.textContent = t('guessEnd', { ...P2, k: HALVINGS, w: fmt(br.hi - br.lo, 4), mid: fmt((br.lo + br.hi) / 2, 4), x: fmt(xs, 4) });
      else li.textContent = t(r.big ? 'guessBig' : 'guessSmall', { ...P2, mid: fmt(r.mid, 4), Pmid: pw(b, r.mid), p: fmt(r.p, 3), lo: fmt(r.lo, 4), hi: fmt(r.hi, 4) });
      if (i === arr.length - 1) li.className = 'cur';
      list.appendChild(li);
    });
    if (!exact) txt = t('bisectProgress', { k: Math.min(s2.shown, HALVINGS), N: HALVINGS }) + ' ' + txt;
  }
  $('r2').textContent = txt;
}
function setTarget(v) { stopAnim('s2'); s2.y = v; s2.shown = -1; $('y2').value = v; draw2(); }

/* ---------- step 3: the log ruler ---------- */
function ruler(ctx, L, W, yBase, xOf, maxPos) {
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xOf(0), yBase); ctx.lineTo(xOf(maxPos), yBase); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = C.muted;
  for (let v = 2; v <= 32; v++) if ((v & (v - 1)) !== 0) { const X = xOf(M.rulerPos(v)); ctx.beginPath(); ctx.moveTo(X, yBase); ctx.lineTo(X, yBase + 5); ctx.stroke(); }
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5;
  for (let k = 0; k <= maxPos; k++) { const X = xOf(k); ctx.beginPath(); ctx.moveTo(X, yBase - 4); ctx.lineTo(X, yBase + 9); ctx.stroke(); }
  ctx.restore();
  // power-of-two labels, the sparse ones first so narrow screens keep an even spread
  for (const k of [0, 2, 4, 6, 8, 10, 1, 3, 5, 7, 9]) L.put(String(Math.pow(2, k)), [[xOf(k), yBase + 22, 'center']], { color: C.muted, bg: false, size: 10.5 });
}
function draw3() {
  const m = num('m3'), n = num('n3'), k = num('k3');
  $('m3v').textContent = m; $('n3v').textContent = n; $('k3v').textContent = k;
  const { ctx, W, H } = fitCanvas($('c3')), L = labeler(ctx, W, H);
  const pad = 18, xOf = p => pad + p / M.RULER_MAX * (W - 2 * pad);
  const lm = M.rulerPos(m), ln = M.rulerPos(n), mn = m * n, mk = Math.pow(m, k), kl = k * lm;
  L.put(t('c3top'), [[8, 18]], { size: 12, weight: 600, bg: false });
  L.put(t('c3bot'), [[8, 164]], { size: 12, weight: 600, bg: false });
  const y1 = 100, y2 = 248;
  ruler(ctx, L, W, y1, xOf, M.RULER_MAX); ruler(ctx, L, W, y2, xOf, M.RULER_MAX);
  // top: m then n, end to end
  if (lm > 0) arrow(ctx, xOf(0), y1 - 18, xOf(lm), y1 - 18, C.orange);
  if (ln > 0) arrow(ctx, xOf(lm), y1 - 18, xOf(lm + ln), y1 - 18, C.cyan);
  dot(ctx, xOf(lm + ln), y1, 5, C.white);
  line(ctx, [[xOf(lm + ln), y1 - 30], [xOf(lm + ln), y1]], C.white, 1, [2, 3]);
  L.reserve(xOf(0) - 2, y1 - 24, xOf(lm + ln) + 2, y1 - 12);
  L.put(`${m} × ${n} = ${mn}`, [[xOf(lm + ln), y1 - 36, 'center'], [xOf(lm + ln) - 4, y1 - 36, 'right'], [xOf(lm + ln) + 4, y1 - 36]], { color: C.white, weight: 600 });
  if (lm > 0) L.put('log₂ ' + m, [[xOf(lm / 2), y1 - 50, 'center'], [xOf(lm / 2), y1 - 64, 'center']], { color: C.orange, size: 10.5 });
  if (ln > 0) L.put('log₂ ' + n, [[xOf(lm + ln / 2), y1 - 50, 'center'], [xOf(lm + ln / 2), y1 - 64, 'center']], { color: C.cyan, size: 10.5 });
  // bottom: k copies of the same length
  const end = Math.min(kl, M.RULER_MAX);
  for (let i = 0; i < k; i++) {
    const a0 = i * lm, a1 = Math.min((i + 1) * lm, M.RULER_MAX);
    if (a0 >= M.RULER_MAX || lm === 0) break;
    arrow(ctx, xOf(a0), y2 - 18, xOf(a1), y2 - 18, i % 2 ? '#4fb989' : C.green);
  }
  dot(ctx, xOf(end), y2, 5, C.white);
  L.reserve(xOf(0) - 2, y2 - 24, xOf(end) + 2, y2 - 12);
  const off = kl > M.RULER_MAX + 1e-9;
  L.put(`${m}${sup(k)} = ${big(mk)}${off ? ' →' : ''}`, [[xOf(end), y2 - 36, 'center'], [xOf(end) - 4, y2 - 36, 'right'], [xOf(end) + 4, y2 - 36]], { color: C.white, weight: 600 });
  $('r3').textContent = t('s3readout', { m, n, k, lm: fmt(lm, 3), ln: fmt(ln, 3), sum: fmt(lm + ln, 3), psum: M.isWhole(lm + ln) ? pw(2, Math.round(lm + ln)) : '2^' + fmt(lm + ln, 3), pk: pw(m, k), mn, kl: fmt(kl, 3), mk: big(mk), off: off ? t('offRuler') : '' });
}

/* ---------- step 4: log scale ---------- */
const s4 = { log: false, tick: 2 };
function draw4() {
  const r = num('r4'); $('r4v').textContent = fmt(r);
  $('axLin').setAttribute('aria-pressed', String(!s4.log)); $('axLog').setAttribute('aria-pressed', String(s4.log));
  $('tk2').setAttribute('aria-pressed', String(s4.tick === 2)); $('tk10').setAttribute('aria-pressed', String(s4.tick === 10));
  $('tk2').disabled = $('tk10').disabled = !s4.log;
  const { ctx, W, H } = fitCanvas($('c4')), L = labeler(ctx, W, H);
  const P = { l: 56, r: W - 14, t: 32, b: H - 40 };
  const Tmax = 24, top = Math.max(M.growth(r, Tmax), M.addPlan(Tmax));
  const X = v => P.l + v / Tmax * (P.r - P.l);
  let Y, ticks = [];
  if (s4.log) {
    const L2max = Math.log2(top);
    Y = v => P.b - Math.log2(Math.max(v, 1)) / L2max * (P.b - P.t);
    const base = s4.tick, kmax = Math.floor(Math.log(top) / Math.log(base) + 1e-9);
    const minPx = 20, pxPer = (P.b - P.t) / L2max * Math.log2(base);
    const every = Math.max(1, Math.ceil(minPx / pxPer));
    for (let k = 0; k <= kmax; k += every) ticks.push({ v: Math.pow(base, k), s: k === 0 ? '1' : base + sup(k) });
  } else {
    const tk = niceTicks(top, 4), yMax = tk[tk.length - 1];
    Y = v => P.b - v / yMax * (P.b - P.t);
    ticks = tk.map(v => ({ v, s: compact(v) }));
  }
  L.put(t(s4.log ? 'c4titleLog' : 'c4titleLin'), [[8, 18]], { size: 12, weight: 600, bg: false });
  ctx.save(); ctx.lineWidth = 1;
  for (const k of ticks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(k.v)); ctx.lineTo(P.r, Y(k.v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke(); ctx.restore();
  for (const k of ticks) L.put(k.s, [[P.l - 6, Y(k.v) + 4, 'right']], { color: C.muted, bg: false });
  for (let h = 0; h <= 24; h += 6) L.put(String(h), [[X(h), P.b + 16, 'center']], { color: C.muted, bg: false });
  L.put(t('c4x'), [[P.r, P.b + 32, 'right']], { color: C.muted, bg: false, size: 10.5 });
  const ptsE = [], ptsA = [];
  for (let i = 0; i <= 240; i++) { const v = i / 240 * Tmax; ptsE.push([X(v), Y(M.growth(r, v))]); ptsA.push([X(v), Y(M.addPlan(v))]); }
  clipRect(ctx, P); line(ctx, ptsA, C.orange, 2.2); line(ctx, ptsE, C.cyan, 2.6); ctx.restore();
  const T = M.doublingTime(r);
  for (let k = 1; k * T <= Tmax + 1e-9; k++) dot(ctx, X(k * T), Y(Math.pow(2, k)), 3.2, C.white);
  const y24 = M.growth(r, Tmax), l2 = Math.log2(y24), l10 = Math.log10(y24);
  for (let i = 200; i < 240; i += 4) { L.reserve(ptsE[i][0] - 2, ptsE[i + 4][1] - 2, ptsE[i + 4][0] + 2, ptsE[i][1] + 2); L.reserve(ptsA[i][0] - 2, ptsA[i + 4][1] - 2, ptsA[i + 4][0] + 2, ptsA[i][1] + 2); }
  L.put(`${fmt(r)}²⁴`, [[X(Tmax) - 8, Y(y24) + 16, 'right'], [X(Tmax) - 14, Y(y24) + 4, 'right'], [X(Tmax) - 30, Y(y24) + 20, 'right']], { color: C.cyan, weight: 600 });
  L.put('1 + 3t', [[X(Tmax) - 6, Y(M.addPlan(Tmax)) - 8, 'right'], [X(Tmax) - 6, Y(M.addPlan(Tmax)) + 16, 'right'], [X(16), Y(M.addPlan(16)) - 10, 'center'], [X(16), Y(M.addPlan(16)) + 16, 'center']], { color: C.orange });
  $('out4').textContent = t('s4readout', { r: fmt(r), T: fmt(T, 2), r72: fmt(M.rule72(r), 2), note: t(M.rule72Close(r) ? 'r72good' : 'r72bad'), y24: big(y24), l2: fmt(l2, 2), l10: fmt(l10, 2), ratio: fmt(l2 / l10, 3) });
}

/* ---------- step 5: quiz ---------- */
function checkQuiz() {
  [['q1', 'f1', M.QUIZ.q1, v => fmt(v, 0)], ['q2', 'f2', M.QUIZ.q2, v => fmt(v, 0)], ['q3', 'f3', M.QUIZ.q3, v => big(v)]].forEach(([q, f, v, show]) => {
    const pick = document.querySelector(`input[name="${q}"]:checked`), el = $(f);
    if (!pick) { el.textContent = t('q0'); el.className = 'quiz-feedback bad'; el.dataset.state = 'empty'; return; }
    const ok = pick.value === M.quizKey(q);
    el.textContent = t(q + (ok ? 'ok' : 'no'), { v: show(v), pick: t(q + pick.value) });
    el.className = 'quiz-feedback' + (ok ? '' : ' bad'); el.dataset.state = ok ? 'correct' : 'wrong';
  });
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  ['f1', 'f2', 'f3'].forEach(id => { if ($(id).dataset.state) checkQuiz(); });
}

function setup() {
  $('t0').addEventListener('input', () => { stopAnim('s0'); s0.playing = false; draw0(); });
  $('play0').addEventListener('click', () => {
    s0.playing = true;
    animate('s0', 24 * 280, p => { $('t0').value = Math.round(p * 24); draw0(); }, () => { s0.playing = false; draw0(); });
  });

  $('a1').addEventListener('input', draw1);
  $('a1').addEventListener('change', () => { recordGhost(num('a1')); draw1(); });
  $('x1').addEventListener('input', draw1);
  [['a1p2', 2], ['a1p1', 1], ['a1ph', 0.5]].forEach(([id, v]) => $(id).addEventListener('click', () => { recordGhost(num('a1')); $('a1').value = v; recordGhost(v); draw1(); }));
  $('clear1').addEventListener('click', () => { s1.ghosts = []; draw1(); });
  recordGhost(num('a1'));

  [['b2', 2], ['b3', 3], ['b10', 10]].forEach(([id, v]) => $(id).addEventListener('click', () => { stopAnim('s2'); s2.base = v; s2.shown = -1; draw2(); }));
  $('y2').addEventListener('input', () => { stopAnim('s2'); s2.y = num('y2'); s2.shown = -1; draw2(); });
  [['p8', 8], ['p32', 32], ['p6', 6], ['p18', 1 / 8]].forEach(([id, v]) => $(id).addEventListener('click', () => setTarget(v)));
  $('bisect2').addEventListener('click', () => {
    const steps = HALVINGS + 1;
    s2.shown = 0; draw2();
    animate('s2', steps * 650, p => { s2.shown = Math.min(steps, Math.floor(p * (steps + 1))); draw2(); });
  });

  ['m3', 'n3', 'k3'].forEach(id => $(id).addEventListener('input', draw3));
  $('r4').addEventListener('input', draw4);
  $('axLin').addEventListener('click', () => { s4.log = false; draw4(); });
  $('axLog').addEventListener('click', () => { s4.log = true; draw4(); });
  $('tk2').addEventListener('click', () => { s4.tick = 2; draw4(); });
  $('tk10').addEventListener('click', () => { s4.tick = 10; draw4(); });
  $('checkQuiz').addEventListener('click', checkQuiz);

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
