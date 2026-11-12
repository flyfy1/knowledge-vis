/* What a frontier model takes: the models, as pure functions (UMD: page and node).
 * No visible text here; every string the page shows lives in copy.*.js.
 *
 *  rng / data     seeded RNG; the "repeated letter string" task the tiny transformer was trained on,
 *                 and its exact Bayes-optimal loss (the floor no model can beat)
 *  TF             a real GPT-style decoder: token + learned position embeddings, pre-LayerNorm blocks with
 *                 multi-head causal self-attention and a GELU MLP, residual connections, final LayerNorm,
 *                 unembedding (Vaswani et al. 2017; Radford et al. 2019 for the pre-LN GPT-2 layout).
 *                 Full forward, KV-cached incremental forward with a multiply–add counter, head ablation,
 *                 round-to-nearest per-channel weight quantisation, evaluation.
 *  depth          signal propagation through a deep random stack, plain vs residual vs pre-LN residual
 *  count          parameter and FLOP counting for GPT-style configurations (incl. GQA and gated MLPs)
 *  scaling        Chinchilla parametric loss L(N,D) = E + A/N^α + B/D^β and its compute-optimal split
 *  bill           training compute 6·N·D → accelerator-hours, energy, money
 *  lora / bench   LoRA parameter and memory savings; binomial noise and contamination on a benchmark
 *  serve          KV-cache bytes, bandwidth-bound decode, batching, cost per million tokens
 *  moe / spec     top-k mixture-of-experts routing with capacity; speculative decoding (Leviathan et al. 2023)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FrontierModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ───────── seeded RNG (mulberry32) ───────── */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

/* ───────── the task: a random block of distinct letters, repeated ─────────
 * A block of p distinct letters (p uniform in pMin..pMax) is repeated until the sequence has T+1 letters.
 * Input = letters 0..T−1, target = letters 1..T. Once the block has come round once, every next letter is
 * determined; before that it is not. */
const CFG = { V: 26, T: 24, d: 32, H: 2, dh: 16, L: 2, F: 128, pMin: 3, pMax: 12 };

