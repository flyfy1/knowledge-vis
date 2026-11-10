'use strict';
// Mechanical energy lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Every position, bar and readout comes from window.ME_MODEL (model.js): closed-form free fall, and RK4 / Verlet
// simulations for the coaster and the pendulum. Canvas text is limited to titles, axis ticks and bar names.
(function () {

const $ = id => document.getElementById(id);
const M = window.ME_MODEL;
const t = (...a) => window.ME_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', ground: '#1b2838' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };

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
function title(ctx, text, X, Y, maxW, color = C.text) {
  let size = 12;
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
// Plot panel; the title sits in its own row above, ticks left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 1), P.l - 6, y(v) + 4);
  }
  if (o.xStep) {
    const minPx = 34; let step = o.xStep; while (step / (o.xMax - o.xMin) * (P.r - P.l) < minPx) step *= 2;
    ctx.textAlign = 'center';
    for (let v = Math.ceil(o.xMin / step - 1e-9) * step; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
const nice = v => { const e = Math.pow(10, Math.floor(Math.log10(v))); for (const k of [1, 2, 2.5, 5, 10]) if (k * e >= v) return k * e; return 10 * e; };
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function line(ctx, pts, color, lw = 2, dash = null) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function hdash(ctx, x0, x1, Y, color, dash = [6, 4], lw = 1.5) { line(ctx, [[x0, Y], [x1, Y]], color, lw, dash); }

/* ---------- shared player: drives a model clock, respects reduced motion and hidden pages ---------- */
const players = {};
function play(name, { from, to, speed, frame, done }) {
  stop(name);
  if (reduceMotion() || to <= from) { frame(to, false); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const tm = Math.min(to, from + (now - start) / 1000 * speed), last = tm >= to;
    frame(tm, !last);
    if (!last) players[name].id = requestAnimationFrame(tick); else { delete players[name]; if (done) done(); }
  };
  players[name] = { id: requestAnimationFrame(tick), finish: () => { frame(to, false); if (done) done(); } };
}
function stop(name) { if (players[name]) { cancelAnimationFrame(players[name].id); delete players[name]; return true; } return false; }
const running = name => !!players[name];
function finishAll() { Object.keys(players).forEach(k => { const p = players[k]; cancelAnimationFrame(p.id); delete players[k]; p.finish(); }); }

/* ---------- step 0: free fall ---------- */
const s0 = { anim: false };
function draw0() {
  const h0 = num('h0'), m = num('m0'), T = M.fallTime(h0), tt = num('t0') * T, S = M.fallState(h0, m, tt);
  $('h0v').textContent = `${h0} m`; $('m0v').textContent = `${fmt(m, 1)} kg`; $('t0v').textContent = `${S.t.toFixed(2)} s / ${T.toFixed(2)} s`;
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0scene'), 8, 16, W - 16);
  const split = Math.round(W * 0.5), gy = 250, ty = 44, py = v => gy - v / 20 * (gy - ty);
  // height scale and ground
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, 5, 10, 15, 20].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(44, py(v)); ctx.lineTo(split - 10, py(v)); ctx.stroke(); ctx.fillText(`${v} m`, 40, py(v) + 4); });
  ctx.fillStyle = C.ground; ctx.fillRect(44, gy, split - 54, 8); ctx.restore();
  const bx = (44 + split - 10) / 2;
  hdash(ctx, bx - 30, bx + 30, py(h0), C.orange, [4, 4], 1.2);
  for (let k = 0; k * 0.1 < S.t - 1e-9; k++) dot(ctx, bx, py(M.fallState(h0, m, k * 0.1).h), 6, 'rgba(232,237,244,0.35)');
  dot(ctx, bx, py(S.h) - 0, 8, C.text);
  // three bars: potential, kinetic, total (scaled to the starting energy)
  const top = 44, base = 236, bw = Math.min(46, (W - split - 30) / 4.5), gap = bw * 0.6, E0 = S.E0;
  const by = v => base - v / E0 * (base - top), x0 = split + 30;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, E0 / 2, E0].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x0 - 4, by(v)); ctx.lineTo(x0 + 3 * bw + 2 * gap + 4, by(v)); ctx.stroke(); });
  ctx.restore();
  const bars = [[S.Ep, C.orange, 'barEp'], [S.Ek, C.cyan, 'barEk'], [S.Ep + S.Ek, C.text, 'barSum']];
  bars.forEach(([v, c, key], i) => {
    const X = x0 + i * (bw + gap); ctx.fillStyle = c; ctx.fillRect(X, by(v), bw, base - by(v));
    ctx.save(); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; let sz = 11; ctx.font = `${sz}px system-ui,sans-serif`;
    while (ctx.measureText(t(key)).width > bw + gap - 4 && sz > 8) { sz -= 0.5; ctx.font = `${sz}px system-ui,sans-serif`; }
    ctx.fillText(t(key), X + bw / 2, base + 16); ctx.restore();
  });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, E0].forEach(v => ctx.fillText(fmt(v, 0), x0 - 6, by(v) + 4)); ctx.restore();
  // energy against distance fallen, drawn up to now
  const yMax = nice(E0 * 1.05);
  const P = panel(ctx, W, { top: 304, bottom: H - 26, xMin: 0, xMax: h0, yMin: 0, yMax, yTicks: [0, yMax / 2, yMax], xStep: 1, title: t('c0plot') });
  const pts = n => { const out = []; for (let i = 0; i <= 60; i++) { const d = (h0 - S.h) * i / 60, st = { Ep: m * M.G * (h0 - d), Ek: m * M.G * d }; out.push([P.x(d), P.y(n(st))]); } return out; };
  line(ctx, pts(q => q.Ep), C.orange, 2.2); line(ctx, pts(q => q.Ek), C.cyan, 2.2); line(ctx, pts(q => q.Ep + q.Ek), C.text, 1.6, [5, 4]);
  $('r0').textContent = t('s0readout', { prog: s0.anim ? t('s0prog') : '', t: S.t.toFixed(2), h: S.h.toFixed(2), v: S.v.toFixed(2), Ep: S.Ep.toFixed(1), Ek: S.Ek.toFixed(1), sum: (S.Ep + S.Ek).toFixed(1), E0: S.E0.toFixed(1), vi: M.impactSpeed(h0).toFixed(2) });
}

