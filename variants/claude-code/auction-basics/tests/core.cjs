'use strict';
// Auctions (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(+v.toFixed(6)); return out; };

// ---- step 0: first price with a known rival bid ----
for (const v of range(10, 100, 5)) for (const r of range(0, 100, 1)) {
  const pays = range(0, 100, 1).map(b => M.fpPayoff(v, b, r));
  range(0, 100, 1).forEach((b, i) => ok(pays[i] === (b > r ? v - b : 0), 'first-price payoff'));
  const best = Math.max(...pays);
  // best integer bid: just above r if r < v (payoff v − r − 1 on the 1-yuan grid), otherwise 0 by not winning
  if (r + 1 < v) ok(best === v - r - 1, 'best bid is just above r'); else ok(best === 0, 'no profitable winning bid');
}
ok(M.fpPayoff(60, 35, 35) === 0, 'tie goes to the rival');

// ---- step 1: expected payoff, optimum v/2, simulation within 1 yuan of the formula ----
let maxDev = 0;
for (const v of range(10, 100, 5)) {
  let bestB = 0, bestE = -Infinity;
  for (const b of range(0, 100, 0.5)) { const e = M.fpExpected(v, b); if (e > bestE + 1e-12) { bestE = e; bestB = b; } }
  near(bestB, v / 2, 0.5, 'argmax = v/2'); near(bestE, M.fpBestValue(v), 0.01, 'max = v²/400');
  ok(M.fpBest(v) === v / 2, 'fpBest');
  for (const b of range(0, 100, 1)) {
    const s = M.fpSimulated(v, b);
    maxDev = Math.max(maxDev, Math.abs(s.mean - M.fpExpected(v, b)));
    near(s.winRate, b / 100, 0.03, 'simulated win rate ≈ b/100');
  }
}
ok(maxDev < 1, 'simulated average within 1 yuan of the formula on every slider grid point (page claim): ' + maxDev);
ok(M.RIVALS.length === 4000 && M.RIVALS.every(r => r >= 0 && r < 100), '4000 rivals in [0, 100)');

// ---- step 2: second price, truth is dominant; loss sizes ----
for (const v of range(10, 90, 5)) for (const b of range(0, 100, 1)) {
  const c = M.spCompare(v, b, 0.5);
  ok(c.maxGain <= 1e-12, 'no rival bid makes deviating better');
  if (b !== v) { ok(c.maxLoss <= Math.abs(b - v) + 1e-9 && c.maxLoss >= Math.abs(b - v) - 0.5 - 1e-9, 'max shortfall approaches |b − v|'); ok(c.worse > 0, 'some rival bids make deviating worse'); }
  else ok(c.maxLoss === 0, 'truth vs truth');
  near(M.spExpectedLoss(v, b), (b - v) * (b - v) / 200, 1e-9, 'expected loss (b − v)²/200');
  // numerical check of the expected payoff against a fine Riemann sum over uniform r
  let s = 0; const N = 4000; for (let i = 0; i < N; i++) { const r = (i + 0.5) * 100 / N; s += M.spPayoff(v, b, r); }
  near(s / N, M.spExpected(v, b), 1e-3, 'spExpected integral');
}
// quiz: v = 60, bid 90 is worse exactly for rival bids in (60, 90)
for (const r of range(0, 100, 0.5)) {
  const d = M.spPayoff(60, 90, r) - M.spPayoff(60, 60, r);
  ok((d < 0) === (r >= 60 && r < 90 && r !== 60) || (r === 60 && d === 0), 'quiz region');
}
ok(M.spPayoff(60, 90, 75) < 0 && M.spPayoff(60, 60, 75) === 0, 'quiz example');

