# #327 Count of Range Sum — author brief

Reuse verdict: one lesson in the existing LeetCode collection, category computing,
stage university. Reader knows array indices and loops; immediate job is to count
contiguous intervals, derive the cross-half counting rule, and reconstruct Python.
Approved product/design contract: specs/reviews/leetcode-all-hard-design-review.md
and its dispatcher adjudication. website-design skill read; no new layout system.
Independent per-lesson review is pending; this is an author candidate only.

## Official contract and provenance
Verified 2026-10-25 via the official description and public GraphQL question query.
Exact URL: https://leetcode.com/problems/count-of-range-sum/ . Raw statement and
all observed codeSnippets are in provenance/official-graphql.json. Python3 is
actually offered with `Solution.countRangeSum(self, nums: list[int], lower: int,
upper: int) -> int`. Use that interface. Nonempty nums, length 1..100000; signed
32-bit elements; -100000 <= lower <= upper <= 100000; answer fits signed 32 bits.
Inclusive nonempty index intervals; no modulus, no requested mutation. Official
examples [-2,5,-1], -2,2 =>3 and [0],0,0=>1. No paywall or credentials involved.

## Learning loop and five fields per section
| step | known | single question | input → desired quantity | action → visible observation | conditions |
|---|---|---|---|---|---|
|0|addition, indices|Which intervals count?|[-2,5,-1], [-2,2] → count|advance/back/reset a six-row interval ledger; see each sum and accumulated count|nonempty contiguous ranges, inclusive bounds|
|1|hand sums|How do two running totals recover a range sum?|same array → P[j]-P[i]|choose i and exclusive j; compare P values and original interval|P[0]=0, i<j; duplicate values retain different positions|
|2|prefix difference|How can we count without testing every pair?|same example or one-condition presets → recursive sorted halves and cross counts|step complete lower/upper boundary scans, inspect excluded/valid values and retained ledger, then merge|split by original prefix index BEFORE sorting within halves; sorted children; bounds inclusive|
|3|cross-half window|Can the boundary rule transfer to new values?|L=[-1,1], R=[0,1,2], [0,1] → cross count|predict 1/3/6 then explicitly reveal and inspect each x; changing choice clears explanation|all left original indices precede right, each occurrence counts|
|4|invariant and recursion|How does Python implement and bound the work?|official callable → count|map names to code; copy/download exact canonical file|numeric arithmetic costs O(1) under official bounds; O(n log n) time, O(n) auxiliary memory|

## Term dependency / first use
- step0: range = contiguous nonempty interval, inclusive = both endpoints count;
  baseline = enumerate each start and incrementally extend the end.
- step1: prefix P[k] = sum of first k elements, sentinel P[0]=0;
  j is exclusive end, different from the statement's inclusive end.
- step2: half-open block [lo,hi), sorted child arrays, cross pair = first prefix
  from left block and second from right, k/l = zero-based right-array boundaries;
  invariant = condition preserved by each return. Define again locally in code step.
- step3: repeat x,y,k,l definitions for direct navigation.
- step4: recurrence and auxiliary storage defined near their cost claims.

## Causal bridges and rejected alternatives
The baseline adds the next value for each start: O(n²), about 5 billion intervals
at n=100000. Prefix subtraction reduces one sum to O(1), not the pair count.
Global sorting loses time order: nums=[1,-1], bounds[-1,-1], P=[0,1,0]
contains valid 1→0; sorted P has no negative forward difference. Split original
indices, recurse, then sort only inside those blocks. For fixed x in sorted L,
valid y in sorted R occupy [x+lower,x+upper]. k skips y-x<lower, l skips y-x<=upper;
there are l-k occurrences, even for duplicates. As x increases both thresholds
increase, so neither pointer retreats. All pairs are left-only, right-only, or
crossing exactly one split. Each return both counts all pairs in the block and
sorts its prefix values. Merge gives the parent's ordered inputs. Linear work
per recursion level, logarithmically many levels. Code uses reusable scratch;
slices take linear temporary space, still O(n) peak, not O(n log n).

## State / visual contract
All experiments independent; step0 and step1 use the fixed official tiny example.
Preset change explicitly restarts only step2. Simulation of completed boundary
scans and completed merges, NOT execution of Python. No low-level pointer
increment or recursive stack entry animation is claimed; all counting rows and
merges for these bounded presets are retained, no trace truncation. Current row
and accumulated contribution ledger are distinct. Back restores deep snapshots.
Original prefix block labels are index partitions, sorted slots are value order.
Prediction selected/revealed state survives locale switches and resize; answer
change clears old feedback. Copy success/failure and all disabled/end states
localized. No async network/loading/reconnect states in the static lesson.

## Exact token / scope contract
Use ../style.css tokens unchanged: --bg #0d1117, --panel #161b22,
--panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8,
--accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93.
Shared system font stack, line-height 1.75, 14px stages, 8px controls. Local CSS
only wrapping, responsive value cells, 48px targets, opaque disabled controls,
3px focus and scrollable source. No animation or new palette.
P0 / highest-return 20%: explicit cross-boundary values, excluded cases, count
ledger, coherent bilingual states and actual oracle/browser verification.
P1: reversible controls, exact source parity, keyboard and clipboard recovery.
P2: no decoration needed. Deferred: custom large inputs and full pointer-increment
animation (bounded complete presets suffice); real-device/learner studies need
participants/devices. Shared registration/concept map belongs to dispatcher;
lesson-entry contains proposed local anchors without editing those shared files.
