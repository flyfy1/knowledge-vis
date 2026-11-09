'use strict';
// Mechanism design (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: first price with the rival's bid known ----
for (let v = 10; v <= 100; v++) for (let r = 0; r <= 100; r++) {
  ok(M.utility('first', v, v, r) === 0, 'bidding v in first price always pays 0');
  const best = M.bestReply('first', v, r);
  if (r < v - 1) { ok(best.bids[best.bids.length - 1] === r + 1 && best.u === v - r - 1 && (best.bids.length === 1 || v - r === 2), `best first-price bid = r + 1 (v=${v}, r=${r})`); }
  if (r >= v) ok(best.u === 0, 'no positive payoff once r ≥ v (s0bestNone)');
  for (let b = 0; b <= 100; b++) { // each extra dollar above r costs a dollar
    if (b > r && b < 100) ok(M.utility('first', v, b, r) - M.utility('first', v, b + 1, r) === 1, 'slope −1 above r');
    if (b < r) ok(M.utility('first', v, b, r) === 0, 'losing pays 0');
  }
}

// ---- step 1: first price against an unknown rival ----
for (let v = 10; v <= 100; v++) for (let k = 30; k <= 100; k += 5) {
  const beta = k / 100, opt = M.bestBid(v, beta);
  // the closed-form maximiser beats a fine grid search
  let gb = 0, gu = -Infinity; for (let i = 0; i <= 10000; i++) { const b = i / 100, u = M.expectedU(v, b, beta); if (u > gu) { gu = u; gb = b; } }
  near(opt.eu, gu, 1e-3, `best bid payoff v=${v} β=${beta}`); near(opt.b, gb, 0.02, `best bid location v=${v} β=${beta}`);
  near(opt.b, Math.min(v / 2, 100 * beta), 1e-12, 'best bid = min(v/2, 100β)');
  if (100 * beta >= v / 2) near(opt.b, v / 2, 1e-12, 'best bid stays at v/2 while 100β ≥ v/2 (s1hint)');
}
// "both bid half" is an equilibrium: against β = 0.5 the best reply is exactly v/2 for every v
for (let v = 1; v <= 100; v++) near(M.bestBid(v, 0.5).b / v, 0.5, 1e-12, 'best reply to β = 0.5 is β = 0.5');
// the simulation agrees with the formula (400 fixed rivals, the page's seed)
{
  const vals = M.rivalValues(400, 11); let worst = 0;
  for (const beta of [0.3, 0.5, 0.75, 1]) for (const v of [30, 70, 100]) for (let b = 0; b <= 100; b += 5) {
    const s = M.simulateFirst(v, b, beta, vals), e = M.expectedU(v, b, beta);
    const p = M.winProb(b, beta), se = Math.abs(v - b) * Math.sqrt(p * (1 - p) / 400);
    worst = Math.max(worst, se > 0 ? Math.abs(s.mean - e) / se : 0);
    near(s.trace[399], s.mean, 1e-9, 'trace ends at the mean');
  }
  ok(worst < 3.5, 'simulated mean payoff within 3.5 standard errors of the formula for 400 rivals: ' + worst.toFixed(2));
  const def = M.simulateFirst(70, 60, 0.5, vals); near(def.rate, M.winProb(60, 0.5), 0.06, 'default win rate ≈ 60%');
}

// ---- step 2: second price with the rival's bid known ----
for (let v = 10; v <= 100; v++) for (let r = 0; r <= 100; r++) {
  const ut = M.utility('second', v, v, r);
  for (let b = 0; b <= 100; b++) {
    const u = M.utility('second', v, b, r);
    ok(u <= ut + 1e-12, `truthful never worse (v=${v}, b=${b}, r=${r})`);
    // outcome differs from truthful only for r between min(b,v) and max(b,v) (the pink band, ends included)
    if (r < Math.min(b, v) || r > Math.max(b, v)) ok(u === ut, 'same result outside the band');
    if (b > r) ok(M.outcome('second', v, b, r).pay === r, 'winner pays r');
  }
}
// defaults and the quiz
near(M.utility('second', 70, 90, 80), -10, 0, 'default: overbidding to 90 buys a 70 item for 80');
near(M.utility('second', 70, 50, 60), 0, 0, 'quiz: bid 50 loses to 60'); near(M.utility('second', 70, 70, 60), 10, 0, 'quiz: bid 70 earns 10');
near(M.utility('second', 70, 50, 30), M.utility('second', 70, 70, 30), 0, 'quiz: 30 same'); near(M.utility('second', 70, 50, 85), M.utility('second', 70, 70, 85), 0, 'quiz: 85 same');

