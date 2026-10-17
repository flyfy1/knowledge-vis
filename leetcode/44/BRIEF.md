# 44: Wildcard Matching

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Inspect the left and above dependencies of *. Choose the empty-text case to study row zero, then compare regex’s two-left rule. Rewinding restores previously computed cells.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/wildcard-matching/.
Can a wildcard pattern cover the whole text? ? matches exactly one character; standalone * matches any string, including empty. Here * does not depend on the preceding character.
Text and pattern lengths 0…2000; lowercase letters, ?, and *. Empty strings are official inputs.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | The view retains the full table to explain dependencies; Python stores two rows. Coordinates are prefix lengths, ε is empty, T/F mean true/false, and · means uncomputed. Empty text matches only all-star prefixes. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Inspect the left and above dependencies of *. Choose the empty-text case to study row zero, then compare regex’s two-left rule. Rewinding restores previously computed cells. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O((m+1)(n+1)), auxiliary space O(n), with n the pattern length. The usual O(mn) shorthand assumes nonempty inputs; initializing empty text still costs O(n). |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `previous[j]` | Steps 1–2; repeated in step 4 | Same column in the previous row: dp[i−1][j] | Arrays, indices, the stated input contract |
| `current[j - 1]` | Steps 1–2; repeated in step 4 | Left cell in the current row: dp[i][j−1] | Arrays, indices, the stated input contract |
| `previous[j - 1]` | Steps 1–2; repeated in step 4 | Diagonal dependency for literals or ? | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Variable-length star: `["adceb", "*a*b"]`.
- Question mark is not enough: `["cb", "?a"]`.
- Empty text and repeated stars: `["", "**"]`.
- Nonempty text, empty pattern: `["a", ""]`.

For s="adceb", p="*a*b", the first * is empty, a matches a, the second * takes dce, and b matches b: true. s="cb", p="?a" is false; ? handles only the first character.

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
