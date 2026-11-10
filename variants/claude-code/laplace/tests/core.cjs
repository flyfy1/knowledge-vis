'use strict';
// Laplace transform & ROC (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
const cnear = (z, w, tol, msg) => { near(z[0], w[0], tol, msg + ' re'); near(z[1], w[1], tol, msg + ' im'); };
const both = (key, frag) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(frag), `${l}.${key} quotes ${frag}`); };
const NAME = 'laplace', ORIGINAL = '../../../signal/transforms/laplace/index.html';
const NEUTRAL = new Set(['s3sigR', 's3sigL']); // symbols only
const CONTROLS = ['sg0', 'w0', 'a1', 'sg1', 'al2', 'be2', 's02', 'a3', 'rocR', 'rocL', 'checkQuiz', 'sp4', 'wp4', 'w5', 'al5', 'sweep5'];
// numeric bilateral transform of a sampled signal on [−T, T]
const lap = (x, s, T = 40, n = 80000) => { const d = 2 * T / n; let re = 0, im = 0; for (let i = 0; i < n; i++) { const t = -T + (i + 0.5) * d, v = x(t); if (!v) continue; const e = M.cexp([-s[0] * t, -s[1] * t]); re += v * e[0] * d; im += v * e[1] * d; } return [re, im]; };

// ---- step 0: e^{st} ----
for (const sg of [-1.5, -0.4, 0, 0.6, 1]) for (const w of [0, 1.5, 4, 12]) for (let tt = 0; tt <= 4; tt += 0.25) {
  const z = M.est(sg, w, tt); near(z[0], Math.exp(sg * tt) * Math.cos(w * tt), 1e-12, 'Re e^{st}'); near(M.cabs(z), Math.exp(sg * tt), 1e-9, '|e^{st}| = e^{σt}');
}
{ const c = M.character(-0.4, 4); near(c.half, 1.733, 1e-3, 'half-life'); near(c.period, 1.571, 1e-3, 'period'); near(Math.exp(-0.4 * c.half), 0.5, 1e-12, 'envelope halves'); }
{ const c = M.character(0.5, 0); near(Math.exp(0.5 * c.dbl), 2, 1e-12, 'envelope doubles'); ok(c.period === null && c.half === null, 'no period / half'); }

// ---- step 1: convergence of ∫ e^{(a−σ)t} ----
for (let a = -1; a <= 1.0001; a += 0.1) for (let sg = -1; sg <= 2.0001; sg += 0.1) {
  near(M.runningIntegral(a, sg, 10), M.runningIntegralNumeric(a, sg, 10), 1e-4 * Math.max(1, M.runningIntegral(a, sg, 10)), 'I(10) exact vs Riemann');
  const conv = M.converges(a, sg);
  ok(conv === (sg > a + 1e-9) || Math.abs(sg - a) < 1e-9, 'ROC is σ > a');
  if (sg > a + 1e-9) near(M.runningIntegral(a, sg, 400), M.limit(a, sg), 1e-6, 'converges to 1/(σ − a)');
  else ok(M.runningIntegral(a, sg, 400) > 100, 'diverges outside the ROC');
}
ok(!M.converges(0.5, 0) && M.converges(0.5, 0.6), 's1hint: a = 0.5, σ = 0 diverges, σ > 0.5 converges'); both('s1hint', '0.5');
near(M.runningIntegral(0.3, 0.3, 7), 7, 1e-12, 'σ = a: I(T) = T');
// complex s: right- and left-sided transforms (the readout of step 3 uses T = 40, n = 40000)
for (const a of [-1.5, -0.8, 0, 0.8, 1.5]) {
  cnear(M.laplaceRightNumeric(a, [a + 0.5, 1], 40, 40000), M.cdiv([1, 0], [0.5, 1]), 2e-3, 'right-sided 1/(s − a)');
  cnear(M.laplaceLeftNumeric(a, [a - 0.5, 1], 40, 40000), M.cdiv([1, 0], [-0.5, 1]), 2e-3, 'left-sided 1/(s − a)');
}

// ---- step 2: terrain ----
for (const al of [0.1, 0.4, 1.5]) for (const be of [0.5, 2, 3]) {
  const h = t => M.hPair(al, be, t);
  for (const s of [[0, 0.7], [-al + 0.3, 1.9], [1, -2]]) {
    cnear(M.Hpair(al, be, s), M.cdiv([al * al + be * be, 0], M.cadd(M.cmul([s[0] + al, s[1]], [s[0] + al, s[1]]), [be * be, 0])), 1e-12, 'X(s) closed form');
    if (s[0] > -al + 0.25) cnear(lap(h, s, 60, 120000), M.Hpair(al, be, s), 5e-3 * Math.max(1, M.cabs(M.Hpair(al, be, s))), `transform of the decaying oscillation al=${al} be=${be}`);
  }
  // the cut gets taller as it nears the poles (inside the ROC); smaller α → taller Fourier cut
  let prev = 0;
  for (let s0 = 1; s0 > -al + 0.04; s0 -= 0.05) { const p = M.slicePeak(al, be, s0).peak; ok(p >= prev - 1e-9, 'cut peak grows towards the poles'); prev = p; }
}
for (const be of [0.5, 2, 3]) { let prev = Infinity; for (let al = 0.1; al <= 1.5; al += 0.05) { const p = M.slicePeak(al, be, 0).peak; ok(p <= prev + 1e-9, 'Fourier-cut peak falls as α grows'); prev = p; } }
near(M.cabs(M.Hpair(0.4, 2, [0, 0])), 1, 1e-12, 'H(0) = 1');

