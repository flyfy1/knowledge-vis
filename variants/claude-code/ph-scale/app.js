'use strict';
// pH scale lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every marker, bar, curve and readout comes from window.PH_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and a few short labels laid out in fixed rows; numbers live in the DOM readouts.
(function () {

const $ = id => document.getElementById(id);
const M = window.PH_MODEL;
const t = (...a) => window.PH_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', track: '#1b2836' };
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so toFixed(0) values such as 90 stay 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch] || ch).join('');
const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// 10^p written as "m × 10ⁿ" (m dropped when it is 1).
function pow10(p) {
  const e = Math.floor(p + 1e-9), m = Math.pow(10, p - e);
  const ms = m.toFixed(1);
  return (ms === '1.0' ? '' : ms + ' × ') + '10' + sup(e);
}
// A factor 10^d for the readouts: plain grouped number up to a million, power notation beyond.
function factor(d) {
  if (d > 6 + 1e-9) return pow10(d);
  const v = Math.pow(10, d);
  if (v < 10) return v.toFixed(1).replace(/\.0$/, '');
  const digits = Math.floor(Math.log10(v)) + 1, keep = Math.pow(10, Math.max(0, digits - 3));
  return group(Math.round(v / keep) * keep);
}
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

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
// Text that shrinks until it fits maxW (never overflows the canvas).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Horizontal pH axis 0–14 with integer ticks (every 2 when narrow).
function pHaxis(ctx, L, R, Y, { labels = true } = {}) {
  const x = v => L + v / 14 * (R - L), step = (R - L) / 14 < 19 ? 2 : 1;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.fillStyle = C.muted; ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  for (let v = 0; v <= 14; v++) {
    ctx.beginPath(); ctx.moveTo(x(v), Y); ctx.lineTo(x(v), Y + (v % step ? 3 : 5)); ctx.stroke();
    if (labels && v % step === 0) ctx.fillText(String(v), x(v), Y + 16);
  }
  ctx.restore(); return x;
}

/* ---------- step 0: one number for acidity ---------- */
function liquidName(id) { return id === 'custom' ? t('custom') : t('liq_' + id); }
function buildLiquids() {
  const sel = $('liq0');
  sel.innerHTML = '';
  [...M.LIQUIDS.map(l => l.id), 'custom'].forEach(id => { const o = document.createElement('option'); o.value = id; o.textContent = id === 'custom' ? t('custom') : `${liquidName(id)} · pH ${M.LIQUIDS.find(l => l.id === id).pH.toFixed(1)}`; sel.appendChild(o); });
}
const s0 = { id: 'lemon' };
function draw0() {
  const sel = $('liq0'), keep = s0.id; buildLiquids(); sel.value = keep;
  const pH = num('p0'), d = M.decimalOf(pH), cls = M.classify(pH);
  $('p0v').textContent = pH.toFixed(1);
  const { ctx, W } = fitCanvas($('c0'));
  fitText(ctx, t('c0a'), 8, 16, W - 16);
  const L = 18, R = W - 18, top = 58, bot = 82;
  for (let px = L; px <= R; px += 1) { ctx.fillStyle = rgb(M.universalColor((px - L) / (R - L) * 14)); ctx.fillRect(px, top, 1.5, bot - top); }
  const x = pHaxis(ctx, L, R, bot);
  // other liquids as small dots above the band
  M.LIQUIDS.forEach(l => { ctx.fillStyle = C.ghost; ctx.beginPath(); ctx.arc(x(l.pH), 50, 3, 0, 7); ctx.fill(); });
  // current marker
  const X = x(pH);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X, top - 4); ctx.lineTo(X, bot + 4); ctx.stroke();
  ctx.beginPath(); ctx.arc(X, 50, 6, 0, 7); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; const label = `${liquidName(s0.id)} · pH ${pH.toFixed(1)}`; const lw = Math.min(W - 16, ctx.measureText(label).width);
  ctx.restore(); fitText(ctx, label, Math.max(8, Math.min(W - 8 - lw, X - lw / 2)), 37, W - 16, { color: C.text });
  // zone labels on their own row
  const zy = 116;
  fitText(ctx, t('zoneAcid'), L, zy, (R - L) * 0.3, { size: 12, weight: 500, color: C.orange });
  fitText(ctx, t('zoneNeutral'), x(7), zy, (R - L) * 0.3, { size: 12, weight: 500, color: C.green, align: 'center' });
  fitText(ctx, t('zoneBase'), R, zy, (R - L) * 0.3, { size: 12, weight: 500, color: C.violet, align: 'right' });

  // decimal panel
  fitText(ctx, t('c0b'), 8, 146, W - 16);
  const [ip, fp = ''] = d.text.split('.');
  const slots = 17.5, bw = Math.min(30, (W - 16) / slots), by = 160, bh = Math.min(34, bw * 1.25);
  let cx = 8;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const box = (ch, hl, place) => {
    ctx.fillStyle = hl ? C.orange : C.track; ctx.fillRect(cx + 1, by, bw - 2, bh);
    ctx.fillStyle = hl ? '#1a1206' : C.text; ctx.font = `600 ${Math.max(10, bw * 0.62)}px ui-monospace,Menlo,monospace`; ctx.fillText(ch, cx + bw / 2, by + bh / 2 + 1);
    if (place) { ctx.fillStyle = hl ? C.orange : C.muted; ctx.font = `${Math.max(8.5, Math.min(11, bw * 0.45))}px system-ui,sans-serif`; ctx.fillText(String(place), cx + bw / 2, by + bh + 11); }
    cx += bw;
  };
  ip.split('').forEach(ch => box(ch, d.place === 0, 0));
  if (fp) { ctx.fillStyle = C.text; ctx.font = `700 ${Math.max(10, bw * 0.7)}px ui-monospace,Menlo,monospace`; ctx.fillText('.', cx + bw * 0.25, by + bh * 0.62); cx += bw * 0.5; }
  fp.split('').forEach((ch, i) => box(ch, i + 1 === d.place, i + 1));
  ctx.restore();
  $('r0').textContent = t('s0readout', { name: liquidName(s0.id), pH: pH.toFixed(1), cls: t('cls_' + cls), dec: d.text, place: d.place });
}

