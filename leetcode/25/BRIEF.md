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
| `#id / node.val` | Steps 1–2; repeated in step 4 | Permanent object identity / immutable node value | Arrays, indices, the stated input contract |
| `group_prev / kth / group_next` | Steps 1–2; repeated in step 4 | Predecessor / kth node / successor | Arrays, indices, the stated input contract |
| `prev / curr / nxt` | Steps 1–2; repeated in step 4 | Reversed fragment / current node / saved old successor | Arrays, indices, the stated input contract |

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
For Sudoku, the first 180 events and final board are retained; an explicit final
notice identifies omitted events. Heap frames show completed operations, with
sift behavior explained in prose. DP retains the full table even where Python
uses rolling rows. Rewind restores a complete snapshot, not an inverse mutation.

## Verification

Run `python3 leetcode/tests/test_hard_solutions.py`,
`node leetcode/tests/test_hard_core.cjs`, and
`NODE_PATH=<playwright package directory> node leetcode/tests/test_hard_browser.cjs`.
See `../../specs/reviews/leetcode-first-ten-review.md` for observed review evidence.
No actual LeetCode submission or human learning test is claimed.
