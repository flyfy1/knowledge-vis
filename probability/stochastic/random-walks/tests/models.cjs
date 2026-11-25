'use strict';
/* node probability/stochastic/random-walks/tests/models.cjs
   Re-derives the models' numbers independently and pins every number the prose states (through bindings.cjs). */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '..');
const M = require('../models.js');
const D = require('../data.js');
const B = require('../bindings.cjs')(M);
const close = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let n = 0; const ok = () => n++;

/* ch1: exact binomial values, by direct counting with BigInt */
function choose(nn, k) { let r = 1n; for (let i = 1n; i <= BigInt(k); i++) r = r * (BigInt(nn) - BigInt(k) + i) / i; return r; }
function within(nn, c) { let s = 0n; for (let k = 0; k <= nn; k++) if (Math.abs(2 * k - nn) <= c) s += choose(nn, k); return Number(s * 1000000n / (1n << BigInt(nn))) / 1e6; }
close(M.shareWithin(100, 10), within(100, 10), 1e-6, 'P(|S100|<=10)'); ok();
close(M.shareWithin(100, 20), within(100, 20), 1e-6, 'P(|S100|<=20)'); ok();
close(M.shareWithin(400, 20), within(400, 20), 1e-6, 'P(|S400|<=20)'); ok();
// E|S_2m| = 2m C(2m,m) / 4^m
close(M.meanAbs(100), 100 * Number(choose(100, 50) * 1000000000n / (1n << 100n)) / 1e9, 1e-6, 'E|S100|'); ok();
assert.strictEqual(B['ch1.in100'], '72.9%'); assert.strictEqual(B['ch1.in2_100'], '96.5%'); assert.strictEqual(B['ch1.in10000'], '68.8%');
assert.strictEqual(B['ch1.abs100'], '7.96'); assert.strictEqual(B['ch1.ratio'], '0.80'); ok();
// The ensemble's measured RMS at 400 steps is near 20 for 200 walkers.
{ const E = M.makeEnsemble(200, 1001); for (let i = 0; i < 400; i++) M.stepEnsemble(E); const s = M.ensembleStats(E); assert(s.rms > 17 && s.rms < 23, 'ensemble rms ' + s.rms); ok(); }

/* ch2: every step law has mean 0 and variance 1 (checked by quadrature / enumeration), skewness pinned */
{ // lopsided: +sqrt3 w.p. 1/4, -1/sqrt3 w.p. 3/4
  const a = Math.sqrt(3), b = -1 / Math.sqrt(3);
  close(0.25 * a + 0.75 * b, 0, 1e-12, 'lopsided mean'); close(0.25 * a * a + 0.75 * b * b, 1, 1e-12, 'lopsided var');
  close(0.25 * a ** 3 + 0.75 * b ** 3, M.STEPS.lopsided.skew, 1e-12, 'lopsided skew');
  close(0.25 * a ** 4 + 0.75 * b ** 4, M.STEPS.lopsided.kurt, 1e-12, 'lopsided kurt');
  // uniform on [-√3, √3]: var = (2√3)²/12 = 1, E X^4 = 9/5 = 1.8
  close((2 * Math.sqrt(3)) ** 2 / 12, 1, 1e-12, 'uniform var'); close(9 / 5, M.STEPS.uniform.kurt, 1e-12, 'uniform kurt'); ok();
  for (const tp of ['coin', 'uniform', 'lopsided']) { const m = M.moments(M.sampleSums(tp, 100, 4000, 77)); assert(Math.abs(m.sd / 10 - 1) < 0.05, tp + ' sd ' + m.sd); } ok();
  assert.strictEqual(B['ch2.skew1'], '1.15'); assert.strictEqual(B['ch2.skew100'], '0.12'); ok();
}

