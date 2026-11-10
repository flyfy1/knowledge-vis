'use strict';
// Binomial-to-normal lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.BN_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks, one caption row and the path counts on the step-0 pegboard; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BN_MODEL;
const t = (...a) => window.BN_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', ball: '#ffd27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', off: '#3a4a5e', soft: '#c9d5e3', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const trim = s => (s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const f4 = v => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4);
const sgn4 = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(4);
const pOf = id => M.P_STEPS[num(id)];

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
function label(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Plot panel: title row above, ticks left/below; x tick labels skip themselves when they would collide.
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const L = v => Math.log10(v);
  const x = o.logX ? v => P.l + (L(v) - L(o.xMin)) / (L(o.xMax) - L(o.xMin)) * (P.r - P.l) : v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = o.logY ? v => P.b - (L(v) - L(o.yMin)) / (L(o.yMax) - L(o.yMin)) * (P.b - P.t) : v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText((o.yFmt || String)(v), P.l - 6, y(v) + 4); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  let lastR = -Infinity; ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    const X = x(v), s = (o.xFmt || String)(v), w = ctx.measureText(s).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    const cx = Math.min(Math.max(X, w / 2 + 2), W - w / 2 - 2);
    if (cx - w / 2 < lastR + 6) continue;
    ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
  }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
