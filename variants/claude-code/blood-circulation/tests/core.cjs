'use strict';
// Blood circulation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const fmt = (v, d) => { let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const says = (keys, text, msg) => { for (const l of ['zh', 'en']) { const all = [].concat(keys).map(k => STRINGS[l][k]).join(' '); ok(all.includes(text), `${l} ${[].concat(keys)} should say "${text}" (${msg})`); } };

ok(fmt(90, 0) === '90' && fmt(5.04, 2) === '5.04' && fmt(100, 1) === '100', 'fmt keeps integer zeros');

// ---- step 0: route ----
ok(M.SEGMENTS.length === 10, 'ten stretches'); ok(M.SEGMENTS.reduce((a, s) => a + s.vol, 0) === M.BLOOD_VOLUME, 'segment volumes sum to 5000 mL');
says('tagline', '5', '5 litres');
const CO = M.cardiacOutput(); ok(CO === 5040, 'resting CO 5040 mL/min');
near(M.SEGMENTS.reduce((a, s) => a + M.segmentSeconds(s), 0), M.roundTripSeconds(), 1e-9, 'segments add up to a lap');
ok(fmt(M.roundTripSeconds(), 1) === '59.5', 'lap 59.5 s'); says('s0hint', '59.5', 'lap');
ok(fmt(M.loopSeconds('body'), 1) === '50.6' && fmt(M.loopSeconds('lung'), 1) === '5.4', 'loop times'); says('s0hint', '50.6', 'body loop'); says('s0hint', '5.4', 'lung loop');
const vein = M.SEGMENTS.find(s => s.id === 'vein');
ok(fmt(M.segmentSeconds(vein), 1) === '38.7', 'vein 38.7 s'); says('s0hint', '38.7', 'veins');
near(vein.vol / M.BLOOD_VOLUME, 2 / 3, 0.02, 'about two thirds of the blood is in the veins');
ok(M.SAT_ART === 0.98 && fmt(M.SAT_VEN * 100, 0) === '74', 'saturations 98 % / 74 %'); says('s0e', '98%', 'arterial'); says('s0e', '74%', 'venous');
// colour logic: red after the lungs, blue-violet after the body; exchange only in capillaries
M.SEGMENTS.forEach((s, i) => {
  const a = M.saturationAt(i, 0), b = M.saturationAt(i, 1);
  if (s.exchange === 'body') ok(a === M.SAT_ART && b === M.SAT_VEN, 'body capillaries unload');
  else if (s.exchange === 'lung') ok(a === M.SAT_VEN && b === M.SAT_ART, 'lung capillaries load');
  else ok(a === b, 'no change outside capillaries ' + s.id);
});
const idx = id => M.SEGMENTS.findIndex(s => s.id === id);
ok(M.saturationAt(idx('lungArt'), 0.5) === M.SAT_VEN && M.saturationAt(idx('lungVein'), 0.5) === M.SAT_ART, 'pulmonary artery poor, pulmonary vein rich');
ok(M.saturationAt(idx('RA'), 0.5) === M.SAT_VEN && M.saturationAt(idx('LV'), 0.5) === M.SAT_ART, 'right heart poor, left heart rich');
// readout's "sec" for each stretch is the model value
for (const s of M.SEGMENTS) ok(M.segmentSeconds(s) > 0.5, 'every stretch has a time');

