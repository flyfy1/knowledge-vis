'use strict';
// Eigenvectors (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes "${s}"`); };
const lineDiff = (a, b) => { let d = Math.abs(M.fold180(a) - M.fold180(b)); return d > 90 ? 180 - d : d; };
// Brute-force check that dir θ is an eigen-direction with eigenvalue λ.
const isEig = (A, th, l, tol = 1e-12) => { const v = M.unit(th), w = M.apply(A, v); return Math.hypot(w[0] - l * v[0], w[1] - l * v[1]) <= tol; };

// ---- step 0: the default matrix ----
const A0 = M.DEFAULT_A, e0 = M.eig2(A0);
ok(e0.type === 'two', 'default has two directions');
near(e0.l1, 2, 1e-12, 'λ₁ = 2'); near(e0.l2, 0.5, 1e-12, 'λ₂ = 0.5');
near(e0.dirs[0], 45, 1e-9, 'λ₁ along 45°'); near(e0.dirs[1], 116.565, 1e-3, 'λ₂ along 116.565°');
ok(isEig(A0, 45, 2) && isEig(A0, e0.dirs[1], 0.5), 'brute-force eigen check');
both('s0e', '45°'); both('s0e', '116.6°'); both('s0e', '24');
// Hint: b → 0 makes a lower-triangular matrix with a vertical eigen-direction.
{ const e = M.eig2([[1.5, 0], [1, 1]]); ok(e.type === 'two' && e.dirs.some(d => lineDiff(d, 90) < 1e-9), 'b = 0 gives a vertical eigen-direction'); both('s0hint', '90°'); }
{ const R = [[-1, 0], [0, 1]], e = M.eig2(R); ok(e.l2 === -1 && lineDiff(e.dirs[1], 0) < 1e-12 && isEig(R, 0, -1), 'x-axis flipped, λ = −1'); both('s0hint', 'λ = −1'); }
// Every slider matrix: eig2 agrees with brute force, and the type matches the discriminant.
const grid = []; for (let i = -20; i <= 20; i++) grid.push(i / 10);
let nTwo = 0, nC = 0;
for (const a of grid) for (const b of grid) for (const c of grid) for (const d of [-2, -1.3, -0.5, 0, 0.4, 1, 1.7, 2]) {
  const A = [[a, b], [c, d]], e = M.eig2(A);
  if (e.type === 'two') { nTwo++; for (let i = 0; i < 2; i++) { const l = [e.l1, e.l2][i]; ok(isEig(A, e.dirs[i], l, 1e-9 * Math.max(1, Math.abs(l), Math.abs(a) + Math.abs(b) + Math.abs(c) + Math.abs(d))), `eigen pair ${JSON.stringify(A)}`); } }
  else if (e.type === 'complex') { nC++; ok(e.disc < 0, 'complex ⇒ negative discriminant'); for (let th = 0; th < 180; th += 7.5) ok(Math.abs(M.turn(A, M.unit(th))) > 0, 'complex ⇒ every arrow turned'); }
  near(M.charPoly(A, e.type === 'complex' ? 0 : e.l1) * (e.type === 'complex' ? 0 : 1), 0, 1e-9, 'root of the characteristic polynomial');
}
ok(nTwo > 1000 && nC > 1000, 'grid covers both kinds');

