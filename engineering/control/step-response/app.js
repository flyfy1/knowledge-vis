'use strict';
// Step response lesson. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// Every curve, marker and readout is read from STEP_RESPONSE.simulate()/metrics();
// formulas() is only ever shown next to the measured value for comparison.
(function () {

const $ = id => document.getElementById(id);
const S = window.STEP_RESPONSE;
const t = (...a) => window.STEP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', text: '#e8edf4', bg: '#0d1621' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const f = (v, d = 2) => Number(v).toFixed(d);
const sec = v => v === null || v === undefined ? t('notSettled') : f(v, 2) + t('seconds');
const secF = v => v === null || v === undefined ? t('na') : f(v, 2) + t('seconds');

const cache = new Map();
function run(zeta, wn, duration) {
  const key = zeta.toFixed(3) + '|' + wn.toFixed(3) + '|' + duration;
  if (!cache.has(key)) { const r = S.simulate(zeta, wn, duration); cache.set(key, { run: r, m: S.metrics(r) }); }
  return cache.get(key);
}

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  // The CSS height is fixed once from the authored attribute; the bitmap is then resized
  // for the device pixel ratio without ever feeding back into the layout height.
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

// Time-domain frame: y axis 0..yMax, t axis 0..tMax. Returns coordinate maps.
function timeFrame(ctx, W, H, { tMax, yMax = 1.8, top = 14, bottom = 30, left = 40, right = 12 }) {
  const P = { l: left, r: W - right, t: top, b: H - bottom };
  const x = v => P.l + v / tMax * (P.r - P.l);
  const y = v => P.b - v / yMax * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const tStep = tMax > 10 ? 2 : 1;
  for (let v = 0; v <= tMax + 1e-9; v += tStep) { ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(String(v), x(v), P.b + 14); }
  for (let v = 0; v <= yMax + 1e-9; v += 0.5) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(v.toFixed(1), P.l - 6, y(v) + 4); }
  ctx.textAlign = 'right'; ctx.fillText('t (s)', P.r, P.b + 26);
  ctx.textAlign = 'left'; ctx.fillText('y', 4, P.t + 8);
  return { x, y, P };
}

function stepInput(ctx, m, tMax) {
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(m.x(0), m.y(0)); ctx.lineTo(m.x(0), m.y(1)); ctx.lineTo(m.x(tMax), m.y(1)); ctx.stroke(); ctx.restore();
}

function curve(ctx, m, pts, { color = C.cyan, width = 2.6, alpha = 1, dash = null, until = Infinity } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < pts.length; i += 2) { const p = pts[i]; if (p.t > until) break; const X = m.x(p.t), Y = m.y(Math.max(-0.2, Math.min(p.y, 2.2))); if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}

function label(ctx, text, X, Y, color = C.text, align = 'left') {
  ctx.save(); ctx.font = '12px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore();
}

// Complex-plane frame with equal scaling on both axes.
function planeFrame(ctx, W, H, { reMin, reMax, imMax }) {
  const P = { l: 10, r: W - 10, t: 10, b: H - 22 };
  const sc = Math.min((P.r - P.l) / (reMax - reMin), (P.b - P.t) / (2 * imMax));
  const ox = P.r - reMax * sc - ((P.r - P.l) - (reMax - reMin) * sc) / 2, oy = (P.t + P.b) / 2;
  const x = re => ox + re * sc, y = im => oy - im * sc;
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (let v = Math.ceil(reMin); v <= reMax; v++) { if (v % 2) continue; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); ctx.textAlign = 'center'; if (v) ctx.fillText(String(v), x(v), P.b + 14); }
  for (let v = -Math.floor(imMax); v <= imMax; v++) { if (v % 2) continue; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.strokeStyle = '#4a5f78'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(P.l, oy); ctx.lineTo(P.r, oy); ctx.moveTo(ox, P.t); ctx.lineTo(ox, P.b); ctx.stroke();
  label(ctx, t('reAxis'), P.r - 2, oy - 6, C.muted, 'right'); label(ctx, t('imAxis'), ox + 6, P.t + 12, C.muted);
  return { x, y, P, sc, ox, oy, reMin, reMax, imMax };
}

function poleMark(ctx, pm, p, color = C.pink, size = 7, alpha = 1) {
  const re = Math.max(pm.reMin, Math.min(pm.reMax, p.re)), im = Math.max(-pm.imMax, Math.min(pm.imMax, p.im));
  const X = pm.x(re), Y = pm.y(im);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(X - size, Y - size); ctx.lineTo(X + size, Y + size); ctx.moveTo(X + size, Y - size); ctx.lineTo(X - size, Y + size); ctx.stroke();
  if (re !== p.re && alpha === 1) label(ctx, '← ' + f(p.re, 1), X + 10, Y - 8, color);
  ctx.restore();
}

/* ---------- step 0: animated first look ---------- */
const s0 = { tShown: null, anim: null, Z: 0.3, W: 2, T: 10 };
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const { run: r, m: met } = run(s0.Z, s0.W, s0.T);
  const trackY = 34, tx = v => 40 + v / 1.8 * (W - 52);
  // position track: where the output currently is, against the target 1
  ctx.strokeStyle = '#4a5f78'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx(0), trackY); ctx.lineTo(tx(1.8), trackY); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx(1), trackY - 18); ctx.lineTo(tx(1), trackY + 18); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, 'u = 1', tx(1) + 16, trackY - 14, C.orange);
  const shown = s0.tShown === null ? 0 : s0.tShown;
  const cur = r.points[Math.min(r.points.length - 1, Math.round(shown / r.dt))];
  const bx = tx(cur.y);
  ctx.fillStyle = C.cyan; ctx.fillRect(bx - 11, trackY - 11, 22, 22);
  label(ctx, 'y', bx, trackY + 26, C.cyan, 'center');
  const m = timeFrame(ctx, W, H, { tMax: s0.T, top: 74 });
  stepInput(ctx, m, s0.T);
  if (s0.tShown !== null) {
    curve(ctx, m, r.points, { until: shown });
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(m.x(cur.t), m.y(cur.y), 4.5, 0, 7); ctx.fill();
  }
  const done = s0.tShown !== null && shown >= s0.T - 1e-6;
  $('r0').textContent = s0.tShown === null ? '' : done
    ? t('s0done', { peak: f(met.peak, 2), po: f(met.overshoot, 0) })
    : t('s0progress', { t: f(shown, 1), T: s0.T, y: f(cur.y, 2) });
  $('applyStep').textContent = s0.tShown === null ? t('applyStep') : t('replay');
}
function animate0() {
  if (s0.anim) cancelAnimationFrame(s0.anim);
  if (reduceMotion()) { s0.tShown = s0.T; draw0(); return; }
  const start = performance.now(), realMs = 4000; // teaching slow-motion: 10 s of model time in 4 s
  const tick = now => {
    if (document.hidden) { s0.tShown = s0.T; s0.anim = null; draw0(); return; }
    s0.tShown = Math.min(s0.T, (now - start) / realMs * s0.T); draw0();
    s0.anim = s0.tShown < s0.T ? requestAnimationFrame(tick) : null;
  };
  s0.anim = requestAnimationFrame(tick);
}

