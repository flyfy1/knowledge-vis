'use strict';
// Projectiles & circular motion (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const range = (a, b, d) => { const out = []; for (let v = a; v <= b + 1e-9; v += d) out.push(Math.round(v * 1e6) / 1e6); return out; };
const G = 9.8;

// ---- step 0: dropped vs pushed off a 20 m ledge ----
near(M.tLand(), Math.sqrt(40 / 9.8), 1e-12, 't = √(2h/g)'); near(M.tLand(), 2.02, 0.005, 'lands at 2.02 s');
for (let v0 = 0; v0 <= 20; v0++) {
  const fr = M.strobe0(v0);
  fr.forEach((f, i) => { near(f.y, M.height(f.t), 1e-12, 'pushed ball at the dropped ball’s height'); near(f.x, v0 * f.t, 1e-12, 'x = v0 t'); if (i < fr.length - 1) near(f.t, i * 0.2, 1e-12, 'strobe every 0.2 s'); });
  near(fr[fr.length - 1].t, M.tLand(), 1e-12, 'last frame is the landing'); near(fr[fr.length - 1].y, 0, 1e-12, 'lands at y = 0');
  ok(v0 * M.tLand() <= 42, 'landing point fits the 42 m axis');
}

// ---- step 1: range and launch angle ----
for (let th = 5; th <= 85; th++) {
  const q = M.ideal(th);
  near(q.R, 400 * Math.sin(2 * th * Math.PI / 180) / G, 1e-9, 'R = v0² sin2θ / g');
  near(q.R, M.ideal(90 - th).R, 1e-9, 'complementary angles tie');
  ok(q.R <= M.ideal(45).R + 1e-12, '45° is the maximum');
  ok(q.H <= 21 && q.R <= 42, 'fits the path axes');
  const d = M.dragAt(th), fine = M.dragFlight(th, M.S1.k, M.S1.v0, 0.0005);
  near(d.R, fine.R, 2e-3, 'drag range converged in dt');
  ok(d.R < q.R && d.H < q.H + 1e-9, 'drag shortens every throw');
  if (th < 45) ok(d.R > M.dragAt(90 - th).R, 'with drag the lower complementary angle goes further');
  // asymmetry: the apex sits past the middle of the range (steeper way down)
  const fp = M.dragFlight(th, M.S1.k, M.S1.v0, 0.0002), apex = fp.path.reduce((b, p) => (p[1] > b[1] ? p : b), [0, -1]); // fine sampling
  ok(apex[0] > d.R / 2, 'with drag the way down is steeper');
}
near(M.ideal(45).R, 40.8, 0.05, 'Rmax 40.8 m');
const opt = M.dragOptimum();
assert.equal(opt.theta.toFixed(0), '43'); checks++;
ok(opt.R >= M.dragAt(43).R - 1e-6 && opt.R >= M.dragAt(45).R, 'optimum beats neighbours');

// ---- step 2: velocity changes ----
for (let th = 15; th <= 75; th++) {
  const T = M.ideal(th).T;
  for (let f = 0; f <= 1.0001; f += 0.05) {
    const tt = f * T, d = M.dv(th, tt);
    near(d.x, 0, 1e-12, 'Δv has no horizontal part'); near(d.y, -2.45, 1e-12, 'Δv = −g·0.25 s');
    const v = M.vel(th, tt), p = M.pos(th, tt);
    near(v.vx, 20 * Math.cos(th * Math.PI / 180), 1e-12, 'vx constant');
    ok(v.speed >= v.vx - 1e-12, 'speed never below vx');
    ok(p.x + v.vx * 0.35 <= 47 && p.y + v.vy * 0.35 <= 27 && p.y + v.vy * 0.35 >= -8, 'arrows stay inside the path panel');
    ok(Math.abs(v.vy) <= 21 && v.vx <= 22, 'fits the velocity diagram');
  }
  near(M.vel(th, M.ideal(th).T / 2).speed, M.vel(th, 0).vx, 1e-9, 'at the top only vx is left');
}

// ---- step 3: circular motion ----
for (const r of range(1, 5, 0.5)) for (const v of range(1, 8, 0.5)) {
  const c = M.circle(v, r);
  near(c.a, v * v / r, 1e-12, 'a = v²/r'); near(c.T, 2 * Math.PI * r / v, 1e-12, 'period');
  near(M.chordAccel(v, r, 1e-4), c.a, c.a * 1e-6, '|Δv|/Δt → v²/r');
  let prev = Infinity;
  for (const dt of range(0.02, 1, 0.02)) {
    const am = M.chordAccel(v, r, dt);
    ok(am <= c.a + 1e-12, 'average below the limit');
    if (c.w * dt <= Math.PI) { ok(am < prev, 'smaller Δt → closer to v²/r'); prev = am; }
    // Δv points at the centre (from the midpoint position) — claimed on the page only up to half a turn
    if (c.w * dt > Math.PI) continue;
    const p1 = 0.7, p2 = p1 + c.w * dt, a = M.circVel(v, p1), b = M.circVel(v, p2), dx = b.x - a.x, dy = b.y - a.y, pm = (p1 + p2) / 2;
    near(Math.acos(Math.max(-1, Math.min(1, -(dx * Math.cos(pm) + dy * Math.sin(pm)) / Math.hypot(dx, dy)))) * 180 / Math.PI, 0, 1e-4, 'Δv towards the centre');
  }
  ok(Math.hypot(r, 0.3 * v) <= 5.8 && v <= 9, 'arrows fit the circle panel and velocity diagram');
  if (v <= 4) near(M.circle(2 * v, r).a, 4 * c.a, 1e-9, 'double v → 4× a');
  if (r <= 2.5) near(M.circle(v, 2 * r).a, c.a / 2, 1e-9, 'double r → half a');
}

