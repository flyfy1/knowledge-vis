'use strict';
// Feedback control (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1000) / 1000); return out; };
const N = Math.round(M.T_END / M.DT) + 1;
const W = M.PLANT.m * M.PLANT.g;

// ---- simulator sanity ----
{
  const s = M.simulate({ kp: 20, ki: 5, kd: 6, r: 5 });
  ok(s.z.length === N && s.t[N - 1] === 10, '10 s at 0.01 s');
  for (let k = 0; k < N; k++) ok(s.u[k] >= 0 && s.u[k] <= 30 && s.z[k] >= 0, 'thrust within 0–30 N and drone above ground');
  // no thrust → stays on the ground
  ok(M.simulate({ r: 5 }).z.every(v => v === 0), 'no thrust: stays on the ground');
  // pure hover thrust at the weight keeps a grounded drone on the ground (needs > m·g to lift)
  ok(M.simulate({ openLoop: [W], r: 5 }).z.every(v => v === 0), 'thrust = weight does not lift off');
  // controller terms add up to the commanded thrust (before clamping)
  for (let k = 0; k < N; k++) if (!s.sat[k]) ok(Math.abs(s.uP[k] + s.uI[k] + s.uD[k] - s.u[k]) < 1e-9, 'u = P + I + D when not saturated');
  // the D term uses the measured rate: no spike at t = 0 when the setpoint jumps
  ok(s.uD[0] === 0, 'no derivative kick at t = 0');
  // the integral is the running sum of the measured error
  let acc = 0; for (let k = 0; k < N; k++) { acc += (5 - s.ym[k]) * M.DT; ok(Math.abs(acc - s.integ[k]) < 1e-9, 'integral = Σ e·dt'); }
  // the same seed gives the same noise
  const a = M.simulate({ kp: 10, kd: 3, r: 5, noise: 0.005, seed: 3 }), b = M.simulate({ kp: 10, kd: 3, r: 5, noise: 0.005, seed: 3 });
  ok(a.u.every((v, i) => v === b.u[i]), 'seeded noise is repeatable');
  const g = M.gaussian(20000, 0.005, 3); const sd = Math.sqrt(g.reduce((q, v) => q + v * v, 0) / g.length);
  ok(Math.abs(sd - 0.005) < 0.0002, 'noise σ = 5 mm');
}

// ---- step 0: open-loop replay vs feedback ----
const base = M.simulate({ ...M.PRESETS.step0 }), rec = Array.from(base.u);
{
  const same = M.simulate({ openLoop: rec, m: 1, r: 5 });
  ok(same.z.every((v, i) => Math.abs(v - base.z[i]) < 1e-12), 'm = 1: replay reproduces the recorded flight exactly');
  let recHover = 0; for (let k = N - 100; k < N; k++) recHover += rec[k]; recHover /= 100;
  ok(Math.abs(recHover - W) < 0.05, 'recorded hover thrust ≈ 9.8 N: ' + recHover);
  // heavier (≥ 1.1 kg): replay hits the ground; lighter (≤ 0.9 kg): it leaves the 12 m chart
  for (const m of range(0.7, 1.3, 0.05)) {
    const ol = M.simulate({ openLoop: rec, m, r: 5 }), cl = M.simulate({ ...M.PRESETS.step0, m }), mc = M.metrics(cl);
    if (m >= 1.1 - 1e-9) { let landed = false; for (let k = 100; k < N; k++) if (ol.z[k] === 0) landed = true; ok(landed, 'heavier replay lands, m=' + m); }
    if (m <= 0.9) ok(ol.z.some(v => v > 12), 'lighter replay leaves the chart, m=' + m);
    ok(Math.abs(mc.finalZ - 5) < 0.05, 'feedback returns to ≈ 5 m for m=' + m);
  }
}

