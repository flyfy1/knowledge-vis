'use strict';
// Division & remainders lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, hop, verdict and weekday comes from window.DIV_MODEL (model.js). Canvas text is limited to
// one title row per canvas, axis numbers, person numbers and weekday names, each laid out in its own slot.
(function () {

const $ = id => document.getElementById(id);
const M = window.DIV_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', band: '#1a2838', grey: '#55657a', dash: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);

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

// One title row per panel: the font shrinks until the text fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 13;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

function cookie(ctx, x, y, r, color, { dashed = false, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (dashed) { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.dash; ctx.lineWidth = 1.4; ctx.stroke(); }
  else {
    ctx.fillStyle = color; ctx.fill();
    if (r >= 5) { ctx.fillStyle = 'rgba(10,14,20,.45)'; [[-0.35, -0.25], [0.3, -0.1], [-0.05, 0.38]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a * r, y + b * r, Math.max(1, r * 0.14), 0, Math.PI * 2); ctx.fill(); }); }
  }
  ctx.restore();
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
function finishAnim(name) { const a = anims[name]; if (!a) return; cancelAnimationFrame(a.id); delete anims[name]; a.frame(1); if (a.done) a.done(); }
function finishAll() { Object.keys(anims).forEach(finishAnim); }

/* ---------- step 0: deal in rounds ---------- */
const s0 = { dealt: 0, flying: 0 }; // flying ∈ [0,1): progress of the cookie in the air (0 = none)
function draw0() {
  const N = num('N0'), d = num('d0'), { q, r } = M.divmod(N, d);
  $('N0v').textContent = N; $('d0v').textContent = d;
  const st = M.dealState(N, d, s0.dealt), air = s0.flying > 0 && st.dealt < q * d;
  const pileCount = st.pile - (air ? 1 : 0);
  const { ctx, W, H } = fitCanvas($('c0'));
  // pile
  title(ctx, t('c0pile', { n: st.pile }), 8, 18, W - 16);
  const sp = Math.min(22, (W - 24) / 12), cols = Math.max(1, Math.floor((W - 24) / sp)), pr = sp * 0.36;
  const pileXY = j => [12 + sp * (j % cols) + sp / 2, 30 + sp / 2 + sp * Math.floor(j / cols)];
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(6.5, 26.5, W - 13, Math.ceil(30 / cols) * sp + 8); ctx.restore();
  for (let j = 0; j < pileCount; j++) { const [x, y] = pileXY(j); cookie(ctx, x, y, pr, C.orange); }
  // plates
  const top = 34 + Math.ceil(30 / cols) * sp + 32, bottom = H - 26, colW = (W - 16) / d;
  title(ctx, t('c0plates', { d }), 8, top - 10, W - 16);
  const rowH = Math.min(34, (bottom - top - 6) / Math.max(q, 1)), rc = Math.max(3, Math.min(12, colW * 0.3, rowH * 0.42));
  const started = Math.ceil((st.dealt + (air ? 1 : 0)) / d);
  for (let k = 0; k < started; k++) { ctx.fillStyle = k % 2 ? '#16222f' : C.band; ctx.fillRect(8, bottom - (k + 1) * rowH, W - 16, rowH); }
  ctx.save(); ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.muted;
  for (let p = 0; p < d; p++) {
    const cx = 8 + colW * (p + 0.5);
    ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - colW * 0.38, bottom + 3); ctx.lineTo(cx + colW * 0.38, bottom + 3); ctx.stroke();
    ctx.fillText(String(p + 1), cx, H - 7);
  }
  ctx.restore();
  const plateXY = (p, k) => [8 + colW * (p + 0.5), bottom - (k + 0.5) * rowH];
  for (let i = 0; i < st.dealt; i++) { const [x, y] = plateXY(i % d, Math.floor(i / d)); cookie(ctx, x, y, rc, C.cyan); }
  if (air) {
    const i = st.dealt, [x0, y0] = pileXY(pileCount), [x1, y1] = plateXY(i % d, Math.floor(i / d)), f = s0.flying, e = f * f * (3 - 2 * f);
    cookie(ctx, x0 + (x1 - x0) * e, y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * 30, pr + (rc - pr) * e, C.orange);
  }
  // readout
  let msg;
  if (q === 0) msg = t('r0none', { N, d });
  else if (air || st.dealt % d) msg = t('r0mid', { k1: Math.floor(st.dealt / d) + 1, got: st.dealt % d + (air ? 0 : 0), left: st.pile });
  else if (st.dealt === 0) msg = t('r0start', { N, d });
  else if (st.finished) msg = t('r0stop', { k: q, left: r, d });
  else msg = t('r0more', { k: st.roundsDone, left: st.pile, d });
  $('r0').textContent = msg;
  $('L0').textContent = st.finished && !air ? t('ledgerDiv', { N, d, q, r }) : '';
  const busy = !!anims.s0;
  $('round0').disabled = !busy && !st.canDealRound; $('all0').disabled = !busy && !st.canDealRound;
}
function deal0(count) {
  finishAnim('s0');
  const N = num('N0'), d = num('d0'), { q } = M.divmod(N, d), from = s0.dealt, n = Math.min(count, q * d - from);
  if (n <= 0) { draw0(); return; }
  animate('s0', n * (count === d ? 260 : 170), p => {
    const pos = from + p * n; s0.dealt = Math.min(from + n, Math.floor(pos)); s0.flying = p < 1 ? pos - Math.floor(pos) : 0; draw0();
  }, () => { s0.dealt = from + n; s0.flying = 0; draw0(); });
}
function reset0() { stopAnim('s0'); s0.dealt = 0; s0.flying = 0; draw0(); }

/* ---------- shared row/column picture (steps 1 and 3) ---------- */
// d rows (people) × q columns (rounds) in cyan, then a gap, then `after` orange cells in columns of d.
// gridMissing: last cells of the grid drawn as dashed (not enough). afterMissing: dashed cells after the orange.
// pinkLast: the last k drawn cookies are surplus. boxFirst: outline the first orange column when it is full.
function drawArray(ctx, W, H, top, o) {
  const { d, q, after, gridMissing = 0, afterMissing = 0, pinkLast = 0 } = o;
  const afterCols = Math.ceil((after + afterMissing) / d), gapCols = afterCols ? 0.8 : 0, totalCols = q + gapCols + afterCols;
  const s = Math.min(40, (W - 24) / Math.max(totalCols, 1), (H - top - 14) / d), rad = s * 0.38;
  const width = s * totalCols, x0 = Math.max(12, (W - width) / 2), y0 = top + 6;
  const cells = [];
  for (let i = 0; i < q * d; i++) cells.push({ col: Math.floor(i / d), row: i % d, kind: i >= q * d - gridMissing ? 'miss' : 'q' });
  for (let j = 0; j < after + afterMissing; j++) cells.push({ col: q + gapCols + Math.floor(j / d), row: j % d, kind: j < after ? 'r' : 'miss' });
  const drawn = cells.filter(c => c.kind !== 'miss');
  drawn.slice(drawn.length - pinkLast).forEach(c => { c.kind = 'pink'; });
  // faint row guides: one per person
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let rI = 0; rI < d; rI++) { const y = y0 + s * (rI + 0.5); ctx.beginPath(); ctx.moveTo(x0 - 4, y); ctx.lineTo(x0 + width + 4, y); ctx.stroke(); }
  ctx.restore();
  for (const c of cells) {
    const x = x0 + s * (c.col + 0.5), y = y0 + s * (c.row + 0.5);
    if (c.kind === 'miss') cookie(ctx, x, y, rad, null, { dashed: true });
    else cookie(ctx, x, y, rad, c.kind === 'q' ? C.cyan : c.kind === 'r' ? C.orange : C.pink);
  }
  if (o.boxFirst && after >= d) {
    ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
    ctx.strokeRect(x0 + s * (q + gapCols) + 1.5, y0 + 1.5, s - 3, s * d - 3); ctx.restore();
  }
}

