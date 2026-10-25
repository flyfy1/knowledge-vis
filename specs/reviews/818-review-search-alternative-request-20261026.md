# Implementation brief: #818 exact search with an optimistic bound

Request **818-SEARCH-R1** follows the independent
[design review and dispatcher adjudication](818-review-search-alternative-design-20261026.md).
It supersedes the smaller-distance DP choice in818-RESOURCE-R1, whose normal-form
proof remains unresolved. Do not claim that DP request implemented or its proof
completed. Preserve original95/100 acceptance, blocked investigation commit
`33686548c3c385cdb14b5b7262e4ca58a3b8d2f4` and all prior review/run history.

## Scope and reader outcome

Reuse the existing A/R sandbox, complete small BFS, target2 prediction, anchors,
source controls and bilingual state. Add one manual search bridge before final
Python in step4, then replace canonical `Solution.racecar(target: int) -> int`
with exact A* on the same unbounded `(position,speed)` graph. This changes which
states are examined first, not legal transitions or the problem. No geometry
clipping, heuristic-only greedy search, silent state/time cap or partial answer.

The basic-Python reader should reconstruct why a lower bound can save exploration
while preserving an optimal answer. Do not teach the unproved distance DP as a
second mandatory algorithm. Reuse exact approved tokens and48px controls from
the design; add no navigation section, automatic animation or shared framework.

## Derivation and interaction

1. Start with target5 and legal command word `AARARAA`. Its positions are
   `0,1,3,3,2,2,3,5`: temporarily moving farther away is necessary for this shortest
   word. Independently verify its seven-command optimum with raw enumeration;
   use it to refute distance-only pruning, not to prove all of A*.
2. Define g=commands spent, h=optimistic remaining commands, f=g+h. With current
   speed magnitude v≥1, k commands move at most `v*(2**k-1)` in absolute distance:
   accelerating doubles the bound; resetting to1 cannot exceed it. Explain this
   with a tiny acceleration table before formulas.
3. For distance d>0 while facing the target, let `q=(d+v-1)//v`; h=q.bit_length().
   Explain ceiling division as whole current-speed units and bit_length as the
   least k with `2**k-1≥q`, with actual values. When facing away, at least one R
   is necessary; preceding As only enlarge the gap. After R, speed magnitude1
   still has distance≥d to cover, giving h=1+d.bit_length(). At the target h=0.
   These are lower bounds, not achievable-route claims or exact remaining costs.
4. Default target6; presets3 and5. Retain the full state, g/h/f and both actual
   A/R children of each expansion. Label new, improved or not-better arrivals.
   A sorted frontier view follows `(f,-g,position,speed)`; explain that heapq
   guarantees a minimum root, not a fully sorted backing array. -g breaks f ties
   only; it does not override the bound. Do not fabricate stale/improved events.
5. Keep best g per full state, enqueue strictly better arrivals and skip stale
   popped entries. Return only on a nonstale minimum-f goal pop. Every potentially
   cheaper solution has a frontier prefix with f at most its total cost, so such
   a goal cannot be beaten. A merely discovered/queued goal is not enough.
   Nonnegative h and unit-cost finite branching bound all entries examined before
   an optimal goal to finitely many command prefixes, establishing termination.

Use explicit examples and a complete small search before source. Map each visible
transition to Python. Explain heapq, tuple ordering, dictionary best-g lookup,
integer ceiling and bit_length locally rather than relying on syntax familiarity.
Expose next/back/reset/end with correct initial/final disabled states and retained
history. A goal pop has no subsequent child expansion. The JS simulation must
follow the canonical order, while remaining clearly distinguished from Python.

Both languages cover initial, middle, actual stale/improvement if present,
goal-popped, rewind/reset and disabled states. Changing the new preset resets only
its trace. Locale switching preserves all old/new controls, frames and quiz
answers. Wrap full state rows at320px; avoid tiny six-column tables, clipping and
color-only status. No network/loading/auth/reconnect states apply.

## Complexity, ownership and validation

Heap work is O(Q log Q) for Q generated entries. A conservative unit-cost bound
is O(D*2**D) time and O(2**D) space for optimal command depth D; growing integer
and hash costs require the usual caveat. This is an empirical resource improvement,
not a polynomial algorithm or official judge-limit claim. Distinguish canonical
structures from extra browser trace history. Update metadata consistently.

Own only `leetcode/818/` implementation, BRIEF, SELF-CHECK and local tests/evidence.
Update canonical source, exact embedded mirror and displayed/copied/downloaded
bytes together. Preserve original input/output, links, number/title and routing.
Do not modify queue, registry, publisher, shared assets or historical reports.

Use independent small raw-command enumeration, official cases, power neighbors,
zero/negative intermediate positions, and targeted9809/9879/10000 checks. Verify
nonmutation, heap tie semantics, lower-bound operands, both legal edges, best-g
updates and goal-pop behavior. The exploratory complete1..10000 Mac survey at
source `3b264468` succeeded with no caps/mismatches (max669016 stored states at9809),
but reference-DP agreement is numerical corroboration, not its missing proof.
Do not transfer empirical results automatically to different candidate bytes.

Freeze the new implementation and retain its exact hash. Inspect bilingual actual
frames, old controls, locale roundtrip, keyboard/focus, contrast,320px and200% zoom
(name the actual method), and exact source transfers. Use appropriate bounded
Linux self-checks; do not run the old high-memory BFS at9809 on Pi. Keep cap/timeout
outcomes explicit in test tooling; never put them into the canonical solution.

## Cross-host measurement and fresh review

The dispatcher owns Mac measurements. The Linux author must complete a candidate
and ordinary self-check without marking itself blocked solely because it cannot
run Mac. State the pending external measurement honestly; do not invent success.
Before this revision is dispatched, root will arrange an owned ordinary boundary
after author completion and before its fresh review. At that boundary root copies
the immutable canonical bytes to Mac, checks source identity, runs the full-range
survey plus isolated representative resource measurements, and records evidence
against that exact source. Only after this evidence is durable does the separate
reviewer begin. No active author or reviewer is interrupted.

The fresh reviewer must cold-walk the revised lesson, independently audit the
lower bound and goal-pop proof, inspect candidate-specific external measurements,
and explicitly close818-SEARCH-R1. It must state that818-RESOURCE-R1's DP choice was
superseded rather than proved. Preserve the original acceptance and blocked
investigation. New acceptance, batch eligibility and public verification are
separate outcomes; no publication before all new gates pass.

P0/highest-return slice: reconstructable bound, one complete small search,
optimality argument, resource improvement and exact source fidelity. P1: concise
measured work comparison. P2: none. Deferred: smaller-distance DP until proved,
large browser inputs, geometry pruning, heap internals and decorative motion.

## Independent brief check

A separate reviewer checked the arithmetic, lower bound, heap complexity, complete
survey record, UI/source scope and cross-host ownership; no required correction
was found. Root adopts its operational clarification: the separate reviewed gate
must install and verify its owned STOP while the intended818 author stage is
running, then prove no new reviewer run began at the stopped boundary. Waiting
until after completion to request STOP would race automatic review startup.
This brief does not itself install that gate or authorize skipping its review.
