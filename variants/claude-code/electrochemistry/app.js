'use strict';
// Electrochemistry lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every current, voltage and amount comes from window.EC_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and electrode labels in fixed rows that shrink to fit; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EC_MODEL;
const t = (...a) => window.EC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621',
  e: '#ffd75e', cat: '#ff9a5c', an: '#7ee2a8', cu: '#c8743a', zn: '#b8c4d4', cuIon: '#4f8fe8', glass: '#5d7590', ghost: '#8696aa', ag: '#d9e2ec' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, trailing zeros trimmed only after a decimal point; −0 shown as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const par = v => (v < 0 ? '(' + fix(v, 2) + ')' : fix(v, 2));
const sig = v => (v > 0 && v < 1e-3 ? sci(v) : String(Number(v.toPrecision(3))));
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sci = v => { const e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); return `${m.toFixed(1)}×10${String(e).split('').map(c => SUP[c]).join('')}`; };

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

// Text that shrinks until it fits maxW (never overflows, never squeezed).
function label(ctx, text, X, Y, maxW, { size = 12, color = C.text, align = 'center', weight = 400 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, X, Y, maxW) => label(ctx, text, X, Y, maxW, { align: 'left', weight: 600 });

// A plot panel: title in its own row above, y ticks to the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 && o.zeroAxis ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    o.xTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), P.b + 15); });
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 13, W - 16);
  return { x, y, P };
}
// Choose x ticks that keep at least minPx between labels.
function ticks(min, max, px, minPx, steps) { let s = steps[steps.length - 1]; for (const q of steps) if (q / (max - min) * px >= minPx) { s = q; break; } const out = []; for (let v = Math.ceil(min / s - 1e-9) * s; v <= max + 1e-9; v += s) out.push(+v.toFixed(6)); return out; }
function dot(ctx, X, Y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); }
function plus(ctx, X, Y, r, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - r, Y); ctx.lineTo(X + r, Y); ctx.moveTo(X, Y - r); ctx.lineTo(X, Y + r); ctx.stroke(); ctx.restore(); }
function minus(ctx, X, Y, r, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - r, Y); ctx.lineTo(X + r, Y); ctx.stroke(); ctx.restore(); }
function arrowHead(ctx, X, Y, ang, col, s = 7) { ctx.save(); ctx.fillStyle = col; ctx.translate(X, Y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s, -s * 0.7); ctx.lineTo(-s, s * 0.7); ctx.closePath(); ctx.fill(); ctx.restore(); }

// Points evenly spaced along a polyline; offset in px (wraps around).
function along(path, gap, offset) {
  const segs = []; let L = 0;
  for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push([path[i - 1], path[i], L, d]); L += d; }
  const out = [], n = Math.max(1, Math.floor(L / gap));
  for (let k = 0; k < n; k++) {
    const s = (((k * L / n + offset) % L) + L) % L;
    const sg = segs.find(q => s >= q[2] && s <= q[2] + q[3]) || segs[segs.length - 1];
    const f = sg[3] ? (s - sg[2]) / sg[3] : 0;
    out.push([sg[0][0] + (sg[1][0] - sg[0][0]) * f, sg[0][1] + (sg[1][1] - sg[0][1]) * f]);
  }
  return out;
}
function strokePath(ctx, path, col, lw) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); path.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore(); }

