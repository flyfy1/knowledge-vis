'use strict';
// Network transfer lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.NET_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks, the two endpoint names and message labels on their own rows (step 2).
(function () {

const $ = id => document.getElementById(id);
const M = window.NET_MODEL;
const t = (...a) => window.NET_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', idle: '#1d2836' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fmtTime = ms => ms < 10 ? fmt(ms, 2) + ' ms' : ms < 100 ? fmt(ms, 1) + ' ms' : ms < 1000 ? fmt(ms, 0) + ' ms' : ms < 600000 ? fmt(ms / 1000, ms < 10000 ? 2 : 1) + ' s' : fmt(ms / 60000, 1) + ' min';
const fmtSize = kb => kb >= 1024 ? fmt(kb / 1024, 0) + ' MB' : kb + ' KB';
const fmtBw = mbps => (mbps < 10 ? fmt(mbps, 2) : fmt(mbps, 0)) + ' Mbit/s';

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
// Fit a label into maxW by shrinking the font; returns the font used.
function fitFont(ctx, text, maxW, size = 12, weight = 600) {
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  return ctx.font;
}
function title(ctx, text, X, Y, maxW) {
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; fitFont(ctx, text, maxW); ctx.fillText(text, X, Y); ctx.restore();
}
// Axes with grid lines. o: {L,R,T,B, xt:[[v,label]], yt:[[v,label]], X, Y}
function axes(ctx, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  o.yt.forEach(([v, s], i) => { ctx.strokeStyle = i === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(o.L, o.Y(v)); ctx.lineTo(o.R, o.Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(s, o.L - 6, o.Y(v) + 4); });
  ctx.textAlign = 'center';
  o.xt.forEach(([v, s], i) => {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(o.X(v), o.B); ctx.lineTo(o.X(v), o.B + 4); ctx.stroke();
    const w = ctx.measureText(s).width; let x = o.X(v); x = Math.min(Math.max(x, w / 2 + 1), o.W - w / 2 - 1);
    ctx.fillText(s, x, o.B + 15);
  });
  ctx.restore();
}
const dashLine = (ctx, x0, y0, x1, y1, color, w = 1.4) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
const dot = (ctx, x, y, r, color, ring) => { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); };

/* ---------- step 0: packets ---------- */
function draw0() {
  const kb = M.SIZES_KB[num('sz0')], mtu = M.MTUS[num('mtu0')], p = M.packetize(kb, mtu);
  $('sz0v').textContent = fmtSize(kb); $('mtu0v').textContent = mtu + ' B';
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0top'), 8, 16, W - 16);
  // a fixed scale: each row stands for 12 000 bytes, so longer packets really look longer
  const L = 8, R = W - 8, rowB = 12000, k = (R - L) / rowB, rows = 3, rh = 20, gap = 3;
  let x = L, row = 0, shown = 0;
  for (let i = 0; i < p.n; i++) {
    const data = i === p.n - 1 ? p.last : p.payload, len = data + M.HEADER, w = len * k;
    if (x + w > R + 0.5) { row++; x = L; }
    if (row >= rows) break;
    const y = 28 + row * (rh + 6), hw = Math.max(2, M.HEADER * k);
    ctx.fillStyle = C.orange; ctx.fillRect(x, y, hw, rh);
    ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.85; ctx.fillRect(x + hw, y, Math.max(1, w - hw - (w > 6 ? 1 : 0)), rh); ctx.globalAlpha = 1;
    x += w + (w > 8 ? gap : 1); shown++;
  }
  if (shown < p.n) { ctx.save(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.font = '12px system-ui,sans-serif'; ctx.fillText(t('s0more', { n: p.n }), R, 28 + rows * (rh + 6) + 12); ctx.restore(); }
  // header share against MTU for this file
  const top = 162, bot = H - 26, Lx = 44, Rx = W - 14, lo = Math.log10(500), hi = Math.log10(10000);
  title(ctx, t('c0bot'), 8, top - 14, W - 16);
  const share = m => M.packetize(kb, m).overhead * 100;
  let yMax = 0; for (let m = 576; m <= 9000; m += 8) yMax = Math.max(yMax, share(m));
  yMax = Math.max(2, Math.ceil(yMax / 2) * 2);
  const X = m => Lx + (Math.log10(m) - lo) / (hi - lo) * (Rx - Lx), Y = v => bot - v / yMax * (bot - top);
  axes(ctx, { L: Lx, R: Rx, T: top, B: bot, W, X, Y, yt: [0, yMax / 2, yMax].map(v => [v, fmt(v, 1) + '%']), xt: M.MTUS.map(m => [m, String(m)]) });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let m = 576; m <= 9000; m += 4) { if (m === 576) ctx.moveTo(X(m), Y(share(m))); else ctx.lineTo(X(m), Y(share(m))); }
  ctx.stroke(); ctx.restore();
  M.MTUS.forEach(m => dot(ctx, X(m), Y(share(m)), m === mtu ? 6 : 3, m === mtu ? C.orange : C.muted, m === mtu ? C.text : null));
  $('r0').textContent = t('s0readout', { kb, bytes: p.bytes, mtu, payload: p.payload, n: p.n, last: p.last, header: p.header, pct: fmt(p.overhead * 100, 2) });
}

/* ---------- step 1: latency vs bandwidth ---------- */
const s1 = { file: 'page', tried: new Set() };
function draw1() {
  const f = M.FILES.find(q => q.id === s1.file), rtt = num('rtt1'), bi = num('bw1'), bw = M.bwOf(bi), r = M.fetchTime(f.kb, rtt, bw);
  s1.tried.add(bi);
  $('rtt1v').textContent = rtt + ' ms'; $('bw1v').textContent = fmtBw(bw);
  ['page', 'photo', 'video'].forEach(id => $('f1' + id).setAttribute('aria-pressed', String(s1.file === id)));
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1top'), 8, 16, W - 16);
  const L = 12, R = W - 12, by = 28, bh = 26, k = (R - L) / r.total;
  ctx.fillStyle = C.orange; ctx.fillRect(L, by, r.rtt * k, bh);
  ctx.fillStyle = C.cyan; ctx.fillRect(L + r.rtt * k, by, Math.max(1, r.tx * k), bh);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.textAlign = 'left'; ctx.fillText('0', L, by + bh + 14); ctx.textAlign = 'right'; ctx.fillText(fmtTime(r.total), R, by + bh + 14); ctx.restore();
  // T against bandwidth, both log scales
  const top = 118, bot = H - 26, Lx = 58, Rx = W - 14;
  title(ctx, t('c1bot'), 8, top - 14, W - 16);
  const T = i => M.fetchTime(f.kb, rtt, M.bwOf(i)).total;
  const ylo = Math.floor(Math.log10(rtt * 0.8)), yhi = Math.ceil(Math.log10(T(0) * 1.05));
  const X = i => Lx + i / 30 * (Rx - Lx), Y = v => bot - (Math.log10(v) - ylo) / (yhi - ylo) * (bot - top);
  const yt = []; const stepD = yhi - ylo > 4 ? 2 : 1; for (let d = ylo; d <= yhi; d += stepD) yt.push([Math.pow(10, d), fmtTime(Math.pow(10, d))]);
  axes(ctx, { L: Lx, R: Rx, T: top, B: bot, W, X, Y, yt, xt: [[0, '1'], [10, '10'], [20, '100'], [30, '1000 Mbit/s']] });
  dashLine(ctx, Lx, Y(rtt), Rx, Y(rtt), C.orange);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let i = 0; i <= 30; i += 0.25) { const v = M.fetchTime(f.kb, rtt, Math.pow(10, i / 10)).total; if (i === 0) ctx.moveTo(X(i), Y(v)); else ctx.lineTo(X(i), Y(v)); }
  ctx.stroke(); ctx.restore();
  s1.tried.forEach(i => { if (i !== bi) dot(ctx, X(i), Y(T(i)), 3, C.muted); });
  dot(ctx, X(bi), Y(r.total), 6, C.cyan, C.text);
  $('r1').textContent = t('s1readout', { rtt: fmtTime(r.rtt), tx: fmtTime(r.tx), total: fmtTime(r.total), pct: fmt(r.rtt / r.total * 100, 1), save: fmtTime(r.saveIfDoubled), halfRtt: fmtTime(rtt / 2) });
}

/* ---------- step 2: handshake and ACKs ---------- */
const s2 = { lose: false, k: 0 };
function msgLabel(m) {
  if (m.kind === 'data') return t(m.retx ? 'm_retx' : 'm_data', { k: m.k, seq: m.seq }) + (m.lost ? ' ' + t('m_lost') : '');
  return t('m_' + m.kind, { seq: m.seq, ack: m.ack });
}
function msgDesc(m) {
  const end = m.seq + (m.len || 0) - 1;
  if (m.kind === 'syn') return t('d_syn', { seq: m.seq });
  if (m.kind === 'synack') return t('d_synack', { seq: m.seq, ack: m.ack });
  if (m.kind === 'ackdata') return t('d_ackdata', { ack: m.ack, seq: m.seq, end });
  if (m.kind === 'ack') return t('d_ack', { ack: m.ack, prev: m.ack });
  if (m.lost) return t('d_lost', { k: m.k });
  return t(m.retx ? 'd_retx' : 'd_data', { k: m.k, seq: m.seq, end });
}
function draw2() {
  const cv = M.conversation(s2.lose), N = cv.msgs.length; s2.k = Math.min(s2.k, N);
  $('lose2').setAttribute('aria-pressed', String(s2.lose));
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2'), 8, 16, W - 16);
  const xc = W < 420 ? 62 : 90, xs = W - (W < 420 ? 24 : 60), y0 = 58, U = (H - y0 - 16) / 12, Y = u => y0 + u * U;
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = C.text; ctx.textAlign = 'center';
  ctx.fillText(t('client'), xc, 42); ctx.textAlign = W < 420 ? 'right' : 'center'; ctx.fillText(t('server'), W < 420 ? W - 8 : xs, 42);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2; [xc, xs].forEach(x => { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, H - 12); ctx.stroke(); });
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.lineWidth = 1;
  for (let r = 0; r <= 6; r++) { ctx.fillText(r === 0 ? '0' : r + ' RTT', 6, Y(2 * r) + 4); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(xc - 6, Y(2 * r)); ctx.lineTo(xc, Y(2 * r)); ctx.stroke(); }
  ctx.restore();
  const lost = cv.msgs.findIndex(m => m.lost);
  if (lost >= 0 && s2.k > lost) { // retransmission timer on the client side
    const m = cv.msgs[lost], end = m.t0 + M.RTO;
    dashLine(ctx, xc + 8, Y(m.t0), xc + 8, Y(end), C.orange, 2);
    ctx.save(); ctx.fillStyle = C.orange; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('RTO', xc + 14, Y(m.t0 + M.RTO / 2) + 4); ctx.restore();
  }
  for (let i = 0; i < s2.k; i++) {
    const m = cv.msgs[i], fx = m.from === 'C' ? xc : xs, tx = m.from === 'C' ? xs : xc, fr = (m.t1 - m.t0);
    const ex = fx + (tx - fx) * fr, ey = Y(m.t1), col = m.lost ? C.pink : C.cyan;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = i === s2.k - 1 ? 2.6 : 1.8;
    ctx.beginPath(); ctx.moveTo(fx, Y(m.t0)); ctx.lineTo(ex, ey); ctx.stroke();
    if (m.lost) { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex - 6, ey - 6); ctx.lineTo(ex + 6, ey + 6); ctx.moveTo(ex + 6, ey - 6); ctx.lineTo(ex - 6, ey + 6); ctx.stroke(); }
    else { const a = Math.atan2(ey - Y(m.t0), ex - fx); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 9 * Math.cos(a - 0.4), ey - 9 * Math.sin(a - 0.4)); ctx.lineTo(ex - 9 * Math.cos(a + 0.4), ey - 9 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
    // label on its own row: centred on the arrow's midpoint, boxed so the line never runs through the text
    const label = msgLabel(m), mx = (fx + ex) / 2, my = (Y(m.t0) + ey) / 2;
    fitFont(ctx, label, Math.abs(xs - xc) - 24, 11, i === s2.k - 1 ? 700 : 500);
    const w = ctx.measureText(label).width, lx = Math.min(Math.max(mx, xc + 12 + w / 2), xs - 12 - w / 2);
    ctx.fillStyle = C.bg; ctx.globalAlpha = 0.92; ctx.fillRect(lx - w / 2 - 4, my - 9, w + 8, 16); ctx.globalAlpha = 1;
    ctx.fillStyle = m.lost ? C.pink : i === s2.k - 1 ? C.text : '#b9c7d6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, lx, my + 0.5);
    ctx.restore();
  }
  const st = cv.states[s2.k];
  let text = t('s2progress', { k: s2.k, N });
  if (s2.k > 0) text += msgDesc(cv.msgs[s2.k - 1]) + ' ';
  text += t('s2state', { c: t('st_' + st.c), s: t('st_' + st.s) });
  $('r2').textContent = text;
  $('r2b').textContent = s2.k === N ? (s2.lose ? t('s2doneLoss', { end: cv.end / 2, extra: (cv.end - M.conversation(false).end) / 2 }) : t('s2done', { end: cv.end / 2, first: cv.firstData / 2 })) : '';
  $('next2').disabled = s2.k >= N;
}

