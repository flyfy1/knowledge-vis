'use strict';
// Standing waves (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (k, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][k].includes(s), `${l}.${k} quotes "${s}"`));

// ---- step 0: superposition = envelope × clock ----
let maxDiff = 0;
for (const lam of [1, 1.3, 2, 2.1, 3.7, 4]) for (let x = 0; x <= 4; x += 0.037) for (let tt = 0; tt <= 8; tt += 0.113)
  maxDiff = Math.max(maxDiff, Math.abs(M.ySum(x, tt, lam) - M.yProduct(x, tt, lam)));
ok(maxDiff < 1e-9, 'y1 + y2 = 2A cos(kx) sin(ωt), max diff ' + maxDiff);
// crests: each wave reaches +A at its crest and the crest moves at ±λ/T
for (let tt = 0; tt < 8; tt += 0.25) {
  M.crests('right', tt, 2).forEach(x => near(M.yRight(x, tt, 2), M.A, 1e-12, 'right crest height'));
  M.crests('left', tt, 2).forEach(x => near(M.yLeft(x, tt, 2), M.A, 1e-12, 'left crest height'));
  const r0 = M.crests('right', tt, 2)[0], r1 = M.crests('right', tt + 0.1, 2)[0], l0 = M.crests('left', tt, 2)[0], l1 = M.crests('left', tt + 0.1, 2)[0];
  near(((r1 - r0) % 2 + 2) % 2, 0.1 * M.speed(2), 1e-9, 'right crest moves +v·dt');
  near(((l0 - l1) % 2 + 2) % 2, 0.1 * M.speed(2), 1e-9, 'left crest moves −v·dt');
}
near(M.speed(2), 1, 1e-12, 'v = λ/T = 1 m/s');
assert.deepEqual(M.nodes(2).map(x => +x.toFixed(9)), [0.5, 1.5, 2.5, 3.5]); checks++; // s0both lists these
// the sum's peaks do not travel: the largest |y| on the rope always sits on an antinode
for (let tt = 0.05; tt < 2; tt += 0.1) {
  if (Math.abs(M.clock(tt)) < 0.05) continue;
  let best = 0, bx = 0; for (let x = 0; x <= 4; x += 0.001) { const v = Math.abs(M.ySum(x, tt, 2)); if (v > best + 1e-12) { best = v; bx = x; } }
  near(bx, M.nearestAntinode(bx, 2), 2e-3, 'peak of the sum stays on an antinode at t=' + tt);
}

// ---- step 1: amplitude, nodes, antinodes, phase ----
let worst = 0;
for (let lam = 1; lam <= 4.0001; lam += 0.1) {
  const nd = M.nodes(lam), an = M.antinodes(lam);
  for (let i = 1; i < nd.length; i++) near(nd[i] - nd[i - 1], lam / 2, 1e-9, 'nodes λ/2 apart');
  nd.forEach(x => { for (let tt = 0; tt < 2; tt += 0.07) ok(Math.abs(M.ySum(x, tt, lam)) < 1e-9, 'node never moves'); ok(M.classify(x, lam) === 'node', 'classified node'); ok(M.phaseVsOrigin(x, lam) === 'none', 'node has no phase'); near(M.amp(x, lam), 0, 1e-9, 'A = 0 at node'); });
  an.forEach(x => { near(M.swing(x, lam), 2 * M.A, 1e-3, 'antinode swings 2A'); ok(M.classify(x, lam) === 'antinode', 'classified antinode'); });
  nd.forEach(x => near(Math.abs(x - M.nearestAntinode(x, lam)), lam / 4, 1e-9, 'node is λ/4 from the nearest antinode'));
  for (let x = 0; x <= 4; x += 0.05) {
    const a = M.amp(x, lam), sw = M.swing(x, lam, 720);
    if (a > 0.05) worst = Math.max(worst, Math.abs(sw - a) / a); // the readout compares A(x) with the curve's maximum
    // in step / opposite: sign of the spatial factor; crossing one node flips it
    const nAcross = M.nodes(lam, 4).filter(n => n < x - 1e-9).length;
    if (M.classify(x, lam) !== 'node') ok(M.phaseVsOrigin(x, lam) === (nAcross % 2 ? 'opposite' : 'same'), `phase parity λ=${lam} x=${x}`);
  }
}
ok(worst < 0.01, 'A(x) vs the sampled curve maximum within 1%: ' + worst);
// the exact node λ/4 for λ = 2.1 (not on the 0.05 slider grid) is reached by the preset and classified as a node
ok(M.classify(2.1 / 4, 2.1) === 'node' && M.classify(0.525, 2.1) === 'node', 'λ = 2.1 node at 0.525');
// at a node the two waves are both non-zero yet opposite (quiz 3 / kindNode)
{ const x = M.nodes(2)[0]; let seen = 0; for (let tt = 0; tt < 2; tt += 0.1) { const a = M.yRight(x, tt, 2), b = M.yLeft(x, tt, 2); if (Math.abs(a) > 0.1) seen++; near(a + b, 0, 1e-12, 'y1 = −y2 at a node'); } ok(seen > 5, 'waves really arrive at the node'); }