/* ---------- the coaster track scene, shared by steps 1 and 3 ---------- */
const TRACK = { top: 30, bottom: 250, left: 44, right: 14 };
function trackScene(ctx, W, H0) {
  const L = TRACK.left, R = W - TRACK.right, hs = (R - L) / M.XMAX, vs = (TRACK.bottom - TRACK.top - 20) / 16.5;
  const X = x => L + x * hs, Y = h => TRACK.bottom - h * vs;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, 5, 10, 15].forEach(v => { ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); ctx.fillText(`${v} m`, L - 6, Y(v) + 4); });
  // ground under the track
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); for (let i = 0; i <= 400; i++) { const x = M.XMAX * i / 400; ctx.lineTo(X(x), Y(M.h(x))); } ctx.lineTo(X(M.XMAX), Y(0)); ctx.closePath();
  ctx.fillStyle = C.ground; ctx.fill();
  // the rail: grey where reachable, pink where higher than the release point
  for (let i = 0; i < 400; i++) {
    const xa = M.XMAX * i / 400, xb = M.XMAX * (i + 1) / 400, hi = M.h((xa + xb) / 2) > H0 + 1e-9;
    ctx.strokeStyle = hi ? C.pink : '#b7cee8'; ctx.lineWidth = hi ? 3.5 : 2.5;
    ctx.beginPath(); ctx.moveTo(X(xa), Y(M.h(xa))); ctx.lineTo(X(xb), Y(M.h(xb))); ctx.stroke();
  }
  ctx.restore();
  hdash(ctx, L, R, Y(H0), C.text, [6, 5], 1.2);
  return { X, Y, L, R };
}
function car(ctx, g, x, color = C.cyan) { const r = 7; dot(ctx, g.X(x), g.Y(M.h(x)) - r - 1, r, color); }