// ---- step 1: turn angle and projection ----
for (let th = 0; th <= 180; th += 0.5) {
  const v = M.unit(th), sp = M.split(A0, v), tn = M.turn(A0, v);
  ok(tn > -90 && tn <= 90, 'turn angle in (−90, 90]');
  near(sp.w[0], sp.p * v[0] + sp.r[0], 1e-14, 'Av = p·v + leftover (x)'); near(sp.w[1], sp.p * v[1] + sp.r[1], 1e-14, 'Av = p·v + leftover (y)');
  near(sp.r[0] * v[0] + sp.r[1] * v[1], 0, 1e-14, 'leftover ⟂ v');
  near(Math.abs(Math.sin(tn * M.DEG)) * Math.hypot(...sp.w), sp.rn, 1e-12, 'leftover length = |Av|·|sin turn|');
}
// Turn angle crosses 0 exactly twice on [0, 180) for the default, at the eigen-directions.
{ const zs = []; let prev = Math.sign(M.turn(A0, M.unit(0)));
  for (let i = 1; i <= 18000; i++) { const th = i / 100, cur = M.turn(A0, M.unit(th)), sg = Math.sign(cur); if (sg === 0) continue; if (sg !== prev && Math.abs(cur) < 45) zs.push(th); prev = sg; }
  ok(zs.length === 2, 'two zero crossings, got ' + zs.length);
  ok(Math.abs(zs[0] - 45) <= 0.01 && Math.abs(zs[1] - 116.565) <= 0.01, 'crossings at the eigen-directions ' + zs);
}
// At the exact direction the leftover passes the 64-ε test; half a degree away it does not.
for (const [d, l] of [[e0.dirs[0], 2], [e0.dirs[1], 0.5]]) {
  const sp = M.split(A0, M.unit(d)); ok(sp.rn <= 64 * Number.EPSILON * Math.max(1, Math.hypot(...sp.w)), 'exact eigen-direction passes'); near(sp.p, l, 1e-12, 'p is the eigenvalue');
  for (const off of [-0.5, 0.5]) { const s2 = M.split(A0, M.unit(d + off)); ok(s2.rn > 1e-3, 'half a degree off is clearly not'); }
}
// Hint: 44.5° is half a degree off 45°, turn ≈ 0.4° (< 1°, so the "near" sentence shows).
{ const tn = M.turn(A0, M.unit(44.5)); near(tn, 0.375, 1e-3, 'turn at 44.5°'); ok(Math.abs(tn) < 1, '44.5° reads as near'); both('s1hint', '44.5°'); both('s1hint', '0.4°'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].boundary.includes('64'), 'boundary states the 64-ε tolerance');
{ const S = [[1, 1], [1, 1]]; ok(M.turn(S, M.unit(135)) === null || Math.abs(M.turn(S, M.unit(135))) < 1e-9 || Math.hypot(...M.apply(S, M.unit(135))) < 1e-15, 'Av ≈ 0 handled'); ok(M.turn([[0, 0], [0, 0]], [1, 0]) === null, 'Av = 0 → null'); }

// ---- step 2: characteristic polynomial ----
near(M.trace(A0), 2.5, 0, 'tr'); near(M.det(A0), 1, 0, 'det');
for (let l = -3; l <= 5; l += 0.01) {
  near(M.det(M.shift(A0, l)), M.charPoly(A0, l), 1e-12, 'det(A − λI) = λ² − tr·λ + det');
}
for (const l of [e0.l1, e0.l2]) { near(M.det(M.shift(A0, l)), 0, 1e-12, 'singular at root'); const nd = M.nullDir(M.shift(A0, l)); ok(nd !== null && isEig(A0, nd, l, 1e-12), 'squashed direction is the eigen-direction'); }
ok(M.nullDir([[0, 0], [0, 0]]) === null, 'zero matrix: every direction');
both('s2e', 'π·|det(A − λI)|');

// ---- step 3: discriminant, family and presets ----
for (let i = -20; i <= 20; i++) {
  const k = i / 20, F = M.family3(k), e = M.eig2(F);
  near(M.trace(F), 2, 0, 'family trace 2'); near(M.det(F), 1 - k, 1e-15, 'family det 1 − k'); near(e.disc, 4 * k, 1e-14, 'family disc 4k');
  ok(k > 1e-12 ? e.type === 'two' : k < -1e-12 ? e.type === 'complex' : e.type === 'repeated', 'family type at k = ' + k);
  ok((e.disc > 0) === (M.det(F) < M.trace(F) ** 2 / 4) || Math.abs(k) < 1e-12, 'below parabola ⇔ two directions');
}
{ const e = M.eig2(M.family3(0.25)); near(e.l1, 1.5, 1e-12, 'k = 0.25 λ₁'); near(e.l2, 0.5, 1e-12, 'k = 0.25 λ₂'); near(e.dirs[0], 26.565, 1e-3, '26.57°'); near(e.dirs[1], 153.435, 1e-3, '153.43°'); }
{ const e = M.eig2(M.family3(1)); ok(lineDiff(e.dirs[0], 45) < 1e-9 && lineDiff(e.dirs[1], 135) < 1e-9, 'k = 1 directions 45°, 135°'); }
both('s3e', '4k'); both('s3e', '1 − k');
{ const e = M.eig2(M.PRESETS3.rotation); ok(e.type === 'complex', 'rotation complex'); near(e.re, Math.cos(30 * M.DEG), 1e-12, 'Re = cos30°'); near(e.im, Math.sin(30 * M.DEG), 1e-12, 'Im = sin30°');
  for (let th = 0; th < 180; th += 1) near(Math.abs(M.turn(M.PRESETS3.rotation, M.unit(th))), 30, 1e-9, 'rotation turns every arrow 30°'); }
{ const e = M.eig2(M.PRESETS3.shear); ok(e.type === 'repeated' && e.dirs.length === 1 && lineDiff(e.dirs[0], 0) < 1e-12 && e.l1 === 1, 'shear: one horizontal direction'); }
{ const e = M.eig2(M.PRESETS3.scalar); ok(e.type === 'scalar' && e.l1 === 1.5, 'scalar: every direction'); for (let th = 0; th < 180; th += 5) ok(isEig(M.PRESETS3.scalar, th, 1.5), 'scalar eigen ' + th); }
{ const e = M.eig2(M.PRESETS3.reflection); ok(e.type === 'two' && e.l1 === 1 && e.l2 === -1 && lineDiff(e.dirs[0], 0) < 1e-12 && lineDiff(e.dirs[1], 90) < 1e-12, 'reflection ±1 on axes'); }
both('s3e', '30°'); both('s3e', '1.5');

