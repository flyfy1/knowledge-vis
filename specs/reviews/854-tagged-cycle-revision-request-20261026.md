# #854 concrete repeated-letter proof revision

Request `854-BRIDGE-R1`. Dispatcher design adjudication and implementation brief;
**pending adoption at a clean campaign boundary, not implemented or accepted**.
The original 92.5/100 acceptance and optional `854-A01` remain historical facts.
This request selects that advisory for improvement; it does not rewrite its severity
or authorize an edit to an active worker's checkout/state.

## Adjudication and useful scope

Adopt all four P0 recommendations in the [independent design review](854-tagged-cycle-design-review-20261026.md).
The reviewer is separate from the [proposal](../proposals/leetcode-tagged-cycle-teaching-20261026.md)
author. Root also inspected the accepted `copy.js` proof and reran the arithmetic
verifier: original-string distance 2, 442 finite mappings and 628 singleton checks.
Those checks corroborate the example; the general argument remains necessary.

The reader knows Python loops, strings and sets. Their immediate job is to see
why reassigning identical letters' destinations costs no actual swap, before
following the existing proof that an optimal eligible move exists. Reuse the
existing lesson, tokens and navigation. Add one small proof example; no new route,
algorithm, generic widget or second scored quiz. The highest-return slice is the
unchanged letters and zero actual swaps when two destination arrows change.

Adopt: place the example between `proof` and `proof2` in section 03 (`#step2`);
use a readable single snapshot; keep one independent row index; explain the full
causal distinction in both languages. No recommendations are overridden.
Defer arbitrary input, animated arrows, all-row comparison mode and a reusable
permutation component: none is needed to explain the selected advisory.

## P0 implementation contract

The accepted source anchor is candidate `1be3c657ef0c1ef3152f8abced78df2e278f09da`
and the unchanged [original review](854-outcome-20261026/854-review-1-9601268b.md).
At eventual adoption, verify current lesson identity against its preserved
acceptance before editing. Update the lesson brief with this approved scope.

Target stays `abca`. Positions are zero-based. Tags `a₀` and `a₁` distinguish
occurrences only; they are not additional input characters. An arrow from current
position i to j assigns the token at i to target position j.

| Row | Current tagged tokens | Destination array | Cycles | Swaps needed for this assignment | Actual swaps so far |
| --- | --- | --- | --- | --- | --- |
| 0 | a₀ a₁ b c | 3,0,1,2 | (0 3 2 1) | 3 | 0 |
| 1 | a₀ a₁ b c | 0,3,1,2 | (0)(1 3 2) | 2 | 0 |
| 2 | a₀ b a₁ c | 0,1,3,2 | (0)(1)(2 3) | 1 | 1 |
| 3 | a₀ b c a₁ | 0,1,2,3 | (0)(1)(2)(3) | 0 | 2 |

This table specifies data, not a six-column mobile layout. Render one snapshot
with visible positions, tokens, destination mapping, action and two separate
counters. Keep the target visible. Mark changed destinations with text/shape as
well as color. Use these complete bilingual counter labels:

- `Swaps needed for this assignment` / `按当前分配还需交换`.
- `Actual swaps so far` / `已做实际交换`.

Before row 1, ask rhetorically whether any letters will move. Row 1 answers:
only the two equal letters' assigned destinations change; no token moves and no
actual swap is charged. The original problem's answer was already 2: the displayed
3 was the cost of the first restrictive assignment, not a lower bound. Row 2
physically swaps positions 1 and 2; row 3 swaps positions 2 and 3. Their counters
increase because tokens actually move. Express these causes completely in both
languages, using the proposal's worked wording as source material.

Retain the preceding cycle definition and following general singleton argument.
Keep all eligible j branches in the algorithm. Explicitly explain that a suitable
optimal predecessor exists but the proof does not identify it cheaply; the example
does not justify taking the first candidate greedily. Canonical Python, its mirror
and BFS core remain unchanged.

Use one local example-row index, separate from `hand`, `preset/at/frames`,
`selected/revealed` and `copyState`. Reuse button styling and semantics, not the
existing BFS control handlers. Next/Previous change one row, Reset returns row 0,
and locale changes preserve the row. The rhetorical prompt and explanation derive
from the row; no new quiz selection/reveal state is needed. Endpoint buttons use
native disabled behavior. No motion, timers, network or persistence is introduced.

Reuse the exact frozen token contract: `--bg #0d1117`, `--panel #161b22`,
`--panel2 #1c2330`, `--line #2b3547`, `--text #e8edf4`, `--muted #9aa7b8`,
`--accent #6ee7ff`, `--accent2 #ffb454`, `--good #7ee2a8`, `--bad #ff7a93`;
shared system font and 1.75 line height, 14px stage/8px control radii, 48px controls
and 3px orange focus. Inherit existing spacing/type scales. Explain necessary
new layout literals in the lesson brief rather than introducing similar colors.

P1 and P2: no extra feature. Fixed synchronous snapshots have no loading, reconnect
or remote-error branch; existing source-transfer error states remain unchanged.

## Validation and acceptance

Check all four rendered mappings, token orders, actions and counters; replay,
rewind and reset must restore exact values. Switch EN/ZH at every row. Exercise
the existing hand-swap task, BFS trace, revealed prediction and source panel around
example interactions to prove state independence. Verify native endpoint states,
keyboard order/names/focus, forced colors, reduced motion, and actual contrast.
Inspect both locales at 320px, desktop and 200% magnification with complete labels
and no hidden essential comparisons. Record magnification technique honestly.

Verify unchanged canonical/mirror/core bytes and ordinary metadata validation.
Do not rerun a large algorithm sweep solely for an isolated explanatory example;
the new snapshot checks and existing interaction regressions are the meaningful
test surface. Broaden tests if actual changed bytes warrant it.

A fresh independent lesson reviewer must evaluate `854-BRIDGE-R1` against the
new candidate, specifically whether `854-A01` is resolved. Preserve the original
review, runs, acceptance and release ledger through the normal revision workflow.
This brief does not close the advisory, prove rendering or change publication
eligibility. No lesson implementation or state transition occurred in its creation.
