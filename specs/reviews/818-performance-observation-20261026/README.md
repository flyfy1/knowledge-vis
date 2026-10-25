# In-progress #818 performance observation

This is a diagnostic handoff, not a finding against a frozen candidate. The
active author was not interrupted and no lesson source, queue or acceptance was
changed. Reconcile the final candidate against the recorded SHA before using it.

The exact copied Python callable returns the expected tiny examples and agrees
with an independent acceleration/reversal recurrence on targets 10000, 9809 and
9879. However, target 10000 alone misses the larger observed allocation: on this
Mac, 9809 reached about 1.195 GB peak RSS versus about 199 MB for 10000. These are
process measurements in bytes, not official LeetCode resource limits or verdicts.
The recurrence ranks instruction counts; it does not prove which input maximizes
BFS memory. No exhaustive runtime or resource verification was performed.

Reproduce on Mac only with `python3 measure.py`. Each actual callable runs in its
own subprocess with a four-second timeout. The script asserts answer agreement
and reports resource measurements; there is no invented official resource gate.
The earlier measurements are retained in `observations.json`; the copied source
is diagnostic evidence, not a replacement implementation. Do not execute the
large-memory cases on the constrained campaign Pi.

Following the diagnosing-bugs skill, this completes baseline measurement only.
No causal repair is claimed. If the frozen candidate retains this approach, the
independent reviewer should assess full-constraint feasibility and whether a
justified pruning bound or a different algorithm is needed, with corresponding
teaching/code parity. A small visualization and an answer at the largest numeric
input cannot alone establish resource feasibility across the input range.

The existing normal review remains authoritative. Preserve the author's right to
finish and improve its candidate; this snapshot may already be superseded. A
future fix requires its own clear invariant/proof, targeted boundary evidence and
fresh independent review, rather than accepting a pruning heuristic from tests.


## Independent assessment — 2026-10-26

A separate reviewer verified copied-source SHA-256
`ba7639466dde736ade02f547425edca0bbac2734afa6a7ac03c91a59bbf29fb9`
and compared its actual BFS with the recurrence for targets 1–64: all agreed.
Recurrence-only checks returned 56 for 9809, 55 for 9879 and 45 for 10000.
No large BFS case was repeated; no Pi access, active-author edit or new candidate
acceptance occurred.

The recurrence's overshoot branch uses `n` accelerations, a reversal and the
mirrored residual distance. Its undershoot branch uses `n-1` accelerations,
a reversal, `m` backward accelerations and another reversal, leaving distance
`target - 2**(n-1) + 2**m` at cost `n+m+1`. These expressions match the instruction
semantics; the small independent comparisons support the implementation but do
not substitute for proving the recurrence's exhaustive optimal decomposition.
Ranking minimum instruction counts does not establish a worst-memory input.

The observed 1,194,819,584-byte process peak is a concrete feasibility concern
that a frozen review must assess, not proof of an official resource-limit
violation. Current lesson rules require actual time/space justification and
constraint-relevant evidence; they specify no hard memory ceiling. The fresh
subprocess measurement includes interpreter and other process allocations;
callable timing excludes startup, and four seconds is a local diagnostic timeout.
All recorded calls returned, so neither TLE nor OOM was observed.

If the final candidate retains this source, the fresh independent reviewer must
reconcile its exact hash, inspect its actual state-growth/cost claims, and assess
representative difficult valid targets as well as the maximum numeric target.
Unbounded BFS explores reachable position/speed states through the answer depth;
a small visual trace is not a bound on the submitted callable. Any required
finding must identify a concrete incorrect cost claim, missing constraint/cost
justification, or demonstrated execution failure under an evidenced environment,
not an invented LeetCode budget. If pruning or a different algorithm is adopted,
review its completeness/optimality proof, boundary cases, executable behavior and
teaching/source parity against that new frozen candidate. Keep high-memory tests
off the constrained Pi. This is a diagnostic handoff, not a preemptive rejection
of the still-active author's work.
