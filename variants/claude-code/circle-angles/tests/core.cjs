'use strict';
// Inscribed angles (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const TOL = 1e-9;
const cs = []; for (let c = 40; c <= 160; c += 2) cs.push(c);           // central-angle slider grid (steps 1, 2, 4)

// ---- the measuring tools themselves ----
near(M.angleAt(M.O, { x: 1, y: 0 }, { x: 0, y: 1 }), 90, TOL, 'right angle'); near(M.angleAt(M.O, { x: 1, y: 0 }, { x: -1, y: 0 }), 180, TOL, 'straight angle');
for (let s = -180; s <= 180; s++) near(M.dist(M.O, M.pointAt(s)), 1, 1e-12, 'P on the circle');

// ---- step 0 / 1: same arc → same angle, half the central angle; other arc → 180 − half ----
let worst = 0;
for (const c of cs) {
  near(M.central(c), c, TOL, 'central angle from coordinates = c');
  const { A, B } = M.chord(c); near(M.dist(M.O, A), 1, 1e-12, 'A on circle'); near(M.dist(M.O, B), 1, 1e-12, 'B on circle');
  const lim = Math.floor(M.majorLimit(c) - M.MIN_GAP);
  for (let s = -180; s <= 180; s++) {
    const p = M.inscribed(c, s);
    if (p === null) { ok(Math.abs(Math.abs(s) - M.majorLimit(c)) < M.MIN_GAP, 'undefined only next to A or B'); continue; }
    if (M.onMajor(c, s)) { near(p, c / 2, TOL, `major arc c=${c} s=${s}`); worst = Math.max(worst, Math.abs(p - c / 2)); }
    else near(p, 180 - c / 2, TOL, `minor arc c=${c} s=${s}`);
  }
  for (let s = -lim; s <= lim; s++) ok(M.inscribed(c, s) !== null && M.onMajor(c, s), 'step 1/2 slider stays on the major arc with P defined');
}
ok(worst < 0.05, 'shown to 0.1°, the major-arc readings never differ from half (spread 0)');
// step 0 default and the "coincide" state
near(M.inscribed(100, 20), 50, TOL, 'step 0 default 50°'); ok(M.onMajor(100, 20), 'step 0 default on major arc');
ok(M.inscribed(100, 130) === null && M.inscribed(100, -130) === null, 'P on A or B: undefined');
// s > 0 is anticlockwise from the top (towards A): A is at s = +limit
near(M.dist(M.pointAt(M.majorLimit(100)), M.chord(100).A), 0, 1e-12, 'A at s = +limit'); near(M.dist(M.pointAt(-M.majorLimit(100)), M.chord(100).B), 0, 1e-12, 'B at s = −limit');

// ---- step 2: every line of the proof, on the whole slider grid ----
let seenIn = false, seenOut = false;
for (const c of cs) {
  const lim = Math.floor(M.majorLimit(c) - M.MIN_GAP);
  for (let s = -lim; s <= lim; s++) {
    const p = M.proof(c, s);
    near(p.OA, 1, 1e-12, 'OA = r'); near(p.OP, 1, 1e-12, 'OP = r'); near(p.OB, 1, 1e-12, 'OB = r');
    near(p.baseA, p.baseP_A, 1e-9, 'isosceles OAP: base angles equal'); near(p.baseB, p.baseP_B, 1e-9, 'isosceles OBP: base angles equal');
    near(p.AOD, 2 * p.baseA, 1e-9, 'exterior angle AOD = 2α'); near(p.BOD, 2 * p.baseB, 1e-9, 'exterior angle BOD = 2β');
    if (p.inside) { seenIn = true; near(p.AOB, p.AOD + p.BOD, 1e-9, 'inside: AOB = AOD + BOD'); near(p.APB, p.baseP_A + p.baseP_B, 1e-9, 'inside: APB = α + β'); }
    else { seenOut = true; near(p.AOB, Math.abs(p.AOD - p.BOD), 1e-9, 'outside: AOB = |AOD − BOD|'); near(p.APB, Math.abs(p.baseP_A - p.baseP_B), 1e-9, 'outside: APB = |α − β|'); }
    near(p.AOB, 2 * p.APB, 1e-9, 'AOB = 2 APB');
  }
}
ok(seenIn && seenOut, 'both proof cases are reachable with the sliders');
ok(M.proof(100, -25).inside, 'step 2 default: O inside (adding case)');
ok(!M.proof(100, -125).inside || !M.proof(100, 125).inside, 'dragging P towards A or B reaches the subtracting case (s2hint)');
for (const c of [80, 100]) for (const s of [-30, 0, 45]) near(M.proof(c, s).AOB, 2 * M.proof(c, s).APB, 1e-9, 'proof at 80° and 100°');

