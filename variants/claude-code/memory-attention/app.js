'use strict';
// Attention & memory lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.MEM_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and the items being remembered; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MEM_MODEL;
const t = (...a) => window.MEM_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#5d6f86', dim: '#1b2836' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function fitText(ctx, text, x, y, maxW, size, weight = '', min = 7) {
  let s = size; do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > min);
  if (ctx.measureText(text).width > maxW) return false;
  ctx.fillText(text, x, y); return true;
}
function title(ctx, text, Y, W) { ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; fitText(ctx, text, 8, Y, W - 16, 12, '600'); ctx.restore(); }
// Plot panel: title row above, y ticks left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 42, r: W - 12, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  (o.yTicks || []).forEach(v => { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 5, y(v) + 4); });
  ctx.textAlign = 'center';
  (o.xTicks || []).forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v), x(v), P.b + 15); });
  ctx.restore();
  if (o.title) title(ctx, o.title, P.t - 9, W);
  return { x, y, P };
}

/* ---------- step 0: chunks ---------- */
const s0 = { key: 'acronyms', familiar: true };
function draw0() {
  const K = num('k0'); $('k0v').textContent = String(K);
  ['strAcr', 'strYears', 'strRand'].forEach((id, i) => $(id).setAttribute('aria-pressed', String(['acronyms', 'years', 'random'][i] === s0.key)));
  $('familiar0').setAttribute('aria-pressed', String(s0.familiar));
  const r = M.chunkRecall(s0.key, s0.familiar, K), chars = M.STRINGS0[s0.key].chunks.join('');
  const { ctx, W } = fitCanvas($('c0'));
  title(ctx, t('cStr'), 17, W);
  const n = chars.length, bw = Math.min(44, (W - 16) / n), x0 = (W - bw * n) / 2;
  const heldChars = r.recalled;
  ctx.save(); ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const X = x0 + i * bw; ctx.fillStyle = i < heldChars ? '#1f4a5a' : C.dim; ctx.fillRect(X + 1, 30, bw - 2, 36);
    ctx.fillStyle = C.text; fitText(ctx, chars[i], X + bw / 2, 54, bw - 4, 16, '600');
  }
  // brackets: one per chunk (unit)
  let pos = 0;
  r.units.forEach((u, j) => {
    const a = x0 + pos * bw + 3, b = x0 + (pos + u.length) * bw - 3; pos += u.length;
    ctx.strokeStyle = j < K ? C.cyan : C.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, 72); ctx.lineTo(a, 78); ctx.lineTo(b, 78); ctx.lineTo(b, 72); ctx.stroke();
  });
  ctx.restore();
  title(ctx, t('cSlots', { k: K }), 112, W);
  const gap = 8, sw = Math.min(120, (W - 16 - (K - 1) * gap) / K), sx = (W - (sw * K + gap * (K - 1))) / 2;
  ctx.save(); ctx.textAlign = 'center';
  for (let i = 0; i < K; i++) {
    const X = sx + i * (sw + gap), u = r.held[i];
    ctx.fillStyle = u ? 'rgba(103,215,249,0.22)' : C.dim; ctx.fillRect(X, 124, sw, 48);
    ctx.strokeStyle = u ? C.cyan : C.axis; ctx.lineWidth = 1.5; ctx.strokeRect(X + 0.5, 124.5, sw - 1, 47);
    if (u) { ctx.fillStyle = C.text; fitText(ctx, u, X + sw / 2, 154, sw - 6, 18, '700'); }
  }
  const lost = r.units.slice(K);
  title(ctx, t('lgLost') + (lost.length ? '' : ' —'), 196, W);
  if (lost.length) {
    const lw = Math.min(64, (W - 16 - (lost.length - 1) * 6) / lost.length), lx = (W - (lw * lost.length + 6 * (lost.length - 1))) / 2;
    lost.forEach((u, i) => {
      const X = lx + i * (lw + 6); ctx.fillStyle = C.grey; ctx.globalAlpha = 0.5; ctx.fillRect(X, 212, lw, 34); ctx.globalAlpha = 1;
      ctx.fillStyle = C.muted; fitText(ctx, u, X + lw / 2, 234, lw - 4, 14);
      ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X + 3, 243); ctx.lineTo(X + lw - 3, 215); ctx.stroke();
    });
    // arrows from the slots row down to the lost row
    ctx.strokeStyle = C.grey; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(W / 2, 176); ctx.lineTo(W / 2, 208); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  $('r0').textContent = t('s0readout', { units: r.nUnits, k: K, held: r.held.length, rec: r.recalled, n: r.letters, verdict: r.all ? t('vAll') : t('vSome', { lost: lost.length }) });
}

