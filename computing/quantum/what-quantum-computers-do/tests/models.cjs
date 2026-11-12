'use strict';
// Pins every number the essay's prose states to the page's own models (and the simulator to textbook results),
// and checks that the prose in copy.zh.js still says exactly that number.
// Run: node computing/quantum/what-quantum-computers-do/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const S = M.sim, PI = Math.PI, F = M.FRONTIER;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const pc = (x, d) => (x * 100).toFixed(d);
const deg = d => d * PI / 180;

/* ── the simulator against textbook identities ── */
{
  // unitarity: norm preserved by a deep random circuit
  const s = M.memory.randomState(8, 9, 6); check('norm after random circuit', f(S.norm(s), 12), '1.000000000000');
  // gate-built QFT equals the DFT matrix, forward and inverse (N&C §5.1)
  for (const inv of [false, true]) {
    const a = M.memory.randomState(5, 3), b = S.qft(S.clone(a), [0, 1, 2, 3, 4], inv), c = S.dft(a, inv);
    let e = 0; for (let i = 0; i < 32; i++) e = Math.max(e, Math.abs(b.re[i] - c.re[i]), Math.abs(b.im[i] - c.im[i]));
    check('QFT gates = DFT ' + (inv ? 'inverse' : 'forward'), e < 1e-12, true);
  }
  // HZH = X, HXH = Z, Bell state amplitudes
  { const s1 = S.create(1); S.h(s1, 0); S.apply(s1, 0, S.G.Z); S.h(s1, 0); check('HZH|0> = |1>', f(S.probOne(s1, 0), 6), '1.000000'); }
  { const b = M.chsh.bell(); check('Bell |00>', f(b.re[0], 6), f(Math.SQRT1_2, 6)); check('Bell |11>', f(b.re[3], 6), f(Math.SQRT1_2, 6)); check('Bell |01>', f(Math.abs(b.re[1]) + Math.abs(b.re[2]), 6), '0.000000'); }
  // trajectories average to the channel: depolarising on |+>, <X> shrinks by (1 − 4p/3) per application
  { const r = M.rng(11), p = 0.1, k = 3, T = 20000; let ex = 0;
    for (let t = 0; t < T; t++) { const s1 = S.create(1); S.h(s1, 0); for (let j = 0; j < k; j++) S.depolarize(s1, 0, p, r); S.h(s1, 0); ex += 1 - 2 * S.probOne(s1, 0); }
    near('depolarising trajectories: <X> = (1−4p/3)^3', ex / T, Math.pow(1 - 4 * p / 3, k), 0.02); }
  { const r = M.rng(12), p = 0.2, T = 20000; let ex = 0;
    for (let t = 0; t < T; t++) { const s1 = S.create(1); S.h(s1, 0); S.dephase(s1, 0, p, r); S.h(s1, 0); ex += 1 - 2 * S.probOne(s1, 0); }
    near('dephasing trajectories: <X> = 1 − 2p', ex / T, 1 - 2 * p, 0.02); }
}

/* ── ch1 one qubit ── */
{
  const Q = M.qubit;
  check('ch1 θ=60° Z: P(0)', pc(Q.p0(deg(60), deg(90), 'z'), 0), '75'); says('ch1.p3', 'cos²30° = 75%');
  check('ch1 φ does not change Z statistics', pc(Q.p0(deg(60), deg(250), 'z'), 6), pc(Q.p0(deg(60), 0, 'z'), 6));
  check('ch1 θ=90°, φ=0: Z is 50/50', pc(Q.p0(deg(90), 0, 'z'), 1), '50.0'); check('ch1 θ=90°, φ=0: X is 100% +', pc(Q.p0(deg(90), 0, 'x'), 1), '100.0'); says('ch1.p3', '沿 X 测却 100% 是“+”');
  check('ch1 Y basis depends on φ', pc(Q.p0(deg(90), deg(90), 'y'), 1), '100.0');
  // Born rule: X basis probability (1 + sinθ cosφ)/2
  check('ch1 Born X', f(Q.p0(deg(60), 1, 'x'), 9), f((1 + Math.sin(deg(60)) * Math.cos(1)) / 2, 9));
  // shots converge to the Born probability
  near('ch1 10000 shots', Q.shots(deg(60), 0, 'z', 10000, M.rng(1)) / 10000, 0.75, 0.015);
}

