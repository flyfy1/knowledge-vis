'use strict';
// Attention model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions on tiny hand-set vectors; loads in the browser and in node. Nothing here is trained.
(function (root) {
  const DEG = Math.PI / 180;
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const rot = (v, a) => [Math.cos(a) * v[0] - Math.sin(a) * v[1], Math.sin(a) * v[0] + Math.cos(a) * v[1]];
  const scale = (v, s) => v.map(x => x * s);
  const add = (a, b) => a.map((x, i) => x + b[i]);

  // Numerically safe softmax of beta·scores (subtracting the maximum changes nothing).
  function softmax(scores, beta = 1) {
    const z = scores.map(s => beta * s), m = Math.max(...z), e = z.map(v => Math.exp(v - m)), S = e.reduce((a, b) => a + b, 0);
    return e.map(v => v / S);
  }
  const effCount = w => 1 / w.reduce((s, v) => s + v * v, 0); // "how many entries it effectively looks at"
  const argmax = a => a.reduce((b, v, i) => (v > a[b] ? i : b), 0);

  /* ---------- step 0/1: a four-entry memory ---------- */
  const MEM = { keyDeg: [20, 110, 200, 290], values: [3, 1, -2, 0.5] };
  const keys = () => MEM.keyDeg.map(d => [Math.cos(d * DEG), Math.sin(d * DEG)]);
  const queryAt = (deg, len) => [len * Math.cos(deg * DEG), len * Math.sin(deg * DEG)];
  function lookup(qDeg, qLen, beta = 1, shift = 0) {
    const K = keys(), q = queryAt(qDeg, qLen), scores = K.map(k => dot(q, k) + shift), w = softmax(scores, beta);
    const soft = w.reduce((s, v, j) => s + v * MEM.values[j], 0), hard = MEM.values[argmax(scores)];
    return { scores, w, soft, hard, best: argmax(scores) };
  }

  /* ---------- steps 2/3: a five-token sentence ---------- */
  // Hand-set 2-D embeddings (d = 2). W_K = I, W_V = I, W_Q = 1.5 · rotation(φ). Nothing is learned.
  const TOK = [[1.0, 0.3], [0.1, 1.0], [0.6, -0.8], [0.2, -0.9], [-0.7, 0.5]]; // cat, chased, ball, it, tired
  const QSCALE = 3, D = 2;
  function attention(phiDeg, masked = false, X = TOK) {
    const Q = X.map(x => scale(rot(x, phiDeg * DEG), QSCALE)), K = X, V = X, n = X.length;
    const S = Q.map(q => K.map(k => dot(q, k) / Math.sqrt(D)));
    const A = S.map((row, i) => {
      if (!masked) return softmax(row);
      const w = softmax(row.slice(0, i + 1)); return row.map((_, j) => (j <= i ? w[j] : 0));
    });
    const O = A.map(row => row.reduce((o, a, j) => add(o, scale(V[j], a)), [0, 0]));
    return { Q, K, V, S, A, O, n };
  }

  /* ---------- step 4: why divide by √d ---------- */
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(rnd) { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); }
  const NKEYS = 8, TRIALS = 400, SEED = 2026;
  // For dimension d: per trial, one query and 8 keys with independent N(0, 1) components.
  function scalingStudy(d, trials = TRIALS, seed = SEED) {
    const rnd = mulberry32(seed + d), raw = [], sc = [];
    let maxRaw = 0, maxSc = 0, gRaw = 0, gSc = 0;
    for (let t = 0; t < trials; t++) {
      const q = Array.from({ length: d }, () => gauss(rnd));
      const s = Array.from({ length: NKEYS }, () => dot(q, Array.from({ length: d }, () => gauss(rnd))));
      raw.push(...s); sc.push(...s.map(v => v / Math.sqrt(d)));
      const w1 = softmax(s), w2 = softmax(s.map(v => v / Math.sqrt(d))), m1 = Math.max(...w1), m2 = Math.max(...w2);
      maxRaw += m1; maxSc += m2; gRaw += m1 * (1 - m1); gSc += m2 * (1 - m2); // ∂w_top/∂s_top = w(1 − w)
    }
    const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / (a.length - 1)); };
    return { d, raw, sc, sdRaw: sd(raw), sdSc: sd(sc), maxRaw: maxRaw / trials, maxSc: maxSc / trials, gRaw: gRaw / trials, gSc: gSc / trials };
  }
  const DIMS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

  /* ---------- step 5: attention alone ignores word order ---------- */
  const WORDS = [[0.9, 0.4], [-0.2, 1.0], [0.7, -0.6]]; // dog, bites, man
  const PHI5 = 50, OMEGA = 1.1;
  const posEnc = (pos, a) => [a * Math.sin(OMEGA * (pos + 1)), a * Math.cos(OMEGA * (pos + 1))];
  // order: array of word ids in sentence order. Returns each word's output (indexed by word id).
  function orderOutputs(order, a) {
    const X = order.map((w, pos) => add(WORDS[w], posEnc(pos, a)));
    const r = attention(PHI5, false, X), out = [];
    order.forEach((w, pos) => { out[w] = r.O[pos]; });
    return { out, A: r.A, X };
  }
  function orderGap(a) {
    const o1 = orderOutputs([0, 1, 2], a).out, o2 = orderOutputs([2, 1, 0], a).out;
    return o1.map((v, w) => Math.hypot(v[0] - o2[w][0], v[1] - o2[w][1]));
  }

  /* ---------- step 0: hard vs soft over a full turn of the query ---------- */
  const Q0LEN = 2.5;
  function sweepStats(len = Q0LEN, stepDeg = 1) {
    const jumps = []; let maxSlope = 0, prev = lookup(0, len);
    for (let a = stepDeg; a <= 360 + 1e-9; a += stepDeg) {
      const cur = lookup(a, len);
      if (cur.hard !== prev.hard) jumps.push(Math.abs(cur.hard - prev.hard));
      maxSlope = Math.max(maxSlope, Math.abs(cur.soft - prev.soft) / stepDeg);
      prev = cur;
    }
    return { jumps, jMin: Math.min(...jumps), jMax: Math.max(...jumps), maxSlope };
  }

  /* ---------- step 3: convex hull of the value vectors ---------- */
  function hull(P) { // Andrew's monotone chain, counter-clockwise
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function inHull(pt, H, tol = 1e-9) {
    for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length]; if ((b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]) < -tol) return false; }
    return true;
  }
  const upperSum = A => A.reduce((s, row, i) => s + row.reduce((u, v, j) => u + (j > i ? v : 0), 0), 0);

  const api = { Q0LEN, sweepStats, hull, inHull, upperSum, DEG, dot, rot, softmax, effCount, argmax, MEM, keys, queryAt, lookup, TOK, QSCALE, D, attention, mulberry32, gauss, NKEYS, TRIALS, SEED, scalingStudy, DIMS, WORDS, PHI5, OMEGA, posEnc, orderOutputs, orderGap };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ATT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
