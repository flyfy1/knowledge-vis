'use strict';
// Special relativity (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
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

// ---- step 0: light clock (L = 15 cm ⇒ 1 ns tick; γ = 1.25 at β = 0.6) ----
near(M.lightClock(0).rest * 1e9, 1.0006923, 1e-6, 'one tick at rest ≈ 1 ns');
near(M.gamma(0.6), 1.25, 1e-12, 'γ(0.6) = 1.25 quoted in s0hint');
for (const b of grid('b0')) {
  const lc = M.lightClock(b);
  ok(lc.gamma >= 1, 'γ ≥ 1');
  // Pythagoras: slanted leg² = L² + (half the drift)² and leg = c × half a tick
  near(lc.diag ** 2, 0.15 ** 2 + (lc.drift / 2) ** 2, 1e-12, 'slanted leg by Pythagoras');
  near(lc.diag, M.C * lc.moving / 2, 1e-9, 'light covers the slant at speed c');
}

// ---- step 1: Lorentz transformation ----
for (const b of grid('b1')) for (const x of grid('x1')) for (const ct of grid('t1')) {
  const p = M.lorentz(x, ct, b), back = M.inverse(p.x, p.ct, b);
  near(back.x, x, 1e-9, 'inverse x'); near(back.ct, ct, 1e-9, 'inverse ct');
  near(M.interval(p.x, p.ct), M.interval(x, ct), 1e-9, 'interval invariant');
  if (M.interval(x, ct) > 1e-9) ok(p.ct > 0, 'timelike after origin for every observer');
}
// s1hint: B at (3, 1) flips the sign of ct′ within the slider range; B at (1, 3) never does
{ const bs = grid('b1'); ok(bs.some(b => M.lorentz(3, 1, b).ct < 0) && bs.some(b => M.lorentz(3, 1, b).ct > 0), 'spacelike order flips'); ok(slider('x1').value === 1 && slider('t1').value === 3, 'default B = (1, 3)'); }
// the moving axes: ct′ axis x = β ct, x′ axis ct = β x
for (const b of grid('b1')) { const a = M.inverse(0, 2, b), c = M.inverse(2, 0, b); near(a.x, b * a.ct, 1e-12, 'ct′ axis slope'); near(c.ct, b * c.x, 1e-12, 'x′ axis slope'); }

// ---- step 2: lamp in the car ----
for (const b of grid('b2')) {
  const f = M.carFlash(b, 4);
  near(f.dt, M.gamma(b) * b * 4, 1e-9, 'Δt = γβL');
  near(f.Ap.ct, f.Bp.ct, 1e-9, 'A and B simultaneous on board'); near(f.Ap.ct, 2, 1e-9, 'each flash takes L/2 on board');
  near(f.Bp.x - f.Ap.x, 4, 1e-9, 'car is L long on board'); near(2 * f.half, 4 / M.gamma(b), 1e-12, 'ground length L/γ');
  near(f.A.x, f.rear(f.A.ct), 1e-12, 'A on the rear world line'); near(f.B.x, f.front(f.B.ct), 1e-12, 'B on the front world line');
  // passengers' "same moment" line through A has slope β and passes through B
  near(f.B.ct - f.A.ct, b * (f.B.x - f.A.x), 1e-9, 'A and B on one line of slope β');
  ok(f.B.ct <= slider('t2').max + 1e-9 && f.B.x <= 7 && f.A.x >= -3, 'events inside the diagram');
  if (b > 0) ok(f.A.ct < f.B.ct, 'rear first on the ground');
}