/* ── ch2 Mach–Zehnder ── */
{
  const Zm = M.mz;
  check('ch2 φ=0: all to D0', pc(Zm.run(0).p0, 3), '100.000'); check('ch2 φ=180: all to D1', pc(Zm.run(PI).p1, 3), '100.000');
  check('ch2 φ=60: 75%', pc(Zm.run(deg(60)).p0, 0), '75'); says('ch2.p3', '落在探测器 0 的概率是 75%');
  check('ch2 peek 30% → visibility 70%', pc(Zm.visibility(0.3), 0), '70'); says('ch2.p4', '条纹对比度降到 70%');
  check('ch2 peek 100% → 50/50 at any φ', pc(Zm.run(deg(37), 1).p0, 3), '50.000'); says('ch2.p4', '两边永远各 50%');
  check('ch2 coins', Zm.classical(), 0.5);
  const pa = Zm.paths(0); check('ch2 D1 contributions ±½', f(pa.d1[0][0], 3) + ' ' + f(pa.d1[1][0], 3), '0.500 -0.500'); says('ch2.say.dark1', '一个振幅是 +½，另一个是 −½');
}

/* ── ch3 CHSH ── */
{
  const H = M.chsh;
  check('ch3 classical best', pc(H.classicalBest(), 0), '75'); says('ch3.p2', '最多也只能赢 75%'); says('ch3.p2', '16 种确定的策略');
  check('ch3 quantum best', pc(H.winProb(H.best), 1), '85.4'); says('ch3.p3', 'cos²22.5° ≈ 85.4%');
  check('ch3 = cos²(π/8)', f(H.winProb(H.best), 12), f(Math.cos(PI / 8) ** 2, 12));
  check('ch3 S = 2√2', f(H.S(H.best), 2), '2.83'); says('ch3.p3', 'S = 2√2 ≈ 2.83');
  check('ch3 best angles', [H.best.a0, H.best.a1, H.best.b0, H.best.b1].map(a => f(a * 180 / PI, 1)).join(' '), '0.0 45.0 22.5 -22.5'); says('ch3.p3', '阿丽丝 0° 和 45°，鲍勃 22.5° 和 −22.5°');
  for (const tb of [0, 0.3, 1.2]) for (const ta of [0, PI / 4, 1]) check(`ch3 Bob marginal 50% (a=${f(ta, 2)}, b=${tb})`, pc(H.bobMarginal(ta, tb), 6), '50.000000');
  says('ch3.p4', '答 1 的比例都是 50%');
  // sampled play converges
  const tl = H.play(H.best, 20000, M.rng(3)); near('ch3 20000 rounds', tl.wins / tl.rounds, 0.8536, 0.01);
  // canvas labels quote the same two numbers
  says('ch3.cv.classical', '75%'); says('ch3.cv.quantum', '85.4%');
}

/* ── ch4 memory ── */
{
  const Me = M.memory;
  check('ch4 30 qubits GB', f(Me.bytes(30) / 1e9, 1), '17.2'); says('ch4.p3', '30 个比特需要约 17.2 GB');
  check('ch4 laptop 16 GB', Me.maxQubits(16e9), 29); says('ch4.p3', '最多存 29 个比特');
  check('ch4 45 qubits PB', f(Me.bytes(45) / 1e15, 2), '0.56'); says('ch4.p3', '45 个比特是 0.56 PB');
  check('ch4 record', F.sim45.n + ' ' + F.sim45.bytesPB, '45 0.5'); says('ch4.p3', '约 0.5 PB');
  check('ch4 60 qubits log10', f(Me.log10Bytes(60), 1), '19.3'); says('ch4.p3', '10<sup>19.3</sup> 字节');
  check('ch4 60 qubits EB', f(Me.bytes(60) / 1e18, 0), '18'); says('ch4.p3', '18 EB');
}

