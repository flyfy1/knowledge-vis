'use strict';
// Pins the page's coherence and consistency models: the snooping engine against hand-worked sequences (MSI, MESI,
// MOESI, no protocol) and against the two coherence invariants on long random traces; the preset counts by hand; the
// directory storage formulas and message counts; the lost-update count against binomials and a brute-force walk of
// every interleaving; the CAS loop and the contended-line closed form; the litmus enumerator against the examples in
// the x86-TSO paper (Intel SDM 8-1, 8-2, 8-3, 8-9) and the weak-model outcomes; the lock simulation's ordering; the
// measured and frontier figures against the values typed from their sources; every number the prose quotes
// (placeholders filled from prose(), literals checked against models.js); how far each conclusion moves when a tuned
// parameter is halved or doubled; every live sentence branch; copy keys, language hygiene, the registry and the
// sibling essays' aliases.
// Run: node computing/systems/how-cores-share-memory/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { LAT, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function within(name, got, lo, hi) { n++; if (!(got >= lo && got <= hi)) { fails++; console.error(`FAIL ${name}: ${got} not in [${lo}, ${hi}]`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const P = M.prose();

/* ── measured and frontier figures, typed again from the sources (BRIEF.md lists URL and date for each) ── */
{
  // Chips and Cheese, Bergamo (2024-06-22): intra-cluster 30–40 ns, cross-cluster 100–120 ns, cross-socket ~200, worst just over 212
  check('Bergamo intra 30–40 ns', LAT.bergamo.intra.join(), '30,40');
  check('Bergamo cross-cluster 100–120 ns', LAT.bergamo.cross.join(), '100,120');
  check('Bergamo cross-socket 200, worst 212', [LAT.bergamo.socket, LAT.bergamo.socketMax].join(), '200,212');
  check('Bergamo article date', LAT.bergamo.date, '2024-06-22');
  check('9950X cross-CCD nearly 200 ns (2024-08-14)', [LAT.zen5desk.crossCcd, LAT.zen5desk.date].join(), '200,2024-08-14');
  check('EPYC 9965: 192 cores, launched 2024-10-10', [FRONTIER.epyc9965.cores, FRONTIER.epyc9965.launch].join(), '192,2024-10-10');
  const V = FRONTIER.venice;
  check('Venice: 256 Zen 6c cores, 8 CCDs × 32, 1024 MB L3, announced 2026-07-22, GA 2026-11-10', [V.cores, V.core, V.ccds, V.ccdCores, V.l3, V.announced, V.ga].join(), '256,Zen 6c,8,32,1024,2026-07-22,2026-11-10');
  check('Venice: CCDs × cores per CCD = cores', V.ccds * V.ccdCores, V.cores);
  check('Venice: 8 CCDs × 128 MB L3 = 1024 MB', V.ccds * 128, V.l3);
  const X6 = FRONTIER.xeon6p;
  check('Xeon 6+: 288 cores, 576 MB L3, 2 sockets, reported 2026-06-01', [X6.cores, X6.l3, X6.sockets, X6.reported].join(), '288,576,2,2026-06-01');
  check('Apple TSO patch 2024-04-11', FRONTIER.appleTso.date, '2024-04-11');
  check('Tardis PACT 2015, 256 cores, arXiv 1501.04504', [FRONTIER.tardis.year, FRONTIER.tardis.cores, FRONTIER.tardis.arxiv].join(), '2015,256,1501.04504');
  check('Arm MP on hardware: 458 of 1,000,000', [FRONTIER.armMp.seen, FRONTIER.armMp.runs].join(), '458,1000000');
  check('vendor claims +70 % (Venice), +30 % (Xeon 6+)', [FRONTIER.claims.venicePerf, FRONTIER.claims.xeon6pPerThread].join(), '70,30');
  check('years: MCS 1991, x86-TSO 2010, Primer 2nd ed. 2020', [FRONTIER.mcs.year, FRONTIER.tso.year, FRONTIER.primer.year].join(), '1991,2010,2020');
  // dates as written in the prose
  for (const [k, s] of [['ch7.p2', '2024 年 6 月 22 日'], ['ch11.d4', '2024 年 6 月 22 日'], ['ch7.p2', '2024 年 8 月 14 日'], ['ch11.d1', '2024 年 10 月 10 日'],
    ['ch11.d2', '2026 年 7 月 22 日'], ['ch11.d3', '2026 年 6 月 1 日'], ['ch11.d5', '2024 年 4 月 11 日'], ['ch11.d6', 'PACT 2015'], ['ch11.e3', '1991 年'],
    ['ch11.e2', '2010 年'], ['ch11.e1', '2020 年'], ['ch10.p2', '1991 年'], ['ch9.p1', '2010 年'], ['ch11.d2', '2026 年 11 月 10 日'], ['ch11.d2', '2026 年 7 月 22 日']]) says(k, s);
}