function genSeq(r, cfg) {
  cfg = cfg || CFG;
  const p = cfg.pMin + Math.floor(r() * (cfg.pMax - cfg.pMin + 1));
  const pool = []; for (let i = 0; i < cfg.V; i++) pool.push(i);
  for (let i = 0; i < p; i++) { const j = i + Math.floor(r() * (cfg.V - i)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  const s = []; for (let i = 0; i <= cfg.T; i++) s.push(pool[i % p]);
  return { seq: s, p };
}
function evalSet(seed, count, cfg) { const r = rng(seed); const out = []; for (let i = 0; i < count; i++) out.push(genSeq(r, cfg)); return out; }
// a position (input index i, target index i+1) is "repeat" once the block has been seen whole: i ≥ p
const isRepeat = (i, p) => i >= p;

/* Exact Bayes-optimal expected cross-entropy at each input position, averaged over p.
 * Before any repeat, the prefix is all-distinct and every p ≥ (position+1) explains it equally well, so the
 * posterior over p is uniform on the periods still possible. Target index k = i+1:
 *   k > p  → determined (loss 0);  k = p → the first letter again, prob q;  k < p → one of the 26−k unused
 *   letters, each (1−q)/(26−k),  where q = P(period = k | period ≥ k) = 1/#{p' ≥ max(k,pMin)} if k ≥ pMin. */
function bayesLoss(cfg) {
  cfg = cfg || CFG;
  const nP = cfg.pMax - cfg.pMin + 1, per = [];
  for (let i = 0; i < cfg.T; i++) {
    const k = i + 1;
    const alive = k >= cfg.pMin ? Math.max(0, cfg.pMax - Math.max(k, cfg.pMin) + 1) : nP;
    const q = (k >= cfg.pMin && k <= cfg.pMax) ? 1 / alive : 0;
    let e = 0;
    for (let p = cfg.pMin; p <= cfg.pMax; p++) {
      if (k > p) continue;
      e += (k === p ? -Math.log(q) : -Math.log((1 - q) / (cfg.V - k))) / nP;
    }
    per.push(e);
  }
  const mean = per.reduce((a, b) => a + b, 0) / per.length;
  return { per, mean };
}

/* ───────── TF: the tiny transformer ───────── */
// parameter layout; every matrix is [in, out] row-major, so y = x·W + b
function layout(cfg) {
  cfg = cfg || CFG;
  const { V, T, d, L, F } = cfg, list = [];
  const add = (name, r, c) => list.push({ name, r, c });
  add('tok', V, d); add('pos', T, d);
  for (let l = 0; l < L; l++) {
    add(`l${l}.ln1.g`, 1, d); add(`l${l}.ln1.b`, 1, d);
    add(`l${l}.qkv.W`, d, 3 * d); add(`l${l}.qkv.b`, 1, 3 * d);
    add(`l${l}.o.W`, d, d); add(`l${l}.o.b`, 1, d);
    add(`l${l}.ln2.g`, 1, d); add(`l${l}.ln2.b`, 1, d);
    add(`l${l}.fc.W`, d, F); add(`l${l}.fc.b`, 1, F);
    add(`l${l}.pr.W`, F, d); add(`l${l}.pr.b`, 1, d);
  }
  add('lnf.g', 1, d); add('lnf.b', 1, d); add('un.W', d, V); add('un.b', 1, V);
  let off = 0; for (const e of list) { e.off = off; off += e.r * e.c; }
  return { list, size: off };
}
function view(flat, cfg) { const W = {}; for (const e of layout(cfg).list) W[e.name] = flat.subarray(e.off, e.off + e.r * e.c); return W; }
function b64ToF32(b64) {
  let bytes;
  if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') { const b = Buffer.from(b64, 'base64'); bytes = new Uint8Array(b.buffer, b.byteOffset, b.length); }
  else { const s = atob(b64); bytes = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i); }
  const copy = new Uint8Array(bytes.length); copy.set(bytes);
  return new Float32Array(copy.buffer);
}
function b64ToU8(b64) {
  if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u;
}
function decode(pack) { const cfg = pack.cfg, flat = b64ToF32(pack.weights); return { cfg, flat, W: view(flat, cfg) }; }

const GELU_C = Math.sqrt(2 / Math.PI);
const gelu = x => 0.5 * x * (1 + Math.tanh(GELU_C * (x + 0.044715 * x * x * x)));

// one counter of multiply–adds, so the page can show what a computation cost
function Ops() { this.mac = 0; }
function lnRow(x, xo, out, oo, g, b, d) {
  let m = 0; for (let j = 0; j < d; j++) m += x[xo + j]; m /= d;
  let v = 0; for (let j = 0; j < d; j++) { const z = x[xo + j] - m; v += z * z; } v /= d;
  const r = 1 / Math.sqrt(v + 1e-5);
  for (let j = 0; j < d; j++) out[oo + j] = (x[xo + j] - m) * r * g[j] + b[j];
}
// y[row] = x[row]·W + b for one row; W is [n_in, n_out]
function affRow(x, xo, nIn, W, b, nOut, y, yo, ops) {
  for (let k = 0; k < nOut; k++) y[yo + k] = b[k];
  for (let i = 0; i < nIn; i++) { const xi = x[xo + i]; if (xi === 0) continue; const wo = i * nOut; for (let k = 0; k < nOut; k++) y[yo + k] += xi * W[wo + k]; }
  if (ops) ops.mac += nIn * nOut;
}

/* Full forward over a sequence of token ids (length ≤ T).
 * opts.ablate: Set of "l.h" strings → that head's output is replaced by zeros (zero-ablation).
 * opts.record: keep attention patterns and the residual stream after each sub-layer.
 * Returns logits (n × V, Float64Array). */
function forward(model, toks, opts) {
  opts = opts || {};
  const { cfg, W } = model, { V, d, H, dh, L, F } = cfg, n = toks.length, ops = opts.ops;
  const ab = opts.ablate || null;
  const x = new Float64Array(n * d), a = new Float64Array(n * d), qkv = new Float64Array(n * 3 * d), z = new Float64Array(n * d), att = new Float64Array(n * d), u = new Float64Array(n * F);
  for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) x[i * d + j] = W.tok[toks[i] * d + j] + W.pos[i * d + j];
  const rec = opts.record ? { attn: [], resid: [x.slice()], scale: 1 / Math.sqrt(dh) } : null;
  const sc = 1 / Math.sqrt(dh), p = new Float64Array(n);
  for (let l = 0; l < L; l++) {
    const P = `l${l}.`;
    for (let i = 0; i < n; i++) { lnRow(x, i * d, a, i * d, W[P + 'ln1.g'], W[P + 'ln1.b'], d); affRow(a, i * d, d, W[P + 'qkv.W'], W[P + 'qkv.b'], 3 * d, qkv, i * 3 * d, ops); }
    z.fill(0);
    const pats = [];
    for (let h = 0; h < H; h++) {
      const pat = rec ? new Float64Array(n * n) : null, off = h * dh;
      for (let i = 0; i < n; i++) {
        let mx = -Infinity;
        for (let j = 0; j <= i; j++) { let s = 0; for (let c = 0; c < dh; c++) s += qkv[i * 3 * d + off + c] * qkv[j * 3 * d + d + off + c]; p[j] = s * sc; if (p[j] > mx) mx = p[j]; }
        if (ops) ops.mac += (i + 1) * dh * 2;
        let sum = 0; for (let j = 0; j <= i; j++) { p[j] = Math.exp(p[j] - mx); sum += p[j]; }
        for (let j = 0; j <= i; j++) { p[j] /= sum; if (pat) pat[i * n + j] = p[j]; }
        if (ab && ab.has(l + '.' + h)) continue;
        for (let j = 0; j <= i; j++) { const pj = p[j]; for (let c = 0; c < dh; c++) z[i * d + off + c] += pj * qkv[j * 3 * d + 2 * d + off + c]; }
      }
      pats.push(pat);
    }
    for (let i = 0; i < n; i++) { affRow(z, i * d, d, W[P + 'o.W'], W[P + 'o.b'], d, att, i * d, ops); for (let j = 0; j < d; j++) x[i * d + j] += att[i * d + j]; }
    if (rec) { rec.attn.push(pats); rec.resid.push(x.slice()); }
    for (let i = 0; i < n; i++) {
      lnRow(x, i * d, a, i * d, W[P + 'ln2.g'], W[P + 'ln2.b'], d);
      affRow(a, i * d, d, W[P + 'fc.W'], W[P + 'fc.b'], F, u, i * F, ops);
      for (let k = 0; k < F; k++) u[i * F + k] = gelu(u[i * F + k]);
      affRow(u, i * F, F, W[P + 'pr.W'], W[P + 'pr.b'], d, att, i * d, ops);
      for (let j = 0; j < d; j++) x[i * d + j] += att[i * d + j];
    }
    if (rec) rec.resid.push(x.slice());
  }
  const logits = new Float64Array(n * V);
  for (let i = 0; i < n; i++) { lnRow(x, i * d, a, i * d, W['lnf.g'], W['lnf.b'], d); affRow(a, i * d, d, W['un.W'], W['un.b'], V, logits, i * V, ops); }
  return rec ? { logits, rec } : { logits };
}
function softmaxRow(lg, o, V) { let mx = -Infinity; for (let k = 0; k < V; k++) mx = Math.max(mx, lg[o + k]); let s = 0; const p = new Float64Array(V); for (let k = 0; k < V; k++) { p[k] = Math.exp(lg[o + k] - mx); s += p[k]; } for (let k = 0; k < V; k++) p[k] /= s; return p; }

