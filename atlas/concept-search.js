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
  const HEAD = /\s[·:|]\s|[:：]/;
  const heads = s => normalize(s).split(HEAD).map(squash).filter(Boolean);

  // Offsets in squash(s) where a Latin word starts; used by strict matching so that
  // "rent" does not match "current" nor "emotion" match "plate motion".
  function starts(s) {
    const out = new Set([0]);
    let i = 0, prev = '';
    for (const ch of normalize(s)) {
      if (IGNORED.test(ch)) { IGNORED.lastIndex = 0; prev = ' '; continue; }
      IGNORED.lastIndex = 0;
      if (!/[a-z0-9]/.test(ch) || !/[a-z0-9]/.test(prev)) out.add(i);
      prev = ch; i += ch.length;
    }
    return out;
  }
  function prepare(fields) {
    const list = v => (Array.isArray(v) ? v : [v]).filter(x => typeof x === 'string' && x.trim());
    const titles = list(fields.titles), aliases = list(fields.aliases), texts = list(fields.texts);
    return {
      titles: titles.map(squash),
      titleHeads: titles.flatMap(heads),
      aliases: aliases.map(squash),
      texts: texts.map(squash),
      starts: new Map([...titles, ...titles.flatMap(t => normalize(t).split(HEAD)), ...aliases]
        .map(t => [squash(t), starts(t)])),
      length: titles.length ? Math.min(...titles.map(t => t.length)) : 999,
    };
  }
  function atWordStart(r, s, q) {
    const b = r.starts && r.starts.get(s);
    if (!b) return true;
    for (let p = s.indexOf(q); p !== -1; p = s.indexOf(q, p + 1)) if (b.has(p)) return true;
    return false;
  }
  // Score of one squashed term against a prepared record; 0 = no match.
  // Title > alias > description; exact > prefix > contains.
  // strict (used by the fallbacks below): titles and aliases only, and a contained match
  // must begin at a word ("rent" does not match "current"); Chinese has no word breaks.
  function termScore(r, q, strict) {
    let best = 0;
    const take = (list, exact, prefix, contains) => {
      for (const s of list) {
        if (!s) continue;
        const v = s === q ? exact : s.startsWith(q) ? prefix
          : s.includes(q) && (!strict || atWordStart(r, s, q)) ? contains : 0;
        if (v > best) best = v;
      }
    };
    take(r.titles, 100, 80, 60);
    take(r.titleHeads, 95, 80, 60);
    take(r.aliases, 90, 75, 55);
    if (!best && !strict) take(r.texts, 20, 20, 20);
    return best;
  }
  function withSingular(r, q, strict) {
    // "eigenvectors" -> "eigenvector", "batteries" -> "battery", "processes" -> "process"
    // when the plural itself does not match.
    const s = termScore(r, q, strict);
    if (s || q.length < 4 || !/[a-z]s$/.test(q)) return s;
    if (/[a-z]ies$/.test(q)) { const y = termScore(r, q.slice(0, -3) + 'y', strict); if (y) return y; }
    if (/(?:ss|x|ch|sh)es$/.test(q)) { const e = termScore(r, q.slice(0, -2), strict); if (e) return e; }
    return termScore(r, q.slice(0, -1), strict);
  }
  // Question phrasing ("什么是熵", "为什么会共振", "what is entropy", "how does GPS work").
  // Used only when the query as typed matches nothing. Chinese: multi-character question
  // words anywhere; a single-character particle only where it touches a removed word
  // (so "能量是什么" keeps 能量). English: question words as whole words, plus a trailing
  // "work"/"mean"/"happen" after a leading how/what/why.
  const ZH_Q = /为什么|为啥|怎么回事|怎么样|怎么|是什么|什么是|什么|如何|是不是|有没有/g;
  const ZH_AFTER = /^[会要能是的就都还]+/, ZH_BEFORE = /[的了是吗呢啊呀]+$/;
  const EN_Q = /\b(what|whats|why|how|when|where|which|who|is|are|was|were|am|does|do|did|can|could|should|would|will|the|a|an|it|its|i|my|me|you|your|this|that)\b/g;
  function dropQuestionWords(text, after = ZH_AFTER, before = ZH_BEFORE) {
    let q = text.replace(/[?？!！。，,]/g, ' ').trim();
    if (/^(how|what|why|whats)\b/.test(q)) q = q.replace(/\s(work|works|mean|means|happen|happens)$/, '');
    q = q.replace(/['’]s\b/g, ' ').replace(EN_Q, ' ');
    const parts = q.split(ZH_Q);
    return parts.map((p, i) => {
      if (i > 0) p = p.replace(after, '');
      if (i < parts.length - 1) p = p.replace(before, '');
      return p;
    }).join(' ').replace(/[的吗呢啊呀]+\s*$/, '').replace(/\s+/g, ' ').trim();
  }
  function unquestion(query) {
    const typed = normalize(query).trim();
    const q = dropQuestionWords(typed);
    return q === typed ? '' : q;
  }
  // Question scaffolding (2026-11-11 gap audit): the words around the content that the
  // question words leave behind, e.g. "导数是什么意思" -> "导数 意思", "what causes
  // earthquakes" -> "causes earthquakes". Tried only after unquestion() found nothing for
  // the record. Built from the audit's misses; a predicate is dropped only as a whole
  // leftover word next to a question word, so "work and energy", "功" or "杠杆原理" stay.
  const ZH_PHRASES = [
    [/(?:是|的)?(?:什么|啥)意思|的意思是?|的含义/g, ' '],
    [/有(?:什么|啥)(?:用处|用|作用|影响|好处|意义)|起(?:什么|啥)作用/g, ' '],
    [/(?:之间)?(?:的|有)?(?:什么|啥)?(?:区别|不同|差别|差异)(?:是什么|在哪里?)?|(?:怎么|如何|怎样)(?:区分|区别|分辨)/g, ' '],
    [/(?:的)?原理是什么|的原理|的工作原理|的作用$/g, ' '],
    [/对(?:人|人体|身体|我们|经济|生活)?的?影响/g, ' '],
  ];
  // Predicates left as a whole word after a question word is dropped ("怎么形成的" -> 形成).
  const ZH_PRED = /^(?:意思|含义|形成|工作|起作用|发挥作用|发生|运作|运行|产生|来|来的|算|计算|区分|实现|看|读|定义|用|有|影响|原理|回事)$/;
  const EN_PHRASES = [
    [/^what (?:is|are) the (?:meaning|definition) of /, ''],
    [/^what (?:is|are) (?:the )?causes? of /, ''],
    [/^what causes? /, ''],
    [/^what happens (?:when|if|to) /, ''],
    [/^(?:can you |please )?explain(?: to me)?(?: what| how| why)?(?: is| are| does| do)? /, ''],
    [/^tell me about /, ''],
    [/^where (?:do|does|did) (.+) come from$/, '$1'],
    [/^how (?:to|do (?:you|i|we)|can (?:i|you|we)|should (?:i|you|we)) (?:calculate|compute|work out|find|read|use|measure|solve|understand) /, ''],
    [/^how (?:is|are) (.+) (?:made|formed|produced|created|calculated|measured)$/, '$1'],
    [/^(?:what|how) (?:is|are) (.+?) (?:used for|for|made of|made from)$/, '$1'],
    [/^how (?:do|does|did) (.+) (?:affect|affects|change|changes) .+$/, '$1'],
    [/^(?:the )?effects? of (.+) on .+$/, '$1'],
  ];
  const EN_TRAILING = /^((?:how|why|what|where|when)\b.*)\s(?:work|works|function|functions|form|forms|occur|occurs)$/;
  const EN_EXTRA = /\b(?:we|us|our|they|them|their|people|someone|get|gets|have|has|had|to)\b/g;
  function unscaffold(query) {
    const typed = normalize(query).replace(/[?？!！。，,]/g, ' ').replace(/\s+/g, ' ').trim();
    let t = typed;
    t = t.replace(EN_TRAILING, '$1');
    for (const [re, to] of EN_PHRASES) t = t.replace(re, to);
    for (const [re, to] of ZH_PHRASES) t = t.replace(re, to);
    const asked = t !== typed || dropQuestionWords(typed) !== typed;
    // 有 next to a dropped question word ("为什么有白天黑夜", "质数有什么用") is a particle.
    let words = dropQuestionWords(t, /^[会要能是的就都还有]+/, /[的了是吗呢啊呀有]+$/)
      .replace(EN_EXTRA, ' ').split(/\s+/).filter(Boolean);
    if (asked && words.length > 1) words = words.filter((w, i) => i === 0 || !ZH_PRED.test(w));
    const q = words.join(' ');
    return asked && q && q !== typed ? q : '';
  }
  // Comparison queries (2026-11-11): "mean vs median", "difference between A and B",
  // "A 和 B 的区别". Returns [A, B] or null. Chinese needs a comparison word
  // (区别/区分/不同/差别/差异/对比/比较) before 和/与/跟/同 splits, so "酸和碱" or "和弦" stay whole.
  function compare(query) {
    const t = normalize(query).replace(/[?？!！。，,]/g, ' ').replace(/\s+/g, ' ').trim();
    const pair = (a, b) => {
      const clean = s => s.replace(/^(?:the|a|an)\s+|\s+(?:the|a|an)$/g, '').trim();
      a = clean(a); b = clean(b);
      return a && b && squash(a) !== squash(b) ? [a, b] : null;
    };
    let m = t.match(/^(?:what(?:'s| is| are)? )?(?:the )?(?:main )?differences? between (.+?) and (.+)$/) ||
      t.match(/^(?:compare|comparing) (.+?) (?:and|with|to|vs\.?) (.+)$/) ||
      t.match(/^(.+?)\s+(?:vs\.?|versus|v\.|compared (?:to|with))\s+(.+)$/) ||
      t.match(/^(.*[\u3400-\u9fff])\s*(?:vs\.?|对比)\s*([\u3400-\u9fff].*)$/);
    if (m) return pair(m[1], m[2]);
    const zh = t.replace(/\s+/g, '');
    const core = zh.replace(/(?:之间)?(?:的|有)?(?:什么|啥|哪些|何)?(?:区别|不同|差别|差异|分别|不一样)(?:是什么|在哪里?|在哪儿)?$|(?:怎么|如何|怎样)(?:区分|区别|分辨)$|(?:的)?(?:对比|比较)$/, '');
    if (core === zh) return null;
    m = core.match(/^(.+?)(?:和|与|跟|同|及|还是|、)(.+)$/);
    return m ? pair(m[1], m[2]) : null;
  }
  // [score, side]: side 0 = the query as a whole (or both halves of a comparison),
  // 1 / 2 = only the first / second half of a comparison.
  // The scaffolding and comparison fallbacks are strict: they are guesses about what the
  // content word is, so a description-only or mid-word match is not enough.
  function single(r, query, strict) {
    const s = literal(r, query, strict);
    if (s) return s;
    const q = unquestion(query);
    const s2 = q ? Math.max(0, literal(r, q, strict) - 5) : 0;
    if (s2) return s2;
    // Scaffolding dropped: the same 5 below the plain words as a question.
    const q3 = unscaffold(query);
    return q3 && q3 !== q ? Math.max(0, literal(r, q3, true) - 5) : 0;
  }
  function match(r, query) {
    const s = single(r, query);
    if (s) return [s, 0];
    const pair = compare(query);
    if (!pair) return [0, 0];
    const a = single(r, pair[0], true), b = single(r, pair[1], true);
    if (a && b) return [Math.max(1, Math.min(a, b) - 5), 0];
    if (a) return [Math.max(1, a - 10), 1];
    if (b) return [Math.max(1, b - 10), 2];
    return [0, 0];
  }
  // A question that matches only after dropping its question words ranks 5 below
  // the same words typed plainly.
  function score(r, query) { return match(r, query)[0]; }
  // For a comparison, put what covers both halves first, then alternate the best of
  // each half, keeping each group's existing order. Anything else is returned as is.
  function arrange(list, query, recordOf) {
    if (!compare(query)) return list;
    const groups = [[], [], []];
    for (const x of list) groups[match(recordOf(x), query)[1]].push(x);
    const out = groups[0].slice();
    for (let i = 0; i < Math.max(groups[1].length, groups[2].length); i++) {
      if (i < groups[1].length) out.push(groups[1][i]);
      if (i < groups[2].length) out.push(groups[2][i]);
    }
    return out;
  }
  // Whole query first (so "eigen vector" matches "eigenvector"); otherwise every
  // space-separated word must match somewhere, scored by its weakest word.
  function literal(r, query, strict) {
    const whole = squash(query);
    if (!whole) return 0;
    const s = withSingular(r, whole, strict);
    if (s) return s;
    const words = normalize(query).split(/\s+/).map(squash).filter(Boolean);
    if (words.length < 2) return 0;
    let min = Infinity;
    for (const w of words) { const v = withSingular(r, w, strict); if (!v) return 0; if (v < min) min = v; }
    return Math.max(1, min - 5);
  }
  // items: [{record: prepare(..), ...}] -> matches sorted by score, then the
  // shorter title (more specific), then input order. Non-matches dropped.
  function rank(items, query) {
    const ranked = items.map((item, i) => ({ item, i, score: score(item.record, query) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.record.length - b.item.record.length || a.i - b.i)
      .map(x => Object.assign({ score: x.score }, x.item));
    return arrange(ranked, query, x => x.record);
  }
  const api = { normalize, squash, prepare, score, rank, arrange, compare, unquestion, unscaffold, TITLE: 60, ALIAS: 55, TEXT: 20 };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConceptSearch = api;
})(typeof window !== 'undefined' ? window : this);
