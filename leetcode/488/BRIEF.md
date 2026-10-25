# #488 Zuma Game — author candidate

## Product and approved contract
Reuse the existing LeetCode page at `/leetcode/488/`, category `leetcode`, stage
`university`. Reader: comfortable with Python strings and recursion, new to state
search. Immediate job: derive an exact minimum-insertion search, including setup
moves and chain reactions. Smallest outcome: calculate a chain by hand, predict a
new state, and map the reasoning to `Solution.findMinStep`.

Design authority: `specs/reviews/leetcode-all-hard-design-review.md`, dispatcher
adjudication D1–D8; use the approved five-section shell and shared locale. This
is author work, not independent review. No registry, concept-map, or release edits.

## Official contract, checked 2026-10-25
Official URL: https://leetcode.com/problems/zuma-game/ . Public GraphQL capture:
`provenance/official.json` contains statement, all observed code selectors and
interfaces, metadata and access timestamp. Python3 explicitly supports
`class Solution: def findMinStep(self, board: str, hand: str) -> int`.
Board length 1..16, hand 1..5, alphabet RYBGW, initial board has no run of 3+.
Insert at any gap, including ends; remove a whole consecutive same-color run of
3+, repeat to stability. Return minimum insertions, or -1. Official examples:
WRRBBW/RB => -1; WWRRBBWW/WRBRW => 2; G/GGGGG => 2.
Empty board is an internal terminal, not an official starting input. No modulus,
mutation requirement or special external types. Strings are immutable.

## Learning loop and sections (five required fields each)
0. Known: strings name colored balls. Question: how can one ball remove seven?
   Input RRBBRR/B; output minimum inserts. Action: reveal/hide hand-worked chain;
   observe BBB deletion exposes RRRR, then empty. Conditions: all deletions finish
   before next insertion; whole runs disappear, not just triples.
1. Known: one move and chain removal. Question: what must an exact search keep?
   Input board+hand; output remaining minimum. Action: change remaining-hand
   example while board RR stays fixed; see answer change (R => 1, B => -1).
   Observe G/GG needs a first move without removal. Conditions: only identical
   board AND hand multiset have identical future choices. Repeated colors are
   indistinguishable; gaps are zero-based positions before a character, n at end.
2. Known: complete state and exhaustive baseline. Question: what does one legal
   transition do? Input four bounded chosen paths; output stable successor.
   Action: preset/forward/back/reset/end; compare before/after and retained history.
   Conditions: simulation of chosen paths only, not execution/search trace.
   Intermediate insertion/removal frames may be unstable; cache only stable states.
3. Known: state invariant. Question: which fresh states have the same future?
   Input RBBR with hands BR and RB; output equivalence and remaining cost.
   Action: select then reveal; change choice clears feedback; locale preserves it.
   Conditions: order of hand does not matter, board order does. Explanation gives
   exact two-insertion route, and why one R cannot remove BB.
4. Known: transition and equivalence. Question: how does Python avoid repeated work?
   Input canonical source; output exact answer. Action: copy/fallback/download;
   map collapse, sorted hand and cached solve to trace. Conditions: exponential
   search remains; no claim of polynomial complexity or LeetCode acceptance.

## Derivation, baseline, proof and costs
Baseline breadth-first enumeration: each layer spends one ball, all available
colors at all n+1 gaps, collapse fully; first empty board is optimal. Independent
oracle retains hand identity indices and has no production pruning. Production
uses recursive minimum with a cache keyed by stable board and sorted remaining
hand; hand length decreases, so induction proves termination and optimality.
Keep every insertion, even without removal. Skip only duplicate hand colors and
gaps whose left neighbor has the inserted color (same resulting string). Prune
only if a color still on board has fewer than 3 total balls in board+hand: it can
never disappear. F=0 for empty board; F=1+minimum successor, failure sentinel 6.