/* ---------- step 1: when is sharing finished ---------- */
const s1 = { tried: new Map() };
function sync1Range() {
  const N = num('N1'), d = num('d1'), max = Math.floor(N / d) + 2, el = $('q1');
  el.max = String(max); if (num('q1') > max) el.value = String(max);
}
function draw1() {
  const N = num('N1'), d = num('d1'), q = num('q1'), res = M.tryShare(N, d, q);
  $('N1v').textContent = N; $('d1v').textContent = d; $('q1v').textContent = q;
  s1.tried.set(q, res);
  const { ctx, W, H } = fitCanvas($('c1'));
  const lack = Math.max(0, -res.left);
  title(ctx, res.status === 'short' ? t('c1titleShort', { d, q, used: res.used, lack }) : t('c1title', { d, q, used: res.used, left: res.left }), 8, 18, W - 16);
  drawArray(ctx, W, H, 28, { d, q, after: Math.max(0, res.left), gridMissing: lack, boxFirst: true });
  $('r1').textContent = res.status === 'short' ? t('r1short', { q, used: res.used, N, lack }) : t(res.status === 'more' ? 'r1more' : 'r1done', { q, used: res.used, left: res.left, d, N });
  $('hist1').innerHTML = [...s1.tried.keys()].sort((a, b) => a - b).map(k => {
    const v = s1.tried.get(k), cls = v.status === 'done' ? 'good' : v.status === 'more' ? 'warn' : 'bad';
    const key = v.status === 'done' ? 'chipDone' : v.status === 'more' ? 'chipMore' : 'chipShort';
    return `<span class="chip ${cls}">${t(key, { q: k, left: v.left, lack: -v.left })}</span>`;
  }).join('');
}