/* ---------- step 1: a ruler marked in factors ---------- */
function draw1() {
  const a = num('aA'), b = num('aB');
  $('aAv').textContent = a.toFixed(1); $('aBv').textContent = b.toFixed(1);
  const { ctx, W } = fitCanvas($('c1'));
  fitText(ctx, t('c1a'), 8, 16, W - 16);
  const L = 18, R = W - 18, Y = 92, x = pHaxis(ctx, L, R, Y);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, Y); ctx.lineTo(R, Y); ctx.stroke(); ctx.restore();
  const lo = Math.min(a, b), hi = Math.max(a, b), u = (R - L) / 14;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
  for (let p = lo; p < hi - 1e-9; p += 1) {
    const q = Math.min(hi, p + 1), half = (x(q) - x(p)) / 2, r = Math.min(half, 30);
    ctx.setLineDash(q - p < 0.999 ? [3, 3] : []);
    ctx.beginPath(); ctx.ellipse((x(p) + x(q)) / 2, Y - 2, half, r * 1.1, 0, Math.PI, 2 * Math.PI); ctx.stroke();
  }
  ctx.restore();
  const same = Math.abs(a - b) < 1e-9;
  const mark = (v, col, letter, dx) => {
    const X = x(v) + dx; ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#071018'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, X, Y + 0.5); ctx.restore();
  };
  mark(a, C.cyan, 'A', same ? -Math.min(9, u / 2) : 0); mark(b, C.orange, 'B', same ? Math.min(9, u / 2) : 0);

  fitText(ctx, t('c1b'), 8, 140, W - 16);
  const ha = M.hFromPH(a), hb = M.hFromPH(b), big = Math.max(ha, hb), BL = 30, BR = W - 14, full = BR - BL;
  const bar = (h, y, col, letter) => {
    ctx.fillStyle = C.track; ctx.fillRect(BL, y, full, 26);
    ctx.fillStyle = col; ctx.fillRect(BL, y, full * h / big, 26);
    fitText(ctx, letter, 10, y + 18, 16, { size: 13, weight: 700, color: col });
  };
  bar(ha, 152, C.cyan, 'A'); bar(hb, 198, C.orange, 'B');
  const d = Math.abs(a - b);
  if (same) { $('r1').textContent = t('s1same', { a: a.toFixed(1), ha: pow10(-a) }); return; }
  const more = a < b ? 'A' : 'B', less = a < b ? 'B' : 'A';
  const px = full * Math.pow(10, -d);
  $('r1').textContent = t('s1readout', { a: a.toFixed(1), b: b.toFixed(1), ha: pow10(-a), hb: pow10(-b), d: fmt(d, 1), more, less, r: factor(d), pct: '1/' + factor(d) + (px < 1 ? '（' + t('tiny') + '）' : '') });
}