/* ---------- two half-cells, wire, device, salt bridge ---------- */
// o: { top, h, bridge, wire, I (A; + = electrons Zn → Cu in the wire), clock (s), device: 'bulb'|'source', cu (0..1 Cu²⁺ tint),
//      left: [lines], right: [lines], charges: bool }
function drawCell(ctx, W, o) {
  const top = o.top, bw = Math.min(190, W * 0.34), cxL = W * 0.26, cxR = W * 0.74;
  const yWire = top + 20, yb = top + 88, yB = top + o.h - 16 - 16 * o.left.length;
  const eL = cxL - bw * 0.16, eR = cxR + bw * 0.16, eTop = top + 46, eBot = yB - 24;
  const legL = cxL + bw * 0.3, legR = cxR - bw * 0.3, yBr = yb - 22;
  // beakers + solutions
  [[cxL, 'rgba(184,196,212,0.16)'], [cxR, `rgba(79,143,232,${0.18 + 0.4 * (o.cu ?? 1)})`]].forEach(([cx, fill]) => {
    ctx.fillStyle = fill; ctx.fillRect(cx - bw / 2 + 2, yb + 14, bw - 4, yB - yb - 16);
    ctx.strokeStyle = C.glass; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - bw / 2, yb); ctx.lineTo(cx - bw / 2, yB); ctx.lineTo(cx + bw / 2, yB); ctx.lineTo(cx + bw / 2, yb); ctx.stroke();
  });
  // electrodes
  ctx.fillStyle = C.zn; ctx.fillRect(eL - 7, eTop, 14, eBot - eTop);
  ctx.fillStyle = C.cu; ctx.fillRect(eR - 7, eTop, 14, eBot - eTop);
  // salt bridge
  const bridgePath = [[legL, yb + 44], [legL, yBr], [legR, yBr], [legR, yb + 44]];
  if (o.bridge) { strokePath(ctx, bridgePath, '#3a4c63', 14); strokePath(ctx, bridgePath, '#1d2a3a', 9); }
  // wire + device
  const wirePath = [[eL, eTop], [eL, yWire], [cxR + bw * 0.16, yWire], [eR, eTop]];
  if (o.wire) {
    strokePath(ctx, [[eL, eTop], [eL, yWire], [W / 2 - 16, yWire]], '#8fa3ba', 2);
    strokePath(ctx, [[W / 2 + 16, yWire], [eR, yWire], [eR, eTop]], '#8fa3ba', 2);
    if (o.device === 'bulb') {
      const on = Math.abs(o.I) > 1e-9;
      if (on) { const g = ctx.createRadialGradient(W / 2, yWire, 2, W / 2, yWire, 34); g.addColorStop(0, 'rgba(255,215,94,0.75)'); g.addColorStop(1, 'rgba(255,215,94,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 34, yWire - 20, 68, 54); }
      ctx.fillStyle = on ? '#ffe9a8' : '#24303e'; ctx.strokeStyle = on ? C.e : '#8fa3ba'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, yWire, 13, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = on ? '#a07820' : '#8fa3ba'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(W / 2 - 16, yWire); ctx.lineTo(W / 2 - 6, yWire); ctx.lineTo(W / 2 - 3, yWire - 5); ctx.lineTo(W / 2, yWire + 5); ctx.lineTo(W / 2 + 3, yWire - 5); ctx.lineTo(W / 2 + 6, yWire); ctx.lineTo(W / 2 + 16, yWire); ctx.stroke();
    } else {
      // source: long plate (+) on the copper side, short plate (−) on the zinc side
      ctx.fillStyle = C.bg; ctx.fillRect(W / 2 - 16, yWire - 16, 32, 32);
      strokePath(ctx, [[W / 2 - 16, yWire], [W / 2 - 5, yWire]], '#8fa3ba', 2); strokePath(ctx, [[W / 2 + 5, yWire], [W / 2 + 16, yWire]], '#8fa3ba', 2);
      strokePath(ctx, [[W / 2 - 5, yWire - 7], [W / 2 - 5, yWire + 7]], C.text, 3);
      strokePath(ctx, [[W / 2 + 5, yWire - 14], [W / 2 + 5, yWire + 14]], C.text, 2);
      minus(ctx, W / 2 - 13, yWire - 10, 3.5, C.muted); plus(ctx, W / 2 + 13, yWire - 10, 3.5, C.muted);
    }
  }
  const run = Math.abs(o.I) > 1e-9 && o.bridge && o.wire;
  const dir = o.I >= 0 ? 1 : -1, speed = Math.min(150, 70 * Math.abs(o.I) / 0.11);
  // electrons on the wire
  if (o.wire) {
    if (run) {
      along(wirePath, 26, dir * speed * o.clock).forEach(([X, Y]) => { if (Math.abs(X - W / 2) > 18 || Math.abs(Y - yWire) > 3) dot(ctx, X, Y, 3.6, C.e); });
      if (reduceMotion()) { arrowHead(ctx, W * 0.36 + (dir > 0 ? 0 : 0), yWire, dir > 0 ? 0 : Math.PI, C.e); arrowHead(ctx, W * 0.64, yWire, dir > 0 ? 0 : Math.PI, C.e); }
    } else if (o.charges) {
      // a handful of electrons got across before the charges stopped them
      [0, 1, 2].forEach(k => dot(ctx, eR, eTop - 6 - k * 10, 3.6, C.e));
    }
  }
  // ions in the salt bridge: cations towards the side that receives electrons, anions the other way
  if (o.bridge) {
    const off = run ? speed * 0.5 * o.clock : 0;
    along(bridgePath, 30, dir * off).forEach(([X, Y]) => dot(ctx, X, Y, 3.2, C.cat));
    along(bridgePath, 30, 15 - dir * off).forEach(([X, Y]) => dot(ctx, X, Y, 3.2, C.an));
  }
  if (o.charges) {
    for (let k = 0; k < 4; k++) { plus(ctx, cxL + bw * 0.04 + (k % 2) * bw * 0.2, yb + 32 + Math.floor(k / 2) * 22, 5, C.cat); minus(ctx, cxR - bw * 0.36 + (k % 2) * bw * 0.2, yb + 32 + Math.floor(k / 2) * 22, 5, C.an); }
  }
  // solution formulae and the electrode labels (one row each, shrink to fit)
  const maxW = Math.min(bw + 16, W * 0.46);
  label(ctx, 'ZnSO₄', cxL + bw * 0.12, yB - 8, bw * 0.5, { size: 11, color: C.muted });
  label(ctx, 'CuSO₄', cxR - bw * 0.12, yB - 8, bw * 0.5, { size: 11, color: C.muted });
  o.left.forEach((s, i) => label(ctx, s, cxL, yB + 17 + 16 * i, maxW, { size: i ? 11.5 : 12.5, color: i ? C.muted : C.text, weight: i ? 400 : 600 }));
  o.right.forEach((s, i) => label(ctx, s, cxR, yB + 17 + 16 * i, maxW, { size: i ? 11.5 : 12.5, color: i ? C.muted : C.text, weight: i ? 400 : 600 }));
}

// Step 0, set-up A: zinc strip straight into copper sulfate.
function drawBeaker(ctx, W, H, clock) {
  const bw = Math.min(220, W * 0.5), cx = W / 2, yb = 96, yB = H - 50, eTop = 56, eBot = yB - 24;
  const grow = Math.min(1, clock / 12);
  ctx.fillStyle = `rgba(79,143,232,${0.58 - 0.25 * grow})`; ctx.fillRect(cx - bw / 2 + 2, yb + 14, bw - 4, yB - yb - 16);
  ctx.strokeStyle = C.glass; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - bw / 2, yb); ctx.lineTo(cx - bw / 2, yB); ctx.lineTo(cx + bw / 2, yB); ctx.lineTo(cx + bw / 2, yb); ctx.stroke();
  ctx.fillStyle = C.zn; ctx.fillRect(cx - 8, eTop, 16, eBot - eTop);
  // copper patches on the immersed part, more over time (deterministic positions)
  const n = Math.round(4 + 22 * grow);
  for (let k = 0; k < n; k++) { const Y = yb + 20 + ((k * 37) % Math.max(1, eBot - yb - 26)); const side = k % 2 ? 1 : -1; ctx.fillStyle = C.cu; ctx.beginPath(); ctx.arc(cx + side * 8, Y, 3.2 + (k % 3), 0, 7); ctx.fill(); }
  // short electron hops at the surface
  const ph = reduceMotion() ? 0.5 : (clock * 1.3) % 1;
  for (let k = 0; k < 5; k++) { const Y = yb + 30 + k * ((eBot - yb - 40) / 4), side = k % 2 ? 1 : -1; dot(ctx, cx + side * (10 + 16 * ph), Y, 3, C.e); }
  // thermometer: the energy ends up as heat
  const tx = cx + bw / 2 - 22, t0 = yb - 20, t1 = yB - 18;
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.strokeRect(tx - 4, t0, 8, t1 - t0);
  const lvl = 0.25 + 0.55 * grow; ctx.fillStyle = C.pink; ctx.fillRect(tx - 2, t1 - (t1 - t0) * lvl, 4, (t1 - t0) * lvl); dot(ctx, tx, t1 + 4, 6, C.pink);
  label(ctx, 'CuSO₄', cx - bw * 0.25, yB - 8, bw * 0.4, { size: 11, color: C.muted });
  label(ctx, t('elZn'), cx, yB + 18, W - 20, { size: 12.5, weight: 600 });
  label(ctx, t('roleIdle'), cx, yB + 34, W - 20, { size: 11.5, color: C.muted });
}