/* ---------- step 1: serial position ---------- */
const s1 = { delay: false, ghosts: new Map(), cache: new Map() };
function sp(L, rate, delay) { const k = [L, rate, delay].join(); if (!s1.cache.has(k)) s1.cache.set(k, M.serialPosition(L, rate, delay)); return s1.cache.get(k); }
function draw1() {
  const L = num('len1'), rate = num('rate1'); $('len1v').textContent = String(L); $('rate1v').textContent = fmt(rate, 1);
  $('delay1').setAttribute('aria-pressed', String(s1.delay));
  const key = [L, rate, s1.delay].join(), r = sp(L, rate, s1.delay);
  s1.ghosts.delete(key); s1.ghosts.set(key, { L, p: r.p }); while (s1.ghosts.size > 7) s1.ghosts.delete(s1.ghosts.keys().next().value);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 40, bottom: H - 30, xMin: 0.5, xMax: 20.5, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: [1, 4, 8, 12, 16, 20], title: t('cSerial') });
  [...s1.ghosts].forEach(([k, g]) => { if (k === key) return; ctx.save(); ctx.strokeStyle = C.grey; ctx.lineWidth = 1.5; ctx.beginPath(); g.p.forEach((v, i) => (i ? ctx.lineTo(A.x(i + 1), A.y(v)) : ctx.moveTo(A.x(i + 1), A.y(v)))); ctx.stroke(); ctx.restore(); });
  const bw = Math.min(26, (A.x(2) - A.x(1)) * 0.7);
  r.p.forEach((v, i) => {
    const ltm = v - r.buf[i], X = A.x(i + 1) - bw / 2;
    ctx.fillStyle = 'rgba(103,215,249,0.55)'; ctx.fillRect(X, A.y(ltm), bw, A.y(0) - A.y(ltm));
    ctx.fillStyle = 'rgba(255,180,84,0.8)'; ctx.fillRect(X, A.y(v), bw, A.y(ltm) - A.y(v));
  });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); r.p.forEach((v, i) => (i ? ctx.lineTo(A.x(i + 1), A.y(v)) : ctx.moveTo(A.x(i + 1), A.y(v)))); ctx.stroke();
  r.p.forEach((v, i) => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(i + 1), A.y(v), 3, 0, 7); ctx.fill(); }); ctx.restore();
  let mi = 1; for (let i = 1; i < L - 1; i++) if (r.p[i] < r.p[mi]) mi = i;
  const mean = r.p.reduce((a, b) => a + b, 0) / L;
  $('r1').textContent = t('s1readout', { len: L, rate: fmt(rate, 1), delay: t(s1.delay ? 'delayOn' : 'delayOff'), first: r.p[0].toFixed(2), mid: r.p[mi].toFixed(2), midPos: mi + 1, last: r.p[L - 1].toFixed(2), mean: mean.toFixed(2) });
}

