'use strict';
// Sound from vibration (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Every moving picture and readout comes from window.SOUND_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks whose spacing is chosen from the measured label width.
(function () {

const $ = id => document.getElementById(id);
const M = window.SOUND_MODEL;
const t = (...a) => window.SOUND_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', air: '#9fb4cc', rice: '#f4eedd', ghost: '#8696aa', shell: '#2a3a50' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros trimmed only after a decimal point (so 90 stays 90). −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };

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
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function ticks(min, max, px, minPx) {
  const span = max - min; let step = span;
  if (!(px > 0) || !(span > 0)) return [];
  const e0 = Math.floor(Math.log10(span));
  outer: for (let e = e0 - 3; e <= e0 + 1; e++) for (const m of [1, 2, 5]) { const s = m * Math.pow(10, e); if (s / span * px >= minPx) { step = s; break outer; } }
  const out = []; for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return out;
}
// o: top, bottom, xMin, xMax, yMin, yMax, title, yTickList, xFmt, yFmt, noX
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yF = o.yFmt || (v => fmt(v)), xF = o.xFmt || (v => fmt(v));
  const yT = o.yTickList || ticks(o.yMin, o.yMax, o.bottom - o.top, 24);
  const left = yT.length ? Math.max(...yT.map(v => ctx.measureText(yF(v)).width)) + 14 : 14;
  const P = { l: left, r: W - 14, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of yT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yF(v), P.l - 6, y(v) + 4);
  }
  if (!o.noX) {
    const probe = [o.xMin, o.xMax, (o.xMin + o.xMax) / 2].map(v => ctx.measureText(xF(v)).width + 12);
    const xT = ticks(o.xMin, o.xMax, P.r - P.l, Math.max(28, ...probe));
    ctx.textAlign = 'center';
    for (const v of xT) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      const lab = xF(v), w = ctx.measureText(lab).width;
      ctx.fillText(lab, Math.min(Math.max(x(v), w / 2 + 2), W - w / 2 - 2), P.b + 16);
    }
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function path(ctx, pts, color, lw, dash, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5) { ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function clip(ctx, P) { ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); }

/* ---------- frame loops: one per step, stopped on hide ---------- */
const loops = {};
function loop(name, step, onStop) {
  stopLoop(name);
  let last = performance.now();
  const tick = now => { const dt = Math.min(64, now - last); last = now; if (step(dt) === false) { delete loops[name]; if (onStop) onStop(); return; } loops[name].id = requestAnimationFrame(tick); };
  loops[name] = { id: requestAnimationFrame(tick), onStop };
}
function stopLoop(name) { const l = loops[name]; if (!l) return; cancelAnimationFrame(l.id); delete loops[name]; if (l.onStop) l.onStop(); }
const running = name => !!loops[name];

/* ---------- step 0: tap the drum ---------- */
const T0 = 0.9, CENTER = M.GRAINS.indexOf(0);
const s0 = { sims: null, tr: 0, muteAt: Infinity };
const simDrum = () => M.GRAINS.map(x => M.grain(M.DRUM.A, M.DRUM.f, x, T0, s0.muteAt));
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 20, W - 16);
  const K = 24, Y0 = 200, cx = W / 2, half = Math.min(W * 0.36, 220), tr = s0.tr;
  const i = s0.sims ? Math.min(s0.sims[0].ts.length - 1, Math.round(tr / 0.001)) : 0;
  const head = x => (s0.sims ? M.membrane(tr, x, M.DRUM.A, M.DRUM.f, s0.muteAt).y : 0);
  // drum shell
  ctx.fillStyle = C.shell; ctx.fillRect(cx - half, Y0, 2 * half, 46);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.strokeRect(cx - half, Y0, 2 * half, 46);
  // drumhead
  const pts = []; for (let k = 0; k <= 80; k++) { const x = -1 + 2 * k / 80; pts.push([cx + x * half, Y0 - head(x) * K]); }
  path(ctx, pts, C.orange, 3);
  // rice
  M.GRAINS.forEach((x, g) => {
    const yy = s0.sims ? s0.sims[g].ys[i] : 0;
    if (s0.sims) { let hi = 0; for (let k = 0; k <= i; k++) hi = Math.max(hi, s0.sims[g].ys[k]); if (hi > 0.6) { ctx.strokeStyle = 'rgba(244,238,221,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(cx + x * half, Y0 - 4); ctx.lineTo(cx + x * half, Y0 - hi * K - 4); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(cx + x * half - 7, Y0 - hi * K - 4); ctx.lineTo(cx + x * half + 7, Y0 - hi * K - 4); ctx.stroke(); } }
    ctx.fillStyle = C.rice; ctx.beginPath(); ctx.ellipse(cx + x * half, Y0 - yy * K - 4, 5, 2.6, 0, 0, 7); ctx.fill();
  });
  if (s0.muteAt < tr) { ctx.fillStyle = 'rgba(255,180,84,0.35)'; ctx.beginPath(); ctx.ellipse(cx + 0.55 * half, Y0 - 14, 26, 12, 0, 0, 7); ctx.fill(); }
  // trace of the centre
  const B = panel(ctx, W, { top: 290, bottom: H - 28, xMin: 0, xMax: 900, yMin: -0.6, yMax: 0.6, yTickList: [-0.5, 0, 0.5], title: t('c0b') });
  if (s0.sims) {
    const S = s0.sims[CENTER], tr2 = []; for (let k = 0; k <= i; k++) tr2.push([B.x(S.ts[k] * 1000), B.y(S.ms[k])]);
    ctx.save(); clip(ctx, B.P); path(ctx, tr2, C.cyan, 1.4); ctx.restore();
    dot(ctx, B.x(tr * 1000), B.y(S.ms[i]), C.text, 4);
  }
  if (!s0.sims) { $('out0').textContent = t('s0idle'); return; }
  const status = M.soundOn(tr, s0.muteAt) ? 'soundOn' : (s0.muteAt < tr ? 'soundMuted' : 'soundOff');
  $('out0').textContent = t('s0readout', { t: (tr * 1000).toFixed(0), n: M.cycles(M.DRUM.f, tr), amp: fix(M.DRUM.A * M.env(tr, s0.muteAt), 3), status: t(status) });
}
function run0() {
  if (reduceMotion()) { s0.tr = T0; draw0(); return; }
  loop('s0', dt => { s0.tr = Math.min(T0, s0.tr + dt / 1000 / M.SLOW_DRUM); draw0(); return s0.tr < T0; });
}

/* ---------- step 1: the wave crosses the air ---------- */
const SLOW1 = 500, X1 = 4, T1 = 0.03, F1 = 300, MARK = { col: 15, row: 3 }, COLS = 40, ROWS = 7;
const s1 = { tr: 0 };
const jitter = (() => { let q = 7; const r = () => { q = (q * 16807) % 2147483647; return q / 2147483647 - 0.5; }; return Array.from({ length: COLS * ROWS }, () => [r(), r()]); })();
function draw1() {
  const { ctx, W, H } = fitCanvas($('c1'));
  $('play1').textContent = t(running('s1') ? 'pause1' : 'play1');
  const A = panel(ctx, W, { top: 30, bottom: 210, xMin: -0.25, xMax: X1, yMin: 0, yMax: 1, yTickList: [], title: t('c1a') });
  const tr = s1.tr, f = F1, dx = X1 / COLS, amp = 0.8 * dx;
  // drumhead on the left
  const head = M.airShift(0, tr, f) * amp;
  ctx.fillStyle = C.orange; ctx.fillRect(A.x(-0.12 + head) - 3, A.P.t + 8, 6, A.P.b - A.P.t - 16);
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const x0 = (c + 0.5) * dx + jitter[c * ROWS + r][0] * dx * 0.2, x = x0 + M.airShift(x0, tr, f) * amp;
    const yv = (r + 0.5) / ROWS + jitter[c * ROWS + r][1] * 0.06;
    const mark = c === MARK.col && r === MARK.row;
    ctx.fillStyle = mark ? C.pink : C.air; ctx.beginPath(); ctx.arc(A.x(x), A.y(yv), mark ? 5.5 : 3, 0, 7); ctx.fill();
  }
  const front = Math.min(X1, M.SPEEDS.air * tr);
  if (tr > 0) path(ctx, [[A.x(front), A.P.t], [A.x(front), A.P.b]], C.cyan, 1.6, [5, 4]);
  const xm = (MARK.col + 0.5) * dx + jitter[MARK.col * ROWS + MARK.row][0] * dx * 0.2;
  const B = panel(ctx, W, { top: 262, bottom: H - 28, xMin: 0, xMax: T1 * 1000, yMin: -1.3, yMax: 1.3, yTickList: [-1, 0, 1], yFmt: v => (v === 0 ? '0' : v > 0 ? '→' : '←'), title: t('c1b') });
  const tr2 = []; for (let k = 0; k <= 600; k++) { const tt = T1 * k / 600; if (tt > tr) break; tr2.push([B.x(tt * 1000), B.y(M.airShift(xm, tt, f))]); }
  path(ctx, tr2, C.pink, 2);
  dot(ctx, B.x(tr * 1000), B.y(M.airShift(xm, tr, f)), C.pink, 4.5);
  const arrive = xm / M.SPEEDS.air;
  const nv = M.cycles(f, tr - arrive), mark = tr < arrive ? t('markWait') : nv < 1 ? t('markStart') : t('markMove', { n: nv });
  $('out1').textContent = t('s1readout', { t: fix(tr * 1000, 1), front: fix(M.SPEEDS.air * tr, 2), mark });
}
function play1() {
  if (running('s1')) { stopLoop('s1'); draw1(); return; }
  if (s1.tr >= T1) s1.tr = 0;
  if (reduceMotion()) { s1.tr = T1; draw1(); return; }
  loop('s1', dt => { s1.tr = Math.min(T1, s1.tr + dt / 1000 / SLOW1); draw1(); return s1.tr < T1; }, () => setTimeout(draw1, 0));
  draw1();
}

