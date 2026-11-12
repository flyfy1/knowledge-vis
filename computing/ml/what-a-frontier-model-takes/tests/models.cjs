'use strict';
// Checks the essay's models and pins every number its prose states.
// 1. The tiny transformer in models.js reproduces the logits of the training script (tests/reference.json),
//    the KV cache gives the same output as recomputing, and quantising/ablating gives the stated results.
// 2. Parameter and FLOP counts match the published configurations exactly.
// 3. Every number in the Chinese prose is recomputed from models.js (or from the training record in weights.js)
//    and formatted the way the page formats it, then looked up in the prose.
// Run: node computing/ml/what-a-frontier-model-takes/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} };
for (const f of ['copy.zh.js', 'weights.js']) vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh, PACK = ctx.window.TINY_TF;
const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference.json'), 'utf8'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

let n = 0, fails = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.error('FAIL ' + msg); } }
const plain = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
function says(key, phrase) { ok(Z[key] != null && plain(Z[key]).includes(phrase), `prose ${key} should contain "${phrase}"`); }
const fmt = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = (x, d = 1) => { let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e); if (+m.toFixed(d) >= 10) { m /= 10; e++; } return m.toFixed(d) + '×10' + String(e).split('').map(c => SUP[c]).join(''); };
const yi = x => fmt(x / 1e8, 0) + ' 亿'; // Chinese "hundred million" units as the prose writes them (no grouping below 10,000)
const ids = s => [...s].map(c => c.charCodeAt(0) - 97);
const close = (a, b, tol) => Math.abs(a - b) <= tol;

/* ───────── 1. the tiny transformer ───────── */
const TINY = M.TF.decode(PACK);
ok(PACK.cfg.V === 26 && PACK.cfg.T === 24 && PACK.cfg.d === 32 && PACK.cfg.L === 2 && PACK.cfg.H === 2 && PACK.cfg.F === 128, 'tiny config as the prose describes it');
ok(TINY.flat.length === 27930 && M.TF.layout(PACK.cfg).size === 27930 && PACK.params === 27930, 'tiny model has 27,930 parameters');
ok(M.countParams(M.PRESETS.tiny).total === 27930, 'the parameter counter agrees with the tiny model\'s own layout');
ok(fs.statSync(path.join(dir, 'weights.js')).size < 300 * 1024, 'weights.js under 300 KB');
ok(!/<script[^>]+weights\.js/.test(html) && /weights\.js/.test(app), 'weights.js is lazy-loaded by app.js, not a static <script>');
let worst = 0;
for (const r of REF.ref) { const lg = M.TF.forward(TINY, r.toks, {}).logits; for (let k = 0; k < lg.length; k++) worst = Math.max(worst, Math.abs(lg[k] - r.logits[k])); }
ok(REF.ref.length >= 5 && worst < 1e-9, `forward pass matches the training script's logits (worst |Δ| ${worst})`);

// KV cache: same output, stated operation counts (ch8)
{
  const prompt = ids('tokenstokenstokenstokens'.slice(0, 6));
  const a = M.TF.generate(TINY, prompt, 24 - 6 + 1, false), b = M.TF.generate(TINY, prompt, 24 - 6 + 1, true);
  ok(a.out.join() === b.out.join(), 'cached and uncached generation write the same letters');
  for (const k of [3, 9, 12]) { const p = ids('tokenstokenst'.slice(0, k)); ok(M.TF.generate(TINY, p, 25 - k, false).out.join() === M.TF.generate(TINY, p, 25 - k, true).out.join(), `cache equivalence with a ${k}-letter prompt`); }
  const steps = a.perTok.length, noT = a.perTok.reduce((x, y) => x + y, 0), yesT = [b.prefill].concat(b.perTok.slice(0, steps - 1)).reduce((x, y) => x + y, 0);
  const full = new M.TF.Ops(); M.TF.forward(TINY, ids('tokenstokenstokenstokens'), { ops: full });
  ok(yesT === full.mac, `with the cache, generation costs exactly one full 24-letter forward (${yesT} vs ${full.mac})`);
  says('ch8.p3', fmt(noT)); says('ch8.p3', fmt(yesT)); says('ch8.p3', fmt(noT / yesT, 1) + ' 倍');
  ok(b.cacheNumbers === 2 * 2 * 24 * 32, 'cache holds 2 × layers × positions × width numbers');
  says('ch8.p3', '24 个位置');
}