/* ---------- step 2: PRP central bottleneck ---------- */
const s2 = { hard: false, visited: new Map() };
const setKey = () => num('b12') + (s2.hard ? 'h' : 'e');
function draw2() {
  const soa = num('soa2'), B1 = num('b12'); $('soa2v').textContent = String(soa); $('b12v').textContent = String(B1);
  $('hard2').setAttribute('aria-pressed', String(s2.hard));
  if (!s2.visited.has(setKey())) s2.visited.set(setKey(), new Set());
  s2.visited.get(setKey()).add(soa);
  const r = M.prp(soa, B1, s2.hard);
  const { ctx, W, H } = fitCanvas($('c2'));
  ctx.save(); ctx.font = '12px system-ui,sans-serif';
  const labW = Math.max(ctx.measureText(t('task1')).width, ctx.measureText(t('task2')).width) + 14; ctx.restore();
  const G = panel(ctx, W, { left: 8 + labW, top: 34, bottom: 150, xMin: 0, xMax: 1400, xTicks: W < 420 ? [0, 400, 800, 1200] : [0, 200, 400, 600, 800, 1000, 1200, 1400], title: t('cGantt') });
  const rows = [{ y: 46, h: 30, st: r.t1, label: 'task1', at: 0 }, { y: 104, h: 30, st: r.t2, label: 'task2', at: soa }];
  rows.forEach(row => {
    ctx.fillStyle = C.muted; ctx.textAlign = 'right'; fitText(ctx, t(row.label), G.P.l - 6, row.y + row.h / 2 + 4, labW - 8, 12);
    [['a', C.cyan], ['b', C.orange], ['c', C.green]].forEach(([k, col]) => { const [a, b] = row.st[k]; ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(G.x(a), row.y, G.x(b) - G.x(a), row.h); ctx.globalAlpha = 1; ctx.strokeStyle = C.bg; ctx.strokeRect(G.x(a), row.y, G.x(b) - G.x(a), row.h); });
    if (row.st.wait && row.st.wait[1] > row.st.wait[0]) {
      const [a, b] = row.st.wait; ctx.save(); ctx.beginPath(); ctx.rect(G.x(a), row.y, G.x(b) - G.x(a), row.h); ctx.clip();
      ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; for (let X = G.x(a) - row.h; X < G.x(b); X += 6) { ctx.beginPath(); ctx.moveTo(X, row.y + row.h); ctx.lineTo(X + row.h, row.y); ctx.stroke(); }
      ctx.restore(); ctx.strokeStyle = C.pink; ctx.strokeRect(G.x(a), row.y, G.x(b) - G.x(a), row.h);
    }
    // stimulus onset marker
    ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(G.x(row.at), row.y - 2); ctx.lineTo(G.x(row.at) - 5, row.y - 9); ctx.lineTo(G.x(row.at) + 5, row.y - 9); ctx.closePath(); ctx.fill();
  });
  // bottleneck busy line: B1 end
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(G.x(r.t1.b[1]), 46); ctx.lineTo(G.x(r.t1.b[1]), 134); ctx.stroke(); ctx.restore();
  const R = panel(ctx, W, { left: 46, top: 214, bottom: H - 28, xMin: 0, xMax: 800, yMin: 300, yMax: 900, yTicks: [300, 500, 700, 900], xTicks: W < 420 ? [0, 200, 400, 600, 800] : [0, 100, 200, 300, 400, 500, 600, 700, 800], title: t('cRt2') });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath();
  for (let q = 0; q <= 800; q += 5) { const v = M.prp(q, B1, s2.hard).rt2; if (!q) ctx.moveTo(R.x(q), R.y(v)); else ctx.lineTo(R.x(q), R.y(v)); }
  ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(R.x(r.critical), R.P.t); ctx.lineTo(R.x(r.critical), R.P.b); ctx.stroke(); ctx.setLineDash([]);
  s2.visited.get(setKey()).forEach(q => { if (q === soa) return; ctx.fillStyle = C.muted; ctx.beginPath(); ctx.arc(R.x(q), R.y(M.prp(q, B1, s2.hard).rt2), 3.5, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(R.x(soa), R.y(r.rt2), 6, 0, 7); ctx.fill(); ctx.restore();
  $('r2').textContent = t('s2readout', { soa, rt1: r.rt1, wait: r.wait, rt2: r.rt2, crit: r.critical, flat: (s2.hard ? M.PRP.A2hard : M.PRP.A2) + M.PRP.B2 + M.PRP.C2 });
}

/* ---------- step 3: cue–trace overlap ---------- */
const s3 = { deep: true, same: true, cue: false };
const CONDS = [];
['shallow', 'deep'].forEach(d => [[true, 'free'], [true, 'category'], [false, 'free'], [false, 'category']].forEach(([same, cue]) => CONDS.push({ d, same, cue })));
function draw3() {
  const depth = s3.deep ? 'deep' : 'shallow', cue = s3.cue ? 'category' : 'free', r = M.retrieval(depth, s3.same, cue);
  $('deep3').setAttribute('aria-pressed', String(s3.deep)); $('room3').setAttribute('aria-pressed', String(s3.same)); $('cue3').setAttribute('aria-pressed', String(s3.cue));
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('cFeat'), 17, W);
  ctx.save(); ctx.font = '12px system-ui,sans-serif';
  const labW = Math.max(ctx.measureText(t('rowTrace')).width, ctx.measureText(t('rowCue')).width) + 14; ctx.restore();
  const n = 8, x0 = 8 + labW, step = (W - 12 - x0) / n, cx = i => x0 + (i + 0.5) * step, rad = Math.min(11, step * 0.32);
  const kind = i => (i === 0 ? 'base' : i <= 5 ? 'sem' : 'ctx');
  const col = { base: C.text, sem: C.violet, ctx: C.green };
  const cueSem = cue === 'category' ? M.CUE.categoryCue : M.CUE.selfCue;
  const trace = i => (kind(i) === 'base' ? true : kind(i) === 'sem' ? i - 1 < r.enc : true);
  const cueOn = i => (kind(i) === 'base' ? true : kind(i) === 'sem' ? i - 1 < cueSem : s3.same);
  const yT = 52, yC = 112;
  ctx.save();
  ctx.fillStyle = C.muted; ctx.textAlign = 'right'; fitText(ctx, t('rowTrace'), x0 - 6, yT + 4, labW - 8, 12); fitText(ctx, t('rowCue'), x0 - 6, yC + 4, labW - 8, 12);
  for (let i = 0; i < n; i++) {
    if (trace(i) && cueOn(i)) { ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx(i), yT + rad); ctx.lineTo(cx(i), yC - rad); ctx.stroke(); }
    [[yT, trace(i)], [yC, cueOn(i)]].forEach(([Y, on]) => { ctx.beginPath(); ctx.arc(cx(i), Y, rad, 0, 7); if (on) { ctx.fillStyle = col[kind(i)]; ctx.fill(); } else { ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.stroke(); } });
  }
  ctx.restore();
  const B = panel(ctx, W, { left: 42, top: 194, bottom: H - 34, xMin: 0, xMax: 9, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], title: t('cBars') });
  const bx = j => (j < 4 ? 0.5 + j : 1.5 + j), bw = (B.x(1) - B.x(0)) * 0.7;
  CONDS.forEach((c, j) => {
    const p = M.retrieval(c.d, c.same, c.cue).p, cur = c.d === depth && c.same === s3.same && c.cue === cue;
    ctx.fillStyle = cur ? C.cyan : C.grey; ctx.globalAlpha = cur ? 1 : 0.75; ctx.fillRect(B.x(bx(j)) - bw / 2, B.y(p), bw, B.y(0) - B.y(p)); ctx.globalAlpha = 1;
    if (!c.same) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1; for (let Y = B.y(p) + 4; Y < B.y(0); Y += 6) { ctx.beginPath(); ctx.moveTo(B.x(bx(j)) - bw / 2, Y); ctx.lineTo(B.x(bx(j)) + bw / 2, Y); ctx.stroke(); } }
  });
  ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  fitText(ctx, t('gShallow'), (B.x(bx(0)) + B.x(bx(3))) / 2, B.P.b + 18, B.x(bx(3)) - B.x(bx(0)) + bw, 12);
  fitText(ctx, t('gDeep'), (B.x(bx(4)) + B.x(bx(7))) / 2, B.P.b + 18, B.x(bx(7)) - B.x(bx(4)) + bw, 12);
  $('r3').textContent = t('s3readout', { depth: t(s3.deep ? 'depthD' : 'depthS'), room: t(s3.same ? 'roomSame' : 'roomDiff'), cue: t(s3.cue ? 'cueCat' : 'cueFree'), enc: r.enc, sem: r.sem, ctx: r.ctx, m: r.m, p: r.p.toFixed(3) });
}

