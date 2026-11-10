'use strict';
// Compound-interest (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const grid = (lo, hi, st) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out; };
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };

// ---- step 0: simple vs compound, the three layers ----
ok(M.P0 === 1000, 'deposit 1000');
for (const l of ['zh', 'en']) ok(STRINGS[l].s0e.includes('1000'), 's0e states 1000');
const R0 = slider('r0'), N0 = slider('n0');
ok(R0.value === 0.07 && N0.value === 30, 's0hint defaults r = 7 %, n = 30');
for (const r of grid(R0.min, R0.max, R0.step)) for (let n = 0; n <= N0.max; n++) {
  const s = M.split(M.P0, r, n);
  near(s.principal + s.onPrincipal + s.onInterest, s.total, 1e-9, 'layers add up');
  near(s.principal + s.onPrincipal, s.simple, 1e-9, 'cyan layer = simple interest');
  ok(s.onInterest >= -1e-9, 'interest on interest ≥ 0');
  if (n >= 2) ok(s.onInterest > 0, 'compound beats simple from year 2');
}
{ const s = M.split(1000, 0.07, 30); near(s.total, 7612.255, 1e-3, '7 % 30 y'); near(s.onInterest / (s.total - 1000), 0.6826, 1e-3, '68 % of interest is interest on interest'); }
// s0hint: at n ≈ 5 the orange layer is still thin (under a fifth of the interest); 7 % → 14 % multiplies it several times
{ const s5 = M.split(1000, 0.07, 5); ok(s5.onInterest / (s5.total - 1000) < 0.2, 'thin at 5 years'); }
ok(M.split(1000, 0.14, 30).onInterest / M.split(1000, 0.07, 30).onInterest > 5, 'doubling the rate multiplies the orange layer several times');

// ---- step 1: doubling time, rule of 72 ----
for (const r of grid(0.01, 0.30, 0.005)) {
  const T = M.doubling(r);
  for (let j = 1; j <= 5; j++) near(M.compound(1, r, j * T), Math.pow(2, j), 1e-9, 'equal spacing of doublings');
  near(M.rule72Err(r), M.rule72(r) / T - 1, 1e-12, 'relative error definition');
}
near(M.rule72(0.08), 9, 1e-12, '8 % → 9 years by the rule'); near(M.doubling(0.08), 9.006, 1e-3, '8 % exact');
ok(M.rule72Err(0.01) > 0 && M.rule72Err(0.30) < 0, 'overstates at low rates, understates at high');
const band = M.rule72Band(0.02);
near(band.lo, 0.037, 1e-9, 'band lo'); near(band.hi, 0.122, 1e-9, 'band hi');
for (const r of grid(0.01, 0.30, 0.0005)) ok((Math.abs(M.rule72Err(r)) <= 0.02) === (r >= band.lo - 1e-9 && r <= band.hi + 1e-9), 'band is one interval');
// quiz: four times at 9 % ≈ two doublings ≈ 16 years
near(2 * M.rule72(0.09), 16, 1e-12, 'rule: 16 years'); near(Math.log(4) / Math.log(1.09), 16.09, 0.01, 'exact 16.09'); ok(Math.abs(Math.log(4) / Math.log(1.09) - 16) < Math.abs(Math.log(4) / Math.log(1.09) - 8), 'b is closest');

// ---- step 2: frequency ----
for (const r of grid(0.01, 0.20, 0.005)) {
  let prev = -1;
  for (const m of M.FREQS) { const e = M.ear(r, m); ok(e > prev - 1e-15, 'EAR rises with m'); ok(e <= Math.exp(r) - 1 + 1e-12, 'below the ceiling'); prev = e; }
  near(M.ear(r, 1), r, 1e-12, 'yearly EAR = r'); near(M.ear(r, Infinity), Math.exp(r) - 1, 1e-15, 'continuous ceiling');
  near(M.within(r, 12, 1), M.factor(r, 12), 1e-12, 'staircase reaches the factor at year end');
}
{ const d = (M.ear(0.08, 365) - M.ear(0.08, 12)) * 100; ok(d >= 0.01 && d < 0.1, `monthly → daily adds a few hundredths of a point (${d})`); }
ok(Math.exp(0.2) - 1 - 0.2 > 3 * (Math.exp(0.08) - 1 - 0.08), 'frequency matters more at 20 %');

// ---- step 3: discounting ----
for (const r of grid(0.005, 0.10, 0.005)) {
  let prevStep = Infinity, prevDrop = -1;
  for (let tt = 0; tt <= 40; tt++) {
    near(M.compound(M.pv(10000, r, tt), r, tt), 10000, 1e-8, 'round trip');
    const step = M.pv(10000, r, tt) - M.pv(10000, r, tt + 1); ok(step > 0 && step < prevStep, 'falls, by less each year'); prevStep = step;
    const drop = M.pvDrop(r, tt, 0.01); ok(drop >= prevDrop - 1e-15, 'one-point drop grows with t'); prevDrop = drop;
  }
}
near(M.pv(10000, 0.05, 20), 3768.9, 0.1, '20 years at 5 %');

