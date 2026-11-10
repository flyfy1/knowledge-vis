'use strict';
// Resonance (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes and checks simulation against closed forms; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const { m, k } = M.SYS, w0 = M.omega0(m, k);

// ---- step 0: natural period, every slider combination (s0readout, s0hint) ----
for (let mm = 0.25; mm <= 4 + 1e-9; mm += 0.25) for (let kk = 10; kk <= 80; kk += 5) {
  const r = M.free(mm, kk);
  ok(r.Tm !== null, `two upward crossings inside the 8 s window m=${mm} k=${kk}`);
  near(r.Tm / r.Tf, 1, 1e-4, `measured period = 2π√(m/k) m=${mm} k=${kk}`);
  const xmax = Math.max(...r.sim.x.map(Math.abs)); near(xmax, M.X0, 1e-4, 'no damping: amplitude stays 10 cm');
}
near(M.period0(4, 40) / M.period0(1, 40), 2, 1e-12, '4 × mass → 2 × period');
ok(M.period0(1, 80) < M.period0(1, 40), 'stiffer spring swings faster');
near(w0 / (2 * Math.PI), 1.007, 0.0005, 'f₀ ≈ 1.007 Hz for m = 1 kg, k = 40 N/m');
ok(M.X0 * 100 <= 12, 'release displacement fits the ±12 cm axis');

// ---- step 1: damping (s1e, s1readUnder/Free/Over, s1hint) ----
const bc = M.bCritical(m, k);
near(bc, 12.65, 0.01, 'critical damping 2√(mk) ≈ 12.6');
assert.equal(M.B_LIST.length, 9); checks++;
ok(Math.abs(M.B_LIST[7] - bc) < 1e-12, 'slider notch 7 is exactly critical');
for (const b of M.B_LIST) {
  const d = M.damped(b);
  if (b === 0) { near(d.ratioM, 1, 1e-6, 'no damping keeps 100%'); continue; }
  if (b < bc - 1e-9) {
    ok(d.under, 'underdamped ' + b);
    near(d.ratioM, d.ratioF, 2e-5, `measured peak ratio = e^(−bT/2m) for b=${b}`);
    near(d.envelope(d.tHalf), M.X0 / 2, 1e-12, 'half-life of the envelope');
    near(d.tHalf, 2 * m * Math.log(2) / b, 1e-12, 't½ = 2m ln2 / b');
    ok(d.crossings > 10, 'underdamped swings through 0 many times');
    // the curve hugs the envelope: every top sits on it, and |x| never strays beyond √(1+(γ/ω_d)²) of it
    const g = b / (2 * m), wdd = Math.sqrt(k / m - g * g), slack = Math.sqrt(1 + (g / wdd) ** 2);
    M.peaks(d.sim).forEach(p => near(p.x, d.envelope(p.t), 2e-5, 'top of a swing on the envelope b=' + b));
    d.sim.t.forEach((t, i) => ok(Math.abs(d.sim.x[i]) <= d.envelope(t) * slack + 1e-9, 'hugs the envelope'));
    if (b <= 1.6) { const wd = Math.sqrt(k / m - (b / (2 * m)) ** 2); ok(Math.abs(w0 / wd - 1) < 0.01, 'period changes < 1% for b ≤ 1.6'); }
  } else {
    ok(!d.under, 'not underdamped ' + b); assert.equal(d.crossings, 0, 'never crosses 0 at or above critical, b=' + b); checks++;
  }
}
// ratio shrinks monotonically as b grows (hint)
const ratios = M.B_LIST.slice(1, 7).map(b => M.damped(b).ratioF);
for (let i = 1; i < ratios.length; i++) ok(ratios[i] < ratios[i - 1], 'kept fraction falls with b');

// ---- step 2: driven from rest (s2e, s2done, s2hint) ----
near(M.staticX() * 100, 2.5, 1e-12, 'static displacement 2.5 cm');
near(Math.exp(-1), 0.37, 0.005, '“about 37% left every 2m/b”'); near(2 * m / M.B_DRIVE, 5, 1e-12, '2m/b = 5 s');
for (let i = 0; i <= 20; i++) {
  const r = Math.round((0.5 + i * 0.05) * 100) / 100, d = M.driven(r, M.B_DRIVE, 50);
  near(d.Am / d.A, 1, 0.01, `measured steady amplitude within 1% of formula at r=${r}`);
  ok(Math.max(...d.sim.x.map(Math.abs)) * 100 <= 45, 'whole run fits the ±45 cm axis, r=' + r);
}
const d1 = M.driven(1, M.B_DRIVE, 50);
near(d1.A * 100, 40, 1, '“about 40 cm” at r = 1'); near(d1.A / M.staticX(), 16, 0.5, '“about 16 times” the static displacement');
ok(M.driven(1.5, M.B_DRIVE, 50).A < M.staticX(), 'r = 1.5: smaller than static');

