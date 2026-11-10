'use strict';
// Attention & memory (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim and direction the page states; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (k, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs) ok(STRINGS[l][k].includes(s), `${k} (${l}) quotes ${s}`); };

// ---- step 0: chunks ----
let r = M.chunkRecall('acronyms', true, 4);
ok(r.nUnits === 4 && r.all && r.recalled === 12 && r.letters === 12, 'acronyms familiar: 4 chunks, all held at K=4');
r = M.chunkRecall('acronyms', false, 4); ok(r.nUnits === 12 && r.recalled === 4 && !r.all, 'unfamiliar: 12 units, only first 4 letters');
for (let K = 3; K <= 7; K++) for (const f of [true, false]) {
  const a = M.chunkRecall('random', f, K); ok(a.nUnits === 12 && a.recalled === K, 'random ignores familiarity, recall = K');
  ok(M.chunkRecall('acronyms', false, K).recalled === K, 'unfamiliar recall = K letters');
}
r = M.chunkRecall('acronyms', true, 3); ok(r.held.length === 3 && r.nUnits - r.held.length === 1, 'K=3 loses one acronym');
ok(M.chunkRecall('years', true, 3).all && M.chunkRecall('years', true, 3).letters === 12, 'years: 3 chunks of 12 digits');
ok(!M.chunkRecall('acronyms', false, 7).all, 'unfamiliar needs K=12, slider max 7 never enough');
both('s0e', '12', '4'); both('s0hint', '12', '4', '7');

// ---- step 1: serial position ----
const sp = (L, rate, d) => M.serialPosition(L, rate, d);
const base = sp(12, 2, false), mid = a => Math.min(...a.slice(1, -1));
ok(base.p[0] > mid(base.p) + 0.1 && base.p[11] > mid(base.p) + 0.2, 'U shape at 12 words, 2 s');
ok(base.p[11] > base.p[0], 'recency above primacy');
ok(base.buf[0] < 0.02 && base.buf[11] > 0.5, 'primacy from LTM, recency from buffer');
const slow = sp(12, 4, false);
ok(slow.p[0] > base.p[0] + 0.05, 'rate 4 raises the start');
ok(mid(slow.p) > mid(base.p) + 0.05, 'rate 4 raises the middle');
for (let i = 9; i < 12; i++) near(slow.p[i], base.p[i], 0.1, 'last few barely change at rate 4 (pos ' + (i + 1) + ')');
near(slow.p[11], base.p[11], 0.02, 'last item unchanged at rate 4');
for (const L of [8, 12, 16, 20]) for (const rate of [1, 2, 3, 4]) {
  const a = sp(L, rate, false), d = sp(L, rate, true);
  ok(d.buf.every(v => v === 0), 'delay removes the buffer part');
  ok(Math.abs(d.p[0] - (a.p[0] - a.buf[0])) < 1e-9 && d.p[0] > 0.55 && d.p[0] > d.p[L - 1] + 0.3, 'delay keeps primacy (its LTM part)');
  ok(d.p[L - 1] === Math.min(...d.p), 'delay: last item is lowest');
  ok(a.p.every((v, i) => v >= a.buf[i] - 1e-12 && v <= 1), 'buffer part within total');
}
near(sp(12, 2, true).p[11], 0.16, 0.02, 'delay: last item ≈ 0.16');
const twenty = sp(20, 2, false), range = a => Math.max(...a.slice(4, -4)) - Math.min(...a.slice(4, -4));
ok(range(twenty.p) < 0.08, '20 words: flat middle');
both('s1e', '2000', '4', '0.35', '0.95'); both('delayBtn', '30');
ok(M.SP.people === 2000 && M.SP.buffer === 4 && M.SP.alpha === 0.35 && M.SP.bufferRecall === 0.95, 'SP constants match text');

// ---- step 2: PRP ----
for (const hard of [false, true]) for (let B1 = 150; B1 <= 450; B1 += 25) {
  const A2 = hard ? 250 : 100, crit = 100 + B1 - A2;
  for (let s = 0; s <= 800; s += 25) {
    const q = M.prp(s, B1, hard);
    ok(q.critical === crit && q.rt1 === 200 + B1, 'critical SOA and RT1');
    ok(q.rt2 === Math.max(s + A2, 100 + B1) + 250 - s, 'RT2 formula');
    if (s >= crit) ok(q.rt2 === A2 + 250 && q.wait === 0, 'flat beyond critical');
    else { ok(q.wait > 0, 'waits below critical'); ok(M.prp(s + 25, B1, hard).rt2 === q.rt2 - 25 || s + 25 > crit, 'slope −1'); }
  }
}
ok(M.prp(100, 300, false).critical === 300 && M.prp(100, 300, true).critical === 150, 'critical 300 easy / 150 hard at B1=300');
for (let s = 0; s <= 150; s += 25) ok(M.prp(s, 300, true).rt2 === M.prp(s, 300, false).rt2, 'hard unchanged at short SOA ' + s);
for (let s = 300; s <= 800; s += 25) ok(M.prp(s, 300, true).rt2 - M.prp(s, 300, false).rt2 === 150, 'hard +150 at long SOA');
ok(M.prp(0, 450, false).rt2 > M.prp(0, 300, false).rt2 && M.prp(800, 450, false).rt2 === M.prp(800, 300, false).rt2, 'B1 affects only short SOA');
both('hardBtn', '100', '250'); both('s2hint', '150'); both('sweepSoa', '800');

