'use strict';
// Pins every number the essay states, and checks the circuits against ordinary arithmetic.
// Run: node computing/systems/switches-that-compute/tests/models.cjs
const assert = require('assert');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// The copy must not state numbers the models do not produce: load it for a few direct string checks.
global.window = {};
require(path.join(__dirname, '..', 'copy.zh.js'));
const Z = global.window.ESSAY_COPY.zh;
const has = (key, s) => assert.ok(Z[key].includes(s), `${key} should contain "${s}"`);

/* ch1 */
check('ch1: the eight wirings give AND, OR, NAND, NOR and the four mixed gates', () => {
  const name = (wiring, t1, t2) => M.nameOfTable(M.relayTable({ wiring, t1, t2 }));
  assert.strictEqual(name('series', 'no', 'no'), 'AND');
  assert.strictEqual(name('parallel', 'no', 'no'), 'OR');
  assert.strictEqual(name('parallel', 'nc', 'nc'), 'NAND');
  assert.strictEqual(name('series', 'nc', 'nc'), 'NOR');
  for (const w of ['series', 'parallel']) for (const a of ['no', 'nc']) for (const b of ['no', 'nc']) assert.ok(Z['gate.desc.' + name(w, a, b)], 'description for ' + name(w, a, b));
  // a lone normally-closed switch is NOT
  assert.deepStrictEqual([0, 1].map(p => M.switchConducts('nc', p) ? 1 : 0), [1, 0]);
});

/* ch2 */
check('ch2: smallest NAND counts are NOT 1, AND 2, OR 3, XOR 4 (brute force, constants allowed)', () => {
  assert.strictEqual(M.minNands(M.TARGETS.NOT, 5), 1);
  assert.strictEqual(M.minNands(M.TARGETS.AND, 5), 2);
  assert.strictEqual(M.minNands(M.TARGETS.OR, 5), 3);
  assert.strictEqual(M.minNands(M.TARGETS.XOR, 5), 4);
  for (const k of Object.keys(M.SOLUTIONS)) { const r = M.nandNetTable(M.SOLUTIONS[k]); assert.deepStrictEqual(r.table, M.TARGETS[k]); assert.strictEqual(r.used, M.minNands(M.TARGETS[k], 5)); }
  has('ch2.p3', '非 1 个'); has('ch2.p3', '与 2 个'); has('ch2.p3', '或 3 个'); has('ch2.p3', '异或 4 个');
});

/* ch3 */
check('ch3: 8 switches give 256 patterns; 255 + 1 wraps to 0 flipping all 8', () => {
  assert.strictEqual(2 ** 8, 256);
  assert.strictEqual(M.flipsOnIncrement(255, 8), 8);
  assert.strictEqual((255 + 1) & 255, 0);
  for (let v = 0; v < 256; v++) assert.strictEqual(M.fromBits(M.toBits(v, 8)), v);
  has('ch3.p2', '8 个 256 种'); has('ch3.p2', '最多问 8 次');
});

/* ch4 */
const L = M.ledger();
check('ch4: half adder 6, full adder 15, 8-bit adder 120 NANDs', () => {
  assert.strictEqual(L.halfAdder, 6); assert.strictEqual(L.fullAdder, 15); assert.strictEqual(L.adder8, 120);
  has('ch4.p2', '6 个与非门'); has('ch4.p3', '15 个与非门'); has('ch4.p3', '120 个与非门');
});
check('ch4: the gate-level adder agrees with + for all 65,536 pairs and both carry-ins', () => {
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) for (const c of [0, 1]) {
    const r = M.gateAdd(a, b, c), s = a + b + c;
    assert.strictEqual(r.sum, s & 255); assert.strictEqual(r.cout, s >> 8);
  }
});
check('ch4: settle time is 4k to 4k+2 gate delays for a carry chain of k (k >= 1); worst 32 at k = 8, in 128 pairs', () => {
  let worst = 0, worstN = 0, n8 = 0;
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) {
    const r = M.settleTime(a, b), k = M.carryChain(a, b);
    assert.strictEqual(r.sum, (a + b) & 255);
    if (k === 0) assert.ok(r.settle <= 4, `chain 0 settles by 4 (${a}+${b}: ${r.settle})`);
    else assert.ok(r.settle >= 4 * k && r.settle <= 4 * k + 2, `${a}+${b}: chain ${k}, settle ${r.settle}`);
    if (r.settle > worst) { worst = r.settle; worstN = 1; } else if (r.settle === worst) worstN++;
    if (k === 8) n8++;
  }
  assert.strictEqual(worst, 32); assert.strictEqual(worstN, 128); assert.strictEqual(n8, 128);
  has('ch4.p4', '4 个门'); has('ch4.p4', '32');
});
check('ch4: presets — 127+1 chain 7 settles at 30; 255+1 at 32; 100+27 chain 0; 85+85 chain 1', () => {
  assert.strictEqual(M.carryChain(127, 1), 7); assert.strictEqual(M.timedAdd(127, 1).settle, 30);
  assert.strictEqual(M.timedAdd(255, 1).settle, 32); assert.strictEqual(M.carryChain(100, 27), 0); assert.strictEqual(M.carryChain(85, 85), 1);
  // the recorded history ends at the right answer
  const r = M.timedAdd(127, 1), last = r.hist[r.hist.length - 1];
  assert.strictEqual(last.slice(0, 8).reduce((s, x, i) => s + x * 2 ** i, 0), 128);
});

