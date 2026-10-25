# Rendered state and source fidelity

This supplement makes existing correctness, localization, and source-parity
requirements concrete. It adds no scoring dimension or replacement acceptance
gate. Apply it to new candidates after adoption; do not rewrite historical
reviews or treat existing accepted lessons as newly reviewed.

It reuses the approved lesson design. It introduces no new layout, shared
renderer, or runtime dependency. Read it alongside the [explainer contract](leetcode-explainers.md)
and [trace specification](leetcode-hard-traces.md).

## 1. Read the rendered formula, not just its dictionary key

Check the representation expected by the actual localization consumer. If it
expects `[zh, en]`, each consumed entry must be a two-string pair; a bare string
is not equivalent even when its key exists. Alternative representations remain
valid when their own consumer contract is checked.

For the central formula and its explanation, inspect the rendered text in both
locales, including a locale switch after interaction. Verify complete operands,
indices, operators, and boundary meaning against a hand calculation. Nonempty
text or a screenshot count alone does not establish this.

Example failure: indexing a bare formula string as a locale pair can render only
one character. A numerical test of the underlying recurrence would still pass.
Check copy shape and visible meaning separately; retain the existing requirement
to detect duplicate keys before a parser silently discards a definition.

## 2. Keep the candidate identity attached to its own value

Define the instant represented by each frame: before comparison, after testing
one candidate, or after completing an interval. A readout must use that same
instant as the table, diagram, and explanation.

When showing candidates and a best-so-far value, distinguish:

- the currently inspected candidate and its computed value;
- the candidate attaining the displayed best value;
- the final result, only when the enumeration is complete.

Do not pair the final enumerated candidate's identity with another candidate's
maximum. Store enough information to reconstruct the displayed identity/value
pair, or derive both from the same snapshot. When several candidates tie, label
the selection consistently; do not imply a unique optimum without evidence.

Use a tiny case where the optimum is not the last enumerated candidate. For
example, in #312 with padded values `[1,3,1,5,8,1]`, interval `(0,3)` has candidate
`k=1` worth 30 and `k=2` worth 8. A completed frame cannot call `k=2` the candidate
producing 30. Rewind and replay that frame in both locales and check the pair.

## 3. Give every count a unit and an accounting boundary

Distinguish a position index, positions completed, work in the current step,
cumulative work, and the requested algorithm output. If two readouts have the
same label and cover the same scope, their values must agree. If scopes differ,
state the difference next to the values.

For a scan of `[5,2,6,1]`, strict-smaller output is `[2,1,1,0]`. Completing its
successive suffix scans costs `3,2,1,0` comparisons, with cumulative totals
`3,5,6,6`. Neither the output counts nor the completed-position count is the
cumulative comparison count.

Independently recompute a short full trace. Inspect an initial state, a middle
state, the endpoint, and a rewind/replay; check all simultaneous readouts. Where
applicable, verify `cumulative_after = cumulative_before + current_step_work`.
An initial state may already contain a completed operation, but must say so.

Prediction prompts, options, and feedback must refer to the same input and
quantity. A question about one selected position cannot grade against the sum
of all positions. Change the position/input after answering and verify that
feedback is invalidated or recomputed according to the stated interaction
contract. Locale switching preserves the selection and its correct meaning.

## 4. Transfer the actual canonical source without normalization

Generate the offline mirror from the canonical file. Compare the decoded mirror,
rendered code text, copied text, and downloaded file with that same source;
include the final newline, indentation, and non-ASCII characters. Do not call
`trim()`, normalize whitespace, or omit the last character to make a check pass.
Compare rendered text through a text-preserving DOM API such as `textContent`,
not layout-derived `innerText` where whitespace can be normalized.

Exercise successful copy and the manual fallback. Verify the fallback contains
the full source and can be selected/copied; merely showing its textarea is not
enough. Keep any platform clipboard newline conversion explicit in the evidence
rather than silently claiming byte equality. Downloaded bytes and the embedded
string still have to match the canonical source exactly.

For manual fallback copying, use the operating system hosting the browser's
actual shortcut: Meta+C on macOS, Control+C on Linux/Windows. Locale, mobile
viewport and user-agent emulation do not establish that host. A local runner
can supply its host platform; record it explicitly for a remote browser rather
than inferring it from the test client's platform.