// ch1: the worked example
{
  const s = 'tokenstokenstokenstokens', r = M.TF.forward(TINY, ids(s), { record: true }), n = 24;
  const p12 = M.TF.softmaxRow(r.logits, 12 * 26, 26), p4 = M.TF.softmaxRow(r.logits, 4 * 26, 26);
  const top = p => p.indexOf(Math.max(...p));
  ok(top(p12) === 'o'.charCodeAt(0) - 97, 'ch1: position 12 predicts o');
  says('ch1.p3', `概率 ${fmt(p12[14] * 100, 1)}%`);
  const A = r.rec.attn[1][1];
  says('ch1.p3', `头 1.1 把 ${fmt(A[12 * n + 1] * 100, 0)}% 的注意力放在第 1 位`);
  ok(A[12 * n + 1] === Math.max(...[1, 7].map(j => A[12 * n + j])), 'ch1: of the positions after earlier t\'s, head 1.1 looks most at position 1');
  ok(top(p4) === 't'.charCodeAt(0) - 97, 'ch1: position 4 (n) favours t');
  says('ch1.p3', `最看好的是「t」，只给 ${fmt(p4[19] * 100, 0)}%`); says('ch1.p3', `学到的 ${fmt(p4[19] * 100, 0)}%`);
  ok(PACK.cfg.pMax - 5 + 1 === 8, 'ch1: block lengths 5..12 leave 8 cases');
  says('ch1.p3', '1/8 = 12.5%'); says('ch1.p3', '是 5 到 12，共 8 种');
  says('ch1.p1', '27,930 个参数'); says('hero.note', '27,930 个参数');
  says('ch1.p1', `一次最多看 ${PACK.cfg.T} 个字母`); says('ch1.p1', `（${PACK.cfg.pMin} 到 ${PACK.cfg.pMax} 个）`);
  says('ch1.eq', '32×96'); says('ch1.eq', '128×32'); says('ch1.eq', '32×26'); says('ch1.eq', '√16');
}

// ch4: the training record
{
  const R = PACK.train, at = s => R.step.indexOf(s), last = R.step.length - 1;
  ok(R.step[last] === 3000 && PACK.steps === 3000 && PACK.batch === 32 && PACK.evalEvery === 50, 'ch4: 3000 steps, batch 32, eval every 50');
  says('ch4.p2', '训练了 3000 步，每 50 步'); says('ch4.p2', '128 串'); says('ch4.p1', '32 串字母');
  says('ch4.p3', `从 ${fmt(R.loss[at(0)], 2)} 慢慢降到 ${fmt(R.loss[at(200)], 2)}`);
  says('ch4.p3', `从 ${fmt(R.accRep[at(250)] * 100, 0)}% 跳到 ${fmt(R.accRep[at(350)] * 100, 0)}%`);
  says('ch4.p3', `从 ${fmt(R.heads[at(250)][3][1], 2)} 跳到 ${fmt(R.heads[at(350)][3][1], 2)}`);
  ok(R.accRep[at(300)] > R.accRep[at(250)] && R.accRep[at(350)] > R.accRep[at(300)], 'ch4: the jump is between steps 250 and 350');
  ok(R.accRep[at(200)] < 0.3 && R.accRep[at(400)] > 0.9, 'ch4: before 200 the second pass is mostly wrong, after 400 mostly right');
  says('ch4.p3', `总损失是 ${fmt(R.loss[last], 3)}，困惑度 ${fmt(Math.exp(R.loss[last]), 1)}`);
  const bl = M.bayesLoss(PACK.cfg).mean;
  says('ch4.p4', fmt(bl, 3) + ' nat');
  ok(R.loss[last] > bl, 'ch4: final loss is above the exact floor');
  // head roles at the end of training
  const H = R.heads[last];
  ok(H[3][1] > 0.9 && [0, 2, 3].every(k => H[k][0] < H[1][0] / 3), `ch4: head 0.1 is the previous-token head (${H[1][0]}) and head 1.1 the induction head (${H[3][1]})`);
  says('ch4.p3', `平均 ${fmt(H[1][0] * 100, 0)}% 的注意力落在那里，其他三个头只有 ${fmt(Math.min(H[0][0], H[2][0], H[3][0]) * 100, 0)}% 到 ${fmt(Math.max(H[0][0], H[2][0], H[3][0]) * 100, 0)}%`);
}

