'use strict';
// Moon phases (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const i18nSrc = fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8');
const STRINGS = new Function(i18nSrc.match(/const STRINGS = (\{[\s\S]*?\n\});/)[0] + '\nreturn STRINGS;')();
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const D2R = Math.PI / 180;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const both = re => ok(re.zh.test(STRINGS.zh[re.key]) && re.en.test(STRINGS.en[re.key]), 'text claim ' + re.key);

// ---- steps 0–1: lit half and the half facing Earth ----
// independent check of the lit fraction: sample the visible disc and count points whose surface normal faces the Sun
for (let th = 0; th <= 360; th += 5) {
  const s = M.viewSun(th); let lit = 0, all = 0;
  for (let i = -100; i <= 100; i++) for (let j = -100; j <= 100; j++) { const x = i / 100.5, y = j / 100.5, r2 = x * x + y * y; if (r2 >= 1) continue; const z = Math.sqrt(1 - r2); all++; if (x * s[0] + y * s[1] + z * s[2] > 0) lit++; }
  near(lit / all, M.litFraction(th), 0.01, 'lit fraction by disc sampling at ' + th);
  // viewer looks from Earth: the Sun direction seen from Earth has −z (behind the Moon) at new moon
  near(Math.hypot(...s), 1, 1e-12, 'unit Sun vector');
}
near(M.litFraction(0), 0, 1e-12, 'new moon 0%'); near(M.litFraction(180), 1, 1e-12, 'full moon 100%');
near(M.litFraction(90), 0.5, 1e-12, 'first quarter 50%'); near(M.litFraction(270), 0.5, 1e-12, 'last quarter 50%');
for (let th = 1; th < 180; th++) { ok(M.litSide(th) === 'right', 'waxing lit on the right'); ok(M.litSide(th + 180) === 'left', 'waning lit on the left'); near(M.litFraction(th), M.litFraction(360 - th), 1e-12, 'symmetric'); ok(M.viewSun(th)[0] > 0 && M.viewSun(th + 180)[0] < 0, 'Sun to the right when waxing'); }
ok(M.litSide(0) === 'none' && M.litSide(180) === 'none' && M.litSide(360) === 'none', 'no side at new and full');
// page defaults: both position sliders start at 45° (waxing crescent, 15%)
ok(/id="a0"[^>]*value="45"/.test(html) && /id="a1"[^>]*value="45"/.test(html), 'sliders start at 45°');
ok(M.phaseName(45) === 'waxCres' && Math.round(100 * M.litFraction(45)) === 15, '45° = waxing crescent 15%');

// ---- step 2: the month ----
near(M.SYNODIC, 29.53, 0.005, 'synodic month 29.53 d (s2e, s6fin, formula)'); near(M.SIDEREAL, 27.32, 0.005, 'sidereal month 27.32 d (boundary)');
ok(M.SYNODIC - M.SIDEREAL > 2 && M.SYNODIC - M.SIDEREAL < 3, '"two days and more" longer (boundary)');
near(1 / M.SIDEREAL - 1 / M.YEAR, 1 / M.SYNODIC, 2e-5, 'synodic = sidereal corrected for Earth\'s own trip round the Sun');
const order = []; for (let a = 0; a <= 29.5; a += 0.01) { const n = M.phaseName(M.ageToTheta(a)); if (order[order.length - 1] !== n) order.push(n); }
assert.deepEqual(order, [...M.PHASES, 'new']); checks++;
{ // a quarter or full/new name covers exactly one day: half a day either side
  for (const c of [0, 90, 180, 270]) { ok(M.phaseName(c + M.HALF_DAY_DEG - 1e-6) === M.phaseName(c) && M.phaseName(c + M.HALF_DAY_DEG + 1e-3) !== M.phaseName(c), 'one-day window at ' + c); }
  near(2 * M.HALF_DAY_DEG / 360 * M.SYNODIC, 1, 1e-12, 'window is one day');
}
{ // day of full moon: "round at about day 15"
  near(M.thetaToAge(180), 14.77, 0.01, 'full at age 14.77'); ok(Math.round(M.thetaToAge(180)) === 15, 'about day 15');
  // each integer day 0..29 that the calendar draws maps to a θ in [0,360)
  for (let d = 0; d < 30; d++) { const th = M.ageToTheta(d); ok(th >= 0 && th < 360, 'calendar θ'); near(M.thetaToAge(th), d, 1e-9, 'age round trip'); }
  // playing the month visits all eight names (the checklist fills)
  const seen = new Set(); for (let k = 0; k <= 295; k++) seen.add(M.phaseName(M.ageToTheta(k / 10))); ok(seen.size === 8, 'play2 at 0.1-day steps ticks all eight');
  // "on the two quarter days exactly half the disc is lit"
  for (const c of [90, 270]) for (let d = -M.HALF_DAY_DEG; d <= M.HALF_DAY_DEG; d += 0.5) near(M.litFraction(c + d), 0.5, 0.06, 'quarter ≈ half lit');
}
ok(/max="29.5"/.test(html.match(/<input id="age2"[^>]+>/)[0]), 'age slider to 29.5');