/* KV-cached incremental forward: feed one token at a time; keys and values of earlier positions are kept,
 * so each new position costs one row of every matrix product plus attention over the cache. */
function cacheNew(model) { const { cfg } = model; return { n: 0, K: Array.from({ length: cfg.L }, () => new Float64Array(cfg.T * cfg.d)), Vc: Array.from({ length: cfg.L }, () => new Float64Array(cfg.T * cfg.d)) }; }
function cacheStep(model, cache, tok, ops) {
  const { cfg, W } = model, { V, d, H, dh, L, F } = cfg, i = cache.n;
  if (i >= cfg.T) throw new Error('context full');
  const x = new Float64Array(d), a = new Float64Array(d), qkv = new Float64Array(3 * d), z = new Float64Array(d), o = new Float64Array(d), u = new Float64Array(F);
  for (let j = 0; j < d; j++) x[j] = W.tok[tok * d + j] + W.pos[i * d + j];
  const sc = 1 / Math.sqrt(dh), p = new Float64Array(i + 1);
  for (let l = 0; l < L; l++) {
    const P = `l${l}.`, K = cache.K[l], Vv = cache.Vc[l];
    lnRow(x, 0, a, 0, W[P + 'ln1.g'], W[P + 'ln1.b'], d); affRow(a, 0, d, W[P + 'qkv.W'], W[P + 'qkv.b'], 3 * d, qkv, 0, ops);
    for (let j = 0; j < d; j++) { K[i * d + j] = qkv[d + j]; Vv[i * d + j] = qkv[2 * d + j]; }
    z.fill(0);
    for (let h = 0; h < H; h++) {
      const off = h * dh; let mx = -Infinity;
      for (let j = 0; j <= i; j++) { let s = 0; for (let c = 0; c < dh; c++) s += qkv[off + c] * K[j * d + off + c]; p[j] = s * sc; if (p[j] > mx) mx = p[j]; }
      let sum = 0; for (let j = 0; j <= i; j++) { p[j] = Math.exp(p[j] - mx); sum += p[j]; }
      for (let j = 0; j <= i; j++) { const pj = p[j] / sum; for (let c = 0; c < dh; c++) z[off + c] += pj * Vv[j * d + off + c]; }
      if (ops) ops.mac += (i + 1) * dh * 2;
    }
    affRow(z, 0, d, W[P + 'o.W'], W[P + 'o.b'], d, o, 0, ops); for (let j = 0; j < d; j++) x[j] += o[j];
    lnRow(x, 0, a, 0, W[P + 'ln2.g'], W[P + 'ln2.b'], d); affRow(a, 0, d, W[P + 'fc.W'], W[P + 'fc.b'], F, u, 0, ops);
    for (let k = 0; k < F; k++) u[k] = gelu(u[k]);
    affRow(u, 0, F, W[P + 'pr.W'], W[P + 'pr.b'], d, o, 0, ops); for (let j = 0; j < d; j++) x[j] += o[j];
  }
  const logits = new Float64Array(V);
  lnRow(x, 0, a, 0, W['lnf.g'], W['lnf.b'], d); affRow(a, 0, d, W['un.W'], W['un.b'], V, logits, 0, ops);
  cache.n++;
  return logits;
}
/* Greedy generation of `steps` new letters after a prompt, with or without the cache.
 * Without the cache every step recomputes the whole prefix (what a naive implementation does).
 * Returns the generated ids, the multiply–adds spent per generated token, and the cache size in numbers. */
function generate(model, prompt, steps, useCache) {
  const { cfg } = model, out = prompt.slice(), perTok = [];
  steps = Math.min(steps, cfg.T - prompt.length + 1);
  const argmax = (lg, o) => { let b = 0; for (let k = 1; k < cfg.V; k++) if (lg[o + k] > lg[o + b]) b = k; return b; };
  if (useCache) {
    const c = cacheNew(model); let lg = null; const ops = new Ops();
    for (const t of prompt) lg = cacheStep(model, c, t, ops);
    const pre = ops.mac;
    for (let s = 0; s < steps; s++) {
      const nx = argmax(lg, 0); out.push(nx);
      const o2 = new Ops();
      if (s < steps - 1 && out.length <= cfg.T) lg = cacheStep(model, c, nx, o2);
      perTok.push(o2.mac);
    }
    return { out, perTok, prefill: pre, cacheNumbers: 2 * cfg.L * c.n * cfg.d };
  }
  for (let s = 0; s < steps; s++) {
    const ops = new Ops(), lg = forward(model, out.slice(-cfg.T), { ops }).logits;
    const nx = argmax(lg, (Math.min(out.length, cfg.T) - 1) * cfg.V); out.push(nx); perTok.push(ops.mac);
  }
  return { out, perTok, prefill: 0, cacheNumbers: 0 };
}

