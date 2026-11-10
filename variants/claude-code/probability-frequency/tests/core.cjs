'use strict';
// Probability & frequency (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, text) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(text), `${l}.${key} quotes "${text}"`));
const pctR = v => Math.round(100 * v);

// ---- number formatting: trailing zeros are stripped only after a decimal point ----
const trim = eval(app.match(/const trim = ([^\n]+);/)[1]);
ok(trim('90') === '90' && trim('100') === '100' && trim('0.50') === '0.5' && trim('1.0') === '1' && trim('0.0') === '0', 'trim keeps integer zeros');

// ---- step 0: the wheel ----
const w4 = M.wheel(4); ok(w4.num === 1 && w4.den === 3 && w4.deg === 120 && Math.abs(w4.p - 1 / 3) < 1e-15, '4/12 = 1/3, 120°');
for (let k = 1; k <= 11; k++) { const w = M.wheel(k); ok(Math.abs(w.num / w.den - k / 12) < 1e-15 && w.deg === 30 * k, 'wheel ' + k); }
ok(M.DEFAULT_RED === 4 && html.includes('id="k0" data-step="0" type="range" min="1" max="11" step="1" value="4"'), 'default 4 red sectors');
// red ⇔ the pointer angle 360u lies inside the red sector [0°, 360p)
{ const u = M.draws(11, 5000); for (let k = 1; k <= 11; k++) { const p = k / 12; u.forEach(v => ok(M.isRed(v, p) === (360 * v < 30 * k), 'needle angle vs colour')); } }
// determinism and rough uniformity of the generator
{ const a = M.draws(7, 10), b = M.draws(7, 10); ok(a.every((v, i) => v === b[i]), 'seeded draws repeat'); const u = M.draws(404, 60000); let s = 0; u.forEach(v => { ok(v >= 0 && v < 1, 'u in [0,1)'); s += v; }); near(s / u.length, 0.5, 0.005, 'mean of u'); }

// ---- step 1: groups of ten can hit p exactly only when 10p is whole (6 of 12 red) ----
for (let k = 1; k <= 11; k++) ok(M.exactPossible(k, M.GROUP) === (k === 6), 'exact hit possible only for k = 6, k=' + k);

// ---- step 2: the funnel ----
let fLo = 1, fHi = 0;
for (let k = 1; k <= 11; k++) {
  const p = k / 12;
  for (const n of M.NSTOPS) if (n >= 30) { const c = M.funnelCoverage(n, p); fLo = Math.min(fLo, c); fHi = Math.max(fHi, c); }
  for (const n of [10, 40, 160, 640, 2500]) near(M.halfWidth(p, 4 * n) / M.halfWidth(p, n), 0.5, 1e-12, '×4 spins → half the funnel');
}
ok(pctR(fLo) === 94 && pctR(fHi) === 98, `funnel coverage ${fLo}..${fHi}`);
ok(STRINGS.zh.s2e.includes('94%～98%') && STRINGS.en.s2e.includes('between 94% and 98%'), 's2e quotes the funnel range');
both('boundary', '94%'); both('boundary', '98%');
ok(M.NSTOPS.length === 17 && M.NSTOPS[0] === 1 && M.NSTOPS[16] === M.PATH_N && html.includes('id="n2" data-step="2" type="range" min="0" max="16"'), 'n slider spans 1..10000');
// one spin gives frequency 0 or 1; running counts are cumulative
{ const r = M.runningReds(M.draws(101, M.PATH_N), 1 / 3); ok(r[0] === 0 || r[0] === 1, 'first frequency 0 or 1'); for (let i = 1; i < r.length; i++) ok(r[i] - r[i - 1] === 0 || r[i] - r[i - 1] === 1, 'cumulative'); }

// ---- step 3: many groups ----
let lo20 = 1, hi20 = 0, minBig = 1, rLo = 9, rHi = 0;
for (let k = 1; k <= 11; k++) {
  const p = k / 12, S = M.STEP3_N.map((n, i) => M.groupStats(n, p, 303 + i));
  S.forEach(s => {
    near(s.exact.reduce((a, b) => a + b, 0), 1, 1e-9, 'exact bins sum to 1');
    near(s.sim.reduce((a, b) => a + b, 0), 1, 1e-9, 'sim bins sum to 1');
    ok(s.inside === Math.round(s.insideShare * M.STEP3_GROUPS), 'inside count');
    // the brute-force exact share agrees with the binned one
    let e = 0; for (let r = 0; r <= s.n; r++) if (Math.abs(r / s.n - p) <= M.BAND + 1e-12) e += M.binomPmf(s.n, r, p); near(e, s.exactShare, 1e-12, 'exact share');
  });
  lo20 = Math.min(lo20, S[0].exactShare); hi20 = Math.max(hi20, S[0].exactShare);
  minBig = Math.min(minBig, S[3].exactShare, S[4].exactShare);
  for (let i = 1; i < S.length; i++) { const r = S[i].width / S[i - 1].width; rLo = Math.min(rLo, r); rHi = Math.max(rHi, r); near(S[i].theoryWidth / S[i - 1].theoryWidth, 0.5, 1e-12, 'theory width halves'); }
}
ok((100 * lo20).toFixed(1) === '34.7' && (100 * hi20).toFixed(1) === '59.5', `n=20 band share ${lo20}..${hi20}`);
ok(minBig >= 0.999, 'n ≥ 1280: ≥ 99.9% within ±0.05 for every wheel: ' + minBig);
ok(rLo >= 0.405 && rLo < 0.415 && rHi > 0.605 && rHi <= 0.615, `simulated width ratio ${rLo}..${rHi}`);
both('s3hint', '34.7%'); both('s3hint', '59.5%'); both('s3hint', '99.9%'); both('s3hint', '1280'); both('s3hint', '0.41'); both('s3hint', '0.61'); both('s3hint', '0.5');
ok(M.STEP3_N.every((n, i) => !i || n === 4 * M.STEP3_N[i - 1]), 'group sizes ×4');
// bins never alias: for n ≥ 80 every interior bin holds n/80 possible frequencies
for (const n of M.STEP3_N.slice(1)) { const cnt = new Array(81).fill(0); for (let r = 0; r <= n; r++) cnt[M.binOf(r, n)]++; for (let j = 1; j < 80; j++) ok(cnt[j] === n / 80, `bin ${j} n=${n}`); }

