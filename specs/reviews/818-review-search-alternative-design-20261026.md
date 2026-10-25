# Independent design discussion: #818 A* alternative

**Conditional recommendation, not an implementation brief or readiness decision.**
Consider A* inside the existing #818 page only if the ongoing full-range survey
finishes successfully and root explicitly supersedes the earlier distance-DP
adjudication. The usual DP normal form remains unresolved here. Preserve its
investigation and the original 95/100 acceptance; neither is rewritten by this
proposal. No live lesson, queue or acceptance was changed for this review.

## Product fit and comparative judgment

The basic-Python reader's job is still to understand why complete `(position,speed)`
states and command costs determine the shortest route. Reuse the driving sandbox,
complete small BFS, target2 prediction, existing anchors and source actions.
Place one resource-improvement bridge before the canonical code in step4; no new
product, shared engine or new navigation section is warranted.

A* adds a priority queue and an optimistic remaining-command bound. That is extra
novice burden, but it preserves the graph, both legal transitions and complete
state already taught. Its correctness can be proved without the unestablished
path exclusions needed by the proposed one-dimensional DP. This makes it a
reasonable conditional replacement, not intrinsically simpler syntax. Trim the
bridge to one bound calculation, one full small search and the goal-pop argument;
do not teach DP and A* as two new mandatory solutions in the same revision.

Evidence inspected: accepted source/core/copy and current preserved BRIEF via
read-only Pi Git at `33686548c3c385cdb14b5b7262e4ca58a3b8d2f4`, prior request/design,
independent proof investigation and root's experimental search. Selected Mac
records show substantial memory reductions but remain environment-specific.
The survey is ongoing; this document does not declare it passed.

## Smallest coherent teaching flow

1. **Why not choose the nearest coordinate?** Use target5 and
   `AARARAA`: distances are `5,4,2,2,3,3,2,0`. The backward step from3 to2 moves
   farther away yet belongs to the shortest route. Independent raw enumeration
   through length7 found this as the sole shortest word, and none shorter.
   This is a specific counterexample, not a general optimality proof. Do not
   discard that branch merely because another looks nearer.
2. **How little work could possibly remain?** Define g as commands already spent,
   h as an optimistic lower bound, and f=g+h. First derive maximum displacement
   from repeated accelerations. Toward the target, `ceil(distance/abs(speed))`
   converts distance to current-speed units; its bit length gives the least k
   with `2**k-1` at least that many units. Away from the target, at least one R is
   necessary; afterward unit speed still has at least the old distance to cover.
   Explain the integer ceiling and bit_length with numeric examples before code.
3. **Which state is worth examining next?** Default target6 is small: the current
   probe expands5 states and discovers11. A target3 preset gives direct arrival;
   target5 demonstrates the detour (21 expansions,35 discovered states, heap peak15).
   These counts are probe observations, not a promised frozen UI trace. Pop the
   smallest f, show the complete state and both actual A/R children, and label
   whether each is newly queued, improves best g, or is not better.
4. **Why stop only on pop?** h never exceeds remaining cost, so every cheaper
   possible solution has a frontier prefix with f no larger than that solution.
   A minimum-f nonstale goal has h=0 and therefore cannot be beaten. Finding or
   enqueueing a goal is insufficient; the pending frontier still matters.

Keep the trace manually stepped/back/reset, with retained prior expansion and
labeled g/h/f values. Show a sorted frontier **view**, not a falsely sorted raw
heap. Match the actual tuple order `(f,-g,position,speed)` and explain ties locally:
-g prefers more already-spent commands only when f ties; remaining tuple fields
make ordering deterministic. `heapq` guarantees the minimum at the root, not a
fully ordered array. No heap-tree diagram or generic graph framework is needed.

Explain best-g replacement, stale-entry skipping and allowing a better-g arrival
in the code mapping. Show stale/improvement frames only if they actually occur;
do not fabricate reopening events to satisfy a teaching checklist. A popped goal
has no subsequent child expansion. The browser trace uses the same rules and
ordering as the canonical callable but remains a JavaScript teaching simulation.

## Presentation and state contract