/* ---------- step 2: amplitude, rice, loudness ---------- */
const s2 = { tried: new Set() };
const LIFT = (() => { const o = []; return a => { const k = Math.round(a * 100); if (o[k] === undefined) o[k] = M.grain(k / 100, M.DRUM.f, 0, 0.3).lift; return o[k]; }; })();
function draw2() {
  const A = num('A2'), sim = M.grain(A, M.DRUM.f, 0, 0.3, Infinity, 5e-6, 0.0005), th = M.jumpThreshold(M.DRUM.f);
  s2.tried.add(A.toFixed(2));
  $('A2v').textContent = A.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c2'));
  const yMax = Math.max(A * 1.3, sim.maxH * 1.12), top = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: 300, yMin: -A * 1.25, yMax, title: t('c2a') });
  const m = sim.ts.map((tt, k) => [top.x(tt * 1000), top.y(sim.ms[k])]), g = sim.ts.map((tt, k) => [top.x(tt * 1000), top.y(sim.ys[k])]);
  ctx.save(); clip(ctx, top.P); path(ctx, m, C.orange, 1.3); path(ctx, g, C.rice, 1.8); ctx.restore();
  const B = panel(ctx, W, { top: 252, bottom: H - 28, xMin: 0, xMax: 1, yMin: 0, yMax: 22, title: t('c2b') });
  path(ctx, [[B.x(th), B.P.t], [B.x(th), B.P.b]], C.pink, 1.6, [5, 4]);
  [...s2.tried].forEach(k => { if (k !== A.toFixed(2)) dot(ctx, B.x(+k), B.y(LIFT(+k)), C.air, 3.5); });
  dot(ctx, B.x(A), B.y(sim.lift), C.cyan, 6);
  const db = M.dB(A);
  let txt = t('s2readout', { A: A.toFixed(2), lift: fix(sim.lift, 2), E: fmt(M.energyRatio(A), 2), db: (db > 0.05 ? '+' : '') + fix(db, 1) });
  if (A < th) txt += ' ' + t('s2low', { th: fix(th, 3) });
  $('out2').textContent = txt;
}

