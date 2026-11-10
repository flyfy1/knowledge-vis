'use strict';
// pH scale (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (k, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][k].includes(s), `${l}.${k} quotes ${s}`));

// ---- step 0: pH counts the decimal place ----
for (let i = 0; i <= 140; i++) {
  const pH = i / 10, d = M.decimalOf(pH);
  near(Number(d.text), d.h, d.h * 0.06, 'decimal text ≈ [H⁺] at pH ' + pH); // two significant digits
  near(M.pHFromH(M.hFromPH(pH)), pH, 1e-12, 'pH round trip');
  const frac = d.text.split('.')[1] || '';
  const first = frac.search(/[1-9]/) + 1;
  ok((i === 0 ? d.place === 0 : first === d.place), 'first non-zero digit sits at place ' + d.place + ' for pH ' + pH);
  ok(d.place === (Number.isInteger(pH) ? pH : Math.ceil(pH)), 'integer pH n → place n, otherwise ceil(pH)');
  ok(!/\.\d*0$/.test(d.text) && !/\.$/.test(d.text), 'no trailing zeros after the decimal point');
  ok(M.classify(pH) === (pH < 7 ? 'acid' : pH > 7 ? 'base' : 'neutral'), 'classification at ' + pH);
}
assert.equal(M.decimalOf(3).text, '0.001'); assert.equal(M.decimalOf(2.2).text, '0.0063'); assert.equal(M.decimalOf(7).text, '0.0000001'); checks += 3;
const liq = id => M.LIQUIDS.find(l => l.id === id).pH;
assert.equal(M.decimalOf(liq('lemon')).text, '0.0063'); assert.equal(M.decimalOf(liq('water')).text, '0.0000001'); checks += 2;
both('s0e', '0.0063'); both('s0e', '0.0000001'); both('s0e', '10⁻³');
for (const l of M.LIQUIDS) ok(STRINGS.zh['liq_' + l.id] && STRINGS.en['liq_' + l.id], 'liquid name ' + l.id);
ok(M.LIQUIDS.every((l, i, a) => !i || a[i - 1].pH < l.pH), 'liquids sorted by pH');

// ---- step 1: one unit = ×10 ----
near(M.ratio(3, 5), 100, 1e-9, 'pH 3 vs 5 = 100×'); near(M.ratio(5, 3), 100, 1e-9, 'symmetric');
for (let a = 0; a <= 14; a += 0.5) for (let b = 0; b <= 14; b += 0.5) near(M.hFromPH(Math.min(a, b)) / M.hFromPH(Math.max(a, b)), M.ratio(a, b), M.ratio(a, b) * 1e-9, 'ratio = [H⁺] quotient');
// "by pH 6 (A = 3) B's bar is under 1 pixel": bar length = full × 10^−3, full ≤ 1000 px on every layout (page max width 920)
for (const W of [240, 288, 358, 600, 900]) { const full = W - 44; ok(full * M.hFromPH(6) / M.hFromPH(3) < 1, 'pH 6 bar < 1px at W=' + W); ok(full * M.hFromPH(5) / M.hFromPH(3) >= 1.9, 'pH 5 bar still visible at W=' + W); }

// ---- step 2: indicators ----
for (const pH of M.MYSTERY) {
  for (const ind of M.INDICATORS) ok(Math.abs(pH - ind.lo) >= 0.15 && Math.abs(pH - ind.hi) >= 0.15, `mystery ${pH} not on a boundary of ${ind.id}`);
  // every subset of indicators gives a window that contains the true pH
  for (let mask = 0; mask < 16; mask++) {
    const used = M.INDICATORS.filter((_, i) => mask & (1 << i));
    const [lo, hi] = M.combine(used.map(ind => M.indicatorInterval(ind, M.indicatorResult(ind, pH))));
    ok(lo <= pH && pH <= hi && lo < hi, `window ${lo}–${hi} contains ${pH}`);
    // s2hint: an indicator whose transition range lies outside the current window adds nothing
    for (const ind of M.INDICATORS) {
      if (used.includes(ind)) continue;
      const outside = ind.hi <= lo || ind.lo >= hi;
      const [lo2, hi2] = M.combine([[lo, hi], M.indicatorInterval(ind, M.indicatorResult(ind, pH))]);
      if (outside) ok(lo2 === lo && hi2 === hi, 'outside indicator adds nothing');
    }
  }
}
for (const ind of M.INDICATORS) { ok(ind.lo < ind.hi, 'range order'); ok(STRINGS.zh['ind_' + ind.id] && STRINGS.en['ind_' + ind.id], 'indicator name'); }
// colours change monotonically across each transition (no colour outside the range differs from the end colours)
for (const ind of M.INDICATORS) { assert.deepEqual(M.indicatorColor(ind, ind.lo - 0.5), ind.c[0]); assert.deepEqual(M.indicatorColor(ind, ind.hi + 0.5), ind.c[2]); checks += 2; }

