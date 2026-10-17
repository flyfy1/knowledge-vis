# 10: Regular Expression Matching

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Advance one cell at a time, especially the two-left and one-up dependencies of *. Rewind with the input fixed and locate the source of each result; earlier conclusions stay visible.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/regular-expression-matching/.
Does the pattern match the entire text? Lowercase letters match themselves, . matches one character, and x* repeats the preceding atom zero or more times. * is not an independent arbitrary-string matcher.
Text and pattern lengths are 1…20. Every * has a valid preceding atom. Empty prefixes in the table are recurrence boundaries, not additional official inputs.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | Fill row by row; each dependency is already known to the left or above. Row and column coordinates are prefix lengths, not character indices. T/F mean true/false, · means uncomputed; orange marks dependencies and cyan marks the current cell. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Advance one cell at a time, especially the two-left and one-up dependencies of *. Rewind with the input fixed and locate the source of each result; earlier conclusions stay visible. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(mn), space O(mn), where m and n are text and pattern lengths. Each cell uses a constant number of comparisons. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `dp[i][j]` | Steps 1–2; repeated in step 4 | Whether the two full prefixes match | Arrays, indices, the stated input contract |
| `matches` | Steps 1–2; repeated in step 4 | Whether the text character matches the atom before * | Arrays, indices, the stated input contract |
| `j - 2 / i - 1` | Steps 1–2; repeated in step 4 | Skip the whole x* group / consume another character | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Zero and repeated atoms: `["aab", "c*a*b"]`.
- Full match required: `["aa", "a"]`.
- Dot plus star: `["ab", ".*"]`.
- Repeat keeps its atom: `["ab", "a*"]`.

For s="aab", p="c*a*b", take zero c characters, two a characters, then b: true. For s="aa", p="a", the answer is false because a partial match is insufficient.

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