// ---- step 4: repeated application ----
const ratio = A => { const e = M.eig2(A); return Math.min(Math.abs(e.l1), Math.abs(e.l2)) / Math.max(Math.abs(e.l1), Math.abs(e.l2)); };
near(ratio(M.PRESETS4.default), 0.25, 1e-12, 'default ratio 0.25');
near(ratio(M.PRESETS4.fib), (3 - Math.sqrt(5)) / 2, 1e-12, 'fib ratio'); near(ratio(M.PRESETS4.fib), 0.382, 5e-4, 'fib ratio ≈ 0.382');
near(ratio(M.PRESETS4.close), 0.7 / 1.2, 1e-12, 'close ratio'); near(ratio(M.PRESETS4.close), 0.583, 5e-4, 'close ratio ≈ 0.583');
{ const e = M.eig2(M.PRESETS4.close); near(e.l1, 1.2, 1e-12, 'close λ₁'); near(e.l2, 0.7, 1e-12, 'close λ₂'); }
{ const e = M.eig2(M.PRESETS4.fib); near(e.l1, (1 + Math.sqrt(5)) / 2, 1e-12, 'golden ratio'); near(e.l2, -0.618, 5e-4, 'fib λ₂'); }
for (const l of ['zh', 'en']) { ok(['0.25', '0.382', '0.583', '1.618', '−0.618', '1.2', '0.7'].every(s => STRINGS[l].s4e.includes(s)), l + ' s4e quotes the ratios'); ok(['0.6', '0.25', '0.583', '1.618', '135°'].every(s => STRINGS[l].s4hint.includes(s)), l + ' s4hint quotes'); }
near(Math.log10(0.25), -0.602, 1e-3, 'one step drops about 0.6 decades');
// Angle shrinks geometrically at |λ₂/λ₁| (checked once well past the start), growth → |λ₁|.
for (const [name, A] of Object.entries(M.PRESETS4)) {
  const q = ratio(A), e = M.eig2(A), dom = Math.max(Math.abs(e.l1), Math.abs(e.l2));
  for (let s = 0; s <= 180; s++) {
    const P = M.power(A, M.unit(s), 12), sub = e.dirs[1 - P.eig.domIdx];
    if (lineDiff(s, sub) < 1e-6) { for (const st of P.steps) near(st.ang, lineDiff(sub, e.dirs[P.eig.domIdx]), 1e-6, name + ': start on the other line stays there'); continue; }
    const a10 = P.steps[10].ang, a11 = P.steps[11].ang; if (a10 > 1e-6 && lineDiff(s, sub) > 1) near(Math.tan(a11 * M.DEG) / Math.tan(a10 * M.DEG), q, 0.05 * q + 2e-3, `${name} tan-angle ratio → q (s=${s})`);
    if (lineDiff(s, sub) > 5) near(P.steps[12].growth, dom, 0.02 * dom, name + ' growth → |λ₁|');
  }
}
{ const P = M.power(M.PRESETS4.default, M.unit(100), 12); near(P.steps[8].ang / P.steps[7].ang, 0.25, 0.01, 'default per-step angle ratio ≈ 0.25'); }
{ const P = M.power(M.PRESETS4.fib, [1, 0], 12), F = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
  for (let k = 0; k <= 12; k++) { assert.deepEqual(P.steps[k].v, [F[k + 1], F[k]], 'Fibonacci pair at k = ' + k); checks++; }
  near(P.steps[12].growth, (1 + Math.sqrt(5)) / 2, 1e-4, 'fib growth → φ'); both('s4hint', '1, 1, 2, 3, 5, 8'); }
{ const e = M.eig2(M.PRESETS4.close); near(e.dirs[1], 135, 1e-9, 'close λ₂ line is exactly 135°'); near(lineDiff(e.dirs[0], e.dirs[1]), 78.690, 1e-3, 'close lines 78.69° apart'); }
{ ok(M.power([[1, 0], [0, -1]], [1, 1], 3).eig.domIdx === null, 'equal |λ| → no dominant'); ok(M.power(M.PRESETS3.rotation, [1, 0], 3).eig.domIdx === null, 'rotation → no dominant'); }

