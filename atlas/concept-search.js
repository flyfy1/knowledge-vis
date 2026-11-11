/* Shared concept/page matcher for the atlas search and the homepage site search.
   Contract: specs/atlas-search-index.md. Plain script (window.ConceptSearch) and
   CommonJS (node tests). No dependencies, no state.

   A record has three kinds of text, each a list of strings in any language:
     titles   — the concept or page name           (strongest)
     aliases  — what people type: everyday words, tags
     texts    — descriptions                        (weakest)
   Matching is NFKC + lowercase, and ignores spaces, hyphens, underscores,
   middle dots and apostrophes, so "eigen vector", "eigen-vector" and
   "Eigenvector" are the same query. Both languages are always searched. */
(function (root) {
  'use strict';
  const IGNORED = /[\s\-‐-―_·・'’]/gu;
  const normalize = s => String(s == null ? '' : s).normalize('NFKC').toLowerCase();
  const squash = s => normalize(s).replace(IGNORED, '');
  // Titles such as "鸡兔同笼 · 先假设…" or "Fourier: …" also match on their head.
  const heads = s => normalize(s).split(/\s[·:|]\s|[:：]/).map(squash).filter(Boolean);

  function prepare(fields) {
    const list = v => (Array.isArray(v) ? v : [v]).filter(x => typeof x === 'string' && x.trim());
    const titles = list(fields.titles), aliases = list(fields.aliases), texts = list(fields.texts);
    return {
      titles: titles.map(squash),
      titleHeads: titles.flatMap(heads),
      aliases: aliases.map(squash),
      texts: texts.map(squash),
      length: titles.length ? Math.min(...titles.map(t => t.length)) : 999,
    };
  }
  // Score of one squashed term against a prepared record; 0 = no match.
  // Title > alias > description; exact > prefix > contains.
  function termScore(r, q) {
    let best = 0;
    const take = (list, exact, prefix, contains) => {
      for (const s of list) {
        if (!s) continue;
        const v = s === q ? exact : s.startsWith(q) ? prefix : s.includes(q) ? contains : 0;
        if (v > best) best = v;
      }
    };
    take(r.titles, 100, 80, 60);
    take(r.titleHeads, 95, 80, 60);
    take(r.aliases, 90, 75, 55);
    if (!best) take(r.texts, 20, 20, 20);
    return best;
  }
  function withSingular(r, q) {
    // "eigenvectors" -> "eigenvector" when the plural itself does not match.
    const s = termScore(r, q);
    if (s || q.length < 4 || !/[a-z]s$/.test(q)) return s;
    return termScore(r, q.slice(0, -1));
  }
  // Question phrasing ("什么是熵", "为什么会共振", "what is entropy", "how does GPS work").
  // Used only when the query as typed matches nothing. Chinese: multi-character question
  // words anywhere; a single-character particle only where it touches a removed word
  // (so "能量是什么" keeps 能量). English: question words as whole words, plus a trailing
  // "work"/"mean"/"happen" after a leading how/what/why.
  const ZH_Q = /为什么|为啥|怎么回事|怎么样|怎么|是什么|什么是|什么|如何|是不是|有没有/g;
  const ZH_AFTER = /^[会要能是的就都还]+/, ZH_BEFORE = /[的了是吗呢啊呀]+$/;
  const EN_Q = /\b(what|whats|why|how|when|where|which|who|is|are|was|were|am|does|do|did|can|could|should|would|will|the|a|an|it|its|i|my|me|you|your|this|that)\b/g;
  function unquestion(query) {
    const typed = normalize(query).trim();
    let q = typed.replace(/[?？!！。，,]/g, ' ').trim();
    if (/^(how|what|why|whats)\b/.test(q)) q = q.replace(/\s(work|works|mean|means|happen|happens)$/, '');
    q = q.replace(/['’]s\b/g, ' ').replace(EN_Q, ' ');
    const parts = q.split(ZH_Q);
    q = parts.map((p, i) => {
      if (i > 0) p = p.replace(ZH_AFTER, '');
      if (i < parts.length - 1) p = p.replace(ZH_BEFORE, '');
      return p;
    }).join(' ').replace(/[的吗呢啊呀]+\s*$/, '').replace(/\s+/g, ' ').trim();
    return q === typed ? '' : q;
  }
  // A question that matches only after dropping its question words ranks 5 below
  // the same words typed plainly.
  function score(r, query) {
    const s = literal(r, query);
    if (s) return s;
    const q = unquestion(query);
    return q ? Math.max(0, literal(r, q) - 5) : 0;
  }
  // Whole query first (so "eigen vector" matches "eigenvector"); otherwise every
  // space-separated word must match somewhere, scored by its weakest word.
  function literal(r, query) {
    const whole = squash(query);
    if (!whole) return 0;
    const s = withSingular(r, whole);
    if (s) return s;
    const words = normalize(query).split(/\s+/).map(squash).filter(Boolean);
    if (words.length < 2) return 0;
    let min = Infinity;
    for (const w of words) { const v = withSingular(r, w); if (!v) return 0; if (v < min) min = v; }
    return Math.max(1, min - 5);
  }
  // items: [{record: prepare(..), ...}] -> matches sorted by score, then the
  // shorter title (more specific), then input order. Non-matches dropped.
  function rank(items, query) {
    return items.map((item, i) => ({ item, i, score: score(item.record, query) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.record.length - b.item.record.length || a.i - b.i)
      .map(x => Object.assign({ score: x.score }, x.item));
  }
  const api = { normalize, squash, prepare, score, rank, unquestion, TITLE: 60, ALIAS: 55, TEXT: 20 };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConceptSearch = api;
})(typeof window !== 'undefined' ? window : this);
