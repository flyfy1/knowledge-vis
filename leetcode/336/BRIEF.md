# #336 Palindrome Pairs — author candidate

Product verdict: reuse the approved bilingual LeetCode lesson pattern. Audience: readers comfortable with loops and dictionaries who need to reconstruct a linear palindrome-pair search. Category computing / algorithms; stage university. Scope is one static lesson, no service or shared framework. Design authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; this author run does not reopen that gate or claim independent acceptance.

Official verification: provenance/official.json captures public LeetCode GraphQL on the timestamp stored there, exact URL https://leetcode.com/problems/palindrome-pairs/. Unique zero-indexed lowercase strings, 1..5000 entries, length 0..300; empty word permitted, same index forbidden, ordered pairs required. All three official examples retained on page. Python3 selector supplies Solution.palindromePairs(self, words: list[str]) -> list[list[int]]. Prefer this faithful Python interface. Official explicitly requests O(total word length); do not ship the usual quadratic-in-word-length split slicing solution.

Learning loop: calculate ["lls","s"] → cancel matching outer letters → identify the leftover palindrome → inspect trie candidates and suffix flags → predict a fresh ordered pair → map operations to Python. Expected output: explain both shorter and longer partners, reconstruct palindrome boundary preprocessing, justify honest output-sensitive costs.

## Steps (five fields each)

| Step | Already known | Single question | Input / wanted | Action / visible observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | String concatenation | Which ordered pairs count? | [lls,s] / valid index pairs | Hand mirror s+lls=slls; compare opposite order; inspect baseline | Unique strings, i != j |
| 1 | Outside letters must match | What can remain in the middle? | Matched prefix, reversed partner / leftover | Follow s + ll + s; derive both unequal-length cases and trie metadata | Exact character equality; empty middle is palindrome |
| 2 | A palindrome reads both ways | How can every boundary be checked in linear time? | One word / prefix and suffix flags | Calculate odd/even centers and mirror reuse example, see radius-to-boundary formulas | Maximal radius, separate odd/even centers; no slicing in preprocessing |
| 3 | Trie invariant and flags | Why does each emitted pair qualify? | Preset words / search events | Forward/back/reset/end and slider; current path, terminal, suffix test, remaining candidate list; cumulative pair ledger and history | Simulation prebuilds trie; all query events retained; presets restart only this experiment |
| 4 | Two remaining-middle cases | Can the rule transfer to a new word? | [ab,aba,ba] / partners for index 0 | Choose before reveal; changing choice clears feedback; locale preserves it | Ordered pairs, exclude self |
| 5 | Search derivation | How does the official Python implement it? | Canonical source / callable output | Map flags, reversed insertion, shorter terminal and longer list; copy/download exact source | Expected constant dictionary operations; account for output and empty word |

## First-use concept dependencies

Palindrome: step0, same letters read forward/backward. Ordered pair: step0, i before j; index is position in input. Baseline: step0, try every distinct index pair. Prefix/suffix: step1, beginning/ending of a word; empty string allowed. Trie: step1, shared character-path tree; terminal stores completed reversed word index. Candidate list: step1, partners whose unconsumed original prefix is palindrome. Invariant: step1, statement true after every matched character. Radius/center/mirror/frontier: step2, explicitly defined in local copy with odd/even conventions. All terms are re-explained locally in the interactive and code steps.

## Exact token contract

Reuse ../style.css without modification: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --line #2b3547 (confirm from shared source before implementation). Reuse its system font, 1000px header / 952px content, 8/14px radii, 16/24/64px spacing. Local layout uses only these palette roles, 48px controls, 3px accent2 focus with 4px offset, no animation/shadows/images. Shared background #0a0e14 is inherited. Any exact token discrepancy must follow the actual shared source. Combined CSS must stay below 25000 bytes.

## State and verification contract

Trace is a browser simulation, not execution of solution.py. It begins after trie construction; no insertion-animation claim. State includes complete event snapshots, path/candidate explanations and cumulative emitted pairs. Tutorial stores history unlike submission. No truncation. No input editing or autoplay, no asynchronous pending state except clipboard. Invalid/missing input UI is inapplicable: presets are closed valid cases. Pending prediction, selected, revealed correct/incorrect and changed-choice states translated in both languages. Clipboard success/manual fallback translated; failed localStorage degrades through common.js. Locale preserves trace, quiz, manual source and focus.

P0 / highest-return 20%: concrete causal middle cancellation, truthful trie search state, linear flags bridge, bilingual controls and tests. P1: complete history and source affordances. P2: none. Deferred: custom word editor (validation adds scope), insertion animation (static invariant and exact source suffice), decorative art and general visualization framework (no learning need). Reviewer will independently assess teaching; no learner study, public release, or LeetCode acceptance is claimed.

Tests: independent all-pairs oracle; exhaustive small unique word sets, seeded cases, maximum boundaries, flags against brute palindrome checks, trie-node candidate invariant and per-frame emitted pairs. Browser both locales, every preset/endpoints/rewind/reset/quiz options, locale cross paths, copy/fallback/source/download, 320/390/736/1440 widths and 200% zoom, keyboard/focus, local assets, contrast, screenshots visually inspected. Tests accept LESSON_OUTPUT_DIR. Metadata non-mutating preflight required. Author evidence stays in tests/evidence, separate review pending.
