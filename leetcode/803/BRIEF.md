# #803 · Bricks Falling When Hit — author brief

Build verdict: reuse the approved collection lesson pattern, not a new product.
Audience: university-stage algorithm learners comfortable with arrays and graph walks.
Category: leetcode; stage: university. Smallest useful outcome: derive why reverse
restoration counts newly roof-connected bricks minus the restored brick, and map it
to a faithful Python submission. Validation: author oracle and browser self-check,
then a separate cold review. No acceptance, learner outcome or publication claimed.
Approved contract: ../../specs/reviews/leetcode-all-hard-design-review.md and its
dispatcher adjudication; ../../specs/leetcode-{explainers,hard-traces,review-gates,
rendered-state-contract}.md; ../../UI-I18N-SPEC.md. Website-design skill read.

Official verification: 2026-10-25, https://leetcode.com/problems/bricks-falling-when-hit/
and public GET GraphQL question/titleSlug, content and codeSnippets. Save response
in provenance/official.json plus dated verification.md. Python3 selector supplies
Solution.hitBricks(self, grid: list[list[int]], hits: list[list[int]]) -> list[int].
Python preferred and faithful; no non-Python contract needed. Nonempty binary m×n,
1≤m,n≤200, 1≤H≤40000, unique in-bounds hits. Four neighbors, top-row support,
instant disappearance, empty hits cause zero; direct hit excluded from fall count.
Initial stability is NOT promised. Count lost support, not pre-existing floaters.

## Exact token contract
Use ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font stack,
body 1rem/1.75, title clamp(28px,5vw,46px), heading clamp(23px,3.5vw,32px),
8px control radius, 14px stage radius, 952px content, shared 8/10/12/16/20/24px
spacing roles; no shadows or animation. Local CSS only layout, 48px controls,
readable disabled states, 3px accent2 focus (active cyan locale uses an inset bg-colored ring), table scrolling and wrap. No new palette.

## Learning loop and five fields per step
0. Known: binary cells. Question: which bricks count after (1,0) is hit?
Input/quantity: official tiny 2×4 grid, one hit, fall count.
Action/observation: hand compute then toggle explanation: (1,1),(1,2) lose support;
(1,0) was erased, not fallen. Conditions: four-neighbor top connectivity, no landing.
1. Known: roof paths. Question: why is forward checking expensive and local counting wrong?
Input/quantity: same grid; before/after reachable sets. Action/observation: compare
baseline pseudocode and alternate-support map. One neighboring brick can lead to
many fallen bricks; a surviving alternate path can yield zero. Conditions: compare
stable sets, preserving initially disconnected bricks; empty hit zero.
2. Known: repeated full graph walks. Question: what changes if hits are undone?
Input/quantity: same default and four additional presets; roof sizes before/after,
answer slots in original hit order. Action/observation: next/back/reset/end, compare
two grids and retained ledger. Conditions: all hits known, unique coordinates;
keep disconnected bricks in bookkeeping. Derive invariant then DSU implementation.
3. Known: reverse invariant. Question: what does a later hit on an already fallen
brick contribute? Input/quantity: fresh 3×3 grid, two hits, entire output array.
Action/observation: select then reveal; changed selection invalidates feedback;
language preserves state. Conditions: independent exercise, no trace answer leak.
4. Known: roof delta rule. Question: how does the canonical Python maintain it?
Input/quantity: canonical source and operation mapping. Action/observation: inspect,
copy, download exact bytes. Conditions: Python3 official interface, unique hits,
iterative find, input preserved, amortized cost, tutorial snapshots excluded.

## First-use dependencies
Stable/top path: step0, sequence of occupied orthogonal cells reaching row0.
Reachable set: step1, cells found by a four-neighbor walk from top bricks.
Component: step2, occupied cells joined by such paths. Virtual roof: extra node
joined to every top-row brick. R: component size including roof node.
Invariant: step2, condition maintained after every restore. DSU: step2,
parent groups with representative find and union by size; path halving explained.
α: step4, inverse Ackermann amortized factor. Terms redefined locally on jumps.

## State / scope
Trace is a JS flood-fill simulation of completed reverse restorations, NOT Python
execution and not a display of DSU parent internals. Each frame stores independent
before/after binary grids, roof-connected sets, roof sizes including sentinel,
restored coordinates, and known answer slots. No omitted restores; initialization
removes every hit in bookkeeping, not a physically fallen final grid. U cells are
present but disconnected, S cells are roof-connected, dot empty; outline identifies
restored cell without changing occupancy. Rewind restores full snapshots.
Presets: official1; official2; alternate support; later hit already fallen; empty/single.
Changing preset restarts trace only. Prediction independent. Both languages cover
initial/intermediate/end, skip-empty, no-gain, positive gain, pending/revealed answers,
copy success/manual fallback. No network loading/errors required for static data.

P0 / highest-return 20%: causal before/after grids, delta ledger, reversible controls,
faithful code and both locales, oracle execution, readable mobile controls.
P1: fresh misconception exercise and source transfer evidence.
P2: none. Deferred: arbitrary editing and DSU parent animation (extra state and no
needed learning benefit); public registration/deployment and independent review
(outside author scope). Related links use existing graph and DSU anchors; metadata
provides local concept anchors without changing the shared concept registry.

## 803-R1 repair contract — 2026-10-25

Reuse verdict: repair the existing preset control within this lesson. The existing
independent review requests full selected identity at narrow 200% zoom; this is
the P0/highest-return slice. Keep the native selector and its keyboard behavior,
using the stable A–E identities as complete option text. Immediately below it,
show the existing full localized preset name as wrapping text, followed by the
unchanged forward-hit description. Associate both paragraphs via aria-describedby.
This preserves the descriptive wording and makes the complete selected identity
readable without relying on a native single-line control to wrap.

Presentation hooks: #preset display:block; .preset-selected margin-block:8px 0
and overflow-wrap:anywhere. Reuse the existing type, palette, focus and spacing
tokens. No source/algorithm, trace transitions, prediction rules or shared assets
change. Check all five identities, D at intermediate/end, both locales, 320/390
at CSS zoom 2, keyboard use and locale retention; rerun the existing full suite.
P1/P2: none in this repair. Deferred: optional 803-A1 parent/size teaching table;
the review identifies it as advisory and it needs a separate teaching change.
Independent closure of 803-R1 remains pending against the new frozen candidate.