// ---- step 3: regret maps ----
for (let v = 10; v <= 100; v++) {
  const S = M.regretTable('second', v), F = M.regretTable('first', v);
  ok(S.minWorst === 0 && S.safest.length === 1 && S.safest[0] === v, `second price: only b = v has zero worst regret (v=${v})`);
  ok(F.minWorst > 0, 'first price: every row has positive worst regret');
  // "worst regret about v/2 near b = v/2", "the truthful row climbs to nearly v"
  ok(Math.abs(F.minWorst - (v / 2 - 1)) <= 0.5,  `first price min worst regret ≈ v/2 (v=${v}: ${F.minWorst})`);
  ok(F.safest.every(b => Math.abs(b - v / 2) <= 1.5), `first price safest bid near v/2 (v=${v}: ${F.safest})`);
  near(F.rows[v].worst, v - 1, 1e-12, 'first price truthful row worst regret = v − 1');
  ok(S.max <= 100, 'heat scale 0..100 covers second-price regret');
}

// ---- step 4: revenue equivalence ----
for (let n = 2; n <= 5; n++) {
  near(M.eSecond(n), 100 * (n - 1) / (n + 1), 1e-12, 'E[second-highest]');
  near(M.fpShade(n) * M.eHigh(n), M.eSecond(n), 1e-9, 'first-price equilibrium revenue = second-price revenue');
  const sd = M.revenueSD(n); ok(sd.first < sd.second, 'first price steadier (smaller SD)');
  for (let seed = 1; seed <= 5; seed++) {
    const D = M.simulateRevenue(n, 1000, seed), f = M.stats(D.map(q => q.first)), s = M.stats(D.map(q => q.second));
    ok(Math.abs(f.mean - M.eSecond(n)) < 1.6 && Math.abs(s.mean - M.eSecond(n)) < 2.4, `1000-auction averages near theory (n=${n}, seed=${seed}): ${f.mean.toFixed(2)}, ${s.mean.toFixed(2)}`);
    ok(f.sd < s.sd, 'simulated first-price spread is smaller');
    near(f.sd, sd.first, 1.5, 'simulated SD first ≈ theory'); near(s.sd, sd.second, 2, 'simulated SD second ≈ theory');
  }
  // a big run pins the theory itself
  const big = M.simulateRevenue(n, 200000, 9);
  near(M.stats(big.map(q => q.first)).mean, M.eSecond(n), 0.15, 'large-sample first-price revenue');
  near(M.stats(big.map(q => q.second)).mean, M.eSecond(n), 0.2, 'large-sample second-price revenue');
  if (n > 2) ok(M.eSecond(n) > M.eSecond(n - 1), 'more bidders, more revenue');
}

// ---- step 5: reserve price ----
let prevGain = Infinity;
for (let n = 2; n <= 5; n++) {
  let prevW = Infinity;
  for (let R = 0; R <= 100; R += 1) {
    const e = M.reserveExact(n, R), q = M.reserveNumeric(n, R);
    near(q.revenue, e.revenue, 2e-3, `revenue closed form vs integral n=${n} R=${R}`);
    near(q.welfare, e.welfare, 2e-3, `welfare closed form vs integral n=${n} R=${R}`);
    near(e.noSale, Math.pow(R / 100, n), 1e-12, 'no sale = (R/100)^n');
    ok(e.welfare < prevW + 1e-12, 'total value never rises with R'); prevW = e.welfare;
    const rev = R => M.reserveExact(n, R).revenue;
    if (R > 0 && R <= 50) ok(rev(R) > rev(R - 1), 'revenue rises up to 50'); if (R > 50) ok(rev(R) < rev(R - 1), 'revenue falls after 50');
  }
  for (const R of [0, 30, 50, 70]) {
    const s = M.reserveSim(n, R, 200000, 3), e = M.reserveExact(n, R);
    near(s.revenue, e.revenue, 0.25, `simulated revenue n=${n} R=${R}`); near(s.welfare, e.welfare, 0.25, 'simulated welfare'); near(s.noSale, e.noSale, 0.005, 'simulated no-sale');
  }
  const best = M.bestReserve(n);
  ok(best.R === 50, 'best reserve is 50 for n = ' + n);
  const gain = best.revenue - M.reserveExact(n, 0).revenue;
  ok(gain > 0 && gain < prevGain, 'reserve adds less as n grows'); prevGain = gain;
}
near(M.reserveExact(2, 50).revenue, 125 / 3, 1e-9, 'n=2, R=50: 41.67');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) ok(STRINGS[l].s5hint.includes('50') && STRINGS[l].s3hint.includes('v/2'), 'hints quote the tested values');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\$\('([A-Za-z0-9_]+)'\)/g)) ok(html.includes(`id="${m[1]}"`), 'element ' + m[1]);
ok(!html.includes('canvas-label-guard'), 'no label guard');
{ const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique: ' + ids.filter((x, i) => ids.indexOf(x) !== i)); }
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/applied/mechanism-design/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS mechanism-design core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
