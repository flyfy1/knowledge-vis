# #745 Prefix and Suffix Search — author brief

Scope: one bilingual lesson, computing category, university stage. Reader knows loops, strings and dictionaries. Reuse the approved collection/page design in ../../specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; no new platform or layout. Author self-check only; independent teaching review remains pending.

Official verification: 2026-10-25, https://leetcode.com/problems/prefix-and-suffix-search/. Public GraphQL GET capture in provenance/official.json contains full statement and actual codeSnippets including Python3 WordFilter.__init__(words: list[str]) and f(pref: str, suff: str) -> int. POST and ordinary page fetch returned 403; public GET succeeded without credentials or bypass. Official example apple / a,e => 0. n and queries <= 10000; all strings lowercase; word and query lengths 1..7; nonempty words; largest zero-based index or -1. Duplicate words allowed, overlap allowed, no mutation requirement. No empty-prefix contract.

Learning loop: hand-check ape/apple/ape -> see independent maxima fail -> enumerate pair keys -> replay overwrite invariant -> predict new overlap/duplicate case -> map to executable Python. Expected output: largest matching original index and explanation of soundness/completeness.

## Steps (five fields each)
| Step | Known | Single question | Input → desired quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|String positions|Which index satisfies both ends?|ape, apple, ape; ap/e → largest index|Choose query; inspect separate prefix/suffix checks and match indices|Nonempty lowercase query; zero-based indices|
|1|Both tests must pass|Why preserve pairs rather than separate maxima?|ab, ac, db; a/b → 0|Read the two failed shortcuts and independent scan|Static dictionary, largest matching index|
|2|A word has finitely many ends|What can each processed word establish?|Bounded preset words → map of pair to latest index|Advance one whole word; inspect all prefix×suffix keys, old/new queried value and cumulative ledger; reverse restores map|Increasing word indices; all nonempty prefix/suffix combinations including overlaps|
|3|Latest pair index invariant|What survives a later partial match?|ababa, aba, ababa, axa; aba/aba → 2|Choose before explicit reveal; change clears feedback; locale preserves it|Separate exercise, fixed option order|
|4|Map invariant|How does the submission implement it and what does it cost?|Canonical Python and parameters n,L,Q → code and honest costs|Open/copy/download exact source|Expected dictionary lookup; count string creation/hash/storage|

## Concept dependency / first-use table
Prefix = beginning substring and suffix = ending substring (step0, redefined step2). Index = original zero-based position (step0,2,3). Pair key = ordered (prefix,suffix) identifying a dictionary entry (step2). Cartesian grid = each prefix combined with each suffix (step2). Invariant = statement true after every processed word (step2). Hash map = Python dictionary storing pair keys to indices (step2/4). Expected complexity = usual hash table assumption (step4). n words, L maximum word length, Q calls are defined beside costs. Related deep links: ../336/#step1 (reversed-trie end matching) and ../472/#step2 (prefix construction through cuts); verify anchors.

## Visual/state contract
Semantic HTML tables/cards, no canvas. Every frame is after one whole word was processed; initial map empty, query result explicitly provisional until done. Full pair grid for the just-completed word; cumulative ledger shows all completed words and each old/new query value. Bounded presets <=3 words of length<=5, full trace retained. Selecting a query changes observation only; preset restarts trace; reset resets trace/query only, independent exercise unchanged. Browser visualization is a JavaScript simulation, not execution of solution.py. No timers/loading/reconnect because all data/source ship locally. Runtime errors surface via console tests. All rendered feedback/labels bilingual; storage denied falls back to memory.

## Exact design tokens / priority
Reuse ../style.css variables verbatim: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Typography/system stack, sizing and spacing follow shared classes; local overrides: 48px targets, disabled opacity 1 with muted ink, wrapped cards/table contained scroll, 3px accent2 focus. No additional palette/shadow/motion.
P0/highest-return slice: causal pair-overwrite state, bilingual controls, fresh exercise, exact source, independent oracle and real browser evidence. P1: cumulative map and query probe, responsive pair grid. P2: none. Deferred: trie comparison/animation/platforms (unnecessary for short-word constraints), actual novice testing and independent review (different run), deployment (outside authority). Revisit only with learner evidence or a changed contract.

## Validation plan
Python independent reverse/forward brute-force oracle, exhaustive binary words, seeded cases, duplicates/overlap/missing/length boundaries and 10000-word stress; intermediate map invariant. Browser simulation checked independently; all presets, endpoints, reversible history, both languages, quiz choices/change, storage denial, copy success and native fallback transfer, download/source bytes, links, local assets, 320/390/736/1440 and desktop 200% equivalent zoom, keyboard, forced colors and reduced motion. Output directories configurable by LESSON_TEST_OUTPUT_DIR. Record actual commands/results in tests/evidence and SELF-CHECK.md. No LeetCode submission/acceptance claim.
