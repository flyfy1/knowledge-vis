# #818 mathematical investigation — 2026-10-26

**Outcome:** the usual smaller-distance DP normal-form gap remains unresolved in
this independent investigation. An exact signed-distance/command-budget recurrence
and the proposed A* lower bound can be proved without that lemma. Neither proof
establishes a resource improvement. No candidate acceptance, design expansion,
live-checkout change or active-agent interruption is authorized here.

The [official statement](https://leetcode.com/problems/race-car/) supplies the A/R
semantics and positive targets up to10000; negative positions are legal. The
arguments below are independent derivations from those rules. Normal access to
[the official editorial](https://leetcode.com/problems/race-car/editorial/) and a
[solution titled Full proof of the greedy DP solution](https://leetcode.com/problems/race-car/solutions/1997280/full-proof-of-the-greedy-dp-solution/)
returned no substantive proof text. The title is not evidence. Secondary tutorials
were not relied on to certify completeness; no access restriction was bypassed.

## 1. What remains unproved for the usual DP

Let `n=t.bit_length()`, `M(k)=2**k-1`, and let `f(t)` start at position0,
speed+1. The familiar recurrence retains direct arrival, prefix `A**n R`,
and prefixes `A**(n-1) R A**m R` for `0≤m<n-1`.
Their costs and normalized residuals are correct. This does not prove these are
exhaustive: one still needs an exchange/normal-form argument that some optimum
has a retained prefix, despite initial R, shorter first forward runs, first runs
longer than n, backward travel exceeding the first run, and negative excursions.
“Every route overshoots or turns early” does not establish those quantitative
restrictions. Strictly decreasing retained residuals prove termination, not
completeness. No such exchange proof was established here; do not label this
recurrence proved on the strength of samples or an equivalent implementation.

## 2. Exact alternative: signed distance with remaining command budget

Define `F(d,b)` as whether the car starting at `(0,+1)` can reach signed position
`d` using **at most** b commands. The signed d is essential; it encodes a target
behind the current normalized direction rather than treating it as target-facing.

For b≥0:

- `F(0,b)=true`; `F(d,0)=false` for d≠0.
- An all-A route succeeds if `d=M(k)` for some `0≤k≤b`.
- Otherwise take the OR over **every** `0≤k<b` of
  `F(M(k)-d, b-k-1)`, corresponding to prefix `A**k R`.

**Completeness:** every nonempty word either contains no R or has a unique first
R after k initial As. At that R the state is `(M(k),-1)`. Translation and reflection
`x'=M(k)-x`, `v'=-v` turn this into `(0,+1)` with target `M(k)-d`.
They commute with both A and R. Conversely every suffix in the recursive problem
maps back to a legal suffix of the original word. Thus the alternatives are
necessary and sufficient. k=0 retains initial R; negative residuals and arbitrarily
long first runs within the budget are retained. Each dependency reduces b by at
least1, even when its absolute distance increases. Taking the least feasible budget
therefore gives the exact optimum. At-most feasibility is monotone in b.

**Safe pruning:** from unit speed, before command j (zero-based) speed magnitude
is at most `2**j`; R resets it to1. Hence any b-command displacement has magnitude
at most `1+2+...+2**(b-1)=M(b)`. Reject `abs(d)>M(b)` and, for each branch,
`abs(M(k)-d)>M(b-k-1)`. These bounds follow from the budget, not an assumed spatial
normal form. In particular, do not replace signed d with abs(d).

**Finite upper budget:** construct a legal word recursively: if `t=M(n)`, use
n As; otherwise use `A**n R` followed by the same construction for `M(n)-t` in
the reflected frame. The residual has smaller bit length. This construction is
only a witness, never an optimality assumption. Its actual length bounds the
answer; for n-bit positive targets, the coarse bound `n(n+3)/2-1` follows by
summing at most n, n-1, …,1 acceleration lengths and at most n-1 reversals.
For n≤14 this is at most118 commands. Replay the constructed witness independently.

**Resource limit:** finite is not efficient. After pruning, the possible signed
distances at budget b still number O(2**b); an unrestricted memo table can have
exponential size in the chosen upper budget. Capped memoization bounds cache
storage but may repeat substantial work. Do not present this as O(T log T) DP
or as the requested resource fix without actual evidence.

## 3. Exact fallback worth separate measurement: A* without geometry clipping

For a full state `(p,s)`, set `d=abs(target-p)` and `v=abs(s)` (always≥1).
Use h=0 at the target. If speed points toward the target, let
`q=(d+v-1)//v` and `h=q.bit_length()`; otherwise let `h=1+d.bit_length()`.

**Admissibility:** in k commands, absolute displacement is at most
`v*(2**k-1)`, because resetting to1 never increases the available speed bound.
A toward-facing state therefore needs `2**k-1≥ceil(d/v)`, giving exactly the
stated integer lower bound. An away-facing state must use R before approaching;
any preceding As only increase the remaining gap. After that first R speed
magnitude is1 and at least d distance remains, giving the lower bound
`1+d.bit_length()`. This is a lower bound on cost, not a proposed legal route.

Use ordinary best-g bookkeeping, reopen on a smaller g, skip stale heap entries,
and return a goal only when popped with minimum g+h. An admissible h makes the
first such goal optimal. A witnessed upper budget U permits rejecting g+h>U
without removing an optimum. Finite branching and g≤U make this search finite;
there is no negative-position or overshoot cutoff. It remains exponential in the
worst case and changes the teaching algorithm, so it needs measurement and an
explicit design adjudication before replacing the adopted DP plan.

## 4. Evidence and handoff

A bounded local check independently enumerated all510 nonempty A/R words of
length≤8 and compared their at-most reachable positions with F(d,b) for
`d=-256…256`, `b=0…8`: all4617 comparisons passed (4857 memo entries).
This catches signed-distance, zero-prefix and budget errors; the proof above,
not this finite test, establishes completeness. No large-target BFS or production
execution occurred. The A* claim above is a mathematical lower-bound argument;
its implementation and resource profile were not tested here.

The implementer independently reached the budget formulation; this review is
corroboration, not authorship or acceptance of its live candidate. Preserve the
original accepted BFS history. Freeze any new candidate before separate cold
review, proof audit and exact source/trace validation. A Linux author's inability
to run the requested Mac measurements is a coordination issue: root will run
isolated Mac measurements after an exact candidate exists. It is neither an
algorithmic impossibility nor permission to claim unmeasured improvement.


## Independent follow-up on root's A* experiment

Inspected `818-resource-search-experiment-20261026/probe.py` (SHA-256 `09442d8de215dddc1d3f9c8757c39288b037c9596c2c749606040eefa3b0c8da`)
and the recorded larger-cap results without rerunning large cases. Its heuristic
matches section3 exactly. It uses best-g replacement and stale-entry rejection;
its `-g` secondary heap key changes tie order, not the primary lower-bound order.
It tests the goal on a valid pop, so a returned answer has the admissible-A*
optimality guarantee. The experimental state/time caps return `capped` with no
answer; they do not masquerade as an impossible target or minimum. A future
canonical callable must not silently return a partial result on such a cap.

The probe does not use the optional witnessed upper-budget pruning described
above. Nevertheless finite branching, unit costs and h≥0 imply finitely many
states with f≤the optimal depth D, so ordinary uncapped A* eventually reaches a
goal. This proves mathematical termination, not a useful polynomial resource bound.

Root's recorded Mac experiments report target9809 found56 with669016 recorded
states and146178048 peak RSS bytes, and9879 found55 with581444 states and135020544
bytes. These are promising empirical reductions from archived BFS observations;
I inspected the records rather than reproducing the measurements. Earlier250000
state caps were insufficient for these inputs. Full-range performance, a frozen
implementation, and novice-facing A* teaching remain unverified. This is enough
to justify discussing a fallback experiment, not to claim the adopted distance-DP
proof is complete or quietly replace its design.

Root reports the current #818 fix ended blocked at
`33686548c3c385cdb14b5b7262e4ca58a3b8d2f4`, preserving runtime and recording the
investigation; no fresh review accepted a resource revision. This report does not
change that state. Linux/Mac measurement coordination should be resolved by root's
later isolated Mac run, independently of the unresolved smaller-DP normal form.
