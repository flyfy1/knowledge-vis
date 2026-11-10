'use strict';
// Acid–base equilibrium (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- the quadratic solves Ka = x(x + s)/(c − x) on every slider grid ----
for (let lk = -10; lk <= 1.0001; lk += 0.05) for (const c of [1e-5, 1e-3, 0.1, 1]) for (const s of [0, 0.05, 0.2]) {
  const ka = Math.pow(10, lk), e = M.equilibrium(ka, c, s);
  near(e.Q / ka, 1, 1e-9, `Q = Ka at equilibrium (ka ${ka}, c ${c}, s ${s})`);
  ok(e.x > 0 && e.x < c, 'split amount between 0 and c');
}

// ---- water can be ignored on every case the page shows ([H⁺] ≥ 1e-6, error < 1 %) ----
let worst = 0;
const checkWater = (ka, c, s) => { const e = M.equilibrium(ka, c, s), full = M.fullH(ka, c, s); ok(e.H >= 1e-6, `[H+] ≥ 1e-6 (ka ${ka}, c ${c}, s ${s})`); worst = Math.max(worst, Math.abs(full / e.H - 1)); };
for (let lk = -10; lk <= 1.0001; lk += 0.05) checkWater(Math.pow(10, lk), 0.1, 0);           // step 1
for (const k of ['acetic', 'hf']) for (let lc = -5; lc <= 0.0001; lc += 0.05) checkWater(M.ACIDS[k].ka, Math.pow(10, lc), 0); // step 2 curves
for (const k of ['acetic', 'hf']) for (let lc = -4.5; lc <= 0.0001; lc += 0.05) checkWater(M.ACIDS[k].ka, Math.pow(10, lc - 1), 0); // step 2 slider (−4.5..0) + its 10× dilution readout
for (let s = 0; s <= 0.2001; s += 0.025) checkWater(0.01, 0.1, s);                               // step 3
checkWater(M.ACIDS.acetic.ka, 0.1, 0.1);                                                          // step 3 acetic line
for (const ka of [0.0025, 0.005, 0.01, 0.02, 0.04]) checkWater(ka, 0.1, 0);                      // step 4
ok(worst < 0.01, 'ignoring water costs < 1 % everywhere: ' + worst);
// … but it would not for the weakest acid made more dilute (why the slider ranges stop where they do)
ok(Math.abs(M.fullH(M.ACIDS.hcn.ka, 1e-5) / M.equilibrium(M.ACIDS.hcn.ka, 1e-5).H - 1) > 0.5, 'HCN at 1e-5 M would need water');

// ---- step 0: toy acid ≈ a quarter split; the stochastic ledger settles on the analytic α from both ends ----
const TOY = { ka: 0.01, c: 0.1, kf: 0.15 }, eqToy = M.equilibrium(TOY.ka, TOY.c);
ok(eqToy.alpha > 0.24 && eqToy.alpha < 0.3, 'about a quarter split: ' + eqToy.alpha);
near(M.ACIDS.hclo2.ka, TOY.ka, 0.0015, 'toy acid Ka close to HClO2');
for (const start of ['intact', 'split']) for (const seed of [3, 7, 21]) {
  const r = M.simAverage({ N: 200, ...TOY, start, seed }, 1 / 30, 900, 15000);
  near(r.alpha, eqToy.alpha, 0.01, `ledger average from ${start} (seed ${seed})`);
  near(r.fwdRate / r.revRate, 1, 0.03, 'forward = reverse events at equilibrium');
}
// from all-intact the forward rate starts high and the reverse rate at zero; from all-split the reverse dominates
{
  const a = M.makeSim({ N: 200, ...TOY, start: 'intact', seed: 3 }); let f = 0, r = 0;
  for (let i = 0; i < 15; i++) { const e = M.stepSim(a, 1 / 30); f += e.fwd; r += e.rev; } ok(f > 3 * r, 'intact start: forward wins early');
  const b = M.makeSim({ N: 200, ...TOY, start: 'split', seed: 7 }); f = 0; r = 0;
  for (let i = 0; i < 15; i++) { const e = M.stepSim(b, 1 / 30); f += e.fwd; r += e.rev; } ok(r > 3 * f, 'split start: reverse wins early');
}
// 20 s (the reduced-motion jump) is long enough to be at equilibrium
ok(M.relaxTime(TOY.ka, TOY.c, TOY.kf, 0, 0.01).t < 12, 'toy acid within 1 % of α well before 20 s');