/* ---------- step 1: frictionless coaster ---------- */
const s1 = { H: null, sim: null, tm: 0, anim: false };
function sim1() { const H = num('H1'); if (s1.H !== H) { s1.H = H; s1.sim = M.simulate(H, 0, { T: 60 }); s1.tm = 0; } return s1.sim; }
const frameAt = (sim, tm) => sim.frames[Math.max(0, Math.min(sim.frames.length - 1, Math.round(tm / sim.every)))];
function draw1() {
  const H = num('H1'), xp = num('x1'), sim = sim1(), f = frameAt(sim, s1.tm), m = M.MASS;
  $('H1v').textContent = `${fmt(H, 1)} m`; $('x1v').textContent = `${fmt(xp, 1)} m`;
  $('play1').textContent = running('s1') ? t('pause') : t('play');
  const { ctx, W, H: CH } = fitCanvas($('c1'));
  title(ctx, t('c1scene'), 8, 16, W - 16);
  const g = trackScene(ctx, W, H), rc = M.reach(H);
  // ghosts of the run so far, one every 0.5 s
  for (let tm = Math.max(0, Math.floor((s1.tm - 10) / 0.5) * 0.5); tm < s1.tm - 1e-9; tm += 0.5) { /* the last 10 s */ const q = frameAt(sim, tm); dot(ctx, g.X(q.x), g.Y(q.h) - 8, 3, 'rgba(232,237,244,0.35)'); }
  line(ctx, [[g.X(xp), TRACK.top], [g.X(xp), TRACK.bottom]], C.orange, 1.5, [3, 4]);
  dot(ctx, g.X(xp), g.Y(M.h(xp)), 4.5, C.orange);
  car(ctx, g, f.x);
  // energy along the track (kJ), stacked, over the reachable stretch only
  const P = panel(ctx, W, { top: 298, bottom: CH - 26, left: TRACK.left, right: TRACK.right, xMin: 0, xMax: M.XMAX, yMin: 0, yMax: 80, yTicks: [0, 20, 40, 60, 80], xStep: 10, title: t('c1plot') });
  const xs = []; for (let i = 0; i <= 300; i++) { const x = rc.x0 + (rc.x1 - rc.x0) * i / 300; xs.push(x); }
  const kJ = v => v / 1000;
  ctx.save();
  ctx.beginPath(); xs.forEach((x, i) => { const Xp = P.x(x), Yp = P.y(kJ(m * M.G * M.h(x))); i ? ctx.lineTo(Xp, Yp) : ctx.moveTo(Xp, Yp); }); ctx.lineTo(P.x(rc.x1), P.y(0)); ctx.lineTo(P.x(rc.x0), P.y(0)); ctx.closePath();
  ctx.fillStyle = 'rgba(255,180,84,0.75)'; ctx.fill();
  ctx.beginPath(); xs.forEach((x, i) => { const Xp = P.x(x), Yp = P.y(kJ(m * M.G * H)); i ? ctx.lineTo(Xp, Yp) : ctx.moveTo(Xp, Yp); }); xs.slice().reverse().forEach(x => ctx.lineTo(P.x(x), P.y(kJ(m * M.G * M.h(x))))); ctx.closePath();
  ctx.fillStyle = 'rgba(103,215,249,0.6)'; ctx.fill(); ctx.restore();
  line(ctx, [[P.x(rc.x0), P.y(kJ(m * M.G * H))], [P.x(rc.x1), P.y(kJ(m * M.G * H))]], C.text, 2);
  line(ctx, [[P.x(xp), P.P.t], [P.x(xp), P.P.b]], C.orange, 1.5, [3, 4]);
  line(ctx, [[P.x(f.x), P.P.t], [P.x(f.x), P.P.b]], C.cyan, 1.5);
  const hp = M.h(xp), d = H - hp, v = M.speedAt(H, xp);
  const probe = v === null ? t('s1probeNo', { d: Math.abs(d).toFixed(2) })
    : t('s1probeOk', { d: d.toFixed(2), v: v.toFixed(2), Ep: kJ(m * M.G * hp).toFixed(1), Ek: kJ(0.5 * m * v * v).toFixed(1), E: kJ(m * M.G * H).toFixed(1) });
  const reachNote = H < M.KEYS[2][1] ? t('s1turn', { x: rc.x1.toFixed(1) }) : t('s1pass', { x: rc.x1.toFixed(1) });
  $('r1').textContent = t('s1readout', { prog: s1.anim ? t('s1prog') : '', x: fmt(xp, 1), h: hp.toFixed(2), probe, t: f.t.toFixed(1), cx: f.x.toFixed(1), cv: Math.abs(f.v).toFixed(2), reach: reachNote });
}
function toggle1() {
  if (stop('s1')) { s1.anim = false; draw1(); return; }
  const sim = sim1(), T = sim.frames[sim.frames.length - 1].t;
  if (s1.tm >= T - 1e-9) s1.tm = 0;
  s1.anim = true;
  play('s1', { from: s1.tm, to: T, speed: 2, frame: (tm, live) => { s1.tm = tm; s1.anim = live; draw1(); }, done: () => { s1.anim = false; draw1(); } });
  draw1();
}