/* ---------- step 3: window ---------- */
function draw3() {
  const W = num('w3'), rtt = num('rtt3'), c = num('c3s'), wr = M.windowRate(W, c, rtt), sc = M.schedule(W, c, rtt, 3 * rtt);
  $('w3v').textContent = String(W); $('rtt3v').textContent = rtt + ' ms'; $('c3v').textContent = c + ' Mbit/s';
  const { ctx, W: CW, H } = fitCanvas($('c3'));
  title(ctx, t('c3top'), 8, 16, CW - 16);
  const L = 12, R = CW - 12, ly = 30, lh = 34, X = ms => L + ms / (3 * rtt) * (R - L);
  ctx.fillStyle = C.idle; ctx.fillRect(L, ly, R - L, lh);
  ctx.fillStyle = C.cyan;
  // merge back-to-back packets into runs so dense windows stay crisp
  let run = null; const runs = [];
  sc.starts.forEach(s => { const e = Math.min(s + sc.tau, 3 * rtt); if (run && s - run[1] < 1e-9) run[1] = e; else { run = [s, e]; runs.push(run); } });
  runs.forEach(([s, e]) => ctx.fillRect(X(s), ly, Math.max(1, X(e) - X(s)), lh));
  // packet boundaries when they are wide enough to see
  if (sc.tau / (3 * rtt) * (R - L) > 5) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1; sc.starts.forEach(s => { ctx.beginPath(); ctx.moveTo(X(s), ly); ctx.lineTo(X(s), ly + lh); ctx.stroke(); }); }
  for (let r = 1; r < 3; r++) dashLine(ctx, X(r * rtt), ly - 4, X(r * rtt), ly + lh + 4, C.muted, 1);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [[0, '0', 'left'], [rtt, '1 RTT', 'center'], [2 * rtt, '2 RTT', 'center'], [3 * rtt, '3 RTT', 'right']].forEach(([v, s, al]) => { ctx.textAlign = al; ctx.fillText(s, X(v), ly + lh + 16); });
  ctx.restore();
  // throughput against window
  const top = 128, bot = H - 26, Lx = 40, Rx = CW - 14, yMax = Math.ceil(c * 1.2 / 5) * 5 || 5;
  title(ctx, t('c3bot'), 8, top - 14, CW - 16);
  const Xw = w => Lx + (w - 1) / 99 * (Rx - Lx), Y = v => bot - v / yMax * (bot - top);
  axes(ctx, { L: Lx, R: Rx, T: top, B: bot, W: CW, X: Xw, Y, yt: [0, yMax / 2, yMax].map(v => [v, fmt(v, 1)]), xt: [1, 20, 40, 60, 80, 100].map(v => [v, String(v)]) });
  if (wr.bdp <= 100) dashLine(ctx, Xw(Math.max(1, wr.bdp)), top, Xw(Math.max(1, wr.bdp)), bot, C.orange);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let w = 1; w <= 100; w += 0.5) { const v = M.windowRate(w, c, rtt).rate; if (w === 1) ctx.moveTo(Xw(w), Y(v)); else ctx.lineTo(Xw(w), Y(v)); }
  ctx.stroke(); ctx.restore();
  dot(ctx, Xw(W), Y(wr.rate), 6, C.cyan, C.text);
  let text = t('s3readout', { tau: fmtTime(sc.tau), bdp: fmt(wr.bdp, 1), W, rate: fmt(wr.rate, 2), pct: fmt(wr.util * 100, 1) });
  if (W >= wr.bdp) text += ' ' + t('s3full');
  $('r3').textContent = text;
}