/* ---------- step 0 ---------- */
const s0 = { mode: 'bridge', clock: 0 };
function draw0() {
  ['m0a', 'm0b', 'm0c'].forEach((id, i) => $(id).setAttribute('aria-pressed', String(s0.mode === ['beaker', 'nobridge', 'bridge'][i])));
  const { ctx, W, H } = fitCanvas($('c0'));
  const st = M.setup(s0.mode);
  if (s0.mode === 'beaker') drawBeaker(ctx, W, H, s0.clock);
  else {
    const on = s0.mode === 'bridge';
    drawCell(ctx, W, { top: 8, h: H - 8, bridge: on, wire: true, I: st.I, clock: s0.clock, device: 'bulb', cu: 1, charges: !on,
      left: [t('elZn'), on ? t('roleNegOx') : t('roleIdle')], right: [t('elCu'), on ? t('rolePosRed') : t('roleIdle')] });
  }
  $('r0').textContent = s0.mode === 'beaker' ? t('r0a') : s0.mode === 'nobridge' ? t('r0b') : t('r0c', { I: fmt(st.I, 3), E: fix(M.E0D, 2), Rb: M.BULB, r: M.R_INT, N: sci(st.perSecond) });
}

/* ---------- step 1: potential ladder ---------- */
const s1 = { a: 'Zn', b: 'Cu', tried: ['Zn|Cu'] };
function buildPickers() {
  ['A', 'B'].forEach(side => {
    const row = $('pick' + side);
    M.ORDER.forEach(m => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.textContent = m; b.dataset.metal = m; b.dataset.step = '1'; b.id = `p${side}${m}`;
      b.addEventListener('click', () => { s1[side.toLowerCase()] = m; const key = [s1.a, s1.b].sort().join('|'); if (!s1.tried.includes(key)) s1.tried.push(key); draw1(); });
      row.appendChild(b);
    });
  });
}
function draw1() {
  M.ORDER.forEach(m => { $('pA' + m).setAttribute('aria-pressed', String(s1.a === m)); $('pB' + m).setAttribute('aria-pressed', String(s1.b === m)); });
  const c = M.cell(s1.a, s1.b);
  const { ctx, W, H } = fitCanvas($('c1'));
  const P = panel(ctx, W, { top: 30, bottom: H - 20, left: 46, right: 14, xMin: 0, xMax: 1, yMin: -2.6, yMax: 1.1, yTicks: [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1], yFmt: v => fix(v, 1), title: t('axisE') });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(P.P.l, P.y(0)); ctx.lineTo(P.P.r, P.y(0)); ctx.stroke(); ctx.restore();
  const dx = P.P.l + 26; let end = 0;
  ctx.font = '12px system-ui,sans-serif';
  const texts = M.ORDER.map(m => `${M.ION[m]}/${m}  ${M.METALS[m].E > 0 ? '+' : ''}${fix(M.METALS[m].E, 2)}`);
  texts.forEach(s => { end = Math.max(end, dx + 14 + ctx.measureText(s).width); });
  M.ORDER.forEach((m, i) => {
    const Y = P.y(M.METALS[m].E), isA = !c.same && m === c.anode, isC = !c.same && m === c.cathode, chosen = m === s1.a || m === s1.b;
    ctx.strokeStyle = chosen ? C.text : C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.P.l, Y); ctx.lineTo(dx, Y); ctx.stroke();
    dot(ctx, dx, Y, chosen ? 7 : 5, isA ? C.an : isC ? C.cat : chosen ? C.text : C.ghost);
    label(ctx, texts[i], dx + 14, Y + 4, Math.max(40, W - dx - 20), { align: 'left', color: chosen ? C.text : C.muted, weight: chosen ? 600 : 400 });
  });
  if (!c.same) {
    const ax = Math.min(W - 70, Math.max(end + 18, W * 0.55)), y0 = P.y(M.METALS[c.anode].E), y1 = P.y(M.METALS[c.cathode].E);
    ctx.save(); ctx.strokeStyle = C.e; ctx.lineWidth = 3; ctx.setLineDash([2, 0]);
    ctx.beginPath(); ctx.moveTo(ax, y0 - 2); ctx.lineTo(ax, y1 + 10); ctx.stroke(); ctx.restore();
    arrowHead(ctx, ax, y1 + 4, -Math.PI / 2, C.e, 8);
    ctx.save(); ctx.strokeStyle = 'rgba(255,215,94,0.35)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(dx + 8, y0); ctx.lineTo(ax - 4, y0); ctx.moveTo(dx + 8, y1); ctx.lineTo(ax - 4, y1); ctx.stroke(); ctx.restore();
    label(ctx, `${fix(c.E0, 2)} V`, ax + 8, (y0 + y1) / 2 + 4, W - ax - 12, { align: 'left', color: C.e, weight: 700 });
  }
  if (c.same) $('r1').textContent = t('r1same');
  else {
    let s = t('r1', { an: c.anode, ca: c.cathode, ox: c.oxHalf, red: c.redHalf, overall: c.overall, n: c.n, Ec: par(M.METALS[c.cathode].E), Ea: par(M.METALS[c.anode].E), E: fix(c.E0, 2), dG: fix(c.dG, 1) });
    if (c.pC > 1) s += t('r1note', { ion: M.ION[c.cathode], p: c.pC });
    else if (c.pA > 1) s += t('r1note', { ion: c.anode, p: c.pA });
    $('r1').textContent = s;
  }
  $('h1').textContent = t('h1', { list: s1.tried.map(k => { const [p, q] = k.split('|'), cc = M.cell(p, q); return `${p}–${q} ${fix(cc.E0, 2)} V`; }).join(' · ') });
}

