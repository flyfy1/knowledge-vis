'use strict';
// Replication lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every version, probability and readout comes from window.REPL_MODEL (model.js). Canvas text is
// limited to panel titles, axis ticks, replica boxes (name / version / value) and one status per side.
(function () {

const $ = id => document.getElementById(id);
const M = window.REPL_MODEL;
const t = (...a) => window.REPL_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', box: '#172331', raw: '#6b7b90' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
// Availability as a percentage with enough digits to show the missing part.
const fmtAvail = a => { const u = 1 - a; const d = u <= 1e-12 ? 2 : Math.max(1, Math.min(9, Math.ceil(-Math.log10(u)) + 1)); return u <= 1e-12 ? '100' : fmt(a * 100, d); };
const sep = () => (window.REPL_I18N.getLang() === 'zh' ? '、' : ', ');
const rname = i => 'R' + (i + 1);

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
function fitFont(ctx, text, maxW, size = 12, weight = 600) {
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
}
function title(ctx, text, X, Y, maxW) { ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; fitFont(ctx, text, maxW); ctx.fillText(text, X, Y); ctx.restore(); }
function centerText(ctx, text, x, y, maxW, size, weight, color) { ctx.save(); fitFont(ctx, text, maxW, size, weight); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); ctx.restore(); }
const dash = (ctx, x0, y0, x1, y1, color, w = 1.4) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
function rbox(ctx, x, y, w, h, fill, stroke, lw = 1.5) { ctx.save(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 6) : ctx.rect(x, y, w, h); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, color, w = 2) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(a - 0.4), y1 - 8 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 8 * Math.cos(a + 0.4), y1 - 8 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); ctx.restore();
}
function cross(ctx, x, y, color, s = 5) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); ctx.restore(); }
// a row of n replica boxes between L and R; returns their geometry
function row(n, L, R, gap) { const w = (R - L - gap * (n - 1)) / n; return Array.from({ length: n }, (_, i) => ({ x: L + i * (w + gap), w })); }

/* ---------- step 0: copies drift apart ---------- */
const s0 = { reps: M.cluster0(), reach: [true, true, false, false, false], writes: 0, last: null, read: -1, n: 0, s: 0, rnd: M.mulberry32(11) };
function buildReach() {
  $('reach0').innerHTML = s0.reach.map((_, i) => `<button class="btn toggle reach" type="button" data-step="0" data-r="${i}"></button>`).join('');
  $('reach0').addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (!b) return; const i = Number(b.dataset.r); s0.reach[i] = !s0.reach[i]; draw0(); });
}
function draw0() {
  [...$('reach0').children].forEach((b, i) => { b.textContent = t(s0.reach[i] ? 'reachOn' : 'reachOff', { r: rname(i) }); b.setAttribute('aria-pressed', String(s0.reach[i])); });
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0'), 8, 16, W - 16);
  const top = Math.max(...s0.reps.map(r => r.v));
  const cw = Math.min(120, W * 0.3), cx = W / 2, cy = 30;
  rbox(ctx, cx - cw / 2, cy, cw, 30, C.box, C.muted);
  centerText(ctx, t('client'), cx, cy + 15, cw - 8, 12, 600, C.text);
  const g = row(5, 10, W - 10, W < 420 ? 6 : 14), by = 140, bh = 82;
  g.forEach((b, i) => {
    const mx = b.x + b.w / 2;
    if (s0.last) {
      if (s0.last[i]) arrow(ctx, cx, cy + 30, mx, by - 4, C.cyan, 1.8);
      else { dash(ctx, cx, cy + 30, cx + (mx - cx) * 0.6, cy + 30 + (by - 4 - cy - 30) * 0.6, C.raw); cross(ctx, cx + (mx - cx) * 0.6, cy + 30 + (by - 4 - cy - 30) * 0.6, C.pink, 4); }
    }
    const r = s0.reps[i], fresh = r.v === top;
    if (i === s0.read) rbox(ctx, b.x - 4, by - 4, b.w + 8, bh + 8, 'transparent', C.green, 3);
    rbox(ctx, b.x, by, b.w, bh, fresh ? '#123345' : '#33270f', fresh ? C.cyan : C.orange, 2);
    centerText(ctx, rname(i), mx, by + 16, b.w - 6, 12, 600, C.muted);
    centerText(ctx, 'v' + r.v, mx, by + 40, b.w - 6, 14, 700, fresh ? C.cyan : C.orange);
    centerText(ctx, String(r.val), mx, by + 64, b.w - 6, 14, 600, C.text);
  });
  const fresh = s0.reps.filter(r => r.v === top).length, newest = s0.reps.find(r => r.v === top);
  $('r0').textContent = t('s0state', { v: top, val: newest.val, fresh, stale: 5 - fresh });
  if (s0.read >= 0) { const r = s0.reps[s0.read]; $('r0b').textContent = t('s0read', { r: rname(s0.read), v: r.v, val: r.val, tag: t(r.v === top ? 'tagNew' : 'tagOld'), n: s0.n, s: s0.s }); }
  else $('r0b').textContent = '';
}