/* ---------- step 4: queueing at the bottleneck ---------- */
const S4 = { bdp: 50, c: 10, rtt0: 60 };
function draw4() {
  const W = num('w4'), B = num('b4'), r = M.bottleneck(W, S4.bdp, B, S4.c, S4.rtt0);
  $('w4v').textContent = String(W); $('b4v').textContent = String(B);
  const { ctx, W: CW, H } = fitCanvas($('c4'));
  title(ctx, t('c4top'), 8, 16, CW - 16);
  const L = 12, R = CW - 12, maxDrop = Math.max(0, 200 - S4.bdp - B), k = (R - L - 16) / (S4.bdp + B + maxDrop), by = 28, bh = 22;
  const seg = (x0, cap, fill, color) => { ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + 0.5, by + 0.5, Math.max(1, cap * k) - 1, bh - 1); ctx.fillStyle = color; ctx.globalAlpha = 0.85; ctx.fillRect(x0 + 2, by + 2, Math.max(0, fill * k - 4), bh - 4); ctx.globalAlpha = 1; return x0 + cap * k + 8; };
  let x = seg(L, S4.bdp, r.inPipe, C.cyan);
  if (B > 0) x = seg(x, B, r.queue, C.orange);
  if (r.dropped > 0) { ctx.fillStyle = C.pink; ctx.fillRect(x, by + 2, r.dropped * k, bh - 4); }
  // three charts against W
  const panels = [
    { key: 'c4a', f: w => M.bottleneck(w, S4.bdp, B, S4.c, S4.rtt0).rate, max: 12, ticks: [0, 5, 10], col: C.cyan },
    { key: 'c4b', f: w => M.bottleneck(w, S4.bdp, B, S4.c, S4.rtt0).rtt, max: 200, ticks: [0, 60, 120, 180], col: C.orange },
    { key: 'c4c', f: w => M.bottleneck(w, S4.bdp, B, S4.c, S4.rtt0).loss * 100, max: 80, ticks: [0, 40, 80], col: C.pink }
  ];
  const Lx = 40, Rx = CW - 14, X = w => Lx + (w - 1) / 199 * (Rx - Lx);
  const ph = (H - 96) / 3;
  panels.forEach((p, i) => {
    const top = 96 + i * ph + 14, bot = top + ph - 40, Y = v => bot - v / p.max * (bot - top);
    title(ctx, t(p.key), 8, top - 10, CW - 16);
    axes(ctx, { L: Lx, R: Rx, T: top, B: bot, W: CW, X, Y, yt: p.ticks.map(v => [v, String(v)]), xt: i === 2 ? [1, 50, 100, 150, 200].map(v => [v, String(v)]) : [] });
    ctx.save(); ctx.strokeStyle = p.col; ctx.lineWidth = 2; ctx.beginPath();
    for (let w = 1; w <= 200; w++) { if (w === 1) ctx.moveTo(X(w), Y(p.f(w))); else ctx.lineTo(X(w), Y(p.f(w))); }
    ctx.stroke(); ctx.restore();
    dashLine(ctx, X(W), top, X(W), bot, C.muted, 1);
    dot(ctx, X(W), Y(p.f(W)), 5, C.text);
  });
  $('r4').textContent = t('s4readout', { W, pipe: r.inPipe, queue: r.queue, drop: r.dropped, rate: fmt(r.rate, 2), rtt: fmt(r.rtt, 1), loss: fmt(r.loss * 100, 1) });
}

