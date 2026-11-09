'use strict';
// Music theory (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const Z = STRINGS.zh, E = STRINGS.en;

// ---- step 0: equal temperament ----
near(M.freq(69), 440, 1e-12, 'A4 = 440'); near(M.freq(81), 880, 1e-9, 'A5 = 880'); near(M.freq(57), 220, 1e-9, 'A3 = 220');
for (let n = -12; n <= 12; n++) { near(M.freq(69 + n) / M.freq(68 + n), 1.0594630943592953, 1e-12, 'every semitone ×2^(1/12)'); ok((M.freq(69 + n) / M.freq(68 + n)).toFixed(4) === '1.0595', 'readout ratio 1.0595'); }
// s0hint: "Hz above" grows from about 12 Hz to about 49 Hz across the slider
ok(Math.round(M.freq(57) - M.freq(56)) === 12 && Math.round(M.freq(81) - M.freq(80)) === 49, 'Hz step 12 → 49');
for (let n = -11; n <= 12; n++) ok(M.freq(69 + n) - M.freq(68 + n) > M.freq(68 + n) - M.freq(67 + n), 'Hz step strictly grows');
eq(M.nameSharp(60), 'C4', 'C4 = MIDI 60'); eq(M.nameSharp(69), 'A4', 'A4');

// ---- step 1: intervals ----
for (let a = 57; a <= 69; a++) for (let k = 0; k <= 12; k++) near(M.freq(a + k) / M.freq(a), M.etRatio(k), 1e-12, 'ratio depends only on k');
ok(M.etRatio(7).toFixed(4) === '1.4983', 's1hint: fifth ratio 1.4983');
near(M.etRatio(6), Math.SQRT2, 1e-12, 'k = 6 is half an octave (√2)');
ok(Z.iv4.includes('大三度') && E.iv4 === 'major third' && Z.iv3.includes('小三度'), 'major third 4, minor third 3 (s1e)');

// ---- step 2: overtones ----
const JUSTCHECK = [[1, 1], [16, 15], [9, 8], [6, 5], [5, 4], [4, 3], [45, 32], [3, 2], [8, 5], [5, 3], [9, 5], [15, 8], [2, 1]];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
for (let k = 0; k <= 12; k++) {
  const [p, q] = M.JUST[k]; eq([p, q], JUSTCHECK[k], 'just ratio ' + k); ok(gcd(p, q) === 1, 'lowest terms');
  ok(Math.abs(M.centsOff(k)) < 20, 'tempered within 20 cents of just: ' + k);
  ok(M.sharedHarmonics(k) === Math.floor(10 / Math.max(p, q)), 'shared = ⌊10/max(p,q)⌋ (formula) ' + k);
  const J = M.harmonicPairs(k, 220, 'just');
  ok(J.pairs.length === M.sharedHarmonics(k), 'picture pairs = count ' + k);
  J.pairs.forEach(x => near(x.beat, 0, 1e-9, 'just pairs coincide'));
  const T = M.harmonicPairs(k, 220, 'et');
  T.pairs.forEach((x, i) => { ok(x.m * q === x.n * p, 'pair indices'); if (i) ok(x.fm > T.pairs[i - 1].fm, 'pairs sorted, first is lowest'); });
}
eq([12, 7, 5, 4, 1, 6].map(k => M.sharedHarmonics(k)), [5, 3, 2, 2, 0, 0], 's2hint counts: octave 5, fifth 3, fourth/M3 2, m2/tritone 0');
ok(Math.round(Math.abs(M.centsOff(7))) === 2 && M.centsOff(7) < 0, 'fifth 2 cents narrow');
ok(Math.round(M.centsOff(4)) === 14 && M.centsOff(4) > 0, 'major third ~14 cents wide');
ok(M.harmonicPairs(7, 220, 'et').pairs[0].beat.toFixed(1) === '0.7', 'fifth on A3 beats about 0.7 / s');
ok(M.harmonicPairs(7, 220, 'et').pairs[0].m === 3 && M.harmonicPairs(7, 220, 'et').pairs[0].n === 2, 'fifth: 3rd of lower meets 2nd of upper');
ok(10.5 * M.freq(57 + 12) < 5000, 'overtone axis fits ticks every 1000 Hz');