/* ── ch5 Deutsch–Jozsa ── */
{
  const D = M.dj;
  for (const id of Object.keys(D.F)) { check('ch5 promise holds for ' + id, D.isConstant(id) || D.isBalanced(id), true); check('ch5 P(000) ' + id, f(D.pAllZero(id), 9), D.isConstant(id) ? '1.000000000' : '0.000000000'); }
  check('ch5 classical worst n=3', D.classicalWorst(3), 5); says('ch5.p2', '这里是 5 次');
  check('ch5 10 random queries all equal (balanced)', pc(2 * Math.pow(0.5, 10), 1), '0.2'); says('ch5.p4', '约 0.2%');
  // after the oracle, the amplitude of x has sign (−1)^f(x)
  const st = D.stage('maj', 2).amps; check('ch5 phase kickback', Array.from(st).map(a => (a < 0 ? 1 : 0)).join(''), [0, 1, 2, 3, 4, 5, 6, 7].map(v => D.F.maj(v)).join(''));
}

/* ── ch6 Grover ── */
{
  const G = M.grover;
  for (const nq of [3, 6, 8, 10]) { const N = 1 << nq, c = G.curve(nq, 5, G.kOpt(N) + 2); for (let k = 0; k < c.length; k++) near(`ch6 simulator = sin² formula n=${nq} k=${k}`, c[k], G.exact(N, k), 1e-10); }
  check('ch6 n=6 kOpt', G.kOpt(64), 6); check('ch6 n=6 P', pc(G.exact(64, 6), 1), '99.7'); says('ch6.p3', '转 6 轮测到目标的概率是 99.7%');
  check('ch6 n=10 kOpt', G.kOpt(1024), 25); check('ch6 n=10 P', pc(G.exact(1024, 25), 2), '99.95'); says('ch6.p3', '转 25 轮，99.95%');
  check('ch6 classical half', 1024 / 2, 512); says('ch6.p3', '即 512 次');
  check('ch6 n=10 at 50 iterations', pc(G.curve(10, 5, 50)[50], 2), '0.02'); says('ch6.p3', '第 50 轮，测到目标的概率会掉到 0.02%');
}

/* ── ch7 Shor ── */
{
  const Sh = M.shor;
  check('ch7 order of 7 mod 15', Sh.order(7, 15), 4); says('ch7.p3', '周期 r = 4');
  const { p } = Sh.run(15, 7, 4); check('ch7 peaks', Array.from(p).map((v, i) => v > 1e-9 ? i + ':' + pc(v, 0) : '').filter(Boolean).join(' '), '0:25 4:25 8:25 12:25'); says('ch7.p3', '0、4、8、12，各占 25%');
  check('ch7 y=4', Sh.attempt(4, 4, 15, 7).ok + ' ' + Sh.attempt(4, 4, 15, 7).f1 + 'x' + Sh.attempt(4, 4, 15, 7).f2, 'true 3x5'); check('ch7 y=12', Sh.attempt(12, 4, 15, 7).ok, true);
  check('ch7 y=8 fails', Sh.attempt(8, 4, 15, 7).reason, 'noperiod'); check('ch7 y=0 fails', Sh.attempt(0, 4, 15, 7).reason, 'zero');
  check('ch7 7² mod 15', Sh.modpow(7, 2, 15), 4); says('ch7.p3', '7² mod 15 = 4，gcd(3, 15) = 3，gcd(5, 15) = 5');
  check('ch7 success 15', pc(Sh.successProb(15, 7, 4), 0), '50'); says('ch7.p3', '成功的概率是 50%');
  check('ch7 order of 2 mod 21', Sh.order(2, 21), 6); says('ch7.p3', '周期是 6');
  check('ch7 success 21 t=5', pc(Sh.successProb(21, 2, 5), 0), '23'); says('ch7.p3', '约为 23%');
  check('ch7 GNFS constant', f(Math.cbrt(64 / 9), 2), '1.92'); says('ch7.p4', 'exp(1.92');
  check('ch7 RSA-250', F.rsa250.bits + ' ' + F.rsa250.coreYears, '829 2700'); says('ch7.p4', 'RSA-250（829 位），用了约 2700 个 CPU 核年');
  const ratio = Math.exp(Sh.lnGNFS(2048) - Sh.lnGNFS(829)); check('ch7 GNFS ratio ~2e11', ratio.toExponential(0), '2e+11'); says('ch7.p4', '约 2×10<sup>11</sup> 倍');
  check('ch7 2048 core-years ~6e14', Sh.gnfsExtrapolate(2048, 829, 2700).toExponential(0), '6e+14'); says('ch7.p4', '约 6×10<sup>14</sup> 核年');
  const E = Object.fromEntries(F.estimates.map(e => [e.id, e.v]));
  check('ch7 estimates', [E.rsa2019.phys, E.rsa2019.hours, E.rsa2025.phys, E.rsa2025.days, E.rsa2026.phys].join(' '), '20000000 8 1000000 7 100000');
  says('ch7.p5', '约 2000 万个物理比特、8 小时'); says('ch7.p5', '不到 100 万个、不到一周'); says('ch7.p5', '不到 10 万个');
  check('ch7 max 10 qubits', Sh.workBits(15) + 6, 10); check('ch7 max 10 qubits (21)', Sh.workBits(21) + 5, 10);
}