/* ---------- step 2: hops on the number line ---------- */
const s2 = { shown: Infinity };
function draw2() {
  const N = num('N2'), d = num('d2'), H2 = M.hops(N, d);
  $('N2v').textContent = N; $('d2v').textContent = d;
  const shown = Math.min(H2.q, s2.shown), done = shown >= H2.q;
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2title', { N, d }), 8, 18, W - 16);
  const L = 14, R = W - 14, Y = H - 52, xMax = 50, X = v => L + v / xMax * (R - L), unit = (R - L) / xMax;
  // axis and ticks
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, Y); ctx.lineTo(R, Y); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
  if (unit >= 4) for (let v = 0; v <= xMax; v++) { ctx.beginPath(); ctx.moveTo(X(v), Y - 3); ctx.lineTo(X(v), Y + 3); ctx.stroke(); }
  const lab = unit * 5 >= 22 ? 5 : 10;
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.strokeStyle = C.axis;
  for (let v = 0; v <= xMax; v += lab) { ctx.beginPath(); ctx.moveTo(X(v), Y - 6); ctx.lineTo(X(v), Y + 6); ctx.stroke(); ctx.fillText(String(v), X(v), Y + 20); }
  ctx.restore();
  const arcH = Math.max(14, Math.min(Y - 60, d * unit * 0.55));
  const arc = (a, b, frac, color, dash) => {
    const x0 = X(a), x1 = X(b), mx = (x0 + x1) / 2;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; if (dash) ctx.setLineDash([5, 4]);
    ctx.beginPath(); const steps = 24;
    for (let i = 0; i <= steps * frac; i++) { const s = i / steps, x = x0 + (x1 - x0) * s, y = Y - 4 - arcH * 4 * s * (1 - s); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    return mx;
  };
  // remainder segment and the dividend flag
  if (done && H2.r > 0) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(H2.last), Y); ctx.lineTo(X(N), Y); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.strokeStyle = C.orange; ctx.fillStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(N), Y); ctx.lineTo(X(N), Y - 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(N), Y - 34); ctx.lineTo(X(N) + 12, Y - 29); ctx.lineTo(X(N), Y - 24); ctx.closePath(); ctx.fill(); ctx.restore();
  // hops
  const whole = Math.floor(shown);
  for (let j = 0; j < whole; j++) arc(j * d, (j + 1) * d, 1, C.cyan);
  if (!done && shown > whole) arc(whole * d, (whole + 1) * d, shown - whole, C.cyan);
  if (done) {
    arc(H2.last, H2.next, 1, C.pink, true);
    const xn = X(H2.next); ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(xn - 5, Y - 9); ctx.lineTo(xn + 5, Y + 1); ctx.moveTo(xn + 5, Y - 9); ctx.lineTo(xn - 5, Y + 1); ctx.stroke(); ctx.restore();
  }
  for (let j = 0; j <= whole; j++) { ctx.beginPath(); ctx.arc(X(j * d), Y, 4.5, 0, Math.PI * 2); ctx.fillStyle = j === 0 ? C.green : C.cyan; ctx.fill(); }
  // readout
  if (!done) $('r2').textContent = t('r2prog', { j: whole, q: H2.q, pos: whole * d });
  else if (H2.q === 0) $('r2').textContent = t('r2zero', { d, N });
  else if (H2.r === 0) $('r2').textContent = t('r2exact', { last: H2.last, q: H2.q, N, d });
  else $('r2').textContent = t('r2', { last: H2.last, q: H2.q, N, r: H2.r, next: H2.next });
  $('L2').textContent = done ? t('ledgerDiv', { N, d, q: H2.q, r: H2.r }) + '　·　' + t('ledgerBack', { d, q: H2.q, r: H2.r, N }) : '';
}