/* ---------- step 2: Galileo's pendulum ---------- */
const s2 = { key: null, run: null, shown: 0, old: [], anim: false };
function run2() {
  const th = num('th2'), p = num('p2'), key = `${th}|${p}`;
  if (s2.key !== key) { s2.key = key; s2.run = M.pendulum(th, p); s2.shown = 0; }
  return s2.run;
}
function draw2() {
  const th = num('th2'), p = num('p2'), R = run2(), Lr = M.PEND.L;
  $('th2v').textContent = `${th}°`; $('p2v').textContent = p === 0 ? '0' : `${fmt(p, 1)} m`;
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2scene'), 8, 16, W - 16);
  const s = Math.min((W - 40) / 5, (H - 70) / 3.25), ox = W / 2, oy = 44, X = x => ox + x * s, Y = y => oy - y * s;
  ctx.save(); ctx.fillStyle = C.muted; ctx.fillRect(ox - 40, oy - 6, 80, 5); ctx.restore();
  hdash(ctx, 12, W - 12, Y(-Lr + R.h0), C.orange, [6, 5], 1.5);
  s2.old.forEach(path => line(ctx, path.map(q => [X(q.x), Y(q.y)]), C.raw, 1.6));
  const upto = R.pts.slice(0, Math.max(1, s2.shown));
  if (s2.shown > 1) line(ctx, upto.map(q => [X(q.x), Y(q.y)]), C.cyan, 2.2);
  if (p > 0) dot(ctx, X(0), Y(-p), 5, C.pink);
  const q = upto[upto.length - 1];
  ctx.save(); ctx.strokeStyle = '#b7cee8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(0));
  if (q.phase === 'R') ctx.lineTo(X(0), Y(-p)); ctx.lineTo(X(q.x), Y(q.y)); ctx.stroke(); ctx.restore();
  dot(ctx, X(0), Y(0), 3.5, C.muted);
  dot(ctx, X(q.x), Y(q.y), 9, C.text);
  const prog = s2.anim ? t('s2prog') : '';
  $('r2').textContent = t('s2readout', { prog, h0: R.h0.toFixed(3), r: fmt(R.r, 1), hm: R.hmax.toFixed(3), diff: (Math.abs(R.hmax - R.h0) * 1000).toFixed(2), phi: R.phiMax.toFixed(1), th });
}
function swing2() {
  stop('s2'); const R = run2();
  if (s2.shown > 1) { const prev = R.pts; if (!s2.old.includes(prev)) { s2.old.push(prev); if (s2.old.length > 4) s2.old.shift(); } }
  s2.shown = 1; s2.anim = true;
  play('s2', { from: 0, to: R.T, speed: 1, frame: (tm, live) => { s2.shown = Math.min(R.pts.length, Math.floor(tm / 0.01) + 1); s2.anim = live; draw2(); }, done: () => { s2.shown = R.pts.length; s2.anim = false; draw2(); } });
}
function change2() {
  stop('s2');
  if (s2.shown > 1 && s2.run && !s2.old.includes(s2.run.pts)) { s2.old.push(s2.run.pts); if (s2.old.length > 4) s2.old.shift(); }
  s2.anim = false; draw2();
}

