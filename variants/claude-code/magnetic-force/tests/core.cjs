'use strict';
// Lorentz-force (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, text) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// ---- step 0: direction ----
for (let a = 0; a < 360; a += 15) for (const q of [1, -1]) for (const Bz of [-1, 1]) {
  const v = [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180), 0], F = M.lorentz(q, v[0], v[1], Bz), ref = cross(v, [0, 0, Bz]).map(c => q * c);
  near(F.fx, ref[0], 1e-12, 'F = q v × B (x)'); near(F.fy, ref[1], 1e-12, 'F = q v × B (y)');
  near(F.fx * v[0] + F.fy * v[1], 0, 1e-12, 'F ⟂ v'); near(Math.hypot(F.fx, F.fy), 1, 1e-12, 'F = |q|vB = 1');
  // positive charge with B into the screen: F is v turned 90° counter-clockwise; each flip reverses it (s0hint)
  near(M.turn(v[0], v[1], F.fx, F.fy), q * (Bz < 0 ? 1 : -1) * 90, 1e-9, 'turn direction');
}
// left-hand rule example: v to the right, B into the screen, positive charge → F upward
{ const F = M.lorentz(1, 1, 0, -1); near(F.fy, 1, 1e-12, 'left-hand rule example'); }

// ---- step 1: no work ----
{
  const pB = { q: 1, m: 1, Bz: -1, x0: 0, y0: 0, vx: 1, vy: 0 }, pE = { q: 1, m: 1, Ey: 0.2, x0: 0, y0: 0, vx: 1, vy: 0 };
  for (let tt = 0.25; tt <= 6.28; tt += 0.25) {
    const a = M.orbitAt(pB, tt), steps = Math.round(tt / 0.005), r = M.rk4(pB, 'B', tt / steps, steps);
    near(Math.hypot(a.vx, a.vy), 1, 1e-12, 'speed constant (exact)');
    near(r.x, a.x, 1e-8, 'RK4 = exact orbit x'); near(r.y, a.y, 1e-8, 'RK4 = exact orbit y');
    ok(Math.abs(r.work) < 5e-4, 'magnetic work ≈ 0 (shown as 0.000)');
    const e = M.eFieldAt(pE, tt), re = M.rk4(pE, 'E', tt / steps, steps), ke = 0.5 * (e.vx * e.vx + e.vy * e.vy);
    near(re.work, ke - 0.5, 1e-9, 'electric work = ΔKE');
    ok(ke < 1.5, 'KE axis 0..1.5'); ok(e.y < 4.2 && e.x < 6.7, 'E path inside the view');
    const ang = Math.acos(e.vy / Math.hypot(e.vx, e.vy)) * 180 / Math.PI; ok(ang < 90, 'electric force angle < 90° after the start');
  }
  const c = M.center(pB); ok(Math.abs(c.x) < 1e-12 && Math.abs(c.y - 1) < 1e-12, 'B circle centred at (0, 1)');
}

// ---- step 2: radius ----
let worst2 = 0;
for (let v = 0.5; v <= 2; v += 0.25) for (let B = 0.5; B <= 2; B += 0.25) for (let m = 1; m <= 2; m += 0.5) {
  const p = { q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 }, rf = M.radius(m, v, 1, B), rm = M.measureRadius(p);
  worst2 = Math.max(worst2, Math.abs(rm - rf));
  ok(rf <= 8, 'radius within the 0..8.4 chart');
  const c = M.center(p); near(c.y, rf, 1e-12, 'centre (0, r): the farthest point is straight up');
}
ok(worst2 < 1e-3, `measured radius = mv/(qB) on every slider setting (worst ${worst2})`);
near(M.radius(1, 2, 1, 1), 2 * M.radius(1, 1, 1, 1), 1e-12, 'v ×2 → r ×2'); near(M.radius(1, 1, 1, 2), M.radius(1, 1, 1, 1) / 2, 1e-12, 'B ×2 → r ÷2'); near(M.radius(2, 1, 1, 1), 2 * M.radius(1, 1, 1, 1), 1e-12, 'm ×2 → r ×2');

// ---- step 3: period ----
for (let B = 1; B <= 2; B += 0.25) for (let m = 1; m <= 2; m += 0.5) {
  const T = M.period(m, 1, B);
  for (const v of [0.5, 1, 1.5]) {
    const p = { q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 };
    near(M.measurePeriod(p), T, 1e-6, `measured period = 2πm/(qB) (B=${B}, m=${m}, v=${v})`);
    ok(M.radius(m, v, 1, B) <= 3, 'circles inside the ±3.3 view');
    const s = M.orbitAt(p, T); near(s.x, 0, 1e-9, 'back at the origin after T'); near(s.y, 0, 1e-9, 'back at the origin after T');
    // velocity direction is the same for all speeds at every moment (parallel arrows)
    for (let tt = 0; tt <= 26; tt += 1.3) { const a = M.orbitAt(p, tt), b = M.orbitAt({ ...p, vx: 1 }, tt); near(a.vx / v, b.vx, 1e-9, 'parallel arrows'); near(a.vy / v, b.vy, 1e-9, 'parallel arrows'); }
  }
  ok(26 / T * 1 <= 26 / Math.PI + 0.3, 'laps axis covers two laps at every setting');
  ok(2 * T <= 26 + 1e-9, 'two laps fit the 0..26 time slider');
}