// ---- step 3: rising and setting ----
near(M.moonRise(180), 18, 1e-12, 'full moon rises 18:00'); near(M.moonSet(180), 6, 1e-12, 'full moon sets 06:00');
near(M.moonRise(90), 12, 1e-12, 'first quarter rises at noon'); near(M.moonSet(90), 0, 1e-12, 'first quarter sets at midnight');
near(M.moonRise(270), 0, 1e-12, 'last quarter rises at midnight'); near(M.moonRise(0), 6, 1e-12, 'new moon rises with the Sun');
near(M.altitude(90, 18), 90, 1e-12, 'first quarter overhead at 18:00 (s3hint: high overhead at dusk)');
near(M.altitude(0, 12), 90, 1e-12, 'Sun highest at 12:00');
for (let th = 0; th < 360; th += 15) for (let tau = 0; tau < 24; tau += 0.25) {
  // independent: altitude from the angle between the person's zenith and the body direction in the top view
  const psi = M.zenithAngle(tau) * D2R, b = th * D2R, dot = Math.cos(psi) * Math.cos(b) + Math.sin(psi) * Math.sin(b), crs = Math.cos(psi) * Math.sin(b) - Math.sin(psi) * Math.cos(b), alt = 90 - Math.abs(Math.atan2(crs, dot)) / D2R;
  near(M.altitude(th, tau), alt, 1e-9, 'altitude geometry');
  ok((M.altitude(th, tau) > 0) === (Math.abs(M.skyOffset(th, tau)) < 90), 'above horizon ⇔ on the sky dome');
  // rise time: just after it the body is up and moving west (skyOffset decreasing towards −90 means west on the dome)
}
for (let th = 0; th < 360; th += 7) { const r = M.moonRise(th); ok(M.altitude(th, r + 0.01) > 0 && M.altitude(th, r - 0.01) < 0, 'rise at ' + th); near(M.skyOffset(th, r + 0.01), 90 - 0.15, 1e-6, 'rises on the east (positive offset)'); const s = M.moonSet(th); ok(M.altitude(th, s - 0.01) > 0 && M.altitude(th, s + 0.01) < 0, 'set at ' + th); }
{ const d = M.riseDelayMin(); ok(Math.round(d) === 50, 'rises about 50 min later each day: ' + d); near(M.moonRise(M.ageToTheta(1)) - M.moonRise(0), 360 / M.SYNODIC / 15, 1e-9, 'per-age rise shift'); }
// the dome: east on the left — app draws x = cx − Rd·sin(offset); an eastern offset (+) lands left of centre
ok(/cx - Rd \* Math\.sin\(d \* D2R\)/.test(app), 'east drawn on the left');
ok(/value="19"/.test(html.match(/<input id="tau3"[^>]+>/)[0]) && M.altitude(180, 19) > 0 && M.altitude(0, 19) < 0, 'step 3 opens at 19:00: full moon up, Sun down');
ok(/theta: 180/.test(app), 'step 3 default phase full');

