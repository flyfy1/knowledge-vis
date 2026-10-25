# #715 Range Module — author brief

Category: computing / algorithms. Stage: university. Reader: knows Python lists and comparisons, new to interval data structures. Product-fit verdict: reuse the approved bilingual lesson page and controls; no new shared framework. The design review and dispatcher contract are in `specs/reviews/leetcode-all-hard-design-review.md`; the rendered-state supplement also applies. This author candidate needs a separate independent review.

One learning loop: calculate a removal by hand → retain only coverage boundaries → derive boundary parity → step through replacement and queries → predict a fresh bridge → map to executable Python.

## Official contract

Verified 2026-10-25 with public official GraphQL; complete response and language snippets: `provenance/official.json`. URL: https://leetcode.com/problems/range-module/. Free Hard problem. Python3 is supported with `RangeModule.__init__`, `addRange(left:int,right:int)->None`, `queryRange(left:int,right:int)->bool`, `removeRange(left:int,right:int)->None`. Ranges contain real numbers and are half-open. `1 <= left < right <= 10^9`; at most `10^4` method calls. Constructor starts empty; add unions coverage, remove subtracts coverage, query requires every real number. No empty range is a valid input. Official example: add [10,20), remove [14,16), queries [10,14), [13,15), [16,17) yield true,false,true. No modulus, identity, asynchronous, or special judge requirements. Python is the preferred faithful canonical interface.

## Exact design tokens / state ownership

Reuse `../style.css` and `../common.js`: bg #0d1117; alternate #0a0e14; panel #161b22; panel2 #1c2330; line #2b3547; text #e8edf4; muted #9aa7b8; accent #6ee7ff; accent2 #ffb454; good #7ee2a8; bad #ff7a93. Keep shared system font stack, body 1rem/1.75, shared clamp headings, 8/12/16/20/24 spacing, 8px control /14px stage radius, no added shadow, no animation. Local accessibility override: 48px controls, opaque readable disabled text, 3px accent2 focus, wrap long numbers. Main visualization is a local DOM interval renderer, not a universal framework. Side-by-side before/after strips use identical scales; filled intervals have closed left and open right endpoints. Axis values are real coordinates, no vertical quantity. Cards repeat exact numeric ranges on narrow screens.

Locale owns text only; preserves trace frame, preset, hand probe, prediction choice/reveal, fallback focus. Trace owns atomic completed-operation snapshots and cumulative history. Reset returns empty frame; preset explicitly restarts only trace. Quiz independent; changing choice invalidates feedback. Copy pending/success/failure text truthful; manual fallback holds and selects full source. No loading/network states in this offline simulation; no timers/reconnect/auth flows apply.

## Step contract (five required fields each)

### step0 — What survives a cut?
- Known: ordinary number comparisons.
- Question: after add [2,8), remove [4,6), which real numbers remain?
- Input/output: these operations; inspect membership of 4, 5.5, 6.
- Action/observation: choose each probe; visible two retained bands and membership reasoning, especially 6 retained while 4 removed.
- Conditions: real half-open ranges, integer operation endpoints; diagram is simulation, not Python execution.

### step1 — Why keep only boundaries?
- Known: coverage is continuous between changes.
- Question: how can we avoid scanning a billion unit cells?
- Input/output: [2,4) union [6,8); derive endpoints [2,4,6,8] and odd-count membership.
- Action/observation: read hand values and query counterexample; formulas name exact bisect counts and strictness.
- Conditions: sorted unique endpoints, alternating starts/ends; adjacent coverage merged. Baseline unit-cell set exact only because operation endpoints are integers. Provide executable small-domain baseline; O(U) space, O(right-left) work.

### step2 — Which boundaries change?
- Known: endpoint alternation; i counts endpoints < left; j counts endpoints <= right.
- Question: which old transitions disappear and which new transitions are necessary?
- Input/output: five operation presets (official, touching bridge, repeated/nested, empty/erase, upper limit); full before/after endpoints, i/j, replacement and query result.
- Action/observation: apply next, rewind, reset, finish, select restart; see disappearing gap boundaries and split boundaries plus full history.
- Conditions: frames are after one whole public method, all state restored by snapshots, no omitted operations. Browser simulation separate from canonical Python tests.

### step3 — Fresh transfer
- Known: touching ranges merge and removal creates cuts.
- Question: add [3,11), remove [5,9), then add [6,9): what remains and is [6,11) covered?
- Input/output: three paired interval/query answers; answer hidden before explicit reveal.
- Action/observation: choose/reveal/change/reset; correct [3,5), [6,11), true. Explanation uses invariant and excludes gap [5,6).
- Conditions: independent of trace; language retains selection/reveal; changed choice clears feedback.

### step4 — Implement and bound the costs
- Known: complete replacement and query rules.
- Question: where does each rule live in official Python and what does it cost?
- Input/output: exact solution.py rendered/copied/downloaded; mapping for every branch.
- Action/observation: open code, copy, fallback selection, download; independently run oracle tests.
- Conditions: bisect O(log k), list updates O(k), query O(log k), O(k) stored/temporary space; k<=2q endpoints after q updates. O(q^2) worst total, no claim of balanced-tree update bounds or actual LeetCode acceptance. Tutorial snapshots excluded from submission space.

## First-use terms and causal proof

Half-open: step0, left included/right excluded. Coverage: step0, numbers currently tracked. Unit cell: step1, [x,x+1). Boundary/endpoint: step1, coordinate where coverage switches. Invariant: step1, rule maintained after every call. Parity: step1, odd/even number of crossed boundaries. Bisect: step1, sorted-list binary search for a count with strict comparison. Slice: step2, endpoints at zero-based positions i through j-1. Redefine these beside each jumping entry point. Query uses a=number <=left, b=number <right: a=b odd means start covered and no switch strictly inside. Updates delete transitions in [left,right]; coverage inside becomes uniformly on/off and outside stays fixed; i and j parity say whether a new boundary is required on each edge. This preserves unique sorted alternating endpoints. Wrong endpoint-only query: [2,4) union [6,8), querying [3,7) has both endpoints covered but misses 5.

## Priorities and evidence

P0 / highest-return slice: hand removal, exact invariant and strict boundaries, reversible trace, fresh prediction, faithful Python, bilingual readable state, independent oracle and real browser evidence. P1: source transfer fallback, upper-limit preset, concrete cost and related deep links. P2: none. Deferred: dynamic trees (different algorithm, not required to explain selected solution), custom user-operation editor (presets suffice for bounded lesson), animation (no learning gain), public deployment/real devices (outside author scope). Shared concept-map/registry changes are prohibited; local metadata supplies concept anchors for later registration.

Simulation limits: five small preset sequences, no execution service; DOM retains snapshots while canonical class retains only endpoint list. Self-check evidence must be labeled author self-check; no actual novice outcomes or independent acceptance claimed.