// ---- step 3: scales ----
eq(M.stepPattern('major'), [2, 2, 1, 2, 2, 2, 1], 'major W W H W W W H'); eq(M.stepPattern('minor'), [2, 1, 2, 2, 1, 2, 2], 'minor W H W W H W W');
for (const mode of ['major', 'minor']) for (let tp = 0; tp < 12; tp++) {
  const sc = M.spell(tp, mode);
  eq(new Set(sc.map(n => n.name[0])).size, 7, `${mode} ${tp}: each letter once`);
  ok(sc.every(n => Math.abs(n.acc) <= 1), `${mode} ${tp}: no double accidentals`);
  ok(sc.every(n => n.pc === (tp + M.STEPS[mode][sc.indexOf(n)]) % 12), 'pitch classes follow the steps');
  const s = M.signature(tp, mode); ok(!(s.sharps && s.flats), 'signature uses one kind of accidental');
  ok(60 + tp + 12 <= 83, 'scale fits the C4–B5 keyboard');
}
eq(M.spell(0, 'major').map(n => n.name), ['C', 'D', 'E', 'F', 'G', 'A', 'B'], 'C major all white');
eq([7, 2, 9].map(tp => M.signature(tp, 'major').sharps), [1, 2, 3], 's3hint: G, D, A add one sharp each');
ok(M.signature(5, 'major').flats === 1 && M.spell(5, 'major').some(n => n.name === 'B♭'), 's3hint/s3e: F major one flat, B♭');
eq(M.spell(9, 'minor').map(n => n.pc).sort((a, b) => a - b), M.spell(0, 'major').map(n => n.pc).sort((a, b) => a - b), 'A minor = C major notes');
ok(M.spell(9, 'minor').every(n => n.acc === 0), 'A minor white keys');
for (let tp = 0; tp < 12; tp++) ok(M.pc(M.spell(tp, 'major')[6].pc + 1) === tp, 'leading tone a semitone under the tonic');

// ---- step 4: triads ----
for (let tp = 0; tp < 12; tp++) {
  eq([0, 1, 2, 3, 4, 5, 6].map(d => M.triad(tp, d).quality), ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'], 'qualities fixed in every key (s4hint) ' + tp);
  const I = M.triad(tp, 0);
  eq([0, 1, 2, 3, 4, 5, 6].map(d => M.commonTones(M.triad(tp, d), I)), [3, 0, 2, 1, 1, 2, 0], 'common tones with I');
  [0, 2, 5].forEach(d => ok(M.commonTones(M.triad(tp, d), I) >= 2 && M.triad(tp, d).func === 'T', 'T shares 2 or 3 notes (s4e)'));
  [1, 3].forEach(d => ok(M.triad(tp, d).pcs.includes((tp + 5) % 12) && M.triad(tp, d).func === 'S', 'S contains degree 4'));
  [4, 6].forEach(d => ok(M.hasLeadingTone(tp, M.triad(tp, d)) && M.triad(tp, d).func === 'D', 'D contains the leading tone'));
  ok(M.hasTritone(M.triad(tp, 6)) && !M.hasTritone(M.triad(tp, 4)), 'vii° has the tritone, V does not (s4e)');
  [0, 1, 2, 3, 5].forEach(d => ok(!M.hasLeadingTone(tp, M.triad(tp, d)) || d === 2, 'only iii, V, vii° hold the leading tone'));
  for (let d = 0; d < 7; d++) { const r = 55 + M.pc(M.triad(tp, d).pcs[0] - 55); ok(r >= 55 && r + 7 <= 83, 'chord fits the C3–B5 keyboard'); }
}
eq(M.ROMAN, ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], 'roman numerals');