/* ch3: Stokes–Einstein from first principles */
{
  const kB = 1.380649e-23, T = 293.15, eta = 2.414e-5 * Math.pow(10, 247.8 / (T - 140)), a = 0.5e-6;
  close(eta, 1.002e-3, 0.01e-3, 'water viscosity at 20 C (tabulated 1.002 mPa s)'); ok();
  const Dm = kB * T / (6 * Math.PI * eta * a);
  close(M.stokesEinstein(a, 20), Dm, 1e-20, 'D'); close(Dm * 1e12, 0.43, 0.01, 'D bead µm²/s'); ok();
  assert.strictEqual(B['ch3.Db'], '0.43'); assert.strictEqual(B['ch3.rms1'], '0.93'); assert.strictEqual(B['ch3.t10'], '117');
  assert.strictEqual(B['ch3.t1mm'], '13.5'); assert.strictEqual(B['ch3.t1cm'], '3.7'); assert.strictEqual(B['ch3.Db37'], '0.66');
  assert.strictEqual(B['ch3.Dm'], '429'); assert.strictEqual(B['ch3.m10'], '0.12'); assert.strictEqual(B['ch3.m1cm'], '1.3'); ok();
  // the slider's minimum radius at the default 20 °C is exactly the prose's "molecule"
  close(M.stokesEinstein(0.0005e-6, 20) * 1e12, 428.7, 0.1, 'molecule D at slider minimum'); ok();
  // cloud: measured per-axis MSD tracks 2Dt
  const C = M.makeCloud(3000, 9); for (let i = 0; i < 200; i++) M.stepCloud(C, 0.43, 0.5); close(M.cloudMsd(C) / (2 * 0.43 * C.t), 1, 0.06, 'cloud msd'); ok();
  close(M.latticeD(1, 0.5), 1, 1e-12, 'lattice D = a²/2τ'); ok();
}

/* ch4: GBM closed forms against Monte Carlo */
{
  const g = M.gbm(0.07, 0.2, 10);
  const paths = M.gbmPaths(0.07, 0.2, 10, 4000, 50, 5);
  const ends = paths.map(p => p[p.length - 1]).sort((x, y) => x - y);
  close(ends[2000] / g.median, 1, 0.05, 'GBM median'); close(ends.filter(v => v < 100).length / 4000, g.pLoss, 0.025, 'GBM loss'); ok();
  close(M.gbm(0.07, 0.2, 16).pLoss, 0.158655, 1e-4, 'loss at T* = Phi(-1)'); ok();
  assert.strictEqual(B['ch4.loss1'], '40%'); assert.strictEqual(B['ch4.loss10'], '21%'); assert.strictEqual(B['ch4.tStar'], '16');
  assert.strictEqual(B['ch4.lossStar'], '16%'); assert.strictEqual(B['ch4.med10'], '165'); assert.strictEqual(B['ch4.mean10'], '201');
  assert.strictEqual(B['ch4.med10s40'], '90'); assert.strictEqual(B['ch4.ann'], '20.3%'); assert.strictEqual(B['ch4.daily'], '1.28%');
  assert.strictEqual(B['ch4.perYear'], '252'); ok();
}

/* ch5: data extract consistency */
{
  assert.strictEqual(D.n, 14063); assert.strictEqual(D.from, '1971-02-05'); assert.strictEqual(D.to, '2026-11-16');
  assert.strictEqual(D.eras.all.kurt, 12.33); // same series and cut as a-fair-price-for-a-bet (RETURNS.kurtosis 12.33)
  for (const q of [1, 5, 21, 63]) assert.strictEqual(D.horizons[q].hist.reduce((s, x) => s + x, 0), D.horizons[q].n, 'hist sums ' + q);
  assert.strictEqual(D.horizons[5].n, Math.floor(D.n / 5)); ok();
  for (const e of Object.values(D.eras)) e.lo.forEach((lo, i) => assert(lo < 1.0 + 0.05 && e.hi[i] > 1 - 0.05 && lo < e.hi[i], 'band brackets 1')); ok();
  close(M.normalTail(4), 6.334e-5, 1e-7, 'P(|Z|>=4)'); ok();
  assert.strictEqual(B['ch5.n'], '14,063'); assert.strictEqual(B['ch5.k1'], '12.3'); assert.strictEqual(B['ch5.o4'], '96'); assert.strictEqual(B['ch5.e4'], '0.9');
  assert.strictEqual(B['ch5.k5'], '9.8'); assert.strictEqual(B['ch5.k21'], '7.0'); assert.strictEqual(B['ch5.k63'], '5.1');
  assert.strictEqual(B['ch5.r21'], '1.06'); assert.strictEqual(B['ch5.r63'], '1.12');
  assert.strictEqual(B['ch5.e1acf'], '0.30'); assert.strictEqual(B['ch5.e1vr21'], '2.37'); assert.strictEqual(B['ch5.e2vr21'], '0.98');
  assert.strictEqual(B['ch5.e3vr21'], '0.78'); assert.strictEqual(B['ch5.e3lo21'], '0.86'); assert.strictEqual(B['ch5.e3acf'], '-0.09');
  assert.strictEqual(B['ch5.allvr21'], '1.10'); assert.strictEqual(B['ch5.allhi21'], '1.08');
  assert.strictEqual(B['ch5.a1'], '3.4'); assert.strictEqual(B['ch5.a25'], '3.2'); assert.strictEqual(B['ch8.o4x'], '108'); ok();
  // the prose's verdicts
  assert.strictEqual(M.vrAt(D, 'e1', 21).verdict, 'above'); assert.strictEqual(M.vrAt(D, 'e2', 21).verdict, 'inside');
  assert.strictEqual(M.vrAt(D, 'e3', 21).verdict, 'below'); assert.strictEqual(M.vrAt(D, 'all', 21).verdict, 'above'); ok();
}

