'use strict';
// Probability distribution (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const fmt = eval(app.match(/const fmt = [^\n]+/)[0].replace(/^const fmt = /, '').replace(/;$/, ''));
const pct = (p, d = 1) => fmt(p * 100, d) + '%';
ok(fmt(90, 0) === '90' && fmt(100, 0) === '100' && fmt(1.74, 2) === '1.74' && fmt(7, 2) === '7' && fmt(-1, 1) === '−1', 'fmt trims only decimal zeros');
const total = d => d.ps.reduce((a, b) => a + b, 0);

// ---- step 0: two dice ----
const D = M.twoDice();
near(total(D), 1, 1e-12, 'probabilities sum to 1');
assert.deepEqual(D.xs, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); checks++;
assert.deepEqual(D.ps.map(p => Math.round(p * 36)), [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]); checks++;
// brute force over the 36 outcomes
{ const c = {}; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) c[a + b] = (c[a + b] || 0) + 1; D.xs.forEach((x, i) => near(D.ps[i], c[x] / 36, 1e-12, 'enumeration ' + x)); }
ok(pct(6 / 36) === '16.7%' && pct(1 / 36) === '2.8%', '16.7% and 2.8%');
// frequencies approach probabilities: the max gap shrinks from 100 to 10,000 rolls (simulated with the page's seed)
{ const r = M.rng(36), cnt = new Array(13).fill(0); let n = 0; const gap = () => Math.max(...D.xs.map((x, i) => Math.abs(cnt[x] / n - D.ps[i])));
  const roll = k => { for (let i = 0; i < k; i++) { cnt[M.rollDie(r) + M.rollDie(r)]++; n++; } };
  roll(100); const g100 = gap(); roll(9900); const g10k = gap(); ok(g10k < g100 && g10k < 0.015, `gap shrinks ${g100} → ${g10k}`);
  for (let i = 0; i < 1000; i++) { const v = M.rollDie(r); ok(v >= 1 && v <= 6 && Number.isInteger(v), 'die face'); } }

// ---- step 1: expectation as a balance point ----
const means = { dice2: 7, die1: 3.5, coins3: 1.5, parcels: 1.74 };
for (const [k, mu] of Object.entries(means)) {
  const d = M.PRESETS[k]();
  near(total(d), 1, 1e-12, 'sum 1 ' + k); near(M.mean(d), mu, 1e-12, 'mean ' + k);
  for (let c = d.xs[0]; c <= d.xs[d.xs.length - 1] + 1e-9; c += 0.05) { near(M.torque(d, c), M.mean(d) - c, 1e-12, 'torque = E − c'); }
  ok(M.torque(d, d.xs[0]) > 0 && M.torque(d, d.xs[d.xs.length - 1]) < 0, 'tips up at low pivot, down at high pivot');
}
assert.deepEqual(M.modes(M.parcels()), [1]); checks++;
assert.deepEqual(M.modes(M.twoDice()), [7]); checks++;
assert.deepEqual(M.modes(M.coins3()), [1, 2]); checks++;
ok(M.modes(M.oneDie()).length === 6, 'die is uniform');
// notes: dice2 symmetric (mean = mode); coins3 and die mean not attainable; parcels skewed
ok(!M.coins3().xs.includes(1.5) && !M.oneDie().xs.includes(3.5) && M.parcels().xs.includes(1) && !M.parcels().xs.includes(1.74), 'note cases');
// s1hint: pivot at 4 tips up, 12 tips down, 7 balanced; parcels balanced at 1.74 not at 1
ok(M.torque(D, 4) > 0 && M.torque(D, 12) < 0 && Math.abs(M.torque(D, 7)) < 1e-12, 'dice pivot');
ok(Math.abs(M.torque(M.parcels(), 1.74)) < 1e-12 && M.torque(M.parcels(), 1) > 0.5, 'parcels balance at 1.74');
// the slider grid (step 0.05) misses 1.74, so the level threshold (0.005) needs the jump button there
ok(Math.abs(M.torque(M.parcels(), 1.75)) > 0.005 && Math.abs(M.torque(M.parcels(), 1.7)) > 0.005, 'level only at the exact mean for parcels');
ok(/Math.abs\(tq\) < 0\.005/.test(app), 'level threshold in app');
ok(app.includes("choice.value === 'b'"), 'quiz answer b');

// ---- step 2: variance family ----
let prevV = -1;
for (let i = 0; i <= 20; i++) {
  const s = i / 20, d = M.spreadFamily(s), con = M.contributions(d);
  near(total(d), 1, 1e-12, 'sum 1'); near(M.mean(d), 5, 1e-12, 'mean stays 5');
  near(con.reduce((a, b) => a + b, 0), M.variance(d), 1e-12, 'contributions add to variance');
  ok(M.variance(d) > prevV, 'variance grows with spread'); prevV = M.variance(d);
  ok(Math.max(...d.ps) <= 0.8 && Math.max(...con) <= 1.4, 'fits the fixed axes');
  for (let j = 0; j < 9; j++) near(d.ps[j], d.ps[8 - j], 1e-12, 'symmetric');
}
// hint: at large spread the biggest contributions sit at x = 1 and 9
{ const d = M.spreadFamily(1), con = M.contributions(d); ok(con[0] === Math.max(...con) && con[8] === Math.max(...con), 'ends dominate at s = 1'); }
{ const d = M.spreadFamily(0), con = M.contributions(d); ok(con[0] < con[3], 'middle dominates at s = 0'); }

