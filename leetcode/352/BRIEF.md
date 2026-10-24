# #352 Data Stream as Disjoint Intervals — author brief

## Contract and scope
Reuse the adjudicated lesson pattern in specs/reviews/leetcode-all-hard-design-review.md;
read WORKFLOW, UI-I18N-SPEC, explainers, hard traces, review gates and website-design
skill before implementation. Product-fit verdict: reuse one collection lesson,
category leetcode (computing content), stage university; no new shared framework.
Reader: knows lists and sorting, wants to implement a persistent range summary.
Smallest useful outcome: explain a bridge insertion and reconstruct SummaryRanges.
Author self-check only; independent review, learner results and publication pending.

Official verification: provenance/official.json captures public LeetCode GraphQL on
2026-10-25 with content, example and all codeSnippets. Python3 supports
SummaryRanges.__init__, addNum(value: int) -> None, getIntervals() -> list[list[int]].
Values 0..10000; at most 30000 total calls; at most 100 getIntervals calls.
Empty constructor returns []; duplicates do not change represented integers.
Official example inserts 1,3,7,2,6. Follow-up asks about many merges and few ranges.
Select Python as preferred faithful interface; no special language fallback.

Learning loop: hand-compute 4,6,5 → notice that the missing integer is filled →
state separated-range invariant → inspect both neighbors → predict a fresh bridge
→ map the same operations to canonical Python. Output is sorted inclusive ranges.

## Five fields per section
| Section | Already known | Single question | Input → desired quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
| step0 | Integers and ordering | Why can 4 and 6 only join after 5? | Stream 4,6,5 → ranges | Reveal hand result → two singleton ranges become [4,6] | Inclusive integer ranges, no missing integer allowed |
| step1 | A range contains every integer between endpoints | How can we avoid sorting all seen values again? | Sorted unique values and existing ranges → local update rule | Read baseline and paired counterexamples → adjacency matters and both sides matter | Existing ranges are sorted, maximal, exact |
| step2 | Neighbor rule and invariant | Which ranges does this insertion change? | Selected stream → before/after every addNum | Next/back/reset/end/presets → retained ledger, candidate neighbors, replacement, duplicate stop | Whole insertion per snapshot; preset visibly resets only this trace |
| step3 | Two neighbors can join through a singleton | Will adding 13 join both ranges? | [10,12],[14,16],[20,20] + 13 → exact ranges | Choose then reveal; change clears feedback → exclusion of distant 20 | Fresh independent exercise; no derived answer before explicit reveal |
| step4 | Local update derivation | Where does each rule live in Python and what does it cost? | Interface and invariants → executable class | Expand/copy/download source → exact source parity | Browser is simulation; Python executed only by offline tests |

## Terms first used (also redefined locally when jumping sections)
- step0: inclusive interval [a,b] includes endpoints and every integer between;
  disjoint means no overlap; summary merges adjacent integers as far as possible.
- step1: maximal means cannot extend without adding an unseen integer; invariant
  means a property kept true after every insertion; k is current range count;
  baseline is a simpler correct method; binary search halves a sorted search area.
- step2: p first start >= value; predecessor p-1 and successor p; before/after are
  whole addNum states, probe list records indices inspected, not range mutations.
- step3: local definitions of inclusive/maximal repeated in question.
- step4: k current intervals, u unique seen values, output copy and list shifts.

## Causal proof and honest costs
Start with exact sorted separated intervals: next.start > previous.end+1.
Find p by binary search on starts. If predecessor already contains value, return.
Otherwise create singleton; absorb left if its end+1 == value. Absorb right if
its start <= value+1 (equality start=value is a duplicate). Earlier/later ranges
are too far by invariant, even after merging. Replacing at most two neighboring
ranges preserves exact coverage, order and maximal separation. Empty state gives
base case. List slice replacement still shifts O(k) cells; search O(log(k+1));
addNum O(k+1) worst, covered duplicates O(log(k+1)), getIntervals O(k+1) including
fresh returned pairs; retained state O(k), worst transient list space O(k+1).
Baseline set insert expected O(1), query sort/compress O(u log(u+1)), O(u) space;
valid alternative with only 100 queries, not falsely branded infeasible. Follow-up
benefits from retaining k intervals when k << u; no claim of logarithmic list updates.

## Visual and lifecycle contract
DOM interval pills are endpoint data, not lengths drawn to scale. Small integer
cells show membership, explicitly separate from boundary presets with omitted axis.
Before/after and full prefix ledger persist. No animation, autoplay or omitted adds.
Deep snapshots; reset = initial empty trace, no timers; preset resets trace only;
quiz independent. Locale retains trace, answer, reveal, manual source fallback.
Empty, pending, completed, duplicate, bridge, left/right-only, isolated, boundary,
copy success/fallback and disabled branches tested in both locales. Loading,
sending/reconnect/auth do not apply to this static offline lesson.

## Exact tokens and accessibility
Use ../style.css variables unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93. Shared system font and line-height 1.75;
shared spacing 8/12/16/20/24/32/64px, radii 8/14px. Controls >=48px;
3px accent2 focus with 4px offset. Disabled controls opaque muted on panel2.
Shared code backgrounds and explain color inherited; local additions use variables.
No shadows, motion, images or external runtime assets. Shipped CSS <25000 bytes.

P0/highest return: causal bridge, exact snapshots, bilingual readable interface,
canonical Python and independent oracle/browser checks. P1: source fallback and
boundary presets included. P2/deferred: decoration, custom streams and balanced
tree implementation; no demonstrated need in this focused lesson. Shared registry
and concept map left for authorized dispatcher; lesson-entry contains concept anchors.
Verification: exhaustive small streams, seeded random, all official example outputs,
maximum call/value boundaries, every intermediate invariant, copy mutation isolation;
real browser EN/ZH 320/390/736/1440, 200% zoom, keyboard, source/copy/download,
storage failure, contrast and local errors. Output-dir configurable tests/evidence.
