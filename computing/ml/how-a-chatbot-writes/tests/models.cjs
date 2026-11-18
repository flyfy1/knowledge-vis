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
for (const f of ['corpus.zh.js', 'corpus.en.js', 'copy.zh.js', 'copy.en.js']) vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
const CORPUS = ctx.window.ESSAY_CORPUS, Z = ctx.window.ESSAY_COPY.zh, E = ctx.window.ESSAY_COPY.en;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let n = 0, fails = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.error('FAIL ' + msg); } }
function saysEn(key, phrase) { ok(E[key] != null && E[key].includes(phrase), `English prose ${key} should contain "${phrase}"`); }
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
  // the ch8 table's "count table (looks at 3 tokens)" column counts every (context, next) entry for context
  // lengths 0..3 (2026-11-18: it used to stop at length 2)
  { let e = 0; for (let L = 0; L <= 3; L++) for (const m of B.ng.table[L].values()) e += m.size;
    ok(B.ng.maxOrder === 4 && F.entries3 === e, tag + `ch8 table entries for context lengths 0..3 (${F.entries3})`); }
  // ch1.p3: the longest token of the sample sentence; ch2.p3: ties at the top of the ch2 row; ch7.p3: tokens used
  ok(F.sampleLong === M.encode(C.probes.sentence, B.tok).map(x => x.trim()).sort((a, b) => [...b].length - [...a].length)[0], tag + 'sampleLong is the longest token of the sample sentence');
  ok(F.top1ties === d.items.filter(it => it.c === d.items[0].c).length && F.top1ties >= 1, tag + `ch2 ties at the top (${F.top1ties})`);
  ok(F.Vused === new Set(B.seqs.flat()).size && F.V === F.Vused + 1, tag + `the network chooses among ${F.Vused} tokens plus the start mark`);
  ok(F.vocabStop > F.Vused, tag + 'the ch1 vocabulary is larger than the set of tokens the corpus ends up using');
  /* diagrams (STANDARD §4a): every drawn number comes from diagramData(); pin its relations to the models */
  { const D = M.diagramData(B);
    const walk = (n, f) => { f(n); (n.kids || []).forEach(k => walk(k, f)); };
    ok(D.trees.length === 2, tag + 'two merge trees');
    for (const tr of D.trees) {
      ok(M.encode(tr.tok, B.tok).length === 1, tag + `tree root "${tr.tok}" is one token`);
      walk(tr, n => { if (n.kids) { const m = B.tok.merges[n.n - 1]; ok(m.ab === n.tok && m.a === n.kids[0].tok && m.b === n.kids[1].tok && m.count === n.c && n.n <= B.bpe.stop, tag + `tree node ${n.tok} = merge #${n.n} (${n.c})`); } else ok([...n.tok].length === 1, tag + `leaf "${n.tok}" is one character`); });
    }
    ok(D.ctx.length >= 3 && D.ctx.every((c, i) => i === 0 || c.k <= D.ctx[i - 1].k) && D.ctx[D.ctx.length - 1].k === 1 && D.ctx[0].k === F.Vused, tag + `ch3 diagram: options shrink with context (${D.ctx.map(c => c.k).join(' → ')})`);
    ok(D.row.ctx === C.probes.contexts[0] && D.row.total === F.ctxN && D.row.items[0].c === F.top1c && D.row.rest === F.ctxK - 4, tag + 'ch2 diagram row = the ch2 facts');
    ok(D.vec.length === 3 && D.vec.every(r => r.v.length === M.K0) && D.vecCos[1].toFixed(2) === F.nbCos && D.vecCos[1] > D.vecCos[2], tag + `ch4 diagram cosines (${D.vecCos.map(x => x.toFixed(2)).join(', ')})`);
    ok(M.encode(C.probes.vecLine, B.tok).includes(C.probes.vecDemo[0]) && C.lines.includes(C.probes.vecLine), tag + 'ch4 diagram line is a corpus line containing the word');
    ok(Math.round(100 * D.samp.raw[0].r) === F.p1T1 && Math.round(100 * D.samp.sharp[0].r) === F.p1T05 && D.samp.cut.filter(x => x.keep).length < D.samp.cut.length, tag + 'ch6 diagram = the ch6 facts, top-p 0.5 cuts');
    // the caption ends "a draw from what remains": something must be left to draw from (review 2026-11-18)
    ok(D.samp.cut.filter(x => x.keep).length >= 2, tag + `ch6 diagram: top-p 0.5 leaves at least two tokens (${D.samp.cut.filter(x => x.keep).length})`);
    // the ch1 caption explains the node label with the first tree's root
    ok(D.trees[0].n >= 1 && D.trees[0].c >= C.minPair, tag + `ch1 caption example #${D.trees[0].n} · ${D.trees[0].c}`);
    ok(D.net.total === F.netParams && D.net.V === F.V && D.net.d === M.K0, tag + 'ch7 diagram parameter count'); }
  // determinism
  ok(JSON.stringify(M.facts(M.build(C))) === JSON.stringify(F), tag + 'facts are deterministic');
}