// ---- step 3: Y = aX + b ----
for (let a = -2; a <= 3; a += 0.5) for (let b = -10; b <= 10; b++) {
  const Y = M.linear(D, a, b);
  near(total(Y), 1, 1e-12, 'sum 1');
  near(M.mean(Y), a * 7 + b, 1e-9, `E(aX+b) a=${a} b=${b}`);
  near(M.variance(Y), a * a * M.variance(D), 1e-9, `D(aX+b) a=${a} b=${b}`);
  near(M.sd(Y), Math.abs(a) * M.sd(D), 1e-9, 'σ scales by |a|');
}
near(M.variance(D), 35 / 6, 1e-12, 'D(X) = 35/6 for two dice');
ok(M.linear(D, 0, 5).xs.length === 1 && Math.abs(M.variance(M.linear(D, 0, 5))) < 1e-12, 'a = 0 collapses to b');
// spacing becomes |a| (hint: a = 2 → neighbours 2 apart)
{ const Y = M.linear(D, 2, 5); for (let i = 1; i < Y.xs.length; i++) near(Y.xs[i] - Y.xs[i - 1], 2, 1e-9, 'spacing 2'); }
// formula string in the app
const formulaSrc = app.match(/function formulaY[\s\S]*?\n}\n/)[0];
const formulaY = eval('(' + formulaSrc.replace('function formulaY', 'function') + ')');
ok(formulaY(2, 5) === 'Y = 2X + 5' && formulaY(-1, 0) === 'Y = −X' && formulaY(0, -3) === 'Y = −3' && formulaY(0.5, -10) === 'Y = 0.5X − 10' && formulaY(1, 0) === 'Y = X', 'formula labels');

// ---- step 4: binomial ----
for (let n = 1; n <= 30; n++) for (let i = 1; i <= 19; i++) {
  const p = i / 20, d = M.binom(n, p);
  near(total(d), 1, 1e-10, 'sum 1');
  near(M.mean(d), n * p, 1e-9, `E = np n=${n} p=${p}`);
  near(M.variance(d), n * p * (1 - p), 1e-9, `D = np(1−p) n=${n} p=${p}`);
}
// hint: widest band at p = 0.5 for n = 10; σ grows like √n
{ const v = [...Array(19)].map((_, i) => M.variance(M.binom(10, (i + 1) / 20))); ok(v.indexOf(Math.max(...v)) === 9, 'max variance at p = 0.5'); }
near(M.sd(M.binom(40, 0.3)) / M.sd(M.binom(10, 0.3)), 2, 1e-9, 'σ ∝ √n');
// skew direction at small p: tail towards larger values (mode below mean... mean − mode ≥ 0 and right tail longer)
{ const d = M.binom(10, 0.05); ok(d.ps[0] === Math.max(...d.ps), 'p small: bunched at 0'); }
ok(html.includes('id="p4" data-step="4" type="range" min="0.05" max="0.95" step="0.05"'), 'p slider range');

// ---- step 5: normal approximation ----
ok(pct(M.tail(M.binom(100, 0.5), 60), 2) === '2.84%' && pct(M.tailNormal(100, 0.5, 60), 2) === '2.87%', 'k = 60: 2.84% vs 2.87%');
{ let worst = 0; for (let k = 0; k <= 10; k++) worst = Math.max(worst, Math.abs(M.tail(M.binom(10, 0.1), k) - M.tailNormal(10, 0.1, k)));
  ok(worst > 0.03, 'n = 10, p = 0.1: error over 3 points');
  ok(Math.abs(M.tail(M.binom(10, 0.1), 2) - M.tailNormal(10, 0.1, 2)) > 0.03, 'near k = 2 over 3 points');
  let good = 0; for (let k = 0; k <= 100; k++) good = Math.max(good, Math.abs(M.tail(M.binom(100, 0.5), k) - M.tailNormal(100, 0.5, k)));
  ok(good < 0.001 && good < worst / 10, 'n = 100, p = 0.5 much better'); }
// tail is monotone in k, and erf matches known values
for (let k = 1; k <= 100; k++) ok(M.tail(M.binom(100, 0.3), k) <= M.tail(M.binom(100, 0.3), k - 1) + 1e-15, 'tail decreasing');
near(M.normalCdf(1.96, 0, 1), 0.975, 2e-4, 'Φ(1.96)'); near(M.erf(0), 0, 1e-9, 'erf(0)');
// density integrates to 1 (the area idea)
{ let s = 0; for (let x = -8; x < 8; x += 0.001) s += M.normalPdf(x + 0.0005, 0, 1) * 0.001; near(s, 1, 1e-6, 'density area 1'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['thP', 'nav3']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '概率分布 · 随机性也有形状' : 'Probability Distributions · Randomness Has a Shape'), 'footer');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/上图|下图|上面的图|下面的图|左图|右图|upper chart|lower chart|top chart|bottom chart|left panel|right panel|left chart|right chart|on the left|on the right/i.test(v), 'no left/right figure references in ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].s1hint.includes('1.74') && STRINGS[l].s5hint.includes('2.84%') && STRINGS[l].s5hint.includes('2.87%'), 'hint numbers present');

// ---- keys and controls ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['preDice2', 'preDie1', 'preCoins3', 'preParcels']) ok(STRINGS.zh[k] && STRINGS.en[k], 'preset name ' + k);
for (const id of ['roll1', 'roll100', 'clear0', 'pre_dice2', 'pre_die1', 'pre_coins3', 'pre_parcels', 'c1', 'balance1', 'checkQuiz', 's2', 'a3', 'b3', 'n4', 'p4', 'n5', 'p5', 'k5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/basics/probability-distribution/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS probability-distribution core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
