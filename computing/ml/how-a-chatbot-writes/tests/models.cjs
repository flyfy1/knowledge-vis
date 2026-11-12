'use strict';
// Checks that every number and claim the essay's prose makes is what the page's own models produce.
// Prose numbers are {placeholders} filled from models.js facts(); this test recomputes the facts from the
// models, checks the relations the prose states about them, and pins the few literal claims (named tokens,
// sentences in or not in the corpus). It runs on both corpora, so the English prose can say the same things.
// Run: node computing/ml/how-a-chatbot-writes/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} };
for (const f of ['corpus.zh.js', 'corpus.en.js', 'copy.zh.js']) vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
const CORPUS = ctx.window.ESSAY_CORPUS, Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let n = 0, fails = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.error('FAIL ' + msg); } }
function says(key, phrase) { ok(Z[key] != null && Z[key].includes(phrase), `prose ${key} should contain "${phrase}"`); }

const builds = {};
for (const L of ['zh', 'en']) { const b = M.build(CORPUS[L]); builds[L] = { b, f: M.facts(b) }; }

/* ── relations the prose states, for both corpora ── */
for (const L of ['zh', 'en']) {
  const { b: B, f: F } = builds[L], C = CORPUS[L], tag = L + ': ';
  // ch1
  ok(F.stop > 0 && F.stop < F.total, tag + 'the essay stops merging before the end');
  ok(B.bpe.merges.length < M.MAX_MERGES && B.bpe.merges[B.bpe.merges.length - 1].count === 2, tag + 'merging ran until no pair occurs twice (ch1.p4)');
  ok(B.bpe.tokensAfter.every((x, i) => i === 0 || x < B.bpe.tokensAfter[i - 1]), tag + 'every merge shortens the corpus');
  ok(F.m1c === Math.max(...B.bpe.merges.map(m => m.count)), tag + 'the first merge is the most frequent pair');
  ok(C.lines.some(l => M.chunks(l, L).includes(M.chunks(l, L).find(c => c === F.late || c.trim() === F.late))), tag + `the late merge "${F.late}" is a whole chunk of a corpus line`);
  ok(B.bpe.merges.slice(B.bpe.stop).every(m => m.count < C.minPair) && B.bpe.merges.slice(0, B.bpe.stop).every(m => m.count >= C.minPair), tag + 'stop rule');
  ok(F.minPair === C.minPair && F.nextC === B.bpe.merges[B.bpe.stop].count && F.nextC < F.minPair, tag + 'ch1: the merge after the stop occurs fewer than minPair times');
  // ch2
  const d = M.ngramDist(B.ng, [C.probes.contexts[0]], 2);
  ok(d.L === 1 && d.items.length === F.ctxK && d.total === F.ctxN && F.top1c === d.items[0].c, tag + 'ch2 context facts');
  ok(F.pairs === F.tokStop, tag + 'one pair per token (each token has a predecessor, the first one the sentence start)');
  // ch3: copying rises, unseen contexts and zero probabilities rise, with the length of context
  ok(F.copy1 <= F.copy2 && F.copy2 < F.copy3 && F.copy3 < F.copy4, tag + `copying rises with context (${F.copy1}, ${F.copy2}, ${F.copy3}, ${F.copy4})`);
  ok(F.unseen2 < F.unseen4 && F.zero2 < F.zero4, tag + 'sparsity rises with context');
  ok(F.copy2 / F.runs <= 0.5, tag + 'one-token context mostly writes new sentences');
  // ch4
  ok(F.good8 > F.good2, tag + `more numbers per word cluster better (${F.good2} → ${F.good8})`);
  ok(M.groupOf(C.probes.map.indexOf(C.probes.word)) === M.groupOf(C.probes.map.indexOf(' ' + F.nb)) || M.groupOf(C.probes.map.indexOf(C.probes.word)) === M.groupOf(C.probes.map.indexOf(F.nb)), tag + `the default word's nearest neighbour (${F.nb}) is of the same kind`);
  ok(C.probes.map.length === 22 && C.probes.map.every(w => B.vectors.idx.has(w)), tag + 'every map word has a vector');
  // ch5
  const r0 = M.attention.row(6, 0), r2 = M.attention.row(6, 2);
  ok(r0.reduce((a, x) => x.w > a.w ? x : a).j === 3, tag + '"it" attends most to slot 3 (apples) at slope 0');
  ok(F.near0 === C.toyVocab[3].trim(), tag + `the mixed vector of "it" is nearest to apples (${F.near0})`);
  ok(F.near2 === C.toyVocab[6].trim() && F.wSelf2 > 90, tag + `at slope 2 "it" looks at itself (${F.wSelf2}%, nearest ${F.near2})`);
  ok(C.toy.length === 9 && C.toyVocab.length === 9 && M.attention.keys.length === 9 && M.attention.queries.length === 9, tag + 'nine toy slots');
  ok(M.attention.d === 4 && Math.sqrt(M.attention.d) === 2, tag + 'd = 4, so scores are divided by 2');
  // ch6
  ok(F.p1T05 > F.p1T1 && F.p1T1 > F.p1T2, tag + 'temperature sharpens below 1 and flattens above');
  ok(F.dist0 === 1 && F.dist0 < F.dist05 && F.dist05 < F.dist1, tag + `distinct sentences rise with temperature (${F.dist0}, ${F.dist05}, ${F.dist1})`);
  // shape(): T = 1 with no truncation returns the counts unchanged; top-p keeps the fewest tokens reaching p
  { const sd = M.ngramDist(B.ng, [C.probes.sampleContexts[0]], 2), s1 = M.shape(sd.items, 1, 0, 1);
    ok(s1.every((s, i) => Math.abs(s.r - sd.items[i].p) < 1e-12), tag + 'T = 1 leaves the probabilities alone');
    const sp = M.shape(sd.items, 1, 0, 0.5), kept = sp.filter(s => s.keep); let cum = 0; kept.forEach(s => { cum += s.p0; });
    ok(cum >= 0.5 - 1e-12 && cum - kept[kept.length - 1].p0 < 0.5, tag + 'top-p keeps the fewest tokens that reach p');
    ok(M.shape(sd.items, 1, 3, 1).filter(s => s.keep).length === 3, tag + 'top-k keeps k'); }
  // ch7: floor is the conditional entropy of the bigram counts; the network approaches it; lr 50 diverges; d = 2 cannot reach it
  { let H = 0; for (const r of B.bigram.rows) for (const [, c] of r.next) H -= c * Math.log(c / r.n);
    ok(Math.abs(H / B.bigram.pairs - B.bigram.floor) < 1e-12, tag + 'floor = conditional entropy');
    const net0 = M.netCreate(B.bigram, 8, 1); ok(Math.abs(M.netLoss(net0) - Math.log(B.bigram.V)) < 0.05, tag + 'the untrained network is close to a uniform guess (ln V)');
    const net = M.netCreate(B.bigram, 8, 1); for (let i = 0; i < 3000; i++) M.netStep(net, 5);
    ok(M.netLoss(net) - B.bigram.floor < 0.1, tag + `d = 8, lr 5: 3000 steps reach within 0.1 of the floor (${(M.netLoss(net) - B.bigram.floor).toFixed(3)})`);
    // with d = 8 and a good rate the network's row for the ch2 context matches the counts closely
    const p = M.netProbs(net, B.bigram.idx.get(C.probes.contexts[0])); let tv = 0;
    const cnt = new Map(d.items.map(it => [it.tok, it.p])); B.bigram.vocab.forEach((tk, j) => { tv += Math.abs(p[j] - (cnt.get(tk) || 0)); });
    ok(tv / 2 < 0.15, tag + `trained probabilities for "${C.probes.contexts[0]}" are close to the counts (TV ${(tv / 2).toFixed(3)})`);
    const div = M.netCreate(B.bigram, 8, 1); let blew = false; for (let i = 0; i < 300 && !blew; i++) if (!isFinite(M.netStep(div, 50))) blew = true; if (!blew) blew = !isFinite(M.netLoss(div));
    ok(blew, tag + 'learning rate 50 diverges');
    let best = Infinity; for (const lr of [1, 2, 5, 10, 20]) { const s = M.netCreate(B.bigram, 2, 1); let L2 = 0; for (let i = 0; i < 2000; i++) { L2 = M.netStep(s, lr); if (!isFinite(L2)) break; } L2 = M.netLoss(s); if (isFinite(L2)) best = Math.min(best, L2); }
    ok(best - B.bigram.floor > 0.5, tag + `d = 2 stays well above the floor (best ${best.toFixed(2)} vs ${B.bigram.floor.toFixed(2)})`); }
  // ch8
  ok(F.gapGpt3 >= 6 && 175e9 / F.netParams >= Math.pow(10, F.gapGpt3) && 300e9 / F.tokStop >= Math.pow(10, F.gapTok), tag + 'orders of magnitude are lower bounds');
  ok(F.netParams === B.bigram.V * 8 * 2 + B.bigram.V, tag + 'network parameters for d = 8');
  // determinism
  ok(JSON.stringify(M.facts(M.build(C))) === JSON.stringify(F), tag + 'facts are deterministic');
}

