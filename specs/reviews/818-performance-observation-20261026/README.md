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
