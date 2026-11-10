'use strict';
// Series & parallel (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const range = (a, b, d) => { const out = []; for (let v = a; v <= b + 1e-9; v += d) out.push(Number(v.toFixed(6))); return out; };
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); assert.ok(m, 'slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const grid = id => { const s = slider(id); return range(s.min, s.max, s.step); };
ok(M.U === 12 && M.BULB === 6 && M.U * M.U / M.BULB === 24, '12 V battery, 6 Ω bulb = 24 W alone');

// ---- step 0: series ----
for (const r1 of grid('r10')) for (const r2 of grid('r20')) {
  const q = M.series([r1, r2]);
  near(q.R, r1 + r2, 1e-12, 'R = R1 + R2'); near(q.I, 12 / (r1 + r2), 1e-12, 'I = U/R');
  near(q.V[0] + q.V[1], 12, 1e-9, 'steps add to 12 V'); near(q.V[0] / q.V[1], r1 / r2, 1e-9, 'V1 : V2 = R1 : R2');
  near(q.steps[q.steps.length - 1], 0, 1e-9, 'potential returns to 0');
}
{ const a = M.series([4, 8]), b = M.series([4, 16]); ok(b.V[1] > a.V[1] && b.V[0] < a.V[0] && b.I < a.I, 's0hint: bigger R2 → its step grows, R1 shrinks, current falls'); }

// ---- step 1: parallel ----
for (const r1 of grid('r11')) for (const r2 of grid('r21')) {
  const q = M.parallel([r1, r2]);
  near(q.Ib[0], 12 / r1, 1e-12, 'branch 1'); near(q.Ib[1], 12 / r2, 1e-12, 'branch 2');
  near(q.I, q.Ib[0] + q.Ib[1], 1e-12, 'I = I1 + I2'); near(q.R, q.Rformula, 1e-9, '1/R = 1/R1 + 1/R2');
  ok(q.R < Math.min(r1, r2), 'R below either branch');
  ok(q.I <= 12 + 1e-9, 'bar axis 0..12 A holds the total');
}
{ const a = M.parallel([8, 12]), b = M.parallel([4, 12]); ok(b.Ib[0] > a.Ib[0] && b.Ib[1] === a.Ib[1] && b.I > a.I, 's1hint: smaller R1 → branch 1 up, branch 2 unchanged'); }

// ---- step 2: n bulbs ----
for (const n of grid('n2')) {
  const S = M.bulbs(n, 'series'), P = M.bulbs(n, 'parallel');
  near(S.R, 6 * n, 1e-12, 'series n × 6 Ω'); near(P.R, 6 / n, 1e-12, 'parallel 6/n Ω');
  near(S.rel, 1 / (n * n), 1e-12, 'series power falls as 1/n²'); near(P.each, 24, 1e-9, 'parallel bulbs stay at 24 W');
  near(P.I, 2 * n, 1e-12, 'parallel total current 2n A');
  ok(S.R <= 38 && P.R <= 38, 'resistance chart axis 0..38 Ω');
}
near(M.bulbs(2, 'series').rel, 0.25, 1e-12, 's2hint: a quarter of the power at n = 2');

// ---- step 3: unscrewing ----
const combos = [[1, 1, 1], [1, 0, 1], [0, 0, 0], [0, 1, 1], [1, 1, 0]].map(c => c.map(Boolean));
for (const p of combos) {
  const s = M.removeBulbs('series', p), q = M.removeBulbs('parallel', p), k = p.filter(Boolean).length;
  if (k < 3) { ok(s.I === 0 && s.lit.every(l => !l), 'series: any gap → all dark'); } else { near(s.I, 2 / 3 * 1, 1e-12, 'series 12/18 A'); near(s.each[0], 24 / 9, 1e-9, 'series each 8/3 W'); }
  near(q.I, 2 * k, 1e-12, 'parallel: 2 A per bulb in place');
  q.lit.forEach((l, i) => { ok(l === p[i], 'parallel lit = present'); if (l) near(q.each[i], 24, 1e-9, 'unchanged brightness'); });
}
near(M.removeBulbs('series', [true, true, true]).I * M.BULB, 4, 1e-9, 'note3SerAll: 4 V each');
ok(M.removeBulbs('parallel', [true, true, true]).I === 6 && M.removeBulbs('parallel', [true, false, true]).I === 4, 's3hint: 6 A → 4 A');

// ---- step 4: mixed ----
for (const r1 of grid('r14')) for (const r2 of grid('r24')) for (const r3 of grid('r34')) {
  const q = M.mixed(r1, r2, r3);
  near(q.V1 + q.V23, 12, 1e-9, 'voltage ledger'); near(q.I2 + q.I3, q.I, 1e-9, 'current ledger');
  ok(q.R23 < Math.min(r2, r3), 'R23 below both'); ok(q.I <= 4 + 1e-9, 'current bar axis 0..4 A');
  near(q.I2 * r2, q.I3 * r3, 1e-9, 'same voltage on both branches');
}
{ const a = M.mixed(4, 6, 12), b = M.mixed(4, 6, 4); ok(b.V23 < a.V23 && b.V1 > a.V1 && b.I3 > a.I3 && b.I2 < a.I2, 's4hint: smaller R3 → V23 down, V1 up, I3 up, I2 down'); }

// ---- step 5: household ----
const A = M.APPLIANCES.map(a => a.P / M.MAINS);
ok(!M.household([1, 0, 0, 0]).over && !M.household([0, 1, 0, 0]).over && M.household([1, 1, 0, 0]).over, 'kettle or heater alone fine, together trip');
near(A[0], 8.18, 0.005, 'kettle 8.18 A'); near(A[1], 9.09, 0.005, 'heater 9.09 A'); near(A[0] + A[1], 17.27, 0.005, 'both 17.27 A');
ok(!M.household([0, 1, 1, 1]).over && !M.household([1, 0, 1, 1]).over, 'cooker and lamp do not trip with one big appliance');
ok(M.household([1, 1, 1, 1]).total < 24, 'bar axis 0..24 A');
ok(/if \(M\.household\(s5\.on\)\.over\) s5\.msg = t\('st5Retrip'\)/.test(app), 'reset while overloaded trips again');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lg4V1', 'lg4V23']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '串联与并联 · 电流的分与合' : 'Series & Parallel · Splitting and Merging Current'), 'footer names model and original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left plot|right plot|left-hand|right-hand/i.test(v), 'no left/right plot wording in ' + k);

// ---- keys, controls, links ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['r10', 'r20', 'r11', 'r21', 'n2', 'modeSer', 'modePar', 'bulb1', 'bulb2', 'bulb3', 'r14', 'r24', 'r34', 'ap0', 'ap1', 'ap2', 'ap3', 'reset5', 'flow0', 'flow1', 'flow4', 'h5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('content="junior"'), 'stage junior');
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/circuits/series-parallel/index.html')) && html.includes('href="../../../physics/circuits/series-parallel/"'), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS series-parallel core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