const caption = (ctx, m, text, W, H) => label(ctx, text, m.P.l + (m.P.r - m.P.l) / 2, H - 10, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
const dot = (ctx, X, Y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } };
function intTicks(lo, hi, target) { const span = hi - lo, steps = [1, 2, 5, 10, 20, 25, 50, 100]; const s = steps.find(v => span / v <= target) || 100; const out = []; for (let v = Math.ceil(lo / s) * s; v <= hi + 1e-9; v += s) out.push(v); return out; }
function niceTop(v) { for (const s of [0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) if (v <= s) return s; return 1; }
function yTicksFor(top) { const st = top <= 0.05 ? 0.01 : top <= 0.1 ? 0.02 : top <= 0.3 ? 0.05 : top <= 0.6 ? 0.1 : 0.2; const a = []; for (let v = 0; v <= top + 1e-9; v += st) a.push(Number(v.toFixed(2))); return a; }
const yFmt = v => trim(v.toFixed(2));
// Bars of width 1 centred on whole numbers; heights are probabilities (so area = probability).
function bars(ctx, m, vals, k0, color, { outline = null, lw = 1.5, from = -Infinity, to = Infinity, alt = null } = {}) {
  const w = Math.max(1, m.x(1) - m.x(0));
  ctx.save();
  vals.forEach((v, i) => {
    const k = k0 + i; if (k < from - 0.5 || k > to + 0.5) return;
    const x0 = m.x(k - 0.5), Y = m.y(v);
    if (color) { ctx.fillStyle = alt && alt(k) ? alt(k) : color; ctx.fillRect(x0 + (w > 4 ? 0.5 : 0), Y, w > 4 ? w - 1 : w, m.P.b - Y); }
  });
  if (outline) {
    ctx.strokeStyle = outline; ctx.lineWidth = lw; ctx.beginPath(); let first = true;
    vals.forEach((v, i) => { const k = k0 + i; if (k < from - 0.5 || k > to + 0.5) return; const Y = m.y(v); if (first) { ctx.moveTo(m.x(k - 0.5), m.P.b); first = false; } ctx.lineTo(m.x(k - 0.5), Y); ctx.lineTo(m.x(k + 0.5), Y); });
    if (!first) { const kl = Math.min(to, k0 + vals.length - 1); ctx.lineTo(m.x(kl + 0.5), m.P.b); }
    ctx.stroke();
  }
  ctx.restore();
}
function curve(ctx, m, f, a, b, color, lw = 2.2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= 300; i++) { const x = a + (b - a) * i / 300, Y = m.y(f(x)); if (!i) ctx.moveTo(m.x(x), Y); else ctx.lineTo(m.x(x), Y); }
  ctx.stroke(); ctx.restore();
}
const vline = (ctx, m, X, color, dash = [5, 4], lw = 1.6) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X, m.P.t); ctx.lineTo(X, m.P.b); ctx.stroke(); ctx.restore(); };

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: counting paths on the pegboard ---------- */
const s0 = { idx: 0, seen: new Set([0]) };
const PASCAL = M.pascal(12);
function draw0() {
  const n = num('n0'), k = Math.min(num('k0'), n), all = M.paths(n, k);
  $('n0v').textContent = String(n); $('k0v').textContent = String(k);
  const { ctx, W, H } = fitCanvas($('c0'));
  label(ctx, t('c0title'), 8, 17, W - 16);
  const top = 46, bottom = H - 62, dx = Math.min(56, (W - 24) / (n + 1)), dy = (bottom - top) / n, cx = W / 2;
  const pos = (r, j) => [cx + (j - r / 2) * dx, top + r * dy];
  const reach = (r, j) => j <= k && r - j <= n - k;
  // edges
  ctx.save(); ctx.lineWidth = 1.2;
  for (let r = 0; r < n; r++) for (let j = 0; j <= r; j++) for (const d of [0, 1]) {
    const [x0, y0] = pos(r, j), [x1, y1] = pos(r + 1, j + d);
    ctx.strokeStyle = reach(r, j) && reach(r + 1, j + d) ? 'rgba(255,180,84,0.45)' : C.grid; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  ctx.restore();
  // seen paths (faint) and the current path (bright)
  const trace = (path, color, lw, alpha) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.beginPath(); let j = 0; let [X, Y] = pos(0, 0); ctx.moveTo(X, Y); for (let r = 0; r < n; r++) { if (path[r] === 'R') j++; [X, Y] = pos(r + 1, j); ctx.lineTo(X, Y); } ctx.stroke(); ctx.restore(); };
  s0.seen.forEach(i => { if (i !== s0.idx && all[i]) trace(all[i], C.cyan, 2.4, 0.28); });
  if (all[s0.idx]) trace(all[s0.idx], C.cyan, 3.6, 1);
  // nodes with path counts
  const fs = Math.max(8, Math.min(13, dx * 0.42, dy * 0.5));
  for (let r = 0; r <= n; r++) for (let j = 0; j <= r; j++) {
    const [X, Y] = pos(r, j), on = reach(r, j), s = String(PASCAL[r][j]);
    ctx.save(); ctx.font = `600 ${fs}px system-ui,sans-serif`;
    const bw = Math.max(fs * 1.25, ctx.measureText(s).width + 6), bh = fs + 5;
    ctx.fillStyle = C.bg; ctx.strokeStyle = on ? C.orange : C.off; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(X - bw / 2, Y - bh / 2, bw, bh); ctx.fill(); ctx.stroke();
    ctx.fillStyle = on ? C.orange : C.muted; ctx.textAlign = 'center'; ctx.fillText(s, X, Y + fs * 0.36); ctx.restore();
  }
  // bin index row
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  for (let j = 0; j <= n; j++) { const [X] = pos(n, j); ctx.fillStyle = j === k ? C.text : C.muted; if (j === k) ctx.font = '700 12px system-ui,sans-serif'; else ctx.font = '11px system-ui,sans-serif'; ctx.fillText(String(j), X, bottom + 26); }
  ctx.restore();
  label(ctx, t('c0axis'), W / 2, H - 12, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  const c = PASCAL[n][k], tot = Math.pow(2, n);
  $('r0').textContent = t('s0readout', { n, k, c, tot, pr: f4(c / tot), i: Math.min(s0.idx + 1, c), seen: s0.seen.size, path: (all[s0.idx] || '').split('').map(ch => t(ch === 'L' ? 'pathL' : 'pathR')).join('') });
}
function reset0() { stopAnim('s0'); s0.idx = 0; s0.seen = new Set([0]); }

/* ---------- step 1: the Galton board ---------- */
const s1 = { rng: M.mulberry32(77), counts: [], total: 0, ball: null };
function reset1() { stopAnim('s1'); const n = num('n1'); s1.counts = new Array(n + 1).fill(0); s1.total = 0; s1.ball = null; lock1(false); }
function lock1(on) { ['drop1', 'drop100', 'drop1000'].forEach(id => { $(id).disabled = on; }); }
function draw1() {
  const n = num('n1'), p = pOf('p1'), exact = M.pmfAll(n, p);
  $('n1v').textContent = String(n); $('p1v').textContent = p.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c1'));
  const share = s1.counts.map(c => (s1.total ? c / s1.total : 0));
  const top = niceTop(Math.max(...exact, ...share) * 1.08);
  const m = panel(ctx, W, { top: 236, bottom: H - 42, xMin: -0.6, xMax: n + 0.6, yMin: 0, yMax: top, yTicks: yTicksFor(top), yFmt, xTicks: intTicks(0, n, 13), title: t('c1hist') });
  // pegboard above the histogram, aligned with the bins
  label(ctx, t('c1board', { n, p: p.toFixed(2) }), 8, 17, W - 16);
  const bTop = 40, bBot = 196, dy = (bBot - bTop) / Math.max(1, n);
  const peg = (r, j) => [m.x(j + (n - r) / 2), bTop + r * dy];
  ctx.save(); ctx.fillStyle = C.ghost;
  for (let r = 0; r < n; r++) for (let j = 0; j <= r; j++) { const [X, Y] = peg(r, j); ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, 7); ctx.fill(); }
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let k = 0; k <= n + 1; k++) { const X = m.x(k - 0.5); ctx.beginPath(); ctx.moveTo(X, bBot + 6); ctx.lineTo(X, bBot + 24); ctx.stroke(); }
  ctx.restore();
  bars(ctx, m, share, 0, 'rgba(103,215,249,0.8)');
  bars(ctx, m, exact, 0, null, { outline: C.orange, lw: 1.8 });
  if (s1.ball) {
    const { steps, prog } = s1.ball, pos = prog * n, r = Math.floor(pos), f = pos - r;
    let j = 0; for (let i = 0; i < Math.min(r, n); i++) j += steps[i];
    const [x0, y0] = peg(Math.min(r, n), j), [x1, y1] = r < n ? peg(r + 1, j + steps[r]) : [x0, y0 + 20];
    ctx.save(); ctx.strokeStyle = 'rgba(255,210,122,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); let jj = 0; let [X, Y] = peg(0, 0); ctx.moveTo(X, Y);
    for (let i = 0; i < Math.min(r, n); i++) { jj += steps[i]; [X, Y] = peg(i + 1, jj); ctx.lineTo(X, Y); } ctx.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); ctx.stroke(); ctx.restore();
    dot(ctx, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f - 5, 5, C.ball, C.bg);
  }
  caption(ctx, m, t('c1axis'), W, H);
  if (!s1.total) { $('r1').textContent = t('s1none', { n, p: p.toFixed(2) }); return; }
  let gap = 0, at = 0; exact.forEach((q, k) => { const d = Math.abs(share[k] - q); if (d > gap) { gap = d; at = k; } });
  $('r1').textContent = t('s1readout', { N: s1.total, d: f4(gap), k: at, o: f4(share[at]), e: f4(exact[at]) });
}
function drop1() {
  const n = num('n1'), p = pOf('p1'), d = M.drop(n, p, s1.rng);
  lock1(true);
  animate('s1', 260 * n + 300, q => { s1.ball = { steps: d.steps, prog: Math.min(1, q * (1 + 300 / (260 * n))) }; draw1(); }, () => { s1.ball = null; s1.counts[d.k]++; s1.total++; lock1(false); draw1(); });
}
function dropMany(N) {
  const n = num('n1'), p = pOf('p1'), ks = []; for (let i = 0; i < N; i++) ks.push(M.drop(n, p, s1.rng).k);
  let added = 0; lock1(true); s1.ball = null;
  animate('s1', N >= 1000 ? 1800 : 1200, q => { const tgt = q >= 1 ? N : Math.floor(q * N); while (added < tgt) { s1.counts[ks[added]]++; s1.total++; added++; } draw1(); }, () => { lock1(false); draw1(); });
}

