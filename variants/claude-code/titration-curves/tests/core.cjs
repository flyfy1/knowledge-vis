'use strict';
// Titration curves (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (k, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][k].includes(s), `${l}.${k} quotes ${s}`));
const AC = M.ACETIC;

// ---- the solver satisfies the charge balance and matches closed forms ----
for (const kind of ['strong', 'weak']) for (const c of M.CONCS) for (let V = 0; V <= 50; V += 0.25) {
  const p = M.pH(kind, AC, c, V), h = Math.pow(10, -p), Vt = M.VA + V, CA = c * M.VA / Vt, Na = c * V / Vt, Ka = Math.pow(10, -AC);
  const A = kind === 'strong' ? CA : CA * Ka / (Ka + h);
  near((h + Na - M.KW / h - A) / Math.max(h, Na, A, M.KW / h), 0, 1e-9, `charge balance ${kind} c=${c} V=${V}`);
}
// strong acid before equivalence: [H⁺] = c/2 + √(c²/4 + Kw) of the excess; after: same for OH⁻ (formula quoted in the finale, ≈ excess ÷ volume)
for (const c of M.CONCS) for (let V = 0; V <= 50; V += 0.5) {
  const d = c * (M.VA - V) / (M.VA + V), h = d >= 0 ? d / 2 + Math.sqrt(d * d / 4 + M.KW) : M.KW / (-d / 2 + Math.sqrt(d * d / 4 + M.KW));
  near(M.pH('strong', 0, c, V), -Math.log10(h), 1e-9, 'strong closed form');
}
// pH rises monotonically with V (needed for volumeAt and the ⟺ claim)
for (const kind of ['strong', 'weak']) for (const c of M.CONCS) { let prev = -1; for (let V = 0; V <= 50; V += 0.01) { const p = M.pH(kind, AC, c, V); ok(p > prev, 'monotone'); prev = p; } }

// ---- step 0 ----
near(M.pH('strong', 0, 0.1, 0), 1, 1e-6, 'HCl starts at pH 1.00');
near(M.pH('strong', 0, 0.1, 25), 7, 1e-6, 'strong equivalence 7.00');
ok(M.pH('strong', 0, 0.1, 20) < 2 && M.pH('strong', 0, 0.1, 20) > 1.9, 's0hint: first 20-odd mL only to about pH 2');
ok(M.pH('weak', AC, 0.1, 0) > M.pH('strong', 0, 0.1, 0) + 1, 'acetic acid starts higher');
ok(M.jump('weak', AC, 0.1).height < M.jump('strong', 0, 0.1).height, 'acetic acid leap shorter');
near(M.inventory(0.1, 0).nA, 2.5, 1e-12, '2.50 mmol acid'); both('s0e', '2.50 mmol'); both('s0e', '25.00 mL');

// ---- step 1: per-drop jumps ----
near(M.inventory(0.1, 20).left, 0.5, 1e-12, '0.500 mmol at 20 mL'); near(M.inventory(0.1, 20).drop / M.inventory(0.1, 20).left, 0.01, 1e-12, '1% per drop at 20 mL');
near(M.inventory(0.1, 24.95).left, 0.005, 1e-12, 'one drop left at 24.95'); near(M.DROP * 0.1, 0.005, 1e-15, '0.005 mmol per drop');
both('s1e', '0.005 mmol'); both('s1e', '0.500 mmol'); both('s1e', '24.95');
near(M.dropJump('strong', 0, 0.1, 24.95), 3, 0.05, '24.95 → 25.00 ≈ +3'); near(M.dropJump('strong', 0, 0.1, 25), 3, 0.05, '25.00 → 25.05 ≈ +3');
near(M.pH('strong', 0, 0.1, 24.95), 4, 0.01, 'pH 4.00 at 24.95'); // thousandfold drop of [H⁺] in the next drop
near(Math.pow(10, M.pH('strong', 0, 0.1, 25) - M.pH('strong', 0, 0.1, 24.95)), 1000, 30, 'about a thousandfold');
// the two drops either side of 25 mL are the largest on the 20–30 mL walk; jumps grow towards 25 then shrink
let best = 0, bestV = 0; for (let q = 0; q < 200; q++) { const v = 20 + q * M.DROP, d = M.dropJump('strong', 0, 0.1, v); if (d > best) { best = d; bestV = v; } }
ok(Math.abs(bestV - 24.95) < 1e-9 || Math.abs(bestV - 25) < 1e-9, 'largest jump at the equivalence drops');
for (let q = 1; q < 99; q++) { const v = 20 + q * M.DROP; ok(M.dropJump('strong', 0, 0.1, v) > M.dropJump('strong', 0, 0.1, v - M.DROP), 'jumps grow towards 25'); }
for (let q = 102; q < 200; q++) { const v = 20 + q * M.DROP; ok(M.dropJump('strong', 0, 0.1, v) < M.dropJump('strong', 0, 0.1, v - M.DROP), 'jumps shrink after 25'); }
ok(M.dropJump('strong', 0, 0.1, 29.9) < 3.2 && best < 3.2, 'stems fit the 0–3.2 axis');

