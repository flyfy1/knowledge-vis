'use strict';
// Pins the page's models: the predictors against hand-worked sequences (1-bit, 2-bit, gshare index, TAGE history
// lengths), the return stack against its definition, the core simulator against invariants it must keep (every
// instruction commits once, in order; a fault commits exactly the instructions before it; renaming never loses to
// the scoreboard, the scoreboard never loses to in-order issue; the ROB never holds more than its size), the toy
// Spectre machine (noise-free probe reads the secret, lfence and masking stop it, the call costs); the real-chip figures
// against the values typed from their sources; every number the prose quotes (placeholders filled from prose(),
// literals checked against models.js); how far each conclusion moves when a tuned parameter is halved or doubled;
// every live sentence branch; copy keys, language hygiene, the registry and the sibling essays' aliases and anchors.
// Run: node computing/systems/how-a-cpu-guesses-ahead/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { CHIPS, ZEN, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);

/* ── real-chip figures, typed again from the sources (BRIEF.md lists URL and date for each) ── */
{
  // AMD 58455 rev 1.00 (Aug 2024) §2.8–2.10
  check('Zen 5 mispredict 12–18, common 15', [ZEN.penMin, ZEN.penMax, ZEN.pen].join(), '12,18,15');
  check('Zen 5 L1 BTB 16K, L2 BTB 8K, RAS 52, indirect 3072', [ZEN.l1btb, ZEN.l2btb, ZEN.ras, ZEN.indirect].join(), '16384,8192,52,3072');
  check('Zen 5 dispatch 8, retire queue 448 (224 per thread), retire 8, 240 int PRF, 6 ALU issue', [ZEN.width, ZEN.rob, ZEN.robSmt, ZEN.retire, ZEN.prf, ZEN.aluIssue].join(), '8,448,224,8,240,6');
  check('Zen 5 L1D 4, L2 14, L3 46 cycles (as in A2)', [ZEN.l1, ZEN.l2, ZEN.l3].join(), '4,14,46');
  // Chips and Cheese, Lion Cove (2024-09-27)
  check('Lion Cove ROB 576 (Redwood 512), rename 8 (6), RAS 24 (20)', [CHIPS.lionCove.rob, CHIPS.lionCove.prevRob, CHIPS.lionCove.width, CHIPS.lionCove.prevWidth, CHIPS.lionCove.ras, CHIPS.lionCove.prevRas].join(), '576,512,8,6,24,20');
  // Chips and Cheese, Cortex X925 (2026-03-03); WikiChip 768 quoted there
  check('X925 ~525 in flight, 10 wide, RAS 29, WikiChip 768', [CHIPS.x925.robMeasured, CHIPS.x925.width, CHIPS.x925.ras, CHIPS.x925.claimed].join(), '525,10,29,768');
  check('Haswell ROB 192 (Kocher et al. §II-B)', CHIPS.haswell.rob, 192);
  check('DRAM 399 cycles as in A2 (70 ns × 5.7 GHz)', CHIPS.dramCycles, Math.round(70 * 5.7));
  // frontier
  check('BPI 5.6 KiB/s, microcode 2.7%, software 1.6–8.3%, CVE-2024-45332', [FRONTIER.bpi.kibps, FRONTIER.bpi.ucode, FRONTIER.bpi.swMin, FRONTIER.bpi.swMax, FRONTIER.bpi.cve].join(), '5.6,2.7,1.6,8.3,CVE-2024-45332');
  check('Retbleed overheads AMD 14%, Intel 39%', [FRONTIER.retbleed.amd, FRONTIER.retbleed.intel].join(), '14,39');
  check('CBP2025 64 KB baseline, 192 KB budget, 2025-06-21', [FRONTIER.cbp.baselineKB, FRONTIER.cbp.budgetKB, FRONTIER.cbp.date].join(), '64,192,2025-06-21');
  check('Spectre paper: 10 KB/s, < 0.01% errors, up to 4×', [FRONTIER.spectre.kbps, FRONTIER.spectre.err, FRONTIER.spectre.mitMax].join(), '10,0.01,4');
  check('Stack Overflow 11.54 s vs 1.93 s, 2012-06-27', [FRONTIER.so.slow, FRONTIER.so.fast, FRONTIER.so.asked].join(), '11.54,1.93,2012-06-27');
  check('BTR 8 bit/s, reported 2026-09-30', [FRONTIER.btr.bps, FRONTIER.btr.reported].join(), '8,2026-09-30');
  // where the prose spells these out
  says('ch2.p4', '2012 年 6 月 27 日'); says('ch11.d3', 'CVE-2024-45332'); says('ch11.e2', '2025 年 6 月 21 日'); says('ch10.p4', '0.01%');
}