// ---- step 4: humpback bridge ----
near(M.vCrit(), 19.8, 0.005, 'critical speed √(gr) ≈ 19.8 m/s');
for (const v of range(0, 30, 0.5)) {
  const b = M.bridge(v);
  ok(b.airborne === (v > M.vCrit()), 'airborne iff v > √(gr)');
  near(b.N, Math.max(0, 1000 * (G - v * v / 40)), 1e-9, 'N = m(g − v²/r), not below 0');
  if (v > 0) for (const x of [0.5, 1, 2]) ok((M.fallParabola(v, x) > M.fallBridge(x)) === (v < M.vCrit()), 'near the top: parabola below the road iff v < √(gr)');
}
const b12 = M.bridge(12); near(b12.N, 6200, 1e-9, 'default N'); near(b12.ratio * 100, 63.27, 0.01, 'default 63.3 %');
near(Math.sqrt(G * 160), 39.6, 0.01, 'quiz: 160 m → 39.6 m/s'); near(Math.sqrt(G * 160) / M.vCrit(), 2, 1e-12, 'quiz: twice');
ok(fs.readFileSync(path.join(dir, 'app.js'), 'utf8').includes("choice.value === 'b'"), 'app accepts option b');

// ---- step 5: Newton's cannon ----
near(M.vCirc(), 7.85, 0.005, 'orbital speed at the summit ≈ 7.85 km/s'); near(M.vEsc(), 11.1, 0.005, 'escape ≈ 11.1 km/s');
near(Math.sqrt(M.E.GM / M.E.R), 7.9, 0.02, 'first cosmic velocity ≈ 7.9 km/s at ground level');
near(M.g0(), 9.52, 0.005, 'g at the summit'); near(M.oneSecond(1).fall, 4.76, 0.005, 'falls 4.76 m in 1 s');
near(M.oneSecond(M.vCirc()).drop, M.oneSecond(M.vCirc()).fall, 1e-4, 'at orbital speed drop = fall (v² = g r)');
near(M.vCirc() ** 2, M.g0() / 1000 * M.E.r0, 1e-9, 'v² = g r');
assert.equal(M.orbit(7.85).kind, 'circle'); assert.equal(M.orbit(7.8).kind, 'crash'); assert.equal(M.orbit(7.9).kind, 'ellipse'); checks += 3;
for (const v of range(0.05, 9, 0.05)) {
  const o = M.orbit(v), f = M.flight(v), one = M.oneSecond(v);
  ok(f.crashed === (o.kind === 'crash'), `numeric crash agrees with the formula at ${v}`);
  ok((one.drop < one.fall) === (v < M.vCirc()), 'ground drops less than the fall iff below orbital speed');
  ok(one.drop <= 7, 'fits the one-second axis');
  if (!f.crashed) {
    near(f.t, o.T, o.T * 0.003, `one turn time = period at ${v}`);
    const rmax = Math.max(...f.path.map(p => Math.hypot(p[0], p[1])));
    near(rmax, o.rMax, o.rMax * 0.003, `highest point = formula at ${v}`);
    if (o.kind === 'circle') ok(o.rMax - o.rMin < 10, 'near-circle within 10 km');
  }
  if (v >= 7.85 - 1e-9) ok(!f.crashed, 'from 7.85 km/s up it goes round');
}
ok(M.flight(0).crashed, 'v = 0 drops');

// ---- strings ----
const zh = STRINGS.zh, en = STRINGS.en;
assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort()); checks++;
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
for (const k of Object.keys(zh)) {
  assert.equal(ph(zh[k]), ph(en[k]), 'placeholders for ' + k); checks++;
  ok(zh[k].trim() && en[k].trim(), 'non-empty ' + k);
  ok(!/左图|右图|左边的图|右边的图/.test(zh[k]) && !/(left|right) (panel|graph|plot)|on the (left|right)\b/i.test(en[k]), 'no left/right panel wording ' + k);
}
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="(\w+)"/g)) ok(m[1] in zh, 'html key exists: ' + m[1]);
for (const m of app.matchAll(/\bt\('(\w+)'/g)) ok(m[1] in zh, 'app key exists: ' + m[1]);
const root = path.resolve(dir, '../../..');
const links = [...html.matchAll(/href="\.\.\/\.\.\/\.\.\/([^"#]+)(#step\d)?"/g), ...Object.values(zh).join(' ').matchAll(/href="\.\.\/\.\.\/\.\.\/([^"#]+)(#step\d)?"/g)];
for (const m of links) {
  const f = path.join(root, m[1], m[1].endsWith('/') ? 'index.html' : '');
  ok(fs.existsSync(f), 'link target exists: ' + m[1]);
  if (m[2]) ok(fs.readFileSync(f, 'utf8').includes(`id="${m[2].slice(1)}"`), 'anchor exists: ' + m[1] + m[2]);
}
ok(zh.foot.includes('claude-opus-5-5') && en.foot.includes('claude-opus-5-5'), 'footer names the model');
ok(zh.compare.includes('抛体与圆周 · 一直在掉，但总掉不到地上') && en.compare.includes('Projectiles & Circular Motion · Always Falling, Never Landing'), 'compare link names the original');

console.log(`projectile-circular core: ${checks} checks passed`);