/* ---------- step 2: indicator detective ---------- */
const s2 = { sample: 0, tested: [], revealed: false };
function buildIndButtons() {
  const box = $('indBtns'); box.innerHTML = '';
  M.INDICATORS.forEach(ind => {
    const b = document.createElement('button');
    b.className = 'btn ind'; b.type = 'button'; b.id = 'ind_' + ind.id; b.dataset.step = '2';
    b.setAttribute('aria-pressed', s2.tested.includes(ind.id) ? 'true' : 'false');
    const pH = M.MYSTERY[s2.sample];
    b.innerHTML = `<span class="drop" style="background:${s2.tested.includes(ind.id) ? rgb(M.indicatorColor(ind, pH)) : 'transparent'}"></span><span></span>`;
    b.lastChild.textContent = t('dropBtn', { name: t('ind_' + ind.id) });
    b.disabled = s2.tested.includes(ind.id);
    b.addEventListener('click', () => { if (!s2.tested.includes(ind.id)) s2.tested.push(ind.id); draw2(); });
    box.appendChild(b);
  });
}
function draw2() {
  buildIndButtons();
  const pH = M.MYSTERY[s2.sample];
  const { ctx, W } = fitCanvas($('c2'));
  fitText(ctx, t('c2title'), 8, 16, W - 16);
  const L = 18, R = W - 18, x = v => L + v / 14 * (R - L);
  const intervals = [];
  M.INDICATORS.forEach((ind, i) => {
    const y0 = 28 + i * 48, tested = s2.tested.includes(ind.id);
    fitText(ctx, t('c2row', { name: t('ind_' + ind.id), lo: ind.lo.toFixed(1), hi: ind.hi.toFixed(1) }), L, y0 + 12, R - L - 24, { size: 12, weight: 500, color: tested ? C.text : C.muted });
    for (let px = L; px <= R; px++) { ctx.fillStyle = rgb(M.indicatorColor(ind, (px - L) / (R - L) * 14)); ctx.fillRect(px, y0 + 18, 1.5, 16); }
    if (tested) {
      const res = M.indicatorResult(ind, pH), iv = M.indicatorInterval(ind, res); intervals.push(iv);
      ctx.fillStyle = 'rgba(13,22,33,0.78)';
      ctx.fillRect(L, y0 + 18, x(iv[0]) - L, 16); ctx.fillRect(x(iv[1]), y0 + 18, R - x(iv[1]) + 1.5, 16);
      ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(x(iv[0]), y0 + 17, x(iv[1]) - x(iv[0]), 18);
      ctx.fillStyle = rgb(M.indicatorColor(ind, pH)); ctx.beginPath(); ctx.arc(R - 7, y0 + 7, 6.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 1; ctx.stroke();
    }
  });
  const yc = 28 + 4 * 48;
  fitText(ctx, t('c2comb'), L, yc + 12, R - L, { size: 12, weight: 600, color: C.cyan });
  const [lo, hi] = M.combine(intervals);
  ctx.fillStyle = C.track; ctx.fillRect(L, yc + 18, R - L, 18);
  ctx.fillStyle = 'rgba(103,215,249,0.55)'; ctx.fillRect(x(lo), yc + 18, x(hi) - x(lo), 18);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.strokeRect(x(lo), yc + 18, x(hi) - x(lo), 18);
  pHaxis(ctx, L, R, yc + 40);
  if (s2.revealed) {
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i < 4; i++) { ctx.moveTo(x(pH), 28 + i * 48 + 15); ctx.lineTo(x(pH), 28 + i * 48 + 37); }
    ctx.moveTo(x(pH), yc + 15); ctx.lineTo(x(pH), yc + 40); ctx.stroke();
    ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(x(pH) - 6, yc + 40); ctx.lineTo(x(pH) + 6, yc + 40); ctx.lineTo(x(pH), yc + 33); ctx.fill(); ctx.restore();
  }
  const s = s2.sample + 1;
  let text;
  if (!s2.tested.length) text = t('s2none', { s });
  else {
    const list = s2.tested.map(id => { const ind = M.indicator(id); return t('s2seen', { name: t('ind_' + id), col: t('col_' + M.indicatorResult(ind, pH)) }); }).join(t('ind_mo') === '甲基橙' ? '、' : ', ');
    text = t('s2readout', { s, n: s2.tested.length, list, lo: lo.toFixed(1), hi: hi.toFixed(1), w: fmt(hi - lo, 1) });
  }
  if (s2.revealed) text += t('s2true', { p: pH.toFixed(1) });
  $('r2').textContent = text;
  $('reveal2').disabled = s2.revealed;
}

