'use strict';
// Mechanical energy (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const ZH = STRINGS.zh, EN = STRINGS.en;

// ---- step 0: free fall ----
for (let h0 = 2; h0 <= 20; h0++) for (let m = 1; m <= 5; m += 0.5) {
  const T = M.fallTime(h0);
  for (let i = 0; i <= 40; i++) { const S = M.fallState(h0, m, T * i / 40); near(S.Ep + S.Ek, S.E0, 1e-9 * S.E0, 'Ep + Ek = E0'); checks++; }
  const end = M.fallState(h0, m, T);
  near(end.v, M.impactSpeed(h0), 1e-9, 'landing speed √(2gh₀)'); near(end.h, 0, 1e-9, 'lands at h = 0'); checks += 2;
  near(M.fallState(h0, 1, T).v, end.v, 1e-12, 'landing speed independent of mass'); checks++;
  // ghosts every 0.1 s spread out: each gap is larger than the one before (s0hint)
  let prev = 0; for (let k = 1; k * 0.1 <= T; k++) { const gap = M.fallState(h0, m, (k - 1) * 0.1).h - M.fallState(h0, m, k * 0.1).h; ok(gap > prev, 'ghosts spread out'); prev = gap; }
}
assert.equal(M.impactSpeed(10).toFixed(2), '14.00'); checks++;

// ---- step 1: frictionless coaster ----
const kJ = v => v / 1000;
ok(kJ(M.MASS * M.G * 15) <= 80, 'energy plot 0..80 kJ holds the highest release');
for (let H = 4; H <= 15; H += 0.5) {
  const r = M.reach(H);
  near(M.h(r.x0), H, 1e-9, 'release point at H'); checks++;
  ok(r.x1 < M.XMAX && Math.abs(M.h(r.x1) - H) < 1e-6, 'turning point at height H inside the track');
  const S = M.simulate(H, 0, { T: 60 });
  let worst = 0, xmax = -Infinity;
  for (const f of S.frames) { worst = Math.max(worst, Math.abs(f.Ep + f.Ek - f.E0) / f.E0); xmax = Math.max(xmax, f.x); if (f.h <= H - 0.05) near(Math.abs(f.v), M.speedAt(H, f.x), 2e-3, 'speed = √(2g(H − h))'); }
  ok(worst < 1e-5, 'frictionless ledger closes (' + worst + ')');
  near(xmax, r.x1, 0.05, 'simulated car turns where the track reaches H'); checks++;
  ok((H < 10) === (r.x1 < 30), 'second (10 m) hill cleared exactly when H ≥ 10');
}
near(M.reach(12).x1, 93, 0.5, 's1hint: turns near x ≈ 93 m'); checks++;
assert.equal(M.h(30), 10); checks++;
assert.equal(M.speedAt(12, 30).toFixed(1), '6.3'); checks++;          // s1hint
ok(M.speedAt(9.5, 30) === null, 's1hint: 9.5 m cannot reach the second crest');
assert.equal(M.KEYS[2][1], 10); checks++;
for (let x = 0; x <= M.XMAX; x += 0.5) for (let H = 4; H <= 15; H += 0.5) { const v = M.speedAt(H, x); ok(v === null ? M.h(x) > H : Math.abs(0.5 * v * v - M.G * (H - M.h(x))) < 1e-9, 'probe readout'); }

// ---- step 2: Galileo's pendulum ----
for (let th = 10; th <= 50; th += 5) for (let p = 0; p <= 1.9001; p += 0.1) {
  const pr = Math.round(p * 10) / 10, R = M.pendulum(th, pr);
  ok(R.h0 <= R.r + 1e-12, 'string stays taut: release height ≤ peg circle radius');
  ok(Math.abs(R.hmax - R.h0) * 1000 < 1, `same height within 1 mm (θ=${th}, p=${pr}): ${(R.hmax - R.h0) * 1000} mm`);
  ok(R.phiMax <= 90 + 1e-9, 'turn round the peg ≤ 90°');
  const last = R.pts[R.pts.length - 1]; ok(Math.abs(last.h - R.h0) < 2e-3, 'returns to the release height on the left');
  if (pr === 0) near(R.phiMax, th, 1e-9, 'no peg: same angle'), checks++;
}
for (let p = 0.1; p <= 1.9001; p += 0.1) ok(M.pendulum(30, Math.round(p * 10) / 10).phiMax > M.pendulum(30, Math.round((p - 0.1) * 10) / 10).phiMax, 'lower peg, bigger angle');

