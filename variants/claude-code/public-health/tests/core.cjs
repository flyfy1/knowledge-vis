'use strict';
// Epidemic maths (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const fmt = (v, d) => { let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (v, d = 1) => fmt(v * 100, d);
const says = (keys, text, msg) => { for (const l of ['zh', 'en']) { const all = [].concat(keys).map(k => STRINGS[l][k]).join(' '); ok(all.includes(text), `${l} ${[].concat(keys)} should say "${text}" (${msg})`); } };

ok(fmt(90, 0) === '90' && fmt(5.95, 1) === '6' && fmt(100, 1) === '100', 'fmt keeps integer zeros');

// ---- step 0: generations ----
says('s0hint', String(Math.round(M.generation(2.5, 10))), 'gen 10'); ok(Math.round(M.generation(2.5, 10)) === 9537, '9537');
says('s0hint', String(Math.round(M.cumulative(2.5, 10))), 'cum 10'); ok(Math.round(M.cumulative(2.5, 10)) === 15894, '15894');
near(M.cumulative(0.8, 400), 5, 1e-9, 'R0 0.8 total → 5'); ok(M.cumulative(0.8, 10) < 5, 'finite generations stay below the limit');
for (let r = 0.5; r <= 4.0001; r += 0.1) for (let g = 1; g <= 10; g++) {
  near(M.generation(r, g) / M.generation(r, g - 1), r, 1e-9, "each generation × R0");
  if (g > 6) continue;
  near(M.generation(r, g) / M.generation(r, g - 1), r, 1e-9, 'each generation × R0');
  const tr = M.tree(r, g);
  for (let k = 1; k <= g; k++) {
    ok(tr[k].length === (tr[k - 1].length ? Math.round(M.generation(r, k)) : 0), 'tree level = rounded expectation');
    // children per parent differ by at most one
    const per = new Array(tr[k - 1].length).fill(0); tr[k].forEach(nd => per[nd.parent]++);
    if (per.length) ok(Math.max(...per) - Math.min(...per) <= 1, 'even split');
  }
}

// ---- SIR core ----
const base = M.sir(), b = M.summary(base);
for (let i = 0; i < base.t.length; i++) near(base.S[i] + base.I[i] + base.R[i], 1, 1e-12, 'S + I + R = 1');
ok(base.t.length === 721 && base.t[720] === 720, 'daily samples to day 720'); says('s1e', '720', '720 days'); says('s1e', '0.01%', 'seed');
ok(M.DEFAULTS.I0 === 1e-4, 'seed 0.01 %');
// finite step convergence: dt 0.1 vs a dt 0.02 reference via the closed-form final size and peak formula
near(b.final, M.finalSize(2.5), 2e-4, 'final size = 1 − exp(−R0 z)'); near(b.peak, M.peakFormula(2.5), 3e-4, 'peak = 1 − (1 + ln R0)/R0');
for (let r = 1.5; r <= 5.0001; r += 0.5) { const s = M.summary(M.sir({ R0: r })); near(s.final, M.finalSize(r), 1e-3, 'final size R0 ' + r); near(s.peak, M.peakFormula(r), 2e-3, 'peak R0 ' + r); } // peak read from daily samples

// ---- step 1 ----
ok(b.peakDay === 45 && pct(b.peak) === '23.4' && pct(b.final) === '89.3', 'default peak day 45, 23.4 %, 89.3 %');
const d3 = M.summary(M.sir({ D: 3 })), d14 = M.summary(M.sir({ D: 14 }));
ok(d3.peakDay === 19 && d14.peakDay === 90, 'D only stretches time'); says('s1hint', '19', 'D3 day'); says('s1hint', '90', 'D14 day');
ok(pct(d3.peak) === '23.3' && pct(d14.peak) === '23.4', 'peak heights'); says('s1hint', '23.3%–23.4%', 'peak range'); says('s1hint', '89.3%', 'final');
for (let D = 3; D <= 14; D++) { const s = M.summary(M.sir({ D })); ok(s.peak >= 0.2330 && s.peak <= 0.2336, 'peak height independent of D ' + D); ok(pct(s.final) === '89.3', 'final independent of D ' + D); }
// higher R0: taller, earlier, larger (slider grid)
let last = null;
for (let r = 1.3; r <= 5.0001; r += 0.1) {
  const s = M.summary(M.sir({ R0: r }));
  if (last) { ok(s.peak > last.peak && s.final > last.final && s.peakDay <= last.peakDay, 'monotone in R0 ' + r.toFixed(1)); }
  last = s;
}
// the adaptive axis always contains the peak on the slider grid
for (let r = 1.3; r <= 5.0001; r += 0.1) for (let D = 3; D <= 14; D++) { const s = M.summary(M.sir({ R0: r, D })); ok(s.peakDay <= Math.min(720, Math.max(120, Math.ceil(s.peakDay * 2.4 / 60) * 60)), 'peak inside axis'); ok(s.stillInfected < 1e-3, 'epidemic over by day 720 ' + r.toFixed(1) + '/' + D); }

