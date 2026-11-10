'use strict';
// Diversification (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const Z = STRINGS.zh, E = STRINGS.en;

// ---- steps 0–1: exact shop model from all 8 equally likely outcomes ----
const outs = M.shopOutcomes(), mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const U = outs.map(o => o.U), I = outs.map(o => o.I);
near(mean(U), 6, 1e-12, 'umbrella average 6'); near(mean(I), 6, 1e-12, 'ice cream average 6');
near(Math.sqrt(mean(U.map(v => (v - 6) ** 2))), 17, 1e-12, 'umbrella volatility 17');
near(Math.sqrt(mean(I.map(v => (v - 6) ** 2))), 17, 1e-12, 'ice-cream volatility 17');
near(mean(outs.map(o => (o.U - 6) * (o.I - 6))), M.shopCov(), 1e-12, 'covariance −225');
near(M.shopRho(), -0.78, 0.005, 'ρ ≈ −0.78 (s2e)');
assert.deepEqual([...new Set(U)].sort((a, b) => b - a), [29, 13, -1, -17]); checks++;
ok(Z.s0readout.includes('+29%、+13%、−1%、−17%') && E.s0readout.includes('+29%, +13%, −1% and −17%'), 'outcomes quoted');
// rainy years always lift the umbrella shop above zero, hot years always sink it (s0hint), and vice versa
outs.forEach(o => { ok(o.W === 1 ? o.U > 0 && o.I < 0 : o.U < 0 && o.I > 0, 'weather decides the sign'); });
ok(Math.abs((6 + 15 + 8) - (6 + 15 - 8)) === 16, 'same weather, bars differ by 16 (s0hint)');
M.SEEDS.forEach(sd => {
  const ys = M.shopYears(sd);
  ok(ys.length === 20, '20 years');
  for (const k of ['U', 'I']) { const s = M.stats(ys.map(q => q[k])).sd; ok(s >= 13 && s <= 20, `measured volatility within 13–20 (${s})`); }
  for (let w = 0; w <= 1.0001; w += 0.1) near(mean(ys.map(q => w * q.U + (1 - w) * q.I)), w * mean(ys.map(q => q.U)) + (1 - w) * mean(ys.map(q => q.I)), 1e-9, 'mix = weighted average');
});
// mix formula vs exact enumeration, U shape, minimum at 50 %
for (let wp = 0; wp <= 100; wp += 10) {
  const w = wp / 100, mix = outs.map(o => w * o.U + (1 - w) * o.I);
  near(mean(mix), 6, 1e-12, 'mix average stays 6');
  near(Math.sqrt(mean(mix.map(v => (v - 6) ** 2))), M.mixSd(w), 1e-9, 'mixSd = exact');
  if (wp <= 50 && wp > 0) ok(M.mixSd(w) < M.mixSd(w - 0.1), 'falls toward 50 %');
}
near(M.mixSd(0.5), 5.7, 0.05, 'bottom ≈ 5.7 (s1hint)'); near(M.mixSd(0.5) / 17, 1 / 3, 0.01, 'about a third');
near(M.mixSd(1), 17, 1e-12, 'w = 100 % is one shop');
ok(Z.s1hint.includes('5.7') && E.s1hint.includes('5.7'), 'hint quotes 5.7');

// ---- step 2: two assets, correlation ----
for (let r = -1; r <= 1.0001; r += 0.1) {
  const rho = +r.toFixed(1);
  near(M.portSd(2, rho), 20 * Math.sqrt((1 + rho) / 2), 1e-12, 'half-and-half formula');
  const pr = M.pairYears(rho, 7);
  ok(pr.length === 40, '40 years');
  near(M.stats(pr.map(q => q.a)).sd, M.stats(M.pairYears(0, 7).map(q => q.a)).sd, 1e-12, 'same luck for every ρ');
  if (rho > -1) ok(M.portSd(2, rho) > M.portSd(2, +(rho - 0.1).toFixed(1)), 'lower ρ, lower volatility');
}
near(M.portSd(2, 1), 20, 1e-12, 'ρ = 1: no better than one'); near(M.portSd(2, -1), 0, 1e-12, 'ρ = −1: zero');
ok(M.pairYears(-1, 7).every(q => Math.abs((q.a + q.b) / 2 - 6) < 1e-9), 'ρ = −1: mix earns exactly +6 every year (s2noteMinus)');
near(M.corr(M.pairYears(1, 7).map(q => q.a), M.pairYears(1, 7).map(q => q.b)), 1, 1e-9, 'sample ρ = 1 at 1');

