'use strict';
// Risk & return (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const Z = STRINGS.zh, E = STRINGS.en;

// ---- step 0: the two choices ----
const f0 = M.faces(M.DEFAULT.m, M.DEFAULT.s);
assert.deepEqual(f0.map(v => Math.round(v * 1e9) / 1e9), [-17, -9, -1, 7, 15, 23]); checks++;
ok(Z.s0e.includes('−17%、−9%、−1%、+7%、+15%、+23%') && E.s0e.includes('−17%, −9%, −1%, +7%, +15% and +23%'), 'faces quoted in s0e');
near(M.mean(f0), M.SAFE, 1e-12, 'B averages +3% like A');
const amt0 = f0.map(r => M.START * M.growth(r));
near(Math.min(...amt0), 83, 1e-9, 'worst $83'); near(Math.max(...amt0), 123, 1e-9, 'best $123');
ok(M.countWhere(amt0, v => v < 100) === 3, 'half of B’s faces hand back less than 100 (pickedB)');
ok(Z.pickB.includes('83 到 123') && E.pickB.includes('$83 to $123'), 'range quoted on the B button');

// ---- step 1: spread grows, the average does not move; MAD = 0.6 s ----
for (let s = 0; s <= 30; s += 2) {
  const f = M.faces(3, s);
  near(M.mean(f), 3, 1e-12, 'average fixed at 3');
  near(M.mad(f), 0.6 * s, 1e-12, 'MAD = 0.6 s');
  near(f[5] - 3, s, 1e-12, 'best face = 3 + s'); near(3 - f[0], s, 1e-12, 'worst face = 3 − s');
}
ok(M.faces(3, 0).every(v => v === 3), 'swing 0 turns B into A');
ok(Z.s1readout.includes('0.6 倍') && E.s1readout.includes('0.6 ×'), 'readout quotes 0.6');

// ---- step 2: running averages (five fixed seeds) ----
const seqs = M.SEEDS.map(sd => M.rolls(100, sd));
seqs.forEach((seq, i) => {
  const run = M.runningMean(3, 20, seq), f = M.faces(3, 20);
  ok(Math.abs(run[99] - 3) <= 2.5, `seed set ${i + 1}: ends within 2.5 points of +3% (${run[99]})`);
  const early = Math.max(...run.slice(0, 10).map(v => Math.abs(v - 3))), late = Math.max(...run.slice(50).map(v => Math.abs(v - 3)));
  ok(early > late, 'line jumps early, hugs late');
  const last = seq.slice(80).map(k => f[k]);
  ok(Math.min(...last) === -17 && Math.max(...last) === 23, 'single results still span −17..+23 at the end');
  ok(seq.every(k => k >= 0 && k <= 5), 'faces valid');
  const run2 = M.runningMean(3, 20, M.rolls(100, M.SEEDS[i])); ok(run2[99] === run[99], 'seeded: same on every load');
});
for (let i = 0; i < seqs.length; i++) for (let j = i + 1; j < seqs.length; j++) ok(seqs[i].slice(0, 10).join() !== seqs[j].slice(0, 10).join(), 'first ten rolls differ between sets');
ok(Z.s2hint.includes('2.5') && E.s2hint.includes('2.5'), 'hint quotes the 2.5-point band');

// ---- step 3: buyers ----
ok(M.BUYERS.length === 100 && M.BUYERS[0] === 0.005 && M.BUYERS[99] === 0.5, 'ratios run from 0.005 to 0.5');
ok(Z.s3e.includes('0.005 到 0.5') && E.s3e.includes('0.005 to 0.5'), 'ratio range quoted');
for (let s = 2; s <= 30; s += 2) {
  ok(M.willing(3, s) === 0, 'no premium, no takers when there is a swing');
  near(M.premiumFor(50, s), 0.25 * s, 1e-12, 'half needs 0.25 s'); near(M.premiumFor(90, s), 0.45 * s, 1e-12, '90 needs 0.45 s');
  let prev = -1;
  for (let m = 3; m <= 12; m += 0.5) { const n = M.willing(m, s); ok(n >= prev, 'more promise, more takers'); prev = n; if (m - 3 >= M.premiumFor(50, s)) ok(n >= 50, 'premium line ⇒ ≥ 50'); }
  for (let m = 3.5; m <= 12; m += 0.5) ok(M.willing(m, s) <= M.willing(m, s - 2), 'wider swing, fewer takers');
}
ok(M.willing(3, 0) === 100, 'no swing: everyone happy at no premium');
ok(M.willing(8, 20) === 50, 'step 4 setting persuades exactly half (s4e)');
ok(M.premiumFor(90, 30) <= 15 && 12 - 3 <= 15, 'c3b y-axis (0..15) holds every point');

