'use strict';
// Probability & frequency lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every spin, curve and readout comes from window.PF_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and one caption row, each laid out in its own band; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PF_MODEL;
const t = (...a) => window.PF_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', red: '#ff6b81', white: '#dfe6ee', needle: '#ffd27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', old: '#55657a', soft: '#c9d5e3' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; only strips trailing zeros after a decimal point (never turns 90 into 9).
const trim = s => (s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const f3 = v => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3);
const pct = v => (100 * v).toFixed(1) + '%';
const signed = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const compact = n => (n >= 10000 ? trim((n / 1000).toFixed(1)) + 'k' : String(n));

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

// One line of text that shrinks (never squeezes) until it fits maxW.
function label(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}

// A plot panel; the title sits in its own row above the plot, ticks left of / below it.
// o: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks, yFmt, xTicks (array), xFmt, logX, title
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const lx = v => Math.log10(v);
  const x = o.logX ? v => P.l + (lx(v) - lx(o.xMin)) / (lx(o.xMax) - lx(o.xMin)) * (P.r - P.l) : v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.yFmt || String)(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  // x ticks: drop labels that would collide with the previous one
  let lastR = -Infinity; ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    const X = x(v), s = (o.xFmt || String)(v), w = ctx.measureText(s).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    const lo = Math.max(X - w / 2, 2), hi = Math.min(X + w / 2, W - 2);
    if (lo < lastR + 6) continue;
    ctx.fillText(s, Math.min(Math.max(X, w / 2 + 2), W - w / 2 - 2), P.b + 15); lastR = hi;
  }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, yMin: o.yMin, yMax: o.yMax };
}
const hline = (ctx, m, v, color, dash = [6, 4], lw = 1.6) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); };
const vguide = (ctx, X, y0, y1, color = C.soft) => { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); };
const dot = (ctx, X, Y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } };
const LOG_TICKS = [1, 10, 100, 1000, 10000];

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

/* ---------- shared wheel ---------- */
const W0 = () => M.wheel(num('k0'));
const pText = w => (w.num === w.k ? `${w.k}/12` : `${w.k}/12 = ${w.num}/${w.den}`);
function drawWheel(ctx, cx, cy, R, p, { covered = false } = {}) {
  ctx.save();
  if (covered) {
    dot(ctx, cx, cy, R, '#2a3646', C.axis);
    label(ctx, '?', cx, cy + R * 0.22, R, { size: Math.round(R * 0.6), weight: 700, color: C.muted, align: 'center' });
    ctx.restore(); return;
  }
  const a0 = -Math.PI / 2, red = 2 * Math.PI * p;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + red); ctx.closePath(); ctx.fillStyle = C.red; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0 + red, a0 + 2 * Math.PI); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
  ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2;
  if (Math.abs(p * 12 - Math.round(p * 12)) < 1e-9) for (let i = 0; i < 12; i++) { const a = a0 + i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke(); }
  else [0, red].forEach(d => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a0 + d), cy + R * Math.sin(a0 + d)); ctx.stroke(); });
  ctx.lineWidth = 2; ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  ctx.restore();
}
function drawNeedle(ctx, cx, cy, R, turns) {
  const a = -Math.PI / 2 + 2 * Math.PI * turns;
  ctx.save(); ctx.strokeStyle = C.needle; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - 0.12 * R * Math.cos(a), cy - 0.12 * R * Math.sin(a)); ctx.lineTo(cx + 0.86 * R * Math.cos(a), cy + 0.86 * R * Math.sin(a)); ctx.stroke();
  dot(ctx, cx, cy, 7, C.needle, C.bg); ctx.restore();
}