// ---- step 4: three prizes ----
const face = id => M.OFFERS[id].reduce((s, [, c]) => s + c, 0);
ok(face('now') === 10000 && face('stream') === 15000 && face('later') === 25000, 'face values 10000/15000/25000');
ok(M.OFFERS.stream.length === 15 && M.OFFERS.stream.every(([y, c], i) => y === i + 1 && c === 1000) && M.OFFERS.later[0][0] === 20, 'offer timing');
for (const r of grid(0, 0.12, 0.001)) near(M.pvFlows(M.OFFERS.stream, r), M.annuityPV(1000, r, 15), 1e-8, 'annuity formula = sum');
const SW = M.offerSwitches();
assert.deepEqual(SW.map(s => [s.from, s.to]), [['later', 'stream'], ['stream', 'now']]); checks++;
near(SW[0].at, 0.0421, 1e-4, 'first switch ≈ 4.21 %'); near(SW[1].at, 0.0556, 1e-4, 'second switch ≈ 5.56 %');
for (const s of SW) near(M.pvFlows(M.OFFERS[s.from], s.at), M.pvFlows(M.OFFERS[s.to], s.at), 1e-6, 'equal at the switch');
ok(M.bestOffer(0) === 'later' && M.bestOffer(0.06) === 'now', 'r = 0 → later; 6 % → now');
// s4hint: the later prize falls fastest across the slider range (steepest line)
for (const r of grid(0, 0.118, 0.002)) {
  const sl = id => (M.pvFlows(M.OFFERS[id], r + 0.002) - M.pvFlows(M.OFFERS[id], r)) / 0.002;
  ok(sl('later') < sl('stream') && sl('stream') < sl('now') + 1e-9, 'orange falls fastest');
}

// ---- step 5: mortgage ----
const L5 = slider('L5'), r5 = slider('r5'), y5 = slider('y5');
ok(L5.value === 500000 && r5.value === 0.05 && y5.value === 30, 'defaults 500k, 5 %, 30 years');
for (const L of [100000, 500000, 1000000]) for (const r of grid(r5.min, r5.max, 0.0075)) for (const n of [5, 10, 15, 20, 25, 30]) {
  const s = M.schedule(L, r, n), i = r / 12;
  near(s.months[s.months.length - 1].bal, 0, 1e-5, 'paid off');
  near(s.months.reduce((a, m) => a + s.M / Math.pow(1 + i, m.k), 0), L, 1e-5 * L, 'PV of payments = loan');
  near(s.months.reduce((a, m) => a + m.interest, 0), s.totalInterest, 1e-5 * L, 'total interest');
  ok(s.halfBal > L / 2, 'halfway you still owe more than half');
  s.months.forEach(m => ok(m.bal >= L * (1 - m.k / (12 * n)) - 1e-6, 'balance at or above the straight line'));
  for (let k = 1; k < s.months.length; k++) ok(s.months[k].princ > s.months[k - 1].princ, 'principal part grows');
  ok(s.crossMonth >= 1 && s.months[s.crossMonth - 1].princ > s.months[s.crossMonth - 1].interest && (s.crossMonth === 1 || s.months[s.crossMonth - 2].princ <= s.months[s.crossMonth - 2].interest), 'cross month');
}
{
  const s = M.schedule(500000, 0.05, 30), s10 = M.schedule(500000, 0.05, 10), s1 = M.schedule(500000, 0.01, 30);
  ok(s.years[0].interest / (s.years[0].interest + s.years[0].princ) > 0.5, 'first year mostly interest');
  ok(s10.M > s.M && s10.totalInterest < s.totalInterest / 2, '10 years: bigger payment, much less interest');
  ok(Math.max(...s1.months.map(m => m.bal - 500000 * (1 - m.k / 360))) < 0.05 * 500000, '1 %: almost on the straight line');
  ok(s1.years[0].interest / (s1.years[0].interest + s1.years[0].princ) < 0.3, '1 %: orange nearly gone');
}
// loan payment = annuity formula backwards
near(M.payment(500000, 0.05, 30), 500000 / M.annuityPV(1, 0.05 / 12, 360), 1e-8, 'payment = L / annuity factor');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['f1', 'f2', 'f4', 'f12', 'f52', 'f365', 'fInf', 'offerNow', 'offerStream', 'offerLater']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['r0', 'n0', 'play0', 'r1', 'axLog', 'axLin', 'checkQuiz', 'r2', 'freqRow', 'r3', 't3', 'r4', 'L5', 'r5', 'y5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../investment/rates/compound-interest/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS compound-interest core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · rule-72 ±2% band ${(band.lo * 100).toFixed(1)}–${(band.hi * 100).toFixed(1)}%`);