/* ---------- step 2: Nernst ---------- */
const s2 = { tried: new Set(['0|0']) };
function draw2() {
  const lz = num('zn2'), lc = num('cu2'), zn = Math.pow(10, lz), cu = Math.pow(10, lc), r = M.nernst(zn, cu);
  $('zn2v').textContent = `${fix(lz, 1)} → ${sig(zn)} mol/L`; $('cu2v').textContent = `${fix(lc, 1)} → ${sig(cu)} mol/L`;
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: 104, left: 52, xMin: -3.25, xMax: 0, yMin: 0, yMax: 2, yTicks: [], xTicks: [-3, -2, -1, 0], xFmt: v => String(Math.pow(10, v)), title: t('c2top') });
  [[lz, C.zn, 'Zn²⁺', 1.45], [lc, C.cuIon, 'Cu²⁺', 0.55]].forEach(([v, col, name, row]) => {
    const Y = A.y(row); ctx.fillStyle = col; ctx.fillRect(A.P.l, Y - 11, A.x(v) - A.P.l, 22);
    label(ctx, name, A.P.l - 6, Y + 4, 44, { align: 'right', color: C.text, size: 12 });
  });
  const B = panel(ctx, W, { top: 156, bottom: H - 28, left: 52, xMin: -3, xMax: 3, yMin: 0.95, yMax: 1.25, yTicks: [1, 1.05, 1.1, 1.15, 1.2, 1.25], yFmt: v => fix(v, 2), xTicks: [-3, -2, -1, 0, 1, 2, 3], title: t('c2bot') });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(-3), B.y(M.E0D + 3 * M.SLOPE_D)); ctx.lineTo(B.x(3), B.y(M.E0D - 3 * M.SLOPE_D)); ctx.stroke();
  ctx.setLineDash([4, 4]); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.x(0), B.P.t); ctx.lineTo(B.x(0), B.P.b); ctx.stroke(); ctx.restore();
  s2.tried.forEach(k => { const [a, b] = k.split('|').map(Number); const q = M.nernst(Math.pow(10, a), Math.pow(10, b)); dot(ctx, B.x(q.logQ), B.y(q.E), 3.4, C.text); });
  dot(ctx, B.x(r.logQ), B.y(r.E), 6.5, C.orange);
  const d = (r.E - M.E0D) * 1000, cmp = Math.abs(d) < 0.05 ? t('cmpSame') : t(d > 0 ? 'cmpUp' : 'cmpDown', { d: fix(Math.abs(d), 1) });
  $('r2').textContent = t('r2', { zn: sig(zn), cu: sig(cu), Q: sig(r.Q), lq: fix(r.logQ, 1), lqp: r.logQ < -0.05 ? '(' + fix(r.logQ, 1) + ')' : fix(r.logQ, 1), E: fix(r.E, 3), cmp, lk: fix(M.DANIELL.logK, 1), lkr: fix(M.DANIELL.logK, 1) });
}