/* ---------- step 0: one spin ---------- */
const s0 = { rng: M.mulberry32(11), hist: [], needle: 0 };
function draw0() {
  const w = W0();
  $('k0v').textContent = pText(w);
  const { ctx, W, H } = fitCanvas($('c0'));
  label(ctx, t('c0wheel'), 8, 17, W - 16);
  const R = Math.min(128, (W - 40) / 2), cx = W / 2, cy = 30 + R;
  drawWheel(ctx, cx, cy, R, w.p); drawNeedle(ctx, cx, cy, R, s0.needle);
  const top = cy + R + 34;
  const slots = W < 420 ? 12 : 20;
  label(ctx, t('c0strip', { n: slots }), 8, top, W - 16);
  const gap = (W - 16) / slots, rr = Math.max(3.5, Math.min(9, gap / 2 - 2)), last = s0.hist.slice(-slots);
  for (let i = 0; i < slots; i++) {
    const X = 8 + gap * (i + 0.5), Y = top + 22, o = last[i];
    if (!o) { ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.stroke(); ctx.restore(); continue; }
    dot(ctx, X, Y, rr, o.red ? C.red : C.white, i === last.length - 1 ? C.needle : null);
  }
  const n = s0.hist.length, reds = s0.hist.filter(o => o.red).length;
  const lastTxt = n ? t(s0.hist[n - 1].red ? 'red' : 'white') : '';
  $('r0').textContent = t('s0readout', { frac: pText(w), p: f3(w.p), pc: pct(w.p), deg: w.deg }) + (n ? t('s0tally', { n, last: lastTxt, r: reds }) : t('s0none'));
}
function spin0() {
  const u = s0.rng(), w = W0(), from = s0.needle % 1, to = 3 + u;
  $('spin0').disabled = true;
  animate('s0', 1300, p => { const e = 1 - Math.pow(1 - p, 3); s0.needle = from + (to - from) * e; if (p === 1) s0.needle = u; draw0(); }, () => {
    s0.hist.push({ u, red: M.isRed(u, w.p) }); s0.needle = u; $('spin0').disabled = false; draw0();
  });
}

/* ---------- step 1: groups of ten ---------- */
const s1 = { rng: M.mulberry32(21), groups: [], cur: null, shown: 0 };
function newGroup() { const p = W0().p, u = []; for (let i = 0; i < M.GROUP; i++) u.push(s1.rng()); return { u, reds: u.filter(v => M.isRed(v, p)).length }; }
function draw1() {
  const w = W0(), p = w.p;
  const { ctx, W, H } = fitCanvas($('c1'));
  label(ctx, t('c1top'), 8, 17, W - 16);
  const gap = (W - 16) / M.GROUP, rr = Math.max(5, Math.min(13, gap / 2 - 3));
  for (let i = 0; i < M.GROUP; i++) {
    const X = 8 + gap * (i + 0.5), Y = 44;
    if (s1.cur && i < s1.shown) dot(ctx, X, Y, rr, M.isRed(s1.cur.u[i], p) ? C.red : C.white);
    else { ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.stroke(); ctx.restore(); }
  }
  const m = panel(ctx, W, { top: 108, bottom: H - 30, left: 16, right: 16, xMin: -0.05, xMax: 1.05, yMin: 0, yMax: 1, xTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], xFmt: v => trim(v.toFixed(1)), title: t('c1bot') });
  const cnt = new Array(M.GROUP + 1).fill(0); s1.groups.forEach(g => cnt[g.reds]++);
  const maxStack = Math.max(1, ...cnt), colW = m.x(0.1) - m.x(0), h = m.P.b - m.P.t - 4;
  const rd = Math.max(1.6, Math.min(6, colW / 2 - 1.5, h / (2 * maxStack)));
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.07)'; ctx.fillRect(m.x(p - 0.1), m.P.t, m.x(p + 0.1) - m.x(p - 0.1), m.P.b - m.P.t); ctx.restore();
  for (let r = 0; r <= M.GROUP; r++) for (let j = 0; j < cnt[r]; j++) dot(ctx, m.x(r / M.GROUP), m.P.b - rd - 1 - j * 2 * rd, rd * 0.9, C.text);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(m.x(p), m.P.t); ctx.lineTo(m.x(p), m.P.b); ctx.stroke(); ctx.restore();
  const g = s1.groups.length, cur = s1.cur && s1.shown >= M.GROUP ? s1.cur : null;
  let txt;
  if (!g && !s1.cur) txt = t('s1none');
  else {
    const fs = s1.groups.map(q => q.reds / M.GROUP);
    const head = cur ? t('s1cur', { r: cur.reds, f: trim((cur.reds / M.GROUP).toFixed(1)) }) : t('s1spinning', { c: s1.shown });
    const near = fs.filter(f => Math.abs(f - p) <= 0.1 + 1e-12).length;
    const body = g ? t('s1groups', { g, lo: trim(Math.min(...fs).toFixed(1)), hi: trim(Math.max(...fs).toFixed(1)), near }) : '';
    const tail = M.exactPossible(w.k, M.GROUP) ? t('s1exactYes', { e: fs.filter(f => Math.abs(f - p) < 1e-9).length, f: trim(p.toFixed(1)) }) : t('s1exactNo', { frac: `${w.num}/${w.den}` });
    txt = head + body + (g ? tail : '');
  }
  $('r1').textContent = txt;
}
function play1(count) {
  stopAnim('s1');
  const batch = []; for (let i = 0; i < count; i++) batch.push(newGroup());
  let pushed = 0;
  const lock = on => ['group1', 'many1'].forEach(id => { $(id).disabled = on; });
  lock(true);
  animate('s1', count === 1 ? 1500 : 1600, p => {
    if (count === 1) {
      // one group: the ten spins appear one by one, then the group drops into the dot plot
      s1.cur = batch[0]; s1.shown = p >= 1 ? M.GROUP : Math.min(M.GROUP, Math.floor(p * M.GROUP) + 1);
      if (p >= 1 && !pushed) { s1.groups.push(batch[0]); pushed = 1; }
    } else {
      // many groups: one finished group lands per frame slice
      const target = p >= 1 ? count : Math.floor(p * count);
      while (pushed < target) { s1.groups.push(batch[pushed]); s1.cur = batch[pushed]; s1.shown = M.GROUP; pushed++; }
    }
    draw1();
  }, () => { lock(false); draw1(); });
}

