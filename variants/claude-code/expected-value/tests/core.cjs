'use strict';
// Expected-value (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, sub) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(sub), `${l}.${key} quotes ${sub}`); };

// ---- step 0: distributions, balance point = Σ p·x ----
for (const [k, d] of Object.entries(M.GAMES)) {
  near(M.total(d), 1, 1e-12, 'probabilities sum to 1 for ' + k);
  near(M.torque(d, M.mean(d)), 0, 1e-12, 'level at E for ' + k);
  for (let g = 0; g <= 12; g += 0.05) {
    const tq = M.torque(d, g), s = M.torqueSides(d, g);
    near(tq, M.mean(d) - g, 1e-12, 'net turning = E − g');
    near(s.right - s.left, tq, 1e-12, 'right − left = net');
    ok(Math.sign(tq) === Math.sign(M.mean(d) - g) || Math.abs(tq) < 1e-12, 'tilt direction');
  }
}
near(M.mean(M.GAMES.die), 3.5, 1e-12, 'die E = 3.5');
near(M.mean(M.GAMES.six), 2, 1e-12, 'six-for-12 E = 2');
near(M.mean(M.GAMES.max2), 161 / 36, 1e-12, 'max of two dice E = 161/36');
ok(M.mean(M.GAMES.max2) > 3.5, 'max2 balance point right of 3.5 (s0hint)');
ok(M.GAMES.six[0].x === 0 && M.GAMES.six[0].p > 0.8, 'six game: most weight on 0');
both('s0hint', '2'); both('s0hint', '3.5');
// the balance point is reachable on the canvas (0..12) for every game
for (const d of Object.values(M.GAMES)) ok(M.mean(d) >= 0 && M.mean(d) <= 12, 'E inside the drawn axis');

// ---- step 1: law of large numbers band ----
near(M.sd(M.GAMES.die), Math.sqrt(35 / 12), 1e-12, 'die σ');
for (const [k, d] of Object.entries(M.GAMES)) {
  // "about 95% of replays stay inside E ± 2σ/√n" — pinned at n = 1000 with 2000 seeded replays
  const cov = M.coverage(d, 1000, 2000, 3);
  ok(cov > 0.93 && cov < 0.975, `coverage at n = 1000 for ${k}: ${cov}`);
  near(M.band(d, 100) / M.band(d, 1000), Math.sqrt(10), 1e-12, 'band shrinks by √10 per decade');
  // the running average does close in: replay 20 seeds to n = 10000 — all within 4σ/√n
  for (let s = 1; s <= 20; s++) { const st = M.play(d, 10000, M.rng(s)); ok(Math.abs(st.sum / st.n - M.mean(d)) < 2 * M.band(d, 10000), 'n=10000 close to E'); ok(st.avg.length === 10000, 'avg trace length'); }
}
both('s1hint', '3.16'); both('s1e', '95%');
near(Math.sqrt(10), 3.16, 0.005, '√10 ≈ 3.16');

// ---- step 2: fair price, house edge ----
const R = M.fairness(M.TICKETS.roulette.dist, 10);
near(R.E, 360 / 37, 1e-12, 'roulette E'); near(R.edge, 1 / 37, 1e-12, 'roulette edge 1/37');
near(R.net, -0.27, 0.001, 'roulette net −0.27 per play (s2hint)'); near(100 * R.edge, 2.7, 0.01, 'edge 2.7%');
both('s2hint', '2.7%');
const S = M.fairness(M.SCRATCH, 10);
near(M.total(M.SCRATCH), 1, 1e-12, 'scratch probabilities');
near(S.E, 4, 1e-12, 'scratch E = 4');
S.contributions.filter(q => q.x > 0).forEach(q => near(q.c, 1, 1e-12, 'each scratch prize contributes ¥1'));
const jackpot1000 = 1 - Math.pow(1 - 0.00001, 1000);
ok(jackpot1000 > 0.009 && jackpot1000 < 0.011, 'jackpot in 1000 cards ≈ 1%');
both('s2hint', '1%');
for (let c = 0; c <= 30; c += 0.5) { const f = M.fairness(M.GAMES.die, c); near(f.net, 3.5 - c, 1e-12, 'net = E − c'); }
// simulated paths: mean end ≈ 1000·(E − c) over many players
{ const r = M.rng(77); let acc = 0; for (let i = 0; i < 400; i++) acc += M.netPath(M.TICKETS.roulette.dist, 10, 1000, r)[1000]; near(acc / 400, 1000 * R.net, 40, 'roulette paths average to the dashes'); }
// default prices on the slider grid
for (const T of Object.values(M.TICKETS)) ok(T.price >= 0 && T.price <= 30 && (T.price * 2) % 1 === 0, 'default price on slider');

// ---- step 3: linearity ----
for (const mode of ['indep', 'same', 'mirror']) for (let n = 1; n <= 5; n++) {
  const d = M.sumDist(n, mode);
  near(M.total(d), 1, 1e-12, 'sum dist total'); near(M.mean(d), 3.5 * n, 1e-12, `E = 3.5n (${mode}, n=${n})`);
  ok(Math.min(...d.map(o => o.x)) >= n && Math.max(...d.map(o => o.x)) <= 6 * n && 6 * n <= 31, 'support inside axis');
}
const sd1 = M.sd(M.GAMES.die);
for (let n = 1; n <= 5; n++) {
  near(M.sd(M.sumDist(n, 'indep')), sd1 * Math.sqrt(n), 1e-9, 'σ√n'); near(M.sd(M.sumDist(n, 'same')), sd1 * n, 1e-9, 'σn');
  near(M.sd(M.sumDist(n, 'mirror')), n % 2 ? sd1 : 0, 1e-9, 'mirror spread');
}
near(sd1, 1.708, 0.0005, 'σ ≈ 1.708 (s3readout)'); both('s3readout', '1.708');
ok(M.sumDist(4, 'same').length === 6 && M.sumDist(4, 'mirror').length === 1 && M.sumDist(4, 'indep').length === 21, 'n = 4 shapes: six bars, one bar, bell');
near(M.mean(M.sumDist(4, 'indep')), 14, 1e-12, 'triangle at 14'); both('s3hint', '14');