/* ---------- step 1: quorum overlap ---------- */
function clampMax(nId, ids) { const N = num(nId); ids.forEach(id => { const el = $(id); el.max = String(N); if (num(id) > N) el.value = String(N); }); }
function draw1() {
  clampMax('n1', ['w1', 'r1s']);
  const N = num('n1'), Wq = num('w1'), R = num('r1s'), p = M.staleProb(N, Wq, R);
  $('n1v').textContent = String(N); $('w1v').textContent = String(Wq); $('r1v').textContent = String(R);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1top'), 8, 16, W - 16);
  const g = row(N, 12, W - 12, W < 420 ? 6 : 12), by = 30, bh = 30;
  g.forEach((b, i) => {
    const inW = i < Wq, inR = i >= N - R;
    rbox(ctx, b.x, by, b.w, bh, inW ? '#1f5f74' : C.box, inR ? C.orange : C.axis, inR ? 3 : 1);
    centerText(ctx, rname(i), b.x + b.w / 2, by + bh / 2, b.w - 6, 12, 600, inW ? C.text : C.muted);
  });
  // heatmap of the stale probability over (W, R)
  const top = 106, bot = H - 30, L = 40, avail = Math.min(W - L - 12, bot - top), cell = Math.floor(avail / N), gx = L + Math.floor((W - L - 12 - cell * N) / 2);
  title(ctx, t('c1bot'), 8, top - 12, W - 16);
  const X = w => gx + (w - 1) * cell, Y = r => top + (N - r) * cell;
  for (let w = 1; w <= N; w++) for (let r = 1; r <= N; r++) {
    const q = M.staleProb(N, w, r), x = X(w), y = Y(r);
    let fill = '#16222f';
    if (q > 0) { const a = 0.25 + 0.75 * q; fill = `rgba(255,180,84,${a.toFixed(3)})`; }
    ctx.fillStyle = fill; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    const txt = q === 0 ? '0' : Math.round(q * 100) + '%';
    centerText(ctx, txt, x + cell / 2, y + cell / 2 + 0.5, cell - 4, Math.min(12, Math.floor(cell * 0.4)), 600, q > 0.45 ? '#1b1206' : q === 0 ? '#5d6f85' : C.text);
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.strokeRect(X(Wq) + 1, Y(R) + 1, cell - 2, cell - 2); ctx.restore();
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let w = 1; w <= N; w++) ctx.fillText(String(w), X(w) + cell / 2, top + cell * N + 15);
  ctx.textAlign = 'right'; for (let r = 1; r <= N; r++) ctx.fillText(String(r), gx - 6, Y(r) + cell / 2 + 4);
  ctx.restore();
  if (Wq + R > N) $('r1').textContent = t('s1safe', { N, W: Wq, R, sum: Wq + R, ov: Wq + R - N });
  else $('r1').textContent = t('s1miss', { N, W: Wq, R, sum: Wq + R, a: N - Wq, num: M.choose(N - Wq, R), den: M.choose(N, R), pct: fmt(p * 100, 1) });
}

