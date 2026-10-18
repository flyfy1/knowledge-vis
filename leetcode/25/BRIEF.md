# 25: Reverse Nodes in k-Group

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Rewire one next at a time. Permanent # IDs and values stay fixed. Compare with the previous frame to find the changed edge and see when the group reconnects to the prefix and suffix.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/reverse-nodes-in-k-group/.
How do we reverse each group of k nodes? Change next pointers, never swap node values. A suffix shorter than k must remain in its original order.
1 ≤ k ≤ n ≤ 5000; node values 0…1000. The follow-up asks for O(1) auxiliary space.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | During reversal, prev leads the reversed fragment and curr leads the unprocessed fragment; nxt saves the successor before rewiring. Intermediate states need not make every node reachable from head, so the view keeps all nodes and every next pointer visible. In readouts, −1 identifies dummy and ∅ means no node. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Rewire one next at a time. Permanent # IDs and values stay fixed. Compare with the previous frame to find the changed edge and see when the group reconnects to the prefix and suffix. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(n), auxiliary space O(1). Each full group is scanned and reversed once; Python creates no node array. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `node / val / next / head / None / #id` | Step 0, before statement and baseline | Object with a value and next reference; first reference; absent node; permanent identity | Python objects, lists and assignment; reference meaning defined inline |
| `nxt` | Step 0, first concrete rewire | Reference to #1 saved before changing #0.next | Concrete three-node diagram and next assignment |
| `group_prev / kth / group_next` | Step 1, concrete three-node derivation; repeated in step 4 | Predecessor / kth node / successor | Step 0 saved-reference walkthrough and short-group check |
| `prev / curr / nxt` | Step 1, concrete three-node derivation; repeated in step 4 | Reversed fragment / current node / saved old successor | Step 0 two rewires and entry reconnection |

## Representative inputs and expected hand calculation

- Pairs: `[[1, 2, 3, 4, 5], 2]`.
- Short suffix: `[[1, 2, 3, 4, 5], 3]`.
- Equal values, different nodes: `[[2, 2, 3, 3], 2]`.
- k = 1: `[[1, 2], 1]`.

For [1,2,3,4,5], k=2 gives [2,1], [4,3], then unchanged 5. With k=3, only the first group reverses, yielding [3,2,1,4,5].

## Demonstration boundaries

Worked calculation, trace presets, and prediction are separate experiments.
The trace runs JavaScript, not Python. Full retained trace snapshots are teaching
storage and are excluded from the submitted algorithm's complexity claim.
Rewind restores a complete snapshot, not an inverse mutation.

## Verification

Run `python3 leetcode/tests/test_hard_solutions.py`,
`node leetcode/tests/test_hard_core.cjs`, and
`NODE_PATH=<playwright package directory> node leetcode/tests/test_hard_browser.cjs`.
See `../../specs/reviews/leetcode-first-ten-review.md` for observed review evidence.
No actual LeetCode submission or human learning test is claimed.

## Review 1 repair contract (2026-10-18)

Adopted required finding **25-R1** from [the independent report](../../specs/reviews/25-review-1-e91d5f55.md).
Reuse the existing lesson layout, typography, colors, paragraph and input-data styles;
no new controls, CSS, animation, runtime behavior or shared assets. This is the
review-requested prerequisite repair, not a new product/layout decision.

P0 / highest-return slice: define linked nodes and references before baseline code;
work [1,2,3], k=2 through saved successor, two edge changes and entry reconnection;
check the partial suffix before deriving named pointers. Explain Python list-slot
assignment separately from node-link assignment. Both languages show the same
object IDs and causal steps. P1: verify the concrete derivation against executable
source and trace frames. P2: no decoration planned.

Deferred: optional **25-N1** disabled-text styling; it requires a separate local
style decision and is not needed to repair the missing prerequisite. No shared
style changes are authorized. Independent closure remains pending.

Step 0 sequence is now definitions → object diagram → assignment distinction →
problem/grouping hand calculation → concrete two-rewire calculation → partial-group
counterexample → node-reference baseline. Step 1 names dummy/group_prev, then
kth/group_next/prev/curr on those same three objects and repeats the two operations
with exact Python assignments. The existing equal-valued-node prediction stays a
fresh identity transfer case; its answer is still hidden until explicit reveal.

Self-check evidence and file fingerprints: [review-1-fix/SELF-CHECK.md](evidence/review-1-fix/SELF-CHECK.md).
This is an author repair; no finding is independently closed here.