/* ---------- step 2: one long run ---------- */
const s2 = { seeds: [101], n: M.PATH_N, cache: {} };
function pathFor(seed) {
  const p = W0().p, key = seed + ':' + p;
  if (!s2.cache[key]) { const u = M.draws(seed, M.PATH_N); s2.cache[key] = M.runningReds(u, p); }
  return s2.cache[key];
}
// log-spaced sample indices 1..n (every n up to 200, then about 400 per decade)
function samples(n) { const out = []; for (let i = 1; i <= Math.min(n, 200); i++) out.push(i); let v = 200; while (v < n) { v = Math.min(n, Math.ceil(v * 1.006)); out.push(v); } return out; }
function tracePath(ctx, m, reds, n, color, lw, alpha) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.beginPath();
  samples(n).forEach((i, q) => { const X = m.x(i), Y = m.y(reds[i - 1] / i); if (!q) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
  ctx.stroke(); ctx.restore();
}
function funnel(ctx, m, p, n0, n1, fn) {
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.16)'; ctx.strokeStyle = 'rgba(126,226,168,0.7)'; ctx.lineWidth = 1.2;
  const xs = samples(n1).filter(i => i >= n0);
  const up = xs.map(i => [m.x(i), m.y(Math.min(m.yMax, fn(i, 1)))]), dn = xs.map(i => [m.x(i), m.y(Math.max(m.yMin, fn(i, -1)))]);
  ctx.beginPath(); up.forEach(([X, Y], q) => (q ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); dn.slice().reverse().forEach(([X, Y]) => ctx.lineTo(X, Y)); ctx.closePath(); ctx.fill();
  [up, dn].forEach(line => { ctx.beginPath(); line.forEach(([X, Y], q) => (q ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); });
  ctx.restore();
}
function draw2() {
  const w = W0(), p = w.p, n = s2.n;
  $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const m = panel(ctx, W, { top: 28, bottom: H - 46, xMin: 1, xMax: M.PATH_N, logX: true, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v => trim(v.toFixed(2)), xTicks: LOG_TICKS, title: t('c2title') });
  funnel(ctx, m, p, 1, M.PATH_N, (i, s) => p + s * M.halfWidth(p, i));
  hline(ctx, m, p, C.orange);
  s2.seeds.slice(0, -1).forEach(seed => tracePath(ctx, m, pathFor(seed), M.PATH_N, C.soft, 1.2, 0.35));
  const reds = pathFor(s2.seeds[s2.seeds.length - 1]);
  tracePath(ctx, m, reds, n, C.cyan, 2.2, 1);
  const f = reds[n - 1] / n;
  vguide(ctx, m.x(n), m.P.t, m.P.b); dot(ctx, m.x(n), m.y(f), 5, C.cyan, C.bg);
  label(ctx, t('c2axis'), m.P.l + (m.P.r - m.P.l) / 2, H - 12, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  const hw = M.halfWidth(p, n), inside = Math.abs(f - p) <= hw + 1e-12;
  const insideOld = s2.seeds.slice(0, -1).filter(seed => Math.abs(pathFor(seed)[n - 1] / n - p) <= hw + 1e-12).length;
  $('r2').textContent = t('s2readout', { n, r: reds[n - 1], f: f3(f), d: f3(Math.abs(f - p)), lo: f3(Math.max(0, p - hw)), hi: f3(Math.min(1, p + hw)), where: t(inside ? 'inFunnel' : 'outFunnel') })
    + (s2.seeds.length > 1 ? t('s2olds', { k: s2.seeds.length, c: insideOld + (inside ? 1 : 0) }) : '');
}
function play2() {
  $('n2').value = 16;
  animate('s2', 5200, q => { s2.n = Math.max(1, Math.min(M.PATH_N, Math.round(Math.pow(M.PATH_N, q)))); draw2(); });
}

/* ---------- step 3: many experiments of n spins ---------- */
const s3 = { visited: new Set([0]), cache: {} };
const stats3 = idx => { const p = W0().p, key = idx + ':' + p; if (!s3.cache[key]) s3.cache[key] = M.groupStats(M.STEP3_N[idx], p, 303 + idx); return s3.cache[key]; };
function bars(ctx, m, arr, B, fill, stroke, lw) {
  ctx.save(); ctx.lineWidth = lw || 1.5;
  if (fill) { ctx.fillStyle = fill; arr.forEach((v, j) => { if (v > 0) { const x0 = m.x((j - 0.5) / B), x1 = m.x((j + 0.5) / B); ctx.fillRect(x0 + 0.5, m.y(v), Math.max(1, x1 - x0 - 1), m.P.b - m.y(v)); } }); }
  if (stroke) {
    ctx.strokeStyle = stroke; ctx.beginPath(); let started = false;
    arr.forEach((v, j) => { const x0 = m.x(Math.max(-0.5 / B, (j - 0.5) / B)), x1 = m.x((j + 0.5) / B), Y = m.y(Math.min(m.yTop, v)); if (!started) { ctx.moveTo(x0, m.P.b); started = true; } ctx.lineTo(x0, Y); ctx.lineTo(x1, Y); });
    ctx.lineTo(m.x((arr.length - 0.5) / B), m.P.b); ctx.stroke();
  }
  ctx.restore();
}
function niceMax(v) { for (const s of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) if (v <= s) return s; return 1; }
function draw3() {
  const idx = num('n3'), w = W0(), p = w.p, S = stats3(idx);
  $('n3v').textContent = String(S.n);
  const { ctx, W, H } = fitCanvas($('c3'));
  const top = niceMax(Math.max(...S.sim, ...S.exact) * 1.05), step = top <= 0.4 ? 0.1 : 0.2;
  const ticks = []; for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Number(v.toFixed(1)));
  const m = panel(ctx, W, { top: 28, bottom: H - 46, xMin: -0.02, xMax: 1.02, yMin: 0, yMax: top, yTicks: ticks, yFmt: v => trim(v.toFixed(1)), xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], xFmt: v => trim(v.toFixed(1)), title: t('c3title', { n: S.n }) });
  m.yTop = top;
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.12)'; ctx.fillRect(m.x(p - M.BAND), m.P.t, m.x(p + M.BAND) - m.x(p - M.BAND), m.P.b - m.P.t); ctx.restore();
  [...s3.visited].forEach(j => { if (j !== idx) { const Q = stats3(j); bars(ctx, m, Q.exact, Q.B, null, 'rgba(154,170,189,0.55)', 1.2); } });
  bars(ctx, m, S.sim, S.B, 'rgba(103,215,249,0.75)');
  bars(ctx, m, S.exact, S.B, null, C.orange, 1.8);
  hline(ctx, { P: m.P, y: m.y }, 0, C.axis, [], 1);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.x(p), m.P.t); ctx.lineTo(m.x(p), m.P.b); ctx.stroke(); ctx.restore();
  label(ctx, t('c3axis'), m.P.l + (m.P.r - m.P.l) / 2, H - 12, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  const prev = idx > 0 ? stats3(idx - 1) : null;
  $('r3').textContent = t('s3readout', { n: S.n, G: M.STEP3_GROUPS, c: S.inside, cs: pct(S.insideShare), ex: pct(S.exactShare), lo: f3(S.lo), hi: f3(S.hi), wd: f3(S.width) })
    + (prev ? t('s3ratio', { pn: prev.n, pw: f3(prev.width), r: (S.width / prev.width).toFixed(2), tr: (S.theoryWidth / prev.theoryWidth).toFixed(2) }) : '');
}

