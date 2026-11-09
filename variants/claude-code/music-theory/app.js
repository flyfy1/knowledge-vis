'use strict';
// Music theory lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every key, frequency, ratio, overtone, chord and voice movement comes from window.MT_MODEL (model.js).
// Canvas text is limited to key letters, degree numbers in their own circles, row/column labels and axis ticks.
(function () {

const $ = id => document.getElementById(id);
const M = window.MT_MODEL;
const t = (...a) => window.MT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', white: '#dfe6ee', black: '#1a2330' };
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { const s = v.toFixed(d).replace(/\.?0+$/, ''); return s.replace('-', '−'); };

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
function fitText(ctx, s, x, y, maxW, size = 13, weight = 600, color = C.text, align = 'center') {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(s).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(s, x, y); ctx.restore();
}

/* ---------- piano keyboard ----------
   lo, hi: MIDI numbers of the first and last (white) keys. mark: Map midi → { color, label } */
function keyboard(ctx, X0, Y0, w, h, lo, hi, mark = new Map(), opt = {}) {
  const whites = []; for (let m = lo; m <= hi; m++) if (!M.isBlack(m)) whites.push(m);
  const wW = w / whites.length, bw = wW * 0.62, bh = h * 0.6, pos = new Map();
  whites.forEach((m, i) => pos.set(m, { x: X0 + i * wW, cx: X0 + (i + 0.5) * wW, black: false }));
  for (let m = lo; m <= hi; m++) if (M.isBlack(m)) { const L = pos.get(m - 1); pos.set(m, { x: L.x + wW - bw / 2, cx: L.x + wW, black: true }); }
  whites.forEach(m => {
    const p = pos.get(m), mk = mark.get(m);
    ctx.fillStyle = mk ? mk.color : C.white; ctx.fillRect(p.x + 0.5, Y0, wW - 1, h);
    if (opt.dots && opt.dots.has(m)) { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(p.cx, Y0 + h - 22, 3.5, 0, 7); ctx.fill(); }
    const showName = wW >= 17 || M.pc(m) === 0;
    if (opt.names !== false && showName) fitText(ctx, M.pc(m) === 0 ? 'C' + M.octave(m) : M.SHARP[M.pc(m)], p.cx, Y0 + h - 9, wW - 3, 10, 600, '#3b4756');
  });
  for (let m = lo; m <= hi; m++) if (M.isBlack(m)) {
    const p = pos.get(m), mk = mark.get(m);
    ctx.fillStyle = mk ? mk.color : C.black; ctx.fillRect(p.x, Y0, bw, bh); ctx.strokeStyle = '#05080c'; ctx.lineWidth = 1; ctx.strokeRect(p.x + 0.5, Y0 + 0.5, bw - 1, bh - 1);
    if (opt.dots && opt.dots.has(m)) { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(p.cx, Y0 + bh - 8, 3.5, 0, 7); ctx.fill(); }
  }
  // labels inside circles (degree numbers etc.)
  mark.forEach((mk, m) => {
    if (!mk.label || !pos.has(m)) return;
    const p = pos.get(m), r = Math.min(8, (p.black ? bw : wW) / 2 - 1), y = p.black ? Y0 + bh - 12 : Y0 + h - 30;
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(p.cx, y, r, 0, 7); ctx.fill();
    fitText(ctx, mk.label, p.cx, y + 0.5, 2 * r - 2, 11, 700, mk.color);
  });
  return { pos, wW, bh };
}

/* ---------- step 0: the frequency ladder ---------- */
const s0 = { seen: new Set([0]) };
function draw0() {
  const n = num('n0'), m = 69 + n, f = M.freq(m);
  $('n0v').textContent = (n > 0 ? '+' : '') + fmt(n, 0);
  s0.seen.add(n);
  const { ctx, W, H } = fitCanvas($('c0'));
  const kb = keyboard(ctx, 10, 8, W - 20, 96, 57, 81, new Map([[m, { color: C.orange }]]));
  const P = { l: 46, r: W - 14, t: 132, b: H - 26 }, X = v => P.l + (v + 12) / 24 * (P.r - P.l), Y = v => P.b - (v - 180) / (900 - 180) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [220, 440, 660, 880].forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(P.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, Y(v) + 4); });
  ctx.textAlign = 'center'; [-12, -6, 0, 6, 12].forEach(v => ctx.fillText((v > 0 ? '+' : '') + fmt(v, 0), X(v), P.b + 16));
  ctx.textAlign = 'left'; ctx.fillText('Hz', 6, P.t + 4); ctx.restore();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 240; i++) { const v = -12 + i / 10, x = X(v), y = Y(M.freq(69 + v)); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  s0.seen.forEach(v => { if (v === n) return; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X(v), Y(M.freq(69 + v)), 3.5, 0, 7); ctx.fill(); });
  // guide from the key to its point
  const kx = kb.pos.get(m).cx;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(kx, 106); ctx.lineTo(X(n), Y(f)); ctx.stroke(); ctx.restore();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(X(n), Y(f), 6, 0, 7); ctx.fill();
  const prev = M.freq(m - 1);
  $('r0').textContent = t('s0readout', { name: M.nameSharp(m), dir: t(n >= 0 ? 'up' : 'down'), an: Math.abs(n), n, f: f.toFixed(2), dHz: (f - prev).toFixed(2), r: (f / prev).toFixed(4), oct: Math.abs(n) === 12 ? t('octNote', { x: fmt(f / 440, 2) }) : '' });
}