/* ── 01–03 the snooping engine, by hand ── */
{
  const S = (proto, trace, nc, nl) => M.runTrace(proto, nc || 2, nl || 1, trace);
  const states = sys => sys.st.map(r => r.join('')).join('');
  const sc = M.STALE.script;
  // no protocol: core 1 keeps its old copy
  {
    const r = S('none', sc), last = r.recs[3];
    check('none: core 1 reads the old 0', last.value, 0);
    check('none: newest value is 1', r.sys.latest[0], 1);
    check('none: one stale read', r.led.stale, 1);
    const r3 = M.stale('none', 3), iv = M.invariants(r3.sys);
    check('none after step 3: SWMR broken (D beside V)', iv.swmr, false);
    check('none after step 3: data value broken', iv.value, false);
    check('none after step 2: both invariants hold', [M.invariants(M.stale('none', 2).sys).swmr, M.invariants(M.stale('none', 2).sys).value].join(), 'true,true');
  }
  // MSI: R → S from memory, R → S from memory, W upgrade invalidates, R: M flushes (data + writeback)
  {
    const r = S('msi', sc), [a, b, c, d] = r.recs;
    check('MSI step 1: BusRd, S, from memory', [a.bus, a.after, a.from].join(), 'BusRd,S,mem');
    check('MSI step 2: BusRd, S, from memory', [b.bus, b.after, b.from].join(), 'BusRd,S,mem');
    check('MSI step 3: BusUpgr, M, invalidates core 1', [c.bus, c.after, c.inval.join()].join(), 'BusUpgr,M,1');
    check('MSI step 4: BusRd from the M cache, writeback, both S', [d.bus, d.from, d.wb, states(r.sys)].join(), 'BusRd,cache,true,SS');
    check('MSI: core 1 reads 1', d.value, 1);
    check('MSI ledger: 4 requests + 1 writeback = 5 tx', [r.led.rd, r.led.upgr, r.led.wb, r.led.tx].join(), '3,1,1,5');
    const w = S('msi', [[0, 'R', 0], [0, 'W', 0]]);
    check('MSI: read then write costs BusRd + BusUpgr', w.led.tx, 2);
  }
  // MESI (Illinois): first read fills E; a read beside E is supplied cache-to-cache; E → M silently
  {
    const r = S('mesi', sc), [a, b, c, d] = r.recs;
    check('MESI step 1: E from memory', [a.bus, a.after, a.from].join(), 'BusRd,E,mem');
    check('MESI step 2: S, supplied by the E cache', [b.after, b.from, states(r.sys) === 'SS' ? 'x' : 'x'].join(), 'S,cache,x');
    check('MESI step 3: BusUpgr from S', c.bus, 'BusUpgr');
    check('MESI step 4: M writes back, both S', [d.wb, states(r.sys)].join(), 'true,SS');
    const w = S('mesi', [[0, 'R', 0], [0, 'W', 0]]);
    check('MESI: E → M silent, one transaction in all', [w.recs[1].bus, w.led.tx].join(), ',1');
    const e = S('mesi', [[0, 'R', 0], [0, 'E', 0], [1, 'W', 0], [1, 'E', 0]]);
    check('MESI: E evicts silently, M evicts with a writeback', [e.recs[1].wb, e.recs[3].wb, e.sys.mem[0]].join(), 'false,true,1');
    const x = S('mesi', [[0, 'W', 0], [1, 'W', 0]]);
    check('MESI: write miss beside M: BusRdX, data cache-to-cache, owner invalidated', [x.recs[1].bus, x.recs[1].from, x.recs[1].inval.join(), states(x.sys)].join(), 'BusRdX,cache,0,IM');
  }
  // MOESI: M read by another core becomes O, no writeback; O supplies data; O evicts with the writeback
  {
    const r = S('moesi', [...sc, [2, 'R', 0], [0, 'E', 0]], 3, 1), d = r.recs[3], e = r.recs[4], ev = r.recs[5];
    check('MOESI step 4: owner → O, no writeback', [d.wb, r.recs[3].owned, d.after].join(), 'false,true,S');
    check('MOESI: a third reader is supplied by O', [e.from, e.owned].join(), 'cache,true');
    check('MOESI: memory still old until O is evicted', [r.sys.mem[0] === 1].join(), 'true');
    check('MOESI: O eviction is the writeback', ev.wb, true);
    const u = S('moesi', [[0, 'W', 0], [1, 'R', 0], [0, 'W', 0]]);
    check('MOESI: O writes again with BusUpgr', [u.recs[2].before, u.recs[2].bus, u.recs[2].after].join(), 'O,BusUpgr,M');
  }
  // invariants and freshness on long random traces, every step
  for (const proto of ['msi', 'mesi', 'moesi']) {
    const R = M.rng(101), sys = M.makeSystem(proto, 4, 4); let ok = true, okV = true;
    for (let i = 0; i < 20000; i++) {
      M.access(sys, Math.floor(R() * 4), ['R', 'W', 'E'][Math.floor(R() * 3)], Math.floor(R() * 4));
      const iv = M.invariants(sys); if (!iv.swmr) ok = false; if (!iv.value) okV = false;
    }
    check(proto + ': SWMR holds on 20,000 random steps', ok, true);
    check(proto + ': data value holds on 20,000 random steps', okV, true);
    check(proto + ': no stale read', sys.led.stale, 0);
    check(proto + ': tx = BusRd + BusRdX + BusUpgr + writebacks', sys.led.tx, sys.led.rd + sys.led.rdx + sys.led.upgr + sys.led.wb);
    check(proto + ': every read miss is served once', sys.led.memRd + sys.led.c2c, sys.led.rd + sys.led.rdx);
  }
  {
    const R = M.rng(5), sys = M.makeSystem('none', 4, 4);
    for (let i = 0; i < 5000; i++) M.access(sys, Math.floor(R() * 4), ['R', 'W', 'E'][Math.floor(R() * 3)], Math.floor(R() * 4));
    check('no protocol: stale reads happen on a random trace', sys.led.stale > 100, true);
  }
  check('ch1 prose: no protocol reads 0, MESI reads 1', [P.stNoneVal[0], P.stMesiVal[0]].join(), '0,1');
  // presets by hand (4 cores, 4 rounds)
  const R4 = M.SIM.rounds, N4 = M.SIM.cores;
  check('private, MSI: BusRd + BusUpgr + writeback per core per round', P.prMsiTx[0], 3 * N4 * R4);
  check('private, MESI: BusRd (to E) + writeback; the write is silent', P.prMesiTx[0], 2 * N4 * R4);
  check('private, MSI upgrades = one per core per round', P.prMsiUp[0], N4 * R4);
  check('read-only, MESI: one cold miss per core, then hits', P.roMesiTx[0], N4);
  // producer/consumer: round 1 W miss + 3 reads (first supplied from M with a writeback); rounds 2–4: upgrade + 3 reads
  check('prodcons, MESI: 4 + 3 × (1 + 3) + writebacks 4 = 20', P.pcMesiTx[0], 20);
  check('prodcons, MESI writebacks: one per round', P.pcMesiWb[0], R4);
  check('prodcons, MOESI: no writeback, 16 tx', [P.pcMoesiWb[0], P.pcMoesiTx[0]].join(), '0,16');
  check('prodcons, MESI reads memory once (the cold write miss)', P.pcMesiMem[0], 1);
  check('prodcons, MSI reads memory 9 times (S copies never supply)', P.pcMsiMem[0], 9);
  check('migratory: MOESI saves every writeback', [P.mgMesiWb[0] > 0, P.mgMoesiWb[0]].join(), 'true,0');
  check('migratory: MESI tx − MOESI tx = writebacks', P.mgMesiTx[0] - P.mgMoesiTx[0], P.mgMesiWb[0]);
  check('MSI ≥ MESI ≥ MOESI on every preset', M.PRESETS.every(p => M.presetRun(p, 'msi').led.tx >= M.presetRun(p, 'mesi').led.tx && M.presetRun(p, 'mesi').led.tx >= M.presetRun(p, 'moesi').led.tx), true);
  says('ch3.p3', '1986');
}