/* ---------- step 5: AIMD sawtooth ---------- */
const S5 = { bdp: 50, N: 160, from: 60 };
const s5 = { k: S5.N };
function draw5() {
  const B = num('b5'), tr = M.aimd(S5.bdp, B, S5.N), cap = S5.bdp + B;
  $('b5v').textContent = String(B);
  const { ctx, W, H } = fitCanvas($('c5'));
  const Lx = 40, Rx = W - 14, X = r => Lx + r / S5.N * (Rx - Lx);
  const top = 30, bot = 280, yMax = Math.max(80, Math.ceil((cap + 8) / 20) * 20), Y = v => bot - v / yMax * (bot - top);
  title(ctx, t('c5top'), 8, 16, W - 16);
  const yt = []; for (let v = 0; v <= yMax; v += yMax > 120 ? 40 : 20) yt.push([v, String(v)]);
  axes(ctx, { L: Lx, R: Rx, T: top, B: bot, W, X, Y, yt, xt: [0, 40, 80, 120, 160].map(v => [v, String(v)]) });
  dashLine(ctx, Lx, Y(S5.bdp), Rx, Y(S5.bdp), C.cyan); if (B > 0) dashLine(ctx, Lx, Y(cap), Rx, Y(cap), C.orange);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath();
  for (let r = 0; r < s5.k && r < tr.length; r++) { if (r === 0) ctx.moveTo(X(r), Y(tr[r].cwnd)); else { ctx.lineTo(X(r), Y(tr[r - 1].cwnd)); ctx.lineTo(X(r), Y(tr[r].cwnd)); } }
  ctx.stroke(); ctx.restore();
  for (let r = 0; r < s5.k && r < tr.length; r++) if (tr[r].loss) dot(ctx, X(r), Y(tr[r].cwnd), 4, C.pink);
  // queue
  const t2 = 326, b2 = H - 26, qMax = Math.max(10, Math.ceil(B / 10) * 10), Yq = v => b2 - v / qMax * (b2 - t2);
  title(ctx, t('c5bot'), 8, t2 - 10, W - 16);
  axes(ctx, { L: Lx, R: Rx, T: t2, B: b2, W, X, Y: Yq, yt: [0, qMax / 2, qMax].map(v => [v, fmt(v, 0)]), xt: [0, 40, 80, 120, 160].map(v => [v, String(v)]) });
  ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.8;
  const bw = (Rx - Lx) / S5.N;
  for (let r = 0; r < s5.k && r < tr.length; r++) { const q = Math.min(Math.max(tr[r].cwnd - S5.bdp, 0), B); if (q > 0) ctx.fillRect(X(r), Yq(q), Math.max(1, bw), Yq(0) - Yq(q)); }
  ctx.restore();
  const k = Math.min(s5.k, S5.N), cur = tr[Math.max(0, k - 1)], losses = tr.slice(0, k).filter(s => s.loss).length;
  $('r5').textContent = t('s5progress', { k, N: S5.N, phase: t(cur.phase === 'slow' ? 'ph_slow' : 'ph_avoid'), cwnd: cur.cwnd, losses });
  if (k >= S5.N) { const st = M.aimdStats(tr, S5.from, S5.N); $('r5b').textContent = t('s5stats', { from: S5.from, to: S5.N, util: fmt(st.util * 100, 1), rtt: fmt(st.rtt, 2), losses: st.losses }); }
  else $('r5b').textContent = '';
}

