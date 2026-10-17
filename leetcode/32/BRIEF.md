# 32: Longest Valid Parentheses

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Process one parenthesis at a time. An unmatched ) resets the boundary; a matched ) highlights a contiguous suffix. Compare its length with best.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/longest-valid-parentheses/.
How long is the longest contiguous well-formed parentheses fragment? Choose a substring, never skip invalid characters inside it. Return its character count; empty text returns 0.
0 ≤ n ≤ 30000; characters are only ( and ).

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | best is the maximum over all processed endpoints; length is only the current valid suffix. The bottom boundary differs from the unmatched openings above it; −1 is not an input character. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Process one parenthesis at a time. An unmatched ) resets the boundary; a matched ) highlights a contiguous suffix. Compare its length with best. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(n), space O(n). Each index is pushed and popped at most once; nesting does not make the scan quadratic. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `stack[0]` | Steps 1–2; repeated in step 4 | Last uncrossable closing boundary, initially −1 | Arrays, indices, the stated input contract |
| `stack[-1]` | Steps 1–2; repeated in step 4 | Boundary before the current valid suffix | Arrays, indices, the stated input contract |
| `best` | Steps 1–2; repeated in step 4 | Maximum over all processed positions | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Reset the boundary: `")()())"`.
- Nested and adjacent: `"()(())"`.
- Unmatched opening: `"(()"`.
- Empty text: `""`.

In ")()())", indices 1…4 form "()()", length 4. In "(()", the valid suffix "()" has length 2. Counting all opening and closing parentheses does not determine the answer.

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