/* ---------- step 1: damping ratio with trails ---------- */
const trails1 = [];
function draw1() {
  const z = num('z1'), Wn = 2, T = 12;
  $('z1v').textContent = f(z, 2);
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = timeFrame(ctx, W, H, { tMax: T });
  stepInput(ctx, m, T);
  trails1.filter(tz => Math.abs(tz - z) > 1e-6).forEach((tz, i) => {
    const { run: r } = run(tz, Wn, T);
    curve(ctx, m, r.points, { color: C.muted, width: 1.6, alpha: 0.35 + 0.1 * i });
    const end = r.points[Math.round(1.4 / r.dt)];
    label(ctx, 'ζ=' + f(tz, 2), m.x(1.4) + 4, m.y(end.y) - 4, C.muted);
  });
  const { run: r, m: met } = run(z, Wn, T);
  curve(ctx, m, r.points);
  label(ctx, 'ζ=' + f(z, 2), m.P.r - 4, m.P.t + 12, C.cyan, 'right');
  $('r1').textContent = t('s1readout', { z: f(z, 2), regime: t('regime_' + (S.regime(z) === 'undamped' ? 'under' : S.regime(z))), po: f(met.overshoot, 1), ts: sec(met.settling) });
}
function keep1() { const z = num('z1'); if (!trails1.some(v => Math.abs(v - z) < 1e-6)) { trails1.push(z); if (trails1.length > 5) trails1.shift(); } }