/* ---------- step 1: intervals ---------- */
function draw1() {
  const a = num('a1'), k = num('k1'), b = a + k;
  $('a1v').textContent = M.nameSharp(a); $('k1v').textContent = String(k);
  const { ctx, W, H } = fitCanvas($('c1'));
  const mark = new Map(); for (let m = a + 1; m < b; m++) mark.set(m, { color: '#9fb4cc' });
  mark.set(a, { color: C.orange }); if (k > 0) mark.set(b, { color: C.cyan });
  const kb = keyboard(ctx, 10, 46, W - 20, H - 54, 57, 81, mark);
  // the count as a chain of small hops above the keyboard
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5;
  for (let m = a; m < b; m++) { const x0 = kb.pos.get(m).cx, x1 = kb.pos.get(m + 1).cx; ctx.beginPath(); ctx.moveTo(x0, 40); ctx.quadraticCurveTo((x0 + x1) / 2, 22, x1, 40); ctx.stroke(); }
  [a, b].forEach((m, i) => { if (i && !k) return; ctx.fillStyle = i ? C.cyan : C.orange; ctx.beginPath(); ctx.arc(kb.pos.get(m).cx, 40, 4, 0, 7); ctx.fill(); });
  $('r1').textContent = t('s1readout', { a: M.nameSharp(a), k, b: M.nameSharp(b), iname: t('iv' + k), fa: M.freq(a).toFixed(2), fb: M.freq(b).toFixed(2), r: M.etRatio(k).toFixed(4) });
}

/* ---------- step 2: shared overtones ---------- */
const s2 = { tuning: 'just' };
function draw2() {
  const k = num('k2'), f1 = M.freq(57), H2 = M.harmonicPairs(k, f1, s2.tuning), f2 = H2.f2;
  $('k2v').textContent = String(k);
  $('just2').setAttribute('aria-pressed', String(s2.tuning === 'just')); $('et2').setAttribute('aria-pressed', String(s2.tuning === 'et'));
  const { ctx, W, H } = fitCanvas($('c2'));
  const P = { l: 46, r: W - 14 }, fmax = 10.5 * Math.max(f1, f2), X = v => P.l + v / fmax * (P.r - P.l), yL = 64, yU = 156, axisY = H - 34;
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillStyle = C.orange; ctx.fillText('A3', 8, yL); ctx.fillStyle = C.cyan; ctx.fillText(M.nameSharp(57 + k), 8, yU); ctx.restore();
  H2.pairs.forEach(p => { ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(p.fm), yL + 18); ctx.lineTo(X(p.fn), yU - 18); ctx.stroke(); });
  for (let m = 1; m <= 10; m++) { ctx.strokeStyle = C.orange; ctx.lineWidth = m === 1 ? 3 : 2; ctx.globalAlpha = 1 - (m - 1) * 0.06; ctx.beginPath(); ctx.moveTo(X(m * f1), yL - 18); ctx.lineTo(X(m * f1), yL + 18); ctx.stroke(); }
  for (let n = 1; n <= 10; n++) { ctx.strokeStyle = C.cyan; ctx.lineWidth = n === 1 ? 3 : 2; ctx.globalAlpha = 1 - (n - 1) * 0.06; ctx.beginPath(); ctx.moveTo(X(n * f2), yU - 18); ctx.lineTo(X(n * f2), yU + 18); ctx.stroke(); }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.l, axisY); ctx.lineTo(P.r, axisY); ctx.stroke();
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const step = fmax > 4000 ? 1000 : 500;
  for (let v = 0; v <= fmax; v += step) { ctx.beginPath(); ctx.moveTo(X(v), axisY); ctx.lineTo(X(v), axisY + 4); ctx.stroke(); ctx.fillText(String(v), X(v), axisY + 16); }
  ctx.textAlign = 'right'; ctx.fillText('Hz', P.r, axisY + 30 > H - 2 ? axisY - 8 : axisY + 30); ctx.restore();
  const [p, q] = M.JUST[k], c = M.centsOff(k);
  let beat;
  if (!H2.pairs.length) beat = t('beatNone');
  else if (s2.tuning === 'just') beat = t('beatJust');
  else { const lo = H2.pairs[0]; beat = t('beatET', { m: lo.m, n: lo.n, b: lo.beat.toFixed(2) }); }
  $('r2').textContent = t('s2readout', { iname: t('iv' + k), k, p, q, sh: M.sharedHarmonics(k), et: M.etRatio(k).toFixed(4), wide: t(c >= 0 ? 'wider' : 'narrower'), c: Math.abs(c).toFixed(2), beat });
}

