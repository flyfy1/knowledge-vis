'use strict';
// Periodic trends lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Data and every derived number come from window.PT_MODEL (model.js). Canvas text: panel titles, axis ticks,
// element symbols in fixed table cells / bar slots, and orbital labels; readouts live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PT_MODEL;
const t = (...a) => window.PT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a', none: '#2a3442' };
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const DIG = { r: 0, ie: 0, en: 2 };
const val = (e, p) => (e[p] == null ? t('none') : fmt(e[p], DIG[p]) + t('unit_' + p));
const name = e => t('el_' + e.sym);
const BY_Z = M.ELEMENTS.slice().sort((a, b) => a.Z - b.Z);

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
function title(ctx, text, X, Y, maxW) {
  let size = 12; ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function fitText(ctx, text, X, Y, maxW, size = 11, color = C.muted, weight = '') {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'center';
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 6);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceTicks(lo, hi, maxN = 4) {
  const span = hi - lo, raw = span / maxN, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map(f => f * mag).find(s => span / s <= maxN) || 10 * mag;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
// Plot with y ticks and n categorical x slots labelled underneath.
function panel(ctx, W, o) {
  const P = { l: o.left || 46, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const slot = (P.r - P.l) / o.n, x = i => P.l + slot * (i + 0.5);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  niceTicks(o.yMin, o.yMax, o.yN || 4).forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4); });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke(); ctx.restore();
  (o.labels || []).forEach((lab, i) => fitText(ctx, lab, x(i), P.b + 15, slot - 2, 11, o.labelCol ? o.labelCol(i) : C.muted));
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P, slot };
}
function dot(ctx, X, Y, r, col, ring) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, r + 3, 0, 7); ctx.stroke(); } ctx.restore(); }
function line(ctx, pts, col, lw = 2, dash = null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore(); }

/* ---------- colour scale and table ---------- */
const STOPS = [[27, 42, 107], [47, 111, 176], [63, 182, 201], [155, 227, 122], [245, 230, 99]];
function colour(f) {
  f = Math.max(0, Math.min(1, f)) * (STOPS.length - 1); const i = Math.min(STOPS.length - 2, Math.floor(f)), u = f - i;
  const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * u)); return `rgb(${c.join(',')})`;
}
const range = p => { const v = M.ELEMENTS.map(e => e[p]).filter(x => x != null); return [Math.min(...v), Math.max(...v)]; };
// Draws the 8 × 5 main-group table; returns a hit-test function.
function table(ctx, W, H, top, o) {
  const left = 22, cw = (W - left - 6) / 8, ch = (H - top - 6) / 5, [lo, hi] = range(o.prop || 'r');
  M.GROUPS.forEach((g, i) => fitText(ctx, String(g), left + cw * (i + 0.5), top - 5, cw - 2, 10));
  for (let p = 1; p <= 5; p++) fitText(ctx, String(p), left / 2, top + ch * (p - 0.5) + 4, left - 2, 10);
  M.ELEMENTS.forEach(e => {
    const i = M.GROUPS.indexOf(e.group), X = left + cw * i, Y = top + ch * (e.period - 1), v = o.prop ? e[o.prop] : null;
    const hl = o.highlight && o.highlight.includes(e.sym);
    ctx.fillStyle = o.prop ? (v == null ? C.none : colour((v - lo) / (hi - lo))) : (hl ? '#1f4c5e' : '#18222f');
    ctx.fillRect(X + 1.5, Y + 1.5, cw - 3, ch - 3);
    const light = o.prop && v != null && (v - lo) / (hi - lo) > 0.55;
    const showVal = o.prop && o.values && ch > 34;
    fitText(ctx, e.sym, X + cw / 2, Y + (showVal ? ch * 0.44 : ch * 0.5 + 4), cw - 4, Math.min(13, ch * 0.4), light ? '#0b1320' : C.text, '600');
    if (showVal) fitText(ctx, v == null ? '—' : fmt(v, DIG[o.prop]), X + cw / 2, Y + ch * 0.8, cw - 4, Math.min(10, ch * 0.26), light ? '#0b1320' : '#c9d5e3');
    if (o.selected === e.sym || hl) { ctx.save(); ctx.strokeStyle = hl ? C.orange : '#ffffff'; ctx.lineWidth = 2.5; ctx.strokeRect(X + 1.5, Y + 1.5, cw - 3, ch - 3); ctx.restore(); }
  });
  return (x, y) => { const i = Math.floor((x - left) / cw), p = Math.floor((y - top) / ch) + 1; return M.ELEMENTS.find(e => e.period === p && M.GROUPS.indexOf(e.group) === i); };
}