Seed a distinct non-source clipboard sentinel before the fallback scenario.
Check focus and full selection, dispatch the actual copy action, and read back
the canonical source. Do not substitute a test-written source value, DOM-only
selection checks, or weakened equality. If readback is unavailable, record the
verification gap instead of claiming transfer success. Preserve the newline
conversion and exact mirror/download boundaries above.

When a frozen test uses the wrong host shortcut, preserve its failure and
diagnose it before assigning a runtime defect. A separately documented host-key
adapter may retain the original assertions while changing only that shortcut;
bind both tests and results to the same candidate and name the command that
actually passed. A harness correction is not a runtime repair or acceptance.
This clarification derives from the independently reviewed
[native clipboard proposal](proposals/leetcode-native-clipboard-checks-20261025.md)
and applies at the recorded adoption boundary without rewriting past evidence.

For multiple languages, compare each labeled source with its own canonical file.
The JavaScript-specific Python concept comparison remains separately labeled
and cannot replace the original callable contract.

## 5. Bind examples and indices to their stated input

Check each advertised preset result against an independent calculation or oracle,
then compare it with the completed rendered trace. Include labels in selectors,
worked examples and prediction feedback; checking only the final answer panel
misses contradictory promises elsewhere on the page. Reuse the same verified
expected value where appropriate, but do not use the production formatter or
algorithm as its own independent oracle.

For #312, `[0,4,2]` has optimum 12: burst 0, then 2, then 4 to earn 0+8+4.
A selector advertising 8 contradicts a correct terminal DP value of 12.

When a representation adds padding, sentinels, compression or another index
mapping, name the convention beside the question and the relevant readout.
For original `[2,1,2]` and padded `[1,2,1,2,1]`, zero-based original index 2
means padded index 3, whose value is 2. Padded index 2 instead has value 1.
A bare “index 2” cannot distinguish these operations. Verify the intended
operands and distractors in both locales rather than inferring them from a score.

## 6. Make one recursive branch reconstructable

For a lesson whose essential mechanism is recursion or backtracking, work one
small call, child, return and sibling sequence with concrete values. Show which
input remains, which state belongs to the parent, what the child changes and why
returning leaves or restores the correct state. Explain the terminal condition
and whether a completed branch is accepted, rejected or aggregated. A separate
memory-stack widget is not required; the existing trace or nearby prose can do it.

Immutable arguments remain in the caller; mutable shared state may need explicit
undo. Teach the mechanism used by the actual canonical code rather than claiming
that every return performs an in-place undo. A sampled teaching trace must label
omitted branches and define its highlighting from an algorithm-state quantity,
not an unexplained frame ordinal. During the cold walkthrough, the reviewer must
be able to reconstruct this one sequence without filling gaps from source notes.

## 7. Separate feasible decompositions from optimal ones

For an optimization recurrence, identify each legal solution's matching candidate
and bound its value by that candidate's optimum. Then optimize over candidates
and explain why a legal construction attains the selected bound.
Do not assume that an arbitrary solution already contains optimal subsolutions.
Use the direction appropriate to minimization or maximization and the actual
dependencies of the problem; this is not a required wording template.

In #312 with `[3,1,5]`, bursting 3, then 1, then 5 earns 3+5+5=13. Its left
suborder earns 8, not the optimal 30 with the final 5 kept alive. Every order
decomposes into feasible side orders; each side is bounded by its subproblem
optimum. Conversely, joining optimal sides while preserving the fixed last
balloon attains the candidate total. Numerical tests of the recurrence cannot
validate a contradictory proof sentence. Check the reasoning in both languages.

## Evidence and adoption

Authors run applicable checks on their candidate. Independent reviewers first
complete the existing source-blind cold walkthrough, then use these checks to
audit rendered results and close findings. Expected values must come from a
hand calculation or separate oracle, not the same formatter being tested.
Preserve the state/action, locale, expected value, observed value, candidate,
and finding ID. Scope checks to applicable paths; no new test framework or
exhaustive UI Cartesian product is required.

Priority: incorrect formulas, mismatched candidate/value pairs, contradictory
feedback, and conflicting cumulative values are required correctness findings
under the existing rubric. Exact source parity remains its existing gate.
The highest-return checks are one adversarial short trace, an input-change after
prediction, a locale switch, and exact source comparison. Cosmetic refinements,
universal rendering abstractions, and retroactive review campaigns are deferred.

