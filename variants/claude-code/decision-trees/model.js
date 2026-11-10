'use strict';
// Decision-tree lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, impurity, gain, tree, accuracy and curve on the page is computed here; tests/core.cjs pins
// the claims. Loads in the browser (window.DT_MODEL) and in node (module.exports).
// Data are SIMULATED: a made-up rule for "pass / fail" from weekly study hours and nightly sleep hours,
// with a fraction of labels flipped at random. Nothing here is measured from real students.
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // Feature ranges (study: hours per week; sleep: hours per night).
  const FEAT = [{ key: 'study', min: 0, max: 12 }, { key: 'sleep', min: 4, max: 10 }];
  // The hidden rule: pass when (study ≥ 5 and sleep ≥ 6.5) or study ≥ 10.
  const truth = (s, z) => ((s >= 5 && z >= 6.5) || s >= 10 ? 1 : 0);
  const round1 = v => Math.round(v * 10) / 10;

  // n points; each carries its own uniform u, so a label is flipped when u < noise. Raising the noise
  // only adds flips (the flipped set at 5 % is inside the flipped set at 10 %).
  function makeSet(seed, n) {
    const r = mulberry32(seed), pts = [];
    for (let i = 0; i < n; i++) {
      const s = round1(r() * 12), z = round1(4 + r() * 6), u = r();
      pts.push({ x: [s, z], clean: truth(s, z), u });
    }
    return pts;
  }
  const TRAIN_RAW = makeSet(72, 80);
  const TEST_RAW = makeSet(2024, 600);
  const NOISE0 = 0.08;
  const withNoise = (raw, noise) => raw.map(p => ({ x: p.x, y: p.u < noise ? 1 - p.clean : p.clean, flipped: p.u < noise }));
  const train = (noise = NOISE0) => withNoise(TRAIN_RAW, noise);
  const test = (noise = NOISE0) => withNoise(TEST_RAW, noise);

  // ---- impurity of a group with share p of class 1 ----
  const H2 = p => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));
  const gini = p => 2 * p * (1 - p);
  const errRate = p => Math.min(p, 1 - p);
  const MEASURES = { error: errRate, gini, entropy: H2 };
  const count = pts => { let k = 0; for (const p of pts) k += p.y; return { n: pts.length, k }; };
  const share = c => (c.n ? c.k / c.n : 0);

  // Split decrease for a parent (n, k) cut into left (nL, kL) and right (the rest), under a measure.
  function decrease(measure, n, k, nL, kL) {
    const f = MEASURES[measure], nR = n - nL, kR = k - kL;
    const before = f(k / n), after = (nL ? nL / n * f(kL / nL) : 0) + (nR ? nR / n * f(kR / nR) : 0);
    return { before, after, gain: before - after };
  }

  // ---- one cut: left = feature value < threshold ----
  function cutStats(pts, f, thr) {
    const L = pts.filter(p => p.x[f] < thr), R = pts.filter(p => p.x[f] >= thr);
    const cl = count(L), cr = count(R), ca = count(pts);
    const majL = cl.k * 2 >= cl.n ? 1 : 0, majR = cr.k * 2 >= cr.n ? 1 : 0;
    const errors = (majL ? cl.n - cl.k : cl.k) + (majR ? cr.n - cr.k : cr.k);
    const d = decrease('entropy', ca.n, ca.k, cl.n, cl.k);
    return { left: cl, right: cr, majL, majR, errors, acc: 1 - errors / ca.n, Hbefore: d.before, Hafter: d.after, gain: d.gain };
  }
  // Candidate thresholds: midpoints between consecutive distinct values.
  function candidates(pts, f) {
    const v = [...new Set(pts.map(p => p.x[f]))].sort((a, b) => a - b), out = [];
    for (let i = 1; i < v.length; i++) out.push((v[i - 1] + v[i]) / 2);
    return out;
  }
  // The midpoint that gives the same split as cutting at `thr` (for readouts: "below 5" rather than "below 4.95").
  function canonical(pts, f, thr) {
    let lo = -Infinity, hi = Infinity;
    for (const p of pts) { const v = p.x[f]; if (v < thr && v > lo) lo = v; if (v >= thr && v < hi) hi = v; }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return thr;
    return (lo + hi) / 2;
  }
  // Gain at every candidate (step 2 curve) and the best cut. Ties: lower feature index, then lower threshold.
  function scan(pts, f) { return candidates(pts, f).map(thr => ({ thr, gain: cutStats(pts, f, thr).gain })); }
  function bestCut(pts) {
    let best = null;
    for (let f = 0; f < 2; f++) for (const c of scan(pts, f)) if (!best || c.gain > best.gain + 1e-12) best = { f, thr: c.thr, gain: c.gain };
    return best;
  }

  // ---- greedy tree, depth-limited (step 3, 4, 5). `force` fixes the root cut (step 5). ----
  function grow(pts, maxDepth, depth = 0, force = null, box = [[-Infinity, Infinity], [-Infinity, Infinity]]) {
    const c = count(pts), node = { n: c.n, k: c.k, pred: c.k * 2 > c.n ? 1 : c.k * 2 < c.n ? 0 : null, depth, box };
    if (node.pred === null) node.pred = 1; // ties go to "pass"; only matters for tiny leaves
    if (depth >= maxDepth || c.k === 0 || c.k === c.n || c.n < 2) return node;
    const cut = depth === 0 && force ? { ...force, gain: cutStats(pts, force.f, force.thr).gain } : bestCut(pts);
    if (!cut || (cut.gain <= 1e-12 && !(depth === 0 && force))) return node;
    const L = pts.filter(p => p.x[cut.f] < cut.thr), R = pts.filter(p => p.x[cut.f] >= cut.thr);
    if (!L.length || !R.length) return node;
    const bl = box.map(b => b.slice()), br = box.map(b => b.slice());
    bl[cut.f][1] = cut.thr; br[cut.f][0] = cut.thr;
    node.cut = cut;
    node.left = grow(L, maxDepth, depth + 1, null, bl);
    node.right = grow(R, maxDepth, depth + 1, null, br);
    return node;
  }
  function predict(tree, x) { let nd = tree; while (nd.cut) nd = x[nd.cut.f] < nd.cut.thr ? nd.left : nd.right; return nd.pred; }
  function leaves(tree) { return tree.cut ? leaves(tree.left).concat(leaves(tree.right)) : [tree]; }
  function depthOf(tree) { return tree.cut ? 1 + Math.max(depthOf(tree.left), depthOf(tree.right)) : 0; }
  function accuracy(tree, pts) { let ok = 0; for (const p of pts) if (predict(tree, p.x) === p.y) ok++; return pts.length ? ok / pts.length : 0; }

  // Step 4: train / test accuracy for depth 0..maxD at a noise level.
  function depthCurve(noise, maxD = 10) {
    const tr = train(noise), te = test(noise), out = [];
    for (let d = 0; d <= maxD; d++) { const T = grow(tr, d); out.push({ d, train: accuracy(T, tr), test: accuracy(T, te), leaves: leaves(T).length }); }
    return out;
  }
  // Best achievable test accuracy if the hidden rule itself were the model.
  function ruleAccuracy(noise) { const te = test(noise); let ok = 0; for (const p of te) if (truth(p.x[0], p.x[1]) === p.y) ok++; return ok / te.length; }

  // ---- step 5: XOR-shaped data on [0, 1]², no noise ----
  function makeXor(seed, n) {
    const r = mulberry32(seed), pts = [];
    for (let i = 0; i < n; i++) { const a = Math.round(r() * 100) / 100, b = Math.round(r() * 100) / 100; pts.push({ x: [a, b], y: (a >= 0.5) !== (b >= 0.5) ? 1 : 0 }); }
    return pts;
  }
  const XOR_PTS = makeXor(31, 80);
  const XOR_TEST = makeXor(77, 600);

  const api = { mulberry32, FEAT, truth, makeSet, TRAIN_RAW, TEST_RAW, NOISE0, train, test, H2, gini, errRate, MEASURES, count, share, decrease, cutStats, candidates, canonical, scan, bestCut, grow, predict, leaves, depthOf, accuracy, depthCurve, ruleAccuracy, makeXor, XOR_PTS, XOR_TEST };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