check('ch4 limit: a full adder that shares gates needs 9 NANDs, and carry-in reaches carry-out through 2 gates', () => {
  // the classic 9-NAND full adder
  const c = new M.Circuit(), x = c.input(), y = c.input(), ci = c.input();
  const n1 = c.nand(x, y), n2 = c.nand(x, n1), n3 = c.nand(y, n1), s1 = c.nand(n2, n3);
  const n5 = c.nand(s1, ci), n6 = c.nand(s1, n5), n7 = c.nand(ci, n5), s = c.nand(n6, n7), co = c.nand(n5, n1);
  c.compile(); assert.strictEqual(c.nGates, 9);
  for (let k = 0; k < 8; k++) { const st = c.state(); st.v[x] = k & 1; st.v[y] = (k >> 1) & 1; st.v[ci] = (k >> 2) & 1; c.settle(st); const tot = (k & 1) + ((k >> 1) & 1) + ((k >> 2) & 1); assert.strictEqual(st.v[s], tot & 1); assert.strictEqual(st.v[co], tot >> 1); }
  // path from ci to co: ci -> n5 -> co, two gates
  assert.deepStrictEqual([c.a[n5], c.b[n5]].includes(ci) && [c.a[co], c.b[co]].includes(n5), true);
  has('ch4.limit', '9 个与非门'); has('ch4.limit', '2 个门');
});

/* ch5 */
check('ch5: add/subtract unit matches arithmetic mod 256 for every pair; 156 NANDs', () => {
  assert.strictEqual(L.addSub8, 156); has('ch5.p2', '156 个与非门'); has('ch5.p2', '32 个与非门');
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) {
    const s = M.addSub(a, b, 0), d = M.addSub(a, b, 1);
    assert.strictEqual(s.result, (a + b) & 255); assert.strictEqual(d.result, (a - b) & 255);
    const sa = M.toSigned(a, 8), sb = M.toSigned(b, 8);
    assert.strictEqual(s.overflow, (sa + sb > 127 || sa + sb < -128) ? 1 : 0);
    assert.strictEqual(d.overflow, (sa - sb > 127 || sa - sb < -128) ? 1 : 0);
  }
});
check('ch5: 5 − 7 is 254 / −2 (1111 1110); 100 + 100 is −56 with overflow; −3 ≡ +253', () => {
  const r = M.addSub(5, 7, 1); assert.strictEqual(r.result, 254); assert.strictEqual(r.signed, -2); assert.strictEqual(r.result.toString(2), '11111110'); assert.strictEqual(r.overflow, 0);
  const o = M.addSub(100, 100, 0); assert.strictEqual(o.signed, -56); assert.strictEqual(o.overflow, 1);
  assert.strictEqual((~3 & 255) + 1, 253); assert.strictEqual(255 - 3, 252);
  has('ch5.p3', '1111 1110'); has('ch5.p3', '254'); has('ch5.p3', '−2'); has('ch5.p3', '−56');
});