/* ---------- step 2: centre and spread ---------- */
const s2 = { ghosts: [] };
function draw2() {
  const n = num('n2'), p = pOf('p2'), P = M.pmfAll(n, p), mu = M.mean(n, p), s = M.sd(n, p);
  $('n2v').textContent = String(n); $('p2v').textContent = p.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c2'));
  const ghostVals = s2.ghosts.map(g => M.pmfAll(g.n, g.p));
  const top = niceTop(Math.max(...P, ...ghostVals.map(v => Math.max(...v))) * 1.08);
  const m = panel(ctx, W, { top: 30, bottom: H - 42, xMin: -0.5, xMax: 100.5, yMin: 0, yMax: top, yTicks: yTicksFor(top), yFmt, xTicks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], title: t('c2title') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.14)'; ctx.fillRect(m.x(mu - s), m.P.t, m.x(mu + s) - m.x(mu - s), m.P.b - m.P.t);
  ctx.strokeStyle = 'rgba(126,226,168,0.7)'; ctx.lineWidth = 1; [mu - s, mu + s].forEach(v => { ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); }); ctx.restore();
  ghostVals.forEach(v => bars(ctx, m, v, 0, null, { outline: C.ghost, lw: 1.2 }));
  bars(ctx, m, P, 0, C.cyan);
  vline(ctx, m, m.x(mu), C.orange, [], 2.2);
  caption(ctx, m, t('c2axis'), W, H);
  $('r2').textContent = t('s2readout', { n, p: p.toFixed(2), mu: trim(mu.toFixed(2)), v: trim(M.variance(n, p).toFixed(3)), s: s.toFixed(3), lo: trim((mu - s).toFixed(2)), hi: trim((mu + s).toFixed(2)), w: (100 * M.within1sd(n, p)).toFixed(1) });
}
function ghost2(prev) { const last = s2.ghosts[s2.ghosts.length - 1]; if (last && last.n === prev.n && last.p === prev.p) return; s2.ghosts.push(prev); if (s2.ghosts.length > 2) s2.ghosts.shift(); }