/* ---------- step 4: after a streak ---------- */
const s4 = { seq: 0, cache: {} };
const table4 = () => { const p = W0().p, key = s4.seq + ':' + p; if (!s4.cache[key]) s4.cache[key] = M.streakTable(M.draws(404 + s4.seq, M.STREAK_N), p); return s4.cache[key]; };
function draw4() {
  const k = num('k4'), p = W0().p, rows = table4();
  $('k4v').textContent = String(k);
  const { ctx, W, H } = fitCanvas($('c4'));
  const m = panel(ctx, W, { top: 28, bottom: H - 62, xMin: -0.5, xMax: M.STREAK_MAX + 0.5, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v => trim(v.toFixed(2)), xTicks: [], title: t('c4title') });
  const bw = Math.min(46, (m.x(1) - m.x(0)) * 0.56);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  rows.forEach(r => {
    const X = m.x(r.k), sel = r.k === k;
    if (r.cases) {
      const hw = 2 * Math.sqrt(p * (1 - p) / r.cases), lo = Math.max(0, p - hw), hi = Math.min(1, p + hw);
      ctx.fillStyle = sel ? C.cyan : 'rgba(103,215,249,0.45)'; ctx.fillRect(X - bw / 2, m.y(r.freq), bw, m.P.b - m.y(r.freq));
      if (sel) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(X - bw / 2, m.y(r.freq), bw, m.P.b - m.y(r.freq)); }
      ctx.strokeStyle = C.soft; ctx.lineWidth = 1.6; const cap = bw * 0.3;
      ctx.beginPath(); ctx.moveTo(X, m.y(lo)); ctx.lineTo(X, m.y(hi)); ctx.moveTo(X - cap, m.y(lo)); ctx.lineTo(X + cap, m.y(lo)); ctx.moveTo(X - cap, m.y(hi)); ctx.lineTo(X + cap, m.y(hi)); ctx.stroke();
    } else { ctx.strokeStyle = sel ? C.text : C.grid; ctx.setLineDash([3, 3]); ctx.strokeRect(X - bw / 2, m.P.t + 2, bw, m.P.b - m.P.t - 2); ctx.setLineDash([]); }
    ctx.fillStyle = sel ? C.text : C.muted; ctx.font = (sel ? '700 ' : '') + '12px system-ui,sans-serif'; ctx.fillText(String(r.k), X, m.P.b + 16);
    ctx.font = '10px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.fillText(compact(r.cases), X, m.P.b + 31);
  });
  ctx.restore();
  hline(ctx, m, p, C.orange);
  label(ctx, t('c4axis'), m.P.l + (m.P.r - m.P.l) / 2, H - 10, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  const r = rows[k];
  $('r4').textContent = k === 0 ? t('s4all', { m: r.cases, r: r.nextRed, f: f3(r.freq), p: f3(p) }) : r.cases ? t('s4readout', { k, m: r.cases, r: r.nextRed, f: f3(r.freq), p: f3(p), lo: f3(Math.max(0, p - 2 * Math.sqrt(p * (1 - p) / r.cases))), hi: f3(Math.min(1, p + 2 * Math.sqrt(p * (1 - p) / r.cases))) }) : t('s4none', { k, N: M.STREAK_N });
}