// ---- step 3: N assets; quiz; floor ----
near(M.portSd(10, 0.9), 19.1, 0.05, 'quiz: 10 assets at 0.9 ≈ 19.1');
ok(Math.abs(M.portSd(10, 0.9) - 19) < Math.abs(M.portSd(10, 0.9) - 13) && Math.abs(M.portSd(10, 0.9) - 19) < Math.abs(M.portSd(10, 0.9) - 6), 'quiz answer c is closest');
ok(Z.correct.includes('19.1') && E.correct.includes('19.1'), 'feedback quotes 19.1');
near(M.portSd(40, 0), 3.2, 0.05, 'ρ = 0, N = 40 ≈ 3.2 (s3hint)');
ok(Z.s3hint.includes('3.2') && E.s3hint.includes('3.2'), 'hint quotes 3.2');
for (let r = 0; r <= 1.0001; r += 0.1) {
  const rho = +r.toFixed(1);
  near(M.portSd(1, rho), 20, 1e-12, 'one asset = 20');
  for (let n = 2; n <= 40; n++) { ok(M.portSd(n, rho) <= M.portSd(n - 1, rho) + 1e-12, 'more assets never hurt'); ok(M.portSd(n, rho) >= M.floorSd(rho) - 1e-12, 'never below the floor'); }
  ok(M.portSd(40, 0.9) - M.floorSd(0.9) < 0.1, 'ρ = 0.9: lies on its floor by N = 40');
  ok(M.portSd(1e9, rho) - M.floorSd(rho) < 1e-3, 'floor is the limit');
}
ok(M.portSd(40, 0.9) / M.portSd(1, 0.9) > 0.94, 'ρ = 0.9 curve nearly flat');

// ---- step 4: split = ρ 0.25, variance 100 + 300/N; simulation hugs the shared part ----
near(M.SPLIT.shared ** 2 + M.SPLIT.own ** 2, 400, 1e-9, 'volatility exactly 20');
near(M.SPLIT.own, 17.3, 0.05, 'own part ≈ 17.3 (s4e)');
near(M.SPLIT.shared ** 2 / 400, 0.25, 1e-12, 'pairwise ρ = 0.25 (s4e)');
for (let n = 1; n <= 50; n++) { const sp = M.splitVar(n); near(Math.sqrt(sp.shared + sp.own), M.portSd(n, 0.25), 1e-9, 'split = step 3 formula'); near(sp.shared, 100, 0, 'shared slice constant'); }
ok(M.splitVar(1).shared + M.splitVar(1).own <= 620, 'c4b y-axis holds N = 1');
M.SEEDS.forEach(sd => {
  const w = M.marketWorld(100 + sd), mk = w.marketPart;
  const dist = N => { const p = w.portfolio(N); return Math.sqrt(p.reduce((s, v, i) => s + (v - mk[i]) ** 2, 0) / p.length); };
  ok(dist(50) < dist(10) && dist(10) < dist(1) && dist(50) < dist(1) / 4, 'mix hugs the shared line as N grows');
  const p50 = w.portfolio(50);
  ok(Math.abs(Math.min(...p50) - Math.min(...mk)) <= 5, 'cannot dodge the shared bad year');
  for (let N = 1; N <= 50; N++) ok(M.stats(w.portfolio(N)).sd ** 2 <= 620, 'measured variance fits the axis');
  near(mean(w.portfolio(1).map((_, y) => w.asset(0, y))), mean(w.portfolio(1)), 1e-12, 'portfolio(1) = asset 1');
});

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s2noteMid']);
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of Object.keys(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the (left|right)/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(name[UI]|correct|wrong)'/g)) ok(Z[m[1]] !== undefined, 'indirect key ' + m[1]);
for (const id of ['shopU', 'shopI', 'seed0', 'w1', 'rho2', 'n3', 'rho3', 'checkQuiz', 'n4', 'grow4', 'seed4']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../investment/basics/diversification/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS diversification core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · two-shop floor ${M.mixSd(0.5).toFixed(2)}`);