/* ---------- step 3: the bell over the bars ---------- */
function draw3() {
  const n = num('n3'), p = pOf('p3'), P = M.pmfAll(n, p), mu = M.mean(n, p), s = M.sd(n, p), F = M.fit(n, p);
  $('n3v').textContent = String(n); $('p3v').textContent = p.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c3'));
  let lo = Math.max(-0.5, Math.floor(mu - 4.2 * s) - 0.5), hi = Math.min(n + 0.5, Math.ceil(mu + 4.2 * s) + 0.5);
  while (hi - lo < 8 && (lo > -0.5 || hi < n + 0.5)) { if (lo > -0.5) lo--; if (hi < n + 0.5) hi++; }
  const top = niceTop(Math.max(F.peak, F.bellPeak) * 1.08);
  const m = panel(ctx, W, { top: 30, bottom: H - 42, xMin: lo, xMax: hi, yMin: 0, yMax: top, yTicks: yTicksFor(top), yFmt, xTicks: intTicks(Math.ceil(lo), Math.floor(hi), 12), title: t('c3title', { n, p: p.toFixed(2) }) });
  bars(ctx, m, P, 0, 'rgba(103,215,249,0.78)', { from: Math.ceil(lo), to: Math.floor(hi) });
  ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 4, m.P.r - m.P.l, m.P.b - m.P.t + 4); ctx.clip();
  curve(ctx, m, x => M.normalDensity(n, p, x), lo, hi, C.pink, 2.4);
  ctx.restore();
  const X = m.x(F.at), y1 = m.y(P[F.at]), y2 = m.y(Math.min(top, M.normalDensity(n, p, F.at)));
  ctx.save(); ctx.strokeStyle = C.ball; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, y1); ctx.lineTo(X, y2); ctx.stroke(); dot(ctx, X, y1, 3, C.ball); dot(ctx, X, y2, 3, C.ball); ctx.restore();
  caption(ctx, m, t('c3axis'), W, H);
  $('r3').textContent = t('s3readout', { mu: trim(mu.toFixed(2)), s: s.toFixed(3), k: F.at, bar: f4(P[F.at]), bell: f4(M.normalDensity(n, p, F.at)), gap: f4(F.gap), rel: (100 * F.gap / F.peak).toFixed(1) })
    + t(F.rule ? 's3ruleYes' : 's3ruleNo', { a: trim((n * p).toFixed(2)), b: trim((n * (1 - p)).toFixed(2)) })
    + (Math.abs(p - 0.5) > 1e-9 && !F.rule ? t(p < 0.5 ? 's3skewR' : 's3skewL') : '');
}