/* ---------- step 3: scales ---------- */
const s3 = { mode: 'major' };
function draw3() {
  const tp = num('t3'), mode = s3.mode, sc = M.spell(tp, mode), tonicName = M.TONIC[mode][tp];
  $('t3v').textContent = tonicName;
  $('maj3').setAttribute('aria-pressed', String(mode === 'major')); $('min3').setAttribute('aria-pressed', String(mode === 'minor'));
  const midis = M.STEPS[mode].map(s => 60 + tp + s).concat([72 + tp]);
  const mark = new Map(midis.map((m, i) => [m, { color: C.orange, label: String(i < 7 ? i + 1 : 1) }]));
  const { ctx, W, H } = fitCanvas($('c3'));
  const kb = keyboard(ctx, 10, 50, W - 20, H - 58, 60, 83, mark);
  const pat = M.stepPattern(mode);
  for (let i = 0; i < 7; i++) {
    const x0 = kb.pos.get(midis[i]).cx, x1 = kb.pos.get(midis[i + 1]).cx, whole = pat[i] === 2;
    ctx.strokeStyle = whole ? C.cyan : C.pink; ctx.lineWidth = whole ? 2.5 : 3.5;
    ctx.beginPath(); ctx.moveTo(x0, 44); ctx.quadraticCurveTo((x0 + x1) / 2, whole ? 12 : 26, x1, 44); ctx.stroke();
  }
  const sig = M.signature(tp, mode);
  $('r3').textContent = t('s3readout', { tonic: tonicName, mode: t(mode), notes: sc.map(n => n.name).join(t('sep')), pattern: pat.map(s => t(s === 2 ? 'whole' : 'half')).join(' '), sig: sig.sharps ? t('sigSharp', { n: sig.sharps }) : sig.flats ? t('sigFlat', { n: sig.flats }) : t('sigNone') });
}

/* ---------- step 4: triads and function ---------- */
const FCOL = { T: C.green, S: C.cyan, D: C.pink };
function chordMidis(tp, deg) {
  const ch = M.triad(tp, deg), root = 55 + M.pc(ch.pcs[0] - 55);
  const out = [root]; for (let i = 1; i < 3; i++) { let m = out[i - 1] + 1; while (M.pc(m) !== ch.pcs[i]) m++; out.push(m); }
  return out;
}
function draw4() {
  const tp = num('t4'), d = num('d4') - 1, ch = M.triad(tp, d), I = M.triad(tp, 0);
  $('t4v').textContent = M.TONIC.major[tp]; $('d4v').textContent = `${d + 1} · ${ch.roman}`;
  const { ctx, W, H } = fitCanvas($('c4'));
  const dots = new Set(); for (let m = 48; m <= 83; m++) if (I.pcs.includes(M.pc(m))) dots.add(m);
  keyboard(ctx, 10, 8, W - 20, 120, 48, 83, new Map(chordMidis(tp, d).map(m => [m, { color: C.orange }])), { dots });
  const bw = (W - 20) / 7, y0 = 150, bh = H - y0 - 10;
  for (let i = 0; i < 7; i++) {
    const c = M.triad(tp, i), x = 10 + i * bw, on = i === d;
    ctx.globalAlpha = on ? 0.45 : 0.18; ctx.fillStyle = FCOL[c.func]; ctx.fillRect(x + 3, y0, bw - 6, bh); ctx.globalAlpha = 1;
    ctx.strokeStyle = on ? C.text : FCOL[c.func]; ctx.lineWidth = on ? 2.5 : 1; ctx.strokeRect(x + 3.5, y0 + 0.5, bw - 7, bh - 1);
    fitText(ctx, c.roman, x + bw / 2, y0 + bh * 0.38, bw - 12, 16, 700, C.text);
    fitText(ctx, c.func, x + bw / 2, y0 + bh * 0.78, bw - 12, 11, 700, FCOL[c.func]);
  }
  const names = ch.notes.map(n => n.name), lt = ch.notes.find(n => n.pc === (tp + 11) % 12);
  const tt = M.hasTritone(ch) ? (() => { const a = ch.notes.find(x => ch.notes.some(y => M.pc(y.pc - x.pc) === 6)); const b = ch.notes.find(y => M.pc(y.pc - a.pc) === 6); return t('ttYes', { a: a.name, b: b.name }); })() : t('ttNo');
  $('r4').textContent = t('s4readout', { key: M.TONIC.major[tp], d: d + 1, roman: ch.roman, notes: names.join('–'), lo: ch.lower, up: ch.upper, quality: t(ch.quality), func: t('f' + ch.func), common: M.commonTones(ch, I), lt: lt ? t('ltYes', { x: lt.name }) : t('ltNo'), tt });
}

