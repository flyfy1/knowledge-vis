# Follow-up implementation brief: #818 resource improvement

Request ID: **818-RESOURCE-R1**. Prepared for a later ordinary revision, not yet
dispatched. Base candidate: `c7a325e5a48d2da000609ea93d23f8d255d03bdd`; accepted
report: `818-review-1-ad85dc73.md`, 95/100. Preserve that acceptance and its evidence.
This is a new improvement, not an assertion of official TLE/OOM or a retroactive
required finding. The [independent design and dispatcher adjudication](818-review-resource-improvement-design-20261026.md)
precede this brief; [measured source evidence](https://github.com/flyfy1/knowledge-vis/blob/9625f18429c6df00d058ac5dd45c6fab9bdeb4e5/specs/reviews/818-performance-observation-20261026/README.md)
shows why checking only the largest numeric target missed substantial allocation.

## Reader and outcome

The reader knows basic Python and has learned that the car's complete search
state is `(position, speed)`. Preserve that lesson. Explain why a *normalized*
remaining-distance problem can nevertheless reuse answers: a reversal resets
the speed magnitude to one, and translation/reflection preserve the task. Do not
silently replace arbitrary position/speed states with distance alone. For positive `d`, reuse `f(d)`
only when unit speed points toward the remaining target; unit magnitude alone
is insufficient. Reflection reverses both position and direction, so it cannot
turn a state facing away into the same normalized subproblem.

The final callable must remain `Solution.racecar(target: int) -> int`. Derive
and implement a bounded-resource distance DP whose state and work are visible.
Before coding, establish why the considered acceleration/reversal prefixes cover
an optimum, including excluded first-run lengths and negative excursions. If the
usual two alternatives cannot be proved clearly, resolve that gap before claiming
the recurrence correct; widen the search only with an explicit finite bound.
Record the argument in BRIEF and provide the essential causal steps bilingually
on the page. An oracle match is not a substitute for this proof.

## Teaching and interaction contract

Reuse the existing sandbox, small complete BFS, prediction, source actions and
section anchors. Add the DP bridge before the final Python source in the existing
code section, using the same typography, panels and manual navigation controls.
Do not add another product, generic visualization engine or automatic motion.
Preserve old controls and state; prefix new DOM IDs to avoid collisions.

| Known | One question | Concrete input and quantity | Action and observation | Conclusion/boundary |
| --- | --- | --- | --- | --- |
| A doubles speed after moving | How far do consecutive A commands travel? | Start `(0,1)`, one through three A commands | Step and retain `1,3,7`, with the added old speed visible | `2**k-1` is the traveled distance, not the number of commands |
| Reversal resets magnitude | Why can an overshoot reuse a smaller answer? | Target 6, prefix `AAA R`, remaining distance 1 | Step to 7 facing left; show reflection, prefix cost 4, reused cost 1, total 5 | Translation/reflection is valid after unit-speed normalization |
| Both reversals cost a command | How can turning early compete? | Target 4, prefix `AA R R`, remaining distance 1 | Retain both stationary reversals; show zero backward A commands and total 5 | Zero backward movement does not remove either reversal |
| Smaller distances have answers | Which alternative gives the minimum? | Exact arrival 3 and the two examples above | Switch preset, inspect alternatives, advance/back/reset through complete small dependencies | Every dependency is smaller; discarded alternatives require the stated optimal-path argument |

Expose prefix commands, endpoint and direction, remaining distance, reused answer
and total in each frame. Do not show a result table whose normalization is hidden.
For a bottom-up implementation, derive actual distance-count and per-distance
candidate-count bounds before stating time/space complexity. Explain `bit_length`
or equivalent unfamiliar syntax beside its first use with a concrete value.

Reuse the frozen palette/type/spacing/focus tokens from the accepted BRIEF; no new
color or typography system. Both languages must cover exact arrival, overshoot,
undershoot (including zero backward steps), initial/middle/final states, rewind,
reset and disabled endpoints. Locale changes preserve all old and new selections,
frames and quiz answers; changing the DP preset resets only that DP trace. No
network/loading/auth/reconnect states apply to this local synchronous interaction.

## Evidence and ownership

Own only `leetcode/818/` implementation, its BRIEF/self-check and lesson-local
tests/evidence. Update canonical Python, exact source mirror, displayed/copied/
downloaded bytes, complexity metadata and numerical model consistently. The
existing BFS remains honestly labeled as the small teaching baseline, with its
cost distinction intact. Keep the official title, number, link and Codex routing.
No shared assets, queue, registry, publisher or historical report changes.

Require an independent small raw-command oracle, power-of-two neighbors, legal
command witnesses and dependency/termination checks across the full valid range,
plus targeted answers and isolated Mac resource measurements for 9809, 9879 and
10000. Compare against the archived observations without rerunning the old large
BFS on Pi. Distinguish independent algorithm evidence from implementations sharing
the same recurrence; explicitly identify any coverage limits. A legal witness
proves attainability (an upper bound), not minimality; the separately examined
completeness argument must supply the missing optimality guarantee. Run source parity
and metadata validate-only checks, then inspect actual bilingual frames, all new
states, old sandbox/prediction preservation, keyboard navigation, 320px and 200%
zoom. Numeric and visual evidence must match the new frozen candidate.

A fresh separate reviewer must cold-walk the revised derivation, examine the
optimal-path completeness argument, independently recompute transitions and
explicitly close **818-RESOURCE-R1**. Existing acceptance neither approves this
change nor permits updating public files before the normal publication gate.

P0/highest-return slice: a reconstructable proof, clear normalized transitions,
resource improvement and source fidelity. P1: measured work comparison only if it
clarifies the avoided repeated work. P2: none. Deferred: arbitrary large browser
targets, parent-edge polish and decorative animation; they do not resolve this
resource concern and require separate justification. Safe dispatch must preserve
all prior runs/reviews and wait for the current nine-request operation to finish.

## Independent brief check

A separate agent checked this brief against the design and clarified two required
conditions: normalized unit speed must face the target, and a legal witness proves
attainability only. The completeness argument must still prove optimality. Root
adopts both clarifications. Implementation, frozen-candidate review and publication
remain pending; this document is not a completed lesson revision.
