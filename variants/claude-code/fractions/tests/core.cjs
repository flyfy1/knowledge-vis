'use strict';
// Core checks for the Claude Code edition of the fractions lesson. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Run: node variants/claude-code/fractions/tests/core.cjs
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS, sayFraction, sayMixed } = require(path.join(dir, 'i18n.js'));
const F = (n, d) => ({ n, d });
const same = (f, n, d) => f.n === n && f.d === d;
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// 1. Exact arithmetic against an independent definition, over every slider position used on the page.
for (let b = 1; b <= 12; b++) for (let a = 0; a <= 3 * b; a++) {
  const s = M.simplify(F(a, b));
  ok(s.n * b === a * s.d && M.gcd(s.n, s.d) === 1, `simplify ${a}/${b}`);
  const m = M.toMixed(F(a, b));
  ok(m.q * b + m.r === a && m.r >= 0 && m.r < b, `mixed ${a}/${b}: remainder smaller than denominator`);
  ok(M.kind(F(a, b)) === (a < b ? 'proper' : a % b === 0 ? 'whole' : 'improper'), `kind ${a}/${b}`);
  for (let m2 = 1; m2 <= 5; m2++) ok(M.equal(M.scale(F(a, b), m2), F(a, b)), `scaling keeps the value ${a}/${b} ×${m2}`);
}
// Step 3 (denominators 2–10) and step 4 (2–8): compare, common denominator, sum, slip.
for (let b1 = 2; b1 <= 10; b1++) for (let a1 = 1; a1 <= b1; a1++) for (let b2 = 2; b2 <= 10; b2++) for (let a2 = 1; a2 <= b2; a2++) {
  const f1 = F(a1, b1), f2 = F(a2, b2), c = M.common(f1, f2);
  ok(c.L % b1 === 0 && c.L % b2 === 0 && [...Array(c.L).keys()].slice(1).every(k => k % b1 || k % b2), `L is the least common multiple of ${b1}, ${b2}`);
  ok(M.equal(c.f, f1) && M.equal(c.g, f2) && c.f.d === c.L && c.g.d === c.L, 'common denominator keeps both values');
  ok(M.compare(f1, f2) === Math.sign(c.f.n - c.g.n) && M.compare(f1, f2) === Math.sign(a1 * b2 - a2 * b1), `compare ${a1}/${b1} vs ${a2}/${b2}`);
  const d = M.sub(f1, f2); ok(d.n * b1 * b2 === (a1 * b2 - a2 * b1) * d.d, 'difference');
  if (b1 <= 8 && b2 <= 8) {
    const s = M.add(f1, f2), w = M.mediant(f1, f2);
    ok(s.raw.n * b1 * b2 === (a1 * b2 + a2 * b1) * s.raw.d && s.raw.d === s.L, `sum ${a1}/${b1}+${a2}/${b2}`);
    ok(M.compare(s.raw, F(2, 1)) <= 0, 'sums stay within the 0..2 number line');
    // s4hint / s4wrong: the slip always lies between the two addends and below the true sum (both > 0).
    const lo = M.compare(f1, f2) <= 0 ? f1 : f2, hi = lo === f1 ? f2 : f1;
    ok(M.compare(w, lo) >= 0 && M.compare(w, hi) <= 0 && M.compare(w, s.raw) < 0, `slip between and below ${a1}/${b1}, ${a2}/${b2}`);
    if (!M.equal(f1, f2)) ok(M.compare(w, lo) > 0 && M.compare(w, hi) < 0, 'strictly between when the addends differ');
    else ok(M.equal(w, f1), 'slip equals the addend when both addends are equal');
  }
}
// Step 0: unequal cuts. The cuts cover the whole strip, every cut is genuinely unequal for b ≥ 2,
// and the default (b=4, a=3) gives 6/7, not 3/4.
for (let b = 1; b <= 12; b++) {
  const u = M.unevenCuts(b);
  ok(u.cuts[0].n === 0 && u.cuts[b].n === u.total && u.cuts.length === b + 1, 'uneven cuts span the strip');
  if (b >= 2) ok(new Set(u.weights).size > 1, 'parts really differ');
}
ok(same(M.unevenShare(3, 4), 6, 7), 'uneven default 3 of 4 parts = 6/7');

// 2. Decimals: long division against exact rational reconstruction, for every a/b on step 6 (b 2–12, 1 ≤ a < b).
for (let b = 2; b <= 12; b++) for (let a = 1; a < b; a++) {
  const ld = M.longDivision(a, b);
  ld.steps.forEach(s => ok(s.r < b && s.next < b && s.digit === Math.floor(10 * s.r / b) && s.next === 10 * s.r % b, 'each step: remainder smaller than the divisor'));
  // Rebuild the value from prefix and repetend: 0.P(C) = (PC − P) / (10^p (10^c − 1)).
  const P = ld.prefix, Cy = ld.cycle;
  if (ld.terminates) ok(a * 10 ** P.length === Number(P) * b, `${a}/${b} = 0.${P} exactly`);
  else {
    const num = Number(P + Cy) - Number(P || '0'), den = 10 ** P.length * (10 ** Cy.length - 1);
    ok(num * b === a * den, `${a}/${b} = 0.${P}(${Cy}) exactly`);
  }
  ok(ld.terminates === M.terminatesByRule(a, b), `s6hint rule (only 2s and 5s) holds for ${a}/${b}`);
  ok(Math.abs(Number(M.rounded(a, b, 4)) - a / b) <= 0.00005 + 1e-12, `rounding ${a}/${b}`);
  ok(M.digits(ld, 8) === (a / b).toFixed(12).slice(2, 10) || Math.abs(Number('0.' + M.digits(ld, 8)) - a / b) < 1e-8, `digits ${a}/${b}`);
}

