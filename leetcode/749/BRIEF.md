# #749 Contain Virus — author brief

Author candidate only; independent review pending. Reuse the approved collection
pattern and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md.
Website-design skill applied; no new product, shared renderer or design review needed.
Category computing / leetcode; stage university. Reader knows Python loops and sets.
Job: reconstruct a deterministic day/night simulation, distinguish cells from edges,
and submit Python through the verified official interface.

Official URL: https://leetcode.com/problems/contain-virus/ . Public GraphQL capture
in tests/evidence/official.json includes access timestamp, full statement, examples,
constraints and real codeSnippets. Python3 signature is
Solution.containVirus(self, isInfected: list[list[int]]) -> int. Internal questionId
750 differs from frontend ID 749. m,n=1..50; binary rectangular input; unique most
threatening region whenever a choice matters; no input mutation requirement.
Three official examples yield 10,4,13. Stop if no healthy cells can be infected,
including full infection; perimeter needs no walls. Prefer verified Python3.

## Scope, priorities and contract
Reuse one lesson, shared common.js and style.css. Highest-return 20%: visible
cell/edge distinction, frozen-night experiment and exact Python source.
P0: five causal sections, both locales, reversible frames, fresh prediction,
source controls, independent oracle and browser evidence. P1: official and zero/full
presets. P2: no decoration. Deferred: free-form editing, animation and execution
backend (unneeded runtime/state); no universal visualization framework.

Exact inherited tokens: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93; alternate #0a0e14.
System font inherited, body 1rem/1.75, titles inherited; spacing 8/12/16/20/24/48/64px;
8px controls, 14px panel corners, 952px content; no shadows or animation.
48px actions; disabled opacity 1; focus 3px accent2 with 4px offset. No new colors.
Board cells min 48px in a labeled, keyboard-scrollable region, never shrink text.
Both languages preserve trace index, preset, quiz selection/reveal and copy feedback.
Preset resets only trace. Rewind restores deep snapshots, walls and ledger.
No timers, networking/loading/reconnect state in runtime. Branch matrix: initial,
inspect, quarantine, spread, terminal × zh/en; quiz pending/selected/revealed/changed;
copy success/manual fallback; denied storage. All applicable branches tested.

## Step contract
|Step|Already known|Single question|Input → quantity|Action → expected visible observation|Conditions|
|---|---|---|---|---|---|
|0 Hand count|binary cells|Why can 1 threatened cell need 2 walls?|2×2 L of three infected cells → 1 distinct cell, 2 edges|Switch L, line, ring: threat count stays 1 while walls become 2,1,4|Four neighbors only; no perimeter walls|
|1 Measure a day|cell vs edge|What exactly selects a region?|row [1,0,0,1,1,0] → two regions and counts|Read A={0}, B={3,4}; threatened sets {1}, {2,5}; B wins, two walls|Policy mandated, no global minimization claim|
|2 Freeze then update|region summaries|What must stay frozen overnight?|day-start grid → quarantine then simultaneous spread|Advance inspect/quarantine/spread, compare old/current grids, tables, walls and history; rewind|Only nonquarantined active regions spread one layer|
|3 Transfer|frozen frontier invariant|Does a newly infected cell spread immediately?|fresh row [1,0,0,0,1,1,0] → after first night|Predict row before reveal; change answer clears feedback|B uniquely threatens 2 cells, A only 1|
|4 Code and boundaries|causal simulation|How do summaries become Python?|official interface → total walls|Inspect/copy/download canonical Python; map one transition|O((D+1)mn) time, O(mn) auxiliary, D≤mn; no threats returns 0|

## First-use terms and proof
Step0: healthy=0, infected=1; threatened cell=healthy sharing an edge; wall=one
shared edge. Step1: region=maximal 4-connected active infected set; frontier=set of
healthy neighbors; edge count=number of infected-to-healthy adjacencies. Step2
redefines region/frontier and Q=quarantined, inactive; invariant=all summaries come
from one unchanged day-start grid. Step3 locally repeats night/frontier semantics.
Step4 maps region/frontier/walls to cells/frontier/needed; -1 internal quarantine
marker, not legal input. Coordinates zero-based (row,column). Baseline computes
connected regions then scans every healthy cell against each region; O(N²) per day,
O(N³) upper bound overall. Direct neighbor scan avoids repeated healthy-grid scans,
O(N) per day including a final no-threat scan, O(N²) overall, N=mn; Python hashes assumed amortized O(1).

Each active cell is discovered once; examining its four neighbors both deduplicates
healthy targets in a set and counts every boundary edge independently. This derives
the two distinct summaries. Freeze both before mutation. Quarantined region cannot
spread; every other region infects exactly its old frontier, including shared targets
only once. Newly infected cells wait until the next scan. Induction preserves exact
day-start infection and wall total. Recompute components since regions can merge;
stop when no frontier. Every positive day removes ≥1 active cell permanently so
D≤N. This implements a prescribed policy, not an optimization over wall budgets.

Simulation is not execution of official submission. Browser trace stores snapshots
and persistent edge segments; Python uses -1 instead of storing wall geometry, valid
because fully enclosed regions become inactive forever. Teaching snapshots are not
part of submission auxiliary space. Empty/full examples are legal; ties outside the
guarantee use stable scan order in test extensions only, no tie preset advertised.

Validation: independent explicit-edge-wall oracle, exhaustive binary ≤3×3,
seeded rectangular cases and official examples; intermediate frontier/edge/frozen
spread checks; real Chromium all presets/locales/actions/source parity/clipboard
fallback/keyboard/320,390,736,1440/200% CSS zoom/contrast/local requests. Outputs
accept LESSON_OUTPUT_DIR. Screenshots visually inspected. No actual learner results,
LeetCode acceptance, independent acceptance or public delivery claimed.