/* ── the cost formula, worked by hand ── */
{
  const z = M.cpi({ width: 8, penalty: 15, acc: 0.95 });   // 1/8 + 0.2 × 0.05 × 15 = 0.125 + 0.15 = 0.275
  near('CPI 8 wide, 15 cycles, 95%', z.cpi, 0.275, 1e-12); near('lost = 0.15 / 0.275', z.lost, 0.15 / 0.275, 1e-12);
  check('slots = 15 × 8', z.slots, 120);
  near('one miss per 100 instructions at 95%', z.perMiss, 100, 1e-9);
  near('A1 core: 1 + 0.2 × 0.05 × 2', M.cpi({ width: 1, penalty: 2, acc: 0.95 }).cpi, 1.02, 1e-12);
  check('perfect prediction loses nothing', M.cpi({ width: 8, penalty: 15, acc: 1 }).lost, 0);
  says('ch1.p3', '95% 的准确率'); says('ch1.p3', '准确率 90% 时'); says('ch1.p3', '99% 时');
  says('ch1.p2', '每 {fbrN} 条指令一条'); check('fbr = 1/5', M.COST.fbr, 0.2);
}

/* ── predictors, hand-worked ── */
{
  const seq = (kind, ts, cfg) => { const p = M.makePred(kind, cfg), out = []; for (const t of ts) { out.push(p.predict(0x40, { back: false })); p.update(0x40, t); } return out.join(''); };
  // 2-bit starts at 1 (weakly not taken): T → predicts N, ctr 2; T → T, 3; N → T (miss), 2; T → T, 3; N → T, 2; N → T, 1; T → N
  check('2-bit on T T N T N N T', seq('2bit', [1, 1, 0, 1, 0, 0, 1]), '0111110');
  // 1-bit repeats the last outcome
  check('1-bit on T T N T N N T', seq('1bit', [1, 1, 0, 1, 0, 0, 1]), '0110100');
  check('never-taken', seq('nt', [1, 0, 1]), '000');
  { const p = M.makePred('btfn'); check('BTFN: back taken, forward not', [p.predict(0, { back: true }), p.predict(0, { back: false })].join(), '1,0'); }
  // a loop exit: inner back-edge taken K − 1 times then not; the 1-bit counter misses twice per exit, the 2-bit once
  for (const K of [4, 8]) {
    const tr = []; for (let i = 0; i < 200; i++) for (let j = 0; j < K; j++) tr.push({ pc: 0x80, t: j < K - 1 ? 1 : 0, back: true });
    const r1 = M.runPred(M.makePred('1bit'), tr), r2 = M.runPred(M.makePred('2bit'), tr);
    check(`1-bit misses 2 per exit (plus the cold start), K=${K}`, r1.miss, 2 * 200); check(`2-bit misses 1 per exit (plus the cold start), K=${K}`, r2.miss, 200 + 1);
  }
  // gshare index: (pc >> 2) XOR the last h outcomes, masked to the table
  { const p = M.makePred('gshare', { bits: 4, hist: 3 }); for (const t of [1, 0, 1, 1]) p.update(0x40, t);   // ghr …1011, last 3 = 011
    check('gshare index = (0x40>>2) ^ 0b011 & 15', p.index(0x40), ((0x40 >> 2) ^ 0b011) & 15); }
  // gshare with h = 0 equals the PC-indexed 2-bit counter
  for (const tk of M.GS.traces) for (const nb of M.GS.sizes) check(`gshare h=0 = 2-bit (${tk}, ${nb})`, M.gshareAcc(tk, nb, 0), M.gshareAcc(tk, nb, -1));
  // TAGE: L(i) = int(α^(i−1) × 4 + 0.5), α = 16^(1/3)
  check('TAGE lengths 4, 10, 25, 64', M.tageLengths(4, 4, 64).join(), '4,10,25,64');
  { const a = Math.cbrt(16); check('lengths by the formula', [0, 1, 2, 3].map(i => Math.floor(4 * Math.pow(a, i) + 0.5)).join(), M.tageLengths(4, 4, 64).join()); }
  // storage: 2-bit and gshare exactly the budget; TAGE 1/16 more (tags and useful counters)
  for (const B of M.BUDGETS) { const b = M.compare('mix', B).bits; check('bimodal = gshare = budget ' + B, [b.bimodal, b.gshare].join(), [B, B].join()); check('TAGE = budget × 17/16, ' + B, b.tage, B * 17 / 16); }
  says('ch4.model.how', 'TAGE 的配置多出十六分之一'); says('ch4.model.how', '最有利的历史长度');
  says('ch4.p3', '预算 16 Kbit（2 KB）'); check('16 Kbit is a budget', M.BUDGETS.includes(16 * 1024), true); check('16 Kbit = 2 KB', 16 * 1024 / 8, 2048);
  says('ch4.p3', '从 32 Kbit 降到 4 Kbit'); check('4 and 32 Kbit are the end budgets', [M.BUDGETS[0], M.BUDGETS[M.BUDGETS.length - 1]].join(), '4096,32768');
  // the long loop needs 2K + 2 outcomes of history; gshare at 16 Kbit uses 13
  says('ch4.p3', '三十多次'); check('long loop: 2 × 16 branches per round, gshare history 13 < 32', 2 * 16 > M.budgetCfg(16384).gshare.bits && 2 * 16 + 2 < 40, true);
  says('ch4.model.how', '转 16 圈'); says('ch4.limit', '四张表、8 位标签'); check('TAGE M 4, 8-bit tags', [M.TAGE.M, M.TAGE.tagBits].join(), '4,8');
  // eqntott: two random branches of four, the other two determined → 75% is the ceiling
  { const tr = M.corrTrace(4000, 3); let det = 0; for (let i = 0; i < tr.length; i += 4) { const a = tr[i].t, b = tr[i + 1].t; if (tr[i + 2].t === (a === b ? 1 : 0)) det++; } check('corr: third branch = (first == second)', det, 4000); }
  says('ch3.p3', '75% 已经是能做到的上限'); check('TAGE on corr at the ceiling', Math.abs(M.compare('corr', 16384).tage - 0.75) < 0.005, true);
  says('ch3.p3', '固定 4 圈的循环'); says('ch3.p3', 'h = 8 时'); says('ch3.p3', '64 项的表上，h = 6'); says('ch3.p3', '1024 项、h = 10');
  check('table sizes 2^6 and 2^10', M.GS.sizes.map(b => 1 << b).join(), '64,1024'); says('ch3.size.6', '64'); says('ch3.size.10', '1024');
}