/* ---------- step 6: two flows ---------- */
const S6 = { K: 100, x1: 60, x2: 4, N: 200 };
const s6 = { mode: 'aimd', k: S6.N };
function draw6() {
  const tr = M.twoFlows(S6.K, S6.x1, S6.x2, s6.mode, S6.N), k = Math.min(s6.k, S6.N);
  $('aimd6').setAttribute('aria-pressed', String(s6.mode === 'aimd')); $('aiad6').setAttribute('aria-pressed', String(s6.mode === 'aiad'));
  const { ctx, W, H } = fitCanvas($('c6'));
  title(ctx, t('c6top'), 8, 16, W - 16);
  const S = Math.min(W - 70, 280), L = Math.round((W - S) / 2 + 12), top = 32, bot = top + S;
  const X = v => L + v / 110 * S, Y = v => bot - v / 110 * S;
  axes(ctx, { L, R: L + S, T: top, B: bot, W, X, Y, yt: [0, 50, 100].map(v => [v, String(v)]), xt: [0, 50, 100].map(v => [v, String(v)]) });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(L, top); ctx.lineTo(L, bot); ctx.stroke(); ctx.restore();
  dashLine(ctx, X(0), Y(0), X(110), Y(110), C.green); dashLine(ctx, X(0), Y(100), X(100), Y(0), C.orange);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let r = 0; r < k; r++) { const s = tr[r]; if (r === 0) ctx.moveTo(X(s.x1), Y(s.x2)); else ctx.lineTo(X(s.x1), Y(s.x2)); }
  ctx.stroke(); ctx.restore();
  dot(ctx, X(S6.x1), Y(S6.x2), 4, C.muted);
  if (k > 0) { const s = tr[k - 1]; dot(ctx, X(s.x1), Y(s.x2), 6, C.text, C.bg); }
  // windows against rounds
  const t2 = bot + 50, b2 = H - 26, Lx = 40, Rx = W - 14, Xr = r => Lx + r / S6.N * (Rx - Lx), Yr = v => b2 - v / 110 * (b2 - t2);
  title(ctx, t('c6bot'), 8, t2 - 10, W - 16);
  axes(ctx, { L: Lx, R: Rx, T: t2, B: b2, W, X: Xr, Y: Yr, yt: [0, 50, 100].map(v => [v, String(v)]), xt: [0, 50, 100, 150, 200].map(v => [v, String(v)]) });
  [['x1', C.cyan], ['x2', C.pink]].forEach(([key, col]) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let r = 0; r < k; r++) { if (r === 0) ctx.moveTo(Xr(r), Yr(tr[r][key])); else ctx.lineTo(Xr(r), Yr(tr[r][key])); } ctx.stroke(); ctx.restore(); });
  const s = tr[Math.max(0, k - 1)], lossesIdx = tr.slice(0, k).map((q, i) => (q.loss ? i : -1)).filter(i => i >= 0);
  $('r6').textContent = t('s6readout', { k, N: S6.N, x1: fmt(s.x1, 1), x2: fmt(s.x2, 1), gap: fmt(Math.abs(s.x1 - s.x2), 1), losses: lossesIdx.length });
  const gaps = [fmt(S6.x1 - S6.x2, 1)].concat(lossesIdx.filter(i => i + 1 < tr.length).slice(0, 8).map(i => fmt(Math.abs(tr[i + 1].x1 - tr[i + 1].x2), 1)));
  $('r6b').textContent = t('s6gaps', { list: gaps.join(' → ') + (lossesIdx.length > 8 ? ' → …' : '') });
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

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  ['sz0', 'mtu0'].forEach(id => $(id).addEventListener('input', draw0));
  ['page', 'photo', 'video'].forEach(id => $('f1' + id).addEventListener('click', () => { s1.file = id; s1.tried.clear(); draw1(); }));
  $('rtt1').addEventListener('input', () => { s1.tried.clear(); draw1(); });
  $('bw1').addEventListener('input', draw1);

  $('next2').addEventListener('click', () => { stopAnim('s2'); s2.k++; draw2(); });
  $('play2').addEventListener('click', () => { const N = M.conversation(s2.lose).msgs.length; s2.k = 0; draw2(); animate('s2', N * 700, p => { s2.k = Math.round(p * N); draw2(); }); });
  $('lose2').addEventListener('click', () => { stopAnim('s2'); s2.lose = !s2.lose; s2.k = 0; draw2(); });
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.k = 0; draw2(); });

  ['w3', 'rtt3', 'c3s'].forEach(id => $(id).addEventListener('input', draw3));
  ['w4', 'b4'].forEach(id => $(id).addEventListener('input', draw4));

  $('b5').addEventListener('input', () => { stopAnim('s5'); s5.k = S5.N; draw5(); });
  $('play5').addEventListener('click', () => { s5.k = 0; draw5(); animate('s5', 8000, p => { s5.k = Math.round(p * S5.N); draw5(); }); });
  $('reset5').addEventListener('click', () => { stopAnim('s5'); s5.k = 0; draw5(); });

  $('aimd6').addEventListener('click', () => { stopAnim('s6'); s6.mode = 'aimd'; s6.k = S6.N; draw6(); });
  $('aiad6').addEventListener('click', () => { stopAnim('s6'); s6.mode = 'aiad'; s6.k = S6.N; draw6(); });
  $('play6').addEventListener('click', () => { s6.k = 0; draw6(); animate('s6', 9000, p => { s6.k = Math.round(p * S6.N); draw6(); }); });
  $('reset6').addEventListener('click', () => { stopAnim('s6'); s6.k = 0; draw6(); });

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
  window.refreshNetLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
