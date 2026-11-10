'use strict';
// Robot-arm kinematics (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const D = M.DEG;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- arm constants quoted in the text ----
ok(M.ARM.l1 === 1.0 && M.ARM.l2 === 0.6, 'l1 = 1.0 m, l2 = 0.6 m');
both('s0e', '1.0 m'); both('s0e', '0.6 m'); both('s0hint', '0.6 m');
const R = M.reach();
near(R.rin, 0.4, 1e-12, 'inner radius 0.4'); near(R.rout, 1.6, 1e-12, 'outer radius 1.6');
both('s2far', '1.6 m'); both('s2near', '0.4 m'); both('s5out', '1.6 m'); both('s1hint', '1.6 m');

// ---- step 0: forward kinematics = sum of two link vectors; r depends on θ2 only ----
for (let a1 = -180; a1 <= 180; a1 += 15) for (let a2 = -180; a2 <= 180; a2 += 15) {
  const p = M.fk(a1 * D, a2 * D);
  near(Math.hypot(p.ex, p.ey), 1, 1e-12, 'link 1 length');
  near(Math.hypot(p.x - p.ex, p.y - p.ey), 0.6, 1e-12, 'link 2 length');
  near(Math.hypot(p.x, p.y), M.radiusOf(a2 * D), 1e-12, 'r from law of cosines (θ2 only)');
}

// ---- step 1: workspace ring; probe solutions ----
for (let l2 = 0.2; l2 <= 1.0001; l2 += 0.1) {
  const L = { l1: 1, l2 }, Rr = M.reach(L);
  let lo = Infinity, hi = 0;
  for (let a = -180; a <= 180; a += 0.25) { const r = M.radiusOf(a * D, L); lo = Math.min(lo, r); hi = Math.max(hi, r); }
  near(lo, Rr.rin, 1e-9, 'min r = |l1 − l2|'); near(hi, Rr.rout, 1e-12, 'max r = l1 + l2');
}
near(M.reach({ l1: 1, l2: 1 }).rin, 0, 1e-12, 'l2 = l1 → hole closes (s1hint)');
both('s1hint', '1.0 m');
// two θ2 lines inside the ring, ±a symmetric
for (let rho = 0.42; rho < 1.6; rho += 0.02) {
  const c = (rho * rho - 1 - 0.36) / 1.2; ok(c > -1 && c < 1, 'interior radius has two θ2 values');
  near(M.radiusOf(Math.acos(c)), rho, 1e-12, '+a gives ρ'); near(M.radiusOf(-Math.acos(c)), rho, 1e-12, '−a gives ρ');
}

// ---- step 2: closed-form IK round-trips over a fine grid; mirror symmetry; reachability exactly the ring ----
let maxErr = 0, nReach = 0;
for (let x = -1.8; x <= 1.8001; x += 0.02) for (let y = -1.8; y <= 1.8001; y += 0.02) {
  const s = M.ik(x, y), r = Math.hypot(x, y);
  const inside = r <= 1.6 + 1e-12 && r >= 0.4 - 1e-12;
  ok(s.reachable === inside, `reachable iff 0.4 ≤ r ≤ 1.6 at (${x.toFixed(2)}, ${y.toFixed(2)})`);
  if (!s.reachable) continue; nReach++;
  for (const q of s.sols) { const p = M.fk(q.t1, q.t2); maxErr = Math.max(maxErr, Math.hypot(p.x - x, p.y - y)); }
  ok(s.sols[0].t2 >= -1e-12 && s.sols[1].t2 <= 1e-12, 'A has θ2 ≥ 0, B has θ2 ≤ 0');
  // mirror: the two elbows are reflections across the base–target line
  const e0 = M.fk(s.sols[0].t1, s.sols[0].t2), e1 = M.fk(s.sols[1].t1, s.sols[1].t2), u = [x / r, y / r];
  near(e0.ex * u[0] + e0.ey * u[1], e1.ex * u[0] + e1.ey * u[1], 1e-9, 'elbows mirror (along)');
  near(-e0.ex * u[1] + e0.ey * u[0], e1.ex * u[1] - e1.ey * u[0], 1e-9, 'elbows mirror (across)');
}
ok(maxErr < 1e-12, 'IK round-trip error < 1e-12 m: ' + maxErr);
ok(nReach > 1000, 'many reachable grid points');
// on the rim the solutions coincide
{ const s = M.ik(1.6, 0); near(s.sols[0].t2, 0, 1e-9, 'rim: θ2 = 0'); near(s.sols[1].t2, 0, 1e-9, 'rim: θ2 = 0 (B)'); }