// ---- step 4: mass spectrometer ----
const rel = Math.sqrt(M.ISOTOPES[2].u / M.ISOTOPES[0].u) - 1;
near(rel, 0.0488, 0.0002, 'relative spread ≈ 4.9%'); both('s4hint', '4.9%');
for (let U = 500; U <= 3000; U += 100) for (let B = 0.3; B <= 1.0001; B += 0.05) {
  const r = M.ISOTOPES.map(i => M.spectro(i.u, U, B));
  r.forEach((q, i) => {
    near(q.x, 2 / B * Math.sqrt(2 * M.ISOTOPES[i].u * M.U * U / M.E), 1e-12, 'x = (2/B)√(2mU/e)');
    near(0.5 * q.m * q.v * q.v, M.E * U, 1e-25, 'eU = ½mv²');
    near(M.massFromX(q.x, U, B), M.ISOTOPES[i].u, 1e-9, 'mass recovered from the landing point');
    ok(q.x <= 0.27 && q.r <= 0.135, 'inside the fixed-scale drawing');
  });
  near((r[2].x - r[0].x) / r[0].x, rel, 1e-12, 'relative spread is independent of U and B');
  ok(Math.abs(r[0].x - r[1].x) * 1000 <= 15 && Math.abs(r[2].x - r[1].x) * 1000 <= 15, 'spots inside the ±15 mm strip');
}
{ const a = M.spectro(20, 1000, 0.5), b = M.spectro(20, 4000, 0.5), c = M.spectro(20, 1000, 1); near(b.x / a.x, 2, 1e-12, 'x ∝ √U'); near(c.x / a.x, 0.5, 1e-12, 'x ∝ 1/B'); }

// ---- step 5: cyclotron ----
{
  const d = M.cyclotron();
  near(d.Emax / M.MEV, 11.97, 0.01, 'E_max ≈ 12 MeV at B = 1 T, R = 0.5 m'); near(d.fc / 1e6, 15.25, 0.01, 'f_c ≈ 15.25 MHz');
  ok(d.status === 'extracted' && d.halfTurns === 240, 'default run: extracted after 240 crossings');
  const tol = M.tolerance({}), g = M.gamma(d.Emax, M.MP) - 1;
  near(tol * 100, 0.13, 0.01, 'default tolerance ≈ 0.13%'); near(g * 100, 1.28, 0.01, 'γ − 1 ≈ 1.3%');
  ok(g / tol > 8.5 && g / tol < 10, 'nearly 10 times the allowed offset');
  both('s5hint', '1.3%'); both('s5hint', '0.13%');
  ok(M.cyclotron({ delta: tol * 0.99 }).status === 'extracted' && M.cyclotron({ delta: tol * 1.01 }).status !== 'extracted', 'tolerance is the extraction edge');
  ok(M.cyclotron({ delta: 0.005 }).status === 'stalled', 'δ = 0.5% stalls (s5hint)');
  // U doubled: half the crossings, same E_max; E_max ∝ B²
  const u2 = M.cyclotron({ Ugap: 1e5 }); ok(u2.halfTurns === 120 && Math.abs(u2.Emax - d.Emax) < 1e-20, 'U ×2 → half the crossings, same E_max');
  near(M.cyclotron({ B: 1.5 }).Emax / d.Emax, 2.25, 1e-12, 'E_max ∝ B²');
  for (let B = 0.5; B <= 1.5001; B += 0.1) for (let U = 10; U <= 100; U += 5) {
    const r = M.cyclotron({ B, Ugap: U * 1000 });
    ok(r.status === 'extracted', 'δ = 0 always extracts');
    ok(r.halfTurns === Math.ceil(r.Emax / (M.E * U * 1000) - 1e-9) || r.halfTurns === Math.ceil(r.Emax / (M.E * U * 1000)), 'crossings = E_max / eU rounded up');
    ok(r.halfTurns <= 4000, 'within the crossing limit');
  }
  // the spiral stays inside the dees
  const arcs = M.cycloPath(d.steps); ok(arcs.every(a => Math.abs(a.cy) + a.r < 0.56), 'spiral inside the drawing');
  ok(arcs.every((a, i) => i === 0 || Math.abs(a.y0 - arcs[i - 1].y1) < 1e-12), 'arcs join at the gap');
  // energy ledger: E = Σ eU cos(πkδ)
  const r = M.cyclotron({ delta: 0.002 }); let e = 0; r.steps.slice(0, -1).forEach((s, k) => { e += M.E * 5e4 * Math.cos(Math.PI * k * 0.002); near(s.E, e, 1e-25, 'ledger'); });
  // quiz: deuterons in a proton-tuned machine never get past one crossing's energy
  const dd = M.cyclotron({ m: M.MD, delta: M.MD / M.MP - 1 });
  ok(dd.status !== 'extracted', 'deuterons are not extracted'); near(dd.peak / M.MEV, 0.05, 1e-4, 'deuteron peak = eU');
  near(M.period(M.MD, 1, 1) / M.period(M.MP, 1, 1), 2, 0.002, 'deuteron period ≈ 2×');
}

// ---- charts are named by title, never by side (twin canvases stack on narrow screens) ----
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the left|on the right(?! wall)/.test(v), `${l}.${k} names a chart by side`);

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s3lg1', 's3lg2', 's3lg3', 's2lgLine']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const st of ['extracted', 'stalled', 'limit']) ok(STRINGS.zh['st_' + st] && STRINGS.en['st_' + st], 'status string ' + st);
for (const id of ['ang0', 'qPos0', 'qNeg0', 'bIn0', 'bOut0', 't1', 'fieldB1', 'fieldE1', 'play1', 'v2', 'B2', 'm2', 'play2', 'clear2', 'B3', 'm3', 't3', 'play3', 'U4', 'B4', 'B5', 'U5', 'd5', 'play5', 'end5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel2, anchor] = h.split('#'), target = path.join(dir, rel2, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/electromagnetism/magnetic-force/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS magnetic-force core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