// ---- step 5: PCA ----
ok(M.N_PTS === 160, '160 points'); both('s5e', '160');
const c1 = M.cloud(0.6), c2 = M.cloud(0.6); assert.deepEqual(c1, c2, 'fixed seed is reproducible'); checks++;
{ const { S } = M.covariance(c1), e = M.eig2(S);
  near(S[0][1], S[1][0], 0, 'S symmetric'); ok(e.type === 'two', 'S has two real eigenvalues');
  near(e.l1, 1.5765, 5e-5, 'ρ = 0.6 λ₁'); near(e.l2, 0.4131, 5e-5, 'ρ = 0.6 λ₂'); near(e.dirs[0], 41.25, 5e-3, 'λ₁ at 41.25°'); near(e.dirs[1], 131.25, 5e-3, 'λ₂ at 131.25°');
  near(e.l1 + e.l2, M.trace(S), 1e-12, 'λ₁ + λ₂ = trace'); near(M.trace(S), 1.9896, 5e-5, 'trace 1.9896'); }
// Projected variance: uᵀSu equals the brute-force variance; max at eigen-direction 1, min at 2, 90° apart, for every ρ.
for (let i = -9; i <= 9; i++) {
  const rho = i / 10, pts = M.cloud(rho), { S, mean } = M.covariance(pts), e = M.eig2(S);
  ok(e.type === 'two', 'covariance has two directions at ρ = ' + rho);
  near(lineDiff(e.dirs[0], e.dirs[1]), 90, 1e-9, 'eigen-directions perpendicular');
  near(e.l1 + e.l2, S[0][0] + S[1][1], 1e-12, 'sum = total variance');
  let best = -Infinity, worst = Infinity;
  for (let th = 0; th < 180; th += 0.25) {
    const v = M.varAlong(S, th); best = Math.max(best, v); worst = Math.min(worst, v);
    if (th % 15 === 0) { const u = M.unit(th), pr = pts.map(p => (p[0] - mean[0]) * u[0] + (p[1] - mean[1]) * u[1]); near(pr.reduce((s, x) => s + x * x, 0) / (pts.length - 1), v, 1e-12, 'uᵀSu = sample variance of projections'); }
  }
  near(M.varAlong(S, e.dirs[0]), e.l1, 1e-12, 'variance at top direction = λ₁'); near(M.varAlong(S, e.dirs[1]), e.l2, 1e-12, 'variance at bottom = λ₂');
  ok(best <= e.l1 + 1e-12 && worst >= e.l2 - 1e-12 && e.l1 - best < 1e-4 && worst - e.l2 < 1e-4, 'λ₁ / λ₂ are the max / min of the curve');
}
{ const e = M.eig2(M.covariance(M.cloud(-0.6)).S); ok(lineDiff(e.dirs[0], 135) < 6, 'ρ = −0.6 main axis about 135°: ' + e.dirs[0]); both('s5hint', '135°'); }
{ const e = M.eig2(M.covariance(M.cloud(0)).S); ok(e.l1 / e.l2 < 1.5, 'ρ = 0: eigenvalues close'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lgAv', 'formula', 'c3title']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('特征值与特征向量 · 矩阵不转的那些方向') && STRINGS.en.compare.includes('Eigenvalues & Eigenvectors · The Directions a Matrix Cannot Turn'), 'compare link names the original');
ok(STRINGS.zh.foot.includes('《特征值与特征向量 · 矩阵不转的那些方向》'), 'footer names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['rotation', 'shear', 'scalar', 'reflection']) ok(STRINGS.zh['p3_' + k] && k in M.PRESETS3, 'preset label p3_' + k);
for (const k of ['default', 'fib', 'close']) ok(STRINGS.zh['p4_' + k] && k in M.PRESETS4, 'preset label p4_' + k);
for (const k of ['complex', 'repeated', 'scalar', 'two']) ok(STRINGS.zh['s3why_' + k], 'why text ' + k);
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique');
for (const id of ['ma', 'mb', 'mc', 'md', 'reset0', 'th1', 'sweep1', 'jump1a', 'jump1b', 'l2', 'jump2a', 'jump2b', 'k3', 'presets3', 'presets4', 's4', 'k4', 'play4', 'rho5', 'th5', 'jump5']) ok(ids.includes(id), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard') && !app.includes('canvas-label-guard'), 'no label guard');
// Default slider values match the default matrix.
for (const [id, v] of [['ma', 1.5], ['mb', 0.5], ['mc', 1], ['md', 1]]) ok(new RegExp(`id="${id}"[^>]*value="${v}"`).test(html), 'default slider ' + id);

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/linear-algebra/eigenvectors/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS eigenvectors core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