/* ── ch8 crossover ── */
{
  const X = M.crossover;
  check('ch8 N*', X.nStar(1e9, 1e2).toExponential(0), '6e+13'); says('ch8.p3', 'N ≈ 6×10<sup>13</sup>');
  check('ch8 t* hours', f(X.tStar(1e9, 1e2) / 3600, 0), '17'); says('ch8.p3', '约 17 小时');
  check('ch8 equal times at N*', f(X.tClassical(X.nStar(1e9, 1e2), 1e9) / X.tGrover(X.nStar(1e9, 1e2), 1e2), 9), '1.000000000');
  check('ch8 Rq ÷10 → ×100 time', f(X.tStar(1e9, 1e1) / X.tStar(1e9, 1e2), 6), '100.000000'); check('ch8 t* = (π/4)² Rc/Rq²', f(X.tStar(1e9, 1e2), 3), f((PI / 4) ** 2 * 1e9 / 1e4, 3)); says('ch8.p3', '每秒的步数少 10 倍'); says('ch8.p3', '打平时的耗时就长 100 倍');
}

/* ── ch9 noise ── */
{
  const G = M.grover, run = (nq, p, kind) => { const N = 1 << nq, c = G.noisyCurve(nq, 5 % N, G.kmaxFor(N), p, kind, G.TRAJ, G.SEED); let b = 0, kb = 0; c.forEach((v, i) => { if (v > b) { b = v; kb = i; } }); return { b, kb, c }; };
  says('ch9.model.how', String(G.TRAJ) + ' 次独立的运行');
  check('ch9 p=0 equals ideal', f(run(6, 0, 'depol').b, 6), f(G.exact(64, 6), 6));
  check('ch9 expected errors n6 p0.5%', f(G.expectedErrors(6, 6, 0.005), 1), '1.1'); says('ch9.p3', '预计出错 1.1 次');
  const a = run(6, 0.005, 'depol'); check('ch9 best ~47%', pc(a.b, 0), '47'); check('ch9 best at 5', a.kb, 5); says('ch9.p3', '从 99.7% 掉到约 47%，而且出现在第 5 轮');
  check('ch9 errors p0.1%', f(G.expectedErrors(6, 6, 0.001), 2), '0.22'); const b = run(6, 0.001, 'depol'); check('ch9 best ~88%', pc(b.b, 0), '88'); says('ch9.p3', '预计出错 0.22 次，最好的概率回到约 88%');
  check('ch9 n8 kOpt', G.kOpt(256), 12); const c = run(8, 0.005, 'depol'); check('ch9 n8 best ~18%', pc(c.b, 0), '18'); says('ch9.p3', '最佳轮数变成 12'); says('ch9.p3', '只剩约 18%');
  // the seeded trajectory average agrees with a bigger independent run (no tuned seed)
  near('ch9 MC stable', G.noisyCurve(6, 5, 12, 0.005, 'depol', 2000, 99)[5], a.c[5], 0.03);
  // dephasing alone also destroys the peak
  check('ch9 dephasing also hurts', run(6, 0.005, 'dephase').b < 0.6, true);
}