/* ch6 */
check('ch6: SR latch is 4 NANDs; it remembers after S or R is released', () => {
  assert.strictEqual(L.srLatch, 4);
  const S = M.srSim({ jitter: 0 });
  S.set(1, 0); for (let i = 0; i < 10; i++) S.tick(); S.set(0, 0); for (let i = 0; i < 30; i++) S.tick();
  assert.strictEqual(S.q(), 1); assert.strictEqual(S.qn(), 0);
  S.set(0, 1); for (let i = 0; i < 10; i++) S.tick(); S.set(0, 0); for (let i = 0; i < 30; i++) S.tick();
  assert.strictEqual(S.q(), 0); assert.strictEqual(S.qn(), 1);
  S.set(1, 1); for (let i = 0; i < 10; i++) S.tick(); assert.strictEqual(S.q(), 1); assert.strictEqual(S.qn(), 1);
});
check('ch6: identical gates released together oscillate forever; with jitter 0.2 they settle at random', () => {
  assert.strictEqual(M.srRelease(0, 1, 2000).settled, null);
  const t = [], q = []; for (let s = 1; s <= 2000; s++) { const r = M.srRelease(0.2, s, 5000); assert.notStrictEqual(r.settled, null); t.push(r.settled); q.push(r.q); }
  const at4 = t.filter(x => x <= 4).length / 2000, over25 = t.filter(x => x > 25).length / 2000, ones = q.reduce((a, b) => a + b, 0) / 2000;
  assert.ok(at4 > 0.42 && at4 < 0.5, 'nearly half within 4 ticks: ' + at4);
  assert.ok(over25 > 0.007 && over25 < 0.02, 'about 1 in 100 beyond 25 ticks: ' + over25);
  assert.ok(ones > 0.45 && ones < 0.55, 'falls either way: ' + ones);
  has('ch6.p3', '2,000 次'); has('ch6.p3', '4 拍'); has('ch6.p3', '25 拍'); has('ch6.limit', '五分之一');
});

/* ch7 */
check('ch7: D latch 4, flip-flop 9, counter 185 (= 120 adder + 64 + 1)', () => {
  assert.strictEqual(L.dLatch, 4); assert.strictEqual(L.dff, 9); assert.strictEqual(L.counter8, 185);
  has('ch7.p2', '4 个与非门'); has('ch7.p3', '185 个与非门'); has('ch7.p3', '64 个'); has('ch7.p3', '120 个');
});
check('ch7: the counter counts correctly through two wraps at period >= 36, and 126 -> 255 at 34', () => {
  assert.strictEqual(M.minCounterPeriod(600), 36);
  for (const P of [36, 40, 60]) assert.strictEqual(M.counterRun(P, 600).errors, 0);
  const r = M.counterRun(34, 300); assert.deepStrictEqual(r.firstWrongStep, { from: 126, to: 255 });
  // why: going from 125 + 1 to 126 + 1, a false carry runs up through the 1s and the sum flashes through 255
  const tr = M.transitionAdd(125, 1, 126, 1);
  assert.deepStrictEqual(tr.values, [126, 125, 127, 123, 127, 119, 127, 111, 127, 95, 127, 63, 127, 255, 127]);
  assert.strictEqual(tr.settle, 30); assert.strictEqual(M.carryChain(126, 1), 0);
  has('ch7.p4', '36'); has('ch7.p4', '34'); has('ch7.p4', '126'); has('ch7.p4', '255'); has('ch7.p4', '125、123、119、111、95、63、255'); has('ch7.p4', '第 30 个');
  // no flip-flop is left stuck flipping at any period, and the register never changes while the clock is low
  for (let P = 12; P <= 60; P += 2) { // the page's slider range
    const s = M.counterSim(P); let prev = null;
    for (let k = 0; k < P * 300; k++) { s.tick(); if (s.clk() === 0) { const v = s.value(); if (prev !== null) assert.strictEqual(v, prev, 'P=' + P + ' changed while clock low'); prev = v; } else prev = null; }
    // finish on the last tick of a low phase: every slave latch must hold a proper bit (Q ≠ Q̄)
    while (s.clk() === 1) s.tick(); for (let k = 1; k < P / 2; k++) s.tick();
    const v = s.st.v; assert.ok(s.m.ff.every(f => v[f.q] !== v[f.qn]), 'P=' + P + ': a latch is stuck');
  }
});
check('ch7: loading 120 then ticking keeps counting', () => {
  const s = M.counterSim(40); s.load(120); assert.strictEqual(s.value(), 120);
  for (let k = 0; k < 10; k++) while (!s.tick()) { /* one period */ }
  assert.strictEqual(s.value(), 130);
});
check('ch7: "jump to 120" pressed at any phase of the clock gives 121 at the end of that period', () => {
  for (const P of [36, 40, 60]) for (let off = 0; off < P; off++) {
    const s = M.counterSim(P); for (let k = 0; k < 3 * P + off; k++) s.tick();
    s.load(120); assert.strictEqual(s.value(), 120);
    const seq = []; for (let c = 0; c < 10; c++) { while (!s.tick()) { /* one period */ } seq.push(s.value()); }
    assert.deepStrictEqual(seq, [121, 122, 123, 124, 125, 126, 127, 128, 129, 130], `P=${P}, pressed at phase ${off}`);
  }
});
check('ch7: every period from 36 to 60 counts right over four full 256-count cycles; every period below 36 fails', () => {
  for (let P = 12; P <= 60; P += 2) {
    const r = M.counterRun(P, 1024);
    if (P >= 36) { assert.strictEqual(r.errors, 0, 'P=' + P); assert.strictEqual(r.wrongSteps, 0, 'P=' + P); }
    else assert.ok(r.wrongSteps > 0, 'P=' + P + ' should fail');
  }
});
check('ch7: the slowest +1 in the counter is 31 gate delays (253+1 → 254+1 and 254+1 → 255+1), not 32', () => {
  let worst = 0; const at = [];
  for (let k = 0; k < 256; k++) { const s = M.transitionAdd((k + 255) & 255, 1, k, 1).settle; if (s > worst) { worst = s; at.length = 0; } if (s === worst) at.push(k); }
  assert.strictEqual(worst, 31); assert.deepStrictEqual(at, [254, 255]);
  has('ch7.p4', '31'); has('ch7.p4', '253 + 1');
});
check('ch7: at periods 36 and 38 the top bit still flashes for one tick after some edges; from 40 up no bit ever changes twice in a period', () => {
  const maxFlips = P => {
    const s = M.counterSim(P); let lb = s.bits(), mx = 0;
    for (let c = 0; c < 1024; c++) { const f = new Array(8).fill(0); for (;;) { const e = s.tick(), b = s.bits(); b.forEach((x, i) => { if (x !== lb[i]) f[i]++; }); lb = b; if (e) break; } mx = Math.max(mx, ...f); }
    return mx;
  };
  assert.strictEqual(maxFlips(36), 2); assert.strictEqual(maxFlips(38), 2);
  for (let P = 40; P <= 60; P += 2) assert.strictEqual(maxFlips(P), 1, 'P=' + P);
  has('ch7.p4', '38'); has('ch7.p4', '40');
});

