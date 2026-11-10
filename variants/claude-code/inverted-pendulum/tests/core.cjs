'use strict';
// Inverted-pendulum (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const zh = STRINGS.zh, en = STRINGS.en, D = M.D2R, deg = r => r / D;
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(125, 0), '125'); checks += 2;

// ---- simulator sanity: energy is conserved with no control; RK4 converges ----
{ const r = M.simulate({}, { L: 0.5, th0: 0, om0: 0, T: 2 }); ok(!r.fell && M.maxAbs(r.th) === 0, 'upright and still stays upright'); }
{ const L = 0.5, r = M.simulate({}, { L, th0: 3 * D, T: 0.8 }); const E = i => 0.5 * L * L * ((r.th[i + 1] - r.th[i - 1]) / (2 * M.DT)) ** 2 + M.G * L * Math.cos(r.th[i]); near(E(300), E(1), 1e-5, 'energy conserved without control'); }

// ---- step 0: falling, τ = √(L/g), fall time ∝ √L ----
for (let th = 1; th <= 10; th += 0.5) {
  for (let L = 0.1; L <= 0.5001; L += 0.05) near(M.fallTime(4 * L, th * D) / M.fallTime(L, th * D), 2, 0.01, `4× length → 2× fall time (L=${L.toFixed(2)}, θ0=${th})`);
  ok(M.fallTime(2, th * D) <= 2.5, 'every fall fits the 2.5 s axis');
}
near(M.fallTime(2, 2 * D) / M.fallTime(0.5, 2 * D), 2, 0.01, 'hint: 0.5 m → 2 m doubles the fall time');
for (const th of [1.5, 2, 3, 4]) { const L = 0.5, dt = M.fallTime(L, th / Math.E * D) - M.fallTime(L, th * D); near(dt / M.tau(L), 1, 0.12, 'start e× smaller adds about one τ (θ0=' + th + ')'); }
ok(Math.abs(Math.E - 2.7) < 0.02 && zh.s0e.includes('2.7') && en.s0e.includes('2.7'), 'growth factor per τ stated as 2.7');

// ---- step 1: P only ----
const tf0 = M.fallTime(M.L0, 5 * D);
for (let i = 0; i <= 30; i++) {
  const k = i / 10, r = M.simulate({ Kp: k * M.G }, { L: M.L0, th0: 5 * D, T: 4 });
  if (k < 1) { ok(r.fell, 'Kp < g falls (k=' + k + ')'); ok(r.tFall >= tf0 - 1e-9, 'falls no sooner than uncontrolled'); }
  if (k > 1) {
    ok(!r.fell, 'Kp > g does not fall (k=' + k + ')');
    near(deg(M.maxAbs(r.th)), 5, 0.01, 'swing amplitude stays 5° (k=' + k + ')');
    const P = 2 * Math.PI / M.pOmega(k * M.G, M.L0); if (P < 2) { const tail = deg(M.maxAbs(r.th, Math.round((4 - P) / M.DT))); near(tail, 5, 0.05, 'no decay over the last full period'); }
    const per = M.swingPeriod(r); if (per) near(per / (2 * Math.PI / M.pOmega(k * M.G, M.L0)), 1, 0.01, 'period matches 2π/ω (k=' + k + ')');
  }
}
{ const r = M.simulate({ Kp: 1.0 * M.G }, { L: M.L0, th0: 5 * D, T: 4 }); ok(r.fell || deg(M.maxAbs(r.th)) <= 60, 'Kp = g handled by one of the two messages'); }
{ const a = M.simulate({ Kp: 1.5 * M.G }, { L: M.L0, th0: 5 * D, T: 4 }), b = M.simulate({ Kp: 3 * M.G }, { L: M.L0, th0: 5 * D, T: 4 }); ok(M.swingPeriod(b) < M.swingPeriod(a), 'larger Kp swings faster'); }

// ---- step 2: PD ----
const KP2 = 2 * M.G;
near(M.pdShape(KP2, 0, M.L0).wn, 4.43, 0.005, 'ωn ≈ 4.43 rad/s'); ok(zh.s2e.includes('4.43') && en.s2e.includes('4.43'), 'ωn stated');
let best = { ts: Infinity, z: null };
for (let i = 0; i <= 80; i++) {
  const kd = i / 10, ps = M.pdPoles(KP2, kd, M.L0), sh = M.pdShape(KP2, kd, M.L0);
  ps.forEach(p => { near(M.L0 * (p.re * p.re - p.im * p.im) + kd * p.re + KP2 - M.G, 0, 1e-9, 'pole solves the real part'); near(2 * M.L0 * p.re * p.im + kd * p.im, 0, 1e-9, 'pole solves the imaginary part'); ok(p.re >= -16 && Math.abs(p.im) <= 5.5, 'pole inside the plot'); });
  if (sh.zeta < 1 - 1e-9) ps.forEach(p => near(Math.hypot(p.re, p.im), sh.wn, 1e-9, 'complex poles sit on a circle of radius ωn'));
  if (kd === 0) ps.forEach(p => near(p.re, 0, 1e-12, 'Kd = 0: poles on the imaginary axis'));
  const r = M.simulate({ Kp: KP2, Kd: kd }, { L: M.L0, th0: 5 * D, T: 6 });
  ok(!r.fell && deg(M.maxAbs(r.th)) <= 5 + 1e-6, 'trace inside ±6°');
  const ts = M.settleTime(r, 5 * D); if (ts !== null && ts < best.ts) best = { ts, z: sh.zeta };
}
near(M.pdShape(KP2, M.kdFor(KP2, 1, M.L0), M.L0).zeta, 1, 1e-12, 'kdFor inverts ζ');
{ const ps = M.pdPoles(KP2, M.kdFor(KP2, 1, M.L0), M.L0); near(ps[0].re, ps[1].re, 1e-6, 'ζ = 1: poles meet on the real axis'); }
ok(best.z >= 0.7 && best.z <= 1, 'fastest 2% settling for ζ between 0.7 and 1: ζ=' + best.z.toFixed(3));
for (const z of [0.3, 1.5]) { const r = M.simulate({ Kp: KP2, Kd: M.kdFor(KP2, z, M.L0) }, { L: M.L0, th0: 5 * D, T: 6 }); ok(M.settleTime(r, 5 * D) > best.ts + 0.3, 'too little or too much damping settles slower (ζ=' + z + ')'); }