/* ---------- step 5: cadences and voice leading ---------- */
const PRESET5 = { auth5: [5, 1], plag5: [4, 1], half5: [2, 5], dec5: [5, 6] };
const CAD = { authentic: 'tAuthentic', leading: 'tLeading', plagal: 'tPlagal', half: 'tHalf', deceptive: 'tDeceptive', none: 'tNone' };
function draw5() {
  const tp = num('t5'), d1 = num('p5') - 1, d2 = num('q5') - 1, pr = M.progression(tp, d1, d2), sc = M.spell(tp, 'major');
  const nm = m => sc.find(n => n.pc === M.pc(m)).name;
  $('t5v').textContent = M.TONIC.major[tp]; $('p5v').textContent = `${d1 + 1} · ${pr.c1.roman}`; $('q5v').textContent = `${d2 + 1} · ${pr.c2.roman}`;
  Object.entries(PRESET5).forEach(([id, [a, b]]) => $(id).setAttribute('aria-pressed', String(a === d1 + 1 && b === d2 + 1)));
  const { ctx, W, H } = fitCanvas($('c5'));
  const all = pr.from.concat(pr.to), mid = (Math.min(...all) + Math.max(...all)) / 2, span = Math.max(20, Math.max(...all) - Math.min(...all) + 6);
  const x1 = Math.round(W * 0.32), x2 = Math.round(W * 0.68), lo = Math.floor(mid - span / 2), hi = Math.ceil(mid + span / 2), Y = m => 34 + (hi - m) / (hi - lo) * (H - 50);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let m = lo; m <= hi; m++) if (M.pc(m) === 0) { ctx.beginPath(); ctx.moveTo(10, Y(m)); ctx.lineTo(W - 10, Y(m)); ctx.stroke(); }
  fitText(ctx, pr.c1.roman, x1, 14, 60, 15, 700, C.text); fitText(ctx, pr.c2.roman, x2, 14, 60, 15, 700, C.text);
  const ltPc = (tp + 11) % 12, faPc = (tp + 5) % 12;
  pr.from.forEach((m, i) => {
    const to = pr.to[i], col = M.pc(m) === ltPc ? C.orange : M.pc(m) === faPc ? C.cyan : C.text;
    ctx.strokeStyle = col; ctx.lineWidth = col === C.text ? 2 : 3.5; ctx.beginPath(); ctx.moveTo(x1, Y(m)); ctx.lineTo(x2, Y(to)); ctx.stroke();
    [[x1, m], [x2, to]].forEach(([x, v]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, Y(v), 6, 0, 7); ctx.fill(); });
    fitText(ctx, nm(m), x1 - 12, Y(m), x1 - 24, 13, 700, col, 'right');
    fitText(ctx, nm(to), x2 + 12, Y(to), W - x2 - 24, 13, 700, col, 'left');
    const mv = pr.moves[i], lx = x1 + (x2 - x1) * 0.5, ly = Y(m) + (Y(to) - Y(m)) * 0.5 - 11;
    fitText(ctx, mv > 0 ? '+' + mv : mv < 0 ? '−' + (-mv) : '0', lx, ly, 34, 12, 700, col);
  });
  const ltV = pr.from.findIndex(m => M.pc(m) === ltPc), faV = pr.from.findIndex(m => M.pc(m) === faPc);
  $('r5').textContent = t('s5readout', {
    key: M.TONIC.major[tp], r1: pr.c1.roman, n1: pr.c1.notes.map(n => n.name).join('–'), r2: pr.c2.roman, n2: pr.c2.notes.map(n => n.name).join('–'),
    type: t(CAD[pr.type]), total: pr.total, common: pr.common,
    lt: pr.ltResolves ? t('ltRes', { x: nm(pr.from[ltV]), y: nm(pr.to[ltV]) }) : '', fa: pr.faResolves ? t('faRes', { x: nm(pr.from[faV]), y: nm(pr.to[faV]) }) : ''
  });
}

