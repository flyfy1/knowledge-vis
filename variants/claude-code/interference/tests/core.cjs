'use strict';
// Interference (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const range = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)"`)); return { min: +m[1], max: +m[2], step: +m[3] }; };
const grid = ({ min, max, step }) => { const out = []; const n = Math.round((max - min) / step); for (let i = 0; i <= n; i++) out.push(+(min + i * step).toFixed(6)); return out; };

// ---- step 0: one wave — every point repeats the source's motion, delayed by r/λ periods ----
ok(M.A === 1 && M.F1 === 1, 'A = 1 mm, T = 1 s (quoted in s0e / s0hint / slow label)');
for (const lam of grid(range('lam0'))) for (const r of [0, 0.7, 3, 5.83, 10]) for (const t of [0, 0.13, 0.5, 0.91]) {
  near(M.wave(r, t, lam), M.wave(0, t - r / lam, lam), 1e-12, 'delay r/λ periods');
  near(M.wave(r, t + 1, lam), M.wave(r, t, lam), 1e-12, 'period 1 s');
  ok(Math.abs(M.wave(r, t, lam)) <= M.A + 1e-12, 'never beyond A');
}

// ---- step 1/2/3: the sum at a point is a sine of amplitude B = 2A|cos(δ/2)| ----
const D1 = Number(app.match(/const D1 = ([\d.]+)/)[1]), LAM1 = Number(app.match(/LAM1 = ([\d.]+)/)[1]);
ok(D1 === 6 && LAM1 === 2, 'step 1 uses d = 6 cm, λ = 2 cm as the text says');
for (const l of ['zh', 'en']) ok(STRINGS[l].s1e.includes('6 cm') && STRINGS[l].s1e.includes('2 cm'), 's1e quotes d and λ');
for (const phi of [0, Math.PI / 3, Math.PI, 1.7 * Math.PI]) for (const [x, y] of [[0, 6], [1.5, 6], [-3, 2], [5, 9], [-7.3, 4.4], [0.2, 0.5]]) {
  const o = { d: 6, lam: 2, phi }, info = M.pointInfo(x, y, o);
  near(M.sampledAmp(x, y, o, 2000), info.B, 2e-5, 'sampled amplitude = 2A|cos(δ/2)|');
  for (const t of [0, 0.37, 0.8]) near(M.field(x, y, t, o), M.wave(info.r1, t, 2) + M.wave(info.r2, t, 2, phi), 1e-12, 'superposition y = y1 + y2');
}
const at = c => M.pointWithDelta(c, 6, D1);
for (const [c, kind, B] of [[0, 'loud', 2], [1, 'still', 0], [2, 'loud', 2], [3, 'still', 0]]) {
  const x = at(c), info = M.pointInfo(x, 6, { d: D1, lam: LAM1 });
  near(info.dr, c, 1e-9, 'preset path difference ' + c); ok(info.kind === kind, 'preset kind ' + c); near(info.B, B, 1e-9, 'preset amplitude ' + c);
  if (kind === 'still') for (let i = 0; i < 50; i++) near(M.field(x, 6, i / 50, { d: D1, lam: LAM1 }), 0, 1e-9, 'still point never moves');
  if (kind === 'loud') near(Math.max(...Array.from({ length: 400 }, (_, i) => M.field(x, 6, i / 400, { d: D1, lam: LAM1 }))), 2, 1e-4, 'loud point reaches 2A');
}
// near-half is not still: strict classification
{ const x = at(1 + 0.03), info = M.pointInfo(x, 6, { d: D1, lam: LAM1 }); ok(info.kind === 'partial' && info.B > 0.09, 'near-cancellation is partial, not still'); }

// ---- step 2: loud/still curves are hyperbolas; counts in the readout ----
for (const lam of grid(range('lam2'))) for (const d of grid(range('d2'))) {
  const Ls = M.lines(d, lam, 0);
  ok(Ls.loud.length === [...Array(121).keys()].map(k => k - 60).filter(m => Math.abs(m * lam) < d - 1e-12).length, 'loud count');
  ok(Ls.loud.every(c => Math.abs(c / lam - Math.round(c / lam)) < 1e-9) && Ls.still.every(c => Math.abs(c / lam - Math.round(c / lam - 0.5) - 0.5) < 1e-9), 'line values');
  for (const c of Ls.loud.concat(Ls.still)) {
    const pts = M.hyperbola(c, d, 11, 12);
    pts.forEach(p => { const info = M.pointInfo(p.x, p.y, { d, lam }); near(info.dr, c, 1e-9, 'point lies on Δr = c'); ok(info.kind === (Ls.loud.includes(c) ? 'loud' : 'still'), 'class along the curve'); });
  }
}
ok(M.lines(6, 2).loud.length === 5 && M.lines(6, 2).still.length === 6, 'default: 5 loud, 6 still');
// amplitude has no t in it: same at every time (pattern fixed)
{ const o = { d: 6, lam: 2 }, B = M.pointInfo(1, 7, o).B; for (const t0 of [0, 3.7, 12.25]) near(Math.max(...Array.from({ length: 720 }, (_, i) => Math.abs(M.field(1, 7, t0 + i / 720, o)))), B, 2e-4, 'same amplitude in every period'); }