Evidence behind this supplement:
[312 round 1](reviews/312-review-1-fcda139d.md),
[312 closure](reviews/312-review-2-c539971a.md),
[315 round 1](reviews/315-review-1-a478793f.md), and
[315 closure](reviews/315-review-3-d972db1d.md).

Further concrete failures and corrections:
[312 index reopening](reviews/312-reopened-index-convention-20261025.md),
[312 preset/proof findings](reviews/312-review-3-d7af6df0.md),
[282 recursive-state findings](reviews/282-review-4-e7ac0d6f.md), and
[282 closure](reviews/282-review-5-260e1690.md).
These examples clarify the existing mathematical correctness and reconstructable
teaching gates; they do not grant acceptance to another candidate or retrospectively
change a historical review outcome.

## 8. Verify selected labels in their actual font environment

For native selects and other single-line controls, inspect the closed selected
value at the narrow target width. An option existing in the DOM or being readable
in the opened menu does not establish that its selected label is complete. Keep
the count and its scope visible together; shortening a label must not reintroduce
an input-versus-output ambiguity.

Measure actual rendered text, padding and control width, allowing room for the
native arrow, then inspect the screenshot. Any numerical arrow allowance belongs
to that recorded control/browser; the incident's 16px is not a universal constant.
Record browser/platform and the CSS
font stack. Identical CSS stacks do not prove identical available fonts or glyph
widths: the #587 labels fit on Pi but clipped on Mac with the same 260px control.
Do not infer an exact resolved font solely from the stack or attribute every
platform difference to one unverified font.

When integration finds a platform-specific clipping regression, retain the red
case and rerun that unchanged case on the affected platform against the repaired
candidate. When another machine performs this check, make its candidate receipt,
unchanged test, results and inspected screenshots available to the independent
reviewer before closing the finding. The reviewer need not own every platform,
but must assess the linked evidence against the frozen candidate. A different
platform passing cannot close that reproduction. A bounded
font-size sensitivity check can detect fragile margins early, but label it as
synthetic stress rather than native-platform proof. Preserve legible type size
and semantics; prefer shorter clear labels or a suitable local layout over
removing assertions, essential text, or shared font consistency.

Use the existing longest or most constrained labels, both languages and a locale
roundtrip. No exhaustive cross-product of fonts, browsers or controls is proposed.
This adds no runtime dependency, universal renderer, new layout, scoring dimension
or retroactive re-review campaign. Adoption applies to future candidates; concrete
new defects in existing lessons retain the ordinary repair-and-review procedure.

## 9. Check cost bounds at valid parameter boundaries

Define each complexity parameter and its counting convention beside the claim.
For a bound with several independent parameters, check whether one can be zero
while input processing, output materialization, or base-level work remains large.
Use the actual displayed baseline as well as the canonical implementation; a
correct optimized solution does not make an incorrect baseline explanation valid.

For example, let n be formula length, A the number of expanded atom entries, and
d the maximum number of enclosing parentheses, so d=0 without parentheses. An
expansion baseline still constructs and tallies A entries for `H1000`. The bound
`O(n + A*d)` loses that work at d=0. A suitable bound is `O(n + A*(d+1))`, with an
explanation that the extra level includes the top-level expansion and tally. An
alternative convention counting the base parsing level in d must explicitly say
d>=1. Do not silently change the meaning of depth between prose and formula.

Independently check one valid degenerate case and one nondegenerate case, such as
`H1000` (d=0, A=1000) and `(H1000)2` (d=1, A=2000). Read the actual loops or copies
that perform the claimed work and inspect both rendered locale explanations.
Use safe small expansions; allocating the billion-entry teaching example is not
necessary. A measured allocation or timing can support an observation, but is
not by itself proof of an asymptotic bound. Numerical output equality also does
not validate a time or space claim.

This is a targeted mathematical check, not a rule to append `+1` mechanically to
every expression or benchmark every lesson. Preserve the stated valid domain,
the distinction between input size and expanded/output size, and the separate
costs of the baseline, submission and teaching snapshots. A reproduced false
cost claim follows the existing required-finding and repair/re-review gates.
It adds no scoring dimension or retroactive acceptance change. The dispatcher
adopts this section for subsequent candidates at a stopped campaign boundary;
already frozen candidates retain their recorded shared-policy identity.