/* ---------- step 3: with resistance ---------- */
const s3 = { key: null, sim: null, tm: 0, anim: false, Tend: 0, speed: 2 };
function sim3() {
  const H = num('H3'), k = num('k3'), key = `${H}|${k}`;
  if (s3.key !== key) {
    s3.key = key; s3.sim = M.simulate(H, k, { T: k > 0 ? 300 : 60 }); s3.tm = 0;
    s3.Tend = s3.sim.stopT !== null ? s3.sim.stopT : s3.sim.frames[s3.sim.frames.length - 1].t;
    s3.speed = Math.max(2, Math.ceil(s3.Tend / 15));
  }
  return s3.sim;
}
function draw3() {
  const H = num('H3'), k = num('k3'), sim = sim3(), f = frameAt(sim, Math.min(s3.tm, s3.Tend)), m = M.MASS, kJ = v => v / 1000;
  $('H3v').textContent = `${fmt(H, 1)} m`; $('k3v').textContent = fmt(k, 2);
  $('play3').textContent = running('s3') ? t('pause') : t('play');
  const { ctx, W, H: CH } = fitCanvas($('c3'));
  title(ctx, t('c3scene'), 8, 16, W - 16);
  const g = trackScene(ctx, W, H);
  for (let tm = 0; tm < s3.tm - 1e-9; tm += 0.5) { const q = frameAt(sim, tm); dot(ctx, g.X(q.x), g.Y(q.h) - 8, 3, 'rgba(232,237,244,0.3)'); }
  car(ctx, g, f.x);
  // the ledger over time, stacked: potential, kinetic, heat
  const yMax = 80, P = panel(ctx, W, { top: 298, bottom: CH - 26, left: TRACK.left, right: TRACK.right, xMin: 0, xMax: s3.Tend, yMin: 0, yMax, yTicks: [0, 20, 40, 60, 80], xStep: 1, title: t('c3plot') });
  const cols = Math.max(2, Math.round(P.x(Math.min(s3.tm, s3.Tend)) - P.P.l));
  const layers = [[q => 0, q => q.Ep, 'rgba(255,180,84,0.8)'], [q => q.Ep, q => q.Ep + q.Ek, 'rgba(103,215,249,0.65)'], [q => q.Ep + q.Ek, q => q.Ep + q.Ek + q.Q, 'rgba(255,122,147,0.6)']];
  if (s3.tm > 0) layers.forEach(([lo, hi, col]) => {
    const top = [], bot = [];
    for (let i = 0; i <= cols; i++) { const tm = Math.min(s3.tm, s3.Tend) * i / cols, q = frameAt(sim, tm); top.push([P.x(tm), P.y(kJ(hi(q)))]); bot.push([P.x(tm), P.y(kJ(lo(q)))]); }
    ctx.save(); ctx.beginPath(); top.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); bot.reverse().forEach(([X, Y]) => ctx.lineTo(X, Y)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  });
  line(ctx, [[P.P.l, P.y(kJ(sim.E0))], [P.P.r, P.y(kJ(sim.E0))]], C.text, 2);
  const sum = f.Ep + f.Ek + f.Q, done = s3.tm >= s3.Tend - 1e-9;
  let end = '';
  if (done && sim.stopT !== null) end = t('s3end', { x: f.x.toFixed(1), h: f.h.toFixed(2), s: f.s.toFixed(1), Q: kJ(f.Q).toFixed(1), E0: kJ(sim.E0).toFixed(1), Ep: kJ(f.Ep).toFixed(1) });
  else if (k === 0) end = t('s3noEnd', { T: fmt(s3.Tend, 0) });
  $('r3').textContent = t('s3readout', { prog: s3.anim ? t('s3prog', { x: s3.speed }) : '', t: f.t.toFixed(1), Ep: kJ(f.Ep).toFixed(1), Ek: kJ(f.Ek).toFixed(1), Q: kJ(f.Q).toFixed(1), sum: kJ(sum).toFixed(1), E0: kJ(sim.E0).toFixed(1), err: (Math.abs(sum - sim.E0) / sim.E0 * 100).toFixed(3), s: f.s.toFixed(1), f: fmt(k * m * M.G, 0), end });
}
function toggle3() {
  if (stop('s3')) { s3.anim = false; draw3(); return; }
  sim3(); if (s3.tm >= s3.Tend - 1e-9) s3.tm = 0;
  s3.anim = true;
  play('s3', { from: s3.tm, to: s3.Tend, speed: s3.speed, frame: (tm, live) => { s3.tm = tm; s3.anim = live; draw3(); }, done: () => { s3.anim = false; draw3(); } });
  draw3();
}