// ---- step 3: phase difference shifts the map; 180° swaps loud and still ----
const sorted = a => a.map(v => +v.toFixed(9)).sort((p, q) => p - q);
assert.deepEqual(sorted(M.lines(6, 2, Math.PI).loud), sorted(M.lines(6, 2, 0).still)); checks++;
assert.deepEqual(sorted(M.lines(6, 2, 2 * Math.PI).loud), sorted(M.lines(6, 2, 0).loud)); checks++;
for (const deg of grid(range('phi3'))) {
  const phi = deg * Math.PI / 180, info = M.pointInfo(0, 7, { d: 6, lam: 2, phi });
  near(info.B, 2 * Math.abs(Math.cos(phi / 2)), 1e-12, 'centre line amplitude follows φ alone');
  ok((info.kind === 'still') === (deg === 180) && (info.kind === 'loud') === (deg === 0 || deg === 360), 'centre line class at φ=' + deg);
}

// ---- step 4: different frequencies — the envelope drifts with the beat period ----
near(M.beatPeriod(1.05), 20, 1e-9, 'beat period 20 s at ratio 1.05 (s4hint)'); ok(M.beatPeriod(1) === Infinity, 'no beat when equal');
for (const l of ['zh', 'en']) ok(STRINGS[l].s4hint.includes('1.05') && STRINGS[l].s4hint.includes('20 s'), 's4hint quotes ratio and period');
for (const ratio of grid(range('ratio4'))) {
  const o = { d: 6, lam: 2, ratio }, Tb = M.beatPeriod(ratio);
  for (let i = 0; i < 200; i++) { const t = i * 0.173; ok(Math.abs(M.field(2, 7, t, o)) <= M.envelope(2, 7, t, o) + 1e-9, 'motion stays inside the envelope'); }
  if (ratio === 1) for (const t of [0, 3, 11]) near(M.envelope(2, 7, t, o), M.pointInfo(2, 7, { d: 6, lam: 2 }).B, 1e-12, 'equal frequencies: steady amplitude');
  else for (const t of [0, 1.3, 7]) near(M.envelope(2, 7, t + Tb, o), M.envelope(2, 7, t, o), 1e-9, 'envelope repeats every beat period');
}

// ---- step 5: detector line ----
const L5 = Number(app.match(/window\.PAGE_PARAMS = \{ L: ([\d.]+) \}/)[1]);
ok(L5 === 10 && app.includes('const L5 = window.PAGE_PARAMS.L'), 'detector distance shared with s5e');
for (const d of grid(range('d5'))) {
  let prev = -1;
  for (const lam of grid(range('lam5'))) {
    const s = M.screen(d, lam, L5);
    ok((s.x1 === null) === !(lam < d), 'first point exists iff λ < d');
    s.exact.forEach(e => { const info = M.pointInfo(e.x, L5, { d, lam }); near(info.dr, -e.m * lam, 1e-9, 'exact point has Δr = mλ'); near(info.B, 2, 1e-9, 'exact point is loud'); });
    if (s.x1 !== null) {
      near(s.lamEst, s.x1 * d / L5, 1e-12, 'λ estimate = x1·d/L'); ok(s.x1 > s.x1approx - 1e-12, 'actual first point lies beyond the estimate');
      const e = Math.abs(s.err); ok(e >= prev - 1e-12, `error grows with λ at fixed d (d=${d}, λ=${lam})`); prev = e;
    }
  }
}
{ const s = M.screen(6, 1.5, L5); near(s.x1, 2.69, 0.005, 'default x1'); near(s.err * 100, 7.5, 0.05, 'default error 7.5%'); }

// ---- step 6: quiz ----
const Q = M.quiz();
ok(Q.q1 === 'still', 'q1: Δr = 1.5λ is still'); ok(Q.q2[0] === 'still' && Q.q2[1] === 'loud', 'q2: still becomes loud'); ok(Q.q3 === 'still' && Q.q3amp.every(a => a > 0.1), 'q3: still, though both waves arrive');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['unitCm', 'lbS1', 'lbS2', 'lbS', 'lbP', 'lbLam', 'preset0', 'presetHalf', 'presetOne', 'phi0', 'phi180', 'formula', 's1lgSum']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/<b>/.test(v), 'no markup in readout strings ' + k);

// ---- every key referenced in HTML/app exists; controls present ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['kind_loud', 'kind_still', 'kind_partial', 'c2title_field', 'c2title_amp']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['px0', 'py0', 'lam0', 'play0', 'px1', 'py1', 'd0', 'dHalf', 'dOne', 'play1', 'lam2', 'd2', 'vField', 'vAmp', 'play2', 'lines2', 'phi3', 'phiA', 'phiB', 'ratio4', 'play4', 'lam5', 'd5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/waves/interference/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS interference core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