/* ── ch10 error correction ── */
{
  const R = M.rep, Sc = M.surface, r = M.rng(1);
  check('ch10 one flip corrected', [0, 1, 2].map(q => { const e = [0, 0, 0]; e[q] = 'X'; return R.round(e, r).ok; }).join(), 'true,true,true');
  check('ch10 syndromes', [0, 1, 2].map(q => { const e = [0, 0, 0]; e[q] = 'X'; return R.round(e, r).syndrome.join(''); }).join(' '), '10 11 01');
  check('ch10 two flips → logical error', R.round(['X', 'X', 0], r).ok, false);
  check('ch10 Z not seen', R.round([0, 'Z', 0], r).syndrome.join('') + ' ' + R.round([0, 'Z', 0], r).ok, '00 false');
  check('ch10 logical at 10%', pc(R.logical(0.1), 1), '2.8'); says('ch10.p3', 'p = 10% 时把错误率降到 2.8%');
  check('ch10 break-even 50%', f(R.logical(0.5), 6), '0.500000'); says('ch10.p3', 'p 超过 50% 时'); check('ch10 worse above', R.logical(0.55) > 0.55, true);
  says('ch10.modelB.how', String(R.TRIALS) + ' 轮'); says('ch10.read.mc', String(R.TRIALS) + ' 轮');
  near('ch10 Monte Carlo = formula at 10%', R.monteCarlo(0.1, R.TRIALS, R.SEED), R.logical(0.1), 0.008);
  near('ch10 Monte Carlo = formula at 30%', R.monteCarlo(0.3, 20000, 3), R.logical(0.3), 0.01);
  check('ch10 surface d at 0.1%, 1e-12', Sc.distanceFor(0.001, 1e-12), 23); check('ch10 qubits d=23', Sc.qubits(23), 1057); says('ch10.p3', '需要 d = 23，每个逻辑比特 1057 个物理比特');
  check('ch10 surface d at 0.01%', Sc.distanceFor(0.0001, 1e-12), 11); check('ch10 qubits d=11', Sc.qubits(11), 241); says('ch10.p3', 'p = 0.01% 时只要 d = 11，241 个物理比特');
  check('ch10 1000 physical < one logical at 0.1%/1e-12', Sc.qubits(Sc.distanceFor(0.001, 1e-12)) > 1000, true); says('ch10.p4', '一千个物理比特还凑不出一个能可靠运行一万亿步');
  check('ch10 above threshold gets worse', Sc.pL(0.012, 5) > Sc.pL(0.012, 3), true);
  says('ch10.modelC.how', '0.1 × (p / p<sub>th</sub>)'); says('ch10.modelC.how', '取 1%'); check('ch10 constants', Sc.A + ' ' + Sc.PTH, '0.1 0.01');
}