/* ── literal claims in the Chinese prose ── */
{
  const { b: B } = builds.zh, C = CORPUS.zh;
  ok(M.encode(C.probes.sentence, B.tok).includes('因为它很'), 'ch1.p3: 「因为它很」 is one token of the sample sentence'); says('ch1.p3', '「因为它很」');
  ok(M.ngramDist(B.ng, ['很'], 2).items.some(i => i.tok === '甜'), 'ch3.p1: 很 can be followed by 甜');
  const tri = M.ngramDist(B.ng, ['小猫', '很'], 3); ok(tri.L === 2 && tri.items.length === 1 && tri.items[0].tok === '可', 'ch3.p1: 小猫很 is only followed by 可'); says('ch3.p1', '“小猫很”后面在语料里只接过“可爱”的“可”');
  ok(C.lines.some(l => l.includes('小猫在家里睡觉')) && !C.lines.some(l => l.includes('小狗在家里睡觉')), 'ch3.p4: corpus has 小猫在家里睡觉 but not 小狗在家里睡觉'); says('ch3.p4', '“小狗在家里睡觉”');
  ok(!C.lines.some(l => l.includes('小狗在树下睡觉')), 'ch4.p1: 小狗在树下睡觉 is not in the corpus'); says('ch4.p1', '“小狗在树下睡觉”');
  ok(C.toy[3] === '苹果' && C.toy[6] === '它', 'ch5: the toy sentence'); says('ch5.p3', '「它」把 {wThing}% 的注意力给了「苹果」');
  ok(C.toy.join('') === '妈妈买了一些苹果，因为它很甜', 'ch5.p1 quotes the toy sentence'); says('ch5.p1', '妈妈买了一些苹果，因为它很甜');
  ok((-Math.log(0.01)).toFixed(1) === '4.6', 'ch7.p2: −ln 1% = 4.6'); says('ch7.p2', '给 1% 记 4.6');
  ok(/LRS = \[0\.5, 1, 2, 5, 10, 20, 50\]/.test(app), 'ch7: the learning-rate slider ends at 50'); says('ch7.p3', '最右边（50）');
  says('ch7.p3', 'd 只有 2 时');
  ok(/id="ngO" min="0" max="3"/.test(html) && /const v = \+sO\.value, o = v \+ 1/.test(app) && /ch3\.unit\.order', \{ v: fmt\(v\)/.test(app), 'ch3: slider value is the context length 0..3, order = value + 1'); says('ch3.p2', '从 0 拖到 3');
  for (const id of ['ngO', 'lpO']) { const m = html.match(new RegExp('id="' + id + '" min="(\\d+)" max="(\\d+)"')); ok(m && +m[1] === 0 && +m[2] === builds.zh.b.ng.maxOrder - 1, id + ': slider spans context lengths 0..' + (builds.zh.b.ng.maxOrder - 1) + ' (the table has ' + builds.zh.b.ng.maxOrder + ' orders)'); }
  ok(/id="vcK" min="1" max="24" step="1" value="8"/.test(html) && M.K0 === 8 && M.build(C).vectors.dims === 24, 'ch4: default 8 numbers per word, up to 24');
  ok(/value="8" checked/.test(html), 'ch7: default d = 8 (the ch8 table uses d = 8)'); says('ch8.table', 'd = 8');
  ok(/id="trLr" min="0" max="6" step="1" value="3"/.test(html), 'ch7: default learning rate index 3 = 5');
  ok(/id="smT" min="0" max="2" step="0.05" value="1"/.test(html), 'ch6: default temperature 1');
  ok(/id="lpO" min="0" max="3" step="1" value="3"/.test(html) && /const order = \+sO\.value \+ 1/.test(app), 'ch8: default looks at 3 tokens (order 4)');
  // sourced figures (see BRIEF.md): stated once each
  for (const [k, s] of [['ch8.table', '1750 亿'], ['ch8.table', '4050 亿'], ['ch8.table', '>96<'], ['ch8.table', '>126<'], ['ch8.table', '3000 亿'], ['ch8.table', '15.6 万亿'], ['ch8.table', '>2048<'], ['ch8.table', '最多 12.8 万'],
    ['ch1.p4', '12.8 万个 token'], ['ch4.limit', '12288'], ['ch5.p4', '96 层，每层 96 个头']]) says(k, s);
}

/* ── every placeholder is supplied, every key exists, no Chinese outside the copy and the corpus ── */
{
  const F = builds.zh.f;
  const appVars = new Set([...app.matchAll(/\b(\w+)\s*:/g)].map(m => m[1]));
  const proseKeys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const [k, v] of Object.entries(Z)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    const name = m[1];
    if (proseKeys.has(k)) ok(name in F || name === 'prompt', `static prose ${k}: {${name}} is a fact`);
    else ok(appVars.has(name), `live text ${k}: {${name}} is supplied by app.js`);
  }
  const keys = new Set(proseKeys);
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (!m[1].endsWith('.')) keys.add(m[1]);
  for (const m of app.matchAll(/'(ch\d\.say\.\w+)'/g)) keys.add(m[1]);
  for (let g = 0; g < 5; g++) keys.add('ch4.group.' + g);
  for (const k of keys) ok(Z[k] != null, 'zh key exists: ' + k);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    // the static <title> and meta description stay Chinese for crawlers and link previews (replaced at load)
    if (file === 'index.html') src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '');
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    ok(!others.length, `no Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`);
  }
  ok(!/[一-鿿]/.test(fs.readFileSync(path.join(dir, 'corpus.en.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')), 'no Chinese in the English corpus');
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (prose numbers come from the models, for both corpora)`);