// ---- step 5: cadences ----
const PRE = { auth5: [5, 1, 'authentic'], plag5: [4, 1, 'plagal'], half5: [2, 5, 'half'], dec5: [5, 6, 'deceptive'] };
for (let tp = 0; tp < 12; tp++) {
  for (const [, [a, b, type]] of Object.entries(PRE)) ok(M.progression(tp, a - 1, b - 1).type === type, 'preset type ' + type);
  const auth = M.progression(tp, 4, 0), dec = M.progression(tp, 4, 5), plag = M.progression(tp, 3, 0);
  ok(auth.ltResolves && auth.common === 1 && auth.moves.includes(0) && auth.moves.includes(1), 'V→I: one voice held, leading tone +1 (s5hint)');
  ok(dec.ltResolves && dec.type === 'deceptive', 'V→vi: leading tone still rises (s5hint)');
  ok(plag.faResolves, 'IV→I: degree 4 falls to 3');
  for (let a = 0; a < 7; a++) for (let b = 0; b < 7; b++) {
    const p = M.progression(tp, a, b);
    eq([...p.to].map(M.pc).sort((x, y) => x - y), [...p.c2.pcs].sort((x, y) => x - y), 'voices land on the next chord');
    ok(p.moves.every(v => Math.abs(v) <= 6), 'each voice moves to the nearest octave');
    // brute force: no assignment with a smaller total
    let best = Infinity; const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    for (const P of perms) for (let mask = 0; mask < 27; mask++) { const offs = [mask % 3, Math.floor(mask / 3) % 3, Math.floor(mask / 9)].map(o => (o - 1) * 12); const to = p.from.map((m, i) => { let d = M.pc(p.c2.pcs[P[i]] - m); return m + d + offs[i]; }); if (new Set(to).size === 3) best = Math.min(best, to.reduce((s, m, i) => s + Math.abs(m - p.from[i]), 0)); }
    ok(p.total === best, `minimal total motion ${a}->${b}`);
    ok(Math.min(...p.from, ...p.to) >= 48 && Math.max(...p.from, ...p.to) <= 80, 'voices inside the drawn range');
  }
}

// ---- step 6: quiz ----
for (let s = 1; s <= 300; s++) {
  const q = M.question(s);
  ok(q.options.map(String).includes(String(q.answer)), 'answer among options');
  if (q.kind === 'qInt') ok(q.b - q.a === q.answer && q.options.length === 4 && new Set(q.options).size === 4, 'qInt');
  if (q.kind === 'qTri') ok(M.triad(q.tonic, q.deg).quality === q.answer, 'qTri');
  if (q.kind === 'qCad') ok(['authentic', 'plagal', 'half', 'deceptive'].includes(q.answer), 'qCad uses listed cadences');
}

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s0lgCurve']); // formula only
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(Z.s2hint.includes('2 音分') && Z.s2hint.includes('0.7') && Z.s2hint.includes('14 音分') && E.s2hint.includes('2 cents') && E.s2hint.includes('14 cents'), 'quoted cents/beats');
ok(Z.s1hint.includes('1.4983') && E.s1hint.includes('1.4983'), 'quoted fifth ratio');

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (let k = 0; k <= 12; k++) ok(Z['iv' + k] && E['iv' + k], 'interval name ' + k);
for (const k of ['maj', 'min', 'dim', 'fT', 'fS', 'fD', 'tAuthentic', 'tLeading', 'tPlagal', 'tHalf', 'tDeceptive', 'tNone', 'oAuthentic', 'oPlagal', 'oHalf', 'oDeceptive', 'major', 'minor', 'whole', 'half', 'up', 'down', 'wider', 'narrower']) ok(Z[k] && E[k], 'dynamic key ' + k);
for (const id of ['n0', 'a1', 'k1', 'k2', 'just2', 'et2', 't3', 'maj3', 'min3', 't4', 'd4', 't5', 'p5', 'q5', 'auth5', 'plag5', 'half5', 'dec5', 'check6', 'show6', 'new6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard') && !/AudioContext|new Audio/.test(app), 'no label guard, no audio');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/applied/music-theory/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS music-theory core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · fifth ${M.centsOff(7).toFixed(2)} cents, beats ${M.harmonicPairs(7, 220, 'et').pairs[0].beat.toFixed(3)} Hz`);