/* ---------- step 2: measured stale reads ---------- */
const S2N = 200;
const s2 = { seed: 1, k: 0, log: null, prev: [] };
function sim2() { s2.log = M.simulate(num('n2'), num('w2'), num('r2s'), S2N, s2.seed); }
function draw2() {
  const N = num('n2'), Wq = num('w2'), R = num('r2s'), th = M.staleProb(N, Wq, R);
  $('n2v').textContent = String(N); $('w2v').textContent = String(Wq); $('r2v').textContent = String(R);
  const { ctx, W, H } = fitCanvas($('c2'));
  const cur = s2.k > 0 ? s2.log[s2.k - 1] : null;
  title(ctx, t('c2top', { k: s2.k }), 8, 16, W - 16);
  const g = row(N, 12, W - 12, W < 420 ? 5 : 10), by = 30, bh = 40;
  g.forEach((b, i) => {
    const v = cur ? cur.vers[i] : 1, latest = cur ? cur.latest : 1, inW = cur && cur.ws.includes(i), inR = cur && cur.rs.includes(i);
    rbox(ctx, b.x, by, b.w, bh, inW ? '#1f5f74' : C.box, inR ? C.orange : C.axis, inR ? 3 : 1);
    centerText(ctx, 'v' + v, b.x + b.w / 2, by + bh / 2, b.w - 6, 13, 700, v === latest ? C.cyan : C.muted);
  });
  const top = 116, bot = H - 26, L = 44, Rr = W - 14, X = i => L + i / S2N * (Rr - L), Y = v => bot - v * (bot - top);
  title(ctx, t('c2bot'), 8, top - 12, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [0, 0.5, 1].forEach((v, i) => { ctx.strokeStyle = i === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(Rr, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v * 100, 0) + '%', L - 6, Y(v) + 4); });
  ctx.textAlign = 'center'; [0, 50, 100, 150, 200].forEach(v => ctx.fillText(String(v), X(v), bot + 15));
  ctx.restore();
  dash(ctx, L, Y(th), Rr, Y(th), C.orange);
  const line = (arr, n, color, w) => { if (n < 1) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i < n; i++) { if (i === 0) ctx.moveTo(X(1), Y(arr[0])); else ctx.lineTo(X(i + 1), Y(arr[i])); } ctx.stroke(); ctx.restore(); };
  s2.prev.forEach(p => line(p, p.length, C.raw, 1.3));
  line(s2.log.map(e => e.rate), s2.k, C.cyan, 2.2);
  if (!cur) { $('r2').textContent = t('s2empty', { th: fmt(th * 100, 1) }); return; }
  const stale = s2.log.slice(0, s2.k).filter(e => e.stale).length;
  $('r2').textContent = t('s2readout', { k: s2.k, n: S2N, v: cur.latest, ws: cur.ws.map(rname).join(sep()), rs: cur.rs.map(rname).join(sep()), got: cur.got, tag: t(cur.stale ? 'tagOld' : 'tagNew'), s: stale, pct: fmt(cur.rate * 100, 1), th: fmt(th * 100, 1) });
}
function play2() { s2.k = 0; draw2(); animate('s2', 8000, p => { s2.k = Math.round(p * S2N); draw2(); }); }