// ---- step 1: P only — sag m·g/Kp, more bobbing with larger Kp ----
{
  let prevPeak = -1, prevCross = -1;
  for (const kp of range(3, 40, 1)) {
    const s = M.simulate({ kp, r: 5 }), mt = M.metrics(s);
    ok(Math.abs(mt.sag - W / kp) < 0.05, `sag ≈ m·g/Kp at Kp=${kp}: ${mt.sag} vs ${W / kp}`);
    ok(Math.abs(tailMean(s.u) - W) < 0.6, 'P-only run ends on the m·g line, Kp=' + kp);
    if ([5, 10, 20, 40].includes(kp)) { ok(mt.peak > prevPeak && M.crossings(s) >= prevCross, 'peaks and crossings grow with Kp'); prevPeak = mt.peak; prevCross = M.crossings(s); }
  }
  const m5 = M.metrics(M.simulate({ kp: 5, r: 5 }));
  ok(Math.abs(m5.sag - 2) < 0.1 && m5.overshoot === 0, 'Kp = 5 stops about 2 m below, smoothly');
}
function tailMean(arr) { let s = 0; for (let k = N - 100; k < N; k++) s += arr[k]; return s / 100; }

// ---- step 2: PD — overshoot falls, sag unchanged, noise amplified by Kd ----
{
  let prevOs = Infinity, prevJ = -1;
  for (const kd of range(0, 10, 0.5)) {
    const s = M.simulate({ kp: 20, kd, r: 5 }), mt = M.metrics(s);
    ok(Math.abs(mt.sag - W / 20) < 0.01, 'sag stays m·g/Kp ≈ 0.49 for Kd=' + kd);
    ok(mt.overshoot <= prevOs + 1e-9, 'overshoot never grows with Kd'); prevOs = mt.overshoot;
    if (kd >= 6) ok(mt.overshoot === 0, 'Kd ≥ 6 does not pass the target');
    if (kd === 4) ok(mt.overshoot > 0, 'Kd = 4 still passes the target');
    const sn = M.simulate({ kp: 20, kd, r: 5, noise: 0.005, seed: 3 }), j = M.thrustJitter(sn);
    if (kd >= 0.5) { ok(j > prevJ, 'thrust jitter grows with Kd'); prevJ = j; }
    ok(Math.abs(M.metrics(sn).peak - mt.peak) < 0.15, 'noise barely changes the altitude curve');
    if (kd >= 1) ok(j > M.thrustJitter(s) + 0.3, 'noise adds thrust jitter, Kd=' + kd);
  }
  ok(M.crossings(M.simulate({ kp: 20, kd: 0, r: 5 })) > M.crossings(M.simulate({ kp: 20, kd: 4, r: 5 })), 'fewer crossings with D');
}

// ---- step 3: I term removes the sag; too much I overshoots ----
{
  const s0 = M.metrics(M.simulate({ ...M.PRESETS.step3, ki: 0 }));
  ok(Math.abs(s0.finalZ - 4.51) < 0.01, 'Ki = 0 rests at about 4.51 m');
  for (const [ki, lo, hi] of [[2, 7.5, 8.8], [5, 9.5, 10.5]]) {
    const s = M.simulate({ ...M.PRESETS.step3, ki }), e = N - 1;
    ok(s.uI[e] > lo && s.uI[e] < hi, `Ki=${ki}: I term at 10 s (${s.uI[e]})`);
    ok(Math.abs(M.metrics(s).sag) < 0.1, 'Ki = ' + ki + ' brings the altitude back near 5 m');
  }
  const q5 = M.simulate({ ...M.PRESETS.step3, ki: 5 }), e = N - 1;
  ok(Math.abs(q5.uP[e]) < 0.6 && Math.abs(q5.uD[e]) < 0.2, 'quiz: P and D near 0 at 10 s with Ki = 5');
  ok(Math.abs(q5.u[e] - W) < 0.3, 'quiz: total thrust ≈ 9.8 N');
  let prev = -1;
  for (const ki of [5, 10, 15, 20]) { const o = M.metrics(M.simulate({ ...M.PRESETS.step3, ki })).overshoot; ok(o > prev, 'overshoot grows with Ki'); prev = o; }
  // over-integration shows up as negative error area
  ok(M.simulate({ ...M.PRESETS.step3, ki: 20 }).e.some(v => v < -0.5), 'Ki = 20 runs above the target');
}