/* Round-to-nearest symmetric quantisation, one scale per output channel (per row for the embeddings).
 * LayerNorm gains/biases and all biases stay in float. Returns a new model and its weight bytes. */
const QUANT = ['tok', 'pos', 'qkv.W', 'o.W', 'fc.W', 'pr.W', 'un.W'];
function quantize(model, bits) {
  const { cfg } = model, lay = layout(cfg), flat = new Float32Array(model.flat);
  let qParams = 0, fParams = 0, scales = 0;
  for (const e of lay.list) {
    const isQ = bits < 32 && QUANT.some(s => e.name === s || e.name.endsWith('.' + s));
    if (!isQ) { fParams += e.r * e.c; continue; }
    const lev = Math.pow(2, bits - 1) - 1, emb = e.name === 'tok' || e.name === 'pos';
    const groups = emb ? e.r : e.c;
    for (let g = 0; g < groups; g++) {
      let mx = 0;
      const idx = k => emb ? e.off + g * e.c + k : e.off + k * e.c + g, len = emb ? e.c : e.r;
      for (let k = 0; k < len; k++) mx = Math.max(mx, Math.abs(flat[idx(k)]));
      const s = mx / lev || 1;
      for (let k = 0; k < len; k++) flat[idx(k)] = clamp(Math.round(flat[idx(k)] / s), -lev, lev) * s;
      scales++;
    }
    qParams += e.r * e.c;
  }
  const bytes = bits < 32 ? qParams * bits / 8 + scales * 2 + fParams * 4 : (qParams + fParams) * 4;
  return { model: { cfg, flat, W: view(flat, cfg) }, bytes, qParams, fParams };
}

/* Loss and accuracy over an evaluation set, split into positions before and after the block repeats. */
function evaluate(model, set, opts) {
  const { cfg } = model, V = cfg.V;
  let sAll = 0, nAll = 0, sRep = 0, nRep = 0, sNew = 0, nNew = 0, hit = 0;
  for (const ex of set) {
    const toks = ex.seq.slice(0, cfg.T), lg = forward(model, toks, opts).logits;
    for (let i = 0; i < cfg.T; i++) {
      const pr = softmaxRow(lg, i * V, V), y = ex.seq[i + 1], ce = -Math.log(Math.max(pr[y], 1e-300));
      sAll += ce; nAll++;
      if (isRepeat(i, ex.p)) { sRep += ce; nRep++; let b = 0; for (let k = 1; k < V; k++) if (pr[k] > pr[b]) b = k; if (b === y) hit++; }
      else { sNew += ce; nNew++; }
    }
  }
  return { loss: sAll / nAll, lossRep: sRep / nRep, lossNew: sNew / nNew, accRep: hit / nRep, n: set.length };
}

/* Head scores on an evaluation set (Olsson et al. 2022): the previous-token score is the average attention to
 * position i−1; the induction score is the average attention, over repeat positions, to every position that
 * follows an earlier copy of the current letter. */
function headScores(model, set) {
  const { cfg } = model, out = [];
  for (let l = 0; l < cfg.L; l++) for (let h = 0; h < cfg.H; h++) out.push({ l, h, prev: 0, ind: 0 });
  let nPrev = 0, nInd = 0;
  for (const ex of set) {
    const n = cfg.T, r = forward(model, ex.seq.slice(0, n), { record: true }).rec;
    for (let l = 0; l < cfg.L; l++) for (let h = 0; h < cfg.H; h++) {
      const pat = r.attn[l][h], o = out[l * cfg.H + h];
      for (let i = 1; i < n; i++) o.prev += pat[i * n + i - 1];
      for (let i = ex.p; i < n; i++) for (let j = 1; j <= i; j++) if (ex.seq[j - 1] === ex.seq[i]) o.ind += pat[i * n + j];
    }
    nPrev += n - 1; nInd += n - ex.p;
  }
  for (const o of out) { o.prev /= nPrev; o.ind /= nInd; }
  return out;
}

const TF = { CFG, layout, view, decode, b64ToF32, b64ToU8, forward, softmaxRow, cacheNew, cacheStep, generate, quantize, evaluate, headScores, gelu, Ops, lnRow, affRow };

/* ───────── depth: signal propagation through L random blocks ─────────
 * One block = W·relu(·) with W ~ N(0, 2g²/d) (He initialisation times a gain g; He et al. 2015).
 *   plain:   x ← W relu(x)               (variance × g² per block)
 *   res:     x ← x + W relu(x)           (variance × (1+g²) per block)
 *   preln:   x ← x + W relu(LN(x))       (variance + g² per block; Xiong et al. 2020 on pre-LN)
 * The same weights are used for all three. Backward: loss = r·x_L with a fixed random r; the RMS of
 * ∂loss/∂x_l is reported relative to its value at the top. Activation RMS is relative to the input. */