/* ---------- step 3: dilution towards 7 ---------- */
const s3 = { kind: 'acid', visited: new Set([0]) };
function volText(k) { const mL = Math.pow(10, k); return mL < 1000 ? group(mL) + ' mL' : group(mL / 1000) + ' L'; }
function draw3() {
  const k = num('k3'); $('k3v').textContent = String(k);
  $('startAcid').setAttribute('aria-pressed', s3.kind === 'acid'); $('startBase').setAttribute('aria-pressed', s3.kind === 'base');
  $('dilute3').disabled = k >= M.DIL.kMax;
  const { ctx, W, H } = fitCanvas($('c3'));
  fitText(ctx, t('c3title'), 8, 16, W - 16);
  const P = { l: 34, r: W - 14, t: 30, b: H - 30 };
  const x = v => P.l + (v + 0.5) / 11 * (P.r - P.l), y = v => P.b - v / 14 * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (let v = 0; v <= 14; v += 2) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  ctx.textAlign = 'center'; for (let v = 0; v <= 10; v++) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(String(v), x(v), P.b + 16); }
  ctx.strokeStyle = C.green; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(P.l, y(7)); ctx.lineTo(P.r, y(7)); ctx.stroke();
  // naive ±1 rule
  ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
  for (let q = 0; q <= 10; q++) { const v = M.dilution(s3.kind, q).naive; const Y = y(Math.max(0, Math.min(14, v))); if (!q) ctx.moveTo(x(q), Y); else ctx.lineTo(x(q), Y); }
  ctx.stroke(); ctx.setLineDash([]);
  // actual points visited so far (connected where consecutive)
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2;
  for (let q = 0; q < 10; q++) if (s3.visited.has(q) && s3.visited.has(q + 1)) { ctx.beginPath(); ctx.moveTo(x(q), y(M.dilution(s3.kind, q).pH)); ctx.lineTo(x(q + 1), y(M.dilution(s3.kind, q + 1).pH)); ctx.stroke(); }
  s3.visited.forEach(q => { ctx.fillStyle = q === k ? C.text : C.cyan; ctx.beginPath(); ctx.arc(x(q), y(M.dilution(s3.kind, q).pH), q === k ? 6 : 4, 0, 7); ctx.fill(); });
  ctx.restore();
  const r = M.dilution(s3.kind, k);
  let dg = 2; while (dg < 6 && r.pH.toFixed(dg) === (7).toFixed(dg)) dg++; // keep 'just below 7' visible
  let text = t('s3readout', { k, vol: volText(k), pH: r.pH.toFixed(dg), naive: r.naive.toFixed(2) });
  if (s3.kind === 'acid' ? r.naive > 7 : r.naive < 7) text += ' ' + t('s3cross', { kind: t('kind_' + s3.kind) });
  $('r3').textContent = text;
}