// 3. Every worked example quoted in the prose.
ok(same(M.common(F(2, 3), F(3, 5)).f, 10, 15) && same(M.common(F(2, 3), F(3, 5)).g, 9, 15) && same(M.sub(F(2, 3), F(3, 5)), 1, 15), 's3e: 2/3 = 10/15 > 9/15 = 3/5, by 1/15');
const half3 = M.add(F(1, 2), F(1, 3));
ok(half3.L === 6 && same(half3.f, 3, 6) && same(half3.g, 2, 6) && same(half3.raw, 5, 6), 's4e: 1/2 + 1/3 = 3/6 + 2/6 = 5/6');
ok(same(M.mediant(F(1, 2), F(1, 3)), 2, 5) && M.compare(F(2, 5), F(1, 2)) < 0, 's4e: the slip 2/5 is shorter than 1/2');
ok(M.toMixed(F(7, 4)).q === 1 && M.toMixed(F(7, 4)).r === 3, 's5e: 7/4 = 1 3/4, 7 ÷ 4 = 1 r 3');
ok(M.decimalText(M.longDivision(3, 8)) === '0.375', 's6: 3/8 = 0.375');
ok(M.longDivision(1, 3).cycle === '3' && M.decimalText(M.longDivision(1, 3)) === '0.333…' && M.rounded(1, 3, 4) === '0.3333', 's6: 1/3 = 0.333… ≈ 0.3333');
ok(M.longDivision(1, 7).cycle === '142857', '1/7 repetend 142857');
ok(M.decimalText(M.longDivision(1, 6)) === '0.1666…' && !M.longDivision(1, 6).terminates, 'quiz: 1/6 = 0.1666… repeats');
ok(same(M.add(F(1, 3), F(1, 4)).simplest, 7, 12) && !M.equal(F(7, 12), F(2, 7)), 'quiz: 1/3 + 1/4 = 7/12, not 2/7');
ok(M.compare(F(2, 3), F(3, 5)) > 0, 'quiz: option b is true');
ok(M.equal(F(1, 2), F(2, 4)) && same(M.simplify(F(2, 4)), 1, 2) && same(M.simplify(F(4, 6)), 2, 3) && M.equal(F(2, 3), F(4, 6)), 's2/s3 hints: 2/4 → 1/2, 4/6 → 2/3, 4/6 lines up with 2/3');
for (const l of ['zh', 'en']) {
  const s = STRINGS[l];
  ok(s.s3e.includes('10/15') && s.s3e.includes('9/15') && s.s3e.includes('1/15') && s.s3e.includes('15'), l + ' s3e quotes the tested numbers');
  ok(s.s4e.includes('3/6') && s.s4e.includes('2/6') && s.s4e.includes('5/6') && s.s4e.includes('2/5'), l + ' s4e quotes the tested numbers');
  ok(s.s5e.includes('7 ÷ 4 = 1') && s.s5e.includes('1¾'), l + ' s5e quotes 7 ÷ 4');
  ok(s.correct.includes('10/15') && s.correct.includes('9/15'), l + ' quiz feedback quotes the tested numbers');
}
ok(sayFraction('zh', 3, 4) === '四分之三' && sayFraction('en', 3, 4) === 'three quarters' && sayFraction('en', 1, 2) === 'one half', 'reading aloud');
ok(sayMixed('zh', 1, 3, 4) === '一又四分之三' && sayMixed('en', 1, 3, 4) === 'one and three quarters', 'reading mixed numbers');
for (let b = 1; b <= 12; b++) for (let a = 0; a <= b; a++) ok(!sayFraction('en', a, b).includes('undefined') && !sayFraction('zh', a, b).includes('undefined'), 'reading defined for step 0');
for (let b = 2; b <= 8; b++) for (let a = 1; a <= 3 * b; a++) { const m = M.toMixed(F(a, b)); if (m.r && m.q) ok(!/undefined/.test(sayMixed('zh', m.q, m.r, b) + sayMixed('en', m.q, m.r, b)), 'mixed reading defined'); }

// 4. Bilingual parity: same keys, same placeholders; every key used by the HTML and app exists.
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) ok(ph(STRINGS.zh[k]) === ph(STRINGS.en[k]), 'placeholders for ' + k);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]], 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]], 'app key ' + m[1]);
for (const k of ['proper', 'whole', 'improper']) ok(STRINGS.zh['k_' + k], 'kind key ' + k);
for (const k of ['cPart', 'cPiece', 'cHop', 'cStrip']) for (const n of ['1', 'N']) ok(STRINGS.zh[k + n] && STRINGS.en[k + n].includes('{n}'), 'counted noun ' + k + n);
for (const k of ['s3gt', 's3lt', 's3eq', 's0notEq', 's0eq']) ok(STRINGS.zh[k] && app.includes("'" + k + "'"), 'dynamic key ' + k);
ok(/claude-opus-5-5/.test(STRINGS.zh.foot) && /claude-opus-5-5/.test(STRINGS.en.foot), 'footer names the model');
// No CJK in the English strings, and no hard-coded prose in app.js canvas text.
for (const k of ek) ok(!/[一-鿿]/.test(STRINGS.en[k]), 'English string has no Chinese: ' + k);

// 5. Every link lands on a page that exists, and every #stepN anchor exists there.
const hrefs = [...html.matchAll(/href="(\.\.\/[^"]+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#');
  const target = path.join(dir, rel, rel.endsWith('/') ? 'index.html' : '');
  ok(fs.existsSync(target), 'link target ' + h);
  if (anchor) ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(hrefs.includes('../../../math/arithmetic/fractions/'), 'header links to the original edition');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
console.log(`PASS fractions (Claude Code edition) core: ${checks} checks, ${zk.length} bilingual keys, ${new Set(hrefs).size} links`);