Let n=initial length, h=hand length, L=n+h<=21, S=distinct visited stable states.
Each state tries at most 5(L+1) insertions; repeated scan/slice collapse costs
O(L²), hence conservative O(S*5*L³) time; cache stores O(S*(L+h)) characters,
recursive live strings O(hL). S is exponential; raw tree upper bound
sum(k=0..h) 5^k (n+k)!/n!, and search depth <=h. This intentionally conservative
bound avoids claiming every cascade is linear. Tutorial frame storage is separate.

## First-use dependency table
| Term | First use | Meaning / dependency |
|---|---|---|
| run | 0 | adjacent balls of one letter/color |
| chain reaction | 0 | deletion brings equal colors together, triggering deletion again |
| gap | 1 | insertion slot 0..current board length |
| state | 1 | stable board and multiset of balls still available |
| multiset | 1 | counts matter, hand order does not |
| invariant | 2 | each stable frame has no run >=3 and hand reflects balls spent |
| memoization/cache | 4 | reuse the remaining minimum for an identical complete state |
| S,L,h | 4 | distinct cache states, max row length, initial hand length |

## Exact tokens and lifecycle
Import `../style.css` and `../common.js`. Reuse exact root tokens: bg #0d1117,
panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. No added palette.
System font stack inherited; spacing 8/12/16/20/24/32/64px, radii 8/14px,
max content 952px; body 1rem/1.75, inherited responsive headings. No shadows,
ambient motion, timers or image assets. Local CSS raises all actions/labels to
48px, restores disabled legibility, and uses text letters as ball identities.
Colors are decorative; letter legend is bilingual. Focus 3px accent2 / 4px offset.
Full static rendering; locale rerenders text and snapshots, retains controls,
selection, feedback, trace index, open source and manual-copy state.

P0: truthful bilingual reasoning, trace and source parity, 48px controls, tests.
Highest-return 20%: chain visibility + full board/hand state + exact executable.
P1: retained before/after history and local concept links (included).
P2/deferred: decoration (no teaching benefit), custom unrestricted solver UI
(exponential browser work), auto-play (no need), server execution (scope).
States: initial/middle/end, preset restart, pending/chosen/revealed/changed answer,
copy success/denial fallback, blocked locale storage. Loading/reconnect/expiry
are inapplicable: all runtime assets are local and synchronous, no network API.

## Validation boundary
Tests and screenshots use OUTPUT_DIR (default tests/evidence), real preview
http://127.0.0.1:18770, browser executable env if supplied. Check official fixtures,
independent BFS oracle, exhaustive small/seeded tests, intermediate collapse and
hand conservation; both locales and presets, all controls, keyboard/focus,
320/390/736/1440 and desktop 200% zoom, contrast, source parity, clipboard branches,
asset errors and links. Inspect produced screenshots. Freeze hashes and preflight
result in self-check evidence. Independent review, real learner outcomes,
LeetCode submission acceptance and production delivery remain unclaimed.

## Final author refinements
The visible baseline is executable Python and is tested against its exact HTML
source. Board diagrams remain one horizontal row; focus plus arrow keys or touch
scrolling reveals long rows, while the complete string below each diagram stays
visible. At the longest teaching insertion there are 9 balls. Both locales have
actual Chromium tab-zoom checks at 200%, supplementing CSS zoom tests. The test
extension lives only in `tests/zoom-extension/` and is not a page asset.

## Review repair candidate v2 — 488-R1
The existing independent review requires a concrete recursive return bridge.
Reuse section 5 and its paragraph styling; no new layout or widget. P0 and the
highest-return slice: work parent RBBR/BR, failed child BRBBR/R returning 6,
then sibling RR/R returning 1 via the empty state, updating parent best to 2.
Explain immutable caller arguments and why no undo occurs. The other branches
remain explicitly omitted from the hand calculation, but are checked by Python.
P1: focused runtime-return and bilingual rendered-text regressions. P2/deferred:
additional search-tree visualization, since the review requests only a short
worked explanation and the existing five-section design already owns this task.
Use existing tokens and locale lifecycle. Independent closure remains pending.