// ---- step 1: heartbeat ----
ok(M.EDV === 120 && M.ESV === 50 && M.strokeVolume() === 70, 'EDV/ESV/SV'); says('s1e', '120 − 50 = 70 mL', 'SV'); says('s1hint', '120 mL', 'EDV'); says('s1hint', '50 mL', 'ESV');
ok(M.PHASES[0].from === 0 && M.PHASES[M.PHASES.length - 1].to === 1, 'phases cover the beat');
for (let i = 1; i < M.PHASES.length; i++) ok(M.PHASES[i].from === M.PHASES[i - 1].to, 'phases contiguous');
// valves: never both sets open; both shut exactly in the two isovolumic phases; volume flat there
for (let p = 0; p < 1; p += 0.001) {
  const ph = M.phaseAt(p);
  ok(!(ph.av && ph.semi), 'never all open');
  if (!ph.av && !ph.semi) { ok(ph.id === 'isoContract' || ph.id === 'isoRelax', 'all shut only isovolumic'); ok(M.lvVolume(p) === M.EDV || M.lvVolume(p) === M.ESV, 'flat volume when shut'); }
  if (ph.id === 'eject') ok(M.lvVolume(p) <= M.EDV && M.lvVolume(p) >= M.ESV, 'ejecting');
  ok(M.lvVolume(p) >= M.ESV - 1e-9 && M.lvVolume(p) <= M.EDV + 1e-9, 'volume in range');
}
near(M.lvVolume(M.PHASES[2].to - 1e-9), M.ESV, 1e-6, 'ejection ends at ESV'); near(M.lvVolume(M.PHASES[4].to - 1e-9), M.PRE_KICK, 1e-6, 'filling ends at 110');
near(M.lvVolume(0.9999999), M.lvVolume(0) , 0.01, 'continuous over the beat boundary');
// volume only rises when the entry doors are open and only falls when the exit doors are open
for (let p = 0.0005; p < 0.999; p += 0.001) { const d = M.lvVolume(p + 0.0005) - M.lvVolume(p - 0.0005), ph = M.phaseAt(p); if (d > 1e-9) ok(ph.av, 'rises only with AV open'); if (d < -1e-9) ok(ph.semi, 'falls only with semilunar open'); }
ok(Math.round(60000 / M.REST.HR) === 833, 'beat 833 ms'); says('s1readout', '833', 'beat length');
ok(fmt(M.REST.HR * M.forwardStroke(0) / 1000, 2) === '5.04', '5.04 L/min'); says('s1normal', '5.04', 'CO');
ok(M.forwardStroke(0.3) === 49 && M.strokeVolume() - M.forwardStroke(0.3) === 21, 'leak 21 / 49 mL'); says(['s1leak', 's1hint'], '49 mL', 'leak'); says('s1leak', '21 mL', 'leak back');
ok(fmt(M.REST.HR * M.forwardStroke(0.3) / 1000, 2) === '3.53', 'leak 3.53 L/min'); says('s1leak', '3.53', 'leak CO'); says('leak1', '30%', 'leak 30 %');

// ---- step 2: litres per minute ----
says('s2e', '5040 mL', 'CO'); ok(M.REST.HR === 72 && M.REST.SV === 70, 'rest');
const r = M.fullVolumeBeat(72, 70); ok(r.beat === 72 && fmt(r.seconds, 1) === '59.2', 'rest: beat 72 at 59.2 s'); says('s2hint', '72', 'beat'); says('s2hint', '59.2', 'sec');
ok(Math.round(5.04 * 1440) === 7258, 'per day'); says('s2hint', '7258', 'per day');
const e = M.fullVolumeBeat(150, 100); ok(e.beat === 50 && fmt(e.seconds, 1) === '19.6' && 150 * 100 === 15000, 'exercise'); says('s2hint', '19.6', 'exercise sec'); says('s2hint', '15', 'exercise CO');
for (let hr = 40; hr <= 200; hr += 7) for (let sv = 30; sv <= 130; sv += 9) {
  const h = M.fullVolumeBeat(hr, sv);
  ok(M.pumpedBy(h.seconds, hr, sv) >= M.BLOOD_VOLUME && (h.beat === 1 || M.pumpedBy(h.seconds - 1e-6, hr, sv) < M.BLOOD_VOLUME), 'first beat reaching 5 L');
}
ok(M.fullVolumeBeat(40, 30).seconds > 60 && M.fullVolumeBeat(72, 70).seconds <= 60, 'slow settings fall beyond the minute (s2late note)');
ok(require('node:fs').readFileSync(path.join(dir, 'app.js'), 'utf8').includes("hit.seconds > 60 ? ' ' + t('s2late')"), 'late note wired');

// ---- step 3: width and speed ----
const sp = id => M.speed(M.STATIONS.find(s => s.id === id), 5);
ok(fmt(sp('aorta'), 1) === '27.8', 'aorta 27.8'); says('s3hint', '27.8 cm/s', 'aorta');
ok(fmt(sp('capillaries'), 3) === '0.033', 'capillaries 0.033'); says('s3hint', '0.033 cm/s', 'capillaries');
ok(Math.round(sp('aorta') / sp('capillaries')) === 833, '833 times'); says('s3hint', '833', 'ratio');
ok(fmt(M.capillaryTransit(5), 0) === '3' && fmt(M.capillaryTransit(20), 2) === '0.75', 'transit 3 s / 0.75 s'); says('s3hint', '0.75', 'exercise transit'); says('s3hint', '3', 'rest transit');
near(sp('aorta') * 4, M.speed(M.STATIONS[0], 20), 1e-9, 'speeds scale 4× at 20 L/min');
ok(M.STATIONS.every(s => s.area <= M.STATIONS[2].area), 'capillaries have the largest total area');
ok(M.STATIONS.every(s => M.speed(s, 5) >= sp('capillaries')), 'slowest in capillaries');
near(M.STATIONS[2].area / M.STATIONS[0].area, 833, 1, 'hundreds of times the aorta');
// log axes cover all slider values
for (let q = 3; q <= 25; q += 0.5) for (const s of M.STATIONS) { const v = Math.log10(M.speed(s, q)); ok(v >= -2 && v <= 3, 'speed on axis'); }