// ---- step 3: muons ----
near(M.C * M.MUON.tau, 659, 0.5, 'c·τ ≈ 659 m');
for (const b of grid('b3')) {
  const q = M.muon(b);
  near(q.relGround, q.relMuon, 1e-12, 'both views agree');
  ok(q.classical < q.relGround, 'relativity helps');
}
ok(M.muon(0.9).classical < 2e-11 && M.muon(0.9).classical > 1e-12, 's3hint: about 10⁻¹¹ at β = 0.9');
ok(grid('b3').every(b => M.muon(b).classical < 1e-9), 'orange stays glued to 0');
ok(M.muon(0.9).relGround < 0.01 && M.muon(0.9995).relGround > 0.45, 'cyan flattens towards 0.9995');

// ---- step 4: twins ----
for (const b of grid('b4')) for (const D of grid('d4')) {
  const tw = M.twins(b, D);
  near(tw.nowOut * 2 + tw.jump, tw.tEarth, 1e-9, 'books balance');
  near(tw.nowOut, tw.legTrav / tw.gamma, 1e-9, 'Earth time seen on the outward leg');
  near(tw.tTrav, 2 * tw.legTrav, 1e-9, 'proper time = two legs');
  near(tw.tTrav, 2 * Math.sqrt(tw.turn.ct ** 2 - tw.turn.x ** 2), 1e-9, 'proper time = world-line length');
}
{ const tw = M.twins(slider('b4').value, slider('d4').value); ok(Math.floor(tw.tTrav + 1e-9) === 6 && Math.floor(tw.tEarth + 1e-9) === 10, 's4hint: 6 marks vs 10 marks'); }
{ const gaps = grid('b4').map(b => M.twins(b, 4).tEarth / M.twins(b, 4).tTrav); ok(gaps.every((v, i) => i === 0 || v > gaps[i - 1]), 's4hint: closer to 1, bigger difference (ratio)'); }

// ---- step 5: velocity addition ----
for (const v of grid('v5')) for (const w of grid('w5')) { const u = M.addV(v, w); ok(u <= 1 + 1e-12 && u <= v + w + 1e-12, 'u ≤ 1 and ≤ v + w'); if (w === 1) near(u, 1, 1e-12, 'light stays light'); }
{ const d = 0.1 - M.addV(0.05, 0.05); ok(d > 1e-4 && d < 5e-4, 's5hint: difference only in the fourth decimal (' + d + ')'); }
ok(0.6 + 0.6 > 1, '0.6 + 0.6 = 1.2 > 1');

// ---- step 6: energy ----
near(M.ME / 2, 0.255, 0.001, 'Newton reaches c at 0.255 MeV');
const relDiff = K => Math.abs(M.betaClassical(K / M.ME) / M.betaFromK(K / M.ME) - 1);
ok(relDiff(0.01) < 0.02, 's6hint: under 2% at 0.01 MeV'); ok(relDiff(0.1) > 0.1, 's6hint: over 10% at 0.1 MeV');
for (const lg of grid('k6')) { const K = 10 ** lg / M.ME; ok(M.betaFromK(K) < 1, 'never reaches c'); near(M.kRel(M.betaFromK(K)), K, 1e-6 * (1 + K), 'K = (γ−1)mc²'); near(M.kClassical(M.betaClassical(K)), K, 1e-12, 'K = ½β²'); }

// ---- finale: GPS ----
{ const g = M.gpsLag(); near(g.v / 1000, 3.87, 0.01, 'GPS speed'); near(g.perDay * 1e6, 7.2, 0.05, '7.2 µs a day'); near(g.perDay * M.C / 1000, 2.2, 0.05, '≈2.2 km a day'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '狭义相对论 · 同时性的线倾斜了' : 'Special Relativity · The Lines of “Now” Tilt'), 'footer names model and original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left plot|right plot|left-hand|right-hand/i.test(v), 'no left/right plot wording in ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['b0', 'play0', 'reset0', 'b1', 'x1', 't1', 'b2', 't2', 'play2', 'b3', 'b4', 'd4', 'play4', 'all4', 'v5', 'w5', 'k6', 'h6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/modern/relativity/index.html')) && html.includes('href="../../../physics/modern/relativity/"'), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS relativity core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