/* ---------- step 4: speed squared ---------- */
const s4 = { seen: new Set([30]) };
function draw4() {
  const v = num('v4'); s4.seen.add(v);
  const h = M.dropHeight(v), ms = M.kmh(v);
  $('v4v').textContent = `${v} km/h`;
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4scene'), 8, 16, W - 16);
  const gy = 236, ty = 34, py = m => gy - m / 60 * (gy - ty), bx = 70, bw = Math.min(110, W * 0.22);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, 20, 40, 60].forEach(m => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(bx - 4, py(m)); ctx.lineTo(W - 14, py(m)); ctx.stroke(); ctx.fillText(`${m} m`, bx - 8, py(m) + 4); });
  // building: one band per 3 m storey, up to 20 storeys
  for (let k = 0; k < 20; k++) { ctx.fillStyle = k % 2 ? '#22324a' : '#1c2a3e'; ctx.fillRect(bx, py((k + 1) * M.FLOOR), bw, py(k * M.FLOOR) - py((k + 1) * M.FLOOR)); }
  ctx.fillStyle = C.ground; ctx.fillRect(bx - 6, gy, W - bx - 8, 6);
  ctx.restore();
  // equivalent drop: a dashed line at height h and a falling block beside the building
  hdash(ctx, bx, W - 14, py(h), C.orange, [6, 4], 2);
  const cx = bx + bw + 30;
  ctx.save(); ctx.fillStyle = C.orange; ctx.fillRect(cx, py(h) - 12, 26, 12); ctx.strokeStyle = C.orange; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(cx + 13, py(h)); ctx.lineTo(cx + 13, gy); ctx.stroke(); ctx.restore();
  // h against v
  const P = panel(ctx, W, { top: 280, bottom: H - 26, xMin: 0, xMax: 120, yMin: 0, yMax: 60, yTicks: [0, 20, 40, 60], xStep: 10, title: t('c4plot') });
  const curve = []; for (let u = 0; u <= 120; u += 2) curve.push([P.x(u), P.y(M.dropHeight(u))]);
  line(ctx, curve, C.ghost, 1.5, [5, 4]);
  [...s4.seen].forEach(u => dot(ctx, P.x(u), P.y(M.dropHeight(u)), 4, C.cyan));
  dot(ctx, P.x(v), P.y(h), 7.5, C.text, true);
  const half = v / 2, hh = M.dropHeight(half);
  $('r4').textContent = t('s4readout', { kmh: v, ms: ms.toFixed(2), Ek: (0.5 * 1500 * ms * ms / 1000).toFixed(1), h: h.toFixed(2), fl: fmt(h / M.FLOOR, 1),
    cmp: t('s4cmp', { half: fmt(half, 1), hh: hh.toFixed(2), ratio: fmt(h / hh, 2) }) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  ['h0', 'm0'].forEach(id => $(id).addEventListener('input', () => { stop('s0'); s0.anim = false; draw0(); }));
  $('t0').addEventListener('input', () => { stop('s0'); s0.anim = false; draw0(); });
  $('drop0').addEventListener('click', () => {
    const T = M.fallTime(num('h0')); s0.anim = true;
    play('s0', { from: 0, to: 1, speed: 1 / (3 * T), frame: (p, live) => { $('t0').value = p; s0.anim = live; draw0(); }, done: () => { s0.anim = false; draw0(); } });
  });
  $('reset0').addEventListener('click', () => { stop('s0'); s0.anim = false; $('t0').value = 0; draw0(); });

  $('H1').addEventListener('input', () => { stop('s1'); s1.anim = false; draw1(); });
  $('x1').addEventListener('input', draw1);
  $('play1').addEventListener('click', toggle1);
  $('reset1').addEventListener('click', () => { stop('s1'); s1.anim = false; s1.tm = 0; draw1(); });

  ['th2', 'p2'].forEach(id => $(id).addEventListener('input', change2));
  $('swing2').addEventListener('click', swing2);

  ['H3', 'k3'].forEach(id => $(id).addEventListener('input', () => { stop('s3'); s3.anim = false; draw3(); }));
  $('play3').addEventListener('click', toggle3);
  $('end3').addEventListener('click', () => { stop('s3'); s3.anim = false; sim3(); s3.tm = s3.Tend; draw3(); });
  $('reset3').addEventListener('click', () => { stop('s3'); s3.anim = false; s3.tm = 0; draw3(); });

  $('v4').addEventListener('input', draw4);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshMechEnergy = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