// ---- step 2: pinned ends ----
let fixedDiff = 0;
for (const lam of [1, 2.4, 5, 7.3, 12]) for (let x = 0; x <= 6; x += 0.05) for (let tt = 0; tt < 2; tt += 0.09) {
  fixedDiff = Math.max(fixedDiff, Math.abs(M.yFixed(x, tt, lam) - M.yFixedProduct(x, tt, lam)));
  if (x === 0) ok(Math.abs(M.yFixed(0, tt, lam)) < 1e-12, 'left end always still');
  near(M.yIncoming(0, tt, lam) + M.yReflected(0, tt, lam), 0, 1e-12, 'reflection flips the wave at the fixed end');
}
ok(fixedDiff < 1e-9, 'incoming + flipped reflection = 2A sin(kx) cos(ωt)');
for (let L = 1; L <= 6; L += 0.5) {
  // every slider value of λ (1..12 step 0.05) is a mode exactly when 2L/λ is a whole number (exact rational check)
  for (let i = 0; i <= 220; i++) {
    const lam = Number((1 + i * 0.05).toFixed(2)), mc = M.modeCheck(L, lam);
    const hundredths = Math.round(lam * 100), whole = (200 * L) % hundredths === 0; // 2L/λ = 200L/(100λ)
    ok(mc.ok === whole, `mode verdict L=${L} λ=${lam}`);
    if (mc.ok) { near(mc.end, 0, 1e-9, 'mode: right end still'); for (let m = 0; m <= mc.n; m++) for (let tt = 0; tt < 2; tt += 0.3) ok(Math.abs(M.yFixed(m * L / mc.n, tt, lam)) < 1e-9, 'interior nodes still'); }
    else ok(mc.end > 1e-6, 'non-mode: right end would have to move');
  }
  for (let n = 1; M.modeLambda(L, n) >= 1; n++) ok(M.modeCheck(L, M.modeLambda(L, n)).ok, `snap target 2L/${n} is a mode`);
}
// default L = 6, λ = 5: q = 2.4, does not fit; snap → λ = 6 (n = 2); 6.05 does not fit
{ const d = M.modeCheck(6, 5); near(d.q, 2.4, 1e-12, 'q default'); ok(!d.ok, 'λ=5 rejected'); const s = M.snap(6, 5); ok(s.n === 2 && s.lambda === 6, 'snap to 6'); ok(!M.modeCheck(6, 6.05).ok, '6.05 rejected'); }

// ---- step 3: harmonic ladder ----
near(M.fN(1), 110, 1e-9, 'f1 = 143/(2·0.65) = 110 Hz');
[110, 220, 330, 440].forEach((f, i) => near(M.fN(i + 1), f, 1e-9, 'natural frequencies quoted in s4e'));
near(M.fN(1, 0.325), 220, 1e-9, 'halving L doubles f1 (s3hint)');
ok(Math.abs((0.325 - 0.3) / 0.005 - Math.round((0.325 - 0.3) / 0.005)) < 1e-9, '0.325 is on the L slider grid');
for (let L = 0.3; L <= 0.65 + 1e-9; L += 0.005) for (let n = 1; n <= 6; n++) {
  near(M.fN(n, L) / M.fN(1, L), n, 1e-9, 'f_n / f_1 = n');
  near(M.fN(n, L), M.V / M.modeLambda(L, n), 1e-9, 'f = v/λ');
  ok(M.fN(n, L) < 1500, 'ladder fits the 0–1500 Hz axis');
}
for (let n = 1; n <= 6; n++) { ok(M.countNodes(n) === M.nodeCount(n), `drawn shape has n+1 nodes, n=${n}`); ok(M.loopCount(n) === n, 'n antinodes'); }

