# #834 author brief — candidate r3

Author: Codex (exact model identifier unavailable). Author run only; independent
review pending. No acceptance, learner result, submission acceptance or publication
is claimed. Reuse approved product/design adjudication in
specs/reviews/leetcode-all-hard-design-review.md; apply website-design SKILL.md.
Scope: only leetcode/834/. Category computing / LeetCode; stage university.
Reader: knows loops, lists, graph neighbors and basic Python; new tree terms are
explained locally. Outcome: calculate distance sums, derive the edge-cut invariant,
and implement iterative two-pass rerooting without recursion-depth failures.

Official source: https://leetcode.com/problems/sum-of-distances-in-tree/ verified
2026-10-26 via public GraphQL, saved in tests/evidence/official.json including full
statement and actual language snippets. Python3 callable confirmed. Valid connected
undirected unweighted tree, n=1..30000, n-1 edges, 0-based IDs, distinct endpoints.
No modulus, no empty tree, no mutation requirement. Official examples: six-node
[8,12,6,10,10,10], singleton [0], reversed-edge two-node [1,1].

## Design contract and priorities
Build within existing page, shared common.js/style.css tokens exactly: bg #0d1117,
panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font stack;
shared spacing/radii, 48px controls, 3px accent2 focus. No motion. Highest-return
20%: visible per-node edge-cut changes plus retained two-pass ledger. P0: bilingual
causal lesson, state fidelity, code, oracle/browser tests. P1: reversible snapshots,
copy fallback. P2: none. Deferred: arbitrary tree editor and playback (unneeded
complexity); shared registry/concept map updates belong to dispatcher, outside scope.

## Five-field steps
| Step | Known | Single question | Input → quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Nodes joined by edges|What does a distance sum count?|4-node path → one node's distances|Select source; see every distance and sum, 6→4|Unique paths, unit edges|
|1|Distance sum|Why not search from every node?|Same path, then n=30000 → work|Inspect baseline and compare 4 searches with reused edge cuts|Valid tree; O(n²) worst case|
|2|Distance sum and repeated work|What changes across one edge?|Same path and presets → size, down, answer|Advance bottom-up merges then outward moves; rewind identical snapshots; retained ledger|Fixed root 0 defines subtrees; parent answer known before child|
|3|Cut invariant|Can it transfer to a new shape?|Fresh 5-node branched tree → answer[1]|Predict, explicitly reveal, change answer clears feedback|Child side size 2, parent sum 6|
|4|Two passes|How does the proof become submission code?|n, edges → list of n sums|Read mapping, copy or download exact Python|Valid input; iterative order avoids stack limit|

## Terms and dependencies
Distance: step0, number of edges on unique path, depends on unit edges.
Tree: step0, connected graph without cycles. Root: step2, chosen reference 0.
Parent/child: step2, neighbor toward/away from root. Subtree: step2, child and all
nodes below it. size: step2, count of nodes in that subtree. down: step2, sum of
distances from node to its own subtree nodes. Rerooting: step2, reuse a full sum
when changing the starting node. All terms redefined where needed in step4.

Simulation: browser JS mirrors arithmetic, does not execute Python. Fixed tiny
presets; no skipped trace transitions after initial parent/order construction.
Snapshots use extra tutorial history; canonical auxiliary memory O(n). Experiments
0,2,3 are independent; preset changes reset only step2; locale preserves all state.
No loading/server/reconnect lifecycle: static local lesson. Copy error uses selectable
manual fallback. Initial/middle/end, disabled controls, pending/revealed/changed
prediction and copy states must be checked in both locales. Related links stay
within this lesson at meaningful existing sections.

## Validation / freeze
See tests/evidence/self-check.md and reproducible test scripts. Metadata preflight
must pass before ready. Candidate identity will be recorded with SHA256 hashes.
Separate reviewer must perform cold walkthrough and six-dimension review; author
self-check cannot close that gate.

Final author status: self-checked candidate r3; independent review pending.
`python3 -B scripts/register_leetcode_lesson.py 834 --validate-only` completed
successfully (exit 0, no output). Candidate runtime/metadata hashes and detailed
checks are in tests/evidence/. No shared registration or acceptance record changed.
