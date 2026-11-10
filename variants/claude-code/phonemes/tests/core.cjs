'use strict';
// Speech sounds & phonemes (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim and verdict the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: feature chart ----
ok(M.CONS.length === 19, '19 consonants');
ok(M.PLACES.length * M.MANNERS.length * 2 === 48, '48 slots');
for (const l of ['zh', 'en']) ok(STRINGS[l].s0e.includes('48') && STRINGS[l].s0e.includes('19'), 's0e quotes 48 and 19 (' + l + ')');
const keys = new Set(M.CONS.map(c => `${c.place}|${c.manner}|${c.voiced}`)); ok(keys.size === 19, 'feature bundles are unique');
M.CONS.forEach(c => ok(M.find(c.place, c.manner, c.voiced) === c, 'find ' + c.ipa));
ok(M.CONS.filter(c => c.manner === 'nasal').every(c => c.voiced), 'English nasals all voiced (nNasal)');
ok(!M.find('velar', 'fricative', false) && !M.find('velar', 'fricative', true), 'no velar fricatives (nX)');
ok(!M.find('bilabial', 'fricative', false) && !M.find('bilabial', 'fricative', true), 'no bilabial fricatives (nPhi)');
// hint: voicing pairs keep place and manner
ok(M.diff(M.byIpa.p, M.byIpa.b).join() === 'voicing' && M.diff(M.byIpa.s, M.byIpa.z).join() === 'voicing', 'p/b, s/z differ only in voicing');
ok(['t', 's', 'n'].every(x => M.byIpa[x].place === 'alveolar'), 't, s, n all alveolar');

// ---- step 1: minimal pairs ----
for (const f of Object.keys(M.FRAMES)) for (const k of Object.keys(M.FRAMES[f].words)) ok(!!M.byIpa[k], `frame ${f} uses a chart consonant ${k}`);
const ie = M.FRAMES.ie.words;
ok(ie['θ'] === 'thigh' && ie['ð'] === 'thy' && M.diff(M.byIpa['θ'], M.byIpa['ð']).join() === 'voicing', 'thigh/thy differ only in voicing');
const pn = M.neighbours(M.byIpa.p).map(n => n.c.ipa).sort();
assert.deepEqual(pn, ['b', 'k', 't']); checks++;
ok(ie.b && ie.t && !ie.k, '_ie: by, tie are words, k gives none');
ok(M.FRAMES.at.words.p === 'pat' && M.FRAMES.at.words.k === 'cat', '_at: pat and cat');
ok(M.diff(M.byIpa.p, M.byIpa.m).length === 2, 'pie/my differ in two features');
for (const f of Object.keys(M.FRAMES)) {
  const P = M.framePairs(f), n = P.words;
  ok(P.all === n * (n - 1) / 2, 'all pairs = n(n−1)/2');
  ok(P.byFeature.place + P.byFeature.manner + P.byFeature.voicing === P.one.length, 'feature counts add up');
  P.one.forEach(q => ok(M.diff(M.byIpa[q.a], M.byIpa[q.b]).length === 1, 'single-feature pair'));
}
ok(M.framePairs('ie').byFeature.voicing >= 2, '_ie has voicing pairs (p/b, θ/ð …)');

// ---- step 2: VOT ----
assert.deepEqual(M.boundaries('en'), [29.5]); assert.deepEqual(M.boundaries('es'), [-67]); assert.deepEqual(M.boundaries('th'), [-45.5, 35]); checks += 3;
const cls = v => ['en', 'es', 'th'].map(k => M.classify(k, v)).join(',');
ok(cls(60) === 'p,p,pʰ', '60 ms: en p, es p, th pʰ'); ok(cls(5) === 'b,p,p', '5 ms: en b, es p, th p'); ok(cls(-100) === 'b,b,b', '−100 ms: all b');
ok(M.VOT.th.length === 3 && M.VOT.en.length === 2 && M.VOT.es.length === 2, 'Thai three categories, English/Spanish two');
for (let v = -150; v <= 110; v += 5) for (const k of ['en', 'es', 'th']) { const c = M.classify(k, v), b = M.boundaries(k); ok(M.VOT[k].some(q => q.cat === c), 'valid category'); }
ok(Math.abs(M.VOT.en[1].mean - 60) < 5, 'English /p/ mean near 60 ms (hint)');