// ---- step 4: insurance ----
const NS = [100, 300, 1000, 3000, 10000, 30000, 100000];
for (let pm = 5; pm <= 50; pm += 5) for (let ld = 0; ld <= 100; ld += 10) for (const N of NS) {
  const p = pm / 1000, lo = ld / 100, r = M.insurance(p, lo, N);
  near(r.pL, p * 200000, 1e-9, 'expected loss'); near(r.premium, (1 + lo) * p * 200000, 1e-9, 'premium');
  near(r.sdAvg, 200000 * Math.sqrt(p * (1 - p) / N), 1e-9, 'σ/√N');
  ok(r.probLoss >= 0 && r.probLoss <= 1, 'probability');
  // the exact tail matches a direct sum for moderate N
  if (N <= 1000) { let s = 0; for (let k = Math.floor(r.premium * N / 200000) + 1; k <= N; k++) s += M.binomPmf(N, p, k); near(r.probLoss, s, 1e-9, 'tail sum'); }
  // the histogram holds essentially all the mass
  if (N === 100 || N === 100000) near(M.avgClaimDist(N, p).reduce((a, q) => a + q.p, 0), 1, 1e-9, 'avgClaimDist mass');
}
// loading 0: the insurer's chance of paying out more than it collects does not vanish; near one half at N = 100,000 (≈ 49%)
for (let pm = 5; pm <= 50; pm += 5) { const v = M.insurance(pm / 1000, 0, 100000).probLoss; ok(v > 0.48 && v < 0.5, 'loading 0 → about 49% at N=100000: ' + v); }
both('s4hint', '49%');
// default loading 30%: at N = 100,000 the insurer almost surely profits, for every p on the slider
for (let pm = 5; pm <= 50; pm += 5) ok(M.insurance(pm / 1000, 0.3, 100000).probLoss < 1e-10, 'default loading, N max: ~0');
// positive loading: N = 100,000 beats N = 1000
for (let ld = 10; ld <= 100; ld += 10) for (let pm = 5; pm <= 50; pm += 5) ok(M.insurance(pm / 1000, ld / 100, 100000).probLoss < M.insurance(pm / 1000, ld / 100, 1000).probLoss, 'pooling helps when loading > 0');
// binomial machinery
near(Math.exp(M.lgamma(11)), 3628800, 1e-3, 'lgamma(11) = ln 10!');
near(M.binomPmf(10, 0.5, 5), 252 / 1024, 1e-12, 'C(10,5)/2^10');

// ---- step 5: St Petersburg ----
for (let K = 1; K <= 40; K++) {
  let s = 0; for (let k = 1; k <= 400; k++) s += Math.pow(0.5, k) * Math.pow(2, Math.min(k, K));
  near(M.stPeteMean(K), s, 1e-9, 'E = K + 1 for K = ' + K);
}
near(M.stPeteMean(20), 21, 0, 'K = 20 → 21'); near(Math.pow(2, 20), 1048576, 0, 'cap about a million');
both('s5hint', '21'); both('s5hint', '4');
{ // shares: P(pay ≤ 4) = 3/4, and the simulated share agrees
  const r = M.rng(4); let small = 0, n = 20000; for (let i = 0; i < n; i++) if (M.stPetePlay(20, r).pay <= 4) small++;
  near(small / n, 0.75, 0.01, 'three quarters pay 2 or 4');
}
{ // the dotted guide log₂n + 2: median of 301 replays within ±0.5 at n = 100, 1000, 10000 (K = 40)
  for (const n of [100, 1000, 10000]) {
    const r = M.rng(9), avgs = [];
    for (let rep = 0; rep < 301; rep++) { let s = 0; for (let i = 0; i < n; i++) s += M.stPetePlay(40, r).pay; avgs.push(s / n); }
    avgs.sort((a, b) => a - b); near(avgs[150], Math.log2(n) + 2, 0.5, 'median running average ≈ log₂n + 2 at n=' + n);
    if (n === 10000) ok(avgs[150] < M.stPeteMean(20) - 4, 'at 10,000 games the typical average is far below 21');
  }
}
{ // K = 3: within a few hundred games the average sits near E = 4
  const r = M.rng(12); let s = 0; for (let i = 0; i < 400; i++) s += M.stPetePlay(3, r).pay; near(s / 400, 4, 0.5, 'K=3 settles near 4');
}

// ---- formatting helper used in app.js keeps integer zeros ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmtSrc = app.match(/const fmt = [^\n]+/)[0];
const fmt = new Function(fmtSrc.replace('const fmt =', 'return'))();
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(2.5, 2), '2.5'); assert.equal(fmt(3, 3), '3'); assert.equal(fmt(-0.0001, 2), '0'); assert.equal(fmt(100, 1), '100'); checks += 5;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['die', 'six', 'max2']) ok(STRINGS.zh['game_' + k] && html.includes(`id="game_${k}"`), 'game ' + k);
for (const id of ['g0', 'find0', 'play10', 'play100', 'play1000', 'reset1', 'c2', 'new2', 'tk_roulette', 'tk_dice', 'tk_scratch', 'n3', 'md_indep', 'md_same', 'md_mirror', 'p4', 'l4', 'n4', 'k5', 'play5a', 'play5b', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/basics/expected-value/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS expected-value core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