// ---- step 4: eclipses ----
const U = M.umbraRadius();
near(U, 4600, 5, 'umbra radius ≈ 4600 km at the Moon'); ok(Math.round(U).toLocaleString('en-US') === '4,599', 'shown as 4,599');
ok(U > M.R_MOON * 2 && U < M.R_EARTH, 'umbra wider than the Moon, smaller than Earth');
near(M.INCL, 5, 0.2, '"about 5°"'); ok(M.R_MOON === 1737, 'Moon radius 1737 km (s4e)');
near(M.MOON_DIST / (2 * M.R_EARTH), 30, 0.2, 'Earth–Moon distance ≈ 30 Earth diameters (boundary)');
const Hmax = M.MOON_DIST * Math.sin(M.INCL * D2R); ok(Hmax + M.R_MOON < 38000, 'all full moons inside the ±38000 km chart'); ok(Hmax > 30000, '±30000 ticks fall inside the data range');
ok(M.eclipseKind(0) === 'total' && M.eclipseKind(U - M.R_MOON - 1) === 'total' && M.eclipseKind(U - M.R_MOON + 1) === 'partial', 'total threshold');
ok(M.eclipseKind(U + M.R_MOON - 1) === 'partial' && M.eclipseKind(U + M.R_MOON + 1) === 'none', 'partial threshold');
near(M.nodeStep(), 30.67, 0.01, 'node step per lunation');
// the eclipse stretches move earlier each year by the gap between a calendar year and an eclipse year
{ const eclYear = 180 / M.nodeStep() * M.SYNODIC * 2; near(M.YEAR - eclYear, 18.6, 0.2, 'stretches ≈ 19 days earlier per year (s4hint)'); near(eclYear / 2, 173.3, 0.2, 'half an eclipse year ≈ half a year apart'); }
let maxPerYear = 0, zeroYears = [], perYear = [];
for (let y = 0; y < 300; y++) {
  const L = M.fullMoonsOfYear(y); ok(L.length === 12 || L.length === 13, '12 or 13 full moons');
  ok(L.every((q, i) => i === 0 || q.j === L[i - 1].j + 1) && L[0].day >= 0 && L[L.length - 1].day < M.YEAR, 'full moons consecutive and inside the year');
  const e = L.filter(q => q.kind !== 'none'); perYear.push(e.length); maxPerYear = Math.max(maxPerYear, e.length); if (!e.length) zeroYears.push(y);
  const close = L.filter(q => Math.abs(q.h) < U + M.R_MOON);
  // eclipses only within the two stretches: any two eclipses in a year are either neighbours-in-season or ~6 lunations apart
  for (let a = 0; a < e.length; a++) for (let b = a + 1; b < e.length; b++) { const g = e[b].j - e[a].j; ok(g === 1 || g === 5 || g === 6 || g === 7 || g === 11 || g === 12, 'eclipse spacing in lunations: ' + g); }
  ok(close.length === e.length, 'touching = eclipsed');
}
ok(maxPerYear <= 3, 'never more than three umbral eclipses per year in the model: ' + maxPerYear);
{ const share = perYear.filter(n => n <= 2).length / perYear.length; ok(share > 0.9, '"at most one or two" in most years: ' + share); }
ok(perYear[0] === 2 && zeroYears.includes(5), 'year 1 has two eclipses; year 6 (index 5) has none ("try year 6")');
{ const L0 = M.fullMoonsOfYear(0); ok(L0[2].kind === 'total' && L0[8].kind === 'total', 'year 1: full moons 3 and 9 total'); ok(/id="k4"[^>]*value="3"/.test(html), 'opens on full moon 3'); }
// the eclipsed full moons creep earlier: first eclipse day per year (where in the first stretch) decreases by ≈ 18.6 days on average
{ const days = []; for (let y = 0; y < 8; y++) { const L = M.fullMoonsOfYear(y).filter(q => Math.abs(q.h) < 12000); days.push(L[0].day); } let falls = 0; for (let i = 1; i < days.length; i++) if (days[i] < days[i - 1] || days[i] > days[i - 1] + 300) falls++; ok(falls >= 6, 'stretches move earlier'); }
// ---- step 5: quiz ----
ok(M.QUIZ.length === 8 && new Set(M.QUIZ).size === 8 && M.QUIZ.every(a => a % 45 === 0), 'quiz covers the eight positions');
for (const tr of M.QUIZ) { ok(M.quizCorrect(tr + 22.5, tr) && M.quizCorrect(tr - 22.5, tr) && !M.quizCorrect(tr + 23, tr) && !M.quizCorrect(tr - 23, tr), 'tolerance ±22.5° at ' + tr); ok(M.phaseName(tr) === M.PHASES[tr / 45], 'quiz name ' + tr); }
near(22.5, 360 / 8 / 2, 0, 'half an eighth of a turn');
ok(!M.quizCorrect(0, M.QUIZ[0]), 'slider default (0°) is not the first answer');
// ---- text claims tied to numbers ----
both({ key: 's2e', zh: /29\.53 天/, en: /29\.53 days/ }); both({ key: 'formula', zh: /29\.53/, en: /29\.53/ });
both({ key: 'boundary', zh: /27\.32 天[\s\S]*两天多/, en: /27\.32 days[\s\S]*over two more days/ }); both({ key: 'boundary', zh: /30 倍/, en: /30 Earth diameters/ });
both({ key: 's4e', zh: /1737 千米/, en: /1737 km/ }); both({ key: 's4e', zh: /约 5°/, en: /about 5°/ });
both({ key: 's4hint', zh: /19 天[\s\S]*第 6 年/, en: /19 days[\s\S]*year 6/ });
both({ key: 's5e', zh: /22\.5°/, en: /22\.5°/ }); both({ key: 's2hint', zh: /第 15 天/, en: /day 15/ });
// ---- bilingual keys and placeholders ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek); checks++;
const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'translated: ' + k);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/[左右]图|left panel|right panel|left chart|right chart|left figure|right figure/i.test(v), 'no left/right figure references');
ok(STRINGS.zh.foot.includes('claude-opus-5-5') && STRINGS.en.foot.includes('claude-opus-5-5'), 'footer names the model');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(m[1] in STRINGS.zh, 'html key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9]+)'[,)]/g)) ok(m[1] in STRINGS.zh, 'app key ' + m[1]);
for (const k of [...M.PHASES, 'sideRight', 'sideLeft', 'sideNone0', 'sideNone180', 'sunUp', 'sunDown', 'moonUp', 'moonDown', 's4above', 's4below', 'kindTotal', 'kindPartial', 'kindNone']) ok(k in STRINGS.zh, 'dynamic key ' + k);
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) { const [p, a] = h.split('#'), target = path.resolve(dir, p, 'index.html'); ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${a}"`), 'anchor ' + h); }
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/moon-phases/index.html')) && html.includes('href="../../../earth/astronomy/moon-phases/"'), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
ok(/<meta name="stage" content="primary">/.test(html), 'stage primary');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
for (const m of html.matchAll(/id="([A-Za-z0-9]+)"/g)) ok(html.split(`id="${m[1]}"`).length === 2, 'unique id ' + m[1]);
for (const m of app.matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) ok(html.includes(`id="${m[1]}"`), 'app element exists ' + m[1]);
console.log(`PASS moon-phases core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