// ---- step 3: diameter → 90° everywhere; d = 0.4 → above < 90 < below ----
near(M.cFromOffset(0), 180, TOL, 'd = 0 is a diameter');
for (let s = -180; s <= 180; s++) { const p = M.inscribed(180, s); if (p !== null) near(p, 90, TOL, 'Thales s=' + s); else ok(Math.abs(Math.abs(s) - 90) < 1, 'gap only at A, B'); }
for (let d = 0.02; d <= 0.8 + 1e-9; d += 0.02) {
  const c = M.cFromOffset(d);
  near(Math.cos(c / 2 * Math.PI / 180), d, 1e-12, 'chord distance d ↔ central angle');
  for (let s = -180; s <= 180; s++) { const p = M.inscribed(c, s); if (p === null) continue; ok(M.onMajor(c, s) ? p < 90 : p > 90, `d=${d.toFixed(2)}: not a right angle`); }
}
{ const c = M.cFromOffset(0.4); ok(M.inscribed(c, 0) < 90 && M.inscribed(c, 180) > 90, 'd = 0.4 (s3hint): above below 90°, below above 90°'); }

// ---- step 4: opposite angles of the cyclic quadrilateral are supplementary ----
for (const c of cs) for (let u = 0; u <= 100; u += 5) for (let v = 0; v <= 100; v += 5) {
  const q = M.quad(c, u / 100, v / 100);
  ok(q.P !== null && q.Q !== null && M.onMajor(c, q.sP) && !M.onMajor(c, q.sQ), 'P on major, Q on minor');
  near(q.sum, 180, 1e-9, 'APB + AQB = 180'); near(q.reflex / 2, q.Q, 1e-9, 'AQB = half the reflex angle'); near(q.reflex, 360 - c, 1e-9, 'reflex = 360 − c');
}
{ const q = M.quad(80, 0.35, 0.6); near(q.P, 40, TOL, 'default 40'); near(q.Q, 140, TOL, 'default 140'); }

// ---- step 5: set square → diameter; two lines meet at the centre ----
const lines = [];
for (let phi = 0; phi < 360; phi += 7) for (let tau = -40; tau <= 40; tau += 4) {
  const sq = M.setSquare(phi, tau);
  near(sq.corner, 90, 1e-9, 'corner is a right angle'); near(sq.len, 2, 1e-9, 'XY = diameter'); near(sq.off, 0, 1e-9, 'XY passes through O');
  near(M.dist(M.O, sq.X), 1, 1e-9, 'X on circle'); near(M.dist(M.O, sq.Y), 1, 1e-9, 'Y on circle');
  if (tau === 0 || tau === 20) lines.push({ X: sq.X, Y: sq.Y, V: sq.V });
}
for (let i = 0; i < lines.length; i += 3) for (let j = i + 1; j < lines.length; j += 5) {
  const X0 = M.intersect(lines[i], lines[j]);
  if (X0) { near(M.dist(X0, M.O), 0, 1e-6, 'crossing = centre'); near(M.dist(X0, lines[i].V), 1, 1e-6, 'crossing is a radius from V'); }
}
ok(M.intersect(lines[0], lines[0]) === null, 'the same line twice is reported as parallel');

// ---- step 6 quiz ----
near(M.QUIZ.q1, 40, TOL, 'q1'); near(M.QUIZ.q2, 115, TOL, 'q2'); near(M.QUIZ.q2check, 65, TOL, 'q2 premise'); M.QUIZ.q3.forEach(v => near(v, 90, TOL, 'q3'));
ok(M.quizKey('q1') === 'b' && M.quizKey('q2') === 'c' && M.quizKey('q3') === 'a', 'quiz keys from the model');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['q1a', 'q1b', 'q1c', 'q2a', 'q2b', 'q2c', 'lg90', 'lgCentralLine']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['s0', 'c1s', 's1', 'walk1', 'clear1', 'prev2', 'next2', 'c2s', 's2', 'd3', 's3', 'walk3', 'clear3', 'c4s', 'u4', 'v4', 'phi5', 'tau5', 'draw5', 'clear5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]); ok(ids.length === new Set(ids).size, 'element ids are unique');
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/circle-angles/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS circle-angles core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
