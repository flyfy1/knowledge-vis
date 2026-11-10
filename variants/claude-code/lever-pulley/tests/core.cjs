'use strict';
// Levers & pulleys (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (k, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][k].includes(s), `${l}.${k} quotes "${s}"`));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const attr = (id, a) => Number(new RegExp(`id="${id}"[^>]*${a}="([^"]+)"`).exec(html)[1]);
const range = (id, eps = 1e-9) => { const out = [], lo = attr(id, 'min'), hi = attr(id, 'max'), st = attr(id, 'step'); for (let i = 0; lo + i * st <= hi + eps; i++) out.push(Math.round((lo + i * st) * 1000) / 1000); return out; };

// ---- step 0: seesaw torques ----
near(M.weight(60), 600, 0, 'adult 600 N'); near(M.weight(30), 300, 0, 'child 300 N'); both('s0e', '600 N'); both('s0e', '300 N');
const seats = range('dL'); assert.deepEqual(seats, range('dR')); checks++;
ok(seats[0] === 0.4 && seats[seats.length - 1] === 2 && seats.length === 9, 'seats 0.4 … 2.0 in 0.2 m notches');
const maxTilt = 14 * Math.PI / 180;
ok(0.6 - 2.3 * Math.sin(maxTilt) > 0, 'tilted board end stays above the ground');
for (const dL of seats) for (const dR of seats) {
  const r = M.seesaw(60, dL, 30, dR);
  near(r.ML, 600 * dL, 1e-9, 'left torque'); near(r.MR, 300 * dR, 1e-9, 'right torque');
  ok(r.balanced === (Math.abs(dR - 2 * dL) < 1e-9), `balanced iff child sits twice as far (${dL}, ${dR})`);
  ok(Math.sign(r.tilt) === Math.sign(r.balanced ? 0 : r.diff), 'board tips toward the bigger torque');
  ok(Math.abs(r.tilt) <= 14, 'tilt within the drawn range');
  ok(r.ML <= 1200 && r.MR <= 1200, 'torque bars fit the 0–1200 N·m axis');
  ok(exact(r.ML) && exact(r.MR) && exact(r.diff), 'torques print as whole numbers');
  // the cosθ remark: tilting scales both arms by the same factor, so the winner never changes
  const c = Math.cos(maxTilt); ok(Math.sign(600 * dL * c - 300 * dR * c) === Math.sign(r.balanced ? 0 : r.diff) || r.balanced, 'cos factor keeps the winner');
  // one notch out tips it toward the person who moved
  if (r.balanced && dL + 0.2 <= 2 + 1e-9) ok(M.seesaw(60, dL + 0.2, 30, dR).heavier === 'left', 'adult one notch out → left');
  if (r.balanced && dR + 0.2 <= 2 + 1e-9) ok(M.seesaw(60, dL, 30, dR + 0.2).heavier === 'right', 'child one notch out → right');
}
function exact(v) { return Math.abs(v - Math.round(v)) < 1e-6; }
ok(M.seesaw(60, 1.0, 30, 2.0).balanced, 'hint: adult 1.0 m, child 2.0 m balances'); both('s0hint', '1.0 m'); both('s0hint', '2.0 m'); both('s0hint', '0.2 m');
ok(M.seesaw(60, attr('dL', 'value'), 30, attr('dR', 'value')).heavier === 'left', 'default: same distance, adult wins');
near(M.balanceSeat(60, 1.0, 30), 2.0, 1e-12, 'balanceSeat');

