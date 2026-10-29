'use strict';
/* ---------- pure model ---------- */
const EDGES_WEB = [[0, 1], [0, 2], [0, 3], [1, 4], [4, 5], [3, 5], [2, 6], [3, 6], [5, 7], [3, 7]];
const EDGES_CHAIN = [[0, 1], [0, 2], [0, 3], [1, 4], [4, 5], [2, 6], [5, 7]];
const POS = [[0.50, 0.90], [0.14, 0.63], [0.50, 0.63], [0.86, 0.63], [0.14, 0.37], [0.38, 0.22], [0.62, 0.37], [0.80, 0.14]];
const XS = [100, 40, 30, 30, 15, 8, 4, 3], CC = [0.00483, 0.00269, 0.0036, 0.00616, 0.00397, 0.00397, 0.00232, 0.00232, 0.0036, 0.0036];
const SS = [0.004, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002], EFF = 0.5, T_END = 150, DT = 0.05;
const CHAIN_IDX = [0, 1, 4, 5, 7];
const SP_COL = ['#7ee2a8', '#c8e06a', '#ffb454', '#c9a27a', '#6ee7ff', '#a78bfa', '#ff7a93', '#f4f6f9'];
const edgesOf = mode => (mode === 'chain' ? EDGES_CHAIN : EDGES_WEB);
const preyOf = (e, i) => e.filter(x => x[1] === i).map(x => x[0]);
const predOf = (e, i) => e.filter(x => x[0] === i).map(x => x[1]);
function trophic(e) { const tl = []; const f = i => { if (tl[i] !== undefined) return tl[i]; const p = preyOf(e, i); return (tl[i] = p.length ? 1 + p.map(f).reduce((a, b) => a + b, 0) / p.length : 1); }; for (let i = 0; i < 8; i++) f(i); return tl; }
function structuralExtinct(e, removed) {
  const alive = new Set([0, 1, 2, 3, 4, 5, 6, 7].filter(i => !removed.includes(i))), gone = [];
  for (let ch = true; ch;) { ch = false; alive.forEach(i => { const p = preyOf(e, i); if (p.length && !p.some(j => alive.has(j))) { alive.delete(i); gone.push(i); ch = true; } }); }
  return gone.sort((a, b) => a - b);
}
function growthRates() { const r = SS.map((s, i) => s * XS[i]); EDGES_WEB.forEach(([p, q], k) => { r[p] += CC[k] * XS[q]; r[q] -= EFF * CC[k] * XS[p]; }); return r; }
function simulate(removed) {
  const r = growthRates(); let x = XS.slice(); removed.forEach(i => { x[i] = 0; }); const out = [x.map((v, i) => 100 * v / XS[i])];
  for (let n = 1; n <= Math.round(T_END / DT); n++) {
    const dx = r.map((v, i) => v - SS[i] * x[i]); EDGES_WEB.forEach(([p, q], k) => { dx[p] -= CC[k] * x[q]; dx[q] += EFF * CC[k] * x[p]; });
    x = x.map((v, i) => (removed.includes(i) ? 0 : Math.max(0, v + DT * v * dx[i])));
    if (n % Math.round(1 / DT) === 0) out.push(x.map((v, i) => 100 * v / XS[i]));
  }
  return out;
}
const pyramid = (eff, n = 5) => Array.from({ length: n }, (_, i) => 10000 * Math.pow(eff / 100, i));
const supported = e => e.filter(v => v >= 5).length;
const biomag = (c0, f, n = 5) => Array.from({ length: n }, (_, i) => c0 * Math.pow(f, i));
/*KIT-BEGIN*/
const $ = id => document.getElementById(id);
const C = { cyan: '#6ee7ff', orange: '#ffb454', pink: '#ff7a93', green: '#7ee2a8', muted: '#9aa7b8', text: '#e8edf4', line: '#2b3547', panel: '#1c2330' };
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function fit(id) {
  const cv = $(id), dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.h === undefined) cv.dataset.h = cv.getAttribute('height') || '280';
  cv.style.height = cv.dataset.h + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.h);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.W = w; ctx.H = h; return ctx;
}
function ln(c, x1, y1, x2, y2, col, w, dash) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w || 2; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); }
function dt(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = col; c.fill(); }
function tx(c, s, x, y, col, size, al) { c.font = (size || 13) + 'px system-ui,sans-serif'; c.fillStyle = col || C.muted; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function rect(c, x, y, w, h, fill, stroke) { c.beginPath(); c.rect(x, y, w, h); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); } }
function fmt(x, n) { return Number(x).toFixed(n === undefined ? 1 : n); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function arrow(c, x1, y1, x2, y2, col, w) { ln(c, x1, y1, x2, y2, col, w); const a = Math.atan2(y2 - y1, x2 - x1), s = 9; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)); c.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)); c.closePath(); c.fillStyle = col; c.fill(); }
function bindLang() {
  document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
}
function bindSpy() {
  const links = document.querySelectorAll('.nav-step');
  const mark = i => links.forEach(a => a.classList.toggle('active', a.dataset.nav === String(i)));
  mark(0);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) mark(e.target.dataset.step); }); }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('.step').forEach(s => io.observe(s));
}
/* eased values: name -> {cur, tgt}; a single rAF loop runs only while something is moving */
const Anim = { v: {}, on: false, redraw: null,
  get(n, d) { return this.v[n] ? this.v[n].cur : d; },
  set(n, tgt, snap) { const o = this.v[n] || (this.v[n] = { cur: tgt, tgt }); o.tgt = tgt; if (snap || reduced()) o.cur = tgt; this.kick(); },
  kick() { if (this.on) return; this.on = true; requestAnimationFrame(() => this.tick()); },
  tick() {
    let moving = false;
    for (const n in this.v) { const o = this.v[n], d = o.tgt - o.cur; if (Math.abs(d) > 0.004 * (1 + Math.abs(o.tgt))) { o.cur += d * 0.16; moving = true; } else o.cur = o.tgt; }
    if (this.redraw) this.redraw();
    if (moving && !document.hidden) requestAnimationFrame(() => this.tick()); else this.on = false;
  } };