// ---- step 3: Jacobian = finite differences; columns perpendicular as claimed; gap ∝ Δt² ----
for (let a1 = -180; a1 <= 180; a1 += 30) for (let a2 = -180; a2 <= 180; a2 += 30) {
  const t1 = a1 * D, t2 = a2 * D, J = M.jac(t1, t2), h = 1e-6, p = M.fk(t1, t2);
  const p1 = M.fk(t1 + h, t2), p2 = M.fk(t1, t2 + h);
  near(J[0][0], (p1.x - p.x) / h, 1e-5, 'J col1 x'); near(J[1][0], (p1.y - p.y) / h, 1e-5, 'J col1 y');
  near(J[0][1], (p2.x - p.x) / h, 1e-5, 'J col2 x'); near(J[1][1], (p2.y - p.y) / h, 1e-5, 'J col2 y');
  near(J[0][0] * p.x + J[1][0] * p.y, 0, 1e-12, 'J1 ⟂ base→hand'); near(Math.hypot(J[0][0], J[1][0]), Math.hypot(p.x, p.y), 1e-12, '|J1| = r');
  near(J[0][1] * (p.x - p.ex) + J[1][1] * (p.y - p.ey), 0, 1e-12, 'J2 ⟂ elbow→hand'); near(Math.hypot(J[0][1], J[1][1]), 0.6, 1e-12, '|J2| = l2');
  near(M.det(J), 0.6 * Math.sin(t2), 1e-12, 'det J = l1 l2 sin θ2');
  const sv = M.svd2(J); near(sv.s1 * sv.s2, Math.abs(M.det(J)), 1e-9, 'σ1σ2 = |det J|');
}
{ // default pose: halving Δt cuts the gap to about a quarter (s3hint)
  const t1 = 30 * D, t2 = 60 * D, w = [0.6, 0.8], J = M.jac(t1, t2), v = M.mulv(J, w), p = M.fk(t1, t2);
  const gap = dt => { const q = M.fk(t1 + w[0] * dt, t2 + w[1] * dt); return Math.hypot(q.x - p.x - v[0] * dt, q.y - p.y - v[1] * dt); };
  for (let dt = 0.1; dt <= 1.0001; dt += 0.05) { const r = gap(dt) / gap(dt / 2); ok(r > 3.6 && r < 4.05, `gap ratio at Δt=${dt.toFixed(2)}: ${r}`); }
  for (const l of ['zh', 'en']) ok(/1\/4|a quarter/.test(STRINGS[l].s3hint), 's3hint quotes 1/4');
}

// ---- step 4: singularities; required joint speed quoted in the hint ----
const radial = a2 => { const t1 = 30 * D, t2 = a2 * D, u = M.radialDir(t1, t2); return M.jointSpeedFor(t1, t2, [0.2 * u[0], 0.2 * u[1]]); };
for (const a of [0, 180, -180]) { ok(M.svd2(M.jac(30 * D, a * D)).s2 < 1e-7, 'σ2 = 0 at θ2 = ' + a); }
ok(radial(0) === null && radial(180) === null, 'no finite joint speed at a singularity');
for (let a = 1; a <= 179; a++) {
  const w = radial(a); ok(w !== null, 'finite away from singularity');
  // the joint speeds really produce 0.2 m/s radially
  const J = M.jac(30 * D, a * D), v = M.mulv(J, w), u = M.radialDir(30 * D, a * D);
  near(v[0], 0.2 * u[0], 1e-9, 'radial vx'); near(v[1], 0.2 * u[1], 1e-9, 'radial vy');
  // "roughly 1/sin θ2": |ω| · sin θ2 stays within a narrow band near θ2 → 0
  if (a <= 30) { const k = Math.hypot(...w) * Math.sin(a * D); ok(k > 0.5 && k < 0.6, `|ω| sin θ2 ≈ const at ${a}: ${k}`); }
}
const w10 = Math.hypot(...radial(10)), w2 = Math.hypot(...radial(2));
ok(w10.toFixed(1) === '3.3' && w2.toFixed(1) === '16.3', `hint values ${w10} ${w2}`);
// σ1 grows (between θ2 = 90° and 1°) while σ2 → 0
{ const a = M.svd2(M.jac(0, 90 * D)), b = M.svd2(M.jac(0, 1 * D)); ok(b.s1 > a.s1 && b.s2 < 0.01, 'σ1 grows while σ2 → 0'); }