// ---- step 1: Ka at c = 0.10 ----
near(M.equilibrium(1, 0.1).alpha, 0.916, 0.001, 'pKa 0 → α ≈ 91.6 %');
for (let p = -1; p <= 0; p += 0.05) ok(M.equilibrium(Math.pow(10, -p), 0.1).alpha > 0.9, 'pKa ≤ 0 → α > 90 %');
for (let p = 3; p <= 8.0001; p += 0.05) {
  const e1 = M.equilibrium(Math.pow(10, -p), 0.1), e2 = M.equilibrium(Math.pow(10, -p - 2), 0.1);
  const ratio = e2.alpha / e1.alpha, dph = e2.pH - e1.pH;
  ok(ratio > 0.09 && ratio < 0.115, `pKa +2 → α about a tenth (pKa ${p.toFixed(2)}: ${ratio})`);
  ok(dph > 0.95 && dph < 1.06, `pKa +2 → pH about +1 (${dph})`);
}
for (let lk = -10; lk < 0.9999; lk += 0.05) ok(M.equilibrium(Math.pow(10, lk + 0.05), 0.1).alpha > M.equilibrium(Math.pow(10, lk), 0.1).alpha, 'α rises with Ka');
const pH01 = { hclo2: M.equilibrium(M.ACIDS.hclo2.ka, 0.1).pH, hcn: M.equilibrium(M.ACIDS.hcn.ka, 0.1).pH };
ok(pH01.hclo2 < 1.6 && pH01.hcn > 5, 'title claim: one acid near pH 1(.5), another past 5 at 0.10 M');
ok(M.equilibrium(Math.pow(10, -10), 0.1).alpha > 1e-5, 'log α axis (0.001 %–100 %) holds the whole Ka range');
ok(M.equilibrium(Math.pow(10, -10), 0.1).pH < 6, 'pH axis 0–6 holds the whole Ka range');
// the slider default and the acid buttons sit on the 0.05 grid closely enough for the pressed state (±0.026)
for (const k of Object.keys(M.ACIDS)) { const lk = Math.log10(M.ACIDS[k].ka); ok(lk >= -10 && lk <= 1, 'acid on slider ' + k); }
ok(Math.abs(Math.log10(M.ACIDS.acetic.ka) - -4.75) < 0.026, 'default slider = acetic acid');

// ---- step 2: dilution ----
for (const k of ['acetic', 'hf']) {
  const ka = M.ACIDS[k].ka;
  for (let lc = -5; lc < -0.0001; lc += 0.05) {
    const lo = M.equilibrium(ka, Math.pow(10, lc)), hi = M.equilibrium(ka, Math.pow(10, lc + 0.05));
    ok(lo.alpha > hi.alpha, 'more dilute → larger α');
    ok(lo.pH > hi.pH, 'more dilute → higher pH');
    // weak acid pH rises less than a strong acid's on every tenfold dilution
    const e10 = M.equilibrium(ka, Math.pow(10, lc) / 10); ok(e10.pH - lo.pH < 1 && e10.pH - lo.pH > 0.49, 'tenfold dilution raises pH by 0.5–1');
    // Q drops to exactly Ka/10 the instant of a tenfold dilution
    near(((lo.H / 10) * (lo.A / 10)) / (lo.HA / 10) / ka, 0.1, 1e-9, 'Q = Ka/10 just after dilution');
    // shortcut always overestimates, and is within 5 % while α < 0.1
    const ap = M.alphaApprox(ka, Math.pow(10, lc)); ok(ap >= lo.alpha, 'shortcut overestimates');
    if (lo.alpha < 0.1) ok((ap - lo.alpha) / lo.alpha < 0.055, 'shortcut close while α small');
  }
  ok(M.equilibrium(ka, Math.pow(10, -4.5)).alpha > 0.5, k + ' at the most dilute slider setting is mostly split');
  near(Math.pow(10, -4.5), 3.16e-5, 1e-7, 'slider minimum ≈ 3×10⁻⁵');
}
ok(M.equilibrium(M.ACIDS.hf.ka, 1e-3).alpha > 2 * M.equilibrium(M.ACIDS.acetic.ka, 1e-3).alpha, 'HF approaches 100 % sooner');
// quiz: 0.10 → 0.0010 M acetic acid raises pH by about 1 (about half the strong-acid 2)
{
  const e1 = M.equilibrium(M.ACIDS.acetic.ka, 0.1), e2 = M.equilibrium(M.ACIDS.acetic.ka, 0.001), d = e2.pH - e1.pH;
  ok(d > 0.95 && d < 1.1, 'quiz: pH rises about 1: ' + d);
  ok(Math.abs(d - 1) < Math.abs(d - 2) && Math.abs(d - 1) < Math.abs(d), 'answer b is the closest option');
  ok(e2.alpha / e1.alpha > 9 && e2.alpha / e1.alpha < 10.5, 'α grows ≈10× (dilution undoes about half on the log scale)');
}