/* ---------- step 3: availability ---------- */
function bestW(N, p) {
  let best = -1, ws = [];
  for (let w = 1; w <= N; w++) { const a = M.availability(N, w, p), m = Math.min(a.write, a.read); if (m > best + 1e-12) { best = m; ws = [w]; } else if (Math.abs(m - best) <= 1e-12) ws.push(w); }
  return ws;
}
function draw3() {
  clampMax('n3', ['w3']);
  const N = num('n3'), Wq = num('w3'), p = num('p3') / 100, a = M.availability(N, Wq, p);
  $('n3v').textContent = String(N); $('w3v').textContent = String(Wq) + ' / R = ' + a.R; $('p3v').textContent = num('p3') + '%';
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3'), 8, 16, W - 16);
  const L = 62, Rr = W - 12, top = 34, bot = H - 30, lo = -8, hi = 0;
  const Y = u => bot - (Math.log10(Math.max(u, 1e-8)) - lo) / (hi - lo) * (bot - top), gw = (Rr - L) / N;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [[1, '100%'], [1e-2, '1%'], [1e-4, '0.01%'], [1e-6, '0.0001%'], [1e-8, '≤ 10⁻⁶%']].forEach(([u, s], i) => { ctx.strokeStyle = i === 4 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(L, Y(u)); ctx.lineTo(Rr, Y(u)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(s, L - 6, Y(u) + 4); });
  ctx.textAlign = 'center';
  for (let w = 1; w <= N; w++) ctx.fillText('W=' + w, L + (w - 0.5) * gw, bot + 16);
  ctx.restore();
  for (let w = 1; w <= N; w++) {
    const q = M.availability(N, w, p), x0 = L + (w - 1) * gw, bw = Math.min(22, gw * 0.32);
    [[1 - q.write, C.cyan, -1], [1 - q.read, C.orange, 1]].forEach(([u, col, side]) => { const x = x0 + gw / 2 + (side < 0 ? -bw - 1 : 1); ctx.fillStyle = col; ctx.globalAlpha = w === Wq ? 1 : 0.6; ctx.fillRect(x, Y(u), bw, bot - Y(u)); ctx.globalAlpha = 1; });
    if (w === Wq) { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + 2, top - 4, gw - 4, bot - top + 4); ctx.restore(); }
  }
  const hw = (1 - a.write) * 8760, hr = (1 - a.read) * 8760;
  $('r3').textContent = t('s3readout', { N, W: Wq, R: a.R, p: num('p3'), aw: fmtAvail(a.write), ar: fmtAvail(a.read), hw: fmt(hw, hw < 1 ? 3 : 1), hr: fmt(hr, hr < 1 ? 3 : 1) }) + ' ' + t('s3best', { best: bestW(N, p).join(' / ') });
}