/*KIT-END*/

const S = { sp0: 6, eff1: 10, rm2: 5, traj: null, t2: 0, run2: false, f3: 5, c03: 1, mode4: 'web', rm4: 5, removed4: [] };
let nodePx = [];
function fillSp(id, cur) { const el = $(id); el.innerHTML = ''; for (let i = 0; i < 8; i++) { const o = document.createElement('option'); o.value = i; o.textContent = t('sp' + i); if (i === cur) o.selected = true; el.appendChild(o); } }
function fillMode() { const el = $('s4-mode'); el.innerHTML = ''; [['web', 'modeWeb'], ['chain', 'modeChain']].forEach(([k, l]) => { const o = document.createElement('option'); o.value = k; o.textContent = t(l); if (k === S.mode4) o.selected = true; el.appendChild(o); }); }
function drawWeb(c, W, H, edges, opt) {
  const tl = trophic(edges), P = POS.map(p => [14 + p[0] * (W - 28), 22 + p[1] * (H - 64)]); nodePx = P;
  edges.forEach(([a, b]) => {
    let col = '#4a5d80', w = 1.8; if (opt.sel !== undefined) { if (b === opt.sel) { col = C.cyan; w = 3; } else if (a === opt.sel) { col = C.orange; w = 3; } }
    if (opt.state && (opt.state[a] !== 'alive' || opt.state[b] !== 'alive')) col = '#2c3648';
    arrow(c, P[a][0] + (P[b][0] - P[a][0]) * 0.12, P[a][1] + (P[b][1] - P[a][1]) * 0.12, P[b][0] - (P[b][0] - P[a][0]) * 0.14, P[b][1] - (P[b][1] - P[a][1]) * 0.14, col, w);
  });
  for (let i = 0; i < 8; i++) {
    const st = opt.state ? opt.state[i] : 'alive', col = st === 'alive' ? SP_COL[i] : '#4a5360', sel = opt.sel === i;
    dt(c, P[i][0], P[i][1], 16, '#0a0e14'); dt(c, P[i][0], P[i][1], sel ? 15 : 13, col);
    if (sel) { c.beginPath(); c.arc(P[i][0], P[i][1], 19, 0, 6.2832); c.strokeStyle = C.text; c.lineWidth = 2; c.stroke(); }
    if (st === 'removed') { ln(c, P[i][0] - 9, P[i][1] - 9, P[i][0] + 9, P[i][1] + 9, C.pink, 3); ln(c, P[i][0] + 9, P[i][1] - 9, P[i][0] - 9, P[i][1] + 9, C.pink, 3); }
    tx(c, t('sp' + i), P[i][0], P[i][1] + 28, st === 'alive' ? C.text : C.muted, 12);
  }
  return tl;
}
/* ---- step 0 ---- */
function drawS0() { const c = fit('s0-cv'); drawWeb(c, c.W, c.H, EDGES_WEB, { sel: S.sp0 }); }
function roS0() {
  const tl = trophic(EDGES_WEB), pr = preyOf(EDGES_WEB, S.sp0), pd = predOf(EDGES_WEB, S.sp0), nm = a => a.map(i => t('sp' + i)).join(t('s0sep'));
  $('s0-ro').textContent = t('s0ro', { name: t('sp' + S.sp0), tl: fmt(tl[S.sp0], 2), eats: pr.length ? nm(pr) : t('s0prod'), eaten: pd.length ? nm(pd) : t('s0top') });
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, e = pyramid(S.eff1), n = 5, rowH = (H - 30) / n, x0 = 124, pw = W - x0 - 10;
  for (let i = 0; i < n; i++) {
    const w = Math.max(24, pw * (Math.log10(e[i]) + 0.5) / 4.5), y = H - 14 - (i + 1) * rowH, ok = e[i] >= 5;
    rect(c, x0 + pw / 2 - w / 2, y + 3, w, rowH - 6, ok ? SP_COL[CHAIN_IDX[i]] : '#3b4350'); tx(c, fmt(e[i], e[i] < 10 ? 2 : 0) + ' ' + t('unitKj'), x0 + pw / 2, y + rowH / 2, ok ? '#0a0e14' : C.muted, 12);
    tx(c, t('lvl' + (i + 1)), 8, y + rowH / 2, C.muted, 11, 'left');
  }
}
function roS1() {
  const e = pyramid(S.eff1); $('s1-eff-o').textContent = S.eff1 + '%';
  $('s1-ro').textContent = t('s1ro', { eff: S.eff1, list: e.map(v => fmt(v, v < 10 ? 2 : 0)).join(' → '), n: supported(e) });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, ml = 40, mr = W > 520 ? 110 : 14, mt = 12, mb = W > 520 ? 30 : 74, cw = W - ml - mr, ch = H - mt - mb, X = tt => ml + cw * tt / T_END, Y = p => mt + ch - ch * Math.min(p, 250) / 250;
  for (let p = 0; p <= 250; p += 50) { ln(c, ml, Y(p), ml + cw, Y(p), p === 100 ? '#33425c' : '#22304a', 1); tx(c, String(p), ml - 5, Y(p), C.muted, 10, 'right'); }
  for (let tt = 0; tt <= T_END; tt += 50) tx(c, String(tt), X(tt), mt + ch + 12, C.muted, 10);
  ln(c, ml, mt + ch, ml + cw, mt + ch, C.muted, 1.5); ln(c, ml, mt, ml, mt + ch, C.muted, 1.5);
  const tr = S.traj, upto = tr ? Math.min(T_END, Math.floor(S.t2)) : 0;
  for (let i = 0; i < 8; i++) {
    c.beginPath(); for (let k = 0; k <= upto; k++) { const v = tr ? tr[k][i] : 100; k ? c.lineTo(X(k), Y(v)) : c.moveTo(X(k), Y(v)); } if (!tr) c.lineTo(X(T_END), Y(100)); c.strokeStyle = SP_COL[i]; c.lineWidth = 2; c.stroke();
    const lx = W > 520 ? ml + cw + 10 : ml + (i % 4) * (cw / 4), ly = W > 520 ? mt + 12 + i * 18 : mt + ch + 30 + Math.floor(i / 4) * 18;
    dt(c, lx, ly, 4, SP_COL[i]); tx(c, t('sp' + i), lx + 8, ly, C.muted, 11, 'left');
  }
}
function roS2() {
  $('s2-run').textContent = t('s2run');
  if (!S.traj) { $('s2-ro').textContent = t('s2ro0'); return; }
  const k = Math.min(T_END, Math.floor(S.t2)), v = S.traj[k];
  $('s2-ro').textContent = t('s2ro1', { name: t('sp' + S.rm2), t: k, list: v.map((p, i) => t('sp' + i) + ' ' + fmt(p, 0) + '%' + (p < 2 ? t('s2dead') : '')).join('; ') });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, v = biomag(S.c03, S.f3), ml = 40, mb = 56, mt = 16, bw = (W - ml - 12) / 5, Y = x => mt + (H - mt - mb) * (1 - (Math.log10(x) + 1) / 6.5);
  ln(c, ml, Y(100), W - 8, Y(100), C.pink, 1.5, [6, 4]); tx(c, '100', ml - 5, Y(100), C.pink, 11, 'right');
  [0.1, 1, 10, 1000, 10000].forEach(g => { ln(c, ml, Y(g), W - 8, Y(g), '#22304a', 1); tx(c, String(g), ml - 5, Y(g), C.muted, 10, 'right'); });
  ln(c, ml, H - mb, W - 8, H - mb, C.muted, 1.5);
  v.forEach((x, i) => { const bx = ml + 6 + i * bw, top = Y(Math.max(x, 0.1)), over = x > 100; rect(c, bx, top, bw - 12, H - mb - top, over ? C.pink : SP_COL[CHAIN_IDX[i]]); tx(c, fmt(x, x < 10 ? 2 : 0), bx + (bw - 12) / 2, top - 8, over ? C.pink : C.text, 11); tx(c, t('sp' + CHAIN_IDX[i]), bx + (bw - 12) / 2, H - mb + 14, C.text, 11); });
}
function roS3() {
  const v = biomag(S.c03, S.f3); $('s3-f-o').textContent = '× ' + fmt(S.f3, 1); $('s3-c0-o').textContent = fmt(S.c03, 1);
  const over = v.map((x, i) => (x > 100 ? t('s3over', { n: i + 1, name: t('sp' + CHAIN_IDX[i]) }) : null)).filter(Boolean);
  $('s3-ro').textContent = t('s3ro', { list: v.map(x => fmt(x, x < 10 ? 2 : 0)).join(' → '), over: over.length ? over.join(', ') : t('s0none') });
}
/* ---- step 4 ---- */
function stateS4() { const e = edgesOf(S.mode4), gone = structuralExtinct(e, S.removed4); return { gone, st: Array.from({ length: 8 }, (_, i) => (S.removed4.includes(i) ? 'removed' : gone.includes(i) ? 'extinct' : 'alive')) }; }
function drawS4() { const c = fit('s4-cv'), W = c.W, H = c.H, s = stateS4(); drawWeb(c, W, H, edgesOf(S.mode4), { state: s.st }); tx(c, [t('statAlive'), t('statRemoved'), t('statExtinct')].join('  ·  '), W / 2, H - 6, C.muted, 10); }
function roS4() {
  const mode = t(S.mode4 === 'web' ? 'modeWeb' : 'modeChain');
  if (!S.removed4.length) { $('s4-ro').textContent = t('s4ro0', { mode }); return; }
  const s = stateS4(), other = structuralExtinct(edgesOf(S.mode4 === 'web' ? 'chain' : 'web'), S.removed4);
  $('s4-ro').textContent = t('s4ro', { mode, name: S.removed4.map(i => t('sp' + i)).join(', '), n: s.gone.length, list: s.gone.length ? s.gone.map(i => t('sp' + i)).join(', ') : t('s0none'), other: other.length });
}
/* ---- loop (step 2 progress only) ---- */
let loopOn = false, vis2 = false, last = 0;
function frame(ts) { const d = Math.min(0.1, (ts - last) / 1000); last = ts; if (S.run2) { S.t2 = Math.min(T_END, S.t2 + d * 30); if (S.t2 >= T_END) S.run2 = false; } drawS2(); roS2(); if (S.run2 && vis2 && !document.hidden) requestAnimationFrame(frame); else loopOn = false; }
function kick() { if (reduced()) { if (S.run2) { S.t2 = T_END; S.run2 = false; } drawS2(); roS2(); return; } if (!loopOn && S.run2 && vis2) { loopOn = true; last = performance.now(); requestAnimationFrame(frame); } }
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() { fillSp('s0-sp', S.sp0); fillSp('s2-rm', S.rm2); fillSp('s4-rm', S.rm4); fillMode(); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  const pick = i => { S.sp0 = (i + 8) % 8; $('s0-sp').value = S.sp0; redraw(); };
  on('s0-sp', 'change', e => pick(Number(e.target.value)));
  on('s0-cv', 'pointerdown', e => { const r = $('s0-cv').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let b = -1, bd = 30; nodePx0().forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; b = i; } }); if (b >= 0) pick(b); });
  on('s0-cv', 'keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { pick(S.sp0 + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { pick(S.sp0 - 1); e.preventDefault(); } });
  on('s1-eff', 'input', e => { S.eff1 = Number(e.target.value); redraw(); });
  on('s2-rm', 'change', e => { S.rm2 = Number(e.target.value); S.traj = null; S.run2 = false; S.t2 = 0; redraw(); });
  on('s2-run', 'click', () => { S.traj = simulate([S.rm2]); S.t2 = 0; S.run2 = true; kick(); redraw(); });
  on('s2-reset', 'click', () => { S.traj = null; S.run2 = false; S.t2 = 0; redraw(); });
  on('s3-f', 'input', e => { S.f3 = Number(e.target.value); redraw(); }); on('s3-c0', 'input', e => { S.c03 = Number(e.target.value); redraw(); });
  on('s4-mode', 'change', e => { S.mode4 = e.target.value; redraw(); });
  on('s4-rm', 'change', e => { S.rm4 = Number(e.target.value); });
  on('s4-remove', 'click', () => { if (!S.removed4.includes(S.rm4)) S.removed4.push(S.rm4); redraw(); });
  on('s4-reset', 'click', () => { S.removed4 = []; redraw(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis2 = es[0].isIntersecting; if (vis2) kick(); }, { threshold: 0.05 }).observe($('step2')); else vis2 = true;
  document.addEventListener('visibilitychange', kick);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
function nodePx0() { const cv = $('s0-cv'); return POS.map(p => [14 + p[0] * (cv.clientWidth - 28), 22 + p[1] * (Number(cv.dataset.h) - 64)]); }
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { EDGES_WEB, EDGES_CHAIN, trophic, structuralExtinct, growthRates, simulate, pyramid, supported, biomag, XS, preyOf, predOf };
