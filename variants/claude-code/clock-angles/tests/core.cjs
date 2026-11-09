'use strict';
// Clock-hands (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: rates; 12 times faster; the 12:00 → 2:00 run ends at 720° and 60° ----
ok(M.MINUTE_RATE === 6 && M.HOUR_RATE === 0.5 && M.GAIN === 5.5, 'rates 6, 0.5, 5.5 °/min');
ok(M.MINUTE_RATE / M.HOUR_RATE === 12, '12 times faster');
ok(M.turned(120).minute === 720 && M.turned(120).hour === 60, '2:00 → 720° and 60°');
for (let t = 0; t <= 120; t++) { near(M.turned(t).minute, 6 * t, 0, 'minute total'); near(M.minuteAngle(t), (6 * t) % 360, 1e-12, 'minute angle'); }

// ---- step 1: ledger = angle from the moving clock, for every h:m; default 3:40 ----
let maxExtra = 0;
for (let h = 1; h <= 12; h++) for (let m = 0; m < 60; m++) {
  const q = M.ledger(h, m), tt = M.timeOf(h, m);
  near(M.mod(q.H, 360), M.hourAngle(tt), 1e-9, 'hour hand reading'); near(q.M, M.minuteAngle(tt), 1e-9, 'minute hand reading');
  near(q.A, M.between(tt), 1e-9, 'ledger angle = clock angle'); ok(q.A >= 0 && q.A <= 180, 'angle within 0..180');
  ok((q.D <= 180) === (q.A === q.D), 'small/big ledger branch');
  maxExtra = Math.max(maxExtra, q.extra);
}
ok(maxExtra === 29.5, 'creep within the hour peaks at 29.5°');
{ const q = M.ledger(3, 40); ok(q.H === 110 && q.M === 240 && q.D === 130 && q.A === 130 && q.extra === 20, 'default 3:40 → 130°'); const D0 = Math.abs(90 - 240); ok(Math.min(D0, 360 - D0) === 150, 'forgetting the creep gives 150°'); }

// ---- step 2: lead/angle; counts over 12 hours ----
for (let t = 0; t < 720; t += 0.25) { const l = M.lead(t); near(M.between(t), Math.min(l, 360 - l), 1e-12, 'angle from lead'); ok(l >= 0 && l < 360, 'lead in [0, 360)'); }
ok(M.countUpTo(M.MEETINGS, 719.99) === 11 && M.countUpTo(M.solutions(90), 719.99) === 22, '11 meetings and 22 right angles in 12 hours');
ok(M.countUpTo(M.MEETINGS, 0) === 1 && M.countUpTo(M.solutions(90), 0) === 0, 'at 12:00: 1 meeting (itself), 0 right angles');

// ---- step 3: meetings ----
ok(M.MEETINGS.length === 11, 'eleven meetings');
for (let k = 0; k <= 11; k++) {
  const t = M.meeting(k);
  near(t, 720 * k / 11, 1e-9, 'meeting time = 720k/11');
  near(M.between(t), 0, 1e-9, 'hands together'); near(M.GAIN * t, 360 * k, 1e-9, 'gained k full turns');
  ok((Math.abs(t - Math.round(t)) < 1e-9) === (k % 11 === 0), 'only 12:00 falls on a whole minute');
  const mx = M.mixed11(k); near(mx.whole + mx.rem / 11, t, 1e-9, 'mixed number');
}
ok(M.meeting(11) === 720, 'meeting 11 is 12:00 again');
ok(M.mixed11(1).text === '65 5/11' && M.clock(M.meeting(1), true) === '1:05:27', '65 5/11 min → 1:05:27');
ok(Math.floor(360 / 5.5) === 65 && Math.round((360 / 5.5 - 65) * 60) === 27, '65 min 27 s');
ok(M.clock(M.meeting(2), true) === '2:10:55', 'second meeting 2:10:55');

// ---- step 4: solutions for every integer θ; 11 at 0 and 180, 22 otherwise; θ = 90 hour pattern ----
for (let th = 0; th <= 180; th++) {
  const s = M.solutions(th);
  ok(s.length === (th === 0 || th === 180 ? 11 : 22), 'count for θ = ' + th);
  for (const t of s) { near(M.between(t), th, 1e-7, 'solution has the angle'); ok(t >= 0 && t < 720, 'within 12 hours'); }
  for (let i = 1; i < s.length; i++) ok(s[i] > s[i - 1], 'sorted, distinct');
  // brute force: sign changes of between − θ on a fine grid are all found
  let found = 0; for (let t = 0; t < 720; t += 0.01) { const a = M.between(t) - th, b = M.between(t + 0.01) - th; if (a === 0 || (a < 0 && b > 0) || (a > 0 && b < 0)) found++; }
  if (th > 0 && th < 180) ok(found === 22, 'brute-force crossings for θ = ' + th);
}
for (let h = 0; h < 12; h++) ok(M.inHour(M.solutions(90), h).length === (h === 2 || h === 8 ? 1 : 2), 'θ = 90: one in 2–3 and 8–9 o’clock, two elsewhere (hour ' + h + ')');
ok(M.inHour(M.solutions(90), 2).length === 1 && M.clock(M.inHour(M.solutions(90), 2)[0], true) === '2:27:16', 'default step-4 readout 2:27:16');

// ---- clock text rounds and carries correctly ----
ok(M.clock(0) === '12:00' && M.clock(59.999, true) === '1:00:00' && M.clock(719.999) === '12:00' && M.clock(65 + 5 / 11) === '1:05', 'clock text');
for (let t = 0; t < 720; t += 0.37) ok(/^(1[0-2]|[1-9]):[0-5]\d:[0-5]\d$/.test(M.clock(t, true)), 'clock format');

// ---- step 5: quiz tolerance ----
ok(Math.abs(130.5 - M.ledger(3, 40).A) <= 0.5 && Math.abs(130.6 - M.ledger(3, 40).A) > 0.5, '±0.5° tolerance');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(/时钟与角度 · 两根针的赛跑|Clocks & Angles · A Race Between Two Hands/.test(STRINGS[l].foot), 'footer names the original'); }
ok(STRINGS.zh.compare.startsWith('对照另一版本：时钟与角度 · 两根针的赛跑'), 'compare link text');

// ---- every key referenced in HTML/app exists; controls; structure ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['t0', 'plus0', 'play0', 'h1', 'm1', 'ledger1', 't2', 'play2', 'k3', 'play3', 'th4', 'h4', 'ans5', 'new5', 'check5', 'fb5']) ok(html.includes(`id="${id}"`), 'control ' + id);
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
ok(!/canvas-label-guard/.test(html + app), 'no canvas-label-guard');
ok(/<meta name="stage" content="primary">/.test(html) && /<meta name="category" content="math">/.test(html), 'stage/category match the original');

// ---- links land on existing pages/anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/clock-angles/index.html')), 'comparison link target exists');

console.log(`PASS clock-angles core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
