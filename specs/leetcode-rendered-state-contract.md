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

For multiple languages, compare each labeled source with its own canonical file.
The JavaScript-specific Python concept comparison remains separately labeled
and cannot replace the original callable contract.

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