/* ---------- step 5: the gap in spins vs the gap in frequency ---------- */
const s5 = { n: M.PATH_N };
function draw5() {
  const p = W0().p, n = s5.n, reds = pathFor(s2.seeds[s2.seeds.length - 1]), g = M.gaps(reds, p, n);
  $('n5v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c5'));
  let maxC = 2 * Math.sqrt(M.PATH_N * p * (1 - p)); for (let i = 1; i <= M.PATH_N; i++) maxC = Math.max(maxC, Math.abs(reds[i - 1] - i * p));
  const cTop = [20, 40, 60, 80, 100, 150, 200, 300].find(v => v >= maxC * 1.05) || 400;
  const mid = Math.round(H / 2) + 4;
  const A = panel(ctx, W, { top: 28, bottom: mid - 40, xMin: 1, xMax: M.PATH_N, logX: true, yMin: -cTop, yMax: cTop, yTicks: [-cTop, 0, cTop], yFmt: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v), xTicks: LOG_TICKS, title: t('c5a') });
  funnel(ctx, A, p, 1, M.PATH_N, (i, s) => s * 2 * Math.sqrt(i * p * (1 - p)));
  const trace = (m, fn, color, upto) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath(); samples(upto).forEach((i, q) => { const X = m.x(i), Y = m.y(fn(i)); if (!q) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore(); };
  trace(A, i => reds[i - 1] - i * p, C.orange, n);
  const B = panel(ctx, W, { top: mid + 12, bottom: H - 46, xMin: 1, xMax: M.PATH_N, logX: true, yMin: -1, yMax: 1, yTicks: [-1, -0.5, 0, 0.5, 1], yFmt: v => (v > 0 ? '+' : v < 0 ? '−' : '') + trim(Math.abs(v).toFixed(1)), xTicks: LOG_TICKS, title: t('c5b') });
  funnel(ctx, B, p, 1, M.PATH_N, (i, s) => s * M.halfWidth(p, i));
  trace(B, i => reds[i - 1] / i - p, C.cyan, n);
  dot(ctx, A.x(n), A.y(g.countGap), 5, C.orange, C.bg); dot(ctx, B.x(n), B.y(g.freqGap), 5, C.cyan, C.bg);
  vguide(ctx, A.x(n), A.P.t, B.P.b);
  label(ctx, t('c2axis'), B.P.l + (B.P.r - B.P.l) / 2, H - 12, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  $('r5').textContent = t('s5readout', { n, r: g.reds, e: trim((n * p).toFixed(2)), g: signed(g.countGap, 2), d: signed(g.freqGap, 4), cb: g.countBand.toFixed(1), fb: g.freqBand.toFixed(4) });
}
function play5() {
  $('n5').value = 16;
  animate('s5', 5200, q => { s5.n = Math.max(1, Math.min(M.PATH_N, Math.round(Math.pow(M.PATH_N, q)))); draw5(); });
}

/* ---------- step 6: estimate a hidden wheel ---------- */
const s6 = { idx: 0, rng: M.mulberry32(606), n: 0, reds: 0, hist: [], revealed: false };
function resetHidden(idx) { s6.idx = idx; s6.rng = M.mulberry32(606 + idx); s6.n = 0; s6.reds = 0; s6.hist = []; s6.revealed = false; }
function spinHidden(count) {
  const p = M.HIDDEN[s6.idx];
  for (let i = 0; i < count; i++) if (M.isRed(s6.rng(), p)) s6.reds++;
  s6.n += count; const e = M.estimate(s6.reds, s6.n); s6.hist.push({ n: s6.n, ...e }); draw6();
}
function draw6() {
  const p = M.HIDDEN[s6.idx];
  let { ctx, W, H } = fitCanvas($('c6'));
  label(ctx, t(s6.revealed ? 'c6open' : 'c6hidden'), 8, 17, W - 16);
  const R = Math.min(110, (W - 30) / 2, (H - 50) / 2);
  drawWheel(ctx, W / 2, 30 + (H - 30) / 2, R, p, { covered: !s6.revealed });
  ({ ctx, W, H } = fitCanvas($('c6b')));
  const xMax = Math.max(M.PATH_N, s6.n);
  const ticks = LOG_TICKS.filter(v => v <= xMax); if (xMax > 10000) ticks.push(xMax >= 100000 ? 100000 : xMax);
  const m = panel(ctx, W, { top: 28, bottom: H - 46, xMin: 1, xMax, logX: true, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], yFmt: v => trim(v.toFixed(2)), xTicks: [1, 10, 100, 1000, 10000].filter(v => v <= xMax), title: t('c6b') });
  if (s6.revealed) hline(ctx, m, p, C.orange);
  s6.hist.forEach((e, i) => {
    const X = m.x(e.n), last = i === s6.hist.length - 1;
    ctx.save(); ctx.strokeStyle = last ? C.text : C.soft; ctx.globalAlpha = last ? 1 : 0.6; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(X, m.y(e.lo)); ctx.lineTo(X, m.y(e.hi)); ctx.moveTo(X - 4, m.y(e.lo)); ctx.lineTo(X + 4, m.y(e.lo)); ctx.moveTo(X - 4, m.y(e.hi)); ctx.lineTo(X + 4, m.y(e.hi)); ctx.stroke();
    dot(ctx, X, m.y(e.f), last ? 5 : 3.5, C.text); ctx.restore();
  });
  label(ctx, t('c2axis'), m.P.l + (m.P.r - m.P.l) / 2, H - 12, W - 16, { size: 11, weight: 400, color: C.muted, align: 'center' });
  $('reveal6').disabled = s6.revealed || !s6.n;
  let txt = s6.n ? t('s6readout', { which: s6.idx + 1, n: s6.n, r: s6.reds, f: f3(s6.reds / s6.n), lo: f3(s6.hist[s6.hist.length - 1].lo), hi: f3(s6.hist[s6.hist.length - 1].hi) }) : t('s6none', { which: s6.idx + 1 });
  if (s6.revealed && s6.n) {
    const e = s6.hist[s6.hist.length - 1], hit = p >= e.lo - 1e-12 && p <= e.hi + 1e-12;
    txt += t('s6reveal', { p: f3(p), res: t(hit ? 'covered' : 'missed'), n: s6.n, c: pct(M.waldCoverage(s6.n, p)) });
  }
  $('r6').textContent = txt;
}