function depthRun(o) {
  const L = o.L, g = o.g, d = o.d || 64, B = o.batch || 8, r = rng(o.seed || 5);
  const Ws = []; for (let l = 0; l < L; l++) { const W = new Float64Array(d * d), s = Math.sqrt(2 / d) * g; for (let k = 0; k < d * d; k++) W[k] = s * gauss(r); Ws.push(W); }
  const X0 = []; for (let b = 0; b < B; b++) { const x = new Float64Array(d); for (let j = 0; j < d; j++) x[j] = gauss(r); X0.push(x); }
  const rv = new Float64Array(d); for (let j = 0; j < d; j++) rv[j] = gauss(r) / Math.sqrt(d);
  const rms = v => Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length);
  const out = {};
  for (const kind of ['plain', 'res', 'preln']) {
    const act = new Float64Array(L + 1), grad = new Float64Array(L + 1);
    for (const x0 of X0) {
      const xs = [x0.slice()], hs = [], lns = [];
      for (let l = 0; l < L; l++) {
        const x = xs[l]; let u = x, ln = null;
        if (kind === 'preln') { let m = 0; for (let j = 0; j < d; j++) m += x[j]; m /= d; let v = 0; for (let j = 0; j < d; j++) v += (x[j] - m) * (x[j] - m); v /= d; const rs = 1 / Math.sqrt(v + 1e-5); u = new Float64Array(d); for (let j = 0; j < d; j++) u[j] = (x[j] - m) * rs; ln = { rs, u }; }
        const h = new Float64Array(d); for (let j = 0; j < d; j++) h[j] = Math.max(0, u[j]);
        const y = new Float64Array(d), W = Ws[l];
        for (let i = 0; i < d; i++) { let s = 0; for (let j = 0; j < d; j++) s += W[i * d + j] * h[j]; y[i] = s; }
        if (kind !== 'plain') for (let i = 0; i < d; i++) y[i] += x[i];
        xs.push(y); hs.push({ u }); lns.push(ln);
      }
      let gx = rv.slice();
      const g0 = rms(gx);
      grad[L] += 1;
      for (let l = L - 1; l >= 0; l--) {
        const W = Ws[l], u = hs[l].u;
        // through y = [x +] W relu(u)
        const gh = new Float64Array(d);
        for (let j = 0; j < d; j++) { if (u[j] <= 0) continue; let s = 0; for (let i = 0; i < d; i++) s += W[i * d + j] * gx[i]; gh[j] = s; }
        let gu = gh;
        if (kind === 'preln') { const { rs } = lns[l]; let m1 = 0, m2 = 0; for (let j = 0; j < d; j++) { m1 += gh[j]; m2 += gh[j] * u[j]; } m1 /= d; m2 /= d; gu = new Float64Array(d); for (let j = 0; j < d; j++) gu[j] = rs * (gh[j] - m1 - u[j] * m2); }
        const nx = new Float64Array(d); for (let j = 0; j < d; j++) nx[j] = gu[j] + (kind === 'plain' ? 0 : gx[j]);
        gx = nx; grad[l] += rms(gx) / g0;
      }
      for (let l = 0; l <= L; l++) act[l] += rms(xs[l]) / rms(xs[0]);
    }
    for (let l = 0; l <= L; l++) { act[l] /= B; grad[l] /= B; }
    out[kind] = { act: Array.from(act), grad: Array.from(grad) };
  }
  return out;
}

/* ───────── count: parameters and FLOPs of a GPT-style decoder ─────────
 * c: { L, d, heads, kv (key/value heads; = heads without GQA), ffn, V, ctx, gated (SwiGLU: 3 matrices),
 *      bias (GPT-2/3 biases), tied (input and output embeddings shared), learnedPos, norm: 'ln' | 'rms' }
 * Matrix parameters per layer: Q d·d, K and V d·(kv·dh) each, O d·d, MLP 2 or 3 of d·ffn. */
const PRESETS = {
  tiny:     { L: 2, d: 32, heads: 2, kv: 2, ffn: 128, V: 26, ctx: 24, gated: false, bias: true, tied: false, learnedPos: true, norm: 'ln' },
  gpt3:     { L: 96, d: 12288, heads: 96, kv: 96, ffn: 49152, V: 50257, ctx: 2048, gated: false, bias: true, tied: true, learnedPos: true, norm: 'ln' },
  llama8:   { L: 32, d: 4096, heads: 32, kv: 8, ffn: 14336, V: 128256, ctx: 131072, gated: true, bias: false, tied: false, learnedPos: false, norm: 'rms' },
  llama70:  { L: 80, d: 8192, heads: 64, kv: 8, ffn: 28672, V: 128256, ctx: 131072, gated: true, bias: false, tied: false, learnedPos: false, norm: 'rms' },
  llama405: { L: 126, d: 16384, heads: 128, kv: 8, ffn: 53248, V: 128256, ctx: 131072, gated: true, bias: false, tied: false, learnedPos: false, norm: 'rms' },
};
function countParams(c) {
  const dh = c.d / c.heads, dkv = c.kv * dh, nNorm = c.norm === 'ln' ? 2 : 1;
  const attnW = c.d * c.d + 2 * c.d * dkv + c.d * c.d, attnB = c.bias ? c.d + 2 * dkv + c.d : 0;
  const mlpW = (c.gated ? 3 : 2) * c.d * c.ffn, mlpB = c.bias ? c.ffn * (c.gated ? 2 : 1) + c.d : 0;
  const norms = 2 * nNorm * c.d;
  const layer = attnW + attnB + mlpW + mlpB + norms;
  const embed = c.V * c.d + (c.learnedPos ? c.ctx * c.d : 0);
  const unembed = c.tied ? 0 : c.V * c.d + (c.bias && !c.tied ? c.V : 0);
  const total = c.L * layer + embed + unembed + nNorm * c.d;
  const matrices = c.L * (attnW + mlpW); // weights that do multiply–adds per token
  return { total, layer, attn: attnW + attnB, mlp: mlpW + mlpB, embed, unembed, matrices, dh, dkv };
}
// forward FLOPs for one token at context position T: 2 per weight multiply–add, plus QKᵀ and PV over T keys
function flopsPerToken(c, T) {
  const p = countParams(c), dense = 2 * (p.matrices + c.V * c.d), attn = 4 * c.L * T * c.d;
  return { dense, attn, total: dense + attn, attnShare: attn / (dense + attn), train: 3 * (dense + attn) };
}