// ---- step 5: Newton vs damped least squares ----
const G = [0, 30 * D];
const nw = M.ikRun(G, [0.9, 0.9], 0, 15);
ok(M.firstBelow(nw, 1e-6) === 7, 'Newton first below 1e-6 after iteration 7');
ok(nw[5].err > 1e-3 && nw[5].err < 3e-3 && nw[6].err > 1e-6 && nw[6].err < 3e-6 && nw[7].err > 1e-12 && nw[7].err < 4e-12, 'quoted e5, e6, e7');
// exponent roughly doubles from 5 → 6 → 7
{ const e = [5, 6, 7].map(i => -Math.log10(nw[i].err)); ok(e[1] / e[0] > 1.8 && e[1] / e[0] < 2.3 && e[2] / e[1] > 1.8 && e[2] / e[1] < 2.3, 'exponent doubles ' + e); }
const dl = M.ikRun(G, [0.9, 0.9], 0.3, 15);
for (let i = 5; i < 15; i++) { const r = dl[i].err / dl[i + 1].err; ok(r > 2.9 && r < 3.3, `λ = 0.3 shrinks ~3× per step (${i}: ${r})`); }
ok(dl[15].err > 1e-9, 'λ = 0.3 slower than Newton');
const outN = M.ikRun(G, [1.5, 1.0], 0, 15), outD = M.ikRun(G, [1.5, 1.0], 0.3, 15);
ok(Math.max(...outN.map(h => h.err)) > 2 * outN[0].err, 'Newton jumps about when out of reach');
const gapOut = Math.hypot(1.5, 1.0) - 1.6;
near(outD[15].err, gapOut, 1e-3, 'damped settles at the closest point');
ok(outD[15].err.toFixed(2) === '0.20', 'quoted 0.20 m');
near(M.wrap(outD[15].t2), 0, 1e-3, 'damped: arm straight');
near(Math.atan2(outD[15].y, outD[15].x), Math.atan2(1.0, 1.5), 1e-3, 'damped: pointing at the target');
// presets match their labels
both('preIn', '(0.9, 0.9)'); both('preOut', '(1.5, 1.0)');

// ---- number formatting rule (trailing zeros only after a decimal point) ----
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmtSrc = appSrc.match(/const fmt = [^\n]+/)[0];
const fmt = eval('(' + fmtSrc.replace('const fmt = ', '').replace(/;\s*$/, '') + ')');
ok(fmt(90, 0) === '90' && fmt(1.50) === '1.5' && fmt(-0.001) === '0' && fmt(-1.25) === '−1.25' && fmt(100, 1) === '100', 'fmt keeps integer zeros');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s3lgV']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
both('foot', 'claude-opus-5-5');
ok(STRINGS.zh.foot.includes('高阶机器人学 · 从角度到末端') && STRINGS.en.foot.includes('Advanced Robotics · From Angles to the End Effector'), 'footer names the original');
// no "left/right chart" wording (charts stack on phones)
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the left|on the right/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of appSrc.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
// strings with placeholders must not be bound statically through data-i18n
for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) ok(!/\{[a-zA-Z0-9]+\}/.test(STRINGS.zh[m[1]]), 'static key without placeholders ' + m[1]);
for (const id of ['t1', 't2', 'clear0', 'l2', 'rho', 'scan1', 'tx', 'ty', 't13', 't23', 'w1', 'w2', 'dt', 't24', 'sweep4', 'tx5', 'ty5', 'lam', 'preIn', 'preOut', 'run5', 'step5b', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and css');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/graphics/robot-kinematics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS robot-kinematics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · IK round-trip ${maxErr.toExponential(1)} m`);