/* ---------- step 3: checking an answer ---------- */
const s3 = { pick: -1, log: new Map() };
function cands3() { return M.candidates(num('N3'), num('d3')); }
function draw3() {
  const N = num('N3'), d = num('d3'), list = cands3();
  $('N3v').textContent = N; $('d3v').textContent = d;
  list.forEach((c, i) => { const b = $('cand' + i); b.textContent = t('candText', { N, d, q: c.q, r: c.r }); b.setAttribute('aria-pressed', i === s3.pick ? 'true' : 'false'); b.classList.toggle('toggle', true); });
  const { ctx, W, H } = fitCanvas($('c3'));
  if (s3.pick < 0) {
    title(ctx, t('c3none'), 8, 18, W - 16);
    // the dividend as an unsorted pile, so the canvas does not give the answer away
    const per = Math.max(6, Math.min(15, Math.floor((W - 24) / 22))), sp = Math.min(30, (W - 24) / per), x0 = (W - sp * per) / 2;
    for (let i = 0; i < N; i++) cookie(ctx, x0 + sp * (i % per + 0.5), 40 + sp * (Math.floor(i / per) + 0.5), sp * 0.36, C.grey);
    $('r3').textContent = t('r3none');
  } else {
    const c = list[s3.pick], v = M.check(N, d, c.q, c.r), diff = v.back - N;
    title(ctx, t('c3title', { N, back: v.back }), 8, 18, W - 16);
    drawArray(ctx, W, H, 28, { d, q: c.q, after: c.r, afterMissing: Math.max(0, -diff), pinkLast: Math.max(0, diff), boxFirst: true });
    const p1 = v.identity ? t('r3id1', { d, q: c.q, r: c.r, back: v.back, N }) : t(diff > 0 ? 'r3idMore' : 'r3idLess', { d, q: c.q, r: c.r, back: v.back, N, n: Math.abs(diff) });
    const p2 = t(v.small ? 'r3sm1' : 'r3sm0', { r: c.r, d });
    $('r3').textContent = `${p1} ${p2} ${t(v.ok ? 'r3yes' : 'r3no')}`;
  }
  $('hist3').innerHTML = [...s3.log.values()].map(c => {
    const v = M.check(N, d, c.q, c.r), key = v.ok ? 'chip3ok' : v.identity ? 'chip3big' : 'chip3off';
    return `<span class="chip ${v.ok ? 'good' : v.identity ? 'warn' : 'bad'}">${t(key, { q: c.q, r: c.r })}</span>`;
  }).join('');
}