/* ---------- step 4: standardise, then let n grow ---------- */
const s4 = { seen: new Set([0]) };
function draw4() {
  const idx = num('n4'), n = M.N4[idx], p = pOf('p4'), F = M.fit(n, p), s = M.sd(n, p);
  $('n4v').textContent = String(n); $('p4v').textContent = p.toFixed(2);
  let { ctx, W, H } = fitCanvas($('c4'));
  const m = panel(ctx, W, { top: 30, bottom: H - 42, xMin: -4, xMax: 4, yMin: 0, yMax: 0.6, yTicks: [0, 0.2, 0.4, 0.6], yFmt: v => trim(v.toFixed(1)), xTicks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], xFmt: v => (v < 0 ? '−' + -v : String(v)), title: t('c4a') });
  const zbars = (nn, fill, outline, lw) => {
    const mm = M.mean(nn, p), ss = M.sd(nn, p);
    ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 2, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip();
    if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = lw; ctx.beginPath(); }
    let first = true;
    for (let k = 0; k <= nn; k++) {
      const z0 = (k - 0.5 - mm) / ss, z1 = (k + 0.5 - mm) / ss; if (z1 < -4.2 || z0 > 4.2) continue;
      const v = Math.min(0.6, ss * M.pmf(nn, k, p)), Y = m.y(v);
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(m.x(z0) + 0.5, Y, Math.max(1, m.x(z1) - m.x(z0) - 1), m.P.b - Y); }
      if (outline) { if (first) { ctx.moveTo(m.x(z0), m.P.b); first = false; } ctx.lineTo(m.x(z0), Y); ctx.lineTo(m.x(z1), Y); }
    }
    if (outline) ctx.stroke();
    ctx.restore();
  };
  [...s4.seen].forEach(i => { if (i !== idx) zbars(M.N4[i], null, 'rgba(134,150,170,0.55)', 1.1); });
  zbars(n, 'rgba(103,215,249,0.7)');
  curve(ctx, m, M.phi, -4, 4, C.pink, 2.4);
  caption(ctx, m, t('c4axis'), W, H);
  // decay of the largest standardised gap with n (log–log)
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const g = M.N4.map(nn => M.fit(nn, p).zGap), ref = M.N4.map(nn => M.fit(nn, 0.5).zGap);
  const B = panel(ctx, W, { top: 30, bottom: H - 42, left: 50, xMin: 3, xMax: 500, logX: true, yMin: 1e-4, yMax: 0.3, logY: true, yTicks: [1e-4, 1e-3, 1e-2, 0.1], yFmt: v => trim(v.toFixed(4)), xTicks: [4, 16, 64, 256], title: t('c4b') });
  const poly = (vals, color, dash, lw) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); vals.forEach((v, i) => { const X = B.x(M.N4[i]), Y = B.y(Math.max(1e-4, v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore(); };
  poly(ref, C.muted, [5, 4], 1.4);
  poly(g, 'rgba(232,237,244,0.45)', null, 1.4);
  g.forEach((v, i) => { if (s4.seen.has(i)) dot(ctx, B.x(M.N4[i]), B.y(Math.max(1e-4, v)), i === idx ? 5.5 : 3.5, i === idx ? C.cyan : C.text); });
  caption(ctx, B, t('c4baxis'), W, H);
  $('r4').textContent = t('s4readout', { n, p: p.toFixed(2), s: s.toFixed(3), g: f4(F.zGap), rel: (100 * F.zGap / M.phi(0)).toFixed(1), sk: (F.skew >= 0 ? '' : '−') + Math.abs(F.skew).toFixed(3) })
    + t(F.rule ? 's3ruleYes' : 's3ruleNo', { a: trim((n * p).toFixed(2)), b: trim((n * (1 - p)).toFixed(2)) });
}
function grow4() {
  s4.seen = new Set([0]); $('n4').value = 0;
  const N = M.N4.length;
  animate('s4', N * 420, q => { const i = Math.min(N - 1, Math.floor(q * N)); for (let j = 0; j <= i; j++) s4.seen.add(j); $('n4').value = i; draw4(); });
}

/* ---------- step 5: tail probability and the half-unit correction ---------- */
function draw5() {
  const n = num('n5'); const kIn = $('k5'); if (Number(kIn.max) !== n) { kIn.max = n; if (num('k5') > n) kIn.value = n; }
  const k = num('k5'), p = 0.5, P = M.pmfAll(n, p), mu = M.mean(n, p), s = M.sd(n, p), T = M.tail(n, p, k);
  $('n5v').textContent = String(n); $('k5v').textContent = String(k);
  const { ctx, W, H } = fitCanvas($('c5'));
  const lo = Math.max(-0.5, Math.floor(mu - 4.5 * s) - 0.5), hi = Math.min(n + 0.5, Math.ceil(mu + 4.5 * s) + 0.5);
  const top = niceTop(Math.max(...P) * 1.12);
  const m = panel(ctx, W, { top: 30, bottom: H - 42, xMin: lo, xMax: hi, yMin: 0, yMax: top, yTicks: yTicksFor(top), yFmt, xTicks: intTicks(Math.ceil(lo), Math.floor(hi), 12), title: t('c5title', { n, k }) });
  bars(ctx, m, P, 0, 'rgba(103,215,249,0.35)', { from: Math.ceil(lo), to: Math.floor(hi), alt: kk => (kk >= k ? 'rgba(255,180,84,0.85)' : null) });
  // area under the bell from k − 0.5 to the right
  const dens = x => M.normalDensity(n, p, x), a = Math.max(lo, k - 0.5);
  if (a < hi) {
    ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.3)'; ctx.beginPath(); ctx.moveTo(m.x(a), m.P.b);
    for (let i = 0; i <= 200; i++) { const x = a + (hi - a) * i / 200; ctx.lineTo(m.x(x), m.y(dens(x))); }
    ctx.lineTo(m.x(hi), m.P.b); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // the half bar that only the corrected area includes
  const s0x = Math.max(lo, k - 0.5), s1x = Math.min(hi, k);
  if (s1x > s0x) { ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.75)'; ctx.beginPath(); ctx.moveTo(m.x(s0x), m.P.b); for (let i = 0; i <= 30; i++) { const x = s0x + (s1x - s0x) * i / 30; ctx.lineTo(m.x(x), m.y(dens(x))); } ctx.lineTo(m.x(s1x), m.P.b); ctx.closePath(); ctx.fill(); ctx.restore(); }
  curve(ctx, m, dens, lo, hi, C.pink, 2.2);
  if (k - 0.5 >= lo && k - 0.5 <= hi) vline(ctx, m, m.x(k - 0.5), C.green, [], 1.6);
  if (k >= lo && k <= hi) vline(ctx, m, m.x(k), C.text, [5, 4], 1.6);
  caption(ctx, m, t('c5axis'), W, H);
  $('r5').textContent = t('s5readout', { n, k, ex: f4(T.exact), raw: f4(T.raw), er: sgn4(T.errRaw), cc: f4(T.cc), ec: sgn4(T.errCc), z1: T.zRaw.toFixed(2), z2: T.zCc.toFixed(2), mu: trim(mu.toFixed(1)), s: s.toFixed(3) });
}

function refreshAll() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  const syncK0 = () => { const n = num('n0'), kIn = $('k0'); kIn.max = n; if (num('k0') > n) kIn.value = n; };
  syncK0();
  $('n0').addEventListener('input', () => { syncK0(); reset0(); draw0(); });
  $('k0').addEventListener('input', () => { reset0(); draw0(); });
  $('next0').addEventListener('click', () => { stopAnim('s0'); const c = PASCAL[num('n0')][num('k0')]; s0.idx = (s0.idx + 1) % c; s0.seen.add(s0.idx); draw0(); });
  $('all0').addEventListener('click', () => {
    const c = PASCAL[num('n0')][num('k0')]; s0.seen = new Set([0]); s0.idx = 0;
    animate('s0', Math.min(5000, 350 * c), q => { const i = Math.min(c - 1, Math.floor(q * c)); for (let j = 0; j <= i; j++) s0.seen.add(j); s0.idx = i; draw0(); });
  });
  reset1();
  $('n1').addEventListener('input', () => { reset1(); draw1(); });
  $('p1').addEventListener('input', () => { reset1(); draw1(); });
  $('drop1').addEventListener('click', drop1);
  $('drop100').addEventListener('click', () => dropMany(100));
  $('drop1000').addEventListener('click', () => dropMany(1000));
  $('clear1').addEventListener('click', () => { reset1(); draw1(); });
  let prev2 = { n: num('n2'), p: pOf('p2') };
  const on2 = () => { const cur = { n: num('n2'), p: pOf('p2') }; ghost2(prev2); prev2 = cur; draw2(); };
  $('n2').addEventListener('change', on2); $('p2').addEventListener('change', on2);
  $('n2').addEventListener('input', draw2); $('p2').addEventListener('input', draw2);
  ['n3', 'p3'].forEach(id => $(id).addEventListener('input', draw3));
  $('n4').addEventListener('input', () => { stopAnim('s4'); s4.seen.add(num('n4')); draw4(); });
  $('p4').addEventListener('input', () => { stopAnim('s4'); s4.seen = new Set([num('n4')]); draw4(); });
  $('grow4').addEventListener('click', grow4);
  ['n5', 'k5'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refreshAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshBinomial = refreshAll;
  refreshAll();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