/* ---------- step 4: partition ---------- */
const s4 = { mode: 'cp', s: 0 };
function draw4() {
  const k = num('k4'), res = M.partition(k, s4.mode), n = res.stages.length, st = res.stages[s4.s], healed = st.stage === 'heal';
  $('k4v').textContent = k + ' / ' + (5 - k);
  $('cp4').setAttribute('aria-pressed', String(s4.mode === 'cp')); $('ap4').setAttribute('aria-pressed', String(s4.mode === 'ap'));
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4', { s: s4.s + 1, n }), 8, 16, W - 16);
  const fracL = Math.min(0.7, Math.max(0.3, k / 5)), cut = Math.round(W * fracL), gap = W < 420 ? 6 : 12;
  const gl = row(k, 10, cut - 12, gap), gr = row(5 - k, cut + 12, W - 10, gap), boxes = gl.concat(gr);
  const by = 170, bh = 64, cyc = 58;
  if (!healed) { // jagged cut
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath();
    for (let y = 28, i = 0; y <= H - 8; y += 14, i++) { const x = cut + (i % 2 ? 5 : -5); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  const sides = [{ key: 'L', lab: 'sideL', x: cut / 2, idx: [...Array(k).keys()] }, { key: 'R', lab: 'sideR', x: cut + (W - cut) / 2, idx: [...Array(5 - k).keys()].map(i => i + k) }];
  const w = 3, writeIdx = { L: 1, R: 2 };
  sides.forEach(sd => {
    const ok = sd.key === 'L' ? res.wl : res.wr, lw = Math.min(96, (sd.key === 'L' ? cut : W - cut) - 20);
    rbox(ctx, sd.x - lw / 2, 34, lw, 28, C.box, C.muted);
    centerText(ctx, t(sd.lab) + ' · ' + t('client'), sd.x, 48, lw - 8, 12, 600, C.text);
    if (s4.s === writeIdx[sd.key]) sd.idx.forEach(i => { const b = boxes[i], tx = b.x + b.w / 2; if (ok) arrow(ctx, sd.x, 64, tx, by - 6, C.cyan, 2); else { dash(ctx, sd.x, 64, sd.x + (tx - sd.x) * 0.55, 64 + (by - 70) * 0.55, C.pink, 1.6); cross(ctx, sd.x + (tx - sd.x) * 0.55, 64 + (by - 70) * 0.55, C.pink, 5); } });
    if (st.stage === 'read') {
      const v = sd.key === 'L' ? st.readL : st.readR, txt = v === null ? t('refused') : '→ ' + v;
      centerText(ctx, txt, sd.x, 112, lw, 13, 700, v === null ? C.pink : C.green);
    }
  });
  st.reps.forEach((r, i) => {
    const b = boxes[i], mx = b.x + b.w / 2, changed = r.ts > 0;
    rbox(ctx, b.x, by, b.w, bh, changed ? '#123345' : C.box, changed ? C.cyan : C.axis, changed ? 2 : 1);
    centerText(ctx, rname(i), mx, by + 14, b.w - 6, 11, 600, C.muted);
    centerText(ctx, String(r.val), mx, by + 40, b.w - 6, 15, 700, C.text);
  });
  if (healed && st.lost.length) centerText(ctx, t('lostTag', { v: st.lost.join(sep()) }), sides[0].x, 112, cut - 16, 13, 700, C.pink);
  const q = s4.mode === 'cp' ? w : 1;
  const describe = x => {
    if (x.stage === 'split') return t('st_split', { l: res.sizeL, r: res.sizeR });
    if (x.stage === 'writeL') return t(x.ok ? 'st_writeL_ok' : 'st_writeL_no', { l: res.sizeL, w: q });
    if (x.stage === 'writeR') return t(x.ok ? 'st_writeR_ok' : 'st_writeR_no', { r: res.sizeR, w: q });
    if (x.stage === 'read') return t('st_read', { rl: x.readL === null ? t('refused') : x.readL, rr: x.readR === null ? t('refused') : x.readR }) + ' ' + t(res.consistentReads ? 'st_readSame' : 'st_readDiff');
    return t(s4.mode === 'cp' ? 'st_heal_cp' : 'st_heal_ap', { final: x.final });
  };
  const ol = $('r4'); ol.innerHTML = '';
  res.stages.slice(0, s4.s + 1).forEach(x => { const li = document.createElement('li'); li.textContent = describe(x); ol.appendChild(li); });
  $('next4').disabled = s4.s >= n - 1;
}

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

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  buildReach();
  $('write0').addEventListener('click', () => { const r = M.write0(s0.reps, s0.reach, s0.writes); s0.writes++; s0.reps = r.reps; s0.last = s0.reach.slice(); s0.read = -1; s0.n = 0; s0.s = 0; draw0(); });
  $('read0').addEventListener('click', () => {
    s0.read = Math.floor(s0.rnd() * 5); s0.n++;
    const top = Math.max(...s0.reps.map(r => r.v)); if (s0.reps[s0.read].v < top) s0.s++;
    draw0();
  });
  $('reset0').addEventListener('click', () => { s0.reps = M.cluster0(); s0.writes = 0; s0.last = null; s0.read = -1; s0.n = 0; s0.s = 0; s0.rnd = M.mulberry32(11); draw0(); });

  ['n1', 'w1', 'r1s'].forEach(id => $(id).addEventListener('input', draw1));

  const change2 = () => { stopAnim('s2'); clampMax('n2', ['w2', 'r2s']); s2.prev = []; s2.k = 0; sim2(); draw2(); };
  ['n2', 'w2', 'r2s'].forEach(id => $(id).addEventListener('input', change2));
  $('play2').addEventListener('click', play2);
  $('reroll2').addEventListener('click', () => { stopAnim('s2'); if (s2.k > 0) { s2.prev.push(s2.log.slice(0, s2.k).map(e => e.rate)); if (s2.prev.length > 5) s2.prev.shift(); } s2.seed++; sim2(); play2(); });
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.prev = []; s2.k = 0; draw2(); });

  ['n3', 'w3', 'p3'].forEach(id => $(id).addEventListener('input', draw3));

  $('k4').addEventListener('input', () => { stopAnim('s4'); s4.s = 0; draw4(); });
  $('cp4').addEventListener('click', () => { stopAnim('s4'); s4.mode = 'cp'; s4.s = 0; draw4(); });
  $('ap4').addEventListener('click', () => { stopAnim('s4'); s4.mode = 'ap'; s4.s = 0; draw4(); });
  $('next4').addEventListener('click', () => { stopAnim('s4'); s4.s = Math.min(s4.s + 1, M.STAGES.length - 1); draw4(); });
  $('play4').addEventListener('click', () => { s4.s = 0; draw4(); animate('s4', 6000, p => { s4.s = Math.min(M.STAGES.length - 1, Math.floor(p * M.STAGES.length)); draw4(); }); });
  $('reset4').addEventListener('click', () => { stopAnim('s4'); s4.s = 0; draw4(); });

  sim2();
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
  window.refreshReplLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