// ch9: quantisation of the tiny model (same 150 sequences as the page)
const EVAL = M.evalSet(99, 150);
{
  const base = M.TF.evaluate(TINY, EVAL), q = b => M.TF.evaluate(M.TF.quantize(TINY, b).model, EVAL);
  const q8 = q(8), q4 = q(4), q3 = q(3), q2 = q(2);
  says('ch9.p5', `损失从 ${fmt(base.loss, 3)} 变成 ${fmt(q4.loss, 3)}`);
  says('ch9.p5', `掉到 ${fmt(q3.accRep * 100, 1)}%`); says('ch9.p5', `只剩 ${fmt(q2.accRep * 100, 1)}%`);
  ok(q8.accRep === 1 && q4.accRep >= 0.9995 && Math.abs(q8.loss - base.loss) < 0.002, `ch9: 8 and 4 bits keep (almost) every second-pass prediction (${q8.accRep}, ${q4.accRep})`);
  ok(M.TF.quantize(TINY, 32).bytes === 111720 && M.TF.quantize(TINY, 8).bytes === 32000 && M.TF.quantize(TINY, 4).bytes === 18496, 'ch9: weight bytes at 32/8/4 bits');
  ok(base.accRep === 1, 'ch11: nothing ablated, the second pass is all right');
  // ch11: ablation
  const ab = k => M.TF.evaluate(TINY, EVAL, { ablate: new Set([k]) });
  const a11 = ab('1.1'), a01 = ab('0.1'), a00 = ab('0.0'), a10 = ab('1.0');
  says('ch11.p3', `从 ${fmt(base.accRep * 100, 0)}% 掉到 ${fmt(a11.accRep * 100, 1)}%`);
  says('ch11.p3', `拆掉头 0.1，掉到 ${fmt(a01.accRep * 100, 1)}%`);
  ok(a00.accRep === 1 && a10.accRep === 1, 'ch11: removing head 0.0 or 1.0 leaves the second pass all right');
  says('ch11.p1', '150 串字母'); says('ch9.q.how', '150 串');
}

/* ───────── 2. ch2: depth ───────── */
{
  const r = M.depthRun({ L: 48, g: 0.8 });
  says('ch2.p3', `只剩输入的 ${sci(r.plain.act[48])} 倍`); says('ch2.p3', `只剩 ${sci(r.plain.grad[0])} 倍`);
  says('ch2.p3', `放大到 ${sci(r.res.act[48])} 倍`);
  says('ch2.p3', `信号是 ${fmt(r.preln.act[48], 1)} 倍，梯度 ${fmt(r.preln.grad[0], 1)} 倍`);
  const r1 = M.depthRun({ L: 48, g: 1 });
  ok(r1.plain.act[48] > 0.05 && r1.plain.act[48] < 20, `ch2: at gain 1 the plain stack survives (${r1.plain.act[48]})`);
  ok(r.preln.act[48] < Math.sqrt(48) * 1.5, 'ch2: pre-LN grows about like √L');
}

/* ───────── 3. ch3: counting ───────── */
{
  const P = k => M.countParams(M.PRESETS[k]).total;
  ok(P('gpt3') === 174604259328, 'GPT-3 parameter count'); says('ch3.p2', '174,604,259,328');
  ok(P('llama8') === 8030261248, 'Llama 3 8B parameter count'); says('ch3.p2', '8,030,261,248');
  ok(P('llama70') === 70553706496, 'Llama 3 70B parameter count'); says('ch3.p3', '70,553,706,496');
  ok(P('llama405') === 405853388800, 'Llama 3.1 405B parameter count');
  const f8 = M.flopsPerToken(M.PRESETS.llama70, 8192), f131 = M.flopsPerToken(M.PRESETS.llama70, 131072);
  says('ch3.p3', `前向约 ${fmt(f8.total / 1e9, 0)} GFLOP`); says('ch3.p3', `占 ${fmt(f8.attnShare * 100, 1)}%`); says('ch3.p3', `涨到 ${fmt(f131.attnShare * 100, 1)}%`);
  ok(M.PRESETS.llama405.L === 126, 'Llama 405B has 126 layers'); says('ch2.p4', '126 层');
  ok(M.PRESETS.llama70.kv === 8, 'Llama 3 GQA has 8 KV groups'); says('ch3.p2', '是 8 组');
  ok(M.PRESETS.llama8.V === 128256, 'Llama vocabulary'); says('ch3.limit', '128,256');
}

