# Independent design recommendation: #818 resource improvement

## Decision and evidence

**Recommend a focused distance-DP extension inside the existing lesson, pending
dispatcher adjudication and an implementation brief.** The reader knows basic
Python and needs to connect concrete A/R actions to an efficient executable
solution. Reuse this page, its controls and tokens; no separate product, shared
framework or visual redesign is justified.

Read the exact candidate `c7a325e5a48d2da000609ea93d23f8d255d03bdd` copy, canonical
Python and browser core through read-only Git access, plus accepted review
`818-review-1-ad85dc73.md` (95/100). Its exponential cost explanation is honest;
this is a new improvement, not retrospective rejection. The measured source
SHA `ba7639466dde736ade02f547425edca0bbac2734afa6a7ac03c91a59bbf29fb9`
used 1,194,819,584 process RSS bytes at target9809 on Mac. No official TLE/OOM or
memory limit is established. The [official statement](https://leetcode.com/problems/race-car/)
confirms A/R semantics, negative positions and target1…10000. The official
editorial reader returned no substantive explanation; no editorial proof is claimed.

## Options and proposed scope

**Bounded BFS** preserves the existing layer invariant and requires fewer UI
changes. However, clipping positions to `[0,2T]`, limiting speed, or reversing
only near the target changes the searched graph. Each exclusion needs an
optimal-path preservation proof, including negative excursions, overshoots and
unit-speed reversal. Passing sampled targets is insufficient. Defer this option
unless a short, independently reconstructable proof makes it genuinely simpler.

**Distance/power DP** changes the algorithm but makes the saved work explicit:
reuse the answer for a smaller remaining distance instead of expanding every
position/speed history. Preserve the sandbox and small complete BFS as the
correctness baseline. Add one causal bridge before replacing the canonical source:
`k` accelerations travel `2**k-1`; reversing resets speed to one, allowing a
translated/reflected subproblem with a standard starting speed. Distance alone
is valid only after that normalization, never as a replacement for arbitrary
BFS `(position,speed)` states.

For `n=target.bit_length()`, show exact arrival first. Then animate target6:
`AAA R` reaches7 facing left, leaving distance1, costing `n+1+f(1)`.
Show target4's `AA R R A`: the two reversals both cost a command even with zero
backward accelerations. General undershoot uses `n-1` forward accelerations,
`m` backward accelerations (`0≤m<n-1`) between reversals, residual
`target-2**(n-1)+2**m`, and prefix cost `n+m+1`.

These formulas are a proposed derivation, not an approved drop-in recurrence.
Before implementation, prove the optimal-path normal form: why the retained
overshoot/undershoot alternatives cover an optimum, why omitted first-run lengths
cannot improve it, and why every dependency decreases. If that proof is too
compressed, broaden the enumerated alternatives and state the resulting cost.
A bottom-up distance table offers a transparent finite-state bound; justify actual
loop counts before claiming O(T log T). Keep the helper private behind
`Solution.racecar(target)`; no generic search adapter earns additional leverage.

## Priorities and acceptance

**P0 / highest-return slice:** a proved recurrence, executable bounded-resource
solution, and two bilingual worked transitions with exact source/trace parity.
**P1:** focused comparison of discovered BFS states versus DP subproblems, clearly
separating teaching snapshots from submission storage. **P2:** none.
**Deferred:** arbitrary large browser inputs, decorative motion and parent-edge
polish; they add scope without resolving resource growth.

Reuse all existing palette/type/spacing/focus tokens and unchanged controls.
Specify exact-arrival, overshoot, undershoot and reset/end states in both locales;
preserve keyboard behavior, language-retained state and the existing prediction.
New traces must expose prefix commands, residual distance, reused answer and total,
not merely display the chosen recurrence.

Require a separate implementer and fresh independent frozen-candidate review:
small exhaustive raw-command/BFS comparison; power-of-two neighbors; targets9809,
9879 and10000; and full1…10000 checks with an independently justified oracle.
Measure new peak memory/time in isolated Mac processes against the archived
baseline; do not rerun high-memory BFS on Pi. Verify copied/downloaded/displayed
Python equality, numeric trace correspondence, bilingual cold walkthrough,
320px/200% zoom and console errors. Preserve prior acceptance and separately
verify any later public release. Dispatcher must record adopted/deferred choices
before the brief; this recommendation authorizes no runtime or state change.

## Dispatcher adjudication

Root adopts a distance-DP extension while preserving the existing driving and
complete small BFS interactions. The algorithm-normalization and exhaustive
optimal-path argument are P0; sample agreement cannot replace either. Reuse the
current token contract and manual stepping, with no automatic animation or new
shared framework. Bounded BFS remains deferred until a simpler complete pruning
proof is available. The earlier acceptance stays historical.

One validation recommendation is narrowed: do not require high-memory BFS over
the entire 1…10000 range or call another implementation of the same recurrence an
independent algorithm. Instead combine independent exhaustive small command
enumeration, a separately examined completeness proof, full-range termination
and legal-witness checks, selected difficult-case comparisons and isolated resource
measurements. A truly independent full-range oracle may strengthen this evidence
if practical, but must be identified honestly. Residual risk is a mistaken normal
form; the fresh reviewer must explicitly examine its excluded paths rather than
infer proof from matching outputs. This avoids imposing an artificial resource
ceiling while requiring concrete improvement over the measured baseline.

This design adjudication permits preparing the implementation brief. It does not
change central state, expand the active nine-request transaction or grant a new
candidate acceptance.