/* ── 04 directories ── */
{
  check('LINE = 64 bytes = 512 bits', [M.LINE, M.DIR.lineBits].join(), '64,512');
  says('ch4.p4', '64 字节'); says('ch4.p4', '512 位'); says('ch4.p4', '2 位状态'); says('ch2.p4', '64 字节');
  check('full vector: N + 2 bits', M.dirBits(64, 'full'), 66);
  check('full vector 64: 66/512', f(P.ov64[0] * 100, 1), f(66 / 512 * 100, 1));
  check('full vector 1024 is bigger than the line', M.dirOverhead(1024, 'full') > 1, true);
  check('coarse vector 1024, K = 8: 128 + 2 bits', M.dirBits(1024, 'coarse'), 130);
  check('limited pointers 1024, i = 4: 4 × 10 + 2 + 1 bits', M.dirBits(1024, 'ptr'), 43);
  check('limited pointers 64: 4 × 6 + 3 bits', M.dirBits(64, 'ptr'), 27);
  for (const N of [4, 16, 64, 256]) {
    const r = M.dirCompare(N);
    within(`snoop messages per miss between N − 1 and N at N=${N}`, r.perMissSnoop, N - 1, N);
    within(`directory messages per miss between 2 and 2 + 2(N − 1) at N=${N}`, r.perMissDir, 2, 2 + 2 * (N - 1));
  }
  check('directory wins from 16 cores', [16, 64, 256].every(N => M.dirCompare(N).perMissDir < M.dirCompare(N).perMissSnoop), true);
  check('snoop wins at 4 cores', M.dirCompare(4).perMissSnoop < M.dirCompare(4).perMissDir, true);
  // a hand-made directory replay: read cold (2), read beside E (4, 3-hop), write with one sharer... (2 + 2·2 = 6)
  {
    const recs = M.runTrace('mesi', 4, 1, [[0, 'R', 0], [1, 'R', 0], [2, 'W', 0]]).recs;
    check('cold read: no owner', recs[0].owner, null);
    check('read beside E: owner core 0 (3-hop)', recs[1].owner, 0);
    check('write miss beside two S copies: two sharers, no owner', [recs[2].sharers.length, recs[2].owner].join(), '2,');
  }
}

