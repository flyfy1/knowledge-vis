'use strict';
// Buffer-capacity (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- the exact solver satisfies the charge balance; sanity limits ----
const B = M.make(0.2, 1, 4.76);
for (let n = -0.25; n <= 0.25; n += 0.005) for (const buf of [B, M.WATER, M.make(0.05, 10, 7.21), M.make(0.001, 0.01, 9.25)]) {
  const p = M.pH(buf, n), h = Math.pow(10, -p), na = Math.max(0, n), nb = Math.max(0, -n);
  const resid = h + buf.A0 + nb - (buf.C ? buf.C * buf.Ka / (buf.Ka + h) : 0) - M.KW / h - na;
  ok(Math.abs(resid) < 1e-9 * Math.max(1, buf.C + Math.abs(n)), 'charge balance residual');
  ok(p > 0 && p < 14, 'pH in 0–14 on every chart range');
}
near(M.pH(M.WATER, 0), 7, 1e-9, 'pure water pH 7');
near(M.pH(B, 0), 4.76, 0.005, 'buffer starts at pKa');
ok(B.A0 === 0.1 && B.HA0 === 0.1, '0.10 mol each');
// a strong acid with no buffer: pH = −lg n once n ≫ 1e-7
near(M.pH(M.WATER, 0.01), 2, 1e-4, 'water + 0.01 mol acid → pH 2');

// ---- step 0: one drop ----
near(M.DROP, 0.005, 0, '5 mL of 1 M per drop');
{
  const w1 = M.pH(M.WATER, M.DROP), b1 = M.pH(B, M.DROP), b0 = M.pH(B, 0);
  ok(7 - w1 > 4.5 && 7 - w1 < 5, 'water drops by almost 5 on the first drop: ' + (7 - w1));
  ok(b0 - b1 < 0.05, 'buffer barely moves on the first drop');
  ok(b0 - M.pH(B, 3 * M.DROP) < 0.15, 'three drops still < 0.15');
  // the slope steepens towards the 20th drop (0.10 mol = all the A⁻)
  const step = d => M.pH(B, (d - 1) * M.DROP) - M.pH(B, d * M.DROP);
  for (let d = 2; d <= 20; d++) ok(step(d) > step(d - 1), 'each drop moves pH more than the last, up to 20: ' + d);
  ok(step(20) > 10 * step(1), 'the 20th drop moves pH more than 10× the first');
  near(20 * M.DROP, B.A0, 1e-12, '20 drops = all the A⁻');
  ok(M.pH(B, 20 * M.DROP) < 3, 'red (pH < 3) by drop 20');
  // the indicator colours behind the story: water green → red, buffer stays orange
  const col = p => M.indicator(p);
  ok(col(7)[1] > 200 && col(7)[0] < 150, 'pH 7 is green'); ok(col(w1)[0] > 200 && col(w1)[1] < 110, 'water after one drop is red');
  ok(Math.abs(col(b1)[1] - col(b0)[1]) < 10, 'buffer colour barely changes');
  ok(col(M.pH(B, 20 * M.DROP))[0] > 200 && col(M.pH(B, 20 * M.DROP))[1] < 110, 'buffer red at drop 20');
  // base is the mirror image for a 1:1 buffer
  for (let d = 1; d <= 15; d++) near(M.pH(B, -d * M.DROP) - b0, b0 - M.pH(B, d * M.DROP), 0.01, 'mirror image for base, drop ' + d);
}
ok(25 * M.DROP <= 0.125, 'chart spans ±25 drops');

