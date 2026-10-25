# #685 author self-check — final candidate

Date: 2026-10-25. Outcome: self-checked, ready for a separate independent review.
This author did not spawn a reviewer, submit to LeetCode, register, commit, push,
deploy, change campaign state or edit shared files. Only leetcode/685/ is owned.
The approved product pattern is reused; no independent acceptance is claimed.

## Contract and computational evidence

`../../provenance/official.json` captures the public official statement, both
examples, all constraints and actual Python3 starter, including the complete
observed selector snippets. Python is the canonical officially supported method.
The input is a rooted directed tree plus one extra distinct non-self edge,
n=len(edges), 3..1000, labels 1..n. Latest valid removal is by input order.
No unsupported empty/arbitrary-graph behavior is advertised.

Commands executed successfully from repository root:

```sh
python3 -B leetcode/685/tests/test_solution.py
node leetcode/685/tests/test_core.cjs
node leetcode/685/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 685 --validate-only
```

Python report: 9,049 cases: 120 exhaustive n=3 orderings; 7,920 exhaustive n=4
orderings; 1,000 seeded Prüfer-tree cases; three n=1000 boundaries; six named
cases including both official examples and the fresh quiz. The independent
oracle removes each candidate and checks indegrees and directed reachability;
it does not use DSU or the three-case decision. Canonical Python is executed
through Solution.findRedundantDirectedConnection, with unchanged input verified.

Core report: 9,046 small/seeded cases, 127,788 frames. Independent BFS partitions,
forest edge count, incoming prefix indices, DSU root sizes, deep snapshots,
merge/rejection preconditions and final oracle outputs all pass. Maximum cases
are executed in Python, outside the deliberately small browser teaching contract.
100 copy keys were checked for duplicate definitions and two-string shapes.
Canonical source and JSON-only offline mirror are exactly equal including newline.

Metadata preflight: exit 0, no output/errors, complexity is one string covering
time and auxiliary space. `metadata-preflight.json` records the exact command,
time and unchanged registry/concept-map/index/metadata hashes. No registration
was run. Proposed concept entries remain in lesson-entry.json for later authorized
registration; no shared concept map was modified.

## Real browser and semantics

Actual headless Chromium used the supplied executable path and existing
http://127.0.0.1:18782 preview. browser-results.json retains actual readouts.
Both EN and zh-CN: every frame of all five presets, forward/back/forward snapshot
identity, initial/end disabled controls, reset and final jump pass. All trial
deletions, all three quiz choices, reveal then change, and locale-after-reveal
preservation pass. Locale preserves preset/index, hand removal and radio selection;
locale buttons keep focus. Every localized status matches its intended state.

Representative authored walkthrough (self-check, not a novice or blind review):

|Section|Observed causal result|
|---|---|
|Hand deletion|Deleting 1→2 creates root candidates 1 and 2; feedback correctly says no sole-root reachability test was run. Deleting 1→3 or 2→3 gives counts 0,1,1 and reaches all 3 nodes; order selects 2→3.|
|Baseline|Rebuild all incoming counts and traverse after each proposed removal; reverse trial order enforces the tie rule. Four-node counterexample leaves 1→4→2→1 if the later parent is removed.|
|Filtered trace|In dual-conflict preset, row 3 (4→2) merges {1,2} and {4}; groups become {1,2,4},{3}. Row 4 (1→4) would close a cycle and is rejected; final removal is row 1 (2→1), a different edge. Before/after values and history stay synchronized on rewind.|
|Fresh transfer|For [[3,2],[4,2],[2,3],[1,4]], correct B removes 3→2, leaving 1→4→2→3. A leaves 3→2→3; C leaves node 2 with two parents. Feedback hides before verification and clears on a changed choice.|
|Python mapping|The same conflict returns edges[earlier] from the a==b branch, rather than the current cycle detection edge. No-conflict cycle cases return i; successful skip returns later.|

Native clipboard success and manual fallback both pass in EN and Chinese. The
fallback test seeds a distinct sentinel with the retained native API, checks full
selection/focus, sends Linux Control+C and reads the actual clipboard. Embedded,
textContent-displayed, copied, fallback-copied and downloaded bytes equal solution.py
including its final newline. No whitespace normalization is used.

Keyboard Tab and Enter, 3px focus, reduced motion, forced colors, storage denial,
local-file offline source/trace, actual sticky anchor clicks and related deep links
pass. Main page has zero observed console/page errors or failed/local-external
asset requests. Related destinations #675 step2 and #332 step2 exist.

## Visual inspection and contrast

Both locales at 320/390/736/1440px: no document overflow, controls at least 48px,
populated graph labels and adjacent values readable. The smallest graph is 262px
wide; measured SVG label bounding height is 20px. Two 200% CSS-zoom checks at
1440px also pass; this is browser-rendered CSS zoom, not physical-device testing
or a claim of testing browser chrome zoom settings.

All ten saved graph/stage/zoom screenshots were opened and visually inspected by
the author. Arrows, node IDs, pending/skipped/retained/rejected text, group braces
and values remain associated without collision. The long-stage captures hide the
sticky nav only in screenshot capture, to avoid an element-screenshot overlay;
real navigation geometry is tested separately. No runtime screenshot-only styles
are shipped. Both locale screenshots show the same actual numeric states.

Measured rendered normal/disabled/selected text minimum: 7.07885:1. Focus orange
against surrounding background: 10.73164:1, 3px width and 4px gap. Control boundary
rgb(154,167,184) against rgb(28,35,48): 6.44941:1. These reuse shared tokens; local
CSS removes disabled opacity and supplies visible muted borders. Shared + local
shipped CSS: 11,778 bytes, below 25,000. No external fonts or assets.

Earlier harness exceptions and their corrections are retained in harness-history.md
and associated failure files. The final full suite passes on the frozen sources.

Limits: author self-check only; no independent six-dimension lesson review,
real-device accessibility audit, actual novice teach-back, official submission
acceptance or production publication. Next action is a fresh-context independent
review of the candidate identified in ../../candidate-sha256.json.

## R1 repair addendum — 2026-10-25

The independent report found required issue **685-R1-001** after the initial
self-check above. Its result remains changes_required for that prior candidate.
A new label repair candidate is self-checked and **fixed awaiting review**;
see [repair evidence](r1-fix/self-check.md) and the current candidate manifest.
This append does not mark the finding independently accepted or closed.
