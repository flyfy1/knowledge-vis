'use strict';
// Word-embedding lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, vector, cosine, map position and analogy on the page is computed here; tests/core.cjs pins
// the claims. Loads in the browser (window.EMB_MODEL) and in node (module.exports).
// The corpus is a hand-written TOY corpus of short sentences, shown word by word. Real embeddings are
// learned from billions of words; nothing here is measured from a real corpus.
(function (root) {
  // Vocabulary (ids are indices). zh glosses are display labels only; the corpus is the same in both languages.
  const VOCAB = [
    ['he', '他'], ['she', '她'], ['it', '它'], ['is', '是'],
    ['king', '国王'], ['queen', '女王'], ['man', '男人'], ['woman', '女人'], ['cat', '猫'], ['dog', '狗'],
    ['wears', '戴'], ['crown', '王冠'], ['rules', '统治'], ['land', '国土'], ['rich', '富有'],
    ['works', '工作'], ['city', '城市'], ['walks', '走过'], ['street', '街道'], ['busy', '忙碌'],
    ['chases', '追'], ['ball', '球'], ['eats', '吃'], ['food', '食物'], ['small', '小'],
    ['sleeps', '睡在'], ['home', '家'], ['hat', '帽子'], ['dress', '裙子']
  ];
  const ID = Object.fromEntries(VOCAB.map((w, i) => [w[0], i]));
  // 28 three-word sentences. Word order is kept identical in both languages (the page shows them word by word).
  const RAW = [
    'he is king', 'she is queen', 'he is man', 'she is woman',
    'king wears crown', 'queen wears crown', 'king rules land', 'queen rules land', 'king is rich', 'queen is rich',
    'man works city', 'woman works city', 'man walks street', 'woman walks street', 'man is busy', 'woman is busy',
    'it is cat', 'it is dog', 'cat chases ball', 'dog chases ball', 'cat eats food', 'dog eats food', 'cat is small', 'dog is small',
    'queen wears dress', 'man wears hat', 'dog walks street', 'cat sleeps home'
  ];
  const CORPUS = RAW.map(s => s.split(' ').map(w => ID[w]));
  const V = VOCAB.length;
  // Words the map and the similarity charts focus on.
  const NOUNS = ['king', 'queen', 'man', 'woman', 'cat', 'dog'].map(w => ID[w]);

  // ---- step 0: one-hot ----
  const oneHot = i => Array.from({ length: V }, (_, j) => (j === i ? 1 : 0));

  // ---- vector helpers ----
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  const norm = a => Math.sqrt(dot(a, a));
  const cosine = (a, b) => { const na = norm(a), nb = norm(b); return na && nb ? dot(a, b) / (na * nb) : 0; };
  const dist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

  // ---- step 1: co-occurrence counts from the first `k` sentences with window `w` ----
  // M[t][c] = how many times word c appears within w positions of word t in the same sentence.
  function counts(k = CORPUS.length, w = 2) {
    const M = Array.from({ length: V }, () => new Array(V).fill(0));
    for (let s = 0; s < Math.min(k, CORPUS.length); s++) {
      const S = CORPUS[s];
      for (let i = 0; i < S.length; i++) for (let j = 0; j < S.length; j++) if (i !== j && Math.abs(i - j) <= w) M[S[i]][S[j]]++;
    }
    return M;
  }
  // Pairs counted while reading sentence s (for the reading animation).
  function pairsIn(s, w) {
    const S = CORPUS[s], out = [];
    for (let i = 0; i < S.length; i++) for (let j = 0; j < S.length; j++) if (i !== j && Math.abs(i - j) <= w) out.push([S[i], S[j]]);
    return out;
  }

  // ---- step 3: PPMI — how much more often than chance two words co-occur, floored at 0 ----
  function ppmi(M) {
    let total = 0; const row = M.map(r => r.reduce((a, b) => a + b, 0)), col = new Array(M[0].length).fill(0);
    M.forEach(r => r.forEach((v, j) => { col[j] += v; total += v; }));
    return M.map((r, i) => r.map((v, j) => { if (!v) return 0; const pmi = Math.log2((v * total) / (row[i] * col[j])); return Math.max(0, pmi); }));
  }
  // Neighbours of word i by cosine among `pool` ids (excluding i), best first.
  function neighbours(X, i, pool = null) {
    const ids = (pool || X.map((_, j) => j)).filter(j => j !== i);
    return ids.map(j => ({ j, cos: cosine(X[i], X[j]) })).sort((a, b) => b.cos - a.cos || a.j - b.j);
  }

  // ---- step 4: compress to a few dimensions (SVD via Jacobi on X·Xᵀ) ----
  function jacobiEigen(A) {
    const n = A.length, a = A.map(r => r.slice()), v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
      if (off < 1e-22) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
        for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
      }
    }
    const vals = a.map((r, i) => r[i]), order = vals.map((_, i) => i).sort((x, y) => vals[y] - vals[x]);
    return { values: order.map(i => vals[i]), vectors: order.map(i => v.map(r => r[i])) };
  }
  // Rows of X expressed in the top-k directions: coordinates u_i·σ_i (word i's position along each direction).
  // Signs are fixed so that the largest-magnitude entry of each direction is positive (stable pictures).
  function compress(X) {
    const G = X.map(a => X.map(b => dot(a, b)));
    const { values, vectors } = jacobiEigen(G);
    const sig = values.map(v => Math.sqrt(Math.max(0, v)));
    const dirs = vectors.map(u => { let m = 0; u.forEach(x => { if (Math.abs(x) > Math.abs(m)) m = x; }); return m < 0 ? u.map(x => -x) : u; });
    const coords = X.map((_, i) => dirs.map((u, d) => u[i] * sig[d]));
    const energy = values.map(v => Math.max(0, v)), total = energy.reduce((a, b) => a + b, 0);
    return { coords, sig, share: k => energy.slice(0, k).reduce((a, b) => a + b, 0) / total };
  }
  const truncate = (coords, k) => coords.map(c => c.slice(0, k));

  // ---- step 5: analogy a − b + c, nearest by cosine excluding the three inputs ----
  function analogy(X, a, b, c, pool = null) {
    const r = X[a].map((v, i) => v - X[b][i] + X[c][i]);
    const ids = (pool || X.map((_, j) => j)).filter(j => j !== a && j !== b && j !== c);
    const ranked = ids.map(j => ({ j, cos: cosine(r, X[j]) })).sort((p, q) => q.cos - p.cos || p.j - q.j);
    return { r, ranked };
  }

  const api = { VOCAB, ID, CORPUS, V, NOUNS, oneHot, dot, norm, cosine, dist, counts, pairsIn, ppmi, neighbours, jacobiEigen, compress, truncate, analogy };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EMB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