/* ---------- step 3: discharge ---------- */
const s3 = { run: null, shown: -1, ghost: null };
function newRun3() { s3.run = M.discharge(num('c03'), 1, num('rl3')); s3.shown = -1; }
function draw3() {
  $('c03v').textContent = fix(num('c03'), 1); $('rl3v').textContent = String(num('rl3'));
  if (!s3.run) newRun3();
  const run = s3.run, pts = run.pts;
  const { ctx, W, H } = fitCanvas($('c3'));
  const xT = ticks(0, 200, W - 60, 40, [25, 50, 100]);
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax: 200, yMin: 0, yMax: 2, yTicks: [0, 0.5, 1, 1.5, 2], yFmt: v => fix(v, 1), xTicks: xT, title: t('c3top') });
  const B = panel(ctx, W, { top: 200, bottom: H - 46, xMin: 0, xMax: 200, yMin: 0.5, yMax: 1.2, yTicks: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2], yFmt: v => fix(v, 1), xTicks: xT, title: t('c3bot') });
  label(ctx, t('axisQ'), (B.P.l + B.P.r) / 2, H - 10, W - 20, { size: 11, color: C.muted });
  const line = (P, arr, f, col, lw, dash) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); arr.forEach((p, i) => { const X = P.x(p.Q / 1000), Y = P.y(f(p)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore(); };
  if (s3.ghost) { line(B, s3.ghost.pts, p => p.E, C.ghost, 1.5, [5, 4]); line(A, s3.ghost.pts, p => s3.ghost.c0 - p.xi, C.ghost, 1.2, [5, 4]); }
  const shown = pts.slice(0, s3.shown + 1);
  if (shown.length > 1) {
    line(A, shown, p => run.c0 - p.xi, C.cuIon, 2.2); line(A, shown, p => run.z0 + p.xi, C.zn, 2.2);
    line(B, shown, p => p.E, C.cyan, 2.4); line(B, shown, p => p.U, C.green, 2);
  }
  const p = s3.shown >= 0 ? pts[s3.shown] : pts[0];
  dot(ctx, A.x(p.Q / 1000), A.y(run.c0 - p.xi), 4.5, C.cuIon); dot(ctx, A.x(p.Q / 1000), A.y(run.z0 + p.xi), 4.5, C.zn);
  dot(ctx, B.x(p.Q / 1000), B.y(p.E), 5, C.cyan); dot(ctx, B.x(p.Q / 1000), B.y(p.U), 4.5, C.green);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(A.x(run.Qmax / 1000), A.P.t); ctx.lineTo(A.x(run.Qmax / 1000), B.P.b); ctx.stroke(); ctx.restore();
  if (s3.shown < 0) { $('rd3').textContent = t('rd3idle', { E: fix(pts[0].E, 3), Qmax: fix(run.Qmax / 1000, 1) }); return; }
  let s = t('rd3', { p: fix(100 * p.f, p.f > 0.99 ? 4 : 1), Q: fix(p.Q / 1000, 1), Qmax: fix(run.Qmax / 1000, 1), t: fix(p.t / 3600, 0), cu: sig(run.c0 - p.xi), zn: fix(run.z0 + p.xi, 3), E: fix(p.E, 3), U: fix(p.U, 3), I: fix(p.I, 4), mZn: fix(p.mZn, 2), mCu: fix(p.mCu, 2) });
  if (s3.shown === pts.length - 1) s += t('rd3cliff', { cliff: fix(100 * M.cliffAt(run, 1.0), 1) });
  $('rd3').textContent = s;
}

/* ---------- step 4: push back ---------- */
const s4 = { tried: new Set([0.5]), clock: 0 };
function draw4() {
  const V = num('v4'), r = M.pushBack(V);
  $('v4v').textContent = fix(V, 2);
  const { ctx, W, H } = fitCanvas($('c4'));
  const g = r.mode === 'galvanic', e = r.mode === 'electrolytic';
  const left = [t('elZn'), g ? t('roleNegOx') : e ? t('roleCathodeIn') : t('roleIdle'), t('hookNeg')];
  const right = [t('elCu'), g ? t('rolePosRed') : e ? t('roleAnodeIn') : t('roleIdle'), t('hookPos')];
  drawCell(ctx, W, { top: 6, h: 272, bridge: true, wire: true, I: r.I, clock: s4.clock, device: 'source', cu: 1, charges: false, left, right });
  const B = panel(ctx, W, { top: 318, bottom: H - 36, left: 48, xMin: 0, xMax: 2, yMin: -0.6, yMax: 0.6, yTicks: [-0.5, -0.25, 0, 0.25, 0.5], zeroAxis: true, xTicks: ticks(0, 2, W - 62, 34, [0.25, 0.5, 1]), title: t('c4bot') });
  label(ctx, t('axisV'), (B.P.l + B.P.r) / 2, H - 6, W - 20, { size: 11, color: C.muted });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(M.pushBack(0).I)); ctx.lineTo(B.x(2), B.y(M.pushBack(2).I)); ctx.stroke();
  ctx.strokeStyle = C.axis; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.x(M.E0D), B.P.t); ctx.lineTo(B.x(M.E0D), B.P.b); ctx.stroke(); ctx.restore();
  label(ctx, `E = ${fix(M.E0D, 2)} V`, B.x(M.E0D) + 6, B.P.t + 12, B.P.r - B.x(M.E0D) - 8, { align: 'left', size: 11, color: C.muted });
  s4.tried.forEach(v => { if (Math.abs(v - V) > 1e-9) dot(ctx, B.x(v), B.y(M.pushBack(v).I), 3.4, C.text); });
  dot(ctx, B.x(V), B.y(r.I), 6.5, C.orange);
  const P = { V: fix(V, 2), I: fix(r.I, 3), Pc: fix(Math.abs(r.Pcell), 3), Ps: fix(Math.abs(r.Psrc), 3), H: fix(r.heat, 3) };
  $('r4').textContent = t(g ? 'r4g' : e ? 'r4e' : 'r4b', P);
}