// ---- step 2: peak at Rₑ = 1 ----
const Re = d => M.effectiveR(base, d);
ok(Re(44) > 1 && Re(45) < 1, 'Rₑ crosses 1 between days 44 and 45'); says(['s2hint', 's2peak'], '44', 'crossing'); says('s2peak', '45', 'crossing');
for (let d = 0; d < 44; d++) ok(base.I[d + 1] > base.I[d], 'rising while Rₑ > 1 ' + d);
for (let d = 45; d < 120; d++) ok(base.I[d + 1] < base.I[d], 'falling while Rₑ < 1 ' + d);
near(base.S[45], 1 / 2.5, 0.01, 'S ≈ 1/R0 at the peak'); says('s2hint', '40%', 'S at peak'); says('s2hint', '60%', 'HIT');
ok(M.herdThreshold(2.5) === 0.6, 'HIT 60 %');
says('s2hint', '23.4%', 'I at peak'); says('s2hint', '89.3%', 'final');
ok(Math.round((b.final - 0.6) * 100) === 29, 'overshoot ≈ 29 points'); says('s2hint', '29', 'overshoot');
// the readout's "2.5 × S" and the slider cover days 0..120
ok(base.t[120] === 120, 'day index = day');

// ---- step 3: interventions (presets + capacity) ----
const run3 = (c, st, len) => M.summary(M.sir({ contact: M.window(c, st, len) }));
ok(M.CAPACITY === 0.05, 'capacity 5 %'); says(['s3e', 'lgCap'], '5%', 'capacity');
ok(b.above === 38, 'baseline 38 days above'); says('s3hint', '38', 'baseline above');
const A = run3(0.6, 10, 60), B = run3(0.5, 30, 60), Cc = run3(0.9, 0, 200);
ok(pct(A.peak) === '22.9' && A.peakDay === 105 && pct(A.final) === '89.1', 'early & short'); says('s3hint', '22.9%', 'A'); says('s3hint', '105', 'A day'); says('s3hint', '89.1%', 'A final');
ok(pct(B.peak) === '5.9' && pct(B.final) === '76.1' && B.above === 29, 'on the rise'); says('s3hint', '5.9%', 'B'); says('s3hint', '76.1%', 'B final'); says('s3hint', '29', 'B above');
ok(Cc.peakDay === 345 && pct(Cc.peak) === '23.3', 'strong & long'); says(['s3hint', 'correct'], '345', 'C day'); says(['s3hint', 'correct'], '23.3%', 'C peak');
ok(B.peak < A.peak && B.final < A.final, 'timing matters');
// at the end of the strong window almost nobody became immune, so Rₑ ≈ 2.5
const runC = M.sir({ contact: M.window(0.9, 0, 200) });
near(2.5 * runC.S[200], 2.5, 0.01, 'Rₑ back near 2.5'); says('correct', '2.5', 'Re');
// presets match the slider grid
for (const [c, st, len] of [[0.6, 10, 60], [0.5, 30, 60], [0.9, 0, 200]]) ok(Math.abs(c / 0.05 - Math.round(c / 0.05)) < 1e-9 && st % 5 === 0 && len % 10 === 0, 'preset on grid');
// every slider combination finishes by day 720 (final size is final) — coarse grid
for (let c = 0; c <= 0.9001; c += 0.15) for (let st = 0; st <= 150; st += 30) for (let len = 0; len <= 200; len += 40) ok(M.summary(M.sir({ contact: M.window(c, st, len) })).stillInfected < 2e-3, `over by 720: ${c}/${st}/${len}`);
// with no intervention the curve equals the baseline
ok(run3(0, 30, 60).peak === b.peak && run3(0.5, 30, 0).final === b.final, 'no-op intervention');