// ---- step 4: windup ----
{
  const g = M.PRESETS.step4;
  for (const r of range(1, 2, 0.5)) {
    const sp = M.simulate({ ...g, r }), sc = M.simulate({ ...g, r, antiWindup: true });
    ok(!sp.sat.some((v, k) => v && sp.u[k] >= 30 - 1e-9), 'r ≤ 2: never at the 30 N limit, r=' + r);
    ok(sp.z.every((v, i) => Math.abs(v - sc.z[i]) < 1e-12), 'r ≤ 2: curves coincide');
  }
  let prevOs = -1, prevSat = -1;
  for (const r of [4, 6, 8, 9]) {
    const sp = M.simulate({ ...g, r }), sc = M.simulate({ ...g, r, antiWindup: true }), mp = M.metrics(sp), mc = M.metrics(sc);
    ok(mp.overshoot > prevOs && mp.satT > prevSat, 'plain overshoot and saturated time grow with r'); prevOs = mp.overshoot; prevSat = mp.satT;
    ok(Math.max(...sp.integ) > Math.max(...sc.integ) + 0.5, 'plain integral climbs higher');
    ok(mp.overshoot > mc.overshoot * 2, 'plain overshoots further');
    ok(mc.overshoot < 6.5, 'clamped overshoot stays small: ' + mc.overshoot);
    ok(mc.settle < mp.settle, 'clamped settles sooner');
  }
}

// ---- step 5: tuning lab ----
const lab = (p, aw = true) => { const s = M.simulate({ ...p, r: 5, noise: 0.005, seed: 3, antiWindup: aw }), mt = M.metrics(s), j = M.thrustJitter(s); return { mt, j, ok: M.meetsSpec(mt, j) }; };
{
  const ge = lab(M.PRESETS.gentle); ok(!ge.ok.st && !ge.ok.ss, 'gentle: too slow, still off at the end');
  const s3 = lab({ ...M.PRESETS.step3, ki: 5 }); ok(!s3.ok.j && s3.ok.os, 'step-3 gains: jitter fails (Kd = 6)');
  const ag = lab(M.PRESETS.aggressive); ok(!ag.ok.os, 'aggressive: overshoot fails');
  const ex = lab({ kp: 10, ki: 4, kd: 3.5 }); ok(ex.ok.os && ex.ok.st && ex.ok.ss && ex.ok.j, 'example Kp=10, Ki=4, Kd=3.5 passes all four');
  // "more than one combination works" — count passing slider grid points
  let pass = 0;
  for (let kp = 2; kp <= 40; kp += 2) for (let ki = 0; ki <= 20; ki += 1) for (const kd of [2, 2.5, 3, 3.5, 4]) { const q = lab({ kp, ki, kd }); if (q.ok.os && q.ok.st && q.ok.ss && q.ok.j) pass++; }
  ok(pass > 10, 'many passing combinations: ' + pass);
  // spec text in both languages matches SPEC
  for (const l of ['zh', 'en']) ok(STRINGS[l].s5e.includes('5%') && STRINGS[l].s5e.includes('3 s') && STRINGS[l].s5e.includes('0.05 m') && STRINGS[l].s5e.includes('3 N') && STRINGS[l].s5e.includes('4.75–5.25 m'), 'spec text ' + l);
  ok(M.SPEC.overshoot === 5 && M.SPEC.settle === 3 && M.SPEC.sag === 0.05 && M.SPEC.jitter === 3, 'SPEC values');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['secs']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(([a-z0-9.]+) \? '([A-Za-z0-9]+)' : '([A-Za-z0-9]+)'/g)) { ok(STRINGS.zh[m[2]] !== undefined && STRINGS.zh[m[3]] !== undefined, 'ternary keys'); }
for (const id of ['m0', 'fly0', 'kp1', 'fly1', 'clear1', 'kd2', 'noise2', 'fly2', 'ki3', 'fly3', 'r4', 'fly4', 'kp5', 'ki5', 'kd5', 'preGentle', 'preStep3', 'preAggr', 'aw5', 'clear5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../engineering/control/pid-control/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS pid-control core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