/* ---------- step 3: frequency, pitch, wavelength, and a short tone ---------- */
const audio = { ctx: null, osc: null, gain: null, msg: '' };
function stopTone() {
  if (audio.osc) { try { audio.osc.onended = null; audio.osc.stop(); } catch (_) { /* already stopped */ } audio.osc = null; }
  audio.msg = ''; draw3();
}
function playTone() {
  const f = num('f3');
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('no audio');
    if (!audio.ctx) audio.ctx = new AC();
    if (audio.osc) stopTone();
    const ac = audio.ctx, now = ac.currentTime, osc = ac.createOscillator(), gain = ac.createGain();
    osc.type = 'sine'; osc.frequency.value = f;
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.05, now + 0.04);
    gain.gain.setValueAtTime(0.05, now + 0.95); gain.gain.linearRampToValueAtTime(0, now + 1.05);
    osc.connect(gain).connect(ac.destination); osc.start(now); osc.stop(now + 1.1);
    osc.onended = () => { if (audio.osc === osc) { audio.osc = null; audio.msg = ''; draw3(); } };
    audio.osc = osc; audio.msg = t('audioPlaying', { f });
    if (ac.state === 'suspended') ac.resume();
  } catch (_) { audio.msg = t('audioNone'); }
  draw3();
}
function draw3() {
  const f = num('f3'), n = M.nearestNote(f);
  $('f3v').textContent = String(f);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: 230, xMin: 0, xMax: 20, yMin: -1.25, yMax: 1.25, yTickList: [-1, 0, 1], title: t('c3a') });
  const wave = fr => { const o = []; const N = 1200; for (let k = 0; k <= N; k++) { const ms = 20 * k / N; o.push([A.x(ms), A.y(Math.sin(2 * Math.PI * fr * ms / 1000))]); } return o; };
  path(ctx, wave(100), C.ghost, 1.4, [5, 4]); path(ctx, wave(f), C.cyan, 2);
  const lam = M.wavelength(f);
  const B = panel(ctx, W, { top: 282, bottom: H - 40, xMin: 0, xMax: 3.6, yMin: 0, yMax: 1, yTickList: [], title: t('c3b') });
  ctx.fillStyle = C.green; ctx.fillRect(B.x(0), B.y(0.75), B.x(lam) - B.x(0), B.y(0.25) - B.y(0.75));
  if (audio.msg && !audio.osc && audio.msg !== t('audioNone')) audio.msg = '';
  $('out3').textContent = t('s3readout', { f, n: fmt(f * 0.02, 1), T: fmt(M.period(f), 2), lam: fix(lam, 2), note: n.name, noteHz: fix(n.freq, 1), audio: audio.osc ? t('audioPlaying', { f }) : audio.msg });
}

