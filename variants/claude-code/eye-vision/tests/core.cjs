'use strict';
// Eye and glasses (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const ZH = STRINGS.zh, EN = STRINGS.en, both = s => ZH[s] + ' ' + EN[s];

// ---- the vergence model agrees with the thin-lens equation 1/f = 1/u + 1/v ----
for (const u of M.POS) for (let acc = 0; acc <= 10; acc += 0.5) {
  const fmm = 1000 / (M.P0 + acc), f = M.focus(M.L0, M.objV(u), acc);
  const v = u === Infinity ? fmm : 1 / (1 / fmm - 1 / u);
  near(f.v, v, 1e-9, 'thin lens'); checks++;
}
// ---- ray trace (used for the drawing) agrees with the blur formula and the focus position ----
for (const L of [16, 17, 18, 19]) for (const u of M.POS) for (const Pg of [0, -3, -6, 2]) for (const acc of [0, 3]) {
  const Pe = M.P0 + acc, Ve = M.eyeVergence(u, Pg), f = M.focus(L, Ve, acc);
  const top = M.traceRay({ u, Pg, Pe, L }, 2), bot = M.traceRay({ u, Pg, Pe, L }, -2);
  near(top.yE, 2, 1e-9, 'ray hits the lens at the chosen height');
  near(Math.abs(top.yR - bot.yR), f.blur, 1e-6, 'ray spread on the retina = blur spot');
  near(top.xFocus, f.v, 1e-6, 'ray focus = image point'); checks += 3;
}

// ---- step 0: relaxed normal eye ----
const f0 = u => M.focus(M.L0, M.objV(u), 0);
near(f0(Infinity).offset, 0, 1e-12, 'far object lands on the retina'); checks++;
for (let i = 1; i < M.POS.length; i++) ok(f0(M.POS[i]).offset > f0(M.POS[i - 1]).offset, 'near object, far image (monotone)');
ok(f0(6000).blur <= M.BLUR_OK && f0(6000).blur.toFixed(3) === '0.011', 's0hint: 6 m spot 0.011 mm, still sharp');
ok(f0(3000).blur > M.BLUR_OK, '3 m already blurred for a relaxed eye');
ok(f0(70).offset < 6, 'plot range 0..6 mm holds every position');

// ---- step 1: accommodation ----
near(M.need(M.L0, M.objV(250)), 4, 1e-9, 's1hint: +4 D at 25 cm'); checks++;
assert.equal((1000 / (M.P0 + M.A_YOUNG)).toFixed(2), '14.53'); checks++; // s1e: shortest focal length
assert.equal(M.P0.toFixed(1), '58.8'); checks++;
near(M.nearPoint(M.L0, M.A_YOUNG), 100, 1e-9, 'near point 10 cm'); checks++;
M.POS.forEach((u, i) => ok(M.autoFocus(M.L0, u).sharp === (i < 8), 'young eye focuses everything except 7 cm'));
ok(1000 / (M.P0 + M.need(M.L0, M.objV(70))) < 1000 / (M.P0 + M.A_YOUNG), '7 cm dot below the band');
ok(1000 / (M.P0 + M.need(M.L0, M.objV(70))) > 13, 'plot range starts at 13 mm');
// the accommodation slider (step 0.05) can put 25 cm exactly on the retina
near(M.focus(M.L0, M.objV(250), 4).offset, 0, 1e-9, '25 cm at +4 D'); checks++;

// ---- step 2: axial length ----
const R18 = M.refErr(18);
ok(R18 < 0 && M.degrees(R18) > 300 && M.degrees(R18) < 400, 's2hint: 1 mm longer is "three hundred and something" degrees');
assert.equal(R18.toFixed(1), '-3.3'); checks++; // quiz: about 3.3 D / 330 degrees
near(M.farPoint(18), 306, 0.5, 'far point ≈ 31 cm'); checks++;
assert.equal((M.farPoint(18) / 10).toFixed(0), '31'); checks++;
ok(M.autoFocus(18, 250).sharp, 'quiz: 25 cm is sharp for the 18 mm eye');
ok(M.nearPoint(18, M.A_YOUNG) < 250, 'quiz: 25 cm is beyond the near point');
ok(!M.autoFocus(18, Infinity).sharp, 'myope blurs far away');
const firstSharp18 = M.POS.findIndex(u => M.autoFocus(18, u).sharp);
assert.equal(M.POS[firstSharp18], 250); checks++; // dragging closer: 25 cm is the first notch inside the far point
for (let L = 16; L <= 19.001; L += 0.1) {
  const Lr = Math.round(L * 10) / 10, R = M.refErr(Lr);
  // the bar on the plot: closeness from max(0, −R) to A − R; it matches autoFocus at every slider position
  M.POS.forEach((u, i) => { const v = -M.objV(u), inBar = v >= Math.max(0, -R) - 1e-9 && v <= M.A_YOUNG - R + 1e-9; ok(inBar === (Math.abs(M.autoFocus(Lr, u).residual) < 1e-9), 'bar = exact focus range ' + Lr + ' ' + i); });
  if (Lr > 17) ok(M.farPoint(Lr) < Infinity && M.autoFocus(Lr, Infinity).residual < 0, 'long eye: image in front');
  if (Lr < 17) ok(M.farPoint(Lr) === Infinity && M.autoFocus(Lr, Infinity).acc > 0, 'short eye: sees far by accommodating');
}
// s5fin: about 3 D per mm in this reduced eye
ok(M.refErr(17) - M.refErr(18) > 2.9 && M.refErr(17) - M.refErr(18) < 3.3 && M.refErr(18) - M.refErr(19) > 2.9, '≈3 D per mm');