/* ch8 */
check('ch8: MUX 4 NANDs; ALU 281 NANDs; ALU equals ADD/SUB/AND/OR and flags for all pairs', () => {
  assert.strictEqual(L.mux, 4); assert.strictEqual(L.alu8, 281); has('ch8.p1', '4 个与非门'); has('ch8.p2', '281');
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) for (let op = 0; op < 4; op++) {
    const r = M.alu(a, b, op), e = [(a + b) & 255, (a - b) & 255, a & b, a | b][op];
    assert.strictEqual(r.result, e); assert.strictEqual(r.z, e === 0 ? 1 : 0);
    if (op === 1) assert.strictEqual(r.c, a >= b ? 1 : 0);
    if (op === 0) assert.strictEqual(r.c, a + b > 255 ? 1 : 0);
  }
});

/* ch9 */
check('ch9: the machine multiplies: all x in 0..255, y in 0..15 (and sampled larger y), in 8y + 3 steps', () => {
  for (let x = 0; x < 256; x++) for (let y = 0; y < 16; y++) {
    const R = M.run(M.multiplyProgram(x, y)); assert.ok(R.halted); assert.strictEqual(R.mem[14], (x * y) & 255); assert.strictEqual(R.steps, 8 * y + 3);
  }
  const rnd = M.rng(5);
  for (let k = 0; k < 400; k++) { const x = (rnd() * 256) | 0, y = (rnd() * 256) | 0, R = M.run(M.multiplyProgram(x, y), 5000); assert.strictEqual(R.mem[14], (x * y) & 255); assert.strictEqual(R.steps, 8 * y + 3); }
});
check('ch9: 6 × 7 = 42 in 59 steps; 7 × 6 in 51; 20 × 13 = 4; LOAD 13 is the number 29', () => {
  let R = M.run(M.multiplyProgram(6, 7)); assert.strictEqual(R.mem[14], 42); assert.strictEqual(R.steps, 59);
  R = M.run(M.multiplyProgram(7, 6)); assert.strictEqual(R.mem[14], 42); assert.strictEqual(R.steps, 51);
  R = M.run(M.multiplyProgram(20, 13)); assert.strictEqual(R.mem[14], 4);
  assert.strictEqual(M.enc('LOAD', 13), 29); assert.strictEqual(M.decode(29).name, 'LOAD');
  has('ch9.p3', '59'); has('ch9.p3', '42'); has('ch9.p3', '51'); has('ch9.p3', '8y + 3'); has('ch9.p3', '20 × 13'); has('ch9.p4', '29');
});
check('ch9: countdown program and the program counter adder (60 NANDs) wrap at 16', () => {
  for (let y = 0; y < 40; y++) { const R = M.run(M.countdownProgram(y)); assert.ok(R.halted); assert.strictEqual(R.mem[13], 0); }
  for (let p = 0; p < 16; p++) assert.strictEqual(M.pcPlusOne(p), (p + 1) & 15);
  assert.strictEqual(L.pcAdder4, 60);
  assert.strictEqual(L.memory16x8, 512); has('ch9.limit', '128 个锁存器'); has('ch9.limit', '512 个与非门');
});