/* ---------- step 6: quiz ---------- */
const s6 = { seed: 1, state: 'open', choice: null };
const CADOPT = { authentic: 'oAuthentic', plagal: 'oPlagal', half: 'oHalf', deceptive: 'oDeceptive' };
function qParts(q) {
  if (q.kind === 'qInt') return { text: t('qInt', { a: M.nameSharp(q.a), b: M.nameSharp(q.b) }), opts: q.options.map(k => [String(k), t('optSemis', { k })]), why: t('whyInt', { k: q.answer, iname: t('iv' + q.answer) }) };
  if (q.kind === 'qTri') { const c = M.triad(q.tonic, q.deg); return { text: t('qTri', { key: M.TONIC.major[q.tonic], d: q.deg + 1 }), opts: q.options.map(o => [o, t(o)]), why: t('whyTri', { notes: c.notes.map(n => n.name).join('–'), lo: c.lower, up: c.upper, q: t(c.quality), roman: c.roman }) }; }
  const a = M.triad(q.tonic, q.d1), b = M.triad(q.tonic, q.d2);
  return { text: t('qCad', { key: M.TONIC.major[q.tonic], n1: a.notes.map(n => n.name).join('–'), n2: b.notes.map(n => n.name).join('–') }), opts: q.options.map(o => [o, t(CADOPT[o])]), why: t('whyCad', { r1: a.roman, r2: b.roman, t: t(CADOPT[q.answer]) }) };
}
function draw6() {
  const q = M.question(s6.seed), P = qParts(q), box = $('opts6'), fb = $('fb6');
  $('q6').textContent = P.text;
  box.innerHTML = P.opts.map(([v, label]) => `<label><input type="radio" name="q6" value="${v}" data-step="6"${s6.choice === v ? ' checked' : ''}><span>${label}</span></label>`).join('');
  box.querySelectorAll('input').forEach(x => x.addEventListener('change', () => { s6.choice = x.value; if (s6.state !== 'shown') { s6.state = 'open'; fb.textContent = ''; } }));
  if (s6.state === 'open') { fb.textContent = ''; delete fb.dataset.state; return; }
  if (s6.state === 'empty') { fb.textContent = t('qEmpty'); fb.style.color = C.orange; }
  else if (s6.state === 'right') { fb.textContent = t('qRight', { why: P.why }); fb.style.color = C.green; }
  else if (s6.state === 'wrong') { fb.textContent = t('qWrong'); fb.style.color = C.orange; }
  else { fb.textContent = t('qShown', { why: P.why }); fb.style.color = C.cyan; }
  fb.dataset.state = s6.state;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('n0').addEventListener('input', draw0);
  ['a1', 'k1'].forEach(id => $(id).addEventListener('input', draw1));
  $('k2').addEventListener('input', draw2);
  $('just2').addEventListener('click', () => { s2.tuning = 'just'; draw2(); });
  $('et2').addEventListener('click', () => { s2.tuning = 'et'; draw2(); });
  $('t3').addEventListener('input', draw3);
  $('maj3').addEventListener('click', () => { s3.mode = 'major'; draw3(); });
  $('min3').addEventListener('click', () => { s3.mode = 'minor'; draw3(); });
  ['t4', 'd4'].forEach(id => $(id).addEventListener('input', draw4));
  ['t5', 'p5', 'q5'].forEach(id => $(id).addEventListener('input', draw5));
  Object.entries(PRESET5).forEach(([id, [a, b]]) => $(id).addEventListener('click', () => { $('p5').value = String(a); $('q5').value = String(b); draw5(); }));
  $('check6').addEventListener('click', () => {
    const q = M.question(s6.seed);
    s6.state = s6.choice === null ? 'empty' : s6.choice === String(q.answer) ? 'right' : 'wrong'; draw6();
  });
  $('show6').addEventListener('click', () => { s6.state = 'shown'; draw6(); });
  $('new6').addEventListener('click', () => { s6.seed += 1; s6.state = 'open'; s6.choice = null; draw6(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshMT = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