// ---- step 3: revenue equivalence and spread ratio ----
for (let n = 2; n <= 8; n++) {
  near(M.theoryRevenue(n), 100 * (n - 1) / (n + 1), 1e-12, 'theory revenue');
  const R = M.revenueRun(n, 60000, 9000 + n);
  const F = M.meanSd(R.map(q => q.first)), S = M.meanSd(R.map(q => q.second));
  near(F.m, M.theoryRevenue(n), 0.4, 'first-price mean'); near(S.m, M.theoryRevenue(n), 0.4, 'second-price mean');
  near(F.sd, M.sdFirst(n), 0.3, 'first-price sd'); near(S.sd, M.sdSecond(n), 0.3, 'second-price sd');
  const ratio = M.sdFirst(n) / M.sdSecond(n);
  near(ratio, Math.sqrt((n - 1) / (2 * n)), 1e-12, 'sd ratio √((n−1)/(2n))');
  ok(ratio < 0.71, 'sd ratio below 0.71');
  // equilibrium check (n = 2..8): against rivals bidding v(n−1)/n, best response of a value-v bidder is v(n−1)/n
  for (const v of [20, 50, 90]) {
    const f = M.eqBidFactor(n), U = b => (v - b) * Math.pow(Math.min(1, b / (100 * f)), n - 1);
    let bb = 0, be = -1; for (let b = 0; b <= 100; b += 0.05) { const u = U(b); if (u > be) { be = u; bb = b; } }
    near(bb, v * f, 0.06, 'equilibrium best response');
  }
}
ok(M.eqBidFactor(2) === 0.5, 'n = 2 gives v/2 (step 1)');

// ---- step 4: clocks ----
for (let set = 0; set < 50; set++) {
  const vals = M.clockValues(set), sorted = vals.slice().sort((a, b) => b - a);
  ok(vals.length === 5, 'five bidders');
  const e = M.english(vals, 100), d = M.dutch(vals, 0);
  ok(e.ended && e.price === sorted[1] && vals[e.winner] === sorted[0], 'English ends at the 2nd-highest value');
  near(d.price, 0.8 * sorted[0], 1e-9, 'Dutch ends at 0.8 × highest'); ok(vals[d.winner] === sorted[0], 'Dutch winner = highest');
  ok(!M.english(vals, 0).ended && M.english(vals, 0).active.length === 5, 'English starts with everyone in');
  ok(!M.dutch(vals, 100).ended, 'Dutch starts with nobody shouting');
  const mid = (sorted[1] + sorted[2]) / 2; ok(M.english(vals, mid).active.length === 2, 'English: two remain between 3rd and 2nd');
}

// ---- step 5: winner's curse ----
for (const n of [2, 6, 12]) for (const g of [5, 20, 30]) for (const s of [0, 10]) {
  const R = M.curseRun(n, g, s, 40000, 4242);
  const m = M.meanSd(R.map(a => a.profit)).m;
  near(m, M.curseTheory(n, g, s), 0.15 * g / 20 + 0.05, `curse mean n=${n} σ=${g} s=${s}`);
  R.slice(0, 200).forEach(a => { near(a.profit, M.TRUE_VALUE - a.pay, 1e-9, 'profit def'); ok(a.est[a.winner] === Math.max(...a.est), 'winner = max estimate'); });
}
for (let n = 2; n <= 12; n++) for (const g of [5, 10, 15, 20, 25, 30]) {
  ok(M.expectedMaxError(n, g) > 0, 'winner over-estimates on average');
  near(M.curseTheory(n, g, M.expectedMaxError(n, g)), 0, 1e-12, 'break-even shade');
  if (n > 2) ok(M.curseTheory(n, g, 0) < M.curseTheory(n - 1, g, 0), 'more bidders, worse curse');
}
// the page's "almost all profits left of zero" at the default setting (n = 6, σ = 20, s = 0)
{ const R = M.curseRun(6, 20, 0, 500); ok(R.filter(a => a.profit < 0).length / 500 > 0.95, 'default: >95% of first 500 auctions lose'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\['(sw-[a-z]+)', '([A-Za-z0-9]+)'\]/g)) ok(STRINGS.zh[m[2]] !== undefined, 'legend key ' + m[2]);
for (const k of ['s0win', 's0winLoss', 's0lose', 's0best', 's0bestNone', 's2under', 's2over', 's2truthWin', 's2truthLose', 'c4eng', 'c4dut', 'correct', 'wrong']) ok(app.includes(`'${k}'`) || k === 'correct' || k === 'wrong', 'used ' + k);
for (const id of ['v0', 'r0', 'b0', 'v1', 'b1', 'clear1', 'v2', 'b2', 'r2', 'checkQuiz', 'n3', 'one3', 'run3', 'clear3', 'eng4', 'dut4', 'play4', 'new4', 'p4', 'n5', 'g5', 'h5', 'one5', 'run5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
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
ok(fs.existsSync(path.join(dir, '../../../math/applied/auction-basics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS auction-basics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · step-1 max sim deviation ${maxDev.toFixed(3)}`);