/* ---------- step 4: weekdays ---------- */
const s4 = { walk: null }; // walk = day index while animating
function draw4() {
  const start = num('start4'), D = num('D4'), res = M.weekdayAfter(start, D);
  $('D4v').textContent = D;
  const i = s4.walk === null ? D : s4.walk, laps = Math.floor(i / 7), now = (start + i) % 7, walking = s4.walk !== null && s4.walk < D;
  // dial
  { const { ctx, W, H } = fitCanvas($('c4'));
    title(ctx, t('c4title', { laps }), 8, 18, W - 16);
    const cx = W / 2, cy = 34 + (H - 34) / 2, R = Math.min(W / 2 - 26, (H - 34) / 2 - 22), ang = k => -Math.PI / 2 + k * 2 * Math.PI / 7;
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    // the extra days, start → now, as an orange arc (only the part beyond whole laps)
    const extra = i % 7;
    if (extra > 0) { ctx.strokeStyle = walking ? C.cyan : C.orange; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, ang(start), ang(start + extra)); ctx.stroke(); }
    // laps as thin inner rings
    ctx.lineCap = 'butt'; ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(154,170,189,.35)';
    for (let l = 0; l < Math.min(laps, 12); l++) { ctx.beginPath(); ctx.arc(cx, cy, R - 22 - l * 3, 0, Math.PI * 2); ctx.stroke(); }
    // pointer
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (R - 20) * Math.cos(ang(now)), cy + (R - 20) * Math.sin(ang(now))); ctx.stroke();
    ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    // weekday nodes
    const nr = Math.max(13, Math.min(17, R * 0.2));
    ctx.font = `${nr > 15 ? 12 : 11}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let k = 0; k < 7; k++) {
      const x = cx + R * Math.cos(ang(k)), y = cy + R * Math.sin(ang(k)), isStart = k === start, isNow = k === now;
      ctx.beginPath(); ctx.arc(x, y, nr, 0, Math.PI * 2); ctx.fillStyle = isNow ? (walking ? C.cyan : C.orange) : '#182433'; ctx.fill();
      ctx.lineWidth = isStart ? 3 : 1; ctx.strokeStyle = isStart ? C.green : C.axis; ctx.stroke();
      ctx.fillStyle = isNow ? '#07131a' : C.text; ctx.fillText(t('wds' + k), x, y + 0.5);
    }
    ctx.restore(); }
  // weeks bar
  { const { ctx, W, H } = fitCanvas($('c4b'));
    const q = Math.floor(i / 7), r = i % 7;
    title(ctx, t('c4btitle', { q, r }), 8, 18, W - 16);
    const per = 8, tw = (W - 16) / per, rows = Math.ceil((q + (r ? 1 : 0)) / per) || 1, th = Math.min(30, (H - 40) / Math.max(rows, 4));
    const cell = (tw - 6) / 7;
    for (let k = 0; k < q + (r ? 1 : 0); k++) {
      const x = 8 + (k % per) * tw, y = 32 + Math.floor(k / per) * th, n = k < q ? 7 : r;
      for (let c = 0; c < n; c++) { ctx.fillStyle = k < q ? C.grey : (walking ? C.cyan : C.orange); ctx.fillRect(x + 3 + c * cell, y + 2, Math.max(1, cell - 1), th - 6); }
    } }
  $('r4').textContent = walking ? t('r4walk', { i, D, laps, now: t('wd' + now) })
    : res.r === 0 ? t('r4zero', { D, q: res.q, start: t('wd' + start) }) : t('r4', { D, q: res.q, r: res.r, start: t('wd' + start), end: t('wd' + res.day) });
  $('L4').textContent = walking ? '' : t('ledgerDiv', { N: D, d: 7, q: res.q, r: res.r });
}

/* ---------- step 5: round up or down ---------- */
const s5 = { scene: 'boat' };
function draw5() {
  const N = num('N5'), d = num('d5'), boat = s5.scene === 'boat';
  $('N5v').textContent = N; $('d5v').textContent = d;
  $('N5name').textContent = t(boat ? 'nPeople' : 'nMoney'); $('d5name').textContent = t(boat ? 'boatSeats' : 'bookPrice');
  $('boat5').setAttribute('aria-pressed', boat ? 'true' : 'false'); $('book5').setAttribute('aria-pressed', boat ? 'false' : 'true');
  $('lg5').innerHTML = boat
    ? `<span class="lg"><span class="sw sw-cyan" style="border-radius:3px"></span><span>${t('lgBoatFull')}</span></span><span class="lg"><span class="sw sw-box"></span><span>${t('lgBoatPart')}</span></span><span class="lg"><span class="sw sw-dash"></span><span>${t('lgSeat')}</span></span>`
    : `<span class="lg"><span class="sw sw-cyan" style="border-radius:3px"></span><span>${t('lgBook')}</span></span><span class="lg"><span class="sw sw-orange"></span><span>${t('lgChange')}</span></span>`;
  const B = M.boats(N, d), K = M.notebooks(N, d);
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, boat ? t('c5titleBoat', { need: B.need }) : t('c5titleBook', { q: K.buy, r: K.change }), 8, 18, W - 16);
  const groups = boat ? B.need : K.q + (K.r ? 1 : 0);
  let cs = 34, per, rows, gw;
  for (; cs >= 7; cs -= 1) { gw = d * cs + 16; per = Math.max(1, Math.floor((W - 12) / (gw + 8))); rows = Math.ceil(groups / per); if (rows * (cs + 26) <= H - 40) break; }
  const totalW = Math.min(groups, per) * (gw + 8) - 8, x0 = Math.max(6, (W - totalW) / 2);
  for (let g = 0; g < groups; g++) {
    const gx = x0 + (g % per) * (gw + 8), gy = 34 + Math.floor(g / per) * (cs + 26);
    const full = boat ? (g < B.q) : (g < K.q), filled = boat ? (full ? d : B.r) : (full ? d : K.r);
    ctx.save();
    if (boat) { // hull
      ctx.beginPath(); ctx.moveTo(gx, gy + 4); ctx.lineTo(gx + gw, gy + 4); ctx.lineTo(gx + gw - 8, gy + cs + 14); ctx.lineTo(gx + 8, gy + cs + 14); ctx.closePath();
      ctx.fillStyle = full ? '#1b3446' : '#2a2416'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = full ? C.cyan : C.orange; if (!full) ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    } else if (full) { ctx.fillStyle = '#1b3446'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.fillRect(gx, gy + 2, gw, cs + 12); ctx.strokeRect(gx, gy + 2, gw, cs + 12); }
    for (let k = 0; k < d; k++) {
      const x = gx + 8 + cs * (k + 0.5), y = gy + 8 + cs / 2;
      if (k < filled) {
        if (boat) { ctx.fillStyle = full ? C.cyan : C.orange; ctx.beginPath(); ctx.arc(x, y - cs * 0.12, cs * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - cs * 0.22, y + cs * 0.1, cs * 0.44, cs * 0.24); }
        else cookie(ctx, x, y, cs * 0.36, full ? C.cyan : C.orange);
      } else if (boat) cookie(ctx, x, y, cs * 0.3, null, { dashed: true });
    }
    ctx.restore();
  }
  const used = boat ? B.q * d : K.q * d;
  if (boat) $('r5').textContent = t(B.r ? 'r5boat' : 'r5boatExact', { N, d, q: B.q, r: B.r, used, need: B.need });
  else $('r5').textContent = t(K.r ? 'r5book' : 'r5bookExact', { N, d, q: K.q, r: K.r, used });
  $('L5').textContent = t('ledgerDiv', { N, d, q: B.q, r: B.r }) + '　→　' + (boat ? B.need : K.buy);
}

/* ---------- step 6: quiz ---------- */
const s6 = { state: [null, null, null] };
function quizParams() {
  const Q = M.QUIZ, A = M.quizAnswers();
  const o1 = Q.q1.options, ok1 = o1[A[0]], big = o1.find(o => o !== ok1 && M.check(Q.q1.N, Q.q1.d, o.q, o.r).identity), off = o1.find(o => o !== ok1 && o !== big);
  const p1 = { N: Q.q1.N, d: Q.q1.d, q: ok1.q, r: ok1.r, q2: big.q, r2: big.r, q3: off.q, r3: off.r, b3: Q.q1.d * off.q + off.r };
  const p2 = { d: Q.q2.d, q: Q.q2.q, r: Q.q2.r, N: Q.q2.d * Q.q2.q + Q.q2.r, w1: Q.q2.d * Q.q2.q, w2: Q.q2.d * (Q.q2.q + 1), q1: Q.q2.q + 1 };
  const w = M.weekdayAfter(Q.q3.start, Q.q3.D);
  const p3 = { D: Q.q3.D, q: w.q, r: w.r, start: t('wd' + Q.q3.start), end: t('wd' + w.day) };
  return { A, p: [p1, p2, p3] };
}
function buildQuiz() {
  const Q = M.QUIZ;
  [Q.q1.options, Q.q2.options, Q.q3.options].forEach((opts, qi) => {
    $('qz' + (qi + 1) + 'o').innerHTML = opts.map((_, oi) => `<label><input type="radio" name="qz${qi + 1}" value="${oi}" data-step="6"><span id="qz${qi + 1}o${oi}"></span></label>`).join('');
  });
}
function draw6() {
  const Q = M.QUIZ, { p } = quizParams();
  Q.q1.options.forEach((o, i) => { $('qz1o' + i).textContent = t('candText', { N: Q.q1.N, d: Q.q1.d, q: o.q, r: o.r }); });
  Q.q2.options.forEach((o, i) => { $('qz2o' + i).textContent = String(o); });
  Q.q3.options.forEach((o, i) => { $('qz3o' + i).textContent = t('wd' + o); });
  s6.state.forEach((st, i) => {
    const f = $('qz' + (i + 1) + 'f');
    f.textContent = st === null ? '' : st === 'pick' ? t('pick') : t('qz' + (i + 1) + (st === 'ok' ? 'ok' : 'no'), p[i]);
    f.style.color = st === 'ok' ? C.green : C.orange; f.dataset.state = st || '';
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  ['N0', 'd0'].forEach(id => $(id).addEventListener('input', reset0));
  $('round0').addEventListener('click', () => deal0(num('d0')));
  $('all0').addEventListener('click', () => { finishAnim('s0'); const { q } = M.divmod(num('N0'), num('d0')); deal0(q * num('d0') - s0.dealt); });
  $('reset0').addEventListener('click', reset0);

  ['N1', 'd1'].forEach(id => $(id).addEventListener('input', () => { s1.tried.clear(); sync1Range(); draw1(); }));
  $('q1').addEventListener('input', draw1);
  sync1Range();

  ['N2', 'd2'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s2'); s2.shown = Infinity; draw2(); }));
  $('hop2').addEventListener('click', () => {
    const { q } = M.hops(num('N2'), num('d2'));
    s2.shown = 0;
    animate('s2', Math.max(1, q) * 520, p => { s2.shown = p >= 1 ? Infinity : p * q; draw2(); });
  });

  ['N3', 'd3'].forEach(id => $(id).addEventListener('input', () => { s3.pick = -1; s3.log.clear(); draw3(); }));
  [0, 1, 2].forEach(i => $('cand' + i).addEventListener('click', () => { s3.pick = i; const c = cands3()[i]; s3.log.set(c.q + ':' + c.r, c); draw3(); }));

  $('start4').addEventListener('change', () => { stopAnim('s4'); s4.walk = null; draw4(); });
  $('D4').addEventListener('input', () => { stopAnim('s4'); s4.walk = null; draw4(); });
  $('walk4').addEventListener('click', () => {
    const D = num('D4');
    s4.walk = 0;
    animate('s4', Math.min(6000, 600 + D * 45), p => { s4.walk = p >= 1 ? null : Math.floor(p * D); draw4(); }, () => { s4.walk = null; draw4(); });
  });

  $('boat5').addEventListener('click', () => { s5.scene = 'boat'; draw5(); });
  $('book5').addEventListener('click', () => { s5.scene = 'book'; draw5(); });
  ['N5', 'd5'].forEach(id => $(id).addEventListener('input', draw5));

  buildQuiz();
  [1, 2, 3].forEach(n => {
    $('qz' + n + 'c').addEventListener('click', () => {
      const ch = document.querySelector(`input[name="qz${n}"]:checked`), A = M.quizAnswers();
      s6.state[n - 1] = !ch ? 'pick' : Number(ch.value) === A[n - 1] ? 'ok' : 'no';
      draw6();
    });
    document.querySelectorAll(`input[name="qz${n}"]`).forEach(inp => inp.addEventListener('change', () => { s6.state[n - 1] = null; draw6(); }));
  });

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