Reuse the exact accepted tokens: bg#0d1117, panel#161b22, panel2#1c2330,
line#2b3547, text#e8edf4, muted#9aa7b8, accent#6ee7ff, accent2#ffb454,
good#7ee2a8, bad#ff7a93; existing system font/1.75 line height, spacing
8/12/16/20/24/32/64px and radii8/14px. Controls remain≥48px with the existing
3px focus outline and offset4px. Add no palette, animation, shadow or remote asset.

Use a labeled list/table that wraps each full state at320px, rather than shrinking
six numeric columns. Distinguish selected, queued, stale and goal states through
text and shape, not color alone. Both locales cover initial, middle, actual
improvement/stale cases, goal-popped, rewind/reset and disabled endpoints. Changing
only the new preset resets only its trace; locale roundtrip preserves all old/new
frames, selection, prediction and source actions. Keep old section anchors.
Loading/auth/reconnect states are inapplicable to this synchronous preset-only
interaction. Avoid arbitrary large browser inputs and automatic search animation.

## Proof, complexity and conditional acceptance

The independent proof establishes an admissible heuristic on the original
unbounded graph. Preserve both transitions, no position/speed clipping, and no
state/time cap or partial-result return in the canonical `Solution.racecar`.
Require best-g updates, stale checks and goal-on-pop exactly as proved.

Do not copy BFS's time bound unchanged: heap work is O(Q log Q) for Q generated
entries. A conservative unit-cost bound is O(D·2^D) time and O(2^D) space for
optimal depth D; mention growing integer/hash costs. A* remains exponential in
the worst case. The new merit is measured reduction in explored states/resources,
not a polynomial guarantee, official judge budget or submission claim. Distinguish
submission structures from extra browser history snapshots.

**P0 / highest-return slice:** the reconstructable lower bound, full-state search,
goal-pop proof, empirical resource improvement and exact source parity.
**P1:** a concise measured BFS/A* work comparison if it explains saved exploration.
**P2:** none. **Deferred:** the unproved smaller-distance DP, geometry clipping,
large browser inputs, automatic animation and heap internals; each adds proof or
interface burden without being necessary for this outcome.

Before a brief: root must inspect the entire survey for caps/errors, record its
source/environment and adjudicate this alternative explicitly. Before acceptance:
a separate implementer freezes a candidate; a fresh reviewer cold-walks both
languages, audits the proof and transitions, independently checks small raw
oracles and selected difficult inputs, and verifies exact displayed/copied/
downloaded source, old controls, keyboard access,320px/200% zoom and contrast.
Root owns isolated Mac measurements of the frozen new candidate and representative
worst observed inputs. The Linux author need not self-block solely because it
cannot run on Mac. Survey evidence is empirical over that implementation/platform;
it does not transfer automatically to revised bytes or assert official limits.
Normal independent acceptance and later verified publication remain separate.

## Dispatcher adjudication after completed survey

Root accepts this design for the next revision. The full-range experiment has
finished: all10,000 official targets found answers without cap/deadline exhaustion
and matched the numerical reference. Root parsed every row, verified the exact
target set and pinned source/results in
`818-resource-search-experiment-20261026/full-range-validation.json`.
Probe SHA256 is `09442d8de215dddc1d3f9c8757c39288b037c9596c2c749606040eefa3b0c8da`;
maximum stored states669,016 occurred at9809. Independent admissibility/goal-pop
proof, not reference-DP agreement, supports correctness. Selected isolated Mac
measurements establish the observed resource improvement; no official limit or
full-range RSS guarantee is inferred.

Adopt the proposed narrow A* bridge and all state/tie-order, proof, complexity,
source-parity and frozen-candidate measurement requirements. Defer the earlier
smaller-distance DP until its completeness argument is available. This explicitly
supersedes that algorithm/design choice in818-RESOURCE-R1; it does not pretend the
requested DP proof was completed. A new818-SEARCH-R1 brief will carry the resource
intent and this approved design, while retaining the blocked investigation and
original95/100 acceptance as historical evidence. No acceptance is restored here.

The author may implement and self-check on Linux; root owns isolated Mac checks
on the frozen new source and delivers that evidence before final acceptance.
This coordination removes a platform-only obstruction without waiving resource
measurement or independent review. No live request pointer, state, lesson source
or publication changes are made by this adjudication. A guarded ordinary reopening
must preserve prior evidence and coexist with the active968/972 lanes.