/* ---------- step 0: heat map ---------- */
const s0 = { prop: 'r', hit: null };
function draw0() {
  const e = BY_Z[num('e0')];
  $('e0v').textContent = e.sym;
  document.querySelectorAll('#props0 .btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === s0.prop));
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0title', { prop: t('propIn_' + s0.prop) }), 8, 16, W - 16);
  s0.hit = table(ctx, W, H, 40, { prop: s0.prop, values: true, selected: e.sym });
  const [lo, hi] = range(s0.prop);
  $('scale0').textContent = t('s0scale', { lo: fmt(lo, DIG[s0.prop]) + t('unit_' + s0.prop), hi: fmt(hi, DIG[s0.prop]) + t('unit_' + s0.prop) });
  $('r0').textContent = t('s0readout', { name: name(e), sym: e.sym, Z: e.Z, p: e.period, g: e.group, r: val(e, 'r'), ie: val(e, 'ie'), en: val(e, 'en') });
}

/* ---------- step 1: across a period, Zeff and radius ---------- */
function draw1() {
  const p = num('p1'), row = M.period(p), gi = Math.min(num('g1'), row.length) - 1, e = row[gi], sl = M.slater(e.Z), sh = M.shells(e.Z);
  $('p1v').textContent = String(p); $('g1v').textContent = `${gi + 1} · ${e.sym}`;
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 18, W - 16);
  const cx = W / 2, cy = 28 + (H - 28) / 2, Rmax = Math.min(W / 2 - 10, (H - 36) / 2), rr = e.r != null ? e.r : M.predictR(e.Z), R = Rmax * rr / 220;
  const n = sl.n;
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
  for (let k = 1; k <= n; k++) {
    const rk = Math.max(18, R * Math.pow(k / n, 1.1) * 0.9), cnt = sh[k] || 0, outer = k === n;
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, rk, 0, 7); ctx.stroke(); ctx.restore();
    for (let j = 0; j < cnt; j++) { const a = -Math.PI / 2 + j * 2 * Math.PI / cnt + k * 0.3; dot(ctx, cx + rk * Math.cos(a), cy + rk * Math.sin(a), outer ? 4.5 : 2.6, outer ? C.orange : '#8696aa'); }
  }
  dot(ctx, cx, cy, 13, C.pink);
  fitText(ctx, '+' + e.Z, cx, cy + 4, 24, 11, '#1a0d12', '700');
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const ys = row.map(q => q.r).filter(v => v != null).concat(row.map(q => M.predictR(q.Z)));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, n: row.length, yMin: 0, yMax: Math.max(240, Math.max(...ys) + 10), labels: row.map(q => q.sym), labelCol: i => (i === gi ? C.text : C.muted), title: t('c1b') });
  line(ctx, row.map((q, i) => [A.x(i), A.y(M.predictR(q.Z))]), C.orange, 1.8, [6, 4]);
  line(ctx, row.filter(q => q.r != null).map(q => [A.x(row.indexOf(q)), A.y(q.r)]), C.cyan, 2.2);
  row.forEach((q, i) => { if (q.r != null) dot(ctx, A.x(i), A.y(q.r), 3.5, C.cyan); });
  dot(ctx, A.x(gi), A.y(e.r != null ? e.r : M.predictR(e.Z)), 5, e.r != null ? C.cyan : C.orange, C.text);
  $('r1').textContent = (e.r != null
    ? t('s1readout', { name: name(e), Z: e.Z, n, v: sl.valence, S: fmt(sl.S), zf: fmt(sl.zeff), pred: Math.round(M.predictR(e.Z)), r: e.r })
    : t('s1noR', { name: name(e), zf: fmt(sl.zeff) })) + ' ' + t('s1fit', { c: M.R_CORR.toFixed(2) });
}