/* ---------- step 2: overshoot depends on ζ only ---------- */
function draw2() {
  const z = num('z2'), Wn = num('w2'), T = 10;
  $('z2v').textContent = f(z, 2); $('w2v').textContent = f(Wn, 1);
  const { run: r, m: met } = run(z, Wn, T), fo = S.formulas(z, Wn);
  let { ctx, W, H } = fitCanvas($('c2'));
  const m = timeFrame(ctx, W, H, { tMax: T, yMax: 2 });
  stepInput(ctx, m, T);
  curve(ctx, m, r.points);
  if (met.peakTime !== null) {
    const X = m.x(met.peakTime), Y = m.y(met.peak);
    ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, m.P.b); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X + 8, m.y(1)); ctx.lineTo(X + 8, Y); ctx.stroke(); ctx.restore();
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(X, Y, 5, 0, 7); ctx.fill();
    label(ctx, f(met.overshoot, 1) + '%', X + 13, (Y + m.y(1)) / 2 + 4, C.pink);
    label(ctx, 'tp', X, m.P.b - 4, C.pink, 'center');
  }
  // right: the formula curve with the measured dot on it
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const P = { l: 38, r: W - 10, t: 14, b: H - 30 };
  const x = v => P.l + v * (P.r - P.l), y = v => P.b - v / 100 * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (let v = 0; v <= 100; v += 25) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 5, y(v) + 4); }
  for (let v = 0; v <= 1.001; v += 0.25) { ctx.textAlign = 'center'; ctx.fillText(v.toFixed(2), x(v), P.b + 14); }
  label(ctx, t('zetaAxis'), P.r, P.b + 26, C.muted, 'right'); label(ctx, t('poAxis'), P.l + 4, P.t + 10, C.muted);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 1; i <= 99; i++) { const zz = i / 100, v = S.formulas(zz, 1).overshoot; i === 1 ? ctx.moveTo(x(zz), y(v)) : ctx.lineTo(x(zz), y(v)); }
  ctx.stroke();
  label(ctx, 'e^(−ζπ/√(1−ζ²))', x(0.42), y(60), C.orange);
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x(z), y(met.overshoot), 6, 0, 7); ctx.fill();
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.stroke();
  $('r2').textContent = t('s2readout', { po: f(met.overshoot, 1), poF: f(fo.overshoot, 1), tp: secF(met.peakTime), tpF: secF(fo.peakTime) });
}

/* ---------- step 3: ωn rescales time ---------- */
const trails3 = [];
function draw3() {
  const z = num('z3'), Wn = num('w3'), T = 12;
  $('z3v').textContent = f(z, 2); $('w3v').textContent = f(Wn, 1);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = timeFrame(ctx, W, H, { tMax: T });
  ctx.fillStyle = 'rgba(126,226,168,.12)'; ctx.fillRect(m.P.l, m.y(1.02), m.P.r - m.P.l, m.y(0.98) - m.y(1.02));
  stepInput(ctx, m, T);
  const tick = (ts, color, alpha) => { if (ts === null) return; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x(ts), m.y(1.12)); ctx.lineTo(m.x(ts), m.y(0.88)); ctx.stroke(); ctx.restore(); };
  trails3.filter(([tz, tw]) => tz !== z || tw !== Wn).forEach(([tz, tw], i) => {
    const { run: r, m: met } = run(tz, tw, T);
    curve(ctx, m, r.points, { color: C.muted, width: 1.6, alpha: 0.35 + 0.1 * i });
    tick(met.settling, C.muted, 0.7);
    if (met.settling !== null) label(ctx, 'ωn=' + f(tw, 1), m.x(met.settling), m.y(0.8), C.muted, 'center');
  });
  const { run: r, m: met } = run(z, Wn, T), fo = S.formulas(z, Wn);
  curve(ctx, m, r.points);
  tick(met.settling, C.green, 1);
  if (met.settling !== null) label(ctx, 'ωn=' + f(Wn, 1), m.x(met.settling), m.y(0.8), C.green, 'center');
  label(ctx, 'ζ=' + f(z, 2) + '  ωn=' + f(Wn, 1), m.P.r - 4, m.P.t + 12, C.cyan, 'right');
  $('r3').textContent = t('s3readout', { w: f(Wn, 1), ts: sec(met.settling), tsF: secF(fo.settling), po: f(met.overshoot, 1) });
}
function keep3() { const k = [num('z3'), num('w3')]; if (!trails3.some(v => v[0] === k[0] && v[1] === k[1])) { trails3.push(k); if (trails3.length > 5) trails3.shift(); } }