// ---- step 3: onsets ----
const V = (a, b) => M.onset(a, b).verdict;
ok(V('b', 'l') === 'english' && M.onset('b', 'l').word === 'blip', 'blip');
ok(V('b', 'n') === 'gap', 'bn rises but unused'); ok(V('l', 'b') === 'falls', 'lb falls');
['t', 'p', 'k'].forEach(x => ok(V('s', x) === 'sExc', 's + ' + x + ' exception'));
ok(M.onset('s', 't').son.join() === '2,1,6' && M.onset('s', 'p').word === null && M.onset('s', 'k').word === 'skip', 's+stop sonority and skip');
ok(V('p', 'l') === 'english' && !M.onset('p', 'l').word, 'plip: possible but not a word');
let cnt = { english: 0, sExc: 0, gap: 0, falls: 0, single: 0 };
M.ONSET1.forEach(a => M.ONSET2.forEach(b => cnt[V(a, b)]++));
ok(cnt.single === 15 && cnt.english + cnt.sExc === 25 && cnt.sExc === 3, 'English uses 25 combos, 3 of them s + stop');
ok(cnt.gap > cnt.english + cnt.sExc, 'more orange (gap) than green (s3hint)');
ok(cnt.english + cnt.sExc + cnt.gap + cnt.falls === 15 * 8, '120 two-consonant cells');
for (const k of M.ENGLISH_CC) { const segs = k.match(/θ|ʃ|./g); ok(M.ONSET1.includes(segs[0]) && M.ONSET2.includes(segs[1]), 'cluster in chart ' + k); }
for (const w of Object.keys(M.IP_WORDS)) { const segs = w.match(/θ|ʃ|./g); const o = M.onset(segs[0], segs[1] || ''); ok(o.verdict === 'single' || o.verdict === 'english' || o.verdict === 'sExc', 'every -ip word has an allowed onset: ' + w); }
ok(M.sonority('ɪ') === 6 && M.sonority('w') === 5 && M.sonority('l') === 4 && M.sonority('m') === 3 && M.sonority('s') === 2 && M.sonority('p') === 1, 'sonority scale');

// ---- step 4: suffixes ----
const plural = { cat: 's', cup: 's', cliff: 's', dog: 'z', cab: 'z', bee: 'z', bus: 'ɪz', dish: 'ɪz', judge: 'ɪz', wug: 'z' };
M.STEMS.plural.forEach(([w, , last]) => ok(M.plural(last).form === plural[w], 'plural ' + w));
const past = { walk: 't', kiss: 't', rush: 't', hug: 'd', buzz: 'd', play: 'd', wait: 'ɪd', need: 'ɪd', judge: 'd', plip: 't' };
M.STEMS.past.forEach(([w, , last]) => ok(M.past(last).form === past[w], 'past ' + w));
ok(M.plural('k').form === 's', 'quiz: blick → [blɪks]');
M.CONS.forEach(c => { const pl = M.plural(c.ipa).form, pa = M.past(c.ipa).form;
  if (M.SIBILANTS.has(c.ipa)) ok(pl === 'ɪz', 'sibilant → ɪz'); else ok(pl === (c.voiced ? 'z' : 's'), 'voicing decides plural ' + c.ipa);
  if (c.ipa === 't' || c.ipa === 'd') ok(pa === 'ɪd', 't/d → ɪd'); else ok(pa === (c.voiced ? 'd' : 't'), 'voicing decides past ' + c.ipa); });
ok(M.plural('V').form === 'z' && M.past('V').form === 'd', 'vowels voiced');
ok(M.SIBILANTS.size === 6, 'six sibilants');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['quizA', 'quizB', 'quizC', 's0readout', 'd3']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys referenced in HTML/app; controls; links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const p of M.PLACES) ok(STRINGS.zh['pl' + p[0].toUpperCase() + p.slice(1)] !== undefined, 'place key ' + p);
for (const m of M.MANNERS) ok(STRINGS.zh['mn' + m[0].toUpperCase() + m.slice(1)] !== undefined, 'manner key ' + m);
for (const v of ['single', 'english', 'sExc', 'gap', 'falls']) ok(STRINGS.zh['v' + v[0].toUpperCase() + v.slice(1)] !== undefined, 'verdict key ' + v);
for (const f of Object.keys(M.FRAMES)) ok(STRINGS.zh['fr' + f[0].toUpperCase() + f.slice(1)] !== undefined, 'frame key ' + f);
for (const id of ['placeBtns', 'mannerBtns', 'voiceBtns', 'frameBtns', 'cons1', 'vot2', 'sweep2', 'c1sel', 'c2sel', 'sufPl', 'sufPa', 'stemBtns', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../language/phonology/phonemes/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS phonemes core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · onsets english ${cnt.english + cnt.sExc} / gap ${cnt.gap} / falls ${cnt.falls}`);