/* ---------- step 2: the two dips in IE ---------- */
function draw2() {
  const p = num('p2'), row = M.period(p), gi = num('g2') - 1, e = row[gi], b = M.valenceBoxes(e.Z);
  $('p2v').textContent = String(p); $('g2v').textContent = `${gi + 1} · ${e.sym}`;
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a') + ' · ' + e.sym, 8, 18, W - 16);
  const bw = Math.min(56, (W - 60) / 4.6), bh = bw * 1.15, gap = bw * 0.6, x0 = (W - (bw * 4 + gap)) / 2, y0 = 28 + (H - 28 - bh) / 2 + 6;
  fitText(ctx, b.n + 's', x0 + bw / 2, y0 - 10, bw, 12, C.muted);
  fitText(ctx, b.n + 'p', x0 + bw + gap + bw * 1.5, y0 - 10, bw * 3, 12, C.muted);
  const np = b.p.reduce((a, c) => a + c, 0);
  // the electron removed on ionisation is the last one placed
  const last = np > 0 ? { box: 1 + (np <= 3 ? np - 1 : np - 4), down: np > 3 } : { box: 0, down: b.s === 2 };
  const boxes = [{ x: x0, k: b.s }].concat([0, 1, 2].map(i => ({ x: x0 + bw + gap + bw * i, k: b.p[i] })));
  boxes.forEach((bx, i) => {
    ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.strokeRect(bx.x, y0, bw, bh); ctx.restore();
    for (let j = 0; j < bx.k; j++) {
      const down = j === 1, X = bx.x + bw * (bx.k === 2 ? (down ? 0.68 : 0.32) : 0.5), col = (i === last.box && down === last.down) ? C.orange : C.cyan;
      const y1 = y0 + bh * 0.82, y2 = y0 + bh * 0.18, a = down ? [y2, y1] : [y1, y2];
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, a[0]); ctx.lineTo(X, a[1]); ctx.stroke();
      const d = down ? 1 : -1; ctx.beginPath(); ctx.moveTo(X, a[1]); ctx.lineTo(X - 6, a[1] - d * 8); ctx.lineTo(X + 6, a[1] - d * 8); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  });
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const A = panel(ctx, W, { top: 30, bottom: H - 26, n: 8, yMin: 0, yMax: 2500, labels: row.map(q => q.sym), labelCol: i => (i === gi ? C.text : C.muted), title: t('c2b') });
  [2, 3, 4].filter(q => q !== p).forEach(q => line(ctx, M.period(q).map((el, i) => [A.x(i), A.y(el.ie)]), C.ghost, 1.4));
  row.forEach((el, i) => { if (i) line(ctx, [[A.x(i - 1), A.y(row[i - 1].ie)], [A.x(i), A.y(el.ie)]], el.ie < row[i - 1].ie ? C.orange : C.cyan, el.ie < row[i - 1].ie ? 3 : 2.2); });
  row.forEach((el, i) => dot(ctx, A.x(i), A.y(el.ie), i === gi ? 5 : 3.5, C.cyan, i === gi ? C.text : null));
  const st = M.ieStep(e.sym);
  const why = !st ? t('whyFirst') : st.kind === 'newP' ? t('whyNewP') : st.kind === 'firstPair' ? t('whyPair') : t('whyNormal');
  $('r2').textContent = st ? t('s2readout', { name: name(e), ie: e.ie, prev: st.prev.sym, d: t(st.delta >= 0 ? 'up' : 'down', { v: Math.abs(st.delta) }), why }) : t('s2first', { name: name(e), ie: e.ie, why });
}