/* ---------- step 5: Faraday ---------- */
const PCOL = { Cu: C.cu, Ag: C.ag, 'H₂': C.cyan, 'O₂': C.pink };
const s5 = { kind: 'Cu', runs: [], playing: false };
function draw5() {
  const I = num('i5'), tm = num('t5'), f = M.faraday(s5.kind, I, tm);
  $('i5v').textContent = fix(I, 1); $('t5v').textContent = String(tm);
  ['Cu', 'Ag', 'H2O'].forEach(k => $('k5' + k).setAttribute('aria-pressed', String(s5.kind === k)));
  const { ctx, W, H } = fitCanvas($('c5'));
  const P = panel(ctx, W, { top: 30, bottom: H - 46, xMin: 0, xMax: 60, yMin: 0, yMax: 80, yTicks: [0, 20, 40, 60, 80], xTicks: ticks(0, 60, W - 60, 34, [10, 20, 30]), title: t('c5t') });
  label(ctx, t('axisMin'), (P.P.l + P.P.r) / 2, H - 10, W - 20, { size: 11, color: C.muted });
  const seg = (kind, cur, t1, alpha, lw) => M.faraday(kind, cur, t1).items.forEach(it => { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = PCOL[it.id]; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(P.x(0), P.y(0)); ctx.lineTo(P.x(t1), P.y(it.mol * 1000)); ctx.stroke(); ctx.restore(); });
  s5.runs.forEach(rn => seg(rn.kind, rn.I, 60, 0.45, 1.6));
  seg(s5.kind, I, tm, 1, 2.6);
  f.items.forEach(it => dot(ctx, P.x(tm), P.y(it.mol * 1000), 5, PCOL[it.id]));
  const lg = [];
  M.PRODUCTS[s5.kind].forEach(p => lg.push(`<span class="lg"><span class="sw" style="background:${PCOL[p.id]};height:3px"></span><span>${t('lgRun', { id: p.id, I: fix(I, 1) })}</span></span>`));
  s5.runs.forEach(rn => M.PRODUCTS[rn.kind].forEach(p => lg.push(`<span class="lg" style="opacity:.6"><span class="sw" style="background:${PCOL[p.id]};height:2px"></span><span>${t('lgRun', { id: p.id, I: fix(rn.I, 1) })}</span></span>`)));
  $('lg5').innerHTML = lg.join('');
  let items = f.items.map(it => it.gas ? t('itemGas', { id: it.id, mmol: fix(it.mol * 1000, 2), mL: fix(it.mL, 1), z: it.z }) : t('itemMetal', { id: it.id, mmol: fix(it.mol * 1000, 2), g: fix(it.mass, 3), z: it.z })).join(' ');
  if (s5.kind === 'H2O' && tm > 0) items += ' ' + t('ratioNote', { r: fix(f.items[0].mL / f.items[1].mL, 2) });
  $('r5').textContent = t('r5', { I: fix(I, 1), t: tm, Q: fix(f.Q, 0), ne: fix(f.ne * 1000, 2), items });
}
function addRun5() { const I = num('i5'); if (!s5.runs.some(r => r.kind === s5.kind && Math.abs(r.I - I) < 1e-9)) { s5.runs.push({ kind: s5.kind, I }); if (s5.runs.length > 6) s5.runs.shift(); } }

