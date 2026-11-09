'use strict';
// Place value (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node variants/claude-code/place-value/tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([-\\d.]+)" max="([-\\d.]+)" step="([-\\d.]+)" value="([-\\d.]+)"`)); assert.ok(m, 'slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const range = s => { const out = []; for (let v = s.min; v <= s.max + 1e-9; v += s.step) out.push(+v.toFixed(6)); return out; };

// ---- digits / value round trip ----
for (let n = 0; n <= 9999; n++) { const d = M.digits(n); ok(d.length === 4 && d.every(v => v >= 0 && v <= 9) && M.value(d) === n && d.reduce((s, v, i) => s + v * M.POW[i], 0) === n, 'digits ' + n); }

// ---- step 0: bundling conserves sticks; after tying, fewer than 10 loose and fewer than 10 bundles ----
const n0 = slider('n0');
for (const N of range(n0)) {
  for (const st of [0, 1, 2]) { const b = M.bundle(N, st); ok(b.hundreds * 100 + b.tens * 10 + b.ones === N, `bundle ${N} stage ${st}`); }
  const b2 = M.bundle(N, 2); ok(b2.ones < 10 && b2.tens < 10 && M.value([0, b2.hundreds, b2.tens, b2.ones]) === N, 'digits = bundle counts ' + N);
  const b1 = M.bundle(N, 1); ok(b1.ones < 10, 'stage 1 leaves < 10 loose');
  for (let k = 0; k <= b1.tens; k++) { const p = M.partial(N, 0, k); ok(p.tens * 10 + p.ones === N, 'partial tens'); }
  for (let k = 0; k <= b2.hundreds; k++) { const p = M.partial(N, 1, k); ok(p.hundreds * 100 + p.tens * 10 + p.ones === N && p.tens >= 0, 'partial hundreds'); }
}
ok(n0.value === 247 && M.bundle(247, 1).tens === 24 && M.bundle(247, 2).hundreds === 2, 's0hint: 247 → 24 bundles → 2 big bundles');

// ---- step 1: frame reading, defaults 247 ----
ok(M.value([0, 1, 2, 3].map(i => slider('b1_' + i).value)) === 247, 'step 1 default frame reads 247');

// ---- step 2: adding one; carries happen exactly when a column rolls from 9 to 0 ----
for (let n = 0; n < 9999; n++) {
  const r = M.addOne(M.digits(n)), want = M.digits(n + 1);
  ok(!r.overflow && M.value(r.digits) === n + 1, 'addOne ' + n);
  const rolled = [0, 1, 2, 3].filter(i => M.digits(n)[i] === 9 && want[i] === 0);
  assert.deepEqual([...r.carried].sort(), rolled.sort()); checks++;
}
ok(M.addOne(M.digits(9999)).overflow, '9999 + 1 overflows the four-rod frame');
const seq = M.countFrom(95, 10);
ok(seq.map(s => s.n).join() === '96,97,98,99,100,101,102,103,104,105', 'from 95 ten steps');
ok(seq.slice(0, 4).every(s => !s.carried.length) && seq[4].carried.length === 2, 's2hint: four quiet steps, then two carries at 100');
ok(M.countFrom(995, 10)[4].n === 1000 && M.countFrom(995, 10)[4].carried.length === 3, '995 → 1000 carries three times');
ok(slider('start2').value === 95 && slider('start2').max + 10 <= 9999, 'start slider stays inside the frame for 10 steps');

// ---- step 3: same digit ×10 per place ----
for (const d of range(slider('d3'))) { ok(M.placeValue(d, 2) === 10 * M.placeValue(d, 1) && M.placeValue(d, 1) === 10 * M.placeValue(d, 0), 'x10 per place ' + d); ok(M.placeValue(d, 2) + M.placeValue(d, 1) + d === 111 * d, 'ddd'); }

// ---- step 4: dropping the zero ----
const z = M.dropZero(3, 0, 5); ok(z.right === 305 && z.wrong === 35 && z.diff === 270, '305 → 35, 270 lost');
for (const h of range(slider('h4'))) for (const t of range(slider('t4'))) for (const o of range(slider('o4'))) {
  const r = M.dropZero(h, t, o);
  ok(r.allowed === (t === 0), 'button enabled only for tens = 0');
  if (r.allowed) ok(r.diff === 90 * h && r.wrong < r.right, 'loss is 90 × h');
}
ok(M.dropZero(3, 0, 0).wrong === 30 && M.dropZero(3, 0, 0).diff === 270, '300 → 30');

// ---- step 5: comparison agrees with < > for every pair on the slider grid ----
for (let a = 0; a <= 999; a += 7) for (let b = 0; b <= 999; b += 3) {
  const c = M.compare(a, b);
  ok(c.sign === Math.sign(a - b), `compare ${a} ${b}`);
}
// the reason: below the first differing place the rest is at most maxBelow < one unit of that place
for (let p = 0; p < 3; p++) ok(M.maxBelow(p) < Math.pow(10, 2 - p), 'maxBelow < unit');
assert.deepEqual([M.maxBelow(0), M.maxBelow(1), M.maxBelow(2)], [99, 9, 0]); checks++;
const d5 = M.compare(358, 385); ok(slider('a5').value === 358 && slider('b5').value === 385 && d5.place === 1 && d5.sign === -1, 's5t: 358 < 385, decided in the tens');
ok(M.compare(400, 385).place === 0 && M.compare(385, 99).db[0] === 0 && M.compare(385, 99).place === 0, 's5hint: 400 decides in the hundreds; 99 gets a leading 0');

// ---- step 6: ×10 shifts ----
for (const n of range(slider('n6'))) { const s = String(n); ok(String(M.times(n, 1)) === s + '0' && String(M.times(n, 2)) === s + '00' && String(M.times(n, 2)).length <= 5, 'shift ' + n); }
ok(slider('n6').value === 47 && M.times(47, 1) === 470, 's6t: 47 × 10 = 470');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys referenced in HTML/app exist ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['pTh', 'pH', 'pT', 'pO', 'pTTh']) ok(STRINGS.zh[k] !== undefined, 'place key ' + k);
for (const id of ['n0', 'tie10', 'tie100', 'untie', 'b1_0', 'b1_3', 'start2', 'plus2', 'run2', 'reset2', 'd3', 'h4', 't4', 'o4', 'drop4', 'a5', 'b5', 'n6', 'shift6']) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/place-value/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS place-value core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