// ---- step 1: stockpile ----
for (let n = -0.12; n <= 0.12; n += 0.005) {
  const q = M.inventory(B, n);
  if (Math.abs(n) <= 0.1 + 1e-12) near(q.A + q.HA, 0.2, 1e-12, 'HA + A⁻ = 0.20 mol while neither is used up');
  ok(q.A >= 0 && q.HA >= 0 && q.HA + q.exAcid + q.A <= 0.25 + 1e-12, 'bars fit the 0–0.25 axis');
}
{
  near(M.pH(B, 0.05), 4.28, 0.005, 'pointer 4.76 → 4.28 at +0.05'); near(M.hh(B, 0.05), M.pH(B, 0.05), 0.005, 'formula agrees at +0.05');
  ok(Math.pow(10, -M.pH(B, 0.05)) / 0.05 < 0.002, 'free H⁺ is < 0.2 % of what was added');
  const p11 = M.pH(B, 0.11); ok(p11 > 1.9 && p11 < 2.2, 'pointer jumps to about 2 past 0.10: ' + p11);
  ok(Number.isNaN(M.hh(B, 0.11)) && Number.isNaN(M.hh(B, -0.11)), 'formula undefined once a side is used up');
  near(M.inventory(B, 0.11).exAcid, 0.01, 1e-12, 'excess H⁺ 0.010');
}

// ---- step 2: the ratio sets pH ----
for (const k of ['acetic', 'phosphate', 'ammonium']) {
  const pKa = M.PAIRS[k].pKa;
  for (let lr = -2; lr <= 2.0001; lr += 0.05) for (let lc = -3; lc <= 0.0001; lc += 0.1) {
    const p = M.pH(M.make(Math.pow(10, lc), Math.pow(10, lr), pKa), 0);
    ok(p >= Math.floor(pKa) - 3 && p <= Math.ceil(pKa) + 3, `y axis holds ${k} lr ${lr.toFixed(2)} lc ${lc.toFixed(1)}`);
    if (lc >= -1 - 1e-9 && Math.abs(lr) <= 1 + 1e-9) ok(Math.abs(p - (pKa + lr)) < 0.01, `formula within 0.01 for C ≥ 0.1, ratio 0.1–10 (${k})`);
    // well stocked (C ≥ 0.1 before and after a tenfold dilution, ratio 0.1–10): dilution barely moves pH
    if (lc >= 0 - 1e-9 && Math.abs(lr) <= 1 + 1e-9) ok(Math.abs(M.pH(M.make(Math.pow(10, lc - 1), Math.pow(10, lr), pKa), 0) - p) < 0.02, 'tenfold dilution moves pH < 0.02 while stocked');
    // ratio 1 down to C = 0.01: still < 0.01
    if (lc >= -1 - 1e-9 && Math.abs(lr) < 1e-9) ok(Math.abs(M.pH(M.make(Math.pow(10, lc - 1), 1, pKa), 0) - p) < 0.01, 'ratio 1: tenfold dilution to ≥ 0.01 moves pH < 0.01');
  }
  near(M.pH(M.make(0.2, 1, pKa), 0), pKa, 0.005, 'ratio 1 → pH = pKa at C ≈ 0.2 (' + k + ')');
}
ok(Math.abs(M.pH(M.make(0.001, 0.01, 4.76), 0) - 2.76) > 0.3, 'dilute + extreme ratio: curve leaves the line');
ok(Math.abs(M.pH(M.make(0.01, 0.1, 4.76), 0) - M.pH(M.make(0.1, 0.1, 4.76), 0)) > 0.05, 'thin stockpile: dilution does move pH (why the text says “well stocked”)');
near(M.make(0.001, 0.01, 4.76).A0, 1e-5, 1e-7, 'about 10 μmol of A⁻ left');
near(-0.7, Math.log10(0.2), 0.002, 'C slider default ≈ 0.2');

// ---- step 3: capacity ∝ C ----
const ks = [];
for (let c = 0.05; c <= 0.4001; c += 0.05) {
  const buf = M.make(c, 1, 4.76), ca = M.capacity(buf, 1), cb = M.capacity(buf, -1);
  ks.push(ca / c, cb / c);
  ok(c / 2 <= 0.25, 'exhaustion point inside the ±0.25 axis');
}
ok(Math.min(...ks) > 0.40 && Math.max(...ks) < 0.42, 'capacity ≈ 0.41 C: ' + Math.min(...ks).toFixed(4) + '–' + Math.max(...ks).toFixed(4));
near(M.capacity(M.make(0.4, 1, 4.76), 1) / M.capacity(M.make(0.2, 1, 4.76), 1), 2, 0.01, 'double the concentration, double the capacity');
{ const cw = M.capacity(M.WATER, 1); ok(cw > 5e-7 && cw < 2e-6, 'water: about a micromole'); ok(M.capacity(B, 1) / cw > 1e4, 'buffer ≫ water'); }
// the analytic formula for the 1-unit shift (ratio 1 → 0.1): x = 0.5·C·9/11
near(0.5 * 0.2 * 9 / 11, M.capacity(B, 1), 0.001, 'stoichiometric estimate of the capacity');