// ---- step 1: crowbar ----
const Lrs = range('Lr');
ok(Lrs[0] === 0.1 && Lrs[Lrs.length - 1] === 0.5, 'fulcrum 0.1 … 0.5 m');
let prevF = 0;
for (const Lr of Lrs) {
  const c = M.crowbar(Lr);
  near(c.Le, 1.5 - Lr, 1e-12, 'L_e = 1.5 − L_r');
  near(c.F * c.Le, 800 * Lr, 1e-9, 'torque balance F·L_e = G·L_r'); near(c.Min, c.Mout, 1e-9, 'readout check');
  near(c.F, 800 * Lr / (1.5 - Lr), 1e-9, 'F formula'); near(c.gain, c.Le / Lr, 1e-12, 'gain');
  near(800 / c.F, c.gain, 1e-9, 'force multiplier = G/F = L_e/L_r');
  ok(c.F > prevF && c.F > 0, 'F grows as the fulcrum moves away; never 0'); prevF = c.F;
  ok(c.F <= 600 && Lr >= 0.05 && Lr <= 0.55, 'curve chart covers the point');
  const riseMax = Math.min(0.06, 0.4 * Lr / c.Le); ok(riseMax / Lr < 1 && riseMax * c.Le / Lr <= 0.4 + 1e-12 && 0.4 < 0.5, 'animated hand stays above ground');
}
ok(Math.round(M.crowbar(0.1).F) === 57, 'hint: about 57 N at 0.1 m'); both('s1hint', '57'); both('s1e', '800 N'); both('s1e', '1.5 m');
near(M.crowbar(0.3).F, 200, 1e-9, 'F at 0.3 m'); near(M.crowbar(0.5).F, 400, 1e-9, 'F at 0.5 m');

// ---- step 2: the work ledger ----
for (const ratio of [2, 3, 4]) {
  ok(html.includes(`data-ratio="${ratio}"`), 'ratio button ' + ratio);
  for (let k = 0; k <= 200; k++) {
    const L = M.ledger(ratio, k / 200);
    near(L.Win, L.Wout, 1e-9, `W_in = W_out (ratio ${ratio}, ${k})`);
    if (k) near(L.s / L.h, ratio, 1e-9, 's ÷ h = arm ratio');
    near(L.F * L.Le, 800 * 0.3, 1e-9, 'lever balance throughout');
    ok(L.s <= 0.35 + 1e-12, 'hand stays above the ground (ledge 0.35 m)');
    ok(L.Win <= 50 + 1e-9, 'ledger axis 0–50 J');
  }
  const end = M.ledger(ratio, 1); near(end.h, 0.05, 1e-12, 'rock rises 5 cm'); near(end.Win, 40, 1e-9, '40 J'); near(end.F, 800 / ratio, 1e-9, 'F = 800 ÷ ratio');
  near(Math.sin(end.theta * Math.PI / 180) * 0.3, 0.05, 1e-12, 'exact (no small-angle) geometry');
}
near(M.ledger(4).F, 200, 1e-9, '4:1 → 200 N'); near(M.ledger(4).s, 0.2, 1e-12, '4:1 → 0.2 m'); near(M.ledger(2).F, 400, 1e-9, '2:1 → 400 N'); near(M.ledger(2).s, 0.1, 1e-12, '2:1 → 0.1 m');
both('s2hint', '200 N'); both('s2hint', '0.2 m'); both('s2hint', '400 N'); both('s2hint', '0.1 m'); both('s2e', '0.3 m'); both('s2e', '800');
ok(Math.abs(M.ledger(3).F - 266.6667) < 1e-3, '3:1 → ≈266.7 N');

// ---- step 3: fixed pulley ----
for (const s of range('s3')) { const r = M.fixedPulley(s); near(r.F, 200, 0, 'F = G'); near(r.h, s, 0, 'h = s'); near(r.Win, r.Wout, 1e-9, 'W_in = W_out'); ok(exact(r.Win), 'whole joules'); ok(0.12 + s + 0.32 < 2.05 - 0.16, 'load stays below the wheel'); ok(2.05 - 0.35 - s > 0, 'hand above ground'); }
both('s3e', '200 N');