/* ───────── 4. ch5: scaling ───────── */
{
  const E = M.FITS.epoch, Hf = M.FITS.hoffmann, C = Math.pow(10, 23.5), o = M.chinOpt(C, E);
  says('ch5.p3', `预算是 ${sci(C, 2)} FLOP`);
  const N = Math.pow(10, 11.25), D = C / 6 / N;
  says('ch5.p3', `金点是 ${Math.round(N / 1e8)} 亿参数读 ${Math.round(D / 1e9) * 10} 亿 token`);
  says('ch5.p3', `最优是 ${Math.round(o.N / 1e8)} 亿参数读 ${Math.round(o.D / 1e9) * 10} 亿 token，每个参数配 ${fmt(o.ratio, 1)} 个`);
  says('ch5.p3', `损失高出 ${fmt(M.chinLoss(N, D, E) - o.loss, 3)}`);
  // GPT-3's loss at the optimal split: smallest C whose optimum reaches it
  const Lg = M.chinLoss(174.6e9, 300e9, E), Cg = 6 * 174.6e9 * 300e9;
  let lo = Cg * 0.01, hi = Cg; for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); if (M.chinOpt(m, E).loss > Lg) lo = m; else hi = m; }
  says('ch5.p3', `只要 GPT-3 算力的 ${fmt(hi / Cg * 100, 0)}%`);
  says('ch5.p4', `每个参数配约 ${fmt(M.chinOpt(C, Hf).ratio, 0)} 个 token`);
  ok(close(M.chinOpt(C, E).ratio, 20, 2), 'ch5: the re-fit gives about 20 tokens per parameter');
  const n8 = 8.03e9, d8 = 15e12, C8 = 6 * n8 * d8;
  says('ch5.p4', `每个参数 ${fmt(d8 / 8e9, 0)} 个`);
  says('ch5.p4', `损失只比最优高 ${fmt(M.chinLoss(n8, d8, E) - M.chinOpt(C8, E).loss, 3)}`);
  ok(close((d8 / n8) / M.chinOpt(C8, E).ratio, 100, 10), 'ch5: Llama 3 8B read about a hundred times the optimal tokens per parameter');
}

/* ───────── 5. ch6: the bill ───────── */
{
  const b = M.bill({ N: 405e9, D: 15.6e12, hw: 'h100', mfu: 0.41, gpus: 16384, price: 2.5 });
  says('ch6.p2', `= ${sci(b.flops, 2)} FLOP`);
  says('ch6.p2', `这是 ${fmt(b.gpuHours / 1e4, 0)} 万个 H100 卡时`); says('ch6.p2', `要跑 ${fmt(b.days, 0)} 天`);
  says('ch6.p2', `耗电 ${fmt(b.mwh / 1e4, 1)} 万兆瓦时`); says('ch6.p2', `约 ${Math.round(b.cost / 5e6) * 500} 万美元`);
  ok(close(b.cost, 6.5e7, 0.05e7), 'ch6: about $65M');
  says('ch6.p2', '3.8×10²⁵'); ok(M.FRONTIER.llama31.flop === 3.8e25, 'Llama 3.1 compute as disclosed');
  says('ch6.p2', `${Math.round(M.FRONTIER.llama31.gpuHours405 / 1e4)} 万卡时`); says('ch6.say.llama405', `${fmt(M.FRONTIER.llama31.gpuHours405 / 1e4, 0)} 万个卡时`);
  says('ch6.p2', `合计 ${Math.round(M.FRONTIER.llama31.gpuHoursAll / 1e4)} 万卡时`);
  says('ch6.p1', '38% 到 43%'); ok(M.FRONTIER.llama31.mfuLo === 0.38 && M.FRONTIER.llama31.mfuHi === 0.43, 'MFU range');
  says('ch6.p1', '1,979'); ok(M.HW.h100.peak === 1979e12 / 2, 'H100 dense = sparse ÷ 2'); says('ch6.p1', '989 万亿');
  says('ch6.say.llama405', `${M.FRONTIER.llama31.interruptions} 次意外中断`); says('ch6.say.llama405', '54 天');
  says('ch6.say.dsv3', `${fmt(M.FRONTIER.dsv3.gpuHours / 1e4, 1)} 万个 H800 卡时`);
  says('ch6.p3', `${M.FRONTIER.h100Price.lambdaOnDemand} 美元`);
  ok(close(2.788e6 * 2, 5.576e6, 1), 'DeepSeek-V3 $5.576M = 2.788M hours × $2'); says('ch6.p3', '557.6 万美元');
  const g = M.bill({ N: 174.6e9, D: 300e9, hw: 'h100', mfu: 0.41, gpus: 16384, price: 2.5 });
  ok(close(g.flops, 3.14e23, 0.01e23), 'ch6: GPT-3 6ND ≈ 3.14×10²³ (paper)'); says('ch5.p3', '3.14×10²³');
}