/* ---------- step 4: bell jar ---------- */
const s4 = { frac: 1, phase: 0 };
const AIRPTS = (() => { let q = 11; const r = () => { q = (q * 16807) % 2147483647; return q / 2147483647; }; const o = []; while (o.length < 140) { const x = r() * 2 - 1, y = r(); if (x * x + y * y < 0.92 && y > 0.05) o.push([x, y]); } return o; })();
function draw4() {
  const frac = s4.frac, out = M.jarOut(frac);
  $('a4').value = String(Math.round(frac * 100)); $('a4v').textContent = Math.round(frac * 100) + '%';
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 20, W - 16);
  const cx = W / 2, base = H - 40, R = Math.min(W * 0.22, 140);
  // sound rings outside the jar: circles around the bell, larger than the jar, clipped above the base plate
  const bx0 = cx, by0 = base - R * 0.62;
  if (out > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 30, W, base - 30); ctx.clip();
    for (let k = 0; k < 3; k++) {
      const u = (k + s4.phase * 3) % 3 / 3, rr = R * 1.25 + 10 + u * 60;
      ctx.globalAlpha = 0.9 * out * (1 - u * 0.8); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(bx0, by0, rr, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  // base plate and glass jar
  ctx.fillStyle = C.shell; ctx.fillRect(cx - R - 24, base, 2 * R + 48, 12);
  ctx.save(); ctx.strokeStyle = '#7f93ab'; ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(159,180,204,0.06)';
  ctx.beginPath(); ctx.moveTo(cx - R, base); ctx.lineTo(cx - R, base - R * 0.55); ctx.arc(cx, base - R * 0.55, R, Math.PI, 0); ctx.lineTo(cx + R, base); ctx.fill(); ctx.stroke(); ctx.restore();
  // pipe to the pump
  ctx.fillStyle = C.shell; ctx.fillRect(cx + R + 24, base + 2, Math.min(60, W - cx - R - 30), 7);
  // air
  const shown = Math.round(frac * AIRPTS.length);
  ctx.fillStyle = C.air;
  for (let k = 0; k < shown; k++) { const [x, y] = AIRPTS[k]; ctx.beginPath(); ctx.arc(cx + x * (R - 8), base - 6 - y * (R * 1.45 - 10), 2.4, 0, 7); ctx.fill(); }
  // bell on a stand, hammer swinging
  const bx = cx, by = base - R * 0.62;
  ctx.fillStyle = C.axis; ctx.fillRect(bx - 3, by + 14, 6, base - by - 14);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(bx, by, Math.min(26, R * 0.2), Math.PI, 0); ctx.lineTo(bx + Math.min(26, R * 0.2), by + 8); ctx.lineTo(bx - Math.min(26, R * 0.2), by + 8); ctx.fill();
  const sw = Math.sin(s4.phase * Math.PI * 2 * 3) * 0.35, hl = Math.min(40, R * 0.3);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx + Math.min(26, R * 0.2) + 10, by + 30); ctx.lineTo(bx + Math.min(26, R * 0.2) + 10 + Math.sin(-0.6 + sw) * hl, by + 30 - Math.cos(-0.6 + sw) * hl); ctx.stroke();
  const lv = M.jarLevel(frac);
  $('out4').textContent = t('s4readout', { pct: Math.round(frac * 100), level: t(lv === 'clear' ? 'lvClear' : lv === 'faint' ? 'lvFaint' : 'lvNone') });
}
function move4(target, msPerUnit) {
  if (reduceMotion()) { stopLoop('s4'); s4.frac = target; draw4(); return; }
  loop('s4', dt => {
    const d = dt / msPerUnit; s4.frac = s4.frac < target ? Math.min(target, s4.frac + d) : Math.max(target, s4.frac - d);
    s4.phase = (s4.phase + dt / 1500) % 1; draw4(); return s4.frac !== target;
  });
}

