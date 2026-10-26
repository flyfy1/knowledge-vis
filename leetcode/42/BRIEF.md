# 42: Trapping Rain Water

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Settle one position at a time. Compare the two running maxima before seeing which endpoint is settled. Cyan water remains visible and can be summed at the end.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/trapping-rain-water/.
How much water fits between unit-width bars? Heights are nonnegative, and water needs a wall on both sides. Return the sum of water depths at all positions.
1 ≤ n ≤ 20000; 0 ≤ height[i] ≤ 100000.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | Each position outside the pointers has been settled exactly once. Gray blocks are bars, cyan blocks confirmed water; no cyan at an unsettled position does not mean it will remain dry. water is the settled total. Displayed pointers have advanced to the next cell; maxima refresh at the start of the next operation. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Settle one position at a time. Compare the two running maxima before seeing which endpoint is settled. Cyan water remains visible and can be summed at the end. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(n), auxiliary space O(1). One pointer moves each round, for at most n rounds. Python stores no per-position depths; the teaching view retains them separately. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `left_max / right_max` | Steps 1–2; repeated in step 4 | Running side maxima, not current bar heights | Arrays, indices, the stated input contract |
| `left / right` | Steps 1–2; repeated in step 4 | Endpoints of the unsettled range | Arrays, indices, the stated input contract |
| `water` | Steps 1–2; repeated in step 4 | Total water at settled positions | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Three wet positions: `[3, 0, 2, 0, 4]`.
- Official example: `[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]`.
- Increasing heights: `[1, 2, 3, 4]`.
- Single bar: `[4]`.

For [3,0,2,0,4], index 2 has left/right highest walls 3/4. Above level 3 water spills left, so the level is min(3,4)=3 and depth is 3−2=1. At indices 1 and 3 the same walls give 3−0=3 each. Ends hold 0: 0+3+1+3+0=7 units at unit width. Using only wall 4 incorrectly predicts middle depth 2; counting level 3 as depth includes the bar. These numeric steps appear before the baseline in both locales.

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


## Required-review repair scope (2026-10-18)

Report: `../../specs/reviews/42-review-1-c31e1a0d.md`.
Product-fit verdict: reuse the existing lesson, step order, paragraphs, tokens and
controls. The reader needs the concrete wall → level → depth bridge before code.
The existing independent finding supplies the requested design direction; this
repair adds no new feature or layout. P0 / highest-return slice: numeric hand
calculation in EN/ZH and valid lesson-local metadata. P1/P2: none. Deferred:
shared visual refinements remain outside this lesson's ownership and required fixes.
The canonical Python interface and shared trace are unchanged. New metadata is a
new candidate, not a repair of the historical review result. Both required IDs
remain fixed awaiting independent review; see `SELF-CHECK.md` for evidence.

## 2026-10-26 — local wall-height derivation addition

Scope: `leetcode/42/` only, plus `specs/reviews/leetcode42-wall-proof-20261026.md`.
Source remains numeric; the existing static publisher emits `42-codex/`. This
revision visibly identifies Codex in both locales; a future `42-claude/` sibling
remains independent. No registry, homepage, shared renderer, or Claude edit.

The missing teaching interaction was a manipulable counterexample to “a higher
right wall always adds water.” Insert a baseline experiment at the beginning of
step 1, before the optimized invariant:

| Known | One question | Inputs → output | Action → observation | Conditions |
| --- | --- | --- | --- | --- |
| Unit-width bars and per-column depth from step 0 | Does a taller far-right bar always increase water at i? | Bounded nonnegative integer array, selected i → depth at i | Adjust far-right height 0–6; reveal left maximum, right maximum, min height, subtraction; compare 1/4/6 at i=2 | Ranges include i; this is one column, not total water; no physical timing or fluid-flow simulation |

First-use local terms: index i is a zero-based position; left/right maxima are
the tallest bars in the full ranges including i; surface height is measured from
the ground; depth subtracts the selected bar's height. Full-range maxima in this
baseline lab must not be mislabeled as the optimized trace's running maxima.
The bridge explains the distinction and the safe-side condition after refreshing
both endpoint maxima. The existing Python and optimized trace stay canonical.

State contract: phase 0 exposes only the left maximum; phase 1 adds the right;
phase 2 adds the lower surface height; phase 3 alone reveals depth and water.
Back restores exactly the earlier phase, including removing later water and
readouts. Reset steps retains edited inputs; restore default restores
[3,0,2,0,4], i=2. Changing preset, focus, or height returns to phase 0. Locale
changes preserve both simulations and keyboard focus; neither simulation changes
the other. Preset labels describe starting arrays; the separate current-array
readout always shows edits. All equal-maximum ties use the first valid witness.

Required regression acceptance is in the corresponding spec. Run
`node leetcode/42/tests/wall-model.cjs`, the existing `model.cjs` and
`regression.py`, and the new `wall-browser.cjs` plus original `browser.cjs`.
New browser tests accept `LESSON_PREVIEW`, `LESSON_ROUTE`,
`LESSON_TEST_OUTPUT_DIR`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
This addition is self-checked; independent review is pending.

## Integration recovery contract — 2026-10-26

Independent cold review found native controls restored by Back while the new wall model reinitialized defaults. Preserve preset/current small array/index/phase in validated current-entry `history.state.visualLc42Wall`, merge foreign history fields, and reconcile controls/model on pageshow/popstate. No global reading history, new persistent storage or timer. Normal Back/reload restores edits and phase; restricted history degrades to a consistent in-memory/default view. Include malformed-state, foreign-field, reset-step versus restore-default and real collection→Back/reload regression. The two-pointer engine remains independent and unchanged.

New wall-lab buttons, selects and slider have at least48px touch height, following the shared UI contract; existing unrelated legacy controls are not restyled.

Cached-page compatibility: mounting the optional wall lab must check both its global and host; old cached numeric/Codex HTML has neither new module nor host and must retain the existing optimized lesson without a ReferenceError.

Browser test lifecycle: provenance assertions target the shared semantic disclosure after integration. Every assertion-failure path must close owned Chrome in finally; use bounded waits. A failed assertion must exit, not leave an unresolved browser keeping the test process alive.