/* ── 05 the lost update ── */
{
  // brute force: walk every interleaving of 2k + 2k steps
  function brute(k) {
    const out = {};
    (function go(i, j, a, b, m) {
      if (i === 2 * k && j === 2 * k) { out[m] = (out[m] || 0) + 1; return; }
      if (i < 2 * k) { if (i % 2 === 0) go(i + 1, j, m, b, m); else go(i + 1, j, a, b, a + 1); }
      if (j < 2 * k) { if (j % 2 === 0) go(i, j + 1, a, m, m); else go(i, j + 1, a, b, b + 1); }
    })(0, 0, 0, 0, 0);
    return out;
  }
  for (let k = 1; k <= 4; k++) check('DP = brute force, k = ' + k, JSON.stringify(M.lostUpdate(k).dist), JSON.stringify(brute(k)));
  for (let k = 1; k <= 6; k++) {
    const r = M.lostUpdate(k);
    check('total = C(4k, 2k), k = ' + k, r.total, M.binom(4 * k, 2 * k));
    check('max = 2k, k = ' + k, r.max, 2 * k);
    check('min, k = ' + k, r.min, k === 1 ? 1 : 2);
    const a = M.lostUpdate(k, true);
    check('atomic: always 2k, k = ' + k, [a.min, a.max, a.pCorrect].join(), [2 * k, 2 * k, 1].join());
  }
  check('C(4,2), C(8,4), C(12,6), C(20,10)', [P.lu1n[0], P.lu2n[0], P.lu3n[0], P.lu5n[0]].join(), '6,70,924,184756');
  // the race at scale
  check('b = 1: strict alternation loses exactly half', M.raceSim(1).final, M.RACE.N);
  for (const b of M.RACE.bursts) { const r = M.raceSim(b); within('final between 2 and 2N, b = ' + b, r.final, 2, 2 * M.RACE.N); check('final + lost = 2N, b = ' + b, r.final + r.lost, 2 * M.RACE.N); }
  check('ch5: b = 1024 loses fewer than b = 1', P.rc1024lost[0] < M.RACE.N, true);
  says('ch5.p1', '100'); says('ch5.p1', '50'); says('ch5.p1', '150');
}

/* ── 06 atomics ── */
{
  for (const k of M.CAS.threads) { const r = M.casLoop(k); check('CAS loop ends at n × M, n = ' + k, r.final, k * M.CAS.M); }
  check('one thread: 2 steps per increment, no failures', [M.casLoop(1).stepsPerInc, M.casLoop(1).fails].join(), '2,0');
  check('steps per increment grow with threads', M.CAS.threads.every((k, i, a) => i === 0 || M.casLoop(k).stepsPerInc > M.casLoop(a[i - 1]).stepsPerInc), true);
  check('cas8 to two decimals (prose rounds to one)', f(M.casLoop(8).stepsPerInc, 2), '5.51');
  says('ch6.say.many', '1 步');
}

/* ── 07 the contended line ── */
{
  for (const place of M.PING.places) for (const k of [2, 3, 8, 16]) {
    const r = M.pingPong(k, place, 'shared', 0);
    check(`FIFO simulation = closed form 1/(T + t), ${place}, n = ${k}`, f(r.perInc, 9), f(r.T + r.t, 9));
    check(`every grant is a transfer, ${place}, n = ${k}`, r.transfers, 1);
  }
  check('one thread: a single transfer at the start', M.pingPong(1, 'intra', 'shared', 0).transfers < 0.001, true);
  check('private counters: n / t', M.pingPong(4, 'intra', 'private').totalRate, 4 / M.PING.t);
  check('T is the low end of the measured range', [M.pingT('intra', 0), M.pingT('cross', 0), M.pingT('socket', 0)].join(), '30,100,200');
  check('8 threads add no throughput (prose)', P.p8Rate[0] === P.piRate0[0] || f(P.p8Rate[0], 0) === f(P.piRate0[0], 0), true);
  const dbl = M.pingPong(2, 'intra', 'shared', 0, { T: 2 * M.pingT('intra', 0) }).totalRate / M.pingPong(2, 'intra', 'shared', 0).totalRate;
  within('ch7: doubling the transfer almost exactly halves the rate', dbl, 0.5, 0.52);
  check('private is 60× faster than shared in one cluster or more', P.ppRate[0] / P.piRate0[0] > 60, true);
}

/* ── 08–09 litmus tests ── */
{
  const L = (t, s, m) => M.litmus(t, s, m);
  const A = (t, s, m) => L(t, s, m).allowed.join(' ');
  // x86-TSO paper §3, Intel SDM rev. 34 examples
  check('8-1 (MP) forbidden on TSO', L('MP', 'none', 'tso').oddAllowed, false);
  check('8-2 (LB) forbidden on TSO', L('LB', 'none', 'tso').oddAllowed, false);
  check('8-3 (SB) allowed on TSO', L('SB', 'none', 'tso').oddAllowed, true);
  check('8-9 (SB with xchg) forbidden on TSO', L('SB', 'lock', 'tso').oddAllowed, false);
  check('SB with mfence forbidden on TSO', L('SB', 'fence', 'tso').oddAllowed, false);
  // SC forbids every odd outcome; the three others are reachable
  for (const t of ['SB', 'MP', 'LB']) for (const s of Object.keys(M.LITMUS[t].fences)) check(`SC forbids ${t}/${s}`, L(t, s, 'sc').oddAllowed, false);
  check('SC SB: exactly the three other outcomes', A('SB', 'none', 'sc'), '0,1 1,0 1,1');
  check('TSO SB: all four', A('SB', 'none', 'tso'), '0,0 0,1 1,0 1,1');
  // the weak model (Armv8 / RVWMO as modelled): SB, MP and LB all allowed without ordering
  check('weak: SB allowed', L('SB', 'none', 'weak').oddAllowed, true);
  check('weak: MP allowed', L('MP', 'none', 'weak').oddAllowed, true);
  check('weak: LB allowed', L('LB', 'none', 'weak').oddAllowed, true);
  check('weak: SB with full fences forbidden', L('SB', 'fence', 'weak').oddAllowed, false);
  check('weak: SB with plain atomic exchanges still allowed', L('SB', 'lock', 'weak').oddAllowed, true);
  check('weak: MP with fences forbidden', L('MP', 'fence', 'weak').oddAllowed, false);
  check('weak: MP with release/acquire forbidden', L('MP', 'acqrel', 'weak').oddAllowed, false);
  check('weak: LB with fences forbidden', L('LB', 'fence', 'weak').oddAllowed, false);
  check('TSO: MP with release/acquire forbidden (plain stores are already ordered)', L('MP', 'acqrel', 'tso').oddAllowed, false);
  // what the weak model forbids it also forbids under TSO and SC (each model only adds outcomes)
  for (const t of ['SB', 'MP', 'LB']) for (const s of Object.keys(M.LITMUS[t].fences)) {
    const sc = L(t, s, 'sc').allowed, tso = L(t, s, 'tso').allowed, wk = L(t, s, 'weak').allowed;
    check(`SC ⊆ TSO ⊆ weak, ${t}/${s}`, sc.every(o => tso.includes(o)) && tso.every(o => wk.includes(o)), true);
  }
  says('ch8.p5', '例 8-1 是 MP'); says('ch8.p2', '1979');
}

