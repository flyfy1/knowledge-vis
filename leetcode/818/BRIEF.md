# #818 Race Car — author brief

Author implementation and self-check only; independent lesson review pending. No submission, acceptance, registration or deployment claimed. Reuse approved product/design contract in specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. This is a local lesson in the existing collection, category leetcode, stage university. Reader knows loops, tuples, sets and basic Python. Smallest outcome: reconstruct state-space BFS and predict why speed cannot be discarded.

## Official contract
Verified 2026-10-26 via https://leetcode.com/problems/race-car/ and public GraphQL. Raw captures tests/evidence/official-page.html and official-graphql.json. GraphQL internal questionId836 is distinct from frontend ID818. Python3 starter is class Solution / def racecar(self, target: int) -> int. Start (0,+1); A=(p+s,2s); R=(p,-1 if s>0 else +1); negative positions legal; integer target1..10000; minimize command count, not distance or final speed. Examples 3→2,6→5. No obstacles or target-speed condition. Python faithfully supported; no nondefault language contract required.

## Sequence and five fields
|Step|Known|Single question|Input / quantity|Action / observation|Conditions|
|---|---|---|---|---|---|
|0 Hand drive|Number line|Why does AA reach3?|start(0,1), commands / p,s|A/R, undo/reset retain full history; R changes speed only|Manual sandbox≤12 instructions; not an optimality claim|
|1 Baseline and state|A/R semantics|Can we forget speed?|two states at p0 / future motion|Read raw command-tree baseline and R counterexample|Every instruction costs1; full pair determines future|
|2 BFS experiment|State pair and command count|Why is first arrival shortest?|targets1,3,6,4,2 / minimum length|Advance complete layers; accumulated pair ledger; previous/reset/end/preset; see target first appear|No pruning or omitted states, deduplicate full pairs; small presets only|
|3 Transfer|BFS invariant|Which first arrival reaches2?|fresh target2 / shortest witness|Predict before reveal, change clears feedback, locale preserves|Trace default6 does not answer new question|
|4 Code and boundaries|Layer proof|How does Python retain the invariant?|source / exact callable and costs|Source/copy/fallback/download and related anchors|Canonical unbounded BFS, D=answer, conservative O(2^D) time/space unit-cost bound|

## Terms and derivation
Step0 position p is coordinate; signed speed s is next A displacement; R resets magnitude to1. Step1 state is the complete pair(p,s); command tree enumerates both possible commands per prefix. Step2 BFS=all depth-d states before depth-d+1; depth=instruction count; queue FIFO=oldest entry first; seen=set of already discovered pairs. Define each locally again where needed. At layer d all newly discovered pairs have minimum cost d: transitions cost1; any shorter prefix would already have discovered the pair. Two prefixes at the same pair have identical future options so retaining the first cannot lose an optimum. First target position therefore has minimum count regardless of speed. The graph is infinite but every depth is finite. A witness (ARR) repeated target times ends at p=target,s=+1, length3target, so BFS terminates.

Counterexample: initial(0,+1), after R(0,-1); suppress R by position would prevent leftward A. Worked counterexample target6 has AAARA: positions0,1,3,7,7,6. Position-only visited prevents R at7; all reverse edges are discarded. Nearest-move greedy is not justified: overshooting can be needed.

## Exact token contract
Use ../style.css and ../common.js. Palette --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Inherited #0a0e14 sections, #c9d4e2 prose, #090e16 source. System font stack, line-height1.75, heading clamps, spacing8/12/16/20/24/32/64px, radius8/14px. Override disabled opacity1; controls48px, focus3px accent2 offset4px; solid nav, no motion. No new palette/shadows/framework. Under25KB total CSS.

## States and limits
Both locales: hand initial/mid/12-command endpoint, trace initial/middle/final and all presets, prediction none/selected/correct/incorrect/changed, code copy/fallback; locale preserves all state and focus. Static no loading/auth/reconnect. Full small-layer simulation is JS, does not execute Python; canonical may stop within final layer. All negative states retained; tutorial history/snapshots extra storage. No automatic timers. Shared storage guarded by common.js. Predict target2 isolated from trace/manual controls.

P0/highest return20%: hand state ledger, full BFS layer ledger, causal invariant, transfer question, bilingual source and computational/browser evidence. P1 related shortest-path lessons. P2 none. Deferred: DP optimization (additional proof unrelated to learning goal), arbitrary huge browser targets (unbounded search), automatic animation, execution backend and universal graph renderer (no need). Related anchors verified locally; new concept metadata records inbound links without editing shared CONCEPT-MAP.