/* ── ch11 frontier extrapolation ── */
{
  const L = M.lambdaModel, Sc = M.surface, W = F.hardware.find(h => h.id === 'willow').v, e7 = W.eps7 / 100;
  says('ch11.model.how', '0.143%'); says('ch11.model.how', 'Λ = 2.14'); check('ch11 Willow data', W.eps7 + ' ' + W.lam + ' ' + W.q, '0.143 2.14 105');
  check('ch11 measured point reproduced', f(L.eps(7, e7, W.lam), 5), '0.00143');
  check('ch11 d for 1e-6', L.distanceFor(1e-6, e7, W.lam), 27); check('ch11 q d=27', Sc.qubits(27), 1457); says('ch11.p2', '码距 27（每个逻辑比特 1457 个物理比特）');
  check('ch11 d for 1e-12', L.distanceFor(1e-12, e7, W.lam), 63); check('ch11 q d=63', Sc.qubits(63), 7937); says('ch11.p2', '码距 63（7937 个）');
  check('ch11 Λ=4', L.distanceFor(1e-12, e7, 4), 39); says('ch11.p2', '提高到 4，后者降到码距 39');
  const He = F.hardware.find(h => h.id === 'helios').v; check('ch11 Helios 2q error ~1e-3', He.e2 < 1e-3 && He.e2 > 5e-4, true); says('ch11.law', '千分之一左右的两比特门错误率');
  check('ch11 ~100 qubits', [W.q, He.q].join(' '), '105 98'); says('ch11.law', '一百个左右的高质量物理比特');
  check('ch11 IBM 2029', F.hardware.find(h => h.id === 'ibm').v.year, 2029); says('ch11.p3', '2029 年前后');
  check('ch11 every frontier item has copy, a kind and a month', [].concat(F.hardware, F.advantage, F.estimates, F.crypto).every(it => Z['fr.' + it.id] && Z['fr.kind.' + it.kind] && /^\d{4}-\d{2}$/.test(it.asOf)), true);
  // every placeholder in each card is filled from the data
  for (const it of [].concat(F.hardware, F.advantage, F.estimates, F.crypto)) { const ph = (Z['fr.' + it.id].match(/\{(\w+)\}/g) || []).map(x => x.slice(1, -1)); check('ch11 card placeholders ' + it.id, ph.every(k => k in it.v), true); }
}

/* ── every say/template branch exists and fills (both extremes of each control are driven in tests/browser.cjs) ── */
{
  const keys = Object.keys(Z), need = ['ch1.say.none', 'ch1.say.sure', 'ch1.say.freq', 'ch1.say.freqZ', 'ch2.say.dark0', 'ch2.say.dark1', 'ch2.say.watched', 'ch2.say.mid', 'ch3.say.none', 'ch3.say.few', 'ch3.say.beat', 'ch3.say.below', 'ch3.say.close', 'ch3.say.classical', 'ch3.say.classicalNone', 'ch4.say.laptop', 'ch4.say.cluster', 'ch4.say.beyond', 'ch5.say.s0', 'ch5.say.s1', 'ch5.say.s2c', 'ch5.say.s2b', 'ch5.say.s3c', 'ch5.say.s3b', 'ch6.say.start', 'ch6.say.rise', 'ch6.say.peak', 'ch6.say.over', 'ch7.say.none', 'ch7.say.ok', 'ch7.say.zero', 'ch7.say.noperiod', 'ch7.say.odd', 'ch7.say.minus1', 'ch7.say.trivial', 'ch8.say.fast', 'ch8.say.mid', 'ch8.say.long', 'ch9.say.clean', 'ch9.say.ok', 'ch9.say.hurt', 'ch9.say.hurtEarly', 'ch9.say.dead', 'ch10.say.none', 'ch10.say.fixed', 'ch10.say.two', 'ch10.say.three', 'ch10.say.z', 'ch10.say.zcancel', 'ch10.say.mixed', 'ch10.say.B.zero', 'ch10.say.B.better', 'ch10.say.B.even', 'ch10.say.B.worse', 'ch10.say.C.below', 'ch10.say.C.above', 'ch10.say.C.far', 'ch11.say.base', 'ch11.say.good', 'ch11.say.far'];
  for (const k of need) check('copy has ' + k, keys.includes(k), true);
  // every Shor failure reason is reachable from the model
  const reasons = new Set();
  for (const N of [15, 21]) for (const a of M.shor.coprimes(N)) for (let t = 3; t <= 10 - M.shor.workBits(N); t++) { const { p } = M.shor.run(N, a, t); for (let y = 0; y < p.length; y++) if (p[y] > 1e-9) reasons.add(M.shor.attempt(y, t, N, a).reason); }
  check('ch7 reachable reasons', [...reasons].sort().join(' '), 'minus1 noperiod odd ok trivial zero');
}

console.log(fails ? `${fails} of ${n} checks FAILED` : `PASS: ${n} checks (simulator identities, every number in the prose, frontier data placeholders)`);
process.exit(fails ? 1 : 0);
