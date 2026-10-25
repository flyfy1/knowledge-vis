# #691 · Stickers to Spell Word — author candidate

## Product and authority
Reuse the existing LeetCode lesson, collection return link, five-step shell,
shared locale and exact tokens. Target: reader who knows Python functions and
lists; job: reconstruct minimum-sticker search, predict a new case and implement
it. Category computing (collection category leetcode), stage university.
Approved pattern: ../../specs/reviews/leetcode-all-hard-design-review.md and its
dispatcher adjudication; no new product/layout review is claimed. This run is
an author self-check only; independent lesson review remains pending.

## Verified contract
Official URL https://leetcode.com/problems/stickers-to-spell-word/ verified
2026-10-25 via page and public GraphQL. Full capture: provenance/official.json.
Python3 selector snippet: Solution.minStickers(self, stickers: list[str], target:
str) -> int. Python chosen; no non-Python exception. Unlimited copies of each
word; cut/reorder letters, discard unused letters; minimize physical stickers,
return -1 if impossible. n=1..50, sticker length=1..10, target length=1..15,
lowercase English. Official examples: with/example/science + thehat -> 3;
notice/possible + basicbasic -> -1. The natural-language random-word note is
retained in copy; synthetic microexamples illustrate the same mechanics, not
claims about official test generation. Empty remainder is an internal state,
not an officially allowed empty target. Input is not mutated.

## Learning loop and five fields per step
|Step|Known|Single question|Input → quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0 Cut letters|word letters|How many stickers for aab?|ab, a → minimum count|Next/Back through aab → a → empty; counts and retained ledger|Infinite copies, unused letters discarded|
|1 Repeated work|subtraction|Why not choose largest coverage?|same tiny case plus abcdef → compare greedy and search|Read concrete two competing plans and baseline code|Unit sticker cost, not weighted words|
|2 Remaining counts|baseline recursion|Which branches can be skipped safely?|remaining tuple → minimum additional stickers|Select preset (explicit restart), next/back/reset/end; memo ledger and current call, child and returns|Order irrelevant; all pivot-covering types retained, not a single greedy choice|
|3 Transfer|pivot proof|Can a non-pivot sticker be postponed?|ab/ac/bc + aabbcc → minimum|Select before reveal, change answer clears; locale preserves|Fresh input; all letters must be supplied with multiplicity|
|4 Code and costs|state/recurrence|Where is each visible operation in Python?|official callable → return int|Open source, copy/manual fallback/download|Simulation separate from actual Python execution|

## First-use dependency table
Sticker: one physical copy of a supplied word (step0).
Remaining letters: copies of letters still missing, e.g. aab (step0).
Baseline search: try every useful next sticker (step1).
State r: alphabetically ordered tuple of missing counts, alphabet shown (step2).
Pivot: first letter with positive remaining count (step2).
F(r): minimum additional stickers for state r, infinity if impossible (step2).
Memoization: store a completed answer for an equal tuple (step2).
Invariant: F depends only on r; each child subtracts componentwise, never below 0;
parent tuples are immutable (step2, restated step4).
S: product of (target count+1), number of possible count tuples (step4).

## Causal design and trace
Show ab removing one a and b from aab, leaving a; a removes it. Order ab/a and
a/ab reaches same remainder, hence memoize counts rather than history. Greedy
counterexample abcd/abe/cdf for abcdef: 3 vs 2. Pivot proof reorders any feasible
multiset to put a sticker covering a missing letter first. Lower bound: any
such solution costs >=1+F(child); upper bound: selected sticker plus optimal
child attains it. Strict decrease terminates. No-cover pivot means -1.
Full bounded preset recursion emits enter, skip, child, return, completed memo,
cache events without omissions; snapshots deep-clone memo and call stack.
Current call/just-completed operation and memo answers have distinct labels.
The trace keeps full operation history; it is a JS simulation, not executing
Python. No timer or animation. Presets only bound teaching computation; maximum
constraints are tested offline. Snapshot storage is extra tutorial memory.

## Tokens and states
Exact shared palette: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547,
text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8,
bad #ff7a93. No new palette. Shared system fonts, line-height 1.75, widths
1000/952px, 8/14px radii, shared spacing 8/12/16/20/24/64px. Local controls 48px,
3px accent2 focus, no disabled opacity. No shadows or motion. Font source is
system only. Dark code background inherited #090e16. Shared+local CSS <25000.
Both locales cover start/middle/end, impossible, memo hit, skipped candidate,
quiz pending/selected/revealed/changed, copy success/fallback and storage failure.
Locale never resets progress, selection, disclosure or focus. No loading,
reconnect, server execution, or fake learner success states apply.

## Scope and validation
P0: causal count experiment, complete recursion, proof, bilingual states, source
fidelity and reproducible Python/oracle/browser checks. Highest-return 20%:
concrete subtraction + pivot proof + fresh transfer. P1: related deep links and
readable memo/stack. P2 decoration omitted. Deferred: custom large inputs
(unbounded trace), universal visualizer, execution service, autoplay (no need),
registration/publication (outside ownership), independent review (separate run).
Tests use an independent position-mask BFS oracle, exhaustive small alphabets,
seeded cases, official and maximum bounds; verify every cached state and child
subtraction. Browser: locales/presets/endpoints/quiz/copy/fallback/blocked storage,
320/390/736/1440 and 200% zoom, keyboard and focus, contrast, local network,
rendered/copied/downloaded source parity. Artifacts honor OUTPUT_DIR.
Limits: no LeetCode submission, novice study, physical device test or public
release is implied by author self-checks.

## R691-01 focused repair candidate (2026-10-25)
Reuse the reviewed layout, tokens, native selector and state lifecycle. The only
product change is the English p6 label: “15-letter target · −1”, preserving input
length scope and advertised result at 320 px. Full target and sticker data remain
in the adjacent input readout. Chinese copy, algorithm, interface and source pairs
are unchanged. P0: selected-label readability and bilingual interaction regression;
P1/P2: no additional work. Deferred: physical devices and other native font
platforms (unavailable); independent finding closure belongs to the next reviewer.
Evidence and frozen file receipt: tests/evidence/review-1-fix/. This is an author
repair awaiting separate re-review, not independent acceptance.