Validation: independent raw command enumeration for small cases; independent distance-DP oracle for seeded and boundary Python cases; transition and shortest-layer invariants in JS; actual Chromium both locales/presets/endpoints/keyboard/copy native and fallback/source-download/offline/storage failure;320/390/736/1440 and zoom200; contrast and screenshots visually inspected. Output env EVIDENCE_DIR. Author tests do not establish independent review or learner outcomes. Freeze candidate hashes after validation.

## Author completion
Author self-check complete; metadata validate-only exited0. Evidence and limitations: SELF-CHECK.md and tests/evidence/. Frozen candidate identity: candidate.json. Independent review pending; next action is a fresh cold walkthrough under the six-dimension rubric. No acceptance or publication claimed.


## 2026-10-26 — 818-SEARCH-R1 revision (supersedes current algorithm above)

Adopted design and request: specs/reviews/818-review-search-alternative-design-20261026.md
and specs/reviews/818-review-search-alternative-request-20261026.md. This revision
reuses the existing page, anchors, sandbox, BFS and target2 exercise. The basic-Python
reader now derives an optimistic remaining-command bound, manually follows a full
small A* search and reconstructs exact unbounded Python. The prior sections document
the original BFS candidate; canonical step4 and complexity are replaced as follows.

|Step|Known|Single question|Input / quantity|Action / observation|Conditions|
|---|---|---|---|---|---|
|4 bridge|Full-state BFS, A/R and unit costs|How can a bound safely postpone exploration?|target6 default;3,5 presets / g,h,f, pending entries|next/back/reset/end after each pop; both children, sorted pending view, retained history, counts|No clipping/caps; best-g improvements and stale skip; return only on nonstale minimum-f goal pop|
|4 Python|Lower-bound proof and manual search|How do Python's heap and dictionary retain optimality?|Solution.racecar(target: int) -> int / minimum commands|map three bound branches and each child enqueue to exact Python|O(Q log Q) heap work; conservative O(D*2^D) time, O(2^D) space under unit-cost integer/hash assumption|

Bound sequence: target5's unique shortest AARARAA disproves distance-only pruning;
v=2 gives acceleration displacements0,2,6,14; derive v*(2**k-1) by bounding each
command's possible displacement. Facing the target: q=(d+v-1)//v, h=q.bit_length();
facing away: at least one R, then magnitude1 and gap at least d, hence
h=1+d.bit_length(); arrived:0. Bounds constrain possibility, not feasible routes.
Admissibility plus a frontier prefix of any cheaper solution proves goal-pop
optimality. h>=0, unit costs and finite branching bound relevant prefixes by
optimal depth D, proving termination without clipping. Only strictly better
arrivals enqueue; old stale entries can remain until popped.

All former exact tokens,48px controls and no-motion policy remain. Frames are
snapshots after a pop and its expansion/skip/return, initial has no pop. Counts
separate generated heap entries (including stale), unique pairs and expansions
(excluding goal pops). The pending view is sorted (f,-g,p,s), not a heap backing
array. Target5 has a real improved-g event and a stale pending entry; no preset
has a stale pop. Larger Python tests exercise actual stale pops. Goal frames
generate no children. Preset changes reset only this experiment; locale roundtrip
preserves all experiments, prediction and source state. New rows use the existing
wrapping ledger at320px. Synchronous presets have no loading/auth/reconnect state.

P0/highest-return: bound derivation, complete small A* search, exact Python,
proof and candidate-specific regressions. P1: small same-graph BFS/A* count
comparison (target6:24 vs5 expansions), with accounting boundary beside it.
P2:none. Deferred: unproved smaller-distance DP, geometry clipping, arbitrary
browser targets, automatic animation, heap internals, new shared frameworks.

818-RESOURCE-R1's DP choice is superseded, not proved. Preserve original95/100
acceptance and blocked investigation33686548c3c385cdb14b5b7262e4ca58a3b8d2f4;
this revision claims neither new independent acceptance nor publication.
Python remains the preferred faithful official interface, supported by the
lesson-local official-graphql.json Python3 starter. No language exception applies.
Source pair from scripts/register_leetcode_lesson.py: solution.py / python-code.js,
window.PYTHON_SOURCE, compared without whitespace normalization.

Author self-check and hash receipt: SELF-CHECK.md, candidate.json and
 tests/evidence/search-r1/. Root owns frozen-source Mac survey and isolated resource
measurements, to be recorded at specs/reviews/818-review-search-resource-measurement-20261026.md
before separate review. Its absence during authoring is expected and does not
prevent completing this candidate. No full-range, Mac or official-judge claim.