/* ── literal claims in the Chinese prose ── */
{
  const { b: B } = builds.zh, C = CORPUS.zh;
  ok(M.encode(C.probes.sentence, B.tok).includes('因为它很') && builds.zh.f.sampleLong === '因为它很', 'ch1.p3: 「因为它很」 is the longest token of the sample sentence (not a word)'); says('ch1.p3', '「{sampleLong}」');
  { const late = B.bpe.merges.slice(B.bpe.stop).map(m => m.ab); ok(['一些', '动物', '它不饿了', '小猫在家里睡觉'].every(x => late.includes(x)), 'ch1.p3: the four examples are merges after the stop'); says('ch1.p3', '“小猫在家里睡觉”这样整段的短语'); }
  ok(builds.zh.f.top1ties === 3 && builds.zh.f.top1 === '和', 'ch2: three next tokens of 小猫 tie at 3'); says('ch2.p3', '{top1ties} 个并列');
  { const D = M.diagramData(B); ok(D.ctx.map(c => c.k).join() === '179,13,1' && D.ctx[2].top === '可', 'ch3 diagram: 小猫很 → 179, 13, 1 (可)'); }
  says('ch8.table', '{entries3} 个计数'); ok(builds.zh.f.entries3 === 2417, 'ch8: the order-4 table holds 2,417 entries');
  ok(M.ngramDist(B.ng, ['很'], 2).items.some(i => i.tok === '甜'), 'ch3.p1: 很 can be followed by 甜');
  const tri = M.ngramDist(B.ng, ['小猫', '很'], 3); ok(tri.L === 2 && tri.items.length === 1 && tri.items[0].tok === '可', 'ch3.p1: 小猫很 is only followed by 可'); says('ch3.p1', '“小猫很”后面在语料里只接过“可爱”的“可”');
  ok(C.lines.some(l => l.includes('小猫在家里睡觉')) && !C.lines.some(l => l.includes('小狗在家里睡觉')), 'ch3.p4: corpus has 小猫在家里睡觉 but not 小狗在家里睡觉'); says('ch3.p4', '“小狗在家里睡觉”');
  ok(!C.lines.some(l => l.includes('小狗在树下睡觉')), 'ch4.p1: 小狗在树下睡觉 is not in the corpus'); says('ch4.p1', '“小狗在树下睡觉”');
  ok(C.toy[3] === '苹果' && C.toy[6] === '它', 'ch5: the toy sentence'); says('ch5.p3', '「它」把 {wThing}% 的注意力给了「苹果」');
  ok(C.toy.join('') === '妈妈买了一些苹果，因为它很甜', 'ch5.p1 quotes the toy sentence'); says('ch5.p1', '妈妈买了一些苹果，因为它很甜');
  ok((-Math.log(0.01)).toFixed(1) === '4.6', 'ch7.p2: −ln 1% = 4.6'); says('ch7.p2', '给 1% 记 4.6');
  ok(/LRS = \[0\.5, 1, 2, 5, 10, 20, 50\]/.test(app), 'ch7: the learning-rate slider ends at 50'); says('ch7.p3', '最右边（50）');
  says('ch7.p3', 'd 只有 2 时');
  ok(/id="ngO" min="0" max="3"/.test(html) && /const v = \+sO\.value, o = v \+ 1/.test(app) && /ch3\.unit\.order', v, \{ v: fmt\(v\)/.test(app), 'ch3: slider value is the context length 0..3, order = value + 1'); says('ch3.p2', '从 0 拖到 3');
  for (const id of ['ngO', 'lpO']) { const m = html.match(new RegExp('id="' + id + '" min="(\\d+)" max="(\\d+)"')); ok(m && +m[1] === 0 && +m[2] === builds.zh.b.ng.maxOrder - 1, id + ': slider spans context lengths 0..' + (builds.zh.b.ng.maxOrder - 1) + ' (the table has ' + builds.zh.b.ng.maxOrder + ' orders)'); }
  ok(/id="vcK" min="1" max="24" step="1" value="8"/.test(html) && M.K0 === 8 && M.build(C).vectors.dims === 24, 'ch4: default 8 numbers per word, up to 24');
  ok(/value="8" checked/.test(html), 'ch7: default d = 8 (the ch8 table uses d = 8)'); says('ch8.table', 'd = 8');
  ok(/id="trLr" min="0" max="6" step="1" value="3"/.test(html), 'ch7: default learning rate index 3 = 5');
  ok(/id="smT" min="0" max="2" step="0.05" value="1"/.test(html), 'ch6: default temperature 1');
  ok(/id="lpO" min="0" max="3" step="1" value="3"/.test(html) && /const order = \+sO\.value \+ 1/.test(app), 'ch8: default looks at 3 tokens (order 4)');
  // sourced figures (see BRIEF.md): stated once each
  for (const [k, s] of [['ch8.table', '1750 亿'], ['ch8.table', '4050 亿'], ['ch8.table', '>96<'], ['ch8.table', '>126<'], ['ch8.table', '3000 亿'], ['ch8.table', '15.6 万亿'], ['ch8.table', '>2048<'], ['ch8.table', '最多 12.8 万'],
    ['ch1.p4', '12.8 万个 token'], ['ch4.limit', '12288'], ['ch5.p4', '96 层，每层 96 个头'],
    // added 2026-11-18 (see BRIEF.md): mixture-of-experts sizes, context windows, sampling parameters, thinking tokens
    ['ch8.tablenote2', '6710 亿'], ['ch8.tablenote2', '370 亿'], ['ch8.tablenote2', '14.8 万亿'], ['ch8.tablenote2', '1 万亿个参数'], ['ch8.tablenote2', '320 亿'], ['ch8.tablenote2', '15.5 万亿'], ['ch8.tablenote2', '36 万亿'], ['ch8.tablenote2', '100 万个 token'],
    ['ch6.p4', '2026 年 11 月'], ['ch8.p4b', '《自然》'], ['ch9.q3', '100 万个 token']]) says(k, s);
}

/* ── literal claims in the English prose (the English corpus is different; review 2026-11-18) ── */
{
  const { b: B, f: F } = builds.en, C = CORPUS.en, chunksAll = C.lines.flatMap(l => M.chunks(l, 'en'));
  const late = B.bpe.merges.slice(B.bpe.stop);
  // ch1.p3
  ok(F.m1 === '␣t' && B.bpe.merges[0].a === ' ' && B.bpe.merges[0].b === 't' && [' the', ' to', ' today'].every(w => chunksAll.includes(w)), 'en ch1.p3: the first merge is a space + "t", the start of the, to, today');
  saysEn('ch1.p3', 'joined a space and “t” into “{m1}”, the start of “the”, “to” and “today”');
  ok(['yesterday', 'thirsty', 'ig', 'nds'].every(x => late.some(m => m.ab.trim() === x && m.count === 2)), 'en ch1.p3: yesterday, thirsty, ig, nds are merges after the stop, each from a pair seen twice');
  saysEn('ch1.p3', '“yesterday” and “thirsty”, and fragments such as “ig” and “nds”, and each of them occurs only twice');
  ok(JSON.stringify(M.encode('this', B.tok)) === JSON.stringify([' th', 'is']) && chunksAll.filter(x => x === ' this').length === 2, 'en ch1.p3: "this" is cut into ␣th + is at the stop, and occurs twice');
  ok(F.sampleLong === 'because' && M.encode('because', B.tok).length === 1, 'en ch1.p3: "because" is one token');
  saysEn('ch1.p3', '“this” is still cut into “␣th” + “is”, because the word occurs only twice');
  // ch1.p1: English pre-splits at words, so no English token crosses a word (the cross-word claim is about Chinese)
  ok(B.tok.merges.every(m => !/ /.test(m.ab.slice(1))), 'en: no English token contains an inner space');
  saysEn('ch1.p1', 'in a language written without spaces, such as Chinese, it can even run across two words');
  // ch2.p3: no tie at the top of the "cat" row
  ok(F.top1ties === 1 && F.top1 === 'sleeps' && F.top1c === 5, 'en ch2: "sleeps" alone tops the cat row, 5 times');
  saysEn('ch2.p3', '“{top1}”, occurs only {top1c} times'); ok(!E['ch2.p3'].includes('{top1ties}'), 'en ch2.p3 does not state a tie count');
  // ch3.p1
  ok(M.ngramDist(B.ng, [' is'], 2).items.some(i => i.tok === ' sweet'), 'en ch3.p1: "is" can be followed by "sweet"');
  { const tri = M.ngramDist(B.ng, [' cat', ' is'], 3); ok(tri.L === 2 && tri.items.length === 1 && tri.items[0].tok === ' cute', 'en ch3.p1: "cat is" is only followed by "cute"'); }
  ok(C.lines.filter(l => /sweet/.test(l)).every(l => /apples|bananas|melon|fruit/.test(l)), 'en ch3.p1: only fruit is ever sweet in the corpus');
  saysEn('ch3.p1', 'only fruit is ever sweet');
  // ch3.p4, ch4.p1
  ok(C.lines.some(l => l.includes('the cat sleeps at home')) && !C.lines.some(l => l.includes('the dog sleeps at home')), 'en ch3.p4: corpus has "the cat sleeps at home" but not the dog');
  saysEn('ch3.p4', '“the dog sleeps at home” also makes sense, given “the cat sleeps at home”');
  ok(!C.lines.some(l => l.includes('the dog sleeps under the tree')), 'en ch4.p1: "the dog sleeps under the tree" is not in the corpus'); saysEn('ch4.p1', '“the dog sleeps under the tree”');
  // ch5.p1
  ok(C.toy.join(' ').replace(' ,', ',') === 'mom bought some apples, because they are sweet' && C.toy[5] === 'because' && C.toy[6] === 'they', 'en ch5: the toy sentence, "because" right before "they"');
  saysEn('ch5.p1', 'Mom bought some apples, because they are sweet.'); saysEn('ch5.p1', 'The nearest word to “they” is “because”');
  // ch6.p3: temperature 0 gives one sentence
  saysEn('ch6.p3', 'at temperature 0 all of them are the same sentence');
  // sourced figures, stated in English as in Chinese
  for (const [k, s] of [['ch8.table', '>175B<'], ['ch8.table', '>405B<'], ['ch8.table', '>96<'], ['ch8.table', '>126<'], ['ch8.table', '>300B<'], ['ch8.table', '>15.6T<'], ['ch8.table', '>2048<'], ['ch8.table', '>≤ 128K<'],
    ['ch1.p4', '128K tokens'], ['ch4.limit', '12288'], ['ch5.p4', '96 layers with 96 heads'],
    ['ch8.tablenote2', '671 billion'], ['ch8.tablenote2', '37 billion'], ['ch8.tablenote2', '14.8 trillion'], ['ch8.tablenote2', '1 trillion parameters'], ['ch8.tablenote2', '32 billion'], ['ch8.tablenote2', '15.5 trillion'], ['ch8.tablenote2', '36 trillion'], ['ch8.tablenote2', '1 million tokens'],
    ['ch6.p4', 'November 2026'], ['ch6.p4', '“bland and strangely repetitive”'], ['ch6.p4', '“unreliable tail”'], ['ch8.p4b', 'Nature'], ['ch9.q3', '1 million tokens']]) saysEn(k, s);
  says('ch6.p4', '“不可靠的尾巴”'); // Holtzman et al.: "the unreliable tail"
  // ch9.links: the sequel is named with its own title and, since it registered (2026-11-18), linked
  { const seqDir = path.join(dir, '..', 'what-a-frontier-model-takes'), seq = { window: {} };
    let title = '造出并运行一个最前沿的大语言模型，需要什么';
    if (fs.existsSync(path.join(seqDir, 'copy.zh.js'))) { vm.runInNewContext(fs.readFileSync(path.join(seqDir, 'copy.zh.js'), 'utf8'), seq); title = seq.window.ESSAY_COPY.zh['hero.title']; }
    says('ch9.links', '《' + title + '》');
    saysEn('ch9.links', '“What It Takes to Build and Run a Frontier Large Language Model”');
    for (const L of [Z, E]) ok(L['ch9.links'].includes('href=\"../what-a-frontier-model-takes/\"'), 'ch9.links links the sequel'); }
  // English wording: no "(s)" plurals left
  ok(!Object.values(E).some(v => /\(s\)/.test(v)), 'en copy has no "(s)" plurals');
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
  ok(JSON.stringify(Object.keys(E)) === JSON.stringify(Object.keys(Z)), 'copy.en.js and copy.zh.js have the same keys in the same order');
  for (const [k, v] of Object.entries(E)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    if (proseKeys.has(k)) ok(m[1] in F || m[1] === 'prompt', `English static prose ${k}: {${m[1]}} is a fact`);
    else ok(appVars.has(m[1]), `English live text ${k}: {${m[1]}} is supplied by app.js`);
  }
  const keys = new Set(proseKeys);
  for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) if (!m[1].endsWith('.')) keys.add(m[1]);
  for (const m of app.matchAll(/\btn\('([\w.]+)'/g)) { keys.add(m[1]); keys.add(m[1] + '1'); } // count units with a singular key
  for (const m of app.matchAll(/'(ch\d\.say\.\w+)'/g)) keys.add(m[1]);
  for (let g = 0; g < 5; g++) keys.add('ch4.group.' + g);
  // diagram keys: aria and caption of every figure, and every literal 'dg.…' key in app.js
  const figs = [...html.matchAll(/data-dg="(\w+)"/g)].map(m => m[1]);
  ok(figs.length >= 6, `at least six diagrams (${figs.length})`);
  for (const f of figs) { keys.add('dg.' + f + '.aria'); keys.add('dg.' + f + '.cap'); ok(new RegExp('DG\\.' + f + ' = ').test(app), 'diagram builder for ' + f); }
  for (const m of app.matchAll(/'(dg\.\w+\.\w+)'/g)) keys.add(m[1]);
  for (const f of figs) for (const k of Object.keys(Z).filter(k => k.startsWith('dg.' + f + '.'))) ok(k.endsWith('.aria') || k.endsWith('.cap') || app.includes("'" + k + "'") || app.includes("'dg." + f + ".' + "), 'diagram key is used: ' + k);
  for (const k of keys) ok(Z[k] != null, 'zh key exists: ' + k);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(dir, file), 'utf8');
    // the page-provenance label (added at registration, 2026-11-18) is bilingual by contract: exactly one, stripped before the
    // check (and before comment stripping, which would cut its https:// link)
    if (file === 'index.html') { ok((src.match(/<details class="page-provenance"/g) || []).length === 1, 'one page-provenance label'); src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, ''); }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    // the static <title> and meta description stay Chinese for crawlers and link previews (replaced at load)
    if (file === 'index.html') src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '');
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    ok(!others.length, `no Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`);
  }
  ok(!/[一-鿿]/.test(fs.readFileSync(path.join(dir, 'corpus.en.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')), 'no Chinese in the English corpus');
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (prose numbers come from the models, for both corpora)`);