/* ───────── 6. ch7: LoRA and benchmarks ───────── */
{
  const l = M.lora(M.PRESETS.gpt3, 4, 'qv');
  says('ch7.p3', `给出 ${fmt(l.train)} 个参数`); says('ch7.p3', `1/${fmt(l.ratio, 0)}`);
  says('ch7.p3', `是 ${fmt(l.memFull / l.memLora, 0)} 倍（${fmt(l.memFull / 1e12, 2)} TB 对 ${fmt(l.memLora / 1e9, 0)} GB）`);
  ok(l.ratio > 9000 && l.ratio < 11000, 'ch7: about ten thousand times fewer trainable parameters');
  const r = M.benchReversal({ n: 500, pA: 0.8, pB: 0.78, err: 0, cB: 0 });
  says('ch7.p5', `约 ±${fmt(r.se1 * 100, 1)} 个百分点`); says('ch7.p5', `概率约 ${fmt(r.p * 100, 0)}%`);
  const s = M.benchSim({ n: 500, pA: 0.8, pB: 0.78, err: 0, cB: 0, trials: 4000, seed: 3 });
  ok(close(s.reversal, r.p, 0.02), `ch7: simulation agrees with the normal approximation (${s.reversal} vs ${r.p})`);
  says('ch7.p5', '14,042 道题'); says('ch7.p5', '6.49%'); says('ch7.p5', '57%');
  says('ch7.p5', `±${M.FRONTIER.hle.ci}`);
  ok(app.includes('14042'), 'MMLU size is on the question-count slider');
}