// ---- step 3: glasses ----
assert.equal(M.weakestFarLens(18), -3.25); checks++;              // s3hint: sharp from −3.25 D
ok(!M.autoFocus(18, Infinity, -3.0).sharp, '−3.00 D still blurred');
ok(M.autoFocus(18, Infinity, -3.5).acc > 0.005 && M.autoFocus(18, Infinity, -3.5).sharp, '−3.50 D: sharp with effort (orange)');
for (let P = -8; P <= -3.5; P += 0.25) ok(M.autoFocus(18, Infinity, P).sharp, 'stronger concave still sharp ' + P);
for (let P = 0.25; P <= 4; P += 0.25) ok(M.autoFocus(18, Infinity, P).blur > M.autoFocus(18, Infinity, P - 0.25).blur, 'convex: blurrier and blurrier');
for (let P = -3; P <= 0; P += 0.25) ok(M.autoFocus(18, Infinity, P - 0.25).blur < M.autoFocus(18, Infinity, P).blur, 'more concave: smaller spot up to −3.25');
near(M.autoFocus(18, Infinity, M.bestLens(18)).offset, 0, 1e-9, 'best lens focuses the relaxed eye'); checks++;
near(M.autoFocus(18, Infinity, M.bestLens(18)).acc, 0, 1e-9, 'best lens: no effort'); checks++;
for (let L = 17.1; L <= 19.001; L += 0.1) { const Lr = Math.round(L * 10) / 10; ok(M.bestLens(Lr) < M.bestLens(Lr - 0.1), 'longer eye needs a stronger concave lens'); ok(M.bestLens(Lr) >= -8, 'slider reaches the best lens'); }
for (let L = 17; L <= 19.001; L += 0.1) for (let P = -8; P <= 4; P += 0.25) { const a = M.autoFocus(Math.round(L * 10) / 10, Infinity, P); ok(a.blur <= 1, 'plot y range 0..1 mm'); }
// glasses on a far object: the vergence through the lens equals the thin-lens image of the glasses
near(M.eyeVergence(Infinity, -3, 12), -3 / (1 + 12 * 3 / 1000), 1e-12, 'vertex distance'); checks++;

// ---- step 4: ageing ----
near(M.need(M.L0, M.objV(M.READ)), 1000 / 330, 1e-9, 'reading needs ≈3 D'); checks++;
assert.equal((1000 / 330).toFixed(2), '3.03'); checks++;
const firstOut = [...Array(61).keys()].map(k => k + 10).find(age => M.nearPoint(M.L0, M.ampAtAge(age)) > M.READ);
assert.equal(firstOut, 52); checks++;                               // s4hint: passes 33 cm from 52
const firstBlur = [...Array(61).keys()].map(k => k + 10).find(age => !M.autoFocus(M.L0, M.READ, 0, M.ampAtAge(age)).sharp);
assert.equal(firstBlur, 53); checks++;                              // s4hint: blurred from 53
assert.equal(M.readingLens(55), 1); checks++;                       // s4hint: +1.00 D at 55
ok(M.autoFocus(M.L0, M.READ, 1, M.ampAtAge(55)).sharp, '55 with +1 D reads sharply');
ok(M.farPoint(M.L0, 1) < Infinity && !M.autoFocus(M.L0, Infinity, 1, M.ampAtAge(55)).sharp, 'reading glasses blur distance');
for (let age = 10; age <= 70; age++) { const np = M.nearPoint(M.L0, M.ampAtAge(age)) / 10; ok(np >= 5 && np <= 300, 'plot range 5–300 cm'); }
for (let age = 10; age <= 70; age++) for (let P = 0.25; P <= 4; P += 0.25) { const n = M.nearPoint(M.L0, M.ampAtAge(age), P); ok(n !== null && n < M.nearPoint(M.L0, M.ampAtAge(age)), 'reading glasses bring the near point closer'); }
near(M.ampAtAge(70), 0.5, 1e-12, 'floor 0.5 D'); checks++;
near(M.ampAtAge(28.333333333), 10, 1e-6, 'twenty-something eye ≈ 10 D'); checks++;

// ---- formula line: 3.27 D → 0.31 m ----
ok(both('formula').includes('3.27') && Math.abs(R18).toFixed(2) === '3.27' && (1 / Math.abs(R18)).toFixed(2) === '0.31', 'formula example');

// ---- bilingual parity ----
const zk = Object.keys(ZH).sort(), ek = Object.keys(EN).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(ZH[k]), ph(EN[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['cm', 'm']); // unit templates only
for (const k of zk) ok(NEUTRAL.has(k) || ZH[k] !== EN[k], 'zh text differs from en for ' + k);
ok(ZH.foot.includes('claude-opus-5-5') && EN.foot.includes('claude-opus-5-5'), 'footer names the model');
ok(ZH.foot.includes('眼睛与眼镜 · 为什么近视要戴凹透镜') && EN.foot.includes('The Eye and Glasses · Why Short-Sightedness Needs a Concave Lens'), 'footer names the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left (chart|panel|plot)|right (chart|panel|plot)/i.test(v), 'no left/right figure references in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(ZH[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(ZH[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['u0', 'u1', 'a1', 'auto1', 'L2', 'u2', 'checkQuiz', 'L3', 'g3', 'age4', 'g4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok((() => { try { new Function(app); return true; } catch (e) { return false; } })(), 'app.js parses');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
// slider ranges in the HTML match the model
ok(html.includes('id="u0" data-step="0" type="range" min="0" max="8"') && M.POS.length === 9, 'distance slider covers POS');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/optics/eye-vision/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS eye-vision core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · myopia at L=18: ${R18.toFixed(2)} D, far point ${(M.farPoint(18) / 10).toFixed(1)} cm, best lens ${M.bestLens(18).toFixed(2)} D`);