/* ── the return stack ── */
{
  for (const D of M.RAS.depths) for (const s of M.RAS.sizes) {
    const r = M.rasRun(D, s);
    if (r.maxDepth <= s) check(`RAS ${s} never misses when calls nest ≤ ${s} (D=${D})`, r.miss, 0);
    else check(`RAS ${s} misses when calls nest ${r.maxDepth} > ${s}`, r.miss > 0, true);
  }
  check('call trace: as many calls as returns, depth D', (() => { const ev = M.callTrace(24); return ev.filter(e => e.call != null).length === ev.filter(e => e.ret != null).length; })(), true);
  says('ch5.p3', '最深 24 层'); says('ch5.p3', '16 项的返回栈'); says('ch5.p3', '24 项和 52 项都是 {r24}'); check('24 and 52 entries give the same', M.rasRun(24, 52).rate, M.rasRun(24, 24).rate);
  says('ch5.p3', '最深 32 层、24 项'); check('24, 32 are slider stops; 16, 24, 52 are size options', [24, 32].every(d => M.RAS.depths.includes(d)) && [16, 24, 52].every(s => M.RAS.sizes.includes(s)), true);
  check('ch5 slider default 24', M.RAS.depths[+/id="rsD"[^>]*value="(\d+)"/.exec(html)[1]], 24);
}