// ---- step 4: vaccination ----
near(M.vaccineThreshold(2.5, 0.9), 2 / 3, 1e-12, 'critical coverage'); says('s4hint', '66.7%', 'vc');
const v40 = M.summary(M.sir({ immune: 0.4 * 0.9 }));
ok(pct(v40.final) === '41.1', '40 % coverage → 41.1 %'); says('s4hint', '41.1%', 'v40');
ok(M.vaccineThreshold(2.5, 0.6) <= 1 + 1e-12 && M.vaccineThreshold(2.5, 0.55) > 1, 'below 60 % efficacy unreachable'); says('s4hint', '60%', 'efficacy limit');
// at or above critical coverage the infected share never rises
for (let e = 0.5; e <= 1.0001; e += 0.05) for (let v = 0; v <= 1.0001; v += 0.05) {
  const r = M.sir({ immune: v * e }), s = M.summary(r), re0 = 2.5 * (1 - v * e);
  if (re0 <= 1 + 1e-12) { ok(s.peakDay === 0, `no take-off v=${v.toFixed(2)} e=${e.toFixed(2)}`); }
  else ok(s.peak > M.DEFAULTS.I0, 'takes off');
}
// final size falls with coverage
let prevF = Infinity; for (let v = 0; v <= 1.0001; v += 0.025) { const f = M.summary(M.sir({ immune: v * 0.9 })).final; ok(f <= prevF + 1e-12, 'final falls with coverage'); prevF = f; }

// ---- step 5: testing ----
const T = M.testCounts(0.01, 0.9, 0.95), G = M.testGrid(0.01, 0.9, 0.95);
ok(G.TP === 90 && G.FP === 495 && G.FN === 10 && G.TN === 9405, 'default counts'); says('s5hint', '90', 'TP'); says('s5hint', '495', 'FP'); says('s5hint', '9,900', 'well');
ok(pct(T.PPV) === '15.4', 'PPV 15.4'); says('s5hint', '15.4%', 'PPV');
ok(pct(M.testCounts(0.2, 0.9, 0.95).PPV) === '81.8', 'PPV at 20 %'); says('s5hint', '81.8%', 'PPV 20 %');
ok(pct(M.testCounts(0.01, 0.9, 0.99).PPV) === '47.6', 'spec 99'); says('s5hint', '47.6%', 'spec 99');
ok(pct(M.testCounts(0.01, 0.99, 0.95).PPV) === '16.7', 'sens 99'); says('s5hint', '16.7%', 'sens 99');
for (let p = 0.001; p <= 0.3; p += 0.007) for (let se = 0.5; se <= 0.999; se += 0.07) for (let sp = 0.8; sp <= 0.999; sp += 0.03) {
  const g = M.testGrid(p, se, sp), c = M.testCounts(p, se, sp);
  ok(g.TP + g.FP + g.FN + g.TN === 10000, 'grid sums to 10,000');
  for (const k of ['TP', 'FP', 'FN', 'TN']) ok(Math.abs(g[k] - c[k]) < 1, 'grid rounding ' + k);
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['foot', 's2lgOne']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes('公共卫生 · 从曲线到干预'), 'footer');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording in ' + k);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
const htmlKeys = new Set([...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(m => m[1]));
for (const k of zk) if (/<[a-z]/.test(STRINGS.zh[k] + STRINGS.en[k])) ok(htmlKeys.has(k), 'markup key rendered as HTML: ' + k);
for (const id of ['r0', 'g0', 'r1', 'd1', 'clear1', 't2', 'play2', 'pre3a', 'pre3b', 'pre3c', 'cc3', 'st3', 'ln3', 'checkQuiz', 'v4', 'e4', 'p5', 'se5', 'sp5', 'usePeak5', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#[\w-]+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#[\w-]+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/body/public-health/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS public-health core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · peak ${pct(b.peak)}% day ${b.peakDay} · final ${pct(b.final)}%`);
