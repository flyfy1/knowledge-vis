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
  // Whole query first (so "eigen vector" matches "eigenvector"); otherwise every
  // space-separated word must match somewhere, scored by its weakest word.
  function score(r, query) {
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
  const api = { normalize, squash, prepare, score, rank, TITLE: 60, ALIAS: 55, TEXT: 20 };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConceptSearch = api;
})(typeof window !== 'undefined' ? window : this);