/* ── the core ── */
{
  const iters = 12, base = { width: 4, iters };
  for (const missKey of [undefined, 'l2', 'l3', 'mem']) for (const rob of [8, 16, 32, 64]) {
    const o = Object.assign({ rob, miss: missKey && M.STEP.miss[missKey], missEvery: 2 }, base);
    const io = M.coreRun(Object.assign({ mode: 'inorder' }, o)), sb = M.coreRun(Object.assign({ mode: 'scoreboard' }, o)), oo = M.coreRun(Object.assign({ mode: 'ooo' }, o));
    const tag = `${missKey || 'hit'} rob ${rob}`;
    check('every instruction commits once, ' + tag, [io.committed, sb.committed, oo.committed].join(), [iters * 8, iters * 8, iters * 8].join());
    check('ooo ≤ scoreboard ≤ in-order, ' + tag, oo.cycles <= sb.cycles && sb.cycles <= io.cycles, true);
    check('window never exceeds the ROB, ' + tag, oo.maxInflight <= rob, true);
    check('IPC ≤ width, ' + tag, oo.ipc <= 4 + 1e-9, true);
  }
  // in-order commit: the committed sequence is the program order
  { const c = M.makeCore({ width: 4, rob: 16, mode: 'ooo', iters: 6, miss: 46, missEvery: 2 }); let order = []; const seen = new Set();
    while (!c.done) { const before = c.rob.map(x => x); c.step(); for (const x of before) if (!x.ghost && !c.rob.includes(x) && !seen.has(x.id)) { seen.add(x.id); order.push(x.e.it * 8 + x.e.j); } }
    check('commit order = program order', order.join(), Array.from({ length: 48 }, (_, i) => i).join()); }
  // a fault in iteration 4 (index 3) commits exactly the 24 before it; a mispredict squashes wrong-path work
  for (const at of [1, 3, 7]) { const r = M.coreRun({ width: 4, rob: 16, mode: 'ooo', iters, faultAt: at }); check('fault at ' + at + ' commits ' + at * 8, r.fault.committed, at * 8); }
  { const r = M.coreRun({ width: 4, rob: 16, mode: 'ooo', iters, mispredAt: 2 }); check('mispredict squashes', r.squashed > 0, true); check('mispredict still commits all', r.committed, iters * 8); }
  // width 1 in-order cannot exceed one per cycle
  check('in-order width 1 IPC < 1', M.coreRun({ width: 1, rob: 16, mode: 'inorder', iters: 32 }).ipc < 1, true);
  // tuned parameters: halving/doubling FE keeps a mispredict's cost near the penalty range, and the missEvery interval keeps the ordering
  for (const fe of [5, 20]) { const a = M.coreRun({ width: 4, rob: 16, mode: 'ooo', iters, mispredAt: 2, fe }), b = M.coreRun({ width: 4, rob: 16, mode: 'ooo', iters, fe }); check('FE ' + fe + ': mispredict costs FE + a few', a.cycles - b.cycles >= fe && a.cycles - b.cycles <= fe + 6, true); }
  // the tuned miss interval (every 2nd iteration): at every iteration and every 4th the ch7 claim (in-order > scoreboard > renaming) still holds
  for (const every of [1, 4]) { const o = { width: 4, rob: 32, iters, miss: M.STEP.miss.l3, missEvery: every }, cy = m => M.coreRun(Object.assign({ mode: m }, o)).cycles; check('missEvery ' + every + ': in-order > scoreboard > ooo', cy('inorder') > cy('scoreboard') && cy('scoreboard') > cy('ooo'), true); }
  // ch9: accuracy caps IPC at every window size; bigger windows help when prediction is perfect
  for (const r of M.WIN.robs) check('ch9: perfect ≥ 99% ≥ 95% ≥ 90% at ROB ' + r, M.WIN.accs.map(a => M.windowRun(r, a).ipc).every((x, i, A) => i === 0 || x <= A[i - 1] + 1e-9), true);
  check('ch9: IPC grows with ROB at 100%', M.WIN.robs.map(r => M.windowRun(r, 1).ipc).every((x, i, A) => i === 0 || x >= A[i - 1] - 1e-9), true);
  // literals in the prose
  says('ch6.model.how', '读数是 64 圈跑完的 IPC'); says('ch6.model.how', '乘法 3 拍'); check('mul 3 cycles', M.CORE.mul, 3);
  says('ch7.say.start', '每拍最多把 4 条放进 ROB'); check('stepper width 4 in app', /width: 4, rob: \+radioVal\('c7R'\)/.test(app), true);
  says('ch7.p3', 'ROB 32 项时'); says('ch7.p3', 'ROB 只有 16 项时'); check('ROB options 8/16/32, default 32', M.STEP.robs.join() + ' ' + /name="c7R" value="32"[^>]*checked/.test(html), '8,16,32 true');
  says('ch8.p2', 'ROB 16 项、读数全命中'); says('ch8.p3', '让第 3 圈的分支猜错'); says('ch8.ev.mp', '第 3 圈'); check('mispredAt 2 is the 3rd iteration', /mispredAt: e === 'mp' \? 2/.test(app), true);
  says('ch8.p3', '让第 4 圈的读数出错'); says('ch8.p3', '前 3 圈的全部'); says('ch8.ev.fault', '第 4 圈'); check('faultAt 3 is the 4th iteration', /faultAt: e === 'fault' \? 3/.test(app), true);
  says('ch9.p2', '64 字节的行'); check('16 ints per 64-byte line', M.CORE.missEvery * 4, 64);
  says('ch9.p3', 'ROB 64 项'); says('ch9.p3', '128 项'); says('ch9.p3', '512 项'); says('ch9.p3', '准确率 99% 时'); says('ch9.p3', '95% 时'); check('64/128/512 on the slider', [64, 128, 512].every(r => M.WIN.robs.includes(r)), true);
  check('ch9 accuracies on the radios', M.WIN.accs.every(a => html.includes(`name="wnA" value="${a}"`)), true);
}