/* ── 10 locks ── */
{
  const per = (k, c, o) => M.lockSim(k, c, o).perHandoff;
  for (const c of [4, 16, 64]) check(`TAS > TTAS > ticket at ${c} cores`, per('tas', c) > per('ttas', c) && per('ttas', c) > per('ticket', c), true);
  for (const c of [16, 64]) check(`MCS cheapest at ${c} cores`, ['tas', 'ttas', 'ticket'].every(k => per(k, c) > per('mcs', c)), true);
  for (const c of M.LOCK.cores) within('MCS per handoff is constant, n = ' + c, per('mcs', c), 7.5, 8.5);
  check('TAS grows with cores', M.LOCK.cores.every((c, i, a) => i === 0 || per('tas', c) > per('tas', a[i - 1])), true);
  check('TAS doubles with the hold time (16 cores)', P.tasH2[0] / P.tas16[0] > 1.8, true);
  for (const k of M.LOCK.kinds) check('every simulated handoff completes, ' + k, M.lockSim(k, 64).handoffs, M.LOCK.handoffs);
}

/* ── tuned parameters: halved / doubled (BRIEF.md lists the same) ── */
{
  // ch4 trace mix: write share and hot share halved and doubled (hot capped at 0.9)
  const T = M.DIR.trace, save = Object.assign({}, T);
  for (const [k, v] of [['pWrite', T.pWrite / 2], ['pWrite', T.pWrite * 2], ['hot', T.hot / 2], ['hot', 0.9], ['hotLines', T.hotLines / 2], ['hotLines', T.hotLines * 2]]) {
    Object.assign(T, save); T[k] = v;
    const a = M.dirCompare(4), b = M.dirCompare(64);
    check(`ch4 ${k} = ${v}: snoop still wins at 4 cores`, a.perMissSnoop < a.perMissDir, true);
    within(`ch4 ${k} = ${v}: directory 3.5–4.5 messages per miss at 64 cores`, b.perMissDir, 3.5, 4.5);
  }
  Object.assign(T, save);
  // ch5 race: any burst length above 1 and other seeds lose a third, give or take
  for (const s of [11, 12, 13]) for (const b of M.RACE.bursts.filter(x => x > 1)) within(`ch5 b = ${b}, seed ${s}: lost share 32–36 %`, M.raceSim(b, M.RACE.N, s).lost / (2 * M.RACE.N), 0.32, 0.36);
  // ch6 CAS: other seeds move the 32-thread figure by under 2 %
  for (const s of [4, 5]) within('ch6 cas32, seed ' + s, M.casLoop(32, M.CAS.M, s).stepsPerInc, P.cas32[0] * 0.98, P.cas32[0] * 1.02);
  // ch7 t halved / doubled: the shared rate moves under 5 %, the private rate scales 1/t
  for (const t of [M.PING.t / 2, M.PING.t * 2]) {
    within('ch7 t = ' + t + ': shared rate', 1000 / M.pingPong(2, 'intra', 'shared', 0, { t }).perInc, P.piRate0[0] * 0.95, P.piRate0[0] * 1.05);
    check('ch7 t = ' + t + ': private ≫ shared', M.pingPong(2, 'intra', 'private', 0, { t }).totalRate > 20 * M.pingPong(2, 'intra', 'shared', 0, { t }).totalRate, true);
  }
  // ch10 H halved / doubled: the ordering and MCS's constant hold; only TAS scales with H
  for (const H of [M.LOCK.H / 2, M.LOCK.H * 2]) {
    const per = (k, c) => M.lockSim(k, c, { H }).perHandoff;
    check(`ch10 H = ${H}: TAS > TTAS > ticket > MCS at 64 cores`, per('tas', 64) > per('ttas', 64) && per('ttas', 64) > per('ticket', 64) && per('ticket', 64) > per('mcs', 64), true);
    within(`ch10 H = ${H}: MCS still about 8`, per('mcs', 64), 7.5, 8.5);
    within(`ch10 H = ${H}: ticket at 64 within 5 %`, per('ticket', 64), P.tk64[0] * 0.95, P.tk64[0] * 1.05);
  }
  for (const s of [20, 21]) within('ch10 seed ' + s + ': TTAS at 16 within 10 %', M.lockSim('ttas', 16, { seed: s }).perHandoff, P.ttas16[0] * 0.9, P.ttas16[0] * 1.1);
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const want = { stNoneVal: '0', stMesiVal: '1', prMsiTx: '48', prMesiTx: '32', prMsiUp: '16', pcMesiWb: '4', pcMoesiWb: '0', pcMsiMem: '9', pcMesiMem: '1', pcMesiTx: '20', pcMoesiTx: '16',
    mgMesiWb: '15', mgMoesiWb: '0', mgMesiTx: '46', mgMoesiTx: '31', roMesiTx: '4', simRounds: '4',
    ov64: '12.9', ov256: '50', ov1024: '200', ovC1024: '25.4', ovP1024: '8.4', dirK: '8', dirI: '4',
    d4s: '3.8', d4d: '4.0', d16s: '15.9', d16d: '4.1', d64s: '64.0', d64d: '4.1', d256s: '256', d256d: '4.1', d64hop: '38', dirOps: '4000', dirLines: '64', dirPW: '20', dirHot: '70', dirHotN: '4',
    lu1n: '6', lu1min: '1', lu2n: '70', lu2min: '2', lu3n: '924', lu3ok: '2.2', lu5n: '184756', lu5ok: '0.1', lu5min: '2',
    raceN: '1000000', rcLo: '33', rcHi: '35', rc1: '1000000', rc64: '1332712', rc1024: '1340520', rc1024lost: '659480',
    casM: '2000', cas2: '2.86', cas8: '5.5', cas32: '10.6', cas32f: '81',
    bIntraLo: '30', bIntraHi: '40', bCrossLo: '100', bCrossHi: '120', bSock: '200', bSockMax: '212', z5cross: '200',
    piRate0: '32', piRate1: '24', pcRate: '9.9', psRate: '5.0', ppRate: '2000', piMs: '62', piMsHi: '82', psMs: '402', ppMs: '1', p8Rate: '32', pingT: '1',
    tas4: '55', tas16: '301', tas64: '1261', ttas4: '11.9', ttas16: '47.3', ttas64: '195', tk4: '6.0', tk16: '18.2', tk64: '66', mcs4: '8.0', mcs16: '8.0', mcs64: '8.0', lockH: '20', tasH2: '599',
    e9965: '192', vCores: '256', vCcd: '8', vCcdC: '32', vL3: '1024', x6Cores: '288', x6L3: '576', x6S: '2', x6Dom: '576', tdCores: '256', armRuns: '1000000', armSeen: '458', vClaim: '70', x6Claim: '30' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the numbers
  check('ch3: MESI saves the upgrade on private data', P.prMsiTx[0] - P.prMesiTx[0], P.prMsiUp[0]);
  check('ch4: 64 cores, snoop ≈ 16 × directory', P.d64s[0] / P.d64d[0] > 14, true);
  check('ch5: k = 3 keeps the right answer in under 3 %', P.lu3ok[0] < 0.03, true);
  check('ch6: most CAS attempts fail at 32 threads', P.cas32f[0] > 0.5, true);
  check('ch7: cross-socket is slowest', P.psRate[0] < P.pcRate[0] && P.pcRate[0] < P.piRate0[0], true);
  check('ch10: TAS at 64 cores ≫ MCS', P.tas64[0] / P.mcs64[0] > 100, true);
  for (const c of [16, 64]) { const tt = M.lockSim('ttas', c).perHandoff / c, tk = M.lockSim('ticket', c).perHandoff / c;
    within('ch10: TTAS about three times the cores, n = ' + c, tt, 2.5, 3.5); within('ch10: ticket about the cores, n = ' + c, tk, 0.9, 1.3); }
  check('ch10: with 4 cores MCS costs more than the ticket lock', P.mcs4[0] > P.tk4[0], true);
  check('ch3: prodcons tx gap = MESI writebacks', P.pcMesiTx[0] - P.pcMoesiTx[0], P.pcMesiWb[0]);
  check('ch11: two sockets of 288 = 576 cores', P.x6Dom[0], 576);
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const p of ['none', 'mesi']) for (let s = 0; s <= 4; s++) add(M.say.stale(p, s));
  add(M.say.sim(null));
  for (const proto of ['msi', 'mesi', 'moesi']) {
    const R = M.rng(7), sys = M.makeSystem(proto, 4, 4);
    for (let i = 0; i < 3000; i++) add(M.say.sim(M.access(sys, Math.floor(R() * 4), ['R', 'W', 'E'][Math.floor(R() * 3)], Math.floor(R() * 4))));
    for (const p of M.PRESETS) add(M.say.preset(p, proto));
  }
  for (const N of M.DIR.coresList) add(M.say.dir(N));
  for (let k = 1; k <= 6; k++) for (const a of [false, true]) add(M.say.lost(k, a));
  for (const b of M.RACE.bursts) add(M.say.race(b));
  for (const k of M.CAS.threads) add(M.say.cas(k));
  for (let k = 1; k <= 16; k++) for (const pl of M.PING.places) for (const md of ['shared', 'private']) add(M.say.ping(k, pl, md));
  for (const t of Object.keys(M.LITMUS)) for (const s of Object.keys(M.LITMUS[t].fences)) for (const m of M.MODELS) add(M.say.litmus(t, s, m));
  for (const k of M.LOCK.kinds) add(M.say.lock(k, 8));
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('branch has copy ' + k, Z[k] != null, true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc|nav|toc|hero)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (let i = 0; i < 4; i++) keys.add('ch1.step.' + i);
  for (const o of ['R', 'W', 'E']) { keys.add('ch3.btn.' + o); keys.add('ch3.op.' + o); }
  for (const p of ['msi', 'mesi', 'moesi']) keys.add('ch3.p.' + p);
  for (const p of M.PING.places) keys.add('ch7.pl.' + p);
  for (const m of M.MODELS) keys.add('dg.litmus.' + m);
  for (const t of Object.keys(M.LITMUS)) for (const s of Object.keys(M.LITMUS[t].fences)) keys.add('ch8.sync.' + s);
  for (let i = 1; i <= 12; i++) keys.add('dg.mesi.e' + i);
  for (const k of [...keys]) if (/\.$/.test(k) || /\.e$|\.t$/.test(k)) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // every zh key is reachable: a literal in html/app, or under a prefix app.js builds keys from
  const prefixes = [...app.matchAll(/'((?:ch\d+|dg)\.[\w.]*)'\s*\+/g)].map(m => m[1]);
  for (const k of Object.keys(Z)) {
    const reach = keys.has(k) || html.includes(`"${k}"`) || app.includes(`'${k}'`) || prefixes.some(p => k.startsWith(p)) || /\.say\./.test(k);
    n++; if (!reach) { fails++; console.error('FAIL zh key never used ' + k); }
  }
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  check('twelve diagrams (six or more required)', [...html.matchAll(/class="dia" data-dg="/g)].length, 12);
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
    const others = (src.match(/[一-鿿、，。：；（）「」《》]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-cores-share-memory computing/systems/how-cores-share-memory/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner. TASK-arch-series.md: A2 keeps MESI 状态 / MESI states / 伪共享 / false sharing (and its
  // cache line ping-pong); A5 takes 缓存一致性 / cache coherence / MESI 协议 / MOESI. distributed-systems keeps its
  // consistency words. Every alias anywhere else (sibling registries, atlas lessons, the alias table) is off limits.
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const mine = new Set(R.concepts.map(c => c.id));
  const owned = new Map(), own = (a, who) => { if (typeof a === 'string' && !owned.has(norm(a))) owned.set(norm(a), who); };
  const AL = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'aliases.json'), 'utf8'));
  for (const [id, v] of Object.entries(AL)) if (!mine.has(id)) for (const l of ['zh', 'en']) (v[l] || []).forEach(a => own(a, 'atlas aliases ' + id));
  const LD = path.join(ROOT, 'atlas', 'graph', 'lessons');
  for (const fn of fs.readdirSync(LD)) {
    if (fn === 'how-cores-share-memory.json') continue;
    const d = JSON.parse(fs.readFileSync(path.join(LD, fn), 'utf8'));
    for (const nd of d.nodes || []) if (nd.aliases && !mine.has(nd.id)) for (const l of ['zh', 'en']) (nd.aliases[l] || []).forEach(a => own(a, 'lesson ' + fn));
  }
  for (const sub of fs.readdirSync(path.join(DIR, '..'))) {
    const p = path.join(DIR, '..', sub, 'REGISTRY.json');
    if (sub !== 'how-cores-share-memory' && fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) own(a, sub);
  }
  for (const a of ['伪共享', 'false sharing', 'MESI 状态', 'MESI states', 'cache line ping-pong', 'false sharing fix']) own(a, 'how-cpu-caches-work (task file)');
  for (const a of ['强一致性 最终一致性', 'CAP', '为什么会读到旧数据', 'strong vs eventual consistency']) own(a, 'distributed-systems');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  check('no alias twice on this page', new Set(mineAll).size, mineAll.length);
  for (const w of ['缓存一致性', 'cache coherence', 'MESI 协议', 'MOESI']) check('A5 takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live siblings, chapters that exist; A4 (being written) and B4 (future) stay plain text
  const all = Object.values(Z).join('');
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!/^\.\.\/(how-cpu-caches-work|how-a-computer-is-wired|why-compute-waits-for-memory|distributed-systems)\/(#ch\d+)?$/.test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  for (const sib of ['how-cpu-caches-work', 'how-a-computer-is-wired', 'why-compute-waits-for-memory', 'distributed-systems']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp("href='\\.\\./" + sib + "/(#ch\\d+)?'", 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  check('no link to A4 (how-a-cpu-guesses-ahead)', /how-a-cpu-guesses-ahead/.test(all), false);
  says('ch11.p2', '后续讲 CPU 怎样往前猜的那一篇'); says('ch11.p2', 'CXL');
  check('A2 linked at #ch9 (MESI states, false sharing)', hrefs.includes('../how-cpu-caches-work/#ch9'), true);
  check('memory essay linked at #ch5 (Amdahl, bus contention)', hrefs.includes('../why-compute-waits-for-memory/#ch5'), true);
  { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', 'how-cpu-caches-work', 'copy.zh.js'), 'utf8'), cz); check('A2 title quoted as in its copy', all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true); }
  { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', 'how-a-computer-is-wired', 'copy.zh.js'), 'utf8'), cz); check('B2 title quoted as in its copy', all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true); }

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

/* ── reviewer additions (2026-11-15): English facts and the caveats added beside numbers ── */
{
  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en;
  const sayEn = (key, phrase) => { n++; if (!EN[key] || !EN[key].includes(phrase)) { fails++; console.error(`FAIL en ${key} should contain "${phrase}"`); } };
  for (const [k, s] of [['ch7.p2', '22 June 2024'], ['ch11.d4', '22 June 2024'], ['ch7.p2', '14 August 2024'], ['ch11.d1', '10 October 2024'],
    ['ch11.d2', '22 July 2026'], ['ch11.d2', '10 November 2026'], ['ch11.d2', 'Zen 6c'], ['ch11.d3', '1 June 2026'], ['ch11.d5', '11 April 2024'], ['ch11.d6', 'PACT 2015'],
    ['ch8.p5', '8-1 is MP'], ['ch8.p5', '8-2 is LB'], ['ch8.p5', '8-3 is SB'], ['ch8.p5', '8-9 is SB with xchg']]) sayEn(k, s);
  says('ch11.d2', 'Zen 6c');
  for (const [k, s] of [['ch8.p5', '8-1 是 MP'], ['ch8.p5', '8-2 是 LB'], ['ch8.p5', '8-3 是 SB'], ['ch8.p5', '8-9 是用 xchg 的 SB']]) says(k, s);
  // the Intel examples named in ch8.p5 are the outcomes the enumerator gives under x86-TSO
  check('Intel 8-1 = MP forbidden', M.litmus('MP', 'none', 'tso').oddAllowed, false);
  check('Intel 8-2 = LB forbidden', M.litmus('LB', 'none', 'tso').oddAllowed, false);
  check('Intel 8-3 = SB allowed', M.litmus('SB', 'none', 'tso').oddAllowed, true);
  check('Intel 8-9 = SB with xchg forbidden', M.litmus('SB', 'lock', 'tso').oddAllowed, false);
  // no Chinese anywhere in the English copy
  const cjk = Object.entries(EN).filter(([k, v]) => typeof v === 'string' && /[　-鿿＀-￯]/.test(v)).map(([k]) => k);
  check('no CJK in copy.en.js', cjk.join(','), '');
  // sibling titles in English match pages.config.js
  const cfg = fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8');
  const enTitle = slug => { const m = cfg.match(new RegExp('slug: "' + slug + '"[\\s\\S]*?title: \\{ zh: "[^"]*", en: "([^"]*)"')); return m && m[1]; };
  for (const sl of ['how-cpu-caches-work', 'how-a-computer-is-wired', 'why-compute-waits-for-memory', 'distributed-systems']) {
    const tt = enTitle(sl); n++; if (!tt || !Object.values(EN).some(v => v.includes(tt))) { fails++; console.error('FAIL en title of ' + sl + ' not quoted as in pages.config.js: ' + tt); }
  }
  // ch3.p4 caveat: under MOESI the producer's line ends in O (dirty, never evicted), under MESI memory is current
  const pcMo = M.presetRun('prodcons', 'moesi').sys, pcMe = M.presetRun('prodcons', 'mesi').sys;
  check('ch3: MOESI prodcons ends with the O line dirty', pcMo.st[0][0] + (pcMo.mem[0] !== pcMo.latest[0]), 'Otrue');
  check('ch3: MESI prodcons ends with memory current', pcMe.mem[0] === pcMe.latest[0], true);
  check('ch3: MSI memory reads = 1 writer fill + 2 readers × 4 rounds', M.presetRun('prodcons', 'msi').led.memRd, 1 + 2 * M.SIM.rounds);
  check('ch3: MESI memory reads = the writer fill only', M.presetRun('prodcons', 'mesi').led.memRd, 1);
  // ch7 readout: two million additions in total; shared or private, n = 2 gives the prose values
  check('ch7: private, 2 threads, 2 M additions = ppMs', f(M.pingPong(2, 'intra', 'private').timeFor(2e6 / 2) / 1e6, 0), f(P.ppMs[0], 0));
  check('ch7: shared, 8 threads, 2 M additions = 62 ms', f(M.pingPong(8, 'intra', 'shared', 0).timeFor(2e6) / 1e6, 0), '62');
  // ch2.p3: at step 3 without a protocol both readouts read broken
  const iv3 = M.invariants(M.stale('none', 3).sys); check('ch2.p3: step 3, no protocol: both rules broken', [iv3.swmr, iv3.value].join(), 'false,false');
  // Venice: the CCX split is not claimed
  check('Venice: no CCX claim in prose', /簇/.test(Z['ch11.d2']) || /cluster/.test(EN['ch11.d2']), false);
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (measured and frontier figures, hand-worked MSI/MESI/MOESI, both invariants on random traces, presets by hand, directory formulas, lost-update count vs brute force, CAS and contended-line closed form, litmus vs the x86-TSO paper, lock ordering, tuned-parameter sensitivity, and every number in the prose match the models)`);
