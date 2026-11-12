/* How a chatbot writes: the models behind every figure on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.ChatModels and by tests/models.cjs via require().
 * Everything is trained here, from the small corpus in corpus.zh.js / corpus.en.js; nothing is downloaded.
 *   1 tokenizer   byte-pair encoding (Sennrich, Haddow & Birch 2016), trained merge by merge
 *   2 n-gram      maximum-likelihood next-token counts (Shannon 1948), longest-seen-context backoff
 *   3 sampling    softmax with temperature, top-k (Fan et al. 2018), top-p / nucleus (Holtzman et al. 2020)
 *   4 vectors     PPMI co-occurrence matrix + truncated eigendecomposition (Levy, Goldberg & Dagan 2015)
 *   5 attention   one scaled dot-product attention head (Vaswani et al. 2017) with a linear distance
 *                 penalty (ALiBi, Press, Smith & Lewis 2022); its query/key numbers are set by hand
 *   6 training    a next-token network (embedding → logits) trained by full-batch gradient descent on
 *                 cross-entropy; its floor is the conditional entropy of the bigram counts (exact)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChatModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

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

  const BOS = '\u0002';          // start-of-sentence marker (never shown as text)
  const SEP = '\u0001';          // joins tokens into a context key
  const PUNCT_ZH = /[，。？！、：；]/;
  const isEnd = tok => tok === '。' || tok === '.' || tok === '？' || tok === '?' || tok === '！' || tok === '!';
  const isPunct = tok => PUNCT_ZH.test(tok) || /^[.,?!;:]$/.test(tok);

  /* ───────── 1 · tokenizer: byte-pair encoding ─────────
   * Pre-split (as GPT-2 does): English into words that carry their leading space, punctuation alone;
   * Chinese into runs between punctuation marks. Merges never cross a chunk boundary.
   * The starting symbols are characters (production tokenizers start from bytes; see the page). */
  function chunks(text, lang) {
    if (lang === 'en') return (' ' + text.toLowerCase().replace(/\s+/g, ' ').trim()).match(/ ?[a-z']+|[.,?!;:]|[^\s]/g) || [];
    const out = []; let run = '';
    for (const ch of text) {
      if (PUNCT_ZH.test(ch) || /[.,?!;:]/.test(ch)) { if (run) out.push(run); run = ''; out.push(ch); }
      else if (/\s/.test(ch)) { if (run) out.push(run); run = ''; }
      else run += ch;
    }
    if (run) out.push(run);
    return out;
  }

  function trainBPE(lines, lang, maxMerges) {
    const freq = new Map();
    for (const line of lines) for (const c of chunks(line, lang)) freq.set(c, (freq.get(c) || 0) + 1);
    const words = [...freq.entries()].map(([w, n]) => ({ sym: isPunct(w) ? [w] : [...w], n }));
    const base = new Set(); words.forEach(w => w.sym.forEach(s => base.add(s)));
    const total = () => words.reduce((s, w) => s + w.n * w.sym.length, 0);
    const merges = [], tokensAfter = [total()];
    for (let m = 0; m < maxMerges; m++) {
      const pc = new Map();
      for (const w of words) for (let i = 0; i + 1 < w.sym.length; i++) { const k = w.sym[i] + SEP + w.sym[i + 1]; pc.set(k, (pc.get(k) || 0) + w.n); }
      let best = null, bc = 1; // a pair has to occur at least twice to be worth a new symbol
      for (const [k, c] of pc) if (c > bc || (c === bc && best !== null && k < best)) { best = k; bc = c; }
      if (best === null) break;
      const [a, b] = best.split(SEP), ab = a + b;
      for (const w of words) {
        const s = w.sym, o = [];
        for (let i = 0; i < s.length; i++) { if (i + 1 < s.length && s[i] === a && s[i + 1] === b) { o.push(ab); i++; } else o.push(s[i]); }
        w.sym = o;
      }
      merges.push({ a, b, ab, count: bc });
      tokensAfter.push(total());
    }
    return { lang, merges, tokensAfter, base, baseSize: base.size, chars: tokensAfter[0] };
  }

  /* Encode text with the first `upTo` merges, applied by rank as GPT-2 does (lowest rank first). */
  function encode(text, bpe, upTo) {
    const n = upTo == null ? bpe.merges.length : Math.min(upTo, bpe.merges.length);
    if (!bpe._rank || bpe._rankN !== n) { const r = new Map(); for (let i = 0; i < n; i++) r.set(bpe.merges[i].a + SEP + bpe.merges[i].b, i); bpe._rank = r; bpe._rankN = n; }
    const rank = bpe._rank, out = [];
    for (const c of chunks(text, bpe.lang)) {
      let s = isPunct(c) ? [c] : [...c];
      for (;;) {
        let bi = -1, br = Infinity;
        for (let i = 0; i + 1 < s.length; i++) { const r = rank.get(s[i] + SEP + s[i + 1]); if (r !== undefined && r < br) { br = r; bi = i; } }
        if (bi < 0) break;
        const a = s[bi], b = s[bi + 1], o = [];
        for (let i = 0; i < s.length; i++) { if (i + 1 < s.length && s[i] === a && s[i + 1] === b) { o.push(a + b); i++; } else o.push(s[i]); }
        s = o;
      }
      out.push(...s);
    }
    return out;
  }

  /* ───────── 2 · n-gram counts ───────── */
  function trainNgram(seqs, maxOrder) {
    // table[len] : Map(contextKey → Map(next → count)), len = context length 0..maxOrder-1
    const table = []; for (let L = 0; L < maxOrder; L++) table.push(new Map());
    let pairs = 0;
    for (const seq of seqs) {
      const s = [BOS, ...seq];
      for (let i = 1; i < s.length; i++) {
        pairs++;
        for (let L = 0; L < maxOrder; L++) {
          if (i - L < 0) break;
          const key = s.slice(i - L, i).join(SEP);
          let m = table[L].get(key); if (!m) table[L].set(key, m = new Map());
          m.set(s[i], (m.get(s[i]) || 0) + 1);
        }
      }
    }
    const lines = new Set(seqs.map(q => q.join(SEP)));
    return { table, maxOrder, pairs, lines };
  }
  /* Next-token distribution for `history` (tokens so far, without BOS) under an order-n model: use the longest
   * context of up to n−1 tokens that occurred in training (backing off one token at a time). */
  function ngramDist(ng, history, order) {
    const s = [BOS, ...history];
    for (let L = Math.min(order - 1, s.length); L >= 0; L--) {
      const ctx = s.slice(s.length - L), m = ng.table[L].get(ctx.join(SEP));
      if (!m) continue;
      let tot = 0; for (const c of m.values()) tot += c;
      const items = [...m.entries()].map(([tok, c]) => ({ tok, c, p: c / tot }));
      items.sort((x, y) => y.c - x.c || (x.tok < y.tok ? -1 : x.tok > y.tok ? 1 : 0));
      return { ctx, L, wanted: Math.min(order - 1, s.length), total: tot, items };
    }
    return null;
  }

  /* ───────── 3 · from probabilities to a choice ───────── */
  // items: [{tok, p}] sorted by p descending. T = 0 means greedy. k = 0 means no top-k cut. topP in (0, 1].
  function shape(items, T, k, topP) {
    let q;
    if (T <= 0) { q = items.map((it, i) => i === 0 ? 1 : 0); }
    else {
      const lg = items.map(it => Math.log(it.p) / T), mx = Math.max(...lg);
      const e = lg.map(x => Math.exp(x - mx)), z = e.reduce((a, b) => a + b, 0);
      q = e.map(x => x / z);
    }
    const keep = q.map(x => x > 0);
    if (k > 0) for (let i = k; i < q.length; i++) keep[i] = false;
    if (topP < 1) { let cum = 0, z = 0; for (let i = 0; i < q.length; i++) if (keep[i]) z += q[i];
      let reached = false;
      for (let i = 0; i < q.length; i++) { if (!keep[i]) continue; if (reached) { keep[i] = false; continue; } cum += q[i] / z; if (cum >= topP - 1e-12) reached = true; } }
    let z = 0; for (let i = 0; i < q.length; i++) if (keep[i]) z += q[i];
    const out = items.map((it, i) => ({ tok: it.tok, p0: it.p, q: q[i], r: keep[i] ? q[i] / z : 0, keep: keep[i] }));
    return out;
  }
  const entropyBits = ps => ps.reduce((s, p) => p > 0 ? s - p * Math.log2(p) : s, 0);
  function pick(shaped, u) {
    let cum = 0, last = null;
    for (const s of shaped) { if (!s.keep) continue; cum += s.r; last = s; if (u < cum) return s.tok; }
    return last.tok;
  }

  /* Generate one sentence: start from `prompt` tokens, add tokens until an end mark or `maxLen` tokens. */
  function generate(ng, order, rand, opt = {}) {
    const T = opt.T == null ? 1 : opt.T, k = opt.k || 0, topP = opt.topP == null ? 1 : opt.topP, maxLen = opt.maxLen || 30;
    const out = (opt.prompt || []).slice();
    while (out.length < maxLen) {
      const d = ngramDist(ng, out, order);
      if (!d) break;
      const tok = pick(shape(d.items, T, k, topP), rand());
      out.push(tok);
      if (isEnd(tok)) break;
    }
    return out;
  }
  /* Of `runs` sampled sentences: how many are word-for-word a training line, and how many are new. */
  function copyStats(ng, order, seed, runs, opt = {}) {
    const r = rng(seed); let copied = 0, ended = 0;
    const samples = [];
    for (let i = 0; i < runs; i++) {
      const s = generate(ng, order, r, opt);
      if (isEnd(s[s.length - 1])) ended++;
      if (ng.lines.has(s.join(SEP))) copied++;
      if (samples.length < 6) samples.push(s);
    }
    return { copied, novel: runs - copied, runs, ended, samples };
  }
  /* Held-out test: at each position of each unseen sentence, was the full context ever seen in training, and
   * did the true next token ever follow it? */
  function heldout(ng, seqs, order) {
    let pos = 0, unseenCtx = 0, zeroProb = 0;
    for (const seq of seqs) {
      const s = [BOS, ...seq];
      for (let i = 1; i < s.length; i++) {
        pos++;
        const L = Math.min(order - 1, i), m = ng.table[L].get(s.slice(i - L, i).join(SEP));
        if (!m) { unseenCtx++; zeroProb++; } else if (!m.has(s[i])) zeroProb++;
      }
    }
    return { pos, unseenCtx, zeroProb };
  }
  /* Greedy decoding loops: the first token index at which a context repeats (so the text cycles from there). */
  function greedyLoop(ng, order, prompt, maxLen = 60) {
    const out = prompt.slice(), seen = new Map();
    for (let step = 0; step < maxLen; step++) {
      const key = [BOS, ...out].slice(-(order - 1) || undefined).join(SEP);
      if (order > 1 && seen.has(key)) return { tokens: out, loopAt: seen.get(key), period: out.length - seen.get(key) };
      seen.set(key, out.length);
      const d = ngramDist(ng, out, order); if (!d) break;
      out.push(d.items[0].tok);
      if (isEnd(d.items[0].tok)) return { tokens: out, loopAt: null, period: 0 };
    }
    return { tokens: out, loopAt: null, period: 0 };
  }

  /* ───────── 4 · word vectors from co-occurrence ───────── */
  // Cyclic Jacobi eigendecomposition of a symmetric matrix (array of rows). Returns {values, vectors[col]}.
  function jacobi(A0, sweeps = 60) {
    const n = A0.length, A = A0.map(r => Float64Array.from(r)), V = [];
    for (let i = 0; i < n; i++) { V.push(new Float64Array(n)); V[i][i] = 1; }
    for (let sw = 0; sw < sweeps; sw++) {
      let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
      if (off < 1e-18) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        const apq = A[p][q]; if (Math.abs(apq) < 1e-15) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
      }
    }
    const values = A.map((r, i) => r[i]);
    return { values, vectors: V }; // column j of V (V[k][j]) is the eigenvector of values[j]
  }
  function trainVectors(seqs, opt = {}) {
    const minCount = opt.minCount || 3, win = opt.window || 2, maxDim = opt.maxDim || 24;
    const cnt = new Map(); for (const s of seqs) for (const t of s) if (!isPunct(t)) cnt.set(t, (cnt.get(t) || 0) + 1);
    const vocab = [...cnt.entries()].filter(([, c]) => c >= minCount).map(([t]) => t).sort();
    const idx = new Map(vocab.map((t, i) => [t, i])), n = vocab.length;
    const C = []; for (let i = 0; i < n; i++) C.push(new Float64Array(n));
    for (const s of seqs) for (let i = 0; i < s.length; i++) {
      const a = idx.get(s[i]); if (a === undefined) continue;
      for (let j = Math.max(0, i - win); j <= Math.min(s.length - 1, i + win); j++) { if (j === i) continue; const b = idx.get(s[j]); if (b !== undefined) C[a][b] += 1; }
    }
    const row = C.map(r => r.reduce((x, y) => x + y, 0)), N = row.reduce((x, y) => x + y, 0);
    const P = C.map((r, i) => Array.from(r, (c, j) => c > 0 ? Math.max(0, Math.log(c * N / (row[i] * row[j]))) : 0));
    const eig = jacobi(P);
    const order = eig.values.map((v, i) => i).sort((a, b) => Math.abs(eig.values[b]) - Math.abs(eig.values[a]));
    const dims = Math.min(maxDim, n);
    const vec = vocab.map((t, w) => order.slice(0, dims).map(j => eig.vectors[w][j] * Math.sqrt(Math.abs(eig.values[j]))));
    // fix each column's sign so the result does not depend on the solver: largest-magnitude entry positive
    for (let d = 0; d < dims; d++) { let m = 0; for (const v of vec) if (Math.abs(v[d]) > Math.abs(m)) m = v[d]; if (m < 0) for (const v of vec) v[d] = -v[d]; }
    return { vocab, idx, vec, dims, counts: vocab.map(t => cnt.get(t)), sv: order.slice(0, dims).map(j => Math.abs(eig.values[j])) };
  }
  function cosine(a, b, k) {
    let ab = 0, aa = 0, bb = 0;
    for (let i = 0; i < k; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
    return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : 0;
  }
  function neighbours(V, word, k, n = 5, pool) {
    const i = V.idx.get(word); if (i === undefined) return [];
    const cand = pool ? pool.map(t => V.idx.get(t)).filter(j => j !== undefined) : V.vocab.map((t, j) => j);
    return cand.filter(j => j !== i).map(j => ({ tok: V.vocab[j], cos: cosine(V.vec[i], V.vec[j], k) })).sort((x, y) => y.cos - x.cos).slice(0, n);
  }
  function nearestTo(V, v, k, n = 3, exclude = []) {
    return V.vocab.map((t, j) => ({ tok: t, cos: cosine(v, V.vec[j], k) })).filter(x => !exclude.includes(x.tok)).sort((x, y) => y.cos - x.cos).slice(0, n);
  }
  /* 2-D map: principal components of the length-normalised k-dim vectors of the chosen words. */
  function map2d(V, words, k) {
    const X = words.map(w => { const v = V.vec[V.idx.get(w)].slice(0, k); const nr = Math.hypot(...v) || 1; return v.map(x => x / nr); });
    const mean = Array(k).fill(0); X.forEach(v => v.forEach((x, i) => { mean[i] += x / X.length; }));
    const Xc = X.map(v => v.map((x, i) => x - mean[i]));
    const Cv = []; for (let i = 0; i < k; i++) { Cv.push(Array(k).fill(0)); for (const v of Xc) for (let j = 0; j < k; j++) Cv[i][j] += v[i] * v[j]; }
    let pts;
    if (k === 1) pts = Xc.map(v => [v[0], 0]);
    else {
      const e = jacobi(Cv), ord = e.values.map((x, i) => i).sort((a, b) => e.values[b] - e.values[a]);
      const comp = ord.slice(0, 2).map(j => Array.from({ length: k }, (_, i) => e.vectors[i][j]));
      pts = Xc.map(v => comp.map(c => c.reduce((s, ci, i) => s + ci * v[i], 0)));
      // orientation: the first word sits at negative x and the first word of the last fifth at positive y, so the map does not flip as k changes
      for (let d = 0; d < 2; d++) { const ref = d === 0 ? pts[0][0] : pts[Math.floor(pts.length * 0.8)][1]; if ((d === 0 && ref > 0) || (d === 1 && ref < 0)) pts.forEach(p => { p[d] = -p[d]; }); }
    }
    return pts;
  }

  /* ───────── 5 · one attention head ─────────
   * Nine slots with hand-set 4-number keys and queries (features: person, thing, action, small word).
   * score(i, j) = q_i · k_j / √d − slope · (i − j), only for j ≤ i (a token cannot look ahead). */
  const attention = {
    d: 4,
    features: ['person', 'thing', 'action', 'small'],
    // slot roles: 0 mother · 1 bought · 2 some · 3 apples · 4 comma · 5 because · 6 it · 7 very · 8 sweet
    keys: [[2, 0, 0, 0], [0, 0, 2, 0], [0, 0, 0, 2], [0, 2, 0, 0], [0, 0, 0, 2], [0, 0, 0, 2], [0, 1, 0, 1], [0, 0, 0, 2], [0, 1, 0, 0]],
    // what each slot looks for: "bought" looks for a person, "apples" for an action, "it" for a thing that is not
    // a person and not a small word, "very" and "sweet" for a thing; the rest look for nothing in particular
    queries: [[0, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0], [0, 0, 4, 0], [0, 0, 0, 0], [0, 0, 2, 0], [-2, 4, 0, -2], [0, 2, 0, 0], [0, 4, 0, -1]],
    row(i, slope) {
      const q = attention.queries[i], out = [];
      for (let j = 0; j <= i; j++) {
        const k = attention.keys[j], dot = q.reduce((s, x, t) => s + x * k[t], 0), scaled = dot / Math.sqrt(attention.d), bias = -slope * (i - j);
        out.push({ j, dot, scaled, bias, score: scaled + bias });
      }
      const mx = Math.max(...out.map(o => o.score)), z = out.reduce((s, o) => s + Math.exp(o.score - mx), 0);
      out.forEach(o => { o.e = Math.exp(o.score - mx); o.w = o.e / z; });
      return out;
    },
    // the output: weighted sum of value vectors (rows of `values`, one per slot; null rows count as zero)
    mix(row, values, k) {
      const o = Array(k).fill(0);
      for (const r of row) { const v = values[r.j]; if (!v) continue; for (let t = 0; t < k; t++) o[t] += r.w * v[t]; }
      return o;
    }
  };

  /* ───────── 6 · training a next-token network ─────────
   * logits(next | prev = a) = E[a] · W + b   (E: V×d, W: d×V, b: V). Loss = mean cross-entropy over every
   * adjacent pair in the corpus. Full-batch gradient descent. With d large enough the best possible loss is the
   * conditional entropy of the bigram counts (each row's softmax can match the counted frequencies exactly). */
  function bigramData(seqs) {
    const vocabSet = new Set([BOS]); for (const s of seqs) for (const t of s) vocabSet.add(t);
    const vocab = [...vocabSet].sort(), idx = new Map(vocab.map((t, i) => [t, i])), V = vocab.length;
    const rows = new Map(); let pairs = 0;
    for (const s of seqs) { const x = [BOS, ...s]; for (let i = 1; i < x.length; i++) { const a = idx.get(x[i - 1]), b = idx.get(x[i]); let r = rows.get(a); if (!r) rows.set(a, r = new Map()); r.set(b, (r.get(b) || 0) + 1); pairs++; } }
    const R = [...rows.entries()].map(([a, m]) => ({ a, n: [...m.values()].reduce((x, y) => x + y, 0), next: [...m.entries()] }));
    // floor: conditional entropy in nats (mean −log of the counted frequency)
    let H = 0; for (const r of R) for (const [, c] of r.next) H -= c * Math.log(c / r.n);
    return { vocab, idx, V, rows: R, pairs, floor: H / pairs };
  }
  function netCreate(data, d, seed) {
    const r = rng(seed), V = data.V, s = 0.1;
    const g = () => (r() + r() + r() - 1.5) * 2 * s; // roughly normal, sd ≈ s
    const E = new Float64Array(V * d), W = new Float64Array(d * V), b = new Float64Array(V);
    for (let i = 0; i < E.length; i++) E[i] = g();
    for (let i = 0; i < W.length; i++) W[i] = g();
    return { d, V, E, W, b, step: 0, data, history: [] };
  }
  function netProbs(net, a) {
    const { d, V, E, W, b } = net, z = new Float64Array(V);
    for (let j = 0; j < V; j++) { let s = b[j]; for (let t = 0; t < d; t++) s += E[a * d + t] * W[t * V + j]; z[j] = s; }
    let mx = -Infinity; for (let j = 0; j < V; j++) if (z[j] > mx) mx = z[j];
    let zs = 0; for (let j = 0; j < V; j++) { z[j] = Math.exp(z[j] - mx); zs += z[j]; }
    for (let j = 0; j < V; j++) z[j] /= zs;
    return z;
  }
  function netLoss(net) {
    let L = 0; for (const r of net.data.rows) { const p = netProbs(net, r.a); for (const [j, c] of r.next) L -= c * Math.log(p[j]); }
    return L / net.data.pairs;
  }
  /* One gradient-descent step on the mean cross-entropy. Returns the loss before the step. */
  function netStep(net, lr) {
    const { d, V, E, W, b, data } = net, N = data.pairs;
    const gW = new Float64Array(d * V), gb = new Float64Array(V), gE = new Float64Array(E.length);
    let L = 0;
    for (const r of data.rows) {
      const p = netProbs(net, r.a);
      for (const [j, c] of r.next) L -= c * Math.log(p[j]);
      // dLoss/dlogit_j = (n_a · p_j − count_j) / N
      const g = new Float64Array(V); for (let j = 0; j < V; j++) g[j] = r.n * p[j] / N;
      for (const [j, c] of r.next) g[j] -= c / N;
      const ea = r.a * d;
      for (let j = 0; j < V; j++) { const gj = g[j]; if (gj === 0) continue; gb[j] += gj; for (let t = 0; t < d; t++) { gW[t * V + j] += E[ea + t] * gj; gE[ea + t] += W[t * V + j] * gj; } }
    }
    for (let i = 0; i < W.length; i++) W[i] -= lr * gW[i];
    for (let i = 0; i < E.length; i++) E[i] -= lr * gE[i];
    for (let i = 0; i < V; i++) b[i] -= lr * gb[i];
    net.step++;
    const loss = L / N;
    net.history.push(loss);
    return loss;
  }

  /* ───────── putting a corpus through every model ───────── */
  const MAX_MERGES = 400, MIN_PAIR = 5;
  /* The essay's tokenizer: train BPE until no pair is left (chapter 1 shows all of it), then keep only the merges
   * made while the best pair still occurred at least MIN_PAIR times (real tokenizers stop at a chosen vocabulary
   * size instead; this rule picks one for each corpus). */
  function build(corpus, opt = {}) {
    const bpe = trainBPE(corpus.lines, corpus.lang, MAX_MERGES);
    let stop = bpe.merges.findIndex(m => m.count < (opt.minPair || corpus.minPair || MIN_PAIR)); if (stop < 0) stop = bpe.merges.length;
    if (opt.merges != null) stop = opt.merges;
    const tok = { lang: bpe.lang, merges: bpe.merges.slice(0, stop) };
    bpe.stop = stop;
    const seqs = corpus.lines.map(l => encode(l, tok));
    const held = corpus.heldout.map(l => encode(l, tok));
    const ng = trainNgram(seqs, 4);
    const vectors = trainVectors(seqs, { minCount: 3, window: 2, maxDim: 24 });
    const bigram = bigramData(seqs);
    return { corpus, bpe, tok, seqs, held, ng, vectors, bigram };
  }


  /* Every model number the essay's prose states, computed from one corpus. The page fills the prose
   * placeholders with these; tests/models.cjs checks them. */
  const MAP_GROUPS = [[0, 4], [4, 10], [10, 14], [14, 19], [19, 22]]; // animals · food · drinks · people · places
  const groupOf = i => MAP_GROUPS.findIndex(([a, b]) => i >= a && i < b);
  function sameKind(V, map, k) {
    let good = 0;
    map.forEach((w, i) => { const nb = neighbours(V, w, k, 1, map)[0]; if (nb && groupOf(map.indexOf(nb.tok)) === groupOf(i)) good++; });
    return good;
  }
  function distinctSentences(ng, order, T, k, topP, runs, seed) {
    const r = rng(seed), set = new Set();
    for (let i = 0; i < runs; i++) set.add(generate(ng, order, r, { T, k, topP }).join(SEP));
    return set.size;
  }
  const RUNS = 200, K0 = 8;
  function facts(B) {
    const C = B.corpus, bpe = B.bpe, f = {};
    const pct = (a, b) => Math.round(100 * a / b);
    f.lines = C.lines.length; f.chars = bpe.chars; f.base = bpe.baseSize; f.total = bpe.merges.length; f.stop = bpe.stop; f.minPair = C.minPair || MIN_PAIR; f.nextC = bpe.merges[bpe.stop] ? bpe.merges[bpe.stop].count : 0;
    f.m1 = bpe.merges[0].ab.replace(/^ /, '\u2423'); f.m1c = bpe.merges[0].count;
    f.tokStop = bpe.tokensAfter[bpe.stop]; f.ratio = (bpe.chars / f.tokStop).toFixed(1); f.vocabStop = bpe.baseSize + bpe.stop;
    const late = bpe.merges.slice(bpe.stop).reduce((a, m) => [...m.ab].length > [...a.ab].length ? m : a, bpe.merges[bpe.stop] || bpe.merges[0]);
    f.late = late.ab.trim(); f.lateC = late.count;
    // chapter 2
    const d = ngramDist(B.ng, [C.probes.contexts[0]], 2);
    f.ctx = C.probes.contexts[0].trim(); f.ctxN = d.total; f.ctxK = d.items.length; f.top1 = d.items[0].tok.trim(); f.top1c = d.items[0].c; f.pairs = B.ng.pairs;
    // chapter 3
    f.runs = RUNS; f.heldN = B.held.length;
    for (const o of [1, 2, 3, 4]) {
      const s = copyStats(B.ng, o, 7, RUNS), h = heldout(B.ng, B.held, o);
      f['copy' + o] = s.copied; f['unseen' + o] = pct(h.unseenCtx, h.pos); f['zero' + o] = pct(h.zeroProb, h.pos);
    }
    // chapter 4
    const V = B.vectors, map = C.probes.map;
    f.k0 = K0; f.dims = V.dims; f.vecN = V.vocab.length; f.mapN = map.length;
    const nb = neighbours(V, C.probes.word, K0, 1)[0]; f.word = C.probes.word.trim(); f.nb = nb.tok.trim(); f.nbCos = nb.cos.toFixed(2);
    f.good2 = sameKind(V, map, 2); f.good8 = sameKind(V, map, K0);
    // chapter 5
    const vals = C.toyVocab.map(t => t && V.idx.has(t) ? V.vec[V.idx.get(t)] : null);
    const r0 = attention.row(6, 0), r2 = attention.row(6, 2);
    f.wThing = Math.round(100 * r0[3].w); f.near0 = nearestTo(V, attention.mix(r0, vals, V.dims), V.dims, 1)[0].tok.trim();
    f.wSelf2 = Math.round(100 * r2[6].w); f.near2 = nearestTo(V, attention.mix(r2, vals, V.dims), V.dims, 1)[0].tok.trim();
    // chapter 6
    const sd = ngramDist(B.ng, [C.probes.sampleContexts[0]], 2);
    f.sctx = C.probes.sampleContexts[0].trim(); f.sK = sd.items.length;
    const top = T => Math.round(100 * shape(sd.items, T, 0, 1)[0].r);
    f.p1T1 = top(1); f.p1T05 = top(0.5); f.p1T2 = top(2);
    f.dist0 = distinctSentences(B.ng, 2, 0, 0, 1, 100, 3); f.dist1 = distinctSentences(B.ng, 2, 1, 0, 1, 100, 3);
    f.dist05 = distinctSentences(B.ng, 2, 0.5, 0, 1, 100, 3);
    // chapter 7
    f.V = B.bigram.V; f.lnV = Math.log(B.bigram.V).toFixed(2); f.floor = B.bigram.floor.toFixed(2); f.pplFloor = Math.exp(B.bigram.floor).toFixed(1);
    // chapter 8
    let entries = 0; for (let L = 0; L < 3; L++) for (const m of B.ng.table[L].values()) entries += m.size;
    f.entries3 = entries; f.netParams = B.bigram.V * K0 * 2 + B.bigram.V;
    f.gapGpt3 = Math.floor(Math.log10(175e9 / f.netParams)); f.gapTok = Math.floor(Math.log10(300e9 / f.tokStop));
    return f;
  }

  return { MAP_GROUPS, groupOf, sameKind, distinctSentences, facts, RUNS, K0, rng, BOS, SEP, isEnd, isPunct, chunks, trainBPE, encode, trainNgram, ngramDist, shape, entropyBits, pick, generate, copyStats, heldout, greedyLoop,
    jacobi, trainVectors, cosine, neighbours, nearestTo, map2d, attention, bigramData, netCreate, netProbs, netLoss, netStep, build, MAX_MERGES, MIN_PAIR };
}));