/* ── the toy Spectre machine ── */
{
  const S = M.SPEC;
  { const toy = M.makeToy({ noise: 0 }); for (let k = 0; k < S.secret.length; k++) { const r = toy.readByte(k, S.train); check('noise-free read of byte ' + k, r.guess, S.secret.charCodeAt(k)); } }
  { const toy = M.makeToy({ noise: 0, mit: 'lfence' }); const r = toy.readByte(0, S.train); check('lfence: no speculative load', [r.spec, r.window, r.hits.length].join(), [null, 0, 0].join()); }
  { const toy = M.makeToy({ noise: 0, mit: 'mask' }); const r = toy.readByte(0, S.train); check('mask: the speculative read stays inside array1', r.spec != null && r.spec <= S.size && r.ok === false, true); }
  { const toy = M.makeToy({ noise: 0 }); const r = toy.readByte(0, 0); check('untrained: no speculative load', r.spec, null); }
  check('window = miss on array1_size + 1', M.makeToy({ noise: 0 }).readByte(0, S.train).window, S.miss + 1);
  check('call costs: none 2 hits, mask 1 + 2 hits, lfence hit + 1 + 2 hits', [M.callCost('none'), M.callCost('mask'), M.callCost('lfence')].join(), [2 * S.hit, 1 + 2 * S.hit, S.hit + 1 + 2 * S.hit].join());
  check('hit < threshold < miss', S.hit < S.thr && S.thr < S.miss, true);
  check('array1 size is a power of two (masking)', S.size & (S.size - 1), 0);
  says('ch10.p3', '噪声 20 拍'); check('default noise 20 on the slider', S.noises[+/id="spN"[^>]*value="(\d+)"/.exec(html)[1]], 20);
  check('default training on the slider', +/id="spT"[^>]*value="(\d+)"/.exec(html)[1], S.train);
  says('ch10.model.how', '256 行'); check('256 lines', 256, 2 ** 8);
  // the conclusion holds for other seeds: undefended, trained, noise 20 reads all; any mitigation reads none
  for (const seed of [1, 2, 3]) { check('seed ' + seed + ': undefended reads all', M.leak('none', 20, S.train, seed).ok, S.secret.length); check('seed ' + seed + ': lfence/mask read none', M.leak('lfence', 20, S.train, seed).ok + M.leak('mask', 20, S.train, seed).ok, 0); }
  // no runnable exploit: models.js and app.js never touch timers, SharedArrayBuffer or clflush-like APIs
  for (const src of [fs.readFileSync(path.join(DIR, 'models.js'), 'utf8'), app]) check('no real timers or shared memory in the toy', /performance\.now|SharedArrayBuffer|Atomics|WebAssembly/.test(src), false);
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { zPen: '15', zPenMin: '12', zPenMax: '18', zW: '8', fbrN: '5', a1Lost: '2', z95Lost: '55', z99Lost: '19', z90Lost: '71', z95Ipc: '3.6', z99Ipc: '6.5', zSlots: '120',
    a1Pen: '2', fbr10: '10', fbr3: '3', zf1Lost: '38', zf3Lost: '67', per99: '500', per95: '100',
    s2acc: '84.0', s1acc: '69.7', snacc: '15.6', sbacc: '48.8', s2in: '25', s1in: '50', s2fw: '10.9', s1fw: '18.1', sbfw: '90',
    soN: '32768', soMiss: '3', suRate: '49.8', s5Rate: '2.6', suCyc: '8.6', soCyc: '1.13', soX: '7.6', blCyc: '1.75', soSlow: '11.54', soFast: '1.93', soMeas: '6', soW: '4', blN: '7', strip: '48',
    gcBi: '62.8', gc2: '74.3', gl0: '88.9', gl8: '99.9', gm6: '76.7', gm6b: '71.1', gm10: '78.6',
    tL1: '4', tL2: '10', tL3: '25', tL4: '64', tM: '4', cmB: '73.4', cmG: '83.6', cmGf: '75.8', cmGh: '2', gsN: '13', cmT: '85.8', clG: '96.9', clT: '99.8', ccG: '74.8', ccT: '75.0', cuB: '74.8', cuT: '74.9', c4T: '84.4', c32T: '86.0', c32G: '83.6',
    zBtb1: '16', zBtb2: '8', zRas: '52', zInd: '3072', lcRas: '24', xRas: '29', r16: '2.5', r24: '0.0', r32: '0.4', rBtb: '50',
    rows: '14', lat: '4', i1in: '0.61', i4in: '0.99', i8in: '0.99', i4oo: '3.74', i8oo: '7.01',
    stIn: '351', stSb: '307', stOo: '156', st16: '290', stX: '2.3', stN: '96', stL3: '46', stIt: '12', l2: '14', l3: '46', mem: '399', memC: '399', stEvery: '2', stMax: '32',
    mpCyc: '59', mp0Cyc: '46', mpSq: '10', mpLoss: '13', flCom: '24', feN: '10',
    zRob: '448', zRobT: '224', lcRob: '576', lcPrev: '512', lcW: '8', xRob: '525', xW: '10', xClaim: '768', hwRob: '192', zPrf: '240',
    w64: '2.16', w128: '2.69', w512: '7.16', w512b: '4.77', w512c: '6.26', wIn: '0.75', wMlp: '2.7', wMem: '1.25', wMem64: '0.31', btw95: '160', btw99: '800', wBody: '8', wLine: '16',
    spSec: '9', spOk: '9', spOkF: '0', spOkM: '0', spOk0: '0', spOkN: '0', spTrain: '6', spNoise: '160', hit: '4', miss: '399', a1n: '16', cNone: '8', cFence: '13', cMask: '9', spRate: '10', spMit: '4',
    bpiRate: '5.6', bpiU: '2.7', bpiSw1: '1.6', bpiSw2: '8.3', btrRate: '8', rbA: '14', rbI: '39', cbpBase: '64', cbpB: '192' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // keys with placeholders that are not page-filled must be filled by app.js (say, units, chart labels)
  const htmlKeys = new Set([...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(m => m[1]));
  for (const [k, v] of Object.entries(Z)) if (/\{\w+\}/.test(v) && !htmlKeys.has(k)) { n++; if (!app.includes(`'${k}'`) && !/\.say\./.test(k)) { fails++; console.error('FAIL key with placeholders never filled: ' + k); } }
  // the claims the prose makes about the models
  check('ch1: wide core loses more than half at 95%, the 5-stage pipeline a few percent', P.z95Lost[0] > 0.5 && P.a1Lost[0] < 0.05, true);
  check('ch1: halving/doubling the branch share keeps the 95% loss between a third and two thirds', P.zf1Lost[0] > 0.33 && P.zf3Lost[0] < 0.7, true);
  check('ch2: 2-bit > 1-bit > BTFN > never-taken on the default loop', P.s2acc[0] > P.s1acc[0] && P.s1acc[0] > P.sbacc[0] && P.sbacc[0] > P.snacc[0], true);
  check('ch2: 1-bit misses twice per exit, 2-bit once (K = 4)', [f(P.s1in[0], 2), f(P.s2in[0], 2)].join(), '0.50,0.25');
  check('ch2: branchless slower than sorted, faster than unsorted', P.soCyc[0] < P.blCyc[0] && P.blCyc[0] < P.suCyc[0], true);
  check('ch2: model and measurement within the same order', P.soX[0] / P.soMeas[0] > 0.5 && P.soX[0] / P.soMeas[0] < 2, true);
  says('ch2.p5', '只打乱 5% 的位置'); check('5% is a slider stop', M.DISORDER.includes(0.05), true);
  says('ch2.p4', '0 到 255'); says('ch2.p4', 'data[c] >= 128'); check('threshold 128', M.SORT.thr, 128);
  says('ch2.limit', '四条指令、宽 4'); check('4 instructions, width 4', [M.SORT.instr, M.SORT.W].join(), '4,4');
  says('ch2.p3', 'K = 4、p = 0.9'); check('ch2 slider defaults K = 4, p = 0.9', [M.LOOPIF.Ks[+/id="k2K"[^>]*value="(\d+)"/.exec(html)[1]], M.LOOPIF.ps[+/id="k2P"[^>]*value="(\d+)"/.exec(html)[1]]].join(), '4,0.9');
  check('ch3: gshare beats bimodal on corr and loop4', P.gc2[0] > P.gcBi[0] && P.gl8[0] > P.gl0[0], true);
  check('ch3: mix gains little', P.gm6[0] - P.gm6b[0] < 0.1, true);
  check('ch4: TAGE > gshare > bimodal on the mix at 16 Kbit', P.cmT[0] > P.cmG[0] && P.cmG[0] > P.cmB[0], true);
  check('ch4: TAGE at 4 Kbit beats gshare at 32 Kbit', P.c4T[0] > P.c32G[0], true);
  // review 2026-11-15: gshare is compared at its best history length (swept 0..n), which is the fair opponent
  check('ch4: best-h gshare beats h = n gshare on the mix (dilution, ch3)', P.cmG[0] > P.cmGf[0] + 0.05, true);
  check('ch4: h = n is the usual gshare (13 bits at 16 Kbit)', [P.gsN[0], M.compare('mix', 16384).gshareFull].join(), [13, M.runPred(M.makePred('gshare', { bits: 13, hist: 13 }), M.trace('mix')).acc].join());
  for (const B of M.BUDGETS) { const c = M.compare('mix', B); let best = 0; for (let h = 0; h <= M.budgetCfg(B).gshare.bits; h++) best = Math.max(best, M.runPred(M.makePred('gshare', { bits: M.budgetCfg(B).gshare.bits, hist: h }), M.trace('mix')).acc);
    check('ch4: compare() gshare is the best over h, ' + B, c.gshare, best); check('ch4: TAGE beats best-h gshare on the mix, ' + B, c.tage > c.gshare, true); }
  check('ch4: doubling gshare 16 → 32 Kbit does not help (so TAGE’s extra 1/16 is not the reason)', M.compare('mix', 32768).gshare <= M.compare('mix', 16384).gshare + 1e-12, true);
  says('ch4.p3', '差出来的部分全在那几个循环上');
  { // the gap between TAGE and best-h gshare on the mix lies in the loop segments (pc ranges of loopIf/longLoop blocks)
    const B = 16384, c = M.budgetCfg(B), tr = M.trace('mix'), cm = M.compare('mix', B);
    const seg = pc => (pc >= 0x40000 || (pc >= 0x30000 && pc < 0x40000) || (pc >= 0x10000 && pc < 0x20000)) ? 'loop' : 'other';
    const miss = pred => { const r = M.runPred(pred, tr), o = { loop: 0, other: 0 }; for (const [pc, q] of Object.entries(r.per)) o[seg(+pc)] += q.miss; return o; };
    const g = miss(M.makePred('gshare', { bits: c.gshare.bits, hist: cm.gshareH })), t = miss(M.makePred('tage', c.tage));
    check('ch4: TAGE gains on the loops, not elsewhere', (g.loop - t.loop) >= (g.loop + g.other) - (t.loop + t.other) && g.other - t.other <= 0, true);
  }
  check('ch4: random data defeats both', Math.abs(P.cuT[0] - P.cuB[0]) < 0.01, true);
  check('ch5: BTB-only return prediction far worse than any RAS', P.rBtb[0] > 10 * P.r16[0], true);
  check('ch6: in-order flat with width, ooo near width', P.i8in[0] - P.i4in[0] < 0.05 && P.i8oo[0] > 0.85 * 8, true);
  check('ch7: in-order > scoreboard > ooo cycles; ROB 16 in between', P.stIn[0] > P.stSb[0] && P.stSb[0] > P.stOo[0] && P.st16[0] > P.stOo[0], true);
  check('ch8: mispredict loss = FE + the cycles until the branch resolves', P.mpLoss[0] >= P.feN[0] && P.mpLoss[0] - P.feN[0] <= 5, true);
  check('ch8: mispredict loss within the Zen 5 range', P.mpLoss[0] >= ZEN.penMin && P.mpLoss[0] <= ZEN.penMax, true);
  check('ch8: fault commits the first 3 iterations', P.flCom[0], 3 * M.BODY.length);
  check('ch9: 99% fills the window better than 95%', P.w512c[0] > P.w512b[0] && P.btw99[0] > 512 && P.btw95[0] < 512, true);
  check('ch9: memory misses are not hidden by 512 entries', P.wMem[0] < P.w512[0] / 3, true);
  check('ch10: undefended reads all, mitigations none', [P.spOk[0], P.spOkF[0], P.spOkM[0], P.spOk0[0]].join(), [P.spSec[0], 0, 0, 0].join());
  check('ch10: lfence costs more than masking', P.cFence[0] > P.cMask[0] && P.cMask[0] > P.cNone[0], true);
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  const accs = [0.8, 0.85, 0.9, 0.92, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 0.995, 0.999];
  check('ch1 accuracy list = app list', /const ACCS = \[0\.8, 0\.85, 0\.9, 0\.92, 0\.94, 0\.95, 0\.96, 0\.97, 0\.98, 0\.99, 0\.995, 0\.999\]/.test(app), true);
  for (const w of [1, 4, 8]) for (const p of [2, 15, 25]) for (const a of accs) add(M.say.cost(w, p, a));
  for (const K of M.LOOPIF.Ks) for (const p of M.LOOPIF.ps) for (const k of M.SIMPLE) add(M.say.simple(K, p, k));
  for (const d of M.DISORDER) for (const b of [false, true]) add(M.say.sort(d, b));
  for (const tk of M.GS.traces) for (const nb of M.GS.sizes) for (let h = 0; h <= 10; h++) add(M.say.gshare(tk, nb, Math.min(h, nb)));
  for (const tk of M.CMP_TRACES) for (const B of M.BUDGETS) add(M.say.compare(tk, B));
  for (const d of M.RAS.depths) for (const s of M.RAS.sizes) add(M.say.ras(d, s));
  for (const w of M.WIDTHS) add(M.say.ilp(w));
  for (const r of M.WIN.robs) for (const a of M.WIN.accs) add(M.say.window(r, a));
  for (const mit of ['none', 'lfence', 'mask']) for (const noise of M.SPEC.noises) for (const train of [0, 1, 6]) { const toy = M.makeToy({ mit, noise }); for (let k = 0; k < 3; k++) add(M.say.spectre(toy.readByte(k, train), mit, train)); }
  const all = ['ch1.say.cheap', 'ch1.say.mid', 'ch1.say.dear', 'ch2.say.nt', 'ch2.say.btfn', 'ch2.say.1bit', 'ch2.say.2bit', 'ch2.say.sorted', 'ch2.say.some', 'ch2.say.random', 'ch2.say.bl',
    'ch3.say.h0', 'ch3.say.better', 'ch3.say.same', 'ch3.say.worse', 'ch4.say.tage', 'ch4.say.random', 'ch5.say.fits', 'ch5.say.over', 'ch6.say.one', 'ch6.say.wide',
    'ch9.say.perfect', 'ch9.say.guess', 'ch10.say.leak', 'ch10.say.noisy', 'ch10.say.untrained', 'ch10.say.fence', 'ch10.say.mask'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  // branches the controls cannot reach on this page's traces, kept for completeness
  const unreachable = ['ch2.say.btfnok', 'ch4.say.other'];
  for (const k of unreachable) has(k);
  // sentences app.js picks itself
  const fixed = ['ch7.say.start', 'ch7.say.stall', 'ch7.say.flow', 'ch7.say.full', 'ch7.say.done', 'ch7.say.fault', 'ch8.say.squash', 'ch10.say.start'];
  for (const k of fixed) { has(k); n++; if (!app.includes(`'${k}'`)) { fails++; console.error('FAIL app.js never shows ' + k); } }
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a branch ' + k, all.includes(k) || fixed.includes(k) || unreachable.includes(k), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-hk="([^"]+)"/g)) keys.add(m[1]);
  for (const tk of M.CMP_TRACES) keys.add('ch4.tr.' + tk);
  for (const s of ['ghost', 'done', 'miss', 'run', 'wait']) keys.add('ch7.st.' + s);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (const k of ['ch4.tr.', 'ch7.st.']) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const dgs = [...html.matchAll(/class="dia" data-dg="(\w+)"/g)].map(m => m[1]);
  check('the eight diagrams', dgs.sort().join(), ['btb', 'fsm', 'gs', 'ooo', 'ren', 'rob', 'sp', 'tage'].join());
  for (const d of dgs) check('diagram spec ' + d, new RegExp('DG\\.' + d + ' = ').test(app), true);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');   // the bilingual label the registrar adds later
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-a-cpu-guesses-ahead computing/systems/how-a-cpu-guesses-ahead/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner (TASK-arch-series.md): A1 keeps the pipeline, hazards, flush, static prediction and the iron law;
  // the memory essay keeps stalls, CPI and latency hiding; A3 keeps Meltdown and KPTI; A2 keeps the cache words.
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  for (const a of ['控制冒险', '分支的代价', '流水线冲刷', '猜不跳', '静态分支预测', '延迟分支', 'branch penalty', 'pipeline flush', 'predict not taken', 'static branch prediction',
    'CPI', '性能铁律', 'iron law of performance', 'pipeline stall', '流水线气泡', 'latency hiding', '隐藏内存延迟', 'in-flight memory requests', 'KPTI', 'Meltdown 补丁', 'Meltdown mitigation',
    '缓存', 'cache', '流水线', 'pipelining', 'MESI 状态', 'MESI states']) owned.set(norm(a), 'TASK');
  for (const sib of ['why-compute-waits-for-memory', 'switches-that-compute', 'how-a-cpu-runs-a-program', 'how-cpu-caches-work', 'how-virtual-memory-works', 'how-cores-share-memory']) {
    const p = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), sib);
  }
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  // sibling links point at chapters that exist
  const all = Object.values(Z).join('');
  const SIBS = ['how-a-cpu-runs-a-program', 'how-cpu-caches-work', 'how-virtual-memory-works', 'why-compute-waits-for-memory'];
  for (const sib of SIBS) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp(sib + '/(#ch\\d+)?', 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    check('links ' + sib, all.includes(`href='../${sib}/`), true);
    const vz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', sib, 'copy.zh.js'), 'utf8'), vz);
    check(sib + ' title quoted as in its copy', all.includes('《' + vz.window.ESSAY_COPY.zh['hero.title'] + '》'), true);
  }
  for (const [k, h] of [['ch1.p1', '../how-a-cpu-runs-a-program/#ch8'], ['ch1.p2', '../how-a-cpu-runs-a-program/#ch9'], ['ch1.limit', '../why-compute-waits-for-memory/#ch1'], ['ch9.p3', '../how-cpu-caches-work/#ch8'],
    ['ch9.p3', '../why-compute-waits-for-memory/#ch4'], ['ch8.limit', '../how-virtual-memory-works/#ch7'], ['ch10.p4', '../how-virtual-memory-works/#ch10'], ['ch12.q3', '../how-cpu-caches-work/#ch10']]) check(`${k} links ${h}`, Z[k].includes(`href='${h}'`), true);
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + SIBS.join('|') + ')/(#ch\\d+)?$').test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  check('no links to the unwritten A5', /how-cores-share-memory/.test(all), false);
  says('ch12.links', '后续一篇讲多核共享内存的文章');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
  // review 2026-11-15: English checks
  { const cfg = fs.readFileSync(path.join(DIR, '../../../pages.config.js'), 'utf8'), allEn = Object.values(EN).join(' ');
    for (const sib of ['how-a-cpu-runs-a-program', 'how-cpu-caches-work', 'how-virtual-memory-works', 'why-compute-waits-for-memory']) {
      const m = new RegExp('slug: "' + sib + '",\\s*title: \\{ zh: "[^"]*", en: "([^"]+)"').exec(cfg); check(sib + ' en title found in pages.config.js', !!m, true);
      if (m) check(sib + ' en title quoted as registered', allEn.includes(m[1].replace(/'/g, '’')) || allEn.includes(m[1]), true); }
    // u.cyc already carries the unit: strings that take {cyc}/{cost}/{win}/{t} from cyc() must not add it again
    for (const k of ['ch2.say.some', 'ch2.say.random', 'ch2.say.bl', 'ch10.say.fence', 'ch10.say.leak']) check('no doubled unit in ' + k, /\{(cyc|cost|win|t)\} cycles/.test(EN[k]), false);
    // eqntott: branch 3 is taken (skips the block) when branches 1 and 2 went the same way, as corrTrace builds it
    check('en ch3.p2 polarity matches corrTrace', EN['ch3.p2'].includes('the third is certainly taken'), true);
    check('en FSM arcs T / NT with the legend in the caption', [EN['dg.fsm.t'], EN['dg.fsm.n'], /T are taken.*NT are not-taken/.test(EN['dg.fsm.cap'])].join(), 'T,NT,true'); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (vendor figures, hand-worked 1-bit/2-bit/gshare/TAGE lengths, return stack by definition, core invariants and in-order commit, toy Spectre machine, tuned-parameter sweeps, and every number in the prose match the models)`);