/* ---------- step 3: down a group ---------- */
const s3 = { g: 1, prop: 'r' };
const G3 = [1, 2, 13, 14, 15, 16, 17];
function trendText(list, prop) {
  const want = prop === 'r' ? 1 : -1, flat = [], rev = [];
  for (let i = 1; i < list.length; i++) { const d = list[i][prop] - list[i - 1][prop]; if (d === 0) flat.push(list[i - 1].sym + '→' + list[i].sym); else if (Math.sign(d) !== want) rev.push(list[i - 1].sym + '→' + list[i].sym); }
  const dir = t(want > 0 ? 'dirUp' : 'dirDown');
  if (rev.length) return t('monoBreak', { dir, pairs: rev.join(t('listSep')) });
  if (flat.length) return t('monoFlat', { dir, pairs: flat.join(t('listSep')) });
  return t(want > 0 ? 'monoUp' : 'monoDown');
}
function draw3() {
  const list = M.group(s3.g), prop = s3.prop;
  document.querySelectorAll('#groups3 .btn').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.g) === s3.g));
  document.querySelectorAll('#props3 .btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === prop));
  let { ctx, W, H } = fitCanvas($('c3'));
  const [lo, hi] = range(prop), top = prop === 'en' ? 4 : prop === 'ie' ? 1800 : 240;
  const A = panel(ctx, W, { top: 30, bottom: H - 26, n: list.length, yMin: 0, yMax: top, labels: list.map(q => q.sym), title: t('c3a', { prop: t('prop_' + prop) }) });
  const bw = Math.min(44, A.slot * 0.55);
  list.forEach((q, i) => { const Y = A.y(q[prop]); ctx.fillStyle = colour((q[prop] - lo) / (hi - lo)); ctx.fillRect(A.x(i) - bw / 2, Y, bw, A.P.b - Y); });
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, n: list.length, yMin: 0, yMax: 6, labels: list.map(q => q.sym), title: t('c3b') });
  const w2 = Math.min(18, B.slot * 0.28);
  list.forEach((q, i) => { const s = M.slater(q.Z); ctx.fillStyle = C.violet; ctx.fillRect(B.x(i) - w2 - 1, B.y(s.zeff), w2, B.P.b - B.y(s.zeff)); ctx.fillStyle = C.green; ctx.fillRect(B.x(i) + 1, B.y(s.nstar), w2, B.P.b - B.y(s.nstar)); });
  const f = list[0], l = list[list.length - 1];
  $('r3').textContent = t('s3readout', { g: s3.g, first: f.sym, last: l.sym, prop: t('prop_' + prop), a: val(f, prop), b: val(l, prop), mono: trendText(list, prop), zs: list.map(q => q.sym + ' ' + fmt(M.slater(q.Z).zeff)).join(t('listSep')) });
}