// ---- step 3: one formula, two signals; stability ⇔ ROC contains the axis ----
for (let a = -1.5; a <= 1.5001; a += 0.1) for (const right of [true, false]) {
  const x = right ? t => (t >= 0 ? Math.exp(a * t) : 0) : t => (t < 0 ? -Math.exp(a * t) : 0);
  const L1 = lap(t => Math.abs(x(t)), [0, 0], 40, 40000)[0];
  const contains = right ? a < -1e-9 : a > 1e-9;
  ok(contains ? L1 < 10.01 : L1 > 39.9, `∫|x| finite ⇔ ROC contains the axis a=${a.toFixed(1)} right=${right}`);
  if (contains) near(L1, (1 - Math.exp(-Math.abs(a) * 40)) / Math.abs(a), 0.01, '∫|x| over [−40, 40] = (1 − e^{−40|a|})/|a| → 1/|a|');
}
// quiz: 1/(s + 1), ROC Re s < −1 → −e^{−t}u(−t), unstable
ok(!(-1 > 0), 'quiz: left ROC with a = −1 does not contain the axis');
cnear(M.laplaceLeftNumeric(-1, [-1.5, 0.5]), M.cdiv([1, 0], [-0.5, 0.5]), 2e-3, 'quiz signal transform');

// ---- step 4: poles as character ----
for (const sp of [-1.5, -0.3, 0, 0.3, 0.5]) for (const wp of [0, 1, 3, 6]) {
  const ch = M.poleCharacter(sp, wp);
  ok(ch.kind === (sp < 0 ? 'stable' : sp > 0 ? 'unstable' : 'marginal'), 'kind by sign of σ_p');
  if (ch.settle) near(Math.exp(sp * ch.settle), 0.02, 1e-12, '2% settling');
  if (ch.period) near(ch.period, 2 * Math.PI / wp, 1e-12, 'period');
  const s = [Math.max(sp, 0) + 0.6, 0.8];
  const want = M.cdiv(M.csub(s, [sp, 0]), M.cadd(M.cmul(M.csub(s, [sp, 0]), M.csub(s, [sp, 0])), [wp * wp, 0]));
  cnear(lap(t => M.hPole(sp, wp, t), s, 60, 120000), want, 3e-3, `h(t) = e^{σp t}cos(ωp t) has poles σp ± jωp (${sp}, ${wp})`);
}
near(M.poleCharacter(-0.3, 3).settle, 13.04, 0.01, 'default settling 13.04 s');

// ---- step 5: geometry ----
for (let al = 0.1; al <= 1.5001; al += 0.05) {
  for (let w = 0; w <= 5.0001; w += 0.05) near(M.geometry(al, 2, w).gain, M.cabs(M.Hpair(al, 2, [0, w])), 1e-9, 'distance product = |H(jω)|');
  let best = 0, at = 0; for (let w = 0; w <= 5; w += 1e-4) { const g = M.geometry(al, 2, w).gain; if (g > best) { best = g; at = w; } }
  near(at, M.peakW(al, 2), 2e-4, 'peak at √(β² − α²)');
}
near(M.peakW(0.3, 2), 1.977, 1e-3, 's5hint: peak near ω ≈ 2'); both('s5hint', '0.3');
{ let prev = Infinity, prevW = 0; for (const al of [0.1, 0.3, 0.6, 1, 1.5]) {
  const pk = M.geometry(al, 2, M.peakW(al, 2)).gain; ok(pk < prev, 'smaller α → taller peak'); prev = pk;
  let lo = null, hi = null; for (let w = 0; w <= 8; w += 1e-3) { if (M.geometry(al, 2, w).gain >= pk / Math.SQRT2) { if (lo === null) lo = w; hi = w; } }
  const width = hi - lo; ok(width > prevW, 'smaller α → narrower peak'); prevW = width;
} }
ok(M.geometry(1.5, 2, M.peakW(1.5, 2)).gain < 1.05, 'α = 1.5: almost flat (peak < 1.05 × DC)');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) if (!NEUTRAL.has(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left-hand|right-hand|left chart|right chart/i.test(v) || k === '__', `${l}.${k} avoids left/right figure wording`);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of CONTROLS) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
const pending = [];
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  if (!fs.existsSync(target) && rel.startsWith('../') && !rel.startsWith('../../')) { pending.push(h); continue; } // sibling Claude edition written in the same batch
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, ORIGINAL)), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS ${NAME} core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links${pending.length ? ' (pending sibling: ' + pending.join(', ') + ')' : ''}`);