/* ───────── scaling: Chinchilla parametric fit L(N, D) = E + A/N^α + B/D^β ─────────
 * Hoffmann et al. 2022, Approach 3 (rounded values in the paper's text) and the re-fit of the same data by
 * Besiroglu et al. 2024 (Epoch AI, Table 1). With C = 6ND, the loss-minimising split is
 *   N_opt = G·(C/6)^(β/(α+β)),  D_opt = (C/6)/N_opt,  G = (αA/(βB))^(1/(α+β)). */
const FITS = {
  hoffmann: { E: 1.69, A: 406.4, B: 410.7, a: 0.34, b: 0.28 },
  epoch:    { E: 1.8172, A: 482.01, B: 2085.43, a: 0.3478, b: 0.3658 },
};
const chinLoss = (N, D, f) => f.E + f.A / Math.pow(N, f.a) + f.B / Math.pow(D, f.b);
function chinOpt(C, f) {
  const G = Math.pow(f.a * f.A / (f.b * f.B), 1 / (f.a + f.b));
  const N = G * Math.pow(C / 6, f.b / (f.a + f.b)), D = C / 6 / N;
  return { N, D, ratio: D / N, loss: chinLoss(N, D, f), expN: f.b / (f.a + f.b) };
}

/* ───────── bill: training compute → accelerator-hours, days, energy, money ─────────
 * Peak = dense BF16 tensor throughput from the vendor sheet (the sparse figure halved, per its footnote).
 * gb200: per GPU of a GB200 NVL72 rack (rack figures ÷ 72). Power per GPU is a reader setting; defaults:
 * A100 and H100 board TDP; Blackwell = DGX B200 system max (14.3 kW) ÷ 8 GPUs, i.e. including the host. */
const HW = {
  a100:  { peak: 312e12, bw: 2.039e12, mem: 80e9, watt: 400 },
  h100:  { peak: 989.5e12, bw: 3.35e12, mem: 80e9, watt: 700 },
  gb200: { peak: 2.5e15, bw: 8e12, mem: 186e9, watt: 1788 },
};
function bill(o) {
  const flops = 6 * o.N * o.D, hw = HW[o.hw];
  const gpuHours = flops / (hw.peak * o.mfu * 3600);
  const watt = o.watt != null ? o.watt : hw.watt;
  return { flops, gpuHours, days: gpuHours / o.gpus / 24, mwh: gpuHours * watt / 1e6, cost: gpuHours * o.price };
}

/* ───────── LoRA (Hu et al. 2021): train B·A of rank r beside each frozen matrix ─────────
 * targets: 'qv' (the paper's main setting), 'attn' (Q K V O), 'all' (attention + MLP).
 * Memory for weights and optimiser state only (activations excluded): full fine-tuning with mixed-precision
 * Adam keeps 16 bytes per parameter (2 weights + 2 gradients + 4 master copy + 8 moments; Rajbhandari et al.
 * 2020); LoRA keeps the frozen model at 2 bytes per parameter plus 16 bytes per trainable parameter. */
function lora(c, r, targets) {
  const p = countParams(c), d = c.d, dkv = p.dkv;
  const mats = [[d, d], [d, dkv]]; // Q, V
  if (targets !== 'qv') mats.push([d, dkv], [d, d]); // K, O
  if (targets === 'all') { mats.push([d, c.ffn], [c.ffn, d]); if (c.gated) mats.push([d, c.ffn]); }
  const per = mats.reduce((s, m) => s + r * (m[0] + m[1]), 0), train = c.L * per;
  return { train, total: p.total, ratio: p.total / train, memFull: 16 * p.total, memLora: 2 * p.total + 16 * train };
}

/* ───────── bench: what a benchmark score can and cannot tell apart ─────────
 * Each of n questions: with probability err the answer key is wrong (a correct answer is then marked
 * wrong); a contaminated model has memorised a share c of the questions and reproduces the key; otherwise
 * it answers correctly with its true skill p. Expected measured score = c + (1−c)(1−err)p.
 * Simulation: `trials` seeded re-draws of the question set; reports how often B's measured score beats A's
 * (a tie counts one half). */