// ---- step 4: exact distribution vs brute force; promised = mean; probabilities fall but stay > 0 ----
const f4 = M.faces(8, 20);
assert.deepEqual(f4.map(v => Math.round(v * 1e9) / 1e9), [-12, -4, 4, 12, 20, 28]); checks++;
ok(Z.s4e.includes('−12%、−4%、+4%、+12%、+20%、+28%') && E.s4e.includes('−12%, −4%, +4%, +12%, +20%, +28%'), 'faces quoted in s4e');
for (const T of [1, 2, 3, 4]) {
  const all = []; (function rec(d, w) { if (d === T) { all.push(w); return; } f4.forEach(r => rec(d + 1, w * M.growth(r))); })(0, 100);
  const st = M.endStats(8, 20, T), safe = 100 * Math.pow(1.03, T);
  near(st.pBelowSafe, all.filter(v => v < safe - 1e-9).length / all.length, 1e-12, 'exact P(behind) T=' + T);
  near(st.pLoss, all.filter(v => v < 100 - 1e-9).length / all.length, 1e-12, 'exact P(loss) T=' + T);
  near(st.ev, all.reduce((a, b) => a + b, 0) / all.length, 1e-9, 'exact mean T=' + T);
}
let prevB = 1, prevL = 1;
for (let T = 1; T <= 20; T++) {
  const st = M.endStats(8, 20, T), tot = M.endDist(8, 20, T).reduce((a, q) => a + q.p, 0);
  near(tot, 1, 1e-9, 'probabilities sum to 1');
  near(st.ev, st.promised, 1e-6 * st.promised, 'average outcome = promised +8% compounding');
  ok(st.median < st.promised, 'median below the promise T=' + T);
  ok(st.pBelowSafe < 0.5, 'most paths beat A T=' + T);
  ok(st.pBelowSafe <= prevB + 1e-12 && st.pLoss <= prevL + 1e-12, 'curves never rise T=' + T);
  ok(st.pBelowSafe > 0 && st.pLoss > 0, 'never reaches zero T=' + T);
  ok(100 * st.pBelowSafe <= 40 && 100 * st.pLoss <= 40, 'c4b y-axis (0..40%) holds the curves');
  prevB = st.pBelowSafe; prevL = st.pLoss;
}
ok(M.endStats(8, 20, 20).pBelowSafe < M.endStats(8, 20, 1).pBelowSafe, 'chance of trailing shrinks');
// simulated batches agree with the exact probabilities (binomial 4σ)
M.SEEDS.forEach(sd => {
  const P = M.paths(8, 20, 20, 200, 1000 + sd);
  for (const T of [1, 5, 10, 20]) { const p = M.endStats(8, 20, T).pBelowSafe, c = P.filter(r => r[T] < 100 * Math.pow(1.03, T) - 1e-9).length; ok(Math.abs(c - 200 * p) <= 4 * Math.sqrt(200 * p * (1 - p)), `sim vs exact seed ${sd} T=${T}`); }
});

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['rowA', 'rowB']);
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of Object.keys(STRINGS[l])) ok(!/左图|右图|left chart|right chart|chart on the (left|right)/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(picked[AB]|c3bHalf|c3bMost|s2progress)'/g)) ok(Z[m[1]] !== undefined, 'indirect key ' + m[1]);
for (const id of ['pickA', 'pickB', 'roll0', 's1', 'play2', 'seed2', 's3', 'm3', 't4', 'seed4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../investment/basics/risk-return/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS risk-return core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · P(behind A) at 10 y = ${(100 * M.endStats(8, 20, 10).pBelowSafe).toFixed(1)}%`);