// ---- step 3: common ion ----
for (let s = 0; s < 0.2; s += 0.025) {
  const lo = M.equilibrium(TOY.ka, TOY.c, s), hi = M.equilibrium(TOY.ka, TOY.c, s + 0.025);
  ok(hi.alpha < lo.alpha && hi.pH > lo.pH, 'more common ion → smaller α, higher pH');
  ok(M.qAfterChange(TOY.ka, TOY.c, s, s + 0.025) / TOY.ka > 1, 'adding A⁻ → Q > Ka');
  ok(M.qAfterChange(TOY.ka, TOY.c, s + 0.025, s) / TOY.ka < 1, 'removing A⁻ → Q < Ka');
}
near(M.qAfterChange(TOY.ka, TOY.c, 0, 0) / TOY.ka, 1, 1e-9, 'no change → Q = Ka');
for (const [s, seed] of [[0.05, 4], [0.1, 5], [0.2, 6]]) {
  const extra = Math.round(s / TOY.c * 200);
  const r = M.simAverage({ N: 200, ...TOY, extra, seed }, 1 / 30, 900, 15000);
  near(r.alpha, M.equilibrium(TOY.ka, TOY.c, s).alpha, 0.01, 'ledger with common ion ≈ analytic α at s = ' + s);
}
ok(Math.round(0.2 / TOY.c * 200) === 400, 'strip holds at most 400 dots');
{
  const a0 = M.equilibrium(M.ACIDS.acetic.ka, 0.1, 0), a1 = M.equilibrium(M.ACIDS.acetic.ka, 0.1, 0.1);
  near(a0.pH, 2.88, 0.01, 'acetic 0.1 M pH'); near(a1.pH, 4.74, 0.01, 'acetic + acetate pH ≈ pKa');
  ok(a1.alpha < a0.alpha / 50, 'common ion cuts acetic α by > 50×');
}

// ---- step 4: Ka is a ratio; speed changes timing, not the end point ----
const SPEEDS = [0.5, 1, 2, 4, 8], KAS = [0.0025, 0.005, 0.01, 0.02, 0.04];
const tA = M.relaxTime(TOY.ka, TOY.c, TOY.kf).t;
for (const sp of SPEEDS) {
  const r = M.relaxTime(TOY.ka, TOY.c, TOY.kf * sp);
  near(r.t * sp, tA, 0.01, 'time scales exactly with 1/speed ×' + sp);
  near(M.odeAlpha(TOY.ka, TOY.c, TOY.kf * sp, 0, 60), eqToy.alpha, 1e-4, 'same end point at speed ×' + sp);
  for (const kb of KAS) ok(M.relaxTime(kb, TOY.c, TOY.kf * sp).t < 15, `B reaches 90 % within the 15 s run (Ka ${kb}, ×${sp})`);
}
for (let i = 1; i < KAS.length; i++) ok(M.equilibrium(KAS[i], 0.1).alpha > M.equilibrium(KAS[i - 1], 0.1).alpha, 'Ka changes the end point');
for (const kb of KAS) ok(M.equilibrium(kb, 0.1).alpha < 0.6, 'end points fit the 0–60 % axis');
// the stochastic race lands on the analytic levels (seeded 400-molecule groups)
for (const sp of [1, 4]) {
  const r = M.simAverage({ N: 400, ...TOY, kf: TOY.kf * sp, seed: 32 }, 1 / 30, 300, 9000);
  near(r.alpha, eqToy.alpha, 0.01, 'race group at speed ×' + sp);
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['c1ph', 'c2ph']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '酸碱平衡 · 分子在两边来回走' : 'Acid–Base Equilibrium · Molecules Move Both Ways'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right chart references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['c0alpha', 'c0rate', 'qkUp', 'qkDown', 'vSame', 'vSpeed', 'vKa', 'vBoth', 'quizRight', 'quizWrong', 'acidAcetic', 'acidHF']) ok(app.includes(`'${k}'`), 'app uses ' + k);
for (const id of ['intact0', 'split0', 'pause0', 'ka1', 'lc2', 'acid2acetic', 'acid2hf', 'checkQuiz', 's3', 'reset3', 'pause3', 'sp4', 'kb4', 'rerun4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
hrefs.push('../../../chemistry/solutions/buffer-capacity/#step1'); // built in app.js (r3b)
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/solutions/acid-base-equilibrium/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS acid-base-equilibrium core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · worst water error ${(worst * 100).toFixed(3)}%`);