/* ---------- step 4: neutralisation, drop by drop ---------- */
const s4 = { visited: new Uint8Array(M.NEUT.maxDrops + 1) };
s4.visited[0] = 1;
function setDrops(n) { n = Math.max(0, Math.min(M.NEUT.maxDrops, n)); const from = num('d4'); for (let q = Math.min(from, n); q <= Math.max(from, n); q++) s4.visited[q] = 1; $('d4').value = n; draw4(); }
function draw4() {
  const n = num('d4'), r = M.neutral(n);
  $('d4v').textContent = String(n);
  const { ctx, W } = fitCanvas($('c4'));
  fitText(ctx, t('c4a'), 8, 16, W - 16);
  const P = { l: 34, r: W - 14, t: 30, b: 228 };
  const x = v => P.l + v / M.NEUT.maxDrops * (P.r - P.l), y = v => P.b - v / 14 * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (let v = 0; v <= 14; v += 2) { ctx.strokeStyle = v === 7 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
  const xs = (P.r - P.l) / 4 >= 34 ? 50 : 100;
  ctx.textAlign = 'center'; for (let v = 0; v <= M.NEUT.maxDrops; v += xs) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(String(v), x(v), P.b + 16); }
  ctx.strokeStyle = C.text; ctx.lineWidth = 2.2; ctx.beginPath(); let pen = false;
  for (let q = 0; q <= M.NEUT.maxDrops; q++) { if (!s4.visited[q]) { pen = false; continue; } const X = x(q), Y = y(M.neutral(q).pH); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
  ctx.stroke();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(x(n), y(r.pH), 6, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();

  fitText(ctx, t('c4b'), 8, 272, W - 16);
  const BL = 18, BR = W - 18, full = BR - BL;
  ctx.fillStyle = C.track; ctx.fillRect(BL, 282, full, 24); ctx.fillRect(BL, 314, full, 24);
  ctx.fillStyle = C.cyan; ctx.fillRect(BL, 282, full * r.left, 24);
  ctx.fillStyle = C.violet; ctx.fillRect(BL, 314, full * Math.min(1, r.excessOH / (M.NEUT.Va * M.NEUT.ca)), 24);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  [0, 50, 100].forEach((p, i) => { const X = BL + full * p / 100; ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X, 340); ctx.lineTo(X, 344); ctx.stroke(); ctx.textAlign = i === 0 ? 'left' : i === 2 ? 'right' : 'center'; ctx.fillText(p + '%', X, 357); });
  ctx.restore();

  let text;
  if (n === 0) text = t('s4start', { pH: r.pH.toFixed(2) });
  else if (n < M.NEUT.eqDrops) text = t('s4before', { n, V: r.Vb.toFixed(2), pct: fmt(r.removed * 100, 1), left: fmt(r.left * 100, 1), pH: r.pH.toFixed(2), rise: (r.pH - M.neutral(0).pH).toFixed(2), r: '+' + r.fromRemoval.toFixed(2), Vt: r.V.toFixed(2), v: '+' + r.fromVolume.toFixed(2) });
  else if (n === M.NEUT.eqDrops) text = t('s4eq', { n, pH: r.pH.toFixed(2) });
  else text = t('s4after', { n, ex: r.excessOH.toFixed(2), pH: r.pH.toFixed(2) });
  $('r4').textContent = text;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  buildLiquids(); $('liq0').value = s0.id;
  $('liq0').addEventListener('change', () => { s0.id = $('liq0').value; if (s0.id !== 'custom') $('p0').value = M.LIQUIDS.find(l => l.id === s0.id).pH; draw0(); });
  $('p0').addEventListener('input', () => { s0.id = 'custom'; draw0(); });
  ['aA', 'aB'].forEach(id => $(id).addEventListener('input', draw1));

  $('reveal2').addEventListener('click', () => { s2.revealed = true; draw2(); });
  $('new2').addEventListener('click', () => { s2.sample = (s2.sample + 1) % M.MYSTERY.length; s2.tested = []; s2.revealed = false; draw2(); });

  const restart3 = () => { s3.visited = new Set([0]); $('k3').value = 0; draw3(); };
  $('startAcid').addEventListener('click', () => { s3.kind = 'acid'; restart3(); });
  $('startBase').addEventListener('click', () => { s3.kind = 'base'; restart3(); });
  $('restart3').addEventListener('click', restart3);
  $('dilute3').addEventListener('click', () => { const k = Math.min(M.DIL.kMax, num('k3') + 1); $('k3').value = k; s3.visited.add(k); draw3(); });
  $('k3').addEventListener('input', () => { s3.visited.add(num('k3')); draw3(); });

  $('d4').addEventListener('input', () => { s4.visited[num('d4')] = 1; draw4(); });
  $('add1').addEventListener('click', () => setDrops(num('d4') + 1));
  $('add10').addEventListener('click', () => setDrops(num('d4') + 10));
  $('restart4').addEventListener('click', () => { s4.visited.fill(0); s4.visited[0] = 1; $('d4').value = 0; draw4(); });

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = ok ? t('correct', { r: group(M.ratio(5.6, 2.2)) }) : t('wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshPH = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = fb.dataset.state === 'correct' ? t('correct', { r: group(M.ratio(5.6, 2.2)) }) : t('wrong'); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