// ---- step 2: weak acids ----
for (let pk = 2; pk <= 10.0001; pk += 0.02) {
  const half = M.pH('weak', pk, 0.1, 12.5), eq = M.pH('weak', pk, 0.1, 25);
  ok(eq > 7, 'weak equivalence above 7 at pKa ' + pk);
  if (pk >= 4 - 1e-9) ok(Math.abs(half - pk) < 0.01, `half-eq within 0.01 of pKa at ${pk}`);
  if (pk > 2.02) ok(eq > M.pH('weak', pk - 0.02, 0.1, 25), 'equivalence pH rises with pKa');
  if (pk > 2.02) ok(M.jump('weak', pk, 0.1).height < M.jump('weak', pk - 0.02, 0.1).height + 1e-9, 'leap shorter for larger pKa');
}
near(M.pH('weak', 2, 0.1, 12.5) - 2, 0.18, 0.01, 'pKa 2: off by about 0.18');
both('s2hint', '0.18'); both('s2hint', '0.01');
near(M.pH('weak', AC, 0.1, 12.5), AC, 0.001, 'acetic half-equivalence = 4.76');

// ---- step 3: jump ranges ----
const J = (k, c) => M.jump(k, AC, c);
near(J('strong', 0.1).a, 4.30, 0.005, 'HCl 0.1 jump a'); near(J('strong', 0.1).b, 9.70, 0.005, 'HCl 0.1 jump b');
near(J('strong', 0.01).a, 5.30, 0.005, 'HCl 0.01 a'); near(J('strong', 0.01).b, 8.70, 0.005, 'HCl 0.01 b');
near(J('strong', 0.001).a, 6.28, 0.005, 'HCl 0.001 a'); near(J('strong', 0.001).b, 7.72, 0.005, 'HCl 0.001 b');
near(J('weak', 0.1).a, 7.75, 0.005, 'HAc 0.1 a'); near(J('weak', 0.1).b, 9.70, 0.005, 'HAc 0.1 b');
ok(J('weak', 0.001).height < 0.4, 'HAc 0.001 < 0.4 units');
for (const s of ['4.30–9.70', '5.30–8.70', '6.28–7.72', '7.75–9.70']) both('s3hint', s);
for (const k of ['strong', 'weak']) for (let i = 1; i < 3; i++) ok(J(k, M.CONCS[i]).a > J(k, M.CONCS[i - 1]).a - 0.2 && J(k, M.CONCS[i]).b < J(k, M.CONCS[i - 1]).b && J(k, M.CONCS[i]).height < J(k, M.CONCS[i - 1]).height, 'dilution shortens the jump');
for (const c of M.CONCS) ok(M.pH('strong', 0, c, 0) < M.pH('strong', 0, c * 0.1 || c, 0) || c === 0.001, 'starts higher when diluted');

// ---- step 4: indicators ----
for (const k of ['strong', 'weak']) for (const c of M.CONCS) for (const ind of M.INDICATORS) {
  const e = M.endPoint(k, AC, c, ind), inside = M.inJump(k, AC, c, ind);
  ok(e !== null, 'end point exists');
  ok(inside === (Math.abs(e.rel) <= 0.001 + 1e-12), `⟺ claim ${k} ${c} ${ind.id}`);
  if (e.V > 0) near(M.pH(k, AC, c, e.V), M.midOf(ind), 1e-6, 'end point at change point');
}
near(M.endPoint('strong', AC, 0.1, M.indicator('mo')).rel, -0.0036, 0.00005, 'methyl orange −0.36%'); both('s4hint', '−0.36%');
for (const ind of M.INDICATORS) ok(ind.hi >= J('strong', 0.1).a && ind.lo <= J('strong', 0.1).b, 'every band overlaps the HCl 0.1 jump');
ok(M.INDICATORS.every(ind => ind.id === 'mo' || Math.abs(M.endPoint('strong', AC, 0.1, ind).rel) < Math.abs(M.endPoint('strong', AC, 0.1, M.indicator('mo')).rel)), 'methyl orange worst for HCl 0.1');
ok(M.INDICATORS.filter(ind => M.inJump('weak', AC, 0.1, ind)).map(d => d.id).join() === 'pp', 'acetic 0.1: only phenolphthalein');
ok(M.INDICATORS.filter(ind => M.inJump('strong', AC, 0.001, ind)).map(d => d.id).join() === 'btb', 'HCl 0.001: only BTB');
for (const id of ['mo', 'mr']) ok(M.endPoint('weak', AC, 0.1, M.indicator(id)).err < -5, id + ' more than 5 mL early on acetic acid');
both('s4hint', '7.75');
// zoom window 23–27 mL; the off-window arrow is used exactly when the end point is outside
ok(M.endPoint('weak', AC, 0.1, M.indicator('mo')).V < 23, 'some end points fall outside the zoom');

// ---- quiz ----
ok(M.inJump('weak', AC, 0.1, M.indicator('pp')) && !M.inJump('weak', AC, 0.1, M.indicator('btb')) && !M.inJump('weak', AC, 0.1, M.indicator('mo')), 'quiz answer b');
ok(M.endPoint('weak', AC, 0.1, M.indicator('btb')).err < 0, 'BTB early');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right figure references'); }

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['k0s', 'k0w', 'v0', 'auto0', 'clear0', 'v1', 'walk1', 'clear1', 'pk2', 'k3s', 'k3w', 'c3_0', 'c3_1', 'c3_2', 'k4s', 'k4w', 'c4_0', 'c4_1', 'c4_2', 'i4_mo', 'i4_mr', 'i4_btb', 'i4_pp', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance hooks');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/solutions/titration-curves/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS titration-curves core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