// ---- step 3: resonance curve (s3e, s3readout, s3hint) ----
for (const b of M.B_CURVES) {
  for (let r = 0.2; r <= 2.0001; r += 0.04) {
    const rr = Math.round(r * 100) / 100, d = M.driven(rr, b), A = d.A;
    ok(Math.abs(d.Am - A) <= Math.max(0.01 * A, 5e-4), `sweep dot on curve b=${b} r=${rr}: ${d.Am} vs ${A}`);
  }
  const pk = M.peak(b), wd = M.width(b), Q = M.Q(b);
  ok(pk.A * 100 <= 80, 'peak fits the 0–80 cm axis');
  near(pk.A / M.staticX(), Q, 0.02 * Q, 'peak ≈ Q × static');
  near(wd.dr * Q, 1, 0.02, 'width ≈ 1/Q');
  near(M.steady(m, k, b, wd.r1 * w0).A, pk.A / Math.SQRT2, 1e-9, 'width edges at peak/√2');
  ok(pk.r < 1, 'peak sits just left of r = 1');
}
near(M.peak(0.2).A / M.peak(0.4).A, 2, 0.01, 'b halved → peak doubled (quiz)');
near(M.width(0.2).dr / M.width(0.4).dr, 0.5, 0.01, 'b halved → width halved');
ok(M.peak(1.6).r < 0.99, 'b = 1.6 peak slides left');
for (const r of [0.2, 0.3, 0.4, 0.5, 1.5, 1.7, 2]) {
  const As = M.B_CURVES.map(b => M.steady(m, k, b, r * w0).A), spread = (Math.max(...As) - Math.min(...As)) / Math.max(...As);
  ok(spread < 0.05, `curves nearly coincide away from the peak r=${r}: ${spread}`);
}
near(M.steady(m, k, 0.4, 0.2 * w0).A * 100, 2.5, 0.15, 'slow pushing ≈ static 2.5 cm');

// ---- step 4: energy per cycle (s4e, s4readout, s4hint) ----
for (let r = 0.5; r <= 1.5001; r += 0.01) {
  const c = M.cycleWork(r);
  near(c.W, c.Wd, 1e-6 * Math.max(1, c.Wd), 'net work = energy burned by friction');
  near(c.W, c.Wformula, 1e-6, 'net work = πF₀A sin φ');
  near(c.Wd, Math.PI * M.B_DRIVE * c.Omega * c.A * c.A, 1e-6, 'friction burns πbΩA²');
}
const c1 = M.cycleWork(1);
near(c1.Wn, 0, 1e-12, 'r = 1: no negative work'); near(c1.phi * 180 / Math.PI, 90, 1e-9, 'r = 1: φ = 90°');
const c05 = M.cycleWork(0.5), c15 = M.cycleWork(1.5);
ok(Math.abs(c05.Wn) / c05.Wp > 0.8, 'r = 0.5: green and pink nearly equal');
ok(Math.abs(c15.Wn) / c15.Wp > 0.7, 'r = 1.5: large pink areas');
near(90 - c05.phi * 180 / Math.PI, 90, 5, 'r = 0.5: F and v peaks about a quarter cycle apart');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const key of zk) { assert.equal(ph(STRINGS.zh[key]), ph(STRINGS.en[key]), 'placeholders for ' + key); checks++; }
const NEUTRAL = new Set([]);
for (const key of zk) ok(NEUTRAL.has(key) || STRINGS.zh[key] !== STRINGS.en[key], 'zh text differs from en for ' + key);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const mm of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[mm[1]] !== undefined, 'missing key ' + mm[1]);
for (const mm of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[mm[1]] !== undefined, 'app key ' + mm[1]);
for (const id of ['m0', 'k0', 'play0', 'b1', 'play1', 'ratio2', 'play2', 'reset2', 'ratio3', 'sweep3', 'clear3', 'ratio4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(mm => mm[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const mm of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(mm[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/waves/resonance/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

// ---- layout wording and markup hygiene (added 2026-11-10) ----
{
  const htmlX = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/[左右]图|上半张图|下半张图|left chart|right chart|lower half of the picture/i.test(v), 'no position-based chart wording in ' + k);
  const ids = [...htmlX.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  ok(new Set(ids).size === ids.length, 'element ids are unique');
  ok(!htmlX.includes('canvas-label-guard'), 'no canvas-label-guard');
  ok(htmlX.includes('<!-- page-provenance -->') && htmlX.includes('../../../page-provenance.css'), 'provenance placeholder');
}
console.log(`PASS resonance core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