// ---- step 4: pulley block ----
for (const n of M.BLOCK.ns) {
  ok(html.includes(`data-n="${n}"`), 'n button ' + n);
  const w = M.winding(n);
  ok(w.tiedTop === (n % 2 === 0), 'even n tied at the top, odd at the block');
  ok(w.lastTurn === 'top' && w.freeEnd === 'down', 'free end comes down off a fixed sheave');
  ok(w.topTurns.length + w.bottomTurns.length === n, 'n − 1 turns between segments + the last top turn');
  const turns = []; for (let i = 0; i < n; i++) turns.push(w.topTurns.includes(i) ? 'T' : w.bottomTurns.includes(i) ? 'B' : '?');
  ok(turns.every((x, i) => x !== '?' && (i === 0 || x !== turns[i - 1])), 'turns alternate top/bottom');
  ok((w.tiedTop ? 'B' : 'T') === turns[0], 'first segment runs away from the tied end');
  ok(w.supporting === n, 'drawn supporting segments = n');
  for (const s of range('s4')) {
    const P = M.pulleyBlock(n, s);
    near(P.F, 600 / n, 1e-12, 'F = G/n'); near(P.h, s / n, 1e-12, 'h = s/n'); near(P.Win, P.Wout, 1e-9, 'W_in = W_out');
    near(M.ropeLength(n, 1.55 - P.h, 0.4 + s), M.ropeLength(n, 1.55, 0.4), 1e-9, 'rope length is conserved');
    ok(1.3 + P.h + 0.13 < 2.85 - 0.13, 'moving sheaves stay below the fixed ones'); ok(2.45 - s > 0, 'hand above ground'); ok(P.Win <= 600 + 1e-9, 'ledger axis 0–600 J');
    ok(exact(P.Win), 'W_in whole joules');
  }
}
near(M.pulleyBlock(2, 0).F, 300, 0, 'n=2 → 300 N'); near(M.pulleyBlock(4, 0).F, 150, 0, 'n=4 → 150 N');
near(M.pulleyBlock(2, 2).h, 1, 1e-12, 'n=2, 2 m → 1 m'); near(M.pulleyBlock(4, 2).h, 0.5, 1e-12, 'n=4, 2 m → 0.5 m');
both('s4hint', '300 N'); both('s4hint', '150 N'); both('s4hint', '1 m'); both('s4hint', '0.5 m'); both('s4hint', '2 m'); both('s4e', '600 N');
ok(attr('s4', 'max') === 2 && attr('s3', 'max') === 1.2, 'slider ranges as described');

// ---- quiz ----
near(M.QUIZ.q1(), 2.0, 1e-12, 'q1 = 2.0 m'); near(M.QUIZ.q2(), 200, 1e-12, 'q2 = 200 N'); near(M.QUIZ.q3(), 0.75, 1e-12, 'q3 = 0.75 m');
ok(M.seesaw(80, 1.0, 40, 1.0).heavier === 'left' && M.seesaw(80, 1.0, 40, 0.5).heavier === 'left', 'q1 distractors really fail');
for (const [q, vals] of [['q1', ['1', '05']], ['q2', ['600', '1800']], ['q3', ['3', '12']]]) {
  ok(html.includes(`name="${q}" value="ok"`), q + ' has the right answer');
  for (const v of vals) { ok(html.includes(`name="${q}" value="${v}"`), `${q} option ${v}`); ok(STRINGS.zh[`${q}_${v}`] !== undefined, `feedback ${q}_${v}`); }
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['optM', 'optN']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '杠杆与滑轮 · 支点挪一挪，省力见分晓' : 'Levers & Pulleys · Move the Fulcrum, Feel the Trade'), 'footer names the model and the original');

// ---- keys, controls, provenance ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['dL', 'dR', 'Lr', 'push1', 'lift2', 's3', 's4', 'count4', 'score']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!/canvas-label-guard/.test(html), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(/name="stage" content="junior"/.test(html) && /name="category" content="physics"/.test(html), 'stage/category meta');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/mechanics/lever-pulley/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(['s0e', 's1e', 's2e', 's3e', 's4e'].every(k => STRINGS.zh[k].startsWith('这一步要回答') && STRINGS.en[k].startsWith('The question')), 'each step opens with its question');

console.log(`PASS lever-pulley core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