/* ---------- step 5: race of light and sound ---------- */
const LANES = [['light', 3e8, C.text], ['air', M.SPEEDS.air, C.cyan], ['water', M.SPEEDS.water, C.green], ['steel', M.SPEEDS.steel, C.orange]];
const s5 = { e: 0 };
function draw5() {
  const dkm = num('d5'), d = dkm * 1000;
  $('d5v').textContent = dkm.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 30, bottom: 220, xMin: 0, xMax: dkm, yMin: 0, yMax: 4, yTickList: [], title: t('c5a') });
  path(ctx, [[A.x(dkm), A.P.t], [A.x(dkm), A.P.b]], C.pink, 2, [6, 4]);
  LANES.forEach(([, v, col], k) => {
    const yy = A.y(3.5 - k), pos = Math.min(d, v * s5.e) / 1000;
    path(ctx, [[A.x(0), yy], [A.x(dkm), yy]], C.grid, 1);
    if (s5.e > 0) path(ctx, [[A.x(0), yy], [A.x(pos), yy]], col, 4, null, 0.75);
    if (pos >= dkm - 1e-9 && s5.e > 0) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(A.x(dkm), yy, 9, 0, 7); ctx.stroke(); ctx.restore(); }
    dot(ctx, A.x(pos), yy, col, 6);
  });
  const tEnd = M.travel(d, 'air'), tMax = Math.ceil(tEnd * 1.05 * 2) / 2;
  const B = panel(ctx, W, { top: 272, bottom: H - 28, xMin: 0, xMax: tMax, yMin: 0, yMax: 1, yTickList: [], title: t('c5b') });
  if (s5.e > 0) path(ctx, [[B.x(s5.e), B.P.t], [B.x(s5.e), B.P.b]], C.pink, 1.5, [4, 4]);
  LANES.forEach(([, v, col], k) => {
    const ta = d / v;
    if (s5.e > 0 && s5.e >= ta - 1e-9) { ctx.fillStyle = col; ctx.fillRect(B.x(ta) - 2, B.y(0.85 - k * 0.2), 4, B.y(0.15) - B.y(0.85 - k * 0.2) + 0); dot(ctx, B.x(ta), B.y(0.85 - k * 0.2), col, 5); }
  });
  const el = s5.e > 0 ? t('s5elapsed', { e: fix(s5.e, 2) }) : '';
  $('out5').textContent = t('s5readout', { el, d: dkm.toFixed(1), ta: fix(M.travel(d, 'air'), 2), tw: fix(M.travel(d, 'water'), 2), ts: fix(M.travel(d, 'steel'), 2) });
}
function go5() {
  const end = M.travel(num('d5') * 1000, 'air');
  s5.e = 0;
  if (reduceMotion()) { s5.e = end; draw5(); return; }
  loop('s5', dt => { s5.e = Math.min(end, s5.e + dt / 1000); draw5(); return s5.e < end; });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('hit0').addEventListener('click', () => { stopLoop('s0'); s0.muteAt = Infinity; s0.tr = 0; s0.sims = simDrum(); run0(); });
  $('mute0').addEventListener('click', () => {
    if (!s0.sims || s0.muteAt < Infinity || s0.tr >= T0) return;
    s0.muteAt = s0.tr; s0.sims = simDrum(); if (!running('s0')) run0();
  });
  $('reset0').addEventListener('click', () => { stopLoop('s0'); s0.sims = null; s0.tr = 0; s0.muteAt = Infinity; draw0(); });
  $('play1').addEventListener('click', play1);
  $('reset1').addEventListener('click', () => { stopLoop('s1'); s1.tr = 0; draw1(); });
  $('A2').addEventListener('input', draw2);
  $('f3').addEventListener('input', () => { if (audio.osc) audio.osc.frequency.value = num('f3'); draw3(); });
  $('listen3').addEventListener('click', playTone);
  $('stop3').addEventListener('click', stopTone);
  $('a4').addEventListener('input', () => { stopLoop('s4'); s4.frac = num('a4') / 100; draw4(); });
  $('pump4').addEventListener('click', () => move4(0, 6000));
  $('fill4').addEventListener('click', () => move4(1, 2500));
  $('d5').addEventListener('input', () => { stopLoop('s5'); s5.e = 0; draw5(); });
  $('go5').addEventListener('click', go5);
  $('reset5').addEventListener('click', () => { stopLoop('s5'); s5.e = 0; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    Object.keys(loops).forEach(stopLoop);
    if (audio.osc) stopTone();
    if (audio.ctx) { try { audio.ctx.close(); } catch (_) { /* ignore */ } audio.ctx = null; }
    refresh();
  });
  window.refreshSound = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