// ---- step 3: delay ----
const crit = M.criticalDelay();
ok(crit > 0.1 && crit < 0.15, 'critical delay about 125 ms: ' + crit);
for (let d = 0; d <= 200; d += 5) { const st = M.stable3(d / 1000); ok(st === (d / 1000 < crit), 'stable exactly below the critical delay (' + d + ' ms)'); }
{ const a = M.simulate({ Kp: M.KP3, Kd: M.KD3 }, { L: M.L0, th0: M.TH3, T: 10 }), b = M.simulate({ Kp: M.KP3, Kd: M.KD3 }, { L: M.L0, th0: M.TH3, T: 10, delay: 0.03 });
  let diff = 0; a.th.forEach((v, i) => { diff = Math.max(diff, Math.abs(v - b.th[i])); }); ok(deg(diff) < 1.5, 'a few tens of ms barely change the response: ' + deg(diff).toFixed(2) + '°'); }
near(M.pdShape(M.KP3, M.KD3, M.L0).zeta, 0.7, 1e-12, 'step 3 uses ζ = 0.7');

// ---- step 4: position loop ----
for (let p = 1.5; p <= 4.0001; p += 0.1) {
  const g = M.placeGains(p, M.L0), c = M.charPoly(g, M.L0), want = [1, 4 * p, 6 * p * p, 4 * p ** 3, p ** 4];
  c.forEach((v, i) => near(v, want[i], 1e-9 * Math.max(1, want[i]), 'closed loop = (s + p)⁴'));
  const r1 = M.simulate(g, { L: M.L0, th0: 5 * D, T: 8 }), r2 = M.simulate(g, { L: M.L0, x0: 0.5, T: 8 });
  ok(!r1.fell && Math.abs(r1.x.at(-1)) < 0.02, 'loop brings the cart home (tilted start), p=' + p.toFixed(1));
  ok(!r2.fell && Math.abs(r2.x.at(-1)) < 0.02, 'loop brings the cart home (parked start), p=' + p.toFixed(1));
  ok(Math.max(...r2.x) > 0.5 + 1e-4, 'cart first moves the wrong way, p=' + p.toFixed(1));
}
{ const w = p => { const r = M.simulate(M.placeGains(p, M.L0), { L: M.L0, x0: 0.5, T: 8 }); return [Math.max(...r.x) - 0.5, M.maxAbs(r.th)]; };
  let prev = [0, 0]; for (let p = 1.5; p <= 4.0001; p += 0.5) { const q = w(p); ok(q[0] > prev[0] && q[1] > prev[1], 'larger p: bigger reverse move and tilt'); prev = q; } }
{ const r = M.simulate(M.PD4, { L: M.L0, th0: 5 * D, T: 8 }); ok(!r.fell && Math.abs(r.vEnd) > 0.05 && Math.abs(r.x.at(-1)) > 1, 'PD only: rod upright but cart rolls away');
  const r2 = M.simulate(M.PD4, { L: M.L0, x0: 0.5, T: 8 }); ok(r2.x.every(v => v === 0.5), 'PD only, parked: the cart never moves'); }

// ---- step 5: motor limit ----
for (let a = 2; a <= 20; a += 2) {
  const mp = M.maxPush(M.PD4, a), b = M.pushBound(a);
  ok(mp <= b * 1.002, `measured limit not above the linear bound (a=${a})`);
  ok(deg(b) <= 540, 'bound inside the map');
  near(M.maxPush(M.PD4, a, M.L0, 14), mp, 0.002 * b + 0.01, 'page bisection agrees with the fine one');
}
ok(M.maxPush(M.PD4, 2) / M.pushBound(2) > 0.97, 'weak motor: limit almost on the bound');
ok(M.maxPush(M.PD4, 20) / M.pushBound(20) < 0.85, 'strong motor: limit well below the bound');
near(M.pushBound(5) * M.G * M.tau(M.L0), 5, 1e-12, 'bound = a/(gτ)');
ok(M.recovers(M.PD4, 100 * D, 5), 'default shove is saved');
// a shove just over the measured limit falls; just under it is saved
{ const mp = M.maxPush(M.PD4, 5); ok(M.recovers(M.PD4, mp * 0.98, 5) && !M.recovers(M.PD4, mp * 1.02, 5), 'limit separates saved from fallen'); }

// ---- bilingual parity ----
const zk = Object.keys(zh).sort(), ek = Object.keys(en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(zh[k]), ph(en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || zh[k] !== en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(!/左图|右图/.test(Object.values(zh).join('')) && !/left plot|right plot|left panel|right panel/i.test(Object.values(en).join('')), 'no left/right picture references');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['L0', 'th0', 'play0', 'kp1', 'play1', 'kd2', 'play2', 'd3', 'play3', 'clear3', 'loop4', 'sc1', 'sc2', 'p4', 'play4', 'a5', 'w5', 'play5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
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
ok(fs.existsSync(path.join(dir, '../../../signal/control/inverted-pendulum/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS inverted-pendulum core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
