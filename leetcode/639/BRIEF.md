# #639 Decode Ways II — author candidate

## Scope and verified contract
Reuse the approved lesson pattern and dispatcher adjudication in `specs/reviews/leetcode-all-hard-design-review.md`. Product-fit verdict: reuse, one local lesson in the existing collection. User: a reader who can read Python loops and count alternatives. Immediate job: derive wildcard decoding counts and reconstruct the rolling recurrence. Category: computing / LeetCode; stage: university. No registry or shared-file edits in this author scope.

Official source: https://leetcode.com/problems/decode-ways-ii/ . Public GraphQL captured 2026-10-25 in `provenance/official.json`, including full statement and actual selector snippets. Python3 supports `class Solution: def numDecodings(self, s: str) -> int`. Prefer Python. Input length 1..100000, digits or `*`; star means 1..9, never 0. Codes 1..26, no leading zero; return count modulo 1000000007. Official examples: `*`→9, `1*`→18, `2*`→15. Empty prefix is an internal count identity, not an official empty-input test.

Learning loop: calculate `1*` → inspect concrete valid final tokens → partition all decodings by final token width → replay a cumulative prefix ledger → predict `*10` → map to submission. Outputs: one scalar count, justification of disjoint exhaustive cases, and implementable Python.

## Five fields per section
| Section | Already known | Single question | Input → quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0 Hand count|A=1 through Z=26|What counts as a different decoding?|`1*` → decoded letter strings|Change star digit; two concrete groupings and letters change|1..9 substitutions; no zero star|
|1 Last token|Single and paired grouping|Which final tokens are legal?|pair selector → single and pair multiplicities|Choose `1*`, `2*`, `**`, `*0`, `*7`, `06`; list actual codes and coefficients|A pair is 10..26; no leading zero|
|2 Prefix state|Final token has width 1 or 2|How do earlier counts extend?|preset → prefix count ledger|Advance/back/reset/end/range; retain all completed prefix counts and both contributions|Snapshot after a whole character; modulo M; future is unknown|
|3 Transfer|Recurrence and empty-prefix identity|How many decodings of fresh `*10`?|three predictions → count and reason|Select then reveal; changing choice clears feedback; locale preserves selection|Unrelated trace changes do not alter quiz|
|4 Code/cost|Two predecessor counts suffice|How does the proof become a linear loop?|official string → integer|Inspect/copy/download exact Python; fallback selects full source|O(n) time, O(1) auxiliary integers, bounded modulo arithmetic|

## Term dependency / first-use table
- Section 0: decoding = a complete grouping mapped to letters; wildcard = one digit 1..9; modulo = remainder after division, to bound the returned count.
- Section 1: single coefficient a = valid one-digit final tokens; pair coefficient b = valid two-digit final tokens. Explicit local lists precede formulas.
- Section 2: prefix = first i characters; D[i] = its decoding count modulo M; dynamic programming = reuse counts of shorter prefixes. Reintroduce single/pair locally. Empty prefix D[0]=1 is one way to append to no earlier letters. Invariant = statement true before/after each loop iteration.
- Section 3: D[i] and coefficients are defined again in the question/feedback.
- Section 4: prev2 / prev1 = two previous prefix counts, auxiliary space = extra memory beyond input.

## Derivation, misconception and baseline
`1*`: nine width-one endings after `1`, nine width-two endings after empty prefix. `2*` changes only paired endings: 21..26. Wrong rule “9 per star times decoding count” ignores valid pair choices: `*0` has only J/T, not nine decodings, and `**` has 81+15=96, not 81. Baseline expands stars and recursively tries one/two digit tokens; independent tests retain it. Its O(n·18^n) conservative time bound and O(n) recursion/working space make it unsuitable at 100000. Repeated suffixes motivate prefix counts, not faster enumeration.

Proof: every legal complete grouping ends in exactly one digit or exactly two. Remove that token, obtaining exactly a valid shorter-prefix grouping and a valid token choice. Concatenating these reconstructs one unique grouping; groups of different final widths are disjoint. Thus multiply predecessor counts by choices and add. Congruence respects multiplication/addition. Initialize D[0]=1 and D[1]=a(s[0]); before iteration i, prev2=D[i-2], prev1=D[i-1]; compute then shift simultaneously.

## Tokens / interaction lifecycle
Exact shared palette from ../style.css: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing system font stack, 1.75 body line-height, 952px content, shared 14px stage / 8px control radius. Local CSS only reflows ledgers, restores disabled opacity to 1, 48px controls and 3px visible focus. Shared default sizes retained. No animation or external assets. Primary action: append one character; retained ledger makes accumulation visible. Separate experiment controls own separate states. Language switches text only and preserves focus, frame, selections, reveal and copy fallback. Native select labels are short literal input strings.

Branch matrix: both zh/en cover initial/middle/final trace, legal/zero coefficient cases, all presets, selected/unselected/revealed/changed quiz, copy success/failure, unavailable storage. Loading/network/account/reconnect are inapplicable to this static local page. Simulation explicitly differs from Python execution. Trace stores O(n) pedagogical ledger, submission retains O(1) integers. No omitted frames within the short presets. Error checks live in tests, not an invented runtime judge.

## Priorities and evidence boundary
Highest-return slice: show actual final tokens beside their predecessor contributions. P0: verified contract, causal bilingual copy, proof, reversible ledger, fresh quiz, canonical solution, accessibility and reproducible oracle/browser checks. P1: exact source transfer, local links, persisted locale fallback (included). P2: decoration (deferred; no learning need). Deferred: live code runner, generic framework and user progress (outside approved scope). Related anchors reuse #552 and #629, validated locally. Self-check evidence will be under tests/evidence, with OUTPUT_DIR override for generated results. Independent review is pending; no learner results, LeetCode acceptance or deployment claimed.