// ---- step 3: retrieval ----
const R = (d, s, c) => M.retrieval(d, s, c).p;
for (const s of [true, false]) ok(R('shallow', s, 'free') === R('shallow', s, 'category'), 'shallow: hint changes nothing');
for (const s of [true, false]) ok(R('deep', s, 'category') > R('deep', s, 'free') + 0.1, 'deep: hint helps');
for (const d of ['shallow', 'deep']) for (const c of ['free', 'category']) ok(M.retrieval(d, true, c).m - M.retrieval(d, false, c).m === 2, 'room differs by 2 features');
near(R('shallow', true, 'free'), 0.590, 0.001, 'shallow same'); near(R('shallow', false, 'free'), 0.36, 0.001, 'shallow diff');
near(R('deep', true, 'free'), 0.672, 0.001, 'deep free same'); near(R('deep', true, 'category'), 0.790, 0.001, 'deep cue same');
near(R('deep', false, 'free'), 0.488, 0.001, 'deep free diff'); near(R('deep', false, 'category'), 0.672, 0.001, 'deep cue diff');
ok(R('deep', true, 'free') > R('shallow', true, 'free'), 'deep beats shallow');
ok(M.CUE.q === 0.2 && M.CUE.semantic.shallow === 1 && M.CUE.semantic.deep === 5 && M.CUE.context === 2 && M.CUE.selfCue === 2 && M.CUE.categoryCue === 4, 'CUE constants match s3e');
both('s3e', '20%', '0.8', '5', '4'); both('s3readout', '0.8'); both('cBars', '8');

// ---- step 4: interference ----
const I = (d, sim, del) => M.interference(d, sim, del).p;
for (let sim = 0.1; sim <= 1.0001; sim += 0.1) for (let del = 0; del <= 48; del += 2) {
  ok(I('control', sim, del) > I('proactive', sim, del) && I('proactive', sim, del) > I('retroactive', sim, del), 'control > proactive > retroactive');
  ok(M.interference('proactive', sim, del).sT === M.interference('retroactive', sim, del).sT, 'targets equally strong (quiz premise)');
  if (del) for (const d of ['control', 'proactive', 'retroactive']) ok(I(d, sim, del) < I(d, sim, del - 2), 'curves fall with delay');
}
for (let del = 0; del <= 48; del += 2) ok(Math.abs(I('control', 0, del) - I('retroactive', 0, del)) < 1e-12 && Math.abs(I('control', 0, del) - I('proactive', 0, del)) < 1e-12, 'sim 0: all equal');
for (let del = 2; del <= 48; del += 2) ok(I('control', 0.8, del) - I('retroactive', 0.8, del) < I('control', 0.8, del - 2) - I('retroactive', 0.8, del - 2), 'gap shrinks with delay');
near(I('control', 0.8, 0), 0.669, 0.001, 'control 0.669'); near(I('proactive', 0.8, 0), 0.505, 0.001, 'proactive 0.505'); near(I('retroactive', 0.8, 0), 0.355, 0.001, 'retroactive 0.355');
ok(M.INT.tau === 24 && M.INT.gap === 12 && M.INT.k === 0.3, 'INT constants match s4e');
both('s4e', '24', '12', '0.3'); both('s4hint', '0.8'); both('quizPrompt', '0.8');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['delayOff']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording'); }

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['task1', 'task2', 'delayOn', 'delayOff', 'dCtl', 'dPro', 'dRet']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['strAcr', 'strYears', 'strRand', 'familiar0', 'k0', 'len1', 'rate1', 'delay1', 'clear1', 'soa2', 'b12', 'hard2', 'sweep2', 'deep3', 'room3', 'cue3', 'dCtl', 'dPro', 'dRet', 'sim4', 'del4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
ok(!app.includes('canvas-label-guard'), 'no label guard in app');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../psychology/cognition/memory-attention/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS memory-attention core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