/* ---------- step 4: interference ---------- */
const s4 = { design: 'retroactive' };
const DCOL = { control: C.green, proactive: C.orange, retroactive: C.violet };
function draw4() {
  const sim = num('sim4'), delay = num('del4'); $('sim4v').textContent = sim.toFixed(1); $('del4v').textContent = String(delay);
  [['dCtl', 'control'], ['dPro', 'proactive'], ['dRet', 'retroactive']].forEach(([id, d]) => $(id).setAttribute('aria-pressed', String(d === s4.design)));
  const r = M.interference(s4.design, sim, delay), rc = M.interference('control', sim, delay), gap = M.INT.gap;
  const { ctx, W, H } = fitCanvas($('c4'));
  const T = panel(ctx, W, { left: 20, top: 34, bottom: 70, xMin: -16, xMax: 64, xTicks: W < 420 ? [-12, 0, 12, 36, 60] : [-12, 0, 12, 24, 36, 48, 60], title: t('cTime') });
  const box = (h, col) => { ctx.fillStyle = col; ctx.fillRect(T.x(h - 1.5), T.P.t + 6, T.x(1.5) - T.x(-1.5), T.P.b - T.P.t - 12); };
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(T.P.l, (T.P.t + T.P.b) / 2); ctx.lineTo(T.P.r, (T.P.t + T.P.b) / 2); ctx.stroke();
  box(0, C.cyan);
  if (s4.design === 'proactive') box(-gap, C.pink); if (s4.design === 'retroactive') box(gap, C.pink);
  ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(T.x(gap + delay), T.P.t); ctx.lineTo(T.x(gap + delay), T.P.b); ctx.stroke();
  // strengths at test
  const S = panel(ctx, W, { left: 42, top: 122, bottom: 216, xMin: 0, xMax: 3, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], title: t('cStrength') });
  const bw = (S.x(1) - S.x(0)) * 0.5;
  [[r.sT, C.cyan], [r.sC, C.pink], [r.k, C.grey]].forEach(([v, col], i) => { ctx.fillStyle = col; ctx.fillRect(S.x(i + 0.5) - bw / 2, S.y(v), bw, S.y(0) - S.y(v)); });
  // accuracy vs delay for the three designs
  const A = panel(ctx, W, { left: 42, top: 270, bottom: H - 28, xMin: 0, xMax: 48, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: [0, 12, 24, 36, 48], title: t('cCurve') });
  ['control', 'proactive', 'retroactive'].forEach(d => {
    ctx.strokeStyle = DCOL[d]; ctx.lineWidth = d === s4.design ? 3 : 1.5; ctx.globalAlpha = d === s4.design ? 1 : 0.7; ctx.beginPath();
    for (let h = 0; h <= 48; h += 1) { const v = M.interference(d, sim, h).p; if (!h) ctx.moveTo(A.x(h), A.y(v)); else ctx.lineTo(A.x(h), A.y(v)); }
    ctx.stroke(); ctx.globalAlpha = 1;
  });
  ctx.fillStyle = DCOL[s4.design]; ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(A.x(delay), A.y(r.p), 6, 0, 7); ctx.fill(); ctx.stroke();
  const dn = { control: 'dCtl', proactive: 'dPro', retroactive: 'dRet' }[s4.design];
  $('r4').textContent = t('s4readout', { design: t(dn), sim: sim.toFixed(1), delay, sT: r.sT.toFixed(3), sC: r.sC.toFixed(3), p: r.p.toFixed(3), pc: rc.p.toFixed(3) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  [['strAcr', 'acronyms'], ['strYears', 'years'], ['strRand', 'random']].forEach(([id, k]) => $(id).addEventListener('click', () => { s0.key = k; draw0(); }));
  $('familiar0').addEventListener('click', () => { s0.familiar = !s0.familiar; draw0(); });
  $('k0').addEventListener('input', draw0);

  ['len1', 'rate1'].forEach(id => $(id).addEventListener('input', draw1));
  $('delay1').addEventListener('click', () => { s1.delay = !s1.delay; draw1(); });
  $('clear1').addEventListener('click', () => { s1.ghosts.clear(); draw1(); });

  $('soa2').addEventListener('input', () => { stopSweep(); draw2(); });
  $('b12').addEventListener('input', () => { stopSweep(); draw2(); });
  $('hard2').addEventListener('click', () => { s2.hard = !s2.hard; draw2(); });
  let sweepId = null;
  function stopSweep() { if (sweepId) { cancelAnimationFrame(sweepId); sweepId = null; } }
  $('sweep2').addEventListener('click', () => {
    stopSweep();
    if (reduceMotion()) { for (let q = 0; q <= 800; q += 25) { $('soa2').value = q; draw2(); } return; }
    const start = performance.now();
    const step = now => { const p = Math.min(1, (now - start) / 5000); $('soa2').value = Math.round(p * 800 / 25) * 25; draw2(); sweepId = p < 1 && !document.hidden ? requestAnimationFrame(step) : null; };
    sweepId = requestAnimationFrame(step);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSweep(); });

  $('deep3').addEventListener('click', () => { s3.deep = !s3.deep; draw3(); });
  $('room3').addEventListener('click', () => { s3.same = !s3.same; draw3(); });
  $('cue3').addEventListener('click', () => { s3.cue = !s3.cue; draw3(); });

  [['dCtl', 'control'], ['dPro', 'proactive'], ['dRet', 'retroactive']].forEach(([id, d]) => $(id).addEventListener('click', () => { s4.design = d; draw4(); }));
  ['sim4', 'del4'].forEach(id => $(id).addEventListener('input', draw4));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshMemory = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