// ---- step 4: oxygen ----
const rest = M.oxygen(250, 5.04);
ok(rest.delivered === 1008 && fmt(rest.need * 100, 1) === '24.8' && fmt(rest.venousSat * 100, 1) === '73.7', 'rest oxygen'); says('s4hint', '1008', 'delivered'); says('s4hint', '24.8%', 'extraction'); says('s4hint', '73.7%', 'venous');
near(rest.venousSat, M.SAT_VEN, 1e-12, 'step 0 venous = step 4 rest');
const short = M.oxygen(2000, 5.04); ok(!short.enough && fmt(short.minCO, 1) === '12.5', 'shortage → 12.5'); says(['s4hint', 'correct', 'wrong'], '12.5', 'min CO');
ok(M.oxygen(1000, 10).need === 0.5 && M.oxygen(2500, 20).need === 0.625, 'walk 50 %, hard 62.5 %'); says('s4hint', '50%', 'walk'); says('s4hint', '62.5%', 'hard');
ok(M.oxygen(1000, 10).enough && M.oxygen(2500, 20).enough, 'presets are enough');
ok(M.O2_PER_L === 200 && M.MAX_EXTRACTION === 0.8, '200 mL/L, 80 %'); says('s4e', '200 mL', 'O2 per L'); says('s4e', '80%', 'max extraction');
ok(STRINGS.zh.s4t.includes('10 倍') && STRINGS.en.s4t.includes('ten times'), 'ten times'); ok(2500 / 250 === 10, 'hard exercise uses 10× the resting oxygen');
for (let u = 200; u <= 3000; u += 50) for (let c = 3; c <= 25; c += 0.5) {
  const o = M.oxygen(u, c);
  ok(o.enough === (u <= 0.8 * c * 200 + 1e-9), 'enough ⇔ need ≤ 80 %');
  ok(o.venousSat >= M.SAT_ART * 0.2 - 1e-12 && o.venousSat <= M.SAT_ART, 'venous saturation in range');
  if (!o.enough) near(M.oxygen(u, o.minCO).need, 0.8, 1e-9, 'minCO exactly reaches 80 %');
}
// slider grid contains the presets
for (const [u, c] of [[250, 5.04], [1000, 10], [2500, 20]]) ok(u % 50 === 0 && Math.abs((c - 3) / 0.02 - Math.round((c - 3) / 0.02)) < 1e-6, 'preset on slider grid');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['foot']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes('《血液循环》'), 'footer');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording in ' + k);
for (const s of M.SEGMENTS) for (const l of ['zh', 'en']) ok(STRINGS[l]['seg_' + s.id] && STRINGS[l]['segd_' + s.id], 'segment strings ' + s.id);
for (const p of M.PHASES) for (const l of ['zh', 'en']) ok(STRINGS[l]['ph_' + p.id] && STRINGS[l]['phd_' + p.id], 'phase strings ' + p.id);
for (const s of M.STATIONS) for (const l of ['zh', 'en']) ok(STRINGS[l][s.id] && STRINGS[l]['sh_' + s.id], 'station strings ' + s.id);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) if (!m[1].endsWith('_')) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
const htmlKeys = new Set([...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(m => m[1]));
for (const k of zk) if (/<[a-z]/.test(STRINGS.zh[k] + STRINGS.en[k])) ok(htmlKeys.has(k), 'markup key rendered as HTML: ' + k);
for (const id of ['play0', 'next0', 'reset0', 'real0', 'p1', 'play1', 'leak1', 'h2', 'v2', 'rest2', 'run2', 'q3', 'u4', 'q4', 'pre4a', 'pre4b', 'pre4c', 'checkQuiz', ...M.STATIONS.map(s => 'st_' + s.id)]) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('content="junior"'), 'stage junior');
const hrefs = [...html.matchAll(/href="([^"]+#[\w-]+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#[\w-]+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/body/blood-circulation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS blood-circulation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · lap ${fmt(M.roundTripSeconds(), 1)} s · venous ${fmt(M.SAT_VEN * 100, 1)}%`);
