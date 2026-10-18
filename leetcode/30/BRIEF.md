# 30: Substring with Concatenation of All Words

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Use “Excess word” to watch have exceed and return to its quota. Then use “Nonzero start” to find an answer at offset=1. Changing presets restarts the experiment.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/substring-with-concatenation-of-all-words/.
Which starts contain all words consecutively? All words have equal length and may appear in any order, but each must occur with its given multiplicity and with no gaps. Return every valid character index.
Text length ≤ 10⁴; 1…5000 words; word length 1…30; lowercase letters only. Output order is unrestricted.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | After shrinking, the window has no unknown or excess words. left and right only move forward on each track. Scanning all remainders prevents missing starts such as 1 or 2 that are not aligned with zero. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Use “Excess word” to watch have exceed and return to its quota. Then use “Nonzero start” to find an answer at offset=1. Changing presets restarts the experiment. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Accounting for Python slicing and string hashing: expected time O(Lw+kw), auxiliary space O(kw), plus output. With constant-cost word operations, the scanning portion is O(L). |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `offset` | Steps 1–2; repeated in step 4 | Track identified by start modulo word width | Arrays, indices, the stated input contract |
| `have / need / used` | Steps 1–2; repeated in step 4 | Current counts / required counts / current number of words | Arrays, indices, the stated input contract |
| `right + width` | Steps 1–2; repeated in step 4 | Exclusive end in the view; Python right is the new word start | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Excess word: `["barfoofoofoobar", ["bar", "foo"]]`.
- Nonzero start: `["xbarfoo", ["bar", "foo"]]`.
- Repeated required word: `["foofoofoo", ["foo", "foo"]]`.
- Text too short: `["a", ["aa"]]`.

For s="barfoofoo", words=["bar","foo"], start 0 gives bar+foo and is valid. Start 3 gives foo+foo, missing bar and overusing foo. Set membership alone is insufficient.

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

## 2026-10-18 revision contract (author fixes, independent re-review pending)

Basis: `../../specs/reviews/30-review-1-f4f10635.md`, required findings
`30-R1-F01` and `30-R1-F02`. Adopt both findings. This is a correction within
the reviewed page and interaction, with no new feature or layout. Product-fit
verdict: reuse the existing trace, controls, typography, colors and spacing.
The reader's immediate job is to distinguish a retained window from a removed
word, then map before/after counts to Python. The smallest useful outcome is an
accurate bilingual legend and a valid lesson-local metadata preflight.

P0 / highest-return slice: supply `lesson-entry.json` with one time-and-space
complexity string; define highlights as this frame's retained `[left,right)`
window. Validate add, excess shrink, overlap removal and unknown reset against
before/after frames, including empty highlights, at mobile and desktop widths.
P1: expand width-three tracks and reuse arithmetic, define Counter's absent-key
zero, and show the three coupled updates at event 6→7. Explain why all tracks
together read O(L) chunks before charging Python's O(w) string operations.
P2: no decoration planned. Deferred: the review's optional disabled-control
styling suggestion; no shared CSS change is authorized for this lesson fix.

Allowed presentation hooks: lesson-local bilingual copy and one explanation
paragraph in step 05, plus the changed copy asset's version reference. Existing
shared tokens and all control handlers are reused. The current and previous
diagrams each show their own retained interval; count rows remain numerical
data without character indices. Transient excess is allowed after addition or
an intermediate removal; the invariant applies after shrinking finishes.
Unknown resets show empty counts and no highlighted characters.

Validation matrix: both EN/zh; add/shrink/overlap/reset; 320/390 and desktop;
CSS zoom 200%; all preset endpoints including event 0/0; rewind/replay/reset;
all prediction choices and locale preservation; successful and denied copy;
offline display with unavailable storage. Loading, sending, reconnect and
server error states are inapplicable to this static, user-stepped page.
See `evidence/SELF-CHECK.md` for observed results and the frozen file manifest.
These are author checks only; a separate reviewer must recheck the candidate.