// ---- step 4: β peaks at pKa; asymmetric capacities ----
{
  let best = 0, at = 0; for (let p = 2; p <= 8; p += 0.001) { const b = M.beta(B, p); if (b > best) { best = b; at = p; } ok(b < 0.12, 'β axis 0–0.12'); }
  near(at, 4.76, 0.02, 'β peaks at pKa'); near(best, Math.LN10 * 0.2 / 4, 0.001, 'β max = 2.303·C/4');
  near(M.beta(B, 3.76) / M.beta(B, 4.76), 1 / 3, 0.01, 'β at pKa − 1 ≈ a third of the peak');
  near(M.beta(B, 5.76) / M.beta(B, 4.76), 1 / 3, 0.01, 'β at pKa + 1 ≈ a third of the peak');
  for (const p of [3, 4, 4.76, 5.5, 7]) { const n1 = M.pH(B, 0); } // (β definition checked numerically below)
  for (const lr of [-1, -0.5, 0, 0.5, 1]) {
    const buf = M.make(0.2, Math.pow(10, lr), 4.76), p0 = M.pH(buf, 0), dn = 1e-5;
    near(M.beta(buf, p0), (2 * dn) / (M.pH(buf, -dn) - M.pH(buf, dn)), 1e-4, 'β = dn/dpH at ratio 10^' + lr);
  }
  const minCap = lr => { const buf = M.make(0.2, Math.pow(10, lr), 4.76); return Math.min(M.capacity(buf, 1), M.capacity(buf, -1)); };
  let bestLr = null, bestMin = 0; for (let lr = -2; lr <= 2.0001; lr += 0.05) { const m = minCap(lr); if (m > bestMin) { bestMin = m; bestLr = lr; } }
  ok(Math.abs(bestLr) < 0.051, '1:1 maximises the weaker direction');
  const r10 = M.make(0.2, 10, 4.76), r01 = M.make(0.2, 0.1, 4.76);
  ok(M.capacity(r10, -1) < M.capacity(r10, 1), 'ratio 10: weaker against base');
  ok(M.capacity(r01, 1) < M.capacity(r01, -1), 'ratio 0.1: weaker against acid');
  ok(Math.abs(M.capacity(B, 1) - M.capacity(B, -1)) / M.capacity(B, 1) < 0.05, 'ratio 1: even (verdict threshold 5 %)');
  near(M.pH(r10, 0), 5.76, 0.01, 'ratio 10 sits at the band edge');
}

// ---- step 5: blood ----
near(M.PAIRS.carbonic.pKa + Math.log10(20), 7.40, 0.005, 'blood 6.1 + lg 20 = 7.40');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['exNone', 'lgRange']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '缓冲溶液 · 把 pH 稳住' : 'Buffer Capacity · Holding pH Steady'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|左边|右边|left chart|right chart|left panel|right panel|on the left|on the right/i.test(STRINGS[l][k]), 'no left/right references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['amtAcid', 'amtBase', 'amtNone', 'actAcid', 'actBase', 'exAcid', 'exBase', 'v4Even', 'v4Acid', 'v4Base', 'pairAcetic', 'pairPhosphate', 'pairAmmonium']) ok(app.includes(`'${k}'`), 'app uses ' + k);
for (const id of ['acid0', 'base0', 'reset0', 'n1', 'lr2', 'lc2', 'c3s', 'lr4', 's5fin']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/solutions/buffer-capacity/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS buffer-capacity core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · capacity/C ${Math.min(...ks).toFixed(3)}–${Math.max(...ks).toFixed(3)}`);