/* ───────── 7. ch8–ch9: inference ───────── */
{
  const kv = k => M.kvBytesPerToken(M.PRESETS[k], 2);
  ok(kv('llama70') === 327680 && kv('llama8') === 131072 && kv('llama405') === 516096, 'KV bytes per token');
  says('ch8.p4', `= ${fmt(kv('llama70'))} 字节`); says('ch8.p4', `缓存是 ${fmt(kv('llama70') * 131072 / 1e9, 1)} GB`);
  says('ch8.p4', '80 层、8 组 KV、每头 128 维'); says('ch8.p4', '2 × 80 × 8 × 128 × 2');
  ok(kv('llama70') * 131072 > 40e9 && kv('llama70') * 131072 < 80e9, 'ch8: a 128K conversation is more than half an H100');
  ok(M.PRESETS.llama70.heads / M.PRESETS.llama70.kv === 8, 'ch8: without GQA the cache is 8×'); says('ch8.p4', '要乘 8');
  const base = { model: 'llama70', hw: 'h100', gpus: 4, bits: 16, ctx: 8192, price: 2.5 };
  const s32 = M.serveStep(Object.assign({}, base, { batch: 32 })), s1 = M.serveStep(Object.assign({}, base, { batch: 1 })), s64 = M.serveStep(Object.assign({}, base, { batch: 64 }));
  says('ch9.p3', `每秒约 ${fmt(s32.perUser, 0)} 个 token，合计约 ${fmt(s32.tps, 0)} 个`); says('ch9.p3', `约 ${fmt(s32.costPerM, 2)} 美元`);
  says('ch9.p3', `（${fmt(s1.perUser, 0)} 个/秒）`); says('ch9.p3', `涨到约 ${fmt(s1.costPerM, 1)} 美元`);
  says('ch9.p3', `缓存（${fmt(s64.kv / 1e9, 0)} GB）`); says('ch9.p3', `权重（${fmt(s64.wBytes / 1e9, 0)} GB）`);
  ok(s64.kv > s64.wBytes && M.serveStep(Object.assign({}, base, { batch: 32 })).kv < s32.wBytes, 'ch9: the cache passes the weights between batch 32 and 64');
  ok(s32.bound === 'memory' && s1.bound === 'memory', 'ch9: decode at batch 1 and 32 is memory-bound');
  const q4 = M.serveStep(Object.assign({}, base, { batch: 32, bits: 4 }));
  says('ch9.p3', `从 ${fmt(s32.perUser, 0)} 涨到 ${fmt(q4.perUser, 0)} 个/秒`);
  ok(M.HW.h100.bw === 3.35e12, 'H100 bandwidth'); says('ch9.p1', '3.35 TB');
  says('ch9.p1', `约 ${fmt(Math.round(M.HW.h100.peak / M.HW.h100.bw / 100) * 100, 0)} 次运算`);
  says('ch9.limit', '50%'); ok(/eff \|\| 0\.5/.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')), 'roofline efficiency default 50%');
  const F = M.FRONTIER.prices;
  says('ch9.p4', `${F.dsProOutLo} 到 ${F.dsProOutHi} 美元`); says('ch9.p4', `收 ${F.astraOut} 美元`); says('ch9.p4', `收 ${F.fableOut} 美元`);
  says('ch9.p4', '1.6 万亿'); says('ch9.p4', '490 亿');
}

/* ───────── 8. ch10: cheaper ───────── */
{
  const st = M.moeNew({ E: 16 }), o = { k: 2, cf: 1.25, skew: 1 }, r0 = M.moeRoute(st, o);
  says('ch10.p3', `平均的 ${fmt(r0.maxOverMean, 1)} 倍，${fmt(r0.dropShare * 100, 1)}% 的分配`);
  for (let i = 0; i < 200; i++) M.moeBalanceStep(st, o, 0.01);
  const r1 = M.moeRoute(st, o);
  ok(r1.dropShare === 0, 'ch10: after 200 balancing rounds nothing is dropped');
  says('ch10.p3', `均衡损失从 ${fmt(r0.aux, 1)} 降到 ${fmt(r1.aux, 1)}`);
  says('ch10.p5', `平均产出 ${fmt(M.specTokens(0.8, 4), 2)} 个 token，加速 ${fmt(M.specSpeedup(0.8, 4, 0.05), 2)} 倍`);
  const b = M.specBest(0.8, 0.05);
  says('ch10.p5', `草稿写到 ${b.gamma} 个最好，${fmt(b.speedup, 2)} 倍`);
  ok(close(M.specSim(0.8, 4, 20000).mean, M.specTokens(0.8, 4), 0.05), 'ch10: simulation agrees with the formula');
  // spec: the formula for α → 1 and γ = 0
  ok(M.specTokens(0.999999, 4) > 4.99 && close(M.specTokens(0.5, 0), 1, 1e-12), 'ch10: formula limits');
  says('ch10.p1', '6710 亿参数、每个 token 激活 370 亿'); ok(M.FRONTIER.dsv3.total === 671e9 && M.FRONTIER.dsv3.active === 37e9, 'DeepSeek-V3 sizes');
  says('ch10.p1', '1.6 万亿和 490 亿'); ok(M.FRONTIER.dsv4.total === 1.6e12 && M.FRONTIER.dsv4.active === 49e9, 'DeepSeek-V4-Pro sizes');
  says('ch10.p6', `每百万输出 token ${F2()} 美元`); says('ch10.p6', `光思考就是 ${fmt(20000 * M.FRONTIER.prices.astraOut / 1e6, 0)} 美元`);
  function F2() { return M.FRONTIER.prices.astraOut; }
}

/* ───────── 9. ch12: the dated frontier block ───────── */
{
  const FR = M.FRONTIER, all = FR.compute;
  ok(FR.asOf === '2026-11', 'frontier data dated');
  ok(all.every(p => ['disclosed', 'derived', 'estimate'].includes(p.kind) && (p.kind !== 'estimate' || p.conf)), 'every compute point has a kind, estimates a confidence');
  const rec = M.computeTrend(M.records(all)), known = M.computeTrend(all.filter(p => p.kind !== 'estimate'));
  says('ch12.p2', `每年约增长 ${fmt(rec.perYear, 1)} 倍`); says('ch12.p2', `只有每年约 ${fmt(known.perYear, 1)} 倍`);
  ok(rec.perYear > known.perYear, 'records grow faster than the verifiable points');
  ok(M.records(all).map(p => p.id).join() === 'gpt3,chinchilla,gpt4,gemini1u,grok3,gpt45,grok4,astra', 'record-setters');
  const top = all.reduce((a, p) => p.flop > a.flop ? p : a);
  ok(top.id === 'astra' && top.kind === 'estimate', 'largest training is an estimate');
  says('ch12.f.compute', sci(top.flop, 1) + ' FLOP'); says('ch12.f.compute', '5×10²⁶ 到 2×10²⁷');
  ok(FR.epochOver1e25 === 25 && FR.epochOver1e26 === 4 && app.includes('epochOver1e25') && app.includes('epochOver1e26'), 'counts over 10²⁵/10²⁶ come from the data block');
  says('ch12.f.context', fmt(FR.context.astra)); says('ch12.f.context', '922,000'); says('ch12.f.context', '128,000');
  says('ch12.f.bench', `${fmt(FR.hle.top, 2)} ± ${FR.hle.ci}`); says('ch12.f.bench', `第二名 ${fmt(FR.hle.second, 2)}`);
  const P = FR.prices;
  says('ch12.f.price', `输入 ${P.astraIn} 美元、输出 ${P.astraOut} 美元`); says('ch12.f.price', `输入 ${P.fableIn} 美元、输出 ${P.fableOut} 美元`);
  says('ch12.f.price', `输入 ${P.dsProInLo} 到 ${P.dsProInHi} 美元、输出 ${P.dsProOutLo} 到 ${P.dsProOutHi} 美元`);
  says('ch12.f.clusters', `${FR.clusters.colossus2MW} 兆瓦`); says('ch12.f.clusters', `${FR.clusters.abileneMW} 兆瓦`); says('ch12.f.clusters', `${fmt(FR.clusters.newCarlisleMW)} 兆瓦`);
  says('ch12.f.params', '32 万亿 token'); ok(FR.dsv4.tokens === 32e12, 'DeepSeek-V4 tokens');
  ok(FR.thresholds.eu === 1e25 && FR.thresholds.ca === 1e26, 'regulatory thresholds'); says('ch12.f.law', '10²⁵'); says('ch12.f.law', '10²⁶');
  says('ch12.f.law', '2025 年 8 月 2 日'); says('ch12.f.law', '2026 年 8 月 2 日'); says('ch12.f.law', '2026 年 1 月 1 日'); says('ch12.f.law', '2025 年 9 月 1 日');
  says('ch12.q2', '15 万亿'); says('ch12.q2', '32 万亿');
  says('ch12.q4', '39%');
  // every frontier fact is labelled with one of the three kinds
  for (const k of Object.keys(Z).filter(k => k.startsWith('ch12.f.'))) ok(/<span class=\\?"tag [hml]\\?">/.test(Z[k]), `${k} carries a kind label`);
  for (const k of ['h', 'm', 'l']) ok(Object.keys(Z).some(x => x.startsWith('ch12.f.') && Z[x].includes(`tag ${k}`)), `some fact is labelled ${k}`);
  for (const k of Object.keys(Z).filter(k => k.startsWith('ch12.f.'))) ok(html.includes(`data-i18n-html="${k}"`), `${k} is on the page`);
  // every frontier entry has a display name
  for (const p of all) ok(Z['ch12.name.' + p.id] != null, `name for ${p.id}`);
}

/* ───────── 10. copy hygiene ───────── */
{
  const keys = Object.keys(Z), src = fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8');
  const decl = [...src.matchAll(/^\s*"([^"]+)":/gm)].map(m => m[1]);
  ok(decl.length === new Set(decl).size, 'no copy key is declared twice: ' + decl.filter((k, i) => decl.indexOf(k) !== i).join(' '));
  for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] != null, `copy has ${m[1]}`);
  for (const m of app.matchAll(/\bt\('([a-z0-9]+(?:\.[\w]+)+)'/g)) ok(Z[m[1]] != null, `copy has ${m[1]} (app.js)`);
  ok(!/[一-鿿]/.test(app) && !/[一-鿿]/.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')), 'no Chinese in app.js or models.js');
  ok(/<title>[^<]*[一-鿿]/.test(html) && /<meta name="description" content="[^"]*[一-鿿]/.test(html), 'static Chinese title and description');
  for (const k of keys) ok(!/\{\w+\}/.test(Z[k]) || /\.(say|cv|read|meas|score|shape|sci)\b|^u\.|^ch\d+\.(say|sp)\.|^num\.|\.read\.|^ch12\.f\.compute$|^ch12\.kind\./.test(k), `placeholder in static prose ${k}`);
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