// ---- step 4: resonance (schematic damping) ----
for (let z = 0.005; z <= 0.05 + 1e-9; z += 0.005) {
  const pk = M.peaks(z).filter(p => p.g > 1.2);
  ok(pk.length === 4, `four peaks in 20–500 Hz for ζ=${z.toFixed(3)}: ${pk.map(p => p.f).join(',')}`);
  pk.forEach((p, i) => {
    const fn = M.fN(i + 1);
    ok(Math.abs(p.f - fn) / fn < 0.005, `peak ${i + 1} within 0.5% of f_n (ζ=${z.toFixed(3)})`); // s4hint
    ok(M.likeness(fn, z, i + 1) > 0.95, 'at f_n the shape is mode n (similarity readout)');
    ok(M.bestMode(fn, z).n === i + 1, 'best mode at f_n');
    // the "hit" band |f − f_n| ≤ ζ f_n keeps at least ~70% of the peak (half-power width)
    ok(M.gain(fn * (1 - z), z) > 0.65 * p.g && M.gain(fn * (1 + z), z) > 0.65 * p.g, 'half-width band');
    if (i < 3) { const mid = (fn + M.fN(i + 2)) / 2; ok(M.gain(mid, z) < M.gain(M.fN(i + 2), z) && M.gain(mid, z) < p.g / 1.3, 'low between peaks'); }
  });
  for (let i = 1; i < pk.length; i++) ok(pk[i].g < pk[i - 1].g, 'peaks fall with n (drive weighting)');
}
// more damping → lower, wider peaks
ok(M.gain(110, 0.05) < M.gain(110, 0.02) && M.gain(110, 0.02) < M.gain(110, 0.005), 'damping lowers the peak');
near(M.gain(1e-6, 0.02), 1, 1e-6, 'amplification → 1 as f → 0');
ok(M.gain(110, 0.005) < 1.15 * 100 && M.gain(110, 0.005) > 10, 'peak fits the 0.1–126 log axis');
// the drive point is not on a node of modes 1..6 (condition stated in s4hint)
for (let n = 1; n <= 6; n++) ok(Math.abs(Math.sin(n * Math.PI * M.DRIVE)) > 0.3, 'drive not on a node of mode ' + n);
// sweep grid (20..500 step 2) contains every f_n
for (let n = 1; n <= 4; n++) ok((M.fN(n) - 20) % 2 === 0, 'sweep hits f_' + n);

// ---- step 5: quiz verdicts ----
ok(M.QUIZ.q1() === 'node', 'q1 node'); near(M.amp(1, 4), 0, 1e-12, 'q1 amplitude 0');
ok(M.QUIZ.q2() === 12, 'q2 12 m'); ok(M.QUIZ.q3() === 'false', 'q3 false'); near(M.QUIZ.q4(), 2, 1e-12, 'q4 doubles');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
ok(html.includes('name="q1" value="node"') && html.includes('name="q2" value="12"') && html.includes('name="q3" value="false"') && html.includes('name="q4" value="2"'), 'quiz options carry the model answers');

// ---- quoted numbers in text ----
both('s4e', '110'); both('s4e', '440'); both('s3e', '0.65'); both('s3e', '143'); both('s3hint', '0.325'); both('s3hint', '220'); both('s4hint', '0.5%'); both('s4hint', '0.05');
both('s1e', 'λ/2'); both('s1e', 'λ/4');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['modeN', 'q2a', 'q2b', 'q2c']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const q of ['q1', 'q2', 'q3', 'q4']) for (const s of ['ok', 'no']) ok(STRINGS.zh[q + s] !== undefined, 'quiz key ' + q + s);
for (const id of ['viewRight', 'viewLeft', 'viewBoth', 't0', 'lam1', 'p1', 'toNode', 'toAnti', 'env1', 'L2', 'lam2', 'snap2', 'clear2', 'modeBtns', 'L3', 'ghost3', 'f4', 'z4', 'sweep4', 'clear4', 'play0', 'play1', 'play2', 'play3', 'play4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!/canvas-label-guard/.test(html), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/waves/standing-wave/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS standing-wave core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · identity diff ${maxDiff.toExponential(1)} · A(x) vs curve max ${(worst * 100).toFixed(3)}%`);