function refreshAll() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('k0').addEventListener('input', () => {
    stopAnim('s0'); stopAnim('s1'); $('spin0').disabled = false; ['group1', 'many1'].forEach(id => { $(id).disabled = false; });
    s0.hist = []; s1.groups = []; s1.cur = null; s1.shown = 0; s3.visited = new Set([num('n3')]);
    refreshAll();
  });
  $('spin0').addEventListener('click', spin0);
  $('clear0').addEventListener('click', () => { s0.hist = []; draw0(); });
  $('group1').addEventListener('click', () => play1(1));
  $('many1').addEventListener('click', () => play1(20));
  $('clear1').addEventListener('click', () => { stopAnim('s1'); ['group1', 'many1'].forEach(id => { $(id).disabled = false; }); s1.groups = []; s1.cur = null; s1.shown = 0; draw1(); });
  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.n = M.NSTOPS[num('n2')]; draw2(); });
  $('play2').addEventListener('click', play2);
  $('new2').addEventListener('click', () => { stopAnim('s2'); const next = s2.seeds[s2.seeds.length - 1] + 1; s2.seeds.push(next); if (s2.seeds.length > 6) s2.seeds.shift(); draw2(); draw5(); });
  $('n3').addEventListener('input', () => { s3.visited.add(num('n3')); draw3(); });
  $('k4').addEventListener('input', draw4);
  $('new4').addEventListener('click', () => { s4.seq = (s4.seq + 1) % 5; draw4(); });
  $('n5').addEventListener('input', () => { stopAnim('s5'); s5.n = M.NSTOPS[num('n5')]; draw5(); });
  $('play5').addEventListener('click', play5);
  $('b10').addEventListener('click', () => spinHidden(10));
  $('b100').addEventListener('click', () => spinHidden(100));
  $('b1000').addEventListener('click', () => spinHidden(1000));
  $('reveal6').addEventListener('click', () => { s6.revealed = true; draw6(); });
  $('next6').addEventListener('click', () => { resetHidden((s6.idx + 1) % M.HIDDEN.length); draw6(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refreshAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshFrequency = refreshAll;
  refreshAll();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