/* ch10 */
check('ch10: 0.1 + 0.2 in a double-like format matches JavaScript and the stated exact values', () => {
  const f = M.floatSum('0.1', '0.2', 11, 52);
  assert.strictEqual(M.exactDecimal(f.fa.m, f.fa.s), '0.1000000000000000055511151231257827021181583404541015625');
  assert.strictEqual(Number(M.exactDecimal(f.sum.m, f.sum.s)), 0.1 + 0.2);
  assert.strictEqual(String(0.1 + 0.2), '0.30000000000000004');
  assert.ok(M.exactDecimal(f.sum.m, f.sum.s).startsWith('0.3000000000000000444'));
  assert.ok(M.exactDecimal(f.fc.m, f.fc.s).startsWith('0.2999999999999999888'));
  assert.strictEqual(f.equal, false); assert.strictEqual(f.ulps, 1);
  has('ch10.p3', '0.1000000000000000055511151231257827021181583404541015625'); has('ch10.say.ne52', '0.3000000000000000444'); has('ch10.say.ne52', '0.2999999999999999888');
});
check('ch10: for 0.1 + 0.2, odd widths 3..51 are equal, even widths 2..52 are not (25 of 51)', () => {
  const eq = []; for (let m = 2; m <= 52; m++) if (M.floatSum('0.1', '0.2', 11, m).equal) eq.push(m);
  assert.deepStrictEqual(eq, Array.from({ length: 25 }, (_, i) => 3 + 2 * i));
  assert.ok(eq.includes(23)); assert.ok(!eq.includes(52));
  has('ch10.p3', '2 到 52 位');
});
check('ch10: the odd/even pattern is not general — 0.1 + 0.4 is equal at all 51 widths, 0.3 + 0.6 at none', () => {
  const count = (a, b) => { let k = 0; for (let m = 2; m <= 52; m++) if (M.floatSum(a, b, 11, m).equal) k++; return k; };
  assert.strictEqual(count('0.1', '0.4'), 51); assert.strictEqual(count('0.3', '0.6'), 0);
  assert.strictEqual(0.3 + 0.6 === 0.9, false); assert.strictEqual(0.1 + 0.4 === 0.5, true); // the 52-bit ends agree with JavaScript
  has('ch10.p3', '0.1 + 0.4'); has('ch10.p3', '0.3 + 0.6');
});
check('ch10: the BigInt rounding agrees with JavaScript doubles on many decimals and sums', () => {
  const rnd = M.rng(3);
  for (let k = 0; k < 3000; k++) {
    const a = (rnd() * 1000).toFixed(1 + ((rnd() * 6) | 0)), b = (rnd() * 10).toFixed(1 + ((rnd() * 6) | 0));
    const f = M.floatSum(a, b, 11, 52);
    assert.strictEqual(Number(M.exactDecimal(f.fa.m, f.fa.s)), Number(a));
    assert.strictEqual(Number(M.exactDecimal(f.sum.m, f.sum.s)), Number(a) + Number(b), a + ' + ' + b);
  }
  // float32 agreement at 23 bits for numbers of this size
  const f32 = M.floatSum('0.1', '0.2', 11, 23);
  assert.strictEqual(Number(M.exactDecimal(f32.sum.m, f32.sum.s)), Math.fround(Math.fround(0.1) + Math.fround(0.2)));
  assert.strictEqual(Math.fround(Math.fround(0.1) + Math.fround(0.2)), Math.fround(0.3));
});

/* ch11 */
check('ch11: machine is 1,022 NANDs, about 4,088 transistors; M1 / machine about 3.9 million', () => {
  const MN = M.machineNands(); assert.strictEqual(MN.total, 1022); assert.strictEqual(MN.registers, 169);
  assert.strictEqual(MN.total * 4, 4088);
  assert.strictEqual(Math.round(16e9 / (MN.total * 4) / 1e4) * 1e4, 3910000);
  assert.ok(MN.total * 4 > 1000 && MN.total * 4 < 10000, 'same order of magnitude as 2,300');
});
check('ch11: a signed 32-bit count of seconds runs out at 2038-01-19 03:14:07 UTC', () => {
  assert.strictEqual(new Date(M.int32SecondsLimit() * 1000).toISOString(), '2038-01-19T03:14:07.000Z');
});

console.log(`\n${n} checks passed`);