/* ch6: closed form against the linear solve at every reachable slider state (N step 10, sampled i and p) */
{
  for (let N = 10; N <= 200; N += 10) {
    for (const p of [0.4, 18 / 37, 0.5, 0.52, 0.6]) {
      const L = M.solvePolicy(N, p, M.STAKE.timid);
      for (const i of [1, Math.floor(N / 3), Math.floor(N / 2), N - 1]) {
        close(L.win(i), M.ruinTimid(i, N, p), 1e-8, `timid win N=${N} p=${p} i=${i}`);
        close(L.dur(i) / Math.max(1, M.durationTimid(i, N, p)), 1, 1e-7, `timid dur N=${N} p=${p} i=${i}`);
      }
    }
  }
  ok();
  // bold play against a direct recursion of Dubins–Savage on x = i/N for N a power of two times the start
  const p = 18 / 37, q = 1 - p;
  const bold = (x, d) => (d > 60 ? 0 : x >= 1 ? 1 : x <= 0 ? 0 : x <= 0.5 ? p * bold(2 * x, d + 1) : p + q * bold(2 * x - 1, d + 1));
  close(M.ruin(50, 100, p).bold, bold(0.5, 0), 1e-12, 'bold 50/100'); close(M.ruin(25, 100, p).bold, bold(0.25, 0), 1e-12, 'bold 25/100');
  close(M.ruin(20, 100, p).bold, bold(0.2, 0), 1e-9, 'bold 20/100'); ok();
  assert.strictEqual(B['ch6.t50'], '6.3%'); assert.strictEqual(B['ch6.b50'], '48.6%'); assert.strictEqual(B['ch6.n50'], '1,618');
  assert.strictEqual(B['ch6.t20'], '0.9%'); assert.strictEqual(B['ch6.b20'], '18.6%'); assert.strictEqual(B['ch6.nfair'], '2,500'); ok();
  // bold beats timid when p < 1/2, loses when p > 1/2
  assert(M.ruin(30, 100, 0.48).bold > M.ruin(30, 100, 0.48).timid); assert(M.ruin(30, 100, 0.52).bold < M.ruin(30, 100, 0.52).timid); ok();
}

/* ch7: DDPM schedule */
{
  let ab = 1; for (let t = 1; t <= 1000; t++) ab *= 1 - (1e-4 + (0.02 - 1e-4) * (t - 1) / 999);
  close(M.alphaBar(1000), ab, 1e-15, 'alphaBar(1000)'); ok();
  const m = M.mergeStep(); assert(M.forward(m - 1).twoPeaks && !M.forward(m).twoPeaks, 'merge step'); ok();
  // density integrates to 1
  { const f = M.forward(300); let s = 0; for (let x = -8; x <= 8; x += 0.001) s += f.dens(x) * 0.001; close(s, 1, 1e-4, 'density mass'); ok(); }
  assert.strictEqual(B['ch7.merge'], '395'); assert.strictEqual(B['ch7.sig1000'], '0.0064'); assert.strictEqual(B['ch8.m1'], '5.8%'); ok();
}

/* language hygiene: no CJK in code or English copy; no advice wording */
{
  const cjk = /[一-鿿]/;
  for (const f of ['models.js', 'app.js', 'content.en.md', 'copy.en.js', 'data.js']) assert(!cjk.test(fs.readFileSync(path.join(dir, f), 'utf8')), 'CJK in ' + f);
  const zh = fs.readFileSync(path.join(dir, 'content.zh.md'), 'utf8'), en = fs.readFileSync(path.join(dir, 'content.en.md'), 'utf8');
  for (const w of ['建议买', '应该买', '推荐买入']) assert(!zh.includes(w), 'advice wording ' + w);
  for (const w of ['you should buy', 'we recommend buying']) assert(!en.toLowerCase().includes(w), 'advice wording ' + w); ok();
}

console.log(`random-walks tests/models.cjs: ${n} groups passed`);