/* ---------- step 4: predict and check ---------- */
const s4 = { i: 0, picks: {} };
function exceptionWhy(prop, a, b) {
  if (prop === 'ie') { const later = M.bySym[a].group > M.bySym[b].group ? a : b, st = M.ieStep(later); if (st && st.kind === 'newP') return t('ex_newP'); if (st && st.kind === 'firstPair') return t('ex_pair'); }
  return t('ex_d');
}
function draw4() {
  const N = M.QUESTIONS.length, [prop, a, b] = M.QUESTIONS[s4.i], pick = s4.picks[s4.i];
  $('q4').textContent = t('s4q', { i: s4.i + 1, N, a, b, prop: t('propIn_' + prop) });
  $('pickA').textContent = a; $('pickB').textContent = b; $('pickA').disabled = !!pick; $('pickB').disabled = !!pick;
  let { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 16, W - 16);
  table(ctx, W, H, 36, { highlight: [a, b] });
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const top = prop === 'en' ? 4 : prop === 'ie' ? 1800 : 240;
  const A = panel(ctx, W, { top: 30, bottom: H - 26, n: 2, yMin: 0, yMax: top, labels: [a, b], title: t('c4b') + ' · ' + t('prop_' + prop) });
  if (pick) { const win = M.truth(prop, a, b), bw = Math.min(60, A.slot * 0.5); [a, b].forEach((s, i) => { const Y = A.y(M.bySym[s][prop]); ctx.fillStyle = s === win ? C.cyan : C.ghost; ctx.fillRect(A.x(i) - bw / 2, Y, bw, A.P.b - Y); }); }
  if (!pick) {
    $('r4').textContent = '';
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let msg = t('c4wait'), fs = 13;
    while (ctx.measureText(msg).width > W - 70 && fs > 10) { fs -= 1; ctx.font = fs + 'px system-ui, sans-serif'; }
    const mx = (A.P.l + A.P.r) / 2, my = (30 + H - 26) / 2, mw = ctx.measureText(msg).width + 16;
    ctx.fillStyle = C.bg; ctx.fillRect(mx - mw / 2, my - fs, mw, fs * 2);
    ctx.fillStyle = C.muted; ctx.fillText(msg, mx, my);
  }
  else {
    const win = M.truth(prop, a, b), rule = M.rulePredicts(prop, a, b);
    $('r4').textContent = t('s4fb', { pick, ok: t(pick === win ? 'pickYes' : 'pickNo'), win, a, b, va: val(M.bySym[a], prop), vb: val(M.bySym[b], prop), rule, ruleOk: rule === win ? t('ruleYes') : t('ruleNo', { why: exceptionWhy(prop, a, b) }) });
  }
  const done = Object.keys(s4.picks).map(Number), c = done.filter(i => { const [p, x, y] = M.QUESTIONS[i]; return s4.picks[i] === M.truth(p, x, y); }).length;
  const r = done.filter(i => { const [p, x, y] = M.QUESTIONS[i]; return M.rulePredicts(p, x, y) === M.truth(p, x, y); }).length;
  $('score4').textContent = done.length === N ? t('s4done', { r }) : t('s4score', { n: done.length, N, c, r });
  $('next4').disabled = s4.i >= N - 1;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  M.PROPS.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.p = p; b.dataset.step = '0'; b.dataset.i18n = 'prop_' + p; b.textContent = t('prop_' + p); b.addEventListener('click', () => { s0.prop = p; draw0(); }); $('props0').appendChild(b); });
  $('e0').addEventListener('input', draw0);
  $('c0').addEventListener('click', ev => { const r = $('c0').getBoundingClientRect(), e = s0.hit && s0.hit(ev.clientX - r.left, ev.clientY - r.top); if (e) { $('e0').value = BY_Z.indexOf(e); draw0(); } });
  ['p1', 'g1'].forEach(id => $(id).addEventListener('input', draw1));
  ['p2', 'g2'].forEach(id => $(id).addEventListener('input', draw2));
  G3.forEach(g => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.g = g; b.dataset.step = '3'; b.textContent = String(g); b.addEventListener('click', () => { s3.g = g; draw3(); }); $('groups3').appendChild(b); });
  M.PROPS.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.p = p; b.dataset.step = '3'; b.dataset.i18n = 'prop_' + p; b.textContent = t('prop_' + p); b.addEventListener('click', () => { s3.prop = p; draw3(); }); $('props3').appendChild(b); });
  const pickFn = k => () => { if (s4.picks[s4.i]) return; s4.picks[s4.i] = M.QUESTIONS[s4.i][k]; draw4(); };
  $('pickA').addEventListener('click', pickFn(1)); $('pickB').addEventListener('click', pickFn(2));
  $('next4').addEventListener('click', () => { s4.i = Math.min(M.QUESTIONS.length - 1, s4.i + 1); draw4(); });
  $('restart4').addEventListener('click', () => { s4.i = 0; s4.picks = {}; draw4(); });
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
  window.refreshTrends = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