/* ---------- step 4: poles ---------- */
const trails4 = [];
function draw4() {
  const z = num('z4'), Wn = num('w4'), T = 10;
  $('z4v').textContent = f(z, 2); $('w4v').textContent = f(Wn, 1);
  let { ctx, W, H } = fitCanvas($('c4'));
  const pm = planeFrame(ctx, W, H, { reMin: -6, reMax: 1.5, imMax: 4.5 });
  // circle of radius ωn and the ray at angle θ
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(pm.ox, pm.oy, Wn * pm.sc, Math.PI / 2, Math.PI * 1.5); ctx.stroke(); ctx.restore();
  trails4.forEach(([tz, tw]) => S.poles(tz, tw).forEach(p => poleMark(ctx, pm, p, C.muted, 4, 0.5)));
  const ps = S.poles(z, Wn);
  if (z < 1) {
    const p = ps[0];
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pm.ox, pm.oy); ctx.lineTo(pm.x(p.re), pm.y(p.im)); ctx.stroke();
    const th = Math.acos(z), rr = 26; ctx.beginPath(); ctx.arc(pm.ox, pm.oy, rr, Math.PI, Math.PI + th, false); ctx.stroke(); ctx.restore();
    label(ctx, 'θ', pm.ox - rr - 12, pm.oy - 8, C.orange);
    ctx.save(); ctx.strokeStyle = C.green; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(pm.x(p.re), pm.y(p.im)); ctx.lineTo(pm.x(p.re), pm.oy); ctx.stroke(); ctx.restore();
    label(ctx, '−ζωn', pm.x(p.re), pm.oy + 14, C.green, 'center');
    label(ctx, 'ωd', pm.x(p.re) + 6, pm.y(p.im / 2), C.green);
  }
  ps.forEach(p => poleMark(ctx, pm, p));
  // right: response and its envelope
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const m = timeFrame(ctx, W, H, { tMax: T, yMax: 2 });
  stepInput(ctx, m, T);
  const { run: r } = run(z, Wn, T);
  if (z < 1) {
    const k = 1 / Math.sqrt(1 - z * z), env = s => r.points.map(p => ({ t: p.t, y: 1 + s * k * Math.exp(-z * Wn * p.t) }));
    curve(ctx, m, env(1), { color: C.green, width: 1.3, dash: [5, 5] });
    curve(ctx, m, env(-1), { color: C.green, width: 1.3, dash: [5, 5] });
  }
  curve(ctx, m, r.points);
  $('r4').textContent = z < 1
    ? t('s4readout', { re: f(ps[0].re, 2), im: f(ps[0].im, 2), w: f(Wn, 1), z: f(z, 2), sig: f(z * Wn, 2) })
    : t('s4readoutReal', { p1: f(ps[0].re, 2), p2: f(ps[1].re, 2), z: f(z, 2) });
}
function keep4() { const k = [num('z4'), num('w4')]; if (!trails4.some(v => v[0] === k[0] && v[1] === k[1])) { trails4.push(k); if (trails4.length > 8) trails4.shift(); } }