// ---- step 4: streaks ----
{
  // brute-force check of the streak table on a short sequence
  const u = M.draws(5, 3000), p = 0.4, T = M.streakTable(u, p);
  for (let k = 0; k <= M.STREAK_MAX; k++) {
    let c = 0, r = 0;
    for (let i = k; i < u.length; i++) { let all = true; for (let j = 1; j <= k; j++) if (!(u[i - j] < p)) all = false; if (all) { c++; if (u[i] < p) r++; } }
    ok(T[k].cases === c && T[k].nextRed === r, 'streak table k=' + k);
  }
  // on the page's sequences, the after-streak frequency sits inside the ±2σ whisker in most rows
  let inRows = 0, rows = 0;
  for (let seq = 0; seq < 5; seq++) for (let k = 1; k <= 11; k++) {
    const p = k / 12, T2 = M.streakTable(M.draws(404 + seq, M.STREAK_N), p);
    ok(T2[0].cases === M.STREAK_N, 'k = 0 counts every spin');
    T2.forEach(r => { if (r.cases >= 20) { rows++; if (Math.abs(r.freq - p) <= 2 * Math.sqrt(p * (1 - p) / r.cases)) inRows++; } });
  }
  ok(inRows / rows > 0.9, `streak rows inside whisker ${inRows}/${rows}`);
  ok(M.STREAK_N === 60000, '60000 spins'); both('newSeq', '60000');
}

// ---- step 5: the two gaps ----
{
  const p = 1 / 3, reds = M.runningReds(M.draws(101, M.PATH_N), p);
  for (const n of M.NSTOPS) {
    const g = M.gaps(reds, p, n);
    near(g.freqGap * n, g.countGap, 1e-9, 'frequency gap = count gap ÷ n');
    near(g.countBand / n, g.freqBand, 1e-12, 'bands differ by the factor n');
  }
  near(M.gaps(reds, p, 10000).countBand / M.gaps(reds, p, 100).countBand, 10, 1e-9, 'count band widens like √n');
}

// ---- step 6: estimating a hidden wheel ----
let wLo = 1, wHi = 0, w10 = 1;
for (const p of M.HIDDEN) {
  ok(Math.abs(p * 12 - Math.round(p * 12)) > 1e-6, 'hidden share is not a whole number of twelfths');
  for (let n = 100; n <= 5000; n += 10) { const c = M.waldCoverage(n, p); wLo = Math.min(wLo, c); wHi = Math.max(wHi, c); }
  w10 = Math.min(w10, M.waldCoverage(10, p));
}
ok(pctR(wLo) === 93 && pctR(wHi) === 96 && pctR(w10) === 84, `wald coverage ${wLo}..${wHi}, n=10 min ${w10}`);
ok(STRINGS.zh.s6e.includes('93%～96%') && STRINGS.en.s6e.includes('93%–96%'), 's6e quotes 93–96%'); both('s6e', '84%');
{ const e = M.estimate(37, 100); near(e.f, 0.37, 1e-12, 'estimate'); near(e.h, 2 * Math.sqrt(0.37 * 0.63 / 100), 1e-12, 'range half-width'); }
ok(M.HIDDEN.length === 5 && STRINGS.zh.s6e.includes('5 个转盘') && STRINGS.en.s6e.includes('five spinners'), 'five hidden wheels');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(STRINGS[l].foot.includes(l === 'zh' ? '概率与频率 · 转得越多，越贴近概率' : 'Probability & Frequency · The More Spins, the Closer to the Probability'), 'footer names the original'); }
// no "left/right chart" wording: charts stack on narrow screens
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + l + '.' + k);

// ---- every key referenced in HTML/app exists; controls exist ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['k0', 'spin0', 'clear0', 'group1', 'many1', 'clear1', 'n2', 'play2', 'new2', 'n3', 'k4', 'new4', 'n5', 'play5', 'b10', 'b100', 'b1000', 'reveal6', 'next6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/basics/probability-frequency/index.html')) && html.includes('href="../../../probability/basics/probability-frequency/"'), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(html.includes('content="junior"') && html.includes('content="probability"'), 'stage and category');

console.log(`PASS probability-frequency core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · funnel ${pctR(fLo)}–${pctR(fHi)}% · wald ${pctR(wLo)}–${pctR(wHi)}%`);