// ---- step 3: dilution approaches 7 but never crosses ----
for (const kind of ['acid', 'base']) for (let k = 0; k <= M.DIL.kMax; k++) {
  const r = M.dilution(kind, k);
  ok(kind === 'acid' ? r.pH < 7 : r.pH > 7, `${kind} stays on its side of 7 at k=${k}`);
  if (k <= 4) near(r.pH, r.naive, 0.01, 'first four dilutions follow ±1');
  if (k >= 5) ok(Math.abs(r.pH - r.naive) > 0.2, 'from the 5th dilution the rule fails visibly');
  if (k >= 7) near(r.pH, 7, 0.01, 'creeps to 7');
  if (k > 0) ok(kind === 'acid' ? r.pH > M.dilution(kind, k - 1).pH : r.pH < M.dilution(kind, k - 1).pH, 'monotone towards 7');
  // [H⁺][OH⁻] = Kw and charge balance [H⁺] = c + [OH⁻] (acid)
  if (kind === 'acid') near(r.h, r.c + M.KW / r.h, r.h * 1e-12, 'charge balance');
}
near(M.dilution('acid', 0).pH, 2, 1e-6, 'start pH 2'); near(M.dilution('base', 0).pH, 12, 1e-6, 'start pH 12');
ok(M.dilution('acid', 5).volume === 1e5, '5 dilutions: 1 mL → 100 000 mL = 100 L'); both('s3hint', '100');

// ---- step 4: neutralisation ----
ok(M.NEUT.eqDrops === 100, '100 drops neutralise'); both('s4e', '100'); both('s4e', '2.00 mmol'); both('s4e', '0.0200 mmol');
near(M.neutral(0).pH, 1, 1e-6, 'start pH 1');
near(M.neutral(50).pH, 1.3, 0.05, '50 drops ≈ 1.3'); near(M.neutral(90).pH, 2.0, 0.05, '90 drops ≈ 2.0');
both('s4hint', '1.3'); both('s4hint', '2.0');
near(M.neutral(99).pH - M.neutral(0).pH, 2, 0.05, '99% neutralised lifts pH by about 2');
near(M.neutral(100).pH, 7, 1e-9, 'equivalence pH 7');
ok(M.neutral(100).pH - M.neutral(99).pH > 3 && M.neutral(101).pH - M.neutral(100).pH > 3, 'several units per drop at 99 → 100 → 101');
ok(M.neutral(49).pH < 4 && M.neutral(50).pH < 4, 'the guess "about 4 at half-way" is wrong');
for (let n = 0; n <= M.NEUT.maxDrops; n++) {
  const r = M.neutral(n);
  if (n) ok(r.pH > M.neutral(n - 1).pH, 'pH rises with every drop');
  if (n < 100) near(r.fromRemoval + r.fromVolume, r.pH - M.neutral(0).pH, 0.005, 'rise = removal + volume at n=' + n);
  near(r.h - M.KW / r.h, r.d, 1e-12 * Math.max(r.h, M.KW / r.h), 'charge balance [H⁺] − [OH⁻] = excess acid');
}

// ---- quiz ----
near(M.ratio(5.6, 2.2), 2512, 1, '10^3.4'); ok(M.ratio(5.6, 2.2) > 2400 && M.ratio(5.6, 2.2) < 2600, 'about 2500');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right figure references'); }

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['liq0', 'p0', 'aA', 'aB', 'reveal2', 'new2', 'startAcid', 'startBase', 'k3', 'dilute3', 'restart3', 'd4', 'add1', 'add10', 'restart4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance hooks');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/solutions/ph-scale/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS ph-scale core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