/* ---------- step 5: design challenge ---------- */
const ZETA10 = S.zetaForOvershoot(10);
function draw5() {
  const z = num('z5'), Wn = num('w5'), T = 6;
  $('z5v').textContent = f(z, 2); $('w5v').textContent = f(Wn, 1);
  const { run: r, m: met } = run(z, Wn, T);
  let { ctx, W, H } = fitCanvas($('c5'));
  const m = timeFrame(ctx, W, H, { tMax: T, yMax: 2 });
  ctx.fillStyle = 'rgba(126,226,168,.14)'; ctx.fillRect(m.x(2), m.y(1.02), m.P.r - m.x(2), m.y(0.98) - m.y(1.02));
  ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(m.P.l, m.y(1.1)); ctx.lineTo(m.P.r, m.y(1.1)); ctx.moveTo(m.x(2), m.P.t); ctx.lineTo(m.x(2), m.P.b); ctx.stroke(); ctx.restore();
  label(ctx, '1.10', m.P.r - 2, m.y(1.1) - 5, C.pink, 'right'); label(ctx, '2 s', m.x(2) + 4, m.P.t + 12, C.pink);
  stepInput(ctx, m, T);
  curve(ctx, m, r.points);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const pm = planeFrame(ctx, W, H, { reMin: -10, reMax: 1.5, imMax: 7 });
  const tanT = Math.tan(Math.acos(ZETA10));
  ctx.save(); ctx.beginPath(); ctx.rect(pm.P.l, pm.P.t, pm.P.r - pm.P.l, pm.P.b - pm.P.t); ctx.clip();
  ctx.fillStyle = 'rgba(126,226,168,.22)'; ctx.beginPath();
  ctx.moveTo(pm.x(-2), pm.y(2 * tanT)); ctx.lineTo(pm.x(-40), pm.y(40 * tanT)); ctx.lineTo(pm.x(-40), pm.y(-40 * tanT)); ctx.lineTo(pm.x(-2), pm.y(-2 * tanT)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.green; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(pm.ox, pm.oy); ctx.lineTo(pm.x(-40), pm.y(40 * tanT)); ctx.moveTo(pm.ox, pm.oy); ctx.lineTo(pm.x(-40), pm.y(-40 * tanT)); ctx.moveTo(pm.x(-2), pm.P.t); ctx.lineTo(pm.x(-2), pm.P.b); ctx.stroke();
  ctx.restore();
  label(ctx, 'ζωn = 2', pm.x(-2) + 4, pm.P.b - 6, C.green);
  S.poles(z, Wn).forEach(p => poleMark(ctx, pm, p));
  const poOk = met.overshoot <= 10, tsOk = met.settling !== null && met.settling <= 2;
  const mark = ok => `<span class="${ok ? 'ok' : 'bad'}">${t(ok ? 'pass' : 'fail')}</span>`;
  $('r5').innerHTML = t('s5readout', { po: f(met.overshoot, 1), poOk: mark(poOk), ts: sec(met.settling), tsOk: mark(tsOk) }) + (poOk && tsOk ? ' · ' + t('allPass') : '');
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }
window.refreshStepResponse = refresh;

function bind(id, draw, keep) {
  $(id).addEventListener('input', draw);
  if (keep) $(id).addEventListener('change', () => { keep(); draw(); });
}

function setup() {
  $('applyStep').addEventListener('click', animate0);
  bind('z1', draw1, keep1);
  $('clear1').addEventListener('click', () => { trails1.length = 0; draw1(); });
  ['z2', 'w2'].forEach(id => bind(id, draw2));
  ['z3', 'w3'].forEach(id => bind(id, draw3, keep3));
  $('clear3').addEventListener('click', () => { trails3.length = 0; draw3(); });
  ['z4', 'w4'].forEach(id => bind(id, draw4, keep4));
  $('clear4').addEventListener('click', () => { trails4.length = 0; draw4(); });
  ['z5', 'w5'].forEach(id => bind(id, draw5));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
  }), { rootMargin: '-25% 0px -60% 0px' });
  steps.forEach(s => io.observe(s));
  window.addEventListener('resize', refresh);
  document.addEventListener('visibilitychange', () => { if (document.hidden && s0.anim) { cancelAnimationFrame(s0.anim); s0.anim = null; s0.tShown = s0.T; draw0(); } });
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