function benchExpected(p, err, c) { return c + (1 - c) * (1 - err) * p; }
function benchSim(o) {
  const r = rng(o.seed || 11), sa = [], sb = [];
  let rev = 0;
  for (let t = 0; t < o.trials; t++) {
    let a = 0, b = 0;
    for (let q = 0; q < o.n; q++) {
      const bad = r() < o.err;
      if (r() < o.pA && !bad) a++;
      if (r() < o.cB) b++; else if (r() < o.pB && !bad) b++;
    }
    sa.push(a / o.n); sb.push(b / o.n); if (b > a) rev++; else if (b === a) rev += 0.5;
  }
  return { sa, sb, reversal: rev / o.trials };
}
// normal approximation of the same reversal probability (difference of two binomial proportions)
function benchReversal(o) {
  const ea = benchExpected(o.pA, o.err, 0), eb = benchExpected(o.pB, o.err, o.cB);
  const se = Math.sqrt((ea * (1 - ea) + eb * (1 - eb)) / o.n);
  return { ea, eb, se1: 1.96 * Math.sqrt(ea * (1 - ea) / o.n), p: normCdf((eb - ea) / se) };
}
function normCdf(z) { // Abramowitz–Stegun 7.1.26 via erf
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

/* ───────── serve: the inference bill ─────────
 * KV cache per token = 2 (K and V) × layers × kv heads × head size × bytes.
 * One decode step for a batch: every weight is read once and every sequence's cache is read once
 * (memory time), and each sequence does 2·N_active FLOPs plus attention (compute time). The step takes the
 * larger of the two (the roofline bound; Williams et al. 2009). eff = share of peak FLOP/s achieved (set). */
function kvBytesPerToken(c, bytes) { const dh = c.d / c.heads; return 2 * c.L * c.kv * dh * (bytes || 2); }
function serveStep(o) {
  const c = PRESETS[o.model], hw = HW[o.hw], p = countParams(c);
  const wBytes = p.total * o.bits / 8, kv = kvBytesPerToken(c, 2) * o.ctx * o.batch;
  const memT = (wBytes + kv) / (hw.bw * o.gpus);
  const flops = o.batch * (2 * (p.matrices + c.V * c.d) + 4 * c.L * o.ctx * c.d);
  const compT = flops / (hw.peak * (o.eff || 0.5) * o.gpus);
  const t = Math.max(memT, compT), tps = o.batch / t;
  const fits = wBytes + kv <= hw.mem * o.gpus;
  return { wBytes, kv, memT, compT, t, tps, perUser: 1 / t, bound: memT >= compT ? 'memory' : 'compute', fits, costPerM: o.gpus * o.price / (tps * 3600) * 1e6 };
}
// batch size at which a decode step turns from memory-bound to compute-bound (cache term included)
// (null when the cache term keeps it memory-bound at any batch)
function decodeKnee(o) { if (serveStep(Object.assign({}, o, { batch: 1e6 })).bound === 'memory') return null; let lo = 1, hi = 1e6; for (let i = 0; i < 80; i++) { const m = Math.sqrt(lo * hi); const r = serveStep(Object.assign({}, o, { batch: m })); if (r.bound === 'memory') lo = m; else hi = m; } return hi; }

/* ───────── moe: top-k routing with capacity, and DeepSeek-V3's bias balancing ─────────
 * T tokens with random features x ~ N(0, I_dm) and a random router W (dm × E); `skew` adds a fixed
 * per-expert popularity offset to every token's router logits (an untrained or drifting router).
 * Selection uses logits + bias; capacity per expert = ceil(cf·k·T/E) (Switch Transformer, Fedus et al.
 * 2022); assignments beyond capacity are dropped in token order. aux = E·Σ f_i·P_i (Switch load-balancing
 * loss; 1 when perfectly balanced). balanceStep: b_i ← b_i + γ·sign(mean load − load_i) (Wang et al. 2024,
 * used in DeepSeek-V3). */
function moeNew(o) {
  const r = rng(o.seed || 21), dm = 16, E = o.E, T = o.T || 512;
  const X = []; for (let t = 0; t < T; t++) { const x = new Float64Array(dm); for (let j = 0; j < dm; j++) x[j] = gauss(r); X.push(x); }
  const W = new Float64Array(dm * E); for (let k = 0; k < dm * E; k++) W[k] = gauss(r) / Math.sqrt(dm);
  const pop = new Float64Array(E); for (let e = 0; e < E; e++) pop[e] = gauss(r);
  const logits = X.map(x => { const z = new Float64Array(E); for (let e = 0; e < E; e++) { let s = 0; for (let j = 0; j < dm; j++) s += x[j] * W[j * E + e]; z[e] = s; } return z; });
  return { E, T, logits, pop, bias: new Float64Array(E), steps: 0 };
}
function moeRoute(st, o) {
  const { E, T } = st, k = Math.min(o.k, E), cap = Math.ceil(o.cf * k * T / E);
  const load = new Float64Array(E), kept = new Float64Array(E), P = new Float64Array(E);
  let dropped = 0;
  for (let t = 0; t < T; t++) {
    const z = st.logits[t], s = new Float64Array(E);
    let mx = -Infinity; for (let e = 0; e < E; e++) { s[e] = z[e] + o.skew * st.pop[e]; mx = Math.max(mx, s[e]); }
    let sum = 0; const pr = new Float64Array(E); for (let e = 0; e < E; e++) { pr[e] = Math.exp(s[e] - mx); sum += pr[e]; }
    for (let e = 0; e < E; e++) P[e] += pr[e] / sum / T;
    const sel = Array.from({ length: E }, (_, e) => e).sort((a, b) => (s[b] + st.bias[b]) - (s[a] + st.bias[a])).slice(0, k);
    for (const e of sel) { load[e]++; if (kept[e] < cap) kept[e]++; else dropped++; }
  }
  let aux = 0; for (let e = 0; e < E; e++) aux += E * (load[e] / (k * T)) * P[e];
  const mean = k * T / E, maxLoad = Math.max(...load);
  return { load: Array.from(load), kept: Array.from(kept), cap, dropped, dropShare: dropped / (k * T), aux, maxOverMean: maxLoad / mean };
}
function moeBalanceStep(st, o, gamma) {
  const r = moeRoute(st, o), mean = Math.min(o.k, st.E) * st.T / st.E;
  for (let e = 0; e < st.E; e++) st.bias[e] += gamma * Math.sign(mean - r.load[e]);
  st.steps++;
  return r;
}

/* ───────── spec: speculative decoding (Leviathan, Kalman & Matias 2023) ─────────
 * A draft model proposes γ tokens; the target model checks them in one pass. If each draft token is
 * accepted independently with probability α, tokens produced per target pass = (1 − α^(γ+1)) / (1 − α),
 * and with draft cost c (relative to one target pass) the speed-up is that ÷ (γc + 1). */
const specTokens = (a, g) => a >= 1 ? g + 1 : (1 - Math.pow(a, g + 1)) / (1 - a);
const specSpeedup = (a, g, c) => specTokens(a, g) / (g * c + 1);
function specBest(a, c) { let best = 1, v = 0; for (let g = 1; g <= 16; g++) { const s = specSpeedup(a, g, c); if (s > v) { v = s; best = g; } } return { gamma: best, speedup: v }; }
function specSim(a, g, iters, seed) {
  const r = rng(seed || 31), hist = new Array(g + 2).fill(0); let tok = 0;
  for (let i = 0; i < iters; i++) { let n = 0; while (n < g && r() < a) n++; const made = n + 1; tok += made; hist[made]++; }
  return { mean: tok / iters, hist };
}

/* ───────── frontier data (as of November 2026) ─────────
 * Every entry is sourced in BRIEF.md ("Facts that will go stale"). kind: 'disclosed' = training compute
 * stated by the developer; 'derived' = 6·N·D from the developer's own N and D; 'estimate' = Epoch AI's
 * estimate from indirect evidence (conf = Epoch's confidence label). */
const FRONTIER = {
  asOf: '2026-11',
  compute: [
    { id: 'gpt3', date: 2020.41, flop: 3.14e23, kind: 'disclosed' },
    { id: 'chinchilla', date: 2022.24, flop: 5.76e23, kind: 'disclosed' },
    { id: 'gpt4', date: 2023.20, flop: 2.1e25, kind: 'estimate', conf: 'likely' },
    { id: 'gemini1u', date: 2023.93, flop: 5e25, kind: 'estimate', conf: 'speculative' },
    { id: 'llama31', date: 2024.56, flop: 3.8e25, kind: 'disclosed' },
    { id: 'dsv3', date: 2024.98, flop: 3.3e24, kind: 'derived' },
    { id: 'grok3', date: 2025.13, flop: 3.5e26, kind: 'estimate', conf: 'likely' },
    { id: 'gpt45', date: 2025.16, flop: 3.8e26, kind: 'estimate', conf: 'likely' },
    { id: 'grok4', date: 2025.52, flop: 5e26, kind: 'estimate', conf: 'speculative' },
    { id: 'dsv4', date: 2026.31, flop: 9.7e24, kind: 'derived' },
    { id: 'astra', date: 2026.67, flop: 9.4e26, kind: 'estimate', conf: 'likely' },
    { id: 'mistral4', date: 2026.76, flop: 1.24e25, kind: 'estimate', conf: 'confident' },
  ],
  thresholds: { eu: 1e25, ca: 1e26 },
  prices: { astraIn: 10, astraOut: 50, fableIn: 8, fableOut: 40, dsProOutLo: 1.98, dsProOutHi: 3.96, dsProInLo: 0.66, dsProInHi: 1.32 },
  context: { astra: 1050000, dsv4: 1000000 },
  hle: { top: 54.8, ci: 1.94, second: 46.5 },
  dsv4: { total: 1.6e12, active: 49e9, tokens: 32e12 },
  dsv3: { total: 671e9, active: 37e9, tokens: 14.8e12, gpuHours: 2.788e6 },
  llama31: { gpuHours405: 30.84e6, gpuHoursAll: 39.3e6, tokens: 15.6e12, flop: 3.8e25, mfuLo: 0.38, mfuHi: 0.43, gpus: 16384, interruptions: 419, co2t: 11390 },
  gptoss: { gpuHours: 2.1e6 },
  clusters: { colossus2MW: 946, abileneMW: 824, newCarlisleMW: 1037 },
  h100Price: { lambdaOnDemand: 4.59 },
  epochOver1e25: 25, epochOver1e26: 4,
};
// least-squares slope of log10(FLOP) on year → growth factor per year, over the chosen points
function records(points) { let mx = 0; return points.slice().sort((a, b) => a.date - b.date).filter(p => (p.flop > mx ? (mx = p.flop, true) : false)); }
function computeTrend(points) {
  const n = points.length; let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of points) { const y = Math.log10(p.flop); sx += p.date; sy += y; sxx += p.date * p.date; sxy += p.date * y; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx), icpt = (sy - slope * sx) / n;
  return { slope, icpt, perYear: Math.pow(10, slope), n };
}

return { clamp, rng, gauss, genSeq, evalSet, isRepeat, bayesLoss, TF, depthRun, PRESETS, countParams, flopsPerToken, FITS, chinLoss, chinOpt, HW, bill, lora, benchExpected, benchSim, benchReversal, normCdf, kvBytesPerToken, serveStep, decodeKnee, moeNew, moeRoute, moeBalanceStep, specTokens, specSpeedup, specBest, specSim, FRONTIER, records, computeTrend };
});