/* ---------- animation ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

// Continuous electron flow for steps 0 and 4: runs only while that section is on screen and the page is visible.
const live = { s0: false, s4: false }; let loopId = null, last = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (live.s0) { s0.clock += dt; draw0(); }
  if (live.s4) { s4.clock += dt; draw4(); }
  loopId = (live.s0 || live.s4) && !document.hidden && !reduceMotion() ? requestAnimationFrame(loop) : null;
}
function kick() { if (loopId === null && (live.s0 || live.s4) && !document.hidden && !reduceMotion()) { last = performance.now(); loopId = requestAnimationFrame(loop); } }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildPickers();
  [['m0a', 'beaker'], ['m0b', 'nobridge'], ['m0c', 'bridge']].forEach(([id, m]) => $(id).addEventListener('click', () => { s0.mode = m; s0.clock = 0; draw0(); }));

  const quiz = (btn, name, right, fb, ok, no) => $(btn).addEventListener('click', () => {
    const c = document.querySelector(`input[name="${name}"]:checked`), good = !!c && c.value === right;
    $(fb).textContent = t(good ? ok : no); $(fb).style.color = good ? C.green : C.orange; $(fb).dataset.state = good ? 'correct' : 'wrong';
  });
  quiz('check1', 'q1', 'Fe', 'fb1', 'fb1ok', 'fb1no');
  quiz('check4', 'q4', 'Zn', 'fb4', 'fb4ok', 'fb4no');

  ['zn2', 'cu2'].forEach(id => $(id).addEventListener('input', () => { s2.tried.add(`${num('zn2')}|${num('cu2')}`); draw2(); }));
  $('clear2').addEventListener('click', () => { s2.tried = new Set([`${num('zn2')}|${num('cu2')}`]); draw2(); });

  const change3 = () => { stopAnim('s3'); if (s3.shown > 0) s3.ghost = s3.run; newRun3(); draw3(); };
  ['c03', 'rl3'].forEach(id => $(id).addEventListener('input', change3));
  $('play3').addEventListener('click', () => {
    if (s3.shown === s3.run.pts.length - 1) { s3.ghost = s3.run; newRun3(); }
    const pts = s3.run.pts, Qm = s3.run.Qmax, from = Math.max(0, s3.shown);
    const q0 = pts[from].Q;
    animate('s3', 6000 * (1 - q0 / Qm), p => {
      const target = q0 + p * (Qm - q0); let i = from; while (i + 1 < pts.length && pts[i + 1].Q <= target + 1e-6) i++;
      if (p >= 1) i = pts.length - 1; s3.shown = i; draw3();
    });
  });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.ghost = null; newRun3(); draw3(); });

  $('v4').addEventListener('input', () => { s4.tried.add(num('v4')); draw4(); });

  [['k5Cu', 'Cu'], ['k5Ag', 'Ag'], ['k5H2O', 'H2O']].forEach(([id, k]) => $(id).addEventListener('click', () => { stopAnim('s5'); s5.kind = k; draw5(); }));
  $('i5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('t5').addEventListener('input', () => { stopAnim('s5'); if (num('t5') === 60) addRun5(); draw5(); });
  $('play5').addEventListener('click', () => animate('s5', 4000, p => { $('t5').value = String(Math.round(60 * p)); draw5(); }, () => { addRun5(); draw5(); }));
  $('clear5').addEventListener('click', () => { s5.runs = []; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const vis = new IntersectionObserver(es => { es.forEach(e => { live[e.target.id === 'step0' ? 's0' : 's4'] = e.isIntersecting; }); kick(); }, { threshold: 0.05 });
    vis.observe($('step0')); vis.observe($('step4'));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); if (loopId !== null) { cancelAnimationFrame(loopId); loopId = null; } } else kick(); });
  window.refreshEchem = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