// ---- step 3: resistance ----
const stopAt = S => S.frames.find(f => f.t >= S.stopT - 1e-9);
for (const H of [4, 8, 12, 15]) for (let k = 0.01; k <= 0.1001; k += 0.01) {
  const kk = Math.round(k * 100) / 100, S = M.simulate(H, kk, { T: 300 });
  ok(S.stopT !== null && S.stopT <= 300, `stops within the simulated 300 s (H=${H}, k=${kk})`);
  let worst = 0; for (const f of S.frames) worst = Math.max(worst, Math.abs(f.Ep + f.Ek + f.Q - f.E0) / f.E0);
  ok(worst < 1e-4, `ledger closes within 0.01% (H=${H}, k=${kk}): ${worst}`);
  const end = stopAt(S);
  near(end.Q, S.E0 - end.Ep, 1e-4 * S.E0, 's3end: heat = E0 − Ep at rest'); near(end.Q, kk * M.MASS * M.G * end.s, 1e-6 * S.E0, 'heat = f × distance'); checks += 2;
  ok(end.Ek < 1e-6 * S.E0, 'at rest');
  for (const f of S.frames) ok(kJ(f.Ep + f.Ek + f.Q) <= 80, 'ledger plot range');
  const speed = Math.max(2, Math.ceil(S.stopT / 15)); ok(S.stopT / speed <= 15 + 1e-9, 'playback ≤ 15 s');
}
{ const a = M.simulate(12, 0.1, { T: 300 }), b = M.simulate(12, 0.05, { T: 300 }), c = M.simulate(12, 0.02, { T: 300 });
  ok(a.stopT < b.stopT && b.stopT < c.stopT, 's3hint: larger k stops sooner');
  ok(stopAt(a).s < stopAt(b).s && stopAt(b).s < stopAt(c).s, 's3hint: larger k, shorter distance');
  // each climb ends lower than the last (k = 0.05): successive turning heights fall
  const F = b.frames, turns = []; for (let i = 0; i < F.length - 1 && F[i].t < b.stopT; i++) if (Math.sign(F[i].v) * Math.sign(F[i + 1].v) < 0 || (i > 0 && F[i].v === 0)) turns.push(Math.max(F[i].h, F[i + 1].h));
  ok(turns.length >= 4, 'several climbs before stopping');
  for (let i = 1; i < turns.length; i++) ok(turns[i] < turns[i - 1] + 1e-6, 'each climb lower');
}
{ const S = M.simulate(12, 0, { T: 60 }); ok(S.stopT === null, 'no resistance: never stops'); }

// ---- step 4: speed squared ----
assert.equal(M.dropHeight(30).toFixed(2), '3.54'); assert.equal(M.dropHeight(60).toFixed(2), '14.17'); assert.equal(M.dropHeight(120).toFixed(2), '56.69'); checks += 3;
ok(Math.round(M.dropHeight(30) / M.FLOOR) === 1 && Math.round(M.dropHeight(60) / M.FLOOR) === 5 && Math.round(M.dropHeight(120) / M.FLOOR) === 19, 'storeys 1 / 5 / 19');
for (let v = 10; v <= 120; v += 5) { near(M.dropHeight(v) / M.dropHeight(v / 2), 4, 1e-9, 'double speed, four times the height'); checks++; ok(M.dropHeight(v) <= 60, 'plot range 0..60 m'); }
ok(M.dropHeight(120) / M.FLOOR <= 20, 'building has 20 storeys');

// ---- bilingual parity ----
const zk = Object.keys(ZH).sort(), ek = Object.keys(EN).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(ZH[k]), ph(EN[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s4lgCurve']); // formula only
for (const k of zk) ok(NEUTRAL.has(k) || ZH[k] !== EN[k], 'zh text differs from en for ' + k);
ok(ZH.foot.includes('claude-opus-5-5') && EN.foot.includes('claude-opus-5-5'), 'footer names the model');
ok(ZH.foot.includes('机械能守恒 · 过山车的能量账本') && EN.foot.includes('Conservation of Mechanical Energy · The Roller Coaster’s Energy Ledger'), 'footer names the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left (chart|panel|plot)|right (chart|panel|plot)/i.test(v), 'no left/right figure references in ' + k);

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(ZH[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(ZH[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['h0', 'm0', 't0', 'drop0', 'reset0', 'H1', 'x1', 'play1', 'reset1', 'th2', 'p2', 'swing2', 'H3', 'k3', 'play3', 'end3', 'reset3', 'v4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok((() => { try { new Function(app); return true; } catch (e) { return false; } })(), 'app.js parses');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/mechanics/mechanical-energy/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS mechanical-energy core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
